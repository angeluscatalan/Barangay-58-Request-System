const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const pool = require('../config/db');
const { exec } = require('child_process');
const bcrypt = require('bcrypt');

exports.exportDatabase = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(400).json({ error: 'Password required for export', requiresPassword: true });
  }

  const { password: plainPassword } = req.body;
  const adminId = req.user.id;
  let adminUsername;

  try {
    const [rows] = await pool.execute('SELECT username, password FROM admin WHERE id = ?', [adminId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    adminUsername = rows[0].username;
    const adminPasswordHash = rows[0].password;
    const isMatch = await bcrypt.compare(plainPassword, adminPasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch admin data: ' + err.message });
  }

  const appDataLocal = process.env.LOCALAPPDATA || path.join(require('os').homedir(), 'AppData', 'Local');
  const backupsDir = path.join(appDataLocal, 'Backups');
  const barangayBackupsDir = path.join(backupsDir, 'barangay_backups');
  const tempDir = path.join(barangayBackupsDir, 'temp');
  const timestamp = Date.now();
  const formattedDate = new Date(timestamp).toISOString().slice(0, 10);
  const baseZipFileName = `db-backup-${adminUsername}-${formattedDate}`;
  const dumpFileName = `db-backup-${timestamp}.sql`;
  let zipFileName = `${baseZipFileName}.zip`;
  const dumpFilePath = path.join(tempDir, dumpFileName);
  let finalZipFilePath = path.join(barangayBackupsDir, zipFileName);

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
  if (!fs.existsSync(barangayBackupsDir)) {
    fs.mkdirSync(barangayBackupsDir, { recursive: true });
  }
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  let counter = 1;
  while (fs.existsSync(finalZipFilePath)) {
    counter++;
    zipFileName = `${baseZipFileName}_${counter}.zip`;
    finalZipFilePath = path.join(barangayBackupsDir, zipFileName);
  }

    const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };

  const dumpCmd = `mysqldump -h ${dbConfig.host} -u ${dbConfig.user}${dbConfig.password ? ` -p"${dbConfig.password}"` : ''} --set-gtid-purged=OFF ${dbConfig.database} > "${dumpFilePath}"`;

  exec(dumpCmd, async (dumpErr) => {
    if (dumpErr) {
      return res.status(500).json({ error: 'Database export failed: ' + dumpErr.message });
    }

    try {
      if (!fs.existsSync(dumpFilePath)) {
        return res.status(500).json({ error: 'Database dump file not created' });
      }

      const stats = fs.statSync(dumpFilePath);
      if (stats.size === 0) {
        return res.status(500).json({ error: 'Database dump file is empty' });
      }

      const tempZipFilePath = path.join(tempDir, zipFileName);
      const output = fs.createWriteStream(tempZipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', async function() {
        try {
          fs.renameSync(tempZipFilePath, finalZipFilePath);
          await sendFileToUser(finalZipFilePath);
        } catch (moveErr) {
          return res.status(500).json({ error: 'Failed to move backup archive: ' + moveErr.message });
        }
      });

      archive.on('error', function(archiveErr) {
        return res.status(500).json({ error: 'Failed to create backup archive: ' + archiveErr.message });
      });

      archive.pipe(output);
      archive.file(dumpFilePath, { name: dumpFileName });
      archive.finalize();

     async function sendFileToUser(finalZipPath) {
        res.download(finalZipPath, path.basename(zipFileName), (err) => {
          // Clean up the temporary .sql file
          try {
            console.log('Cleaning up dump file:', dumpFilePath);
            fs.unlinkSync(dumpFilePath);
          } catch (cleanupErr) {
            console.error('Cleanup error during .sql deletion:', cleanupErr);
          }

          // Clean up the temporary ZIP file
          const tempZipFilePath = path.join(tempDir, zipFileName);
          try {
            console.log('Cleaning up temporary ZIP file:', tempZipFilePath);
            fs.unlinkSync(tempZipFilePath);
          } catch (cleanupErr) {
            console.error('Cleanup error during temporary ZIP deletion:', cleanupErr);
          }

          if (err) {
            console.error('Download failed:', err);
            return res.status(500).json({ error: 'Download failed: ' + err.message });
          }
          console.log('File sent successfully.');
        });
      }

    } catch (err) {
      try {
        if (fs.existsSync(dumpFilePath)) fs.unlinkSync(dumpFilePath);
        const tempZipFilePath = path.join(tempDir, zipFileName);
        if (fs.existsSync(tempZipFilePath)) fs.unlinkSync(tempZipFilePath);
        if (fs.existsSync(finalZipFilePath)) fs.unlinkSync(finalZipFilePath);
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr);
      }
      return res.status(500).json({ error: 'Failed to process backup: ' + err.message });
    }
  });
};
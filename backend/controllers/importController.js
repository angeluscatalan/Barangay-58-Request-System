const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const AdmZip = require('adm-zip'); // Import the adm-zip library

exports.importDatabase = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { password: plainPassword } = req.body;
  const adminId = req.user.id;

  try {
    // Verify admin password
    const [rows] = await pool.execute('SELECT password FROM admin WHERE id = ?', [adminId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const adminPasswordHash = rows[0].password;
    const isMatch = await bcrypt.compare(plainPassword, adminPasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Create temp directory if it doesn't exist
    const appDataLocal = process.env.LOCALAPPDATA || path.join(require('os').homedir(), 'AppData', 'Local');
    const tempDir = path.join(appDataLocal, 'Backups', 'barangay_backups', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const uploadedFilePath = req.file.path;
    let sqlFilePath = '';

    // Check if the uploaded file is a ZIP file
    if (req.file.mimetype === 'application/zip' || req.file.originalname.endsWith('.zip')) {
      try {
        const zip = new AdmZip(uploadedFilePath);
        const zipEntries = zip.getEntries();
        let sqlEntry = null;

        // Find the first .sql file in the zip
        for (const entry of zipEntries) {
          if (!entry.isDirectory && entry.entryName.endsWith('.sql')) {
            sqlEntry = entry;
            break;
          }
        }

        if (!sqlEntry) {
          fs.unlinkSync(uploadedFilePath);
          return res.status(400).json({ error: 'No .sql file found inside the ZIP archive' });
        }

        // Extract the .sql file to the temp directory
        const extractedFileName = `extracted-${Date.now()}.sql`;
        sqlFilePath = path.join(tempDir, extractedFileName);
        zip.extractEntryTo(sqlEntry.entryName, tempDir, false, true, extractedFileName);

      } catch (zipErr) {
        fs.unlinkSync(uploadedFilePath);
        return res.status(400).json({ error: 'Error processing ZIP file: ' + zipErr.message });
      } finally {
        // Clean up the uploaded ZIP file
        fs.unlinkSync(uploadedFilePath);
      }
    } else if (req.file.originalname.endsWith('.sql') || req.file.mimetype === 'application/sql') {
      // If it's directly an SQL file
      sqlFilePath = path.join(tempDir, `import-${Date.now()}.sql`);
      fs.renameSync(uploadedFilePath, sqlFilePath);
    } else {
      fs.unlinkSync(uploadedFilePath);
      return res.status(400).json({ error: 'Invalid file format. Only .sql or .zip files are allowed' });
    }

    const dbConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    };

    // First, drop all tables to ensure clean import
    // ✅ NEW - works on RDS by dropping all tables
        const dropCmd = `
        mysql -h ${dbConfig.host} -u ${dbConfig.user} ${dbConfig.password ? `-p"${dbConfig.password}"` : ''} ${dbConfig.database} -e "
        SET FOREIGN_KEY_CHECKS = 0;
        SET @tables = NULL;
        SELECT GROUP_CONCAT('\`', table_name, '\`') INTO @tables 
        FROM information_schema.tables 
        WHERE table_schema = '${dbConfig.database}';
        SET @tables = IFNULL(@tables, 'dummy');
        SET @sql = CONCAT('DROP TABLE IF EXISTS ', @tables);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;   
        DEALLOCATE PREPARE stmt;
        SET FOREIGN_KEY_CHECKS = 1;"
        `;


    exec(dropCmd, (dropErr) => {
      if (dropErr) {
        if (fs.existsSync(sqlFilePath)) {
          fs.unlinkSync(sqlFilePath);
        }
        return res.status(500).json({ error: 'Failed to reset database: ' + dropErr.message });
      }

      // Then import the SQL file
      const importCmd = `mysql -h ${dbConfig.host} -u ${dbConfig.user}${dbConfig.password ? ` -p"${dbConfig.password}"` : ''} ${dbConfig.database} < "${sqlFilePath}"`;

      exec(importCmd, (importErr) => {
        // Clean up the temp SQL file regardless of success/failure
        try {
          if (fs.existsSync(sqlFilePath)) {
            fs.unlinkSync(sqlFilePath);
          }
        } catch (cleanupErr) {
          console.error('Failed to clean up temp file:', cleanupErr);
        }

        if (importErr) {
          return res.status(500).json({ error: 'Database import failed: ' + importErr.message });
        }

        res.json({ message: 'Database successfully imported' });
      });
    });
  } catch (err) {
    // Clean up the uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        console.error('Failed to clean up uploaded file:', cleanupErr);
      }
    }
    return res.status(500).json({ error: 'Import process failed: ' + err.message });
  }
};
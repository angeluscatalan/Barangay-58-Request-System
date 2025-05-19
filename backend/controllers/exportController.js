const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

exports.exportDatabase = (req, res) => {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test'
  }

  // Log the DB config (remove this in production after debugging)
  console.log('DB Config:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database
  });

  const dumpFileName = `temp-dump-${Date.now()}.sql`
  const tempDir = path.join(__dirname, '..', 'temp')
  const dumpFilePath = path.join(tempDir, dumpFileName)
  
  try {
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
      console.log('Created temp directory:', tempDir)
    }

    // Create the mysqldump command
    const command = `mysqldump -h ${dbConfig.host} -u ${dbConfig.user} -p"${dbConfig.password}" ${dbConfig.database} > ${dumpFilePath}`

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error creating dump:', error)
        console.error('stderr:', stderr)
        return res.status(500).json({ 
          message: 'Failed to create database dump',
          error: error.message,
          stderr: stderr
        })
      }

      // Check if file was created
      if (!fs.existsSync(dumpFilePath)) {
        return res.status(500).json({ 
          message: 'Dump file not created',
          command: command
        })
      }

      // Send the file
      res.download(dumpFilePath, `database-backup-${new Date().toISOString().split('T')[0]}.sql`, (err) => {
        // Delete the temporary file after sending
        fs.unlink(dumpFilePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting temp file:', unlinkErr)
        })
        
        if (err) {
          console.error('Error sending file:', err)
        }
      })
    })
  } catch (err) {
    console.error('Export error:', err)
    return res.status(500).json({ 
      message: 'Export failed',
      error: err.message 
    })
  }
}


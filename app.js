const express = require('express')
const app = express()
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: 'uploads/' });

// Define a global object to store file metadata
const fileMetadata = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(3000)

// app.js
const db = require('./db_conn');

db.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {
  if (err) throw err;
  console.log('The solution is: ', rows[0].solution);
});

// Set up Multer
app.post('/upload', upload.single('file'), (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    console.error('No file was uploaded');
    return res.sendStatus(400);
  }

  // Generate a unique ID for this file
  const id = shortid.generate();

  // Store the original file name and extension
  const originalName = req.file.originalname;
  const extension = path.extname(originalName);

  // Log the file path before renaming
  console.log(`Original file path: ${req.file.path}`);

  // Rename the file to include the unique ID and the extension
  fs.rename(req.file.path, path.join(req.file.destination, id + extension), err => {
    if (err) {
      console.error('Error renaming file', err);
      return res.sendStatus(500);
    }

    // Log the new file path after renaming
    console.log(`New file path: ${path.join(req.file.destination, id + extension)}`);

    // Log the upload information
    console.log(`File uploaded: ${originalName}`);
    console.log(`Stored as: ${id + extension}`);
    console.log(`File extension: ${extension}`);

    // Store the file metadata
    fileMetadata[id] = extension;

    // Send the unique ID and the extension back to the client
    res.send({ id, extension });
  });
});

app.get('/download/:id', (req, res) => {
  // Get the unique ID from the route parameters
  const id = req.params.id;

  // Get the extension from the file metadata
  const extension = fileMetadata[id];

  // If the extension does not exist, send a 404 response
  if (!extension) {
    return res.sendStatus(404);
  }

  // Create a path to the file
  const filePath = path.join('uploads', id + extension);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File does not exist', err);
      return res.sendStatus(404);
    }

    // Log the download information
    console.log(`File downloaded: ${id + extension}`);

    // Send the file with the original extension
    res.download(filePath, id + extension);
  });
});

// Run the check every hour
setInterval(() => {
  // Get the current time
  const now = Date.now();

  fs.readdir('uploads', (err, files) => {
    if (err) {
      console.error('Could not list the directory.', err);
      process.exit(1);
    }

    files.forEach((file, index) => {
      fs.stat(path.join('uploads', file), (err, stat) => {
        if (err) {
          console.error('Error stating file.', err);
          return;
        }

        // If the file is more than 7 days old, delete it
        if (now - stat.birthtimeMs > 7*24*60*60*1000) {
          fs.unlink(path.join('uploads', file), (err) => {
            if (err) {
              console.error('Error deleting file.', err);
              return;
            }
          });
        }
      });
    });
  });
}, 60*60*1000);
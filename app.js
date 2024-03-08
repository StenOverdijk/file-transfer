const express = require('express')
const app = express()
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: 'uploads/' });


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(3000)



// Set up Multer
app.post('/upload', upload.single('file'), (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    return res.sendStatus(400);
  }

  // Generate a unique ID for this file
  const id = shortid.generate();

  // Rename the file to include the unique ID
  fs.rename(req.file.path, path.join(req.file.destination, id), err => {
    if (err) return res.sendStatus(500);

    // Send the unique ID back to the client
    res.send({ id });
  });
});

app.get('/download/:id', (req, res) => {
  // Get the unique ID from the route parameters
  const id = req.params.id;

  // Create a path to the file
  const filePath = path.join('uploads', id);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File does not exist');
      return res.sendStatus(404);
    }

    // Send the file
    res.download(filePath);
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
const express = require('express');
const app = express();
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connect = require('./server');

// Use the connection
// connect();

// const fileSchema = new mongoose.Schema({
//   id: String,
//   extension: String
// });

// const File = mongoose.model('File', fileSchema);

// app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// })

// app.listen(3000)

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    console.error('No file was uploaded');
    return res.sendStatus(400);
  }

  const id = shortid.generate();
  const originalName = req.file.originalname;
  const extension = path.extname(originalName);

  fs.rename(req.file.path, path.join(req.file.destination, id + extension), async err => {
    if (err) {
      console.error('Error renaming file', err);
      return res.sendStatus(500);
    }

    const file = new File({ id, extension });

    try {
      await file.save();
      res.send({ id, extension });
    } catch (error) {
      console.error('Error saving file metadata', error);
      res.sendStatus(500);
    }
  });
});

app.get('/download/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const file = await File.findOne({ id });

    if (!file) {
      return res.sendStatus(404);
    }

    const extension = file.extension;
    const filePath = path.join('uploads', id + extension);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('File does not exist', err);
        return res.sendStatus(404);
      }

      res.download(filePath, id + extension);
    });
  } catch (error) {
    console.error('Error retrieving file metadata', error);
    res.sendStatus(500);
  }
});

setInterval(() => {
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
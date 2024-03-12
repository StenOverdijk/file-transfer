const express = require('express');
const mongoose = require('mongoose');
const app = express();

const uri = 'mongodb+srv://admin:admin@file-transfer.4wtmcsz.mongodb.net/?retryWrites=true&w=majority'

async function connect() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
    }
}

module.exports = connect;
const fileSchema = new mongoose.Schema({
    id: String,
    extension: String
  });
  
  const File = mongoose.model('File', fileSchema);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});



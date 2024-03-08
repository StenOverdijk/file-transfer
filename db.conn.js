// db_conn.js
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'dbuser',
  password: 's3kreee7',
  database: 'my_db'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database', err);
    process.exit(1);
  }
});

module.exports = connection;
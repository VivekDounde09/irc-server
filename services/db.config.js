require('dotenv').config();

// const mysql = require('mysql');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  port: process.env.DATABASE_PORT,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

connection.connect(err => {
  if (err) {
    console.error(err);
  } else {
    console.log("🔌️ Database Connection has been established successfully!");
  };
});

module.exports = connection;
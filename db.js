const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.DATABASE_URL || "localhost",
  user: "root",
  password: "password",
  database: "koalagram"
});

connection.connect(err => {
  if (err) throw err;
  console.log("MySQL connected...");
});

module.exports = connection;

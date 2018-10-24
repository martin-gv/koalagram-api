const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "koalagram"
});

connection.connect(err => {
  if (err) throw err;
  console.log("MySQL connected...");
});

module.exports = connection;

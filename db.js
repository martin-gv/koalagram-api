const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "us-cdb-cdbr-iron-east-01.cleardb.net",
  user: "b57e642d15cd4c",
  password: "76ca1458 ",
  database: "heroku_d169760d6be1801"
});

// const connection = mysql.createConnection({
//   host: process.env.DATABASE_URL || "localhost",
//   user: "root",
//   password: "password",
//   database: "koalagram"
// });

connection.connect(err => {
  if (err) throw err;
  console.log("MySQL connected...");
});

module.exports = connection;

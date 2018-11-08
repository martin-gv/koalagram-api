const mysql = require("mysql");

const connection = mysql.createPool({
  connectionLimit: 10,
  host: "us-cdbr-iron-east-01.cleardb.net",
  user: "b57e642d15cd4c",
  password: "76ca1458",
  database: "heroku_d169760d6be1801"
});

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "password",
//   database: "koalagram"
// });

// const connection = mysql.createPool({
//   connectionLimit: 10,
//   host: "localhost",
//   user: "root",
//   password: "password",
//   database: "koalagram"
// });

// connection.connect(err => {
//   if (err) {
//     console.log(err);
//     throw err;
//   }
//   console.log("MySQL connected...");
// });

module.exports = connection;

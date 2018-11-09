const mysql = require("mysql");

// let connectionOptions = {};

// if (process.env.HOST && process.env.HOST === "localhost") {
//   console.log("localhost db");
//   connectionOptions = {
//     connectionLimit: 100,
//     host: "localhost",
//     user: "root",
//     password: "password",
//     database: "koalagram"
//   };
// } else {
//   console.log("cloud db");
//   connectionOptions = {
//     connectionLimit: 100,
//     host: "us-cdbr-iron-east-01.cleardb.net",
//     user: "b57e642d15cd4c",
//     password: "76ca1458",
//     database: "heroku_d169760d6be1801"
//   };
// }

// const connection = mysql.createPool({
//   connectionLimit: 100,
//   host: "us-cdbr-iron-east-01.cleardb.net",
//   user: "b57e642d15cd4c",
//   password: "76ca1458",
//   database: "heroku_d169760d6be1801"
// });

var connection = mysql.createConnection({
  host: "us-cdbr-iron-east-01.cleardb.net",
  user: "b57e642d15cd4c",
  password: "76ca1458",
  database: "heroku_d169760d6be1801"
});

connection.connect();

module.exports = connection;

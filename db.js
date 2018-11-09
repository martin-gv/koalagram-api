const mysql = require("mysql");

let connectionOptions = {};

if (process.env.HOST === "localhost") {
  connectionOptions = {
    connectionLimit: 100,
    host: "localhost",
    user: "root",
    password: "password",
    database: "koalagram"
  };
} else {
  connectionOptions = {
    connectionLimit: 100,
    host: "us-cdbr-iron-east-01.cleardb.net",
    user: "b57e642d15cd4c",
    password: "76ca1458",
    database: "heroku_d169760d6be1801"
  };
}

const connection = mysql.createPool(connectionOptions);

module.exports = connection;

const mysql = require("mysql");

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};

var connection = mysql.createConnection.bind(null, config);

module.exports = connection;

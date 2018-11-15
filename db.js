const mysql = require("mysql");

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};

var connection = mysql.createConnection.bind(null, config);

const dbConnection = () => {
  const newConnection = mysql.createConnection(config);
  newConnection.connect();
  return newConnection;
};

module.exports = connection;
module.exports.dbConnection = dbConnection;

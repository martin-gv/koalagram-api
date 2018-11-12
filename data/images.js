const db = require("../db");

exports.getImages = async type => {
  return new Promise((resolve, reject) => {
    sql = "SELECT * FROM images WHERE type = ?";
    const connection = db();
    connection.connect();
    connection.query(sql, [[type]], (err, result) => {
      connection.end();
      if (err) reject(err);
      resolve(result);
    });
  });
};

const db = require("../db");

exports.getImages = async type => {
  return new Promise((resolve, reject) => {
    sql = "SELECT * FROM images WHERE type = ?";
    db.query(sql, [[type]], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

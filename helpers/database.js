const db = require("../db");

exports.query = async (sql, insertData) => {
  return new Promise((resolve, reject) => {
    db.query(sql, insertData, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

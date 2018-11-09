const db = require("../db");

exports.query = async (sql, insertData, db) => {
  return new Promise((resolve, reject) => {
    if (insertData) {
      db.query(sql, insertData, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    } else {
      db.query(sql, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    }
  });
};

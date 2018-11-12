exports.query = async (connection, sql, insertData) => {
  return new Promise((resolve, reject) => {
    if (insertData) {
      connection.query(sql, insertData, (err, result) => {
        if (err) {
          connection.end();
          reject(err);
        }
        resolve(result);
      });
    } else {
      connection.query(sql, (err, result) => {
        if (err) {
          connection.end();
          reject(err);
        }
        resolve(result);
      });
    }
  });
};

const db = require("../db");

exports.createLike = async (req, res, next) => {
  try {
    const { photo, user } = req.body;
    const sql = "INSERT INTO likes (photo_id, user_id) VALUES ?";
    const connection = db();
    connection.connect();
    connection.query(sql, [[[photo.id, user.id]]], (err, result) => {
      connection.end();
      if (err) return next(err);
      res.status(200).json(result);
    });
  } catch (err) {
    connection.end();
    next(err);
  }
};

exports.deleteLike = async (req, res) => {
  try {
    const { photoID, userID } = req.params;
    const sql = "DELETE FROM likes WHERE photo_id = ? && user_id = ?";
    const connection = db();
    connection.connect();
    connection.query(sql, [[photoID], [userID]], (err, result) => {
      connection.end();
      if (err) return next(err);
      res.status(200).json(result);
    });
  } catch (err) {
    connection.end();
    next(err);
  }
};

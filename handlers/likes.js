const db = require("../db");

exports.createLike = async (req, res) => {
  try {
    const { photo, user } = req.body;
    const sql = "INSERT INTO likes (photo_id, user_id) VALUES ?";
    db.query(sql, [[[photo.id, user.id]]], (err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    });
  } catch (err) {
    throw err;
  }
};

exports.deleteLike = async (req, res) => {
  try {
    const { photoID, userID } = req.params;
    const sql = "DELETE FROM likes WHERE photo_id = ? && user_id = ?";
    db.query(sql, [[photoID], [userID]], (err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    });
  } catch (err) {
    throw err;
  }
};

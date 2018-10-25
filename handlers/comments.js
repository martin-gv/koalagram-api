const db = require("../db");

exports.createComment = async (req, res) => {
  try {
    const { photoID, userID, comment } = req.body;
    const sql =
      "INSERT INTO comments (photo_id, user_id, comment_text) VALUES ?";
    db.query(sql, [[[photoID, userID, comment]]], (err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    });
  } catch (err) {
    throw err;
  }
};

exports.deleteComment = async (req, res) => {
  try {
    res.status(200).json({ route: "delete" });
  } catch (err) {
    throw err;
  }
};

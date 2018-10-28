const db = require("../db");

exports.createComment = async (req, res, next) => {
  try {
    const { photoID, userID, comment } = req.body;
    const sql =
      "INSERT INTO comments (photo_id, user_id, comment_text) VALUES ?";
    db.query(
      sql,
      [[[photoID, userID, comment.slice(0, 255)]]],
      (err, result) => {
        if (err) {
          next(err);
        } else {
          res.status(200).json(result);
        }
      }
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    res.status(200).json({ route: "delete" });
  } catch (err) {
    next(err);
  }
};

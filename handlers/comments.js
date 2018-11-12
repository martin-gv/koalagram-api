const db = require("../db");

exports.createComment = async (req, res, next) => {
  try {
    const { photoID, userID, comment } = req.body;
    const sql =
      "INSERT INTO comments (photo_id, user_id, comment_text) VALUES ?";
    const connection = db();
    connection.connect();
    connection.query(
      sql,
      [[[photoID, userID, comment.slice(0, 255)]]],
      (err, result) => {
        connection.end();
        if (err) return next(err);
        res.status(200).json(result);
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

exports.getPhotoComments = async (photoID, connection) => {
  return new Promise((resolve, reject) => {
    sql = `
    SELECT
      comments.id,
      comments.photo_id,
      comments.user_id,
      comments.created_at,
      comments.comment_text,
      users.username
   FROM comments
   INNER JOIN users
   ON users.id = comments.user_id
   WHERE comments.photo_id = ?;
    `;
    connection.query(sql, [[photoID]], (err, result) => {
      if (err) {
        connection.end();
        reject(err);
      }
      resolve({ id: photoID, comments: result });
    });
  });
};

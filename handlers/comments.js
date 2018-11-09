// const db = require("../db");
const mysql = require("mysql");

const config = {
  host: "us-cdbr-iron-east-01.cleardb.net",
  user: "b57e642d15cd4c",
  password: "76ca1458",
  database: "heroku_d169760d6be1801"
};

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

exports.getPhotoComments = async (photoID, db) => {
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
    db.query(sql, [[photoID]], (err, result) => {
      if (err) reject(err);
      resolve({ id: photoID, comments: result });
    });
  });
};

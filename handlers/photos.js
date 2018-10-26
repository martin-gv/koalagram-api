const db = require("../db");

exports.getPhotoComments = async function(photoID) {
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

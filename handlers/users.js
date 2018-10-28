const db = require("../db");
const { getPhotoComments } = require("./photos");

exports.getUserPhotos = async (req, res, next) => {
  try {
    const { username } = req.params;
    sql = `
      SELECT
         photos.id,
         photos.user_id,
         users.username,
         COUNT(likes.id) AS likes,
         photos.image_url,
         users.profile_image_url
      FROM photos
      LEFT JOIN users
      ON users.id = photos.user_id
      LEFT JOIN likes
      ON photos.id = likes.photo_id
      WHERE users.username = ?
      GROUP BY photos.id;`;
    db.query(sql, [[username]], async (err, result) => {
      if (err) {
        next(err);
      } else {
        const allComments = await Promise.all(
          result.map(x => getPhotoComments(x.id))
        );
        const withComments = result.map(x => {
          const match = allComments.find(y => y.id === x.id);
          x.comments = match.comments;
          return x;
        });
        res.status(200).json({ photos: withComments });
      }
    });
  } catch (err) {
    next(err);
  }
};

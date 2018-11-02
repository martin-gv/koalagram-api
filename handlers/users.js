const { query } = require("../helpers/database");
const { getPhotoComments } = require("./comments");

// Gets photos posted by a user, plus the user's info
exports.getUserPhotos = async (req, res, next) => {
  try {
    const { username } = req.params;
    const sql = `
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
    const photos = await query(sql, [[username]]);
    const allComments = await Promise.all(
      photos.map(x => getPhotoComments(x.id))
    );
    const withComments = photos.map(x => {
      const match = allComments.find(y => y.id === x.id);
      x.comments = match.comments;
      return x;
    });
    const sqlUser =
      "SELECT id, username, profile_image_url FROM users WHERE username = ?";
    const user = await query(sqlUser, [[username]]);
    res.status(200).json({ user, photos: withComments });
  } catch (err) {
    next(err);
  }
};

// Gets photos liked by a user; used when looking at your own profile
exports.getPhotosLikedByUser = async (req, res, next) => {
  try {
    const { username } = req.params;
    const sql = `
      SELECT
          likes.photo_id AS id,
          photos.user_id,
          posted_by.username AS username,
          COUNT(total_likes.id) AS likes,
          photos.image_url,
          posted_by.profile_image_url
      FROM likes
      INNER JOIN users
      ON likes.user_id = users.id
      AND users.username = ?
      INNER JOIN photos
      ON likes.photo_id = photos.id
      INNER JOIN users AS posted_by
      ON photos.user_id = posted_by.id
      LEFT JOIN likes AS total_likes
      ON likes.photo_id = total_likes.photo_id 
      GROUP BY likes.photo_id;
    `;
    const photos = await query(sql, [[username]]);
    const allComments = await Promise.all(
      photos.map(x => getPhotoComments(x.id))
    );
    const withComments = photos.map(x => {
      const match = allComments.find(y => y.id === x.id);
      x.comments = match.comments;
      return x;
    });
    res.status(200).json({ photos: withComments });
  } catch (err) {
    next(err);
  }
};

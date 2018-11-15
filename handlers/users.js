const { query } = require("../helpers/database");
const { getPhotoComments } = require("./comments");
const db = require("../db");
const { dbConnection } = require("../db");

exports.updateUser = async (req, res, next) => {
  try {
    const { imageUrl, bio } = req.body;
    const { id } = res.locals.tokenPayload;
    let sql = imageUrl
      ? "UPDATE users SET profile_image_url = ?, bio = ? WHERE id = ?"
      : "UPDATE users SET bio = ? WHERE id = ?";
    let insertData = imageUrl ? [[imageUrl], [bio], [id]] : [[bio], [id]];

    const connection = dbConnection();
    await query(connection, sql, insertData);
    connection.end();
    res.status(200).json({ image: imageUrl ? imageUrl : "" });
  } catch (err) {
    next(err);
  }
};

// Gets photos posted by a user, plus the user's info
exports.getUserPhotos = async (req, res, next) => {
  try {
    const { username } = req.params;
    const sql = `
      SELECT
         photos.id,
         photos.user_id,
         photos.created_at,
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
      GROUP BY photos.id
      ORDER BY photos.id DESC;
      `;

    const connection = db();
    connection.connect();
    const photos = await query(connection, sql, [[username]]);
    const allComments = await Promise.all(
      photos.map(x => getPhotoComments(x.id, connection))
    );
    const withComments = photos.map(x => {
      const match = allComments.find(y => y.id === x.id);
      x.comments = match.comments;
      return x;
    });
    const sqlUser =
      "SELECT id, username, profile_image_url, bio   FROM users WHERE username = ?";
    const user = await query(connection, sqlUser, [[username]]);
    connection.end();
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
          photos.created_at,
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
      GROUP BY likes.photo_id
      ORDER BY photos.id DESC;
    `;
    const connection = db();
    connection.connect();
    const photos = await query(connection, sql, [[username]]);
    const allComments = await Promise.all(
      photos.map(x => getPhotoComments(x.id, connection))
    );
    const withComments = photos.map(x => {
      const match = allComments.find(y => y.id === x.id);
      x.comments = match.comments;
      return x;
    });
    connection.end();
    res.status(200).json({ photos: withComments });
  } catch (err) {
    next(err);
  }
};

exports.postNewPhoto = async (req, res, next) => {
  try {
    const { comment, imageUrl } = req.body;
    const { id } = res.locals.tokenPayload;

    const insertData = [imageUrl, id];
    const sql = "INSERT INTO photos (image_url, user_id) VALUES ?";

    const connection = db();
    connection.connect();

    const result = await query(connection, sql, [[insertData]]);
    const photoID = result.insertId;

    if (comment) {
      const sql =
        "INSERT INTO comments (photo_id, user_id, comment_text) VALUES ?";
      await query(connection, sql, [[[photoID, id, comment]]]);
    }

    const newPhotoSql = `
      SELECT
        photos.id,
        photos.user_id,
        photos.image_url,
        photos.created_at,
        users.username,
        users.profile_image_url,
      0 AS likes
      FROM photos
      INNER JOIN users
      ON photos.user_id = users.id
      AND photos.id = ? ;`;
    const newPhotoResult = await query(connection, newPhotoSql, [[photoID]]);
    const comments = await getPhotoComments(photoID, connection);
    newPhotoResult[0].comments = comments.comments;
    connection.end();
    res.status(200).json({ newPhoto: newPhotoResult[0] });
  } catch (err) {
    next(err);
  }
};

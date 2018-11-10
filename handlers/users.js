const mysql = require("mysql");
const { query } = require("../helpers/database");
const { getPhotoComments } = require("./comments");

const config = {
  host: "us-cdbr-iron-east-01.cleardb.net",
  user: "b57e642d15cd4c",
  password: "76ca1458",
  database: "heroku_d169760d6be1801"
};

exports.updateUser = async (req, res, next) => {
  try {
    const { bio } = req.body;
    const { id } = res.locals.tokenPayload;
    const image = req.file;

    let sql = "UPDATE users SET bio = ? WHERE id = ?";
    let insertData = [[bio], [id]];
    if (image) {
      sql = "UPDATE users SET profile_image_url = ?, bio = ? WHERE id = ?";
      insertData = [[image.path], [bio], [id]];
    }
    await query(sql, insertData);
    res.status(200).json({ image: image ? image.path : null });
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
      "SELECT id, username, profile_image_url, bio   FROM users WHERE username = ?";
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

exports.postNewPhoto = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const { id } = res.locals.tokenPayload;
    const image = req.file;

    if (!image) next({ message: "No image file uploaded" });

    const insertData = [image.location, id];
    const sql = "INSERT INTO photos (image_url, user_id) VALUES ?";

    var db = mysql.createConnection(config);
    db.connect();

    const result = await query(sql, [[insertData]], db);
    const photoID = result.insertId;

    if (comment) {
      const sql =
        "INSERT INTO comments (photo_id, user_id, comment_text) VALUES ?";
      const commentResult = await query(sql, [[[photoID, id, comment]]], db);
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
    const newPhotoResult = await query(newPhotoSql, [[photoID]], db);
    const comments = await getPhotoComments(photoID, db);
    newPhotoResult[0].comments = comments.comments;
    res.status(200).json({ newPhoto: newPhotoResult[0] });
    db.end();
  } catch (err) {
    next(err);
  }
};

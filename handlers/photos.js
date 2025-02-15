const { query } = require("../helpers/database");
const { getPhotoComments } = require("./comments");
const db = require("../db");
const { getConnection } = require("../db");

exports.getPhotos = async (req, res, next) => {
  try {
    const { offset } = req.query;
    const sql = `
    SELECT
      photos.id,
      photos.user_id,
      photos.image_url,
      photos.created_at,
      users.username,
      users.profile_image_url,
      COUNT(likes.id) AS likes
      FROM photos
    LEFT JOIN users
    ON photos.user_id = users.id
    LEFT JOIN likes
    ON photos.id = likes.photo_id
    GROUP BY photos.id
    ORDER BY photos.id DESC
    LIMIT 15
    OFFSET ${offset}
    ;`;
    const connection = getConnection();
    connection.query(sql, async (err, result) => {
      try {
        if (err) {
          connection.end();
          return next(err);
        }
        const allComments = await Promise.all(
          result.map(x => getPhotoComments(x.id, connection))
        );
        const withComments = result.map(x => {
          const match = allComments.find(y => y.id === x.id);
          x.comments = match.comments;
          return x;
        });
        connection.end();
        res.status(200).json({ photos: withComments });
      } catch (err) {
        next(err);
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePhoto = async (req, res, next) => {
  try {
    const { photo_id } = req.params;
    const sql = "DELETE FROM photos WHERE id = ?";
    const connection = getConnection();
    connection.query(sql, photo_id, err => {
      connection.end();
      if (err) return next(err);
      res.sendStatus(200);
    });
  } catch (err) {
    next(err);
  }
};

exports.getPhotosByHashtag = async (req, res, next) => {
  try {
    const { hashtag } = req.params;
    const { offset } = req.query;
    const sql = `
    SELECT
      photos.id,
      photos.user_id,
      photos.image_url,
      photos.created_at,
      users.username,
      users.profile_image_url,
      COUNT(likes.id) AS likes
    FROM photos
    INNER JOIN users
    ON users.id = photos.user_id
    INNER JOIN comments
    ON comments.photo_id = photos.id
    AND comments.comment_text LIKE "%#${hashtag}" 
    LEFT JOIN likes
    ON photos.id = likes.photo_id
    GROUP BY photos.id
    ORDER BY photos.id DESC
    LIMIT 15
    OFFSET ${offset}
    ;`;
    const connection = getConnection();
    const photos = await query(connection, sql);
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

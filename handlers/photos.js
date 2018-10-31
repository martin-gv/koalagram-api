const db = require("../db");
const { query } = require("../helpers/database");
const { getPhotoComments } = require("./comments");

exports.getPhotos = (req, res, next) => {
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
  LIMIT 30;
  `;
  db.query(sql, async (err, result) => {
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
};

exports.getPhotosByHashtag = async (req, res, next) => {
  try {
    const { hashtag } = req.params;
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
    GROUP BY photos.id;
    `;
    const photos = await query(sql);
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

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const db = require("./db");

const errorHandler = require("./handlers/errors");
const { generateUsers, generatePhotos } = require("./data/generate");
const { getPhotoComments } = require("./handlers/photos");
const { loginRequired } = require("./middleware/middleware");

const authRoutes = require("./routes/auth");
const likeRoutes = require("./routes/likes");
const commentRoutes = require("./routes/comments");
const userRoutes = require("./routes/users");

axios.defaults.headers.common["Authorization"] =
  "Client-ID 98717389339ce6cdfce858cdd027842492d83226dcfe0887aba5e606ca8d19de";
// "Client-ID " + process.env.UNSPLASH;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/likes", loginRequired, likeRoutes);
app.use("/api/comments", loginRequired, commentRoutes);
app.use("/api/users", userRoutes);

app.get("/create_users", async (req, res, next) => {
  try {
    const { sql, data } = await generateUsers();
    db.query(sql, [data], (err, result) => {
      if (err) next(err);
      res.status(200).json(result);
    });
  } catch (err) {
    next(err);
  }
});

app.get("/create_photos", async (req, res, next) => {
  const userSql = "SELECT * FROM users";
  db.query(userSql, async (err, userRes) => {
    if (err) next(err);
    const { sql, data } = await generatePhotos(userRes);
    db.query(sql, [data], (err, result) => {
      if (err) next(err);
      console.log("New photos: ", typeof result);
      res.status(200).json(result);
    });
  });
});

app.get("/api/photos", (req, res, next) => {
  const sql = `
  SELECT
    photos.id,
    photos.user_id,
    photos.image_url,
    users.username,
    users.profile_image_url,
    COUNT(likes.id) AS likes
  FROM photos
  LEFT JOIN users
  ON photos.user_id = users.id
  LEFT JOIN likes
  ON photos.id = likes.photo_id
  GROUP BY photos.id
  LIMIT 15;
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
});

app.get("/users/:id", (req, res, next) => {
  const id = req.params.id;
  const sql = "SELECT * FROM users WHERE id =" + id;
  db.query(sql, (err, results) => {
    if (err) {
      next(err);
    } else {
      res.send(results);
    }
  });
});

// Create DB
// app.get("/create_db", (req, res, next) => {
//   let sql = "CREATE DATABASE koalagram";
//   db.query(sql, (err, result) => {
//     if (err) {
//       next(err);
//     } else {
//       console.log(result);
//       res.send("Database created");
//     }
//   });
// });

app.use(errorHandler);

app.listen("8080", () => console.log("Server starting! 🖥💻🔥"));

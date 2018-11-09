// const db = require("../db");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const config = {
  host: "us-cdbr-iron-east-01.cleardb.net",
  user: "b57e642d15cd4c",
  password: "76ca1458",
  database: "heroku_d169760d6be1801"
};

const getUserLikes = async function(userID) {
  return new Promise((resolve, reject) => {
    var db = mysql.createConnection(config);
    db.connect();
    sql = "SELECT * FROM likes WHERE user_id = ?";
    db.query(sql, [[userID]], (err, result) => {
      if (err) reject(err);
      db.end();
      resolve(result);
    });
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const image = req.file;
    const passwordHash = await bcrypt.hash(password, 12);

    const sql =
      "INSERT INTO users (username, profile_image_url, password) VALUES ?";
    const data = [
      username.toLowerCase(),
      (image && image.path) ||
        "https://vignette.wikia.nocookie.net/warframe/images/d/df/Doge.jpeg",
      passwordHash
    ];

    db.query(sql, [[data]], (err, result) => {
      if (err) {
        next(err);
      } else {
        db.query(
          "SELECT * FROM users WHERE id = ?",
          [[result.insertId]],
          async (err, result) => {
            if (err) {
              next(err);
            } else {
              const user = result[0];
              let token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.SECRET_KEY
              );
              user.likes = await getUserLikes(user.id);
              res.status(200).json({ user, token });
            }
          }
        );
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const sql = "SELECT * FROM users WHERE username = ?";
    const { token } = req.body;
    if (req.body.token) {
      const { username } = jwt.verify(token, process.env.SECRET_KEY);
      var db = mysql.createConnection(config);
      db.connect();
      db.query(sql, [[username]], async (err, result) => {
        if (err) {
          next(err);
        } else {
          const user = result[0];
          user.likes = await getUserLikes(user.id);
          res.status(200).json({ user });
          db.end();
        }
      });
    } else {
      const { username, password } = req.body.user;
      // Get user by username and check password
      var db = mysql.createConnection(config);
      db.connect();
      db.query(sql, [[username]], async (err, result) => {
        if (err) {
          next(err);
        } else {
          const user = result[0];
          if (!user) {
            next({ message: "No user found" });
          } else {
            const isPasswordCorrect = await bcrypt.compare(
              password,
              user.password
            );
            if (isPasswordCorrect) {
              let token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.SECRET_KEY
              );
              user.likes = await getUserLikes(user.id);
              res.status(200).json({ user, token });
              db.end();
            } else {
              next({ message: "Incorrect password" });
            }
          }
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

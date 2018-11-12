const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const getUserLikes = async function(userID) {
  return new Promise((resolve, reject) => {
    const connection = db();
    connection.connect();
    sql = "SELECT * FROM likes WHERE user_id = ?";
    connection.query(sql, [[userID]], (err, result) => {
      connection.end();
      if (err) reject(err);
      resolve(result);
    });
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { username, password, profileImageUrl } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    const sql =
      "INSERT INTO users (username, profile_image_url, password) VALUES ?";
    const data = [username.toLowerCase(), profileImageUrl, passwordHash];
    const connection = db();
    connection.connect();
    connection.query(sql, [[data]], (err, result) => {
      if (err) {
        connection.end();
        return next(err);
      }
      connection.query(
        "SELECT * FROM users WHERE id = ?",
        [[result.insertId]],
        async (err, result) => {
          if (err) return next(err);
          const user = result[0];
          let token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.SECRET_KEY
          );
          user.likes = await getUserLikes(user.id);
          connection.end();
          res.status(200).json({ user, token });
        }
      );
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
      const connection = db();
      connection.connect();
      connection.query(sql, [[username]], async (err, result) => {
        if (err) {
          connection.end();
          next(err);
        } else {
          const user = result[0];
          user.likes = await getUserLikes(user.id);
          connection.end();
          res.status(200).json({ user });
        }
      });
    } else {
      const { username, password } = req.body.user;
      // Get user by username and check password
      const connection = db();
      connection.connect();
      connection.connect();
      connection.query(sql, [[username]], async (err, result) => {
        if (err) {
          connection.end();
          next(err);
        } else {
          const user = result[0];
          if (!user) {
            connection.end();
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
              connection.end();
              res.status(200).json({ user, token });
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

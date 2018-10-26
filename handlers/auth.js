const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getUserLikes = async function(userID) {
  return new Promise((resolve, reject) => {
    sqlLikes = "SELECT * FROM likes WHERE user_id = ?";
    db.query(sqlLikes, [[userID]], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { user } = req.body;
    const passwordHash = await bcrypt.hash(user.password, 12);
    const sql =
      "INSERT INTO users (username, profile_image_url, password) VALUES ?";
    // to do: check if blank image url so default can be used
    const data = [
      user.username.toLowerCase(),
      user.profileImageUrl,
      passwordHash
    ];
    db.query(sql, [[data]], (err, result) => {
      if (err) next(err);
      db.query(
        "SELECT * FROM users WHERE id = ?",
        [[result.insertId]],
        (err, user) => {
          if (err) next(err);
          let token = jwt.sign(
            { id: user[0].id, username: user[0].username },
            process.env.SECRET_KEY
          );
          res.status(200).json({ user: user[0], token });
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
      db.query(sql, [[username]], async (err, result) => {
        if (err) next(err);
        const user = result[0];
        user.likes = await getUserLikes(user.id);
        res.status(200).json({ user });
      });
    } else {
      const { username, password } = req.body.user;
      // Get user by username and check password
      db.query(sql, [[username]], async (err, result) => {
        if (err) next(err);
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
          } else {
            next({ message: "Incorrect password" });
          }
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

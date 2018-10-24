const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
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
      if (err) throw err;
      db.query(
        "SELECT * FROM users WHERE id = ?",
        [[result.insertId]],
        (err, user) => {
          if (err) throw err;
          let token = jwt.sign(
            { id: user[0].id, username: user[0].username },
            process.env.SECRET_KEY
          );
          res.status(200).json({ user: user[0], token });
        }
      );
    });
  } catch (err) {
    throw err;
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body.user;
    const sql = "SELECT * FROM users WHERE username = ?";
    // Get user by username and check password
    db.query(sql, [[username]], async (err, result) => {
      if (err) throw err;
      const user = result[0];
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (isPasswordCorrect) {
        let token = jwt.sign(
          { id: user.id, username: user.username },
          process.env.SECRET_KEY
        );
        // Get user's likes and add to response
        sqlLikes = "SELECT * FROM likes WHERE user_id = ?";
        db.query(sqlLikes, [[user.id]], (err, result) => {
          if (err) throw err;
          user.likes = result;
          res.status(200).json({ user, token });
        });
      } else {
        res.status(400).send("Incorrect password");
      }
    });
  } catch (err) {
    throw err;
  }
};

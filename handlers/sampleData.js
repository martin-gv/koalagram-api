const axios = require("axios");
const bcrypt = require("bcrypt");
const faker = require("faker");

const db = require("../db");
const { getImages } = require("../data/images");

function flattenArray(arr) {
  return arr.reduce((acc, cur) => {
    return [...acc, ...cur];
  }, []);
}

exports.getUnsplashImages = async (req, res, next) => {
  try {
    //  const { searchTerm, numPages, startPage } = req.body;
    //  done: portrait 4 pages, start 1; animals 40 pages, start 1
    const searchTerm = "animals",
      numPages = 40,
      startPage = 1;
    if (searchTerm && numPages && startPage) {
      const requests = [];
      for (var i = startPage; i <= startPage + numPages - 1; i++) {
        requests.push(
          axios.get("https://api.unsplash.com/search/photos/", {
            params: { query: searchTerm, per_page: 30, page: i }
          })
        );
      }
      const resolvedPromises = await Promise.all(requests);
      const resultsArr = resolvedPromises.map(x => x.data.results);
      const results = flattenArray(resultsArr);
      const insertData = results.map(x => [
        searchTerm,
        x.urls.raw,
        x.urls.full,
        x.urls.regular,
        x.urls.small,
        x.urls.thumb
      ]);
      const sql =
        "INSERT INTO images (type, raw_url, full_url, regular_url, small_url, thumb_url) VALUES ?";
      db.query(sql, [insertData], (err, result) => {
        if (err) {
          next(err);
        } else {
          res.status(200).json({ result });
        }
      });
    } else {
      next({
        message: "Required parameters are searchTerm, numPages, and startPage"
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.createSampleUsers = async (req, res, next) => {
  try {
    const images = await getImages("portrait");
    const insertData = await Promise.all(
      images.map(async x => {
        const username = faker.internet.userName().toLowerCase();
        const passwordHash = await bcrypt.hash(username + "password", 12);
        return [username, x.small_url, passwordHash];
      })
    );
    const sql =
      "INSERT INTO users (username, profile_image_url, password) VALUES ?";
    db.query(sql, [insertData], (err, result) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json(result);
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createSamplePhotos = async (req, res, next) => {
  try {
    db.query("SELECT * FROM users", async (err, users) => {
      if (err) {
        next(err);
      } else {
        const images = await getImages("animals");
        const insertData = images.map(x => {
          const randUser = Math.floor(Math.random() * users.length);
          return [x.regular_url, users[randUser].id];
        });
        const sql = "INSERT INTO photos (image_url, user_id) VALUES ?";
        db.query(sql, [insertData], (err, result) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json(result);
          }
        });
      }
    });
  } catch (err) {
    next(err);
  }
};

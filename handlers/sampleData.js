const bcrypt = require("bcrypt");
const faker = require("faker");
const moment = require("moment");

const db = require("../db");
const { query } = require("../helpers/database");
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
    //  done: portrait 4 pages, start 5; animals 40 pages, start 41
    const searchTerm = "portrait",
      numPages = 1,
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
        const bio = faker.lorem.paragraph().slice(0, 255);
        const passwordHash = await bcrypt.hash(username + "password", 12);
        return [username, x.small_url, bio, passwordHash];
      })
    );
    const sql =
      "INSERT INTO users (username, profile_image_url, bio, password) VALUES ?";
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
        const date = moment();
        const insertData = images.map(x => {
          const randUser = Math.floor(Math.random() * users.length);
          const randSeconds = Math.floor(Math.random() * 3 * 60 * 60);
          //  note: moment functions mutate original object
          const createdAt = date.subtract(randSeconds, "seconds").toDate();
          return [x.regular_url, users[randUser].id, createdAt];
        });
        const sql =
          "INSERT INTO photos (image_url, user_id, created_at) VALUES ?";
        db.query(sql, [insertData.reverse()], (err, result) => {
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

exports.createSampleComments = async (req, res, next) => {
  try {
    photos = await query("SELECT * FROM photos");
    users = await query("SELECT * FROM users");
    const commentsByPhotoArrays = photos.map(x => {
      const numComments = Math.floor(Math.random() * 5);
      const commentsForThisPhoto = [];
      for (let i = 0; i < numComments; i++) {
        const randUser = Math.floor(Math.random() * users.length);
        commentsForThisPhoto.push([
          x.id,
          users[randUser].id,
          faker.lorem.sentence() + " #" + faker.lorem.word()
        ]);
      }
      return commentsForThisPhoto;
    });
    const insertData = flattenArray(commentsByPhotoArrays);
    const sql =
      "INSERT INTO comments (photo_id, user_id, comment_text) VALUES ?";
    const newComments = await query(sql, [insertData]);
    res.status(200).json(newComments);
  } catch (err) {
    next(err);
  }
};

function randomUniqueUsers(num, users, arr) {
  if (arr.length === num) {
    return;
  } else {
    const index = Math.floor(Math.random() * users.length);
    const randUser = users[index];
    if (!arr.find(x => x.id === randUser.id)) {
      arr.push(randUser);
    }
    randomUniqueUsers(num, users, arr);
  }
}

exports.createSampleLikes = async (req, res, next) => {
  try {
    photos = await query("SELECT * FROM photos");
    users = await query("SELECT * FROM users");
    const likesByPhotoArrays = photos.map(x => {
      const numOfLikes = Math.floor(Math.random() * 12);
      const likesForThisPhoto = [];
      const usersThatLikeThisPhoto = [];
      // const usersThatLikeThisPhoto = randomUniqueUsers(numOfLikes, users); why doesn't this work?
      randomUniqueUsers(numOfLikes, users, usersThatLikeThisPhoto);
      for (let i = 0; i < numOfLikes; i++) {
        likesForThisPhoto.push([x.id, usersThatLikeThisPhoto[i].id]);
      }
      return likesForThisPhoto;
    });
    const insertData = flattenArray(likesByPhotoArrays);
    const sql = "INSERT INTO likes (photo_id, user_id) VALUES ?";
    const newLikes = await query(sql, [insertData]);
    res.status(200).json(newLikes);
  } catch (err) {
    next(err);
  }
};

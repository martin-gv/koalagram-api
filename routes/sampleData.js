const express = require("express");
const router = express.Router();

const {
  getUnsplashImages,
  createSampleUsers,
  createSamplePhotos,
  createSampleComments,
  createSampleLikes
} = require("../handlers/sampleData");

router.route("/unsplash").get(getUnsplashImages);
router.route("/users").get(createSampleUsers);
router.route("/photos").get(createSamplePhotos);
router.route("/comments").get(createSampleComments);
router.route("/likes").get(createSampleLikes);

module.exports = router;

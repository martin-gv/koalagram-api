const express = require("express");
const router = express.Router();

const {
  getUnsplashImages,
  createSampleUsers,
  createSamplePhotos
} = require("../handlers/sampleData");

router.route("/unsplash").get(getUnsplashImages);
router.route("/users").get(createSampleUsers);
router.route("/photos").get(createSamplePhotos);

module.exports = router;

const express = require("express");
const router = express.Router();

const { getUnsplashImages, createSampleUsers } = require("../handlers/sampleData");

router.route("/unsplash").get(getUnsplashImages);
router.route("/users").get(createSampleUsers)

module.exports = router;

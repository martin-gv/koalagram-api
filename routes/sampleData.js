const express = require("express");
const router = express.Router();

const { getUnsplashImages } = require("../handlers/sampleData");

router.route("/unsplash").get(getUnsplashImages);

module.exports = router;

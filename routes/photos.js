const express = require("express");
const router = express.Router();

const { getPhotos, getPhotosByHashtag } = require("../handlers/photos");

router.route("/").get(getPhotos);
router.route("/:hashtag").get(getPhotosByHashtag);
module.exports = router;

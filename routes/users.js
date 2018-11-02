const express = require("express");
const router = express.Router();

const { getUserPhotos, getPhotosLikedByUser } = require("../handlers/users");

router.route("/:username").get(getUserPhotos);
router.route("/:username/likes").get(getPhotosLikedByUser);

module.exports = router;

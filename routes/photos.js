const express = require("express");
const router = express.Router();

const { loginRequired } = require("../middleware/middleware");
const {
  getPhotos,
  deletePhoto,
  getPhotosByHashtag
} = require("../handlers/photos");

router.route("/").get(getPhotos);
router.route("/:id").delete(loginRequired, deletePhoto);
router.route("/:hashtag").get(getPhotosByHashtag);

module.exports = router;

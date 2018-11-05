const express = require("express");
const router = express.Router();

const { loginRequired } = require("../middleware/middleware");
const {
  getUserPhotos,
  getPhotosLikedByUser,
  postNewPhoto
} = require("../handlers/users");

// posting to username is not needed as parameter is not used
// for posting to correct user, but token payload is used instead
router
  .route("/:username")
  .get(getUserPhotos)
  .post(loginRequired, postNewPhoto);
router.route("/:username/likes").get(getPhotosLikedByUser);

module.exports = router;

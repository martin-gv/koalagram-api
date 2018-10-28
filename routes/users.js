const express = require("express");
const router = express.Router();

const { getUserPhotos } = require("../handlers/users");

router.route("/:username").get(getUserPhotos);

module.exports = router;

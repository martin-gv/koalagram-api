const express = require("express");
const router = express.Router();

const { createLike, deleteLike } = require("../handlers/likes");

router.route("/").post(createLike);
router.route("/:photoID/user/:userID").delete(deleteLike);

module.exports = router;

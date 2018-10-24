const express = require("express");
const router = express.Router();

const { createComment, deleteComment } = require("../handlers/comments");

router.route("/").post(createComment);
router.route("/commentID").delete(deleteComment);

module.exports = router;

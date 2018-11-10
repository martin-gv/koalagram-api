const express = require("express");
const router = express.Router();

const upload = require("../services/fileUpload");
const singleUpload = upload.single("image");

router.post("/", function(req, res, next) {
  singleUpload(req, res, function(err) {
    if (err) return next(err);
    return res.json({ imageUrl: req.file.location });
  });
});

module.exports = router;

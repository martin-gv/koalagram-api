const express = require("express");
const aws = require("aws-sdk");
const router = express.Router();

const upload = require("../services/fileUpload");
const singleUpload = upload.single("image");

router.post("/", function(req, res, next) {
  singleUpload(req, res, function(err) {
    if (err) return next(err);
    return res.json({ imageUrl: req.file.location });
  });
});

// get signature for uploading to S3
router.get("/", function(req, res, next) {
  aws.config.region = "us-east-2";
  const s3 = new aws.S3();
  const fileName = req.query.fileName;
  const fileType = req.query.fileType;
  const s3Params = {
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: "public-read"
  };

  s3.getSignedUrl("putObject", s3Params, (err, data) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    const returnData = {
      signedRequest: data,
      url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    res.status(200).json(returnData);
  });
});

module.exports = router;

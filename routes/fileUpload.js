const express = require("express");
const aws = require("aws-sdk");
const router = express.Router();

aws.config.region = process.env.AWS_REGION;

// Returns signature for uploading directly to S3
router.get("/", function(req, res, next) {
  const s3 = new aws.S3();
  const fileName = req.query.fileName;
  const fileType = req.query.fileType;
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Expires: 180,
    ContentType: fileType,
    ACL: "public-read"
  };

  s3.getSignedUrl("putObject", s3Params, (err, data) => {
    if (err) return next(err);
    const returnData = {
      signedRequest: data,
      url: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    res.status(200).json(returnData);
  });
});

module.exports = router;

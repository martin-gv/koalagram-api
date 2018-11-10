var aws = require("aws-sdk");
var multer = require("multer");
var multerS3 = require("multer-s3");

aws.config.update({
  secretAccessKey: "yIWlZcfgQWK70ij6Yn296njzAcAGnErkwnvfMXdq",
  accessKeyId: "AKIAJGDZNOOH5XNN5SRQ",
  region: "us-east-2"
});

var s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    // cb(null, false);
    cb(new Error("Invalid file type. Only JPEG or PNG allowed."), false);
  }
};

var upload = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: "test-node-koalagram-server-mg",
    acl: "public-read",
    metadata: function(req, file, cb) {
      cb(null, { fieldName: "TESTING_META_DATA" });
      // cb(null, { fieldName: file.fieldname });
    },
    key: function(req, file, cb) {
      cb(null, Date.now().toString());
    }
  })
});

module.exports = upload;

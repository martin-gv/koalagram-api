require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const multer = require("multer");
const app = express();
const PORT = process.env.PORT || 8080;

const errorHandler = require("./handlers/errors");
const { loginRequired } = require("./middleware/middleware");

const authRoutes = require("./routes/auth");
const photoRoutes = require("./routes/photos");
const userRoutes = require("./routes/users");
const likeRoutes = require("./routes/likes");
const commentRoutes = require("./routes/comments");
const sampleDataRoutes = require("./routes/sampleData");

// axios.defaults.headers.common["Authorization"] =
//   "Client-ID 98717389339ce6cdfce858cdd027842492d83226dcfe0887aba5e606ca8d19de";

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, +new Date() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(cors());
app.use(bodyParser.json());
app.use(
  multer({
    storage: imageStorage,
    fileFilter,
    limits: { fileSize: "5mb" }
  }).single("imageFile")
);
app.use("/images", express.static("images"));

app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/likes", loginRequired, likeRoutes);
app.use("/api/comments", loginRequired, commentRoutes);
app.use("/api/sample-data", sampleDataRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log("Server starting! 🖥💻🔥"));

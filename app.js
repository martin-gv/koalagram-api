require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8080;

const errorHandler = require("./handlers/errors");
const { loginRequired } = require("./middleware/middleware");

const authRoutes = require("./routes/auth"),
  photoRoutes = require("./routes/photos"),
  userRoutes = require("./routes/users"),
  likeRoutes = require("./routes/likes"),
  commentRoutes = require("./routes/comments"),
  sampleDataRoutes = require("./routes/sampleData"),
  fileUploadRoutes = require("./routes/fileUpload");

// axios.defaults.headers.common["Authorization"] =
//   "Client-ID 98717389339ce6cdfce858cdd027842492d83226dcfe0887aba5e606ca8d19de";

app.use(cors());
app.use(bodyParser.json());
app.use("/images", express.static("images"));

app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/likes", loginRequired, likeRoutes);
app.use("/api/comments", loginRequired, commentRoutes);
app.use("/api/sample-data", sampleDataRoutes);
app.use("/api/file-upload", fileUploadRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log("Server starting! 🖥💻🔥"));

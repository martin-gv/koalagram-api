require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const db = require("./db");

const errorHandler = require("./handlers/errors");
const { loginRequired } = require("./middleware/middleware");

const authRoutes = require("./routes/auth");
const photoRoutes = require("./routes/photos");
const userRoutes = require("./routes/users");
const likeRoutes = require("./routes/likes");
const commentRoutes = require("./routes/comments");
const sampleDataRoutes = require("./routes/sampleData");

axios.defaults.headers.common["Authorization"] =
  "Client-ID 98717389339ce6cdfce858cdd027842492d83226dcfe0887aba5e606ca8d19de";
// "Client-ID " + process.env.UNSPLASH;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes)
app.use("/api/users", userRoutes);
app.use("/api/likes", loginRequired, likeRoutes);
app.use("/api/comments", loginRequired, commentRoutes);
app.use("/api/sample-data", sampleDataRoutes);

// Create DB
// app.get("/create_db", (req, res, next) => {
//   let sql = "CREATE DATABASE koalagram";
//   db.query(sql, (err, result) => {
//     if (err) {
//       next(err);
//     } else {
//       console.log(result);
//       res.send("Database created");
//     }
//   });
// });

app.use(errorHandler);

app.listen("8080", () => console.log("Server starting! 🖥💻🔥"));

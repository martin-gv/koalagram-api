const db = require("../db");

exports.createComment = async (req, res) => {
  try {
    console.log(req.body.comment);
    res.status(200).json({ create: req.body.comment });
  } catch (err) {
    throw err;
  }
};

exports.deleteComment = async (req, res) => {
  try {
    res.status(200).json({ route: "delete" });
  } catch (err) {
    throw err;
  }
};

const jwt = require("jsonwebtoken");

const authError = {
  status: 401,
  message: "Please log in first"
};

exports.loginRequired = function(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const secretKey = process.env.SECRET_KEY;
    jwt.verify(token, secretKey, function(err, payload) {
      if (payload) {
        return next();
      } else {
        return next(authError);
      }
    });
  } catch (err) {
    return next(authError);
  }
};

// exports.isAdmin = function(req, res, next) {};

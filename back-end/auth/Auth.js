const jwt = require("jsonwebtoken");
const config = require("../config/config");

const { secret } = config;

const verificationLib = {
  verifyToken: (req, res, callback) => {
    const bearerToken = req.headers.authorization;
    if (bearerToken && bearerToken.includes("Bearer")) {
      // Verify the JWT and, if it is valid, return a success message
      const token = bearerToken.split(" ")[1];
      return jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          return callback({ ...err, message: "Unauthorized" }, null);
        }
        // console.log(decoded);
        return callback(null, { message: "Success", payload: decoded });
      });
    }
    return callback({ message: "Unauthorized" }, null);
  }
};

module.exports = verificationLib;

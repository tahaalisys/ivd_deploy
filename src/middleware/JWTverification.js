const jwt = require("jsonwebtoken");
const Users = require("../Models/users");
const UserSession = require("../Models/session");

function basicAuth(req, res, next) {
  if (req.headers.authorization == undefined) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = req.headers.authorization.split(" ");
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token[1], process.env.JWT_SEC_USER, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const user = await Users.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let device;
    if (decoded.deviceId) {
      device = await UserSession.findOne({
        deviceId: decoded.deviceId,
        userId: decoded.userId,
      });
    }

    req.device = device;
    req.user = user;
    next();
  });
}

function AuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Check if authorization header is present
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const tokenParts = authHeader.split(" ");
    // Check if the token format is correct
    if (tokenParts[0] !== "Bearer" || !tokenParts[1]) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token format",
      });
    }

    const token = tokenParts[1];

    // Verify the token
    jwt.verify(token, process.env.JWT_SEC_USER, async (err, decoded) => {
      console.log(token);
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid token" });
      }

      // Find the user by ID
      const user = await Users.findById(decoded.userId);
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: No user found" });
      }

      // Check if the token is part of the user's active tokens
      if (!user.token.includes(token)) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Token is not active",
        });
      }

      // Find the user session by device ID and user ID
      const device = await UserSession.findOne({
        deviceId: decoded.deviceId,
        userId: decoded.userId,
      });
      if (!device) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: No session found" });
      }

      // Attach user and device information to the request object
      req.device = device;
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("AuthMiddleware error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { basicAuth, AuthMiddleware };

const mongoose = require("mongoose");

const UserSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    deviceName: {
      type: String,
      required: true,
    },
    deviceBrand: {
      type: String,
    },
    deviceType: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    location: {
      type: String,
    },
    applicationName: {
      type: String,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const UserSession = mongoose.model("UserSession", UserSessionSchema);

module.exports = UserSession;

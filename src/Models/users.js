const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    gmailToken: {
      type: String,
      default: "",
    },
    facebookToken: {
      type: String,
      default: "",
    },
    forgotPassToken: {
      type: String,
    },
    emailVerifyToken: {
      type: String,
    },
    emailVerify: {
      type: Boolean,
      default: false,
    },
    emailCount: {
      type: Number,
      default: 0,
    },
    isTrail: {
      type: Boolean,
      default: true,
    },
    trailEndDate: {
      type: Date,
    },
    isPaid: {
      type: Boolean,
      defualt: false,
    },
    isActive: {
      type: Boolean,
      defualt: true,
    },
    profilePic: {
      type: String,
    },
    snaptradeSec: {
      type: String,
    },
    token: [
      {
        type: String,
        required: true,
      },
    ],
    watchlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchList",
    },
    twoStepVerif: {
      type: Boolean,
      defualt: false,
    },
    twoStepCode: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Users = mongoose.model("User", userSchema);

module.exports = Users;

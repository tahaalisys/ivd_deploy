const mongoose = require("mongoose");

const watchListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  watchlist: [
    {
      type: String,
      required: true,
    },
  ],
  recentlyWatch: [
    {
      type: String,
    },
  ],
});
const WatchList = mongoose.model("WatchList", watchListSchema);

module.exports = WatchList;

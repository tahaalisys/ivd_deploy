const mongoose = require("mongoose");
const PortfolioGraphSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    portfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PortFolio",
    },
    todayPrices: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);
const PortFolioGraph = mongoose.model("PortfolioGraph", PortfolioGraphSchema);

module.exports = PortFolioGraph;

const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserId",
      required: true,
    },
    portfolioName: {
      type: String,
      required: true,
      min: 3,
    },
    ticker: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Symbol",
      },
    ],
  },
  { timestamps: true }
);

const Portfolio = mongoose.model("PortFolio", PortfolioSchema);

module.exports = Portfolio;

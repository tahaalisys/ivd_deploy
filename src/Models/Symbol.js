const mongoose = require("mongoose");

const SymbolSchema = new mongoose.Schema(
  {
    portfolio_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PortFolio",
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    noOfShare: {
      type: Number,
      required: true,
    },
    costPerShare: {
      type: Number,
      // required: true,
    },
  },
  { timestamps: true }
);

const Symbol = mongoose.model("Symbol", SymbolSchema);

module.exports = Symbol;

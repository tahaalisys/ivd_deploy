const { Snaptrade } = require("snaptrade-typescript-sdk");

const snaptrade = new Snaptrade({
  clientId: process.env.SnapTradeClienId,
  consumerKey: process.env.SnapTradeClientSrc,
});

module.exports = snaptrade;

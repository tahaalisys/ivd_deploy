const express = require("express");
const finnhub = require("finnhub");
const router = express.Router();
const CompanyProfile = require("../Models/finhub/companyProfile");
const { AuthMiddleware } = require("../middleware/JWTverification");
const finnhubClient = require("../helper/finnhub");
const SymbolsData = require("../Models/symboldata");
const WatchList = require("../Models/watchlist");
const mongoose = require("mongoose");
const mongooseDb = require("../DatabaseConfig/database");
const Portfolio = require("../Models/portfolio");
const { symbolDataFun, onlySymbols } = require("../helper/symbol");

router.get("/profile/:symbol", AuthMiddleware, async (req, res) => {
  try {
    const data = await CompanyProfile.findOne({});
    if (!data) {
      console.log("No data found in the database.");
      return res.status(404).send("No data found in the database.");
    }
    console.log("data: ===> ", data);
    res.status(200).send({ success: true, data: data });
  } catch (error) {
    console.log("Error retrieving data:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/symbol/:symbol", AuthMiddleware, async (req, res) => {
  try {
    const symbolKey = req.params.symbol.toUpperCase();
    const symbolData = await SymbolsData.find({
      symbol: { $regex: `^${symbolKey}`, $options: "i" },
    });
    const watchlist = await WatchList.findOne({ userId: req.user._id });

    if (!symbolData || symbolData.length === 0) {
      return res.status(404).send({ success: true, data: [] });
    }

    const data = symbolData.map((element) => {
      if (element.data.length < 2) {
        throw new Error("Insufficient data entries for calculation");
      }

      const differenceInCurrency =
        element.data[0].close - element.data[1].close;
      const ratio = (differenceInCurrency * 100) / element.data[1].close;
      let logoUrl;
      if (element.companyProfile.logo) {
        logoUrl = element.companyProfile.logo.replace(/\.svg$/, ".png");
      } else {
        logoUrl = null;
      }

      let watchList = false;
      if (watchlist) {
        if (watchlist.watchlist.includes(element.symbol)) watchList = true;
      }
      return {
        watchlist: watchList,
        companyName: element.companyName,
        ticker: element.symbol,
        logo: logoUrl,
        currentPrices: element.data[0].close,
        DividendYield: element.stockMetrics.CurrentDividendYieldTTM,
        DividendPerShareAnnual: element.stockMetrics.DividendPerShareAnnual,
        differenceInPercentage: ratio,
        differenceInCurrency: differenceInCurrency,
      };
    });

    res.status(200).send({ success: true, data: data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error!" });
  }
});

router.get("/companyData/:symbol", AuthMiddleware, async (req, res) => {
  try {
    const symbolkey = req.params.symbol.toUpperCase();

    const symbol = await SymbolsData.findOne({ symbol: symbolkey });
    const logo = symbol.companyProfile.logo.replace(/\.svg$/, ".png");

    res.status(200).send({ success: true, data: symbol, logo: logo });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error", error: error });
  }
});

router.get("/chart/:symbol/:intervel", AuthMiddleware, async (req, res) => {
  try {
    const { symbol, intervel } = req.params;
    await mongooseDb();

    const db = mongoose.connection;

    const collection = db.collection(`SYM_${symbol}`);
    const query = { type: intervel }; // Example filter
    const data = await collection.find(query).toArray();

    return res.status(200).send({ success: true, data: data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error", error: error });
  }
});

router.get("/dataCompany/:symbol", AuthMiddleware, async (req, res) => {
  try {
    const symbol = req.params.symbol;

    finnhubClient.companyExecutive(symbol, (error, data, response) => {
      console.log(data);
      res.status(200).send({
        success: true,
        data,
      });
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ succes: true, message: "Internal server error", error });
  }
});

router.get(
  "/companyNews/:symbol/:startingDate/:closingDate",
  AuthMiddleware,
  async (req, res) => {
    try {
      const { symbol, startingDate, closingDate } = req.params;
      const api_key = finnhub.ApiClient.instance.authentications["api_key"];
      api_key.apiKey = "coek761r01qj17o6t7m0coek761r01qj17o6t7mg";
      const finnhubClient = new finnhub.DefaultApi();

      finnhubClient.companyNews(
        symbol,
        startingDate,
        closingDate,
        (error, data, response) => {
          return res.status(200).send({ success: true, data });
        }
      );
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ success: false, message: "Internal server error", error });
    }
  }
);

router.get("/get/idea", AuthMiddleware, async (req, res) => {
  try {
    const portfolio = await Portfolio.find().populate("ticker");
    const symbol = [];

    for (let i = 0; i < portfolio.length; i++) {
      const element = portfolio[i];
      const ticker = element.ticker;

      for (let y = 0; y < ticker.length; y++) {
        const tickerElement = ticker[y];
        if (!symbol.includes(tickerElement.symbol)) {
          if (symbol.length < 49) {
            symbol.push(tickerElement.symbol);
          } else {
            break;
          }
        }
      }
      if (symbol.length >= 49) {
        break;
      }
    }
    const data = await onlySymbols(symbol);

    return res.status(200).send({
      success: true,
      symbols: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.get(
  "/companyDividend/:symbol/:startingDate/:closingDate",
  AuthMiddleware,
  async (req, res) => {
    try {
      const { symbol, startingDate, closingDate } = req.params;
      const api_key = finnhub.ApiClient.instance.authentications["api_key"];
      api_key.apiKey = "coek761r01qj17o6t7m0coek761r01qj17o6t7mg";
      const finnhubClient = new finnhub.DefaultApi();

      finnhubClient.stockDividends(
        symbol,
        startingDate,
        closingDate,
        (error, data, response) => {
          res.status(200).send({
            success: true,
            data: [
              {
                symbol: "AAPL",
                date: "2019-11-07",
                amount: 0.77,
                adjustedAmount: 0.77,
                payDate: "2019-11-14",
                recordDate: "2019-11-11",
                declarationDate: "2019-10-30",
                currency: "USD",
              },
              {
                symbol: "AAPL",
                date: "2019-08-09",
                amount: 0.77,
                adjustedAmount: 0.77,
                payDate: "2019-08-15",
                recordDate: "2019-08-12",
                declarationDate: "2019-07-30",
                currency: "USD",
              },
              {
                symbol: "AAPL",
                date: "2019-05-10",
                amount: 0.77,
                adjustedAmount: 0.77,
                payDate: "2019-05-16",
                recordDate: "2019-05-13",
                declarationDate: "2019-05-01",
                currency: "USD",
              },
              {
                symbol: "AAPL",
                date: "2019-02-08",
                amount: 0.73,
                adjustedAmount: 0.77,
                payDate: "2019-02-14",
                recordDate: "2019-02-11",
                declarationDate: "2019-01-29",
                currency: "USD",
              },
            ],
          });
        }
      );
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ success: false, message: "Internal server error", error });
    }
  }
);

router.get(
  "/get/earing/calender/:from/:to",
  AuthMiddleware,
  async (req, res) => {
    try {
      finnhubClient.earningsCalendar(
        { from: req.params.from, to: req.params.to },
        (error, data, response) => {
          const responseData = [];
          for (let i = 0; i < data.earningsCalendar.length; i++) {
            const element = data.earningsCalendar[i];
            const res = {
              symbol: element.symbol,
              date: element.date.toString(),
              epsEstimate: element.epsEstimate,
            };
            responseData.push(res);
          }
          return res.status(200).send({ success: true, data: responseData });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

module.exports = router;

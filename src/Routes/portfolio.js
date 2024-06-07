const PortFolio = require("../Models/portfolio");
const Symbol = require("../Models/symbol");
const { AuthMiddleware } = require("../middleware/JWTverification");
const router = require("express").Router();
const { portfolioStockSchema } = require("../Validation/JoiAuth");
const SymbolsData = require("../Models/symboldata");
const { symbolDataFun, portfolioData } = require("../helper/symbol");
const PortFolioGraph = require("../Models/profileGraph");
const snaptrade = require("../helper/snapTrade");

router.post("/create/portfolio", AuthMiddleware, async (req, res) => {
  try {
    const name = req.body.name;
    const user = req.user;
    if (!name)
      return res
        .status(400)
        .send({ success: false, message: "Name is required" });

    const oldPortfolio = await PortFolio.findOne({
      userId: req.user._id,
      portfolioName: name,
    });
    if (oldPortfolio) {
      return res
        .status(400)
        .send({ success: false, message: "You already used that name" });
    }
    const newPort = await PortFolio({
      userId: user._id,
      portfolioName: name,
    });
    await newPort.save();

    const data = {
      portfolioId: newPort._id,
      portfolioName: newPort.portfolioName,
    };

    return res.status(200).send({
      success: true,
      message: "New portfolio added successfully",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error", error: error });
  }
});

router.post("/add/symbol", AuthMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const result = portfolioStockSchema.validate(data, {
      abortEarly: false,
    });

    if (result.error) {
      const x = result.error.details.map((error) => error.message);
      return res.status(400).json({
        success: false,
        message: x,
      });
    }
    const portfolio = await PortFolio.findById(result.value.portfolio_Id);
    if (!portfolio) {
      return res
        .status(404)
        .send({ success: false, message: "No portfolio found" });
    }

    const symbols = await SymbolsData.findOne({
      symbol: result.value.symbol.toUpperCase(),
    });
    if (!symbols) {
      return res
        .status(400)
        .send({ success: false, message: "No Symbol found with this ticker" });
    }

    const symbol = await Symbol.find({
      portfolio_Id: portfolio._id,
      symbol: result.value.symbol.toUpperCase(),
    });

    if (symbol.length > 0) {
      return res.status(400).send({
        success: false,
        message: "You already added that symbol to that portfolio",
      });
    }

    const newSymbol = Symbol({
      portfolio_Id: result.value.portfolio_Id,
      symbol: symbols.symbol,
      noOfShare: result.value.noOfShare,
      costPerShare: !result.value.costPerShare
        ? symbols.data[1].close
        : result.value.costPerShare,
    });

    portfolio.ticker.push(newSymbol._id);
    await newSymbol.save();
    await portfolio.save();
    const resData = {
      portfolioId: portfolio._id,
      portfolioName: portfolio.portfolioName,
      ticker: [
        {
          symbol: newSymbol.symbol,
          noOfShare: newSymbol.noOfShare,
        },
      ],
    };

    res.status(200).send({
      success: true,
      message: "Symbol added successfully",
      data: resData,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error", error: error });
  }
});

router.put(
  "/update/symbol/:portfolioId/:symbolId",
  AuthMiddleware,
  async (req, res) => {
    try {
      const { portfolioId, symbolId } = req.params;
      const { costPerShare, noOfShare } = req.body;
      const user = req.user;

      const portfolio = await PortFolio.findById(portfolioId).populate("");
      if (!portfolio) {
        return res
          .status(404)
          .send({ success: false, message: "No protfolio found" });
      }

      if (portfolio.userId.toString() !== user._id.toString()) {
        return res.status(404).send({ success: false, message: "Unauthorize" });
      }

      const symbol = await Symbol.findById(symbolId);
      if (!symbol) {
        return res
          .status(404)
          .send({ success: false, message: "No symbol found" });
      }

      symbol.costPerShare = costPerShare || symbol.costPerShare;
      symbol.noOfShare = noOfShare || symbol.noOfShare;

      symbol.save();
      return res
        .status(200)
        .send({ success: true, message: "Symbol updated successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error !",
        error: error,
      });
    }
  }
);

router.delete(
  "/delete/symbol/:portfolioId/:symbolId",
  AuthMiddleware,
  async (req, res) => {
    try {
      const { portfolioId, symbolId } = req.params;
      const user = req.user;

      // Find the portfolio by ID and check if it exists
      const portfolio = await PortFolio.findById(portfolioId);
      if (!portfolio) {
        return res
          .status(404)
          .send({ success: false, message: "No portfolio found" });
      }

      // Check if the portfolio belongs to the authenticated user
      if (portfolio.userId.toString() !== user._id.toString()) {
        return res
          .status(403)
          .send({ success: false, message: "Unauthorized" });
      }

      // Remove the symbol ID from the ticker array
      const tickerIndex = portfolio.ticker.indexOf(symbolId);
      if (tickerIndex === -1) {
        return res
          .status(404)
          .send({ success: false, message: "Symbol not found in portfolio" });
      }
      portfolio.ticker.splice(tickerIndex, 1);

      // Save the updated portfolio
      await portfolio.save();

      // Delete the symbol document
      const symbol = await Symbol.findByIdAndDelete(symbolId);
      if (!symbol) {
        return res
          .status(404)
          .send({ success: false, message: "No symbol found" });
      }

      // Send success response
      return res
        .status(200)
        .send({ success: true, message: "Symbol deleted successfully" });
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

router.get("/user/portfolio", AuthMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let sortBY = { createdAt: -1 };
    if (req.query.sort) {
      sortBY = JSON.parse(req.query.sort);
    }
    const user = req.user;
    const total = await PortFolio.countDocuments({ userId: user._id });

    const totalPages = Math.ceil(total / limit);

    const portfolio = await PortFolio.find({ userId: user._id })
      .skip(skip)
      .limit(limit)
      .sort(sortBY)
      .populate("ticker")
      .exec();
    // const data = [];
    // for (let i = 0; i < portfolio.length; i++) {
    //   const element = portfolio[i];
    //   const datas = {
    //     element.portfolioName,
    //     element.totalAssist,
    //     element.dividendYield
    //   };
    // }
    let datas = [];
    for (let i = 0; i < portfolio.length; i++) {
      const element = portfolio[i];
      const symboldata = await symbolDataFun(element.ticker);
      if (element.userId.toString() !== user._id.toString()) {
        return res.status(404).send({ success: false, message: "Unauthorize" });
      }
      const data = {
        _id: element._id,
        totalPrices: symboldata.totalPrices,
        totalProfitOrLoss: symboldata.totalProfitOrLoss,
        ratioProfitOrLoss: symboldata.ratioProfitOrLoss,
        portfolioName: element.portfolioName,
        ticker: symboldata.allData,
      };
      datas.push(data);
    }

    res
      .status(200)
      .send({ success: true, data: datas, page, totalPages, limit, total });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error", error: error });
  }
});

router.get("/user/protfolio/:portfolioId", AuthMiddleware, async (req, res) => {
  try {
    const portfolioId = req.params.portfolioId;
    const user = req.user;
    const portfolio = await PortFolio.findById(portfolioId).populate("ticker");
    if (!portfolio) {
      return res
        .status(404)
        .send({ success: false, message: "No protfolio found" });
    }
    const symboldata = await symbolDataFun(portfolio.ticker);
    if (portfolio.userId.toString() !== user._id.toString()) {
      return res.status(404).send({ success: false, message: "Unauthorize" });
    }
    const data = {
      totalPrices: symboldata.totalPrices,
      totalProfitOrLoss: symboldata.totalProfitOrLoss,
      ratioProfitOrLoss: symboldata.ratioProfitOrLoss,
      portfolioName: portfolio.portfolioName,
      ticker: symboldata.allData,
    };
    res.status(200).send({ success: true, data: data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error!" });
  }
});

router.delete(
  "/delete/portfolio/:portfolioId",
  AuthMiddleware,
  async (req, res) => {
    try {
      const portfolioId = req.params.portfolioId;
      const user = req.user;
      const portfolio = await PortFolio.findByIdAndDelete(portfolioId).populate(
        ""
      );
      if (!portfolio) {
        return res
          .status(404)
          .send({ success: false, message: "No protfolio found" });
      }

      if (portfolio.userId.toString() !== user._id.toString()) {
        return res.status(404).send({ success: false, message: "Unauthorize" });
      }
      const portfolioTicket = portfolio.ticker;
      for (let i = 0; i < portfolioTicket.length; i++) {
        const element = portfolioTicket[i];
        await Symbol.findByIdAndDelete(element);
      }
      res.status(200).send({ success: true, message: "portfolio deleted" });
    } catch (error) {
      console.log(error);
      return re.status(500).send({
        success: false,
        message: "Internal server error!",
        error: error,
      });
    }
  }
);

router.put("/update/portfolio/:id", AuthMiddleware, async (req, res) => {
  try {
    const portfolioId = req.params.id;
    const newName = req.body.name;
    const user = req.user;

    if (!newName)
      return res
        .status(400)
        .send({ success: false, message: "Name is required" });

    const portfolio = await PortFolio.findOne({
      _id: portfolioId,
      userId: user._id,
    });

    if (!portfolio) {
      return res
        .status(404)
        .send({ success: false, message: "Portfolio not found" });
    }

    const existingPortfolioWithName = await PortFolio.findOne({
      userId: user._id,
      portfolioName: newName,
    });

    if (
      existingPortfolioWithName &&
      existingPortfolioWithName._id.toString() !== portfolioId
    ) {
      return res
        .status(400)
        .send({ success: false, message: "You already used that name" });
    }

    portfolio.portfolioName = newName;
    await portfolio.save();

    const data = {
      portfolioId: portfolio._id,
      portfolioName: portfolio.portfolioName,
    };

    return res.status(200).send({
      success: true,
      message: "Portfolio updated successfully",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error", error: error });
  }
});

router.get("/get/all/profite", AuthMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const portfolio = await PortFolio.find({ userId: user._id })
      .populate("ticker")
      .exec();
    let datas = [];

    for (let i = 0; i < portfolio.length; i++) {
      const element = portfolio[i];
      const symboldata = await symbolDataFun(element.ticker);
      if (element.userId.toString() !== user._id.toString()) {
        return res.status(404).send({ success: false, message: "Unauthorize" });
      }
      const data = {
        ...symboldata,
        portfolioName: element.portfolioName,
      };
      datas.push(data);
    }

    const result = await portfolioData(datas);

    // Restructure data.allPortfilio to nest allData under portfolio names
    let allPortfilio = [];
    datas.forEach((data) => {
      let allPortfilios = {
        name: data.portfolioName,
        totalPrices: data.totalPrices,
        totalProfitOrLoss: data.totalProfitOrLoss,
        ratioProfitOrLoss: data.ratioProfitOrLoss,
        ticker: data.allData,
      };
      allPortfilio.push(allPortfilios);
      // if (!allPortfilio[data.portfolioName]) {
      //   allPortfilio[data.portfolioName] = {
      //     portfolioTicker: [],
      //     totalPrices: 0,
      //     totalProfitOrLoss: 0,
      //     ratioProfitOrLoss: 0,
      //   };
      // }
      // allPortfilio[data.portfolioName].portfolioTicker.push(data);
      // allPortfilio[data.portfolioName].totalPrices += data.totalCost;
      // allPortfilio[data.portfolioName].totalProfitOrLoss += data.profitOrLoss;
      // allPortfilio[data.portfolioName].ratioProfitOrLoss +=
      //   data.ratioProfitOrLoss;
    });

    const data = {
      allAsset: result.allAssit,
      allProfiteLoss: result.allProfiteLoss,
      ratio: result.ratio,
      allDividendYield: result.allDividendYield,
      allDividendRate: result.allDividendRate,
      allDividendYieldAnnual: result.allDividendYieldAnnual,
      allPortfilio,
    };

    return res.status(200).send({ success: true, data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error !", error });
  }
});

router.get("/get/all/data/for/dashboard", AuthMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const portfolio = await PortFolio.find({ userId: user._id })
      .populate("ticker")
      .exec();
    let datas = [];

    for (let i = 0; i < portfolio.length; i++) {
      const element = portfolio[i];
      const symboldata = await symbolDataFun(element.ticker);
      if (element.userId.toString() !== user._id.toString()) {
        return res.status(404).send({ success: false, message: "Unauthorize" });
      }
      const data = {
        ...symboldata,
        portfolioName: element.portfolioName,
      };
      datas.push(data);
    }

    const result = await portfolioData(datas);

    // Aggregate shares for the same ticker symbol
    let tickerMap = {};
    datas.forEach((data) => {
      data.allData.forEach((tickerData) => {
        if (!tickerMap[tickerData.symbol]) {
          tickerMap[tickerData.symbol] = { ...tickerData };
        } else {
          tickerMap[tickerData.symbol].share += tickerData.share;
        }
      });
    });

    let userTicker = Object.values(tickerMap);

    const data = {
      allAsset: result.allAssit,
      allProfiteLoss: result.allProfiteLoss,
      ratio: result.ratio,
      allDividendYield: result.allDividendYield,
      allDividendRate: result.allDividendRate,
      allDividendYieldAnnual: result.allDividendYieldAnnual,
      userTicker,
    };

    return res.status(200).send({ success: true, data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error !", error });
  }
});

router.get(
  "/get/user/portfolio/graph/:portfolioId",
  AuthMiddleware,
  async (req, res) => {
    try {
      const user = req.user;
      const portfolioId = req.params.portfolioId;
      const filter = req.query.filter;

      let dateFilter;
      const currentDate = new Date();
      if (filter === "W") {
        dateFilter = new Date(currentDate.setDate(currentDate.getDate() - 7));
      } else if (filter === "M") {
        dateFilter = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
      } else if (filter === "Y") {
        dateFilter = new Date(
          currentDate.setFullYear(currentDate.getFullYear() - 1)
        );
      } else {
        dateFilter = new Date(0);
      }

      const portfolioGraph = await PortFolioGraph.find({
        portfolioId,
        userId: user._id,
        createdAt: { $gte: dateFilter },
      });

      let data = [];
      for (let i = 0; i < portfolioGraph.length; i++) {
        const element = portfolioGraph[i];
        const singlePortfolioData = {
          prices: element.todayPrices,
          date: element.createdAt.toISOString().split("T")[0],
        };
        data.push(singlePortfolioData);
      }

      return res.status(200).send({ success: true, data });
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

router.get("/get/user/Graph", AuthMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const portfolioGraph = await PortFolioGraph.find({ userId: user._id });

    const groupedData = portfolioGraph.reduce((acc, curr) => {
      const date = curr.createdAt.toISOString().split("T")[0]; // Get date part only
      if (!acc[date]) {
        acc[date] = {
          date: date,
          totalPrices: 0,
        };
      }
      acc[date].totalPrices += curr.todayPrices;
      return acc;
    }, {});

    const result = Object.values(groupedData);

    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false, // Corrected this to false
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/connect/broker", AuthMiddleware, async (req, res) => {
  try {
    const user = req.user;

    const response = await snaptrade.authentication.loginSnapTradeUser({
      userId: user.email,
      userSecret: user.snaptradeSec,
    });
    res.status(200).send({ success: true, data: response.data });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error!",
      error: error.message,
    });
  }
});

module.exports = router;

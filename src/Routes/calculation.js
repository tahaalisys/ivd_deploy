const router = require("express").Router();
const snaptrade = require("../helper/snapTrade");

/**
 * @swagger
 * /cal/dividend:
 *   post:
 *     summary: Calculate dividend yield for a stock symbol
 *     tags: [Calculator]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbol:
 *                 type: string
 *               dividendYield:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful response with dividend calculation data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     symbol:
 *                       type: string
 *                     symbolCurrentPrice:
 *                       type: string
 *                     dividendYield:
 *                       type: string
 *                     annualDividend:
 *                       type: string
 */
router.post("/dividend", async (req, res) => {
  try {
    const symbol = req.body.symbol;
    const dividendYield = req.body.dividendYield;
    if (!symbol) {
      return res.status(400).send({
        success: false,
        message: " You have to provide a symbol for calculation",
      });
    }

    const response = await snaptrade.trading.getUserAccountQuotes({
      accountId: "3f22813e-3e31-4616-8cfb-3d9e022cda8a",
      userId: "checking2",
      userSecret: "40704f0c-2e6b-4ed3-a2cd-e50df0bcb91e",
      symbols: symbol,
      useTicker: true,
    });

    let symbolCurrentPrice = response.data[0].last_trade_price;
    // const dividendYield = "0.53%";

    const dividendYieldNumber = parseFloat(dividendYield.replace("%", ""));

    function calculateAnnualDividend(symbolCurrentPrice, dividendYield) {
      const dividendYieldDecimal = dividendYield / 100;
      return symbolCurrentPrice * dividendYieldDecimal;
    }

    const annualDividend = calculateAnnualDividend(
      symbolCurrentPrice,
      dividendYieldNumber
    );

    const data = {
      symbol: symbol,
      symbolCurrentPrice: symbolCurrentPrice.toFixed(2),
      dividendYield: dividendYield,
      annualDividend: annualDividend.toFixed(2),
    };

    res.status(200).send({
      success: true,
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error ",
      error: error,
    });
  }
});

/**
 * @swagger
 * /cal/goal:
 *   post:
 *     summary: Calculate investment goals for given stocks
 *     tags: [Calculator]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               goal:
 *                 type: number
 *               ticker:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     symbol:
 *                       type: string
 *                     symbolCurrentPrice:
 *                       type: number
 *                     annualDividend:
 *                       type: number
 *     responses:
 *       '200':
 *         description: Successful response with investment goals calculation data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                       goalPerSymbol:
 *                         type: string
 *                       NoOfShares:
 *                         type: integer
 *                       investmentAmount:
 *                         type: string
 */
router.post("/goal", async (req, res) => {
  try {
    const { goal, ticker } = req.body;

    const goals = goal / ticker.length;

    let response = [];
    for (let i = 0; i < ticker.length; i++) {
      const element = ticker[i];
      let share = Math.round(goals / element.annualDividend);
      let investmentAmount = share * element.symbolCurrentPrice;
      const data = {
        symbol: element.symbol,
        goalPerSymbol: goals.toFixed(2),
        NoOfShares: share,
        investmentAmount: investmentAmount.toFixed(2),
      };
      response.push(data);
    }

    res.status(200).send({ success: true, data: response });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error", error: error });
  }
});

module.exports = router;

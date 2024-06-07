var cron = require("node-cron");
const User = require("../Models/users");
const sendEmail = require("./emailSend");
const jwt = require("jsonwebtoken");
const Portfolio = require("../Models/portfolio");
const { symbolDataFun } = require("./symbol");
const PortfolioGraph = require("../Models/profileGraph");

module.exports.cronSteup = cron.schedule("* * 2 * *", async () => {
  try {
    console.log("cronJOB starting");

    const users = await User.find({
      emailVerify: false,
      emailCount: { $lt: 2 },
    });

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const email = user.email;

      if (user.emailCount === 2) {
        await User.findByIdAndDelete(user._id);
        continue;
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SEC_VER, {
        expiresIn: "2d",
      });

      user.emailCount = user.emailCount + 1;

      const emailVerifyLink = `http://localhost:8080/auth/resetPassword-${token}`;

      const subject = "Your Link is expire Soon!";
      const text = `Hey ${user.name},
      We heard that you want to join IVD-Dividends.
      Your first token is expired,

      But dont worry, Here is the 2nd link for your email verifications.
      
      Use the link to verify.
      LINK: ${emailVerifyLink}
      
      If you don’t use this link within 2 days, it will expire.
      
      Thanks,
      The IVD-Dividends Team`;

      await user.save();
      await sendEmail(email, subject, text);
    }
  } catch (error) {
    console.error("error: ", error);
  }
});

module.exports.graphData = cron.schedule("0 0 * * *", async () => {
  console.log("Running daily cron job for portfolio graph data");

  try {
    const portfolios = await Portfolio.find().populate("ticker");

    for (let portfolio of portfolios) {
      const symbols = portfolio.ticker.map((ticker) => ({
        symbol: ticker.symbol,
        costPerShare: ticker.costPerShare,
        noOfShare: ticker.noOfShare,
      }));

      const { totalPrices } = await symbolDataFun(symbols);

      const portfolioGraphData = new PortfolioGraph({
        userId: portfolio.userId,
        portfolioId: portfolio._id,
        todayPrices: totalPrices,
      });

      await portfolioGraphData.save();
      console.log(`Saved portfolio graph data for user ${portfolio.userId}`);
    }
  } catch (error) {
    console.error("Error running cron job for portfolio graph data:", error);
  }
});

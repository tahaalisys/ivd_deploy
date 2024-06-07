const SymbolsData = require("../Models/symboldata");

const symbolDataFun = async (symbols) => {
  try {
    // console.log(symbols);
    let allData = [];
    let totalPrices = 0;
    let totalProfitOrLoss = 0;
    let ratioProfitOrLoss = 0;

    for (let i = 0; i < symbols.length; i++) {
      const sym = symbols[i].symbol;
      const symbol = await SymbolsData.findOne({ symbol: sym });

      if (symbol) {
        const costPerShare = symbols[i].costPerShare;
        const noOfShares = symbols[i].noOfShare;
        const closingPrice = symbol.data[1].close;

        const totalCost = costPerShare * noOfShares;
        const profitOrLoss = (closingPrice - costPerShare) * noOfShares;
        const logo = symbol.companyProfile.logo.replace(/\.svg$/, ".png");
        const data = {
          symbol: sym,
          share: symbols[i].noOfShare,
          avgPrices: symbols[i].costPerShare,
          dividendYield: symbol.metaData.dividendYield,
          dividendRate: symbol.metaData.dividendRate,
          dividendYieldAnnual: symbol.stockMetrics.DividendPerShareAnnual,
          closingPrice: closingPrice,
          closingPriceTwoDaysAgo: symbol.data[0].close,
          industry: symbol.companyProfile.finnhubIndustry,
          sector: symbol.companyProfile.gsector,
          logo: logo,
          totalCost: totalCost,
          profitOrLoss: profitOrLoss,
          ratioProfitOrLoss: (profitOrLoss / totalCost) * 100,
        };

        allData.push(data);
        totalPrices += closingPrice * noOfShares;
        totalProfitOrLoss += profitOrLoss;
      }
    }
    ratioProfitOrLoss = (totalProfitOrLoss / totalPrices) * 100;

    return { allData, totalPrices, totalProfitOrLoss, ratioProfitOrLoss };
  } catch (error) {
    console.log(error);
    throw new Error("Error in fetching symbol data");
  }
};

const portfolioData = async (portfolio) => {
  let allAssit = 0;
  let allProfiteLoss = 0;
  let allRatioProfitOrLoss = 0;
  let allDividendYield = 0;
  let allDividendRate = 0;
  let allDividendYieldAnnual = 0;
  for (let i = 0; i < portfolio.length; i++) {
    const element = portfolio[i];
    let DividendYield = 0;
    let DividendRate = 0;
    let DividendYieldAnnual = 0;
    for (let y = 0; y < portfolio[i].allData.length; y++) {
      const elements = portfolio[i].allData[y];
      DividendYield += elements.dividendYield;
      DividendRate += elements.dividendRate;
      DividendYieldAnnual += elements.dividendYieldAnnual;
    }
    allDividendYield = DividendYield / portfolio[i].allData.length;
    allDividendRate = DividendRate / portfolio[i].allData.length;
    allDividendYieldAnnual = DividendYieldAnnual / portfolio[i].allData.length;
    allAssit += element.totalPrices;
    allProfiteLoss += element.totalProfitOrLoss;
    allRatioProfitOrLoss += element.ratioProfitOrLoss;
  }
  const ratio = allRatioProfitOrLoss / portfolio.length;
  return {
    allAssit,
    allProfiteLoss,
    ratio,
    allDividendYield,
    allDividendRate,
    allDividendYieldAnnual,
  };
};

const onlySymbols = async (symbols) => {
  try {
    let allData = [];
    for (let i = 0; i < symbols.length; i++) {
      const sym = symbols[i];
      const symbol = await SymbolsData.findOne({ symbol: sym });
      const logo = symbol.companyProfile.logo.replace(/\.svg$/, ".png");
      const data = {
        symbol: sym,
        dividendYield: symbol.metaData.dividendYield,
        dividendRate: symbol.metaData.dividendRate,
        dividendYieldAnnual: symbol.stockMetrics.DividendPerShareAnnual,
        data: symbol.data[1],
        industry: symbol.companyProfile.finnhubIndustry,
        sector: symbol.companyProfile.gsector,
        logo: logo,
      };

      allData.push(data);
    }
    return { allData };
  } catch (error) {
    console.log(error);
    throw new Error("Error in fetching symbol data");
  }
};

module.exports = { symbolDataFun, portfolioData, onlySymbols };

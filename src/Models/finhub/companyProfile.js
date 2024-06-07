const mongoose = require("mongoose");

const CompanyProfileSchema = new mongoose.Schema({
  address: String,
  city: String,
  country: String,
  currency: String,
  cuip: String,
  sedol: String,
  description: String,
  employeeTotal: Number,
  exchange: String,
  group: String,
  gsector: String,
  gsubind: String,
  ipo: Date,
  isin: String,
  marketCapitalization: Number,
  naics: String,
  naicsNationalIndustry: String,
  naicsSector: String,
  naicsSubsector: String,
  name: String,
  phone: String,
  shareOutstanding: Number,
  state: String,
  ticker: String,
  weburl: String,
  logo: String,
  finnhubIndustry: String,
});

const CompanyProfile = mongoose.model(
  "CompanyProfile",
  CompanyProfileSchema,
  "CompanyProfile"
);

module.exports = CompanyProfile;

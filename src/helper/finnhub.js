const finnhub = require("finnhub");

const api_key = finnhub.ApiClient.instance.authentications["api_key"];
api_key.apiKey = "coek761r01qj17o6t7m0coek761r01qj17o6t7mg";
const finnhubClient = new finnhub.DefaultApi();

module.exports = finnhubClient;

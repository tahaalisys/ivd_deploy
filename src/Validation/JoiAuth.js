const joi = require("joi");

const registerSchemajoi = joi.object({
  email: joi.string().email().required(),
  name: joi.string().min(3).max(30).required(),
  password: joi
    .string()
    .required()
    .pattern(/^(?=.*[a-zA-Z0-9])(?=.*[\W_]).{8,}$/)
    .message(
      "Password must be at least 8 characters long and contain at least 1 symbol and 1 number"
    ),
  gmailToken: joi.string(),
  appleToken: joi.string(),
});

const loginSchemaJoi = joi.object({
  email: joi.string().email().required(),
  password: joi
    .string()
    .required()
    .pattern(/^(?=.*[a-zA-Z0-9])(?=.*[\W_]).{8,}$/)
    .message(
      "Password must be at least 8 characters long and contain at least 1 symbol and 1 number"
    ),
});

const portfolioStockSchema = joi.object({
  portfolio_Id: joi.string().required(), // Assuming portfolio_Id is a string, adjust if it's ObjectId
  symbol: joi.string().required(),
  noOfShare: joi.number().integer().min(1).required(), // Assuming the number of shares should be an integer greater than 0
  costPerShare: joi.number().min(0),
});

module.exports = { registerSchemajoi, loginSchemaJoi, portfolioStockSchema };

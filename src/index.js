const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swaggerConfig");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./Routes/auth");
const sessionRoutes = require("./Routes/session");
const calculteRoute = require("./Routes/calculation");
const snapTrade = require("./Routes/snapTrade");
const portFolio = require("./Routes/portfolio");
const finhub = require("./Routes/finhubData");

const app = express();

const { graphData } = require("./helper/cronJobForUserEmailVerification");
graphData.start();

app.use(cors({ origin: "*" }));
app.use(morgan("combined"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use(
  session({
    secret: process.env.JWT_SEC_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.status(200).send({ success: true, message: "server is running" });
});

app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
const mongooseDb = require("./DatabaseConfig/database");
mongooseDb();

// Passport configuration
require("./passport");

// Routes;
app.use("/auth", authRoutes);
app.use("/session", sessionRoutes);
app.use("/cal", calculteRoute);
app.use("/snapTrade", snapTrade);
app.use("/v1", portFolio);
app.use("/finhub", finhub);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

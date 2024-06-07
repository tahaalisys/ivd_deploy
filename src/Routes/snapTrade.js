const router = require("express").Router();
const snaptrade = require("../helper/snapTrade");

// auth

/**
 * @swagger
 * /snapTrade/createUser:
 *   post:
 *     summary: Create User
 *     tags: [SnapTrade Auth]
 *     description: Register a new user with SnapTrade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/createUser", async (req, res) => {
  try {
    const response = await snaptrade.authentication.registerSnapTradeUser({
      userId: req.body.userId,
    });

    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/login:
 *   post:
 *     summary: User Login
 *     tags: [SnapTrade Auth]
 *     description: Authenticate a user with SnapTrade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               userSecret:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/login", async (req, res) => {
  try {
    const { userId, userSecret } = req.body;

    const response = await snaptrade.authentication.loginSnapTradeUser({
      userId: userId,
      userSecret: userSecret,
    });
    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/users/list:
 *   get:
 *     summary: List Users
 *     tags: [SnapTrade Auth]
 *     description: Get a list of SnapTrade users
 *     responses:
 *       '200':
 *         description: Successfully retrieved user list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/users/list", async (req, res) => {
  try {
    const response = await snaptrade.authentication.listSnapTradeUsers();

    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/users/delete/{userId}:
 *   delete:
 *     summary: Delete User
 *     tags: [SnapTrade Auth]
 *     description: Delete a SnapTrade user by user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     responses:
 *       '200':
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.delete("/users/delete/:userId", async (req, res) => {
  try {
    const response = await snaptrade.authentication.deleteSnapTradeUser({
      userId: req.params.userId,
    });

    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/users/JWT/{userId}/{userSecret}:
 *   get:
 *     summary: Get User JWT
 *     tags: [SnapTrade Auth]
 *     description: Get JWT for a SnapTrade user by user ID and user secret
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The secret of the user
 *     responses:
 *       '200':
 *         description: JWT retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/users/JWT/:userId/:userSecret", async (req, res) => {
  try {
    const response = await snaptrade.authentication.getUserJwt({
      userId: req.params.userId,
      userSecret: req.params.userSecret,
    });

    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/new/user/secret/{userId}/{userSecret}:
 *   get:
 *     summary: Reset User Secret
 *     tags: [SnapTrade Auth]
 *     description: Reset user secret for a SnapTrade user by user ID and user secret
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The secret of the user
 *     responses:
 *       '200':
 *         description: User secret reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/new/user/secret/:userId/:userSecret", async (req, res) => {
  try {
    const response = await snaptrade.authentication.resetSnapTradeUserSecret({
      userId: req.params.userId,
      userSecret: req.params.userSecret,
    });

    res.status(200).send({ success: true, data: response.data });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error ",
      error: error,
    });
  }
});

//Connections

/**
 * @swagger
 * /snapTrade/user/brokerage/{userId}/{userSecret}:
 *   get:
 *     summary: List Brokerage Authorizations
 *     tags: [SnapTrade Connections]
 *     description: Get a list of brokerage authorizations for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The secret of the user
 *     responses:
 *       '200':
 *         description: Successfully retrieved brokerage authorizations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/user/brokerage/:userId/:userSecret", async (req, res) => {
  try {
    const response = await snaptrade.connections.listBrokerageAuthorizations({
      userId: req.params.userId,
      userSecret: req.params.userSecret,
    });

    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/delete/brokerage/{userId}/{userSecret}/{authorizationId}:
 *   delete:
 *     summary: Remove Brokerage Authorization
 *     tags: [SnapTrade Connections]
 *     description: Remove a brokerage authorization for a user by authorization ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The secret of the user
 *       - in: path
 *         name: authorizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the brokerage authorization to delete
 *     responses:
 *       '200':
 *         description: Brokerage authorization removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.delete(
  "/delete/brokerage/:userId/:userSecret/:authorizationId",
  async (req, res) => {
    try {
      const response = await snaptrade.connections.removeBrokerageAuthorization(
        {
          authorizationId: req.params.authorizationId,
          userId: req.params.userId,
          userSecret: req.params.userSecret,
        }
      );
      res.status(200).send({ success: true, data: response.data });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error ",
        error: error,
      });
    }
  }
);

/**
 * @swagger
 * /snapTrade/get/brokerage/authorization/{userId}/{userSecret}/{authorizationId}:
 *   get:
 *     summary: Get Brokerage Authorization Details
 *     tags: [SnapTrade Connections]
 *     description: Get details of a brokerage authorization for a user by authorization ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The secret of the user
 *       - in: path
 *         name: authorizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the brokerage authorization
 *     responses:
 *       '200':
 *         description: Successfully retrieved brokerage authorization details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get(
  "/get/brokerage/authorization/:userId/:userSecret/:authorizationId",
  async (req, res) => {
    try {
      console.log("started", req.params.authorizationId);
      console.log(!req.params.authorizationId);
      if (!req.params.authorizationId) {
        return res
          .status(400)
          .send({ success: false, message: "AuthorizationId is required" });
      }
      const response = await snaptrade.connections.detailBrokerageAuthorization(
        {
          authorizationId: req.params.authorizationId,
          userId: req.params.userId,
          userSecret: req.params.userSecret,
        }
      );
      res.status(200).send({ success: true, data: response.data });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error ",
        error: error,
      });
    }
  }
);

//account info

/**
 * @swagger
 * /List/accounts/{userId}/{userSecret}:
 *   get:
 *     summary: List User Accounts
 *     tags: [SnapTrade Account]
 *     description: Retrieve a list of user accounts
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The user secret
 *     responses:
 *       200:
 *         description: Successful response with user account data
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
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get("/List/accounts/:userId/:userSecret", async (req, res) => {
  try {
    const response = await snaptrade.accountInformation.listUserAccounts({
      userId: req.params.userId,
      userSecret: req.params.userSecret,
    });

    res.status(200).send({ success: true, data: response.data });
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
 * /list/balances/{userId}/{userSecret}/{accountId}:
 *   get:
 *     summary: List Account Balances
 *     tags: [SnapTrade Account]
 *     description: Retrieve balances for a specific account
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The user secret
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *     responses:
 *       200:
 *         description: Successful response with account balance data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get(
  "/list/balances/:userId/:userSecret/:accountId",
  async (req, res) => {
    try {
      const response = await snaptrade.accountInformation.getUserHoldings({
        accountId: req.params.accountId,
        userId: req.params.userId,
        userSecret: req.params.userSecret,
      });

      res.status(200).send({ success: true, data: response.data });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error ",
        error: error,
      });
    }
  }
);

/**
 * @swagger
 * /return/details/{userId}/{userSecret}/{accountId}:
 *   get:
 *     summary: Return Account Details
 *     tags: [SnapTrade Account]
 *     description: Retrieve details for a specific account
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The user secret
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *     responses:
 *       200:
 *         description: Successful response with account details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get(
  "/return/details/:userId/:userSecret/:accountId",
  async (req, res) => {
    try {
      const response = await snaptrade.accountInformation.getUserHoldings({
        accountId: req.params.accountId,
        userId: req.params.userId,
        userSecret: req.params.userSecret,
      });

      res.status(200).send({ success: true, data: response.data });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error ",
        error: error,
      });
    }
  }
);

/**
 * @swagger
 * /account/balances/{userId}/{userSecret}/{accountId}:
 *   get:
 *     summary: Get Account Balances
 *     tags: [SnapTrade Account]
 *     description: Retrieve balances for a specific account
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The user secret
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *     responses:
 *       200:
 *         description: Successful response with account balances
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get(
  "/account/balances/:userId/:userSecret/:accountId",
  async (req, res) => {
    try {
      const response = await snaptrade.accountInformation.getUserAccountBalance(
        {
          accountId: req.params.accountId,
          userId: req.params.userId,
          userSecret: req.params.userSecret,
        }
      );

      res.status(200).send({ success: true, data: response.data });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error ",
        error: error,
      });
    }
  }
);

/**
 * @swagger
 * /account/positions/{userId}/{userSecret}/{accountId}:
 *   get:
 *     summary: Get Account Positions
 *     tags: [SnapTrade Account]
 *     description: Retrieve positions for a specific account
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The user secret
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *     responses:
 *       200:
 *         description: Successful response with account positions
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
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get(
  "/account/positions/:userId/:userSecret/:accountId",
  async (req, res) => {
    try {
      const response =
        await snaptrade.accountInformation.getUserAccountPositions({
          accountId: req.params.accountId,
          userId: req.params.userId,
          userSecret: req.params.userSecret,
        });

      res.status(200).send({ success: true, data: response.data });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error ",
        error: error,
      });
    }
  }
);

/**
 * @swagger
 * /account/orders/{userId}/{userSecret}/{accountId}:
 *   get:
 *     summary: Get Account Orders
 *     tags: [SnapTrade Account]
 *     description: Retrieve orders for a specific account
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The user secret
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *     responses:
 *       200:
 *         description: Successful response with account orders
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
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get(
  "/account/orders/:userId/:userSecret/:accountId",
  async (req, res) => {
    try {
      const response = await snaptrade.accountInformation.getUserAccountOrders({
        accountId: req.params.accountId,
        userId: req.params.userId,
        userSecret: req.params.userSecret,
      });

      res.status(200).send({ success: true, data: response.data });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error ",
        error: error,
      });
    }
  }
);

// trading
/**
 * @swagger
 * /snapTrade/get/symbol/{userId}/{userSecret}/{accountId}/{symbols}:
 *   get:
 *     summary: Get User Account Quotes
 *     tags: [SnapTrade Trading]
 *     description: Get quotes for specified symbols in a user's account
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The secret of the user
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user's account
 *       - in: path
 *         name: symbols
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated list of symbols to get quotes for
 *     responses:
 *       '200':
 *         description: Successfully retrieved quotes for specified symbols
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get(
  "/get/symbol/:userId/:userSecret/:accountId/:symbols",
  async (req, res) => {
    try {
      const response = await snaptrade.trading.getUserAccountQuotes({
        accountId: req.params.accountId,
        userId: req.params.userId,
        userSecret: req.params.userSecret,
        symbols: req.params.symbols,
      });
      res.status(200).send({ success: true, data: response.data });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error ",
        error: error,
      });
    }
  }
);

/**
 * @swagger
 * /snapTrade/impact/trade/{userId}/{userSecret}:
 *   post:
 *     summary: Get Order Impact
 *     tags: [SnapTrade Trading]
 *     description: Get the impact of an order
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The secret of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define your request body properties here
 *     responses:
 *       '200':
 *         description: Successfully retrieved order impact
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/impact/trade/:userId/:userSecret", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const response = await snaptrade.trading.getOrderImpact({
      userId: "DIMENSIONALSYS",
      userSecret: "4El2ewoP2tFPHSsspHT426EHPT9fHqqlKIMQzfuKjeyZlrRDLA",
      ...data,
    });
    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/place/order/{userId}/{userSecret}:
 *   post:
 *     summary: Place Order
 *     tags: [SnapTrade Trading]
 *     description: Place an order
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The secret of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define your request body properties here
 *     responses:
 *       '200':
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/place/order/:userId/:userSecret", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    if (!data.tradeId) {
      return res
        .status(400)
        .send({ success: false, message: "Trade Id is required" });
    }
    const response = await snaptrade.trading.placeOrder({
      userId: req.params.userId,
      userSecret: req.params.userSecret,
      ...data,
    });
    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/trade/no/validation/{userId}/{userSecret}:
 *   post:
 *     summary: Place Force Order
 *     tags: [SnapTrade Trading]
 *     description: Place a force order without validation
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The secret of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define your request body properties here
 *     responses:
 *       '200':
 *         description: Force order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/trade/no/validation/:userId/:userSecret", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    if (!data.account_id) {
      return res
        .status(400)
        .send({ success: false, message: "account Id is required" });
    }
    const response = await snaptrade.trading.placeForceOrder({
      userId: req.params.userId,
      userSecret: req.params.userSecret,
      ...data,
    });
    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/cancle/open/order/{userId}/{userSecret}:
 *   post:
 *     summary: Cancel Open Order
 *     tags: [SnapTrade Trading]
 *     description: Cancel an open order
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The secret of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define your request body properties here
 *     responses:
 *       '200':
 *         description: Order canceled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/cancle/open/order/:userId/:userSecret", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    if (!data.accountId) {
      return res
        .status(400)
        .send({ success: false, message: "account Id is required" });
    }
    const response = await snaptrade.trading.cancelUserAccountOrder({
      userId: req.params.userId,
      userSecret: req.params.userSecret,
      ...data,
    });
    res.status(200).send({ success: true, data: response.data });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error ",
      error: error,
    });
  }
});

// transactions and reporting
/**
 * @swagger
 * /snapTrade/transaction/history/{userId}/{userSecret}:
 *   get:
 *     summary: Get Transaction History
 *     tags: [SnapTrade Transactions]
 *     description: Get transaction history for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The secret of the user
 *       - in: query
 *         name: // Define your query parameters here
 *         schema:
 *           type: string
 *         description: Query parameters for filtering transaction history
 *     responses:
 *       '200':
 *         description: Successfully retrieved transaction history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/transaction/history/:userId/:userSecret", async (req, res) => {
  try {
    const data = req.query;

    console.log(data);
    const response = await snaptrade.transactionsAndReporting.getActivities({
      userId: req.params.userId,
      userSecret: req.params.userSecret,
      ...data,
    });
    res.status(200).send({ success: true, data: response.data });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error ",
      error: error,
    });
  }
});

// reference Data

/**
 * @swagger
 * /snapTrade/metadata/Snaptrade:
 *   get:
 *     summary: Get Snaptrade Metadata
 *     tags: [SnapTrade Reference Data]
 *     description: Get metadata information about Snaptrade
 *     responses:
 *       '200':
 *         description: Successfully retrieved Snaptrade metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/metadata/Snaptrade", async (req, res) => {
  try {
    const response = await snaptrade.referenceData.getPartnerInfo();

    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/symbols/acc/{userId}/{userSecret}:
 *   post:
 *     summary: Search Symbols for User Account
 *     tags: [SnapTrade Reference Data]
 *     description: Search symbols for a user account
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The secret of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define your request body properties here
 *     responses:
 *       '200':
 *         description: Successfully retrieved symbols for user account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/symbols/acc/:userId/:userSecret", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    if (!data.accountId) {
      return res
        .status(400)
        .send({ success: false, message: "Account Id is required" });
    }
    const response = await snaptrade.referenceData.symbolSearchUserAccount({
      userId: req.params.userId,
      userSecret: req.params.userSecret,
      ...data,
    });
    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/list/brokerage/auth/type:
 *   get:
 *     summary: List All Brokerage Authorization Types
 *     tags: [SnapTrade Reference Data]
 *     description: Get a list of all brokerage authorization types
 *     responses:
 *       '200':
 *         description: Successfully retrieved list of brokerage authorization types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/list/brokerage/auth/type", async (req, res) => {
  try {
    const response =
      await snaptrade.referenceData.listAllBrokerageAuthorizationType();

    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/list/currencies:
 *   get:
 *     summary: List All Currencies
 *     tags: [SnapTrade Reference Data]
 *     description: Get a list of all currencies
 *     responses:
 *       '200':
 *         description: Successfully retrieved list of currencies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/list/currencies", async (req, res) => {
  try {
    const response = await snaptrade.referenceData.listAllCurrencies();

    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/list/currencies/exchange:
 *   get:
 *     summary: Get Exchange Rates for Currencies
 *     tags: [SnapTrade Reference Data]
 *     description: Retrieve exchange rates for currencies
 *     responses:
 *       200:
 *         description: Successful response with currency exchange rates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get("/list/currencies/exchange", async (req, res) => {
  try {
    const response = await snaptrade.referenceData.listAllCurrenciesRates();

    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/exchange/rate/pair/{currencyPair}:
 *   get:
 *     summary: Get Exchange Rate for Currency Pair
 *     tags: [SnapTrade Reference Data]
 *     description: Retrieve exchange rate for a specific currency pair
 *     parameters:
 *       - in: path
 *         name: currencyPair
 *         required: true
 *         schema:
 *           type: string
 *         description: The currency pair (e.g., USD/EUR)
 *     responses:
 *       200:
 *         description: Successful response with exchange rate for the specified currency pair
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get("/exchange/rate/pair/:currencyPair", async (req, res) => {
  try {
    const response = await snaptrade.referenceData.getCurrencyExchangeRatePair({
      currencyPair: req.params.currencyPair,
    });

    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/list/exchange:
 *   get:
 *     summary: Get List of Stock Exchanges
 *     tags: [SnapTrade Reference Data]
 *     description: Retrieve a list of stock exchanges
 *     responses:
 *       200:
 *         description: Successful response with the list of stock exchanges
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
 *                     type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get("/list/exchange", async (req, res) => {
  try {
    const response = await snaptrade.referenceData.getStockExchanges();

    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/list/security/type:
 *   get:
 *     summary: Get List of Security Types
 *     tags: [SnapTrade Reference Data]
 *     description: Retrieve a list of security types
 *     responses:
 *       200:
 *         description: Successful response with the list of security types
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
 *                     type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get("/list/security/type", async (req, res) => {
  try {
    const response = await snaptrade.referenceData.getSecurityTypes();
    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/list/symbols:
 *   post:
 *     summary: Get Symbols by Substring
 *     tags: [SnapTrade Reference Data]
 *     description: Retrieve symbols based on a substring
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               substring:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with the list of symbols
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
 *                     type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */

router.post("/list/symbols", async (req, res) => {
  try {
    const response = await snaptrade.referenceData.getSymbols({
      substring: req.body.substring,
    });
    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/symbol/ticker/{query}:
 *   get:
 *     summary: Get Symbols by Ticker
 *     tags: [SnapTrade Reference Data]
 *     description: Retrieve symbols based on a ticker query
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with the list of symbols
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
 *                     type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get("/symbol/ticker/:query", async (req, res) => {
  try {
    const response = await snaptrade.referenceData.getSymbolsByTicker({
      query: req.params.query,
    });
    res.status(200).send({ success: true, data: response.data });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error ",
      error: error,
    });
  }
});

//options
/**
 * @swagger
 * /snapTrade/holdings/acc/{userId}/{userSecret}/{accountId}:
 *   get:
 *     summary: Get Option Holdings for Account
 *     tags: [SnapTrade Options]
 *     description: Retrieve option holdings for a specific account
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The user secret
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *     responses:
 *       200:
 *         description: Successful response with option holdings data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get("/holdings/acc/:userId/:userSecret/:accountId", async (req, res) => {
  try {
    const response = await snaptrade.options.listOptionHoldings({
      userId: req.params.userId,
      userSecret: req.params.userSecret,
      accountId: req.params.accountId,
    });
    res.status(200).send({ success: true, data: response.data });
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
 * /snapTrade/chain/{userId}/{userSecret}/{accountId}/{symbol}:
 *   get:
 *     summary: Get Options Chain for Symbol
 *     tags: [SnapTrade Options]
 *     description: Retrieve options chain for a specific symbol and account
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The user secret
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: The symbol for which options chain is requested
 *     responses:
 *       200:
 *         description: Successful response with options chain data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get(
  "/chain/:userId/:userSecret/:accountId/:symbol",
  async (req, res) => {
    try {
      const response = await snaptrade.options.getOptionsChain({
        userId: req.params.userId,
        userSecret: req.params.userSecret,
        accountId: req.params.accountId,
        symbol: req.params.symbol,
      });
      res.status(200).send({ success: true, data: response.data });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error ",
        error: error,
      });
    }
  }
);

/**
 * @swagger
 * /snapTrade/create/strategy/{userId}/{userSecret}/{accountId}:
 *   post:
 *     summary: Create Option Strategy
 *     tags: [SnapTrade Options]
 *     description: Create an option strategy for a specific account
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The user secret
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               underlying_symbol_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with created option strategy data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.post(
  "/create/strategy/:userId/:userSecret/:accountId",
  async (req, res) => {
    try {
      const data = req.body;

      if (!data.underlying_symbol_id) {
        return res.status(400).send({
          success: false,
          message: "underlying symbol id is required",
        });
      }

      const response = await snaptrade.options.getOptionStrategy({
        accountId: req.params.accountId,
        userId: req.params.userId,
        userSecret: req.params.userSecret,
        ...data,
      });
      res.status(200).send({ success: true, data: response.data });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error ",
        error: error,
      });
    }
  }
);

/**
 * @swagger
 * /snapTrade/latest/marketData/strategy/{userId}/{userSecret}/{accountId}/{optionStrategyId}:
 *   get:
 *     summary: Get Latest Market Data for Option Strategy
 *     tags: [SnapTrade Options]
 *     description: Retrieve the latest market data for a specific option strategy
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The user secret
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *       - in: path
 *         name: optionStrategyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The option strategy ID
 *     responses:
 *       200:
 *         description: Successful response with latest market data for the option strategy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.get(
  "/latest/marketData/strategy/:userId/:userSecret/:accountId/:optionStrategyId",
  async (req, res) => {
    try {
      const response = await snaptrade.options.listOptionHoldings({
        userId: req.params.userId,
        userSecret: req.params.userSecret,
        accountId: req.params.accountId,
        optionStrategyId: req.params.optionStrategyId,
      });
      res.status(200).send({ success: true, data: response.data });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error ",
        error: error,
      });
    }
  }
);

/**
 * @swagger
 * /snapTrade/option/strategy/brokerage/{userId}/{userSecret}/{accountId}/{optionStrategyId}:
 *   post:
 *     summary: Place Order for Option Strategy
 *     tags: [SnapTrade Options]
 *     description: Place an order for a specific option strategy
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: userSecret
 *         required: true
 *         schema:
 *           type: string
 *         description: The user secret
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The account ID
 *       - in: path
 *         name: optionStrategyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The option strategy ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_type:
 *                 type: string
 *               time_in_force:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response with placed order data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 */
router.post(
  "/option/strategy/brokerage/:userId/:userSecret/:accountId/:optionStrategyId",
  async (req, res) => {
    try {
      const data = req.body;

      if (!data.order_type && !data.time_in_force) {
        return res.status(400).send({
          success: false,
          message: "Order type and Time in Force is required",
        });
      }

      const response = await snaptrade.options.getOptionStrategy({
        accountId: req.params.accountId,
        userId: req.params.userId,
        userSecret: req.params.userSecret,
        optionStrategyId: req.params.optionStrategyId,
        ...data,
      });
      res.status(200).send({ success: true, data: response.data });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error ",
        error: error,
      });
    }
  }
);

module.exports = router;

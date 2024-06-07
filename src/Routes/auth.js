const router = require("express").Router();
const { registerSchemajoi } = require("../Validation/JoiAuth.js");
const bcrypt = require("bcrypt");
const User = require("../Models/users.js");
const jwt = require("jsonwebtoken");
const { AuthMiddleware } = require("../middleware/JWTverification.js");
const isPasswordComplex = require("../helper/passwordComplexcity.js");
const fs = require("fs");
const cloudinary = require("../helper/cloudinary.js");
const upload = require("../helper/multer.js");
const passport = require("passport");
const {
  sendVerificationEmail,
  sendForgotPass,
  twoStepVerification,
} = require("../helper/emailSetups.js");
const rateLimit = require("../middleware/rateLimit.js");
const snaptrade = require("../helper/snapTrade.js");
const WatchList = require("../Models/watchlist.js");
const SymbolsData = require("../Models/symboldata.js");
const Notification = require("../Models/notifications.js");

router.get("/facebook", passport.authenticate("facebook"));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SEC_USER);

    res
      .status(200)
      .send({ success: true, message: "user login", token: token });
  }
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback/",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SEC_USER);

    const data = {
      name: req.user.name,
      email: req.user.email,
      emailVerify: req.user.emailVerify,
      profilePic: req.user.profilePic ? req.user.profilePic : "",
    };

    res.status(200).send({
      success: true,
      message: "You are loged-In",
      data: data,
      token: token,
    });
  }
);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Register a new user with provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               gmailToken:
 *                 type: string
 *               appleToken:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "you are register successfully!"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: array
 *                   items:
 *                     type: string
 *               example:
 *                 success: false
 *                 message:
 *                   - "Invalid input: 'name' is required"
 *                   - "Invalid input: 'email' is required"
 *                   - "Invalid input: 'password' is required"
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
 *                 error:
 *                   type: object
 */
router.post("/register", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const result = registerSchemajoi.validate(data, {
      abortEarly: false,
    });

    if (result.error) {
      const x = result.error.details.map((error) => error.message);
      return res.status(400).json({
        success: false,
        message: x,
      });
    }
    const existingEmail = await User.findOne({ email: result.value.email });

    if (existingEmail)
      return res
        .status(400)
        .send({ success: false, message: "Email is already registered!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(result.value.password, salt);

    const response = await snaptrade.authentication.registerSnapTradeUser({
      userId: result.value.email,
    });
    const newUser = await User({
      name: result.value.name,
      email: result.value.email,
      password: hashedPassword,
      gmailToken: result.value.gmailToken,
      appleToken: result.value.appleToken,
      snaptradeSec: response.data.userSecret,
      twoStepCode: false,
    });

    await newUser.save();

    let tokens = jwt.sign({ userId: newUser._id }, process.env.JWT_SEC_USER);

    res.status(200).send({
      success: true,
      message: "you are register successfully!",
      data: newUser,
      token: tokens,
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
 * /auth/mailForEmailVerification:
 *   post:
 *     summary: Send email for email verification
 *     tags: [Auth]
 *     description: Sends an email for email verification to the provided email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       '200':
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email has been sent successfully"
 *       '400':
 *         description: Bad Request
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
 *                   example: "Email is required"
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
 *                 error:
 *                   type: object
 */
router.post("/mailForEmailVerificaiton", rateLimit, async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res
        .status(400)
        .send({ succes: false, message: "Email is required" });
    }

    const token = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "No user found !" });
    }

    let verificationToken = jwt.sign(
      { userId: user._id, token },
      process.env.JWT_SEC_VER,
      { expiresIn: "2d" }
    );

    user.emailVerifyToken = token;

    await sendVerificationEmail(user.email, user.name, verificationToken);

    await user.save();

    res
      .status(200)
      .send({ success: true, message: "Email has been sent successfully" });
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
 * /auth/verifyEmail:
 *   get:
 *     summary: Verify user's email
 *     tags: [Auth]
 *     description: Verify user's email using the provided verification link
 *     parameters:
 *       - in: query
 *         name: link
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email verified successfully"
 *       '400':
 *         description: Bad Request
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
 *                   example: "Token is Expired!"
 *       '404':
 *         description: Not Found
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
 *                   example: "No user found!"
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
 *                 error:
 *                   type: object
 */
router.get("/verifyEmail", async (req, res) => {
  try {
    const link = req.query.link;
    console.log(link);

    // const splits = await link.split("=");
    // console.log("splits===>", splits);
    // const verify = splits[1].toString();
    // const jwtVerify = jwt.verify(verify, process.env.JWT_SEC_VER);
    const jwtVerify = jwt.verify(link.toString(), process.env.JWT_SEC_VER);

    let dateNow = new Date();
    if (jwtVerify.exp < dateNow.getTime() / 1000) {
      return res
        .status(400)
        .send({ success: false, message: "Token is Expire!" });
    }

    const userId = jwtVerify.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "No user found!" });
    }

    if (user.emailVerifyToken != jwtVerify.token) {
      return res.status(400).send({
        success: false,
        message: "Something went wrong",
      });
    }

    const userTrailExp = new Date(dateNow.getTime() + 7 * 24 * 60 * 60 * 1000);

    user.trailEndDate = userTrailExp;
    user.emailVerify = true;
    user.emailVerifyToken = null;

    await user.save();

    res
      .status(200)
      .send({ success: true, message: "Email verify successfully" });
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
 * /auth/login:
 *   post:
 *     summary: User Login
 *     tags: [Auth]
 *     description: Log in with provided email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "You are logged in"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       '400':
 *         description: Bad Request
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
 *                   example: "Email or Password is required"
 *       '404':
 *         description: Not Found
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
 *                   example: "This email is not registered."
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
 *                 error:
 *                   type: object
 */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .send({ success: false, message: "Email or Password is required" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Incorrect login credentials!",
      });
    }
    if (!user.password) {
      return res.status(400).send({
        success: false,
        message: "Incorrect login credentials!",
      });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send({
        success: false,
        message: "Incorrect login credentials!",
      });
    }
    if (user.twoStepVerif == true) {
      console.log("start");
      const token = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      const email = user.email;
      const name = user.name;
      twoStepVerification(email, name, token);
      user.towStepCode = token;
      user.save();
      return res
        .status(200)
        .send({ success: true, data: { twoStepVerif: user.twoStepVerif } });
    }

    let token = jwt.sign({ userId: user._id }, process.env.JWT_SEC_USER);

    const data = {
      name: user.name,
      email: user.email,
      emailVerify: user.emailVerify,
      twoStepVerif: user.twoStepVerif,
      profilePic: user.profilePic ? user.profilePic : "",
    };

    res.status(200).send({
      success: true,
      message: "You are loged-In",
      data: data,
      token: token,
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

router.get("/user/detail", AuthMiddleware, async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).send({ success: true, data: user });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: "Internal server error", error: error });
  }
});

/**
 * @swagger
 * /auth/forgetPassword:
 *   post:
 *     summary: Forgot Password
 *     tags: [Auth]
 *     description: Request to reset password by sending a verification email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       '200':
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email has been sent successfully"
 *       '404':
 *         description: Not Found
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
 *                   example: "No user found on that Id"
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
 *                 error:
 *                   type: object
 */
router.post("/forgetPassword", async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res
        .status(404)
        .send({ succes: false, message: "You have to add email." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(200)
        .send({ succes: false, message: "No user found on that Id" });
    }

    const token = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    let verificationToken = jwt.sign(
      { userId: user._id, token },
      process.env.JWT_SEC_VER,
      { expiresIn: "2d" }
    );

    user.forgotPassToken = token;

    // Send verification email
    await sendForgotPass(user.email, user.name, verificationToken);

    await user.save();

    res
      .status(200)
      .send({ success: true, message: "Email has been sended successfully" });
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
 * /auth/resetPassword:
 *   put:
 *     summary: Reset Password
 *     tags: [Auth]
 *     description: Reset user's password using the provided verification link
 *     parameters:
 *       - in: query
 *         name: link
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *             required:
 *               - password
 *     responses:
 *       '200':
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password Updated Successfully"
 *       '400':
 *         description: Bad Request
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
 *                   example: "Password must need minimum 8 characters and 1 special character and 1 number at least"
 *       '404':
 *         description: Not Found
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
 *                   example: "No user found!"
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
 *                 error:
 *                   type: object
 */
router.put("/resetPassword", async (req, res) => {
  try {
    const link = req.query.link;
    const password = req.body.password;

    if (!isPasswordComplex(password)) {
      return res.status(400).json({
        success: false,
        message:
          "password must need minumum 8 characters and 1 special character and 1 number altest",
      });
    }

    const splits = await link.split("-");
    const verify = splits[1].toString();

    const jwtVerify = jwt.verify(verify, process.env.JWT_SEC_VER);
    const dateNow = new Date();
    if (jwtVerify.exp < dateNow.getTime() / 1000) {
      return res
        .status(400)
        .send({ success: false, message: "Token is Expire!" });
    }

    const user = await User.findById(jwtVerify.userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "No user found!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    user.password = hashPassword;
    user.forgotPassToken = null;

    await user.save();

    res
      .status(200)
      .send({ success: true, message: "Password Updated Successfuly" });
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
 * /auth/updateUser:
 *   put:
 *     summary: Update User
 *     tags: [Auth]
 *     description: Update user details including name and password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *       '400':
 *         description: Bad Request
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
 *                   example: "Password must need minumum 8 characters and 1 special character and 1 number at least"
 *       '401':
 *         description: Unauthorized
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
 *                   example: "Unauthorized access"
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
 *                 error:
 *                   type: object
 */
router.put("/updateUser", AuthMiddleware, async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = req.user;

    user.name = name || user.name;

    if (password) {
      if (!isPasswordComplex(password)) {
        return res.status(400).json({
          success: false,
          message:
            "Password must need minumum 8 characters and 1 special character and 1 number altest",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      console.log("hashpassword: ", hashedPassword);
      user.password = hashedPassword;
    }

    await user.save();

    res
      .status(200)
      .send({ success: true, message: "User updated successfully" });
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
 * /auth/profile/pic:
 *   put:
 *     summary: Update Profile Picture
 *     tags: [Auth]
 *     description: Update user's profile picture
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               ProfilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Profile picture added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile pic added successfully"
 *                 profilePic:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/path/to/profilePic.jpg"
 *       '400':
 *         description: Bad Request
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
 *                   example: "Upload a profile pic"
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
 *                 error:
 *                   type: object
 */
router.put(
  "/profile/pic",
  upload.array("ProfilePic", 1),
  AuthMiddleware,
  async (req, res) => {
    const files = req.files;
    const attachArtwork = [];
    try {
      if (!files && !files.length > 0) {
        return res
          .status(400)
          .send({ success: false, message: "Upload a profile pic" });
      } else {
        for (const file of files) {
          const { path } = file;
          try {
            const uploader = await cloudinary.uploader.upload(path, {
              folder: "ivy-Dividends",
              resource_type: "image",
            });
            console.log(uploader);
            attachArtwork.push({ url: uploader.secure_url });
            fs.unlinkSync(path);
          } catch (err) {
            if (attachArtwork.length > 0) {
              const imgs = attachArtwork.map((obj) => obj.public_id);
              cloudinary.api.delete_resources(imgs);
            }
            console.log(err);
          }
        }
      }

      const user = req.user;

      user.profilePic = attachArtwork[0].url || user.profilePic;

      await user.save();

      res.status(200).send({
        success: true,
        message: "Profile pic added successfully",
        profilePic: attachArtwork[0].url,
      });
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

router.get("/addWatchlist/:symbol", AuthMiddleware, async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const user = req.user;
    if (symbol == ":SYMBOL") {
      return res
        .status(200)
        .send({ success: true, message: "You have send the symbol value" });
    }
    let watch = await WatchList.findOne({ userId: user._id });
    const symbols = await SymbolsData.findOne({ symbol: symbol });
    if (!symbols) {
      return res
        .status(400)
        .send({ success: false, message: "This symbol is not valid" });
    }
    if (!watch) {
      watch = new WatchList({
        userId: user._id,
        watchlist: [symbol],
      });
      await watch.save();

      user.watchlist = watch._id;
      await user.save();
      return res.status(200).send({
        success: true,
        message: `${symbol} added to your watchlist`,
      });
    }

    if (watch.watchlist.includes(symbol)) {
      watch.watchlist = watch.watchlist.filter((item) => item !== symbol);
      await watch.save();
      return res.status(200).send({
        success: true,
        message: `${symbol} removed from your watchlist`,
      });
    } else {
      watch.watchlist.push(symbol);
      await watch.save();
      return res.status(200).send({
        success: true,
        message: `${symbol} added to your watchlist`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.get("/get/watchlist", AuthMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const watch = await WatchList.findOne({ userId: user._id });
    console.log(watch);
    if (!watch) {
      return res.status(200).send({ success: true, data: [] });
    }

    const data = await Promise.all(
      watch.watchlist.map(async (symbolKey) => {
        const symbol = await SymbolsData.findOne({ symbol: symbolKey });

        if (!symbol || symbol.data.length < 2) {
          throw new Error(`Insufficient data entries for symbol: ${symbolKey}`);
        }

        const differenceInCurrency =
          symbol.data[0].close - symbol.data[1].close;
        const ratio = (differenceInCurrency * 100) / symbol.data[1].close;
        const logoUrl = symbol.companyProfile.logo
          ? symbol.companyProfile.logo.replace(/\.svg$/, ".png")
          : null;

        return {
          companyName: symbol.companyName,
          ticker: symbol.symbol,
          logo: logoUrl,
          currentPrices: symbol.data[0].close,
          differenceInPercentage: ratio,
          differenceInCurrency: differenceInCurrency,
        };
      })
    );

    const responseData = {
      _id: watch._id,
      userId: watch.userId,
      watchlist: data,
      recentlyWatch: watch.recentlyWatch,
    };

    return res.status(200).send({ success: true, data: responseData });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.put("/update/towStep", AuthMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (user.twoStepVerif == false) {
      user.twoStepVerif = true;
    } else {
      user.twoStepCode = false;
    }
    await user.save();
    return res
      .status(200)
      .send({ success: true, twoStepVerif: user.twoStepVerif });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;

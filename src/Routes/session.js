const {
  basicAuth,
  AuthMiddleware,
} = require("../middleware/JWTverification.js");
const UserSession = require("../Models/session.js");
const geo = require("geoip-lite");
const jwt = require("jsonwebtoken");
const Users = require("../Models/users.js");

const router = require("express").Router();

/**
 * @swagger
 * tags:
 *   name: Session
 *   description: For device session of the users
 */

/**
 * @swagger
 * /session/device:
 *   post:
 *     summary: Add Device
 *     tags: [Session]
 *     description: Add device details and generate token
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceId:
 *                 type: string
 *               deviceName:
 *                 type: string
 *               deviceType:
 *                 type: string
 *               deviceBrand:
 *                 type: string
 *               ipAddress:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Device data is saved
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
 *                   example: "Device data is saved"
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
 *                   example: "Ip is wrong"
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
 */
router.post("/device", basicAuth, async (req, res) => {
  try {
    const session = req.body;
    const token = jwt.sign(
      { userId: req.user._id, deviceId: session.deviceId },
      process.env.JWT_SEC_USER
    );
    // const locationCre = geo.lookup(session.ipAddress);
    const locationCre = geo.lookup(session.ipAddress);

    if (!locationCre) {
      return res.status(404).send({ success: false, message: "Ip is wronge" });
    }
    const location = `${locationCre.timezone.split("/")[1]}, ${
      locationCre.country
    }`;

    const alreadyUseDevice = await UserSession.findOne({
      deviceId: session.deviceId,
      userId: req.user._id,
    });
    let newDevice = UserSession({
      userId: req.user._id,
      deviceId: session.deviceId,
      applicationName: session.applicationName,
      deviceName: session.deviceName,
      deviceType: session.deviceType,
      deviceBrand: session.deviceBrand,
      ipAddress: session.ipAddress,
      location: location,
      token: token,
    });

    req.user.token.push(token);
    await req.user.save();

    await newDevice.save();

    return res.status(200).send({
      success: true,
      message: "Device data is saved",
      _id: newDevice._id,
      token,
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
 * /all/session/device:
 *   get:
 *     summary: Get All Devices
 *     tags: [Session]
 *     description: Retrieve all devices for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved device data
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
 *                   example: "Following are the data of requested user."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       deviceId:
 *                         type: string
 *                       deviceName:
 *                         type: string
 *                       deviceBrand:
 *                         type: string
 *                       deviceType:
 *                         type: string
 *                       ipAddress:
 *                         type: string
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
 */
router.get("/all/device", AuthMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const allSession = await UserSession.find({ userId: user._id });

    const data = [];
    for (let I = 0; I < allSession.length; I++) {
      const element = allSession[I];
      const dataOfOne = {
        _id: element._id,
        deviceId: element.deviceId,
        applicationName: element.applicationName,
        deviceName: element.deviceName,
        deviceBrand: element.deviceBrand,
        deviceType: element.deviceType,
        ipAddress: element.ipAddress,
        localtion: element.location,
        time: element.updatedAt,
      };
      data.push(dataOfOne);
    }

    return res.status(200).send({
      success: true,
      message: "Following are the data of requested user.",
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
 * /session/delete/device/{deviceId}:
 *   delete:
 *     summary: Delete Device
 *     tags: [Session]
 *     description: Delete a device for the authenticated user by device ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the device to delete
 *     responses:
 *       '200':
 *         description: Device deleted
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
 *                   example: "Device deleted."
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
 */
router.delete("/delete/device/:deviceId", AuthMiddleware, async (req, res) => {
  try {
    const device = await UserSession.findByIdAndDelete({
      _id: req.params.deviceId,
    });

    const token = device.token;
    const tokenIndex = req.user.token.indexOf(token);
    if (tokenIndex === -1) {
      return res
        .status(404)
        .send({ success: false, message: "No Token found" });
    }
    req.user.token.splice(tokenIndex, 1);

    // Save the updated portfolio
    req.user.save();

    res.status(200).send({ success: true, message: "Device deleted." });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error ",
      error: error,
    });
  }
});

router.delete("/delete/all/device", AuthMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const session = req.session;

    const allsession = await UserSession.find({ userId: user._id });

    // Filter out sessions that match the authorization token
    const activeSession = allsession.filter(
      (session) => session.token === req.headers.authorization.split(" ")[1]
    );

    // Remove all sessions for the userId except the active session
    await UserSession.deleteMany({
      userId: user._id,
      token: { $ne: req.headers.authorization.split(" ")[1] },
    });

    // Update user's token array with only the active session token
    user.token = activeSession.map((session) => session.token);

    // Save the updated user object
    await user.save();

    res
      .status(200)
      .send({ success: true, message: "Tokens removed successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: "Internal server error", error: error });
  }
});

router.get("/", AuthMiddleware, (req, res) => {
  try {
    res
      .status(200)
      .send({ success: true, message: "token validated successfully" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

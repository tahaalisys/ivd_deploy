const requestTimestamps = new Map();

const rateLimit = (req, res, next) => {
  const ipAddress = req.ip;

  if (requestTimestamps.has(ipAddress)) {
    const lastRequestTime = requestTimestamps.get(ipAddress);
    const currentTime = Date.now();

    if (currentTime - lastRequestTime < 30000) {
      let sec = Math.max(
        0,
        30 - Math.floor((currentTime - lastRequestTime) / 1000)
      );
      return res.status(429).json({
        success: false,
        message: `You have to wait ${sec} seconds before making another request`,
      });
    }
  }

  requestTimestamps.set(ipAddress, Date.now());

  next();
};

module.exports = rateLimit;

const nodemailer = require("nodemailer");

const sendResetEmail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });
  const mailOptions = {
    from: `"IVD-Dividends" ${process.env.USER}`,
    to: email,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Email error:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = sendResetEmail;

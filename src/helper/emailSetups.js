// middleware/emailService.js

const sendEmail = require("./emailSend");

async function sendVerificationEmail(email, name, verificationToken) {
  try {
    const emailVerifyLink = `https://broadly-certain-beetle.ngrok-free.app/auth/verifyEmail?link=${verificationToken}`;

    const subject = "Welcome To IVD-Dividends";
    const text = `Hey ${name},
    We heard that you want to join IVD-Dividends. 

      Use the link to verify. 
      LINK: ${emailVerifyLink}

      If you don’t use this link within 2 days, it will expire. 

      Thanks,
      The IVD-Dividends Team`;

    await sendEmail(email, subject, text);

    return { success: true, message: "Email has been sent successfully" };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

async function sendForgotPass(email, name, verificationToken) {
  try {
    const emailVerifyLink = `http://192.168.0.106:3000/reset-password?link=${verificationToken}`;

    const subject = "Reset your IVD-Dividends password";
    const text = `Hey ${name}
    We heard that you lost your IVD-Dividends password. Sorry about that!
  
      But don’t worry! We are here to help you!
      
      If you don’t use this link within 2 days, it will expire. 
      LINK: ${emailVerifyLink}
  
      Thanks,
      The IVD-Dividends Team`;

    await sendEmail(email, subject, text);
    return { success: true, message: "Email has been sent successfully" };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

async function twoStepVerification(email, name, verificationToken) {
  try {
    const subject = "Two Step Verification IVD-Dividends";
    const text = `Hey ${name}
    Some One is trying to loged In your account if its not you then Change your password.
  
      If its you then use that code for loged-In.
       
      CODE: ${verificationToken}
  
      Thanks,
      The IVD-Dividends Team`;

    await sendEmail(email, subject, text);
    return { success: true, message: "Email has been sent successfully" };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

module.exports = { sendVerificationEmail, sendForgotPass, twoStepVerification };

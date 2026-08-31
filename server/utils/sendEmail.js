const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (
    process.env.DISABLE_EMAIL === "true" ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"LocalConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    return false;
  }
};

module.exports = sendEmail;
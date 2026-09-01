const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query user by normalized lowercase email
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email does not exist. Please check your email or register.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const jwtSecret =
      process.env.JWT_SECRET || "nearlink_secure_fallback_jwt_secret_key_2026";

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "User Login Successfully",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar || "",
        location: user.location || "Pune, Maharashtra",
        phone: user.phone || "",
        bio: user.bio || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Send Password Reset OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists in database
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address. Please check your email or register.",
      });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Upsert OTP in MongoDB with 10-minute expiry
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`[Forgot Password] Generated reset OTP for ${normalizedEmail}: ${otp}`);

    // Send styled email template
    const emailSent = await sendEmail({
      to: normalizedEmail,
      subject: "Reset Your LocalConnect Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #16a34a; margin-bottom: 8px;">Password Reset Request 🔐</h2>
          <p style="color: #475569; font-size: 14px;">Hello ${user.fullName || "there"},</p>
          <p style="color: #475569; font-size: 14px;">We received a request to reset your password for your LocalConnect account. Use the verification code below to set a new password:</p>
          
          <div style="background-color: #f1f5f9; padding: 18px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${otp}</span>
          </div>

          <p style="color: #64748b; font-size: 12px;">This code is valid for 10 minutes. If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 11px;">— LocalConnect Neighborhood Platform</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: emailSent
        ? "Verification code sent to your email address"
        : "Verification code generated successfully",
      otp: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reset code. Please try again.",
      error: error.message,
    });
  }
});

// Verify OTP & Set New Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body || {};

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, verification code, and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP in database
    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Find User
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    // Hash new password and update
    const hashpassword = await bcrypt.hash(newPassword, 10);
    user.password = hashpassword;
    await user.save();

    // Delete used OTP
    await Otp.deleteMany({ email: normalizedEmail });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
      error: error.message,
    });
  }
});

module.exports = router;

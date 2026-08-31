const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

// Send Registration OTP to Email
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Upsert OTP in MongoDB
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`[OTP] Generated verification code for ${normalizedEmail}: ${otp}`);

    // Send email with styled template
    const emailSent = await sendEmail({
      to: normalizedEmail,
      subject: "Your LocalConnect Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; rounded: 16px;">
          <h2 style="color: #16a34a; margin-bottom: 8px;">Welcome to LocalConnect! 👋</h2>
          <p style="color: #475569; font-size: 14px;">Use the verification code below to complete your registration:</p>
          
          <div style="background-color: #f1f5f9; padding: 18px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${otp}</span>
          </div>

          <p style="color: #64748b; font-size: 12px;">This code is valid for 10 minutes. If you did not request this code, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 11px;">— LocalConnect Neighborhood Platform</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: emailSent
        ? "Verification code sent to your email"
        : "Verification code generated successfully",
      otp: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification code. Please try again.",
    });
  }
});

// Verify OTP and Complete Registration
router.post("/verify-otp-and-register", async (req, res) => {
  try {
    const { fullName, email, password, otp } = req.body;

    if (!fullName || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields and verification code",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

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

    // Hash password and create user
    const hashpassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashpassword,
    });

    // Delete used OTP
    await Otp.deleteMany({ email: normalizedEmail });

    return res.status(201).json({
      success: true,
      message: "Account registered successfully! Please log in.",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Verify OTP & Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

// Standard Direct Register Endpoint (Fallback)
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const existEmail = await User.findOne({ email: normalizedEmail });
    if (existEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    const hashpassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashpassword,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Direct Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existEmail = await User.findOne({email});
   if (existEmail) {
  return res.status(400).json({
    success: false,
    message: "Email already exists",
  });
}
    const hashpassword = await bcrypt.hash(password,10);
    const user = await User.create({
      fullName,
      email,
      password : hashpassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;

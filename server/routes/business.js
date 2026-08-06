const express = require("express");
const router = express.Router();

const Business = require("../models/Business");
const auth = require("../middleware/authmiddleware");

router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      address,
      city,
      latitude,
      longitude,
      phone,
      email,
      website,
      image,
    } = req.body;
   //console.log(req.user);
    const business = await Business.create({
      name,
      category,
      description,
      address,
      city,
      latitude,
      longitude,
      phone,
      email,
      website,
      image,
      owner: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Business created successfully",
      business,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const businesses = await Business.find()
      .populate("owner", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: businesses.length,
      businesses,
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
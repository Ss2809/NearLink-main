const express = require("express");
const router = express.Router();

const Business = require("../models/Business");
const auth = require("../middleware/authmiddleware");

router.post("/", auth, async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    console.log("USER:", req.user);

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
      rating,
      totalReviews,
      isOpen,
      openingHours,
    } = req.body;

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
      rating,
      totalReviews,
      isOpen,
      openingHours,
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

router.get("/:id", async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate(
      "owner",
      "fullName email",
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.json({
      success: true,
      business,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;
    const search = req.query.search || "";
    const sort = req.query.sort || "newest";

    const filter = {};
    let sortOption = {};

    switch (sort) {
      case "rating":
        sortOption = { rating: -1 };
        break;

      case "popular":
        sortOption = { totalReviews: -1 };
        break;

      case "name":
        sortOption = { name: 1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    // Return all businesses if page & limit are not provided
    if (!req.query.page && !req.query.limit) {
      const businesses = await Business.find(filter)
        .populate("owner", "fullName email")
        .sort(sortOption);

      return res.status(200).json({
        success: true,
        count: businesses.length,
        businesses,
      });
    }

    const skip = (page - 1) * limit;

    const businesses = await Business.find(filter)
      .populate("owner", "fullName email")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const totalBusinesses = await Business.countDocuments(filter);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalBusinesses / limit),
      totalBusinesses,
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

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Business = require("../models/Business");
const auth = require("../middleware/authmiddleware");

// Distance calculation helper (Haversine formula in KM)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Get My Businesses (Logged-in User)
router.get("/my-businesses", auth, async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();

    const businesses = await Business.find({ owner: userId })
      .populate("owner", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalBusinesses: businesses.length,
      businesses,
    });
  } catch (error) {
    console.error("Get My Businesses error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Create Business
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
      openingHours,
      isOpen,
    } = req.body;

    if (!name || !category || !address) {
      return res.status(400).json({
        success: false,
        message: "Business name, category, and address are required",
      });
    }

    const latNum = Number(latitude);
    const lngNum = Number(longitude);

    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid geographic coordinates (latitude between -90 and 90, longitude between -180 and 180)",
      });
    }

    const userId = req.user.id || req.user._id;

    const business = await Business.create({
      name: name.trim(),
      category: category || "Other",
      description: description?.trim() || "",
      address: address.trim(),
      city: city?.trim() || "Pune",
      latitude: latNum,
      longitude: lngNum,
      phone: phone?.trim() || "",
      email: email?.trim() || "",
      website: website?.trim() || "",
      image: image || "",
      openingHours: openingHours?.trim() || "",
      isOpen: isOpen !== undefined ? Boolean(isOpen) : true,
      rating: 0,
      totalReviews: 0,
      owner: userId,
    });

    const populated = await Business.findById(business._id).populate(
      "owner",
      "fullName email"
    );

    return res.status(201).json({
      success: true,
      message: "Business created successfully",
      business: populated,
    });
  } catch (error) {
    console.error("Create Business error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Edit Business (Owner Only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const userId = (req.user.id || req.user._id).toString();

    // Verify owner authorization
    if (business.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the business owner can edit this business",
      });
    }

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
      openingHours,
      isOpen,
    } = req.body;

    if (name) business.name = name.trim();
    if (category) business.category = category;
    if (description !== undefined) business.description = description.trim();
    if (address) business.address = address.trim();
    if (city) business.city = city.trim();

    if (latitude !== undefined && longitude !== undefined) {
      const latNum = Number(latitude);
      const lngNum = Number(longitude);
      if (!isNaN(latNum) && !isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180) {
        business.latitude = latNum;
        business.longitude = lngNum;
      }
    }

    if (phone !== undefined) business.phone = phone.trim();
    if (email !== undefined) business.email = email.trim();
    if (website !== undefined) business.website = website.trim();
    if (image !== undefined) business.image = image;
    if (openingHours !== undefined) business.openingHours = openingHours.trim();
    if (isOpen !== undefined) business.isOpen = Boolean(isOpen);

    await business.save();

    const updatedBusiness = await Business.findById(business._id).populate(
      "owner",
      "fullName email"
    );

    return res.status(200).json({
      success: true,
      message: "Business updated successfully",
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("Edit Business error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Delete Business (Owner Only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const userId = (req.user.id || req.user._id).toString();

    // Verify owner authorization
    if (business.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the business owner can delete this business",
      });
    }

    await Business.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Business deleted successfully",
    });
  } catch (error) {
    console.error("Delete Business error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Get Single Business
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const business = await Business.findById(req.params.id).populate(
      "owner",
      "fullName email"
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    return res.status(200).json({
      success: true,
      business,
    });
  } catch (err) {
    console.error("Get Business by ID error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Get All Businesses (Search, Filter, Sort, Pagination, Distance)
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const search = req.query.search || "";
    const sort = req.query.sort || "newest";
    const category = req.query.category || "";
    const userLat = Number(req.query.lat);
    const userLng = Number(req.query.lng);

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    const totalBusinesses = await Business.countDocuments(filter);

    let sortOptions = { createdAt: -1 };

    if (sort === "rating") {
      sortOptions = { rating: -1, createdAt: -1 };
    } else if (sort === "popular") {
      sortOptions = { totalReviews: -1, createdAt: -1 };
    } else if (sort === "name") {
      sortOptions = { name: 1 };
    }

    let businesses = await Business.find(filter)
      .populate("owner", "fullName email")
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    if (sort === "distance" && !isNaN(userLat) && !isNaN(userLng)) {
      businesses = businesses
        .map((business) => {
          const distance = calculateDistance(
            userLat,
            userLng,
            business.latitude,
            business.longitude
          );

          return {
            ...business,
            distance: Number(distance.toFixed(2)),
          };
        })
        .sort((a, b) => a.distance - b.distance);
    }

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalBusinesses / limit) || 1,
      totalBusinesses,
      businesses,
    });
  } catch (error) {
    console.error("Get Businesses error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;

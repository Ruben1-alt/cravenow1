const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

const userAuthentication = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    // Check if Authorization header is missing
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const tokenParts = authHeader.split(" ");
    
    // Validate token format (must be "Bearer <token>")
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    const token = tokenParts[1];

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach user details to request
    req.user = {
      email: decoded.email,
      id: decoded.id,
    };
    // Check if the user exists and is not blocked
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // if (user.blocked) {
    //   return res.status(403).json({ message: "User is blocked" });
    // }
    else{
      next();
    }
    
  } catch (error) {
    return res.status(500).json({ message: "Authentication error", error: error.message });
  }
};

module.exports = userAuthentication;

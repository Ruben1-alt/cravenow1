const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler=require("express-async-handler")
const express=require('express');
const User = require("../models/userModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { log } = require("console");

const userController={
    register : asyncHandler(async(req,res)=>{        
      const {username,email,password,role,phone,address}=req.body
      const userExits=await User.findOne({email})
      if(userExits){
          throw new Error("User already exists")
      }
      const hashed_password=await bcrypt.hash(password,10)
      const userCreated=await User.create({
          username,
          email,
          password:hashed_password,
          role,
          phone,
          address
      })
      if(!userCreated){
          throw new Error("User creation failed")
      }
      const payload={
        name:userCreated.username,  
        email:userCreated.email,
        role:userCreated.role,
        id:userCreated.id
    }
    const token=jwt.sign(payload,process.env.JWT_SECRET_KEY)
    res.json(token)
        }),  
  
    login :asyncHandler(async(req,res)=>{
        const { email, password }=req.body
        const userExist=await User.findOne({email})
        if(!userExist){
            throw new Error("User not found")
        }
        const passwordMatch= await bcrypt.compare(password,userExist.password)
        if(!passwordMatch){
            throw new Error("Passwords not matching")
        }
        const payload={
            name:userExist.username,  
            email:userExist.email,
            role:userExist.role,
            id:userExist.id
        }
        const token=jwt.sign(payload,process.env.JWT_SECRET_KEY)
        res.json(token)
        }),

    logout:asyncHandler(async(req,res)=>{
        res.clearCookie("token")
        res.send("User logged out")
        }),

    profile: asyncHandler(async (req, res) => {
        const { username, email, password, role, phone, address } = req.body;
        const userId = req.user.id;         
            const user = await User.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            if (password) {
                user.password = await bcrypt.hash(password, 10);
            }
            user.username = username || user.username;
            user.email = email || user.email;
            user.role = role || user.role;
            user.phone = phone || user.phone;
            user.address = address || user.address;
            const updatedUser = await user.save();
            if (!updatedUser) {
                return res.status(500).json({ message: "Error updating profile" });
            }        
            res.send("User profile saved successfully");
    }),
       
    changePassword: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
    
        // Validate input
        if (!oldPassword || !newPassword) {
            res.status(400);
            throw new Error("Both old and new passwords are required");
        }
    
        const user = await User.findById(userId);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
    
        // Check if old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(401);
            throw new Error("Incorrect old password");
        }
    
        user.password = await bcrypt.hash(newPassword, 10);
    
        // Save the updated user
        await user.save();
    
        res.send({
            message: "Password changed successfully",
        });
    }),

    getUserProfile : asyncHandler(async (req, res) => {
        const userId = req.user.id;     
        const user = await User.findById(userId).select("-password"); 
        if (!user) {
            throw new Error("User not found");
        }    
        res.send({
            message: "User details retrieved successfully",
            user
        });
    }),

    forgotPassword: asyncHandler(async (req, res) => {
        const { email } = req.body;
        const user = await User.findOne({ email });
        console.log(email); 
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Generate Reset Token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = await bcrypt.hash(resetToken, 10);
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
        await user.save();
       // Send Email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
  });

const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            text: `Click on this link to reset your password: ${resetLink}`,
        };
transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Email could not be sent" });
            }
            res.json({ message: "Reset link sent to your email" });
        });
    }),
    resetPassword: asyncHandler(async (req, res) => {
        const { email, token, newPassword } = req.body;
        const user = await User.findOne({ email });
        console.log(email, token, newPassword);
        if (!user || !user.resetPasswordToken) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
        if (!isTokenValid || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: "Password reset successful" });
    }),

}
module.exports=userController
const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  jobTitle: {
    type: String,
  },
  department: {
    type: String,
  },
  dateHired: {
    type: Date,
  },
  salary: {
    type: Number,  // Employee's salary
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to manager (could be an Employee as well)
    ref: 'Employee',
  },
  status: {
    type: String,
    enum: ["active", "inactive", "on leave"],  // Employee's employment status
    default: "active",
  },
  performanceReview: {
    type: String,  // Performance review comments
  },
  isAvailable:{
    type:Boolean,
    default:true
  },
  attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attendance" }] // Add this line
  
}, { timestamps: true });

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;

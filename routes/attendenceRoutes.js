const express = require("express");
 const attendanceController = require("../controllers/attendenceController");
const userAuthentication = require("../middlewares/userAuthentication");
 const attendanceRoute = express.Router();
 
 attendanceRoute.post("/mark",express.json(), userAuthentication,attendanceController.markAttendance);
 attendanceRoute.get("/view", userAuthentication,attendanceController.getEmployeeAttendance);
 
 module.exports = attendanceRoute;
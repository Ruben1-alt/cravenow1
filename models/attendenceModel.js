const mongoose = require("mongoose");
 
 const AttendanceSchema = new mongoose.Schema({
   employee: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "Employee",
     required: true
   },
   date: {
     type: Date,
     required: true,
     default: Date.now
   },
   
   status:{
     type:String,
     enum: ["present", "absent", "on leave"],
   }
 }, { timestamps: true });
 
 const Attendance = mongoose.model("Attendance", AttendanceSchema);
 module.exports = Attendance;
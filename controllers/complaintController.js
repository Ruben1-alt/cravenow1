const asyncHandler = require("express-async-handler");
const Restaurant = require("../models/restaurantModel");
const Complaint = require("../models/complaintModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

const complaintController={
    fileComplaint  : asyncHandler(async (req, res) => {
    const { subject, description } = req.body;
    const complaint = new Complaint({
      user: req.user.id, 
      subject,
      description,
    });
    await complaint.save();
    if(!complaint){
        res.send("Error in filing complaint")
      }
      const admin = await User.findOne({ role: "admin" });
      const notify = new Notification({
          user: admin._id,
          message: `New complaint filed`
        });
        await notify.save();
    res.send('Complaint filed successfully');
}),

getAllComplaints :asyncHandler(async (req, res) => {
      const complaints = await Complaint.find().populate('user', 'username')
      if(!complaints){
        res.send("No complaints found")
      }
      res.send(complaints);
  }),

  getUserComplaints :asyncHandler(async (req, res) => {
      const complaints = await Complaint.find({ user: req.user.id })
      if(!complaints){
        res.send("No complaints found")
      }
      res.send(complaints);
  }),
  updateComplaintStatus :asyncHandler(async (req, res) => {
      const { id, status, response } = req.body;
  
      const complaint = await Complaint.findById(id);
      if (!complaint) throw new Error('Complaint not found');
  
      complaint.status = status|| '';
      complaint.response = response || '';
      await complaint.save();

      res.send({ message: 'Complaint updated successfully', complaint });
  }),
}
module.exports=complaintController
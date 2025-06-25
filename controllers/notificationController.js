const asyncHandler = require("express-async-handler");
const Notification = require("../models/notificationModel");
const MenuItem = require("../models/menuItemModel");
 const User = require("../models/userModel");

const notificationController = {
    getUserNotifications: asyncHandler(async (req, res) => {
        const notifications = await Notification.find({ user: req.user.id }).sort({ date: -1 });
        res.send(notifications);
    }),

    markNotificationAsRead: asyncHandler(async (req, res) => {
        const { id } = req.body;
        const notification = await Notification.findById(id);

        if (!notification) {
            throw new Error("Notification not found.");
        }

        notification.read = true;
        await notification.save();
        await notification.deleteOne();
        res.send("Notification marked as read.");
    }),

    deleteNotification: asyncHandler(async (req, res) => {
        const { id } = req.body;
        const notification = await Notification.findById(id);

        if (!notification) {
            throw new Error("Notification not found.");
        }

        await notification.deleteOne();
        res.send("Notification deleted successfully.");
    }),

     sendDiscountNotification:asyncHandler(async (req, res) => {
         try {
             const { menu, discount, offer } = req.body; 
             
             // Find the menu item
             const menuItem = await MenuItem.findById(menu);
             if (!menuItem) {
                 return res.status(404).json({ message: "Menu item not found." });
             }
             
             // Find all users to notify (you can add filters as needed)
             const users = await User.find({}, "_id");
             if (!users.length) {
                 return res.status(404).json({ message: "No users found to notify." });
             }
             
             const message = discount 
                 ? `Limited-time discount! Get ${discount}% off on ${menuItem.name}.` 
                 : `Special offer! ${offer} available for ${menuItem.name}.`;
     
             const notifications = users.map(user => ({
                 user: user._id,
                 message: message,
             }));
     
             // Insert notifications in bulk
             await Notification.insertMany(notifications);
     
             res.status(200).json({ message: "Notifications sent successfully." });
         } catch (error) {
             console.error(error);
             res.status(500).json({ message: "Server error." });
         }
     })
 
 
};

module.exports = notificationController;
const MenuItem = require("../models/menuItemModel");
const Restaurant = require("../models/restaurantModel");
const Complaint = require("../models/complaintModel");
const Cart = require("../models/cartModel");
const Employee = require("../models/employeeModel");
const Order = require("../models/orderModel");
const Delivery = require("../models/deliveryModel");
const Review = require("../models/reviewModel");
const asyncHandler = require("express-async-handler");

const restaurantController = {
    // Get the single restaurant details
    getRestaurant: asyncHandler(async (req, res) => {
        const restaurant = await Restaurant.findOne().populate("owner", "name email");
        if (!restaurant) {
            throw new Error("Restaurant not found");
        }
        res.send(restaurant);
    }),

    // Create or update the restaurant (only one should exist)
    saveRestaurant: asyncHandler(async (req, res) => {
        const { name, location, cuisine, contact, deliveryAvailable } = req.body;
        const owner = req.user.id;

        // Check if a restaurant already exists
        let restaurant = await Restaurant.findOne();

        if (restaurant) {
            // Update existing restaurant
            restaurant.name = name || restaurant.name;
            restaurant.location = location || restaurant.location;
            restaurant.cuisine = cuisine || restaurant.cuisine;
            restaurant.contact = contact || restaurant.contact;
            restaurant.deliveryAvailable = deliveryAvailable || restaurant.deliveryAvailable;
            restaurant.owner = owner; // Optional update
        } else {
            // Create new restaurant (first time)
            restaurant = new Restaurant({
                name,
                owner,
                location,
                cuisine,
                contact,
                deliveryAvailable,
            });
        }

        const savedRestaurant = await restaurant.save();
        res.send("Restaurant saved successfully");
    }),

    // Delete the restaurant (if needed)
    deleteRestaurant: asyncHandler(async (req, res) => {
        const restaurant = await Restaurant.findOne();
        if (!restaurant) {
            throw new Error("Restaurant not found");
        }
        const restaurantId=restaurant._id
        await Promise.all([
            MenuItem.deleteMany({ restaurant: restaurantId }),
            Employee.deleteMany({ restaurant: restaurantId }),
            Order.deleteMany({ restaurant: restaurantId }),
            Complaint.deleteMany({ restaurant: restaurantId }),
            Review.deleteMany({ restaurant: restaurantId }),
            Delivery.deleteMany({ order: { $in: await Order.find({ restaurant: restaurantId }).distinct('_id') } }),
            Cart.deleteMany({ "items.menuItem": { $in: await MenuItem.find({ restaurant: restaurantId }).distinct('_id') } }),
        ]);
    
        // Finally, delete the restaurant
        await restaurant.deleteOne();
    
        res.send({ message: "Restaurant and related data deleted successfully" });
    }),
};

module.exports = restaurantController;

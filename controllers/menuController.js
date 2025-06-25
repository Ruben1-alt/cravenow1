const asyncHandler = require("express-async-handler");
const MenuItem = require("../models/menuItemModel");

const menuController = {
    // Create a new menu item
    

    // Get all menu items
    getAllMenuItems: asyncHandler(async (req, res) => {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    }),

    // Get a single menu item by name
    getMenuItemById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const menuItem = await MenuItem.findOne({ _id:id });
        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }
        res.json(menuItem);
    }),
    
    searchMenu: asyncHandler(async (req, res) => {
        const { name } = req.body;
        const query = {
            $or: []
        };
    
        if (name) query.$or.push({ name: { $regex: name, $options: "i" } });
       
        // Ensure there is at least one condition
        if (query.length === 0) {
            return res.status(400).json({ message: "Invalid search parameters" });
        }
    
        const menu = await MenuItem.find(query);
        res.json(menu);
    }), 

    // Update a menu item
    updateMenuItem: asyncHandler(async (req, res) => {
        const { id,name, description, price, stock, category, availability, discount, addons, dietaryRestrictions } = req.body;
        console.log(id,name, description);
        
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }
        
        menuItem.name = name || menuItem.name;
        menuItem.description = description || menuItem.description;
        menuItem.price = price || menuItem.price;
        menuItem.stock = stock || menuItem.stock;
        menuItem.image = req.file?.path || menuItem.image;
        menuItem.category = category || menuItem.category;
        menuItem.availability = availability !== undefined ? availability : menuItem.availability;
        menuItem.discount = discount || menuItem.discount;
        menuItem.addons = addons || menuItem.addons;  // Update add-ons
        menuItem.dietaryRestrictions = dietaryRestrictions || menuItem.dietaryRestrictions;  // Update dietary restrictions
        
        const updatedMenuItem = await menuItem.save();
        res.send({
            message: "Menu item updated successfully",
            menuItem: updatedMenuItem
        });
    }),

    

    // Filter menu items by category, price range, and other options
    filterMenuItems: asyncHandler(async (req, res) => {
        const { category, priceMin, priceMax, dietaryRestrictions, addons } = req.body;
        let filterQuery = {};

        if (category) {
            filterQuery.category = category;
        }
        if (priceMin || priceMax) {
            filterQuery.price = {};
            if (priceMin) filterQuery.price.$gte = priceMin;
            if (priceMax) filterQuery.price.$lte = priceMax;
        }
        if (dietaryRestrictions && dietaryRestrictions.length > 0) {
            filterQuery.dietaryRestrictions = { $in: dietaryRestrictions }; // Match any of the specified dietary restrictions
        }
        if (addons && addons.length > 0) {
            filterQuery.addons = { $in: addons }; // Match any of the specified add-ons
        }

        const filteredMenuItems = await MenuItem.find(filterQuery);
        if (!filteredMenuItems.length) {
            res.send({ message: "No menu items found matching your criteria" });
        }

        res.send({ menuItems: filteredMenuItems });
    })
};

module.exports = menuController;

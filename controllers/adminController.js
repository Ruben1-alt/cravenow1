const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Restaurant = require("../models/restaurantModel");
const Order = require("../models/orderModel");
const MenuItem = require("../models/menuItemModel");
const bcrypt= require("bcryptjs");
const Employee = require("../models/employeeModel");

const adminController={
    getDashboardData :asyncHandler(async (req, res) => {
          const userCount = await User.find();
          const restaurantCount = await Restaurant.find();
          const orderCount = await Order.find();
      
          res.send(userCount);
        
      }),

    createMenuItem: asyncHandler(async (req, res) => {
              const { name, description, price, stock, category, availability, discount, addons, dietaryRestrictions } = req.body;
              // Create new menu item
              const newItem = await MenuItem.create({
                  name,
                  description,
                  stock,
                  price,
                  image: req.file?.path, 
                  category,
                  availability: availability || true, 
                  discount: discount || { percentage: 0, validUntil: null },
                  addons: addons || [],  // Add-ons field
                  dietaryRestrictions: dietaryRestrictions || []  // Dietary restrictions field
              });
              
              if (!newItem) {
                  throw new Error("Creation failed");
              }
              
              res.send({
                  message: "New menu item added successfully",
                  menuItem: newItem
              });
    }),

          // Delete a menu item
    deleteMenuItem: asyncHandler(async (req, res) => {
                  const { id } = req.body;
                  const menuItem = await MenuItem.findOne({ id });
                  if (!menuItem) {
                      throw new Error("Menu item not found");
                  }
                  await menuItem.deleteOne();
                  res.json({ message: "Menu item deleted successfully" });
    }),

    verifyUser:asyncHandler(async (req, res) => {
        const {email}=req.body
        const user= await User.findOne({email})
        if(!user){
            throw new Error('User not found')
        }
        user.verified=true
        await user.save()
        res.send("User verified")
    }),
    createEmployee:asyncHandler(async (req, res) => {
        const { username, email, password,jobTitle, department, dateHired, salary, status, performanceReview } = req.body;
    
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new Error("User already exists");
        }
    
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Create the user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role:"employee"
        });
    
        if (!user) {
            throw new Error("User creation failed");
        }
    
        // Create the employee linked to the user
        const employee = new Employee({
            user: user._id, // Linking employee to the user
            jobTitle,
            department,
            dateHired,
            salary,
            status,
            performanceReview,
            isAvailable:true
        });
    
        await employee.save();
    
        res.status(201).json({ 
            message: "Employee created successfully", 
            employee,
            user: { id: user._id, email: user.email, role: user.role } 
        });
    }),
}
module.exports=adminController
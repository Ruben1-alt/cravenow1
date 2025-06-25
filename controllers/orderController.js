const Order = require("../models/orderModel");
const MenuItem = require("../models/menuItemModel");
const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Delivery = require("../models/deliveryModel");
const Notification = require("../models/notificationModel");
const Payment = require("../models/paymentModel");
const Employee = require("../models/employeeModel");

const orderController = {
  // Create a new order
  createOrder: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { address, contact } = req.body;
    
    const cart = await Cart.findOne({ user: userId }).populate("items.menuItem");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Find an available driver
    const driver = await Employee.findOne({ jobTitle: "Delivery Person", isAvailable: true }).sort({ lastAssigned: 1 });
    if (!driver) {
      return res.status(503).json({ error: "No available drivers at the moment" });
    }

    // Create delivery record
    const delivery = new Delivery({
      driver: driver.user,
      status: "Awaiting Pickup",
      estimatedDeliveryTime: 60
    });

    // Create order record
    const order = new Order({
      user: userId,
      items: cart.items,
      totalAmount: cart.totalAmount,
      paymentStatus: "Pending",
      estimatedPreparationTime: 30,
      delivery: delivery.id,
      address,
      contact,
      status: "Pending"
    });
    const payment = new Payment({
      user: userId,
      currency: "USD",
      status: "Pending",
      amount: order.totalAmount,
      order:order._id
    });
    order.payment=payment
    try {
      await payment.save()
      await order.save();
      delivery.order = order.id;
      await delivery.save();
    } catch (error) {
      return res.status(500).json(error);
    }

    // Mark driver as unavailable
    driver.isAvailable = false;
    driver.lastAssigned = new Date();
    await driver.save();

    // Notify admin if stock is low
    const admin = await User.findOne({ role: "admin" });

    for (const item of cart.items) {
      const menuItem = await MenuItem.findById(item.menuItem._id);
      if (menuItem) {
        menuItem.stock = Math.max(0, menuItem.stock - item.quantity);
        menuItem.availability = menuItem.stock > 0;
        await menuItem.save();

        // Send low stock notification
        if (menuItem.stock < 5) {
          const notify = new Notification({
            user: admin._id,
            message: `Low stock alert: ${menuItem.name} has less than 5 units left.`
          });
          await notify.save();
        }
      }
    }
    const notifyorder = new Notification({
      user: driver.user,
      message: `New Order placed: ${order._id}`
    });
    await notifyorder.save();
    // Clear cart after successful order
    await Cart.findOneAndDelete({ user: userId });
        const notify = new Notification({
            user: admin._id,
            message: `New Order placed: ${order._id}`
          });
          await notify.save();
    res.status(201).json({ message: "Order placed successfully", order: order });
  }),

  // Get orders for a user
  getOrdersByUser: asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user.id }).populate("items.menuItem").populate("user");

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json({ orders });
  }),

  getOrder: asyncHandler(async (req, res) => {
    const {id}=req.params
    console.log(id);
    
    const orders = await Order.findById(id);

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json({ orders });
  }),
   getAllOrderItems: asyncHandler(async (req, res) => {
              const orders = await Order.find().populate({
                path: "items.menuItem",
                model: "MenuItem",
                select: "name price",
              }).populate("user");
              res.json(orders);
          }),
  

  // Cancel an order
  cancelOrder: asyncHandler(async (req, res) => {
    const { orderId, reason } = req.body;

    const order = await Order.findById(orderId).populate("delivery");
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.status === "Out for Delivery") {
      return res.status(400).json({ message: "Order cannot be cancelled once out for delivery." });
    }

    // Update the order status to cancelled
    order.status = "Cancelled";
    order.cancellationReason = reason;

    // Remove associated delivery
    if (order.delivery) {
      await Delivery.deleteOne({ _id: order.delivery });
    }

    await order.save();

    // Mark the driver as available again
    if (order.delivery && order.delivery.driver) {
      const driver = await Employee.findOne({user:order.delivery.driver});
      if (driver) {
        driver.isAvailable = true;
        await driver.save();
      }
    }
    const admin = await User.findOne({ role: "admin" });
    const notify = new Notification({
        user: admin._id,
        message: `Order ${order._id} cancelled.`
      });
      await notify.save();
    res.status(200).json({ message: "Order cancelled successfully", orderId: order._id });
  })
};

module.exports = orderController;

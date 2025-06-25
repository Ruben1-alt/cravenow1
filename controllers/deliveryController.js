const Delivery = require("../models/deliveryModel");
const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const crypto = require('crypto');
const Notification = require("../models/notificationModel");
const Employee = require("../models/employeeModel");
const Payment = require("../models/paymentModel");

const generateOTP = () => {
  return crypto.randomInt(100000, 999999);
}

const deliveryController = {
  updateDeliveryStatus: asyncHandler(async (req, res) => {
    const { status } = req.body;
    const delivery = await Delivery.findOne({ driver: req.user.id,status:{$ne:"Delivered"} });
    if (!delivery) res.send("Delivery not found");
      
      const order = await Order.findById(delivery.order);
      if (!order) res.send("Order not found");
      order.status = status;
      
      const deliveryStatusNotify = new Notification({
        user: order.user,
        message: `Delivery status for order ${order._id} has been updated to: ${status}.`
      });
      await deliveryStatusNotify.save();
      if( status==="Delivered"){
        const driverUser = await Employee.findOne({ user: req.user.id });
        driverUser.isAvailable = true;
        await driverUser.save();
        order.paymentStatus="Paid"
        if(order.paymentDetails==='Cash on Delivery'){
          const payment=await Payment.findOne({order:order._id})
          payment.status="completed"
          await payment.save()
        }
      }
      await order.save();
      delivery.status ="Delivered"
      res.send("Delivery Complete")
    if(status){
    delivery.status = status;
    const updatedDelivery = await delivery.save();
    res.send(updatedDelivery);
    }
  
    
  }),
  sendOTP:asyncHandler(async (req, res) => {
    
    
    const id=req.body
    console.log(id);
    const delivery = await Delivery.findById(id.id);
    const otp = generateOTP();
    const client=req.client
   console.log(delivery);
   
    const order = await Order.findById(delivery.order);
    order.otp=otp
    await order.save()
    const phoneNumber="+91"+order.contact
      const message = await client.messages.create({
        body: `Your OTP code is: ${otp}`,
        from: req.number,
        to:phoneNumber,
      });

      console.log("OTP sent successfully:", message.sid);
      if(!message){
        res.send("Error sending OTP")
      }
      res.json({otp}) 
  }),

  // sendOTP:asyncHandler(async (req, res) => {
  //   const otp = generateOTP();
  //     const driver = req.user.id;
  //     const delivery = await Delivery.findOne({ driver: driver });
  //     if(!delivery){
  //       res.send('Delivery not found')
  //     }
  //     const order = await Order.findById(delivery.order);
  //     const phoneNumber=order.contact
  
  
  //       console.log("OTP sent successfully:", message.sid);
  //       if(!message){
  //         res.send("Error sending OTP")
  //       }
  //       res.send(otp) 
  // }),

  getDeliveryByOrder: asyncHandler(async (req, res) => {
    const deliveries = await Delivery.find({ driver: req.user.id })
  .populate({
    path: "order",
    populate: {
      path: "user",
      model: "User", // Only needed if not auto-detectable
    },
  });

    if (!deliveries) res.send("Delivery not found");
    res.send(deliveries);
  }),
};

module.exports = deliveryController;

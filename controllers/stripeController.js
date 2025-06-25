const Stripe = require("stripe");
const stripe=Stripe(process.env.STRIPE_SECRET_KEY)
const asyncHandler = require("express-async-handler");
const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");
require("dotenv").config()

const stripeController={
  payment: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
      const order = await Order.findById(id);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found." });
      }
  
      // Create payment intent first
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100), // Convert to cents
        currency: "usd",
        metadata: { orderId: id } // Optional but useful for tracking
      });
  
      // Update order payment details
      order.paymentDetails = "Card Payment";
      order.paymentStatus = "Paid";
      await order.save();
  
      // Create payment record
      const payment = await Payment.create({
        user: req.user.id,
        order: id,
        status: 'completed',
        amount: order.totalAmount,
        currency:'usd',
        paymentIntentId: paymentIntent.id // Store for future reference
      });
  
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id 
      });
  
    } catch (err) {
      console.error("Payment error:", err);
      res.status(500).json({ 
        error: err.message || "Failed to create payment intent." 
      });
    }
  }),

    webhook:asyncHandler(async(req,res)=>{
        const sig = req.headers['stripe-signature'];
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_KEY);
        } catch (err) {
            console.log(err.message);
            
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;

                // Update the payment status in the database
                await Payment.findOneAndUpdate(
                    { reference: paymentIntent.id },
                    { status: 'succeeded' }
                );

                return res.status(200).send('💰 Payment succeeded!');

            case 'checkout.session.completed':
                const session = event.data.object;

                // Update the payment status in the database
                await Payment.findOneAndUpdate(
                    { reference: session.id },
                    { status: 'completed' }
                );

                return res.status(200).send('✅ Payment Completed');

            default:
                return res.status(200).send('Webhook received');
        }  
    })    
}
module.exports=stripeController
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    otp:{
      type:Number,      
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Awaiting Pickup", "Out for Delivery",  "Delivered","Pending","Cancelled"],
      default: "Awaiting Pickup",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    estimatedPreparationTime: {
      type: Number, // in minutes
      default: 30, // Default estimated preparation time
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    paymentDetails: {
      type: String,
      default:"Cash on Delivery",
    },
    address:{
      type:String,
      require:true
    },
    contact:{
      type:Number,
      require:true
    }
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Indexing to speed up queries
OrderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;

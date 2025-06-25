const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
 user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  reference:{
    type:String,
  },
  currency:{
    type:String,
    required:true
  },
  status:{
    type:String,
    default:"pending",
    required:true
  },
  amount:{
    type:Number,
    default:0
  }
},{timestamps:true});
    
const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;
    
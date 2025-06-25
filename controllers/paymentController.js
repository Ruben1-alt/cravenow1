const asyncHandler = require("express-async-handler");
const Payment = require("../models/paymentModel");

const paymentController = {
    // Get all payments for a user
    getPayments: asyncHandler(async (req, res) => {
        const payments = await Payment.find().populate("user");
        res.json(payments);
    }),

    // Get a single payment by ID
    getPaymentById: asyncHandler(async (req, res) => {
        const {id}=req.body
        const payment = await Payment.findOne({order:id});

        if (payment) {
            res.json(payment);
        } else {
            res.status(404);
            throw new Error("Payment not found");
        }
    }),

    // Update payment status (for admin purposes)
    updatePaymentStatus: asyncHandler(async (req, res) => {
        const { id,status } = req.body;

        const payment = await Payment.findById(id);

        if (payment) {
            payment.status = status;
            await payment.save();
            res.json(payment);
        } else {
            res.status(404);
            throw new Error("Payment not found");
        }
    }),
};

module.exports = paymentController;
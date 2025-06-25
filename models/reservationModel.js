const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, default: "pending" },
    guests: { type: Number, required: true },
    specialRequest: { type: String },
});

const Reservation = mongoose.model("Reservation", ReservationSchema);
module.exports = Reservation;
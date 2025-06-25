const Notification = require("../models/notificationModel");
const Reservation = require("../models/reservationModel");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const TOTAL_SEATS = 30;

const reservationController = {
    createReservation: asyncHandler(async (req, res) => {
        const { date, time, guests, specialRequest } = req.body;

        if (!date || !time || !guests) {
            res.status(400);
            throw new Error("Please provide all required fields.");
        }

        // Calculate already reserved seats for the given date & time
        const reservations = await Reservation.find({ date, time });
        const bookedSeats = reservations.reduce((total, res) => total + res.guests, 0);

        // Check if there are enough seats available
        if (bookedSeats + guests > TOTAL_SEATS) {
            res.status(400);
            throw new Error("Not enough seats available for the selected time.");
        }

        // Create the reservation
        const reservation = new Reservation({
            user: req.user.id,
            date,
            time,
            guests,
            status:"pending",
            specialRequest,
        });

        await reservation.save();
        const admin = await User.findOne({ role: "admin" });
        const notify = new Notification({
            user: admin._id,
            message: `Reservation created for ${date}.`
          });
          await notify.save();
          
        res.status(201).json(reservation);
    }),

    // Get all reservations (Admin only)
    getAllReservations: asyncHandler(async (req, res) => {
        const reservations = await Reservation.find().populate("user", "username email");
        res.json(reservations);
    }),

    // Get reservations for the logged-in customer
    getMyReservations: asyncHandler(async (req, res) => {
        const reservations = await Reservation.find({ user: req.user.id });
        res.json(reservations);
    }),

    // Update a reservation (Admin)
    updateReservation: asyncHandler(async (req, res) => {
        const { id } = req.body;
        const updatedReservation = await Reservation.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedReservation) {
            res.status(404);
            throw new Error("Reservation not found");
        }
        const admin = await User.findOne({ role: "admin" });
        const notify = new Notification({
            user: admin._id,
            message: `Reservation updated: A customer's booking details have been modified.`
          });
          await notify.save();
          const notifys = new Notification({
            user: updatedReservation.user,
            message: `Reservation ${updatedReservation.status}`
          });
          await notifys.save();  
          
        res.json(updatedReservation);
    }),

    // Delete a reservation (Admin)
    deleteReservation: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const reservation = await Reservation.findById(id);

        if (!reservation) {
            res.status(404);
            throw new Error("Reservation not found");
        }

        await reservation.deleteOne();
        res.json({ message: "Reservation cancelled, seats are now available." });
    }),

    getAvailableSeats: asyncHandler(async (req, res) => {
        const { date, time } = req.query;

        if (!date || !time) {
            res.status(400);
            throw new Error("Please provide date and time.");
        }

        // Calculate booked seats
        const reservations = await Reservation.find({ date, time });
        const bookedSeats = reservations.reduce((total, res) => total + res.guests, 0);
        const availableSeats = TOTAL_SEATS - bookedSeats;

        res.json({ availableSeats });
    }),
};

module.exports = reservationController;

const express = require("express");
const reservationRouter = express.Router();
const userAuthentication = require("../middlewares/userAuthentication");
const reservationController = require("../controllers/reservationController");
// const adminAuthentication = require("../middlewares/admin");

reservationRouter.post("/add", userAuthentication, reservationController.createReservation);
reservationRouter.get("/viewall", userAuthentication, reservationController.getAllReservations);
reservationRouter.get("/view", userAuthentication, reservationController.getMyReservations);
reservationRouter.get("/available", userAuthentication, reservationController.getAvailableSeats);
reservationRouter.put("/edit", userAuthentication, reservationController.updateReservation);
reservationRouter.delete("/delete/:id", userAuthentication, reservationController.deleteReservation);

module.exports = reservationRouter;


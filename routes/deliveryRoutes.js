const express = require("express");
const deliveryController = require("../controllers/deliveryController");
const userAuthentication = require("../middlewares/userAuthentication");
const twilioClient = require("../middlewares/twilio");

const deliveryRouter = express.Router();
express.json()

deliveryRouter.put("/update", userAuthentication, deliveryController.updateDeliveryStatus);
deliveryRouter.get("/get", userAuthentication, deliveryController.getDeliveryByOrder);
deliveryRouter.post("/otp", userAuthentication,twilioClient, deliveryController.sendOTP);

module.exports = deliveryRouter;

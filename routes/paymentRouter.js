const express =require("express");
const paymentController = require("../controllers/paymentController");
const userAuthentication = require("../middlewares/userAuthentication");
const stripeController = require("../controllers/stripeController");
express.json()
const paymentRouter = express.Router();

paymentRouter.get("/viewall",userAuthentication, paymentController.getPayments);
paymentRouter.put("/edit",userAuthentication, paymentController.updatePaymentStatus);
paymentRouter.get("/search",userAuthentication, paymentController.getPaymentById);
paymentRouter.post("/checkout/:id",userAuthentication,express.json() ,stripeController.payment);

module.exports = paymentRouter;

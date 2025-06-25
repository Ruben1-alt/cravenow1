const express = require("express");
const orderController = require("../controllers/orderController");
const userAuthentication = require("../middlewares/userAuthentication");
express.json()
const orderRouter = express.Router();

orderRouter.post("/add", userAuthentication, orderController.createOrder);
orderRouter.get("/view", userAuthentication, orderController.getOrdersByUser);
orderRouter.get("/show/:id", userAuthentication, orderController.getOrder);
orderRouter.post("/cancel", userAuthentication, orderController.cancelOrder);
orderRouter.get("/viewall", userAuthentication, orderController.getAllOrderItems);

module.exports = orderRouter;

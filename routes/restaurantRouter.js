const express = require("express");
const restaurantController = require("../controllers/restaurantController");
const userAuthentication = require("../middlewares/userAuthentication");
const restaurantRoutes = express.Router();
express.json();

restaurantRoutes.post("/save", userAuthentication, restaurantController.saveRestaurant);
restaurantRoutes.get("/view", restaurantController.getRestaurant);
restaurantRoutes.delete("/delete", userAuthentication, restaurantController.deleteRestaurant);

module.exports = restaurantRoutes;

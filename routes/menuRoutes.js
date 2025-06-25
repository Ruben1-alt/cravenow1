const express = require("express");
const menuController = require("../controllers/menuController");
const userAuthentication = require("../middlewares/userAuthentication");
const upload = require("../middlewares/cloudinary");
const menuRouter = express.Router();
express.json()



menuRouter.get("/viewall", userAuthentication,menuController.getAllMenuItems);
menuRouter.get("/search/:id",userAuthentication, menuController.getMenuItemById);
menuRouter.get("/filter",userAuthentication, menuController.filterMenuItems);
menuRouter.put("/edit",userAuthentication,upload.single("image"), menuController.updateMenuItem);
menuRouter.get("/searchitem",userAuthentication, menuController.searchMenu);

module.exports = menuRouter;

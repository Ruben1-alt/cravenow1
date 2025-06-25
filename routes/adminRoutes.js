const express = require("express");
const userAuthentication = require("../middlewares/userAuthentication");
const adminController = require("../controllers/adminController");
const adminAuthentication = require("../middlewares/admin");
const  upload  = require("../middlewares/cloudinary");
const adminRouter = express.Router();

express.json()

adminRouter.post("/create",userAuthentication,adminAuthentication, adminController.createEmployee);
adminRouter.get("/get", userAuthentication,adminAuthentication, adminController.getDashboardData);
adminRouter.put("/verify", userAuthentication,adminAuthentication, adminController.verifyUser);
adminRouter.post("/add", userAuthentication,adminAuthentication,upload.single("image"),adminController.createMenuItem);
adminRouter.delete("/delete", userAuthentication,adminAuthentication,adminController.deleteMenuItem);

module.exports = adminRouter;

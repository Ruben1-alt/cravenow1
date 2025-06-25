const express = require("express");
const employeeRouter = express.Router();
const employeeController = require("../controllers/employeeController");
const userAuthentication = require("../middlewares/userAuthentication");
const adminAuthentication = require("../middlewares/admin");
express.json()

employeeRouter.get("/get",userAuthentication, employeeController.getEmployees);
employeeRouter.get("/getemp",userAuthentication, employeeController.getEmployee);
 employeeRouter.get("/search/:id",userAuthentication, employeeController.getEmployeeById);
 employeeRouter.put("/edit/:id",userAuthentication, employeeController.updateEmployee);
 employeeRouter.delete("/delete/:id",userAuthentication, employeeController.deleteEmployee);
 employeeRouter.delete("/delete",adminAuthentication,userAuthentication, employeeController.deleteEmployee);
module.exports = employeeRouter;

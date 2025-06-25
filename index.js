require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./database/connectDB");
const cookieParser = require("cookie-parser")
require('dotenv').config();
const errorHandler = require("./middlewares/errorHandler")
const router = require("./routes");
const app = express();


connectDB()
const allowedOrigins = ["http://localhost:5173","https://js.stripe.com","*"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

  
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  credentials: true // Allow cookies and auth headers
}));

app.options('*', cors()); // Handle preflight requests


app.use(cookieParser())



app.use(router)


app.use(errorHandler)


app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
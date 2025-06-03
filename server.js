const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyparser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const router = require("./routes/routes");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(cors());

//mongoDb connect//
const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/myfirst")
  .then(() => {
    console.log("db is connected");
  })
  .catch((err) => {
    console.log(err);
  });
const port = 3000;
app.listen(port, () => {
  console.log("server is ready on port", port);
});
app.use("/", router);

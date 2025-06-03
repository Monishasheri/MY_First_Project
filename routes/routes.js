const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const multer = require("multer");
const projects = require("../model/project.js");
const path = require("path");
const randomstring = require("randomstring");

//storage//
const storageconfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "-" +
        String(Date.now()) +
        path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storageconfig });
function generateOTP() {
  return randomstring.generate({ length: 4, charset: "numeric" });
}
function sendOTP(emailId, otp) {
  const mailoptions = {
    from: "dineshkumar1633@gmail.com",
    to: emailId,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`,
  };
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    Service: "gmail",
    auth: {
      user: "dineshkumar1633@gmail.com",
      pass: "oykp zljv yluh ardu",
    },
  });
  transporter.sendMail(mailoptions, (error, info) => {
    if (error) {
      console.log("Error Occured", error);
    } else {
      console.log("OTP send Successfully", info.response);
    }
  });
}

//get register//
router.get("/", (req, res) => {
  res.render("register", { pageTitle: "Student Registeration" });
});
//post register//
router.post("/register", upload.single("file"), async (req, res) => {
  try {
    const { emailId } = req.body;
    const checkemail = await projects.findOne({ emailId });
    if (checkemail) {
      return res.json({ message: "EmailId is Already existed" });
    }
    if (!req.file) {
      return res.json({ message: "File is required" });
    } else {
      const otp = generateOTP();

      const obj = new projects({
        name: req.body.name,
        phoneNo: req.body.phoneNo,
        emailId: req.body.emailId,
        passWord: req.body.passWord,
        file: {
          filename: req.file.filename,
          contentType: "image/jpg",
        },
        otp: otp,
      });
      console.log(obj);
      await obj.save();
      sendOTP(emailId, otp);
      res.status(200).json({
        status: "true",
        message: "user saved and OTP send successfully",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "user saved failed", error: error });
  }
});
//otp//
router.get("/otp", async (req, res) => {
  res.render("otp", { pageTitle: " OTP Verification" });
});
// const otpCache = {};

// router.post("/reqOTP", (req, res) => {
//   const { emailId } = req.body;

//   res.cookie("otpCache", JSON.stringify(otpCache), {
//     maxAge: 30000,
//     httpOnly: true,
//   });

// });

router.post("/verifyOTP", async (req, res) => {
  try {
    const { otp } = req.body;

    // Find user by OTP
    const save = await projects.findOne({ otp });

    // Check if user exists
    if (!save) {
      return res.json({ message: "Verify Error: OTP not found" });
    }

    // Ensure correct comparison
    if (save.otp === otp.toString()) {
      return res
        .status(200)
        .json({ status: "true", message: "Verified Successfully" });
    } else {
      return res.json({ message: "Verify Error: Incorrect OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error verifying OTP" });
  }
});

//login//
router.get("/login", (req, res) => {
  res.render("login", { pageTitle: "Login" });
});
router.post("/login", async (req, res) => {
  try {
    const { emailId, passWord } = req.body;
    const find = await projects.findOne({ emailId, passWord });
    if (find.emailId == emailId && find.passWord == passWord) {
      // res.status(200).send({ status: true, message: "Login successfully" });
      res.status(200).send({
        status: true,
        message: "Login success",
        data: find,
      });
    } else {
      res.json({ message: "invalid emailId and PassWord" });
    }
  } catch (error) {
    res.json({ message: "error occurs" });
  }
});
//table//
router.use("/uploads", express.static("uploads"));

router.get("/table", async (req, res) => {
  try {
    const users = await projects.find();
    const usersWithFileURL = users.map((user) => ({
      _id: user._id,
      name: user.name,
      emailId: user.emailId,
      phoneNo: user.phoneNo,
      passWord: user.passWord,
      file: user.file
        ? `http://localhost:3000/uploads/${user.file.filename}`
        : null,
    }));
    console.log("usersWithFileURL", usersWithFileURL);
    res.render("table", {
      users: usersWithFileURL,
      pageTitle: "Dashboard",
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching users." });
  }
});
//get editform//
router.get("/editform/:id", async (req, res) => {
  const id = req.params.id;
  const show = await projects.findById(id);

  res.render("editform", {
    show: show,
    pageTitle: "Updateuser",
  });
});
router.post("/editform/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const update = {
      name: req.body.name,
      emailId: req.body.emailId,
      passWord: req.body.passWord,
      phoneNo: req.body.phoneNo,
      file: req.body.file,
    };

    const change = await projects.findByIdAndUpdate(id, { $set: update });
    res.status(200).json({ status: true, message: "update successfully" });
  } catch (error) {
    res.status(400).json({ status: false, message: "error" });
  }
});
//delete//
router.post("/delete/:id", async (req, res) => {
  const id = req.params.id;
  const clear = await projects
    .findByIdAndDelete(id)
    .then(() => {
      res.status(200).json({ status: true, message: "delete successfully" });
    })
    .catch((err) => {
      res.json({ message: "delete error" });
    });
});

router.get("/tableData", async (req, res) => {
  try {
    const users = await projects.find();
    const usersWithFileURL = users.map((user) => ({
      _id: user._id,
      name: user.name,
      emailId: user.emailId,
      phoneNo: user.phoneNo,
      passWord: user.passWord,
      file: user.file
        ? `http://localhost:3000/uploads/${user.file.filename}`
        : null,
    }));
    console.log("usersWithFileURL", usersWithFileURL);

    return res.status(200).send({
      status: true,
      message: "data fecthing success",
      data: usersWithFileURL,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching users." });
  }
});
module.exports = router;

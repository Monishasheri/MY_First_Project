const mongoose = require("mongoose");
const projectschema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNo: { type: Number, required: true },
  emailId: { type: String, required: true },
  passWord: { type: String, required: true },
  file: {
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
  },
  otp: { type: String },
});
const projects = mongoose.model("project", projectschema);
module.exports = projects;

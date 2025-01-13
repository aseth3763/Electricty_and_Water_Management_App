const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    user_name: {
      type: String,
    },
    user_email: {
      type: String,
    },
    password: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    phone_no: {
      type: String,
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
    current_balance_water : {
      type : Number,
      default : 0
    },
    current_balance_electricity : {
      type : Number,
      default : 0
    },
    address: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      zip: {
        type: Number,
      },
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;

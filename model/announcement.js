const mongoose = require("mongoose");
const announcement_Schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    status: {
      type: Number,
      enum: [1, 0],
      default: 1,
    },
    date: {
      type: Date,
    },
    user_name: {
      type: String,
    },
    user_email: {
      type: String,
    },
    userIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
      },
    ],
  },
  { timestamps: true }
);

const announcement_Model = mongoose.model("announcment", announcement_Schema);
module.exports = announcement_Model;

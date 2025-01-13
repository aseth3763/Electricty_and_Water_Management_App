const mongoose = require("mongoose");

// Define the Transaction Schema
const transactionSchema = new mongoose.Schema(
  {
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    serviceProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "service",
    },
    amount: {
      type: Number,
    },
    // dueDate: {
    //   type: Date,
    // },
    service_Type: {
      type: String,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
    },
    transactionStatus: {
      type: String,
      enum: ["successful", "failed", "pending"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: [
        "credit card",
        "debit card",
        "bank transfer",
        "cash",
        "online payment",
      ],
      default: "online payment",
    },
    transactionType: {
      type: String,
      enum: ["TopUp", "BillPay"],
    },
  },
  { timestamps: true }
);

const TransactionModel = mongoose.model("Transaction", transactionSchema);

module.exports = TransactionModel;

// const mongodb = require('mongodb')
const mongoose = require("mongoose");

const db_url = process.env.db_url;
mongoose.connect(db_url, {});

const db = mongoose.connection;
db.on("error", () => {
  console.log("error while connecting to mongodb");
});

db.once("open", () => {
  console.log("Connected to mongodb");
});

module.exports = db;


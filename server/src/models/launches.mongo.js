const mongoose = require("mongoose");

const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
  },
  mission: {
    type: String,
    require: true,
  },
  rocket: {
    type: String,
    require: true,
  },
  launchDate: {
    type: Date,
    require: true,
  },
  target: {
    type: String,
  },
  customers: [String],
  upcoming: {
    type: Boolean,
    require: true,
  },
  success: {
    type: Boolean,
    require: true,
    defualt: true,
  },
});

// connects launchesSchema with the "launches" collection in db!
module.exports = mongoose.model("Launch", launchesSchema)

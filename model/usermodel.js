const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  address: [
    {
      name: {
        type: String,
      },
      country: {
        type: String,
      },
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      postcode: {
        type: String,
      },
      phone: {
        type: Number,
      },
      default:{
        type:Boolean,
        default: false,
      }
    },
  ],
  date: {
    type: String,
    default: Date.now,
  },
});
const usermodel = mongoose.model("user", UserSchema);

module.exports = usermodel;

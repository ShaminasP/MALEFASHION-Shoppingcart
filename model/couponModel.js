const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  startingDate: {
    type: String,
    required: true,
  },
  minCartAmount:{
    type: Number,
    required: true,
  },

  EndingDate: {
    type: String,
    required: true,
  },
  discountLimit: {
    type: Number,
    required: true,
  },
  couponCount:{
    type: Number,
    required:true,
  },
  couponStatus: {
    type: Boolean,
    default: true,
  },
  users: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    },
  ],
});
const couponModel = mongoose.model("coupon", couponSchema);

module.exports = couponModel;

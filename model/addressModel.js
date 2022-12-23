const { text } = require("body-parser");
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  address: [
    {
      name: {
        type: String,
        required: true,
      },
      country: {
        type: String,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state:{
        type: String,
        required: true,
      },
      postcode: {
        type: String,
        required: true,
      },
      phone: {
        type: Number,
        required: true,
      },
    },
  ],
});
const addressModel = mongoose.model("address", addressSchema);
module.exports = addressModel;

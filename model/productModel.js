const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productname: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categories",
    required: true,
  },
  Image: {
    type: Array,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  offPrice: {
    type: Number,
  },
  offer: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: Date.now,
  },
  review: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
});

const productModel = mongoose.model("products", productSchema);

module.exports = productModel;

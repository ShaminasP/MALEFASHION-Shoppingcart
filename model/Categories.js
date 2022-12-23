const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
  },
  discount:{
    type:Number,
    default: 0,
  },
  image: {
    type: Array,
  },
  date: {
    type: String,
    default: Date.now,
  },
});

const categoryModel = mongoose.model("categories", categorySchema);

module.exports = categoryModel;

const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  bucket: [
    {
      products: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
      },
      quantity: {
        type: Number,
        default: 1,
      },
       total:{
        type:Number,
      },      

    },
   
  ],
  subtotal:{
    type:Number,
  }
});

const cart = mongoose.model("Cart", cartSchema);

module.exports = cart;

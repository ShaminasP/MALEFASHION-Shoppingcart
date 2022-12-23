const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    orderedItems: [
      {
        products: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
        active: {
          type: Boolean,
          default: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      // required: true,
    },
    deliveryAddress: {
      type: Array,
    },
    paymentMethod: {
      type: String,
    },
    paymentStatus: {
      type: String,
    },
    orderStatus: {
      type: String,
    },
    date: {
      type: String,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("Orders", orderSchema);
module.exports = orderModel;

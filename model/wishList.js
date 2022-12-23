const mongoose = require("mongoose");
const wishListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  wishlist: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
      },
    },
  ],
});
const wishList = mongoose.model("Wishlist", wishListSchema);
module.exports = wishList;

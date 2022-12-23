const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  cancelled: [
    {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Orders",
      },
      refAmnt: {
        type: Number,
      },
    },
  ],
  ordered: [
    {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Orders",
      },
      Amnt: {
        type: Number,
      },
      
    },
  ],

  walletBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const walletModel = mongoose.model("Wallet", walletSchema);
module.exports = walletModel;

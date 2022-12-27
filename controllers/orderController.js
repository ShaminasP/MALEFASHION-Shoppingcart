const cart = require("../model/cartModel");
const product = require("../model/productModel");
const order = require("../model/orderModel");
const user = require("../model/usermodel");
const moment = require("moment");
const { default: mongoose } = require("mongoose");
const couponModel = require("../model/couponModel");
const Razorpay = require("razorpay");
const { response } = require("express");
const { nextTick } = require("process");
const { viewOrderDetails } = require("./adminController");
const { inventory, refund } = require("./helpers");
const orderModel = require("../model/orderModel");
const walletModel = require("../model/walletModel");

var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

const toOrder = async (req, res, next) => {
  try {
    const coupon = req.body.code;
    const payment = req.body.payment;
    const userId = req.session.user._id;
    const cartItems = await cart.findOne({ user: userId });
    const addresses = await user.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $project: {
          address: {
            $filter: {
              input: "$address",
              cond: {
                $eq: ["$$this.default", true],
              },
            },
          },
        },
      },
    ]);
    const address = addresses[0].address;
    const products = cartItems.bucket;

    const totalPrice = req.body.newTotal;
    if (address == 0) {
      res.json({ response: "addressRequired" });
    } else {
      if (payment == "COD") {
        const newOrder = new order({
          user: userId,
          orderedItems: products,
          totalPrice: totalPrice,
          deliveryAddress: address,
          paymentMethod: payment,
          paymentStatus: "Pending",
          orderStatus: "Confirmed",
          date: moment(Date.now()).format("DD-MM-YYYY"),
        });
        newOrder.save().then(async () => {
          products.forEach(async (data) => {
            const productID = data.products._id;
            const productQty = data.quantity;
            await inventory(productID, -productQty);
          });

          await couponModel.findOneAndUpdate(
            { couponCode: coupon },
            { $push: { users: { user: userId } }, $inc: { couponCount: -1 } }
          );

          await cart.findOneAndRemove({ user: userId });
          res.json({ response: "success" });
        });
      } else if (payment == "Razorpay") {
        const newOrder = new order({
          user: userId,
          orderedItems: products,
          totalPrice: totalPrice,
          deliveryAddress: address,
          paymentMethod: payment,
          paymentStatus: "Pending",
          orderStatus: "pending",
          date: moment(Date.now()).format("DD-MM-YYYY"),
        });
        newOrder.save().then((details) => {
          const orderId = details._id.toString();
          const totalPrice = details.totalPrice;
          instance.orders
            .create({
              amount: totalPrice * 100,
              currency: "INR",
              receipt: orderId,
            })
            .then((orders) => {
              res.json({ response: true, orders: orders });
            });
        });
      } else if (payment == "Wallet") {
        const wallet = await walletModel.findOne({ user: userId });
        const walletBalance = wallet.walletBalance;
        if (totalPrice <= walletBalance) {
          const remainingBalance = walletBalance - totalPrice;
          const newOrder = new order({
            user: userId,
            orderedItems: products,
            totalPrice: totalPrice,
            deliveryAddress: address,
            paymentMethod: payment,
            paymentStatus: "Completed",
            orderStatus: "Confirmed",
            date: moment(Date.now()).format("DD-MM-YYYY"),
          });
          newOrder.save().then(async (ordered) => {
            const orderID = ordered._id;
            products.forEach(async (data) => {
              const productID = data.products._id;
              const productQty = data.quantity;
              await inventory(productID, -productQty);
            });
            await walletModel.findOneAndUpdate(
              { user: userId },
              {
                $set: { walletBalance: remainingBalance },
                $push: { ordered: { orderId: orderID, Amnt: totalPrice } },
              }
            );
            await cart.findOneAndRemove({ user: userId });
            res.json({ response: "success" });
          });
        } else {
          const remainingBalance = totalPrice - walletBalance;
          const newOrder = new order({
            user: userId,
            orderedItems: products,
            totalPrice: totalPrice,
            deliveryAddress: address,
            paymentMethod: "wallet and Razorpay",
            paymentStatus: "Pending",
            orderStatus: "pending",
            date: moment(Date.now()).format("DD-MM-YYYY"),
          });
          newOrder.save().then((details) => {
            const orderId = details._id.toString();
            // const totalPrice = details.totalPrice;
            instance.orders
              .create({
                amount: remainingBalance * 100,
                currency: "INR",
                receipt: orderId,
              })
              .then((orders) => {
                res.json({ response: true, orders: orders, wallet: true });
              });
          });
        }
      }
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

const toVerifyPayment = async (req, res, next) => {
  try {
    const wallet = req.body.wallet;
    const crypto = require("crypto");
    const payment = req.body.paymentStatus;
    const orderIDDB = req.body.orders.receipt;
    const paymentID = payment.razorpay_payment_id;
    const orderId = payment.razorpay_order_id;
    const signature = payment.razorpay_signature;
    let hmac = crypto.createHmac("sha256", process.env.key_secret);
    hmac.update(orderId + "|" + paymentID);
    hmac = hmac.digest("hex");
    if (hmac == signature) {
      const userId = req.session.user._id;
      // await cart.findOneAndRemove({ user: userId });
      await cart.findOne({ user: userId }).then((cartItems) => {
        let cartItem = cartItems.bucket;
        cartItem.forEach(async (data) => {
          const productID = data.products._id;
          const qty = data.quantity;
          await inventory(productID, -qty);
          await cart.findOneAndRemove({ user: userId });
        });
      });
      if (wallet)
        await walletModel.findOneAndUpdate(
          { user: userId },
          { $set: { walletBalance: 0 } }
        );
      await order
        .findOneAndUpdate(
          { _id: orderIDDB },
          { $set: { paymentStatus: "Completed", orderStatus: "Confirmed" } }
        )
        .then(() => {
          res.json();
        });
    }
  } catch (error) {
    next(error);
    log(error.message);
  }
};

const viewUserOrder = async (req, res, next) => {
  try {
    let user = req.session.user;
    const ID = req.session.user._id;
    await order
      .find({ user: ID })
      .sort({ _id: -1 })
      .then((userOrderDetails) => {
        res.render("user/userOrders", { userOrderDetails, user });
      });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const userOrderDetails = async (req, res, next) => {
  try {
    let user = req.session.user;
    const ID = req.params.id;
    await order
      .findById(ID)
      .populate("user")
      .populate("orderedItems.products")
      .then((products) => {
        res.render("user/userOrderDetails", { products, user });
      });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//change the status
const toChangeStatus = async (req, res, next) => {
  try {
    const ID = req.body.id;
    const value = req.body.value;
    await orderModel.findByIdAndUpdate(ID, { $set: { orderStatus: value } });
  } catch (error) {
    next(error);
  }
};

//cancel order
const toCancelOrder = async (req, res, next) => {
  try {
    const userID = req.session.user._id;
    const ID = req.body.id;
    const orders = await orderModel.findById(ID);
    const total = orders.totalPrice;
    const paymentMethod = orders.paymentMethod;
    const orderStatus = orders.orderStatus;
    const products = orders.orderedItems;
    if (orderStatus === "Confirmed") {
      products.forEach((product) => {
        const productID = product.products._id;
        const Qty = product.quantity;
        inventory(productID, Qty);
      });
    }
    await orderModel.findByIdAndUpdate(ID, {
      $set: { orderStatus: "Cancelled" },
    });
    if (paymentMethod != "COD") {
      await refund(userID, ID, total);
    }
  } catch (error) {
    next(error);
  }
};

//return
const toReturnOrder = async (req, res, next) => {
  try {
    const userID = req.session.user._id;
    const ID = req.body.id;
    await orderModel
      .findByIdAndUpdate(ID, {
        $set: { orderStatus: "Returned" },
      })
      .then(async (details) => {
        let products = details.orderedItems;
        products.forEach((product) => {
          const productID = product.products._id;
          const Qty = product.quantity;
          inventory(productID, Qty);
        });
        const total = details.totalPrice;
        await refund(userID, ID, total);
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toOrder,
  toVerifyPayment,
  viewUserOrder,
  userOrderDetails,
  toChangeStatus,
  toCancelOrder,
  toReturnOrder,
};

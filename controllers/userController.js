const Products = require("../model/productModel");
const carts = require("../model/cartModel");
const reviewModel = require("../model/reviewSchema");
const cart = require("../model/cartModel");
const User = require("../model/usermodel");
const banner = require("../model/bannerModel");
const wishlist = require("../model/wishList");
const couponModel = require("../model/couponModel");
const categoryModel = require("../model/Categories");
const {
  ConnectAppInstance,
} = require("twilio/lib/rest/api/v2010/account/connectApp");
const { response } = require("express");
const { default: mongoose } = require("mongoose");
const productModel = require("../model/productModel");
const walletModel = require("../model/walletModel");
const { findOne } = require("../model/productModel");
const userHome = async (req, res, next) => {
  try {
   const latestProduct= await productModel.find().sort({ _id: -1 }).limit(4)
   const hotCollection=await productModel.find().sort({ _id:1}).limit(4)
    let user = req.session.user;
    await banner.find().then((bannerData) => {
      res.render("user/home", { bannerData, user ,latestProduct,hotCollection});
    });
  } catch (error) {
    next(error);
  }
};

const viewLogin = (req, res, next) => {
  try {
    let user = req.session.user;
    res.render("user/login", { expressFlash: req.flash("MSG"), user });
  } catch (error) {
    next(error);

    console.log(error.message);
  }
};

const userSignup = (req, res, next) => {
  try {
    let user = req.session.user;
    res.render("user/signup", { user });
  } catch (error) {
    next(error);

    console.log(error.message);
  }
};

const contactsView = (req, res, next) => {
  try {
    let user = req.session.user;

    res.render("user/contacts", { user });
  } catch (error) {
    next(error);
  }
};

const userProducts = async (req, res, next) => {
  try {
    let user = req.session.user;
    const categories = await categoryModel.find();
    const products = res.paginatedResults;
    res.render("user/view-products", { products, categories, user });
  } catch (error) {
    next(error);

    console.log(error.message);
  }
};

//productsdetails
const userProductsDetails = async (req, res, next) => {
  try {
    let user = req.session.user;

    const ID = req.params.id;
    Products.findById(ID).then((productDetails) => {
      res.render("user/product-details", { productDetails, user });
    });
  } catch (error) {
    next(error);

    console.log(error.message);
  }
};

const wishList = async (req, res, next) => {
  try {
    let user = req.session.user;

    const ID = req.session.user._id;
    wishlist
      .findOne({ user: ID })
      .populate("wishlist.product")
      .then((products) => {
        res.render("user/wish-lists", { products: products?.wishlist, user });
      });
  } catch (error) {
    next(error);

    console.log(error.message);
  }
};

//cart list
const viewShoppingCart = async (req, res, next) => {
  try {
    let user = req.session.user;

    const ID = req.session.user._id;
    cart
      .findOne({ user: ID })
      .populate("bucket.products")
      .then((item) => {
        console.log(item);

        res.render("user/shopping-cart", {
          item: item?.bucket,
          subtotal: item?.subtotal,
          user,
        });
      });
  } catch (error) {
    next(error);

    console.log(error.message);
  }
};

//checkout
const userCheckout = async (req, res, next) => {
  try {
    let user = req.session.user;
    const ID = req.session.user._id;
    const Cart = await cart.findOne({ user: ID }).populate("bucket.products");
    const subtotal = Cart.subtotal;
    const products = Cart.bucket;
    const data = await User.findById(ID);
    const address = data.address;
    const newAddress = await User.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(ID),
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

    const defaultAddress = newAddress[0].address;
    const coupon = await couponModel.find();

    const wallet = await walletModel.findOne({ user: ID });

    res.render("user/user-checkout", {
      address,
      products,
      subtotal,
      defaultAddress,
      coupon,
      wallet,
      user,
    });
  } catch (error) {
    next(error);

    console.log(error);
  }
};

const otp = (req, res, next) => {
  try {
    let user = req.session.user;

    res.render("user/otp", { user });
  } catch (error) {
    next(error);

    console.log(error.message);
  }
};

const userLogout = (req, res, next) => {
  try {
    req.session.user = false;
    res.redirect("/");
  } catch (error) {
    next(error);

    console.log(error.message);
  }
};

// Adress
const toAddAddress = async (req, res, next) => {
  try {
    const userID = req.session.user._id;
    await User.findOneAndUpdate(
      { _id: userID, "address.default": true },
      { $set: { "address.$.default": false } }
    );
    const { name, country, address, city, state, postcode, phone } = req.body;
    if (
      name &&
      country &&
      address &&
      city &&
      state &&
      postcode &&
      state &&
      phone
    ) {
      await User.findByIdAndUpdate(userID, {
        $push: {
          address: {
            name: name,
            country: country,
            address: address,
            city: city,
            state: state,
            postcode: postcode,
            phone: phone,
            default: true,
          },
        },
      });
      res.redirect("/checkout");
    }
  } catch (error) {
    next(error);

    console.log("error.message");
  }
};

//select address
const toSelectAddress = async (req, res, next) => {
  try {
    const userID = req.session.user._id;
    await User.findOneAndUpdate(
      { _id: userID, "address.default": true },
      { $set: { "address.$.default": false } }
    );

    await User.findOneAndUpdate(
      { _id: userID, "address._id": req.query.id },
      { $set: { "address.$.default": true } }
    ).then(() => {
      res.json();
    });
  } catch (error) {
    next(error);

    console.log("error.message");
  }
};

//view user profile
const toViewUserProfile = async (req, res, next) => {
  try {
    let user = req.session.user;

    const userID = req.session.user._id;
    const details = await User.findById(userID);
    const newAddress = await User.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(userID),
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
    const defaultAddress = newAddress[0].address;
    const userWallet = await walletModel.findOne({ user: userID });

    res.render("user/user-profile", {
      details,
      defaultAddress,
      userWallet,
      user,
    });
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//delete Address
const toDeleteAddress = async (req, res, next) => {
  try {
    console.log("something");
    const ID = req.body.id;
    console.log(ID);
    const userID = req.session.user.id;
    await User.findOneAndUpdate(userID, {
      $pull: { address: { _id: ID } },
    }).then(() => {
      res.json();
    });
  } catch (error) {
    next(error);

    console.log(error.message);
  }
};

//Edit Address
const toEditAddress = async (req, res, next) => {
  try {
    console.log("aaaaa");
    const { name, country, address, city, state, postcode, phone } = req.body;
    const ID = req.params.id;
    const userID = req.session.user.id;
    User.findOneAndUpdate(
      { userID, "address._id": ID },
      {
        $set: {
          "address.$.name": name,
          "address.$.country": country,
          "address.$.address": address,
          "address.$.city": city,
          "address>$.state": state,
          "address.$.postcode": postcode,
          "address.$.phone": phone,
        },
      }
    ).then(() => {
      res.redirect("/checkout");
    });
  } catch (error) {
    next(error);

    console.log(error.message);
  }
};

const toOrderSuccess = (req, res, next) => {
  let user = req.session.user;

  res.render("user/orderSuccess", { user });
};

// couponCheck
const toCouponCheck = async (req, res, next) => {
  try {
    const userID = req.session.user._id;
    let grandtotal;
    let msg;
    const code = req.query.code;
    const total = req.query.total;
    const result = await couponModel.findOne({
      couponCode: code,
      couponStatus: true,
    });
    if (!result) {
      msg = "Coupoun Doesn't exist";
      res.json({ status: false, message: msg });
    } else {
      const usedCoupon = await couponModel.findOne({
        couponCode: code,
        "users.user": userID,
      });
      console.log("user" + usedCoupon);
      if (usedCoupon) {
        msg = "Coupoun is already used !";
        res.json({ status: false, message: msg });
      } else {
        let discount = result.discount;
        let startingDate = new Date(result.startingDate);
        console.log(startingDate);
        let endingDate = new Date(result.EndingDate);
        console.log(endingDate);
        const currentDate = new Date(Date.now());
        let discountLimit = result.discountLimit;
        let count = result.couponCount;
        let minAmount = result.minCartAmount;
        if (count != 0) {
          console.log(" no count");
          if (total < minAmount) {
            console.log("total less than min amount");

            msg =
              "You have to purchase minimum of" +
              minAmount +
              "for this Coupoun ";
            res.json({ status: false, message: msg });
          } else {
            console.log("clear");

            if (startingDate < currentDate && endingDate > currentDate) {
              console.log("alll clear");

              let DiscAmount = Math.round((total * discount) / 100);
              if (DiscAmount > discountLimit) DiscAmount = discountLimit;
              grandtotal = total - DiscAmount;
              msg = "Coupon Applied";
              res.json({ status: true, grandtotal, message: msg });
            } else {
              msg = "Your coupon is active or has expired";
              res.json({ status: false, message: msg });
            }
          }
        } else {
          msg = "Coupon is no longer available";
          res.json({ status: false, message: msg });
        }
      }
    }
  } catch (error) {
    next(error);
  }
};
module.exports = {
  userHome,
  contactsView,
  userProductsDetails,
  wishList,
  viewShoppingCart,
  viewLogin,
  userSignup,
  userProducts,
  otp,
  userLogout,
  userCheckout,
  toAddAddress,
  toEditAddress,
  toViewUserProfile,
  toSelectAddress,
  toDeleteAddress,
  toEditAddress,
  toOrderSuccess,
  toCouponCheck,
};

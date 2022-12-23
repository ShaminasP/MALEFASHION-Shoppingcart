const express = require("express");
const productModel=require("../model/productModel")
const {pagination}=require('../controllers/helpers')
const {
  userHome,
  contactsView,
  userProductsDetails,
  wishList,
  viewShoppingCart,
  viewLogin,
  userSignup,
  userProducts,
  userLogout,
  otp,
  userCheckout,
  toAddAddress,
  toEditAddress,
  toViewUserProfile,
  toSelectAddress,
  toDeleteAddress,
  toOrderSuccess,
  toCouponCheck
} = require("../controllers/userController");

const {
  userRegister,
  userLogin,
  userOtp,
  resendOtp,
} = require("../controllers/authController");

const {
  toFilter,
  addToCart,
  toAddQuantity,
  toReduceQuantity,
  addToWishList,
  toDeleteList,
  toDeleteCart,
  review,
} = require("../controllers/productController");

const{
  toOrder,
  toVerifyPayment,
  viewUserOrder,
  userOrderDetails,
  toCancelOrder,
  toReturnOrder,

}=require('../controllers/orderController')

const { sessionCheck, sessionCheckAxios, loginCheck } = require("../middleware/middleware");
const { Router } = require("express");

const router = express.Router();

router.get("/", userHome);

router.get("/login",loginCheck, viewLogin);

router.get("/signup",loginCheck, userSignup);

router.get("/products",pagination(productModel),userProducts);

router.get('/filterCategory',toFilter)

router.get("/contacts", contactsView);

router.get('/checkout',sessionCheck,userCheckout);

router.get("/shoppingcart/", sessionCheck, viewShoppingCart);

router.get("/productsdetails/:id", userProductsDetails);

router.get("/wishlist", sessionCheck, wishList);

router.get("/logout", userLogout);

router.post("/signup", userRegister);

router.post("/login", userLogin);

router.get("/otp",loginCheck, otp);

router.get("/otpresend", resendOtp);

router.post("/otp", userOtp);

//add to cart
router.patch("/shopping-cart",sessionCheckAxios,addToCart);

//add to wish list
router.patch("/wishlist",sessionCheckAxios,addToWishList);

//addquantity
router.get("/addquantity",sessionCheckAxios, toAddQuantity);

//reduce quantity
router.get("/reducequantity",sessionCheckAxios, toReduceQuantity);  

//delete wish list
router.delete('/deletelist',sessionCheckAxios,toDeleteList);

//delete cart
router.delete('/deletecart',sessionCheckAxios,toDeleteCart)

//add address
router.post('/addaddress',sessionCheck, toAddAddress);

// edit address
router.post('/editaddress/:id',sessionCheck, toEditAddress);

//view user profile
router.get('/viewuserprofile',sessionCheck, toViewUserProfile);

//select address
router.get('/selectaddress',sessionCheckAxios,toSelectAddress);

//delete address
router.delete('/deleteaddress',sessionCheckAxios, toDeleteAddress);

// order
router.post('/postorders',sessionCheckAxios,toOrder)

router.post('/paymentverify',toVerifyPayment)

router.get('/orderSuccess',toOrderSuccess)

//view order
router.get('/userorder',sessionCheck,viewUserOrder)

router.get('/vieworderdetails/:id',sessionCheck,userOrderDetails)

//cancel
router.delete('/cancelorder',toCancelOrder)

router.delete('/returnorder',toReturnOrder)

//review
router.post('/review', sessionCheckAxios, review)

//coupon
router.get('/couponcheck',toCouponCheck)

module.exports = router;

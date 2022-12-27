const express = require("express");
const {
  homeView,
  loginView,
  viewOrders,
  viewOrderDetails,
  addProducts,
  viewClients,
  adminLogout,
  blockUser,
  unblockUser,
  viewCategory,
  viewCoupon,
  addCoupon,
  toAddCoupon,
  toGetSalesReport,
  getSalesReportBySearch,
  toGetChart,
  toGetPieChart,
  toBlockCoupon,
} = require("../controllers/adminController");

const { adminLogin } = require("../controllers/authController");
const {
  adminAddProduct,
  productsView,
  editProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  editCategory,
  updateCategory,
  deleteCategory,
  addbanner,
  toAddBanner,
  viewBanner,
} = require("../controllers/productController");

const { toChangeStatus } = require("../controllers/orderController");

const { upload } = require("../middleware/multer");

const {
  adminCheck,
  sessionCheckAxiosAdmin,
} = require("../middleware/middleware");
const { Router } = require("express");
const { uploadBanner } = require("../middleware/bannerMulter");
const banner = require("../model/bannerModel");

const router = express.Router();

router.get("/", adminCheck, homeView);

router.get("/login", loginView);

router.get("/product", adminCheck, productsView);

router.get("/orders", adminCheck, viewOrders);

router.get("/vieworderdetails/:id", adminCheck, viewOrderDetails);

router.get("/addproduct", adminCheck, addProducts);

router.get("/clients", adminCheck, viewClients);

router.get("/editproduct/:id", adminCheck, editProduct);

router.get("/logout", adminLogout);

router.get("/blockuser/:id", adminCheck, blockUser);

router.get("/unblockuser/:id", adminCheck, unblockUser);

router.get("/category", adminCheck, viewCategory);

router.get("/editcategory/:id", adminCheck, editCategory);

router.get("/banner", adminCheck, viewBanner);

router.get("/addbanner", adminCheck, addbanner);

router.post(
  "/addbanner",
  uploadBanner.array("Image", 3),
  adminCheck,
  toAddBanner
);

//post methods

router.post("/login", adminLogin);

router.post(
  "/addproduct",
  upload.array("Image", 4),
  adminCheck,
  adminAddProduct
);

router.post(
  "/editproduct/:id",
  upload.array("Image", 4),
  adminCheck,
  updateProduct
);

router.post("/category", upload.array("Image", 3), adminCheck, addCategory);

router.post(
  "/editcategory/:id",
  upload.array("Image", 3),
  adminCheck,
  updateCategory
);

router.patch("/changestatus", toChangeStatus);

// Delete::
router.delete("/deleteproduct", adminCheck, deleteProduct);

router.delete("/deletecategory", adminCheck, deleteCategory);

//Coupon
router.get("/coupon", adminCheck, viewCoupon);

router.get("/addcoupon", adminCheck, addCoupon);

router.post("/addcoupon", adminCheck, toAddCoupon);

router.patch("/couponblock", adminCheck, toBlockCoupon);

//SalesReports
router.get("/salesreport", adminCheck, toGetSalesReport);

router.get(
  "/salesreportbysearch",
  sessionCheckAxiosAdmin,
  getSalesReportBySearch
);

router.get("/chart", toGetChart);
router.get("/piechart", toGetPieChart);

module.exports = router;

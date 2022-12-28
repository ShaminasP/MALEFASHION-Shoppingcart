const { response } = require("express");
const categoryModel = require("../model/Categories");
const orderModel = require("../model/orderModel");
const Users = require("../model/usermodel");
const moment = require("moment");
const couponModel = require("../model/couponModel");
const { aggregate } = require("../model/Categories");
const productModel = require("../model/productModel");

const homeView = async (req, res, next) => {
  try {
    const totalSales = await orderModel.aggregate([
      {
        $match: { orderStatus: "Delivered" },
      },
      { $group: { _id: "", totalPrice: { $sum: "$totalPrice" } } },
      { $project: { _id: 0, totalPrice: "$totalPrice" } },
    ]);
    let totalPrice;
    if (totalSales.length > 0) {
      totalPrice = totalSales[0].totalPrice;
    } else {
      totalPrice = 0;
    }
    const totalUsers = await Users.find().count();
    const totalProducts = await productModel.find().count();
    const totalOrders = await orderModel.find().count();

    res.render("admin/home", {
      totalOrders,
      totalProducts,
      totalUsers,
      totalPrice,
    });
  } catch (error) {
    next(error);
  }
};

const loginView = (req, res, next) => {
  try {
    res.render("admin/login");
  } catch (error) {
    next(error);
  }
};
//view orders
const viewOrders = async (req, res, next) => {
  try {
    await orderModel
      .find()
      .sort({ _id: -1 })
      .then((orderDetails) => {
        res.render("admin/orders", { orderDetails });
      });
  } catch (error) {
    next(error);
  }
};

const viewOrderDetails = async (req, res, next) => {
  try {
    const ID = req.params.id;
    await orderModel
      .findById(ID)
      .populate("user")
      .populate("orderedItems.products")
      .then((products) => {
        res.render("admin/orderDetails", { products });
      });
  } catch (error) {
    next(error);
  }
};

const addProducts = (req, res, next) => {
  try {
    categoryModel.find().then((category) => {
      res.render("admin/add_products", { category });
    });
  } catch (error) {
    next(error);
  }
};

// view client details
const viewClients = (req, res, next) => {
  try {
    Users.find()
      .sort({ date: -1 })
      .then((userData) => {
        res.render("admin/clients", { userData });
      });
  } catch (err) {
    next(err);
  }
};

// user blocking
const blockUser = (req, res, next) => {
  try {
    const user = req.params.id;
    Users.findByIdAndUpdate(user, { isActive: false }, (err, data) => {
      if (err) {
        console.log("error");
      } else {
        res.redirect("/admin/clients");
      }
    });
  } catch (error) {
    next(error);
  }
};

//unblockuser
const unblockUser = (req, res, next) => {
  try {
    const user = req.params.id;
    Users.findByIdAndUpdate(user, { isActive: true }, (err, data) => {
      if (err) {
        console.log("error");
      } else {
        res.redirect("/admin/clients");
      }
    });
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//viewCategories
const viewCategory = async (req, res, next) => {
  try {
    await categoryModel
      .find()
      .sort({ _id: -1 })
      .then((data) => {
        res.render("admin/listCategories", { data });
      });
  } catch (err) {
    next(err);
    console.log(err.message);
  }
};

//coupon
const viewCoupon = async (req, res, next) => {
  try {
    const coupons = await couponModel.find().catch((error) => next(error));

    res.render("admin/coupon", { coupons });
  } catch (error) {
    next(error);
  }
};

const addCoupon = async (req, res, next) => {
  try {
    res.render("admin/addCoupon");
  } catch (error) {
    next(error);
  }
};

const toAddCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discount,
      startingdate,
      endingdate,
      discountlimit,
      coupouncount,
      cartamount,
    } = req.body;

    const newCoupon = await couponModel({
      couponCode: code,
      discount: discount,
      startingDate: startingdate,
      minCartAmount: cartamount,
      EndingDate: endingdate,
      discountLimit: discountlimit,
      couponCount: coupouncount,
    });
    newCoupon.save().catch((error) => next(error));

    res.redirect("/admin/coupon");
  } catch (error) {
    next(error);
  }
};

const toBlockCoupon = async (req, res, next) => {
  try {
    const couponID = req.body.id;
    await couponModel.findByIdAndUpdate(couponID, { couponStatus: false });
    res.json();
  } catch (error) {
    next(error);
  }
};

const adminLogout = (req, res, next) => {
  try {
    req.session.admin = false;
    res.redirect("/admin/login");
  } catch (error) {
    // res.render("/admin/error");
    next(error);
    console.log(error.message);
  }
};

//salesreports
const toGetSalesReport = async (req, res, next) => {
  try {
    const todayDate = new Date();
    const DaysAgo = new Date(new Date().getTime() - 30 * 24 * 660 * 60 * 1000);

    const saleReport = await orderModel
      .aggregate([
        {
          $match: {
            createdAt: { $gte: DaysAgo },
            orderStatus: { $eq: "Delivered" },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } },
            totalPrice: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
      ])
      .catch((error) => next(error));

    res.render("admin/salesreport", { saleReport });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const getSalesReportBySearch = async (req, res, next) => {
  try {
    const todayDate = new Date();
    const toDate = new Date(req.query.toDate);
    const fromDate = new Date(req.query.fromDate);
    if (toDate <= todayDate) {
    }
    const saleReport = await orderModel
      .aggregate([
        {
          $match: {
            createdAt: { $gte: fromDate, $lt: toDate },
            orderStatus: { $eq: "Delivered" },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } },
            totalPrice: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
      ])
      .catch((error) => next(error));

    res.json({ status: true, saleReport });
  } catch (error) {
    next(error);
  }
};

const toGetChart = async (req, res, next) => {
  try {
    const select = req.query.a;
    var date = new Date();
    var month = date.getMonth();
    var year = date.getFullYear();
    let sales = [];
    let PreviosSale = [];
    if (select == 365) {
      year = date.getFullYear();
      var currentYear = new Date(year, 0, 1);
      let salesByYear = await orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: currentYear },
            orderStatus: { $eq: "Delivered" },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%m", date: "$createdAt" } },
            totalPrice: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      for (let i = 1; i <= 12; i++) {
        let result = true;
        for (let k = 0; k < salesByYear.length; k++) {
          result = false;
          if (salesByYear[k]._id == i) {
            sales.push(salesByYear[k]);
            break;
          } else {
            result = true;
          }
        }
        if (result) sales.push({ _id: i, totalPrice: 0, count: 0 });
      }
      var lastYear = new Date(year - 1, 0, 1);
      let salesByLastYear = await orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: lastYear, $lt: currentYear },
            orderStatus: { $eq: "Delivered" },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%m", date: "$createdAt" } },
            totalPrice: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      for (let i = 1; i <= 12; i++) {
        let result = true;
        for (let k = 0; k < salesByLastYear; k++) {
          result = false;
          if (salesByLastYear[k] == i) {
            PreviosSale.push(salesByLastYear[k]);
            break;
          } else {
            result = true;
          }
        }
        if (result) PreviosSale.push({ _id: i, totalPrice: 0, count: 0 });
      }
      res.json({ sales: sales, PreviosSale: PreviosSale });
    } else if (select == 30) {
      let firstDay = new Date(year, month, 1);
      firstDay = new Date(firstDay.getTime() + 1 * 24 * 60 * 60 * 1000);
      let nextWeek = new Date(firstDay.getTime() + 7 * 24 * 60 * 60 * 1000);
      for (let i = 1; i <= 5; i++) {
        let abc = {};
        let salesByMonth = await orderModel.aggregate([
          {
            $match: {
              createdAt: { $gte: firstDay, $lt: nextWeek },
              orderStatus: { $eq: "Delivered" },
            },
          },
          {
            $group: {
              _id: moment(firstDay).format("DD-MM-YYYY"),
              totalPrice: { $sum: "$totalPrice" },
              count: { $sum: 1 },
            },
          },
        ]);
        if (salesByMonth.length) {
          sales.push(salesByMonth[0]);
        } else {
          (abc._id = moment(firstDay).format("DD-MM-YYYY")),
            (abc.totalPrice = 0);
          abc.count = 0;
          sales.push(abc);
        }

        firstDay = nextWeek;
        if (i == 4) {
          nextWeek = new Date(
            firstDay.getFullYear(),
            firstDay.getMonth() + 1,
            1
          );
        } else {
          nextWeek = new Date(
            firstDay.getFullYear(),
            firstDay.getMonth() + 0,
            (i + 1) * 7
          );
        }
      }

      let firstDayOfLastMonth = new Date(year, month - 1, 1);
      firstDayOfLastMonth = new Date(
        firstDayOfLastMonth.getTime() + 1 * 24 * 60 * 60 * 1000
      );
      let lastDayOfLastMonth = new Date(year, month, 1);
      for (let i = 1; i < 5; i++) {
        let abc = {};
        let salesByLastMonth = await orderModel.aggregate([
          {
            $match: {
              createdAt: { $gte: firstDayOfLastMonth, $lt: lastDayOfLastMonth },
              orderStatus: { $eq: "Delivered" },
            },
          },
          {
            $group: {
              _id: moment(firstDay).format("DD-MM-YYYY"),
              totalPrice: { $sum: "$TotalPrice" },
              count: { $sum: 1 },
            },
          },
        ]);
        if (salesByLastMonth.length) {
          PreviosSale.push(salesByLastMonth[0]);
        } else {
          abc._id = moment(firstDay).format("DD-MM-YYYY");
          abc.totalPrice = 0;
          abc.count = 0;
          PreviosSale.push(abc);
        }
        firstDay = nextWeek;
        if (i == 4) {
          nextWeek = new Date(
            firstDay.getFullYear(),
            firstDay.getMonth() + 1,
            1
          );
        } else {
          nextWeek = new Date(
            firstDay.getFullYear(),
            firstDay.getMonth() + 0,
            (i + 1) * 7
          );
        }
      }
      res.json({ sales: sales, PreviosSale: PreviosSale });
    } else if (select == 7) {
      let today = new Date();
      let lastDay = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
      for (let i = 1; i <= 7; i++) {
        let abc = {};
        let salesByWeek = await orderModel.aggregate([
          {
            $match: {
              createdAt: { $lt: today, $gte: lastDay },
              orderStatus: { $eq: "Delivered" },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%u", date: today } },
              totalPrice: { $sum: "$totalPrice" },
              count: { $sum: 1 },
            },
          },
        ]);
        if (salesByWeek.length) {
          sales.push(salesByWeek[0]);
        } else {
          abc._id = today.getDay() + 1;
          abc.totalPrice = 0;
          abc.count = 0;
          sales.push(abc);
        }
        today = lastDay;
        lastDay = new Date(
          new Date().getTime() - (i + 1) * 24 * 60 * 60 * 1000
        );
      }
      for (let i = 1; i <= 7; i++) {
        let abc = {};
        let salesByLastWeek = await orderModel.aggregate([
          {
            $match: { createdAt: { $lt: today, $gte: lastDay } },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%u", date: today } },
              totalPrice: { $sum: "$totalPrice" },
              count: { $sum: 1 },
            },
          },
        ]);

        if (salesByLastWeek.length) {
          PreviosSale.push(salesByLastWeek[0]);
        } else {
          abc._id = today.getDay() + 1;
          abc.totalPrice = 0;
          abc.count = 0;
          PreviosSale.push(abc);
        }
        today = lastDay;
        lastDay = new Date(
          new Date().getTime() - (i + 7) * 24 * 60 * 60 * 1000
        );
      }
      res.json({ sales: sales, PreviosSale: PreviosSale });
    }

    // res.json({ status });
  } catch (error) {
    next(error);
  }
};

const toGetPieChart = async (req, res, next) => {
  try {
    const delivered = await orderModel
      .find({ orderStatus: "Delivered" })
      .count();
    const cancelled = await orderModel
      .find({ orderStatus: "Cancelled" })
      .count();
    const returned = await orderModel.find({ orderStatus: "Returned" }).count();
    let status = [];

    status.push(delivered);
    status.push(cancelled);
    status.push(returned);
    res.json({ status });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  homeView,
  loginView,
  viewOrders,
  addProducts,
  viewClients,
  adminLogout,
  blockUser,
  unblockUser,
  viewCategory,
  viewOrderDetails,
  viewCoupon,
  addCoupon,
  toAddCoupon,
  toGetSalesReport,
  getSalesReportBySearch,
  toGetChart,
  toGetPieChart,
  toBlockCoupon,
};

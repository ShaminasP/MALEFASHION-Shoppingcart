const productModel = require("../model/productModel");
const orderModel = require("../model/orderModel");
const walletModel = require("../model/walletModel");

exports.inventory = (productID, productQty) => {
  return new Promise((resolve, reject) => {
    productModel
      .findOneAndUpdate({ _id: productID }, { $inc: { quantity: productQty } })
      .then((e) => {
        resolve();
      });
  });
};

exports.refund = (userID, ID, total) => {
  return new Promise(async (resolve, reject) => {
    const wallet = await walletModel.findOne({ user: userID });
    if (!wallet) {
      const newWallet = new walletModel({
        user: userID,
        cancelled: {
          orderId: ID,
          refAmnt: total,
        },
        walletBalance: total,
      });
      newWallet.save().then((e) => {
        resolve();
      });
    } else {
      await walletModel
        .updateOne(
          { user: userID },
          {
            $push: { cancelled: { orderId: ID, refAmnt: total } },
            $inc: { walletBalance: total },
          }
        )
        .then((e) => {
          resolve();
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  });
};


exports.pagination=(model)=>{
  return async (req, res, next) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}

    results.current={page,limit}

    if (endIndex < await model.countDocuments().exec()) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
      results.results = await model.find().limit(limit).skip(startIndex).exec()
      res.paginatedResults = results
      next()
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}
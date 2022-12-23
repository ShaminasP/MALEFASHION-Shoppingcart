const products = require("../model/productModel");
const categoryModel = require("../model/Categories");
const bannerModel = require("../model/bannerModel");
const reviewModel = require("../model/reviewSchema");
const { findById } = require("../model/usermodel");
const cart = require("../model/cartModel");
const wishList = require("../model/wishList");
const moment = require("moment");
const { default: mongoose } = require("mongoose");
const { resendOtp } = require("./authController");
const { response } = require("express");
const productModel = require("../model/productModel");

//adding products to database
const adminAddProduct = async (req, res, next) => {
  try {
    const {
      productname,
      price,
      quantity,
      category,
      size,
      offer,
      description,
      date,
    } = req.body;
    const categoryOff = await categoryModel.findById(category, {
      _id: 0,
      discount: 1,
    });
    const discountPriceCategory = Math.round(
      price - (price * categoryOff.discount) / 100
    );
    const discountPriceProduct = Math.round(price - (price * offer) / 100);
    let discountPrice;
    if (discountPriceCategory < discountPriceProduct) {
      discountPrice = discountPriceCategory;
    } else {
      discountPrice = discountPriceProduct;
    }
    const newProduct = products({
      productname: productname,
      price: price,
      offPrice: discountPrice,
      category: category,
      quantity: quantity,
      size: size,
      offer: offer,
      description: description,
      Image: req.files,
      date: moment(date).format("DD-MM-YYYY"),
    });

    await newProduct.save();
    res.redirect("/admin/product");
  } catch (error) {
    next(error);
    // res.render("/admin/error");
    console.log(error.message);
  }
};

//viewing products
const productsView = async (req, res, next) => {
  try {
    products
      .find()
      .populate("category")
      .sort({ _id: -1 })
      .then((data) => {
        res.render("admin/product-management", { data });
      })
      .catch((error) => {
        conosole.log(error);
      });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// edit products
const editProduct = async (req, res, next) => {
  try {
    const ID = req.params.id;
    const category = await categoryModel.find();
    await products
      .findById(ID)
      .populate("category")
      .then((details) => {
        res.render("admin/edit-product", { details, category });
      });
  } catch (error) {
    next(error);
    // res.render("/admin/error");
    console.log(error.message);
  }
};

// update product
const updateProduct = async (req, res, next) => {
  try {
    const ID = req.params.id;
    const { productname, category, price, size, offer, quantity, description } =
      req.body;
    const img = req.files;
    let { Image } = await products.findById(ID, { Image: 1, _id: 0 });

    if (img.length) {
      Image = img.concat(Image);
    }
    const off = await categoryModel.findById(category, { _id: 0, discount: 1 });
    const discount = off.discount;
    const categoryOffPrice = Math.round(price - (price * discount) / 100);
    const productOfferPrice = Math.round(price - (price * offer) / 100);
    let offPrice;
    if (discount == 0 && offer == 0) {
      offPrice = 0;
    } else {
      if (categoryOffPrice < productOfferPrice) {
        offPrice = categoryOffPrice;
      } else {
        offPrice = productOfferPrice;
      }
    }
    await products
      .findByIdAndUpdate(ID, {
        productname: productname,
        category: category,
        price: price,
        offer: offer,
        offPrice: offPrice,
        size: size,
        Image: Image,
        quantity: quantity,
        description: description,
      })
      .then(() => {
        res.redirect("/admin/product");
      });
  } catch (error) {
    next(error);
    // res.render("/admin/error");
    console.log(error.message);
  }
};

// delete
const deleteProduct = async (req, res, next) => {
  try {
    const ID = req.body.id;
    products.findByIdAndDelete(ID).then(() => {
      res.json({ response: true });
    });
  } catch (error) {
    // res.render("/admin/error");
    console.log(error.message);
  }
};

//add category
const addCategory = async (req, res, next) => {
  try {
    const discount = req.body.discount;
    const input = req.body.category;
    const category = input.toUpperCase();
    const img = req.files;
    const newCategory = categoryModel({
      category: category,
      image: img,
      discount: discount,
      date: moment().format("DD-MM-YYYY"),
    });
    await newCategory.save();
    res.redirect("/admin/category");
  } catch (error) {
    next(error);
    // res.render("/admin/error");
    console.log(error.message);
  }
};

//edit category
const editCategory = async (req, res, next) => {
  try {
    const ID = req.params.id;
    await categoryModel.findById(ID).then((details) => {
      res.render("admin/editCategory", { details });
    });
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//update category
const updateCategory = async (req, res, next) => {
  try {
    const ID = req.params.id;
    const img = req.files;
    let Image;
    let { category, discount } = req.body;

    await productModel.updateMany(
      {
        category: ID,
        offer: { $gt: discount },
      },
      [
        {
          $set: {
            offPrice: {
              $round: [
                {
                  $subtract: [
                    "$price",
                    {
                      $divide: [{ $multiply: ["$price", "$offer"] }, 100],
                    },
                  ],
                },
              ],
            },
          },
        },
      ]
    );

    await productModel.updateMany(
      {
        category: ID,
        offer: { $lte: discount },
      },
      [
        {
          $set: {
            offPrice: {
              $round: [
                {
                  $subtract: [
                    "$price",
                    {
                      $divide: [
                        { $multiply: ["$price", Number(discount)] },
                        100,
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      ]
    );
    category = category.toUpperCase();
    if (img.length) Image = img;
    await categoryModel
      .findByIdAndUpdate(ID, {
        category: category,
        discount: discount,
        image: Image,
      })
      .then(() => {
        res.redirect("/admin/category");
      });
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//delete category
const deleteCategory = async (req, res, next) => {
  try {
    const ID = req.body.id;
    products.findOne({ category: ID }).then((categoryIs) => {
      if (!categoryIs) {
        categoryModel.findByIdAndDelete(ID).then(() => {
          res.json({ response: true });
        });
      } else {
        res.json({ response: false });
      }
    });
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//add to cart
const addToCart = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const proID = req.body.id;
    const prod = await products.findById(proID);
    const productprice = prod.price;
    const offPrice = prod.offPrice;
    let price;
    if (offPrice != 0) {
      price = offPrice;
    } else {
      price = productprice;
    }

    const productQuantity = prod.quantity;
    const Cart = await cart.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $project: {
          bucket: {
            $filter: {
              input: "$bucket",
              cond: {
                $eq: ["$$this.products", mongoose.Types.ObjectId(proID)],
              },
            },
          },
        },
      },
    ]);

    const user = await cart.findOne({ user: userId });
    if (!user) {
      if (productQuantity > 0) {
        const newCart = new cart({
          user: userId,
          bucket: [{ products: proID, total: price }],
          subtotal: price,
        });
        newCart.save();
        res.json({ response: true });
      } else {
        res.json({ response: false });
      }
    } else {
      const cartOld = await cart.findOne({
        user: userId,
        "bucket.products": proID,
      });

      if (cartOld) {
        const cartQuantity = Cart[0].bucket[0].quantity;

        if (cartQuantity < productQuantity) {
          await cart.updateOne(
            {
              user: userId,
              "bucket.products": proID,
            },
            {
              $inc: {
                "bucket.$.quantity": 1,
                "bucket.$.total": price,
                subtotal: price,
              },
            }
          );
          res.json({ response: true });
        } else {
          res.json({ response: false });
        }
      } else {
        if (productQuantity > 0) {
          const cartArray = { products: proID, total: price };
          await cart.findOneAndUpdate(
            {
              user: userId,
            },
            {
              $push: { bucket: cartArray },
              $inc: { subtotal: price },
            }
          );
          res.json({ response: true });
        } else {
          res.json({ response: false });
        }
      }
    }
  } catch (error) {
    next(error);
    res.render("user/error");
    console.log(error.message);
  }
};

//addQuatity
const toAddQuantity = async (req, res, next) => {
  try {
    const proId = req.query.id;
    const userId = req.session.user._id;
    const product = await products.findById(proId);
    const price = product.price;
    const offerPrice = product.offPrice;
    let productPrice;
    if (offerPrice != 0) {
      productPrice = offerPrice;
    } else {
      productPrice = price;
    }
    const productQuantity = product.quantity;
    const Cart = await cart.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $project: {
          bucket: {
            $filter: {
              input: "$bucket",
              cond: {
                $eq: ["$$this.products", mongoose.Types.ObjectId(proId)],
              },
            },
          },
        },
      },
    ]);
    const cartQuantity = Cart[0].bucket[0].quantity;
    if (cartQuantity < productQuantity) {
      await cart
        .findOneAndUpdate(
          { user: userId, "bucket.products": proId },
          {
            $inc: {
              "bucket.$.quantity": 1,
              "bucket.$.total": productPrice,
              subtotal: productPrice,
            },
          }
        )
        .then(() => {
          cart
            .aggregate([
              {
                $match: {
                  user: mongoose.Types.ObjectId(userId),
                },
              },
              {
                $project: {
                  subtotal: 1,
                  bucket: {
                    $filter: {
                      input: "$bucket",
                      cond: {
                        $eq: [
                          "$$this.products",
                          mongoose.Types.ObjectId(proId),
                        ],
                      },
                    },
                  },
                },
              },
            ])
            .then((quantity) => {
              const total = quantity[0].bucket[0].total;
              const subtotal = quantity[0].subtotal;
              const qty = quantity[0].bucket[0].quantity;
              res.json({
                response: true,
                total: total,
                subtotal: subtotal,
                quantity: qty,
              });
            });
        });
    } else {
      res.json({ response: false });
    }
  } catch (error) {
    next(error);
    res.render("user/error");
    console.log(error.message);
  }
};

//reduce quantity
const toReduceQuantity = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const proId = req.query.id;
    const product = await products.findById(proId);
    const price = product.price;
    const offerPrice = product.offPrice;
    let productPrice;
    if (offerPrice != 0) {
      productPrice = offerPrice;
    } else {
      productPrice = price;
    }
    await cart
      .findOneAndUpdate(
        { user: userId, "bucket.products": proId },
        {
          $inc: {
            "bucket.$.quantity": -1,
            "bucket.$.total": -productPrice,
            subtotal: -productPrice,
          },
        }
      )
      .then(() => {
        cart
          .aggregate([
            {
              $match: {
                user: mongoose.Types.ObjectId(userId),
              },
            },
            {
              $project: {
                subtotal: 1,
                bucket: {
                  $filter: {
                    input: "$bucket",
                    cond: {
                      $eq: ["$$this.products", mongoose.Types.ObjectId(proId)],
                    },
                  },
                },
              },
            },
          ])
          .then((quantity) => {
            const total = quantity[0].bucket[0].total;
            const subtotal = quantity[0].subtotal;
            const qty = quantity[0].bucket[0].quantity;
            res.json({
              response: true,
              total: total,
              subtotal: subtotal,
              quantity: qty,
            });
          });
      });
  } catch (error) {
    next(error);
    res.render("user/error");
    console.log(error.message);
  }
};

//delete products in cart

const toDeleteCart = async (req, res, next) => {
  try {
    const userID = req.session.user._id;
    const productID = req.body.id;
    const prd = await cart.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userID),
        },
      },
      {
        $project: {
          bucket: {
            $filter: {
              input: "$bucket",
              cond: {
                $eq: ["$$this.products", mongoose.Types.ObjectId(productID)],
              },
            },
          },
        },
      },
    ]);
    const price = prd[0].bucket[0].total;
    await cart
      .findOneAndUpdate(
        { user: userID },
        {
          $pull: { bucket: { products: productID } },
          $inc: { subtotal: -price },
        }
      )
      .then(() => {
        res.json();
      });
  } catch (error) {
    next(error);
    res.render("user/error");
    console.log(error.message);
  }
};

//wishList
const addToWishList = async (req, res, next) => {
  try {
    const userID = req.session.user._id;
    const productID = req.body.id;
    wishList.findOne({ user: userID }).then((user) => {
      if (!user) {
        const newWishList = new wishList({
          user: userID,
          wishlist: [{ product: productID }],
        });
        newWishList.save();
        res.json({ return: true });
      } else {
        wishList
          .findOne({ user: userID, "wishlist.product": productID })
          .then((isList) => {
            if (!isList) {
              const wishlistarray = { product: productID };

              wishList
                .findOneAndUpdate(
                  { user: userID },
                  { $push: { wishlist: wishlistarray } }
                )
                .then((e) => {
                  res.json({ return: true });
                });
            } else {
              res.json({
                return: false,
              });
            }
          });
      }
    });
  } catch (error) {
    next(error);
    res.render("user/error");
    console.log(error.message);
  }
};

//delete wishlist
const toDeleteList = async (req, res, next) => {
  try {
    const ID = req.body.id;
    const userID = req.session.user._id;

    await wishList
      .findOneAndUpdate({ user: userID }, { $pull: { wishlist: { _id: ID } } })
      .then(() => {
        res.json();
      });
  } catch (error) {
    next(error);
    res.render("user/error");
    console.log(error.message);
  }
};

//banner
const addbanner = (req, res, next) => {
  res.render("admin/addbanner");
};

const toAddBanner = async (req, res, next) => {
  try {
    const { heading, sub, url, description } = req.body;
    const newBanner = new bannerModel({
      heading: heading,
      sub: sub,
      url: url,
      description: description,
      image: req.files,
    });
    newBanner.save();
    res.redirect("/admin/banner");
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

const viewBanner = async (req, res, next) => {
  try {
    await bannerModel
      .find()
      .sort({ _id: -1 })
      .then((details) => {
        res.render("admin/banner", { details });
      });
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

//review
const review = async (req, res, next) => {
  try {
    let userId = req.session.user._id;
    let { rating, review, id, title } = req.body;
    rating = rating * 20;
    const reviews = {};
    reviews.rating = rating;
    reviews.product = id;
    reviews.user = userId;
    reviews.review = review;
    reviews.title = title;
    reviewModel
      .create(reviews)
      .then(async () => {
        let rat = ({} = await products.findById(id, { _id: 0, rating: 1 }));
        if (rat.rating) rating = (rating + rat.rating) / 2;
        await products.findByIdAndUpdate(id, {
          $inc: { review: 1 },
          $set: { rating: rating },
        });
        res.json();
      })
      .catch((error) => next(error));
  } catch (error) {
    next(error);
  }
};

const toFilter = async (req, res, next) => {
  try {
    const categoryID = req.query.id;
    const productByCategory = await products.find({ category: categoryID });
    console.log(productByCategory);

    res.json({ productByCategory });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminAddProduct,
  productsView,
  editProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  editCategory,
  updateCategory,
  deleteCategory,
  addToCart,
  toAddQuantity,
  toReduceQuantity,
  addToWishList,
  toDeleteList,
  toDeleteCart,
  addbanner,
  toAddBanner,
  viewBanner,
  review,
  toFilter,
};

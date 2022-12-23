const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  heading: {
    type: String,
  },
  description: {
    type: String,
  },
  sub: {
    type: String,
  },
  image: {
    type: Array,
  },
  url: {
    type: String,
  },
});

const banner = mongoose.model("banner", bannerSchema);
module.exports = banner;

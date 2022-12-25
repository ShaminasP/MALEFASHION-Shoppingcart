const userModel = require("../model/usermodel");

exports.sessionCheck = async (req, res, next) => {
  if (req.session.user) {
    const userId = req.session.user._id;
    const user = await userModel.findOne({ _id: userId, isActive: true });
    if (user) {
      next();
    } else {
      req.session.user = false;
      res.redirect("/login");
    }
  } else res.redirect("/login");
};

exports.sessionCheckAxios = (req, res, next) => {
  if (req.session.user) next();
  else res.json({ session: "login" });
};

exports.loginCheck = (req, res, next) => {
  if (req.session.user) res.redirect("/");
  else next();
};

exports.adminCheck = (req, res, next) => {
  if(req.session.admin)
  next();
  else res.redirect('/admin/login')
};






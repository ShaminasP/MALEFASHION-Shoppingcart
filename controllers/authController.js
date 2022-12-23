const User = require("../model/usermodel");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { sendSms, veryfySms } = require("../verification/twilio");

// User Signup
const userRegister = async (req, res,next) => {
  try {
    //checking the email already exists in the database
    const { email, mobile } = req.body;
    User.findOne({ email: email }).then(async (olduser) => {
      if (!olduser) {
        req.session.newuser = req.body;

        const phone = mobile;
        sendSms(phone);
        res.redirect("/otp");
      } else {
        return res.redirect("/login");
      }
    });
  } catch (err) {
    next(err)
    console.log(err.message);
  }
};

//veryfying the OTP
const userOtp = async (req, res,next) => {
  try {
    const otp = req.body.otp;

    const { name, email, mobile, password, date, isActive } =
      req.session.newuser;
    const phone = mobile;
    //pasword encryption
    let hasdPassword = await bcrypt.hash(password, 10);
    await veryfySms(phone, otp).then((verification_check) => {
      if (verification_check.status == "approved") {
        const newUser = new User({
          email: email,
          name: name,
          mobile: mobile,
          password: hasdPassword,
          date:  moment(date).format("DD-MM-YYYY"),
          isActive: isActive,
        });
        newUser.save();
        res.redirect("/login");
      } else {
      }
    });
  } catch (err) {
    next(err)
    console.log(err.message);
  }
};

//otp resend
const resendOtp = async (req, res,next) => {
  const { mobile } = req.session.newuser;
  const phone = mobile;
  sendSms(phone);
};

//user Login
const userLogin = async (req, res,next) => {
  try {
    const { email, password } = req.body;
    let userOne = await User.findOne({ email: email });
    if (!userOne) {
      req.flash("MSG", "No User Found");
      res.redirect("/login");
    } else {
      let compare = await bcrypt.compare(password, userOne.password);
      if (!compare) {
        req.flash("MSG", "Password Doesn't Match");
        res.redirect("/login");
      } else {
        if (userOne.isActive) {
          req.session.user = true;
          req.session.user = userOne;
          res.redirect("/");
        } else {
          req.flash("MSG", "Your account is temporarily suspended");
          res.redirect("/login");
        }
      }
    }
  } catch (err) {
    next(err)
    console.log(err.message);
  }
};

//admin login
const adminLogin = (req, res,next) => {
  const user = { email: "admin@1", password: 123 };
  try {
    if (req.body.email == user.email && req.body.password == user.password) {
      req.session.admin = true;
      res.redirect("/admin");
    } else {
      req.session.admin = false;
      res.redirect("/admin/login");
    }
  } catch (error) {
    next(error)
  }
};

module.exports = {
  userRegister,
  userLogin,
  adminLogin,
  userOtp,
  resendOtp,
};

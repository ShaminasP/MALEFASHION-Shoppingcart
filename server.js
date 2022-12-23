const express = require("express");
const dotenv = require("dotenv");
const app = express();
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const logger = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("express-flash");
require("dotenv").config();
//setting routes
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
app.use(
  session({
    secret: "ttt",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 * 100 },
  })
);
// Flash:::::::;
app.use(flash());
//seting view engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.json());
//app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

app.set("layout", "layouts/layout");
app.use(expressLayouts);
// user ststic files
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(__dirname + "/public/user/css"));
app.use("/fonts", express.static(__dirname + "/public/user/fonts"));
app.use("/img", express.static(__dirname + "/public/user/img"));
app.use("/js", express.static(__dirname + "/public/user/js"));
app.use("/sass", express.static(__dirname + "/public/user/sass"));

// admin static files
app.use("/css", express.static(__dirname + "/public/admin/css"));
app.use("/img", express.static(__dirname + "public/admin/img"));
app.use("/js", express.static(__dirname + "public/admin/js"));
app.use("/scss", express.static(__dirname + "public/admin/scss"));
app.use("/vendor", express.static(__dirname + "piblic/admin/vendor"));
app.use(
  "/documentation",
  express.static(__dirname + "public/admin/documentation")
);
app.use("/icons", express.static(__dirname + "public/admin/icons"));

app.use("/", userRouter);
app.use("/admin", adminRouter);

// session

app.use((req, res, next) => {
  res.set(
    "cache-control",
    "no-cache,private,max-age=0,no-store,must revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  next();
});

//

// settining mongoose
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});


 
app.use((err, req, res, next) => {
  console.log(err)
  res.render('user/404')
})


app.listen(process.env.PORT);

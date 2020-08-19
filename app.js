const express = require("express"),
  favicon = require("serve-favicon"),
  path = require("path"),
  app = express(),
  bodyParser = require("body-parser"),
  flash = require("connect-flash"),
  mongoose = require("mongoose"),
  compression = require("compression"),
  User = require("./models/user"),
  Transaction = require("./models/transaction"),
  dummyTrans = require("./models/dummyTrans"),
  methodOverride = require("method-override"),
  passport = require("passport"),
  cookieParser = require("cookie-parser");

LocalStrategy = require("passport-local");
// SocketIO.io additions
//    *****

// requiring routes
const indexRoutes = require("./routes/index"),
  accountRoutes = require("./routes/account"),
  chatRoutes = require("./routes/chat");
bankingRoutes = require("./routes/banking");

const uri =
  "mongodb+srv://zeus:zeus@sajjal-lzue3.mongodb.net/sajjal?ssl=true&replicaSet=sajjal-shard-0&authSource=admin";

// noinspection SpellCheckingInspection
// use for online db
// mongoose.connect(uri, {dbName: "sajjal"}).catch((error) => {
//   console.log(error);
// });

mongoose.connect("mongodb://localhost:27017/sajjal", { useNewUrlParser: true });

app.set("view engine", "ejs");
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(compression());
app.use(cookieParser());

//=========================================================
//passport setup
app.use(
  require("express-session")({
    secret: "glitch free technologies",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//==========================================================

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.failedlogin = req.flash("failedlogin");

  if (req.path !== "/login" && req.session.returnTo) {
    delete req.session.returnTo;
  }
  next();
});

app.use(indexRoutes);
app.use(accountRoutes);
app.use(chatRoutes);
app.use(bankingRoutes);

if (process.env.NODE_ENV === "production") {
  console.log("We are running in production mode");
} else {
  console.log("We are running in development mode");
}

app.listen(process.env.PORT || 4009, function () {
  console.log("server is running");
  console.log("server is running");
});

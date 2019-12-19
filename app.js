require("dotenv").config();

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    seedDB = require("./seeds"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user"),
    methodOverride = require("method-override"),
    flash = require("connect-flash");
    



//Requiring Routes
var commentRoutes = require("./routes/comments"),
    campgroundsRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");



mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);


//APP Config
//Change connection string when connecting to DB in the cloud during deployment
mongoose.connect("mongodb://localhost/yelp_camp")
    .then( () => console.log("Connected to DB!"))
    .catch( err => console.log("ERROR:", err.message) );


app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// seedDB();

//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "This is the secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//making currentUser available to EVERY template, so we dont have to manually send it everytime we render one

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.moment = require("moment");
    // for every request retrieve any flash messages (else an empty array) stored under the keys of
    // "error" and "success" and use appropriate variables(under locals) to point to them
    //So, for each request, these vars will point to any exist ing error/success messages, else to a null array
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/campgrounds",campgroundsRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

//change port to "process.env.PORT" and add ip (2nd param) as "process.env.IP" when deploying
app.listen(3000, , function() {
    console.log("Server Started");
});
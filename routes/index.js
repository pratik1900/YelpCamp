var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    User = require("../models/user");
    Campground = require("../models/campground"),
    // async = require("async"),
    // nodemailer = require("nodemailer"),
    // crypto = require("crypto");


// Root Route

router.get('/', function(req, res){
    res.render("landing");
});



//================================
//AUTH ROUTES
//================================

//show registration form
router.get("/register", function(req, res){
    res.render("register");
});

//registetration logic
router.post("/register", function(req, res){
    //creating DB entry
    var newUser = new User({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        avatar: req.body.avatar
    });
    if(req.body.adminCode === "123") {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        //automatically loggin-in after creating entry
        passport.authenticate("local")(req, res, function(){
            console.log(user);
            req.flash("success", "Welcome to Yelpcamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//show login form
router.get("/login", function(req, res){
    res.render("login");
});

//login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
        //cb doesnt do anything
});

//logout logic
router.get("/logout", function(req,res){
    req.logOut();
    req.flash("success", "Logged you out");
    res.redirect("/campgrounds");
});


//User profile
router.get("/user/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err || !foundUser) {
            req.flash("error", "There was a problem finding the user profile.");
            return res.redirect("/");
        }
        // Finding and passing capgrounds created by this user to the template 
        Campground.find().where("author.id").equals(foundUser._id).exec( function(err, personalAdditions){
            if(err) {
                req.flash("error", "Womething went wrong.");
                return res.redirect("/");
            } 
            res.render("users/show", {user: foundUser, personalAdditions: personalAdditions });
        });
    });
});

//For Password Reset
// router.get("/forgot", function(req, res){
//     res.render("forgot");
// });


module.exports = router;
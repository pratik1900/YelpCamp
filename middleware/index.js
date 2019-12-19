//All middleware goes here
var Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    //Check if  User is logged in
  if(req.isAuthenticated()){
      Campground.findById(req.params.id, function(err, foundCampground){
          if(err || !foundCampground){
            req.flash("error", "Campground not found.");
            res.redirect("back");
          } else {
              //check if logged-in user owns the campground (can't use === as one is string, other is object), of if the user is an admin
              if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                  next();
              } else {
                req.flash("error", "You don't have permission to do that.");
                res.redirect("back");
              }
          }
      });
  } else {
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("back");
  } 
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    //Check if  User is logged in
    if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err || !foundComment){
            res.redirect("back");
        } else {
            //check if logged-in user owns the Comment (can't use === as one is string, other is object)
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            } else {
                req.flash("error", "You don't have permission to do that.");
                res.redirect("back");
            }
        }
    });
} else {
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("back");
} 
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    //flash the error message "Please Log in first" on the next request
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("/login");
}



module.exports = middlewareObj;
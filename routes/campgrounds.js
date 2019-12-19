var express = require("express"),
    router = express.Router(),
    Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    middleware = require("../middleware"),
    multer = require("multer");
   
// IMAGE UPLOAD FEATURE = MULTER + CLOUDINARY
//Configuring Multer
var storage = multer.diskStorage({
        filename: function(req, file, callback){
            callback(null, Date.now() + file.originalname);
        }
    });

var imageFilter = function (req, file, cb){
    //accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
        return cb(new Error("Only Image files are allowed!"), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter});

//Configuring Cloudinary
var cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name : "pratik2",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// INDEX ROUTE - Show all Campgrounds
router.get("/", function(req, res){
    //if any perticular campground is searched for
    if (req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        Campground.find({name: regex}, function(err, allCampgrounds){
            if(err){
                req.flash("error", err);
                res.redirect("back");
            } else {
                if (allCampgrounds.length<1){
                    req.flash("error", "No campground found with matching name.");
                    return res.redirect("back");
                }
                res.render("campgrounds/index", {campgrounds : allCampgrounds});
            }
        });
    //for displaying all campgrounds (no search query)
    } else {
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                req.flash("error", err);
                res.redirect("back");
            } else {
                res.render("campgrounds/index", {campgrounds : allCampgrounds});
            }
        });
    }
});

//CREATE Route - add new campground to DB
router.post('/', middleware.isLoggedIn, upload.single("image"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(err, result) {
        if(err){
            return console.log(err);
        }
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        //add image's public_id to campground object (will be required to delete old image when updated with new image)
        req.body.campground.imageId = result.public_id;
        // add author to campground
        req.body.campground.author = {
          id: req.user._id,
          username: req.user.username
        }
        Campground.create(req.body.campground, function(err, campground) {
          if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
          }
          res.redirect('/campgrounds/' + campground.id);
        });
      });
});

// NEW Route - show form to create new campground 
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

// SHOW Route - Show one particular campground details [BE SURE TO PLACE BELOW NEW Route, 
// else requests to NEW ROUTE triggers THIS]
router.get('/:id', function(req, res){

    //Find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground){
        if(err || !foundCampground){
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if (err || !foundCampground){
            res.redirect("back");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});
//UPDATE Route

router.put("/:id", upload.single("image"), middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, async function(err, foundCampground){
        if(err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            //updating the IMAGE
            //if there is a new image file to be uploaded (there might not be, e.g. just a name change)
            if(req.file){
                try{
                    //delete the old picture
                    await cloudinary.uploader.destroy(foundCampground.imageId);
                    //upload new image
                    var result = await cloudinary.uploader.upload(req.file.path); 
                    foundCampground.image = result.secure_url;
                    foundCampground.imageId = result.public_id;
                } catch(err) {
                    console.log(err);
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            // Updating info OTHER than new image (e.g. name, price, description) [author, comments, date added wont change])
            foundCampground.name = req.body.campground.name; 
            foundCampground.price = req.body.campground.price; 
            foundCampground.description = req.body.campground.description; 
            foundCampground.save();

            req.flash("success", "Successfully Updated!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DESTROY Campground Route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, async function(err, foundCampground){
        if(err || !foundCampground) {
            req.flash("error", err);
            return res.redirect("/campgrounds");
        }
        try {
            //delete Campground image hosted on Cloduinary
            await cloudinary.uploader.destroy(foundCampground.imageId);
            //delete the campground entry from the DB
            foundCampground.remove();
            //Remove comments associated with the deleted campground
            Comment.deleteMany({_id: {$in : foundCampground.comments}});
            req.flash("success", "Campground successfully removed.");
            res.redirect("/campgrounds");
        } catch(err) {
            if (err){
                console.log(err);
            } else {
                res.redirect("/campgrounds");
            }
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
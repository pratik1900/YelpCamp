var mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment");

var data = [
    {
        name: "Cloud's Rest",
        image: "http://phoenixpopup.com/wp-content/uploads/2014/05/bigstock-Tent-in-the-hikers-camp-in-mou-49619450.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pretium viverra suspendisse potenti nullam ac tortor. Nisi scelerisque eu ultrices vitae auctor eu augue ut lectus. Eget sit amet tellus cras adipiscing enim. Eget aliquet nibh praesent tristique magna sit. Natoque penatibus et magnis dis parturient. Integer eget aliquet nibh praesent tristique magna sit amet purus. Accumsan lacus vel facilisis volutpat est velit egestas dui. Morbi tincidunt augue interdum velit euismod in pellentesque massa placerat. Amet nulla facilisi morbi tempus iaculis urna id."
    },
    {
        name: "Desert Mesa",
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2F4.bp.blogspot.com%2F-eg9R1wCYBxQ%2FWWm0sd9dezI%2FAAAAAAAABLg%2FK_LnpgVtQOA2h0zQp_GI3oxp59ynBm4wACEwYBhgL%2Fs1600%2F2.jpg&f=1&nofb=1",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pretium viverra suspendisse potenti nullam ac tortor. Nisi scelerisque eu ultrices vitae auctor eu augue ut lectus. Eget sit amet tellus cras adipiscing enim. Eget aliquet nibh praesent tristique magna sit. Natoque penatibus et magnis dis parturient. Integer eget aliquet nibh praesent tristique magna sit amet purus. Accumsan lacus vel facilisis volutpat est velit egestas dui. Morbi tincidunt augue interdum velit euismod in pellentesque massa placerat. Amet nulla facilisi morbi tempus iaculis urna id."
    },
    {
        name: "Canyon Floor",
        image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg.sunset02.com%2Fsites%2Fdefault%2Ffiles%2Fstyles%2F4_3_horizontal_-_1200x900%2Fpublic%2Fimage%2F2016%2F09%2Fmain%2Fcamping-arches.jpg&f=1&nofb=1",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pretium viverra suspendisse potenti nullam ac tortor. Nisi scelerisque eu ultrices vitae auctor eu augue ut lectus. Eget sit amet tellus cras adipiscing enim. Eget aliquet nibh praesent tristique magna sit. Natoque penatibus et magnis dis parturient. Integer eget aliquet nibh praesent tristique magna sit amet purus. Accumsan lacus vel facilisis volutpat est velit egestas dui. Morbi tincidunt augue interdum velit euismod in pellentesque massa placerat. Amet nulla facilisi morbi tempus iaculis urna id."
    },
];

function seedDB() {
    //Remove all Campgrounds
    Campground.remove({}, function(err){
        if(err){
            console.log(err);
        } else {
            console.log("Removed Campgrounds!");
            Comment.remove({}, function(err){
                if(err){
                    console.log(err);
                }
                else {
                    console.log("removed comments!");
                    //Add Campgrounds
                    data.forEach(function(seed){
                        Campground.create(seed, function(err, createdCampground){
                            if(err) {
                                console.log(err);
                            } else{
                                console.log("Campground Added!");
                                //Add Comment
                                Comment.create({
                                    text: "WoW, this is great!",
                                    author: "Homer"
                                }, function(err, createdComment){
                                    if (err){
                                        console.log(err);
                                    } else {
                                        createdCampground.comments.push(createdComment);
                                        createdCampground.save();
                                        console.log("Created new Comment!");
                                    }
                                });
                            }
                        });
                    });
                }
            });            
        }
    });
};

module.exports = seedDB;
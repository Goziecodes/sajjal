var User            = require("../models/user"),
Zeus            = require("../models/zeus"),
    Transaction     = require("../models/transaction");


// all middle ware goes here 
var middlewareObj = {};

// middleware to confirm if a user is admin before rendering admin page
middlewareObj.checkIfAdmin = function(req, res, next){
    if(req.isAuthenticated()){
        // console.log(req.user);
        User.findById(req.user._id,  function(err, foundUser){
            if (err){
                res.redirect("/");
            } else {
                // console.log(foundUser);
                // console.log(foundUser.role);
                // console.log(req.body);
                if(foundUser.role === "admin" || req.user.role ==="admin"){
                    next();
                } else {
                    res.redirect("/"); 
                }
            }
        });
    } else {
        res.redirect("/login");
    }
}


middlewareObj.checkTransactionOwnership = function(req, res, next){
    // console.log(typeof(req.params.id) );
    // console.log(typeof(req.user._id));
    if(req.isAuthenticated()){
        User.findById(req.params.id, function(err, foundUser){
            // console.log(foundUser)
            if(err){
                console.log(err)
            } else { 
                if(!foundUser.transaction_id){
                    // return res.redirect("back");
                     return next();
                }
                if(foundUser.transaction_id.equals(req.user._id)|| req.user.role === "admin"){
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else{
        res.redirect("back");
    }
}



middlewareObj.checkIfBlocked = function(req, res, next){    
  
    User.findOne({username: req.body.username}, function(err, foundUser){
        User.findOne({username: req.body.username}, function(err, foundUser){
            if (err){
                return res.redirect("/login");
            }
            if (foundUser == null){
                req.flash("failedlogin", "username or password incorrect");
             return   res.redirect("/login");
            }   else {
                if (foundUser.allowed == false){
                    req.flash("failedlogin", "account blocked, please contact customer service");
                 return   res.redirect("/login");
                }
            }
            if (foundUser.allowed == true){
                next();
            }
        });
        
    });
  } 

middlewareObj.verify = function (req, res, next){    
        // console.log(req.user);
        User.findOne({username: req.body.username}, function(err, foundUser){
            if (err){
              res.redirect("/signup");
            } else {
                //  console.log(foundUser);
                if(foundUser.active || foundUser.role === "admin" ){
                    next();
                } else {
                  
                    res.redirect("/verify/:token");
                }
            }
        });
    } 
   





middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        next();
    }   else {
         req.session.returnTo = req.originalUrl;
        res.redirect("/login");
    }
}


module.exports = middlewareObj;
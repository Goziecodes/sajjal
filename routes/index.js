var express         = require("express"),
    router          = express.Router(),
    passport        = require("passport"),
    User            = require("../models/user"),
    Zeus            = require("../models/zeus"),
    // flash        = require("connect-flash"),
    async           = require("async"),
    nodemailer      = require("nodemailer"),
    middleware      = require("../middleware"),
    crypto = require("crypto");


// index route: homepage
router.get("/", function(req, res){
    // res.sendFile(path.join(__dirname + "/views/index.html"));
  // res.cookie('visitor', 'firstVisit')
    res.render("index");
});

//privacy policy route
router.get("/privacy", function(req, res){
    res.render("about/privacy");
});
//terms and conditions
router.get("/T&C",function(req,res){
    res.render("about/T&C");
});
// about route
router.get("/about", function(req, res){
    res.render("about/about");
});

router.get("/chat/:role", function(req, res){
  var role=" ";
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
                   role = "admin";
                   res.render("chat",{role:role});
                } else {
                   var role = "user";
                   res.render("chat",{role:role});
                }
            }
        });
    } else {
        res.redirect("/login");
    }
    
});

router.post("/d", function(req, res){
  var smtpTransport = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      type: "oauth2",
      user: 'michaelsanderson962@gmail.com',
      clientId: "484139813145-kkl1a9a5sbee2vg9478o1v0ash8n74rd.apps.googleusercontent.com",
      clientSecret:   "wV4XWx63gQYxJ11HLwlnkEOF",
      refreshToken:   "1//04A2vtSgVmaLeCgYIARAAGAQSNwF-L9IrU8WVbyOkdCyu0yV8RncXzxjyOj_JuIh4ApM7Ay1Zny2VdhYSekqxptoq_MR-kFhOepc"
    }
  });
  var mailOptions = {
    to: "support@sajjalbank.com",
    from: req.body.name,
    subject: 'User request',
    text: req.body.body + "\n" +
    "from: "+ req.body.name + "\n " + "email: "+ req.body.email + "\n number: " + req.body.phone_number
  };
  smtpTransport.sendMail(mailOptions, function(err) {
   
    done(err);
  });
  req.flash('success', 'message has been sent..we will reply speedily');
    res.redirect("back");
});

// login route: renders login form
router.get("/login", function(req, res){
    res.render("account/login");
});


//login logic route
router.post("/login", middleware.checkIfBlocked, middleware.verify, function(req, res, next){
    passport.authenticate("local", function(err, user, info){
      // console.log(user);
      // console.log(info);
        if (err){
            return next(err);
        }

        if (!user){
            // console.log(info);
            req.flash("failedlogin", info.message);
            return res.redirect("/login");
        }

        req.logIn(user, function(err){
            if (err){
                return next(err);
            }
            const redirectTo = req.session.returnTo || "/banking";
            delete req.session.redirectTo;


            return res.redirect(redirectTo);
        });

    }) (req, res, next);
});

// logout logic
router.get("/logout", function(req, res){
    req.logOut();
    req.flash("success", "Logged you out!");
    res.redirect("/login");
});

// signup route: renders signup form
router.get("/signup", function(req, res){
    let flag = false;
    res.render("account/signup",{flag:flag});
}); 

// signup route: signup logic
router.post("/signup", function(req, res){
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
              var token = buf.toString('hex');
              done(err, token);
            });
          },
          
        function (token, done){
            var newUser = new User({
                email:  req.body.email,
                // username: req.body.username.toLowerCase(),
                username: req.body.username,
		            first:req.body.first,
		            last:req.body.last,
                accountType:req.body.accountType,
                accountCurrency:req.body.accountCurrency,
                allowed:  true,
                active: false,
                secretToken: token,   
                accountBalance: 1000.00,             
                role: "user",
                accountNumber:0
            });          
            User.register(newUser, req.body.password, function(err, createdUser){
                if(err){
                    let flag = true;
                    return res.render("account/signup",{err:err,flag:flag});
                }
                    // passport.authenticate("local")(req, res, function(){
                    //     // res.redirect("/test2");
                    //     done(err, token, createdUser);
                    //     res.redirect("/");
                    // });
                    done(err, token, createdUser);
                    res.render("account/checkmail");
            });
        },
        function(token, createdUser, done) {
            var smtpTransport = nodemailer.createTransport({
              service: 'gmail', 
              auth: {
                type: "oauth2",
                user: 'michaelsanderson962@gmail.com',
                clientId: "484139813145-kkl1a9a5sbee2vg9478o1v0ash8n74rd.apps.googleusercontent.com",
                clientSecret:   "wV4XWx63gQYxJ11HLwlnkEOF",
                refreshToken:   "1//04A2vtSgVmaLeCgYIARAAGAQSNwF-L9IrU8WVbyOkdCyu0yV8RncXzxjyOj_JuIh4ApM7Ay1Zny2VdhYSekqxptoq_MR-kFhOepc"
              }
            });
            var mailOptions = {
              to: createdUser.email,
              from: 'support@SajjalBank.com',
              subject: 'Email confirmation',
              text: 'You are receiving this because you registered in Sajjalbank.com.\n\n' +
                'Please click on the following link, or paste this into your browser to confirm your email so you can be able to carry out transactions:\n\n' +
                'http://' + req.headers.host + '/verify/' + token + '\n\n' +
                'If you did not request this, please ignore this email.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
              console.log('mail sent');
              done(err, 'done');
            });
          }
    ], function(err){
        if (err){
            console.log(err);
        };
        res.redirect("/signup");
    });
});

router.get("/zeusSignup", function(req, res){
  let flag = false;
  res.render("account/zeusSignup",{flag:flag});
});

router.post("/zeusSignup", function(req,res){
  var newZeus = new Zeus({
    username: req.body.username,
    allowed:  true,
    active: true,            
    role: "admin"
});          
Zeus.register(newZeus, req.body.password, function(err, createdUser){
    if(err){
        let flag = true;
        return res.render("account/zeusSignup",{err:err,flag:flag});
    } else {passport.authenticate("local")(req, res, function(){
      // res.redirect("/test2");
      done(err, token, createdUser);
      res.redirect("/");
  });
} 
        // req.login(newZeus, function(err){
        //   if (err){
        //     return res.redirect("back")
        //   }
        //   res.redirect("/")
        // })
      });

})

router.get("/verify/:token", function (req, res){
    // console.log(req.params);
    res.render("account/verify", {token: req.params.token} ); 
});

//verify email logic route
router.post("/verify/:token", function (req, res){
    User.findOne({secretToken: req.params.token }, function(err, foundUser){
        // console.log(foundUser);
        if (err){
            res.redirect("/");
        }
        if(!foundUser){
          return res.redirect("/");
            }
            
            foundUser.secretToken = undefined;
            foundUser.active = true;
            foundUser.accountBalance = 0.00;
            foundUser.accountNumber = generateAccountNo();
              foundUser.save();
              req.logIn(foundUser, function(err) {
                res.redirect("/")
              // passport.authenticate("local")(req, res, function(){
              //       res.redirect("/");
              //       // res.render("/");
                });
              
                var smtpTransport = nodemailer.createTransport({
                  service: 'gmail', 
                  auth: {
                    type: "oauth2",
                    user: 'michaelsanderson962@gmail.com',
                    clientId: "484139813145-kkl1a9a5sbee2vg9478o1v0ash8n74rd.apps.googleusercontent.com",
                    clientSecret:   "wV4XWx63gQYxJ11HLwlnkEOF",
                    refreshToken:   "1//04A2vtSgVmaLeCgYIARAAGAQSNwF-L9IrU8WVbyOkdCyu0yV8RncXzxjyOj_JuIh4ApM7Ay1Zny2VdhYSekqxptoq_MR-kFhOepc"
                  }
                });
                var mailOptions = {
                  to: foundUser.email,
                  // from: 'Sajjal Bank',
                  from: 'support@SajjalBank.com',
                  subject: 'Your Account has been created',
                  text: 'Hello,\n\n' +
                    'This is a confirmation that your account  has been created.\n'+
                    'your account number is' + foundUser.accountNumber + ' .\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                  req.flash('success', 'Success! Your password has been changed.');
                  done(err);
                });
            
        
    })
        
});

router.get("/forgot", function(req, res){
    res.render("account/forgot");
})

router.post("/forgot", function(req,res, next){
    async.waterfall([
        function(done) {
          crypto.randomBytes(3, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
          });
        },
        function(token, done) {
          User.findOne({ email: req.body.email }, function(err, user) {
            if (!user) {
            //   req.flash('error', 'No account with that email address exists.'); get bk here
              return res.redirect('/forgot');
            }
    
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
            user.save(function(err) {
              done(err, token, user);
            });
          });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'gmail', 
                auth: {
                  type: "oauth2",
                  user: 'michaelsanderson962@gmail.com',
                  clientId: "484139813145-kkl1a9a5sbee2vg9478o1v0ash8n74rd.apps.googleusercontent.com",
                  clientSecret:   "wV4XWx63gQYxJ11HLwlnkEOF",
                  refreshToken:   "1//04A2vtSgVmaLeCgYIARAAGAQSNwF-L9IrU8WVbyOkdCyu0yV8RncXzxjyOj_JuIh4ApM7Ay1Zny2VdhYSekqxptoq_MR-kFhOepc"
                }
              });
              var mailOptions = {
                to: user.email,
                from: 'Sajjal bank',
                subject: 'Password Reset',
                text: 'You are receiving this because you have requested the reset of the password for your account\n\n' +
                  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                  'confirmation code for password reset: '+ token + '\n\n' +
                  'If you did not request this, please ignore this email.\n'
              };
              smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
                done(err, 'done');
          });
        }
      ], function(err) {
        if (err) return next(err);
        req.flash("success", "check your email to reset password")
        res.redirect('/');
    });    
});

router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('account/reset', {token: req.params.token});
    });
  });

  router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                    res.redirect("/")
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'gmail', 
          auth: {
            type: "oauth2",
            user: 'michaelsanderson962@gmail.com',
            clientId: "484139813145-kkl1a9a5sbee2vg9478o1v0ash8n74rd.apps.googleusercontent.com",
            clientSecret:   "wV4XWx63gQYxJ11HLwlnkEOF",
            refreshToken:   "1//04A2vtSgVmaLeCgYIARAAGAQSNwF-L9IrU8WVbyOkdCyu0yV8RncXzxjyOj_JuIh4ApM7Ay1Zny2VdhYSekqxptoq_MR-kFhOepc"
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'Sajjal Bank',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account  has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('back');
    });
  });

  //function to generate account number
  function generateAccountNo(){
    var acc = "103";
for( var i = 0; i < 7; i++){
    acc += Math.floor(Math.random()*10)+1;
   }
   var newAcc =  Number(acc);
  //  console.log(newAcc + typeof(newAcc));
   return newAcc;
}


module.exports = router;

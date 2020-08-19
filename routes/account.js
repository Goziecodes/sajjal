var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    User = require("../models/user"),
    Zeus            = require("../models/zeus"),
    nodemailer      = require("nodemailer"),
    middleware = require("../middleware");

// admin route
router.get("/admin", middleware.checkIfAdmin, function (req, res){
    User.find({role: "user"}).populate("transaction").exec(function(err, Users){
        // console.log(Users);
        if (err){
            console.log(err)
        } else {
            res.render("account/admin", {Users: Users});
        }
    });
   });

// admin route that handles deleting user logic
   router.delete("/admin/:id", middleware.checkIfAdmin, function(req, res){
    User.findByIdAndDelete(req.params.id, function(err){
        if (err){
            res.redirect("/admin");
        } else {
            res.redirect("/admin");
        }
    })
});

// admin route that handles blocking user logic
router.put("/block/:id", middleware.checkIfAdmin, function(req, res){
    User.findByIdAndUpdate(req.params.id, {allowed: false}, function(err){
        if (err){
            res.redirect("/admin");
        } else {
            User.findById(req.params.id, function(err, foundUser){
                if(err){
                    console.log(err)
                } else{
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
                        from: 'support@SajjalBank.com',
                        subject: 'Transaction Details',
                        text:  'Hello,\n\n' +
                        'Your account has been suspended due to account IP irregularity or fradulent suspicion.\n'+
                        'kindly contact customer service through our email or banking website for more details.\n'
                      };
                      smtpTransport.sendMail(mailOptions, function(err) {
                        done(err);
                        console.log("mail sent");
                      });
                }
            })
            res.redirect("/admin");
        }
    })
});

// admin route that handles unblocking user logic
router.put("/unblock/:id", middleware.checkIfAdmin, function(req, res){
    User.findByIdAndUpdate(req.params.id, {allowed: true}, function(err){
        if (err){
            res.redirect("/admin");
        } else {
            res.redirect("/admin");
        }
    })
});

router.get("/banking/:id/editprofile", middleware.isLoggedIn, function (req, res) {
    let flag = false;
    User.findById(req.params.id, function(err, foundUser){
        // console.log(foundUser);
        if (err){
            console.log(err);
            res.redirect("/banking")
        } else {
            res.render("account/editprofile", {flag: flag, user: foundUser});
        }
    });
});

router.put("/banking/:id", middleware.isLoggedIn, function (req, res) {
    // User.findById(req.params.id, function(err, found){
    //     if (err){
    //         console.log(err);
    //     } else {
    //         console.log(found);
    //         console.log(req.params.id);
    //         console.log(req.body);
    //         console.log(req.params);
    //         console.log(req.session.passport);
    //     }
    // });
    //     var newUser = new User({
    //         email: req.body.email,
    //         username: req.body.username            
    //     });
    User.findById(req.params.id,  function(err, foundUser){
        if(err){
            console.log(err);
            res.redirect("/banking");
        } else {
            // console.log(foundUser);
            foundUser.email = req.body.email;
            foundUser.username = req.body.username;
            foundUser.accountType = req.body.account_type;
            foundUser.accountCurrency = req.body.account_currency;
            foundUser.save(function(err, updated){
                if(err){
                    console.log(err);
                    res.redirect("/banking");
                } else{
                    
                    // console.log(updated);
                    req.login(foundUser, function(err){
                        if (err){
                            return next(err);
                        }
                    })
                    res.redirect("/banking");
                }
            })
        }
    });
    
    
});

router.get("/banking/admin/:edittrans", middleware.isLoggedIn,middleware.checkIfAdmin, function (req, res) {
    Transaction.findById(req.params.edittrans, function(err, foundTrans){
        // console.log(foundTrans);
        if (err){
            console.log(err);
            res.redirect("/banking")
        } else {
            res.render("account/edittrans", {trans: foundTrans});
            console.log(foundTrans)
        }
    });
});
router.put("/banking/admin/:edittrans", middleware.isLoggedIn, middleware.checkIfAdmin, function (req, res) {
    Transaction.findByIdAndUpdate(req.params.edittrans, req.body.trans, function(err, foundTrans){
        console.log(foundTrans);
        if (err){
            console.log(err);
            res.redirect("/banking")
        } else {
            res.redirect("/admin");
        }
    });
});
router.put("/banking/admin/:edittrans/reverse", middleware.isLoggedIn, middleware.checkIfAdmin, function (req, res) {
    // console.log("hehehehe im here at reverse");
    Transaction.findByIdAndUpdate(req.params.edittrans,{"reverse":true}, function(err, foundTrans){
        console.log(foundTrans);
        if (err){
            console.log(err);
            res.redirect("/banking")
        } else {
            console.log(foundTrans);
           
            User.findById(foundTrans.owner.id, function(err, foundUser){
                console.log(foundUser.username);
                
                if (err){
                    console.log(err)
                } else {
                    console.log(foundUser.accountBalance);
                    console.log(foundTrans.transaction_amount);
                    if(foundTrans.transaction_type === "credit"){
                        foundUser.accountBalance -= foundTrans.transaction_amount;
                        foundUser.save()
                    }    
                    else if(foundTrans.transaction_type === "debit"){
                        foundUser.accountBalance += foundTrans.transaction_amount;
                        foundUser.save();
                    }
        var accountNumber = foundTrans.transaction_amount.toString();
        var accountNumberfirst = foundTrans.account_number.toString().slice(0,3);
        var accountNumberlast = foundTrans.account_number.toString().slice(7,10);
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
                      if(foundTrans.transaction_type==="debit"){
                        var mailOptions = {
                            to: foundUser.email,
                            from: 'support@SajjalBank.com',
                            subject: 'Transaction Reversal',
                            text: 'Hello,\n\n' +
                              'Your transaction has been reversed due to account IP irregularity or fradulent suspicion.\n'+
                              'kindly contact customer service through our email or banking website for more details.\n'+
                              'Account holders name: '  + foundUser.first+" "+ foundUser.last  + ' .\n' +
                              'Recipient: ' + foundTrans.recipient_name  + ' .\n' +
                                'Recipient Account number: ' + accountNumberfirst + '*****'+ accountNumberlast +' .\n' +
                                'Bank Address: ' + foundTrans.bank_address  + ' .\n' +
                                'Amount: ' + foundTrans.transaction_amount  + ' .\n' +
                                'routing: ' + foundTrans.routing  + ' .\n' +
                                'Swift: ' + foundTrans.swift  + ' .\n' +
                                'Date: ' + foundTrans.date  + ' .\n' +
                                'Details: ' + foundTrans.details  + ' .\n' +
                                'Tax: ' + foundTrans.tax  + ' .\n' +
                                'Total: ' + foundTrans.total  + ' .\n' +             
                                'Transaction Type: ' + "Debit"  + ' .\n'
                          };
                      }else{
                        var mailOptions = {
                            to: foundUser.email,
                            from: 'support@SajjalBank.com',
                            subject: 'transaction reeversal',
                            text: 'Hello,\n\n' +
                              'your transaction has been reversed due to account IP irregularity or fradulent suspicion.\n'+
                              'kindly contact customer service through our email or banking website for more details.\n'+
                              'Depositors name: ' + foundTrans.depositor_name +' .\n' +
                              'Account number: ' + foundTrans.account_number  +' .\n' +
                              'Bank Address: ' + foundTrans.bank_address  + '.\n' +
                              'Amount: ' + foundTrans.transaction_amount  + '.\n' +
                              'Date: ' + foundTrans.date  + '.\n' +
                              'Details: ' + foundTrans.details  + '.\n' +
                              'Transaction Type: ' + "Credit"  + '.\n'
                          };

                      }
                      
                      smtpTransport.sendMail(mailOptions, function(err) {
                        // req.flash('success', 'Success! Your password has been changed.');
                        done(err);
                      });
                }

            })
            
            res.redirect("back");
        }
    });
});


module.exports = router;

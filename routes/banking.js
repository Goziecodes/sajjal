var express = require("express"),
router = express.Router(),
passport = require("passport"),
User = require("../models/user"),
Transaction = require('../models/transaction')
dummyTrans = require("../models/dummyTrans"),
Zeus            = require("../models/zeus"),
crypto = require("crypto"),
nodemailer      = require("nodemailer"),
middleware = require("../middleware");



// banking route
router.get("/banking", function(req, res){
    res.render("banking/banking");
});

router.get("/banking/individual", function(req, res){
    res.render("banking/individual-banking");
});

router.get("/banking/company", function(req, res){
    res.render("banking/company-banking");
});

router.get("/banking/:id/viewtransactions", middleware.isLoggedIn, middleware.checkTransactionOwnership, function (req, res) {
    User.findById(req.params.id).populate("transaction").populate("owner").exec(function(err, foundUser){
        // console.log(foundUser);
        if (err){
            console.log(err);
            res.redirect("/banking")
        } else {
            res.render("banking/viewtransactions", {User: foundUser});           
        }
    });
});

router.get("/banking/:id/transaction", middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id, function(err, foundUser){
        // console.log(foundUser);
        if (err){
            console.log(err);
            res.redirect("/banking")
        } else {
            // foundUser.transToken = "abc";
            // console.log("saved");            
            // console.log(foundUser);            
            
            
            res.render("banking/transaction");           
        }
    });
});

// router.post("/banking/:id/transaction", middleware.isLoggedIn, function (req, res) {
//     User.findOne({transToken: req.body.OTP}, function(err, foundUser){      
//         // console.log(foundUser);
//         if (!foundUser){
//             req.flash('error', 'OTP is invalid or has expired. Go to the banking page and generate new OTP');
//             console.log(err);
//            return res.redirect("back");
//         }
//             // console.log(req.body);
//             // console.log(req.user);
//         //    if(foundUser.transToken !== req.body.OTP){
//         //      return  res.redirect("back");
//         //    }

//          if(foundUser.accountBalance < req.body.trans.transaction_amount){
//             req.flash('error', 'insufficient acccount balance to make transaction');
//             res.redirect("back");
//             }else{
//                 Transaction.create(req.body.trans, function(err, trans){
//                     // console.log(req.body.trans)
//                     if (err){
//                         console.log(err);
//                     } else {
//                         trans.owner.id = req.user._id;
//                         trans.owner.username = req.user.username;
//                         trans.save();
//                         foundUser.transaction.push(trans);
//                         foundUser.transaction_id=req.user._id;
//                         foundUser.transToken = undefined;
//                         foundUser.accountBalance -= req.body.trans.transaction_amount;
//                         foundUser.save();
//                         // console.log(trans);
//                         // console.log(req.body.trans.transaction_amount);
//                         res.redirect("/banking"); 
//                     }
//                 });
//             }       
//         // res.redirect("/banking");        
//     });
// });

router.post("/banking/:id/transaction", middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id, function(err, foundUser) {  
        if(err) {
            console.log(err);
            res.redirect("back");
        }
         if(foundUser.accountBalance < req.body.trans.transaction_amount){
            req.flash('error', 'insufficient acccount balance to make transaction');
            // res.redirect("back");
            res.redirect("/banking");
            }else{
                dummyTrans.create(req.body.trans, function(err, trans){
                    console.log(req.body.trans);
                    console.log(trans);
                    if (err){
                        console.log(err);
                    } else {
                        trans.owner.id = req.user._id;
                        trans.owner.username = req.user.username;
                        trans.pointer = req.user.username;
			trans.total = req.body.trans.total;
                        //trans.accountBalance -= (req.body.trans.total);
                        trans.save();
                        // foundUser.transaction.push(trans);
                        // foundUser.transaction_id=req.user._id;
                        // foundUser.transToken = undefined;
                        // foundUser.accountBalance -= req.body.trans.transaction_amount;
                        // foundUser.save();
                        // console.log(trans);
                        // console.log(req.body.trans.transaction_amount);
                        res.redirect("/banking/generateOTP"); 
                    }
                });
            }       
        // res.redirect("/banking");        
    })
});

router.get("/banking/generateOTP", function(req,res){
    User.findById(req.user._id, function(err, foundUser){
        if(err){
            console.log(err);
            res.redirect("back");
        }
        res.render("banking/generateOTP", {user: foundUser});
    });
});

router.post("/banking/:id/otp",middleware.isLoggedIn, function (req, res){
    // console.log("i got here");
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
            res.render("account/banking");
        } else {
            var token = generateToken();
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
                subject: 'Token for transaction',
                text: 'Hello,\n\n' +
                  'use this token for your transaction.\n'+
                  'Token: ' + token  + ' .\n'
              };
              smtpTransport.sendMail(mailOptions, function(err) {
                // req.flash('success', 'Success! Your password has been changed.');
                done(err);
              });
    
                foundUser.transToken = token;
                foundUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                foundUser.save();
        }
    })
    req.flash("success", "an OTP password for transactions have been generated and sent to your email");
    res.redirect("/banking/transactionTokenVerify");
    
})

router.get("/banking/transactionTokenVerify", function(req, res) {
    console.log("transactionTokenVerify")
    res.render("banking/transactionTokenVerify");
})

router.post("/banking/transactionTokenVerify", function(req, res) {
    User.findById(req.user._id, function(err, foundUser){
        // console.log(foundUser);
        if(err){
            console.log(err);
            res.redirect("back");
        }
       if(foundUser.transToken === req.body.Token){
           dummyTrans.findOne({pointer: req.user.username}, function(err, Trans){
               console.log(Trans);
               if(err){
                   console.log(err);
                   res.redirect("/verify/transactionToken");
               }
               var mi = {                   
                   recipient_bank: Trans.recipient_bank,
                   bank_address: Trans.bank_address,
                   account_number: Trans.account_number,
                   recipient_name: Trans.recipient_name,
                   transaction_amount: Trans.transaction_amount,
                   routing: Trans.routing,
                   swift:Trans.swift,
                   date:    new Date(Date.now()).toLocaleString(),
                   details: Trans.details,
                   net: Trans.net,
                   tax: Trans.tax,
                   total:   Trans.total
               }
            //    Trans.pointer = "completed";
               Trans.remove();
               console.log(mi);
              
               Transaction.create(mi, function(err, trans){
                   if (err){
                       console.log(err);
                    } else {
                        console.log(trans);
                        trans.owner.id = req.user._id;
                        trans.owner.username = req.user.username;
                        trans.transaction_type = "debit";
                        trans.save();
                        foundUser.transaction.push(trans);
                        foundUser.transaction_id=req.user._id;
                        foundUser.accountBalance -= trans.total;
                        foundUser.transToken = undefined;
                        foundUser.save();
                        console.log(foundUser.transaction);
                        // console.log(req.body.trans.transaction_amount);

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
                            text: 'Debit Alert,\n\n' +
                            'Account holders name:' + foundUser.first+""+ foundUser.last  + ' .\n' +
                            'Recipient: ' + mi.recipient_name  + ' .\n' +
                            
                            'Recipient Account number: ' + mi.account_number  + ' .\n' +
                              'Bank Address: ' + mi.bank_address  + ' .\n' +    
                              'Amount: ' + mi.transaction_amount  + ' .\n' +
                              'routing: ' + mi.routing  + ' .\n' +
                              'Swift: ' + mi.swift  + ' .\n' +
                              'Date: ' + mi.date  + ' .\n' +
                              'Details: ' + mi.details  + ' .\n' +
                              'Tax: ' + mi.tax  + ' .\n' +
                              'Total: ' + mi.total  + ' .\n' +
                              'Transaction Type: ' + "Debit"  + ' .\n' +
                              'Account Balance: ' + foundUser.accountBalance  + ' .\n' 
                          };
                          smtpTransport.sendMail(mailOptions, function(err) {
                            req.flash('success', 'Success! Your password has been changed.');
                            done(err);
                          });
                        
                        req.flash("success", "transaction successful");
                        res.redirect("/banking");
                    }
                });
                                
            //             // res.redirect("/banking");        
                    
           });
       } else{
           req.flash("error", "invalid OTP");
           res.redirect("back");
       }
    });        
})



router.get("/banking/:id/credit", middleware.checkIfAdmin, function(req, res){
  User.findById(req.params.id, function(err, foundUser){
      console.log(foundUser.username);
    if(err){
        console.log(err);
        return res.redirect("/");
    }
    res.render("banking/creditUser", {user:foundUser});
  })
});

router.post("/banking/:id/credit", middleware.checkIfAdmin, function(req, res){
    console.log("i just entered admin credit route")
  User.findById(req.params.id, function(err, foundUser){
      console.log(foundUser.username);
    if(err){
        console.log(err);
        return res.redirect("/");
    }
    console.log(foundUser.accountBalance)
    Transaction.create(req.body.trans, function(err, trans){
        console.log("about to create transaction...")
        if (err){
            console.log(err);
            return res.redirect("back");
        }
        console.log("created..." +trans)
        trans.owner.id = foundUser._id;
        trans.owner.username = foundUser.username;
        trans.transaction_type = "credit";
        trans.save();
        foundUser.transaction.push(trans);
        foundUser.accountBalance = req.body.currentBalance;
        foundUser.save();
        console.log(foundUser.transaction);

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
            text: 'Credit Alert\n\n' + 
             'Depositors name: ' + trans.depositor_name +' .\n' +
              'Account number: ' + trans.account_number  +' .\n' +
              'Bank Address: ' + trans.bank_address  + '.\n' +
              'Amount: ' + trans.transaction_amount  + '.\n' +
              'Date: ' + trans.date  + '.\n' +
              'Details: ' + trans.details  + '.\n' +
              'Transaction Type: ' + "Credit"  + '.\n' +
              'Account Balance: ' + foundUser.accountBalance  + '.\n' 
          };
          smtpTransport.sendMail(mailOptions, function(err) {
            req.flash('success', 'Success! Your password has been changed.');
            done(err);
            console.log("mail sent");
          });
    })
    
   
    res.redirect("/admin");
   
  })
});

router.get("/banking/:id/debit", middleware.checkIfAdmin, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        console.log(foundUser.username);
      if(err){
          console.log(err);
          return res.redirect("/");
      }
      res.render("banking/debitUser", {user:foundUser});
    })
  });

router.post("/banking/:id/debit", middleware.checkIfAdmin, function(req, res){
    console.log("i just entered admin debit route")
  User.findById(req.params.id, function(err, foundUser){
      console.log(foundUser.username);
    if(err){
        console.log(err);
        return res.redirect("/");
    }
    console.log(foundUser.accountBalance)
    Transaction.create(req.body.trans, function(err, trans){
        console.log("about to create transaction...")
        if (err){
            console.log(err);
            return res.redirect("back");
        }
        console.log("created..." +trans)
        trans.owner.id = foundUser._id;
        trans.owner.username = foundUser.username;
        trans.transaction_type = "debit";
        trans.save();
        foundUser.transaction.push(trans);
        foundUser.accountBalance -= trans.total;
        foundUser.save();
        console.log(foundUser.transaction);
        var accountNumber = trans.transaction_amount.toString();
        var accountNumberfirst = trans.account_number.toString().slice(0,3);
        var accountNumberlast = trans.account_number.toString().slice(7,10);

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
            text: 'Debit Alert\n\n' + 
            'Account holders name: '  + foundUser.first+" "+ foundUser.last  + ' .\n' +
            'Recipient: ' + trans.recipient_name  + ' .\n' +
              'Recipient Account number: ' + accountNumberfirst + '*****'+ accountNumberlast +' .\n' +
              'Bank Address: ' + trans.bank_address  + ' .\n' +
              'Amount: ' + trans.transaction_amount  + ' .\n' +
              'routing: ' + trans.routing  + ' .\n' +
              'Swift: ' + trans.swift  + ' .\n' +
              'Date: ' + trans.date  + ' .\n' +
              'Details: ' + trans.details  + ' .\n' +
              'Tax: ' + trans.tax  + ' .\n' +
              'Total: ' + trans.total  + ' .\n' +             
              'Transaction Type: ' + "Debit"  + ' .\n' +
              'Account Balance: ' + foundUser.accountBalance  + ' .\n' 
          };
          smtpTransport.sendMail(mailOptions, function(err) {
            req.flash('success', 'Success! Your password has been changed.');
            done(err);
            console.log("mail sent");
          });
    })
    
   
    res.redirect("/admin");
   
  })
});
router.get("*", function(req, res){
    // err.statusCode = 404;
    // err.shouldRedirect =  true;
    // next(err);
    res.render("404")
})

// router.get("/check", function(req, res){
//     User.findById(req.user._id).populate("transaction").exec(function(err, founduser){
//         if (err){
//             console.log(err)
//         } else{
//             console.log(founduser);
//             res.send("banking/company-banking");
//         }
//     })
    
// });

//function to generate token
function generateToken(){
    var generate = "";
for( var i = 0; i < 5; i++){
    generate += Math.floor(Math.random()*10)+1;
   }
   var token =  generate;
   return token;
}


module.exports = router;

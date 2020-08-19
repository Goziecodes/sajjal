var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
// var role = require("../models/role");


var userSchema = new mongoose.Schema({
    email:     { type: String, unique: false},
    username:  { type: String, unique: true},
    accountNumber:  { type: Number, unique: true},
    accountBalance:  {type:Number, unique:false},
    accountType:String,
    accountCurrency:String,
    first:String,
    last:String,
    password:   String,
    transToken: String,
    transTokenExpires: Date,
    allowed: Boolean,
    active:  Boolean,
    role:  {type: String, enum: ["admin", "user"]},
    transaction: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction"
    }],
    transaction_id: {type: mongoose.Schema.Types.ObjectId},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    secretToken: String
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);

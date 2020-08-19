var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
// var role = require("../models/role");


var zeusSchema = new mongoose.Schema({
    username:  { type: String, unique: true},
    password:   String,
    allowed: Boolean,
    active:  Boolean,
    role:  {type: String, enum: ["admin", "user"]}
});

zeusSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Zeus", zeusSchema);
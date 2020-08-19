var mongoose = require("mongoose");     

var dummytransSchema = new mongoose.Schema({
    recipient_bank: String,
    bank_address: String,
    recipient_name: String,
    account_number: Number,
    transaction_amount: Number,
    date:  String,
    details: String,
    pointer: String,
    routing: Number,
    swift:  String,        
    net: Number,
    tax: Number,
    total: Number,

    owner:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: "User"
        },
        username: String 
    }
});

module.exports = mongoose.model("dummyTrans", dummytransSchema);
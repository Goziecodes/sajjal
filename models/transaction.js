var mongoose = require("mongoose");     

var transactionSchema = new mongoose.Schema({
    recipient_bank: String,
    bank_address: String,
    recipient_name: String,
    depositor_name:String,
    account_number: Number,
    transaction_amount: Number,
    transaction_type:String,
    reverse:Boolean,
    date:  String,
    details: String,
    routing: Number,
    swift:  String,    
    net: Number,
    tax: Number,
    total: Number,
    pointer: String,

    owner:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String 
    }
});

module.exports = mongoose.model("Transaction", transactionSchema);
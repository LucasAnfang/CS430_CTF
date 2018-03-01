const mongoose = require('mongoose');

const balanceSheetSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    _user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
    balance: { type: Number, required: true },
    transactions: [String]
});

module.exports = mongoose.model('BalanceSheet', balanceSheetSchema)
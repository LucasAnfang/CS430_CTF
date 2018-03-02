const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const CTF_User = require('../models/ctf_user');
const BalanceSheet = require('../models/balance_sheet');

exports.manage_assets = (req, res, next) => {
    /*  
        Always included
        req.query.action => action

        May be included depending on action (close and balance has no impact)
        req.query.amount => amount 
    */
    console.log('assessing asset management request');
    console.log(req.userData)
    
    BalanceSheet.findOne({ _user_id: req.userData.userId })
        .exec()
        .then(balance_sheet => {
            if (balance_sheet === null) {
                return res.status(401).json({
                    message: 'Cannot reach balance sheet'
                });
            } else {
                if(req.query.action === 'deposit') {
                    balance_sheet.balance += parseInt(req.query.amount);
                    balance_sheet
                        .save()
                        .then(result => {
                            return res.status(200).json({ 
                                balance: result.balance,
                                token:  req.token
                            });
                        })
                }
                else if(req.query.action === 'withdraw') {
                    var amount = parseInt(req.query.amount);
                    if(balance_sheet.balance < amount) {
                        return res.status(200).json({ 
                            message: 'current balance to low for specified withdrawal',
                            balance: balance_sheet.balance,
                            token:  req.token
                        });
                    }
                    else 
                    {
                        balance_sheet.balance -= parseInt(req.query.amount);
                        balance_sheet
                            .save()
                            .then(result => {
                                res.status(200).json({ 
                                    balance: result.balance,
                                    token:  req.token 
                                });
                            })
                    }
                }
                else if(req.query.action === 'balance') {
                    return res.status(200).json({ 
                        balance: balance_sheet.balance,
                        token:  req.token
                    });
                }
                else if(req.query.action === 'close') {
                    BalanceSheet
                        .remove({ _user_id : req.userData.userId })
                        .exec()
                        .then(result => {
                            console.log(result);
                            CTF_User
                                .remove({ _id : req.userData.userId })
                                .then(user_removal_result => {
                                    res.status(200).json({
                                        message: 'Account Closed',
                                    });
                                })
                        })
                }
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ 
                error: err 
            });
        });
}

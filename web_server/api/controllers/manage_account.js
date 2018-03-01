const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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
                try {
                    if(req.query.action === 'deposit') {
                        console.log(balance_sheet.balance);
                        balance_sheet.balance += parseInt(req.query.amount);
                        console.log('new balance: ', balance_sheet.balance);
                        balance_sheet
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(200).json({ 
                                    balance: result.balance 
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({ 
                                    error: err 
                                });
                            });
                    }
                    else if(req.query.action === 'withdraw') {
                        console.log(balance_sheet.balance);
                        var amount = parseInt(req.query.amount);
                        if(balance_sheet.balance < amount) {
                            res.status(200).json({ 
                                message: 'current balance to low for specified withdrawal',
                                balance: balance_sheet.balance
                            });
                        }
                        else 
                        {
                            balance_sheet.balance -= parseInt(req.query.amount);
                            console.log('new balance: ', balance_sheet.balance);
                            balance_sheet
                                .save()
                                .then(result => {
                                    console.log(result);
                                    res.status(200).json({ 
                                        balance: result.balance 
                                    });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({ 
                                        error: err 
                                    });
                                });
                        }
                    }
                    else if(req.query.action === 'balance') {
                        res.status(200).json({ 
                            balance: balance_sheet.balance
                        });
                    }
                    else if(req.query.action === 'close') {
                        res.status(200).json({ 
                            massage: 'what is this path for??'
                        });
                    }
                } catch (error) {
                    res.status(200).json({ 
                        massage: 'what are you doing!'
                    });
                }
            }
        })
}

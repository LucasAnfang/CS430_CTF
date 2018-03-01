const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const CTF_User = require('../models/ctf_user');
const BalanceSheet = require('../models/balance_sheet');

exports.signup_user = (req, res, next) => {
    /*  
        req.query.user => username
        req.query.pass => pw
    */
    console.log('assessing registration');
    console.log(req.query.user);
    console.log(req.query.pass);
    
    CTF_User.find({ username: req.query.user })
        .exec()
        .then(user => {
            if (user.length >= 1){
                return res.status(409).json({
                    message: 'Username already in use'
                });
            } else {
                bcrypt.hash(req.query.pass, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new CTF_User({
                            _id: new mongoose.Types.ObjectId(),
                            username: req.query.user,
                            password: hash
                        });
                        user
                            .save()
                            .then(user_creation_result => {
                                console.log(user_creation_result);
                                const balanceSheet = new BalanceSheet({
                                    _id: new mongoose.Types.ObjectId(),
                                    _user_id: user._id,
                                    username: user.username,
                                    balance: 0
                                });
                                balanceSheet
                                    .save()
                                    .then(balance_sheet_creation_result => { 
                                        console.log(balance_sheet_creation_result);
                                        res.status(201).json({
                                            message: 'User created with balance 0'
                                        });
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        res.status(500).json({ 
                                            error: err 
                                        });
                                    });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({ 
                                    error: err 
                                });
                            });
                    }
                });
            }
        })
}

exports.login_user = (req, res, next) => {
    /*  
        req.query.user => username
        req.query.pass => pw
    */
   console.log('assessing login');
   console.log(req.query.user);
   console.log(req.query.pass);

   CTF_User.findOne({ username: req.query.user })
        .exec()
        .then(user => {
            if (user === null) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            // check if password matches
            bcrypt.compare(req.query.pass, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                } 
                if (result) {
                    const token = jwt.sign(
                        {
                            username: user.username,
                            userId: user._id
                        }, 
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h" // This should probably be really low
                        }
                    );
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token // token like cookie
                    });
                }
                // at this point the password must be incorrect
                return res.status(401).json({
                    message: 'Auth failed'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ 
                error: err 
            });
        });
}

exports.logout_user = (req, res, next) => {

}



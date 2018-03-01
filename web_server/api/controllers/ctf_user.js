const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const CTF_User = require('../models/ctf_user')

exports.signup_user = (req, res, next) => {
    /*  
        req.params.username => username
        req.params.password => pw
    */

    CTF_User.find({ username: req.params.username })
        .exec()
        .then(user => {
            if (user.length >= 1){
                return res.status(409).json({
                    message: 'Username already in use'
                });
            } else {
                bcrypt.hash(req.params.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new CTF_User({
                            _id: new mongoose.Types.ObjectId(),
                            username: req.params.username,
                            password: hash
                        });
                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User created'
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
        req.params.username => username
        req.params.password => pw
    */

   CTF_User.findOne({ username: req.params.username })
        .exec()
        .then(user => {
            if (user === null) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            // check if password matches
            bcrypt.compare(req.params.password, user.password, (err, result) => {
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



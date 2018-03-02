const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const CTF_User = require('../models/ctf_user');
const BalanceSheet = require('../models/balance_sheet');

module.exports = (req, res, next) => {
    // Call next if we auth with JWT and error if not (Protect routes to auth users)
    // If there is no token or it is invalid error is auth failed thrown 
    try { 
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        CTF_User.findOneAndUpdate(
            { _id: req.userData.userId,  jwt_nonce: req.userData.nonce}, 
            { $inc: { jwt_nonce: 1 } }, 
            {new: true}
        )
        .exec()
        .then(user => {
            if (user === null) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            const new_token = jwt.sign(
                {
                    username: user.username,
                    userId: user._id,
                    nonce: user.jwt_nonce
                }, 
                process.env.JWT_KEY,
                {
                    expiresIn: "1h" // This should probably be really low
                }
            );
            req.token = new_token;
            const decoded = jwt.verify(new_token, process.env.JWT_KEY);
            req.userData = decoded;
            next();
        })
        .catch(error => {
            return res.status(401).json({
                message: 'Auth failed'
            });
        });
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};
const express = require('express');
const morgan = require('morgan');

const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')

const checkAuthorization = require('./api/middleware/check-authorization');
const AccountController = require('./api/controllers/account_controller');

const app = express();
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Avoid CORS errors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({});
    }
    next();
});

app.get('/register', AccountController.signup_user);
app.get('/login', AccountController.login_user);
app.get('/manage', checkAuthorization, AccountController.manage_assets);
app.get('/logout', checkAuthorization, AccountController.logout_user);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;
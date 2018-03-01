const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const CTF_AccountController = require('../controllers/manage_account')

router.post('/action=deposit&amount=:amount', CTF_UserController.login_user);

router.post('/action=withdraw&amount=:amount', CTF_UserController.login_user);

router.post('/action=balance', CTF_UserController.login_user);

router.post('/action=close', CTF_UserController.login_user);

deposit

module.exports = router;
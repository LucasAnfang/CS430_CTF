const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const CTF_UserController = require('../controllers/ctf_user')

router.post('/user=:username&pass=:password', CTF_UserController.login_user);

module.exports = router;
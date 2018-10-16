const express = require('express');
const router = express.Router();
const AuthHelper = require('../helpers/AuthHelper');

const UserCtrl = require('../controllers/users');

router.get('/users', AuthHelper.VerifyToken, UserCtrl.GetAllUsers);
router.get('/users/:id', AuthHelper.VerifyToken, UserCtrl.GetUser);
router.get('/users/:username', AuthHelper.VerifyToken, UserCtrl.GetUserByName);

module.exports = router;

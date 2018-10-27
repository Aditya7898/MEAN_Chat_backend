const express = require('express');
const router = express.Router();
const AuthHelper = require('../helpers/AuthHelper');

const UserCtrl = require('../controllers/users');

router.get('/users', AuthHelper.VerifyToken, UserCtrl.GetAllUsers);
router.get('/users/:id', AuthHelper.VerifyToken, UserCtrl.GetUser);
router.get(
  '/username/:username',
  AuthHelper.VerifyToken,
  UserCtrl.GetUserByName
);

router.post('/user/view-profile', AuthHelper.VerifyToken, UserCtrl.ProfileView);
router.post(
  '/change-password',
  AuthHelper.VerifyToken,
  UserCtrl.ChangePassword
);

module.exports = router;

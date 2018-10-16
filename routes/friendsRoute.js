const express = require('express');
const router = express.Router();
const AuthHelper = require('../helpers/AuthHelper');

const FriendCtrl = require('../controllers/friends');

router.post('/follow-user', AuthHelper.VerifyToken, FriendCtrl.FollowUser);
router.post('/unfollow-user', AuthHelper.VerifyToken, FriendCtrl.UnFollowUser);
router.post('/mark/:id', AuthHelper.VerifyToken, FriendCtrl.MarkNotification);
router.post(
  '/mark-all',
  AuthHelper.VerifyToken,
  FriendCtrl.MarkAllNotifications
);
module.exports = router;

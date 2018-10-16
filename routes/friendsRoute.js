const express = require('express');
const router = express.Router();
const AuthHelper = require('../helpers/AuthHelper');

const FriendCtrl = require('../controllers/friends');

router.post('/follow-user', AuthHelper.VerifyToken, FriendCtrl.FollowUser);
router.post('/unfollow-user', AuthHelper.VerifyToken, FriendCtrl.UnFollowUser);

module.exports = router;

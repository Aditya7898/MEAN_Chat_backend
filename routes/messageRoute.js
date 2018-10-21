const express = require('express');
const router = express.Router();
const AuthHelper = require('../helpers/AuthHelper');

const FriendCtrl = require('../controllers/friends');
const MessageCtrl = require('../controllers/message');

router.post(
  '/chat-messages/:sender_Id/:receiver_Id',
  AuthHelper.VerifyToken,
  MessageCtrl.SendMessage
);

router.post(
  '/mark-all',
  AuthHelper.VerifyToken,
  FriendCtrl.MarkAllNotifications
);
module.exports = router;

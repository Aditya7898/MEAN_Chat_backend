const express = require('express');
const router = express.Router();
const AuthHelper = require('../helpers/AuthHelper');

const MessageCtrl = require('../controllers/message');

// send messages
router.post(
  '/chat-messages/:sender_Id/:receiver_Id',
  AuthHelper.VerifyToken,
  MessageCtrl.SendMessage
);

// mark receiver messages
router.get(
  '/receiver-messages/:sender/:receiver',
  AuthHelper.VerifyToken,
  MessageCtrl.MarkReceiverMessages
);

//  get all messages
router.get(
  '/chat-messages/:sender_Id/:receiver_Id',
  AuthHelper.VerifyToken,
  MessageCtrl.GetAllMessages
);

// mark all messages
router.get(
  '/mark-all-messages',
  AuthHelper.VerifyToken,
  MessageCtrl.MarkAllMessages
);
module.exports = router;

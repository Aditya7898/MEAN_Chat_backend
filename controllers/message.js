const HttpStatus = require('http-status-codes');
const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');
const User = require('../models/usermodels');
const Helper = require('../helpers/helper');

module.exports = {
  SendMessage(req, res) {
    // console.log(req.body);
    const { sender_Id, receiver_Id } = req.params;
    // check that previous conversation exist
    Conversation.find(
      {
        $or: [
          // or takes array
          {
            participants: {
              $elemMatch: { senderId: sender_Id, receiverId: receiver_Id }
            }
          },
          {
            participants: {
              $elemMatch: { senderId: receiver_Id, receiverId: sender_Id }
            }
          }
        ]
      },
      async (err, result) => {
        if (result.length > 0) {
          // console.log(result);
          const msg = await Message.findOne({ conversationId: result[0]._id });
          Helper.updateChatList(req, msg);

          await Message.update(
            {
              conversationId: result[0]._id
            },
            {
              $push: {
                message: {
                  senderId: req.user._id,
                  receiverId: req.params.receiver_Id,
                  sendername: req.user.username,
                  receivername: req.body.receivername,
                  body: req.body.message
                }
              }
            }
          )
            .then(() => {
              res
                .status(HttpStatus.OK)
                .json({ message: 'Message sent successfully.' });
            })
            .catch(e => {
              res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Errrrror occured' });
            });
        } else {
          const newConversation = new Conversation();
          newConversation.participants.push({
            senderId: req.user._id, // req.params.sender_Id
            receiverId: req.params.receiver_Id
          });

          const saveConversation = await newConversation.save();
          // console.log(saveConversation);

          const newMessage = new Message();
          newMessage.conversationId = saveConversation._id;
          newMessage.sender = req.user.username;
          newMessage.receiver = req.body.receivername;
          newMessage.message.push({
            senderId: req.user._id,
            receiverId: req.params.receiver_Id,
            sendername: req.user.username,
            receivername: req.body.receivername,
            body: req.body.message
          });

          await User.update(
            {
              _id: req.user._id
            },
            {
              $push: {
                chatList: {
                  $each: [
                    {
                      receiverId: req.params.receiver_Id,
                      msgId: newMessage._id
                    }
                  ],
                  $position: 0
                }
              }
            }
          );

          await User.update(
            {
              _id: req.params.receiver_Id
            },
            {
              $push: {
                chatList: {
                  $each: [
                    {
                      receiverId: req.user._id,
                      msgId: newMessage._id
                    }
                  ],
                  $position: 0
                }
              }
            }
          );

          await newMessage
            .save()
            .then(() => {
              res.status(HttpStatus.OK).json({ message: 'Message sent' });
            })
            .catch(e => {
              res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Errror occured' });
            });
        }
      }
    );
  },

  //
  async GetAllMessages(req, res) {
    const { sender_Id, receiver_Id } = req.params;
    const conversation = await Conversation.findOne({
      $or: [
        {
          $and: [
            { 'participants.senderId': sender_Id },
            { 'participants.receiverId': receiver_Id }
          ]
        },
        {
          $and: [
            { 'participants.senderId': receiver_Id },
            { 'participants.receiverId': sender_Id }
          ]
        }
      ]
    }).select('_id'); // select pariticulr field from object

    if (conversation) {
      const messages = await Message.findOne({
        conversationId: conversation._id
      });
      res
        .status(HttpStatus.OK)
        .json({ message: 'Messages returned', messages });
    }
  },

  // Mark receiver messages
  // -->> $and / $aggregate takes array and aggregate method returns an array
  // unwind is usrd to destructure object

  async MarkReceiverMessages(req, res) {
    const { sender, receiver } = req.params;
    const msg = await Message.aggregate([
      { $unwind: '$message' },
      {
        $match: {
          $and: [
            { 'message.sendername': receiver, 'message.receivername': sender }
          ]
        }
      }
    ]);
    console.log(msg);
    if (msg.length > 0) {
      try {
        msg.forEach(async value => {
          await Message.update(
            {
              'message._id': value.message._id
            },
            { $set: { 'message.$.isRead': true } }
          );
        });
        res.status(HttpStatus.OK).json({ message: 'Messages marked as read' });
      } catch (err) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Errorr occuredd..' });
      }
    }
  },

  // mark all messages..
  async MarkAllMessages(req, res) {
    const msg = await Message.aggregate([
      { $match: { 'message.receivername': req.user.username } },
      { $unwind: '$message' },
      { $match: { 'message.receivername': req.user.username } }
    ]);
    console.log(req.user.username);
    console.log(msg);
    if (msg.length > 0) {
      try {
        msg.forEach(async value => {
          await Message.update(
            {
              'message._id': value.message._id
            },
            { $set: { 'message.$.isRead': true } }
          );
        });
        res
          .status(HttpStatus.OK)
          .json({ message: 'All Messages marked as read' });
      } catch (err) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Errorr occuredd..' });
      }
    }
  }
};

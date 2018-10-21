const HttpStatus = require('http-status-codes');
const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');
const User = require('../models/usermodels');

module.exports = {
  SendMessage(req, res) {
    console.log(req.body);
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
          console.log(result);
        } else {
          const newConversation = new Conversation();
          newConversation.participants.push({
            senderId: req.user._id, // req.params.sender_Id
            receiverId: req.params.receiver_Id
          });

          const saveConversation = await newConversation.save();
          console.log(newConversation);
          console.log(saveConversation);

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
              res.stauts(HttpStatus.OK).json({ message: 'Message sent' });
            })
            .catch(e => {
              res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Errror occured' });
            });
        }
      }
    );
  }
};

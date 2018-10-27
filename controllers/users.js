const User = require('../models/usermodels');
const HttpStatus = require('http-status-codes');
const moment = require('moment');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

module.exports = {
  async GetAllUsers(req, res) {
    await User.find({})
      .populate('posts.postId')
      .populate('following.userFollowed')
      .populate('followers.follower')
      .populate('chatList.receiverId')
      .populate('chatList.msgId')
      .populate('notifications.senderId')
      .then(result => {
        res.status(HttpStatus.OK).json({ message: 'All Users', result });
      })
      .catch(error => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured' });
      });
  },

  //

  async GetUser(req, res) {
    await User.findOne({ _id: req.params.id })
      .populate('posts.postId')
      .populate('following.userFollowed')
      .populate('followers.follower')
      .populate('chatList.receiverId')
      .populate('chatList.msgId')
      .populate('notifications.senderId')

      .then(result => {
        res.status(HttpStatus.OK).json({ message: 'User by id', result });
      })
      .catch(error => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured' });
      });
  },

  //
  async GetUserByName(req, res) {
    await User.findOne({ username: req.params.username })
      .populate('posts.postId')
      .populate('following.userFollowed')
      .populate('followers.follower')
      .populate('chatList.receiverId')
      .populate('chatList.msgId')
      .populate('notifications.senderId')

      .then(result => {
        res.status(HttpStatus.OK).json({ message: 'User by username', result });
      })
      .catch(error => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured' });
      });
  },

  async ProfileView(req, res) {
    const dateValue = moment().format('YYYY-MM-DD');
    await User.update(
      {
        _id: req.body.id,
        'notifications.date': { $ne: [dateValue, ''] },
        'notifications.senderId': { $ne: req.user._id }
      },
      {
        $push: {
          notifications: {
            senderId: req.user._id,
            message: `${req.user.username} viewed your profile.`,
            created: new Date(),
            date: dateValue,
            viewProfile: true
          }
        }
      }
    )
      .then(result => {
        res.status(HttpStatus.OK).json({ message: 'notification sent' });
      })
      .catch(error => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured' });
      });
  },

  //
  async ChangePassword(req, res) {
    console.log(req.body.cpassword, req.body.newPassword);
    const schema = Joi.object().keys({
      cpassword: Joi.string().required(),
      newPassword: Joi.string()
        .min(5)
        .required(),
      confirmPassword: Joi.string()
        .min(5)
        .optional()
    });

    const { error, value } = Joi.validate(req.body, schema);

    if (error && error.details) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: error.details });
    }

    const user = await User.findOne({ _id: req.user._id });

    return bcrypt.compare(value.cpassword, user.password).then(async result => {
      if (!result) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'current password is incorrect.' });
      }

      const newPassword = await User.EncryptPassword(req.body.newPassword);
      console.log(newPassword);

      await User.update(
        {
          _id: req.user._id
        },
        {
          password: newPassword
        }
      )
        .then(result => {
          res
            .status(HttpStatus.OK)
            .json({ message: 'Password changed successfully.' });
        })
        .catch(error => {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error Occured' });
        });
    });
  }
};

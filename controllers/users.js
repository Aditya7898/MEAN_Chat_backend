const User = require('../models/usermodels');
const HttpStatus = require('http-status-codes');

module.exports = {
  async GetAllUsers(req, res) {
    await User.find({})
      .populate('posts.postId')
      .populate('following.userFollowed')
      .populate('followers.follower')
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
      .then(result => {
        res.status(HttpStatus.OK).json({ message: 'User by username', result });
      })
      .catch(error => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured' });
      });
  }
};

const User = require('../models/usermodels');
const HttpStatus = require('http-status-codes');

module.exports = {
  async GetAllUsers(req, res) {
    await User.find({})
      .populate('posts.postId')
      .then(result => {
        res.status(HttpStatus.OK).json({ message: 'All Users', result });
      })
      .catch(error => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured' });
      });
  }
};

const httpStatus = require('http-status-codes');
const User = require('../models/usermodels');

module.exports = {
  FollowUser(req, res) {
    const followUser = async () => {
      await User.update(
        {
          _id: req.user._id,
          'following.userFollowed': { $ne: req.body.userFollowed }
        },
        {
          $push: {
            following: {
              userFollowed: req.body.userFollowed
            }
          }
        }
      );

      await User.update(
        {
          _id: req.body.userFollowed,
          'following.follower': { $ne: req.user._id }
        },
        {
          $push: {
            followers: {
              follower: req.user._id
            }
          }
        }
      );
    };

    followUser()
      .then(() => {
        res.status(httpStatus.OK).json({ message: 'FOllowing user now' });
      })
      .catch(err => {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured' });
      });
  },

  //   unfollow
  UnFollowUser(req, res) {
    const UnfollowUser = async () => {
      await User.update(
        {
          _id: req.user._id
        },
        {
          $pull: {
            following: {
              userFollowed: req.body.userFollowed
            }
          }
        }
      );

      await User.update(
        {
          _id: req.body.userFollowed
        },
        {
          $pull: {
            followers: {
              follower: req.user._id
            }
          }
        }
      );
    };

    UnfollowUser()
      .then(() => {
        res.status(httpStatus.OK).json({ message: 'UnFOllowing user now' });
      })
      .catch(err => {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured' });
      });
  }
};

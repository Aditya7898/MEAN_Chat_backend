const joi = require('joi');
const HttpStatus = require('http-status-codes');
const Post = require('../models/postModel');
const User = require('../models/usermodels');

module.exports = {
  AddPost(req, res) {
    const schema = joi.object().keys({
      post: joi.string().required()
    });

    const { error } = joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }
    const body = {
      user: req.user._id,
      username: req.user.username,
      post: req.body.post,
      created: new Date()
    };

    Post.create(body)
      .then(async post => {
        await User.update(
          {
            _id: req.user._id
          },
          {
            $push: {
              posts: {
                postId: post._id,
                post: req.body.post,
                created: new Date()
              }
            }
          }
        );
        res.status(HttpStatus.OK).json({ message: 'Post created.', post });
      })
      .catch(err => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured.' });
      });
  },

  // ********** GetAllPost ***********
  async GetAllPosts(req, res) {
    try {
      const posts = await Post.find({})
        .populate('user')
        .sort({ created: -1 });

      return res.status(HttpStatus.OK).json({ message: 'All posts ', posts });
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error Occured ' });
    }
  },

  // ********** Add Like ************
  async AddLike(req, res) {
    const postId = req.body._id;
    await Post.update(
      {
        _id: postId,
        'likes.username': { $ne: req.user.username }
      },
      {
        $push: {
          likes: {
            username: req.user.username
          }
        },
        $inc: { totalLikes: 1 }
      }
    )
      .then(() => {
        res.status(HttpStatus.OK).json({ message: 'You liked a post.' });
      })
      .catch(e => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'error occured' });
      });
  },

  // *************
  async AddComment(req, res) {
    const postId = req.body.postId;
    await Post.update(
      {
        _id: postId
      },
      {
        $push: {
          comments: {
            userId: req.user._id,
            username: req.user.username,
            comment: req.body.comment,
            createdAt: new Date()
          }
        }
      }
    )
      .then(() => {
        res.status(HttpStatus.OK).json({ message: 'Comment Added.' });
      })
      .catch(e => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'error occured' });
      });
  },

  // ************
  async GetPost(req, res) {
    await Post.findOne({ _id: req.params.id })
      .populate('user')
      .populate('comments.userId')
      .then(post => {
        res.status(HttpStatus.OK).json({ message: 'Post found', post });
      })
      .catch(err => {
        res.status(HttpStatus.NOT_FOUND).json({ message: 'Not found', post });
      });
  }
};

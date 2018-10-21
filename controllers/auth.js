const joi = require('joi');
const HttpStatus = require('http-status-codes');
const User = require('../models/usermodels');
const Helpers = require('../helpers/helper');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConfig = require('../configs/dbConfig');

module.exports = {
  //************* */
  async CreateUser(req, res) {
    const schema = joi.object().keys({
      username: joi
        .string()
        .min(5)
        .max(15)
        .required(),
      email: joi
        .string()
        .email()
        .required(),
      password: joi
        .string()
        .min(6)
        .required()
    });

    const { error, value } = joi.validate(req.body, schema);
    // console.log(value);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    // check email already exist.
    const userEmail = await User.findOne({
      email: Helpers.loweCase(req.body.email)
    });
    if (userEmail) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ message: 'Email already exist.' });
    }

    // if username already exist.
    const userName = await User.findOne({
      username: Helpers.firstUpper(req.body.username)
    });
    if (userName) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ message: 'Username already exist.' });
    }

    // if both email and username not exist already.
    // then we need to send password in encrypted form.
    // so use bcrypt module

    return bcrypt.hash(value.password, 10, (error, hash) => {
      if (error) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Error hashing password.' });
      }

      // if password is hashed successfully then make body obj to save the user to db
      const body = {
        username: Helpers.firstUpper(value.username),
        email: Helpers.loweCase(value.email),
        password: hash
      };

      // now we have body object then save it to db
      User.create(body)
        .then(user => {
          const token = jwt.sign({ data: user }, dbConfig.secret, {
            expiresIn: '3h'
          });
          res.cookie('auth', token);
          res
            .status(HttpStatus.CREATED)
            .json({ message: 'User creadted successfully.', user, token });
        })
        .catch(e => {
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error occured.' });
        });
    });
  },

  // *********************** //
  async LoginUser(req, res) {
    if (!req.body.username || !req.body.password) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'No empty feild allowed.' });
    }

    await User.findOne({ username: Helpers.firstUpper(req.body.username) })
      .then(user => {
        if (!user) {
          return res
            .status(HttpStatus.NOT_FOUND)
            .json({ message: 'Username not found.' });
        }

        return bcrypt.compare(req.body.password, user.password).then(result => {
          if (!result) {
            return res
              .status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: 'Password is incorrect.' });
          }
          const token = jwt.sign({ data: user }, dbConfig.secret, {
            expiresIn: '3h'
          });
          res.cookie('auth', token);
          return res
            .status(HttpStatus.OK)
            .json({ message: 'Login successful.', user, token });
        });
      })
      .catch(error => {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured.' });
      });
  }
};

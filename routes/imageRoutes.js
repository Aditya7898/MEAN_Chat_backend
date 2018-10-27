const express = require('express');
const router = express.Router();
const AuthHelper = require('../helpers/AuthHelper');

const ImageCtrl = require('../controllers/images');

router.post('/upload-image', AuthHelper.VerifyToken, ImageCtrl.UploadImage);
router.get('/set-default-image/:imgId/:imgVersion', AuthHelper.VerifyToken, ImageCtrl.SetDefaultImage);

module.exports = router;

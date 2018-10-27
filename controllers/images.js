const cloudinary = require('cloudinary');
const HttpStatus = require('http-status-codes');

const User = require('../models/usermodels');

cloudinary.config({
    cloud_name: 'dzihvkfzd',
    api_key: '365694139453394',
    api_secret: '5O6rC39te-m4JK4TOEAWex38GhM'
});

module.exports = {
    UploadImage(req, res) {
        cloudinary.uploader.upload(req.body.image, async (result) => {
            // console.log(result);

            await User.update({
                _id: req.user._id
            }, {
                    $push: {
                        images: {
                            imgId: result.public_id,
                            imgVersion: result.version
                        }
                    }
                })
                .then(() => res.status(HttpStatus.OK).json({ message: 'Image Uploaded successfully..' }))
                .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error Uploading image' }))
        });
    },

    async SetDefaultImage(req, res) {
        const { imgId, imgVersion } = req.params;
        await User.update({
            _id: req.user._id
        },
            {
                picId: imgId,
                picVersion: imgVersion
            }
        )
            .then(() => res.status(HttpStatus.OK).json({ message: 'Default image set successfully..' }))
            .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error Uploading image' }))
    }
};
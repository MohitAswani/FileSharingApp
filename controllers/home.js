const { validationResult } = require('express-validator');

const User = require('../models/user');
const Upload = require('../models/upload');

exports.getHome = (req, res, next) => {
    res.render('home/home.ejs', {
        pageTitle: 'Home',
        path: '/home',
        hasError: false,
        errorMessage: ''
    });
}

exports.postUpload = (req, res, next) => {
    const file = req.file;

    if (!file) {
        console.log('postUpload');
        return res.status(422).render('home/home.ejs', {
            pageTitle: 'Home',
            path: '/home',
            hasError: true,
            errorMessage: 'Please add a file'
        })
    }

    const fileObj = {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        key: file.key,
    };

    const newUpload = new Upload({
        userId: req.user._id,
        file: fileObj,
        visibility: 'public',
        visibleTo: []
    });

    newUpload.save()
        .then(result => {
            req.user.uploads.push({
                fileid: result._id
            });
            return req.user.save();
        })
        .then(result => {
            return res.redirect('/uploads');
        })
        .catch(err => {
            return next(createServerError(err));
        });

}

exports.getUsersUploads = (req, res, next) => {

    req.user
        .populate('uploads.fileid')
        .then(user => {
            res.render('home/uploads.ejs', {
                pageTitle: 'Uploads',
                path: '/uploads',
                hasError: false,
                errorMessage: '',
                uploads: user.uploads,
                domain: process.env.DOMAIN
            });
        })
        .catch(err => {
            return next(createServerError(err));
        })
}

exports.getVisibility = (req, res, next) => {
    const uploadKey = req.params.key;

    Upload.findOne({ 'file.key': uploadKey })
        .then(upload => {
            res.render('home/visibility.ejs', {
                pageTitle: 'Change Visibility',
                path: '',
                hasError: false,
                errorMessage: '',
                upload:upload
            });
        })
        .catch(err => {
            return next(createServerError(err));
        })
}

exports.changeVisibility = (req, res, next) => {
    const uploadKey = req.body.uploadKey;
    const visibility = req.body.visibility;

    Upload.findOneAndUpdate({ 'file.key': uploadKey }, { 'visibility': visibility })
        .then(upload => {
            if (upload) {
                return res.status(200).json({
                    message: 'Successfully updated the visibility'
                });
            }

            return res.status(404).json({
                message: 'No such upload found'
            });

        })
        .catch(err => {
            return next(createServerError(err));
        })
}


exports.addUser = (req, res, next) => {
    const uploadKey = req.body.uploadKey
    const email = req.body.email;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg
        });
    }

    if (req.user.email === email) {
        return res.status(422).json({
            message: 'You already have the access.'
        });
    }

    Upload.findOne({ 'file.key': uploadKey })
        .then(upload => {
            if (upload) {

                let emailIndex = upload.visibleTo.findIndex(p => {
                    return p.email === email
                });

                if (emailIndex === -1) {
                    upload.visibleTo.push({ email: email });
                    upload.save()
                        .then(result => {
                            return res.status(200).json({
                                message: 'Added user'
                            });
                        })
                        .catch(err => {
                            throw err;
                        })
                }
                else {
                    return res.status(200).json({
                        message: 'Already exists'
                    });
                }

            }
            else {
                return res.status(404).json({
                    message: 'No such upload exists'
                });
            }

        })
        .catch(err => {
            return next(createServerError(err));
        })

}

exports.removeUser = (req, res, next) => {
    const uploadKey = req.body.uploadKey
    const email = req.body.email;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg
        });
    }

    if (req.user.email === email) {
        return res.status(422).json({
            message: 'Your email cannot be removed.'
        });
    }

    Upload.findOne({ 'file.key': uploadKey })
        .then(upload => {
            if (upload) {

                let newVisibleArray = upload.visibleTo.filter(p => {
                    return p.email !== email
                });

                if (newVisibleArray !== upload.visibleTo) {
                    upload.visibleTo=newVisibleArray;
                    upload.save()
                        .then(result => {
                            return res.status(200).json({
                                message: 'Removed user'
                            });
                        })
                        .catch(err => {
                            throw err;
                        })
                }
                else {
                    return res.status(200).json({
                        message: 'Already removed'
                    });
                }

            }
            else {
                return res.status(404).json({
                    message: 'No such upload exists'
                });
            }

        })
        .catch(err => {
            return next(createServerError(err));
        })

}

const createServerError = (err) => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return error;
}
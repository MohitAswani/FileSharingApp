const path = require('path');
const fs = require('fs');

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

    const newUpload = new Upload({
        userId: req.user._id,
        file: file
    });

    newUpload.save()
        .then(result => {
            req.user.uploads.push({
                fileid:result._id
            });
            return req.user.save();
        })
        .then(result => {
            return res.redirect(`/file/${file.filename}`);
        })
        .catch(err => {
            return next(createServerError(err));
        });

}

exports.getUsersUploads=(req,res,next)=>{

    req.user
        .populate('uploads.fileid')
        .then(user=>{
            console.log(user.uploads[0].fileid.file);
            res.render('home/uploads.ejs', {
                pageTitle: 'Uploads',
                path: '/uploads',
                hasError: false,
                errorMessage: '',
                uploads:user.uploads
            });
        })
        .catch(err=>{
            return next(createServerError(err));
        })
}

exports.getFile = (req, res, next) => {
    const filename = req.params.filename;

    const filePath = path.join('data', 'files', filename);

    const file = fs.createReadStream(filePath).on('error', (err) => {
        return res.redirect('/404');
    });

    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');

    file.pipe(res);
}

const createServerError = (err) => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return error;
}
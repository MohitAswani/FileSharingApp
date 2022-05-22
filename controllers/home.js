const path = require('path');
const fs = require('fs');

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

    return res.redirect(`/file/${file.filename}`);
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
const path = require('path');
const crypto = require('crypto');

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const multer = require('multer');

const { fileStorage, getFileStream } = require('./util/s3');


const User = require('./models/user');
const Upload = require('./models/upload');

const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');

const errorController = require('./controllers/error');

const app = express();

const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
});

const fileFilter = (req, file, cb) => {
    cb(null, true);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('file'));

app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httponly: true,
        store: store
    },
    store: store
}));

app.set('view engine', 'ejs');

app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/file/:filename', (req, res, next) => {
    const key = req.params.filename;

    Upload.findOne({ 'file.key': key })
        .then(upload => {

            if (!upload) {
                return res.status(404).render('errors/404', {
                    pageTitle: 'File not found',
                    path: {},
                    msg: 'File not found'
                });
            }

            const fileref = getFileStream(upload.file.key);
            res.setHeader('Content-Disposition', 'attachment; filename="' + upload.file.originalname + '"');
            fileref.pipe(res);
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return error;
        })
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }

    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });

});

app.use(authRoutes);
app.use(homeRoutes);

app.get('/404', errorController.get404);

app.use((error, req, res, next) => {
    console.log(error);
    if (error.httpStatusCode === 404) {
        return res.status(404).render('errors/404', {
            pageTitle: 'Page not found',
            path: {},
            msg: error.msg
        });
    }
    if (error.httpStatusCode === 500) {
        res.status(500).render('errors/500', {
            pageTitle: 'Server errror',
            path: '/500',
            msg: error.msg
        });
    }

    else {
        res.status(500).render('errors/500', {
            pageTitle: 'Server errror',
            path: '/500',
            msg: error.msg
        });
    }
})

mongoose.connect(process.env.MONGODB_URI)
    .then(result => {
        console.log('Connection successful');
        app.listen(3000 || process.env.PORT);
    })
    .catch(err => {
        console.log(err);
    });

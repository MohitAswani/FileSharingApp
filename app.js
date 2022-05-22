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

const homeRoutes = require('./routes/home');

const errorController = require('./controllers/error');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'data/files');
    },
    filename: (req, file, cb) => {
        crypto.randomBytes(16, (err, buf) => {
            if (err) {
                console.log(err);
            }
            else {
                cb(null, buf.toString('hex') + '-' + file.originalname);
            }
        })
    }
});

const fileFilter = (req, file, cb) => {
    cb(null, true);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('file'));

app.use(cookieParser());

app.set('view engine', 'ejs');

app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));

app.use(homeRoutes);

app.get('/404', errorController.get404);

app.use((error, req, res, next) => {
    if (error.httpStatusCode === 404) {
        return res.status(404).render('errors/404', {
            pageTitle: 'Page not found',
            path: {}
        });
    }
    if (error.httpStatusCode === 500) {
        res.status(500).render('errors/500', {
            pageTitle: 'Server errror',
            path: '/500'
        });
    }

    else {
        res.status(500).render('errors/500', {
            pageTitle: 'Server errror',
            path: '/500'
        });
    }
})

app.listen(3000 || process.env.PORT);
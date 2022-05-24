const path = require('path');
const crypto = require('crypto');

const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { validationResult } = require("express-validator");

const User = require('../models/user');

const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    secureConnection: false,
    port: 587,
    tls: {
        ciphers: 'SSLv3'
    },
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        errorMessage: '',
        oldinput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
}

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldinput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    oldinput: {
                        email: email,
                        password: password
                    },
                    validationErrors: []
                });
            }

            bcrypt
                .compare(password, user.password)
                .then(result => {
                    if (result) {

                        if(user.confirmEmailToken){
                            res.redirect('/confirmEmail');
                            return transporter.sendMail({
                                to: email,
                                from: 'test69420@outlook.in',
                                subject: 'Confirm email',
                                html: `<h2>Confirm email</h2>
                            <p>Click on <a href='http://localhost:3000/confirmEmail/${user.confirmEmailToken}'>this</a> to confirm your email.</p>`
                            });
                        }

                        req.session.isAuth = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            if (err) {
                                const error = new Error(err);
                                error.httpStatusCode = 500;
                                return next(error);
                            }
                            return res.redirect('/');
                        })
                    }

                    return res.status(422).render('auth/login', {
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password',
                        oldinput: {
                            email: email,
                            password: password
                        },
                        validationErrors: []
                    });
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Sign up',
        errorMessage: '',
        oldinput: {
            firstname: '',
            lastname: '',
            email: '',
            password: ''
        },
        validationErrors: []
    });
}

exports.postSignUp = (req, res, next) => {
    const { firstname, lastname, email, password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Sign up',
            errorMessage: errors.array()[0].msg,
            oldinput: {
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }

    crypto.randomBytes(32, (err, buff) => {
        if (err) {
            throw err;
        }

        const token = buff.toString('hex');

        bcrypt
            .hash(password, 12)
            .then(hashedPassword => {
                const newuser = new User({
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    password: hashedPassword,
                    confirmEmailToken: token,
                    confirmEmailTokenExpiration: Date.now() + 3600000
                });
                return newuser.save();
            })
            .then(result => {
                res.redirect('/confirmEmail');
                return transporter.sendMail({
                    to: email,
                    from: 'test69420@outlook.in',
                    subject: 'Confirm email',
                    html: `<h2>Confirm email</h2>
                <p>Click on <a href='http://localhost:3000/confirmEmail/${token}'>this</a> to confirm your email.</p>`
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(err);
            })
    })

}

exports.confirmEmail = (req, res, next) => {
    const confirmEmailToken = req.params.confirmEmailToken;

    User.findOne({ confirmEmailToken: confirmEmailToken })
        .then(User => {
            if (!User) {
                return res.render('auth/login', {
                    pageTitle: 'Login',
                    errorMessage: 'Something went wrong',
                    oldinput: {
                        email: '',
                        password: ''
                    },
                    validationErrors: []
                });
            }

            User.confirmEmailToken = undefined;
            return User.save()
                .then(result => {
                    return res.redirect('/successConfirmEmail');
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(err);
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
        })
}

exports.getConfirmEmail = (req, res, next) => {
    res.render('auth/confirm_email', {
        pageTitle: 'Confirm email'
    });
}

exports.getSuccessConfirmEmail = (req, res, next) => {
    res.render('auth/success_confirm_email', {
        pageTitle: 'Successfully confirmed email'
    });
}
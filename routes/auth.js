const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');

const authController = require('../controllers/auth');

const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login',
    [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Please enter a valid email')
            .normalizeEmail(),
        body('password')
            .trim()
            .isLength({ min: 8 })
            .isAlphanumeric()
            .withMessage('Please enter a password with min 8 alphanumeric characters.')
    ],
    authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup',
    [
        body('firstname')
            .trim()
            .isAlphanumeric()
            .withMessage('Please enter a valid first name.'),
        body('lastname')
            .trim()
            .isAlphanumeric()
            .withMessage('Please enter a valid last name.'),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Please enter a valid email')
            .normalizeEmail()
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(user => {
                        if (user) {
                            return Promise.reject('Email already exists');
                        }
                    })
            })
        ,
        body('password')
            .trim()
            .isLength({ min: 8 })
            .isAlphanumeric()
            .withMessage('Please enter a password with min 8 alphanumeric characters.')
    ],
    authController.postSignUp);

router.get('/confirmEmail',authController.getConfirmEmail);

router.get('/confirmEmail/:confirmEmailToken',authController.confirmEmail);

router.get('/successConfirmEmail',authController.getSuccessConfirmEmail);

module.exports = router;
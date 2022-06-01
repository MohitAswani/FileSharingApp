const express = require('express');
const { body } = require('express-validator');   

const isAuth = require('../middleware/is-auth');

const homeController = require('../controllers/home');

const router = express.Router();

router.get('/',isAuth,homeController.getHome);

router.get('/home',isAuth,homeController.getHome);

router.get('/uploads',isAuth,homeController.getUsersUploads);

router.post('/uploads',isAuth,homeController.postUpload);

router.post('/uploads/change-visibility',isAuth,homeController.changeVisibility);

router.post('/uploads/add-user',
    [
        body('email','Please enter a valid email')
        .trim()
        .isEmail()
        .normalizeEmail()
    ],
    isAuth,
    homeController.addUser);

router.get('/visibility/:key',isAuth,homeController.getVisibility);

router.post('/uploads/remove-user',
    [
        body('email','Please enter a valid email')
        .trim()
        .isEmail()
        .normalizeEmail()
    ],
    isAuth,
    homeController.removeUser);

module.exports=router;
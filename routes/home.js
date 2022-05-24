const express = require('express');

const isAuth = require('../middleware/is-auth');

const homeController = require('../controllers/home');

const router = express.Router();

router.get('/',isAuth,homeController.getHome);

router.get('/home',isAuth,homeController.getHome);

router.post('/uploads',isAuth,homeController.postUpload);

router.get('/file/:filename',homeController.getFile);

module.exports=router;
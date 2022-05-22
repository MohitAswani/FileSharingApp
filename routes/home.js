const path = require('path');

const express = require('express');

const homeController = require('../controllers/home');

const router = express.Router();

router.get('/',homeController.getHome);

router.get('/home',homeController.getHome);

router.post('/uploads',homeController.postUpload);

router.get('/file/:filename',homeController.getFile);

module.exports=router;
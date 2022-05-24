const mongoose = require('mongoose');

const upload= require('./upload');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    confirmEmailToken: String,
    uploads:[{
        fileid:{
        type:Schema.Types.ObjectId,
        ref:upload
    }}]
});

module.exports = mongoose.model('User', userSchema)
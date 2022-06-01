const mongoose = require('mongoose');

const user = require('./user');

const Schema = mongoose.Schema;

const uploadSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    file:{
        type:Object,
        required:true
    },
    visibility:{
        type:String,
        required:true
    },
    visibleTo:[{
        email:String
    }]
});

module.exports = mongoose.model('Upload',uploadSchema);
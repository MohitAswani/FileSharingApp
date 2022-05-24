const mongoose = require('mongoose');

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
    }
});

module.exports = mongoose.model('Upload',uploadSchema);
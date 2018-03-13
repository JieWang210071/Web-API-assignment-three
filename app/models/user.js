// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({ 
    name: {
        type: String,
        required: [true, 'name must be provided']
    }, 
    password: {
        type: String,
        required: [true, 'password must be provided']
    }, 
    username: {
        type: String,
        required: [true, 'username must be provided']
    } 
}));
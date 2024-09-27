const mongoose = require('mongoose');
const validator = require('validator')

const usersSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trime: true
    },
    lname: {
        type: String,
        required: true,
        trime: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw Error("not valid email")
            }
        }
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 10
    },
    gender: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        enum: ['Manager', 'HR', 'Sales'], 
        required: true
    }, 
    course: {
        type: [String],
        enum: ['MCA', 'BCA', 'BSC'],
        required: true
    },
    user_profile: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,

    },
    datecreated:Date,
    dateUpdated:Date

})

// model dfine means we created collection with name users
const users = new mongoose.model("users",usersSchema)

module.exports  = users;
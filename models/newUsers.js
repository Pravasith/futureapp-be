const mongoose = require('mongoose')
const Schema = mongoose.Schema


// Create user Schema and Model
const NewUserSchema = new Schema({
    username: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        required: [true, "The computer couldn't process the email."],
    },

    password: {
        type: String,
    },
    encryptedKey : {
        type: String,
        required: [true, "The computer couldn't process the encrypted key."],
    },
    cardsData: {
        type: String,
    },
    teamData: {
        type: String,
    },
    statusBarLevel: {
        type: Number,
        default: 1
    },
    profilePicture: {
        type: String,
        default: null
    },
    googleId: {
        type: String,
        default: null
    },
    googleProfileURL: {
        type: String,
        default: null
    },
    linkedinId: {
        type: String,
        default: null
    },
    linkedinProfileURL: {
        type: String,
        default: null
    },
    professionalTitle : {
        type: String,
        default: null
    },
    time: {
        type : Date,
        default: Date.now
    },
    

})

const NewUser = mongoose.model('newUser', NewUserSchema)

module.exports = NewUser
const mongoose = require('mongoose')
const Schema = mongoose.Schema



// Create user idea Schema and Model
const NewCardSchema = new Schema({
    robotName: {
        type: String,
        // required: [true, "The computer couldn't process the username."],
        // default: getRandomUsername()
    },
    shortIdea: {
        type: String,
        required: [true, "The computer couldn't process the short idea."]
    },
    elaboratedIdea: {
        type: String,
        required: [true, "The computer couldn't process the elaborated idea."]
    },
    imageArray: [{
        imageURL: {
            type: String,
            required: [true, "image url problem"]
        },
        imageDescription: {
            type: String,
            required: [true, "image description problem"]
        },
        imageNumber: {
            type: Number,
            required: [true, "image number problem"]
        }
    }],
    starsCount: {
        type: Number,
        default: 0
    },
    psybillsRaised: {
        type: Number,
        default: 0
    },
    remoteWorkerCount: {
        type: Number,
        default: 0
    },
    remoteWorkingPositionsAvailable: {
        type: Number,
        default: 0
    },
    userStatData: {
            courage: {
                type: Number,
                "default": 15
            },
            wisdom: {
                type: Number,
                "default": 0
            },
            nectar: {
                type: Number,
                "default": 15
            }
        
    },
    ideaType: {
        type: String,
        default: null
    },
    cardColor: {
        type: String,
        default: "#333333"
    },

    time: {
        type : Date,
        default: Date.now
    }
})

const NewIdeaCard = mongoose.model('newIdeaCard', NewCardSchema)

module.exports = NewIdeaCard
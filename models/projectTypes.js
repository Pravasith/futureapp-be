const mongoose = require('mongoose')
const Schema = mongoose.Schema



// Create user idea Schema and Model
const ProjectSchema = new Schema({
    businessTypes: {
        type: Array
    },
    time: {
        type : Date,
        default: Date.now
    }
})

const NewProjectType = mongoose.model('newProjectType', ProjectSchema)

module.exports = NewProjectType
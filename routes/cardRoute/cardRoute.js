'use strict'

const Joi = require('joi')
const fs = require('fs')
const AWS = require('aws-sdk')
const Path = require('path')
// new item

const NewIdeaCard = require('../../models/newIdeaCard')
const getRandomUsername = require('./usernamesRandom')
const CONFIG = require('../../config')
const uploadManager = require('../../lib/uploadManager')


const s3BucketCredentials =  CONFIG.awsS3Config.s3BucketCredentials



// 'Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS')

var corsHeaders = {
    origin: ["http://localhost:3000","http://testing-my-web.s3-website.ap-south-1.amazonaws.com"],
    // headers: ["Access-Control-Allow-Origin","Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type"],
    credentials: true
}



let getCardData = {
    method: "POST",
    path: "/api/card/get-card-data",
    config: {
        tags: ['api', 'User Data'],
        cors: corsHeaders,
        validate: {
            payload: Joi.object({
                robotName: Joi.string()
            })
        }
    },
    handler: async (request, h) => {

        let dataRecieved = request.payload
        let dataToSendBack

        await NewIdeaCard.findOne(
            {
                robotName: dataRecieved.robotName
            }
        )
        .then((result) => {

            dataToSendBack = result
        })
        .catch((err) => {
            return h.response(err)
        })

        // return dataRecieved
        // console.log(request.payload)

        return h.response(dataToSendBack)
    }
}


let uploadIdeaImages = {
    method: "POST",
    path: "/api/card/uploadimage",
    
    config: {
        tags: ['api'],
        description: 'Upload images to Amazon S3 bucket',
        notes: 'Returns a todo item by the id passed in the path',
        cors: corsHeaders,
        payload: {
            maxBytes: 1024 * 1024 * 15, // 5 Mb
            output: 'stream',
            allow:'multipart/form-data',
            parse: true
          },
        validate:{
            
//////////// VERY- IMP - Remove this if problems persist in uploads
            payload: Joi.object({
                toxicData: Joi.object(
                    {
                    domain: Joi.allow(null),
                    hapi: Joi.object({
                        filename: Joi.string(),
                        headers: Joi.object({
                            "content-disposition": Joi.any(),
                            "content-type": Joi.string().valid("image/gif", "image/jpg", "image/jpeg", "image/png")
                        })
                    }),
                    readable: Joi.boolean(),
                    _data: Joi.binary(),
                    _encoding: Joi.string(),
                    _events: Joi.object(),
                    _eventsCount: Joi.number(),
                    _position: Joi.number(),
                    _readableState: Joi.object(),
                    _maxListeners: Joi.any()
                    }
                )
            })
////////////////////////////////////////////////////////////////////
        }
        
    },
    handler: async (request, h) => {

        let comebackData

        const uploadData = request.payload.toxicData
        const uploadName = Path.basename(request.payload.toxicData.hapi.filename)
        const destination = Path.join(__dirname, 'uploads', uploadName)

        let myWriteStream = fs.createWriteStream(destination)
        fs.writeFileSync(destination, uploadData._data)

        await uploadManager.uploadImageToS3Bucket(uploadData, destination)
        .then((val) => {
            // console.log(val.imageURL)
            comebackData = val
        })
        .catch((err) => {
            console.error('Our bad, we could\'nt upload the image to the server', err )
        })

        return h.response(comebackData).code(201)
    }
}

// fix this - add mongo db Schemas and shit
let createCard = {
    method: "POST",
    path: "/api/card/newcard",
    config: {
        tags: ['api', 'User Data'],
        description: 'Upload card data to the db',
        notes: 'Returns a todo item by the id passed in the path',
        cors: corsHeaders,
        validate: {
            payload: {
                robotName: Joi.string(),
                shortIdea: Joi.string().required(),
                elaboratedIdea: Joi.string().required(),
                imageArray: Joi.array().items(Joi.object({
                    "imageURL" : Joi.string(),
                    "imageDescription" : Joi.string(),
                    "imageNumber" : Joi.number(),
                }))
            }
        },
        
    },
    handler: async (request, h) => {

        let dataRecieved
        let dataToSendBack
        let isUnique = false

        let username = getRandomUsername()
        // console.log('username: ' + username)

        async function checkAndCreate(uName) {
            //check if username exists
            await NewIdeaCard.findOne({
                robotName: uName
            })
            .then( result => {
                if(result){
                    // console.log("first in if " + username)
                    username = getRandomUsername()
                    isUnique = false
                }
                
                else{
                    isUnique = true
                    // console.log("first in else " + username)
                }

            })
            .catch( e => h.response(e))

            if(isUnique){
                // console.log("second")
                await NewIdeaCard.create(
                    {
                        ...request.payload,
                        robotName: uName,
                    }
                )
                .then((newIdeaCard) => {
                    dataToSendBack = newIdeaCard
                })
                .catch((err) => {
                    return h.response(err)
                })
            }

            else
            await checkAndCreate(username)
            
        }

        await checkAndCreate(username)

        return h.response(dataToSendBack).code(201)
        // return h.response(request.payload).code(201)

    }
}

let updateBusinessTypeInCard = {
    method: "PUT",
    path: "/api/card/newcard",
    config: {
        tags: ['api', 'User Data'],
        cors: corsHeaders,
        validate: {
            payload: Joi.object({
                robotName: Joi.string(),
                businessType: Joi.string()
            })
        }
    },
    handler: async (request, h) => {

        let dataRecieved = request.payload
        await NewIdeaCard.findOneAndUpdate(
            {
                robotName: dataRecieved.robotName
            },
            {
                $set: {'ideaType': request.payload.businessType}
            },
            {
                new: true
            }
        )
        .then((result) => {
            dataRecieved = result
        })
        .catch((err) => {
            return h.response(err)
        })

        // return dataRecieved
        // console.log(request.payload)

        return h.response(dataRecieved)
    }
}

let updateCardColorInCard = {
    method: "PUT",
    path: "/api/card/update-color",
    config: {
        tags: ['api', 'User Data'],
        cors: corsHeaders,
        validate: {
            payload: Joi.object({
                robotName: Joi.string(),
                cardColor: Joi.string()
            })
        }
    },
    handler: async (request, h) => {

        let dataRecieved = request.payload
        await NewIdeaCard.findOneAndUpdate(
            {
                robotName: dataRecieved.robotName
            },
            {
                $set: {'cardColor': request.payload.cardColor}
            },
            {
                new: true
            }
        )
        .then((result) => {
            dataRecieved = result
        })
        .catch((err) => {
            return h.response(err)
        })

        // return dataRecieved
        // console.log(request.payload)

        return h.response(dataRecieved)
    }

}


let deleteCard = {
    method: "DELETE",
    path: "/api/card/delete-card",
    config: {
        tags: ['api', 'User Data'],
        cors: corsHeaders,
        validate: {
            payload: Joi.object({
                robotName: Joi.string()
            })
        }
    },
    handler: async (request, h) => {

        let dataRecieved = request.payload
        await NewIdeaCard.findOneAndRemove(
            {
                robotName: dataRecieved.robotName
            }
        )
        .then((result) => {
            dataRecieved = result
        })
        .catch((err) => {
            return h.response(err)
        })

        // return dataRecieved
        // console.log(request.payload)

        return h.response(dataRecieved)
    }

}

let UserBaseRoute = [

    createCard,
    uploadIdeaImages,
    updateBusinessTypeInCard,
    updateCardColorInCard,
    getCardData,
    deleteCard
]

module.exports = UserBaseRoute
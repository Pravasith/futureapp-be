'use strict'

const Joi = require('joi')
const nacl = require('tweetnacl')
nacl.util = require('tweetnacl-util')
const Boom = require('boom')
const axios = require('axios')

const NewUser = require('../../models/newUsers')
// 'Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS')

const corsHeaders = {
    origin: ["http://localhost:3000","http://testing-my-web.s3-website.ap-south-1.amazonaws.com",'https://www.linkedin.com/uas/oauth2/authorization'],
    // headers: ["Access-Control-Allow-Origin","Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type"],
    credentials: true
}

const teamArray = [
    {
        "name": "Directors",
        "members": [],
        "promises": {
            "onGoing": 0,
            "delivered": 0
        }
    },
    {
        "name": "Marketing team",
        "members": [],
        "promises": {
            "onGoing": 0,
            "delivered": 0
        }
    },
    {
        "name": "Product development team",
        "members": [],
        "promises": {
            "onGoing": 0,
            "delivered": 0
        }
    },
    {
        "name": "Creative content",
        "members": [],
        "promises": {
            "onGoing": 0,
            "delivered": 0
        }
    },
    {
        "name": "Sales team",
        "members": [],
        "promises": {
            "onGoing": 0,
            "delivered": 0
        }
    },
    {
        "name": "Technology team",
        "members": [],
        "promises": {
            "onGoing": 0,
            "delivered": 0
        }
    },
    {
        "name": "Human resource",
        "members": [],
        "promises": {
            "onGoing": 0,
            "delivered": 0
        }
    }
]

let getUserDetails = {
    method: "POST",
    path: "/api/user/getuserdata",

    
    config: {
        description: 'Get userdata',
        notes: 'Returns a todo item by the id passed in the path',
        tags: ['api', 'User Data'],
        cors: corsHeaders,
        auth: {
            strategy: 'restricted'
        }
    },
    handler: async  (request, h) => {

        let { id } = request.payload
        let dataToSendBack
        // console.log(username)

        // if(request.auth.credentials.username !== username)
        // return h.response({userdata: 'sorry, wrong user'})

        await NewUser.findOne(
            {
                // username
                "_id" : id
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

let createUser = {
    method: "POST",
    path: "/api/user/userdata",
    config: {
        tags: ['api', 'User Data'],
        description: 'Upload User data to the db',
        cors: corsHeaders,
        validate: {
            payload: {
                username: Joi.string().required(),
                password: Joi.string().required(),
                emailId: Joi.string().email().required(),
                cardsArray: Joi.array().items(
                    Joi.object({
                        cardColor : Joi.string(),
                        shortIdea : Joi.string(),
                        elaboratedIdea : Joi.string(),
                        ideaType : Joi.string(),
                        imageArray : Joi.array().items(
                            Joi.object({
                                imageNumber : Joi.number(),
                                imageURL : Joi.string(),
                                imageDescription : Joi.string(),
                                _id : Joi.string()
                            })
                        ),
                        psybillsRaised : Joi.number(),
                        remoteWorkerCount : Joi.number(),
                        remoteWorkingPositionsAvailable : Joi.number(),
                        robotName : Joi.string(),
                        starsCount : Joi.number(),
                        userStatData: Joi.object({
                            courage : Joi.number(),
                            nectar : Joi.number(),
                            wisdom : Joi.number()
                        }),
                        __v: Joi.number(),
                        _id: Joi.string(),
                        time: Joi.string()
                    })
                ).required()
            }
        },
    },
    handler: async (request, h) => {

        const { username, emailId, password, cardsArray } = request.payload
        

        // console.log( username, emailId, password, cardsArray )
        let emailIsTaken, userNameIsTaken
        let existsData 

        const checkIfUsernameExists = async (uName, email) => {

            // check if username exists
            await NewUser.findOne({
                username: uName
            })
            .then( result => {
                if(result){
                    userNameIsTaken = true
                    existsData = 'Someone has already taken the username'
                }
                
                else{
                    userNameIsTaken = false
                }
            })
            .catch( e => h.response(e))


            // check if email exists
            await NewUser.findOne({
                emailId: email
            })
            .then( result => {
                if(result){
                    emailIsTaken = true
                    existsData = 'Someone has already taken the email'
                }
                
                else{
                    emailIsTaken = false
                }
            })
            .catch( e => h.response(e))
        }

        await checkIfUsernameExists(username, emailId)

        if(emailIsTaken && userNameIsTaken){
            return h.response({itsTaken : true, exists : existsData})
        }

        if(emailIsTaken || userNameIsTaken){
            return h.response({itsTaken : true, exists : existsData})
        }

        else{

            let dataRecieved = request.payload
            let dataToSendBack
            
            // Decodes string and returns Uint8Array of bytes.
            let message = nacl.util.decodeUTF8(JSON.stringify(cardsArray))

            // Decodes Base-64 encoded string and returns Uint8Array of bytes.
            let key = nacl.util.decodeBase64('LTEBAPrZfUvTCFT0DVHVq0hdJPMcz2T+E17xq3uYQzw=')

            function generateRandomNonceText() {
                var text = ""
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

                for (var i = 0; i < 32; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length))

                return text
            }

            let encryptedKey = generateRandomNonceText()

            // Decodes Base-64 encoded string and returns Uint8Array of bytes.
            let nonce = nacl.util.decodeBase64(encryptedKey)

            let encryptedData = nacl.secretbox(message, nonce, key)
            let encryptedDataString = nacl.util.encodeBase64(encryptedData)
            request.cookieAuth.set({ username })

            let teamDataEncrypted = nacl.secretbox( nacl.util.decodeUTF8(JSON.stringify(teamArray)), nonce, key )
            let stringifiedTeamData = nacl.util.encodeBase64(teamDataEncrypted)

            // console.log("hello",request.state)

            // decrypt data 
            // use cardsData inplace of encrypted data string
            let rawData = nacl.secretbox.open(nacl.util.decodeBase64(encryptedDataString), nacl.util.decodeBase64(encryptedKey), key)
            let decryptedData = JSON.parse(nacl.util.encodeUTF8(rawData))

            // console.log(decryptedData)

            await NewUser.create(
                {
                    username : username,
                    password : password,
                    emailId : emailId,
                    cardsData : encryptedDataString,
                    encryptedKey : encryptedKey,
                    teamData : stringifiedTeamData
                }
            )
            .then((newUser) => {
                dataToSendBack = {...newUser._doc, itsTaken : false}
            })
            .catch((err) => {
                return h.response(err)
            })

            return h.response(dataToSendBack).code(201)
            // return h.response(request.payload).code(201)

        }

    }
}



let linkedInKnock = {
    method: '*',
    path: '/knock/linkedin',
    options: {
        cors: corsHeaders,
        auth: {
            strategy: 'linkedin',
        },
        handler: async function (request, h) {

            if (!request.auth.isAuthenticated) {
                return h.response(Boom.unauthorized('Authentication failed: ' + request.auth.error.message))
            }

            // console.log(request.auth.credentials)

            let linkedinCreds = {
                firstName : request.auth.credentials.profile.raw.firstName,
                lastName : request.auth.credentials.profile.raw.lastName,
                linkedinId : request.auth.credentials.profile.raw.id,
                profilePicture : request.auth.credentials.profile.raw.pictureUrl,
                linkedinProfileURL : request.auth.credentials.profile.raw.siteStandardProfileRequest.url,
                professionalTitle : request.auth.credentials.profile.raw.headline,
                emailId : request.auth.credentials.profile.raw.emailAddress
            }

            request.cookieAuth.set(linkedinCreds)

            // return '<pre>' + JSON.stringify(request.auth.credentials, null, 4) + '</pre>';
            return h.redirect('/api/user/login-linkedin-user')
        }
    }
}


let googleKnock = {
    method: '*',
        path: '/knock/google',
        options: {
            auth: {
                strategy: 'google',
                mode: 'try'
            },
            handler: function (request, h) {

                if (!request.auth.isAuthenticated) {
                    return h.response(Boom.unauthorized('Authentication failed: ' + request.auth.error.message))
                }

                let googleCreds = {
                    firstName : request.auth.credentials.profile.raw.given_name,
                    lastName : request.auth.credentials.profile.raw.family_name,
                    googleId : request.auth.credentials.profile.raw.sub,
                    profilePicture : request.auth.credentials.profile.raw.picture,
                    googleProfileURL : request.auth.credentials.profile.raw.profile,
                    emailId : request.auth.credentials.profile.raw.email
                }

                request.cookieAuth.set(googleCreds)

                // return '<pre>' + JSON.stringify(request.auth.credentials, null, 4) + '</pre>';
                return h.redirect('/api/user/login-google-user')
                // return googleCreds
            }
        }
}


let linkedInLogin = {
    method: 'POST',
    path: '/api/user/login-linkedin-user',
    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        handler: async (request, h)  => {

            // check if username exists and create if he/she doesn't
            let userIsTaken
            const { cardsArray } = request.payload
            let dataToSendBack


            await NewUser.findOne({
                linkedinId: request.auth.credentials.linkedinId
            })
            .then( result => {
                if(result){
                    userIsTaken = true
                    dataToSendBack = result
                }
                
                else
                userIsTaken = false
                
            })
            .catch( e => h.response(e))


            if(userIsTaken === false)
            {
            // Decodes string and returns Uint8Array of bytes.
            let message = nacl.util.decodeUTF8(JSON.stringify(cardsArray)) //------

            // Decodes Base-64 encoded string and returns Uint8Array of bytes.
            let key = nacl.util.decodeBase64('LTEBAPrZfUvTCFT0DVHVq0hdJPMcz2T+E17xq3uYQzw=')

            function generateRandomNonceText() {
                var text = ""
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

                for (var i = 0; i < 32; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length))

                return text
            }

            let encryptedKey = generateRandomNonceText()

            // Decodes Base-64 encoded string and returns Uint8Array of bytes.
            let nonce = nacl.util.decodeBase64(encryptedKey)

            let encryptedData = nacl.secretbox(message, nonce, key) //----
            let encryptedDataString = nacl.util.encodeBase64(encryptedData) //--------

            let teamDataEncrypted = nacl.secretbox( nacl.util.decodeUTF8(JSON.stringify(teamArray)), nonce, key )
            let stringifiedTeamData = nacl.util.encodeBase64(teamDataEncrypted)

            // decrypt data
            // use cardsData inplace of encrypted data string
            let rawData = nacl.secretbox.open(nacl.util.decodeBase64(encryptedDataString), nacl.util.decodeBase64(encryptedKey), key) //---------
            let decryptedData = JSON.parse(nacl.util.encodeUTF8(rawData)) //---------

            // console.log(decryptedData)

            await NewUser.create(
                {   
                    ...request.auth.credentials,
                    cardsData: encryptedDataString,
                    encryptedKey,
                    teamData: stringifiedTeamData
                }
            )
            .then((newUser) => {
                dataToSendBack = {...newUser._doc, itsTaken : false}
            })
            .catch((err) => {
                return h.response(err)
            })

            }

            return dataToSendBack
            // return request.auth.credentials
        }
    }

}




let googleLogin = {
    method: 'POST',
    path: '/api/user/login-google-user',
    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        handler: async (request, h)  => {

            // check if username exists and create if he/she doesn't
            let userIsTaken
            const { cardsArray } = request.payload
            let dataToSendBack


            await NewUser.findOne({
                googleId: request.auth.credentials.googleId
            })
            .then( result => {
                if(result){
                    userIsTaken = true
                    dataToSendBack = result
                }
                
                else
                userIsTaken = false
                
            })
            .catch( e => h.response(e))

            // console.log(dataToSendBack)


            if(userIsTaken === false)
            {
            // Decodes string and returns Uint8Array of bytes.
            let message = nacl.util.decodeUTF8(JSON.stringify(cardsArray)) //------

            // Decodes Base-64 encoded string and returns Uint8Array of bytes.
            let key = nacl.util.decodeBase64('LTEBAPrZfUvTCFT0DVHVq0hdJPMcz2T+E17xq3uYQzw=')

            function generateRandomNonceText() {
                var text = ""
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

                for (var i = 0; i < 32; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length))

                return text
            }

            let encryptedKey = generateRandomNonceText()

            // Decodes Base-64 encoded string and returns Uint8Array of bytes.
            let nonce = nacl.util.decodeBase64(encryptedKey)

            let encryptedData = nacl.secretbox(message, nonce, key) //----
            let encryptedDataString = nacl.util.encodeBase64(encryptedData) //--------
            
            
            let teamDataEncrypted = nacl.secretbox( nacl.util.decodeUTF8(JSON.stringify(teamArray)), nonce, key )
            let stringifiedTeamData = nacl.util.encodeBase64(teamDataEncrypted)


            // decrypt data 
            // use cardsData inplace of encrypted data string
            let rawData = nacl.secretbox.open(nacl.util.decodeBase64(encryptedDataString), nacl.util.decodeBase64(encryptedKey), key) //---------
            let decryptedData = JSON.parse(nacl.util.encodeUTF8(rawData)) //---------

            // console.log(decryptedData)

            await NewUser.create(
                {   
                    ...request.auth.credentials,
                    cardsData: encryptedDataString,
                    encryptedKey,
                    teamData: stringifiedTeamData
                }
            )
            .then((newUser) => {
                dataToSendBack = {...newUser._doc, itsTaken : false}
            })
            .catch((err) => {
                return h.response(err)
            })

            }

            return dataToSendBack
            // return request.auth.credentials
        }
    }
}


let linkedInView = {
    method: 'GET',
    path: '/api/user/login-linkedin-user',
    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        handler: async (request, h)  => {
            return h.view('linkedinLayout', {
                name: request.auth.credentials.firstName
            })
        }
    }
}

let googleView = {
    method: 'GET',
    path: '/api/user/login-google-user',
    config: {
        cors: corsHeaders,
        auth: {
            strategy: 'restricted',
        },
        handler: async (request, h)  => {
            return h.view('googleLayout', {
                name: request.auth.credentials.firstName
            })
        }
    }
}










let UserDataRoute = [
    createUser,
    getUserDetails,
    linkedInLogin,
    googleLogin,
    linkedInKnock,
    googleKnock,
    linkedInView,
    googleView
    
]

module.exports = UserDataRoute
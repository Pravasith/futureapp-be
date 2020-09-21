'use strict'

// External Dependencies
const Hapi = require('hapi')
const mongoose = require('mongoose')
const Inert = require('inert')
const Vision = require('vision')
const HapiSwagger = require('hapi-swagger')
const HapiAuthCookie = require('hapi-auth-cookie')
const Pack = require('./package')
const Bell = require('bell')

// Internal Dependencies
const Routes = require('./routes')
const configs = require('./config')

// create server 
const server = Hapi.server({
    // host: "159.89.167.240",
    host: "localhost",
    port: 8000
})

// connect to mongodb
mongoose.connect(configs.dbConfig.mongodbCredentials.connectUrl)
mongoose.Promise = global.Promise

// Default route
server.route({
    method: "GET",
    path: "/",
    handler: ( request, h ) => {
        return 'You have reached the home directory'
    }
})

const start = async () => {

    const swaggerOptions = {
        info: {
                title: 'Test API Documentation',
                version: Pack.version,
            },
        }
    
    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: swaggerOptions
        }
    ])
    await server.register(HapiAuthCookie)
    await server.register(Bell)
    await server.register(Vision)
    
    server.views({
        engines: {
            html: require("handlebars")
        },
        path : './views',
        // layout : 'default-layout'
    })

    // You'll need to go to https://developers.facebook.com/ and set up a
    // Website application to get started
    // Once you create your app, fill out Settings and set the App Domains
    // Under Settings >> Advanced, set the Valid OAuth redirect URIs to include http://<yourdomain.com>/bell/door
    // and enable Client OAuth Login

    server.auth.strategy('linkedin', 'bell', {
        provider: 'linkedin',
        password: 'cookie_encryption_password_secure',
        isSecure: false,
        clientId: '',
        clientSecret: '',
        location: server.info.uri,
        
        providerParams: {
            redirect_uri: 'server.info.uri' + '/knock/linkedin',
            fields: ':(id,firstName,lastName,email-address,siteStandardProfileRequest,headline,picture-url)'
        }
    })

    server.auth.strategy('google', 'bell', {
        provider: 'google',
        password: 'cookie_encryption_password_secure',
        isSecure: false,
        clientId: '',
        clientSecret: '',
        location: server.info.uri
        
    })

    server.auth.strategy('restricted', 'cookie',{
        password: '',
        cookie: 'session',
        isSecure: false,
        ttl: 1 * 24 * 60 * 60 * 1000,
        isSameSite: false,

    })

    server.route(Routes)

    try{
        await server.start()
    }
    catch(err){
        console.log(err)
        process.exit(1)
    }

    console.log(`Server is running at ${server.info.uri}. Press ctrl^C to terminate at anytime`)
}

start()
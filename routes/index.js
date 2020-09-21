'use strict'

let CardBaseRouter = require('./cardRoute/cardRoute')
let AppDataRouter = require('./appDataRoute/appData')
let UserDataRouter = require('./userRoute/userData')

let APIs = [...CardBaseRouter, ...AppDataRouter, ...UserDataRouter]

module.exports = APIs
'use strict'

const Joi = require('joi')

const NewProjectType = require('../../models/projectTypes')

const appData = {
    businessTypes : [
        "Web design", "Computer software", "Mechanical product", "Electrical product",
        "Electronics product", "Law related", "Medical", "Spiritual", "Management",
        "Pharmaceutical", "Research paper", "Artistic", "Architectural", "Chemical product",
        "Crafts related", "Accounting", "Banking",
        "Biological", "History related", "Mining related",
        "Food related", "Transportation related",
        "Creative content", "Environmental", "Fashion",
        "Agriculture Related", "Geography related","Computer graphics",
        "Jewellery product", "Photography related",
        "Teaching related", "Machinery related", "Movie related",
        "Music related", "Optics related", "Dental related",
        "Aviation related", "Detective related", "Physicist project",
        "Sculpting related", "Script writing", "Ocean/sea related",
        "Theatre related", "Stock market related", "Veterinary related",
        "Carpentry related", "Waste management related", "Astrological", "Astronomical",
        
    ].sort()
}

// 'Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS')

var corsHeaders = {
    origin: ["http://localhost:3000","http://testing-my-web.s3-website.ap-south-1.amazonaws.com"],
    // headers: ["Access-Control-Allow-Origin","Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type"],
    credentials: true
}

let businessTypes = {
    method: "GET",
    path: "/api/appData/businesstypes",
    
    config: {
        tags: ['api'],        
        cors: corsHeaders
    },
    handler: async (request, h) => {

        let dataRecieved
        await NewProjectType.findOneAndUpdate(
            {
                name: "allBusinessTypes"
            }
        )
        .then((result) => {
            dataRecieved = result
        })
        .catch((err) => {
            return h.response(err)
        })

        return dataRecieved.businessTypes

        // return appData.businessTypes
    }
}

let addBusinessType = {
    method: "PUT",
    path: "/api/appData/businesstypes",
    config: {
        cors: corsHeaders,
        validate: {
            payload: Joi.object({
                businessType: Joi.string()
            })
        }
    },
    handler: async (request, h) => {

        let dataRecieved

        // VERY IMP NOTE :
        // The record with array called businessTypes already
        // exists on mongo with the business types in it.
        // In the next line, we are just pushing the new values
        // to the ALREADY existing array
        await NewProjectType.findOneAndUpdate(
            {
                name: "allBusinessTypes"
            },
            {
                $push: {'businessTypes': request.payload.businessType}
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

        return dataRecieved
    }
}


let AppDataRoute = [
    businessTypes,
    addBusinessType,
]

module.exports = AppDataRoute
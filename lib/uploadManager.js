'use strict'

const fs = require('fs')
const Path = require('path')
const AWS = require('aws-sdk')

const CONFIG = require('../config')


const s3BucketCredentials =  CONFIG.awsS3Config.s3BucketCredentials

let uploadImageToS3Bucket = function(theFile, fileStorageDestination) {

    const accessKeyId = CONFIG.awsS3Config.s3BucketCredentials.accessKeyId
    const secretAccessKeyId = CONFIG.awsS3Config.s3BucketCredentials.secretAccessKey

    const mimeType = theFile.hapi.headers["content-type"]
    
    let imageNumbers = theFile.hapi.filename.split('imageNoSeparatorX')
    const uploadName = imageNumbers[0]
    const imageNo = imageNumbers[1]

    return new Promise(function(resolve, reject){
        fs.readFile(fileStorageDestination, function(error, bufferData){
            if(error) {
                console.error('Error in reading file', error, bufferData)
                let errResp = {
                    response: {
                        message: "Your file was uploaded, but our server couldn't read it :(",
                        data: {}
                    },
                    statusCode: 500
                }

                reject(errResp) 
            }

            AWS.config.update({
                accessKeyId:accessKeyId,
                secretAccessKey: secretAccessKeyId
            })

            

            let s3Bucket = new AWS.S3()
            let params = {
                Bucket: s3BucketCredentials.bucket,
                Key: uploadName,
                Body: bufferData,
                ACL: 'public-read',
                ContentType: mimeType
            }

            s3Bucket.putObject(params, function (err, data) {
                
                if (err) {
                    console.error("PUT", err, data)
                    let error = {
                        response: {
                            message: "Error in uploading to our main server",
                            data: {}
                        },
                        statusCode: 500
                    };
                    reject(error)
                }
                else {
                    fs.unlink( fileStorageDestination, function (err) {
                        if (err){
                            console.error(err)
                            reject(err)
                        }
                        else
                            resolve({
                                successfullyUploaded: true,
                                imageURL: CONFIG.awsS3Config.s3BucketCredentials.s3URL + '/' + uploadName,
                                imageNo: imageNo
                            })
                    })
                    // resolve({
                    //     successfullyUploaded: true,
                    //     imageURL: CONFIG.awsS3Config.s3BucketCredentials.s3URL + '/' + uploadName,
                    //     imageNo: imageNo
                    // })
                    //
                }
            })
            .on('httpUploadProgress', function (progress) {
                console.log(progress.loaded + " of " + progress.total + " bytes loaded");
            })
        })
    })
}

module.exports = {
    uploadImageToS3Bucket: uploadImageToS3Bucket
}
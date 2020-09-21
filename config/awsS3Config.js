'use strict'

const s3BucketCredentials = {
    "bucket": "images-cont",
    "accessKeyId": "",
    "secretAccessKey": "",
    "s3URL": "https://s3-us-west-1.amazonaws.com/images-cont",
    // "folder": {
    //     "profilePicture": "profilePicture",
    //     "thumb": "thumb",
    //     "customer":"customer",
    //     "category":"category",
    //     "jobimages":"jobimages"
    // },
    // "agentDefaultPicUrl": "http://instamow.s3.amazonaws.com/agent/profilePicture/default.png",
    // "fbUrl": "https://graph.facebook.com/"
}

module.exports = {
    s3BucketCredentials: s3BucketCredentials
}
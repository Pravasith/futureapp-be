'use strict'

const shortPixelCredentials = (urlArr) => {
    return {
        "key": "",
        "plugin_version": "JS123",
        "lossy": 1,
        "resize": 0,
        "cmyk2rgb": 1,
        "refresh": 0,
        "urllist": [...urlArr]
    }
}


module.exports = {
    shortPixelCredentials: shortPixelCredentials
}
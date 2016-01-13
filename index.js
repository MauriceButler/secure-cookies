var Cryptr = require('cryptr'),
    getCookie = require('./getCookie'),
    setCookie = require('./setCookie');

function createSecureCookies(options){
    var cryptr;

    if(!options){
        options = {};
    }

    if(options.encryptionKey){
        cryptr = new Cryptr(options.encryptionKey);
    }

    return {
        getCookie: getCookie.bind(null, options, cryptr),
        setCookie: setCookie.bind(null, options, cryptr)
    };
}

module.exports = createSecureCookies;
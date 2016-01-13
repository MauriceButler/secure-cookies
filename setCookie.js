var Cookies = require('cookies');

function setCookie(baseOptions, cryptr, request, response, cookieName, data, options){
    var cookies = new Cookies(request, response, baseOptions.keygripKeys),
        cookieData = data ? JSON.stringify(data) : undefined;

    if(cryptr && cookieData){
        cookieData = cryptr.encrypt(cookieData);
    }

    if(!options){
        options = {};
    }

    options.signed = !!baseOptions.keygripKeys;
    options.secureProxy = !!baseOptions.behindSSLProxy;

    cookies.set(cookieName, cookieData, options);
}

module.exports = setCookie;
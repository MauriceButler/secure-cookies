var Cookies = require('cookies');

function getCookie(baseOptions, cryptr, request, response, cookieName){
    var cookies = new Cookies(request, response, baseOptions.keygripKeys),
        cookie = cookies.get(cookieName, { signed: !!baseOptions.keygripKeys }),
        result;

    if(cookie){
        result = JSON.parse(cryptr ? cryptr.decrypt(cookie) : cookie);
    }

    return result;
}

module.exports = getCookie;
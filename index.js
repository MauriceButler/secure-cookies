var Cookies = require('cookies'),
    Keygrip = require('keygrip'),
    Cryptr = require('cryptr');

function createSecureCookies(options){
    var keygripKeys,
        cryptr;

    if(!options){
        options = {};
    }

    if(options.keygripKeys){
        keygripKeys = new Keygrip(options.keygripKeys);
    }

    if(options.encryptionKey){
        cryptr = new Cryptr(options.encryptionKey);
    }

    function getCookie(request, response, cookieName){
        var cookies = new Cookies(request, response, keygripKeys),
            cookie = cookies.get(cookieName, { signed: !!keygripKeys }),
            result;

        if(cookie){
            result = JSON.parse(cryptr ? cryptr.decrypt(cookie) : cookie);
        }

        return result;
    }


    function setCookie(request, response, cookieName, data){
        var cookies = new Cookies(request, response, keygripKeys),
            cookieData = data ? JSON.stringify(data) : undefined;

        if(cryptr && cookieData){
            cookieData = cryptr.encrypt(cookieData);
        }

        cookies.set(cookieName,
            cookieData,
            {
                signed: !!keygripKeys,
                secureProxy: !!options.behindSSLProxy
            }
        );
    }

    return {
        getCookie: getCookie,
        setCookie: setCookie
    };
}

module.exports = createSecureCookies;
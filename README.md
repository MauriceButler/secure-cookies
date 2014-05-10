# secure-cookies

Secure Cookies implementation for Node

Optionally uses `KeyGrip` to sign the cookie to prevent tampering and `Cryptr` to encode the cookie value in a reversible manner.

# Install

    npm install secure-cookies

# Usage

    var secureCookies = require('secure-cookies')({
            keygripKeys
            encryptionKey
            behindSSLProxy
        });

    // Get Cookie
    var cookie = secureCookies.getCookie(request, response, 'cookieName');

    // Set Cookie
    secureCookies.setCookie(request, response, 'cookieName', data);

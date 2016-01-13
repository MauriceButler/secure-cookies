var test = require('tape'),
    proxyquire = require('proxyquire'),
    pathToObjectUnderTest = '../getCookie',
    testBaseOptions = {
        keygripKeys: [1234]
    },
    testRequest = {},
    testResponse = {},
    testCookieName = 'testcookie',
    expectedResult = {foo: 'bar'};

test('getCookie Exists', function (t) {
    t.plan(1);
    var getCookie = require(pathToObjectUnderTest);
    t.equal(typeof getCookie, 'function',  'getCookie is an function');
});

test('getCookie sets up cookie jar correctly and returns cookie', function (t) {
    t.plan(6);
    var mocks = {
            'cookies': function(request, response, keygripKeys){
                t.equal(request, testRequest, 'correct request');
                t.equal(response, testResponse, 'correct response');
                t.equal(keygripKeys, testBaseOptions.keygripKeys, 'correct keygripKeys');

                return {
                    get: function(cookieName, options){
                        t.equal(cookieName, testCookieName, 'correct cookieName');
                        t.equal(options.signed, true, 'correct options.signed');

                        return JSON.stringify(expectedResult);
                    }
                };
            }
        },
        getCookie = proxyquire(pathToObjectUnderTest, mocks);

    var cookie = getCookie(testBaseOptions, null, testRequest, testResponse, testCookieName);

    t.deepEqual(cookie, expectedResult, 'correct result');
});

test('getCookie decrypts cookie', function (t) {
    t.plan(1);
    var mocks = {
            'cookies': function(){
                return {
                    get: function(){
                        return expectedResult;
                    }
                };
            }
        },
        getCookie = proxyquire(pathToObjectUnderTest, mocks),
        testCrypter = {
            decrypt: function(data){
                t.equal(data, expectedResult, 'correct data');
                return JSON.stringify(expectedResult);
            }
        };

    getCookie(testBaseOptions, testCrypter, testRequest, testResponse, testCookieName);
});
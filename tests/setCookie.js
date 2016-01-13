var test = require('tape'),
    proxyquire = require('proxyquire'),
    pathToObjectUnderTest = '../setCookie',
    testBaseOptions = {
        keygripKeys: [1234],
        behindSSLProxy: true
    },
    testRequest = {},
    testResponse = {},
    testCookieName = 'testcookie',
    testData = {foo: 'bar'},
    testOptions = {things: 'stuff'};

test('setCookie Exists', function (t) {
    t.plan(1);
    var setCookie = require(pathToObjectUnderTest);
    t.equal(typeof setCookie, 'function',  'setCookie is an function');
});

test('setCookie sets up cookie jar correctly and sets cookie', function (t) {
    t.plan(8);
    var mocks = {
            'cookies': function(request, response, keygripKeys){
                t.equal(request, testRequest, 'correct request');
                t.equal(response, testResponse, 'correct response');
                t.equal(keygripKeys, testBaseOptions.keygripKeys, 'correct keygripKeys');

                return {
                    set: function(cookieName, data, options){
                        t.equal(cookieName, testCookieName, 'correct cookieName');
                        t.equal(data, JSON.stringify(testData), 'correct data');
                        t.equal(options.signed, true, 'correct options.signed');
                        t.equal(options.secureProxy, true, 'correct options.secureProxy');
                        t.equal(options.things, 'stuff', 'additional options passed');
                    }
                };
            }
        },
        setCookie = proxyquire(pathToObjectUnderTest, mocks);

    setCookie(testBaseOptions, null, testRequest, testResponse, testCookieName, testData, testOptions);
});

test('setCookie encrypts data', function (t) {
    t.plan(2);
    var mocks = {
            'cookies': function(){
                return {
                    set: function(cookieName, data){
                        t.equal(data, JSON.stringify(testData) + 'encrypted', 'data is encrypted');
                    }
                };
            }
        },
        setCookie = proxyquire(pathToObjectUnderTest, mocks),
        testCrypter = {
            encrypt: function(data){
                t.equal(data, JSON.stringify(testData), 'correct data');
                return data + 'encrypted';
            }
        };

    setCookie(testBaseOptions, testCrypter, testRequest, testResponse, testCookieName, testData, testOptions);
});
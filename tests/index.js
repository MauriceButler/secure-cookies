var test = require('grape'),
    mockery = require('mockery'),
    pathToObjectUnderTest = '../';

mockery.registerAllowables([pathToObjectUnderTest]);

function resetMocks(){
    mockery.registerMock('cookies', function(){});
    mockery.registerMock('keygrip', function(){});
    mockery.registerMock('cryptr', function(){});
}

function getCleanTestObject(){
    delete require.cache[require.resolve(pathToObjectUnderTest)];
    mockery.enable({ useCleanCache: true, warnOnReplace: false });
    var objectUnderTest = require(pathToObjectUnderTest);
    mockery.disable();
    resetMocks();
    return objectUnderTest;
}

resetMocks();

test('secureCookies Exists', function (t) {
    t.plan(2);
    var secureCookies = getCleanTestObject();
    t.ok(secureCookies, 'secureCookies Exists');
    t.equal(typeof secureCookies, 'function',  'secureCookies is an function');
});

test('secureCookies.getCookie Exists', function (t) {
    t.plan(2);
    var secureCookies = getCleanTestObject()();
    t.ok(secureCookies.getCookie, 'secureCookies.getCookie Exists');
    t.equal(typeof secureCookies.getCookie, 'function',  'secureCookies.getCookie is an function');
});

test('secureCookies.setCookie Exists', function (t) {
    t.plan(2);
    var secureCookies = getCleanTestObject()();
    t.ok(secureCookies.setCookie, 'secureCookies.setCookie Exists');
    t.equal(typeof secureCookies.setCookie, 'function',  'secureCookies.setCookie is an function');
});

test('getCookie constructs signed cookie if keygripKeys provided', function (t) {
    t.plan(6);
    var testRequest = {},
        testResponse = {},
        testKeys = ['foo'],
        testCookieName = 'bar';

    function TestKeygrip(keys){
        t.equal(keys, testKeys, 'correct keys');
    }

    mockery.registerMock('keygrip', TestKeygrip);

    mockery.registerMock('cookies', function(request, response, keygripKeys){
        t.equal(request, testRequest, 'correct request');
        t.equal(response, testResponse, 'correct response');
        t.ok(keygripKeys instanceof TestKeygrip, 'correct instance of keygrip');

        this.get = function(cookieName, options){
            t.equal(cookieName, testCookieName, 'correct cookieName');
            t.equal(options.signed, !!testKeys, 'correct signed value');
        };
    });


    var secureCookies = getCleanTestObject()({keygripKeys: testKeys});

    secureCookies.getCookie(testRequest, testResponse, testCookieName);
});

test('getCookie constructs unsigned cookie if no keygripKeys provided', function (t) {
    t.plan(5);
    var testRequest = {},
        testResponse = {},
        testKeys = null,
        testCookieName = 'bar';

    function TestKeygrip(keys){
        t.fail('should not construct Keygrip');
    }

    mockery.registerMock('keygrip', TestKeygrip);

    mockery.registerMock('cookies', function(request, response, keygripKeys){
        t.equal(request, testRequest, 'correct request');
        t.equal(response, testResponse, 'correct response');
        t.notOk(keygripKeys, 'correctly passed no keys');

        this.get = function(cookieName, options){
            t.equal(cookieName, testCookieName, 'correct cookieName');
            t.equal(options.signed, !!testKeys, 'correct signed value');
        };
    });


    var secureCookies = getCleanTestObject()({keygripKeys: testKeys});

    secureCookies.getCookie(testRequest, testResponse, testCookieName);
});

test('getCookie decrypts cookie if cryptr keys', function (t) {
    t.plan(4);
    var testRequest = {},
        testResponse = {},
        testCookie = {
            foo: 'bar'
        },
        testDecryptedCookieString = '{"foo":"meh"}',
        testCookieName = 'bar',
        testKey = 'foo';

    function TestCryptr(key){
        t.equal(key, testKey, 'correct key');

        this.decrypt = function(cookie){
            t.equal(cookie, testCookie, 'correct cookie');
            return testDecryptedCookieString;
        };
    }

    mockery.registerMock('cryptr', TestCryptr);

    mockery.registerMock('cookies', function(){
        this.get = function(cookieName, options){
            return testCookie;
        };
    });


    var secureCookies = getCleanTestObject()({encryptionKey: testKey}),
        result = secureCookies.getCookie(testRequest, testResponse, testCookieName);

    t.equal(typeof result, 'object', 'returned cookie object');
    t.equal(JSON.stringify(result), testDecryptedCookieString, 'returned decrytped cookie');
});

test('getCookie does not decrypt cookie if no cryptr keys', function (t) {
    t.plan(2);
    var testRequest = {},
        testResponse = {},
        testCookie = {
            foo: 'bar'
        },
        testCookieString = '{"foo":"meh"}',
        testCookieName = 'bar',
        testKey = null;

    function TestCryptr(key){
        t.fail('should not construct cryptr');
    }

    mockery.registerMock('cryptr', TestCryptr);

    mockery.registerMock('cookies', function(){
        this.get = function(cookieName, options){
            return testCookieString;
        };
    });


    var secureCookies = getCleanTestObject()({encryptionKey: testKey}),
        result = secureCookies.getCookie(testRequest, testResponse, testCookieName);

    t.equal(typeof result, 'object', 'returned cookie object');
    t.equal(JSON.stringify(result), testCookieString, 'returned cookie');
});

test('setCookie constructs signed and secure cookie if keygripKeys and sslProxy value provided', function (t) {
    t.plan(8);
    var testRequest = {},
        testResponse = {},
        testBehindSSLProxy = true,
        testData = {
            foo: 'bar'
        },
        testKeys = ['foo'],
        testCookieName = 'bar';

    function TestKeygrip(keys){
        t.equal(keys, testKeys, 'correct keys');
    }

    mockery.registerMock('keygrip', TestKeygrip);

    mockery.registerMock('cookies', function(request, response, keygripKeys){
        t.equal(request, testRequest, 'correct request');
        t.equal(response, testResponse, 'correct response');
        t.ok(keygripKeys instanceof TestKeygrip, 'correct instance of keygrip');

        this.set = function(cookieName, data, options){
            t.equal(cookieName, testCookieName, 'correct cookieName');
            t.equal(data, JSON.stringify(testData), 'correct data');
            t.equal(options.signed, !!testKeys, 'correct signed value');
            t.equal(options.secureProxy, testBehindSSLProxy, 'correct secureProxy value');
        };
    });


    var secureCookies = getCleanTestObject()({keygripKeys: testKeys, behindSSLProxy: testBehindSSLProxy});

    secureCookies.setCookie(testRequest, testResponse, testCookieName, testData);
});

test('setCookie constructs unsigned and insecure cookie if keygripKeys and sslProxy value not provided', function (t) {
    t.plan(7);
    var testRequest = {},
        testResponse = {},
        testBehindSSLProxy = false,
        testData = {
            foo: 'bar'
        },
        testKeys = null,
        testCookieName = 'bar';

    function TestKeygrip(keys){
        t.fail('should not construct keygrip');
    }

    mockery.registerMock('keygrip', TestKeygrip);

    mockery.registerMock('cookies', function(request, response, keygripKeys){
        t.equal(request, testRequest, 'correct request');
        t.equal(response, testResponse, 'correct response');
        t.notOk(keygripKeys, 'correctly not keygrip keys');

        this.set = function(cookieName, data, options){
            t.equal(cookieName, testCookieName, 'correct cookieName');
            t.equal(data, JSON.stringify(testData), 'correct data');
            t.equal(options.signed, !!testKeys, 'correct signed value');
            t.equal(options.secureProxy, testBehindSSLProxy, 'correct secureProxy value');
        };
    });


    var secureCookies = getCleanTestObject()();

    secureCookies.setCookie(testRequest, testResponse, testCookieName, testData);
});

test('setCookie encrypts data if encryption key provided', function (t) {
    t.plan(4);
    var testRequest = {},
        testResponse = {},
        testData = {
            foo: 'bar'
        },
        testEncryptedData = 'XXXYYYZZZ',
        testKey = 'foo',
        testCookieName = 'bar';

    function TestCryptr(key){
        t.equal(key, testKey, 'correct keys');
        this.encrypt = function(data){
            t.equal(data, JSON.stringify(testData), 'correct data for encryption');
            return testEncryptedData;
        };
    }

    mockery.registerMock('cryptr', TestCryptr);

    mockery.registerMock('cookies', function(request, response, keygripKeys){
        this.set = function(cookieName, data, options){
            t.equal(cookieName, testCookieName, 'correct cookieName');
            t.equal(data, testEncryptedData, 'correct data');
        };
    });

    var secureCookies = getCleanTestObject()({encryptionKey: testKey});

    secureCookies.setCookie(testRequest, testResponse, testCookieName, testData);
});

test('setCookie does not encrypt data if encryption key not provided', function (t) {
    t.plan(2);
    var testRequest = {},
        testResponse = {},
        testData = {
            foo: 'bar'
        },
        testCookieName = 'bar';

    function TestCryptr(key){
        t.fail('should not construct cryptr');
    }

    mockery.registerMock('cryptr', TestCryptr);

    mockery.registerMock('cookies', function(request, response, keygripKeys){
        this.set = function(cookieName, data, options){
            t.equal(cookieName, testCookieName, 'correct cookieName');
            t.equal(data, JSON.stringify(testData), 'correct data');
        };
    });

    var secureCookies = getCleanTestObject()();

    secureCookies.setCookie(testRequest, testResponse, testCookieName, testData);
});

test('setCookie handels no data', function (t) {
    t.plan(1);
    var testRequest = {},
        testResponse = {},
        testCookieName = 'bar';


    mockery.registerMock('cookies', function(request, response, keygripKeys){
        this.set = function(cookieName, data, options){
            t.notOk(data, 'correctly undefined data');
        };
    });

    var secureCookies = getCleanTestObject()();

    secureCookies.setCookie(testRequest, testResponse, testCookieName);
});
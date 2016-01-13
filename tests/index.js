var test = require('tape'),
    proxyquire = require('proxyquire'),
    pathToObjectUnderTest = '../';

test('secureCookies Exists', function (t) {
    t.plan(1);
    var secureCookies = require(pathToObjectUnderTest);
    t.equal(typeof secureCookies, 'function',  'secureCookies is an function');
});

test('secureCookies exposes getCookie and setCookie', function (t) {
    t.plan(2);
    var secureCookies = require(pathToObjectUnderTest)();
    t.equal(typeof secureCookies.getCookie, 'function',  'secureCookies.getCookie is an function');
    t.equal(typeof secureCookies.setCookie, 'function',  'secureCookies.setCookie is an function');
});

test('secureCookies creates cryptr if encrytionKey is passed', function (t) {
    t.plan(1);

    var testOptions = {encryptionKey: 123},
        mocks = {
            'cryptr': function(encryptionKey){
                t.equal(encryptionKey, testOptions.encryptionKey, 'got encryptionKey');
            }
        };

    proxyquire(pathToObjectUnderTest, mocks)(testOptions);
});

test('secureCookies creates cryptr if encrytionKey is passed', function (t) {
    t.plan(4);

    var testCryptr = {},
        testOptions = {encryptionKey: 123},
        mocks = {
            'cryptr': function(){
                return testCryptr;
            }
        };

    mocks['./getCookie'] = mocks['./setCookie'] = function(options, cryptr){
        t.equal(options, testOptions, 'options is bound');
        t.equal(cryptr, testCryptr, 'cryptr is bound');
    };

    var secureCookies = proxyquire(pathToObjectUnderTest, mocks)(testOptions);

    secureCookies.getCookie();
    secureCookies.setCookie();
});

require('./getCookie');
require('./setCookie');
/*global jasmine,browser*/
'use strict';

var debug = process.execArgv.filter(function (arg) {
        return arg.indexOf('--debug') === 0;
    }).length > 0;

exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: [
        'test/protractor/test_failsafe_race.js',
        'test/protractor/test_mmsapp_demo_flow.js'
    ],
    framework: 'jasmine2',
    jasmineNodeOpts: {
        defaultTimeoutInterval: 60000
    },
    onPrepare: function () {
        if (debug) {
            jasmine.getEnv().addReporter({
                specDone: function (result) {
                    if (result.status === 'failed') {
                        for (var i = 0; i < result.failedExpectations.length; i++) {
                            var failureMessage = result.failedExpectations[i].message;
                            console.log(result.description + ': ' + failureMessage);
                            //browser.pause();
                            //debugger;
                            //browser.debugger();
                        }
                        console.dir(result);

                        var screenshot = browser.takeScreenshot().then(function (png) {
                            return writeScreenShot(png, 'exception' + result.id + '.png');
                        });
                        var consoleLog = browser.manage().logs().get('browser').then(function(browserLog) {
                            var filename = 'exception' + result.id + 'console.log';
                            var stream = require('fs').createWriteStream(filename);
                            stream.write(require('util').inspect(browserLog));
                            stream.end();
                            return getWriteStreamPromise(stream);
                        });
                        protractor.promise.all([screenshot, consoleLog]).thenFinally(function () {
                            // process.exit(1);
                        });
                    }
                }
            });
        }

        return browser.driver.manage().window().getSize().then(function (size) {
            browser.driver.manage().window().setSize(Math.max(1024, size.width), Math.max(768, size.height));
        });

    },
    rootElement: 'body',
    baseUrl: 'http://localhost:8855'
};

function writeScreenShot(data, filename, callback) {
    var stream = require('fs').createWriteStream(filename);
    stream.write(new Buffer(data, 'base64'));
    stream.end();
    return getWriteStreamPromise(stream);
}

function getWriteStreamPromise(stream) {
    var deferred = protractor.promise.defer();
    stream.on('finish', function () {
        deferred.fulfill();
    });
    stream.on('error', function () {
        deferred.reject();
    });
    return deferred.promise;
}

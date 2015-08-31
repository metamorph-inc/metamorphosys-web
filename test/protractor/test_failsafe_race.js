/*global describe,it,browser,expect,by,before,element*/
'use strict';
describe('perfTest', function () {
    it('should not fork', function () {
        var iterations = 3;
        browser.get('/extlib/src/app/perfTest/#/test?iterations=' + iterations);

        expect(browser.getTitle()).toEqual('perfTest');

        var promise = browser.waitForAngular();
        for (var i = 40; i <= 40 * iterations; i += 40) {
            promise = promise.then(
                (function (i) {
                return function () {
                    return browser.wait(function () {
                        return element(by.id('result')).isPresent() || element(by.id('progress_' + i)).isPresent();
                    }, 30000);
                };
            })(i));
        }
        browser.wait(function () {
            return element(by.id('result')).isPresent();
        }, 15000);
        element(by.id('result')).getText().then(function (text) {
            expect(text).toEqual('SUCCESS');
        });

    }, 1000 * 60 * 2);
});

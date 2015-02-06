describe('perfTest', function() {
  it('should not fork', function() {
    var iterations = 3;
    browser.get('/extlib/src/app/perfTest/#/test?iterations=' + iterations);

    expect(browser.getTitle()).toEqual('perfTest');

    for (var i = 40; i <= 40 * iterations; i += 40) {
        (function (i) {
            browser.wait(function(){
                return element(by.id('progress_'+i)).isPresent();
            });
        })(i);
    }
    browser.wait(function(){
        return element(by.id('result')).isPresent();
    });
    element(by.id('result')).getText().then(function(text) {
        expect(text).toEqual('SUCCESS');
    });

  }, 1000 * 60 * 2);
});

describe('perfTest', function() {
  it('should not fork', function() {
    browser.get('http://localhost:8855/extlib/src/app/perfTest/');

    expect(browser.getTitle()).toEqual('perfTest');

    browser.sleep(4000)

    for (var i = 40; i <= 800; i += 40) {
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

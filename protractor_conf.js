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
  onPrepare: function() {
    return browser.driver.manage().window().getSize().then(function (size) {
      browser.driver.manage().window().setSize(Math.max(1024, size.width), Math.max(768, size.height));
    });
  },
  rootElement: 'body',
  baseUrl: 'http://localhost:8855'
};

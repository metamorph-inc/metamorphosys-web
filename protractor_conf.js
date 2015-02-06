exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [
    'test/protractor/test_failsafe_race.js',
    'test/protractor/test_mmsapp_demo_flow.js'
  ],
  framework: 'jasmine2',
  baseUrl: 'http://localhost:8855'
};

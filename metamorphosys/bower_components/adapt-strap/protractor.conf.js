exports.config = {

  chromeDriver: null,

  chromeOnly: false,

  seleniumArgs: [],

  allScriptsTimeout: 11000,

  specs: [
    'src/**/test/*.e2e.js',
  ],

  exclude: [],

  capabilities: {
    'browserName': 'firefox'
  },

  rootElement: 'body',

  onPrepare: function() {
    require('jasmine-spec-reporter');
    // add jasmine spec reporter
    jasmine.getEnv().addReporter(new jasmine.SpecReporter({displayStacktrace: true}));
  },

  framework: 'jasmine',

  mochaOpts: {
    ui: 'bdd',
    reporter: 'spec'
  },

  onCleanUp: function() {},

  jasmineNodeOpts: {
    silent: true
  }
};

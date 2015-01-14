// Karma configuration
// Generated on Thu Mar 06 2014 13:17:21 GMT-0500 (Eastern Standard Time)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/showdown/src/showdown.js',
      'bower_components/bootstrap/dist/js/bootstrap.min.js',
      'dist_temp/adapt-strap.js',
      'dist_temp/adapt-strap.tpl.js',
      'docs/app.js',
      'docs/*.js',
      'docs/**/*.js',
      'src/**/docs/*.js',
      'src/**/test/*.js'
    ],


    // list of files to exclude
    exclude: [
      '**/gulpfile.js',
      'src/**/*.e2e.js'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'coverage'],
    preprocessors: {
      'src/**/!(*.test).js': 'coverage',
      '!sec/**/test/*.js': 'coverage',
      '!src/**/(*.e2e).js': 'coverage'
    },

    junitReporter: {
      outputFile: 'coverage/test-results.xml',
      suite: ''
    },

    coverageReporter: {
      reporters:[
        {type: 'lcov', dir:'coverage/'},
        {type: 'text-summary', dir:'coverage/'}
      ]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 10000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};

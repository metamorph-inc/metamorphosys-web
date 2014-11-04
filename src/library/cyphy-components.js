/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
 * @author pmeijer / https://github.com/pmeijer
 */
// External dependencies
require('../../bower_components/ng-file-upload/angular-file-upload-shim');
require('../../bower_components/ng-file-upload/angular-file-upload');
//require('../../bower_components/angular-animate/angular-animate.min');
require('../../bower_components/angular-growl/build/angular-growl.min');

// Internal dependencies
require('./services/cyphy-services');

angular.module('cyphy.components', [
    'cyphy.services',
    'cyphy.components.templates',
    'angularFileUpload',
//    'ngAnimate',
    'angular-growl'
]).config(['growlProvider', function (growlProvider) {
    growlProvider.globalTimeToLive({success: 5000, error: -1, warning: 20000, info: 5000});
}]);

require('./SimpleModal/SimpleModal');
require('./WorkspaceList/WorkspaceList');

require('./ComponentDetails/ComponentDetails');
require('./ComponentList/ComponentList');

require('./DesignDetails/DesignDetails');
require('./DesignList/DesignList');
require('./DesignTree/DesignTree');

require('./TestBenchDetails/TestBenchDetails');
require('./TestBenchList/TestBenchList');


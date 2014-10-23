/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
 */
// External dependencies
require('../../bower_components/ng-file-upload/angular-file-upload-shim');
require('../../bower_components/ng-file-upload/angular-file-upload');
require('../../bower_components/angular-animate/angular-animate.min');
require('../../bower_components/angular-growl/build/angular-growl.min');

// Internal dependencies
require('./services/cyphy-services');

angular.module('cyphy.components', [
    'cyphy.services',
    'cyphy.components.templates',
    'angularFileUpload',
    'ngAnimate',
    'angular-growl']);

require('./WorkspaceList/WorkspaceList');
require('./ComponentDetails/ComponentDetails');
require('./ComponentList/ComponentList');
require('./DesignList/DesignList');
require('./DesignTree/DesignTree');
require('./TestBenchList/TestBenchList');


"use strict";

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 * @author nabana / https://github.com/nabana
 * @author lattmann / https://github.com/lattmann
 */

var DEBUG = false,
    _jqueryVersion = '2.1.0',
    _jqueryUIVersion = '1.10.4',
    _bootsrapVersion = '3.1.1';

var WebGMEGlobal = { 'version': 'x',    //will be set from Node's package.json
    'SUPPORTS_TOUCH': 'ontouchstart' in window || navigator.msMaxTouchPoints }; //touch device detection}

// configure require path and modules
require.config({
    baseUrl: "/",

    map: {
        '*': {
            'css': 'lib/require/require-css/css',
            'text': 'lib/require/require-text/text'
        }
    },

    paths: {

        "domReady": 'lib/require/require-domready/domReady',

        //jQuery and stuff
        "jquery": 'lib/jquery/jquery-' + _jqueryVersion + ( DEBUG ? '.min' : '' ),
        "jquery-ui": 'lib/jquery/jquery-ui-' + _jqueryUIVersion + ( DEBUG ? '.min' : '' ),
        "jquery-ui-iPad": 'lib/jquery/jquery.ui.ipad',
        "jquery-WebGME": 'js/jquery.WebGME',
        "jquery-dataTables": 'lib/jquery/jquery.dataTables.min',
        "jquery-dataTables-bootstrapped": 'lib/jquery/jquery.dataTables.bootstrapped',
        "jquery-spectrum": 'lib/jquery/jquery.spectrum',

        //Bootsrap stuff
        "bootstrap": 'lib/bootstrap/' + _bootsrapVersion + '/js/bootstrap' + ( DEBUG ? '.min' : '' ),

        //Other modules
        "underscore": 'lib/underscore/underscore-min',
        "backbone": 'lib/backbone/backbone.min',
        "d3": 'lib/d3/d3.v3.min',
        "jscolor": 'lib/jscolor/jscolor',

        //RaphaelJS family
        "eve": 'lib/raphael/eve',   //needed because of raphael.core.js uses require with 'eve'
        "raphaeljs": 'lib/raphael/raphael.amd',
        "raphael_core": 'lib/raphael/raphael.core',
        "raphael_svg": 'lib/raphael/raphael.svg_fixed',
        "raphael_vml": 'lib/raphael/raphael.vml',

        //WebGME custom modules
        "logManager": 'common/LogManager',
        "eventDispatcher": 'common/EventDispatcher',
        "notificationManager": 'js/NotificationManager',
        "clientUtil": 'js/util',
        "loaderCircles": "js/Loader/LoaderCircles",
        "loaderProgressBar": "js/Loader/LoaderProgressBar",

        "codemirror": 'lib/codemirror/codemirror.amd',
        "jquery-csszoom": 'lib/jquery/jquery.csszoom',

        "jszip": 'lib/jszip/jszip',

        "moment": 'lib/moment/moment.min'
    },
    shim: {
        'jquery-ui': ['jquery'],
        'jquery-ui-iPad': ['jquery','jquery-ui'],

        'bootstrap': [
            'jquery',
                'css!lib/bootstrap/' + _bootsrapVersion + '/css/bootstrap.min.css',
                'css!lib/bootstrap/' + _bootsrapVersion + '/css/bootstrap-theme.min.css'
        ],

        'backbone': ['underscore'],
        'clientUtil': ['jquery'],
        'jquery-WebGME': ['bootstrap'],
        'jquery-dataTables': ['jquery'],
        'jquery-dataTables-bootstrapped': ['jquery-dataTables'],
        'js/WebGME': [
            'jquery-WebGME',
            'css!/css/main.css',
            'css!/css/themes/dawn.css',
            //'css!/fonts/font-awesome/css/font-awesome.min.css',
            'css!/fonts/webgme-icons/style.css'
        ],
        'jquery-csszoom': ['jquery-ui'],
        'jquery-spectrum': ['jquery'],
        'raphael_svg': ['raphael_core'],
        'raphael_vml': ['raphael_core'],

         // Extra shims for angular
        'angular': ['moment', 'angular-file-upload-shim'],
        'angular-route': ['angular'],
        'angular-route-styles': ['angular'],
        'ui-bootstrap': ['angular'],
        'angular-moment-js': ['angular'],
        'angular-file-upload': ['angular'],
        'angular-animate': ['angular'],
        'angular-growl': ['angular', 'angular-animate']
    }
});


require(
    [
        'domReady',
        'jquery',
        'jquery-ui',
        'jquery-ui-iPad',
        'jquery-WebGME',
        'jquery-dataTables-bootstrapped',
        'bootstrap',
        'underscore',
        'backbone',
        'clientUtil',
        'bin/getconfig'
    ],
    function (domReady, jQuery, jQueryUi, jQueryUiiPad, jqueryWebGME, jqueryDataTables, bootstrap, underscore, backbone, util, CONFIG) {
        domReady(function () {

            if (CONFIG.hasOwnProperty('debug')) {
                DEBUG = CONFIG.debug;
            }

            var d = util.getURLParameterByName('debug').toLowerCase();
            if (d === 'true') {
                DEBUG = true;
            }

            if (CONFIG.paths) {

                // attach external libraries to extlib/*

                var keys = Object.keys(CONFIG.paths);
                for (var i = 0; i < keys.length; i += 1) {

                    // assume this is a relative path from the current working directory
                    CONFIG.paths[keys[i]] = 'extlib/' + CONFIG.paths[keys[i]];
                }

                // update client config to route the external lib requests

                require.config({
                    paths: CONFIG.paths
                });

            }


            // Extended disable function
            jQuery.fn.extend({
                disable: function(state) {
                    return this.each(function() {
                        var $this = $(this);
                        if($this.is('input, button')) {
                            this.disabled = state;
                        } else {
                            $this.toggleClass('disabled', state);
                        }
                    });
                }
            });

            require.config({
                paths: {
                    'angular': CONFIG.paths['CyPhyApp'] + '/lib/angular',
                    'angular-animate': CONFIG.paths['CyPhyApp'] + '/lib/angular-animate.min',
                    'angular-route': CONFIG.paths['CyPhyApp'] + '/lib/angular-route.min',
                    'angular-route-styles': CONFIG.paths['CyPhyApp'] + '/lib/route-styles',
                    'ui-bootstrap': CONFIG.paths['CyPhyApp'] + '/lib/ui-bootstrap-tpls-0.11.0.min',
                    'moment': CONFIG.paths['CyPhyApp'] + '/lib/moment.min',
                    'angular-moment-js': CONFIG.paths['CyPhyApp'] + '/lib/angular-momentjs',
                    'angular-file-upload-shim': CONFIG.paths['CyPhyApp'] + '/lib/angular-file-upload-shim.min',
                    'angular-file-upload': CONFIG.paths['CyPhyApp'] + '/lib/angular-file-upload',
                    'angular-growl': CONFIG.paths['CyPhyApp'] + '/lib/angular-growl.min'
                }
            });

            // extlib paths are set now we can require our client
            require(['angular',
                    'angular-route',
                    'angular-route-styles',
                    'ui-bootstrap',
                    'moment',
                    'angular-moment-js',
                    'text!CyPhyMETA/ADMEditor_metaOnly.json',
                    'CyPhyApp/js/SmartClient',
                    'angular-file-upload-shim',
                    'angular-file-upload',
                    'angular-growl',
                    'css!CyPhyApp/lib/font-awesome/css/font-awesome.min.css',
                    'css!CyPhyApp/lib/angular-growl.min.css'],
                function(ng, ngRoute, ngRouteStyles, uiBootstrap, moments, angularMoment, ADMMETAMODEL, SmartClient) {
                    // download angular and all plugins
                    // create app

                    var WebGMEApp = angular.module('WebGMEApp', ['ngRoute', 'routeStyles', 'angular-moment', 'ui.bootstrap', 'angularFileUpload', 'angular-growl', 'ngAnimate']);
                    WebGMEGlobal.WebGMEApp = WebGMEApp;

                    var smartClient = new SmartClient(CONFIG);

                    smartClient.openProject('ADMEditor', 'master', ADMMETAMODEL, function(err) {
                        if (err) {
                            console.error(err);
                            return;
                        }

                        WebGMEApp.value('smartClient', smartClient);
                        WebGMEApp.value('Chance', null);

                        require([
                            'CyPhyApp/app/workspace/WorkspaceController',
                            'CyPhyApp/app/WorkspaceDetails/WorkspaceDetailsController',
                            'CyPhyApp/app/DesignSpace/DesignSpaceController'], function (WorkspaceController, WorkspaceDetailsController, DesignSpaceController) {
                            // configure app

                            WebGMEApp.filter('orderObjectBy', function() {
                                return function(items, field, reverse) {
                                    var filtered = [];
                                    angular.forEach(items, function(item) {
                                        filtered.push(item);
                                    });
                                    filtered.sort(function (a, b) {
                                        return (a[field] > b[field] ? 1 : -1);
                                    });
                                    if (reverse) {
                                        filtered.reverse();
                                    }
                                    return filtered;
                                };
                            });

                            WebGMEApp.controller('WorkspaceController', WorkspaceController);
                            WebGMEApp.controller('WorkspaceDetailsController', WorkspaceDetailsController);
                            WebGMEApp.controller('DesignSpaceController', DesignSpaceController);

                            WebGMEApp.config(['$routeProvider',
                                function ($routeProvider) {
                                    $routeProvider.
                                        when('/workspace', {
                                            templateUrl: 'app/workspace/views/WorkspaceView.html',
                                            css: 'app/workspace/styles/Workspace.css',
                                            controller: 'WorkspaceController'
                                        }).
                                        when('/workspaceDetails/:id*', {
                                            templateUrl: 'app/WorkspaceDetails/views/WorkspaceDetailsView.html',
                                            css: 'app/WorkspaceDetails/styles/WorkspaceDetails.css',
                                            controller: 'WorkspaceDetailsController'
                                        }).
                                        when('/designSpace/:id*', {
                                            templateUrl: 'app/DesignSpace/views/DesignSpaceView.html',
                                            css: 'app/DesignSpace/styles/DesignSpace.css',
                                            controller: 'DesignSpaceController'
                                        }).
                                        otherwise({
                                            redirectTo: '/workspace'
                                        });
                                }]);

                            // Add app to the document
                            angular.bootstrap(document, ['WebGMEApp']);
                        });

                    });
                },
                function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
        });
    }
);

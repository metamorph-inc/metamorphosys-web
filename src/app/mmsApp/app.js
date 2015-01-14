/*globals angular, ga*/

'use strict';

require('./libraryIncludes.js');

require('ngDragDrop');



require('./utils.js');

require('./services/projectHandling/projectHandling.js');
require('./services/connectionHandling/connectionHandling.js');

require('./services/operationsManager/operationsManager.js');

require('./services/diagramService/diagramService.js');
require('./services/gridService/gridService.js');
require('./services/wiringService/wiringService.js');

require('./directives/headerButtons/headerButtons.js');
require('./directives/socialMediaButtons/socialMediaButtons.js');

require('./directives/diagramContainer/diagramContainer.js');
require('./directives/fabricCanvas/fabricCanvas.js');
require('./directives/svgDiagram/svgDiagram.js');

require('./directives/symbols/componentSymbol.js');

require('./directives/resizing/resizeToHeight.js');
require('./directives/resizing/resizeToWindow.js');

require('./directives/busyCover/busyCover.js');

require('./directives/designEditor/designEditor');

var CyPhyApp = angular.module('CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.mmsApp.templates',

    'ui.bootstrap',

    'mms.connectionHandling',
    'mms.projectHandling',
    'mms.headerButtons',
    'mms.socialMediaButtons',

    'mms.designVisualization.operationsManager',
    'mms.designVisualization.wiringService',
    'mms.designVisualization.diagramService',

    'mms.designVisualization.diagramContainer',
    'mms.designVisualization.fabricCanvas',
    'mms.designVisualization.svgDiagram',
    'mms.designVisualization.symbols',
    'mms.resizeToWindow',
    'mms.designVisualization.busyCover',
    'mms.designVisualization.designEditor',
    'angucomplete-alt',
    'ngTouch',
    'ngMaterial',
    'ang-drag-drop',
    'ngCookies'
]);

CyPhyApp.config(function ($stateProvider, $urlRouterProvider) {

    var GMEProjectInitializers,
        gmeProjectInitializers;

    window.gapi = undefined;

    GMEProjectInitializers = require('./classes/GMEProjectInitializers');
    gmeProjectInitializers = new GMEProjectInitializers();

    $urlRouterProvider.otherwise('/404');

    $stateProvider

        .state('editor', {
            templateUrl: '/mmsApp/templates/editor.html',
            url: '/editor',
            abstract: true
        })
        .state('editor.branch', {
            url: '/:projectId/:branchId',
            resolve: {
                selectProjectBranchWorkspaceAndDesign: gmeProjectInitializers.selectProjectBranchWorkspaceAndDesign
            },
            controller: 'EditorViewController'
        })
        .state('createDesign', {
            url: '/createDesign/:projectId',
            resolve: {
                selectProject: gmeProjectInitializers.selectProject
            },
            controller: 'CreateDesignController'
        })
        .state('404', {
            url: '/404',
            templateUrl: '/mmsApp/templates/404.html',
            views: {
              'onCover': {
                  templateUrl: '/mmsApp/templates/404.html',
                  controller: 'NotFoundController'
              }
            }
        });
});



CyPhyApp.controller('MainNavigatorController', function ($rootScope, $scope, $window, $mdDialog) {

    var defaultNavigatorItems;

    defaultNavigatorItems = [
        {
            id: 'root',
            label: '',
            itemClass: 'cyphy-root',
            action: function(item, ev) {

                function DialogController($scope, $mdDialog) {
                    $scope.hide = function() {
                        $mdDialog.hide();
                    };
                    $scope.close = function() {
                        $mdDialog.cancel();
                    };
                }

                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: '/mmsApp/templates/aboutDialog.html',
                    targetEvent: ev
                })
                    .then(function() {});

            }
        }
    ];

    $scope.navigator = {
        separator: true,
        items: angular.copy(defaultNavigatorItems, [])
    };

    $rootScope.$watch('activeDesign', function (activeDesign) {

        if (activeDesign && activeDesign.id) {


            $scope.navigator.items = angular.copy(defaultNavigatorItems, []);

            $scope.navigator.items.push({
                id: 'design',
                label: activeDesign.name
                //action: function () {
                //    $window.open('/?project=' + projectId);
                //}
            });

        } else {
            $scope.navigator.items = angular.copy(defaultNavigatorItems, []);
        }

    });

});

CyPhyApp.controller('AppController', function ($rootScope, $cookies) {

    $rootScope.busy = true;

    ga('create', 'UA-58522767-1', {
        'userId': $cookies.webgmeSid
    });

    // ga('send', 'pageview'); disable this if you use angulartics


    //window.dragStart = function(evt) {
    //    console.log('--------------' + evt);
    //    evt.dataTransfer.effectAllowed = 'copy';
    //    evt.dataTransfer.dropEffect = 'copy';
    //};

});

CyPhyApp.controller('EditorViewController', function () {
});

CyPhyApp.controller('NotFoundController', function ($rootScope) {

    $rootScope.stopBusy();

});

CyPhyApp.controller('CreateDesignController', function (
    $rootScope, $scope, $stateParams, $http, $log, $state, growl, projectHandling, workspaceService) {

    $scope.projectId = $stateParams.projectId;
    $scope.errored = false;
    $rootScope.processing = true;

    if ($rootScope.wsContext) {

        $log.debug('Cleaning up workspace regions');
        workspaceService.cleanUpAllRegions($rootScope.wsContext);

    }

    $rootScope.$emit('$destroy');

    $log.debug('New branch creation');

        projectHandling.cloneMaster()
            .then(function (data) {

            $rootScope.processing = false;
            $log.debug('New project creation successful', data);
            $state.go('editor.branch', {
                projectId: $scope.projectId,
                branchId: data
            });

        })
        .catch(function (data, status) {

            $log.debug('New project creation failed', status);
            $rootScope.processing = false;
            growl.error('An error occured while project creation. Please retry later.');

        });

});

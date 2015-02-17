/*globals angular, ga*/

'use strict';

require ('./libraryDependencies');

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
require('./directives/processingCover/processingCover.js');

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
    'mms.designVisualization.processingCover',
    'mms.designVisualization.designEditor',
    'angucomplete-alt',
    'ngTouch',
    'ngMaterial',
    'ang-drag-drop',
    'ngCookies'
]);

CyPhyApp.config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {

    var GMEProjectInitializers,
        gmeProjectInitializers;

    window.gapi = undefined;

    GMEProjectInitializers = require('./classes/GMEProjectInitializers');
    gmeProjectInitializers = new GMEProjectInitializers();

    $urlRouterProvider.otherwise('/404');

    $stateProvider

        .state('editor', {
            url: '/editor',
            abstract: true,
            views: {
                'mainView': {
                    templateUrl: '/mmsApp/templates/editor.html'
                },
                'onCover': {
                    template: null
                }
            }
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
            views: {
                'onCover': {
                    template: null,
                    controller: 'CreateDesignController'
                }
            }

        })
        .state('404', {
            templateUrl: '/mmsApp/templates/404.html',
            views: {
                'onCover': {
                    templateUrl: '/mmsApp/templates/404.html',
                    controller: 'NotFoundController',
                    controllerAs: 'page'
                }
            }
        })
        .state('disconnected', {
            views: {
                'onCover': {
                    templateUrl: '/mmsApp/templates/disconnected.html',
                    controller: 'DisconnectedController',
                    controllerAs: 'page'
                }
            }
        });


    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('orange');

});


CyPhyApp.controller('MainNavigatorController', function ($rootScope, $scope, $window, $mdDialog) {

    var defaultNavigatorItems;

    defaultNavigatorItems = [
        {
            id: 'root',
            label: '',
            itemClass: 'cyphy-root',
            action: function (item, ev) {

                function DialogController($scope, $mdDialog) {
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.close = function () {
                        $mdDialog.cancel();
                    };
                }

                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: '/mmsApp/templates/aboutDialog.html',
                    targetEvent: ev
                })
                    .then(function () {
                    });

            }
        }
    ];

    $scope.navigator = {
        separator: true,
        items: angular.copy(defaultNavigatorItems, [])
    };

    $rootScope.$watch('activeDesign', function (activeDesign) {

        var parseDesignName;

        parseDesignName = function (originalName) {

            var result;

            result = originalName.replace(/_/g, ' ');

            return result;

        };

        if (activeDesign && activeDesign.id) {


            $scope.navigator.items = angular.copy(defaultNavigatorItems, []);

            $scope.navigator.items.push({
                id: 'design',
                label: parseDesignName(activeDesign.name)
                //action: function () {
                //    $window.open('/?project=' + projectId);
                //}
            });

        } else {
            $scope.navigator.items = angular.copy(defaultNavigatorItems, []);
        }

    });

});

CyPhyApp.controller('AppController', function ($rootScope, $cookies, $state, $q, $log) {

    var stateBeforeWentWrong;

    $rootScope.busy = true;

    $rootScope.retry = function () {

        var deferred;

        deferred = $q.defer();

        if ($state.current.name === 'disconnected' || $state.current.name === '404') {
            if (stateBeforeWentWrong && stateBeforeWentWrong.name !== '') {

                $state.go(stateBeforeWentWrong.name, stateBeforeWentWrong.params).then(
                    function () {
                        deferred.resolve();
                    },
                    function () {
                        deferred.reject();
                    }
                );

            } else {
                document.location.href = 'http://mmsapp.metamorphsoftware.com/dispatch/mmsapp';
                deferred.resolve();
            }
        }

        return deferred.promise;
    };

    ga('create', 'UA-58522767-1', {
        'userId': $cookies.webgmeSid
    });

    // ga('send', 'pageview'); disable this if you use angulartics


    //window.dragStart = function(evt) {
    //    console.log('--------------' + evt);
    //    evt.dataTransfer.effectAllowed = 'copy';
    //    evt.dataTransfer.dropEffect = 'copy';
    //};

    $rootScope.$watch('disconnected', function (disconnected) {


        if (disconnected === true) {

            $state.go('disconnected');

        } else {

            $rootScope.retry();

        }

    });

    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {

        if (to.name === 'disconnected') {

            stateBeforeWentWrong = {
                name: from.name,
                params: fromParams
            };

        }

        $log.debug('stateChangeSuccess', to);


    });


    $rootScope.$on('$stateChangeStart', function (ev, to) {

        $log.debug('stateChangeStart', to);

    });

    $rootScope.$on('$stateChangeError', function (ev, to) {

        $log.debug('stateChangeError', to);

    });

    $rootScope.$on('$stateNotFound', function (ev, to) {

        $log.debug('stateNotFound', to);

    });

});

CyPhyApp.controller('EditorViewController', function () {
});

CyPhyApp.controller('NotFoundController', function ($rootScope, $log) {

    var self = this;

    $log.debug('in NotFoundController');

    this.clickRetry = function () {

        self.leftBehind = true;
        $rootScope.retry()
            .catch(function () {
                self.leftBehind = false;
            });

    };

    $rootScope.stopBusy();

});

CyPhyApp.controller('DisconnectedController', function ($rootScope) {

    var self = this;

    this.clickRetry = function () {

        self.leftBehind = true;
        $rootScope.retry()
            .catch(function () {
                self.leftBehind = false;
            });

    };

    $rootScope.stopBusy();

});

CyPhyApp.controller('CreateDesignController', function ($rootScope, $scope, $stateParams, $http, $log, $state, growl, projectHandling, workspaceService) {

    $scope.projectId = $stateParams.projectId;
    $scope.errored = false;
    $rootScope.setProcessing();

    if ($rootScope.wsContext) {

        $log.debug('Cleaning up workspace regions');
        workspaceService.cleanUpAllRegions($rootScope.wsContext);

    }

    $rootScope.$emit('$destroy');

    $log.debug('New branch creation');

    projectHandling.cloneMaster()
        .then(function (data) {

            $rootScope.stopProcessing();
            $log.debug('New project creation successful', data);
            $state.go('editor.branch', {
                projectId: $scope.projectId,
                branchId: data
            });

        })
        .catch(function (data, status) {

            $log.debug('New project creation failed', status);
            $rootScope.stopProcessing();
            growl.error('An error occured while project creation. Please retry later.');

        });

});

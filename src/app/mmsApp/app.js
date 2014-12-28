/*globals angular*/

'use strict';

var CyPhyApp = angular.module('CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.mmsApp.templates',

    'ui.bootstrap',

    'mms.designVisualization.operationsManager',
    'mms.designVisualization.wiringService',
    'mms.designVisualization.diagramService',

    'mms.designVisualization.diagramContainer',
    'mms.designVisualization.fabricCanvas',
    'mms.designVisualization.svgDiagram',
    'mms.designVisualization.symbols',
    'ngMaterial'
]);

require('./utils.js');

require('./services/operationsManager/operationsManager.js');

require('./services/diagramService/diagramService.js');
require('./services/gridService/gridService.js');
require('./services/wiringService/wiringService.js');

require('./directives/diagramContainer/diagramContainer.js');
require('./directives/fabricCanvas/fabricCanvas.js');
require('./directives/svgDiagram/svgDiagram.js');

require('./directives/symbols/componentSymbol.js');

CyPhyApp.config(function ($stateProvider, $urlRouterProvider) {

    var selectProject;

    selectProject = {
        load: function (
            $q, $stateParams, $rootScope, $state, $log, dataStoreService, projectService, workspaceService, $timeout) {
            var
                connectionId,
                deferred;

            $rootScope.mainDbConnectionId = 'mms-main-db-connection-id';

            connectionId = $rootScope.mainDbConnectionId;
            deferred = $q.defer();

            $rootScope.loading = true;

            dataStoreService.connectToDatabase(connectionId, {
                host: window.location.basename
            })
                .then(function () {
                    $timeout(function(){
                        projectService.selectProject(connectionId, $stateParams.projectId)
                        .then(function(projectId) {
                            $log.debug('Project selected', projectId);

                            $rootScope.projectId = projectId;
                            $rootScope.loading = false;
                        });

                    });

                    var wsContext;


                    wsContext = {
                        db: $rootScope.mainDbConnectionId,
                        regionId: 'WorkSpaces_' + ( new Date() )
                            .toISOString()
                    };

                    $rootScope.$on('$destroy', function () {
                        workspaceService.cleanUpAllRegions(wsContext);
                    });


                    workspaceService.registerWatcher(wsContext, function (destroyed) {

                        $log.debug('WorkSpace watcher initialized, destroyed:', destroyed);

                        if (destroyed !== true) {
                            workspaceService.watchWorkspaces(wsContext,function (updateObject) {

                                if (updateObject.type === 'load') {
                                    console.log('load', updateObject);
                                } else if (updateObject.type === 'update') {
                                    console.log('update', updateObject);
                                } else if (updateObject.type === 'unload') {
                                    console.log('unload', updateObject);
                                } else {
                                    throw new Error(updateObject);

                                }

                            }).then(function (data) {
                                var hasFoundFirstOne;

                                hasFoundFirstOne = false;

                                angular.forEach(data.workspaces, function(workSpace) {

                                    if (!hasFoundFirstOne) {

                                        hasFoundFirstOne = true;

                                        $rootScope.activeWorkSpace = workSpace;

                                        $log.debug('Active workspace:', $rootScope.activeWorkSpace);

                                        deferred.resolve();
                                    }

                                });

                            });

                        } else {
                            $log.debug('WokrspaceService destroyed...');
                        }
                    });

                }).catch(function (reason) {
                    $rootScope.loading = false;
                    $log.debug('Opening project errored:', $stateParams.projectId, reason);
                    $state.go('404', {
                        projectId: $stateParams.projectId
                    });
                });

            return deferred.promise;
        }
    };

    $urlRouterProvider.otherwise('/noProject');


    $stateProvider
        .state('project', {
            url: '/project/:projectId',
            templateUrl: '/mmsApp/templates/editor.html',
            resolve: selectProject,
            controller: 'ProjectViewController'
        })
        .state('noProject', {
            url: '/noProject',
            templateUrl: '/mmsApp/templates/noProjectSpecified.html',
            controller: 'NoProjectController'
        })
        .state('404', {
            url: '/404/:projectId',
            controller: 'NoProjectController',
            templateUrl: '/mmsApp/templates/404.html'
        });
});

CyPhyApp.controller('MainNavigatorController', function ($rootScope, $scope, $window) {

    var defaultNavigatorItems;

    defaultNavigatorItems = [
        {
            id: 'root',
            label: 'Metamorphosis',
            itemClass: 'cyphy-root'
        }
    ];

    $scope.navigator = {
        separator: true,
        items: angular.copy(defaultNavigatorItems, [])
    };

    $rootScope.$watch('projectId', function (projectId) {

        if (projectId) {

            $scope.navigator.items = angular.copy(defaultNavigatorItems, []);
            $scope.navigator.items.push({
                id: 'project',
                label: projectId,
                action: function () {
                    $window.open('/?project=' + projectId);
                }
            });

        } else {
            $scope.navigator.items = angular.copy(defaultNavigatorItems, []);
        }

    });

});

CyPhyApp.controller('ProjectViewController', function ($scope, $rootScope, diagramService, $log) {

    $scope.diagram = diagramService.getDiagram();


    $log.debug('Diagram:', $scope.diagram);

});

CyPhyApp.controller('NoProjectController', function ($rootScope, $scope, $stateParams, $http, $log, $state, growl) {

    $scope.projectId = $stateParams.projectId;
    $scope.errored = false;

    $scope.startNewProject = function () {

        $rootScope.processing = true;

        $log.debug('New project creation');

        $http.get('/rest/external/copyproject/noredirect')
            .
            success(function (data) {

                $rootScope.processing = false;
                $log.debug('New project creation successful', data);
                $state.go('project', {
                    projectId: data
                });

            })
            .
            error(function (data, status) {

                $log.debug('New project creation failed', status);
                $rootScope.processing = false;
                growl.error('An error occured while project creation. Please retry later.');

            });

    };

});


//CyPhyApp.run(function ($state, growl, dataStoreService, projectService) {

//  var connectionId = 'mms-connection-id';
//
//  dataStoreService.connectToDatabase(connectionId, {host: window.location.basename})
//    .then(function () {
//      // select default project and branch (master)
//      return projectService.selectProject(connectionId, 'ADMEditor');
//    })
//    .catch(function (reason) {
//      growl.error('ADMEditor does not exist. Create and import it using the <a href="' +
//        window.location.origin + '"> webgme interface</a>.');
//      console.error(reason);
//    });
//});

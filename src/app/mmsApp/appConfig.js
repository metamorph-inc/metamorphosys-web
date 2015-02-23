/*global angular, encodeURI*/

'use strict';

angular.module('CyPhyApp').config(function (
    $stateProvider, $urlRouterProvider, $mdThemingProvider, $urlMatcherFactoryProvider) {

    var GMEProjectInitializers,
        gmeProjectInitializers;

    window.gapi = undefined;

    GMEProjectInitializers = require('./classes/GMEProjectInitializers');
    gmeProjectInitializers = new GMEProjectInitializers();

    $urlMatcherFactoryProvider.type('gmeNodeId', {
        encode: function(path) {
            return path.replace(/\//g, '-');
        },
        decode: function(path) {
            return path.replace(/-/g, '/');
        },
        is: function() {
            return true;
        }

    });

    $urlRouterProvider.otherwise('/404');

    $stateProvider

        .state('editor', {
            url: '/editor',
            abstract: true
        })
        .state('editor.project', {
            url: '/:projectId',
            resolve: {
                givenProjectId: function ($state, $stateParams, projectHandling, $log, errorReporter) {
                    return projectHandling.selectProject($stateParams.projectId)
                        .then(function (projectId) {
                            $log.debug('givenProject found');
                            return projectId;
                        })
                        .catch(function(msg) {
                            errorReporter.log(msg);
                            $state.go('404');
                        });
                }
            },
            params: {
                projectId: null,
                branchId: null,
                workspaceId: null
            },
            onEnter: function(projectHandling, $rootScope, $stateParams, $log, $state, errorReporter) {

                if (!$stateParams.branchId) {

                    $log.debug('No branch specified - have to create branch here');

                    projectHandling.cloneMaster()
                        .then(function (data) {

                            $log.debug('New branch creation successful', data);
                            $state.go('editor.project.branch', {
                                projectId: $stateParams.projectId,
                                branchId: data
                            });

                        })
                        .catch(function (msg) {
                            errorReporter.log(msg);
                            $state.go('404');
                        });
                }
            }

        })
        .state('editor.project.branch', {
            url: '/:branchId',
            resolve: {
                givenBranchId: function (givenProjectId, $state, $stateParams, projectHandling, $log, errorReporter) {
                    return projectHandling.selectBranch($stateParams.branchId)
                        .then(function (branchId) {
                            $log.debug('givenBranch found');
                            return branchId;
                        })
                        .catch(function (msg) {
                            errorReporter.log(msg);
                            $state.go('404');
                        });
                }
            },
            params: {
                projectId: null,
                branchId: null
            },
            onEnter: function(projectHandling, $log, $stateParams, $state, errorReporter) {

                var workspaces,
                    workspaceIds,

                    workspaceFound;

                if (!$stateParams.workspaceId) {

                    $log.debug('No workspace specified - have to find one');

                    workspaces = projectHandling.getAvailableWorkspaces();

                    if (angular.isObject(workspaces)) {

                        workspaceIds = Object.keys(workspaces);

                        if (workspaceIds.length) {

                            workspaceFound = true;

                            //$state.go('editor.project.branch.workspace', {
                            //    projectId: $stateParams.projectId,
                            //    branchId: $stateParams.branchId,
                            //    workspaceId: '3ewef3f23ff3'
                            //});

                        }

                    }

                    if (!workspaceFound) {
                        errorReporter.log('No workspaces in project');
                        $state.go('404');
                    }

                }

            }

        })
        .state('editor.project.branch.workspace', {
            url: '/:workspaceId',
            params: {
                projectId: null,
                branchId: null,
                workspaceId: null
            },
            resolve: {
                givenWorkspaceId: function (givenBranchId, $state, $stateParams,
                                            projectHandling, $log, errorReporter) {

                    return projectHandling.selectWorkspace($stateParams.workspaceId)
                        .then(function (workspaceId) {
                            $log.debug('givenWorkspace found', $stateParams.workspaceId);
                            return workspaceId;
                        })
                        .catch(function (msg) {
                            errorReporter.log(msg);
                            $state.go('404');
                        });
                }
            },
            onEnter: function($log) {
                $log.debug('Have to find design here');
            }

        })
        .state('editor.project.branch.workspace.design', {
            url: '/:designId',
            resolve: {
                givenDesignId: function (givenWorkspaceId, $state, $stateParams, projectHandling, $log) {
                    return projectHandling.selectDesign($stateParams.designId)
                        .then(function (workspaceId) {
                            $log.debug('givenDesign found');
                            return workspaceId;
                        });
                }
            },
            onEnter: function($log) {
                $log.debug('Have to find container here');
            },

            controller: 'EditorViewController',
            views: {
                'mainView': {
                    templateUrl: '/mmsApp/templates/editor.html'
                },
                'onCover': {
                    template: null
                }
            }
        })
        .state('editor.project.branch.workspace.design.container', {
            url: '/:containerId',
            resolve: {
                givenDesignId: function (givenDesignId, $state, $stateParams, projectHandling, $log) {
                    return projectHandling.selectContainer($stateParams.containerId)
                        .then(function (containerId) {
                            $log.debug('givenContainer found');
                            return containerId;
                        });
                }
            },
            onEnter: function($log) {
                $log.debug('Have to display container here');
            },

            controller: 'EditorViewController',
            views: {
                'mainView': {
                    templateUrl: '/mmsApp/templates/editor.html'
                },
                'onCover': {
                    template: null
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
        .state('templateSelector', {
            views: {
                'onCover': {
                    templateUrl: '/mmsApp/templates/templateSelector.html'
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


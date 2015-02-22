/*global angular*/

'use strict';

angular.module('CyPhyApp').config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {

    var GMEProjectInitializers,
        gmeProjectInitializers;

    window.gapi = undefined;

    GMEProjectInitializers = require('./classes/GMEProjectInitializers');
    gmeProjectInitializers = new GMEProjectInitializers();

    $urlRouterProvider.otherwise('/404');

    $stateProvider

        .state('editor', {
            url: '/editor',
            abstract: true
        })
        .state('editor.project', {
            url: '/:projectId',
            resolve: {
                givenProjectId: function ($state, $stateParams, projectHandling, $log) {
                    return projectHandling.selectProject($stateParams.projectId)
                        .then(function (projectId) {
                            $log.debug('givenProject found');
                            return projectId;
                        });
                }
            },
            onEnter: function() {
                console.log('Have to create branch here');
            }
        })
        .state('editor.project.branch', {
            url: '/:branchId',
            resolve: {
                givenBranchId: function (givenProjectId, $state, $stateParams, projectHandling, $log) {
                    return projectHandling.selectBranch($stateParams.branchId)
                        .then(function (branchId) {
                            $log.debug('givenBranch found');
                            return branchId;
                        });
                }
            },
            onEnter: function() {
                console.log('Have to find workspace here');
            }

        })
        .state('editor.project.branch.workspace', {
            url: '/:workspaceId',
            resolve: {
                givenWorkspaceId: function (givenBranchId, $state, $stateParams, projectHandling, $log) {
                    return projectHandling.selectWorkspace($stateParams.workspaceId)
                        .then(function (workspaceId) {
                            $log.debug('givenWorkspace found');
                            return workspaceId;
                        });
                }
            },
            onEnter: function() {
                console.log('Have to find design here');
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
            onEnter: function() {
                console.log('Have to find container here');
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
            onEnter: function() {
                console.log('Have to display container here');
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
        .state('createDesign', {
            url: '/createDesign/:projectId',
            resolve: {
                selectProject: ['$state', '$stateParams', 'projectHandling',
                    function ($state, $stateParams, projectHandling) {
                        return projectHandling.selectProject($stateParams.projectId)
                            .then(function (projectId) {
                                return projectId;
                            });
                    }]
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


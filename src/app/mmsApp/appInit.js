/*global angular*/

'use strict';

angular.module('CyPhyApp').config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {

    var retrieveGivenProject,
        retrieveGivenBranch,
        retrieveGivenWorkspace,
        retrieveGivenDesign,
        retrieveGivenContainer;

    retrieveGivenProject = function ($state, $stateParams, projectHandling, $log, errorReporter) {

        return projectHandling.selectProject($stateParams.projectId)
            .then(function (projectId) {
                $log.debug('givenProject found', projectId);
                return projectId;
            })
            .catch(function (msg) {
                errorReporter.log(msg);
                $state.go('404', {}, { replace: 'replace' });
            });
    };

    retrieveGivenBranch = function (givenProjectId, $state, $stateParams, projectHandling, $log, errorReporter) {
        return projectHandling.selectBranch($stateParams.branchId)
            .then(function (branchId) {
                $log.debug('givenBranch found', branchId);
                return branchId;
            })
            .catch(function (msg) {
                errorReporter.log(msg);
                $state.go('404', {}, { replace: 'replace' });
            });
    };

    retrieveGivenWorkspace = function (givenBranchId, $state, $stateParams,
                                       projectHandling, $log, errorReporter) {
        return projectHandling.selectWorkspace($stateParams.workspaceId)
            .then(function (workspaceId) {
                $log.debug('givenWorkspace found', workspaceId);
                return workspaceId;
            })
            .catch(function (msg) {
                errorReporter.log(msg);
                $state.go('404', {}, { replace: 'replace' });
            });
    };

    retrieveGivenDesign = function (givenWorkspaceId, $state, $stateParams,
                                    projectHandling, $log, errorReporter) {
        return projectHandling.selectDesign($stateParams.designId)
            .then(function (designId) {
                $log.debug('givenDesign found', designId);
                return designId;
            })
            .catch(function (msg) {
                errorReporter.log(msg);
                $state.go('404', {}, { replace: 'replace' });
            });
    };

    retrieveGivenContainer = function (givenDesignId, $state, $stateParams,
                                       projectHandling, $log, errorReporter, $q) {
        var deferred;

        deferred = $q.defer();

        if ($stateParams.containerId) {

            projectHandling.selectContainer($stateParams.containerId)
                .then(function (containerId) {
                    $log.debug('givenContainer found', containerId);
                    deferred.resolve(containerId);
                })
                .catch(function (msg) {
                    errorReporter.log(msg);
                    $state.go('404', {}, { replace: 'replace' });
                });
        } else {
            // Setting design as selected container
            projectHandling.selectContainer(givenDesignId)
                .then(function (containerId) {
                    $log.debug('givenContainer found', containerId);
                    deferred.resolve(containerId);
                })
                .catch(function (msg) {
                    errorReporter.log(msg);
                    //  $state.go('404');
                });
        }

        return deferred.promise;

    };

    window.gapi = undefined;

    //$urlMatcherFactoryProvider.type('gmeNodeId', {
    //    encode: function(path) {
    //        return path.replace(/\//g, '-');
    //    },
    //    decode: function(path) {
    //        return path.replace(/-/g, '/');
    //    },
    //    is: function() {
    //        return true;
    //    }
    //
    //});

    $urlRouterProvider.otherwise('/404');

    $stateProvider

        .state('createDesign', {
            url: '/createDesign/{projectId:string}',
            onEnter: function($state, $stateParams) {
                $state.go('editor.project', { projectId: $stateParams.projectId });
            }
        })
        .state('editor', {
            url: '/editor',
            abstract: true,

            views: {
                'mainView@': {
                    templateUrl: '/mmsApp/templates/editor.html'
                },
                'onCover@': {}
            }

        })
        .state('editor.project', {
            url: '/{projectId:string}',
            views: {
                'mainView@': {
                    templateUrl: '/mmsApp/templates/editor.html'
                },
                'onCover@': {}
            },
            resolve: {
                givenProjectId: retrieveGivenProject
            },
            onEnter: function (projectHandling, $rootScope, $stateParams, $log, $state, errorReporter) {

                $log.debug('No branch specified - have to create branch here');

                projectHandling.cloneMaster()
                    .then(function (data) {

                        $log.debug('New branch creation successful', data);
                        $state.go('editor.branch', {
                            projectId: $stateParams.projectId,
                            branchId: data
                        });

                    })
                    .catch(function (msg) {
                        errorReporter.log(msg);
                        $state.go('404', {}, { replace: 'replace' });
                    });
            }

        })
        .state('editor.branch', {
            url: '/{projectId:string}/{branchId:string}',
            resolve: {
                givenProjectId: retrieveGivenProject,
                givenBranchId: retrieveGivenBranch
            },
            onEnter: function (projectHandling, $log, $stateParams, $state, errorReporter) {

                var workspaces,
                    workspaceIds,

                    workspaceFound;

                $log.debug('No workspace specified - have to find one');

                workspaces = projectHandling.getAvailableWorkspaces();

                if (angular.isObject(workspaces)) {

                    workspaceIds = Object.keys(workspaces);

                    if (workspaceIds.length) {

                        workspaceFound = true;

                        $log.debug('Picking first workspace', workspaceIds[0]);

                        $state.go('editor.workspace', {
                            projectId: $stateParams.projectId,
                            branchId: $stateParams.branchId,
                            workspaceId: workspaceIds[0]
                        });

                    }

                }

                if (!workspaceFound) {
                    errorReporter.log('No workspaces in project');
                    $state.go('404', {}, { replace: 'replace' });
                }

            }

        })
        .state('editor.workspace', {
            url: '/{projectId:string}/{branchId:string}/{workspaceId:string}',
            resolve: {
                givenProjectId: retrieveGivenProject,
                givenBranchId: retrieveGivenBranch,
                givenWorkspaceId: retrieveGivenWorkspace
            },
            onEnter: function (projectHandling, $log, $stateParams, $state, errorReporter) {

                var designs,
                    designIds;

                $log.debug('No design specified - have to pick one');

                designs = projectHandling.getAvailableDesigns();

                if (angular.isObject(designs)) {

                    if (angular.isObject(designs['/1922727130/1620862711/1365227561'])) {

                        // For demo releses, this should be 'Template Module 1x2'

                        $state.go('editor.design', {
                            projectId: $stateParams.projectId,
                            branchId: $stateParams.branchId,
                            workspaceId: $stateParams.workspaceId,
                            designId: '/1922727130/1620862711/1365227561'
                        });


                    } else {

                        designIds = Object.keys(designs);

                        if (designIds.length > 0) {

                            $state.go('editor.design', {
                                projectId: $stateParams.projectId,
                                branchId: $stateParams.branchId,
                                workspaceId: $stateParams.workspaceId,
                                designId: designIds[0]
                            });

                        }
                    }

                } else {
                    errorReporter.log('No designs in project');
                    $state.go('404', {}, { replace: 'replace' });
                }

            }


        })
        .state('editor.design', {
            url: '/{projectId:string}/{branchId:string}/{workspaceId:string}/{designId:string}/{containerId:string}',
            resolve: {
                givenProjectId: retrieveGivenProject,
                givenBranchId: retrieveGivenBranch,
                givenWorkspaceId: retrieveGivenWorkspace,
                givenDesignId: retrieveGivenDesign,
                givenContainerId: retrieveGivenContainer
            },
            params: {
                projectId: null,
                branchId: null,
                workspaceId: null,
                designId: null,
                containerId: null
            }
        })
        .state('404', {
            url: '/404',
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
                'mainView@': {},
                'onCover@': {
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


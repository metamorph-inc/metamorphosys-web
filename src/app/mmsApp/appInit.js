/*global angular, document*/

'use strict';

angular.module('CyPhyApp').config(function(
    $stateProvider, $urlRouterProvider, $mdThemingProvider, dummyDiagramEnabled
) {

    var retrieveGivenProject,
        retrieveGivenBranch,
        retrieveGivenWorkspace,
        retrieveGivenDesign,
        retrieveGivenContainer;

    retrieveGivenProject = function($state, $stateParams, projectHandling, $log, errorReporter) {

        return projectHandling.selectProject($stateParams.projectId, $stateParams.branchId)
            .then(function(projectId) {
                $log.debug('givenProject found', projectId);
                return projectId;
            })
            .catch(function(msg) {
                errorReporter.log(msg);
                $state.go('404');
            });
    };

    retrieveGivenBranch = function(givenProjectId, $state, $stateParams, projectHandling, $log, errorReporter) {
        return projectHandling.selectBranch($stateParams.branchId)
            .then(function(branchId) {
                $log.debug('givenBranch found', branchId);
                return branchId;
            })
            .catch(function(msg) {
                errorReporter.log(msg);
                $state.go('404');
            });
    };

    retrieveGivenWorkspace = function(givenBranchId, $state, $stateParams,
        projectHandling, $log, errorReporter) {
        return projectHandling.selectWorkspace($stateParams.workspaceId)
            .then(function(workspaceId) {
                $log.debug('givenWorkspace found', workspaceId);
                return workspaceId;
            })
            .catch(function(msg) {
                errorReporter.log(msg);
                $state.go('404');
            });
    };

    retrieveGivenDesign = function(givenWorkspaceId, $state, $stateParams,
        projectHandling, $log, errorReporter) {
        return projectHandling.selectDesign($stateParams.designId)
            .then(function(designId) {
                $log.debug('givenDesign found', designId);
                return designId;
            })
            .catch(function(msg) {
                errorReporter.log(msg);
                $state.go('404');
            });
    };

    retrieveGivenContainer = function(givenDesignId, $state, $stateParams,
        projectHandling, $log, errorReporter, $q) {
        var deferred;

        deferred = $q.defer();

        if ($stateParams.containerId) {

            projectHandling.selectContainer($stateParams.containerId)
                .then(function(containerId) {
                    $log.debug('givenContainer found', containerId);
                    deferred.resolve(containerId);
                })
                .catch(function(msg) {
                    errorReporter.log(msg);
                    $state.go('404');
                });
        } else {
            // Setting design as selected container
            projectHandling.selectContainer(givenDesignId)
                .then(function(containerId) {
                    $log.debug('givenContainer found', containerId);
                    deferred.resolve(containerId);
                })
                .catch(function(msg) {
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

    $urlRouterProvider.otherwise('/');

    function NotFoundController($rootScope, $log) {

        var self = this;

        $log.debug('in NotFoundController');

        this.clickRetry = function() {

            self.leftBehind = true;
            $rootScope.retry()
                .catch(function() {
                    self.leftBehind = false;
                });

        };

        $rootScope.stopBusy();
        $rootScope.cover();

    }

    $stateProvider

        .state('getDispacthed', {
            url: '/',
            views: {
                'onCover': {
                    template: '',
                    controller: function($injector, $window, $timeout) {

                        var url;

                        if ($injector.has('dispatcherUrl')) {
                            url = $injector.get('dispatcherUrl');
                        } else {
                            url = 'http://mmsapp.metamorphsoftware.com/dispatch/mmsapp';
                        }

                        $timeout(function() {
                            $window.location.href = url;
                        }, 200, false);
                    }
                }
            }

        })
        .state('createDesign', {
            url: '/createDesign/{projectId:string}',
            onEnter: function($state, $stateParams) {
                $state.go('editor.project', {
                    projectId: $stateParams.projectId
                });
            }
        })
        .state('editor', {
            url: '/editor',
            abstract: true,

            views: {
                'mainView@': {},
                'onCover@': {}
            }

        })
        .state('editor.project', {
            url: '/{projectId:string}',
            views: {
                'mainView@': {},
                'onCover@': {}
            },
            resolve: {
                givenProjectId: retrieveGivenProject
            },
            onEnter: function(projectHandling, $rootScope, $stateParams, $log, $state, errorReporter) {

                $log.debug('No branch specified - have to create branch here');

                projectHandling.cloneMaster()
                    .then(function(data) {

                        $log.debug('New branch creation successful', data);
                        $state.go('editor.branch', {
                            projectId: $stateParams.projectId,
                            branchId: data
                        });

                    })
                    .catch(function(msg) {
                        errorReporter.log(msg);
                        $state.go('404');
                    });
            }

        })
        .state('editor.branch', {
            url: '/{projectId:string}/{branchId:string}',
            resolve: {
                givenProjectId: retrieveGivenProject,
                givenBranchId: retrieveGivenBranch
            },
            onEnter: function(projectHandling, $log, $stateParams, $state, errorReporter) {

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
                    $state.go('404');
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
            onEnter: function(projectHandling, $log, $stateParams, $state, errorReporter, $rootScope) {

                var designs,
                    designIds;

                $log.debug('No design specified - have to pick one');

                $rootScope.openDesignSelector(null, true);

                // designs = projectHandling.getAvailableDesigns();
                //
                // if (angular.isObject(designs)) {
                //
                //     if (angular.isObject(designs['/1922727130/1620862711/1365227561'])) {
                //
                //         // For demo releses, this should be 'Template Module 1x2'
                //
                //         $state.go('editor.design', {
                //             projectId: $stateParams.projectId,
                //             branchId: $stateParams.branchId,
                //             workspaceId: $stateParams.workspaceId,
                //             designId: '/1922727130/1620862711/1365227561'
                //         });
                //
                //
                //     } else {
                //
                //         designIds = Object.keys(designs);
                //
                //         if (designIds.length > 0) {
                //
                //             $state.go('editor.design', {
                //                 projectId: $stateParams.projectId,
                //                 branchId: $stateParams.branchId,
                //                 workspaceId: $stateParams.workspaceId,
                //                 designId: designIds[0]
                //             });
                //
                //         }
                //     }
                //
                // } else {
                //     errorReporter.log('No designs in project');
                //     $state.go('404');
                // }

            }


        })
        .state('editor.design', {
            url: '/{projectId:string}/{branchId:string}/{workspaceId:string}/{designId:string}/{containerId:string}',
            views: {
                'mainView@': {
                    templateUrl: '/mmsApp/templates/editor.html'
                },
                'onCover@': {}
            },
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
            views: {
                'onCover': {
                    templateUrl: '/mmsApp/templates/404.html',
                    controller: NotFoundController,
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

    if (dummyDiagramEnabled) {
        $stateProvider.state('dummyEditor', {
            url: '/dummyEditor',
            views: {
                'mainView@': {
                    templateUrl: '/mmsApp/templates/editor.html'
                },
                'onCover@': {}
            }
        });
    }

    // Adopted from:
    // http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors

    function shadeColor(color, percent) {
        var f = parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF,
            color = '#' + (0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);

        console.log(color);

        return color;
    }

    var baseBGColor = '#455160',
        baseFrontColor = '#0D47A1',
        accentColor = '3894fd';

    $mdThemingProvider.definePalette('mmsPalette', {
        '50': shadeColor(baseBGColor, 0.9),
        '100': shadeColor(baseFrontColor, 0.8),
        '200': shadeColor(baseFrontColor, 0.7),
        '300': shadeColor(baseBGColor, 0.6),
        '400': shadeColor(baseBGColor, 0.4),

        '500': baseFrontColor,

        '600': accentColor,
        '700': shadeColor(baseBGColor, -0.2),
        '800': shadeColor(baseBGColor, -0.3),
        '900': shadeColor(baseBGColor, -0.4),
        'A100': 'ff7100',
        'A200': '428bca',
        'A400': '3894fd',
        'A700': '0D47A1',
        'contrastDefaultColor': 'light', // whether, by default, text (contrast)
        // on this palette should be dark or light
        'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
            '200', '300', '400', 'A100'
        ],
        'contrastLightColors': undefined // could also specify this if default was 'dark'
    });


    $mdThemingProvider.theme('default')
        .primaryPalette('mmsPalette');

});

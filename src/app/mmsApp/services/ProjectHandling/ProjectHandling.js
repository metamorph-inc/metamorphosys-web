/*globals angular */

'use strict';

angular.module('mms.projectHandling', [])
    .service('projectHandling', function ($q, $log, branchService, connectionHandling, $http, projectService, $rootScope, workspaceService, mmsUtils) {

        var selectedProjectId,
            selectedBranchId,
            selectedWorkspaceId,
            selectedDesignId,
            selectedContainerId,

            availableWorkspaces,

            wsContext,

            setupWSWatcher,

            projectDestroy,
            branchDestroy,
            workspaceDestroy,
            designDestroy,
            containerDestroy;


        projectDestroy = function () {

            if (selectedProjectId) {

                branchDestroy();
                $rootScope.$emit('projectDestroy');

            }
        };

        branchDestroy = function () {

            if (selectedBranchId) {

                if (wsContext) {
                    workspaceService.cleanUpAllRegions(wsContext);
                    wsContext = null;
                }

                workspaceDestroy();

                $rootScope.$emit('branchDestroy');

            }
        };

        workspaceDestroy = function () {

            if (selectedWorkspaceId) {

                designDestroy();

                $rootScope.$emit('workspaceDestroy');

            }
        };

        designDestroy = function () {

            if (selectedDesignId) {

                containerDestroy();

                $rootScope.$emit('designDestroy');

            }
        };

        containerDestroy = function () {

            if (selectedContainerId) {

                $rootScope.$emit('containerDestroy');

            }
        };

        this.copyProject = function () {
            return $http.get('/rest/external/copyproject/noredirect');

        };

        this.cloneMaster = function () {

            var deferred;

            deferred = $q.defer();

            $rootScope.loading = true;

            connectionHandling.establishMainGMEConnection()
                .then(function (connectionId) {

                    branchService.getBranches(connectionId)
                        .then(function (branches) {

                            var newBranchId,
                                hashId,
                                i;

                            $log.debug('Available branches', branches);

                            if (!branches.length) {

                                $log.error('No branches, what now?');
                                deferred.reject();

                            } else {

                                for (i = 0; i < branches.length; i++) {

                                    if (branches[i].name === 'master') {
                                        hashId = branches[i].commitId;
                                    }
                                }

                                if (!hashId) {
                                    deferred.reject('Could not find master branch!');
                                }

                                newBranchId = mmsUtils.randomString(6) + (new Date()).getTime();

                                branchService.createBranch(
                                    connectionId,
                                    newBranchId,
                                    hashId
                                )
                                    .then(function () {
                                        deferred.resolve(newBranchId);
                                    })
                                    .catch(function (err) {
                                        deferred.reject(err);
                                    });


                            }

                            $rootScope.loading = false;

                        })
                        .catch(function (error) {
                            deferred.reject(error);
                            $rootScope.loading = false;
                        });


                });

            return deferred.promise;

        };

        this.findFirstBranch = function () {

            var deferred,
                connectionId;

            deferred = $q.defer();

            connectionId = connectionHandling.getMainGMEConnectionId();

            branchService.getBranches(connectionId)
                .then(function (branches) {

                    $log.debug('Available branches', branches);

                    if (!branches.length) {

                        $log.error('No branches, what now?');
                        deferred.reject();

                    } else {

                        deferred.resolve(branches[0].name);

                    }

                });

            return deferred.promise;

        };

        this.getSelectedProjectId = function () {
            return selectedProjectId;
        };

        this.selectProject = function (projectId) {

            var deferred;

            deferred = $q.defer();

            if (!projectId) {
                deferred.reject('No project specified');
            } else {

                if (projectId !== selectedProjectId) {

                    $rootScope.loading = true;

                    projectDestroy();

                    connectionHandling.establishMainGMEConnection()
                        .then(function (connectionId) {

                            projectService.selectProject(connectionId, projectId)
                                .then(function (projectId) {

                                    selectedProjectId = projectId;
                                    $log.debug('Project selected', projectId);

                                    deferred.resolve(projectId);

                                })
                                .catch(function (reason) {
                                    $rootScope.loading = false;
                                    $log.debug('Opening project errored', projectId, reason);
                                    deferred.reject('Opening project errored');

                                });

                        })
                        .catch(function (reason) {
                            $rootScope.loading = false;
                            $log.debug('GME Connection could not be established', reason);
                            deferred.reject('GME Connection could not be established');
                        });

                } else {
                    deferred.resolve(projectId);
                }

            }

            return deferred.promise;
        };

        this.getSelectedBranchId = function () {
            return selectedBranchId;
        };


        setupWSWatcher = function () {

            if (wsContext) {
                workspaceService.cleanUpAllRegions(wsContext);
            }

            return connectionHandling.establishMainGMEConnection()
                .then(function (connectionId) {

                    wsContext = $rootScope.wsContext = {
                        db: connectionId,
                        regionId: 'WorkSpaces_' + ( new Date() )
                            .toISOString()
                    };

                    workspaceService.registerWatcher(wsContext, function (destroyed) {

                        $log.debug('WorkSpace watcher initialized, destroyed:', destroyed);

                        if (destroyed !== true) {
                            workspaceService.watchWorkspaces(wsContext, function (updateObject) {

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
                                availableWorkspaces = data.workspaces;
                                console.log('CONTINUE HERE');
                            });
                        }
                    });

                    $log.debug('WSWatchers are set up');

                });

        };

        this.selectBranch = function (branchId) {

            var deferred;

            deferred = $q.defer();

            if (!branchId) {
                deferred.reject('No branch specified');
            } else {

                if (branchId !== selectedBranchId) {

                    $rootScope.loading = true;

                    branchDestroy();

                    connectionHandling.establishMainGMEConnection()
                        .then(function (connectionId) {

                            branchService.selectBranch(connectionId, branchId)
                                .then(function (branchId) {

                                    $rootScope.loading = false;

                                    setupWSWatcher().then(function () {

                                        selectedBranchId = branchId;
                                        $log.debug('Branch selected', branchId);

                                        deferred.resolve(branchId);
                                    })
                                        .catch(function (e) {
                                            deferred.reject(e);
                                        });

                                }
                            )
                                .catch(function (reason) {
                                    $rootScope.loading = false;
                                    $log.debug('Opening branch errored', branchId, reason);
                                    deferred.reject('Opening branch errored');

                                });


                        })
                        .catch(function (reason) {
                            $rootScope.loading = false;
                            $log.debug('GME Connection could not be established', reason);
                            deferred.reject('GME Connection could not be established');
                        });

                } else {
                    deferred.resolve(branchId);
                }
            }

            return deferred.promise;

        };

        this.selectWorkspace = function (workspaceId) {

            var deferred;

            deferred = $q.defer();

            /*            if (!workspaceId) {

             } else {

             if (branchId !== selectedBranchId) {

             $rootScope.loading = true;

             branchDestroy();

             connectionHandling.establishMainGMEConnection()
             .then(function (connectionId) {

             branchService.selectBranch(connectionId, branchId)
             .then(function (branchId) {

             selectedBranchId = branchId;
             $log.debug('Branch selected', branchId);

             deferred.resolve(branchId);

             }
             )
             .catch(function (reason) {
             $rootScope.loading = false;
             $log.debug('Opening branch errored', branchId, reason);
             deferred.reject('Opening branch errored');

             });


             })
             .catch(function (reason) {
             $rootScope.loading = false;
             $log.debug('GME Connection could not be established', reason);
             deferred.reject('GME Connection could not be established');
             });

             } else {
             deferred.resolve(branchId);
             }
             }*/

            deferred.resolve();

            return deferred.promise;

        };

        this.findWorkspace = function () {

            connectionHandling.establishMainGMEConnection()
                .then(function (connectionId) {

                });
        };

    });

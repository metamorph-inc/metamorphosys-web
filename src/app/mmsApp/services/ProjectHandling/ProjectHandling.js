/*globals angular */

'use strict';

angular.module('mms.projectHandling', [])
    .service('projectHandling', function (
        $q, $log, branchService, connectionHandling, $http, projectService, $rootScope, workspaceService,
        mmsUtils, designService, testBenchService) {

        var selectedProjectId,
            selectedBranchId,
            selectedWorkspaceId,
            selectedDesignId,
            selectedContainerId,

            availableWorkspaces,
            availableDesigns,
            availableContainers,
            availableTestBenches,

            wsContext,

            setupWSWatcher,
            cleanWSWatcher,

            setupWorkspaceInternalsWatcher,
            cleanWorkspaceInternalsWatcher;


        this.leaveProject = function () {

            if (selectedProjectId) {

                this.leaveBranch();
                $rootScope.$emit('leaveProject');

                selectedDesignId = null;

            }
        };


        this.leaveBranch = function () {

            if (selectedBranchId) {

                console.log('workspaces are cleaned up');

                cleanWSWatcher();

                this.leaveWorkspace();

                $rootScope.$emit('leaveBranch');

                selectedBranchId = null;

            }
        };

        this.leaveWorkspace = function () {

            if (selectedWorkspaceId) {

                cleanWorkspaceInternalsWatcher();

                this.leaveDesign();

                $rootScope.$emit('leaveWorkspace');

                selectedWorkspaceId = null;

            }
        };

        this.leaveDesign = function () {

            if (selectedDesignId) {

                this.leaveContainer();

                $rootScope.$emit('leaveDesign');

                selectedDesignId = null;

            }
        };

        this.leaveContainer = function () {

            if (selectedContainerId) {

                $rootScope.$emit('leaveContainer');

                selectedContainerId = null;

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

                    this.leaveProject();

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

        cleanWSWatcher = function() {

            if (wsContext) {
                workspaceService.cleanUpAllRegions(wsContext);
                wsContext = null;

                availableWorkspaces = null;
            }

        };

        setupWSWatcher = function () {

            var deferred;

            deferred = $q.defer();

            cleanWSWatcher();

            connectionHandling.establishMainGMEConnection()
                .then(function (connectionId) {

                    wsContext = $rootScope.wsContext = {
                        db: connectionId,
                        regionId: 'WorkSpaces_' + ( new Date() )
                            .toISOString()
                    };

                    $log.debug('WS context is set');

                    workspaceService.registerWatcher(wsContext, function (destroyed) {

                        $log.debug('WorkSpace watcher initialized, destroyed:', destroyed);


                        // TODO: this watchers is being called even if context was cleaned up. This will cause memory leaks.
                        if (wsContext !== null) {
                            if (destroyed !== true) {
                                workspaceService.watchWorkspaces(wsContext, function (updateObject) {


                                    // TODO: creation/removal of new workapces are NOT done
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

                                    $log.debug('WSWatchers are set up');

                                    deferred.resolve(data.workspaces);

                                });
                            }
                        }

                    });


                })
                .catch(function (reason) {
                    $rootScope.loading = false;
                    $log.debug('GME Connection could not be established', reason);
                    deferred.reject('GME Connection could not be established');
                });

            return deferred.promise;

        };

        cleanWorkspaceInternalsWatcher = function() {

            availableDesigns = null;
            availableTestBenches = null;

            selectedDesignId = null;

        };

        setupWorkspaceInternalsWatcher = function() {

            var designsPromise,
                testbenchesPromise,
                deferred;

            deferred = $q.defer();

            cleanWorkspaceInternalsWatcher();

            designsPromise =  designService.watchDesigns(wsContext, selectedWorkspaceId, function () {
                //TODO: eventually this has to be implemented
            }).then(function (designsData) {
                availableDesigns = designsData.designs;
            });

            testbenchesPromise = testBenchService.watchTestBenches(wsContext, selectedWorkspaceId, function() {
                //TODO: eventually this has to be implemented
            }).then(function(testbenchesData) {
                availableTestBenches = testbenchesData.testBenches;
            });

            $q.all([designsPromise, testbenchesPromise])
                .then(function(){
                   deferred.resolve();
                })
                .catch(function(){
                    deferred.reject('Could not get designs and testbenches');
                });

            return deferred.promise;

        };


        this.selectBranch = function (branchId) {

            var deferred;

            deferred = $q.defer();

            if (!branchId) {
                deferred.reject('No branch specified');
            } else {

                if (branchId !== selectedBranchId) {

                    $rootScope.loading = true;

                    this.leaveBranch();

                    connectionHandling.establishMainGMEConnection()
                        .then(function (connectionId) {

                            branchService.selectBranch(connectionId, branchId)
                                .then(function (branchId) {

                                    $rootScope.loading = false;

                                    selectedBranchId = branchId;

                                    setupWSWatcher().then(function () {

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

        this.getSelectedWorkspaceId = function () {
            return selectedWorkspaceId;
        };

        this.selectWorkspace = function (workspaceId) {

            var deferred;

            deferred = $q.defer();

            if (!workspaceId || !angular.isObject(availableWorkspaces) || !availableWorkspaces[workspaceId]) {
                deferred.reject('Non-existing worksapceId');
            } else {

                if (workspaceId !== selectedWorkspaceId) {

                    this.leaveWorkspace();

                    selectedWorkspaceId = workspaceId;

                    setupWorkspaceInternalsWatcher().then(function () {
                        $log.debug('Workspace selected', workspaceId);

                        deferred.resolve(workspaceId);

                    });

                } else {
                    deferred.resolve(workspaceId);
                }

            }

            return deferred.promise;

        };

        this.getSelectedDesignId = function () {
            return selectedDesignId;
        };

        this.selectDesign = function (designId) {

            var deferred;

            deferred = $q.defer();

            if (!designId || !angular.isObject(availableDesigns) || !availableDesigns[designId]) {
                deferred.reject('Non-existing designId');
            } else {

                if (designId !== selectedDesignId) {

                    this.leaveDesign();

                    selectedDesignId = designId;

                    deferred.resolve(designId);

//                    setupWorkspaceInternalsWatcher().then(function () {
//                        $log.debug('Workspace selected', workspaceId);
//
//                        deferred.resolve(workspaceId);
//
//                    });

                } else {
                    deferred.resolve(designId);
                }

            }

            return deferred.promise;

        };

        this.getSelectedContainerId = function () {
            return selectedContainerId;
        };

        this.selectContainer = function (containerId) {

            var deferred;

            deferred = $q.defer();

            if (!containerId || !angular.isObject(availableContainers) || !availableContainers[containerId]) {
                deferred.reject('Non-existing designId');
            } else {

                if (containerId !== selectedContainerId) {

                    this.leaveContainer();

                    selectedContainerId = containerId;

                    deferred.resolve(containerId);

//                    setupWorkspaceInternalsWatcher().then(function () {
//                        $log.debug('Workspace selected', workspaceId);
//
//                        deferred.resolve(workspaceId);
//
//                    });

                } else {
                    deferred.resolve(containerId);
                }

            }

            return deferred.promise;

        };

        this.getAvailableWorkspaces = function() {
            return availableWorkspaces;
        };

        this.getAvailableDesigns = function() {
            return availableDesigns;
        };

        this.getAvailableTestbenches = function() {
            return availableTestBenches;
        };

    });

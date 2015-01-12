/*globals angular*/
'use strict';

module.exports = function () {

    return {

        selectDesign: function ($q) {

            var deferred;

            deferred = $q.defer();

            return deferred.promise;
        },

        selectProjectBranchWorkspaceAndDesign: function (
            $q, $stateParams, branchService, connectionHandling,
            $log, $rootScope, projectHandling, $state, projectService,
            workspaceService, designService, testBenchService) {

            var deferred,
                connectionId,

                selectBranchWhenHaveOne;

            $rootScope.loading = true;

            deferred = $q.defer();

            connectionId = connectionHandling.getMainGMEConnectionId();

            selectBranchWhenHaveOne = function(branchId) {
                branchService.selectBranch(connectionId, branchId)
                    .then(function(branchId){

                        var wsContext;

                        $log.debug('Branch selected', branchId);
                        $rootScope.branchId = branchId;

                        wsContext = $rootScope.wsContext = {
                            db: connectionId,
                            regionId: 'WorkSpaces_' + ( new Date() )
                                .toISOString()
                        };

                        $rootScope.$on('$destroy', function () {
                            workspaceService.cleanUpAllRegions(wsContext);
                        });


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

                                    var hasFoundFirstWorkspace,
                                        hasFoundFirstDesign;

                                    hasFoundFirstWorkspace = false;
                                    hasFoundFirstDesign = false;


                                    angular.forEach(data.workspaces, function (workSpace) {

                                        if (!hasFoundFirstWorkspace) {

                                            hasFoundFirstWorkspace = true;
                                            $rootScope.activeWorkSpace = workSpace;
                                            $log.debug('Active workspace:', $rootScope.activeWorkSpace);


                                        }

                                    });

                                    if (hasFoundFirstWorkspace) {

                                        designService.watchDesigns(wsContext, $rootScope.activeWorkSpace.id, function (/*designsUpdateObject*/) {

                                        }).then(function (designsData) {

                                            angular.forEach(designsData.designs, function (design) {

                                                if (!hasFoundFirstDesign) {

                                                    hasFoundFirstDesign = true;
                                                    $rootScope.activeDesign = design;
                                                    $log.debug('Active design:', $rootScope.activeDesign);

                                                }

                                            });


                                            if (hasFoundFirstDesign) {

                                                deferred.resolve();
                                                $rootScope.loading = false;

                                            } else {

                                                $rootScope.loading = false;

                                                $log.debug('Could not find designs in workspace.');
                                                $state.go('404', {
                                                    projectId: $stateParams.projectId
                                                });

                                                deferred.reject();
                                            }

                                        });

                                        testBenchService.watchTestBenches(
                                            wsContext,
                                            $rootScope.activeWorkSpace.id,
                                            function(){}
                                        ).then(function(testbenchesData) {

                                                var hasFoundFirstTestbench;

                                                angular.forEach(testbenchesData.testBenches, function(testbench){

                                                    if (!hasFoundFirstTestbench) {

                                                        hasFoundFirstTestbench = true;
                                                        $rootScope.activeTestbench = testbench;
                                                        $log.debug('Active testbench:', testbench);

                                                    }

                                                });

                                            });

                                    } else {

                                        $rootScope.loading = false;

                                        $log.debug('Could not find workspaces in project.');
                                        $state.go('404', {
                                            projectId: $stateParams.projectId
                                        });

                                        deferred.reject();

                                    }

                                });

                            } else {
                                $log.debug('WokrspaceService destroyed...');
                            }
                        });

                    })
                    .catch(function (reason) {
                        $rootScope.loading = false;
                        $log.debug('Opening branch errored:', $stateParams.projectId, reason);
                        $state.go('404', {
                            projectId: $stateParams.projectId
                        });
                    });
            };

            connectionHandling.establishMainGMEConnection()
                .then(function(){
                projectService.selectProject(connectionHandling.getMainGMEConnectionId(), $stateParams.projectId)
                    .then(function (projectId) {

                        $log.debug('Project selected', projectId);
                        $rootScope.projectId = projectId;

                        selectBranchWhenHaveOne($stateParams.branchId);

                    }).catch(function (reason) {
                        $rootScope.loading = false;
                        $log.debug('Opening project errored:', $stateParams.projectId, reason);
                        $state.go('404', {
                            projectId: $stateParams.projectId
                        });
                    });
                });

            return deferred.promise;
        },

        selectProject: function (
            $q, projectService, connectionHandling, $stateParams, $log, $rootScope, projectHandling, $state) {

            var deferred;

            deferred = $q.defer();

            $rootScope.loading = true;

            connectionHandling.establishMainGMEConnection()
                .then(function(){


                    projectService.selectProject(connectionHandling.getMainGMEConnectionId(), $stateParams.projectId)
                        .then(function (projectId) {

                            $log.debug('Project selected', projectId);
                            $rootScope.projectId = projectId;

                            //projectHandling.findFirstBranch()
                            //    .then(function(branchId){
                            //
                            //        $stateParams.branchId = branchId;
                            //
                            //        console.log('First branch', branchId);
                            //
                            //        deferred.resolve();
                            //
                            //        $timeout(function() {
                            //            $state.go('editor.branch', {
                            //                projectId: projectId,
                            //                branchId: branchId
                            //            });
                            //        });
                            //
                            //
                            //    });


                            deferred.resolve(projectId);

                        });
                })
                .catch(function (reason) {
                    $rootScope.loading = false;
                    $log.debug('Opening project errored:', $stateParams.projectId, reason);
                    $state.go('404', {
                        projectId: $stateParams.projectId
                    });
                });

            return deferred.promise;
        }


    };

};

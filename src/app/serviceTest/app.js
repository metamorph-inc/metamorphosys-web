/*globals angular, console, setTimeout*/

var CyPhyApp = angular.module('CyPhyApp', [
    'gme.services',
    'cyphy.components'
])
    .run(function (DataStoreService, ProjectService, BranchService, NodeService, WorkspaceService, ComponentService, DesignService, TestBenchService) {
        DataStoreService.connectToDatabase('my-db-connection-id', {host: window.location.basename})
            .then(function () {
                console.log('Connected ...');
                return ProjectService.selectProject('my-db-connection-id', 'ADMEditor');
            })
            .then(function () {
                console.log('Project selected...');
                return BranchService.selectBranch('my-db-connection-id', 'master');
            })
            .then(function () {
                console.log('Branch selected...');
            }).catch(function (reason) {
                console.error(reason);
            });

//        BranchService.on({db: 'my-db-connection-id', projectId: 'ADMEditor', branchId: 'master'}, 'initialize', function (currentContext) {
//            console.log('BranchService initialized..');
//        });

        NodeService.on('my-db-connection-id', 'initialize', function (currentContext) {
            var testContext = {
                db: 'my-db-connection-id',
                regionId: 'TestRegion'
            };
            WorkspaceService.watchWorkspaces(testContext, function (info) { console.warn(info); })
                .then(function (data) {
                    var key;
                    console.log('watchWorkspaces:', data);
                    for (key in data.workspaces) {
                        WorkspaceService.watchNumberOfComponents(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                console.log('watchNumberOfComponents:', data);
                            });
                        WorkspaceService.watchNumberOfDesigns(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                console.log('watchNumberOfDesigns:', data);
                            });
                        WorkspaceService.watchNumberOfTestBenches(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                console.log('watchNumberOfTestBenches:', data);
                            });
                        ComponentService.watchComponents(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                var cKey;
                                console.log('watchComponents:', data);
                                for (cKey in data.components) {
                                    ComponentService.watchComponentDetails(testContext, cKey, function (info) { console.warn(info); })
                                        .then(function (data) {
                                            console.log('watchComponentDetails:', data);
                                    });
                                }
                            });
                        DesignService.watchDesigns(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                var dKey;
                                console.log('watchDesigns:', data);
//                                for (cKey in data.components) {
//                                    ComponentService.watchComponentDetails(testContext, cKey, function (info) { console.warn(info); })
//                                        .then(function (data) {
//                                            console.warn('watchComponentDetails:', data);
//                                        });
//                                }
                            });
                        TestBenchService.watchTestBenches(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                var dKey;
                                console.warn('watchTestBenches:', data);
//                                for (cKey in data.components) {
//                                    ComponentService.watchComponentDetails(testContext, cKey, function (info) { console.warn(info); })
//                                        .then(function (data) {
//                                            console.warn('watchComponentDetails:', data);
//                                        });
//                                }
                            });
                        break; // Can only watch the above for one work-space (unless context is modified).
                    }
                });
        });
    });

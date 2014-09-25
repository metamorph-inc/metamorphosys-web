/*globals angular, console, setTimeout*/

var CyPhyApp = angular.module('CyPhyApp', [
    'gme.services',
    'cyphy.components'
])
    .run(function (DataStoreService, BranchService, NodeService, WorkspaceService, ComponentService) {
        DataStoreService.selectBranch({db: 'my-db-connection-id', projectId: 'ADMEditor', branchId: 'master'})
            .then(function () {
                console.log('Branch selected...');
            }).catch(function (reason) {
                console.error(reason);
            });

        BranchService.on({db: 'my-db-connection-id', projectId: 'ADMEditor', branchId: 'master'}, 'initialize', function (currentContext) {
            console.log('BranchService initialized..');
        });

        NodeService.on({db: 'my-db-connection-id', projectId: 'ADMEditor', branchId: 'master'}, 'initialize', function (currentContext) {
            var testContext = {
                db: 'my-db-connection-id',
                projectId: 'ADMEditor',
                branchId: 'master',
                regionId: 'TestRegion'
            };
            WorkspaceService.watchWorkspaces(testContext, function (info) { console.warn(info); })
                .then(function (data) {
                    var key;
                    console.warn('watchWorkspaces:', data);
                    for (key in data.workspaces) {
                        WorkspaceService.watchNumberOfComponents(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                console.warn('watchNumberOfComponents:', data);
                            });
                        WorkspaceService.watchNumberOfDesigns(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                console.warn('watchNumberOfDesigns:', data);
                            });
                        WorkspaceService.watchNumberOfTestBenches(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                console.warn('watchNumberOfTestBenches:', data);
                            });
                        ComponentService.watchComponents(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                var cKey;
                                console.warn('watchComponents:', data);
                                for (cKey in data.components) {
                                    ComponentService.watchComponentDetails(testContext, cKey, function (info) { console.warn(info); })
                                        .then(function (data) {
                                            console.warn('watchComponentDetails:', data);
                                    });
                                }
                            });
                    }
                });
        });
    });

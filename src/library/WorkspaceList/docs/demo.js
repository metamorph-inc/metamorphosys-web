/*globals console, angular, Chance, setTimeout*/

'use strict';

var demoApp = angular.module('cyphy.ui.WorkspaceList.demo', [
    'cyphy.components',
    'cyphy.components.templates'
]);

// overwrite WorkspaceService with dummy data
demoApp.service('WorkspaceService', function ($q, $timeout) {
    var self = this,
        workspaceUpdateListener;

    this.deleteWorkspace = function (context, workspaceId) {
        $timeout(function () {
            workspaceUpdateListener({
                id: workspaceId,
                type: 'unload',
                data: null
            });
        }, 400);
    };

    this.duplicateWorkspace = function (context, otherWorkspaceId) {
        console.log('Not implemented.', otherWorkspaceId);
    };

    this.createWorkspace = function (context, data) {
        console.log('Not implemented.', data);
    };

    this.watchWorkspaces = function (parentContext, updateListener) {
        var deferred = $q.defer(),
            i,
            numItems,
            data = {
                regionId: 'region_mockId',
                workspaces: {} // workspace = {id: <string>, name: <string>, description: <string>}
            };

        workspaceUpdateListener = updateListener;

        self.chance = new Chance();
        numItems = self.chance.integer({min: 2, max: 15});

        for (i = 0; i < numItems; i += 1) {
            data.workspaces[i] = {
                id: i,
                name: self.chance.name(),
                description: self.chance.sentence()
            };
        }

        $timeout(function () {
            updateListener({
                id: 'update_1',
                type: 'load',
                data: {
                    id: 'update_1',
                    name: 'Created elsewhere',
                    description: 'New Workspace from update listener'
                }
            });
        }, 2500);

        deferred.resolve(data);

        return deferred.promise;
    };

});
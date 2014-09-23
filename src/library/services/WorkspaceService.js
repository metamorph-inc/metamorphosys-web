/*globals angular*/
'use strict';

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module('cyphy.services')
    .service('WorkspaceService', function () {
        // This should be watchWorkspaces
        this.getWorkspaces = function () {
            throw new Error('Not implemented yet.');
        };

        this.createWorkspace = function (data, otherWorkspaceId) {
            throw new Error('Not implemented yet.');
        };

        this.deleteWorkspace = function (workspaceId) {
            throw new Error('Not implemented yet.');
        };

        this.exportWorkspace = function (workspaceId) {
            throw new Error('Not implemented yet.');
        };

        this.watchWorkspaces = function (parentContext, updateListener) {
            throw new Error('Not implemented yet.');
        };

        this.watchNumberOfComponents = function (parentContext, workspaceId, updateListener) {
            throw new Error('Not implemented yet.');
        };

        this.watchNumberOfDesigns = function (parentContext, workspaceId, updateListener) {
            throw new Error('Not implemented yet.');
        };

        this.watchNumberOfTestBenches = function (parentContext, workspaceId, updateListener) {
            throw new Error('Not implemented yet.');
        };
    });
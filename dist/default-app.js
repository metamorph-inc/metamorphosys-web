(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular, console*/

var CyPhyApp = angular.module('CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.default.templates'
])
    .config(function ($stateProvider, $urlRouterProvider) {
        //
        // For any unmatched url, redirect to /workspaces
        $urlRouterProvider.otherwise('/index');
        //
        // Now set up the states
        $stateProvider
            .state('index', {
                url: "/index"
            })
            .state('workspaces', {
                url: "/workspaces",
                templateUrl: "/default/templates/Workspaces.html",
                controller: "WorkspacesController"
            })
            .state('workspaceDetails', {
                url: "/workspaceDetails/:workspaceId",
                templateUrl: "/default/templates/WorkspaceDetails.html",
                controller: "WorkspaceDetailsController"
            });
    })
    .run(function ($state, DataStoreService) {

        // TODO: we have to remove this logic from here.
        DataStoreService.selectBranch({db: 'my-db-connection-id', projectId: 'ADMEditor', branchId: 'master'})
            .then(function () {
                console.log('Branch selected...');

                // Redirect to workspaces once it is loaded.
                $state.go('workspaces');

            }).catch(function (reason) {
                console.error(reason);
            });
    });


require('./views/Workspaces/WorkspacesController');
require('./views/WorkspaceDetails/WorkspaceDetailsController');

// FIXME: remove this part, just for testing to override the workspace service
//require('chance');
//CyPhyApp.service('WorkspaceService', function ($q, $timeout) {
//    var self = this,
//        workspaceUpdateListener;
//
//    this.deleteWorkspace = function (context, workspaceId) {
//        $timeout(function () {
//            workspaceUpdateListener({
//                id: workspaceId,
//                type: 'unload',
//                data: null
//            });
//        }, 400);
//    };
//
//    this.duplicateWorkspace = function (context, otherWorkspaceId) {
//        console.log('Not implemented.', otherWorkspaceId);
//    };
//
//    this.createWorkspace = function (context, data) {
//        console.log('Not implemented.', data);
//    };
//
//    this.watchWorkspaces = function (parentContext, updateListener) {
//        var deferred = $q.defer(),
//            i,
//            numItems,
//            data = {
//                regionId: 'region_mockId',
//                workspaces: {} // workspace = {id: <string>, name: <string>, description: <string>}
//            };
//
//        workspaceUpdateListener = updateListener;
//
//        self.chance = new Chance();
//        numItems = self.chance.integer({min: 2, max: 15});
//
//        for (i = 0; i < numItems; i += 1) {
//            data.workspaces[i] = {
//                id: i,
//                name: self.chance.name(),
//                description: self.chance.sentence()
//            };
//        }
//
//        $timeout(function () {
//            updateListener({
//                id: 'update_1',
//                type: 'load',
//                data: {
//                    id: 'update_1',
//                    name: 'Created elsewhere',
//                    description: 'New Workspace from update listener'
//                }
//            });
//        }, 2500);
//
//        deferred.resolve(data);
//
//        return deferred.promise;
//    };
//
//});
},{"./views/WorkspaceDetails/WorkspaceDetailsController":2,"./views/Workspaces/WorkspacesController":3}],2:[function(require,module,exports){
/*globals angular, console */

angular.module('CyPhyApp')
    .controller('WorkspaceDetailsController', function ($scope) {
        console.log('WorkspaceDetailsController');
    });
},{}],3:[function(require,module,exports){
/*globals angular, console */

angular.module('CyPhyApp')
    .controller('WorkspacesController', function ($scope) {
        console.log('WorkspacesController');
    });
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWN0c1xcTUVUQVxcV2ViR01FXFxub2RlX21vZHVsZXNcXHdlYmdtZS1jeXBoeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvZGVmYXVsdC9hcHAuanMiLCJEOi9Qcm9qZWN0cy9NRVRBL1dlYkdNRS9ub2RlX21vZHVsZXMvd2ViZ21lLWN5cGh5L3NyYy9hcHAvZGVmYXVsdC92aWV3cy9Xb3Jrc3BhY2VEZXRhaWxzL1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyLmpzIiwiRDovUHJvamVjdHMvTUVUQS9XZWJHTUUvbm9kZV9tb2R1bGVzL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvV29ya3NwYWNlcy9Xb3Jrc3BhY2VzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cclxuXHJcbnZhciBDeVBoeUFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcsIFtcclxuICAgICd1aS5yb3V0ZXInLFxyXG5cclxuICAgICdnbWUuc2VydmljZXMnLFxyXG5cclxuICAgICdpc2lzLnVpLmNvbXBvbmVudHMnLFxyXG5cclxuICAgICdjeXBoeS5jb21wb25lbnRzJyxcclxuXHJcbiAgICAvLyBhcHAgc3BlY2lmaWMgdGVtcGxhdGVzXHJcbiAgICAnY3lwaHkuZGVmYXVsdC50ZW1wbGF0ZXMnXHJcbl0pXHJcbiAgICAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBGb3IgYW55IHVubWF0Y2hlZCB1cmwsIHJlZGlyZWN0IHRvIC93b3Jrc3BhY2VzXHJcbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL2luZGV4Jyk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBOb3cgc2V0IHVwIHRoZSBzdGF0ZXNcclxuICAgICAgICAkc3RhdGVQcm92aWRlclxyXG4gICAgICAgICAgICAuc3RhdGUoJ2luZGV4Jywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9pbmRleFwiXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGF0ZSgnd29ya3NwYWNlcycsIHtcclxuICAgICAgICAgICAgICAgIHVybDogXCIvd29ya3NwYWNlc1wiLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL2RlZmF1bHQvdGVtcGxhdGVzL1dvcmtzcGFjZXMuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJXb3Jrc3BhY2VzQ29udHJvbGxlclwiXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGF0ZSgnd29ya3NwYWNlRGV0YWlscycsIHtcclxuICAgICAgICAgICAgICAgIHVybDogXCIvd29ya3NwYWNlRGV0YWlscy86d29ya3NwYWNlSWRcIixcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9kZWZhdWx0L3RlbXBsYXRlcy9Xb3Jrc3BhY2VEZXRhaWxzLmh0bWxcIixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXJcIlxyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0pXHJcbiAgICAucnVuKGZ1bmN0aW9uICgkc3RhdGUsIERhdGFTdG9yZVNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogd2UgaGF2ZSB0byByZW1vdmUgdGhpcyBsb2dpYyBmcm9tIGhlcmUuXHJcbiAgICAgICAgRGF0YVN0b3JlU2VydmljZS5zZWxlY3RCcmFuY2goe2RiOiAnbXktZGItY29ubmVjdGlvbi1pZCcsIHByb2plY3RJZDogJ0FETUVkaXRvcicsIGJyYW5jaElkOiAnbWFzdGVyJ30pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCcmFuY2ggc2VsZWN0ZWQuLi4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSZWRpcmVjdCB0byB3b3Jrc3BhY2VzIG9uY2UgaXQgaXMgbG9hZGVkLlxyXG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCd3b3Jrc3BhY2VzJyk7XHJcblxyXG4gICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG5cclxucmVxdWlyZSgnLi92aWV3cy9Xb3Jrc3BhY2VzL1dvcmtzcGFjZXNDb250cm9sbGVyJyk7XHJcbnJlcXVpcmUoJy4vdmlld3MvV29ya3NwYWNlRGV0YWlscy9Xb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicpO1xyXG5cclxuLy8gRklYTUU6IHJlbW92ZSB0aGlzIHBhcnQsIGp1c3QgZm9yIHRlc3RpbmcgdG8gb3ZlcnJpZGUgdGhlIHdvcmtzcGFjZSBzZXJ2aWNlXHJcbi8vcmVxdWlyZSgnY2hhbmNlJyk7XHJcbi8vQ3lQaHlBcHAuc2VydmljZSgnV29ya3NwYWNlU2VydmljZScsIGZ1bmN0aW9uICgkcSwgJHRpbWVvdXQpIHtcclxuLy8gICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4vLyAgICAgICAgd29ya3NwYWNlVXBkYXRlTGlzdGVuZXI7XHJcbi8vXHJcbi8vICAgIHRoaXMuZGVsZXRlV29ya3NwYWNlID0gZnVuY3Rpb24gKGNvbnRleHQsIHdvcmtzcGFjZUlkKSB7XHJcbi8vICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbi8vICAgICAgICAgICAgd29ya3NwYWNlVXBkYXRlTGlzdGVuZXIoe1xyXG4vLyAgICAgICAgICAgICAgICBpZDogd29ya3NwYWNlSWQsXHJcbi8vICAgICAgICAgICAgICAgIHR5cGU6ICd1bmxvYWQnLFxyXG4vLyAgICAgICAgICAgICAgICBkYXRhOiBudWxsXHJcbi8vICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICB9LCA0MDApO1xyXG4vLyAgICB9O1xyXG4vL1xyXG4vLyAgICB0aGlzLmR1cGxpY2F0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCBvdGhlcldvcmtzcGFjZUlkKSB7XHJcbi8vICAgICAgICBjb25zb2xlLmxvZygnTm90IGltcGxlbWVudGVkLicsIG90aGVyV29ya3NwYWNlSWQpO1xyXG4vLyAgICB9O1xyXG4vL1xyXG4vLyAgICB0aGlzLmNyZWF0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCBkYXRhKSB7XHJcbi8vICAgICAgICBjb25zb2xlLmxvZygnTm90IGltcGxlbWVudGVkLicsIGRhdGEpO1xyXG4vLyAgICB9O1xyXG4vL1xyXG4vLyAgICB0aGlzLndhdGNoV29ya3NwYWNlcyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB1cGRhdGVMaXN0ZW5lcikge1xyXG4vLyAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuLy8gICAgICAgICAgICBpLFxyXG4vLyAgICAgICAgICAgIG51bUl0ZW1zLFxyXG4vLyAgICAgICAgICAgIGRhdGEgPSB7XHJcbi8vICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAncmVnaW9uX21vY2tJZCcsXHJcbi8vICAgICAgICAgICAgICAgIHdvcmtzcGFjZXM6IHt9IC8vIHdvcmtzcGFjZSA9IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz59XHJcbi8vICAgICAgICAgICAgfTtcclxuLy9cclxuLy8gICAgICAgIHdvcmtzcGFjZVVwZGF0ZUxpc3RlbmVyID0gdXBkYXRlTGlzdGVuZXI7XHJcbi8vXHJcbi8vICAgICAgICBzZWxmLmNoYW5jZSA9IG5ldyBDaGFuY2UoKTtcclxuLy8gICAgICAgIG51bUl0ZW1zID0gc2VsZi5jaGFuY2UuaW50ZWdlcih7bWluOiAyLCBtYXg6IDE1fSk7XHJcbi8vXHJcbi8vICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtSXRlbXM7IGkgKz0gMSkge1xyXG4vLyAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1tpXSA9IHtcclxuLy8gICAgICAgICAgICAgICAgaWQ6IGksXHJcbi8vICAgICAgICAgICAgICAgIG5hbWU6IHNlbGYuY2hhbmNlLm5hbWUoKSxcclxuLy8gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHNlbGYuY2hhbmNlLnNlbnRlbmNlKClcclxuLy8gICAgICAgICAgICB9O1xyXG4vLyAgICAgICAgfVxyXG4vL1xyXG4vLyAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4vLyAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtcclxuLy8gICAgICAgICAgICAgICAgaWQ6ICd1cGRhdGVfMScsXHJcbi8vICAgICAgICAgICAgICAgIHR5cGU6ICdsb2FkJyxcclxuLy8gICAgICAgICAgICAgICAgZGF0YToge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgaWQ6ICd1cGRhdGVfMScsXHJcbi8vICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQ3JlYXRlZCBlbHNld2hlcmUnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdOZXcgV29ya3NwYWNlIGZyb20gdXBkYXRlIGxpc3RlbmVyJ1xyXG4vLyAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICB9LCAyNTAwKTtcclxuLy9cclxuLy8gICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbi8vXHJcbi8vICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuLy8gICAgfTtcclxuLy9cclxuLy99KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJylcclxuICAgIC5jb250cm9sbGVyKCdXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXInKTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1dvcmtzcGFjZXNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3Jrc3BhY2VzQ29udHJvbGxlcicpO1xyXG4gICAgfSk7Il19

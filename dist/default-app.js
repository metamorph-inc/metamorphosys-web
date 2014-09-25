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
        'use strict';

        console.log('WorkspacesController');
    });
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy96c29sdC9HaXRIdWIvd2ViZ21lLWN5cGh5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvZGVmYXVsdC9hcHAuanMiLCIvVXNlcnMvenNvbHQvR2l0SHViL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvV29ya3NwYWNlRGV0YWlscy9Xb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlci5qcyIsIi9Vc2Vycy96c29sdC9HaXRIdWIvd2ViZ21lLWN5cGh5L3NyYy9hcHAvZGVmYXVsdC92aWV3cy9Xb3Jrc3BhY2VzL1dvcmtzcGFjZXNDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cblxudmFyIEN5UGh5QXBwID0gYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJywgW1xuICAgICd1aS5yb3V0ZXInLFxuXG4gICAgJ2dtZS5zZXJ2aWNlcycsXG5cbiAgICAnaXNpcy51aS5jb21wb25lbnRzJyxcblxuICAgICdjeXBoeS5jb21wb25lbnRzJyxcblxuICAgIC8vIGFwcCBzcGVjaWZpYyB0ZW1wbGF0ZXNcbiAgICAnY3lwaHkuZGVmYXVsdC50ZW1wbGF0ZXMnXG5dKVxuICAgIC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gRm9yIGFueSB1bm1hdGNoZWQgdXJsLCByZWRpcmVjdCB0byAvd29ya3NwYWNlc1xuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvaW5kZXgnKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gTm93IHNldCB1cCB0aGUgc3RhdGVzXG4gICAgICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgICAgICAuc3RhdGUoJ2luZGV4Jywge1xuICAgICAgICAgICAgICAgIHVybDogXCIvaW5kZXhcIlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGF0ZSgnd29ya3NwYWNlcycsIHtcbiAgICAgICAgICAgICAgICB1cmw6IFwiL3dvcmtzcGFjZXNcIixcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvV29ya3NwYWNlcy5odG1sXCIsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJXb3Jrc3BhY2VzQ29udHJvbGxlclwiXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnN0YXRlKCd3b3Jrc3BhY2VEZXRhaWxzJywge1xuICAgICAgICAgICAgICAgIHVybDogXCIvd29ya3NwYWNlRGV0YWlscy86d29ya3NwYWNlSWRcIixcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvV29ya3NwYWNlRGV0YWlscy5odG1sXCIsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlclwiXG4gICAgICAgICAgICB9KTtcbiAgICB9KVxuICAgIC5ydW4oZnVuY3Rpb24gKCRzdGF0ZSwgRGF0YVN0b3JlU2VydmljZSkge1xuXG4gICAgICAgIC8vIFRPRE86IHdlIGhhdmUgdG8gcmVtb3ZlIHRoaXMgbG9naWMgZnJvbSBoZXJlLlxuICAgICAgICBEYXRhU3RvcmVTZXJ2aWNlLnNlbGVjdEJyYW5jaCh7ZGI6ICdteS1kYi1jb25uZWN0aW9uLWlkJywgcHJvamVjdElkOiAnQURNRWRpdG9yJywgYnJhbmNoSWQ6ICdtYXN0ZXInfSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQnJhbmNoIHNlbGVjdGVkLi4uJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBSZWRpcmVjdCB0byB3b3Jrc3BhY2VzIG9uY2UgaXQgaXMgbG9hZGVkLlxuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnd29ya3NwYWNlcycpO1xuXG4gICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG5cblxucmVxdWlyZSgnLi92aWV3cy9Xb3Jrc3BhY2VzL1dvcmtzcGFjZXNDb250cm9sbGVyJyk7XG5yZXF1aXJlKCcuL3ZpZXdzL1dvcmtzcGFjZURldGFpbHMvV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXInKTtcblxuLy8gRklYTUU6IHJlbW92ZSB0aGlzIHBhcnQsIGp1c3QgZm9yIHRlc3RpbmcgdG8gb3ZlcnJpZGUgdGhlIHdvcmtzcGFjZSBzZXJ2aWNlXG4vL3JlcXVpcmUoJ2NoYW5jZScpO1xuLy9DeVBoeUFwcC5zZXJ2aWNlKCdXb3Jrc3BhY2VTZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCAkdGltZW91dCkge1xuLy8gICAgdmFyIHNlbGYgPSB0aGlzLFxuLy8gICAgICAgIHdvcmtzcGFjZVVwZGF0ZUxpc3RlbmVyO1xuLy9cbi8vICAgIHRoaXMuZGVsZXRlV29ya3NwYWNlID0gZnVuY3Rpb24gKGNvbnRleHQsIHdvcmtzcGFjZUlkKSB7XG4vLyAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICAgICB3b3Jrc3BhY2VVcGRhdGVMaXN0ZW5lcih7XG4vLyAgICAgICAgICAgICAgICBpZDogd29ya3NwYWNlSWQsXG4vLyAgICAgICAgICAgICAgICB0eXBlOiAndW5sb2FkJyxcbi8vICAgICAgICAgICAgICAgIGRhdGE6IG51bGxcbi8vICAgICAgICAgICAgfSk7XG4vLyAgICAgICAgfSwgNDAwKTtcbi8vICAgIH07XG4vL1xuLy8gICAgdGhpcy5kdXBsaWNhdGVXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoY29udGV4dCwgb3RoZXJXb3Jrc3BhY2VJZCkge1xuLy8gICAgICAgIGNvbnNvbGUubG9nKCdOb3QgaW1wbGVtZW50ZWQuJywgb3RoZXJXb3Jrc3BhY2VJZCk7XG4vLyAgICB9O1xuLy9cbi8vICAgIHRoaXMuY3JlYXRlV29ya3NwYWNlID0gZnVuY3Rpb24gKGNvbnRleHQsIGRhdGEpIHtcbi8vICAgICAgICBjb25zb2xlLmxvZygnTm90IGltcGxlbWVudGVkLicsIGRhdGEpO1xuLy8gICAgfTtcbi8vXG4vLyAgICB0aGlzLndhdGNoV29ya3NwYWNlcyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB1cGRhdGVMaXN0ZW5lcikge1xuLy8gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4vLyAgICAgICAgICAgIGksXG4vLyAgICAgICAgICAgIG51bUl0ZW1zLFxuLy8gICAgICAgICAgICBkYXRhID0ge1xuLy8gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdyZWdpb25fbW9ja0lkJyxcbi8vICAgICAgICAgICAgICAgIHdvcmtzcGFjZXM6IHt9IC8vIHdvcmtzcGFjZSA9IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz59XG4vLyAgICAgICAgICAgIH07XG4vL1xuLy8gICAgICAgIHdvcmtzcGFjZVVwZGF0ZUxpc3RlbmVyID0gdXBkYXRlTGlzdGVuZXI7XG4vL1xuLy8gICAgICAgIHNlbGYuY2hhbmNlID0gbmV3IENoYW5jZSgpO1xuLy8gICAgICAgIG51bUl0ZW1zID0gc2VsZi5jaGFuY2UuaW50ZWdlcih7bWluOiAyLCBtYXg6IDE1fSk7XG4vL1xuLy8gICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1JdGVtczsgaSArPSAxKSB7XG4vLyAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1tpXSA9IHtcbi8vICAgICAgICAgICAgICAgIGlkOiBpLFxuLy8gICAgICAgICAgICAgICAgbmFtZTogc2VsZi5jaGFuY2UubmFtZSgpLFxuLy8gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHNlbGYuY2hhbmNlLnNlbnRlbmNlKClcbi8vICAgICAgICAgICAgfTtcbi8vICAgICAgICB9XG4vL1xuLy8gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbi8vICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe1xuLy8gICAgICAgICAgICAgICAgaWQ6ICd1cGRhdGVfMScsXG4vLyAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXG4vLyAgICAgICAgICAgICAgICBkYXRhOiB7XG4vLyAgICAgICAgICAgICAgICAgICAgaWQ6ICd1cGRhdGVfMScsXG4vLyAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0NyZWF0ZWQgZWxzZXdoZXJlJyxcbi8vICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ05ldyBXb3Jrc3BhY2UgZnJvbSB1cGRhdGUgbGlzdGVuZXInXG4vLyAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgIH0pO1xuLy8gICAgICAgIH0sIDI1MDApO1xuLy9cbi8vICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuLy9cbi8vICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbi8vICAgIH07XG4vL1xuLy99KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xuXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxuICAgIC5jb250cm9sbGVyKCdXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyJyk7XG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cblxuYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJylcbiAgICAuY29udHJvbGxlcignV29ya3NwYWNlc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcblxuICAgICAgICBjb25zb2xlLmxvZygnV29ya3NwYWNlc0NvbnRyb2xsZXInKTtcbiAgICB9KTsiXX0=

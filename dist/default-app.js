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
    .run(function ($state, DataStoreService, ProjectService) {
        'use strict';
        var connectionId = 'my-db-connection-id';

        DataStoreService.connectToDatabase(connectionId, {host: window.location.basename})
            .then(function () {
                // select default project and branch (master)
                return ProjectService.selectProject(connectionId, 'ADMEditor');
            })
            .catch(function (reason) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWN0c1xcTUVUQVxcV2ViR01FXFxub2RlX21vZHVsZXNcXHdlYmdtZS1jeXBoeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvZGVmYXVsdC9hcHAuanMiLCJEOi9Qcm9qZWN0cy9NRVRBL1dlYkdNRS9ub2RlX21vZHVsZXMvd2ViZ21lLWN5cGh5L3NyYy9hcHAvZGVmYXVsdC92aWV3cy9Xb3Jrc3BhY2VEZXRhaWxzL1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyLmpzIiwiRDovUHJvamVjdHMvTUVUQS9XZWJHTUUvbm9kZV9tb2R1bGVzL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvV29ya3NwYWNlcy9Xb3Jrc3BhY2VzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xyXG5cclxudmFyIEN5UGh5QXBwID0gYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJywgW1xyXG4gICAgJ3VpLnJvdXRlcicsXHJcblxyXG4gICAgJ2dtZS5zZXJ2aWNlcycsXHJcblxyXG4gICAgJ2lzaXMudWkuY29tcG9uZW50cycsXHJcblxyXG4gICAgJ2N5cGh5LmNvbXBvbmVudHMnLFxyXG5cclxuICAgIC8vIGFwcCBzcGVjaWZpYyB0ZW1wbGF0ZXNcclxuICAgICdjeXBoeS5kZWZhdWx0LnRlbXBsYXRlcydcclxuXSlcclxuICAgIC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIEZvciBhbnkgdW5tYXRjaGVkIHVybCwgcmVkaXJlY3QgdG8gL3dvcmtzcGFjZXNcclxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvaW5kZXgnKTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIE5vdyBzZXQgdXAgdGhlIHN0YXRlc1xyXG4gICAgICAgICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAgICAgICAgIC5zdGF0ZSgnaW5kZXgnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2luZGV4XCJcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCd3b3Jrc3BhY2VzJywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcIi93b3Jrc3BhY2VzXCIsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvV29ya3NwYWNlcy5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIldvcmtzcGFjZXNDb250cm9sbGVyXCJcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCd3b3Jrc3BhY2VEZXRhaWxzJywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcIi93b3Jrc3BhY2VEZXRhaWxzLzp3b3Jrc3BhY2VJZFwiLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL2RlZmF1bHQvdGVtcGxhdGVzL1dvcmtzcGFjZURldGFpbHMuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlclwiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5ydW4oZnVuY3Rpb24gKCRzdGF0ZSwgRGF0YVN0b3JlU2VydmljZSwgUHJvamVjdFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIGNvbm5lY3Rpb25JZCA9ICdteS1kYi1jb25uZWN0aW9uLWlkJztcclxuXHJcbiAgICAgICAgRGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZShjb25uZWN0aW9uSWQsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWV9KVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBzZWxlY3QgZGVmYXVsdCBwcm9qZWN0IGFuZCBicmFuY2ggKG1hc3RlcilcclxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9qZWN0U2VydmljZS5zZWxlY3RQcm9qZWN0KGNvbm5lY3Rpb25JZCwgJ0FETUVkaXRvcicpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuXHJcbnJlcXVpcmUoJy4vdmlld3MvV29ya3NwYWNlcy9Xb3Jrc3BhY2VzQ29udHJvbGxlcicpO1xyXG5yZXF1aXJlKCcuL3ZpZXdzL1dvcmtzcGFjZURldGFpbHMvV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXInKTtcclxuXHJcbi8vIEZJWE1FOiByZW1vdmUgdGhpcyBwYXJ0LCBqdXN0IGZvciB0ZXN0aW5nIHRvIG92ZXJyaWRlIHRoZSB3b3Jrc3BhY2Ugc2VydmljZVxyXG4vL3JlcXVpcmUoJ2NoYW5jZScpO1xyXG4vL0N5UGh5QXBwLnNlcnZpY2UoJ1dvcmtzcGFjZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsICR0aW1lb3V0KSB7XHJcbi8vICAgIHZhciBzZWxmID0gdGhpcyxcclxuLy8gICAgICAgIHdvcmtzcGFjZVVwZGF0ZUxpc3RlbmVyO1xyXG4vL1xyXG4vLyAgICB0aGlzLmRlbGV0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCB3b3Jrc3BhY2VJZCkge1xyXG4vLyAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4vLyAgICAgICAgICAgIHdvcmtzcGFjZVVwZGF0ZUxpc3RlbmVyKHtcclxuLy8gICAgICAgICAgICAgICAgaWQ6IHdvcmtzcGFjZUlkLFxyXG4vLyAgICAgICAgICAgICAgICB0eXBlOiAndW5sb2FkJyxcclxuLy8gICAgICAgICAgICAgICAgZGF0YTogbnVsbFxyXG4vLyAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgfSwgNDAwKTtcclxuLy8gICAgfTtcclxuLy9cclxuLy8gICAgdGhpcy5kdXBsaWNhdGVXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoY29udGV4dCwgb3RoZXJXb3Jrc3BhY2VJZCkge1xyXG4vLyAgICAgICAgY29uc29sZS5sb2coJ05vdCBpbXBsZW1lbnRlZC4nLCBvdGhlcldvcmtzcGFjZUlkKTtcclxuLy8gICAgfTtcclxuLy9cclxuLy8gICAgdGhpcy5jcmVhdGVXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoY29udGV4dCwgZGF0YSkge1xyXG4vLyAgICAgICAgY29uc29sZS5sb2coJ05vdCBpbXBsZW1lbnRlZC4nLCBkYXRhKTtcclxuLy8gICAgfTtcclxuLy9cclxuLy8gICAgdGhpcy53YXRjaFdvcmtzcGFjZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuLy8gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbi8vICAgICAgICAgICAgaSxcclxuLy8gICAgICAgICAgICBudW1JdGVtcyxcclxuLy8gICAgICAgICAgICBkYXRhID0ge1xyXG4vLyAgICAgICAgICAgICAgICByZWdpb25JZDogJ3JlZ2lvbl9tb2NrSWQnLFxyXG4vLyAgICAgICAgICAgICAgICB3b3Jrc3BhY2VzOiB7fSAvLyB3b3Jrc3BhY2UgPSB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+fVxyXG4vLyAgICAgICAgICAgIH07XHJcbi8vXHJcbi8vICAgICAgICB3b3Jrc3BhY2VVcGRhdGVMaXN0ZW5lciA9IHVwZGF0ZUxpc3RlbmVyO1xyXG4vL1xyXG4vLyAgICAgICAgc2VsZi5jaGFuY2UgPSBuZXcgQ2hhbmNlKCk7XHJcbi8vICAgICAgICBudW1JdGVtcyA9IHNlbGYuY2hhbmNlLmludGVnZXIoe21pbjogMiwgbWF4OiAxNX0pO1xyXG4vL1xyXG4vLyAgICAgICAgZm9yIChpID0gMDsgaSA8IG51bUl0ZW1zOyBpICs9IDEpIHtcclxuLy8gICAgICAgICAgICBkYXRhLndvcmtzcGFjZXNbaV0gPSB7XHJcbi8vICAgICAgICAgICAgICAgIGlkOiBpLFxyXG4vLyAgICAgICAgICAgICAgICBuYW1lOiBzZWxmLmNoYW5jZS5uYW1lKCksXHJcbi8vICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzZWxmLmNoYW5jZS5zZW50ZW5jZSgpXHJcbi8vICAgICAgICAgICAgfTtcclxuLy8gICAgICAgIH1cclxuLy9cclxuLy8gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuLy8gICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7XHJcbi8vICAgICAgICAgICAgICAgIGlkOiAndXBkYXRlXzEnLFxyXG4vLyAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXHJcbi8vICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuLy8gICAgICAgICAgICAgICAgICAgIGlkOiAndXBkYXRlXzEnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0NyZWF0ZWQgZWxzZXdoZXJlJyxcclxuLy8gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTmV3IFdvcmtzcGFjZSBmcm9tIHVwZGF0ZSBsaXN0ZW5lcidcclxuLy8gICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgfSwgMjUwMCk7XHJcbi8vXHJcbi8vICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4vL1xyXG4vLyAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbi8vICAgIH07XHJcbi8vXHJcbi8vfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcpXHJcbiAgICAuY29udHJvbGxlcignV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyJyk7XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJylcclxuICAgIC5jb250cm9sbGVyKCdXb3Jrc3BhY2VzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3Jrc3BhY2VzQ29udHJvbGxlcicpO1xyXG4gICAgfSk7Il19

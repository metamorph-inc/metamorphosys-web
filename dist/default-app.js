(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular, console, window, require*/

var CyPhyApp = angular.module('CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.default.templates'
])
    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';
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
    .controller('WorkspaceDetailsController', function ($scope, $state) {
        'use strict';
        var workspaceId = $state.params.workspaceId.replace(/-/g, '/');
        console.log('WorkspaceDetailsController', workspaceId);
        //debugger;
    });
},{}],3:[function(require,module,exports){
/*globals angular, console */

angular.module('CyPhyApp')
    .controller('WorkspacesController', function ($scope) {
        'use strict';

        console.log('WorkspacesController');
    });
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxHSVRcXHdlYmdtZS1jeXBoeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvZGVmYXVsdC9hcHAuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9hcHAvZGVmYXVsdC92aWV3cy9Xb3Jrc3BhY2VEZXRhaWxzL1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvV29ya3NwYWNlcy9Xb3Jrc3BhY2VzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIHdpbmRvdywgcmVxdWlyZSovXHJcblxyXG52YXIgQ3lQaHlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnLCBbXHJcbiAgICAndWkucm91dGVyJyxcclxuXHJcbiAgICAnZ21lLnNlcnZpY2VzJyxcclxuXHJcbiAgICAnaXNpcy51aS5jb21wb25lbnRzJyxcclxuXHJcbiAgICAnY3lwaHkuY29tcG9uZW50cycsXHJcblxyXG4gICAgLy8gYXBwIHNwZWNpZmljIHRlbXBsYXRlc1xyXG4gICAgJ2N5cGh5LmRlZmF1bHQudGVtcGxhdGVzJ1xyXG5dKVxyXG4gICAgLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICAvLyBGb3IgYW55IHVubWF0Y2hlZCB1cmwsIHJlZGlyZWN0IHRvIC93b3Jrc3BhY2VzXHJcbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL2luZGV4Jyk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBOb3cgc2V0IHVwIHRoZSBzdGF0ZXNcclxuICAgICAgICAkc3RhdGVQcm92aWRlclxyXG4gICAgICAgICAgICAuc3RhdGUoJ2luZGV4Jywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcIi9pbmRleFwiXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGF0ZSgnd29ya3NwYWNlcycsIHtcclxuICAgICAgICAgICAgICAgIHVybDogXCIvd29ya3NwYWNlc1wiLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL2RlZmF1bHQvdGVtcGxhdGVzL1dvcmtzcGFjZXMuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJXb3Jrc3BhY2VzQ29udHJvbGxlclwiXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGF0ZSgnd29ya3NwYWNlRGV0YWlscycsIHtcclxuICAgICAgICAgICAgICAgIHVybDogXCIvd29ya3NwYWNlRGV0YWlscy86d29ya3NwYWNlSWRcIixcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9kZWZhdWx0L3RlbXBsYXRlcy9Xb3Jrc3BhY2VEZXRhaWxzLmh0bWxcIixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXJcIlxyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0pXHJcbiAgICAucnVuKGZ1bmN0aW9uICgkc3RhdGUsIERhdGFTdG9yZVNlcnZpY2UsIFByb2plY3RTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBjb25uZWN0aW9uSWQgPSAnbXktZGItY29ubmVjdGlvbi1pZCc7XHJcblxyXG4gICAgICAgIERhdGFTdG9yZVNlcnZpY2UuY29ubmVjdFRvRGF0YWJhc2UoY29ubmVjdGlvbklkLCB7aG9zdDogd2luZG93LmxvY2F0aW9uLmJhc2VuYW1lfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gc2VsZWN0IGRlZmF1bHQgcHJvamVjdCBhbmQgYnJhbmNoIChtYXN0ZXIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvamVjdFNlcnZpY2Uuc2VsZWN0UHJvamVjdChjb25uZWN0aW9uSWQsICdBRE1FZGl0b3InKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcblxyXG5yZXF1aXJlKCcuL3ZpZXdzL1dvcmtzcGFjZXMvV29ya3NwYWNlc0NvbnRyb2xsZXInKTtcclxucmVxdWlyZSgnLi92aWV3cy9Xb3Jrc3BhY2VEZXRhaWxzL1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyJyk7XHJcblxyXG4vLyBGSVhNRTogcmVtb3ZlIHRoaXMgcGFydCwganVzdCBmb3IgdGVzdGluZyB0byBvdmVycmlkZSB0aGUgd29ya3NwYWNlIHNlcnZpY2VcclxuLy9yZXF1aXJlKCdjaGFuY2UnKTtcclxuLy9DeVBoeUFwcC5zZXJ2aWNlKCdXb3Jrc3BhY2VTZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCAkdGltZW91dCkge1xyXG4vLyAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbi8vICAgICAgICB3b3Jrc3BhY2VVcGRhdGVMaXN0ZW5lcjtcclxuLy9cclxuLy8gICAgdGhpcy5kZWxldGVXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoY29udGV4dCwgd29ya3NwYWNlSWQpIHtcclxuLy8gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuLy8gICAgICAgICAgICB3b3Jrc3BhY2VVcGRhdGVMaXN0ZW5lcih7XHJcbi8vICAgICAgICAgICAgICAgIGlkOiB3b3Jrc3BhY2VJZCxcclxuLy8gICAgICAgICAgICAgICAgdHlwZTogJ3VubG9hZCcsXHJcbi8vICAgICAgICAgICAgICAgIGRhdGE6IG51bGxcclxuLy8gICAgICAgICAgICB9KTtcclxuLy8gICAgICAgIH0sIDQwMCk7XHJcbi8vICAgIH07XHJcbi8vXHJcbi8vICAgIHRoaXMuZHVwbGljYXRlV29ya3NwYWNlID0gZnVuY3Rpb24gKGNvbnRleHQsIG90aGVyV29ya3NwYWNlSWQpIHtcclxuLy8gICAgICAgIGNvbnNvbGUubG9nKCdOb3QgaW1wbGVtZW50ZWQuJywgb3RoZXJXb3Jrc3BhY2VJZCk7XHJcbi8vICAgIH07XHJcbi8vXHJcbi8vICAgIHRoaXMuY3JlYXRlV29ya3NwYWNlID0gZnVuY3Rpb24gKGNvbnRleHQsIGRhdGEpIHtcclxuLy8gICAgICAgIGNvbnNvbGUubG9nKCdOb3QgaW1wbGVtZW50ZWQuJywgZGF0YSk7XHJcbi8vICAgIH07XHJcbi8vXHJcbi8vICAgIHRoaXMud2F0Y2hXb3Jrc3BhY2VzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbi8vICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4vLyAgICAgICAgICAgIGksXHJcbi8vICAgICAgICAgICAgbnVtSXRlbXMsXHJcbi8vICAgICAgICAgICAgZGF0YSA9IHtcclxuLy8gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdyZWdpb25fbW9ja0lkJyxcclxuLy8gICAgICAgICAgICAgICAgd29ya3NwYWNlczoge30gLy8gd29ya3NwYWNlID0ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPn1cclxuLy8gICAgICAgICAgICB9O1xyXG4vL1xyXG4vLyAgICAgICAgd29ya3NwYWNlVXBkYXRlTGlzdGVuZXIgPSB1cGRhdGVMaXN0ZW5lcjtcclxuLy9cclxuLy8gICAgICAgIHNlbGYuY2hhbmNlID0gbmV3IENoYW5jZSgpO1xyXG4vLyAgICAgICAgbnVtSXRlbXMgPSBzZWxmLmNoYW5jZS5pbnRlZ2VyKHttaW46IDIsIG1heDogMTV9KTtcclxuLy9cclxuLy8gICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1JdGVtczsgaSArPSAxKSB7XHJcbi8vICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW2ldID0ge1xyXG4vLyAgICAgICAgICAgICAgICBpZDogaSxcclxuLy8gICAgICAgICAgICAgICAgbmFtZTogc2VsZi5jaGFuY2UubmFtZSgpLFxyXG4vLyAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogc2VsZi5jaGFuY2Uuc2VudGVuY2UoKVxyXG4vLyAgICAgICAgICAgIH07XHJcbi8vICAgICAgICB9XHJcbi8vXHJcbi8vICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbi8vICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe1xyXG4vLyAgICAgICAgICAgICAgICBpZDogJ3VwZGF0ZV8xJyxcclxuLy8gICAgICAgICAgICAgICAgdHlwZTogJ2xvYWQnLFxyXG4vLyAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbi8vICAgICAgICAgICAgICAgICAgICBpZDogJ3VwZGF0ZV8xJyxcclxuLy8gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdDcmVhdGVkIGVsc2V3aGVyZScsXHJcbi8vICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ05ldyBXb3Jrc3BhY2UgZnJvbSB1cGRhdGUgbGlzdGVuZXInXHJcbi8vICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICB9KTtcclxuLy8gICAgICAgIH0sIDI1MDApO1xyXG4vL1xyXG4vLyAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuLy9cclxuLy8gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4vLyAgICB9O1xyXG4vL1xyXG4vL30pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1dvcmtzcGFjZURldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciB3b3Jrc3BhY2VJZCA9ICRzdGF0ZS5wYXJhbXMud29ya3NwYWNlSWQucmVwbGFjZSgvLS9nLCAnLycpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicsIHdvcmtzcGFjZUlkKTtcclxuICAgICAgICAvL2RlYnVnZ2VyO1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcpXHJcbiAgICAuY29udHJvbGxlcignV29ya3NwYWNlc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnV29ya3NwYWNlc0NvbnRyb2xsZXInKTtcclxuICAgIH0pOyJdfQ==

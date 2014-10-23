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
        $scope.dataModel = {
            workspaceId: workspaceId
        };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL2RlZmF1bHQvYXBwLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvYXBwL2RlZmF1bHQvdmlld3MvV29ya3NwYWNlRGV0YWlscy9Xb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlci5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2FwcC9kZWZhdWx0L3ZpZXdzL1dvcmtzcGFjZXMvV29ya3NwYWNlc0NvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCB3aW5kb3csIHJlcXVpcmUqL1xyXG5cclxudmFyIEN5UGh5QXBwID0gYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJywgW1xyXG4gICAgJ3VpLnJvdXRlcicsXHJcblxyXG4gICAgJ2dtZS5zZXJ2aWNlcycsXHJcblxyXG4gICAgJ2lzaXMudWkuY29tcG9uZW50cycsXHJcblxyXG4gICAgJ2N5cGh5LmNvbXBvbmVudHMnLFxyXG5cclxuICAgIC8vIGFwcCBzcGVjaWZpYyB0ZW1wbGF0ZXNcclxuICAgICdjeXBoeS5kZWZhdWx0LnRlbXBsYXRlcydcclxuXSlcclxuICAgIC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgLy8gRm9yIGFueSB1bm1hdGNoZWQgdXJsLCByZWRpcmVjdCB0byAvd29ya3NwYWNlc1xyXG4gICAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9pbmRleCcpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gTm93IHNldCB1cCB0aGUgc3RhdGVzXHJcbiAgICAgICAgJHN0YXRlUHJvdmlkZXJcclxuICAgICAgICAgICAgLnN0YXRlKCdpbmRleCcsIHtcclxuICAgICAgICAgICAgICAgIHVybDogXCIvaW5kZXhcIlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ3dvcmtzcGFjZXMnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL3dvcmtzcGFjZXNcIixcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9kZWZhdWx0L3RlbXBsYXRlcy9Xb3Jrc3BhY2VzLmh0bWxcIixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiV29ya3NwYWNlc0NvbnRyb2xsZXJcIlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ3dvcmtzcGFjZURldGFpbHMnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL3dvcmtzcGFjZURldGFpbHMvOndvcmtzcGFjZUlkXCIsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvZGVmYXVsdC90ZW1wbGF0ZXMvV29ya3NwYWNlRGV0YWlscy5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIldvcmtzcGFjZURldGFpbHNDb250cm9sbGVyXCJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgLnJ1bihmdW5jdGlvbiAoJHN0YXRlLCBEYXRhU3RvcmVTZXJ2aWNlLCBQcm9qZWN0U2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgY29ubmVjdGlvbklkID0gJ215LWRiLWNvbm5lY3Rpb24taWQnO1xyXG5cclxuICAgICAgICBEYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKGNvbm5lY3Rpb25JZCwge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZX0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIHNlbGVjdCBkZWZhdWx0IHByb2plY3QgYW5kIGJyYW5jaCAobWFzdGVyKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoY29ubmVjdGlvbklkLCAnQURNRWRpdG9yJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG5cclxucmVxdWlyZSgnLi92aWV3cy9Xb3Jrc3BhY2VzL1dvcmtzcGFjZXNDb250cm9sbGVyJyk7XHJcbnJlcXVpcmUoJy4vdmlld3MvV29ya3NwYWNlRGV0YWlscy9Xb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicpO1xyXG5cclxuLy8gRklYTUU6IHJlbW92ZSB0aGlzIHBhcnQsIGp1c3QgZm9yIHRlc3RpbmcgdG8gb3ZlcnJpZGUgdGhlIHdvcmtzcGFjZSBzZXJ2aWNlXHJcbi8vcmVxdWlyZSgnY2hhbmNlJyk7XHJcbi8vQ3lQaHlBcHAuc2VydmljZSgnV29ya3NwYWNlU2VydmljZScsIGZ1bmN0aW9uICgkcSwgJHRpbWVvdXQpIHtcclxuLy8gICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4vLyAgICAgICAgd29ya3NwYWNlVXBkYXRlTGlzdGVuZXI7XHJcbi8vXHJcbi8vICAgIHRoaXMuZGVsZXRlV29ya3NwYWNlID0gZnVuY3Rpb24gKGNvbnRleHQsIHdvcmtzcGFjZUlkKSB7XHJcbi8vICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbi8vICAgICAgICAgICAgd29ya3NwYWNlVXBkYXRlTGlzdGVuZXIoe1xyXG4vLyAgICAgICAgICAgICAgICBpZDogd29ya3NwYWNlSWQsXHJcbi8vICAgICAgICAgICAgICAgIHR5cGU6ICd1bmxvYWQnLFxyXG4vLyAgICAgICAgICAgICAgICBkYXRhOiBudWxsXHJcbi8vICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICB9LCA0MDApO1xyXG4vLyAgICB9O1xyXG4vL1xyXG4vLyAgICB0aGlzLmR1cGxpY2F0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCBvdGhlcldvcmtzcGFjZUlkKSB7XHJcbi8vICAgICAgICBjb25zb2xlLmxvZygnTm90IGltcGxlbWVudGVkLicsIG90aGVyV29ya3NwYWNlSWQpO1xyXG4vLyAgICB9O1xyXG4vL1xyXG4vLyAgICB0aGlzLmNyZWF0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCBkYXRhKSB7XHJcbi8vICAgICAgICBjb25zb2xlLmxvZygnTm90IGltcGxlbWVudGVkLicsIGRhdGEpO1xyXG4vLyAgICB9O1xyXG4vL1xyXG4vLyAgICB0aGlzLndhdGNoV29ya3NwYWNlcyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB1cGRhdGVMaXN0ZW5lcikge1xyXG4vLyAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuLy8gICAgICAgICAgICBpLFxyXG4vLyAgICAgICAgICAgIG51bUl0ZW1zLFxyXG4vLyAgICAgICAgICAgIGRhdGEgPSB7XHJcbi8vICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAncmVnaW9uX21vY2tJZCcsXHJcbi8vICAgICAgICAgICAgICAgIHdvcmtzcGFjZXM6IHt9IC8vIHdvcmtzcGFjZSA9IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz59XHJcbi8vICAgICAgICAgICAgfTtcclxuLy9cclxuLy8gICAgICAgIHdvcmtzcGFjZVVwZGF0ZUxpc3RlbmVyID0gdXBkYXRlTGlzdGVuZXI7XHJcbi8vXHJcbi8vICAgICAgICBzZWxmLmNoYW5jZSA9IG5ldyBDaGFuY2UoKTtcclxuLy8gICAgICAgIG51bUl0ZW1zID0gc2VsZi5jaGFuY2UuaW50ZWdlcih7bWluOiAyLCBtYXg6IDE1fSk7XHJcbi8vXHJcbi8vICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtSXRlbXM7IGkgKz0gMSkge1xyXG4vLyAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1tpXSA9IHtcclxuLy8gICAgICAgICAgICAgICAgaWQ6IGksXHJcbi8vICAgICAgICAgICAgICAgIG5hbWU6IHNlbGYuY2hhbmNlLm5hbWUoKSxcclxuLy8gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHNlbGYuY2hhbmNlLnNlbnRlbmNlKClcclxuLy8gICAgICAgICAgICB9O1xyXG4vLyAgICAgICAgfVxyXG4vL1xyXG4vLyAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4vLyAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtcclxuLy8gICAgICAgICAgICAgICAgaWQ6ICd1cGRhdGVfMScsXHJcbi8vICAgICAgICAgICAgICAgIHR5cGU6ICdsb2FkJyxcclxuLy8gICAgICAgICAgICAgICAgZGF0YToge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgaWQ6ICd1cGRhdGVfMScsXHJcbi8vICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQ3JlYXRlZCBlbHNld2hlcmUnLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdOZXcgV29ya3NwYWNlIGZyb20gdXBkYXRlIGxpc3RlbmVyJ1xyXG4vLyAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICB9LCAyNTAwKTtcclxuLy9cclxuLy8gICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbi8vXHJcbi8vICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuLy8gICAgfTtcclxuLy9cclxuLy99KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJylcclxuICAgIC5jb250cm9sbGVyKCdXb3Jrc3BhY2VEZXRhaWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgd29ya3NwYWNlSWQgPSAkc3RhdGUucGFyYW1zLndvcmtzcGFjZUlkLnJlcGxhY2UoLy0vZywgJy8nKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnV29ya3NwYWNlRGV0YWlsc0NvbnRyb2xsZXInLCB3b3Jrc3BhY2VJZCk7XHJcbiAgICAgICAgJHNjb3BlLmRhdGFNb2RlbCA9IHtcclxuICAgICAgICAgICAgd29ya3NwYWNlSWQ6IHdvcmtzcGFjZUlkXHJcbiAgICAgICAgfTtcclxuICAgICAgICAvL2RlYnVnZ2VyO1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcpXHJcbiAgICAuY29udHJvbGxlcignV29ya3NwYWNlc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnV29ya3NwYWNlc0NvbnRyb2xsZXInKTtcclxuICAgIH0pOyJdfQ==

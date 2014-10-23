(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL3NlcnZpY2V0ZXN0L2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgc2V0VGltZW91dCovXHJcblxyXG52YXIgQ3lQaHlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnLCBbXHJcbiAgICAnZ21lLnNlcnZpY2VzJyxcclxuICAgICdjeXBoeS5jb21wb25lbnRzJ1xyXG5dKVxyXG4gICAgLnJ1bihmdW5jdGlvbiAoRGF0YVN0b3JlU2VydmljZSwgUHJvamVjdFNlcnZpY2UsIEJyYW5jaFNlcnZpY2UsIE5vZGVTZXJ2aWNlLCBXb3Jrc3BhY2VTZXJ2aWNlLCBDb21wb25lbnRTZXJ2aWNlLCBEZXNpZ25TZXJ2aWNlLCBUZXN0QmVuY2hTZXJ2aWNlKSB7XHJcbiAgICAgICAgRGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZSgnbXktZGItY29ubmVjdGlvbi1pZCcsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWV9KVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIC4uLicpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoJ215LWRiLWNvbm5lY3Rpb24taWQnLCAnQURNRWRpdG9yJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQcm9qZWN0IHNlbGVjdGVkLi4uJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQnJhbmNoU2VydmljZS5zZWxlY3RCcmFuY2goJ215LWRiLWNvbm5lY3Rpb24taWQnLCAnbWFzdGVyJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCcmFuY2ggc2VsZWN0ZWQuLi4nKTtcclxuICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbi8vICAgICAgICBCcmFuY2hTZXJ2aWNlLm9uKHtkYjogJ215LWRiLWNvbm5lY3Rpb24taWQnLCBwcm9qZWN0SWQ6ICdBRE1FZGl0b3InLCBicmFuY2hJZDogJ21hc3Rlcid9LCAnaW5pdGlhbGl6ZScsIGZ1bmN0aW9uIChjdXJyZW50Q29udGV4dCkge1xyXG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCcmFuY2hTZXJ2aWNlIGluaXRpYWxpemVkLi4nKTtcclxuLy8gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBOb2RlU2VydmljZS5vbignbXktZGItY29ubmVjdGlvbi1pZCcsICdpbml0aWFsaXplJywgZnVuY3Rpb24gKGN1cnJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHZhciB0ZXN0Q29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAnbXktZGItY29ubmVjdGlvbi1pZCcsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ1Rlc3RSZWdpb24nXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hXb3Jrc3BhY2VzKHRlc3RDb250ZXh0LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoV29ya3NwYWNlczonLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBkYXRhLndvcmtzcGFjZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mQ29tcG9uZW50cyh0ZXN0Q29udGV4dCwga2V5LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaE51bWJlck9mQ29tcG9uZW50czonLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZEZXNpZ25zKHRlc3RDb250ZXh0LCBrZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoTnVtYmVyT2ZEZXNpZ25zOicsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzKHRlc3RDb250ZXh0LCBrZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlczonLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBDb21wb25lbnRTZXJ2aWNlLndhdGNoQ29tcG9uZW50cyh0ZXN0Q29udGV4dCwga2V5LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjS2V5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaENvbXBvbmVudHM6JywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjS2V5IGluIGRhdGEuY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDb21wb25lbnRTZXJ2aWNlLndhdGNoQ29tcG9uZW50RGV0YWlscyh0ZXN0Q29udGV4dCwgY0tleSwgZnVuY3Rpb24gKGluZm8pIHsgY29uc29sZS53YXJuKGluZm8pOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hDb21wb25lbnREZXRhaWxzOicsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgRGVzaWduU2VydmljZS53YXRjaERlc2lnbnModGVzdENvbnRleHQsIGtleSwgZnVuY3Rpb24gKGluZm8pIHsgY29uc29sZS53YXJuKGluZm8pOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZEtleTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hEZXNpZ25zOicsIGRhdGEpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjS2V5IGluIGRhdGEuY29tcG9uZW50cykge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnREZXRhaWxzKHRlc3RDb250ZXh0LCBjS2V5LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3dhdGNoQ29tcG9uZW50RGV0YWlsczonLCBkYXRhKTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVGVzdEJlbmNoU2VydmljZS53YXRjaFRlc3RCZW5jaGVzKHRlc3RDb250ZXh0LCBrZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRLZXk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCd3YXRjaFRlc3RCZW5jaGVzOicsIGRhdGEpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjS2V5IGluIGRhdGEuY29tcG9uZW50cykge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnREZXRhaWxzKHRlc3RDb250ZXh0LCBjS2V5LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3dhdGNoQ29tcG9uZW50RGV0YWlsczonLCBkYXRhKTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7IC8vIENhbiBvbmx5IHdhdGNoIHRoZSBhYm92ZSBmb3Igb25lIHdvcmstc3BhY2UgKHVubGVzcyBjb250ZXh0IGlzIG1vZGlmaWVkKS5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4iXX0=

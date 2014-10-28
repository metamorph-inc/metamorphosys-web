(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular, console, setTimeout*/

var CyPhyApp = angular.module('CyPhyApp', [
    'gme.services',
    'cyphy.components'
])
    .run(function (dataStoreService, projectService, branchService, nodeService, workspaceService, componentService, designService, testBenchService) {
        'use strict';
        dataStoreService.connectToDatabase('my-db-connection-id', {host: window.location.basename})
            .then(function () {
                console.log('Connected ...');
                return projectService.selectProject('my-db-connection-id', 'ADMEditor');
            })
            .then(function () {
                console.log('Project selected...');
                return branchService.selectBranch('my-db-connection-id', 'master');
            })
            .then(function () {
                console.log('Branch selected...');
            }).catch(function (reason) {
                console.error(reason);
            });

//        branchService.on({db: 'my-db-connection-id', projectId: 'ADMEditor', branchId: 'master'}, 'initialize', function (currentContext) {
//            console.log('branchService initialized..');
//        });

        nodeService.on('my-db-connection-id', 'initialize', function (currentContext) {
            var testContext = {
                db: 'my-db-connection-id',
                regionId: 'TestRegion'
            };
            workspaceService.watchWorkspaces(testContext, function (info) { console.warn(info); })
                .then(function (data) {
                    var key;
                    console.log('watchWorkspaces:', data);
                    for (key in data.workspaces) {
                        workspaceService.watchNumberOfComponents(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                console.log('watchNumberOfComponents:', data);
                            });
                        workspaceService.watchNumberOfDesigns(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                console.log('watchNumberOfDesigns:', data);
                            });
                        workspaceService.watchNumberOfTestBenches(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                console.log('watchNumberOfTestBenches:', data);
                            });
                        componentService.watchComponents(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                var cKey;
                                console.log('watchComponents:', data);
                                for (cKey in data.components) {
                                    componentService.watchInterfaces(testContext, cKey, function (info) { console.warn(info); })
                                        .then(function (data) {
                                            console.log('watchComponentDetails:', data);
                                    });
                                }
                            });
                        designService.watchDesigns(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                var dKey;
                                console.log('watchDesigns:', data);
//                                for (cKey in data.components) {
//                                    componentService.watchComponentDetails(testContext, cKey, function (info) { console.warn(info); })
//                                        .then(function (data) {
//                                            console.warn('watchComponentDetails:', data);
//                                        });
//                                }
                            });
                        testBenchService.watchTestBenches(testContext, key, function (info) { console.warn(info); })
                            .then(function (data) {
                                var dKey;
                                console.warn('watchTestBenches:', data);
//                                for (cKey in data.components) {
//                                    componentService.watchComponentDetails(testContext, cKey, function (info) { console.warn(info); })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL3NlcnZpY2V0ZXN0L2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBzZXRUaW1lb3V0Ki9cclxuXHJcbnZhciBDeVBoeUFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcsIFtcclxuICAgICdnbWUuc2VydmljZXMnLFxyXG4gICAgJ2N5cGh5LmNvbXBvbmVudHMnXHJcbl0pXHJcbiAgICAucnVuKGZ1bmN0aW9uIChkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSwgYnJhbmNoU2VydmljZSwgbm9kZVNlcnZpY2UsIHdvcmtzcGFjZVNlcnZpY2UsIGNvbXBvbmVudFNlcnZpY2UsIGRlc2lnblNlcnZpY2UsIHRlc3RCZW5jaFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgZGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZSgnbXktZGItY29ubmVjdGlvbi1pZCcsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWV9KVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIC4uLicpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoJ215LWRiLWNvbm5lY3Rpb24taWQnLCAnQURNRWRpdG9yJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQcm9qZWN0IHNlbGVjdGVkLi4uJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYnJhbmNoU2VydmljZS5zZWxlY3RCcmFuY2goJ215LWRiLWNvbm5lY3Rpb24taWQnLCAnbWFzdGVyJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCcmFuY2ggc2VsZWN0ZWQuLi4nKTtcclxuICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbi8vICAgICAgICBicmFuY2hTZXJ2aWNlLm9uKHtkYjogJ215LWRiLWNvbm5lY3Rpb24taWQnLCBwcm9qZWN0SWQ6ICdBRE1FZGl0b3InLCBicmFuY2hJZDogJ21hc3Rlcid9LCAnaW5pdGlhbGl6ZScsIGZ1bmN0aW9uIChjdXJyZW50Q29udGV4dCkge1xyXG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKCdicmFuY2hTZXJ2aWNlIGluaXRpYWxpemVkLi4nKTtcclxuLy8gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBub2RlU2VydmljZS5vbignbXktZGItY29ubmVjdGlvbi1pZCcsICdpbml0aWFsaXplJywgZnVuY3Rpb24gKGN1cnJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHZhciB0ZXN0Q29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAnbXktZGItY29ubmVjdGlvbi1pZCcsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ1Rlc3RSZWdpb24nXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hXb3Jrc3BhY2VzKHRlc3RDb250ZXh0LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoV29ya3NwYWNlczonLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBkYXRhLndvcmtzcGFjZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mQ29tcG9uZW50cyh0ZXN0Q29udGV4dCwga2V5LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaE51bWJlck9mQ29tcG9uZW50czonLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZEZXNpZ25zKHRlc3RDb250ZXh0LCBrZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoTnVtYmVyT2ZEZXNpZ25zOicsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzKHRlc3RDb250ZXh0LCBrZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlczonLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLndhdGNoQ29tcG9uZW50cyh0ZXN0Q29udGV4dCwga2V5LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjS2V5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaENvbXBvbmVudHM6JywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjS2V5IGluIGRhdGEuY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLndhdGNoSW50ZXJmYWNlcyh0ZXN0Q29udGV4dCwgY0tleSwgZnVuY3Rpb24gKGluZm8pIHsgY29uc29sZS53YXJuKGluZm8pOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hDb21wb25lbnREZXRhaWxzOicsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaERlc2lnbnModGVzdENvbnRleHQsIGtleSwgZnVuY3Rpb24gKGluZm8pIHsgY29uc29sZS53YXJuKGluZm8pOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZEtleTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hEZXNpZ25zOicsIGRhdGEpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjS2V5IGluIGRhdGEuY29tcG9uZW50cykge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnREZXRhaWxzKHRlc3RDb250ZXh0LCBjS2V5LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3dhdGNoQ29tcG9uZW50RGV0YWlsczonLCBkYXRhKTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS53YXRjaFRlc3RCZW5jaGVzKHRlc3RDb250ZXh0LCBrZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRLZXk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCd3YXRjaFRlc3RCZW5jaGVzOicsIGRhdGEpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjS2V5IGluIGRhdGEuY29tcG9uZW50cykge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnREZXRhaWxzKHRlc3RDb250ZXh0LCBjS2V5LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3dhdGNoQ29tcG9uZW50RGV0YWlsczonLCBkYXRhKTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7IC8vIENhbiBvbmx5IHdhdGNoIHRoZSBhYm92ZSBmb3Igb25lIHdvcmstc3BhY2UgKHVubGVzcyBjb250ZXh0IGlzIG1vZGlmaWVkKS5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4iXX0=

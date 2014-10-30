(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular, console, setTimeout*/

var CyPhyApp = angular.module('CyPhyApp', [
    'gme.services',
    'cyphy.components'
])
    .run(function (dataStoreService, projectService, branchService, nodeService, workspaceService, componentService, designService, testBenchService, pluginService) {
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
            pluginService.testRunPlugin(testContext);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL3NlcnZpY2V0ZXN0L2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIHNldFRpbWVvdXQqL1xyXG5cclxudmFyIEN5UGh5QXBwID0gYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJywgW1xyXG4gICAgJ2dtZS5zZXJ2aWNlcycsXHJcbiAgICAnY3lwaHkuY29tcG9uZW50cydcclxuXSlcclxuICAgIC5ydW4oZnVuY3Rpb24gKGRhdGFTdG9yZVNlcnZpY2UsIHByb2plY3RTZXJ2aWNlLCBicmFuY2hTZXJ2aWNlLCBub2RlU2VydmljZSwgd29ya3NwYWNlU2VydmljZSwgY29tcG9uZW50U2VydmljZSwgZGVzaWduU2VydmljZSwgdGVzdEJlbmNoU2VydmljZSwgcGx1Z2luU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICBkYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKCdteS1kYi1jb25uZWN0aW9uLWlkJywge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZX0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgLi4uJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvamVjdFNlcnZpY2Uuc2VsZWN0UHJvamVjdCgnbXktZGItY29ubmVjdGlvbi1pZCcsICdBRE1FZGl0b3InKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1Byb2plY3Qgc2VsZWN0ZWQuLi4nKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBicmFuY2hTZXJ2aWNlLnNlbGVjdEJyYW5jaCgnbXktZGItY29ubmVjdGlvbi1pZCcsICdtYXN0ZXInKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0JyYW5jaCBzZWxlY3RlZC4uLicpO1xyXG4gICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuLy8gICAgICAgIGJyYW5jaFNlcnZpY2Uub24oe2RiOiAnbXktZGItY29ubmVjdGlvbi1pZCcsIHByb2plY3RJZDogJ0FETUVkaXRvcicsIGJyYW5jaElkOiAnbWFzdGVyJ30sICdpbml0aWFsaXplJywgZnVuY3Rpb24gKGN1cnJlbnRDb250ZXh0KSB7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coJ2JyYW5jaFNlcnZpY2UgaW5pdGlhbGl6ZWQuLicpO1xyXG4vLyAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG5vZGVTZXJ2aWNlLm9uKCdteS1kYi1jb25uZWN0aW9uLWlkJywgJ2luaXRpYWxpemUnLCBmdW5jdGlvbiAoY3VycmVudENvbnRleHQpIHtcclxuICAgICAgICAgICAgdmFyIHRlc3RDb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICdteS1kYi1jb25uZWN0aW9uLWlkJyxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnVGVzdFJlZ2lvbidcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcGx1Z2luU2VydmljZS50ZXN0UnVuUGx1Z2luKHRlc3RDb250ZXh0KTtcclxuICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaFdvcmtzcGFjZXModGVzdENvbnRleHQsIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hXb3Jrc3BhY2VzOicsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGRhdGEud29ya3NwYWNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZDb21wb25lbnRzKHRlc3RDb250ZXh0LCBrZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoTnVtYmVyT2ZDb21wb25lbnRzOicsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hOdW1iZXJPZkRlc2lnbnModGVzdENvbnRleHQsIGtleSwgZnVuY3Rpb24gKGluZm8pIHsgY29uc29sZS53YXJuKGluZm8pOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hOdW1iZXJPZkRlc2lnbnM6JywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mVGVzdEJlbmNoZXModGVzdENvbnRleHQsIGtleSwgZnVuY3Rpb24gKGluZm8pIHsgY29uc29sZS53YXJuKGluZm8pOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzOicsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnRzKHRlc3RDb250ZXh0LCBrZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNLZXk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoQ29tcG9uZW50czonLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNLZXkgaW4gZGF0YS5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKHRlc3RDb250ZXh0LCBjS2V5LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaENvbXBvbmVudERldGFpbHM6JywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWducyh0ZXN0Q29udGV4dCwga2V5LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkS2V5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaERlc2lnbnM6JywgZGF0YSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNLZXkgaW4gZGF0YS5jb21wb25lbnRzKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERldGFpbHModGVzdENvbnRleHQsIGNLZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybignd2F0Y2hDb21wb25lbnREZXRhaWxzOicsIGRhdGEpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLndhdGNoVGVzdEJlbmNoZXModGVzdENvbnRleHQsIGtleSwgZnVuY3Rpb24gKGluZm8pIHsgY29uc29sZS53YXJuKGluZm8pOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZEtleTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3dhdGNoVGVzdEJlbmNoZXM6JywgZGF0YSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNLZXkgaW4gZGF0YS5jb21wb25lbnRzKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERldGFpbHModGVzdENvbnRleHQsIGNLZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybignd2F0Y2hDb21wb25lbnREZXRhaWxzOicsIGRhdGEpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhazsgLy8gQ2FuIG9ubHkgd2F0Y2ggdGhlIGFib3ZlIGZvciBvbmUgd29yay1zcGFjZSAodW5sZXNzIGNvbnRleHQgaXMgbW9kaWZpZWQpLlxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiJdfQ==

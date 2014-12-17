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
            var logger,
              testContext;

            logger = function (info) {
              console.warn(info);
            };

            testContext = {
                db: 'my-db-connection-id',
                regionId: 'TestRegion'
            };
            //pluginService.testRunPlugin(testContext);
            workspaceService.watchWorkspaces(testContext, logger)
                .then(function (data) {
                    var runOnceAlready;

                    console.log('watchWorkspaces:', data);

                    runOnceAlready = false;

                    angular.foreEach(data.workspaces, function(v, key) {

                        if (runOnceAlready === false) {

                          workspaceService.watchNumberOfComponents(testContext, key, logger)
                              .then(function (data) {
                                  console.log('watchNumberOfComponents:', data);
                              });
                          workspaceService.watchNumberOfDesigns(testContext, key, logger)
                              .then(function (data) {
                                  console.log('watchNumberOfDesigns:', data);
                              });
                          workspaceService.watchNumberOfTestBenches(testContext, key, logger)
                              .then(function (data) {
                                  console.log('watchNumberOfTestBenches:', data);
                              });
                          componentService.watchComponents(testContext, key, logger)
                              .then(function (data) {
                                  console.log('watchComponents:', data);
                                  angular.forEach (data.components, function(v, cKey) {
                                      componentService.watchInterfaces(testContext, cKey, logger)
                                          .then(function (data) {
                                              console.log('watchComponentDetails:', data);
                                      });
                                  });
                              });
                          designService.watchDesigns(testContext, key, logger)
                              .then(function (data) {
                                  var dKey;
                                  console.log('watchDesigns:', data);
  //                                for (cKey in data.components) {
  //                                    componentService.watchComponentDetails(testContext, cKey, logger)
  //                                        .then(function (data) {
  //                                            console.warn('watchComponentDetails:', data);
  //                                        });
  //                                }
                              });
                          testBenchService.watchTestBenches(testContext, key, logger)
                              .then(function (data) {
                                  var dKey;
                                  console.warn('watchTestBenches:', data);
  //                                for (cKey in data.components) {
  //                                    componentService.watchComponentDetails(testContext, cKey, logger)
  //                                        .then(function (data) {
  //                                            console.warn('watchComponentDetails:', data);
  //                                        });
  //                                }
                              });
                        }
                        //break; // Can only watch the above for one work-space (unless context is modified).

                        runOnceAlready = true;
                    });
                });
        });
    });

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL3NlcnZpY2V0ZXN0L2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgc2V0VGltZW91dCovXG5cbnZhciBDeVBoeUFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcsIFtcbiAgICAnZ21lLnNlcnZpY2VzJyxcbiAgICAnY3lwaHkuY29tcG9uZW50cydcbl0pXG4gICAgLnJ1bihmdW5jdGlvbiAoZGF0YVN0b3JlU2VydmljZSwgcHJvamVjdFNlcnZpY2UsIGJyYW5jaFNlcnZpY2UsIG5vZGVTZXJ2aWNlLCB3b3Jrc3BhY2VTZXJ2aWNlLCBjb21wb25lbnRTZXJ2aWNlLCBkZXNpZ25TZXJ2aWNlLCB0ZXN0QmVuY2hTZXJ2aWNlLCBwbHVnaW5TZXJ2aWNlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgZGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZSgnbXktZGItY29ubmVjdGlvbi1pZCcsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWV9KVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgLi4uJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoJ215LWRiLWNvbm5lY3Rpb24taWQnLCAnQURNRWRpdG9yJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQcm9qZWN0IHNlbGVjdGVkLi4uJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJyYW5jaFNlcnZpY2Uuc2VsZWN0QnJhbmNoKCdteS1kYi1jb25uZWN0aW9uLWlkJywgJ21hc3RlcicpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQnJhbmNoIHNlbGVjdGVkLi4uJyk7XG4gICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuICAgICAgICAgICAgfSk7XG5cbi8vICAgICAgICBicmFuY2hTZXJ2aWNlLm9uKHtkYjogJ215LWRiLWNvbm5lY3Rpb24taWQnLCBwcm9qZWN0SWQ6ICdBRE1FZGl0b3InLCBicmFuY2hJZDogJ21hc3Rlcid9LCAnaW5pdGlhbGl6ZScsIGZ1bmN0aW9uIChjdXJyZW50Q29udGV4dCkge1xuLy8gICAgICAgICAgICBjb25zb2xlLmxvZygnYnJhbmNoU2VydmljZSBpbml0aWFsaXplZC4uJyk7XG4vLyAgICAgICAgfSk7XG5cbiAgICAgICAgbm9kZVNlcnZpY2Uub24oJ215LWRiLWNvbm5lY3Rpb24taWQnLCAnaW5pdGlhbGl6ZScsIGZ1bmN0aW9uIChjdXJyZW50Q29udGV4dCkge1xuICAgICAgICAgICAgdmFyIGxvZ2dlcixcbiAgICAgICAgICAgICAgdGVzdENvbnRleHQ7XG5cbiAgICAgICAgICAgIGxvZ2dlciA9IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihpbmZvKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRlc3RDb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIGRiOiAnbXktZGItY29ubmVjdGlvbi1pZCcsXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdUZXN0UmVnaW9uJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vcGx1Z2luU2VydmljZS50ZXN0UnVuUGx1Z2luKHRlc3RDb250ZXh0KTtcbiAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hXb3Jrc3BhY2VzKHRlc3RDb250ZXh0LCBsb2dnZXIpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bk9uY2VBbHJlYWR5O1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaFdvcmtzcGFjZXM6JywgZGF0YSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcnVuT25jZUFscmVhZHkgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvcmVFYWNoKGRhdGEud29ya3NwYWNlcywgZnVuY3Rpb24odiwga2V5KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydW5PbmNlQWxyZWFkeSA9PT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZDb21wb25lbnRzKHRlc3RDb250ZXh0LCBrZXksIGxvZ2dlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoTnVtYmVyT2ZDb21wb25lbnRzOicsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hOdW1iZXJPZkRlc2lnbnModGVzdENvbnRleHQsIGtleSwgbG9nZ2VyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hOdW1iZXJPZkRlc2lnbnM6JywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mVGVzdEJlbmNoZXModGVzdENvbnRleHQsIGtleSwgbG9nZ2VyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzOicsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnRzKHRlc3RDb250ZXh0LCBrZXksIGxvZ2dlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoQ29tcG9uZW50czonLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2ggKGRhdGEuY29tcG9uZW50cywgZnVuY3Rpb24odiwgY0tleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLndhdGNoSW50ZXJmYWNlcyh0ZXN0Q29udGV4dCwgY0tleSwgbG9nZ2VyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hDb21wb25lbnREZXRhaWxzOicsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWducyh0ZXN0Q29udGV4dCwga2V5LCBsb2dnZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkS2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaERlc2lnbnM6JywgZGF0YSk7XG4gIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNLZXkgaW4gZGF0YS5jb21wb25lbnRzKSB7XG4gIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERldGFpbHModGVzdENvbnRleHQsIGNLZXksIGxvZ2dlcilcbiAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybignd2F0Y2hDb21wb25lbnREZXRhaWxzOicsIGRhdGEpO1xuICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLndhdGNoVGVzdEJlbmNoZXModGVzdENvbnRleHQsIGtleSwgbG9nZ2VyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZEtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3dhdGNoVGVzdEJlbmNoZXM6JywgZGF0YSk7XG4gIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNLZXkgaW4gZGF0YS5jb21wb25lbnRzKSB7XG4gIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERldGFpbHModGVzdENvbnRleHQsIGNLZXksIGxvZ2dlcilcbiAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybignd2F0Y2hDb21wb25lbnREZXRhaWxzOicsIGRhdGEpO1xuICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy9icmVhazsgLy8gQ2FuIG9ubHkgd2F0Y2ggdGhlIGFib3ZlIGZvciBvbmUgd29yay1zcGFjZSAodW5sZXNzIGNvbnRleHQgaXMgbW9kaWZpZWQpLlxuXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5PbmNlQWxyZWFkeSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiJdfQ==

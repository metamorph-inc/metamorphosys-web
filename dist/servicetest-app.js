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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvc2VydmljZXRlc3QvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBzZXRUaW1lb3V0Ki9cblxudmFyIEN5UGh5QXBwID0gYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJywgW1xuICAgICdnbWUuc2VydmljZXMnLFxuICAgICdjeXBoeS5jb21wb25lbnRzJ1xuXSlcbiAgICAucnVuKGZ1bmN0aW9uIChkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSwgYnJhbmNoU2VydmljZSwgbm9kZVNlcnZpY2UsIHdvcmtzcGFjZVNlcnZpY2UsIGNvbXBvbmVudFNlcnZpY2UsIGRlc2lnblNlcnZpY2UsIHRlc3RCZW5jaFNlcnZpY2UsIHBsdWdpblNlcnZpY2UpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICBkYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKCdteS1kYi1jb25uZWN0aW9uLWlkJywge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZX0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCAuLi4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvamVjdFNlcnZpY2Uuc2VsZWN0UHJvamVjdCgnbXktZGItY29ubmVjdGlvbi1pZCcsICdBRE1FZGl0b3InKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1Byb2plY3Qgc2VsZWN0ZWQuLi4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnJhbmNoU2VydmljZS5zZWxlY3RCcmFuY2goJ215LWRiLWNvbm5lY3Rpb24taWQnLCAnbWFzdGVyJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCcmFuY2ggc2VsZWN0ZWQuLi4nKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XG4gICAgICAgICAgICB9KTtcblxuLy8gICAgICAgIGJyYW5jaFNlcnZpY2Uub24oe2RiOiAnbXktZGItY29ubmVjdGlvbi1pZCcsIHByb2plY3RJZDogJ0FETUVkaXRvcicsIGJyYW5jaElkOiAnbWFzdGVyJ30sICdpbml0aWFsaXplJywgZnVuY3Rpb24gKGN1cnJlbnRDb250ZXh0KSB7XG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKCdicmFuY2hTZXJ2aWNlIGluaXRpYWxpemVkLi4nKTtcbi8vICAgICAgICB9KTtcblxuICAgICAgICBub2RlU2VydmljZS5vbignbXktZGItY29ubmVjdGlvbi1pZCcsICdpbml0aWFsaXplJywgZnVuY3Rpb24gKGN1cnJlbnRDb250ZXh0KSB7XG4gICAgICAgICAgICB2YXIgbG9nZ2VyLFxuICAgICAgICAgICAgICB0ZXN0Q29udGV4dDtcblxuICAgICAgICAgICAgbG9nZ2VyID0gZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGluZm8pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGVzdENvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGI6ICdteS1kYi1jb25uZWN0aW9uLWlkJyxcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ1Rlc3RSZWdpb24nXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy9wbHVnaW5TZXJ2aWNlLnRlc3RSdW5QbHVnaW4odGVzdENvbnRleHQpO1xuICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaFdvcmtzcGFjZXModGVzdENvbnRleHQsIGxvZ2dlcilcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcnVuT25jZUFscmVhZHk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoV29ya3NwYWNlczonLCBkYXRhKTtcblxuICAgICAgICAgICAgICAgICAgICBydW5PbmNlQWxyZWFkeSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yZUVhY2goZGF0YS53b3Jrc3BhY2VzLCBmdW5jdGlvbih2LCBrZXkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bk9uY2VBbHJlYWR5ID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hOdW1iZXJPZkNvbXBvbmVudHModGVzdENvbnRleHQsIGtleSwgbG9nZ2VyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hOdW1iZXJPZkNvbXBvbmVudHM6JywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mRGVzaWducyh0ZXN0Q29udGV4dCwga2V5LCBsb2dnZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaE51bWJlck9mRGVzaWduczonLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlcyh0ZXN0Q29udGV4dCwga2V5LCBsb2dnZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaE51bWJlck9mVGVzdEJlbmNoZXM6JywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudHModGVzdENvbnRleHQsIGtleSwgbG9nZ2VyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hDb21wb25lbnRzOicsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCAoZGF0YS5jb21wb25lbnRzLCBmdW5jdGlvbih2LCBjS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKHRlc3RDb250ZXh0LCBjS2V5LCBsb2dnZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaENvbXBvbmVudERldGFpbHM6JywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hEZXNpZ25zKHRlc3RDb250ZXh0LCBrZXksIGxvZ2dlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRLZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoRGVzaWduczonLCBkYXRhKTtcbiAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY0tleSBpbiBkYXRhLmNvbXBvbmVudHMpIHtcbiAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLndhdGNoQ29tcG9uZW50RGV0YWlscyh0ZXN0Q29udGV4dCwgY0tleSwgbG9nZ2VyKVxuICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCd3YXRjaENvbXBvbmVudERldGFpbHM6JywgZGF0YSk7XG4gIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uud2F0Y2hUZXN0QmVuY2hlcyh0ZXN0Q29udGV4dCwga2V5LCBsb2dnZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkS2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybignd2F0Y2hUZXN0QmVuY2hlczonLCBkYXRhKTtcbiAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY0tleSBpbiBkYXRhLmNvbXBvbmVudHMpIHtcbiAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLndhdGNoQ29tcG9uZW50RGV0YWlscyh0ZXN0Q29udGV4dCwgY0tleSwgbG9nZ2VyKVxuICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCd3YXRjaENvbXBvbmVudERldGFpbHM6JywgZGF0YSk7XG4gIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2JyZWFrOyAvLyBDYW4gb25seSB3YXRjaCB0aGUgYWJvdmUgZm9yIG9uZSB3b3JrLXNwYWNlICh1bmxlc3MgY29udGV4dCBpcyBtb2RpZmllZCkuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bk9uY2VBbHJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuIl19

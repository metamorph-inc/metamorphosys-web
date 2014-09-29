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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWN0c1xcTUVUQVxcV2ViR01FXFxub2RlX21vZHVsZXNcXHdlYmdtZS1jeXBoeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXItcGFja1xcX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvc2VydmljZXRlc3QvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBzZXRUaW1lb3V0Ki9cclxuXHJcbnZhciBDeVBoeUFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcsIFtcclxuICAgICdnbWUuc2VydmljZXMnLFxyXG4gICAgJ2N5cGh5LmNvbXBvbmVudHMnXHJcbl0pXHJcbiAgICAucnVuKGZ1bmN0aW9uIChEYXRhU3RvcmVTZXJ2aWNlLCBQcm9qZWN0U2VydmljZSwgQnJhbmNoU2VydmljZSwgTm9kZVNlcnZpY2UsIFdvcmtzcGFjZVNlcnZpY2UsIENvbXBvbmVudFNlcnZpY2UsIERlc2lnblNlcnZpY2UsIFRlc3RCZW5jaFNlcnZpY2UpIHtcclxuICAgICAgICBEYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKCdteS1kYi1jb25uZWN0aW9uLWlkJywge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZX0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgLi4uJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvamVjdFNlcnZpY2Uuc2VsZWN0UHJvamVjdCgnbXktZGItY29ubmVjdGlvbi1pZCcsICdBRE1FZGl0b3InKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1Byb2plY3Qgc2VsZWN0ZWQuLi4nKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBCcmFuY2hTZXJ2aWNlLnNlbGVjdEJyYW5jaCgnbXktZGItY29ubmVjdGlvbi1pZCcsICdtYXN0ZXInKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0JyYW5jaCBzZWxlY3RlZC4uLicpO1xyXG4gICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuLy8gICAgICAgIEJyYW5jaFNlcnZpY2Uub24oe2RiOiAnbXktZGItY29ubmVjdGlvbi1pZCcsIHByb2plY3RJZDogJ0FETUVkaXRvcicsIGJyYW5jaElkOiAnbWFzdGVyJ30sICdpbml0aWFsaXplJywgZnVuY3Rpb24gKGN1cnJlbnRDb250ZXh0KSB7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coJ0JyYW5jaFNlcnZpY2UgaW5pdGlhbGl6ZWQuLicpO1xyXG4vLyAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIE5vZGVTZXJ2aWNlLm9uKCdteS1kYi1jb25uZWN0aW9uLWlkJywgJ2luaXRpYWxpemUnLCBmdW5jdGlvbiAoY3VycmVudENvbnRleHQpIHtcclxuICAgICAgICAgICAgdmFyIHRlc3RDb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICdteS1kYi1jb25uZWN0aW9uLWlkJyxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnVGVzdFJlZ2lvbidcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS53YXRjaFdvcmtzcGFjZXModGVzdENvbnRleHQsIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hXb3Jrc3BhY2VzOicsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGRhdGEud29ya3NwYWNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBXb3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZDb21wb25lbnRzKHRlc3RDb250ZXh0LCBrZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoTnVtYmVyT2ZDb21wb25lbnRzOicsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hOdW1iZXJPZkRlc2lnbnModGVzdENvbnRleHQsIGtleSwgZnVuY3Rpb24gKGluZm8pIHsgY29uc29sZS53YXJuKGluZm8pOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hOdW1iZXJPZkRlc2lnbnM6JywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgV29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mVGVzdEJlbmNoZXModGVzdENvbnRleHQsIGtleSwgZnVuY3Rpb24gKGluZm8pIHsgY29uc29sZS53YXJuKGluZm8pOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzOicsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnRzKHRlc3RDb250ZXh0LCBrZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNLZXk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoQ29tcG9uZW50czonLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNLZXkgaW4gZGF0YS5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnREZXRhaWxzKHRlc3RDb250ZXh0LCBjS2V5LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaENvbXBvbmVudERldGFpbHM6JywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBEZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWducyh0ZXN0Q29udGV4dCwga2V5LCBmdW5jdGlvbiAoaW5mbykgeyBjb25zb2xlLndhcm4oaW5mbyk7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkS2V5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaERlc2lnbnM6JywgZGF0YSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNLZXkgaW4gZGF0YS5jb21wb25lbnRzKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERldGFpbHModGVzdENvbnRleHQsIGNLZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybignd2F0Y2hDb21wb25lbnREZXRhaWxzOicsIGRhdGEpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUZXN0QmVuY2hTZXJ2aWNlLndhdGNoVGVzdEJlbmNoZXModGVzdENvbnRleHQsIGtleSwgZnVuY3Rpb24gKGluZm8pIHsgY29uc29sZS53YXJuKGluZm8pOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZEtleTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3dhdGNoVGVzdEJlbmNoZXM6JywgZGF0YSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNLZXkgaW4gZGF0YS5jb21wb25lbnRzKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERldGFpbHModGVzdENvbnRleHQsIGNLZXksIGZ1bmN0aW9uIChpbmZvKSB7IGNvbnNvbGUud2FybihpbmZvKTsgfSlcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybignd2F0Y2hDb21wb25lbnREZXRhaWxzOicsIGRhdGEpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhazsgLy8gQ2FuIG9ubHkgd2F0Y2ggdGhlIGFib3ZlIGZvciBvbmUgd29yay1zcGFjZSAodW5sZXNzIGNvbnRleHQgaXMgbW9kaWZpZWQpLlxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiJdfQ==

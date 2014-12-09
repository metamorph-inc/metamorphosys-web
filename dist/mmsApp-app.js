(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular, console*/

var CyPhyApp = angular.module('CyPhyApp', [
  'ui.router',

  'gme.services',

  'isis.ui.components',

  'cyphy.components',

  // app specific templates
  'cyphy.mmsApp.templates'
]);

CyPhyApp.config(function ($stateProvider, $urlRouterProvider) {
  'use strict';
  // For any unmatched url, redirect to /workspaces
  $urlRouterProvider.otherwise('/workspaces');
  //
  // Now set up the states
  $stateProvider
    .state('index', {
      url: '/index'
    });
});


CyPhyApp.controller('MainNavigatorController', function ($rootScope, $scope) {
  'use strict';
  $scope.navigator = {};
  $scope.navigator.items = [
    {
      id: 'root',
      label: 'MMS App',
      itemClass: 'cyphy-root'
    }
  ];
  $rootScope.mainNavigator = $scope.navigator;
});

CyPhyApp.run(function ($state, growl, dataStoreService, projectService) {
  'use strict';
  var connectionId = 'mms-connection-id';

  dataStoreService.connectToDatabase(connectionId, {host: window.location.basename})
    .then(function () {
      // select default project and branch (master)
      return projectService.selectProject(connectionId, 'ADMEditor');
    })
    .catch(function (reason) {
      growl.error('ADMEditor does not exist. Create and import it using the <a href="' +
        window.location.origin + '"> webgme interface</a>.');
      console.error(reason);
    });
});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvbW1zQXBwL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xuXG52YXIgQ3lQaHlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnLCBbXG4gICd1aS5yb3V0ZXInLFxuXG4gICdnbWUuc2VydmljZXMnLFxuXG4gICdpc2lzLnVpLmNvbXBvbmVudHMnLFxuXG4gICdjeXBoeS5jb21wb25lbnRzJyxcblxuICAvLyBhcHAgc3BlY2lmaWMgdGVtcGxhdGVzXG4gICdjeXBoeS5tbXNBcHAudGVtcGxhdGVzJ1xuXSk7XG5cbkN5UGh5QXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAndXNlIHN0cmljdCc7XG4gIC8vIEZvciBhbnkgdW5tYXRjaGVkIHVybCwgcmVkaXJlY3QgdG8gL3dvcmtzcGFjZXNcbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL3dvcmtzcGFjZXMnKTtcbiAgLy9cbiAgLy8gTm93IHNldCB1cCB0aGUgc3RhdGVzXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdpbmRleCcsIHtcbiAgICAgIHVybDogJy9pbmRleCdcbiAgICB9KTtcbn0pO1xuXG5cbkN5UGh5QXBwLmNvbnRyb2xsZXIoJ01haW5OYXZpZ2F0b3JDb250cm9sbGVyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzY29wZSkge1xuICAndXNlIHN0cmljdCc7XG4gICRzY29wZS5uYXZpZ2F0b3IgPSB7fTtcbiAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcyA9IFtcbiAgICB7XG4gICAgICBpZDogJ3Jvb3QnLFxuICAgICAgbGFiZWw6ICdNTVMgQXBwJyxcbiAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnXG4gICAgfVxuICBdO1xuICAkcm9vdFNjb3BlLm1haW5OYXZpZ2F0b3IgPSAkc2NvcGUubmF2aWdhdG9yO1xufSk7XG5cbkN5UGh5QXBwLnJ1bihmdW5jdGlvbiAoJHN0YXRlLCBncm93bCwgZGF0YVN0b3JlU2VydmljZSwgcHJvamVjdFNlcnZpY2UpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgY29ubmVjdGlvbklkID0gJ21tcy1jb25uZWN0aW9uLWlkJztcblxuICBkYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKGNvbm5lY3Rpb25JZCwge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZX0pXG4gICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgLy8gc2VsZWN0IGRlZmF1bHQgcHJvamVjdCBhbmQgYnJhbmNoIChtYXN0ZXIpXG4gICAgICByZXR1cm4gcHJvamVjdFNlcnZpY2Uuc2VsZWN0UHJvamVjdChjb25uZWN0aW9uSWQsICdBRE1FZGl0b3InKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICBncm93bC5lcnJvcignQURNRWRpdG9yIGRvZXMgbm90IGV4aXN0LiBDcmVhdGUgYW5kIGltcG9ydCBpdCB1c2luZyB0aGUgPGEgaHJlZj1cIicgK1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgJ1wiPiB3ZWJnbWUgaW50ZXJmYWNlPC9hPi4nKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbiAgICB9KTtcbn0pOyJdfQ==

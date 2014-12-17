(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular*/

'use strict';

var CyPhyApp = angular.module('CyPhyApp', [
  'ui.router',

  'gme.services',

  'isis.ui.components',

  'cyphy.components',

  // app specific templates
  'cyphy.mmsApp.templates'
]);

CyPhyApp.config(function ($stateProvider, $urlRouterProvider) {

  var selectProject;

  selectProject = {
    load: function ($q, $stateParams, $rootScope, $state, $log, dataStoreService, projectService) {
      var
        connectionId,
        deferred;

      $rootScope.mainDbConnectionId = 'mms-main-db-connection-id';

      connectionId = $rootScope.mainDbConnectionId;
      deferred = $q.defer();

      $rootScope.loading = true;

      dataStoreService.connectToDatabase(connectionId, {host: window.location.basename})
        .then(function () {
          return projectService.selectProject(connectionId, $stateParams.projectId);
        })
        .then(function (projectId) {
          $rootScope.projectId = projectId;
          $rootScope.loading = false;
          deferred.resolve(projectId);
        })
        .catch(function (reason) {
          $rootScope.loading = false;
          $log.debug('Opening project errored:', $stateParams.projectId, reason);
          $state.go('404', {
            projectId: $stateParams.projectId
          });
        });

      return deferred.promise;
    }
  };

  $urlRouterProvider.otherwise('/noProject');


  $stateProvider
    .state('project', {
      url: '/project/:projectId',
      templateUrl: '/mmsApp/templates/editor.html',
      resolve: selectProject,
      controller: 'ProjectViewController'
    })
    .state('noProject', {
      url: '/noProject',
      templateUrl: '/mmsApp/templates/noProjectSpecified.html',
      controller: 'NoProjectController'
    })
    .state('404', {
      url: '/404/:projectId',
      controller: 'NoProjectController',
      templateUrl: '/mmsApp/templates/404.html'
    });
});

CyPhyApp.controller('MainNavigatorController', function ($rootScope, $scope, $window) {

  var defaultNavigatorItems;

  defaultNavigatorItems = [
      {
        id: 'root',
        label: 'MMS App',
        itemClass: 'cyphy-root'
      }
    ];

  $scope.navigator = {
    separator: true,
    items: angular.copy(defaultNavigatorItems, [])
  };

  $rootScope.$watch('projectId', function(projectId) {

    if (projectId) {

      $scope.navigator.items = angular.copy(defaultNavigatorItems, []);
      $scope.navigator.items.push({
        id: 'project',
        label: projectId,
        action: function() {
          $window.open('/?project=' + projectId);
        }
      });

    } else {
      $scope.navigator.items = angular.copy(defaultNavigatorItems, []);
    }

  });

});

CyPhyApp.controller('ProjectViewController', function () {

});

CyPhyApp.controller('NoProjectController', function ($rootScope, $scope, $stateParams, $http, $log, $state, growl) {

  $scope.projectId = $stateParams.projectId;
  $scope.errored = false;

  $scope.startNewProject = function () {

    $rootScope.processing = true;

    $log.debug('New project creation');

    $http.get('/rest/external/copyproject/noredirect').
      success(function (data) {

        $rootScope.processing = false;
        $log.debug('New project creation successful', data);
        $state.go('project', {
          projectId: data
        });

      }).
      error(function (data, status) {

        $log.debug('New project creation failed', status);
        $rootScope.processing = false;
        growl.error('An error occured while project creation. Please retry later.');

      });

  };

});


//CyPhyApp.run(function ($state, growl, dataStoreService, projectService) {

//  var connectionId = 'mms-connection-id';
//
//  dataStoreService.connectToDatabase(connectionId, {host: window.location.basename})
//    .then(function () {
//      // select default project and branch (master)
//      return projectService.selectProject(connectionId, 'ADMEditor');
//    })
//    .catch(function (reason) {
//      growl.error('ADMEditor does not exist. Create and import it using the <a href="' +
//        window.location.origin + '"> webgme interface</a>.');
//      console.error(reason);
//    });
//});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL21tc0FwcC9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDeVBoeUFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcsIFtcbiAgJ3VpLnJvdXRlcicsXG5cbiAgJ2dtZS5zZXJ2aWNlcycsXG5cbiAgJ2lzaXMudWkuY29tcG9uZW50cycsXG5cbiAgJ2N5cGh5LmNvbXBvbmVudHMnLFxuXG4gIC8vIGFwcCBzcGVjaWZpYyB0ZW1wbGF0ZXNcbiAgJ2N5cGh5Lm1tc0FwcC50ZW1wbGF0ZXMnXG5dKTtcblxuQ3lQaHlBcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cbiAgdmFyIHNlbGVjdFByb2plY3Q7XG5cbiAgc2VsZWN0UHJvamVjdCA9IHtcbiAgICBsb2FkOiBmdW5jdGlvbiAoJHEsICRzdGF0ZVBhcmFtcywgJHJvb3RTY29wZSwgJHN0YXRlLCAkbG9nLCBkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSkge1xuICAgICAgdmFyXG4gICAgICAgIGNvbm5lY3Rpb25JZCxcbiAgICAgICAgZGVmZXJyZWQ7XG5cbiAgICAgICRyb290U2NvcGUubWFpbkRiQ29ubmVjdGlvbklkID0gJ21tcy1tYWluLWRiLWNvbm5lY3Rpb24taWQnO1xuXG4gICAgICBjb25uZWN0aW9uSWQgPSAkcm9vdFNjb3BlLm1haW5EYkNvbm5lY3Rpb25JZDtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgJHJvb3RTY29wZS5sb2FkaW5nID0gdHJ1ZTtcblxuICAgICAgZGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZShjb25uZWN0aW9uSWQsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWV9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoY29ubmVjdGlvbklkLCAkc3RhdGVQYXJhbXMucHJvamVjdElkKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHByb2plY3RJZCkge1xuICAgICAgICAgICRyb290U2NvcGUucHJvamVjdElkID0gcHJvamVjdElkO1xuICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvamVjdElkKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkbG9nLmRlYnVnKCdPcGVuaW5nIHByb2plY3QgZXJyb3JlZDonLCAkc3RhdGVQYXJhbXMucHJvamVjdElkLCByZWFzb24pO1xuICAgICAgICAgICRzdGF0ZS5nbygnNDA0Jywge1xuICAgICAgICAgICAgcHJvamVjdElkOiAkc3RhdGVQYXJhbXMucHJvamVjdElkXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL25vUHJvamVjdCcpO1xuXG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ3Byb2plY3QnLCB7XG4gICAgICB1cmw6ICcvcHJvamVjdC86cHJvamVjdElkJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvZWRpdG9yLmh0bWwnLFxuICAgICAgcmVzb2x2ZTogc2VsZWN0UHJvamVjdCxcbiAgICAgIGNvbnRyb2xsZXI6ICdQcm9qZWN0Vmlld0NvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ25vUHJvamVjdCcsIHtcbiAgICAgIHVybDogJy9ub1Byb2plY3QnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9ub1Byb2plY3RTcGVjaWZpZWQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTm9Qcm9qZWN0Q29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnNDA0Jywge1xuICAgICAgdXJsOiAnLzQwNC86cHJvamVjdElkJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdOb1Byb2plY3RDb250cm9sbGVyJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvNDA0Lmh0bWwnXG4gICAgfSk7XG59KTtcblxuQ3lQaHlBcHAuY29udHJvbGxlcignTWFpbk5hdmlnYXRvckNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHNjb3BlLCAkd2luZG93KSB7XG5cbiAgdmFyIGRlZmF1bHROYXZpZ2F0b3JJdGVtcztcblxuICBkZWZhdWx0TmF2aWdhdG9ySXRlbXMgPSBbXG4gICAgICB7XG4gICAgICAgIGlkOiAncm9vdCcsXG4gICAgICAgIGxhYmVsOiAnTU1TIEFwcCcsXG4gICAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnXG4gICAgICB9XG4gICAgXTtcblxuICAkc2NvcGUubmF2aWdhdG9yID0ge1xuICAgIHNlcGFyYXRvcjogdHJ1ZSxcbiAgICBpdGVtczogYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pXG4gIH07XG5cbiAgJHJvb3RTY29wZS4kd2F0Y2goJ3Byb2plY3RJZCcsIGZ1bmN0aW9uKHByb2plY3RJZCkge1xuXG4gICAgaWYgKHByb2plY3RJZCkge1xuXG4gICAgICAkc2NvcGUubmF2aWdhdG9yLml0ZW1zID0gYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pO1xuICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcy5wdXNoKHtcbiAgICAgICAgaWQ6ICdwcm9qZWN0JyxcbiAgICAgICAgbGFiZWw6IHByb2plY3RJZCxcbiAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD0nICsgcHJvamVjdElkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcyA9IGFuZ3VsYXIuY29weShkZWZhdWx0TmF2aWdhdG9ySXRlbXMsIFtdKTtcbiAgICB9XG5cbiAgfSk7XG5cbn0pO1xuXG5DeVBoeUFwcC5jb250cm9sbGVyKCdQcm9qZWN0Vmlld0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoKSB7XG5cbn0pO1xuXG5DeVBoeUFwcC5jb250cm9sbGVyKCdOb1Byb2plY3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzY29wZSwgJHN0YXRlUGFyYW1zLCAkaHR0cCwgJGxvZywgJHN0YXRlLCBncm93bCkge1xuXG4gICRzY29wZS5wcm9qZWN0SWQgPSAkc3RhdGVQYXJhbXMucHJvamVjdElkO1xuICAkc2NvcGUuZXJyb3JlZCA9IGZhbHNlO1xuXG4gICRzY29wZS5zdGFydE5ld1Byb2plY3QgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAkcm9vdFNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuXG4gICAgJGxvZy5kZWJ1ZygnTmV3IHByb2plY3QgY3JlYXRpb24nKTtcblxuICAgICRodHRwLmdldCgnL3Jlc3QvZXh0ZXJuYWwvY29weXByb2plY3Qvbm9yZWRpcmVjdCcpLlxuICAgICAgc3VjY2VzcyhmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgICRyb290U2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkbG9nLmRlYnVnKCdOZXcgcHJvamVjdCBjcmVhdGlvbiBzdWNjZXNzZnVsJywgZGF0YSk7XG4gICAgICAgICRzdGF0ZS5nbygncHJvamVjdCcsIHtcbiAgICAgICAgICBwcm9qZWN0SWQ6IGRhdGFcbiAgICAgICAgfSk7XG5cbiAgICAgIH0pLlxuICAgICAgZXJyb3IoZnVuY3Rpb24gKGRhdGEsIHN0YXR1cykge1xuXG4gICAgICAgICRsb2cuZGVidWcoJ05ldyBwcm9qZWN0IGNyZWF0aW9uIGZhaWxlZCcsIHN0YXR1cyk7XG4gICAgICAgICRyb290U2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBncm93bC5lcnJvcignQW4gZXJyb3Igb2NjdXJlZCB3aGlsZSBwcm9qZWN0IGNyZWF0aW9uLiBQbGVhc2UgcmV0cnkgbGF0ZXIuJyk7XG5cbiAgICAgIH0pO1xuXG4gIH07XG5cbn0pO1xuXG5cbi8vQ3lQaHlBcHAucnVuKGZ1bmN0aW9uICgkc3RhdGUsIGdyb3dsLCBkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSkge1xuXG4vLyAgdmFyIGNvbm5lY3Rpb25JZCA9ICdtbXMtY29ubmVjdGlvbi1pZCc7XG4vL1xuLy8gIGRhdGFTdG9yZVNlcnZpY2UuY29ubmVjdFRvRGF0YWJhc2UoY29ubmVjdGlvbklkLCB7aG9zdDogd2luZG93LmxvY2F0aW9uLmJhc2VuYW1lfSlcbi8vICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbi8vICAgICAgLy8gc2VsZWN0IGRlZmF1bHQgcHJvamVjdCBhbmQgYnJhbmNoIChtYXN0ZXIpXG4vLyAgICAgIHJldHVybiBwcm9qZWN0U2VydmljZS5zZWxlY3RQcm9qZWN0KGNvbm5lY3Rpb25JZCwgJ0FETUVkaXRvcicpO1xuLy8gICAgfSlcbi8vICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4vLyAgICAgIGdyb3dsLmVycm9yKCdBRE1FZGl0b3IgZG9lcyBub3QgZXhpc3QuIENyZWF0ZSBhbmQgaW1wb3J0IGl0IHVzaW5nIHRoZSA8YSBocmVmPVwiJyArXG4vLyAgICAgICAgd2luZG93LmxvY2F0aW9uLm9yaWdpbiArICdcIj4gd2ViZ21lIGludGVyZmFjZTwvYT4uJyk7XG4vLyAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbi8vICAgIH0pO1xuLy99KTsiXX0=

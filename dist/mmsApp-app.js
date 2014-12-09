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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvbW1zQXBwL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEN5UGh5QXBwID0gYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJywgW1xuICAndWkucm91dGVyJyxcblxuICAnZ21lLnNlcnZpY2VzJyxcblxuICAnaXNpcy51aS5jb21wb25lbnRzJyxcblxuICAnY3lwaHkuY29tcG9uZW50cycsXG5cbiAgLy8gYXBwIHNwZWNpZmljIHRlbXBsYXRlc1xuICAnY3lwaHkubW1zQXBwLnRlbXBsYXRlcydcbl0pO1xuXG5DeVBoeUFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuICB2YXIgc2VsZWN0UHJvamVjdDtcblxuICBzZWxlY3RQcm9qZWN0ID0ge1xuICAgIGxvYWQ6IGZ1bmN0aW9uICgkcSwgJHN0YXRlUGFyYW1zLCAkcm9vdFNjb3BlLCAkc3RhdGUsICRsb2csIGRhdGFTdG9yZVNlcnZpY2UsIHByb2plY3RTZXJ2aWNlKSB7XG4gICAgICB2YXJcbiAgICAgICAgY29ubmVjdGlvbklkLFxuICAgICAgICBkZWZlcnJlZDtcblxuICAgICAgJHJvb3RTY29wZS5tYWluRGJDb25uZWN0aW9uSWQgPSAnbW1zLW1haW4tZGItY29ubmVjdGlvbi1pZCc7XG5cbiAgICAgIGNvbm5lY3Rpb25JZCA9ICRyb290U2NvcGUubWFpbkRiQ29ubmVjdGlvbklkO1xuICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuXG4gICAgICBkYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKGNvbm5lY3Rpb25JZCwge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZX0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gcHJvamVjdFNlcnZpY2Uuc2VsZWN0UHJvamVjdChjb25uZWN0aW9uSWQsICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWQpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAocHJvamVjdElkKSB7XG4gICAgICAgICAgJHJvb3RTY29wZS5wcm9qZWN0SWQgPSBwcm9qZWN0SWQ7XG4gICAgICAgICAgJHJvb3RTY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShwcm9qZWN0SWQpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICRsb2cuZGVidWcoJ09wZW5pbmcgcHJvamVjdCBlcnJvcmVkOicsICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWQsIHJlYXNvbik7XG4gICAgICAgICAgJHN0YXRlLmdvKCc0MDQnLCB7XG4gICAgICAgICAgICBwcm9qZWN0SWQ6ICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvbm9Qcm9qZWN0Jyk7XG5cblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgncHJvamVjdCcsIHtcbiAgICAgIHVybDogJy9wcm9qZWN0Lzpwcm9qZWN0SWQnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9lZGl0b3IuaHRtbCcsXG4gICAgICByZXNvbHZlOiBzZWxlY3RQcm9qZWN0LFxuICAgICAgY29udHJvbGxlcjogJ1Byb2plY3RWaWV3Q29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnbm9Qcm9qZWN0Jywge1xuICAgICAgdXJsOiAnL25vUHJvamVjdCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9tbXNBcHAvdGVtcGxhdGVzL25vUHJvamVjdFNwZWNpZmllZC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdOb1Byb2plY3RDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCc0MDQnLCB7XG4gICAgICB1cmw6ICcvNDA0Lzpwcm9qZWN0SWQnLFxuICAgICAgY29udHJvbGxlcjogJ05vUHJvamVjdENvbnRyb2xsZXInLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy80MDQuaHRtbCdcbiAgICB9KTtcbn0pO1xuXG5DeVBoeUFwcC5jb250cm9sbGVyKCdNYWluTmF2aWdhdG9yQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkc2NvcGUsICR3aW5kb3cpIHtcblxuICB2YXIgZGVmYXVsdE5hdmlnYXRvckl0ZW1zO1xuXG4gIGRlZmF1bHROYXZpZ2F0b3JJdGVtcyA9IFtcbiAgICAgIHtcbiAgICAgICAgaWQ6ICdyb290JyxcbiAgICAgICAgbGFiZWw6ICdNTVMgQXBwJyxcbiAgICAgICAgaXRlbUNsYXNzOiAnY3lwaHktcm9vdCdcbiAgICAgIH1cbiAgICBdO1xuXG4gICRzY29wZS5uYXZpZ2F0b3IgPSB7XG4gICAgc2VwYXJhdG9yOiB0cnVlLFxuICAgIGl0ZW1zOiBhbmd1bGFyLmNvcHkoZGVmYXVsdE5hdmlnYXRvckl0ZW1zLCBbXSlcbiAgfTtcblxuICAkcm9vdFNjb3BlLiR3YXRjaCgncHJvamVjdElkJywgZnVuY3Rpb24ocHJvamVjdElkKSB7XG5cbiAgICBpZiAocHJvamVjdElkKSB7XG5cbiAgICAgICRzY29wZS5uYXZpZ2F0b3IuaXRlbXMgPSBhbmd1bGFyLmNvcHkoZGVmYXVsdE5hdmlnYXRvckl0ZW1zLCBbXSk7XG4gICAgICAkc2NvcGUubmF2aWdhdG9yLml0ZW1zLnB1c2goe1xuICAgICAgICBpZDogJ3Byb2plY3QnLFxuICAgICAgICBsYWJlbDogcHJvamVjdElkLFxuICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICR3aW5kb3cub3BlbignLz9wcm9qZWN0PScgKyBwcm9qZWN0SWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUubmF2aWdhdG9yLml0ZW1zID0gYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pO1xuICAgIH1cblxuICB9KTtcblxufSk7XG5cbkN5UGh5QXBwLmNvbnRyb2xsZXIoJ1Byb2plY3RWaWV3Q29udHJvbGxlcicsIGZ1bmN0aW9uICgpIHtcblxufSk7XG5cbkN5UGh5QXBwLmNvbnRyb2xsZXIoJ05vUHJvamVjdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHNjb3BlLCAkc3RhdGVQYXJhbXMsICRodHRwLCAkbG9nLCAkc3RhdGUsIGdyb3dsKSB7XG5cbiAgJHNjb3BlLnByb2plY3RJZCA9ICRzdGF0ZVBhcmFtcy5wcm9qZWN0SWQ7XG4gICRzY29wZS5lcnJvcmVkID0gZmFsc2U7XG5cbiAgJHNjb3BlLnN0YXJ0TmV3UHJvamVjdCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICRyb290U2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG5cbiAgICAkbG9nLmRlYnVnKCdOZXcgcHJvamVjdCBjcmVhdGlvbicpO1xuXG4gICAgJGh0dHAuZ2V0KCcvcmVzdC9leHRlcm5hbC9jb3B5cHJvamVjdC9ub3JlZGlyZWN0JykuXG4gICAgICBzdWNjZXNzKGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgJHJvb3RTY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICRsb2cuZGVidWcoJ05ldyBwcm9qZWN0IGNyZWF0aW9uIHN1Y2Nlc3NmdWwnLCBkYXRhKTtcbiAgICAgICAgJHN0YXRlLmdvKCdwcm9qZWN0Jywge1xuICAgICAgICAgIHByb2plY3RJZDogZGF0YVxuICAgICAgICB9KTtcblxuICAgICAgfSkuXG4gICAgICBlcnJvcihmdW5jdGlvbiAoZGF0YSwgc3RhdHVzKSB7XG5cbiAgICAgICAgJGxvZy5kZWJ1ZygnTmV3IHByb2plY3QgY3JlYXRpb24gZmFpbGVkJywgc3RhdHVzKTtcbiAgICAgICAgJHJvb3RTY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGdyb3dsLmVycm9yKCdBbiBlcnJvciBvY2N1cmVkIHdoaWxlIHByb2plY3QgY3JlYXRpb24uIFBsZWFzZSByZXRyeSBsYXRlci4nKTtcblxuICAgICAgfSk7XG5cbiAgfTtcblxufSk7XG5cblxuLy9DeVBoeUFwcC5ydW4oZnVuY3Rpb24gKCRzdGF0ZSwgZ3Jvd2wsIGRhdGFTdG9yZVNlcnZpY2UsIHByb2plY3RTZXJ2aWNlKSB7XG5cbi8vICB2YXIgY29ubmVjdGlvbklkID0gJ21tcy1jb25uZWN0aW9uLWlkJztcbi8vXG4vLyAgZGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZShjb25uZWN0aW9uSWQsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWV9KVxuLy8gICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuLy8gICAgICAvLyBzZWxlY3QgZGVmYXVsdCBwcm9qZWN0IGFuZCBicmFuY2ggKG1hc3Rlcilcbi8vICAgICAgcmV0dXJuIHByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoY29ubmVjdGlvbklkLCAnQURNRWRpdG9yJyk7XG4vLyAgICB9KVxuLy8gICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbi8vICAgICAgZ3Jvd2wuZXJyb3IoJ0FETUVkaXRvciBkb2VzIG5vdCBleGlzdC4gQ3JlYXRlIGFuZCBpbXBvcnQgaXQgdXNpbmcgdGhlIDxhIGhyZWY9XCInICtcbi8vICAgICAgICB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgJ1wiPiB3ZWJnbWUgaW50ZXJmYWNlPC9hPi4nKTtcbi8vICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuLy8gICAgfSk7XG4vL30pOyJdfQ==

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

require('./utils.js');

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
},{"./utils.js":3}],2:[function(require,module,exports){
// Array.prototype.find - MIT License (c) 2013 Paul Miller <http://paulmillr.com>
// For all details and docs: https://github.com/paulmillr/array.prototype.find
// Fixes and tests supplied by Duncan Hall <http://duncanhall.net> 
(function(globals){
  if (Array.prototype.find) return;

  var find = function(predicate) {
    var list = Object(this);
    var length = list.length < 0 ? 0 : list.length >>> 0; // ES.ToUint32;
    if (length === 0) return undefined;
    if (typeof predicate !== 'function' || Object.prototype.toString.call(predicate) !== '[object Function]') {
      throw new TypeError('Array#find: predicate must be a function');
    }
    var thisArg = arguments[1];
    for (var i = 0, value; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) return value;
    }
    return undefined;
  };

  if (Object.defineProperty) {
    try {
      Object.defineProperty(Array.prototype, 'find', {
        value: find, configurable: true, enumerable: false, writable: true
      });
    } catch(e) {}
  }

  if (!Array.prototype.find) {
    Array.prototype.find = find;
  }
})(this);

},{}],3:[function(require,module,exports){
'use strict';

require('Array.prototype.find');

if (!Array.prototype.findById) {
  Array.prototype.findById = function(id) {
    return this.find(function(a) {
      return a.id !== undefined && a.id === id;
    });
  };
}

if (!Array.prototype.getRandomElement) {
  Array.prototype.getRandomElement = function() {
    return this[ Math.round(Math.random() * (this.length -1 ))];
  };
}

if (!Array.prototype.shuffle) {
  Array.prototype.shuffle = function() {
    var currentIndex = this.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = this[currentIndex];
      this[currentIndex] = this[randomIndex];
      this[randomIndex] = temporaryValue;
    }

    return this;
  };
}
},{"Array.prototype.find":2}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvbW1zQXBwL2FwcC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvQXJyYXkucHJvdG90eXBlLmZpbmQvaW5kZXguanMiLCIvVXNlcnMvbGFzemxvanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL21tc0FwcC91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ3lQaHlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnLCBbXG4gICd1aS5yb3V0ZXInLFxuXG4gICdnbWUuc2VydmljZXMnLFxuXG4gICdpc2lzLnVpLmNvbXBvbmVudHMnLFxuXG4gICdjeXBoeS5jb21wb25lbnRzJyxcblxuICAvLyBhcHAgc3BlY2lmaWMgdGVtcGxhdGVzXG4gICdjeXBoeS5tbXNBcHAudGVtcGxhdGVzJ1xuXSk7XG5cbnJlcXVpcmUoJy4vdXRpbHMuanMnKTtcblxuQ3lQaHlBcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cbiAgdmFyIHNlbGVjdFByb2plY3Q7XG5cbiAgc2VsZWN0UHJvamVjdCA9IHtcbiAgICBsb2FkOiBmdW5jdGlvbiAoJHEsICRzdGF0ZVBhcmFtcywgJHJvb3RTY29wZSwgJHN0YXRlLCAkbG9nLCBkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSkge1xuICAgICAgdmFyXG4gICAgICAgIGNvbm5lY3Rpb25JZCxcbiAgICAgICAgZGVmZXJyZWQ7XG5cbiAgICAgICRyb290U2NvcGUubWFpbkRiQ29ubmVjdGlvbklkID0gJ21tcy1tYWluLWRiLWNvbm5lY3Rpb24taWQnO1xuXG4gICAgICBjb25uZWN0aW9uSWQgPSAkcm9vdFNjb3BlLm1haW5EYkNvbm5lY3Rpb25JZDtcbiAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgJHJvb3RTY29wZS5sb2FkaW5nID0gdHJ1ZTtcblxuICAgICAgZGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZShjb25uZWN0aW9uSWQsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWV9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoY29ubmVjdGlvbklkLCAkc3RhdGVQYXJhbXMucHJvamVjdElkKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHByb2plY3RJZCkge1xuICAgICAgICAgICRyb290U2NvcGUucHJvamVjdElkID0gcHJvamVjdElkO1xuICAgICAgICAgICRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvamVjdElkKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAkcm9vdFNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkbG9nLmRlYnVnKCdPcGVuaW5nIHByb2plY3QgZXJyb3JlZDonLCAkc3RhdGVQYXJhbXMucHJvamVjdElkLCByZWFzb24pO1xuICAgICAgICAgICRzdGF0ZS5nbygnNDA0Jywge1xuICAgICAgICAgICAgcHJvamVjdElkOiAkc3RhdGVQYXJhbXMucHJvamVjdElkXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL25vUHJvamVjdCcpO1xuXG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ3Byb2plY3QnLCB7XG4gICAgICB1cmw6ICcvcHJvamVjdC86cHJvamVjdElkJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvZWRpdG9yLmh0bWwnLFxuICAgICAgcmVzb2x2ZTogc2VsZWN0UHJvamVjdCxcbiAgICAgIGNvbnRyb2xsZXI6ICdQcm9qZWN0Vmlld0NvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ25vUHJvamVjdCcsIHtcbiAgICAgIHVybDogJy9ub1Byb2plY3QnLFxuICAgICAgdGVtcGxhdGVVcmw6ICcvbW1zQXBwL3RlbXBsYXRlcy9ub1Byb2plY3RTcGVjaWZpZWQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTm9Qcm9qZWN0Q29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnNDA0Jywge1xuICAgICAgdXJsOiAnLzQwNC86cHJvamVjdElkJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdOb1Byb2plY3RDb250cm9sbGVyJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnL21tc0FwcC90ZW1wbGF0ZXMvNDA0Lmh0bWwnXG4gICAgfSk7XG59KTtcblxuQ3lQaHlBcHAuY29udHJvbGxlcignTWFpbk5hdmlnYXRvckNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHNjb3BlLCAkd2luZG93KSB7XG5cbiAgdmFyIGRlZmF1bHROYXZpZ2F0b3JJdGVtcztcblxuICBkZWZhdWx0TmF2aWdhdG9ySXRlbXMgPSBbXG4gICAgICB7XG4gICAgICAgIGlkOiAncm9vdCcsXG4gICAgICAgIGxhYmVsOiAnTU1TIEFwcCcsXG4gICAgICAgIGl0ZW1DbGFzczogJ2N5cGh5LXJvb3QnXG4gICAgICB9XG4gICAgXTtcblxuICAkc2NvcGUubmF2aWdhdG9yID0ge1xuICAgIHNlcGFyYXRvcjogdHJ1ZSxcbiAgICBpdGVtczogYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pXG4gIH07XG5cbiAgJHJvb3RTY29wZS4kd2F0Y2goJ3Byb2plY3RJZCcsIGZ1bmN0aW9uKHByb2plY3RJZCkge1xuXG4gICAgaWYgKHByb2plY3RJZCkge1xuXG4gICAgICAkc2NvcGUubmF2aWdhdG9yLml0ZW1zID0gYW5ndWxhci5jb3B5KGRlZmF1bHROYXZpZ2F0b3JJdGVtcywgW10pO1xuICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcy5wdXNoKHtcbiAgICAgICAgaWQ6ICdwcm9qZWN0JyxcbiAgICAgICAgbGFiZWw6IHByb2plY3RJZCxcbiAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD0nICsgcHJvamVjdElkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLm5hdmlnYXRvci5pdGVtcyA9IGFuZ3VsYXIuY29weShkZWZhdWx0TmF2aWdhdG9ySXRlbXMsIFtdKTtcbiAgICB9XG5cbiAgfSk7XG5cbn0pO1xuXG5DeVBoeUFwcC5jb250cm9sbGVyKCdQcm9qZWN0Vmlld0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoKSB7XG5cbn0pO1xuXG5DeVBoeUFwcC5jb250cm9sbGVyKCdOb1Byb2plY3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsICRzY29wZSwgJHN0YXRlUGFyYW1zLCAkaHR0cCwgJGxvZywgJHN0YXRlLCBncm93bCkge1xuXG4gICRzY29wZS5wcm9qZWN0SWQgPSAkc3RhdGVQYXJhbXMucHJvamVjdElkO1xuICAkc2NvcGUuZXJyb3JlZCA9IGZhbHNlO1xuXG4gICRzY29wZS5zdGFydE5ld1Byb2plY3QgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAkcm9vdFNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuXG4gICAgJGxvZy5kZWJ1ZygnTmV3IHByb2plY3QgY3JlYXRpb24nKTtcblxuICAgICRodHRwLmdldCgnL3Jlc3QvZXh0ZXJuYWwvY29weXByb2plY3Qvbm9yZWRpcmVjdCcpLlxuICAgICAgc3VjY2VzcyhmdW5jdGlvbiAoZGF0YSkge1xuXG4gICAgICAgICRyb290U2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkbG9nLmRlYnVnKCdOZXcgcHJvamVjdCBjcmVhdGlvbiBzdWNjZXNzZnVsJywgZGF0YSk7XG4gICAgICAgICRzdGF0ZS5nbygncHJvamVjdCcsIHtcbiAgICAgICAgICBwcm9qZWN0SWQ6IGRhdGFcbiAgICAgICAgfSk7XG5cbiAgICAgIH0pLlxuICAgICAgZXJyb3IoZnVuY3Rpb24gKGRhdGEsIHN0YXR1cykge1xuXG4gICAgICAgICRsb2cuZGVidWcoJ05ldyBwcm9qZWN0IGNyZWF0aW9uIGZhaWxlZCcsIHN0YXR1cyk7XG4gICAgICAgICRyb290U2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBncm93bC5lcnJvcignQW4gZXJyb3Igb2NjdXJlZCB3aGlsZSBwcm9qZWN0IGNyZWF0aW9uLiBQbGVhc2UgcmV0cnkgbGF0ZXIuJyk7XG5cbiAgICAgIH0pO1xuXG4gIH07XG5cbn0pO1xuXG5cbi8vQ3lQaHlBcHAucnVuKGZ1bmN0aW9uICgkc3RhdGUsIGdyb3dsLCBkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSkge1xuXG4vLyAgdmFyIGNvbm5lY3Rpb25JZCA9ICdtbXMtY29ubmVjdGlvbi1pZCc7XG4vL1xuLy8gIGRhdGFTdG9yZVNlcnZpY2UuY29ubmVjdFRvRGF0YWJhc2UoY29ubmVjdGlvbklkLCB7aG9zdDogd2luZG93LmxvY2F0aW9uLmJhc2VuYW1lfSlcbi8vICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbi8vICAgICAgLy8gc2VsZWN0IGRlZmF1bHQgcHJvamVjdCBhbmQgYnJhbmNoIChtYXN0ZXIpXG4vLyAgICAgIHJldHVybiBwcm9qZWN0U2VydmljZS5zZWxlY3RQcm9qZWN0KGNvbm5lY3Rpb25JZCwgJ0FETUVkaXRvcicpO1xuLy8gICAgfSlcbi8vICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4vLyAgICAgIGdyb3dsLmVycm9yKCdBRE1FZGl0b3IgZG9lcyBub3QgZXhpc3QuIENyZWF0ZSBhbmQgaW1wb3J0IGl0IHVzaW5nIHRoZSA8YSBocmVmPVwiJyArXG4vLyAgICAgICAgd2luZG93LmxvY2F0aW9uLm9yaWdpbiArICdcIj4gd2ViZ21lIGludGVyZmFjZTwvYT4uJyk7XG4vLyAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbi8vICAgIH0pO1xuLy99KTsiLCIvLyBBcnJheS5wcm90b3R5cGUuZmluZCAtIE1JVCBMaWNlbnNlIChjKSAyMDEzIFBhdWwgTWlsbGVyIDxodHRwOi8vcGF1bG1pbGxyLmNvbT5cbi8vIEZvciBhbGwgZGV0YWlscyBhbmQgZG9jczogaHR0cHM6Ly9naXRodWIuY29tL3BhdWxtaWxsci9hcnJheS5wcm90b3R5cGUuZmluZFxuLy8gRml4ZXMgYW5kIHRlc3RzIHN1cHBsaWVkIGJ5IER1bmNhbiBIYWxsIDxodHRwOi8vZHVuY2FuaGFsbC5uZXQ+IFxuKGZ1bmN0aW9uKGdsb2JhbHMpe1xuICBpZiAoQXJyYXkucHJvdG90eXBlLmZpbmQpIHJldHVybjtcblxuICB2YXIgZmluZCA9IGZ1bmN0aW9uKHByZWRpY2F0ZSkge1xuICAgIHZhciBsaXN0ID0gT2JqZWN0KHRoaXMpO1xuICAgIHZhciBsZW5ndGggPSBsaXN0Lmxlbmd0aCA8IDAgPyAwIDogbGlzdC5sZW5ndGggPj4+IDA7IC8vIEVTLlRvVWludDMyO1xuICAgIGlmIChsZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG4gICAgaWYgKHR5cGVvZiBwcmVkaWNhdGUgIT09ICdmdW5jdGlvbicgfHwgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByZWRpY2F0ZSkgIT09ICdbb2JqZWN0IEZ1bmN0aW9uXScpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FycmF5I2ZpbmQ6IHByZWRpY2F0ZSBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG4gICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgZm9yICh2YXIgaSA9IDAsIHZhbHVlOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlID0gbGlzdFtpXTtcbiAgICAgIGlmIChwcmVkaWNhdGUuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaSwgbGlzdCkpIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfTtcblxuICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7XG4gICAgdHJ5IHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICdmaW5kJywge1xuICAgICAgICB2YWx1ZTogZmluZCwgY29uZmlndXJhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2goZSkge31cbiAgfVxuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmZpbmQpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZmluZCA9IGZpbmQ7XG4gIH1cbn0pKHRoaXMpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCdBcnJheS5wcm90b3R5cGUuZmluZCcpO1xuXG5pZiAoIUFycmF5LnByb3RvdHlwZS5maW5kQnlJZCkge1xuICBBcnJheS5wcm90b3R5cGUuZmluZEJ5SWQgPSBmdW5jdGlvbihpZCkge1xuICAgIHJldHVybiB0aGlzLmZpbmQoZnVuY3Rpb24oYSkge1xuICAgICAgcmV0dXJuIGEuaWQgIT09IHVuZGVmaW5lZCAmJiBhLmlkID09PSBpZDtcbiAgICB9KTtcbiAgfTtcbn1cblxuaWYgKCFBcnJheS5wcm90b3R5cGUuZ2V0UmFuZG9tRWxlbWVudCkge1xuICBBcnJheS5wcm90b3R5cGUuZ2V0UmFuZG9tRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzWyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAodGhpcy5sZW5ndGggLTEgKSldO1xuICB9O1xufVxuXG5pZiAoIUFycmF5LnByb3RvdHlwZS5zaHVmZmxlKSB7XG4gIEFycmF5LnByb3RvdHlwZS5zaHVmZmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMubGVuZ3RoLCB0ZW1wb3JhcnlWYWx1ZSwgcmFuZG9tSW5kZXggO1xuXG4gICAgLy8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cbiAgICB3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XG5cbiAgICAgIC8vIFBpY2sgYSByZW1haW5pbmcgZWxlbWVudC4uLlxuICAgICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjdXJyZW50SW5kZXgpO1xuICAgICAgY3VycmVudEluZGV4IC09IDE7XG5cbiAgICAgIC8vIEFuZCBzd2FwIGl0IHdpdGggdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAgICAgIHRlbXBvcmFyeVZhbHVlID0gdGhpc1tjdXJyZW50SW5kZXhdO1xuICAgICAgdGhpc1tjdXJyZW50SW5kZXhdID0gdGhpc1tyYW5kb21JbmRleF07XG4gICAgICB0aGlzW3JhbmRvbUluZGV4XSA9IHRlbXBvcmFyeVZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xufSJdfQ==

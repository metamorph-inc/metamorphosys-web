(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular, console*/

var CyPhyApp = angular.module('CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.sample.templates'
])
    .run(function () {

    });

// TODO: require all of your controllers
require('./views/MyView/MyViewController');

},{"./views/MyView/MyViewController":2}],2:[function(require,module,exports){
/*globals angular, console */

angular.module('CyPhyApp')
    .controller('MyViewController', function ($scope, DataStoreService, ProjectService) {
        'use strict';

        console.log('MyViewController');

        $scope.model = {
            name: 'listing projects [set from controller]',
            projectIds: []
        };

        DataStoreService.connectToDatabase('my-db-connection-id', {host: window.location.basename})
            .then(function () {
                console.log('connected');

                ProjectService.getProjects('my-db-connection-id')
                    .then(function (projectIds) {
                        $scope.model.projectIds = projectIds;
                    })
                    .catch(function (reason) {
                        console.error(reason);
                    });
            })
            .catch(function (reason) {
                console.error(reason);
            });

    });

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvc2FtcGxlL2FwcC5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL3NhbXBsZS92aWV3cy9NeVZpZXcvTXlWaWV3Q29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xuXG52YXIgQ3lQaHlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG5cbiAgICAnZ21lLnNlcnZpY2VzJyxcblxuICAgICdpc2lzLnVpLmNvbXBvbmVudHMnLFxuXG4gICAgJ2N5cGh5LmNvbXBvbmVudHMnLFxuXG4gICAgLy8gYXBwIHNwZWNpZmljIHRlbXBsYXRlc1xuICAgICdjeXBoeS5zYW1wbGUudGVtcGxhdGVzJ1xuXSlcbiAgICAucnVuKGZ1bmN0aW9uICgpIHtcblxuICAgIH0pO1xuXG4vLyBUT0RPOiByZXF1aXJlIGFsbCBvZiB5b3VyIGNvbnRyb2xsZXJzXG5yZXF1aXJlKCcuL3ZpZXdzL015Vmlldy9NeVZpZXdDb250cm9sbGVyJyk7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xuXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxuICAgIC5jb250cm9sbGVyKCdNeVZpZXdDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgRGF0YVN0b3JlU2VydmljZSwgUHJvamVjdFNlcnZpY2UpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdNeVZpZXdDb250cm9sbGVyJyk7XG5cbiAgICAgICAgJHNjb3BlLm1vZGVsID0ge1xuICAgICAgICAgICAgbmFtZTogJ2xpc3RpbmcgcHJvamVjdHMgW3NldCBmcm9tIGNvbnRyb2xsZXJdJyxcbiAgICAgICAgICAgIHByb2plY3RJZHM6IFtdXG4gICAgICAgIH07XG5cbiAgICAgICAgRGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZSgnbXktZGItY29ubmVjdGlvbi1pZCcsIHtob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWV9KVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjb25uZWN0ZWQnKTtcblxuICAgICAgICAgICAgICAgIFByb2plY3RTZXJ2aWNlLmdldFByb2plY3RzKCdteS1kYi1jb25uZWN0aW9uLWlkJylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHByb2plY3RJZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tb2RlbC5wcm9qZWN0SWRzID0gcHJvamVjdElkcztcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XG4gICAgICAgICAgICB9KTtcblxuICAgIH0pO1xuIl19

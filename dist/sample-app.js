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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL3NhbXBsZS9hcHAuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9hcHAvc2FtcGxlL3ZpZXdzL015Vmlldy9NeVZpZXdDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG52YXIgQ3lQaHlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnLCBbXHJcbiAgICAndWkucm91dGVyJyxcclxuXHJcbiAgICAnZ21lLnNlcnZpY2VzJyxcclxuXHJcbiAgICAnaXNpcy51aS5jb21wb25lbnRzJyxcclxuXHJcbiAgICAnY3lwaHkuY29tcG9uZW50cycsXHJcblxyXG4gICAgLy8gYXBwIHNwZWNpZmljIHRlbXBsYXRlc1xyXG4gICAgJ2N5cGh5LnNhbXBsZS50ZW1wbGF0ZXMnXHJcbl0pXHJcbiAgICAucnVuKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9KTtcclxuXHJcbi8vIFRPRE86IHJlcXVpcmUgYWxsIG9mIHlvdXIgY29udHJvbGxlcnNcclxucmVxdWlyZSgnLi92aWV3cy9NeVZpZXcvTXlWaWV3Q29udHJvbGxlcicpO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ0N5UGh5QXBwJylcclxuICAgIC5jb250cm9sbGVyKCdNeVZpZXdDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgRGF0YVN0b3JlU2VydmljZSwgUHJvamVjdFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdNeVZpZXdDb250cm9sbGVyJyk7XHJcblxyXG4gICAgICAgICRzY29wZS5tb2RlbCA9IHtcclxuICAgICAgICAgICAgbmFtZTogJ2xpc3RpbmcgcHJvamVjdHMgW3NldCBmcm9tIGNvbnRyb2xsZXJdJyxcclxuICAgICAgICAgICAgcHJvamVjdElkczogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBEYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKCdteS1kYi1jb25uZWN0aW9uLWlkJywge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZX0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjb25uZWN0ZWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBQcm9qZWN0U2VydmljZS5nZXRQcm9qZWN0cygnbXktZGItY29ubmVjdGlvbi1pZCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHByb2plY3RJZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsLnByb2plY3RJZHMgPSBwcm9qZWN0SWRzO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxuIl19

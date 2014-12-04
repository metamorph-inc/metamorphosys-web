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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvc2FtcGxlL2FwcC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvd2ViY3lwaHkvd2ViZ21lLWN5cGh5L3NyYy9hcHAvc2FtcGxlL3ZpZXdzL015Vmlldy9NeVZpZXdDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXG5cbnZhciBDeVBoeUFwcCA9IGFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcsIFtcbiAgICAndWkucm91dGVyJyxcblxuICAgICdnbWUuc2VydmljZXMnLFxuXG4gICAgJ2lzaXMudWkuY29tcG9uZW50cycsXG5cbiAgICAnY3lwaHkuY29tcG9uZW50cycsXG5cbiAgICAvLyBhcHAgc3BlY2lmaWMgdGVtcGxhdGVzXG4gICAgJ2N5cGh5LnNhbXBsZS50ZW1wbGF0ZXMnXG5dKVxuICAgIC5ydW4oZnVuY3Rpb24gKCkge1xuXG4gICAgfSk7XG5cbi8vIFRPRE86IHJlcXVpcmUgYWxsIG9mIHlvdXIgY29udHJvbGxlcnNcbnJlcXVpcmUoJy4vdmlld3MvTXlWaWV3L015Vmlld0NvbnRyb2xsZXInKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlICovXG5cbmFuZ3VsYXIubW9kdWxlKCdDeVBoeUFwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ015Vmlld0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBEYXRhU3RvcmVTZXJ2aWNlLCBQcm9qZWN0U2VydmljZSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ015Vmlld0NvbnRyb2xsZXInKTtcblxuICAgICAgICAkc2NvcGUubW9kZWwgPSB7XG4gICAgICAgICAgICBuYW1lOiAnbGlzdGluZyBwcm9qZWN0cyBbc2V0IGZyb20gY29udHJvbGxlcl0nLFxuICAgICAgICAgICAgcHJvamVjdElkczogW11cbiAgICAgICAgfTtcblxuICAgICAgICBEYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKCdteS1kYi1jb25uZWN0aW9uLWlkJywge2hvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZX0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCcpO1xuXG4gICAgICAgICAgICAgICAgUHJvamVjdFNlcnZpY2UuZ2V0UHJvamVjdHMoJ215LWRiLWNvbm5lY3Rpb24taWQnKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocHJvamVjdElkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsLnByb2plY3RJZHMgPSBwcm9qZWN0SWRzO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgfSk7XG4iXX0=

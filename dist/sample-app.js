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
    .controller('MyViewController', function ($scope, DataStoreService) {
        'use strict';

        console.log('MyViewController');

        $scope.model = {
            name: 'listing projects [set from controller]',
            projectIds: []
        };

        DataStoreService.getProjects({db: 'my-db-connection-id'})
            .then(function (projectIds) {
                $scope.model.projectIds = projectIds;
            }).catch(function (reason) {
                console.error(reason);
            });
    });

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy96c29sdC9HaXRIdWIvd2ViZ21lLWN5cGh5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvc2FtcGxlL2FwcC5qcyIsIi9Vc2Vycy96c29sdC9HaXRIdWIvd2ViZ21lLWN5cGh5L3NyYy9hcHAvc2FtcGxlL3ZpZXdzL015Vmlldy9NeVZpZXdDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xuXG52YXIgQ3lQaHlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG5cbiAgICAnZ21lLnNlcnZpY2VzJyxcblxuICAgICdpc2lzLnVpLmNvbXBvbmVudHMnLFxuXG4gICAgJ2N5cGh5LmNvbXBvbmVudHMnLFxuXG4gICAgLy8gYXBwIHNwZWNpZmljIHRlbXBsYXRlc1xuICAgICdjeXBoeS5zYW1wbGUudGVtcGxhdGVzJ1xuXSlcbiAgICAucnVuKGZ1bmN0aW9uICgpIHtcblxuICAgIH0pO1xuXG4vLyBUT0RPOiByZXF1aXJlIGFsbCBvZiB5b3VyIGNvbnRyb2xsZXJzXG5yZXF1aXJlKCcuL3ZpZXdzL015Vmlldy9NeVZpZXdDb250cm9sbGVyJyk7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSAqL1xuXG5hbmd1bGFyLm1vZHVsZSgnQ3lQaHlBcHAnKVxuICAgIC5jb250cm9sbGVyKCdNeVZpZXdDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgRGF0YVN0b3JlU2VydmljZSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ015Vmlld0NvbnRyb2xsZXInKTtcblxuICAgICAgICAkc2NvcGUubW9kZWwgPSB7XG4gICAgICAgICAgICBuYW1lOiAnbGlzdGluZyBwcm9qZWN0cyBbc2V0IGZyb20gY29udHJvbGxlcl0nLFxuICAgICAgICAgICAgcHJvamVjdElkczogW11cbiAgICAgICAgfTtcblxuICAgICAgICBEYXRhU3RvcmVTZXJ2aWNlLmdldFByb2plY3RzKHtkYjogJ215LWRiLWNvbm5lY3Rpb24taWQnfSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChwcm9qZWN0SWRzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsLnByb2plY3RJZHMgPSBwcm9qZWN0SWRzO1xuICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH0pO1xuIl19

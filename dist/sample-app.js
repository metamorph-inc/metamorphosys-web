(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular*/

angular.module( 'CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.sample.templates'
] )
    .run( function () {

    } );

// TODO: require all of your controllers
require( './views/MyView/MyViewController' );
},{"./views/MyView/MyViewController":2}],2:[function(require,module,exports){
/*globals angular, console */

angular.module( 'CyPhyApp' )
    .controller( 'MyViewController', function ( $scope, DataStoreService, ProjectService ) {
        'use strict';

        console.log( 'MyViewController' );

        $scope.model = {
            name: 'listing projects [set from controller]',
            projectIds: []
        };

        DataStoreService.connectToDatabase( 'my-db-connection-id', {
            host: window.location.basename
        } )
            .then( function () {
                console.log( 'connected' );

                ProjectService.getProjects( 'my-db-connection-id' )
                    .then( function ( projectIds ) {
                        $scope.model.projectIds = projectIds;
                    } )
                    .
                catch ( function ( reason ) {
                    console.error( reason );
                } );
            } )
            .
        catch ( function ( reason ) {
            console.error( reason );
        } );

    } );
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvc2FtcGxlL2FwcC5qcyIsIi9Vc2Vycy9sYXN6bG9qdXJhY3ovUHJvamVjdHMvbW9ycGgvd2ViZ21lLWN5cGh5L3NyYy9hcHAvc2FtcGxlL3ZpZXdzL015Vmlldy9NeVZpZXdDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG5hbmd1bGFyLm1vZHVsZSggJ0N5UGh5QXBwJywgW1xuICAgICd1aS5yb3V0ZXInLFxuXG4gICAgJ2dtZS5zZXJ2aWNlcycsXG5cbiAgICAnaXNpcy51aS5jb21wb25lbnRzJyxcblxuICAgICdjeXBoeS5jb21wb25lbnRzJyxcblxuICAgIC8vIGFwcCBzcGVjaWZpYyB0ZW1wbGF0ZXNcbiAgICAnY3lwaHkuc2FtcGxlLnRlbXBsYXRlcydcbl0gKVxuICAgIC5ydW4oIGZ1bmN0aW9uICgpIHtcblxuICAgIH0gKTtcblxuLy8gVE9ETzogcmVxdWlyZSBhbGwgb2YgeW91ciBjb250cm9sbGVyc1xucmVxdWlyZSggJy4vdmlld3MvTXlWaWV3L015Vmlld0NvbnRyb2xsZXInICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUgKi9cblxuYW5ndWxhci5tb2R1bGUoICdDeVBoeUFwcCcgKVxuICAgIC5jb250cm9sbGVyKCAnTXlWaWV3Q29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlLCBEYXRhU3RvcmVTZXJ2aWNlLCBQcm9qZWN0U2VydmljZSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCAnTXlWaWV3Q29udHJvbGxlcicgKTtcblxuICAgICAgICAkc2NvcGUubW9kZWwgPSB7XG4gICAgICAgICAgICBuYW1lOiAnbGlzdGluZyBwcm9qZWN0cyBbc2V0IGZyb20gY29udHJvbGxlcl0nLFxuICAgICAgICAgICAgcHJvamVjdElkczogW11cbiAgICAgICAgfTtcblxuICAgICAgICBEYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKCAnbXktZGItY29ubmVjdGlvbi1pZCcsIHtcbiAgICAgICAgICAgIGhvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZVxuICAgICAgICB9IClcbiAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdjb25uZWN0ZWQnICk7XG5cbiAgICAgICAgICAgICAgICBQcm9qZWN0U2VydmljZS5nZXRQcm9qZWN0cyggJ215LWRiLWNvbm5lY3Rpb24taWQnIClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggcHJvamVjdElkcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tb2RlbC5wcm9qZWN0SWRzID0gcHJvamVjdElkcztcbiAgICAgICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICBjYXRjaCAoIGZ1bmN0aW9uICggcmVhc29uICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCByZWFzb24gKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgIC5cbiAgICAgICAgY2F0Y2ggKCBmdW5jdGlvbiAoIHJlYXNvbiApIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIHJlYXNvbiApO1xuICAgICAgICB9ICk7XG5cbiAgICB9ICk7Il19

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvc2FtcGxlL2FwcC5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvYXBwL3NhbXBsZS92aWV3cy9NeVZpZXcvTXlWaWV3Q29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cblxuYW5ndWxhci5tb2R1bGUoICdDeVBoeUFwcCcsIFtcbiAgICAndWkucm91dGVyJyxcblxuICAgICdnbWUuc2VydmljZXMnLFxuXG4gICAgJ2lzaXMudWkuY29tcG9uZW50cycsXG5cbiAgICAnY3lwaHkuY29tcG9uZW50cycsXG5cbiAgICAvLyBhcHAgc3BlY2lmaWMgdGVtcGxhdGVzXG4gICAgJ2N5cGh5LnNhbXBsZS50ZW1wbGF0ZXMnXG5dIClcbiAgICAucnVuKCBmdW5jdGlvbiAoKSB7XG5cbiAgICB9ICk7XG5cbi8vIFRPRE86IHJlcXVpcmUgYWxsIG9mIHlvdXIgY29udHJvbGxlcnNcbnJlcXVpcmUoICcuL3ZpZXdzL015Vmlldy9NeVZpZXdDb250cm9sbGVyJyApOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlICovXG5cbmFuZ3VsYXIubW9kdWxlKCAnQ3lQaHlBcHAnIClcbiAgICAuY29udHJvbGxlciggJ015Vmlld0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSwgRGF0YVN0b3JlU2VydmljZSwgUHJvamVjdFNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcblxuICAgICAgICBjb25zb2xlLmxvZyggJ015Vmlld0NvbnRyb2xsZXInICk7XG5cbiAgICAgICAgJHNjb3BlLm1vZGVsID0ge1xuICAgICAgICAgICAgbmFtZTogJ2xpc3RpbmcgcHJvamVjdHMgW3NldCBmcm9tIGNvbnRyb2xsZXJdJyxcbiAgICAgICAgICAgIHByb2plY3RJZHM6IFtdXG4gICAgICAgIH07XG5cbiAgICAgICAgRGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZSggJ215LWRiLWNvbm5lY3Rpb24taWQnLCB7XG4gICAgICAgICAgICBob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWVcbiAgICAgICAgfSApXG4gICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnY29ubmVjdGVkJyApO1xuXG4gICAgICAgICAgICAgICAgUHJvamVjdFNlcnZpY2UuZ2V0UHJvamVjdHMoICdteS1kYi1jb25uZWN0aW9uLWlkJyApXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIHByb2plY3RJZHMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubW9kZWwucHJvamVjdElkcyA9IHByb2plY3RJZHM7XG4gICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgY2F0Y2ggKCBmdW5jdGlvbiAoIHJlYXNvbiApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvciggcmVhc29uICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAuXG4gICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCByZWFzb24gKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCByZWFzb24gKTtcbiAgICAgICAgfSApO1xuXG4gICAgfSApOyJdfQ==

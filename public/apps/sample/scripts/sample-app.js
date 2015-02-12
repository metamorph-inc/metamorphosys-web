(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular*/

'use strict';

angular.module( 'CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.sample.templates'
] )
    .run( function () {

        console.log('e');

    } );

// TODO: require all of your controllers
require( './views/MyView/MyViewController' );

},{"./views/MyView/MyViewController":2}],2:[function(require,module,exports){
/*globals angular, console */

angular.module( 'CyPhyApp' )
    .controller( 'MyViewController', function ( $scope, dataStoreService, projectService ) {
        'use strict';

        console.log( 'MyViewController' );

        $scope.model = {
            name: 'listing projects [set from controller]',
            projectIds: []
        };

        dataStoreService.connectToDatabase( 'my-db-connection-id', {
            host: window.location.basename
        } )
            .then( function () {
                console.log( 'connected' );

                projectService.getProjects( 'my-db-connection-id' )
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


//# sourceMappingURL=sample-app.js.map
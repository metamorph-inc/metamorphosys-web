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

    } );

// TODO: require all of your controllers
require( './views/MyView/MyViewController' );

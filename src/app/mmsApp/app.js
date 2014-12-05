/*globals angular, console*/

var CyPhyApp = angular.module('CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.mmsApp.templates'
])
    .run(function () {

    });

// TODO: require all of your controllers
require('./views/MyView/MyViewController');

/*globals console, angular, Chance*/

var demoApp = angular.module('cyphy.ui.DesignDetails.demo', [
    'cyphy.components',
    'cyphy.components.templates'
]);

// overwrite designService with dummy data
demoApp.service('designService', function ($q) {
    'use strict';

    var self = this;
});
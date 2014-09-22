/*globals console, angular, Chance*/

'use strict';

var demoApp = angular.module('cyphy.ui.ComponentList.demo', [
    'cyphy.components',
    'cyphy.components.templates'
]);

// overwrite ComponentService with dummy data
demoApp.service('ComponentService', function () {

});
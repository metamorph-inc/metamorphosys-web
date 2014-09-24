/*globals angular, console*/

var CyPhyApp = angular.module('CyPhyApp', [
    'gme.services',
    'cyphy.components'
])
    .run(function (DataStoreService) {
        DataStoreService.connectToDatabase();
    });

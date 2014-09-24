/*globals angular, console*/

var CyPhyApp = angular.module('CyPhyApp', [
    'gme.services',
    'cyphy.components'
])
    .run(function (DataStoreServiceTest) {
        DataStoreServiceTest.connectToDatabase();
    });

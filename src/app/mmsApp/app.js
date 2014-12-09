/*globals angular, console*/

var CyPhyApp = angular.module('CyPhyApp', [
  'ui.router',

  'gme.services',

  'isis.ui.components',

  'cyphy.components',

  // app specific templates
  'cyphy.mmsApp.templates'
]);

CyPhyApp.config(function ($stateProvider, $urlRouterProvider) {
  'use strict';
  // For any unmatched url, redirect to /workspaces
  $urlRouterProvider.otherwise('/workspaces');
  //
  // Now set up the states
  $stateProvider
    .state('index', {
      url: '/index'
    });
});


CyPhyApp.controller('MainNavigatorController', function ($rootScope, $scope) {
  'use strict';
  $scope.navigator = {};
  $scope.navigator.items = [
    {
      id: 'root',
      label: 'MMS App',
      itemClass: 'cyphy-root'
    }
  ];
  $rootScope.mainNavigator = $scope.navigator;
});

CyPhyApp.run(function ($state, growl, dataStoreService, projectService) {
  'use strict';
  var connectionId = 'mms-connection-id';

  dataStoreService.connectToDatabase(connectionId, {host: window.location.basename})
    .then(function () {
      // select default project and branch (master)
      return projectService.selectProject(connectionId, 'ADMEditor');
    })
    .catch(function (reason) {
      growl.error('ADMEditor does not exist. Create and import it using the <a href="' +
        window.location.origin + '"> webgme interface</a>.');
      console.error(reason);
    });
});
/*globals angular*/

'use strict';

require( './treeNavigator.nodeList.js' );
require( './treeNavigator.header.js' );
require( './treeNavigator.node.label.js' );

angular.module(
  'isis.ui.treeNavigator', [
    'isis.ui.treeNavigator.nodeList',
    'isis.ui.treeNavigator.header',
    'isis.ui.treeNavigator.node.label'
  ] )

.controller( 'TreeNavigatorController', function ( $scope ) {

  $scope.scopeMenuConfig = {
    triggerEvent: 'click',
    position: 'left bottom'
  };

  $scope.preferencesMenuConfig = {
    triggerEvent: 'click',
    position: 'right bottom'
  };


  $scope.config = $scope.config || {};

  $scope.config.collapsedIconClass = $scope.config.collapsedIconClass || 'icon-arrow-right';
  $scope.config.expandedIconClass = $scope.config.expandedIconClass || 'icon-arrow-down';

  $scope.config.extraInfoTemplateUrl = $scope.config.extraInfoTemplateUrl ||
                    '/isis-ui-components/templates/treeNavigator.node.extraInfo.html';

} )

.directive(
  'treeNavigator', function () {
    return {
      scope: {
        treeData: '=',
        config: '='
      },

      restrict: 'E',
      replace: true,
      templateUrl: '/isis-ui-components/templates/treeNavigator.html',
      controller: 'TreeNavigatorController'

    };
  }
);
/*globals angular*/

'use strict';

require( './treeNavigator.node.label.js' );

angular.module(
  'isis.ui.treeNavigator.node', [
    'isis.ui.treeNavigator.node.label'
  ]

)
  .directive(
    'treeNavigatorNode', function () {
      return {
        require: '^treeNavigatorNodeList',
        restrict: 'E',
        replace: true,
        templateUrl: '/isis-ui-components/templates/treeNavigator.node.html'
      };
    }
);
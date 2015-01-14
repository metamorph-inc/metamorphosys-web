/*globals angular*/

'use strict';

require( '../contextmenu/contextmenu.js' );

angular.module(
  'isis.ui.treeNavigator.node.label', [
    'isis.ui.contextmenu',
  ]

)
  .directive(
    'treeNavigatorNodeLabel', function () {
      return {
        require: '^treeNavigatorNodeList',
        restrict: 'E',
        replace: true,
        templateUrl: '/isis-ui-components/templates/treeNavigator.node.label.html'
      };
    }
);
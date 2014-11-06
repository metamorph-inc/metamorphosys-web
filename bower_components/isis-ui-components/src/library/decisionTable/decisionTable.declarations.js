/*globals angular*/

'use strict';

var tableRowHeight = 31,
  tableHeaderHeight = 31;

angular.module(
'isis.ui.decisionTable.declarations', ['ngGrid']

)
.controller('DecisionTableDeclarationsController', function ($scope) {

  $scope.getDeclarationTableGridStyle = function() {

    var height = tableHeaderHeight + 'px';

    if (angular.isArray($scope.declarationsData)) {
      height = tableHeaderHeight + tableRowHeight * $scope.declarationsData.length + 'px';
    }

    return {
      height: height
    };
  };

})
.directive(
'decisionTableDeclarations',
function () {

  return {
    controller: 'DecisionTableDeclarationsController',
    scope: {
      declarationsData: '=',
      declarationsOptions: '='
    },
    restrict: 'E',
    replace: true,
    templateUrl: '/isis-ui-components/templates/decisionTable.declarations.html'

  };
});


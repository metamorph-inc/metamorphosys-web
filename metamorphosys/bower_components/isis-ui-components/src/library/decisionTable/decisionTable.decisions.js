/*globals angular*/

'use strict';

var tableRowHeight = 31,
  tableHeaderHeight = 31,
  cellTemplate;

cellTemplate = '<div class="ngCellText decisions" ng-class="col.colIndex()"><span ng-cell-text>{{COL_FIELD CUSTOM_FILTERS}}</span></div>';

angular.module(
'isis.ui.decisionTable.decisions', ['ngGrid']

)
.controller('DecisionTableDecisionsController', function ($scope) {

  $scope.getDecisionTableGridStyle = function() {

    var height = tableHeaderHeight + 'px';

    if (angular.isArray($scope.decisionsData)) {
      height = tableHeaderHeight + tableRowHeight * $scope.decisionsData.length + 'px';
    }

    return {
      height: height
    };
  };

  angular.forEach($scope.decisionsOptions.columnDefs, function() {
    //columnDef.cellTemplate = cellTemplate;
  });


})
.directive(
'decisionTableDecisions',
function () {

  return {
    controller: 'DecisionTableDecisionsController',
    scope: {
      decisionsData: '=',
      decisionsOptions: '='
    },
    restrict: 'E',
    replace: true,
    templateUrl: '/isis-ui-components/templates/decisionTable.decisions.html'

  };
});


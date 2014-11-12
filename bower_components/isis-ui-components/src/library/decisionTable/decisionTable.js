/*globals angular*/
'use strict';

require('./decisionTable.decisions.js');
require('./decisionTable.declarations.js');

angular.module(
'isis.ui.decisionTable', ['isis.ui.decisionTable.decisions', 'isis.ui.decisionTable.declarations']

)
.controller('DecisionTableController', function ($scope) {

  $scope.declarationsOptions = {
    data: 'declarationsData',
    columnDefs: $scope.tableData.declarations.columnDefs
  };

  $scope.decisionsOptions = {
    data: 'decisionsData',
    columnDefs: $scope.tableData.decisions.columnDefs
  };

})
.directive(
'decisionTable',
function () {

  return {
    scope: {
      tableData: '=',
      config: '='
    },
    controller: 'DecisionTableController',
    restrict: 'E',
    replace: true,
    templateUrl: '/isis-ui-components/templates/decisionTable.html'

  };
});


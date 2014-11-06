/*globals angular*/
'use strict';

var demoApp = angular.module('isis.ui.decisionTable.demo', [ 'isis.ui.decisionTable' ]);

demoApp.service('decisionTableDataProvider', [function () {

  var dummyData;

  dummyData = {
    'declarations': [
      { 'ref': 'ref_e1', 'name': 'event'}
    ],
    'table': {
      'rows': [
        {'event1_a': 'true', 'action_1': 'X'},
        {'action_1': 'a=100', 'event1': 'a&lt;100'}
      ],
      'conditions': {
        'event1_a': {
          'index': 1,
          'exp': 'ref_e1.a'
        },
        'event1': {
          'index': 0,
          'exp': 'ref_e1'
        }
      },
      'actions': {
        'action_1': {
          'index': 0,
          'exp': 'Action.out'
        }
      }

    }
  };


  this.loadData = function () {
    var result,
    conditionsColumnDefs = [],
    actionsColumnDefs = [];


    result = {
      declarations: {
        data: [],
        columnDefs: [
          { field: 'ref', displayName: 'Reference' },
          { field: 'name', displayName: 'Name' }
        ]
      },
      decisions: {
        data: [
          {'event1_a': 'true', 'action_1': 'X'},
          {'action_1': 'a=100', 'event1': 'a&lt;100'}
        ],
        columnDefs: []
      }
    };

    angular.forEach(dummyData.declarations, function(declaration) {
      result.declarations.data.push({
        ref: declaration.ref,
        name: declaration.name
      });
    });

    angular.forEach(dummyData.table.conditions, function (condition, columnName) {
      conditionsColumnDefs[ condition.index ] = {
        field: columnName,
        displayName: condition.exp
      };
    });

    angular.forEach(dummyData.table.actions, function (action, columnName) {
      actionsColumnDefs[ action.index ] = {
        field: columnName,
        displayName: action.exp
      };
    });

    result.decisions.columnDefs = conditionsColumnDefs.concat(actionsColumnDefs);

    return result;
  };

}
])
;

demoApp.controller('DecisionTableDemoController', function ($scope, decisionTableDataProvider) {

  var config,
  initialData;

  config = {

  };

  initialData = decisionTableDataProvider.loadData();

  $scope.tableData = {
    declarations: initialData.declarations,
    decisions: initialData.decisions
  };
  $scope.config = config;
});
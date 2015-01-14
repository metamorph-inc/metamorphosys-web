/*globals angular*/

'use strict';

angular.module(
'isis.ui.selectWidget', [ ]

)
.controller(
'SelectWidgetController', function ($scope) {

  $scope.getDisplayValue = function () {
    var displayValue,
        labelsList;


    if ($scope.modelConfig.multiple) {

      displayValue = $scope.modelConfig.placeHolder;

      if ($scope.myValue && angular.isArray($scope.myValue.value)) {

        labelsList = [];

        angular.forEach($scope.myValue.value, function(opt) {
          labelsList.push(opt.label);
          displayValue = labelsList.join(', ');
        });
      }

    } else {
      displayValue = ($scope.myValue.value && $scope.myValue.value.label) || $scope.modelConfig.placeHolder || '';
    }

    return displayValue;
  };


})
.directive(
'selectWidget', [ 'valueWidgetsService',
  function (valueWidgetsService) {

    var defaultTemplateUrl = '/isis-ui-components/templates/selectWidget.html';

    return {
      restrict: 'E',
      scope: true,
      replace: true,
      require: '^ngModel',
      controller: 'SelectWidgetController',
      link: function (scope, element, attributes, ngModel) {

        scope.myValue = {

        };

        scope.optionsList = scope.modelConfig.options;

        valueWidgetsService.getAndCompileWidgetTemplate(element, scope, defaultTemplateUrl);

        ngModel.$formatters.push(function (modelValue) {
          return modelValue;
        });

        ngModel.$render = function () {
          scope.myValue.value = ngModel.$viewValue;
        };

        ngModel.$parsers.push(function (viewValue) {
          return viewValue;
        });

        scope.$watch('myValue.value', function (val) {
          ngModel.$setViewValue(val);
        });

        ngModel.$render();

      }

    };
  }
]);
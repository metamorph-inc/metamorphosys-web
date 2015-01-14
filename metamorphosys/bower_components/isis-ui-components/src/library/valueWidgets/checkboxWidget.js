/*globals angular*/

'use strict';

angular.module(
'isis.ui.checkboxWidget', [ ]

)
.controller(
'CheckboxWidgetController', function ($scope) {

  $scope.trueLabel = $scope.widgetConfig.trueLabel || 'True';
  $scope.falseLabel = $scope.widgetConfig.falseLabel || 'False';

})
.directive(
'checkboxWidget', [ 'valueWidgetsService',
  function (valueWidgetsService) {

    var defaultTemplateUrl = '/isis-ui-components/templates/checkboxWidget.html';

    return {
      restrict: 'E',
      scope: true,
      replace: true,
      require: '^ngModel',
      controller: 'CheckboxWidgetController',
      link: function ( scope, element, attributes, ngModel ) {

        scope.myValue = {

        };

        valueWidgetsService.getAndCompileWidgetTemplate( element, scope, defaultTemplateUrl );

        ngModel.$formatters.push(function(modelValue) {
          return modelValue;
        });

        ngModel.$render = function() {
          scope.myValue.value = ngModel.$viewValue;
        };

        ngModel.$parsers.push(function(viewValue) {
          return viewValue;
        });

        scope.$watch('myValue.value', function(val) {
          ngModel.$setViewValue(val);
        });

        ngModel.$render();

      }

    };
  }
] );
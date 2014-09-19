/*globals angular*/

'use strict';

require( '../services/isisUIServices.js' );

angular.module(
  'isis.ui.stringWidget', [ 'isis.ui.services' ]

)
  .directive(
    'stringWidget', [ 'isisTemplateService', '$compile',
      function () {

        var defaultTemplateUrl = '/isis-ui-components/templates/stringWidget.html';

        return {
          restrict: 'E',
          replace: true,
          require: '^ngModel',
          link: function ( scope, element ) {
            scope.getAndCompileWidgetTemplate(element, defaultTemplateUrl);
          }

        };
      }
    ] );
/*globals angular*/

'use strict';

require( '../services/isisUIServices.js' );

angular.module(
  'isis.ui.selectWidget', [ 'isis.ui.services' ]

)
  .directive(
    'selectWidget', [ 'isisTemplateService', '$compile',
      function ( isisTemplateService, $compile ) {

        var defaultTemplateUrl = '/isis-ui-components/templates/selectWidget.html';

        return {
          restrict: 'E',
          replace: true,
          require: 'ngModel',
          scope: {
            config: '=',
          },
          link: function ( scope, element, attributes, ngModel ) {

            var templateUrl;

            templateUrl = scope.config && scope.config.templateUrl || defaultTemplateUrl;

            isisTemplateService.getTemplate( scope.config.template, templateUrl )
              .then( function ( template ) {
                element.replaceWidth( $compile( template, scope ) );
              } );

            console.log( ngModel.$viewValue );

          }

        };
      }
    ] );
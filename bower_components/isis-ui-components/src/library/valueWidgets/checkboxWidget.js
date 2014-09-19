/*globals angular*/

'use strict';

require( '../services/isisUIServices.js' );

angular.module(
  'isis.ui.checkboxWidget', [ 'isis.ui.services' ]

)
  .directive(
    'checkboxWidget', [ 'isisTemplateService', '$compile',
      function ( isisTemplateService, $compile ) {

        var defaultTemplateUrl = '/isis-ui-components/templates/checkboxWidget.html';

        return {
          restrict: 'E',
          replace: true,
          require: 'ngModel',
          link: function ( scope, element, attributes, ngModel ) {

            var templateUrl;

            templateUrl = scope.config && scope.config.templateUrl || defaultTemplateUrl;

            isisTemplateService.getTemplate( scope.config.template, templateUrl )
              .then( function ( template ) {
                element.replaceWith( $compile( template, scope ) );
              } );

            console.log( ngModel.$viewValue );

          }


        };
      }
    ] );
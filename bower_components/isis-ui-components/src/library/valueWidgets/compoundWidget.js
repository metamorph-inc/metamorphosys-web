/*globals angular*/


'use strict';

angular.module(
  'isis.ui.compoundWidget', [ 'isis.ui.services' ]

)
  .directive(
    'compoundWidget', [ 'isisTemplateService', '$compile',
      function ( isisTemplateService, $compile ) {

        var defaultTemplateUrl = '/isis-ui-components/templates/compoundWidget.html';

        return {
          restrict: 'E',
          replace: true,
          require: 'ngModel',
          scope: {
            config: '='
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
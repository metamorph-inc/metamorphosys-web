/*globals angular*/

'use strict';

require( '../validationErrorMarker/validationErrorMarker.js' );

require( './checkboxWidget.js' );
require( './compoundWidget.js' );
require( './selectWidget.js' );
require( './stringWidget.js' );

//require( 'angular-bindonce');

var availableWidgets = {
  'string': [ 'stringWidget', 'string-widget' ],
  'compound': [ 'compoundWidget', 'compound-widget' ],
  'checkbox': [ 'checkboxWidget', 'checkbox-widget' ],
  'select': [ 'selectWidget', 'select-widget' ]
},

widgetModules = [];

angular.forEach( availableWidgets, function ( value ) {
  this.push( 'isis.ui.' + value[ 0 ] );
}, widgetModules );

angular.module( 'isis.ui.valueWidgets', [ 'isis.ui.validationErrorMarker' ].concat( widgetModules ) )

.factory( 'valueWidgetsService', function ( isisTemplateService, $compile ) {

  var services = {

    getWidgetElementForType: function ( type ) {

      var result = availableWidgets[ type ] && availableWidgets[ type ][ 1 ];

      if ( !result ) {
        result = 'string-widget';
      }

      return result;

    },

    getAndCompileWidgetTemplate: function ( widgetElement, $scope, defaultTemplateUrl ) {

      var templateUrl,
      templateElement;

      templateUrl = $scope.widgetConfig && $scope.widgetConfig.templateUrl || defaultTemplateUrl;

      isisTemplateService.getTemplate( $scope.widgetConfig.template, templateUrl )
      .then( function ( template ) {
        templateElement = angular.element( template );
        widgetElement.replaceWith( templateElement );
        $compile( templateElement )( $scope );
      } );
    }
  };

  return services;

} )
.controller( 'ValueWidgetController', function () {

} )
.directive( 'valueWidget',
function () {
  return {
    restrict: 'E',
    replace: true,
    require: 'ngModel',
    templateUrl: '/isis-ui-components/templates/valueWidget.html',
    scope: {
      model: '=ngModel',
      modelConfig: '=?',

      inputConfig: '=?',

      widgetType: '=?',
      widgetMode: '=?',
      widgetConfig: '=?',
      widgetDisabled: '=?'

    },
    priority: 0,
    controller: 'ValueWidgetController',
    link: function ( scope, element, attributes, ngModel ) {

      scope.modelConfig = scope.modelConfig || {};
      scope.widgetConfig = scope.widgetConfig || {};
      scope.inputConfig = scope.inputConfig || {};

      scope.placeHolder = scope.modelConfig.placeHolder || 'Enter value';

      if ( angular.isObject( scope.modelConfig.validators ) ) {

        ngModel.$validators = ngModel.$validators || {};
        scope.validatorMessages = scope.validatorMessages || {};

        angular.forEach( scope.modelConfig.validators, function ( validatorDescriptor ) {
          if ( angular.isFunction( validatorDescriptor.method ) ) {
            ngModel.$validators[validatorDescriptor.id] = validatorDescriptor.method;
            scope.validatorMessages[validatorDescriptor.id] = validatorDescriptor.errorMessage;
          }
        } );

      }

      if ( angular.isFunction( scope.modelConfig.modelChange ) ) {
        ngModel.$viewChangeListeners.push( function () {
          scope.modelConfig.modelChange(ngModel.$modelValue);
        } );

      }
    }
  };
})
.
directive( 'valueWidgetBody', [ '$log', '$compile', 'valueWidgetsService',
  function ( $log, $compile, valueWidgetsService ) {

    return {
      restrict: 'E',
      replace: true,
      require: ['^ngModel', '^valueWidget'],
      templateUrl: '/isis-ui-components/templates/valueWidget.body.html',
      priority: 0,

      compile: function () {
        return {
          pre: function ( scope ) {

            if ( !scope.widgetMode ) {
              scope.widgetMode = 'edit';
            }

          },
          post: function ( scope, element ) {

            var
            widgetTemplateStr,
            widgetElement,
            widgetType,
            widgetDirective,
            newWidgetDirective,
            linkIt;

            linkIt = function () {

              if ( scope.widgetType ) {
                widgetType = scope.widgetType;
              } else {

                if ( typeof scope.model === 'boolean' ) {
                  widgetType = 'checkbox';
                }

              }

              newWidgetDirective = valueWidgetsService.getWidgetElementForType( widgetType );

              if ( widgetDirective !== newWidgetDirective ) {

                widgetDirective = newWidgetDirective;

                widgetTemplateStr = '<' + widgetDirective + '>' +
                '</' + widgetDirective + '>';

                $log.log( widgetTemplateStr );

                widgetElement = angular.element( widgetTemplateStr );

                element.empty();
                element.append( widgetElement );
                $compile( widgetElement )( scope );

              }

            };

            scope.$watch( 'widgetType', function () {
              linkIt();
            } );

            scope.$watch( 'widgetMode', function () {
              linkIt();
            } );

          }
        };
      }
    };

  }
] );
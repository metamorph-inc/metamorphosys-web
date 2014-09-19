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

.factory( '$valueWidgets', function () {
  var getWidgetElementForType;

  getWidgetElementForType = function ( type ) {

    var result = availableWidgets[ type ] && availableWidgets[ type ][ 1 ];

    if ( !result ) {
      result = 'string-widget';
    }

    return result;

  };

  return {
    getWidgetElementForType: getWidgetElementForType
  };
} )
.controller( 'ValueWidgetController', function ( $scope, isisTemplateService, $compile ) {

  $scope.getAndCompileWidgetTemplate = function ( widgetElement, defaultTemplateUrl ) {

    var templateUrl,
    templateElement;

    templateUrl = $scope.widgetConfig && $scope.widgetConfig.templateUrl || defaultTemplateUrl;

    isisTemplateService.getTemplate( $scope.widgetConfig.template, templateUrl )
    .then( function ( template ) {
      templateElement = angular.element( template );
      widgetElement.replaceWith( templateElement );
      $compile( templateElement )( $scope );
    } );
  };

} )
.directive( 'valueWidget',
function () {
  return {
    restrict: 'E',
    replace: true,
    require: 'ngModel',
    templateUrl: '/isis-ui-components/templates/valueWidget.html',
    scope: {
      value: '=ngModel',
      widgetType: '=?',
      widgetConfig: '=?',
      widgetMode: '=?',
      inputLabel: '=?',
      inputName: '=?',
      inputId: '=?'
    },
    priority: 0,

    controller: 'ValueWidgetController'
  };
} )
.directive( 'valueWidgetBody', [ '$log', '$compile', '$valueWidgets',
  function ( $log, $compile, $valueWidgets ) {

    return {
      restrict: 'E',
      replace: true,
      require: ['^ngModel', '^valueWidget'],
      templateUrl: '/isis-ui-components/templates/valueWidget.body.html',
      priority: 0,

      compile: function () {
        return {
          pre: function ( scope ) {

            if ( !scope.widgetConfig ) {
              scope.widgetConfig = {
                placeHolder: 'Enter a value'
              };
            }


            if ( !scope.widgetMode ) {
              scope.widgetMode = 'edit';
            }

          },
          post: function ( scope, element, attributes, controllers ) {

            var
            widgetTemplateStr,
            widgetElement,
            widgetType,
            widgetDirective,
            newWidgetDirective,
            linkIt,
            ngModel;

            ngModel = controllers[0];

            if ( scope.widgetConfig && angular.isObject( scope.widgetConfig.validators ) ) {

              ngModel.$validators = ngModel.$validators || {};
              scope.validatorMessages = scope.validatorMessages || {};

              angular.forEach( scope.widgetConfig.validators, function ( validatorDescriptor, validatorId ) {
                if ( angular.isFunction( validatorDescriptor.method ) ) {
                  ngModel.$validators[validatorId] = validatorDescriptor.method;
                  scope.validatorMessages[validatorId] = validatorDescriptor.errorMessage;
                }
              } );

            }

            linkIt = function () {

              if ( scope.widgetType ) {
                widgetType = scope.widgetType;
              } else {

                if ( typeof scope.value === 'boolean' ) {
                  widgetType = 'checkbox';
                }

              }

              newWidgetDirective = $valueWidgets.getWidgetElementForType( widgetType );

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
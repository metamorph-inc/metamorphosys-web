/*globals define, angular, alert*/


define( [
  'angular',

  './stringWidget',
  './compoundWidget',
  './checkboxWidget',
  './selectWidget'

], function ( ng ) {

  'use strict';

  var availableWidgets = {
    'string': [ 'stringWidget', 'string-widget' ],
    'compound': [ 'compoundWidget', 'compound-widget' ],
    'checkbox': [ 'checkboxWidget', 'checkbox-widget' ],
    'select': [ 'selectWidget', 'select-widget' ]
  },
    widgetModules = [];

  angular.forEach( availableWidgets, function ( value, key ) {
    this.push( 'isis.ui.' + value[ 0 ] );
  }, widgetModules );

  angular.module(
    'isis.ui.valueWidgets',

    widgetModules

  )
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
    .directive( 'valueWidget', [ '$log', '$compile', '$valueWidgets',
      function ( $log, $compile, $valueWidgets ) {

        return {
          restrict: 'E',
          replace: true,
          scope: {
            config: '=',
            value: '=',
            unresponsive: '='
          },

          compile: function ( $elm, $attrs ) {
            return {
              pre: function ( $scope, $elm, $attrs, controllers ) {

                if ( !$scope.config ) {
                  $scope.config = {
                    mode: 'edit'
                  };
                }

              },
              post: function ( $scope, $elm, $attrs ) {

                var
                templateStr,
                  template,
                  widgetType,
                  widgetElement;

                if ( angular.isObject( $scope.value ) ) {

                  if ( angular.isObject( $scope.value.widget ) ) {
                    widgetType = $scope.value.widget.type;
                  } else {


                    if ( typeof $scope.value.value === 'boolean' ) {
                      widgetType = 'checkbox';
                    }

                  }

                }


                widgetElement = $valueWidgets.getWidgetElementForType( widgetType );

                templateStr = '<' + widgetElement +
                  ' value="value" config="config" unresponsive="unresponsive">' +
                  '</' + widgetElement + '>';

                $log.log( templateStr );

                template = angular.element( templateStr );

                $elm.append( $compile( template )( $scope ) );

              }
            };
          }
        };

      }
    ] );


} );
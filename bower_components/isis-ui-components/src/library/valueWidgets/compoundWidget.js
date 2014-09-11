/*globals define, angular, alert*/


define( [
  'angular',
  'text!./templates/compoundWidget.html',
  'css!./styles/compoundWidget.css'

], function ( ng, template ) {

  'use strict';

  angular.module(
    'isis.ui.compoundWidget', []

  )
    .directive(
      'compoundWidget',
      function () {

        return {
          restrict: 'E',
          replace: true,
          template: template,
          scope: {
            config: '=',
            value: '=',
            unresponsive: '='
          }

        };
      } );


} );
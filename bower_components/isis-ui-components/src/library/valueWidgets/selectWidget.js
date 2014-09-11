/*globals define, angular, alert*/


define( [
  'angular',
  'text!./templates/selectWidget.html',
  'css!./styles/selectWidget.css'

], function ( ng, template ) {

  'use strict';

  angular.module(
    'isis.ui.selectWidget', []

  )
    .directive(
      'selectWidget',
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
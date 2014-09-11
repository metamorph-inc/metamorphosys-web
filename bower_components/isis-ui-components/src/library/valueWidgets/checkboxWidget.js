/*globals define, angular, alert*/


define( [
  'angular',
  'text!./templates/checkboxWidget.html',
  'css!./styles/checkboxWidget.css'

], function ( ng, template ) {

  'use strict';

  angular.module(
    'isis.ui.checkboxWidget', []

  )
    .directive(
      'checkboxWidget',
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
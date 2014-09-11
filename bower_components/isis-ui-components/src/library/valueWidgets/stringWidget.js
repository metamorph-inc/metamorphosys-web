/*globals define, angular, alert*/


define( [
  'angular',
  'text!./templates/stringWidget.html',
  'css!./styles/stringWidget.css'

], function ( ng, template ) {

  'use strict';

  angular.module(
    'isis.ui.stringWidget', []

  )
    .directive(
      'stringWidget',
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
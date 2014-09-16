/*global angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

define(['text!./views/DesertConfigurationsView.html'], function (DesertConfigurationsView) {
    'use strict';

    angular.module('cyphy.ui.desertConfigurations', [])
        .controller('DesertConfigurationController', function ($scope) {
            var i;

            $scope.configurations = [];

            for (i = 0; i < Math.floor(Math.random() * 10); i += 1) {
                $scope.configurations.push({
                    name: $scope.setId + ' ' + i
                });
            }


            $scope.notify = function (cfg) {
                // TODO: call callback functions defined on config object
                console.log(cfg, 'changed');
            };
        })
        .directive('desertConfigurations', function () {
            return {
                scope: {
                    setId: '=',
                    config: '='
                },
                restrict: 'E',
                replace: true,
                template: DesertConfigurationsView,
                controller: 'DesertConfigurationController'
            };
        });

});
/*global angular, console, define*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

define(['text!./views/DesertConfigurationsView.html'], function (DesertConfigurationsView) {
    'use strict';

    angular.module('cyphy.ui.desertConfigurations', ['cyphy.services'])
        .controller('DesertConfigurationController', function ($scope, DesertConfigurationServices) {
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
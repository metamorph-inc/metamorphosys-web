/*globals angular*/

'use strict';

angular.module(
    'mms.keyboardMap', [])

    .directive(
    'keyboardMap',

    function () {

        return {
            scope: {},
            restrict: 'E',
            replace: true,
            controller: function ($scope, $mdDialog, $timeout) {

                var self = this;

                this.tooltipStatus = {};

                this.showMap = function (ev) {
                    function DialogController($scope, $mdDialog) {

                        $scope.hide = function () {
                            $mdDialog.hide();
                        };

                        $scope.close = function () {
                            $mdDialog.cancel();
                        };

                        $scope.keyboardMap = require('./keyboardMapRegistry.js');
                    }

                    $timeout(function(){
                        self.tooltipStatus = {};
                    }, 500);

                    $mdDialog.show({
                        controller: DialogController,
                        templateUrl: '/mmsApp/templates/keyboardMap.html',
                        targetEvent: ev
                    })
                        .then(function () {
                        });
                };

            },
            bindToController: true,
            controllerAs: 'ctrl',
            templateUrl: '/mmsApp/templates/keyboardMapButton.html',
            link: function () {
            }
        };
    }
);

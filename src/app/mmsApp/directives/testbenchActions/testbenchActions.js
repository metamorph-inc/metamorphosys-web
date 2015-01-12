/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module('mms.testbenchActions', [
    'ngMaterial'
])
    .controller('TestbenchActionsController', function ($scope, $mdDialog, $mdToast, $log) {

        var progressMessage,
            tooltipMessage,
            progressTooltipMessage;

        tooltipMessage = 'Generate PCB';
        progressTooltipMessage = 'PCB generation in progress...';
        progressMessage = 'PCB generation in progress. It will take a couple of minutes...';

        $scope.testbenchRuns = {

            testPCBResult1: {

                id: 'testPCBResult1',
                name: 'Generated PCB',
                timestamp: Date.now(),
                visualUrl: 'images/testPCBResult.png',
                attachments: [
                    {
                        name: 'Download Eagle file',
                        url: 'http://google.com'
                    }
                ],
                status: 'SUCCESS'


            },

            testPCBResult2: {

                id: 'testPCBResult1',
                name: 'Generated PCB',
                timestamp: Date.now(),
                visualUrl: 'images/testPCBResult.png',
                attachments: [
                    {
                        name: 'Download Eagle file',
                        url: 'http://google.com'
                    }
                ],
                status: 'SUCCESS'

            }


        };

        $scope.setBusy = function () {

            $scope.busy = true;
            $scope.tooltipMessage = progressTooltipMessage;

        };

        $scope.setReady = function () {

            $scope.busy = false;
            $scope.tooltipMessage = tooltipMessage;

        };

        $scope.showResults = function (id, ev) {

            function ShowResultsDialogController($scope, $mdDialog, result) {

                console.log('eeee' + result);

                $scope.result = result;

                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.close = function () {
                    $mdDialog.hide();
                };
            }

            $mdDialog.show({
                controller: ShowResultsDialogController,
                templateUrl: '/mmsApp/templates/testbenchResult.html',
                locals: {
                  result: $scope.testbenchRuns[id]
                },
                targetEvent: ev
            })
                .then(function () {
                });

        };

        $scope.startTestbench = function () {

            $scope.setBusy();

            $mdToast.show({
                    controller: 'TestbenchActionsToastController',
                    templateUrl: '/mmsApp/templates/testbenchToast.html',
                    locals: {
                        message: progressMessage
                    },
                    hideDelay: 5000
                }
            );

        };

        $scope.setReady();
        $scope.showResults('testPCBResult1');


    })
    .directive('testbenchActions', [
        function () {

            return {
                controller: 'TestbenchActionsController',
                restrict: 'E',
                scope: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/testbenchActions.html'
            };
        }])

    .controller('TestbenchActionsToastController',
        function ($scope, $mdToast, message) {

        $scope.progressMessage = message || 'Job execution has started...';


        $scope.closeToast = function () {
            $mdToast.hide();
        };


    });

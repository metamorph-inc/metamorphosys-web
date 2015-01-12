/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.testbenchActions', [
    'ngMaterial'
] )
    .controller('TestBenchActionsController', function(

        $scope, $mdDialog, $mdToast, $log){

        $scope.testbenchRuns = {

            testPCBResult1: {

                id: 'testPCBResult1',
                timestamp: Date.now(),
                visualUrl: '',
                status: 'SUCCESS'


            },

            testPCBResult2: {

                id: 'testPCBResult2',
                timestamp: Date.now(),
                visualUrl: '',
                status: 'FAILED_TO_EXECUTE'


            }


        };

        $scope.setBusy = function() {

            $scope.busy = true;
            $scope.tooltipMessage = 'PCB generation in progress...';

        };

        $scope.setReady = function() {

            $scope.busy = false;
            $scope.tooltipMessage = 'Generate PCB';

        };

        $scope.openSubscribeDialog = function(ev) {

            function DialogController($scope, $mdDialog) {

                $scope.user = {

                };

                $scope.hide = function() {
                    $mdDialog.hide();
                };
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };
                $scope.send = function(userFields) {
                    $mdDialog.hide(userFields);
                };
            }

            $mdDialog.show({
                controller: DialogController,
                templateUrl: '/mmsApp/templates/subscribeDialog.html',
                targetEvent: ev
            })
                .then(function(fields) {
                    $log.debug('Subscription', fields);
                }, function() {
                    $log.debug('Subscription cancelled.');
                });

        };

        $scope.showResults = function(ev, id) {

            function DialogController($scope, $mdDialog, $window) {

                $scope.designUrl = $window.location.href;


                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.close = function () {
                    $mdDialog.hide();
                };
            }

            $mdDialog.show({
                controller: DialogController,
                templateUrl: '/mmsApp/templates/shareDialog.html',
                targetEvent: ev
            })
                .then(function () {
                });

        };

        $scope.startTestbench = function() {

            $scope.setBusy();

            $mdToast.show({

                    'template': '<span>Jaaaa!</span>',
                    'hideDelay': 0
                }
            );

        };

        $scope.setReady();
//        $scope.showResults('testPCBResult');


    })
    .directive( 'testbenchActions', [
        function () {

            return {
                controller: 'TestBenchActionsController',
                restrict: 'E',
                scope: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/testbenchActions.html'
            };
        }] );

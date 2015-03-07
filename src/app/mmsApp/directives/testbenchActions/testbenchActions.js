/*globals angular, ga*/

'use strict';

// Move this to GME eventually

angular.module('mms.testbenchActions', [
    'ngMaterial'
])
    .controller('TestbenchActionsController', function (
        $scope, $rootScope, $mdDialog, $mdToast, $timeout, testBenchService, $log, projectHandling) {

        var progressMessage,
            tooltipMessage,
            progressTooltipMessage,

            findResultById;

        tooltipMessage = 'Generate PCB';
        progressTooltipMessage = 'PCB generation in progress...';
        progressMessage = 'PCB generation in progress. It will take a couple of minutes...';

        findResultById = function (id) {

            var result;

            angular.forEach($scope.testbenchResults, function (aResult) {

                if (aResult.id === id) {
                    result = aResult;
                }

            });

            return result;

        };

        $scope.wsContext = projectHandling.getWorkspaceContext();

        angular.forEach(projectHandling.getAvailableTestbenches(), function(tb) {
            $scope.testbench = tb;
        });

        $scope.testbenchResults = [

            //{
            //
            //    id: 'testPCBResult1',
            //    name: 'Generated PCB 1',
            //    timestamp: Date.now(),
            //    visualUrl: 'images/testPCBResult.png',
            //    attachments: [
            //        {
            //            name: 'Download Eagle file',
            //            url: 'http://google.com'
            //        }
            //    ],
            //    status: 'SUCCESS'
            //
            //
            //},
            //
            //{
            //
            //    id: 'testPCBResult2',
            //    name: 'Generated PCB 2',
            //    timestamp: Date.now(),
            //    visualUrl: 'images/testPCBResult.png',
            //    attachments: [
            //        {
            //            name: 'Download Eagle file',
            //            url: 'http://google.com'
            //        }
            //    ],
            //    status: 'FAILURE'
            //
            //},
            //
            //{
            //
            //    id: 'testPCBResult3',
            //    name: 'Generated PCB 3',
            //    timestamp: Date.now(),
            //    visualUrl: 'images/testPCBResult.png',
            //    attachments: [
            //        {
            //            name: 'Download Eagle file',
            //            url: 'http://google.com'
            //        }
            //    ],
            //    status: 'FAILURE'
            //
            //}


        ];

        $scope.setBusy = function () {

            $rootScope.runningTestbench = $scope.busy = true;
            $scope.tooltipMessage = progressTooltipMessage;

        };

        $scope.setReady = function () {

            $rootScope.runningTestbench = $scope.busy = false;
            $scope.tooltipMessage = tooltipMessage;

        };

        $scope.showResults = function (id, ev) {

            var result;

            ga('send', 'event', 'testbench', 'result', id);

            function ShowResultsDialogController($scope, $mdDialog, results, currentResult) {

                $scope.results = results;
                $scope.state = {
                    currentResult: currentResult
                };

                $scope.selectedIndex = results.indexOf(currentResult);

                $scope.setSelected = function (index) {

                    $scope.selectedIndex = index;

                    $timeout(function () {
                        $scope.state.curretResult = results[index];
                        console.log(results[index]);
                    });

                };

                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.close = function () {
                    $mdDialog.hide();
                };
            }

            if (id !== undefined) {
                result = findResultById(id);
            } else {
                result = $scope.testbenchResults[0];
            }

            if (angular.isObject(result)) {


                $mdDialog.show({
                    controller: ShowResultsDialogController,
                    templateUrl: '/mmsApp/templates/testbenchResult.html',
                    locals: {
                        results: $scope.testbenchResults,
                        currentResult: result
                    },
                    targetEvent: ev
                })
                    .then(function () {
                    });
            }

        };

        $rootScope.startTestbench = $scope.startTestbench = function () {

            var onTestbenchFailed;

            onTestbenchFailed = function(e) {
                $log.error('Testbench execution failed!', e);
                $scope.testbenchResultNotify();
                $scope.setReady();
            };

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

            ga('send', 'event', 'testbench', 'start');

            testBenchService.runTestBench($scope.wsContext, $scope.testbench.id)
                .then(function (resultData) {

                    var newResult,
                        visualUrl,
                        downloadUrl,
                        timestamp,
                        hash,
                        id;

                    if (resultData && resultData.success === true) {

                        $log.debug('testbench result', resultData);

                        hash = resultData.artifacts['all.zip'].hash;

                        visualUrl = '/rest/blob/view/' + hash + '/results/eagle-board.png';
                        downloadUrl = '/rest/blob/download/' + hash + '/results/eagle-board.brd';

                        timestamp = Date.now();
                        id = hash + '_' + timestamp;

                        newResult = {
                            id: id,
                            name: 'Generated PCB ' + ( $scope.testbenchResults.length + 1 ),
                            timestamp: timestamp,
                            visualUrl: visualUrl,
                            attachments: [
                                {
                                    name: 'Download Eagle File',
                                    url: downloadUrl
                                }
                            ],
                            status: 'SUCCESS'
                        };

                        $scope.testbenchResults.push(newResult);

                        $scope.testbenchResultNotify(id);
                        $scope.setReady();

                        ga('send', 'event', 'testbench', 'received');


                    } else {
                        onTestbenchFailed(resultData);

                        ga('send', 'event', 'testbench', 'failed');
                    }

                }).
                catch(function (e) {
                    onTestbenchFailed(e);
                });

        };

        $scope.testbenchResultNotify = function (id) {

            var result,

                message,
                delay;

            result = findResultById(id);


            if (angular.isObject(result) && result.status === 'SUCCESS') {

                message = 'Generated PCB available.';
                delay = 0;


            } else {

                message = 'PCB generation errored.';
                delay = 0;

            }

            $mdToast.show({
                    controller: 'TestbenchResultToastController',
                    templateUrl: '/mmsApp/templates/testbenchResultToast.html',
                    locals: {
                        result: result,
                        message: message,
                        showAction: function (id, $event) {
                            $scope.showResults(id, $event);

                        }
                    },
                    hideDelay: delay
                }
            );

        };

        $scope.setReady();
//        $scope.showResults('testPCBResult1');
//        $scope.testbenchResultNotify('testPCBResult4');


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

    .controller('TestbenchResultToastController',
    function ($scope, $mdToast, message, result, showAction) {

        $scope.result = result;

        $scope.success = false;
        $scope.success = result && result.status === 'SUCCESS';

        $scope.progressMessage = message || 'Job execution has started...';


        $scope.closeToast = function () {
            $mdToast.hide();
        };

        $scope.showResult = function ($event) {

            $scope.closeToast();
            showAction(result.id, $event);

        };


    })
    .controller('TestbenchActionsToastController',
    function ($scope, $mdToast, message) {


        $scope.progressMessage = message || 'Job execution has started...';


        $scope.closeToast = function () {
            $mdToast.hide();
        };


    });


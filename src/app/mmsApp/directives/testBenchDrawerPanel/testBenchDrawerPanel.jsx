'use strict';

require('./testBenchResultAndTime.jsx');
require('./testBenchConfig.js');

function TestBenchStartedToastController($scope, $mdToast, message) {

    $scope.progressMessage = message;

    $scope.closeToast = function () {
        $mdToast.hide();
    };

}

function TestBenchCompletedToastController($scope, $mdToast, message, result, success, showAction) {

    $scope.result = result;

    $scope.success = success;

    $scope.progressMessage = message || 'Job execution has started...';

    $scope.closeToast = function () {
        $mdToast.hide();
    };

    $scope.showResult = function ($event) {

        $scope.closeToast();
        showAction(result.id, $event);

    };


}


angular.module('mms.testBenchDrawerPanel', [
    'cyphy.services',
    'mms.testBenchDrawerPanel.resultAndTime',
    'mms.testBenchDrawerPanel.testBenchConfig',
    'ngMaterial'
])
.run(function($mdToast, testBenchService) {

    testBenchService.addEventListener(
        'testBenchStarted',
        function(e) {

            $mdToast.show({
                    controller: TestBenchStartedToastController,
                    templateUrl: '/mmsApp/templates/testBenchStartedToast.html',
                    locals: {
                        message: e.data.name + ' started'
                    },
                    hideDelay: 5000
                }
            );
        }
    );

    testBenchService.addEventListener(
        'testBenchCompleted',
        function(e) {

            var message,
                delay,
                success = false;

            if (e.data.lastResult.status === 'Succeeded') {
                message = e.data.name + ' completed';
                delay = 0;
                success = true;
            } else {
                message = e.data.name + ' errored';
                delay = 0;
            }

            $mdToast.show({
                    controller: TestBenchCompletedToastController,
                    templateUrl: '/mmsApp/templates/testBenchCompletedToast.html',
                    locals: {
                        result: e.data.lastResult,
                        message: message,
                        showAction: function (id, $event) {
                            //$scope.showResults(id, $event);
                            //TODO: hook up showing the result here

                            console.warn('Show results should be hooked up here', $event);

                        },
                        success: true
                    },
                    hideDelay: delay
                }
            );
        }
    );

    testBenchService.addEventListener(
        'testBenchException',
        function() {
            // Show TB error message here
        }
    );

})
.directive('testBenchDrawerPanelTestList', function() {

    function TestListController($scope, testBenchService) {

        var self = this;

        this.listData = {
            items: []
        };

        testBenchService.getTestBenches().then(function (testBenches) {
            testBenches.forEach(testBench => {

                var listItem = {
                    id: testBench.id,
                    title: testBench.name,
                    headerTemplateUrl: '/mmsApp/templates/testListHeaderTemplate.html',
                    detailsTemplateUrl: '/mmsApp/templates/testListDetailsTemplate.html',
                    configDirective: 'dummy-test-bench-config',
                    testBench: testBench,
                    details: true,
                    runTest: function (item) {
                        testBenchService.runTestBench(item.id);
                    },
                    openLastResult: function(item) {
                        console.log('Last result should be opened', item);
                    }

                };

                console.log(testBench);

                self.listData.items.push(listItem);

            });
        });

        this.config = {

            sortable: false,
            secondaryItemMenu: false,
            detailsCollapsible: true,
            showDetailsLabel: 'Configure',
            hideDetailsLabel: 'Configure',

            itemClick: function (event, item) {
                console.log('Clicked: ' + item);
            },
            detailsRenderer: function (item) {
                item.details = 'My details are here now!';
            }

        };

        // function onResultsChanged(event) {
        //
        //     if (event.data && event.data.newResult) {
        //
        //         var testBench = event.data.newResult.testBench;
        //
        //         console.log('Testbecnhs last result changed for test bench', testBench);
        //
        //     }
        //
        // }
        //
        // testBenchService.addEventListener('resultsChanged', onResultsChanged);
        //
        // $scope.$on('$destroy', function() {
        //     testBenchService.removeEventListener('resultsChanged', onResultsChanged);
        // });


    }

    return {
        restrict: 'E',
        controller: TestListController,
        controllerAs: 'ctrl',
        bindToController: true,
        replace: true,
        transclude: true,
        scope: true,
        templateUrl: '/mmsApp/templates/testBenchDrawerPanelTestList.html'
    };
})

.directive('testBenchDrawerPanelResultList', function() {

    function ResultListController($scope, testBenchService) {

        var self = this,
            testBenchResultsPromise = testBenchService.getTestBenchResults(),
            setListItems = function (testBenchResults) {
                self.listData.items.splice(0, self.listData.items.length);
                testBenchResults.forEach(testBenchResult => {

                    var listItem = {
                        id: testBenchResult.id,
                        title: testBenchResult.testBench && testBenchResult.testBench.name,
                        headerTemplateUrl: '/mmsApp/templates/resultListHeaderTemplate.html'
                    };

                    self.listData.items.push(listItem);

                    console.log(testBenchResult);

                });
            };

        this.listData = {
            items: []
        };

        testBenchResultsPromise.then(setListItems);

        function onResultsChanged(event) {
            setListItems(event.data.results);
        }

        testBenchService.addEventListener('resultsChanged', onResultsChanged);

        $scope.$on('$destroy', function() {
            testBenchService.removeEventListener('resultsChanged', onResultsChanged);
        });

        this.config = {

            sortable: false,
            secondaryItemMenu: false,
            detailsCollapsible: true,

            itemClick: function (event, item) {
                console.log('Clicked: ' + item);
            },
            detailsRenderer: function (item) {
                item.details = 'My details are here now!';
            }

        };

    }

    return {
        restrict: 'E',
        controller: ResultListController,
        controllerAs: 'ctrl',
        bindToController: true,
        scope: true,
        replace: true,
        transclude: false,
        templateUrl: '/mmsApp/templates/testBenchDrawerPanelResultList.html'
    };
});

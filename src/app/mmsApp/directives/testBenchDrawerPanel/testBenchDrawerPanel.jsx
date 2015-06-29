'use strict';

angular.module('mms.testBenchDrawerPanel', [
    'cyphy.services'
])

.directive('testBenchDrawerPanelTestList', function() {

    function TestListController(testBenchService) {

        var self = this,
            testBenches = testBenchService.getTestBenches();

        this.listData = {
            items: []
        };

        testBenches.forEach(testBench => {

            var listItem = {
                id: testBench.id,
                title: testBench.name
            };

            self.listData.items.push(listItem);

            console.log(this.listData);

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
        controller: TestListController,
        controlerAs: 'ctrl',
        bindToController: true,
        scope: {
            tests: '='
        },
        replace: true,
        transclude: false,
        templateUrl: '/mmsApp/templates/testBenchDrawerPanelTestList.html'
    };
})

.directive('testBenchDrawerPanelResultList', function() {

    function ResultListController(testBenchService) {

        var testBenchResults = testBenchService.getTestBenchResults();

        this.listData = {
            items: []
        };

        testBenchResults.forEach(testBenchResult => {
            console.log(testBenchResult);
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
        controlerAs: 'ctrl',
        bindToController: true,
        scope: {
            results: '='
        },
        replace: true,
        transclude: false,
        templateUrl: '/mmsApp/templates/testBenchDrawerPanelResultList.html'
    };
});

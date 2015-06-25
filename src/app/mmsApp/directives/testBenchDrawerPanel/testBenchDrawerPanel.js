'use strict';

angular.module('mms.testBenchDrawerPanel', [

])

.directive('testBenchDrawerPanelTestList', function() {

    class TestListController {

        constructor() {

            this.listData = {
                items: []
            };

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

    }

    return {
        restrict: 'E',
        controller: TestListController.constructor,
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

    class ResultListController {

        constructor() {

            this.listData = {
                items: []
            };

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

    }

    return {
        restrict: 'E',
        controller: ResultListController.constructor,
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

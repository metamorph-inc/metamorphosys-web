angular.module('adaptv.adaptStrap.tableajax', ['adaptv.adaptStrap.utils', 'adaptv.adaptStrap.loadingindicator'])
/**
 * Use this directive if you need to render a table that loads data from ajax.
 */
  .directive('adTableAjax',
  ['$parse', '$adConfig', 'adLoadPage', 'adDebounce', 'adStrapUtils',
    function ($parse, $adConfig, adLoadPage, adDebounce, adStrapUtils) {
      'use strict';
      function controllerFunction($scope, $attrs) {
        // ---------- $scope initialization ---------- //
        $scope.attrs = $attrs;
        $scope.iconClasses = $adConfig.iconClasses;
        $scope.adStrapUtils = adStrapUtils;
        $scope.items = {
          list: undefined,
          paging: {
            currentPage: 1,
            totalPages: undefined,
            pageSize: Number($attrs.pageSize) || 10,
            pageSizes: $parse($attrs.pageSizes)() || [10, 25, 50]
          }
        };
        $scope.localConfig = {
          pagingArray: [],
          loadingData: false,
          tableMaxHeight: $attrs.tableMaxHeight
        };
        $scope.ajaxConfig = $scope.$eval($attrs.ajaxConfig);
        $scope.columnDefinition = $scope.$eval($attrs.columnDefinition);

        // ---------- Local data ---------- //
        var lastRequestToken,
          watchers = [];

        if ($scope.items.paging.pageSizes.indexOf($scope.items.paging.pageSize) < 0) {
          $scope.items.paging.pageSize = $scope.items.paging.pageSizes[0];
        }

        // ---------- ui handlers ---------- //
        $scope.loadPage = adDebounce(function (page) {
          lastRequestToken = Math.random();
          $scope.localConfig.loadingData = true;
          var pageLoader = $scope.$eval($attrs.pageLoader) || adLoadPage,
            params = {
              pageNumber: page,
              pageSize: $scope.items.paging.pageSize,
              sortKey: $scope.localConfig.predicate,
              sortDirection: $scope.localConfig.reverse,
              ajaxConfig: $scope.ajaxConfig,
              token: lastRequestToken
            },
            successHandler = function (response) {
              if (response.token === lastRequestToken) {
                $scope.items.list = response.items;
                $scope.items.paging.totalPages = response.totalPages;
                $scope.items.paging.currentPage = response.currentPage;
                $scope.localConfig.pagingArray = response.pagingArray;
                $scope.localConfig.loadingData = false;
              }
            },
            errorHandler = function () {
              $scope.localConfig.loadingData = false;
            };

          pageLoader(params).then(successHandler, errorHandler);
        });

        $scope.loadNextPage = function () {
          if (!$scope.localConfig.loadingData) {
            if ($scope.items.paging.currentPage + 1 <= $scope.items.paging.totalPages) {
              $scope.loadPage($scope.items.paging.currentPage + 1);
            }
          }
        };

        $scope.loadPreviousPage = function () {
          if (!$scope.localConfig.loadingData) {
            if ($scope.items.paging.currentPage - 1 > 0) {
              $scope.loadPage($scope.items.paging.currentPage - 1);
            }
          }
        };

        $scope.loadLastPage = function () {
          if (!$scope.localConfig.loadingData) {
            if ($scope.items.paging.currentPage !== $scope.items.paging.totalPages) {
              $scope.loadPage($scope.items.paging.totalPages);
            }
          }
        };

        $scope.pageSizeChanged = function (size) {
          if (Number(size) !== $scope.items.paging.pageSize) {
            $scope.items.paging.pageSize = Number(size);
            $scope.loadPage(1);
          }
        };

        $scope.sortByColumn = function (column) {
          if (column.sortKey) {
            if (column.sortKey !== $scope.localConfig.predicate) {
              $scope.localConfig.predicate = column.sortKey;
              $scope.localConfig.reverse = true;
            } else {
              if ($scope.localConfig.reverse === true) {
                $scope.localConfig.reverse = false;
              } else {
                $scope.localConfig.reverse = undefined;
                $scope.localConfig.predicate = undefined;
              }
            }
            $scope.loadPage($scope.items.paging.currentPage);
          }
        };

        // ---------- initialization and event listeners ---------- //
        $scope.loadPage(1);

        // reset on parameter change
        watchers.push(
          $scope.$watch($attrs.ajaxConfig, function () {
            $scope.loadPage(1);
          }, true)
        );
        watchers.push(
          $scope.$watchCollection($attrs.columnDefinition, function () {
            $scope.columnDefinition = $scope.$eval($attrs.columnDefinition);
          })
        );

        // ---------- disable watchers ---------- //
        $scope.$on('$destroy', function () {
          watchers.forEach(function (watcher) {
            watcher();
          });
        });
      }

      return {
        restrict: 'E',
        scope: true,
        templateUrl: 'tableajax/tableajax.tpl.html',
        controller: ['$scope', '$attrs', controllerFunction]
      };
    }]);

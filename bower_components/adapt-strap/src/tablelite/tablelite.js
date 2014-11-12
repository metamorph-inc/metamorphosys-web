angular.module('adaptv.adaptStrap.tablelite', ['adaptv.adaptStrap.utils'])
/**
 * Use this directive if you need to render a simple table with local data source.
 */
  .directive('adTableLite', [
    '$parse', '$http', '$compile', '$filter', '$templateCache',
    '$adConfig', 'adStrapUtils', 'adDebounce', 'adLoadLocalPage',
    function ($parse, $http, $compile, $filter, $templateCache, $adConfig, adStrapUtils, adDebounce, adLoadLocalPage) {
      'use strict';
      function controllerFunction($scope, $attrs) {
        // ---------- $$scope initialization ---------- //
        $scope.attrs = $attrs;
        $scope.iconClasses = $adConfig.iconClasses;
        $scope.adStrapUtils = adStrapUtils;

        $scope.columnDefinition = $scope.$eval($attrs.columnDefinition);

        $scope.items = {
          list: undefined,
          allItems: undefined,
          paging: {
            currentPage: 1,
            totalPages: undefined,
            pageSize: Number($attrs.pageSize) || 10,
            pageSizes: $parse($attrs.pageSizes)() || [10, 25, 50]
          }
        };

        $scope.localConfig = {
          localData: adStrapUtils.parse($scope.$eval($attrs.localDataSource)),
          pagingArray: [],
          dragChange: $scope.$eval($attrs.onDragChange)
        };

        $scope.selectedItems = $scope.$eval($attrs.selectedItems);

        // ---------- Local data ---------- //
        var placeHolder = null,
          pageButtonElement = null,
          validDrop = false,
          initialPos,
          watchers = [];

        function moveElementNode(nodeToMove, relativeNode, dragNode) {
          if (relativeNode.next()[0] === nodeToMove[0]) {
            relativeNode.before(nodeToMove);
          } else if (relativeNode.prev()[0] === nodeToMove[0]) {
            relativeNode.after(nodeToMove);
          } else {
            if (relativeNode.next()[0] === dragNode[0]) {
              relativeNode.before(nodeToMove);
            } else if (relativeNode.prev()[0] === dragNode[0]) {
              relativeNode.after(nodeToMove);
            }
          }
        }

        if ($scope.items.paging.pageSizes.indexOf($scope.items.paging.pageSize) < 0) {
          $scope.items.paging.pageSize = $scope.items.paging.pageSizes[0];
        }

        // ---------- ui handlers ---------- //
        $scope.loadPage = adDebounce(function (page) {
          var itemsObject = $scope.localConfig.localData = adStrapUtils.parse($scope.$eval($attrs.localDataSource)),
              params;
          params = {
            pageNumber: page,
            pageSize: (!$attrs.disablePaging) ? $scope.items.paging.pageSize : itemsObject.length,
            sortKey: $scope.localConfig.predicate,
            sortDirection: $scope.localConfig.reverse,
            localData: itemsObject
          };

          var response = adLoadLocalPage(params);
          $scope.items.list = response.items;
          $scope.items.allItems = response.allItems;
          $scope.items.paging.currentPage = response.currentPage;
          $scope.items.paging.totalPages = response.totalPages;
          $scope.localConfig.pagingArray = response.pagingArray;
        }, 100);

        $scope.loadNextPage = function () {
          if ($scope.items.paging.currentPage + 1 <= $scope.items.paging.totalPages) {
            $scope.loadPage($scope.items.paging.currentPage + 1);
          }
        };

        $scope.loadPreviousPage = function () {
          if ($scope.items.paging.currentPage - 1 > 0) {
            $scope.loadPage($scope.items.paging.currentPage - 1);
          }
        };

        $scope.loadLastPage = function () {
          if (!$scope.localConfig.disablePaging) {
            $scope.loadPage($scope.items.paging.totalPages);
          }
        };

        $scope.pageSizeChanged = function (size) {
          $scope.items.paging.pageSize = size;
          $scope.loadPage(1);
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

        $scope.unSortTable = function () {
          $scope.localConfig.reverse = undefined;
          $scope.localConfig.predicate = undefined;
        };

        $scope.onDragStart = function(data, dragElement) {
          var parent = dragElement.parent();
          placeHolder = $('<tr><td colspan=' + dragElement.find('td').length + '>&nbsp;</td></tr>');
          initialPos = dragElement.index() + (($scope.items.paging.currentPage - 1) *
            $scope.items.paging.pageSize) - 1;
          if (dragElement[0] !== parent.children().last()[0]) {
            dragElement.next().before(placeHolder);
          } else {
            parent.append(placeHolder);
          }
        };

        $scope.onDragEnd = function() {
          placeHolder.remove();
        };

        $scope.onDragOver = function(data, dragElement, dropElement) {
          if (placeHolder) {
            // Restricts valid drag to current table instance
            moveElementNode(placeHolder, dropElement, dragElement);
          }
        };

        $scope.onDropEnd = function(data, dragElement) {
          var endPos;
          if (placeHolder) {
            // Restricts drop to current table instance
            if (placeHolder.next()[0]) {
              placeHolder.next().before(dragElement);
            } else if (placeHolder.prev()[0]) {
              placeHolder.prev().after(dragElement);
            }
            placeHolder.remove();
            validDrop = true;
            endPos = dragElement.index() + (($scope.items.paging.currentPage - 1) *
              $scope.items.paging.pageSize) - 1;
            adStrapUtils.moveItemInList(initialPos, endPos, $scope.localConfig.localData);
            $scope.unSortTable();
            if ($scope.localConfig.dragChange) {
              $scope.localConfig.dragChange(initialPos, endPos, data);
            }
          }
          if (pageButtonElement) {
            pageButtonElement.removeClass('btn-primary');
            pageButtonElement = null;
          }
        };

        $scope.onNextPageButtonOver = function(data, dragElement, dropElement) {
          if (pageButtonElement) {
            pageButtonElement.removeClass('btn-primary');
            pageButtonElement = null;
          }
          if (dropElement.attr('disabled') !== 'disabled') {
            pageButtonElement = dropElement;
            pageButtonElement.addClass('btn-primary');
          }
        };

        $scope.onNextPageButtonDrop = function(data, dragElement) {
          var endPos;
          if (pageButtonElement) {
            validDrop = true;
            if (pageButtonElement.attr('id') === 'btnPrev') {
              endPos = ($scope.items.paging.pageSize * ($scope.items.paging.currentPage - 1)) - 1;
            }
            if (pageButtonElement.attr('id') === 'btnNext') {
              endPos = $scope.items.paging.pageSize * $scope.items.paging.currentPage;
            }
            adStrapUtils.moveItemInList(initialPos, endPos, $scope.localConfig.localData);
            placeHolder.remove();
            dragElement.remove();
            if ($scope.localConfig.dragChange) {
              $scope.localConfig.dragChange(initialPos, endPos, data);
            }
            pageButtonElement.removeClass('btn-primary');
            pageButtonElement = null;
          }
        };

        // ---------- initialization and event listeners ---------- //
        $scope.loadPage(1);

        // ---------- set watchers ---------- //
        watchers.push(
          $scope.$watch($attrs.localDataSource, function () {
            $scope.loadPage($scope.items.paging.currentPage);
          })
        );
        watchers.push(
          $scope.$watch($attrs.localDataSource + '.length', function () {
            $scope.loadPage($scope.items.paging.currentPage);
          })
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
        controller: ['$scope', '$attrs', controllerFunction],
        templateUrl: 'tablelite/tablelite.tpl.html',
        scope: true
      };
    }]);

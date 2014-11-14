(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
 * @author pmeijer / https://github.com/pmeijer
 */
// External dependencies
require('../../bower_components/ng-file-upload/angular-file-upload-shim');
require('../../bower_components/ng-file-upload/angular-file-upload');
require('../../bower_components/angular-growl/build/angular-growl.min');
require('../../bower_components/angular-sanitize/angular-sanitize');
require('../../bower_components/adapt-strap/dist/adapt-strap');
require('../../bower_components/adapt-strap/dist/adapt-strap.tpl');

// Internal dependencies
require('./services/cyphy-services');

angular.module('cyphy.components', [
    'cyphy.services',
    'cyphy.components.templates',
    'angularFileUpload',
    'angular-growl',
    'ngSanitize',
    'adaptv.adaptStrap'
]).config(['growlProvider', function (growlProvider) {
    growlProvider.globalTimeToLive({success: 5000, error: -1, warning: 20000, info: 5000});
}]);

require('./SimpleModal/SimpleModal');

require('./WorkspaceList/WorkspaceList');

require('./ComponentList/ComponentDetails');
require('./ComponentList/ComponentList');

require('./DesignList/DesignDetails');
require('./DesignList/DesignList');
require('./DesignTree/DesignTree');

require('./TestBenchList/TestBenchDetails');
require('./TestBenchList/TestBenchList');

require('./ConfigurationTable/ConfigurationTable');
require('./ConfigurationSetSelector/ConfigurationSetSelector');

require('./WorkersList/WorkersList');




},{"../../bower_components/adapt-strap/dist/adapt-strap":2,"../../bower_components/adapt-strap/dist/adapt-strap.tpl":3,"../../bower_components/angular-growl/build/angular-growl.min":4,"../../bower_components/angular-sanitize/angular-sanitize":5,"../../bower_components/ng-file-upload/angular-file-upload":7,"../../bower_components/ng-file-upload/angular-file-upload-shim":6,"./ComponentList/ComponentDetails":8,"./ComponentList/ComponentList":9,"./ConfigurationSetSelector/ConfigurationSetSelector":10,"./ConfigurationTable/ConfigurationTable":11,"./DesignList/DesignDetails":12,"./DesignList/DesignList":13,"./DesignTree/DesignTree":14,"./SimpleModal/SimpleModal":15,"./TestBenchList/TestBenchDetails":16,"./TestBenchList/TestBenchList":17,"./WorkersList/WorkersList":18,"./WorkspaceList/WorkspaceList":19,"./services/cyphy-services":29}],2:[function(require,module,exports){
/**
 * adapt-strap
 * @version v2.0.6 - 2014-10-26
 * @link https://github.com/Adaptv/adapt-strap
 * @author Kashyap Patel (kashyap@adap.tv)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(window, document, undefined) {
'use strict';
// Source: module.js
angular.module('adaptv.adaptStrap', [
  'adaptv.adaptStrap.utils',
  'adaptv.adaptStrap.treebrowser',
  'adaptv.adaptStrap.tablelite',
  'adaptv.adaptStrap.tableajax',
  'adaptv.adaptStrap.loadingindicator',
  'adaptv.adaptStrap.draggable',
  'adaptv.adaptStrap.infinitedropdown'
]).provider('$adConfig', function () {
  var iconClasses = this.iconClasses = {
      expand: 'glyphicon glyphicon-plus-sign',
      collapse: 'glyphicon glyphicon-minus-sign',
      loadingSpinner: 'glyphicon glyphicon-refresh ad-spin',
      firstPage: 'glyphicon glyphicon-fast-backward',
      previousPage: 'glyphicon glyphicon-backward',
      nextPage: 'glyphicon glyphicon-forward',
      lastPage: 'glyphicon glyphicon-fast-forward',
      sortAscending: 'glyphicon glyphicon-chevron-up',
      sortDescending: 'glyphicon glyphicon-chevron-down',
      sortable: 'glyphicon glyphicon-resize-vertical',
      draggable: 'glyphicon glyphicon-align-justify',
      selectedItem: 'glyphicon glyphicon-ok'
    }, paging = this.paging = {
      request: {
        start: 'skip',
        pageSize: 'limit',
        page: 'page',
        sortField: 'sort',
        sortDirection: 'sort_dir',
        sortAscValue: 'asc',
        sortDescValue: 'desc'
      },
      response: {
        itemsLocation: 'data',
        totalItems: 'pagination.totalCount'
      }
    };
  this.$get = function () {
    return {
      iconClasses: iconClasses,
      paging: paging
    };
  };
});

// Source: draggable.js
angular.module('adaptv.adaptStrap.draggable', []).directive('adDrag', [
  '$rootScope',
  '$parse',
  '$timeout',
  function ($rootScope, $parse, $timeout) {
    function linkFunction(scope, element, attrs) {
      scope.draggable = attrs.adDrag;
      scope.hasHandle = attrs.adDragHandle === 'false' || typeof attrs.adDragHandle === 'undefined' ? false : true;
      scope.onDragStartCallback = $parse(attrs.adDragBegin) || null;
      scope.onDragEndCallback = $parse(attrs.adDragEnd) || null;
      scope.data = null;
      var offset, mx, my, tx, ty;
      var hasTouch = 'ontouchstart' in document.documentElement;
      /* -- Events -- */
      var startEvents = 'touchstart mousedown';
      var moveEvents = 'touchmove mousemove';
      var endEvents = 'touchend mouseup';
      var $document = $(document);
      var $window = $(window);
      var dragEnabled = false;
      var pressTimer = null;
      function init() {
        element.attr('draggable', 'false');
        // prevent native drag
        toggleListeners(true);
      }
      function toggleListeners(enable) {
        if (!enable) {
          return;
        }
        // add listeners.
        scope.$on('$destroy', onDestroy);
        attrs.$observe('adDrag', onEnableChange);
        scope.$watch(attrs.adDragData, onDragDataChange);
        scope.$on('draggable:start', onDragStart);
        scope.$on('draggable:end', onDragEnd);
        if (scope.hasHandle) {
          element.on(startEvents, '.ad-drag-handle', onPress);
        } else {
          element.on(startEvents, onPress);
          element.addClass('ad-draggable');
        }
        if (!hasTouch) {
          element.on('mousedown', '.ad-drag-handle', function () {
            return false;
          });
          element.on('mousedown', function () {
            return false;
          });  // prevent native drag
        }
      }
      //--- Event Handlers ---
      function onDragStart(evt, o) {
        if (o.el === element && o.callback) {
          o.callback(evt);
        }
      }
      function onDragEnd(evt, o) {
        if (o.el === element && o.callback) {
          o.callback(evt);
        }
      }
      function onDestroy() {
        toggleListeners(false);
      }
      function onDragDataChange(newVal) {
        scope.data = newVal;
      }
      function onEnableChange(newVal) {
        dragEnabled = scope.$eval(newVal);
      }
      /*
      * When the element is clicked start the drag behaviour
      * On touch devices as a small delay so as not to prevent native window scrolling
      */
      function onPress(evt) {
        if (!dragEnabled) {
          return;
        }
        if (hasTouch) {
          cancelPress();
          pressTimer = setTimeout(function () {
            cancelPress();
            onLongPress(evt);
          }, 100);
          $document.on(moveEvents, cancelPress);
          $document.on(endEvents, cancelPress);
        } else {
          onLongPress(evt);
        }
      }
      /*
       * Returns the inline property of an element
       */
      function getInlineProperty(prop, element) {
        var styles = $(element).attr('style'), value;
        if (styles) {
          styles.split(';').forEach(function (e) {
            var style = e.split(':');
            if ($.trim(style[0]) === prop) {
              value = style[1];
            }
          });
        }
        return value;
      }
      /*
       * Preserve the width of the element during drag
       */
      function persistElementWidth() {
        if (getInlineProperty('width', element)) {
          element.data('ad-draggable-temp-width', getInlineProperty('width', element));
        }
        element.width(element.width());
        element.children().each(function () {
          if (getInlineProperty('width', this)) {
            $(this).data('ad-draggable-temp-width', getInlineProperty('width', this));
          }
          $(this).width($(this).width());
        });
      }
      function cancelPress() {
        clearTimeout(pressTimer);
        $document.off(moveEvents, cancelPress);
        $document.off(endEvents, cancelPress);
      }
      function onLongPress(evt) {
        if (!dragEnabled) {
          return;
        }
        evt.preventDefault();
        offset = element.offset();
        if (scope.hasHandle) {
          offset = element.find('.ad-drag-handle').offset();
        } else {
          offset = element.offset();
        }
        element.addClass('ad-dragging');
        mx = evt.pageX || evt.originalEvent.touches[0].pageX;
        my = evt.pageY || evt.originalEvent.touches[0].pageY;
        tx = mx - offset.left - $window.scrollLeft();
        ty = my - offset.top - $window.scrollTop();
        persistElementWidth();
        moveElement(tx, ty);
        $document.on(moveEvents, onMove);
        $document.on(endEvents, onRelease);
        $rootScope.$broadcast('draggable:start', {
          x: mx,
          y: my,
          tx: tx,
          ty: ty,
          el: element,
          data: scope.data,
          callback: onDragBegin
        });
      }
      function onMove(evt) {
        var cx, cy;
        if (!dragEnabled) {
          return;
        }
        evt.preventDefault();
        cx = evt.pageX || evt.originalEvent.touches[0].pageX;
        cy = evt.pageY || evt.originalEvent.touches[0].pageY;
        tx = cx - mx + offset.left - $window.scrollLeft();
        ty = cy - my + offset.top - $window.scrollTop();
        moveElement(tx, ty);
        $rootScope.$broadcast('draggable:move', {
          x: mx,
          y: my,
          tx: tx,
          ty: ty,
          el: element,
          data: scope.data
        });
      }
      function onRelease(evt) {
        if (!dragEnabled) {
          return;
        }
        evt.preventDefault();
        $rootScope.$broadcast('draggable:end', {
          x: mx,
          y: my,
          tx: tx,
          ty: ty,
          el: element,
          data: scope.data,
          callback: onDragComplete
        });
        element.removeClass('ad-dragging');
        reset();
        $document.off(moveEvents, onMove);
        $document.off(endEvents, onRelease);
      }
      // Callbacks
      function onDragBegin(evt) {
        if (!scope.onDragStartCallback) {
          return;
        }
        scope.$apply(function () {
          scope.onDragStartCallback(scope, {
            $data: scope.data,
            $dragElement: element,
            $event: evt
          });
        });
      }
      function onDragComplete(evt) {
        if (!scope.onDragEndCallback) {
          return;
        }
        // To fix a bug issue where onDragEnd happens before
        // onDropEnd. Currently the only way around this
        // Ideally onDropEnd should fire before onDragEnd
        $timeout(function () {
          scope.$apply(function () {
            scope.onDragEndCallback(scope, {
              $data: scope.data,
              $dragElement: element,
              $event: evt
            });
          });
        }, 100);
      }
      // utils functions
      function reset() {
        element.css({
          left: '',
          top: '',
          position: '',
          'z-index': ''
        });
        var width = element.data('ad-draggable-temp-width');
        if (width) {
          element.css({ width: width });
        } else {
          element.css({ width: '' });
        }
        element.children().each(function () {
          var width = $(this).data('ad-draggable-temp-width');
          if (width) {
            $(this).css({ width: width });
          } else {
            $(this).css({ width: '' });
          }
        });
      }
      function moveElement(x, y) {
        element.css({
          left: x,
          top: y,
          position: 'fixed',
          'z-index': 99999
        });
      }
      init();
    }
    return {
      restrict: 'A',
      link: linkFunction
    };
  }
]).directive('adDrop', [
  '$rootScope',
  '$parse',
  function ($rootScope, $parse) {
    function linkFunction(scope, element, attrs) {
      scope.droppable = attrs.adDrop;
      scope.onDropCallback = $parse(attrs.adDropEnd) || null;
      scope.onDropOverCallback = $parse(attrs.adDropOver) || null;
      scope.onDropLeaveCallback = $parse(attrs.adDropLeave) || null;
      var dropEnabled = false;
      var elem = null;
      var $window = $(window);
      function init() {
        toggleListeners(true);
      }
      function toggleListeners(enable) {
        if (!enable) {
          return;
        }
        // add listeners.
        attrs.$observe('adDrop', onEnableChange);
        scope.$on('$destroy', onDestroy);
        scope.$on('draggable:move', onDragMove);
        scope.$on('draggable:end', onDragEnd);
        scope.$on('draggable:change', onDropChange);
      }
      function onDestroy() {
        toggleListeners(false);
      }
      function onEnableChange(newVal) {
        dropEnabled = scope.$eval(newVal);
      }
      function onDropChange(evt, obj) {
        if (elem !== obj.el) {
          elem = null;
        }
      }
      function onDragMove(evt, obj) {
        if (!dropEnabled) {
          return;
        }
        // If the dropElement and the drag element are the same
        if (element === obj.el) {
          return;
        }
        var el = getCurrentDropElement(obj.tx, obj.ty, obj.el);
        if (el !== null) {
          elem = el;
          obj.el.lastDropElement = elem;
          scope.$apply(function () {
            scope.onDropOverCallback(scope, {
              $data: obj.data,
              $dragElement: obj.el,
              $dropElement: elem,
              $event: evt
            });
          });
          element.addClass('ad-drop-over');
          $rootScope.$broadcast('draggable:change', { el: elem });
        } else {
          if (obj.el.lastDropElement === element) {
            scope.$apply(function () {
              scope.onDropLeaveCallback(scope, {
                $data: obj.data,
                $dragElement: obj.el,
                $dropElement: obj.el.lastDropElement,
                $event: evt
              });
            });
            obj.el.lastDropElement.removeClass('ad-drop-over');
            delete obj.el.lastDropElement;
          }
        }
      }
      function onDragEnd(evt, obj) {
        if (!dropEnabled) {
          return;
        }
        if (elem) {
          // call the adDrop element callback
          scope.$apply(function () {
            scope.onDropCallback(scope, {
              $data: obj.data,
              $dragElement: obj.el,
              $dropElement: elem,
              $event: evt
            });
          });
          elem = null;
        }
      }
      function getCurrentDropElement(x, y) {
        var bounds = element.offset();
        // set drag sensitivity
        var vthold = Math.floor(element.outerHeight() / 6);
        x = x + $window.scrollLeft();
        y = y + $window.scrollTop();
        return y >= bounds.top + vthold && y <= bounds.top + element.outerHeight() - vthold && (x >= bounds.left && x <= bounds.left + element.outerWidth()) && (x >= bounds.left && x <= bounds.left + element.outerWidth()) ? element : null;
      }
      init();
    }
    return {
      restrict: 'A',
      link: linkFunction
    };
  }
]);

// Source: infinitedropdown.js
angular.module('adaptv.adaptStrap.infinitedropdown', [
  'adaptv.adaptStrap.utils',
  'adaptv.adaptStrap.loadingindicator'
]).directive('adInfiniteDropdown', [
  '$parse',
  '$compile',
  '$templateCache',
  '$adConfig',
  'adLoadPage',
  'adDebounce',
  'adStrapUtils',
  'adLoadLocalPage',
  function ($parse, $compile, $templateCache, $adConfig, adLoadPage, adDebounce, adStrapUtils, adLoadLocalPage) {
function linkFunction(scope, element, attrs) {
      // scope initialization
      scope.attrs = attrs;
      scope.adStrapUtils = adStrapUtils;
      scope.items = {
        list: [],
        paging: {
          currentPage: 1,
          totalPages: undefined,
          pageSize: Number(attrs.pageSize) || 10
        }
      };
      scope.localConfig = {
        loadingData: false,
        singleSelectionMode: $parse(attrs.singleSelectionMode)() ? true : false,
        dimensions: {
          'max-height': attrs.maxHeight || '200px',
          'max-width': attrs.maxWidth || 'auto'
        }
      };
      scope.selectedItems = scope.$eval(attrs.selectedItems) || [];
      scope.ajaxConfig = scope.$eval(attrs.ajaxConfig) || {};
      // ---------- Local data ---------- //
      var lastRequestToken, watchers = [];
      // ---------- ui handlers ---------- //
      scope.addRemoveItem = function (event, item, items) {
        event.stopPropagation();
        if (scope.localConfig.singleSelectionMode) {
          scope.selectedItems[0] = item;
        } else {
          adStrapUtils.addRemoveItemFromList(item, items);
        }
        var callback = scope.$eval(attrs.onItemClick);
        if (callback) {
          callback(item);
        }
      };
      scope.loadPage = adDebounce(function (page) {
        lastRequestToken = Math.random();
        scope.localConfig.loadingData = true;
        var pageLoader = scope.$eval(attrs.pageLoader) || adLoadPage, params = {
            pageNumber: page,
            pageSize: scope.items.paging.pageSize,
            sortKey: scope.localConfig.predicate,
            sortDirection: scope.localConfig.reverse,
            ajaxConfig: scope.ajaxConfig,
            token: lastRequestToken
          }, successHandler = function (response) {
            if (response.token === lastRequestToken) {
              if (page === 1) {
                scope.items.list = response.items;
              } else {
                scope.items.list = scope.items.list.concat(response.items);
              }
              scope.items.paging.totalPages = response.totalPages;
              scope.items.paging.currentPage = response.currentPage;
              scope.localConfig.loadingData = false;
            }
          }, errorHandler = function () {
            scope.localConfig.loadingData = false;
          };
        if (attrs.localDataSource) {
          params.localData = scope.$eval(attrs.localDataSource);
          successHandler(adLoadLocalPage(params));
        } else {
          pageLoader(params).then(successHandler, errorHandler);
        }
      }, 10);
      scope.loadNextPage = function () {
        if (!scope.localConfig.loadingData) {
          if (scope.items.paging.currentPage + 1 <= scope.items.paging.totalPages) {
            scope.loadPage(scope.items.paging.currentPage + 1);
          }
        }
      };
      // ---------- initialization and event listeners ---------- //
      //We do the compile after injecting the name spacing into the template.
      scope.loadPage(1);
      // ---------- set watchers ---------- //
      // reset on parameter change
      if (attrs.ajaxConfig) {
        scope.$watch(attrs.ajaxConfig, function (value) {
          if (value) {
            scope.loadPage(1);
          }
        }, true);
      }
      if (attrs.localDataSource) {
        watchers.push(scope.$watch(attrs.localDataSource, function (value) {
          if (value) {
            scope.loadPage(1);
          }
        }));
        watchers.push(scope.$watch(attrs.localDataSource + '.length', function (value) {
          if (value) {
            scope.loadPage(1);
          }
        }));
      }
      // ---------- disable watchers ---------- //
      scope.$on('$destroy', function () {
        watchers.forEach(function (watcher) {
          watcher();
        });
      });
      var listContainer = angular.element(element).find('ul')[0];
      // infinite scroll handler
      var loadFunction = adDebounce(function () {
          // This is for infinite scrolling.
          // When the scroll gets closer to the bottom, load more items.
          if (listContainer.scrollTop + listContainer.offsetHeight >= listContainer.scrollHeight - 300) {
            scope.loadNextPage();
          }
        }, 50);
      angular.element(listContainer).bind('mousewheel', function (event) {
        if (event.originalEvent && event.originalEvent.deltaY) {
          listContainer.scrollTop += event.originalEvent.deltaY;
          event.preventDefault();
          event.stopPropagation();
        }
        loadFunction();
      });
    }
    return {
      restrict: 'E',
      scope: true,
      link: linkFunction,
      templateUrl: 'infinitedropdown/infinitedropdown.tpl.html'
    };
  }
]);

// Source: loadingindicator.js
angular.module('adaptv.adaptStrap.loadingindicator', []).directive('adLoadingIcon', [
  '$adConfig',
  '$compile',
  function ($adConfig, $compile) {
    return {
      restrict: 'E',
      compile: function compile() {
        return {
          pre: function preLink(scope, element, attrs) {
            var loadingIconClass = attrs.loadingIconClass || $adConfig.iconClasses.loadingSpinner, ngStyleTemplate = attrs.loadingIconSize ? 'ng-style="{\'font-size\': \'' + attrs.loadingIconSize + '\'}"' : '', template = '<i class="' + loadingIconClass + '" ' + ngStyleTemplate + '></i>';
            element.empty();
            element.append($compile(template)(scope));
          }
        };
      }
    };
  }
]).directive('adLoadingOverlay', [
  '$adConfig',
  function ($adConfig) {
    return {
      restrict: 'E',
      templateUrl: 'loadingindicator/loadingindicator.tpl.html',
      scope: {
        loading: '=',
        zIndex: '@',
        position: '@',
        containerClasses: '@',
        loadingIconClass: '@',
        loadingIconSize: '@'
      },
      compile: function compile() {
        return {
          pre: function preLink(scope) {
            scope.loadingIconClass = scope.loadingIconClass || $adConfig.iconClasses.loading;
            scope.loadingIconSize = scope.loadingIconSize || '3em';
          }
        };
      }
    };
  }
]);

// Source: tableajax.js
angular.module('adaptv.adaptStrap.tableajax', [
  'adaptv.adaptStrap.utils',
  'adaptv.adaptStrap.loadingindicator'
]).directive('adTableAjax', [
  '$parse',
  '$adConfig',
  'adLoadPage',
  'adDebounce',
  'adStrapUtils',
  function ($parse, $adConfig, adLoadPage, adDebounce, adStrapUtils) {
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
          pageSizes: $parse($attrs.pageSizes)() || [
            10,
            25,
            50
          ]
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
      var lastRequestToken, watchers = [];
      if ($scope.items.paging.pageSizes.indexOf($scope.items.paging.pageSize) < 0) {
        $scope.items.paging.pageSize = $scope.items.paging.pageSizes[0];
      }
      // ---------- ui handlers ---------- //
      $scope.loadPage = adDebounce(function (page) {
        lastRequestToken = Math.random();
        $scope.localConfig.loadingData = true;
        var pageLoader = $scope.$eval($attrs.pageLoader) || adLoadPage, params = {
            pageNumber: page,
            pageSize: $scope.items.paging.pageSize,
            sortKey: $scope.localConfig.predicate,
            sortDirection: $scope.localConfig.reverse,
            ajaxConfig: $scope.ajaxConfig,
            token: lastRequestToken
          }, successHandler = function (response) {
            if (response.token === lastRequestToken) {
              $scope.items.list = response.items;
              $scope.items.paging.totalPages = response.totalPages;
              $scope.items.paging.currentPage = response.currentPage;
              $scope.localConfig.pagingArray = response.pagingArray;
              $scope.localConfig.loadingData = false;
            }
          }, errorHandler = function () {
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
      watchers.push($scope.$watch($attrs.ajaxConfig, function () {
        $scope.loadPage(1);
      }, true));
      watchers.push($scope.$watchCollection($attrs.columnDefinition, function () {
        $scope.columnDefinition = $scope.$eval($attrs.columnDefinition);
      }));
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
      controller: [
        '$scope',
        '$attrs',
        controllerFunction
      ]
    };
  }
]);

// Source: tablelite.js
angular.module('adaptv.adaptStrap.tablelite', ['adaptv.adaptStrap.utils']).directive('adTableLite', [
  '$parse',
  '$http',
  '$compile',
  '$filter',
  '$templateCache',
  '$adConfig',
  'adStrapUtils',
  'adDebounce',
  'adLoadLocalPage',
  function ($parse, $http, $compile, $filter, $templateCache, $adConfig, adStrapUtils, adDebounce, adLoadLocalPage) {
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
          pageSizes: $parse($attrs.pageSizes)() || [
            10,
            25,
            50
          ]
        }
      };
      $scope.localConfig = {
        localData: adStrapUtils.parse($scope.$eval($attrs.localDataSource)),
        pagingArray: [],
        dragChange: $scope.$eval($attrs.onDragChange)
      };
      $scope.selectedItems = $scope.$eval($attrs.selectedItems);
      // ---------- Local data ---------- //
      var placeHolder = null, pageButtonElement = null, validDrop = false, initialPos, watchers = [];
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
        var itemsObject = $scope.localConfig.localData = adStrapUtils.parse($scope.$eval($attrs.localDataSource)), params;
        params = {
          pageNumber: page,
          pageSize: !$attrs.disablePaging ? $scope.items.paging.pageSize : itemsObject.length,
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
      $scope.onDragStart = function (data, dragElement) {
        var parent = dragElement.parent();
        placeHolder = $('<tr><td colspan=' + dragElement.find('td').length + '>&nbsp;</td></tr>');
        initialPos = dragElement.index() + ($scope.items.paging.currentPage - 1) * $scope.items.paging.pageSize - 1;
        if (dragElement[0] !== parent.children().last()[0]) {
          dragElement.next().before(placeHolder);
        } else {
          parent.append(placeHolder);
        }
      };
      $scope.onDragEnd = function () {
        placeHolder.remove();
      };
      $scope.onDragOver = function (data, dragElement, dropElement) {
        if (placeHolder) {
          // Restricts valid drag to current table instance
          moveElementNode(placeHolder, dropElement, dragElement);
        }
      };
      $scope.onDropEnd = function (data, dragElement) {
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
          endPos = dragElement.index() + ($scope.items.paging.currentPage - 1) * $scope.items.paging.pageSize - 1;
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
      $scope.onNextPageButtonOver = function (data, dragElement, dropElement) {
        if (pageButtonElement) {
          pageButtonElement.removeClass('btn-primary');
          pageButtonElement = null;
        }
        if (dropElement.attr('disabled') !== 'disabled') {
          pageButtonElement = dropElement;
          pageButtonElement.addClass('btn-primary');
        }
      };
      $scope.onNextPageButtonDrop = function (data, dragElement) {
        var endPos;
        if (pageButtonElement) {
          validDrop = true;
          if (pageButtonElement.attr('id') === 'btnPrev') {
            endPos = $scope.items.paging.pageSize * ($scope.items.paging.currentPage - 1) - 1;
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
      watchers.push($scope.$watch($attrs.localDataSource, function () {
        $scope.loadPage($scope.items.paging.currentPage);
      }));
      watchers.push($scope.$watch($attrs.localDataSource + '.length', function () {
        $scope.loadPage($scope.items.paging.currentPage);
      }));
      watchers.push($scope.$watchCollection($attrs.columnDefinition, function () {
        $scope.columnDefinition = $scope.$eval($attrs.columnDefinition);
      }));
      // ---------- disable watchers ---------- //
      $scope.$on('$destroy', function () {
        watchers.forEach(function (watcher) {
          watcher();
        });
      });
    }
    return {
      restrict: 'E',
      controller: [
        '$scope',
        '$attrs',
        controllerFunction
      ],
      templateUrl: 'tablelite/tablelite.tpl.html',
      scope: true
    };
  }
]);

// Source: treebrowser.js
angular.module('adaptv.adaptStrap.treebrowser', []).directive('adTreeBrowser', [
  '$adConfig',
  function ($adConfig) {
    function controllerFunction($scope, $attrs) {
      var templateToken = Math.random();
      // scope initialization
      $scope.attrs = $attrs;
      $scope.iconClasses = $adConfig.iconClasses;
      $scope.treeRoot = $scope.$eval($attrs.treeRoot) || {};
      $scope.toggle = function (event, item) {
        var toggleCallback;
        event.stopPropagation();
        toggleCallback = $scope.$eval($attrs.toggleCallback);
        if (toggleCallback) {
          toggleCallback(item);
        } else {
          item._ad_expanded = !item._ad_expanded;
        }
      };
      var hasChildren = $scope.$eval($attrs.hasChildren);
      $scope.hasChildren = function (item) {
        var found = item[$attrs.childNode] && item[$attrs.childNode].length > 0;
        if (hasChildren) {
          found = hasChildren(item);
        }
        return found;
      };
      // for unique template
      $scope.localConfig = { rendererTemplateId: 'tree-renderer-' + templateToken + '.html' };
    }
    return {
      restrict: 'E',
      scope: true,
      controller: [
        '$scope',
        '$attrs',
        controllerFunction
      ],
      templateUrl: 'treebrowser/treebrowser.tpl.html'
    };
  }
]);

// Source: utils.js
angular.module('adaptv.adaptStrap.utils', []).factory('adStrapUtils', [
  '$filter',
  function ($filter) {
    var evalObjectProperty = function (obj, property) {
        var arr = property.split('.');
        if (obj) {
          while (arr.length) {
            var key = arr.shift();
            if (obj) {
              obj = obj[key];
            }
          }
        }
        return obj;
      }, applyFilter = function (value, filter, item) {
        var parts, filterOptions;
        if (value && 'function' === typeof value) {
          return value(item);
        }
        if (filter) {
          parts = filter.split(':');
          filterOptions = parts[1];
          if (filterOptions) {
            value = $filter(parts[0])(value, filterOptions);
          } else {
            value = $filter(parts[0])(value);
          }
        }
        return value;
      }, itemExistsInList = function (compareItem, list) {
        var exist = false;
        list.forEach(function (item) {
          if (angular.equals(compareItem, item)) {
            exist = true;
          }
        });
        return exist;
      }, itemsExistInList = function (items, list) {
        var exist = true, i;
        for (i = 0; i < items.length; i++) {
          if (itemExistsInList(items[i], list) === false) {
            exist = false;
            break;
          }
        }
        return exist;
      }, addItemToList = function (item, list) {
        list.push(item);
      }, removeItemFromList = function (item, list) {
        var i;
        for (i = list.length - 1; i > -1; i--) {
          if (angular.equals(item, list[i])) {
            list.splice(i, 1);
          }
        }
      }, addRemoveItemFromList = function (item, list) {
        var i, found = false;
        for (i = list.length - 1; i > -1; i--) {
          if (angular.equals(item, list[i])) {
            list.splice(i, 1);
            found = true;
          }
        }
        if (found === false) {
          list.push(item);
        }
      }, addItemsToList = function (items, list) {
        items.forEach(function (item) {
          if (!itemExistsInList(item, list)) {
            addRemoveItemFromList(item, list);
          }
        });
      }, addRemoveItemsFromList = function (items, list) {
        if (itemsExistInList(items, list)) {
          list.length = 0;
        } else {
          addItemsToList(items, list);
        }
      }, moveItemInList = function (startPos, endPos, list) {
        if (endPos < list.length) {
          list.splice(endPos, 0, list.splice(startPos, 1)[0]);
        }
      }, parse = function (items) {
        var itemsObject = [];
        if (angular.isArray(items)) {
          itemsObject = items;
        } else {
          angular.forEach(items, function (item) {
            itemsObject.push(item);
          });
        }
        return itemsObject;
      }, getObjectProperty = function (item, property) {
        if (property && 'function' === typeof property) {
          return property(item);
        }
        var arr = property.split('.');
        while (arr.length) {
          item = item[arr.shift()];
        }
        return item;
      };
    return {
      evalObjectProperty: evalObjectProperty,
      applyFilter: applyFilter,
      itemExistsInList: itemExistsInList,
      itemsExistInList: itemsExistInList,
      addItemToList: addItemToList,
      removeItemFromList: removeItemFromList,
      addRemoveItemFromList: addRemoveItemFromList,
      addItemsToList: addItemsToList,
      addRemoveItemsFromList: addRemoveItemsFromList,
      moveItemInList: moveItemInList,
      parse: parse,
      getObjectProperty: getObjectProperty
    };
  }
]).factory('adDebounce', [
  '$timeout',
  '$q',
  function ($timeout, $q) {
var deb = function (func, delay, immediate, ctx) {
      var timer = null, deferred = $q.defer(), wait = delay || 300;
      return function () {
        var context = ctx || this, args = arguments, callNow = immediate && !timer, later = function () {
            if (!immediate) {
              deferred.resolve(func.apply(context, args));
              deferred = $q.defer();
            }
          };
        if (timer) {
          $timeout.cancel(timer);
        }
        timer = $timeout(later, wait);
        if (callNow) {
          deferred.resolve(func.apply(context, args));
          deferred = $q.defer();
        }
        return deferred.promise;
      };
    };
    return deb;
  }
]).directive('adCompileTemplate', [
  '$compile',
  function ($compile) {
    return function (scope, element, attrs) {
      scope.$watch(function (scope) {
        return scope.$eval(attrs.adCompileTemplate);
      }, function (value) {
        element.html(value);
        $compile(element.contents())(scope);
      });
    };
  }
]).factory('adLoadPage', [
  '$adConfig',
  '$http',
  'adStrapUtils',
  function ($adConfig, $http, adStrapUtils) {
    return function (options) {
      var start = (options.pageNumber - 1) * options.pageSize, pagingConfig = angular.copy($adConfig.paging), ajaxConfig = angular.copy(options.ajaxConfig);
      if (ajaxConfig.paginationConfig && ajaxConfig.paginationConfig.request) {
        angular.extend(pagingConfig.request, ajaxConfig.paginationConfig.request);
      }
      if (ajaxConfig.paginationConfig && ajaxConfig.paginationConfig.response) {
        angular.extend(pagingConfig.response, ajaxConfig.paginationConfig.response);
      }
      ajaxConfig.params = ajaxConfig.params ? ajaxConfig.params : {};
      ajaxConfig.params[pagingConfig.request.start] = start;
      ajaxConfig.params[pagingConfig.request.pageSize] = options.pageSize;
      ajaxConfig.params[pagingConfig.request.page] = options.pageNumber;
      if (options.sortKey) {
        ajaxConfig.params[pagingConfig.request.sortField] = options.sortKey;
      }
      if (options.sortDirection === false) {
        ajaxConfig.params[pagingConfig.request.sortDirection] = pagingConfig.request.sortAscValue;
      } else if (options.sortDirection === true) {
        ajaxConfig.params[pagingConfig.request.sortDirection] = pagingConfig.request.sortDescValue;
      }
      var promise;
      if (ajaxConfig.method === 'JSONP') {
        promise = $http.jsonp(ajaxConfig.url + '?callback=JSON_CALLBACK', ajaxConfig);
      } else {
        promise = $http(ajaxConfig);
      }
      return promise.then(function (result) {
        var response = {
            items: adStrapUtils.evalObjectProperty(result.data, pagingConfig.response.itemsLocation),
            currentPage: options.pageNumber,
            totalPages: Math.ceil(adStrapUtils.evalObjectProperty(result.data, pagingConfig.response.totalItems) / options.pageSize),
            pagingArray: [],
            token: options.token
          };
        var TOTAL_PAGINATION_ITEMS = 5;
        var minimumBound = options.pageNumber - Math.floor(TOTAL_PAGINATION_ITEMS / 2);
        for (var i = minimumBound; i <= options.pageNumber; i++) {
          if (i > 0) {
            response.pagingArray.push(i);
          }
        }
        while (response.pagingArray.length < TOTAL_PAGINATION_ITEMS) {
          if (i > response.totalPages) {
            break;
          }
          response.pagingArray.push(i);
          i++;
        }
        return response;
      });
    };
  }
]).factory('adLoadLocalPage', [
  '$filter',
  function ($filter) {
    return function (options) {
      var response = {
          items: undefined,
          currentPage: options.pageNumber,
          totalPages: undefined,
          pagingArray: [],
          token: options.token
        };
      var start = (options.pageNumber - 1) * options.pageSize, end = start + options.pageSize, i, itemsObject = options.localData, localItems;
      localItems = $filter('orderBy')(itemsObject, options.sortKey, options.sortDirection);
      response.items = localItems.slice(start, end);
      response.allItems = itemsObject;
      response.currentPage = options.pageNumber;
      response.totalPages = Math.ceil(itemsObject.length / options.pageSize);
      var TOTAL_PAGINATION_ITEMS = 5;
      var minimumBound = options.pageNumber - Math.floor(TOTAL_PAGINATION_ITEMS / 2);
      for (i = minimumBound; i <= options.pageNumber; i++) {
        if (i > 0) {
          response.pagingArray.push(i);
        }
      }
      while (response.pagingArray.length < TOTAL_PAGINATION_ITEMS) {
        if (i > response.totalPages) {
          break;
        }
        response.pagingArray.push(i);
        i++;
      }
      return response;
    };
  }
]);

})(window, document);

},{}],3:[function(require,module,exports){
/**
 * adapt-strap
 * @version v2.0.6 - 2014-10-26
 * @link https://github.com/Adaptv/adapt-strap
 * @author Kashyap Patel (kashyap@adap.tv)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(window, document, undefined) {
'use strict';

// Source: infinitedropdown.tpl.js
angular.module('adaptv.adaptStrap.infinitedropdown').run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('infinitedropdown/infinitedropdown.tpl.html', '<div class="ad-infinite-list-container"><div class="dropdown"><button type="button" class="dropdown-toggle" ng-class="attrs.btnClasses || \'btn btn-default\'" data-toggle="dropdown"><span ng-if="!attrs.labelDisplayProperty || !selectedItems.length">{{ attrs.initialLabel || \'Select\' }}</span> <span ng-if="attrs.labelDisplayProperty && selectedItems.length">{{ readProperty(selectedItems[selectedItems.length - 1], attrs.labelDisplayProperty) }}</span> <span class="caret"></span></button><ul class="dropdown-menu" role="menu" ng-style="localConfig.dimensions"><li class="text-overflow" data-ng-repeat="item in items.list" ng-class="{\'active\': adStrapUtils.itemExistsInList(item, selectedItems)}" ng-click="addRemoveItem($event, item, selectedItems)"><a role="menuitem" tabindex="-1" href=""><span ng-if="attrs.displayProperty">{{ adStrapUtils.getObjectProperty(item, attrs.displayProperty) }}</span> <span ng-if="attrs.template" ad-compile-template="{{ attrs.template }}"></span> <span ng-if="attrs.templateUrl" ng-include="attrs.templateUrl"></span></a></li><li class="text-overflow text-center" ng-style="{\'opacity\': localConfig.loadingData ? 1 : 0}"><a role="menuitem" tabindex="-1" href=""><ad-loading-icon></ad-loading-icon></a></li></ul></div></div>');
  }
]);

// Source: loadingindicator.tpl.js
angular.module('adaptv.adaptStrap.loadingindicator').run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('loadingindicator/loadingindicator.tpl.html', '<div class="ad-loading-overlay-container" ng-class="containerClasses" ng-style="{\'z-index\': zIndex || \'1000\',\'position\': position || \'absolute\'}" ng-show="loading"><div class="wrapper"><div class="loading-indicator"><ad-loading-icon loading-icon-size="{{ loadingIconSize }}" loading-icon-class="{{ loadingIconClass }}"></ad-loading-icon></div></div></div>');
  }
]);

// Source: tableajax.tpl.js
angular.module('adaptv.adaptStrap.tableajax').run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('tableajax/tableajax.tpl.html', '<div class="ad-table-ajax-container" ng-if="items.paging.totalPages || localConfig.loadingData || !attrs.itemsNotFoundMessage"><table class="ad-sticky-table" ng-class="attrs.tableClasses || \'table\'" ng-if="localConfig.tableMaxHeight"><tr class="ad-user-select-none"><th data-ng-repeat="definition in columnDefinition" ng-click="sortByColumn(definition)" ng-class="{\'ad-cursor-pointer\': definition.sortKey}" ng-style="{\'width\': definition.width}"><div class="pull-right" ng-if="definition.sortKey && localConfig.predicate == definition.sortKey"><i ng-class="iconClasses.sortAscending" ng-hide="localConfig.reverse"></i> <i ng-class="iconClasses.sortDescending" ng-show="localConfig.reverse"></i></div><div class="pull-right" ng-if="definition.sortKey && localConfig.predicate != definition.sortKey"><i ng-class="iconClasses.sortable"></i></div><div ng-if="definition.columnHeaderTemplate" ng-bind-html="definition.columnHeaderTemplate"></div><div ng-if="definition.columnHeaderDisplayName" ng-bind="definition.columnHeaderDisplayName"></div></th></tr></table><div class="ad-table-container" ng-style="{\'max-height\': localConfig.tableMaxHeight}"><table ng-class="attrs.tableClasses || \'table\'"><tr class="ad-user-select-none" ng-if="!localConfig.tableMaxHeight"><th data-ng-repeat="definition in columnDefinition" ng-click="sortByColumn(definition)" ng-class="{\'ad-cursor-pointer\': definition.sortKey}" ng-style="{\'width\': definition.width}"><div class="pull-right" ng-if="definition.sortKey && localConfig.predicate == definition.sortKey"><i ng-class="iconClasses.sortAscending" ng-hide="localConfig.reverse"></i> <i ng-class="iconClasses.sortDescending" ng-show="localConfig.reverse"></i></div><div class="pull-right" ng-if="definition.sortKey && localConfig.predicate != definition.sortKey"><i ng-class="iconClasses.sortable"></i></div><div ng-if="definition.columnHeaderTemplate" ng-bind-html="definition.columnHeaderTemplate"></div><div ng-if="definition.columnHeaderDisplayName" ng-bind="definition.columnHeaderDisplayName"></div></th></tr><tr data-ng-repeat="item in items.list"><td data-ng-repeat="definition in columnDefinition" ng-style="{\'width\': definition.width}"><div ng-if="definition.templateUrl"><ng-include src="definition.templateUrl"></ng-include></div><div ng-if="definition.template"><span ad-compile-template="definition.template"></span></div><div ng-if="!definition.templateUrl && !definition.template">{{ adStrapUtils.applyFilter(adStrapUtils.getObjectProperty(item, definition.displayProperty, item), definition.cellFilter) }}</div></td></tr></table><ad-loading-overlay loading="localConfig.loadingData"></ad-loading-overlay></div><div class="row"><div class="col-md-8 col-sm-8"><div class="pull-left" ng-class="attrs.paginationBtnGroupClasses || \'btn-group btn-group-sm\'" ng-show="items.paging.totalPages > 1"><button type="button" class="btn btn-default" ng-click="loadPage(1)" ng-disabled="items.paging.currentPage == 1"><i ng-class="iconClasses.firstPage"></i></button> <button type="button" class="btn btn-default" ng-click="loadPreviousPage()" ng-disabled="items.paging.currentPage == 1"><i ng-class="iconClasses.previousPage"></i></button> <button type="button" class="btn btn-default" ng-repeat="page in localConfig.pagingArray" ng-class="{active: items.paging.currentPage == page}" ng-click="loadPage(page)">{{ page }}</button> <button type="button" class="btn btn-default" ng-click="loadNextPage()" ng-disabled="items.paging.currentPage == items.paging.totalPages"><i ng-class="iconClasses.nextPage"></i></button> <button type="button" class="btn btn-default" ng-click="loadLastPage()" ng-disabled="items.paging.currentPage == items.paging.totalPages"><i ng-class="iconClasses.lastPage"></i></button></div></div><div class="col-md-4 col-sm-4"><div class="pull-right" ng-class="attrs.paginationBtnGroupClasses || \'btn-group btn-group-sm\'"><button type="button" class="btn btn-default" ng-repeat="size in items.paging.pageSizes" ng-class="{active: items.paging.pageSize == size}" ng-click="pageSizeChanged(size)">{{ size }}</button></div></div></div></div><div ng-if="!items.paging.totalPages && !localConfig.loadingData && attrs.itemsNotFoundMessage"><div class="alert alert-info" role="alert">{{ attrs.itemsNotFoundMessage }}</div></div>');
  }
]);

// Source: tablelite.tpl.js
angular.module('adaptv.adaptStrap.tablelite').run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('tablelite/tablelite.tpl.html', '<div class="ad-table-lite-container" ng-if="items.allItems.length || !attrs.itemsNotFoundMessage"><table class="ad-sticky-table" ng-class="attrs.tableClasses || \'table\'" ng-if="attrs.tableMaxHeight"><tr class="ad-user-select-none"><th class="ad-select-cell" ng-if="attrs.draggable"><i></i></th><th class="ad-select-cell" ng-if="attrs.selectedItems && items.allItems"><input type="checkbox" class="ad-cursor-pointer" ng-click="adStrapUtils.addRemoveItemsFromList(items.allItems, selectedItems)" ng-checked="adStrapUtils.itemsExistInList(items.allItems, selectedItems)"></th><th data-ng-repeat="definition in columnDefinition" ng-click="sortByColumn(definition)" ng-class="{\'ad-cursor-pointer\': definition.sortKey}" ng-style="{\'width\': definition.width}"><div class="pull-right" ng-if="definition.sortKey && localConfig.predicate == definition.sortKey"><i ng-class="iconClasses.sortAscending" ng-hide="localConfig.reverse"></i> <i ng-class="iconClasses.sortDescending" ng-show="localConfig.reverse"></i></div><div class="pull-right" ng-if="definition.sortKey && localConfig.predicate != definition.sortKey"><i ng-class="iconClasses.sortable"></i></div><div ng-if="definition.columnHeaderTemplate" ng-bind-html="definition.columnHeaderTemplate"></div><div ng-if="definition.columnHeaderDisplayName" ng-bind="definition.columnHeaderDisplayName"></div></th></tr></table><div class="ad-table-container" ng-style="{\'max-height\': attrs.tableMaxHeight}"><table ng-class="attrs.tableClasses || \'table\'"><tr class="ad-user-select-none" ng-if="!attrs.tableMaxHeight"><th class="ad-select-cell" ng-if="attrs.draggable"><i></i></th><th class="ad-select-cell" ng-if="attrs.selectedItems && items.allItems"><input type="checkbox" class="ad-cursor-pointer" ng-click="adStrapUtils.addRemoveItemsFromList(items.allItems, selectedItems)" ng-checked="adStrapUtils.itemsExistInList(items.allItems, selectedItems)"></th><th data-ng-repeat="definition in columnDefinition" ng-click="sortByColumn(definition)" ng-class="{\'ad-cursor-pointer\': definition.sortKey}" ng-style="{\'width\': definition.width}"><div class="pull-right" ng-if="definition.sortKey && localConfig.predicate == definition.sortKey"><i ng-class="iconClasses.sortAscending" ng-hide="localConfig.reverse"></i> <i ng-class="iconClasses.sortDescending" ng-show="localConfig.reverse"></i></div><div class="pull-right" ng-if="definition.sortKey && localConfig.predicate != definition.sortKey"><i ng-class="iconClasses.sortable"></i></div><div ng-if="definition.columnHeaderTemplate" ng-bind-html="definition.columnHeaderTemplate"></div><div ng-if="definition.columnHeaderDisplayName" ng-bind="definition.columnHeaderDisplayName"></div></th></tr><tr ng-if="!attrs.draggable" data-ng-repeat="item in items.list" ng-class="{\'ad-selected\': attrs.selectedItems && adStrapUtils.itemExistsInList(item, selectedItems)}"><td class="ad-select-cell" ng-if="attrs.selectedItems"><input type="checkbox" class="ad-cursor-pointer" ng-checked="adStrapUtils.itemExistsInList(item, selectedItems)" ng-click="adStrapUtils.addRemoveItemFromList(item, selectedItems)"></td><td data-ng-repeat="definition in columnDefinition" ng-style="{\'width\': definition.width}"><div ng-if="definition.templateUrl"><ng-include src="definition.templateUrl"></ng-include></div><div ng-if="definition.template"><span ad-compile-template="definition.template"></span></div><div ng-if="!definition.templateUrl && !definition.template">{{ adStrapUtils.applyFilter(adStrapUtils.getObjectProperty(item, definition.displayProperty), definition.cellFilter) }}</div></td></tr><tr ng-if="attrs.draggable" ad-drag="true" ad-drag-handle="true" ad-drop="true" ad-drag-data="item" ad-drop-over="onDragOver($data, $dragElement, $dropElement, $event)" ad-drop-end="onDropEnd($data, $dragElement, $dropElement, $event)" ad-drag-begin="onDragStart($data, $dragElement, $event)" ad-drag-end="onDragEnd($data, $dragElement, $event)" data-ng-repeat="item in items.list" ng-class="{\'ad-selected\': attrs.selectedItems && adStrapUtils.itemExistsInList(item, selectedItems)}"><td class="ad-select-cell ad-drag-handle" ng-if="attrs.draggable"><i ng-class="iconClasses.draggable"></i></td><td class="ad-select-cell" ng-if="attrs.selectedItems"><input type="checkbox" class="ad-cursor-pointer" ng-checked="adStrapUtils.itemExistsInList(item, selectedItems)" ng-click="adStrapUtils.addRemoveItemFromList(item, selectedItems)"></td><td data-ng-repeat="definition in columnDefinition" ng-style="{\'width\': definition.width}"><div ng-if="definition.templateUrl"><ng-include src="definition.templateUrl"></ng-include></div><div ng-if="definition.template"><span ad-compile-template="definition.template"></span></div><div ng-if="!definition.templateUrl && !definition.template">{{ adStrapUtils.applyFilter(adStrapUtils.getObjectProperty(item, definition.displayProperty), definition.cellFilter) }}</div></td></tr></table></div><div class="row" ng-if="items.allItems.length > items.paging.pageSizes[0] && !attrs.disablePaging"><div class="col-md-8 col-sm-8"><div class="pull-left" ng-class="attrs.paginationBtnGroupClasses || \'btn-group btn-group-sm\'"><button type="button" class="btn btn-default" ng-click="loadPage(1)" ng-disabled="items.paging.currentPage == 1"><i ng-class="iconClasses.firstPage"></i></button> <button type="button" class="btn btn-default" ng-if="!attrs.draggable" ng-click="loadPreviousPage()" ng-disabled="items.paging.currentPage == 1"><i ng-class="iconClasses.previousPage"></i></button> <button type="button" id="btnPrev" class="btn btn-default" ng-if="attrs.draggable" ad-drop="true" ad-drop-over="onNextPageButtonOver($data, $dragElement, $dropElement, $event)" ad-drop-end="onNextPageButtonDrop($data, $dragElement, $dropElement, $event)" ng-click="loadPreviousPage()" ng-disabled="items.paging.currentPage == 1"><i ng-class="iconClasses.previousPage"></i></button> <button type="button" class="btn btn-default" ng-repeat="page in localConfig.pagingArray" ng-class="{active: items.paging.currentPage == page}" ng-click="loadPage(page)">{{ page }}</button> <button type="button" class="btn btn-default" ng-if="!attrs.draggable" ng-click="loadNextPage()" ng-disabled="items.paging.currentPage == items.paging.totalPages"><i ng-class="iconClasses.nextPage"></i></button> <button type="button" class="btn btn-default" id="btnNext" ng-if="attrs.draggable" ad-drop="true" ad-drop-over="onNextPageButtonOver($data, $dragElement, $dropElement, $event)" ad-drop-end="onNextPageButtonDrop($data, $dragElement, $dropElement, $event)" ng-click="loadNextPage()" ng-disabled="items.paging.currentPage == items.paging.totalPages"><i ng-class="iconClasses.nextPage"></i></button> <button type="button" class="btn btn-default" ng-click="loadLastPage()" ng-disabled="items.paging.currentPage == items.paging.totalPages"><i ng-class="iconClasses.lastPage"></i></button></div></div><div class="col-md-4 col-sm-4"><div class="pull-right" ng-class="attrs.paginationBtnGroupClasses || \'btn-group btn-group-sm\'"><button type="button" class="btn btn-default" ng-repeat="size in items.paging.pageSizes" ng-class="{active: items.paging.pageSize == size}" ng-click="pageSizeChanged(size)">{{ size }}</button></div></div></div></div><div ng-if="!items.allItems.length && attrs.itemsNotFoundMessage"><div class="alert alert-info" role="alert">{{ attrs.itemsNotFoundMessage }}</div></div>');
  }
]);

// Source: treebrowser.tpl.js
angular.module('adaptv.adaptStrap.treebrowser').run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('treebrowser/treebrowser.tpl.html', '<div class="ad-tree-browser-container" ng-class="{\'tree-bordered\': attrs.bordered}"><div data-level="0" class="tree-view"><div class="tree"><script type="text/ng-template" id="{{ localConfig.rendererTemplateId }}"><div class="content"\n' + '                     ng-style="{\'padding-left\': level * (attrs.childrenPadding || 15) + \'px\'}"\n' + '                     ng-class="{{ attrs.rowNgClass }}">\n' + '                    <div class="content-holder">\n' + '                        <div class="toggle">\n' + '                            <i ng-if="!item._ad_expanded && hasChildren(item) && !item._ad_loading"\n' + '                               ng-class="iconClasses.expand"\n' + '                               ng-click="toggle($event,item)"></i>\n' + '                            <i ng-if="item._ad_expanded && !item._ad_loading"\n' + '                               ng-class="iconClasses.collapse"\n' + '                               ng-click="toggle($event,item)"></i>\n' + '                            <span ng-if="item._ad_loading">\n' + '                                <i ng-class="iconClasses.loadingSpinner"></i>\n' + '                            </span>\n' + '                        </div>\n' + '                        <div class="node-content">\n' + '                          <ng-include ng-if="attrs.nodeTemplateUrl" src="attrs.nodeTemplateUrl"></ng-include>\n' + '                          <span ng-if="!attrs.nodeTemplateUrl">{{ item.name || "" }}</span>\n' + '                        </div>\n' + '                    </div>\n' + '                </div>\n' + '                <div ng-show="item._ad_expanded">\n' + '                    <div class="tree-level tree-sub-level"\n' + '                         onLoad="level=level+1"\n' + '                         ng-repeat="item in item[attrs.childNode]"\n' + '                         ng-include="\'{{ localConfig.rendererTemplateId }}\'">\n' + '                    </div>\n' + '                </div></script><div><div class="tree-level tree-header-level border" ng-if="attrs.nodeHeaderUrl"><div class="content" ng-style="{\'padding-left\': (attrs.childrenPadding || 15) + \'px\'}"><div class="content-holder"><div class="toggle"></div><div class="node-content ad-user-select-none" ng-include="attrs.nodeHeaderUrl"></div></div></div></div><div class="tree-level tree-top-level border" onload="level = 1" ng-repeat="item in treeRoot[attrs.childNode]" ng-include="\'{{ localConfig.rendererTemplateId }}\'"></div></div></div></div></div>');
  }
]);


})(window, document);

},{}],4:[function(require,module,exports){
/**
 * angular-growl-v2 - v0.7.0 - 2014-08-10
 * http://janstevens.github.io/angular-growl-2
 * Copyright (c) 2014 Marco Rinck,Jan Stevens; Licensed MIT
 */
angular.module("angular-growl",[]),angular.module("angular-growl").directive("growl",["$rootScope","$sce",function(a,b){"use strict";return{restrict:"A",templateUrl:"templates/growl/growl.html",replace:!1,scope:{reference:"@",inline:"@",limitMessages:"="},controller:["$scope","$timeout","growl",function(c,d,e){function f(a){d(function(){var f,h;if(!g||(angular.forEach(c.messages,function(c){h=b.getTrustedHtml(c.text),a.text===h&&a.severity===c.severity&&c.title===c.title&&(f=!0)}),!f)){if(a.text=b.trustAsHtml(String(a.text)),a.ttl&&-1!==a.ttl&&(a.countdown=a.ttl/1e3,a.promises=[],a.close=!1,a.countdownFunction=function(){a.countdown>1?(a.countdown--,a.promises.push(d(a.countdownFunction,1e3))):a.countdown--}),angular.isDefined(c.limitMessages)){var i=c.messages.length-(c.limitMessages-1);i>0&&c.messages.splice(c.limitMessages-1,i)}e.reverseOrder()?c.messages.unshift(a):c.messages.push(a),a.ttl&&-1!==a.ttl&&(a.promises.push(d(function(){c.deleteMessage(a)},a.ttl)),a.promises.push(d(a.countdownFunction,1e3)))}},!0)}var g=e.onlyUnique();c.messages=[];var h=c.reference||0;c.inlineMessage=c.inline||e.inlineMessages(),a.$on("growlMessage",function(a,b){parseInt(h,10)===parseInt(b.referenceId,10)&&f(b)}),c.deleteMessage=function(a){var b=c.messages.indexOf(a);b>-1&&c.messages.splice(b,1)},c.stopTimeoutClose=function(a){angular.forEach(a.promises,function(a){d.cancel(a)}),a.close?c.deleteMessage(a):a.close=!0},c.alertClasses=function(a){return{"alert-success":"success"===a.severity,"alert-error":"error"===a.severity,"alert-danger":"error"===a.severity,"alert-info":"info"===a.severity,"alert-warning":"warning"===a.severity,icon:a.disableIcons===!1,"alert-dismissable":!a.disableCloseButton}},c.showCountDown=function(a){return!a.disableCountDown&&a.ttl>0},c.wrapperClasses=function(){var a={};return a["growl-fixed"]=!c.inlineMessage,a[e.position()]=!0,a},c.computeTitle=function(a){var b={success:"Success",error:"Error",info:"Information",warn:"Warning"};return b[a.severity]}}]}}]),angular.module("angular-growl").run(["$templateCache",function(a){"use strict";void 0===a.get("templates/growl/growl.html")&&a.put("templates/growl/growl.html",'<div class="growl-container" ng-class="wrapperClasses()"><div class="growl-item alert" ng-repeat="message in messages" ng-class="alertClasses(message)" ng-click="stopTimeoutClose(message)"><button type="button" class="close" data-dismiss="alert" aria-hidden="true" ng-click="deleteMessage(message)" ng-show="!message.disableCloseButton">&times;</button><button type="button" class="close" aria-hidden="true" ng-show="showCountDown(message)">{{message.countdown}}</button><h4 class="growl-title" ng-show="message.title" ng-bind="message.title"></h4><div class="growl-message" ng-bind-html="message.text"></div></div></div>')}]),angular.module("angular-growl").provider("growl",function(){"use strict";var a={success:null,error:null,warning:null,info:null},b="messages",c="text",d="title",e="severity",f=!0,g="variables",h=0,i=!1,j="top-right",k=!1,l=!1,m=!1,n=!1;this.globalTimeToLive=function(b){if("object"==typeof b)for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);else for(var d in a)a.hasOwnProperty(d)&&(a[d]=b)},this.globalDisableCloseButton=function(a){k=a},this.globalDisableIcons=function(a){l=a},this.globalReversedOrder=function(a){m=a},this.globalDisableCountDown=function(a){n=a},this.messageVariableKey=function(a){g=a},this.globalInlineMessages=function(a){i=a},this.globalPosition=function(a){j=a},this.messagesKey=function(a){b=a},this.messageTextKey=function(a){c=a},this.messageTitleKey=function(a){d=a},this.messageSeverityKey=function(a){e=a},this.onlyUniqueMessages=function(a){f=a},this.serverMessagesInterceptor=["$q","growl",function(a,c){function d(a){a.data[b]&&a.data[b].length>0&&c.addServerMessages(a.data[b])}return{response:function(a){return d(a),a},responseError:function(b){return d(b),a.reject(b)}}}],this.$get=["$rootScope","$interpolate","$filter",function(b,o,p){function q(a){if(B)a.text=B(a.text,a.variables);else{var c=o(a.text);a.text=c(a.variables)}b.$broadcast("growlMessage",a)}function r(b,c,d){var e,f=c||{};e={text:b,title:f.title,severity:d,ttl:f.ttl||a[d],variables:f.variables||{},disableCloseButton:void 0===f.disableCloseButton?k:f.disableCloseButton,disableIcons:void 0===f.disableIcons?l:f.disableIcons,disableCountDown:void 0===f.disableCountDown?n:f.disableCountDown,position:f.position||j,referenceId:f.referenceId||h},q(e)}function s(a,b){r(a,b,"warning")}function t(a,b){r(a,b,"error")}function u(a,b){r(a,b,"info")}function v(a,b){r(a,b,"success")}function w(a){var b,f,h,i;for(i=a.length,b=0;i>b;b++)if(f=a[b],f[c]){h=f[e]||"error";var j={};j.variables=f[g]||{},j.title=f[d],r(f[c],j,h)}}function x(){return f}function y(){return m}function z(){return i}function A(){return j}var B;try{B=p("translate")}catch(C){}return{warning:s,error:t,info:u,success:v,addServerMessages:w,onlyUnique:x,reverseOrder:y,inlineMessages:z,position:A}}]});
},{}],5:[function(require,module,exports){
/**
 * @license AngularJS v1.3.1
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular, undefined) {'use strict';

var $sanitizeMinErr = angular.$$minErr('$sanitize');

/**
 * @ngdoc module
 * @name ngSanitize
 * @description
 *
 * # ngSanitize
 *
 * The `ngSanitize` module provides functionality to sanitize HTML.
 *
 *
 * <div doc-module-components="ngSanitize"></div>
 *
 * See {@link ngSanitize.$sanitize `$sanitize`} for usage.
 */

/*
 * HTML Parser By Misko Hevery (misko@hevery.com)
 * based on:  HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Use like so:
 * htmlParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 */


/**
 * @ngdoc service
 * @name $sanitize
 * @kind function
 *
 * @description
 *   The input is sanitized by parsing the HTML into tokens. All safe tokens (from a whitelist) are
 *   then serialized back to properly escaped html string. This means that no unsafe input can make
 *   it into the returned string, however, since our parser is more strict than a typical browser
 *   parser, it's possible that some obscure input, which would be recognized as valid HTML by a
 *   browser, won't make it through the sanitizer. The input may also contain SVG markup.
 *   The whitelist is configured using the functions `aHrefSanitizationWhitelist` and
 *   `imgSrcSanitizationWhitelist` of {@link ng.$compileProvider `$compileProvider`}.
 *
 * @param {string} html HTML input.
 * @returns {string} Sanitized HTML.
 *
 * @example
   <example module="sanitizeExample" deps="angular-sanitize.js">
   <file name="index.html">
     <script>
         angular.module('sanitizeExample', ['ngSanitize'])
           .controller('ExampleController', ['$scope', '$sce', function($scope, $sce) {
             $scope.snippet =
               '<p style="color:blue">an html\n' +
               '<em onmouseover="this.textContent=\'PWN3D!\'">click here</em>\n' +
               'snippet</p>';
             $scope.deliberatelyTrustDangerousSnippet = function() {
               return $sce.trustAsHtml($scope.snippet);
             };
           }]);
     </script>
     <div ng-controller="ExampleController">
        Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
       <table>
         <tr>
           <td>Directive</td>
           <td>How</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="bind-html-with-sanitize">
           <td>ng-bind-html</td>
           <td>Automatically uses $sanitize</td>
           <td><pre>&lt;div ng-bind-html="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng-bind-html="snippet"></div></td>
         </tr>
         <tr id="bind-html-with-trust">
           <td>ng-bind-html</td>
           <td>Bypass $sanitize by explicitly trusting the dangerous value</td>
           <td>
           <pre>&lt;div ng-bind-html="deliberatelyTrustDangerousSnippet()"&gt;
&lt;/div&gt;</pre>
           </td>
           <td><div ng-bind-html="deliberatelyTrustDangerousSnippet()"></div></td>
         </tr>
         <tr id="bind-default">
           <td>ng-bind</td>
           <td>Automatically escapes</td>
           <td><pre>&lt;div ng-bind="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng-bind="snippet"></div></td>
         </tr>
       </table>
       </div>
   </file>
   <file name="protractor.js" type="protractor">
     it('should sanitize the html snippet by default', function() {
       expect(element(by.css('#bind-html-with-sanitize div')).getInnerHtml()).
         toBe('<p>an html\n<em>click here</em>\nsnippet</p>');
     });

     it('should inline raw snippet if bound to a trusted value', function() {
       expect(element(by.css('#bind-html-with-trust div')).getInnerHtml()).
         toBe("<p style=\"color:blue\">an html\n" +
              "<em onmouseover=\"this.textContent='PWN3D!'\">click here</em>\n" +
              "snippet</p>");
     });

     it('should escape snippet without any filter', function() {
       expect(element(by.css('#bind-default div')).getInnerHtml()).
         toBe("&lt;p style=\"color:blue\"&gt;an html\n" +
              "&lt;em onmouseover=\"this.textContent='PWN3D!'\"&gt;click here&lt;/em&gt;\n" +
              "snippet&lt;/p&gt;");
     });

     it('should update', function() {
       element(by.model('snippet')).clear();
       element(by.model('snippet')).sendKeys('new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-html-with-sanitize div')).getInnerHtml()).
         toBe('new <b>text</b>');
       expect(element(by.css('#bind-html-with-trust div')).getInnerHtml()).toBe(
         'new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-default div')).getInnerHtml()).toBe(
         "new &lt;b onclick=\"alert(1)\"&gt;text&lt;/b&gt;");
     });
   </file>
   </example>
 */
function $SanitizeProvider() {
  this.$get = ['$$sanitizeUri', function($$sanitizeUri) {
    return function(html) {
      var buf = [];
      htmlParser(html, htmlSanitizeWriter(buf, function(uri, isImage) {
        return !/^unsafe/.test($$sanitizeUri(uri, isImage));
      }));
      return buf.join('');
    };
  }];
}

function sanitizeText(chars) {
  var buf = [];
  var writer = htmlSanitizeWriter(buf, angular.noop);
  writer.chars(chars);
  return buf.join('');
}


// Regular Expressions for parsing tags and attributes
var START_TAG_REGEXP =
       /^<((?:[a-zA-Z])[\w:-]*)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*(>?)/,
  END_TAG_REGEXP = /^<\/\s*([\w:-]+)[^>]*>/,
  ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g,
  BEGIN_TAG_REGEXP = /^</,
  BEGING_END_TAGE_REGEXP = /^<\//,
  COMMENT_REGEXP = /<!--(.*?)-->/g,
  DOCTYPE_REGEXP = /<!DOCTYPE([^>]*?)>/i,
  CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g,
  SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
  // Match everything outside of normal chars and " (quote character)
  NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g;


// Good source of info about elements and attributes
// http://dev.w3.org/html5/spec/Overview.html#semantics
// http://simon.html5.org/html-elements

// Safe Void Elements - HTML5
// http://dev.w3.org/html5/spec/Overview.html#void-elements
var voidElements = makeMap("area,br,col,hr,img,wbr");

// Elements that you can, intentionally, leave open (and which close themselves)
// http://dev.w3.org/html5/spec/Overview.html#optional-tags
var optionalEndTagBlockElements = makeMap("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),
    optionalEndTagInlineElements = makeMap("rp,rt"),
    optionalEndTagElements = angular.extend({},
                                            optionalEndTagInlineElements,
                                            optionalEndTagBlockElements);

// Safe Block Elements - HTML5
var blockElements = angular.extend({}, optionalEndTagBlockElements, makeMap("address,article," +
        "aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5," +
        "h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul"));

// Inline Elements - HTML5
var inlineElements = angular.extend({}, optionalEndTagInlineElements, makeMap("a,abbr,acronym,b," +
        "bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s," +
        "samp,small,span,strike,strong,sub,sup,time,tt,u,var"));

// SVG Elements
// https://wiki.whatwg.org/wiki/Sanitization_rules#svg_Elements
var svgElements = makeMap("animate,animateColor,animateMotion,animateTransform,circle,defs," +
        "desc,ellipse,font-face,font-face-name,font-face-src,g,glyph,hkern,image,linearGradient," +
        "line,marker,metadata,missing-glyph,mpath,path,polygon,polyline,radialGradient,rect,set," +
        "stop,svg,switch,text,title,tspan,use");

// Special Elements (can contain anything)
var specialElements = makeMap("script,style");

var validElements = angular.extend({},
                                   voidElements,
                                   blockElements,
                                   inlineElements,
                                   optionalEndTagElements,
                                   svgElements);

//Attributes that have href and hence need to be sanitized
var uriAttrs = makeMap("background,cite,href,longdesc,src,usemap,xlink:href");

var htmlAttrs = makeMap('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,'+
    'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,'+
    'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,'+
    'scope,scrolling,shape,size,span,start,summary,target,title,type,'+
    'valign,value,vspace,width');

// SVG attributes (without "id" and "name" attributes)
// https://wiki.whatwg.org/wiki/Sanitization_rules#svg_Attributes
var svgAttrs = makeMap('accent-height,accumulate,additive,alphabetic,arabic-form,ascent,'+
    'attributeName,attributeType,baseProfile,bbox,begin,by,calcMode,cap-height,class,color,'+
    'color-rendering,content,cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,'+
    'font-size,font-stretch,font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,'+
    'gradientUnits,hanging,height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,'+
    'keySplines,keyTimes,lang,marker-end,marker-mid,marker-start,markerHeight,markerUnits,'+
    'markerWidth,mathematical,max,min,offset,opacity,orient,origin,overline-position,'+
    'overline-thickness,panose-1,path,pathLength,points,preserveAspectRatio,r,refX,refY,'+
    'repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,'+
    'stemv,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,stroke,'+
    'stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,'+
    'stroke-opacity,stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,'+
    'underline-position,underline-thickness,unicode,unicode-range,units-per-em,values,version,'+
    'viewBox,visibility,width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,'+
    'xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,'+
    'zoomAndPan');

var validAttrs = angular.extend({},
                                uriAttrs,
                                svgAttrs,
                                htmlAttrs);

function makeMap(str) {
  var obj = {}, items = str.split(','), i;
  for (i = 0; i < items.length; i++) obj[items[i]] = true;
  return obj;
}


/**
 * @example
 * htmlParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * @param {string} html string
 * @param {object} handler
 */
function htmlParser(html, handler) {
  if (typeof html !== 'string') {
    if (html === null || typeof html === 'undefined') {
      html = '';
    } else {
      html = '' + html;
    }
  }
  var index, chars, match, stack = [], last = html, text;
  stack.last = function() { return stack[ stack.length - 1 ]; };

  while (html) {
    text = '';
    chars = true;

    // Make sure we're not in a script or style element
    if (!stack.last() || !specialElements[ stack.last() ]) {

      // Comment
      if (html.indexOf("<!--") === 0) {
        // comments containing -- are not allowed unless they terminate the comment
        index = html.indexOf("--", 4);

        if (index >= 0 && html.lastIndexOf("-->", index) === index) {
          if (handler.comment) handler.comment(html.substring(4, index));
          html = html.substring(index + 3);
          chars = false;
        }
      // DOCTYPE
      } else if (DOCTYPE_REGEXP.test(html)) {
        match = html.match(DOCTYPE_REGEXP);

        if (match) {
          html = html.replace(match[0], '');
          chars = false;
        }
      // end tag
      } else if (BEGING_END_TAGE_REGEXP.test(html)) {
        match = html.match(END_TAG_REGEXP);

        if (match) {
          html = html.substring(match[0].length);
          match[0].replace(END_TAG_REGEXP, parseEndTag);
          chars = false;
        }

      // start tag
      } else if (BEGIN_TAG_REGEXP.test(html)) {
        match = html.match(START_TAG_REGEXP);

        if (match) {
          // We only have a valid start-tag if there is a '>'.
          if (match[4]) {
            html = html.substring(match[0].length);
            match[0].replace(START_TAG_REGEXP, parseStartTag);
          }
          chars = false;
        } else {
          // no ending tag found --- this piece should be encoded as an entity.
          text += '<';
          html = html.substring(1);
        }
      }

      if (chars) {
        index = html.indexOf("<");

        text += index < 0 ? html : html.substring(0, index);
        html = index < 0 ? "" : html.substring(index);

        if (handler.chars) handler.chars(decodeEntities(text));
      }

    } else {
      html = html.replace(new RegExp("(.*)<\\s*\\/\\s*" + stack.last() + "[^>]*>", 'i'),
        function(all, text) {
          text = text.replace(COMMENT_REGEXP, "$1").replace(CDATA_REGEXP, "$1");

          if (handler.chars) handler.chars(decodeEntities(text));

          return "";
      });

      parseEndTag("", stack.last());
    }

    if (html == last) {
      throw $sanitizeMinErr('badparse', "The sanitizer was unable to parse the following block " +
                                        "of html: {0}", html);
    }
    last = html;
  }

  // Clean up any remaining tags
  parseEndTag();

  function parseStartTag(tag, tagName, rest, unary) {
    tagName = angular.lowercase(tagName);
    if (blockElements[ tagName ]) {
      while (stack.last() && inlineElements[ stack.last() ]) {
        parseEndTag("", stack.last());
      }
    }

    if (optionalEndTagElements[ tagName ] && stack.last() == tagName) {
      parseEndTag("", tagName);
    }

    unary = voidElements[ tagName ] || !!unary;

    if (!unary)
      stack.push(tagName);

    var attrs = {};

    rest.replace(ATTR_REGEXP,
      function(match, name, doubleQuotedValue, singleQuotedValue, unquotedValue) {
        var value = doubleQuotedValue
          || singleQuotedValue
          || unquotedValue
          || '';

        attrs[name] = decodeEntities(value);
    });
    if (handler.start) handler.start(tagName, attrs, unary);
  }

  function parseEndTag(tag, tagName) {
    var pos = 0, i;
    tagName = angular.lowercase(tagName);
    if (tagName)
      // Find the closest opened tag of the same type
      for (pos = stack.length - 1; pos >= 0; pos--)
        if (stack[ pos ] == tagName)
          break;

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (i = stack.length - 1; i >= pos; i--)
        if (handler.end) handler.end(stack[ i ]);

      // Remove the open elements from the stack
      stack.length = pos;
    }
  }
}

var hiddenPre=document.createElement("pre");
var spaceRe = /^(\s*)([\s\S]*?)(\s*)$/;
/**
 * decodes all entities into regular string
 * @param value
 * @returns {string} A string with decoded entities.
 */
function decodeEntities(value) {
  if (!value) { return ''; }

  // Note: IE8 does not preserve spaces at the start/end of innerHTML
  // so we must capture them and reattach them afterward
  var parts = spaceRe.exec(value);
  var spaceBefore = parts[1];
  var spaceAfter = parts[3];
  var content = parts[2];
  if (content) {
    hiddenPre.innerHTML=content.replace(/</g,"&lt;");
    // innerText depends on styling as it doesn't display hidden elements.
    // Therefore, it's better to use textContent not to cause unnecessary
    // reflows. However, IE<9 don't support textContent so the innerText
    // fallback is necessary.
    content = 'textContent' in hiddenPre ?
      hiddenPre.textContent : hiddenPre.innerText;
  }
  return spaceBefore + content + spaceAfter;
}

/**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param value
 * @returns {string} escaped text
 */
function encodeEntities(value) {
  return value.
    replace(/&/g, '&amp;').
    replace(SURROGATE_PAIR_REGEXP, function(value) {
      var hi = value.charCodeAt(0);
      var low = value.charCodeAt(1);
      return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
    }).
    replace(NON_ALPHANUMERIC_REGEXP, function(value) {
      return '&#' + value.charCodeAt(0) + ';';
    }).
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;');
}

/**
 * create an HTML/XML writer which writes to buffer
 * @param {Array} buf use buf.jain('') to get out sanitized html string
 * @returns {object} in the form of {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * }
 */
function htmlSanitizeWriter(buf, uriValidator) {
  var ignore = false;
  var out = angular.bind(buf, buf.push);
  return {
    start: function(tag, attrs, unary) {
      tag = angular.lowercase(tag);
      if (!ignore && specialElements[tag]) {
        ignore = tag;
      }
      if (!ignore && validElements[tag] === true) {
        out('<');
        out(tag);
        angular.forEach(attrs, function(value, key) {
          var lkey=angular.lowercase(key);
          var isImage = (tag === 'img' && lkey === 'src') || (lkey === 'background');
          if (validAttrs[lkey] === true &&
            (uriAttrs[lkey] !== true || uriValidator(value, isImage))) {
            out(' ');
            out(key);
            out('="');
            out(encodeEntities(value));
            out('"');
          }
        });
        out(unary ? '/>' : '>');
      }
    },
    end: function(tag) {
        tag = angular.lowercase(tag);
        if (!ignore && validElements[tag] === true) {
          out('</');
          out(tag);
          out('>');
        }
        if (tag == ignore) {
          ignore = false;
        }
      },
    chars: function(chars) {
        if (!ignore) {
          out(encodeEntities(chars));
        }
      }
  };
}


// define ngSanitize module and register $sanitize service
angular.module('ngSanitize', []).provider('$sanitize', $SanitizeProvider);

/* global sanitizeText: false */

/**
 * @ngdoc filter
 * @name linky
 * @kind function
 *
 * @description
 * Finds links in text input and turns them into html links. Supports http/https/ftp/mailto and
 * plain email address links.
 *
 * Requires the {@link ngSanitize `ngSanitize`} module to be installed.
 *
 * @param {string} text Input text.
 * @param {string} target Window (_blank|_self|_parent|_top) or named frame to open links in.
 * @returns {string} Html-linkified text.
 *
 * @usage
   <span ng-bind-html="linky_expression | linky"></span>
 *
 * @example
   <example module="linkyExample" deps="angular-sanitize.js">
     <file name="index.html">
       <script>
         angular.module('linkyExample', ['ngSanitize'])
           .controller('ExampleController', ['$scope', function($scope) {
             $scope.snippet =
               'Pretty text with some links:\n'+
               'http://angularjs.org/,\n'+
               'mailto:us@somewhere.org,\n'+
               'another@somewhere.org,\n'+
               'and one more: ftp://127.0.0.1/.';
             $scope.snippetWithTarget = 'http://angularjs.org/';
           }]);
       </script>
       <div ng-controller="ExampleController">
       Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
       <table>
         <tr>
           <td>Filter</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="linky-filter">
           <td>linky filter</td>
           <td>
             <pre>&lt;div ng-bind-html="snippet | linky"&gt;<br>&lt;/div&gt;</pre>
           </td>
           <td>
             <div ng-bind-html="snippet | linky"></div>
           </td>
         </tr>
         <tr id="linky-target">
          <td>linky target</td>
          <td>
            <pre>&lt;div ng-bind-html="snippetWithTarget | linky:'_blank'"&gt;<br>&lt;/div&gt;</pre>
          </td>
          <td>
            <div ng-bind-html="snippetWithTarget | linky:'_blank'"></div>
          </td>
         </tr>
         <tr id="escaped-html">
           <td>no filter</td>
           <td><pre>&lt;div ng-bind="snippet"&gt;<br>&lt;/div&gt;</pre></td>
           <td><div ng-bind="snippet"></div></td>
         </tr>
       </table>
     </file>
     <file name="protractor.js" type="protractor">
       it('should linkify the snippet with urls', function() {
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(4);
       });

       it('should not linkify snippet without the linky filter', function() {
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, mailto:us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#escaped-html a')).count()).toEqual(0);
       });

       it('should update', function() {
         element(by.model('snippet')).clear();
         element(by.model('snippet')).sendKeys('new http://link.');
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('new http://link.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(1);
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText())
             .toBe('new http://link.');
       });

       it('should work with the target property', function() {
        expect(element(by.id('linky-target')).
            element(by.binding("snippetWithTarget | linky:'_blank'")).getText()).
            toBe('http://angularjs.org/');
        expect(element(by.css('#linky-target a')).getAttribute('target')).toEqual('_blank');
       });
     </file>
   </example>
 */
angular.module('ngSanitize').filter('linky', ['$sanitize', function($sanitize) {
  var LINKY_URL_REGEXP =
        /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"]/,
      MAILTO_REGEXP = /^mailto:/;

  return function(text, target) {
    if (!text) return text;
    var match;
    var raw = text;
    var html = [];
    var url;
    var i;
    while ((match = raw.match(LINKY_URL_REGEXP))) {
      // We can not end in these as they are sometimes found at the end of the sentence
      url = match[0];
      // if we did not match ftp/http/mailto then assume mailto
      if (match[2] == match[3]) url = 'mailto:' + url;
      i = match.index;
      addText(raw.substr(0, i));
      addLink(url, match[0].replace(MAILTO_REGEXP, ''));
      raw = raw.substring(i + match[0].length);
    }
    addText(raw);
    return $sanitize(html.join(''));

    function addText(text) {
      if (!text) {
        return;
      }
      html.push(sanitizeText(text));
    }

    function addLink(url, text) {
      html.push('<a ');
      if (angular.isDefined(target)) {
        html.push('target="');
        html.push(target);
        html.push('" ');
      }
      html.push('href="');
      html.push(url);
      html.push('">');
      addText(text);
      html.push('</a>');
    }
  };
}]);


})(window, window.angular);

},{}],6:[function(require,module,exports){
/**!
 * AngularJS file upload shim for HTML5 FormData
 * @author  Danial  <danial.farid@gmail.com>
 * @version 1.6.12
 */
(function() {

var hasFlash = function() {
	try {
	  var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
	  if (fo) return true;
	} catch(e) {
	  if (navigator.mimeTypes['application/x-shockwave-flash'] != undefined) return true;
	}
	return false;
}

var patchXHR = function(fnName, newFn) {
	window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
};

if (window.XMLHttpRequest) {
	if (window.FormData && (!window.FileAPI || !FileAPI.forceLoad)) {
		// allow access to Angular XHR private field: https://github.com/angular/angular.js/issues/1934
		patchXHR('setRequestHeader', function(orig) {
			return function(header, value) {
				if (header === '__setXHR_') {
					var val = value(this);
					// fix for angular < 1.2.0
					if (val instanceof Function) {
						val(this);
					}
				} else {
					orig.apply(this, arguments);
				}
			}
		});
	} else {
		var initializeUploadListener = function(xhr) {
			if (!xhr.__listeners) {
				if (!xhr.upload) xhr.upload = {};
				xhr.__listeners = [];
				var origAddEventListener = xhr.upload.addEventListener;
				xhr.upload.addEventListener = function(t, fn, b) {
					xhr.__listeners[t] = fn;
					origAddEventListener && origAddEventListener.apply(this, arguments);
				};
			}
		}
		
		patchXHR('open', function(orig) {
			return function(m, url, b) {
				initializeUploadListener(this);
				this.__url = url;
				try {
					orig.apply(this, [m, url, b]);
				} catch (e) {
					if (e.message.indexOf('Access is denied') > -1) {
						orig.apply(this, [m, '_fix_for_ie_crossdomain__', b]);
					}
				}
			}
		});

		patchXHR('getResponseHeader', function(orig) {
			return function(h) {
				return this.__fileApiXHR && this.__fileApiXHR.getResponseHeader ? this.__fileApiXHR.getResponseHeader(h) : (orig == null ? null : orig.apply(this, [h]));
			};
		});

		patchXHR('getAllResponseHeaders', function(orig) {
			return function() {
				return this.__fileApiXHR && this.__fileApiXHR.getAllResponseHeaders ? this.__fileApiXHR.getAllResponseHeaders() : (orig == null ? null : orig.apply(this));
			}
		});

		patchXHR('abort', function(orig) {
			return function() {
				return this.__fileApiXHR && this.__fileApiXHR.abort ? this.__fileApiXHR.abort() : (orig == null ? null : orig.apply(this));
			}
		});

		patchXHR('setRequestHeader', function(orig) {
			return function(header, value) {
				if (header === '__setXHR_') {
					initializeUploadListener(this);
					var val = value(this);
					// fix for angular < 1.2.0
					if (val instanceof Function) {
						val(this);
					}
				} else {
					this.__requestHeaders = this.__requestHeaders || {};
					this.__requestHeaders[header] = value;
					orig.apply(this, arguments);
				}
			}
		});

		patchXHR('send', function(orig) {
			return function() {
				var xhr = this;
				if (arguments[0] && arguments[0].__isShim) {
					var formData = arguments[0];
					var config = {
						url: xhr.__url,
						jsonp: false, //removes the callback form param
						cache: true, //removes the ?fileapiXXX in the url
						complete: function(err, fileApiXHR) {
							xhr.__completed = true;
							if (!err && xhr.__listeners['load']) 
								xhr.__listeners['load']({type: 'load', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
							if (!err && xhr.__listeners['loadend']) 
								xhr.__listeners['loadend']({type: 'loadend', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
							if (err === 'abort' && xhr.__listeners['abort']) 
								xhr.__listeners['abort']({type: 'abort', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
							if (fileApiXHR.status !== undefined) Object.defineProperty(xhr, 'status', {get: function() {return (fileApiXHR.status == 0 && err && err !== 'abort') ? 500 : fileApiXHR.status}});
							if (fileApiXHR.statusText !== undefined) Object.defineProperty(xhr, 'statusText', {get: function() {return fileApiXHR.statusText}});
							Object.defineProperty(xhr, 'readyState', {get: function() {return 4}});
							if (fileApiXHR.response !== undefined) Object.defineProperty(xhr, 'response', {get: function() {return fileApiXHR.response}});
							var resp = fileApiXHR.responseText || (err && fileApiXHR.status == 0 && err !== 'abort' ? err : undefined);
							Object.defineProperty(xhr, 'responseText', {get: function() {return resp}});
							Object.defineProperty(xhr, 'response', {get: function() {return resp}});
							if (err) Object.defineProperty(xhr, 'err', {get: function() {return err}});
							xhr.__fileApiXHR = fileApiXHR;
							if (xhr.onreadystatechange) xhr.onreadystatechange();
						},
						fileprogress: function(e) {
							e.target = xhr;
							xhr.__listeners['progress'] && xhr.__listeners['progress'](e);
							xhr.__total = e.total;
							xhr.__loaded = e.loaded;
							if (e.total === e.loaded) {
								// fix flash issue that doesn't call complete if there is no response text from the server  
								var _this = this
								setTimeout(function() {
									if (!xhr.__completed) {
										xhr.getAllResponseHeaders = function(){};
										_this.complete(null, {status: 204, statusText: 'No Content'});
									}
								}, 10000);
							}
						},
						headers: xhr.__requestHeaders
					}
					config.data = {};
					config.files = {}
					for (var i = 0; i < formData.data.length; i++) {
						var item = formData.data[i];
						if (item.val != null && item.val.name != null && item.val.size != null && item.val.type != null) {
							config.files[item.key] = item.val;
						} else {
							config.data[item.key] = item.val;
						}
					}

					setTimeout(function() {
						if (!hasFlash()) {
							throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
						}
						xhr.__fileApiXHR = FileAPI.upload(config);
					}, 1);
				} else {
					orig.apply(xhr, arguments);
				}
			}
		});
	}
	window.XMLHttpRequest.__isShim = true;
}

if (!window.FormData || (window.FileAPI && FileAPI.forceLoad)) {
	var addFlash = function(elem) {
		if (!hasFlash()) {
			throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
		}
		var el = angular.element(elem);
		if (!el.attr('disabled')) {
			if (!el.hasClass('js-fileapi-wrapper') && (elem.getAttribute('ng-file-select') != null || elem.getAttribute('data-ng-file-select') != null)) {
				if (FileAPI.wrapInsideDiv) {
					var wrap = document.createElement('div');
					wrap.innerHTML = '<div class="js-fileapi-wrapper" style="position:relative; overflow:hidden"></div>';
					wrap = wrap.firstChild;
					var parent = elem.parentNode;
					parent.insertBefore(wrap, elem);
					parent.removeChild(elem);
					wrap.appendChild(elem);
				} else {
					el.addClass('js-fileapi-wrapper');
					if (el.parent()[0].__file_click_fn_delegate_) {
						if (el.parent().css('position') === '' || el.parent().css('position') === 'static') {
							el.parent().css('position', 'relative');
						}
						el.css('top', 0).css('bottom', 0).css('left', 0).css('right', 0).css('width', '100%').css('height', '100%').
							css('padding', 0).css('margin', 0);
						el.parent().unbind('click', el.parent()[0].__file_click_fn_delegate_);
					}
				}
			}
		}
	};
	var changeFnWrapper = function(fn) {
		return function(evt) {
			var files = FileAPI.getFiles(evt);
			//just a double check for #233
			for (var i = 0; i < files.length; i++) {
				if (files[i].size === undefined) files[i].size = 0;
				if (files[i].name === undefined) files[i].name = 'file';
				if (files[i].type === undefined) files[i].type = 'undefined';
			}
			if (!evt.target) {
				evt.target = {};
			}
			evt.target.files = files;
			// if evt.target.files is not writable use helper field
			if (evt.target.files != files) {
				evt.__files_ = files;
			}
			(evt.__files_ || evt.target.files).item = function(i) {
				return (evt.__files_ || evt.target.files)[i] || null;
			}
			if (fn) fn.apply(this, [evt]);
		};
	};
	var isFileChange = function(elem, e) {
		return (e.toLowerCase() === 'change' || e.toLowerCase() === 'onchange') && elem.getAttribute('type') == 'file';
	}
	if (HTMLInputElement.prototype.addEventListener) {
		HTMLInputElement.prototype.addEventListener = (function(origAddEventListener) {
			return function(e, fn, b, d) {
				if (isFileChange(this, e)) {
					addFlash(this);
					origAddEventListener.apply(this, [e, changeFnWrapper(fn), b, d]);
				} else {
					origAddEventListener.apply(this, [e, fn, b, d]);
				}
			}
		})(HTMLInputElement.prototype.addEventListener);
	}
	if (HTMLInputElement.prototype.attachEvent) {
		HTMLInputElement.prototype.attachEvent = (function(origAttachEvent) {
			return function(e, fn) {
				if (isFileChange(this, e)) {
					addFlash(this);
					if (window.jQuery) {
						// fix for #281 jQuery on IE8
						angular.element(this).bind('change', changeFnWrapper(null));
					} else {
						origAttachEvent.apply(this, [e, changeFnWrapper(fn)]);
					}
				} else {
					origAttachEvent.apply(this, [e, fn]);
				}
			}
		})(HTMLInputElement.prototype.attachEvent);
	}

	window.FormData = FormData = function() {
		return {
			append: function(key, val, name) {
				this.data.push({
					key: key,
					val: val,
					name: name
				});
			},
			data: [],
			__isShim: true
		};
	};

	(function () {
		//load FileAPI
		if (!window.FileAPI) {
			window.FileAPI = {};
		}
		if (FileAPI.forceLoad) {
			FileAPI.html5 = false;
		}
		
		if (!FileAPI.upload) {
			var jsUrl, basePath, script = document.createElement('script'), allScripts = document.getElementsByTagName('script'), i, index, src;
			if (window.FileAPI.jsUrl) {
				jsUrl = window.FileAPI.jsUrl;
			} else if (window.FileAPI.jsPath) {
				basePath = window.FileAPI.jsPath;
			} else {
				for (i = 0; i < allScripts.length; i++) {
					src = allScripts[i].src;
					index = src.indexOf('angular-file-upload-shim.js')
					if (index == -1) {
						index = src.indexOf('angular-file-upload-shim.min.js');
					}
					if (index > -1) {
						basePath = src.substring(0, index);
						break;
					}
				}
			}

			if (FileAPI.staticPath == null) FileAPI.staticPath = basePath;
			script.setAttribute('src', jsUrl || basePath + 'FileAPI.min.js');
			document.getElementsByTagName('head')[0].appendChild(script);
			FileAPI.hasFlash = hasFlash();
		}
	})();
	FileAPI.disableFileInput = function(elem, disable) {
		if (disable) {
			elem.removeClass('js-fileapi-wrapper')
		} else {
			elem.addClass('js-fileapi-wrapper');
		}
	}
}


if (!window.FileReader) {
	window.FileReader = function() {
		var _this = this, loadStarted = false;
		this.listeners = {};
		this.addEventListener = function(type, fn) {
			_this.listeners[type] = _this.listeners[type] || [];
			_this.listeners[type].push(fn);
		};
		this.removeEventListener = function(type, fn) {
			_this.listeners[type] && _this.listeners[type].splice(_this.listeners[type].indexOf(fn), 1);
		};
		this.dispatchEvent = function(evt) {
			var list = _this.listeners[evt.type];
			if (list) {
				for (var i = 0; i < list.length; i++) {
					list[i].call(_this, evt);
				}
			}
		};
		this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;

		var constructEvent = function(type, evt) {
			var e = {type: type, target: _this, loaded: evt.loaded, total: evt.total, error: evt.error};
			if (evt.result != null) e.target.result = evt.result;
			return e;
		};
		var listener = function(evt) {
			if (!loadStarted) {
				loadStarted = true;
				_this.onloadstart && this.onloadstart(constructEvent('loadstart', evt));
			}
			if (evt.type === 'load') {
				_this.onloadend && _this.onloadend(constructEvent('loadend', evt));
				var e = constructEvent('load', evt);
				_this.onload && _this.onload(e);
				_this.dispatchEvent(e);
			} else if (evt.type === 'progress') {
				var e = constructEvent('progress', evt);
				_this.onprogress && _this.onprogress(e);
				_this.dispatchEvent(e);
			} else {
				var e = constructEvent('error', evt);
				_this.onerror && _this.onerror(e);
				_this.dispatchEvent(e);
			}
		};
		this.readAsArrayBuffer = function(file) {
			FileAPI.readAsBinaryString(file, listener);
		}
		this.readAsBinaryString = function(file) {
			FileAPI.readAsBinaryString(file, listener);
		}
		this.readAsDataURL = function(file) {
			FileAPI.readAsDataURL(file, listener);
		}
		this.readAsText = function(file) {
			FileAPI.readAsText(file, listener);
		}
	}
}

})();

},{}],7:[function(require,module,exports){
/**!
 * AngularJS file upload/drop directive with http post and progress
 * @author  Danial  <danial.farid@gmail.com>
 * @version 1.6.12
 */
(function() {

var angularFileUpload = angular.module('angularFileUpload', []);

angularFileUpload.service('$upload', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
	function sendHttp(config) {
		config.method = config.method || 'POST';
		config.headers = config.headers || {};
		config.transformRequest = config.transformRequest || function(data, headersGetter) {
			if (window.ArrayBuffer && data instanceof window.ArrayBuffer) {
				return data;
			}
			return $http.defaults.transformRequest[0](data, headersGetter);
		};
		var deferred = $q.defer();

		if (window.XMLHttpRequest.__isShim) {
			config.headers['__setXHR_'] = function() {
				return function(xhr) {
					if (!xhr) return;
					config.__XHR = xhr;
					config.xhrFn && config.xhrFn(xhr);
					xhr.upload.addEventListener('progress', function(e) {
						deferred.notify(e);
					}, false);
					//fix for firefox not firing upload progress end, also IE8-9
					xhr.upload.addEventListener('load', function(e) {
						if (e.lengthComputable) {
							deferred.notify(e);
						}
					}, false);
				};
			};
		}

		$http(config).then(function(r){deferred.resolve(r)}, function(e){deferred.reject(e)}, function(n){deferred.notify(n)});
		
		var promise = deferred.promise;
		promise.success = function(fn) {
			promise.then(function(response) {
				fn(response.data, response.status, response.headers, config);
			});
			return promise;
		};

		promise.error = function(fn) {
			promise.then(null, function(response) {
				fn(response.data, response.status, response.headers, config);
			});
			return promise;
		};

		promise.progress = function(fn) {
			promise.then(null, null, function(update) {
				fn(update);
			});
			return promise;
		};
		promise.abort = function() {
			if (config.__XHR) {
				$timeout(function() {
					config.__XHR.abort();
				});
			}
			return promise;
		};
		promise.xhr = function(fn) {
			config.xhrFn = (function(origXhrFn) {
				return function() {
					origXhrFn && origXhrFn.apply(promise, arguments);
					fn.apply(promise, arguments);
				}
			})(config.xhrFn);
			return promise;
		};
		
		return promise;
	}

	this.upload = function(config) {
		config.headers = config.headers || {};
		config.headers['Content-Type'] = undefined;
		config.transformRequest = config.transformRequest || $http.defaults.transformRequest;
		var formData = new FormData();
		var origTransformRequest = config.transformRequest;
		var origData = config.data;
		config.transformRequest = function(formData, headerGetter) {
			if (origData) {
				if (config.formDataAppender) {
					for (var key in origData) {
						var val = origData[key];
						config.formDataAppender(formData, key, val);
					}
				} else {
					for (var key in origData) {
						var val = origData[key];
						if (typeof origTransformRequest == 'function') {
							val = origTransformRequest(val, headerGetter);
						} else {
							for (var i = 0; i < origTransformRequest.length; i++) {
								var transformFn = origTransformRequest[i];
								if (typeof transformFn == 'function') {
									val = transformFn(val, headerGetter);
								}
							}
						}
						formData.append(key, val);
					}
				}
			}

			if (config.file != null) {
				var fileFormName = config.fileFormDataName || 'file';

				if (Object.prototype.toString.call(config.file) === '[object Array]') {
					var isFileFormNameString = Object.prototype.toString.call(fileFormName) === '[object String]';
					for (var i = 0; i < config.file.length; i++) {
						formData.append(isFileFormNameString ? fileFormName : fileFormName[i], config.file[i], 
								(config.fileName && config.fileName[i]) || config.file[i].name);
					}
				} else {
					formData.append(fileFormName, config.file, config.fileName || config.file.name);
				}
			}
			return formData;
		};

		config.data = formData;

		return sendHttp(config);
	};

	this.http = function(config) {
		return sendHttp(config);
	}
}]);

angularFileUpload.directive('ngFileSelect', [ '$parse', '$timeout', function($parse, $timeout) {
	return function(scope, elem, attr) {
		var fn = $parse(attr['ngFileSelect']);
		if (elem[0].tagName.toLowerCase() !== 'input' || (elem.attr('type') && elem.attr('type').toLowerCase()) !== 'file') {
			var fileElem = angular.element('<input type="file">')
			var attrs = elem[0].attributes;
			for (var i = 0; i < attrs.length; i++) {
				if (attrs[i].name.toLowerCase() !== 'type') {
					fileElem.attr(attrs[i].name, attrs[i].value);
				}
			}
			if (attr["multiple"]) fileElem.attr("multiple", "true");
			fileElem.css("width", "1px").css("height", "1px").css("opacity", 0).css("position", "absolute").css('filter', 'alpha(opacity=0)')
					.css("padding", 0).css("margin", 0).css("overflow", "hidden");
			fileElem.attr('__wrapper_for_parent_', true);

//			fileElem.css("top", 0).css("bottom", 0).css("left", 0).css("right", 0).css("width", "100%").
//					css("opacity", 0).css("position", "absolute").css('filter', 'alpha(opacity=0)').css("padding", 0).css("margin", 0);
			elem.append(fileElem);
			elem[0].__file_click_fn_delegate_  = function() {
				fileElem[0].click();
			}; 
			elem.bind('click', elem[0].__file_click_fn_delegate_);
			elem.css("overflow", "hidden");
//			if (fileElem.parent()[0] != elem[0]) {
//				//fix #298 button element
//				elem.wrap('<span>');
//				elem.css("z-index", "-1000")
//				elem.parent().append(fileElem);
//				elem = elem.parent();
//			}
//			if (elem.css("position") === '' || elem.css("position") === 'static') {
//				elem.css("position", "relative");
//			}
			elem = fileElem;
		}
		elem.bind('change', function(evt) {
			var files = [], fileList, i;
			fileList = evt.__files_ || evt.target.files;
			if (fileList != null) {
				for (i = 0; i < fileList.length; i++) {
					files.push(fileList.item(i));
				}
			}
			$timeout(function() {
				fn(scope, {
					$files : files,
					$event : evt
				});
			});
		});
		// removed this since it was confusing if the user click on browse and then cancel #181
//		elem.bind('click', function(){
//			this.value = null;
//		});

		// removed because of #253 bug
		// touch screens
//		if (('ontouchstart' in window) ||
//				(navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
//			elem.bind('touchend', function(e) {
//				e.preventDefault();
//				e.target.click();
//			});
//		}
	};
} ]);

angularFileUpload.directive('ngFileDropAvailable', [ '$parse', '$timeout', function($parse, $timeout) {
	return function(scope, elem, attr) {
		if ('draggable' in document.createElement('span')) {
			var fn = $parse(attr['ngFileDropAvailable']);
			$timeout(function() {
				fn(scope);
			});
		}
	};
} ]);

angularFileUpload.directive('ngFileDrop', [ '$parse', '$timeout', '$location', function($parse, $timeout, $location) {
	return function(scope, elem, attr) {
		if ('draggable' in document.createElement('span')) {
			var leaveTimeout = null;
			elem[0].addEventListener("dragover", function(evt) {
				evt.preventDefault();
				$timeout.cancel(leaveTimeout);
				if (!elem[0].__drag_over_class_) {
					if (attr['ngFileDragOverClass'] && attr['ngFileDragOverClass'].search(/\) *$/) > -1) {
						var dragOverClass = $parse(attr['ngFileDragOverClass'])(scope, {
							$event : evt
						});					
						elem[0].__drag_over_class_ = dragOverClass; 
					} else {
						elem[0].__drag_over_class_ = attr['ngFileDragOverClass'] || "dragover";
					}
				}
				elem.addClass(elem[0].__drag_over_class_);
			}, false);
			elem[0].addEventListener("dragenter", function(evt) {
				evt.preventDefault();
			}, false);
			elem[0].addEventListener("dragleave", function(evt) {
				leaveTimeout = $timeout(function() {
					elem.removeClass(elem[0].__drag_over_class_);
					elem[0].__drag_over_class_ = null;
				}, attr['ngFileDragOverDelay'] || 1);
			}, false);
			var fn = $parse(attr['ngFileDrop']);
			elem[0].addEventListener("drop", function(evt) {
				evt.preventDefault();
				elem.removeClass(elem[0].__drag_over_class_);
				elem[0].__drag_over_class_ = null;
				extractFiles(evt, function(files) {
					fn(scope, {
						$files : files,
						$event : evt
					});					
				});
			}, false);
						
			function isASCII(str) {
				return /^[\000-\177]*$/.test(str);
			}

			function extractFiles(evt, callback) {
				var files = [], items = evt.dataTransfer.items;
				if (items && items.length > 0 && items[0].webkitGetAsEntry && $location.protocol() != 'file' && 
						items[0].webkitGetAsEntry().isDirectory) {
					for (var i = 0; i < items.length; i++) {
						var entry = items[i].webkitGetAsEntry();
						if (entry != null) {
							//fix for chrome bug https://code.google.com/p/chromium/issues/detail?id=149735
							if (isASCII(entry.name)) {
								traverseFileTree(files, entry);
							} else if (!items[i].webkitGetAsEntry().isDirectory) {
								files.push(items[i].getAsFile());
							}
						}
					}
				} else {
					var fileList = evt.dataTransfer.files;
					if (fileList != null) {
						for (var i = 0; i < fileList.length; i++) {
							files.push(fileList.item(i));
						}
					}
				}
				(function waitForProcess(delay) {
					$timeout(function() {
						if (!processing) {
							callback(files);
						} else {
							waitForProcess(10);
						}
					}, delay || 0)
				})();
			}
			
			var processing = 0;
			function traverseFileTree(files, entry, path) {
				if (entry != null) {
					if (entry.isDirectory) {
						var dirReader = entry.createReader();
						processing++;
						dirReader.readEntries(function(entries) {
							for (var i = 0; i < entries.length; i++) {
								traverseFileTree(files, entries[i], (path ? path : "") + entry.name + "/");
							}
							processing--;
						});
					} else {
						processing++;
						entry.file(function(file) {
							processing--;
							file._relativePath = (path ? path : "") + file.name;
							files.push(file);
						});
					}
				}
			}
		}
	};
} ]);

})();

},{}],8:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('ComponentDetailsController', function ($scope, componentService) {
        'use strict';
        var context = {},
            properties = {},
            connectors = {},
            ports = {};

        console.log('ComponentDetailsController');
        $scope.init = function (connectionId) {
            $scope.connectionId = connectionId;
            if ($scope.connectionId && angular.isString($scope.connectionId)) {
                context = {
                    db: $scope.connectionId,
                    regionId: 'ComponentDetails_' + (new Date()).toISOString()
                };
                $scope.$on('$destroy', function () {
                    console.log('Destroying :', context.regionId);
                    componentService.cleanUpAllRegions(context);
                });
            } else {
                throw new Error('connectionId must be defined and it must be a string');
            }
            $scope.details = {
                properties: properties,
                connectors: connectors,
                ports: ports
            };

            componentService.registerWatcher(context, function (destroy) {
                $scope.details = {
                    properties: {},
                    connectors: {},
                    ports: {}
                };
                if (destroy) {
                    //TODO: notify user
                    return;
                }
                console.info('ComponentDetailsController - initialize event raised');

                componentService.watchInterfaces(context, $scope.componentId, function (updateObject) {
                    // Since watchInterfaces keeps the data up-to-date there shouldn't be a need to do any
                    // updates here..
                    console.log('watchInterfaces', updateObject);
                })
                    .then(function (componentInterfaces) {
                        $scope.details.properties = componentInterfaces.properties;
                        $scope.details.connectors = componentInterfaces.connectors;
                        $scope.details.ports = componentInterfaces.ports;
                    });
            });
        };
    })
    .directive('componentDetails', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                componentId: '=componentId'
            },
            require: '^componentList',
            link: function (scope, elem, attr, componetListController) {
                var connectionId = componetListController.getConnectionId();
                scope.init(connectionId);
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/InterfaceDetails.html',
            controller: 'ComponentDetailsController'
        };
    });
},{}],9:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('ComponentListController', function ($scope, $window, $modal, growl, componentService, fileService) {
        'use strict';
        var self = this,
            items = [],             // Items that are passed to the item-list ui-component.
            componentItems = {},    // Same items are stored in a dictionary.
            serviceData2ListItem,
            addDomainWatcher,
            config,
            context;

        console.log('ComponentListController', $scope.avmIds);
        this.getConnectionId = function () {
            return $scope.connectionId;
        };
        // Check for valid connectionId and register clean-up on destroy event.
        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'ComponentListController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                componentService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }

        // Configuration for the item list ui component.
        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function (jQEvent, ui) {
                console.log('Sort happened', jQEvent, ui);
            },

            itemClick: function (event, item) {
                $scope.$emit('selectedInstances', {name: item.title, ids: item.data.instanceIds});
            },

            itemContextmenuRenderer: function (e, item) {
                return [
                    {
                        items: [
                            {
                                id: 'openInEditor',
                                label: 'Open in Editor',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-edit',
                                action: function () {
                                    $window.open('/?project=ADMEditor&activeObject=' + item.id, '_blank');
                                }
                            },
                            {
                                id: 'editComponent',
                                label: 'Edit',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-pencil',
                                actionData: {description: item.description, id: item.id},
                                action: function (data) {
                                    var editContext = {
                                            db: context.db,
                                            regionId: context.regionId + '_watchComponents'
                                        },
                                        modalInstance = $modal.open({
                                            templateUrl: '/cyphy-components/templates/ComponentEdit.html',
                                            controller: 'ComponentEditController',
                                            //size: size,
                                            resolve: { data: function () {
                                                return data;
                                            } }
                                        });

                                    modalInstance.result.then(function (editedData) {
                                        var attrs = {
                                            'INFO': editedData.description
                                        };
                                        componentService.setComponentAttributes(editContext, data.id, attrs)
                                            .then(function () {
                                                console.log('Attribute updated');
                                            });
                                    }, function () {
                                        console.log('Modal dismissed at: ' + new Date());
                                    });
                                }
                            },
                            {
                                id: 'exportAsAcm',
                                label: 'Export ACM',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-share-alt',
                                actionData: {resource: item.data.resource, name: item.title},
                                action: function (data) {
                                    var hash = data.resource,
                                        url = fileService.getDownloadUrl(hash);
                                    if (url) {
                                        growl.success('ACM file for <a href="' + url + '">' + data.name + '</a> exported.');
                                    } else {
                                        growl.warning(data.name + ' does not have a resource.');
                                    }
                                }
                            }
                        ]
                    },
                    {
                        items: [
                            {
                                id: 'delete',
                                label: 'Delete',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-remove',
                                actionData: { id: item.id, name: item.title },
                                action: function (data) {
                                    var modalInstance = $modal.open({
                                        templateUrl: '/cyphy-components/templates/SimpleModal.html',
                                        controller: 'SimpleModalController',
                                        resolve: {
                                            data: function () {
                                                return {
                                                    title: 'Delete Component',
                                                    details: 'This will delete ' + data.name +
                                                        ' from the workspace.'
                                                };
                                            }
                                        }
                                    });

                                    modalInstance.result.then(function () {
                                        componentService.deleteComponent(context, data.id);
                                    }, function () {
                                        console.log('Modal dismissed at: ' + new Date());
                                    });
                                }
                            }
                        ]
                    }
                ];
            },

            detailsRenderer: function (item) {
                //                item.details = 'My details are here now!';
            },

            filter: {
            }

        };

        $scope.config = config;
        $scope.listData = {
            items: items
        };

        // Transform the raw service node data to items for the list.
        serviceData2ListItem = function (data) {
            var listItem;

            if (componentItems.hasOwnProperty(data.id)) {
                listItem = componentItems[data.id];
                listItem.title = data.name;
                listItem.description = data.description;
                listItem.data.resource = data.resource;
            } else {
                listItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: $scope.avmIds ? 'Highlight instances' : '',
                    description: data.description,
                    lastUpdated: {
                        time: 'N/A',   // TODO: get this in the future.
                        user: 'N/A'    // TODO: get this in the future.
                    },
                    stats: [ ],
                    details: 'Content',
                    detailsTemplateUrl: 'componentDetails.html',
                    data: { resource: data.resource }
                };
                if ($scope.avmIds) {
                    listItem.data.instanceIds = $scope.avmIds[data.avmId];
                }
                // Add the list-item to the items list and the dictionary.
                items.push(listItem);
                componentItems[listItem.id] = listItem;
            }
        };

        addDomainWatcher = function (componentId) {
            var domainModelsToStat = function (domainModels) {
                var stats = [],
                    labelMap = {
                        CAD: { value: 0, toolTip: 'CAD', iconClass: 'fa fa-codepen' },
                        Cyber: { value: 0, toolTip: 'Cyber', iconClass: 'fa fa-laptop' },
                        Manufacturing: { value: 0, toolTip: 'Manufacturing', iconClass: 'fa fa-wrench' },
                        Modelica: { value: 0, toolTip: 'Modelica', iconClass: 'fa fa-gears' }
                    },
                    key;
                for (key in domainModels) {
                    if (domainModels.hasOwnProperty(key)) {
                        if (labelMap[domainModels[key].type]) {
                            labelMap[domainModels[key].type].value += 1;
                        } else {
                            console.error('Unexpected domain-model type', domainModels[key].type);
                        }
                    }
                }
                for (key in labelMap) {
                    if (labelMap.hasOwnProperty(key)) {
                        if (labelMap[key].value > 0) {
                            stats.push(labelMap[key]);
                        }
                    }
                }
                return stats;
            };

            componentService.watchComponentDomains(context, componentId, function (updateData) {
                var listItem = componentItems[componentId];
                console.log('DomainModels updated, event type:', updateData.type);
                if (listItem) {
                    listItem.stats = domainModelsToStat(updateData.domainModels);
                } else {
                    console.warn('DomainModel data did not have matching componentData', componentId);
                }
            })
                .then(function (data) {
                    var listItem = componentItems[componentId];
                    if (listItem) {
                        listItem.stats = domainModelsToStat(data.domainModels);
                    } else {
                        console.warn('DomainModel data did not have matching componentData', componentId);
                    }
                });
        };

        componentService.registerWatcher(context, function (destroyed) {
            items = [];
            $scope.listData.items = items;
            componentItems = {};

            if (destroyed) {
                console.warn('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info('initialize event raised');

            componentService.watchComponents(context, $scope.workspaceId, $scope.avmIds, function (updateObject) {
                var index;
                //console.warn(updateObject);
                if (updateObject.type === 'load') {
                    serviceData2ListItem(updateObject.data);
                    addDomainWatcher(updateObject.id);
                } else if (updateObject.type === 'update') {
                    serviceData2ListItem(updateObject.data);
                    //$scope.$apply();
                } else if (updateObject.type === 'unload') {
                    if (componentItems.hasOwnProperty(updateObject.id)) {
                        index = items.map(function (e) {
                            return e.id;
                        }).indexOf(updateObject.id);
                        if (index > -1) {
                            items.splice(index, 1);
                        }
                        componentService.cleanUpRegion(context, context.regionId + '_watchComponentDomains_' + updateObject.id);
                        delete componentItems[updateObject.id];
                    }
                    //$scope.$apply();
                } else {
                    throw new Error(updateObject);
                }
            })
                .then(function (data) {
                    var componentId;
                    for (componentId in data.components) {
                        if (data.components.hasOwnProperty(componentId)) {
                            serviceData2ListItem(data.components[componentId]);
                            addDomainWatcher(componentId);
                        }
                    }
                });
        });
    })
    .controller('ComponentEditController', function ($scope, $modalInstance, data) {
        'use strict';
        $scope.data = {
            description: data.description
        };

        $scope.ok = function () {
            $modalInstance.close($scope.data);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .directive('componentList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId',
                connectionId: '=connectionId',
                avmIds: '=avmIds'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/ComponentList.html',
            controller: 'ComponentListController'
        };
    });

},{}],10:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('ConfigurationSetSelectorController', function ($scope, growl, designService) {
        'use strict';
        var context,
            spawnedConfigurationRegions = [];
        $scope.dataModel = {
            dataAvaliable: false,
            configurationSets: {}
        };

        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'ConfigurationSetSelectorController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                designService.cleanUpAllRegions(context);
                //console.log('$destroyed ' + context.regionId);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }

        designService.registerWatcher(context, function (destroyed) {
            $scope.dataModel.dataAvaliable = false;
            $scope.dataModel.configurationSets = {};

            if (destroyed) {
                console.warn('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }

            designService.watchConfigurationSets(context, $scope.designId, function (updateObject) {
                $scope.dataModel.dataAvaliable = Object.keys(updateObject.data.configurationSets).length > 0;
            })
                .then(function (data) {
                    $scope.dataModel.configurationSets = data.configurationSets;
                    $scope.dataModel.dataAvaliable = Object.keys(data.configurationSets).length > 0;
                });
        });

        $scope.loadConfigurations = function (setId, setName) {
            var i;

            for (i = 0; i < spawnedConfigurationRegions.length; i += 1) {
                designService.cleanUpRegion(context, spawnedConfigurationRegions[i]);
            }
            spawnedConfigurationRegions = [];
            designService.watchConfigurations(context, setId, function (updateObject) {
                console.warn(updateObject);
            })
                .then(function (data) {
                    var key,
                        config,
                        configurations = [];
                    spawnedConfigurationRegions.push(data.regionId);
                    for (key in data.configurations) {
                        if (data.configurations.hasOwnProperty(key)) {
                            config = data.configurations[key];
                            try {
                                configurations.push({
                                    id: config.id,
                                    name: config.name,
                                    alternativeAssignments: JSON.parse(config.alternativeAssignments)
                                });
                            } catch (error) {
                                growl.error('Configuration ' + config.name + ' had invalid attribute.');
                                console.error('Could not parse', config.alternativeAssignments, error);
                            }
                        }
                    }
                    $scope.$emit('configurationsLoaded', {configurations: configurations, setName: setName});
                });
        };
    })
    .directive('configurationSetSelector', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                designId: '=designId',
                connectionId: '=connectionId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/ConfigurationSetSelector.html',
            controller: 'ConfigurationSetSelectorController'
        };
    });

},{}],11:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('ConfigurationTableController', function ($scope, growl) {
        'use strict';
        $scope.dataModel = {
            changeInfo: [],
            selected: [],
            configurations: $scope.configurations,
            setName: $scope.setName
        };

        $scope.tableColumnDefinition = [
            {
                columnHeaderDisplayName: 'Name',
                templateUrl: 'tableCell.html',
                sortKey: 'name'
            }
        ];

        $scope.$on('exposeSelection', function (event, type) {
            $scope.$emit('selectionExposed', $scope.dataModel.selected, type);
        });

        $scope.cfgClicked = function (cfg) {
            $scope.$emit('configurationClicked', cfg);
        };
    })
    .directive('configurationTable', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                configurations: '=configurations',
                setName: '=setName'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/ConfigurationTable.html',
            controller: 'ConfigurationTableController'
        };
    });

},{}],12:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('DesignDetailsController', function ($scope, designService) {
        'use strict';
        var context = {},
            properties = {},
            connectors = {},
            ports = {};

        console.log('DesignDetailsController');
        $scope.init = function (connectionId) {
            $scope.connectionId = connectionId;
            if ($scope.connectionId && angular.isString($scope.connectionId)) {
                context = {
                    db: $scope.connectionId,
                    regionId: 'DesignDetails_' + (new Date()).toISOString()
                };
                $scope.$on('$destroy', function () {
                    console.log('Destroying :', context.regionId);
                    designService.cleanUpAllRegions(context);
                });
            } else {
                throw new Error('connectionId must be defined and it must be a string');
            }
            $scope.details = {
                properties: properties,
                connectors: connectors,
                ports: ports
            };

            designService.registerWatcher(context, function (destroy) {
                $scope.details = {
                    properties: {},
                    connectors: {},
                    ports: {}
                };
                if (destroy) {
                    //TODO: notify user
                    return;
                }
                console.info('DesignDetailsController - initialize event raised');

                designService.watchInterfaces(context, $scope.designId, function (updateObject) {
                    // Since watchInterfaces keeps the data up-to-date there shouldn't be a need to do any
                    // updates here..
                    console.log('watchInterfaces', updateObject);
                })
                    .then(function (designInterfaces) {
                        $scope.details.properties = designInterfaces.properties;
                        $scope.details.connectors = designInterfaces.connectors;
                        $scope.details.ports = designInterfaces.ports;
                    });
            });
        };
    })
    .directive('designDetails', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                designId: '=designId'
            },
            require: '^designList',
            link: function (scope, elem, attr, designListController) {
                var connectionId = designListController.getConnectionId();
                scope.init(connectionId);
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/InterfaceDetails.html',
            controller: 'DesignDetailsController'
        };
    });
},{}],13:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('DesignListController', function ($scope, $window, $location, $modal, designService, growl) {
        'use strict';
        var self = this,
            items = [],             // Items that are passed to the item-list ui-component.
            designItems = {},       // Same items are stored in a dictionary.
            serviceData2ListItem,
            config,
            addConfigurationWatcher,
            context,
            itemClickFn,
            itemClickTip;

        console.log('DesignListController');
        this.getConnectionId = function () {
            return $scope.connectionId;
        };
        // Check for valid connectionId and register clean-up on destroy event.
        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'DesignListController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                designService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }


        // Configuration for the item list ui component.
        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function (jQEvent, ui) {
                //console.log('Sort happened', jQEvent, ui);
            },

            itemClick: function (event, item) {
                var newUrl = '/designSpace/' + $scope.workspaceId.replace(/\//g, '-') + '/' + item.id.replace(/\//g, '-');
                $location.path(newUrl);
            },

            itemContextmenuRenderer: function (e, item) {
                return [
                    {
                        items: [
                            {
                                id: 'openInEditor',
                                label: 'Open in Editor',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-edit',
                                action: function () {
                                    $window.open('/?project=ADMEditor&activeObject=' + item.id, '_blank');
                                }
                            },
                            {
                                id: 'editDesign',
                                label: 'Edit Attributes',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-pencil',
                                actionData: {
                                    id: item.id,
                                    description: item.description,
                                    name: item.title,
                                    context: {
                                        db: context.db,
                                        regionId: context.regionId + '_watchDesigns'
                                    }
                                },
                                action: designService.editDesignFn
                            },
                            {
                                id: 'setAsTopLevelSystemUnderTest',
                                label: 'Set as TLSUT',
                                disabled: !$scope.usedByTestBench,
                                iconClass: 'fa fa-arrow-circle-right',
                                actionData: {id: item.id, name: item.title},
                                action: function (data) {
                                    var oldTlsut = designItems[$scope.state.tlsutId];
                                    $scope.state.tlsutId = data.id;
                                    $scope.$emit('topLevelSystemUnderTestSet', item, oldTlsut);
                                }
                            },
                            {
                                id: 'exportAsAdm',
                                label: 'Export ADM',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-share-alt',
                                actionData: {
                                    id: item.id,
                                    name: item.title,
                                    context: context
                                },
                                action: designService.exportAsAdmFn
                            }
                        ]
                    },
                    {
                        items: [
                            {
                                id: 'delete',
                                label: 'Delete',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-remove',
                                actionData: {
                                    id: item.id,
                                    name: item.title,
                                    context: context
                                },
                                action: designService.deleteFn
                            }
                        ]
                    }
                ];
            },

            detailsRenderer: function (item) {
                //                item.details = 'My details are here now!';
            },

            filter: {
            }

        };

        $scope.config = config;
        $scope.listData = {
            items: items
        };

        $scope.state = {
            tlsutId: null
        };

        $scope.$on('topLevelSystemUnderTestChanged', function (event, id) {
            if ($scope.state.tlsutId && designItems.hasOwnProperty($scope.state.tlsutId)) {
                designItems[$scope.state.tlsutId].cssClass = '';
            }
            $scope.state.tlsutId = id;
            if (designItems.hasOwnProperty(id)) {
                designItems[id].cssClass = 'top-level-system-under-test';
            }
        });

        // Transform the raw service node data to items for the list.
        serviceData2ListItem = function (data) {
            var listItem;

            if (designItems.hasOwnProperty(data.id)) {
                listItem = designItems[data.id];
                listItem.title = data.name;
                listItem.description = data.description;
            } else {
                listItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: 'Open Design Space View',
                    cssClass: $scope.state.tlsutId === data.id ? 'top-level-system-under-test' : '',
                    description: data.description,
                    lastUpdated: {
                        time: 'N/A',   // TODO: get this in the future.
                        user: 'N/A'    // TODO: get this in the future.
                    },
                    stats: [
                        {
                            value: 0,
                            toolTip: 'Configuration Sets',
                            iconClass: 'glyphicon glyphicon-th-large'
                        },
                        {
                            value: 0,
                            toolTip: 'Configurations',
                            iconClass: 'glyphicon glyphicon-th'
                        },
                        {
                            value: 0,
                            toolTip: 'Results',
                            iconClass: 'glyphicon glyphicon-stats'
                        }
                    ],
                    details    : 'Content',
                    detailsTemplateUrl: 'designDetails.html'
                };
                // Add the list-item to the items list and the dictionary.
                items.push(listItem);
                designItems[listItem.id] = listItem;
            }
        };

        addConfigurationWatcher = function (designId) {
            designService.watchNbrOfConfigurations(context, designId, function (updateObject) {
                var listItem = designItems[designId];
                //console.log(updateObject);
                listItem.stats[0].value = updateObject.data.counters.sets;
                listItem.stats[1].value = updateObject.data.counters.configurations;
                listItem.stats[2].value = updateObject.data.counters.results;
            }).then(function (data) {
                var listItem = designItems[designId];
                listItem.stats[0].value = data.counters.sets;
                listItem.stats[1].value = data.counters.configurations;
                listItem.stats[2].value = data.counters.results;
            });
        };

        designService.registerWatcher(context, function (destroyed) {
            items = [];
            $scope.listData.items = items;
            designItems = {};

            if (destroyed) {
                console.warn('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info('initialize event raised');

            designService.watchDesigns(context, $scope.workspaceId, function (updateObject) {
                var index;
                //console.warn(updateObject);
                if (updateObject.type === 'load') {
                    serviceData2ListItem(updateObject.data);
                    addConfigurationWatcher(updateObject.id);
                } else if (updateObject.type === 'update') {
                    serviceData2ListItem(updateObject.data);
                } else if (updateObject.type === 'unload') {
                    if (designItems.hasOwnProperty(updateObject.id)) {
                        index = items.map(function (e) {
                            return e.id;
                        }).indexOf(updateObject.id);
                        if (index > -1) {
                            items.splice(index, 1);
                        }
                        designService.cleanUpRegion(context, context.regionId + '_watchNbrOfConfigurations_' + updateObject.id);
                        delete designItems[updateObject.id];
                    }
                } else {
                    throw new Error(updateObject);
                }
            })
                .then(function (data) {
                    var designId;
                    for (designId in data.designs) {
                        if (data.designs.hasOwnProperty(designId)) {
                            serviceData2ListItem(data.designs[designId]);
                            addConfigurationWatcher(designId);
                        }
                    }
                });
        });
    })
    .controller('DesignEditController', function ($scope, $modalInstance, data) {
        'use strict';
        $scope.data = {
            description: data.description,
            name: data.name
        };

        $scope.ok = function () {
            $modalInstance.close($scope.data);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .directive('designList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId',
                connectionId: '=connectionId',
                usedByTestBench: '=usedByTestBench'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/DesignList.html',
            controller: 'DesignListController'
        };
    });

},{}],14:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('DesignTreeController', function ($scope, $window, designService, desertService) {
        'use strict';
        var context,
            config,
            treeData,
            rootNode,
            avmIds = {},
            buildTreeStructure;

        console.log('DesignTreeController');

        // Check for valid connectionId and register clean-up on destroy event.
        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'DesignTreeController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                designService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }

        config = {
            nodeContextmenuRenderer: function (e, node) {
                return [{
                    items: [{
                        id: 'create',
                        label: 'Open in Editor',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-edit',
                        actionData: {id: node.id},
                        action: function (data) {
                            $window.open('/?project=ADMEditor&activeObject=' + data.id, '_blank');
                        }
                    }]
                }];
            },
            nodeClick: function ( e, node ) {
                console.log( 'Node was clicked:', node, $scope );
            },
            disableManualSelection: true,
            folderIconClass: 'fa fa-cubes'
//            nodeDblclick: function ( e, node ) {
//                console.log( 'Node was double-clicked:', node );
//            },
//            nodeExpanderClick: function ( e, node, isExpand ) {
//                console.log( 'Expander was clicked for node:', node, isExpand );
//            }

        };

        rootNode = {
            id: $scope.designId,
            label: 'Loading Design Space Nodes..',
            extraInfo: '',
            children: [],
            childrenCount: 0
        };

        treeData = {
            id: '',
            label: '',
            extraInfo: '',
            unCollapsible: true,
            children: [
                rootNode
            ],
            childrenCount: 1
        };
        $scope.config = config;
        $scope.treeData = treeData;
        $scope.$on('setSelectedNodes', function (event, data) {
            $scope.config.state.selectedNodes = data;
        });

        buildTreeStructure = function (container, parentTreeNode) {
            var key,
                childData,
                treeNode;
            if (parentTreeNode) {
                treeNode = {
                    id: null,
                    label: null,
                    extraInfo: null,
                    children: [],
                    childrenCount: 0
                };
                parentTreeNode.children.push(treeNode);
                parentTreeNode.childrenCount += 1;
            } else {
                treeNode = rootNode;
            }
            treeNode.id = container.id;
            treeNode.label = container.name;
            treeNode.extraInfo = container.type;
            $scope.config.state.expandedNodes.push(treeNode.id);
            for (key in container.components) {
                if (container.components.hasOwnProperty(key)) {
                    childData = container.components[key];
                    treeNode.children.push({
                        id: childData.id,
                        label: childData.name
                    });
                    treeNode.childrenCount += 1;
                    if (avmIds[childData.avmId]) {
                        avmIds[childData.avmId].push(childData.id);
                    } else {
                        avmIds[childData.avmId] = [childData.id];
                    }
                }
            }
            for (key in container.subContainers) {
                if (container.subContainers.hasOwnProperty(key)) {
                    childData = container.subContainers[key];
                    buildTreeStructure(childData, treeNode);
                }
            }
        };

        designService.registerWatcher(context, function (destroyed) {
            if (destroyed) {
                console.warn('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info('initialize event raised');

            designService.watchDesignStructure(context, $scope.designId, function (updateObject) {
                console.warn(updateObject);
            })
                .then(function (data) {
                    var rootContainer = data.containers[data.rootId],
                        desertInputData;
                    buildTreeStructure(rootContainer);
                    $scope.$emit('designTreeLoaded', avmIds);
                    // FIXME: This part is only here to reuse the data from watchDesignStructure.
                    // TODO: Find a more suitable location.
                    desertInputData = desertService.getDesertInputData(data);
                    $scope.$emit('desertInputReady', desertInputData);
                });
        });
    })
    .directive('designTree', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                designId: '=designId',
                connectionId: '=connectionId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/DesignTree.html',
            controller: 'DesignTreeController'
        };
    });

},{}],15:[function(require,module,exports){
/*globals angular*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('SimpleModalController', function ($scope, $modalInstance, data) {
        'use strict';
        $scope.data = {
            title: data.title,
            details: data.details
        };

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

},{}],16:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('TestBenchDetailsController', function ($scope, testBenchService) {
        'use strict';
        var context = {},
            properties = {},
            connectors = {},
            ports = {},
            watchInterfaces;

        console.log('TestBenchDetailsController');
        $scope.init = function (connectionId) {
            $scope.connectionId = connectionId;
            if ($scope.connectionId && angular.isString($scope.connectionId)) {
                context = {
                    db: $scope.connectionId,
                    regionId: 'TestBenchDetails_' + (new Date()).toISOString()
                };
                $scope.$on('$destroy', function () {
                    console.log('Destroying :', context.regionId);
                    testBenchService.cleanUpAllRegions(context);
                });
            } else {
                throw new Error('connectionId must be defined and it must be a string');
            }
            $scope.details = {
                properties: properties,
                connectors: connectors,
                ports: ports
            };
            watchInterfaces = function (containerId) {
                testBenchService.watchInterfaces(context, containerId, function (updateObject) {
                    // Since watchInterfaces keeps the data up-to-date there shouldn't be a need to do any
                    // updates here..
                    console.log('watchInterfaces', updateObject);
                })
                    .then(function (containerInterfaces) {
                        $scope.details.properties = containerInterfaces.properties;
                        $scope.details.connectors = containerInterfaces.connectors;
                        $scope.details.ports = containerInterfaces.ports;
                    });
            };

            testBenchService.registerWatcher(context, function (destroy) {
                $scope.details = {
                    properties: {},
                    connectors: {},
                    ports: {}
                };
                if (destroy) {
                    //TODO: notify user
                    return;
                }
                console.info('TestBenchDetailsController - initialize event raised');
                testBenchService.watchTestBenchDetails(context, $scope.testBenchId, function (updatedObj) {
                    console.warn('watchTestBenchDetails updates', updatedObj);
                })
                    .then(function (data) {
                        if (data.containerIds.length === 0) {
                            console.warn('No container defined!');
                        } else if (data.containerIds.length === 1) {
                            watchInterfaces(data.containerIds[0]);
                        } else {
                            console.error('More than one container defined!');
                        }
                    });
            });
        };
    })
    .directive('testBenchDetails', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                testBenchId: '=testBenchId'
            },
            require: '^testBenchList',
            link: function (scope, elem, attr, testBenchListController) {
                var connectionId = testBenchListController.getConnectionId();
                scope.init(connectionId);
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/InterfaceDetails.html',
            controller: 'TestBenchDetailsController'
        };
    });
},{}],17:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('TestBenchListController', function ($scope, $window, $location, $modal, growl, testBenchService) {
        'use strict';
        var self = this,
            items = [],             // Items that are passed to the item-list ui-component.
            testBenchItems = {},    // Same items are stored in a dictionary.
            serviceData2ListItem,
            config,
            context;

        console.log('TestBenchListController');

        this.getConnectionId = function () {
            return $scope.connectionId;
        };

        // Check for valid connectionId and register clean-up on destroy event.
        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'TestBenchListController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                testBenchService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }

        // Configuration for the item list ui component.
        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function (jQEvent, ui) {
                console.log('Sort happened', jQEvent, ui);
            },

            itemClick: function (event, item) {
                var newUrl = '/testBench/' + $scope.workspaceId.replace(/\//g, '-') + '/' + item.id.replace(/\//g, '-');
                console.log(newUrl);
                $location.path(newUrl);
            },

            itemContextmenuRenderer: function (e, item) {
                return [
                    {
                        items: [
                            {
                                id: 'openInEditor',
                                label: 'Open in Editor',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-edit',
                                action: function () {
                                    $window.open('/?project=ADMEditor&activeObject=' + item.id, '_blank');
                                }
                            },
                            {
                                id: 'editTestBench',
                                label: 'Edit',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-pencil',
                                actionData: {
                                    id: item.id,
                                    description: item.description,
                                    name: item.title,
                                    files: item.data.files,
                                    path: item.data.path,
                                    editContext: {
                                        db: context.db,
                                        regionId: context.regionId + '_watchTestBenches'
                                    },
                                    testBench: item
                                },
                                action: testBenchService.editTestBenchFn
                            }
                        ]
                    },
                    {
                        items: [
                            {
                                id: 'delete',
                                label: 'Delete',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-remove',
                                actionData: {
                                    id: item.id,
                                    name: item.title,
                                    context: context
                                },
                                action: testBenchService.deleteFn
                            }
                        ]
                    }
                ];
            },

            detailsRenderer: function (item) {
                //                item.details = 'My details are here now!';
            },

            filter: {
            }

        };

        $scope.config = config;
        $scope.listData = {
            items: items
        };

        // Transform the raw service node data to items for the list.
        serviceData2ListItem = function (data) {
            var listItem;

            if (testBenchItems.hasOwnProperty(data.id)) {
                listItem = testBenchItems[data.id];
                listItem.title = data.name;
                listItem.description = data.description;
                listItem.data.files = data.files;
                listItem.data.path = data.path;
                listItem.data.results = data.results;
            } else {
                listItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: 'Open Test-Bench View',
                    description: data.description,
                    lastUpdated: {
                        time: 'N/A',   // TODO: get this in the future.
                        user: 'N/A'    // TODO: get this in the future.
                    },
                    stats: [ ],
                    details    : 'Content',
                    detailsTemplateUrl: 'testBenchDetails.html',
                    data: {
                        files: data.files,
                        path: data.path,
                        results: data.results
                    }
                };
                // Add the list-item to the items list and the dictionary.
                items.push(listItem);
                testBenchItems[listItem.id] = listItem;
            }
        };

        testBenchService.registerWatcher(context, function (destroyed) {
            items = [];
            $scope.listData.items = items;
            testBenchItems = {};

            if (destroyed) {
                console.warn('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info('initialize event raised');

            testBenchService.watchTestBenches(context, $scope.workspaceId, function (updateObject) {
                var index;
                //console.warn(updateObject);
                if (updateObject.type === 'load') {
                    serviceData2ListItem(updateObject.data);
                } else if (updateObject.type === 'update') {
                    serviceData2ListItem(updateObject.data);
                } else if (updateObject.type === 'unload') {
                    if (testBenchItems.hasOwnProperty(updateObject.id)) {
                        index = items.map(function (e) {
                            return e.id;
                        }).indexOf(updateObject.id);
                        if (index > -1) {
                            items.splice(index, 1);
                        }
                        delete testBenchItems[updateObject.id];
                    }
                } else {
                    throw new Error(updateObject);
                }
            })
                .then(function (data) {
                    var testBenchId;
                    for (testBenchId in data.testBenches) {
                        if (data.testBenches.hasOwnProperty(testBenchId)) {
                            serviceData2ListItem(data.testBenches[testBenchId]);
                        }
                    }
                });
        });
    })
    .controller('TestBenchEditController', function ($scope, $modalInstance, growl, data, fileService) {
        'use strict';
        var fileInfo;
        $scope.data = {
            description: data.description,
            name: data.name,
            fileInfo: {
                hash: data.files,
                name: null,
                url: fileService.getDownloadUrl(data.files)
            },
            path: data.path
        };
        fileInfo = $scope.data.fileInfo;
        if (fileInfo.hash) {
            fileService.getMetadata(fileInfo.hash)
                .then(function (metadata) {
                    fileInfo.name = metadata.name;
                })
                .catch(function (err) {
                    console.error('Could not get meta-data for hash', fileInfo.hash);
                });
        }

        $scope.dragOverClass = function ($event) {
            var draggedItems = $event.dataTransfer.items,
                hasFile = false;
            //console.warn(draggedItems);
            hasFile = draggedItems && draggedItems.length === 1 && draggedItems[0].kind === 'file';

            return hasFile ? "bg-success dragover" : "bg-danger dragover";
        };

        $scope.onDroppedFiles = function ($files) {
            fileService.saveDroppedFiles($files, {zip: true})
                .then(function (fInfos) {
                    if (fInfos.length !== 1) {
                        growl.error('One zip file must be dropped!');
                    } else {
                        fileInfo.name = fInfos[0].name;
                        fileInfo.url = fInfos[0].name;
                        fileInfo.hash = fInfos[0].hash;
                    }
                });
        };

        $scope.ok = function () {
            $modalInstance.close($scope.data);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .directive('testBenchList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId',
                connectionId: '=connectionId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/TestBenchList.html',
            controller: 'TestBenchListController'
        };
    });

},{}],18:[function(require,module,exports){
/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.components')
    .controller('WorkersListController', function ($scope, $interval, growl, executorService) {
        'use strict';
        var intervalPromise = null,
            consecutiveErrors = 0,
            maxConsecutiveErrors = 30;
        $scope.dataModel = {
            workers: null
        };
        $scope.$on('$destroy', function () {
            if (intervalPromise && $interval.cancel(intervalPromise)) {
                console.log('Workers interval cancelled');
            } else {
                console.error('Could not cancel WorkersInterval.');
                console.error(intervalPromise);
            }
        });

        intervalPromise = $interval(function () {
            executorService.getWorkersInfo()
                .then(function (responce) {
                    consecutiveErrors = 0;
                    $scope.dataModel.workers = responce;
                })
                .catch(function (err) {
                    console.error(err);
                    consecutiveErrors += 1;
                    if (consecutiveErrors >= maxConsecutiveErrors) {
                        $interval.cancel(intervalPromise);
                        growl.error('Workers did not respond after ' + maxConsecutiveErrors + ' requests.');
                        intervalPromise = null;
                    }
                });
        }, 1000);
    })
    .directive('workersList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/WorkersList.html',
            controller: 'WorkersListController'
        };
    });

},{}],19:[function(require,module,exports){
/*globals angular, console, document*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('WorkspaceListController', function ($scope, $window, $location, $modal, growl, workspaceService, fileService) {
        'use strict';
        var self = this,
            items = [],
            workspaceItems = {},
            config,
            context,
            serviceData2ListItem,
            addCountWatchers;

        console.log('WorkspaceListController');

        if ($scope.connectionId && angular.isString($scope.connectionId)) {
            context = {
                db: $scope.connectionId,
                regionId: 'WorkspaceListController_' + (new Date()).toISOString()
            };
            $scope.$on('$destroy', function () {
                workspaceService.cleanUpAllRegions(context);
            });
        } else {
            throw new Error('connectionId must be defined and it must be a string');
        }

        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function (jQEvent, ui) {
                console.log('Sort happened', jQEvent, ui);
            },

            itemClick: function (event, item) {
                $location.path('/workspaceDetails/' + item.id.replace(/\//g, '-'));
            },

            itemContextmenuRenderer: function (e, item) {
                return [
                    {
                        items: [
                            {
                                id: 'openInEditor',
                                label: 'Open in Editor',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-edit',
                                action: function () {
                                    $window.open('/?project=ADMEditor&activeObject=' + item.id, '_blank');
                                }
                            },
                            {
                                id: 'editWorkspace',
                                label: 'Edit',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-pencil',
                                actionData: {
                                    id: item.id,
                                    description: item.description,
                                    name: item.title
                                },
                                action: function (data) {
                                    var editContext = {
                                            db: context.db,
                                            regionId: context.regionId + '_watchWorkspaces'
                                        },
                                        modalInstance = $modal.open({
                                            templateUrl: '/cyphy-components/templates/WorkspaceEdit.html',
                                            controller: 'WorkspaceEditController',
                                            resolve: { data: function () { return data; } }
                                        });

                                    modalInstance.result.then(function (editedData) {
                                        var attrs = {
                                            'name': editedData.name,
                                            'INFO': editedData.description
                                        };
                                        workspaceService.setWorkspaceAttributes(editContext, data.id, attrs)
                                            .then(function () {
                                                console.log('Attribute updated');
                                            });
                                    }, function () {
                                        console.log('Modal dismissed at: ' + new Date());
                                    });
                                }
                            },
                            {
                                id: 'exportAsXME',
                                label: 'Export as XME',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-share-alt',
                                actionData: { id: item.id, name: item.title },
                                action: function (data) {
                                    workspaceService.exportWorkspace(context, data.id)
                                        .then(function (downloadUrl) {
                                            growl.success('Workspace package for <a href="' + downloadUrl + '">' +
                                                data.name + '</a> exported.');
                                        })
                                        .catch(function (reason) {
                                            console.error(reason);
                                            growl.error('Export failed, see console for details.');
                                        });
                                }
                            }
                        ]
                    },
                    {
                        items: [
                            {
                                id: 'delete',
                                label: 'Delete',
                                disabled: false,
                                iconClass: 'glyphicon glyphicon-remove',
                                actionData: { id: item.id, name: item.title },
                                action: function (data) {
                                    var modalInstance = $modal.open({
                                        templateUrl: '/cyphy-components/templates/SimpleModal.html',
                                        controller: 'SimpleModalController',
                                        resolve: {
                                            data: function () {
                                                return {
                                                    title: 'Delete Workspace',
                                                    details: 'This will delete ' + data.name + ' from the project.'
                                                };
                                            }
                                        }
                                    });

                                    modalInstance.result.then(function () {
                                        workspaceService.deleteWorkspace(context, data.id);
                                    }, function () {
                                        console.log('Modal dismissed at: ' + new Date());
                                    });
                                }
                            }
                        ]
                    }
                ];
            },

            detailsRenderer: function (item) {
                //                item.details = 'My details are here now!';
            },

            newItemForm: {
                title: 'Create new workspace',
                itemTemplateUrl: '/cyphy-components/templates/WorkspaceNewItem.html',
                expanded: false,
                controller: function ($scope) {
                    $scope.model = {
                        droppedFiles: []
                    };
                    $scope.dragOverClass = function ($event) {
                        var draggedItems = $event.dataTransfer.items,
                            i,
                            hasFile = false;
//                        console.warn(draggedItems);
                        if (draggedItems === null) {
                            hasFile = false;
                        } else {
                            for (i = 0; i < draggedItems.length; i += 1) {
                                if (draggedItems[i].kind === 'file') {
                                    hasFile = true;
                                    break;
                                }
                            }
                        }

                        return hasFile ? "bg-success dragover" : "bg-danger dragover";
                    };

                    $scope.onDroppedFiles = function ($files) {
                        fileService.saveDroppedFiles($files, {zip: true, adm: true, atm: true})
                            .then(function (fInfos) {
                                var i;
                                console.log(fInfos);
                                for (i = 0; i < fInfos.length; i += 1) {
                                    $scope.model.droppedFiles.push(fInfos[i]);
                                }
                            });
                    };

                    $scope.createItem = function (newItem) {
                        var newItemContext = {
                                db: context.db,
                                regionId: context.regionId + '_watchWorkspaces'
                            };
                        if (!newItem || !newItem.name) {
                            growl.warning('Provide a name');
                            return;
                        }
                        workspaceService.createWorkspace(newItemContext, newItem.name, newItem.description)
                            .then(function (folderIds) {
                                growl.success(newItem.name + ' created.');
                                if ($scope.model.droppedFiles.length > 0) {
                                    growl.info('Importing files..');
                                    workspaceService.importFiles(newItemContext, folderIds, $scope.model.droppedFiles)
                                        .then(function () {
                                            growl.info('Finished importing files!', {ttl: 100});
                                        }, function (reason) {
                                            growl.error(reason);
                                        }, function (info) {
                                            growl[info.type](info.message);
                                        })
                                        .finally(function () {
                                            config.newItemForm.expanded = false;
                                            $scope.model.droppedFiles = [];
                                        });
                                } else {
                                    config.newItemForm.expanded = false;
                                    $scope.model.droppedFiles = [];
                                }
                            });
                    };
                }
            },

            filter: {
            }

        };

        $scope.listData = {
            items: items
        };

        $scope.config = config;

        serviceData2ListItem = function (data) {
            var workspaceItem;

            if (workspaceItems.hasOwnProperty(data.id)) {
                workspaceItem = workspaceItems[data.id];
                workspaceItem.title = data.name;
                workspaceItem.description = data.description;
            } else {
                workspaceItem = {
                    id: data.id,
                    title: data.name,
                    toolTip: 'Open Workspace',
                    description: data.description,
                    lastUpdated: {
                        time: new Date(), // TODO: get this
                        user: 'N/A' // TODO: get this
                    },
                    stats: [
                        {
                            value: 0,
                            toolTip: 'Components',
                            iconClass: 'fa fa-puzzle-piece'
                        },
                        {
                            value: 0,
                            toolTip: 'Design Spaces',
                            iconClass: 'fa fa-cubes'
                        },
                        {
                            value: 0,
                            toolTip: 'Test benches',
                            iconClass: 'glyphicon glyphicon-saved'
                        },
                        {
                            value: 0,
                            toolTip: 'Requirements',
                            iconClass: 'fa fa-bar-chart-o'
                        }
                    ]
                };

                workspaceItems[workspaceItem.id] = workspaceItem;
                items.push(workspaceItem);
            }
        };

        addCountWatchers = function (workspaceId) {
            workspaceService.watchNumberOfComponents(context, workspaceId, function (updateData) {
                var workspaceData = workspaceItems[workspaceId];
                if (workspaceData) {
                    workspaceData.stats[0].value = updateData.data;
                }
            })
                .then(function (data) {
                    var workspaceData = workspaceItems[workspaceId];
                    if (workspaceData) {
                        workspaceData.stats[0].value = data.count;
                    }
                });
            workspaceService.watchNumberOfDesigns(context, workspaceId, function (updateData) {
                var workspaceData = workspaceItems[workspaceId];
                if (workspaceData) {
                    workspaceData.stats[1].value = updateData.data;
                }
            })
                .then(function (data) {
                    var workspaceData = workspaceItems[workspaceId];
                    if (workspaceData) {
                        workspaceData.stats[1].value = data.count;
                    }
                });
            workspaceService.watchNumberOfTestBenches(context, workspaceId, function (updateData) {
                var workspaceData = workspaceItems[workspaceId];
                if (workspaceData) {
                    workspaceData.stats[2].value = updateData.data;
                }
            })
                .then(function (data) {
                    var workspaceData = workspaceItems[workspaceId];
                    if (workspaceData) {
                        workspaceData.stats[2].value = data.count;
                    }
                });
        };

        workspaceService.registerWatcher(context, function (destroyed) {
            // initialize all variables
            items = [];
            $scope.listData = {
                items: items
            };
            workspaceItems = {};

            if (destroyed) {
                console.info('destroy event raised');
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info('WorkspaceListController - initialize event raised');
            workspaceService.watchWorkspaces(context, function (updateObject) {
                var index;

                if (updateObject.type === 'load') {
                    serviceData2ListItem(updateObject.data);
                    addCountWatchers(updateObject.id);

                } else if (updateObject.type === 'update') {
                    serviceData2ListItem(updateObject.data);

                } else if (updateObject.type === 'unload') {
                    if (workspaceItems.hasOwnProperty(updateObject.id)) {
                        index = items.map(function (e) {
                            return e.id;
                        }).indexOf(updateObject.id);
                        if (index > -1) {
                            items.splice(index, 1);
                        }
                        workspaceService.cleanUpRegion(context, context.regionId + '_watchNumberOfComponents_' + updateObject.id);
                        workspaceService.cleanUpRegion(context, context.regionId + '_watchNumberOfDesigns_' + updateObject.id);
                        workspaceService.cleanUpRegion(context, context.regionId + '_watchNumberOfTestBenches_' + updateObject.id);
                        delete workspaceItems[updateObject.id];
                    }

                } else {
                    throw new Error(updateObject);

                }
            })
                .then(function (data) {
                    var workspaceId;

                    for (workspaceId in data.workspaces) {
                        if (data.workspaces.hasOwnProperty(workspaceId)) {
                            serviceData2ListItem(data.workspaces[workspaceId]);
                            addCountWatchers(workspaceId);
                        }
                    }
                });
        });
    })
    .controller('WorkspaceEditController', function ($scope, $modalInstance, data) {
        'use strict';
        $scope.data = {
            description: data.description,
            name: data.name
        };

        $scope.ok = function () {
            $modalInstance.close($scope.data);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    })
    .directive('workspaceList', function () {
        'use strict';
        return {
            restrict: 'E',
            replace: true,
            scope: {
                connectionId: '=connectionId'
            },
            templateUrl: '/cyphy-components/templates/WorkspaceList.html',
            controller: 'WorkspaceListController'
        };
    });

},{}],20:[function(require,module,exports){
/*globals angular, console*/

/**
 * This service contains functionality shared amongst the different services. It should not be used
 * directly in a controller - only as part of other services.
 *
 * @author pmeijer / https://github.com/pmeijer
 */


angular.module('cyphy.services')
    .service('baseCyPhyService', function ($q, $timeout, nodeService) {
        'use strict';

        /**
         * Registers a watcher (controller) to the service. Callback function is called when nodes become available or
         * when they became unavailable. These are also called directly with the state of the nodeService.
         * @param {string} watchers - Watchers from the service utilizing this function.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.db - Database connection.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         * @param {function} fn - Called with true when there are no nodes unavailable and false when there are.
         */
        this.registerWatcher = function (watchers, parentContext, fn) {
            nodeService.on(parentContext.db, 'initialize', function () {
                // This should be enough, the regions will be cleaned up in nodeService.
                watchers[parentContext.regionId] = {};
                fn(false);
            });
            nodeService.on(parentContext.db, 'destroy', function () {
                // This should be enough, the regions should be cleaned up in nodeService.
                if (watchers[parentContext.regionId]) {
                    delete watchers[parentContext.regionId];
                }
                fn(true);
            });
        };

        /**
         * Removes all watchers spawned from parentContext, this should typically be invoked when the controller is destroyed.
         * @param {string} watchers - Watchers from the service utilizing this function.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         */
        this.cleanUpAllRegions = function (watchers, parentContext) {
            var childWatchers,
                key;
            if (watchers[parentContext.regionId]) {
                childWatchers = watchers[parentContext.regionId];
                for (key in childWatchers) {
                    if (childWatchers.hasOwnProperty(key)) {
                        nodeService.cleanUpRegion(childWatchers[key].db, childWatchers[key].regionId);
                    }
                }
                delete watchers[parentContext.regionId];
            } else {
                console.log('Nothing to clean-up..');
            }
        };

        /**
         * Removes specified watcher (regionId)
         * @param {string} watchers - Watchers from the service utilizing this function.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.db - Database connection of both parent and region to be deleted.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         * @param {string} regionId - Region id of the spawned region that should be deleted.
         */
        this.cleanUpRegion = function (watchers, parentContext, regionId) {
            if (watchers[parentContext.regionId]) {
                if (watchers[parentContext.regionId][regionId]) {
                    nodeService.cleanUpRegion(parentContext.db, regionId);
                    delete watchers[parentContext.regionId][regionId];
                } else {
                    console.log('Nothing to clean-up..');
                }
            } else {
                console.log('Cannot clean-up region since parentContext is not registered..', parentContext);
            }
        };

        /**
         * Updates the given attributes of a node.
         * @param {object} context - Must exist within watchers and contain the component.
         * @param {string} context.db - Must exist within watchers and contain the component.
         * @param {string} context.regionId - Must exist within watchers and contain the component.
         * @param {string} id - Path to node.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setNodeAttributes = function (context, id, attrs) {
            var deferred = $q.defer();
            if (Object.keys(attrs).length === 0) {
                console.log('no attribute to update');
                deferred.resolve();
            }
            nodeService.loadNode(context, id)
                .then(function (nodeObj) {
                    var keys = Object.keys(attrs),
                        counter = keys.length,
                        setAttr = function () {
                            counter -= 1;
                            nodeObj.setAttribute(keys[counter], attrs[keys[counter]], 'webCyPhy - setNodeAttributes')
                                .then(function () {
                                    if (counter <= 0) {
                                        deferred.resolve();
                                    } else {
                                        setAttr();
                                    }
                                });
                        };
                    setAttr();
                });

            return deferred.promise;
        };

        /** TODO: Watch domainPorts inside Connectors
         *  Watches the interfaces (Properties, Connectors and DomainPorts) of a model.
         * @param {string} watchers - Watchers from the service utilizing this function.
         * @param {object} parentContext - context of controller.
         * @param {string} id - Path to model.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchInterfaces = function (watchers, parentContext, id, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchInterfaces_' + id,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    id: id,
                    properties: {}, //property:  {id: <string>, name: <string>, dataType: <string>, valueType <string>, derived <boolean>}
                    connectors: {}, //connector: {id: <string>, name: <string>, domainPorts: <object> }
                    ports: {}       //port:      {id: <string>, name: <string>, type: <string>, class: <string> }
                },
                onPropertyUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDataType = this.getAttribute('DataType'),
                        newValueType = this.getAttribute('ValueType'),
                        newDerived = isPropertyDerived(this),
                        hadChanges = false;
                    if (newName !== data.properties[id].name) {
                        data.properties[id].name = newName;
                        hadChanges = true;
                    }
                    if (newDataType !== data.properties[id].dataType) {
                        data.properties[id].dataType = newDataType;
                        hadChanges = true;
                    }
                    if (newValueType !== data.properties[id].valueType) {
                        data.properties[id].valueType = newValueType;
                        hadChanges = true;
                    }
                    if (newDerived !== data.properties[id].derived) {
                        data.properties[id].derived = newDerived;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        $timeout(function () {
                            updateListener({id: id, type: 'update', data: data});
                        });
                    }
                },
                onPropertyUnload = function (id) {
                    delete data.properties[id];
                    $timeout(function () {
                        updateListener({id: id, type: 'unload', data: null});
                    });
                },
                onConnectorUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        hadChanges = false;
                    if (newName !== data.connectors[id].name) {
                        data.connectors[id].name = newName;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        $timeout(function () {
                            updateListener({id: id, type: 'update', data: data});
                        });
                    }
                },
                onConnectorUnload = function (id) {
                    delete data.connectors[id];
                    $timeout(function () {
                        updateListener({id: id, type: 'unload', data: null});
                    });
                },
                onPortUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newType = this.getAttribute('Type'),
                        newClass = this.getAttribute('Class'),
                        hadChanges = false;
                    if (newName !== data.ports[id].name) {
                        data.ports[id].name = newName;
                        hadChanges = true;
                    }
                    if (newType !== data.ports[id].dataType) {
                        data.ports[id].type = newType;
                        hadChanges = true;
                    }
                    if (newClass !== data.ports[id].class) {
                        data.ports[id].class = newClass;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        $timeout(function () {
                            updateListener({id: id, type: 'update', data: data});
                        });
                    }
                },
                onPortUnload = function (id) {
                    delete data.ports[id];
                    $timeout(function () {
                        updateListener({id: id, type: 'unload', data: null});
                    });
                },
                isPropertyDerived = function (node) {
                    return node.getCollectionPaths('dst').length > 0;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, id)
                    .then(function (modelNode) {
                        modelNode.loadChildren().then(function (children) {
                            var i,
                                childId,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                childId = childNode.getId();
                                if (childNode.isMetaTypeOf(meta.Property)) {
                                    data.properties[childId] = {
                                        id: childId,
                                        name: childNode.getAttribute('name'),
                                        dataType: childNode.getAttribute('DataType'),
                                        valueType: childNode.getAttribute('ValueType'),
                                        derived: isPropertyDerived(childNode)
                                    };
                                    childNode.onUpdate(onPropertyUpdate);
                                    childNode.onUnload(onPropertyUnload);
                                } else if (childNode.isMetaTypeOf(meta.Connector)) {
                                    data.connectors[childId] = {
                                        id: childId,
                                        name: childNode.getAttribute('name'),
                                        domainPorts: {}
                                    };
                                    childNode.onUpdate(onConnectorUpdate);
                                    childNode.onUnload(onConnectorUnload);
                                    ///queueList.push(childNode.loadChildren(childNode));
                                } else if (childNode.isMetaTypeOf(meta.DomainPort)) {
                                    data.ports[childId] = {
                                        id: childId,
                                        name: childNode.getAttribute('name'),
                                        type: childNode.getAttribute('Type'),
                                        class: childNode.getAttribute('Class')
                                    };
                                    childNode.onUpdate(onPortUpdate);
                                    childNode.onUnload(onPortUnload);
                                    ///queueList.push(childNode.loadChildren(childNode));
                                }
                            }
                            modelNode.onNewChildLoaded(function (newChild) {
                                childId = newChild.getId();
                                if (newChild.isMetaTypeOf(meta.Property)) {
                                    data.properties[childId] = {
                                        id: childId,
                                        name: newChild.getAttribute('name'),
                                        dataType: newChild.getAttribute('DataType'),
                                        valueType: newChild.getAttribute('ValueType'),
                                        derived: isPropertyDerived(newChild)
                                    };
                                    newChild.onUpdate(onPropertyUpdate);
                                    newChild.onUnload(onPropertyUnload);
                                    $timeout(function () {
                                        updateListener({id: childId, type: 'load', data: data});
                                    });
                                } else if (newChild.isMetaTypeOf(meta.Connector)) {
                                    data.connectors[childId] = {
                                        id: childId,
                                        name: newChild.getAttribute('name'),
                                        domainPorts: {}
                                    };
                                    newChild.onUpdate(onConnectorUpdate);
                                    newChild.onUnload(onConnectorUnload);
                                    $timeout(function () {
                                        updateListener({id: childId, type: 'load', data: data});
                                    });
                                    ///queueList.push(childNode.loadChildren(childNode));
                                } else if (newChild.isMetaTypeOf(meta.DomainPort)) {
                                    data.ports[childId] = {
                                        id: childId,
                                        name: childNode.getAttribute('name'),
                                        type: childNode.getAttribute('Type'),
                                        class: childNode.getAttribute('Class')
                                    };
                                    newChild.onUpdate(onPortUpdate);
                                    newChild.onUnload(onPortUnload);
                                    $timeout(function () {
                                        updateListener({id: childId, type: 'load', data: data});
                                    });
                                }
                            });

                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

    });
},{}],21:[function(require,module,exports){
/*globals angular, console*/


/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module('cyphy.services')
    .service('componentService', function ($q, $timeout, nodeService, baseCyPhyService) {
        'use strict';
        var watchers = {};

        /**
         * Removes the component from the context (db/project/branch).
         * @param context - context of controller, N.B. does not need to specify region.
         * @param componentId
         * @param [msg] - Commit message.
         */
        this.deleteComponent = function (context, componentId, msg) {
            var message = msg || 'ComponentService.deleteComponent ' + componentId;
            nodeService.destroyNode(context, componentId, message);
        };

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the component.
         * @param {string} context.db - Must exist within watchers and contain the component.
         * @param {string} context.regionId - Must exist within watchers and contain the component.
         * @param {string} componentId - Path to component.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setComponentAttributes = function (context, componentId, attrs) {
            return baseCyPhyService.setNodeAttributes(context, componentId, attrs);
        };

        /**
         *  Watches all components (existence and their attributes) of a workspace.
         * @param parentContext - context of controller.
         * @param workspaceId
         * @param updateListener - invoked when there are (filtered) changes in data.  Data is an object in data.components.
         * @param {object} avmIds - An optional filter that only watches components with IDs that evaluates to true.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchComponents = function (parentContext, workspaceId, avmIds, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchComponents',
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    components: {} // component {id: <string>, name: <string>, description: <string>,
                                   //            avmId: <string>, resource: <hash|string>, classifications: <string> }
                },
                onUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDesc = this.getAttribute('INFO'),
                        newAvmID = this.getAttribute('ID'),
                        newResource = this.getAttribute('Resource'),
                        newClass = this.getAttribute('Classifications'),
                        hadChanges = false;
                    if (newName !== data.components[id].name) {
                        data.components[id].name = newName;
                        hadChanges = true;
                    }
                    if (newDesc !== data.components[id].description) {
                        data.components[id].description = newDesc;
                        hadChanges = true;
                    }
                    if (newAvmID !== data.components[id].avmId) {
                        data.components[id].avmId = newAvmID;
                        hadChanges = true;
                    }
                    if (newResource !== data.components[id].resource) {
                        data.components[id].resource = newResource;
                        hadChanges = true;
                    }
                    if (newClass !== data.components[id].classifications) {
                        data.components[id].classifications = newClass;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        console.warn('ComponentService found update');
                        $timeout(function () {
                            updateListener({id: id, type: 'update', data: data.components[id]});
                        });
                    }
                },
                onUnload = function (id) {
                    delete data.components[id];
                    $timeout(function () {
                        updateListener({id: id, type: 'unload', data: null});
                    });
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            componentId,
                            queueList = [],
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ACMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
                                componentId = childNode.getId();
                                if (!avmIds || avmIds.hasOwnProperty(childNode.getAttribute('ID'))) {
                                    data.components[componentId] = {
                                        id: componentId,
                                        name: childNode.getAttribute('name'),
                                        description: childNode.getAttribute('INFO'),
                                        avmId: childNode.getAttribute('ID'),
                                        resource: childNode.getAttribute('Resource'),
                                        classifications: childNode.getAttribute('Classifications')
                                    };
                                    childNode.onUnload(onUnload);
                                    childNode.onUpdate(onUpdate);
                                }
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ACMFolder)) {
                                watchFromFolderRec(newChild, meta);
                            } else if (newChild.isMetaTypeOf(meta.AVMComponentModel)) {
                                componentId = newChild.getId();
                                if (!avmIds || avmIds.hasOwnProperty(newChild.getAttribute('ID'))) {
                                    data.components[componentId] = {
                                        id: componentId,
                                        name: newChild.getAttribute('name'),
                                        description: newChild.getAttribute('INFO'),
                                        avmId: newChild.getAttribute('ID'),
                                        resource: newChild.getAttribute('Resource'),
                                        classifications: newChild.getAttribute('Classifications')
                                    };
                                    newChild.onUnload(onUnload);
                                    newChild.onUpdate(onUpdate);
                                    $timeout(function () {
                                        updateListener({id: componentId, type: 'load', data: data.components[componentId]});
                                    });
                                }
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };
            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.ACMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ACMFolder)) {
                                    watchFromFolderRec(newChild, meta);
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches the domain-models of a component.
         * @param parentContext - context of controller.
         * @param componentId
         * @param updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchComponentDomains = function (parentContext, componentId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchComponentDomains_' + componentId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    id: componentId,
                    domainModels: {}   //domainModel: id: <string>, type: <string>
                },
                onDomainModelUpdate = function (id) {
                    var newType = this.getAttribute('Type'),
                        hadChanges = false;
                    if (newType !== data.domainModels[id].type) {
                        data.domainModels[id].type = newType;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        $timeout(function () {
                            updateListener({id: id, type: 'update', data: data});
                        });
                    }
                },
                onDomainModelUnload = function (id) {
                    delete data.domainModels[id];
                    $timeout(function () {
                        updateListener({id: id, type: 'unload', data: null});
                    });
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, componentId)
                    .then(function (componentNode) {
                        componentNode.loadChildren().then(function (children) {
                            var i,
                                childId,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                childId = childNode.getId();
                                if (childNode.isMetaTypeOf(meta.DomainModel)) {
                                    data.domainModels[childId] = {
                                        id: childId,
                                        type: childNode.getAttribute('Type')
                                    };
                                    childNode.onUpdate(onDomainModelUpdate);
                                    childNode.onUnload(onDomainModelUnload);
                                }
                            }
                            componentNode.onNewChildLoaded(function (newChild) {
                                childId = newChild.getId();
                                if (newChild.isMetaTypeOf(meta.DomainModel)) {
                                    data.domainModels[childId] = {
                                        id: childId,
                                        type: newChild.getAttribute('Type')
                                    };
                                    newChild.onUpdate(onDomainModelUpdate);
                                    newChild.onUnload(onDomainModelUnload);
                                    $timeout(function () {
                                        updateListener({id: childId, type: 'load', data: data});
                                    });
                                }
                            });

                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         * See baseCyPhyService.watchInterfaces.
         */
        this.watchInterfaces = function (parentContext, id, updateListener) {
            return baseCyPhyService.watchInterfaces(watchers, parentContext, id, updateListener);
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function (parentContext) {
            baseCyPhyService.cleanUpAllRegions(watchers, parentContext);
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            baseCyPhyService.cleanUpRegion(watchers, parentContext, regionId);
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function (parentContext, fn) {
            baseCyPhyService.registerWatcher(watchers, parentContext, fn);
        };

        this.logContext = function (context) {
            nodeService.logContext(context);
        };
    });
},{}],22:[function(require,module,exports){
/*globals angular, console, WebGMEGlobal*/

/**
 * This service contains methods for design space exploration through the Executor Client.
 *
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.services')
    .service('desertService', function ($q, $interval, fileService, executorService) {
        'use strict';
        var self = this,
            CMDSTR,
            xmlToJson = new WebGMEGlobal.classes.Converters.Xml2json({
                skipWSText: true,
                arrayElements: {
                    Configuration: true,
                    Element: true,
                    NaturalMember: true,
                    AlternativeAssignment: true
                }
            }),
            jsonToXml = new WebGMEGlobal.classes.Converters.Json2xml();

        this.calculateConfigurations = function (desertInput) {
            var deferred = $q.defer();

            if ((desertInput.desertSystem && angular.isObject(desertInput.desertSystem) &&
                angular.isObject(desertInput.idMap)) === false) {
                deferred.reject('desertInput must contain a desertSystem and idMap object!');
                return deferred.promise;
            }

            self.saveDesertInput(desertInput.desertSystem)
                .then(function (inputHash) {
                    console.log('Saved desertInput', fileService.getDownloadUrl(inputHash));
                    return self.createAndRunJob(inputHash);
                })
                .then(function (jobInfo) {
                    console.log('Job succeeded final jobInfo', jobInfo);
                    return self.extractConfigurations(jobInfo, desertInput.idMap);
                })
                .then(function (configurations) {
                    deferred.resolve(configurations);
                })
                .catch(function (err) {
                    deferred.reject('Calculating configurations failed, err: ' + err.toString());
                });

            return deferred.promise;
        };

        this.saveDesertInput = function (desertSystem) {
            var deferred = $q.defer(),
                artifact,
                xmlString;

            artifact = fileService.createArtifact('desert-input');
            xmlString = jsonToXml.convertToString(desertSystem);

            fileService.addFileAsSoftLinkToArtifact(artifact, 'desertInput.xml', xmlString)
                .then(function (hash) {
                    var execConfig = JSON.stringify({
                            cmd: 'run_desert.cmd',
                            resultArtifacts: [
                                { name: 'all', resultPatterns: [] }
                            ]
                        }, null, 4),
                        filesToAdd = {
                            'executor_config.json': execConfig,
                            'run_desert.cmd': CMDSTR
                        };
                    return fileService.addFilesToArtifact(artifact, filesToAdd);
                })
                .then(function (hashes) {
                    return fileService.saveArtifact(artifact);
                })
                .then(function (artieHash) {
                    deferred.resolve(artieHash);
                })
                .catch(function (reason) {
                    deferred.reject('Could not save DesertInput to blob, err: "' + reason + '"');
                });

            return deferred.promise;
        };

        this.createAndRunJob = function (inputHash) {
            var deferred = $q.defer();
            executorService.createJob({hash: inputHash, labels: []})
                .then(function () {
                    var stop;
                    stop = $interval(function () {
                        executorService.getInfo(inputHash)
                            .then(function (jobInfo) {
                                console.info(JSON.stringify(jobInfo, null, 4));
                                if (jobInfo.status === 'CREATED' || jobInfo.status === 'RUNNING') {
                                    return;
                                }
                                $interval.cancel(stop);
                                if (jobInfo.status === 'SUCCESS') {
                                    deferred.resolve(jobInfo);
                                } else {
                                    deferred.reject(JSON.stringify(jobInfo, null, 4));
                                }
                            })
                            .catch(function (err) {
                                $interval.cancel(stop);
                                deferred.reject('Could not obtain jobInfo for desert' + err);
                            });
                    }, 200);
                })
                .catch(function (err) {
                    deferred.reject('Could not create job' + err);
                });

            return deferred.promise;
        };

        this.extractConfigurations = function (jobInfo, idMap) {
            var deferred = $q.defer();
            if ((jobInfo.resultHashes && jobInfo.resultHashes.all) === false) {
                deferred.reject('JobInfo did not contain resultHashes.all');
                return deferred.promise;
            }
            fileService.getMetadata(jobInfo.resultHashes.all)
                .then(function (metadata) {
//                    // TODO: Deal with configs when there's constraints
//                    if (!metadata.content.hasOwnProperty('desertInput_configs.xml')) {
//                        deferred.reject('Desert did not generate a "desertInput_configs.xml".');
//                        return;
//                    }
                    if (!metadata.content.hasOwnProperty('desertInput_back.xml')) {
                        deferred.reject('Desert did not generate a desertInput_back.xml.');
                        return;
                    }

                    return fileService.getObject(metadata.content['desertInput_back.xml'].content);
                })
                .then(function (content) {
                    var desertObject = xmlToJson.convertFromBuffer(content),
                        desertBackSystem,
                        j,
                        k,
                        cfg,
                        elem,
                        altAss,
                        config,
                        configurations = [],
                        elemIdToPath = {};

                    if (desertObject instanceof Error) {
                        deferred.reject('Output desert XML not valid xml, err: ' + desertObject.message);
                        return;
                    }
                    desertBackSystem = desertObject.DesertBackSystem;

                    if (desertBackSystem.Element) {
                        for (j = 0; j < desertBackSystem.Element.length; j += 1) {
                            elem = desertBackSystem.Element[j];
                            elemIdToPath[elem['@_id']] = idMap[elem['@externalID']];
                        }
                    }
                    for (j = 0; j < desertBackSystem.Configuration.length; j += 1) {
                        cfg = desertBackSystem.Configuration[j];
                        configurations.push({
                            name: cfg['@name'],
                            id: cfg['@id'],
                            alternativeAssignments: []
                        });
                        config = configurations[configurations.length - 1];
                        if (cfg.AlternativeAssignment) {
                            for (k = 0; k < cfg.AlternativeAssignment.length; k += 1) {
                                altAss = cfg.AlternativeAssignment[k];
                                config.alternativeAssignments.push({
                                    selectedAlternative: elemIdToPath[altAss['@alternative_end_']],
                                    alternativeOf: elemIdToPath[altAss['@alternative_of_end_']]
                                });
                            }
                        }
                    }
                    deferred.resolve(configurations);
                });

            return deferred.promise;
        };

        this.calculateConfigurationsDummy = function (desertInput) {
            var deferred = $q.defer(),
                inputArtifact,
                configurations = [
                    {
                        id: 1,
                        name: "Conf. no: 1",
                        alternativeAssignments: [
                            {
                                selectedAlternative: "/2130017834/542571494/1646059422/564312148/91073815",
                                alternativeOf: "/2130017834/542571494/1646059422/564312148"
                            }
                        ]
                    },
                    {
                        id: 2,
                        name: "Conf. no: 2",
                        alternativeAssignments: [
                            {
                                selectedAlternative: "/2130017834/542571494/1646059422/564312148/1433471789",
                                alternativeOf: "/2130017834/542571494/1646059422/564312148"
                            }
                        ]
                    },
                    {
                        id: 3,
                        name: "Conf. no: 3",
                        alternativeAssignments: [
                            {
                                selectedAlternative: "/2130017834/542571494/1646059422/564312148/1493907264",
                                alternativeOf: "/2130017834/542571494/1646059422/564312148"
                            }
                        ]
                    },
                    {
                        id: 4,
                        name: "Conf. no: 4",
                        alternativeAssignments: [
                            {
                                selectedAlternative: "/2130017834/542571494/1646059422/564312148/1767521621",
                                alternativeOf: "/2130017834/542571494/1646059422/564312148"
                            }
                        ]
                    }
                ];

            deferred.resolve(configurations);
            return deferred.promise;
        };

        this.getDesertInputData = function (designStructureData) {
            var desertSystem,
                idMap = {},
                idCounter = 4,
                rootContainer = designStructureData.containers[designStructureData.rootId],
                populateDataRec = function (container, element) {
                    var key,
                        childData,
                        id;

                    for (key in container.components) {
                        if (container.components.hasOwnProperty(key)) {
                            childData = container.components[key];
                            idCounter += 1;
                            id = idCounter.toString();
                            idMap[id] = childData.id;
                            element.Element.push({
                                '@_id': 'id' + id,
                                '@decomposition': 'false',
                                '@externalID': id,
                                '@id': id,
                                '@name': childData.name,
                                'Element': []
                            });
                        }
                    }
                    for (key in container.subContainers) {
                        if (container.subContainers.hasOwnProperty(key)) {
                            childData = container.subContainers[key];
                            idCounter += 1;
                            id = idCounter.toString();
                            idMap[id] = childData.id;
                            element.Element.push({
                                '@_id': 'id' + id,
                                '@decomposition': (childData.type === 'Compound').toString(),
                                '@externalID': id,
                                '@id': id,
                                '@name': childData.name,
                                'Element': []
                            });
                            populateDataRec(childData, element.Element[element.Element.length - 1]);
                        }
                    }
                };
            desertSystem = {
                'DesertSystem': {
                    '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    '@SystemName': '',
                    '@xsi:noNamespaceSchemaLocation': 'DesertIface.xsd',
                    'ConstraintSet': {
                        '@_id': 'id1',
                        '@externalID': '1',
                        '@id': '1',
                        '@name': 'constraints'
                    },
                    'FormulaSet': {
                        '@_id': 'id2',
                        '@externalID': '2',
                        '@id': '2',
                        '@name': 'formulaSet'
                    },
                    'Space': {
                        '@_id': 'id3',
                        '@decomposition': 'true',
                        '@externalID': '3',
                        '@id': '3',
                        '@name': 'DesignSpace',
                        'Element': [
                            {
                                '@_id': 'id4',
                                '@decomposition': 'true',
                                '@externalID': '4',
                                '@id': '4',
                                '@name': rootContainer.name,
                                'Element': []
                            }
                        ]
                    }
                }
            };
            populateDataRec(rootContainer, desertSystem.DesertSystem.Space.Element[0]);

            return { desertSystem: desertSystem, idMap: idMap };
        };

        CMDSTR = [
            ':: Runs <-DesertTools.exe-> desertInput.xml /m',
            'ECHO off',
            'pushd %~dp0',
            '%SystemRoot%\\SysWoW64\\REG.exe query "HKLM\\software\\META" /v "META_PATH"',
            'SET QUERY_ERRORLEVEL=%ERRORLEVEL%',
            'IF %QUERY_ERRORLEVEL% == 0 (',
            '        FOR /F "skip=2 tokens=2,*" %%A IN (\'%SystemRoot%\\SysWoW64\\REG.exe query "HKLM\\software\\META" /v "META_PATH"\') DO SET META_PATH=%%B)',
            'SET DESERT_EXE="%META_PATH%\\bin\\DesertTool.exe"',
            '   IF EXIST %DESERT_EXE% (',
            '       REM Installer machine.',
            '       %DESERT_EXE% desertInput.xml /c "applyAll"',
            '   ) ELSE IF EXIST "%META_PATH%\\src\\bin\\DesertTool.exe" (',
            '       REM Developer machine.',
            '       "%META_PATH%\\src\\bin\\DesertTool.exe" desertInput.xml /c "applyAll"',
            '   ) ELSE (',
            '       ECHO on',
            '       ECHO Could not find DesertTool.exe!',
            '       EXIT /B 3',
            '   )',
            ')',
            'IF %QUERY_ERRORLEVEL% == 1 (',
            '    ECHO on',
            'ECHO "META tools not installed." >> _FAILED.txt',
            'ECHO "See Error Log: _FAILED.txt"',
            'EXIT /b %QUERY_ERRORLEVEL%',
            ')',
            'popd'].join('\n');
    });
},{}],23:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module('cyphy.services')
    .service('designService', function ($q, $timeout, $location, $modal, growl, nodeService, baseCyPhyService, pluginService, fileService) {
        'use strict';
        var self = this,
            watchers = {};

        this.editDesignFn = function (data) {
            var modalInstance = $modal.open({
                templateUrl: '/cyphy-components/templates/DesignEdit.html',
                controller: 'DesignEditController',
                //size: size,
                resolve: { data: function () { return data; } }
            });

            modalInstance.result.then(function (editedData) {
                var attrs = {
                    'name': editedData.name,
                    'INFO': editedData.description
                };
                self.setDesignAttributes(data.context, data.id, attrs)
                    .then(function () {
                        console.log('Attribute updated');
                    });
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        this.exportAsAdmFn = function (data) {
            self.exportDesign(data.context, data.id)
                .then(function (downloadUrl) {
                    growl.success('ADM file for <a href="' + downloadUrl + '">' + data.name + '</a> exported.');
                })
                .catch(function (reason) {
                    console.error(reason);
                    growl.error('Export failed, see console for details.');
                });
        };

        this.deleteFn = function (data) {
            var modalInstance = $modal.open({
                templateUrl: '/cyphy-components/templates/SimpleModal.html',
                controller: 'SimpleModalController',
                resolve: {
                    data: function () {
                        return {
                            title: 'Delete Design Space',
                            details: 'This will delete ' + data.name + ' from the workspace.'
                        };
                    }
                }
            });

            modalInstance.result.then(function () {
                self.deleteDesign(data.context, data.id);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        /**
         * Removes the design from the context.
         * @param {object} context - context of controller.
         * @param {string} context.db - data-base connection.
         * @param {string} designId - Path to design-space.
         * @param [msg] - Commit message.
         */
        this.deleteDesign = function (context, designId, msg) {
            var message = msg || 'designService.deleteDesign ' + designId;
            nodeService.destroyNode(context, designId, message);
        };

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the design.
         * @param {string} context.db - Must exist within watchers and contain the design.
         * @param {string} context.regionId - Must exist within watchers and contain the design.
         * @param {string} designId - Path to design-space.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setDesignAttributes = function (context, designId, attrs) {
            return baseCyPhyService.setNodeAttributes(context, designId, attrs);
        };

        /**
         * Calls AdmExporter.
         * @param {object} context - Context for plugin.
         * @param {string} context.db - Database connection to pull model from.
         * @param {string} designId
         * @param {string} [desertCfgPath] - Path to configuration if only one is to be exported.
         * @returns {Promise} - resolves to {string} if successful.
         */
        this.exportDesign = function (context, designId, desertCfgPath) {
            var deferred = $q.defer(),
                config = {
                    activeNode: designId,
                    runOnServer: false,
                    pluginConfig: {
                        acms: false,
                        desertCfg: desertCfgPath || ''
                    }
                };

            pluginService.runPlugin(context, 'AdmExporter', config)
                .then(function (result) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ADM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    if (result.success) {
                        console.log(result);
                        deferred.resolve(fileService.getDownloadUrl(result.artifacts[0]));
                    } else {
                        if (result.error) {
                            deferred.reject(result.error + ' messages: ' + angular.toJson(result.messages));
                        } else {
                            deferred.reject(angular.toJson(result.messages));
                        }
                    }
                })
                .catch(function (reason) {
                    deferred.reject('Something went terribly wrong ' + reason);
                });

            return deferred.promise;

        };

        this.generateDashboard = function (context, designId, resultIds) {
            var deferred = $q.defer(),
                config = {
                    activeNode: designId,
                    runOnServer: false,
                    pluginConfig: {
                        resultIDs: resultIds.join(';')
                    }
                };
            console.log(JSON.stringify(config));
            pluginService.runPlugin(context, 'GenerateDashboard', config)
                .then(function (result) {
                    var resultLight = {
                        success: result.success,
                        artifactsHtml: '',
                        messages: result.messages
                    };
                    console.log("Result", result);
                    pluginService.getPluginArtifactsHtml(result.artifacts)
                        .then(function (artifactsHtml) {
                            resultLight.artifactsHtml = artifactsHtml;
                            deferred.resolve(resultLight);
                        });
                })
                .catch(function (reason) {
                    deferred.reject('Something went terribly wrong, ' + reason);
                });

            return deferred.promise;
        };

        this.watchDesignNode = function (parentContext, designId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchDesign',
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    meta: null, // META nodes - needed when creating new nodes...
                    design: {} // design {id: <string>, name: <string>, description: <string>, node <NodeObj>}
                },
                onUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDesc = this.getAttribute('INFO'),
                        hadChanges = false;
                    if (newName !== data.design.name) {
                        data.design.name = newName;
                        hadChanges = true;
                    }
                    if (newDesc !== data.design.description) {
                        data.design.description = newDesc;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        $timeout(function () {
                            updateListener({id: id, type: 'update', data: data.design});
                        });
                    }
                },
                onUnload = function (id) {
                    $timeout(function () {
                        updateListener({id: id, type: 'unload', data: null});
                    });
                };
            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, designId)
                    .then(function (designNode) {
                        data.meta = meta;
                        data.design = {
                            id: designId,
                            name: designNode.getAttribute('name'),
                            description: designNode.getAttribute('INFO'),
                            node: designNode
                        };
                        designNode.onUpdate(onUpdate);
                        designNode.onUnload(onUnload);
                        deferred.resolve(data);
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches all containers (existence and their attributes) of a workspace.
         * @param parentContext - context of controller.
         * @param workspaceId
         * @param updateListener - invoked when there are (filtered) changes in data. Data is an object in data.designs.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchDesigns = function (parentContext, workspaceId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchDesigns',
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    designs: {} // design {id: <string>, name: <string>, description: <string>}
                },
                onUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDesc = this.getAttribute('INFO'),
                        hadChanges = false;
                    if (newName !== data.designs[id].name) {
                        data.designs[id].name = newName;
                        hadChanges = true;
                    }
                    if (newDesc !== data.designs[id].description) {
                        data.designs[id].description = newDesc;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        $timeout(function () {
                            updateListener({id: id, type: 'update', data: data.designs[id]});
                        });
                    }
                },
                onUnload = function (id) {
                    delete data.designs[id];
                    $timeout(function () {
                        updateListener({id: id, type: 'unload', data: null});
                    });
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            designId,
                            queueList = [],
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ADMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.Container)) {
                                designId = childNode.getId();
                                data.designs[designId] = {
                                    id: designId,
                                    name: childNode.getAttribute('name'),
                                    description: childNode.getAttribute('INFO')
                                };
                                childNode.onUnload(onUnload);
                                childNode.onUpdate(onUpdate);
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ADMFolder)) {
                                watchFromFolderRec(newChild, meta);
                            } else if (newChild.isMetaTypeOf(meta.Container)) {
                                designId = newChild.getId();
                                data.designs[designId] = {
                                    id: designId,
                                    name: newChild.getAttribute('name'),
                                    description: newChild.getAttribute('INFO')
                                };
                                newChild.onUnload(onUnload);
                                newChild.onUpdate(onUpdate);
                                $timeout(function () {
                                    updateListener({id: designId, type: 'load', data: data.designs[designId]});
                                });
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.ADMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ADMFolder)) {
                                    watchFromFolderRec(newChild, meta);
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches all containers (existence and their attributes) of a workspace.
         * @param {object} parentContext - context of controller.
         * @param {string} designId
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNbrOfConfigurations = function (parentContext, designId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchNbrOfConfigurations_' + designId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    counters: {
                        sets: 0,
                        configurations: 0,
                        results: 0
                    }
                },
                watchConfiguration = function (cfgNode, meta, wasCreated) {
                    var cfgDeferred = $q.defer(),
                        resultOnUnload = function (id) {
                            data.counters.results -= 1;
                            $timeout(function () {
                                updateListener({id: id, type: 'unload', data: data});
                            });
                        };
                    // Count this set and add an unload handle.
                    data.counters.configurations += 1;
                    if (wasCreated) {
                        $timeout(function () {
                            updateListener({id: cfgNode.getId(), type: 'load', data: data});
                        });
                    }
                    cfgNode.onUnload(function (id) {
                        data.counters.configurations -= 1;
                        $timeout(function () {
                            updateListener({id: id, type: 'unload', data: data});
                        });
                    });
                    cfgNode.loadChildren().then(function (children) {
                        var i,
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.Result)) {
                                data.counters.results += 1;
                                childNode.onUnload(resultOnUnload);
                            }
                        }
                        cfgNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.Result)) {
                                data.counters.results += 1;
                                $timeout(function () {
                                    updateListener({id: newChild.getId(), type: 'load', data: data});
                                });
                                newChild.onUnload(resultOnUnload);
                            }
                        });
                        cfgDeferred.resolve();
                    });

                    return cfgDeferred.promise;
                },
                watchConfigurationSet = function (setNode, meta, wasCreated) {
                    var setDeferred = $q.defer();
                    // Count this set and add an unload handle.
                    data.counters.sets += 1;
                    if (wasCreated) {
                        $timeout(function () {
                            updateListener({id: setNode.getId(), type: 'load', data: data});
                        });
                    }
                    setNode.onUnload(function (id) {
                        data.counters.sets -= 1;
                        $timeout(function () {
                            updateListener({id: id, type: 'unload', data: data});
                        });
                    });
                    setNode.loadChildren().then(function (children) {
                        var i,
                            queueList = [],
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.DesertConfiguration)) {
                                queueList.push(watchConfiguration(childNode, meta));
                            }
                        }
                        setNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.DesertConfiguration)) {
                                watchConfiguration(newChild, meta, true);
                            }
                        });
                        if (queueList.length === 0) {
                            setDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                setDeferred.resolve();
                            });
                        }
                    });

                    return setDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, designId)
                    .then(function (designNode) {
                        designNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.DesertConfigurationSet)) {
                                    queueList.push(watchConfigurationSet(childNode, meta));
                                }
                            }
                            designNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.DesertConfigurationSet)) {
                                    watchConfigurationSet(newChild, meta, true);
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches a design(space) w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param designId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchInterfaces = function (parentContext, designId, updateListener) {
            return baseCyPhyService.watchInterfaces(watchers, parentContext, designId, updateListener);
        };

        /**
         *  Watches the full hierarchy of a design w.r.t. containers and components.
         * @param {object} parentContext - context of controller.
         * @param {string} designId - path to root container.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchDesignStructure = function (parentContext, designId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchDesignStructure_' + designId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    rootId: designId,
                    containers: {}, // container: {id: <string>, name: <string>, parentId: <string>, type: <string>,
                                    //             subContainers: {id:<string>: <container>},
                                    //             components:    {id:<string>: <container>}}
                    components: {}  // component: {id: <string>, name: <string>, parentId: <string>,
                                    //             , avmId: <string> }
                },
                getComponentInfo = function (node, parentId) {
                    return {
                        id: node.getId(),
                        name: node.getAttribute('name'),
                        parentId: parentId,
                        avmId: node.getAttribute('ID')
                    };
                },
                watchFromContainerRec = function (containerNode, rootContainer, meta) {
                    var recDeferred = $q.defer();
                    containerNode.loadChildren().then(function (children) {
                        var i,
                            queueList = [],
                            childNode,
                            onUnload = function (id) {
                                //updateListener({id: id, type: 'unload', data: data.count});
                            },
                            container = {
                                id: containerNode.getId(),
                                name: containerNode.getAttribute('name'),
                                type: containerNode.getAttribute('Type'),
                                subContainers: {},
                                components: {}
                            },
                            component;

                        rootContainer.subContainers[containerNode.getId()] = container;
                        data.containers[containerNode.getId()] = container;

                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.Container)) {
                                queueList.push(watchFromContainerRec(childNode, container, meta));
                            } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
                                component = getComponentInfo(childNode, container.id);
                                container.components[childNode.getId()] = component;
                                data.components[childNode.getId()] = component;
                            }
                        }

//                        containerNode.onNewChildLoaded(function (newChild) {
//                            if (newChild.isMetaTypeOf(meta.Container)) {
//                                watchFromContainerRec(newChild, container, meta).then(function () {
//                                    updateListener({id: newChild.getId(), type: 'load', data: data});
//                                });
//                            } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
//                                container[childNode.getId()] = getComponentInfo(childNode, container.id);
//                                updateListener({id: newChild.getId(), type: 'load', data: data});
//                            }
//                        });

                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, designId)
                    .then(function (rootNode) {
                        rootNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode,
                                rootContainer = {
                                    id: rootNode.getId(),
                                    name: rootNode.getAttribute('name'),
                                    type: rootNode.getAttribute('Type'),
                                    subContainers: {},
                                    components: {}
                                },
                                component;

                            data.containers[rootContainer.id] = rootContainer;
                            data.containers[rootContainer.id] = rootContainer;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.Container)) {
                                    queueList.push(watchFromContainerRec(childNode, rootContainer, meta));
                                } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
                                    component = getComponentInfo(childNode, rootContainer.id);
                                    rootContainer.components[childNode.getId()] = component;
                                    data.components[childNode.getId()] = component;
                                }
                            }
//                            rootNode.onNewChildLoaded(function (newChild) {
//                                if (newChild.isMetaTypeOf(meta.Container)) {
//                                    watchFromContainerRec(newChild, rootContainer, meta).then(function () {
//                                        updateListener({id: newChild.getId(), type: 'load', data: data});
//                                    });
//                                } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
//                                    rootContainer.components[childNode.getId()] = getComponentInfo(childNode, rootContainer.id);
//                                    updateListener({id: newChild.getId(), type: 'load', data: data});
//                                }
//
//                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches the generated DesertConfigurationSets inside a Design.
         * @param {object} parentContext - context of controller.
         * @param {string} designId - path to design of which to watch.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchConfigurationSets = function (parentContext, designId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchConfigurationSets_' + designId,
                data = {
                    regionId: regionId,
                    configurationSets: {} //configurationSet {id: <string>, name: <string>, description: <string>}
                },
                context = {
                    db: parentContext.db,
                    regionId: regionId
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, designId)
                    .then(function (designNode) {
                        data.name = designNode.getAttribute('name');
                        designNode.loadChildren(context)
                            .then(function (childNodes) {
                                var i,
                                    childId,
                                    onUpdate = function (id) {
                                        var newName = this.getAttribute('name');
                                        if (newName !== data.configurationSets[id].name) {
                                            data.configurationSets[id].name = newName;
                                            $timeout(function () {
                                                updateListener({id: id, type: 'update', data: data});
                                            });
                                        }
                                    },
                                    onUnload = function (id) {
                                        delete data.configurationSets[id];
                                        $timeout(function () {
                                            updateListener({id: id, type: 'unload', data: data});
                                        });
                                    };
                                for (i = 0; i < childNodes.length; i += 1) {
                                    if (childNodes[i].isMetaTypeOf(meta.DesertConfigurationSet)) {
                                        childId = childNodes[i].getId();
                                        data.configurationSets[childId] = {
                                            id: childId,
                                            name: childNodes[i].getAttribute('name'),
                                            description: childNodes[i].getAttribute('INFO')
                                        };
                                        childNodes[i].onUpdate(onUpdate);
                                        childNodes[i].onUnload(onUnload);
                                    }
                                }

                                designNode.onNewChildLoaded(function (newNode) {
                                    if (newNode.isMetaTypeOf(meta.DesertConfigurationSet)) {
                                        childId = newNode.getId();
                                        data.configurationSets[childId] = {
                                            id: childId,
                                            name: newNode.getAttribute('name'),
                                            description: newNode.getAttribute('INFO')
                                        };
                                        newNode.onUpdate(onUpdate);
                                        newNode.onUnload(onUnload);
                                        $timeout(function () {
                                            updateListener({id: childId, type: 'load', data: data});
                                        });
                                    }
                                });
                                deferred.resolve(data);
                            });
                    });
            });
            return deferred.promise;
        };

        /**
         *  Watches the generated DesertConfigurations inside a DesertConfigurationSets.
         * @param {object} parentContext - context of controller.
         * @param {string} configurationSetId - path to DesertConfigurationSet of which to watch.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchConfigurations = function (parentContext, configurationSetId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchConfigurations_' + configurationSetId,
                data = {
                    regionId: regionId,
                    configurations: {} //configuration {id: <string>, name: <string>, alternativeAssignments: <string>}
                },
                context = {
                    db: parentContext.db,
                    regionId: regionId
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][regionId] = context;

            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, configurationSetId)
                    .then(function (cfgSetNode) {
                        cfgSetNode.loadChildren(context)
                            .then(function (childNodes) {
                                var i,
                                    childId,
                                    onUpdate = function (id) {
                                        var newName = this.getAttribute('name'),
                                            newAltAss = this.getAttribute('AlternativeAssignments'),
                                            hadChanges = false;

                                        if (newName !== data.configurations[id].name) {
                                            data.configurations[id].name = newName;
                                            hadChanges = true;
                                        }
                                        if (newAltAss !== data.configurations[id].alternativeAssignments) {
                                            data.configurations[id].alternativeAssignments = newAltAss;
                                            hadChanges = true;
                                        }

                                        if (hadChanges) {
                                            $timeout(function () {
                                                updateListener({id: id, type: 'update', data: data.configurations[id]});
                                            });
                                        }
                                    },
                                    onUnload = function (id) {
                                        if (data.configurations[id]) {
                                            delete data.configurations[id];
                                        }
                                        $timeout(function () {
                                            updateListener({id: id, type: 'unload', data: null});
                                        });
                                    };
                                for (i = 0; i < childNodes.length; i += 1) {
                                    childId = childNodes[i].getId();
                                    if (childNodes[i].isMetaTypeOf(meta.DesertConfiguration)) {
                                        data.configurations[childId] = {
                                            id: childId,
                                            name: childNodes[i].getAttribute('name'),
                                            alternativeAssignments: childNodes[i].getAttribute('AlternativeAssignments')
                                        };
                                        childNodes[i].onUpdate(onUpdate);
                                        childNodes[i].onUnload(onUnload);
                                    }
                                }

                                cfgSetNode.onNewChildLoaded(function (newNode) {
                                    if (newNode.isMetaTypeOf(meta.DesertConfiguration)) {
                                        childId = newNode.getId();
                                        data.configurations[childId] = {
                                            id: childId,
                                            name: newNode.getAttribute('name'),
                                            alternativeAssignments: newNode.getAttribute('AlternativeAssignments')
                                        };
                                        newNode.onUpdate(onUpdate);
                                        newNode.onUnload(onUnload);
                                        $timeout(function () {
                                            updateListener({id: childId, type: 'load', data: data.configurations[childId]});
                                        });
                                    }
                                });

                                deferred.resolve(data);
                            });
                    });
            });
            return deferred.promise;
        };

        /**
         *  Watches the generated DesertConfigurationSets inside a Design.
         * @param {object} parentContext - context of controller.
         * @param {object} configuration - Configuration of which to watch.
         * @param {string} configuration.id - path to Configuration of which to watch.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         */
        this.appendWatchResults = function (parentContext, configuration) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchResults_' + configuration.id,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][regionId] = context;
            configuration.regionId = regionId;
            configuration.results = {};

            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, configuration.id)
                    .then(function (cfgNode) {
                        cfgNode.loadChildren(context)
                            .then(function (childNodes) {
                                var i,
                                    childId,
                                    hasResults = false,
                                    onUnload = function (id) {
                                        $timeout(function () {
                                            if (configuration.results[id]) {
                                                delete configuration.results[id];
                                            }
                                        });
                                    };
                                for (i = 0; i < childNodes.length; i += 1) {
                                    childId = childNodes[i].getId();
                                    if (childNodes[i].isMetaTypeOf(meta.Result)) {
                                        configuration.results[childId] = {
                                            id: childId
                                            //name: childNodes[i].getAttribute('name'),
                                        };
                                        //childNodes[i].onUpdate(onUpdate); TODO: When attributes are watch add this.
                                        childNodes[i].onUnload(onUnload);
                                        hasResults = true;
                                    }
                                }

                                cfgNode.onNewChildLoaded(function (newNode) {
                                    if (newNode.isMetaTypeOf(meta.Result)) {
                                        childId = newNode.getId();
                                        $timeout(function () {
                                            configuration.results[childId] = {
                                                id: childId
                                            };
                                        });
                                    }
                                });

                                deferred.resolve(hasResults);
                            });
                    });
            });

            return deferred.promise;
        };

        this.callSaveDesertConfigurations = function (context, setName, setDesc, configurations, designId) {
            var deferred = $q.defer(),
                config = {
                    activeNode: designId,
                    runOnServer: false,
                    pluginConfig: {
                        setData: angular.toJson({
                            name: setName,
                            description: setDesc || ''
                        }),
                        configurations: angular.toJson(configurations)
                    }
                };

            pluginService.runPlugin(context, 'SaveDesertConfigurations', config)
                .then(function (result) {
                    if (result.success) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                })
                .catch(function (reason) {
                    deferred.reject('Something went terribly wrong, ' + reason);
                });

            return deferred.promise;
        };

        this.saveConfigurationSet = function (setName, setDesc, configurations, designNode, meta) {
            var deferred = $q.defer(),
                context = designNode.context;
            nodeService.createNode(context, designNode, meta.DesertConfigurationSet, 'web-cyphy saveConfigurationSet')
                .then(function (setNode) {
                    var counter = configurations.length,
                        createConfig = function () {
                            var cfgNode;
                            counter -= 1;
                            nodeService.createNode(context, setNode, meta.DesertConfiguration, 'web-cyphy saveConfigurationSet')
                                .then(function (newNode) {
                                    var name = configurations[counter].name;
                                    cfgNode = newNode;
                                    return cfgNode.setAttribute('name', name, 'web-cyphy set name to ' + name);
                                })
                                .then(function () {
                                    var aaStr = JSON.stringify(configurations[counter].alternativeAssignments);
                                    return cfgNode.setAttribute('AlternativeAssignments', aaStr,
                                            'web-cyphy set AlternativeAssignments to ' + aaStr);
                                })
                                .then(function () {
                                    if (counter > 0) {
                                        createConfig();
                                    } else {
                                        deferred.resolve();
                                    }
                                })
                                .catch(function (reason) {
                                    deferred.reject('Problems creating configurations nodes' + reason.toString());
                                });

                        };

                    setNode.setAttribute('name', setName, 'web-cyphy set name to ' + setName)
                        .then(function () {
                            if (setDesc) {
                                setNode.setAttribute('INFO', setDesc, 'web-cyphy set INFO to ' + setDesc).
                                    then(function () {
                                        if (counter > 0) {
                                            createConfig();
                                        } else {
                                            deferred.reject('No configurations given!');
                                        }
                                    });
                            } else {
                                if (counter > 0) {
                                    createConfig();
                                } else {
                                    deferred.reject('No configurations given!');
                                }
                            }
                        });
                });

            return deferred.promise;
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function (parentContext) {
            baseCyPhyService.cleanUpAllRegions(watchers, parentContext);
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            baseCyPhyService.cleanUpRegion(watchers, parentContext, regionId);
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function (parentContext, fn) {
            baseCyPhyService.registerWatcher(watchers, parentContext, fn);
        };
    });
},{}],24:[function(require,module,exports){
/*globals angular, WebGMEGlobal, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.services')
    .service('executorService', function ($q) {
        'use strict';
        var executorClient = new WebGMEGlobal.classes.ExecutorClient();

        this.createJob = function (jobData) {
            var deferred = $q.defer();
            executorClient.createJob(jobData, function (err, jobInfo) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(jobInfo);
                }
            });

            return deferred.promise;
        };

        this.getInfo = function (jobHash) {
            var deferred = $q.defer();
            executorClient.getInfo(jobHash, function (err, jobInfo) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(jobInfo);
                }
            });

            return deferred.promise;
        };

        this.getWorkersInfo = function () {
            var deferred = $q.defer();
            executorClient.getWorkersInfo(function (err, response) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(response);
                }
            });

            return deferred.promise;
        };
    });
},{}],25:[function(require,module,exports){
/*globals angular, WebGMEGlobal, console*/


/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.services')
    .service('fileService', function ($q) {
        'use strict';
        var self = this,
            blobClient = new WebGMEGlobal.classes.BlobClient();

        //TODO: Consider making an Artifact 'Class'.
        this.createArtifact = function (name) {
            return blobClient.createArtifact(name);
        };

        this.saveArtifact = function (artifact) {
            var deferred = $q.defer();
            artifact.save(function (err, artieHash) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(artieHash);
                }
            });

            return deferred.promise;
        };

        this.getArtifact = function (hash) {
            var deferred = $q.defer();
            blobClient.getArtifact(hash, function (err, artifact) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                deferred.resolve({artifact: artifact, hash: hash});
            });
            return deferred.promise;
        };

        this.addFileToArtifact = function (artifact, fileName, content) {
            var deferred = $q.defer();
            artifact.addFile(fileName, content, function (err, hashes) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(hashes);
                }
            });

            return deferred.promise;
        };

        /**
         * Adds multiple files to given artifact.
         */
        this.addFilesToArtifact = function (artifact, files) {
            var deferred = $q.defer();
            artifact.addFiles(files, function (err, hashes) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(hashes);
                }
            });

            return deferred.promise;
        };

        this.addFileAsSoftLinkToArtifact = function (artifact, fileName, content) {
            var deferred = $q.defer();

            artifact.addFileAsSoftLink(fileName, content, function (err, hash) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(hash);
                }
            });

            return deferred.promise;
        };

        this.getMetadata = function (hash) {
//        Example of returned data.
//        {
//            "name": "tbAsset.zip",
//            "size": 103854,
//            "mime": "application/zip",
//            "isPublic": false,
//            "tags": [],
//            "content": "2357fbd673bec6e9590ee8ba34ec8df8a85ddaf8",
//            "contentType": "object",
//            "lastModified": "2014-11-09T00:21:22.000Z"
//        }
            var deferred = $q.defer();
            blobClient.getMetadata(hash, function (err, metaData) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(metaData);
                }
            });

            return deferred.promise;
        };

        this.getObject = function (hash) {
            var deferred = $q.defer();
            blobClient.getObject(hash, function (err, content) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(content);
                }
            });

            return deferred.promise;
        };

        /**
         * Returns the download url for the given hash.
         * @param {string} hash - hash to blob file.
         * @returns {string} - the download url (null if hash is empty).
         */
        this.getDownloadUrl = function (hash) {
            var url;
            if (hash) {
                url = blobClient.getDownloadURL(hash);
            } else {
                console.warn('No hash to blob file given');
                url = null;
            }

            return url;
        };

        /**
         * Returns the file extension of the given filename.
         * @param {string} filename
         * @returns {string} - the resulting file extension.
         */
        this.getFileExtension = function (filename) {
            var a = filename.split(".");
            if (a.length === 1 || (a[0] === "" && a.length === 2)) {
                return "";
            }
            return a.pop().toLowerCase();
        };

        /**
         * Formats the size into a human readable string.
         * @param {number} bytes - size in bytes.
         * @param {boolean} si - return result in SIUnits or not.
         * @returns {string} - formatted file size.
         */
        this.humanFileSize = function (bytes, si) {
            var thresh = si ? 1000 : 1024,
                units,
                u;
            if (bytes < thresh) {
                return bytes + ' B';
            }

            units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] :
                    ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
            u = -1;

            do {
                bytes = bytes / thresh;
                u += 1;
            } while (bytes >= thresh);

            return bytes.toFixed(1) + ' ' + units[u];
        };

        // WebCyPhySpecific functions.

        /**
         * TODO: This method should use promises internally!
         * @param files
         * @param validExtensions
         * @returns {*}
         */
        this.saveDroppedFiles = function (files, validExtensions) {
            var deferred = $q.defer(),
                i,
                counter = files.length,
                artie = blobClient.createArtifact('droppedFiles'),
                addFile,
                addedFiles = [],
                updateCounter = function () {
                    counter -= 1;
                    if (counter <= 0) {
                        deferred.resolve(addedFiles);
                    }
                };

            counter = files.length;

            addFile = function (file) {
                var fileExtension = self.getFileExtension(file.name);
                if (!validExtensions || validExtensions[fileExtension]) {
                    artie.addFileAsSoftLink(file.name, file, function (err, hash) {
                        if (err) {
                            console.error('Could not add file "' + file.name + '" to blob, err: ' + err);
                            updateCounter();
                            return;
                        }
                        addedFiles.push({
                            hash: hash,
                            name: file.name,
                            type: fileExtension,
                            size: self.humanFileSize(file.size, true),
                            url: blobClient.getDownloadURL(hash)
                        });
                        updateCounter();
                    });
                } else {
                    updateCounter();
                }
            };
            for (i = 0; i < files.length; i += 1) {
                addFile(files[i]);
            }

            return deferred.promise;
        };
    });
},{}],26:[function(require,module,exports){
/*globals angular, WebGMEGlobal, console*/


/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.services')
    .service('pluginService', function ($q, dataStoreService, fileService) {
        'use strict';

        /**
         *
         * @param {object} context
         * @param {string} context.db
         * @param {string} pluginName - Name of plugin to execute.
         * @param {object} config - Object with plugin configuration.
         * @param {object.string} config.activeNode - Path to activeNode.
         * @param {object.Array.<string>} config.activeSelection - Paths to nodes in activeSelection.
         * @param {object.boolean} config.runOnServer - Whether to run the plugin on the server or not.
         * @param {object.object} config.pluginConfig - Plugin specific options.
         */
        this.runPlugin = function (context, pluginName, config) {
            var deferred = $q.defer(),
                dbConn = dataStoreService.getDatabaseConnection(context.db),
                interpreterManager = new WebGMEGlobal.classes.InterpreterManager(dbConn.client);

            interpreterManager.run(pluginName, config, function (result) {
                if (result) {
                    deferred.resolve(result);
                } else {
                    deferred.reject('No Result was return from plugin execution!');
                }
            });

            return deferred.promise;
        };

        this.getPluginArtifactsHtml = function (artieHashes) {
            var deferred = $q.defer(),
                queueList = [],
                i;

            for (i = 0; i < artieHashes.length; i += 1) {
                queueList.push(fileService.getArtifact(artieHashes[i]));
            }

            if (queueList.length === 0) {
                deferred.resolve('');
            } else {
                $q.all(queueList).then(function (artifactsInfo) {
                    var j,
                        downloadUrl,
                        artieName,
                        artifactsHtml = '';
                    for (j = 0; j < artifactsInfo.length; j += 1) {
                        downloadUrl = fileService.getDownloadUrl(artifactsInfo[j].hash);
                        artieName = artifactsInfo[j].artifact.name;
                        artifactsHtml += '<br> <a href="' + downloadUrl + '">' + artieName + '</a>';
                    }
                    deferred.resolve(artifactsHtml);
                });
            }

            return deferred.promise;
        };
    });
},{}],27:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.services')
    .service('testBenchService', function ($q, $timeout, $modal, nodeService, baseCyPhyService, pluginService) {
        'use strict';
        var self = this,
            watchers = {};

        this.editTestBenchFn = function (data) {
            var modalInstance = $modal.open({
                templateUrl: '/cyphy-components/templates/TestBenchEdit.html',
                controller: 'TestBenchEditController',
                //size: size,
                resolve: { data: function () { return data; } }
            });

            modalInstance.result.then(function (editedData) {
                var attrs = { };
                if (editedData.description !== data.testBench.description) {
                    attrs.INFO = editedData.description;
                }
                if (editedData.name !== data.testBench.title) {
                    attrs.name = editedData.name;
                }
                if (editedData.fileInfo.hash !== data.testBench.data.files) {
                    attrs.TestBenchFiles = editedData.fileInfo.hash;
                }
                if (editedData.path !== data.testBench.data.path) {
                    attrs.ID = editedData.path;
                }

                self.setTestBenchAttributes(data.editContext, data.id, attrs)
                    .then(function () {
                        console.log('Attribute(s) updated');
                    });
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        this.deleteFn = function (data) {
            var modalInstance = $modal.open({
                templateUrl: '/cyphy-components/templates/SimpleModal.html',
                controller: 'SimpleModalController',
                resolve: {
                    data: function () {
                        return {
                            title: 'Delete Test Bench',
                            details: 'This will delete ' + data.name + ' from the workspace.'
                        };
                    }
                }
            });

            modalInstance.result.then(function () {
                self.deleteTestBench(data.context, data.id);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        /**
         * Removes the test bench from the context.
         * @param {object} context - context of controller.
         * @param {string} context.db - data-base connection.
         * @param {string} testBenchId - Path to design-space.
         * @param [msg] - Commit message.
         */
        this.deleteTestBench = function (context, testBenchId, msg) {
            var message = msg || 'testBenchService.deleteTestBench ' + testBenchId;
            nodeService.destroyNode(context, testBenchId, message);
        };

        this.exportTestBench = function (testBenchId) {
            throw new Error('Not implemented.');
        };

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the test bench.
         * @param {string} context.db - Must exist within watchers and contain the test bench.
         * @param {string} context.regionId - Must exist within watchers and contain the test bench.
         * @param {string} testBenchId - Path to test bench.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setTestBenchAttributes = function (context, testBenchId, attrs) {
            return baseCyPhyService.setNodeAttributes(context, testBenchId, attrs);
        };

        this.runTestBench = function (context, testBenchId, configurationId) {
            var deferred = $q.defer(),
                config = {
                    activeNode: testBenchId,
                    runOnServer: true,
                    pluginConfig: {
                        run: true,
                        save: true,
                        configurationPath: configurationId
                    }
                };
            //console.log(JSON.stringify(config));
            pluginService.runPlugin(context, 'TestBenchRunner', config)
                .then(function (result) {
                    var resultLight = {
                        success: result.success,
                        artifactsHtml: '',
                        messages: result.messages
                    };
                    console.log("Result", result);
                    pluginService.getPluginArtifactsHtml(result.artifacts)
                        .then(function (artifactsHtml) {
                            resultLight.artifactsHtml = artifactsHtml;
                            deferred.resolve(resultLight);
                        });
                })
                .catch(function (reason) {
                    deferred.reject('Something went terribly wrong, ' + reason);
                });

            return deferred.promise;
        };

        this.watchTestBenchNode = function (parentContext, testBenchId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchTestBench',
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    meta: null, // META nodes - needed when creating new nodes...
                    testBench: {} // {id: <string>, name: <string>, description: <string>, node <NodeObj>}
                },
                onUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDesc = this.getAttribute('INFO'),
                        newPath = this.getAttribute('ID'),
                        newResults = this.getAttribute('Results'),
                        newFiles = this.getAttribute('TestBenchFiles'),
                        newTlsut = this.getPointer('TopLevelSystemUnderTest').to,
                        hadChanges = false,
                        tlsutChanged = false;
                    if (newName !== data.testBench.name) {
                        data.testBench.name = newName;
                        hadChanges = true;
                    }
                    if (newDesc !== data.testBench.description) {
                        data.testBench.description = newDesc;
                        hadChanges = true;
                    }
                    if (newPath !== data.testBench.path) {
                        data.testBench.path = newPath;
                        hadChanges = true;
                    }
                    if (newResults !== data.testBench.results) {
                        data.testBench.results = newResults;
                        hadChanges = true;
                    }
                    if (newFiles !== data.testBench.files) {
                        data.testBench.files = newFiles;
                        hadChanges = true;
                    }
                    if (newTlsut !== data.testBench.tlsutId) {
                        data.testBench.tlsutId = newTlsut;
                        hadChanges = true;
                        tlsutChanged = true;
                    }
                    if (hadChanges) {
                        $timeout(function () {
                            updateListener({id: id, type: 'update', data: data.testBench, tlsutChanged: tlsutChanged});
                        });
                    }
                },
                onUnload = function (id) {
                    $timeout(function () {
                        updateListener({id: id, type: 'unload', data: null});
                    });
                };
            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, testBenchId)
                    .then(function (testBenchNode) {
                        data.meta = meta;
                        data.testBench = {
                            id: testBenchId,
                            name: testBenchNode.getAttribute('name'),
                            description: testBenchNode.getAttribute('INFO'),
                            path: testBenchNode.getAttribute('ID'),
                            results: testBenchNode.getAttribute('Results'),
                            files: testBenchNode.getAttribute('TestBenchFiles'),
                            tlsutId: testBenchNode.getPointer('TopLevelSystemUnderTest').to,
                            node: testBenchNode
                        };
                        testBenchNode.onUpdate(onUpdate);
                        testBenchNode.onUnload(onUnload);
                        deferred.resolve(data);
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches all test-benches (existence and their attributes) of a workspace.
         * @param {object} parentContext - context of controller.
         * @param {string} workspaceId - Path to workspace that should be watched.
         * @param {function} updateListener - invoked when there are (filtered) changes in data. Data is an object in data.testBenches.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchTestBenches = function (parentContext, workspaceId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchTestBenches',
                context = {
                    db: parentContext.db,
                    projectId: parentContext.projectId,
                    branchId: parentContext.branchId,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    testBenches: {} // testBench {id: <string>, name: <string>, description: <string>,
                                    //            path: <string>, results: <hash|string>, files: <hash|string> }
                },
                onUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDesc = this.getAttribute('INFO'),
                        newPath = this.getAttribute('ID'),
                        newResults = this.getAttribute('Results'),
                        newFiles = this.getAttribute('TestBenchFiles'),
                        hadChanges = false;
                    if (newName !== data.testBenches[id].name) {
                        data.testBenches[id].name = newName;
                        hadChanges = true;
                    }
                    if (newDesc !== data.testBenches[id].description) {
                        data.testBenches[id].description = newDesc;
                        hadChanges = true;
                    }
                    if (newPath !== data.testBenches[id].path) {
                        data.testBenches[id].path = newPath;
                        hadChanges = true;
                    }
                    if (newResults !== data.testBenches[id].results) {
                        data.testBenches[id].results = newResults;
                        hadChanges = true;
                    }
                    if (newFiles !== data.testBenches[id].files) {
                        data.testBenches[id].files = newFiles;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        $timeout(function () {
                            updateListener({id: id, type: 'update', data: data.testBenches[id]});
                        });
                    }
                },
                onUnload = function (id) {
                    delete data.testBenches[id];
                    $timeout(function () {
                        updateListener({id: id, type: 'unload', data: null});
                    });
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            testBenchId,
                            queueList = [],
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ATMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.AVMTestBenchModel)) {
                                testBenchId = childNode.getId();
                                data.testBenches[testBenchId] = {
                                    id: testBenchId,
                                    name: childNode.getAttribute('name'),
                                    description: childNode.getAttribute('INFO'),
                                    path: childNode.getAttribute('ID'),
                                    results: childNode.getAttribute('Results'),
                                    files: childNode.getAttribute('TestBenchFiles')
                                };
                                childNode.onUnload(onUnload);
                                childNode.onUpdate(onUpdate);
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ATMFolder)) {
                                watchFromFolderRec(newChild, meta);
                            } else if (newChild.isMetaTypeOf(meta.AVMTestBenchModel)) {
                                testBenchId = newChild.getId();
                                data.testBenches[testBenchId] = {
                                    id: testBenchId,
                                    name: newChild.getAttribute('name'),
                                    description: newChild.getAttribute('INFO'),
                                    path: newChild.getAttribute('ID'),
                                    results: newChild.getAttribute('Results'),
                                    files: newChild.getAttribute('TestBenchFiles')
                                };
                                newChild.onUnload(onUnload);
                                newChild.onUpdate(onUpdate);
                                $timeout(function () {
                                    updateListener({id: testBenchId, type: 'load', data: data.testBenches[testBenchId]});
                                });
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.ATMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ATMFolder)) {
                                    watchFromFolderRec(newChild, meta);
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches a test-bench w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param testBenchId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchTestBenchDetails = function (parentContext, testBenchId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchTestBenchDetails_' + testBenchId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    containerIds: [],
                    tlsut: null
                },
                onUnload = function (id) {
                    var index = data.containerIds.indexOf(id);
                    if (index > -1) {
                        data.containerIds.splice(index, 1);
                        $timeout(function () {
                            updateListener({id: id, type: 'unload', data: data});
                        });
                    }
                };
            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, testBenchId)
                    .then(function (testBenchNode) {
                        testBenchNode.loadChildren()
                            .then(function (children) {
                                var i;
                                for (i = 0; i < children.length; i += 1) {
                                    if (children[i].isMetaTypeOf(meta.Container)) {
                                        data.containerIds.push(children[i].getId());
                                        children[i].onUnload(onUnload);
                                    }
                                }
                                testBenchNode.onNewChildLoaded(function (newChild) {
                                    data.containerIds.push(newChild.getId());
                                    newChild.onUnload(onUnload);
                                    $timeout(function () {
                                        updateListener({id: newChild.getId(), type: 'load', data: data});
                                    });
                                });
                                deferred.resolve(data);
                            });
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches a test-bench w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param containerId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchInterfaces = function (parentContext, containerId, updateListener) {
            return baseCyPhyService.watchInterfaces(watchers, parentContext, containerId, updateListener);
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function (parentContext) {
            baseCyPhyService.cleanUpAllRegions(watchers, parentContext);
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            baseCyPhyService.cleanUpRegion(watchers, parentContext, regionId);
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function (parentContext, fn) {
            baseCyPhyService.registerWatcher(watchers, parentContext, fn);
        };
    });
},{}],28:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module('cyphy.services')
    .service('workspaceService', function ($q, $timeout, nodeService, baseCyPhyService, pluginService, fileService) {
        'use strict';
        var self = this,
            watchers = {};

        this.createWorkspace = function (context, name, desc) {
            var deferred = $q.defer(),
                meta;
            nodeService.getMetaNodes(context)
                .then(function (metaNodes) {
                    meta = metaNodes;
                    return nodeService.createNode(context, '', meta.WorkSpace, '[WebCyPhy] - WorkspaceService.createWorkspace');
                })
                .then(function (wsNode) {
                    var acmFolderId,
                        admFolderId,
                        atmFolderId,
                        createFolderNodes = function () {
                            var parentId = wsNode.getId(),
                                baseId = meta.ACMFolder.getId();
                            nodeService.createNode(context, parentId, baseId, '[WebCyPhy] - create ACMFolder')
                                .then(function (acmNode) {
                                    acmFolderId = acmNode.getId();
                                    baseId = meta.ADMFolder.getId();
                                    return nodeService.createNode(context, parentId, baseId, '[WebCyPhy] - create ADMFolder');
                                })
                                .then(function (admNode) {
                                    admFolderId = admNode.getId();
                                    baseId = meta.ATMFolder.getId();
                                    return nodeService.createNode(context, parentId, baseId, '[WebCyPhy] - create ATMFolder');
                                })
                                .then(function (atmNode) {
                                    atmFolderId = atmNode.getId();
                                    deferred.resolve({ acm: acmFolderId, adm: admFolderId, atm: atmFolderId });
                                })
                                .catch(function (reason) {
                                    deferred.reject(reason);
                                });
                        };

                    wsNode.setAttribute('name', name, '[WebCyPhy] - set name to ' + name)
                        .then(function () {
                            if (desc) {
                                wsNode.setAttribute('INFO', desc, '[WebCyPhy] - set INFO to ' + desc)
                                    .then(function () {
                                        createFolderNodes();
                                    });
                            } else {
                                createFolderNodes();
                            }
                        });
                })
                .catch(function (reason) {
                    deferred.reject(reason);
                });

            return deferred.promise;
        };

        this.importFiles = function (context, folderIds, files) {
            var deferred = $q.defer(),
                i,
                counter,
                total,
                fs = {
                    acms: [],
                    adms: [],
                    atms: []
                },
                importAcmRec,
                importAdmRec,
                importAtmRec,
                getNotify;

            importAcmRec = function () {
                counter -= 1;
                if (counter >= 0) {
                    self.callAcmImporter(context, folderIds.acm, fs.acms[counter])
                        .then(getNotify(fs.acms[counter], 'acm'), getNotify(fs.acms[counter]), 'acm');
                } else {
                    total = fs.adms.length;
                    counter = total;
                    importAdmRec();
                }
            };
            importAdmRec = function () {
                counter -= 1;
                if (counter >= 0) {
                    self.callAdmImporter(context, folderIds.adm, fs.adms[counter])
                        .then(getNotify(fs.adms[counter], 'adm'), getNotify(fs.adms[counter]), 'adm');
                } else {
                    total = fs.atms.length;
                    counter = total;
                    importAtmRec();
                }
            };
            importAtmRec = function () {
                counter -= 1;
                if (counter >= 0) {
                    self.callAtmImporter(context, folderIds.atm, fs.atms[counter])
                        .then(getNotify(fs.atms[counter], 'atm'), getNotify(fs.atms[counter], 'atm'));
                } else {
                    deferred.resolve();
                }
            };
            getNotify = function (fInfo, type) {
                return function (result) {
                    if (angular.isString(result) === false && result.success === true) {
                        deferred.notify({type: 'success', message: '<a href="' + fInfo.url + '">' + fInfo.name +
                            '</a>' + ' imported. ' + '[' + (total - counter) + '/' + total + ']'});
                    } else {
                        deferred.notify({type: 'error', message: '<a href="' + fInfo.url + '">' + fInfo.name +
                            '</a>' + ' failed to be imported, see console details.' +
                            '[' + (total - counter) + '/' + total + ']'});
                        if (angular.isString(result)) {
                            console.error(result);
                        } else {
                            console.error(angular.toJson(result.messages, true));
                        }
                    }
                    if (type === 'acm') {
                        importAcmRec();
                    } else if (type === 'adm') {
                        importAdmRec();
                    } else if (type === 'atm') {
                        importAtmRec();
                    } else {
                        deferred.reject('Unexpected import type ' + type);
                    }
                };
            };
            // hash: "3636ead0785ca166f3b11193c4b2e5a670801eb1" name: "Damper.zip" size: "1.4 kB" type: "zip"
            // url: "/rest/blob/download/3636ead0785ca166f3b11193c4b2e5a670801eb1"
            for (i = 0; i < files.length; i += 1) {
                if (files[i].type === 'zip') {
                    fs.acms.push(files[i]);
                } else if (files[i].type === 'adm') {
                    fs.adms.push(files[i]);
                } else if (files[i].type === 'atm') {
                    fs.atms.push(files[i]);
                }
            }

            total = fs.acms.length;
            counter = total;
            importAcmRec();

            return deferred.promise;
        };

        this.callAcmImporter = function (context, folderId, fileInfo) {
            var deferred = $q.defer(),
                config = {
                    activeNode: folderId,
                    runOnServer: false,
                    pluginConfig: {
                        UploadedFile: fileInfo.hash,
                        DeleteExisting: true
                    }
                };

            pluginService.runPlugin(context, 'AcmImporter', config)
                .then(function (result) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ACM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    deferred.resolve(result);
                })
                .catch(function (reason) {
                    deferred.reject('Something went terribly wrong, ' + reason);
                });

            return deferred.promise;
        };

        this.callAdmImporter = function (context, folderId, fileInfo) {
            var deferred = $q.defer(),
                config = {
                    activeNode: folderId,
                    runOnServer: false,
                    pluginConfig: {
                        admFile: fileInfo.hash
                    }
                };

            pluginService.runPlugin(context, 'AdmImporter', config)
                .then(function (result) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ADM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    deferred.resolve(result);
                })
                .catch(function (reason) {
                    deferred.reject('Something went terribly wrong, ' + reason);
                });

            return deferred.promise;
        };

        this.callAtmImporter = function (context, folderId, fileInfo) {
            var deferred = $q.defer(),
                config = {
                    activeNode: folderId,
                    runOnServer: false,
                    pluginConfig: {
                        atmFile: fileInfo.hash
                    }
                };

            pluginService.runPlugin(context, 'AtmImporter', config)
                .then(function (result) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ATM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    deferred.resolve(result);
                })
                .catch(function (reason) {
                    deferred.reject('Something went terribly wrong, ' + reason);
                });

            return deferred.promise;
        };

        /**
         * Calls ExportWorkspace.
         * @param {object} context - Context for plugin.
         * @param {string} context.db - Database connection to pull model from.
         * @param {string} workspaceId
         * @returns {Promise} - resolves to download url if successful.
         */
        this.exportWorkspace = function (context, workspaceId) {
            var deferred = $q.defer(),
                config = {
                    activeNode: workspaceId,
                    runOnServer: false,
                    pluginConfig: { }
                };

            pluginService.runPlugin(context, 'ExportWorkspace', config)
                .then(function (result) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ADM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    if (result.success) {
                        console.log(result);
                        deferred.resolve(fileService.getDownloadUrl(result.artifacts[0]));
                    } else {
                        if (result.error) {
                            deferred.reject(result.error + ' messages: ' + angular.toJson(result.messages));
                        } else {
                            deferred.reject(angular.toJson(result.messages));
                        }
                    }
                })
                .catch(function (reason) {
                    deferred.reject('Something went terribly wrong ' + reason);
                });

            return deferred.promise;

        };

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the design.
         * @param {string} context.db - Must exist within watchers and contain the design.
         * @param {string} context.regionId - Must exist within watchers and contain the design.
         * @param {string} workspaceId - Path to workspace.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setWorkspaceAttributes = function (context, workspaceId, attrs) {
            return baseCyPhyService.setNodeAttributes(context, workspaceId, attrs);
        };

        /**
         * Removes the workspace from the context.
         * @param {object} context - context of controller.
         * @param {string} context.db - data-base connection.
         * @param {string} workspaceId - Path to workspace.
         * @param [msg] - Commit message.
         */
        this.deleteWorkspace = function (context, workspaceId, msg) {
            var message = msg || 'WorkspaceService.deleteWorkspace ' + workspaceId;
            nodeService.destroyNode(context, workspaceId, message);
        };

        // TODO: make sure the methods below gets resolved at error too.
        /**
         * Keeps track of the work-spaces defined in the root-node w.r.t. existence and attributes.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is an object in data.workspaces.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchWorkspaces = function (parentContext, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchWorkspaces',
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    workspaces: {} // workspace = {id: <string>, name: <string>, description: <string>}
                },
                onUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDesc = this.getAttribute('INFO'),
                        hadChanges = false;
                    if (newName !== data.workspaces[id].name) {
                        data.workspaces[id].name = newName;
                        hadChanges = true;
                    }
                    if (newDesc !== data.workspaces[id].description) {
                        data.workspaces[id].description = newDesc;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        $timeout(function () {
                            updateListener({id: id, type: 'update', data: data.workspaces[id]});
                        });
                    }
                },
                onUnload = function (id) {
                    delete data.workspaces[id];
                    $timeout(function () {
                        updateListener({id: id, type: 'unload', data: null});
                    });
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, '')
                    .then(function (rootNode) {
                        rootNode.loadChildren().then(function (children) {
                            var i,
                                childNode,
                                wsId;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.WorkSpace)) {
                                    wsId = childNode.getId();
                                    data.workspaces[wsId] = {
                                        id: wsId,
                                        name: childNode.getAttribute('name'),
                                        description: childNode.getAttribute('INFO')
                                    };
                                    childNode.onUpdate(onUpdate);
                                    childNode.onUnload(onUnload);
                                }
                            }
                            rootNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.WorkSpace)) {
                                    wsId = newChild.getId();
                                    data.workspaces[wsId] = {
                                        id: wsId,
                                        name: newChild.getAttribute('name'),
                                        description: newChild.getAttribute('INFO')
                                    };
                                    newChild.onUpdate(onUpdate);
                                    newChild.onUnload(onUnload);
                                    $timeout(function () {
                                        updateListener({id: wsId, type: 'load', data: data.workspaces[wsId]});
                                    });
                                }
                            });
                            deferred.resolve(data);
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         * Keeps track of the number of components (defined in ACMFolders) in the workspace.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {string} workspaceId
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is the updated data.count.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNumberOfComponents = function (parentContext, workspaceId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchNumberOfComponents_' + workspaceId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    count: 0
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            queueList = [],
                            childNode,
                            onUnload = function (id) {
                                data.count -= 1;
                                $timeout(function () {
                                    updateListener({id: id, type: 'unload', data: data.count});
                                });
                            };
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ACMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
                                data.count += 1;
                                childNode.onUnload(onUnload);
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ACMFolder)) {
                                watchFromFolderRec(newChild, meta).then(function () {
                                    $timeout(function () {
                                        updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                    });
                                });
                            } else if (newChild.isMetaTypeOf(meta.AVMComponentModel)) {
                                data.count += 1;
                                newChild.onUnload(onUnload);
                                $timeout(function () {
                                    updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                });
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.ACMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ACMFolder)) {
                                    watchFromFolderRec(newChild, meta).then(function () {
                                        $timeout(function () {
                                            updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                        });
                                    });
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         * Keeps track of the number of containers (defined in ADMFolders) in the workspace.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {string} workspaceId
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is the updated data.count.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNumberOfDesigns = function (parentContext, workspaceId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchNumberOfDesigns_' + workspaceId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    count: 0
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            queueList = [],
                            childNode,
                            onUnload = function (id) {
                                data.count -= 1;
                                $timeout(function () {
                                    updateListener({id: id, type: 'unload', data: data.count});
                                });
                            };
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ADMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.Container)) {
                                data.count += 1;
                                childNode.onUnload(onUnload);
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ADMFolder)) {
                                watchFromFolderRec(newChild, meta).then(function () {
                                    $timeout(function () {
                                        updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                    });
                                });
                            } else if (newChild.isMetaTypeOf(meta.Container)) {
                                data.count += 1;
                                newChild.onUnload(onUnload);
                                $timeout(function () {
                                    updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                });
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };

            if (watchers.hasOwnProperty(parentContext.regionId) === false) {
                console.error(parentContext.regionId + ' is not a registered watcher! ' +
                    'Use "this.registerWatcher" before trying to access Node Objects.');
            }
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.ADMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ADMFolder)) {
                                    watchFromFolderRec(newChild, meta).then(function () {
                                        $timeout(function () {
                                            updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                        });
                                    });
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         * Keeps track of the number of test-benches (defined in ATMFolders) in the workspace.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {string} workspaceId
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is the updated data.count.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNumberOfTestBenches = function (parentContext, workspaceId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchNumberOfTestBenches_' + workspaceId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    count: 0
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            queueList = [],
                            childNode,
                            onUnload = function (id) {
                                data.count -= 1;
                                $timeout(function () {
                                    updateListener({id: id, type: 'unload', data: data.count});
                                });
                            };
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ATMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.AVMTestBenchModel)) {
                                data.count += 1;
                                childNode.onUnload(onUnload);
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ATMFolder)) {
                                watchFromFolderRec(newChild, meta).then(function () {
                                    $timeout(function () {
                                        updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                    });
                                });
                            } else if (newChild.isMetaTypeOf(meta.AVMTestBenchModel)) {
                                data.count += 1;
                                newChild.onUnload(onUnload);
                                $timeout(function () {
                                    updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                });
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.ATMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ATMFolder)) {
                                    watchFromFolderRec(newChild, meta).then(function () {
                                        $timeout(function () {
                                            updateListener({id: newChild.getId(), type: 'load', data: data.count});
                                        });
                                    });
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function (parentContext) {
            baseCyPhyService.cleanUpAllRegions(watchers, parentContext);
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            baseCyPhyService.cleanUpRegion(watchers, parentContext, regionId);
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function (parentContext, fn) {
            baseCyPhyService.registerWatcher(watchers, parentContext, fn);
        };

        this.logContext = function (context) {
            nodeService.logContext(context);
        };
    });
},{}],29:[function(require,module,exports){
/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.services', ['gme.services']);
require('./BaseCyPhyService');
require('./PluginService');
require('./FileService');
require('./ExecutorService');
require('./WorkspaceService');
require('./ComponentService');
require('./DesignService');
require('./TestBenchService');
require('./DesertService');
},{"./BaseCyPhyService":20,"./ComponentService":21,"./DesertService":22,"./DesignService":23,"./ExecutorService":24,"./FileService":25,"./PluginService":26,"./TestBenchService":27,"./WorkspaceService":28}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvbGlicmFyeS9jeXBoeS1jb21wb25lbnRzLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL2FkYXB0LXN0cmFwL2Rpc3QvYWRhcHQtc3RyYXAuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvYWRhcHQtc3RyYXAvZGlzdC9hZGFwdC1zdHJhcC50cGwuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvYW5ndWxhci1ncm93bC9idWlsZC9hbmd1bGFyLWdyb3dsLm1pbi5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvYm93ZXJfY29tcG9uZW50cy9hbmd1bGFyLXNhbml0aXplL2FuZ3VsYXItc2FuaXRpemUuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0NvbXBvbmVudExpc3QvQ29tcG9uZW50RGV0YWlscy5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvQ29tcG9uZW50TGlzdC9Db21wb25lbnRMaXN0LmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Db25maWd1cmF0aW9uU2V0U2VsZWN0b3IvQ29uZmlndXJhdGlvblNldFNlbGVjdG9yLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Db25maWd1cmF0aW9uVGFibGUvQ29uZmlndXJhdGlvblRhYmxlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9EZXNpZ25MaXN0L0Rlc2lnbkRldGFpbHMuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0Rlc2lnbkxpc3QvRGVzaWduTGlzdC5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvRGVzaWduVHJlZS9EZXNpZ25UcmVlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9TaW1wbGVNb2RhbC9TaW1wbGVNb2RhbC5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvVGVzdEJlbmNoTGlzdC9UZXN0QmVuY2hEZXRhaWxzLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9UZXN0QmVuY2hMaXN0L1Rlc3RCZW5jaExpc3QuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L1dvcmtlcnNMaXN0L1dvcmtlcnNMaXN0LmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Xb3Jrc3BhY2VMaXN0L1dvcmtzcGFjZUxpc3QuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0Jhc2VDeVBoeVNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0NvbXBvbmVudFNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0Rlc2VydFNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0Rlc2lnblNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0V4ZWN1dG9yU2VydmljZS5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvRmlsZVNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL1BsdWdpblNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL1Rlc3RCZW5jaFNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL1dvcmtzcGFjZVNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL2N5cGh5LXNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaHZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdHFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3haQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzU5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyByZXF1aXJlLCBhbmd1bGFyICovXHJcbi8qKlxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG4vLyBFeHRlcm5hbCBkZXBlbmRlbmNpZXNcclxucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9uZy1maWxlLXVwbG9hZC9hbmd1bGFyLWZpbGUtdXBsb2FkLXNoaW0nKTtcclxucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9uZy1maWxlLXVwbG9hZC9hbmd1bGFyLWZpbGUtdXBsb2FkJyk7XHJcbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvYW5ndWxhci1ncm93bC9idWlsZC9hbmd1bGFyLWdyb3dsLm1pbicpO1xyXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL2FuZ3VsYXItc2FuaXRpemUvYW5ndWxhci1zYW5pdGl6ZScpO1xyXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL2FkYXB0LXN0cmFwL2Rpc3QvYWRhcHQtc3RyYXAnKTtcclxucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9hZGFwdC1zdHJhcC9kaXN0L2FkYXB0LXN0cmFwLnRwbCcpO1xyXG5cclxuLy8gSW50ZXJuYWwgZGVwZW5kZW5jaWVzXHJcbnJlcXVpcmUoJy4vc2VydmljZXMvY3lwaHktc2VydmljZXMnKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJywgW1xyXG4gICAgJ2N5cGh5LnNlcnZpY2VzJyxcclxuICAgICdjeXBoeS5jb21wb25lbnRzLnRlbXBsYXRlcycsXHJcbiAgICAnYW5ndWxhckZpbGVVcGxvYWQnLFxyXG4gICAgJ2FuZ3VsYXItZ3Jvd2wnLFxyXG4gICAgJ25nU2FuaXRpemUnLFxyXG4gICAgJ2FkYXB0di5hZGFwdFN0cmFwJ1xyXG5dKS5jb25maWcoWydncm93bFByb3ZpZGVyJywgZnVuY3Rpb24gKGdyb3dsUHJvdmlkZXIpIHtcclxuICAgIGdyb3dsUHJvdmlkZXIuZ2xvYmFsVGltZVRvTGl2ZSh7c3VjY2VzczogNTAwMCwgZXJyb3I6IC0xLCB3YXJuaW5nOiAyMDAwMCwgaW5mbzogNTAwMH0pO1xyXG59XSk7XHJcblxyXG5yZXF1aXJlKCcuL1NpbXBsZU1vZGFsL1NpbXBsZU1vZGFsJyk7XHJcblxyXG5yZXF1aXJlKCcuL1dvcmtzcGFjZUxpc3QvV29ya3NwYWNlTGlzdCcpO1xyXG5cclxucmVxdWlyZSgnLi9Db21wb25lbnRMaXN0L0NvbXBvbmVudERldGFpbHMnKTtcclxucmVxdWlyZSgnLi9Db21wb25lbnRMaXN0L0NvbXBvbmVudExpc3QnKTtcclxuXHJcbnJlcXVpcmUoJy4vRGVzaWduTGlzdC9EZXNpZ25EZXRhaWxzJyk7XHJcbnJlcXVpcmUoJy4vRGVzaWduTGlzdC9EZXNpZ25MaXN0Jyk7XHJcbnJlcXVpcmUoJy4vRGVzaWduVHJlZS9EZXNpZ25UcmVlJyk7XHJcblxyXG5yZXF1aXJlKCcuL1Rlc3RCZW5jaExpc3QvVGVzdEJlbmNoRGV0YWlscycpO1xyXG5yZXF1aXJlKCcuL1Rlc3RCZW5jaExpc3QvVGVzdEJlbmNoTGlzdCcpO1xyXG5cclxucmVxdWlyZSgnLi9Db25maWd1cmF0aW9uVGFibGUvQ29uZmlndXJhdGlvblRhYmxlJyk7XHJcbnJlcXVpcmUoJy4vQ29uZmlndXJhdGlvblNldFNlbGVjdG9yL0NvbmZpZ3VyYXRpb25TZXRTZWxlY3RvcicpO1xyXG5cclxucmVxdWlyZSgnLi9Xb3JrZXJzTGlzdC9Xb3JrZXJzTGlzdCcpO1xyXG5cclxuXHJcblxyXG4iLCIvKipcbiAqIGFkYXB0LXN0cmFwXG4gKiBAdmVyc2lvbiB2Mi4wLjYgLSAyMDE0LTEwLTI2XG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vQWRhcHR2L2FkYXB0LXN0cmFwXG4gKiBAYXV0aG9yIEthc2h5YXAgUGF0ZWwgKGthc2h5YXBAYWRhcC50dilcbiAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlLCBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4ndXNlIHN0cmljdCc7XG4vLyBTb3VyY2U6IG1vZHVsZS5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwJywgW1xuICAnYWRhcHR2LmFkYXB0U3RyYXAudXRpbHMnLFxuICAnYWRhcHR2LmFkYXB0U3RyYXAudHJlZWJyb3dzZXInLFxuICAnYWRhcHR2LmFkYXB0U3RyYXAudGFibGVsaXRlJyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLnRhYmxlYWpheCcsXG4gICdhZGFwdHYuYWRhcHRTdHJhcC5sb2FkaW5naW5kaWNhdG9yJyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLmRyYWdnYWJsZScsXG4gICdhZGFwdHYuYWRhcHRTdHJhcC5pbmZpbml0ZWRyb3Bkb3duJ1xuXSkucHJvdmlkZXIoJyRhZENvbmZpZycsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIGljb25DbGFzc2VzID0gdGhpcy5pY29uQ2xhc3NlcyA9IHtcbiAgICAgIGV4cGFuZDogJ2dseXBoaWNvbiBnbHlwaGljb24tcGx1cy1zaWduJyxcbiAgICAgIGNvbGxhcHNlOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1taW51cy1zaWduJyxcbiAgICAgIGxvYWRpbmdTcGlubmVyOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZWZyZXNoIGFkLXNwaW4nLFxuICAgICAgZmlyc3RQYWdlOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1mYXN0LWJhY2t3YXJkJyxcbiAgICAgIHByZXZpb3VzUGFnZTogJ2dseXBoaWNvbiBnbHlwaGljb24tYmFja3dhcmQnLFxuICAgICAgbmV4dFBhZ2U6ICdnbHlwaGljb24gZ2x5cGhpY29uLWZvcndhcmQnLFxuICAgICAgbGFzdFBhZ2U6ICdnbHlwaGljb24gZ2x5cGhpY29uLWZhc3QtZm9yd2FyZCcsXG4gICAgICBzb3J0QXNjZW5kaW5nOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLXVwJyxcbiAgICAgIHNvcnREZXNjZW5kaW5nOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWRvd24nLFxuICAgICAgc29ydGFibGU6ICdnbHlwaGljb24gZ2x5cGhpY29uLXJlc2l6ZS12ZXJ0aWNhbCcsXG4gICAgICBkcmFnZ2FibGU6ICdnbHlwaGljb24gZ2x5cGhpY29uLWFsaWduLWp1c3RpZnknLFxuICAgICAgc2VsZWN0ZWRJdGVtOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1vaydcbiAgICB9LCBwYWdpbmcgPSB0aGlzLnBhZ2luZyA9IHtcbiAgICAgIHJlcXVlc3Q6IHtcbiAgICAgICAgc3RhcnQ6ICdza2lwJyxcbiAgICAgICAgcGFnZVNpemU6ICdsaW1pdCcsXG4gICAgICAgIHBhZ2U6ICdwYWdlJyxcbiAgICAgICAgc29ydEZpZWxkOiAnc29ydCcsXG4gICAgICAgIHNvcnREaXJlY3Rpb246ICdzb3J0X2RpcicsXG4gICAgICAgIHNvcnRBc2NWYWx1ZTogJ2FzYycsXG4gICAgICAgIHNvcnREZXNjVmFsdWU6ICdkZXNjJ1xuICAgICAgfSxcbiAgICAgIHJlc3BvbnNlOiB7XG4gICAgICAgIGl0ZW1zTG9jYXRpb246ICdkYXRhJyxcbiAgICAgICAgdG90YWxJdGVtczogJ3BhZ2luYXRpb24udG90YWxDb3VudCdcbiAgICAgIH1cbiAgICB9O1xuICB0aGlzLiRnZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGljb25DbGFzc2VzOiBpY29uQ2xhc3NlcyxcbiAgICAgIHBhZ2luZzogcGFnaW5nXG4gICAgfTtcbiAgfTtcbn0pO1xuXG4vLyBTb3VyY2U6IGRyYWdnYWJsZS5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLmRyYWdnYWJsZScsIFtdKS5kaXJlY3RpdmUoJ2FkRHJhZycsIFtcbiAgJyRyb290U2NvcGUnLFxuICAnJHBhcnNlJyxcbiAgJyR0aW1lb3V0JyxcbiAgZnVuY3Rpb24gKCRyb290U2NvcGUsICRwYXJzZSwgJHRpbWVvdXQpIHtcbiAgICBmdW5jdGlvbiBsaW5rRnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBzY29wZS5kcmFnZ2FibGUgPSBhdHRycy5hZERyYWc7XG4gICAgICBzY29wZS5oYXNIYW5kbGUgPSBhdHRycy5hZERyYWdIYW5kbGUgPT09ICdmYWxzZScgfHwgdHlwZW9mIGF0dHJzLmFkRHJhZ0hhbmRsZSA9PT0gJ3VuZGVmaW5lZCcgPyBmYWxzZSA6IHRydWU7XG4gICAgICBzY29wZS5vbkRyYWdTdGFydENhbGxiYWNrID0gJHBhcnNlKGF0dHJzLmFkRHJhZ0JlZ2luKSB8fCBudWxsO1xuICAgICAgc2NvcGUub25EcmFnRW5kQ2FsbGJhY2sgPSAkcGFyc2UoYXR0cnMuYWREcmFnRW5kKSB8fCBudWxsO1xuICAgICAgc2NvcGUuZGF0YSA9IG51bGw7XG4gICAgICB2YXIgb2Zmc2V0LCBteCwgbXksIHR4LCB0eTtcbiAgICAgIHZhciBoYXNUb3VjaCA9ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgIC8qIC0tIEV2ZW50cyAtLSAqL1xuICAgICAgdmFyIHN0YXJ0RXZlbnRzID0gJ3RvdWNoc3RhcnQgbW91c2Vkb3duJztcbiAgICAgIHZhciBtb3ZlRXZlbnRzID0gJ3RvdWNobW92ZSBtb3VzZW1vdmUnO1xuICAgICAgdmFyIGVuZEV2ZW50cyA9ICd0b3VjaGVuZCBtb3VzZXVwJztcbiAgICAgIHZhciAkZG9jdW1lbnQgPSAkKGRvY3VtZW50KTtcbiAgICAgIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuICAgICAgdmFyIGRyYWdFbmFibGVkID0gZmFsc2U7XG4gICAgICB2YXIgcHJlc3NUaW1lciA9IG51bGw7XG4gICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICBlbGVtZW50LmF0dHIoJ2RyYWdnYWJsZScsICdmYWxzZScpO1xuICAgICAgICAvLyBwcmV2ZW50IG5hdGl2ZSBkcmFnXG4gICAgICAgIHRvZ2dsZUxpc3RlbmVycyh0cnVlKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHRvZ2dsZUxpc3RlbmVycyhlbmFibGUpIHtcbiAgICAgICAgaWYgKCFlbmFibGUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gYWRkIGxpc3RlbmVycy5cbiAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIG9uRGVzdHJveSk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdhZERyYWcnLCBvbkVuYWJsZUNoYW5nZSk7XG4gICAgICAgIHNjb3BlLiR3YXRjaChhdHRycy5hZERyYWdEYXRhLCBvbkRyYWdEYXRhQ2hhbmdlKTtcbiAgICAgICAgc2NvcGUuJG9uKCdkcmFnZ2FibGU6c3RhcnQnLCBvbkRyYWdTdGFydCk7XG4gICAgICAgIHNjb3BlLiRvbignZHJhZ2dhYmxlOmVuZCcsIG9uRHJhZ0VuZCk7XG4gICAgICAgIGlmIChzY29wZS5oYXNIYW5kbGUpIHtcbiAgICAgICAgICBlbGVtZW50Lm9uKHN0YXJ0RXZlbnRzLCAnLmFkLWRyYWctaGFuZGxlJywgb25QcmVzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5vbihzdGFydEV2ZW50cywgb25QcmVzcyk7XG4gICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnYWQtZHJhZ2dhYmxlJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYXNUb3VjaCkge1xuICAgICAgICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsICcuYWQtZHJhZy1oYW5kbGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0pOyAgLy8gcHJldmVudCBuYXRpdmUgZHJhZ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLy0tLSBFdmVudCBIYW5kbGVycyAtLS1cbiAgICAgIGZ1bmN0aW9uIG9uRHJhZ1N0YXJ0KGV2dCwgbykge1xuICAgICAgICBpZiAoby5lbCA9PT0gZWxlbWVudCAmJiBvLmNhbGxiYWNrKSB7XG4gICAgICAgICAgby5jYWxsYmFjayhldnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkRyYWdFbmQoZXZ0LCBvKSB7XG4gICAgICAgIGlmIChvLmVsID09PSBlbGVtZW50ICYmIG8uY2FsbGJhY2spIHtcbiAgICAgICAgICBvLmNhbGxiYWNrKGV2dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRGVzdHJveSgpIHtcbiAgICAgICAgdG9nZ2xlTGlzdGVuZXJzKGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRHJhZ0RhdGFDaGFuZ2UobmV3VmFsKSB7XG4gICAgICAgIHNjb3BlLmRhdGEgPSBuZXdWYWw7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkVuYWJsZUNoYW5nZShuZXdWYWwpIHtcbiAgICAgICAgZHJhZ0VuYWJsZWQgPSBzY29wZS4kZXZhbChuZXdWYWwpO1xuICAgICAgfVxuICAgICAgLypcbiAgICAgICogV2hlbiB0aGUgZWxlbWVudCBpcyBjbGlja2VkIHN0YXJ0IHRoZSBkcmFnIGJlaGF2aW91clxuICAgICAgKiBPbiB0b3VjaCBkZXZpY2VzIGFzIGEgc21hbGwgZGVsYXkgc28gYXMgbm90IHRvIHByZXZlbnQgbmF0aXZlIHdpbmRvdyBzY3JvbGxpbmdcbiAgICAgICovXG4gICAgICBmdW5jdGlvbiBvblByZXNzKGV2dCkge1xuICAgICAgICBpZiAoIWRyYWdFbmFibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNUb3VjaCkge1xuICAgICAgICAgIGNhbmNlbFByZXNzKCk7XG4gICAgICAgICAgcHJlc3NUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FuY2VsUHJlc3MoKTtcbiAgICAgICAgICAgIG9uTG9uZ1ByZXNzKGV2dCk7XG4gICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAkZG9jdW1lbnQub24obW92ZUV2ZW50cywgY2FuY2VsUHJlc3MpO1xuICAgICAgICAgICRkb2N1bWVudC5vbihlbmRFdmVudHMsIGNhbmNlbFByZXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvbkxvbmdQcmVzcyhldnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvKlxuICAgICAgICogUmV0dXJucyB0aGUgaW5saW5lIHByb3BlcnR5IG9mIGFuIGVsZW1lbnRcbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gZ2V0SW5saW5lUHJvcGVydHkocHJvcCwgZWxlbWVudCkge1xuICAgICAgICB2YXIgc3R5bGVzID0gJChlbGVtZW50KS5hdHRyKCdzdHlsZScpLCB2YWx1ZTtcbiAgICAgICAgaWYgKHN0eWxlcykge1xuICAgICAgICAgIHN0eWxlcy5zcGxpdCgnOycpLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGUuc3BsaXQoJzonKTtcbiAgICAgICAgICAgIGlmICgkLnRyaW0oc3R5bGVbMF0pID09PSBwcm9wKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gc3R5bGVbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgICAgLypcbiAgICAgICAqIFByZXNlcnZlIHRoZSB3aWR0aCBvZiB0aGUgZWxlbWVudCBkdXJpbmcgZHJhZ1xuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBwZXJzaXN0RWxlbWVudFdpZHRoKCkge1xuICAgICAgICBpZiAoZ2V0SW5saW5lUHJvcGVydHkoJ3dpZHRoJywgZWxlbWVudCkpIHtcbiAgICAgICAgICBlbGVtZW50LmRhdGEoJ2FkLWRyYWdnYWJsZS10ZW1wLXdpZHRoJywgZ2V0SW5saW5lUHJvcGVydHkoJ3dpZHRoJywgZWxlbWVudCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQud2lkdGgoZWxlbWVudC53aWR0aCgpKTtcbiAgICAgICAgZWxlbWVudC5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChnZXRJbmxpbmVQcm9wZXJ0eSgnd2lkdGgnLCB0aGlzKSkge1xuICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdhZC1kcmFnZ2FibGUtdGVtcC13aWR0aCcsIGdldElubGluZVByb3BlcnR5KCd3aWR0aCcsIHRoaXMpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgJCh0aGlzKS53aWR0aCgkKHRoaXMpLndpZHRoKCkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGNhbmNlbFByZXNzKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQocHJlc3NUaW1lcik7XG4gICAgICAgICRkb2N1bWVudC5vZmYobW92ZUV2ZW50cywgY2FuY2VsUHJlc3MpO1xuICAgICAgICAkZG9jdW1lbnQub2ZmKGVuZEV2ZW50cywgY2FuY2VsUHJlc3MpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25Mb25nUHJlc3MoZXZ0KSB7XG4gICAgICAgIGlmICghZHJhZ0VuYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIG9mZnNldCA9IGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgIGlmIChzY29wZS5oYXNIYW5kbGUpIHtcbiAgICAgICAgICBvZmZzZXQgPSBlbGVtZW50LmZpbmQoJy5hZC1kcmFnLWhhbmRsZScpLm9mZnNldCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9mZnNldCA9IGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnYWQtZHJhZ2dpbmcnKTtcbiAgICAgICAgbXggPSBldnQucGFnZVggfHwgZXZ0Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgICAgbXkgPSBldnQucGFnZVkgfHwgZXZ0Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5wYWdlWTtcbiAgICAgICAgdHggPSBteCAtIG9mZnNldC5sZWZ0IC0gJHdpbmRvdy5zY3JvbGxMZWZ0KCk7XG4gICAgICAgIHR5ID0gbXkgLSBvZmZzZXQudG9wIC0gJHdpbmRvdy5zY3JvbGxUb3AoKTtcbiAgICAgICAgcGVyc2lzdEVsZW1lbnRXaWR0aCgpO1xuICAgICAgICBtb3ZlRWxlbWVudCh0eCwgdHkpO1xuICAgICAgICAkZG9jdW1lbnQub24obW92ZUV2ZW50cywgb25Nb3ZlKTtcbiAgICAgICAgJGRvY3VtZW50Lm9uKGVuZEV2ZW50cywgb25SZWxlYXNlKTtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkcmFnZ2FibGU6c3RhcnQnLCB7XG4gICAgICAgICAgeDogbXgsXG4gICAgICAgICAgeTogbXksXG4gICAgICAgICAgdHg6IHR4LFxuICAgICAgICAgIHR5OiB0eSxcbiAgICAgICAgICBlbDogZWxlbWVudCxcbiAgICAgICAgICBkYXRhOiBzY29wZS5kYXRhLFxuICAgICAgICAgIGNhbGxiYWNrOiBvbkRyYWdCZWdpblxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uTW92ZShldnQpIHtcbiAgICAgICAgdmFyIGN4LCBjeTtcbiAgICAgICAgaWYgKCFkcmFnRW5hYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY3ggPSBldnQucGFnZVggfHwgZXZ0Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgICAgY3kgPSBldnQucGFnZVkgfHwgZXZ0Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5wYWdlWTtcbiAgICAgICAgdHggPSBjeCAtIG14ICsgb2Zmc2V0LmxlZnQgLSAkd2luZG93LnNjcm9sbExlZnQoKTtcbiAgICAgICAgdHkgPSBjeSAtIG15ICsgb2Zmc2V0LnRvcCAtICR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIG1vdmVFbGVtZW50KHR4LCB0eSk7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZHJhZ2dhYmxlOm1vdmUnLCB7XG4gICAgICAgICAgeDogbXgsXG4gICAgICAgICAgeTogbXksXG4gICAgICAgICAgdHg6IHR4LFxuICAgICAgICAgIHR5OiB0eSxcbiAgICAgICAgICBlbDogZWxlbWVudCxcbiAgICAgICAgICBkYXRhOiBzY29wZS5kYXRhXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25SZWxlYXNlKGV2dCkge1xuICAgICAgICBpZiAoIWRyYWdFbmFibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2RyYWdnYWJsZTplbmQnLCB7XG4gICAgICAgICAgeDogbXgsXG4gICAgICAgICAgeTogbXksXG4gICAgICAgICAgdHg6IHR4LFxuICAgICAgICAgIHR5OiB0eSxcbiAgICAgICAgICBlbDogZWxlbWVudCxcbiAgICAgICAgICBkYXRhOiBzY29wZS5kYXRhLFxuICAgICAgICAgIGNhbGxiYWNrOiBvbkRyYWdDb21wbGV0ZVxuICAgICAgICB9KTtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnYWQtZHJhZ2dpbmcnKTtcbiAgICAgICAgcmVzZXQoKTtcbiAgICAgICAgJGRvY3VtZW50Lm9mZihtb3ZlRXZlbnRzLCBvbk1vdmUpO1xuICAgICAgICAkZG9jdW1lbnQub2ZmKGVuZEV2ZW50cywgb25SZWxlYXNlKTtcbiAgICAgIH1cbiAgICAgIC8vIENhbGxiYWNrc1xuICAgICAgZnVuY3Rpb24gb25EcmFnQmVnaW4oZXZ0KSB7XG4gICAgICAgIGlmICghc2NvcGUub25EcmFnU3RhcnRDYWxsYmFjaykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNjb3BlLm9uRHJhZ1N0YXJ0Q2FsbGJhY2soc2NvcGUsIHtcbiAgICAgICAgICAgICRkYXRhOiBzY29wZS5kYXRhLFxuICAgICAgICAgICAgJGRyYWdFbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgJGV2ZW50OiBldnRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkRyYWdDb21wbGV0ZShldnQpIHtcbiAgICAgICAgaWYgKCFzY29wZS5vbkRyYWdFbmRDYWxsYmFjaykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBUbyBmaXggYSBidWcgaXNzdWUgd2hlcmUgb25EcmFnRW5kIGhhcHBlbnMgYmVmb3JlXG4gICAgICAgIC8vIG9uRHJvcEVuZC4gQ3VycmVudGx5IHRoZSBvbmx5IHdheSBhcm91bmQgdGhpc1xuICAgICAgICAvLyBJZGVhbGx5IG9uRHJvcEVuZCBzaG91bGQgZmlyZSBiZWZvcmUgb25EcmFnRW5kXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2NvcGUub25EcmFnRW5kQ2FsbGJhY2soc2NvcGUsIHtcbiAgICAgICAgICAgICAgJGRhdGE6IHNjb3BlLmRhdGEsXG4gICAgICAgICAgICAgICRkcmFnRWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgJGV2ZW50OiBldnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCAxMDApO1xuICAgICAgfVxuICAgICAgLy8gdXRpbHMgZnVuY3Rpb25zXG4gICAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgZWxlbWVudC5jc3Moe1xuICAgICAgICAgIGxlZnQ6ICcnLFxuICAgICAgICAgIHRvcDogJycsXG4gICAgICAgICAgcG9zaXRpb246ICcnLFxuICAgICAgICAgICd6LWluZGV4JzogJydcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciB3aWR0aCA9IGVsZW1lbnQuZGF0YSgnYWQtZHJhZ2dhYmxlLXRlbXAtd2lkdGgnKTtcbiAgICAgICAgaWYgKHdpZHRoKSB7XG4gICAgICAgICAgZWxlbWVudC5jc3MoeyB3aWR0aDogd2lkdGggfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5jc3MoeyB3aWR0aDogJycgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciB3aWR0aCA9ICQodGhpcykuZGF0YSgnYWQtZHJhZ2dhYmxlLXRlbXAtd2lkdGgnKTtcbiAgICAgICAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgICAgICQodGhpcykuY3NzKHsgd2lkdGg6IHdpZHRoIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKHRoaXMpLmNzcyh7IHdpZHRoOiAnJyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gbW92ZUVsZW1lbnQoeCwgeSkge1xuICAgICAgICBlbGVtZW50LmNzcyh7XG4gICAgICAgICAgbGVmdDogeCxcbiAgICAgICAgICB0b3A6IHksXG4gICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICAgICAgJ3otaW5kZXgnOiA5OTk5OVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGluaXQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICBsaW5rOiBsaW5rRnVuY3Rpb25cbiAgICB9O1xuICB9XG5dKS5kaXJlY3RpdmUoJ2FkRHJvcCcsIFtcbiAgJyRyb290U2NvcGUnLFxuICAnJHBhcnNlJyxcbiAgZnVuY3Rpb24gKCRyb290U2NvcGUsICRwYXJzZSkge1xuICAgIGZ1bmN0aW9uIGxpbmtGdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHNjb3BlLmRyb3BwYWJsZSA9IGF0dHJzLmFkRHJvcDtcbiAgICAgIHNjb3BlLm9uRHJvcENhbGxiYWNrID0gJHBhcnNlKGF0dHJzLmFkRHJvcEVuZCkgfHwgbnVsbDtcbiAgICAgIHNjb3BlLm9uRHJvcE92ZXJDYWxsYmFjayA9ICRwYXJzZShhdHRycy5hZERyb3BPdmVyKSB8fCBudWxsO1xuICAgICAgc2NvcGUub25Ecm9wTGVhdmVDYWxsYmFjayA9ICRwYXJzZShhdHRycy5hZERyb3BMZWF2ZSkgfHwgbnVsbDtcbiAgICAgIHZhciBkcm9wRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgdmFyIGVsZW0gPSBudWxsO1xuICAgICAgdmFyICR3aW5kb3cgPSAkKHdpbmRvdyk7XG4gICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICB0b2dnbGVMaXN0ZW5lcnModHJ1ZSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiB0b2dnbGVMaXN0ZW5lcnMoZW5hYmxlKSB7XG4gICAgICAgIGlmICghZW5hYmxlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFkZCBsaXN0ZW5lcnMuXG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdhZERyb3AnLCBvbkVuYWJsZUNoYW5nZSk7XG4gICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBvbkRlc3Ryb3kpO1xuICAgICAgICBzY29wZS4kb24oJ2RyYWdnYWJsZTptb3ZlJywgb25EcmFnTW92ZSk7XG4gICAgICAgIHNjb3BlLiRvbignZHJhZ2dhYmxlOmVuZCcsIG9uRHJhZ0VuZCk7XG4gICAgICAgIHNjb3BlLiRvbignZHJhZ2dhYmxlOmNoYW5nZScsIG9uRHJvcENoYW5nZSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkRlc3Ryb3koKSB7XG4gICAgICAgIHRvZ2dsZUxpc3RlbmVycyhmYWxzZSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkVuYWJsZUNoYW5nZShuZXdWYWwpIHtcbiAgICAgICAgZHJvcEVuYWJsZWQgPSBzY29wZS4kZXZhbChuZXdWYWwpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25Ecm9wQ2hhbmdlKGV2dCwgb2JqKSB7XG4gICAgICAgIGlmIChlbGVtICE9PSBvYmouZWwpIHtcbiAgICAgICAgICBlbGVtID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25EcmFnTW92ZShldnQsIG9iaikge1xuICAgICAgICBpZiAoIWRyb3BFbmFibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHRoZSBkcm9wRWxlbWVudCBhbmQgdGhlIGRyYWcgZWxlbWVudCBhcmUgdGhlIHNhbWVcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IG9iai5lbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZWwgPSBnZXRDdXJyZW50RHJvcEVsZW1lbnQob2JqLnR4LCBvYmoudHksIG9iai5lbCk7XG4gICAgICAgIGlmIChlbCAhPT0gbnVsbCkge1xuICAgICAgICAgIGVsZW0gPSBlbDtcbiAgICAgICAgICBvYmouZWwubGFzdERyb3BFbGVtZW50ID0gZWxlbTtcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2NvcGUub25Ecm9wT3ZlckNhbGxiYWNrKHNjb3BlLCB7XG4gICAgICAgICAgICAgICRkYXRhOiBvYmouZGF0YSxcbiAgICAgICAgICAgICAgJGRyYWdFbGVtZW50OiBvYmouZWwsXG4gICAgICAgICAgICAgICRkcm9wRWxlbWVudDogZWxlbSxcbiAgICAgICAgICAgICAgJGV2ZW50OiBldnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2FkLWRyb3Atb3ZlcicpO1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZHJhZ2dhYmxlOmNoYW5nZScsIHsgZWw6IGVsZW0gfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKG9iai5lbC5sYXN0RHJvcEVsZW1lbnQgPT09IGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHNjb3BlLm9uRHJvcExlYXZlQ2FsbGJhY2soc2NvcGUsIHtcbiAgICAgICAgICAgICAgICAkZGF0YTogb2JqLmRhdGEsXG4gICAgICAgICAgICAgICAgJGRyYWdFbGVtZW50OiBvYmouZWwsXG4gICAgICAgICAgICAgICAgJGRyb3BFbGVtZW50OiBvYmouZWwubGFzdERyb3BFbGVtZW50LFxuICAgICAgICAgICAgICAgICRldmVudDogZXZ0XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBvYmouZWwubGFzdERyb3BFbGVtZW50LnJlbW92ZUNsYXNzKCdhZC1kcm9wLW92ZXInKTtcbiAgICAgICAgICAgIGRlbGV0ZSBvYmouZWwubGFzdERyb3BFbGVtZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25EcmFnRW5kKGV2dCwgb2JqKSB7XG4gICAgICAgIGlmICghZHJvcEVuYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW0pIHtcbiAgICAgICAgICAvLyBjYWxsIHRoZSBhZERyb3AgZWxlbWVudCBjYWxsYmFja1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzY29wZS5vbkRyb3BDYWxsYmFjayhzY29wZSwge1xuICAgICAgICAgICAgICAkZGF0YTogb2JqLmRhdGEsXG4gICAgICAgICAgICAgICRkcmFnRWxlbWVudDogb2JqLmVsLFxuICAgICAgICAgICAgICAkZHJvcEVsZW1lbnQ6IGVsZW0sXG4gICAgICAgICAgICAgICRldmVudDogZXZ0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBlbGVtID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gZ2V0Q3VycmVudERyb3BFbGVtZW50KHgsIHkpIHtcbiAgICAgICAgdmFyIGJvdW5kcyA9IGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgIC8vIHNldCBkcmFnIHNlbnNpdGl2aXR5XG4gICAgICAgIHZhciB2dGhvbGQgPSBNYXRoLmZsb29yKGVsZW1lbnQub3V0ZXJIZWlnaHQoKSAvIDYpO1xuICAgICAgICB4ID0geCArICR3aW5kb3cuc2Nyb2xsTGVmdCgpO1xuICAgICAgICB5ID0geSArICR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIHJldHVybiB5ID49IGJvdW5kcy50b3AgKyB2dGhvbGQgJiYgeSA8PSBib3VuZHMudG9wICsgZWxlbWVudC5vdXRlckhlaWdodCgpIC0gdnRob2xkICYmICh4ID49IGJvdW5kcy5sZWZ0ICYmIHggPD0gYm91bmRzLmxlZnQgKyBlbGVtZW50Lm91dGVyV2lkdGgoKSkgJiYgKHggPj0gYm91bmRzLmxlZnQgJiYgeCA8PSBib3VuZHMubGVmdCArIGVsZW1lbnQub3V0ZXJXaWR0aCgpKSA/IGVsZW1lbnQgOiBudWxsO1xuICAgICAgfVxuICAgICAgaW5pdCgpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgIGxpbms6IGxpbmtGdW5jdGlvblxuICAgIH07XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IGluZmluaXRlZHJvcGRvd24uanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC5pbmZpbml0ZWRyb3Bkb3duJywgW1xuICAnYWRhcHR2LmFkYXB0U3RyYXAudXRpbHMnLFxuICAnYWRhcHR2LmFkYXB0U3RyYXAubG9hZGluZ2luZGljYXRvcidcbl0pLmRpcmVjdGl2ZSgnYWRJbmZpbml0ZURyb3Bkb3duJywgW1xuICAnJHBhcnNlJyxcbiAgJyRjb21waWxlJyxcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgJyRhZENvbmZpZycsXG4gICdhZExvYWRQYWdlJyxcbiAgJ2FkRGVib3VuY2UnLFxuICAnYWRTdHJhcFV0aWxzJyxcbiAgJ2FkTG9hZExvY2FsUGFnZScsXG4gIGZ1bmN0aW9uICgkcGFyc2UsICRjb21waWxlLCAkdGVtcGxhdGVDYWNoZSwgJGFkQ29uZmlnLCBhZExvYWRQYWdlLCBhZERlYm91bmNlLCBhZFN0cmFwVXRpbHMsIGFkTG9hZExvY2FsUGFnZSkge1xuZnVuY3Rpb24gbGlua0Z1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgLy8gc2NvcGUgaW5pdGlhbGl6YXRpb25cbiAgICAgIHNjb3BlLmF0dHJzID0gYXR0cnM7XG4gICAgICBzY29wZS5hZFN0cmFwVXRpbHMgPSBhZFN0cmFwVXRpbHM7XG4gICAgICBzY29wZS5pdGVtcyA9IHtcbiAgICAgICAgbGlzdDogW10sXG4gICAgICAgIHBhZ2luZzoge1xuICAgICAgICAgIGN1cnJlbnRQYWdlOiAxLFxuICAgICAgICAgIHRvdGFsUGFnZXM6IHVuZGVmaW5lZCxcbiAgICAgICAgICBwYWdlU2l6ZTogTnVtYmVyKGF0dHJzLnBhZ2VTaXplKSB8fCAxMFxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgc2NvcGUubG9jYWxDb25maWcgPSB7XG4gICAgICAgIGxvYWRpbmdEYXRhOiBmYWxzZSxcbiAgICAgICAgc2luZ2xlU2VsZWN0aW9uTW9kZTogJHBhcnNlKGF0dHJzLnNpbmdsZVNlbGVjdGlvbk1vZGUpKCkgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGRpbWVuc2lvbnM6IHtcbiAgICAgICAgICAnbWF4LWhlaWdodCc6IGF0dHJzLm1heEhlaWdodCB8fCAnMjAwcHgnLFxuICAgICAgICAgICdtYXgtd2lkdGgnOiBhdHRycy5tYXhXaWR0aCB8fCAnYXV0bydcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNjb3BlLnNlbGVjdGVkSXRlbXMgPSBzY29wZS4kZXZhbChhdHRycy5zZWxlY3RlZEl0ZW1zKSB8fCBbXTtcbiAgICAgIHNjb3BlLmFqYXhDb25maWcgPSBzY29wZS4kZXZhbChhdHRycy5hamF4Q29uZmlnKSB8fCB7fTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gTG9jYWwgZGF0YSAtLS0tLS0tLS0tIC8vXG4gICAgICB2YXIgbGFzdFJlcXVlc3RUb2tlbiwgd2F0Y2hlcnMgPSBbXTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gdWkgaGFuZGxlcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgc2NvcGUuYWRkUmVtb3ZlSXRlbSA9IGZ1bmN0aW9uIChldmVudCwgaXRlbSwgaXRlbXMpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGlmIChzY29wZS5sb2NhbENvbmZpZy5zaW5nbGVTZWxlY3Rpb25Nb2RlKSB7XG4gICAgICAgICAgc2NvcGUuc2VsZWN0ZWRJdGVtc1swXSA9IGl0ZW07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWRTdHJhcFV0aWxzLmFkZFJlbW92ZUl0ZW1Gcm9tTGlzdChpdGVtLCBpdGVtcyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNhbGxiYWNrID0gc2NvcGUuJGV2YWwoYXR0cnMub25JdGVtQ2xpY2spO1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICBjYWxsYmFjayhpdGVtKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNjb3BlLmxvYWRQYWdlID0gYWREZWJvdW5jZShmdW5jdGlvbiAocGFnZSkge1xuICAgICAgICBsYXN0UmVxdWVzdFRva2VuID0gTWF0aC5yYW5kb20oKTtcbiAgICAgICAgc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEgPSB0cnVlO1xuICAgICAgICB2YXIgcGFnZUxvYWRlciA9IHNjb3BlLiRldmFsKGF0dHJzLnBhZ2VMb2FkZXIpIHx8IGFkTG9hZFBhZ2UsIHBhcmFtcyA9IHtcbiAgICAgICAgICAgIHBhZ2VOdW1iZXI6IHBhZ2UsXG4gICAgICAgICAgICBwYWdlU2l6ZTogc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplLFxuICAgICAgICAgICAgc29ydEtleTogc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlLFxuICAgICAgICAgICAgc29ydERpcmVjdGlvbjogc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSxcbiAgICAgICAgICAgIGFqYXhDb25maWc6IHNjb3BlLmFqYXhDb25maWcsXG4gICAgICAgICAgICB0b2tlbjogbGFzdFJlcXVlc3RUb2tlblxuICAgICAgICAgIH0sIHN1Y2Nlc3NIYW5kbGVyID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UudG9rZW4gPT09IGxhc3RSZXF1ZXN0VG9rZW4pIHtcbiAgICAgICAgICAgICAgaWYgKHBhZ2UgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5pdGVtcy5saXN0ID0gcmVzcG9uc2UuaXRlbXM7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuaXRlbXMubGlzdCA9IHNjb3BlLml0ZW1zLmxpc3QuY29uY2F0KHJlc3BvbnNlLml0ZW1zKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcyA9IHJlc3BvbnNlLnRvdGFsUGFnZXM7XG4gICAgICAgICAgICAgIHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9IHJlc3BvbnNlLmN1cnJlbnRQYWdlO1xuICAgICAgICAgICAgICBzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIGVycm9ySGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhID0gZmFsc2U7XG4gICAgICAgICAgfTtcbiAgICAgICAgaWYgKGF0dHJzLmxvY2FsRGF0YVNvdXJjZSkge1xuICAgICAgICAgIHBhcmFtcy5sb2NhbERhdGEgPSBzY29wZS4kZXZhbChhdHRycy5sb2NhbERhdGFTb3VyY2UpO1xuICAgICAgICAgIHN1Y2Nlc3NIYW5kbGVyKGFkTG9hZExvY2FsUGFnZShwYXJhbXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYWdlTG9hZGVyKHBhcmFtcykudGhlbihzdWNjZXNzSGFuZGxlciwgZXJyb3JIYW5kbGVyKTtcbiAgICAgICAgfVxuICAgICAgfSwgMTApO1xuICAgICAgc2NvcGUubG9hZE5leHRQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhKSB7XG4gICAgICAgICAgaWYgKHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSArIDEgPD0gc2NvcGUuaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRQYWdlKHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSArIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gaW5pdGlhbGl6YXRpb24gYW5kIGV2ZW50IGxpc3RlbmVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAvL1dlIGRvIHRoZSBjb21waWxlIGFmdGVyIGluamVjdGluZyB0aGUgbmFtZSBzcGFjaW5nIGludG8gdGhlIHRlbXBsYXRlLlxuICAgICAgc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICAvLyAtLS0tLS0tLS0tIHNldCB3YXRjaGVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAvLyByZXNldCBvbiBwYXJhbWV0ZXIgY2hhbmdlXG4gICAgICBpZiAoYXR0cnMuYWpheENvbmZpZykge1xuICAgICAgICBzY29wZS4kd2F0Y2goYXR0cnMuYWpheENvbmZpZywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICBzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmxvY2FsRGF0YVNvdXJjZSkge1xuICAgICAgICB3YXRjaGVycy5wdXNoKHNjb3BlLiR3YXRjaChhdHRycy5sb2NhbERhdGFTb3VyY2UsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIHdhdGNoZXJzLnB1c2goc2NvcGUuJHdhdGNoKGF0dHJzLmxvY2FsRGF0YVNvdXJjZSArICcubGVuZ3RoJywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICBzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICAgIC8vIC0tLS0tLS0tLS0gZGlzYWJsZSB3YXRjaGVycyAtLS0tLS0tLS0tIC8vXG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKGZ1bmN0aW9uICh3YXRjaGVyKSB7XG4gICAgICAgICAgd2F0Y2hlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgdmFyIGxpc3RDb250YWluZXIgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudCkuZmluZCgndWwnKVswXTtcbiAgICAgIC8vIGluZmluaXRlIHNjcm9sbCBoYW5kbGVyXG4gICAgICB2YXIgbG9hZEZ1bmN0aW9uID0gYWREZWJvdW5jZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gVGhpcyBpcyBmb3IgaW5maW5pdGUgc2Nyb2xsaW5nLlxuICAgICAgICAgIC8vIFdoZW4gdGhlIHNjcm9sbCBnZXRzIGNsb3NlciB0byB0aGUgYm90dG9tLCBsb2FkIG1vcmUgaXRlbXMuXG4gICAgICAgICAgaWYgKGxpc3RDb250YWluZXIuc2Nyb2xsVG9wICsgbGlzdENvbnRhaW5lci5vZmZzZXRIZWlnaHQgPj0gbGlzdENvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSAzMDApIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWROZXh0UGFnZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgNTApO1xuICAgICAgYW5ndWxhci5lbGVtZW50KGxpc3RDb250YWluZXIpLmJpbmQoJ21vdXNld2hlZWwnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgJiYgZXZlbnQub3JpZ2luYWxFdmVudC5kZWx0YVkpIHtcbiAgICAgICAgICBsaXN0Q29udGFpbmVyLnNjcm9sbFRvcCArPSBldmVudC5vcmlnaW5hbEV2ZW50LmRlbHRhWTtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGxvYWRGdW5jdGlvbigpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgc2NvcGU6IHRydWUsXG4gICAgICBsaW5rOiBsaW5rRnVuY3Rpb24sXG4gICAgICB0ZW1wbGF0ZVVybDogJ2luZmluaXRlZHJvcGRvd24vaW5maW5pdGVkcm9wZG93bi50cGwuaHRtbCdcbiAgICB9O1xuICB9XG5dKTtcblxuLy8gU291cmNlOiBsb2FkaW5naW5kaWNhdG9yLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAubG9hZGluZ2luZGljYXRvcicsIFtdKS5kaXJlY3RpdmUoJ2FkTG9hZGluZ0ljb24nLCBbXG4gICckYWRDb25maWcnLFxuICAnJGNvbXBpbGUnLFxuICBmdW5jdGlvbiAoJGFkQ29uZmlnLCAkY29tcGlsZSkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgY29tcGlsZTogZnVuY3Rpb24gY29tcGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBwcmU6IGZ1bmN0aW9uIHByZUxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICB2YXIgbG9hZGluZ0ljb25DbGFzcyA9IGF0dHJzLmxvYWRpbmdJY29uQ2xhc3MgfHwgJGFkQ29uZmlnLmljb25DbGFzc2VzLmxvYWRpbmdTcGlubmVyLCBuZ1N0eWxlVGVtcGxhdGUgPSBhdHRycy5sb2FkaW5nSWNvblNpemUgPyAnbmctc3R5bGU9XCJ7XFwnZm9udC1zaXplXFwnOiBcXCcnICsgYXR0cnMubG9hZGluZ0ljb25TaXplICsgJ1xcJ31cIicgOiAnJywgdGVtcGxhdGUgPSAnPGkgY2xhc3M9XCInICsgbG9hZGluZ0ljb25DbGFzcyArICdcIiAnICsgbmdTdHlsZVRlbXBsYXRlICsgJz48L2k+JztcbiAgICAgICAgICAgIGVsZW1lbnQuZW1wdHkoKTtcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKCRjb21waWxlKHRlbXBsYXRlKShzY29wZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5dKS5kaXJlY3RpdmUoJ2FkTG9hZGluZ092ZXJsYXknLCBbXG4gICckYWRDb25maWcnLFxuICBmdW5jdGlvbiAoJGFkQ29uZmlnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2xvYWRpbmdpbmRpY2F0b3IvbG9hZGluZ2luZGljYXRvci50cGwuaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICBsb2FkaW5nOiAnPScsXG4gICAgICAgIHpJbmRleDogJ0AnLFxuICAgICAgICBwb3NpdGlvbjogJ0AnLFxuICAgICAgICBjb250YWluZXJDbGFzc2VzOiAnQCcsXG4gICAgICAgIGxvYWRpbmdJY29uQ2xhc3M6ICdAJyxcbiAgICAgICAgbG9hZGluZ0ljb25TaXplOiAnQCdcbiAgICAgIH0sXG4gICAgICBjb21waWxlOiBmdW5jdGlvbiBjb21waWxlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHByZTogZnVuY3Rpb24gcHJlTGluayhzY29wZSkge1xuICAgICAgICAgICAgc2NvcGUubG9hZGluZ0ljb25DbGFzcyA9IHNjb3BlLmxvYWRpbmdJY29uQ2xhc3MgfHwgJGFkQ29uZmlnLmljb25DbGFzc2VzLmxvYWRpbmc7XG4gICAgICAgICAgICBzY29wZS5sb2FkaW5nSWNvblNpemUgPSBzY29wZS5sb2FkaW5nSWNvblNpemUgfHwgJzNlbSc7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IHRhYmxlYWpheC5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLnRhYmxlYWpheCcsIFtcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLnV0aWxzJyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLmxvYWRpbmdpbmRpY2F0b3InXG5dKS5kaXJlY3RpdmUoJ2FkVGFibGVBamF4JywgW1xuICAnJHBhcnNlJyxcbiAgJyRhZENvbmZpZycsXG4gICdhZExvYWRQYWdlJyxcbiAgJ2FkRGVib3VuY2UnLFxuICAnYWRTdHJhcFV0aWxzJyxcbiAgZnVuY3Rpb24gKCRwYXJzZSwgJGFkQ29uZmlnLCBhZExvYWRQYWdlLCBhZERlYm91bmNlLCBhZFN0cmFwVXRpbHMpIHtcbmZ1bmN0aW9uIGNvbnRyb2xsZXJGdW5jdGlvbigkc2NvcGUsICRhdHRycykge1xuICAgICAgLy8gLS0tLS0tLS0tLSAkc2NvcGUgaW5pdGlhbGl6YXRpb24gLS0tLS0tLS0tLSAvL1xuICAgICAgJHNjb3BlLmF0dHJzID0gJGF0dHJzO1xuICAgICAgJHNjb3BlLmljb25DbGFzc2VzID0gJGFkQ29uZmlnLmljb25DbGFzc2VzO1xuICAgICAgJHNjb3BlLmFkU3RyYXBVdGlscyA9IGFkU3RyYXBVdGlscztcbiAgICAgICRzY29wZS5pdGVtcyA9IHtcbiAgICAgICAgbGlzdDogdW5kZWZpbmVkLFxuICAgICAgICBwYWdpbmc6IHtcbiAgICAgICAgICBjdXJyZW50UGFnZTogMSxcbiAgICAgICAgICB0b3RhbFBhZ2VzOiB1bmRlZmluZWQsXG4gICAgICAgICAgcGFnZVNpemU6IE51bWJlcigkYXR0cnMucGFnZVNpemUpIHx8IDEwLFxuICAgICAgICAgIHBhZ2VTaXplczogJHBhcnNlKCRhdHRycy5wYWdlU2l6ZXMpKCkgfHwgW1xuICAgICAgICAgICAgMTAsXG4gICAgICAgICAgICAyNSxcbiAgICAgICAgICAgIDUwXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnID0ge1xuICAgICAgICBwYWdpbmdBcnJheTogW10sXG4gICAgICAgIGxvYWRpbmdEYXRhOiBmYWxzZSxcbiAgICAgICAgdGFibGVNYXhIZWlnaHQ6ICRhdHRycy50YWJsZU1heEhlaWdodFxuICAgICAgfTtcbiAgICAgICRzY29wZS5hamF4Q29uZmlnID0gJHNjb3BlLiRldmFsKCRhdHRycy5hamF4Q29uZmlnKTtcbiAgICAgICRzY29wZS5jb2x1bW5EZWZpbml0aW9uID0gJHNjb3BlLiRldmFsKCRhdHRycy5jb2x1bW5EZWZpbml0aW9uKTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gTG9jYWwgZGF0YSAtLS0tLS0tLS0tIC8vXG4gICAgICB2YXIgbGFzdFJlcXVlc3RUb2tlbiwgd2F0Y2hlcnMgPSBbXTtcbiAgICAgIGlmICgkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplcy5pbmRleE9mKCRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUpIDwgMCkge1xuICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplID0gJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZXNbMF07XG4gICAgICB9XG4gICAgICAvLyAtLS0tLS0tLS0tIHVpIGhhbmRsZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS5sb2FkUGFnZSA9IGFkRGVib3VuY2UoZnVuY3Rpb24gKHBhZ2UpIHtcbiAgICAgICAgbGFzdFJlcXVlc3RUb2tlbiA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSA9IHRydWU7XG4gICAgICAgIHZhciBwYWdlTG9hZGVyID0gJHNjb3BlLiRldmFsKCRhdHRycy5wYWdlTG9hZGVyKSB8fCBhZExvYWRQYWdlLCBwYXJhbXMgPSB7XG4gICAgICAgICAgICBwYWdlTnVtYmVyOiBwYWdlLFxuICAgICAgICAgICAgcGFnZVNpemU6ICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUsXG4gICAgICAgICAgICBzb3J0S2V5OiAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlLFxuICAgICAgICAgICAgc29ydERpcmVjdGlvbjogJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UsXG4gICAgICAgICAgICBhamF4Q29uZmlnOiAkc2NvcGUuYWpheENvbmZpZyxcbiAgICAgICAgICAgIHRva2VuOiBsYXN0UmVxdWVzdFRva2VuXG4gICAgICAgICAgfSwgc3VjY2Vzc0hhbmRsZXIgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS50b2tlbiA9PT0gbGFzdFJlcXVlc3RUb2tlbikge1xuICAgICAgICAgICAgICAkc2NvcGUuaXRlbXMubGlzdCA9IHJlc3BvbnNlLml0ZW1zO1xuICAgICAgICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMgPSByZXNwb25zZS50b3RhbFBhZ2VzO1xuICAgICAgICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID0gcmVzcG9uc2UuY3VycmVudFBhZ2U7XG4gICAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5wYWdpbmdBcnJheSA9IHJlc3BvbnNlLnBhZ2luZ0FycmF5O1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCBlcnJvckhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEgPSBmYWxzZTtcbiAgICAgICAgICB9O1xuICAgICAgICBwYWdlTG9hZGVyKHBhcmFtcykudGhlbihzdWNjZXNzSGFuZGxlciwgZXJyb3JIYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLmxvYWROZXh0UGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCEkc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEpIHtcbiAgICAgICAgICBpZiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSArIDEgPD0gJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSArIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5sb2FkUHJldmlvdXNQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoISRzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSkge1xuICAgICAgICAgIGlmICgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlIC0gMSA+IDApIHtcbiAgICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlIC0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLmxvYWRMYXN0UGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCEkc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEpIHtcbiAgICAgICAgICBpZiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAhPT0gJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUucGFnZVNpemVDaGFuZ2VkID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgICAgaWYgKE51bWJlcihzaXplKSAhPT0gJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSkge1xuICAgICAgICAgICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgPSBOdW1iZXIoc2l6ZSk7XG4gICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLnNvcnRCeUNvbHVtbiA9IGZ1bmN0aW9uIChjb2x1bW4pIHtcbiAgICAgICAgaWYgKGNvbHVtbi5zb3J0S2V5KSB7XG4gICAgICAgICAgaWYgKGNvbHVtbi5zb3J0S2V5ICE9PSAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlID0gY29sdW1uLnNvcnRLZXk7XG4gICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gaW5pdGlhbGl6YXRpb24gYW5kIGV2ZW50IGxpc3RlbmVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAkc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICAvLyByZXNldCBvbiBwYXJhbWV0ZXIgY2hhbmdlXG4gICAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kd2F0Y2goJGF0dHJzLmFqYXhDb25maWcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgfSwgdHJ1ZSkpO1xuICAgICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHdhdGNoQ29sbGVjdGlvbigkYXR0cnMuY29sdW1uRGVmaW5pdGlvbiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUuY29sdW1uRGVmaW5pdGlvbiA9ICRzY29wZS4kZXZhbCgkYXR0cnMuY29sdW1uRGVmaW5pdGlvbik7XG4gICAgICB9KSk7XG4gICAgICAvLyAtLS0tLS0tLS0tIGRpc2FibGUgd2F0Y2hlcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdhdGNoZXJzLmZvckVhY2goZnVuY3Rpb24gKHdhdGNoZXIpIHtcbiAgICAgICAgICB3YXRjaGVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgc2NvcGU6IHRydWUsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RhYmxlYWpheC90YWJsZWFqYXgudHBsLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogW1xuICAgICAgICAnJHNjb3BlJyxcbiAgICAgICAgJyRhdHRycycsXG4gICAgICAgIGNvbnRyb2xsZXJGdW5jdGlvblxuICAgICAgXVxuICAgIH07XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IHRhYmxlbGl0ZS5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLnRhYmxlbGl0ZScsIFsnYWRhcHR2LmFkYXB0U3RyYXAudXRpbHMnXSkuZGlyZWN0aXZlKCdhZFRhYmxlTGl0ZScsIFtcbiAgJyRwYXJzZScsXG4gICckaHR0cCcsXG4gICckY29tcGlsZScsXG4gICckZmlsdGVyJyxcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgJyRhZENvbmZpZycsXG4gICdhZFN0cmFwVXRpbHMnLFxuICAnYWREZWJvdW5jZScsXG4gICdhZExvYWRMb2NhbFBhZ2UnLFxuICBmdW5jdGlvbiAoJHBhcnNlLCAkaHR0cCwgJGNvbXBpbGUsICRmaWx0ZXIsICR0ZW1wbGF0ZUNhY2hlLCAkYWRDb25maWcsIGFkU3RyYXBVdGlscywgYWREZWJvdW5jZSwgYWRMb2FkTG9jYWxQYWdlKSB7XG5mdW5jdGlvbiBjb250cm9sbGVyRnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMpIHtcbiAgICAgIC8vIC0tLS0tLS0tLS0gJCRzY29wZSBpbml0aWFsaXphdGlvbiAtLS0tLS0tLS0tIC8vXG4gICAgICAkc2NvcGUuYXR0cnMgPSAkYXR0cnM7XG4gICAgICAkc2NvcGUuaWNvbkNsYXNzZXMgPSAkYWRDb25maWcuaWNvbkNsYXNzZXM7XG4gICAgICAkc2NvcGUuYWRTdHJhcFV0aWxzID0gYWRTdHJhcFV0aWxzO1xuICAgICAgJHNjb3BlLmNvbHVtbkRlZmluaXRpb24gPSAkc2NvcGUuJGV2YWwoJGF0dHJzLmNvbHVtbkRlZmluaXRpb24pO1xuICAgICAgJHNjb3BlLml0ZW1zID0ge1xuICAgICAgICBsaXN0OiB1bmRlZmluZWQsXG4gICAgICAgIGFsbEl0ZW1zOiB1bmRlZmluZWQsXG4gICAgICAgIHBhZ2luZzoge1xuICAgICAgICAgIGN1cnJlbnRQYWdlOiAxLFxuICAgICAgICAgIHRvdGFsUGFnZXM6IHVuZGVmaW5lZCxcbiAgICAgICAgICBwYWdlU2l6ZTogTnVtYmVyKCRhdHRycy5wYWdlU2l6ZSkgfHwgMTAsXG4gICAgICAgICAgcGFnZVNpemVzOiAkcGFyc2UoJGF0dHJzLnBhZ2VTaXplcykoKSB8fCBbXG4gICAgICAgICAgICAxMCxcbiAgICAgICAgICAgIDI1LFxuICAgICAgICAgICAgNTBcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUubG9jYWxDb25maWcgPSB7XG4gICAgICAgIGxvY2FsRGF0YTogYWRTdHJhcFV0aWxzLnBhcnNlKCRzY29wZS4kZXZhbCgkYXR0cnMubG9jYWxEYXRhU291cmNlKSksXG4gICAgICAgIHBhZ2luZ0FycmF5OiBbXSxcbiAgICAgICAgZHJhZ0NoYW5nZTogJHNjb3BlLiRldmFsKCRhdHRycy5vbkRyYWdDaGFuZ2UpXG4gICAgICB9O1xuICAgICAgJHNjb3BlLnNlbGVjdGVkSXRlbXMgPSAkc2NvcGUuJGV2YWwoJGF0dHJzLnNlbGVjdGVkSXRlbXMpO1xuICAgICAgLy8gLS0tLS0tLS0tLSBMb2NhbCBkYXRhIC0tLS0tLS0tLS0gLy9cbiAgICAgIHZhciBwbGFjZUhvbGRlciA9IG51bGwsIHBhZ2VCdXR0b25FbGVtZW50ID0gbnVsbCwgdmFsaWREcm9wID0gZmFsc2UsIGluaXRpYWxQb3MsIHdhdGNoZXJzID0gW107XG4gICAgICBmdW5jdGlvbiBtb3ZlRWxlbWVudE5vZGUobm9kZVRvTW92ZSwgcmVsYXRpdmVOb2RlLCBkcmFnTm9kZSkge1xuICAgICAgICBpZiAocmVsYXRpdmVOb2RlLm5leHQoKVswXSA9PT0gbm9kZVRvTW92ZVswXSkge1xuICAgICAgICAgIHJlbGF0aXZlTm9kZS5iZWZvcmUobm9kZVRvTW92ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVsYXRpdmVOb2RlLnByZXYoKVswXSA9PT0gbm9kZVRvTW92ZVswXSkge1xuICAgICAgICAgIHJlbGF0aXZlTm9kZS5hZnRlcihub2RlVG9Nb3ZlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocmVsYXRpdmVOb2RlLm5leHQoKVswXSA9PT0gZHJhZ05vZGVbMF0pIHtcbiAgICAgICAgICAgIHJlbGF0aXZlTm9kZS5iZWZvcmUobm9kZVRvTW92ZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChyZWxhdGl2ZU5vZGUucHJldigpWzBdID09PSBkcmFnTm9kZVswXSkge1xuICAgICAgICAgICAgcmVsYXRpdmVOb2RlLmFmdGVyKG5vZGVUb01vdmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemVzLmluZGV4T2YoJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSkgPCAwKSB7XG4gICAgICAgICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgPSAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplc1swXTtcbiAgICAgIH1cbiAgICAgIC8vIC0tLS0tLS0tLS0gdWkgaGFuZGxlcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgJHNjb3BlLmxvYWRQYWdlID0gYWREZWJvdW5jZShmdW5jdGlvbiAocGFnZSkge1xuICAgICAgICB2YXIgaXRlbXNPYmplY3QgPSAkc2NvcGUubG9jYWxDb25maWcubG9jYWxEYXRhID0gYWRTdHJhcFV0aWxzLnBhcnNlKCRzY29wZS4kZXZhbCgkYXR0cnMubG9jYWxEYXRhU291cmNlKSksIHBhcmFtcztcbiAgICAgICAgcGFyYW1zID0ge1xuICAgICAgICAgIHBhZ2VOdW1iZXI6IHBhZ2UsXG4gICAgICAgICAgcGFnZVNpemU6ICEkYXR0cnMuZGlzYWJsZVBhZ2luZyA/ICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgOiBpdGVtc09iamVjdC5sZW5ndGgsXG4gICAgICAgICAgc29ydEtleTogJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSxcbiAgICAgICAgICBzb3J0RGlyZWN0aW9uOiAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSxcbiAgICAgICAgICBsb2NhbERhdGE6IGl0ZW1zT2JqZWN0XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZXNwb25zZSA9IGFkTG9hZExvY2FsUGFnZShwYXJhbXMpO1xuICAgICAgICAkc2NvcGUuaXRlbXMubGlzdCA9IHJlc3BvbnNlLml0ZW1zO1xuICAgICAgICAkc2NvcGUuaXRlbXMuYWxsSXRlbXMgPSByZXNwb25zZS5hbGxJdGVtcztcbiAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9IHJlc3BvbnNlLmN1cnJlbnRQYWdlO1xuICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMgPSByZXNwb25zZS50b3RhbFBhZ2VzO1xuICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucGFnaW5nQXJyYXkgPSByZXNwb25zZS5wYWdpbmdBcnJheTtcbiAgICAgIH0sIDEwMCk7XG4gICAgICAkc2NvcGUubG9hZE5leHRQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSArIDEgPD0gJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzKSB7XG4gICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgKyAxKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5sb2FkUHJldmlvdXNQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAtIDEgPiAwKSB7XG4gICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgLSAxKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5sb2FkTGFzdFBhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghJHNjb3BlLmxvY2FsQ29uZmlnLmRpc2FibGVQYWdpbmcpIHtcbiAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5wYWdlU2l6ZUNoYW5nZWQgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplID0gc2l6ZTtcbiAgICAgICAgJHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgfTtcbiAgICAgICRzY29wZS5zb3J0QnlDb2x1bW4gPSBmdW5jdGlvbiAoY29sdW1uKSB7XG4gICAgICAgIGlmIChjb2x1bW4uc29ydEtleSkge1xuICAgICAgICAgIGlmIChjb2x1bW4uc29ydEtleSAhPT0gJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSkge1xuICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9IGNvbHVtbi5zb3J0S2V5O1xuICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUudW5Tb3J0VGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlID0gdW5kZWZpbmVkO1xuICAgICAgfTtcbiAgICAgICRzY29wZS5vbkRyYWdTdGFydCA9IGZ1bmN0aW9uIChkYXRhLCBkcmFnRWxlbWVudCkge1xuICAgICAgICB2YXIgcGFyZW50ID0gZHJhZ0VsZW1lbnQucGFyZW50KCk7XG4gICAgICAgIHBsYWNlSG9sZGVyID0gJCgnPHRyPjx0ZCBjb2xzcGFuPScgKyBkcmFnRWxlbWVudC5maW5kKCd0ZCcpLmxlbmd0aCArICc+Jm5ic3A7PC90ZD48L3RyPicpO1xuICAgICAgICBpbml0aWFsUG9zID0gZHJhZ0VsZW1lbnQuaW5kZXgoKSArICgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlIC0gMSkgKiAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplIC0gMTtcbiAgICAgICAgaWYgKGRyYWdFbGVtZW50WzBdICE9PSBwYXJlbnQuY2hpbGRyZW4oKS5sYXN0KClbMF0pIHtcbiAgICAgICAgICBkcmFnRWxlbWVudC5uZXh0KCkuYmVmb3JlKHBsYWNlSG9sZGVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXJlbnQuYXBwZW5kKHBsYWNlSG9sZGVyKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5vbkRyYWdFbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHBsYWNlSG9sZGVyLnJlbW92ZSgpO1xuICAgICAgfTtcbiAgICAgICRzY29wZS5vbkRyYWdPdmVyID0gZnVuY3Rpb24gKGRhdGEsIGRyYWdFbGVtZW50LCBkcm9wRWxlbWVudCkge1xuICAgICAgICBpZiAocGxhY2VIb2xkZXIpIHtcbiAgICAgICAgICAvLyBSZXN0cmljdHMgdmFsaWQgZHJhZyB0byBjdXJyZW50IHRhYmxlIGluc3RhbmNlXG4gICAgICAgICAgbW92ZUVsZW1lbnROb2RlKHBsYWNlSG9sZGVyLCBkcm9wRWxlbWVudCwgZHJhZ0VsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLm9uRHJvcEVuZCA9IGZ1bmN0aW9uIChkYXRhLCBkcmFnRWxlbWVudCkge1xuICAgICAgICB2YXIgZW5kUG9zO1xuICAgICAgICBpZiAocGxhY2VIb2xkZXIpIHtcbiAgICAgICAgICAvLyBSZXN0cmljdHMgZHJvcCB0byBjdXJyZW50IHRhYmxlIGluc3RhbmNlXG4gICAgICAgICAgaWYgKHBsYWNlSG9sZGVyLm5leHQoKVswXSkge1xuICAgICAgICAgICAgcGxhY2VIb2xkZXIubmV4dCgpLmJlZm9yZShkcmFnRWxlbWVudCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwbGFjZUhvbGRlci5wcmV2KClbMF0pIHtcbiAgICAgICAgICAgIHBsYWNlSG9sZGVyLnByZXYoKS5hZnRlcihkcmFnRWxlbWVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBsYWNlSG9sZGVyLnJlbW92ZSgpO1xuICAgICAgICAgIHZhbGlkRHJvcCA9IHRydWU7XG4gICAgICAgICAgZW5kUG9zID0gZHJhZ0VsZW1lbnQuaW5kZXgoKSArICgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlIC0gMSkgKiAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplIC0gMTtcbiAgICAgICAgICBhZFN0cmFwVXRpbHMubW92ZUl0ZW1Jbkxpc3QoaW5pdGlhbFBvcywgZW5kUG9zLCAkc2NvcGUubG9jYWxDb25maWcubG9jYWxEYXRhKTtcbiAgICAgICAgICAkc2NvcGUudW5Tb3J0VGFibGUoKTtcbiAgICAgICAgICBpZiAoJHNjb3BlLmxvY2FsQ29uZmlnLmRyYWdDaGFuZ2UpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5kcmFnQ2hhbmdlKGluaXRpYWxQb3MsIGVuZFBvcywgZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwYWdlQnV0dG9uRWxlbWVudCkge1xuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50LnJlbW92ZUNsYXNzKCdidG4tcHJpbWFyeScpO1xuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5vbk5leHRQYWdlQnV0dG9uT3ZlciA9IGZ1bmN0aW9uIChkYXRhLCBkcmFnRWxlbWVudCwgZHJvcEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHBhZ2VCdXR0b25FbGVtZW50KSB7XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2J0bi1wcmltYXJ5Jyk7XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkcm9wRWxlbWVudC5hdHRyKCdkaXNhYmxlZCcpICE9PSAnZGlzYWJsZWQnKSB7XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQgPSBkcm9wRWxlbWVudDtcbiAgICAgICAgICBwYWdlQnV0dG9uRWxlbWVudC5hZGRDbGFzcygnYnRuLXByaW1hcnknKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5vbk5leHRQYWdlQnV0dG9uRHJvcCA9IGZ1bmN0aW9uIChkYXRhLCBkcmFnRWxlbWVudCkge1xuICAgICAgICB2YXIgZW5kUG9zO1xuICAgICAgICBpZiAocGFnZUJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgICB2YWxpZERyb3AgPSB0cnVlO1xuICAgICAgICAgIGlmIChwYWdlQnV0dG9uRWxlbWVudC5hdHRyKCdpZCcpID09PSAnYnRuUHJldicpIHtcbiAgICAgICAgICAgIGVuZFBvcyA9ICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgKiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAtIDEpIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHBhZ2VCdXR0b25FbGVtZW50LmF0dHIoJ2lkJykgPT09ICdidG5OZXh0Jykge1xuICAgICAgICAgICAgZW5kUG9zID0gJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSAqICRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFkU3RyYXBVdGlscy5tb3ZlSXRlbUluTGlzdChpbml0aWFsUG9zLCBlbmRQb3MsICRzY29wZS5sb2NhbENvbmZpZy5sb2NhbERhdGEpO1xuICAgICAgICAgIHBsYWNlSG9sZGVyLnJlbW92ZSgpO1xuICAgICAgICAgIGRyYWdFbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgIGlmICgkc2NvcGUubG9jYWxDb25maWcuZHJhZ0NoYW5nZSkge1xuICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLmRyYWdDaGFuZ2UoaW5pdGlhbFBvcywgZW5kUG9zLCBkYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2J0bi1wcmltYXJ5Jyk7XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgLy8gLS0tLS0tLS0tLSBpbml0aWFsaXphdGlvbiBhbmQgZXZlbnQgbGlzdGVuZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gc2V0IHdhdGNoZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgIHdhdGNoZXJzLnB1c2goJHNjb3BlLiR3YXRjaCgkYXR0cnMubG9jYWxEYXRhU291cmNlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlKTtcbiAgICAgIH0pKTtcbiAgICAgIHdhdGNoZXJzLnB1c2goJHNjb3BlLiR3YXRjaCgkYXR0cnMubG9jYWxEYXRhU291cmNlICsgJy5sZW5ndGgnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlKTtcbiAgICAgIH0pKTtcbiAgICAgIHdhdGNoZXJzLnB1c2goJHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJGF0dHJzLmNvbHVtbkRlZmluaXRpb24sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLmNvbHVtbkRlZmluaXRpb24gPSAkc2NvcGUuJGV2YWwoJGF0dHJzLmNvbHVtbkRlZmluaXRpb24pO1xuICAgICAgfSkpO1xuICAgICAgLy8gLS0tLS0tLS0tLSBkaXNhYmxlIHdhdGNoZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKGZ1bmN0aW9uICh3YXRjaGVyKSB7XG4gICAgICAgICAgd2F0Y2hlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIGNvbnRyb2xsZXI6IFtcbiAgICAgICAgJyRzY29wZScsXG4gICAgICAgICckYXR0cnMnLFxuICAgICAgICBjb250cm9sbGVyRnVuY3Rpb25cbiAgICAgIF0sXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RhYmxlbGl0ZS90YWJsZWxpdGUudHBsLmh0bWwnLFxuICAgICAgc2NvcGU6IHRydWVcbiAgICB9O1xuICB9XG5dKTtcblxuLy8gU291cmNlOiB0cmVlYnJvd3Nlci5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLnRyZWVicm93c2VyJywgW10pLmRpcmVjdGl2ZSgnYWRUcmVlQnJvd3NlcicsIFtcbiAgJyRhZENvbmZpZycsXG4gIGZ1bmN0aW9uICgkYWRDb25maWcpIHtcbiAgICBmdW5jdGlvbiBjb250cm9sbGVyRnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMpIHtcbiAgICAgIHZhciB0ZW1wbGF0ZVRva2VuID0gTWF0aC5yYW5kb20oKTtcbiAgICAgIC8vIHNjb3BlIGluaXRpYWxpemF0aW9uXG4gICAgICAkc2NvcGUuYXR0cnMgPSAkYXR0cnM7XG4gICAgICAkc2NvcGUuaWNvbkNsYXNzZXMgPSAkYWRDb25maWcuaWNvbkNsYXNzZXM7XG4gICAgICAkc2NvcGUudHJlZVJvb3QgPSAkc2NvcGUuJGV2YWwoJGF0dHJzLnRyZWVSb290KSB8fCB7fTtcbiAgICAgICRzY29wZS50b2dnbGUgPSBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcbiAgICAgICAgdmFyIHRvZ2dsZUNhbGxiYWNrO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdG9nZ2xlQ2FsbGJhY2sgPSAkc2NvcGUuJGV2YWwoJGF0dHJzLnRvZ2dsZUNhbGxiYWNrKTtcbiAgICAgICAgaWYgKHRvZ2dsZUNhbGxiYWNrKSB7XG4gICAgICAgICAgdG9nZ2xlQ2FsbGJhY2soaXRlbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbS5fYWRfZXhwYW5kZWQgPSAhaXRlbS5fYWRfZXhwYW5kZWQ7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB2YXIgaGFzQ2hpbGRyZW4gPSAkc2NvcGUuJGV2YWwoJGF0dHJzLmhhc0NoaWxkcmVuKTtcbiAgICAgICRzY29wZS5oYXNDaGlsZHJlbiA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHZhciBmb3VuZCA9IGl0ZW1bJGF0dHJzLmNoaWxkTm9kZV0gJiYgaXRlbVskYXR0cnMuY2hpbGROb2RlXS5sZW5ndGggPiAwO1xuICAgICAgICBpZiAoaGFzQ2hpbGRyZW4pIHtcbiAgICAgICAgICBmb3VuZCA9IGhhc0NoaWxkcmVuKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgIH07XG4gICAgICAvLyBmb3IgdW5pcXVlIHRlbXBsYXRlXG4gICAgICAkc2NvcGUubG9jYWxDb25maWcgPSB7IHJlbmRlcmVyVGVtcGxhdGVJZDogJ3RyZWUtcmVuZGVyZXItJyArIHRlbXBsYXRlVG9rZW4gKyAnLmh0bWwnIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgc2NvcGU6IHRydWUsXG4gICAgICBjb250cm9sbGVyOiBbXG4gICAgICAgICckc2NvcGUnLFxuICAgICAgICAnJGF0dHJzJyxcbiAgICAgICAgY29udHJvbGxlckZ1bmN0aW9uXG4gICAgICBdLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0cmVlYnJvd3Nlci90cmVlYnJvd3Nlci50cGwuaHRtbCdcbiAgICB9O1xuICB9XG5dKTtcblxuLy8gU291cmNlOiB1dGlscy5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLnV0aWxzJywgW10pLmZhY3RvcnkoJ2FkU3RyYXBVdGlscycsIFtcbiAgJyRmaWx0ZXInLFxuICBmdW5jdGlvbiAoJGZpbHRlcikge1xuICAgIHZhciBldmFsT2JqZWN0UHJvcGVydHkgPSBmdW5jdGlvbiAob2JqLCBwcm9wZXJ0eSkge1xuICAgICAgICB2YXIgYXJyID0gcHJvcGVydHkuc3BsaXQoJy4nKTtcbiAgICAgICAgaWYgKG9iaikge1xuICAgICAgICAgIHdoaWxlIChhcnIubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gYXJyLnNoaWZ0KCk7XG4gICAgICAgICAgICBpZiAob2JqKSB7XG4gICAgICAgICAgICAgIG9iaiA9IG9ialtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfSwgYXBwbHlGaWx0ZXIgPSBmdW5jdGlvbiAodmFsdWUsIGZpbHRlciwgaXRlbSkge1xuICAgICAgICB2YXIgcGFydHMsIGZpbHRlck9wdGlvbnM7XG4gICAgICAgIGlmICh2YWx1ZSAmJiAnZnVuY3Rpb24nID09PSB0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUoaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcikge1xuICAgICAgICAgIHBhcnRzID0gZmlsdGVyLnNwbGl0KCc6Jyk7XG4gICAgICAgICAgZmlsdGVyT3B0aW9ucyA9IHBhcnRzWzFdO1xuICAgICAgICAgIGlmIChmaWx0ZXJPcHRpb25zKSB7XG4gICAgICAgICAgICB2YWx1ZSA9ICRmaWx0ZXIocGFydHNbMF0pKHZhbHVlLCBmaWx0ZXJPcHRpb25zKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgPSAkZmlsdGVyKHBhcnRzWzBdKSh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0sIGl0ZW1FeGlzdHNJbkxpc3QgPSBmdW5jdGlvbiAoY29tcGFyZUl0ZW0sIGxpc3QpIHtcbiAgICAgICAgdmFyIGV4aXN0ID0gZmFsc2U7XG4gICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyhjb21wYXJlSXRlbSwgaXRlbSkpIHtcbiAgICAgICAgICAgIGV4aXN0ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZXhpc3Q7XG4gICAgICB9LCBpdGVtc0V4aXN0SW5MaXN0ID0gZnVuY3Rpb24gKGl0ZW1zLCBsaXN0KSB7XG4gICAgICAgIHZhciBleGlzdCA9IHRydWUsIGk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChpdGVtRXhpc3RzSW5MaXN0KGl0ZW1zW2ldLCBsaXN0KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGV4aXN0ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV4aXN0O1xuICAgICAgfSwgYWRkSXRlbVRvTGlzdCA9IGZ1bmN0aW9uIChpdGVtLCBsaXN0KSB7XG4gICAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICAgIH0sIHJlbW92ZUl0ZW1Gcm9tTGlzdCA9IGZ1bmN0aW9uIChpdGVtLCBsaXN0KSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICBmb3IgKGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKGl0ZW0sIGxpc3RbaV0pKSB7XG4gICAgICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIGFkZFJlbW92ZUl0ZW1Gcm9tTGlzdCA9IGZ1bmN0aW9uIChpdGVtLCBsaXN0KSB7XG4gICAgICAgIHZhciBpLCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKGl0ZW0sIGxpc3RbaV0pKSB7XG4gICAgICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZvdW5kID09PSBmYWxzZSkge1xuICAgICAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgfSwgYWRkSXRlbXNUb0xpc3QgPSBmdW5jdGlvbiAoaXRlbXMsIGxpc3QpIHtcbiAgICAgICAgaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgIGlmICghaXRlbUV4aXN0c0luTGlzdChpdGVtLCBsaXN0KSkge1xuICAgICAgICAgICAgYWRkUmVtb3ZlSXRlbUZyb21MaXN0KGl0ZW0sIGxpc3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LCBhZGRSZW1vdmVJdGVtc0Zyb21MaXN0ID0gZnVuY3Rpb24gKGl0ZW1zLCBsaXN0KSB7XG4gICAgICAgIGlmIChpdGVtc0V4aXN0SW5MaXN0KGl0ZW1zLCBsaXN0KSkge1xuICAgICAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhZGRJdGVtc1RvTGlzdChpdGVtcywgbGlzdCk7XG4gICAgICAgIH1cbiAgICAgIH0sIG1vdmVJdGVtSW5MaXN0ID0gZnVuY3Rpb24gKHN0YXJ0UG9zLCBlbmRQb3MsIGxpc3QpIHtcbiAgICAgICAgaWYgKGVuZFBvcyA8IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgbGlzdC5zcGxpY2UoZW5kUG9zLCAwLCBsaXN0LnNwbGljZShzdGFydFBvcywgMSlbMF0pO1xuICAgICAgICB9XG4gICAgICB9LCBwYXJzZSA9IGZ1bmN0aW9uIChpdGVtcykge1xuICAgICAgICB2YXIgaXRlbXNPYmplY3QgPSBbXTtcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShpdGVtcykpIHtcbiAgICAgICAgICBpdGVtc09iamVjdCA9IGl0ZW1zO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChpdGVtcywgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIGl0ZW1zT2JqZWN0LnB1c2goaXRlbSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW1zT2JqZWN0O1xuICAgICAgfSwgZ2V0T2JqZWN0UHJvcGVydHkgPSBmdW5jdGlvbiAoaXRlbSwgcHJvcGVydHkpIHtcbiAgICAgICAgaWYgKHByb3BlcnR5ICYmICdmdW5jdGlvbicgPT09IHR5cGVvZiBwcm9wZXJ0eSkge1xuICAgICAgICAgIHJldHVybiBwcm9wZXJ0eShpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXJyID0gcHJvcGVydHkuc3BsaXQoJy4nKTtcbiAgICAgICAgd2hpbGUgKGFyci5sZW5ndGgpIHtcbiAgICAgICAgICBpdGVtID0gaXRlbVthcnIuc2hpZnQoKV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICBldmFsT2JqZWN0UHJvcGVydHk6IGV2YWxPYmplY3RQcm9wZXJ0eSxcbiAgICAgIGFwcGx5RmlsdGVyOiBhcHBseUZpbHRlcixcbiAgICAgIGl0ZW1FeGlzdHNJbkxpc3Q6IGl0ZW1FeGlzdHNJbkxpc3QsXG4gICAgICBpdGVtc0V4aXN0SW5MaXN0OiBpdGVtc0V4aXN0SW5MaXN0LFxuICAgICAgYWRkSXRlbVRvTGlzdDogYWRkSXRlbVRvTGlzdCxcbiAgICAgIHJlbW92ZUl0ZW1Gcm9tTGlzdDogcmVtb3ZlSXRlbUZyb21MaXN0LFxuICAgICAgYWRkUmVtb3ZlSXRlbUZyb21MaXN0OiBhZGRSZW1vdmVJdGVtRnJvbUxpc3QsXG4gICAgICBhZGRJdGVtc1RvTGlzdDogYWRkSXRlbXNUb0xpc3QsXG4gICAgICBhZGRSZW1vdmVJdGVtc0Zyb21MaXN0OiBhZGRSZW1vdmVJdGVtc0Zyb21MaXN0LFxuICAgICAgbW92ZUl0ZW1Jbkxpc3Q6IG1vdmVJdGVtSW5MaXN0LFxuICAgICAgcGFyc2U6IHBhcnNlLFxuICAgICAgZ2V0T2JqZWN0UHJvcGVydHk6IGdldE9iamVjdFByb3BlcnR5XG4gICAgfTtcbiAgfVxuXSkuZmFjdG9yeSgnYWREZWJvdW5jZScsIFtcbiAgJyR0aW1lb3V0JyxcbiAgJyRxJyxcbiAgZnVuY3Rpb24gKCR0aW1lb3V0LCAkcSkge1xudmFyIGRlYiA9IGZ1bmN0aW9uIChmdW5jLCBkZWxheSwgaW1tZWRpYXRlLCBjdHgpIHtcbiAgICAgIHZhciB0aW1lciA9IG51bGwsIGRlZmVycmVkID0gJHEuZGVmZXIoKSwgd2FpdCA9IGRlbGF5IHx8IDMwMDtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb250ZXh0ID0gY3R4IHx8IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHMsIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVyLCBsYXRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKSk7XG4gICAgICAgICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICBpZiAodGltZXIpIHtcbiAgICAgICAgICAkdGltZW91dC5jYW5jZWwodGltZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRpbWVyID0gJHRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgICBpZiAoY2FsbE5vdykge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKSk7XG4gICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfTtcbiAgICB9O1xuICAgIHJldHVybiBkZWI7XG4gIH1cbl0pLmRpcmVjdGl2ZSgnYWRDb21waWxlVGVtcGxhdGUnLCBbXG4gICckY29tcGlsZScsXG4gIGZ1bmN0aW9uICgkY29tcGlsZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBzY29wZS4kd2F0Y2goZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgIHJldHVybiBzY29wZS4kZXZhbChhdHRycy5hZENvbXBpbGVUZW1wbGF0ZSk7XG4gICAgICB9LCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgZWxlbWVudC5odG1sKHZhbHVlKTtcbiAgICAgICAgJGNvbXBpbGUoZWxlbWVudC5jb250ZW50cygpKShzY29wZSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5dKS5mYWN0b3J5KCdhZExvYWRQYWdlJywgW1xuICAnJGFkQ29uZmlnJyxcbiAgJyRodHRwJyxcbiAgJ2FkU3RyYXBVdGlscycsXG4gIGZ1bmN0aW9uICgkYWRDb25maWcsICRodHRwLCBhZFN0cmFwVXRpbHMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIHZhciBzdGFydCA9IChvcHRpb25zLnBhZ2VOdW1iZXIgLSAxKSAqIG9wdGlvbnMucGFnZVNpemUsIHBhZ2luZ0NvbmZpZyA9IGFuZ3VsYXIuY29weSgkYWRDb25maWcucGFnaW5nKSwgYWpheENvbmZpZyA9IGFuZ3VsYXIuY29weShvcHRpb25zLmFqYXhDb25maWcpO1xuICAgICAgaWYgKGFqYXhDb25maWcucGFnaW5hdGlvbkNvbmZpZyAmJiBhamF4Q29uZmlnLnBhZ2luYXRpb25Db25maWcucmVxdWVzdCkge1xuICAgICAgICBhbmd1bGFyLmV4dGVuZChwYWdpbmdDb25maWcucmVxdWVzdCwgYWpheENvbmZpZy5wYWdpbmF0aW9uQ29uZmlnLnJlcXVlc3QpO1xuICAgICAgfVxuICAgICAgaWYgKGFqYXhDb25maWcucGFnaW5hdGlvbkNvbmZpZyAmJiBhamF4Q29uZmlnLnBhZ2luYXRpb25Db25maWcucmVzcG9uc2UpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQocGFnaW5nQ29uZmlnLnJlc3BvbnNlLCBhamF4Q29uZmlnLnBhZ2luYXRpb25Db25maWcucmVzcG9uc2UpO1xuICAgICAgfVxuICAgICAgYWpheENvbmZpZy5wYXJhbXMgPSBhamF4Q29uZmlnLnBhcmFtcyA/IGFqYXhDb25maWcucGFyYW1zIDoge307XG4gICAgICBhamF4Q29uZmlnLnBhcmFtc1twYWdpbmdDb25maWcucmVxdWVzdC5zdGFydF0gPSBzdGFydDtcbiAgICAgIGFqYXhDb25maWcucGFyYW1zW3BhZ2luZ0NvbmZpZy5yZXF1ZXN0LnBhZ2VTaXplXSA9IG9wdGlvbnMucGFnZVNpemU7XG4gICAgICBhamF4Q29uZmlnLnBhcmFtc1twYWdpbmdDb25maWcucmVxdWVzdC5wYWdlXSA9IG9wdGlvbnMucGFnZU51bWJlcjtcbiAgICAgIGlmIChvcHRpb25zLnNvcnRLZXkpIHtcbiAgICAgICAgYWpheENvbmZpZy5wYXJhbXNbcGFnaW5nQ29uZmlnLnJlcXVlc3Quc29ydEZpZWxkXSA9IG9wdGlvbnMuc29ydEtleTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLnNvcnREaXJlY3Rpb24gPT09IGZhbHNlKSB7XG4gICAgICAgIGFqYXhDb25maWcucGFyYW1zW3BhZ2luZ0NvbmZpZy5yZXF1ZXN0LnNvcnREaXJlY3Rpb25dID0gcGFnaW5nQ29uZmlnLnJlcXVlc3Quc29ydEFzY1ZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnNvcnREaXJlY3Rpb24gPT09IHRydWUpIHtcbiAgICAgICAgYWpheENvbmZpZy5wYXJhbXNbcGFnaW5nQ29uZmlnLnJlcXVlc3Quc29ydERpcmVjdGlvbl0gPSBwYWdpbmdDb25maWcucmVxdWVzdC5zb3J0RGVzY1ZhbHVlO1xuICAgICAgfVxuICAgICAgdmFyIHByb21pc2U7XG4gICAgICBpZiAoYWpheENvbmZpZy5tZXRob2QgPT09ICdKU09OUCcpIHtcbiAgICAgICAgcHJvbWlzZSA9ICRodHRwLmpzb25wKGFqYXhDb25maWcudXJsICsgJz9jYWxsYmFjaz1KU09OX0NBTExCQUNLJywgYWpheENvbmZpZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9taXNlID0gJGh0dHAoYWpheENvbmZpZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgaXRlbXM6IGFkU3RyYXBVdGlscy5ldmFsT2JqZWN0UHJvcGVydHkocmVzdWx0LmRhdGEsIHBhZ2luZ0NvbmZpZy5yZXNwb25zZS5pdGVtc0xvY2F0aW9uKSxcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlOiBvcHRpb25zLnBhZ2VOdW1iZXIsXG4gICAgICAgICAgICB0b3RhbFBhZ2VzOiBNYXRoLmNlaWwoYWRTdHJhcFV0aWxzLmV2YWxPYmplY3RQcm9wZXJ0eShyZXN1bHQuZGF0YSwgcGFnaW5nQ29uZmlnLnJlc3BvbnNlLnRvdGFsSXRlbXMpIC8gb3B0aW9ucy5wYWdlU2l6ZSksXG4gICAgICAgICAgICBwYWdpbmdBcnJheTogW10sXG4gICAgICAgICAgICB0b2tlbjogb3B0aW9ucy50b2tlblxuICAgICAgICAgIH07XG4gICAgICAgIHZhciBUT1RBTF9QQUdJTkFUSU9OX0lURU1TID0gNTtcbiAgICAgICAgdmFyIG1pbmltdW1Cb3VuZCA9IG9wdGlvbnMucGFnZU51bWJlciAtIE1hdGguZmxvb3IoVE9UQUxfUEFHSU5BVElPTl9JVEVNUyAvIDIpO1xuICAgICAgICBmb3IgKHZhciBpID0gbWluaW11bUJvdW5kOyBpIDw9IG9wdGlvbnMucGFnZU51bWJlcjsgaSsrKSB7XG4gICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICByZXNwb25zZS5wYWdpbmdBcnJheS5wdXNoKGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAocmVzcG9uc2UucGFnaW5nQXJyYXkubGVuZ3RoIDwgVE9UQUxfUEFHSU5BVElPTl9JVEVNUykge1xuICAgICAgICAgIGlmIChpID4gcmVzcG9uc2UudG90YWxQYWdlcykge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3BvbnNlLnBhZ2luZ0FycmF5LnB1c2goaSk7XG4gICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbl0pLmZhY3RvcnkoJ2FkTG9hZExvY2FsUGFnZScsIFtcbiAgJyRmaWx0ZXInLFxuICBmdW5jdGlvbiAoJGZpbHRlcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICAgIGl0ZW1zOiB1bmRlZmluZWQsXG4gICAgICAgICAgY3VycmVudFBhZ2U6IG9wdGlvbnMucGFnZU51bWJlcixcbiAgICAgICAgICB0b3RhbFBhZ2VzOiB1bmRlZmluZWQsXG4gICAgICAgICAgcGFnaW5nQXJyYXk6IFtdLFxuICAgICAgICAgIHRva2VuOiBvcHRpb25zLnRva2VuXG4gICAgICAgIH07XG4gICAgICB2YXIgc3RhcnQgPSAob3B0aW9ucy5wYWdlTnVtYmVyIC0gMSkgKiBvcHRpb25zLnBhZ2VTaXplLCBlbmQgPSBzdGFydCArIG9wdGlvbnMucGFnZVNpemUsIGksIGl0ZW1zT2JqZWN0ID0gb3B0aW9ucy5sb2NhbERhdGEsIGxvY2FsSXRlbXM7XG4gICAgICBsb2NhbEl0ZW1zID0gJGZpbHRlcignb3JkZXJCeScpKGl0ZW1zT2JqZWN0LCBvcHRpb25zLnNvcnRLZXksIG9wdGlvbnMuc29ydERpcmVjdGlvbik7XG4gICAgICByZXNwb25zZS5pdGVtcyA9IGxvY2FsSXRlbXMuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgICByZXNwb25zZS5hbGxJdGVtcyA9IGl0ZW1zT2JqZWN0O1xuICAgICAgcmVzcG9uc2UuY3VycmVudFBhZ2UgPSBvcHRpb25zLnBhZ2VOdW1iZXI7XG4gICAgICByZXNwb25zZS50b3RhbFBhZ2VzID0gTWF0aC5jZWlsKGl0ZW1zT2JqZWN0Lmxlbmd0aCAvIG9wdGlvbnMucGFnZVNpemUpO1xuICAgICAgdmFyIFRPVEFMX1BBR0lOQVRJT05fSVRFTVMgPSA1O1xuICAgICAgdmFyIG1pbmltdW1Cb3VuZCA9IG9wdGlvbnMucGFnZU51bWJlciAtIE1hdGguZmxvb3IoVE9UQUxfUEFHSU5BVElPTl9JVEVNUyAvIDIpO1xuICAgICAgZm9yIChpID0gbWluaW11bUJvdW5kOyBpIDw9IG9wdGlvbnMucGFnZU51bWJlcjsgaSsrKSB7XG4gICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgIHJlc3BvbnNlLnBhZ2luZ0FycmF5LnB1c2goaSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlIChyZXNwb25zZS5wYWdpbmdBcnJheS5sZW5ndGggPCBUT1RBTF9QQUdJTkFUSU9OX0lURU1TKSB7XG4gICAgICAgIGlmIChpID4gcmVzcG9uc2UudG90YWxQYWdlcykge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJlc3BvbnNlLnBhZ2luZ0FycmF5LnB1c2goaSk7XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9O1xuICB9XG5dKTtcblxufSkod2luZG93LCBkb2N1bWVudCk7XG4iLCIvKipcbiAqIGFkYXB0LXN0cmFwXG4gKiBAdmVyc2lvbiB2Mi4wLjYgLSAyMDE0LTEwLTI2XG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vQWRhcHR2L2FkYXB0LXN0cmFwXG4gKiBAYXV0aG9yIEthc2h5YXAgUGF0ZWwgKGthc2h5YXBAYWRhcC50dilcbiAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlLCBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4ndXNlIHN0cmljdCc7XG5cbi8vIFNvdXJjZTogaW5maW5pdGVkcm9wZG93bi50cGwuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC5pbmZpbml0ZWRyb3Bkb3duJykucnVuKFtcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgZnVuY3Rpb24gKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdpbmZpbml0ZWRyb3Bkb3duL2luZmluaXRlZHJvcGRvd24udHBsLmh0bWwnLCAnPGRpdiBjbGFzcz1cImFkLWluZmluaXRlLWxpc3QtY29udGFpbmVyXCI+PGRpdiBjbGFzcz1cImRyb3Bkb3duXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJkcm9wZG93bi10b2dnbGVcIiBuZy1jbGFzcz1cImF0dHJzLmJ0bkNsYXNzZXMgfHwgXFwnYnRuIGJ0bi1kZWZhdWx0XFwnXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiPjxzcGFuIG5nLWlmPVwiIWF0dHJzLmxhYmVsRGlzcGxheVByb3BlcnR5IHx8ICFzZWxlY3RlZEl0ZW1zLmxlbmd0aFwiPnt7IGF0dHJzLmluaXRpYWxMYWJlbCB8fCBcXCdTZWxlY3RcXCcgfX08L3NwYW4+IDxzcGFuIG5nLWlmPVwiYXR0cnMubGFiZWxEaXNwbGF5UHJvcGVydHkgJiYgc2VsZWN0ZWRJdGVtcy5sZW5ndGhcIj57eyByZWFkUHJvcGVydHkoc2VsZWN0ZWRJdGVtc1tzZWxlY3RlZEl0ZW1zLmxlbmd0aCAtIDFdLCBhdHRycy5sYWJlbERpc3BsYXlQcm9wZXJ0eSkgfX08L3NwYW4+IDxzcGFuIGNsYXNzPVwiY2FyZXRcIj48L3NwYW4+PC9idXR0b24+PHVsIGNsYXNzPVwiZHJvcGRvd24tbWVudVwiIHJvbGU9XCJtZW51XCIgbmctc3R5bGU9XCJsb2NhbENvbmZpZy5kaW1lbnNpb25zXCI+PGxpIGNsYXNzPVwidGV4dC1vdmVyZmxvd1wiIGRhdGEtbmctcmVwZWF0PVwiaXRlbSBpbiBpdGVtcy5saXN0XCIgbmctY2xhc3M9XCJ7XFwnYWN0aXZlXFwnOiBhZFN0cmFwVXRpbHMuaXRlbUV4aXN0c0luTGlzdChpdGVtLCBzZWxlY3RlZEl0ZW1zKX1cIiBuZy1jbGljaz1cImFkZFJlbW92ZUl0ZW0oJGV2ZW50LCBpdGVtLCBzZWxlY3RlZEl0ZW1zKVwiPjxhIHJvbGU9XCJtZW51aXRlbVwiIHRhYmluZGV4PVwiLTFcIiBocmVmPVwiXCI+PHNwYW4gbmctaWY9XCJhdHRycy5kaXNwbGF5UHJvcGVydHlcIj57eyBhZFN0cmFwVXRpbHMuZ2V0T2JqZWN0UHJvcGVydHkoaXRlbSwgYXR0cnMuZGlzcGxheVByb3BlcnR5KSB9fTwvc3Bhbj4gPHNwYW4gbmctaWY9XCJhdHRycy50ZW1wbGF0ZVwiIGFkLWNvbXBpbGUtdGVtcGxhdGU9XCJ7eyBhdHRycy50ZW1wbGF0ZSB9fVwiPjwvc3Bhbj4gPHNwYW4gbmctaWY9XCJhdHRycy50ZW1wbGF0ZVVybFwiIG5nLWluY2x1ZGU9XCJhdHRycy50ZW1wbGF0ZVVybFwiPjwvc3Bhbj48L2E+PC9saT48bGkgY2xhc3M9XCJ0ZXh0LW92ZXJmbG93IHRleHQtY2VudGVyXCIgbmctc3R5bGU9XCJ7XFwnb3BhY2l0eVxcJzogbG9jYWxDb25maWcubG9hZGluZ0RhdGEgPyAxIDogMH1cIj48YSByb2xlPVwibWVudWl0ZW1cIiB0YWJpbmRleD1cIi0xXCIgaHJlZj1cIlwiPjxhZC1sb2FkaW5nLWljb24+PC9hZC1sb2FkaW5nLWljb24+PC9hPjwvbGk+PC91bD48L2Rpdj48L2Rpdj4nKTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogbG9hZGluZ2luZGljYXRvci50cGwuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC5sb2FkaW5naW5kaWNhdG9yJykucnVuKFtcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgZnVuY3Rpb24gKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdsb2FkaW5naW5kaWNhdG9yL2xvYWRpbmdpbmRpY2F0b3IudHBsLmh0bWwnLCAnPGRpdiBjbGFzcz1cImFkLWxvYWRpbmctb3ZlcmxheS1jb250YWluZXJcIiBuZy1jbGFzcz1cImNvbnRhaW5lckNsYXNzZXNcIiBuZy1zdHlsZT1cIntcXCd6LWluZGV4XFwnOiB6SW5kZXggfHwgXFwnMTAwMFxcJyxcXCdwb3NpdGlvblxcJzogcG9zaXRpb24gfHwgXFwnYWJzb2x1dGVcXCd9XCIgbmctc2hvdz1cImxvYWRpbmdcIj48ZGl2IGNsYXNzPVwid3JhcHBlclwiPjxkaXYgY2xhc3M9XCJsb2FkaW5nLWluZGljYXRvclwiPjxhZC1sb2FkaW5nLWljb24gbG9hZGluZy1pY29uLXNpemU9XCJ7eyBsb2FkaW5nSWNvblNpemUgfX1cIiBsb2FkaW5nLWljb24tY2xhc3M9XCJ7eyBsb2FkaW5nSWNvbkNsYXNzIH19XCI+PC9hZC1sb2FkaW5nLWljb24+PC9kaXY+PC9kaXY+PC9kaXY+Jyk7XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IHRhYmxlYWpheC50cGwuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC50YWJsZWFqYXgnKS5ydW4oW1xuICAnJHRlbXBsYXRlQ2FjaGUnLFxuICBmdW5jdGlvbiAoJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3RhYmxlYWpheC90YWJsZWFqYXgudHBsLmh0bWwnLCAnPGRpdiBjbGFzcz1cImFkLXRhYmxlLWFqYXgtY29udGFpbmVyXCIgbmctaWY9XCJpdGVtcy5wYWdpbmcudG90YWxQYWdlcyB8fCBsb2NhbENvbmZpZy5sb2FkaW5nRGF0YSB8fCAhYXR0cnMuaXRlbXNOb3RGb3VuZE1lc3NhZ2VcIj48dGFibGUgY2xhc3M9XCJhZC1zdGlja3ktdGFibGVcIiBuZy1jbGFzcz1cImF0dHJzLnRhYmxlQ2xhc3NlcyB8fCBcXCd0YWJsZVxcJ1wiIG5nLWlmPVwibG9jYWxDb25maWcudGFibGVNYXhIZWlnaHRcIj48dHIgY2xhc3M9XCJhZC11c2VyLXNlbGVjdC1ub25lXCI+PHRoIGRhdGEtbmctcmVwZWF0PVwiZGVmaW5pdGlvbiBpbiBjb2x1bW5EZWZpbml0aW9uXCIgbmctY2xpY2s9XCJzb3J0QnlDb2x1bW4oZGVmaW5pdGlvbilcIiBuZy1jbGFzcz1cIntcXCdhZC1jdXJzb3ItcG9pbnRlclxcJzogZGVmaW5pdGlvbi5zb3J0S2V5fVwiIG5nLXN0eWxlPVwie1xcJ3dpZHRoXFwnOiBkZWZpbml0aW9uLndpZHRofVwiPjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlID09IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydEFzY2VuZGluZ1wiIG5nLWhpZGU9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPiA8aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnREZXNjZW5kaW5nXCIgbmctc2hvdz1cImxvY2FsQ29uZmlnLnJldmVyc2VcIj48L2k+PC9kaXY+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1pZj1cImRlZmluaXRpb24uc29ydEtleSAmJiBsb2NhbENvbmZpZy5wcmVkaWNhdGUgIT0gZGVmaW5pdGlvbi5zb3J0S2V5XCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0YWJsZVwiPjwvaT48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJUZW1wbGF0ZVwiIG5nLWJpbmQtaHRtbD1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIj48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiIG5nLWJpbmQ9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlckRpc3BsYXlOYW1lXCI+PC9kaXY+PC90aD48L3RyPjwvdGFibGU+PGRpdiBjbGFzcz1cImFkLXRhYmxlLWNvbnRhaW5lclwiIG5nLXN0eWxlPVwie1xcJ21heC1oZWlnaHRcXCc6IGxvY2FsQ29uZmlnLnRhYmxlTWF4SGVpZ2h0fVwiPjx0YWJsZSBuZy1jbGFzcz1cImF0dHJzLnRhYmxlQ2xhc3NlcyB8fCBcXCd0YWJsZVxcJ1wiPjx0ciBjbGFzcz1cImFkLXVzZXItc2VsZWN0LW5vbmVcIiBuZy1pZj1cIiFsb2NhbENvbmZpZy50YWJsZU1heEhlaWdodFwiPjx0aCBkYXRhLW5nLXJlcGVhdD1cImRlZmluaXRpb24gaW4gY29sdW1uRGVmaW5pdGlvblwiIG5nLWNsaWNrPVwic29ydEJ5Q29sdW1uKGRlZmluaXRpb24pXCIgbmctY2xhc3M9XCJ7XFwnYWQtY3Vyc29yLXBvaW50ZXJcXCc6IGRlZmluaXRpb24uc29ydEtleX1cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9PSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRBc2NlbmRpbmdcIiBuZy1oaWRlPVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT4gPGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0RGVzY2VuZGluZ1wiIG5nLXNob3c9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPjwvZGl2PjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlICE9IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydGFibGVcIj48L2k+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIiBuZy1iaW5kLWh0bWw9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCI+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIiBuZy1iaW5kPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiPjwvZGl2PjwvdGg+PC90cj48dHIgZGF0YS1uZy1yZXBlYXQ9XCJpdGVtIGluIGl0ZW1zLmxpc3RcIj48dGQgZGF0YS1uZy1yZXBlYXQ9XCJkZWZpbml0aW9uIGluIGNvbHVtbkRlZmluaXRpb25cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVVybFwiPjxuZy1pbmNsdWRlIHNyYz1cImRlZmluaXRpb24udGVtcGxhdGVVcmxcIj48L25nLWluY2x1ZGU+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24udGVtcGxhdGVcIj48c3BhbiBhZC1jb21waWxlLXRlbXBsYXRlPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPjwvc3Bhbj48L2Rpdj48ZGl2IG5nLWlmPVwiIWRlZmluaXRpb24udGVtcGxhdGVVcmwgJiYgIWRlZmluaXRpb24udGVtcGxhdGVcIj57eyBhZFN0cmFwVXRpbHMuYXBwbHlGaWx0ZXIoYWRTdHJhcFV0aWxzLmdldE9iamVjdFByb3BlcnR5KGl0ZW0sIGRlZmluaXRpb24uZGlzcGxheVByb3BlcnR5LCBpdGVtKSwgZGVmaW5pdGlvbi5jZWxsRmlsdGVyKSB9fTwvZGl2PjwvdGQ+PC90cj48L3RhYmxlPjxhZC1sb2FkaW5nLW92ZXJsYXkgbG9hZGluZz1cImxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhXCI+PC9hZC1sb2FkaW5nLW92ZXJsYXk+PC9kaXY+PGRpdiBjbGFzcz1cInJvd1wiPjxkaXYgY2xhc3M9XCJjb2wtbWQtOCBjb2wtc20tOFwiPjxkaXYgY2xhc3M9XCJwdWxsLWxlZnRcIiBuZy1jbGFzcz1cImF0dHJzLnBhZ2luYXRpb25CdG5Hcm91cENsYXNzZXMgfHwgXFwnYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVxcJ1wiIG5nLXNob3c9XCJpdGVtcy5wYWdpbmcudG90YWxQYWdlcyA+IDFcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWNsaWNrPVwibG9hZFBhZ2UoMSlcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSAxXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5maXJzdFBhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctY2xpY2s9XCJsb2FkUHJldmlvdXNQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSAxXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5wcmV2aW91c1BhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctcmVwZWF0PVwicGFnZSBpbiBsb2NhbENvbmZpZy5wYWdpbmdBcnJheVwiIG5nLWNsYXNzPVwie2FjdGl2ZTogaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IHBhZ2V9XCIgbmctY2xpY2s9XCJsb2FkUGFnZShwYWdlKVwiPnt7IHBhZ2UgfX08L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1jbGljaz1cImxvYWROZXh0UGFnZSgpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gaXRlbXMucGFnaW5nLnRvdGFsUGFnZXNcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLm5leHRQYWdlXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWNsaWNrPVwibG9hZExhc3RQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSBpdGVtcy5wYWdpbmcudG90YWxQYWdlc1wiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMubGFzdFBhZ2VcIj48L2k+PC9idXR0b24+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cImNvbC1tZC00IGNvbC1zbS00XCI+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1jbGFzcz1cImF0dHJzLnBhZ2luYXRpb25CdG5Hcm91cENsYXNzZXMgfHwgXFwnYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVxcJ1wiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctcmVwZWF0PVwic2l6ZSBpbiBpdGVtcy5wYWdpbmcucGFnZVNpemVzXCIgbmctY2xhc3M9XCJ7YWN0aXZlOiBpdGVtcy5wYWdpbmcucGFnZVNpemUgPT0gc2l6ZX1cIiBuZy1jbGljaz1cInBhZ2VTaXplQ2hhbmdlZChzaXplKVwiPnt7IHNpemUgfX08L2J1dHRvbj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IG5nLWlmPVwiIWl0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzICYmICFsb2NhbENvbmZpZy5sb2FkaW5nRGF0YSAmJiBhdHRycy5pdGVtc05vdEZvdW5kTWVzc2FnZVwiPjxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1pbmZvXCIgcm9sZT1cImFsZXJ0XCI+e3sgYXR0cnMuaXRlbXNOb3RGb3VuZE1lc3NhZ2UgfX08L2Rpdj48L2Rpdj4nKTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogdGFibGVsaXRlLnRwbC5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLnRhYmxlbGl0ZScpLnJ1bihbXG4gICckdGVtcGxhdGVDYWNoZScsXG4gIGZ1bmN0aW9uICgkdGVtcGxhdGVDYWNoZSkge1xuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgndGFibGVsaXRlL3RhYmxlbGl0ZS50cGwuaHRtbCcsICc8ZGl2IGNsYXNzPVwiYWQtdGFibGUtbGl0ZS1jb250YWluZXJcIiBuZy1pZj1cIml0ZW1zLmFsbEl0ZW1zLmxlbmd0aCB8fCAhYXR0cnMuaXRlbXNOb3RGb3VuZE1lc3NhZ2VcIj48dGFibGUgY2xhc3M9XCJhZC1zdGlja3ktdGFibGVcIiBuZy1jbGFzcz1cImF0dHJzLnRhYmxlQ2xhc3NlcyB8fCBcXCd0YWJsZVxcJ1wiIG5nLWlmPVwiYXR0cnMudGFibGVNYXhIZWlnaHRcIj48dHIgY2xhc3M9XCJhZC11c2VyLXNlbGVjdC1ub25lXCI+PHRoIGNsYXNzPVwiYWQtc2VsZWN0LWNlbGxcIiBuZy1pZj1cImF0dHJzLmRyYWdnYWJsZVwiPjxpPjwvaT48L3RoPjx0aCBjbGFzcz1cImFkLXNlbGVjdC1jZWxsXCIgbmctaWY9XCJhdHRycy5zZWxlY3RlZEl0ZW1zICYmIGl0ZW1zLmFsbEl0ZW1zXCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiYWQtY3Vyc29yLXBvaW50ZXJcIiBuZy1jbGljaz1cImFkU3RyYXBVdGlscy5hZGRSZW1vdmVJdGVtc0Zyb21MaXN0KGl0ZW1zLmFsbEl0ZW1zLCBzZWxlY3RlZEl0ZW1zKVwiIG5nLWNoZWNrZWQ9XCJhZFN0cmFwVXRpbHMuaXRlbXNFeGlzdEluTGlzdChpdGVtcy5hbGxJdGVtcywgc2VsZWN0ZWRJdGVtcylcIj48L3RoPjx0aCBkYXRhLW5nLXJlcGVhdD1cImRlZmluaXRpb24gaW4gY29sdW1uRGVmaW5pdGlvblwiIG5nLWNsaWNrPVwic29ydEJ5Q29sdW1uKGRlZmluaXRpb24pXCIgbmctY2xhc3M9XCJ7XFwnYWQtY3Vyc29yLXBvaW50ZXJcXCc6IGRlZmluaXRpb24uc29ydEtleX1cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9PSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRBc2NlbmRpbmdcIiBuZy1oaWRlPVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT4gPGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0RGVzY2VuZGluZ1wiIG5nLXNob3c9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPjwvZGl2PjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlICE9IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydGFibGVcIj48L2k+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIiBuZy1iaW5kLWh0bWw9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCI+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIiBuZy1iaW5kPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiPjwvZGl2PjwvdGg+PC90cj48L3RhYmxlPjxkaXYgY2xhc3M9XCJhZC10YWJsZS1jb250YWluZXJcIiBuZy1zdHlsZT1cIntcXCdtYXgtaGVpZ2h0XFwnOiBhdHRycy50YWJsZU1heEhlaWdodH1cIj48dGFibGUgbmctY2xhc3M9XCJhdHRycy50YWJsZUNsYXNzZXMgfHwgXFwndGFibGVcXCdcIj48dHIgY2xhc3M9XCJhZC11c2VyLXNlbGVjdC1ub25lXCIgbmctaWY9XCIhYXR0cnMudGFibGVNYXhIZWlnaHRcIj48dGggY2xhc3M9XCJhZC1zZWxlY3QtY2VsbFwiIG5nLWlmPVwiYXR0cnMuZHJhZ2dhYmxlXCI+PGk+PC9pPjwvdGg+PHRoIGNsYXNzPVwiYWQtc2VsZWN0LWNlbGxcIiBuZy1pZj1cImF0dHJzLnNlbGVjdGVkSXRlbXMgJiYgaXRlbXMuYWxsSXRlbXNcIj48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJhZC1jdXJzb3ItcG9pbnRlclwiIG5nLWNsaWNrPVwiYWRTdHJhcFV0aWxzLmFkZFJlbW92ZUl0ZW1zRnJvbUxpc3QoaXRlbXMuYWxsSXRlbXMsIHNlbGVjdGVkSXRlbXMpXCIgbmctY2hlY2tlZD1cImFkU3RyYXBVdGlscy5pdGVtc0V4aXN0SW5MaXN0KGl0ZW1zLmFsbEl0ZW1zLCBzZWxlY3RlZEl0ZW1zKVwiPjwvdGg+PHRoIGRhdGEtbmctcmVwZWF0PVwiZGVmaW5pdGlvbiBpbiBjb2x1bW5EZWZpbml0aW9uXCIgbmctY2xpY2s9XCJzb3J0QnlDb2x1bW4oZGVmaW5pdGlvbilcIiBuZy1jbGFzcz1cIntcXCdhZC1jdXJzb3ItcG9pbnRlclxcJzogZGVmaW5pdGlvbi5zb3J0S2V5fVwiIG5nLXN0eWxlPVwie1xcJ3dpZHRoXFwnOiBkZWZpbml0aW9uLndpZHRofVwiPjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlID09IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydEFzY2VuZGluZ1wiIG5nLWhpZGU9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPiA8aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnREZXNjZW5kaW5nXCIgbmctc2hvdz1cImxvY2FsQ29uZmlnLnJldmVyc2VcIj48L2k+PC9kaXY+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1pZj1cImRlZmluaXRpb24uc29ydEtleSAmJiBsb2NhbENvbmZpZy5wcmVkaWNhdGUgIT0gZGVmaW5pdGlvbi5zb3J0S2V5XCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0YWJsZVwiPjwvaT48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJUZW1wbGF0ZVwiIG5nLWJpbmQtaHRtbD1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIj48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiIG5nLWJpbmQ9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlckRpc3BsYXlOYW1lXCI+PC9kaXY+PC90aD48L3RyPjx0ciBuZy1pZj1cIiFhdHRycy5kcmFnZ2FibGVcIiBkYXRhLW5nLXJlcGVhdD1cIml0ZW0gaW4gaXRlbXMubGlzdFwiIG5nLWNsYXNzPVwie1xcJ2FkLXNlbGVjdGVkXFwnOiBhdHRycy5zZWxlY3RlZEl0ZW1zICYmIGFkU3RyYXBVdGlscy5pdGVtRXhpc3RzSW5MaXN0KGl0ZW0sIHNlbGVjdGVkSXRlbXMpfVwiPjx0ZCBjbGFzcz1cImFkLXNlbGVjdC1jZWxsXCIgbmctaWY9XCJhdHRycy5zZWxlY3RlZEl0ZW1zXCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiYWQtY3Vyc29yLXBvaW50ZXJcIiBuZy1jaGVja2VkPVwiYWRTdHJhcFV0aWxzLml0ZW1FeGlzdHNJbkxpc3QoaXRlbSwgc2VsZWN0ZWRJdGVtcylcIiBuZy1jbGljaz1cImFkU3RyYXBVdGlscy5hZGRSZW1vdmVJdGVtRnJvbUxpc3QoaXRlbSwgc2VsZWN0ZWRJdGVtcylcIj48L3RkPjx0ZCBkYXRhLW5nLXJlcGVhdD1cImRlZmluaXRpb24gaW4gY29sdW1uRGVmaW5pdGlvblwiIG5nLXN0eWxlPVwie1xcJ3dpZHRoXFwnOiBkZWZpbml0aW9uLndpZHRofVwiPjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLnRlbXBsYXRlVXJsXCI+PG5nLWluY2x1ZGUgc3JjPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVVybFwiPjwvbmctaW5jbHVkZT48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPjxzcGFuIGFkLWNvbXBpbGUtdGVtcGxhdGU9XCJkZWZpbml0aW9uLnRlbXBsYXRlXCI+PC9zcGFuPjwvZGl2PjxkaXYgbmctaWY9XCIhZGVmaW5pdGlvbi50ZW1wbGF0ZVVybCAmJiAhZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPnt7IGFkU3RyYXBVdGlscy5hcHBseUZpbHRlcihhZFN0cmFwVXRpbHMuZ2V0T2JqZWN0UHJvcGVydHkoaXRlbSwgZGVmaW5pdGlvbi5kaXNwbGF5UHJvcGVydHkpLCBkZWZpbml0aW9uLmNlbGxGaWx0ZXIpIH19PC9kaXY+PC90ZD48L3RyPjx0ciBuZy1pZj1cImF0dHJzLmRyYWdnYWJsZVwiIGFkLWRyYWc9XCJ0cnVlXCIgYWQtZHJhZy1oYW5kbGU9XCJ0cnVlXCIgYWQtZHJvcD1cInRydWVcIiBhZC1kcmFnLWRhdGE9XCJpdGVtXCIgYWQtZHJvcC1vdmVyPVwib25EcmFnT3ZlcigkZGF0YSwgJGRyYWdFbGVtZW50LCAkZHJvcEVsZW1lbnQsICRldmVudClcIiBhZC1kcm9wLWVuZD1cIm9uRHJvcEVuZCgkZGF0YSwgJGRyYWdFbGVtZW50LCAkZHJvcEVsZW1lbnQsICRldmVudClcIiBhZC1kcmFnLWJlZ2luPVwib25EcmFnU3RhcnQoJGRhdGEsICRkcmFnRWxlbWVudCwgJGV2ZW50KVwiIGFkLWRyYWctZW5kPVwib25EcmFnRW5kKCRkYXRhLCAkZHJhZ0VsZW1lbnQsICRldmVudClcIiBkYXRhLW5nLXJlcGVhdD1cIml0ZW0gaW4gaXRlbXMubGlzdFwiIG5nLWNsYXNzPVwie1xcJ2FkLXNlbGVjdGVkXFwnOiBhdHRycy5zZWxlY3RlZEl0ZW1zICYmIGFkU3RyYXBVdGlscy5pdGVtRXhpc3RzSW5MaXN0KGl0ZW0sIHNlbGVjdGVkSXRlbXMpfVwiPjx0ZCBjbGFzcz1cImFkLXNlbGVjdC1jZWxsIGFkLWRyYWctaGFuZGxlXCIgbmctaWY9XCJhdHRycy5kcmFnZ2FibGVcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLmRyYWdnYWJsZVwiPjwvaT48L3RkPjx0ZCBjbGFzcz1cImFkLXNlbGVjdC1jZWxsXCIgbmctaWY9XCJhdHRycy5zZWxlY3RlZEl0ZW1zXCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiYWQtY3Vyc29yLXBvaW50ZXJcIiBuZy1jaGVja2VkPVwiYWRTdHJhcFV0aWxzLml0ZW1FeGlzdHNJbkxpc3QoaXRlbSwgc2VsZWN0ZWRJdGVtcylcIiBuZy1jbGljaz1cImFkU3RyYXBVdGlscy5hZGRSZW1vdmVJdGVtRnJvbUxpc3QoaXRlbSwgc2VsZWN0ZWRJdGVtcylcIj48L3RkPjx0ZCBkYXRhLW5nLXJlcGVhdD1cImRlZmluaXRpb24gaW4gY29sdW1uRGVmaW5pdGlvblwiIG5nLXN0eWxlPVwie1xcJ3dpZHRoXFwnOiBkZWZpbml0aW9uLndpZHRofVwiPjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLnRlbXBsYXRlVXJsXCI+PG5nLWluY2x1ZGUgc3JjPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVVybFwiPjwvbmctaW5jbHVkZT48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPjxzcGFuIGFkLWNvbXBpbGUtdGVtcGxhdGU9XCJkZWZpbml0aW9uLnRlbXBsYXRlXCI+PC9zcGFuPjwvZGl2PjxkaXYgbmctaWY9XCIhZGVmaW5pdGlvbi50ZW1wbGF0ZVVybCAmJiAhZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPnt7IGFkU3RyYXBVdGlscy5hcHBseUZpbHRlcihhZFN0cmFwVXRpbHMuZ2V0T2JqZWN0UHJvcGVydHkoaXRlbSwgZGVmaW5pdGlvbi5kaXNwbGF5UHJvcGVydHkpLCBkZWZpbml0aW9uLmNlbGxGaWx0ZXIpIH19PC9kaXY+PC90ZD48L3RyPjwvdGFibGU+PC9kaXY+PGRpdiBjbGFzcz1cInJvd1wiIG5nLWlmPVwiaXRlbXMuYWxsSXRlbXMubGVuZ3RoID4gaXRlbXMucGFnaW5nLnBhZ2VTaXplc1swXSAmJiAhYXR0cnMuZGlzYWJsZVBhZ2luZ1wiPjxkaXYgY2xhc3M9XCJjb2wtbWQtOCBjb2wtc20tOFwiPjxkaXYgY2xhc3M9XCJwdWxsLWxlZnRcIiBuZy1jbGFzcz1cImF0dHJzLnBhZ2luYXRpb25CdG5Hcm91cENsYXNzZXMgfHwgXFwnYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVxcJ1wiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctY2xpY2s9XCJsb2FkUGFnZSgxKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IDFcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLmZpcnN0UGFnZVwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1pZj1cIiFhdHRycy5kcmFnZ2FibGVcIiBuZy1jbGljaz1cImxvYWRQcmV2aW91c1BhZ2UoKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IDFcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnByZXZpb3VzUGFnZVwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgaWQ9XCJidG5QcmV2XCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1pZj1cImF0dHJzLmRyYWdnYWJsZVwiIGFkLWRyb3A9XCJ0cnVlXCIgYWQtZHJvcC1vdmVyPVwib25OZXh0UGFnZUJ1dHRvbk92ZXIoJGRhdGEsICRkcmFnRWxlbWVudCwgJGRyb3BFbGVtZW50LCAkZXZlbnQpXCIgYWQtZHJvcC1lbmQ9XCJvbk5leHRQYWdlQnV0dG9uRHJvcCgkZGF0YSwgJGRyYWdFbGVtZW50LCAkZHJvcEVsZW1lbnQsICRldmVudClcIiBuZy1jbGljaz1cImxvYWRQcmV2aW91c1BhZ2UoKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IDFcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnByZXZpb3VzUGFnZVwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1yZXBlYXQ9XCJwYWdlIGluIGxvY2FsQ29uZmlnLnBhZ2luZ0FycmF5XCIgbmctY2xhc3M9XCJ7YWN0aXZlOiBpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gcGFnZX1cIiBuZy1jbGljaz1cImxvYWRQYWdlKHBhZ2UpXCI+e3sgcGFnZSB9fTwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWlmPVwiIWF0dHJzLmRyYWdnYWJsZVwiIG5nLWNsaWNrPVwibG9hZE5leHRQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSBpdGVtcy5wYWdpbmcudG90YWxQYWdlc1wiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMubmV4dFBhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJidG5OZXh0XCIgbmctaWY9XCJhdHRycy5kcmFnZ2FibGVcIiBhZC1kcm9wPVwidHJ1ZVwiIGFkLWRyb3Atb3Zlcj1cIm9uTmV4dFBhZ2VCdXR0b25PdmVyKCRkYXRhLCAkZHJhZ0VsZW1lbnQsICRkcm9wRWxlbWVudCwgJGV2ZW50KVwiIGFkLWRyb3AtZW5kPVwib25OZXh0UGFnZUJ1dHRvbkRyb3AoJGRhdGEsICRkcmFnRWxlbWVudCwgJGRyb3BFbGVtZW50LCAkZXZlbnQpXCIgbmctY2xpY2s9XCJsb2FkTmV4dFBhZ2UoKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IGl0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5uZXh0UGFnZVwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1jbGljaz1cImxvYWRMYXN0UGFnZSgpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gaXRlbXMucGFnaW5nLnRvdGFsUGFnZXNcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLmxhc3RQYWdlXCI+PC9pPjwvYnV0dG9uPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJjb2wtbWQtNCBjb2wtc20tNFwiPjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctY2xhc3M9XCJhdHRycy5wYWdpbmF0aW9uQnRuR3JvdXBDbGFzc2VzIHx8IFxcJ2J0bi1ncm91cCBidG4tZ3JvdXAtc21cXCdcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLXJlcGVhdD1cInNpemUgaW4gaXRlbXMucGFnaW5nLnBhZ2VTaXplc1wiIG5nLWNsYXNzPVwie2FjdGl2ZTogaXRlbXMucGFnaW5nLnBhZ2VTaXplID09IHNpemV9XCIgbmctY2xpY2s9XCJwYWdlU2l6ZUNoYW5nZWQoc2l6ZSlcIj57eyBzaXplIH19PC9idXR0b24+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBuZy1pZj1cIiFpdGVtcy5hbGxJdGVtcy5sZW5ndGggJiYgYXR0cnMuaXRlbXNOb3RGb3VuZE1lc3NhZ2VcIj48ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtaW5mb1wiIHJvbGU9XCJhbGVydFwiPnt7IGF0dHJzLml0ZW1zTm90Rm91bmRNZXNzYWdlIH19PC9kaXY+PC9kaXY+Jyk7XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IHRyZWVicm93c2VyLnRwbC5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLnRyZWVicm93c2VyJykucnVuKFtcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgZnVuY3Rpb24gKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCd0cmVlYnJvd3Nlci90cmVlYnJvd3Nlci50cGwuaHRtbCcsICc8ZGl2IGNsYXNzPVwiYWQtdHJlZS1icm93c2VyLWNvbnRhaW5lclwiIG5nLWNsYXNzPVwie1xcJ3RyZWUtYm9yZGVyZWRcXCc6IGF0dHJzLmJvcmRlcmVkfVwiPjxkaXYgZGF0YS1sZXZlbD1cIjBcIiBjbGFzcz1cInRyZWUtdmlld1wiPjxkaXYgY2xhc3M9XCJ0cmVlXCI+PHNjcmlwdCB0eXBlPVwidGV4dC9uZy10ZW1wbGF0ZVwiIGlkPVwie3sgbG9jYWxDb25maWcucmVuZGVyZXJUZW1wbGF0ZUlkIH19XCI+PGRpdiBjbGFzcz1cImNvbnRlbnRcIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgbmctc3R5bGU9XCJ7XFwncGFkZGluZy1sZWZ0XFwnOiBsZXZlbCAqIChhdHRycy5jaGlsZHJlblBhZGRpbmcgfHwgMTUpICsgXFwncHhcXCd9XCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgIG5nLWNsYXNzPVwie3sgYXR0cnMucm93TmdDbGFzcyB9fVwiPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudC1ob2xkZXJcIj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0b2dnbGVcIj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBuZy1pZj1cIiFpdGVtLl9hZF9leHBhbmRlZCAmJiBoYXNDaGlsZHJlbihpdGVtKSAmJiAhaXRlbS5fYWRfbG9hZGluZ1wiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5leHBhbmRcIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwidG9nZ2xlKCRldmVudCxpdGVtKVwiPjwvaT5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBuZy1pZj1cIml0ZW0uX2FkX2V4cGFuZGVkICYmICFpdGVtLl9hZF9sb2FkaW5nXCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cImljb25DbGFzc2VzLmNvbGxhcHNlXCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cInRvZ2dsZSgkZXZlbnQsaXRlbSlcIj48L2k+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gbmctaWY9XCJpdGVtLl9hZF9sb2FkaW5nXCI+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMubG9hZGluZ1NwaW5uZXJcIj48L2k+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibm9kZS1jb250ZW50XCI+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1pbmNsdWRlIG5nLWlmPVwiYXR0cnMubm9kZVRlbXBsYXRlVXJsXCIgc3JjPVwiYXR0cnMubm9kZVRlbXBsYXRlVXJsXCI+PC9uZy1pbmNsdWRlPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBuZy1pZj1cIiFhdHRycy5ub2RlVGVtcGxhdGVVcmxcIj57eyBpdGVtLm5hbWUgfHwgXCJcIiB9fTwvc3Bhbj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgKyAnICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICsgJyAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICsgJyAgICAgICAgICAgICAgICA8ZGl2IG5nLXNob3c9XCJpdGVtLl9hZF9leHBhbmRlZFwiPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidHJlZS1sZXZlbCB0cmVlLXN1Yi1sZXZlbFwiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2FkPVwibGV2ZWw9bGV2ZWwrMVwiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgbmctcmVwZWF0PVwiaXRlbSBpbiBpdGVtW2F0dHJzLmNoaWxkTm9kZV1cIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWluY2x1ZGU9XCJcXCd7eyBsb2NhbENvbmZpZy5yZW5kZXJlclRlbXBsYXRlSWQgfX1cXCdcIj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArICcgICAgICAgICAgICAgICAgPC9kaXY+PC9zY3JpcHQ+PGRpdj48ZGl2IGNsYXNzPVwidHJlZS1sZXZlbCB0cmVlLWhlYWRlci1sZXZlbCBib3JkZXJcIiBuZy1pZj1cImF0dHJzLm5vZGVIZWFkZXJVcmxcIj48ZGl2IGNsYXNzPVwiY29udGVudFwiIG5nLXN0eWxlPVwie1xcJ3BhZGRpbmctbGVmdFxcJzogKGF0dHJzLmNoaWxkcmVuUGFkZGluZyB8fCAxNSkgKyBcXCdweFxcJ31cIj48ZGl2IGNsYXNzPVwiY29udGVudC1ob2xkZXJcIj48ZGl2IGNsYXNzPVwidG9nZ2xlXCI+PC9kaXY+PGRpdiBjbGFzcz1cIm5vZGUtY29udGVudCBhZC11c2VyLXNlbGVjdC1ub25lXCIgbmctaW5jbHVkZT1cImF0dHJzLm5vZGVIZWFkZXJVcmxcIj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwidHJlZS1sZXZlbCB0cmVlLXRvcC1sZXZlbCBib3JkZXJcIiBvbmxvYWQ9XCJsZXZlbCA9IDFcIiBuZy1yZXBlYXQ9XCJpdGVtIGluIHRyZWVSb290W2F0dHJzLmNoaWxkTm9kZV1cIiBuZy1pbmNsdWRlPVwiXFwne3sgbG9jYWxDb25maWcucmVuZGVyZXJUZW1wbGF0ZUlkIH19XFwnXCI+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+Jyk7XG4gIH1cbl0pO1xuXG5cbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xuIiwiLyoqXG4gKiBhbmd1bGFyLWdyb3dsLXYyIC0gdjAuNy4wIC0gMjAxNC0wOC0xMFxuICogaHR0cDovL2phbnN0ZXZlbnMuZ2l0aHViLmlvL2FuZ3VsYXItZ3Jvd2wtMlxuICogQ29weXJpZ2h0IChjKSAyMDE0IE1hcmNvIFJpbmNrLEphbiBTdGV2ZW5zOyBMaWNlbnNlZCBNSVRcbiAqL1xuYW5ndWxhci5tb2R1bGUoXCJhbmd1bGFyLWdyb3dsXCIsW10pLGFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhci1ncm93bFwiKS5kaXJlY3RpdmUoXCJncm93bFwiLFtcIiRyb290U2NvcGVcIixcIiRzY2VcIixmdW5jdGlvbihhLGIpe1widXNlIHN0cmljdFwiO3JldHVybntyZXN0cmljdDpcIkFcIix0ZW1wbGF0ZVVybDpcInRlbXBsYXRlcy9ncm93bC9ncm93bC5odG1sXCIscmVwbGFjZTohMSxzY29wZTp7cmVmZXJlbmNlOlwiQFwiLGlubGluZTpcIkBcIixsaW1pdE1lc3NhZ2VzOlwiPVwifSxjb250cm9sbGVyOltcIiRzY29wZVwiLFwiJHRpbWVvdXRcIixcImdyb3dsXCIsZnVuY3Rpb24oYyxkLGUpe2Z1bmN0aW9uIGYoYSl7ZChmdW5jdGlvbigpe3ZhciBmLGg7aWYoIWd8fChhbmd1bGFyLmZvckVhY2goYy5tZXNzYWdlcyxmdW5jdGlvbihjKXtoPWIuZ2V0VHJ1c3RlZEh0bWwoYy50ZXh0KSxhLnRleHQ9PT1oJiZhLnNldmVyaXR5PT09Yy5zZXZlcml0eSYmYy50aXRsZT09PWMudGl0bGUmJihmPSEwKX0pLCFmKSl7aWYoYS50ZXh0PWIudHJ1c3RBc0h0bWwoU3RyaW5nKGEudGV4dCkpLGEudHRsJiYtMSE9PWEudHRsJiYoYS5jb3VudGRvd249YS50dGwvMWUzLGEucHJvbWlzZXM9W10sYS5jbG9zZT0hMSxhLmNvdW50ZG93bkZ1bmN0aW9uPWZ1bmN0aW9uKCl7YS5jb3VudGRvd24+MT8oYS5jb3VudGRvd24tLSxhLnByb21pc2VzLnB1c2goZChhLmNvdW50ZG93bkZ1bmN0aW9uLDFlMykpKTphLmNvdW50ZG93bi0tfSksYW5ndWxhci5pc0RlZmluZWQoYy5saW1pdE1lc3NhZ2VzKSl7dmFyIGk9Yy5tZXNzYWdlcy5sZW5ndGgtKGMubGltaXRNZXNzYWdlcy0xKTtpPjAmJmMubWVzc2FnZXMuc3BsaWNlKGMubGltaXRNZXNzYWdlcy0xLGkpfWUucmV2ZXJzZU9yZGVyKCk/Yy5tZXNzYWdlcy51bnNoaWZ0KGEpOmMubWVzc2FnZXMucHVzaChhKSxhLnR0bCYmLTEhPT1hLnR0bCYmKGEucHJvbWlzZXMucHVzaChkKGZ1bmN0aW9uKCl7Yy5kZWxldGVNZXNzYWdlKGEpfSxhLnR0bCkpLGEucHJvbWlzZXMucHVzaChkKGEuY291bnRkb3duRnVuY3Rpb24sMWUzKSkpfX0sITApfXZhciBnPWUub25seVVuaXF1ZSgpO2MubWVzc2FnZXM9W107dmFyIGg9Yy5yZWZlcmVuY2V8fDA7Yy5pbmxpbmVNZXNzYWdlPWMuaW5saW5lfHxlLmlubGluZU1lc3NhZ2VzKCksYS4kb24oXCJncm93bE1lc3NhZ2VcIixmdW5jdGlvbihhLGIpe3BhcnNlSW50KGgsMTApPT09cGFyc2VJbnQoYi5yZWZlcmVuY2VJZCwxMCkmJmYoYil9KSxjLmRlbGV0ZU1lc3NhZ2U9ZnVuY3Rpb24oYSl7dmFyIGI9Yy5tZXNzYWdlcy5pbmRleE9mKGEpO2I+LTEmJmMubWVzc2FnZXMuc3BsaWNlKGIsMSl9LGMuc3RvcFRpbWVvdXRDbG9zZT1mdW5jdGlvbihhKXthbmd1bGFyLmZvckVhY2goYS5wcm9taXNlcyxmdW5jdGlvbihhKXtkLmNhbmNlbChhKX0pLGEuY2xvc2U/Yy5kZWxldGVNZXNzYWdlKGEpOmEuY2xvc2U9ITB9LGMuYWxlcnRDbGFzc2VzPWZ1bmN0aW9uKGEpe3JldHVybntcImFsZXJ0LXN1Y2Nlc3NcIjpcInN1Y2Nlc3NcIj09PWEuc2V2ZXJpdHksXCJhbGVydC1lcnJvclwiOlwiZXJyb3JcIj09PWEuc2V2ZXJpdHksXCJhbGVydC1kYW5nZXJcIjpcImVycm9yXCI9PT1hLnNldmVyaXR5LFwiYWxlcnQtaW5mb1wiOlwiaW5mb1wiPT09YS5zZXZlcml0eSxcImFsZXJ0LXdhcm5pbmdcIjpcIndhcm5pbmdcIj09PWEuc2V2ZXJpdHksaWNvbjphLmRpc2FibGVJY29ucz09PSExLFwiYWxlcnQtZGlzbWlzc2FibGVcIjohYS5kaXNhYmxlQ2xvc2VCdXR0b259fSxjLnNob3dDb3VudERvd249ZnVuY3Rpb24oYSl7cmV0dXJuIWEuZGlzYWJsZUNvdW50RG93biYmYS50dGw+MH0sYy53cmFwcGVyQ2xhc3Nlcz1mdW5jdGlvbigpe3ZhciBhPXt9O3JldHVybiBhW1wiZ3Jvd2wtZml4ZWRcIl09IWMuaW5saW5lTWVzc2FnZSxhW2UucG9zaXRpb24oKV09ITAsYX0sYy5jb21wdXRlVGl0bGU9ZnVuY3Rpb24oYSl7dmFyIGI9e3N1Y2Nlc3M6XCJTdWNjZXNzXCIsZXJyb3I6XCJFcnJvclwiLGluZm86XCJJbmZvcm1hdGlvblwiLHdhcm46XCJXYXJuaW5nXCJ9O3JldHVybiBiW2Euc2V2ZXJpdHldfX1dfX1dKSxhbmd1bGFyLm1vZHVsZShcImFuZ3VsYXItZ3Jvd2xcIikucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYSl7XCJ1c2Ugc3RyaWN0XCI7dm9pZCAwPT09YS5nZXQoXCJ0ZW1wbGF0ZXMvZ3Jvd2wvZ3Jvd2wuaHRtbFwiKSYmYS5wdXQoXCJ0ZW1wbGF0ZXMvZ3Jvd2wvZ3Jvd2wuaHRtbFwiLCc8ZGl2IGNsYXNzPVwiZ3Jvd2wtY29udGFpbmVyXCIgbmctY2xhc3M9XCJ3cmFwcGVyQ2xhc3NlcygpXCI+PGRpdiBjbGFzcz1cImdyb3dsLWl0ZW0gYWxlcnRcIiBuZy1yZXBlYXQ9XCJtZXNzYWdlIGluIG1lc3NhZ2VzXCIgbmctY2xhc3M9XCJhbGVydENsYXNzZXMobWVzc2FnZSlcIiBuZy1jbGljaz1cInN0b3BUaW1lb3V0Q2xvc2UobWVzc2FnZSlcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgZGF0YS1kaXNtaXNzPVwiYWxlcnRcIiBhcmlhLWhpZGRlbj1cInRydWVcIiBuZy1jbGljaz1cImRlbGV0ZU1lc3NhZ2UobWVzc2FnZSlcIiBuZy1zaG93PVwiIW1lc3NhZ2UuZGlzYWJsZUNsb3NlQnV0dG9uXCI+JnRpbWVzOzwvYnV0dG9uPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBhcmlhLWhpZGRlbj1cInRydWVcIiBuZy1zaG93PVwic2hvd0NvdW50RG93bihtZXNzYWdlKVwiPnt7bWVzc2FnZS5jb3VudGRvd259fTwvYnV0dG9uPjxoNCBjbGFzcz1cImdyb3dsLXRpdGxlXCIgbmctc2hvdz1cIm1lc3NhZ2UudGl0bGVcIiBuZy1iaW5kPVwibWVzc2FnZS50aXRsZVwiPjwvaDQ+PGRpdiBjbGFzcz1cImdyb3dsLW1lc3NhZ2VcIiBuZy1iaW5kLWh0bWw9XCJtZXNzYWdlLnRleHRcIj48L2Rpdj48L2Rpdj48L2Rpdj4nKX1dKSxhbmd1bGFyLm1vZHVsZShcImFuZ3VsYXItZ3Jvd2xcIikucHJvdmlkZXIoXCJncm93bFwiLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7dmFyIGE9e3N1Y2Nlc3M6bnVsbCxlcnJvcjpudWxsLHdhcm5pbmc6bnVsbCxpbmZvOm51bGx9LGI9XCJtZXNzYWdlc1wiLGM9XCJ0ZXh0XCIsZD1cInRpdGxlXCIsZT1cInNldmVyaXR5XCIsZj0hMCxnPVwidmFyaWFibGVzXCIsaD0wLGk9ITEsaj1cInRvcC1yaWdodFwiLGs9ITEsbD0hMSxtPSExLG49ITE7dGhpcy5nbG9iYWxUaW1lVG9MaXZlPWZ1bmN0aW9uKGIpe2lmKFwib2JqZWN0XCI9PXR5cGVvZiBiKWZvcih2YXIgYyBpbiBiKWIuaGFzT3duUHJvcGVydHkoYykmJihhW2NdPWJbY10pO2Vsc2UgZm9yKHZhciBkIGluIGEpYS5oYXNPd25Qcm9wZXJ0eShkKSYmKGFbZF09Yil9LHRoaXMuZ2xvYmFsRGlzYWJsZUNsb3NlQnV0dG9uPWZ1bmN0aW9uKGEpe2s9YX0sdGhpcy5nbG9iYWxEaXNhYmxlSWNvbnM9ZnVuY3Rpb24oYSl7bD1hfSx0aGlzLmdsb2JhbFJldmVyc2VkT3JkZXI9ZnVuY3Rpb24oYSl7bT1hfSx0aGlzLmdsb2JhbERpc2FibGVDb3VudERvd249ZnVuY3Rpb24oYSl7bj1hfSx0aGlzLm1lc3NhZ2VWYXJpYWJsZUtleT1mdW5jdGlvbihhKXtnPWF9LHRoaXMuZ2xvYmFsSW5saW5lTWVzc2FnZXM9ZnVuY3Rpb24oYSl7aT1hfSx0aGlzLmdsb2JhbFBvc2l0aW9uPWZ1bmN0aW9uKGEpe2o9YX0sdGhpcy5tZXNzYWdlc0tleT1mdW5jdGlvbihhKXtiPWF9LHRoaXMubWVzc2FnZVRleHRLZXk9ZnVuY3Rpb24oYSl7Yz1hfSx0aGlzLm1lc3NhZ2VUaXRsZUtleT1mdW5jdGlvbihhKXtkPWF9LHRoaXMubWVzc2FnZVNldmVyaXR5S2V5PWZ1bmN0aW9uKGEpe2U9YX0sdGhpcy5vbmx5VW5pcXVlTWVzc2FnZXM9ZnVuY3Rpb24oYSl7Zj1hfSx0aGlzLnNlcnZlck1lc3NhZ2VzSW50ZXJjZXB0b3I9W1wiJHFcIixcImdyb3dsXCIsZnVuY3Rpb24oYSxjKXtmdW5jdGlvbiBkKGEpe2EuZGF0YVtiXSYmYS5kYXRhW2JdLmxlbmd0aD4wJiZjLmFkZFNlcnZlck1lc3NhZ2VzKGEuZGF0YVtiXSl9cmV0dXJue3Jlc3BvbnNlOmZ1bmN0aW9uKGEpe3JldHVybiBkKGEpLGF9LHJlc3BvbnNlRXJyb3I6ZnVuY3Rpb24oYil7cmV0dXJuIGQoYiksYS5yZWplY3QoYil9fX1dLHRoaXMuJGdldD1bXCIkcm9vdFNjb3BlXCIsXCIkaW50ZXJwb2xhdGVcIixcIiRmaWx0ZXJcIixmdW5jdGlvbihiLG8scCl7ZnVuY3Rpb24gcShhKXtpZihCKWEudGV4dD1CKGEudGV4dCxhLnZhcmlhYmxlcyk7ZWxzZXt2YXIgYz1vKGEudGV4dCk7YS50ZXh0PWMoYS52YXJpYWJsZXMpfWIuJGJyb2FkY2FzdChcImdyb3dsTWVzc2FnZVwiLGEpfWZ1bmN0aW9uIHIoYixjLGQpe3ZhciBlLGY9Y3x8e307ZT17dGV4dDpiLHRpdGxlOmYudGl0bGUsc2V2ZXJpdHk6ZCx0dGw6Zi50dGx8fGFbZF0sdmFyaWFibGVzOmYudmFyaWFibGVzfHx7fSxkaXNhYmxlQ2xvc2VCdXR0b246dm9pZCAwPT09Zi5kaXNhYmxlQ2xvc2VCdXR0b24/azpmLmRpc2FibGVDbG9zZUJ1dHRvbixkaXNhYmxlSWNvbnM6dm9pZCAwPT09Zi5kaXNhYmxlSWNvbnM/bDpmLmRpc2FibGVJY29ucyxkaXNhYmxlQ291bnREb3duOnZvaWQgMD09PWYuZGlzYWJsZUNvdW50RG93bj9uOmYuZGlzYWJsZUNvdW50RG93bixwb3NpdGlvbjpmLnBvc2l0aW9ufHxqLHJlZmVyZW5jZUlkOmYucmVmZXJlbmNlSWR8fGh9LHEoZSl9ZnVuY3Rpb24gcyhhLGIpe3IoYSxiLFwid2FybmluZ1wiKX1mdW5jdGlvbiB0KGEsYil7cihhLGIsXCJlcnJvclwiKX1mdW5jdGlvbiB1KGEsYil7cihhLGIsXCJpbmZvXCIpfWZ1bmN0aW9uIHYoYSxiKXtyKGEsYixcInN1Y2Nlc3NcIil9ZnVuY3Rpb24gdyhhKXt2YXIgYixmLGgsaTtmb3IoaT1hLmxlbmd0aCxiPTA7aT5iO2IrKylpZihmPWFbYl0sZltjXSl7aD1mW2VdfHxcImVycm9yXCI7dmFyIGo9e307ai52YXJpYWJsZXM9ZltnXXx8e30sai50aXRsZT1mW2RdLHIoZltjXSxqLGgpfX1mdW5jdGlvbiB4KCl7cmV0dXJuIGZ9ZnVuY3Rpb24geSgpe3JldHVybiBtfWZ1bmN0aW9uIHooKXtyZXR1cm4gaX1mdW5jdGlvbiBBKCl7cmV0dXJuIGp9dmFyIEI7dHJ5e0I9cChcInRyYW5zbGF0ZVwiKX1jYXRjaChDKXt9cmV0dXJue3dhcm5pbmc6cyxlcnJvcjp0LGluZm86dSxzdWNjZXNzOnYsYWRkU2VydmVyTWVzc2FnZXM6dyxvbmx5VW5pcXVlOngscmV2ZXJzZU9yZGVyOnksaW5saW5lTWVzc2FnZXM6eixwb3NpdGlvbjpBfX1dfSk7IiwiLyoqXG4gKiBAbGljZW5zZSBBbmd1bGFySlMgdjEuMy4xXG4gKiAoYykgMjAxMC0yMDE0IEdvb2dsZSwgSW5jLiBodHRwOi8vYW5ndWxhcmpzLm9yZ1xuICogTGljZW5zZTogTUlUXG4gKi9cbihmdW5jdGlvbih3aW5kb3csIGFuZ3VsYXIsIHVuZGVmaW5lZCkgeyd1c2Ugc3RyaWN0JztcblxudmFyICRzYW5pdGl6ZU1pbkVyciA9IGFuZ3VsYXIuJCRtaW5FcnIoJyRzYW5pdGl6ZScpO1xuXG4vKipcbiAqIEBuZ2RvYyBtb2R1bGVcbiAqIEBuYW1lIG5nU2FuaXRpemVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqICMgbmdTYW5pdGl6ZVxuICpcbiAqIFRoZSBgbmdTYW5pdGl6ZWAgbW9kdWxlIHByb3ZpZGVzIGZ1bmN0aW9uYWxpdHkgdG8gc2FuaXRpemUgSFRNTC5cbiAqXG4gKlxuICogPGRpdiBkb2MtbW9kdWxlLWNvbXBvbmVudHM9XCJuZ1Nhbml0aXplXCI+PC9kaXY+XG4gKlxuICogU2VlIHtAbGluayBuZ1Nhbml0aXplLiRzYW5pdGl6ZSBgJHNhbml0aXplYH0gZm9yIHVzYWdlLlxuICovXG5cbi8qXG4gKiBIVE1MIFBhcnNlciBCeSBNaXNrbyBIZXZlcnkgKG1pc2tvQGhldmVyeS5jb20pXG4gKiBiYXNlZCBvbjogIEhUTUwgUGFyc2VyIEJ5IEpvaG4gUmVzaWcgKGVqb2huLm9yZylcbiAqIE9yaWdpbmFsIGNvZGUgYnkgRXJpayBBcnZpZHNzb24sIE1vemlsbGEgUHVibGljIExpY2Vuc2VcbiAqIGh0dHA6Ly9lcmlrLmVhZS5uZXQvc2ltcGxlaHRtbHBhcnNlci9zaW1wbGVodG1scGFyc2VyLmpzXG4gKlxuICogLy8gVXNlIGxpa2Ugc286XG4gKiBodG1sUGFyc2VyKGh0bWxTdHJpbmcsIHtcbiAqICAgICBzdGFydDogZnVuY3Rpb24odGFnLCBhdHRycywgdW5hcnkpIHt9LFxuICogICAgIGVuZDogZnVuY3Rpb24odGFnKSB7fSxcbiAqICAgICBjaGFyczogZnVuY3Rpb24odGV4dCkge30sXG4gKiAgICAgY29tbWVudDogZnVuY3Rpb24odGV4dCkge31cbiAqIH0pO1xuICpcbiAqL1xuXG5cbi8qKlxuICogQG5nZG9jIHNlcnZpY2VcbiAqIEBuYW1lICRzYW5pdGl6ZVxuICogQGtpbmQgZnVuY3Rpb25cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgVGhlIGlucHV0IGlzIHNhbml0aXplZCBieSBwYXJzaW5nIHRoZSBIVE1MIGludG8gdG9rZW5zLiBBbGwgc2FmZSB0b2tlbnMgKGZyb20gYSB3aGl0ZWxpc3QpIGFyZVxuICogICB0aGVuIHNlcmlhbGl6ZWQgYmFjayB0byBwcm9wZXJseSBlc2NhcGVkIGh0bWwgc3RyaW5nLiBUaGlzIG1lYW5zIHRoYXQgbm8gdW5zYWZlIGlucHV0IGNhbiBtYWtlXG4gKiAgIGl0IGludG8gdGhlIHJldHVybmVkIHN0cmluZywgaG93ZXZlciwgc2luY2Ugb3VyIHBhcnNlciBpcyBtb3JlIHN0cmljdCB0aGFuIGEgdHlwaWNhbCBicm93c2VyXG4gKiAgIHBhcnNlciwgaXQncyBwb3NzaWJsZSB0aGF0IHNvbWUgb2JzY3VyZSBpbnB1dCwgd2hpY2ggd291bGQgYmUgcmVjb2duaXplZCBhcyB2YWxpZCBIVE1MIGJ5IGFcbiAqICAgYnJvd3Nlciwgd29uJ3QgbWFrZSBpdCB0aHJvdWdoIHRoZSBzYW5pdGl6ZXIuIFRoZSBpbnB1dCBtYXkgYWxzbyBjb250YWluIFNWRyBtYXJrdXAuXG4gKiAgIFRoZSB3aGl0ZWxpc3QgaXMgY29uZmlndXJlZCB1c2luZyB0aGUgZnVuY3Rpb25zIGBhSHJlZlNhbml0aXphdGlvbldoaXRlbGlzdGAgYW5kXG4gKiAgIGBpbWdTcmNTYW5pdGl6YXRpb25XaGl0ZWxpc3RgIG9mIHtAbGluayBuZy4kY29tcGlsZVByb3ZpZGVyIGAkY29tcGlsZVByb3ZpZGVyYH0uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgSFRNTCBpbnB1dC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFNhbml0aXplZCBIVE1MLlxuICpcbiAqIEBleGFtcGxlXG4gICA8ZXhhbXBsZSBtb2R1bGU9XCJzYW5pdGl6ZUV4YW1wbGVcIiBkZXBzPVwiYW5ndWxhci1zYW5pdGl6ZS5qc1wiPlxuICAgPGZpbGUgbmFtZT1cImluZGV4Lmh0bWxcIj5cbiAgICAgPHNjcmlwdD5cbiAgICAgICAgIGFuZ3VsYXIubW9kdWxlKCdzYW5pdGl6ZUV4YW1wbGUnLCBbJ25nU2FuaXRpemUnXSlcbiAgICAgICAgICAgLmNvbnRyb2xsZXIoJ0V4YW1wbGVDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHNjZScsIGZ1bmN0aW9uKCRzY29wZSwgJHNjZSkge1xuICAgICAgICAgICAgICRzY29wZS5zbmlwcGV0ID1cbiAgICAgICAgICAgICAgICc8cCBzdHlsZT1cImNvbG9yOmJsdWVcIj5hbiBodG1sXFxuJyArXG4gICAgICAgICAgICAgICAnPGVtIG9ubW91c2VvdmVyPVwidGhpcy50ZXh0Q29udGVudD1cXCdQV04zRCFcXCdcIj5jbGljayBoZXJlPC9lbT5cXG4nICtcbiAgICAgICAgICAgICAgICdzbmlwcGV0PC9wPic7XG4gICAgICAgICAgICAgJHNjb3BlLmRlbGliZXJhdGVseVRydXN0RGFuZ2Vyb3VzU25pcHBldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwoJHNjb3BlLnNuaXBwZXQpO1xuICAgICAgICAgICAgIH07XG4gICAgICAgICAgIH1dKTtcbiAgICAgPC9zY3JpcHQ+XG4gICAgIDxkaXYgbmctY29udHJvbGxlcj1cIkV4YW1wbGVDb250cm9sbGVyXCI+XG4gICAgICAgIFNuaXBwZXQ6IDx0ZXh0YXJlYSBuZy1tb2RlbD1cInNuaXBwZXRcIiBjb2xzPVwiNjBcIiByb3dzPVwiM1wiPjwvdGV4dGFyZWE+XG4gICAgICAgPHRhYmxlPlxuICAgICAgICAgPHRyPlxuICAgICAgICAgICA8dGQ+RGlyZWN0aXZlPC90ZD5cbiAgICAgICAgICAgPHRkPkhvdzwvdGQ+XG4gICAgICAgICAgIDx0ZD5Tb3VyY2U8L3RkPlxuICAgICAgICAgICA8dGQ+UmVuZGVyZWQ8L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICAgIDx0ciBpZD1cImJpbmQtaHRtbC13aXRoLXNhbml0aXplXCI+XG4gICAgICAgICAgIDx0ZD5uZy1iaW5kLWh0bWw8L3RkPlxuICAgICAgICAgICA8dGQ+QXV0b21hdGljYWxseSB1c2VzICRzYW5pdGl6ZTwvdGQ+XG4gICAgICAgICAgIDx0ZD48cHJlPiZsdDtkaXYgbmctYmluZC1odG1sPVwic25pcHBldFwiJmd0Ozxici8+Jmx0Oy9kaXYmZ3Q7PC9wcmU+PC90ZD5cbiAgICAgICAgICAgPHRkPjxkaXYgbmctYmluZC1odG1sPVwic25pcHBldFwiPjwvZGl2PjwvdGQ+XG4gICAgICAgICA8L3RyPlxuICAgICAgICAgPHRyIGlkPVwiYmluZC1odG1sLXdpdGgtdHJ1c3RcIj5cbiAgICAgICAgICAgPHRkPm5nLWJpbmQtaHRtbDwvdGQ+XG4gICAgICAgICAgIDx0ZD5CeXBhc3MgJHNhbml0aXplIGJ5IGV4cGxpY2l0bHkgdHJ1c3RpbmcgdGhlIGRhbmdlcm91cyB2YWx1ZTwvdGQ+XG4gICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgPHByZT4mbHQ7ZGl2IG5nLWJpbmQtaHRtbD1cImRlbGliZXJhdGVseVRydXN0RGFuZ2Vyb3VzU25pcHBldCgpXCImZ3Q7XG4mbHQ7L2RpdiZndDs8L3ByZT5cbiAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgPHRkPjxkaXYgbmctYmluZC1odG1sPVwiZGVsaWJlcmF0ZWx5VHJ1c3REYW5nZXJvdXNTbmlwcGV0KClcIj48L2Rpdj48L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICAgIDx0ciBpZD1cImJpbmQtZGVmYXVsdFwiPlxuICAgICAgICAgICA8dGQ+bmctYmluZDwvdGQ+XG4gICAgICAgICAgIDx0ZD5BdXRvbWF0aWNhbGx5IGVzY2FwZXM8L3RkPlxuICAgICAgICAgICA8dGQ+PHByZT4mbHQ7ZGl2IG5nLWJpbmQ9XCJzbmlwcGV0XCImZ3Q7PGJyLz4mbHQ7L2RpdiZndDs8L3ByZT48L3RkPlxuICAgICAgICAgICA8dGQ+PGRpdiBuZy1iaW5kPVwic25pcHBldFwiPjwvZGl2PjwvdGQ+XG4gICAgICAgICA8L3RyPlxuICAgICAgIDwvdGFibGU+XG4gICAgICAgPC9kaXY+XG4gICA8L2ZpbGU+XG4gICA8ZmlsZSBuYW1lPVwicHJvdHJhY3Rvci5qc1wiIHR5cGU9XCJwcm90cmFjdG9yXCI+XG4gICAgIGl0KCdzaG91bGQgc2FuaXRpemUgdGhlIGh0bWwgc25pcHBldCBieSBkZWZhdWx0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjYmluZC1odG1sLXdpdGgtc2FuaXRpemUgZGl2JykpLmdldElubmVySHRtbCgpKS5cbiAgICAgICAgIHRvQmUoJzxwPmFuIGh0bWxcXG48ZW0+Y2xpY2sgaGVyZTwvZW0+XFxuc25pcHBldDwvcD4nKTtcbiAgICAgfSk7XG5cbiAgICAgaXQoJ3Nob3VsZCBpbmxpbmUgcmF3IHNuaXBwZXQgaWYgYm91bmQgdG8gYSB0cnVzdGVkIHZhbHVlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjYmluZC1odG1sLXdpdGgtdHJ1c3QgZGl2JykpLmdldElubmVySHRtbCgpKS5cbiAgICAgICAgIHRvQmUoXCI8cCBzdHlsZT1cXFwiY29sb3I6Ymx1ZVxcXCI+YW4gaHRtbFxcblwiICtcbiAgICAgICAgICAgICAgXCI8ZW0gb25tb3VzZW92ZXI9XFxcInRoaXMudGV4dENvbnRlbnQ9J1BXTjNEISdcXFwiPmNsaWNrIGhlcmU8L2VtPlxcblwiICtcbiAgICAgICAgICAgICAgXCJzbmlwcGV0PC9wPlwiKTtcbiAgICAgfSk7XG5cbiAgICAgaXQoJ3Nob3VsZCBlc2NhcGUgc25pcHBldCB3aXRob3V0IGFueSBmaWx0ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNiaW5kLWRlZmF1bHQgZGl2JykpLmdldElubmVySHRtbCgpKS5cbiAgICAgICAgIHRvQmUoXCImbHQ7cCBzdHlsZT1cXFwiY29sb3I6Ymx1ZVxcXCImZ3Q7YW4gaHRtbFxcblwiICtcbiAgICAgICAgICAgICAgXCImbHQ7ZW0gb25tb3VzZW92ZXI9XFxcInRoaXMudGV4dENvbnRlbnQ9J1BXTjNEISdcXFwiJmd0O2NsaWNrIGhlcmUmbHQ7L2VtJmd0O1xcblwiICtcbiAgICAgICAgICAgICAgXCJzbmlwcGV0Jmx0Oy9wJmd0O1wiKTtcbiAgICAgfSk7XG5cbiAgICAgaXQoJ3Nob3VsZCB1cGRhdGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICBlbGVtZW50KGJ5Lm1vZGVsKCdzbmlwcGV0JykpLmNsZWFyKCk7XG4gICAgICAgZWxlbWVudChieS5tb2RlbCgnc25pcHBldCcpKS5zZW5kS2V5cygnbmV3IDxiIG9uY2xpY2s9XCJhbGVydCgxKVwiPnRleHQ8L2I+Jyk7XG4gICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjYmluZC1odG1sLXdpdGgtc2FuaXRpemUgZGl2JykpLmdldElubmVySHRtbCgpKS5cbiAgICAgICAgIHRvQmUoJ25ldyA8Yj50ZXh0PC9iPicpO1xuICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2JpbmQtaHRtbC13aXRoLXRydXN0IGRpdicpKS5nZXRJbm5lckh0bWwoKSkudG9CZShcbiAgICAgICAgICduZXcgPGIgb25jbGljaz1cImFsZXJ0KDEpXCI+dGV4dDwvYj4nKTtcbiAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNiaW5kLWRlZmF1bHQgZGl2JykpLmdldElubmVySHRtbCgpKS50b0JlKFxuICAgICAgICAgXCJuZXcgJmx0O2Igb25jbGljaz1cXFwiYWxlcnQoMSlcXFwiJmd0O3RleHQmbHQ7L2ImZ3Q7XCIpO1xuICAgICB9KTtcbiAgIDwvZmlsZT5cbiAgIDwvZXhhbXBsZT5cbiAqL1xuZnVuY3Rpb24gJFNhbml0aXplUHJvdmlkZXIoKSB7XG4gIHRoaXMuJGdldCA9IFsnJCRzYW5pdGl6ZVVyaScsIGZ1bmN0aW9uKCQkc2FuaXRpemVVcmkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oaHRtbCkge1xuICAgICAgdmFyIGJ1ZiA9IFtdO1xuICAgICAgaHRtbFBhcnNlcihodG1sLCBodG1sU2FuaXRpemVXcml0ZXIoYnVmLCBmdW5jdGlvbih1cmksIGlzSW1hZ2UpIHtcbiAgICAgICAgcmV0dXJuICEvXnVuc2FmZS8udGVzdCgkJHNhbml0aXplVXJpKHVyaSwgaXNJbWFnZSkpO1xuICAgICAgfSkpO1xuICAgICAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcbiAgICB9O1xuICB9XTtcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVUZXh0KGNoYXJzKSB7XG4gIHZhciBidWYgPSBbXTtcbiAgdmFyIHdyaXRlciA9IGh0bWxTYW5pdGl6ZVdyaXRlcihidWYsIGFuZ3VsYXIubm9vcCk7XG4gIHdyaXRlci5jaGFycyhjaGFycyk7XG4gIHJldHVybiBidWYuam9pbignJyk7XG59XG5cblxuLy8gUmVndWxhciBFeHByZXNzaW9ucyBmb3IgcGFyc2luZyB0YWdzIGFuZCBhdHRyaWJ1dGVzXG52YXIgU1RBUlRfVEFHX1JFR0VYUCA9XG4gICAgICAgL148KCg/OlthLXpBLVpdKVtcXHc6LV0qKSgoPzpcXHMrW1xcdzotXSsoPzpcXHMqPVxccyooPzooPzpcIlteXCJdKlwiKXwoPzonW14nXSonKXxbXj5cXHNdKykpPykqKVxccyooXFwvPylcXHMqKD4/KS8sXG4gIEVORF9UQUdfUkVHRVhQID0gL148XFwvXFxzKihbXFx3Oi1dKylbXj5dKj4vLFxuICBBVFRSX1JFR0VYUCA9IC8oW1xcdzotXSspKD86XFxzKj1cXHMqKD86KD86XCIoKD86W15cIl0pKilcIil8KD86JygoPzpbXiddKSopJyl8KFtePlxcc10rKSkpPy9nLFxuICBCRUdJTl9UQUdfUkVHRVhQID0gL148LyxcbiAgQkVHSU5HX0VORF9UQUdFX1JFR0VYUCA9IC9ePFxcLy8sXG4gIENPTU1FTlRfUkVHRVhQID0gLzwhLS0oLio/KS0tPi9nLFxuICBET0NUWVBFX1JFR0VYUCA9IC88IURPQ1RZUEUoW14+XSo/KT4vaSxcbiAgQ0RBVEFfUkVHRVhQID0gLzwhXFxbQ0RBVEFcXFsoLio/KV1dPi9nLFxuICBTVVJST0dBVEVfUEFJUl9SRUdFWFAgPSAvW1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXS9nLFxuICAvLyBNYXRjaCBldmVyeXRoaW5nIG91dHNpZGUgb2Ygbm9ybWFsIGNoYXJzIGFuZCBcIiAocXVvdGUgY2hhcmFjdGVyKVxuICBOT05fQUxQSEFOVU1FUklDX1JFR0VYUCA9IC8oW15cXCMtfnwgfCFdKS9nO1xuXG5cbi8vIEdvb2Qgc291cmNlIG9mIGluZm8gYWJvdXQgZWxlbWVudHMgYW5kIGF0dHJpYnV0ZXNcbi8vIGh0dHA6Ly9kZXYudzMub3JnL2h0bWw1L3NwZWMvT3ZlcnZpZXcuaHRtbCNzZW1hbnRpY3Ncbi8vIGh0dHA6Ly9zaW1vbi5odG1sNS5vcmcvaHRtbC1lbGVtZW50c1xuXG4vLyBTYWZlIFZvaWQgRWxlbWVudHMgLSBIVE1MNVxuLy8gaHR0cDovL2Rldi53My5vcmcvaHRtbDUvc3BlYy9PdmVydmlldy5odG1sI3ZvaWQtZWxlbWVudHNcbnZhciB2b2lkRWxlbWVudHMgPSBtYWtlTWFwKFwiYXJlYSxicixjb2wsaHIsaW1nLHdiclwiKTtcblxuLy8gRWxlbWVudHMgdGhhdCB5b3UgY2FuLCBpbnRlbnRpb25hbGx5LCBsZWF2ZSBvcGVuIChhbmQgd2hpY2ggY2xvc2UgdGhlbXNlbHZlcylcbi8vIGh0dHA6Ly9kZXYudzMub3JnL2h0bWw1L3NwZWMvT3ZlcnZpZXcuaHRtbCNvcHRpb25hbC10YWdzXG52YXIgb3B0aW9uYWxFbmRUYWdCbG9ja0VsZW1lbnRzID0gbWFrZU1hcChcImNvbGdyb3VwLGRkLGR0LGxpLHAsdGJvZHksdGQsdGZvb3QsdGgsdGhlYWQsdHJcIiksXG4gICAgb3B0aW9uYWxFbmRUYWdJbmxpbmVFbGVtZW50cyA9IG1ha2VNYXAoXCJycCxydFwiKSxcbiAgICBvcHRpb25hbEVuZFRhZ0VsZW1lbnRzID0gYW5ndWxhci5leHRlbmQoe30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbmFsRW5kVGFnSW5saW5lRWxlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbmFsRW5kVGFnQmxvY2tFbGVtZW50cyk7XG5cbi8vIFNhZmUgQmxvY2sgRWxlbWVudHMgLSBIVE1MNVxudmFyIGJsb2NrRWxlbWVudHMgPSBhbmd1bGFyLmV4dGVuZCh7fSwgb3B0aW9uYWxFbmRUYWdCbG9ja0VsZW1lbnRzLCBtYWtlTWFwKFwiYWRkcmVzcyxhcnRpY2xlLFwiICtcbiAgICAgICAgXCJhc2lkZSxibG9ja3F1b3RlLGNhcHRpb24sY2VudGVyLGRlbCxkaXIsZGl2LGRsLGZpZ3VyZSxmaWdjYXB0aW9uLGZvb3RlcixoMSxoMixoMyxoNCxoNSxcIiArXG4gICAgICAgIFwiaDYsaGVhZGVyLGhncm91cCxocixpbnMsbWFwLG1lbnUsbmF2LG9sLHByZSxzY3JpcHQsc2VjdGlvbix0YWJsZSx1bFwiKSk7XG5cbi8vIElubGluZSBFbGVtZW50cyAtIEhUTUw1XG52YXIgaW5saW5lRWxlbWVudHMgPSBhbmd1bGFyLmV4dGVuZCh7fSwgb3B0aW9uYWxFbmRUYWdJbmxpbmVFbGVtZW50cywgbWFrZU1hcChcImEsYWJicixhY3JvbnltLGIsXCIgK1xuICAgICAgICBcImJkaSxiZG8sYmlnLGJyLGNpdGUsY29kZSxkZWwsZGZuLGVtLGZvbnQsaSxpbWcsaW5zLGtiZCxsYWJlbCxtYXAsbWFyayxxLHJ1YnkscnAscnQscyxcIiArXG4gICAgICAgIFwic2FtcCxzbWFsbCxzcGFuLHN0cmlrZSxzdHJvbmcsc3ViLHN1cCx0aW1lLHR0LHUsdmFyXCIpKTtcblxuLy8gU1ZHIEVsZW1lbnRzXG4vLyBodHRwczovL3dpa2kud2hhdHdnLm9yZy93aWtpL1Nhbml0aXphdGlvbl9ydWxlcyNzdmdfRWxlbWVudHNcbnZhciBzdmdFbGVtZW50cyA9IG1ha2VNYXAoXCJhbmltYXRlLGFuaW1hdGVDb2xvcixhbmltYXRlTW90aW9uLGFuaW1hdGVUcmFuc2Zvcm0sY2lyY2xlLGRlZnMsXCIgK1xuICAgICAgICBcImRlc2MsZWxsaXBzZSxmb250LWZhY2UsZm9udC1mYWNlLW5hbWUsZm9udC1mYWNlLXNyYyxnLGdseXBoLGhrZXJuLGltYWdlLGxpbmVhckdyYWRpZW50LFwiICtcbiAgICAgICAgXCJsaW5lLG1hcmtlcixtZXRhZGF0YSxtaXNzaW5nLWdseXBoLG1wYXRoLHBhdGgscG9seWdvbixwb2x5bGluZSxyYWRpYWxHcmFkaWVudCxyZWN0LHNldCxcIiArXG4gICAgICAgIFwic3RvcCxzdmcsc3dpdGNoLHRleHQsdGl0bGUsdHNwYW4sdXNlXCIpO1xuXG4vLyBTcGVjaWFsIEVsZW1lbnRzIChjYW4gY29udGFpbiBhbnl0aGluZylcbnZhciBzcGVjaWFsRWxlbWVudHMgPSBtYWtlTWFwKFwic2NyaXB0LHN0eWxlXCIpO1xuXG52YXIgdmFsaWRFbGVtZW50cyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkRWxlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrRWxlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlubGluZUVsZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25hbEVuZFRhZ0VsZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdmdFbGVtZW50cyk7XG5cbi8vQXR0cmlidXRlcyB0aGF0IGhhdmUgaHJlZiBhbmQgaGVuY2UgbmVlZCB0byBiZSBzYW5pdGl6ZWRcbnZhciB1cmlBdHRycyA9IG1ha2VNYXAoXCJiYWNrZ3JvdW5kLGNpdGUsaHJlZixsb25nZGVzYyxzcmMsdXNlbWFwLHhsaW5rOmhyZWZcIik7XG5cbnZhciBodG1sQXR0cnMgPSBtYWtlTWFwKCdhYmJyLGFsaWduLGFsdCxheGlzLGJnY29sb3IsYm9yZGVyLGNlbGxwYWRkaW5nLGNlbGxzcGFjaW5nLGNsYXNzLGNsZWFyLCcrXG4gICAgJ2NvbG9yLGNvbHMsY29sc3Bhbixjb21wYWN0LGNvb3JkcyxkaXIsZmFjZSxoZWFkZXJzLGhlaWdodCxocmVmbGFuZyxoc3BhY2UsJytcbiAgICAnaXNtYXAsbGFuZyxsYW5ndWFnZSxub2hyZWYsbm93cmFwLHJlbCxyZXYscm93cyxyb3dzcGFuLHJ1bGVzLCcrXG4gICAgJ3Njb3BlLHNjcm9sbGluZyxzaGFwZSxzaXplLHNwYW4sc3RhcnQsc3VtbWFyeSx0YXJnZXQsdGl0bGUsdHlwZSwnK1xuICAgICd2YWxpZ24sdmFsdWUsdnNwYWNlLHdpZHRoJyk7XG5cbi8vIFNWRyBhdHRyaWJ1dGVzICh3aXRob3V0IFwiaWRcIiBhbmQgXCJuYW1lXCIgYXR0cmlidXRlcylcbi8vIGh0dHBzOi8vd2lraS53aGF0d2cub3JnL3dpa2kvU2FuaXRpemF0aW9uX3J1bGVzI3N2Z19BdHRyaWJ1dGVzXG52YXIgc3ZnQXR0cnMgPSBtYWtlTWFwKCdhY2NlbnQtaGVpZ2h0LGFjY3VtdWxhdGUsYWRkaXRpdmUsYWxwaGFiZXRpYyxhcmFiaWMtZm9ybSxhc2NlbnQsJytcbiAgICAnYXR0cmlidXRlTmFtZSxhdHRyaWJ1dGVUeXBlLGJhc2VQcm9maWxlLGJib3gsYmVnaW4sYnksY2FsY01vZGUsY2FwLWhlaWdodCxjbGFzcyxjb2xvciwnK1xuICAgICdjb2xvci1yZW5kZXJpbmcsY29udGVudCxjeCxjeSxkLGR4LGR5LGRlc2NlbnQsZGlzcGxheSxkdXIsZW5kLGZpbGwsZmlsbC1ydWxlLGZvbnQtZmFtaWx5LCcrXG4gICAgJ2ZvbnQtc2l6ZSxmb250LXN0cmV0Y2gsZm9udC1zdHlsZSxmb250LXZhcmlhbnQsZm9udC13ZWlnaHQsZnJvbSxmeCxmeSxnMSxnMixnbHlwaC1uYW1lLCcrXG4gICAgJ2dyYWRpZW50VW5pdHMsaGFuZ2luZyxoZWlnaHQsaG9yaXotYWR2LXgsaG9yaXotb3JpZ2luLXgsaWRlb2dyYXBoaWMsayxrZXlQb2ludHMsJytcbiAgICAna2V5U3BsaW5lcyxrZXlUaW1lcyxsYW5nLG1hcmtlci1lbmQsbWFya2VyLW1pZCxtYXJrZXItc3RhcnQsbWFya2VySGVpZ2h0LG1hcmtlclVuaXRzLCcrXG4gICAgJ21hcmtlcldpZHRoLG1hdGhlbWF0aWNhbCxtYXgsbWluLG9mZnNldCxvcGFjaXR5LG9yaWVudCxvcmlnaW4sb3ZlcmxpbmUtcG9zaXRpb24sJytcbiAgICAnb3ZlcmxpbmUtdGhpY2tuZXNzLHBhbm9zZS0xLHBhdGgscGF0aExlbmd0aCxwb2ludHMscHJlc2VydmVBc3BlY3RSYXRpbyxyLHJlZlgscmVmWSwnK1xuICAgICdyZXBlYXRDb3VudCxyZXBlYXREdXIscmVxdWlyZWRFeHRlbnNpb25zLHJlcXVpcmVkRmVhdHVyZXMscmVzdGFydCxyb3RhdGUscngscnksc2xvcGUsc3RlbWgsJytcbiAgICAnc3RlbXYsc3RvcC1jb2xvcixzdG9wLW9wYWNpdHksc3RyaWtldGhyb3VnaC1wb3NpdGlvbixzdHJpa2V0aHJvdWdoLXRoaWNrbmVzcyxzdHJva2UsJytcbiAgICAnc3Ryb2tlLWRhc2hhcnJheSxzdHJva2UtZGFzaG9mZnNldCxzdHJva2UtbGluZWNhcCxzdHJva2UtbGluZWpvaW4sc3Ryb2tlLW1pdGVybGltaXQsJytcbiAgICAnc3Ryb2tlLW9wYWNpdHksc3Ryb2tlLXdpZHRoLHN5c3RlbUxhbmd1YWdlLHRhcmdldCx0ZXh0LWFuY2hvcix0byx0cmFuc2Zvcm0sdHlwZSx1MSx1MiwnK1xuICAgICd1bmRlcmxpbmUtcG9zaXRpb24sdW5kZXJsaW5lLXRoaWNrbmVzcyx1bmljb2RlLHVuaWNvZGUtcmFuZ2UsdW5pdHMtcGVyLWVtLHZhbHVlcyx2ZXJzaW9uLCcrXG4gICAgJ3ZpZXdCb3gsdmlzaWJpbGl0eSx3aWR0aCx3aWR0aHMseCx4LWhlaWdodCx4MSx4Mix4bGluazphY3R1YXRlLHhsaW5rOmFyY3JvbGUseGxpbms6cm9sZSwnK1xuICAgICd4bGluazpzaG93LHhsaW5rOnRpdGxlLHhsaW5rOnR5cGUseG1sOmJhc2UseG1sOmxhbmcseG1sOnNwYWNlLHhtbG5zLHhtbG5zOnhsaW5rLHkseTEseTIsJytcbiAgICAnem9vbUFuZFBhbicpO1xuXG52YXIgdmFsaWRBdHRycyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmlBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxBdHRycyk7XG5cbmZ1bmN0aW9uIG1ha2VNYXAoc3RyKSB7XG4gIHZhciBvYmogPSB7fSwgaXRlbXMgPSBzdHIuc3BsaXQoJywnKSwgaTtcbiAgZm9yIChpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSBvYmpbaXRlbXNbaV1dID0gdHJ1ZTtcbiAgcmV0dXJuIG9iajtcbn1cblxuXG4vKipcbiAqIEBleGFtcGxlXG4gKiBodG1sUGFyc2VyKGh0bWxTdHJpbmcsIHtcbiAqICAgICBzdGFydDogZnVuY3Rpb24odGFnLCBhdHRycywgdW5hcnkpIHt9LFxuICogICAgIGVuZDogZnVuY3Rpb24odGFnKSB7fSxcbiAqICAgICBjaGFyczogZnVuY3Rpb24odGV4dCkge30sXG4gKiAgICAgY29tbWVudDogZnVuY3Rpb24odGV4dCkge31cbiAqIH0pO1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIHN0cmluZ1xuICogQHBhcmFtIHtvYmplY3R9IGhhbmRsZXJcbiAqL1xuZnVuY3Rpb24gaHRtbFBhcnNlcihodG1sLCBoYW5kbGVyKSB7XG4gIGlmICh0eXBlb2YgaHRtbCAhPT0gJ3N0cmluZycpIHtcbiAgICBpZiAoaHRtbCA9PT0gbnVsbCB8fCB0eXBlb2YgaHRtbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGh0bWwgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgaHRtbCA9ICcnICsgaHRtbDtcbiAgICB9XG4gIH1cbiAgdmFyIGluZGV4LCBjaGFycywgbWF0Y2gsIHN0YWNrID0gW10sIGxhc3QgPSBodG1sLCB0ZXh0O1xuICBzdGFjay5sYXN0ID0gZnVuY3Rpb24oKSB7IHJldHVybiBzdGFja1sgc3RhY2subGVuZ3RoIC0gMSBdOyB9O1xuXG4gIHdoaWxlIChodG1sKSB7XG4gICAgdGV4dCA9ICcnO1xuICAgIGNoYXJzID0gdHJ1ZTtcblxuICAgIC8vIE1ha2Ugc3VyZSB3ZSdyZSBub3QgaW4gYSBzY3JpcHQgb3Igc3R5bGUgZWxlbWVudFxuICAgIGlmICghc3RhY2subGFzdCgpIHx8ICFzcGVjaWFsRWxlbWVudHNbIHN0YWNrLmxhc3QoKSBdKSB7XG5cbiAgICAgIC8vIENvbW1lbnRcbiAgICAgIGlmIChodG1sLmluZGV4T2YoXCI8IS0tXCIpID09PSAwKSB7XG4gICAgICAgIC8vIGNvbW1lbnRzIGNvbnRhaW5pbmcgLS0gYXJlIG5vdCBhbGxvd2VkIHVubGVzcyB0aGV5IHRlcm1pbmF0ZSB0aGUgY29tbWVudFxuICAgICAgICBpbmRleCA9IGh0bWwuaW5kZXhPZihcIi0tXCIsIDQpO1xuXG4gICAgICAgIGlmIChpbmRleCA+PSAwICYmIGh0bWwubGFzdEluZGV4T2YoXCItLT5cIiwgaW5kZXgpID09PSBpbmRleCkge1xuICAgICAgICAgIGlmIChoYW5kbGVyLmNvbW1lbnQpIGhhbmRsZXIuY29tbWVudChodG1sLnN1YnN0cmluZyg0LCBpbmRleCkpO1xuICAgICAgICAgIGh0bWwgPSBodG1sLnN1YnN0cmluZyhpbmRleCArIDMpO1xuICAgICAgICAgIGNoYXJzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIC8vIERPQ1RZUEVcbiAgICAgIH0gZWxzZSBpZiAoRE9DVFlQRV9SRUdFWFAudGVzdChodG1sKSkge1xuICAgICAgICBtYXRjaCA9IGh0bWwubWF0Y2goRE9DVFlQRV9SRUdFWFApO1xuXG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UobWF0Y2hbMF0sICcnKTtcbiAgICAgICAgICBjaGFycyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAvLyBlbmQgdGFnXG4gICAgICB9IGVsc2UgaWYgKEJFR0lOR19FTkRfVEFHRV9SRUdFWFAudGVzdChodG1sKSkge1xuICAgICAgICBtYXRjaCA9IGh0bWwubWF0Y2goRU5EX1RBR19SRUdFWFApO1xuXG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIGh0bWwgPSBodG1sLnN1YnN0cmluZyhtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgICAgIG1hdGNoWzBdLnJlcGxhY2UoRU5EX1RBR19SRUdFWFAsIHBhcnNlRW5kVGFnKTtcbiAgICAgICAgICBjaGFycyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgIC8vIHN0YXJ0IHRhZ1xuICAgICAgfSBlbHNlIGlmIChCRUdJTl9UQUdfUkVHRVhQLnRlc3QoaHRtbCkpIHtcbiAgICAgICAgbWF0Y2ggPSBodG1sLm1hdGNoKFNUQVJUX1RBR19SRUdFWFApO1xuXG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIC8vIFdlIG9ubHkgaGF2ZSBhIHZhbGlkIHN0YXJ0LXRhZyBpZiB0aGVyZSBpcyBhICc+Jy5cbiAgICAgICAgICBpZiAobWF0Y2hbNF0pIHtcbiAgICAgICAgICAgIGh0bWwgPSBodG1sLnN1YnN0cmluZyhtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgICAgICAgbWF0Y2hbMF0ucmVwbGFjZShTVEFSVF9UQUdfUkVHRVhQLCBwYXJzZVN0YXJ0VGFnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2hhcnMgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBubyBlbmRpbmcgdGFnIGZvdW5kIC0tLSB0aGlzIHBpZWNlIHNob3VsZCBiZSBlbmNvZGVkIGFzIGFuIGVudGl0eS5cbiAgICAgICAgICB0ZXh0ICs9ICc8JztcbiAgICAgICAgICBodG1sID0gaHRtbC5zdWJzdHJpbmcoMSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGNoYXJzKSB7XG4gICAgICAgIGluZGV4ID0gaHRtbC5pbmRleE9mKFwiPFwiKTtcblxuICAgICAgICB0ZXh0ICs9IGluZGV4IDwgMCA/IGh0bWwgOiBodG1sLnN1YnN0cmluZygwLCBpbmRleCk7XG4gICAgICAgIGh0bWwgPSBpbmRleCA8IDAgPyBcIlwiIDogaHRtbC5zdWJzdHJpbmcoaW5kZXgpO1xuXG4gICAgICAgIGlmIChoYW5kbGVyLmNoYXJzKSBoYW5kbGVyLmNoYXJzKGRlY29kZUVudGl0aWVzKHRleHQpKTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICBodG1sID0gaHRtbC5yZXBsYWNlKG5ldyBSZWdFeHAoXCIoLiopPFxcXFxzKlxcXFwvXFxcXHMqXCIgKyBzdGFjay5sYXN0KCkgKyBcIltePl0qPlwiLCAnaScpLFxuICAgICAgICBmdW5jdGlvbihhbGwsIHRleHQpIHtcbiAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKENPTU1FTlRfUkVHRVhQLCBcIiQxXCIpLnJlcGxhY2UoQ0RBVEFfUkVHRVhQLCBcIiQxXCIpO1xuXG4gICAgICAgICAgaWYgKGhhbmRsZXIuY2hhcnMpIGhhbmRsZXIuY2hhcnMoZGVjb2RlRW50aXRpZXModGV4dCkpO1xuXG4gICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICB9KTtcblxuICAgICAgcGFyc2VFbmRUYWcoXCJcIiwgc3RhY2subGFzdCgpKTtcbiAgICB9XG5cbiAgICBpZiAoaHRtbCA9PSBsYXN0KSB7XG4gICAgICB0aHJvdyAkc2FuaXRpemVNaW5FcnIoJ2JhZHBhcnNlJywgXCJUaGUgc2FuaXRpemVyIHdhcyB1bmFibGUgdG8gcGFyc2UgdGhlIGZvbGxvd2luZyBibG9jayBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJvZiBodG1sOiB7MH1cIiwgaHRtbCk7XG4gICAgfVxuICAgIGxhc3QgPSBodG1sO1xuICB9XG5cbiAgLy8gQ2xlYW4gdXAgYW55IHJlbWFpbmluZyB0YWdzXG4gIHBhcnNlRW5kVGFnKCk7XG5cbiAgZnVuY3Rpb24gcGFyc2VTdGFydFRhZyh0YWcsIHRhZ05hbWUsIHJlc3QsIHVuYXJ5KSB7XG4gICAgdGFnTmFtZSA9IGFuZ3VsYXIubG93ZXJjYXNlKHRhZ05hbWUpO1xuICAgIGlmIChibG9ja0VsZW1lbnRzWyB0YWdOYW1lIF0pIHtcbiAgICAgIHdoaWxlIChzdGFjay5sYXN0KCkgJiYgaW5saW5lRWxlbWVudHNbIHN0YWNrLmxhc3QoKSBdKSB7XG4gICAgICAgIHBhcnNlRW5kVGFnKFwiXCIsIHN0YWNrLmxhc3QoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbmFsRW5kVGFnRWxlbWVudHNbIHRhZ05hbWUgXSAmJiBzdGFjay5sYXN0KCkgPT0gdGFnTmFtZSkge1xuICAgICAgcGFyc2VFbmRUYWcoXCJcIiwgdGFnTmFtZSk7XG4gICAgfVxuXG4gICAgdW5hcnkgPSB2b2lkRWxlbWVudHNbIHRhZ05hbWUgXSB8fCAhIXVuYXJ5O1xuXG4gICAgaWYgKCF1bmFyeSlcbiAgICAgIHN0YWNrLnB1c2godGFnTmFtZSk7XG5cbiAgICB2YXIgYXR0cnMgPSB7fTtcblxuICAgIHJlc3QucmVwbGFjZShBVFRSX1JFR0VYUCxcbiAgICAgIGZ1bmN0aW9uKG1hdGNoLCBuYW1lLCBkb3VibGVRdW90ZWRWYWx1ZSwgc2luZ2xlUXVvdGVkVmFsdWUsIHVucXVvdGVkVmFsdWUpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gZG91YmxlUXVvdGVkVmFsdWVcbiAgICAgICAgICB8fCBzaW5nbGVRdW90ZWRWYWx1ZVxuICAgICAgICAgIHx8IHVucXVvdGVkVmFsdWVcbiAgICAgICAgICB8fCAnJztcblxuICAgICAgICBhdHRyc1tuYW1lXSA9IGRlY29kZUVudGl0aWVzKHZhbHVlKTtcbiAgICB9KTtcbiAgICBpZiAoaGFuZGxlci5zdGFydCkgaGFuZGxlci5zdGFydCh0YWdOYW1lLCBhdHRycywgdW5hcnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VFbmRUYWcodGFnLCB0YWdOYW1lKSB7XG4gICAgdmFyIHBvcyA9IDAsIGk7XG4gICAgdGFnTmFtZSA9IGFuZ3VsYXIubG93ZXJjYXNlKHRhZ05hbWUpO1xuICAgIGlmICh0YWdOYW1lKVxuICAgICAgLy8gRmluZCB0aGUgY2xvc2VzdCBvcGVuZWQgdGFnIG9mIHRoZSBzYW1lIHR5cGVcbiAgICAgIGZvciAocG9zID0gc3RhY2subGVuZ3RoIC0gMTsgcG9zID49IDA7IHBvcy0tKVxuICAgICAgICBpZiAoc3RhY2tbIHBvcyBdID09IHRhZ05hbWUpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICBpZiAocG9zID49IDApIHtcbiAgICAgIC8vIENsb3NlIGFsbCB0aGUgb3BlbiBlbGVtZW50cywgdXAgdGhlIHN0YWNrXG4gICAgICBmb3IgKGkgPSBzdGFjay5sZW5ndGggLSAxOyBpID49IHBvczsgaS0tKVxuICAgICAgICBpZiAoaGFuZGxlci5lbmQpIGhhbmRsZXIuZW5kKHN0YWNrWyBpIF0pO1xuXG4gICAgICAvLyBSZW1vdmUgdGhlIG9wZW4gZWxlbWVudHMgZnJvbSB0aGUgc3RhY2tcbiAgICAgIHN0YWNrLmxlbmd0aCA9IHBvcztcbiAgICB9XG4gIH1cbn1cblxudmFyIGhpZGRlblByZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicHJlXCIpO1xudmFyIHNwYWNlUmUgPSAvXihcXHMqKShbXFxzXFxTXSo/KShcXHMqKSQvO1xuLyoqXG4gKiBkZWNvZGVzIGFsbCBlbnRpdGllcyBpbnRvIHJlZ3VsYXIgc3RyaW5nXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEEgc3RyaW5nIHdpdGggZGVjb2RlZCBlbnRpdGllcy5cbiAqL1xuZnVuY3Rpb24gZGVjb2RlRW50aXRpZXModmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkgeyByZXR1cm4gJyc7IH1cblxuICAvLyBOb3RlOiBJRTggZG9lcyBub3QgcHJlc2VydmUgc3BhY2VzIGF0IHRoZSBzdGFydC9lbmQgb2YgaW5uZXJIVE1MXG4gIC8vIHNvIHdlIG11c3QgY2FwdHVyZSB0aGVtIGFuZCByZWF0dGFjaCB0aGVtIGFmdGVyd2FyZFxuICB2YXIgcGFydHMgPSBzcGFjZVJlLmV4ZWModmFsdWUpO1xuICB2YXIgc3BhY2VCZWZvcmUgPSBwYXJ0c1sxXTtcbiAgdmFyIHNwYWNlQWZ0ZXIgPSBwYXJ0c1szXTtcbiAgdmFyIGNvbnRlbnQgPSBwYXJ0c1syXTtcbiAgaWYgKGNvbnRlbnQpIHtcbiAgICBoaWRkZW5QcmUuaW5uZXJIVE1MPWNvbnRlbnQucmVwbGFjZSgvPC9nLFwiJmx0O1wiKTtcbiAgICAvLyBpbm5lclRleHQgZGVwZW5kcyBvbiBzdHlsaW5nIGFzIGl0IGRvZXNuJ3QgZGlzcGxheSBoaWRkZW4gZWxlbWVudHMuXG4gICAgLy8gVGhlcmVmb3JlLCBpdCdzIGJldHRlciB0byB1c2UgdGV4dENvbnRlbnQgbm90IHRvIGNhdXNlIHVubmVjZXNzYXJ5XG4gICAgLy8gcmVmbG93cy4gSG93ZXZlciwgSUU8OSBkb24ndCBzdXBwb3J0IHRleHRDb250ZW50IHNvIHRoZSBpbm5lclRleHRcbiAgICAvLyBmYWxsYmFjayBpcyBuZWNlc3NhcnkuXG4gICAgY29udGVudCA9ICd0ZXh0Q29udGVudCcgaW4gaGlkZGVuUHJlID9cbiAgICAgIGhpZGRlblByZS50ZXh0Q29udGVudCA6IGhpZGRlblByZS5pbm5lclRleHQ7XG4gIH1cbiAgcmV0dXJuIHNwYWNlQmVmb3JlICsgY29udGVudCArIHNwYWNlQWZ0ZXI7XG59XG5cbi8qKlxuICogRXNjYXBlcyBhbGwgcG90ZW50aWFsbHkgZGFuZ2Vyb3VzIGNoYXJhY3RlcnMsIHNvIHRoYXQgdGhlXG4gKiByZXN1bHRpbmcgc3RyaW5nIGNhbiBiZSBzYWZlbHkgaW5zZXJ0ZWQgaW50byBhdHRyaWJ1dGUgb3JcbiAqIGVsZW1lbnQgdGV4dC5cbiAqIEBwYXJhbSB2YWx1ZVxuICogQHJldHVybnMge3N0cmluZ30gZXNjYXBlZCB0ZXh0XG4gKi9cbmZ1bmN0aW9uIGVuY29kZUVudGl0aWVzKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5cbiAgICByZXBsYWNlKC8mL2csICcmYW1wOycpLlxuICAgIHJlcGxhY2UoU1VSUk9HQVRFX1BBSVJfUkVHRVhQLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFyIGhpID0gdmFsdWUuY2hhckNvZGVBdCgwKTtcbiAgICAgIHZhciBsb3cgPSB2YWx1ZS5jaGFyQ29kZUF0KDEpO1xuICAgICAgcmV0dXJuICcmIycgKyAoKChoaSAtIDB4RDgwMCkgKiAweDQwMCkgKyAobG93IC0gMHhEQzAwKSArIDB4MTAwMDApICsgJzsnO1xuICAgIH0pLlxuICAgIHJlcGxhY2UoTk9OX0FMUEhBTlVNRVJJQ19SRUdFWFAsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gJyYjJyArIHZhbHVlLmNoYXJDb2RlQXQoMCkgKyAnOyc7XG4gICAgfSkuXG4gICAgcmVwbGFjZSgvPC9nLCAnJmx0OycpLlxuICAgIHJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn1cblxuLyoqXG4gKiBjcmVhdGUgYW4gSFRNTC9YTUwgd3JpdGVyIHdoaWNoIHdyaXRlcyB0byBidWZmZXJcbiAqIEBwYXJhbSB7QXJyYXl9IGJ1ZiB1c2UgYnVmLmphaW4oJycpIHRvIGdldCBvdXQgc2FuaXRpemVkIGh0bWwgc3RyaW5nXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBpbiB0aGUgZm9ybSBvZiB7XG4gKiAgICAgc3RhcnQ6IGZ1bmN0aW9uKHRhZywgYXR0cnMsIHVuYXJ5KSB7fSxcbiAqICAgICBlbmQ6IGZ1bmN0aW9uKHRhZykge30sXG4gKiAgICAgY2hhcnM6IGZ1bmN0aW9uKHRleHQpIHt9LFxuICogICAgIGNvbW1lbnQ6IGZ1bmN0aW9uKHRleHQpIHt9XG4gKiB9XG4gKi9cbmZ1bmN0aW9uIGh0bWxTYW5pdGl6ZVdyaXRlcihidWYsIHVyaVZhbGlkYXRvcikge1xuICB2YXIgaWdub3JlID0gZmFsc2U7XG4gIHZhciBvdXQgPSBhbmd1bGFyLmJpbmQoYnVmLCBidWYucHVzaCk7XG4gIHJldHVybiB7XG4gICAgc3RhcnQ6IGZ1bmN0aW9uKHRhZywgYXR0cnMsIHVuYXJ5KSB7XG4gICAgICB0YWcgPSBhbmd1bGFyLmxvd2VyY2FzZSh0YWcpO1xuICAgICAgaWYgKCFpZ25vcmUgJiYgc3BlY2lhbEVsZW1lbnRzW3RhZ10pIHtcbiAgICAgICAgaWdub3JlID0gdGFnO1xuICAgICAgfVxuICAgICAgaWYgKCFpZ25vcmUgJiYgdmFsaWRFbGVtZW50c1t0YWddID09PSB0cnVlKSB7XG4gICAgICAgIG91dCgnPCcpO1xuICAgICAgICBvdXQodGFnKTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGF0dHJzLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgdmFyIGxrZXk9YW5ndWxhci5sb3dlcmNhc2Uoa2V5KTtcbiAgICAgICAgICB2YXIgaXNJbWFnZSA9ICh0YWcgPT09ICdpbWcnICYmIGxrZXkgPT09ICdzcmMnKSB8fCAobGtleSA9PT0gJ2JhY2tncm91bmQnKTtcbiAgICAgICAgICBpZiAodmFsaWRBdHRyc1tsa2V5XSA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICAgKHVyaUF0dHJzW2xrZXldICE9PSB0cnVlIHx8IHVyaVZhbGlkYXRvcih2YWx1ZSwgaXNJbWFnZSkpKSB7XG4gICAgICAgICAgICBvdXQoJyAnKTtcbiAgICAgICAgICAgIG91dChrZXkpO1xuICAgICAgICAgICAgb3V0KCc9XCInKTtcbiAgICAgICAgICAgIG91dChlbmNvZGVFbnRpdGllcyh2YWx1ZSkpO1xuICAgICAgICAgICAgb3V0KCdcIicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG91dCh1bmFyeSA/ICcvPicgOiAnPicpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZW5kOiBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgdGFnID0gYW5ndWxhci5sb3dlcmNhc2UodGFnKTtcbiAgICAgICAgaWYgKCFpZ25vcmUgJiYgdmFsaWRFbGVtZW50c1t0YWddID09PSB0cnVlKSB7XG4gICAgICAgICAgb3V0KCc8LycpO1xuICAgICAgICAgIG91dCh0YWcpO1xuICAgICAgICAgIG91dCgnPicpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWcgPT0gaWdub3JlKSB7XG4gICAgICAgICAgaWdub3JlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgY2hhcnM6IGZ1bmN0aW9uKGNoYXJzKSB7XG4gICAgICAgIGlmICghaWdub3JlKSB7XG4gICAgICAgICAgb3V0KGVuY29kZUVudGl0aWVzKGNoYXJzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgfTtcbn1cblxuXG4vLyBkZWZpbmUgbmdTYW5pdGl6ZSBtb2R1bGUgYW5kIHJlZ2lzdGVyICRzYW5pdGl6ZSBzZXJ2aWNlXG5hbmd1bGFyLm1vZHVsZSgnbmdTYW5pdGl6ZScsIFtdKS5wcm92aWRlcignJHNhbml0aXplJywgJFNhbml0aXplUHJvdmlkZXIpO1xuXG4vKiBnbG9iYWwgc2FuaXRpemVUZXh0OiBmYWxzZSAqL1xuXG4vKipcbiAqIEBuZ2RvYyBmaWx0ZXJcbiAqIEBuYW1lIGxpbmt5XG4gKiBAa2luZCBmdW5jdGlvblxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogRmluZHMgbGlua3MgaW4gdGV4dCBpbnB1dCBhbmQgdHVybnMgdGhlbSBpbnRvIGh0bWwgbGlua3MuIFN1cHBvcnRzIGh0dHAvaHR0cHMvZnRwL21haWx0byBhbmRcbiAqIHBsYWluIGVtYWlsIGFkZHJlc3MgbGlua3MuXG4gKlxuICogUmVxdWlyZXMgdGhlIHtAbGluayBuZ1Nhbml0aXplIGBuZ1Nhbml0aXplYH0gbW9kdWxlIHRvIGJlIGluc3RhbGxlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBJbnB1dCB0ZXh0LlxuICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldCBXaW5kb3cgKF9ibGFua3xfc2VsZnxfcGFyZW50fF90b3ApIG9yIG5hbWVkIGZyYW1lIHRvIG9wZW4gbGlua3MgaW4uXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBIdG1sLWxpbmtpZmllZCB0ZXh0LlxuICpcbiAqIEB1c2FnZVxuICAgPHNwYW4gbmctYmluZC1odG1sPVwibGlua3lfZXhwcmVzc2lvbiB8IGxpbmt5XCI+PC9zcGFuPlxuICpcbiAqIEBleGFtcGxlXG4gICA8ZXhhbXBsZSBtb2R1bGU9XCJsaW5reUV4YW1wbGVcIiBkZXBzPVwiYW5ndWxhci1zYW5pdGl6ZS5qc1wiPlxuICAgICA8ZmlsZSBuYW1lPVwiaW5kZXguaHRtbFwiPlxuICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICBhbmd1bGFyLm1vZHVsZSgnbGlua3lFeGFtcGxlJywgWyduZ1Nhbml0aXplJ10pXG4gICAgICAgICAgIC5jb250cm9sbGVyKCdFeGFtcGxlQ29udHJvbGxlcicsIFsnJHNjb3BlJywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAgICAgICAgJHNjb3BlLnNuaXBwZXQgPVxuICAgICAgICAgICAgICAgJ1ByZXR0eSB0ZXh0IHdpdGggc29tZSBsaW5rczpcXG4nK1xuICAgICAgICAgICAgICAgJ2h0dHA6Ly9hbmd1bGFyanMub3JnLyxcXG4nK1xuICAgICAgICAgICAgICAgJ21haWx0bzp1c0Bzb21ld2hlcmUub3JnLFxcbicrXG4gICAgICAgICAgICAgICAnYW5vdGhlckBzb21ld2hlcmUub3JnLFxcbicrXG4gICAgICAgICAgICAgICAnYW5kIG9uZSBtb3JlOiBmdHA6Ly8xMjcuMC4wLjEvLic7XG4gICAgICAgICAgICAgJHNjb3BlLnNuaXBwZXRXaXRoVGFyZ2V0ID0gJ2h0dHA6Ly9hbmd1bGFyanMub3JnLyc7XG4gICAgICAgICAgIH1dKTtcbiAgICAgICA8L3NjcmlwdD5cbiAgICAgICA8ZGl2IG5nLWNvbnRyb2xsZXI9XCJFeGFtcGxlQ29udHJvbGxlclwiPlxuICAgICAgIFNuaXBwZXQ6IDx0ZXh0YXJlYSBuZy1tb2RlbD1cInNuaXBwZXRcIiBjb2xzPVwiNjBcIiByb3dzPVwiM1wiPjwvdGV4dGFyZWE+XG4gICAgICAgPHRhYmxlPlxuICAgICAgICAgPHRyPlxuICAgICAgICAgICA8dGQ+RmlsdGVyPC90ZD5cbiAgICAgICAgICAgPHRkPlNvdXJjZTwvdGQ+XG4gICAgICAgICAgIDx0ZD5SZW5kZXJlZDwvdGQ+XG4gICAgICAgICA8L3RyPlxuICAgICAgICAgPHRyIGlkPVwibGlua3ktZmlsdGVyXCI+XG4gICAgICAgICAgIDx0ZD5saW5reSBmaWx0ZXI8L3RkPlxuICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgPHByZT4mbHQ7ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXQgfCBsaW5reVwiJmd0Ozxicj4mbHQ7L2RpdiZndDs8L3ByZT5cbiAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgIDxkaXYgbmctYmluZC1odG1sPVwic25pcHBldCB8IGxpbmt5XCI+PC9kaXY+XG4gICAgICAgICAgIDwvdGQ+XG4gICAgICAgICA8L3RyPlxuICAgICAgICAgPHRyIGlkPVwibGlua3ktdGFyZ2V0XCI+XG4gICAgICAgICAgPHRkPmxpbmt5IHRhcmdldDwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPHByZT4mbHQ7ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXRXaXRoVGFyZ2V0IHwgbGlua3k6J19ibGFuaydcIiZndDs8YnI+Jmx0Oy9kaXYmZ3Q7PC9wcmU+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXRXaXRoVGFyZ2V0IHwgbGlua3k6J19ibGFuaydcIj48L2Rpdj5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICAgIDx0ciBpZD1cImVzY2FwZWQtaHRtbFwiPlxuICAgICAgICAgICA8dGQ+bm8gZmlsdGVyPC90ZD5cbiAgICAgICAgICAgPHRkPjxwcmU+Jmx0O2RpdiBuZy1iaW5kPVwic25pcHBldFwiJmd0Ozxicj4mbHQ7L2RpdiZndDs8L3ByZT48L3RkPlxuICAgICAgICAgICA8dGQ+PGRpdiBuZy1iaW5kPVwic25pcHBldFwiPjwvZGl2PjwvdGQ+XG4gICAgICAgICA8L3RyPlxuICAgICAgIDwvdGFibGU+XG4gICAgIDwvZmlsZT5cbiAgICAgPGZpbGUgbmFtZT1cInByb3RyYWN0b3IuanNcIiB0eXBlPVwicHJvdHJhY3RvclwiPlxuICAgICAgIGl0KCdzaG91bGQgbGlua2lmeSB0aGUgc25pcHBldCB3aXRoIHVybHMnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmlkKCdsaW5reS1maWx0ZXInKSkuZWxlbWVudChieS5iaW5kaW5nKCdzbmlwcGV0IHwgbGlua3knKSkuZ2V0VGV4dCgpKS5cbiAgICAgICAgICAgICB0b0JlKCdQcmV0dHkgdGV4dCB3aXRoIHNvbWUgbGlua3M6IGh0dHA6Ly9hbmd1bGFyanMub3JnLywgdXNAc29tZXdoZXJlLm9yZywgJyArXG4gICAgICAgICAgICAgICAgICAnYW5vdGhlckBzb21ld2hlcmUub3JnLCBhbmQgb25lIG1vcmU6IGZ0cDovLzEyNy4wLjAuMS8uJyk7XG4gICAgICAgICBleHBlY3QoZWxlbWVudC5hbGwoYnkuY3NzKCcjbGlua3ktZmlsdGVyIGEnKSkuY291bnQoKSkudG9FcXVhbCg0KTtcbiAgICAgICB9KTtcblxuICAgICAgIGl0KCdzaG91bGQgbm90IGxpbmtpZnkgc25pcHBldCB3aXRob3V0IHRoZSBsaW5reSBmaWx0ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmlkKCdlc2NhcGVkLWh0bWwnKSkuZWxlbWVudChieS5iaW5kaW5nKCdzbmlwcGV0JykpLmdldFRleHQoKSkuXG4gICAgICAgICAgICAgdG9CZSgnUHJldHR5IHRleHQgd2l0aCBzb21lIGxpbmtzOiBodHRwOi8vYW5ndWxhcmpzLm9yZy8sIG1haWx0bzp1c0Bzb21ld2hlcmUub3JnLCAnICtcbiAgICAgICAgICAgICAgICAgICdhbm90aGVyQHNvbWV3aGVyZS5vcmcsIGFuZCBvbmUgbW9yZTogZnRwOi8vMTI3LjAuMC4xLy4nKTtcbiAgICAgICAgIGV4cGVjdChlbGVtZW50LmFsbChieS5jc3MoJyNlc2NhcGVkLWh0bWwgYScpKS5jb3VudCgpKS50b0VxdWFsKDApO1xuICAgICAgIH0pO1xuXG4gICAgICAgaXQoJ3Nob3VsZCB1cGRhdGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgIGVsZW1lbnQoYnkubW9kZWwoJ3NuaXBwZXQnKSkuY2xlYXIoKTtcbiAgICAgICAgIGVsZW1lbnQoYnkubW9kZWwoJ3NuaXBwZXQnKSkuc2VuZEtleXMoJ25ldyBodHRwOi8vbGluay4nKTtcbiAgICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmlkKCdsaW5reS1maWx0ZXInKSkuZWxlbWVudChieS5iaW5kaW5nKCdzbmlwcGV0IHwgbGlua3knKSkuZ2V0VGV4dCgpKS5cbiAgICAgICAgICAgICB0b0JlKCduZXcgaHR0cDovL2xpbmsuJyk7XG4gICAgICAgICBleHBlY3QoZWxlbWVudC5hbGwoYnkuY3NzKCcjbGlua3ktZmlsdGVyIGEnKSkuY291bnQoKSkudG9FcXVhbCgxKTtcbiAgICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmlkKCdlc2NhcGVkLWh0bWwnKSkuZWxlbWVudChieS5iaW5kaW5nKCdzbmlwcGV0JykpLmdldFRleHQoKSlcbiAgICAgICAgICAgICAudG9CZSgnbmV3IGh0dHA6Ly9saW5rLicpO1xuICAgICAgIH0pO1xuXG4gICAgICAgaXQoJ3Nob3VsZCB3b3JrIHdpdGggdGhlIHRhcmdldCBwcm9wZXJ0eScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBleHBlY3QoZWxlbWVudChieS5pZCgnbGlua3ktdGFyZ2V0JykpLlxuICAgICAgICAgICAgZWxlbWVudChieS5iaW5kaW5nKFwic25pcHBldFdpdGhUYXJnZXQgfCBsaW5reTonX2JsYW5rJ1wiKSkuZ2V0VGV4dCgpKS5cbiAgICAgICAgICAgIHRvQmUoJ2h0dHA6Ly9hbmd1bGFyanMub3JnLycpO1xuICAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNsaW5reS10YXJnZXQgYScpKS5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpKS50b0VxdWFsKCdfYmxhbmsnKTtcbiAgICAgICB9KTtcbiAgICAgPC9maWxlPlxuICAgPC9leGFtcGxlPlxuICovXG5hbmd1bGFyLm1vZHVsZSgnbmdTYW5pdGl6ZScpLmZpbHRlcignbGlua3knLCBbJyRzYW5pdGl6ZScsIGZ1bmN0aW9uKCRzYW5pdGl6ZSkge1xuICB2YXIgTElOS1lfVVJMX1JFR0VYUCA9XG4gICAgICAgIC8oKGZ0cHxodHRwcz8pOlxcL1xcL3wobWFpbHRvOik/W0EtWmEtejAtOS5fJSstXStAKVxcUypbXlxccy47LCgpe308PlwiXS8sXG4gICAgICBNQUlMVE9fUkVHRVhQID0gL15tYWlsdG86LztcblxuICByZXR1cm4gZnVuY3Rpb24odGV4dCwgdGFyZ2V0KSB7XG4gICAgaWYgKCF0ZXh0KSByZXR1cm4gdGV4dDtcbiAgICB2YXIgbWF0Y2g7XG4gICAgdmFyIHJhdyA9IHRleHQ7XG4gICAgdmFyIGh0bWwgPSBbXTtcbiAgICB2YXIgdXJsO1xuICAgIHZhciBpO1xuICAgIHdoaWxlICgobWF0Y2ggPSByYXcubWF0Y2goTElOS1lfVVJMX1JFR0VYUCkpKSB7XG4gICAgICAvLyBXZSBjYW4gbm90IGVuZCBpbiB0aGVzZSBhcyB0aGV5IGFyZSBzb21ldGltZXMgZm91bmQgYXQgdGhlIGVuZCBvZiB0aGUgc2VudGVuY2VcbiAgICAgIHVybCA9IG1hdGNoWzBdO1xuICAgICAgLy8gaWYgd2UgZGlkIG5vdCBtYXRjaCBmdHAvaHR0cC9tYWlsdG8gdGhlbiBhc3N1bWUgbWFpbHRvXG4gICAgICBpZiAobWF0Y2hbMl0gPT0gbWF0Y2hbM10pIHVybCA9ICdtYWlsdG86JyArIHVybDtcbiAgICAgIGkgPSBtYXRjaC5pbmRleDtcbiAgICAgIGFkZFRleHQocmF3LnN1YnN0cigwLCBpKSk7XG4gICAgICBhZGRMaW5rKHVybCwgbWF0Y2hbMF0ucmVwbGFjZShNQUlMVE9fUkVHRVhQLCAnJykpO1xuICAgICAgcmF3ID0gcmF3LnN1YnN0cmluZyhpICsgbWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICB9XG4gICAgYWRkVGV4dChyYXcpO1xuICAgIHJldHVybiAkc2FuaXRpemUoaHRtbC5qb2luKCcnKSk7XG5cbiAgICBmdW5jdGlvbiBhZGRUZXh0KHRleHQpIHtcbiAgICAgIGlmICghdGV4dCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBodG1sLnB1c2goc2FuaXRpemVUZXh0KHRleHQpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRMaW5rKHVybCwgdGV4dCkge1xuICAgICAgaHRtbC5wdXNoKCc8YSAnKTtcbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCh0YXJnZXQpKSB7XG4gICAgICAgIGh0bWwucHVzaCgndGFyZ2V0PVwiJyk7XG4gICAgICAgIGh0bWwucHVzaCh0YXJnZXQpO1xuICAgICAgICBodG1sLnB1c2goJ1wiICcpO1xuICAgICAgfVxuICAgICAgaHRtbC5wdXNoKCdocmVmPVwiJyk7XG4gICAgICBodG1sLnB1c2godXJsKTtcbiAgICAgIGh0bWwucHVzaCgnXCI+Jyk7XG4gICAgICBhZGRUZXh0KHRleHQpO1xuICAgICAgaHRtbC5wdXNoKCc8L2E+Jyk7XG4gICAgfVxuICB9O1xufV0pO1xuXG5cbn0pKHdpbmRvdywgd2luZG93LmFuZ3VsYXIpO1xuIiwiLyoqIVxuICogQW5ndWxhckpTIGZpbGUgdXBsb2FkIHNoaW0gZm9yIEhUTUw1IEZvcm1EYXRhXG4gKiBAYXV0aG9yICBEYW5pYWwgIDxkYW5pYWwuZmFyaWRAZ21haWwuY29tPlxuICogQHZlcnNpb24gMS42LjEyXG4gKi9cbihmdW5jdGlvbigpIHtcblxudmFyIGhhc0ZsYXNoID0gZnVuY3Rpb24oKSB7XG5cdHRyeSB7XG5cdCAgdmFyIGZvID0gbmV3IEFjdGl2ZVhPYmplY3QoJ1Nob2Nrd2F2ZUZsYXNoLlNob2Nrd2F2ZUZsYXNoJyk7XG5cdCAgaWYgKGZvKSByZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaChlKSB7XG5cdCAgaWYgKG5hdmlnYXRvci5taW1lVHlwZXNbJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJ10gIT0gdW5kZWZpbmVkKSByZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbnZhciBwYXRjaFhIUiA9IGZ1bmN0aW9uKGZuTmFtZSwgbmV3Rm4pIHtcblx0d2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZVtmbk5hbWVdID0gbmV3Rm4od2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZVtmbk5hbWVdKTtcbn07XG5cbmlmICh3aW5kb3cuWE1MSHR0cFJlcXVlc3QpIHtcblx0aWYgKHdpbmRvdy5Gb3JtRGF0YSAmJiAoIXdpbmRvdy5GaWxlQVBJIHx8ICFGaWxlQVBJLmZvcmNlTG9hZCkpIHtcblx0XHQvLyBhbGxvdyBhY2Nlc3MgdG8gQW5ndWxhciBYSFIgcHJpdmF0ZSBmaWVsZDogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9pc3N1ZXMvMTkzNFxuXHRcdHBhdGNoWEhSKCdzZXRSZXF1ZXN0SGVhZGVyJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGhlYWRlciwgdmFsdWUpIHtcblx0XHRcdFx0aWYgKGhlYWRlciA9PT0gJ19fc2V0WEhSXycpIHtcblx0XHRcdFx0XHR2YXIgdmFsID0gdmFsdWUodGhpcyk7XG5cdFx0XHRcdFx0Ly8gZml4IGZvciBhbmd1bGFyIDwgMS4yLjBcblx0XHRcdFx0XHRpZiAodmFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRcdHZhbCh0aGlzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3JpZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGluaXRpYWxpemVVcGxvYWRMaXN0ZW5lciA9IGZ1bmN0aW9uKHhocikge1xuXHRcdFx0aWYgKCF4aHIuX19saXN0ZW5lcnMpIHtcblx0XHRcdFx0aWYgKCF4aHIudXBsb2FkKSB4aHIudXBsb2FkID0ge307XG5cdFx0XHRcdHhoci5fX2xpc3RlbmVycyA9IFtdO1xuXHRcdFx0XHR2YXIgb3JpZ0FkZEV2ZW50TGlzdGVuZXIgPSB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXI7XG5cdFx0XHRcdHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHQsIGZuLCBiKSB7XG5cdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzW3RdID0gZm47XG5cdFx0XHRcdFx0b3JpZ0FkZEV2ZW50TGlzdGVuZXIgJiYgb3JpZ0FkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0cGF0Y2hYSFIoJ29wZW4nLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24obSwgdXJsLCBiKSB7XG5cdFx0XHRcdGluaXRpYWxpemVVcGxvYWRMaXN0ZW5lcih0aGlzKTtcblx0XHRcdFx0dGhpcy5fX3VybCA9IHVybDtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRvcmlnLmFwcGx5KHRoaXMsIFttLCB1cmwsIGJdKTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdGlmIChlLm1lc3NhZ2UuaW5kZXhPZignQWNjZXNzIGlzIGRlbmllZCcpID4gLTEpIHtcblx0XHRcdFx0XHRcdG9yaWcuYXBwbHkodGhpcywgW20sICdfZml4X2Zvcl9pZV9jcm9zc2RvbWFpbl9fJywgYl0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ2dldFJlc3BvbnNlSGVhZGVyJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGgpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX19maWxlQXBpWEhSICYmIHRoaXMuX19maWxlQXBpWEhSLmdldFJlc3BvbnNlSGVhZGVyID8gdGhpcy5fX2ZpbGVBcGlYSFIuZ2V0UmVzcG9uc2VIZWFkZXIoaCkgOiAob3JpZyA9PSBudWxsID8gbnVsbCA6IG9yaWcuYXBwbHkodGhpcywgW2hdKSk7XG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ2dldEFsbFJlc3BvbnNlSGVhZGVycycsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX19maWxlQXBpWEhSICYmIHRoaXMuX19maWxlQXBpWEhSLmdldEFsbFJlc3BvbnNlSGVhZGVycyA/IHRoaXMuX19maWxlQXBpWEhSLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIDogKG9yaWcgPT0gbnVsbCA/IG51bGwgOiBvcmlnLmFwcGx5KHRoaXMpKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdhYm9ydCcsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX19maWxlQXBpWEhSICYmIHRoaXMuX19maWxlQXBpWEhSLmFib3J0ID8gdGhpcy5fX2ZpbGVBcGlYSFIuYWJvcnQoKSA6IChvcmlnID09IG51bGwgPyBudWxsIDogb3JpZy5hcHBseSh0aGlzKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignc2V0UmVxdWVzdEhlYWRlcicsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihoZWFkZXIsIHZhbHVlKSB7XG5cdFx0XHRcdGlmIChoZWFkZXIgPT09ICdfX3NldFhIUl8nKSB7XG5cdFx0XHRcdFx0aW5pdGlhbGl6ZVVwbG9hZExpc3RlbmVyKHRoaXMpO1xuXHRcdFx0XHRcdHZhciB2YWwgPSB2YWx1ZSh0aGlzKTtcblx0XHRcdFx0XHQvLyBmaXggZm9yIGFuZ3VsYXIgPCAxLjIuMFxuXHRcdFx0XHRcdGlmICh2YWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuXHRcdFx0XHRcdFx0dmFsKHRoaXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLl9fcmVxdWVzdEhlYWRlcnMgPSB0aGlzLl9fcmVxdWVzdEhlYWRlcnMgfHwge307XG5cdFx0XHRcdFx0dGhpcy5fX3JlcXVlc3RIZWFkZXJzW2hlYWRlcl0gPSB2YWx1ZTtcblx0XHRcdFx0XHRvcmlnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdzZW5kJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgeGhyID0gdGhpcztcblx0XHRcdFx0aWYgKGFyZ3VtZW50c1swXSAmJiBhcmd1bWVudHNbMF0uX19pc1NoaW0pIHtcblx0XHRcdFx0XHR2YXIgZm9ybURhdGEgPSBhcmd1bWVudHNbMF07XG5cdFx0XHRcdFx0dmFyIGNvbmZpZyA9IHtcblx0XHRcdFx0XHRcdHVybDogeGhyLl9fdXJsLFxuXHRcdFx0XHRcdFx0anNvbnA6IGZhbHNlLCAvL3JlbW92ZXMgdGhlIGNhbGxiYWNrIGZvcm0gcGFyYW1cblx0XHRcdFx0XHRcdGNhY2hlOiB0cnVlLCAvL3JlbW92ZXMgdGhlID9maWxlYXBpWFhYIGluIHRoZSB1cmxcblx0XHRcdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbihlcnIsIGZpbGVBcGlYSFIpIHtcblx0XHRcdFx0XHRcdFx0eGhyLl9fY29tcGxldGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0aWYgKCFlcnIgJiYgeGhyLl9fbGlzdGVuZXJzWydsb2FkJ10pIFxuXHRcdFx0XHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1snbG9hZCddKHt0eXBlOiAnbG9hZCcsIGxvYWRlZDogeGhyLl9fbG9hZGVkLCB0b3RhbDogeGhyLl9fdG90YWwsIHRhcmdldDogeGhyLCBsZW5ndGhDb21wdXRhYmxlOiB0cnVlfSk7XG5cdFx0XHRcdFx0XHRcdGlmICghZXJyICYmIHhoci5fX2xpc3RlbmVyc1snbG9hZGVuZCddKSBcblx0XHRcdFx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbJ2xvYWRlbmQnXSh7dHlwZTogJ2xvYWRlbmQnLCBsb2FkZWQ6IHhoci5fX2xvYWRlZCwgdG90YWw6IHhoci5fX3RvdGFsLCB0YXJnZXQ6IHhociwgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZXJyID09PSAnYWJvcnQnICYmIHhoci5fX2xpc3RlbmVyc1snYWJvcnQnXSkgXG5cdFx0XHRcdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzWydhYm9ydCddKHt0eXBlOiAnYWJvcnQnLCBsb2FkZWQ6IHhoci5fX2xvYWRlZCwgdG90YWw6IHhoci5fX3RvdGFsLCB0YXJnZXQ6IHhociwgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZmlsZUFwaVhIUi5zdGF0dXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3N0YXR1cycsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiAoZmlsZUFwaVhIUi5zdGF0dXMgPT0gMCAmJiBlcnIgJiYgZXJyICE9PSAnYWJvcnQnKSA/IDUwMCA6IGZpbGVBcGlYSFIuc3RhdHVzfX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZmlsZUFwaVhIUi5zdGF0dXNUZXh0ICE9PSB1bmRlZmluZWQpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdzdGF0dXNUZXh0Jywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIGZpbGVBcGlYSFIuc3RhdHVzVGV4dH19KTtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3JlYWR5U3RhdGUnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gNH19KTtcblx0XHRcdFx0XHRcdFx0aWYgKGZpbGVBcGlYSFIucmVzcG9uc2UgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3Jlc3BvbnNlJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIGZpbGVBcGlYSFIucmVzcG9uc2V9fSk7XG5cdFx0XHRcdFx0XHRcdHZhciByZXNwID0gZmlsZUFwaVhIUi5yZXNwb25zZVRleHQgfHwgKGVyciAmJiBmaWxlQXBpWEhSLnN0YXR1cyA9PSAwICYmIGVyciAhPT0gJ2Fib3J0JyA/IGVyciA6IHVuZGVmaW5lZCk7XG5cdFx0XHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdyZXNwb25zZVRleHQnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gcmVzcH19KTtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3Jlc3BvbnNlJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIHJlc3B9fSk7XG5cdFx0XHRcdFx0XHRcdGlmIChlcnIpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdlcnInLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gZXJyfX0pO1xuXHRcdFx0XHRcdFx0XHR4aHIuX19maWxlQXBpWEhSID0gZmlsZUFwaVhIUjtcblx0XHRcdFx0XHRcdFx0aWYgKHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UpIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UoKTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRmaWxlcHJvZ3Jlc3M6IGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdFx0ZS50YXJnZXQgPSB4aHI7XG5cdFx0XHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1sncHJvZ3Jlc3MnXSAmJiB4aHIuX19saXN0ZW5lcnNbJ3Byb2dyZXNzJ10oZSk7XG5cdFx0XHRcdFx0XHRcdHhoci5fX3RvdGFsID0gZS50b3RhbDtcblx0XHRcdFx0XHRcdFx0eGhyLl9fbG9hZGVkID0gZS5sb2FkZWQ7XG5cdFx0XHRcdFx0XHRcdGlmIChlLnRvdGFsID09PSBlLmxvYWRlZCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIGZpeCBmbGFzaCBpc3N1ZSB0aGF0IGRvZXNuJ3QgY2FsbCBjb21wbGV0ZSBpZiB0aGVyZSBpcyBubyByZXNwb25zZSB0ZXh0IGZyb20gdGhlIHNlcnZlciAgXG5cdFx0XHRcdFx0XHRcdFx0dmFyIF90aGlzID0gdGhpc1xuXHRcdFx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIXhoci5fX2NvbXBsZXRlZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzID0gZnVuY3Rpb24oKXt9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRfdGhpcy5jb21wbGV0ZShudWxsLCB7c3RhdHVzOiAyMDQsIHN0YXR1c1RleHQ6ICdObyBDb250ZW50J30pO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0sIDEwMDAwKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGhlYWRlcnM6IHhoci5fX3JlcXVlc3RIZWFkZXJzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbmZpZy5kYXRhID0ge307XG5cdFx0XHRcdFx0Y29uZmlnLmZpbGVzID0ge31cblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZvcm1EYXRhLmRhdGEubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdHZhciBpdGVtID0gZm9ybURhdGEuZGF0YVtpXTtcblx0XHRcdFx0XHRcdGlmIChpdGVtLnZhbCAhPSBudWxsICYmIGl0ZW0udmFsLm5hbWUgIT0gbnVsbCAmJiBpdGVtLnZhbC5zaXplICE9IG51bGwgJiYgaXRlbS52YWwudHlwZSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdGNvbmZpZy5maWxlc1tpdGVtLmtleV0gPSBpdGVtLnZhbDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNvbmZpZy5kYXRhW2l0ZW0ua2V5XSA9IGl0ZW0udmFsO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZiAoIWhhc0ZsYXNoKCkpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgJ0Fkb2RlIEZsYXNoIFBsYXllciBuZWVkIHRvIGJlIGluc3RhbGxlZC4gVG8gY2hlY2sgYWhlYWQgdXNlIFwiRmlsZUFQSS5oYXNGbGFzaFwiJztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHhoci5fX2ZpbGVBcGlYSFIgPSBGaWxlQVBJLnVwbG9hZChjb25maWcpO1xuXHRcdFx0XHRcdH0sIDEpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9yaWcuYXBwbHkoeGhyLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0d2luZG93LlhNTEh0dHBSZXF1ZXN0Ll9faXNTaGltID0gdHJ1ZTtcbn1cblxuaWYgKCF3aW5kb3cuRm9ybURhdGEgfHwgKHdpbmRvdy5GaWxlQVBJICYmIEZpbGVBUEkuZm9yY2VMb2FkKSkge1xuXHR2YXIgYWRkRmxhc2ggPSBmdW5jdGlvbihlbGVtKSB7XG5cdFx0aWYgKCFoYXNGbGFzaCgpKSB7XG5cdFx0XHR0aHJvdyAnQWRvZGUgRmxhc2ggUGxheWVyIG5lZWQgdG8gYmUgaW5zdGFsbGVkLiBUbyBjaGVjayBhaGVhZCB1c2UgXCJGaWxlQVBJLmhhc0ZsYXNoXCInO1xuXHRcdH1cblx0XHR2YXIgZWwgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbSk7XG5cdFx0aWYgKCFlbC5hdHRyKCdkaXNhYmxlZCcpKSB7XG5cdFx0XHRpZiAoIWVsLmhhc0NsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKSAmJiAoZWxlbS5nZXRBdHRyaWJ1dGUoJ25nLWZpbGUtc2VsZWN0JykgIT0gbnVsbCB8fCBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1uZy1maWxlLXNlbGVjdCcpICE9IG51bGwpKSB7XG5cdFx0XHRcdGlmIChGaWxlQVBJLndyYXBJbnNpZGVEaXYpIHtcblx0XHRcdFx0XHR2YXIgd3JhcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHRcdHdyYXAuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJqcy1maWxlYXBpLXdyYXBwZXJcIiBzdHlsZT1cInBvc2l0aW9uOnJlbGF0aXZlOyBvdmVyZmxvdzpoaWRkZW5cIj48L2Rpdj4nO1xuXHRcdFx0XHRcdHdyYXAgPSB3cmFwLmZpcnN0Q2hpbGQ7XG5cdFx0XHRcdFx0dmFyIHBhcmVudCA9IGVsZW0ucGFyZW50Tm9kZTtcblx0XHRcdFx0XHRwYXJlbnQuaW5zZXJ0QmVmb3JlKHdyYXAsIGVsZW0pO1xuXHRcdFx0XHRcdHBhcmVudC5yZW1vdmVDaGlsZChlbGVtKTtcblx0XHRcdFx0XHR3cmFwLmFwcGVuZENoaWxkKGVsZW0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGVsLmFkZENsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKTtcblx0XHRcdFx0XHRpZiAoZWwucGFyZW50KClbMF0uX19maWxlX2NsaWNrX2ZuX2RlbGVnYXRlXykge1xuXHRcdFx0XHRcdFx0aWYgKGVsLnBhcmVudCgpLmNzcygncG9zaXRpb24nKSA9PT0gJycgfHwgZWwucGFyZW50KCkuY3NzKCdwb3NpdGlvbicpID09PSAnc3RhdGljJykge1xuXHRcdFx0XHRcdFx0XHRlbC5wYXJlbnQoKS5jc3MoJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbC5jc3MoJ3RvcCcsIDApLmNzcygnYm90dG9tJywgMCkuY3NzKCdsZWZ0JywgMCkuY3NzKCdyaWdodCcsIDApLmNzcygnd2lkdGgnLCAnMTAwJScpLmNzcygnaGVpZ2h0JywgJzEwMCUnKS5cblx0XHRcdFx0XHRcdFx0Y3NzKCdwYWRkaW5nJywgMCkuY3NzKCdtYXJnaW4nLCAwKTtcblx0XHRcdFx0XHRcdGVsLnBhcmVudCgpLnVuYmluZCgnY2xpY2snLCBlbC5wYXJlbnQoKVswXS5fX2ZpbGVfY2xpY2tfZm5fZGVsZWdhdGVfKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdHZhciBjaGFuZ2VGbldyYXBwZXIgPSBmdW5jdGlvbihmbikge1xuXHRcdHJldHVybiBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBmaWxlcyA9IEZpbGVBUEkuZ2V0RmlsZXMoZXZ0KTtcblx0XHRcdC8vanVzdCBhIGRvdWJsZSBjaGVjayBmb3IgIzIzM1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoZmlsZXNbaV0uc2l6ZSA9PT0gdW5kZWZpbmVkKSBmaWxlc1tpXS5zaXplID0gMDtcblx0XHRcdFx0aWYgKGZpbGVzW2ldLm5hbWUgPT09IHVuZGVmaW5lZCkgZmlsZXNbaV0ubmFtZSA9ICdmaWxlJztcblx0XHRcdFx0aWYgKGZpbGVzW2ldLnR5cGUgPT09IHVuZGVmaW5lZCkgZmlsZXNbaV0udHlwZSA9ICd1bmRlZmluZWQnO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFldnQudGFyZ2V0KSB7XG5cdFx0XHRcdGV2dC50YXJnZXQgPSB7fTtcblx0XHRcdH1cblx0XHRcdGV2dC50YXJnZXQuZmlsZXMgPSBmaWxlcztcblx0XHRcdC8vIGlmIGV2dC50YXJnZXQuZmlsZXMgaXMgbm90IHdyaXRhYmxlIHVzZSBoZWxwZXIgZmllbGRcblx0XHRcdGlmIChldnQudGFyZ2V0LmZpbGVzICE9IGZpbGVzKSB7XG5cdFx0XHRcdGV2dC5fX2ZpbGVzXyA9IGZpbGVzO1xuXHRcdFx0fVxuXHRcdFx0KGV2dC5fX2ZpbGVzXyB8fCBldnQudGFyZ2V0LmZpbGVzKS5pdGVtID0gZnVuY3Rpb24oaSkge1xuXHRcdFx0XHRyZXR1cm4gKGV2dC5fX2ZpbGVzXyB8fCBldnQudGFyZ2V0LmZpbGVzKVtpXSB8fCBudWxsO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGZuKSBmbi5hcHBseSh0aGlzLCBbZXZ0XSk7XG5cdFx0fTtcblx0fTtcblx0dmFyIGlzRmlsZUNoYW5nZSA9IGZ1bmN0aW9uKGVsZW0sIGUpIHtcblx0XHRyZXR1cm4gKGUudG9Mb3dlckNhc2UoKSA9PT0gJ2NoYW5nZScgfHwgZS50b0xvd2VyQ2FzZSgpID09PSAnb25jaGFuZ2UnKSAmJiBlbGVtLmdldEF0dHJpYnV0ZSgndHlwZScpID09ICdmaWxlJztcblx0fVxuXHRpZiAoSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcikge1xuXHRcdEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSAoZnVuY3Rpb24ob3JpZ0FkZEV2ZW50TGlzdGVuZXIpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihlLCBmbiwgYiwgZCkge1xuXHRcdFx0XHRpZiAoaXNGaWxlQ2hhbmdlKHRoaXMsIGUpKSB7XG5cdFx0XHRcdFx0YWRkRmxhc2godGhpcyk7XG5cdFx0XHRcdFx0b3JpZ0FkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgW2UsIGNoYW5nZUZuV3JhcHBlcihmbiksIGIsIGRdKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvcmlnQWRkRXZlbnRMaXN0ZW5lci5hcHBseSh0aGlzLCBbZSwgZm4sIGIsIGRdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIpO1xuXHR9XG5cdGlmIChIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hdHRhY2hFdmVudCkge1xuXHRcdEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmF0dGFjaEV2ZW50ID0gKGZ1bmN0aW9uKG9yaWdBdHRhY2hFdmVudCkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGUsIGZuKSB7XG5cdFx0XHRcdGlmIChpc0ZpbGVDaGFuZ2UodGhpcywgZSkpIHtcblx0XHRcdFx0XHRhZGRGbGFzaCh0aGlzKTtcblx0XHRcdFx0XHRpZiAod2luZG93LmpRdWVyeSkge1xuXHRcdFx0XHRcdFx0Ly8gZml4IGZvciAjMjgxIGpRdWVyeSBvbiBJRThcblx0XHRcdFx0XHRcdGFuZ3VsYXIuZWxlbWVudCh0aGlzKS5iaW5kKCdjaGFuZ2UnLCBjaGFuZ2VGbldyYXBwZXIobnVsbCkpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvcmlnQXR0YWNoRXZlbnQuYXBwbHkodGhpcywgW2UsIGNoYW5nZUZuV3JhcHBlcihmbildKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3JpZ0F0dGFjaEV2ZW50LmFwcGx5KHRoaXMsIFtlLCBmbl0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkoSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYXR0YWNoRXZlbnQpO1xuXHR9XG5cblx0d2luZG93LkZvcm1EYXRhID0gRm9ybURhdGEgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0YXBwZW5kOiBmdW5jdGlvbihrZXksIHZhbCwgbmFtZSkge1xuXHRcdFx0XHR0aGlzLmRhdGEucHVzaCh7XG5cdFx0XHRcdFx0a2V5OiBrZXksXG5cdFx0XHRcdFx0dmFsOiB2YWwsXG5cdFx0XHRcdFx0bmFtZTogbmFtZVxuXHRcdFx0XHR9KTtcblx0XHRcdH0sXG5cdFx0XHRkYXRhOiBbXSxcblx0XHRcdF9faXNTaGltOiB0cnVlXG5cdFx0fTtcblx0fTtcblxuXHQoZnVuY3Rpb24gKCkge1xuXHRcdC8vbG9hZCBGaWxlQVBJXG5cdFx0aWYgKCF3aW5kb3cuRmlsZUFQSSkge1xuXHRcdFx0d2luZG93LkZpbGVBUEkgPSB7fTtcblx0XHR9XG5cdFx0aWYgKEZpbGVBUEkuZm9yY2VMb2FkKSB7XG5cdFx0XHRGaWxlQVBJLmh0bWw1ID0gZmFsc2U7XG5cdFx0fVxuXHRcdFxuXHRcdGlmICghRmlsZUFQSS51cGxvYWQpIHtcblx0XHRcdHZhciBqc1VybCwgYmFzZVBhdGgsIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpLCBhbGxTY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpLCBpLCBpbmRleCwgc3JjO1xuXHRcdFx0aWYgKHdpbmRvdy5GaWxlQVBJLmpzVXJsKSB7XG5cdFx0XHRcdGpzVXJsID0gd2luZG93LkZpbGVBUEkuanNVcmw7XG5cdFx0XHR9IGVsc2UgaWYgKHdpbmRvdy5GaWxlQVBJLmpzUGF0aCkge1xuXHRcdFx0XHRiYXNlUGF0aCA9IHdpbmRvdy5GaWxlQVBJLmpzUGF0aDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBhbGxTY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0c3JjID0gYWxsU2NyaXB0c1tpXS5zcmM7XG5cdFx0XHRcdFx0aW5kZXggPSBzcmMuaW5kZXhPZignYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLmpzJylcblx0XHRcdFx0XHRpZiAoaW5kZXggPT0gLTEpIHtcblx0XHRcdFx0XHRcdGluZGV4ID0gc3JjLmluZGV4T2YoJ2FuZ3VsYXItZmlsZS11cGxvYWQtc2hpbS5taW4uanMnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdFx0XHRcdGJhc2VQYXRoID0gc3JjLnN1YnN0cmluZygwLCBpbmRleCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKEZpbGVBUEkuc3RhdGljUGF0aCA9PSBudWxsKSBGaWxlQVBJLnN0YXRpY1BhdGggPSBiYXNlUGF0aDtcblx0XHRcdHNjcmlwdC5zZXRBdHRyaWJ1dGUoJ3NyYycsIGpzVXJsIHx8IGJhc2VQYXRoICsgJ0ZpbGVBUEkubWluLmpzJyk7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7XG5cdFx0XHRGaWxlQVBJLmhhc0ZsYXNoID0gaGFzRmxhc2goKTtcblx0XHR9XG5cdH0pKCk7XG5cdEZpbGVBUEkuZGlzYWJsZUZpbGVJbnB1dCA9IGZ1bmN0aW9uKGVsZW0sIGRpc2FibGUpIHtcblx0XHRpZiAoZGlzYWJsZSkge1xuXHRcdFx0ZWxlbS5yZW1vdmVDbGFzcygnanMtZmlsZWFwaS13cmFwcGVyJylcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZWxlbS5hZGRDbGFzcygnanMtZmlsZWFwaS13cmFwcGVyJyk7XG5cdFx0fVxuXHR9XG59XG5cblxuaWYgKCF3aW5kb3cuRmlsZVJlYWRlcikge1xuXHR3aW5kb3cuRmlsZVJlYWRlciA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBfdGhpcyA9IHRoaXMsIGxvYWRTdGFydGVkID0gZmFsc2U7XG5cdFx0dGhpcy5saXN0ZW5lcnMgPSB7fTtcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBmbikge1xuXHRcdFx0X3RoaXMubGlzdGVuZXJzW3R5cGVdID0gX3RoaXMubGlzdGVuZXJzW3R5cGVdIHx8IFtdO1xuXHRcdFx0X3RoaXMubGlzdGVuZXJzW3R5cGVdLnB1c2goZm4pO1xuXHRcdH07XG5cdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgZm4pIHtcblx0XHRcdF90aGlzLmxpc3RlbmVyc1t0eXBlXSAmJiBfdGhpcy5saXN0ZW5lcnNbdHlwZV0uc3BsaWNlKF90aGlzLmxpc3RlbmVyc1t0eXBlXS5pbmRleE9mKGZuKSwgMSk7XG5cdFx0fTtcblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBsaXN0ID0gX3RoaXMubGlzdGVuZXJzW2V2dC50eXBlXTtcblx0XHRcdGlmIChsaXN0KSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGxpc3RbaV0uY2FsbChfdGhpcywgZXZ0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5vbmFib3J0ID0gdGhpcy5vbmVycm9yID0gdGhpcy5vbmxvYWQgPSB0aGlzLm9ubG9hZHN0YXJ0ID0gdGhpcy5vbmxvYWRlbmQgPSB0aGlzLm9ucHJvZ3Jlc3MgPSBudWxsO1xuXG5cdFx0dmFyIGNvbnN0cnVjdEV2ZW50ID0gZnVuY3Rpb24odHlwZSwgZXZ0KSB7XG5cdFx0XHR2YXIgZSA9IHt0eXBlOiB0eXBlLCB0YXJnZXQ6IF90aGlzLCBsb2FkZWQ6IGV2dC5sb2FkZWQsIHRvdGFsOiBldnQudG90YWwsIGVycm9yOiBldnQuZXJyb3J9O1xuXHRcdFx0aWYgKGV2dC5yZXN1bHQgIT0gbnVsbCkgZS50YXJnZXQucmVzdWx0ID0gZXZ0LnJlc3VsdDtcblx0XHRcdHJldHVybiBlO1xuXHRcdH07XG5cdFx0dmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRpZiAoIWxvYWRTdGFydGVkKSB7XG5cdFx0XHRcdGxvYWRTdGFydGVkID0gdHJ1ZTtcblx0XHRcdFx0X3RoaXMub25sb2Fkc3RhcnQgJiYgdGhpcy5vbmxvYWRzdGFydChjb25zdHJ1Y3RFdmVudCgnbG9hZHN0YXJ0JywgZXZ0KSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZXZ0LnR5cGUgPT09ICdsb2FkJykge1xuXHRcdFx0XHRfdGhpcy5vbmxvYWRlbmQgJiYgX3RoaXMub25sb2FkZW5kKGNvbnN0cnVjdEV2ZW50KCdsb2FkZW5kJywgZXZ0KSk7XG5cdFx0XHRcdHZhciBlID0gY29uc3RydWN0RXZlbnQoJ2xvYWQnLCBldnQpO1xuXHRcdFx0XHRfdGhpcy5vbmxvYWQgJiYgX3RoaXMub25sb2FkKGUpO1xuXHRcdFx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuXHRcdFx0fSBlbHNlIGlmIChldnQudHlwZSA9PT0gJ3Byb2dyZXNzJykge1xuXHRcdFx0XHR2YXIgZSA9IGNvbnN0cnVjdEV2ZW50KCdwcm9ncmVzcycsIGV2dCk7XG5cdFx0XHRcdF90aGlzLm9ucHJvZ3Jlc3MgJiYgX3RoaXMub25wcm9ncmVzcyhlKTtcblx0XHRcdFx0X3RoaXMuZGlzcGF0Y2hFdmVudChlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBlID0gY29uc3RydWN0RXZlbnQoJ2Vycm9yJywgZXZ0KTtcblx0XHRcdFx0X3RoaXMub25lcnJvciAmJiBfdGhpcy5vbmVycm9yKGUpO1xuXHRcdFx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5yZWFkQXNBcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdEZpbGVBUEkucmVhZEFzQmluYXJ5U3RyaW5nKGZpbGUsIGxpc3RlbmVyKTtcblx0XHR9XG5cdFx0dGhpcy5yZWFkQXNCaW5hcnlTdHJpbmcgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRGaWxlQVBJLnJlYWRBc0JpbmFyeVN0cmluZyhmaWxlLCBsaXN0ZW5lcik7XG5cdFx0fVxuXHRcdHRoaXMucmVhZEFzRGF0YVVSTCA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdEZpbGVBUEkucmVhZEFzRGF0YVVSTChmaWxlLCBsaXN0ZW5lcik7XG5cdFx0fVxuXHRcdHRoaXMucmVhZEFzVGV4dCA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdEZpbGVBUEkucmVhZEFzVGV4dChmaWxlLCBsaXN0ZW5lcik7XG5cdFx0fVxuXHR9XG59XG5cbn0pKCk7XG4iLCIvKiohXG4gKiBBbmd1bGFySlMgZmlsZSB1cGxvYWQvZHJvcCBkaXJlY3RpdmUgd2l0aCBodHRwIHBvc3QgYW5kIHByb2dyZXNzXG4gKiBAYXV0aG9yICBEYW5pYWwgIDxkYW5pYWwuZmFyaWRAZ21haWwuY29tPlxuICogQHZlcnNpb24gMS42LjEyXG4gKi9cbihmdW5jdGlvbigpIHtcblxudmFyIGFuZ3VsYXJGaWxlVXBsb2FkID0gYW5ndWxhci5tb2R1bGUoJ2FuZ3VsYXJGaWxlVXBsb2FkJywgW10pO1xuXG5hbmd1bGFyRmlsZVVwbG9hZC5zZXJ2aWNlKCckdXBsb2FkJywgWyckaHR0cCcsICckcScsICckdGltZW91dCcsIGZ1bmN0aW9uKCRodHRwLCAkcSwgJHRpbWVvdXQpIHtcblx0ZnVuY3Rpb24gc2VuZEh0dHAoY29uZmlnKSB7XG5cdFx0Y29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QgfHwgJ1BPU1QnO1xuXHRcdGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cdFx0Y29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgPSBjb25maWcudHJhbnNmb3JtUmVxdWVzdCB8fCBmdW5jdGlvbihkYXRhLCBoZWFkZXJzR2V0dGVyKSB7XG5cdFx0XHRpZiAod2luZG93LkFycmF5QnVmZmVyICYmIGRhdGEgaW5zdGFuY2VvZiB3aW5kb3cuQXJyYXlCdWZmZXIpIHtcblx0XHRcdFx0cmV0dXJuIGRhdGE7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gJGh0dHAuZGVmYXVsdHMudHJhbnNmb3JtUmVxdWVzdFswXShkYXRhLCBoZWFkZXJzR2V0dGVyKTtcblx0XHR9O1xuXHRcdHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cblx0XHRpZiAod2luZG93LlhNTEh0dHBSZXF1ZXN0Ll9faXNTaGltKSB7XG5cdFx0XHRjb25maWcuaGVhZGVyc1snX19zZXRYSFJfJ10gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKHhocikge1xuXHRcdFx0XHRcdGlmICgheGhyKSByZXR1cm47XG5cdFx0XHRcdFx0Y29uZmlnLl9fWEhSID0geGhyO1xuXHRcdFx0XHRcdGNvbmZpZy54aHJGbiAmJiBjb25maWcueGhyRm4oeGhyKTtcblx0XHRcdFx0XHR4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdFx0ZGVmZXJyZWQubm90aWZ5KGUpO1xuXHRcdFx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdFx0XHQvL2ZpeCBmb3IgZmlyZWZveCBub3QgZmlyaW5nIHVwbG9hZCBwcm9ncmVzcyBlbmQsIGFsc28gSUU4LTlcblx0XHRcdFx0XHR4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XHRpZiAoZS5sZW5ndGhDb21wdXRhYmxlKSB7XG5cdFx0XHRcdFx0XHRcdGRlZmVycmVkLm5vdGlmeShlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRcdH07XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdCRodHRwKGNvbmZpZykudGhlbihmdW5jdGlvbihyKXtkZWZlcnJlZC5yZXNvbHZlKHIpfSwgZnVuY3Rpb24oZSl7ZGVmZXJyZWQucmVqZWN0KGUpfSwgZnVuY3Rpb24obil7ZGVmZXJyZWQubm90aWZ5KG4pfSk7XG5cdFx0XG5cdFx0dmFyIHByb21pc2UgPSBkZWZlcnJlZC5wcm9taXNlO1xuXHRcdHByb21pc2Uuc3VjY2VzcyA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0XHRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0Zm4ocmVzcG9uc2UuZGF0YSwgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZS5oZWFkZXJzLCBjb25maWcpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXG5cdFx0cHJvbWlzZS5lcnJvciA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0XHRwcm9taXNlLnRoZW4obnVsbCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0Zm4ocmVzcG9uc2UuZGF0YSwgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZS5oZWFkZXJzLCBjb25maWcpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXG5cdFx0cHJvbWlzZS5wcm9ncmVzcyA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0XHRwcm9taXNlLnRoZW4obnVsbCwgbnVsbCwgZnVuY3Rpb24odXBkYXRlKSB7XG5cdFx0XHRcdGZuKHVwZGF0ZSk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cdFx0cHJvbWlzZS5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKGNvbmZpZy5fX1hIUikge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRjb25maWcuX19YSFIuYWJvcnQoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXHRcdHByb21pc2UueGhyID0gZnVuY3Rpb24oZm4pIHtcblx0XHRcdGNvbmZpZy54aHJGbiA9IChmdW5jdGlvbihvcmlnWGhyRm4pIHtcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdG9yaWdYaHJGbiAmJiBvcmlnWGhyRm4uYXBwbHkocHJvbWlzZSwgYXJndW1lbnRzKTtcblx0XHRcdFx0XHRmbi5hcHBseShwcm9taXNlLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KShjb25maWcueGhyRm4pO1xuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblx0XHRcblx0XHRyZXR1cm4gcHJvbWlzZTtcblx0fVxuXG5cdHRoaXMudXBsb2FkID0gZnVuY3Rpb24oY29uZmlnKSB7XG5cdFx0Y29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblx0XHRjb25maWcuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB1bmRlZmluZWQ7XG5cdFx0Y29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgPSBjb25maWcudHJhbnNmb3JtUmVxdWVzdCB8fCAkaHR0cC5kZWZhdWx0cy50cmFuc2Zvcm1SZXF1ZXN0O1xuXHRcdHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdHZhciBvcmlnVHJhbnNmb3JtUmVxdWVzdCA9IGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0O1xuXHRcdHZhciBvcmlnRGF0YSA9IGNvbmZpZy5kYXRhO1xuXHRcdGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0ID0gZnVuY3Rpb24oZm9ybURhdGEsIGhlYWRlckdldHRlcikge1xuXHRcdFx0aWYgKG9yaWdEYXRhKSB7XG5cdFx0XHRcdGlmIChjb25maWcuZm9ybURhdGFBcHBlbmRlcikge1xuXHRcdFx0XHRcdGZvciAodmFyIGtleSBpbiBvcmlnRGF0YSkge1xuXHRcdFx0XHRcdFx0dmFyIHZhbCA9IG9yaWdEYXRhW2tleV07XG5cdFx0XHRcdFx0XHRjb25maWcuZm9ybURhdGFBcHBlbmRlcihmb3JtRGF0YSwga2V5LCB2YWwpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gb3JpZ0RhdGEpIHtcblx0XHRcdFx0XHRcdHZhciB2YWwgPSBvcmlnRGF0YVtrZXldO1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcmlnVHJhbnNmb3JtUmVxdWVzdCA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdHZhbCA9IG9yaWdUcmFuc2Zvcm1SZXF1ZXN0KHZhbCwgaGVhZGVyR2V0dGVyKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgb3JpZ1RyYW5zZm9ybVJlcXVlc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHR2YXIgdHJhbnNmb3JtRm4gPSBvcmlnVHJhbnNmb3JtUmVxdWVzdFtpXTtcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIHRyYW5zZm9ybUZuID09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhbCA9IHRyYW5zZm9ybUZuKHZhbCwgaGVhZGVyR2V0dGVyKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGZvcm1EYXRhLmFwcGVuZChrZXksIHZhbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjb25maWcuZmlsZSAhPSBudWxsKSB7XG5cdFx0XHRcdHZhciBmaWxlRm9ybU5hbWUgPSBjb25maWcuZmlsZUZvcm1EYXRhTmFtZSB8fCAnZmlsZSc7XG5cblx0XHRcdFx0aWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChjb25maWcuZmlsZSkgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcblx0XHRcdFx0XHR2YXIgaXNGaWxlRm9ybU5hbWVTdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZmlsZUZvcm1OYW1lKSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb25maWcuZmlsZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0Zm9ybURhdGEuYXBwZW5kKGlzRmlsZUZvcm1OYW1lU3RyaW5nID8gZmlsZUZvcm1OYW1lIDogZmlsZUZvcm1OYW1lW2ldLCBjb25maWcuZmlsZVtpXSwgXG5cdFx0XHRcdFx0XHRcdFx0KGNvbmZpZy5maWxlTmFtZSAmJiBjb25maWcuZmlsZU5hbWVbaV0pIHx8IGNvbmZpZy5maWxlW2ldLm5hbWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmb3JtRGF0YS5hcHBlbmQoZmlsZUZvcm1OYW1lLCBjb25maWcuZmlsZSwgY29uZmlnLmZpbGVOYW1lIHx8IGNvbmZpZy5maWxlLm5hbWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZm9ybURhdGE7XG5cdFx0fTtcblxuXHRcdGNvbmZpZy5kYXRhID0gZm9ybURhdGE7XG5cblx0XHRyZXR1cm4gc2VuZEh0dHAoY29uZmlnKTtcblx0fTtcblxuXHR0aGlzLmh0dHAgPSBmdW5jdGlvbihjb25maWcpIHtcblx0XHRyZXR1cm4gc2VuZEh0dHAoY29uZmlnKTtcblx0fVxufV0pO1xuXG5hbmd1bGFyRmlsZVVwbG9hZC5kaXJlY3RpdmUoJ25nRmlsZVNlbGVjdCcsIFsgJyRwYXJzZScsICckdGltZW91dCcsIGZ1bmN0aW9uKCRwYXJzZSwgJHRpbWVvdXQpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRyKSB7XG5cdFx0dmFyIGZuID0gJHBhcnNlKGF0dHJbJ25nRmlsZVNlbGVjdCddKTtcblx0XHRpZiAoZWxlbVswXS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICdpbnB1dCcgfHwgKGVsZW0uYXR0cigndHlwZScpICYmIGVsZW0uYXR0cigndHlwZScpLnRvTG93ZXJDYXNlKCkpICE9PSAnZmlsZScpIHtcblx0XHRcdHZhciBmaWxlRWxlbSA9IGFuZ3VsYXIuZWxlbWVudCgnPGlucHV0IHR5cGU9XCJmaWxlXCI+Jylcblx0XHRcdHZhciBhdHRycyA9IGVsZW1bMF0uYXR0cmlidXRlcztcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXR0cnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGF0dHJzW2ldLm5hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ3R5cGUnKSB7XG5cdFx0XHRcdFx0ZmlsZUVsZW0uYXR0cihhdHRyc1tpXS5uYW1lLCBhdHRyc1tpXS52YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChhdHRyW1wibXVsdGlwbGVcIl0pIGZpbGVFbGVtLmF0dHIoXCJtdWx0aXBsZVwiLCBcInRydWVcIik7XG5cdFx0XHRmaWxlRWxlbS5jc3MoXCJ3aWR0aFwiLCBcIjFweFwiKS5jc3MoXCJoZWlnaHRcIiwgXCIxcHhcIikuY3NzKFwib3BhY2l0eVwiLCAwKS5jc3MoXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCIpLmNzcygnZmlsdGVyJywgJ2FscGhhKG9wYWNpdHk9MCknKVxuXHRcdFx0XHRcdC5jc3MoXCJwYWRkaW5nXCIsIDApLmNzcyhcIm1hcmdpblwiLCAwKS5jc3MoXCJvdmVyZmxvd1wiLCBcImhpZGRlblwiKTtcblx0XHRcdGZpbGVFbGVtLmF0dHIoJ19fd3JhcHBlcl9mb3JfcGFyZW50XycsIHRydWUpO1xuXG4vL1x0XHRcdGZpbGVFbGVtLmNzcyhcInRvcFwiLCAwKS5jc3MoXCJib3R0b21cIiwgMCkuY3NzKFwibGVmdFwiLCAwKS5jc3MoXCJyaWdodFwiLCAwKS5jc3MoXCJ3aWR0aFwiLCBcIjEwMCVcIikuXG4vL1x0XHRcdFx0XHRjc3MoXCJvcGFjaXR5XCIsIDApLmNzcyhcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIikuY3NzKCdmaWx0ZXInLCAnYWxwaGEob3BhY2l0eT0wKScpLmNzcyhcInBhZGRpbmdcIiwgMCkuY3NzKFwibWFyZ2luXCIsIDApO1xuXHRcdFx0ZWxlbS5hcHBlbmQoZmlsZUVsZW0pO1xuXHRcdFx0ZWxlbVswXS5fX2ZpbGVfY2xpY2tfZm5fZGVsZWdhdGVfICA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRmaWxlRWxlbVswXS5jbGljaygpO1xuXHRcdFx0fTsgXG5cdFx0XHRlbGVtLmJpbmQoJ2NsaWNrJywgZWxlbVswXS5fX2ZpbGVfY2xpY2tfZm5fZGVsZWdhdGVfKTtcblx0XHRcdGVsZW0uY3NzKFwib3ZlcmZsb3dcIiwgXCJoaWRkZW5cIik7XG4vL1x0XHRcdGlmIChmaWxlRWxlbS5wYXJlbnQoKVswXSAhPSBlbGVtWzBdKSB7XG4vL1x0XHRcdFx0Ly9maXggIzI5OCBidXR0b24gZWxlbWVudFxuLy9cdFx0XHRcdGVsZW0ud3JhcCgnPHNwYW4+Jyk7XG4vL1x0XHRcdFx0ZWxlbS5jc3MoXCJ6LWluZGV4XCIsIFwiLTEwMDBcIilcbi8vXHRcdFx0XHRlbGVtLnBhcmVudCgpLmFwcGVuZChmaWxlRWxlbSk7XG4vL1x0XHRcdFx0ZWxlbSA9IGVsZW0ucGFyZW50KCk7XG4vL1x0XHRcdH1cbi8vXHRcdFx0aWYgKGVsZW0uY3NzKFwicG9zaXRpb25cIikgPT09ICcnIHx8IGVsZW0uY3NzKFwicG9zaXRpb25cIikgPT09ICdzdGF0aWMnKSB7XG4vL1x0XHRcdFx0ZWxlbS5jc3MoXCJwb3NpdGlvblwiLCBcInJlbGF0aXZlXCIpO1xuLy9cdFx0XHR9XG5cdFx0XHRlbGVtID0gZmlsZUVsZW07XG5cdFx0fVxuXHRcdGVsZW0uYmluZCgnY2hhbmdlJywgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgZmlsZXMgPSBbXSwgZmlsZUxpc3QsIGk7XG5cdFx0XHRmaWxlTGlzdCA9IGV2dC5fX2ZpbGVzXyB8fCBldnQudGFyZ2V0LmZpbGVzO1xuXHRcdFx0aWYgKGZpbGVMaXN0ICE9IG51bGwpIHtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGZpbGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0ZmlsZXMucHVzaChmaWxlTGlzdC5pdGVtKGkpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGZuKHNjb3BlLCB7XG5cdFx0XHRcdFx0JGZpbGVzIDogZmlsZXMsXG5cdFx0XHRcdFx0JGV2ZW50IDogZXZ0XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0Ly8gcmVtb3ZlZCB0aGlzIHNpbmNlIGl0IHdhcyBjb25mdXNpbmcgaWYgdGhlIHVzZXIgY2xpY2sgb24gYnJvd3NlIGFuZCB0aGVuIGNhbmNlbCAjMTgxXG4vL1x0XHRlbGVtLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbi8vXHRcdFx0dGhpcy52YWx1ZSA9IG51bGw7XG4vL1x0XHR9KTtcblxuXHRcdC8vIHJlbW92ZWQgYmVjYXVzZSBvZiAjMjUzIGJ1Z1xuXHRcdC8vIHRvdWNoIHNjcmVlbnNcbi8vXHRcdGlmICgoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB8fFxuLy9cdFx0XHRcdChuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgPiAwKSB8fCAobmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHMgPiAwKSkge1xuLy9cdFx0XHRlbGVtLmJpbmQoJ3RvdWNoZW5kJywgZnVuY3Rpb24oZSkge1xuLy9cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcbi8vXHRcdFx0XHRlLnRhcmdldC5jbGljaygpO1xuLy9cdFx0XHR9KTtcbi8vXHRcdH1cblx0fTtcbn0gXSk7XG5cbmFuZ3VsYXJGaWxlVXBsb2FkLmRpcmVjdGl2ZSgnbmdGaWxlRHJvcEF2YWlsYWJsZScsIFsgJyRwYXJzZScsICckdGltZW91dCcsIGZ1bmN0aW9uKCRwYXJzZSwgJHRpbWVvdXQpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRyKSB7XG5cdFx0aWYgKCdkcmFnZ2FibGUnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSkge1xuXHRcdFx0dmFyIGZuID0gJHBhcnNlKGF0dHJbJ25nRmlsZURyb3BBdmFpbGFibGUnXSk7XG5cdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0Zm4oc2NvcGUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufSBdKTtcblxuYW5ndWxhckZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ0ZpbGVEcm9wJywgWyAnJHBhcnNlJywgJyR0aW1lb3V0JywgJyRsb2NhdGlvbicsIGZ1bmN0aW9uKCRwYXJzZSwgJHRpbWVvdXQsICRsb2NhdGlvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHIpIHtcblx0XHRpZiAoJ2RyYWdnYWJsZScgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpKSB7XG5cdFx0XHR2YXIgbGVhdmVUaW1lb3V0ID0gbnVsbDtcblx0XHRcdGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0JHRpbWVvdXQuY2FuY2VsKGxlYXZlVGltZW91dCk7XG5cdFx0XHRcdGlmICghZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18pIHtcblx0XHRcdFx0XHRpZiAoYXR0clsnbmdGaWxlRHJhZ092ZXJDbGFzcyddICYmIGF0dHJbJ25nRmlsZURyYWdPdmVyQ2xhc3MnXS5zZWFyY2goL1xcKSAqJC8pID4gLTEpIHtcblx0XHRcdFx0XHRcdHZhciBkcmFnT3ZlckNsYXNzID0gJHBhcnNlKGF0dHJbJ25nRmlsZURyYWdPdmVyQ2xhc3MnXSkoc2NvcGUsIHtcblx0XHRcdFx0XHRcdFx0JGV2ZW50IDogZXZ0XG5cdFx0XHRcdFx0XHR9KTtcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyA9IGRyYWdPdmVyQ2xhc3M7IFxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyA9IGF0dHJbJ25nRmlsZURyYWdPdmVyQ2xhc3MnXSB8fCBcImRyYWdvdmVyXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsZW0uYWRkQ2xhc3MoZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18pO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0ZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdsZWF2ZVwiLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0bGVhdmVUaW1lb3V0ID0gJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZWxlbS5yZW1vdmVDbGFzcyhlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyk7XG5cdFx0XHRcdFx0ZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18gPSBudWxsO1xuXHRcdFx0XHR9LCBhdHRyWyduZ0ZpbGVEcmFnT3ZlckRlbGF5J10gfHwgMSk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHR2YXIgZm4gPSAkcGFyc2UoYXR0clsnbmdGaWxlRHJvcCddKTtcblx0XHRcdGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRlbGVtLnJlbW92ZUNsYXNzKGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfKTtcblx0XHRcdFx0ZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18gPSBudWxsO1xuXHRcdFx0XHRleHRyYWN0RmlsZXMoZXZ0LCBmdW5jdGlvbihmaWxlcykge1xuXHRcdFx0XHRcdGZuKHNjb3BlLCB7XG5cdFx0XHRcdFx0XHQkZmlsZXMgOiBmaWxlcyxcblx0XHRcdFx0XHRcdCRldmVudCA6IGV2dFxuXHRcdFx0XHRcdH0pO1x0XHRcdFx0XHRcblx0XHRcdFx0fSk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdGZ1bmN0aW9uIGlzQVNDSUkoc3RyKSB7XG5cdFx0XHRcdHJldHVybiAvXltcXDAwMC1cXDE3N10qJC8udGVzdChzdHIpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBleHRyYWN0RmlsZXMoZXZ0LCBjYWxsYmFjaykge1xuXHRcdFx0XHR2YXIgZmlsZXMgPSBbXSwgaXRlbXMgPSBldnQuZGF0YVRyYW5zZmVyLml0ZW1zO1xuXHRcdFx0XHRpZiAoaXRlbXMgJiYgaXRlbXMubGVuZ3RoID4gMCAmJiBpdGVtc1swXS53ZWJraXRHZXRBc0VudHJ5ICYmICRsb2NhdGlvbi5wcm90b2NvbCgpICE9ICdmaWxlJyAmJiBcblx0XHRcdFx0XHRcdGl0ZW1zWzBdLndlYmtpdEdldEFzRW50cnkoKS5pc0RpcmVjdG9yeSkge1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdHZhciBlbnRyeSA9IGl0ZW1zW2ldLndlYmtpdEdldEFzRW50cnkoKTtcblx0XHRcdFx0XHRcdGlmIChlbnRyeSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdC8vZml4IGZvciBjaHJvbWUgYnVnIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0xNDk3MzVcblx0XHRcdFx0XHRcdFx0aWYgKGlzQVNDSUkoZW50cnkubmFtZSkpIHtcblx0XHRcdFx0XHRcdFx0XHR0cmF2ZXJzZUZpbGVUcmVlKGZpbGVzLCBlbnRyeSk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoIWl0ZW1zW2ldLndlYmtpdEdldEFzRW50cnkoKS5pc0RpcmVjdG9yeSkge1xuXHRcdFx0XHRcdFx0XHRcdGZpbGVzLnB1c2goaXRlbXNbaV0uZ2V0QXNGaWxlKCkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhciBmaWxlTGlzdCA9IGV2dC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdFx0XHRcdFx0aWYgKGZpbGVMaXN0ICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZUxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0ZmlsZXMucHVzaChmaWxlTGlzdC5pdGVtKGkpKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0KGZ1bmN0aW9uIHdhaXRGb3JQcm9jZXNzKGRlbGF5KSB7XG5cdFx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZiAoIXByb2Nlc3NpbmcpIHtcblx0XHRcdFx0XHRcdFx0Y2FsbGJhY2soZmlsZXMpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0d2FpdEZvclByb2Nlc3MoMTApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sIGRlbGF5IHx8IDApXG5cdFx0XHRcdH0pKCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHZhciBwcm9jZXNzaW5nID0gMDtcblx0XHRcdGZ1bmN0aW9uIHRyYXZlcnNlRmlsZVRyZWUoZmlsZXMsIGVudHJ5LCBwYXRoKSB7XG5cdFx0XHRcdGlmIChlbnRyeSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0aWYgKGVudHJ5LmlzRGlyZWN0b3J5KSB7XG5cdFx0XHRcdFx0XHR2YXIgZGlyUmVhZGVyID0gZW50cnkuY3JlYXRlUmVhZGVyKCk7XG5cdFx0XHRcdFx0XHRwcm9jZXNzaW5nKys7XG5cdFx0XHRcdFx0XHRkaXJSZWFkZXIucmVhZEVudHJpZXMoZnVuY3Rpb24oZW50cmllcykge1xuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHR0cmF2ZXJzZUZpbGVUcmVlKGZpbGVzLCBlbnRyaWVzW2ldLCAocGF0aCA/IHBhdGggOiBcIlwiKSArIGVudHJ5Lm5hbWUgKyBcIi9cIik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cHJvY2Vzc2luZy0tO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHByb2Nlc3NpbmcrKztcblx0XHRcdFx0XHRcdGVudHJ5LmZpbGUoZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0XHRcdFx0XHRwcm9jZXNzaW5nLS07XG5cdFx0XHRcdFx0XHRcdGZpbGUuX3JlbGF0aXZlUGF0aCA9IChwYXRoID8gcGF0aCA6IFwiXCIpICsgZmlsZS5uYW1lO1xuXHRcdFx0XHRcdFx0XHRmaWxlcy5wdXNoKGZpbGUpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufSBdKTtcblxufSkoKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdDb21wb25lbnREZXRhaWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIGNvbXBvbmVudFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIGNvbnRleHQgPSB7fSxcclxuICAgICAgICAgICAgcHJvcGVydGllcyA9IHt9LFxyXG4gICAgICAgICAgICBjb25uZWN0b3JzID0ge30sXHJcbiAgICAgICAgICAgIHBvcnRzID0ge307XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdDb21wb25lbnREZXRhaWxzQ29udHJvbGxlcicpO1xyXG4gICAgICAgICRzY29wZS5pbml0ID0gZnVuY3Rpb24gKGNvbm5lY3Rpb25JZCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuY29ubmVjdGlvbklkID0gY29ubmVjdGlvbklkO1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnQ29tcG9uZW50RGV0YWlsc18nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRGVzdHJveWluZyA6JywgY29udGV4dC5yZWdpb25JZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdG9yczogY29ubmVjdG9ycyxcclxuICAgICAgICAgICAgICAgIHBvcnRzOiBwb3J0c1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3kpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgIHBvcnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmIChkZXN0cm95KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiBub3RpZnkgdXNlclxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnQ29tcG9uZW50RGV0YWlsc0NvbnRyb2xsZXIgLSBpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKGNvbnRleHQsICRzY29wZS5jb21wb25lbnRJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHdhdGNoSW50ZXJmYWNlcyBrZWVwcyB0aGUgZGF0YSB1cC10by1kYXRlIHRoZXJlIHNob3VsZG4ndCBiZSBhIG5lZWQgdG8gZG8gYW55XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlcyBoZXJlLi5cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hJbnRlcmZhY2VzJywgdXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbXBvbmVudEludGVyZmFjZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMucHJvcGVydGllcyA9IGNvbXBvbmVudEludGVyZmFjZXMucHJvcGVydGllcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMuY29ubmVjdG9ycyA9IGNvbXBvbmVudEludGVyZmFjZXMuY29ubmVjdG9ycztcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMucG9ydHMgPSBjb21wb25lbnRJbnRlcmZhY2VzLnBvcnRzO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2NvbXBvbmVudERldGFpbHMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRJZDogJz1jb21wb25lbnRJZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVxdWlyZTogJ15jb21wb25lbnRMaXN0JyxcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyLCBjb21wb25ldExpc3RDb250cm9sbGVyKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdGlvbklkID0gY29tcG9uZXRMaXN0Q29udHJvbGxlci5nZXRDb25uZWN0aW9uSWQoKTtcclxuICAgICAgICAgICAgICAgIHNjb3BlLmluaXQoY29ubmVjdGlvbklkKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvSW50ZXJmYWNlRGV0YWlscy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbXBvbmVudERldGFpbHNDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignQ29tcG9uZW50TGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkd2luZG93LCAkbW9kYWwsIGdyb3dsLCBjb21wb25lbnRTZXJ2aWNlLCBmaWxlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGl0ZW1zID0gW10sICAgICAgICAgICAgIC8vIEl0ZW1zIHRoYXQgYXJlIHBhc3NlZCB0byB0aGUgaXRlbS1saXN0IHVpLWNvbXBvbmVudC5cclxuICAgICAgICAgICAgY29tcG9uZW50SXRlbXMgPSB7fSwgICAgLy8gU2FtZSBpdGVtcyBhcmUgc3RvcmVkIGluIGEgZGljdGlvbmFyeS5cclxuICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0sXHJcbiAgICAgICAgICAgIGFkZERvbWFpbldhdGNoZXIsXHJcbiAgICAgICAgICAgIGNvbmZpZyxcclxuICAgICAgICAgICAgY29udGV4dDtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NvbXBvbmVudExpc3RDb250cm9sbGVyJywgJHNjb3BlLmF2bUlkcyk7XHJcbiAgICAgICAgdGhpcy5nZXRDb25uZWN0aW9uSWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUuY29ubmVjdGlvbklkO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbm5lY3Rpb25JZCBhbmQgcmVnaXN0ZXIgY2xlYW4tdXAgb24gZGVzdHJveSBldmVudC5cclxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnQ29tcG9uZW50TGlzdENvbnRyb2xsZXJfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDb25maWd1cmF0aW9uIGZvciB0aGUgaXRlbSBsaXN0IHVpIGNvbXBvbmVudC5cclxuICAgICAgICBjb25maWcgPSB7XHJcblxyXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWxzQ29sbGFwc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNob3dEZXRhaWxzTGFiZWw6ICdTaG93IGRldGFpbHMnLFxyXG4gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcclxuXHJcbiAgICAgICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzXHJcblxyXG4gICAgICAgICAgICBpdGVtU29ydDogZnVuY3Rpb24gKGpRRXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU29ydCBoYXBwZW5lZCcsIGpRRXZlbnQsIHVpKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJGVtaXQoJ3NlbGVjdGVkSW5zdGFuY2VzJywge25hbWU6IGl0ZW0udGl0bGUsIGlkczogaXRlbS5kYXRhLmluc3RhbmNlSWRzfSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ29udGV4dG1lbnVSZW5kZXJlcjogZnVuY3Rpb24gKGUsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcvP3Byb2plY3Q9QURNRWRpdG9yJmFjdGl2ZU9iamVjdD0nICsgaXRlbS5pZCwgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdlZGl0Q29tcG9uZW50JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VkaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge2Rlc2NyaXB0aW9uOiBpdGVtLmRlc2NyaXB0aW9uLCBpZDogaXRlbS5pZH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdENvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGI6IGNvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29tcG9uZW50cydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0NvbXBvbmVudEVkaXQuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbXBvbmVudEVkaXRDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3NpemU6IHNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTogeyBkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uIChlZGl0ZWREYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXR0cnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lORk8nOiBlZGl0ZWREYXRhLmRlc2NyaXB0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS5zZXRDb21wb25lbnRBdHRyaWJ1dGVzKGVkaXRDb250ZXh0LCBkYXRhLmlkLCBhdHRycylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBdHRyaWJ1dGUgdXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc0FjbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeHBvcnQgQUNNJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtyZXNvdXJjZTogaXRlbS5kYXRhLnJlc291cmNlLCBuYW1lOiBpdGVtLnRpdGxlfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoYXNoID0gZGF0YS5yZXNvdXJjZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGZpbGVTZXJ2aWNlLmdldERvd25sb2FkVXJsKGhhc2gpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCdBQ00gZmlsZSBmb3IgPGEgaHJlZj1cIicgKyB1cmwgKyAnXCI+JyArIGRhdGEubmFtZSArICc8L2E+IGV4cG9ydGVkLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyhkYXRhLm5hbWUgKyAnIGRvZXMgbm90IGhhdmUgYSByZXNvdXJjZS4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkLCBuYW1lOiBpdGVtLnRpdGxlIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1NpbXBsZU1vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NpbXBsZU1vZGFsQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUgQ29tcG9uZW50JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHM6ICdUaGlzIHdpbGwgZGVsZXRlICcgKyBkYXRhLm5hbWUgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgZnJvbSB0aGUgd29ya3NwYWNlLidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLmRlbGV0ZUNvbXBvbmVudChjb250ZXh0LCBkYXRhLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaXRlbS5kZXRhaWxzID0gJ015IGRldGFpbHMgYXJlIGhlcmUgbm93ISc7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBmaWx0ZXI6IHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcclxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIHRoZSByYXcgc2VydmljZSBub2RlIGRhdGEgdG8gaXRlbXMgZm9yIHRoZSBsaXN0LlxyXG4gICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGxpc3RJdGVtO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudEl0ZW1zLmhhc093blByb3BlcnR5KGRhdGEuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IGNvbXBvbmVudEl0ZW1zW2RhdGEuaWRdO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0udGl0bGUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kZXNjcmlwdGlvbiA9IGRhdGEuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kYXRhLnJlc291cmNlID0gZGF0YS5yZXNvdXJjZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJHNjb3BlLmF2bUlkcyA/ICdIaWdobGlnaHQgaW5zdGFuY2VzJyA6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVcGRhdGVkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6ICdOL0EnLCAgIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnICAgIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0czogWyBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHM6ICdDb250ZW50JyxcclxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzVGVtcGxhdGVVcmw6ICdjb21wb25lbnREZXRhaWxzLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHsgcmVzb3VyY2U6IGRhdGEucmVzb3VyY2UgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuYXZtSWRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGF0YS5pbnN0YW5jZUlkcyA9ICRzY29wZS5hdm1JZHNbZGF0YS5hdm1JZF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGxpc3QtaXRlbSB0byB0aGUgaXRlbXMgbGlzdCBhbmQgdGhlIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGxpc3RJdGVtKTtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudEl0ZW1zW2xpc3RJdGVtLmlkXSA9IGxpc3RJdGVtO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYWRkRG9tYWluV2F0Y2hlciA9IGZ1bmN0aW9uIChjb21wb25lbnRJZCkge1xyXG4gICAgICAgICAgICB2YXIgZG9tYWluTW9kZWxzVG9TdGF0ID0gZnVuY3Rpb24gKGRvbWFpbk1vZGVscykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRzID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxNYXAgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENBRDogeyB2YWx1ZTogMCwgdG9vbFRpcDogJ0NBRCcsIGljb25DbGFzczogJ2ZhIGZhLWNvZGVwZW4nIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEN5YmVyOiB7IHZhbHVlOiAwLCB0b29sVGlwOiAnQ3liZXInLCBpY29uQ2xhc3M6ICdmYSBmYS1sYXB0b3AnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hbnVmYWN0dXJpbmc6IHsgdmFsdWU6IDAsIHRvb2xUaXA6ICdNYW51ZmFjdHVyaW5nJywgaWNvbkNsYXNzOiAnZmEgZmEtd3JlbmNoJyB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBNb2RlbGljYTogeyB2YWx1ZTogMCwgdG9vbFRpcDogJ01vZGVsaWNhJywgaWNvbkNsYXNzOiAnZmEgZmEtZ2VhcnMnIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGtleTtcclxuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGRvbWFpbk1vZGVscykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkb21haW5Nb2RlbHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWxNYXBbZG9tYWluTW9kZWxzW2tleV0udHlwZV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsTWFwW2RvbWFpbk1vZGVsc1trZXldLnR5cGVdLnZhbHVlICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmV4cGVjdGVkIGRvbWFpbi1tb2RlbCB0eXBlJywgZG9tYWluTW9kZWxzW2tleV0udHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBsYWJlbE1hcCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbE1hcC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbE1hcFtrZXldLnZhbHVlID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHMucHVzaChsYWJlbE1hcFtrZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0cztcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnREb21haW5zKGNvbnRleHQsIGNvbXBvbmVudElkLCBmdW5jdGlvbiAodXBkYXRlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpc3RJdGVtID0gY29tcG9uZW50SXRlbXNbY29tcG9uZW50SWRdO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0RvbWFpbk1vZGVscyB1cGRhdGVkLCBldmVudCB0eXBlOicsIHVwZGF0ZURhdGEudHlwZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobGlzdEl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0cyA9IGRvbWFpbk1vZGVsc1RvU3RhdCh1cGRhdGVEYXRhLmRvbWFpbk1vZGVscyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRG9tYWluTW9kZWwgZGF0YSBkaWQgbm90IGhhdmUgbWF0Y2hpbmcgY29tcG9uZW50RGF0YScsIGNvbXBvbmVudElkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpc3RJdGVtID0gY29tcG9uZW50SXRlbXNbY29tcG9uZW50SWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsaXN0SXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0cyA9IGRvbWFpbk1vZGVsc1RvU3RhdChkYXRhLmRvbWFpbk1vZGVscyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdEb21haW5Nb2RlbCBkYXRhIGRpZCBub3QgaGF2ZSBtYXRjaGluZyBjb21wb25lbnREYXRhJywgY29tcG9uZW50SWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbXBvbmVudFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgJHNjb3BlLmxpc3REYXRhLml0ZW1zID0gaXRlbXM7XHJcbiAgICAgICAgICAgIGNvbXBvbmVudEl0ZW1zID0ge307XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xyXG5cclxuICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudHMoY29udGV4dCwgJHNjb3BlLndvcmtzcGFjZUlkLCAkc2NvcGUuYXZtSWRzLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXg7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUud2Fybih1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRkRG9tYWluV2F0Y2hlcih1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndW5sb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnRJdGVtcy5oYXNPd25Qcm9wZXJ0eSh1cGRhdGVPYmplY3QuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaXRlbXMubWFwKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuaW5kZXhPZih1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hDb21wb25lbnREb21haW5zXycgKyB1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgY29tcG9uZW50SXRlbXNbdXBkYXRlT2JqZWN0LmlkXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8kc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50SWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb21wb25lbnRJZCBpbiBkYXRhLmNvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuY29tcG9uZW50cy5oYXNPd25Qcm9wZXJ0eShjb21wb25lbnRJZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKGRhdGEuY29tcG9uZW50c1tjb21wb25lbnRJZF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRG9tYWluV2F0Y2hlcihjb21wb25lbnRJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pXHJcbiAgICAuY29udHJvbGxlcignQ29tcG9uZW50RWRpdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgZGF0YSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb25cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUub2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCRzY29wZS5kYXRhKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcclxuICAgICAgICB9O1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2NvbXBvbmVudExpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJZDogJz13b3Jrc3BhY2VJZCcsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJyxcclxuICAgICAgICAgICAgICAgIGF2bUlkczogJz1hdm1JZHMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0NvbXBvbmVudExpc3QuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb21wb25lbnRMaXN0Q29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignQ29uZmlndXJhdGlvblNldFNlbGVjdG9yQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIGdyb3dsLCBkZXNpZ25TZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBjb250ZXh0LFxyXG4gICAgICAgICAgICBzcGF3bmVkQ29uZmlndXJhdGlvblJlZ2lvbnMgPSBbXTtcclxuICAgICAgICAkc2NvcGUuZGF0YU1vZGVsID0ge1xyXG4gICAgICAgICAgICBkYXRhQXZhbGlhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgY29uZmlndXJhdGlvblNldHM6IHt9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0NvbmZpZ3VyYXRpb25TZXRTZWxlY3RvckNvbnRyb2xsZXJfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyRkZXN0cm95ZWQgJyArIGNvbnRleHQucmVnaW9uSWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRlc2lnblNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbC5kYXRhQXZhbGlhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWwuY29uZmlndXJhdGlvblNldHMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignZGVzdHJveSBldmVudCByYWlzZWQnKTtcclxuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGRpc3BsYXkgdGhpcyB0byB0aGUgdXNlci5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaENvbmZpZ3VyYXRpb25TZXRzKGNvbnRleHQsICRzY29wZS5kZXNpZ25JZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbC5kYXRhQXZhbGlhYmxlID0gT2JqZWN0LmtleXModXBkYXRlT2JqZWN0LmRhdGEuY29uZmlndXJhdGlvblNldHMpLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWwuY29uZmlndXJhdGlvblNldHMgPSBkYXRhLmNvbmZpZ3VyYXRpb25TZXRzO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWwuZGF0YUF2YWxpYWJsZSA9IE9iamVjdC5rZXlzKGRhdGEuY29uZmlndXJhdGlvblNldHMpLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmxvYWRDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uIChzZXRJZCwgc2V0TmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBzcGF3bmVkQ29uZmlndXJhdGlvblJlZ2lvbnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBzcGF3bmVkQ29uZmlndXJhdGlvblJlZ2lvbnNbaV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNwYXduZWRDb25maWd1cmF0aW9uUmVnaW9ucyA9IFtdO1xyXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoQ29uZmlndXJhdGlvbnMoY29udGV4dCwgc2V0SWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybih1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgc3Bhd25lZENvbmZpZ3VyYXRpb25SZWdpb25zLnB1c2goZGF0YS5yZWdpb25JZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gZGF0YS5jb25maWd1cmF0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb25maWd1cmF0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcgPSBkYXRhLmNvbmZpZ3VyYXRpb25zW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY29uZmlnLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb25maWcubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogSlNPTi5wYXJzZShjb25maWcuYWx0ZXJuYXRpdmVBc3NpZ25tZW50cylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoJ0NvbmZpZ3VyYXRpb24gJyArIGNvbmZpZy5uYW1lICsgJyBoYWQgaW52YWxpZCBhdHRyaWJ1dGUuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IHBhcnNlJywgY29uZmlnLmFsdGVybmF0aXZlQXNzaWdubWVudHMsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGVtaXQoJ2NvbmZpZ3VyYXRpb25zTG9hZGVkJywge2NvbmZpZ3VyYXRpb25zOiBjb25maWd1cmF0aW9ucywgc2V0TmFtZTogc2V0TmFtZX0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCdjb25maWd1cmF0aW9uU2V0U2VsZWN0b3InLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBkZXNpZ25JZDogJz1kZXNpZ25JZCcsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Db25maWd1cmF0aW9uU2V0U2VsZWN0b3IuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb25maWd1cmF0aW9uU2V0U2VsZWN0b3JDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdDb25maWd1cmF0aW9uVGFibGVDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgZ3Jvd2wpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgJHNjb3BlLmRhdGFNb2RlbCA9IHtcclxuICAgICAgICAgICAgY2hhbmdlSW5mbzogW10sXHJcbiAgICAgICAgICAgIHNlbGVjdGVkOiBbXSxcclxuICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6ICRzY29wZS5jb25maWd1cmF0aW9ucyxcclxuICAgICAgICAgICAgc2V0TmFtZTogJHNjb3BlLnNldE5hbWVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUudGFibGVDb2x1bW5EZWZpbml0aW9uID0gW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb2x1bW5IZWFkZXJEaXNwbGF5TmFtZTogJ05hbWUnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0YWJsZUNlbGwuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBzb3J0S2V5OiAnbmFtZSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ2V4cG9zZVNlbGVjdGlvbicsIGZ1bmN0aW9uIChldmVudCwgdHlwZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuJGVtaXQoJ3NlbGVjdGlvbkV4cG9zZWQnLCAkc2NvcGUuZGF0YU1vZGVsLnNlbGVjdGVkLCB0eXBlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNmZ0NsaWNrZWQgPSBmdW5jdGlvbiAoY2ZnKSB7XHJcbiAgICAgICAgICAgICRzY29wZS4kZW1pdCgnY29uZmlndXJhdGlvbkNsaWNrZWQnLCBjZmcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgnY29uZmlndXJhdGlvblRhYmxlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6ICc9Y29uZmlndXJhdGlvbnMnLFxyXG4gICAgICAgICAgICAgICAgc2V0TmFtZTogJz1zZXROYW1lJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Db25maWd1cmF0aW9uVGFibGUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb25maWd1cmF0aW9uVGFibGVDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnbkRldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgZGVzaWduU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgY29udGV4dCA9IHt9LFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0ge30sXHJcbiAgICAgICAgICAgIGNvbm5lY3RvcnMgPSB7fSxcclxuICAgICAgICAgICAgcG9ydHMgPSB7fTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Rlc2lnbkRldGFpbHNDb250cm9sbGVyJyk7XHJcbiAgICAgICAgJHNjb3BlLmluaXQgPSBmdW5jdGlvbiAoY29ubmVjdGlvbklkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdEZXNpZ25EZXRhaWxzXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEZXN0cm95aW5nIDonLCBjb250ZXh0LnJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiBjb25uZWN0b3JzLFxyXG4gICAgICAgICAgICAgICAgcG9ydHM6IHBvcnRzXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdG9yczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgcG9ydHM6IHt9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGRlc3Ryb3kpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1RPRE86IG5vdGlmeSB1c2VyXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdEZXNpZ25EZXRhaWxzQ29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaEludGVyZmFjZXMoY29udGV4dCwgJHNjb3BlLmRlc2lnbklkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2luY2Ugd2F0Y2hJbnRlcmZhY2VzIGtlZXBzIHRoZSBkYXRhIHVwLXRvLWRhdGUgdGhlcmUgc2hvdWxkbid0IGJlIGEgbmVlZCB0byBkbyBhbnlcclxuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGVzIGhlcmUuLlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaEludGVyZmFjZXMnLCB1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGVzaWduSW50ZXJmYWNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wcm9wZXJ0aWVzID0gZGVzaWduSW50ZXJmYWNlcy5wcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5jb25uZWN0b3JzID0gZGVzaWduSW50ZXJmYWNlcy5jb25uZWN0b3JzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wb3J0cyA9IGRlc2lnbkludGVyZmFjZXMucG9ydHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgnZGVzaWduRGV0YWlscycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIGRlc2lnbklkOiAnPWRlc2lnbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXF1aXJlOiAnXmRlc2lnbkxpc3QnLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIsIGRlc2lnbkxpc3RDb250cm9sbGVyKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdGlvbklkID0gZGVzaWduTGlzdENvbnRyb2xsZXIuZ2V0Q29ubmVjdGlvbklkKCk7XHJcbiAgICAgICAgICAgICAgICBzY29wZS5pbml0KGNvbm5lY3Rpb25JZCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0ludGVyZmFjZURldGFpbHMuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEZXNpZ25EZXRhaWxzQ29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnbkxpc3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHdpbmRvdywgJGxvY2F0aW9uLCAkbW9kYWwsIGRlc2lnblNlcnZpY2UsIGdyb3dsKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgaXRlbXMgPSBbXSwgICAgICAgICAgICAgLy8gSXRlbXMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZSBpdGVtLWxpc3QgdWktY29tcG9uZW50LlxyXG4gICAgICAgICAgICBkZXNpZ25JdGVtcyA9IHt9LCAgICAgICAvLyBTYW1lIGl0ZW1zIGFyZSBzdG9yZWQgaW4gYSBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSxcclxuICAgICAgICAgICAgY29uZmlnLFxyXG4gICAgICAgICAgICBhZGRDb25maWd1cmF0aW9uV2F0Y2hlcixcclxuICAgICAgICAgICAgY29udGV4dCxcclxuICAgICAgICAgICAgaXRlbUNsaWNrRm4sXHJcbiAgICAgICAgICAgIGl0ZW1DbGlja1RpcDtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Rlc2lnbkxpc3RDb250cm9sbGVyJyk7XHJcbiAgICAgICAgdGhpcy5nZXRDb25uZWN0aW9uSWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUuY29ubmVjdGlvbklkO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbm5lY3Rpb25JZCBhbmQgcmVnaXN0ZXIgY2xlYW4tdXAgb24gZGVzdHJveSBldmVudC5cclxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnRGVzaWduTGlzdENvbnRyb2xsZXJfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy8gQ29uZmlndXJhdGlvbiBmb3IgdGhlIGl0ZW0gbGlzdCB1aSBjb21wb25lbnQuXHJcbiAgICAgICAgY29uZmlnID0ge1xyXG5cclxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBzaG93RGV0YWlsc0xhYmVsOiAnU2hvdyBkZXRhaWxzJyxcclxuICAgICAgICAgICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXHJcblxyXG4gICAgICAgICAgICAvLyBFdmVudCBoYW5kbGVyc1xyXG5cclxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uIChqUUV2ZW50LCB1aSkge1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnU29ydCBoYXBwZW5lZCcsIGpRRXZlbnQsIHVpKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VXJsID0gJy9kZXNpZ25TcGFjZS8nICsgJHNjb3BlLndvcmtzcGFjZUlkLnJlcGxhY2UoL1xcLy9nLCAnLScpICsgJy8nICsgaXRlbS5pZC5yZXBsYWNlKC9cXC8vZywgJy0nKTtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKG5ld1VybCk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ29udGV4dG1lbnVSZW5kZXJlcjogZnVuY3Rpb24gKGUsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcvP3Byb2plY3Q9QURNRWRpdG9yJmFjdGl2ZU9iamVjdD0nICsgaXRlbS5pZCwgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdlZGl0RGVzaWduJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VkaXQgQXR0cmlidXRlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogaXRlbS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGI6IGNvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hEZXNpZ25zJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGRlc2lnblNlcnZpY2UuZWRpdERlc2lnbkZuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnc2V0QXNUb3BMZXZlbFN5c3RlbVVuZGVyVGVzdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTZXQgYXMgVExTVVQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiAhJHNjb3BlLnVzZWRCeVRlc3RCZW5jaCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1hcnJvdy1jaXJjbGUtcmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtpZDogaXRlbS5pZCwgbmFtZTogaXRlbS50aXRsZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2xkVGxzdXQgPSBkZXNpZ25JdGVtc1skc2NvcGUuc3RhdGUudGxzdXRJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zdGF0ZS50bHN1dElkID0gZGF0YS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdFNldCcsIGl0ZW0sIG9sZFRsc3V0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhwb3J0QXNBZG0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhwb3J0IEFETScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2hhcmUtYWx0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGRlc2lnblNlcnZpY2UuZXhwb3J0QXNBZG1GblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZGVzaWduU2VydmljZS5kZWxldGVGblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGRldGFpbHNSZW5kZXJlcjogZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGl0ZW0uZGV0YWlscyA9ICdNeSBkZXRhaWxzIGFyZSBoZXJlIG5vdyEnO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZmlsdGVyOiB7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5zdGF0ZSA9IHtcclxuICAgICAgICAgICAgdGxzdXRJZDogbnVsbFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS4kb24oJ3RvcExldmVsU3lzdGVtVW5kZXJUZXN0Q2hhbmdlZCcsIGZ1bmN0aW9uIChldmVudCwgaWQpIHtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5zdGF0ZS50bHN1dElkICYmIGRlc2lnbkl0ZW1zLmhhc093blByb3BlcnR5KCRzY29wZS5zdGF0ZS50bHN1dElkKSkge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduSXRlbXNbJHNjb3BlLnN0YXRlLnRsc3V0SWRdLmNzc0NsYXNzID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJHNjb3BlLnN0YXRlLnRsc3V0SWQgPSBpZDtcclxuICAgICAgICAgICAgaWYgKGRlc2lnbkl0ZW1zLmhhc093blByb3BlcnR5KGlkKSkge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduSXRlbXNbaWRdLmNzc0NsYXNzID0gJ3RvcC1sZXZlbC1zeXN0ZW0tdW5kZXItdGVzdCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIHRoZSByYXcgc2VydmljZSBub2RlIGRhdGEgdG8gaXRlbXMgZm9yIHRoZSBsaXN0LlxyXG4gICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGxpc3RJdGVtO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc2lnbkl0ZW1zLmhhc093blByb3BlcnR5KGRhdGEuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IGRlc2lnbkl0ZW1zW2RhdGEuaWRdO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0udGl0bGUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kZXNjcmlwdGlvbiA9IGRhdGEuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogZGF0YS5pZCxcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdPcGVuIERlc2lnbiBTcGFjZSBWaWV3JyxcclxuICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJHNjb3BlLnN0YXRlLnRsc3V0SWQgPT09IGRhdGEuaWQgPyAndG9wLWxldmVsLXN5c3RlbS11bmRlci10ZXN0JyA6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVcGRhdGVkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6ICdOL0EnLCAgIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnICAgIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdDb25maWd1cmF0aW9uIFNldHMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi10aC1sYXJnZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnQ29uZmlndXJhdGlvbnMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi10aCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnUmVzdWx0cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXN0YXRzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzICAgIDogJ0NvbnRlbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHNUZW1wbGF0ZVVybDogJ2Rlc2lnbkRldGFpbHMuaHRtbCdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGxpc3QtaXRlbSB0byB0aGUgaXRlbXMgbGlzdCBhbmQgdGhlIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGxpc3RJdGVtKTtcclxuICAgICAgICAgICAgICAgIGRlc2lnbkl0ZW1zW2xpc3RJdGVtLmlkXSA9IGxpc3RJdGVtO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYWRkQ29uZmlndXJhdGlvbldhdGNoZXIgPSBmdW5jdGlvbiAoZGVzaWduSWQpIHtcclxuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaE5ick9mQ29uZmlndXJhdGlvbnMoY29udGV4dCwgZGVzaWduSWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsaXN0SXRlbSA9IGRlc2lnbkl0ZW1zW2Rlc2lnbklkXTtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2codXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzWzBdLnZhbHVlID0gdXBkYXRlT2JqZWN0LmRhdGEuY291bnRlcnMuc2V0cztcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzWzFdLnZhbHVlID0gdXBkYXRlT2JqZWN0LmRhdGEuY291bnRlcnMuY29uZmlndXJhdGlvbnM7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0c1syXS52YWx1ZSA9IHVwZGF0ZU9iamVjdC5kYXRhLmNvdW50ZXJzLnJlc3VsdHM7XHJcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsaXN0SXRlbSA9IGRlc2lnbkl0ZW1zW2Rlc2lnbklkXTtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzWzBdLnZhbHVlID0gZGF0YS5jb3VudGVycy5zZXRzO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHNbMV0udmFsdWUgPSBkYXRhLmNvdW50ZXJzLmNvbmZpZ3VyYXRpb25zO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHNbMl0udmFsdWUgPSBkYXRhLmNvdW50ZXJzLnJlc3VsdHM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRlc2lnblNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgJHNjb3BlLmxpc3REYXRhLml0ZW1zID0gaXRlbXM7XHJcbiAgICAgICAgICAgIGRlc2lnbkl0ZW1zID0ge307XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xyXG5cclxuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaERlc2lnbnMoY29udGV4dCwgJHNjb3BlLndvcmtzcGFjZUlkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXg7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUud2Fybih1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRkQ29uZmlndXJhdGlvbldhdGNoZXIodXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVzaWduSXRlbXMuaGFzT3duUHJvcGVydHkodXBkYXRlT2JqZWN0LmlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9IGl0ZW1zLm1hcChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmluZGV4T2YodXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwUmVnaW9uKGNvbnRleHQsIGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTmJyT2ZDb25maWd1cmF0aW9uc18nICsgdXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRlc2lnbkl0ZW1zW3VwZGF0ZU9iamVjdC5pZF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlc2lnbklkO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoZGVzaWduSWQgaW4gZGF0YS5kZXNpZ25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmRlc2lnbnMuaGFzT3duUHJvcGVydHkoZGVzaWduSWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbShkYXRhLmRlc2lnbnNbZGVzaWduSWRdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZENvbmZpZ3VyYXRpb25XYXRjaGVyKGRlc2lnbklkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5jb250cm9sbGVyKCdEZXNpZ25FZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCBkYXRhKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgICRzY29wZS5kYXRhID0ge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgbmFtZTogZGF0YS5uYW1lXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLm9rID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgkc2NvcGUuZGF0YSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCdkZXNpZ25MaXN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSWQ6ICc9d29ya3NwYWNlSWQnLFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCcsXHJcbiAgICAgICAgICAgICAgICB1c2VkQnlUZXN0QmVuY2g6ICc9dXNlZEJ5VGVzdEJlbmNoJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9EZXNpZ25MaXN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRGVzaWduTGlzdENvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnblRyZWVDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHdpbmRvdywgZGVzaWduU2VydmljZSwgZGVzZXJ0U2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgY29udGV4dCxcclxuICAgICAgICAgICAgY29uZmlnLFxyXG4gICAgICAgICAgICB0cmVlRGF0YSxcclxuICAgICAgICAgICAgcm9vdE5vZGUsXHJcbiAgICAgICAgICAgIGF2bUlkcyA9IHt9LFxyXG4gICAgICAgICAgICBidWlsZFRyZWVTdHJ1Y3R1cmU7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdEZXNpZ25UcmVlQ29udHJvbGxlcicpO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBmb3IgdmFsaWQgY29ubmVjdGlvbklkIGFuZCByZWdpc3RlciBjbGVhbi11cCBvbiBkZXN0cm95IGV2ZW50LlxyXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdEZXNpZ25UcmVlQ29udHJvbGxlcl8nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgbm9kZUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBub2RlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3tcclxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjcmVhdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7aWQ6IG5vZGUuaWR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD1BRE1FZGl0b3ImYWN0aXZlT2JqZWN0PScgKyBkYXRhLmlkLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgfV07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG5vZGVDbGljazogZnVuY3Rpb24gKCBlLCBub2RlICkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdOb2RlIHdhcyBjbGlja2VkOicsIG5vZGUsICRzY29wZSApO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkaXNhYmxlTWFudWFsU2VsZWN0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgICBmb2xkZXJJY29uQ2xhc3M6ICdmYSBmYS1jdWJlcydcclxuLy8gICAgICAgICAgICBub2RlRGJsY2xpY2s6IGZ1bmN0aW9uICggZSwgbm9kZSApIHtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdOb2RlIHdhcyBkb3VibGUtY2xpY2tlZDonLCBub2RlICk7XHJcbi8vICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICBub2RlRXhwYW5kZXJDbGljazogZnVuY3Rpb24gKCBlLCBub2RlLCBpc0V4cGFuZCApIHtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdFeHBhbmRlciB3YXMgY2xpY2tlZCBmb3Igbm9kZTonLCBub2RlLCBpc0V4cGFuZCApO1xyXG4vLyAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcm9vdE5vZGUgPSB7XHJcbiAgICAgICAgICAgIGlkOiAkc2NvcGUuZGVzaWduSWQsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnTG9hZGluZyBEZXNpZ24gU3BhY2UgTm9kZXMuLicsXHJcbiAgICAgICAgICAgIGV4dHJhSW5mbzogJycsXHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgICAgICAgY2hpbGRyZW5Db3VudDogMFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyZWVEYXRhID0ge1xyXG4gICAgICAgICAgICBpZDogJycsXHJcbiAgICAgICAgICAgIGxhYmVsOiAnJyxcclxuICAgICAgICAgICAgZXh0cmFJbmZvOiAnJyxcclxuICAgICAgICAgICAgdW5Db2xsYXBzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgICAgIHJvb3ROb2RlXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIGNoaWxkcmVuQ291bnQ6IDFcclxuICAgICAgICB9O1xyXG4gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgJHNjb3BlLnRyZWVEYXRhID0gdHJlZURhdGE7XHJcbiAgICAgICAgJHNjb3BlLiRvbignc2V0U2VsZWN0ZWROb2RlcycsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuY29uZmlnLnN0YXRlLnNlbGVjdGVkTm9kZXMgPSBkYXRhO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBidWlsZFRyZWVTdHJ1Y3R1cmUgPSBmdW5jdGlvbiAoY29udGFpbmVyLCBwYXJlbnRUcmVlTm9kZSkge1xyXG4gICAgICAgICAgICB2YXIga2V5LFxyXG4gICAgICAgICAgICAgICAgY2hpbGREYXRhLFxyXG4gICAgICAgICAgICAgICAgdHJlZU5vZGU7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnRUcmVlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgdHJlZU5vZGUgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFJbmZvOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbkNvdW50OiAwXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcGFyZW50VHJlZU5vZGUuY2hpbGRyZW4ucHVzaCh0cmVlTm9kZSk7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRUcmVlTm9kZS5jaGlsZHJlbkNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0cmVlTm9kZSA9IHJvb3ROb2RlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyZWVOb2RlLmlkID0gY29udGFpbmVyLmlkO1xyXG4gICAgICAgICAgICB0cmVlTm9kZS5sYWJlbCA9IGNvbnRhaW5lci5uYW1lO1xyXG4gICAgICAgICAgICB0cmVlTm9kZS5leHRyYUluZm8gPSBjb250YWluZXIudHlwZTtcclxuICAgICAgICAgICAgJHNjb3BlLmNvbmZpZy5zdGF0ZS5leHBhbmRlZE5vZGVzLnB1c2godHJlZU5vZGUuaWQpO1xyXG4gICAgICAgICAgICBmb3IgKGtleSBpbiBjb250YWluZXIuY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5jb21wb25lbnRzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERhdGEgPSBjb250YWluZXIuY29tcG9uZW50c1trZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyZWVOb2RlLmNoaWxkcmVuLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGREYXRhLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogY2hpbGREYXRhLm5hbWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB0cmVlTm9kZS5jaGlsZHJlbkNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF2bUlkc1tjaGlsZERhdGEuYXZtSWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2bUlkc1tjaGlsZERhdGEuYXZtSWRdLnB1c2goY2hpbGREYXRhLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdm1JZHNbY2hpbGREYXRhLmF2bUlkXSA9IFtjaGlsZERhdGEuaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGtleSBpbiBjb250YWluZXIuc3ViQ29udGFpbmVycykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5zdWJDb250YWluZXJzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERhdGEgPSBjb250YWluZXIuc3ViQ29udGFpbmVyc1trZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkVHJlZVN0cnVjdHVyZShjaGlsZERhdGEsIHRyZWVOb2RlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRlc2lnblNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hEZXNpZ25TdHJ1Y3R1cmUoY29udGV4dCwgJHNjb3BlLmRlc2lnbklkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4odXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvb3RDb250YWluZXIgPSBkYXRhLmNvbnRhaW5lcnNbZGF0YS5yb290SWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNlcnRJbnB1dERhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRUcmVlU3RydWN0dXJlKHJvb3RDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kZW1pdCgnZGVzaWduVHJlZUxvYWRlZCcsIGF2bUlkcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRklYTUU6IFRoaXMgcGFydCBpcyBvbmx5IGhlcmUgdG8gcmV1c2UgdGhlIGRhdGEgZnJvbSB3YXRjaERlc2lnblN0cnVjdHVyZS5cclxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBGaW5kIGEgbW9yZSBzdWl0YWJsZSBsb2NhdGlvbi5cclxuICAgICAgICAgICAgICAgICAgICBkZXNlcnRJbnB1dERhdGEgPSBkZXNlcnRTZXJ2aWNlLmdldERlc2VydElucHV0RGF0YShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGVtaXQoJ2Rlc2VydElucHV0UmVhZHknLCBkZXNlcnRJbnB1dERhdGEpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgnZGVzaWduVHJlZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIGRlc2lnbklkOiAnPWRlc2lnbklkJyxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25JZDogJz1jb25uZWN0aW9uSWQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0Rlc2lnblRyZWUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEZXNpZ25UcmVlQ29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiIsIi8qZ2xvYmFscyBhbmd1bGFyKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdTaW1wbGVNb2RhbENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgZGF0YSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcclxuICAgICAgICAgICAgdGl0bGU6IGRhdGEudGl0bGUsXHJcbiAgICAgICAgICAgIGRldGFpbHM6IGRhdGEuZGV0YWlsc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdUZXN0QmVuY2hEZXRhaWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIHRlc3RCZW5jaFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIGNvbnRleHQgPSB7fSxcclxuICAgICAgICAgICAgcHJvcGVydGllcyA9IHt9LFxyXG4gICAgICAgICAgICBjb25uZWN0b3JzID0ge30sXHJcbiAgICAgICAgICAgIHBvcnRzID0ge30sXHJcbiAgICAgICAgICAgIHdhdGNoSW50ZXJmYWNlcztcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1Rlc3RCZW5jaERldGFpbHNDb250cm9sbGVyJyk7XHJcbiAgICAgICAgJHNjb3BlLmluaXQgPSBmdW5jdGlvbiAoY29ubmVjdGlvbklkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdUZXN0QmVuY2hEZXRhaWxzXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEZXN0cm95aW5nIDonLCBjb250ZXh0LnJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiBjb25uZWN0b3JzLFxyXG4gICAgICAgICAgICAgICAgcG9ydHM6IHBvcnRzXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdhdGNoSW50ZXJmYWNlcyA9IGZ1bmN0aW9uIChjb250YWluZXJJZCkge1xyXG4gICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS53YXRjaEludGVyZmFjZXMoY29udGV4dCwgY29udGFpbmVySWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSB3YXRjaEludGVyZmFjZXMga2VlcHMgdGhlIGRhdGEgdXAtdG8tZGF0ZSB0aGVyZSBzaG91bGRuJ3QgYmUgYSBuZWVkIHRvIGRvIGFueVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZXMgaGVyZS4uXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoSW50ZXJmYWNlcycsIHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjb250YWluZXJJbnRlcmZhY2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLnByb3BlcnRpZXMgPSBjb250YWluZXJJbnRlcmZhY2VzLnByb3BlcnRpZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLmNvbm5lY3RvcnMgPSBjb250YWluZXJJbnRlcmZhY2VzLmNvbm5lY3RvcnM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLnBvcnRzID0gY29udGFpbmVySW50ZXJmYWNlcy5wb3J0cztcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95KSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICBwb3J0czoge31cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVzdHJveSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vVE9ETzogbm90aWZ5IHVzZXJcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ1Rlc3RCZW5jaERldGFpbHNDb250cm9sbGVyIC0gaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uud2F0Y2hUZXN0QmVuY2hEZXRhaWxzKGNvbnRleHQsICRzY29wZS50ZXN0QmVuY2hJZCwgZnVuY3Rpb24gKHVwZGF0ZWRPYmopIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3dhdGNoVGVzdEJlbmNoRGV0YWlscyB1cGRhdGVzJywgdXBkYXRlZE9iaik7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbnRhaW5lcklkcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gY29udGFpbmVyIGRlZmluZWQhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS5jb250YWluZXJJZHMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEludGVyZmFjZXMoZGF0YS5jb250YWluZXJJZHNbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignTW9yZSB0aGFuIG9uZSBjb250YWluZXIgZGVmaW5lZCEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ3Rlc3RCZW5jaERldGFpbHMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICB0ZXN0QmVuY2hJZDogJz10ZXN0QmVuY2hJZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVxdWlyZTogJ150ZXN0QmVuY2hMaXN0JyxcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyLCB0ZXN0QmVuY2hMaXN0Q29udHJvbGxlcikge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbm5lY3Rpb25JZCA9IHRlc3RCZW5jaExpc3RDb250cm9sbGVyLmdldENvbm5lY3Rpb25JZCgpO1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuaW5pdChjb25uZWN0aW9uSWQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9JbnRlcmZhY2VEZXRhaWxzLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnVGVzdEJlbmNoRGV0YWlsc0NvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdUZXN0QmVuY2hMaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICR3aW5kb3csICRsb2NhdGlvbiwgJG1vZGFsLCBncm93bCwgdGVzdEJlbmNoU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGl0ZW1zID0gW10sICAgICAgICAgICAgIC8vIEl0ZW1zIHRoYXQgYXJlIHBhc3NlZCB0byB0aGUgaXRlbS1saXN0IHVpLWNvbXBvbmVudC5cclxuICAgICAgICAgICAgdGVzdEJlbmNoSXRlbXMgPSB7fSwgICAgLy8gU2FtZSBpdGVtcyBhcmUgc3RvcmVkIGluIGEgZGljdGlvbmFyeS5cclxuICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0sXHJcbiAgICAgICAgICAgIGNvbmZpZyxcclxuICAgICAgICAgICAgY29udGV4dDtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1Rlc3RCZW5jaExpc3RDb250cm9sbGVyJyk7XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0Q29ubmVjdGlvbklkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLmNvbm5lY3Rpb25JZDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBDaGVjayBmb3IgdmFsaWQgY29ubmVjdGlvbklkIGFuZCByZWdpc3RlciBjbGVhbi11cCBvbiBkZXN0cm95IGV2ZW50LlxyXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdUZXN0QmVuY2hMaXN0Q29udHJvbGxlcl8nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBpdGVtIGxpc3QgdWkgY29tcG9uZW50LlxyXG4gICAgICAgIGNvbmZpZyA9IHtcclxuXHJcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2Vjb25kYXJ5SXRlbU1lbnU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbHNDb2xsYXBzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXHJcbiAgICAgICAgICAgIGhpZGVEZXRhaWxzTGFiZWw6ICdIaWRlIGRldGFpbHMnLFxyXG5cclxuICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Tb3J0OiBmdW5jdGlvbiAoalFFdmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNsaWNrOiBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdVcmwgPSAnL3Rlc3RCZW5jaC8nICsgJHNjb3BlLndvcmtzcGFjZUlkLnJlcGxhY2UoL1xcLy9nLCAnLScpICsgJy8nICsgaXRlbS5pZC5yZXBsYWNlKC9cXC8vZywgJy0nKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld1VybCk7XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aChuZXdVcmwpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ29wZW5JbkVkaXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tZWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbignLz9wcm9qZWN0PUFETUVkaXRvciZhY3RpdmVPYmplY3Q9JyArIGl0ZW0uaWQsICdfYmxhbmsnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZWRpdFRlc3RCZW5jaCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBpdGVtLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogaXRlbS5kYXRhLmZpbGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBpdGVtLmRhdGEucGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdENvbnRleHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiOiBjb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoVGVzdEJlbmNoZXMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaDogaXRlbVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0ZXN0QmVuY2hTZXJ2aWNlLmVkaXRUZXN0QmVuY2hGblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGVzdEJlbmNoU2VydmljZS5kZWxldGVGblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGRldGFpbHNSZW5kZXJlcjogZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGl0ZW0uZGV0YWlscyA9ICdNeSBkZXRhaWxzIGFyZSBoZXJlIG5vdyEnO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZmlsdGVyOiB7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIFRyYW5zZm9ybSB0aGUgcmF3IHNlcnZpY2Ugbm9kZSBkYXRhIHRvIGl0ZW1zIGZvciB0aGUgbGlzdC5cclxuICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBsaXN0SXRlbTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0ZXN0QmVuY2hJdGVtcy5oYXNPd25Qcm9wZXJ0eShkYXRhLmlkKSkge1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSB0ZXN0QmVuY2hJdGVtc1tkYXRhLmlkXTtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnRpdGxlID0gZGF0YS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGVzY3JpcHRpb24gPSBkYXRhLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGF0YS5maWxlcyA9IGRhdGEuZmlsZXM7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kYXRhLnBhdGggPSBkYXRhLnBhdGg7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kYXRhLnJlc3VsdHMgPSBkYXRhLnJlc3VsdHM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogZGF0YS5pZCxcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdPcGVuIFRlc3QtQmVuY2ggVmlldycsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTogJ04vQScsICAgLy8gVE9ETzogZ2V0IHRoaXMgaW4gdGhlIGZ1dHVyZS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogJ04vQScgICAgLy8gVE9ETzogZ2V0IHRoaXMgaW4gdGhlIGZ1dHVyZS5cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzOiBbIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlscyAgICA6ICdDb250ZW50JyxcclxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzVGVtcGxhdGVVcmw6ICd0ZXN0QmVuY2hEZXRhaWxzLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IGRhdGEuZmlsZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGRhdGEucGF0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogZGF0YS5yZXN1bHRzXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgbGlzdC1pdGVtIHRvIHRoZSBpdGVtcyBsaXN0IGFuZCB0aGUgZGljdGlvbmFyeS5cclxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2gobGlzdEl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgdGVzdEJlbmNoSXRlbXNbbGlzdEl0ZW0uaWRdID0gbGlzdEl0ZW07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICRzY29wZS5saXN0RGF0YS5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgICAgICAgICB0ZXN0QmVuY2hJdGVtcyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uud2F0Y2hUZXN0QmVuY2hlcyhjb250ZXh0LCAkc2NvcGUud29ya3NwYWNlSWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleDtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGVzdEJlbmNoSXRlbXMuaGFzT3duUHJvcGVydHkodXBkYXRlT2JqZWN0LmlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9IGl0ZW1zLm1hcChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmluZGV4T2YodXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRlc3RCZW5jaEl0ZW1zW3VwZGF0ZU9iamVjdC5pZF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlc3RCZW5jaElkO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodGVzdEJlbmNoSWQgaW4gZGF0YS50ZXN0QmVuY2hlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS50ZXN0QmVuY2hlcy5oYXNPd25Qcm9wZXJ0eSh0ZXN0QmVuY2hJZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKGRhdGEudGVzdEJlbmNoZXNbdGVzdEJlbmNoSWRdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5jb250cm9sbGVyKCdUZXN0QmVuY2hFZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCBncm93bCwgZGF0YSwgZmlsZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIGZpbGVJbmZvO1xyXG4gICAgICAgICRzY29wZS5kYXRhID0ge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgbmFtZTogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICBmaWxlSW5mbzoge1xyXG4gICAgICAgICAgICAgICAgaGFzaDogZGF0YS5maWxlcyxcclxuICAgICAgICAgICAgICAgIG5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGZpbGVTZXJ2aWNlLmdldERvd25sb2FkVXJsKGRhdGEuZmlsZXMpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBhdGg6IGRhdGEucGF0aFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgZmlsZUluZm8gPSAkc2NvcGUuZGF0YS5maWxlSW5mbztcclxuICAgICAgICBpZiAoZmlsZUluZm8uaGFzaCkge1xyXG4gICAgICAgICAgICBmaWxlU2VydmljZS5nZXRNZXRhZGF0YShmaWxlSW5mby5oYXNoKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG1ldGFkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8ubmFtZSA9IG1ldGFkYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgZ2V0IG1ldGEtZGF0YSBmb3IgaGFzaCcsIGZpbGVJbmZvLmhhc2gpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuZHJhZ092ZXJDbGFzcyA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIGRyYWdnZWRJdGVtcyA9ICRldmVudC5kYXRhVHJhbnNmZXIuaXRlbXMsXHJcbiAgICAgICAgICAgICAgICBoYXNGaWxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS53YXJuKGRyYWdnZWRJdGVtcyk7XHJcbiAgICAgICAgICAgIGhhc0ZpbGUgPSBkcmFnZ2VkSXRlbXMgJiYgZHJhZ2dlZEl0ZW1zLmxlbmd0aCA9PT0gMSAmJiBkcmFnZ2VkSXRlbXNbMF0ua2luZCA9PT0gJ2ZpbGUnO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGhhc0ZpbGUgPyBcImJnLXN1Y2Nlc3MgZHJhZ292ZXJcIiA6IFwiYmctZGFuZ2VyIGRyYWdvdmVyXCI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLm9uRHJvcHBlZEZpbGVzID0gZnVuY3Rpb24gKCRmaWxlcykge1xyXG4gICAgICAgICAgICBmaWxlU2VydmljZS5zYXZlRHJvcHBlZEZpbGVzKCRmaWxlcywge3ppcDogdHJ1ZX0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZkluZm9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZJbmZvcy5sZW5ndGggIT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoJ09uZSB6aXAgZmlsZSBtdXN0IGJlIGRyb3BwZWQhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8ubmFtZSA9IGZJbmZvc1swXS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlSW5mby51cmwgPSBmSW5mb3NbMF0ubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uaGFzaCA9IGZJbmZvc1swXS5oYXNoO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoJHNjb3BlLmRhdGEpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoJ2NhbmNlbCcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgndGVzdEJlbmNoTGlzdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUlkOiAnPXdvcmtzcGFjZUlkJyxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25JZDogJz1jb25uZWN0aW9uSWQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1Rlc3RCZW5jaExpc3QuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdUZXN0QmVuY2hMaXN0Q29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignV29ya2Vyc0xpc3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJGludGVydmFsLCBncm93bCwgZXhlY3V0b3JTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBpbnRlcnZhbFByb21pc2UgPSBudWxsLFxyXG4gICAgICAgICAgICBjb25zZWN1dGl2ZUVycm9ycyA9IDAsXHJcbiAgICAgICAgICAgIG1heENvbnNlY3V0aXZlRXJyb3JzID0gMzA7XHJcbiAgICAgICAgJHNjb3BlLmRhdGFNb2RlbCA9IHtcclxuICAgICAgICAgICAgd29ya2VyczogbnVsbFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnRlcnZhbFByb21pc2UgJiYgJGludGVydmFsLmNhbmNlbChpbnRlcnZhbFByb21pc2UpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnV29ya2VycyBpbnRlcnZhbCBjYW5jZWxsZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBjYW5jZWwgV29ya2Vyc0ludGVydmFsLicpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihpbnRlcnZhbFByb21pc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGludGVydmFsUHJvbWlzZSA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGV4ZWN1dG9yU2VydmljZS5nZXRXb3JrZXJzSW5mbygpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zZWN1dGl2ZUVycm9ycyA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbC53b3JrZXJzID0gcmVzcG9uY2U7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc2VjdXRpdmVFcnJvcnMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uc2VjdXRpdmVFcnJvcnMgPj0gbWF4Q29uc2VjdXRpdmVFcnJvcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChpbnRlcnZhbFByb21pc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcignV29ya2VycyBkaWQgbm90IHJlc3BvbmQgYWZ0ZXIgJyArIG1heENvbnNlY3V0aXZlRXJyb3JzICsgJyByZXF1ZXN0cy4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWxQcm9taXNlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9LCAxMDAwKTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCd3b3JrZXJzTGlzdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvV29ya2Vyc0xpc3QuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdXb3JrZXJzTGlzdENvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignV29ya3NwYWNlTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkd2luZG93LCAkbG9jYXRpb24sICRtb2RhbCwgZ3Jvd2wsIHdvcmtzcGFjZVNlcnZpY2UsIGZpbGVTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgaXRlbXMgPSBbXSxcclxuICAgICAgICAgICAgd29ya3NwYWNlSXRlbXMgPSB7fSxcclxuICAgICAgICAgICAgY29uZmlnLFxyXG4gICAgICAgICAgICBjb250ZXh0LFxyXG4gICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSxcclxuICAgICAgICAgICAgYWRkQ291bnRXYXRjaGVycztcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyJyk7XHJcblxyXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdXb3Jrc3BhY2VMaXN0Q29udHJvbGxlcl8nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZyA9IHtcclxuXHJcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2Vjb25kYXJ5SXRlbU1lbnU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbHNDb2xsYXBzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXHJcbiAgICAgICAgICAgIGhpZGVEZXRhaWxzTGFiZWw6ICdIaWRlIGRldGFpbHMnLFxyXG5cclxuICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Tb3J0OiBmdW5jdGlvbiAoalFFdmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNsaWNrOiBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvd29ya3NwYWNlRGV0YWlscy8nICsgaXRlbS5pZC5yZXBsYWNlKC9cXC8vZywgJy0nKSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ29udGV4dG1lbnVSZW5kZXJlcjogZnVuY3Rpb24gKGUsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcvP3Byb2plY3Q9QURNRWRpdG9yJmFjdGl2ZU9iamVjdD0nICsgaXRlbS5pZCwgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdlZGl0V29ya3NwYWNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VkaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGl0ZW0uZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRDb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiOiBjb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaFdvcmtzcGFjZXMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Xb3Jrc3BhY2VFZGl0Lmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdXb3Jrc3BhY2VFZGl0Q29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTogeyBkYXRhOiBmdW5jdGlvbiAoKSB7IHJldHVybiBkYXRhOyB9IH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoZWRpdGVkRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGF0dHJzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICduYW1lJzogZWRpdGVkRGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJTkZPJzogZWRpdGVkRGF0YS5kZXNjcmlwdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uuc2V0V29ya3NwYWNlQXR0cmlidXRlcyhlZGl0Q29udGV4dCwgZGF0YS5pZCwgYXR0cnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXR0cmlidXRlIHVwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhwb3J0QXNYTUUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhwb3J0IGFzIFhNRScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2hhcmUtYWx0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkLCBuYW1lOiBpdGVtLnRpdGxlIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmV4cG9ydFdvcmtzcGFjZShjb250ZXh0LCBkYXRhLmlkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRvd25sb2FkVXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcygnV29ya3NwYWNlIHBhY2thZ2UgZm9yIDxhIGhyZWY9XCInICsgZG93bmxvYWRVcmwgKyAnXCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubmFtZSArICc8L2E+IGV4cG9ydGVkLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdFeHBvcnQgZmFpbGVkLCBzZWUgY29uc29sZSBmb3IgZGV0YWlscy4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkLCBuYW1lOiBpdGVtLnRpdGxlIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1NpbXBsZU1vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NpbXBsZU1vZGFsQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUgV29ya3NwYWNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHM6ICdUaGlzIHdpbGwgZGVsZXRlICcgKyBkYXRhLm5hbWUgKyAnIGZyb20gdGhlIHByb2plY3QuJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuZGVsZXRlV29ya3NwYWNlKGNvbnRleHQsIGRhdGEuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBkZXRhaWxzUmVuZGVyZXI6IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBpdGVtLmRldGFpbHMgPSAnTXkgZGV0YWlscyBhcmUgaGVyZSBub3chJztcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG5ld0l0ZW1Gb3JtOiB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NyZWF0ZSBuZXcgd29ya3NwYWNlJyxcclxuICAgICAgICAgICAgICAgIGl0ZW1UZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Xb3Jrc3BhY2VOZXdJdGVtLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgZXhwYW5kZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5tb2RlbCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJvcHBlZEZpbGVzOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdPdmVyQ2xhc3MgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkcmFnZ2VkSXRlbXMgPSAkZXZlbnQuZGF0YVRyYW5zZmVyLml0ZW1zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0ZpbGUgPSBmYWxzZTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oZHJhZ2dlZEl0ZW1zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWRJdGVtcyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGRyYWdnZWRJdGVtcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkcmFnZ2VkSXRlbXNbaV0ua2luZCA9PT0gJ2ZpbGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0ZpbGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoYXNGaWxlID8gXCJiZy1zdWNjZXNzIGRyYWdvdmVyXCIgOiBcImJnLWRhbmdlciBkcmFnb3ZlclwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5vbkRyb3BwZWRGaWxlcyA9IGZ1bmN0aW9uICgkZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVNlcnZpY2Uuc2F2ZURyb3BwZWRGaWxlcygkZmlsZXMsIHt6aXA6IHRydWUsIGFkbTogdHJ1ZSwgYXRtOiB0cnVlfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChmSW5mb3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhmSW5mb3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBmSW5mb3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsLmRyb3BwZWRGaWxlcy5wdXNoKGZJbmZvc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNyZWF0ZUl0ZW0gPSBmdW5jdGlvbiAobmV3SXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3SXRlbUNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGI6IGNvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoV29ya3NwYWNlcydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbmV3SXRlbSB8fCAhbmV3SXRlbS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKCdQcm92aWRlIGEgbmFtZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuY3JlYXRlV29ya3NwYWNlKG5ld0l0ZW1Db250ZXh0LCBuZXdJdGVtLm5hbWUsIG5ld0l0ZW0uZGVzY3JpcHRpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZm9sZGVySWRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcyhuZXdJdGVtLm5hbWUgKyAnIGNyZWF0ZWQuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5tb2RlbC5kcm9wcGVkRmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5pbmZvKCdJbXBvcnRpbmcgZmlsZXMuLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmltcG9ydEZpbGVzKG5ld0l0ZW1Db250ZXh0LCBmb2xkZXJJZHMsICRzY29wZS5tb2RlbC5kcm9wcGVkRmlsZXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuaW5mbygnRmluaXNoZWQgaW1wb3J0aW5nIGZpbGVzIScsIHt0dGw6IDEwMH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoaW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsW2luZm8udHlwZV0oaW5mby5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluYWxseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLm5ld0l0ZW1Gb3JtLmV4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsLmRyb3BwZWRGaWxlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLm5ld0l0ZW1Gb3JtLmV4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tb2RlbC5kcm9wcGVkRmlsZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZmlsdGVyOiB7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xyXG4gICAgICAgICAgICBpdGVtczogaXRlbXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xyXG5cclxuICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VJdGVtO1xyXG5cclxuICAgICAgICAgICAgaWYgKHdvcmtzcGFjZUl0ZW1zLmhhc093blByb3BlcnR5KGRhdGEuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJdGVtID0gd29ya3NwYWNlSXRlbXNbZGF0YS5pZF07XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJdGVtLnRpdGxlID0gZGF0YS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbS5kZXNjcmlwdGlvbiA9IGRhdGEuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ09wZW4gV29ya3NwYWNlJyxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBuZXcgRGF0ZSgpLCAvLyBUT0RPOiBnZXQgdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiAnTi9BJyAvLyBUT0RPOiBnZXQgdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnQ29tcG9uZW50cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1wdXp6bGUtcGllY2UnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ0Rlc2lnbiBTcGFjZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtY3ViZXMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ1Rlc3QgYmVuY2hlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXNhdmVkJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdSZXF1aXJlbWVudHMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtYmFyLWNoYXJ0LW8nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUl0ZW0uaWRdID0gd29ya3NwYWNlSXRlbTtcclxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2god29ya3NwYWNlSXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBhZGRDb3VudFdhdGNoZXJzID0gZnVuY3Rpb24gKHdvcmtzcGFjZUlkKSB7XHJcbiAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hOdW1iZXJPZkNvbXBvbmVudHMoY29udGV4dCwgd29ya3NwYWNlSWQsIGZ1bmN0aW9uICh1cGRhdGVEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1swXS52YWx1ZSA9IHVwZGF0ZURhdGEuZGF0YTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZURhdGEgPSB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1swXS52YWx1ZSA9IGRhdGEuY291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hOdW1iZXJPZkRlc2lnbnMoY29udGV4dCwgd29ya3NwYWNlSWQsIGZ1bmN0aW9uICh1cGRhdGVEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1sxXS52YWx1ZSA9IHVwZGF0ZURhdGEuZGF0YTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZURhdGEgPSB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1sxXS52YWx1ZSA9IGRhdGEuY291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBmdW5jdGlvbiAodXBkYXRlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZURhdGEgPSB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJZF07XHJcbiAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMl0udmFsdWUgPSB1cGRhdGVEYXRhLmRhdGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMl0udmFsdWUgPSBkYXRhLmNvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHdvcmtzcGFjZVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSBhbGwgdmFyaWFibGVzXHJcbiAgICAgICAgICAgIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3b3Jrc3BhY2VJdGVtcyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnV29ya3NwYWNlTGlzdENvbnRyb2xsZXIgLSBpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoV29ya3NwYWNlcyhjb250ZXh0LCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXg7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRkQ291bnRXYXRjaGVycyh1cGRhdGVPYmplY3QuaWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZUl0ZW1zLmhhc093blByb3BlcnR5KHVwZGF0ZU9iamVjdC5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpdGVtcy5tYXAoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5pbmRleE9mKHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mQ29tcG9uZW50c18nICsgdXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5jbGVhblVwUmVnaW9uKGNvbnRleHQsIGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZEZXNpZ25zXycgKyB1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzXycgKyB1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgd29ya3NwYWNlSXRlbXNbdXBkYXRlT2JqZWN0LmlkXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodXBkYXRlT2JqZWN0KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VJZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh3b3Jrc3BhY2VJZCBpbiBkYXRhLndvcmtzcGFjZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEud29ya3NwYWNlcy5oYXNPd25Qcm9wZXJ0eSh3b3Jrc3BhY2VJZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKGRhdGEud29ya3NwYWNlc1t3b3Jrc3BhY2VJZF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkQ291bnRXYXRjaGVycyh3b3Jrc3BhY2VJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pXHJcbiAgICAuY29udHJvbGxlcignV29ya3NwYWNlRWRpdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgZGF0YSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgIG5hbWU6IGRhdGEubmFtZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoJHNjb3BlLmRhdGEpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoJ2NhbmNlbCcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgnd29ya3NwYWNlTGlzdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25JZDogJz1jb25uZWN0aW9uSWQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1dvcmtzcGFjZUxpc3QuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdXb3Jrc3BhY2VMaXN0Q29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cclxuXHJcbi8qKlxyXG4gKiBUaGlzIHNlcnZpY2UgY29udGFpbnMgZnVuY3Rpb25hbGl0eSBzaGFyZWQgYW1vbmdzdCB0aGUgZGlmZmVyZW50IHNlcnZpY2VzLiBJdCBzaG91bGQgbm90IGJlIHVzZWRcclxuICogZGlyZWN0bHkgaW4gYSBjb250cm9sbGVyIC0gb25seSBhcyBwYXJ0IG9mIG90aGVyIHNlcnZpY2VzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ2Jhc2VDeVBoeVNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsICR0aW1lb3V0LCBub2RlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVnaXN0ZXJzIGEgd2F0Y2hlciAoY29udHJvbGxlcikgdG8gdGhlIHNlcnZpY2UuIENhbGxiYWNrIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aGVuIG5vZGVzIGJlY29tZSBhdmFpbGFibGUgb3JcclxuICAgICAgICAgKiB3aGVuIHRoZXkgYmVjYW1lIHVuYXZhaWxhYmxlLiBUaGVzZSBhcmUgYWxzbyBjYWxsZWQgZGlyZWN0bHkgd2l0aCB0aGUgc3RhdGUgb2YgdGhlIG5vZGVTZXJ2aWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3YXRjaGVycyAtIFdhdGNoZXJzIGZyb20gdGhlIHNlcnZpY2UgdXRpbGl6aW5nIHRoaXMgZnVuY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQuZGIgLSBEYXRhYmFzZSBjb25uZWN0aW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIC0gQ2FsbGVkIHdpdGggdHJ1ZSB3aGVuIHRoZXJlIGFyZSBubyBub2RlcyB1bmF2YWlsYWJsZSBhbmQgZmFsc2Ugd2hlbiB0aGVyZSBhcmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoZXIgPSBmdW5jdGlvbiAod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGZuKSB7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLm9uKHBhcmVudENvbnRleHQuZGIsICdpbml0aWFsaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgYmUgZW5vdWdoLCB0aGUgcmVnaW9ucyB3aWxsIGJlIGNsZWFuZWQgdXAgaW4gbm9kZVNlcnZpY2UuXHJcbiAgICAgICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgZm4oZmFsc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2Uub24ocGFyZW50Q29udGV4dC5kYiwgJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBiZSBlbm91Z2gsIHRoZSByZWdpb25zIHNob3VsZCBiZSBjbGVhbmVkIHVwIGluIG5vZGVTZXJ2aWNlLlxyXG4gICAgICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm4odHJ1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgYWxsIHdhdGNoZXJzIHNwYXduZWQgZnJvbSBwYXJlbnRDb250ZXh0LCB0aGlzIHNob3VsZCB0eXBpY2FsbHkgYmUgaW52b2tlZCB3aGVuIHRoZSBjb250cm9sbGVyIGlzIGRlc3Ryb3llZC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd2F0Y2hlcnMgLSBXYXRjaGVycyBmcm9tIHRoZSBzZXJ2aWNlIHV0aWxpemluZyB0aGlzIGZ1bmN0aW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcEFsbFJlZ2lvbnMgPSBmdW5jdGlvbiAod2F0Y2hlcnMsIHBhcmVudENvbnRleHQpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkV2F0Y2hlcnMsXHJcbiAgICAgICAgICAgICAgICBrZXk7XHJcbiAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRXYXRjaGVycyA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gY2hpbGRXYXRjaGVycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZFdhdGNoZXJzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjaGlsZFdhdGNoZXJzW2tleV0uZGIsIGNoaWxkV2F0Y2hlcnNba2V5XS5yZWdpb25JZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vdGhpbmcgdG8gY2xlYW4tdXAuLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBzcGVjaWZpZWQgd2F0Y2hlciAocmVnaW9uSWQpXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdhdGNoZXJzIC0gV2F0Y2hlcnMgZnJvbSB0aGUgc2VydmljZSB1dGlsaXppbmcgdGhpcyBmdW5jdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24gb2YgYm90aCBwYXJlbnQgYW5kIHJlZ2lvbiB0byBiZSBkZWxldGVkLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZWdpb25JZCAtIFJlZ2lvbiBpZCBvZiB0aGUgc3Bhd25lZCByZWdpb24gdGhhdCBzaG91bGQgYmUgZGVsZXRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBSZWdpb24gPSBmdW5jdGlvbiAod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIHJlZ2lvbklkKSB7XHJcbiAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW3JlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmNsZWFuVXBSZWdpb24ocGFyZW50Q29udGV4dC5kYiwgcmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RoaW5nIHRvIGNsZWFuLXVwLi4nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYW5ub3QgY2xlYW4tdXAgcmVnaW9uIHNpbmNlIHBhcmVudENvbnRleHQgaXMgbm90IHJlZ2lzdGVyZWQuLicsIHBhcmVudENvbnRleHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlcyB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvZiBhIG5vZGUuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGNvbXBvbmVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5yZWdpb25JZCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBjb21wb25lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gUGF0aCB0byBub2RlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhdHRycyAtIEtleXMgYXJlIG5hbWVzIG9mIGF0dHJpYnV0ZXMgYW5kIHZhbHVlcyBhcmUgdGhlIHdhbnRlZCB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnNldE5vZGVBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGNvbnRleHQsIGlkLCBhdHRycykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoYXR0cnMpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ25vIGF0dHJpYnV0ZSB0byB1cGRhdGUnKTtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBpZClcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChub2RlT2JqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhdHRycyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSBrZXlzLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0QXR0ciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVPYmouc2V0QXR0cmlidXRlKGtleXNbY291bnRlcl0sIGF0dHJzW2tleXNbY291bnRlcl1dLCAnd2ViQ3lQaHkgLSBzZXROb2RlQXR0cmlidXRlcycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY291bnRlciA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRBdHRyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRBdHRyKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKiBUT0RPOiBXYXRjaCBkb21haW5Qb3J0cyBpbnNpZGUgQ29ubmVjdG9yc1xyXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBpbnRlcmZhY2VzIChQcm9wZXJ0aWVzLCBDb25uZWN0b3JzIGFuZCBEb21haW5Qb3J0cykgb2YgYSBtb2RlbC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd2F0Y2hlcnMgLSBXYXRjaGVycyBmcm9tIHRoZSBzZXJ2aWNlIHV0aWxpemluZyB0aGlzIGZ1bmN0aW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFBhdGggdG8gbW9kZWwuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBpZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hJbnRlcmZhY2VzXycgKyBpZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9LCAvL3Byb3BlcnR5OiAge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRhdGFUeXBlOiA8c3RyaW5nPiwgdmFsdWVUeXBlIDxzdHJpbmc+LCBkZXJpdmVkIDxib29sZWFuPn1cclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiB7fSwgLy9jb25uZWN0b3I6IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkb21haW5Qb3J0czogPG9iamVjdD4gfVxyXG4gICAgICAgICAgICAgICAgICAgIHBvcnRzOiB7fSAgICAgICAvL3BvcnQ6ICAgICAge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIHR5cGU6IDxzdHJpbmc+LCBjbGFzczogPHN0cmluZz4gfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uUHJvcGVydHlVcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0RhdGFUeXBlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0RhdGFUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlVHlwZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdWYWx1ZVR5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVyaXZlZCA9IGlzUHJvcGVydHlEZXJpdmVkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEucHJvcGVydGllc1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0RhdGFUeXBlICE9PSBkYXRhLnByb3BlcnRpZXNbaWRdLmRhdGFUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1tpZF0uZGF0YVR5cGUgPSBuZXdEYXRhVHlwZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZVR5cGUgIT09IGRhdGEucHJvcGVydGllc1tpZF0udmFsdWVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1tpZF0udmFsdWVUeXBlID0gbmV3VmFsdWVUeXBlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlcml2ZWQgIT09IGRhdGEucHJvcGVydGllc1tpZF0uZGVyaXZlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbaWRdLmRlcml2ZWQgPSBuZXdEZXJpdmVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uUHJvcGVydHlVbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5wcm9wZXJ0aWVzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Db25uZWN0b3JVcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5jb25uZWN0b3JzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29ubmVjdG9yc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Db25uZWN0b3JVbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5jb25uZWN0b3JzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Qb3J0VXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdUeXBlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1R5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2xhc3MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnQ2xhc3MnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLnBvcnRzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucG9ydHNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1R5cGUgIT09IGRhdGEucG9ydHNbaWRdLmRhdGFUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucG9ydHNbaWRdLnR5cGUgPSBuZXdUeXBlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NsYXNzICE9PSBkYXRhLnBvcnRzW2lkXS5jbGFzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnBvcnRzW2lkXS5jbGFzcyA9IG5ld0NsYXNzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uUG9ydFVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnBvcnRzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaXNQcm9wZXJ0eURlcml2ZWQgPSBmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlLmdldENvbGxlY3Rpb25QYXRocygnZHN0JykubGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBpZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAobW9kZWxOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Qcm9wZXJ0eSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wcm9wZXJ0aWVzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnRGF0YVR5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlVHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVmFsdWVUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXJpdmVkOiBpc1Byb3BlcnR5RGVyaXZlZChjaGlsZE5vZGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblByb3BlcnR5VXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uUHJvcGVydHlVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbm5lY3RvcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25uZWN0b3JzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21haW5Qb3J0czoge31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uQ29ubmVjdG9yVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uQ29ubmVjdG9yVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vcXVldWVMaXN0LnB1c2goY2hpbGROb2RlLmxvYWRDaGlsZHJlbihjaGlsZE5vZGUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Eb21haW5Qb3J0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnBvcnRzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnQ2xhc3MnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25Qb3J0VXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uUG9ydFVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL3F1ZXVlTGlzdC5wdXNoKGNoaWxkTm9kZS5sb2FkQ2hpbGRyZW4oY2hpbGROb2RlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWxOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IG5ld0NoaWxkLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLlByb3BlcnR5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnRGF0YVR5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlVHlwZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdWYWx1ZVR5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcml2ZWQ6IGlzUHJvcGVydHlEZXJpdmVkKG5ld0NoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblByb3BlcnR5VXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25Qcm9wZXJ0eVVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY2hpbGRJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQ29ubmVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbm5lY3RvcnNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluUG9ydHM6IHt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uQ29ubmVjdG9yVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25Db25uZWN0b3JVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vcXVldWVMaXN0LnB1c2goY2hpbGROb2RlLmxvYWRDaGlsZHJlbihjaGlsZE5vZGUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkRvbWFpblBvcnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucG9ydHNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1R5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdDbGFzcycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uUG9ydFVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uUG9ydFVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY2hpbGRJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xyXG5cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgnY29tcG9uZW50U2VydmljZScsIGZ1bmN0aW9uICgkcSwgJHRpbWVvdXQsIG5vZGVTZXJ2aWNlLCBiYXNlQ3lQaHlTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciB3YXRjaGVycyA9IHt9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBjb21wb25lbnQgZnJvbSB0aGUgY29udGV4dCAoZGIvcHJvamVjdC9icmFuY2gpLlxyXG4gICAgICAgICAqIEBwYXJhbSBjb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLCBOLkIuIGRvZXMgbm90IG5lZWQgdG8gc3BlY2lmeSByZWdpb24uXHJcbiAgICAgICAgICogQHBhcmFtIGNvbXBvbmVudElkXHJcbiAgICAgICAgICogQHBhcmFtIFttc2ddIC0gQ29tbWl0IG1lc3NhZ2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5kZWxldGVDb21wb25lbnQgPSBmdW5jdGlvbiAoY29udGV4dCwgY29tcG9uZW50SWQsIG1zZykge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG1zZyB8fCAnQ29tcG9uZW50U2VydmljZS5kZWxldGVDb21wb25lbnQgJyArIGNvbXBvbmVudElkO1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5kZXN0cm95Tm9kZShjb250ZXh0LCBjb21wb25lbnRJZCwgbWVzc2FnZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlcyB0aGUgZ2l2ZW4gYXR0cmlidXRlc1xyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGNvbXBvbmVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBjb21wb25lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQucmVnaW9uSWQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb21wb25lbnRJZCAtIFBhdGggdG8gY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhdHRycyAtIEtleXMgYXJlIG5hbWVzIG9mIGF0dHJpYnV0ZXMgYW5kIHZhbHVlcyBhcmUgdGhlIHdhbnRlZCB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnNldENvbXBvbmVudEF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoY29udGV4dCwgY29tcG9uZW50SWQsIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLnNldE5vZGVBdHRyaWJ1dGVzKGNvbnRleHQsIGNvbXBvbmVudElkLCBhdHRycyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYWxsIGNvbXBvbmVudHMgKGV4aXN0ZW5jZSBhbmQgdGhlaXIgYXR0cmlidXRlcykgb2YgYSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS4gIERhdGEgaXMgYW4gb2JqZWN0IGluIGRhdGEuY29tcG9uZW50cy5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gYXZtSWRzIC0gQW4gb3B0aW9uYWwgZmlsdGVyIHRoYXQgb25seSB3YXRjaGVzIGNvbXBvbmVudHMgd2l0aCBJRHMgdGhhdCBldmFsdWF0ZXMgdG8gdHJ1ZS5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoQ29tcG9uZW50cyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgYXZtSWRzLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbXBvbmVudHMnLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiB7fSAvLyBjb21wb25lbnQge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIGF2bUlkOiA8c3RyaW5nPiwgcmVzb3VyY2U6IDxoYXNofHN0cmluZz4sIGNsYXNzaWZpY2F0aW9uczogPHN0cmluZz4gfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXZtSUQgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UmVzb3VyY2UgPSB0aGlzLmdldEF0dHJpYnV0ZSgnUmVzb3VyY2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2xhc3MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnQ2xhc3NpZmljYXRpb25zJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdBdm1JRCAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5hdm1JZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLmF2bUlkID0gbmV3QXZtSUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UmVzb3VyY2UgIT09IGRhdGEuY29tcG9uZW50c1tpZF0ucmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2lkXS5yZXNvdXJjZSA9IG5ld1Jlc291cmNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NsYXNzICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLmNsYXNzaWZpY2F0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLmNsYXNzaWZpY2F0aW9ucyA9IG5ld0NsYXNzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdDb21wb25lbnRTZXJ2aWNlIGZvdW5kIHVwZGF0ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YS5jb21wb25lbnRzW2lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5jb21wb25lbnRzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWF2bUlkcyB8fCBhdm1JZHMuaGFzT3duUHJvcGVydHkoY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSUQnKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2NvbXBvbmVudElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdm1JZDogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdSZXNvdXJjZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NpZmljYXRpb25zOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdDbGFzc2lmaWNhdGlvbnMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFDTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVk1Db21wb25lbnRNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJZCA9IG5ld0NoaWxkLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhdm1JZHMgfHwgYXZtSWRzLmhhc093blByb3BlcnR5KG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSUQnKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2NvbXBvbmVudElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWQ6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ1Jlc291cmNlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2lmaWNhdGlvbnM6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnQ2xhc3NpZmljYXRpb25zJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY29tcG9uZW50SWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb21wb25lbnRzW2NvbXBvbmVudElkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY0RlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFDTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGRvbWFpbi1tb2RlbHMgb2YgYSBjb21wb25lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIGNvbXBvbmVudElkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoQ29tcG9uZW50RG9tYWlucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBjb21wb25lbnRJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hDb21wb25lbnREb21haW5zXycgKyBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGNvbXBvbmVudElkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbk1vZGVsczoge30gICAvL2RvbWFpbk1vZGVsOiBpZDogPHN0cmluZz4sIHR5cGU6IDxzdHJpbmc+XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Eb21haW5Nb2RlbFVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdUeXBlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1R5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdUeXBlICE9PSBkYXRhLmRvbWFpbk1vZGVsc1tpZF0udHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRvbWFpbk1vZGVsc1tpZF0udHlwZSA9IG5ld1R5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Eb21haW5Nb2RlbFVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmRvbWFpbk1vZGVsc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIGNvbXBvbmVudElkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjb21wb25lbnROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IGNoaWxkTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuRG9tYWluTW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZG9tYWluTW9kZWxzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdUeXBlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uRG9tYWluTW9kZWxVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25Eb21haW5Nb2RlbFVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Tm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Eb21haW5Nb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kb21haW5Nb2RlbHNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnVHlwZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uRG9tYWluTW9kZWxVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvbkRvbWFpbk1vZGVsVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjaGlsZElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS53YXRjaEludGVyZmFjZXMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGlkLCB1cGRhdGVMaXN0ZW5lcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwUmVnaW9uID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHJlZ2lvbklkKSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgcmVnaW9uSWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlci5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBmbikge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgZm4pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubG9nQ29udGV4dCA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvZ0NvbnRleHQoY29udGV4dCk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBXZWJHTUVHbG9iYWwqL1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgc2VydmljZSBjb250YWlucyBtZXRob2RzIGZvciBkZXNpZ24gc3BhY2UgZXhwbG9yYXRpb24gdGhyb3VnaCB0aGUgRXhlY3V0b3IgQ2xpZW50LlxyXG4gKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgnZGVzZXJ0U2VydmljZScsIGZ1bmN0aW9uICgkcSwgJGludGVydmFsLCBmaWxlU2VydmljZSwgZXhlY3V0b3JTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgQ01EU1RSLFxyXG4gICAgICAgICAgICB4bWxUb0pzb24gPSBuZXcgV2ViR01FR2xvYmFsLmNsYXNzZXMuQ29udmVydGVycy5YbWwyanNvbih7XHJcbiAgICAgICAgICAgICAgICBza2lwV1NUZXh0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXJyYXlFbGVtZW50czoge1xyXG4gICAgICAgICAgICAgICAgICAgIENvbmZpZ3VyYXRpb246IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgRWxlbWVudDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBOYXR1cmFsTWVtYmVyOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIEFsdGVybmF0aXZlQXNzaWdubWVudDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAganNvblRvWG1sID0gbmV3IFdlYkdNRUdsb2JhbC5jbGFzc2VzLkNvbnZlcnRlcnMuSnNvbjJ4bWwoKTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uIChkZXNlcnRJbnB1dCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKChkZXNlcnRJbnB1dC5kZXNlcnRTeXN0ZW0gJiYgYW5ndWxhci5pc09iamVjdChkZXNlcnRJbnB1dC5kZXNlcnRTeXN0ZW0pICYmXHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmlzT2JqZWN0KGRlc2VydElucHV0LmlkTWFwKSkgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2Rlc2VydElucHV0IG11c3QgY29udGFpbiBhIGRlc2VydFN5c3RlbSBhbmQgaWRNYXAgb2JqZWN0IScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNlbGYuc2F2ZURlc2VydElucHV0KGRlc2VydElucHV0LmRlc2VydFN5c3RlbSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChpbnB1dEhhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2F2ZWQgZGVzZXJ0SW5wdXQnLCBmaWxlU2VydmljZS5nZXREb3dubG9hZFVybChpbnB1dEhhc2gpKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jcmVhdGVBbmRSdW5Kb2IoaW5wdXRIYXNoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoam9iSW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdKb2Igc3VjY2VlZGVkIGZpbmFsIGpvYkluZm8nLCBqb2JJbmZvKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5leHRyYWN0Q29uZmlndXJhdGlvbnMoam9iSW5mbywgZGVzZXJ0SW5wdXQuaWRNYXApO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjb25maWd1cmF0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoY29uZmlndXJhdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdDYWxjdWxhdGluZyBjb25maWd1cmF0aW9ucyBmYWlsZWQsIGVycjogJyArIGVyci50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zYXZlRGVzZXJ0SW5wdXQgPSBmdW5jdGlvbiAoZGVzZXJ0U3lzdGVtKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBhcnRpZmFjdCxcclxuICAgICAgICAgICAgICAgIHhtbFN0cmluZztcclxuXHJcbiAgICAgICAgICAgIGFydGlmYWN0ID0gZmlsZVNlcnZpY2UuY3JlYXRlQXJ0aWZhY3QoJ2Rlc2VydC1pbnB1dCcpO1xyXG4gICAgICAgICAgICB4bWxTdHJpbmcgPSBqc29uVG9YbWwuY29udmVydFRvU3RyaW5nKGRlc2VydFN5c3RlbSk7XHJcblxyXG4gICAgICAgICAgICBmaWxlU2VydmljZS5hZGRGaWxlQXNTb2Z0TGlua1RvQXJ0aWZhY3QoYXJ0aWZhY3QsICdkZXNlcnRJbnB1dC54bWwnLCB4bWxTdHJpbmcpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBleGVjQ29uZmlnID0gSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY21kOiAncnVuX2Rlc2VydC5jbWQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0QXJ0aWZhY3RzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnYWxsJywgcmVzdWx0UGF0dGVybnM6IFtdIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgbnVsbCwgNCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzVG9BZGQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZXhlY3V0b3JfY29uZmlnLmpzb24nOiBleGVjQ29uZmlnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3J1bl9kZXNlcnQuY21kJzogQ01EU1RSXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVTZXJ2aWNlLmFkZEZpbGVzVG9BcnRpZmFjdChhcnRpZmFjdCwgZmlsZXNUb0FkZCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGhhc2hlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWxlU2VydmljZS5zYXZlQXJ0aWZhY3QoYXJ0aWZhY3QpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChhcnRpZUhhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGFydGllSGFzaCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0NvdWxkIG5vdCBzYXZlIERlc2VydElucHV0IHRvIGJsb2IsIGVycjogXCInICsgcmVhc29uICsgJ1wiJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlQW5kUnVuSm9iID0gZnVuY3Rpb24gKGlucHV0SGFzaCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBleGVjdXRvclNlcnZpY2UuY3JlYXRlSm9iKHtoYXNoOiBpbnB1dEhhc2gsIGxhYmVsczogW119KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdG9wO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0b3AgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjdXRvclNlcnZpY2UuZ2V0SW5mbyhpbnB1dEhhc2gpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoam9iSW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhKU09OLnN0cmluZ2lmeShqb2JJbmZvLCBudWxsLCA0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpvYkluZm8uc3RhdHVzID09PSAnQ1JFQVRFRCcgfHwgam9iSW5mby5zdGF0dXMgPT09ICdSVU5OSU5HJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwoc3RvcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpvYkluZm8uc3RhdHVzID09PSAnU1VDQ0VTUycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShqb2JJbmZvKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoSlNPTi5zdHJpbmdpZnkoam9iSW5mbywgbnVsbCwgNCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwoc3RvcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdDb3VsZCBub3Qgb2J0YWluIGpvYkluZm8gZm9yIGRlc2VydCcgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnQ291bGQgbm90IGNyZWF0ZSBqb2InICsgZXJyKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5leHRyYWN0Q29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoam9iSW5mbywgaWRNYXApIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgaWYgKChqb2JJbmZvLnJlc3VsdEhhc2hlcyAmJiBqb2JJbmZvLnJlc3VsdEhhc2hlcy5hbGwpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdKb2JJbmZvIGRpZCBub3QgY29udGFpbiByZXN1bHRIYXNoZXMuYWxsJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmaWxlU2VydmljZS5nZXRNZXRhZGF0YShqb2JJbmZvLnJlc3VsdEhhc2hlcy5hbGwpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAobWV0YWRhdGEpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IERlYWwgd2l0aCBjb25maWdzIHdoZW4gdGhlcmUncyBjb25zdHJhaW50c1xyXG4vLyAgICAgICAgICAgICAgICAgICAgaWYgKCFtZXRhZGF0YS5jb250ZW50Lmhhc093blByb3BlcnR5KCdkZXNlcnRJbnB1dF9jb25maWdzLnhtbCcpKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdEZXNlcnQgZGlkIG5vdCBnZW5lcmF0ZSBhIFwiZGVzZXJ0SW5wdXRfY29uZmlncy54bWxcIi4nKTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbi8vICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtZXRhZGF0YS5jb250ZW50Lmhhc093blByb3BlcnR5KCdkZXNlcnRJbnB1dF9iYWNrLnhtbCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnRGVzZXJ0IGRpZCBub3QgZ2VuZXJhdGUgYSBkZXNlcnRJbnB1dF9iYWNrLnhtbC4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVTZXJ2aWNlLmdldE9iamVjdChtZXRhZGF0YS5jb250ZW50WydkZXNlcnRJbnB1dF9iYWNrLnhtbCddLmNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlc2VydE9iamVjdCA9IHhtbFRvSnNvbi5jb252ZXJ0RnJvbUJ1ZmZlcihjb250ZW50KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzZXJ0QmFja1N5c3RlbSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaixcclxuICAgICAgICAgICAgICAgICAgICAgICAgayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbHRBc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbUlkVG9QYXRoID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXNlcnRPYmplY3QgaW5zdGFuY2VvZiBFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ091dHB1dCBkZXNlcnQgWE1MIG5vdCB2YWxpZCB4bWwsIGVycjogJyArIGRlc2VydE9iamVjdC5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBkZXNlcnRCYWNrU3lzdGVtID0gZGVzZXJ0T2JqZWN0LkRlc2VydEJhY2tTeXN0ZW07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXNlcnRCYWNrU3lzdGVtLkVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IGRlc2VydEJhY2tTeXN0ZW0uRWxlbWVudC5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbSA9IGRlc2VydEJhY2tTeXN0ZW0uRWxlbWVudFtqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1JZFRvUGF0aFtlbGVtWydAX2lkJ11dID0gaWRNYXBbZWxlbVsnQGV4dGVybmFsSUQnXV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IGRlc2VydEJhY2tTeXN0ZW0uQ29uZmlndXJhdGlvbi5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZmcgPSBkZXNlcnRCYWNrU3lzdGVtLkNvbmZpZ3VyYXRpb25bal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2ZnWydAbmFtZSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNmZ1snQGlkJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnID0gY29uZmlndXJhdGlvbnNbY29uZmlndXJhdGlvbnMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjZmcuQWx0ZXJuYXRpdmVBc3NpZ25tZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGsgPSAwOyBrIDwgY2ZnLkFsdGVybmF0aXZlQXNzaWdubWVudC5sZW5ndGg7IGsgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdEFzcyA9IGNmZy5BbHRlcm5hdGl2ZUFzc2lnbm1lbnRba107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLmFsdGVybmF0aXZlQXNzaWdubWVudHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQWx0ZXJuYXRpdmU6IGVsZW1JZFRvUGF0aFthbHRBc3NbJ0BhbHRlcm5hdGl2ZV9lbmRfJ11dLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZU9mOiBlbGVtSWRUb1BhdGhbYWx0QXNzWydAYWx0ZXJuYXRpdmVfb2ZfZW5kXyddXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoY29uZmlndXJhdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNvbmZpZ3VyYXRpb25zRHVtbXkgPSBmdW5jdGlvbiAoZGVzZXJ0SW5wdXQpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGlucHV0QXJ0aWZhY3QsXHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucyA9IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkNvbmYuIG5vOiAxXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlQXNzaWdubWVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEFsdGVybmF0aXZlOiBcIi8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OC85MTA3MzgxNVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlT2Y6IFwiLzIxMzAwMTc4MzQvNTQyNTcxNDk0LzE2NDYwNTk0MjIvNTY0MzEyMTQ4XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJDb25mLiBubzogMlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRBbHRlcm5hdGl2ZTogXCIvMjEzMDAxNzgzNC81NDI1NzE0OTQvMTY0NjA1OTQyMi81NjQzMTIxNDgvMTQzMzQ3MTc4OVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlT2Y6IFwiLzIxMzAwMTc4MzQvNTQyNTcxNDk0LzE2NDYwNTk0MjIvNTY0MzEyMTQ4XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogMyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJDb25mLiBubzogM1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRBbHRlcm5hdGl2ZTogXCIvMjEzMDAxNzgzNC81NDI1NzE0OTQvMTY0NjA1OTQyMi81NjQzMTIxNDgvMTQ5MzkwNzI2NFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlT2Y6IFwiLzIxMzAwMTc4MzQvNTQyNTcxNDk0LzE2NDYwNTk0MjIvNTY0MzEyMTQ4XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogNCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJDb25mLiBubzogNFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRBbHRlcm5hdGl2ZTogXCIvMjEzMDAxNzgzNC81NDI1NzE0OTQvMTY0NjA1OTQyMi81NjQzMTIxNDgvMTc2NzUyMTYyMVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlT2Y6IFwiLzIxMzAwMTc4MzQvNTQyNTcxNDk0LzE2NDYwNTk0MjIvNTY0MzEyMTQ4XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNvbmZpZ3VyYXRpb25zKTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5nZXREZXNlcnRJbnB1dERhdGEgPSBmdW5jdGlvbiAoZGVzaWduU3RydWN0dXJlRGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGVzZXJ0U3lzdGVtLFxyXG4gICAgICAgICAgICAgICAgaWRNYXAgPSB7fSxcclxuICAgICAgICAgICAgICAgIGlkQ291bnRlciA9IDQsXHJcbiAgICAgICAgICAgICAgICByb290Q29udGFpbmVyID0gZGVzaWduU3RydWN0dXJlRGF0YS5jb250YWluZXJzW2Rlc2lnblN0cnVjdHVyZURhdGEucm9vdElkXSxcclxuICAgICAgICAgICAgICAgIHBvcHVsYXRlRGF0YVJlYyA9IGZ1bmN0aW9uIChjb250YWluZXIsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZERhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBjb250YWluZXIuY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyLmNvbXBvbmVudHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhID0gY29udGFpbmVyLmNvbXBvbmVudHNba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkQ291bnRlciArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgPSBpZENvdW50ZXIudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkTWFwW2lkXSA9IGNoaWxkRGF0YS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuRWxlbWVudC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQF9pZCc6ICdpZCcgKyBpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGRlY29tcG9zaXRpb24nOiAnZmFsc2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAZXh0ZXJuYWxJRCc6IGlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAaWQnOiBpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQG5hbWUnOiBjaGlsZERhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRWxlbWVudCc6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBjb250YWluZXIuc3ViQ29udGFpbmVycykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyLnN1YkNvbnRhaW5lcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhID0gY29udGFpbmVyLnN1YkNvbnRhaW5lcnNba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkQ291bnRlciArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgPSBpZENvdW50ZXIudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkTWFwW2lkXSA9IGNoaWxkRGF0YS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuRWxlbWVudC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQF9pZCc6ICdpZCcgKyBpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGRlY29tcG9zaXRpb24nOiAoY2hpbGREYXRhLnR5cGUgPT09ICdDb21wb3VuZCcpLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BleHRlcm5hbElEJzogaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BpZCc6IGlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAbmFtZSc6IGNoaWxkRGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdFbGVtZW50JzogW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wdWxhdGVEYXRhUmVjKGNoaWxkRGF0YSwgZWxlbWVudC5FbGVtZW50W2VsZW1lbnQuRWxlbWVudC5sZW5ndGggLSAxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBkZXNlcnRTeXN0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAnRGVzZXJ0U3lzdGVtJzoge1xyXG4gICAgICAgICAgICAgICAgICAgICdAeG1sbnM6eHNpJzogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlJyxcclxuICAgICAgICAgICAgICAgICAgICAnQFN5c3RlbU5hbWUnOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAnQHhzaTpub05hbWVzcGFjZVNjaGVtYUxvY2F0aW9uJzogJ0Rlc2VydElmYWNlLnhzZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ0NvbnN0cmFpbnRTZXQnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdAX2lkJzogJ2lkMScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdAZXh0ZXJuYWxJRCc6ICcxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BpZCc6ICcxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BuYW1lJzogJ2NvbnN0cmFpbnRzJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgJ0Zvcm11bGFTZXQnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdAX2lkJzogJ2lkMicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdAZXh0ZXJuYWxJRCc6ICcyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BpZCc6ICcyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BuYW1lJzogJ2Zvcm11bGFTZXQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAnU3BhY2UnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdAX2lkJzogJ2lkMycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdAZGVjb21wb3NpdGlvbic6ICd0cnVlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BleHRlcm5hbElEJzogJzMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQGlkJzogJzMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQG5hbWUnOiAnRGVzaWduU3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnRWxlbWVudCc6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQF9pZCc6ICdpZDQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAZGVjb21wb3NpdGlvbic6ICd0cnVlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGV4dGVybmFsSUQnOiAnNCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BpZCc6ICc0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQG5hbWUnOiByb290Q29udGFpbmVyLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0VsZW1lbnQnOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBwb3B1bGF0ZURhdGFSZWMocm9vdENvbnRhaW5lciwgZGVzZXJ0U3lzdGVtLkRlc2VydFN5c3RlbS5TcGFjZS5FbGVtZW50WzBdKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7IGRlc2VydFN5c3RlbTogZGVzZXJ0U3lzdGVtLCBpZE1hcDogaWRNYXAgfTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBDTURTVFIgPSBbXHJcbiAgICAgICAgICAgICc6OiBSdW5zIDwtRGVzZXJ0VG9vbHMuZXhlLT4gZGVzZXJ0SW5wdXQueG1sIC9tJyxcclxuICAgICAgICAgICAgJ0VDSE8gb2ZmJyxcclxuICAgICAgICAgICAgJ3B1c2hkICV+ZHAwJyxcclxuICAgICAgICAgICAgJyVTeXN0ZW1Sb290JVxcXFxTeXNXb1c2NFxcXFxSRUcuZXhlIHF1ZXJ5IFwiSEtMTVxcXFxzb2Z0d2FyZVxcXFxNRVRBXCIgL3YgXCJNRVRBX1BBVEhcIicsXHJcbiAgICAgICAgICAgICdTRVQgUVVFUllfRVJST1JMRVZFTD0lRVJST1JMRVZFTCUnLFxyXG4gICAgICAgICAgICAnSUYgJVFVRVJZX0VSUk9STEVWRUwlID09IDAgKCcsXHJcbiAgICAgICAgICAgICcgICAgICAgIEZPUiAvRiBcInNraXA9MiB0b2tlbnM9MiwqXCIgJSVBIElOIChcXCclU3lzdGVtUm9vdCVcXFxcU3lzV29XNjRcXFxcUkVHLmV4ZSBxdWVyeSBcIkhLTE1cXFxcc29mdHdhcmVcXFxcTUVUQVwiIC92IFwiTUVUQV9QQVRIXCJcXCcpIERPIFNFVCBNRVRBX1BBVEg9JSVCKScsXHJcbiAgICAgICAgICAgICdTRVQgREVTRVJUX0VYRT1cIiVNRVRBX1BBVEglXFxcXGJpblxcXFxEZXNlcnRUb29sLmV4ZVwiJyxcclxuICAgICAgICAgICAgJyAgIElGIEVYSVNUICVERVNFUlRfRVhFJSAoJyxcclxuICAgICAgICAgICAgJyAgICAgICBSRU0gSW5zdGFsbGVyIG1hY2hpbmUuJyxcclxuICAgICAgICAgICAgJyAgICAgICAlREVTRVJUX0VYRSUgZGVzZXJ0SW5wdXQueG1sIC9jIFwiYXBwbHlBbGxcIicsXHJcbiAgICAgICAgICAgICcgICApIEVMU0UgSUYgRVhJU1QgXCIlTUVUQV9QQVRIJVxcXFxzcmNcXFxcYmluXFxcXERlc2VydFRvb2wuZXhlXCIgKCcsXHJcbiAgICAgICAgICAgICcgICAgICAgUkVNIERldmVsb3BlciBtYWNoaW5lLicsXHJcbiAgICAgICAgICAgICcgICAgICAgXCIlTUVUQV9QQVRIJVxcXFxzcmNcXFxcYmluXFxcXERlc2VydFRvb2wuZXhlXCIgZGVzZXJ0SW5wdXQueG1sIC9jIFwiYXBwbHlBbGxcIicsXHJcbiAgICAgICAgICAgICcgICApIEVMU0UgKCcsXHJcbiAgICAgICAgICAgICcgICAgICAgRUNITyBvbicsXHJcbiAgICAgICAgICAgICcgICAgICAgRUNITyBDb3VsZCBub3QgZmluZCBEZXNlcnRUb29sLmV4ZSEnLFxyXG4gICAgICAgICAgICAnICAgICAgIEVYSVQgL0IgMycsXHJcbiAgICAgICAgICAgICcgICApJyxcclxuICAgICAgICAgICAgJyknLFxyXG4gICAgICAgICAgICAnSUYgJVFVRVJZX0VSUk9STEVWRUwlID09IDEgKCcsXHJcbiAgICAgICAgICAgICcgICAgRUNITyBvbicsXHJcbiAgICAgICAgICAgICdFQ0hPIFwiTUVUQSB0b29scyBub3QgaW5zdGFsbGVkLlwiID4+IF9GQUlMRUQudHh0JyxcclxuICAgICAgICAgICAgJ0VDSE8gXCJTZWUgRXJyb3IgTG9nOiBfRkFJTEVELnR4dFwiJyxcclxuICAgICAgICAgICAgJ0VYSVQgL2IgJVFVRVJZX0VSUk9STEVWRUwlJyxcclxuICAgICAgICAgICAgJyknLFxyXG4gICAgICAgICAgICAncG9wZCddLmpvaW4oJ1xcbicpO1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCdkZXNpZ25TZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCAkdGltZW91dCwgJGxvY2F0aW9uLCAkbW9kYWwsIGdyb3dsLCBub2RlU2VydmljZSwgYmFzZUN5UGh5U2VydmljZSwgcGx1Z2luU2VydmljZSwgZmlsZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICB3YXRjaGVycyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLmVkaXREZXNpZ25GbiA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvRGVzaWduRWRpdC5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEZXNpZ25FZGl0Q29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICAvL3NpemU6IHNpemUsXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7IGRhdGE6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRhdGE7IH0gfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKGVkaXRlZERhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBhdHRycyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IGVkaXRlZERhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAnSU5GTyc6IGVkaXRlZERhdGEuZGVzY3JpcHRpb25cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldERlc2lnbkF0dHJpYnV0ZXMoZGF0YS5jb250ZXh0LCBkYXRhLmlkLCBhdHRycylcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBdHRyaWJ1dGUgdXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZXhwb3J0QXNBZG1GbiA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZXhwb3J0RGVzaWduKGRhdGEuY29udGV4dCwgZGF0YS5pZClcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkb3dubG9hZFVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoJ0FETSBmaWxlIGZvciA8YSBocmVmPVwiJyArIGRvd25sb2FkVXJsICsgJ1wiPicgKyBkYXRhLm5hbWUgKyAnPC9hPiBleHBvcnRlZC4nKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcclxuICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcignRXhwb3J0IGZhaWxlZCwgc2VlIGNvbnNvbGUgZm9yIGRldGFpbHMuJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmRlbGV0ZUZuID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9TaW1wbGVNb2RhbC5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTaW1wbGVNb2RhbENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRGVsZXRlIERlc2lnbiBTcGFjZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiAnVGhpcyB3aWxsIGRlbGV0ZSAnICsgZGF0YS5uYW1lICsgJyBmcm9tIHRoZSB3b3Jrc3BhY2UuJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZGVsZXRlRGVzaWduKGRhdGEuY29udGV4dCwgZGF0YS5pZCk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgZGVzaWduIGZyb20gdGhlIGNvbnRleHQuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBkYXRhLWJhc2UgY29ubmVjdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGVzaWduSWQgLSBQYXRoIHRvIGRlc2lnbi1zcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0gW21zZ10gLSBDb21taXQgbWVzc2FnZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmRlbGV0ZURlc2lnbiA9IGZ1bmN0aW9uIChjb250ZXh0LCBkZXNpZ25JZCwgbXNnKSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbXNnIHx8ICdkZXNpZ25TZXJ2aWNlLmRlbGV0ZURlc2lnbiAnICsgZGVzaWduSWQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmRlc3Ryb3lOb2RlKGNvbnRleHQsIGRlc2lnbklkLCBtZXNzYWdlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGVzIHRoZSBnaXZlbiBhdHRyaWJ1dGVzXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgZGVzaWduLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGRlc2lnbi5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5yZWdpb25JZCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBkZXNpZ24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGRlc2lnbklkIC0gUGF0aCB0byBkZXNpZ24tc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGF0dHJzIC0gS2V5cyBhcmUgbmFtZXMgb2YgYXR0cmlidXRlcyBhbmQgdmFsdWVzIGFyZSB0aGUgd2FudGVkIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuc2V0RGVzaWduQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChjb250ZXh0LCBkZXNpZ25JZCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJhc2VDeVBoeVNlcnZpY2Uuc2V0Tm9kZUF0dHJpYnV0ZXMoY29udGV4dCwgZGVzaWduSWQsIGF0dHJzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDYWxscyBBZG1FeHBvcnRlci5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIENvbnRleHQgZm9yIHBsdWdpbi5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24gdG8gcHVsbCBtb2RlbCBmcm9tLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkZXNpZ25JZFxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbZGVzZXJ0Q2ZnUGF0aF0gLSBQYXRoIHRvIGNvbmZpZ3VyYXRpb24gaWYgb25seSBvbmUgaXMgdG8gYmUgZXhwb3J0ZWQuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gcmVzb2x2ZXMgdG8ge3N0cmluZ30gaWYgc3VjY2Vzc2Z1bC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmV4cG9ydERlc2lnbiA9IGZ1bmN0aW9uIChjb250ZXh0LCBkZXNpZ25JZCwgZGVzZXJ0Q2ZnUGF0aCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGU6IGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uU2VydmVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5Db25maWc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWNtczogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2VydENmZzogZGVzZXJ0Q2ZnUGF0aCB8fCAnJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLnJ1blBsdWdpbihjb250ZXh0LCAnQWRtRXhwb3J0ZXInLCBjb25maWcpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9cIntcInN1Y2Nlc3NcIjp0cnVlLFwibWVzc2FnZXNcIjpbXSxcImFydGlmYWN0c1wiOltdLFwicGx1Z2luTmFtZVwiOlwiQURNIEltcG9ydGVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXCJzdGFydFRpbWVcIjpcIjIwMTQtMTEtMDhUMDI6NTE6MjEuMzgzWlwiLFwiZmluaXNoVGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS45MzlaXCIsXCJlcnJvclwiOm51bGx9XCJcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShmaWxlU2VydmljZS5nZXREb3dubG9hZFVybChyZXN1bHQuYXJ0aWZhY3RzWzBdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlc3VsdC5lcnJvciArICcgbWVzc2FnZXM6ICcgKyBhbmd1bGFyLnRvSnNvbihyZXN1bHQubWVzc2FnZXMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChhbmd1bGFyLnRvSnNvbihyZXN1bHQubWVzc2FnZXMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcgJyArIHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmdlbmVyYXRlRGFzaGJvYXJkID0gZnVuY3Rpb24gKGNvbnRleHQsIGRlc2lnbklkLCByZXN1bHRJZHMpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlOiBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgICAgICBydW5PblNlcnZlcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdElEczogcmVzdWx0SWRzLmpvaW4oJzsnKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGNvbmZpZykpO1xyXG4gICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLnJ1blBsdWdpbihjb250ZXh0LCAnR2VuZXJhdGVEYXNoYm9hcmQnLCBjb25maWcpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdExpZ2h0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiByZXN1bHQuc3VjY2VzcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWZhY3RzSHRtbDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiByZXN1bHQubWVzc2FnZXNcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVzdWx0XCIsIHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luU2VydmljZS5nZXRQbHVnaW5BcnRpZmFjdHNIdG1sKHJlc3VsdC5hcnRpZmFjdHMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChhcnRpZmFjdHNIdG1sKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRMaWdodC5hcnRpZmFjdHNIdG1sID0gYXJ0aWZhY3RzSHRtbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0TGlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsICcgKyByZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLndhdGNoRGVzaWduTm9kZSA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hEZXNpZ24nLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBtZXRhOiBudWxsLCAvLyBNRVRBIG5vZGVzIC0gbmVlZGVkIHdoZW4gY3JlYXRpbmcgbmV3IG5vZGVzLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzaWduOiB7fSAvLyBkZXNpZ24ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPiwgbm9kZSA8Tm9kZU9iaj59XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEuZGVzaWduLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ24ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS5kZXNpZ24uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ24uZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEuZGVzaWdufSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIGRlc2lnbklkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkZXNpZ25Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubWV0YSA9IG1ldGE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZGVzaWduTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNpZ25Ob2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogZGVzaWduTm9kZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYWxsIGNvbnRhaW5lcnMgKGV4aXN0ZW5jZSBhbmQgdGhlaXIgYXR0cmlidXRlcykgb2YgYSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS4gRGF0YSBpcyBhbiBvYmplY3QgaW4gZGF0YS5kZXNpZ25zLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hEZXNpZ25zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaERlc2lnbnMnLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBkZXNpZ25zOiB7fSAvLyBkZXNpZ24ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPn1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5kZXNpZ25zW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS5kZXNpZ25zW2lkXS5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbnNbaWRdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLmRlc2lnbnNbaWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmRlc2lnbnNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoZm9sZGVyTm9kZSwgbWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbnNbZGVzaWduSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25JZCA9IG5ld0NoaWxkLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ25zW2Rlc2lnbklkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSU5GTycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBkZXNpZ25JZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmRlc2lnbnNbZGVzaWduSWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY0RlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGFsbCBjb250YWluZXJzIChleGlzdGVuY2UgYW5kIHRoZWlyIGF0dHJpYnV0ZXMpIG9mIGEgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkZXNpZ25JZFxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoTmJyT2ZDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOYnJPZkNvbmZpZ3VyYXRpb25zXycgKyBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0czogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IDBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hDb25maWd1cmF0aW9uID0gZnVuY3Rpb24gKGNmZ05vZGUsIG1ldGEsIHdhc0NyZWF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2ZnRGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRPblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudGVycy5yZXN1bHRzIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvdW50IHRoaXMgc2V0IGFuZCBhZGQgYW4gdW5sb2FkIGhhbmRsZS5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLmNvbmZpZ3VyYXRpb25zICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdhc0NyZWF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjZmdOb2RlLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZS5vblVubG9hZChmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudGVycy5jb25maWd1cmF0aW9ucyAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjZmdOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5SZXN1bHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudGVycy5yZXN1bHRzICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKHJlc3VsdE9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZmdOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuUmVzdWx0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMucmVzdWx0cyArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChyZXN1bHRPblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZmdEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjZmdEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoQ29uZmlndXJhdGlvblNldCA9IGZ1bmN0aW9uIChzZXROb2RlLCBtZXRhLCB3YXNDcmVhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNldERlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDb3VudCB0aGlzIHNldCBhbmQgYWRkIGFuIHVubG9hZCBoYW5kbGUuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudGVycy5zZXRzICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdhc0NyZWF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBzZXROb2RlLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0Tm9kZS5vblVubG9hZChmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudGVycy5zZXRzIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldE5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaENvbmZpZ3VyYXRpb24oY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0Tm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hDb25maWd1cmF0aW9uKG5ld0NoaWxkLCBtZXRhLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXREZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXREZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0RGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBkZXNpZ25JZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGVzaWduTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoQ29uZmlndXJhdGlvblNldChjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoQ29uZmlndXJhdGlvblNldChuZXdDaGlsZCwgbWV0YSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhIGRlc2lnbihzcGFjZSkgdy5yLnQuIGludGVyZmFjZXMuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIGRlc2lnbklkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoSW50ZXJmYWNlcyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJhc2VDeVBoeVNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBmdWxsIGhpZXJhcmNoeSBvZiBhIGRlc2lnbiB3LnIudC4gY29udGFpbmVycyBhbmQgY29tcG9uZW50cy5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGVzaWduSWQgLSBwYXRoIHRvIHJvb3QgY29udGFpbmVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoRGVzaWduU3RydWN0dXJlID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGRlc2lnbklkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaERlc2lnblN0cnVjdHVyZV8nICsgZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvb3RJZDogZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyczoge30sIC8vIGNvbnRhaW5lcjoge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIHBhcmVudElkOiA8c3RyaW5nPiwgdHlwZTogPHN0cmluZz4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHN1YkNvbnRhaW5lcnM6IHtpZDo8c3RyaW5nPjogPGNvbnRhaW5lcj59LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBjb21wb25lbnRzOiAgICB7aWQ6PHN0cmluZz46IDxjb250YWluZXI+fX1cclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiB7fSAgLy8gY29tcG9uZW50OiB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgcGFyZW50SWQ6IDxzdHJpbmc+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAsIGF2bUlkOiA8c3RyaW5nPiB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZ2V0Q29tcG9uZW50SW5mbyA9IGZ1bmN0aW9uIChub2RlLCBwYXJlbnRJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBub2RlLmdldElkKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudElkOiBwYXJlbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWQ6IG5vZGUuZ2V0QXR0cmlidXRlKCdJRCcpXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Db250YWluZXJSZWMgPSBmdW5jdGlvbiAoY29udGFpbmVyTm9kZSwgcm9vdENvbnRhaW5lciwgbWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3VwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjb250YWluZXJOb2RlLmdldElkKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY29udGFpbmVyTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBjb250YWluZXJOb2RlLmdldEF0dHJpYnV0ZSgnVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YkNvbnRhaW5lcnM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IHt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdENvbnRhaW5lci5zdWJDb250YWluZXJzW2NvbnRhaW5lck5vZGUuZ2V0SWQoKV0gPSBjb250YWluZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVyc1tjb250YWluZXJOb2RlLmdldElkKCldID0gY29udGFpbmVyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUNvbnRhaW5lclJlYyhjaGlsZE5vZGUsIGNvbnRhaW5lciwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50ID0gZ2V0Q29tcG9uZW50SW5mbyhjaGlsZE5vZGUsIGNvbnRhaW5lci5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmNvbXBvbmVudHNbY2hpbGROb2RlLmdldElkKCldID0gY29tcG9uZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tjaGlsZE5vZGUuZ2V0SWQoKV0gPSBjb21wb25lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tQ29udGFpbmVyUmVjKG5ld0NoaWxkLCBjb250YWluZXIsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJbY2hpbGROb2RlLmdldElkKCldID0gZ2V0Q29tcG9uZW50SW5mbyhjaGlsZE5vZGUsIGNvbnRhaW5lci5pZCk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY0RlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgZGVzaWduSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJvb3ROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdENvbnRhaW5lciA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHJvb3ROb2RlLmdldElkKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ1R5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViQ29udGFpbmVyczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IHt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb250YWluZXJzW3Jvb3RDb250YWluZXIuaWRdID0gcm9vdENvbnRhaW5lcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVyc1tyb290Q29udGFpbmVyLmlkXSA9IHJvb3RDb250YWluZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tQ29udGFpbmVyUmVjKGNoaWxkTm9kZSwgcm9vdENvbnRhaW5lciwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgPSBnZXRDb21wb25lbnRJbmZvKGNoaWxkTm9kZSwgcm9vdENvbnRhaW5lci5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RDb250YWluZXIuY29tcG9uZW50c1tjaGlsZE5vZGUuZ2V0SWQoKV0gPSBjb21wb25lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tjaGlsZE5vZGUuZ2V0SWQoKV0gPSBjb21wb25lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290Tm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Db250YWluZXJSZWMobmV3Q2hpbGQsIHJvb3RDb250YWluZXIsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdENvbnRhaW5lci5jb21wb25lbnRzW2NoaWxkTm9kZS5nZXRJZCgpXSA9IGdldENvbXBvbmVudEluZm8oY2hpbGROb2RlLCByb290Q29udGFpbmVyLmlkKTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4vL1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBnZW5lcmF0ZWQgRGVzZXJ0Q29uZmlndXJhdGlvblNldHMgaW5zaWRlIGEgRGVzaWduLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkZXNpZ25JZCAtIHBhdGggdG8gZGVzaWduIG9mIHdoaWNoIHRvIHdhdGNoLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoQ29uZmlndXJhdGlvblNldHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZGVzaWduSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29uZmlndXJhdGlvblNldHNfJyArIGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvblNldHM6IHt9IC8vY29uZmlndXJhdGlvblNldCB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+fVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bcmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIGRlc2lnbklkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkZXNpZ25Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubmFtZSA9IGRlc2lnbk5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbk5vZGUubG9hZENoaWxkcmVuKGNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY2hpbGROb2Rlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEuY29uZmlndXJhdGlvblNldHNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbmZpZ3VyYXRpb25TZXRzW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5jb25maWd1cmF0aW9uU2V0c1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGVzW2ldLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gY2hpbGROb2Rlc1tpXS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25maWd1cmF0aW9uU2V0c1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGVzW2ldLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBjaGlsZE5vZGVzW2ldLmdldEF0dHJpYnV0ZSgnSU5GTycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2Rlc1tpXS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGVzW2ldLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gbmV3Tm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25maWd1cmF0aW9uU2V0c1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdOb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdOb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Tm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgZ2VuZXJhdGVkIERlc2VydENvbmZpZ3VyYXRpb25zIGluc2lkZSBhIERlc2VydENvbmZpZ3VyYXRpb25TZXRzLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWd1cmF0aW9uU2V0SWQgLSBwYXRoIHRvIERlc2VydENvbmZpZ3VyYXRpb25TZXQgb2Ygd2hpY2ggdG8gd2F0Y2guXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBjb25maWd1cmF0aW9uU2V0SWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29uZmlndXJhdGlvbnNfJyArIGNvbmZpZ3VyYXRpb25TZXRJZCxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zOiB7fSAvL2NvbmZpZ3VyYXRpb24ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGFsdGVybmF0aXZlQXNzaWdubWVudHM6IDxzdHJpbmc+fVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bcmVnaW9uSWRdID0gY29udGV4dDtcclxuXHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBjb25maWd1cmF0aW9uU2V0SWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNmZ1NldE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnU2V0Tm9kZS5sb2FkQ2hpbGRyZW4oY29udGV4dClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3QWx0QXNzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0FsdGVybmF0aXZlQXNzaWdubWVudHMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEuY29uZmlndXJhdGlvbnNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbmZpZ3VyYXRpb25zW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdBbHRBc3MgIT09IGRhdGEuY29uZmlndXJhdGlvbnNbaWRdLmFsdGVybmF0aXZlQXNzaWdubWVudHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbmZpZ3VyYXRpb25zW2lkXS5hbHRlcm5hdGl2ZUFzc2lnbm1lbnRzID0gbmV3QWx0QXNzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YS5jb25maWd1cmF0aW9uc1tpZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbmZpZ3VyYXRpb25zW2lkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmNvbmZpZ3VyYXRpb25zW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkTm9kZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IGNoaWxkTm9kZXNbaV0uZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZXNbaV0uaXNNZXRhVHlwZU9mKG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29uZmlndXJhdGlvbnNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2Rlc1tpXS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiBjaGlsZE5vZGVzW2ldLmdldEF0dHJpYnV0ZSgnQWx0ZXJuYXRpdmVBc3NpZ25tZW50cycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2Rlc1tpXS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGVzW2ldLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2ZnU2V0Tm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gbmV3Tm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25maWd1cmF0aW9uc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdOb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlQXNzaWdubWVudHM6IG5ld05vZGUuZ2V0QXR0cmlidXRlKCdBbHRlcm5hdGl2ZUFzc2lnbm1lbnRzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld05vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY2hpbGRJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvbmZpZ3VyYXRpb25zW2NoaWxkSWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgZ2VuZXJhdGVkIERlc2VydENvbmZpZ3VyYXRpb25TZXRzIGluc2lkZSBhIERlc2lnbi5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29uZmlndXJhdGlvbiAtIENvbmZpZ3VyYXRpb24gb2Ygd2hpY2ggdG8gd2F0Y2guXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbmZpZ3VyYXRpb24uaWQgLSBwYXRoIHRvIENvbmZpZ3VyYXRpb24gb2Ygd2hpY2ggdG8gd2F0Y2guXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuYXBwZW5kV2F0Y2hSZXN1bHRzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGNvbmZpZ3VyYXRpb24pIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hSZXN1bHRzXycgKyBjb25maWd1cmF0aW9uLmlkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnJlZ2lvbklkID0gcmVnaW9uSWQ7XHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucmVzdWx0cyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIGNvbmZpZ3VyYXRpb24uaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNmZ05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZS5sb2FkQ2hpbGRyZW4oY29udGV4dClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc1Jlc3VsdHMgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5yZXN1bHRzW2lkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgY29uZmlndXJhdGlvbi5yZXN1bHRzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gY2hpbGROb2Rlc1tpXS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2Rlc1tpXS5pc01ldGFUeXBlT2YobWV0YS5SZXN1bHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnJlc3VsdHNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL25hbWU6IGNoaWxkTm9kZXNbaV0uZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jaGlsZE5vZGVzW2ldLm9uVXBkYXRlKG9uVXBkYXRlKTsgVE9ETzogV2hlbiBhdHRyaWJ1dGVzIGFyZSB3YXRjaCBhZGQgdGhpcy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZXNbaV0ub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzUmVzdWx0cyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNmZ05vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Tm9kZS5pc01ldGFUeXBlT2YobWV0YS5SZXN1bHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gbmV3Tm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucmVzdWx0c1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShoYXNSZXN1bHRzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbFNhdmVEZXNlcnRDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uIChjb250ZXh0LCBzZXROYW1lLCBzZXREZXNjLCBjb25maWd1cmF0aW9ucywgZGVzaWduSWQpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlOiBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgICAgICBydW5PblNlcnZlcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldERhdGE6IGFuZ3VsYXIudG9Kc29uKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHNldE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogc2V0RGVzYyB8fCAnJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IGFuZ3VsYXIudG9Kc29uKGNvbmZpZ3VyYXRpb25zKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLnJ1blBsdWdpbihjb250ZXh0LCAnU2F2ZURlc2VydENvbmZpZ3VyYXRpb25zJywgY29uZmlnKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdTb21ldGhpbmcgd2VudCB0ZXJyaWJseSB3cm9uZywgJyArIHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2F2ZUNvbmZpZ3VyYXRpb25TZXQgPSBmdW5jdGlvbiAoc2V0TmFtZSwgc2V0RGVzYywgY29uZmlndXJhdGlvbnMsIGRlc2lnbk5vZGUsIG1ldGEpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBkZXNpZ25Ob2RlLmNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmNyZWF0ZU5vZGUoY29udGV4dCwgZGVzaWduTm9kZSwgbWV0YS5EZXNlcnRDb25maWd1cmF0aW9uU2V0LCAnd2ViLWN5cGh5IHNhdmVDb25maWd1cmF0aW9uU2V0JylcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChzZXROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvdW50ZXIgPSBjb25maWd1cmF0aW9ucy5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbmZpZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjZmdOb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UuY3JlYXRlTm9kZShjb250ZXh0LCBzZXROb2RlLCBtZXRhLkRlc2VydENvbmZpZ3VyYXRpb24sICd3ZWItY3lwaHkgc2F2ZUNvbmZpZ3VyYXRpb25TZXQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChuZXdOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuYW1lID0gY29uZmlndXJhdGlvbnNbY291bnRlcl0ubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZSA9IG5ld05vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjZmdOb2RlLnNldEF0dHJpYnV0ZSgnbmFtZScsIG5hbWUsICd3ZWItY3lwaHkgc2V0IG5hbWUgdG8gJyArIG5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWFTdHIgPSBKU09OLnN0cmluZ2lmeShjb25maWd1cmF0aW9uc1tjb3VudGVyXS5hbHRlcm5hdGl2ZUFzc2lnbm1lbnRzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNmZ05vZGUuc2V0QXR0cmlidXRlKCdBbHRlcm5hdGl2ZUFzc2lnbm1lbnRzJywgYWFTdHIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3dlYi1jeXBoeSBzZXQgQWx0ZXJuYXRpdmVBc3NpZ25tZW50cyB0byAnICsgYWFTdHIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY291bnRlciA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbmZpZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ1Byb2JsZW1zIGNyZWF0aW5nIGNvbmZpZ3VyYXRpb25zIG5vZGVzJyArIHJlYXNvbi50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNldE5vZGUuc2V0QXR0cmlidXRlKCduYW1lJywgc2V0TmFtZSwgJ3dlYi1jeXBoeSBzZXQgbmFtZSB0byAnICsgc2V0TmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNldERlc2MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXROb2RlLnNldEF0dHJpYnV0ZSgnSU5GTycsIHNldERlc2MsICd3ZWItY3lwaHkgc2V0IElORk8gdG8gJyArIHNldERlc2MpLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3VudGVyID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbmZpZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ05vIGNvbmZpZ3VyYXRpb25zIGdpdmVuIScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbmZpZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnTm8gY29uZmlndXJhdGlvbnMgZ2l2ZW4hJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwUmVnaW9uID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHJlZ2lvbklkKSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgcmVnaW9uSWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlci5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBmbikge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgZm4pO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgV2ViR01FR2xvYmFsLCBjb25zb2xlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgnZXhlY3V0b3JTZXJ2aWNlJywgZnVuY3Rpb24gKCRxKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBleGVjdXRvckNsaWVudCA9IG5ldyBXZWJHTUVHbG9iYWwuY2xhc3Nlcy5FeGVjdXRvckNsaWVudCgpO1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZUpvYiA9IGZ1bmN0aW9uIChqb2JEYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGV4ZWN1dG9yQ2xpZW50LmNyZWF0ZUpvYihqb2JEYXRhLCBmdW5jdGlvbiAoZXJyLCBqb2JJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoam9iSW5mbyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRJbmZvID0gZnVuY3Rpb24gKGpvYkhhc2gpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgZXhlY3V0b3JDbGllbnQuZ2V0SW5mbyhqb2JIYXNoLCBmdW5jdGlvbiAoZXJyLCBqb2JJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoam9iSW5mbyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRXb3JrZXJzSW5mbyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgZXhlY3V0b3JDbGllbnQuZ2V0V29ya2Vyc0luZm8oZnVuY3Rpb24gKGVyciwgcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBXZWJHTUVHbG9iYWwsIGNvbnNvbGUqL1xyXG5cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgnZmlsZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHEpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBibG9iQ2xpZW50ID0gbmV3IFdlYkdNRUdsb2JhbC5jbGFzc2VzLkJsb2JDbGllbnQoKTtcclxuXHJcbiAgICAgICAgLy9UT0RPOiBDb25zaWRlciBtYWtpbmcgYW4gQXJ0aWZhY3QgJ0NsYXNzJy5cclxuICAgICAgICB0aGlzLmNyZWF0ZUFydGlmYWN0ID0gZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJsb2JDbGllbnQuY3JlYXRlQXJ0aWZhY3QobmFtZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zYXZlQXJ0aWZhY3QgPSBmdW5jdGlvbiAoYXJ0aWZhY3QpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgYXJ0aWZhY3Quc2F2ZShmdW5jdGlvbiAoZXJyLCBhcnRpZUhhc2gpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShhcnRpZUhhc2gpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0QXJ0aWZhY3QgPSBmdW5jdGlvbiAoaGFzaCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBibG9iQ2xpZW50LmdldEFydGlmYWN0KGhhc2gsIGZ1bmN0aW9uIChlcnIsIGFydGlmYWN0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7YXJ0aWZhY3Q6IGFydGlmYWN0LCBoYXNoOiBoYXNofSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEZpbGVUb0FydGlmYWN0ID0gZnVuY3Rpb24gKGFydGlmYWN0LCBmaWxlTmFtZSwgY29udGVudCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBhcnRpZmFjdC5hZGRGaWxlKGZpbGVOYW1lLCBjb250ZW50LCBmdW5jdGlvbiAoZXJyLCBoYXNoZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShoYXNoZXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFkZHMgbXVsdGlwbGUgZmlsZXMgdG8gZ2l2ZW4gYXJ0aWZhY3QuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5hZGRGaWxlc1RvQXJ0aWZhY3QgPSBmdW5jdGlvbiAoYXJ0aWZhY3QsIGZpbGVzKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGFydGlmYWN0LmFkZEZpbGVzKGZpbGVzLCBmdW5jdGlvbiAoZXJyLCBoYXNoZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShoYXNoZXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYWRkRmlsZUFzU29mdExpbmtUb0FydGlmYWN0ID0gZnVuY3Rpb24gKGFydGlmYWN0LCBmaWxlTmFtZSwgY29udGVudCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICAgICAgYXJ0aWZhY3QuYWRkRmlsZUFzU29mdExpbmsoZmlsZU5hbWUsIGNvbnRlbnQsIGZ1bmN0aW9uIChlcnIsIGhhc2gpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShoYXNoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmdldE1ldGFkYXRhID0gZnVuY3Rpb24gKGhhc2gpIHtcclxuLy8gICAgICAgIEV4YW1wbGUgb2YgcmV0dXJuZWQgZGF0YS5cclxuLy8gICAgICAgIHtcclxuLy8gICAgICAgICAgICBcIm5hbWVcIjogXCJ0YkFzc2V0LnppcFwiLFxyXG4vLyAgICAgICAgICAgIFwic2l6ZVwiOiAxMDM4NTQsXHJcbi8vICAgICAgICAgICAgXCJtaW1lXCI6IFwiYXBwbGljYXRpb24vemlwXCIsXHJcbi8vICAgICAgICAgICAgXCJpc1B1YmxpY1wiOiBmYWxzZSxcclxuLy8gICAgICAgICAgICBcInRhZ3NcIjogW10sXHJcbi8vICAgICAgICAgICAgXCJjb250ZW50XCI6IFwiMjM1N2ZiZDY3M2JlYzZlOTU5MGVlOGJhMzRlYzhkZjhhODVkZGFmOFwiLFxyXG4vLyAgICAgICAgICAgIFwiY29udGVudFR5cGVcIjogXCJvYmplY3RcIixcclxuLy8gICAgICAgICAgICBcImxhc3RNb2RpZmllZFwiOiBcIjIwMTQtMTEtMDlUMDA6MjE6MjIuMDAwWlwiXHJcbi8vICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGJsb2JDbGllbnQuZ2V0TWV0YWRhdGEoaGFzaCwgZnVuY3Rpb24gKGVyciwgbWV0YURhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShtZXRhRGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRPYmplY3QgPSBmdW5jdGlvbiAoaGFzaCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBibG9iQ2xpZW50LmdldE9iamVjdChoYXNoLCBmdW5jdGlvbiAoZXJyLCBjb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoY29udGVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZG93bmxvYWQgdXJsIGZvciB0aGUgZ2l2ZW4gaGFzaC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaGFzaCAtIGhhc2ggdG8gYmxvYiBmaWxlLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gdGhlIGRvd25sb2FkIHVybCAobnVsbCBpZiBoYXNoIGlzIGVtcHR5KS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmdldERvd25sb2FkVXJsID0gZnVuY3Rpb24gKGhhc2gpIHtcclxuICAgICAgICAgICAgdmFyIHVybDtcclxuICAgICAgICAgICAgaWYgKGhhc2gpIHtcclxuICAgICAgICAgICAgICAgIHVybCA9IGJsb2JDbGllbnQuZ2V0RG93bmxvYWRVUkwoaGFzaCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIGhhc2ggdG8gYmxvYiBmaWxlIGdpdmVuJyk7XHJcbiAgICAgICAgICAgICAgICB1cmwgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIGZpbGUgZXh0ZW5zaW9uIG9mIHRoZSBnaXZlbiBmaWxlbmFtZS5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZW5hbWVcclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIHRoZSByZXN1bHRpbmcgZmlsZSBleHRlbnNpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5nZXRGaWxlRXh0ZW5zaW9uID0gZnVuY3Rpb24gKGZpbGVuYW1lKSB7XHJcbiAgICAgICAgICAgIHZhciBhID0gZmlsZW5hbWUuc3BsaXQoXCIuXCIpO1xyXG4gICAgICAgICAgICBpZiAoYS5sZW5ndGggPT09IDEgfHwgKGFbMF0gPT09IFwiXCIgJiYgYS5sZW5ndGggPT09IDIpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYS5wb3AoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZvcm1hdHMgdGhlIHNpemUgaW50byBhIGh1bWFuIHJlYWRhYmxlIHN0cmluZy5cclxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gYnl0ZXMgLSBzaXplIGluIGJ5dGVzLlxyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2kgLSByZXR1cm4gcmVzdWx0IGluIFNJVW5pdHMgb3Igbm90LlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gZm9ybWF0dGVkIGZpbGUgc2l6ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmh1bWFuRmlsZVNpemUgPSBmdW5jdGlvbiAoYnl0ZXMsIHNpKSB7XHJcbiAgICAgICAgICAgIHZhciB0aHJlc2ggPSBzaSA/IDEwMDAgOiAxMDI0LFxyXG4gICAgICAgICAgICAgICAgdW5pdHMsXHJcbiAgICAgICAgICAgICAgICB1O1xyXG4gICAgICAgICAgICBpZiAoYnl0ZXMgPCB0aHJlc2gpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBieXRlcyArICcgQic7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVuaXRzID0gc2kgPyBbJ2tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJywgJ0VCJywgJ1pCJywgJ1lCJ10gOlxyXG4gICAgICAgICAgICAgICAgICAgIFsnS2lCJywgJ01pQicsICdHaUInLCAnVGlCJywgJ1BpQicsICdFaUInLCAnWmlCJywgJ1lpQiddO1xyXG4gICAgICAgICAgICB1ID0gLTE7XHJcblxyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBieXRlcyA9IGJ5dGVzIC8gdGhyZXNoO1xyXG4gICAgICAgICAgICAgICAgdSArPSAxO1xyXG4gICAgICAgICAgICB9IHdoaWxlIChieXRlcyA+PSB0aHJlc2gpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGJ5dGVzLnRvRml4ZWQoMSkgKyAnICcgKyB1bml0c1t1XTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBXZWJDeVBoeVNwZWNpZmljIGZ1bmN0aW9ucy5cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVE9ETzogVGhpcyBtZXRob2Qgc2hvdWxkIHVzZSBwcm9taXNlcyBpbnRlcm5hbGx5IVxyXG4gICAgICAgICAqIEBwYXJhbSBmaWxlc1xyXG4gICAgICAgICAqIEBwYXJhbSB2YWxpZEV4dGVuc2lvbnNcclxuICAgICAgICAgKiBAcmV0dXJucyB7Kn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnNhdmVEcm9wcGVkRmlsZXMgPSBmdW5jdGlvbiAoZmlsZXMsIHZhbGlkRXh0ZW5zaW9ucykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgaSxcclxuICAgICAgICAgICAgICAgIGNvdW50ZXIgPSBmaWxlcy5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICBhcnRpZSA9IGJsb2JDbGllbnQuY3JlYXRlQXJ0aWZhY3QoJ2Ryb3BwZWRGaWxlcycpLFxyXG4gICAgICAgICAgICAgICAgYWRkRmlsZSxcclxuICAgICAgICAgICAgICAgIGFkZGVkRmlsZXMgPSBbXSxcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvdW50ZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3VudGVyIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShhZGRlZEZpbGVzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY291bnRlciA9IGZpbGVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGFkZEZpbGUgPSBmdW5jdGlvbiAoZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpbGVFeHRlbnNpb24gPSBzZWxmLmdldEZpbGVFeHRlbnNpb24oZmlsZS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIGlmICghdmFsaWRFeHRlbnNpb25zIHx8IHZhbGlkRXh0ZW5zaW9uc1tmaWxlRXh0ZW5zaW9uXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFydGllLmFkZEZpbGVBc1NvZnRMaW5rKGZpbGUubmFtZSwgZmlsZSwgZnVuY3Rpb24gKGVyciwgaGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgYWRkIGZpbGUgXCInICsgZmlsZS5uYW1lICsgJ1wiIHRvIGJsb2IsIGVycjogJyArIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkZWRGaWxlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc2g6IGhhc2gsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBmaWxlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBmaWxlRXh0ZW5zaW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogc2VsZi5odW1hbkZpbGVTaXplKGZpbGUuc2l6ZSwgdHJ1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGJsb2JDbGllbnQuZ2V0RG93bmxvYWRVUkwoaGFzaClcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNvdW50ZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ291bnRlcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGFkZEZpbGUoZmlsZXNbaV0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIFdlYkdNRUdsb2JhbCwgY29uc29sZSovXHJcblxyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCdwbHVnaW5TZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCBkYXRhU3RvcmVTZXJ2aWNlLCBmaWxlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dFxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBsdWdpbk5hbWUgLSBOYW1lIG9mIHBsdWdpbiB0byBleGVjdXRlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSBPYmplY3Qgd2l0aCBwbHVnaW4gY29uZmlndXJhdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC5zdHJpbmd9IGNvbmZpZy5hY3RpdmVOb2RlIC0gUGF0aCB0byBhY3RpdmVOb2RlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LkFycmF5LjxzdHJpbmc+fSBjb25maWcuYWN0aXZlU2VsZWN0aW9uIC0gUGF0aHMgdG8gbm9kZXMgaW4gYWN0aXZlU2VsZWN0aW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LmJvb2xlYW59IGNvbmZpZy5ydW5PblNlcnZlciAtIFdoZXRoZXIgdG8gcnVuIHRoZSBwbHVnaW4gb24gdGhlIHNlcnZlciBvciBub3QuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3Qub2JqZWN0fSBjb25maWcucGx1Z2luQ29uZmlnIC0gUGx1Z2luIHNwZWNpZmljIG9wdGlvbnMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5ydW5QbHVnaW4gPSBmdW5jdGlvbiAoY29udGV4dCwgcGx1Z2luTmFtZSwgY29uZmlnKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBkYkNvbm4gPSBkYXRhU3RvcmVTZXJ2aWNlLmdldERhdGFiYXNlQ29ubmVjdGlvbihjb250ZXh0LmRiKSxcclxuICAgICAgICAgICAgICAgIGludGVycHJldGVyTWFuYWdlciA9IG5ldyBXZWJHTUVHbG9iYWwuY2xhc3Nlcy5JbnRlcnByZXRlck1hbmFnZXIoZGJDb25uLmNsaWVudCk7XHJcblxyXG4gICAgICAgICAgICBpbnRlcnByZXRlck1hbmFnZXIucnVuKHBsdWdpbk5hbWUsIGNvbmZpZywgZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdObyBSZXN1bHQgd2FzIHJldHVybiBmcm9tIHBsdWdpbiBleGVjdXRpb24hJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRQbHVnaW5BcnRpZmFjdHNIdG1sID0gZnVuY3Rpb24gKGFydGllSGFzaGVzKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgIGk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYXJ0aWVIYXNoZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKGZpbGVTZXJ2aWNlLmdldEFydGlmYWN0KGFydGllSGFzaGVzW2ldKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCcnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKGFydGlmYWN0c0luZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG93bmxvYWRVcmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFydGllTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWZhY3RzSHRtbCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBhcnRpZmFjdHNJbmZvLmxlbmd0aDsgaiArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvd25sb2FkVXJsID0gZmlsZVNlcnZpY2UuZ2V0RG93bmxvYWRVcmwoYXJ0aWZhY3RzSW5mb1tqXS5oYXNoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWVOYW1lID0gYXJ0aWZhY3RzSW5mb1tqXS5hcnRpZmFjdC5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnRpZmFjdHNIdG1sICs9ICc8YnI+IDxhIGhyZWY9XCInICsgZG93bmxvYWRVcmwgKyAnXCI+JyArIGFydGllTmFtZSArICc8L2E+JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShhcnRpZmFjdHNIdG1sKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ3Rlc3RCZW5jaFNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsICR0aW1lb3V0LCAkbW9kYWwsIG5vZGVTZXJ2aWNlLCBiYXNlQ3lQaHlTZXJ2aWNlLCBwbHVnaW5TZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgd2F0Y2hlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgdGhpcy5lZGl0VGVzdEJlbmNoRm4gPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1Rlc3RCZW5jaEVkaXQuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVGVzdEJlbmNoRWRpdENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgLy9zaXplOiBzaXplLFxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZTogeyBkYXRhOiBmdW5jdGlvbiAoKSB7IHJldHVybiBkYXRhOyB9IH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uIChlZGl0ZWREYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYXR0cnMgPSB7IH07XHJcbiAgICAgICAgICAgICAgICBpZiAoZWRpdGVkRGF0YS5kZXNjcmlwdGlvbiAhPT0gZGF0YS50ZXN0QmVuY2guZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRycy5JTkZPID0gZWRpdGVkRGF0YS5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChlZGl0ZWREYXRhLm5hbWUgIT09IGRhdGEudGVzdEJlbmNoLnRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnMubmFtZSA9IGVkaXRlZERhdGEubmFtZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChlZGl0ZWREYXRhLmZpbGVJbmZvLmhhc2ggIT09IGRhdGEudGVzdEJlbmNoLmRhdGEuZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRycy5UZXN0QmVuY2hGaWxlcyA9IGVkaXRlZERhdGEuZmlsZUluZm8uaGFzaDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChlZGl0ZWREYXRhLnBhdGggIT09IGRhdGEudGVzdEJlbmNoLmRhdGEucGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJzLklEID0gZWRpdGVkRGF0YS5wYXRoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0VGVzdEJlbmNoQXR0cmlidXRlcyhkYXRhLmVkaXRDb250ZXh0LCBkYXRhLmlkLCBhdHRycylcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBdHRyaWJ1dGUocykgdXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZGVsZXRlRm4gPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1NpbXBsZU1vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NpbXBsZU1vZGFsQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUgVGVzdCBCZW5jaCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiAnVGhpcyB3aWxsIGRlbGV0ZSAnICsgZGF0YS5uYW1lICsgJyBmcm9tIHRoZSB3b3Jrc3BhY2UuJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZGVsZXRlVGVzdEJlbmNoKGRhdGEuY29udGV4dCwgZGF0YS5pZCk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgdGVzdCBiZW5jaCBmcm9tIHRoZSBjb250ZXh0LlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gZGF0YS1iYXNlIGNvbm5lY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHRlc3RCZW5jaElkIC0gUGF0aCB0byBkZXNpZ24tc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIFttc2ddIC0gQ29tbWl0IG1lc3NhZ2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5kZWxldGVUZXN0QmVuY2ggPSBmdW5jdGlvbiAoY29udGV4dCwgdGVzdEJlbmNoSWQsIG1zZykge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG1zZyB8fCAndGVzdEJlbmNoU2VydmljZS5kZWxldGVUZXN0QmVuY2ggJyArIHRlc3RCZW5jaElkO1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5kZXN0cm95Tm9kZShjb250ZXh0LCB0ZXN0QmVuY2hJZCwgbWVzc2FnZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5leHBvcnRUZXN0QmVuY2ggPSBmdW5jdGlvbiAodGVzdEJlbmNoSWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQuJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlcyB0aGUgZ2l2ZW4gYXR0cmlidXRlc1xyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIHRlc3QgYmVuY2guXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgdGVzdCBiZW5jaC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5yZWdpb25JZCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSB0ZXN0IGJlbmNoLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXN0QmVuY2hJZCAtIFBhdGggdG8gdGVzdCBiZW5jaC5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gYXR0cnMgLSBLZXlzIGFyZSBuYW1lcyBvZiBhdHRyaWJ1dGVzIGFuZCB2YWx1ZXMgYXJlIHRoZSB3YW50ZWQgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zZXRUZXN0QmVuY2hBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGNvbnRleHQsIHRlc3RCZW5jaElkLCBhdHRycykge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS5zZXROb2RlQXR0cmlidXRlcyhjb250ZXh0LCB0ZXN0QmVuY2hJZCwgYXR0cnMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMucnVuVGVzdEJlbmNoID0gZnVuY3Rpb24gKGNvbnRleHQsIHRlc3RCZW5jaElkLCBjb25maWd1cmF0aW9uSWQpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlOiB0ZXN0QmVuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICBydW5PblNlcnZlcjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5Db25maWc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uUGF0aDogY29uZmlndXJhdGlvbklkXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShjb25maWcpKTtcclxuICAgICAgICAgICAgcGx1Z2luU2VydmljZS5ydW5QbHVnaW4oY29udGV4dCwgJ1Rlc3RCZW5jaFJ1bm5lcicsIGNvbmZpZylcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0TGlnaHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHJlc3VsdC5zdWNjZXNzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnRpZmFjdHNIdG1sOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXM6IHJlc3VsdC5tZXNzYWdlc1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZXN1bHRcIiwgcmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLmdldFBsdWdpbkFydGlmYWN0c0h0bWwocmVzdWx0LmFydGlmYWN0cylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGFydGlmYWN0c0h0bWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdExpZ2h0LmFydGlmYWN0c0h0bWwgPSBhcnRpZmFjdHNIdG1sO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHRMaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdTb21ldGhpbmcgd2VudCB0ZXJyaWJseSB3cm9uZywgJyArIHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMud2F0Y2hUZXN0QmVuY2hOb2RlID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHRlc3RCZW5jaElkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaFRlc3RCZW5jaCcsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGE6IG51bGwsIC8vIE1FVEEgbm9kZXMgLSBuZWVkZWQgd2hlbiBjcmVhdGluZyBuZXcgbm9kZXMuLi5cclxuICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2g6IHt9IC8vIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz4sIG5vZGUgPE5vZGVPYmo+fVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdSZXN1bHRzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1Jlc3VsdHMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RmlsZXMgPSB0aGlzLmdldEF0dHJpYnV0ZSgnVGVzdEJlbmNoRmlsZXMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VGxzdXQgPSB0aGlzLmdldFBvaW50ZXIoJ1RvcExldmVsU3lzdGVtVW5kZXJUZXN0JykudG8sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGxzdXRDaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEudGVzdEJlbmNoLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2gubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS50ZXN0QmVuY2guZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2guZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BhdGggIT09IGRhdGEudGVzdEJlbmNoLnBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2gucGF0aCA9IG5ld1BhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UmVzdWx0cyAhPT0gZGF0YS50ZXN0QmVuY2gucmVzdWx0cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaC5yZXN1bHRzID0gbmV3UmVzdWx0cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdGaWxlcyAhPT0gZGF0YS50ZXN0QmVuY2guZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2guZmlsZXMgPSBuZXdGaWxlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdUbHN1dCAhPT0gZGF0YS50ZXN0QmVuY2gudGxzdXRJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaC50bHN1dElkID0gbmV3VGxzdXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0bHN1dENoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YS50ZXN0QmVuY2gsIHRsc3V0Q2hhbmdlZDogdGxzdXRDaGFuZ2VkfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHRlc3RCZW5jaElkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh0ZXN0QmVuY2hOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubWV0YSA9IG1ldGE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRlc3RCZW5jaElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGVzdEJlbmNoTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0ZXN0QmVuY2hOb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogdGVzdEJlbmNoTm9kZS5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiB0ZXN0QmVuY2hOb2RlLmdldEF0dHJpYnV0ZSgnUmVzdWx0cycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IHRlc3RCZW5jaE5vZGUuZ2V0QXR0cmlidXRlKCdUZXN0QmVuY2hGaWxlcycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGxzdXRJZDogdGVzdEJlbmNoTm9kZS5nZXRQb2ludGVyKCdUb3BMZXZlbFN5c3RlbVVuZGVyVGVzdCcpLnRvLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogdGVzdEJlbmNoTm9kZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hOb2RlLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYWxsIHRlc3QtYmVuY2hlcyAoZXhpc3RlbmNlIGFuZCB0aGVpciBhdHRyaWJ1dGVzKSBvZiBhIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWQgLSBQYXRoIHRvIHdvcmtzcGFjZSB0aGF0IHNob3VsZCBiZSB3YXRjaGVkLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS4gRGF0YSBpcyBhbiBvYmplY3QgaW4gZGF0YS50ZXN0QmVuY2hlcy5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoVGVzdEJlbmNoZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoVGVzdEJlbmNoZXMnLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6IHBhcmVudENvbnRleHQucHJvamVjdElkLFxyXG4gICAgICAgICAgICAgICAgICAgIGJyYW5jaElkOiBwYXJlbnRDb250ZXh0LmJyYW5jaElkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaGVzOiB7fSAvLyB0ZXN0QmVuY2gge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICBwYXRoOiA8c3RyaW5nPiwgcmVzdWx0czogPGhhc2h8c3RyaW5nPiwgZmlsZXM6IDxoYXNofHN0cmluZz4gfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdSZXN1bHRzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1Jlc3VsdHMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RmlsZXMgPSB0aGlzLmdldEF0dHJpYnV0ZSgnVGVzdEJlbmNoRmlsZXMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLnRlc3RCZW5jaGVzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlc2MgIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbaWRdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQYXRoICE9PSBkYXRhLnRlc3RCZW5jaGVzW2lkXS5wYXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbaWRdLnBhdGggPSBuZXdQYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1Jlc3VsdHMgIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLnJlc3VsdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0ucmVzdWx0cyA9IG5ld1Jlc3VsdHM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RmlsZXMgIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLmZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbaWRdLmZpbGVzID0gbmV3RmlsZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YS50ZXN0QmVuY2hlc1tpZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEudGVzdEJlbmNoZXNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoZm9sZGVyTm9kZSwgbWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1UZXN0QmVuY2hNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hJZCA9IGNoaWxkTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbdGVzdEJlbmNoSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGVzdEJlbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnUmVzdWx0cycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVGVzdEJlbmNoRmlsZXMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaElkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW3Rlc3RCZW5jaElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRlc3RCZW5jaElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnUmVzdWx0cycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdUZXN0QmVuY2hGaWxlcycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiB0ZXN0QmVuY2hJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLnRlc3RCZW5jaGVzW3Rlc3RCZW5jaElkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhIHRlc3QtYmVuY2ggdy5yLnQuIGludGVyZmFjZXMuXHJcbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHRlc3RCZW5jaElkXHJcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoVGVzdEJlbmNoRGV0YWlscyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB0ZXN0QmVuY2hJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hUZXN0QmVuY2hEZXRhaWxzXycgKyB0ZXN0QmVuY2hJZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVySWRzOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICB0bHN1dDogbnVsbFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gZGF0YS5jb250YWluZXJJZHMuaW5kZXhPZihpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb250YWluZXJJZHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgdGVzdEJlbmNoSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHRlc3RCZW5jaE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoTm9kZS5sb2FkQ2hpbGRyZW4oKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbltpXS5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbnRhaW5lcklkcy5wdXNoKGNoaWxkcmVuW2ldLmdldElkKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5baV0ub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb250YWluZXJJZHMucHVzaChuZXdDaGlsZC5nZXRJZCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYSB0ZXN0LWJlbmNoIHcuci50LiBpbnRlcmZhY2VzLlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSBjb250YWluZXJJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaEludGVyZmFjZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgY29udGFpbmVySWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLndhdGNoSW50ZXJmYWNlcyh3YXRjaGVycywgcGFyZW50Q29udGV4dCwgY29udGFpbmVySWQsIHVwZGF0ZUxpc3RlbmVyKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucy5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBBbGxSZWdpb25zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQpIHtcclxuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyh3YXRjaGVycywgcGFyZW50Q29udGV4dCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBSZWdpb24gPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgcmVnaW9uSWQpIHtcclxuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCByZWdpb25JZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJXYXRjaGVyID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGZuKSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBmbik7XHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgnd29ya3NwYWNlU2VydmljZScsIGZ1bmN0aW9uICgkcSwgJHRpbWVvdXQsIG5vZGVTZXJ2aWNlLCBiYXNlQ3lQaHlTZXJ2aWNlLCBwbHVnaW5TZXJ2aWNlLCBmaWxlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIHdhdGNoZXJzID0ge307XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlV29ya3NwYWNlID0gZnVuY3Rpb24gKGNvbnRleHQsIG5hbWUsIGRlc2MpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIG1ldGE7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG1ldGFOb2Rlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGEgPSBtZXRhTm9kZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVTZXJ2aWNlLmNyZWF0ZU5vZGUoY29udGV4dCwgJycsIG1ldGEuV29ya1NwYWNlLCAnW1dlYkN5UGh5XSAtIFdvcmtzcGFjZVNlcnZpY2UuY3JlYXRlV29ya3NwYWNlJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdzTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhY21Gb2xkZXJJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRtRm9sZGVySWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0bUZvbGRlcklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVGb2xkZXJOb2RlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnRJZCA9IHdzTm9kZS5nZXRJZCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VJZCA9IG1ldGEuQUNNRm9sZGVyLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5jcmVhdGVOb2RlKGNvbnRleHQsIHBhcmVudElkLCBiYXNlSWQsICdbV2ViQ3lQaHldIC0gY3JlYXRlIEFDTUZvbGRlcicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGFjbU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNtRm9sZGVySWQgPSBhY21Ob2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VJZCA9IG1ldGEuQURNRm9sZGVyLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlU2VydmljZS5jcmVhdGVOb2RlKGNvbnRleHQsIHBhcmVudElkLCBiYXNlSWQsICdbV2ViQ3lQaHldIC0gY3JlYXRlIEFETUZvbGRlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGFkbU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRtRm9sZGVySWQgPSBhZG1Ob2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VJZCA9IG1ldGEuQVRNRm9sZGVyLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlU2VydmljZS5jcmVhdGVOb2RlKGNvbnRleHQsIHBhcmVudElkLCBiYXNlSWQsICdbV2ViQ3lQaHldIC0gY3JlYXRlIEFUTUZvbGRlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGF0bU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXRtRm9sZGVySWQgPSBhdG1Ob2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoeyBhY206IGFjbUZvbGRlcklkLCBhZG06IGFkbUZvbGRlcklkLCBhdG06IGF0bUZvbGRlcklkIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdzTm9kZS5zZXRBdHRyaWJ1dGUoJ25hbWUnLCBuYW1lLCAnW1dlYkN5UGh5XSAtIHNldCBuYW1lIHRvICcgKyBuYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVzYykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdzTm9kZS5zZXRBdHRyaWJ1dGUoJ0lORk8nLCBkZXNjLCAnW1dlYkN5UGh5XSAtIHNldCBJTkZPIHRvICcgKyBkZXNjKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVGb2xkZXJOb2RlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRm9sZGVyTm9kZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5pbXBvcnRGaWxlcyA9IGZ1bmN0aW9uIChjb250ZXh0LCBmb2xkZXJJZHMsIGZpbGVzKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBpLFxyXG4gICAgICAgICAgICAgICAgY291bnRlcixcclxuICAgICAgICAgICAgICAgIHRvdGFsLFxyXG4gICAgICAgICAgICAgICAgZnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWNtczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgYWRtczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgYXRtczogW11cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBpbXBvcnRBY21SZWMsXHJcbiAgICAgICAgICAgICAgICBpbXBvcnRBZG1SZWMsXHJcbiAgICAgICAgICAgICAgICBpbXBvcnRBdG1SZWMsXHJcbiAgICAgICAgICAgICAgICBnZXROb3RpZnk7XHJcblxyXG4gICAgICAgICAgICBpbXBvcnRBY21SZWMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb3VudGVyIC09IDE7XHJcbiAgICAgICAgICAgICAgICBpZiAoY291bnRlciA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jYWxsQWNtSW1wb3J0ZXIoY29udGV4dCwgZm9sZGVySWRzLmFjbSwgZnMuYWNtc1tjb3VudGVyXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZ2V0Tm90aWZ5KGZzLmFjbXNbY291bnRlcl0sICdhY20nKSwgZ2V0Tm90aWZ5KGZzLmFjbXNbY291bnRlcl0pLCAnYWNtJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsID0gZnMuYWRtcy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRlciA9IHRvdGFsO1xyXG4gICAgICAgICAgICAgICAgICAgIGltcG9ydEFkbVJlYygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpbXBvcnRBZG1SZWMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb3VudGVyIC09IDE7XHJcbiAgICAgICAgICAgICAgICBpZiAoY291bnRlciA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jYWxsQWRtSW1wb3J0ZXIoY29udGV4dCwgZm9sZGVySWRzLmFkbSwgZnMuYWRtc1tjb3VudGVyXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZ2V0Tm90aWZ5KGZzLmFkbXNbY291bnRlcl0sICdhZG0nKSwgZ2V0Tm90aWZ5KGZzLmFkbXNbY291bnRlcl0pLCAnYWRtJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsID0gZnMuYXRtcy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRlciA9IHRvdGFsO1xyXG4gICAgICAgICAgICAgICAgICAgIGltcG9ydEF0bVJlYygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpbXBvcnRBdG1SZWMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb3VudGVyIC09IDE7XHJcbiAgICAgICAgICAgICAgICBpZiAoY291bnRlciA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jYWxsQXRtSW1wb3J0ZXIoY29udGV4dCwgZm9sZGVySWRzLmF0bSwgZnMuYXRtc1tjb3VudGVyXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZ2V0Tm90aWZ5KGZzLmF0bXNbY291bnRlcl0sICdhdG0nKSwgZ2V0Tm90aWZ5KGZzLmF0bXNbY291bnRlcl0sICdhdG0nKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZ2V0Tm90aWZ5ID0gZnVuY3Rpb24gKGZJbmZvLCB0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHJlc3VsdCkgPT09IGZhbHNlICYmIHJlc3VsdC5zdWNjZXNzID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLm5vdGlmeSh7dHlwZTogJ3N1Y2Nlc3MnLCBtZXNzYWdlOiAnPGEgaHJlZj1cIicgKyBmSW5mby51cmwgKyAnXCI+JyArIGZJbmZvLm5hbWUgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvYT4nICsgJyBpbXBvcnRlZC4gJyArICdbJyArICh0b3RhbCAtIGNvdW50ZXIpICsgJy8nICsgdG90YWwgKyAnXSd9KTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoe3R5cGU6ICdlcnJvcicsIG1lc3NhZ2U6ICc8YSBocmVmPVwiJyArIGZJbmZvLnVybCArICdcIj4nICsgZkluZm8ubmFtZSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9hPicgKyAnIGZhaWxlZCB0byBiZSBpbXBvcnRlZCwgc2VlIGNvbnNvbGUgZGV0YWlscy4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbJyArICh0b3RhbCAtIGNvdW50ZXIpICsgJy8nICsgdG90YWwgKyAnXSd9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcocmVzdWx0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihhbmd1bGFyLnRvSnNvbihyZXN1bHQubWVzc2FnZXMsIHRydWUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2FjbScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1wb3J0QWNtUmVjKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnYWRtJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRBZG1SZWMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdhdG0nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltcG9ydEF0bVJlYygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnVW5leHBlY3RlZCBpbXBvcnQgdHlwZSAnICsgdHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgLy8gaGFzaDogXCIzNjM2ZWFkMDc4NWNhMTY2ZjNiMTExOTNjNGIyZTVhNjcwODAxZWIxXCIgbmFtZTogXCJEYW1wZXIuemlwXCIgc2l6ZTogXCIxLjQga0JcIiB0eXBlOiBcInppcFwiXHJcbiAgICAgICAgICAgIC8vIHVybDogXCIvcmVzdC9ibG9iL2Rvd25sb2FkLzM2MzZlYWQwNzg1Y2ExNjZmM2IxMTE5M2M0YjJlNWE2NzA4MDFlYjFcIlxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChmaWxlc1tpXS50eXBlID09PSAnemlwJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZzLmFjbXMucHVzaChmaWxlc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpbGVzW2ldLnR5cGUgPT09ICdhZG0nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnMuYWRtcy5wdXNoKGZpbGVzW2ldKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlsZXNbaV0udHlwZSA9PT0gJ2F0bScpIHtcclxuICAgICAgICAgICAgICAgICAgICBmcy5hdG1zLnB1c2goZmlsZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0b3RhbCA9IGZzLmFjbXMubGVuZ3RoO1xyXG4gICAgICAgICAgICBjb3VudGVyID0gdG90YWw7XHJcbiAgICAgICAgICAgIGltcG9ydEFjbVJlYygpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsQWNtSW1wb3J0ZXIgPSBmdW5jdGlvbiAoY29udGV4dCwgZm9sZGVySWQsIGZpbGVJbmZvKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogZm9sZGVySWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcnVuT25TZXJ2ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbkNvbmZpZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBVcGxvYWRlZEZpbGU6IGZpbGVJbmZvLmhhc2gsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERlbGV0ZUV4aXN0aW5nOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKGNvbnRleHQsICdBY21JbXBvcnRlcicsIGNvbmZpZylcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1wie1wic3VjY2Vzc1wiOnRydWUsXCJtZXNzYWdlc1wiOltdLFwiYXJ0aWZhY3RzXCI6W10sXCJwbHVnaW5OYW1lXCI6XCJBQ00gSW1wb3J0ZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAvLyBcInN0YXJ0VGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS4zODNaXCIsXCJmaW5pc2hUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjkzOVpcIixcImVycm9yXCI6bnVsbH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsICcgKyByZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxBZG1JbXBvcnRlciA9IGZ1bmN0aW9uIChjb250ZXh0LCBmb2xkZXJJZCwgZmlsZUluZm8pIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlOiBmb2xkZXJJZCxcclxuICAgICAgICAgICAgICAgICAgICBydW5PblNlcnZlcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkbUZpbGU6IGZpbGVJbmZvLmhhc2hcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcGx1Z2luU2VydmljZS5ydW5QbHVnaW4oY29udGV4dCwgJ0FkbUltcG9ydGVyJywgY29uZmlnKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vXCJ7XCJzdWNjZXNzXCI6dHJ1ZSxcIm1lc3NhZ2VzXCI6W10sXCJhcnRpZmFjdHNcIjpbXSxcInBsdWdpbk5hbWVcIjpcIkFETSBJbXBvcnRlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFwic3RhcnRUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjM4M1pcIixcImZpbmlzaFRpbWVcIjpcIjIwMTQtMTEtMDhUMDI6NTE6MjEuOTM5WlwiLFwiZXJyb3JcIjpudWxsfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdTb21ldGhpbmcgd2VudCB0ZXJyaWJseSB3cm9uZywgJyArIHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbEF0bUltcG9ydGVyID0gZnVuY3Rpb24gKGNvbnRleHQsIGZvbGRlcklkLCBmaWxlSW5mbykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGU6IGZvbGRlcklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uU2VydmVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5Db25maWc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXRtRmlsZTogZmlsZUluZm8uaGFzaFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLnJ1blBsdWdpbihjb250ZXh0LCAnQXRtSW1wb3J0ZXInLCBjb25maWcpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9cIntcInN1Y2Nlc3NcIjp0cnVlLFwibWVzc2FnZXNcIjpbXSxcImFydGlmYWN0c1wiOltdLFwicGx1Z2luTmFtZVwiOlwiQVRNIEltcG9ydGVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXCJzdGFydFRpbWVcIjpcIjIwMTQtMTEtMDhUMDI6NTE6MjEuMzgzWlwiLFwiZmluaXNoVGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS45MzlaXCIsXCJlcnJvclwiOm51bGx9XCJcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nLCAnICsgcmVhc29uKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2FsbHMgRXhwb3J0V29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gQ29udGV4dCBmb3IgcGx1Z2luLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gRGF0YWJhc2UgY29ubmVjdGlvbiB0byBwdWxsIG1vZGVsIGZyb20uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gcmVzb2x2ZXMgdG8gZG93bmxvYWQgdXJsIGlmIHN1Y2Nlc3NmdWwuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5leHBvcnRXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoY29udGV4dCwgd29ya3NwYWNlSWQpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlOiB3b3Jrc3BhY2VJZCxcclxuICAgICAgICAgICAgICAgICAgICBydW5PblNlcnZlcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7IH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLnJ1blBsdWdpbihjb250ZXh0LCAnRXhwb3J0V29ya3NwYWNlJywgY29uZmlnKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vXCJ7XCJzdWNjZXNzXCI6dHJ1ZSxcIm1lc3NhZ2VzXCI6W10sXCJhcnRpZmFjdHNcIjpbXSxcInBsdWdpbk5hbWVcIjpcIkFETSBJbXBvcnRlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFwic3RhcnRUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjM4M1pcIixcImZpbmlzaFRpbWVcIjpcIjIwMTQtMTEtMDhUMDI6NTE6MjEuOTM5WlwiLFwiZXJyb3JcIjpudWxsfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZmlsZVNlcnZpY2UuZ2V0RG93bmxvYWRVcmwocmVzdWx0LmFydGlmYWN0c1swXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyZXN1bHQuZXJyb3IgKyAnIG1lc3NhZ2VzOiAnICsgYW5ndWxhci50b0pzb24ocmVzdWx0Lm1lc3NhZ2VzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYW5ndWxhci50b0pzb24ocmVzdWx0Lm1lc3NhZ2VzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nICcgKyByZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlcyB0aGUgZ2l2ZW4gYXR0cmlidXRlc1xyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGRlc2lnbi5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBkZXNpZ24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQucmVnaW9uSWQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgZGVzaWduLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZCAtIFBhdGggdG8gd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhdHRycyAtIEtleXMgYXJlIG5hbWVzIG9mIGF0dHJpYnV0ZXMgYW5kIHZhbHVlcyBhcmUgdGhlIHdhbnRlZCB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnNldFdvcmtzcGFjZUF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoY29udGV4dCwgd29ya3NwYWNlSWQsIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLnNldE5vZGVBdHRyaWJ1dGVzKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBhdHRycyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgd29ya3NwYWNlIGZyb20gdGhlIGNvbnRleHQuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBkYXRhLWJhc2UgY29ubmVjdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWQgLSBQYXRoIHRvIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0gW21zZ10gLSBDb21taXQgbWVzc2FnZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmRlbGV0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCB3b3Jrc3BhY2VJZCwgbXNnKSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbXNnIHx8ICdXb3Jrc3BhY2VTZXJ2aWNlLmRlbGV0ZVdvcmtzcGFjZSAnICsgd29ya3NwYWNlSWQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmRlc3Ryb3lOb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBtZXNzYWdlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBtYWtlIHN1cmUgdGhlIG1ldGhvZHMgYmVsb3cgZ2V0cyByZXNvbHZlZCBhdCBlcnJvciB0b28uXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIHdvcmstc3BhY2VzIGRlZmluZWQgaW4gdGhlIHJvb3Qtbm9kZSB3LnIudC4gZXhpc3RlbmNlIGFuZCBhdHRyaWJ1dGVzLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLndvcmtzcGFjZXMuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaFdvcmtzcGFjZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hXb3Jrc3BhY2VzJyxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlczoge30gLy8gd29ya3NwYWNlID0ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPn1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS53b3Jrc3BhY2VzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS53b3Jrc3BhY2VzW2lkXS5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLndvcmtzcGFjZXNbaWRdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLndvcmtzcGFjZXNbaWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLndvcmtzcGFjZXNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCAnJylcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocm9vdE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdE5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c0lkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Xb3JrU3BhY2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdzSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW3dzSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHdzSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuV29ya1NwYWNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c0lkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW3dzSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHdzSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiB3c0lkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEud29ya3NwYWNlc1t3c0lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgY29tcG9uZW50cyAoZGVmaW5lZCBpbiBBQ01Gb2xkZXJzKSBpbiB0aGUgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIHRoZSB1cGRhdGVkIGRhdGEuY291bnQuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaE51bWJlck9mQ29tcG9uZW50cyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZkNvbXBvbmVudHNfJyArIHdvcmtzcGFjZUlkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgY29udGFpbmVycyAoZGVmaW5lZCBpbiBBRE1Gb2xkZXJzKSBpbiB0aGUgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIHRoZSB1cGRhdGVkIGRhdGEuY291bnQuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaE51bWJlck9mRGVzaWducyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZkRlc2lnbnNfJyArIHdvcmtzcGFjZUlkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY0RlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKHdhdGNoZXJzLmhhc093blByb3BlcnR5KHBhcmVudENvbnRleHQucmVnaW9uSWQpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJyBpcyBub3QgYSByZWdpc3RlcmVkIHdhdGNoZXIhICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICdVc2UgXCJ0aGlzLnJlZ2lzdGVyV2F0Y2hlclwiIGJlZm9yZSB0cnlpbmcgdG8gYWNjZXNzIE5vZGUgT2JqZWN0cy4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgbnVtYmVyIG9mIHRlc3QtYmVuY2hlcyAoZGVmaW5lZCBpbiBBVE1Gb2xkZXJzKSBpbiB0aGUgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIHRoZSB1cGRhdGVkIGRhdGEuY291bnQuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaE51bWJlck9mVGVzdEJlbmNoZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlc18nICsgd29ya3NwYWNlSWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50OiAwXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1UZXN0QmVuY2hNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVZNVGVzdEJlbmNoTW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY0RlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwUmVnaW9uID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHJlZ2lvbklkKSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgcmVnaW9uSWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlci5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBmbikge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgZm4pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubG9nQ29udGV4dCA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvZ0NvbnRleHQoY29udGV4dCk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyByZXF1aXJlLCBhbmd1bGFyICovXHJcbi8qKlxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJywgWydnbWUuc2VydmljZXMnXSk7XHJcbnJlcXVpcmUoJy4vQmFzZUN5UGh5U2VydmljZScpO1xyXG5yZXF1aXJlKCcuL1BsdWdpblNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9GaWxlU2VydmljZScpO1xyXG5yZXF1aXJlKCcuL0V4ZWN1dG9yU2VydmljZScpO1xyXG5yZXF1aXJlKCcuL1dvcmtzcGFjZVNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9Db21wb25lbnRTZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vRGVzaWduU2VydmljZScpO1xyXG5yZXF1aXJlKCcuL1Rlc3RCZW5jaFNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9EZXNlcnRTZXJ2aWNlJyk7Il19

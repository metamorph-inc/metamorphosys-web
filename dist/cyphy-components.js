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
                fileExtensionToIcon = {
                    'zip': 'fa fa-puzzle-piece',
                    'adm': 'fa fa-cubes',
                    'atm': 'glyphicon glyphicon-saved'
                },
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
                            url: blobClient.getDownloadURL(hash),
                            icon: fileExtensionToIcon[fileExtension] || ''
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

        this.callCreateWorkspace = function (context, name, desc) {

        };

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9saWJyYXJ5L2N5cGh5LWNvbXBvbmVudHMuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvYm93ZXJfY29tcG9uZW50cy9hZGFwdC1zdHJhcC9kaXN0L2FkYXB0LXN0cmFwLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvYWRhcHQtc3RyYXAvZGlzdC9hZGFwdC1zdHJhcC50cGwuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvYm93ZXJfY29tcG9uZW50cy9hbmd1bGFyLWdyb3dsL2J1aWxkL2FuZ3VsYXItZ3Jvd2wubWluLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvYW5ndWxhci1zYW5pdGl6ZS9hbmd1bGFyLXNhbml0aXplLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZC5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvbGlicmFyeS9Db21wb25lbnRMaXN0L0NvbXBvbmVudERldGFpbHMuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2xpYnJhcnkvQ29tcG9uZW50TGlzdC9Db21wb25lbnRMaXN0LmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9saWJyYXJ5L0NvbmZpZ3VyYXRpb25TZXRTZWxlY3Rvci9Db25maWd1cmF0aW9uU2V0U2VsZWN0b3IuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2xpYnJhcnkvQ29uZmlndXJhdGlvblRhYmxlL0NvbmZpZ3VyYXRpb25UYWJsZS5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvbGlicmFyeS9EZXNpZ25MaXN0L0Rlc2lnbkRldGFpbHMuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2xpYnJhcnkvRGVzaWduTGlzdC9EZXNpZ25MaXN0LmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9saWJyYXJ5L0Rlc2lnblRyZWUvRGVzaWduVHJlZS5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvbGlicmFyeS9TaW1wbGVNb2RhbC9TaW1wbGVNb2RhbC5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvbGlicmFyeS9UZXN0QmVuY2hMaXN0L1Rlc3RCZW5jaERldGFpbHMuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2xpYnJhcnkvVGVzdEJlbmNoTGlzdC9UZXN0QmVuY2hMaXN0LmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9saWJyYXJ5L1dvcmtlcnNMaXN0L1dvcmtlcnNMaXN0LmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9saWJyYXJ5L1dvcmtzcGFjZUxpc3QvV29ya3NwYWNlTGlzdC5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9CYXNlQ3lQaHlTZXJ2aWNlLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0NvbXBvbmVudFNlcnZpY2UuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvRGVzZXJ0U2VydmljZS5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9EZXNpZ25TZXJ2aWNlLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0V4ZWN1dG9yU2VydmljZS5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9GaWxlU2VydmljZS5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9QbHVnaW5TZXJ2aWNlLmpzIiwiL1VzZXJzL2xqdXJhY3ovUHJvamVjdHMvbW9ycGgvbW1zLXdlYmN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL1Rlc3RCZW5jaFNlcnZpY2UuanMiLCIvVXNlcnMvbGp1cmFjei9Qcm9qZWN0cy9tb3JwaC9tbXMtd2ViY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvV29ya3NwYWNlU2VydmljZS5qcyIsIi9Vc2Vycy9sanVyYWN6L1Byb2plY3RzL21vcnBoL21tcy13ZWJjeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9jeXBoeS1zZXJ2aWNlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2h2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4WkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1OUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNydEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyByZXF1aXJlLCBhbmd1bGFyICovXG4vKipcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cbi8vIEV4dGVybmFsIGRlcGVuZGVuY2llc1xucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9uZy1maWxlLXVwbG9hZC9hbmd1bGFyLWZpbGUtdXBsb2FkLXNoaW0nKTtcbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZCcpO1xucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9hbmd1bGFyLWdyb3dsL2J1aWxkL2FuZ3VsYXItZ3Jvd2wubWluJyk7XG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL2FuZ3VsYXItc2FuaXRpemUvYW5ndWxhci1zYW5pdGl6ZScpO1xucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9hZGFwdC1zdHJhcC9kaXN0L2FkYXB0LXN0cmFwJyk7XG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL2FkYXB0LXN0cmFwL2Rpc3QvYWRhcHQtc3RyYXAudHBsJyk7XG5cbi8vIEludGVybmFsIGRlcGVuZGVuY2llc1xucmVxdWlyZSgnLi9zZXJ2aWNlcy9jeXBoeS1zZXJ2aWNlcycpO1xuXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycsIFtcbiAgICAnY3lwaHkuc2VydmljZXMnLFxuICAgICdjeXBoeS5jb21wb25lbnRzLnRlbXBsYXRlcycsXG4gICAgJ2FuZ3VsYXJGaWxlVXBsb2FkJyxcbiAgICAnYW5ndWxhci1ncm93bCcsXG4gICAgJ25nU2FuaXRpemUnLFxuICAgICdhZGFwdHYuYWRhcHRTdHJhcCdcbl0pLmNvbmZpZyhbJ2dyb3dsUHJvdmlkZXInLCBmdW5jdGlvbiAoZ3Jvd2xQcm92aWRlcikge1xuICAgIGdyb3dsUHJvdmlkZXIuZ2xvYmFsVGltZVRvTGl2ZSh7c3VjY2VzczogNTAwMCwgZXJyb3I6IC0xLCB3YXJuaW5nOiAyMDAwMCwgaW5mbzogNTAwMH0pO1xufV0pO1xuXG5yZXF1aXJlKCcuL1NpbXBsZU1vZGFsL1NpbXBsZU1vZGFsJyk7XG5cbnJlcXVpcmUoJy4vV29ya3NwYWNlTGlzdC9Xb3Jrc3BhY2VMaXN0Jyk7XG5cbnJlcXVpcmUoJy4vQ29tcG9uZW50TGlzdC9Db21wb25lbnREZXRhaWxzJyk7XG5yZXF1aXJlKCcuL0NvbXBvbmVudExpc3QvQ29tcG9uZW50TGlzdCcpO1xuXG5yZXF1aXJlKCcuL0Rlc2lnbkxpc3QvRGVzaWduRGV0YWlscycpO1xucmVxdWlyZSgnLi9EZXNpZ25MaXN0L0Rlc2lnbkxpc3QnKTtcbnJlcXVpcmUoJy4vRGVzaWduVHJlZS9EZXNpZ25UcmVlJyk7XG5cbnJlcXVpcmUoJy4vVGVzdEJlbmNoTGlzdC9UZXN0QmVuY2hEZXRhaWxzJyk7XG5yZXF1aXJlKCcuL1Rlc3RCZW5jaExpc3QvVGVzdEJlbmNoTGlzdCcpO1xuXG5yZXF1aXJlKCcuL0NvbmZpZ3VyYXRpb25UYWJsZS9Db25maWd1cmF0aW9uVGFibGUnKTtcbnJlcXVpcmUoJy4vQ29uZmlndXJhdGlvblNldFNlbGVjdG9yL0NvbmZpZ3VyYXRpb25TZXRTZWxlY3RvcicpO1xuXG5yZXF1aXJlKCcuL1dvcmtlcnNMaXN0L1dvcmtlcnNMaXN0Jyk7XG5cblxuXG4iLCIvKipcbiAqIGFkYXB0LXN0cmFwXG4gKiBAdmVyc2lvbiB2Mi4wLjYgLSAyMDE0LTEwLTI2XG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vQWRhcHR2L2FkYXB0LXN0cmFwXG4gKiBAYXV0aG9yIEthc2h5YXAgUGF0ZWwgKGthc2h5YXBAYWRhcC50dilcbiAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlLCBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4ndXNlIHN0cmljdCc7XG4vLyBTb3VyY2U6IG1vZHVsZS5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwJywgW1xuICAnYWRhcHR2LmFkYXB0U3RyYXAudXRpbHMnLFxuICAnYWRhcHR2LmFkYXB0U3RyYXAudHJlZWJyb3dzZXInLFxuICAnYWRhcHR2LmFkYXB0U3RyYXAudGFibGVsaXRlJyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLnRhYmxlYWpheCcsXG4gICdhZGFwdHYuYWRhcHRTdHJhcC5sb2FkaW5naW5kaWNhdG9yJyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLmRyYWdnYWJsZScsXG4gICdhZGFwdHYuYWRhcHRTdHJhcC5pbmZpbml0ZWRyb3Bkb3duJ1xuXSkucHJvdmlkZXIoJyRhZENvbmZpZycsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIGljb25DbGFzc2VzID0gdGhpcy5pY29uQ2xhc3NlcyA9IHtcbiAgICAgIGV4cGFuZDogJ2dseXBoaWNvbiBnbHlwaGljb24tcGx1cy1zaWduJyxcbiAgICAgIGNvbGxhcHNlOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1taW51cy1zaWduJyxcbiAgICAgIGxvYWRpbmdTcGlubmVyOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZWZyZXNoIGFkLXNwaW4nLFxuICAgICAgZmlyc3RQYWdlOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1mYXN0LWJhY2t3YXJkJyxcbiAgICAgIHByZXZpb3VzUGFnZTogJ2dseXBoaWNvbiBnbHlwaGljb24tYmFja3dhcmQnLFxuICAgICAgbmV4dFBhZ2U6ICdnbHlwaGljb24gZ2x5cGhpY29uLWZvcndhcmQnLFxuICAgICAgbGFzdFBhZ2U6ICdnbHlwaGljb24gZ2x5cGhpY29uLWZhc3QtZm9yd2FyZCcsXG4gICAgICBzb3J0QXNjZW5kaW5nOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLXVwJyxcbiAgICAgIHNvcnREZXNjZW5kaW5nOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWRvd24nLFxuICAgICAgc29ydGFibGU6ICdnbHlwaGljb24gZ2x5cGhpY29uLXJlc2l6ZS12ZXJ0aWNhbCcsXG4gICAgICBkcmFnZ2FibGU6ICdnbHlwaGljb24gZ2x5cGhpY29uLWFsaWduLWp1c3RpZnknLFxuICAgICAgc2VsZWN0ZWRJdGVtOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1vaydcbiAgICB9LCBwYWdpbmcgPSB0aGlzLnBhZ2luZyA9IHtcbiAgICAgIHJlcXVlc3Q6IHtcbiAgICAgICAgc3RhcnQ6ICdza2lwJyxcbiAgICAgICAgcGFnZVNpemU6ICdsaW1pdCcsXG4gICAgICAgIHBhZ2U6ICdwYWdlJyxcbiAgICAgICAgc29ydEZpZWxkOiAnc29ydCcsXG4gICAgICAgIHNvcnREaXJlY3Rpb246ICdzb3J0X2RpcicsXG4gICAgICAgIHNvcnRBc2NWYWx1ZTogJ2FzYycsXG4gICAgICAgIHNvcnREZXNjVmFsdWU6ICdkZXNjJ1xuICAgICAgfSxcbiAgICAgIHJlc3BvbnNlOiB7XG4gICAgICAgIGl0ZW1zTG9jYXRpb246ICdkYXRhJyxcbiAgICAgICAgdG90YWxJdGVtczogJ3BhZ2luYXRpb24udG90YWxDb3VudCdcbiAgICAgIH1cbiAgICB9O1xuICB0aGlzLiRnZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGljb25DbGFzc2VzOiBpY29uQ2xhc3NlcyxcbiAgICAgIHBhZ2luZzogcGFnaW5nXG4gICAgfTtcbiAgfTtcbn0pO1xuXG4vLyBTb3VyY2U6IGRyYWdnYWJsZS5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLmRyYWdnYWJsZScsIFtdKS5kaXJlY3RpdmUoJ2FkRHJhZycsIFtcbiAgJyRyb290U2NvcGUnLFxuICAnJHBhcnNlJyxcbiAgJyR0aW1lb3V0JyxcbiAgZnVuY3Rpb24gKCRyb290U2NvcGUsICRwYXJzZSwgJHRpbWVvdXQpIHtcbiAgICBmdW5jdGlvbiBsaW5rRnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBzY29wZS5kcmFnZ2FibGUgPSBhdHRycy5hZERyYWc7XG4gICAgICBzY29wZS5oYXNIYW5kbGUgPSBhdHRycy5hZERyYWdIYW5kbGUgPT09ICdmYWxzZScgfHwgdHlwZW9mIGF0dHJzLmFkRHJhZ0hhbmRsZSA9PT0gJ3VuZGVmaW5lZCcgPyBmYWxzZSA6IHRydWU7XG4gICAgICBzY29wZS5vbkRyYWdTdGFydENhbGxiYWNrID0gJHBhcnNlKGF0dHJzLmFkRHJhZ0JlZ2luKSB8fCBudWxsO1xuICAgICAgc2NvcGUub25EcmFnRW5kQ2FsbGJhY2sgPSAkcGFyc2UoYXR0cnMuYWREcmFnRW5kKSB8fCBudWxsO1xuICAgICAgc2NvcGUuZGF0YSA9IG51bGw7XG4gICAgICB2YXIgb2Zmc2V0LCBteCwgbXksIHR4LCB0eTtcbiAgICAgIHZhciBoYXNUb3VjaCA9ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgIC8qIC0tIEV2ZW50cyAtLSAqL1xuICAgICAgdmFyIHN0YXJ0RXZlbnRzID0gJ3RvdWNoc3RhcnQgbW91c2Vkb3duJztcbiAgICAgIHZhciBtb3ZlRXZlbnRzID0gJ3RvdWNobW92ZSBtb3VzZW1vdmUnO1xuICAgICAgdmFyIGVuZEV2ZW50cyA9ICd0b3VjaGVuZCBtb3VzZXVwJztcbiAgICAgIHZhciAkZG9jdW1lbnQgPSAkKGRvY3VtZW50KTtcbiAgICAgIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuICAgICAgdmFyIGRyYWdFbmFibGVkID0gZmFsc2U7XG4gICAgICB2YXIgcHJlc3NUaW1lciA9IG51bGw7XG4gICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICBlbGVtZW50LmF0dHIoJ2RyYWdnYWJsZScsICdmYWxzZScpO1xuICAgICAgICAvLyBwcmV2ZW50IG5hdGl2ZSBkcmFnXG4gICAgICAgIHRvZ2dsZUxpc3RlbmVycyh0cnVlKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHRvZ2dsZUxpc3RlbmVycyhlbmFibGUpIHtcbiAgICAgICAgaWYgKCFlbmFibGUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gYWRkIGxpc3RlbmVycy5cbiAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIG9uRGVzdHJveSk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdhZERyYWcnLCBvbkVuYWJsZUNoYW5nZSk7XG4gICAgICAgIHNjb3BlLiR3YXRjaChhdHRycy5hZERyYWdEYXRhLCBvbkRyYWdEYXRhQ2hhbmdlKTtcbiAgICAgICAgc2NvcGUuJG9uKCdkcmFnZ2FibGU6c3RhcnQnLCBvbkRyYWdTdGFydCk7XG4gICAgICAgIHNjb3BlLiRvbignZHJhZ2dhYmxlOmVuZCcsIG9uRHJhZ0VuZCk7XG4gICAgICAgIGlmIChzY29wZS5oYXNIYW5kbGUpIHtcbiAgICAgICAgICBlbGVtZW50Lm9uKHN0YXJ0RXZlbnRzLCAnLmFkLWRyYWctaGFuZGxlJywgb25QcmVzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5vbihzdGFydEV2ZW50cywgb25QcmVzcyk7XG4gICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnYWQtZHJhZ2dhYmxlJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYXNUb3VjaCkge1xuICAgICAgICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsICcuYWQtZHJhZy1oYW5kbGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0pOyAgLy8gcHJldmVudCBuYXRpdmUgZHJhZ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLy0tLSBFdmVudCBIYW5kbGVycyAtLS1cbiAgICAgIGZ1bmN0aW9uIG9uRHJhZ1N0YXJ0KGV2dCwgbykge1xuICAgICAgICBpZiAoby5lbCA9PT0gZWxlbWVudCAmJiBvLmNhbGxiYWNrKSB7XG4gICAgICAgICAgby5jYWxsYmFjayhldnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkRyYWdFbmQoZXZ0LCBvKSB7XG4gICAgICAgIGlmIChvLmVsID09PSBlbGVtZW50ICYmIG8uY2FsbGJhY2spIHtcbiAgICAgICAgICBvLmNhbGxiYWNrKGV2dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRGVzdHJveSgpIHtcbiAgICAgICAgdG9nZ2xlTGlzdGVuZXJzKGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRHJhZ0RhdGFDaGFuZ2UobmV3VmFsKSB7XG4gICAgICAgIHNjb3BlLmRhdGEgPSBuZXdWYWw7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkVuYWJsZUNoYW5nZShuZXdWYWwpIHtcbiAgICAgICAgZHJhZ0VuYWJsZWQgPSBzY29wZS4kZXZhbChuZXdWYWwpO1xuICAgICAgfVxuICAgICAgLypcbiAgICAgICogV2hlbiB0aGUgZWxlbWVudCBpcyBjbGlja2VkIHN0YXJ0IHRoZSBkcmFnIGJlaGF2aW91clxuICAgICAgKiBPbiB0b3VjaCBkZXZpY2VzIGFzIGEgc21hbGwgZGVsYXkgc28gYXMgbm90IHRvIHByZXZlbnQgbmF0aXZlIHdpbmRvdyBzY3JvbGxpbmdcbiAgICAgICovXG4gICAgICBmdW5jdGlvbiBvblByZXNzKGV2dCkge1xuICAgICAgICBpZiAoIWRyYWdFbmFibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNUb3VjaCkge1xuICAgICAgICAgIGNhbmNlbFByZXNzKCk7XG4gICAgICAgICAgcHJlc3NUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FuY2VsUHJlc3MoKTtcbiAgICAgICAgICAgIG9uTG9uZ1ByZXNzKGV2dCk7XG4gICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAkZG9jdW1lbnQub24obW92ZUV2ZW50cywgY2FuY2VsUHJlc3MpO1xuICAgICAgICAgICRkb2N1bWVudC5vbihlbmRFdmVudHMsIGNhbmNlbFByZXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvbkxvbmdQcmVzcyhldnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvKlxuICAgICAgICogUmV0dXJucyB0aGUgaW5saW5lIHByb3BlcnR5IG9mIGFuIGVsZW1lbnRcbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gZ2V0SW5saW5lUHJvcGVydHkocHJvcCwgZWxlbWVudCkge1xuICAgICAgICB2YXIgc3R5bGVzID0gJChlbGVtZW50KS5hdHRyKCdzdHlsZScpLCB2YWx1ZTtcbiAgICAgICAgaWYgKHN0eWxlcykge1xuICAgICAgICAgIHN0eWxlcy5zcGxpdCgnOycpLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGUuc3BsaXQoJzonKTtcbiAgICAgICAgICAgIGlmICgkLnRyaW0oc3R5bGVbMF0pID09PSBwcm9wKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gc3R5bGVbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgICAgLypcbiAgICAgICAqIFByZXNlcnZlIHRoZSB3aWR0aCBvZiB0aGUgZWxlbWVudCBkdXJpbmcgZHJhZ1xuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBwZXJzaXN0RWxlbWVudFdpZHRoKCkge1xuICAgICAgICBpZiAoZ2V0SW5saW5lUHJvcGVydHkoJ3dpZHRoJywgZWxlbWVudCkpIHtcbiAgICAgICAgICBlbGVtZW50LmRhdGEoJ2FkLWRyYWdnYWJsZS10ZW1wLXdpZHRoJywgZ2V0SW5saW5lUHJvcGVydHkoJ3dpZHRoJywgZWxlbWVudCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQud2lkdGgoZWxlbWVudC53aWR0aCgpKTtcbiAgICAgICAgZWxlbWVudC5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChnZXRJbmxpbmVQcm9wZXJ0eSgnd2lkdGgnLCB0aGlzKSkge1xuICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdhZC1kcmFnZ2FibGUtdGVtcC13aWR0aCcsIGdldElubGluZVByb3BlcnR5KCd3aWR0aCcsIHRoaXMpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgJCh0aGlzKS53aWR0aCgkKHRoaXMpLndpZHRoKCkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGNhbmNlbFByZXNzKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQocHJlc3NUaW1lcik7XG4gICAgICAgICRkb2N1bWVudC5vZmYobW92ZUV2ZW50cywgY2FuY2VsUHJlc3MpO1xuICAgICAgICAkZG9jdW1lbnQub2ZmKGVuZEV2ZW50cywgY2FuY2VsUHJlc3MpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25Mb25nUHJlc3MoZXZ0KSB7XG4gICAgICAgIGlmICghZHJhZ0VuYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIG9mZnNldCA9IGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgIGlmIChzY29wZS5oYXNIYW5kbGUpIHtcbiAgICAgICAgICBvZmZzZXQgPSBlbGVtZW50LmZpbmQoJy5hZC1kcmFnLWhhbmRsZScpLm9mZnNldCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9mZnNldCA9IGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnYWQtZHJhZ2dpbmcnKTtcbiAgICAgICAgbXggPSBldnQucGFnZVggfHwgZXZ0Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgICAgbXkgPSBldnQucGFnZVkgfHwgZXZ0Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5wYWdlWTtcbiAgICAgICAgdHggPSBteCAtIG9mZnNldC5sZWZ0IC0gJHdpbmRvdy5zY3JvbGxMZWZ0KCk7XG4gICAgICAgIHR5ID0gbXkgLSBvZmZzZXQudG9wIC0gJHdpbmRvdy5zY3JvbGxUb3AoKTtcbiAgICAgICAgcGVyc2lzdEVsZW1lbnRXaWR0aCgpO1xuICAgICAgICBtb3ZlRWxlbWVudCh0eCwgdHkpO1xuICAgICAgICAkZG9jdW1lbnQub24obW92ZUV2ZW50cywgb25Nb3ZlKTtcbiAgICAgICAgJGRvY3VtZW50Lm9uKGVuZEV2ZW50cywgb25SZWxlYXNlKTtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkcmFnZ2FibGU6c3RhcnQnLCB7XG4gICAgICAgICAgeDogbXgsXG4gICAgICAgICAgeTogbXksXG4gICAgICAgICAgdHg6IHR4LFxuICAgICAgICAgIHR5OiB0eSxcbiAgICAgICAgICBlbDogZWxlbWVudCxcbiAgICAgICAgICBkYXRhOiBzY29wZS5kYXRhLFxuICAgICAgICAgIGNhbGxiYWNrOiBvbkRyYWdCZWdpblxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uTW92ZShldnQpIHtcbiAgICAgICAgdmFyIGN4LCBjeTtcbiAgICAgICAgaWYgKCFkcmFnRW5hYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY3ggPSBldnQucGFnZVggfHwgZXZ0Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgICAgY3kgPSBldnQucGFnZVkgfHwgZXZ0Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXS5wYWdlWTtcbiAgICAgICAgdHggPSBjeCAtIG14ICsgb2Zmc2V0LmxlZnQgLSAkd2luZG93LnNjcm9sbExlZnQoKTtcbiAgICAgICAgdHkgPSBjeSAtIG15ICsgb2Zmc2V0LnRvcCAtICR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIG1vdmVFbGVtZW50KHR4LCB0eSk7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZHJhZ2dhYmxlOm1vdmUnLCB7XG4gICAgICAgICAgeDogbXgsXG4gICAgICAgICAgeTogbXksXG4gICAgICAgICAgdHg6IHR4LFxuICAgICAgICAgIHR5OiB0eSxcbiAgICAgICAgICBlbDogZWxlbWVudCxcbiAgICAgICAgICBkYXRhOiBzY29wZS5kYXRhXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25SZWxlYXNlKGV2dCkge1xuICAgICAgICBpZiAoIWRyYWdFbmFibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2RyYWdnYWJsZTplbmQnLCB7XG4gICAgICAgICAgeDogbXgsXG4gICAgICAgICAgeTogbXksXG4gICAgICAgICAgdHg6IHR4LFxuICAgICAgICAgIHR5OiB0eSxcbiAgICAgICAgICBlbDogZWxlbWVudCxcbiAgICAgICAgICBkYXRhOiBzY29wZS5kYXRhLFxuICAgICAgICAgIGNhbGxiYWNrOiBvbkRyYWdDb21wbGV0ZVxuICAgICAgICB9KTtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnYWQtZHJhZ2dpbmcnKTtcbiAgICAgICAgcmVzZXQoKTtcbiAgICAgICAgJGRvY3VtZW50Lm9mZihtb3ZlRXZlbnRzLCBvbk1vdmUpO1xuICAgICAgICAkZG9jdW1lbnQub2ZmKGVuZEV2ZW50cywgb25SZWxlYXNlKTtcbiAgICAgIH1cbiAgICAgIC8vIENhbGxiYWNrc1xuICAgICAgZnVuY3Rpb24gb25EcmFnQmVnaW4oZXZ0KSB7XG4gICAgICAgIGlmICghc2NvcGUub25EcmFnU3RhcnRDYWxsYmFjaykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNjb3BlLm9uRHJhZ1N0YXJ0Q2FsbGJhY2soc2NvcGUsIHtcbiAgICAgICAgICAgICRkYXRhOiBzY29wZS5kYXRhLFxuICAgICAgICAgICAgJGRyYWdFbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgJGV2ZW50OiBldnRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkRyYWdDb21wbGV0ZShldnQpIHtcbiAgICAgICAgaWYgKCFzY29wZS5vbkRyYWdFbmRDYWxsYmFjaykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBUbyBmaXggYSBidWcgaXNzdWUgd2hlcmUgb25EcmFnRW5kIGhhcHBlbnMgYmVmb3JlXG4gICAgICAgIC8vIG9uRHJvcEVuZC4gQ3VycmVudGx5IHRoZSBvbmx5IHdheSBhcm91bmQgdGhpc1xuICAgICAgICAvLyBJZGVhbGx5IG9uRHJvcEVuZCBzaG91bGQgZmlyZSBiZWZvcmUgb25EcmFnRW5kXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2NvcGUub25EcmFnRW5kQ2FsbGJhY2soc2NvcGUsIHtcbiAgICAgICAgICAgICAgJGRhdGE6IHNjb3BlLmRhdGEsXG4gICAgICAgICAgICAgICRkcmFnRWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgJGV2ZW50OiBldnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCAxMDApO1xuICAgICAgfVxuICAgICAgLy8gdXRpbHMgZnVuY3Rpb25zXG4gICAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgZWxlbWVudC5jc3Moe1xuICAgICAgICAgIGxlZnQ6ICcnLFxuICAgICAgICAgIHRvcDogJycsXG4gICAgICAgICAgcG9zaXRpb246ICcnLFxuICAgICAgICAgICd6LWluZGV4JzogJydcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciB3aWR0aCA9IGVsZW1lbnQuZGF0YSgnYWQtZHJhZ2dhYmxlLXRlbXAtd2lkdGgnKTtcbiAgICAgICAgaWYgKHdpZHRoKSB7XG4gICAgICAgICAgZWxlbWVudC5jc3MoeyB3aWR0aDogd2lkdGggfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5jc3MoeyB3aWR0aDogJycgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciB3aWR0aCA9ICQodGhpcykuZGF0YSgnYWQtZHJhZ2dhYmxlLXRlbXAtd2lkdGgnKTtcbiAgICAgICAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgICAgICQodGhpcykuY3NzKHsgd2lkdGg6IHdpZHRoIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKHRoaXMpLmNzcyh7IHdpZHRoOiAnJyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gbW92ZUVsZW1lbnQoeCwgeSkge1xuICAgICAgICBlbGVtZW50LmNzcyh7XG4gICAgICAgICAgbGVmdDogeCxcbiAgICAgICAgICB0b3A6IHksXG4gICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICAgICAgJ3otaW5kZXgnOiA5OTk5OVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGluaXQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICBsaW5rOiBsaW5rRnVuY3Rpb25cbiAgICB9O1xuICB9XG5dKS5kaXJlY3RpdmUoJ2FkRHJvcCcsIFtcbiAgJyRyb290U2NvcGUnLFxuICAnJHBhcnNlJyxcbiAgZnVuY3Rpb24gKCRyb290U2NvcGUsICRwYXJzZSkge1xuICAgIGZ1bmN0aW9uIGxpbmtGdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHNjb3BlLmRyb3BwYWJsZSA9IGF0dHJzLmFkRHJvcDtcbiAgICAgIHNjb3BlLm9uRHJvcENhbGxiYWNrID0gJHBhcnNlKGF0dHJzLmFkRHJvcEVuZCkgfHwgbnVsbDtcbiAgICAgIHNjb3BlLm9uRHJvcE92ZXJDYWxsYmFjayA9ICRwYXJzZShhdHRycy5hZERyb3BPdmVyKSB8fCBudWxsO1xuICAgICAgc2NvcGUub25Ecm9wTGVhdmVDYWxsYmFjayA9ICRwYXJzZShhdHRycy5hZERyb3BMZWF2ZSkgfHwgbnVsbDtcbiAgICAgIHZhciBkcm9wRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgdmFyIGVsZW0gPSBudWxsO1xuICAgICAgdmFyICR3aW5kb3cgPSAkKHdpbmRvdyk7XG4gICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICB0b2dnbGVMaXN0ZW5lcnModHJ1ZSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiB0b2dnbGVMaXN0ZW5lcnMoZW5hYmxlKSB7XG4gICAgICAgIGlmICghZW5hYmxlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFkZCBsaXN0ZW5lcnMuXG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdhZERyb3AnLCBvbkVuYWJsZUNoYW5nZSk7XG4gICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBvbkRlc3Ryb3kpO1xuICAgICAgICBzY29wZS4kb24oJ2RyYWdnYWJsZTptb3ZlJywgb25EcmFnTW92ZSk7XG4gICAgICAgIHNjb3BlLiRvbignZHJhZ2dhYmxlOmVuZCcsIG9uRHJhZ0VuZCk7XG4gICAgICAgIHNjb3BlLiRvbignZHJhZ2dhYmxlOmNoYW5nZScsIG9uRHJvcENoYW5nZSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkRlc3Ryb3koKSB7XG4gICAgICAgIHRvZ2dsZUxpc3RlbmVycyhmYWxzZSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkVuYWJsZUNoYW5nZShuZXdWYWwpIHtcbiAgICAgICAgZHJvcEVuYWJsZWQgPSBzY29wZS4kZXZhbChuZXdWYWwpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25Ecm9wQ2hhbmdlKGV2dCwgb2JqKSB7XG4gICAgICAgIGlmIChlbGVtICE9PSBvYmouZWwpIHtcbiAgICAgICAgICBlbGVtID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25EcmFnTW92ZShldnQsIG9iaikge1xuICAgICAgICBpZiAoIWRyb3BFbmFibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHRoZSBkcm9wRWxlbWVudCBhbmQgdGhlIGRyYWcgZWxlbWVudCBhcmUgdGhlIHNhbWVcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IG9iai5lbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZWwgPSBnZXRDdXJyZW50RHJvcEVsZW1lbnQob2JqLnR4LCBvYmoudHksIG9iai5lbCk7XG4gICAgICAgIGlmIChlbCAhPT0gbnVsbCkge1xuICAgICAgICAgIGVsZW0gPSBlbDtcbiAgICAgICAgICBvYmouZWwubGFzdERyb3BFbGVtZW50ID0gZWxlbTtcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2NvcGUub25Ecm9wT3ZlckNhbGxiYWNrKHNjb3BlLCB7XG4gICAgICAgICAgICAgICRkYXRhOiBvYmouZGF0YSxcbiAgICAgICAgICAgICAgJGRyYWdFbGVtZW50OiBvYmouZWwsXG4gICAgICAgICAgICAgICRkcm9wRWxlbWVudDogZWxlbSxcbiAgICAgICAgICAgICAgJGV2ZW50OiBldnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2FkLWRyb3Atb3ZlcicpO1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZHJhZ2dhYmxlOmNoYW5nZScsIHsgZWw6IGVsZW0gfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKG9iai5lbC5sYXN0RHJvcEVsZW1lbnQgPT09IGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHNjb3BlLm9uRHJvcExlYXZlQ2FsbGJhY2soc2NvcGUsIHtcbiAgICAgICAgICAgICAgICAkZGF0YTogb2JqLmRhdGEsXG4gICAgICAgICAgICAgICAgJGRyYWdFbGVtZW50OiBvYmouZWwsXG4gICAgICAgICAgICAgICAgJGRyb3BFbGVtZW50OiBvYmouZWwubGFzdERyb3BFbGVtZW50LFxuICAgICAgICAgICAgICAgICRldmVudDogZXZ0XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBvYmouZWwubGFzdERyb3BFbGVtZW50LnJlbW92ZUNsYXNzKCdhZC1kcm9wLW92ZXInKTtcbiAgICAgICAgICAgIGRlbGV0ZSBvYmouZWwubGFzdERyb3BFbGVtZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25EcmFnRW5kKGV2dCwgb2JqKSB7XG4gICAgICAgIGlmICghZHJvcEVuYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW0pIHtcbiAgICAgICAgICAvLyBjYWxsIHRoZSBhZERyb3AgZWxlbWVudCBjYWxsYmFja1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzY29wZS5vbkRyb3BDYWxsYmFjayhzY29wZSwge1xuICAgICAgICAgICAgICAkZGF0YTogb2JqLmRhdGEsXG4gICAgICAgICAgICAgICRkcmFnRWxlbWVudDogb2JqLmVsLFxuICAgICAgICAgICAgICAkZHJvcEVsZW1lbnQ6IGVsZW0sXG4gICAgICAgICAgICAgICRldmVudDogZXZ0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBlbGVtID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gZ2V0Q3VycmVudERyb3BFbGVtZW50KHgsIHkpIHtcbiAgICAgICAgdmFyIGJvdW5kcyA9IGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgIC8vIHNldCBkcmFnIHNlbnNpdGl2aXR5XG4gICAgICAgIHZhciB2dGhvbGQgPSBNYXRoLmZsb29yKGVsZW1lbnQub3V0ZXJIZWlnaHQoKSAvIDYpO1xuICAgICAgICB4ID0geCArICR3aW5kb3cuc2Nyb2xsTGVmdCgpO1xuICAgICAgICB5ID0geSArICR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIHJldHVybiB5ID49IGJvdW5kcy50b3AgKyB2dGhvbGQgJiYgeSA8PSBib3VuZHMudG9wICsgZWxlbWVudC5vdXRlckhlaWdodCgpIC0gdnRob2xkICYmICh4ID49IGJvdW5kcy5sZWZ0ICYmIHggPD0gYm91bmRzLmxlZnQgKyBlbGVtZW50Lm91dGVyV2lkdGgoKSkgJiYgKHggPj0gYm91bmRzLmxlZnQgJiYgeCA8PSBib3VuZHMubGVmdCArIGVsZW1lbnQub3V0ZXJXaWR0aCgpKSA/IGVsZW1lbnQgOiBudWxsO1xuICAgICAgfVxuICAgICAgaW5pdCgpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgIGxpbms6IGxpbmtGdW5jdGlvblxuICAgIH07XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IGluZmluaXRlZHJvcGRvd24uanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC5pbmZpbml0ZWRyb3Bkb3duJywgW1xuICAnYWRhcHR2LmFkYXB0U3RyYXAudXRpbHMnLFxuICAnYWRhcHR2LmFkYXB0U3RyYXAubG9hZGluZ2luZGljYXRvcidcbl0pLmRpcmVjdGl2ZSgnYWRJbmZpbml0ZURyb3Bkb3duJywgW1xuICAnJHBhcnNlJyxcbiAgJyRjb21waWxlJyxcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgJyRhZENvbmZpZycsXG4gICdhZExvYWRQYWdlJyxcbiAgJ2FkRGVib3VuY2UnLFxuICAnYWRTdHJhcFV0aWxzJyxcbiAgJ2FkTG9hZExvY2FsUGFnZScsXG4gIGZ1bmN0aW9uICgkcGFyc2UsICRjb21waWxlLCAkdGVtcGxhdGVDYWNoZSwgJGFkQ29uZmlnLCBhZExvYWRQYWdlLCBhZERlYm91bmNlLCBhZFN0cmFwVXRpbHMsIGFkTG9hZExvY2FsUGFnZSkge1xuZnVuY3Rpb24gbGlua0Z1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgLy8gc2NvcGUgaW5pdGlhbGl6YXRpb25cbiAgICAgIHNjb3BlLmF0dHJzID0gYXR0cnM7XG4gICAgICBzY29wZS5hZFN0cmFwVXRpbHMgPSBhZFN0cmFwVXRpbHM7XG4gICAgICBzY29wZS5pdGVtcyA9IHtcbiAgICAgICAgbGlzdDogW10sXG4gICAgICAgIHBhZ2luZzoge1xuICAgICAgICAgIGN1cnJlbnRQYWdlOiAxLFxuICAgICAgICAgIHRvdGFsUGFnZXM6IHVuZGVmaW5lZCxcbiAgICAgICAgICBwYWdlU2l6ZTogTnVtYmVyKGF0dHJzLnBhZ2VTaXplKSB8fCAxMFxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgc2NvcGUubG9jYWxDb25maWcgPSB7XG4gICAgICAgIGxvYWRpbmdEYXRhOiBmYWxzZSxcbiAgICAgICAgc2luZ2xlU2VsZWN0aW9uTW9kZTogJHBhcnNlKGF0dHJzLnNpbmdsZVNlbGVjdGlvbk1vZGUpKCkgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGRpbWVuc2lvbnM6IHtcbiAgICAgICAgICAnbWF4LWhlaWdodCc6IGF0dHJzLm1heEhlaWdodCB8fCAnMjAwcHgnLFxuICAgICAgICAgICdtYXgtd2lkdGgnOiBhdHRycy5tYXhXaWR0aCB8fCAnYXV0bydcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNjb3BlLnNlbGVjdGVkSXRlbXMgPSBzY29wZS4kZXZhbChhdHRycy5zZWxlY3RlZEl0ZW1zKSB8fCBbXTtcbiAgICAgIHNjb3BlLmFqYXhDb25maWcgPSBzY29wZS4kZXZhbChhdHRycy5hamF4Q29uZmlnKSB8fCB7fTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gTG9jYWwgZGF0YSAtLS0tLS0tLS0tIC8vXG4gICAgICB2YXIgbGFzdFJlcXVlc3RUb2tlbiwgd2F0Y2hlcnMgPSBbXTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gdWkgaGFuZGxlcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgc2NvcGUuYWRkUmVtb3ZlSXRlbSA9IGZ1bmN0aW9uIChldmVudCwgaXRlbSwgaXRlbXMpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGlmIChzY29wZS5sb2NhbENvbmZpZy5zaW5nbGVTZWxlY3Rpb25Nb2RlKSB7XG4gICAgICAgICAgc2NvcGUuc2VsZWN0ZWRJdGVtc1swXSA9IGl0ZW07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWRTdHJhcFV0aWxzLmFkZFJlbW92ZUl0ZW1Gcm9tTGlzdChpdGVtLCBpdGVtcyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNhbGxiYWNrID0gc2NvcGUuJGV2YWwoYXR0cnMub25JdGVtQ2xpY2spO1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICBjYWxsYmFjayhpdGVtKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNjb3BlLmxvYWRQYWdlID0gYWREZWJvdW5jZShmdW5jdGlvbiAocGFnZSkge1xuICAgICAgICBsYXN0UmVxdWVzdFRva2VuID0gTWF0aC5yYW5kb20oKTtcbiAgICAgICAgc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEgPSB0cnVlO1xuICAgICAgICB2YXIgcGFnZUxvYWRlciA9IHNjb3BlLiRldmFsKGF0dHJzLnBhZ2VMb2FkZXIpIHx8IGFkTG9hZFBhZ2UsIHBhcmFtcyA9IHtcbiAgICAgICAgICAgIHBhZ2VOdW1iZXI6IHBhZ2UsXG4gICAgICAgICAgICBwYWdlU2l6ZTogc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplLFxuICAgICAgICAgICAgc29ydEtleTogc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlLFxuICAgICAgICAgICAgc29ydERpcmVjdGlvbjogc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSxcbiAgICAgICAgICAgIGFqYXhDb25maWc6IHNjb3BlLmFqYXhDb25maWcsXG4gICAgICAgICAgICB0b2tlbjogbGFzdFJlcXVlc3RUb2tlblxuICAgICAgICAgIH0sIHN1Y2Nlc3NIYW5kbGVyID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UudG9rZW4gPT09IGxhc3RSZXF1ZXN0VG9rZW4pIHtcbiAgICAgICAgICAgICAgaWYgKHBhZ2UgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5pdGVtcy5saXN0ID0gcmVzcG9uc2UuaXRlbXM7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuaXRlbXMubGlzdCA9IHNjb3BlLml0ZW1zLmxpc3QuY29uY2F0KHJlc3BvbnNlLml0ZW1zKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcyA9IHJlc3BvbnNlLnRvdGFsUGFnZXM7XG4gICAgICAgICAgICAgIHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9IHJlc3BvbnNlLmN1cnJlbnRQYWdlO1xuICAgICAgICAgICAgICBzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIGVycm9ySGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhID0gZmFsc2U7XG4gICAgICAgICAgfTtcbiAgICAgICAgaWYgKGF0dHJzLmxvY2FsRGF0YVNvdXJjZSkge1xuICAgICAgICAgIHBhcmFtcy5sb2NhbERhdGEgPSBzY29wZS4kZXZhbChhdHRycy5sb2NhbERhdGFTb3VyY2UpO1xuICAgICAgICAgIHN1Y2Nlc3NIYW5kbGVyKGFkTG9hZExvY2FsUGFnZShwYXJhbXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYWdlTG9hZGVyKHBhcmFtcykudGhlbihzdWNjZXNzSGFuZGxlciwgZXJyb3JIYW5kbGVyKTtcbiAgICAgICAgfVxuICAgICAgfSwgMTApO1xuICAgICAgc2NvcGUubG9hZE5leHRQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhKSB7XG4gICAgICAgICAgaWYgKHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSArIDEgPD0gc2NvcGUuaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRQYWdlKHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSArIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gaW5pdGlhbGl6YXRpb24gYW5kIGV2ZW50IGxpc3RlbmVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAvL1dlIGRvIHRoZSBjb21waWxlIGFmdGVyIGluamVjdGluZyB0aGUgbmFtZSBzcGFjaW5nIGludG8gdGhlIHRlbXBsYXRlLlxuICAgICAgc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICAvLyAtLS0tLS0tLS0tIHNldCB3YXRjaGVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAvLyByZXNldCBvbiBwYXJhbWV0ZXIgY2hhbmdlXG4gICAgICBpZiAoYXR0cnMuYWpheENvbmZpZykge1xuICAgICAgICBzY29wZS4kd2F0Y2goYXR0cnMuYWpheENvbmZpZywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICBzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmxvY2FsRGF0YVNvdXJjZSkge1xuICAgICAgICB3YXRjaGVycy5wdXNoKHNjb3BlLiR3YXRjaChhdHRycy5sb2NhbERhdGFTb3VyY2UsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIHdhdGNoZXJzLnB1c2goc2NvcGUuJHdhdGNoKGF0dHJzLmxvY2FsRGF0YVNvdXJjZSArICcubGVuZ3RoJywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICBzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICAgIC8vIC0tLS0tLS0tLS0gZGlzYWJsZSB3YXRjaGVycyAtLS0tLS0tLS0tIC8vXG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKGZ1bmN0aW9uICh3YXRjaGVyKSB7XG4gICAgICAgICAgd2F0Y2hlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgdmFyIGxpc3RDb250YWluZXIgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudCkuZmluZCgndWwnKVswXTtcbiAgICAgIC8vIGluZmluaXRlIHNjcm9sbCBoYW5kbGVyXG4gICAgICB2YXIgbG9hZEZ1bmN0aW9uID0gYWREZWJvdW5jZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gVGhpcyBpcyBmb3IgaW5maW5pdGUgc2Nyb2xsaW5nLlxuICAgICAgICAgIC8vIFdoZW4gdGhlIHNjcm9sbCBnZXRzIGNsb3NlciB0byB0aGUgYm90dG9tLCBsb2FkIG1vcmUgaXRlbXMuXG4gICAgICAgICAgaWYgKGxpc3RDb250YWluZXIuc2Nyb2xsVG9wICsgbGlzdENvbnRhaW5lci5vZmZzZXRIZWlnaHQgPj0gbGlzdENvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSAzMDApIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWROZXh0UGFnZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgNTApO1xuICAgICAgYW5ndWxhci5lbGVtZW50KGxpc3RDb250YWluZXIpLmJpbmQoJ21vdXNld2hlZWwnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgJiYgZXZlbnQub3JpZ2luYWxFdmVudC5kZWx0YVkpIHtcbiAgICAgICAgICBsaXN0Q29udGFpbmVyLnNjcm9sbFRvcCArPSBldmVudC5vcmlnaW5hbEV2ZW50LmRlbHRhWTtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGxvYWRGdW5jdGlvbigpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgc2NvcGU6IHRydWUsXG4gICAgICBsaW5rOiBsaW5rRnVuY3Rpb24sXG4gICAgICB0ZW1wbGF0ZVVybDogJ2luZmluaXRlZHJvcGRvd24vaW5maW5pdGVkcm9wZG93bi50cGwuaHRtbCdcbiAgICB9O1xuICB9XG5dKTtcblxuLy8gU291cmNlOiBsb2FkaW5naW5kaWNhdG9yLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAubG9hZGluZ2luZGljYXRvcicsIFtdKS5kaXJlY3RpdmUoJ2FkTG9hZGluZ0ljb24nLCBbXG4gICckYWRDb25maWcnLFxuICAnJGNvbXBpbGUnLFxuICBmdW5jdGlvbiAoJGFkQ29uZmlnLCAkY29tcGlsZSkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgY29tcGlsZTogZnVuY3Rpb24gY29tcGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBwcmU6IGZ1bmN0aW9uIHByZUxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICB2YXIgbG9hZGluZ0ljb25DbGFzcyA9IGF0dHJzLmxvYWRpbmdJY29uQ2xhc3MgfHwgJGFkQ29uZmlnLmljb25DbGFzc2VzLmxvYWRpbmdTcGlubmVyLCBuZ1N0eWxlVGVtcGxhdGUgPSBhdHRycy5sb2FkaW5nSWNvblNpemUgPyAnbmctc3R5bGU9XCJ7XFwnZm9udC1zaXplXFwnOiBcXCcnICsgYXR0cnMubG9hZGluZ0ljb25TaXplICsgJ1xcJ31cIicgOiAnJywgdGVtcGxhdGUgPSAnPGkgY2xhc3M9XCInICsgbG9hZGluZ0ljb25DbGFzcyArICdcIiAnICsgbmdTdHlsZVRlbXBsYXRlICsgJz48L2k+JztcbiAgICAgICAgICAgIGVsZW1lbnQuZW1wdHkoKTtcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKCRjb21waWxlKHRlbXBsYXRlKShzY29wZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5dKS5kaXJlY3RpdmUoJ2FkTG9hZGluZ092ZXJsYXknLCBbXG4gICckYWRDb25maWcnLFxuICBmdW5jdGlvbiAoJGFkQ29uZmlnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2xvYWRpbmdpbmRpY2F0b3IvbG9hZGluZ2luZGljYXRvci50cGwuaHRtbCcsXG4gICAgICBzY29wZToge1xuICAgICAgICBsb2FkaW5nOiAnPScsXG4gICAgICAgIHpJbmRleDogJ0AnLFxuICAgICAgICBwb3NpdGlvbjogJ0AnLFxuICAgICAgICBjb250YWluZXJDbGFzc2VzOiAnQCcsXG4gICAgICAgIGxvYWRpbmdJY29uQ2xhc3M6ICdAJyxcbiAgICAgICAgbG9hZGluZ0ljb25TaXplOiAnQCdcbiAgICAgIH0sXG4gICAgICBjb21waWxlOiBmdW5jdGlvbiBjb21waWxlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHByZTogZnVuY3Rpb24gcHJlTGluayhzY29wZSkge1xuICAgICAgICAgICAgc2NvcGUubG9hZGluZ0ljb25DbGFzcyA9IHNjb3BlLmxvYWRpbmdJY29uQ2xhc3MgfHwgJGFkQ29uZmlnLmljb25DbGFzc2VzLmxvYWRpbmc7XG4gICAgICAgICAgICBzY29wZS5sb2FkaW5nSWNvblNpemUgPSBzY29wZS5sb2FkaW5nSWNvblNpemUgfHwgJzNlbSc7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IHRhYmxlYWpheC5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLnRhYmxlYWpheCcsIFtcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLnV0aWxzJyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLmxvYWRpbmdpbmRpY2F0b3InXG5dKS5kaXJlY3RpdmUoJ2FkVGFibGVBamF4JywgW1xuICAnJHBhcnNlJyxcbiAgJyRhZENvbmZpZycsXG4gICdhZExvYWRQYWdlJyxcbiAgJ2FkRGVib3VuY2UnLFxuICAnYWRTdHJhcFV0aWxzJyxcbiAgZnVuY3Rpb24gKCRwYXJzZSwgJGFkQ29uZmlnLCBhZExvYWRQYWdlLCBhZERlYm91bmNlLCBhZFN0cmFwVXRpbHMpIHtcbmZ1bmN0aW9uIGNvbnRyb2xsZXJGdW5jdGlvbigkc2NvcGUsICRhdHRycykge1xuICAgICAgLy8gLS0tLS0tLS0tLSAkc2NvcGUgaW5pdGlhbGl6YXRpb24gLS0tLS0tLS0tLSAvL1xuICAgICAgJHNjb3BlLmF0dHJzID0gJGF0dHJzO1xuICAgICAgJHNjb3BlLmljb25DbGFzc2VzID0gJGFkQ29uZmlnLmljb25DbGFzc2VzO1xuICAgICAgJHNjb3BlLmFkU3RyYXBVdGlscyA9IGFkU3RyYXBVdGlscztcbiAgICAgICRzY29wZS5pdGVtcyA9IHtcbiAgICAgICAgbGlzdDogdW5kZWZpbmVkLFxuICAgICAgICBwYWdpbmc6IHtcbiAgICAgICAgICBjdXJyZW50UGFnZTogMSxcbiAgICAgICAgICB0b3RhbFBhZ2VzOiB1bmRlZmluZWQsXG4gICAgICAgICAgcGFnZVNpemU6IE51bWJlcigkYXR0cnMucGFnZVNpemUpIHx8IDEwLFxuICAgICAgICAgIHBhZ2VTaXplczogJHBhcnNlKCRhdHRycy5wYWdlU2l6ZXMpKCkgfHwgW1xuICAgICAgICAgICAgMTAsXG4gICAgICAgICAgICAyNSxcbiAgICAgICAgICAgIDUwXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnID0ge1xuICAgICAgICBwYWdpbmdBcnJheTogW10sXG4gICAgICAgIGxvYWRpbmdEYXRhOiBmYWxzZSxcbiAgICAgICAgdGFibGVNYXhIZWlnaHQ6ICRhdHRycy50YWJsZU1heEhlaWdodFxuICAgICAgfTtcbiAgICAgICRzY29wZS5hamF4Q29uZmlnID0gJHNjb3BlLiRldmFsKCRhdHRycy5hamF4Q29uZmlnKTtcbiAgICAgICRzY29wZS5jb2x1bW5EZWZpbml0aW9uID0gJHNjb3BlLiRldmFsKCRhdHRycy5jb2x1bW5EZWZpbml0aW9uKTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gTG9jYWwgZGF0YSAtLS0tLS0tLS0tIC8vXG4gICAgICB2YXIgbGFzdFJlcXVlc3RUb2tlbiwgd2F0Y2hlcnMgPSBbXTtcbiAgICAgIGlmICgkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplcy5pbmRleE9mKCRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUpIDwgMCkge1xuICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplID0gJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZXNbMF07XG4gICAgICB9XG4gICAgICAvLyAtLS0tLS0tLS0tIHVpIGhhbmRsZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS5sb2FkUGFnZSA9IGFkRGVib3VuY2UoZnVuY3Rpb24gKHBhZ2UpIHtcbiAgICAgICAgbGFzdFJlcXVlc3RUb2tlbiA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSA9IHRydWU7XG4gICAgICAgIHZhciBwYWdlTG9hZGVyID0gJHNjb3BlLiRldmFsKCRhdHRycy5wYWdlTG9hZGVyKSB8fCBhZExvYWRQYWdlLCBwYXJhbXMgPSB7XG4gICAgICAgICAgICBwYWdlTnVtYmVyOiBwYWdlLFxuICAgICAgICAgICAgcGFnZVNpemU6ICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUsXG4gICAgICAgICAgICBzb3J0S2V5OiAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlLFxuICAgICAgICAgICAgc29ydERpcmVjdGlvbjogJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UsXG4gICAgICAgICAgICBhamF4Q29uZmlnOiAkc2NvcGUuYWpheENvbmZpZyxcbiAgICAgICAgICAgIHRva2VuOiBsYXN0UmVxdWVzdFRva2VuXG4gICAgICAgICAgfSwgc3VjY2Vzc0hhbmRsZXIgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS50b2tlbiA9PT0gbGFzdFJlcXVlc3RUb2tlbikge1xuICAgICAgICAgICAgICAkc2NvcGUuaXRlbXMubGlzdCA9IHJlc3BvbnNlLml0ZW1zO1xuICAgICAgICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMgPSByZXNwb25zZS50b3RhbFBhZ2VzO1xuICAgICAgICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID0gcmVzcG9uc2UuY3VycmVudFBhZ2U7XG4gICAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5wYWdpbmdBcnJheSA9IHJlc3BvbnNlLnBhZ2luZ0FycmF5O1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCBlcnJvckhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEgPSBmYWxzZTtcbiAgICAgICAgICB9O1xuICAgICAgICBwYWdlTG9hZGVyKHBhcmFtcykudGhlbihzdWNjZXNzSGFuZGxlciwgZXJyb3JIYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLmxvYWROZXh0UGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCEkc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEpIHtcbiAgICAgICAgICBpZiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSArIDEgPD0gJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSArIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5sb2FkUHJldmlvdXNQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoISRzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSkge1xuICAgICAgICAgIGlmICgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlIC0gMSA+IDApIHtcbiAgICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlIC0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLmxvYWRMYXN0UGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCEkc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEpIHtcbiAgICAgICAgICBpZiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAhPT0gJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUucGFnZVNpemVDaGFuZ2VkID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgICAgaWYgKE51bWJlcihzaXplKSAhPT0gJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSkge1xuICAgICAgICAgICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgPSBOdW1iZXIoc2l6ZSk7XG4gICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLnNvcnRCeUNvbHVtbiA9IGZ1bmN0aW9uIChjb2x1bW4pIHtcbiAgICAgICAgaWYgKGNvbHVtbi5zb3J0S2V5KSB7XG4gICAgICAgICAgaWYgKGNvbHVtbi5zb3J0S2V5ICE9PSAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlID0gY29sdW1uLnNvcnRLZXk7XG4gICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gaW5pdGlhbGl6YXRpb24gYW5kIGV2ZW50IGxpc3RlbmVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAkc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICAvLyByZXNldCBvbiBwYXJhbWV0ZXIgY2hhbmdlXG4gICAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kd2F0Y2goJGF0dHJzLmFqYXhDb25maWcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgfSwgdHJ1ZSkpO1xuICAgICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHdhdGNoQ29sbGVjdGlvbigkYXR0cnMuY29sdW1uRGVmaW5pdGlvbiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUuY29sdW1uRGVmaW5pdGlvbiA9ICRzY29wZS4kZXZhbCgkYXR0cnMuY29sdW1uRGVmaW5pdGlvbik7XG4gICAgICB9KSk7XG4gICAgICAvLyAtLS0tLS0tLS0tIGRpc2FibGUgd2F0Y2hlcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdhdGNoZXJzLmZvckVhY2goZnVuY3Rpb24gKHdhdGNoZXIpIHtcbiAgICAgICAgICB3YXRjaGVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgc2NvcGU6IHRydWUsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RhYmxlYWpheC90YWJsZWFqYXgudHBsLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogW1xuICAgICAgICAnJHNjb3BlJyxcbiAgICAgICAgJyRhdHRycycsXG4gICAgICAgIGNvbnRyb2xsZXJGdW5jdGlvblxuICAgICAgXVxuICAgIH07XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IHRhYmxlbGl0ZS5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLnRhYmxlbGl0ZScsIFsnYWRhcHR2LmFkYXB0U3RyYXAudXRpbHMnXSkuZGlyZWN0aXZlKCdhZFRhYmxlTGl0ZScsIFtcbiAgJyRwYXJzZScsXG4gICckaHR0cCcsXG4gICckY29tcGlsZScsXG4gICckZmlsdGVyJyxcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgJyRhZENvbmZpZycsXG4gICdhZFN0cmFwVXRpbHMnLFxuICAnYWREZWJvdW5jZScsXG4gICdhZExvYWRMb2NhbFBhZ2UnLFxuICBmdW5jdGlvbiAoJHBhcnNlLCAkaHR0cCwgJGNvbXBpbGUsICRmaWx0ZXIsICR0ZW1wbGF0ZUNhY2hlLCAkYWRDb25maWcsIGFkU3RyYXBVdGlscywgYWREZWJvdW5jZSwgYWRMb2FkTG9jYWxQYWdlKSB7XG5mdW5jdGlvbiBjb250cm9sbGVyRnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMpIHtcbiAgICAgIC8vIC0tLS0tLS0tLS0gJCRzY29wZSBpbml0aWFsaXphdGlvbiAtLS0tLS0tLS0tIC8vXG4gICAgICAkc2NvcGUuYXR0cnMgPSAkYXR0cnM7XG4gICAgICAkc2NvcGUuaWNvbkNsYXNzZXMgPSAkYWRDb25maWcuaWNvbkNsYXNzZXM7XG4gICAgICAkc2NvcGUuYWRTdHJhcFV0aWxzID0gYWRTdHJhcFV0aWxzO1xuICAgICAgJHNjb3BlLmNvbHVtbkRlZmluaXRpb24gPSAkc2NvcGUuJGV2YWwoJGF0dHJzLmNvbHVtbkRlZmluaXRpb24pO1xuICAgICAgJHNjb3BlLml0ZW1zID0ge1xuICAgICAgICBsaXN0OiB1bmRlZmluZWQsXG4gICAgICAgIGFsbEl0ZW1zOiB1bmRlZmluZWQsXG4gICAgICAgIHBhZ2luZzoge1xuICAgICAgICAgIGN1cnJlbnRQYWdlOiAxLFxuICAgICAgICAgIHRvdGFsUGFnZXM6IHVuZGVmaW5lZCxcbiAgICAgICAgICBwYWdlU2l6ZTogTnVtYmVyKCRhdHRycy5wYWdlU2l6ZSkgfHwgMTAsXG4gICAgICAgICAgcGFnZVNpemVzOiAkcGFyc2UoJGF0dHJzLnBhZ2VTaXplcykoKSB8fCBbXG4gICAgICAgICAgICAxMCxcbiAgICAgICAgICAgIDI1LFxuICAgICAgICAgICAgNTBcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUubG9jYWxDb25maWcgPSB7XG4gICAgICAgIGxvY2FsRGF0YTogYWRTdHJhcFV0aWxzLnBhcnNlKCRzY29wZS4kZXZhbCgkYXR0cnMubG9jYWxEYXRhU291cmNlKSksXG4gICAgICAgIHBhZ2luZ0FycmF5OiBbXSxcbiAgICAgICAgZHJhZ0NoYW5nZTogJHNjb3BlLiRldmFsKCRhdHRycy5vbkRyYWdDaGFuZ2UpXG4gICAgICB9O1xuICAgICAgJHNjb3BlLnNlbGVjdGVkSXRlbXMgPSAkc2NvcGUuJGV2YWwoJGF0dHJzLnNlbGVjdGVkSXRlbXMpO1xuICAgICAgLy8gLS0tLS0tLS0tLSBMb2NhbCBkYXRhIC0tLS0tLS0tLS0gLy9cbiAgICAgIHZhciBwbGFjZUhvbGRlciA9IG51bGwsIHBhZ2VCdXR0b25FbGVtZW50ID0gbnVsbCwgdmFsaWREcm9wID0gZmFsc2UsIGluaXRpYWxQb3MsIHdhdGNoZXJzID0gW107XG4gICAgICBmdW5jdGlvbiBtb3ZlRWxlbWVudE5vZGUobm9kZVRvTW92ZSwgcmVsYXRpdmVOb2RlLCBkcmFnTm9kZSkge1xuICAgICAgICBpZiAocmVsYXRpdmVOb2RlLm5leHQoKVswXSA9PT0gbm9kZVRvTW92ZVswXSkge1xuICAgICAgICAgIHJlbGF0aXZlTm9kZS5iZWZvcmUobm9kZVRvTW92ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVsYXRpdmVOb2RlLnByZXYoKVswXSA9PT0gbm9kZVRvTW92ZVswXSkge1xuICAgICAgICAgIHJlbGF0aXZlTm9kZS5hZnRlcihub2RlVG9Nb3ZlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocmVsYXRpdmVOb2RlLm5leHQoKVswXSA9PT0gZHJhZ05vZGVbMF0pIHtcbiAgICAgICAgICAgIHJlbGF0aXZlTm9kZS5iZWZvcmUobm9kZVRvTW92ZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChyZWxhdGl2ZU5vZGUucHJldigpWzBdID09PSBkcmFnTm9kZVswXSkge1xuICAgICAgICAgICAgcmVsYXRpdmVOb2RlLmFmdGVyKG5vZGVUb01vdmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemVzLmluZGV4T2YoJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSkgPCAwKSB7XG4gICAgICAgICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgPSAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplc1swXTtcbiAgICAgIH1cbiAgICAgIC8vIC0tLS0tLS0tLS0gdWkgaGFuZGxlcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgJHNjb3BlLmxvYWRQYWdlID0gYWREZWJvdW5jZShmdW5jdGlvbiAocGFnZSkge1xuICAgICAgICB2YXIgaXRlbXNPYmplY3QgPSAkc2NvcGUubG9jYWxDb25maWcubG9jYWxEYXRhID0gYWRTdHJhcFV0aWxzLnBhcnNlKCRzY29wZS4kZXZhbCgkYXR0cnMubG9jYWxEYXRhU291cmNlKSksIHBhcmFtcztcbiAgICAgICAgcGFyYW1zID0ge1xuICAgICAgICAgIHBhZ2VOdW1iZXI6IHBhZ2UsXG4gICAgICAgICAgcGFnZVNpemU6ICEkYXR0cnMuZGlzYWJsZVBhZ2luZyA/ICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgOiBpdGVtc09iamVjdC5sZW5ndGgsXG4gICAgICAgICAgc29ydEtleTogJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSxcbiAgICAgICAgICBzb3J0RGlyZWN0aW9uOiAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSxcbiAgICAgICAgICBsb2NhbERhdGE6IGl0ZW1zT2JqZWN0XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZXNwb25zZSA9IGFkTG9hZExvY2FsUGFnZShwYXJhbXMpO1xuICAgICAgICAkc2NvcGUuaXRlbXMubGlzdCA9IHJlc3BvbnNlLml0ZW1zO1xuICAgICAgICAkc2NvcGUuaXRlbXMuYWxsSXRlbXMgPSByZXNwb25zZS5hbGxJdGVtcztcbiAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9IHJlc3BvbnNlLmN1cnJlbnRQYWdlO1xuICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMgPSByZXNwb25zZS50b3RhbFBhZ2VzO1xuICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucGFnaW5nQXJyYXkgPSByZXNwb25zZS5wYWdpbmdBcnJheTtcbiAgICAgIH0sIDEwMCk7XG4gICAgICAkc2NvcGUubG9hZE5leHRQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSArIDEgPD0gJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzKSB7XG4gICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgKyAxKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5sb2FkUHJldmlvdXNQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAtIDEgPiAwKSB7XG4gICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgLSAxKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5sb2FkTGFzdFBhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghJHNjb3BlLmxvY2FsQ29uZmlnLmRpc2FibGVQYWdpbmcpIHtcbiAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5wYWdlU2l6ZUNoYW5nZWQgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplID0gc2l6ZTtcbiAgICAgICAgJHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgfTtcbiAgICAgICRzY29wZS5zb3J0QnlDb2x1bW4gPSBmdW5jdGlvbiAoY29sdW1uKSB7XG4gICAgICAgIGlmIChjb2x1bW4uc29ydEtleSkge1xuICAgICAgICAgIGlmIChjb2x1bW4uc29ydEtleSAhPT0gJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSkge1xuICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9IGNvbHVtbi5zb3J0S2V5O1xuICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUudW5Tb3J0VGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlID0gdW5kZWZpbmVkO1xuICAgICAgfTtcbiAgICAgICRzY29wZS5vbkRyYWdTdGFydCA9IGZ1bmN0aW9uIChkYXRhLCBkcmFnRWxlbWVudCkge1xuICAgICAgICB2YXIgcGFyZW50ID0gZHJhZ0VsZW1lbnQucGFyZW50KCk7XG4gICAgICAgIHBsYWNlSG9sZGVyID0gJCgnPHRyPjx0ZCBjb2xzcGFuPScgKyBkcmFnRWxlbWVudC5maW5kKCd0ZCcpLmxlbmd0aCArICc+Jm5ic3A7PC90ZD48L3RyPicpO1xuICAgICAgICBpbml0aWFsUG9zID0gZHJhZ0VsZW1lbnQuaW5kZXgoKSArICgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlIC0gMSkgKiAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplIC0gMTtcbiAgICAgICAgaWYgKGRyYWdFbGVtZW50WzBdICE9PSBwYXJlbnQuY2hpbGRyZW4oKS5sYXN0KClbMF0pIHtcbiAgICAgICAgICBkcmFnRWxlbWVudC5uZXh0KCkuYmVmb3JlKHBsYWNlSG9sZGVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXJlbnQuYXBwZW5kKHBsYWNlSG9sZGVyKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5vbkRyYWdFbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHBsYWNlSG9sZGVyLnJlbW92ZSgpO1xuICAgICAgfTtcbiAgICAgICRzY29wZS5vbkRyYWdPdmVyID0gZnVuY3Rpb24gKGRhdGEsIGRyYWdFbGVtZW50LCBkcm9wRWxlbWVudCkge1xuICAgICAgICBpZiAocGxhY2VIb2xkZXIpIHtcbiAgICAgICAgICAvLyBSZXN0cmljdHMgdmFsaWQgZHJhZyB0byBjdXJyZW50IHRhYmxlIGluc3RhbmNlXG4gICAgICAgICAgbW92ZUVsZW1lbnROb2RlKHBsYWNlSG9sZGVyLCBkcm9wRWxlbWVudCwgZHJhZ0VsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLm9uRHJvcEVuZCA9IGZ1bmN0aW9uIChkYXRhLCBkcmFnRWxlbWVudCkge1xuICAgICAgICB2YXIgZW5kUG9zO1xuICAgICAgICBpZiAocGxhY2VIb2xkZXIpIHtcbiAgICAgICAgICAvLyBSZXN0cmljdHMgZHJvcCB0byBjdXJyZW50IHRhYmxlIGluc3RhbmNlXG4gICAgICAgICAgaWYgKHBsYWNlSG9sZGVyLm5leHQoKVswXSkge1xuICAgICAgICAgICAgcGxhY2VIb2xkZXIubmV4dCgpLmJlZm9yZShkcmFnRWxlbWVudCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwbGFjZUhvbGRlci5wcmV2KClbMF0pIHtcbiAgICAgICAgICAgIHBsYWNlSG9sZGVyLnByZXYoKS5hZnRlcihkcmFnRWxlbWVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBsYWNlSG9sZGVyLnJlbW92ZSgpO1xuICAgICAgICAgIHZhbGlkRHJvcCA9IHRydWU7XG4gICAgICAgICAgZW5kUG9zID0gZHJhZ0VsZW1lbnQuaW5kZXgoKSArICgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlIC0gMSkgKiAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplIC0gMTtcbiAgICAgICAgICBhZFN0cmFwVXRpbHMubW92ZUl0ZW1Jbkxpc3QoaW5pdGlhbFBvcywgZW5kUG9zLCAkc2NvcGUubG9jYWxDb25maWcubG9jYWxEYXRhKTtcbiAgICAgICAgICAkc2NvcGUudW5Tb3J0VGFibGUoKTtcbiAgICAgICAgICBpZiAoJHNjb3BlLmxvY2FsQ29uZmlnLmRyYWdDaGFuZ2UpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5kcmFnQ2hhbmdlKGluaXRpYWxQb3MsIGVuZFBvcywgZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwYWdlQnV0dG9uRWxlbWVudCkge1xuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50LnJlbW92ZUNsYXNzKCdidG4tcHJpbWFyeScpO1xuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5vbk5leHRQYWdlQnV0dG9uT3ZlciA9IGZ1bmN0aW9uIChkYXRhLCBkcmFnRWxlbWVudCwgZHJvcEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHBhZ2VCdXR0b25FbGVtZW50KSB7XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2J0bi1wcmltYXJ5Jyk7XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkcm9wRWxlbWVudC5hdHRyKCdkaXNhYmxlZCcpICE9PSAnZGlzYWJsZWQnKSB7XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQgPSBkcm9wRWxlbWVudDtcbiAgICAgICAgICBwYWdlQnV0dG9uRWxlbWVudC5hZGRDbGFzcygnYnRuLXByaW1hcnknKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5vbk5leHRQYWdlQnV0dG9uRHJvcCA9IGZ1bmN0aW9uIChkYXRhLCBkcmFnRWxlbWVudCkge1xuICAgICAgICB2YXIgZW5kUG9zO1xuICAgICAgICBpZiAocGFnZUJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgICB2YWxpZERyb3AgPSB0cnVlO1xuICAgICAgICAgIGlmIChwYWdlQnV0dG9uRWxlbWVudC5hdHRyKCdpZCcpID09PSAnYnRuUHJldicpIHtcbiAgICAgICAgICAgIGVuZFBvcyA9ICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgKiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAtIDEpIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHBhZ2VCdXR0b25FbGVtZW50LmF0dHIoJ2lkJykgPT09ICdidG5OZXh0Jykge1xuICAgICAgICAgICAgZW5kUG9zID0gJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSAqICRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFkU3RyYXBVdGlscy5tb3ZlSXRlbUluTGlzdChpbml0aWFsUG9zLCBlbmRQb3MsICRzY29wZS5sb2NhbENvbmZpZy5sb2NhbERhdGEpO1xuICAgICAgICAgIHBsYWNlSG9sZGVyLnJlbW92ZSgpO1xuICAgICAgICAgIGRyYWdFbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgIGlmICgkc2NvcGUubG9jYWxDb25maWcuZHJhZ0NoYW5nZSkge1xuICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLmRyYWdDaGFuZ2UoaW5pdGlhbFBvcywgZW5kUG9zLCBkYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2J0bi1wcmltYXJ5Jyk7XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgLy8gLS0tLS0tLS0tLSBpbml0aWFsaXphdGlvbiBhbmQgZXZlbnQgbGlzdGVuZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gc2V0IHdhdGNoZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgIHdhdGNoZXJzLnB1c2goJHNjb3BlLiR3YXRjaCgkYXR0cnMubG9jYWxEYXRhU291cmNlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlKTtcbiAgICAgIH0pKTtcbiAgICAgIHdhdGNoZXJzLnB1c2goJHNjb3BlLiR3YXRjaCgkYXR0cnMubG9jYWxEYXRhU291cmNlICsgJy5sZW5ndGgnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlKTtcbiAgICAgIH0pKTtcbiAgICAgIHdhdGNoZXJzLnB1c2goJHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJGF0dHJzLmNvbHVtbkRlZmluaXRpb24sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLmNvbHVtbkRlZmluaXRpb24gPSAkc2NvcGUuJGV2YWwoJGF0dHJzLmNvbHVtbkRlZmluaXRpb24pO1xuICAgICAgfSkpO1xuICAgICAgLy8gLS0tLS0tLS0tLSBkaXNhYmxlIHdhdGNoZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKGZ1bmN0aW9uICh3YXRjaGVyKSB7XG4gICAgICAgICAgd2F0Y2hlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIGNvbnRyb2xsZXI6IFtcbiAgICAgICAgJyRzY29wZScsXG4gICAgICAgICckYXR0cnMnLFxuICAgICAgICBjb250cm9sbGVyRnVuY3Rpb25cbiAgICAgIF0sXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RhYmxlbGl0ZS90YWJsZWxpdGUudHBsLmh0bWwnLFxuICAgICAgc2NvcGU6IHRydWVcbiAgICB9O1xuICB9XG5dKTtcblxuLy8gU291cmNlOiB0cmVlYnJvd3Nlci5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLnRyZWVicm93c2VyJywgW10pLmRpcmVjdGl2ZSgnYWRUcmVlQnJvd3NlcicsIFtcbiAgJyRhZENvbmZpZycsXG4gIGZ1bmN0aW9uICgkYWRDb25maWcpIHtcbiAgICBmdW5jdGlvbiBjb250cm9sbGVyRnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMpIHtcbiAgICAgIHZhciB0ZW1wbGF0ZVRva2VuID0gTWF0aC5yYW5kb20oKTtcbiAgICAgIC8vIHNjb3BlIGluaXRpYWxpemF0aW9uXG4gICAgICAkc2NvcGUuYXR0cnMgPSAkYXR0cnM7XG4gICAgICAkc2NvcGUuaWNvbkNsYXNzZXMgPSAkYWRDb25maWcuaWNvbkNsYXNzZXM7XG4gICAgICAkc2NvcGUudHJlZVJvb3QgPSAkc2NvcGUuJGV2YWwoJGF0dHJzLnRyZWVSb290KSB8fCB7fTtcbiAgICAgICRzY29wZS50b2dnbGUgPSBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcbiAgICAgICAgdmFyIHRvZ2dsZUNhbGxiYWNrO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdG9nZ2xlQ2FsbGJhY2sgPSAkc2NvcGUuJGV2YWwoJGF0dHJzLnRvZ2dsZUNhbGxiYWNrKTtcbiAgICAgICAgaWYgKHRvZ2dsZUNhbGxiYWNrKSB7XG4gICAgICAgICAgdG9nZ2xlQ2FsbGJhY2soaXRlbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbS5fYWRfZXhwYW5kZWQgPSAhaXRlbS5fYWRfZXhwYW5kZWQ7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB2YXIgaGFzQ2hpbGRyZW4gPSAkc2NvcGUuJGV2YWwoJGF0dHJzLmhhc0NoaWxkcmVuKTtcbiAgICAgICRzY29wZS5oYXNDaGlsZHJlbiA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHZhciBmb3VuZCA9IGl0ZW1bJGF0dHJzLmNoaWxkTm9kZV0gJiYgaXRlbVskYXR0cnMuY2hpbGROb2RlXS5sZW5ndGggPiAwO1xuICAgICAgICBpZiAoaGFzQ2hpbGRyZW4pIHtcbiAgICAgICAgICBmb3VuZCA9IGhhc0NoaWxkcmVuKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgIH07XG4gICAgICAvLyBmb3IgdW5pcXVlIHRlbXBsYXRlXG4gICAgICAkc2NvcGUubG9jYWxDb25maWcgPSB7IHJlbmRlcmVyVGVtcGxhdGVJZDogJ3RyZWUtcmVuZGVyZXItJyArIHRlbXBsYXRlVG9rZW4gKyAnLmh0bWwnIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgc2NvcGU6IHRydWUsXG4gICAgICBjb250cm9sbGVyOiBbXG4gICAgICAgICckc2NvcGUnLFxuICAgICAgICAnJGF0dHJzJyxcbiAgICAgICAgY29udHJvbGxlckZ1bmN0aW9uXG4gICAgICBdLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0cmVlYnJvd3Nlci90cmVlYnJvd3Nlci50cGwuaHRtbCdcbiAgICB9O1xuICB9XG5dKTtcblxuLy8gU291cmNlOiB1dGlscy5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLnV0aWxzJywgW10pLmZhY3RvcnkoJ2FkU3RyYXBVdGlscycsIFtcbiAgJyRmaWx0ZXInLFxuICBmdW5jdGlvbiAoJGZpbHRlcikge1xuICAgIHZhciBldmFsT2JqZWN0UHJvcGVydHkgPSBmdW5jdGlvbiAob2JqLCBwcm9wZXJ0eSkge1xuICAgICAgICB2YXIgYXJyID0gcHJvcGVydHkuc3BsaXQoJy4nKTtcbiAgICAgICAgaWYgKG9iaikge1xuICAgICAgICAgIHdoaWxlIChhcnIubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gYXJyLnNoaWZ0KCk7XG4gICAgICAgICAgICBpZiAob2JqKSB7XG4gICAgICAgICAgICAgIG9iaiA9IG9ialtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfSwgYXBwbHlGaWx0ZXIgPSBmdW5jdGlvbiAodmFsdWUsIGZpbHRlciwgaXRlbSkge1xuICAgICAgICB2YXIgcGFydHMsIGZpbHRlck9wdGlvbnM7XG4gICAgICAgIGlmICh2YWx1ZSAmJiAnZnVuY3Rpb24nID09PSB0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUoaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcikge1xuICAgICAgICAgIHBhcnRzID0gZmlsdGVyLnNwbGl0KCc6Jyk7XG4gICAgICAgICAgZmlsdGVyT3B0aW9ucyA9IHBhcnRzWzFdO1xuICAgICAgICAgIGlmIChmaWx0ZXJPcHRpb25zKSB7XG4gICAgICAgICAgICB2YWx1ZSA9ICRmaWx0ZXIocGFydHNbMF0pKHZhbHVlLCBmaWx0ZXJPcHRpb25zKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgPSAkZmlsdGVyKHBhcnRzWzBdKSh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0sIGl0ZW1FeGlzdHNJbkxpc3QgPSBmdW5jdGlvbiAoY29tcGFyZUl0ZW0sIGxpc3QpIHtcbiAgICAgICAgdmFyIGV4aXN0ID0gZmFsc2U7XG4gICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyhjb21wYXJlSXRlbSwgaXRlbSkpIHtcbiAgICAgICAgICAgIGV4aXN0ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZXhpc3Q7XG4gICAgICB9LCBpdGVtc0V4aXN0SW5MaXN0ID0gZnVuY3Rpb24gKGl0ZW1zLCBsaXN0KSB7XG4gICAgICAgIHZhciBleGlzdCA9IHRydWUsIGk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChpdGVtRXhpc3RzSW5MaXN0KGl0ZW1zW2ldLCBsaXN0KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGV4aXN0ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV4aXN0O1xuICAgICAgfSwgYWRkSXRlbVRvTGlzdCA9IGZ1bmN0aW9uIChpdGVtLCBsaXN0KSB7XG4gICAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICAgIH0sIHJlbW92ZUl0ZW1Gcm9tTGlzdCA9IGZ1bmN0aW9uIChpdGVtLCBsaXN0KSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICBmb3IgKGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKGl0ZW0sIGxpc3RbaV0pKSB7XG4gICAgICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIGFkZFJlbW92ZUl0ZW1Gcm9tTGlzdCA9IGZ1bmN0aW9uIChpdGVtLCBsaXN0KSB7XG4gICAgICAgIHZhciBpLCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKGl0ZW0sIGxpc3RbaV0pKSB7XG4gICAgICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZvdW5kID09PSBmYWxzZSkge1xuICAgICAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgfSwgYWRkSXRlbXNUb0xpc3QgPSBmdW5jdGlvbiAoaXRlbXMsIGxpc3QpIHtcbiAgICAgICAgaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgIGlmICghaXRlbUV4aXN0c0luTGlzdChpdGVtLCBsaXN0KSkge1xuICAgICAgICAgICAgYWRkUmVtb3ZlSXRlbUZyb21MaXN0KGl0ZW0sIGxpc3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LCBhZGRSZW1vdmVJdGVtc0Zyb21MaXN0ID0gZnVuY3Rpb24gKGl0ZW1zLCBsaXN0KSB7XG4gICAgICAgIGlmIChpdGVtc0V4aXN0SW5MaXN0KGl0ZW1zLCBsaXN0KSkge1xuICAgICAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhZGRJdGVtc1RvTGlzdChpdGVtcywgbGlzdCk7XG4gICAgICAgIH1cbiAgICAgIH0sIG1vdmVJdGVtSW5MaXN0ID0gZnVuY3Rpb24gKHN0YXJ0UG9zLCBlbmRQb3MsIGxpc3QpIHtcbiAgICAgICAgaWYgKGVuZFBvcyA8IGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgbGlzdC5zcGxpY2UoZW5kUG9zLCAwLCBsaXN0LnNwbGljZShzdGFydFBvcywgMSlbMF0pO1xuICAgICAgICB9XG4gICAgICB9LCBwYXJzZSA9IGZ1bmN0aW9uIChpdGVtcykge1xuICAgICAgICB2YXIgaXRlbXNPYmplY3QgPSBbXTtcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShpdGVtcykpIHtcbiAgICAgICAgICBpdGVtc09iamVjdCA9IGl0ZW1zO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChpdGVtcywgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIGl0ZW1zT2JqZWN0LnB1c2goaXRlbSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW1zT2JqZWN0O1xuICAgICAgfSwgZ2V0T2JqZWN0UHJvcGVydHkgPSBmdW5jdGlvbiAoaXRlbSwgcHJvcGVydHkpIHtcbiAgICAgICAgaWYgKHByb3BlcnR5ICYmICdmdW5jdGlvbicgPT09IHR5cGVvZiBwcm9wZXJ0eSkge1xuICAgICAgICAgIHJldHVybiBwcm9wZXJ0eShpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXJyID0gcHJvcGVydHkuc3BsaXQoJy4nKTtcbiAgICAgICAgd2hpbGUgKGFyci5sZW5ndGgpIHtcbiAgICAgICAgICBpdGVtID0gaXRlbVthcnIuc2hpZnQoKV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICBldmFsT2JqZWN0UHJvcGVydHk6IGV2YWxPYmplY3RQcm9wZXJ0eSxcbiAgICAgIGFwcGx5RmlsdGVyOiBhcHBseUZpbHRlcixcbiAgICAgIGl0ZW1FeGlzdHNJbkxpc3Q6IGl0ZW1FeGlzdHNJbkxpc3QsXG4gICAgICBpdGVtc0V4aXN0SW5MaXN0OiBpdGVtc0V4aXN0SW5MaXN0LFxuICAgICAgYWRkSXRlbVRvTGlzdDogYWRkSXRlbVRvTGlzdCxcbiAgICAgIHJlbW92ZUl0ZW1Gcm9tTGlzdDogcmVtb3ZlSXRlbUZyb21MaXN0LFxuICAgICAgYWRkUmVtb3ZlSXRlbUZyb21MaXN0OiBhZGRSZW1vdmVJdGVtRnJvbUxpc3QsXG4gICAgICBhZGRJdGVtc1RvTGlzdDogYWRkSXRlbXNUb0xpc3QsXG4gICAgICBhZGRSZW1vdmVJdGVtc0Zyb21MaXN0OiBhZGRSZW1vdmVJdGVtc0Zyb21MaXN0LFxuICAgICAgbW92ZUl0ZW1Jbkxpc3Q6IG1vdmVJdGVtSW5MaXN0LFxuICAgICAgcGFyc2U6IHBhcnNlLFxuICAgICAgZ2V0T2JqZWN0UHJvcGVydHk6IGdldE9iamVjdFByb3BlcnR5XG4gICAgfTtcbiAgfVxuXSkuZmFjdG9yeSgnYWREZWJvdW5jZScsIFtcbiAgJyR0aW1lb3V0JyxcbiAgJyRxJyxcbiAgZnVuY3Rpb24gKCR0aW1lb3V0LCAkcSkge1xudmFyIGRlYiA9IGZ1bmN0aW9uIChmdW5jLCBkZWxheSwgaW1tZWRpYXRlLCBjdHgpIHtcbiAgICAgIHZhciB0aW1lciA9IG51bGwsIGRlZmVycmVkID0gJHEuZGVmZXIoKSwgd2FpdCA9IGRlbGF5IHx8IDMwMDtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb250ZXh0ID0gY3R4IHx8IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHMsIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVyLCBsYXRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKSk7XG4gICAgICAgICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICBpZiAodGltZXIpIHtcbiAgICAgICAgICAkdGltZW91dC5jYW5jZWwodGltZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRpbWVyID0gJHRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgICBpZiAoY2FsbE5vdykge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKSk7XG4gICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfTtcbiAgICB9O1xuICAgIHJldHVybiBkZWI7XG4gIH1cbl0pLmRpcmVjdGl2ZSgnYWRDb21waWxlVGVtcGxhdGUnLCBbXG4gICckY29tcGlsZScsXG4gIGZ1bmN0aW9uICgkY29tcGlsZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBzY29wZS4kd2F0Y2goZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgIHJldHVybiBzY29wZS4kZXZhbChhdHRycy5hZENvbXBpbGVUZW1wbGF0ZSk7XG4gICAgICB9LCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgZWxlbWVudC5odG1sKHZhbHVlKTtcbiAgICAgICAgJGNvbXBpbGUoZWxlbWVudC5jb250ZW50cygpKShzY29wZSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5dKS5mYWN0b3J5KCdhZExvYWRQYWdlJywgW1xuICAnJGFkQ29uZmlnJyxcbiAgJyRodHRwJyxcbiAgJ2FkU3RyYXBVdGlscycsXG4gIGZ1bmN0aW9uICgkYWRDb25maWcsICRodHRwLCBhZFN0cmFwVXRpbHMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIHZhciBzdGFydCA9IChvcHRpb25zLnBhZ2VOdW1iZXIgLSAxKSAqIG9wdGlvbnMucGFnZVNpemUsIHBhZ2luZ0NvbmZpZyA9IGFuZ3VsYXIuY29weSgkYWRDb25maWcucGFnaW5nKSwgYWpheENvbmZpZyA9IGFuZ3VsYXIuY29weShvcHRpb25zLmFqYXhDb25maWcpO1xuICAgICAgaWYgKGFqYXhDb25maWcucGFnaW5hdGlvbkNvbmZpZyAmJiBhamF4Q29uZmlnLnBhZ2luYXRpb25Db25maWcucmVxdWVzdCkge1xuICAgICAgICBhbmd1bGFyLmV4dGVuZChwYWdpbmdDb25maWcucmVxdWVzdCwgYWpheENvbmZpZy5wYWdpbmF0aW9uQ29uZmlnLnJlcXVlc3QpO1xuICAgICAgfVxuICAgICAgaWYgKGFqYXhDb25maWcucGFnaW5hdGlvbkNvbmZpZyAmJiBhamF4Q29uZmlnLnBhZ2luYXRpb25Db25maWcucmVzcG9uc2UpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQocGFnaW5nQ29uZmlnLnJlc3BvbnNlLCBhamF4Q29uZmlnLnBhZ2luYXRpb25Db25maWcucmVzcG9uc2UpO1xuICAgICAgfVxuICAgICAgYWpheENvbmZpZy5wYXJhbXMgPSBhamF4Q29uZmlnLnBhcmFtcyA/IGFqYXhDb25maWcucGFyYW1zIDoge307XG4gICAgICBhamF4Q29uZmlnLnBhcmFtc1twYWdpbmdDb25maWcucmVxdWVzdC5zdGFydF0gPSBzdGFydDtcbiAgICAgIGFqYXhDb25maWcucGFyYW1zW3BhZ2luZ0NvbmZpZy5yZXF1ZXN0LnBhZ2VTaXplXSA9IG9wdGlvbnMucGFnZVNpemU7XG4gICAgICBhamF4Q29uZmlnLnBhcmFtc1twYWdpbmdDb25maWcucmVxdWVzdC5wYWdlXSA9IG9wdGlvbnMucGFnZU51bWJlcjtcbiAgICAgIGlmIChvcHRpb25zLnNvcnRLZXkpIHtcbiAgICAgICAgYWpheENvbmZpZy5wYXJhbXNbcGFnaW5nQ29uZmlnLnJlcXVlc3Quc29ydEZpZWxkXSA9IG9wdGlvbnMuc29ydEtleTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLnNvcnREaXJlY3Rpb24gPT09IGZhbHNlKSB7XG4gICAgICAgIGFqYXhDb25maWcucGFyYW1zW3BhZ2luZ0NvbmZpZy5yZXF1ZXN0LnNvcnREaXJlY3Rpb25dID0gcGFnaW5nQ29uZmlnLnJlcXVlc3Quc29ydEFzY1ZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnNvcnREaXJlY3Rpb24gPT09IHRydWUpIHtcbiAgICAgICAgYWpheENvbmZpZy5wYXJhbXNbcGFnaW5nQ29uZmlnLnJlcXVlc3Quc29ydERpcmVjdGlvbl0gPSBwYWdpbmdDb25maWcucmVxdWVzdC5zb3J0RGVzY1ZhbHVlO1xuICAgICAgfVxuICAgICAgdmFyIHByb21pc2U7XG4gICAgICBpZiAoYWpheENvbmZpZy5tZXRob2QgPT09ICdKU09OUCcpIHtcbiAgICAgICAgcHJvbWlzZSA9ICRodHRwLmpzb25wKGFqYXhDb25maWcudXJsICsgJz9jYWxsYmFjaz1KU09OX0NBTExCQUNLJywgYWpheENvbmZpZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9taXNlID0gJGh0dHAoYWpheENvbmZpZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgaXRlbXM6IGFkU3RyYXBVdGlscy5ldmFsT2JqZWN0UHJvcGVydHkocmVzdWx0LmRhdGEsIHBhZ2luZ0NvbmZpZy5yZXNwb25zZS5pdGVtc0xvY2F0aW9uKSxcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlOiBvcHRpb25zLnBhZ2VOdW1iZXIsXG4gICAgICAgICAgICB0b3RhbFBhZ2VzOiBNYXRoLmNlaWwoYWRTdHJhcFV0aWxzLmV2YWxPYmplY3RQcm9wZXJ0eShyZXN1bHQuZGF0YSwgcGFnaW5nQ29uZmlnLnJlc3BvbnNlLnRvdGFsSXRlbXMpIC8gb3B0aW9ucy5wYWdlU2l6ZSksXG4gICAgICAgICAgICBwYWdpbmdBcnJheTogW10sXG4gICAgICAgICAgICB0b2tlbjogb3B0aW9ucy50b2tlblxuICAgICAgICAgIH07XG4gICAgICAgIHZhciBUT1RBTF9QQUdJTkFUSU9OX0lURU1TID0gNTtcbiAgICAgICAgdmFyIG1pbmltdW1Cb3VuZCA9IG9wdGlvbnMucGFnZU51bWJlciAtIE1hdGguZmxvb3IoVE9UQUxfUEFHSU5BVElPTl9JVEVNUyAvIDIpO1xuICAgICAgICBmb3IgKHZhciBpID0gbWluaW11bUJvdW5kOyBpIDw9IG9wdGlvbnMucGFnZU51bWJlcjsgaSsrKSB7XG4gICAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICByZXNwb25zZS5wYWdpbmdBcnJheS5wdXNoKGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAocmVzcG9uc2UucGFnaW5nQXJyYXkubGVuZ3RoIDwgVE9UQUxfUEFHSU5BVElPTl9JVEVNUykge1xuICAgICAgICAgIGlmIChpID4gcmVzcG9uc2UudG90YWxQYWdlcykge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3BvbnNlLnBhZ2luZ0FycmF5LnB1c2goaSk7XG4gICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbl0pLmZhY3RvcnkoJ2FkTG9hZExvY2FsUGFnZScsIFtcbiAgJyRmaWx0ZXInLFxuICBmdW5jdGlvbiAoJGZpbHRlcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICAgIGl0ZW1zOiB1bmRlZmluZWQsXG4gICAgICAgICAgY3VycmVudFBhZ2U6IG9wdGlvbnMucGFnZU51bWJlcixcbiAgICAgICAgICB0b3RhbFBhZ2VzOiB1bmRlZmluZWQsXG4gICAgICAgICAgcGFnaW5nQXJyYXk6IFtdLFxuICAgICAgICAgIHRva2VuOiBvcHRpb25zLnRva2VuXG4gICAgICAgIH07XG4gICAgICB2YXIgc3RhcnQgPSAob3B0aW9ucy5wYWdlTnVtYmVyIC0gMSkgKiBvcHRpb25zLnBhZ2VTaXplLCBlbmQgPSBzdGFydCArIG9wdGlvbnMucGFnZVNpemUsIGksIGl0ZW1zT2JqZWN0ID0gb3B0aW9ucy5sb2NhbERhdGEsIGxvY2FsSXRlbXM7XG4gICAgICBsb2NhbEl0ZW1zID0gJGZpbHRlcignb3JkZXJCeScpKGl0ZW1zT2JqZWN0LCBvcHRpb25zLnNvcnRLZXksIG9wdGlvbnMuc29ydERpcmVjdGlvbik7XG4gICAgICByZXNwb25zZS5pdGVtcyA9IGxvY2FsSXRlbXMuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgICByZXNwb25zZS5hbGxJdGVtcyA9IGl0ZW1zT2JqZWN0O1xuICAgICAgcmVzcG9uc2UuY3VycmVudFBhZ2UgPSBvcHRpb25zLnBhZ2VOdW1iZXI7XG4gICAgICByZXNwb25zZS50b3RhbFBhZ2VzID0gTWF0aC5jZWlsKGl0ZW1zT2JqZWN0Lmxlbmd0aCAvIG9wdGlvbnMucGFnZVNpemUpO1xuICAgICAgdmFyIFRPVEFMX1BBR0lOQVRJT05fSVRFTVMgPSA1O1xuICAgICAgdmFyIG1pbmltdW1Cb3VuZCA9IG9wdGlvbnMucGFnZU51bWJlciAtIE1hdGguZmxvb3IoVE9UQUxfUEFHSU5BVElPTl9JVEVNUyAvIDIpO1xuICAgICAgZm9yIChpID0gbWluaW11bUJvdW5kOyBpIDw9IG9wdGlvbnMucGFnZU51bWJlcjsgaSsrKSB7XG4gICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgIHJlc3BvbnNlLnBhZ2luZ0FycmF5LnB1c2goaSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlIChyZXNwb25zZS5wYWdpbmdBcnJheS5sZW5ndGggPCBUT1RBTF9QQUdJTkFUSU9OX0lURU1TKSB7XG4gICAgICAgIGlmIChpID4gcmVzcG9uc2UudG90YWxQYWdlcykge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJlc3BvbnNlLnBhZ2luZ0FycmF5LnB1c2goaSk7XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9O1xuICB9XG5dKTtcblxufSkod2luZG93LCBkb2N1bWVudCk7XG4iLCIvKipcbiAqIGFkYXB0LXN0cmFwXG4gKiBAdmVyc2lvbiB2Mi4wLjYgLSAyMDE0LTEwLTI2XG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vQWRhcHR2L2FkYXB0LXN0cmFwXG4gKiBAYXV0aG9yIEthc2h5YXAgUGF0ZWwgKGthc2h5YXBAYWRhcC50dilcbiAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlLCBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4ndXNlIHN0cmljdCc7XG5cbi8vIFNvdXJjZTogaW5maW5pdGVkcm9wZG93bi50cGwuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC5pbmZpbml0ZWRyb3Bkb3duJykucnVuKFtcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgZnVuY3Rpb24gKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdpbmZpbml0ZWRyb3Bkb3duL2luZmluaXRlZHJvcGRvd24udHBsLmh0bWwnLCAnPGRpdiBjbGFzcz1cImFkLWluZmluaXRlLWxpc3QtY29udGFpbmVyXCI+PGRpdiBjbGFzcz1cImRyb3Bkb3duXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJkcm9wZG93bi10b2dnbGVcIiBuZy1jbGFzcz1cImF0dHJzLmJ0bkNsYXNzZXMgfHwgXFwnYnRuIGJ0bi1kZWZhdWx0XFwnXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiPjxzcGFuIG5nLWlmPVwiIWF0dHJzLmxhYmVsRGlzcGxheVByb3BlcnR5IHx8ICFzZWxlY3RlZEl0ZW1zLmxlbmd0aFwiPnt7IGF0dHJzLmluaXRpYWxMYWJlbCB8fCBcXCdTZWxlY3RcXCcgfX08L3NwYW4+IDxzcGFuIG5nLWlmPVwiYXR0cnMubGFiZWxEaXNwbGF5UHJvcGVydHkgJiYgc2VsZWN0ZWRJdGVtcy5sZW5ndGhcIj57eyByZWFkUHJvcGVydHkoc2VsZWN0ZWRJdGVtc1tzZWxlY3RlZEl0ZW1zLmxlbmd0aCAtIDFdLCBhdHRycy5sYWJlbERpc3BsYXlQcm9wZXJ0eSkgfX08L3NwYW4+IDxzcGFuIGNsYXNzPVwiY2FyZXRcIj48L3NwYW4+PC9idXR0b24+PHVsIGNsYXNzPVwiZHJvcGRvd24tbWVudVwiIHJvbGU9XCJtZW51XCIgbmctc3R5bGU9XCJsb2NhbENvbmZpZy5kaW1lbnNpb25zXCI+PGxpIGNsYXNzPVwidGV4dC1vdmVyZmxvd1wiIGRhdGEtbmctcmVwZWF0PVwiaXRlbSBpbiBpdGVtcy5saXN0XCIgbmctY2xhc3M9XCJ7XFwnYWN0aXZlXFwnOiBhZFN0cmFwVXRpbHMuaXRlbUV4aXN0c0luTGlzdChpdGVtLCBzZWxlY3RlZEl0ZW1zKX1cIiBuZy1jbGljaz1cImFkZFJlbW92ZUl0ZW0oJGV2ZW50LCBpdGVtLCBzZWxlY3RlZEl0ZW1zKVwiPjxhIHJvbGU9XCJtZW51aXRlbVwiIHRhYmluZGV4PVwiLTFcIiBocmVmPVwiXCI+PHNwYW4gbmctaWY9XCJhdHRycy5kaXNwbGF5UHJvcGVydHlcIj57eyBhZFN0cmFwVXRpbHMuZ2V0T2JqZWN0UHJvcGVydHkoaXRlbSwgYXR0cnMuZGlzcGxheVByb3BlcnR5KSB9fTwvc3Bhbj4gPHNwYW4gbmctaWY9XCJhdHRycy50ZW1wbGF0ZVwiIGFkLWNvbXBpbGUtdGVtcGxhdGU9XCJ7eyBhdHRycy50ZW1wbGF0ZSB9fVwiPjwvc3Bhbj4gPHNwYW4gbmctaWY9XCJhdHRycy50ZW1wbGF0ZVVybFwiIG5nLWluY2x1ZGU9XCJhdHRycy50ZW1wbGF0ZVVybFwiPjwvc3Bhbj48L2E+PC9saT48bGkgY2xhc3M9XCJ0ZXh0LW92ZXJmbG93IHRleHQtY2VudGVyXCIgbmctc3R5bGU9XCJ7XFwnb3BhY2l0eVxcJzogbG9jYWxDb25maWcubG9hZGluZ0RhdGEgPyAxIDogMH1cIj48YSByb2xlPVwibWVudWl0ZW1cIiB0YWJpbmRleD1cIi0xXCIgaHJlZj1cIlwiPjxhZC1sb2FkaW5nLWljb24+PC9hZC1sb2FkaW5nLWljb24+PC9hPjwvbGk+PC91bD48L2Rpdj48L2Rpdj4nKTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogbG9hZGluZ2luZGljYXRvci50cGwuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC5sb2FkaW5naW5kaWNhdG9yJykucnVuKFtcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgZnVuY3Rpb24gKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdsb2FkaW5naW5kaWNhdG9yL2xvYWRpbmdpbmRpY2F0b3IudHBsLmh0bWwnLCAnPGRpdiBjbGFzcz1cImFkLWxvYWRpbmctb3ZlcmxheS1jb250YWluZXJcIiBuZy1jbGFzcz1cImNvbnRhaW5lckNsYXNzZXNcIiBuZy1zdHlsZT1cIntcXCd6LWluZGV4XFwnOiB6SW5kZXggfHwgXFwnMTAwMFxcJyxcXCdwb3NpdGlvblxcJzogcG9zaXRpb24gfHwgXFwnYWJzb2x1dGVcXCd9XCIgbmctc2hvdz1cImxvYWRpbmdcIj48ZGl2IGNsYXNzPVwid3JhcHBlclwiPjxkaXYgY2xhc3M9XCJsb2FkaW5nLWluZGljYXRvclwiPjxhZC1sb2FkaW5nLWljb24gbG9hZGluZy1pY29uLXNpemU9XCJ7eyBsb2FkaW5nSWNvblNpemUgfX1cIiBsb2FkaW5nLWljb24tY2xhc3M9XCJ7eyBsb2FkaW5nSWNvbkNsYXNzIH19XCI+PC9hZC1sb2FkaW5nLWljb24+PC9kaXY+PC9kaXY+PC9kaXY+Jyk7XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IHRhYmxlYWpheC50cGwuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC50YWJsZWFqYXgnKS5ydW4oW1xuICAnJHRlbXBsYXRlQ2FjaGUnLFxuICBmdW5jdGlvbiAoJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3RhYmxlYWpheC90YWJsZWFqYXgudHBsLmh0bWwnLCAnPGRpdiBjbGFzcz1cImFkLXRhYmxlLWFqYXgtY29udGFpbmVyXCIgbmctaWY9XCJpdGVtcy5wYWdpbmcudG90YWxQYWdlcyB8fCBsb2NhbENvbmZpZy5sb2FkaW5nRGF0YSB8fCAhYXR0cnMuaXRlbXNOb3RGb3VuZE1lc3NhZ2VcIj48dGFibGUgY2xhc3M9XCJhZC1zdGlja3ktdGFibGVcIiBuZy1jbGFzcz1cImF0dHJzLnRhYmxlQ2xhc3NlcyB8fCBcXCd0YWJsZVxcJ1wiIG5nLWlmPVwibG9jYWxDb25maWcudGFibGVNYXhIZWlnaHRcIj48dHIgY2xhc3M9XCJhZC11c2VyLXNlbGVjdC1ub25lXCI+PHRoIGRhdGEtbmctcmVwZWF0PVwiZGVmaW5pdGlvbiBpbiBjb2x1bW5EZWZpbml0aW9uXCIgbmctY2xpY2s9XCJzb3J0QnlDb2x1bW4oZGVmaW5pdGlvbilcIiBuZy1jbGFzcz1cIntcXCdhZC1jdXJzb3ItcG9pbnRlclxcJzogZGVmaW5pdGlvbi5zb3J0S2V5fVwiIG5nLXN0eWxlPVwie1xcJ3dpZHRoXFwnOiBkZWZpbml0aW9uLndpZHRofVwiPjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlID09IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydEFzY2VuZGluZ1wiIG5nLWhpZGU9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPiA8aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnREZXNjZW5kaW5nXCIgbmctc2hvdz1cImxvY2FsQ29uZmlnLnJldmVyc2VcIj48L2k+PC9kaXY+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1pZj1cImRlZmluaXRpb24uc29ydEtleSAmJiBsb2NhbENvbmZpZy5wcmVkaWNhdGUgIT0gZGVmaW5pdGlvbi5zb3J0S2V5XCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0YWJsZVwiPjwvaT48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJUZW1wbGF0ZVwiIG5nLWJpbmQtaHRtbD1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIj48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiIG5nLWJpbmQ9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlckRpc3BsYXlOYW1lXCI+PC9kaXY+PC90aD48L3RyPjwvdGFibGU+PGRpdiBjbGFzcz1cImFkLXRhYmxlLWNvbnRhaW5lclwiIG5nLXN0eWxlPVwie1xcJ21heC1oZWlnaHRcXCc6IGxvY2FsQ29uZmlnLnRhYmxlTWF4SGVpZ2h0fVwiPjx0YWJsZSBuZy1jbGFzcz1cImF0dHJzLnRhYmxlQ2xhc3NlcyB8fCBcXCd0YWJsZVxcJ1wiPjx0ciBjbGFzcz1cImFkLXVzZXItc2VsZWN0LW5vbmVcIiBuZy1pZj1cIiFsb2NhbENvbmZpZy50YWJsZU1heEhlaWdodFwiPjx0aCBkYXRhLW5nLXJlcGVhdD1cImRlZmluaXRpb24gaW4gY29sdW1uRGVmaW5pdGlvblwiIG5nLWNsaWNrPVwic29ydEJ5Q29sdW1uKGRlZmluaXRpb24pXCIgbmctY2xhc3M9XCJ7XFwnYWQtY3Vyc29yLXBvaW50ZXJcXCc6IGRlZmluaXRpb24uc29ydEtleX1cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9PSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRBc2NlbmRpbmdcIiBuZy1oaWRlPVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT4gPGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0RGVzY2VuZGluZ1wiIG5nLXNob3c9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPjwvZGl2PjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlICE9IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydGFibGVcIj48L2k+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIiBuZy1iaW5kLWh0bWw9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCI+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIiBuZy1iaW5kPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiPjwvZGl2PjwvdGg+PC90cj48dHIgZGF0YS1uZy1yZXBlYXQ9XCJpdGVtIGluIGl0ZW1zLmxpc3RcIj48dGQgZGF0YS1uZy1yZXBlYXQ9XCJkZWZpbml0aW9uIGluIGNvbHVtbkRlZmluaXRpb25cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVVybFwiPjxuZy1pbmNsdWRlIHNyYz1cImRlZmluaXRpb24udGVtcGxhdGVVcmxcIj48L25nLWluY2x1ZGU+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24udGVtcGxhdGVcIj48c3BhbiBhZC1jb21waWxlLXRlbXBsYXRlPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPjwvc3Bhbj48L2Rpdj48ZGl2IG5nLWlmPVwiIWRlZmluaXRpb24udGVtcGxhdGVVcmwgJiYgIWRlZmluaXRpb24udGVtcGxhdGVcIj57eyBhZFN0cmFwVXRpbHMuYXBwbHlGaWx0ZXIoYWRTdHJhcFV0aWxzLmdldE9iamVjdFByb3BlcnR5KGl0ZW0sIGRlZmluaXRpb24uZGlzcGxheVByb3BlcnR5LCBpdGVtKSwgZGVmaW5pdGlvbi5jZWxsRmlsdGVyKSB9fTwvZGl2PjwvdGQ+PC90cj48L3RhYmxlPjxhZC1sb2FkaW5nLW92ZXJsYXkgbG9hZGluZz1cImxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhXCI+PC9hZC1sb2FkaW5nLW92ZXJsYXk+PC9kaXY+PGRpdiBjbGFzcz1cInJvd1wiPjxkaXYgY2xhc3M9XCJjb2wtbWQtOCBjb2wtc20tOFwiPjxkaXYgY2xhc3M9XCJwdWxsLWxlZnRcIiBuZy1jbGFzcz1cImF0dHJzLnBhZ2luYXRpb25CdG5Hcm91cENsYXNzZXMgfHwgXFwnYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVxcJ1wiIG5nLXNob3c9XCJpdGVtcy5wYWdpbmcudG90YWxQYWdlcyA+IDFcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWNsaWNrPVwibG9hZFBhZ2UoMSlcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSAxXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5maXJzdFBhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctY2xpY2s9XCJsb2FkUHJldmlvdXNQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSAxXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5wcmV2aW91c1BhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctcmVwZWF0PVwicGFnZSBpbiBsb2NhbENvbmZpZy5wYWdpbmdBcnJheVwiIG5nLWNsYXNzPVwie2FjdGl2ZTogaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IHBhZ2V9XCIgbmctY2xpY2s9XCJsb2FkUGFnZShwYWdlKVwiPnt7IHBhZ2UgfX08L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1jbGljaz1cImxvYWROZXh0UGFnZSgpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gaXRlbXMucGFnaW5nLnRvdGFsUGFnZXNcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLm5leHRQYWdlXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWNsaWNrPVwibG9hZExhc3RQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSBpdGVtcy5wYWdpbmcudG90YWxQYWdlc1wiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMubGFzdFBhZ2VcIj48L2k+PC9idXR0b24+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cImNvbC1tZC00IGNvbC1zbS00XCI+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1jbGFzcz1cImF0dHJzLnBhZ2luYXRpb25CdG5Hcm91cENsYXNzZXMgfHwgXFwnYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVxcJ1wiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctcmVwZWF0PVwic2l6ZSBpbiBpdGVtcy5wYWdpbmcucGFnZVNpemVzXCIgbmctY2xhc3M9XCJ7YWN0aXZlOiBpdGVtcy5wYWdpbmcucGFnZVNpemUgPT0gc2l6ZX1cIiBuZy1jbGljaz1cInBhZ2VTaXplQ2hhbmdlZChzaXplKVwiPnt7IHNpemUgfX08L2J1dHRvbj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IG5nLWlmPVwiIWl0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzICYmICFsb2NhbENvbmZpZy5sb2FkaW5nRGF0YSAmJiBhdHRycy5pdGVtc05vdEZvdW5kTWVzc2FnZVwiPjxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1pbmZvXCIgcm9sZT1cImFsZXJ0XCI+e3sgYXR0cnMuaXRlbXNOb3RGb3VuZE1lc3NhZ2UgfX08L2Rpdj48L2Rpdj4nKTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogdGFibGVsaXRlLnRwbC5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLnRhYmxlbGl0ZScpLnJ1bihbXG4gICckdGVtcGxhdGVDYWNoZScsXG4gIGZ1bmN0aW9uICgkdGVtcGxhdGVDYWNoZSkge1xuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgndGFibGVsaXRlL3RhYmxlbGl0ZS50cGwuaHRtbCcsICc8ZGl2IGNsYXNzPVwiYWQtdGFibGUtbGl0ZS1jb250YWluZXJcIiBuZy1pZj1cIml0ZW1zLmFsbEl0ZW1zLmxlbmd0aCB8fCAhYXR0cnMuaXRlbXNOb3RGb3VuZE1lc3NhZ2VcIj48dGFibGUgY2xhc3M9XCJhZC1zdGlja3ktdGFibGVcIiBuZy1jbGFzcz1cImF0dHJzLnRhYmxlQ2xhc3NlcyB8fCBcXCd0YWJsZVxcJ1wiIG5nLWlmPVwiYXR0cnMudGFibGVNYXhIZWlnaHRcIj48dHIgY2xhc3M9XCJhZC11c2VyLXNlbGVjdC1ub25lXCI+PHRoIGNsYXNzPVwiYWQtc2VsZWN0LWNlbGxcIiBuZy1pZj1cImF0dHJzLmRyYWdnYWJsZVwiPjxpPjwvaT48L3RoPjx0aCBjbGFzcz1cImFkLXNlbGVjdC1jZWxsXCIgbmctaWY9XCJhdHRycy5zZWxlY3RlZEl0ZW1zICYmIGl0ZW1zLmFsbEl0ZW1zXCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiYWQtY3Vyc29yLXBvaW50ZXJcIiBuZy1jbGljaz1cImFkU3RyYXBVdGlscy5hZGRSZW1vdmVJdGVtc0Zyb21MaXN0KGl0ZW1zLmFsbEl0ZW1zLCBzZWxlY3RlZEl0ZW1zKVwiIG5nLWNoZWNrZWQ9XCJhZFN0cmFwVXRpbHMuaXRlbXNFeGlzdEluTGlzdChpdGVtcy5hbGxJdGVtcywgc2VsZWN0ZWRJdGVtcylcIj48L3RoPjx0aCBkYXRhLW5nLXJlcGVhdD1cImRlZmluaXRpb24gaW4gY29sdW1uRGVmaW5pdGlvblwiIG5nLWNsaWNrPVwic29ydEJ5Q29sdW1uKGRlZmluaXRpb24pXCIgbmctY2xhc3M9XCJ7XFwnYWQtY3Vyc29yLXBvaW50ZXJcXCc6IGRlZmluaXRpb24uc29ydEtleX1cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9PSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRBc2NlbmRpbmdcIiBuZy1oaWRlPVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT4gPGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0RGVzY2VuZGluZ1wiIG5nLXNob3c9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPjwvZGl2PjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlICE9IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydGFibGVcIj48L2k+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIiBuZy1iaW5kLWh0bWw9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCI+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIiBuZy1iaW5kPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiPjwvZGl2PjwvdGg+PC90cj48L3RhYmxlPjxkaXYgY2xhc3M9XCJhZC10YWJsZS1jb250YWluZXJcIiBuZy1zdHlsZT1cIntcXCdtYXgtaGVpZ2h0XFwnOiBhdHRycy50YWJsZU1heEhlaWdodH1cIj48dGFibGUgbmctY2xhc3M9XCJhdHRycy50YWJsZUNsYXNzZXMgfHwgXFwndGFibGVcXCdcIj48dHIgY2xhc3M9XCJhZC11c2VyLXNlbGVjdC1ub25lXCIgbmctaWY9XCIhYXR0cnMudGFibGVNYXhIZWlnaHRcIj48dGggY2xhc3M9XCJhZC1zZWxlY3QtY2VsbFwiIG5nLWlmPVwiYXR0cnMuZHJhZ2dhYmxlXCI+PGk+PC9pPjwvdGg+PHRoIGNsYXNzPVwiYWQtc2VsZWN0LWNlbGxcIiBuZy1pZj1cImF0dHJzLnNlbGVjdGVkSXRlbXMgJiYgaXRlbXMuYWxsSXRlbXNcIj48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJhZC1jdXJzb3ItcG9pbnRlclwiIG5nLWNsaWNrPVwiYWRTdHJhcFV0aWxzLmFkZFJlbW92ZUl0ZW1zRnJvbUxpc3QoaXRlbXMuYWxsSXRlbXMsIHNlbGVjdGVkSXRlbXMpXCIgbmctY2hlY2tlZD1cImFkU3RyYXBVdGlscy5pdGVtc0V4aXN0SW5MaXN0KGl0ZW1zLmFsbEl0ZW1zLCBzZWxlY3RlZEl0ZW1zKVwiPjwvdGg+PHRoIGRhdGEtbmctcmVwZWF0PVwiZGVmaW5pdGlvbiBpbiBjb2x1bW5EZWZpbml0aW9uXCIgbmctY2xpY2s9XCJzb3J0QnlDb2x1bW4oZGVmaW5pdGlvbilcIiBuZy1jbGFzcz1cIntcXCdhZC1jdXJzb3ItcG9pbnRlclxcJzogZGVmaW5pdGlvbi5zb3J0S2V5fVwiIG5nLXN0eWxlPVwie1xcJ3dpZHRoXFwnOiBkZWZpbml0aW9uLndpZHRofVwiPjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlID09IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydEFzY2VuZGluZ1wiIG5nLWhpZGU9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPiA8aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnREZXNjZW5kaW5nXCIgbmctc2hvdz1cImxvY2FsQ29uZmlnLnJldmVyc2VcIj48L2k+PC9kaXY+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1pZj1cImRlZmluaXRpb24uc29ydEtleSAmJiBsb2NhbENvbmZpZy5wcmVkaWNhdGUgIT0gZGVmaW5pdGlvbi5zb3J0S2V5XCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0YWJsZVwiPjwvaT48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJUZW1wbGF0ZVwiIG5nLWJpbmQtaHRtbD1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIj48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiIG5nLWJpbmQ9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlckRpc3BsYXlOYW1lXCI+PC9kaXY+PC90aD48L3RyPjx0ciBuZy1pZj1cIiFhdHRycy5kcmFnZ2FibGVcIiBkYXRhLW5nLXJlcGVhdD1cIml0ZW0gaW4gaXRlbXMubGlzdFwiIG5nLWNsYXNzPVwie1xcJ2FkLXNlbGVjdGVkXFwnOiBhdHRycy5zZWxlY3RlZEl0ZW1zICYmIGFkU3RyYXBVdGlscy5pdGVtRXhpc3RzSW5MaXN0KGl0ZW0sIHNlbGVjdGVkSXRlbXMpfVwiPjx0ZCBjbGFzcz1cImFkLXNlbGVjdC1jZWxsXCIgbmctaWY9XCJhdHRycy5zZWxlY3RlZEl0ZW1zXCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiYWQtY3Vyc29yLXBvaW50ZXJcIiBuZy1jaGVja2VkPVwiYWRTdHJhcFV0aWxzLml0ZW1FeGlzdHNJbkxpc3QoaXRlbSwgc2VsZWN0ZWRJdGVtcylcIiBuZy1jbGljaz1cImFkU3RyYXBVdGlscy5hZGRSZW1vdmVJdGVtRnJvbUxpc3QoaXRlbSwgc2VsZWN0ZWRJdGVtcylcIj48L3RkPjx0ZCBkYXRhLW5nLXJlcGVhdD1cImRlZmluaXRpb24gaW4gY29sdW1uRGVmaW5pdGlvblwiIG5nLXN0eWxlPVwie1xcJ3dpZHRoXFwnOiBkZWZpbml0aW9uLndpZHRofVwiPjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLnRlbXBsYXRlVXJsXCI+PG5nLWluY2x1ZGUgc3JjPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVVybFwiPjwvbmctaW5jbHVkZT48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPjxzcGFuIGFkLWNvbXBpbGUtdGVtcGxhdGU9XCJkZWZpbml0aW9uLnRlbXBsYXRlXCI+PC9zcGFuPjwvZGl2PjxkaXYgbmctaWY9XCIhZGVmaW5pdGlvbi50ZW1wbGF0ZVVybCAmJiAhZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPnt7IGFkU3RyYXBVdGlscy5hcHBseUZpbHRlcihhZFN0cmFwVXRpbHMuZ2V0T2JqZWN0UHJvcGVydHkoaXRlbSwgZGVmaW5pdGlvbi5kaXNwbGF5UHJvcGVydHkpLCBkZWZpbml0aW9uLmNlbGxGaWx0ZXIpIH19PC9kaXY+PC90ZD48L3RyPjx0ciBuZy1pZj1cImF0dHJzLmRyYWdnYWJsZVwiIGFkLWRyYWc9XCJ0cnVlXCIgYWQtZHJhZy1oYW5kbGU9XCJ0cnVlXCIgYWQtZHJvcD1cInRydWVcIiBhZC1kcmFnLWRhdGE9XCJpdGVtXCIgYWQtZHJvcC1vdmVyPVwib25EcmFnT3ZlcigkZGF0YSwgJGRyYWdFbGVtZW50LCAkZHJvcEVsZW1lbnQsICRldmVudClcIiBhZC1kcm9wLWVuZD1cIm9uRHJvcEVuZCgkZGF0YSwgJGRyYWdFbGVtZW50LCAkZHJvcEVsZW1lbnQsICRldmVudClcIiBhZC1kcmFnLWJlZ2luPVwib25EcmFnU3RhcnQoJGRhdGEsICRkcmFnRWxlbWVudCwgJGV2ZW50KVwiIGFkLWRyYWctZW5kPVwib25EcmFnRW5kKCRkYXRhLCAkZHJhZ0VsZW1lbnQsICRldmVudClcIiBkYXRhLW5nLXJlcGVhdD1cIml0ZW0gaW4gaXRlbXMubGlzdFwiIG5nLWNsYXNzPVwie1xcJ2FkLXNlbGVjdGVkXFwnOiBhdHRycy5zZWxlY3RlZEl0ZW1zICYmIGFkU3RyYXBVdGlscy5pdGVtRXhpc3RzSW5MaXN0KGl0ZW0sIHNlbGVjdGVkSXRlbXMpfVwiPjx0ZCBjbGFzcz1cImFkLXNlbGVjdC1jZWxsIGFkLWRyYWctaGFuZGxlXCIgbmctaWY9XCJhdHRycy5kcmFnZ2FibGVcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLmRyYWdnYWJsZVwiPjwvaT48L3RkPjx0ZCBjbGFzcz1cImFkLXNlbGVjdC1jZWxsXCIgbmctaWY9XCJhdHRycy5zZWxlY3RlZEl0ZW1zXCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiYWQtY3Vyc29yLXBvaW50ZXJcIiBuZy1jaGVja2VkPVwiYWRTdHJhcFV0aWxzLml0ZW1FeGlzdHNJbkxpc3QoaXRlbSwgc2VsZWN0ZWRJdGVtcylcIiBuZy1jbGljaz1cImFkU3RyYXBVdGlscy5hZGRSZW1vdmVJdGVtRnJvbUxpc3QoaXRlbSwgc2VsZWN0ZWRJdGVtcylcIj48L3RkPjx0ZCBkYXRhLW5nLXJlcGVhdD1cImRlZmluaXRpb24gaW4gY29sdW1uRGVmaW5pdGlvblwiIG5nLXN0eWxlPVwie1xcJ3dpZHRoXFwnOiBkZWZpbml0aW9uLndpZHRofVwiPjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLnRlbXBsYXRlVXJsXCI+PG5nLWluY2x1ZGUgc3JjPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVVybFwiPjwvbmctaW5jbHVkZT48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPjxzcGFuIGFkLWNvbXBpbGUtdGVtcGxhdGU9XCJkZWZpbml0aW9uLnRlbXBsYXRlXCI+PC9zcGFuPjwvZGl2PjxkaXYgbmctaWY9XCIhZGVmaW5pdGlvbi50ZW1wbGF0ZVVybCAmJiAhZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPnt7IGFkU3RyYXBVdGlscy5hcHBseUZpbHRlcihhZFN0cmFwVXRpbHMuZ2V0T2JqZWN0UHJvcGVydHkoaXRlbSwgZGVmaW5pdGlvbi5kaXNwbGF5UHJvcGVydHkpLCBkZWZpbml0aW9uLmNlbGxGaWx0ZXIpIH19PC9kaXY+PC90ZD48L3RyPjwvdGFibGU+PC9kaXY+PGRpdiBjbGFzcz1cInJvd1wiIG5nLWlmPVwiaXRlbXMuYWxsSXRlbXMubGVuZ3RoID4gaXRlbXMucGFnaW5nLnBhZ2VTaXplc1swXSAmJiAhYXR0cnMuZGlzYWJsZVBhZ2luZ1wiPjxkaXYgY2xhc3M9XCJjb2wtbWQtOCBjb2wtc20tOFwiPjxkaXYgY2xhc3M9XCJwdWxsLWxlZnRcIiBuZy1jbGFzcz1cImF0dHJzLnBhZ2luYXRpb25CdG5Hcm91cENsYXNzZXMgfHwgXFwnYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVxcJ1wiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctY2xpY2s9XCJsb2FkUGFnZSgxKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IDFcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLmZpcnN0UGFnZVwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1pZj1cIiFhdHRycy5kcmFnZ2FibGVcIiBuZy1jbGljaz1cImxvYWRQcmV2aW91c1BhZ2UoKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IDFcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnByZXZpb3VzUGFnZVwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgaWQ9XCJidG5QcmV2XCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1pZj1cImF0dHJzLmRyYWdnYWJsZVwiIGFkLWRyb3A9XCJ0cnVlXCIgYWQtZHJvcC1vdmVyPVwib25OZXh0UGFnZUJ1dHRvbk92ZXIoJGRhdGEsICRkcmFnRWxlbWVudCwgJGRyb3BFbGVtZW50LCAkZXZlbnQpXCIgYWQtZHJvcC1lbmQ9XCJvbk5leHRQYWdlQnV0dG9uRHJvcCgkZGF0YSwgJGRyYWdFbGVtZW50LCAkZHJvcEVsZW1lbnQsICRldmVudClcIiBuZy1jbGljaz1cImxvYWRQcmV2aW91c1BhZ2UoKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IDFcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnByZXZpb3VzUGFnZVwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1yZXBlYXQ9XCJwYWdlIGluIGxvY2FsQ29uZmlnLnBhZ2luZ0FycmF5XCIgbmctY2xhc3M9XCJ7YWN0aXZlOiBpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gcGFnZX1cIiBuZy1jbGljaz1cImxvYWRQYWdlKHBhZ2UpXCI+e3sgcGFnZSB9fTwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWlmPVwiIWF0dHJzLmRyYWdnYWJsZVwiIG5nLWNsaWNrPVwibG9hZE5leHRQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSBpdGVtcy5wYWdpbmcudG90YWxQYWdlc1wiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMubmV4dFBhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgaWQ9XCJidG5OZXh0XCIgbmctaWY9XCJhdHRycy5kcmFnZ2FibGVcIiBhZC1kcm9wPVwidHJ1ZVwiIGFkLWRyb3Atb3Zlcj1cIm9uTmV4dFBhZ2VCdXR0b25PdmVyKCRkYXRhLCAkZHJhZ0VsZW1lbnQsICRkcm9wRWxlbWVudCwgJGV2ZW50KVwiIGFkLWRyb3AtZW5kPVwib25OZXh0UGFnZUJ1dHRvbkRyb3AoJGRhdGEsICRkcmFnRWxlbWVudCwgJGRyb3BFbGVtZW50LCAkZXZlbnQpXCIgbmctY2xpY2s9XCJsb2FkTmV4dFBhZ2UoKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IGl0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5uZXh0UGFnZVwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1jbGljaz1cImxvYWRMYXN0UGFnZSgpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gaXRlbXMucGFnaW5nLnRvdGFsUGFnZXNcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLmxhc3RQYWdlXCI+PC9pPjwvYnV0dG9uPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJjb2wtbWQtNCBjb2wtc20tNFwiPjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctY2xhc3M9XCJhdHRycy5wYWdpbmF0aW9uQnRuR3JvdXBDbGFzc2VzIHx8IFxcJ2J0bi1ncm91cCBidG4tZ3JvdXAtc21cXCdcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLXJlcGVhdD1cInNpemUgaW4gaXRlbXMucGFnaW5nLnBhZ2VTaXplc1wiIG5nLWNsYXNzPVwie2FjdGl2ZTogaXRlbXMucGFnaW5nLnBhZ2VTaXplID09IHNpemV9XCIgbmctY2xpY2s9XCJwYWdlU2l6ZUNoYW5nZWQoc2l6ZSlcIj57eyBzaXplIH19PC9idXR0b24+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBuZy1pZj1cIiFpdGVtcy5hbGxJdGVtcy5sZW5ndGggJiYgYXR0cnMuaXRlbXNOb3RGb3VuZE1lc3NhZ2VcIj48ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtaW5mb1wiIHJvbGU9XCJhbGVydFwiPnt7IGF0dHJzLml0ZW1zTm90Rm91bmRNZXNzYWdlIH19PC9kaXY+PC9kaXY+Jyk7XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IHRyZWVicm93c2VyLnRwbC5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLnRyZWVicm93c2VyJykucnVuKFtcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgZnVuY3Rpb24gKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCd0cmVlYnJvd3Nlci90cmVlYnJvd3Nlci50cGwuaHRtbCcsICc8ZGl2IGNsYXNzPVwiYWQtdHJlZS1icm93c2VyLWNvbnRhaW5lclwiIG5nLWNsYXNzPVwie1xcJ3RyZWUtYm9yZGVyZWRcXCc6IGF0dHJzLmJvcmRlcmVkfVwiPjxkaXYgZGF0YS1sZXZlbD1cIjBcIiBjbGFzcz1cInRyZWUtdmlld1wiPjxkaXYgY2xhc3M9XCJ0cmVlXCI+PHNjcmlwdCB0eXBlPVwidGV4dC9uZy10ZW1wbGF0ZVwiIGlkPVwie3sgbG9jYWxDb25maWcucmVuZGVyZXJUZW1wbGF0ZUlkIH19XCI+PGRpdiBjbGFzcz1cImNvbnRlbnRcIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgbmctc3R5bGU9XCJ7XFwncGFkZGluZy1sZWZ0XFwnOiBsZXZlbCAqIChhdHRycy5jaGlsZHJlblBhZGRpbmcgfHwgMTUpICsgXFwncHhcXCd9XCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgIG5nLWNsYXNzPVwie3sgYXR0cnMucm93TmdDbGFzcyB9fVwiPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudC1ob2xkZXJcIj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0b2dnbGVcIj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBuZy1pZj1cIiFpdGVtLl9hZF9leHBhbmRlZCAmJiBoYXNDaGlsZHJlbihpdGVtKSAmJiAhaXRlbS5fYWRfbG9hZGluZ1wiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5leHBhbmRcIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwidG9nZ2xlKCRldmVudCxpdGVtKVwiPjwvaT5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBuZy1pZj1cIml0ZW0uX2FkX2V4cGFuZGVkICYmICFpdGVtLl9hZF9sb2FkaW5nXCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cImljb25DbGFzc2VzLmNvbGxhcHNlXCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cInRvZ2dsZSgkZXZlbnQsaXRlbSlcIj48L2k+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gbmctaWY9XCJpdGVtLl9hZF9sb2FkaW5nXCI+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMubG9hZGluZ1NwaW5uZXJcIj48L2k+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibm9kZS1jb250ZW50XCI+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1pbmNsdWRlIG5nLWlmPVwiYXR0cnMubm9kZVRlbXBsYXRlVXJsXCIgc3JjPVwiYXR0cnMubm9kZVRlbXBsYXRlVXJsXCI+PC9uZy1pbmNsdWRlPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBuZy1pZj1cIiFhdHRycy5ub2RlVGVtcGxhdGVVcmxcIj57eyBpdGVtLm5hbWUgfHwgXCJcIiB9fTwvc3Bhbj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgKyAnICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICsgJyAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICsgJyAgICAgICAgICAgICAgICA8ZGl2IG5nLXNob3c9XCJpdGVtLl9hZF9leHBhbmRlZFwiPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidHJlZS1sZXZlbCB0cmVlLXN1Yi1sZXZlbFwiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2FkPVwibGV2ZWw9bGV2ZWwrMVwiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgbmctcmVwZWF0PVwiaXRlbSBpbiBpdGVtW2F0dHJzLmNoaWxkTm9kZV1cIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWluY2x1ZGU9XCJcXCd7eyBsb2NhbENvbmZpZy5yZW5kZXJlclRlbXBsYXRlSWQgfX1cXCdcIj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArICcgICAgICAgICAgICAgICAgPC9kaXY+PC9zY3JpcHQ+PGRpdj48ZGl2IGNsYXNzPVwidHJlZS1sZXZlbCB0cmVlLWhlYWRlci1sZXZlbCBib3JkZXJcIiBuZy1pZj1cImF0dHJzLm5vZGVIZWFkZXJVcmxcIj48ZGl2IGNsYXNzPVwiY29udGVudFwiIG5nLXN0eWxlPVwie1xcJ3BhZGRpbmctbGVmdFxcJzogKGF0dHJzLmNoaWxkcmVuUGFkZGluZyB8fCAxNSkgKyBcXCdweFxcJ31cIj48ZGl2IGNsYXNzPVwiY29udGVudC1ob2xkZXJcIj48ZGl2IGNsYXNzPVwidG9nZ2xlXCI+PC9kaXY+PGRpdiBjbGFzcz1cIm5vZGUtY29udGVudCBhZC11c2VyLXNlbGVjdC1ub25lXCIgbmctaW5jbHVkZT1cImF0dHJzLm5vZGVIZWFkZXJVcmxcIj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwidHJlZS1sZXZlbCB0cmVlLXRvcC1sZXZlbCBib3JkZXJcIiBvbmxvYWQ9XCJsZXZlbCA9IDFcIiBuZy1yZXBlYXQ9XCJpdGVtIGluIHRyZWVSb290W2F0dHJzLmNoaWxkTm9kZV1cIiBuZy1pbmNsdWRlPVwiXFwne3sgbG9jYWxDb25maWcucmVuZGVyZXJUZW1wbGF0ZUlkIH19XFwnXCI+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+Jyk7XG4gIH1cbl0pO1xuXG5cbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xuIiwiLyoqXG4gKiBhbmd1bGFyLWdyb3dsLXYyIC0gdjAuNy4wIC0gMjAxNC0wOC0xMFxuICogaHR0cDovL2phbnN0ZXZlbnMuZ2l0aHViLmlvL2FuZ3VsYXItZ3Jvd2wtMlxuICogQ29weXJpZ2h0IChjKSAyMDE0IE1hcmNvIFJpbmNrLEphbiBTdGV2ZW5zOyBMaWNlbnNlZCBNSVRcbiAqL1xuYW5ndWxhci5tb2R1bGUoXCJhbmd1bGFyLWdyb3dsXCIsW10pLGFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhci1ncm93bFwiKS5kaXJlY3RpdmUoXCJncm93bFwiLFtcIiRyb290U2NvcGVcIixcIiRzY2VcIixmdW5jdGlvbihhLGIpe1widXNlIHN0cmljdFwiO3JldHVybntyZXN0cmljdDpcIkFcIix0ZW1wbGF0ZVVybDpcInRlbXBsYXRlcy9ncm93bC9ncm93bC5odG1sXCIscmVwbGFjZTohMSxzY29wZTp7cmVmZXJlbmNlOlwiQFwiLGlubGluZTpcIkBcIixsaW1pdE1lc3NhZ2VzOlwiPVwifSxjb250cm9sbGVyOltcIiRzY29wZVwiLFwiJHRpbWVvdXRcIixcImdyb3dsXCIsZnVuY3Rpb24oYyxkLGUpe2Z1bmN0aW9uIGYoYSl7ZChmdW5jdGlvbigpe3ZhciBmLGg7aWYoIWd8fChhbmd1bGFyLmZvckVhY2goYy5tZXNzYWdlcyxmdW5jdGlvbihjKXtoPWIuZ2V0VHJ1c3RlZEh0bWwoYy50ZXh0KSxhLnRleHQ9PT1oJiZhLnNldmVyaXR5PT09Yy5zZXZlcml0eSYmYy50aXRsZT09PWMudGl0bGUmJihmPSEwKX0pLCFmKSl7aWYoYS50ZXh0PWIudHJ1c3RBc0h0bWwoU3RyaW5nKGEudGV4dCkpLGEudHRsJiYtMSE9PWEudHRsJiYoYS5jb3VudGRvd249YS50dGwvMWUzLGEucHJvbWlzZXM9W10sYS5jbG9zZT0hMSxhLmNvdW50ZG93bkZ1bmN0aW9uPWZ1bmN0aW9uKCl7YS5jb3VudGRvd24+MT8oYS5jb3VudGRvd24tLSxhLnByb21pc2VzLnB1c2goZChhLmNvdW50ZG93bkZ1bmN0aW9uLDFlMykpKTphLmNvdW50ZG93bi0tfSksYW5ndWxhci5pc0RlZmluZWQoYy5saW1pdE1lc3NhZ2VzKSl7dmFyIGk9Yy5tZXNzYWdlcy5sZW5ndGgtKGMubGltaXRNZXNzYWdlcy0xKTtpPjAmJmMubWVzc2FnZXMuc3BsaWNlKGMubGltaXRNZXNzYWdlcy0xLGkpfWUucmV2ZXJzZU9yZGVyKCk/Yy5tZXNzYWdlcy51bnNoaWZ0KGEpOmMubWVzc2FnZXMucHVzaChhKSxhLnR0bCYmLTEhPT1hLnR0bCYmKGEucHJvbWlzZXMucHVzaChkKGZ1bmN0aW9uKCl7Yy5kZWxldGVNZXNzYWdlKGEpfSxhLnR0bCkpLGEucHJvbWlzZXMucHVzaChkKGEuY291bnRkb3duRnVuY3Rpb24sMWUzKSkpfX0sITApfXZhciBnPWUub25seVVuaXF1ZSgpO2MubWVzc2FnZXM9W107dmFyIGg9Yy5yZWZlcmVuY2V8fDA7Yy5pbmxpbmVNZXNzYWdlPWMuaW5saW5lfHxlLmlubGluZU1lc3NhZ2VzKCksYS4kb24oXCJncm93bE1lc3NhZ2VcIixmdW5jdGlvbihhLGIpe3BhcnNlSW50KGgsMTApPT09cGFyc2VJbnQoYi5yZWZlcmVuY2VJZCwxMCkmJmYoYil9KSxjLmRlbGV0ZU1lc3NhZ2U9ZnVuY3Rpb24oYSl7dmFyIGI9Yy5tZXNzYWdlcy5pbmRleE9mKGEpO2I+LTEmJmMubWVzc2FnZXMuc3BsaWNlKGIsMSl9LGMuc3RvcFRpbWVvdXRDbG9zZT1mdW5jdGlvbihhKXthbmd1bGFyLmZvckVhY2goYS5wcm9taXNlcyxmdW5jdGlvbihhKXtkLmNhbmNlbChhKX0pLGEuY2xvc2U/Yy5kZWxldGVNZXNzYWdlKGEpOmEuY2xvc2U9ITB9LGMuYWxlcnRDbGFzc2VzPWZ1bmN0aW9uKGEpe3JldHVybntcImFsZXJ0LXN1Y2Nlc3NcIjpcInN1Y2Nlc3NcIj09PWEuc2V2ZXJpdHksXCJhbGVydC1lcnJvclwiOlwiZXJyb3JcIj09PWEuc2V2ZXJpdHksXCJhbGVydC1kYW5nZXJcIjpcImVycm9yXCI9PT1hLnNldmVyaXR5LFwiYWxlcnQtaW5mb1wiOlwiaW5mb1wiPT09YS5zZXZlcml0eSxcImFsZXJ0LXdhcm5pbmdcIjpcIndhcm5pbmdcIj09PWEuc2V2ZXJpdHksaWNvbjphLmRpc2FibGVJY29ucz09PSExLFwiYWxlcnQtZGlzbWlzc2FibGVcIjohYS5kaXNhYmxlQ2xvc2VCdXR0b259fSxjLnNob3dDb3VudERvd249ZnVuY3Rpb24oYSl7cmV0dXJuIWEuZGlzYWJsZUNvdW50RG93biYmYS50dGw+MH0sYy53cmFwcGVyQ2xhc3Nlcz1mdW5jdGlvbigpe3ZhciBhPXt9O3JldHVybiBhW1wiZ3Jvd2wtZml4ZWRcIl09IWMuaW5saW5lTWVzc2FnZSxhW2UucG9zaXRpb24oKV09ITAsYX0sYy5jb21wdXRlVGl0bGU9ZnVuY3Rpb24oYSl7dmFyIGI9e3N1Y2Nlc3M6XCJTdWNjZXNzXCIsZXJyb3I6XCJFcnJvclwiLGluZm86XCJJbmZvcm1hdGlvblwiLHdhcm46XCJXYXJuaW5nXCJ9O3JldHVybiBiW2Euc2V2ZXJpdHldfX1dfX1dKSxhbmd1bGFyLm1vZHVsZShcImFuZ3VsYXItZ3Jvd2xcIikucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsZnVuY3Rpb24oYSl7XCJ1c2Ugc3RyaWN0XCI7dm9pZCAwPT09YS5nZXQoXCJ0ZW1wbGF0ZXMvZ3Jvd2wvZ3Jvd2wuaHRtbFwiKSYmYS5wdXQoXCJ0ZW1wbGF0ZXMvZ3Jvd2wvZ3Jvd2wuaHRtbFwiLCc8ZGl2IGNsYXNzPVwiZ3Jvd2wtY29udGFpbmVyXCIgbmctY2xhc3M9XCJ3cmFwcGVyQ2xhc3NlcygpXCI+PGRpdiBjbGFzcz1cImdyb3dsLWl0ZW0gYWxlcnRcIiBuZy1yZXBlYXQ9XCJtZXNzYWdlIGluIG1lc3NhZ2VzXCIgbmctY2xhc3M9XCJhbGVydENsYXNzZXMobWVzc2FnZSlcIiBuZy1jbGljaz1cInN0b3BUaW1lb3V0Q2xvc2UobWVzc2FnZSlcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgZGF0YS1kaXNtaXNzPVwiYWxlcnRcIiBhcmlhLWhpZGRlbj1cInRydWVcIiBuZy1jbGljaz1cImRlbGV0ZU1lc3NhZ2UobWVzc2FnZSlcIiBuZy1zaG93PVwiIW1lc3NhZ2UuZGlzYWJsZUNsb3NlQnV0dG9uXCI+JnRpbWVzOzwvYnV0dG9uPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBhcmlhLWhpZGRlbj1cInRydWVcIiBuZy1zaG93PVwic2hvd0NvdW50RG93bihtZXNzYWdlKVwiPnt7bWVzc2FnZS5jb3VudGRvd259fTwvYnV0dG9uPjxoNCBjbGFzcz1cImdyb3dsLXRpdGxlXCIgbmctc2hvdz1cIm1lc3NhZ2UudGl0bGVcIiBuZy1iaW5kPVwibWVzc2FnZS50aXRsZVwiPjwvaDQ+PGRpdiBjbGFzcz1cImdyb3dsLW1lc3NhZ2VcIiBuZy1iaW5kLWh0bWw9XCJtZXNzYWdlLnRleHRcIj48L2Rpdj48L2Rpdj48L2Rpdj4nKX1dKSxhbmd1bGFyLm1vZHVsZShcImFuZ3VsYXItZ3Jvd2xcIikucHJvdmlkZXIoXCJncm93bFwiLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7dmFyIGE9e3N1Y2Nlc3M6bnVsbCxlcnJvcjpudWxsLHdhcm5pbmc6bnVsbCxpbmZvOm51bGx9LGI9XCJtZXNzYWdlc1wiLGM9XCJ0ZXh0XCIsZD1cInRpdGxlXCIsZT1cInNldmVyaXR5XCIsZj0hMCxnPVwidmFyaWFibGVzXCIsaD0wLGk9ITEsaj1cInRvcC1yaWdodFwiLGs9ITEsbD0hMSxtPSExLG49ITE7dGhpcy5nbG9iYWxUaW1lVG9MaXZlPWZ1bmN0aW9uKGIpe2lmKFwib2JqZWN0XCI9PXR5cGVvZiBiKWZvcih2YXIgYyBpbiBiKWIuaGFzT3duUHJvcGVydHkoYykmJihhW2NdPWJbY10pO2Vsc2UgZm9yKHZhciBkIGluIGEpYS5oYXNPd25Qcm9wZXJ0eShkKSYmKGFbZF09Yil9LHRoaXMuZ2xvYmFsRGlzYWJsZUNsb3NlQnV0dG9uPWZ1bmN0aW9uKGEpe2s9YX0sdGhpcy5nbG9iYWxEaXNhYmxlSWNvbnM9ZnVuY3Rpb24oYSl7bD1hfSx0aGlzLmdsb2JhbFJldmVyc2VkT3JkZXI9ZnVuY3Rpb24oYSl7bT1hfSx0aGlzLmdsb2JhbERpc2FibGVDb3VudERvd249ZnVuY3Rpb24oYSl7bj1hfSx0aGlzLm1lc3NhZ2VWYXJpYWJsZUtleT1mdW5jdGlvbihhKXtnPWF9LHRoaXMuZ2xvYmFsSW5saW5lTWVzc2FnZXM9ZnVuY3Rpb24oYSl7aT1hfSx0aGlzLmdsb2JhbFBvc2l0aW9uPWZ1bmN0aW9uKGEpe2o9YX0sdGhpcy5tZXNzYWdlc0tleT1mdW5jdGlvbihhKXtiPWF9LHRoaXMubWVzc2FnZVRleHRLZXk9ZnVuY3Rpb24oYSl7Yz1hfSx0aGlzLm1lc3NhZ2VUaXRsZUtleT1mdW5jdGlvbihhKXtkPWF9LHRoaXMubWVzc2FnZVNldmVyaXR5S2V5PWZ1bmN0aW9uKGEpe2U9YX0sdGhpcy5vbmx5VW5pcXVlTWVzc2FnZXM9ZnVuY3Rpb24oYSl7Zj1hfSx0aGlzLnNlcnZlck1lc3NhZ2VzSW50ZXJjZXB0b3I9W1wiJHFcIixcImdyb3dsXCIsZnVuY3Rpb24oYSxjKXtmdW5jdGlvbiBkKGEpe2EuZGF0YVtiXSYmYS5kYXRhW2JdLmxlbmd0aD4wJiZjLmFkZFNlcnZlck1lc3NhZ2VzKGEuZGF0YVtiXSl9cmV0dXJue3Jlc3BvbnNlOmZ1bmN0aW9uKGEpe3JldHVybiBkKGEpLGF9LHJlc3BvbnNlRXJyb3I6ZnVuY3Rpb24oYil7cmV0dXJuIGQoYiksYS5yZWplY3QoYil9fX1dLHRoaXMuJGdldD1bXCIkcm9vdFNjb3BlXCIsXCIkaW50ZXJwb2xhdGVcIixcIiRmaWx0ZXJcIixmdW5jdGlvbihiLG8scCl7ZnVuY3Rpb24gcShhKXtpZihCKWEudGV4dD1CKGEudGV4dCxhLnZhcmlhYmxlcyk7ZWxzZXt2YXIgYz1vKGEudGV4dCk7YS50ZXh0PWMoYS52YXJpYWJsZXMpfWIuJGJyb2FkY2FzdChcImdyb3dsTWVzc2FnZVwiLGEpfWZ1bmN0aW9uIHIoYixjLGQpe3ZhciBlLGY9Y3x8e307ZT17dGV4dDpiLHRpdGxlOmYudGl0bGUsc2V2ZXJpdHk6ZCx0dGw6Zi50dGx8fGFbZF0sdmFyaWFibGVzOmYudmFyaWFibGVzfHx7fSxkaXNhYmxlQ2xvc2VCdXR0b246dm9pZCAwPT09Zi5kaXNhYmxlQ2xvc2VCdXR0b24/azpmLmRpc2FibGVDbG9zZUJ1dHRvbixkaXNhYmxlSWNvbnM6dm9pZCAwPT09Zi5kaXNhYmxlSWNvbnM/bDpmLmRpc2FibGVJY29ucyxkaXNhYmxlQ291bnREb3duOnZvaWQgMD09PWYuZGlzYWJsZUNvdW50RG93bj9uOmYuZGlzYWJsZUNvdW50RG93bixwb3NpdGlvbjpmLnBvc2l0aW9ufHxqLHJlZmVyZW5jZUlkOmYucmVmZXJlbmNlSWR8fGh9LHEoZSl9ZnVuY3Rpb24gcyhhLGIpe3IoYSxiLFwid2FybmluZ1wiKX1mdW5jdGlvbiB0KGEsYil7cihhLGIsXCJlcnJvclwiKX1mdW5jdGlvbiB1KGEsYil7cihhLGIsXCJpbmZvXCIpfWZ1bmN0aW9uIHYoYSxiKXtyKGEsYixcInN1Y2Nlc3NcIil9ZnVuY3Rpb24gdyhhKXt2YXIgYixmLGgsaTtmb3IoaT1hLmxlbmd0aCxiPTA7aT5iO2IrKylpZihmPWFbYl0sZltjXSl7aD1mW2VdfHxcImVycm9yXCI7dmFyIGo9e307ai52YXJpYWJsZXM9ZltnXXx8e30sai50aXRsZT1mW2RdLHIoZltjXSxqLGgpfX1mdW5jdGlvbiB4KCl7cmV0dXJuIGZ9ZnVuY3Rpb24geSgpe3JldHVybiBtfWZ1bmN0aW9uIHooKXtyZXR1cm4gaX1mdW5jdGlvbiBBKCl7cmV0dXJuIGp9dmFyIEI7dHJ5e0I9cChcInRyYW5zbGF0ZVwiKX1jYXRjaChDKXt9cmV0dXJue3dhcm5pbmc6cyxlcnJvcjp0LGluZm86dSxzdWNjZXNzOnYsYWRkU2VydmVyTWVzc2FnZXM6dyxvbmx5VW5pcXVlOngscmV2ZXJzZU9yZGVyOnksaW5saW5lTWVzc2FnZXM6eixwb3NpdGlvbjpBfX1dfSk7IiwiLyoqXG4gKiBAbGljZW5zZSBBbmd1bGFySlMgdjEuMy4xXG4gKiAoYykgMjAxMC0yMDE0IEdvb2dsZSwgSW5jLiBodHRwOi8vYW5ndWxhcmpzLm9yZ1xuICogTGljZW5zZTogTUlUXG4gKi9cbihmdW5jdGlvbih3aW5kb3csIGFuZ3VsYXIsIHVuZGVmaW5lZCkgeyd1c2Ugc3RyaWN0JztcblxudmFyICRzYW5pdGl6ZU1pbkVyciA9IGFuZ3VsYXIuJCRtaW5FcnIoJyRzYW5pdGl6ZScpO1xuXG4vKipcbiAqIEBuZ2RvYyBtb2R1bGVcbiAqIEBuYW1lIG5nU2FuaXRpemVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqICMgbmdTYW5pdGl6ZVxuICpcbiAqIFRoZSBgbmdTYW5pdGl6ZWAgbW9kdWxlIHByb3ZpZGVzIGZ1bmN0aW9uYWxpdHkgdG8gc2FuaXRpemUgSFRNTC5cbiAqXG4gKlxuICogPGRpdiBkb2MtbW9kdWxlLWNvbXBvbmVudHM9XCJuZ1Nhbml0aXplXCI+PC9kaXY+XG4gKlxuICogU2VlIHtAbGluayBuZ1Nhbml0aXplLiRzYW5pdGl6ZSBgJHNhbml0aXplYH0gZm9yIHVzYWdlLlxuICovXG5cbi8qXG4gKiBIVE1MIFBhcnNlciBCeSBNaXNrbyBIZXZlcnkgKG1pc2tvQGhldmVyeS5jb20pXG4gKiBiYXNlZCBvbjogIEhUTUwgUGFyc2VyIEJ5IEpvaG4gUmVzaWcgKGVqb2huLm9yZylcbiAqIE9yaWdpbmFsIGNvZGUgYnkgRXJpayBBcnZpZHNzb24sIE1vemlsbGEgUHVibGljIExpY2Vuc2VcbiAqIGh0dHA6Ly9lcmlrLmVhZS5uZXQvc2ltcGxlaHRtbHBhcnNlci9zaW1wbGVodG1scGFyc2VyLmpzXG4gKlxuICogLy8gVXNlIGxpa2Ugc286XG4gKiBodG1sUGFyc2VyKGh0bWxTdHJpbmcsIHtcbiAqICAgICBzdGFydDogZnVuY3Rpb24odGFnLCBhdHRycywgdW5hcnkpIHt9LFxuICogICAgIGVuZDogZnVuY3Rpb24odGFnKSB7fSxcbiAqICAgICBjaGFyczogZnVuY3Rpb24odGV4dCkge30sXG4gKiAgICAgY29tbWVudDogZnVuY3Rpb24odGV4dCkge31cbiAqIH0pO1xuICpcbiAqL1xuXG5cbi8qKlxuICogQG5nZG9jIHNlcnZpY2VcbiAqIEBuYW1lICRzYW5pdGl6ZVxuICogQGtpbmQgZnVuY3Rpb25cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqICAgVGhlIGlucHV0IGlzIHNhbml0aXplZCBieSBwYXJzaW5nIHRoZSBIVE1MIGludG8gdG9rZW5zLiBBbGwgc2FmZSB0b2tlbnMgKGZyb20gYSB3aGl0ZWxpc3QpIGFyZVxuICogICB0aGVuIHNlcmlhbGl6ZWQgYmFjayB0byBwcm9wZXJseSBlc2NhcGVkIGh0bWwgc3RyaW5nLiBUaGlzIG1lYW5zIHRoYXQgbm8gdW5zYWZlIGlucHV0IGNhbiBtYWtlXG4gKiAgIGl0IGludG8gdGhlIHJldHVybmVkIHN0cmluZywgaG93ZXZlciwgc2luY2Ugb3VyIHBhcnNlciBpcyBtb3JlIHN0cmljdCB0aGFuIGEgdHlwaWNhbCBicm93c2VyXG4gKiAgIHBhcnNlciwgaXQncyBwb3NzaWJsZSB0aGF0IHNvbWUgb2JzY3VyZSBpbnB1dCwgd2hpY2ggd291bGQgYmUgcmVjb2duaXplZCBhcyB2YWxpZCBIVE1MIGJ5IGFcbiAqICAgYnJvd3Nlciwgd29uJ3QgbWFrZSBpdCB0aHJvdWdoIHRoZSBzYW5pdGl6ZXIuIFRoZSBpbnB1dCBtYXkgYWxzbyBjb250YWluIFNWRyBtYXJrdXAuXG4gKiAgIFRoZSB3aGl0ZWxpc3QgaXMgY29uZmlndXJlZCB1c2luZyB0aGUgZnVuY3Rpb25zIGBhSHJlZlNhbml0aXphdGlvbldoaXRlbGlzdGAgYW5kXG4gKiAgIGBpbWdTcmNTYW5pdGl6YXRpb25XaGl0ZWxpc3RgIG9mIHtAbGluayBuZy4kY29tcGlsZVByb3ZpZGVyIGAkY29tcGlsZVByb3ZpZGVyYH0uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgSFRNTCBpbnB1dC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFNhbml0aXplZCBIVE1MLlxuICpcbiAqIEBleGFtcGxlXG4gICA8ZXhhbXBsZSBtb2R1bGU9XCJzYW5pdGl6ZUV4YW1wbGVcIiBkZXBzPVwiYW5ndWxhci1zYW5pdGl6ZS5qc1wiPlxuICAgPGZpbGUgbmFtZT1cImluZGV4Lmh0bWxcIj5cbiAgICAgPHNjcmlwdD5cbiAgICAgICAgIGFuZ3VsYXIubW9kdWxlKCdzYW5pdGl6ZUV4YW1wbGUnLCBbJ25nU2FuaXRpemUnXSlcbiAgICAgICAgICAgLmNvbnRyb2xsZXIoJ0V4YW1wbGVDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHNjZScsIGZ1bmN0aW9uKCRzY29wZSwgJHNjZSkge1xuICAgICAgICAgICAgICRzY29wZS5zbmlwcGV0ID1cbiAgICAgICAgICAgICAgICc8cCBzdHlsZT1cImNvbG9yOmJsdWVcIj5hbiBodG1sXFxuJyArXG4gICAgICAgICAgICAgICAnPGVtIG9ubW91c2VvdmVyPVwidGhpcy50ZXh0Q29udGVudD1cXCdQV04zRCFcXCdcIj5jbGljayBoZXJlPC9lbT5cXG4nICtcbiAgICAgICAgICAgICAgICdzbmlwcGV0PC9wPic7XG4gICAgICAgICAgICAgJHNjb3BlLmRlbGliZXJhdGVseVRydXN0RGFuZ2Vyb3VzU25pcHBldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwoJHNjb3BlLnNuaXBwZXQpO1xuICAgICAgICAgICAgIH07XG4gICAgICAgICAgIH1dKTtcbiAgICAgPC9zY3JpcHQ+XG4gICAgIDxkaXYgbmctY29udHJvbGxlcj1cIkV4YW1wbGVDb250cm9sbGVyXCI+XG4gICAgICAgIFNuaXBwZXQ6IDx0ZXh0YXJlYSBuZy1tb2RlbD1cInNuaXBwZXRcIiBjb2xzPVwiNjBcIiByb3dzPVwiM1wiPjwvdGV4dGFyZWE+XG4gICAgICAgPHRhYmxlPlxuICAgICAgICAgPHRyPlxuICAgICAgICAgICA8dGQ+RGlyZWN0aXZlPC90ZD5cbiAgICAgICAgICAgPHRkPkhvdzwvdGQ+XG4gICAgICAgICAgIDx0ZD5Tb3VyY2U8L3RkPlxuICAgICAgICAgICA8dGQ+UmVuZGVyZWQ8L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICAgIDx0ciBpZD1cImJpbmQtaHRtbC13aXRoLXNhbml0aXplXCI+XG4gICAgICAgICAgIDx0ZD5uZy1iaW5kLWh0bWw8L3RkPlxuICAgICAgICAgICA8dGQ+QXV0b21hdGljYWxseSB1c2VzICRzYW5pdGl6ZTwvdGQ+XG4gICAgICAgICAgIDx0ZD48cHJlPiZsdDtkaXYgbmctYmluZC1odG1sPVwic25pcHBldFwiJmd0Ozxici8+Jmx0Oy9kaXYmZ3Q7PC9wcmU+PC90ZD5cbiAgICAgICAgICAgPHRkPjxkaXYgbmctYmluZC1odG1sPVwic25pcHBldFwiPjwvZGl2PjwvdGQ+XG4gICAgICAgICA8L3RyPlxuICAgICAgICAgPHRyIGlkPVwiYmluZC1odG1sLXdpdGgtdHJ1c3RcIj5cbiAgICAgICAgICAgPHRkPm5nLWJpbmQtaHRtbDwvdGQ+XG4gICAgICAgICAgIDx0ZD5CeXBhc3MgJHNhbml0aXplIGJ5IGV4cGxpY2l0bHkgdHJ1c3RpbmcgdGhlIGRhbmdlcm91cyB2YWx1ZTwvdGQ+XG4gICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgPHByZT4mbHQ7ZGl2IG5nLWJpbmQtaHRtbD1cImRlbGliZXJhdGVseVRydXN0RGFuZ2Vyb3VzU25pcHBldCgpXCImZ3Q7XG4mbHQ7L2RpdiZndDs8L3ByZT5cbiAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgPHRkPjxkaXYgbmctYmluZC1odG1sPVwiZGVsaWJlcmF0ZWx5VHJ1c3REYW5nZXJvdXNTbmlwcGV0KClcIj48L2Rpdj48L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICAgIDx0ciBpZD1cImJpbmQtZGVmYXVsdFwiPlxuICAgICAgICAgICA8dGQ+bmctYmluZDwvdGQ+XG4gICAgICAgICAgIDx0ZD5BdXRvbWF0aWNhbGx5IGVzY2FwZXM8L3RkPlxuICAgICAgICAgICA8dGQ+PHByZT4mbHQ7ZGl2IG5nLWJpbmQ9XCJzbmlwcGV0XCImZ3Q7PGJyLz4mbHQ7L2RpdiZndDs8L3ByZT48L3RkPlxuICAgICAgICAgICA8dGQ+PGRpdiBuZy1iaW5kPVwic25pcHBldFwiPjwvZGl2PjwvdGQ+XG4gICAgICAgICA8L3RyPlxuICAgICAgIDwvdGFibGU+XG4gICAgICAgPC9kaXY+XG4gICA8L2ZpbGU+XG4gICA8ZmlsZSBuYW1lPVwicHJvdHJhY3Rvci5qc1wiIHR5cGU9XCJwcm90cmFjdG9yXCI+XG4gICAgIGl0KCdzaG91bGQgc2FuaXRpemUgdGhlIGh0bWwgc25pcHBldCBieSBkZWZhdWx0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjYmluZC1odG1sLXdpdGgtc2FuaXRpemUgZGl2JykpLmdldElubmVySHRtbCgpKS5cbiAgICAgICAgIHRvQmUoJzxwPmFuIGh0bWxcXG48ZW0+Y2xpY2sgaGVyZTwvZW0+XFxuc25pcHBldDwvcD4nKTtcbiAgICAgfSk7XG5cbiAgICAgaXQoJ3Nob3VsZCBpbmxpbmUgcmF3IHNuaXBwZXQgaWYgYm91bmQgdG8gYSB0cnVzdGVkIHZhbHVlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjYmluZC1odG1sLXdpdGgtdHJ1c3QgZGl2JykpLmdldElubmVySHRtbCgpKS5cbiAgICAgICAgIHRvQmUoXCI8cCBzdHlsZT1cXFwiY29sb3I6Ymx1ZVxcXCI+YW4gaHRtbFxcblwiICtcbiAgICAgICAgICAgICAgXCI8ZW0gb25tb3VzZW92ZXI9XFxcInRoaXMudGV4dENvbnRlbnQ9J1BXTjNEISdcXFwiPmNsaWNrIGhlcmU8L2VtPlxcblwiICtcbiAgICAgICAgICAgICAgXCJzbmlwcGV0PC9wPlwiKTtcbiAgICAgfSk7XG5cbiAgICAgaXQoJ3Nob3VsZCBlc2NhcGUgc25pcHBldCB3aXRob3V0IGFueSBmaWx0ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNiaW5kLWRlZmF1bHQgZGl2JykpLmdldElubmVySHRtbCgpKS5cbiAgICAgICAgIHRvQmUoXCImbHQ7cCBzdHlsZT1cXFwiY29sb3I6Ymx1ZVxcXCImZ3Q7YW4gaHRtbFxcblwiICtcbiAgICAgICAgICAgICAgXCImbHQ7ZW0gb25tb3VzZW92ZXI9XFxcInRoaXMudGV4dENvbnRlbnQ9J1BXTjNEISdcXFwiJmd0O2NsaWNrIGhlcmUmbHQ7L2VtJmd0O1xcblwiICtcbiAgICAgICAgICAgICAgXCJzbmlwcGV0Jmx0Oy9wJmd0O1wiKTtcbiAgICAgfSk7XG5cbiAgICAgaXQoJ3Nob3VsZCB1cGRhdGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICBlbGVtZW50KGJ5Lm1vZGVsKCdzbmlwcGV0JykpLmNsZWFyKCk7XG4gICAgICAgZWxlbWVudChieS5tb2RlbCgnc25pcHBldCcpKS5zZW5kS2V5cygnbmV3IDxiIG9uY2xpY2s9XCJhbGVydCgxKVwiPnRleHQ8L2I+Jyk7XG4gICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjYmluZC1odG1sLXdpdGgtc2FuaXRpemUgZGl2JykpLmdldElubmVySHRtbCgpKS5cbiAgICAgICAgIHRvQmUoJ25ldyA8Yj50ZXh0PC9iPicpO1xuICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2JpbmQtaHRtbC13aXRoLXRydXN0IGRpdicpKS5nZXRJbm5lckh0bWwoKSkudG9CZShcbiAgICAgICAgICduZXcgPGIgb25jbGljaz1cImFsZXJ0KDEpXCI+dGV4dDwvYj4nKTtcbiAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNiaW5kLWRlZmF1bHQgZGl2JykpLmdldElubmVySHRtbCgpKS50b0JlKFxuICAgICAgICAgXCJuZXcgJmx0O2Igb25jbGljaz1cXFwiYWxlcnQoMSlcXFwiJmd0O3RleHQmbHQ7L2ImZ3Q7XCIpO1xuICAgICB9KTtcbiAgIDwvZmlsZT5cbiAgIDwvZXhhbXBsZT5cbiAqL1xuZnVuY3Rpb24gJFNhbml0aXplUHJvdmlkZXIoKSB7XG4gIHRoaXMuJGdldCA9IFsnJCRzYW5pdGl6ZVVyaScsIGZ1bmN0aW9uKCQkc2FuaXRpemVVcmkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oaHRtbCkge1xuICAgICAgdmFyIGJ1ZiA9IFtdO1xuICAgICAgaHRtbFBhcnNlcihodG1sLCBodG1sU2FuaXRpemVXcml0ZXIoYnVmLCBmdW5jdGlvbih1cmksIGlzSW1hZ2UpIHtcbiAgICAgICAgcmV0dXJuICEvXnVuc2FmZS8udGVzdCgkJHNhbml0aXplVXJpKHVyaSwgaXNJbWFnZSkpO1xuICAgICAgfSkpO1xuICAgICAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcbiAgICB9O1xuICB9XTtcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVUZXh0KGNoYXJzKSB7XG4gIHZhciBidWYgPSBbXTtcbiAgdmFyIHdyaXRlciA9IGh0bWxTYW5pdGl6ZVdyaXRlcihidWYsIGFuZ3VsYXIubm9vcCk7XG4gIHdyaXRlci5jaGFycyhjaGFycyk7XG4gIHJldHVybiBidWYuam9pbignJyk7XG59XG5cblxuLy8gUmVndWxhciBFeHByZXNzaW9ucyBmb3IgcGFyc2luZyB0YWdzIGFuZCBhdHRyaWJ1dGVzXG52YXIgU1RBUlRfVEFHX1JFR0VYUCA9XG4gICAgICAgL148KCg/OlthLXpBLVpdKVtcXHc6LV0qKSgoPzpcXHMrW1xcdzotXSsoPzpcXHMqPVxccyooPzooPzpcIlteXCJdKlwiKXwoPzonW14nXSonKXxbXj5cXHNdKykpPykqKVxccyooXFwvPylcXHMqKD4/KS8sXG4gIEVORF9UQUdfUkVHRVhQID0gL148XFwvXFxzKihbXFx3Oi1dKylbXj5dKj4vLFxuICBBVFRSX1JFR0VYUCA9IC8oW1xcdzotXSspKD86XFxzKj1cXHMqKD86KD86XCIoKD86W15cIl0pKilcIil8KD86JygoPzpbXiddKSopJyl8KFtePlxcc10rKSkpPy9nLFxuICBCRUdJTl9UQUdfUkVHRVhQID0gL148LyxcbiAgQkVHSU5HX0VORF9UQUdFX1JFR0VYUCA9IC9ePFxcLy8sXG4gIENPTU1FTlRfUkVHRVhQID0gLzwhLS0oLio/KS0tPi9nLFxuICBET0NUWVBFX1JFR0VYUCA9IC88IURPQ1RZUEUoW14+XSo/KT4vaSxcbiAgQ0RBVEFfUkVHRVhQID0gLzwhXFxbQ0RBVEFcXFsoLio/KV1dPi9nLFxuICBTVVJST0dBVEVfUEFJUl9SRUdFWFAgPSAvW1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXS9nLFxuICAvLyBNYXRjaCBldmVyeXRoaW5nIG91dHNpZGUgb2Ygbm9ybWFsIGNoYXJzIGFuZCBcIiAocXVvdGUgY2hhcmFjdGVyKVxuICBOT05fQUxQSEFOVU1FUklDX1JFR0VYUCA9IC8oW15cXCMtfnwgfCFdKS9nO1xuXG5cbi8vIEdvb2Qgc291cmNlIG9mIGluZm8gYWJvdXQgZWxlbWVudHMgYW5kIGF0dHJpYnV0ZXNcbi8vIGh0dHA6Ly9kZXYudzMub3JnL2h0bWw1L3NwZWMvT3ZlcnZpZXcuaHRtbCNzZW1hbnRpY3Ncbi8vIGh0dHA6Ly9zaW1vbi5odG1sNS5vcmcvaHRtbC1lbGVtZW50c1xuXG4vLyBTYWZlIFZvaWQgRWxlbWVudHMgLSBIVE1MNVxuLy8gaHR0cDovL2Rldi53My5vcmcvaHRtbDUvc3BlYy9PdmVydmlldy5odG1sI3ZvaWQtZWxlbWVudHNcbnZhciB2b2lkRWxlbWVudHMgPSBtYWtlTWFwKFwiYXJlYSxicixjb2wsaHIsaW1nLHdiclwiKTtcblxuLy8gRWxlbWVudHMgdGhhdCB5b3UgY2FuLCBpbnRlbnRpb25hbGx5LCBsZWF2ZSBvcGVuIChhbmQgd2hpY2ggY2xvc2UgdGhlbXNlbHZlcylcbi8vIGh0dHA6Ly9kZXYudzMub3JnL2h0bWw1L3NwZWMvT3ZlcnZpZXcuaHRtbCNvcHRpb25hbC10YWdzXG52YXIgb3B0aW9uYWxFbmRUYWdCbG9ja0VsZW1lbnRzID0gbWFrZU1hcChcImNvbGdyb3VwLGRkLGR0LGxpLHAsdGJvZHksdGQsdGZvb3QsdGgsdGhlYWQsdHJcIiksXG4gICAgb3B0aW9uYWxFbmRUYWdJbmxpbmVFbGVtZW50cyA9IG1ha2VNYXAoXCJycCxydFwiKSxcbiAgICBvcHRpb25hbEVuZFRhZ0VsZW1lbnRzID0gYW5ndWxhci5leHRlbmQoe30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbmFsRW5kVGFnSW5saW5lRWxlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbmFsRW5kVGFnQmxvY2tFbGVtZW50cyk7XG5cbi8vIFNhZmUgQmxvY2sgRWxlbWVudHMgLSBIVE1MNVxudmFyIGJsb2NrRWxlbWVudHMgPSBhbmd1bGFyLmV4dGVuZCh7fSwgb3B0aW9uYWxFbmRUYWdCbG9ja0VsZW1lbnRzLCBtYWtlTWFwKFwiYWRkcmVzcyxhcnRpY2xlLFwiICtcbiAgICAgICAgXCJhc2lkZSxibG9ja3F1b3RlLGNhcHRpb24sY2VudGVyLGRlbCxkaXIsZGl2LGRsLGZpZ3VyZSxmaWdjYXB0aW9uLGZvb3RlcixoMSxoMixoMyxoNCxoNSxcIiArXG4gICAgICAgIFwiaDYsaGVhZGVyLGhncm91cCxocixpbnMsbWFwLG1lbnUsbmF2LG9sLHByZSxzY3JpcHQsc2VjdGlvbix0YWJsZSx1bFwiKSk7XG5cbi8vIElubGluZSBFbGVtZW50cyAtIEhUTUw1XG52YXIgaW5saW5lRWxlbWVudHMgPSBhbmd1bGFyLmV4dGVuZCh7fSwgb3B0aW9uYWxFbmRUYWdJbmxpbmVFbGVtZW50cywgbWFrZU1hcChcImEsYWJicixhY3JvbnltLGIsXCIgK1xuICAgICAgICBcImJkaSxiZG8sYmlnLGJyLGNpdGUsY29kZSxkZWwsZGZuLGVtLGZvbnQsaSxpbWcsaW5zLGtiZCxsYWJlbCxtYXAsbWFyayxxLHJ1YnkscnAscnQscyxcIiArXG4gICAgICAgIFwic2FtcCxzbWFsbCxzcGFuLHN0cmlrZSxzdHJvbmcsc3ViLHN1cCx0aW1lLHR0LHUsdmFyXCIpKTtcblxuLy8gU1ZHIEVsZW1lbnRzXG4vLyBodHRwczovL3dpa2kud2hhdHdnLm9yZy93aWtpL1Nhbml0aXphdGlvbl9ydWxlcyNzdmdfRWxlbWVudHNcbnZhciBzdmdFbGVtZW50cyA9IG1ha2VNYXAoXCJhbmltYXRlLGFuaW1hdGVDb2xvcixhbmltYXRlTW90aW9uLGFuaW1hdGVUcmFuc2Zvcm0sY2lyY2xlLGRlZnMsXCIgK1xuICAgICAgICBcImRlc2MsZWxsaXBzZSxmb250LWZhY2UsZm9udC1mYWNlLW5hbWUsZm9udC1mYWNlLXNyYyxnLGdseXBoLGhrZXJuLGltYWdlLGxpbmVhckdyYWRpZW50LFwiICtcbiAgICAgICAgXCJsaW5lLG1hcmtlcixtZXRhZGF0YSxtaXNzaW5nLWdseXBoLG1wYXRoLHBhdGgscG9seWdvbixwb2x5bGluZSxyYWRpYWxHcmFkaWVudCxyZWN0LHNldCxcIiArXG4gICAgICAgIFwic3RvcCxzdmcsc3dpdGNoLHRleHQsdGl0bGUsdHNwYW4sdXNlXCIpO1xuXG4vLyBTcGVjaWFsIEVsZW1lbnRzIChjYW4gY29udGFpbiBhbnl0aGluZylcbnZhciBzcGVjaWFsRWxlbWVudHMgPSBtYWtlTWFwKFwic2NyaXB0LHN0eWxlXCIpO1xuXG52YXIgdmFsaWRFbGVtZW50cyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkRWxlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrRWxlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlubGluZUVsZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25hbEVuZFRhZ0VsZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdmdFbGVtZW50cyk7XG5cbi8vQXR0cmlidXRlcyB0aGF0IGhhdmUgaHJlZiBhbmQgaGVuY2UgbmVlZCB0byBiZSBzYW5pdGl6ZWRcbnZhciB1cmlBdHRycyA9IG1ha2VNYXAoXCJiYWNrZ3JvdW5kLGNpdGUsaHJlZixsb25nZGVzYyxzcmMsdXNlbWFwLHhsaW5rOmhyZWZcIik7XG5cbnZhciBodG1sQXR0cnMgPSBtYWtlTWFwKCdhYmJyLGFsaWduLGFsdCxheGlzLGJnY29sb3IsYm9yZGVyLGNlbGxwYWRkaW5nLGNlbGxzcGFjaW5nLGNsYXNzLGNsZWFyLCcrXG4gICAgJ2NvbG9yLGNvbHMsY29sc3Bhbixjb21wYWN0LGNvb3JkcyxkaXIsZmFjZSxoZWFkZXJzLGhlaWdodCxocmVmbGFuZyxoc3BhY2UsJytcbiAgICAnaXNtYXAsbGFuZyxsYW5ndWFnZSxub2hyZWYsbm93cmFwLHJlbCxyZXYscm93cyxyb3dzcGFuLHJ1bGVzLCcrXG4gICAgJ3Njb3BlLHNjcm9sbGluZyxzaGFwZSxzaXplLHNwYW4sc3RhcnQsc3VtbWFyeSx0YXJnZXQsdGl0bGUsdHlwZSwnK1xuICAgICd2YWxpZ24sdmFsdWUsdnNwYWNlLHdpZHRoJyk7XG5cbi8vIFNWRyBhdHRyaWJ1dGVzICh3aXRob3V0IFwiaWRcIiBhbmQgXCJuYW1lXCIgYXR0cmlidXRlcylcbi8vIGh0dHBzOi8vd2lraS53aGF0d2cub3JnL3dpa2kvU2FuaXRpemF0aW9uX3J1bGVzI3N2Z19BdHRyaWJ1dGVzXG52YXIgc3ZnQXR0cnMgPSBtYWtlTWFwKCdhY2NlbnQtaGVpZ2h0LGFjY3VtdWxhdGUsYWRkaXRpdmUsYWxwaGFiZXRpYyxhcmFiaWMtZm9ybSxhc2NlbnQsJytcbiAgICAnYXR0cmlidXRlTmFtZSxhdHRyaWJ1dGVUeXBlLGJhc2VQcm9maWxlLGJib3gsYmVnaW4sYnksY2FsY01vZGUsY2FwLWhlaWdodCxjbGFzcyxjb2xvciwnK1xuICAgICdjb2xvci1yZW5kZXJpbmcsY29udGVudCxjeCxjeSxkLGR4LGR5LGRlc2NlbnQsZGlzcGxheSxkdXIsZW5kLGZpbGwsZmlsbC1ydWxlLGZvbnQtZmFtaWx5LCcrXG4gICAgJ2ZvbnQtc2l6ZSxmb250LXN0cmV0Y2gsZm9udC1zdHlsZSxmb250LXZhcmlhbnQsZm9udC13ZWlnaHQsZnJvbSxmeCxmeSxnMSxnMixnbHlwaC1uYW1lLCcrXG4gICAgJ2dyYWRpZW50VW5pdHMsaGFuZ2luZyxoZWlnaHQsaG9yaXotYWR2LXgsaG9yaXotb3JpZ2luLXgsaWRlb2dyYXBoaWMsayxrZXlQb2ludHMsJytcbiAgICAna2V5U3BsaW5lcyxrZXlUaW1lcyxsYW5nLG1hcmtlci1lbmQsbWFya2VyLW1pZCxtYXJrZXItc3RhcnQsbWFya2VySGVpZ2h0LG1hcmtlclVuaXRzLCcrXG4gICAgJ21hcmtlcldpZHRoLG1hdGhlbWF0aWNhbCxtYXgsbWluLG9mZnNldCxvcGFjaXR5LG9yaWVudCxvcmlnaW4sb3ZlcmxpbmUtcG9zaXRpb24sJytcbiAgICAnb3ZlcmxpbmUtdGhpY2tuZXNzLHBhbm9zZS0xLHBhdGgscGF0aExlbmd0aCxwb2ludHMscHJlc2VydmVBc3BlY3RSYXRpbyxyLHJlZlgscmVmWSwnK1xuICAgICdyZXBlYXRDb3VudCxyZXBlYXREdXIscmVxdWlyZWRFeHRlbnNpb25zLHJlcXVpcmVkRmVhdHVyZXMscmVzdGFydCxyb3RhdGUscngscnksc2xvcGUsc3RlbWgsJytcbiAgICAnc3RlbXYsc3RvcC1jb2xvcixzdG9wLW9wYWNpdHksc3RyaWtldGhyb3VnaC1wb3NpdGlvbixzdHJpa2V0aHJvdWdoLXRoaWNrbmVzcyxzdHJva2UsJytcbiAgICAnc3Ryb2tlLWRhc2hhcnJheSxzdHJva2UtZGFzaG9mZnNldCxzdHJva2UtbGluZWNhcCxzdHJva2UtbGluZWpvaW4sc3Ryb2tlLW1pdGVybGltaXQsJytcbiAgICAnc3Ryb2tlLW9wYWNpdHksc3Ryb2tlLXdpZHRoLHN5c3RlbUxhbmd1YWdlLHRhcmdldCx0ZXh0LWFuY2hvcix0byx0cmFuc2Zvcm0sdHlwZSx1MSx1MiwnK1xuICAgICd1bmRlcmxpbmUtcG9zaXRpb24sdW5kZXJsaW5lLXRoaWNrbmVzcyx1bmljb2RlLHVuaWNvZGUtcmFuZ2UsdW5pdHMtcGVyLWVtLHZhbHVlcyx2ZXJzaW9uLCcrXG4gICAgJ3ZpZXdCb3gsdmlzaWJpbGl0eSx3aWR0aCx3aWR0aHMseCx4LWhlaWdodCx4MSx4Mix4bGluazphY3R1YXRlLHhsaW5rOmFyY3JvbGUseGxpbms6cm9sZSwnK1xuICAgICd4bGluazpzaG93LHhsaW5rOnRpdGxlLHhsaW5rOnR5cGUseG1sOmJhc2UseG1sOmxhbmcseG1sOnNwYWNlLHhtbG5zLHhtbG5zOnhsaW5rLHkseTEseTIsJytcbiAgICAnem9vbUFuZFBhbicpO1xuXG52YXIgdmFsaWRBdHRycyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmlBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxBdHRycyk7XG5cbmZ1bmN0aW9uIG1ha2VNYXAoc3RyKSB7XG4gIHZhciBvYmogPSB7fSwgaXRlbXMgPSBzdHIuc3BsaXQoJywnKSwgaTtcbiAgZm9yIChpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSBvYmpbaXRlbXNbaV1dID0gdHJ1ZTtcbiAgcmV0dXJuIG9iajtcbn1cblxuXG4vKipcbiAqIEBleGFtcGxlXG4gKiBodG1sUGFyc2VyKGh0bWxTdHJpbmcsIHtcbiAqICAgICBzdGFydDogZnVuY3Rpb24odGFnLCBhdHRycywgdW5hcnkpIHt9LFxuICogICAgIGVuZDogZnVuY3Rpb24odGFnKSB7fSxcbiAqICAgICBjaGFyczogZnVuY3Rpb24odGV4dCkge30sXG4gKiAgICAgY29tbWVudDogZnVuY3Rpb24odGV4dCkge31cbiAqIH0pO1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIHN0cmluZ1xuICogQHBhcmFtIHtvYmplY3R9IGhhbmRsZXJcbiAqL1xuZnVuY3Rpb24gaHRtbFBhcnNlcihodG1sLCBoYW5kbGVyKSB7XG4gIGlmICh0eXBlb2YgaHRtbCAhPT0gJ3N0cmluZycpIHtcbiAgICBpZiAoaHRtbCA9PT0gbnVsbCB8fCB0eXBlb2YgaHRtbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGh0bWwgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgaHRtbCA9ICcnICsgaHRtbDtcbiAgICB9XG4gIH1cbiAgdmFyIGluZGV4LCBjaGFycywgbWF0Y2gsIHN0YWNrID0gW10sIGxhc3QgPSBodG1sLCB0ZXh0O1xuICBzdGFjay5sYXN0ID0gZnVuY3Rpb24oKSB7IHJldHVybiBzdGFja1sgc3RhY2subGVuZ3RoIC0gMSBdOyB9O1xuXG4gIHdoaWxlIChodG1sKSB7XG4gICAgdGV4dCA9ICcnO1xuICAgIGNoYXJzID0gdHJ1ZTtcblxuICAgIC8vIE1ha2Ugc3VyZSB3ZSdyZSBub3QgaW4gYSBzY3JpcHQgb3Igc3R5bGUgZWxlbWVudFxuICAgIGlmICghc3RhY2subGFzdCgpIHx8ICFzcGVjaWFsRWxlbWVudHNbIHN0YWNrLmxhc3QoKSBdKSB7XG5cbiAgICAgIC8vIENvbW1lbnRcbiAgICAgIGlmIChodG1sLmluZGV4T2YoXCI8IS0tXCIpID09PSAwKSB7XG4gICAgICAgIC8vIGNvbW1lbnRzIGNvbnRhaW5pbmcgLS0gYXJlIG5vdCBhbGxvd2VkIHVubGVzcyB0aGV5IHRlcm1pbmF0ZSB0aGUgY29tbWVudFxuICAgICAgICBpbmRleCA9IGh0bWwuaW5kZXhPZihcIi0tXCIsIDQpO1xuXG4gICAgICAgIGlmIChpbmRleCA+PSAwICYmIGh0bWwubGFzdEluZGV4T2YoXCItLT5cIiwgaW5kZXgpID09PSBpbmRleCkge1xuICAgICAgICAgIGlmIChoYW5kbGVyLmNvbW1lbnQpIGhhbmRsZXIuY29tbWVudChodG1sLnN1YnN0cmluZyg0LCBpbmRleCkpO1xuICAgICAgICAgIGh0bWwgPSBodG1sLnN1YnN0cmluZyhpbmRleCArIDMpO1xuICAgICAgICAgIGNoYXJzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIC8vIERPQ1RZUEVcbiAgICAgIH0gZWxzZSBpZiAoRE9DVFlQRV9SRUdFWFAudGVzdChodG1sKSkge1xuICAgICAgICBtYXRjaCA9IGh0bWwubWF0Y2goRE9DVFlQRV9SRUdFWFApO1xuXG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UobWF0Y2hbMF0sICcnKTtcbiAgICAgICAgICBjaGFycyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAvLyBlbmQgdGFnXG4gICAgICB9IGVsc2UgaWYgKEJFR0lOR19FTkRfVEFHRV9SRUdFWFAudGVzdChodG1sKSkge1xuICAgICAgICBtYXRjaCA9IGh0bWwubWF0Y2goRU5EX1RBR19SRUdFWFApO1xuXG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIGh0bWwgPSBodG1sLnN1YnN0cmluZyhtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgICAgIG1hdGNoWzBdLnJlcGxhY2UoRU5EX1RBR19SRUdFWFAsIHBhcnNlRW5kVGFnKTtcbiAgICAgICAgICBjaGFycyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgIC8vIHN0YXJ0IHRhZ1xuICAgICAgfSBlbHNlIGlmIChCRUdJTl9UQUdfUkVHRVhQLnRlc3QoaHRtbCkpIHtcbiAgICAgICAgbWF0Y2ggPSBodG1sLm1hdGNoKFNUQVJUX1RBR19SRUdFWFApO1xuXG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIC8vIFdlIG9ubHkgaGF2ZSBhIHZhbGlkIHN0YXJ0LXRhZyBpZiB0aGVyZSBpcyBhICc+Jy5cbiAgICAgICAgICBpZiAobWF0Y2hbNF0pIHtcbiAgICAgICAgICAgIGh0bWwgPSBodG1sLnN1YnN0cmluZyhtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgICAgICAgbWF0Y2hbMF0ucmVwbGFjZShTVEFSVF9UQUdfUkVHRVhQLCBwYXJzZVN0YXJ0VGFnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2hhcnMgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBubyBlbmRpbmcgdGFnIGZvdW5kIC0tLSB0aGlzIHBpZWNlIHNob3VsZCBiZSBlbmNvZGVkIGFzIGFuIGVudGl0eS5cbiAgICAgICAgICB0ZXh0ICs9ICc8JztcbiAgICAgICAgICBodG1sID0gaHRtbC5zdWJzdHJpbmcoMSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGNoYXJzKSB7XG4gICAgICAgIGluZGV4ID0gaHRtbC5pbmRleE9mKFwiPFwiKTtcblxuICAgICAgICB0ZXh0ICs9IGluZGV4IDwgMCA/IGh0bWwgOiBodG1sLnN1YnN0cmluZygwLCBpbmRleCk7XG4gICAgICAgIGh0bWwgPSBpbmRleCA8IDAgPyBcIlwiIDogaHRtbC5zdWJzdHJpbmcoaW5kZXgpO1xuXG4gICAgICAgIGlmIChoYW5kbGVyLmNoYXJzKSBoYW5kbGVyLmNoYXJzKGRlY29kZUVudGl0aWVzKHRleHQpKTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICBodG1sID0gaHRtbC5yZXBsYWNlKG5ldyBSZWdFeHAoXCIoLiopPFxcXFxzKlxcXFwvXFxcXHMqXCIgKyBzdGFjay5sYXN0KCkgKyBcIltePl0qPlwiLCAnaScpLFxuICAgICAgICBmdW5jdGlvbihhbGwsIHRleHQpIHtcbiAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKENPTU1FTlRfUkVHRVhQLCBcIiQxXCIpLnJlcGxhY2UoQ0RBVEFfUkVHRVhQLCBcIiQxXCIpO1xuXG4gICAgICAgICAgaWYgKGhhbmRsZXIuY2hhcnMpIGhhbmRsZXIuY2hhcnMoZGVjb2RlRW50aXRpZXModGV4dCkpO1xuXG4gICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICB9KTtcblxuICAgICAgcGFyc2VFbmRUYWcoXCJcIiwgc3RhY2subGFzdCgpKTtcbiAgICB9XG5cbiAgICBpZiAoaHRtbCA9PSBsYXN0KSB7XG4gICAgICB0aHJvdyAkc2FuaXRpemVNaW5FcnIoJ2JhZHBhcnNlJywgXCJUaGUgc2FuaXRpemVyIHdhcyB1bmFibGUgdG8gcGFyc2UgdGhlIGZvbGxvd2luZyBibG9jayBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJvZiBodG1sOiB7MH1cIiwgaHRtbCk7XG4gICAgfVxuICAgIGxhc3QgPSBodG1sO1xuICB9XG5cbiAgLy8gQ2xlYW4gdXAgYW55IHJlbWFpbmluZyB0YWdzXG4gIHBhcnNlRW5kVGFnKCk7XG5cbiAgZnVuY3Rpb24gcGFyc2VTdGFydFRhZyh0YWcsIHRhZ05hbWUsIHJlc3QsIHVuYXJ5KSB7XG4gICAgdGFnTmFtZSA9IGFuZ3VsYXIubG93ZXJjYXNlKHRhZ05hbWUpO1xuICAgIGlmIChibG9ja0VsZW1lbnRzWyB0YWdOYW1lIF0pIHtcbiAgICAgIHdoaWxlIChzdGFjay5sYXN0KCkgJiYgaW5saW5lRWxlbWVudHNbIHN0YWNrLmxhc3QoKSBdKSB7XG4gICAgICAgIHBhcnNlRW5kVGFnKFwiXCIsIHN0YWNrLmxhc3QoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbmFsRW5kVGFnRWxlbWVudHNbIHRhZ05hbWUgXSAmJiBzdGFjay5sYXN0KCkgPT0gdGFnTmFtZSkge1xuICAgICAgcGFyc2VFbmRUYWcoXCJcIiwgdGFnTmFtZSk7XG4gICAgfVxuXG4gICAgdW5hcnkgPSB2b2lkRWxlbWVudHNbIHRhZ05hbWUgXSB8fCAhIXVuYXJ5O1xuXG4gICAgaWYgKCF1bmFyeSlcbiAgICAgIHN0YWNrLnB1c2godGFnTmFtZSk7XG5cbiAgICB2YXIgYXR0cnMgPSB7fTtcblxuICAgIHJlc3QucmVwbGFjZShBVFRSX1JFR0VYUCxcbiAgICAgIGZ1bmN0aW9uKG1hdGNoLCBuYW1lLCBkb3VibGVRdW90ZWRWYWx1ZSwgc2luZ2xlUXVvdGVkVmFsdWUsIHVucXVvdGVkVmFsdWUpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gZG91YmxlUXVvdGVkVmFsdWVcbiAgICAgICAgICB8fCBzaW5nbGVRdW90ZWRWYWx1ZVxuICAgICAgICAgIHx8IHVucXVvdGVkVmFsdWVcbiAgICAgICAgICB8fCAnJztcblxuICAgICAgICBhdHRyc1tuYW1lXSA9IGRlY29kZUVudGl0aWVzKHZhbHVlKTtcbiAgICB9KTtcbiAgICBpZiAoaGFuZGxlci5zdGFydCkgaGFuZGxlci5zdGFydCh0YWdOYW1lLCBhdHRycywgdW5hcnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VFbmRUYWcodGFnLCB0YWdOYW1lKSB7XG4gICAgdmFyIHBvcyA9IDAsIGk7XG4gICAgdGFnTmFtZSA9IGFuZ3VsYXIubG93ZXJjYXNlKHRhZ05hbWUpO1xuICAgIGlmICh0YWdOYW1lKVxuICAgICAgLy8gRmluZCB0aGUgY2xvc2VzdCBvcGVuZWQgdGFnIG9mIHRoZSBzYW1lIHR5cGVcbiAgICAgIGZvciAocG9zID0gc3RhY2subGVuZ3RoIC0gMTsgcG9zID49IDA7IHBvcy0tKVxuICAgICAgICBpZiAoc3RhY2tbIHBvcyBdID09IHRhZ05hbWUpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICBpZiAocG9zID49IDApIHtcbiAgICAgIC8vIENsb3NlIGFsbCB0aGUgb3BlbiBlbGVtZW50cywgdXAgdGhlIHN0YWNrXG4gICAgICBmb3IgKGkgPSBzdGFjay5sZW5ndGggLSAxOyBpID49IHBvczsgaS0tKVxuICAgICAgICBpZiAoaGFuZGxlci5lbmQpIGhhbmRsZXIuZW5kKHN0YWNrWyBpIF0pO1xuXG4gICAgICAvLyBSZW1vdmUgdGhlIG9wZW4gZWxlbWVudHMgZnJvbSB0aGUgc3RhY2tcbiAgICAgIHN0YWNrLmxlbmd0aCA9IHBvcztcbiAgICB9XG4gIH1cbn1cblxudmFyIGhpZGRlblByZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicHJlXCIpO1xudmFyIHNwYWNlUmUgPSAvXihcXHMqKShbXFxzXFxTXSo/KShcXHMqKSQvO1xuLyoqXG4gKiBkZWNvZGVzIGFsbCBlbnRpdGllcyBpbnRvIHJlZ3VsYXIgc3RyaW5nXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEEgc3RyaW5nIHdpdGggZGVjb2RlZCBlbnRpdGllcy5cbiAqL1xuZnVuY3Rpb24gZGVjb2RlRW50aXRpZXModmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkgeyByZXR1cm4gJyc7IH1cblxuICAvLyBOb3RlOiBJRTggZG9lcyBub3QgcHJlc2VydmUgc3BhY2VzIGF0IHRoZSBzdGFydC9lbmQgb2YgaW5uZXJIVE1MXG4gIC8vIHNvIHdlIG11c3QgY2FwdHVyZSB0aGVtIGFuZCByZWF0dGFjaCB0aGVtIGFmdGVyd2FyZFxuICB2YXIgcGFydHMgPSBzcGFjZVJlLmV4ZWModmFsdWUpO1xuICB2YXIgc3BhY2VCZWZvcmUgPSBwYXJ0c1sxXTtcbiAgdmFyIHNwYWNlQWZ0ZXIgPSBwYXJ0c1szXTtcbiAgdmFyIGNvbnRlbnQgPSBwYXJ0c1syXTtcbiAgaWYgKGNvbnRlbnQpIHtcbiAgICBoaWRkZW5QcmUuaW5uZXJIVE1MPWNvbnRlbnQucmVwbGFjZSgvPC9nLFwiJmx0O1wiKTtcbiAgICAvLyBpbm5lclRleHQgZGVwZW5kcyBvbiBzdHlsaW5nIGFzIGl0IGRvZXNuJ3QgZGlzcGxheSBoaWRkZW4gZWxlbWVudHMuXG4gICAgLy8gVGhlcmVmb3JlLCBpdCdzIGJldHRlciB0byB1c2UgdGV4dENvbnRlbnQgbm90IHRvIGNhdXNlIHVubmVjZXNzYXJ5XG4gICAgLy8gcmVmbG93cy4gSG93ZXZlciwgSUU8OSBkb24ndCBzdXBwb3J0IHRleHRDb250ZW50IHNvIHRoZSBpbm5lclRleHRcbiAgICAvLyBmYWxsYmFjayBpcyBuZWNlc3NhcnkuXG4gICAgY29udGVudCA9ICd0ZXh0Q29udGVudCcgaW4gaGlkZGVuUHJlID9cbiAgICAgIGhpZGRlblByZS50ZXh0Q29udGVudCA6IGhpZGRlblByZS5pbm5lclRleHQ7XG4gIH1cbiAgcmV0dXJuIHNwYWNlQmVmb3JlICsgY29udGVudCArIHNwYWNlQWZ0ZXI7XG59XG5cbi8qKlxuICogRXNjYXBlcyBhbGwgcG90ZW50aWFsbHkgZGFuZ2Vyb3VzIGNoYXJhY3RlcnMsIHNvIHRoYXQgdGhlXG4gKiByZXN1bHRpbmcgc3RyaW5nIGNhbiBiZSBzYWZlbHkgaW5zZXJ0ZWQgaW50byBhdHRyaWJ1dGUgb3JcbiAqIGVsZW1lbnQgdGV4dC5cbiAqIEBwYXJhbSB2YWx1ZVxuICogQHJldHVybnMge3N0cmluZ30gZXNjYXBlZCB0ZXh0XG4gKi9cbmZ1bmN0aW9uIGVuY29kZUVudGl0aWVzKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5cbiAgICByZXBsYWNlKC8mL2csICcmYW1wOycpLlxuICAgIHJlcGxhY2UoU1VSUk9HQVRFX1BBSVJfUkVHRVhQLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFyIGhpID0gdmFsdWUuY2hhckNvZGVBdCgwKTtcbiAgICAgIHZhciBsb3cgPSB2YWx1ZS5jaGFyQ29kZUF0KDEpO1xuICAgICAgcmV0dXJuICcmIycgKyAoKChoaSAtIDB4RDgwMCkgKiAweDQwMCkgKyAobG93IC0gMHhEQzAwKSArIDB4MTAwMDApICsgJzsnO1xuICAgIH0pLlxuICAgIHJlcGxhY2UoTk9OX0FMUEhBTlVNRVJJQ19SRUdFWFAsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gJyYjJyArIHZhbHVlLmNoYXJDb2RlQXQoMCkgKyAnOyc7XG4gICAgfSkuXG4gICAgcmVwbGFjZSgvPC9nLCAnJmx0OycpLlxuICAgIHJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn1cblxuLyoqXG4gKiBjcmVhdGUgYW4gSFRNTC9YTUwgd3JpdGVyIHdoaWNoIHdyaXRlcyB0byBidWZmZXJcbiAqIEBwYXJhbSB7QXJyYXl9IGJ1ZiB1c2UgYnVmLmphaW4oJycpIHRvIGdldCBvdXQgc2FuaXRpemVkIGh0bWwgc3RyaW5nXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBpbiB0aGUgZm9ybSBvZiB7XG4gKiAgICAgc3RhcnQ6IGZ1bmN0aW9uKHRhZywgYXR0cnMsIHVuYXJ5KSB7fSxcbiAqICAgICBlbmQ6IGZ1bmN0aW9uKHRhZykge30sXG4gKiAgICAgY2hhcnM6IGZ1bmN0aW9uKHRleHQpIHt9LFxuICogICAgIGNvbW1lbnQ6IGZ1bmN0aW9uKHRleHQpIHt9XG4gKiB9XG4gKi9cbmZ1bmN0aW9uIGh0bWxTYW5pdGl6ZVdyaXRlcihidWYsIHVyaVZhbGlkYXRvcikge1xuICB2YXIgaWdub3JlID0gZmFsc2U7XG4gIHZhciBvdXQgPSBhbmd1bGFyLmJpbmQoYnVmLCBidWYucHVzaCk7XG4gIHJldHVybiB7XG4gICAgc3RhcnQ6IGZ1bmN0aW9uKHRhZywgYXR0cnMsIHVuYXJ5KSB7XG4gICAgICB0YWcgPSBhbmd1bGFyLmxvd2VyY2FzZSh0YWcpO1xuICAgICAgaWYgKCFpZ25vcmUgJiYgc3BlY2lhbEVsZW1lbnRzW3RhZ10pIHtcbiAgICAgICAgaWdub3JlID0gdGFnO1xuICAgICAgfVxuICAgICAgaWYgKCFpZ25vcmUgJiYgdmFsaWRFbGVtZW50c1t0YWddID09PSB0cnVlKSB7XG4gICAgICAgIG91dCgnPCcpO1xuICAgICAgICBvdXQodGFnKTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGF0dHJzLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgdmFyIGxrZXk9YW5ndWxhci5sb3dlcmNhc2Uoa2V5KTtcbiAgICAgICAgICB2YXIgaXNJbWFnZSA9ICh0YWcgPT09ICdpbWcnICYmIGxrZXkgPT09ICdzcmMnKSB8fCAobGtleSA9PT0gJ2JhY2tncm91bmQnKTtcbiAgICAgICAgICBpZiAodmFsaWRBdHRyc1tsa2V5XSA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICAgKHVyaUF0dHJzW2xrZXldICE9PSB0cnVlIHx8IHVyaVZhbGlkYXRvcih2YWx1ZSwgaXNJbWFnZSkpKSB7XG4gICAgICAgICAgICBvdXQoJyAnKTtcbiAgICAgICAgICAgIG91dChrZXkpO1xuICAgICAgICAgICAgb3V0KCc9XCInKTtcbiAgICAgICAgICAgIG91dChlbmNvZGVFbnRpdGllcyh2YWx1ZSkpO1xuICAgICAgICAgICAgb3V0KCdcIicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG91dCh1bmFyeSA/ICcvPicgOiAnPicpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZW5kOiBmdW5jdGlvbih0YWcpIHtcbiAgICAgICAgdGFnID0gYW5ndWxhci5sb3dlcmNhc2UodGFnKTtcbiAgICAgICAgaWYgKCFpZ25vcmUgJiYgdmFsaWRFbGVtZW50c1t0YWddID09PSB0cnVlKSB7XG4gICAgICAgICAgb3V0KCc8LycpO1xuICAgICAgICAgIG91dCh0YWcpO1xuICAgICAgICAgIG91dCgnPicpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWcgPT0gaWdub3JlKSB7XG4gICAgICAgICAgaWdub3JlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgY2hhcnM6IGZ1bmN0aW9uKGNoYXJzKSB7XG4gICAgICAgIGlmICghaWdub3JlKSB7XG4gICAgICAgICAgb3V0KGVuY29kZUVudGl0aWVzKGNoYXJzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgfTtcbn1cblxuXG4vLyBkZWZpbmUgbmdTYW5pdGl6ZSBtb2R1bGUgYW5kIHJlZ2lzdGVyICRzYW5pdGl6ZSBzZXJ2aWNlXG5hbmd1bGFyLm1vZHVsZSgnbmdTYW5pdGl6ZScsIFtdKS5wcm92aWRlcignJHNhbml0aXplJywgJFNhbml0aXplUHJvdmlkZXIpO1xuXG4vKiBnbG9iYWwgc2FuaXRpemVUZXh0OiBmYWxzZSAqL1xuXG4vKipcbiAqIEBuZ2RvYyBmaWx0ZXJcbiAqIEBuYW1lIGxpbmt5XG4gKiBAa2luZCBmdW5jdGlvblxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogRmluZHMgbGlua3MgaW4gdGV4dCBpbnB1dCBhbmQgdHVybnMgdGhlbSBpbnRvIGh0bWwgbGlua3MuIFN1cHBvcnRzIGh0dHAvaHR0cHMvZnRwL21haWx0byBhbmRcbiAqIHBsYWluIGVtYWlsIGFkZHJlc3MgbGlua3MuXG4gKlxuICogUmVxdWlyZXMgdGhlIHtAbGluayBuZ1Nhbml0aXplIGBuZ1Nhbml0aXplYH0gbW9kdWxlIHRvIGJlIGluc3RhbGxlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBJbnB1dCB0ZXh0LlxuICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldCBXaW5kb3cgKF9ibGFua3xfc2VsZnxfcGFyZW50fF90b3ApIG9yIG5hbWVkIGZyYW1lIHRvIG9wZW4gbGlua3MgaW4uXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBIdG1sLWxpbmtpZmllZCB0ZXh0LlxuICpcbiAqIEB1c2FnZVxuICAgPHNwYW4gbmctYmluZC1odG1sPVwibGlua3lfZXhwcmVzc2lvbiB8IGxpbmt5XCI+PC9zcGFuPlxuICpcbiAqIEBleGFtcGxlXG4gICA8ZXhhbXBsZSBtb2R1bGU9XCJsaW5reUV4YW1wbGVcIiBkZXBzPVwiYW5ndWxhci1zYW5pdGl6ZS5qc1wiPlxuICAgICA8ZmlsZSBuYW1lPVwiaW5kZXguaHRtbFwiPlxuICAgICAgIDxzY3JpcHQ+XG4gICAgICAgICBhbmd1bGFyLm1vZHVsZSgnbGlua3lFeGFtcGxlJywgWyduZ1Nhbml0aXplJ10pXG4gICAgICAgICAgIC5jb250cm9sbGVyKCdFeGFtcGxlQ29udHJvbGxlcicsIFsnJHNjb3BlJywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAgICAgICAgICAgJHNjb3BlLnNuaXBwZXQgPVxuICAgICAgICAgICAgICAgJ1ByZXR0eSB0ZXh0IHdpdGggc29tZSBsaW5rczpcXG4nK1xuICAgICAgICAgICAgICAgJ2h0dHA6Ly9hbmd1bGFyanMub3JnLyxcXG4nK1xuICAgICAgICAgICAgICAgJ21haWx0bzp1c0Bzb21ld2hlcmUub3JnLFxcbicrXG4gICAgICAgICAgICAgICAnYW5vdGhlckBzb21ld2hlcmUub3JnLFxcbicrXG4gICAgICAgICAgICAgICAnYW5kIG9uZSBtb3JlOiBmdHA6Ly8xMjcuMC4wLjEvLic7XG4gICAgICAgICAgICAgJHNjb3BlLnNuaXBwZXRXaXRoVGFyZ2V0ID0gJ2h0dHA6Ly9hbmd1bGFyanMub3JnLyc7XG4gICAgICAgICAgIH1dKTtcbiAgICAgICA8L3NjcmlwdD5cbiAgICAgICA8ZGl2IG5nLWNvbnRyb2xsZXI9XCJFeGFtcGxlQ29udHJvbGxlclwiPlxuICAgICAgIFNuaXBwZXQ6IDx0ZXh0YXJlYSBuZy1tb2RlbD1cInNuaXBwZXRcIiBjb2xzPVwiNjBcIiByb3dzPVwiM1wiPjwvdGV4dGFyZWE+XG4gICAgICAgPHRhYmxlPlxuICAgICAgICAgPHRyPlxuICAgICAgICAgICA8dGQ+RmlsdGVyPC90ZD5cbiAgICAgICAgICAgPHRkPlNvdXJjZTwvdGQ+XG4gICAgICAgICAgIDx0ZD5SZW5kZXJlZDwvdGQ+XG4gICAgICAgICA8L3RyPlxuICAgICAgICAgPHRyIGlkPVwibGlua3ktZmlsdGVyXCI+XG4gICAgICAgICAgIDx0ZD5saW5reSBmaWx0ZXI8L3RkPlxuICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgPHByZT4mbHQ7ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXQgfCBsaW5reVwiJmd0Ozxicj4mbHQ7L2RpdiZndDs8L3ByZT5cbiAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgIDxkaXYgbmctYmluZC1odG1sPVwic25pcHBldCB8IGxpbmt5XCI+PC9kaXY+XG4gICAgICAgICAgIDwvdGQ+XG4gICAgICAgICA8L3RyPlxuICAgICAgICAgPHRyIGlkPVwibGlua3ktdGFyZ2V0XCI+XG4gICAgICAgICAgPHRkPmxpbmt5IHRhcmdldDwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPHByZT4mbHQ7ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXRXaXRoVGFyZ2V0IHwgbGlua3k6J19ibGFuaydcIiZndDs8YnI+Jmx0Oy9kaXYmZ3Q7PC9wcmU+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXRXaXRoVGFyZ2V0IHwgbGlua3k6J19ibGFuaydcIj48L2Rpdj5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICAgIDx0ciBpZD1cImVzY2FwZWQtaHRtbFwiPlxuICAgICAgICAgICA8dGQ+bm8gZmlsdGVyPC90ZD5cbiAgICAgICAgICAgPHRkPjxwcmU+Jmx0O2RpdiBuZy1iaW5kPVwic25pcHBldFwiJmd0Ozxicj4mbHQ7L2RpdiZndDs8L3ByZT48L3RkPlxuICAgICAgICAgICA8dGQ+PGRpdiBuZy1iaW5kPVwic25pcHBldFwiPjwvZGl2PjwvdGQ+XG4gICAgICAgICA8L3RyPlxuICAgICAgIDwvdGFibGU+XG4gICAgIDwvZmlsZT5cbiAgICAgPGZpbGUgbmFtZT1cInByb3RyYWN0b3IuanNcIiB0eXBlPVwicHJvdHJhY3RvclwiPlxuICAgICAgIGl0KCdzaG91bGQgbGlua2lmeSB0aGUgc25pcHBldCB3aXRoIHVybHMnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmlkKCdsaW5reS1maWx0ZXInKSkuZWxlbWVudChieS5iaW5kaW5nKCdzbmlwcGV0IHwgbGlua3knKSkuZ2V0VGV4dCgpKS5cbiAgICAgICAgICAgICB0b0JlKCdQcmV0dHkgdGV4dCB3aXRoIHNvbWUgbGlua3M6IGh0dHA6Ly9hbmd1bGFyanMub3JnLywgdXNAc29tZXdoZXJlLm9yZywgJyArXG4gICAgICAgICAgICAgICAgICAnYW5vdGhlckBzb21ld2hlcmUub3JnLCBhbmQgb25lIG1vcmU6IGZ0cDovLzEyNy4wLjAuMS8uJyk7XG4gICAgICAgICBleHBlY3QoZWxlbWVudC5hbGwoYnkuY3NzKCcjbGlua3ktZmlsdGVyIGEnKSkuY291bnQoKSkudG9FcXVhbCg0KTtcbiAgICAgICB9KTtcblxuICAgICAgIGl0KCdzaG91bGQgbm90IGxpbmtpZnkgc25pcHBldCB3aXRob3V0IHRoZSBsaW5reSBmaWx0ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmlkKCdlc2NhcGVkLWh0bWwnKSkuZWxlbWVudChieS5iaW5kaW5nKCdzbmlwcGV0JykpLmdldFRleHQoKSkuXG4gICAgICAgICAgICAgdG9CZSgnUHJldHR5IHRleHQgd2l0aCBzb21lIGxpbmtzOiBodHRwOi8vYW5ndWxhcmpzLm9yZy8sIG1haWx0bzp1c0Bzb21ld2hlcmUub3JnLCAnICtcbiAgICAgICAgICAgICAgICAgICdhbm90aGVyQHNvbWV3aGVyZS5vcmcsIGFuZCBvbmUgbW9yZTogZnRwOi8vMTI3LjAuMC4xLy4nKTtcbiAgICAgICAgIGV4cGVjdChlbGVtZW50LmFsbChieS5jc3MoJyNlc2NhcGVkLWh0bWwgYScpKS5jb3VudCgpKS50b0VxdWFsKDApO1xuICAgICAgIH0pO1xuXG4gICAgICAgaXQoJ3Nob3VsZCB1cGRhdGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgIGVsZW1lbnQoYnkubW9kZWwoJ3NuaXBwZXQnKSkuY2xlYXIoKTtcbiAgICAgICAgIGVsZW1lbnQoYnkubW9kZWwoJ3NuaXBwZXQnKSkuc2VuZEtleXMoJ25ldyBodHRwOi8vbGluay4nKTtcbiAgICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmlkKCdsaW5reS1maWx0ZXInKSkuZWxlbWVudChieS5iaW5kaW5nKCdzbmlwcGV0IHwgbGlua3knKSkuZ2V0VGV4dCgpKS5cbiAgICAgICAgICAgICB0b0JlKCduZXcgaHR0cDovL2xpbmsuJyk7XG4gICAgICAgICBleHBlY3QoZWxlbWVudC5hbGwoYnkuY3NzKCcjbGlua3ktZmlsdGVyIGEnKSkuY291bnQoKSkudG9FcXVhbCgxKTtcbiAgICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmlkKCdlc2NhcGVkLWh0bWwnKSkuZWxlbWVudChieS5iaW5kaW5nKCdzbmlwcGV0JykpLmdldFRleHQoKSlcbiAgICAgICAgICAgICAudG9CZSgnbmV3IGh0dHA6Ly9saW5rLicpO1xuICAgICAgIH0pO1xuXG4gICAgICAgaXQoJ3Nob3VsZCB3b3JrIHdpdGggdGhlIHRhcmdldCBwcm9wZXJ0eScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBleHBlY3QoZWxlbWVudChieS5pZCgnbGlua3ktdGFyZ2V0JykpLlxuICAgICAgICAgICAgZWxlbWVudChieS5iaW5kaW5nKFwic25pcHBldFdpdGhUYXJnZXQgfCBsaW5reTonX2JsYW5rJ1wiKSkuZ2V0VGV4dCgpKS5cbiAgICAgICAgICAgIHRvQmUoJ2h0dHA6Ly9hbmd1bGFyanMub3JnLycpO1xuICAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNsaW5reS10YXJnZXQgYScpKS5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpKS50b0VxdWFsKCdfYmxhbmsnKTtcbiAgICAgICB9KTtcbiAgICAgPC9maWxlPlxuICAgPC9leGFtcGxlPlxuICovXG5hbmd1bGFyLm1vZHVsZSgnbmdTYW5pdGl6ZScpLmZpbHRlcignbGlua3knLCBbJyRzYW5pdGl6ZScsIGZ1bmN0aW9uKCRzYW5pdGl6ZSkge1xuICB2YXIgTElOS1lfVVJMX1JFR0VYUCA9XG4gICAgICAgIC8oKGZ0cHxodHRwcz8pOlxcL1xcL3wobWFpbHRvOik/W0EtWmEtejAtOS5fJSstXStAKVxcUypbXlxccy47LCgpe308PlwiXS8sXG4gICAgICBNQUlMVE9fUkVHRVhQID0gL15tYWlsdG86LztcblxuICByZXR1cm4gZnVuY3Rpb24odGV4dCwgdGFyZ2V0KSB7XG4gICAgaWYgKCF0ZXh0KSByZXR1cm4gdGV4dDtcbiAgICB2YXIgbWF0Y2g7XG4gICAgdmFyIHJhdyA9IHRleHQ7XG4gICAgdmFyIGh0bWwgPSBbXTtcbiAgICB2YXIgdXJsO1xuICAgIHZhciBpO1xuICAgIHdoaWxlICgobWF0Y2ggPSByYXcubWF0Y2goTElOS1lfVVJMX1JFR0VYUCkpKSB7XG4gICAgICAvLyBXZSBjYW4gbm90IGVuZCBpbiB0aGVzZSBhcyB0aGV5IGFyZSBzb21ldGltZXMgZm91bmQgYXQgdGhlIGVuZCBvZiB0aGUgc2VudGVuY2VcbiAgICAgIHVybCA9IG1hdGNoWzBdO1xuICAgICAgLy8gaWYgd2UgZGlkIG5vdCBtYXRjaCBmdHAvaHR0cC9tYWlsdG8gdGhlbiBhc3N1bWUgbWFpbHRvXG4gICAgICBpZiAobWF0Y2hbMl0gPT0gbWF0Y2hbM10pIHVybCA9ICdtYWlsdG86JyArIHVybDtcbiAgICAgIGkgPSBtYXRjaC5pbmRleDtcbiAgICAgIGFkZFRleHQocmF3LnN1YnN0cigwLCBpKSk7XG4gICAgICBhZGRMaW5rKHVybCwgbWF0Y2hbMF0ucmVwbGFjZShNQUlMVE9fUkVHRVhQLCAnJykpO1xuICAgICAgcmF3ID0gcmF3LnN1YnN0cmluZyhpICsgbWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICB9XG4gICAgYWRkVGV4dChyYXcpO1xuICAgIHJldHVybiAkc2FuaXRpemUoaHRtbC5qb2luKCcnKSk7XG5cbiAgICBmdW5jdGlvbiBhZGRUZXh0KHRleHQpIHtcbiAgICAgIGlmICghdGV4dCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBodG1sLnB1c2goc2FuaXRpemVUZXh0KHRleHQpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRMaW5rKHVybCwgdGV4dCkge1xuICAgICAgaHRtbC5wdXNoKCc8YSAnKTtcbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCh0YXJnZXQpKSB7XG4gICAgICAgIGh0bWwucHVzaCgndGFyZ2V0PVwiJyk7XG4gICAgICAgIGh0bWwucHVzaCh0YXJnZXQpO1xuICAgICAgICBodG1sLnB1c2goJ1wiICcpO1xuICAgICAgfVxuICAgICAgaHRtbC5wdXNoKCdocmVmPVwiJyk7XG4gICAgICBodG1sLnB1c2godXJsKTtcbiAgICAgIGh0bWwucHVzaCgnXCI+Jyk7XG4gICAgICBhZGRUZXh0KHRleHQpO1xuICAgICAgaHRtbC5wdXNoKCc8L2E+Jyk7XG4gICAgfVxuICB9O1xufV0pO1xuXG5cbn0pKHdpbmRvdywgd2luZG93LmFuZ3VsYXIpO1xuIiwiLyoqIVxuICogQW5ndWxhckpTIGZpbGUgdXBsb2FkIHNoaW0gZm9yIEhUTUw1IEZvcm1EYXRhXG4gKiBAYXV0aG9yICBEYW5pYWwgIDxkYW5pYWwuZmFyaWRAZ21haWwuY29tPlxuICogQHZlcnNpb24gMS42LjEyXG4gKi9cbihmdW5jdGlvbigpIHtcblxudmFyIGhhc0ZsYXNoID0gZnVuY3Rpb24oKSB7XG5cdHRyeSB7XG5cdCAgdmFyIGZvID0gbmV3IEFjdGl2ZVhPYmplY3QoJ1Nob2Nrd2F2ZUZsYXNoLlNob2Nrd2F2ZUZsYXNoJyk7XG5cdCAgaWYgKGZvKSByZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaChlKSB7XG5cdCAgaWYgKG5hdmlnYXRvci5taW1lVHlwZXNbJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJ10gIT0gdW5kZWZpbmVkKSByZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbnZhciBwYXRjaFhIUiA9IGZ1bmN0aW9uKGZuTmFtZSwgbmV3Rm4pIHtcblx0d2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZVtmbk5hbWVdID0gbmV3Rm4od2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZVtmbk5hbWVdKTtcbn07XG5cbmlmICh3aW5kb3cuWE1MSHR0cFJlcXVlc3QpIHtcblx0aWYgKHdpbmRvdy5Gb3JtRGF0YSAmJiAoIXdpbmRvdy5GaWxlQVBJIHx8ICFGaWxlQVBJLmZvcmNlTG9hZCkpIHtcblx0XHQvLyBhbGxvdyBhY2Nlc3MgdG8gQW5ndWxhciBYSFIgcHJpdmF0ZSBmaWVsZDogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9pc3N1ZXMvMTkzNFxuXHRcdHBhdGNoWEhSKCdzZXRSZXF1ZXN0SGVhZGVyJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGhlYWRlciwgdmFsdWUpIHtcblx0XHRcdFx0aWYgKGhlYWRlciA9PT0gJ19fc2V0WEhSXycpIHtcblx0XHRcdFx0XHR2YXIgdmFsID0gdmFsdWUodGhpcyk7XG5cdFx0XHRcdFx0Ly8gZml4IGZvciBhbmd1bGFyIDwgMS4yLjBcblx0XHRcdFx0XHRpZiAodmFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRcdHZhbCh0aGlzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3JpZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGluaXRpYWxpemVVcGxvYWRMaXN0ZW5lciA9IGZ1bmN0aW9uKHhocikge1xuXHRcdFx0aWYgKCF4aHIuX19saXN0ZW5lcnMpIHtcblx0XHRcdFx0aWYgKCF4aHIudXBsb2FkKSB4aHIudXBsb2FkID0ge307XG5cdFx0XHRcdHhoci5fX2xpc3RlbmVycyA9IFtdO1xuXHRcdFx0XHR2YXIgb3JpZ0FkZEV2ZW50TGlzdGVuZXIgPSB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXI7XG5cdFx0XHRcdHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHQsIGZuLCBiKSB7XG5cdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzW3RdID0gZm47XG5cdFx0XHRcdFx0b3JpZ0FkZEV2ZW50TGlzdGVuZXIgJiYgb3JpZ0FkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0cGF0Y2hYSFIoJ29wZW4nLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24obSwgdXJsLCBiKSB7XG5cdFx0XHRcdGluaXRpYWxpemVVcGxvYWRMaXN0ZW5lcih0aGlzKTtcblx0XHRcdFx0dGhpcy5fX3VybCA9IHVybDtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRvcmlnLmFwcGx5KHRoaXMsIFttLCB1cmwsIGJdKTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdGlmIChlLm1lc3NhZ2UuaW5kZXhPZignQWNjZXNzIGlzIGRlbmllZCcpID4gLTEpIHtcblx0XHRcdFx0XHRcdG9yaWcuYXBwbHkodGhpcywgW20sICdfZml4X2Zvcl9pZV9jcm9zc2RvbWFpbl9fJywgYl0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ2dldFJlc3BvbnNlSGVhZGVyJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGgpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX19maWxlQXBpWEhSICYmIHRoaXMuX19maWxlQXBpWEhSLmdldFJlc3BvbnNlSGVhZGVyID8gdGhpcy5fX2ZpbGVBcGlYSFIuZ2V0UmVzcG9uc2VIZWFkZXIoaCkgOiAob3JpZyA9PSBudWxsID8gbnVsbCA6IG9yaWcuYXBwbHkodGhpcywgW2hdKSk7XG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ2dldEFsbFJlc3BvbnNlSGVhZGVycycsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX19maWxlQXBpWEhSICYmIHRoaXMuX19maWxlQXBpWEhSLmdldEFsbFJlc3BvbnNlSGVhZGVycyA/IHRoaXMuX19maWxlQXBpWEhSLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIDogKG9yaWcgPT0gbnVsbCA/IG51bGwgOiBvcmlnLmFwcGx5KHRoaXMpKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdhYm9ydCcsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX19maWxlQXBpWEhSICYmIHRoaXMuX19maWxlQXBpWEhSLmFib3J0ID8gdGhpcy5fX2ZpbGVBcGlYSFIuYWJvcnQoKSA6IChvcmlnID09IG51bGwgPyBudWxsIDogb3JpZy5hcHBseSh0aGlzKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignc2V0UmVxdWVzdEhlYWRlcicsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihoZWFkZXIsIHZhbHVlKSB7XG5cdFx0XHRcdGlmIChoZWFkZXIgPT09ICdfX3NldFhIUl8nKSB7XG5cdFx0XHRcdFx0aW5pdGlhbGl6ZVVwbG9hZExpc3RlbmVyKHRoaXMpO1xuXHRcdFx0XHRcdHZhciB2YWwgPSB2YWx1ZSh0aGlzKTtcblx0XHRcdFx0XHQvLyBmaXggZm9yIGFuZ3VsYXIgPCAxLjIuMFxuXHRcdFx0XHRcdGlmICh2YWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuXHRcdFx0XHRcdFx0dmFsKHRoaXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLl9fcmVxdWVzdEhlYWRlcnMgPSB0aGlzLl9fcmVxdWVzdEhlYWRlcnMgfHwge307XG5cdFx0XHRcdFx0dGhpcy5fX3JlcXVlc3RIZWFkZXJzW2hlYWRlcl0gPSB2YWx1ZTtcblx0XHRcdFx0XHRvcmlnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdzZW5kJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgeGhyID0gdGhpcztcblx0XHRcdFx0aWYgKGFyZ3VtZW50c1swXSAmJiBhcmd1bWVudHNbMF0uX19pc1NoaW0pIHtcblx0XHRcdFx0XHR2YXIgZm9ybURhdGEgPSBhcmd1bWVudHNbMF07XG5cdFx0XHRcdFx0dmFyIGNvbmZpZyA9IHtcblx0XHRcdFx0XHRcdHVybDogeGhyLl9fdXJsLFxuXHRcdFx0XHRcdFx0anNvbnA6IGZhbHNlLCAvL3JlbW92ZXMgdGhlIGNhbGxiYWNrIGZvcm0gcGFyYW1cblx0XHRcdFx0XHRcdGNhY2hlOiB0cnVlLCAvL3JlbW92ZXMgdGhlID9maWxlYXBpWFhYIGluIHRoZSB1cmxcblx0XHRcdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbihlcnIsIGZpbGVBcGlYSFIpIHtcblx0XHRcdFx0XHRcdFx0eGhyLl9fY29tcGxldGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0aWYgKCFlcnIgJiYgeGhyLl9fbGlzdGVuZXJzWydsb2FkJ10pIFxuXHRcdFx0XHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1snbG9hZCddKHt0eXBlOiAnbG9hZCcsIGxvYWRlZDogeGhyLl9fbG9hZGVkLCB0b3RhbDogeGhyLl9fdG90YWwsIHRhcmdldDogeGhyLCBsZW5ndGhDb21wdXRhYmxlOiB0cnVlfSk7XG5cdFx0XHRcdFx0XHRcdGlmICghZXJyICYmIHhoci5fX2xpc3RlbmVyc1snbG9hZGVuZCddKSBcblx0XHRcdFx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbJ2xvYWRlbmQnXSh7dHlwZTogJ2xvYWRlbmQnLCBsb2FkZWQ6IHhoci5fX2xvYWRlZCwgdG90YWw6IHhoci5fX3RvdGFsLCB0YXJnZXQ6IHhociwgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZXJyID09PSAnYWJvcnQnICYmIHhoci5fX2xpc3RlbmVyc1snYWJvcnQnXSkgXG5cdFx0XHRcdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzWydhYm9ydCddKHt0eXBlOiAnYWJvcnQnLCBsb2FkZWQ6IHhoci5fX2xvYWRlZCwgdG90YWw6IHhoci5fX3RvdGFsLCB0YXJnZXQ6IHhociwgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZmlsZUFwaVhIUi5zdGF0dXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3N0YXR1cycsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiAoZmlsZUFwaVhIUi5zdGF0dXMgPT0gMCAmJiBlcnIgJiYgZXJyICE9PSAnYWJvcnQnKSA/IDUwMCA6IGZpbGVBcGlYSFIuc3RhdHVzfX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZmlsZUFwaVhIUi5zdGF0dXNUZXh0ICE9PSB1bmRlZmluZWQpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdzdGF0dXNUZXh0Jywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIGZpbGVBcGlYSFIuc3RhdHVzVGV4dH19KTtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3JlYWR5U3RhdGUnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gNH19KTtcblx0XHRcdFx0XHRcdFx0aWYgKGZpbGVBcGlYSFIucmVzcG9uc2UgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3Jlc3BvbnNlJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIGZpbGVBcGlYSFIucmVzcG9uc2V9fSk7XG5cdFx0XHRcdFx0XHRcdHZhciByZXNwID0gZmlsZUFwaVhIUi5yZXNwb25zZVRleHQgfHwgKGVyciAmJiBmaWxlQXBpWEhSLnN0YXR1cyA9PSAwICYmIGVyciAhPT0gJ2Fib3J0JyA/IGVyciA6IHVuZGVmaW5lZCk7XG5cdFx0XHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdyZXNwb25zZVRleHQnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gcmVzcH19KTtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3Jlc3BvbnNlJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIHJlc3B9fSk7XG5cdFx0XHRcdFx0XHRcdGlmIChlcnIpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdlcnInLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gZXJyfX0pO1xuXHRcdFx0XHRcdFx0XHR4aHIuX19maWxlQXBpWEhSID0gZmlsZUFwaVhIUjtcblx0XHRcdFx0XHRcdFx0aWYgKHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UpIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UoKTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRmaWxlcHJvZ3Jlc3M6IGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdFx0ZS50YXJnZXQgPSB4aHI7XG5cdFx0XHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1sncHJvZ3Jlc3MnXSAmJiB4aHIuX19saXN0ZW5lcnNbJ3Byb2dyZXNzJ10oZSk7XG5cdFx0XHRcdFx0XHRcdHhoci5fX3RvdGFsID0gZS50b3RhbDtcblx0XHRcdFx0XHRcdFx0eGhyLl9fbG9hZGVkID0gZS5sb2FkZWQ7XG5cdFx0XHRcdFx0XHRcdGlmIChlLnRvdGFsID09PSBlLmxvYWRlZCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIGZpeCBmbGFzaCBpc3N1ZSB0aGF0IGRvZXNuJ3QgY2FsbCBjb21wbGV0ZSBpZiB0aGVyZSBpcyBubyByZXNwb25zZSB0ZXh0IGZyb20gdGhlIHNlcnZlciAgXG5cdFx0XHRcdFx0XHRcdFx0dmFyIF90aGlzID0gdGhpc1xuXHRcdFx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIXhoci5fX2NvbXBsZXRlZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzID0gZnVuY3Rpb24oKXt9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRfdGhpcy5jb21wbGV0ZShudWxsLCB7c3RhdHVzOiAyMDQsIHN0YXR1c1RleHQ6ICdObyBDb250ZW50J30pO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0sIDEwMDAwKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGhlYWRlcnM6IHhoci5fX3JlcXVlc3RIZWFkZXJzXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbmZpZy5kYXRhID0ge307XG5cdFx0XHRcdFx0Y29uZmlnLmZpbGVzID0ge31cblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZvcm1EYXRhLmRhdGEubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdHZhciBpdGVtID0gZm9ybURhdGEuZGF0YVtpXTtcblx0XHRcdFx0XHRcdGlmIChpdGVtLnZhbCAhPSBudWxsICYmIGl0ZW0udmFsLm5hbWUgIT0gbnVsbCAmJiBpdGVtLnZhbC5zaXplICE9IG51bGwgJiYgaXRlbS52YWwudHlwZSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdGNvbmZpZy5maWxlc1tpdGVtLmtleV0gPSBpdGVtLnZhbDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNvbmZpZy5kYXRhW2l0ZW0ua2V5XSA9IGl0ZW0udmFsO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZiAoIWhhc0ZsYXNoKCkpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgJ0Fkb2RlIEZsYXNoIFBsYXllciBuZWVkIHRvIGJlIGluc3RhbGxlZC4gVG8gY2hlY2sgYWhlYWQgdXNlIFwiRmlsZUFQSS5oYXNGbGFzaFwiJztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHhoci5fX2ZpbGVBcGlYSFIgPSBGaWxlQVBJLnVwbG9hZChjb25maWcpO1xuXHRcdFx0XHRcdH0sIDEpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9yaWcuYXBwbHkoeGhyLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0d2luZG93LlhNTEh0dHBSZXF1ZXN0Ll9faXNTaGltID0gdHJ1ZTtcbn1cblxuaWYgKCF3aW5kb3cuRm9ybURhdGEgfHwgKHdpbmRvdy5GaWxlQVBJICYmIEZpbGVBUEkuZm9yY2VMb2FkKSkge1xuXHR2YXIgYWRkRmxhc2ggPSBmdW5jdGlvbihlbGVtKSB7XG5cdFx0aWYgKCFoYXNGbGFzaCgpKSB7XG5cdFx0XHR0aHJvdyAnQWRvZGUgRmxhc2ggUGxheWVyIG5lZWQgdG8gYmUgaW5zdGFsbGVkLiBUbyBjaGVjayBhaGVhZCB1c2UgXCJGaWxlQVBJLmhhc0ZsYXNoXCInO1xuXHRcdH1cblx0XHR2YXIgZWwgPSBhbmd1bGFyLmVsZW1lbnQoZWxlbSk7XG5cdFx0aWYgKCFlbC5hdHRyKCdkaXNhYmxlZCcpKSB7XG5cdFx0XHRpZiAoIWVsLmhhc0NsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKSAmJiAoZWxlbS5nZXRBdHRyaWJ1dGUoJ25nLWZpbGUtc2VsZWN0JykgIT0gbnVsbCB8fCBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1uZy1maWxlLXNlbGVjdCcpICE9IG51bGwpKSB7XG5cdFx0XHRcdGlmIChGaWxlQVBJLndyYXBJbnNpZGVEaXYpIHtcblx0XHRcdFx0XHR2YXIgd3JhcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHRcdHdyYXAuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJqcy1maWxlYXBpLXdyYXBwZXJcIiBzdHlsZT1cInBvc2l0aW9uOnJlbGF0aXZlOyBvdmVyZmxvdzpoaWRkZW5cIj48L2Rpdj4nO1xuXHRcdFx0XHRcdHdyYXAgPSB3cmFwLmZpcnN0Q2hpbGQ7XG5cdFx0XHRcdFx0dmFyIHBhcmVudCA9IGVsZW0ucGFyZW50Tm9kZTtcblx0XHRcdFx0XHRwYXJlbnQuaW5zZXJ0QmVmb3JlKHdyYXAsIGVsZW0pO1xuXHRcdFx0XHRcdHBhcmVudC5yZW1vdmVDaGlsZChlbGVtKTtcblx0XHRcdFx0XHR3cmFwLmFwcGVuZENoaWxkKGVsZW0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGVsLmFkZENsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKTtcblx0XHRcdFx0XHRpZiAoZWwucGFyZW50KClbMF0uX19maWxlX2NsaWNrX2ZuX2RlbGVnYXRlXykge1xuXHRcdFx0XHRcdFx0aWYgKGVsLnBhcmVudCgpLmNzcygncG9zaXRpb24nKSA9PT0gJycgfHwgZWwucGFyZW50KCkuY3NzKCdwb3NpdGlvbicpID09PSAnc3RhdGljJykge1xuXHRcdFx0XHRcdFx0XHRlbC5wYXJlbnQoKS5jc3MoJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbC5jc3MoJ3RvcCcsIDApLmNzcygnYm90dG9tJywgMCkuY3NzKCdsZWZ0JywgMCkuY3NzKCdyaWdodCcsIDApLmNzcygnd2lkdGgnLCAnMTAwJScpLmNzcygnaGVpZ2h0JywgJzEwMCUnKS5cblx0XHRcdFx0XHRcdFx0Y3NzKCdwYWRkaW5nJywgMCkuY3NzKCdtYXJnaW4nLCAwKTtcblx0XHRcdFx0XHRcdGVsLnBhcmVudCgpLnVuYmluZCgnY2xpY2snLCBlbC5wYXJlbnQoKVswXS5fX2ZpbGVfY2xpY2tfZm5fZGVsZWdhdGVfKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdHZhciBjaGFuZ2VGbldyYXBwZXIgPSBmdW5jdGlvbihmbikge1xuXHRcdHJldHVybiBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBmaWxlcyA9IEZpbGVBUEkuZ2V0RmlsZXMoZXZ0KTtcblx0XHRcdC8vanVzdCBhIGRvdWJsZSBjaGVjayBmb3IgIzIzM1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoZmlsZXNbaV0uc2l6ZSA9PT0gdW5kZWZpbmVkKSBmaWxlc1tpXS5zaXplID0gMDtcblx0XHRcdFx0aWYgKGZpbGVzW2ldLm5hbWUgPT09IHVuZGVmaW5lZCkgZmlsZXNbaV0ubmFtZSA9ICdmaWxlJztcblx0XHRcdFx0aWYgKGZpbGVzW2ldLnR5cGUgPT09IHVuZGVmaW5lZCkgZmlsZXNbaV0udHlwZSA9ICd1bmRlZmluZWQnO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFldnQudGFyZ2V0KSB7XG5cdFx0XHRcdGV2dC50YXJnZXQgPSB7fTtcblx0XHRcdH1cblx0XHRcdGV2dC50YXJnZXQuZmlsZXMgPSBmaWxlcztcblx0XHRcdC8vIGlmIGV2dC50YXJnZXQuZmlsZXMgaXMgbm90IHdyaXRhYmxlIHVzZSBoZWxwZXIgZmllbGRcblx0XHRcdGlmIChldnQudGFyZ2V0LmZpbGVzICE9IGZpbGVzKSB7XG5cdFx0XHRcdGV2dC5fX2ZpbGVzXyA9IGZpbGVzO1xuXHRcdFx0fVxuXHRcdFx0KGV2dC5fX2ZpbGVzXyB8fCBldnQudGFyZ2V0LmZpbGVzKS5pdGVtID0gZnVuY3Rpb24oaSkge1xuXHRcdFx0XHRyZXR1cm4gKGV2dC5fX2ZpbGVzXyB8fCBldnQudGFyZ2V0LmZpbGVzKVtpXSB8fCBudWxsO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGZuKSBmbi5hcHBseSh0aGlzLCBbZXZ0XSk7XG5cdFx0fTtcblx0fTtcblx0dmFyIGlzRmlsZUNoYW5nZSA9IGZ1bmN0aW9uKGVsZW0sIGUpIHtcblx0XHRyZXR1cm4gKGUudG9Mb3dlckNhc2UoKSA9PT0gJ2NoYW5nZScgfHwgZS50b0xvd2VyQ2FzZSgpID09PSAnb25jaGFuZ2UnKSAmJiBlbGVtLmdldEF0dHJpYnV0ZSgndHlwZScpID09ICdmaWxlJztcblx0fVxuXHRpZiAoSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcikge1xuXHRcdEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSAoZnVuY3Rpb24ob3JpZ0FkZEV2ZW50TGlzdGVuZXIpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihlLCBmbiwgYiwgZCkge1xuXHRcdFx0XHRpZiAoaXNGaWxlQ2hhbmdlKHRoaXMsIGUpKSB7XG5cdFx0XHRcdFx0YWRkRmxhc2godGhpcyk7XG5cdFx0XHRcdFx0b3JpZ0FkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgW2UsIGNoYW5nZUZuV3JhcHBlcihmbiksIGIsIGRdKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvcmlnQWRkRXZlbnRMaXN0ZW5lci5hcHBseSh0aGlzLCBbZSwgZm4sIGIsIGRdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIpO1xuXHR9XG5cdGlmIChIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hdHRhY2hFdmVudCkge1xuXHRcdEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmF0dGFjaEV2ZW50ID0gKGZ1bmN0aW9uKG9yaWdBdHRhY2hFdmVudCkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGUsIGZuKSB7XG5cdFx0XHRcdGlmIChpc0ZpbGVDaGFuZ2UodGhpcywgZSkpIHtcblx0XHRcdFx0XHRhZGRGbGFzaCh0aGlzKTtcblx0XHRcdFx0XHRpZiAod2luZG93LmpRdWVyeSkge1xuXHRcdFx0XHRcdFx0Ly8gZml4IGZvciAjMjgxIGpRdWVyeSBvbiBJRThcblx0XHRcdFx0XHRcdGFuZ3VsYXIuZWxlbWVudCh0aGlzKS5iaW5kKCdjaGFuZ2UnLCBjaGFuZ2VGbldyYXBwZXIobnVsbCkpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvcmlnQXR0YWNoRXZlbnQuYXBwbHkodGhpcywgW2UsIGNoYW5nZUZuV3JhcHBlcihmbildKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3JpZ0F0dGFjaEV2ZW50LmFwcGx5KHRoaXMsIFtlLCBmbl0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkoSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYXR0YWNoRXZlbnQpO1xuXHR9XG5cblx0d2luZG93LkZvcm1EYXRhID0gRm9ybURhdGEgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0YXBwZW5kOiBmdW5jdGlvbihrZXksIHZhbCwgbmFtZSkge1xuXHRcdFx0XHR0aGlzLmRhdGEucHVzaCh7XG5cdFx0XHRcdFx0a2V5OiBrZXksXG5cdFx0XHRcdFx0dmFsOiB2YWwsXG5cdFx0XHRcdFx0bmFtZTogbmFtZVxuXHRcdFx0XHR9KTtcblx0XHRcdH0sXG5cdFx0XHRkYXRhOiBbXSxcblx0XHRcdF9faXNTaGltOiB0cnVlXG5cdFx0fTtcblx0fTtcblxuXHQoZnVuY3Rpb24gKCkge1xuXHRcdC8vbG9hZCBGaWxlQVBJXG5cdFx0aWYgKCF3aW5kb3cuRmlsZUFQSSkge1xuXHRcdFx0d2luZG93LkZpbGVBUEkgPSB7fTtcblx0XHR9XG5cdFx0aWYgKEZpbGVBUEkuZm9yY2VMb2FkKSB7XG5cdFx0XHRGaWxlQVBJLmh0bWw1ID0gZmFsc2U7XG5cdFx0fVxuXHRcdFxuXHRcdGlmICghRmlsZUFQSS51cGxvYWQpIHtcblx0XHRcdHZhciBqc1VybCwgYmFzZVBhdGgsIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpLCBhbGxTY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpLCBpLCBpbmRleCwgc3JjO1xuXHRcdFx0aWYgKHdpbmRvdy5GaWxlQVBJLmpzVXJsKSB7XG5cdFx0XHRcdGpzVXJsID0gd2luZG93LkZpbGVBUEkuanNVcmw7XG5cdFx0XHR9IGVsc2UgaWYgKHdpbmRvdy5GaWxlQVBJLmpzUGF0aCkge1xuXHRcdFx0XHRiYXNlUGF0aCA9IHdpbmRvdy5GaWxlQVBJLmpzUGF0aDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBhbGxTY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0c3JjID0gYWxsU2NyaXB0c1tpXS5zcmM7XG5cdFx0XHRcdFx0aW5kZXggPSBzcmMuaW5kZXhPZignYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLmpzJylcblx0XHRcdFx0XHRpZiAoaW5kZXggPT0gLTEpIHtcblx0XHRcdFx0XHRcdGluZGV4ID0gc3JjLmluZGV4T2YoJ2FuZ3VsYXItZmlsZS11cGxvYWQtc2hpbS5taW4uanMnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdFx0XHRcdGJhc2VQYXRoID0gc3JjLnN1YnN0cmluZygwLCBpbmRleCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKEZpbGVBUEkuc3RhdGljUGF0aCA9PSBudWxsKSBGaWxlQVBJLnN0YXRpY1BhdGggPSBiYXNlUGF0aDtcblx0XHRcdHNjcmlwdC5zZXRBdHRyaWJ1dGUoJ3NyYycsIGpzVXJsIHx8IGJhc2VQYXRoICsgJ0ZpbGVBUEkubWluLmpzJyk7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7XG5cdFx0XHRGaWxlQVBJLmhhc0ZsYXNoID0gaGFzRmxhc2goKTtcblx0XHR9XG5cdH0pKCk7XG5cdEZpbGVBUEkuZGlzYWJsZUZpbGVJbnB1dCA9IGZ1bmN0aW9uKGVsZW0sIGRpc2FibGUpIHtcblx0XHRpZiAoZGlzYWJsZSkge1xuXHRcdFx0ZWxlbS5yZW1vdmVDbGFzcygnanMtZmlsZWFwaS13cmFwcGVyJylcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZWxlbS5hZGRDbGFzcygnanMtZmlsZWFwaS13cmFwcGVyJyk7XG5cdFx0fVxuXHR9XG59XG5cblxuaWYgKCF3aW5kb3cuRmlsZVJlYWRlcikge1xuXHR3aW5kb3cuRmlsZVJlYWRlciA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBfdGhpcyA9IHRoaXMsIGxvYWRTdGFydGVkID0gZmFsc2U7XG5cdFx0dGhpcy5saXN0ZW5lcnMgPSB7fTtcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBmbikge1xuXHRcdFx0X3RoaXMubGlzdGVuZXJzW3R5cGVdID0gX3RoaXMubGlzdGVuZXJzW3R5cGVdIHx8IFtdO1xuXHRcdFx0X3RoaXMubGlzdGVuZXJzW3R5cGVdLnB1c2goZm4pO1xuXHRcdH07XG5cdFx0dGhpcy5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgZm4pIHtcblx0XHRcdF90aGlzLmxpc3RlbmVyc1t0eXBlXSAmJiBfdGhpcy5saXN0ZW5lcnNbdHlwZV0uc3BsaWNlKF90aGlzLmxpc3RlbmVyc1t0eXBlXS5pbmRleE9mKGZuKSwgMSk7XG5cdFx0fTtcblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBsaXN0ID0gX3RoaXMubGlzdGVuZXJzW2V2dC50eXBlXTtcblx0XHRcdGlmIChsaXN0KSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGxpc3RbaV0uY2FsbChfdGhpcywgZXZ0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5vbmFib3J0ID0gdGhpcy5vbmVycm9yID0gdGhpcy5vbmxvYWQgPSB0aGlzLm9ubG9hZHN0YXJ0ID0gdGhpcy5vbmxvYWRlbmQgPSB0aGlzLm9ucHJvZ3Jlc3MgPSBudWxsO1xuXG5cdFx0dmFyIGNvbnN0cnVjdEV2ZW50ID0gZnVuY3Rpb24odHlwZSwgZXZ0KSB7XG5cdFx0XHR2YXIgZSA9IHt0eXBlOiB0eXBlLCB0YXJnZXQ6IF90aGlzLCBsb2FkZWQ6IGV2dC5sb2FkZWQsIHRvdGFsOiBldnQudG90YWwsIGVycm9yOiBldnQuZXJyb3J9O1xuXHRcdFx0aWYgKGV2dC5yZXN1bHQgIT0gbnVsbCkgZS50YXJnZXQucmVzdWx0ID0gZXZ0LnJlc3VsdDtcblx0XHRcdHJldHVybiBlO1xuXHRcdH07XG5cdFx0dmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRpZiAoIWxvYWRTdGFydGVkKSB7XG5cdFx0XHRcdGxvYWRTdGFydGVkID0gdHJ1ZTtcblx0XHRcdFx0X3RoaXMub25sb2Fkc3RhcnQgJiYgdGhpcy5vbmxvYWRzdGFydChjb25zdHJ1Y3RFdmVudCgnbG9hZHN0YXJ0JywgZXZ0KSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZXZ0LnR5cGUgPT09ICdsb2FkJykge1xuXHRcdFx0XHRfdGhpcy5vbmxvYWRlbmQgJiYgX3RoaXMub25sb2FkZW5kKGNvbnN0cnVjdEV2ZW50KCdsb2FkZW5kJywgZXZ0KSk7XG5cdFx0XHRcdHZhciBlID0gY29uc3RydWN0RXZlbnQoJ2xvYWQnLCBldnQpO1xuXHRcdFx0XHRfdGhpcy5vbmxvYWQgJiYgX3RoaXMub25sb2FkKGUpO1xuXHRcdFx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuXHRcdFx0fSBlbHNlIGlmIChldnQudHlwZSA9PT0gJ3Byb2dyZXNzJykge1xuXHRcdFx0XHR2YXIgZSA9IGNvbnN0cnVjdEV2ZW50KCdwcm9ncmVzcycsIGV2dCk7XG5cdFx0XHRcdF90aGlzLm9ucHJvZ3Jlc3MgJiYgX3RoaXMub25wcm9ncmVzcyhlKTtcblx0XHRcdFx0X3RoaXMuZGlzcGF0Y2hFdmVudChlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBlID0gY29uc3RydWN0RXZlbnQoJ2Vycm9yJywgZXZ0KTtcblx0XHRcdFx0X3RoaXMub25lcnJvciAmJiBfdGhpcy5vbmVycm9yKGUpO1xuXHRcdFx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy5yZWFkQXNBcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdEZpbGVBUEkucmVhZEFzQmluYXJ5U3RyaW5nKGZpbGUsIGxpc3RlbmVyKTtcblx0XHR9XG5cdFx0dGhpcy5yZWFkQXNCaW5hcnlTdHJpbmcgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRGaWxlQVBJLnJlYWRBc0JpbmFyeVN0cmluZyhmaWxlLCBsaXN0ZW5lcik7XG5cdFx0fVxuXHRcdHRoaXMucmVhZEFzRGF0YVVSTCA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdEZpbGVBUEkucmVhZEFzRGF0YVVSTChmaWxlLCBsaXN0ZW5lcik7XG5cdFx0fVxuXHRcdHRoaXMucmVhZEFzVGV4dCA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdEZpbGVBUEkucmVhZEFzVGV4dChmaWxlLCBsaXN0ZW5lcik7XG5cdFx0fVxuXHR9XG59XG5cbn0pKCk7XG4iLCIvKiohXG4gKiBBbmd1bGFySlMgZmlsZSB1cGxvYWQvZHJvcCBkaXJlY3RpdmUgd2l0aCBodHRwIHBvc3QgYW5kIHByb2dyZXNzXG4gKiBAYXV0aG9yICBEYW5pYWwgIDxkYW5pYWwuZmFyaWRAZ21haWwuY29tPlxuICogQHZlcnNpb24gMS42LjEyXG4gKi9cbihmdW5jdGlvbigpIHtcblxudmFyIGFuZ3VsYXJGaWxlVXBsb2FkID0gYW5ndWxhci5tb2R1bGUoJ2FuZ3VsYXJGaWxlVXBsb2FkJywgW10pO1xuXG5hbmd1bGFyRmlsZVVwbG9hZC5zZXJ2aWNlKCckdXBsb2FkJywgWyckaHR0cCcsICckcScsICckdGltZW91dCcsIGZ1bmN0aW9uKCRodHRwLCAkcSwgJHRpbWVvdXQpIHtcblx0ZnVuY3Rpb24gc2VuZEh0dHAoY29uZmlnKSB7XG5cdFx0Y29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QgfHwgJ1BPU1QnO1xuXHRcdGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cdFx0Y29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgPSBjb25maWcudHJhbnNmb3JtUmVxdWVzdCB8fCBmdW5jdGlvbihkYXRhLCBoZWFkZXJzR2V0dGVyKSB7XG5cdFx0XHRpZiAod2luZG93LkFycmF5QnVmZmVyICYmIGRhdGEgaW5zdGFuY2VvZiB3aW5kb3cuQXJyYXlCdWZmZXIpIHtcblx0XHRcdFx0cmV0dXJuIGRhdGE7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gJGh0dHAuZGVmYXVsdHMudHJhbnNmb3JtUmVxdWVzdFswXShkYXRhLCBoZWFkZXJzR2V0dGVyKTtcblx0XHR9O1xuXHRcdHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cblx0XHRpZiAod2luZG93LlhNTEh0dHBSZXF1ZXN0Ll9faXNTaGltKSB7XG5cdFx0XHRjb25maWcuaGVhZGVyc1snX19zZXRYSFJfJ10gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKHhocikge1xuXHRcdFx0XHRcdGlmICgheGhyKSByZXR1cm47XG5cdFx0XHRcdFx0Y29uZmlnLl9fWEhSID0geGhyO1xuXHRcdFx0XHRcdGNvbmZpZy54aHJGbiAmJiBjb25maWcueGhyRm4oeGhyKTtcblx0XHRcdFx0XHR4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdFx0ZGVmZXJyZWQubm90aWZ5KGUpO1xuXHRcdFx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdFx0XHQvL2ZpeCBmb3IgZmlyZWZveCBub3QgZmlyaW5nIHVwbG9hZCBwcm9ncmVzcyBlbmQsIGFsc28gSUU4LTlcblx0XHRcdFx0XHR4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XHRpZiAoZS5sZW5ndGhDb21wdXRhYmxlKSB7XG5cdFx0XHRcdFx0XHRcdGRlZmVycmVkLm5vdGlmeShlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRcdH07XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdCRodHRwKGNvbmZpZykudGhlbihmdW5jdGlvbihyKXtkZWZlcnJlZC5yZXNvbHZlKHIpfSwgZnVuY3Rpb24oZSl7ZGVmZXJyZWQucmVqZWN0KGUpfSwgZnVuY3Rpb24obil7ZGVmZXJyZWQubm90aWZ5KG4pfSk7XG5cdFx0XG5cdFx0dmFyIHByb21pc2UgPSBkZWZlcnJlZC5wcm9taXNlO1xuXHRcdHByb21pc2Uuc3VjY2VzcyA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0XHRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0Zm4ocmVzcG9uc2UuZGF0YSwgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZS5oZWFkZXJzLCBjb25maWcpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXG5cdFx0cHJvbWlzZS5lcnJvciA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0XHRwcm9taXNlLnRoZW4obnVsbCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0Zm4ocmVzcG9uc2UuZGF0YSwgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZS5oZWFkZXJzLCBjb25maWcpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXG5cdFx0cHJvbWlzZS5wcm9ncmVzcyA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0XHRwcm9taXNlLnRoZW4obnVsbCwgbnVsbCwgZnVuY3Rpb24odXBkYXRlKSB7XG5cdFx0XHRcdGZuKHVwZGF0ZSk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cdFx0cHJvbWlzZS5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKGNvbmZpZy5fX1hIUikge1xuXHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRjb25maWcuX19YSFIuYWJvcnQoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXHRcdHByb21pc2UueGhyID0gZnVuY3Rpb24oZm4pIHtcblx0XHRcdGNvbmZpZy54aHJGbiA9IChmdW5jdGlvbihvcmlnWGhyRm4pIHtcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdG9yaWdYaHJGbiAmJiBvcmlnWGhyRm4uYXBwbHkocHJvbWlzZSwgYXJndW1lbnRzKTtcblx0XHRcdFx0XHRmbi5hcHBseShwcm9taXNlLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KShjb25maWcueGhyRm4pO1xuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblx0XHRcblx0XHRyZXR1cm4gcHJvbWlzZTtcblx0fVxuXG5cdHRoaXMudXBsb2FkID0gZnVuY3Rpb24oY29uZmlnKSB7XG5cdFx0Y29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblx0XHRjb25maWcuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB1bmRlZmluZWQ7XG5cdFx0Y29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgPSBjb25maWcudHJhbnNmb3JtUmVxdWVzdCB8fCAkaHR0cC5kZWZhdWx0cy50cmFuc2Zvcm1SZXF1ZXN0O1xuXHRcdHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdHZhciBvcmlnVHJhbnNmb3JtUmVxdWVzdCA9IGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0O1xuXHRcdHZhciBvcmlnRGF0YSA9IGNvbmZpZy5kYXRhO1xuXHRcdGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0ID0gZnVuY3Rpb24oZm9ybURhdGEsIGhlYWRlckdldHRlcikge1xuXHRcdFx0aWYgKG9yaWdEYXRhKSB7XG5cdFx0XHRcdGlmIChjb25maWcuZm9ybURhdGFBcHBlbmRlcikge1xuXHRcdFx0XHRcdGZvciAodmFyIGtleSBpbiBvcmlnRGF0YSkge1xuXHRcdFx0XHRcdFx0dmFyIHZhbCA9IG9yaWdEYXRhW2tleV07XG5cdFx0XHRcdFx0XHRjb25maWcuZm9ybURhdGFBcHBlbmRlcihmb3JtRGF0YSwga2V5LCB2YWwpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gb3JpZ0RhdGEpIHtcblx0XHRcdFx0XHRcdHZhciB2YWwgPSBvcmlnRGF0YVtrZXldO1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBvcmlnVHJhbnNmb3JtUmVxdWVzdCA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdHZhbCA9IG9yaWdUcmFuc2Zvcm1SZXF1ZXN0KHZhbCwgaGVhZGVyR2V0dGVyKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgb3JpZ1RyYW5zZm9ybVJlcXVlc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHR2YXIgdHJhbnNmb3JtRm4gPSBvcmlnVHJhbnNmb3JtUmVxdWVzdFtpXTtcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIHRyYW5zZm9ybUZuID09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhbCA9IHRyYW5zZm9ybUZuKHZhbCwgaGVhZGVyR2V0dGVyKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGZvcm1EYXRhLmFwcGVuZChrZXksIHZhbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjb25maWcuZmlsZSAhPSBudWxsKSB7XG5cdFx0XHRcdHZhciBmaWxlRm9ybU5hbWUgPSBjb25maWcuZmlsZUZvcm1EYXRhTmFtZSB8fCAnZmlsZSc7XG5cblx0XHRcdFx0aWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChjb25maWcuZmlsZSkgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcblx0XHRcdFx0XHR2YXIgaXNGaWxlRm9ybU5hbWVTdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZmlsZUZvcm1OYW1lKSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb25maWcuZmlsZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0Zm9ybURhdGEuYXBwZW5kKGlzRmlsZUZvcm1OYW1lU3RyaW5nID8gZmlsZUZvcm1OYW1lIDogZmlsZUZvcm1OYW1lW2ldLCBjb25maWcuZmlsZVtpXSwgXG5cdFx0XHRcdFx0XHRcdFx0KGNvbmZpZy5maWxlTmFtZSAmJiBjb25maWcuZmlsZU5hbWVbaV0pIHx8IGNvbmZpZy5maWxlW2ldLm5hbWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmb3JtRGF0YS5hcHBlbmQoZmlsZUZvcm1OYW1lLCBjb25maWcuZmlsZSwgY29uZmlnLmZpbGVOYW1lIHx8IGNvbmZpZy5maWxlLm5hbWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZm9ybURhdGE7XG5cdFx0fTtcblxuXHRcdGNvbmZpZy5kYXRhID0gZm9ybURhdGE7XG5cblx0XHRyZXR1cm4gc2VuZEh0dHAoY29uZmlnKTtcblx0fTtcblxuXHR0aGlzLmh0dHAgPSBmdW5jdGlvbihjb25maWcpIHtcblx0XHRyZXR1cm4gc2VuZEh0dHAoY29uZmlnKTtcblx0fVxufV0pO1xuXG5hbmd1bGFyRmlsZVVwbG9hZC5kaXJlY3RpdmUoJ25nRmlsZVNlbGVjdCcsIFsgJyRwYXJzZScsICckdGltZW91dCcsIGZ1bmN0aW9uKCRwYXJzZSwgJHRpbWVvdXQpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRyKSB7XG5cdFx0dmFyIGZuID0gJHBhcnNlKGF0dHJbJ25nRmlsZVNlbGVjdCddKTtcblx0XHRpZiAoZWxlbVswXS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICdpbnB1dCcgfHwgKGVsZW0uYXR0cigndHlwZScpICYmIGVsZW0uYXR0cigndHlwZScpLnRvTG93ZXJDYXNlKCkpICE9PSAnZmlsZScpIHtcblx0XHRcdHZhciBmaWxlRWxlbSA9IGFuZ3VsYXIuZWxlbWVudCgnPGlucHV0IHR5cGU9XCJmaWxlXCI+Jylcblx0XHRcdHZhciBhdHRycyA9IGVsZW1bMF0uYXR0cmlidXRlcztcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXR0cnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGF0dHJzW2ldLm5hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ3R5cGUnKSB7XG5cdFx0XHRcdFx0ZmlsZUVsZW0uYXR0cihhdHRyc1tpXS5uYW1lLCBhdHRyc1tpXS52YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChhdHRyW1wibXVsdGlwbGVcIl0pIGZpbGVFbGVtLmF0dHIoXCJtdWx0aXBsZVwiLCBcInRydWVcIik7XG5cdFx0XHRmaWxlRWxlbS5jc3MoXCJ3aWR0aFwiLCBcIjFweFwiKS5jc3MoXCJoZWlnaHRcIiwgXCIxcHhcIikuY3NzKFwib3BhY2l0eVwiLCAwKS5jc3MoXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCIpLmNzcygnZmlsdGVyJywgJ2FscGhhKG9wYWNpdHk9MCknKVxuXHRcdFx0XHRcdC5jc3MoXCJwYWRkaW5nXCIsIDApLmNzcyhcIm1hcmdpblwiLCAwKS5jc3MoXCJvdmVyZmxvd1wiLCBcImhpZGRlblwiKTtcblx0XHRcdGZpbGVFbGVtLmF0dHIoJ19fd3JhcHBlcl9mb3JfcGFyZW50XycsIHRydWUpO1xuXG4vL1x0XHRcdGZpbGVFbGVtLmNzcyhcInRvcFwiLCAwKS5jc3MoXCJib3R0b21cIiwgMCkuY3NzKFwibGVmdFwiLCAwKS5jc3MoXCJyaWdodFwiLCAwKS5jc3MoXCJ3aWR0aFwiLCBcIjEwMCVcIikuXG4vL1x0XHRcdFx0XHRjc3MoXCJvcGFjaXR5XCIsIDApLmNzcyhcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIikuY3NzKCdmaWx0ZXInLCAnYWxwaGEob3BhY2l0eT0wKScpLmNzcyhcInBhZGRpbmdcIiwgMCkuY3NzKFwibWFyZ2luXCIsIDApO1xuXHRcdFx0ZWxlbS5hcHBlbmQoZmlsZUVsZW0pO1xuXHRcdFx0ZWxlbVswXS5fX2ZpbGVfY2xpY2tfZm5fZGVsZWdhdGVfICA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRmaWxlRWxlbVswXS5jbGljaygpO1xuXHRcdFx0fTsgXG5cdFx0XHRlbGVtLmJpbmQoJ2NsaWNrJywgZWxlbVswXS5fX2ZpbGVfY2xpY2tfZm5fZGVsZWdhdGVfKTtcblx0XHRcdGVsZW0uY3NzKFwib3ZlcmZsb3dcIiwgXCJoaWRkZW5cIik7XG4vL1x0XHRcdGlmIChmaWxlRWxlbS5wYXJlbnQoKVswXSAhPSBlbGVtWzBdKSB7XG4vL1x0XHRcdFx0Ly9maXggIzI5OCBidXR0b24gZWxlbWVudFxuLy9cdFx0XHRcdGVsZW0ud3JhcCgnPHNwYW4+Jyk7XG4vL1x0XHRcdFx0ZWxlbS5jc3MoXCJ6LWluZGV4XCIsIFwiLTEwMDBcIilcbi8vXHRcdFx0XHRlbGVtLnBhcmVudCgpLmFwcGVuZChmaWxlRWxlbSk7XG4vL1x0XHRcdFx0ZWxlbSA9IGVsZW0ucGFyZW50KCk7XG4vL1x0XHRcdH1cbi8vXHRcdFx0aWYgKGVsZW0uY3NzKFwicG9zaXRpb25cIikgPT09ICcnIHx8IGVsZW0uY3NzKFwicG9zaXRpb25cIikgPT09ICdzdGF0aWMnKSB7XG4vL1x0XHRcdFx0ZWxlbS5jc3MoXCJwb3NpdGlvblwiLCBcInJlbGF0aXZlXCIpO1xuLy9cdFx0XHR9XG5cdFx0XHRlbGVtID0gZmlsZUVsZW07XG5cdFx0fVxuXHRcdGVsZW0uYmluZCgnY2hhbmdlJywgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgZmlsZXMgPSBbXSwgZmlsZUxpc3QsIGk7XG5cdFx0XHRmaWxlTGlzdCA9IGV2dC5fX2ZpbGVzXyB8fCBldnQudGFyZ2V0LmZpbGVzO1xuXHRcdFx0aWYgKGZpbGVMaXN0ICE9IG51bGwpIHtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGZpbGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0ZmlsZXMucHVzaChmaWxlTGlzdC5pdGVtKGkpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGZuKHNjb3BlLCB7XG5cdFx0XHRcdFx0JGZpbGVzIDogZmlsZXMsXG5cdFx0XHRcdFx0JGV2ZW50IDogZXZ0XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0Ly8gcmVtb3ZlZCB0aGlzIHNpbmNlIGl0IHdhcyBjb25mdXNpbmcgaWYgdGhlIHVzZXIgY2xpY2sgb24gYnJvd3NlIGFuZCB0aGVuIGNhbmNlbCAjMTgxXG4vL1x0XHRlbGVtLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbi8vXHRcdFx0dGhpcy52YWx1ZSA9IG51bGw7XG4vL1x0XHR9KTtcblxuXHRcdC8vIHJlbW92ZWQgYmVjYXVzZSBvZiAjMjUzIGJ1Z1xuXHRcdC8vIHRvdWNoIHNjcmVlbnNcbi8vXHRcdGlmICgoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB8fFxuLy9cdFx0XHRcdChuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgPiAwKSB8fCAobmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHMgPiAwKSkge1xuLy9cdFx0XHRlbGVtLmJpbmQoJ3RvdWNoZW5kJywgZnVuY3Rpb24oZSkge1xuLy9cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcbi8vXHRcdFx0XHRlLnRhcmdldC5jbGljaygpO1xuLy9cdFx0XHR9KTtcbi8vXHRcdH1cblx0fTtcbn0gXSk7XG5cbmFuZ3VsYXJGaWxlVXBsb2FkLmRpcmVjdGl2ZSgnbmdGaWxlRHJvcEF2YWlsYWJsZScsIFsgJyRwYXJzZScsICckdGltZW91dCcsIGZ1bmN0aW9uKCRwYXJzZSwgJHRpbWVvdXQpIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRyKSB7XG5cdFx0aWYgKCdkcmFnZ2FibGUnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSkge1xuXHRcdFx0dmFyIGZuID0gJHBhcnNlKGF0dHJbJ25nRmlsZURyb3BBdmFpbGFibGUnXSk7XG5cdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0Zm4oc2NvcGUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufSBdKTtcblxuYW5ndWxhckZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ0ZpbGVEcm9wJywgWyAnJHBhcnNlJywgJyR0aW1lb3V0JywgJyRsb2NhdGlvbicsIGZ1bmN0aW9uKCRwYXJzZSwgJHRpbWVvdXQsICRsb2NhdGlvbikge1xuXHRyZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHIpIHtcblx0XHRpZiAoJ2RyYWdnYWJsZScgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpKSB7XG5cdFx0XHR2YXIgbGVhdmVUaW1lb3V0ID0gbnVsbDtcblx0XHRcdGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0JHRpbWVvdXQuY2FuY2VsKGxlYXZlVGltZW91dCk7XG5cdFx0XHRcdGlmICghZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18pIHtcblx0XHRcdFx0XHRpZiAoYXR0clsnbmdGaWxlRHJhZ092ZXJDbGFzcyddICYmIGF0dHJbJ25nRmlsZURyYWdPdmVyQ2xhc3MnXS5zZWFyY2goL1xcKSAqJC8pID4gLTEpIHtcblx0XHRcdFx0XHRcdHZhciBkcmFnT3ZlckNsYXNzID0gJHBhcnNlKGF0dHJbJ25nRmlsZURyYWdPdmVyQ2xhc3MnXSkoc2NvcGUsIHtcblx0XHRcdFx0XHRcdFx0JGV2ZW50IDogZXZ0XG5cdFx0XHRcdFx0XHR9KTtcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyA9IGRyYWdPdmVyQ2xhc3M7IFxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyA9IGF0dHJbJ25nRmlsZURyYWdPdmVyQ2xhc3MnXSB8fCBcImRyYWdvdmVyXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsZW0uYWRkQ2xhc3MoZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18pO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0ZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdsZWF2ZVwiLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0bGVhdmVUaW1lb3V0ID0gJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZWxlbS5yZW1vdmVDbGFzcyhlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyk7XG5cdFx0XHRcdFx0ZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18gPSBudWxsO1xuXHRcdFx0XHR9LCBhdHRyWyduZ0ZpbGVEcmFnT3ZlckRlbGF5J10gfHwgMSk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHR2YXIgZm4gPSAkcGFyc2UoYXR0clsnbmdGaWxlRHJvcCddKTtcblx0XHRcdGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRlbGVtLnJlbW92ZUNsYXNzKGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfKTtcblx0XHRcdFx0ZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18gPSBudWxsO1xuXHRcdFx0XHRleHRyYWN0RmlsZXMoZXZ0LCBmdW5jdGlvbihmaWxlcykge1xuXHRcdFx0XHRcdGZuKHNjb3BlLCB7XG5cdFx0XHRcdFx0XHQkZmlsZXMgOiBmaWxlcyxcblx0XHRcdFx0XHRcdCRldmVudCA6IGV2dFxuXHRcdFx0XHRcdH0pO1x0XHRcdFx0XHRcblx0XHRcdFx0fSk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdGZ1bmN0aW9uIGlzQVNDSUkoc3RyKSB7XG5cdFx0XHRcdHJldHVybiAvXltcXDAwMC1cXDE3N10qJC8udGVzdChzdHIpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBleHRyYWN0RmlsZXMoZXZ0LCBjYWxsYmFjaykge1xuXHRcdFx0XHR2YXIgZmlsZXMgPSBbXSwgaXRlbXMgPSBldnQuZGF0YVRyYW5zZmVyLml0ZW1zO1xuXHRcdFx0XHRpZiAoaXRlbXMgJiYgaXRlbXMubGVuZ3RoID4gMCAmJiBpdGVtc1swXS53ZWJraXRHZXRBc0VudHJ5ICYmICRsb2NhdGlvbi5wcm90b2NvbCgpICE9ICdmaWxlJyAmJiBcblx0XHRcdFx0XHRcdGl0ZW1zWzBdLndlYmtpdEdldEFzRW50cnkoKS5pc0RpcmVjdG9yeSkge1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdHZhciBlbnRyeSA9IGl0ZW1zW2ldLndlYmtpdEdldEFzRW50cnkoKTtcblx0XHRcdFx0XHRcdGlmIChlbnRyeSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdC8vZml4IGZvciBjaHJvbWUgYnVnIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0xNDk3MzVcblx0XHRcdFx0XHRcdFx0aWYgKGlzQVNDSUkoZW50cnkubmFtZSkpIHtcblx0XHRcdFx0XHRcdFx0XHR0cmF2ZXJzZUZpbGVUcmVlKGZpbGVzLCBlbnRyeSk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoIWl0ZW1zW2ldLndlYmtpdEdldEFzRW50cnkoKS5pc0RpcmVjdG9yeSkge1xuXHRcdFx0XHRcdFx0XHRcdGZpbGVzLnB1c2goaXRlbXNbaV0uZ2V0QXNGaWxlKCkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhciBmaWxlTGlzdCA9IGV2dC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdFx0XHRcdFx0aWYgKGZpbGVMaXN0ICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZUxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0ZmlsZXMucHVzaChmaWxlTGlzdC5pdGVtKGkpKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0KGZ1bmN0aW9uIHdhaXRGb3JQcm9jZXNzKGRlbGF5KSB7XG5cdFx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZiAoIXByb2Nlc3NpbmcpIHtcblx0XHRcdFx0XHRcdFx0Y2FsbGJhY2soZmlsZXMpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0d2FpdEZvclByb2Nlc3MoMTApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sIGRlbGF5IHx8IDApXG5cdFx0XHRcdH0pKCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHZhciBwcm9jZXNzaW5nID0gMDtcblx0XHRcdGZ1bmN0aW9uIHRyYXZlcnNlRmlsZVRyZWUoZmlsZXMsIGVudHJ5LCBwYXRoKSB7XG5cdFx0XHRcdGlmIChlbnRyeSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0aWYgKGVudHJ5LmlzRGlyZWN0b3J5KSB7XG5cdFx0XHRcdFx0XHR2YXIgZGlyUmVhZGVyID0gZW50cnkuY3JlYXRlUmVhZGVyKCk7XG5cdFx0XHRcdFx0XHRwcm9jZXNzaW5nKys7XG5cdFx0XHRcdFx0XHRkaXJSZWFkZXIucmVhZEVudHJpZXMoZnVuY3Rpb24oZW50cmllcykge1xuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHR0cmF2ZXJzZUZpbGVUcmVlKGZpbGVzLCBlbnRyaWVzW2ldLCAocGF0aCA/IHBhdGggOiBcIlwiKSArIGVudHJ5Lm5hbWUgKyBcIi9cIik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cHJvY2Vzc2luZy0tO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHByb2Nlc3NpbmcrKztcblx0XHRcdFx0XHRcdGVudHJ5LmZpbGUoZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0XHRcdFx0XHRwcm9jZXNzaW5nLS07XG5cdFx0XHRcdFx0XHRcdGZpbGUuX3JlbGF0aXZlUGF0aCA9IChwYXRoID8gcGF0aCA6IFwiXCIpICsgZmlsZS5uYW1lO1xuXHRcdFx0XHRcdFx0XHRmaWxlcy5wdXNoKGZpbGUpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufSBdKTtcblxufSkoKTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cblxuLyoqXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxuICovXG5cbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcbiAgICAuY29udHJvbGxlcignQ29tcG9uZW50RGV0YWlsc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBjb21wb25lbnRTZXJ2aWNlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGNvbnRleHQgPSB7fSxcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fSxcbiAgICAgICAgICAgIGNvbm5lY3RvcnMgPSB7fSxcbiAgICAgICAgICAgIHBvcnRzID0ge307XG5cbiAgICAgICAgY29uc29sZS5sb2coJ0NvbXBvbmVudERldGFpbHNDb250cm9sbGVyJyk7XG4gICAgICAgICRzY29wZS5pbml0ID0gZnVuY3Rpb24gKGNvbm5lY3Rpb25JZCkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdDb21wb25lbnREZXRhaWxzXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEZXN0cm95aW5nIDonLCBjb250ZXh0LnJlZ2lvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IGNvbm5lY3RvcnMsXG4gICAgICAgICAgICAgICAgcG9ydHM6IHBvcnRzXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveSkge1xuICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzID0ge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdG9yczoge30sXG4gICAgICAgICAgICAgICAgICAgIHBvcnRzOiB7fVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKGRlc3Ryb3kpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiBub3RpZnkgdXNlclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnQ29tcG9uZW50RGV0YWlsc0NvbnRyb2xsZXIgLSBpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaEludGVyZmFjZXMoY29udGV4dCwgJHNjb3BlLmNvbXBvbmVudElkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHdhdGNoSW50ZXJmYWNlcyBrZWVwcyB0aGUgZGF0YSB1cC10by1kYXRlIHRoZXJlIHNob3VsZG4ndCBiZSBhIG5lZWQgdG8gZG8gYW55XG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZXMgaGVyZS4uXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaEludGVyZmFjZXMnLCB1cGRhdGVPYmplY3QpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjb21wb25lbnRJbnRlcmZhY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wcm9wZXJ0aWVzID0gY29tcG9uZW50SW50ZXJmYWNlcy5wcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMuY29ubmVjdG9ycyA9IGNvbXBvbmVudEludGVyZmFjZXMuY29ubmVjdG9ycztcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLnBvcnRzID0gY29tcG9uZW50SW50ZXJmYWNlcy5wb3J0cztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9KVxuICAgIC5kaXJlY3RpdmUoJ2NvbXBvbmVudERldGFpbHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudElkOiAnPWNvbXBvbmVudElkJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcXVpcmU6ICdeY29tcG9uZW50TGlzdCcsXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIsIGNvbXBvbmV0TGlzdENvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdGlvbklkID0gY29tcG9uZXRMaXN0Q29udHJvbGxlci5nZXRDb25uZWN0aW9uSWQoKTtcbiAgICAgICAgICAgICAgICBzY29wZS5pbml0KGNvbm5lY3Rpb25JZCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0ludGVyZmFjZURldGFpbHMuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ29tcG9uZW50RGV0YWlsc0NvbnRyb2xsZXInXG4gICAgICAgIH07XG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cblxuLyoqXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxuICovXG5cbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcbiAgICAuY29udHJvbGxlcignQ29tcG9uZW50TGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkd2luZG93LCAkbW9kYWwsIGdyb3dsLCBjb21wb25lbnRTZXJ2aWNlLCBmaWxlU2VydmljZSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGl0ZW1zID0gW10sICAgICAgICAgICAgIC8vIEl0ZW1zIHRoYXQgYXJlIHBhc3NlZCB0byB0aGUgaXRlbS1saXN0IHVpLWNvbXBvbmVudC5cbiAgICAgICAgICAgIGNvbXBvbmVudEl0ZW1zID0ge30sICAgIC8vIFNhbWUgaXRlbXMgYXJlIHN0b3JlZCBpbiBhIGRpY3Rpb25hcnkuXG4gICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSxcbiAgICAgICAgICAgIGFkZERvbWFpbldhdGNoZXIsXG4gICAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgICBjb250ZXh0O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdDb21wb25lbnRMaXN0Q29udHJvbGxlcicsICRzY29wZS5hdm1JZHMpO1xuICAgICAgICB0aGlzLmdldENvbm5lY3Rpb25JZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUuY29ubmVjdGlvbklkO1xuICAgICAgICB9O1xuICAgICAgICAvLyBDaGVjayBmb3IgdmFsaWQgY29ubmVjdGlvbklkIGFuZCByZWdpc3RlciBjbGVhbi11cCBvbiBkZXN0cm95IGV2ZW50LlxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnQ29tcG9uZW50TGlzdENvbnRyb2xsZXJfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb25maWd1cmF0aW9uIGZvciB0aGUgaXRlbSBsaXN0IHVpIGNvbXBvbmVudC5cbiAgICAgICAgY29uZmlnID0ge1xuXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcbiAgICAgICAgICAgIGRldGFpbHNDb2xsYXBzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dEZXRhaWxzTGFiZWw6ICdTaG93IGRldGFpbHMnLFxuICAgICAgICAgICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXG5cbiAgICAgICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzXG5cbiAgICAgICAgICAgIGl0ZW1Tb3J0OiBmdW5jdGlvbiAoalFFdmVudCwgdWkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU29ydCBoYXBwZW5lZCcsIGpRRXZlbnQsIHVpKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCdzZWxlY3RlZEluc3RhbmNlcycsIHtuYW1lOiBpdGVtLnRpdGxlLCBpZHM6IGl0ZW0uZGF0YS5pbnN0YW5jZUlkc30pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD1BRE1FZGl0b3ImYWN0aXZlT2JqZWN0PScgKyBpdGVtLmlkLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdlZGl0Q29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtkZXNjcmlwdGlvbjogaXRlbS5kZXNjcmlwdGlvbiwgaWQ6IGl0ZW0uaWR9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdENvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiOiBjb250ZXh0LmRiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hDb21wb25lbnRzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvQ29tcG9uZW50RWRpdC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbXBvbmVudEVkaXRDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9zaXplOiBzaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7IGRhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoZWRpdGVkRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhdHRycyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lORk8nOiBlZGl0ZWREYXRhLmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLnNldENvbXBvbmVudEF0dHJpYnV0ZXMoZWRpdENvbnRleHQsIGRhdGEuaWQsIGF0dHJzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXR0cmlidXRlIHVwZGF0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc0FjbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhwb3J0IEFDTScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7cmVzb3VyY2U6IGl0ZW0uZGF0YS5yZXNvdXJjZSwgbmFtZTogaXRlbS50aXRsZX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoYXNoID0gZGF0YS5yZXNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBmaWxlU2VydmljZS5nZXREb3dubG9hZFVybChoYXNoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCdBQ00gZmlsZSBmb3IgPGEgaHJlZj1cIicgKyB1cmwgKyAnXCI+JyArIGRhdGEubmFtZSArICc8L2E+IGV4cG9ydGVkLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKGRhdGEubmFtZSArICcgZG9lcyBub3QgaGF2ZSBhIHJlc291cmNlLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkLCBuYW1lOiBpdGVtLnRpdGxlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1NpbXBsZU1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTaW1wbGVNb2RhbENvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZSBDb21wb25lbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHM6ICdUaGlzIHdpbGwgZGVsZXRlICcgKyBkYXRhLm5hbWUgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIGZyb20gdGhlIHdvcmtzcGFjZS4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2UuZGVsZXRlQ29tcG9uZW50KGNvbnRleHQsIGRhdGEuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGRldGFpbHNSZW5kZXJlcjogZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBpdGVtLmRldGFpbHMgPSAnTXkgZGV0YWlscyBhcmUgaGVyZSBub3chJztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGZpbHRlcjoge1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVHJhbnNmb3JtIHRoZSByYXcgc2VydmljZSBub2RlIGRhdGEgdG8gaXRlbXMgZm9yIHRoZSBsaXN0LlxuICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgbGlzdEl0ZW07XG5cbiAgICAgICAgICAgIGlmIChjb21wb25lbnRJdGVtcy5oYXNPd25Qcm9wZXJ0eShkYXRhLmlkKSkge1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtID0gY29tcG9uZW50SXRlbXNbZGF0YS5pZF07XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0udGl0bGUgPSBkYXRhLm5hbWU7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGVzY3JpcHRpb24gPSBkYXRhLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRhdGEucmVzb3VyY2UgPSBkYXRhLnJlc291cmNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuaWQsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICRzY29wZS5hdm1JZHMgPyAnSGlnaGxpZ2h0IGluc3RhbmNlcycgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVcGRhdGVkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiAnTi9BJywgICAvLyBUT0RPOiBnZXQgdGhpcyBpbiB0aGUgZnV0dXJlLlxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogJ04vQScgICAgLy8gVE9ETzogZ2V0IHRoaXMgaW4gdGhlIGZ1dHVyZS5cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHM6IFsgXSxcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogJ0NvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzVGVtcGxhdGVVcmw6ICdjb21wb25lbnREZXRhaWxzLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7IHJlc291cmNlOiBkYXRhLnJlc291cmNlIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuYXZtSWRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRhdGEuaW5zdGFuY2VJZHMgPSAkc2NvcGUuYXZtSWRzW2RhdGEuYXZtSWRdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGxpc3QtaXRlbSB0byB0aGUgaXRlbXMgbGlzdCBhbmQgdGhlIGRpY3Rpb25hcnkuXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChsaXN0SXRlbSk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50SXRlbXNbbGlzdEl0ZW0uaWRdID0gbGlzdEl0ZW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgYWRkRG9tYWluV2F0Y2hlciA9IGZ1bmN0aW9uIChjb21wb25lbnRJZCkge1xuICAgICAgICAgICAgdmFyIGRvbWFpbk1vZGVsc1RvU3RhdCA9IGZ1bmN0aW9uIChkb21haW5Nb2RlbHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdHMgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxNYXAgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBDQUQ6IHsgdmFsdWU6IDAsIHRvb2xUaXA6ICdDQUQnLCBpY29uQ2xhc3M6ICdmYSBmYS1jb2RlcGVuJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgQ3liZXI6IHsgdmFsdWU6IDAsIHRvb2xUaXA6ICdDeWJlcicsIGljb25DbGFzczogJ2ZhIGZhLWxhcHRvcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hbnVmYWN0dXJpbmc6IHsgdmFsdWU6IDAsIHRvb2xUaXA6ICdNYW51ZmFjdHVyaW5nJywgaWNvbkNsYXNzOiAnZmEgZmEtd3JlbmNoJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgTW9kZWxpY2E6IHsgdmFsdWU6IDAsIHRvb2xUaXA6ICdNb2RlbGljYScsIGljb25DbGFzczogJ2ZhIGZhLWdlYXJzJyB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGtleTtcbiAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBkb21haW5Nb2RlbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbWFpbk1vZGVscy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWxNYXBbZG9tYWluTW9kZWxzW2tleV0udHlwZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbE1hcFtkb21haW5Nb2RlbHNba2V5XS50eXBlXS52YWx1ZSArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmV4cGVjdGVkIGRvbWFpbi1tb2RlbCB0eXBlJywgZG9tYWluTW9kZWxzW2tleV0udHlwZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gbGFiZWxNYXApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhYmVsTWFwLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbE1hcFtrZXldLnZhbHVlID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRzLnB1c2gobGFiZWxNYXBba2V5XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRzO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERvbWFpbnMoY29udGV4dCwgY29tcG9uZW50SWQsIGZ1bmN0aW9uICh1cGRhdGVEYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxpc3RJdGVtID0gY29tcG9uZW50SXRlbXNbY29tcG9uZW50SWRdO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEb21haW5Nb2RlbHMgdXBkYXRlZCwgZXZlbnQgdHlwZTonLCB1cGRhdGVEYXRhLnR5cGUpO1xuICAgICAgICAgICAgICAgIGlmIChsaXN0SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0cyA9IGRvbWFpbk1vZGVsc1RvU3RhdCh1cGRhdGVEYXRhLmRvbWFpbk1vZGVscyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdEb21haW5Nb2RlbCBkYXRhIGRpZCBub3QgaGF2ZSBtYXRjaGluZyBjb21wb25lbnREYXRhJywgY29tcG9uZW50SWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpc3RJdGVtID0gY29tcG9uZW50SXRlbXNbY29tcG9uZW50SWRdO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGlzdEl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzID0gZG9tYWluTW9kZWxzVG9TdGF0KGRhdGEuZG9tYWluTW9kZWxzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRG9tYWluTW9kZWwgZGF0YSBkaWQgbm90IGhhdmUgbWF0Y2hpbmcgY29tcG9uZW50RGF0YScsIGNvbXBvbmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbXBvbmVudFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIGl0ZW1zID0gW107XG4gICAgICAgICAgICAkc2NvcGUubGlzdERhdGEuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgICAgIGNvbXBvbmVudEl0ZW1zID0ge307XG5cbiAgICAgICAgICAgIGlmIChkZXN0cm95ZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGRpc3BsYXkgdGhpcyB0byB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ2luaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XG5cbiAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnRzKGNvbnRleHQsICRzY29wZS53b3Jrc3BhY2VJZCwgJHNjb3BlLmF2bUlkcywgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleDtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUud2Fybih1cGRhdGVPYmplY3QpO1xuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgYWRkRG9tYWluV2F0Y2hlcih1cGRhdGVPYmplY3QuaWQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8kc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudEl0ZW1zLmhhc093blByb3BlcnR5KHVwZGF0ZU9iamVjdC5pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaXRlbXMubWFwKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5pbmRleE9mKHVwZGF0ZU9iamVjdC5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hDb21wb25lbnREb21haW5zXycgKyB1cGRhdGVPYmplY3QuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNvbXBvbmVudEl0ZW1zW3VwZGF0ZU9iamVjdC5pZF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8kc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50SWQ7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29tcG9uZW50SWQgaW4gZGF0YS5jb21wb25lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb21wb25lbnRzLmhhc093blByb3BlcnR5KGNvbXBvbmVudElkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKGRhdGEuY29tcG9uZW50c1tjb21wb25lbnRJZF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZERvbWFpbldhdGNoZXIoY29tcG9uZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pXG4gICAgLmNvbnRyb2xsZXIoJ0NvbXBvbmVudEVkaXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIGRhdGEpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9rID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoJHNjb3BlLmRhdGEpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcbiAgICAgICAgfTtcbiAgICB9KVxuICAgIC5kaXJlY3RpdmUoJ2NvbXBvbmVudExpc3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUlkOiAnPXdvcmtzcGFjZUlkJyxcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJyxcbiAgICAgICAgICAgICAgICBhdm1JZHM6ICc9YXZtSWRzJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Db21wb25lbnRMaXN0Lmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbXBvbmVudExpc3RDb250cm9sbGVyJ1xuICAgICAgICB9O1xuICAgIH0pO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cblxuLyoqXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxuICovXG5cbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcbiAgICAuY29udHJvbGxlcignQ29uZmlndXJhdGlvblNldFNlbGVjdG9yQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIGdyb3dsLCBkZXNpZ25TZXJ2aWNlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGNvbnRleHQsXG4gICAgICAgICAgICBzcGF3bmVkQ29uZmlndXJhdGlvblJlZ2lvbnMgPSBbXTtcbiAgICAgICAgJHNjb3BlLmRhdGFNb2RlbCA9IHtcbiAgICAgICAgICAgIGRhdGFBdmFsaWFibGU6IGZhbHNlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvblNldHM6IHt9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xuICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0NvbmZpZ3VyYXRpb25TZXRTZWxlY3RvckNvbnRyb2xsZXJfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCckZGVzdHJveWVkICcgKyBjb250ZXh0LnJlZ2lvbklkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgICAgIH1cblxuICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVsLmRhdGFBdmFsaWFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWwuY29uZmlndXJhdGlvblNldHMgPSB7fTtcblxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignZGVzdHJveSBldmVudCByYWlzZWQnKTtcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaENvbmZpZ3VyYXRpb25TZXRzKGNvbnRleHQsICRzY29wZS5kZXNpZ25JZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWwuZGF0YUF2YWxpYWJsZSA9IE9iamVjdC5rZXlzKHVwZGF0ZU9iamVjdC5kYXRhLmNvbmZpZ3VyYXRpb25TZXRzKS5sZW5ndGggPiAwO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVsLmNvbmZpZ3VyYXRpb25TZXRzID0gZGF0YS5jb25maWd1cmF0aW9uU2V0cztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbC5kYXRhQXZhbGlhYmxlID0gT2JqZWN0LmtleXMoZGF0YS5jb25maWd1cmF0aW9uU2V0cykubGVuZ3RoID4gMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLmxvYWRDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uIChzZXRJZCwgc2V0TmFtZSkge1xuICAgICAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBzcGF3bmVkQ29uZmlndXJhdGlvblJlZ2lvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgc3Bhd25lZENvbmZpZ3VyYXRpb25SZWdpb25zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNwYXduZWRDb25maWd1cmF0aW9uUmVnaW9ucyA9IFtdO1xuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaENvbmZpZ3VyYXRpb25zKGNvbnRleHQsIHNldElkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBzcGF3bmVkQ29uZmlndXJhdGlvblJlZ2lvbnMucHVzaChkYXRhLnJlZ2lvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gZGF0YS5jb25maWd1cmF0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuY29uZmlndXJhdGlvbnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9IGRhdGEuY29uZmlndXJhdGlvbnNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjb25maWcuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb25maWcubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlQXNzaWdubWVudHM6IEpTT04ucGFyc2UoY29uZmlnLmFsdGVybmF0aXZlQXNzaWdubWVudHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdDb25maWd1cmF0aW9uICcgKyBjb25maWcubmFtZSArICcgaGFkIGludmFsaWQgYXR0cmlidXRlLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgcGFyc2UnLCBjb25maWcuYWx0ZXJuYXRpdmVBc3NpZ25tZW50cywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGVtaXQoJ2NvbmZpZ3VyYXRpb25zTG9hZGVkJywge2NvbmZpZ3VyYXRpb25zOiBjb25maWd1cmF0aW9ucywgc2V0TmFtZTogc2V0TmFtZX0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH0pXG4gICAgLmRpcmVjdGl2ZSgnY29uZmlndXJhdGlvblNldFNlbGVjdG9yJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBkZXNpZ25JZDogJz1kZXNpZ25JZCcsXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvQ29uZmlndXJhdGlvblNldFNlbGVjdG9yLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbmZpZ3VyYXRpb25TZXRTZWxlY3RvckNvbnRyb2xsZXInXG4gICAgICAgIH07XG4gICAgfSk7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xuXG4vKipcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxuICAgIC5jb250cm9sbGVyKCdDb25maWd1cmF0aW9uVGFibGVDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgZ3Jvd2wpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICAkc2NvcGUuZGF0YU1vZGVsID0ge1xuICAgICAgICAgICAgY2hhbmdlSW5mbzogW10sXG4gICAgICAgICAgICBzZWxlY3RlZDogW10sXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uczogJHNjb3BlLmNvbmZpZ3VyYXRpb25zLFxuICAgICAgICAgICAgc2V0TmFtZTogJHNjb3BlLnNldE5hbWVcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUudGFibGVDb2x1bW5EZWZpbml0aW9uID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbHVtbkhlYWRlckRpc3BsYXlOYW1lOiAnTmFtZScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0YWJsZUNlbGwuaHRtbCcsXG4gICAgICAgICAgICAgICAgc29ydEtleTogJ25hbWUnXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG5cbiAgICAgICAgJHNjb3BlLiRvbignZXhwb3NlU2VsZWN0aW9uJywgZnVuY3Rpb24gKGV2ZW50LCB0eXBlKSB7XG4gICAgICAgICAgICAkc2NvcGUuJGVtaXQoJ3NlbGVjdGlvbkV4cG9zZWQnLCAkc2NvcGUuZGF0YU1vZGVsLnNlbGVjdGVkLCB0eXBlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLmNmZ0NsaWNrZWQgPSBmdW5jdGlvbiAoY2ZnKSB7XG4gICAgICAgICAgICAkc2NvcGUuJGVtaXQoJ2NvbmZpZ3VyYXRpb25DbGlja2VkJywgY2ZnKTtcbiAgICAgICAgfTtcbiAgICB9KVxuICAgIC5kaXJlY3RpdmUoJ2NvbmZpZ3VyYXRpb25UYWJsZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6ICc9Y29uZmlndXJhdGlvbnMnLFxuICAgICAgICAgICAgICAgIHNldE5hbWU6ICc9c2V0TmFtZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvQ29uZmlndXJhdGlvblRhYmxlLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbmZpZ3VyYXRpb25UYWJsZUNvbnRyb2xsZXInXG4gICAgICAgIH07XG4gICAgfSk7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXG5cbi8qKlxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqL1xuXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnbkRldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgZGVzaWduU2VydmljZSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBjb250ZXh0ID0ge30sXG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0ge30sXG4gICAgICAgICAgICBjb25uZWN0b3JzID0ge30sXG4gICAgICAgICAgICBwb3J0cyA9IHt9O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdEZXNpZ25EZXRhaWxzQ29udHJvbGxlcicpO1xuICAgICAgICAkc2NvcGUuaW5pdCA9IGZ1bmN0aW9uIChjb25uZWN0aW9uSWQpIHtcbiAgICAgICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnRGVzaWduRGV0YWlsc18nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRGVzdHJveWluZyA6JywgY29udGV4dC5yZWdpb25JZCk7XG4gICAgICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogcHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiBjb25uZWN0b3JzLFxuICAgICAgICAgICAgICAgIHBvcnRzOiBwb3J0c1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZGVzaWduU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3kpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge30sXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IHt9LFxuICAgICAgICAgICAgICAgICAgICBwb3J0czoge31cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmIChkZXN0cm95KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vVE9ETzogbm90aWZ5IHVzZXJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ0Rlc2lnbkRldGFpbHNDb250cm9sbGVyIC0gaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcblxuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKGNvbnRleHQsICRzY29wZS5kZXNpZ25JZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSB3YXRjaEludGVyZmFjZXMga2VlcHMgdGhlIGRhdGEgdXAtdG8tZGF0ZSB0aGVyZSBzaG91bGRuJ3QgYmUgYSBuZWVkIHRvIGRvIGFueVxuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGVzIGhlcmUuLlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hJbnRlcmZhY2VzJywgdXBkYXRlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGVzaWduSW50ZXJmYWNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMucHJvcGVydGllcyA9IGRlc2lnbkludGVyZmFjZXMucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLmNvbm5lY3RvcnMgPSBkZXNpZ25JbnRlcmZhY2VzLmNvbm5lY3RvcnM7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wb3J0cyA9IGRlc2lnbkludGVyZmFjZXMucG9ydHM7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfSlcbiAgICAuZGlyZWN0aXZlKCdkZXNpZ25EZXRhaWxzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBkZXNpZ25JZDogJz1kZXNpZ25JZCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXF1aXJlOiAnXmRlc2lnbkxpc3QnLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyLCBkZXNpZ25MaXN0Q29udHJvbGxlcikge1xuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0aW9uSWQgPSBkZXNpZ25MaXN0Q29udHJvbGxlci5nZXRDb25uZWN0aW9uSWQoKTtcbiAgICAgICAgICAgICAgICBzY29wZS5pbml0KGNvbm5lY3Rpb25JZCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0ludGVyZmFjZURldGFpbHMuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRGVzaWduRGV0YWlsc0NvbnRyb2xsZXInXG4gICAgICAgIH07XG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cblxuLyoqXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxuICovXG5cbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcbiAgICAuY29udHJvbGxlcignRGVzaWduTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkd2luZG93LCAkbG9jYXRpb24sICRtb2RhbCwgZGVzaWduU2VydmljZSwgZ3Jvd2wpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBpdGVtcyA9IFtdLCAgICAgICAgICAgICAvLyBJdGVtcyB0aGF0IGFyZSBwYXNzZWQgdG8gdGhlIGl0ZW0tbGlzdCB1aS1jb21wb25lbnQuXG4gICAgICAgICAgICBkZXNpZ25JdGVtcyA9IHt9LCAgICAgICAvLyBTYW1lIGl0ZW1zIGFyZSBzdG9yZWQgaW4gYSBkaWN0aW9uYXJ5LlxuICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0sXG4gICAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgICBhZGRDb25maWd1cmF0aW9uV2F0Y2hlcixcbiAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICBpdGVtQ2xpY2tGbixcbiAgICAgICAgICAgIGl0ZW1DbGlja1RpcDtcblxuICAgICAgICBjb25zb2xlLmxvZygnRGVzaWduTGlzdENvbnRyb2xsZXInKTtcbiAgICAgICAgdGhpcy5nZXRDb25uZWN0aW9uSWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLmNvbm5lY3Rpb25JZDtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbm5lY3Rpb25JZCBhbmQgcmVnaXN0ZXIgY2xlYW4tdXAgb24gZGVzdHJveSBldmVudC5cbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xuICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0Rlc2lnbkxpc3RDb250cm9sbGVyXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyBDb25maWd1cmF0aW9uIGZvciB0aGUgaXRlbSBsaXN0IHVpIGNvbXBvbmVudC5cbiAgICAgICAgY29uZmlnID0ge1xuXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcbiAgICAgICAgICAgIGRldGFpbHNDb2xsYXBzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dEZXRhaWxzTGFiZWw6ICdTaG93IGRldGFpbHMnLFxuICAgICAgICAgICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXG5cbiAgICAgICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzXG5cbiAgICAgICAgICAgIGl0ZW1Tb3J0OiBmdW5jdGlvbiAoalFFdmVudCwgdWkpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaXRlbUNsaWNrOiBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3VXJsID0gJy9kZXNpZ25TcGFjZS8nICsgJHNjb3BlLndvcmtzcGFjZUlkLnJlcGxhY2UoL1xcLy9nLCAnLScpICsgJy8nICsgaXRlbS5pZC5yZXBsYWNlKC9cXC8vZywgJy0nKTtcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aChuZXdVcmwpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD1BRE1FZGl0b3ImYWN0aXZlT2JqZWN0PScgKyBpdGVtLmlkLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdlZGl0RGVzaWduJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFZGl0IEF0dHJpYnV0ZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogaXRlbS5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGI6IGNvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoRGVzaWducydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBkZXNpZ25TZXJ2aWNlLmVkaXREZXNpZ25GblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ3NldEFzVG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1NldCBhcyBUTFNVVCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiAhJHNjb3BlLnVzZWRCeVRlc3RCZW5jaCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtYXJyb3ctY2lyY2xlLXJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge2lkOiBpdGVtLmlkLCBuYW1lOiBpdGVtLnRpdGxlfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZFRsc3V0ID0gZGVzaWduSXRlbXNbJHNjb3BlLnN0YXRlLnRsc3V0SWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLnRsc3V0SWQgPSBkYXRhLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdFNldCcsIGl0ZW0sIG9sZFRsc3V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2V4cG9ydEFzQWRtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeHBvcnQgQURNJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXNoYXJlLWFsdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBkZXNpZ25TZXJ2aWNlLmV4cG9ydEFzQWRtRm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2RlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBkZXNpZ25TZXJ2aWNlLmRlbGV0ZUZuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGRldGFpbHNSZW5kZXJlcjogZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBpdGVtLmRldGFpbHMgPSAnTXkgZGV0YWlscyBhcmUgaGVyZSBub3chJztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGZpbHRlcjoge1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnN0YXRlID0ge1xuICAgICAgICAgICAgdGxzdXRJZDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS4kb24oJ3RvcExldmVsU3lzdGVtVW5kZXJUZXN0Q2hhbmdlZCcsIGZ1bmN0aW9uIChldmVudCwgaWQpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuc3RhdGUudGxzdXRJZCAmJiBkZXNpZ25JdGVtcy5oYXNPd25Qcm9wZXJ0eSgkc2NvcGUuc3RhdGUudGxzdXRJZCkpIHtcbiAgICAgICAgICAgICAgICBkZXNpZ25JdGVtc1skc2NvcGUuc3RhdGUudGxzdXRJZF0uY3NzQ2xhc3MgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS50bHN1dElkID0gaWQ7XG4gICAgICAgICAgICBpZiAoZGVzaWduSXRlbXMuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgICAgICAgICAgICAgZGVzaWduSXRlbXNbaWRdLmNzc0NsYXNzID0gJ3RvcC1sZXZlbC1zeXN0ZW0tdW5kZXItdGVzdCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRyYW5zZm9ybSB0aGUgcmF3IHNlcnZpY2Ugbm9kZSBkYXRhIHRvIGl0ZW1zIGZvciB0aGUgbGlzdC5cbiAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0gPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIGxpc3RJdGVtO1xuXG4gICAgICAgICAgICBpZiAoZGVzaWduSXRlbXMuaGFzT3duUHJvcGVydHkoZGF0YS5pZCkpIHtcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IGRlc2lnbkl0ZW1zW2RhdGEuaWRdO1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnRpdGxlID0gZGF0YS5uYW1lO1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnT3BlbiBEZXNpZ24gU3BhY2UgVmlldycsXG4gICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAkc2NvcGUuc3RhdGUudGxzdXRJZCA9PT0gZGF0YS5pZCA/ICd0b3AtbGV2ZWwtc3lzdGVtLXVuZGVyLXRlc3QnIDogJycsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTogJ04vQScsICAgLy8gVE9ETzogZ2V0IHRoaXMgaW4gdGhlIGZ1dHVyZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnICAgIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ0NvbmZpZ3VyYXRpb24gU2V0cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi10aC1sYXJnZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ0NvbmZpZ3VyYXRpb25zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXRoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnUmVzdWx0cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zdGF0cydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlscyAgICA6ICdDb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsc1RlbXBsYXRlVXJsOiAnZGVzaWduRGV0YWlscy5odG1sJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBsaXN0LWl0ZW0gdG8gdGhlIGl0ZW1zIGxpc3QgYW5kIHRoZSBkaWN0aW9uYXJ5LlxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2gobGlzdEl0ZW0pO1xuICAgICAgICAgICAgICAgIGRlc2lnbkl0ZW1zW2xpc3RJdGVtLmlkXSA9IGxpc3RJdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGFkZENvbmZpZ3VyYXRpb25XYXRjaGVyID0gZnVuY3Rpb24gKGRlc2lnbklkKSB7XG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoTmJyT2ZDb25maWd1cmF0aW9ucyhjb250ZXh0LCBkZXNpZ25JZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xuICAgICAgICAgICAgICAgIHZhciBsaXN0SXRlbSA9IGRlc2lnbkl0ZW1zW2Rlc2lnbklkXTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHNbMF0udmFsdWUgPSB1cGRhdGVPYmplY3QuZGF0YS5jb3VudGVycy5zZXRzO1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzWzFdLnZhbHVlID0gdXBkYXRlT2JqZWN0LmRhdGEuY291bnRlcnMuY29uZmlndXJhdGlvbnM7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHNbMl0udmFsdWUgPSB1cGRhdGVPYmplY3QuZGF0YS5jb3VudGVycy5yZXN1bHRzO1xuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBsaXN0SXRlbSA9IGRlc2lnbkl0ZW1zW2Rlc2lnbklkXTtcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0c1swXS52YWx1ZSA9IGRhdGEuY291bnRlcnMuc2V0cztcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0c1sxXS52YWx1ZSA9IGRhdGEuY291bnRlcnMuY29uZmlndXJhdGlvbnM7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHNbMl0udmFsdWUgPSBkYXRhLmNvdW50ZXJzLnJlc3VsdHM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xuICAgICAgICAgICAgJHNjb3BlLmxpc3REYXRhLml0ZW1zID0gaXRlbXM7XG4gICAgICAgICAgICBkZXNpZ25JdGVtcyA9IHt9O1xuXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xuXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWducyhjb250ZXh0LCAkc2NvcGUud29ya3NwYWNlSWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXg7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLndhcm4odXBkYXRlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGFkZENvbmZpZ3VyYXRpb25XYXRjaGVyKHVwZGF0ZU9iamVjdC5pZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXNpZ25JdGVtcy5oYXNPd25Qcm9wZXJ0eSh1cGRhdGVPYmplY3QuaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9IGl0ZW1zLm1hcChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkuaW5kZXhPZih1cGRhdGVPYmplY3QuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwUmVnaW9uKGNvbnRleHQsIGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTmJyT2ZDb25maWd1cmF0aW9uc18nICsgdXBkYXRlT2JqZWN0LmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkZXNpZ25JdGVtc1t1cGRhdGVPYmplY3QuaWRdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGVzaWduSWQ7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoZGVzaWduSWQgaW4gZGF0YS5kZXNpZ25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5kZXNpZ25zLmhhc093blByb3BlcnR5KGRlc2lnbklkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKGRhdGEuZGVzaWduc1tkZXNpZ25JZF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZENvbmZpZ3VyYXRpb25XYXRjaGVyKGRlc2lnbklkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KVxuICAgIC5jb250cm9sbGVyKCdEZXNpZ25FZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCBkYXRhKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIG5hbWU6IGRhdGEubmFtZVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCRzY29wZS5kYXRhKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XG4gICAgICAgIH07XG4gICAgfSlcbiAgICAuZGlyZWN0aXZlKCdkZXNpZ25MaXN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJZDogJz13b3Jrc3BhY2VJZCcsXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCcsXG4gICAgICAgICAgICAgICAgdXNlZEJ5VGVzdEJlbmNoOiAnPXVzZWRCeVRlc3RCZW5jaCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvRGVzaWduTGlzdC5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEZXNpZ25MaXN0Q29udHJvbGxlcidcbiAgICAgICAgfTtcbiAgICB9KTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXG5cbi8qKlxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqL1xuXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnblRyZWVDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHdpbmRvdywgZGVzaWduU2VydmljZSwgZGVzZXJ0U2VydmljZSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBjb250ZXh0LFxuICAgICAgICAgICAgY29uZmlnLFxuICAgICAgICAgICAgdHJlZURhdGEsXG4gICAgICAgICAgICByb290Tm9kZSxcbiAgICAgICAgICAgIGF2bUlkcyA9IHt9LFxuICAgICAgICAgICAgYnVpbGRUcmVlU3RydWN0dXJlO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdEZXNpZ25UcmVlQ29udHJvbGxlcicpO1xuXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdEZXNpZ25UcmVlQ29udHJvbGxlcl8nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICAgIG5vZGVDb250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoZSwgbm9kZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICBpdGVtczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY3JlYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtpZDogbm9kZS5pZH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcvP3Byb2plY3Q9QURNRWRpdG9yJmFjdGl2ZU9iamVjdD0nICsgZGF0YS5pZCwgJ19ibGFuaycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5vZGVDbGljazogZnVuY3Rpb24gKCBlLCBub2RlICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnTm9kZSB3YXMgY2xpY2tlZDonLCBub2RlLCAkc2NvcGUgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkaXNhYmxlTWFudWFsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgZm9sZGVySWNvbkNsYXNzOiAnZmEgZmEtY3ViZXMnXG4vLyAgICAgICAgICAgIG5vZGVEYmxjbGljazogZnVuY3Rpb24gKCBlLCBub2RlICkge1xuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdOb2RlIHdhcyBkb3VibGUtY2xpY2tlZDonLCBub2RlICk7XG4vLyAgICAgICAgICAgIH0sXG4vLyAgICAgICAgICAgIG5vZGVFeHBhbmRlckNsaWNrOiBmdW5jdGlvbiAoIGUsIG5vZGUsIGlzRXhwYW5kICkge1xuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdFeHBhbmRlciB3YXMgY2xpY2tlZCBmb3Igbm9kZTonLCBub2RlLCBpc0V4cGFuZCApO1xuLy8gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICByb290Tm9kZSA9IHtcbiAgICAgICAgICAgIGlkOiAkc2NvcGUuZGVzaWduSWQsXG4gICAgICAgICAgICBsYWJlbDogJ0xvYWRpbmcgRGVzaWduIFNwYWNlIE5vZGVzLi4nLFxuICAgICAgICAgICAgZXh0cmFJbmZvOiAnJyxcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICAgIGNoaWxkcmVuQ291bnQ6IDBcbiAgICAgICAgfTtcblxuICAgICAgICB0cmVlRGF0YSA9IHtcbiAgICAgICAgICAgIGlkOiAnJyxcbiAgICAgICAgICAgIGxhYmVsOiAnJyxcbiAgICAgICAgICAgIGV4dHJhSW5mbzogJycsXG4gICAgICAgICAgICB1bkNvbGxhcHNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgICAgICByb290Tm9kZVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGNoaWxkcmVuQ291bnQ6IDFcbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgJHNjb3BlLnRyZWVEYXRhID0gdHJlZURhdGE7XG4gICAgICAgICRzY29wZS4kb24oJ3NldFNlbGVjdGVkTm9kZXMnLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgICRzY29wZS5jb25maWcuc3RhdGUuc2VsZWN0ZWROb2RlcyA9IGRhdGE7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGJ1aWxkVHJlZVN0cnVjdHVyZSA9IGZ1bmN0aW9uIChjb250YWluZXIsIHBhcmVudFRyZWVOb2RlKSB7XG4gICAgICAgICAgICB2YXIga2V5LFxuICAgICAgICAgICAgICAgIGNoaWxkRGF0YSxcbiAgICAgICAgICAgICAgICB0cmVlTm9kZTtcbiAgICAgICAgICAgIGlmIChwYXJlbnRUcmVlTm9kZSkge1xuICAgICAgICAgICAgICAgIHRyZWVOb2RlID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGV4dHJhSW5mbzogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbkNvdW50OiAwXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBwYXJlbnRUcmVlTm9kZS5jaGlsZHJlbi5wdXNoKHRyZWVOb2RlKTtcbiAgICAgICAgICAgICAgICBwYXJlbnRUcmVlTm9kZS5jaGlsZHJlbkNvdW50ICs9IDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyZWVOb2RlID0gcm9vdE5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmVlTm9kZS5pZCA9IGNvbnRhaW5lci5pZDtcbiAgICAgICAgICAgIHRyZWVOb2RlLmxhYmVsID0gY29udGFpbmVyLm5hbWU7XG4gICAgICAgICAgICB0cmVlTm9kZS5leHRyYUluZm8gPSBjb250YWluZXIudHlwZTtcbiAgICAgICAgICAgICRzY29wZS5jb25maWcuc3RhdGUuZXhwYW5kZWROb2Rlcy5wdXNoKHRyZWVOb2RlLmlkKTtcbiAgICAgICAgICAgIGZvciAoa2V5IGluIGNvbnRhaW5lci5jb21wb25lbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5jb21wb25lbnRzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhID0gY29udGFpbmVyLmNvbXBvbmVudHNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgdHJlZU5vZGUuY2hpbGRyZW4ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGREYXRhLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGNoaWxkRGF0YS5uYW1lXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0cmVlTm9kZS5jaGlsZHJlbkNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdm1JZHNbY2hpbGREYXRhLmF2bUlkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWRzW2NoaWxkRGF0YS5hdm1JZF0ucHVzaChjaGlsZERhdGEuaWQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWRzW2NoaWxkRGF0YS5hdm1JZF0gPSBbY2hpbGREYXRhLmlkXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoa2V5IGluIGNvbnRhaW5lci5zdWJDb250YWluZXJzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5zdWJDb250YWluZXJzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhID0gY29udGFpbmVyLnN1YkNvbnRhaW5lcnNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRUcmVlU3RydWN0dXJlKGNoaWxkRGF0YSwgdHJlZU5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xuXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWduU3RydWN0dXJlKGNvbnRleHQsICRzY29wZS5kZXNpZ25JZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybih1cGRhdGVPYmplY3QpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcm9vdENvbnRhaW5lciA9IGRhdGEuY29udGFpbmVyc1tkYXRhLnJvb3RJZF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNlcnRJbnB1dERhdGE7XG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkVHJlZVN0cnVjdHVyZShyb290Q29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCdkZXNpZ25UcmVlTG9hZGVkJywgYXZtSWRzKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gRklYTUU6IFRoaXMgcGFydCBpcyBvbmx5IGhlcmUgdG8gcmV1c2UgdGhlIGRhdGEgZnJvbSB3YXRjaERlc2lnblN0cnVjdHVyZS5cbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogRmluZCBhIG1vcmUgc3VpdGFibGUgbG9jYXRpb24uXG4gICAgICAgICAgICAgICAgICAgIGRlc2VydElucHV0RGF0YSA9IGRlc2VydFNlcnZpY2UuZ2V0RGVzZXJ0SW5wdXREYXRhKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGVtaXQoJ2Rlc2VydElucHV0UmVhZHknLCBkZXNlcnRJbnB1dERhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KVxuICAgIC5kaXJlY3RpdmUoJ2Rlc2lnblRyZWUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIGRlc2lnbklkOiAnPWRlc2lnbklkJyxcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9EZXNpZ25UcmVlLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rlc2lnblRyZWVDb250cm9sbGVyJ1xuICAgICAgICB9O1xuICAgIH0pO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4vKipcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxuICAgIC5jb250cm9sbGVyKCdTaW1wbGVNb2RhbENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgZGF0YSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICAgICAgdGl0bGU6IGRhdGEudGl0bGUsXG4gICAgICAgICAgICBkZXRhaWxzOiBkYXRhLmRldGFpbHNcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcbiAgICAgICAgfTtcbiAgICB9KTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cblxuLyoqXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxuICovXG5cbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcbiAgICAuY29udHJvbGxlcignVGVzdEJlbmNoRGV0YWlsc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCB0ZXN0QmVuY2hTZXJ2aWNlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGNvbnRleHQgPSB7fSxcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fSxcbiAgICAgICAgICAgIGNvbm5lY3RvcnMgPSB7fSxcbiAgICAgICAgICAgIHBvcnRzID0ge30sXG4gICAgICAgICAgICB3YXRjaEludGVyZmFjZXM7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ1Rlc3RCZW5jaERldGFpbHNDb250cm9sbGVyJyk7XG4gICAgICAgICRzY29wZS5pbml0ID0gZnVuY3Rpb24gKGNvbm5lY3Rpb25JZCkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdUZXN0QmVuY2hEZXRhaWxzXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEZXN0cm95aW5nIDonLCBjb250ZXh0LnJlZ2lvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IGNvbm5lY3RvcnMsXG4gICAgICAgICAgICAgICAgcG9ydHM6IHBvcnRzXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKGNvbnRhaW5lcklkKSB7XG4gICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS53YXRjaEludGVyZmFjZXMoY29udGV4dCwgY29udGFpbmVySWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2luY2Ugd2F0Y2hJbnRlcmZhY2VzIGtlZXBzIHRoZSBkYXRhIHVwLXRvLWRhdGUgdGhlcmUgc2hvdWxkbid0IGJlIGEgbmVlZCB0byBkbyBhbnlcbiAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlcyBoZXJlLi5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoSW50ZXJmYWNlcycsIHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbnRhaW5lckludGVyZmFjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLnByb3BlcnRpZXMgPSBjb250YWluZXJJbnRlcmZhY2VzLnByb3BlcnRpZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5jb25uZWN0b3JzID0gY29udGFpbmVySW50ZXJmYWNlcy5jb25uZWN0b3JzO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMucG9ydHMgPSBjb250YWluZXJJbnRlcmZhY2VzLnBvcnRzO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95KSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9LFxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgcG9ydHM6IHt9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAoZGVzdHJveSkge1xuICAgICAgICAgICAgICAgICAgICAvL1RPRE86IG5vdGlmeSB1c2VyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdUZXN0QmVuY2hEZXRhaWxzQ29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XG4gICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS53YXRjaFRlc3RCZW5jaERldGFpbHMoY29udGV4dCwgJHNjb3BlLnRlc3RCZW5jaElkLCBmdW5jdGlvbiAodXBkYXRlZE9iaikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3dhdGNoVGVzdEJlbmNoRGV0YWlscyB1cGRhdGVzJywgdXBkYXRlZE9iaik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbnRhaW5lcklkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIGNvbnRhaW5lciBkZWZpbmVkIScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRhLmNvbnRhaW5lcklkcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEludGVyZmFjZXMoZGF0YS5jb250YWluZXJJZHNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdNb3JlIHRoYW4gb25lIGNvbnRhaW5lciBkZWZpbmVkIScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH0pXG4gICAgLmRpcmVjdGl2ZSgndGVzdEJlbmNoRGV0YWlscycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQ6ICc9dGVzdEJlbmNoSWQnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVxdWlyZTogJ150ZXN0QmVuY2hMaXN0JyxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0ciwgdGVzdEJlbmNoTGlzdENvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdGlvbklkID0gdGVzdEJlbmNoTGlzdENvbnRyb2xsZXIuZ2V0Q29ubmVjdGlvbklkKCk7XG4gICAgICAgICAgICAgICAgc2NvcGUuaW5pdChjb25uZWN0aW9uSWQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9JbnRlcmZhY2VEZXRhaWxzLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Rlc3RCZW5jaERldGFpbHNDb250cm9sbGVyJ1xuICAgICAgICB9O1xuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXG5cbi8qKlxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cbiAqL1xuXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXG4gICAgLmNvbnRyb2xsZXIoJ1Rlc3RCZW5jaExpc3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHdpbmRvdywgJGxvY2F0aW9uLCAkbW9kYWwsIGdyb3dsLCB0ZXN0QmVuY2hTZXJ2aWNlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgaXRlbXMgPSBbXSwgICAgICAgICAgICAgLy8gSXRlbXMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZSBpdGVtLWxpc3QgdWktY29tcG9uZW50LlxuICAgICAgICAgICAgdGVzdEJlbmNoSXRlbXMgPSB7fSwgICAgLy8gU2FtZSBpdGVtcyBhcmUgc3RvcmVkIGluIGEgZGljdGlvbmFyeS5cbiAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtLFxuICAgICAgICAgICAgY29uZmlnLFxuICAgICAgICAgICAgY29udGV4dDtcblxuICAgICAgICBjb25zb2xlLmxvZygnVGVzdEJlbmNoTGlzdENvbnRyb2xsZXInKTtcblxuICAgICAgICB0aGlzLmdldENvbm5lY3Rpb25JZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUuY29ubmVjdGlvbklkO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdUZXN0QmVuY2hMaXN0Q29udHJvbGxlcl8nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBpdGVtIGxpc3QgdWkgY29tcG9uZW50LlxuICAgICAgICBjb25maWcgPSB7XG5cbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXG4gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcblxuICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcblxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uIChqUUV2ZW50LCB1aSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaXRlbUNsaWNrOiBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3VXJsID0gJy90ZXN0QmVuY2gvJyArICRzY29wZS53b3Jrc3BhY2VJZC5yZXBsYWNlKC9cXC8vZywgJy0nKSArICcvJyArIGl0ZW0uaWQucmVwbGFjZSgvXFwvL2csICctJyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3VXJsKTtcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aChuZXdVcmwpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD1BRE1FZGl0b3ImYWN0aXZlT2JqZWN0PScgKyBpdGVtLmlkLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdlZGl0VGVzdEJlbmNoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGl0ZW0uZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IGl0ZW0uZGF0YS5maWxlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGl0ZW0uZGF0YS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdENvbnRleHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYjogY29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hUZXN0QmVuY2hlcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2g6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0ZXN0QmVuY2hTZXJ2aWNlLmVkaXRUZXN0QmVuY2hGblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZGVsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRlc3RCZW5jaFNlcnZpY2UuZGVsZXRlRm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGl0ZW0uZGV0YWlscyA9ICdNeSBkZXRhaWxzIGFyZSBoZXJlIG5vdyEnO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZmlsdGVyOiB7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xuICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XG4gICAgICAgICAgICBpdGVtczogaXRlbXNcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUcmFuc2Zvcm0gdGhlIHJhdyBzZXJ2aWNlIG5vZGUgZGF0YSB0byBpdGVtcyBmb3IgdGhlIGxpc3QuXG4gICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBsaXN0SXRlbTtcblxuICAgICAgICAgICAgaWYgKHRlc3RCZW5jaEl0ZW1zLmhhc093blByb3BlcnR5KGRhdGEuaWQpKSB7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSB0ZXN0QmVuY2hJdGVtc1tkYXRhLmlkXTtcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS50aXRsZSA9IGRhdGEubmFtZTtcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kZXNjcmlwdGlvbiA9IGRhdGEuZGVzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGF0YS5maWxlcyA9IGRhdGEuZmlsZXM7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGF0YS5wYXRoID0gZGF0YS5wYXRoO1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRhdGEucmVzdWx0cyA9IGRhdGEucmVzdWx0cztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnT3BlbiBUZXN0LUJlbmNoIFZpZXcnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6ICdOL0EnLCAgIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiAnTi9BJyAgICAvLyBUT0RPOiBnZXQgdGhpcyBpbiB0aGUgZnV0dXJlLlxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdGF0czogWyBdLFxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzICAgIDogJ0NvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzVGVtcGxhdGVVcmw6ICd0ZXN0QmVuY2hEZXRhaWxzLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogZGF0YS5maWxlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGRhdGEucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IGRhdGEucmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGxpc3QtaXRlbSB0byB0aGUgaXRlbXMgbGlzdCBhbmQgdGhlIGRpY3Rpb25hcnkuXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChsaXN0SXRlbSk7XG4gICAgICAgICAgICAgICAgdGVzdEJlbmNoSXRlbXNbbGlzdEl0ZW0uaWRdID0gbGlzdEl0ZW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGVzdEJlbmNoU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xuICAgICAgICAgICAgaXRlbXMgPSBbXTtcbiAgICAgICAgICAgICRzY29wZS5saXN0RGF0YS5pdGVtcyA9IGl0ZW1zO1xuICAgICAgICAgICAgdGVzdEJlbmNoSXRlbXMgPSB7fTtcblxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignZGVzdHJveSBldmVudCByYWlzZWQnKTtcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcblxuICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS53YXRjaFRlc3RCZW5jaGVzKGNvbnRleHQsICRzY29wZS53b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleDtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUud2Fybih1cGRhdGVPYmplY3QpO1xuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJykge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3RCZW5jaEl0ZW1zLmhhc093blByb3BlcnR5KHVwZGF0ZU9iamVjdC5pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaXRlbXMubWFwKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5pbmRleE9mKHVwZGF0ZU9iamVjdC5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGVzdEJlbmNoSXRlbXNbdXBkYXRlT2JqZWN0LmlkXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih1cGRhdGVPYmplY3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlc3RCZW5jaElkO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHRlc3RCZW5jaElkIGluIGRhdGEudGVzdEJlbmNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnRlc3RCZW5jaGVzLmhhc093blByb3BlcnR5KHRlc3RCZW5jaElkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKGRhdGEudGVzdEJlbmNoZXNbdGVzdEJlbmNoSWRdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KVxuICAgIC5jb250cm9sbGVyKCdUZXN0QmVuY2hFZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCBncm93bCwgZGF0YSwgZmlsZVNlcnZpY2UpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXIgZmlsZUluZm87XG4gICAgICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBuYW1lOiBkYXRhLm5hbWUsXG4gICAgICAgICAgICBmaWxlSW5mbzoge1xuICAgICAgICAgICAgICAgIGhhc2g6IGRhdGEuZmlsZXMsXG4gICAgICAgICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICAgICAgICB1cmw6IGZpbGVTZXJ2aWNlLmdldERvd25sb2FkVXJsKGRhdGEuZmlsZXMpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogZGF0YS5wYXRoXG4gICAgICAgIH07XG4gICAgICAgIGZpbGVJbmZvID0gJHNjb3BlLmRhdGEuZmlsZUluZm87XG4gICAgICAgIGlmIChmaWxlSW5mby5oYXNoKSB7XG4gICAgICAgICAgICBmaWxlU2VydmljZS5nZXRNZXRhZGF0YShmaWxlSW5mby5oYXNoKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChtZXRhZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlSW5mby5uYW1lID0gbWV0YWRhdGEubmFtZTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBnZXQgbWV0YS1kYXRhIGZvciBoYXNoJywgZmlsZUluZm8uaGFzaCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuZHJhZ092ZXJDbGFzcyA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBkcmFnZ2VkSXRlbXMgPSAkZXZlbnQuZGF0YVRyYW5zZmVyLml0ZW1zLFxuICAgICAgICAgICAgICAgIGhhc0ZpbGUgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vY29uc29sZS53YXJuKGRyYWdnZWRJdGVtcyk7XG4gICAgICAgICAgICBoYXNGaWxlID0gZHJhZ2dlZEl0ZW1zICYmIGRyYWdnZWRJdGVtcy5sZW5ndGggPT09IDEgJiYgZHJhZ2dlZEl0ZW1zWzBdLmtpbmQgPT09ICdmaWxlJztcblxuICAgICAgICAgICAgcmV0dXJuIGhhc0ZpbGUgPyBcImJnLXN1Y2Nlc3MgZHJhZ292ZXJcIiA6IFwiYmctZGFuZ2VyIGRyYWdvdmVyXCI7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9uRHJvcHBlZEZpbGVzID0gZnVuY3Rpb24gKCRmaWxlcykge1xuICAgICAgICAgICAgZmlsZVNlcnZpY2Uuc2F2ZURyb3BwZWRGaWxlcygkZmlsZXMsIHt6aXA6IHRydWV9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChmSW5mb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZJbmZvcy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdPbmUgemlwIGZpbGUgbXVzdCBiZSBkcm9wcGVkIScpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8ubmFtZSA9IGZJbmZvc1swXS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8udXJsID0gZkluZm9zWzBdLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlSW5mby5oYXNoID0gZkluZm9zWzBdLmhhc2g7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgkc2NvcGUuZGF0YSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoJ2NhbmNlbCcpO1xuICAgICAgICB9O1xuICAgIH0pXG4gICAgLmRpcmVjdGl2ZSgndGVzdEJlbmNoTGlzdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSWQ6ICc9d29ya3NwYWNlSWQnLFxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25JZDogJz1jb25uZWN0aW9uSWQnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1Rlc3RCZW5jaExpc3QuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnVGVzdEJlbmNoTGlzdENvbnRyb2xsZXInXG4gICAgICAgIH07XG4gICAgfSk7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xuXG4vKipcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxuICAgIC5jb250cm9sbGVyKCdXb3JrZXJzTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkaW50ZXJ2YWwsIGdyb3dsLCBleGVjdXRvclNlcnZpY2UpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXIgaW50ZXJ2YWxQcm9taXNlID0gbnVsbCxcbiAgICAgICAgICAgIGNvbnNlY3V0aXZlRXJyb3JzID0gMCxcbiAgICAgICAgICAgIG1heENvbnNlY3V0aXZlRXJyb3JzID0gMzA7XG4gICAgICAgICRzY29wZS5kYXRhTW9kZWwgPSB7XG4gICAgICAgICAgICB3b3JrZXJzOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGludGVydmFsUHJvbWlzZSAmJiAkaW50ZXJ2YWwuY2FuY2VsKGludGVydmFsUHJvbWlzZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnV29ya2VycyBpbnRlcnZhbCBjYW5jZWxsZWQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGNhbmNlbCBXb3JrZXJzSW50ZXJ2YWwuJyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihpbnRlcnZhbFByb21pc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpbnRlcnZhbFByb21pc2UgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXhlY3V0b3JTZXJ2aWNlLmdldFdvcmtlcnNJbmZvKClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc2VjdXRpdmVFcnJvcnMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVsLndvcmtlcnMgPSByZXNwb25jZTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc2VjdXRpdmVFcnJvcnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnNlY3V0aXZlRXJyb3JzID49IG1heENvbnNlY3V0aXZlRXJyb3JzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKGludGVydmFsUHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcignV29ya2VycyBkaWQgbm90IHJlc3BvbmQgYWZ0ZXIgJyArIG1heENvbnNlY3V0aXZlRXJyb3JzICsgJyByZXF1ZXN0cy4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVydmFsUHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgfSlcbiAgICAuZGlyZWN0aXZlKCd3b3JrZXJzTGlzdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1dvcmtlcnNMaXN0Lmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtlcnNMaXN0Q29udHJvbGxlcidcbiAgICAgICAgfTtcbiAgICB9KTtcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCovXG5cbi8qKlxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cbiAqL1xuXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXG4gICAgLmNvbnRyb2xsZXIoJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHdpbmRvdywgJGxvY2F0aW9uLCAkbW9kYWwsIGdyb3dsLCB3b3Jrc3BhY2VTZXJ2aWNlLCBmaWxlU2VydmljZSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGl0ZW1zID0gW10sXG4gICAgICAgICAgICB3b3Jrc3BhY2VJdGVtcyA9IHt9LFxuICAgICAgICAgICAgY29uZmlnLFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtLFxuICAgICAgICAgICAgYWRkQ291bnRXYXRjaGVycztcblxuICAgICAgICBjb25zb2xlLmxvZygnV29ya3NwYWNlTGlzdENvbnRyb2xsZXInKTtcblxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnV29ya3NwYWNlTGlzdENvbnRyb2xsZXJfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcgPSB7XG5cbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXG4gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcblxuICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcblxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uIChqUUV2ZW50LCB1aSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaXRlbUNsaWNrOiBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3dvcmtzcGFjZURldGFpbHMvJyArIGl0ZW0uaWQucmVwbGFjZSgvXFwvL2csICctJykpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD1BRE1FZGl0b3ImYWN0aXZlT2JqZWN0PScgKyBpdGVtLmlkLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdlZGl0V29ya3NwYWNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGl0ZW0uZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlZGl0Q29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGI6IGNvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaFdvcmtzcGFjZXMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Xb3Jrc3BhY2VFZGl0Lmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnV29ya3NwYWNlRWRpdENvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7IGRhdGE6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRhdGE7IH0gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uIChlZGl0ZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGF0dHJzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IGVkaXRlZERhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lORk8nOiBlZGl0ZWREYXRhLmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLnNldFdvcmtzcGFjZUF0dHJpYnV0ZXMoZWRpdENvbnRleHQsIGRhdGEuaWQsIGF0dHJzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXR0cmlidXRlIHVwZGF0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc1hNRScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhwb3J0IGFzIFhNRScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7IGlkOiBpdGVtLmlkLCBuYW1lOiBpdGVtLnRpdGxlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuZXhwb3J0V29ya3NwYWNlKGNvbnRleHQsIGRhdGEuaWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRvd25sb2FkVXJsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoJ1dvcmtzcGFjZSBwYWNrYWdlIGZvciA8YSBocmVmPVwiJyArIGRvd25sb2FkVXJsICsgJ1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5uYW1lICsgJzwvYT4gZXhwb3J0ZWQuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdFeHBvcnQgZmFpbGVkLCBzZWUgY29uc29sZSBmb3IgZGV0YWlscy4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZGVsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCwgbmFtZTogaXRlbS50aXRsZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9TaW1wbGVNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2ltcGxlTW9kYWxDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUgV29ya3NwYWNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiAnVGhpcyB3aWxsIGRlbGV0ZSAnICsgZGF0YS5uYW1lICsgJyBmcm9tIHRoZSBwcm9qZWN0LidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5kZWxldGVXb3Jrc3BhY2UoY29udGV4dCwgZGF0YS5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGl0ZW0uZGV0YWlscyA9ICdNeSBkZXRhaWxzIGFyZSBoZXJlIG5vdyEnO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbmV3SXRlbUZvcm06IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NyZWF0ZSBuZXcgd29ya3NwYWNlJyxcbiAgICAgICAgICAgICAgICBpdGVtVGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvV29ya3NwYWNlTmV3SXRlbS5odG1sJyxcbiAgICAgICAgICAgICAgICBleHBhbmRlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubW9kZWwgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wcGVkRmlsZXM6IFtdXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kcmFnT3ZlckNsYXNzID0gZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRyYWdnZWRJdGVtcyA9ICRldmVudC5kYXRhVHJhbnNmZXIuaXRlbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGaWxlID0gZmFsc2U7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihkcmFnZ2VkSXRlbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWRJdGVtcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0ZpbGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGRyYWdnZWRJdGVtcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ2dlZEl0ZW1zW2ldLmtpbmQgPT09ICdmaWxlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhhc0ZpbGUgPyBcImJnLXN1Y2Nlc3MgZHJhZ292ZXJcIiA6IFwiYmctZGFuZ2VyIGRyYWdvdmVyXCI7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uRHJvcHBlZEZpbGVzID0gZnVuY3Rpb24gKCRmaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVNlcnZpY2Uuc2F2ZURyb3BwZWRGaWxlcygkZmlsZXMsIHt6aXA6IHRydWUsIGFkbTogdHJ1ZSwgYXRtOiB0cnVlfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZkluZm9zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhmSW5mb3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZkluZm9zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubW9kZWwuZHJvcHBlZEZpbGVzLnB1c2goZkluZm9zW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jcmVhdGVJdGVtID0gZnVuY3Rpb24gKG5ld0l0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdJdGVtQ29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGI6IGNvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaFdvcmtzcGFjZXMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbmV3SXRlbSB8fCAhbmV3SXRlbS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnUHJvdmlkZSBhIG5hbWUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmNyZWF0ZVdvcmtzcGFjZShuZXdJdGVtQ29udGV4dCwgbmV3SXRlbS5uYW1lLCBuZXdJdGVtLmRlc2NyaXB0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChmb2xkZXJJZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcyhuZXdJdGVtLm5hbWUgKyAnIGNyZWF0ZWQuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubW9kZWwuZHJvcHBlZEZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmluZm8oJ0ltcG9ydGluZyBmaWxlcy4uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmltcG9ydEZpbGVzKG5ld0l0ZW1Db250ZXh0LCBmb2xkZXJJZHMsICRzY29wZS5tb2RlbC5kcm9wcGVkRmlsZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5pbmZvKCdGaW5pc2hlZCBpbXBvcnRpbmcgZmlsZXMhJywge3R0bDogMTAwfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihyZWFzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsW2luZm8udHlwZV0oaW5mby5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5hbGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLm5ld0l0ZW1Gb3JtLmV4cGFuZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tb2RlbC5kcm9wcGVkRmlsZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5uZXdJdGVtRm9ybS5leHBhbmRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsLmRyb3BwZWRGaWxlcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZmlsdGVyOiB7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XG4gICAgICAgICAgICBpdGVtczogaXRlbXNcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xuXG4gICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VJdGVtO1xuXG4gICAgICAgICAgICBpZiAod29ya3NwYWNlSXRlbXMuaGFzT3duUHJvcGVydHkoZGF0YS5pZCkpIHtcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJdGVtID0gd29ya3NwYWNlSXRlbXNbZGF0YS5pZF07XG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbS50aXRsZSA9IGRhdGEubmFtZTtcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJdGVtLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuaWQsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdPcGVuIFdvcmtzcGFjZScsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTogbmV3IERhdGUoKSwgLy8gVE9ETzogZ2V0IHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnIC8vIFRPRE86IGdldCB0aGlzXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ0NvbXBvbmVudHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXB1enpsZS1waWVjZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ0Rlc2lnbiBTcGFjZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLWN1YmVzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnVGVzdCBiZW5jaGVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXNhdmVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnUmVxdWlyZW1lbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1iYXItY2hhcnQtbydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJdGVtLmlkXSA9IHdvcmtzcGFjZUl0ZW07XG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCh3b3Jrc3BhY2VJdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBhZGRDb3VudFdhdGNoZXJzID0gZnVuY3Rpb24gKHdvcmtzcGFjZUlkKSB7XG4gICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZDb21wb25lbnRzKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBmdW5jdGlvbiAodXBkYXRlRGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xuICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMF0udmFsdWUgPSB1cGRhdGVEYXRhLmRhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMF0udmFsdWUgPSBkYXRhLmNvdW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZEZXNpZ25zKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBmdW5jdGlvbiAodXBkYXRlRGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xuICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMV0udmFsdWUgPSB1cGRhdGVEYXRhLmRhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMV0udmFsdWUgPSBkYXRhLmNvdW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlcyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZURhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcbiAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzJdLnZhbHVlID0gdXBkYXRlRGF0YS5kYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZURhdGEgPSB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJZF07XG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzJdLnZhbHVlID0gZGF0YS5jb3VudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHdvcmtzcGFjZVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIC8vIGluaXRpYWxpemUgYWxsIHZhcmlhYmxlc1xuICAgICAgICAgICAgaXRlbXMgPSBbXTtcbiAgICAgICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICBpdGVtczogaXRlbXNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3b3Jrc3BhY2VJdGVtcyA9IHt9O1xuXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdXb3Jrc3BhY2VMaXN0Q29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XG4gICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoV29ya3NwYWNlcyhjb250ZXh0LCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4O1xuXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBhZGRDb3VudFdhdGNoZXJzKHVwZGF0ZU9iamVjdC5pZCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJykge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndW5sb2FkJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlSXRlbXMuaGFzT3duUHJvcGVydHkodXBkYXRlT2JqZWN0LmlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpdGVtcy5tYXAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmluZGV4T2YodXBkYXRlT2JqZWN0LmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mQ29tcG9uZW50c18nICsgdXBkYXRlT2JqZWN0LmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mRGVzaWduc18nICsgdXBkYXRlT2JqZWN0LmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mVGVzdEJlbmNoZXNfJyArIHVwZGF0ZU9iamVjdC5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgd29ya3NwYWNlSXRlbXNbdXBkYXRlT2JqZWN0LmlkXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VJZDtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHdvcmtzcGFjZUlkIGluIGRhdGEud29ya3NwYWNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEud29ya3NwYWNlcy5oYXNPd25Qcm9wZXJ0eSh3b3Jrc3BhY2VJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbShkYXRhLndvcmtzcGFjZXNbd29ya3NwYWNlSWRdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRDb3VudFdhdGNoZXJzKHdvcmtzcGFjZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KVxuICAgIC5jb250cm9sbGVyKCdXb3Jrc3BhY2VFZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCBkYXRhKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIG5hbWU6IGRhdGEubmFtZVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCRzY29wZS5kYXRhKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XG4gICAgICAgIH07XG4gICAgfSlcbiAgICAuZGlyZWN0aXZlKCd3b3Jrc3BhY2VMaXN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Xb3Jrc3BhY2VMaXN0Lmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyJ1xuICAgICAgICB9O1xuICAgIH0pO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xuXG4vKipcbiAqIFRoaXMgc2VydmljZSBjb250YWlucyBmdW5jdGlvbmFsaXR5IHNoYXJlZCBhbW9uZ3N0IHRoZSBkaWZmZXJlbnQgc2VydmljZXMuIEl0IHNob3VsZCBub3QgYmUgdXNlZFxuICogZGlyZWN0bHkgaW4gYSBjb250cm9sbGVyIC0gb25seSBhcyBwYXJ0IG9mIG90aGVyIHNlcnZpY2VzLlxuICpcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cblxuXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxuICAgIC5zZXJ2aWNlKCdiYXNlQ3lQaHlTZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCAkdGltZW91dCwgbm9kZVNlcnZpY2UpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWdpc3RlcnMgYSB3YXRjaGVyIChjb250cm9sbGVyKSB0byB0aGUgc2VydmljZS4gQ2FsbGJhY2sgZnVuY3Rpb24gaXMgY2FsbGVkIHdoZW4gbm9kZXMgYmVjb21lIGF2YWlsYWJsZSBvclxuICAgICAgICAgKiB3aGVuIHRoZXkgYmVjYW1lIHVuYXZhaWxhYmxlLiBUaGVzZSBhcmUgYWxzbyBjYWxsZWQgZGlyZWN0bHkgd2l0aCB0aGUgc3RhdGUgb2YgdGhlIG5vZGVTZXJ2aWNlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd2F0Y2hlcnMgLSBXYXRjaGVycyBmcm9tIHRoZSBzZXJ2aWNlIHV0aWxpemluZyB0aGlzIGZ1bmN0aW9uLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQuZGIgLSBEYXRhYmFzZSBjb25uZWN0aW9uLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5yZWdpb25JZCAtIFJlZ2lvbiBvZiB0aGUgY29udHJvbGxlciAoYWxsIHNwYXduZWQgcmVnaW9ucyBhcmUgZ3JvdXBlZCBieSB0aGlzKS5cbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gLSBDYWxsZWQgd2l0aCB0cnVlIHdoZW4gdGhlcmUgYXJlIG5vIG5vZGVzIHVuYXZhaWxhYmxlIGFuZCBmYWxzZSB3aGVuIHRoZXJlIGFyZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVnaXN0ZXJXYXRjaGVyID0gZnVuY3Rpb24gKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBmbikge1xuICAgICAgICAgICAgbm9kZVNlcnZpY2Uub24ocGFyZW50Q29udGV4dC5kYiwgJ2luaXRpYWxpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgYmUgZW5vdWdoLCB0aGUgcmVnaW9ucyB3aWxsIGJlIGNsZWFuZWQgdXAgaW4gbm9kZVNlcnZpY2UuXG4gICAgICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB7fTtcbiAgICAgICAgICAgICAgICBmbihmYWxzZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLm9uKHBhcmVudENvbnRleHQuZGIsICdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGVub3VnaCwgdGhlIHJlZ2lvbnMgc2hvdWxkIGJlIGNsZWFuZWQgdXAgaW4gbm9kZVNlcnZpY2UuXG4gICAgICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm4odHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlcyBhbGwgd2F0Y2hlcnMgc3Bhd25lZCBmcm9tIHBhcmVudENvbnRleHQsIHRoaXMgc2hvdWxkIHR5cGljYWxseSBiZSBpbnZva2VkIHdoZW4gdGhlIGNvbnRyb2xsZXIgaXMgZGVzdHJveWVkLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd2F0Y2hlcnMgLSBXYXRjaGVycyBmcm9tIHRoZSBzZXJ2aWNlIHV0aWxpemluZyB0aGlzIGZ1bmN0aW9uLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsZWFuVXBBbGxSZWdpb25zID0gZnVuY3Rpb24gKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0KSB7XG4gICAgICAgICAgICB2YXIgY2hpbGRXYXRjaGVycyxcbiAgICAgICAgICAgICAgICBrZXk7XG4gICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcbiAgICAgICAgICAgICAgICBjaGlsZFdhdGNoZXJzID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF07XG4gICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gY2hpbGRXYXRjaGVycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRXYXRjaGVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5jbGVhblVwUmVnaW9uKGNoaWxkV2F0Y2hlcnNba2V5XS5kYiwgY2hpbGRXYXRjaGVyc1trZXldLnJlZ2lvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RoaW5nIHRvIGNsZWFuLXVwLi4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlcyBzcGVjaWZpZWQgd2F0Y2hlciAocmVnaW9uSWQpXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3YXRjaGVycyAtIFdhdGNoZXJzIGZyb20gdGhlIHNlcnZpY2UgdXRpbGl6aW5nIHRoaXMgZnVuY3Rpb24uXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24gb2YgYm90aCBwYXJlbnQgYW5kIHJlZ2lvbiB0byBiZSBkZWxldGVkLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5yZWdpb25JZCAtIFJlZ2lvbiBvZiB0aGUgY29udHJvbGxlciAoYWxsIHNwYXduZWQgcmVnaW9ucyBhcmUgZ3JvdXBlZCBieSB0aGlzKS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHJlZ2lvbklkIC0gUmVnaW9uIGlkIG9mIHRoZSBzcGF3bmVkIHJlZ2lvbiB0aGF0IHNob3VsZCBiZSBkZWxldGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGVhblVwUmVnaW9uID0gZnVuY3Rpb24gKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xuICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdKSB7XG4gICAgICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW3JlZ2lvbklkXSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5jbGVhblVwUmVnaW9uKHBhcmVudENvbnRleHQuZGIsIHJlZ2lvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW3JlZ2lvbklkXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90aGluZyB0byBjbGVhbi11cC4uJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2Fubm90IGNsZWFuLXVwIHJlZ2lvbiBzaW5jZSBwYXJlbnRDb250ZXh0IGlzIG5vdCByZWdpc3RlcmVkLi4nLCBwYXJlbnRDb250ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVXBkYXRlcyB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvZiBhIG5vZGUuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGNvbXBvbmVudC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgY29tcG9uZW50LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5yZWdpb25JZCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBjb21wb25lbnQuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFBhdGggdG8gbm9kZS5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGF0dHJzIC0gS2V5cyBhcmUgbmFtZXMgb2YgYXR0cmlidXRlcyBhbmQgdmFsdWVzIGFyZSB0aGUgd2FudGVkIHZhbHVlLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXROb2RlQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChjb250ZXh0LCBpZCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoYXR0cnMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdubyBhdHRyaWJ1dGUgdG8gdXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgaWQpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG5vZGVPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhdHRycyksXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyID0ga2V5cy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRBdHRyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlT2JqLnNldEF0dHJpYnV0ZShrZXlzW2NvdW50ZXJdLCBhdHRyc1trZXlzW2NvdW50ZXJdXSwgJ3dlYkN5UGh5IC0gc2V0Tm9kZUF0dHJpYnV0ZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY291bnRlciA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRBdHRyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgc2V0QXR0cigpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKiogVE9ETzogV2F0Y2ggZG9tYWluUG9ydHMgaW5zaWRlIENvbm5lY3RvcnNcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGludGVyZmFjZXMgKFByb3BlcnRpZXMsIENvbm5lY3RvcnMgYW5kIERvbWFpblBvcnRzKSBvZiBhIG1vZGVsLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd2F0Y2hlcnMgLSBXYXRjaGVycyBmcm9tIHRoZSBzZXJ2aWNlIHV0aWxpemluZyB0aGlzIGZ1bmN0aW9uLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gUGF0aCB0byBtb2RlbC5cbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBpZCwgdXBkYXRlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaEludGVyZmFjZXNfJyArIGlkLFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSwgLy9wcm9wZXJ0eTogIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkYXRhVHlwZTogPHN0cmluZz4sIHZhbHVlVHlwZSA8c3RyaW5nPiwgZGVyaXZlZCA8Ym9vbGVhbj59XG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IHt9LCAvL2Nvbm5lY3Rvcjoge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRvbWFpblBvcnRzOiA8b2JqZWN0PiB9XG4gICAgICAgICAgICAgICAgICAgIHBvcnRzOiB7fSAgICAgICAvL3BvcnQ6ICAgICAge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIHR5cGU6IDxzdHJpbmc+LCBjbGFzczogPHN0cmluZz4gfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25Qcm9wZXJ0eVVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEYXRhVHlwZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdEYXRhVHlwZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVUeXBlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1ZhbHVlVHlwZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVyaXZlZCA9IGlzUHJvcGVydHlEZXJpdmVkKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5wcm9wZXJ0aWVzW2lkXS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbaWRdLm5hbWUgPSBuZXdOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0RhdGFUeXBlICE9PSBkYXRhLnByb3BlcnRpZXNbaWRdLmRhdGFUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbaWRdLmRhdGFUeXBlID0gbmV3RGF0YVR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWVUeXBlICE9PSBkYXRhLnByb3BlcnRpZXNbaWRdLnZhbHVlVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wcm9wZXJ0aWVzW2lkXS52YWx1ZVR5cGUgPSBuZXdWYWx1ZVR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVyaXZlZCAhPT0gZGF0YS5wcm9wZXJ0aWVzW2lkXS5kZXJpdmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbaWRdLmRlcml2ZWQgPSBuZXdEZXJpdmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uUHJvcGVydHlVbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEucHJvcGVydGllc1tpZF07XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25Db25uZWN0b3JVcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5jb25uZWN0b3JzW2lkXS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbm5lY3RvcnNbaWRdLm5hbWUgPSBuZXdOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uQ29ubmVjdG9yVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmNvbm5lY3RvcnNbaWRdO1xuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uUG9ydFVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdUeXBlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1R5cGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NsYXNzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0NsYXNzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLnBvcnRzW2lkXS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnBvcnRzW2lkXS5uYW1lID0gbmV3TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdUeXBlICE9PSBkYXRhLnBvcnRzW2lkXS5kYXRhVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wb3J0c1tpZF0udHlwZSA9IG5ld1R5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2xhc3MgIT09IGRhdGEucG9ydHNbaWRdLmNsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnBvcnRzW2lkXS5jbGFzcyA9IG5ld0NsYXNzO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uUG9ydFVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5wb3J0c1tpZF07XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaXNQcm9wZXJ0eURlcml2ZWQgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5nZXRDb2xsZWN0aW9uUGF0aHMoJ2RzdCcpLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgaWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChtb2RlbE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IGNoaWxkTm9kZS5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLlByb3BlcnR5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wcm9wZXJ0aWVzW2NoaWxkSWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnRGF0YVR5cGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1ZhbHVlVHlwZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcml2ZWQ6IGlzUHJvcGVydHlEZXJpdmVkKGNoaWxkTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25Qcm9wZXJ0eVVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25Qcm9wZXJ0eVVubG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbm5lY3RvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29ubmVjdG9yc1tjaGlsZElkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluUG9ydHM6IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uQ29ubmVjdG9yVXBkYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvbkNvbm5lY3RvclVubG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9xdWV1ZUxpc3QucHVzaChjaGlsZE5vZGUubG9hZENoaWxkcmVuKGNoaWxkTm9kZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Eb21haW5Qb3J0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wb3J0c1tjaGlsZElkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVHlwZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdDbGFzcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uUG9ydFVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25Qb3J0VW5sb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL3F1ZXVlTGlzdC5wdXNoKGNoaWxkTm9kZS5sb2FkQ2hpbGRyZW4oY2hpbGROb2RlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWxOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuUHJvcGVydHkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbY2hpbGRJZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnRGF0YVR5cGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVR5cGU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnVmFsdWVUeXBlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVyaXZlZDogaXNQcm9wZXJ0eURlcml2ZWQobmV3Q2hpbGQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25Qcm9wZXJ0eVVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblByb3BlcnR5VW5sb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQ29ubmVjdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25uZWN0b3JzW2NoaWxkSWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblBvcnRzOiB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uQ29ubmVjdG9yVXBkYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uQ29ubmVjdG9yVW5sb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9xdWV1ZUxpc3QucHVzaChjaGlsZE5vZGUubG9hZENoaWxkcmVuKGNoaWxkTm9kZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkRvbWFpblBvcnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnBvcnRzW2NoaWxkSWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdUeXBlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0NsYXNzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblBvcnRVcGRhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25Qb3J0VW5sb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXG5cblxuLyoqXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxuICovXG5cblxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcbiAgICAuc2VydmljZSgnY29tcG9uZW50U2VydmljZScsIGZ1bmN0aW9uICgkcSwgJHRpbWVvdXQsIG5vZGVTZXJ2aWNlLCBiYXNlQ3lQaHlTZXJ2aWNlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIHdhdGNoZXJzID0ge307XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIGNvbXBvbmVudCBmcm9tIHRoZSBjb250ZXh0IChkYi9wcm9qZWN0L2JyYW5jaCkuXG4gICAgICAgICAqIEBwYXJhbSBjb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLCBOLkIuIGRvZXMgbm90IG5lZWQgdG8gc3BlY2lmeSByZWdpb24uXG4gICAgICAgICAqIEBwYXJhbSBjb21wb25lbnRJZFxuICAgICAgICAgKiBAcGFyYW0gW21zZ10gLSBDb21taXQgbWVzc2FnZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlQ29tcG9uZW50ID0gZnVuY3Rpb24gKGNvbnRleHQsIGNvbXBvbmVudElkLCBtc2cpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbXNnIHx8ICdDb21wb25lbnRTZXJ2aWNlLmRlbGV0ZUNvbXBvbmVudCAnICsgY29tcG9uZW50SWQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5kZXN0cm95Tm9kZShjb250ZXh0LCBjb21wb25lbnRJZCwgbWVzc2FnZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIGdpdmVuIGF0dHJpYnV0ZXNcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgY29tcG9uZW50LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBjb21wb25lbnQuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LnJlZ2lvbklkIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGNvbXBvbmVudC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbXBvbmVudElkIC0gUGF0aCB0byBjb21wb25lbnQuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhdHRycyAtIEtleXMgYXJlIG5hbWVzIG9mIGF0dHJpYnV0ZXMgYW5kIHZhbHVlcyBhcmUgdGhlIHdhbnRlZCB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0Q29tcG9uZW50QXR0cmlidXRlcyA9IGZ1bmN0aW9uIChjb250ZXh0LCBjb21wb25lbnRJZCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLnNldE5vZGVBdHRyaWJ1dGVzKGNvbnRleHQsIGNvbXBvbmVudElkLCBhdHRycyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBXYXRjaGVzIGFsbCBjb21wb25lbnRzIChleGlzdGVuY2UgYW5kIHRoZWlyIGF0dHJpYnV0ZXMpIG9mIGEgd29ya3NwYWNlLlxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cbiAgICAgICAgICogQHBhcmFtIHdvcmtzcGFjZUlkXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuICBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLmNvbXBvbmVudHMuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhdm1JZHMgLSBBbiBvcHRpb25hbCBmaWx0ZXIgdGhhdCBvbmx5IHdhdGNoZXMgY29tcG9uZW50cyB3aXRoIElEcyB0aGF0IGV2YWx1YXRlcyB0byB0cnVlLlxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud2F0Y2hDb21wb25lbnRzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCBhdm1JZHMsIHVwZGF0ZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hDb21wb25lbnRzJyxcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IHt9IC8vIGNvbXBvbmVudCB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIGF2bUlkOiA8c3RyaW5nPiwgcmVzb3VyY2U6IDxoYXNofHN0cmluZz4sIGNsYXNzaWZpY2F0aW9uczogPHN0cmluZz4gfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBdm1JRCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJRCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UmVzb3VyY2UgPSB0aGlzLmdldEF0dHJpYnV0ZSgnUmVzb3VyY2UnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NsYXNzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0NsYXNzaWZpY2F0aW9ucycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLm5hbWUgPSBuZXdOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlc2MgIT09IGRhdGEuY29tcG9uZW50c1tpZF0uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0uZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0F2bUlEICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLmF2bUlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLmF2bUlkID0gbmV3QXZtSUQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UmVzb3VyY2UgIT09IGRhdGEuY29tcG9uZW50c1tpZF0ucmVzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0ucmVzb3VyY2UgPSBuZXdSZXNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdDbGFzcyAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5jbGFzc2lmaWNhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0uY2xhc3NpZmljYXRpb25zID0gbmV3Q2xhc3M7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdDb21wb25lbnRTZXJ2aWNlIGZvdW5kIHVwZGF0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLmNvbXBvbmVudHNbaWRdfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuY29tcG9uZW50c1tpZF07XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1Db21wb25lbnRNb2RlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhdm1JZHMgfHwgYXZtSWRzLmhhc093blByb3BlcnR5KGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lEJykpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbY29tcG9uZW50SWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdm1JZDogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSUQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnUmVzb3VyY2UnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2lmaWNhdGlvbnM6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0NsYXNzaWZpY2F0aW9ucycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudElkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhdm1JZHMgfHwgYXZtSWRzLmhhc093blByb3BlcnR5KG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSUQnKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tjb21wb25lbnRJZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNvbXBvbmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdm1JZDogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJRCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ1Jlc291cmNlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NpZmljYXRpb25zOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0NsYXNzaWZpY2F0aW9ucycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25VbmxvYWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY29tcG9uZW50SWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb21wb25lbnRzW2NvbXBvbmVudElkXX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFDTUZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGRvbWFpbi1tb2RlbHMgb2YgYSBjb21wb25lbnQuXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxuICAgICAgICAgKiBAcGFyYW0gY29tcG9uZW50SWRcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLndhdGNoQ29tcG9uZW50RG9tYWlucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBjb21wb25lbnRJZCwgdXBkYXRlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbXBvbmVudERvbWFpbnNfJyArIGNvbXBvbmVudElkLFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGNvbXBvbmVudElkLFxuICAgICAgICAgICAgICAgICAgICBkb21haW5Nb2RlbHM6IHt9ICAgLy9kb21haW5Nb2RlbDogaWQ6IDxzdHJpbmc+LCB0eXBlOiA8c3RyaW5nPlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25Eb21haW5Nb2RlbFVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VHlwZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdUeXBlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdUeXBlICE9PSBkYXRhLmRvbWFpbk1vZGVsc1tpZF0udHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kb21haW5Nb2RlbHNbaWRdLnR5cGUgPSBuZXdUeXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uRG9tYWluTW9kZWxVbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuZG9tYWluTW9kZWxzW2lkXTtcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgY29tcG9uZW50SWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjb21wb25lbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnROb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gY2hpbGROb2RlLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuRG9tYWluTW9kZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRvbWFpbk1vZGVsc1tjaGlsZElkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdUeXBlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25Eb21haW5Nb2RlbFVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25Eb21haW5Nb2RlbFVubG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Tm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkRvbWFpbk1vZGVsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kb21haW5Nb2RlbHNbY2hpbGRJZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdUeXBlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvbkRvbWFpbk1vZGVsVXBkYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uRG9tYWluTW9kZWxVbmxvYWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY2hpbGRJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaEludGVyZmFjZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgaWQsIHVwZGF0ZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS53YXRjaEludGVyZmFjZXMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGlkLCB1cGRhdGVMaXN0ZW5lcik7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0KTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbi5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCByZWdpb25JZCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlci5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVnaXN0ZXJXYXRjaGVyID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGZuKSB7XG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgZm4pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nQ29udGV4dCA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgICAgICAgICBub2RlU2VydmljZS5sb2dDb250ZXh0KGNvbnRleHQpO1xuICAgICAgICB9O1xuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBXZWJHTUVHbG9iYWwqL1xuXG4vKipcbiAqIFRoaXMgc2VydmljZSBjb250YWlucyBtZXRob2RzIGZvciBkZXNpZ24gc3BhY2UgZXhwbG9yYXRpb24gdGhyb3VnaCB0aGUgRXhlY3V0b3IgQ2xpZW50LlxuICpcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcbiAgICAuc2VydmljZSgnZGVzZXJ0U2VydmljZScsIGZ1bmN0aW9uICgkcSwgJGludGVydmFsLCBmaWxlU2VydmljZSwgZXhlY3V0b3JTZXJ2aWNlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgQ01EU1RSLFxuICAgICAgICAgICAgeG1sVG9Kc29uID0gbmV3IFdlYkdNRUdsb2JhbC5jbGFzc2VzLkNvbnZlcnRlcnMuWG1sMmpzb24oe1xuICAgICAgICAgICAgICAgIHNraXBXU1RleHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgYXJyYXlFbGVtZW50czoge1xuICAgICAgICAgICAgICAgICAgICBDb25maWd1cmF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBFbGVtZW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBOYXR1cmFsTWVtYmVyOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBBbHRlcm5hdGl2ZUFzc2lnbm1lbnQ6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGpzb25Ub1htbCA9IG5ldyBXZWJHTUVHbG9iYWwuY2xhc3Nlcy5Db252ZXJ0ZXJzLkpzb24yeG1sKCk7XG5cbiAgICAgICAgdGhpcy5jYWxjdWxhdGVDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uIChkZXNlcnRJbnB1dCkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICAgICAgaWYgKChkZXNlcnRJbnB1dC5kZXNlcnRTeXN0ZW0gJiYgYW5ndWxhci5pc09iamVjdChkZXNlcnRJbnB1dC5kZXNlcnRTeXN0ZW0pICYmXG4gICAgICAgICAgICAgICAgYW5ndWxhci5pc09iamVjdChkZXNlcnRJbnB1dC5pZE1hcCkpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnZGVzZXJ0SW5wdXQgbXVzdCBjb250YWluIGEgZGVzZXJ0U3lzdGVtIGFuZCBpZE1hcCBvYmplY3QhJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuc2F2ZURlc2VydElucHV0KGRlc2VydElucHV0LmRlc2VydFN5c3RlbSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaW5wdXRIYXNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTYXZlZCBkZXNlcnRJbnB1dCcsIGZpbGVTZXJ2aWNlLmdldERvd25sb2FkVXJsKGlucHV0SGFzaCkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jcmVhdGVBbmRSdW5Kb2IoaW5wdXRIYXNoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChqb2JJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdKb2Igc3VjY2VlZGVkIGZpbmFsIGpvYkluZm8nLCBqb2JJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZXh0cmFjdENvbmZpZ3VyYXRpb25zKGpvYkluZm8sIGRlc2VydElucHV0LmlkTWFwKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjb25maWd1cmF0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNvbmZpZ3VyYXRpb25zKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnQ2FsY3VsYXRpbmcgY29uZmlndXJhdGlvbnMgZmFpbGVkLCBlcnI6ICcgKyBlcnIudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2F2ZURlc2VydElucHV0ID0gZnVuY3Rpb24gKGRlc2VydFN5c3RlbSkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICBhcnRpZmFjdCxcbiAgICAgICAgICAgICAgICB4bWxTdHJpbmc7XG5cbiAgICAgICAgICAgIGFydGlmYWN0ID0gZmlsZVNlcnZpY2UuY3JlYXRlQXJ0aWZhY3QoJ2Rlc2VydC1pbnB1dCcpO1xuICAgICAgICAgICAgeG1sU3RyaW5nID0ganNvblRvWG1sLmNvbnZlcnRUb1N0cmluZyhkZXNlcnRTeXN0ZW0pO1xuXG4gICAgICAgICAgICBmaWxlU2VydmljZS5hZGRGaWxlQXNTb2Z0TGlua1RvQXJ0aWZhY3QoYXJ0aWZhY3QsICdkZXNlcnRJbnB1dC54bWwnLCB4bWxTdHJpbmcpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGhhc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4ZWNDb25maWcgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY21kOiAncnVuX2Rlc2VydC5jbWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdEFydGlmYWN0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdhbGwnLCByZXN1bHRQYXR0ZXJuczogW10gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIG51bGwsIDQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXNUb0FkZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZXhlY3V0b3JfY29uZmlnLmpzb24nOiBleGVjQ29uZmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdydW5fZGVzZXJ0LmNtZCc6IENNRFNUUlxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVTZXJ2aWNlLmFkZEZpbGVzVG9BcnRpZmFjdChhcnRpZmFjdCwgZmlsZXNUb0FkZCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaGFzaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWxlU2VydmljZS5zYXZlQXJ0aWZhY3QoYXJ0aWZhY3QpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGFydGllSGFzaCkge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGFydGllSGFzaCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0NvdWxkIG5vdCBzYXZlIERlc2VydElucHV0IHRvIGJsb2IsIGVycjogXCInICsgcmVhc29uICsgJ1wiJyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY3JlYXRlQW5kUnVuSm9iID0gZnVuY3Rpb24gKGlucHV0SGFzaCkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIGV4ZWN1dG9yU2VydmljZS5jcmVhdGVKb2Ioe2hhc2g6IGlucHV0SGFzaCwgbGFiZWxzOiBbXX0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcDtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjdXRvclNlcnZpY2UuZ2V0SW5mbyhpbnB1dEhhc2gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGpvYkluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKEpTT04uc3RyaW5naWZ5KGpvYkluZm8sIG51bGwsIDQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpvYkluZm8uc3RhdHVzID09PSAnQ1JFQVRFRCcgfHwgam9iSW5mby5zdGF0dXMgPT09ICdSVU5OSU5HJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwoc3RvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqb2JJbmZvLnN0YXR1cyA9PT0gJ1NVQ0NFU1MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGpvYkluZm8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KEpTT04uc3RyaW5naWZ5KGpvYkluZm8sIG51bGwsIDQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChzdG9wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdDb3VsZCBub3Qgb2J0YWluIGpvYkluZm8gZm9yIGRlc2VydCcgKyBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdDb3VsZCBub3QgY3JlYXRlIGpvYicgKyBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmV4dHJhY3RDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uIChqb2JJbmZvLCBpZE1hcCkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIGlmICgoam9iSW5mby5yZXN1bHRIYXNoZXMgJiYgam9iSW5mby5yZXN1bHRIYXNoZXMuYWxsKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0pvYkluZm8gZGlkIG5vdCBjb250YWluIHJlc3VsdEhhc2hlcy5hbGwnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGVTZXJ2aWNlLmdldE1ldGFkYXRhKGpvYkluZm8ucmVzdWx0SGFzaGVzLmFsbClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAobWV0YWRhdGEpIHtcbi8vICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBEZWFsIHdpdGggY29uZmlncyB3aGVuIHRoZXJlJ3MgY29uc3RyYWludHNcbi8vICAgICAgICAgICAgICAgICAgICBpZiAoIW1ldGFkYXRhLmNvbnRlbnQuaGFzT3duUHJvcGVydHkoJ2Rlc2VydElucHV0X2NvbmZpZ3MueG1sJykpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdEZXNlcnQgZGlkIG5vdCBnZW5lcmF0ZSBhIFwiZGVzZXJ0SW5wdXRfY29uZmlncy54bWxcIi4nKTtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuLy8gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtZXRhZGF0YS5jb250ZW50Lmhhc093blByb3BlcnR5KCdkZXNlcnRJbnB1dF9iYWNrLnhtbCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0Rlc2VydCBkaWQgbm90IGdlbmVyYXRlIGEgZGVzZXJ0SW5wdXRfYmFjay54bWwuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsZVNlcnZpY2UuZ2V0T2JqZWN0KG1ldGFkYXRhLmNvbnRlbnRbJ2Rlc2VydElucHV0X2JhY2sueG1sJ10uY29udGVudCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29udGVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGVzZXJ0T2JqZWN0ID0geG1sVG9Kc29uLmNvbnZlcnRGcm9tQnVmZmVyKGNvbnRlbnQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzZXJ0QmFja1N5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGosXG4gICAgICAgICAgICAgICAgICAgICAgICBrLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsdEFzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtSWRUb1BhdGggPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVzZXJ0T2JqZWN0IGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnT3V0cHV0IGRlc2VydCBYTUwgbm90IHZhbGlkIHhtbCwgZXJyOiAnICsgZGVzZXJ0T2JqZWN0Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRlc2VydEJhY2tTeXN0ZW0gPSBkZXNlcnRPYmplY3QuRGVzZXJ0QmFja1N5c3RlbTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVzZXJ0QmFja1N5c3RlbS5FbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgZGVzZXJ0QmFja1N5c3RlbS5FbGVtZW50Lmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbSA9IGRlc2VydEJhY2tTeXN0ZW0uRWxlbWVudFtqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtSWRUb1BhdGhbZWxlbVsnQF9pZCddXSA9IGlkTWFwW2VsZW1bJ0BleHRlcm5hbElEJ11dO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBkZXNlcnRCYWNrU3lzdGVtLkNvbmZpZ3VyYXRpb24ubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNmZyA9IGRlc2VydEJhY2tTeXN0ZW0uQ29uZmlndXJhdGlvbltqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNmZ1snQG5hbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2ZnWydAaWQnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcgPSBjb25maWd1cmF0aW9uc1tjb25maWd1cmF0aW9ucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjZmcuQWx0ZXJuYXRpdmVBc3NpZ25tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChrID0gMDsgayA8IGNmZy5BbHRlcm5hdGl2ZUFzc2lnbm1lbnQubGVuZ3RoOyBrICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0QXNzID0gY2ZnLkFsdGVybmF0aXZlQXNzaWdubWVudFtrXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLmFsdGVybmF0aXZlQXNzaWdubWVudHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEFsdGVybmF0aXZlOiBlbGVtSWRUb1BhdGhbYWx0QXNzWydAYWx0ZXJuYXRpdmVfZW5kXyddXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlT2Y6IGVsZW1JZFRvUGF0aFthbHRBc3NbJ0BhbHRlcm5hdGl2ZV9vZl9lbmRfJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNvbmZpZ3VyYXRpb25zKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jYWxjdWxhdGVDb25maWd1cmF0aW9uc0R1bW15ID0gZnVuY3Rpb24gKGRlc2VydElucHV0KSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGlucHV0QXJ0aWZhY3QsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJDb25mLiBubzogMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRBbHRlcm5hdGl2ZTogXCIvMjEzMDAxNzgzNC81NDI1NzE0OTQvMTY0NjA1OTQyMi81NjQzMTIxNDgvOTEwNzM4MTVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVPZjogXCIvMjEzMDAxNzgzNC81NDI1NzE0OTQvMTY0NjA1OTQyMi81NjQzMTIxNDhcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IDIsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkNvbmYuIG5vOiAyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEFsdGVybmF0aXZlOiBcIi8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OC8xNDMzNDcxNzg5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlT2Y6IFwiLzIxMzAwMTc4MzQvNTQyNTcxNDk0LzE2NDYwNTk0MjIvNTY0MzEyMTQ4XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJDb25mLiBubzogM1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRBbHRlcm5hdGl2ZTogXCIvMjEzMDAxNzgzNC81NDI1NzE0OTQvMTY0NjA1OTQyMi81NjQzMTIxNDgvMTQ5MzkwNzI2NFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZU9mOiBcIi8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogNCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiQ29uZi4gbm86IDRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlQXNzaWdubWVudHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQWx0ZXJuYXRpdmU6IFwiLzIxMzAwMTc4MzQvNTQyNTcxNDk0LzE2NDYwNTk0MjIvNTY0MzEyMTQ4LzE3Njc1MjE2MjFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVPZjogXCIvMjEzMDAxNzgzNC81NDI1NzE0OTQvMTY0NjA1OTQyMi81NjQzMTIxNDhcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoY29uZmlndXJhdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXREZXNlcnRJbnB1dERhdGEgPSBmdW5jdGlvbiAoZGVzaWduU3RydWN0dXJlRGF0YSkge1xuICAgICAgICAgICAgdmFyIGRlc2VydFN5c3RlbSxcbiAgICAgICAgICAgICAgICBpZE1hcCA9IHt9LFxuICAgICAgICAgICAgICAgIGlkQ291bnRlciA9IDQsXG4gICAgICAgICAgICAgICAgcm9vdENvbnRhaW5lciA9IGRlc2lnblN0cnVjdHVyZURhdGEuY29udGFpbmVyc1tkZXNpZ25TdHJ1Y3R1cmVEYXRhLnJvb3RJZF0sXG4gICAgICAgICAgICAgICAgcG9wdWxhdGVEYXRhUmVjID0gZnVuY3Rpb24gKGNvbnRhaW5lciwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gY29udGFpbmVyLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIuY29tcG9uZW50cy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhID0gY29udGFpbmVyLmNvbXBvbmVudHNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZENvdW50ZXIgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA9IGlkQ291bnRlci50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkTWFwW2lkXSA9IGNoaWxkRGF0YS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LkVsZW1lbnQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAX2lkJzogJ2lkJyArIGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGRlY29tcG9zaXRpb24nOiAnZmFsc2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGV4dGVybmFsSUQnOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BpZCc6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQG5hbWUnOiBjaGlsZERhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0VsZW1lbnQnOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGNvbnRhaW5lci5zdWJDb250YWluZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyLnN1YkNvbnRhaW5lcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkRGF0YSA9IGNvbnRhaW5lci5zdWJDb250YWluZXJzW2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRDb3VudGVyICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQgPSBpZENvdW50ZXIudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZE1hcFtpZF0gPSBjaGlsZERhdGEuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5FbGVtZW50LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQF9pZCc6ICdpZCcgKyBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BkZWNvbXBvc2l0aW9uJzogKGNoaWxkRGF0YS50eXBlID09PSAnQ29tcG91bmQnKS50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGV4dGVybmFsSUQnOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BpZCc6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQG5hbWUnOiBjaGlsZERhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0VsZW1lbnQnOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVsYXRlRGF0YVJlYyhjaGlsZERhdGEsIGVsZW1lbnQuRWxlbWVudFtlbGVtZW50LkVsZW1lbnQubGVuZ3RoIC0gMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGRlc2VydFN5c3RlbSA9IHtcbiAgICAgICAgICAgICAgICAnRGVzZXJ0U3lzdGVtJzoge1xuICAgICAgICAgICAgICAgICAgICAnQHhtbG5zOnhzaSc6ICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZScsXG4gICAgICAgICAgICAgICAgICAgICdAU3lzdGVtTmFtZSc6ICcnLFxuICAgICAgICAgICAgICAgICAgICAnQHhzaTpub05hbWVzcGFjZVNjaGVtYUxvY2F0aW9uJzogJ0Rlc2VydElmYWNlLnhzZCcsXG4gICAgICAgICAgICAgICAgICAgICdDb25zdHJhaW50U2V0Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0BfaWQnOiAnaWQxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdAZXh0ZXJuYWxJRCc6ICcxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdAaWQnOiAnMScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQG5hbWUnOiAnY29uc3RyYWludHMnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdGb3JtdWxhU2V0Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0BfaWQnOiAnaWQyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdAZXh0ZXJuYWxJRCc6ICcyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdAaWQnOiAnMicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQG5hbWUnOiAnZm9ybXVsYVNldCdcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ1NwYWNlJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0BfaWQnOiAnaWQzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdAZGVjb21wb3NpdGlvbic6ICd0cnVlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdAZXh0ZXJuYWxJRCc6ICczJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdAaWQnOiAnMycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQG5hbWUnOiAnRGVzaWduU3BhY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0VsZW1lbnQnOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQF9pZCc6ICdpZDQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGRlY29tcG9zaXRpb24nOiAndHJ1ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAZXh0ZXJuYWxJRCc6ICc0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BpZCc6ICc0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BuYW1lJzogcm9vdENvbnRhaW5lci5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRWxlbWVudCc6IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHBvcHVsYXRlRGF0YVJlYyhyb290Q29udGFpbmVyLCBkZXNlcnRTeXN0ZW0uRGVzZXJ0U3lzdGVtLlNwYWNlLkVsZW1lbnRbMF0pO1xuXG4gICAgICAgICAgICByZXR1cm4geyBkZXNlcnRTeXN0ZW06IGRlc2VydFN5c3RlbSwgaWRNYXA6IGlkTWFwIH07XG4gICAgICAgIH07XG5cbiAgICAgICAgQ01EU1RSID0gW1xuICAgICAgICAgICAgJzo6IFJ1bnMgPC1EZXNlcnRUb29scy5leGUtPiBkZXNlcnRJbnB1dC54bWwgL20nLFxuICAgICAgICAgICAgJ0VDSE8gb2ZmJyxcbiAgICAgICAgICAgICdwdXNoZCAlfmRwMCcsXG4gICAgICAgICAgICAnJVN5c3RlbVJvb3QlXFxcXFN5c1dvVzY0XFxcXFJFRy5leGUgcXVlcnkgXCJIS0xNXFxcXHNvZnR3YXJlXFxcXE1FVEFcIiAvdiBcIk1FVEFfUEFUSFwiJyxcbiAgICAgICAgICAgICdTRVQgUVVFUllfRVJST1JMRVZFTD0lRVJST1JMRVZFTCUnLFxuICAgICAgICAgICAgJ0lGICVRVUVSWV9FUlJPUkxFVkVMJSA9PSAwICgnLFxuICAgICAgICAgICAgJyAgICAgICAgRk9SIC9GIFwic2tpcD0yIHRva2Vucz0yLCpcIiAlJUEgSU4gKFxcJyVTeXN0ZW1Sb290JVxcXFxTeXNXb1c2NFxcXFxSRUcuZXhlIHF1ZXJ5IFwiSEtMTVxcXFxzb2Z0d2FyZVxcXFxNRVRBXCIgL3YgXCJNRVRBX1BBVEhcIlxcJykgRE8gU0VUIE1FVEFfUEFUSD0lJUIpJyxcbiAgICAgICAgICAgICdTRVQgREVTRVJUX0VYRT1cIiVNRVRBX1BBVEglXFxcXGJpblxcXFxEZXNlcnRUb29sLmV4ZVwiJyxcbiAgICAgICAgICAgICcgICBJRiBFWElTVCAlREVTRVJUX0VYRSUgKCcsXG4gICAgICAgICAgICAnICAgICAgIFJFTSBJbnN0YWxsZXIgbWFjaGluZS4nLFxuICAgICAgICAgICAgJyAgICAgICAlREVTRVJUX0VYRSUgZGVzZXJ0SW5wdXQueG1sIC9jIFwiYXBwbHlBbGxcIicsXG4gICAgICAgICAgICAnICAgKSBFTFNFIElGIEVYSVNUIFwiJU1FVEFfUEFUSCVcXFxcc3JjXFxcXGJpblxcXFxEZXNlcnRUb29sLmV4ZVwiICgnLFxuICAgICAgICAgICAgJyAgICAgICBSRU0gRGV2ZWxvcGVyIG1hY2hpbmUuJyxcbiAgICAgICAgICAgICcgICAgICAgXCIlTUVUQV9QQVRIJVxcXFxzcmNcXFxcYmluXFxcXERlc2VydFRvb2wuZXhlXCIgZGVzZXJ0SW5wdXQueG1sIC9jIFwiYXBwbHlBbGxcIicsXG4gICAgICAgICAgICAnICAgKSBFTFNFICgnLFxuICAgICAgICAgICAgJyAgICAgICBFQ0hPIG9uJyxcbiAgICAgICAgICAgICcgICAgICAgRUNITyBDb3VsZCBub3QgZmluZCBEZXNlcnRUb29sLmV4ZSEnLFxuICAgICAgICAgICAgJyAgICAgICBFWElUIC9CIDMnLFxuICAgICAgICAgICAgJyAgICknLFxuICAgICAgICAgICAgJyknLFxuICAgICAgICAgICAgJ0lGICVRVUVSWV9FUlJPUkxFVkVMJSA9PSAxICgnLFxuICAgICAgICAgICAgJyAgICBFQ0hPIG9uJyxcbiAgICAgICAgICAgICdFQ0hPIFwiTUVUQSB0b29scyBub3QgaW5zdGFsbGVkLlwiID4+IF9GQUlMRUQudHh0JyxcbiAgICAgICAgICAgICdFQ0hPIFwiU2VlIEVycm9yIExvZzogX0ZBSUxFRC50eHRcIicsXG4gICAgICAgICAgICAnRVhJVCAvYiAlUVVFUllfRVJST1JMRVZFTCUnLFxuICAgICAgICAgICAgJyknLFxuICAgICAgICAgICAgJ3BvcGQnXS5qb2luKCdcXG4nKTtcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXG5cbi8qKlxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cbiAqL1xuXG5cbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXG4gICAgLnNlcnZpY2UoJ2Rlc2lnblNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsICR0aW1lb3V0LCAkbG9jYXRpb24sICRtb2RhbCwgZ3Jvd2wsIG5vZGVTZXJ2aWNlLCBiYXNlQ3lQaHlTZXJ2aWNlLCBwbHVnaW5TZXJ2aWNlLCBmaWxlU2VydmljZSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIHdhdGNoZXJzID0ge307XG5cbiAgICAgICAgdGhpcy5lZGl0RGVzaWduRm4gPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvRGVzaWduRWRpdC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnRGVzaWduRWRpdENvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgIC8vc2l6ZTogc2l6ZSxcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7IGRhdGE6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRhdGE7IH0gfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKGVkaXRlZERhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXR0cnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICduYW1lJzogZWRpdGVkRGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAnSU5GTyc6IGVkaXRlZERhdGEuZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0RGVzaWduQXR0cmlidXRlcyhkYXRhLmNvbnRleHQsIGRhdGEuaWQsIGF0dHJzKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXR0cmlidXRlIHVwZGF0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5leHBvcnRBc0FkbUZuID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYuZXhwb3J0RGVzaWduKGRhdGEuY29udGV4dCwgZGF0YS5pZClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZG93bmxvYWRVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcygnQURNIGZpbGUgZm9yIDxhIGhyZWY9XCInICsgZG93bmxvYWRVcmwgKyAnXCI+JyArIGRhdGEubmFtZSArICc8L2E+IGV4cG9ydGVkLicpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xuICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcignRXhwb3J0IGZhaWxlZCwgc2VlIGNvbnNvbGUgZm9yIGRldGFpbHMuJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZWxldGVGbiA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9TaW1wbGVNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2ltcGxlTW9kYWxDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUgRGVzaWduIFNwYWNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiAnVGhpcyB3aWxsIGRlbGV0ZSAnICsgZGF0YS5uYW1lICsgJyBmcm9tIHRoZSB3b3Jrc3BhY2UuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRlbGV0ZURlc2lnbihkYXRhLmNvbnRleHQsIGRhdGEuaWQpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBkZXNpZ24gZnJvbSB0aGUgY29udGV4dC5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gZGF0YS1iYXNlIGNvbm5lY3Rpb24uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkZXNpZ25JZCAtIFBhdGggdG8gZGVzaWduLXNwYWNlLlxuICAgICAgICAgKiBAcGFyYW0gW21zZ10gLSBDb21taXQgbWVzc2FnZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlRGVzaWduID0gZnVuY3Rpb24gKGNvbnRleHQsIGRlc2lnbklkLCBtc2cpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbXNnIHx8ICdkZXNpZ25TZXJ2aWNlLmRlbGV0ZURlc2lnbiAnICsgZGVzaWduSWQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5kZXN0cm95Tm9kZShjb250ZXh0LCBkZXNpZ25JZCwgbWVzc2FnZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIGdpdmVuIGF0dHJpYnV0ZXNcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgZGVzaWduLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBkZXNpZ24uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LnJlZ2lvbklkIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGRlc2lnbi5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGRlc2lnbklkIC0gUGF0aCB0byBkZXNpZ24tc3BhY2UuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhdHRycyAtIEtleXMgYXJlIG5hbWVzIG9mIGF0dHJpYnV0ZXMgYW5kIHZhbHVlcyBhcmUgdGhlIHdhbnRlZCB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0RGVzaWduQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChjb250ZXh0LCBkZXNpZ25JZCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLnNldE5vZGVBdHRyaWJ1dGVzKGNvbnRleHQsIGRlc2lnbklkLCBhdHRycyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGxzIEFkbUV4cG9ydGVyLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIENvbnRleHQgZm9yIHBsdWdpbi5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBEYXRhYmFzZSBjb25uZWN0aW9uIHRvIHB1bGwgbW9kZWwgZnJvbS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGRlc2lnbklkXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbZGVzZXJ0Q2ZnUGF0aF0gLSBQYXRoIHRvIGNvbmZpZ3VyYXRpb24gaWYgb25seSBvbmUgaXMgdG8gYmUgZXhwb3J0ZWQuXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIHJlc29sdmVzIHRvIHtzdHJpbmd9IGlmIHN1Y2Nlc3NmdWwuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmV4cG9ydERlc2lnbiA9IGZ1bmN0aW9uIChjb250ZXh0LCBkZXNpZ25JZCwgZGVzZXJ0Q2ZnUGF0aCkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGU6IGRlc2lnbklkLFxuICAgICAgICAgICAgICAgICAgICBydW5PblNlcnZlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbkNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNtczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNlcnRDZmc6IGRlc2VydENmZ1BhdGggfHwgJydcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKGNvbnRleHQsICdBZG1FeHBvcnRlcicsIGNvbmZpZylcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vXCJ7XCJzdWNjZXNzXCI6dHJ1ZSxcIm1lc3NhZ2VzXCI6W10sXCJhcnRpZmFjdHNcIjpbXSxcInBsdWdpbk5hbWVcIjpcIkFETSBJbXBvcnRlclwiLFxuICAgICAgICAgICAgICAgICAgICAvLyBcInN0YXJ0VGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS4zODNaXCIsXCJmaW5pc2hUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjkzOVpcIixcImVycm9yXCI6bnVsbH1cIlxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGZpbGVTZXJ2aWNlLmdldERvd25sb2FkVXJsKHJlc3VsdC5hcnRpZmFjdHNbMF0pKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVzdWx0LmVycm9yICsgJyBtZXNzYWdlczogJyArIGFuZ3VsYXIudG9Kc29uKHJlc3VsdC5tZXNzYWdlcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYW5ndWxhci50b0pzb24ocmVzdWx0Lm1lc3NhZ2VzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcgJyArIHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZW5lcmF0ZURhc2hib2FyZCA9IGZ1bmN0aW9uIChjb250ZXh0LCBkZXNpZ25JZCwgcmVzdWx0SWRzKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogZGVzaWduSWQsXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uU2VydmVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRJRHM6IHJlc3VsdElkcy5qb2luKCc7JylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShjb25maWcpKTtcbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKGNvbnRleHQsICdHZW5lcmF0ZURhc2hib2FyZCcsIGNvbmZpZylcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHRMaWdodCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHJlc3VsdC5zdWNjZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWZhY3RzSHRtbDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlczogcmVzdWx0Lm1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVzdWx0XCIsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHBsdWdpblNlcnZpY2UuZ2V0UGx1Z2luQXJ0aWZhY3RzSHRtbChyZXN1bHQuYXJ0aWZhY3RzKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGFydGlmYWN0c0h0bWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRMaWdodC5hcnRpZmFjdHNIdG1sID0gYXJ0aWZhY3RzSHRtbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdExpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdTb21ldGhpbmcgd2VudCB0ZXJyaWJseSB3cm9uZywgJyArIHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMud2F0Y2hEZXNpZ25Ob2RlID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGRlc2lnbklkLCB1cGRhdGVMaXN0ZW5lcikge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoRGVzaWduJyxcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIG1ldGE6IG51bGwsIC8vIE1FVEEgbm9kZXMgLSBuZWVkZWQgd2hlbiBjcmVhdGluZyBuZXcgbm9kZXMuLi5cbiAgICAgICAgICAgICAgICAgICAgZGVzaWduOiB7fSAvLyBkZXNpZ24ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPiwgbm9kZSA8Tm9kZU9iaj59XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEuZGVzaWduLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduLm5hbWUgPSBuZXdOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlc2MgIT09IGRhdGEuZGVzaWduLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbi5kZXNjcmlwdGlvbiA9IG5ld0Rlc2M7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLmRlc2lnbn0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBkZXNpZ25JZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRlc2lnbk5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubWV0YSA9IG1ldGE7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGVzaWduSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZGVzaWduTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzaWduTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlOiBkZXNpZ25Ob2RlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgV2F0Y2hlcyBhbGwgY29udGFpbmVycyAoZXhpc3RlbmNlIGFuZCB0aGVpciBhdHRyaWJ1dGVzKSBvZiBhIHdvcmtzcGFjZS5cbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB3b3Jrc3BhY2VJZFxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLiBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLmRlc2lnbnMuXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaERlc2lnbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hEZXNpZ25zJyxcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIGRlc2lnbnM6IHt9IC8vIGRlc2lnbiB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+fVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLmRlc2lnbnNbaWRdLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduc1tpZF0ubmFtZSA9IG5ld05hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS5kZXNpZ25zW2lkXS5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ25zW2lkXS5kZXNjcmlwdGlvbiA9IG5ld0Rlc2M7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLmRlc2lnbnNbaWRdfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuZGVzaWduc1tpZF07XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbklkID0gY2hpbGROb2RlLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduc1tkZXNpZ25JZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGVzaWduSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbnNbZGVzaWduSWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRlc2lnbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJTkZPJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25VbmxvYWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogZGVzaWduSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5kZXNpZ25zW2Rlc2lnbklkXX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgV2F0Y2hlcyBhbGwgY29udGFpbmVycyAoZXhpc3RlbmNlIGFuZCB0aGVpciBhdHRyaWJ1dGVzKSBvZiBhIHdvcmtzcGFjZS5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkZXNpZ25JZFxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaE5ick9mQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZGVzaWduSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOYnJPZkNvbmZpZ3VyYXRpb25zXycgKyBkZXNpZ25JZCxcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRzOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiAwXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdhdGNoQ29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uIChjZmdOb2RlLCBtZXRhLCB3YXNDcmVhdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjZmdEZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRPblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMucmVzdWx0cyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGF9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIC8vIENvdW50IHRoaXMgc2V0IGFuZCBhZGQgYW4gdW5sb2FkIGhhbmRsZS5cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudGVycy5jb25maWd1cmF0aW9ucyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAod2FzQ3JlYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY2ZnTm9kZS5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNmZ05vZGUub25VbmxvYWQoZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLmNvbmZpZ3VyYXRpb25zIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGF9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5SZXN1bHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMucmVzdWx0cyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQocmVzdWx0T25VbmxvYWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNmZ05vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuUmVzdWx0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLnJlc3VsdHMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKHJlc3VsdE9uVW5sb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNmZ0RlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNmZ0RlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3YXRjaENvbmZpZ3VyYXRpb25TZXQgPSBmdW5jdGlvbiAoc2V0Tm9kZSwgbWV0YSwgd2FzQ3JlYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2V0RGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICAgICAvLyBDb3VudCB0aGlzIHNldCBhbmQgYWRkIGFuIHVubG9hZCBoYW5kbGUuXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMuc2V0cyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAod2FzQ3JlYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogc2V0Tm9kZS5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNldE5vZGUub25VbmxvYWQoZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLnNldHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzZXROb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoQ29uZmlndXJhdGlvbihjaGlsZE5vZGUsIG1ldGEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXROb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoQ29uZmlndXJhdGlvbihuZXdDaGlsZCwgbWV0YSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldERlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldERlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldERlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgZGVzaWduSWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkZXNpZ25Ob2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaENvbmZpZ3VyYXRpb25TZXQoY2hpbGROb2RlLCBtZXRhKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvblNldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoQ29uZmlndXJhdGlvblNldChuZXdDaGlsZCwgbWV0YSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgV2F0Y2hlcyBhIGRlc2lnbihzcGFjZSkgdy5yLnQuIGludGVyZmFjZXMuXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxuICAgICAgICAgKiBAcGFyYW0gZGVzaWduSWRcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGRlc2lnbklkLCB1cGRhdGVMaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuIGJhc2VDeVBoeVNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgZnVsbCBoaWVyYXJjaHkgb2YgYSBkZXNpZ24gdy5yLnQuIGNvbnRhaW5lcnMgYW5kIGNvbXBvbmVudHMuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGVzaWduSWQgLSBwYXRoIHRvIHJvb3QgY29udGFpbmVyLlxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaERlc2lnblN0cnVjdHVyZSA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaERlc2lnblN0cnVjdHVyZV8nICsgZGVzaWduSWQsXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxuICAgICAgICAgICAgICAgICAgICByb290SWQ6IGRlc2lnbklkLFxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJzOiB7fSwgLy8gY29udGFpbmVyOiB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgcGFyZW50SWQ6IDxzdHJpbmc+LCB0eXBlOiA8c3RyaW5nPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHN1YkNvbnRhaW5lcnM6IHtpZDo8c3RyaW5nPjogPGNvbnRhaW5lcj59LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgY29tcG9uZW50czogICAge2lkOjxzdHJpbmc+OiA8Y29udGFpbmVyPn19XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IHt9ICAvLyBjb21wb25lbnQ6IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBwYXJlbnRJZDogPHN0cmluZz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAsIGF2bUlkOiA8c3RyaW5nPiB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBnZXRDb21wb25lbnRJbmZvID0gZnVuY3Rpb24gKG5vZGUsIHBhcmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogbm9kZS5nZXRJZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudElkOiBwYXJlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2bUlkOiBub2RlLmdldEF0dHJpYnV0ZSgnSUQnKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tQ29udGFpbmVyUmVjID0gZnVuY3Rpb24gKGNvbnRhaW5lck5vZGUsIHJvb3RDb250YWluZXIsIG1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNvbnRhaW5lck5vZGUuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY29udGFpbmVyTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY29udGFpbmVyTm9kZS5nZXRBdHRyaWJ1dGUoJ1R5cGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViQ29udGFpbmVyczoge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RDb250YWluZXIuc3ViQ29udGFpbmVyc1tjb250YWluZXJOb2RlLmdldElkKCldID0gY29udGFpbmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb250YWluZXJzW2NvbnRhaW5lck5vZGUuZ2V0SWQoKV0gPSBjb250YWluZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Db250YWluZXJSZWMoY2hpbGROb2RlLCBjb250YWluZXIsIG1ldGEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1Db21wb25lbnRNb2RlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50ID0gZ2V0Q29tcG9uZW50SW5mbyhjaGlsZE5vZGUsIGNvbnRhaW5lci5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jb21wb25lbnRzW2NoaWxkTm9kZS5nZXRJZCgpXSA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2NoaWxkTm9kZS5nZXRJZCgpXSA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbi8vICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Db250YWluZXJSZWMobmV3Q2hpbGQsIGNvbnRhaW5lciwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1Db21wb25lbnRNb2RlbCkpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJbY2hpbGROb2RlLmdldElkKCldID0gZ2V0Q29tcG9uZW50SW5mbyhjaGlsZE5vZGUsIGNvbnRhaW5lci5pZCk7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBkZXNpZ25JZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJvb3ROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb290Tm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290Q29udGFpbmVyID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHJvb3ROb2RlLmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnVHlwZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViQ29udGFpbmVyczoge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbnRhaW5lcnNbcm9vdENvbnRhaW5lci5pZF0gPSByb290Q29udGFpbmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVyc1tyb290Q29udGFpbmVyLmlkXSA9IHJvb3RDb250YWluZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUNvbnRhaW5lclJlYyhjaGlsZE5vZGUsIHJvb3RDb250YWluZXIsIG1ldGEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgPSBnZXRDb21wb25lbnRJbmZvKGNoaWxkTm9kZSwgcm9vdENvbnRhaW5lci5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290Q29udGFpbmVyLmNvbXBvbmVudHNbY2hpbGROb2RlLmdldElkKCldID0gY29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2NoaWxkTm9kZS5nZXRJZCgpXSA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tQ29udGFpbmVyUmVjKG5ld0NoaWxkLCByb290Q29udGFpbmVyLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290Q29udGFpbmVyLmNvbXBvbmVudHNbY2hpbGROb2RlLmdldElkKCldID0gZ2V0Q29tcG9uZW50SW5mbyhjaGlsZE5vZGUsIHJvb3RDb250YWluZXIuaWQpO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbi8vXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgZ2VuZXJhdGVkIERlc2VydENvbmZpZ3VyYXRpb25TZXRzIGluc2lkZSBhIERlc2lnbi5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkZXNpZ25JZCAtIHBhdGggdG8gZGVzaWduIG9mIHdoaWNoIHRvIHdhdGNoLlxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaENvbmZpZ3VyYXRpb25TZXRzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGRlc2lnbklkLCB1cGRhdGVMaXN0ZW5lcikge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29uZmlndXJhdGlvblNldHNfJyArIGRlc2lnbklkLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvblNldHM6IHt9IC8vY29uZmlndXJhdGlvblNldCB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+fVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF0gPSBjb250ZXh0O1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBkZXNpZ25JZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRlc2lnbk5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubmFtZSA9IGRlc2lnbk5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLmxvYWRDaGlsZHJlbihjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjaGlsZE5vZGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLmNvbmZpZ3VyYXRpb25TZXRzW2lkXS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29uZmlndXJhdGlvblNldHNbaWRdLm5hbWUgPSBuZXdOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5jb25maWd1cmF0aW9uU2V0c1tpZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkTm9kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGVzW2ldLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IGNoaWxkTm9kZXNbaV0uZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbmZpZ3VyYXRpb25TZXRzW2NoaWxkSWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2Rlc1tpXS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZXNbaV0uZ2V0QXR0cmlidXRlKCdJTkZPJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZXNbaV0ub25VcGRhdGUob25VcGRhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZXNbaV0ub25VbmxvYWQob25VbmxvYWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Tm9kZS5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uU2V0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBuZXdOb2RlLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25maWd1cmF0aW9uU2V0c1tjaGlsZElkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld05vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdOb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlLm9uVXBkYXRlKG9uVXBkYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY2hpbGRJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBnZW5lcmF0ZWQgRGVzZXJ0Q29uZmlndXJhdGlvbnMgaW5zaWRlIGEgRGVzZXJ0Q29uZmlndXJhdGlvblNldHMuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29uZmlndXJhdGlvblNldElkIC0gcGF0aCB0byBEZXNlcnRDb25maWd1cmF0aW9uU2V0IG9mIHdoaWNoIHRvIHdhdGNoLlxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaENvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGNvbmZpZ3VyYXRpb25TZXRJZCwgdXBkYXRlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbmZpZ3VyYXRpb25zXycgKyBjb25maWd1cmF0aW9uU2V0SWQsXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uczoge30gLy9jb25maWd1cmF0aW9uIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiA8c3RyaW5nPn1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bcmVnaW9uSWRdID0gY29udGV4dDtcblxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBjb25maWd1cmF0aW9uU2V0SWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjZmdTZXROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZmdTZXROb2RlLmxvYWRDaGlsZHJlbihjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjaGlsZE5vZGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBbHRBc3MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnQWx0ZXJuYXRpdmVBc3NpZ25tZW50cycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5jb25maWd1cmF0aW9uc1tpZF0ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbmZpZ3VyYXRpb25zW2lkXS5uYW1lID0gbmV3TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdBbHRBc3MgIT09IGRhdGEuY29uZmlndXJhdGlvbnNbaWRdLmFsdGVybmF0aXZlQXNzaWdubWVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25maWd1cmF0aW9uc1tpZF0uYWx0ZXJuYXRpdmVBc3NpZ25tZW50cyA9IG5ld0FsdEFzcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEuY29uZmlndXJhdGlvbnNbaWRdfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbmZpZ3VyYXRpb25zW2lkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5jb25maWd1cmF0aW9uc1tpZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gY2hpbGROb2Rlc1tpXS5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZXNbaV0uaXNNZXRhVHlwZU9mKG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbmZpZ3VyYXRpb25zW2NoaWxkSWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2Rlc1tpXS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogY2hpbGROb2Rlc1tpXS5nZXRBdHRyaWJ1dGUoJ0FsdGVybmF0aXZlQXNzaWdubWVudHMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2Rlc1tpXS5vblVwZGF0ZShvblVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2Rlc1tpXS5vblVubG9hZChvblVubG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZmdTZXROb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld05vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IG5ld05vZGUuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbmZpZ3VyYXRpb25zW2NoaWxkSWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Tm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogbmV3Tm9kZS5nZXRBdHRyaWJ1dGUoJ0FsdGVybmF0aXZlQXNzaWdubWVudHMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Tm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Tm9kZS5vblVubG9hZChvblVubG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb25maWd1cmF0aW9uc1tjaGlsZElkXX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBnZW5lcmF0ZWQgRGVzZXJ0Q29uZmlndXJhdGlvblNldHMgaW5zaWRlIGEgRGVzaWduLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZ3VyYXRpb24gLSBDb25maWd1cmF0aW9uIG9mIHdoaWNoIHRvIHdhdGNoLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29uZmlndXJhdGlvbi5pZCAtIHBhdGggdG8gQ29uZmlndXJhdGlvbiBvZiB3aGljaCB0byB3YXRjaC5cbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hcHBlbmRXYXRjaFJlc3VsdHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoUmVzdWx0c18nICsgY29uZmlndXJhdGlvbi5pZCxcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW3JlZ2lvbklkXSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnJlZ2lvbklkID0gcmVnaW9uSWQ7XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnJlc3VsdHMgPSB7fTtcblxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBjb25maWd1cmF0aW9uLmlkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY2ZnTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZS5sb2FkQ2hpbGRyZW4oY29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY2hpbGROb2Rlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNSZXN1bHRzID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucmVzdWx0c1tpZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjb25maWd1cmF0aW9uLnJlc3VsdHNbaWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IGNoaWxkTm9kZXNbaV0uZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGVzW2ldLmlzTWV0YVR5cGVPZihtZXRhLlJlc3VsdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnJlc3VsdHNbY2hpbGRJZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vbmFtZTogY2hpbGROb2Rlc1tpXS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2hpbGROb2Rlc1tpXS5vblVwZGF0ZShvblVwZGF0ZSk7IFRPRE86IFdoZW4gYXR0cmlidXRlcyBhcmUgd2F0Y2ggYWRkIHRoaXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2Rlc1tpXS5vblVubG9hZChvblVubG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzUmVzdWx0cyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZmdOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld05vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOb2RlLmlzTWV0YVR5cGVPZihtZXRhLlJlc3VsdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gbmV3Tm9kZS5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5yZXN1bHRzW2NoaWxkSWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShoYXNSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jYWxsU2F2ZURlc2VydENvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKGNvbnRleHQsIHNldE5hbWUsIHNldERlc2MsIGNvbmZpZ3VyYXRpb25zLCBkZXNpZ25JZCkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGU6IGRlc2lnbklkLFxuICAgICAgICAgICAgICAgICAgICBydW5PblNlcnZlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbkNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0RGF0YTogYW5ndWxhci50b0pzb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHNldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHNldERlc2MgfHwgJydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IGFuZ3VsYXIudG9Kc29uKGNvbmZpZ3VyYXRpb25zKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcGx1Z2luU2VydmljZS5ydW5QbHVnaW4oY29udGV4dCwgJ1NhdmVEZXNlcnRDb25maWd1cmF0aW9ucycsIGNvbmZpZylcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsICcgKyByZWFzb24pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNhdmVDb25maWd1cmF0aW9uU2V0ID0gZnVuY3Rpb24gKHNldE5hbWUsIHNldERlc2MsIGNvbmZpZ3VyYXRpb25zLCBkZXNpZ25Ob2RlLCBtZXRhKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBkZXNpZ25Ob2RlLmNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5jcmVhdGVOb2RlKGNvbnRleHQsIGRlc2lnbk5vZGUsIG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvblNldCwgJ3dlYi1jeXBoeSBzYXZlQ29uZmlndXJhdGlvblNldCcpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHNldE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvdW50ZXIgPSBjb25maWd1cmF0aW9ucy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVDb25maWcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNmZ05vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmNyZWF0ZU5vZGUoY29udGV4dCwgc2V0Tm9kZSwgbWV0YS5EZXNlcnRDb25maWd1cmF0aW9uLCAnd2ViLWN5cGh5IHNhdmVDb25maWd1cmF0aW9uU2V0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG5ld05vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuYW1lID0gY29uZmlndXJhdGlvbnNbY291bnRlcl0ubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNmZ05vZGUgPSBuZXdOb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNmZ05vZGUuc2V0QXR0cmlidXRlKCduYW1lJywgbmFtZSwgJ3dlYi1jeXBoeSBzZXQgbmFtZSB0byAnICsgbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhYVN0ciA9IEpTT04uc3RyaW5naWZ5KGNvbmZpZ3VyYXRpb25zW2NvdW50ZXJdLmFsdGVybmF0aXZlQXNzaWdubWVudHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNmZ05vZGUuc2V0QXR0cmlidXRlKCdBbHRlcm5hdGl2ZUFzc2lnbm1lbnRzJywgYWFTdHIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd3ZWItY3lwaHkgc2V0IEFsdGVybmF0aXZlQXNzaWdubWVudHMgdG8gJyArIGFhU3RyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29uZmlnKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnUHJvYmxlbXMgY3JlYXRpbmcgY29uZmlndXJhdGlvbnMgbm9kZXMnICsgcmVhc29uLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBzZXROb2RlLnNldEF0dHJpYnV0ZSgnbmFtZScsIHNldE5hbWUsICd3ZWItY3lwaHkgc2V0IG5hbWUgdG8gJyArIHNldE5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNldERlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Tm9kZS5zZXRBdHRyaWJ1dGUoJ0lORk8nLCBzZXREZXNjLCAnd2ViLWN5cGh5IHNldCBJTkZPIHRvICcgKyBzZXREZXNjKS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3VudGVyID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVDb25maWcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ05vIGNvbmZpZ3VyYXRpb25zIGdpdmVuIScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3VudGVyID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29uZmlnKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ05vIGNvbmZpZ3VyYXRpb25zIGdpdmVuIScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucy5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xlYW5VcEFsbFJlZ2lvbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCkge1xuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyh3YXRjaGVycywgcGFyZW50Q29udGV4dCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24uXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsZWFuVXBSZWdpb24gPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgcmVnaW9uSWQpIHtcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgcmVnaW9uSWQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBmbikge1xuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGZuKTtcbiAgICAgICAgfTtcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgV2ViR01FR2xvYmFsLCBjb25zb2xlKi9cblxuLyoqXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxuICovXG5cbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXG4gICAgLnNlcnZpY2UoJ2V4ZWN1dG9yU2VydmljZScsIGZ1bmN0aW9uICgkcSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBleGVjdXRvckNsaWVudCA9IG5ldyBXZWJHTUVHbG9iYWwuY2xhc3Nlcy5FeGVjdXRvckNsaWVudCgpO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlSm9iID0gZnVuY3Rpb24gKGpvYkRhdGEpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICBleGVjdXRvckNsaWVudC5jcmVhdGVKb2Ioam9iRGF0YSwgZnVuY3Rpb24gKGVyciwgam9iSW5mbykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShqb2JJbmZvKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRJbmZvID0gZnVuY3Rpb24gKGpvYkhhc2gpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICBleGVjdXRvckNsaWVudC5nZXRJbmZvKGpvYkhhc2gsIGZ1bmN0aW9uIChlcnIsIGpvYkluZm8pIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoam9iSW5mbyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0V29ya2Vyc0luZm8gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgZXhlY3V0b3JDbGllbnQuZ2V0V29ya2Vyc0luZm8oZnVuY3Rpb24gKGVyciwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgV2ViR01FR2xvYmFsLCBjb25zb2xlKi9cblxuXG4vKipcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcbiAgICAuc2VydmljZSgnZmlsZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHEpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBibG9iQ2xpZW50ID0gbmV3IFdlYkdNRUdsb2JhbC5jbGFzc2VzLkJsb2JDbGllbnQoKTtcblxuICAgICAgICAvL1RPRE86IENvbnNpZGVyIG1ha2luZyBhbiBBcnRpZmFjdCAnQ2xhc3MnLlxuICAgICAgICB0aGlzLmNyZWF0ZUFydGlmYWN0ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBibG9iQ2xpZW50LmNyZWF0ZUFydGlmYWN0KG5hbWUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2F2ZUFydGlmYWN0ID0gZnVuY3Rpb24gKGFydGlmYWN0KSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgYXJ0aWZhY3Quc2F2ZShmdW5jdGlvbiAoZXJyLCBhcnRpZUhhc2gpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYXJ0aWVIYXNoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRBcnRpZmFjdCA9IGZ1bmN0aW9uIChoYXNoKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgYmxvYkNsaWVudC5nZXRBcnRpZmFjdChoYXNoLCBmdW5jdGlvbiAoZXJyLCBhcnRpZmFjdCkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7YXJ0aWZhY3Q6IGFydGlmYWN0LCBoYXNoOiBoYXNofSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYWRkRmlsZVRvQXJ0aWZhY3QgPSBmdW5jdGlvbiAoYXJ0aWZhY3QsIGZpbGVOYW1lLCBjb250ZW50KSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgYXJ0aWZhY3QuYWRkRmlsZShmaWxlTmFtZSwgY29udGVudCwgZnVuY3Rpb24gKGVyciwgaGFzaGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGhhc2hlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGRzIG11bHRpcGxlIGZpbGVzIHRvIGdpdmVuIGFydGlmYWN0LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGRGaWxlc1RvQXJ0aWZhY3QgPSBmdW5jdGlvbiAoYXJ0aWZhY3QsIGZpbGVzKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgYXJ0aWZhY3QuYWRkRmlsZXMoZmlsZXMsIGZ1bmN0aW9uIChlcnIsIGhhc2hlcykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShoYXNoZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmFkZEZpbGVBc1NvZnRMaW5rVG9BcnRpZmFjdCA9IGZ1bmN0aW9uIChhcnRpZmFjdCwgZmlsZU5hbWUsIGNvbnRlbnQpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgICAgIGFydGlmYWN0LmFkZEZpbGVBc1NvZnRMaW5rKGZpbGVOYW1lLCBjb250ZW50LCBmdW5jdGlvbiAoZXJyLCBoYXNoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGhhc2gpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldE1ldGFkYXRhID0gZnVuY3Rpb24gKGhhc2gpIHtcbi8vICAgICAgICBFeGFtcGxlIG9mIHJldHVybmVkIGRhdGEuXG4vLyAgICAgICAge1xuLy8gICAgICAgICAgICBcIm5hbWVcIjogXCJ0YkFzc2V0LnppcFwiLFxuLy8gICAgICAgICAgICBcInNpemVcIjogMTAzODU0LFxuLy8gICAgICAgICAgICBcIm1pbWVcIjogXCJhcHBsaWNhdGlvbi96aXBcIixcbi8vICAgICAgICAgICAgXCJpc1B1YmxpY1wiOiBmYWxzZSxcbi8vICAgICAgICAgICAgXCJ0YWdzXCI6IFtdLFxuLy8gICAgICAgICAgICBcImNvbnRlbnRcIjogXCIyMzU3ZmJkNjczYmVjNmU5NTkwZWU4YmEzNGVjOGRmOGE4NWRkYWY4XCIsXG4vLyAgICAgICAgICAgIFwiY29udGVudFR5cGVcIjogXCJvYmplY3RcIixcbi8vICAgICAgICAgICAgXCJsYXN0TW9kaWZpZWRcIjogXCIyMDE0LTExLTA5VDAwOjIxOjIyLjAwMFpcIlxuLy8gICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICBibG9iQ2xpZW50LmdldE1ldGFkYXRhKGhhc2gsIGZ1bmN0aW9uIChlcnIsIG1ldGFEYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKG1ldGFEYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRPYmplY3QgPSBmdW5jdGlvbiAoaGFzaCkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIGJsb2JDbGllbnQuZ2V0T2JqZWN0KGhhc2gsIGZ1bmN0aW9uIChlcnIsIGNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoY29udGVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBkb3dubG9hZCB1cmwgZm9yIHRoZSBnaXZlbiBoYXNoLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaGFzaCAtIGhhc2ggdG8gYmxvYiBmaWxlLlxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIHRoZSBkb3dubG9hZCB1cmwgKG51bGwgaWYgaGFzaCBpcyBlbXB0eSkuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldERvd25sb2FkVXJsID0gZnVuY3Rpb24gKGhhc2gpIHtcbiAgICAgICAgICAgIHZhciB1cmw7XG4gICAgICAgICAgICBpZiAoaGFzaCkge1xuICAgICAgICAgICAgICAgIHVybCA9IGJsb2JDbGllbnQuZ2V0RG93bmxvYWRVUkwoaGFzaCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gaGFzaCB0byBibG9iIGZpbGUgZ2l2ZW4nKTtcbiAgICAgICAgICAgICAgICB1cmwgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBmaWxlIGV4dGVuc2lvbiBvZiB0aGUgZ2l2ZW4gZmlsZW5hbWUuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZVxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIHRoZSByZXN1bHRpbmcgZmlsZSBleHRlbnNpb24uXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEZpbGVFeHRlbnNpb24gPSBmdW5jdGlvbiAoZmlsZW5hbWUpIHtcbiAgICAgICAgICAgIHZhciBhID0gZmlsZW5hbWUuc3BsaXQoXCIuXCIpO1xuICAgICAgICAgICAgaWYgKGEubGVuZ3RoID09PSAxIHx8IChhWzBdID09PSBcIlwiICYmIGEubGVuZ3RoID09PSAyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGEucG9wKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRm9ybWF0cyB0aGUgc2l6ZSBpbnRvIGEgaHVtYW4gcmVhZGFibGUgc3RyaW5nLlxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gYnl0ZXMgLSBzaXplIGluIGJ5dGVzLlxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNpIC0gcmV0dXJuIHJlc3VsdCBpbiBTSVVuaXRzIG9yIG5vdC5cbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gLSBmb3JtYXR0ZWQgZmlsZSBzaXplLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5odW1hbkZpbGVTaXplID0gZnVuY3Rpb24gKGJ5dGVzLCBzaSkge1xuICAgICAgICAgICAgdmFyIHRocmVzaCA9IHNpID8gMTAwMCA6IDEwMjQsXG4gICAgICAgICAgICAgICAgdW5pdHMsXG4gICAgICAgICAgICAgICAgdTtcbiAgICAgICAgICAgIGlmIChieXRlcyA8IHRocmVzaCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBieXRlcyArICcgQic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHVuaXRzID0gc2kgPyBbJ2tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJywgJ0VCJywgJ1pCJywgJ1lCJ10gOlxuICAgICAgICAgICAgICAgICAgICBbJ0tpQicsICdNaUInLCAnR2lCJywgJ1RpQicsICdQaUInLCAnRWlCJywgJ1ppQicsICdZaUInXTtcbiAgICAgICAgICAgIHUgPSAtMTtcblxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGJ5dGVzID0gYnl0ZXMgLyB0aHJlc2g7XG4gICAgICAgICAgICAgICAgdSArPSAxO1xuICAgICAgICAgICAgfSB3aGlsZSAoYnl0ZXMgPj0gdGhyZXNoKTtcblxuICAgICAgICAgICAgcmV0dXJuIGJ5dGVzLnRvRml4ZWQoMSkgKyAnICcgKyB1bml0c1t1XTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBXZWJDeVBoeVNwZWNpZmljIGZ1bmN0aW9ucy5cblxuICAgICAgICAvKipcbiAgICAgICAgICogVE9ETzogVGhpcyBtZXRob2Qgc2hvdWxkIHVzZSBwcm9taXNlcyBpbnRlcm5hbGx5IVxuICAgICAgICAgKiBAcGFyYW0gZmlsZXNcbiAgICAgICAgICogQHBhcmFtIHZhbGlkRXh0ZW5zaW9uc1xuICAgICAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2F2ZURyb3BwZWRGaWxlcyA9IGZ1bmN0aW9uIChmaWxlcywgdmFsaWRFeHRlbnNpb25zKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgY291bnRlciA9IGZpbGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBhcnRpZSA9IGJsb2JDbGllbnQuY3JlYXRlQXJ0aWZhY3QoJ2Ryb3BwZWRGaWxlcycpLFxuICAgICAgICAgICAgICAgIGFkZEZpbGUsXG4gICAgICAgICAgICAgICAgYWRkZWRGaWxlcyA9IFtdLFxuICAgICAgICAgICAgICAgIGZpbGVFeHRlbnNpb25Ub0ljb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICd6aXAnOiAnZmEgZmEtcHV6emxlLXBpZWNlJyxcbiAgICAgICAgICAgICAgICAgICAgJ2FkbSc6ICdmYSBmYS1jdWJlcycsXG4gICAgICAgICAgICAgICAgICAgICdhdG0nOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zYXZlZCdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvdW50ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShhZGRlZEZpbGVzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvdW50ZXIgPSBmaWxlcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIGFkZEZpbGUgPSBmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICAgICAgICAgIHZhciBmaWxlRXh0ZW5zaW9uID0gc2VsZi5nZXRGaWxlRXh0ZW5zaW9uKGZpbGUubmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWxpZEV4dGVuc2lvbnMgfHwgdmFsaWRFeHRlbnNpb25zW2ZpbGVFeHRlbnNpb25dKSB7XG4gICAgICAgICAgICAgICAgICAgIGFydGllLmFkZEZpbGVBc1NvZnRMaW5rKGZpbGUubmFtZSwgZmlsZSwgZnVuY3Rpb24gKGVyciwgaGFzaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBhZGQgZmlsZSBcIicgKyBmaWxlLm5hbWUgKyAnXCIgdG8gYmxvYiwgZXJyOiAnICsgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkZWRGaWxlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGZpbGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBmaWxlRXh0ZW5zaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IHNlbGYuaHVtYW5GaWxlU2l6ZShmaWxlLnNpemUsIHRydWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogYmxvYkNsaWVudC5nZXREb3dubG9hZFVSTChoYXNoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBmaWxlRXh0ZW5zaW9uVG9JY29uW2ZpbGVFeHRlbnNpb25dIHx8ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNvdW50ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ291bnRlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBhZGRGaWxlKGZpbGVzW2ldKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIFdlYkdNRUdsb2JhbCwgY29uc29sZSovXG5cblxuLyoqXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxuICovXG5cbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXG4gICAgLnNlcnZpY2UoJ3BsdWdpblNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsIGRhdGFTdG9yZVNlcnZpY2UsIGZpbGVTZXJ2aWNlKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHRcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBsdWdpbk5hbWUgLSBOYW1lIG9mIHBsdWdpbiB0byBleGVjdXRlLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gT2JqZWN0IHdpdGggcGx1Z2luIGNvbmZpZ3VyYXRpb24uXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LnN0cmluZ30gY29uZmlnLmFjdGl2ZU5vZGUgLSBQYXRoIHRvIGFjdGl2ZU5vZGUuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LkFycmF5LjxzdHJpbmc+fSBjb25maWcuYWN0aXZlU2VsZWN0aW9uIC0gUGF0aHMgdG8gbm9kZXMgaW4gYWN0aXZlU2VsZWN0aW9uLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC5ib29sZWFufSBjb25maWcucnVuT25TZXJ2ZXIgLSBXaGV0aGVyIHRvIHJ1biB0aGUgcGx1Z2luIG9uIHRoZSBzZXJ2ZXIgb3Igbm90LlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC5vYmplY3R9IGNvbmZpZy5wbHVnaW5Db25maWcgLSBQbHVnaW4gc3BlY2lmaWMgb3B0aW9ucy5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucnVuUGx1Z2luID0gZnVuY3Rpb24gKGNvbnRleHQsIHBsdWdpbk5hbWUsIGNvbmZpZykge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICBkYkNvbm4gPSBkYXRhU3RvcmVTZXJ2aWNlLmdldERhdGFiYXNlQ29ubmVjdGlvbihjb250ZXh0LmRiKSxcbiAgICAgICAgICAgICAgICBpbnRlcnByZXRlck1hbmFnZXIgPSBuZXcgV2ViR01FR2xvYmFsLmNsYXNzZXMuSW50ZXJwcmV0ZXJNYW5hZ2VyKGRiQ29ubi5jbGllbnQpO1xuXG4gICAgICAgICAgICBpbnRlcnByZXRlck1hbmFnZXIucnVuKHBsdWdpbk5hbWUsIGNvbmZpZywgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnTm8gUmVzdWx0IHdhcyByZXR1cm4gZnJvbSBwbHVnaW4gZXhlY3V0aW9uIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldFBsdWdpbkFydGlmYWN0c0h0bWwgPSBmdW5jdGlvbiAoYXJ0aWVIYXNoZXMpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXG4gICAgICAgICAgICAgICAgaTtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGFydGllSGFzaGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2goZmlsZVNlcnZpY2UuZ2V0QXJ0aWZhY3QoYXJ0aWVIYXNoZXNbaV0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCcnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoYXJ0aWZhY3RzSW5mbykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvd25sb2FkVXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWVOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWZhY3RzSHRtbCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgYXJ0aWZhY3RzSW5mby5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG93bmxvYWRVcmwgPSBmaWxlU2VydmljZS5nZXREb3dubG9hZFVybChhcnRpZmFjdHNJbmZvW2pdLmhhc2gpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWVOYW1lID0gYXJ0aWZhY3RzSW5mb1tqXS5hcnRpZmFjdC5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWZhY3RzSHRtbCArPSAnPGJyPiA8YSBocmVmPVwiJyArIGRvd25sb2FkVXJsICsgJ1wiPicgKyBhcnRpZU5hbWUgKyAnPC9hPic7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShhcnRpZmFjdHNIdG1sKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xuXG4vKipcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcbiAgICAuc2VydmljZSgndGVzdEJlbmNoU2VydmljZScsIGZ1bmN0aW9uICgkcSwgJHRpbWVvdXQsICRtb2RhbCwgbm9kZVNlcnZpY2UsIGJhc2VDeVBoeVNlcnZpY2UsIHBsdWdpblNlcnZpY2UpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICB3YXRjaGVycyA9IHt9O1xuXG4gICAgICAgIHRoaXMuZWRpdFRlc3RCZW5jaEZuID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1Rlc3RCZW5jaEVkaXQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1Rlc3RCZW5jaEVkaXRDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICAvL3NpemU6IHNpemUsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZTogeyBkYXRhOiBmdW5jdGlvbiAoKSB7IHJldHVybiBkYXRhOyB9IH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uIChlZGl0ZWREYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGF0dHJzID0geyB9O1xuICAgICAgICAgICAgICAgIGlmIChlZGl0ZWREYXRhLmRlc2NyaXB0aW9uICE9PSBkYXRhLnRlc3RCZW5jaC5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBhdHRycy5JTkZPID0gZWRpdGVkRGF0YS5kZXNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVkaXRlZERhdGEubmFtZSAhPT0gZGF0YS50ZXN0QmVuY2gudGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cnMubmFtZSA9IGVkaXRlZERhdGEubmFtZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVkaXRlZERhdGEuZmlsZUluZm8uaGFzaCAhPT0gZGF0YS50ZXN0QmVuY2guZGF0YS5maWxlcykge1xuICAgICAgICAgICAgICAgICAgICBhdHRycy5UZXN0QmVuY2hGaWxlcyA9IGVkaXRlZERhdGEuZmlsZUluZm8uaGFzaDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVkaXRlZERhdGEucGF0aCAhPT0gZGF0YS50ZXN0QmVuY2guZGF0YS5wYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJzLklEID0gZWRpdGVkRGF0YS5wYXRoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNlbGYuc2V0VGVzdEJlbmNoQXR0cmlidXRlcyhkYXRhLmVkaXRDb250ZXh0LCBkYXRhLmlkLCBhdHRycylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0F0dHJpYnV0ZShzKSB1cGRhdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVsZXRlRm4gPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvU2ltcGxlTW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NpbXBsZU1vZGFsQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRGVsZXRlIFRlc3QgQmVuY2gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHM6ICdUaGlzIHdpbGwgZGVsZXRlICcgKyBkYXRhLm5hbWUgKyAnIGZyb20gdGhlIHdvcmtzcGFjZS4nXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZGVsZXRlVGVzdEJlbmNoKGRhdGEuY29udGV4dCwgZGF0YS5pZCk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIHRlc3QgYmVuY2ggZnJvbSB0aGUgY29udGV4dC5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gZGF0YS1iYXNlIGNvbm5lY3Rpb24uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXN0QmVuY2hJZCAtIFBhdGggdG8gZGVzaWduLXNwYWNlLlxuICAgICAgICAgKiBAcGFyYW0gW21zZ10gLSBDb21taXQgbWVzc2FnZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlVGVzdEJlbmNoID0gZnVuY3Rpb24gKGNvbnRleHQsIHRlc3RCZW5jaElkLCBtc2cpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbXNnIHx8ICd0ZXN0QmVuY2hTZXJ2aWNlLmRlbGV0ZVRlc3RCZW5jaCAnICsgdGVzdEJlbmNoSWQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5kZXN0cm95Tm9kZShjb250ZXh0LCB0ZXN0QmVuY2hJZCwgbWVzc2FnZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5leHBvcnRUZXN0QmVuY2ggPSBmdW5jdGlvbiAodGVzdEJlbmNoSWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkLicpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVcGRhdGVzIHRoZSBnaXZlbiBhdHRyaWJ1dGVzXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIHRlc3QgYmVuY2guXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIHRlc3QgYmVuY2guXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LnJlZ2lvbklkIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIHRlc3QgYmVuY2guXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXN0QmVuY2hJZCAtIFBhdGggdG8gdGVzdCBiZW5jaC5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGF0dHJzIC0gS2V5cyBhcmUgbmFtZXMgb2YgYXR0cmlidXRlcyBhbmQgdmFsdWVzIGFyZSB0aGUgd2FudGVkIHZhbHVlLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRUZXN0QmVuY2hBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGNvbnRleHQsIHRlc3RCZW5jaElkLCBhdHRycykge1xuICAgICAgICAgICAgcmV0dXJuIGJhc2VDeVBoeVNlcnZpY2Uuc2V0Tm9kZUF0dHJpYnV0ZXMoY29udGV4dCwgdGVzdEJlbmNoSWQsIGF0dHJzKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJ1blRlc3RCZW5jaCA9IGZ1bmN0aW9uIChjb250ZXh0LCB0ZXN0QmVuY2hJZCwgY29uZmlndXJhdGlvbklkKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogdGVzdEJlbmNoSWQsXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uU2VydmVyOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5Db25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uUGF0aDogY29uZmlndXJhdGlvbklkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShjb25maWcpKTtcbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKGNvbnRleHQsICdUZXN0QmVuY2hSdW5uZXInLCBjb25maWcpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0TGlnaHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiByZXN1bHQuc3VjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFydGlmYWN0c0h0bWw6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXM6IHJlc3VsdC5tZXNzYWdlc1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlc3VsdFwiLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLmdldFBsdWdpbkFydGlmYWN0c0h0bWwocmVzdWx0LmFydGlmYWN0cylcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChhcnRpZmFjdHNIdG1sKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlnaHQuYXJ0aWZhY3RzSHRtbCA9IGFydGlmYWN0c0h0bWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHRMaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsICcgKyByZWFzb24pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLndhdGNoVGVzdEJlbmNoTm9kZSA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB0ZXN0QmVuY2hJZCwgdXBkYXRlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaFRlc3RCZW5jaCcsXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxuICAgICAgICAgICAgICAgICAgICBtZXRhOiBudWxsLCAvLyBNRVRBIG5vZGVzIC0gbmVlZGVkIHdoZW4gY3JlYXRpbmcgbmV3IG5vZGVzLi4uXG4gICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaDoge30gLy8ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPiwgbm9kZSA8Tm9kZU9iaj59XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSB0aGlzLmdldEF0dHJpYnV0ZSgnSUQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Jlc3VsdHMgPSB0aGlzLmdldEF0dHJpYnV0ZSgnUmVzdWx0cycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RmlsZXMgPSB0aGlzLmdldEF0dHJpYnV0ZSgnVGVzdEJlbmNoRmlsZXMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Rsc3V0ID0gdGhpcy5nZXRQb2ludGVyKCdUb3BMZXZlbFN5c3RlbVVuZGVyVGVzdCcpLnRvLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGxzdXRDaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLnRlc3RCZW5jaC5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaC5uYW1lID0gbmV3TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEZXNjICE9PSBkYXRhLnRlc3RCZW5jaC5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2guZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BhdGggIT09IGRhdGEudGVzdEJlbmNoLnBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLnBhdGggPSBuZXdQYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1Jlc3VsdHMgIT09IGRhdGEudGVzdEJlbmNoLnJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLnJlc3VsdHMgPSBuZXdSZXN1bHRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0ZpbGVzICE9PSBkYXRhLnRlc3RCZW5jaC5maWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2guZmlsZXMgPSBuZXdGaWxlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdUbHN1dCAhPT0gZGF0YS50ZXN0QmVuY2gudGxzdXRJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2gudGxzdXRJZCA9IG5ld1Rsc3V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0bHN1dENoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEudGVzdEJlbmNoLCB0bHN1dENoYW5nZWQ6IHRsc3V0Q2hhbmdlZH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB0ZXN0QmVuY2hJZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHRlc3RCZW5jaE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubWV0YSA9IG1ldGE7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGVzdEJlbmNoSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdGVzdEJlbmNoTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGVzdEJlbmNoTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB0ZXN0QmVuY2hOb2RlLmdldEF0dHJpYnV0ZSgnSUQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiB0ZXN0QmVuY2hOb2RlLmdldEF0dHJpYnV0ZSgnUmVzdWx0cycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiB0ZXN0QmVuY2hOb2RlLmdldEF0dHJpYnV0ZSgnVGVzdEJlbmNoRmlsZXMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bHN1dElkOiB0ZXN0QmVuY2hOb2RlLmdldFBvaW50ZXIoJ1RvcExldmVsU3lzdGVtVW5kZXJUZXN0JykudG8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogdGVzdEJlbmNoTm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaE5vZGUub25VcGRhdGUob25VcGRhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoTm9kZS5vblVubG9hZChvblVubG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogIFdhdGNoZXMgYWxsIHRlc3QtYmVuY2hlcyAoZXhpc3RlbmNlIGFuZCB0aGVpciBhdHRyaWJ1dGVzKSBvZiBhIHdvcmtzcGFjZS5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZCAtIFBhdGggdG8gd29ya3NwYWNlIHRoYXQgc2hvdWxkIGJlIHdhdGNoZWQuXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS4gRGF0YSBpcyBhbiBvYmplY3QgaW4gZGF0YS50ZXN0QmVuY2hlcy5cbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLndhdGNoVGVzdEJlbmNoZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hUZXN0QmVuY2hlcycsXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RJZDogcGFyZW50Q29udGV4dC5wcm9qZWN0SWQsXG4gICAgICAgICAgICAgICAgICAgIGJyYW5jaElkOiBwYXJlbnRDb250ZXh0LmJyYW5jaElkLFxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoZXM6IHt9IC8vIHRlc3RCZW5jaCB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICBwYXRoOiA8c3RyaW5nPiwgcmVzdWx0czogPGhhc2h8c3RyaW5nPiwgZmlsZXM6IDxoYXNofHN0cmluZz4gfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lEJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdSZXN1bHRzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1Jlc3VsdHMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0ZpbGVzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1Rlc3RCZW5jaEZpbGVzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLnRlc3RCZW5jaGVzW2lkXS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW2lkXS5uYW1lID0gbmV3TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEZXNjICE9PSBkYXRhLnRlc3RCZW5jaGVzW2lkXS5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0uZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BhdGggIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLnBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbaWRdLnBhdGggPSBuZXdQYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1Jlc3VsdHMgIT09IGRhdGEudGVzdEJlbmNoZXNbaWRdLnJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbaWRdLnJlc3VsdHMgPSBuZXdSZXN1bHRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0ZpbGVzICE9PSBkYXRhLnRlc3RCZW5jaGVzW2lkXS5maWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1tpZF0uZmlsZXMgPSBuZXdGaWxlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEudGVzdEJlbmNoZXNbaWRdfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEudGVzdEJlbmNoZXNbaWRdO1xuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNVGVzdEJlbmNoTW9kZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaElkID0gY2hpbGROb2RlLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbdGVzdEJlbmNoSWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRlc3RCZW5jaElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lEJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdSZXN1bHRzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVGVzdEJlbmNoRmlsZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25VcGRhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVk1UZXN0QmVuY2hNb2RlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW3Rlc3RCZW5jaElkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0ZXN0QmVuY2hJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJRCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdSZXN1bHRzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdUZXN0QmVuY2hGaWxlcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IHRlc3RCZW5jaElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEudGVzdEJlbmNoZXNbdGVzdEJlbmNoSWRdfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBXYXRjaGVzIGEgdGVzdC1iZW5jaCB3LnIudC4gaW50ZXJmYWNlcy5cbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB0ZXN0QmVuY2hJZFxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaFRlc3RCZW5jaERldGFpbHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgdGVzdEJlbmNoSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hUZXN0QmVuY2hEZXRhaWxzXycgKyB0ZXN0QmVuY2hJZCxcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcklkczogW10sXG4gICAgICAgICAgICAgICAgICAgIHRsc3V0OiBudWxsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBkYXRhLmNvbnRhaW5lcklkcy5pbmRleE9mKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVySWRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGF9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHRlc3RCZW5jaElkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodGVzdEJlbmNoTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoTm9kZS5sb2FkQ2hpbGRyZW4oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW5baV0uaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVySWRzLnB1c2goY2hpbGRyZW5baV0uZ2V0SWQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5baV0ub25VbmxvYWQob25VbmxvYWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVySWRzLnB1c2gobmV3Q2hpbGQuZ2V0SWQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBXYXRjaGVzIGEgdGVzdC1iZW5jaCB3LnIudC4gaW50ZXJmYWNlcy5cbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSBjb250YWluZXJJZFxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaEludGVyZmFjZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgY29udGFpbmVySWQsIHVwZGF0ZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS53YXRjaEludGVyZmFjZXMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGNvbnRhaW5lcklkLCB1cGRhdGVMaXN0ZW5lcik7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0KTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbi5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCByZWdpb25JZCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlci5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVnaXN0ZXJXYXRjaGVyID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGZuKSB7XG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgZm4pO1xuICAgICAgICB9O1xuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cblxuLyoqXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxuICovXG5cblxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcbiAgICAuc2VydmljZSgnd29ya3NwYWNlU2VydmljZScsIGZ1bmN0aW9uICgkcSwgJHRpbWVvdXQsIG5vZGVTZXJ2aWNlLCBiYXNlQ3lQaHlTZXJ2aWNlLCBwbHVnaW5TZXJ2aWNlLCBmaWxlU2VydmljZSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIHdhdGNoZXJzID0ge307XG5cbiAgICAgICAgdGhpcy5jYWxsQ3JlYXRlV29ya3NwYWNlID0gZnVuY3Rpb24gKGNvbnRleHQsIG5hbWUsIGRlc2MpIHtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY3JlYXRlV29ya3NwYWNlID0gZnVuY3Rpb24gKGNvbnRleHQsIG5hbWUsIGRlc2MpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgbWV0YTtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChtZXRhTm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0YSA9IG1ldGFOb2RlcztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVTZXJ2aWNlLmNyZWF0ZU5vZGUoY29udGV4dCwgJycsIG1ldGEuV29ya1NwYWNlLCAnW1dlYkN5UGh5XSAtIFdvcmtzcGFjZVNlcnZpY2UuY3JlYXRlV29ya3NwYWNlJyk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod3NOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhY21Gb2xkZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkbUZvbGRlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXRtRm9sZGVySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVGb2xkZXJOb2RlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50SWQgPSB3c05vZGUuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZUlkID0gbWV0YS5BQ01Gb2xkZXIuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5jcmVhdGVOb2RlKGNvbnRleHQsIHBhcmVudElkLCBiYXNlSWQsICdbV2ViQ3lQaHldIC0gY3JlYXRlIEFDTUZvbGRlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChhY21Ob2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY21Gb2xkZXJJZCA9IGFjbU5vZGUuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VJZCA9IG1ldGEuQURNRm9sZGVyLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVNlcnZpY2UuY3JlYXRlTm9kZShjb250ZXh0LCBwYXJlbnRJZCwgYmFzZUlkLCAnW1dlYkN5UGh5XSAtIGNyZWF0ZSBBRE1Gb2xkZXInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGFkbU5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkbUZvbGRlcklkID0gYWRtTm9kZS5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZUlkID0gbWV0YS5BVE1Gb2xkZXIuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlU2VydmljZS5jcmVhdGVOb2RlKGNvbnRleHQsIHBhcmVudElkLCBiYXNlSWQsICdbV2ViQ3lQaHldIC0gY3JlYXRlIEFUTUZvbGRlcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoYXRtTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXRtRm9sZGVySWQgPSBhdG1Ob2RlLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHsgYWNtOiBhY21Gb2xkZXJJZCwgYWRtOiBhZG1Gb2xkZXJJZCwgYXRtOiBhdG1Gb2xkZXJJZCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyZWFzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgd3NOb2RlLnNldEF0dHJpYnV0ZSgnbmFtZScsIG5hbWUsICdbV2ViQ3lQaHldIC0gc2V0IG5hbWUgdG8gJyArIG5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3NOb2RlLnNldEF0dHJpYnV0ZSgnSU5GTycsIGRlc2MsICdbV2ViQ3lQaHldIC0gc2V0IElORk8gdG8gJyArIGRlc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRm9sZGVyTm9kZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUZvbGRlck5vZGVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVhc29uKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pbXBvcnRGaWxlcyA9IGZ1bmN0aW9uIChjb250ZXh0LCBmb2xkZXJJZHMsIGZpbGVzKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgY291bnRlcixcbiAgICAgICAgICAgICAgICB0b3RhbCxcbiAgICAgICAgICAgICAgICBmcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWNtczogW10sXG4gICAgICAgICAgICAgICAgICAgIGFkbXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBhdG1zOiBbXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW1wb3J0QWNtUmVjLFxuICAgICAgICAgICAgICAgIGltcG9ydEFkbVJlYyxcbiAgICAgICAgICAgICAgICBpbXBvcnRBdG1SZWMsXG4gICAgICAgICAgICAgICAgZ2V0Tm90aWZ5O1xuXG4gICAgICAgICAgICBpbXBvcnRBY21SZWMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xuICAgICAgICAgICAgICAgIGlmIChjb3VudGVyID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jYWxsQWNtSW1wb3J0ZXIoY29udGV4dCwgZm9sZGVySWRzLmFjbSwgZnMuYWNtc1tjb3VudGVyXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGdldE5vdGlmeShmcy5hY21zW2NvdW50ZXJdLCAnYWNtJyksIGdldE5vdGlmeShmcy5hY21zW2NvdW50ZXJdKSwgJ2FjbScpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsID0gZnMuYWRtcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSB0b3RhbDtcbiAgICAgICAgICAgICAgICAgICAgaW1wb3J0QWRtUmVjKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGltcG9ydEFkbVJlYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb3VudGVyIC09IDE7XG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmNhbGxBZG1JbXBvcnRlcihjb250ZXh0LCBmb2xkZXJJZHMuYWRtLCBmcy5hZG1zW2NvdW50ZXJdKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZ2V0Tm90aWZ5KGZzLmFkbXNbY291bnRlcl0sICdhZG0nKSwgZ2V0Tm90aWZ5KGZzLmFkbXNbY291bnRlcl0pLCAnYWRtJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWwgPSBmcy5hdG1zLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgY291bnRlciA9IHRvdGFsO1xuICAgICAgICAgICAgICAgICAgICBpbXBvcnRBdG1SZWMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW1wb3J0QXRtUmVjID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvdW50ZXIgLT0gMTtcbiAgICAgICAgICAgICAgICBpZiAoY291bnRlciA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY2FsbEF0bUltcG9ydGVyKGNvbnRleHQsIGZvbGRlcklkcy5hdG0sIGZzLmF0bXNbY291bnRlcl0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihnZXROb3RpZnkoZnMuYXRtc1tjb3VudGVyXSwgJ2F0bScpLCBnZXROb3RpZnkoZnMuYXRtc1tjb3VudGVyXSwgJ2F0bScpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGdldE5vdGlmeSA9IGZ1bmN0aW9uIChmSW5mbywgdHlwZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHJlc3VsdCkgPT09IGZhbHNlICYmIHJlc3VsdC5zdWNjZXNzID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoe3R5cGU6ICdzdWNjZXNzJywgbWVzc2FnZTogJzxhIGhyZWY9XCInICsgZkluZm8udXJsICsgJ1wiPicgKyBmSW5mby5uYW1lICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9hPicgKyAnIGltcG9ydGVkLiAnICsgJ1snICsgKHRvdGFsIC0gY291bnRlcikgKyAnLycgKyB0b3RhbCArICddJ30pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KHt0eXBlOiAnZXJyb3InLCBtZXNzYWdlOiAnPGEgaHJlZj1cIicgKyBmSW5mby51cmwgKyAnXCI+JyArIGZJbmZvLm5hbWUgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2E+JyArICcgZmFpbGVkIHRvIGJlIGltcG9ydGVkLCBzZWUgY29uc29sZSBkZXRhaWxzLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbJyArICh0b3RhbCAtIGNvdW50ZXIpICsgJy8nICsgdG90YWwgKyAnXSd9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHJlc3VsdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYW5ndWxhci50b0pzb24ocmVzdWx0Lm1lc3NhZ2VzLCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdhY20nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRBY21SZWMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnYWRtJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1wb3J0QWRtUmVjKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2F0bScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltcG9ydEF0bVJlYygpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdVbmV4cGVjdGVkIGltcG9ydCB0eXBlICcgKyB0eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gaGFzaDogXCIzNjM2ZWFkMDc4NWNhMTY2ZjNiMTExOTNjNGIyZTVhNjcwODAxZWIxXCIgbmFtZTogXCJEYW1wZXIuemlwXCIgc2l6ZTogXCIxLjQga0JcIiB0eXBlOiBcInppcFwiXG4gICAgICAgICAgICAvLyB1cmw6IFwiL3Jlc3QvYmxvYi9kb3dubG9hZC8zNjM2ZWFkMDc4NWNhMTY2ZjNiMTExOTNjNGIyZTVhNjcwODAxZWIxXCJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGlmIChmaWxlc1tpXS50eXBlID09PSAnemlwJykge1xuICAgICAgICAgICAgICAgICAgICBmcy5hY21zLnB1c2goZmlsZXNbaV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlsZXNbaV0udHlwZSA9PT0gJ2FkbScpIHtcbiAgICAgICAgICAgICAgICAgICAgZnMuYWRtcy5wdXNoKGZpbGVzW2ldKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpbGVzW2ldLnR5cGUgPT09ICdhdG0nKSB7XG4gICAgICAgICAgICAgICAgICAgIGZzLmF0bXMucHVzaChmaWxlc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0b3RhbCA9IGZzLmFjbXMubGVuZ3RoO1xuICAgICAgICAgICAgY291bnRlciA9IHRvdGFsO1xuICAgICAgICAgICAgaW1wb3J0QWNtUmVjKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2FsbEFjbUltcG9ydGVyID0gZnVuY3Rpb24gKGNvbnRleHQsIGZvbGRlcklkLCBmaWxlSW5mbykge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGU6IGZvbGRlcklkLFxuICAgICAgICAgICAgICAgICAgICBydW5PblNlcnZlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbkNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgVXBsb2FkZWRGaWxlOiBmaWxlSW5mby5oYXNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgRGVsZXRlRXhpc3Rpbmc6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKGNvbnRleHQsICdBY21JbXBvcnRlcicsIGNvbmZpZylcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vXCJ7XCJzdWNjZXNzXCI6dHJ1ZSxcIm1lc3NhZ2VzXCI6W10sXCJhcnRpZmFjdHNcIjpbXSxcInBsdWdpbk5hbWVcIjpcIkFDTSBJbXBvcnRlclwiLFxuICAgICAgICAgICAgICAgICAgICAvLyBcInN0YXJ0VGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS4zODNaXCIsXCJmaW5pc2hUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjkzOVpcIixcImVycm9yXCI6bnVsbH1cIlxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nLCAnICsgcmVhc29uKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jYWxsQWRtSW1wb3J0ZXIgPSBmdW5jdGlvbiAoY29udGV4dCwgZm9sZGVySWQsIGZpbGVJbmZvKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogZm9sZGVySWQsXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uU2VydmVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZG1GaWxlOiBmaWxlSW5mby5oYXNoXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLnJ1blBsdWdpbihjb250ZXh0LCAnQWRtSW1wb3J0ZXInLCBjb25maWcpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAvL1wie1wic3VjY2Vzc1wiOnRydWUsXCJtZXNzYWdlc1wiOltdLFwiYXJ0aWZhY3RzXCI6W10sXCJwbHVnaW5OYW1lXCI6XCJBRE0gSW1wb3J0ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgLy8gXCJzdGFydFRpbWVcIjpcIjIwMTQtMTEtMDhUMDI6NTE6MjEuMzgzWlwiLFwiZmluaXNoVGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS45MzlaXCIsXCJlcnJvclwiOm51bGx9XCJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdTb21ldGhpbmcgd2VudCB0ZXJyaWJseSB3cm9uZywgJyArIHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2FsbEF0bUltcG9ydGVyID0gZnVuY3Rpb24gKGNvbnRleHQsIGZvbGRlcklkLCBmaWxlSW5mbykge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGU6IGZvbGRlcklkLFxuICAgICAgICAgICAgICAgICAgICBydW5PblNlcnZlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbkNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXRtRmlsZTogZmlsZUluZm8uaGFzaFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcGx1Z2luU2VydmljZS5ydW5QbHVnaW4oY29udGV4dCwgJ0F0bUltcG9ydGVyJywgY29uZmlnKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9cIntcInN1Y2Nlc3NcIjp0cnVlLFwibWVzc2FnZXNcIjpbXSxcImFydGlmYWN0c1wiOltdLFwicGx1Z2luTmFtZVwiOlwiQVRNIEltcG9ydGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIC8vIFwic3RhcnRUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjM4M1pcIixcImZpbmlzaFRpbWVcIjpcIjIwMTQtMTEtMDhUMDI6NTE6MjEuOTM5WlwiLFwiZXJyb3JcIjpudWxsfVwiXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsICcgKyByZWFzb24pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsbHMgRXhwb3J0V29ya3NwYWNlLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIENvbnRleHQgZm9yIHBsdWdpbi5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBEYXRhYmFzZSBjb25uZWN0aW9uIHRvIHB1bGwgbW9kZWwgZnJvbS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIHJlc29sdmVzIHRvIGRvd25sb2FkIHVybCBpZiBzdWNjZXNzZnVsLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5leHBvcnRXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoY29udGV4dCwgd29ya3NwYWNlSWQpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgY29uZmlnID0ge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlOiB3b3Jrc3BhY2VJZCxcbiAgICAgICAgICAgICAgICAgICAgcnVuT25TZXJ2ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5Db25maWc6IHsgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKGNvbnRleHQsICdFeHBvcnRXb3Jrc3BhY2UnLCBjb25maWcpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAvL1wie1wic3VjY2Vzc1wiOnRydWUsXCJtZXNzYWdlc1wiOltdLFwiYXJ0aWZhY3RzXCI6W10sXCJwbHVnaW5OYW1lXCI6XCJBRE0gSW1wb3J0ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgLy8gXCJzdGFydFRpbWVcIjpcIjIwMTQtMTEtMDhUMDI6NTE6MjEuMzgzWlwiLFwiZmluaXNoVGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS45MzlaXCIsXCJlcnJvclwiOm51bGx9XCJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShmaWxlU2VydmljZS5nZXREb3dubG9hZFVybChyZXN1bHQuYXJ0aWZhY3RzWzBdKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlc3VsdC5lcnJvciArICcgbWVzc2FnZXM6ICcgKyBhbmd1bGFyLnRvSnNvbihyZXN1bHQubWVzc2FnZXMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGFuZ3VsYXIudG9Kc29uKHJlc3VsdC5tZXNzYWdlcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nICcgKyByZWFzb24pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVcGRhdGVzIHRoZSBnaXZlbiBhdHRyaWJ1dGVzXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGRlc2lnbi5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgZGVzaWduLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5yZWdpb25JZCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBkZXNpZ24uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZCAtIFBhdGggdG8gd29ya3NwYWNlLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gYXR0cnMgLSBLZXlzIGFyZSBuYW1lcyBvZiBhdHRyaWJ1dGVzIGFuZCB2YWx1ZXMgYXJlIHRoZSB3YW50ZWQgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldFdvcmtzcGFjZUF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoY29udGV4dCwgd29ya3NwYWNlSWQsIGF0dHJzKSB7XG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS5zZXROb2RlQXR0cmlidXRlcyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgYXR0cnMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVzIHRoZSB3b3Jrc3BhY2UgZnJvbSB0aGUgY29udGV4dC5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gZGF0YS1iYXNlIGNvbm5lY3Rpb24uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZCAtIFBhdGggdG8gd29ya3NwYWNlLlxuICAgICAgICAgKiBAcGFyYW0gW21zZ10gLSBDb21taXQgbWVzc2FnZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlV29ya3NwYWNlID0gZnVuY3Rpb24gKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBtc2cpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbXNnIHx8ICdXb3Jrc3BhY2VTZXJ2aWNlLmRlbGV0ZVdvcmtzcGFjZSAnICsgd29ya3NwYWNlSWQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5kZXN0cm95Tm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZCwgbWVzc2FnZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVE9ETzogbWFrZSBzdXJlIHRoZSBtZXRob2RzIGJlbG93IGdldHMgcmVzb2x2ZWQgYXQgZXJyb3IgdG9vLlxuICAgICAgICAvKipcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIHdvcmstc3BhY2VzIGRlZmluZWQgaW4gdGhlIHJvb3Qtbm9kZSB3LnIudC4gZXhpc3RlbmNlIGFuZCBhdHRyaWJ1dGVzLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gY2FsbGVkIG9uIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLWJhc2UuIERhdGEgaXMgYW4gb2JqZWN0IGluIGRhdGEud29ya3NwYWNlcy5cbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLndhdGNoV29ya3NwYWNlcyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB1cGRhdGVMaXN0ZW5lcikge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoV29ya3NwYWNlcycsXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxuICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VzOiB7fSAvLyB3b3Jrc3BhY2UgPSB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+fVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLndvcmtzcGFjZXNbaWRdLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1tpZF0ubmFtZSA9IG5ld05hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVzYyAhPT0gZGF0YS53b3Jrc3BhY2VzW2lkXS5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW2lkXS5kZXNjcmlwdGlvbiA9IG5ld0Rlc2M7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLndvcmtzcGFjZXNbaWRdfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEud29ya3NwYWNlc1tpZF07XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsICcnKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocm9vdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3NJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuV29ya1NwYWNlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3NJZCA9IGNoaWxkTm9kZS5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW3dzSWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB3c0lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uVXBkYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLldvcmtTcGFjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdzSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW3dzSWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB3c0lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uVXBkYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IHdzSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS53b3Jrc3BhY2VzW3dzSWRdfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgY29tcG9uZW50cyAoZGVmaW5lZCBpbiBBQ01Gb2xkZXJzKSBpbiB0aGUgd29ya3NwYWNlLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZFxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIHRoZSB1cGRhdGVkIGRhdGEuY291bnQuXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaE51bWJlck9mQ29tcG9uZW50cyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mQ29tcG9uZW50c18nICsgd29ya3NwYWNlSWQsXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVk1Db21wb25lbnRNb2RlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgY29udGFpbmVycyAoZGVmaW5lZCBpbiBBRE1Gb2xkZXJzKSBpbiB0aGUgd29ya3NwYWNlLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZFxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIHRoZSB1cGRhdGVkIGRhdGEuY291bnQuXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaE51bWJlck9mRGVzaWducyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mRGVzaWduc18nICsgd29ya3NwYWNlSWQsXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY0RlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHdhdGNoZXJzLmhhc093blByb3BlcnR5KHBhcmVudENvbnRleHQucmVnaW9uSWQpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocGFyZW50Q29udGV4dC5yZWdpb25JZCArICcgaXMgbm90IGEgcmVnaXN0ZXJlZCB3YXRjaGVyISAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBcInRoaXMucmVnaXN0ZXJXYXRjaGVyXCIgYmVmb3JlIHRyeWluZyB0byBhY2Nlc3MgTm9kZSBPYmplY3RzLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgbnVtYmVyIG9mIHRlc3QtYmVuY2hlcyAoZGVmaW5lZCBpbiBBVE1Gb2xkZXJzKSBpbiB0aGUgd29ya3NwYWNlLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZFxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGNhbGxlZCBvbiAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS1iYXNlLiBEYXRhIGlzIHRoZSB1cGRhdGVkIGRhdGEuY291bnQuXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaE51bWJlck9mVGVzdEJlbmNoZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzXycgKyB3b3Jrc3BhY2VJZCxcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIGNvdW50OiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoZm9sZGVyTm9kZSwgbWV0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1UZXN0QmVuY2hNb2RlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY0RlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsZWFuVXBBbGxSZWdpb25zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQpIHtcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGVhblVwUmVnaW9uID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHJlZ2lvbklkKSB7XG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24od2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIHJlZ2lvbklkKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoZXIgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZm4pIHtcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBmbik7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dDb250ZXh0ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvZ0NvbnRleHQoY29udGV4dCk7XG4gICAgICAgIH07XG4gICAgfSk7IiwiLypnbG9iYWxzIHJlcXVpcmUsIGFuZ3VsYXIgKi9cbi8qKlxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqL1xuXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnLCBbJ2dtZS5zZXJ2aWNlcyddKTtcbnJlcXVpcmUoJy4vQmFzZUN5UGh5U2VydmljZScpO1xucmVxdWlyZSgnLi9QbHVnaW5TZXJ2aWNlJyk7XG5yZXF1aXJlKCcuL0ZpbGVTZXJ2aWNlJyk7XG5yZXF1aXJlKCcuL0V4ZWN1dG9yU2VydmljZScpO1xucmVxdWlyZSgnLi9Xb3Jrc3BhY2VTZXJ2aWNlJyk7XG5yZXF1aXJlKCcuL0NvbXBvbmVudFNlcnZpY2UnKTtcbnJlcXVpcmUoJy4vRGVzaWduU2VydmljZScpO1xucmVxdWlyZSgnLi9UZXN0QmVuY2hTZXJ2aWNlJyk7XG5yZXF1aXJlKCcuL0Rlc2VydFNlcnZpY2UnKTsiXX0=

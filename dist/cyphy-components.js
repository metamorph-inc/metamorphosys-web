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

        this.saveConfigurationSetNodes = function (setName, setDesc, configurations, designNode, meta) {
            var deferred = $q.defer(),
                context = designNode.context;
            nodeService.createNode(context, designNode, meta.DesertConfigurationSet, 'web-cyphy saveConfigurationSet')
                .then(function (setNode) {
                    var i,
                        queueList = [];
                    setNode.setAttribute('name', setName, 'web-cyphy set name to ' + setName);
                    if (setDesc) {
                        setNode.setAttribute('INFO', setDesc, 'web-cyphy set INFO to ' + setDesc);
                    }
                    for (i = 0; i < configurations.length; i += 1) {
                        queueList.push(nodeService.createNode(context, setNode, meta.DesertConfiguration,
                            'web-cyphy saveConfigurationSet'));
                    }
                    if (queueList.length === 0) {
                        deferred.resolve();
                    } else {
                        $q.all(queueList).then(function (cfgNodes) {
                            var aaStr;
                            for (i = 0; i < cfgNodes.length; i += 1) {
                                aaStr = JSON.stringify(configurations[i].alternativeAssignments);
                                cfgNodes[i].setAttribute('name', configurations[i].name,
                                        'web-cyphy set name to ' + configurations[i].name);
                                cfgNodes[i].setAttribute('AlternativeAssignments', aaStr,
                                        'web-cyphy set AlternativeAssignments to ' + aaStr);
                            }
                            deferred.resolve();
                        });
                    }
                });

            return deferred.promise;
        };

        this.saveConfigurationSet = function (setName, setDesc, configurations, designNode, meta) {
            var context = designNode.context,
                i,
                aaStr,
                metaCfgId = meta.DesertConfiguration.getId(),
                metaCfgSetId = meta.DesertConfigurationSet.getId(),
                setId,
                cfgId,
                designId = designNode.getId(),
                params = {
                    parentId: designId,
                    baseId: metaCfgSetId
                };
            setId = nodeService.createChild(context, params, 'web-cyphy saveConfigurationSet configSet saved.');
            nodeService.setAttributes(context, setId, 'name', setName, 'web-cyphy set name to ' + setName);
            if (setDesc) {
                nodeService.setAttributes(context, setId, 'INFO', setDesc, 'web-cyphy set INFO to ' + setDesc);
            }
            params = {
                parentId: setId,
                baseId: metaCfgId
            };
            for (i = 0; i < configurations.length; i += 1) {
                cfgId = nodeService.createChild(context, params, 'web-cyphy saveConfigurationSet config saved.');
                aaStr = JSON.stringify(configurations[i].alternativeAssignments);
                nodeService.setAttributes(context, cfgId, 'name', configurations[i].name,
                        'web-cyphy set name to ' + configurations[i].name);
                nodeService.setAttributes(context, cfgId, 'AlternativeAssignments', aaStr,
                        'web-cyphy set AlternativeAssignments to ' + aaStr);
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvbGlicmFyeS9jeXBoeS1jb21wb25lbnRzLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL2FkYXB0LXN0cmFwL2Rpc3QvYWRhcHQtc3RyYXAuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvYWRhcHQtc3RyYXAvZGlzdC9hZGFwdC1zdHJhcC50cGwuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvYW5ndWxhci1ncm93bC9idWlsZC9hbmd1bGFyLWdyb3dsLm1pbi5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvYm93ZXJfY29tcG9uZW50cy9hbmd1bGFyLXNhbml0aXplL2FuZ3VsYXItc2FuaXRpemUuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0NvbXBvbmVudExpc3QvQ29tcG9uZW50RGV0YWlscy5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvQ29tcG9uZW50TGlzdC9Db21wb25lbnRMaXN0LmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Db25maWd1cmF0aW9uU2V0U2VsZWN0b3IvQ29uZmlndXJhdGlvblNldFNlbGVjdG9yLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Db25maWd1cmF0aW9uVGFibGUvQ29uZmlndXJhdGlvblRhYmxlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9EZXNpZ25MaXN0L0Rlc2lnbkRldGFpbHMuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0Rlc2lnbkxpc3QvRGVzaWduTGlzdC5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvRGVzaWduVHJlZS9EZXNpZ25UcmVlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9TaW1wbGVNb2RhbC9TaW1wbGVNb2RhbC5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvVGVzdEJlbmNoTGlzdC9UZXN0QmVuY2hEZXRhaWxzLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9UZXN0QmVuY2hMaXN0L1Rlc3RCZW5jaExpc3QuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L1dvcmtlcnNMaXN0L1dvcmtlcnNMaXN0LmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Xb3Jrc3BhY2VMaXN0L1dvcmtzcGFjZUxpc3QuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0Jhc2VDeVBoeVNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0NvbXBvbmVudFNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0Rlc2VydFNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0Rlc2lnblNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0V4ZWN1dG9yU2VydmljZS5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvRmlsZVNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL1BsdWdpblNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL1Rlc3RCZW5jaFNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL1dvcmtzcGFjZVNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL2N5cGh5LXNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaHZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdHFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3haQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6OEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDanRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbHMgcmVxdWlyZSwgYW5ndWxhciAqL1xyXG4vKipcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuLy8gRXh0ZXJuYWwgZGVwZW5kZW5jaWVzXHJcbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZC1zaGltJyk7XHJcbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZCcpO1xyXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL2FuZ3VsYXItZ3Jvd2wvYnVpbGQvYW5ndWxhci1ncm93bC5taW4nKTtcclxucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9hbmd1bGFyLXNhbml0aXplL2FuZ3VsYXItc2FuaXRpemUnKTtcclxucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9hZGFwdC1zdHJhcC9kaXN0L2FkYXB0LXN0cmFwJyk7XHJcbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvYWRhcHQtc3RyYXAvZGlzdC9hZGFwdC1zdHJhcC50cGwnKTtcclxuXHJcbi8vIEludGVybmFsIGRlcGVuZGVuY2llc1xyXG5yZXF1aXJlKCcuL3NlcnZpY2VzL2N5cGh5LXNlcnZpY2VzJyk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycsIFtcclxuICAgICdjeXBoeS5zZXJ2aWNlcycsXHJcbiAgICAnY3lwaHkuY29tcG9uZW50cy50ZW1wbGF0ZXMnLFxyXG4gICAgJ2FuZ3VsYXJGaWxlVXBsb2FkJyxcclxuICAgICdhbmd1bGFyLWdyb3dsJyxcclxuICAgICduZ1Nhbml0aXplJyxcclxuICAgICdhZGFwdHYuYWRhcHRTdHJhcCdcclxuXSkuY29uZmlnKFsnZ3Jvd2xQcm92aWRlcicsIGZ1bmN0aW9uIChncm93bFByb3ZpZGVyKSB7XHJcbiAgICBncm93bFByb3ZpZGVyLmdsb2JhbFRpbWVUb0xpdmUoe3N1Y2Nlc3M6IDUwMDAsIGVycm9yOiAtMSwgd2FybmluZzogMjAwMDAsIGluZm86IDUwMDB9KTtcclxufV0pO1xyXG5cclxucmVxdWlyZSgnLi9TaW1wbGVNb2RhbC9TaW1wbGVNb2RhbCcpO1xyXG5cclxucmVxdWlyZSgnLi9Xb3Jrc3BhY2VMaXN0L1dvcmtzcGFjZUxpc3QnKTtcclxuXHJcbnJlcXVpcmUoJy4vQ29tcG9uZW50TGlzdC9Db21wb25lbnREZXRhaWxzJyk7XHJcbnJlcXVpcmUoJy4vQ29tcG9uZW50TGlzdC9Db21wb25lbnRMaXN0Jyk7XHJcblxyXG5yZXF1aXJlKCcuL0Rlc2lnbkxpc3QvRGVzaWduRGV0YWlscycpO1xyXG5yZXF1aXJlKCcuL0Rlc2lnbkxpc3QvRGVzaWduTGlzdCcpO1xyXG5yZXF1aXJlKCcuL0Rlc2lnblRyZWUvRGVzaWduVHJlZScpO1xyXG5cclxucmVxdWlyZSgnLi9UZXN0QmVuY2hMaXN0L1Rlc3RCZW5jaERldGFpbHMnKTtcclxucmVxdWlyZSgnLi9UZXN0QmVuY2hMaXN0L1Rlc3RCZW5jaExpc3QnKTtcclxuXHJcbnJlcXVpcmUoJy4vQ29uZmlndXJhdGlvblRhYmxlL0NvbmZpZ3VyYXRpb25UYWJsZScpO1xyXG5yZXF1aXJlKCcuL0NvbmZpZ3VyYXRpb25TZXRTZWxlY3Rvci9Db25maWd1cmF0aW9uU2V0U2VsZWN0b3InKTtcclxuXHJcbnJlcXVpcmUoJy4vV29ya2Vyc0xpc3QvV29ya2Vyc0xpc3QnKTtcclxuXHJcblxyXG5cclxuIiwiLyoqXG4gKiBhZGFwdC1zdHJhcFxuICogQHZlcnNpb24gdjIuMC42IC0gMjAxNC0xMC0yNlxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL0FkYXB0di9hZGFwdC1zdHJhcFxuICogQGF1dGhvciBLYXNoeWFwIFBhdGVsIChrYXNoeWFwQGFkYXAudHYpXG4gKiBAbGljZW5zZSBNSVQgTGljZW5zZSwgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuJ3VzZSBzdHJpY3QnO1xuLy8gU291cmNlOiBtb2R1bGUuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcCcsIFtcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLnV0aWxzJyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLnRyZWVicm93c2VyJyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLnRhYmxlbGl0ZScsXG4gICdhZGFwdHYuYWRhcHRTdHJhcC50YWJsZWFqYXgnLFxuICAnYWRhcHR2LmFkYXB0U3RyYXAubG9hZGluZ2luZGljYXRvcicsXG4gICdhZGFwdHYuYWRhcHRTdHJhcC5kcmFnZ2FibGUnLFxuICAnYWRhcHR2LmFkYXB0U3RyYXAuaW5maW5pdGVkcm9wZG93bidcbl0pLnByb3ZpZGVyKCckYWRDb25maWcnLCBmdW5jdGlvbiAoKSB7XG4gIHZhciBpY29uQ2xhc3NlcyA9IHRoaXMuaWNvbkNsYXNzZXMgPSB7XG4gICAgICBleHBhbmQ6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBsdXMtc2lnbicsXG4gICAgICBjb2xsYXBzZTogJ2dseXBoaWNvbiBnbHlwaGljb24tbWludXMtc2lnbicsXG4gICAgICBsb2FkaW5nU3Bpbm5lcjogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVmcmVzaCBhZC1zcGluJyxcbiAgICAgIGZpcnN0UGFnZTogJ2dseXBoaWNvbiBnbHlwaGljb24tZmFzdC1iYWNrd2FyZCcsXG4gICAgICBwcmV2aW91c1BhZ2U6ICdnbHlwaGljb24gZ2x5cGhpY29uLWJhY2t3YXJkJyxcbiAgICAgIG5leHRQYWdlOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1mb3J3YXJkJyxcbiAgICAgIGxhc3RQYWdlOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1mYXN0LWZvcndhcmQnLFxuICAgICAgc29ydEFzY2VuZGluZzogJ2dseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi11cCcsXG4gICAgICBzb3J0RGVzY2VuZGluZzogJ2dseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi1kb3duJyxcbiAgICAgIHNvcnRhYmxlOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZXNpemUtdmVydGljYWwnLFxuICAgICAgZHJhZ2dhYmxlOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1hbGlnbi1qdXN0aWZ5JyxcbiAgICAgIHNlbGVjdGVkSXRlbTogJ2dseXBoaWNvbiBnbHlwaGljb24tb2snXG4gICAgfSwgcGFnaW5nID0gdGhpcy5wYWdpbmcgPSB7XG4gICAgICByZXF1ZXN0OiB7XG4gICAgICAgIHN0YXJ0OiAnc2tpcCcsXG4gICAgICAgIHBhZ2VTaXplOiAnbGltaXQnLFxuICAgICAgICBwYWdlOiAncGFnZScsXG4gICAgICAgIHNvcnRGaWVsZDogJ3NvcnQnLFxuICAgICAgICBzb3J0RGlyZWN0aW9uOiAnc29ydF9kaXInLFxuICAgICAgICBzb3J0QXNjVmFsdWU6ICdhc2MnLFxuICAgICAgICBzb3J0RGVzY1ZhbHVlOiAnZGVzYydcbiAgICAgIH0sXG4gICAgICByZXNwb25zZToge1xuICAgICAgICBpdGVtc0xvY2F0aW9uOiAnZGF0YScsXG4gICAgICAgIHRvdGFsSXRlbXM6ICdwYWdpbmF0aW9uLnRvdGFsQ291bnQnXG4gICAgICB9XG4gICAgfTtcbiAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpY29uQ2xhc3NlczogaWNvbkNsYXNzZXMsXG4gICAgICBwYWdpbmc6IHBhZ2luZ1xuICAgIH07XG4gIH07XG59KTtcblxuLy8gU291cmNlOiBkcmFnZ2FibGUuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC5kcmFnZ2FibGUnLCBbXSkuZGlyZWN0aXZlKCdhZERyYWcnLCBbXG4gICckcm9vdFNjb3BlJyxcbiAgJyRwYXJzZScsXG4gICckdGltZW91dCcsXG4gIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcGFyc2UsICR0aW1lb3V0KSB7XG4gICAgZnVuY3Rpb24gbGlua0Z1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgc2NvcGUuZHJhZ2dhYmxlID0gYXR0cnMuYWREcmFnO1xuICAgICAgc2NvcGUuaGFzSGFuZGxlID0gYXR0cnMuYWREcmFnSGFuZGxlID09PSAnZmFsc2UnIHx8IHR5cGVvZiBhdHRycy5hZERyYWdIYW5kbGUgPT09ICd1bmRlZmluZWQnID8gZmFsc2UgOiB0cnVlO1xuICAgICAgc2NvcGUub25EcmFnU3RhcnRDYWxsYmFjayA9ICRwYXJzZShhdHRycy5hZERyYWdCZWdpbikgfHwgbnVsbDtcbiAgICAgIHNjb3BlLm9uRHJhZ0VuZENhbGxiYWNrID0gJHBhcnNlKGF0dHJzLmFkRHJhZ0VuZCkgfHwgbnVsbDtcbiAgICAgIHNjb3BlLmRhdGEgPSBudWxsO1xuICAgICAgdmFyIG9mZnNldCwgbXgsIG15LCB0eCwgdHk7XG4gICAgICB2YXIgaGFzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAvKiAtLSBFdmVudHMgLS0gKi9cbiAgICAgIHZhciBzdGFydEV2ZW50cyA9ICd0b3VjaHN0YXJ0IG1vdXNlZG93bic7XG4gICAgICB2YXIgbW92ZUV2ZW50cyA9ICd0b3VjaG1vdmUgbW91c2Vtb3ZlJztcbiAgICAgIHZhciBlbmRFdmVudHMgPSAndG91Y2hlbmQgbW91c2V1cCc7XG4gICAgICB2YXIgJGRvY3VtZW50ID0gJChkb2N1bWVudCk7XG4gICAgICB2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcbiAgICAgIHZhciBkcmFnRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgdmFyIHByZXNzVGltZXIgPSBudWxsO1xuICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgZWxlbWVudC5hdHRyKCdkcmFnZ2FibGUnLCAnZmFsc2UnKTtcbiAgICAgICAgLy8gcHJldmVudCBuYXRpdmUgZHJhZ1xuICAgICAgICB0b2dnbGVMaXN0ZW5lcnModHJ1ZSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiB0b2dnbGVMaXN0ZW5lcnMoZW5hYmxlKSB7XG4gICAgICAgIGlmICghZW5hYmxlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFkZCBsaXN0ZW5lcnMuXG4gICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBvbkRlc3Ryb3kpO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnYWREcmFnJywgb25FbmFibGVDaGFuZ2UpO1xuICAgICAgICBzY29wZS4kd2F0Y2goYXR0cnMuYWREcmFnRGF0YSwgb25EcmFnRGF0YUNoYW5nZSk7XG4gICAgICAgIHNjb3BlLiRvbignZHJhZ2dhYmxlOnN0YXJ0Jywgb25EcmFnU3RhcnQpO1xuICAgICAgICBzY29wZS4kb24oJ2RyYWdnYWJsZTplbmQnLCBvbkRyYWdFbmQpO1xuICAgICAgICBpZiAoc2NvcGUuaGFzSGFuZGxlKSB7XG4gICAgICAgICAgZWxlbWVudC5vbihzdGFydEV2ZW50cywgJy5hZC1kcmFnLWhhbmRsZScsIG9uUHJlc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZW1lbnQub24oc3RhcnRFdmVudHMsIG9uUHJlc3MpO1xuICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2FkLWRyYWdnYWJsZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaGFzVG91Y2gpIHtcbiAgICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAnLmFkLWRyYWctaGFuZGxlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9KTsgIC8vIHByZXZlbnQgbmF0aXZlIGRyYWdcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8tLS0gRXZlbnQgSGFuZGxlcnMgLS0tXG4gICAgICBmdW5jdGlvbiBvbkRyYWdTdGFydChldnQsIG8pIHtcbiAgICAgICAgaWYgKG8uZWwgPT09IGVsZW1lbnQgJiYgby5jYWxsYmFjaykge1xuICAgICAgICAgIG8uY2FsbGJhY2soZXZ0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25EcmFnRW5kKGV2dCwgbykge1xuICAgICAgICBpZiAoby5lbCA9PT0gZWxlbWVudCAmJiBvLmNhbGxiYWNrKSB7XG4gICAgICAgICAgby5jYWxsYmFjayhldnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkRlc3Ryb3koKSB7XG4gICAgICAgIHRvZ2dsZUxpc3RlbmVycyhmYWxzZSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkRyYWdEYXRhQ2hhbmdlKG5ld1ZhbCkge1xuICAgICAgICBzY29wZS5kYXRhID0gbmV3VmFsO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25FbmFibGVDaGFuZ2UobmV3VmFsKSB7XG4gICAgICAgIGRyYWdFbmFibGVkID0gc2NvcGUuJGV2YWwobmV3VmFsKTtcbiAgICAgIH1cbiAgICAgIC8qXG4gICAgICAqIFdoZW4gdGhlIGVsZW1lbnQgaXMgY2xpY2tlZCBzdGFydCB0aGUgZHJhZyBiZWhhdmlvdXJcbiAgICAgICogT24gdG91Y2ggZGV2aWNlcyBhcyBhIHNtYWxsIGRlbGF5IHNvIGFzIG5vdCB0byBwcmV2ZW50IG5hdGl2ZSB3aW5kb3cgc2Nyb2xsaW5nXG4gICAgICAqL1xuICAgICAgZnVuY3Rpb24gb25QcmVzcyhldnQpIHtcbiAgICAgICAgaWYgKCFkcmFnRW5hYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzVG91Y2gpIHtcbiAgICAgICAgICBjYW5jZWxQcmVzcygpO1xuICAgICAgICAgIHByZXNzVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbmNlbFByZXNzKCk7XG4gICAgICAgICAgICBvbkxvbmdQcmVzcyhldnQpO1xuICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgJGRvY3VtZW50Lm9uKG1vdmVFdmVudHMsIGNhbmNlbFByZXNzKTtcbiAgICAgICAgICAkZG9jdW1lbnQub24oZW5kRXZlbnRzLCBjYW5jZWxQcmVzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb25Mb25nUHJlc3MoZXZ0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLypcbiAgICAgICAqIFJldHVybnMgdGhlIGlubGluZSBwcm9wZXJ0eSBvZiBhbiBlbGVtZW50XG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGdldElubGluZVByb3BlcnR5KHByb3AsIGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHN0eWxlcyA9ICQoZWxlbWVudCkuYXR0cignc3R5bGUnKSwgdmFsdWU7XG4gICAgICAgIGlmIChzdHlsZXMpIHtcbiAgICAgICAgICBzdHlsZXMuc3BsaXQoJzsnKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBlLnNwbGl0KCc6Jyk7XG4gICAgICAgICAgICBpZiAoJC50cmltKHN0eWxlWzBdKSA9PT0gcHJvcCkge1xuICAgICAgICAgICAgICB2YWx1ZSA9IHN0eWxlWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIC8qXG4gICAgICAgKiBQcmVzZXJ2ZSB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQgZHVyaW5nIGRyYWdcbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gcGVyc2lzdEVsZW1lbnRXaWR0aCgpIHtcbiAgICAgICAgaWYgKGdldElubGluZVByb3BlcnR5KCd3aWR0aCcsIGVsZW1lbnQpKSB7XG4gICAgICAgICAgZWxlbWVudC5kYXRhKCdhZC1kcmFnZ2FibGUtdGVtcC13aWR0aCcsIGdldElubGluZVByb3BlcnR5KCd3aWR0aCcsIGVsZW1lbnQpKTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50LndpZHRoKGVsZW1lbnQud2lkdGgoKSk7XG4gICAgICAgIGVsZW1lbnQuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoZ2V0SW5saW5lUHJvcGVydHkoJ3dpZHRoJywgdGhpcykpIHtcbiAgICAgICAgICAgICQodGhpcykuZGF0YSgnYWQtZHJhZ2dhYmxlLXRlbXAtd2lkdGgnLCBnZXRJbmxpbmVQcm9wZXJ0eSgnd2lkdGgnLCB0aGlzKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgICQodGhpcykud2lkdGgoJCh0aGlzKS53aWR0aCgpKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBjYW5jZWxQcmVzcygpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHByZXNzVGltZXIpO1xuICAgICAgICAkZG9jdW1lbnQub2ZmKG1vdmVFdmVudHMsIGNhbmNlbFByZXNzKTtcbiAgICAgICAgJGRvY3VtZW50Lm9mZihlbmRFdmVudHMsIGNhbmNlbFByZXNzKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uTG9uZ1ByZXNzKGV2dCkge1xuICAgICAgICBpZiAoIWRyYWdFbmFibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvZmZzZXQgPSBlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICBpZiAoc2NvcGUuaGFzSGFuZGxlKSB7XG4gICAgICAgICAgb2Zmc2V0ID0gZWxlbWVudC5maW5kKCcuYWQtZHJhZy1oYW5kbGUnKS5vZmZzZXQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvZmZzZXQgPSBlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2FkLWRyYWdnaW5nJyk7XG4gICAgICAgIG14ID0gZXZ0LnBhZ2VYIHx8IGV2dC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICAgIG15ID0gZXZ0LnBhZ2VZIHx8IGV2dC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICAgIHR4ID0gbXggLSBvZmZzZXQubGVmdCAtICR3aW5kb3cuc2Nyb2xsTGVmdCgpO1xuICAgICAgICB0eSA9IG15IC0gb2Zmc2V0LnRvcCAtICR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIHBlcnNpc3RFbGVtZW50V2lkdGgoKTtcbiAgICAgICAgbW92ZUVsZW1lbnQodHgsIHR5KTtcbiAgICAgICAgJGRvY3VtZW50Lm9uKG1vdmVFdmVudHMsIG9uTW92ZSk7XG4gICAgICAgICRkb2N1bWVudC5vbihlbmRFdmVudHMsIG9uUmVsZWFzZSk7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZHJhZ2dhYmxlOnN0YXJ0Jywge1xuICAgICAgICAgIHg6IG14LFxuICAgICAgICAgIHk6IG15LFxuICAgICAgICAgIHR4OiB0eCxcbiAgICAgICAgICB0eTogdHksXG4gICAgICAgICAgZWw6IGVsZW1lbnQsXG4gICAgICAgICAgZGF0YTogc2NvcGUuZGF0YSxcbiAgICAgICAgICBjYWxsYmFjazogb25EcmFnQmVnaW5cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbk1vdmUoZXZ0KSB7XG4gICAgICAgIHZhciBjeCwgY3k7XG4gICAgICAgIGlmICghZHJhZ0VuYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGN4ID0gZXZ0LnBhZ2VYIHx8IGV2dC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICAgIGN5ID0gZXZ0LnBhZ2VZIHx8IGV2dC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICAgIHR4ID0gY3ggLSBteCArIG9mZnNldC5sZWZ0IC0gJHdpbmRvdy5zY3JvbGxMZWZ0KCk7XG4gICAgICAgIHR5ID0gY3kgLSBteSArIG9mZnNldC50b3AgLSAkd2luZG93LnNjcm9sbFRvcCgpO1xuICAgICAgICBtb3ZlRWxlbWVudCh0eCwgdHkpO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2RyYWdnYWJsZTptb3ZlJywge1xuICAgICAgICAgIHg6IG14LFxuICAgICAgICAgIHk6IG15LFxuICAgICAgICAgIHR4OiB0eCxcbiAgICAgICAgICB0eTogdHksXG4gICAgICAgICAgZWw6IGVsZW1lbnQsXG4gICAgICAgICAgZGF0YTogc2NvcGUuZGF0YVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uUmVsZWFzZShldnQpIHtcbiAgICAgICAgaWYgKCFkcmFnRW5hYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkcmFnZ2FibGU6ZW5kJywge1xuICAgICAgICAgIHg6IG14LFxuICAgICAgICAgIHk6IG15LFxuICAgICAgICAgIHR4OiB0eCxcbiAgICAgICAgICB0eTogdHksXG4gICAgICAgICAgZWw6IGVsZW1lbnQsXG4gICAgICAgICAgZGF0YTogc2NvcGUuZGF0YSxcbiAgICAgICAgICBjYWxsYmFjazogb25EcmFnQ29tcGxldGVcbiAgICAgICAgfSk7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2FkLWRyYWdnaW5nJyk7XG4gICAgICAgIHJlc2V0KCk7XG4gICAgICAgICRkb2N1bWVudC5vZmYobW92ZUV2ZW50cywgb25Nb3ZlKTtcbiAgICAgICAgJGRvY3VtZW50Lm9mZihlbmRFdmVudHMsIG9uUmVsZWFzZSk7XG4gICAgICB9XG4gICAgICAvLyBDYWxsYmFja3NcbiAgICAgIGZ1bmN0aW9uIG9uRHJhZ0JlZ2luKGV2dCkge1xuICAgICAgICBpZiAoIXNjb3BlLm9uRHJhZ1N0YXJ0Q2FsbGJhY2spIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzY29wZS5vbkRyYWdTdGFydENhbGxiYWNrKHNjb3BlLCB7XG4gICAgICAgICAgICAkZGF0YTogc2NvcGUuZGF0YSxcbiAgICAgICAgICAgICRkcmFnRWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICRldmVudDogZXZ0XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25EcmFnQ29tcGxldGUoZXZ0KSB7XG4gICAgICAgIGlmICghc2NvcGUub25EcmFnRW5kQ2FsbGJhY2spIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gVG8gZml4IGEgYnVnIGlzc3VlIHdoZXJlIG9uRHJhZ0VuZCBoYXBwZW5zIGJlZm9yZVxuICAgICAgICAvLyBvbkRyb3BFbmQuIEN1cnJlbnRseSB0aGUgb25seSB3YXkgYXJvdW5kIHRoaXNcbiAgICAgICAgLy8gSWRlYWxseSBvbkRyb3BFbmQgc2hvdWxkIGZpcmUgYmVmb3JlIG9uRHJhZ0VuZFxuICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLm9uRHJhZ0VuZENhbGxiYWNrKHNjb3BlLCB7XG4gICAgICAgICAgICAgICRkYXRhOiBzY29wZS5kYXRhLFxuICAgICAgICAgICAgICAkZHJhZ0VsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICRldmVudDogZXZ0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH1cbiAgICAgIC8vIHV0aWxzIGZ1bmN0aW9uc1xuICAgICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgIGVsZW1lbnQuY3NzKHtcbiAgICAgICAgICBsZWZ0OiAnJyxcbiAgICAgICAgICB0b3A6ICcnLFxuICAgICAgICAgIHBvc2l0aW9uOiAnJyxcbiAgICAgICAgICAnei1pbmRleCc6ICcnXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgd2lkdGggPSBlbGVtZW50LmRhdGEoJ2FkLWRyYWdnYWJsZS10ZW1wLXdpZHRoJyk7XG4gICAgICAgIGlmICh3aWR0aCkge1xuICAgICAgICAgIGVsZW1lbnQuY3NzKHsgd2lkdGg6IHdpZHRoIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZW1lbnQuY3NzKHsgd2lkdGg6ICcnIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgd2lkdGggPSAkKHRoaXMpLmRhdGEoJ2FkLWRyYWdnYWJsZS10ZW1wLXdpZHRoJyk7XG4gICAgICAgICAgaWYgKHdpZHRoKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmNzcyh7IHdpZHRoOiB3aWR0aCB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCh0aGlzKS5jc3MoeyB3aWR0aDogJycgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG1vdmVFbGVtZW50KHgsIHkpIHtcbiAgICAgICAgZWxlbWVudC5jc3Moe1xuICAgICAgICAgIGxlZnQ6IHgsXG4gICAgICAgICAgdG9wOiB5LFxuICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxuICAgICAgICAgICd6LWluZGV4JzogOTk5OTlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpbml0KCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgbGluazogbGlua0Z1bmN0aW9uXG4gICAgfTtcbiAgfVxuXSkuZGlyZWN0aXZlKCdhZERyb3AnLCBbXG4gICckcm9vdFNjb3BlJyxcbiAgJyRwYXJzZScsXG4gIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcGFyc2UpIHtcbiAgICBmdW5jdGlvbiBsaW5rRnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBzY29wZS5kcm9wcGFibGUgPSBhdHRycy5hZERyb3A7XG4gICAgICBzY29wZS5vbkRyb3BDYWxsYmFjayA9ICRwYXJzZShhdHRycy5hZERyb3BFbmQpIHx8IG51bGw7XG4gICAgICBzY29wZS5vbkRyb3BPdmVyQ2FsbGJhY2sgPSAkcGFyc2UoYXR0cnMuYWREcm9wT3ZlcikgfHwgbnVsbDtcbiAgICAgIHNjb3BlLm9uRHJvcExlYXZlQ2FsbGJhY2sgPSAkcGFyc2UoYXR0cnMuYWREcm9wTGVhdmUpIHx8IG51bGw7XG4gICAgICB2YXIgZHJvcEVuYWJsZWQgPSBmYWxzZTtcbiAgICAgIHZhciBlbGVtID0gbnVsbDtcbiAgICAgIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgdG9nZ2xlTGlzdGVuZXJzKHRydWUpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gdG9nZ2xlTGlzdGVuZXJzKGVuYWJsZSkge1xuICAgICAgICBpZiAoIWVuYWJsZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBhZGQgbGlzdGVuZXJzLlxuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnYWREcm9wJywgb25FbmFibGVDaGFuZ2UpO1xuICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95Jywgb25EZXN0cm95KTtcbiAgICAgICAgc2NvcGUuJG9uKCdkcmFnZ2FibGU6bW92ZScsIG9uRHJhZ01vdmUpO1xuICAgICAgICBzY29wZS4kb24oJ2RyYWdnYWJsZTplbmQnLCBvbkRyYWdFbmQpO1xuICAgICAgICBzY29wZS4kb24oJ2RyYWdnYWJsZTpjaGFuZ2UnLCBvbkRyb3BDaGFuZ2UpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25EZXN0cm95KCkge1xuICAgICAgICB0b2dnbGVMaXN0ZW5lcnMoZmFsc2UpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25FbmFibGVDaGFuZ2UobmV3VmFsKSB7XG4gICAgICAgIGRyb3BFbmFibGVkID0gc2NvcGUuJGV2YWwobmV3VmFsKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRHJvcENoYW5nZShldnQsIG9iaikge1xuICAgICAgICBpZiAoZWxlbSAhPT0gb2JqLmVsKSB7XG4gICAgICAgICAgZWxlbSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRHJhZ01vdmUoZXZ0LCBvYmopIHtcbiAgICAgICAgaWYgKCFkcm9wRW5hYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB0aGUgZHJvcEVsZW1lbnQgYW5kIHRoZSBkcmFnIGVsZW1lbnQgYXJlIHRoZSBzYW1lXG4gICAgICAgIGlmIChlbGVtZW50ID09PSBvYmouZWwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVsID0gZ2V0Q3VycmVudERyb3BFbGVtZW50KG9iai50eCwgb2JqLnR5LCBvYmouZWwpO1xuICAgICAgICBpZiAoZWwgIT09IG51bGwpIHtcbiAgICAgICAgICBlbGVtID0gZWw7XG4gICAgICAgICAgb2JqLmVsLmxhc3REcm9wRWxlbWVudCA9IGVsZW07XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLm9uRHJvcE92ZXJDYWxsYmFjayhzY29wZSwge1xuICAgICAgICAgICAgICAkZGF0YTogb2JqLmRhdGEsXG4gICAgICAgICAgICAgICRkcmFnRWxlbWVudDogb2JqLmVsLFxuICAgICAgICAgICAgICAkZHJvcEVsZW1lbnQ6IGVsZW0sXG4gICAgICAgICAgICAgICRldmVudDogZXZ0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdhZC1kcm9wLW92ZXInKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2RyYWdnYWJsZTpjaGFuZ2UnLCB7IGVsOiBlbGVtIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChvYmouZWwubGFzdERyb3BFbGVtZW50ID09PSBlbGVtZW50KSB7XG4gICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBzY29wZS5vbkRyb3BMZWF2ZUNhbGxiYWNrKHNjb3BlLCB7XG4gICAgICAgICAgICAgICAgJGRhdGE6IG9iai5kYXRhLFxuICAgICAgICAgICAgICAgICRkcmFnRWxlbWVudDogb2JqLmVsLFxuICAgICAgICAgICAgICAgICRkcm9wRWxlbWVudDogb2JqLmVsLmxhc3REcm9wRWxlbWVudCxcbiAgICAgICAgICAgICAgICAkZXZlbnQ6IGV2dFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgb2JqLmVsLmxhc3REcm9wRWxlbWVudC5yZW1vdmVDbGFzcygnYWQtZHJvcC1vdmVyJyk7XG4gICAgICAgICAgICBkZWxldGUgb2JqLmVsLmxhc3REcm9wRWxlbWVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRHJhZ0VuZChldnQsIG9iaikge1xuICAgICAgICBpZiAoIWRyb3BFbmFibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtKSB7XG4gICAgICAgICAgLy8gY2FsbCB0aGUgYWREcm9wIGVsZW1lbnQgY2FsbGJhY2tcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2NvcGUub25Ecm9wQ2FsbGJhY2soc2NvcGUsIHtcbiAgICAgICAgICAgICAgJGRhdGE6IG9iai5kYXRhLFxuICAgICAgICAgICAgICAkZHJhZ0VsZW1lbnQ6IG9iai5lbCxcbiAgICAgICAgICAgICAgJGRyb3BFbGVtZW50OiBlbGVtLFxuICAgICAgICAgICAgICAkZXZlbnQ6IGV2dFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZWxlbSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGdldEN1cnJlbnREcm9wRWxlbWVudCh4LCB5KSB7XG4gICAgICAgIHZhciBib3VuZHMgPSBlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICAvLyBzZXQgZHJhZyBzZW5zaXRpdml0eVxuICAgICAgICB2YXIgdnRob2xkID0gTWF0aC5mbG9vcihlbGVtZW50Lm91dGVySGVpZ2h0KCkgLyA2KTtcbiAgICAgICAgeCA9IHggKyAkd2luZG93LnNjcm9sbExlZnQoKTtcbiAgICAgICAgeSA9IHkgKyAkd2luZG93LnNjcm9sbFRvcCgpO1xuICAgICAgICByZXR1cm4geSA+PSBib3VuZHMudG9wICsgdnRob2xkICYmIHkgPD0gYm91bmRzLnRvcCArIGVsZW1lbnQub3V0ZXJIZWlnaHQoKSAtIHZ0aG9sZCAmJiAoeCA+PSBib3VuZHMubGVmdCAmJiB4IDw9IGJvdW5kcy5sZWZ0ICsgZWxlbWVudC5vdXRlcldpZHRoKCkpICYmICh4ID49IGJvdW5kcy5sZWZ0ICYmIHggPD0gYm91bmRzLmxlZnQgKyBlbGVtZW50Lm91dGVyV2lkdGgoKSkgPyBlbGVtZW50IDogbnVsbDtcbiAgICAgIH1cbiAgICAgIGluaXQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICBsaW5rOiBsaW5rRnVuY3Rpb25cbiAgICB9O1xuICB9XG5dKTtcblxuLy8gU291cmNlOiBpbmZpbml0ZWRyb3Bkb3duLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAuaW5maW5pdGVkcm9wZG93bicsIFtcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLnV0aWxzJyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLmxvYWRpbmdpbmRpY2F0b3InXG5dKS5kaXJlY3RpdmUoJ2FkSW5maW5pdGVEcm9wZG93bicsIFtcbiAgJyRwYXJzZScsXG4gICckY29tcGlsZScsXG4gICckdGVtcGxhdGVDYWNoZScsXG4gICckYWRDb25maWcnLFxuICAnYWRMb2FkUGFnZScsXG4gICdhZERlYm91bmNlJyxcbiAgJ2FkU3RyYXBVdGlscycsXG4gICdhZExvYWRMb2NhbFBhZ2UnLFxuICBmdW5jdGlvbiAoJHBhcnNlLCAkY29tcGlsZSwgJHRlbXBsYXRlQ2FjaGUsICRhZENvbmZpZywgYWRMb2FkUGFnZSwgYWREZWJvdW5jZSwgYWRTdHJhcFV0aWxzLCBhZExvYWRMb2NhbFBhZ2UpIHtcbmZ1bmN0aW9uIGxpbmtGdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIC8vIHNjb3BlIGluaXRpYWxpemF0aW9uXG4gICAgICBzY29wZS5hdHRycyA9IGF0dHJzO1xuICAgICAgc2NvcGUuYWRTdHJhcFV0aWxzID0gYWRTdHJhcFV0aWxzO1xuICAgICAgc2NvcGUuaXRlbXMgPSB7XG4gICAgICAgIGxpc3Q6IFtdLFxuICAgICAgICBwYWdpbmc6IHtcbiAgICAgICAgICBjdXJyZW50UGFnZTogMSxcbiAgICAgICAgICB0b3RhbFBhZ2VzOiB1bmRlZmluZWQsXG4gICAgICAgICAgcGFnZVNpemU6IE51bWJlcihhdHRycy5wYWdlU2l6ZSkgfHwgMTBcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNjb3BlLmxvY2FsQ29uZmlnID0ge1xuICAgICAgICBsb2FkaW5nRGF0YTogZmFsc2UsXG4gICAgICAgIHNpbmdsZVNlbGVjdGlvbk1vZGU6ICRwYXJzZShhdHRycy5zaW5nbGVTZWxlY3Rpb25Nb2RlKSgpID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBkaW1lbnNpb25zOiB7XG4gICAgICAgICAgJ21heC1oZWlnaHQnOiBhdHRycy5tYXhIZWlnaHQgfHwgJzIwMHB4JyxcbiAgICAgICAgICAnbWF4LXdpZHRoJzogYXR0cnMubWF4V2lkdGggfHwgJ2F1dG8nXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzY29wZS5zZWxlY3RlZEl0ZW1zID0gc2NvcGUuJGV2YWwoYXR0cnMuc2VsZWN0ZWRJdGVtcykgfHwgW107XG4gICAgICBzY29wZS5hamF4Q29uZmlnID0gc2NvcGUuJGV2YWwoYXR0cnMuYWpheENvbmZpZykgfHwge307XG4gICAgICAvLyAtLS0tLS0tLS0tIExvY2FsIGRhdGEgLS0tLS0tLS0tLSAvL1xuICAgICAgdmFyIGxhc3RSZXF1ZXN0VG9rZW4sIHdhdGNoZXJzID0gW107XG4gICAgICAvLyAtLS0tLS0tLS0tIHVpIGhhbmRsZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgIHNjb3BlLmFkZFJlbW92ZUl0ZW0gPSBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0sIGl0ZW1zKSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBpZiAoc2NvcGUubG9jYWxDb25maWcuc2luZ2xlU2VsZWN0aW9uTW9kZSkge1xuICAgICAgICAgIHNjb3BlLnNlbGVjdGVkSXRlbXNbMF0gPSBpdGVtO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFkU3RyYXBVdGlscy5hZGRSZW1vdmVJdGVtRnJvbUxpc3QoaXRlbSwgaXRlbXMpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjYWxsYmFjayA9IHNjb3BlLiRldmFsKGF0dHJzLm9uSXRlbUNsaWNrKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2soaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzY29wZS5sb2FkUGFnZSA9IGFkRGVib3VuY2UoZnVuY3Rpb24gKHBhZ2UpIHtcbiAgICAgICAgbGFzdFJlcXVlc3RUb2tlbiA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgIHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhID0gdHJ1ZTtcbiAgICAgICAgdmFyIHBhZ2VMb2FkZXIgPSBzY29wZS4kZXZhbChhdHRycy5wYWdlTG9hZGVyKSB8fCBhZExvYWRQYWdlLCBwYXJhbXMgPSB7XG4gICAgICAgICAgICBwYWdlTnVtYmVyOiBwYWdlLFxuICAgICAgICAgICAgcGFnZVNpemU6IHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSxcbiAgICAgICAgICAgIHNvcnRLZXk6IHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSxcbiAgICAgICAgICAgIHNvcnREaXJlY3Rpb246IHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UsXG4gICAgICAgICAgICBhamF4Q29uZmlnOiBzY29wZS5hamF4Q29uZmlnLFxuICAgICAgICAgICAgdG9rZW46IGxhc3RSZXF1ZXN0VG9rZW5cbiAgICAgICAgICB9LCBzdWNjZXNzSGFuZGxlciA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnRva2VuID09PSBsYXN0UmVxdWVzdFRva2VuKSB7XG4gICAgICAgICAgICAgIGlmIChwYWdlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuaXRlbXMubGlzdCA9IHJlc3BvbnNlLml0ZW1zO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjb3BlLml0ZW1zLmxpc3QgPSBzY29wZS5pdGVtcy5saXN0LmNvbmNhdChyZXNwb25zZS5pdGVtcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2NvcGUuaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMgPSByZXNwb25zZS50b3RhbFBhZ2VzO1xuICAgICAgICAgICAgICBzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPSByZXNwb25zZS5jdXJyZW50UGFnZTtcbiAgICAgICAgICAgICAgc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCBlcnJvckhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSA9IGZhbHNlO1xuICAgICAgICAgIH07XG4gICAgICAgIGlmIChhdHRycy5sb2NhbERhdGFTb3VyY2UpIHtcbiAgICAgICAgICBwYXJhbXMubG9jYWxEYXRhID0gc2NvcGUuJGV2YWwoYXR0cnMubG9jYWxEYXRhU291cmNlKTtcbiAgICAgICAgICBzdWNjZXNzSGFuZGxlcihhZExvYWRMb2NhbFBhZ2UocGFyYW1zKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFnZUxvYWRlcihwYXJhbXMpLnRoZW4oc3VjY2Vzc0hhbmRsZXIsIGVycm9ySGFuZGxlcik7XG4gICAgICAgIH1cbiAgICAgIH0sIDEwKTtcbiAgICAgIHNjb3BlLmxvYWROZXh0UGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSkge1xuICAgICAgICAgIGlmIChzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgKyAxIDw9IHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzKSB7XG4gICAgICAgICAgICBzY29wZS5sb2FkUGFnZShzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgKyAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAvLyAtLS0tLS0tLS0tIGluaXRpYWxpemF0aW9uIGFuZCBldmVudCBsaXN0ZW5lcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgLy9XZSBkbyB0aGUgY29tcGlsZSBhZnRlciBpbmplY3RpbmcgdGhlIG5hbWUgc3BhY2luZyBpbnRvIHRoZSB0ZW1wbGF0ZS5cbiAgICAgIHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgLy8gLS0tLS0tLS0tLSBzZXQgd2F0Y2hlcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgLy8gcmVzZXQgb24gcGFyYW1ldGVyIGNoYW5nZVxuICAgICAgaWYgKGF0dHJzLmFqYXhDb25maWcpIHtcbiAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJzLmFqYXhDb25maWcsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5sb2NhbERhdGFTb3VyY2UpIHtcbiAgICAgICAgd2F0Y2hlcnMucHVzaChzY29wZS4kd2F0Y2goYXR0cnMubG9jYWxEYXRhU291cmNlLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICB3YXRjaGVycy5wdXNoKHNjb3BlLiR3YXRjaChhdHRycy5sb2NhbERhdGFTb3VyY2UgKyAnLmxlbmd0aCcsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgICAvLyAtLS0tLS0tLS0tIGRpc2FibGUgd2F0Y2hlcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaChmdW5jdGlvbiAod2F0Y2hlcikge1xuICAgICAgICAgIHdhdGNoZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHZhciBsaXN0Q29udGFpbmVyID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLmZpbmQoJ3VsJylbMF07XG4gICAgICAvLyBpbmZpbml0ZSBzY3JvbGwgaGFuZGxlclxuICAgICAgdmFyIGxvYWRGdW5jdGlvbiA9IGFkRGVib3VuY2UoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIFRoaXMgaXMgZm9yIGluZmluaXRlIHNjcm9sbGluZy5cbiAgICAgICAgICAvLyBXaGVuIHRoZSBzY3JvbGwgZ2V0cyBjbG9zZXIgdG8gdGhlIGJvdHRvbSwgbG9hZCBtb3JlIGl0ZW1zLlxuICAgICAgICAgIGlmIChsaXN0Q29udGFpbmVyLnNjcm9sbFRvcCArIGxpc3RDb250YWluZXIub2Zmc2V0SGVpZ2h0ID49IGxpc3RDb250YWluZXIuc2Nyb2xsSGVpZ2h0IC0gMzAwKSB7XG4gICAgICAgICAgICBzY29wZS5sb2FkTmV4dFBhZ2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDUwKTtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChsaXN0Q29udGFpbmVyKS5iaW5kKCdtb3VzZXdoZWVsJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGVsdGFZKSB7XG4gICAgICAgICAgbGlzdENvbnRhaW5lci5zY3JvbGxUb3AgKz0gZXZlbnQub3JpZ2luYWxFdmVudC5kZWx0YVk7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBsb2FkRnVuY3Rpb24oKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgbGluazogbGlua0Z1bmN0aW9uLFxuICAgICAgdGVtcGxhdGVVcmw6ICdpbmZpbml0ZWRyb3Bkb3duL2luZmluaXRlZHJvcGRvd24udHBsLmh0bWwnXG4gICAgfTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogbG9hZGluZ2luZGljYXRvci5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLmxvYWRpbmdpbmRpY2F0b3InLCBbXSkuZGlyZWN0aXZlKCdhZExvYWRpbmdJY29uJywgW1xuICAnJGFkQ29uZmlnJyxcbiAgJyRjb21waWxlJyxcbiAgZnVuY3Rpb24gKCRhZENvbmZpZywgJGNvbXBpbGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uIGNvbXBpbGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcHJlOiBmdW5jdGlvbiBwcmVMaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgdmFyIGxvYWRpbmdJY29uQ2xhc3MgPSBhdHRycy5sb2FkaW5nSWNvbkNsYXNzIHx8ICRhZENvbmZpZy5pY29uQ2xhc3Nlcy5sb2FkaW5nU3Bpbm5lciwgbmdTdHlsZVRlbXBsYXRlID0gYXR0cnMubG9hZGluZ0ljb25TaXplID8gJ25nLXN0eWxlPVwie1xcJ2ZvbnQtc2l6ZVxcJzogXFwnJyArIGF0dHJzLmxvYWRpbmdJY29uU2l6ZSArICdcXCd9XCInIDogJycsIHRlbXBsYXRlID0gJzxpIGNsYXNzPVwiJyArIGxvYWRpbmdJY29uQ2xhc3MgKyAnXCIgJyArIG5nU3R5bGVUZW1wbGF0ZSArICc+PC9pPic7XG4gICAgICAgICAgICBlbGVtZW50LmVtcHR5KCk7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZCgkY29tcGlsZSh0ZW1wbGF0ZSkoc2NvcGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXSkuZGlyZWN0aXZlKCdhZExvYWRpbmdPdmVybGF5JywgW1xuICAnJGFkQ29uZmlnJyxcbiAgZnVuY3Rpb24gKCRhZENvbmZpZykge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdsb2FkaW5naW5kaWNhdG9yL2xvYWRpbmdpbmRpY2F0b3IudHBsLmh0bWwnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgbG9hZGluZzogJz0nLFxuICAgICAgICB6SW5kZXg6ICdAJyxcbiAgICAgICAgcG9zaXRpb246ICdAJyxcbiAgICAgICAgY29udGFpbmVyQ2xhc3NlczogJ0AnLFxuICAgICAgICBsb2FkaW5nSWNvbkNsYXNzOiAnQCcsXG4gICAgICAgIGxvYWRpbmdJY29uU2l6ZTogJ0AnXG4gICAgICB9LFxuICAgICAgY29tcGlsZTogZnVuY3Rpb24gY29tcGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBwcmU6IGZ1bmN0aW9uIHByZUxpbmsoc2NvcGUpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRpbmdJY29uQ2xhc3MgPSBzY29wZS5sb2FkaW5nSWNvbkNsYXNzIHx8ICRhZENvbmZpZy5pY29uQ2xhc3Nlcy5sb2FkaW5nO1xuICAgICAgICAgICAgc2NvcGUubG9hZGluZ0ljb25TaXplID0gc2NvcGUubG9hZGluZ0ljb25TaXplIHx8ICczZW0nO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5dKTtcblxuLy8gU291cmNlOiB0YWJsZWFqYXguanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC50YWJsZWFqYXgnLCBbXG4gICdhZGFwdHYuYWRhcHRTdHJhcC51dGlscycsXG4gICdhZGFwdHYuYWRhcHRTdHJhcC5sb2FkaW5naW5kaWNhdG9yJ1xuXSkuZGlyZWN0aXZlKCdhZFRhYmxlQWpheCcsIFtcbiAgJyRwYXJzZScsXG4gICckYWRDb25maWcnLFxuICAnYWRMb2FkUGFnZScsXG4gICdhZERlYm91bmNlJyxcbiAgJ2FkU3RyYXBVdGlscycsXG4gIGZ1bmN0aW9uICgkcGFyc2UsICRhZENvbmZpZywgYWRMb2FkUGFnZSwgYWREZWJvdW5jZSwgYWRTdHJhcFV0aWxzKSB7XG5mdW5jdGlvbiBjb250cm9sbGVyRnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMpIHtcbiAgICAgIC8vIC0tLS0tLS0tLS0gJHNjb3BlIGluaXRpYWxpemF0aW9uIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS5hdHRycyA9ICRhdHRycztcbiAgICAgICRzY29wZS5pY29uQ2xhc3NlcyA9ICRhZENvbmZpZy5pY29uQ2xhc3NlcztcbiAgICAgICRzY29wZS5hZFN0cmFwVXRpbHMgPSBhZFN0cmFwVXRpbHM7XG4gICAgICAkc2NvcGUuaXRlbXMgPSB7XG4gICAgICAgIGxpc3Q6IHVuZGVmaW5lZCxcbiAgICAgICAgcGFnaW5nOiB7XG4gICAgICAgICAgY3VycmVudFBhZ2U6IDEsXG4gICAgICAgICAgdG90YWxQYWdlczogdW5kZWZpbmVkLFxuICAgICAgICAgIHBhZ2VTaXplOiBOdW1iZXIoJGF0dHJzLnBhZ2VTaXplKSB8fCAxMCxcbiAgICAgICAgICBwYWdlU2l6ZXM6ICRwYXJzZSgkYXR0cnMucGFnZVNpemVzKSgpIHx8IFtcbiAgICAgICAgICAgIDEwLFxuICAgICAgICAgICAgMjUsXG4gICAgICAgICAgICA1MFxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5sb2NhbENvbmZpZyA9IHtcbiAgICAgICAgcGFnaW5nQXJyYXk6IFtdLFxuICAgICAgICBsb2FkaW5nRGF0YTogZmFsc2UsXG4gICAgICAgIHRhYmxlTWF4SGVpZ2h0OiAkYXR0cnMudGFibGVNYXhIZWlnaHRcbiAgICAgIH07XG4gICAgICAkc2NvcGUuYWpheENvbmZpZyA9ICRzY29wZS4kZXZhbCgkYXR0cnMuYWpheENvbmZpZyk7XG4gICAgICAkc2NvcGUuY29sdW1uRGVmaW5pdGlvbiA9ICRzY29wZS4kZXZhbCgkYXR0cnMuY29sdW1uRGVmaW5pdGlvbik7XG4gICAgICAvLyAtLS0tLS0tLS0tIExvY2FsIGRhdGEgLS0tLS0tLS0tLSAvL1xuICAgICAgdmFyIGxhc3RSZXF1ZXN0VG9rZW4sIHdhdGNoZXJzID0gW107XG4gICAgICBpZiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZXMuaW5kZXhPZigkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplKSA8IDApIHtcbiAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSA9ICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemVzWzBdO1xuICAgICAgfVxuICAgICAgLy8gLS0tLS0tLS0tLSB1aSBoYW5kbGVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAkc2NvcGUubG9hZFBhZ2UgPSBhZERlYm91bmNlKGZ1bmN0aW9uIChwYWdlKSB7XG4gICAgICAgIGxhc3RSZXF1ZXN0VG9rZW4gPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAkc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEgPSB0cnVlO1xuICAgICAgICB2YXIgcGFnZUxvYWRlciA9ICRzY29wZS4kZXZhbCgkYXR0cnMucGFnZUxvYWRlcikgfHwgYWRMb2FkUGFnZSwgcGFyYW1zID0ge1xuICAgICAgICAgICAgcGFnZU51bWJlcjogcGFnZSxcbiAgICAgICAgICAgIHBhZ2VTaXplOiAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplLFxuICAgICAgICAgICAgc29ydEtleTogJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSxcbiAgICAgICAgICAgIHNvcnREaXJlY3Rpb246ICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlLFxuICAgICAgICAgICAgYWpheENvbmZpZzogJHNjb3BlLmFqYXhDb25maWcsXG4gICAgICAgICAgICB0b2tlbjogbGFzdFJlcXVlc3RUb2tlblxuICAgICAgICAgIH0sIHN1Y2Nlc3NIYW5kbGVyID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UudG9rZW4gPT09IGxhc3RSZXF1ZXN0VG9rZW4pIHtcbiAgICAgICAgICAgICAgJHNjb3BlLml0ZW1zLmxpc3QgPSByZXNwb25zZS5pdGVtcztcbiAgICAgICAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzID0gcmVzcG9uc2UudG90YWxQYWdlcztcbiAgICAgICAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9IHJlc3BvbnNlLmN1cnJlbnRQYWdlO1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucGFnaW5nQXJyYXkgPSByZXNwb25zZS5wYWdpbmdBcnJheTtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgZXJyb3JIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhID0gZmFsc2U7XG4gICAgICAgICAgfTtcbiAgICAgICAgcGFnZUxvYWRlcihwYXJhbXMpLnRoZW4oc3VjY2Vzc0hhbmRsZXIsIGVycm9ySGFuZGxlcik7XG4gICAgICB9KTtcbiAgICAgICRzY29wZS5sb2FkTmV4dFBhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghJHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhKSB7XG4gICAgICAgICAgaWYgKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgKyAxIDw9ICRzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcykge1xuICAgICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgKyAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUubG9hZFByZXZpb3VzUGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCEkc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEpIHtcbiAgICAgICAgICBpZiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAtIDEgPiAwKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAtIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5sb2FkTGFzdFBhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghJHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhKSB7XG4gICAgICAgICAgaWYgKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgIT09ICRzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcykge1xuICAgICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLnBhZ2VTaXplQ2hhbmdlZCA9IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICAgIGlmIChOdW1iZXIoc2l6ZSkgIT09ICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUpIHtcbiAgICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplID0gTnVtYmVyKHNpemUpO1xuICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5zb3J0QnlDb2x1bW4gPSBmdW5jdGlvbiAoY29sdW1uKSB7XG4gICAgICAgIGlmIChjb2x1bW4uc29ydEtleSkge1xuICAgICAgICAgIGlmIChjb2x1bW4uc29ydEtleSAhPT0gJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSkge1xuICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9IGNvbHVtbi5zb3J0S2V5O1xuICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAvLyAtLS0tLS0tLS0tIGluaXRpYWxpemF0aW9uIGFuZCBldmVudCBsaXN0ZW5lcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgJHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgLy8gcmVzZXQgb24gcGFyYW1ldGVyIGNoYW5nZVxuICAgICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHdhdGNoKCRhdHRycy5hamF4Q29uZmlnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgIH0sIHRydWUpKTtcbiAgICAgIHdhdGNoZXJzLnB1c2goJHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJGF0dHJzLmNvbHVtbkRlZmluaXRpb24sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLmNvbHVtbkRlZmluaXRpb24gPSAkc2NvcGUuJGV2YWwoJGF0dHJzLmNvbHVtbkRlZmluaXRpb24pO1xuICAgICAgfSkpO1xuICAgICAgLy8gLS0tLS0tLS0tLSBkaXNhYmxlIHdhdGNoZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKGZ1bmN0aW9uICh3YXRjaGVyKSB7XG4gICAgICAgICAgd2F0Y2hlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0YWJsZWFqYXgvdGFibGVhamF4LnRwbC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6IFtcbiAgICAgICAgJyRzY29wZScsXG4gICAgICAgICckYXR0cnMnLFxuICAgICAgICBjb250cm9sbGVyRnVuY3Rpb25cbiAgICAgIF1cbiAgICB9O1xuICB9XG5dKTtcblxuLy8gU291cmNlOiB0YWJsZWxpdGUuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC50YWJsZWxpdGUnLCBbJ2FkYXB0di5hZGFwdFN0cmFwLnV0aWxzJ10pLmRpcmVjdGl2ZSgnYWRUYWJsZUxpdGUnLCBbXG4gICckcGFyc2UnLFxuICAnJGh0dHAnLFxuICAnJGNvbXBpbGUnLFxuICAnJGZpbHRlcicsXG4gICckdGVtcGxhdGVDYWNoZScsXG4gICckYWRDb25maWcnLFxuICAnYWRTdHJhcFV0aWxzJyxcbiAgJ2FkRGVib3VuY2UnLFxuICAnYWRMb2FkTG9jYWxQYWdlJyxcbiAgZnVuY3Rpb24gKCRwYXJzZSwgJGh0dHAsICRjb21waWxlLCAkZmlsdGVyLCAkdGVtcGxhdGVDYWNoZSwgJGFkQ29uZmlnLCBhZFN0cmFwVXRpbHMsIGFkRGVib3VuY2UsIGFkTG9hZExvY2FsUGFnZSkge1xuZnVuY3Rpb24gY29udHJvbGxlckZ1bmN0aW9uKCRzY29wZSwgJGF0dHJzKSB7XG4gICAgICAvLyAtLS0tLS0tLS0tICQkc2NvcGUgaW5pdGlhbGl6YXRpb24gLS0tLS0tLS0tLSAvL1xuICAgICAgJHNjb3BlLmF0dHJzID0gJGF0dHJzO1xuICAgICAgJHNjb3BlLmljb25DbGFzc2VzID0gJGFkQ29uZmlnLmljb25DbGFzc2VzO1xuICAgICAgJHNjb3BlLmFkU3RyYXBVdGlscyA9IGFkU3RyYXBVdGlscztcbiAgICAgICRzY29wZS5jb2x1bW5EZWZpbml0aW9uID0gJHNjb3BlLiRldmFsKCRhdHRycy5jb2x1bW5EZWZpbml0aW9uKTtcbiAgICAgICRzY29wZS5pdGVtcyA9IHtcbiAgICAgICAgbGlzdDogdW5kZWZpbmVkLFxuICAgICAgICBhbGxJdGVtczogdW5kZWZpbmVkLFxuICAgICAgICBwYWdpbmc6IHtcbiAgICAgICAgICBjdXJyZW50UGFnZTogMSxcbiAgICAgICAgICB0b3RhbFBhZ2VzOiB1bmRlZmluZWQsXG4gICAgICAgICAgcGFnZVNpemU6IE51bWJlcigkYXR0cnMucGFnZVNpemUpIHx8IDEwLFxuICAgICAgICAgIHBhZ2VTaXplczogJHBhcnNlKCRhdHRycy5wYWdlU2l6ZXMpKCkgfHwgW1xuICAgICAgICAgICAgMTAsXG4gICAgICAgICAgICAyNSxcbiAgICAgICAgICAgIDUwXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnID0ge1xuICAgICAgICBsb2NhbERhdGE6IGFkU3RyYXBVdGlscy5wYXJzZSgkc2NvcGUuJGV2YWwoJGF0dHJzLmxvY2FsRGF0YVNvdXJjZSkpLFxuICAgICAgICBwYWdpbmdBcnJheTogW10sXG4gICAgICAgIGRyYWdDaGFuZ2U6ICRzY29wZS4kZXZhbCgkYXR0cnMub25EcmFnQ2hhbmdlKVxuICAgICAgfTtcbiAgICAgICRzY29wZS5zZWxlY3RlZEl0ZW1zID0gJHNjb3BlLiRldmFsKCRhdHRycy5zZWxlY3RlZEl0ZW1zKTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gTG9jYWwgZGF0YSAtLS0tLS0tLS0tIC8vXG4gICAgICB2YXIgcGxhY2VIb2xkZXIgPSBudWxsLCBwYWdlQnV0dG9uRWxlbWVudCA9IG51bGwsIHZhbGlkRHJvcCA9IGZhbHNlLCBpbml0aWFsUG9zLCB3YXRjaGVycyA9IFtdO1xuICAgICAgZnVuY3Rpb24gbW92ZUVsZW1lbnROb2RlKG5vZGVUb01vdmUsIHJlbGF0aXZlTm9kZSwgZHJhZ05vZGUpIHtcbiAgICAgICAgaWYgKHJlbGF0aXZlTm9kZS5uZXh0KClbMF0gPT09IG5vZGVUb01vdmVbMF0pIHtcbiAgICAgICAgICByZWxhdGl2ZU5vZGUuYmVmb3JlKG5vZGVUb01vdmUpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlbGF0aXZlTm9kZS5wcmV2KClbMF0gPT09IG5vZGVUb01vdmVbMF0pIHtcbiAgICAgICAgICByZWxhdGl2ZU5vZGUuYWZ0ZXIobm9kZVRvTW92ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHJlbGF0aXZlTm9kZS5uZXh0KClbMF0gPT09IGRyYWdOb2RlWzBdKSB7XG4gICAgICAgICAgICByZWxhdGl2ZU5vZGUuYmVmb3JlKG5vZGVUb01vdmUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocmVsYXRpdmVOb2RlLnByZXYoKVswXSA9PT0gZHJhZ05vZGVbMF0pIHtcbiAgICAgICAgICAgIHJlbGF0aXZlTm9kZS5hZnRlcihub2RlVG9Nb3ZlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICgkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplcy5pbmRleE9mKCRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUpIDwgMCkge1xuICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplID0gJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZXNbMF07XG4gICAgICB9XG4gICAgICAvLyAtLS0tLS0tLS0tIHVpIGhhbmRsZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS5sb2FkUGFnZSA9IGFkRGVib3VuY2UoZnVuY3Rpb24gKHBhZ2UpIHtcbiAgICAgICAgdmFyIGl0ZW1zT2JqZWN0ID0gJHNjb3BlLmxvY2FsQ29uZmlnLmxvY2FsRGF0YSA9IGFkU3RyYXBVdGlscy5wYXJzZSgkc2NvcGUuJGV2YWwoJGF0dHJzLmxvY2FsRGF0YVNvdXJjZSkpLCBwYXJhbXM7XG4gICAgICAgIHBhcmFtcyA9IHtcbiAgICAgICAgICBwYWdlTnVtYmVyOiBwYWdlLFxuICAgICAgICAgIHBhZ2VTaXplOiAhJGF0dHJzLmRpc2FibGVQYWdpbmcgPyAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplIDogaXRlbXNPYmplY3QubGVuZ3RoLFxuICAgICAgICAgIHNvcnRLZXk6ICRzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUsXG4gICAgICAgICAgc29ydERpcmVjdGlvbjogJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UsXG4gICAgICAgICAgbG9jYWxEYXRhOiBpdGVtc09iamVjdFxuICAgICAgICB9O1xuICAgICAgICB2YXIgcmVzcG9uc2UgPSBhZExvYWRMb2NhbFBhZ2UocGFyYW1zKTtcbiAgICAgICAgJHNjb3BlLml0ZW1zLmxpc3QgPSByZXNwb25zZS5pdGVtcztcbiAgICAgICAgJHNjb3BlLml0ZW1zLmFsbEl0ZW1zID0gcmVzcG9uc2UuYWxsSXRlbXM7XG4gICAgICAgICRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPSByZXNwb25zZS5jdXJyZW50UGFnZTtcbiAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzID0gcmVzcG9uc2UudG90YWxQYWdlcztcbiAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnBhZ2luZ0FycmF5ID0gcmVzcG9uc2UucGFnaW5nQXJyYXk7XG4gICAgICB9LCAxMDApO1xuICAgICAgJHNjb3BlLmxvYWROZXh0UGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgKyAxIDw9ICRzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcykge1xuICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUubG9hZFByZXZpb3VzUGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgLSAxID4gMCkge1xuICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUubG9hZExhc3RQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoISRzY29wZS5sb2NhbENvbmZpZy5kaXNhYmxlUGFnaW5nKSB7XG4gICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUucGFnZVNpemVDaGFuZ2VkID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSA9IHNpemU7XG4gICAgICAgICRzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgIH07XG4gICAgICAkc2NvcGUuc29ydEJ5Q29sdW1uID0gZnVuY3Rpb24gKGNvbHVtbikge1xuICAgICAgICBpZiAoY29sdW1uLnNvcnRLZXkpIHtcbiAgICAgICAgICBpZiAoY29sdW1uLnNvcnRLZXkgIT09ICRzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUgPSBjb2x1bW4uc29ydEtleTtcbiAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLnVuU29ydFRhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9IHVuZGVmaW5lZDtcbiAgICAgIH07XG4gICAgICAkc2NvcGUub25EcmFnU3RhcnQgPSBmdW5jdGlvbiAoZGF0YSwgZHJhZ0VsZW1lbnQpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGRyYWdFbGVtZW50LnBhcmVudCgpO1xuICAgICAgICBwbGFjZUhvbGRlciA9ICQoJzx0cj48dGQgY29sc3Bhbj0nICsgZHJhZ0VsZW1lbnQuZmluZCgndGQnKS5sZW5ndGggKyAnPiZuYnNwOzwvdGQ+PC90cj4nKTtcbiAgICAgICAgaW5pdGlhbFBvcyA9IGRyYWdFbGVtZW50LmluZGV4KCkgKyAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAtIDEpICogJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSAtIDE7XG4gICAgICAgIGlmIChkcmFnRWxlbWVudFswXSAhPT0gcGFyZW50LmNoaWxkcmVuKCkubGFzdCgpWzBdKSB7XG4gICAgICAgICAgZHJhZ0VsZW1lbnQubmV4dCgpLmJlZm9yZShwbGFjZUhvbGRlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFyZW50LmFwcGVuZChwbGFjZUhvbGRlcik7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUub25EcmFnRW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBwbGFjZUhvbGRlci5yZW1vdmUoKTtcbiAgICAgIH07XG4gICAgICAkc2NvcGUub25EcmFnT3ZlciA9IGZ1bmN0aW9uIChkYXRhLCBkcmFnRWxlbWVudCwgZHJvcEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHBsYWNlSG9sZGVyKSB7XG4gICAgICAgICAgLy8gUmVzdHJpY3RzIHZhbGlkIGRyYWcgdG8gY3VycmVudCB0YWJsZSBpbnN0YW5jZVxuICAgICAgICAgIG1vdmVFbGVtZW50Tm9kZShwbGFjZUhvbGRlciwgZHJvcEVsZW1lbnQsIGRyYWdFbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5vbkRyb3BFbmQgPSBmdW5jdGlvbiAoZGF0YSwgZHJhZ0VsZW1lbnQpIHtcbiAgICAgICAgdmFyIGVuZFBvcztcbiAgICAgICAgaWYgKHBsYWNlSG9sZGVyKSB7XG4gICAgICAgICAgLy8gUmVzdHJpY3RzIGRyb3AgdG8gY3VycmVudCB0YWJsZSBpbnN0YW5jZVxuICAgICAgICAgIGlmIChwbGFjZUhvbGRlci5uZXh0KClbMF0pIHtcbiAgICAgICAgICAgIHBsYWNlSG9sZGVyLm5leHQoKS5iZWZvcmUoZHJhZ0VsZW1lbnQpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGxhY2VIb2xkZXIucHJldigpWzBdKSB7XG4gICAgICAgICAgICBwbGFjZUhvbGRlci5wcmV2KCkuYWZ0ZXIoZHJhZ0VsZW1lbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwbGFjZUhvbGRlci5yZW1vdmUoKTtcbiAgICAgICAgICB2YWxpZERyb3AgPSB0cnVlO1xuICAgICAgICAgIGVuZFBvcyA9IGRyYWdFbGVtZW50LmluZGV4KCkgKyAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAtIDEpICogJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSAtIDE7XG4gICAgICAgICAgYWRTdHJhcFV0aWxzLm1vdmVJdGVtSW5MaXN0KGluaXRpYWxQb3MsIGVuZFBvcywgJHNjb3BlLmxvY2FsQ29uZmlnLmxvY2FsRGF0YSk7XG4gICAgICAgICAgJHNjb3BlLnVuU29ydFRhYmxlKCk7XG4gICAgICAgICAgaWYgKCRzY29wZS5sb2NhbENvbmZpZy5kcmFnQ2hhbmdlKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcuZHJhZ0NoYW5nZShpbml0aWFsUG9zLCBlbmRQb3MsIGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocGFnZUJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgICBwYWdlQnV0dG9uRWxlbWVudC5yZW1vdmVDbGFzcygnYnRuLXByaW1hcnknKTtcbiAgICAgICAgICBwYWdlQnV0dG9uRWxlbWVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUub25OZXh0UGFnZUJ1dHRvbk92ZXIgPSBmdW5jdGlvbiAoZGF0YSwgZHJhZ0VsZW1lbnQsIGRyb3BFbGVtZW50KSB7XG4gICAgICAgIGlmIChwYWdlQnV0dG9uRWxlbWVudCkge1xuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50LnJlbW92ZUNsYXNzKCdidG4tcHJpbWFyeScpO1xuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZHJvcEVsZW1lbnQuYXR0cignZGlzYWJsZWQnKSAhPT0gJ2Rpc2FibGVkJykge1xuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50ID0gZHJvcEVsZW1lbnQ7XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQuYWRkQ2xhc3MoJ2J0bi1wcmltYXJ5Jyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUub25OZXh0UGFnZUJ1dHRvbkRyb3AgPSBmdW5jdGlvbiAoZGF0YSwgZHJhZ0VsZW1lbnQpIHtcbiAgICAgICAgdmFyIGVuZFBvcztcbiAgICAgICAgaWYgKHBhZ2VCdXR0b25FbGVtZW50KSB7XG4gICAgICAgICAgdmFsaWREcm9wID0gdHJ1ZTtcbiAgICAgICAgICBpZiAocGFnZUJ1dHRvbkVsZW1lbnQuYXR0cignaWQnKSA9PT0gJ2J0blByZXYnKSB7XG4gICAgICAgICAgICBlbmRQb3MgPSAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplICogKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgLSAxKSAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwYWdlQnV0dG9uRWxlbWVudC5hdHRyKCdpZCcpID09PSAnYnRuTmV4dCcpIHtcbiAgICAgICAgICAgIGVuZFBvcyA9ICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgKiAkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhZFN0cmFwVXRpbHMubW92ZUl0ZW1Jbkxpc3QoaW5pdGlhbFBvcywgZW5kUG9zLCAkc2NvcGUubG9jYWxDb25maWcubG9jYWxEYXRhKTtcbiAgICAgICAgICBwbGFjZUhvbGRlci5yZW1vdmUoKTtcbiAgICAgICAgICBkcmFnRWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICBpZiAoJHNjb3BlLmxvY2FsQ29uZmlnLmRyYWdDaGFuZ2UpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5kcmFnQ2hhbmdlKGluaXRpYWxQb3MsIGVuZFBvcywgZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50LnJlbW92ZUNsYXNzKCdidG4tcHJpbWFyeScpO1xuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gaW5pdGlhbGl6YXRpb24gYW5kIGV2ZW50IGxpc3RlbmVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAkc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICAvLyAtLS0tLS0tLS0tIHNldCB3YXRjaGVycyAtLS0tLS0tLS0tIC8vXG4gICAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kd2F0Y2goJGF0dHJzLmxvY2FsRGF0YVNvdXJjZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSk7XG4gICAgICB9KSk7XG4gICAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kd2F0Y2goJGF0dHJzLmxvY2FsRGF0YVNvdXJjZSArICcubGVuZ3RoJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSk7XG4gICAgICB9KSk7XG4gICAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCRhdHRycy5jb2x1bW5EZWZpbml0aW9uLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5jb2x1bW5EZWZpbml0aW9uID0gJHNjb3BlLiRldmFsKCRhdHRycy5jb2x1bW5EZWZpbml0aW9uKTtcbiAgICAgIH0pKTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gZGlzYWJsZSB3YXRjaGVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaChmdW5jdGlvbiAod2F0Y2hlcikge1xuICAgICAgICAgIHdhdGNoZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICBjb250cm9sbGVyOiBbXG4gICAgICAgICckc2NvcGUnLFxuICAgICAgICAnJGF0dHJzJyxcbiAgICAgICAgY29udHJvbGxlckZ1bmN0aW9uXG4gICAgICBdLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0YWJsZWxpdGUvdGFibGVsaXRlLnRwbC5odG1sJyxcbiAgICAgIHNjb3BlOiB0cnVlXG4gICAgfTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogdHJlZWJyb3dzZXIuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC50cmVlYnJvd3NlcicsIFtdKS5kaXJlY3RpdmUoJ2FkVHJlZUJyb3dzZXInLCBbXG4gICckYWRDb25maWcnLFxuICBmdW5jdGlvbiAoJGFkQ29uZmlnKSB7XG4gICAgZnVuY3Rpb24gY29udHJvbGxlckZ1bmN0aW9uKCRzY29wZSwgJGF0dHJzKSB7XG4gICAgICB2YXIgdGVtcGxhdGVUb2tlbiA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAvLyBzY29wZSBpbml0aWFsaXphdGlvblxuICAgICAgJHNjb3BlLmF0dHJzID0gJGF0dHJzO1xuICAgICAgJHNjb3BlLmljb25DbGFzc2VzID0gJGFkQ29uZmlnLmljb25DbGFzc2VzO1xuICAgICAgJHNjb3BlLnRyZWVSb290ID0gJHNjb3BlLiRldmFsKCRhdHRycy50cmVlUm9vdCkgfHwge307XG4gICAgICAkc2NvcGUudG9nZ2xlID0gZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XG4gICAgICAgIHZhciB0b2dnbGVDYWxsYmFjaztcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRvZ2dsZUNhbGxiYWNrID0gJHNjb3BlLiRldmFsKCRhdHRycy50b2dnbGVDYWxsYmFjayk7XG4gICAgICAgIGlmICh0b2dnbGVDYWxsYmFjaykge1xuICAgICAgICAgIHRvZ2dsZUNhbGxiYWNrKGl0ZW0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uX2FkX2V4cGFuZGVkID0gIWl0ZW0uX2FkX2V4cGFuZGVkO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdmFyIGhhc0NoaWxkcmVuID0gJHNjb3BlLiRldmFsKCRhdHRycy5oYXNDaGlsZHJlbik7XG4gICAgICAkc2NvcGUuaGFzQ2hpbGRyZW4gPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICB2YXIgZm91bmQgPSBpdGVtWyRhdHRycy5jaGlsZE5vZGVdICYmIGl0ZW1bJGF0dHJzLmNoaWxkTm9kZV0ubGVuZ3RoID4gMDtcbiAgICAgICAgaWYgKGhhc0NoaWxkcmVuKSB7XG4gICAgICAgICAgZm91bmQgPSBoYXNDaGlsZHJlbihpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICB9O1xuICAgICAgLy8gZm9yIHVuaXF1ZSB0ZW1wbGF0ZVxuICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnID0geyByZW5kZXJlclRlbXBsYXRlSWQ6ICd0cmVlLXJlbmRlcmVyLScgKyB0ZW1wbGF0ZVRva2VuICsgJy5odG1sJyB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgY29udHJvbGxlcjogW1xuICAgICAgICAnJHNjb3BlJyxcbiAgICAgICAgJyRhdHRycycsXG4gICAgICAgIGNvbnRyb2xsZXJGdW5jdGlvblxuICAgICAgXSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndHJlZWJyb3dzZXIvdHJlZWJyb3dzZXIudHBsLmh0bWwnXG4gICAgfTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogdXRpbHMuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC51dGlscycsIFtdKS5mYWN0b3J5KCdhZFN0cmFwVXRpbHMnLCBbXG4gICckZmlsdGVyJyxcbiAgZnVuY3Rpb24gKCRmaWx0ZXIpIHtcbiAgICB2YXIgZXZhbE9iamVjdFByb3BlcnR5ID0gZnVuY3Rpb24gKG9iaiwgcHJvcGVydHkpIHtcbiAgICAgICAgdmFyIGFyciA9IHByb3BlcnR5LnNwbGl0KCcuJyk7XG4gICAgICAgIGlmIChvYmopIHtcbiAgICAgICAgICB3aGlsZSAoYXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIGtleSA9IGFyci5zaGlmdCgpO1xuICAgICAgICAgICAgaWYgKG9iaikge1xuICAgICAgICAgICAgICBvYmogPSBvYmpba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH0sIGFwcGx5RmlsdGVyID0gZnVuY3Rpb24gKHZhbHVlLCBmaWx0ZXIsIGl0ZW0pIHtcbiAgICAgICAgdmFyIHBhcnRzLCBmaWx0ZXJPcHRpb25zO1xuICAgICAgICBpZiAodmFsdWUgJiYgJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXIpIHtcbiAgICAgICAgICBwYXJ0cyA9IGZpbHRlci5zcGxpdCgnOicpO1xuICAgICAgICAgIGZpbHRlck9wdGlvbnMgPSBwYXJ0c1sxXTtcbiAgICAgICAgICBpZiAoZmlsdGVyT3B0aW9ucykge1xuICAgICAgICAgICAgdmFsdWUgPSAkZmlsdGVyKHBhcnRzWzBdKSh2YWx1ZSwgZmlsdGVyT3B0aW9ucyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gJGZpbHRlcihwYXJ0c1swXSkodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9LCBpdGVtRXhpc3RzSW5MaXN0ID0gZnVuY3Rpb24gKGNvbXBhcmVJdGVtLCBsaXN0KSB7XG4gICAgICAgIHZhciBleGlzdCA9IGZhbHNlO1xuICAgICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoY29tcGFyZUl0ZW0sIGl0ZW0pKSB7XG4gICAgICAgICAgICBleGlzdCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGV4aXN0O1xuICAgICAgfSwgaXRlbXNFeGlzdEluTGlzdCA9IGZ1bmN0aW9uIChpdGVtcywgbGlzdCkge1xuICAgICAgICB2YXIgZXhpc3QgPSB0cnVlLCBpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoaXRlbUV4aXN0c0luTGlzdChpdGVtc1tpXSwgbGlzdCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBleGlzdCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBleGlzdDtcbiAgICAgIH0sIGFkZEl0ZW1Ub0xpc3QgPSBmdW5jdGlvbiAoaXRlbSwgbGlzdCkge1xuICAgICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgICB9LCByZW1vdmVJdGVtRnJvbUxpc3QgPSBmdW5jdGlvbiAoaXRlbSwgbGlzdCkge1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgZm9yIChpID0gbGlzdC5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyhpdGVtLCBsaXN0W2ldKSkge1xuICAgICAgICAgICAgbGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBhZGRSZW1vdmVJdGVtRnJvbUxpc3QgPSBmdW5jdGlvbiAoaXRlbSwgbGlzdCkge1xuICAgICAgICB2YXIgaSwgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgZm9yIChpID0gbGlzdC5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyhpdGVtLCBsaXN0W2ldKSkge1xuICAgICAgICAgICAgbGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChmb3VuZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0sIGFkZEl0ZW1zVG9MaXN0ID0gZnVuY3Rpb24gKGl0ZW1zLCBsaXN0KSB7XG4gICAgICAgIGl0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICBpZiAoIWl0ZW1FeGlzdHNJbkxpc3QoaXRlbSwgbGlzdCkpIHtcbiAgICAgICAgICAgIGFkZFJlbW92ZUl0ZW1Gcm9tTGlzdChpdGVtLCBsaXN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSwgYWRkUmVtb3ZlSXRlbXNGcm9tTGlzdCA9IGZ1bmN0aW9uIChpdGVtcywgbGlzdCkge1xuICAgICAgICBpZiAoaXRlbXNFeGlzdEluTGlzdChpdGVtcywgbGlzdCkpIHtcbiAgICAgICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWRkSXRlbXNUb0xpc3QoaXRlbXMsIGxpc3QpO1xuICAgICAgICB9XG4gICAgICB9LCBtb3ZlSXRlbUluTGlzdCA9IGZ1bmN0aW9uIChzdGFydFBvcywgZW5kUG9zLCBsaXN0KSB7XG4gICAgICAgIGlmIChlbmRQb3MgPCBsaXN0Lmxlbmd0aCkge1xuICAgICAgICAgIGxpc3Quc3BsaWNlKGVuZFBvcywgMCwgbGlzdC5zcGxpY2Uoc3RhcnRQb3MsIDEpWzBdKTtcbiAgICAgICAgfVxuICAgICAgfSwgcGFyc2UgPSBmdW5jdGlvbiAoaXRlbXMpIHtcbiAgICAgICAgdmFyIGl0ZW1zT2JqZWN0ID0gW107XG4gICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkoaXRlbXMpKSB7XG4gICAgICAgICAgaXRlbXNPYmplY3QgPSBpdGVtcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goaXRlbXMsIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICBpdGVtc09iamVjdC5wdXNoKGl0ZW0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtc09iamVjdDtcbiAgICAgIH0sIGdldE9iamVjdFByb3BlcnR5ID0gZnVuY3Rpb24gKGl0ZW0sIHByb3BlcnR5KSB7XG4gICAgICAgIGlmIChwcm9wZXJ0eSAmJiAnZnVuY3Rpb24nID09PSB0eXBlb2YgcHJvcGVydHkpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcGVydHkoaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFyciA9IHByb3BlcnR5LnNwbGl0KCcuJyk7XG4gICAgICAgIHdoaWxlIChhcnIubGVuZ3RoKSB7XG4gICAgICAgICAgaXRlbSA9IGl0ZW1bYXJyLnNoaWZ0KCldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgZXZhbE9iamVjdFByb3BlcnR5OiBldmFsT2JqZWN0UHJvcGVydHksXG4gICAgICBhcHBseUZpbHRlcjogYXBwbHlGaWx0ZXIsXG4gICAgICBpdGVtRXhpc3RzSW5MaXN0OiBpdGVtRXhpc3RzSW5MaXN0LFxuICAgICAgaXRlbXNFeGlzdEluTGlzdDogaXRlbXNFeGlzdEluTGlzdCxcbiAgICAgIGFkZEl0ZW1Ub0xpc3Q6IGFkZEl0ZW1Ub0xpc3QsXG4gICAgICByZW1vdmVJdGVtRnJvbUxpc3Q6IHJlbW92ZUl0ZW1Gcm9tTGlzdCxcbiAgICAgIGFkZFJlbW92ZUl0ZW1Gcm9tTGlzdDogYWRkUmVtb3ZlSXRlbUZyb21MaXN0LFxuICAgICAgYWRkSXRlbXNUb0xpc3Q6IGFkZEl0ZW1zVG9MaXN0LFxuICAgICAgYWRkUmVtb3ZlSXRlbXNGcm9tTGlzdDogYWRkUmVtb3ZlSXRlbXNGcm9tTGlzdCxcbiAgICAgIG1vdmVJdGVtSW5MaXN0OiBtb3ZlSXRlbUluTGlzdCxcbiAgICAgIHBhcnNlOiBwYXJzZSxcbiAgICAgIGdldE9iamVjdFByb3BlcnR5OiBnZXRPYmplY3RQcm9wZXJ0eVxuICAgIH07XG4gIH1cbl0pLmZhY3RvcnkoJ2FkRGVib3VuY2UnLCBbXG4gICckdGltZW91dCcsXG4gICckcScsXG4gIGZ1bmN0aW9uICgkdGltZW91dCwgJHEpIHtcbnZhciBkZWIgPSBmdW5jdGlvbiAoZnVuYywgZGVsYXksIGltbWVkaWF0ZSwgY3R4KSB7XG4gICAgICB2YXIgdGltZXIgPSBudWxsLCBkZWZlcnJlZCA9ICRxLmRlZmVyKCksIHdhaXQgPSBkZWxheSB8fCAzMDA7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY29udGV4dCA9IGN0eCB8fCB0aGlzLCBhcmdzID0gYXJndW1lbnRzLCBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lciwgbGF0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncykpO1xuICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aW1lciA9ICR0aW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncykpO1xuICAgICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgIH07XG4gICAgfTtcbiAgICByZXR1cm4gZGViO1xuICB9XG5dKS5kaXJlY3RpdmUoJ2FkQ29tcGlsZVRlbXBsYXRlJywgW1xuICAnJGNvbXBpbGUnLFxuICBmdW5jdGlvbiAoJGNvbXBpbGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgc2NvcGUuJHdhdGNoKGZ1bmN0aW9uIChzY29wZSkge1xuICAgICAgICByZXR1cm4gc2NvcGUuJGV2YWwoYXR0cnMuYWRDb21waWxlVGVtcGxhdGUpO1xuICAgICAgfSwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGVsZW1lbnQuaHRtbCh2YWx1ZSk7XG4gICAgICAgICRjb21waWxlKGVsZW1lbnQuY29udGVudHMoKSkoc2NvcGUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXSkuZmFjdG9yeSgnYWRMb2FkUGFnZScsIFtcbiAgJyRhZENvbmZpZycsXG4gICckaHR0cCcsXG4gICdhZFN0cmFwVXRpbHMnLFxuICBmdW5jdGlvbiAoJGFkQ29uZmlnLCAkaHR0cCwgYWRTdHJhcFV0aWxzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICB2YXIgc3RhcnQgPSAob3B0aW9ucy5wYWdlTnVtYmVyIC0gMSkgKiBvcHRpb25zLnBhZ2VTaXplLCBwYWdpbmdDb25maWcgPSBhbmd1bGFyLmNvcHkoJGFkQ29uZmlnLnBhZ2luZyksIGFqYXhDb25maWcgPSBhbmd1bGFyLmNvcHkob3B0aW9ucy5hamF4Q29uZmlnKTtcbiAgICAgIGlmIChhamF4Q29uZmlnLnBhZ2luYXRpb25Db25maWcgJiYgYWpheENvbmZpZy5wYWdpbmF0aW9uQ29uZmlnLnJlcXVlc3QpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQocGFnaW5nQ29uZmlnLnJlcXVlc3QsIGFqYXhDb25maWcucGFnaW5hdGlvbkNvbmZpZy5yZXF1ZXN0KTtcbiAgICAgIH1cbiAgICAgIGlmIChhamF4Q29uZmlnLnBhZ2luYXRpb25Db25maWcgJiYgYWpheENvbmZpZy5wYWdpbmF0aW9uQ29uZmlnLnJlc3BvbnNlKSB7XG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHBhZ2luZ0NvbmZpZy5yZXNwb25zZSwgYWpheENvbmZpZy5wYWdpbmF0aW9uQ29uZmlnLnJlc3BvbnNlKTtcbiAgICAgIH1cbiAgICAgIGFqYXhDb25maWcucGFyYW1zID0gYWpheENvbmZpZy5wYXJhbXMgPyBhamF4Q29uZmlnLnBhcmFtcyA6IHt9O1xuICAgICAgYWpheENvbmZpZy5wYXJhbXNbcGFnaW5nQ29uZmlnLnJlcXVlc3Quc3RhcnRdID0gc3RhcnQ7XG4gICAgICBhamF4Q29uZmlnLnBhcmFtc1twYWdpbmdDb25maWcucmVxdWVzdC5wYWdlU2l6ZV0gPSBvcHRpb25zLnBhZ2VTaXplO1xuICAgICAgYWpheENvbmZpZy5wYXJhbXNbcGFnaW5nQ29uZmlnLnJlcXVlc3QucGFnZV0gPSBvcHRpb25zLnBhZ2VOdW1iZXI7XG4gICAgICBpZiAob3B0aW9ucy5zb3J0S2V5KSB7XG4gICAgICAgIGFqYXhDb25maWcucGFyYW1zW3BhZ2luZ0NvbmZpZy5yZXF1ZXN0LnNvcnRGaWVsZF0gPSBvcHRpb25zLnNvcnRLZXk7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5zb3J0RGlyZWN0aW9uID09PSBmYWxzZSkge1xuICAgICAgICBhamF4Q29uZmlnLnBhcmFtc1twYWdpbmdDb25maWcucmVxdWVzdC5zb3J0RGlyZWN0aW9uXSA9IHBhZ2luZ0NvbmZpZy5yZXF1ZXN0LnNvcnRBc2NWYWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5zb3J0RGlyZWN0aW9uID09PSB0cnVlKSB7XG4gICAgICAgIGFqYXhDb25maWcucGFyYW1zW3BhZ2luZ0NvbmZpZy5yZXF1ZXN0LnNvcnREaXJlY3Rpb25dID0gcGFnaW5nQ29uZmlnLnJlcXVlc3Quc29ydERlc2NWYWx1ZTtcbiAgICAgIH1cbiAgICAgIHZhciBwcm9taXNlO1xuICAgICAgaWYgKGFqYXhDb25maWcubWV0aG9kID09PSAnSlNPTlAnKSB7XG4gICAgICAgIHByb21pc2UgPSAkaHR0cC5qc29ucChhamF4Q29uZmlnLnVybCArICc/Y2FsbGJhY2s9SlNPTl9DQUxMQkFDSycsIGFqYXhDb25maWcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbWlzZSA9ICRodHRwKGFqYXhDb25maWcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgICAgIGl0ZW1zOiBhZFN0cmFwVXRpbHMuZXZhbE9iamVjdFByb3BlcnR5KHJlc3VsdC5kYXRhLCBwYWdpbmdDb25maWcucmVzcG9uc2UuaXRlbXNMb2NhdGlvbiksXG4gICAgICAgICAgICBjdXJyZW50UGFnZTogb3B0aW9ucy5wYWdlTnVtYmVyLFxuICAgICAgICAgICAgdG90YWxQYWdlczogTWF0aC5jZWlsKGFkU3RyYXBVdGlscy5ldmFsT2JqZWN0UHJvcGVydHkocmVzdWx0LmRhdGEsIHBhZ2luZ0NvbmZpZy5yZXNwb25zZS50b3RhbEl0ZW1zKSAvIG9wdGlvbnMucGFnZVNpemUpLFxuICAgICAgICAgICAgcGFnaW5nQXJyYXk6IFtdLFxuICAgICAgICAgICAgdG9rZW46IG9wdGlvbnMudG9rZW5cbiAgICAgICAgICB9O1xuICAgICAgICB2YXIgVE9UQUxfUEFHSU5BVElPTl9JVEVNUyA9IDU7XG4gICAgICAgIHZhciBtaW5pbXVtQm91bmQgPSBvcHRpb25zLnBhZ2VOdW1iZXIgLSBNYXRoLmZsb29yKFRPVEFMX1BBR0lOQVRJT05fSVRFTVMgLyAyKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IG1pbmltdW1Cb3VuZDsgaSA8PSBvcHRpb25zLnBhZ2VOdW1iZXI7IGkrKykge1xuICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgcmVzcG9uc2UucGFnaW5nQXJyYXkucHVzaChpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHJlc3BvbnNlLnBhZ2luZ0FycmF5Lmxlbmd0aCA8IFRPVEFMX1BBR0lOQVRJT05fSVRFTVMpIHtcbiAgICAgICAgICBpZiAoaSA+IHJlc3BvbnNlLnRvdGFsUGFnZXMpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXNwb25zZS5wYWdpbmdBcnJheS5wdXNoKGkpO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5dKS5mYWN0b3J5KCdhZExvYWRMb2NhbFBhZ2UnLCBbXG4gICckZmlsdGVyJyxcbiAgZnVuY3Rpb24gKCRmaWx0ZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgICBpdGVtczogdW5kZWZpbmVkLFxuICAgICAgICAgIGN1cnJlbnRQYWdlOiBvcHRpb25zLnBhZ2VOdW1iZXIsXG4gICAgICAgICAgdG90YWxQYWdlczogdW5kZWZpbmVkLFxuICAgICAgICAgIHBhZ2luZ0FycmF5OiBbXSxcbiAgICAgICAgICB0b2tlbjogb3B0aW9ucy50b2tlblxuICAgICAgICB9O1xuICAgICAgdmFyIHN0YXJ0ID0gKG9wdGlvbnMucGFnZU51bWJlciAtIDEpICogb3B0aW9ucy5wYWdlU2l6ZSwgZW5kID0gc3RhcnQgKyBvcHRpb25zLnBhZ2VTaXplLCBpLCBpdGVtc09iamVjdCA9IG9wdGlvbnMubG9jYWxEYXRhLCBsb2NhbEl0ZW1zO1xuICAgICAgbG9jYWxJdGVtcyA9ICRmaWx0ZXIoJ29yZGVyQnknKShpdGVtc09iamVjdCwgb3B0aW9ucy5zb3J0S2V5LCBvcHRpb25zLnNvcnREaXJlY3Rpb24pO1xuICAgICAgcmVzcG9uc2UuaXRlbXMgPSBsb2NhbEl0ZW1zLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgICAgcmVzcG9uc2UuYWxsSXRlbXMgPSBpdGVtc09iamVjdDtcbiAgICAgIHJlc3BvbnNlLmN1cnJlbnRQYWdlID0gb3B0aW9ucy5wYWdlTnVtYmVyO1xuICAgICAgcmVzcG9uc2UudG90YWxQYWdlcyA9IE1hdGguY2VpbChpdGVtc09iamVjdC5sZW5ndGggLyBvcHRpb25zLnBhZ2VTaXplKTtcbiAgICAgIHZhciBUT1RBTF9QQUdJTkFUSU9OX0lURU1TID0gNTtcbiAgICAgIHZhciBtaW5pbXVtQm91bmQgPSBvcHRpb25zLnBhZ2VOdW1iZXIgLSBNYXRoLmZsb29yKFRPVEFMX1BBR0lOQVRJT05fSVRFTVMgLyAyKTtcbiAgICAgIGZvciAoaSA9IG1pbmltdW1Cb3VuZDsgaSA8PSBvcHRpb25zLnBhZ2VOdW1iZXI7IGkrKykge1xuICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICByZXNwb25zZS5wYWdpbmdBcnJheS5wdXNoKGkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAocmVzcG9uc2UucGFnaW5nQXJyYXkubGVuZ3RoIDwgVE9UQUxfUEFHSU5BVElPTl9JVEVNUykge1xuICAgICAgICBpZiAoaSA+IHJlc3BvbnNlLnRvdGFsUGFnZXMpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXNwb25zZS5wYWdpbmdBcnJheS5wdXNoKGkpO1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfTtcbiAgfVxuXSk7XG5cbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xuIiwiLyoqXG4gKiBhZGFwdC1zdHJhcFxuICogQHZlcnNpb24gdjIuMC42IC0gMjAxNC0xMC0yNlxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL0FkYXB0di9hZGFwdC1zdHJhcFxuICogQGF1dGhvciBLYXNoeWFwIFBhdGVsIChrYXNoeWFwQGFkYXAudHYpXG4gKiBAbGljZW5zZSBNSVQgTGljZW5zZSwgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyBTb3VyY2U6IGluZmluaXRlZHJvcGRvd24udHBsLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAuaW5maW5pdGVkcm9wZG93bicpLnJ1bihbXG4gICckdGVtcGxhdGVDYWNoZScsXG4gIGZ1bmN0aW9uICgkdGVtcGxhdGVDYWNoZSkge1xuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnaW5maW5pdGVkcm9wZG93bi9pbmZpbml0ZWRyb3Bkb3duLnRwbC5odG1sJywgJzxkaXYgY2xhc3M9XCJhZC1pbmZpbml0ZS1saXN0LWNvbnRhaW5lclwiPjxkaXYgY2xhc3M9XCJkcm9wZG93blwiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZHJvcGRvd24tdG9nZ2xlXCIgbmctY2xhc3M9XCJhdHRycy5idG5DbGFzc2VzIHx8IFxcJ2J0biBidG4tZGVmYXVsdFxcJ1wiIGRhdGEtdG9nZ2xlPVwiZHJvcGRvd25cIj48c3BhbiBuZy1pZj1cIiFhdHRycy5sYWJlbERpc3BsYXlQcm9wZXJ0eSB8fCAhc2VsZWN0ZWRJdGVtcy5sZW5ndGhcIj57eyBhdHRycy5pbml0aWFsTGFiZWwgfHwgXFwnU2VsZWN0XFwnIH19PC9zcGFuPiA8c3BhbiBuZy1pZj1cImF0dHJzLmxhYmVsRGlzcGxheVByb3BlcnR5ICYmIHNlbGVjdGVkSXRlbXMubGVuZ3RoXCI+e3sgcmVhZFByb3BlcnR5KHNlbGVjdGVkSXRlbXNbc2VsZWN0ZWRJdGVtcy5sZW5ndGggLSAxXSwgYXR0cnMubGFiZWxEaXNwbGF5UHJvcGVydHkpIH19PC9zcGFuPiA8c3BhbiBjbGFzcz1cImNhcmV0XCI+PC9zcGFuPjwvYnV0dG9uPjx1bCBjbGFzcz1cImRyb3Bkb3duLW1lbnVcIiByb2xlPVwibWVudVwiIG5nLXN0eWxlPVwibG9jYWxDb25maWcuZGltZW5zaW9uc1wiPjxsaSBjbGFzcz1cInRleHQtb3ZlcmZsb3dcIiBkYXRhLW5nLXJlcGVhdD1cIml0ZW0gaW4gaXRlbXMubGlzdFwiIG5nLWNsYXNzPVwie1xcJ2FjdGl2ZVxcJzogYWRTdHJhcFV0aWxzLml0ZW1FeGlzdHNJbkxpc3QoaXRlbSwgc2VsZWN0ZWRJdGVtcyl9XCIgbmctY2xpY2s9XCJhZGRSZW1vdmVJdGVtKCRldmVudCwgaXRlbSwgc2VsZWN0ZWRJdGVtcylcIj48YSByb2xlPVwibWVudWl0ZW1cIiB0YWJpbmRleD1cIi0xXCIgaHJlZj1cIlwiPjxzcGFuIG5nLWlmPVwiYXR0cnMuZGlzcGxheVByb3BlcnR5XCI+e3sgYWRTdHJhcFV0aWxzLmdldE9iamVjdFByb3BlcnR5KGl0ZW0sIGF0dHJzLmRpc3BsYXlQcm9wZXJ0eSkgfX08L3NwYW4+IDxzcGFuIG5nLWlmPVwiYXR0cnMudGVtcGxhdGVcIiBhZC1jb21waWxlLXRlbXBsYXRlPVwie3sgYXR0cnMudGVtcGxhdGUgfX1cIj48L3NwYW4+IDxzcGFuIG5nLWlmPVwiYXR0cnMudGVtcGxhdGVVcmxcIiBuZy1pbmNsdWRlPVwiYXR0cnMudGVtcGxhdGVVcmxcIj48L3NwYW4+PC9hPjwvbGk+PGxpIGNsYXNzPVwidGV4dC1vdmVyZmxvdyB0ZXh0LWNlbnRlclwiIG5nLXN0eWxlPVwie1xcJ29wYWNpdHlcXCc6IGxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhID8gMSA6IDB9XCI+PGEgcm9sZT1cIm1lbnVpdGVtXCIgdGFiaW5kZXg9XCItMVwiIGhyZWY9XCJcIj48YWQtbG9hZGluZy1pY29uPjwvYWQtbG9hZGluZy1pY29uPjwvYT48L2xpPjwvdWw+PC9kaXY+PC9kaXY+Jyk7XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IGxvYWRpbmdpbmRpY2F0b3IudHBsLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAubG9hZGluZ2luZGljYXRvcicpLnJ1bihbXG4gICckdGVtcGxhdGVDYWNoZScsXG4gIGZ1bmN0aW9uICgkdGVtcGxhdGVDYWNoZSkge1xuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbG9hZGluZ2luZGljYXRvci9sb2FkaW5naW5kaWNhdG9yLnRwbC5odG1sJywgJzxkaXYgY2xhc3M9XCJhZC1sb2FkaW5nLW92ZXJsYXktY29udGFpbmVyXCIgbmctY2xhc3M9XCJjb250YWluZXJDbGFzc2VzXCIgbmctc3R5bGU9XCJ7XFwnei1pbmRleFxcJzogekluZGV4IHx8IFxcJzEwMDBcXCcsXFwncG9zaXRpb25cXCc6IHBvc2l0aW9uIHx8IFxcJ2Fic29sdXRlXFwnfVwiIG5nLXNob3c9XCJsb2FkaW5nXCI+PGRpdiBjbGFzcz1cIndyYXBwZXJcIj48ZGl2IGNsYXNzPVwibG9hZGluZy1pbmRpY2F0b3JcIj48YWQtbG9hZGluZy1pY29uIGxvYWRpbmctaWNvbi1zaXplPVwie3sgbG9hZGluZ0ljb25TaXplIH19XCIgbG9hZGluZy1pY29uLWNsYXNzPVwie3sgbG9hZGluZ0ljb25DbGFzcyB9fVwiPjwvYWQtbG9hZGluZy1pY29uPjwvZGl2PjwvZGl2PjwvZGl2PicpO1xuICB9XG5dKTtcblxuLy8gU291cmNlOiB0YWJsZWFqYXgudHBsLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAudGFibGVhamF4JykucnVuKFtcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgZnVuY3Rpb24gKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCd0YWJsZWFqYXgvdGFibGVhamF4LnRwbC5odG1sJywgJzxkaXYgY2xhc3M9XCJhZC10YWJsZS1hamF4LWNvbnRhaW5lclwiIG5nLWlmPVwiaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMgfHwgbG9jYWxDb25maWcubG9hZGluZ0RhdGEgfHwgIWF0dHJzLml0ZW1zTm90Rm91bmRNZXNzYWdlXCI+PHRhYmxlIGNsYXNzPVwiYWQtc3RpY2t5LXRhYmxlXCIgbmctY2xhc3M9XCJhdHRycy50YWJsZUNsYXNzZXMgfHwgXFwndGFibGVcXCdcIiBuZy1pZj1cImxvY2FsQ29uZmlnLnRhYmxlTWF4SGVpZ2h0XCI+PHRyIGNsYXNzPVwiYWQtdXNlci1zZWxlY3Qtbm9uZVwiPjx0aCBkYXRhLW5nLXJlcGVhdD1cImRlZmluaXRpb24gaW4gY29sdW1uRGVmaW5pdGlvblwiIG5nLWNsaWNrPVwic29ydEJ5Q29sdW1uKGRlZmluaXRpb24pXCIgbmctY2xhc3M9XCJ7XFwnYWQtY3Vyc29yLXBvaW50ZXJcXCc6IGRlZmluaXRpb24uc29ydEtleX1cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9PSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRBc2NlbmRpbmdcIiBuZy1oaWRlPVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT4gPGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0RGVzY2VuZGluZ1wiIG5nLXNob3c9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPjwvZGl2PjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlICE9IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydGFibGVcIj48L2k+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIiBuZy1iaW5kLWh0bWw9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCI+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIiBuZy1iaW5kPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiPjwvZGl2PjwvdGg+PC90cj48L3RhYmxlPjxkaXYgY2xhc3M9XCJhZC10YWJsZS1jb250YWluZXJcIiBuZy1zdHlsZT1cIntcXCdtYXgtaGVpZ2h0XFwnOiBsb2NhbENvbmZpZy50YWJsZU1heEhlaWdodH1cIj48dGFibGUgbmctY2xhc3M9XCJhdHRycy50YWJsZUNsYXNzZXMgfHwgXFwndGFibGVcXCdcIj48dHIgY2xhc3M9XCJhZC11c2VyLXNlbGVjdC1ub25lXCIgbmctaWY9XCIhbG9jYWxDb25maWcudGFibGVNYXhIZWlnaHRcIj48dGggZGF0YS1uZy1yZXBlYXQ9XCJkZWZpbml0aW9uIGluIGNvbHVtbkRlZmluaXRpb25cIiBuZy1jbGljaz1cInNvcnRCeUNvbHVtbihkZWZpbml0aW9uKVwiIG5nLWNsYXNzPVwie1xcJ2FkLWN1cnNvci1wb2ludGVyXFwnOiBkZWZpbml0aW9uLnNvcnRLZXl9XCIgbmctc3R5bGU9XCJ7XFwnd2lkdGhcXCc6IGRlZmluaXRpb24ud2lkdGh9XCI+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1pZj1cImRlZmluaXRpb24uc29ydEtleSAmJiBsb2NhbENvbmZpZy5wcmVkaWNhdGUgPT0gZGVmaW5pdGlvbi5zb3J0S2V5XCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0QXNjZW5kaW5nXCIgbmctaGlkZT1cImxvY2FsQ29uZmlnLnJldmVyc2VcIj48L2k+IDxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydERlc2NlbmRpbmdcIiBuZy1zaG93PVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT48L2Rpdj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSAhPSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRhYmxlXCI+PC9pPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCIgbmctYmluZC1odG1sPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJUZW1wbGF0ZVwiPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlckRpc3BsYXlOYW1lXCIgbmctYmluZD1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIj48L2Rpdj48L3RoPjwvdHI+PHRyIGRhdGEtbmctcmVwZWF0PVwiaXRlbSBpbiBpdGVtcy5saXN0XCI+PHRkIGRhdGEtbmctcmVwZWF0PVwiZGVmaW5pdGlvbiBpbiBjb2x1bW5EZWZpbml0aW9uXCIgbmctc3R5bGU9XCJ7XFwnd2lkdGhcXCc6IGRlZmluaXRpb24ud2lkdGh9XCI+PGRpdiBuZy1pZj1cImRlZmluaXRpb24udGVtcGxhdGVVcmxcIj48bmctaW5jbHVkZSBzcmM9XCJkZWZpbml0aW9uLnRlbXBsYXRlVXJsXCI+PC9uZy1pbmNsdWRlPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLnRlbXBsYXRlXCI+PHNwYW4gYWQtY29tcGlsZS10ZW1wbGF0ZT1cImRlZmluaXRpb24udGVtcGxhdGVcIj48L3NwYW4+PC9kaXY+PGRpdiBuZy1pZj1cIiFkZWZpbml0aW9uLnRlbXBsYXRlVXJsICYmICFkZWZpbml0aW9uLnRlbXBsYXRlXCI+e3sgYWRTdHJhcFV0aWxzLmFwcGx5RmlsdGVyKGFkU3RyYXBVdGlscy5nZXRPYmplY3RQcm9wZXJ0eShpdGVtLCBkZWZpbml0aW9uLmRpc3BsYXlQcm9wZXJ0eSwgaXRlbSksIGRlZmluaXRpb24uY2VsbEZpbHRlcikgfX08L2Rpdj48L3RkPjwvdHI+PC90YWJsZT48YWQtbG9hZGluZy1vdmVybGF5IGxvYWRpbmc9XCJsb2NhbENvbmZpZy5sb2FkaW5nRGF0YVwiPjwvYWQtbG9hZGluZy1vdmVybGF5PjwvZGl2PjxkaXYgY2xhc3M9XCJyb3dcIj48ZGl2IGNsYXNzPVwiY29sLW1kLTggY29sLXNtLThcIj48ZGl2IGNsYXNzPVwicHVsbC1sZWZ0XCIgbmctY2xhc3M9XCJhdHRycy5wYWdpbmF0aW9uQnRuR3JvdXBDbGFzc2VzIHx8IFxcJ2J0bi1ncm91cCBidG4tZ3JvdXAtc21cXCdcIiBuZy1zaG93PVwiaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMgPiAxXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1jbGljaz1cImxvYWRQYWdlKDEpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gMVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuZmlyc3RQYWdlXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWNsaWNrPVwibG9hZFByZXZpb3VzUGFnZSgpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gMVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMucHJldmlvdXNQYWdlXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLXJlcGVhdD1cInBhZ2UgaW4gbG9jYWxDb25maWcucGFnaW5nQXJyYXlcIiBuZy1jbGFzcz1cInthY3RpdmU6IGl0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSBwYWdlfVwiIG5nLWNsaWNrPVwibG9hZFBhZ2UocGFnZSlcIj57eyBwYWdlIH19PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctY2xpY2s9XCJsb2FkTmV4dFBhZ2UoKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IGl0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5uZXh0UGFnZVwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1jbGljaz1cImxvYWRMYXN0UGFnZSgpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gaXRlbXMucGFnaW5nLnRvdGFsUGFnZXNcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLmxhc3RQYWdlXCI+PC9pPjwvYnV0dG9uPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJjb2wtbWQtNCBjb2wtc20tNFwiPjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctY2xhc3M9XCJhdHRycy5wYWdpbmF0aW9uQnRuR3JvdXBDbGFzc2VzIHx8IFxcJ2J0bi1ncm91cCBidG4tZ3JvdXAtc21cXCdcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLXJlcGVhdD1cInNpemUgaW4gaXRlbXMucGFnaW5nLnBhZ2VTaXplc1wiIG5nLWNsYXNzPVwie2FjdGl2ZTogaXRlbXMucGFnaW5nLnBhZ2VTaXplID09IHNpemV9XCIgbmctY2xpY2s9XCJwYWdlU2l6ZUNoYW5nZWQoc2l6ZSlcIj57eyBzaXplIH19PC9idXR0b24+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBuZy1pZj1cIiFpdGVtcy5wYWdpbmcudG90YWxQYWdlcyAmJiAhbG9jYWxDb25maWcubG9hZGluZ0RhdGEgJiYgYXR0cnMuaXRlbXNOb3RGb3VuZE1lc3NhZ2VcIj48ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtaW5mb1wiIHJvbGU9XCJhbGVydFwiPnt7IGF0dHJzLml0ZW1zTm90Rm91bmRNZXNzYWdlIH19PC9kaXY+PC9kaXY+Jyk7XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IHRhYmxlbGl0ZS50cGwuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC50YWJsZWxpdGUnKS5ydW4oW1xuICAnJHRlbXBsYXRlQ2FjaGUnLFxuICBmdW5jdGlvbiAoJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3RhYmxlbGl0ZS90YWJsZWxpdGUudHBsLmh0bWwnLCAnPGRpdiBjbGFzcz1cImFkLXRhYmxlLWxpdGUtY29udGFpbmVyXCIgbmctaWY9XCJpdGVtcy5hbGxJdGVtcy5sZW5ndGggfHwgIWF0dHJzLml0ZW1zTm90Rm91bmRNZXNzYWdlXCI+PHRhYmxlIGNsYXNzPVwiYWQtc3RpY2t5LXRhYmxlXCIgbmctY2xhc3M9XCJhdHRycy50YWJsZUNsYXNzZXMgfHwgXFwndGFibGVcXCdcIiBuZy1pZj1cImF0dHJzLnRhYmxlTWF4SGVpZ2h0XCI+PHRyIGNsYXNzPVwiYWQtdXNlci1zZWxlY3Qtbm9uZVwiPjx0aCBjbGFzcz1cImFkLXNlbGVjdC1jZWxsXCIgbmctaWY9XCJhdHRycy5kcmFnZ2FibGVcIj48aT48L2k+PC90aD48dGggY2xhc3M9XCJhZC1zZWxlY3QtY2VsbFwiIG5nLWlmPVwiYXR0cnMuc2VsZWN0ZWRJdGVtcyAmJiBpdGVtcy5hbGxJdGVtc1wiPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cImFkLWN1cnNvci1wb2ludGVyXCIgbmctY2xpY2s9XCJhZFN0cmFwVXRpbHMuYWRkUmVtb3ZlSXRlbXNGcm9tTGlzdChpdGVtcy5hbGxJdGVtcywgc2VsZWN0ZWRJdGVtcylcIiBuZy1jaGVja2VkPVwiYWRTdHJhcFV0aWxzLml0ZW1zRXhpc3RJbkxpc3QoaXRlbXMuYWxsSXRlbXMsIHNlbGVjdGVkSXRlbXMpXCI+PC90aD48dGggZGF0YS1uZy1yZXBlYXQ9XCJkZWZpbml0aW9uIGluIGNvbHVtbkRlZmluaXRpb25cIiBuZy1jbGljaz1cInNvcnRCeUNvbHVtbihkZWZpbml0aW9uKVwiIG5nLWNsYXNzPVwie1xcJ2FkLWN1cnNvci1wb2ludGVyXFwnOiBkZWZpbml0aW9uLnNvcnRLZXl9XCIgbmctc3R5bGU9XCJ7XFwnd2lkdGhcXCc6IGRlZmluaXRpb24ud2lkdGh9XCI+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1pZj1cImRlZmluaXRpb24uc29ydEtleSAmJiBsb2NhbENvbmZpZy5wcmVkaWNhdGUgPT0gZGVmaW5pdGlvbi5zb3J0S2V5XCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0QXNjZW5kaW5nXCIgbmctaGlkZT1cImxvY2FsQ29uZmlnLnJldmVyc2VcIj48L2k+IDxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydERlc2NlbmRpbmdcIiBuZy1zaG93PVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT48L2Rpdj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSAhPSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRhYmxlXCI+PC9pPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCIgbmctYmluZC1odG1sPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJUZW1wbGF0ZVwiPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlckRpc3BsYXlOYW1lXCIgbmctYmluZD1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIj48L2Rpdj48L3RoPjwvdHI+PC90YWJsZT48ZGl2IGNsYXNzPVwiYWQtdGFibGUtY29udGFpbmVyXCIgbmctc3R5bGU9XCJ7XFwnbWF4LWhlaWdodFxcJzogYXR0cnMudGFibGVNYXhIZWlnaHR9XCI+PHRhYmxlIG5nLWNsYXNzPVwiYXR0cnMudGFibGVDbGFzc2VzIHx8IFxcJ3RhYmxlXFwnXCI+PHRyIGNsYXNzPVwiYWQtdXNlci1zZWxlY3Qtbm9uZVwiIG5nLWlmPVwiIWF0dHJzLnRhYmxlTWF4SGVpZ2h0XCI+PHRoIGNsYXNzPVwiYWQtc2VsZWN0LWNlbGxcIiBuZy1pZj1cImF0dHJzLmRyYWdnYWJsZVwiPjxpPjwvaT48L3RoPjx0aCBjbGFzcz1cImFkLXNlbGVjdC1jZWxsXCIgbmctaWY9XCJhdHRycy5zZWxlY3RlZEl0ZW1zICYmIGl0ZW1zLmFsbEl0ZW1zXCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiYWQtY3Vyc29yLXBvaW50ZXJcIiBuZy1jbGljaz1cImFkU3RyYXBVdGlscy5hZGRSZW1vdmVJdGVtc0Zyb21MaXN0KGl0ZW1zLmFsbEl0ZW1zLCBzZWxlY3RlZEl0ZW1zKVwiIG5nLWNoZWNrZWQ9XCJhZFN0cmFwVXRpbHMuaXRlbXNFeGlzdEluTGlzdChpdGVtcy5hbGxJdGVtcywgc2VsZWN0ZWRJdGVtcylcIj48L3RoPjx0aCBkYXRhLW5nLXJlcGVhdD1cImRlZmluaXRpb24gaW4gY29sdW1uRGVmaW5pdGlvblwiIG5nLWNsaWNrPVwic29ydEJ5Q29sdW1uKGRlZmluaXRpb24pXCIgbmctY2xhc3M9XCJ7XFwnYWQtY3Vyc29yLXBvaW50ZXJcXCc6IGRlZmluaXRpb24uc29ydEtleX1cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9PSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRBc2NlbmRpbmdcIiBuZy1oaWRlPVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT4gPGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0RGVzY2VuZGluZ1wiIG5nLXNob3c9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPjwvZGl2PjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlICE9IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydGFibGVcIj48L2k+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIiBuZy1iaW5kLWh0bWw9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCI+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIiBuZy1iaW5kPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiPjwvZGl2PjwvdGg+PC90cj48dHIgbmctaWY9XCIhYXR0cnMuZHJhZ2dhYmxlXCIgZGF0YS1uZy1yZXBlYXQ9XCJpdGVtIGluIGl0ZW1zLmxpc3RcIiBuZy1jbGFzcz1cIntcXCdhZC1zZWxlY3RlZFxcJzogYXR0cnMuc2VsZWN0ZWRJdGVtcyAmJiBhZFN0cmFwVXRpbHMuaXRlbUV4aXN0c0luTGlzdChpdGVtLCBzZWxlY3RlZEl0ZW1zKX1cIj48dGQgY2xhc3M9XCJhZC1zZWxlY3QtY2VsbFwiIG5nLWlmPVwiYXR0cnMuc2VsZWN0ZWRJdGVtc1wiPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cImFkLWN1cnNvci1wb2ludGVyXCIgbmctY2hlY2tlZD1cImFkU3RyYXBVdGlscy5pdGVtRXhpc3RzSW5MaXN0KGl0ZW0sIHNlbGVjdGVkSXRlbXMpXCIgbmctY2xpY2s9XCJhZFN0cmFwVXRpbHMuYWRkUmVtb3ZlSXRlbUZyb21MaXN0KGl0ZW0sIHNlbGVjdGVkSXRlbXMpXCI+PC90ZD48dGQgZGF0YS1uZy1yZXBlYXQ9XCJkZWZpbml0aW9uIGluIGNvbHVtbkRlZmluaXRpb25cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVVybFwiPjxuZy1pbmNsdWRlIHNyYz1cImRlZmluaXRpb24udGVtcGxhdGVVcmxcIj48L25nLWluY2x1ZGU+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24udGVtcGxhdGVcIj48c3BhbiBhZC1jb21waWxlLXRlbXBsYXRlPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPjwvc3Bhbj48L2Rpdj48ZGl2IG5nLWlmPVwiIWRlZmluaXRpb24udGVtcGxhdGVVcmwgJiYgIWRlZmluaXRpb24udGVtcGxhdGVcIj57eyBhZFN0cmFwVXRpbHMuYXBwbHlGaWx0ZXIoYWRTdHJhcFV0aWxzLmdldE9iamVjdFByb3BlcnR5KGl0ZW0sIGRlZmluaXRpb24uZGlzcGxheVByb3BlcnR5KSwgZGVmaW5pdGlvbi5jZWxsRmlsdGVyKSB9fTwvZGl2PjwvdGQ+PC90cj48dHIgbmctaWY9XCJhdHRycy5kcmFnZ2FibGVcIiBhZC1kcmFnPVwidHJ1ZVwiIGFkLWRyYWctaGFuZGxlPVwidHJ1ZVwiIGFkLWRyb3A9XCJ0cnVlXCIgYWQtZHJhZy1kYXRhPVwiaXRlbVwiIGFkLWRyb3Atb3Zlcj1cIm9uRHJhZ092ZXIoJGRhdGEsICRkcmFnRWxlbWVudCwgJGRyb3BFbGVtZW50LCAkZXZlbnQpXCIgYWQtZHJvcC1lbmQ9XCJvbkRyb3BFbmQoJGRhdGEsICRkcmFnRWxlbWVudCwgJGRyb3BFbGVtZW50LCAkZXZlbnQpXCIgYWQtZHJhZy1iZWdpbj1cIm9uRHJhZ1N0YXJ0KCRkYXRhLCAkZHJhZ0VsZW1lbnQsICRldmVudClcIiBhZC1kcmFnLWVuZD1cIm9uRHJhZ0VuZCgkZGF0YSwgJGRyYWdFbGVtZW50LCAkZXZlbnQpXCIgZGF0YS1uZy1yZXBlYXQ9XCJpdGVtIGluIGl0ZW1zLmxpc3RcIiBuZy1jbGFzcz1cIntcXCdhZC1zZWxlY3RlZFxcJzogYXR0cnMuc2VsZWN0ZWRJdGVtcyAmJiBhZFN0cmFwVXRpbHMuaXRlbUV4aXN0c0luTGlzdChpdGVtLCBzZWxlY3RlZEl0ZW1zKX1cIj48dGQgY2xhc3M9XCJhZC1zZWxlY3QtY2VsbCBhZC1kcmFnLWhhbmRsZVwiIG5nLWlmPVwiYXR0cnMuZHJhZ2dhYmxlXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5kcmFnZ2FibGVcIj48L2k+PC90ZD48dGQgY2xhc3M9XCJhZC1zZWxlY3QtY2VsbFwiIG5nLWlmPVwiYXR0cnMuc2VsZWN0ZWRJdGVtc1wiPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cImFkLWN1cnNvci1wb2ludGVyXCIgbmctY2hlY2tlZD1cImFkU3RyYXBVdGlscy5pdGVtRXhpc3RzSW5MaXN0KGl0ZW0sIHNlbGVjdGVkSXRlbXMpXCIgbmctY2xpY2s9XCJhZFN0cmFwVXRpbHMuYWRkUmVtb3ZlSXRlbUZyb21MaXN0KGl0ZW0sIHNlbGVjdGVkSXRlbXMpXCI+PC90ZD48dGQgZGF0YS1uZy1yZXBlYXQ9XCJkZWZpbml0aW9uIGluIGNvbHVtbkRlZmluaXRpb25cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVVybFwiPjxuZy1pbmNsdWRlIHNyYz1cImRlZmluaXRpb24udGVtcGxhdGVVcmxcIj48L25nLWluY2x1ZGU+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24udGVtcGxhdGVcIj48c3BhbiBhZC1jb21waWxlLXRlbXBsYXRlPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPjwvc3Bhbj48L2Rpdj48ZGl2IG5nLWlmPVwiIWRlZmluaXRpb24udGVtcGxhdGVVcmwgJiYgIWRlZmluaXRpb24udGVtcGxhdGVcIj57eyBhZFN0cmFwVXRpbHMuYXBwbHlGaWx0ZXIoYWRTdHJhcFV0aWxzLmdldE9iamVjdFByb3BlcnR5KGl0ZW0sIGRlZmluaXRpb24uZGlzcGxheVByb3BlcnR5KSwgZGVmaW5pdGlvbi5jZWxsRmlsdGVyKSB9fTwvZGl2PjwvdGQ+PC90cj48L3RhYmxlPjwvZGl2PjxkaXYgY2xhc3M9XCJyb3dcIiBuZy1pZj1cIml0ZW1zLmFsbEl0ZW1zLmxlbmd0aCA+IGl0ZW1zLnBhZ2luZy5wYWdlU2l6ZXNbMF0gJiYgIWF0dHJzLmRpc2FibGVQYWdpbmdcIj48ZGl2IGNsYXNzPVwiY29sLW1kLTggY29sLXNtLThcIj48ZGl2IGNsYXNzPVwicHVsbC1sZWZ0XCIgbmctY2xhc3M9XCJhdHRycy5wYWdpbmF0aW9uQnRuR3JvdXBDbGFzc2VzIHx8IFxcJ2J0bi1ncm91cCBidG4tZ3JvdXAtc21cXCdcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWNsaWNrPVwibG9hZFBhZ2UoMSlcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSAxXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5maXJzdFBhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctaWY9XCIhYXR0cnMuZHJhZ2dhYmxlXCIgbmctY2xpY2s9XCJsb2FkUHJldmlvdXNQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSAxXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5wcmV2aW91c1BhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGlkPVwiYnRuUHJldlwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctaWY9XCJhdHRycy5kcmFnZ2FibGVcIiBhZC1kcm9wPVwidHJ1ZVwiIGFkLWRyb3Atb3Zlcj1cIm9uTmV4dFBhZ2VCdXR0b25PdmVyKCRkYXRhLCAkZHJhZ0VsZW1lbnQsICRkcm9wRWxlbWVudCwgJGV2ZW50KVwiIGFkLWRyb3AtZW5kPVwib25OZXh0UGFnZUJ1dHRvbkRyb3AoJGRhdGEsICRkcmFnRWxlbWVudCwgJGRyb3BFbGVtZW50LCAkZXZlbnQpXCIgbmctY2xpY2s9XCJsb2FkUHJldmlvdXNQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSAxXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5wcmV2aW91c1BhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctcmVwZWF0PVwicGFnZSBpbiBsb2NhbENvbmZpZy5wYWdpbmdBcnJheVwiIG5nLWNsYXNzPVwie2FjdGl2ZTogaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IHBhZ2V9XCIgbmctY2xpY2s9XCJsb2FkUGFnZShwYWdlKVwiPnt7IHBhZ2UgfX08L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1pZj1cIiFhdHRycy5kcmFnZ2FibGVcIiBuZy1jbGljaz1cImxvYWROZXh0UGFnZSgpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gaXRlbXMucGFnaW5nLnRvdGFsUGFnZXNcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLm5leHRQYWdlXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIGlkPVwiYnRuTmV4dFwiIG5nLWlmPVwiYXR0cnMuZHJhZ2dhYmxlXCIgYWQtZHJvcD1cInRydWVcIiBhZC1kcm9wLW92ZXI9XCJvbk5leHRQYWdlQnV0dG9uT3ZlcigkZGF0YSwgJGRyYWdFbGVtZW50LCAkZHJvcEVsZW1lbnQsICRldmVudClcIiBhZC1kcm9wLWVuZD1cIm9uTmV4dFBhZ2VCdXR0b25Ecm9wKCRkYXRhLCAkZHJhZ0VsZW1lbnQsICRkcm9wRWxlbWVudCwgJGV2ZW50KVwiIG5nLWNsaWNrPVwibG9hZE5leHRQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSBpdGVtcy5wYWdpbmcudG90YWxQYWdlc1wiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMubmV4dFBhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctY2xpY2s9XCJsb2FkTGFzdFBhZ2UoKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IGl0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5sYXN0UGFnZVwiPjwvaT48L2J1dHRvbj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwiY29sLW1kLTQgY29sLXNtLTRcIj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWNsYXNzPVwiYXR0cnMucGFnaW5hdGlvbkJ0bkdyb3VwQ2xhc3NlcyB8fCBcXCdidG4tZ3JvdXAgYnRuLWdyb3VwLXNtXFwnXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1yZXBlYXQ9XCJzaXplIGluIGl0ZW1zLnBhZ2luZy5wYWdlU2l6ZXNcIiBuZy1jbGFzcz1cInthY3RpdmU6IGl0ZW1zLnBhZ2luZy5wYWdlU2l6ZSA9PSBzaXplfVwiIG5nLWNsaWNrPVwicGFnZVNpemVDaGFuZ2VkKHNpemUpXCI+e3sgc2l6ZSB9fTwvYnV0dG9uPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgbmctaWY9XCIhaXRlbXMuYWxsSXRlbXMubGVuZ3RoICYmIGF0dHJzLml0ZW1zTm90Rm91bmRNZXNzYWdlXCI+PGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LWluZm9cIiByb2xlPVwiYWxlcnRcIj57eyBhdHRycy5pdGVtc05vdEZvdW5kTWVzc2FnZSB9fTwvZGl2PjwvZGl2PicpO1xuICB9XG5dKTtcblxuLy8gU291cmNlOiB0cmVlYnJvd3Nlci50cGwuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC50cmVlYnJvd3NlcicpLnJ1bihbXG4gICckdGVtcGxhdGVDYWNoZScsXG4gIGZ1bmN0aW9uICgkdGVtcGxhdGVDYWNoZSkge1xuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgndHJlZWJyb3dzZXIvdHJlZWJyb3dzZXIudHBsLmh0bWwnLCAnPGRpdiBjbGFzcz1cImFkLXRyZWUtYnJvd3Nlci1jb250YWluZXJcIiBuZy1jbGFzcz1cIntcXCd0cmVlLWJvcmRlcmVkXFwnOiBhdHRycy5ib3JkZXJlZH1cIj48ZGl2IGRhdGEtbGV2ZWw9XCIwXCIgY2xhc3M9XCJ0cmVlLXZpZXdcIj48ZGl2IGNsYXNzPVwidHJlZVwiPjxzY3JpcHQgdHlwZT1cInRleHQvbmctdGVtcGxhdGVcIiBpZD1cInt7IGxvY2FsQ29uZmlnLnJlbmRlcmVyVGVtcGxhdGVJZCB9fVwiPjxkaXYgY2xhc3M9XCJjb250ZW50XCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgIG5nLXN0eWxlPVwie1xcJ3BhZGRpbmctbGVmdFxcJzogbGV2ZWwgKiAoYXR0cnMuY2hpbGRyZW5QYWRkaW5nIHx8IDE1KSArIFxcJ3B4XFwnfVwiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cInt7IGF0dHJzLnJvd05nQ2xhc3MgfX1cIj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnQtaG9sZGVyXCI+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidG9nZ2xlXCI+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgbmctaWY9XCIhaXRlbS5fYWRfZXhwYW5kZWQgJiYgaGFzQ2hpbGRyZW4oaXRlbSkgJiYgIWl0ZW0uX2FkX2xvYWRpbmdcIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuZXhwYW5kXCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cInRvZ2dsZSgkZXZlbnQsaXRlbSlcIj48L2k+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgbmctaWY9XCJpdGVtLl9hZF9leHBhbmRlZCAmJiAhaXRlbS5fYWRfbG9hZGluZ1wiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5jb2xsYXBzZVwiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJ0b2dnbGUoJGV2ZW50LGl0ZW0pXCI+PC9pPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIG5nLWlmPVwiaXRlbS5fYWRfbG9hZGluZ1wiPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLmxvYWRpbmdTcGlubmVyXCI+PC9pPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5vZGUtY29udGVudFwiPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctaW5jbHVkZSBuZy1pZj1cImF0dHJzLm5vZGVUZW1wbGF0ZVVybFwiIHNyYz1cImF0dHJzLm5vZGVUZW1wbGF0ZVVybFwiPjwvbmctaW5jbHVkZT5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gbmctaWY9XCIhYXR0cnMubm9kZVRlbXBsYXRlVXJsXCI+e3sgaXRlbS5uYW1lIHx8IFwiXCIgfX08L3NwYW4+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArICcgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArICcgICAgICAgICAgICAgICAgPGRpdiBuZy1zaG93PVwiaXRlbS5fYWRfZXhwYW5kZWRcIj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRyZWUtbGV2ZWwgdHJlZS1zdWItbGV2ZWxcIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZD1cImxldmVsPWxldmVsKzFcIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgIG5nLXJlcGVhdD1cIml0ZW0gaW4gaXRlbVthdHRycy5jaGlsZE5vZGVdXCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICBuZy1pbmNsdWRlPVwiXFwne3sgbG9jYWxDb25maWcucmVuZGVyZXJUZW1wbGF0ZUlkIH19XFwnXCI+XFxuJyArICcgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgKyAnICAgICAgICAgICAgICAgIDwvZGl2Pjwvc2NyaXB0PjxkaXY+PGRpdiBjbGFzcz1cInRyZWUtbGV2ZWwgdHJlZS1oZWFkZXItbGV2ZWwgYm9yZGVyXCIgbmctaWY9XCJhdHRycy5ub2RlSGVhZGVyVXJsXCI+PGRpdiBjbGFzcz1cImNvbnRlbnRcIiBuZy1zdHlsZT1cIntcXCdwYWRkaW5nLWxlZnRcXCc6IChhdHRycy5jaGlsZHJlblBhZGRpbmcgfHwgMTUpICsgXFwncHhcXCd9XCI+PGRpdiBjbGFzcz1cImNvbnRlbnQtaG9sZGVyXCI+PGRpdiBjbGFzcz1cInRvZ2dsZVwiPjwvZGl2PjxkaXYgY2xhc3M9XCJub2RlLWNvbnRlbnQgYWQtdXNlci1zZWxlY3Qtbm9uZVwiIG5nLWluY2x1ZGU9XCJhdHRycy5ub2RlSGVhZGVyVXJsXCI+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cInRyZWUtbGV2ZWwgdHJlZS10b3AtbGV2ZWwgYm9yZGVyXCIgb25sb2FkPVwibGV2ZWwgPSAxXCIgbmctcmVwZWF0PVwiaXRlbSBpbiB0cmVlUm9vdFthdHRycy5jaGlsZE5vZGVdXCIgbmctaW5jbHVkZT1cIlxcJ3t7IGxvY2FsQ29uZmlnLnJlbmRlcmVyVGVtcGxhdGVJZCB9fVxcJ1wiPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PicpO1xuICB9XG5dKTtcblxuXG59KSh3aW5kb3csIGRvY3VtZW50KTtcbiIsIi8qKlxuICogYW5ndWxhci1ncm93bC12MiAtIHYwLjcuMCAtIDIwMTQtMDgtMTBcbiAqIGh0dHA6Ly9qYW5zdGV2ZW5zLmdpdGh1Yi5pby9hbmd1bGFyLWdyb3dsLTJcbiAqIENvcHlyaWdodCAoYykgMjAxNCBNYXJjbyBSaW5jayxKYW4gU3RldmVuczsgTGljZW5zZWQgTUlUXG4gKi9cbmFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhci1ncm93bFwiLFtdKSxhbmd1bGFyLm1vZHVsZShcImFuZ3VsYXItZ3Jvd2xcIikuZGlyZWN0aXZlKFwiZ3Jvd2xcIixbXCIkcm9vdFNjb3BlXCIsXCIkc2NlXCIsZnVuY3Rpb24oYSxiKXtcInVzZSBzdHJpY3RcIjtyZXR1cm57cmVzdHJpY3Q6XCJBXCIsdGVtcGxhdGVVcmw6XCJ0ZW1wbGF0ZXMvZ3Jvd2wvZ3Jvd2wuaHRtbFwiLHJlcGxhY2U6ITEsc2NvcGU6e3JlZmVyZW5jZTpcIkBcIixpbmxpbmU6XCJAXCIsbGltaXRNZXNzYWdlczpcIj1cIn0sY29udHJvbGxlcjpbXCIkc2NvcGVcIixcIiR0aW1lb3V0XCIsXCJncm93bFwiLGZ1bmN0aW9uKGMsZCxlKXtmdW5jdGlvbiBmKGEpe2QoZnVuY3Rpb24oKXt2YXIgZixoO2lmKCFnfHwoYW5ndWxhci5mb3JFYWNoKGMubWVzc2FnZXMsZnVuY3Rpb24oYyl7aD1iLmdldFRydXN0ZWRIdG1sKGMudGV4dCksYS50ZXh0PT09aCYmYS5zZXZlcml0eT09PWMuc2V2ZXJpdHkmJmMudGl0bGU9PT1jLnRpdGxlJiYoZj0hMCl9KSwhZikpe2lmKGEudGV4dD1iLnRydXN0QXNIdG1sKFN0cmluZyhhLnRleHQpKSxhLnR0bCYmLTEhPT1hLnR0bCYmKGEuY291bnRkb3duPWEudHRsLzFlMyxhLnByb21pc2VzPVtdLGEuY2xvc2U9ITEsYS5jb3VudGRvd25GdW5jdGlvbj1mdW5jdGlvbigpe2EuY291bnRkb3duPjE/KGEuY291bnRkb3duLS0sYS5wcm9taXNlcy5wdXNoKGQoYS5jb3VudGRvd25GdW5jdGlvbiwxZTMpKSk6YS5jb3VudGRvd24tLX0pLGFuZ3VsYXIuaXNEZWZpbmVkKGMubGltaXRNZXNzYWdlcykpe3ZhciBpPWMubWVzc2FnZXMubGVuZ3RoLShjLmxpbWl0TWVzc2FnZXMtMSk7aT4wJiZjLm1lc3NhZ2VzLnNwbGljZShjLmxpbWl0TWVzc2FnZXMtMSxpKX1lLnJldmVyc2VPcmRlcigpP2MubWVzc2FnZXMudW5zaGlmdChhKTpjLm1lc3NhZ2VzLnB1c2goYSksYS50dGwmJi0xIT09YS50dGwmJihhLnByb21pc2VzLnB1c2goZChmdW5jdGlvbigpe2MuZGVsZXRlTWVzc2FnZShhKX0sYS50dGwpKSxhLnByb21pc2VzLnB1c2goZChhLmNvdW50ZG93bkZ1bmN0aW9uLDFlMykpKX19LCEwKX12YXIgZz1lLm9ubHlVbmlxdWUoKTtjLm1lc3NhZ2VzPVtdO3ZhciBoPWMucmVmZXJlbmNlfHwwO2MuaW5saW5lTWVzc2FnZT1jLmlubGluZXx8ZS5pbmxpbmVNZXNzYWdlcygpLGEuJG9uKFwiZ3Jvd2xNZXNzYWdlXCIsZnVuY3Rpb24oYSxiKXtwYXJzZUludChoLDEwKT09PXBhcnNlSW50KGIucmVmZXJlbmNlSWQsMTApJiZmKGIpfSksYy5kZWxldGVNZXNzYWdlPWZ1bmN0aW9uKGEpe3ZhciBiPWMubWVzc2FnZXMuaW5kZXhPZihhKTtiPi0xJiZjLm1lc3NhZ2VzLnNwbGljZShiLDEpfSxjLnN0b3BUaW1lb3V0Q2xvc2U9ZnVuY3Rpb24oYSl7YW5ndWxhci5mb3JFYWNoKGEucHJvbWlzZXMsZnVuY3Rpb24oYSl7ZC5jYW5jZWwoYSl9KSxhLmNsb3NlP2MuZGVsZXRlTWVzc2FnZShhKTphLmNsb3NlPSEwfSxjLmFsZXJ0Q2xhc3Nlcz1mdW5jdGlvbihhKXtyZXR1cm57XCJhbGVydC1zdWNjZXNzXCI6XCJzdWNjZXNzXCI9PT1hLnNldmVyaXR5LFwiYWxlcnQtZXJyb3JcIjpcImVycm9yXCI9PT1hLnNldmVyaXR5LFwiYWxlcnQtZGFuZ2VyXCI6XCJlcnJvclwiPT09YS5zZXZlcml0eSxcImFsZXJ0LWluZm9cIjpcImluZm9cIj09PWEuc2V2ZXJpdHksXCJhbGVydC13YXJuaW5nXCI6XCJ3YXJuaW5nXCI9PT1hLnNldmVyaXR5LGljb246YS5kaXNhYmxlSWNvbnM9PT0hMSxcImFsZXJ0LWRpc21pc3NhYmxlXCI6IWEuZGlzYWJsZUNsb3NlQnV0dG9ufX0sYy5zaG93Q291bnREb3duPWZ1bmN0aW9uKGEpe3JldHVybiFhLmRpc2FibGVDb3VudERvd24mJmEudHRsPjB9LGMud3JhcHBlckNsYXNzZXM9ZnVuY3Rpb24oKXt2YXIgYT17fTtyZXR1cm4gYVtcImdyb3dsLWZpeGVkXCJdPSFjLmlubGluZU1lc3NhZ2UsYVtlLnBvc2l0aW9uKCldPSEwLGF9LGMuY29tcHV0ZVRpdGxlPWZ1bmN0aW9uKGEpe3ZhciBiPXtzdWNjZXNzOlwiU3VjY2Vzc1wiLGVycm9yOlwiRXJyb3JcIixpbmZvOlwiSW5mb3JtYXRpb25cIix3YXJuOlwiV2FybmluZ1wifTtyZXR1cm4gYlthLnNldmVyaXR5XX19XX19XSksYW5ndWxhci5tb2R1bGUoXCJhbmd1bGFyLWdyb3dsXCIpLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGEpe1widXNlIHN0cmljdFwiO3ZvaWQgMD09PWEuZ2V0KFwidGVtcGxhdGVzL2dyb3dsL2dyb3dsLmh0bWxcIikmJmEucHV0KFwidGVtcGxhdGVzL2dyb3dsL2dyb3dsLmh0bWxcIiwnPGRpdiBjbGFzcz1cImdyb3dsLWNvbnRhaW5lclwiIG5nLWNsYXNzPVwid3JhcHBlckNsYXNzZXMoKVwiPjxkaXYgY2xhc3M9XCJncm93bC1pdGVtIGFsZXJ0XCIgbmctcmVwZWF0PVwibWVzc2FnZSBpbiBtZXNzYWdlc1wiIG5nLWNsYXNzPVwiYWxlcnRDbGFzc2VzKG1lc3NhZ2UpXCIgbmctY2xpY2s9XCJzdG9wVGltZW91dENsb3NlKG1lc3NhZ2UpXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgbmctY2xpY2s9XCJkZWxldGVNZXNzYWdlKG1lc3NhZ2UpXCIgbmctc2hvdz1cIiFtZXNzYWdlLmRpc2FibGVDbG9zZUJ1dHRvblwiPiZ0aW1lczs8L2J1dHRvbj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgbmctc2hvdz1cInNob3dDb3VudERvd24obWVzc2FnZSlcIj57e21lc3NhZ2UuY291bnRkb3dufX08L2J1dHRvbj48aDQgY2xhc3M9XCJncm93bC10aXRsZVwiIG5nLXNob3c9XCJtZXNzYWdlLnRpdGxlXCIgbmctYmluZD1cIm1lc3NhZ2UudGl0bGVcIj48L2g0PjxkaXYgY2xhc3M9XCJncm93bC1tZXNzYWdlXCIgbmctYmluZC1odG1sPVwibWVzc2FnZS50ZXh0XCI+PC9kaXY+PC9kaXY+PC9kaXY+Jyl9XSksYW5ndWxhci5tb2R1bGUoXCJhbmd1bGFyLWdyb3dsXCIpLnByb3ZpZGVyKFwiZ3Jvd2xcIixmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO3ZhciBhPXtzdWNjZXNzOm51bGwsZXJyb3I6bnVsbCx3YXJuaW5nOm51bGwsaW5mbzpudWxsfSxiPVwibWVzc2FnZXNcIixjPVwidGV4dFwiLGQ9XCJ0aXRsZVwiLGU9XCJzZXZlcml0eVwiLGY9ITAsZz1cInZhcmlhYmxlc1wiLGg9MCxpPSExLGo9XCJ0b3AtcmlnaHRcIixrPSExLGw9ITEsbT0hMSxuPSExO3RoaXMuZ2xvYmFsVGltZVRvTGl2ZT1mdW5jdGlvbihiKXtpZihcIm9iamVjdFwiPT10eXBlb2YgYilmb3IodmFyIGMgaW4gYiliLmhhc093blByb3BlcnR5KGMpJiYoYVtjXT1iW2NdKTtlbHNlIGZvcih2YXIgZCBpbiBhKWEuaGFzT3duUHJvcGVydHkoZCkmJihhW2RdPWIpfSx0aGlzLmdsb2JhbERpc2FibGVDbG9zZUJ1dHRvbj1mdW5jdGlvbihhKXtrPWF9LHRoaXMuZ2xvYmFsRGlzYWJsZUljb25zPWZ1bmN0aW9uKGEpe2w9YX0sdGhpcy5nbG9iYWxSZXZlcnNlZE9yZGVyPWZ1bmN0aW9uKGEpe209YX0sdGhpcy5nbG9iYWxEaXNhYmxlQ291bnREb3duPWZ1bmN0aW9uKGEpe249YX0sdGhpcy5tZXNzYWdlVmFyaWFibGVLZXk9ZnVuY3Rpb24oYSl7Zz1hfSx0aGlzLmdsb2JhbElubGluZU1lc3NhZ2VzPWZ1bmN0aW9uKGEpe2k9YX0sdGhpcy5nbG9iYWxQb3NpdGlvbj1mdW5jdGlvbihhKXtqPWF9LHRoaXMubWVzc2FnZXNLZXk9ZnVuY3Rpb24oYSl7Yj1hfSx0aGlzLm1lc3NhZ2VUZXh0S2V5PWZ1bmN0aW9uKGEpe2M9YX0sdGhpcy5tZXNzYWdlVGl0bGVLZXk9ZnVuY3Rpb24oYSl7ZD1hfSx0aGlzLm1lc3NhZ2VTZXZlcml0eUtleT1mdW5jdGlvbihhKXtlPWF9LHRoaXMub25seVVuaXF1ZU1lc3NhZ2VzPWZ1bmN0aW9uKGEpe2Y9YX0sdGhpcy5zZXJ2ZXJNZXNzYWdlc0ludGVyY2VwdG9yPVtcIiRxXCIsXCJncm93bFwiLGZ1bmN0aW9uKGEsYyl7ZnVuY3Rpb24gZChhKXthLmRhdGFbYl0mJmEuZGF0YVtiXS5sZW5ndGg+MCYmYy5hZGRTZXJ2ZXJNZXNzYWdlcyhhLmRhdGFbYl0pfXJldHVybntyZXNwb25zZTpmdW5jdGlvbihhKXtyZXR1cm4gZChhKSxhfSxyZXNwb25zZUVycm9yOmZ1bmN0aW9uKGIpe3JldHVybiBkKGIpLGEucmVqZWN0KGIpfX19XSx0aGlzLiRnZXQ9W1wiJHJvb3RTY29wZVwiLFwiJGludGVycG9sYXRlXCIsXCIkZmlsdGVyXCIsZnVuY3Rpb24oYixvLHApe2Z1bmN0aW9uIHEoYSl7aWYoQilhLnRleHQ9QihhLnRleHQsYS52YXJpYWJsZXMpO2Vsc2V7dmFyIGM9byhhLnRleHQpO2EudGV4dD1jKGEudmFyaWFibGVzKX1iLiRicm9hZGNhc3QoXCJncm93bE1lc3NhZ2VcIixhKX1mdW5jdGlvbiByKGIsYyxkKXt2YXIgZSxmPWN8fHt9O2U9e3RleHQ6Yix0aXRsZTpmLnRpdGxlLHNldmVyaXR5OmQsdHRsOmYudHRsfHxhW2RdLHZhcmlhYmxlczpmLnZhcmlhYmxlc3x8e30sZGlzYWJsZUNsb3NlQnV0dG9uOnZvaWQgMD09PWYuZGlzYWJsZUNsb3NlQnV0dG9uP2s6Zi5kaXNhYmxlQ2xvc2VCdXR0b24sZGlzYWJsZUljb25zOnZvaWQgMD09PWYuZGlzYWJsZUljb25zP2w6Zi5kaXNhYmxlSWNvbnMsZGlzYWJsZUNvdW50RG93bjp2b2lkIDA9PT1mLmRpc2FibGVDb3VudERvd24/bjpmLmRpc2FibGVDb3VudERvd24scG9zaXRpb246Zi5wb3NpdGlvbnx8aixyZWZlcmVuY2VJZDpmLnJlZmVyZW5jZUlkfHxofSxxKGUpfWZ1bmN0aW9uIHMoYSxiKXtyKGEsYixcIndhcm5pbmdcIil9ZnVuY3Rpb24gdChhLGIpe3IoYSxiLFwiZXJyb3JcIil9ZnVuY3Rpb24gdShhLGIpe3IoYSxiLFwiaW5mb1wiKX1mdW5jdGlvbiB2KGEsYil7cihhLGIsXCJzdWNjZXNzXCIpfWZ1bmN0aW9uIHcoYSl7dmFyIGIsZixoLGk7Zm9yKGk9YS5sZW5ndGgsYj0wO2k+YjtiKyspaWYoZj1hW2JdLGZbY10pe2g9ZltlXXx8XCJlcnJvclwiO3ZhciBqPXt9O2oudmFyaWFibGVzPWZbZ118fHt9LGoudGl0bGU9ZltkXSxyKGZbY10saixoKX19ZnVuY3Rpb24geCgpe3JldHVybiBmfWZ1bmN0aW9uIHkoKXtyZXR1cm4gbX1mdW5jdGlvbiB6KCl7cmV0dXJuIGl9ZnVuY3Rpb24gQSgpe3JldHVybiBqfXZhciBCO3RyeXtCPXAoXCJ0cmFuc2xhdGVcIil9Y2F0Y2goQyl7fXJldHVybnt3YXJuaW5nOnMsZXJyb3I6dCxpbmZvOnUsc3VjY2Vzczp2LGFkZFNlcnZlck1lc3NhZ2VzOncsb25seVVuaXF1ZTp4LHJldmVyc2VPcmRlcjp5LGlubGluZU1lc3NhZ2VzOnoscG9zaXRpb246QX19XX0pOyIsIi8qKlxuICogQGxpY2Vuc2UgQW5ndWxhckpTIHYxLjMuMVxuICogKGMpIDIwMTAtMjAxNCBHb29nbGUsIEluYy4gaHR0cDovL2FuZ3VsYXJqcy5vcmdcbiAqIExpY2Vuc2U6IE1JVFxuICovXG4oZnVuY3Rpb24od2luZG93LCBhbmd1bGFyLCB1bmRlZmluZWQpIHsndXNlIHN0cmljdCc7XG5cbnZhciAkc2FuaXRpemVNaW5FcnIgPSBhbmd1bGFyLiQkbWluRXJyKCckc2FuaXRpemUnKTtcblxuLyoqXG4gKiBAbmdkb2MgbW9kdWxlXG4gKiBAbmFtZSBuZ1Nhbml0aXplXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiAjIG5nU2FuaXRpemVcbiAqXG4gKiBUaGUgYG5nU2FuaXRpemVgIG1vZHVsZSBwcm92aWRlcyBmdW5jdGlvbmFsaXR5IHRvIHNhbml0aXplIEhUTUwuXG4gKlxuICpcbiAqIDxkaXYgZG9jLW1vZHVsZS1jb21wb25lbnRzPVwibmdTYW5pdGl6ZVwiPjwvZGl2PlxuICpcbiAqIFNlZSB7QGxpbmsgbmdTYW5pdGl6ZS4kc2FuaXRpemUgYCRzYW5pdGl6ZWB9IGZvciB1c2FnZS5cbiAqL1xuXG4vKlxuICogSFRNTCBQYXJzZXIgQnkgTWlza28gSGV2ZXJ5IChtaXNrb0BoZXZlcnkuY29tKVxuICogYmFzZWQgb246ICBIVE1MIFBhcnNlciBCeSBKb2huIFJlc2lnIChlam9obi5vcmcpXG4gKiBPcmlnaW5hbCBjb2RlIGJ5IEVyaWsgQXJ2aWRzc29uLCBNb3ppbGxhIFB1YmxpYyBMaWNlbnNlXG4gKiBodHRwOi8vZXJpay5lYWUubmV0L3NpbXBsZWh0bWxwYXJzZXIvc2ltcGxlaHRtbHBhcnNlci5qc1xuICpcbiAqIC8vIFVzZSBsaWtlIHNvOlxuICogaHRtbFBhcnNlcihodG1sU3RyaW5nLCB7XG4gKiAgICAgc3RhcnQ6IGZ1bmN0aW9uKHRhZywgYXR0cnMsIHVuYXJ5KSB7fSxcbiAqICAgICBlbmQ6IGZ1bmN0aW9uKHRhZykge30sXG4gKiAgICAgY2hhcnM6IGZ1bmN0aW9uKHRleHQpIHt9LFxuICogICAgIGNvbW1lbnQ6IGZ1bmN0aW9uKHRleHQpIHt9XG4gKiB9KTtcbiAqXG4gKi9cblxuXG4vKipcbiAqIEBuZ2RvYyBzZXJ2aWNlXG4gKiBAbmFtZSAkc2FuaXRpemVcbiAqIEBraW5kIGZ1bmN0aW9uXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFRoZSBpbnB1dCBpcyBzYW5pdGl6ZWQgYnkgcGFyc2luZyB0aGUgSFRNTCBpbnRvIHRva2Vucy4gQWxsIHNhZmUgdG9rZW5zIChmcm9tIGEgd2hpdGVsaXN0KSBhcmVcbiAqICAgdGhlbiBzZXJpYWxpemVkIGJhY2sgdG8gcHJvcGVybHkgZXNjYXBlZCBodG1sIHN0cmluZy4gVGhpcyBtZWFucyB0aGF0IG5vIHVuc2FmZSBpbnB1dCBjYW4gbWFrZVxuICogICBpdCBpbnRvIHRoZSByZXR1cm5lZCBzdHJpbmcsIGhvd2V2ZXIsIHNpbmNlIG91ciBwYXJzZXIgaXMgbW9yZSBzdHJpY3QgdGhhbiBhIHR5cGljYWwgYnJvd3NlclxuICogICBwYXJzZXIsIGl0J3MgcG9zc2libGUgdGhhdCBzb21lIG9ic2N1cmUgaW5wdXQsIHdoaWNoIHdvdWxkIGJlIHJlY29nbml6ZWQgYXMgdmFsaWQgSFRNTCBieSBhXG4gKiAgIGJyb3dzZXIsIHdvbid0IG1ha2UgaXQgdGhyb3VnaCB0aGUgc2FuaXRpemVyLiBUaGUgaW5wdXQgbWF5IGFsc28gY29udGFpbiBTVkcgbWFya3VwLlxuICogICBUaGUgd2hpdGVsaXN0IGlzIGNvbmZpZ3VyZWQgdXNpbmcgdGhlIGZ1bmN0aW9ucyBgYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3RgIGFuZFxuICogICBgaW1nU3JjU2FuaXRpemF0aW9uV2hpdGVsaXN0YCBvZiB7QGxpbmsgbmcuJGNvbXBpbGVQcm92aWRlciBgJGNvbXBpbGVQcm92aWRlcmB9LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIEhUTUwgaW5wdXQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBTYW5pdGl6ZWQgSFRNTC5cbiAqXG4gKiBAZXhhbXBsZVxuICAgPGV4YW1wbGUgbW9kdWxlPVwic2FuaXRpemVFeGFtcGxlXCIgZGVwcz1cImFuZ3VsYXItc2FuaXRpemUuanNcIj5cbiAgIDxmaWxlIG5hbWU9XCJpbmRleC5odG1sXCI+XG4gICAgIDxzY3JpcHQ+XG4gICAgICAgICBhbmd1bGFyLm1vZHVsZSgnc2FuaXRpemVFeGFtcGxlJywgWyduZ1Nhbml0aXplJ10pXG4gICAgICAgICAgIC5jb250cm9sbGVyKCdFeGFtcGxlQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzY2UnLCBmdW5jdGlvbigkc2NvcGUsICRzY2UpIHtcbiAgICAgICAgICAgICAkc2NvcGUuc25pcHBldCA9XG4gICAgICAgICAgICAgICAnPHAgc3R5bGU9XCJjb2xvcjpibHVlXCI+YW4gaHRtbFxcbicgK1xuICAgICAgICAgICAgICAgJzxlbSBvbm1vdXNlb3Zlcj1cInRoaXMudGV4dENvbnRlbnQ9XFwnUFdOM0QhXFwnXCI+Y2xpY2sgaGVyZTwvZW0+XFxuJyArXG4gICAgICAgICAgICAgICAnc25pcHBldDwvcD4nO1xuICAgICAgICAgICAgICRzY29wZS5kZWxpYmVyYXRlbHlUcnVzdERhbmdlcm91c1NuaXBwZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKCRzY29wZS5zbmlwcGV0KTtcbiAgICAgICAgICAgICB9O1xuICAgICAgICAgICB9XSk7XG4gICAgIDwvc2NyaXB0PlxuICAgICA8ZGl2IG5nLWNvbnRyb2xsZXI9XCJFeGFtcGxlQ29udHJvbGxlclwiPlxuICAgICAgICBTbmlwcGV0OiA8dGV4dGFyZWEgbmctbW9kZWw9XCJzbmlwcGV0XCIgY29scz1cIjYwXCIgcm93cz1cIjNcIj48L3RleHRhcmVhPlxuICAgICAgIDx0YWJsZT5cbiAgICAgICAgIDx0cj5cbiAgICAgICAgICAgPHRkPkRpcmVjdGl2ZTwvdGQ+XG4gICAgICAgICAgIDx0ZD5Ib3c8L3RkPlxuICAgICAgICAgICA8dGQ+U291cmNlPC90ZD5cbiAgICAgICAgICAgPHRkPlJlbmRlcmVkPC90ZD5cbiAgICAgICAgIDwvdHI+XG4gICAgICAgICA8dHIgaWQ9XCJiaW5kLWh0bWwtd2l0aC1zYW5pdGl6ZVwiPlxuICAgICAgICAgICA8dGQ+bmctYmluZC1odG1sPC90ZD5cbiAgICAgICAgICAgPHRkPkF1dG9tYXRpY2FsbHkgdXNlcyAkc2FuaXRpemU8L3RkPlxuICAgICAgICAgICA8dGQ+PHByZT4mbHQ7ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXRcIiZndDs8YnIvPiZsdDsvZGl2Jmd0OzwvcHJlPjwvdGQ+XG4gICAgICAgICAgIDx0ZD48ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXRcIj48L2Rpdj48L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICAgIDx0ciBpZD1cImJpbmQtaHRtbC13aXRoLXRydXN0XCI+XG4gICAgICAgICAgIDx0ZD5uZy1iaW5kLWh0bWw8L3RkPlxuICAgICAgICAgICA8dGQ+QnlwYXNzICRzYW5pdGl6ZSBieSBleHBsaWNpdGx5IHRydXN0aW5nIHRoZSBkYW5nZXJvdXMgdmFsdWU8L3RkPlxuICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgIDxwcmU+Jmx0O2RpdiBuZy1iaW5kLWh0bWw9XCJkZWxpYmVyYXRlbHlUcnVzdERhbmdlcm91c1NuaXBwZXQoKVwiJmd0O1xuJmx0Oy9kaXYmZ3Q7PC9wcmU+XG4gICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgIDx0ZD48ZGl2IG5nLWJpbmQtaHRtbD1cImRlbGliZXJhdGVseVRydXN0RGFuZ2Vyb3VzU25pcHBldCgpXCI+PC9kaXY+PC90ZD5cbiAgICAgICAgIDwvdHI+XG4gICAgICAgICA8dHIgaWQ9XCJiaW5kLWRlZmF1bHRcIj5cbiAgICAgICAgICAgPHRkPm5nLWJpbmQ8L3RkPlxuICAgICAgICAgICA8dGQ+QXV0b21hdGljYWxseSBlc2NhcGVzPC90ZD5cbiAgICAgICAgICAgPHRkPjxwcmU+Jmx0O2RpdiBuZy1iaW5kPVwic25pcHBldFwiJmd0Ozxici8+Jmx0Oy9kaXYmZ3Q7PC9wcmU+PC90ZD5cbiAgICAgICAgICAgPHRkPjxkaXYgbmctYmluZD1cInNuaXBwZXRcIj48L2Rpdj48L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICA8L3RhYmxlPlxuICAgICAgIDwvZGl2PlxuICAgPC9maWxlPlxuICAgPGZpbGUgbmFtZT1cInByb3RyYWN0b3IuanNcIiB0eXBlPVwicHJvdHJhY3RvclwiPlxuICAgICBpdCgnc2hvdWxkIHNhbml0aXplIHRoZSBodG1sIHNuaXBwZXQgYnkgZGVmYXVsdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2JpbmQtaHRtbC13aXRoLXNhbml0aXplIGRpdicpKS5nZXRJbm5lckh0bWwoKSkuXG4gICAgICAgICB0b0JlKCc8cD5hbiBodG1sXFxuPGVtPmNsaWNrIGhlcmU8L2VtPlxcbnNuaXBwZXQ8L3A+Jyk7XG4gICAgIH0pO1xuXG4gICAgIGl0KCdzaG91bGQgaW5saW5lIHJhdyBzbmlwcGV0IGlmIGJvdW5kIHRvIGEgdHJ1c3RlZCB2YWx1ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2JpbmQtaHRtbC13aXRoLXRydXN0IGRpdicpKS5nZXRJbm5lckh0bWwoKSkuXG4gICAgICAgICB0b0JlKFwiPHAgc3R5bGU9XFxcImNvbG9yOmJsdWVcXFwiPmFuIGh0bWxcXG5cIiArXG4gICAgICAgICAgICAgIFwiPGVtIG9ubW91c2VvdmVyPVxcXCJ0aGlzLnRleHRDb250ZW50PSdQV04zRCEnXFxcIj5jbGljayBoZXJlPC9lbT5cXG5cIiArXG4gICAgICAgICAgICAgIFwic25pcHBldDwvcD5cIik7XG4gICAgIH0pO1xuXG4gICAgIGl0KCdzaG91bGQgZXNjYXBlIHNuaXBwZXQgd2l0aG91dCBhbnkgZmlsdGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjYmluZC1kZWZhdWx0IGRpdicpKS5nZXRJbm5lckh0bWwoKSkuXG4gICAgICAgICB0b0JlKFwiJmx0O3Agc3R5bGU9XFxcImNvbG9yOmJsdWVcXFwiJmd0O2FuIGh0bWxcXG5cIiArXG4gICAgICAgICAgICAgIFwiJmx0O2VtIG9ubW91c2VvdmVyPVxcXCJ0aGlzLnRleHRDb250ZW50PSdQV04zRCEnXFxcIiZndDtjbGljayBoZXJlJmx0Oy9lbSZndDtcXG5cIiArXG4gICAgICAgICAgICAgIFwic25pcHBldCZsdDsvcCZndDtcIik7XG4gICAgIH0pO1xuXG4gICAgIGl0KCdzaG91bGQgdXBkYXRlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgZWxlbWVudChieS5tb2RlbCgnc25pcHBldCcpKS5jbGVhcigpO1xuICAgICAgIGVsZW1lbnQoYnkubW9kZWwoJ3NuaXBwZXQnKSkuc2VuZEtleXMoJ25ldyA8YiBvbmNsaWNrPVwiYWxlcnQoMSlcIj50ZXh0PC9iPicpO1xuICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2JpbmQtaHRtbC13aXRoLXNhbml0aXplIGRpdicpKS5nZXRJbm5lckh0bWwoKSkuXG4gICAgICAgICB0b0JlKCduZXcgPGI+dGV4dDwvYj4nKTtcbiAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNiaW5kLWh0bWwtd2l0aC10cnVzdCBkaXYnKSkuZ2V0SW5uZXJIdG1sKCkpLnRvQmUoXG4gICAgICAgICAnbmV3IDxiIG9uY2xpY2s9XCJhbGVydCgxKVwiPnRleHQ8L2I+Jyk7XG4gICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjYmluZC1kZWZhdWx0IGRpdicpKS5nZXRJbm5lckh0bWwoKSkudG9CZShcbiAgICAgICAgIFwibmV3ICZsdDtiIG9uY2xpY2s9XFxcImFsZXJ0KDEpXFxcIiZndDt0ZXh0Jmx0Oy9iJmd0O1wiKTtcbiAgICAgfSk7XG4gICA8L2ZpbGU+XG4gICA8L2V4YW1wbGU+XG4gKi9cbmZ1bmN0aW9uICRTYW5pdGl6ZVByb3ZpZGVyKCkge1xuICB0aGlzLiRnZXQgPSBbJyQkc2FuaXRpemVVcmknLCBmdW5jdGlvbigkJHNhbml0aXplVXJpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgIHZhciBidWYgPSBbXTtcbiAgICAgIGh0bWxQYXJzZXIoaHRtbCwgaHRtbFNhbml0aXplV3JpdGVyKGJ1ZiwgZnVuY3Rpb24odXJpLCBpc0ltYWdlKSB7XG4gICAgICAgIHJldHVybiAhL151bnNhZmUvLnRlc3QoJCRzYW5pdGl6ZVVyaSh1cmksIGlzSW1hZ2UpKTtcbiAgICAgIH0pKTtcbiAgICAgIHJldHVybiBidWYuam9pbignJyk7XG4gICAgfTtcbiAgfV07XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplVGV4dChjaGFycykge1xuICB2YXIgYnVmID0gW107XG4gIHZhciB3cml0ZXIgPSBodG1sU2FuaXRpemVXcml0ZXIoYnVmLCBhbmd1bGFyLm5vb3ApO1xuICB3cml0ZXIuY2hhcnMoY2hhcnMpO1xuICByZXR1cm4gYnVmLmpvaW4oJycpO1xufVxuXG5cbi8vIFJlZ3VsYXIgRXhwcmVzc2lvbnMgZm9yIHBhcnNpbmcgdGFncyBhbmQgYXR0cmlidXRlc1xudmFyIFNUQVJUX1RBR19SRUdFWFAgPVxuICAgICAgIC9ePCgoPzpbYS16QS1aXSlbXFx3Oi1dKikoKD86XFxzK1tcXHc6LV0rKD86XFxzKj1cXHMqKD86KD86XCJbXlwiXSpcIil8KD86J1teJ10qJyl8W14+XFxzXSspKT8pKilcXHMqKFxcLz8pXFxzKig+PykvLFxuICBFTkRfVEFHX1JFR0VYUCA9IC9ePFxcL1xccyooW1xcdzotXSspW14+XSo+LyxcbiAgQVRUUl9SRUdFWFAgPSAvKFtcXHc6LV0rKSg/Olxccyo9XFxzKig/Oig/OlwiKCg/OlteXCJdKSopXCIpfCg/OicoKD86W14nXSkqKScpfChbXj5cXHNdKykpKT8vZyxcbiAgQkVHSU5fVEFHX1JFR0VYUCA9IC9ePC8sXG4gIEJFR0lOR19FTkRfVEFHRV9SRUdFWFAgPSAvXjxcXC8vLFxuICBDT01NRU5UX1JFR0VYUCA9IC88IS0tKC4qPyktLT4vZyxcbiAgRE9DVFlQRV9SRUdFWFAgPSAvPCFET0NUWVBFKFtePl0qPyk+L2ksXG4gIENEQVRBX1JFR0VYUCA9IC88IVxcW0NEQVRBXFxbKC4qPyldXT4vZyxcbiAgU1VSUk9HQVRFX1BBSVJfUkVHRVhQID0gL1tcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl0vZyxcbiAgLy8gTWF0Y2ggZXZlcnl0aGluZyBvdXRzaWRlIG9mIG5vcm1hbCBjaGFycyBhbmQgXCIgKHF1b3RlIGNoYXJhY3RlcilcbiAgTk9OX0FMUEhBTlVNRVJJQ19SRUdFWFAgPSAvKFteXFwjLX58IHwhXSkvZztcblxuXG4vLyBHb29kIHNvdXJjZSBvZiBpbmZvIGFib3V0IGVsZW1lbnRzIGFuZCBhdHRyaWJ1dGVzXG4vLyBodHRwOi8vZGV2LnczLm9yZy9odG1sNS9zcGVjL092ZXJ2aWV3Lmh0bWwjc2VtYW50aWNzXG4vLyBodHRwOi8vc2ltb24uaHRtbDUub3JnL2h0bWwtZWxlbWVudHNcblxuLy8gU2FmZSBWb2lkIEVsZW1lbnRzIC0gSFRNTDVcbi8vIGh0dHA6Ly9kZXYudzMub3JnL2h0bWw1L3NwZWMvT3ZlcnZpZXcuaHRtbCN2b2lkLWVsZW1lbnRzXG52YXIgdm9pZEVsZW1lbnRzID0gbWFrZU1hcChcImFyZWEsYnIsY29sLGhyLGltZyx3YnJcIik7XG5cbi8vIEVsZW1lbnRzIHRoYXQgeW91IGNhbiwgaW50ZW50aW9uYWxseSwgbGVhdmUgb3BlbiAoYW5kIHdoaWNoIGNsb3NlIHRoZW1zZWx2ZXMpXG4vLyBodHRwOi8vZGV2LnczLm9yZy9odG1sNS9zcGVjL092ZXJ2aWV3Lmh0bWwjb3B0aW9uYWwtdGFnc1xudmFyIG9wdGlvbmFsRW5kVGFnQmxvY2tFbGVtZW50cyA9IG1ha2VNYXAoXCJjb2xncm91cCxkZCxkdCxsaSxwLHRib2R5LHRkLHRmb290LHRoLHRoZWFkLHRyXCIpLFxuICAgIG9wdGlvbmFsRW5kVGFnSW5saW5lRWxlbWVudHMgPSBtYWtlTWFwKFwicnAscnRcIiksXG4gICAgb3B0aW9uYWxFbmRUYWdFbGVtZW50cyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25hbEVuZFRhZ0lubGluZUVsZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25hbEVuZFRhZ0Jsb2NrRWxlbWVudHMpO1xuXG4vLyBTYWZlIEJsb2NrIEVsZW1lbnRzIC0gSFRNTDVcbnZhciBibG9ja0VsZW1lbnRzID0gYW5ndWxhci5leHRlbmQoe30sIG9wdGlvbmFsRW5kVGFnQmxvY2tFbGVtZW50cywgbWFrZU1hcChcImFkZHJlc3MsYXJ0aWNsZSxcIiArXG4gICAgICAgIFwiYXNpZGUsYmxvY2txdW90ZSxjYXB0aW9uLGNlbnRlcixkZWwsZGlyLGRpdixkbCxmaWd1cmUsZmlnY2FwdGlvbixmb290ZXIsaDEsaDIsaDMsaDQsaDUsXCIgK1xuICAgICAgICBcImg2LGhlYWRlcixoZ3JvdXAsaHIsaW5zLG1hcCxtZW51LG5hdixvbCxwcmUsc2NyaXB0LHNlY3Rpb24sdGFibGUsdWxcIikpO1xuXG4vLyBJbmxpbmUgRWxlbWVudHMgLSBIVE1MNVxudmFyIGlubGluZUVsZW1lbnRzID0gYW5ndWxhci5leHRlbmQoe30sIG9wdGlvbmFsRW5kVGFnSW5saW5lRWxlbWVudHMsIG1ha2VNYXAoXCJhLGFiYnIsYWNyb255bSxiLFwiICtcbiAgICAgICAgXCJiZGksYmRvLGJpZyxicixjaXRlLGNvZGUsZGVsLGRmbixlbSxmb250LGksaW1nLGlucyxrYmQsbGFiZWwsbWFwLG1hcmsscSxydWJ5LHJwLHJ0LHMsXCIgK1xuICAgICAgICBcInNhbXAsc21hbGwsc3BhbixzdHJpa2Usc3Ryb25nLHN1YixzdXAsdGltZSx0dCx1LHZhclwiKSk7XG5cbi8vIFNWRyBFbGVtZW50c1xuLy8gaHR0cHM6Ly93aWtpLndoYXR3Zy5vcmcvd2lraS9TYW5pdGl6YXRpb25fcnVsZXMjc3ZnX0VsZW1lbnRzXG52YXIgc3ZnRWxlbWVudHMgPSBtYWtlTWFwKFwiYW5pbWF0ZSxhbmltYXRlQ29sb3IsYW5pbWF0ZU1vdGlvbixhbmltYXRlVHJhbnNmb3JtLGNpcmNsZSxkZWZzLFwiICtcbiAgICAgICAgXCJkZXNjLGVsbGlwc2UsZm9udC1mYWNlLGZvbnQtZmFjZS1uYW1lLGZvbnQtZmFjZS1zcmMsZyxnbHlwaCxoa2VybixpbWFnZSxsaW5lYXJHcmFkaWVudCxcIiArXG4gICAgICAgIFwibGluZSxtYXJrZXIsbWV0YWRhdGEsbWlzc2luZy1nbHlwaCxtcGF0aCxwYXRoLHBvbHlnb24scG9seWxpbmUscmFkaWFsR3JhZGllbnQscmVjdCxzZXQsXCIgK1xuICAgICAgICBcInN0b3Asc3ZnLHN3aXRjaCx0ZXh0LHRpdGxlLHRzcGFuLHVzZVwiKTtcblxuLy8gU3BlY2lhbCBFbGVtZW50cyAoY2FuIGNvbnRhaW4gYW55dGhpbmcpXG52YXIgc3BlY2lhbEVsZW1lbnRzID0gbWFrZU1hcChcInNjcmlwdCxzdHlsZVwiKTtcblxudmFyIHZhbGlkRWxlbWVudHMgPSBhbmd1bGFyLmV4dGVuZCh7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZEVsZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9ja0VsZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmxpbmVFbGVtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uYWxFbmRUYWdFbGVtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnRWxlbWVudHMpO1xuXG4vL0F0dHJpYnV0ZXMgdGhhdCBoYXZlIGhyZWYgYW5kIGhlbmNlIG5lZWQgdG8gYmUgc2FuaXRpemVkXG52YXIgdXJpQXR0cnMgPSBtYWtlTWFwKFwiYmFja2dyb3VuZCxjaXRlLGhyZWYsbG9uZ2Rlc2Msc3JjLHVzZW1hcCx4bGluazpocmVmXCIpO1xuXG52YXIgaHRtbEF0dHJzID0gbWFrZU1hcCgnYWJicixhbGlnbixhbHQsYXhpcyxiZ2NvbG9yLGJvcmRlcixjZWxscGFkZGluZyxjZWxsc3BhY2luZyxjbGFzcyxjbGVhciwnK1xuICAgICdjb2xvcixjb2xzLGNvbHNwYW4sY29tcGFjdCxjb29yZHMsZGlyLGZhY2UsaGVhZGVycyxoZWlnaHQsaHJlZmxhbmcsaHNwYWNlLCcrXG4gICAgJ2lzbWFwLGxhbmcsbGFuZ3VhZ2Usbm9ocmVmLG5vd3JhcCxyZWwscmV2LHJvd3Mscm93c3BhbixydWxlcywnK1xuICAgICdzY29wZSxzY3JvbGxpbmcsc2hhcGUsc2l6ZSxzcGFuLHN0YXJ0LHN1bW1hcnksdGFyZ2V0LHRpdGxlLHR5cGUsJytcbiAgICAndmFsaWduLHZhbHVlLHZzcGFjZSx3aWR0aCcpO1xuXG4vLyBTVkcgYXR0cmlidXRlcyAod2l0aG91dCBcImlkXCIgYW5kIFwibmFtZVwiIGF0dHJpYnV0ZXMpXG4vLyBodHRwczovL3dpa2kud2hhdHdnLm9yZy93aWtpL1Nhbml0aXphdGlvbl9ydWxlcyNzdmdfQXR0cmlidXRlc1xudmFyIHN2Z0F0dHJzID0gbWFrZU1hcCgnYWNjZW50LWhlaWdodCxhY2N1bXVsYXRlLGFkZGl0aXZlLGFscGhhYmV0aWMsYXJhYmljLWZvcm0sYXNjZW50LCcrXG4gICAgJ2F0dHJpYnV0ZU5hbWUsYXR0cmlidXRlVHlwZSxiYXNlUHJvZmlsZSxiYm94LGJlZ2luLGJ5LGNhbGNNb2RlLGNhcC1oZWlnaHQsY2xhc3MsY29sb3IsJytcbiAgICAnY29sb3ItcmVuZGVyaW5nLGNvbnRlbnQsY3gsY3ksZCxkeCxkeSxkZXNjZW50LGRpc3BsYXksZHVyLGVuZCxmaWxsLGZpbGwtcnVsZSxmb250LWZhbWlseSwnK1xuICAgICdmb250LXNpemUsZm9udC1zdHJldGNoLGZvbnQtc3R5bGUsZm9udC12YXJpYW50LGZvbnQtd2VpZ2h0LGZyb20sZngsZnksZzEsZzIsZ2x5cGgtbmFtZSwnK1xuICAgICdncmFkaWVudFVuaXRzLGhhbmdpbmcsaGVpZ2h0LGhvcml6LWFkdi14LGhvcml6LW9yaWdpbi14LGlkZW9ncmFwaGljLGssa2V5UG9pbnRzLCcrXG4gICAgJ2tleVNwbGluZXMsa2V5VGltZXMsbGFuZyxtYXJrZXItZW5kLG1hcmtlci1taWQsbWFya2VyLXN0YXJ0LG1hcmtlckhlaWdodCxtYXJrZXJVbml0cywnK1xuICAgICdtYXJrZXJXaWR0aCxtYXRoZW1hdGljYWwsbWF4LG1pbixvZmZzZXQsb3BhY2l0eSxvcmllbnQsb3JpZ2luLG92ZXJsaW5lLXBvc2l0aW9uLCcrXG4gICAgJ292ZXJsaW5lLXRoaWNrbmVzcyxwYW5vc2UtMSxwYXRoLHBhdGhMZW5ndGgscG9pbnRzLHByZXNlcnZlQXNwZWN0UmF0aW8scixyZWZYLHJlZlksJytcbiAgICAncmVwZWF0Q291bnQscmVwZWF0RHVyLHJlcXVpcmVkRXh0ZW5zaW9ucyxyZXF1aXJlZEZlYXR1cmVzLHJlc3RhcnQscm90YXRlLHJ4LHJ5LHNsb3BlLHN0ZW1oLCcrXG4gICAgJ3N0ZW12LHN0b3AtY29sb3Isc3RvcC1vcGFjaXR5LHN0cmlrZXRocm91Z2gtcG9zaXRpb24sc3RyaWtldGhyb3VnaC10aGlja25lc3Msc3Ryb2tlLCcrXG4gICAgJ3N0cm9rZS1kYXNoYXJyYXksc3Ryb2tlLWRhc2hvZmZzZXQsc3Ryb2tlLWxpbmVjYXAsc3Ryb2tlLWxpbmVqb2luLHN0cm9rZS1taXRlcmxpbWl0LCcrXG4gICAgJ3N0cm9rZS1vcGFjaXR5LHN0cm9rZS13aWR0aCxzeXN0ZW1MYW5ndWFnZSx0YXJnZXQsdGV4dC1hbmNob3IsdG8sdHJhbnNmb3JtLHR5cGUsdTEsdTIsJytcbiAgICAndW5kZXJsaW5lLXBvc2l0aW9uLHVuZGVybGluZS10aGlja25lc3MsdW5pY29kZSx1bmljb2RlLXJhbmdlLHVuaXRzLXBlci1lbSx2YWx1ZXMsdmVyc2lvbiwnK1xuICAgICd2aWV3Qm94LHZpc2liaWxpdHksd2lkdGgsd2lkdGhzLHgseC1oZWlnaHQseDEseDIseGxpbms6YWN0dWF0ZSx4bGluazphcmNyb2xlLHhsaW5rOnJvbGUsJytcbiAgICAneGxpbms6c2hvdyx4bGluazp0aXRsZSx4bGluazp0eXBlLHhtbDpiYXNlLHhtbDpsYW5nLHhtbDpzcGFjZSx4bWxucyx4bWxuczp4bGluayx5LHkxLHkyLCcrXG4gICAgJ3pvb21BbmRQYW4nKTtcblxudmFyIHZhbGlkQXR0cnMgPSBhbmd1bGFyLmV4dGVuZCh7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJpQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN2Z0F0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sQXR0cnMpO1xuXG5mdW5jdGlvbiBtYWtlTWFwKHN0cikge1xuICB2YXIgb2JqID0ge30sIGl0ZW1zID0gc3RyLnNwbGl0KCcsJyksIGk7XG4gIGZvciAoaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykgb2JqW2l0ZW1zW2ldXSA9IHRydWU7XG4gIHJldHVybiBvYmo7XG59XG5cblxuLyoqXG4gKiBAZXhhbXBsZVxuICogaHRtbFBhcnNlcihodG1sU3RyaW5nLCB7XG4gKiAgICAgc3RhcnQ6IGZ1bmN0aW9uKHRhZywgYXR0cnMsIHVuYXJ5KSB7fSxcbiAqICAgICBlbmQ6IGZ1bmN0aW9uKHRhZykge30sXG4gKiAgICAgY2hhcnM6IGZ1bmN0aW9uKHRleHQpIHt9LFxuICogICAgIGNvbW1lbnQ6IGZ1bmN0aW9uKHRleHQpIHt9XG4gKiB9KTtcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBzdHJpbmdcbiAqIEBwYXJhbSB7b2JqZWN0fSBoYW5kbGVyXG4gKi9cbmZ1bmN0aW9uIGh0bWxQYXJzZXIoaHRtbCwgaGFuZGxlcikge1xuICBpZiAodHlwZW9mIGh0bWwgIT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKGh0bWwgPT09IG51bGwgfHwgdHlwZW9mIGh0bWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBodG1sID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGh0bWwgPSAnJyArIGh0bWw7XG4gICAgfVxuICB9XG4gIHZhciBpbmRleCwgY2hhcnMsIG1hdGNoLCBzdGFjayA9IFtdLCBsYXN0ID0gaHRtbCwgdGV4dDtcbiAgc3RhY2subGFzdCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3RhY2tbIHN0YWNrLmxlbmd0aCAtIDEgXTsgfTtcblxuICB3aGlsZSAoaHRtbCkge1xuICAgIHRleHQgPSAnJztcbiAgICBjaGFycyA9IHRydWU7XG5cbiAgICAvLyBNYWtlIHN1cmUgd2UncmUgbm90IGluIGEgc2NyaXB0IG9yIHN0eWxlIGVsZW1lbnRcbiAgICBpZiAoIXN0YWNrLmxhc3QoKSB8fCAhc3BlY2lhbEVsZW1lbnRzWyBzdGFjay5sYXN0KCkgXSkge1xuXG4gICAgICAvLyBDb21tZW50XG4gICAgICBpZiAoaHRtbC5pbmRleE9mKFwiPCEtLVwiKSA9PT0gMCkge1xuICAgICAgICAvLyBjb21tZW50cyBjb250YWluaW5nIC0tIGFyZSBub3QgYWxsb3dlZCB1bmxlc3MgdGhleSB0ZXJtaW5hdGUgdGhlIGNvbW1lbnRcbiAgICAgICAgaW5kZXggPSBodG1sLmluZGV4T2YoXCItLVwiLCA0KTtcblxuICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBodG1sLmxhc3RJbmRleE9mKFwiLS0+XCIsIGluZGV4KSA9PT0gaW5kZXgpIHtcbiAgICAgICAgICBpZiAoaGFuZGxlci5jb21tZW50KSBoYW5kbGVyLmNvbW1lbnQoaHRtbC5zdWJzdHJpbmcoNCwgaW5kZXgpKTtcbiAgICAgICAgICBodG1sID0gaHRtbC5zdWJzdHJpbmcoaW5kZXggKyAzKTtcbiAgICAgICAgICBjaGFycyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAvLyBET0NUWVBFXG4gICAgICB9IGVsc2UgaWYgKERPQ1RZUEVfUkVHRVhQLnRlc3QoaHRtbCkpIHtcbiAgICAgICAgbWF0Y2ggPSBodG1sLm1hdGNoKERPQ1RZUEVfUkVHRVhQKTtcblxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKG1hdGNoWzBdLCAnJyk7XG4gICAgICAgICAgY2hhcnMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgLy8gZW5kIHRhZ1xuICAgICAgfSBlbHNlIGlmIChCRUdJTkdfRU5EX1RBR0VfUkVHRVhQLnRlc3QoaHRtbCkpIHtcbiAgICAgICAgbWF0Y2ggPSBodG1sLm1hdGNoKEVORF9UQUdfUkVHRVhQKTtcblxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICBodG1sID0gaHRtbC5zdWJzdHJpbmcobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgICBtYXRjaFswXS5yZXBsYWNlKEVORF9UQUdfUkVHRVhQLCBwYXJzZUVuZFRhZyk7XG4gICAgICAgICAgY2hhcnMgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAvLyBzdGFydCB0YWdcbiAgICAgIH0gZWxzZSBpZiAoQkVHSU5fVEFHX1JFR0VYUC50ZXN0KGh0bWwpKSB7XG4gICAgICAgIG1hdGNoID0gaHRtbC5tYXRjaChTVEFSVF9UQUdfUkVHRVhQKTtcblxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAvLyBXZSBvbmx5IGhhdmUgYSB2YWxpZCBzdGFydC10YWcgaWYgdGhlcmUgaXMgYSAnPicuXG4gICAgICAgICAgaWYgKG1hdGNoWzRdKSB7XG4gICAgICAgICAgICBodG1sID0gaHRtbC5zdWJzdHJpbmcobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgICAgIG1hdGNoWzBdLnJlcGxhY2UoU1RBUlRfVEFHX1JFR0VYUCwgcGFyc2VTdGFydFRhZyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNoYXJzID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbm8gZW5kaW5nIHRhZyBmb3VuZCAtLS0gdGhpcyBwaWVjZSBzaG91bGQgYmUgZW5jb2RlZCBhcyBhbiBlbnRpdHkuXG4gICAgICAgICAgdGV4dCArPSAnPCc7XG4gICAgICAgICAgaHRtbCA9IGh0bWwuc3Vic3RyaW5nKDEpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjaGFycykge1xuICAgICAgICBpbmRleCA9IGh0bWwuaW5kZXhPZihcIjxcIik7XG5cbiAgICAgICAgdGV4dCArPSBpbmRleCA8IDAgPyBodG1sIDogaHRtbC5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuICAgICAgICBodG1sID0gaW5kZXggPCAwID8gXCJcIiA6IGh0bWwuc3Vic3RyaW5nKGluZGV4KTtcblxuICAgICAgICBpZiAoaGFuZGxlci5jaGFycykgaGFuZGxlci5jaGFycyhkZWNvZGVFbnRpdGllcyh0ZXh0KSk7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShuZXcgUmVnRXhwKFwiKC4qKTxcXFxccypcXFxcL1xcXFxzKlwiICsgc3RhY2subGFzdCgpICsgXCJbXj5dKj5cIiwgJ2knKSxcbiAgICAgICAgZnVuY3Rpb24oYWxsLCB0ZXh0KSB7XG4gICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShDT01NRU5UX1JFR0VYUCwgXCIkMVwiKS5yZXBsYWNlKENEQVRBX1JFR0VYUCwgXCIkMVwiKTtcblxuICAgICAgICAgIGlmIChoYW5kbGVyLmNoYXJzKSBoYW5kbGVyLmNoYXJzKGRlY29kZUVudGl0aWVzKHRleHQpKTtcblxuICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgfSk7XG5cbiAgICAgIHBhcnNlRW5kVGFnKFwiXCIsIHN0YWNrLmxhc3QoKSk7XG4gICAgfVxuXG4gICAgaWYgKGh0bWwgPT0gbGFzdCkge1xuICAgICAgdGhyb3cgJHNhbml0aXplTWluRXJyKCdiYWRwYXJzZScsIFwiVGhlIHNhbml0aXplciB3YXMgdW5hYmxlIHRvIHBhcnNlIHRoZSBmb2xsb3dpbmcgYmxvY2sgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwib2YgaHRtbDogezB9XCIsIGh0bWwpO1xuICAgIH1cbiAgICBsYXN0ID0gaHRtbDtcbiAgfVxuXG4gIC8vIENsZWFuIHVwIGFueSByZW1haW5pbmcgdGFnc1xuICBwYXJzZUVuZFRhZygpO1xuXG4gIGZ1bmN0aW9uIHBhcnNlU3RhcnRUYWcodGFnLCB0YWdOYW1lLCByZXN0LCB1bmFyeSkge1xuICAgIHRhZ05hbWUgPSBhbmd1bGFyLmxvd2VyY2FzZSh0YWdOYW1lKTtcbiAgICBpZiAoYmxvY2tFbGVtZW50c1sgdGFnTmFtZSBdKSB7XG4gICAgICB3aGlsZSAoc3RhY2subGFzdCgpICYmIGlubGluZUVsZW1lbnRzWyBzdGFjay5sYXN0KCkgXSkge1xuICAgICAgICBwYXJzZUVuZFRhZyhcIlwiLCBzdGFjay5sYXN0KCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvcHRpb25hbEVuZFRhZ0VsZW1lbnRzWyB0YWdOYW1lIF0gJiYgc3RhY2subGFzdCgpID09IHRhZ05hbWUpIHtcbiAgICAgIHBhcnNlRW5kVGFnKFwiXCIsIHRhZ05hbWUpO1xuICAgIH1cblxuICAgIHVuYXJ5ID0gdm9pZEVsZW1lbnRzWyB0YWdOYW1lIF0gfHwgISF1bmFyeTtcblxuICAgIGlmICghdW5hcnkpXG4gICAgICBzdGFjay5wdXNoKHRhZ05hbWUpO1xuXG4gICAgdmFyIGF0dHJzID0ge307XG5cbiAgICByZXN0LnJlcGxhY2UoQVRUUl9SRUdFWFAsXG4gICAgICBmdW5jdGlvbihtYXRjaCwgbmFtZSwgZG91YmxlUXVvdGVkVmFsdWUsIHNpbmdsZVF1b3RlZFZhbHVlLCB1bnF1b3RlZFZhbHVlKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGRvdWJsZVF1b3RlZFZhbHVlXG4gICAgICAgICAgfHwgc2luZ2xlUXVvdGVkVmFsdWVcbiAgICAgICAgICB8fCB1bnF1b3RlZFZhbHVlXG4gICAgICAgICAgfHwgJyc7XG5cbiAgICAgICAgYXR0cnNbbmFtZV0gPSBkZWNvZGVFbnRpdGllcyh2YWx1ZSk7XG4gICAgfSk7XG4gICAgaWYgKGhhbmRsZXIuc3RhcnQpIGhhbmRsZXIuc3RhcnQodGFnTmFtZSwgYXR0cnMsIHVuYXJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlRW5kVGFnKHRhZywgdGFnTmFtZSkge1xuICAgIHZhciBwb3MgPSAwLCBpO1xuICAgIHRhZ05hbWUgPSBhbmd1bGFyLmxvd2VyY2FzZSh0YWdOYW1lKTtcbiAgICBpZiAodGFnTmFtZSlcbiAgICAgIC8vIEZpbmQgdGhlIGNsb3Nlc3Qgb3BlbmVkIHRhZyBvZiB0aGUgc2FtZSB0eXBlXG4gICAgICBmb3IgKHBvcyA9IHN0YWNrLmxlbmd0aCAtIDE7IHBvcyA+PSAwOyBwb3MtLSlcbiAgICAgICAgaWYgKHN0YWNrWyBwb3MgXSA9PSB0YWdOYW1lKVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgaWYgKHBvcyA+PSAwKSB7XG4gICAgICAvLyBDbG9zZSBhbGwgdGhlIG9wZW4gZWxlbWVudHMsIHVwIHRoZSBzdGFja1xuICAgICAgZm9yIChpID0gc3RhY2subGVuZ3RoIC0gMTsgaSA+PSBwb3M7IGktLSlcbiAgICAgICAgaWYgKGhhbmRsZXIuZW5kKSBoYW5kbGVyLmVuZChzdGFja1sgaSBdKTtcblxuICAgICAgLy8gUmVtb3ZlIHRoZSBvcGVuIGVsZW1lbnRzIGZyb20gdGhlIHN0YWNrXG4gICAgICBzdGFjay5sZW5ndGggPSBwb3M7XG4gICAgfVxuICB9XG59XG5cbnZhciBoaWRkZW5QcmU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInByZVwiKTtcbnZhciBzcGFjZVJlID0gL14oXFxzKikoW1xcc1xcU10qPykoXFxzKikkLztcbi8qKlxuICogZGVjb2RlcyBhbGwgZW50aXRpZXMgaW50byByZWd1bGFyIHN0cmluZ1xuICogQHBhcmFtIHZhbHVlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBBIHN0cmluZyB3aXRoIGRlY29kZWQgZW50aXRpZXMuXG4gKi9cbmZ1bmN0aW9uIGRlY29kZUVudGl0aWVzKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHsgcmV0dXJuICcnOyB9XG5cbiAgLy8gTm90ZTogSUU4IGRvZXMgbm90IHByZXNlcnZlIHNwYWNlcyBhdCB0aGUgc3RhcnQvZW5kIG9mIGlubmVySFRNTFxuICAvLyBzbyB3ZSBtdXN0IGNhcHR1cmUgdGhlbSBhbmQgcmVhdHRhY2ggdGhlbSBhZnRlcndhcmRcbiAgdmFyIHBhcnRzID0gc3BhY2VSZS5leGVjKHZhbHVlKTtcbiAgdmFyIHNwYWNlQmVmb3JlID0gcGFydHNbMV07XG4gIHZhciBzcGFjZUFmdGVyID0gcGFydHNbM107XG4gIHZhciBjb250ZW50ID0gcGFydHNbMl07XG4gIGlmIChjb250ZW50KSB7XG4gICAgaGlkZGVuUHJlLmlubmVySFRNTD1jb250ZW50LnJlcGxhY2UoLzwvZyxcIiZsdDtcIik7XG4gICAgLy8gaW5uZXJUZXh0IGRlcGVuZHMgb24gc3R5bGluZyBhcyBpdCBkb2Vzbid0IGRpc3BsYXkgaGlkZGVuIGVsZW1lbnRzLlxuICAgIC8vIFRoZXJlZm9yZSwgaXQncyBiZXR0ZXIgdG8gdXNlIHRleHRDb250ZW50IG5vdCB0byBjYXVzZSB1bm5lY2Vzc2FyeVxuICAgIC8vIHJlZmxvd3MuIEhvd2V2ZXIsIElFPDkgZG9uJ3Qgc3VwcG9ydCB0ZXh0Q29udGVudCBzbyB0aGUgaW5uZXJUZXh0XG4gICAgLy8gZmFsbGJhY2sgaXMgbmVjZXNzYXJ5LlxuICAgIGNvbnRlbnQgPSAndGV4dENvbnRlbnQnIGluIGhpZGRlblByZSA/XG4gICAgICBoaWRkZW5QcmUudGV4dENvbnRlbnQgOiBoaWRkZW5QcmUuaW5uZXJUZXh0O1xuICB9XG4gIHJldHVybiBzcGFjZUJlZm9yZSArIGNvbnRlbnQgKyBzcGFjZUFmdGVyO1xufVxuXG4vKipcbiAqIEVzY2FwZXMgYWxsIHBvdGVudGlhbGx5IGRhbmdlcm91cyBjaGFyYWN0ZXJzLCBzbyB0aGF0IHRoZVxuICogcmVzdWx0aW5nIHN0cmluZyBjYW4gYmUgc2FmZWx5IGluc2VydGVkIGludG8gYXR0cmlidXRlIG9yXG4gKiBlbGVtZW50IHRleHQuXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IGVzY2FwZWQgdGV4dFxuICovXG5mdW5jdGlvbiBlbmNvZGVFbnRpdGllcyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUuXG4gICAgcmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5cbiAgICByZXBsYWNlKFNVUlJPR0FURV9QQUlSX1JFR0VYUCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhciBoaSA9IHZhbHVlLmNoYXJDb2RlQXQoMCk7XG4gICAgICB2YXIgbG93ID0gdmFsdWUuY2hhckNvZGVBdCgxKTtcbiAgICAgIHJldHVybiAnJiMnICsgKCgoaGkgLSAweEQ4MDApICogMHg0MDApICsgKGxvdyAtIDB4REMwMCkgKyAweDEwMDAwKSArICc7JztcbiAgICB9KS5cbiAgICByZXBsYWNlKE5PTl9BTFBIQU5VTUVSSUNfUkVHRVhQLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuICcmIycgKyB2YWx1ZS5jaGFyQ29kZUF0KDApICsgJzsnO1xuICAgIH0pLlxuICAgIHJlcGxhY2UoLzwvZywgJyZsdDsnKS5cbiAgICByZXBsYWNlKC8+L2csICcmZ3Q7Jyk7XG59XG5cbi8qKlxuICogY3JlYXRlIGFuIEhUTUwvWE1MIHdyaXRlciB3aGljaCB3cml0ZXMgdG8gYnVmZmVyXG4gKiBAcGFyYW0ge0FycmF5fSBidWYgdXNlIGJ1Zi5qYWluKCcnKSB0byBnZXQgb3V0IHNhbml0aXplZCBodG1sIHN0cmluZ1xuICogQHJldHVybnMge29iamVjdH0gaW4gdGhlIGZvcm0gb2Yge1xuICogICAgIHN0YXJ0OiBmdW5jdGlvbih0YWcsIGF0dHJzLCB1bmFyeSkge30sXG4gKiAgICAgZW5kOiBmdW5jdGlvbih0YWcpIHt9LFxuICogICAgIGNoYXJzOiBmdW5jdGlvbih0ZXh0KSB7fSxcbiAqICAgICBjb21tZW50OiBmdW5jdGlvbih0ZXh0KSB7fVxuICogfVxuICovXG5mdW5jdGlvbiBodG1sU2FuaXRpemVXcml0ZXIoYnVmLCB1cmlWYWxpZGF0b3IpIHtcbiAgdmFyIGlnbm9yZSA9IGZhbHNlO1xuICB2YXIgb3V0ID0gYW5ndWxhci5iaW5kKGJ1ZiwgYnVmLnB1c2gpO1xuICByZXR1cm4ge1xuICAgIHN0YXJ0OiBmdW5jdGlvbih0YWcsIGF0dHJzLCB1bmFyeSkge1xuICAgICAgdGFnID0gYW5ndWxhci5sb3dlcmNhc2UodGFnKTtcbiAgICAgIGlmICghaWdub3JlICYmIHNwZWNpYWxFbGVtZW50c1t0YWddKSB7XG4gICAgICAgIGlnbm9yZSA9IHRhZztcbiAgICAgIH1cbiAgICAgIGlmICghaWdub3JlICYmIHZhbGlkRWxlbWVudHNbdGFnXSA9PT0gdHJ1ZSkge1xuICAgICAgICBvdXQoJzwnKTtcbiAgICAgICAgb3V0KHRhZyk7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChhdHRycywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgIHZhciBsa2V5PWFuZ3VsYXIubG93ZXJjYXNlKGtleSk7XG4gICAgICAgICAgdmFyIGlzSW1hZ2UgPSAodGFnID09PSAnaW1nJyAmJiBsa2V5ID09PSAnc3JjJykgfHwgKGxrZXkgPT09ICdiYWNrZ3JvdW5kJyk7XG4gICAgICAgICAgaWYgKHZhbGlkQXR0cnNbbGtleV0gPT09IHRydWUgJiZcbiAgICAgICAgICAgICh1cmlBdHRyc1tsa2V5XSAhPT0gdHJ1ZSB8fCB1cmlWYWxpZGF0b3IodmFsdWUsIGlzSW1hZ2UpKSkge1xuICAgICAgICAgICAgb3V0KCcgJyk7XG4gICAgICAgICAgICBvdXQoa2V5KTtcbiAgICAgICAgICAgIG91dCgnPVwiJyk7XG4gICAgICAgICAgICBvdXQoZW5jb2RlRW50aXRpZXModmFsdWUpKTtcbiAgICAgICAgICAgIG91dCgnXCInKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvdXQodW5hcnkgPyAnLz4nIDogJz4nKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVuZDogZnVuY3Rpb24odGFnKSB7XG4gICAgICAgIHRhZyA9IGFuZ3VsYXIubG93ZXJjYXNlKHRhZyk7XG4gICAgICAgIGlmICghaWdub3JlICYmIHZhbGlkRWxlbWVudHNbdGFnXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIG91dCgnPC8nKTtcbiAgICAgICAgICBvdXQodGFnKTtcbiAgICAgICAgICBvdXQoJz4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnID09IGlnbm9yZSkge1xuICAgICAgICAgIGlnbm9yZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIGNoYXJzOiBmdW5jdGlvbihjaGFycykge1xuICAgICAgICBpZiAoIWlnbm9yZSkge1xuICAgICAgICAgIG91dChlbmNvZGVFbnRpdGllcyhjaGFycykpO1xuICAgICAgICB9XG4gICAgICB9XG4gIH07XG59XG5cblxuLy8gZGVmaW5lIG5nU2FuaXRpemUgbW9kdWxlIGFuZCByZWdpc3RlciAkc2FuaXRpemUgc2VydmljZVxuYW5ndWxhci5tb2R1bGUoJ25nU2FuaXRpemUnLCBbXSkucHJvdmlkZXIoJyRzYW5pdGl6ZScsICRTYW5pdGl6ZVByb3ZpZGVyKTtcblxuLyogZ2xvYmFsIHNhbml0aXplVGV4dDogZmFsc2UgKi9cblxuLyoqXG4gKiBAbmdkb2MgZmlsdGVyXG4gKiBAbmFtZSBsaW5reVxuICogQGtpbmQgZnVuY3Rpb25cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEZpbmRzIGxpbmtzIGluIHRleHQgaW5wdXQgYW5kIHR1cm5zIHRoZW0gaW50byBodG1sIGxpbmtzLiBTdXBwb3J0cyBodHRwL2h0dHBzL2Z0cC9tYWlsdG8gYW5kXG4gKiBwbGFpbiBlbWFpbCBhZGRyZXNzIGxpbmtzLlxuICpcbiAqIFJlcXVpcmVzIHRoZSB7QGxpbmsgbmdTYW5pdGl6ZSBgbmdTYW5pdGl6ZWB9IG1vZHVsZSB0byBiZSBpbnN0YWxsZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgSW5wdXQgdGV4dC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXQgV2luZG93IChfYmxhbmt8X3NlbGZ8X3BhcmVudHxfdG9wKSBvciBuYW1lZCBmcmFtZSB0byBvcGVuIGxpbmtzIGluLlxuICogQHJldHVybnMge3N0cmluZ30gSHRtbC1saW5raWZpZWQgdGV4dC5cbiAqXG4gKiBAdXNhZ2VcbiAgIDxzcGFuIG5nLWJpbmQtaHRtbD1cImxpbmt5X2V4cHJlc3Npb24gfCBsaW5reVwiPjwvc3Bhbj5cbiAqXG4gKiBAZXhhbXBsZVxuICAgPGV4YW1wbGUgbW9kdWxlPVwibGlua3lFeGFtcGxlXCIgZGVwcz1cImFuZ3VsYXItc2FuaXRpemUuanNcIj5cbiAgICAgPGZpbGUgbmFtZT1cImluZGV4Lmh0bWxcIj5cbiAgICAgICA8c2NyaXB0PlxuICAgICAgICAgYW5ndWxhci5tb2R1bGUoJ2xpbmt5RXhhbXBsZScsIFsnbmdTYW5pdGl6ZSddKVxuICAgICAgICAgICAuY29udHJvbGxlcignRXhhbXBsZUNvbnRyb2xsZXInLCBbJyRzY29wZScsIGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICAgICAgICRzY29wZS5zbmlwcGV0ID1cbiAgICAgICAgICAgICAgICdQcmV0dHkgdGV4dCB3aXRoIHNvbWUgbGlua3M6XFxuJytcbiAgICAgICAgICAgICAgICdodHRwOi8vYW5ndWxhcmpzLm9yZy8sXFxuJytcbiAgICAgICAgICAgICAgICdtYWlsdG86dXNAc29tZXdoZXJlLm9yZyxcXG4nK1xuICAgICAgICAgICAgICAgJ2Fub3RoZXJAc29tZXdoZXJlLm9yZyxcXG4nK1xuICAgICAgICAgICAgICAgJ2FuZCBvbmUgbW9yZTogZnRwOi8vMTI3LjAuMC4xLy4nO1xuICAgICAgICAgICAgICRzY29wZS5zbmlwcGV0V2l0aFRhcmdldCA9ICdodHRwOi8vYW5ndWxhcmpzLm9yZy8nO1xuICAgICAgICAgICB9XSk7XG4gICAgICAgPC9zY3JpcHQ+XG4gICAgICAgPGRpdiBuZy1jb250cm9sbGVyPVwiRXhhbXBsZUNvbnRyb2xsZXJcIj5cbiAgICAgICBTbmlwcGV0OiA8dGV4dGFyZWEgbmctbW9kZWw9XCJzbmlwcGV0XCIgY29scz1cIjYwXCIgcm93cz1cIjNcIj48L3RleHRhcmVhPlxuICAgICAgIDx0YWJsZT5cbiAgICAgICAgIDx0cj5cbiAgICAgICAgICAgPHRkPkZpbHRlcjwvdGQ+XG4gICAgICAgICAgIDx0ZD5Tb3VyY2U8L3RkPlxuICAgICAgICAgICA8dGQ+UmVuZGVyZWQ8L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICAgIDx0ciBpZD1cImxpbmt5LWZpbHRlclwiPlxuICAgICAgICAgICA8dGQ+bGlua3kgZmlsdGVyPC90ZD5cbiAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgIDxwcmU+Jmx0O2RpdiBuZy1iaW5kLWh0bWw9XCJzbmlwcGV0IHwgbGlua3lcIiZndDs8YnI+Jmx0Oy9kaXYmZ3Q7PC9wcmU+XG4gICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICA8ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXQgfCBsaW5reVwiPjwvZGl2PlxuICAgICAgICAgICA8L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICAgIDx0ciBpZD1cImxpbmt5LXRhcmdldFwiPlxuICAgICAgICAgIDx0ZD5saW5reSB0YXJnZXQ8L3RkPlxuICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgIDxwcmU+Jmx0O2RpdiBuZy1iaW5kLWh0bWw9XCJzbmlwcGV0V2l0aFRhcmdldCB8IGxpbmt5OidfYmxhbmsnXCImZ3Q7PGJyPiZsdDsvZGl2Jmd0OzwvcHJlPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGRpdiBuZy1iaW5kLWh0bWw9XCJzbmlwcGV0V2l0aFRhcmdldCB8IGxpbmt5OidfYmxhbmsnXCI+PC9kaXY+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgIDwvdHI+XG4gICAgICAgICA8dHIgaWQ9XCJlc2NhcGVkLWh0bWxcIj5cbiAgICAgICAgICAgPHRkPm5vIGZpbHRlcjwvdGQ+XG4gICAgICAgICAgIDx0ZD48cHJlPiZsdDtkaXYgbmctYmluZD1cInNuaXBwZXRcIiZndDs8YnI+Jmx0Oy9kaXYmZ3Q7PC9wcmU+PC90ZD5cbiAgICAgICAgICAgPHRkPjxkaXYgbmctYmluZD1cInNuaXBwZXRcIj48L2Rpdj48L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICA8L3RhYmxlPlxuICAgICA8L2ZpbGU+XG4gICAgIDxmaWxlIG5hbWU9XCJwcm90cmFjdG9yLmpzXCIgdHlwZT1cInByb3RyYWN0b3JcIj5cbiAgICAgICBpdCgnc2hvdWxkIGxpbmtpZnkgdGhlIHNuaXBwZXQgd2l0aCB1cmxzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICBleHBlY3QoZWxlbWVudChieS5pZCgnbGlua3ktZmlsdGVyJykpLmVsZW1lbnQoYnkuYmluZGluZygnc25pcHBldCB8IGxpbmt5JykpLmdldFRleHQoKSkuXG4gICAgICAgICAgICAgdG9CZSgnUHJldHR5IHRleHQgd2l0aCBzb21lIGxpbmtzOiBodHRwOi8vYW5ndWxhcmpzLm9yZy8sIHVzQHNvbWV3aGVyZS5vcmcsICcgK1xuICAgICAgICAgICAgICAgICAgJ2Fub3RoZXJAc29tZXdoZXJlLm9yZywgYW5kIG9uZSBtb3JlOiBmdHA6Ly8xMjcuMC4wLjEvLicpO1xuICAgICAgICAgZXhwZWN0KGVsZW1lbnQuYWxsKGJ5LmNzcygnI2xpbmt5LWZpbHRlciBhJykpLmNvdW50KCkpLnRvRXF1YWwoNCk7XG4gICAgICAgfSk7XG5cbiAgICAgICBpdCgnc2hvdWxkIG5vdCBsaW5raWZ5IHNuaXBwZXQgd2l0aG91dCB0aGUgbGlua3kgZmlsdGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICBleHBlY3QoZWxlbWVudChieS5pZCgnZXNjYXBlZC1odG1sJykpLmVsZW1lbnQoYnkuYmluZGluZygnc25pcHBldCcpKS5nZXRUZXh0KCkpLlxuICAgICAgICAgICAgIHRvQmUoJ1ByZXR0eSB0ZXh0IHdpdGggc29tZSBsaW5rczogaHR0cDovL2FuZ3VsYXJqcy5vcmcvLCBtYWlsdG86dXNAc29tZXdoZXJlLm9yZywgJyArXG4gICAgICAgICAgICAgICAgICAnYW5vdGhlckBzb21ld2hlcmUub3JnLCBhbmQgb25lIG1vcmU6IGZ0cDovLzEyNy4wLjAuMS8uJyk7XG4gICAgICAgICBleHBlY3QoZWxlbWVudC5hbGwoYnkuY3NzKCcjZXNjYXBlZC1odG1sIGEnKSkuY291bnQoKSkudG9FcXVhbCgwKTtcbiAgICAgICB9KTtcblxuICAgICAgIGl0KCdzaG91bGQgdXBkYXRlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICBlbGVtZW50KGJ5Lm1vZGVsKCdzbmlwcGV0JykpLmNsZWFyKCk7XG4gICAgICAgICBlbGVtZW50KGJ5Lm1vZGVsKCdzbmlwcGV0JykpLnNlbmRLZXlzKCduZXcgaHR0cDovL2xpbmsuJyk7XG4gICAgICAgICBleHBlY3QoZWxlbWVudChieS5pZCgnbGlua3ktZmlsdGVyJykpLmVsZW1lbnQoYnkuYmluZGluZygnc25pcHBldCB8IGxpbmt5JykpLmdldFRleHQoKSkuXG4gICAgICAgICAgICAgdG9CZSgnbmV3IGh0dHA6Ly9saW5rLicpO1xuICAgICAgICAgZXhwZWN0KGVsZW1lbnQuYWxsKGJ5LmNzcygnI2xpbmt5LWZpbHRlciBhJykpLmNvdW50KCkpLnRvRXF1YWwoMSk7XG4gICAgICAgICBleHBlY3QoZWxlbWVudChieS5pZCgnZXNjYXBlZC1odG1sJykpLmVsZW1lbnQoYnkuYmluZGluZygnc25pcHBldCcpKS5nZXRUZXh0KCkpXG4gICAgICAgICAgICAgLnRvQmUoJ25ldyBodHRwOi8vbGluay4nKTtcbiAgICAgICB9KTtcblxuICAgICAgIGl0KCdzaG91bGQgd29yayB3aXRoIHRoZSB0YXJnZXQgcHJvcGVydHknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuaWQoJ2xpbmt5LXRhcmdldCcpKS5cbiAgICAgICAgICAgIGVsZW1lbnQoYnkuYmluZGluZyhcInNuaXBwZXRXaXRoVGFyZ2V0IHwgbGlua3k6J19ibGFuaydcIikpLmdldFRleHQoKSkuXG4gICAgICAgICAgICB0b0JlKCdodHRwOi8vYW5ndWxhcmpzLm9yZy8nKTtcbiAgICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjbGlua3ktdGFyZ2V0IGEnKSkuZ2V0QXR0cmlidXRlKCd0YXJnZXQnKSkudG9FcXVhbCgnX2JsYW5rJyk7XG4gICAgICAgfSk7XG4gICAgIDwvZmlsZT5cbiAgIDwvZXhhbXBsZT5cbiAqL1xuYW5ndWxhci5tb2R1bGUoJ25nU2FuaXRpemUnKS5maWx0ZXIoJ2xpbmt5JywgWyckc2FuaXRpemUnLCBmdW5jdGlvbigkc2FuaXRpemUpIHtcbiAgdmFyIExJTktZX1VSTF9SRUdFWFAgPVxuICAgICAgICAvKChmdHB8aHR0cHM/KTpcXC9cXC98KG1haWx0bzopP1tBLVphLXowLTkuXyUrLV0rQClcXFMqW15cXHMuOywoKXt9PD5cIl0vLFxuICAgICAgTUFJTFRPX1JFR0VYUCA9IC9ebWFpbHRvOi87XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHRleHQsIHRhcmdldCkge1xuICAgIGlmICghdGV4dCkgcmV0dXJuIHRleHQ7XG4gICAgdmFyIG1hdGNoO1xuICAgIHZhciByYXcgPSB0ZXh0O1xuICAgIHZhciBodG1sID0gW107XG4gICAgdmFyIHVybDtcbiAgICB2YXIgaTtcbiAgICB3aGlsZSAoKG1hdGNoID0gcmF3Lm1hdGNoKExJTktZX1VSTF9SRUdFWFApKSkge1xuICAgICAgLy8gV2UgY2FuIG5vdCBlbmQgaW4gdGhlc2UgYXMgdGhleSBhcmUgc29tZXRpbWVzIGZvdW5kIGF0IHRoZSBlbmQgb2YgdGhlIHNlbnRlbmNlXG4gICAgICB1cmwgPSBtYXRjaFswXTtcbiAgICAgIC8vIGlmIHdlIGRpZCBub3QgbWF0Y2ggZnRwL2h0dHAvbWFpbHRvIHRoZW4gYXNzdW1lIG1haWx0b1xuICAgICAgaWYgKG1hdGNoWzJdID09IG1hdGNoWzNdKSB1cmwgPSAnbWFpbHRvOicgKyB1cmw7XG4gICAgICBpID0gbWF0Y2guaW5kZXg7XG4gICAgICBhZGRUZXh0KHJhdy5zdWJzdHIoMCwgaSkpO1xuICAgICAgYWRkTGluayh1cmwsIG1hdGNoWzBdLnJlcGxhY2UoTUFJTFRPX1JFR0VYUCwgJycpKTtcbiAgICAgIHJhdyA9IHJhdy5zdWJzdHJpbmcoaSArIG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgfVxuICAgIGFkZFRleHQocmF3KTtcbiAgICByZXR1cm4gJHNhbml0aXplKGh0bWwuam9pbignJykpO1xuXG4gICAgZnVuY3Rpb24gYWRkVGV4dCh0ZXh0KSB7XG4gICAgICBpZiAoIXRleHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaHRtbC5wdXNoKHNhbml0aXplVGV4dCh0ZXh0KSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkTGluayh1cmwsIHRleHQpIHtcbiAgICAgIGh0bWwucHVzaCgnPGEgJyk7XG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQodGFyZ2V0KSkge1xuICAgICAgICBodG1sLnB1c2goJ3RhcmdldD1cIicpO1xuICAgICAgICBodG1sLnB1c2godGFyZ2V0KTtcbiAgICAgICAgaHRtbC5wdXNoKCdcIiAnKTtcbiAgICAgIH1cbiAgICAgIGh0bWwucHVzaCgnaHJlZj1cIicpO1xuICAgICAgaHRtbC5wdXNoKHVybCk7XG4gICAgICBodG1sLnB1c2goJ1wiPicpO1xuICAgICAgYWRkVGV4dCh0ZXh0KTtcbiAgICAgIGh0bWwucHVzaCgnPC9hPicpO1xuICAgIH1cbiAgfTtcbn1dKTtcblxuXG59KSh3aW5kb3csIHdpbmRvdy5hbmd1bGFyKTtcbiIsIi8qKiFcbiAqIEFuZ3VsYXJKUyBmaWxlIHVwbG9hZCBzaGltIGZvciBIVE1MNSBGb3JtRGF0YVxuICogQGF1dGhvciAgRGFuaWFsICA8ZGFuaWFsLmZhcmlkQGdtYWlsLmNvbT5cbiAqIEB2ZXJzaW9uIDEuNi4xMlxuICovXG4oZnVuY3Rpb24oKSB7XG5cbnZhciBoYXNGbGFzaCA9IGZ1bmN0aW9uKCkge1xuXHR0cnkge1xuXHQgIHZhciBmbyA9IG5ldyBBY3RpdmVYT2JqZWN0KCdTaG9ja3dhdmVGbGFzaC5TaG9ja3dhdmVGbGFzaCcpO1xuXHQgIGlmIChmbykgcmV0dXJuIHRydWU7XG5cdH0gY2F0Y2goZSkge1xuXHQgIGlmIChuYXZpZ2F0b3IubWltZVR5cGVzWydhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCddICE9IHVuZGVmaW5lZCkgcmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG52YXIgcGF0Y2hYSFIgPSBmdW5jdGlvbihmbk5hbWUsIG5ld0ZuKSB7XG5cdHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5wcm90b3R5cGVbZm5OYW1lXSA9IG5ld0ZuKHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5wcm90b3R5cGVbZm5OYW1lXSk7XG59O1xuXG5pZiAod2luZG93LlhNTEh0dHBSZXF1ZXN0KSB7XG5cdGlmICh3aW5kb3cuRm9ybURhdGEgJiYgKCF3aW5kb3cuRmlsZUFQSSB8fCAhRmlsZUFQSS5mb3JjZUxvYWQpKSB7XG5cdFx0Ly8gYWxsb3cgYWNjZXNzIHRvIEFuZ3VsYXIgWEhSIHByaXZhdGUgZmllbGQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvaXNzdWVzLzE5MzRcblx0XHRwYXRjaFhIUignc2V0UmVxdWVzdEhlYWRlcicsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihoZWFkZXIsIHZhbHVlKSB7XG5cdFx0XHRcdGlmIChoZWFkZXIgPT09ICdfX3NldFhIUl8nKSB7XG5cdFx0XHRcdFx0dmFyIHZhbCA9IHZhbHVlKHRoaXMpO1xuXHRcdFx0XHRcdC8vIGZpeCBmb3IgYW5ndWxhciA8IDEuMi4wXG5cdFx0XHRcdFx0aWYgKHZhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0XHR2YWwodGhpcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9yaWcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBpbml0aWFsaXplVXBsb2FkTGlzdGVuZXIgPSBmdW5jdGlvbih4aHIpIHtcblx0XHRcdGlmICgheGhyLl9fbGlzdGVuZXJzKSB7XG5cdFx0XHRcdGlmICgheGhyLnVwbG9hZCkgeGhyLnVwbG9hZCA9IHt9O1xuXHRcdFx0XHR4aHIuX19saXN0ZW5lcnMgPSBbXTtcblx0XHRcdFx0dmFyIG9yaWdBZGRFdmVudExpc3RlbmVyID0geGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyO1xuXHRcdFx0XHR4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0LCBmbiwgYikge1xuXHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1t0XSA9IGZuO1xuXHRcdFx0XHRcdG9yaWdBZGRFdmVudExpc3RlbmVyICYmIG9yaWdBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHBhdGNoWEhSKCdvcGVuJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKG0sIHVybCwgYikge1xuXHRcdFx0XHRpbml0aWFsaXplVXBsb2FkTGlzdGVuZXIodGhpcyk7XG5cdFx0XHRcdHRoaXMuX191cmwgPSB1cmw7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0b3JpZy5hcHBseSh0aGlzLCBbbSwgdXJsLCBiXSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRpZiAoZS5tZXNzYWdlLmluZGV4T2YoJ0FjY2VzcyBpcyBkZW5pZWQnKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRvcmlnLmFwcGx5KHRoaXMsIFttLCAnX2ZpeF9mb3JfaWVfY3Jvc3Nkb21haW5fXycsIGJdKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdnZXRSZXNwb25zZUhlYWRlcicsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihoKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9fZmlsZUFwaVhIUiAmJiB0aGlzLl9fZmlsZUFwaVhIUi5nZXRSZXNwb25zZUhlYWRlciA/IHRoaXMuX19maWxlQXBpWEhSLmdldFJlc3BvbnNlSGVhZGVyKGgpIDogKG9yaWcgPT0gbnVsbCA/IG51bGwgOiBvcmlnLmFwcGx5KHRoaXMsIFtoXSkpO1xuXHRcdFx0fTtcblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdnZXRBbGxSZXNwb25zZUhlYWRlcnMnLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9fZmlsZUFwaVhIUiAmJiB0aGlzLl9fZmlsZUFwaVhIUi5nZXRBbGxSZXNwb25zZUhlYWRlcnMgPyB0aGlzLl9fZmlsZUFwaVhIUi5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSA6IChvcmlnID09IG51bGwgPyBudWxsIDogb3JpZy5hcHBseSh0aGlzKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignYWJvcnQnLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9fZmlsZUFwaVhIUiAmJiB0aGlzLl9fZmlsZUFwaVhIUi5hYm9ydCA/IHRoaXMuX19maWxlQXBpWEhSLmFib3J0KCkgOiAob3JpZyA9PSBudWxsID8gbnVsbCA6IG9yaWcuYXBwbHkodGhpcykpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ3NldFJlcXVlc3RIZWFkZXInLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oaGVhZGVyLCB2YWx1ZSkge1xuXHRcdFx0XHRpZiAoaGVhZGVyID09PSAnX19zZXRYSFJfJykge1xuXHRcdFx0XHRcdGluaXRpYWxpemVVcGxvYWRMaXN0ZW5lcih0aGlzKTtcblx0XHRcdFx0XHR2YXIgdmFsID0gdmFsdWUodGhpcyk7XG5cdFx0XHRcdFx0Ly8gZml4IGZvciBhbmd1bGFyIDwgMS4yLjBcblx0XHRcdFx0XHRpZiAodmFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRcdHZhbCh0aGlzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5fX3JlcXVlc3RIZWFkZXJzID0gdGhpcy5fX3JlcXVlc3RIZWFkZXJzIHx8IHt9O1xuXHRcdFx0XHRcdHRoaXMuX19yZXF1ZXN0SGVhZGVyc1toZWFkZXJdID0gdmFsdWU7XG5cdFx0XHRcdFx0b3JpZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignc2VuZCcsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHhociA9IHRoaXM7XG5cdFx0XHRcdGlmIChhcmd1bWVudHNbMF0gJiYgYXJndW1lbnRzWzBdLl9faXNTaGltKSB7XG5cdFx0XHRcdFx0dmFyIGZvcm1EYXRhID0gYXJndW1lbnRzWzBdO1xuXHRcdFx0XHRcdHZhciBjb25maWcgPSB7XG5cdFx0XHRcdFx0XHR1cmw6IHhoci5fX3VybCxcblx0XHRcdFx0XHRcdGpzb25wOiBmYWxzZSwgLy9yZW1vdmVzIHRoZSBjYWxsYmFjayBmb3JtIHBhcmFtXG5cdFx0XHRcdFx0XHRjYWNoZTogdHJ1ZSwgLy9yZW1vdmVzIHRoZSA/ZmlsZWFwaVhYWCBpbiB0aGUgdXJsXG5cdFx0XHRcdFx0XHRjb21wbGV0ZTogZnVuY3Rpb24oZXJyLCBmaWxlQXBpWEhSKSB7XG5cdFx0XHRcdFx0XHRcdHhoci5fX2NvbXBsZXRlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdGlmICghZXJyICYmIHhoci5fX2xpc3RlbmVyc1snbG9hZCddKSBcblx0XHRcdFx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbJ2xvYWQnXSh7dHlwZTogJ2xvYWQnLCBsb2FkZWQ6IHhoci5fX2xvYWRlZCwgdG90YWw6IHhoci5fX3RvdGFsLCB0YXJnZXQ6IHhociwgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoIWVyciAmJiB4aHIuX19saXN0ZW5lcnNbJ2xvYWRlbmQnXSkgXG5cdFx0XHRcdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzWydsb2FkZW5kJ10oe3R5cGU6ICdsb2FkZW5kJywgbG9hZGVkOiB4aHIuX19sb2FkZWQsIHRvdGFsOiB4aHIuX190b3RhbCwgdGFyZ2V0OiB4aHIsIGxlbmd0aENvbXB1dGFibGU6IHRydWV9KTtcblx0XHRcdFx0XHRcdFx0aWYgKGVyciA9PT0gJ2Fib3J0JyAmJiB4aHIuX19saXN0ZW5lcnNbJ2Fib3J0J10pIFxuXHRcdFx0XHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1snYWJvcnQnXSh7dHlwZTogJ2Fib3J0JywgbG9hZGVkOiB4aHIuX19sb2FkZWQsIHRvdGFsOiB4aHIuX190b3RhbCwgdGFyZ2V0OiB4aHIsIGxlbmd0aENvbXB1dGFibGU6IHRydWV9KTtcblx0XHRcdFx0XHRcdFx0aWYgKGZpbGVBcGlYSFIuc3RhdHVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdzdGF0dXMnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gKGZpbGVBcGlYSFIuc3RhdHVzID09IDAgJiYgZXJyICYmIGVyciAhPT0gJ2Fib3J0JykgPyA1MDAgOiBmaWxlQXBpWEhSLnN0YXR1c319KTtcblx0XHRcdFx0XHRcdFx0aWYgKGZpbGVBcGlYSFIuc3RhdHVzVGV4dCAhPT0gdW5kZWZpbmVkKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAnc3RhdHVzVGV4dCcsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiBmaWxlQXBpWEhSLnN0YXR1c1RleHR9fSk7XG5cdFx0XHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdyZWFkeVN0YXRlJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIDR9fSk7XG5cdFx0XHRcdFx0XHRcdGlmIChmaWxlQXBpWEhSLnJlc3BvbnNlICE9PSB1bmRlZmluZWQpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdyZXNwb25zZScsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiBmaWxlQXBpWEhSLnJlc3BvbnNlfX0pO1xuXHRcdFx0XHRcdFx0XHR2YXIgcmVzcCA9IGZpbGVBcGlYSFIucmVzcG9uc2VUZXh0IHx8IChlcnIgJiYgZmlsZUFwaVhIUi5zdGF0dXMgPT0gMCAmJiBlcnIgIT09ICdhYm9ydCcgPyBlcnIgOiB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAncmVzcG9uc2VUZXh0Jywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIHJlc3B9fSk7XG5cdFx0XHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdyZXNwb25zZScsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiByZXNwfX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZXJyKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAnZXJyJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIGVycn19KTtcblx0XHRcdFx0XHRcdFx0eGhyLl9fZmlsZUFwaVhIUiA9IGZpbGVBcGlYSFI7XG5cdFx0XHRcdFx0XHRcdGlmICh4aHIub25yZWFkeXN0YXRlY2hhbmdlKSB4aHIub25yZWFkeXN0YXRlY2hhbmdlKCk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0ZmlsZXByb2dyZXNzOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XHRcdGUudGFyZ2V0ID0geGhyO1xuXHRcdFx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbJ3Byb2dyZXNzJ10gJiYgeGhyLl9fbGlzdGVuZXJzWydwcm9ncmVzcyddKGUpO1xuXHRcdFx0XHRcdFx0XHR4aHIuX190b3RhbCA9IGUudG90YWw7XG5cdFx0XHRcdFx0XHRcdHhoci5fX2xvYWRlZCA9IGUubG9hZGVkO1xuXHRcdFx0XHRcdFx0XHRpZiAoZS50b3RhbCA9PT0gZS5sb2FkZWQpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBmaXggZmxhc2ggaXNzdWUgdGhhdCBkb2Vzbid0IGNhbGwgY29tcGxldGUgaWYgdGhlcmUgaXMgbm8gcmVzcG9uc2UgdGV4dCBmcm9tIHRoZSBzZXJ2ZXIgIFxuXHRcdFx0XHRcdFx0XHRcdHZhciBfdGhpcyA9IHRoaXNcblx0XHRcdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCF4aHIuX19jb21wbGV0ZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0eGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycyA9IGZ1bmN0aW9uKCl7fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0X3RoaXMuY29tcGxldGUobnVsbCwge3N0YXR1czogMjA0LCBzdGF0dXNUZXh0OiAnTm8gQ29udGVudCd9KTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9LCAxMDAwMCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRoZWFkZXJzOiB4aHIuX19yZXF1ZXN0SGVhZGVyc1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25maWcuZGF0YSA9IHt9O1xuXHRcdFx0XHRcdGNvbmZpZy5maWxlcyA9IHt9XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBmb3JtRGF0YS5kYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgaXRlbSA9IGZvcm1EYXRhLmRhdGFbaV07XG5cdFx0XHRcdFx0XHRpZiAoaXRlbS52YWwgIT0gbnVsbCAmJiBpdGVtLnZhbC5uYW1lICE9IG51bGwgJiYgaXRlbS52YWwuc2l6ZSAhPSBudWxsICYmIGl0ZW0udmFsLnR5cGUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRjb25maWcuZmlsZXNbaXRlbS5rZXldID0gaXRlbS52YWw7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjb25maWcuZGF0YVtpdGVtLmtleV0gPSBpdGVtLnZhbDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKCFoYXNGbGFzaCgpKSB7XG5cdFx0XHRcdFx0XHRcdHRocm93ICdBZG9kZSBGbGFzaCBQbGF5ZXIgbmVlZCB0byBiZSBpbnN0YWxsZWQuIFRvIGNoZWNrIGFoZWFkIHVzZSBcIkZpbGVBUEkuaGFzRmxhc2hcIic7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR4aHIuX19maWxlQXBpWEhSID0gRmlsZUFQSS51cGxvYWQoY29uZmlnKTtcblx0XHRcdFx0XHR9LCAxKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvcmlnLmFwcGx5KHhociwgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5fX2lzU2hpbSA9IHRydWU7XG59XG5cbmlmICghd2luZG93LkZvcm1EYXRhIHx8ICh3aW5kb3cuRmlsZUFQSSAmJiBGaWxlQVBJLmZvcmNlTG9hZCkpIHtcblx0dmFyIGFkZEZsYXNoID0gZnVuY3Rpb24oZWxlbSkge1xuXHRcdGlmICghaGFzRmxhc2goKSkge1xuXHRcdFx0dGhyb3cgJ0Fkb2RlIEZsYXNoIFBsYXllciBuZWVkIHRvIGJlIGluc3RhbGxlZC4gVG8gY2hlY2sgYWhlYWQgdXNlIFwiRmlsZUFQSS5oYXNGbGFzaFwiJztcblx0XHR9XG5cdFx0dmFyIGVsID0gYW5ndWxhci5lbGVtZW50KGVsZW0pO1xuXHRcdGlmICghZWwuYXR0cignZGlzYWJsZWQnKSkge1xuXHRcdFx0aWYgKCFlbC5oYXNDbGFzcygnanMtZmlsZWFwaS13cmFwcGVyJykgJiYgKGVsZW0uZ2V0QXR0cmlidXRlKCduZy1maWxlLXNlbGVjdCcpICE9IG51bGwgfHwgZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmctZmlsZS1zZWxlY3QnKSAhPSBudWxsKSkge1xuXHRcdFx0XHRpZiAoRmlsZUFQSS53cmFwSW5zaWRlRGl2KSB7XG5cdFx0XHRcdFx0dmFyIHdyYXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdFx0XHR3cmFwLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwianMtZmlsZWFwaS13cmFwcGVyXCIgc3R5bGU9XCJwb3NpdGlvbjpyZWxhdGl2ZTsgb3ZlcmZsb3c6aGlkZGVuXCI+PC9kaXY+Jztcblx0XHRcdFx0XHR3cmFwID0gd3JhcC5maXJzdENoaWxkO1xuXHRcdFx0XHRcdHZhciBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG5cdFx0XHRcdFx0cGFyZW50Lmluc2VydEJlZm9yZSh3cmFwLCBlbGVtKTtcblx0XHRcdFx0XHRwYXJlbnQucmVtb3ZlQ2hpbGQoZWxlbSk7XG5cdFx0XHRcdFx0d3JhcC5hcHBlbmRDaGlsZChlbGVtKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRlbC5hZGRDbGFzcygnanMtZmlsZWFwaS13cmFwcGVyJyk7XG5cdFx0XHRcdFx0aWYgKGVsLnBhcmVudCgpWzBdLl9fZmlsZV9jbGlja19mbl9kZWxlZ2F0ZV8pIHtcblx0XHRcdFx0XHRcdGlmIChlbC5wYXJlbnQoKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICcnIHx8IGVsLnBhcmVudCgpLmNzcygncG9zaXRpb24nKSA9PT0gJ3N0YXRpYycpIHtcblx0XHRcdFx0XHRcdFx0ZWwucGFyZW50KCkuY3NzKCdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWwuY3NzKCd0b3AnLCAwKS5jc3MoJ2JvdHRvbScsIDApLmNzcygnbGVmdCcsIDApLmNzcygncmlnaHQnLCAwKS5jc3MoJ3dpZHRoJywgJzEwMCUnKS5jc3MoJ2hlaWdodCcsICcxMDAlJykuXG5cdFx0XHRcdFx0XHRcdGNzcygncGFkZGluZycsIDApLmNzcygnbWFyZ2luJywgMCk7XG5cdFx0XHRcdFx0XHRlbC5wYXJlbnQoKS51bmJpbmQoJ2NsaWNrJywgZWwucGFyZW50KClbMF0uX19maWxlX2NsaWNrX2ZuX2RlbGVnYXRlXyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHR2YXIgY2hhbmdlRm5XcmFwcGVyID0gZnVuY3Rpb24oZm4pIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgZmlsZXMgPSBGaWxlQVBJLmdldEZpbGVzKGV2dCk7XG5cdFx0XHQvL2p1c3QgYSBkb3VibGUgY2hlY2sgZm9yICMyMzNcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGZpbGVzW2ldLnNpemUgPT09IHVuZGVmaW5lZCkgZmlsZXNbaV0uc2l6ZSA9IDA7XG5cdFx0XHRcdGlmIChmaWxlc1tpXS5uYW1lID09PSB1bmRlZmluZWQpIGZpbGVzW2ldLm5hbWUgPSAnZmlsZSc7XG5cdFx0XHRcdGlmIChmaWxlc1tpXS50eXBlID09PSB1bmRlZmluZWQpIGZpbGVzW2ldLnR5cGUgPSAndW5kZWZpbmVkJztcblx0XHRcdH1cblx0XHRcdGlmICghZXZ0LnRhcmdldCkge1xuXHRcdFx0XHRldnQudGFyZ2V0ID0ge307XG5cdFx0XHR9XG5cdFx0XHRldnQudGFyZ2V0LmZpbGVzID0gZmlsZXM7XG5cdFx0XHQvLyBpZiBldnQudGFyZ2V0LmZpbGVzIGlzIG5vdCB3cml0YWJsZSB1c2UgaGVscGVyIGZpZWxkXG5cdFx0XHRpZiAoZXZ0LnRhcmdldC5maWxlcyAhPSBmaWxlcykge1xuXHRcdFx0XHRldnQuX19maWxlc18gPSBmaWxlcztcblx0XHRcdH1cblx0XHRcdChldnQuX19maWxlc18gfHwgZXZ0LnRhcmdldC5maWxlcykuaXRlbSA9IGZ1bmN0aW9uKGkpIHtcblx0XHRcdFx0cmV0dXJuIChldnQuX19maWxlc18gfHwgZXZ0LnRhcmdldC5maWxlcylbaV0gfHwgbnVsbDtcblx0XHRcdH1cblx0XHRcdGlmIChmbikgZm4uYXBwbHkodGhpcywgW2V2dF0pO1xuXHRcdH07XG5cdH07XG5cdHZhciBpc0ZpbGVDaGFuZ2UgPSBmdW5jdGlvbihlbGVtLCBlKSB7XG5cdFx0cmV0dXJuIChlLnRvTG93ZXJDYXNlKCkgPT09ICdjaGFuZ2UnIHx8IGUudG9Mb3dlckNhc2UoKSA9PT0gJ29uY2hhbmdlJykgJiYgZWxlbS5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSA9PSAnZmlsZSc7XG5cdH1cblx0aWYgKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIpIHtcblx0XHRIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gKGZ1bmN0aW9uKG9yaWdBZGRFdmVudExpc3RlbmVyKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oZSwgZm4sIGIsIGQpIHtcblx0XHRcdFx0aWYgKGlzRmlsZUNoYW5nZSh0aGlzLCBlKSkge1xuXHRcdFx0XHRcdGFkZEZsYXNoKHRoaXMpO1xuXHRcdFx0XHRcdG9yaWdBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIFtlLCBjaGFuZ2VGbldyYXBwZXIoZm4pLCBiLCBkXSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3JpZ0FkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgW2UsIGZuLCBiLCBkXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KShIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyKTtcblx0fVxuXHRpZiAoSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYXR0YWNoRXZlbnQpIHtcblx0XHRIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hdHRhY2hFdmVudCA9IChmdW5jdGlvbihvcmlnQXR0YWNoRXZlbnQpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihlLCBmbikge1xuXHRcdFx0XHRpZiAoaXNGaWxlQ2hhbmdlKHRoaXMsIGUpKSB7XG5cdFx0XHRcdFx0YWRkRmxhc2godGhpcyk7XG5cdFx0XHRcdFx0aWYgKHdpbmRvdy5qUXVlcnkpIHtcblx0XHRcdFx0XHRcdC8vIGZpeCBmb3IgIzI4MSBqUXVlcnkgb24gSUU4XG5cdFx0XHRcdFx0XHRhbmd1bGFyLmVsZW1lbnQodGhpcykuYmluZCgnY2hhbmdlJywgY2hhbmdlRm5XcmFwcGVyKG51bGwpKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b3JpZ0F0dGFjaEV2ZW50LmFwcGx5KHRoaXMsIFtlLCBjaGFuZ2VGbldyYXBwZXIoZm4pXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9yaWdBdHRhY2hFdmVudC5hcHBseSh0aGlzLCBbZSwgZm5dKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmF0dGFjaEV2ZW50KTtcblx0fVxuXG5cdHdpbmRvdy5Gb3JtRGF0YSA9IEZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGFwcGVuZDogZnVuY3Rpb24oa2V5LCB2YWwsIG5hbWUpIHtcblx0XHRcdFx0dGhpcy5kYXRhLnB1c2goe1xuXHRcdFx0XHRcdGtleToga2V5LFxuXHRcdFx0XHRcdHZhbDogdmFsLFxuXHRcdFx0XHRcdG5hbWU6IG5hbWVcblx0XHRcdFx0fSk7XG5cdFx0XHR9LFxuXHRcdFx0ZGF0YTogW10sXG5cdFx0XHRfX2lzU2hpbTogdHJ1ZVxuXHRcdH07XG5cdH07XG5cblx0KGZ1bmN0aW9uICgpIHtcblx0XHQvL2xvYWQgRmlsZUFQSVxuXHRcdGlmICghd2luZG93LkZpbGVBUEkpIHtcblx0XHRcdHdpbmRvdy5GaWxlQVBJID0ge307XG5cdFx0fVxuXHRcdGlmIChGaWxlQVBJLmZvcmNlTG9hZCkge1xuXHRcdFx0RmlsZUFQSS5odG1sNSA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoIUZpbGVBUEkudXBsb2FkKSB7XG5cdFx0XHR2YXIganNVcmwsIGJhc2VQYXRoLCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKSwgYWxsU2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKSwgaSwgaW5kZXgsIHNyYztcblx0XHRcdGlmICh3aW5kb3cuRmlsZUFQSS5qc1VybCkge1xuXHRcdFx0XHRqc1VybCA9IHdpbmRvdy5GaWxlQVBJLmpzVXJsO1xuXHRcdFx0fSBlbHNlIGlmICh3aW5kb3cuRmlsZUFQSS5qc1BhdGgpIHtcblx0XHRcdFx0YmFzZVBhdGggPSB3aW5kb3cuRmlsZUFQSS5qc1BhdGg7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgYWxsU2NyaXB0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHNyYyA9IGFsbFNjcmlwdHNbaV0uc3JjO1xuXHRcdFx0XHRcdGluZGV4ID0gc3JjLmluZGV4T2YoJ2FuZ3VsYXItZmlsZS11cGxvYWQtc2hpbS5qcycpXG5cdFx0XHRcdFx0aWYgKGluZGV4ID09IC0xKSB7XG5cdFx0XHRcdFx0XHRpbmRleCA9IHNyYy5pbmRleE9mKCdhbmd1bGFyLWZpbGUtdXBsb2FkLXNoaW0ubWluLmpzJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRcdFx0XHRiYXNlUGF0aCA9IHNyYy5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChGaWxlQVBJLnN0YXRpY1BhdGggPT0gbnVsbCkgRmlsZUFQSS5zdGF0aWNQYXRoID0gYmFzZVBhdGg7XG5cdFx0XHRzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCBqc1VybCB8fCBiYXNlUGF0aCArICdGaWxlQVBJLm1pbi5qcycpO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuXHRcdFx0RmlsZUFQSS5oYXNGbGFzaCA9IGhhc0ZsYXNoKCk7XG5cdFx0fVxuXHR9KSgpO1xuXHRGaWxlQVBJLmRpc2FibGVGaWxlSW5wdXQgPSBmdW5jdGlvbihlbGVtLCBkaXNhYmxlKSB7XG5cdFx0aWYgKGRpc2FibGUpIHtcblx0XHRcdGVsZW0ucmVtb3ZlQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGVsZW0uYWRkQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpO1xuXHRcdH1cblx0fVxufVxuXG5cbmlmICghd2luZG93LkZpbGVSZWFkZXIpIHtcblx0d2luZG93LkZpbGVSZWFkZXIgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzLCBsb2FkU3RhcnRlZCA9IGZhbHNlO1xuXHRcdHRoaXMubGlzdGVuZXJzID0ge307XG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgZm4pIHtcblx0XHRcdF90aGlzLmxpc3RlbmVyc1t0eXBlXSA9IF90aGlzLmxpc3RlbmVyc1t0eXBlXSB8fCBbXTtcblx0XHRcdF90aGlzLmxpc3RlbmVyc1t0eXBlXS5wdXNoKGZuKTtcblx0XHR9O1xuXHRcdHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGZuKSB7XG5cdFx0XHRfdGhpcy5saXN0ZW5lcnNbdHlwZV0gJiYgX3RoaXMubGlzdGVuZXJzW3R5cGVdLnNwbGljZShfdGhpcy5saXN0ZW5lcnNbdHlwZV0uaW5kZXhPZihmbiksIDEpO1xuXHRcdH07XG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgbGlzdCA9IF90aGlzLmxpc3RlbmVyc1tldnQudHlwZV07XG5cdFx0XHRpZiAobGlzdCkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRsaXN0W2ldLmNhbGwoX3RoaXMsIGV2dCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMub25hYm9ydCA9IHRoaXMub25lcnJvciA9IHRoaXMub25sb2FkID0gdGhpcy5vbmxvYWRzdGFydCA9IHRoaXMub25sb2FkZW5kID0gdGhpcy5vbnByb2dyZXNzID0gbnVsbDtcblxuXHRcdHZhciBjb25zdHJ1Y3RFdmVudCA9IGZ1bmN0aW9uKHR5cGUsIGV2dCkge1xuXHRcdFx0dmFyIGUgPSB7dHlwZTogdHlwZSwgdGFyZ2V0OiBfdGhpcywgbG9hZGVkOiBldnQubG9hZGVkLCB0b3RhbDogZXZ0LnRvdGFsLCBlcnJvcjogZXZ0LmVycm9yfTtcblx0XHRcdGlmIChldnQucmVzdWx0ICE9IG51bGwpIGUudGFyZ2V0LnJlc3VsdCA9IGV2dC5yZXN1bHQ7XG5cdFx0XHRyZXR1cm4gZTtcblx0XHR9O1xuXHRcdHZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0aWYgKCFsb2FkU3RhcnRlZCkge1xuXHRcdFx0XHRsb2FkU3RhcnRlZCA9IHRydWU7XG5cdFx0XHRcdF90aGlzLm9ubG9hZHN0YXJ0ICYmIHRoaXMub25sb2Fkc3RhcnQoY29uc3RydWN0RXZlbnQoJ2xvYWRzdGFydCcsIGV2dCkpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGV2dC50eXBlID09PSAnbG9hZCcpIHtcblx0XHRcdFx0X3RoaXMub25sb2FkZW5kICYmIF90aGlzLm9ubG9hZGVuZChjb25zdHJ1Y3RFdmVudCgnbG9hZGVuZCcsIGV2dCkpO1xuXHRcdFx0XHR2YXIgZSA9IGNvbnN0cnVjdEV2ZW50KCdsb2FkJywgZXZ0KTtcblx0XHRcdFx0X3RoaXMub25sb2FkICYmIF90aGlzLm9ubG9hZChlKTtcblx0XHRcdFx0X3RoaXMuZGlzcGF0Y2hFdmVudChlKTtcblx0XHRcdH0gZWxzZSBpZiAoZXZ0LnR5cGUgPT09ICdwcm9ncmVzcycpIHtcblx0XHRcdFx0dmFyIGUgPSBjb25zdHJ1Y3RFdmVudCgncHJvZ3Jlc3MnLCBldnQpO1xuXHRcdFx0XHRfdGhpcy5vbnByb2dyZXNzICYmIF90aGlzLm9ucHJvZ3Jlc3MoZSk7XG5cdFx0XHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgZSA9IGNvbnN0cnVjdEV2ZW50KCdlcnJvcicsIGV2dCk7XG5cdFx0XHRcdF90aGlzLm9uZXJyb3IgJiYgX3RoaXMub25lcnJvcihlKTtcblx0XHRcdFx0X3RoaXMuZGlzcGF0Y2hFdmVudChlKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMucmVhZEFzQXJyYXlCdWZmZXIgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRGaWxlQVBJLnJlYWRBc0JpbmFyeVN0cmluZyhmaWxlLCBsaXN0ZW5lcik7XG5cdFx0fVxuXHRcdHRoaXMucmVhZEFzQmluYXJ5U3RyaW5nID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0RmlsZUFQSS5yZWFkQXNCaW5hcnlTdHJpbmcoZmlsZSwgbGlzdGVuZXIpO1xuXHRcdH1cblx0XHR0aGlzLnJlYWRBc0RhdGFVUkwgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRGaWxlQVBJLnJlYWRBc0RhdGFVUkwoZmlsZSwgbGlzdGVuZXIpO1xuXHRcdH1cblx0XHR0aGlzLnJlYWRBc1RleHQgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRGaWxlQVBJLnJlYWRBc1RleHQoZmlsZSwgbGlzdGVuZXIpO1xuXHRcdH1cblx0fVxufVxuXG59KSgpO1xuIiwiLyoqIVxuICogQW5ndWxhckpTIGZpbGUgdXBsb2FkL2Ryb3AgZGlyZWN0aXZlIHdpdGggaHR0cCBwb3N0IGFuZCBwcm9ncmVzc1xuICogQGF1dGhvciAgRGFuaWFsICA8ZGFuaWFsLmZhcmlkQGdtYWlsLmNvbT5cbiAqIEB2ZXJzaW9uIDEuNi4xMlxuICovXG4oZnVuY3Rpb24oKSB7XG5cbnZhciBhbmd1bGFyRmlsZVVwbG9hZCA9IGFuZ3VsYXIubW9kdWxlKCdhbmd1bGFyRmlsZVVwbG9hZCcsIFtdKTtcblxuYW5ndWxhckZpbGVVcGxvYWQuc2VydmljZSgnJHVwbG9hZCcsIFsnJGh0dHAnLCAnJHEnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbigkaHR0cCwgJHEsICR0aW1lb3V0KSB7XG5cdGZ1bmN0aW9uIHNlbmRIdHRwKGNvbmZpZykge1xuXHRcdGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kIHx8ICdQT1NUJztcblx0XHRjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXHRcdGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0ID0gY29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgfHwgZnVuY3Rpb24oZGF0YSwgaGVhZGVyc0dldHRlcikge1xuXHRcdFx0aWYgKHdpbmRvdy5BcnJheUJ1ZmZlciAmJiBkYXRhIGluc3RhbmNlb2Ygd2luZG93LkFycmF5QnVmZmVyKSB7XG5cdFx0XHRcdHJldHVybiBkYXRhO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuICRodHRwLmRlZmF1bHRzLnRyYW5zZm9ybVJlcXVlc3RbMF0oZGF0YSwgaGVhZGVyc0dldHRlcik7XG5cdFx0fTtcblx0XHR2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG5cdFx0aWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5fX2lzU2hpbSkge1xuXHRcdFx0Y29uZmlnLmhlYWRlcnNbJ19fc2V0WEhSXyddID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbih4aHIpIHtcblx0XHRcdFx0XHRpZiAoIXhocikgcmV0dXJuO1xuXHRcdFx0XHRcdGNvbmZpZy5fX1hIUiA9IHhocjtcblx0XHRcdFx0XHRjb25maWcueGhyRm4gJiYgY29uZmlnLnhockZuKHhocik7XG5cdFx0XHRcdFx0eGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdGRlZmVycmVkLm5vdGlmeShlKTtcblx0XHRcdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRcdFx0Ly9maXggZm9yIGZpcmVmb3ggbm90IGZpcmluZyB1cGxvYWQgcHJvZ3Jlc3MgZW5kLCBhbHNvIElFOC05XG5cdFx0XHRcdFx0eGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdFx0aWYgKGUubGVuZ3RoQ29tcHV0YWJsZSkge1xuXHRcdFx0XHRcdFx0XHRkZWZlcnJlZC5ub3RpZnkoZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQkaHR0cChjb25maWcpLnRoZW4oZnVuY3Rpb24ocil7ZGVmZXJyZWQucmVzb2x2ZShyKX0sIGZ1bmN0aW9uKGUpe2RlZmVycmVkLnJlamVjdChlKX0sIGZ1bmN0aW9uKG4pe2RlZmVycmVkLm5vdGlmeShuKX0pO1xuXHRcdFxuXHRcdHZhciBwcm9taXNlID0gZGVmZXJyZWQucHJvbWlzZTtcblx0XHRwcm9taXNlLnN1Y2Nlc3MgPSBmdW5jdGlvbihmbikge1xuXHRcdFx0cHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGZuKHJlc3BvbnNlLmRhdGEsIHJlc3BvbnNlLnN0YXR1cywgcmVzcG9uc2UuaGVhZGVycywgY29uZmlnKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblxuXHRcdHByb21pc2UuZXJyb3IgPSBmdW5jdGlvbihmbikge1xuXHRcdFx0cHJvbWlzZS50aGVuKG51bGwsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGZuKHJlc3BvbnNlLmRhdGEsIHJlc3BvbnNlLnN0YXR1cywgcmVzcG9uc2UuaGVhZGVycywgY29uZmlnKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblxuXHRcdHByb21pc2UucHJvZ3Jlc3MgPSBmdW5jdGlvbihmbikge1xuXHRcdFx0cHJvbWlzZS50aGVuKG51bGwsIG51bGwsIGZ1bmN0aW9uKHVwZGF0ZSkge1xuXHRcdFx0XHRmbih1cGRhdGUpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXHRcdHByb21pc2UuYWJvcnQgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmIChjb25maWcuX19YSFIpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Y29uZmlnLl9fWEhSLmFib3J0KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblx0XHRwcm9taXNlLnhociA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0XHRjb25maWcueGhyRm4gPSAoZnVuY3Rpb24ob3JpZ1hockZuKSB7XG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRvcmlnWGhyRm4gJiYgb3JpZ1hockZuLmFwcGx5KHByb21pc2UsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdFx0Zm4uYXBwbHkocHJvbWlzZSwgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fSkoY29uZmlnLnhockZuKTtcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cdFx0XG5cdFx0cmV0dXJuIHByb21pc2U7XG5cdH1cblxuXHR0aGlzLnVwbG9hZCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuXHRcdGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cdFx0Y29uZmlnLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdW5kZWZpbmVkO1xuXHRcdGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0ID0gY29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgfHwgJGh0dHAuZGVmYXVsdHMudHJhbnNmb3JtUmVxdWVzdDtcblx0XHR2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHR2YXIgb3JpZ1RyYW5zZm9ybVJlcXVlc3QgPSBjb25maWcudHJhbnNmb3JtUmVxdWVzdDtcblx0XHR2YXIgb3JpZ0RhdGEgPSBjb25maWcuZGF0YTtcblx0XHRjb25maWcudHJhbnNmb3JtUmVxdWVzdCA9IGZ1bmN0aW9uKGZvcm1EYXRhLCBoZWFkZXJHZXR0ZXIpIHtcblx0XHRcdGlmIChvcmlnRGF0YSkge1xuXHRcdFx0XHRpZiAoY29uZmlnLmZvcm1EYXRhQXBwZW5kZXIpIHtcblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gb3JpZ0RhdGEpIHtcblx0XHRcdFx0XHRcdHZhciB2YWwgPSBvcmlnRGF0YVtrZXldO1xuXHRcdFx0XHRcdFx0Y29uZmlnLmZvcm1EYXRhQXBwZW5kZXIoZm9ybURhdGEsIGtleSwgdmFsKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIga2V5IGluIG9yaWdEYXRhKSB7XG5cdFx0XHRcdFx0XHR2YXIgdmFsID0gb3JpZ0RhdGFba2V5XTtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3JpZ1RyYW5zZm9ybVJlcXVlc3QgPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHR2YWwgPSBvcmlnVHJhbnNmb3JtUmVxdWVzdCh2YWwsIGhlYWRlckdldHRlcik7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9yaWdUcmFuc2Zvcm1SZXF1ZXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIHRyYW5zZm9ybUZuID0gb3JpZ1RyYW5zZm9ybVJlcXVlc3RbaV07XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiB0cmFuc2Zvcm1GbiA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YWwgPSB0cmFuc2Zvcm1Gbih2YWwsIGhlYWRlckdldHRlcik7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRmb3JtRGF0YS5hcHBlbmQoa2V5LCB2YWwpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29uZmlnLmZpbGUgIT0gbnVsbCkge1xuXHRcdFx0XHR2YXIgZmlsZUZvcm1OYW1lID0gY29uZmlnLmZpbGVGb3JtRGF0YU5hbWUgfHwgJ2ZpbGUnO1xuXG5cdFx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoY29uZmlnLmZpbGUpID09PSAnW29iamVjdCBBcnJheV0nKSB7XG5cdFx0XHRcdFx0dmFyIGlzRmlsZUZvcm1OYW1lU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGZpbGVGb3JtTmFtZSkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY29uZmlnLmZpbGUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGZvcm1EYXRhLmFwcGVuZChpc0ZpbGVGb3JtTmFtZVN0cmluZyA/IGZpbGVGb3JtTmFtZSA6IGZpbGVGb3JtTmFtZVtpXSwgY29uZmlnLmZpbGVbaV0sIFxuXHRcdFx0XHRcdFx0XHRcdChjb25maWcuZmlsZU5hbWUgJiYgY29uZmlnLmZpbGVOYW1lW2ldKSB8fCBjb25maWcuZmlsZVtpXS5uYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Zm9ybURhdGEuYXBwZW5kKGZpbGVGb3JtTmFtZSwgY29uZmlnLmZpbGUsIGNvbmZpZy5maWxlTmFtZSB8fCBjb25maWcuZmlsZS5uYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZvcm1EYXRhO1xuXHRcdH07XG5cblx0XHRjb25maWcuZGF0YSA9IGZvcm1EYXRhO1xuXG5cdFx0cmV0dXJuIHNlbmRIdHRwKGNvbmZpZyk7XG5cdH07XG5cblx0dGhpcy5odHRwID0gZnVuY3Rpb24oY29uZmlnKSB7XG5cdFx0cmV0dXJuIHNlbmRIdHRwKGNvbmZpZyk7XG5cdH1cbn1dKTtcblxuYW5ndWxhckZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ0ZpbGVTZWxlY3QnLCBbICckcGFyc2UnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbigkcGFyc2UsICR0aW1lb3V0KSB7XG5cdHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cikge1xuXHRcdHZhciBmbiA9ICRwYXJzZShhdHRyWyduZ0ZpbGVTZWxlY3QnXSk7XG5cdFx0aWYgKGVsZW1bMF0udGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnaW5wdXQnIHx8IChlbGVtLmF0dHIoJ3R5cGUnKSAmJiBlbGVtLmF0dHIoJ3R5cGUnKS50b0xvd2VyQ2FzZSgpKSAhPT0gJ2ZpbGUnKSB7XG5cdFx0XHR2YXIgZmlsZUVsZW0gPSBhbmd1bGFyLmVsZW1lbnQoJzxpbnB1dCB0eXBlPVwiZmlsZVwiPicpXG5cdFx0XHR2YXIgYXR0cnMgPSBlbGVtWzBdLmF0dHJpYnV0ZXM7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChhdHRyc1tpXS5uYW1lLnRvTG93ZXJDYXNlKCkgIT09ICd0eXBlJykge1xuXHRcdFx0XHRcdGZpbGVFbGVtLmF0dHIoYXR0cnNbaV0ubmFtZSwgYXR0cnNbaV0udmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoYXR0cltcIm11bHRpcGxlXCJdKSBmaWxlRWxlbS5hdHRyKFwibXVsdGlwbGVcIiwgXCJ0cnVlXCIpO1xuXHRcdFx0ZmlsZUVsZW0uY3NzKFwid2lkdGhcIiwgXCIxcHhcIikuY3NzKFwiaGVpZ2h0XCIsIFwiMXB4XCIpLmNzcyhcIm9wYWNpdHlcIiwgMCkuY3NzKFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiKS5jc3MoJ2ZpbHRlcicsICdhbHBoYShvcGFjaXR5PTApJylcblx0XHRcdFx0XHQuY3NzKFwicGFkZGluZ1wiLCAwKS5jc3MoXCJtYXJnaW5cIiwgMCkuY3NzKFwib3ZlcmZsb3dcIiwgXCJoaWRkZW5cIik7XG5cdFx0XHRmaWxlRWxlbS5hdHRyKCdfX3dyYXBwZXJfZm9yX3BhcmVudF8nLCB0cnVlKTtcblxuLy9cdFx0XHRmaWxlRWxlbS5jc3MoXCJ0b3BcIiwgMCkuY3NzKFwiYm90dG9tXCIsIDApLmNzcyhcImxlZnRcIiwgMCkuY3NzKFwicmlnaHRcIiwgMCkuY3NzKFwid2lkdGhcIiwgXCIxMDAlXCIpLlxuLy9cdFx0XHRcdFx0Y3NzKFwib3BhY2l0eVwiLCAwKS5jc3MoXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCIpLmNzcygnZmlsdGVyJywgJ2FscGhhKG9wYWNpdHk9MCknKS5jc3MoXCJwYWRkaW5nXCIsIDApLmNzcyhcIm1hcmdpblwiLCAwKTtcblx0XHRcdGVsZW0uYXBwZW5kKGZpbGVFbGVtKTtcblx0XHRcdGVsZW1bMF0uX19maWxlX2NsaWNrX2ZuX2RlbGVnYXRlXyAgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0ZmlsZUVsZW1bMF0uY2xpY2soKTtcblx0XHRcdH07IFxuXHRcdFx0ZWxlbS5iaW5kKCdjbGljaycsIGVsZW1bMF0uX19maWxlX2NsaWNrX2ZuX2RlbGVnYXRlXyk7XG5cdFx0XHRlbGVtLmNzcyhcIm92ZXJmbG93XCIsIFwiaGlkZGVuXCIpO1xuLy9cdFx0XHRpZiAoZmlsZUVsZW0ucGFyZW50KClbMF0gIT0gZWxlbVswXSkge1xuLy9cdFx0XHRcdC8vZml4ICMyOTggYnV0dG9uIGVsZW1lbnRcbi8vXHRcdFx0XHRlbGVtLndyYXAoJzxzcGFuPicpO1xuLy9cdFx0XHRcdGVsZW0uY3NzKFwiei1pbmRleFwiLCBcIi0xMDAwXCIpXG4vL1x0XHRcdFx0ZWxlbS5wYXJlbnQoKS5hcHBlbmQoZmlsZUVsZW0pO1xuLy9cdFx0XHRcdGVsZW0gPSBlbGVtLnBhcmVudCgpO1xuLy9cdFx0XHR9XG4vL1x0XHRcdGlmIChlbGVtLmNzcyhcInBvc2l0aW9uXCIpID09PSAnJyB8fCBlbGVtLmNzcyhcInBvc2l0aW9uXCIpID09PSAnc3RhdGljJykge1xuLy9cdFx0XHRcdGVsZW0uY3NzKFwicG9zaXRpb25cIiwgXCJyZWxhdGl2ZVwiKTtcbi8vXHRcdFx0fVxuXHRcdFx0ZWxlbSA9IGZpbGVFbGVtO1xuXHRcdH1cblx0XHRlbGVtLmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0dmFyIGZpbGVzID0gW10sIGZpbGVMaXN0LCBpO1xuXHRcdFx0ZmlsZUxpc3QgPSBldnQuX19maWxlc18gfHwgZXZ0LnRhcmdldC5maWxlcztcblx0XHRcdGlmIChmaWxlTGlzdCAhPSBudWxsKSB7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBmaWxlTGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGZpbGVzLnB1c2goZmlsZUxpc3QuaXRlbShpKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRmbihzY29wZSwge1xuXHRcdFx0XHRcdCRmaWxlcyA6IGZpbGVzLFxuXHRcdFx0XHRcdCRldmVudCA6IGV2dFxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdC8vIHJlbW92ZWQgdGhpcyBzaW5jZSBpdCB3YXMgY29uZnVzaW5nIGlmIHRoZSB1c2VyIGNsaWNrIG9uIGJyb3dzZSBhbmQgdGhlbiBjYW5jZWwgIzE4MVxuLy9cdFx0ZWxlbS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4vL1x0XHRcdHRoaXMudmFsdWUgPSBudWxsO1xuLy9cdFx0fSk7XG5cblx0XHQvLyByZW1vdmVkIGJlY2F1c2Ugb2YgIzI1MyBidWdcblx0XHQvLyB0b3VjaCBzY3JlZW5zXG4vL1x0XHRpZiAoKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykgfHxcbi8vXHRcdFx0XHQobmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzID4gMCkgfHwgKG5hdmlnYXRvci5tc01heFRvdWNoUG9pbnRzID4gMCkpIHtcbi8vXHRcdFx0ZWxlbS5iaW5kKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKGUpIHtcbi8vXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG4vL1x0XHRcdFx0ZS50YXJnZXQuY2xpY2soKTtcbi8vXHRcdFx0fSk7XG4vL1x0XHR9XG5cdH07XG59IF0pO1xuXG5hbmd1bGFyRmlsZVVwbG9hZC5kaXJlY3RpdmUoJ25nRmlsZURyb3BBdmFpbGFibGUnLCBbICckcGFyc2UnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbigkcGFyc2UsICR0aW1lb3V0KSB7XG5cdHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cikge1xuXHRcdGlmICgnZHJhZ2dhYmxlJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJykpIHtcblx0XHRcdHZhciBmbiA9ICRwYXJzZShhdHRyWyduZ0ZpbGVEcm9wQXZhaWxhYmxlJ10pO1xuXHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGZuKHNjb3BlKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn0gXSk7XG5cbmFuZ3VsYXJGaWxlVXBsb2FkLmRpcmVjdGl2ZSgnbmdGaWxlRHJvcCcsIFsgJyRwYXJzZScsICckdGltZW91dCcsICckbG9jYXRpb24nLCBmdW5jdGlvbigkcGFyc2UsICR0aW1lb3V0LCAkbG9jYXRpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRyKSB7XG5cdFx0aWYgKCdkcmFnZ2FibGUnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSkge1xuXHRcdFx0dmFyIGxlYXZlVGltZW91dCA9IG51bGw7XG5cdFx0XHRlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdCR0aW1lb3V0LmNhbmNlbChsZWF2ZVRpbWVvdXQpO1xuXHRcdFx0XHRpZiAoIWVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfKSB7XG5cdFx0XHRcdFx0aWYgKGF0dHJbJ25nRmlsZURyYWdPdmVyQ2xhc3MnXSAmJiBhdHRyWyduZ0ZpbGVEcmFnT3ZlckNsYXNzJ10uc2VhcmNoKC9cXCkgKiQvKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHR2YXIgZHJhZ092ZXJDbGFzcyA9ICRwYXJzZShhdHRyWyduZ0ZpbGVEcmFnT3ZlckNsYXNzJ10pKHNjb3BlLCB7XG5cdFx0XHRcdFx0XHRcdCRldmVudCA6IGV2dFxuXHRcdFx0XHRcdFx0fSk7XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0ZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18gPSBkcmFnT3ZlckNsYXNzOyBcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18gPSBhdHRyWyduZ0ZpbGVEcmFnT3ZlckNsYXNzJ10gfHwgXCJkcmFnb3ZlclwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbGVtLmFkZENsYXNzKGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfKTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbnRlclwiLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiwgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGxlYXZlVGltZW91dCA9ICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGVsZW0ucmVtb3ZlQ2xhc3MoZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18pO1xuXHRcdFx0XHRcdGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfID0gbnVsbDtcblx0XHRcdFx0fSwgYXR0clsnbmdGaWxlRHJhZ092ZXJEZWxheSddIHx8IDEpO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0dmFyIGZuID0gJHBhcnNlKGF0dHJbJ25nRmlsZURyb3AnXSk7XG5cdFx0XHRlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0ZWxlbS5yZW1vdmVDbGFzcyhlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyk7XG5cdFx0XHRcdGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfID0gbnVsbDtcblx0XHRcdFx0ZXh0cmFjdEZpbGVzKGV2dCwgZnVuY3Rpb24oZmlsZXMpIHtcblx0XHRcdFx0XHRmbihzY29wZSwge1xuXHRcdFx0XHRcdFx0JGZpbGVzIDogZmlsZXMsXG5cdFx0XHRcdFx0XHQkZXZlbnQgOiBldnRcblx0XHRcdFx0XHR9KTtcdFx0XHRcdFx0XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRmdW5jdGlvbiBpc0FTQ0lJKHN0cikge1xuXHRcdFx0XHRyZXR1cm4gL15bXFwwMDAtXFwxNzddKiQvLnRlc3Qoc3RyKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gZXh0cmFjdEZpbGVzKGV2dCwgY2FsbGJhY2spIHtcblx0XHRcdFx0dmFyIGZpbGVzID0gW10sIGl0ZW1zID0gZXZ0LmRhdGFUcmFuc2Zlci5pdGVtcztcblx0XHRcdFx0aWYgKGl0ZW1zICYmIGl0ZW1zLmxlbmd0aCA+IDAgJiYgaXRlbXNbMF0ud2Via2l0R2V0QXNFbnRyeSAmJiAkbG9jYXRpb24ucHJvdG9jb2woKSAhPSAnZmlsZScgJiYgXG5cdFx0XHRcdFx0XHRpdGVtc1swXS53ZWJraXRHZXRBc0VudHJ5KCkuaXNEaXJlY3RvcnkpIHtcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgZW50cnkgPSBpdGVtc1tpXS53ZWJraXRHZXRBc0VudHJ5KCk7XG5cdFx0XHRcdFx0XHRpZiAoZW50cnkgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHQvL2ZpeCBmb3IgY2hyb21lIGJ1ZyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MTQ5NzM1XG5cdFx0XHRcdFx0XHRcdGlmIChpc0FTQ0lJKGVudHJ5Lm5hbWUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0dHJhdmVyc2VGaWxlVHJlZShmaWxlcywgZW50cnkpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCFpdGVtc1tpXS53ZWJraXRHZXRBc0VudHJ5KCkuaXNEaXJlY3RvcnkpIHtcblx0XHRcdFx0XHRcdFx0XHRmaWxlcy5wdXNoKGl0ZW1zW2ldLmdldEFzRmlsZSgpKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YXIgZmlsZUxpc3QgPSBldnQuZGF0YVRyYW5zZmVyLmZpbGVzO1xuXHRcdFx0XHRcdGlmIChmaWxlTGlzdCAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdGZpbGVzLnB1c2goZmlsZUxpc3QuaXRlbShpKSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdChmdW5jdGlvbiB3YWl0Rm9yUHJvY2VzcyhkZWxheSkge1xuXHRcdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKCFwcm9jZXNzaW5nKSB7XG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrKGZpbGVzKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHdhaXRGb3JQcm9jZXNzKDEwKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LCBkZWxheSB8fCAwKVxuXHRcdFx0XHR9KSgpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR2YXIgcHJvY2Vzc2luZyA9IDA7XG5cdFx0XHRmdW5jdGlvbiB0cmF2ZXJzZUZpbGVUcmVlKGZpbGVzLCBlbnRyeSwgcGF0aCkge1xuXHRcdFx0XHRpZiAoZW50cnkgIT0gbnVsbCkge1xuXHRcdFx0XHRcdGlmIChlbnRyeS5pc0RpcmVjdG9yeSkge1xuXHRcdFx0XHRcdFx0dmFyIGRpclJlYWRlciA9IGVudHJ5LmNyZWF0ZVJlYWRlcigpO1xuXHRcdFx0XHRcdFx0cHJvY2Vzc2luZysrO1xuXHRcdFx0XHRcdFx0ZGlyUmVhZGVyLnJlYWRFbnRyaWVzKGZ1bmN0aW9uKGVudHJpZXMpIHtcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0dHJhdmVyc2VGaWxlVHJlZShmaWxlcywgZW50cmllc1tpXSwgKHBhdGggPyBwYXRoIDogXCJcIikgKyBlbnRyeS5uYW1lICsgXCIvXCIpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHByb2Nlc3NpbmctLTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwcm9jZXNzaW5nKys7XG5cdFx0XHRcdFx0XHRlbnRyeS5maWxlKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRcdFx0cHJvY2Vzc2luZy0tO1xuXHRcdFx0XHRcdFx0XHRmaWxlLl9yZWxhdGl2ZVBhdGggPSAocGF0aCA/IHBhdGggOiBcIlwiKSArIGZpbGUubmFtZTtcblx0XHRcdFx0XHRcdFx0ZmlsZXMucHVzaChmaWxlKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn0gXSk7XG5cbn0pKCk7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignQ29tcG9uZW50RGV0YWlsc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBjb21wb25lbnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0ge30sXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fSxcclxuICAgICAgICAgICAgY29ubmVjdG9ycyA9IHt9LFxyXG4gICAgICAgICAgICBwb3J0cyA9IHt9O1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnQ29tcG9uZW50RGV0YWlsc0NvbnRyb2xsZXInKTtcclxuICAgICAgICAkc2NvcGUuaW5pdCA9IGZ1bmN0aW9uIChjb25uZWN0aW9uSWQpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogJ0NvbXBvbmVudERldGFpbHNfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Rlc3Ryb3lpbmcgOicsIGNvbnRleHQucmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICRzY29wZS5kZXRhaWxzID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogcHJvcGVydGllcyxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IGNvbm5lY3RvcnMsXHJcbiAgICAgICAgICAgICAgICBwb3J0czogcG9ydHNcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95KSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICBwb3J0czoge31cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVzdHJveSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vVE9ETzogbm90aWZ5IHVzZXJcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ0NvbXBvbmVudERldGFpbHNDb250cm9sbGVyIC0gaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLndhdGNoSW50ZXJmYWNlcyhjb250ZXh0LCAkc2NvcGUuY29tcG9uZW50SWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSB3YXRjaEludGVyZmFjZXMga2VlcHMgdGhlIGRhdGEgdXAtdG8tZGF0ZSB0aGVyZSBzaG91bGRuJ3QgYmUgYSBuZWVkIHRvIGRvIGFueVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZXMgaGVyZS4uXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoSW50ZXJmYWNlcycsIHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjb21wb25lbnRJbnRlcmZhY2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLnByb3BlcnRpZXMgPSBjb21wb25lbnRJbnRlcmZhY2VzLnByb3BlcnRpZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLmNvbm5lY3RvcnMgPSBjb21wb25lbnRJbnRlcmZhY2VzLmNvbm5lY3RvcnM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLnBvcnRzID0gY29tcG9uZW50SW50ZXJmYWNlcy5wb3J0cztcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCdjb21wb25lbnREZXRhaWxzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50SWQ6ICc9Y29tcG9uZW50SWQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcXVpcmU6ICdeY29tcG9uZW50TGlzdCcsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0ciwgY29tcG9uZXRMaXN0Q29udHJvbGxlcikge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbm5lY3Rpb25JZCA9IGNvbXBvbmV0TGlzdENvbnRyb2xsZXIuZ2V0Q29ubmVjdGlvbklkKCk7XHJcbiAgICAgICAgICAgICAgICBzY29wZS5pbml0KGNvbm5lY3Rpb25JZCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0ludGVyZmFjZURldGFpbHMuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb21wb25lbnREZXRhaWxzQ29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0NvbXBvbmVudExpc3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHdpbmRvdywgJG1vZGFsLCBncm93bCwgY29tcG9uZW50U2VydmljZSwgZmlsZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBpdGVtcyA9IFtdLCAgICAgICAgICAgICAvLyBJdGVtcyB0aGF0IGFyZSBwYXNzZWQgdG8gdGhlIGl0ZW0tbGlzdCB1aS1jb21wb25lbnQuXHJcbiAgICAgICAgICAgIGNvbXBvbmVudEl0ZW1zID0ge30sICAgIC8vIFNhbWUgaXRlbXMgYXJlIHN0b3JlZCBpbiBhIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtLFxyXG4gICAgICAgICAgICBhZGREb21haW5XYXRjaGVyLFxyXG4gICAgICAgICAgICBjb25maWcsXHJcbiAgICAgICAgICAgIGNvbnRleHQ7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdDb21wb25lbnRMaXN0Q29udHJvbGxlcicsICRzY29wZS5hdm1JZHMpO1xyXG4gICAgICAgIHRoaXMuZ2V0Q29ubmVjdGlvbklkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLmNvbm5lY3Rpb25JZDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0NvbXBvbmVudExpc3RDb250cm9sbGVyXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29uZmlndXJhdGlvbiBmb3IgdGhlIGl0ZW0gbGlzdCB1aSBjb21wb25lbnQuXHJcbiAgICAgICAgY29uZmlnID0ge1xyXG5cclxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBzaG93RGV0YWlsc0xhYmVsOiAnU2hvdyBkZXRhaWxzJyxcclxuICAgICAgICAgICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXHJcblxyXG4gICAgICAgICAgICAvLyBFdmVudCBoYW5kbGVyc1xyXG5cclxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uIChqUUV2ZW50LCB1aSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NvcnQgaGFwcGVuZWQnLCBqUUV2ZW50LCB1aSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ2xpY2s6IGZ1bmN0aW9uIChldmVudCwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCdzZWxlY3RlZEluc3RhbmNlcycsIHtuYW1lOiBpdGVtLnRpdGxlLCBpZHM6IGl0ZW0uZGF0YS5pbnN0YW5jZUlkc30pO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ29wZW5JbkVkaXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tZWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbignLz9wcm9qZWN0PUFETUVkaXRvciZhY3RpdmVPYmplY3Q9JyArIGl0ZW0uaWQsICdfYmxhbmsnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZWRpdENvbXBvbmVudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtkZXNjcmlwdGlvbjogaXRlbS5kZXNjcmlwdGlvbiwgaWQ6IGl0ZW0uaWR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRDb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiOiBjb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbXBvbmVudHMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Db21wb25lbnRFZGl0Lmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb21wb25lbnRFZGl0Q29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9zaXplOiBzaXplLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHsgZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoZWRpdGVkRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGF0dHJzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJTkZPJzogZWRpdGVkRGF0YS5kZXNjcmlwdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uuc2V0Q29tcG9uZW50QXR0cmlidXRlcyhlZGl0Q29udGV4dCwgZGF0YS5pZCwgYXR0cnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXR0cmlidXRlIHVwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhwb3J0QXNBY20nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRXhwb3J0IEFDTScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2hhcmUtYWx0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7cmVzb3VyY2U6IGl0ZW0uZGF0YS5yZXNvdXJjZSwgbmFtZTogaXRlbS50aXRsZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGFzaCA9IGRhdGEucmVzb3VyY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBmaWxlU2VydmljZS5nZXREb3dubG9hZFVybChoYXNoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcygnQUNNIGZpbGUgZm9yIDxhIGhyZWY9XCInICsgdXJsICsgJ1wiPicgKyBkYXRhLm5hbWUgKyAnPC9hPiBleHBvcnRlZC4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoZGF0YS5uYW1lICsgJyBkb2VzIG5vdCBoYXZlIGEgcmVzb3VyY2UuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2RlbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCwgbmFtZTogaXRlbS50aXRsZSB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9TaW1wbGVNb2RhbC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTaW1wbGVNb2RhbENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRGVsZXRlIENvbXBvbmVudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiAnVGhpcyB3aWxsIGRlbGV0ZSAnICsgZGF0YS5uYW1lICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIGZyb20gdGhlIHdvcmtzcGFjZS4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS5kZWxldGVDb21wb25lbnQoY29udGV4dCwgZGF0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGRldGFpbHNSZW5kZXJlcjogZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGl0ZW0uZGV0YWlscyA9ICdNeSBkZXRhaWxzIGFyZSBoZXJlIG5vdyEnO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZmlsdGVyOiB7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIFRyYW5zZm9ybSB0aGUgcmF3IHNlcnZpY2Ugbm9kZSBkYXRhIHRvIGl0ZW1zIGZvciB0aGUgbGlzdC5cclxuICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBsaXN0SXRlbTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjb21wb25lbnRJdGVtcy5oYXNPd25Qcm9wZXJ0eShkYXRhLmlkKSkge1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSBjb21wb25lbnRJdGVtc1tkYXRhLmlkXTtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnRpdGxlID0gZGF0YS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGVzY3JpcHRpb24gPSBkYXRhLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGF0YS5yZXNvdXJjZSA9IGRhdGEucmVzb3VyY2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogZGF0YS5pZCxcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICRzY29wZS5hdm1JZHMgPyAnSGlnaGxpZ2h0IGluc3RhbmNlcycgOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiAnTi9BJywgICAvLyBUT0RPOiBnZXQgdGhpcyBpbiB0aGUgZnV0dXJlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiAnTi9BJyAgICAvLyBUT0RPOiBnZXQgdGhpcyBpbiB0aGUgZnV0dXJlLlxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHM6IFsgXSxcclxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiAnQ29udGVudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsc1RlbXBsYXRlVXJsOiAnY29tcG9uZW50RGV0YWlscy5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7IHJlc291cmNlOiBkYXRhLnJlc291cmNlIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmF2bUlkcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRhdGEuaW5zdGFuY2VJZHMgPSAkc2NvcGUuYXZtSWRzW2RhdGEuYXZtSWRdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBsaXN0LWl0ZW0gdG8gdGhlIGl0ZW1zIGxpc3QgYW5kIHRoZSBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChsaXN0SXRlbSk7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRJdGVtc1tsaXN0SXRlbS5pZF0gPSBsaXN0SXRlbTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGFkZERvbWFpbldhdGNoZXIgPSBmdW5jdGlvbiAoY29tcG9uZW50SWQpIHtcclxuICAgICAgICAgICAgdmFyIGRvbWFpbk1vZGVsc1RvU3RhdCA9IGZ1bmN0aW9uIChkb21haW5Nb2RlbHMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdGF0cyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsTWFwID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBDQUQ6IHsgdmFsdWU6IDAsIHRvb2xUaXA6ICdDQUQnLCBpY29uQ2xhc3M6ICdmYSBmYS1jb2RlcGVuJyB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBDeWJlcjogeyB2YWx1ZTogMCwgdG9vbFRpcDogJ0N5YmVyJywgaWNvbkNsYXNzOiAnZmEgZmEtbGFwdG9wJyB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBNYW51ZmFjdHVyaW5nOiB7IHZhbHVlOiAwLCB0b29sVGlwOiAnTWFudWZhY3R1cmluZycsIGljb25DbGFzczogJ2ZhIGZhLXdyZW5jaCcgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgTW9kZWxpY2E6IHsgdmFsdWU6IDAsIHRvb2xUaXA6ICdNb2RlbGljYScsIGljb25DbGFzczogJ2ZhIGZhLWdlYXJzJyB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBrZXk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBkb21haW5Nb2RlbHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZG9tYWluTW9kZWxzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhYmVsTWFwW2RvbWFpbk1vZGVsc1trZXldLnR5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbE1hcFtkb21haW5Nb2RlbHNba2V5XS50eXBlXS52YWx1ZSArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVW5leHBlY3RlZCBkb21haW4tbW9kZWwgdHlwZScsIGRvbWFpbk1vZGVsc1trZXldLnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gbGFiZWxNYXApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWxNYXAuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFiZWxNYXBba2V5XS52YWx1ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRzLnB1c2gobGFiZWxNYXBba2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHM7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLndhdGNoQ29tcG9uZW50RG9tYWlucyhjb250ZXh0LCBjb21wb25lbnRJZCwgZnVuY3Rpb24gKHVwZGF0ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsaXN0SXRlbSA9IGNvbXBvbmVudEl0ZW1zW2NvbXBvbmVudElkXTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEb21haW5Nb2RlbHMgdXBkYXRlZCwgZXZlbnQgdHlwZTonLCB1cGRhdGVEYXRhLnR5cGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxpc3RJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHMgPSBkb21haW5Nb2RlbHNUb1N0YXQodXBkYXRlRGF0YS5kb21haW5Nb2RlbHMpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0RvbWFpbk1vZGVsIGRhdGEgZGlkIG5vdCBoYXZlIG1hdGNoaW5nIGNvbXBvbmVudERhdGEnLCBjb21wb25lbnRJZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsaXN0SXRlbSA9IGNvbXBvbmVudEl0ZW1zW2NvbXBvbmVudElkXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGlzdEl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHMgPSBkb21haW5Nb2RlbHNUb1N0YXQoZGF0YS5kb21haW5Nb2RlbHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRG9tYWluTW9kZWwgZGF0YSBkaWQgbm90IGhhdmUgbWF0Y2hpbmcgY29tcG9uZW50RGF0YScsIGNvbXBvbmVudElkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb21wb25lbnRTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICRzY29wZS5saXN0RGF0YS5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgICAgICAgICBjb21wb25lbnRJdGVtcyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnRzKGNvbnRleHQsICRzY29wZS53b3Jrc3BhY2VJZCwgJHNjb3BlLmF2bUlkcywgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4O1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLndhcm4odXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZERvbWFpbldhdGNoZXIodXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50SXRlbXMuaGFzT3duUHJvcGVydHkodXBkYXRlT2JqZWN0LmlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9IGl0ZW1zLm1hcChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmluZGV4T2YodXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS5jbGVhblVwUmVnaW9uKGNvbnRleHQsIGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29tcG9uZW50RG9tYWluc18nICsgdXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNvbXBvbmVudEl0ZW1zW3VwZGF0ZU9iamVjdC5pZF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudElkO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29tcG9uZW50SWQgaW4gZGF0YS5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbXBvbmVudHMuaGFzT3duUHJvcGVydHkoY29tcG9uZW50SWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbShkYXRhLmNvbXBvbmVudHNbY29tcG9uZW50SWRdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZERvbWFpbldhdGNoZXIoY29tcG9uZW50SWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgLmNvbnRyb2xsZXIoJ0NvbXBvbmVudEVkaXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIGRhdGEpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLm9rID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgkc2NvcGUuZGF0YSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCdjb21wb25lbnRMaXN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSWQ6ICc9d29ya3NwYWNlSWQnLFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCcsXHJcbiAgICAgICAgICAgICAgICBhdm1JZHM6ICc9YXZtSWRzJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Db21wb25lbnRMaXN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ29tcG9uZW50TGlzdENvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0NvbmZpZ3VyYXRpb25TZXRTZWxlY3RvckNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBncm93bCwgZGVzaWduU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgY29udGV4dCxcclxuICAgICAgICAgICAgc3Bhd25lZENvbmZpZ3VyYXRpb25SZWdpb25zID0gW107XHJcbiAgICAgICAgJHNjb3BlLmRhdGFNb2RlbCA9IHtcclxuICAgICAgICAgICAgZGF0YUF2YWxpYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25TZXRzOiB7fVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdDb25maWd1cmF0aW9uU2V0U2VsZWN0b3JDb250cm9sbGVyXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCckZGVzdHJveWVkICcgKyBjb250ZXh0LnJlZ2lvbklkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWwuZGF0YUF2YWxpYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVsLmNvbmZpZ3VyYXRpb25TZXRzID0ge307XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hDb25maWd1cmF0aW9uU2V0cyhjb250ZXh0LCAkc2NvcGUuZGVzaWduSWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWwuZGF0YUF2YWxpYWJsZSA9IE9iamVjdC5rZXlzKHVwZGF0ZU9iamVjdC5kYXRhLmNvbmZpZ3VyYXRpb25TZXRzKS5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVsLmNvbmZpZ3VyYXRpb25TZXRzID0gZGF0YS5jb25maWd1cmF0aW9uU2V0cztcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVsLmRhdGFBdmFsaWFibGUgPSBPYmplY3Qua2V5cyhkYXRhLmNvbmZpZ3VyYXRpb25TZXRzKS5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS5sb2FkQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoc2V0SWQsIHNldE5hbWUpIHtcclxuICAgICAgICAgICAgdmFyIGk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3Bhd25lZENvbmZpZ3VyYXRpb25SZWdpb25zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgc3Bhd25lZENvbmZpZ3VyYXRpb25SZWdpb25zW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzcGF3bmVkQ29uZmlndXJhdGlvblJlZ2lvbnMgPSBbXTtcclxuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaENvbmZpZ3VyYXRpb25zKGNvbnRleHQsIHNldElkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4odXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIHNwYXduZWRDb25maWd1cmF0aW9uUmVnaW9ucy5wdXNoKGRhdGEucmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGRhdGEuY29uZmlndXJhdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuY29uZmlndXJhdGlvbnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnID0gZGF0YS5jb25maWd1cmF0aW9uc1trZXldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNvbmZpZy5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY29uZmlnLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlQXNzaWdubWVudHM6IEpTT04ucGFyc2UoY29uZmlnLmFsdGVybmF0aXZlQXNzaWdubWVudHMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdDb25maWd1cmF0aW9uICcgKyBjb25maWcubmFtZSArICcgaGFkIGludmFsaWQgYXR0cmlidXRlLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBwYXJzZScsIGNvbmZpZy5hbHRlcm5hdGl2ZUFzc2lnbm1lbnRzLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCdjb25maWd1cmF0aW9uc0xvYWRlZCcsIHtjb25maWd1cmF0aW9uczogY29uZmlndXJhdGlvbnMsIHNldE5hbWU6IHNldE5hbWV9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgnY29uZmlndXJhdGlvblNldFNlbGVjdG9yJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduSWQ6ICc9ZGVzaWduSWQnLFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvQ29uZmlndXJhdGlvblNldFNlbGVjdG9yLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ29uZmlndXJhdGlvblNldFNlbGVjdG9yQ29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignQ29uZmlndXJhdGlvblRhYmxlQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIGdyb3dsKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgICRzY29wZS5kYXRhTW9kZWwgPSB7XHJcbiAgICAgICAgICAgIGNoYW5nZUluZm86IFtdLFxyXG4gICAgICAgICAgICBzZWxlY3RlZDogW10sXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zOiAkc2NvcGUuY29uZmlndXJhdGlvbnMsXHJcbiAgICAgICAgICAgIHNldE5hbWU6ICRzY29wZS5zZXROYW1lXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnRhYmxlQ29sdW1uRGVmaW5pdGlvbiA9IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29sdW1uSGVhZGVyRGlzcGxheU5hbWU6ICdOYW1lJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGFibGVDZWxsLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgc29ydEtleTogJ25hbWUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCdleHBvc2VTZWxlY3Rpb24nLCBmdW5jdGlvbiAoZXZlbnQsIHR5cGUpIHtcclxuICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCdzZWxlY3Rpb25FeHBvc2VkJywgJHNjb3BlLmRhdGFNb2RlbC5zZWxlY3RlZCwgdHlwZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS5jZmdDbGlja2VkID0gZnVuY3Rpb24gKGNmZykge1xyXG4gICAgICAgICAgICAkc2NvcGUuJGVtaXQoJ2NvbmZpZ3VyYXRpb25DbGlja2VkJywgY2ZnKTtcclxuICAgICAgICB9O1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2NvbmZpZ3VyYXRpb25UYWJsZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zOiAnPWNvbmZpZ3VyYXRpb25zJyxcclxuICAgICAgICAgICAgICAgIHNldE5hbWU6ICc9c2V0TmFtZSdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvQ29uZmlndXJhdGlvblRhYmxlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ29uZmlndXJhdGlvblRhYmxlQ29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdEZXNpZ25EZXRhaWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIGRlc2lnblNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIGNvbnRleHQgPSB7fSxcclxuICAgICAgICAgICAgcHJvcGVydGllcyA9IHt9LFxyXG4gICAgICAgICAgICBjb25uZWN0b3JzID0ge30sXHJcbiAgICAgICAgICAgIHBvcnRzID0ge307XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdEZXNpZ25EZXRhaWxzQ29udHJvbGxlcicpO1xyXG4gICAgICAgICRzY29wZS5pbml0ID0gZnVuY3Rpb24gKGNvbm5lY3Rpb25JZCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuY29ubmVjdGlvbklkID0gY29ubmVjdGlvbklkO1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnRGVzaWduRGV0YWlsc18nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRGVzdHJveWluZyA6JywgY29udGV4dC5yZWdpb25JZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdG9yczogY29ubmVjdG9ycyxcclxuICAgICAgICAgICAgICAgIHBvcnRzOiBwb3J0c1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZGVzaWduU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3kpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgIHBvcnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmIChkZXN0cm95KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiBub3RpZnkgdXNlclxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnRGVzaWduRGV0YWlsc0NvbnRyb2xsZXIgLSBpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKGNvbnRleHQsICRzY29wZS5kZXNpZ25JZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHdhdGNoSW50ZXJmYWNlcyBrZWVwcyB0aGUgZGF0YSB1cC10by1kYXRlIHRoZXJlIHNob3VsZG4ndCBiZSBhIG5lZWQgdG8gZG8gYW55XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlcyBoZXJlLi5cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hJbnRlcmZhY2VzJywgdXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRlc2lnbkludGVyZmFjZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMucHJvcGVydGllcyA9IGRlc2lnbkludGVyZmFjZXMucHJvcGVydGllcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMuY29ubmVjdG9ycyA9IGRlc2lnbkludGVyZmFjZXMuY29ubmVjdG9ycztcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMucG9ydHMgPSBkZXNpZ25JbnRlcmZhY2VzLnBvcnRzO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2Rlc2lnbkRldGFpbHMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBkZXNpZ25JZDogJz1kZXNpZ25JZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVxdWlyZTogJ15kZXNpZ25MaXN0JyxcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyLCBkZXNpZ25MaXN0Q29udHJvbGxlcikge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbm5lY3Rpb25JZCA9IGRlc2lnbkxpc3RDb250cm9sbGVyLmdldENvbm5lY3Rpb25JZCgpO1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuaW5pdChjb25uZWN0aW9uSWQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9JbnRlcmZhY2VEZXRhaWxzLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRGVzaWduRGV0YWlsc0NvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdEZXNpZ25MaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICR3aW5kb3csICRsb2NhdGlvbiwgJG1vZGFsLCBkZXNpZ25TZXJ2aWNlLCBncm93bCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGl0ZW1zID0gW10sICAgICAgICAgICAgIC8vIEl0ZW1zIHRoYXQgYXJlIHBhc3NlZCB0byB0aGUgaXRlbS1saXN0IHVpLWNvbXBvbmVudC5cclxuICAgICAgICAgICAgZGVzaWduSXRlbXMgPSB7fSwgICAgICAgLy8gU2FtZSBpdGVtcyBhcmUgc3RvcmVkIGluIGEgZGljdGlvbmFyeS5cclxuICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0sXHJcbiAgICAgICAgICAgIGNvbmZpZyxcclxuICAgICAgICAgICAgYWRkQ29uZmlndXJhdGlvbldhdGNoZXIsXHJcbiAgICAgICAgICAgIGNvbnRleHQsXHJcbiAgICAgICAgICAgIGl0ZW1DbGlja0ZuLFxyXG4gICAgICAgICAgICBpdGVtQ2xpY2tUaXA7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdEZXNpZ25MaXN0Q29udHJvbGxlcicpO1xyXG4gICAgICAgIHRoaXMuZ2V0Q29ubmVjdGlvbklkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLmNvbm5lY3Rpb25JZDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0Rlc2lnbkxpc3RDb250cm9sbGVyXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBpdGVtIGxpc3QgdWkgY29tcG9uZW50LlxyXG4gICAgICAgIGNvbmZpZyA9IHtcclxuXHJcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2Vjb25kYXJ5SXRlbU1lbnU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbHNDb2xsYXBzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXHJcbiAgICAgICAgICAgIGhpZGVEZXRhaWxzTGFiZWw6ICdIaWRlIGRldGFpbHMnLFxyXG5cclxuICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Tb3J0OiBmdW5jdGlvbiAoalFFdmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ1NvcnQgaGFwcGVuZWQnLCBqUUV2ZW50LCB1aSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ2xpY2s6IGZ1bmN0aW9uIChldmVudCwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1VybCA9ICcvZGVzaWduU3BhY2UvJyArICRzY29wZS53b3Jrc3BhY2VJZC5yZXBsYWNlKC9cXC8vZywgJy0nKSArICcvJyArIGl0ZW0uaWQucmVwbGFjZSgvXFwvL2csICctJyk7XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aChuZXdVcmwpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ29wZW5JbkVkaXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tZWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbignLz9wcm9qZWN0PUFETUVkaXRvciZhY3RpdmVPYmplY3Q9JyArIGl0ZW0uaWQsICdfYmxhbmsnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZWRpdERlc2lnbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFZGl0IEF0dHJpYnV0ZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGl0ZW0uZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiOiBjb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoRGVzaWducydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBkZXNpZ25TZXJ2aWNlLmVkaXREZXNpZ25GblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ3NldEFzVG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3QnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU2V0IGFzIFRMU1VUJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogISRzY29wZS51c2VkQnlUZXN0QmVuY2gsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtYXJyb3ctY2lyY2xlLXJpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7aWQ6IGl0ZW0uaWQsIG5hbWU6IGl0ZW0udGl0bGV9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZFRsc3V0ID0gZGVzaWduSXRlbXNbJHNjb3BlLnN0YXRlLnRsc3V0SWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3RhdGUudGxzdXRJZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kZW1pdCgndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RTZXQnLCBpdGVtLCBvbGRUbHN1dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2V4cG9ydEFzQWRtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0V4cG9ydCBBRE0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXNoYXJlLWFsdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBkZXNpZ25TZXJ2aWNlLmV4cG9ydEFzQWRtRm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGRlc2lnblNlcnZpY2UuZGVsZXRlRm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBkZXRhaWxzUmVuZGVyZXI6IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBpdGVtLmRldGFpbHMgPSAnTXkgZGV0YWlscyBhcmUgaGVyZSBub3chJztcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGZpbHRlcjoge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xyXG4gICAgICAgICAgICBpdGVtczogaXRlbXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuc3RhdGUgPSB7XHJcbiAgICAgICAgICAgIHRsc3V0SWQ6IG51bGxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuJG9uKCd0b3BMZXZlbFN5c3RlbVVuZGVyVGVzdENoYW5nZWQnLCBmdW5jdGlvbiAoZXZlbnQsIGlkKSB7XHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUuc3RhdGUudGxzdXRJZCAmJiBkZXNpZ25JdGVtcy5oYXNPd25Qcm9wZXJ0eSgkc2NvcGUuc3RhdGUudGxzdXRJZCkpIHtcclxuICAgICAgICAgICAgICAgIGRlc2lnbkl0ZW1zWyRzY29wZS5zdGF0ZS50bHN1dElkXS5jc3NDbGFzcyA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZS50bHN1dElkID0gaWQ7XHJcbiAgICAgICAgICAgIGlmIChkZXNpZ25JdGVtcy5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcclxuICAgICAgICAgICAgICAgIGRlc2lnbkl0ZW1zW2lkXS5jc3NDbGFzcyA9ICd0b3AtbGV2ZWwtc3lzdGVtLXVuZGVyLXRlc3QnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFRyYW5zZm9ybSB0aGUgcmF3IHNlcnZpY2Ugbm9kZSBkYXRhIHRvIGl0ZW1zIGZvciB0aGUgbGlzdC5cclxuICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBsaXN0SXRlbTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZXNpZ25JdGVtcy5oYXNPd25Qcm9wZXJ0eShkYXRhLmlkKSkge1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSBkZXNpZ25JdGVtc1tkYXRhLmlkXTtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnRpdGxlID0gZGF0YS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGVzY3JpcHRpb24gPSBkYXRhLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnT3BlbiBEZXNpZ24gU3BhY2UgVmlldycsXHJcbiAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICRzY29wZS5zdGF0ZS50bHN1dElkID09PSBkYXRhLmlkID8gJ3RvcC1sZXZlbC1zeXN0ZW0tdW5kZXItdGVzdCcgOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiAnTi9BJywgICAvLyBUT0RPOiBnZXQgdGhpcyBpbiB0aGUgZnV0dXJlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiAnTi9BJyAgICAvLyBUT0RPOiBnZXQgdGhpcyBpbiB0aGUgZnV0dXJlLlxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnQ29uZmlndXJhdGlvbiBTZXRzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tdGgtbGFyZ2UnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ0NvbmZpZ3VyYXRpb25zJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tdGgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ1Jlc3VsdHMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zdGF0cydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlscyAgICA6ICdDb250ZW50JyxcclxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzVGVtcGxhdGVVcmw6ICdkZXNpZ25EZXRhaWxzLmh0bWwnXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBsaXN0LWl0ZW0gdG8gdGhlIGl0ZW1zIGxpc3QgYW5kIHRoZSBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChsaXN0SXRlbSk7XHJcbiAgICAgICAgICAgICAgICBkZXNpZ25JdGVtc1tsaXN0SXRlbS5pZF0gPSBsaXN0SXRlbTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGFkZENvbmZpZ3VyYXRpb25XYXRjaGVyID0gZnVuY3Rpb24gKGRlc2lnbklkKSB7XHJcbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hOYnJPZkNvbmZpZ3VyYXRpb25zKGNvbnRleHQsIGRlc2lnbklkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGlzdEl0ZW0gPSBkZXNpZ25JdGVtc1tkZXNpZ25JZF07XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0c1swXS52YWx1ZSA9IHVwZGF0ZU9iamVjdC5kYXRhLmNvdW50ZXJzLnNldHM7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0c1sxXS52YWx1ZSA9IHVwZGF0ZU9iamVjdC5kYXRhLmNvdW50ZXJzLmNvbmZpZ3VyYXRpb25zO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHNbMl0udmFsdWUgPSB1cGRhdGVPYmplY3QuZGF0YS5jb3VudGVycy5yZXN1bHRzO1xyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGlzdEl0ZW0gPSBkZXNpZ25JdGVtc1tkZXNpZ25JZF07XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0c1swXS52YWx1ZSA9IGRhdGEuY291bnRlcnMuc2V0cztcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzWzFdLnZhbHVlID0gZGF0YS5jb3VudGVycy5jb25maWd1cmF0aW9ucztcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzWzJdLnZhbHVlID0gZGF0YS5jb3VudGVycy5yZXN1bHRzO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICRzY29wZS5saXN0RGF0YS5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgICAgICAgICBkZXNpZ25JdGVtcyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hEZXNpZ25zKGNvbnRleHQsICRzY29wZS53b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4O1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLndhcm4odXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZENvbmZpZ3VyYXRpb25XYXRjaGVyKHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2lnbkl0ZW1zLmhhc093blByb3BlcnR5KHVwZGF0ZU9iamVjdC5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpdGVtcy5tYXAoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5pbmRleE9mKHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE5ick9mQ29uZmlndXJhdGlvbnNfJyArIHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkZXNpZ25JdGVtc1t1cGRhdGVPYmplY3QuaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZXNpZ25JZDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGRlc2lnbklkIGluIGRhdGEuZGVzaWducykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5kZXNpZ25zLmhhc093blByb3BlcnR5KGRlc2lnbklkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0oZGF0YS5kZXNpZ25zW2Rlc2lnbklkXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRDb25maWd1cmF0aW9uV2F0Y2hlcihkZXNpZ25JZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pXHJcbiAgICAuY29udHJvbGxlcignRGVzaWduRWRpdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgZGF0YSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgIG5hbWU6IGRhdGEubmFtZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoJHNjb3BlLmRhdGEpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoJ2NhbmNlbCcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgnZGVzaWduTGlzdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUlkOiAnPXdvcmtzcGFjZUlkJyxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25JZDogJz1jb25uZWN0aW9uSWQnLFxyXG4gICAgICAgICAgICAgICAgdXNlZEJ5VGVzdEJlbmNoOiAnPXVzZWRCeVRlc3RCZW5jaCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvRGVzaWduTGlzdC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rlc2lnbkxpc3RDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdEZXNpZ25UcmVlQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICR3aW5kb3csIGRlc2lnblNlcnZpY2UsIGRlc2VydFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIGNvbnRleHQsXHJcbiAgICAgICAgICAgIGNvbmZpZyxcclxuICAgICAgICAgICAgdHJlZURhdGEsXHJcbiAgICAgICAgICAgIHJvb3ROb2RlLFxyXG4gICAgICAgICAgICBhdm1JZHMgPSB7fSxcclxuICAgICAgICAgICAgYnVpbGRUcmVlU3RydWN0dXJlO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnRGVzaWduVHJlZUNvbnRyb2xsZXInKTtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbm5lY3Rpb25JZCBhbmQgcmVnaXN0ZXIgY2xlYW4tdXAgb24gZGVzdHJveSBldmVudC5cclxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnRGVzaWduVHJlZUNvbnRyb2xsZXJfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgIG5vZGVDb250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoZSwgbm9kZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFt7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY3JlYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge2lkOiBub2RlLmlkfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcvP3Byb2plY3Q9QURNRWRpdG9yJmFjdGl2ZU9iamVjdD0nICsgZGF0YS5pZCwgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgIH1dO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBub2RlQ2xpY2s6IGZ1bmN0aW9uICggZSwgbm9kZSApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnTm9kZSB3YXMgY2xpY2tlZDonLCBub2RlLCAkc2NvcGUgKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGlzYWJsZU1hbnVhbFNlbGVjdGlvbjogdHJ1ZSxcclxuICAgICAgICAgICAgZm9sZGVySWNvbkNsYXNzOiAnZmEgZmEtY3ViZXMnXHJcbi8vICAgICAgICAgICAgbm9kZURibGNsaWNrOiBmdW5jdGlvbiAoIGUsIG5vZGUgKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnTm9kZSB3YXMgZG91YmxlLWNsaWNrZWQ6Jywgbm9kZSApO1xyXG4vLyAgICAgICAgICAgIH0sXHJcbi8vICAgICAgICAgICAgbm9kZUV4cGFuZGVyQ2xpY2s6IGZ1bmN0aW9uICggZSwgbm9kZSwgaXNFeHBhbmQgKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnRXhwYW5kZXIgd2FzIGNsaWNrZWQgZm9yIG5vZGU6Jywgbm9kZSwgaXNFeHBhbmQgKTtcclxuLy8gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJvb3ROb2RlID0ge1xyXG4gICAgICAgICAgICBpZDogJHNjb3BlLmRlc2lnbklkLFxyXG4gICAgICAgICAgICBsYWJlbDogJ0xvYWRpbmcgRGVzaWduIFNwYWNlIE5vZGVzLi4nLFxyXG4gICAgICAgICAgICBleHRyYUluZm86ICcnLFxyXG4gICAgICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgICAgIGNoaWxkcmVuQ291bnQ6IDBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0cmVlRGF0YSA9IHtcclxuICAgICAgICAgICAgaWQ6ICcnLFxyXG4gICAgICAgICAgICBsYWJlbDogJycsXHJcbiAgICAgICAgICAgIGV4dHJhSW5mbzogJycsXHJcbiAgICAgICAgICAgIHVuQ29sbGFwc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgICAgICByb290Tm9kZVxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBjaGlsZHJlbkNvdW50OiAxXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgICRzY29wZS50cmVlRGF0YSA9IHRyZWVEYXRhO1xyXG4gICAgICAgICRzY29wZS4kb24oJ3NldFNlbGVjdGVkTm9kZXMnLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmNvbmZpZy5zdGF0ZS5zZWxlY3RlZE5vZGVzID0gZGF0YTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYnVpbGRUcmVlU3RydWN0dXJlID0gZnVuY3Rpb24gKGNvbnRhaW5lciwgcGFyZW50VHJlZU5vZGUpIHtcclxuICAgICAgICAgICAgdmFyIGtleSxcclxuICAgICAgICAgICAgICAgIGNoaWxkRGF0YSxcclxuICAgICAgICAgICAgICAgIHRyZWVOb2RlO1xyXG4gICAgICAgICAgICBpZiAocGFyZW50VHJlZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRyZWVOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGV4dHJhSW5mbzogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5Db3VudDogMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHBhcmVudFRyZWVOb2RlLmNoaWxkcmVuLnB1c2godHJlZU5vZGUpO1xyXG4gICAgICAgICAgICAgICAgcGFyZW50VHJlZU5vZGUuY2hpbGRyZW5Db3VudCArPSAxO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdHJlZU5vZGUgPSByb290Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0cmVlTm9kZS5pZCA9IGNvbnRhaW5lci5pZDtcclxuICAgICAgICAgICAgdHJlZU5vZGUubGFiZWwgPSBjb250YWluZXIubmFtZTtcclxuICAgICAgICAgICAgdHJlZU5vZGUuZXh0cmFJbmZvID0gY29udGFpbmVyLnR5cGU7XHJcbiAgICAgICAgICAgICRzY29wZS5jb25maWcuc3RhdGUuZXhwYW5kZWROb2Rlcy5wdXNoKHRyZWVOb2RlLmlkKTtcclxuICAgICAgICAgICAgZm9yIChrZXkgaW4gY29udGFpbmVyLmNvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIuY29tcG9uZW50cy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhID0gY29udGFpbmVyLmNvbXBvbmVudHNba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB0cmVlTm9kZS5jaGlsZHJlbi5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkRGF0YS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGNoaWxkRGF0YS5uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJlZU5vZGUuY2hpbGRyZW5Db3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhdm1JZHNbY2hpbGREYXRhLmF2bUlkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdm1JZHNbY2hpbGREYXRhLmF2bUlkXS5wdXNoKGNoaWxkRGF0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWRzW2NoaWxkRGF0YS5hdm1JZF0gPSBbY2hpbGREYXRhLmlkXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChrZXkgaW4gY29udGFpbmVyLnN1YkNvbnRhaW5lcnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIuc3ViQ29udGFpbmVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhID0gY29udGFpbmVyLnN1YkNvbnRhaW5lcnNba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBidWlsZFRyZWVTdHJ1Y3R1cmUoY2hpbGREYXRhLCB0cmVlTm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgIGlmIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignZGVzdHJveSBldmVudCByYWlzZWQnKTtcclxuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGRpc3BsYXkgdGhpcyB0byB0aGUgdXNlci5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ2luaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcblxyXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWduU3RydWN0dXJlKGNvbnRleHQsICRzY29wZS5kZXNpZ25JZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByb290Q29udGFpbmVyID0gZGF0YS5jb250YWluZXJzW2RhdGEucm9vdElkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzZXJ0SW5wdXREYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkVHJlZVN0cnVjdHVyZShyb290Q29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGVtaXQoJ2Rlc2lnblRyZWVMb2FkZWQnLCBhdm1JZHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBUaGlzIHBhcnQgaXMgb25seSBoZXJlIHRvIHJldXNlIHRoZSBkYXRhIGZyb20gd2F0Y2hEZXNpZ25TdHJ1Y3R1cmUuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogRmluZCBhIG1vcmUgc3VpdGFibGUgbG9jYXRpb24uXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzZXJ0SW5wdXREYXRhID0gZGVzZXJ0U2VydmljZS5nZXREZXNlcnRJbnB1dERhdGEoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCdkZXNlcnRJbnB1dFJlYWR5JywgZGVzZXJ0SW5wdXREYXRhKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2Rlc2lnblRyZWUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBkZXNpZ25JZDogJz1kZXNpZ25JZCcsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9EZXNpZ25UcmVlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRGVzaWduVHJlZUNvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignU2ltcGxlTW9kYWxDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIGRhdGEpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XHJcbiAgICAgICAgICAgIHRpdGxlOiBkYXRhLnRpdGxlLFxyXG4gICAgICAgICAgICBkZXRhaWxzOiBkYXRhLmRldGFpbHNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUub2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignVGVzdEJlbmNoRGV0YWlsc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCB0ZXN0QmVuY2hTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0ge30sXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fSxcclxuICAgICAgICAgICAgY29ubmVjdG9ycyA9IHt9LFxyXG4gICAgICAgICAgICBwb3J0cyA9IHt9LFxyXG4gICAgICAgICAgICB3YXRjaEludGVyZmFjZXM7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdUZXN0QmVuY2hEZXRhaWxzQ29udHJvbGxlcicpO1xyXG4gICAgICAgICRzY29wZS5pbml0ID0gZnVuY3Rpb24gKGNvbm5lY3Rpb25JZCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuY29ubmVjdGlvbklkID0gY29ubmVjdGlvbklkO1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnVGVzdEJlbmNoRGV0YWlsc18nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRGVzdHJveWluZyA6JywgY29udGV4dC5yZWdpb25JZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdG9yczogY29ubmVjdG9ycyxcclxuICAgICAgICAgICAgICAgIHBvcnRzOiBwb3J0c1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3YXRjaEludGVyZmFjZXMgPSBmdW5jdGlvbiAoY29udGFpbmVySWQpIHtcclxuICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKGNvbnRleHQsIGNvbnRhaW5lcklkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2luY2Ugd2F0Y2hJbnRlcmZhY2VzIGtlZXBzIHRoZSBkYXRhIHVwLXRvLWRhdGUgdGhlcmUgc2hvdWxkbid0IGJlIGEgbmVlZCB0byBkbyBhbnlcclxuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGVzIGhlcmUuLlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaEludGVyZmFjZXMnLCB1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29udGFpbmVySW50ZXJmYWNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wcm9wZXJ0aWVzID0gY29udGFpbmVySW50ZXJmYWNlcy5wcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5jb25uZWN0b3JzID0gY29udGFpbmVySW50ZXJmYWNlcy5jb25uZWN0b3JzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wb3J0cyA9IGNvbnRhaW5lckludGVyZmFjZXMucG9ydHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdG9yczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgcG9ydHM6IHt9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGRlc3Ryb3kpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1RPRE86IG5vdGlmeSB1c2VyXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdUZXN0QmVuY2hEZXRhaWxzQ29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLndhdGNoVGVzdEJlbmNoRGV0YWlscyhjb250ZXh0LCAkc2NvcGUudGVzdEJlbmNoSWQsIGZ1bmN0aW9uICh1cGRhdGVkT2JqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCd3YXRjaFRlc3RCZW5jaERldGFpbHMgdXBkYXRlcycsIHVwZGF0ZWRPYmopO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb250YWluZXJJZHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIGNvbnRhaW5lciBkZWZpbmVkIScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGEuY29udGFpbmVySWRzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hJbnRlcmZhY2VzKGRhdGEuY29udGFpbmVySWRzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ01vcmUgdGhhbiBvbmUgY29udGFpbmVyIGRlZmluZWQhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCd0ZXN0QmVuY2hEZXRhaWxzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQ6ICc9dGVzdEJlbmNoSWQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcXVpcmU6ICdedGVzdEJlbmNoTGlzdCcsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0ciwgdGVzdEJlbmNoTGlzdENvbnRyb2xsZXIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0aW9uSWQgPSB0ZXN0QmVuY2hMaXN0Q29udHJvbGxlci5nZXRDb25uZWN0aW9uSWQoKTtcclxuICAgICAgICAgICAgICAgIHNjb3BlLmluaXQoY29ubmVjdGlvbklkKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvSW50ZXJmYWNlRGV0YWlscy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Rlc3RCZW5jaERldGFpbHNDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignVGVzdEJlbmNoTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkd2luZG93LCAkbG9jYXRpb24sICRtb2RhbCwgZ3Jvd2wsIHRlc3RCZW5jaFNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBpdGVtcyA9IFtdLCAgICAgICAgICAgICAvLyBJdGVtcyB0aGF0IGFyZSBwYXNzZWQgdG8gdGhlIGl0ZW0tbGlzdCB1aS1jb21wb25lbnQuXHJcbiAgICAgICAgICAgIHRlc3RCZW5jaEl0ZW1zID0ge30sICAgIC8vIFNhbWUgaXRlbXMgYXJlIHN0b3JlZCBpbiBhIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtLFxyXG4gICAgICAgICAgICBjb25maWcsXHJcbiAgICAgICAgICAgIGNvbnRleHQ7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdUZXN0QmVuY2hMaXN0Q29udHJvbGxlcicpO1xyXG5cclxuICAgICAgICB0aGlzLmdldENvbm5lY3Rpb25JZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRzY29wZS5jb25uZWN0aW9uSWQ7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbm5lY3Rpb25JZCBhbmQgcmVnaXN0ZXIgY2xlYW4tdXAgb24gZGVzdHJveSBldmVudC5cclxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnVGVzdEJlbmNoTGlzdENvbnRyb2xsZXJfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDb25maWd1cmF0aW9uIGZvciB0aGUgaXRlbSBsaXN0IHVpIGNvbXBvbmVudC5cclxuICAgICAgICBjb25maWcgPSB7XHJcblxyXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWxzQ29sbGFwc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNob3dEZXRhaWxzTGFiZWw6ICdTaG93IGRldGFpbHMnLFxyXG4gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcclxuXHJcbiAgICAgICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzXHJcblxyXG4gICAgICAgICAgICBpdGVtU29ydDogZnVuY3Rpb24gKGpRRXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU29ydCBoYXBwZW5lZCcsIGpRRXZlbnQsIHVpKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3VXJsID0gJy90ZXN0QmVuY2gvJyArICRzY29wZS53b3Jrc3BhY2VJZC5yZXBsYWNlKC9cXC8vZywgJy0nKSArICcvJyArIGl0ZW0uaWQucmVwbGFjZSgvXFwvL2csICctJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdVcmwpO1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgobmV3VXJsKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Db250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoZSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuSW5FZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD1BRE1FZGl0b3ImYWN0aXZlT2JqZWN0PScgKyBpdGVtLmlkLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2VkaXRUZXN0QmVuY2gnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogaXRlbS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IGl0ZW0uZGF0YS5maWxlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogaXRlbS5kYXRhLnBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRDb250ZXh0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYjogY29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaFRlc3RCZW5jaGVzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2g6IGl0ZW1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGVzdEJlbmNoU2VydmljZS5lZGl0VGVzdEJlbmNoRm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRlc3RCZW5jaFNlcnZpY2UuZGVsZXRlRm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBkZXRhaWxzUmVuZGVyZXI6IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBpdGVtLmRldGFpbHMgPSAnTXkgZGV0YWlscyBhcmUgaGVyZSBub3chJztcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGZpbHRlcjoge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xyXG4gICAgICAgICAgICBpdGVtczogaXRlbXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBUcmFuc2Zvcm0gdGhlIHJhdyBzZXJ2aWNlIG5vZGUgZGF0YSB0byBpdGVtcyBmb3IgdGhlIGxpc3QuXHJcbiAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0gPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgbGlzdEl0ZW07XHJcblxyXG4gICAgICAgICAgICBpZiAodGVzdEJlbmNoSXRlbXMuaGFzT3duUHJvcGVydHkoZGF0YS5pZCkpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtID0gdGVzdEJlbmNoSXRlbXNbZGF0YS5pZF07XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS50aXRsZSA9IGRhdGEubmFtZTtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRhdGEuZmlsZXMgPSBkYXRhLmZpbGVzO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGF0YS5wYXRoID0gZGF0YS5wYXRoO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGF0YS5yZXN1bHRzID0gZGF0YS5yZXN1bHRzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnT3BlbiBUZXN0LUJlbmNoIFZpZXcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVcGRhdGVkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6ICdOL0EnLCAgIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnICAgIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0czogWyBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHMgICAgOiAnQ29udGVudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsc1RlbXBsYXRlVXJsOiAndGVzdEJlbmNoRGV0YWlscy5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBkYXRhLmZpbGVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBkYXRhLnBhdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IGRhdGEucmVzdWx0c1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGxpc3QtaXRlbSB0byB0aGUgaXRlbXMgbGlzdCBhbmQgdGhlIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGxpc3RJdGVtKTtcclxuICAgICAgICAgICAgICAgIHRlc3RCZW5jaEl0ZW1zW2xpc3RJdGVtLmlkXSA9IGxpc3RJdGVtO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGVzdEJlbmNoU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xyXG4gICAgICAgICAgICAkc2NvcGUubGlzdERhdGEuaXRlbXMgPSBpdGVtcztcclxuICAgICAgICAgICAgdGVzdEJlbmNoSXRlbXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignZGVzdHJveSBldmVudCByYWlzZWQnKTtcclxuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGRpc3BsYXkgdGhpcyB0byB0aGUgdXNlci5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ2luaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcblxyXG4gICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLndhdGNoVGVzdEJlbmNoZXMoY29udGV4dCwgJHNjb3BlLndvcmtzcGFjZUlkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXg7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUud2Fybih1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3RCZW5jaEl0ZW1zLmhhc093blByb3BlcnR5KHVwZGF0ZU9iamVjdC5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpdGVtcy5tYXAoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5pbmRleE9mKHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0ZXN0QmVuY2hJdGVtc1t1cGRhdGVPYmplY3QuaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZXN0QmVuY2hJZDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHRlc3RCZW5jaElkIGluIGRhdGEudGVzdEJlbmNoZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEudGVzdEJlbmNoZXMuaGFzT3duUHJvcGVydHkodGVzdEJlbmNoSWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbShkYXRhLnRlc3RCZW5jaGVzW3Rlc3RCZW5jaElkXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pXHJcbiAgICAuY29udHJvbGxlcignVGVzdEJlbmNoRWRpdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgZ3Jvd2wsIGRhdGEsIGZpbGVTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBmaWxlSW5mbztcclxuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgIG5hbWU6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgZmlsZUluZm86IHtcclxuICAgICAgICAgICAgICAgIGhhc2g6IGRhdGEuZmlsZXMsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBmaWxlU2VydmljZS5nZXREb3dubG9hZFVybChkYXRhLmZpbGVzKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwYXRoOiBkYXRhLnBhdGhcclxuICAgICAgICB9O1xyXG4gICAgICAgIGZpbGVJbmZvID0gJHNjb3BlLmRhdGEuZmlsZUluZm87XHJcbiAgICAgICAgaWYgKGZpbGVJbmZvLmhhc2gpIHtcclxuICAgICAgICAgICAgZmlsZVNlcnZpY2UuZ2V0TWV0YWRhdGEoZmlsZUluZm8uaGFzaClcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChtZXRhZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLm5hbWUgPSBtZXRhZGF0YS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGdldCBtZXRhLWRhdGEgZm9yIGhhc2gnLCBmaWxlSW5mby5oYXNoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLmRyYWdPdmVyQ2xhc3MgPSBmdW5jdGlvbiAoJGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBkcmFnZ2VkSXRlbXMgPSAkZXZlbnQuZGF0YVRyYW5zZmVyLml0ZW1zLFxyXG4gICAgICAgICAgICAgICAgaGFzRmlsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUud2FybihkcmFnZ2VkSXRlbXMpO1xyXG4gICAgICAgICAgICBoYXNGaWxlID0gZHJhZ2dlZEl0ZW1zICYmIGRyYWdnZWRJdGVtcy5sZW5ndGggPT09IDEgJiYgZHJhZ2dlZEl0ZW1zWzBdLmtpbmQgPT09ICdmaWxlJztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBoYXNGaWxlID8gXCJiZy1zdWNjZXNzIGRyYWdvdmVyXCIgOiBcImJnLWRhbmdlciBkcmFnb3ZlclwiO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5vbkRyb3BwZWRGaWxlcyA9IGZ1bmN0aW9uICgkZmlsZXMpIHtcclxuICAgICAgICAgICAgZmlsZVNlcnZpY2Uuc2F2ZURyb3BwZWRGaWxlcygkZmlsZXMsIHt6aXA6IHRydWV9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGZJbmZvcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmSW5mb3MubGVuZ3RoICE9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdPbmUgemlwIGZpbGUgbXVzdCBiZSBkcm9wcGVkIScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLm5hbWUgPSBmSW5mb3NbMF0ubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8udXJsID0gZkluZm9zWzBdLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLmhhc2ggPSBmSW5mb3NbMF0uaGFzaDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUub2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCRzY29wZS5kYXRhKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcclxuICAgICAgICB9O1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ3Rlc3RCZW5jaExpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJZDogJz13b3Jrc3BhY2VJZCcsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9UZXN0QmVuY2hMaXN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnVGVzdEJlbmNoTGlzdENvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1dvcmtlcnNMaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRpbnRlcnZhbCwgZ3Jvd2wsIGV4ZWN1dG9yU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgaW50ZXJ2YWxQcm9taXNlID0gbnVsbCxcclxuICAgICAgICAgICAgY29uc2VjdXRpdmVFcnJvcnMgPSAwLFxyXG4gICAgICAgICAgICBtYXhDb25zZWN1dGl2ZUVycm9ycyA9IDMwO1xyXG4gICAgICAgICRzY29wZS5kYXRhTW9kZWwgPSB7XHJcbiAgICAgICAgICAgIHdvcmtlcnM6IG51bGxcclxuICAgICAgICB9O1xyXG4gICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoaW50ZXJ2YWxQcm9taXNlICYmICRpbnRlcnZhbC5jYW5jZWwoaW50ZXJ2YWxQcm9taXNlKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1dvcmtlcnMgaW50ZXJ2YWwgY2FuY2VsbGVkJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgY2FuY2VsIFdvcmtlcnNJbnRlcnZhbC4nKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoaW50ZXJ2YWxQcm9taXNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpbnRlcnZhbFByb21pc2UgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBleGVjdXRvclNlcnZpY2UuZ2V0V29ya2Vyc0luZm8oKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc2VjdXRpdmVFcnJvcnMgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWwud29ya2VycyA9IHJlc3BvbmNlO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNlY3V0aXZlRXJyb3JzICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnNlY3V0aXZlRXJyb3JzID49IG1heENvbnNlY3V0aXZlRXJyb3JzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpbnRlcnZhbC5jYW5jZWwoaW50ZXJ2YWxQcm9taXNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoJ1dvcmtlcnMgZGlkIG5vdCByZXNwb25kIGFmdGVyICcgKyBtYXhDb25zZWN1dGl2ZUVycm9ycyArICcgcmVxdWVzdHMuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVydmFsUHJvbWlzZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSwgMTAwMCk7XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgnd29ya2Vyc0xpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1dvcmtlcnNMaXN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnV29ya2Vyc0xpc3RDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50Ki9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHdpbmRvdywgJGxvY2F0aW9uLCAkbW9kYWwsIGdyb3dsLCB3b3Jrc3BhY2VTZXJ2aWNlLCBmaWxlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGl0ZW1zID0gW10sXHJcbiAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW1zID0ge30sXHJcbiAgICAgICAgICAgIGNvbmZpZyxcclxuICAgICAgICAgICAgY29udGV4dCxcclxuICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0sXHJcbiAgICAgICAgICAgIGFkZENvdW50V2F0Y2hlcnM7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdXb3Jrc3BhY2VMaXN0Q29udHJvbGxlcicpO1xyXG5cclxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnV29ya3NwYWNlTGlzdENvbnRyb2xsZXJfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcgPSB7XHJcblxyXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWxzQ29sbGFwc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNob3dEZXRhaWxzTGFiZWw6ICdTaG93IGRldGFpbHMnLFxyXG4gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcclxuXHJcbiAgICAgICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzXHJcblxyXG4gICAgICAgICAgICBpdGVtU29ydDogZnVuY3Rpb24gKGpRRXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU29ydCBoYXBwZW5lZCcsIGpRRXZlbnQsIHVpKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3dvcmtzcGFjZURldGFpbHMvJyArIGl0ZW0uaWQucmVwbGFjZSgvXFwvL2csICctJykpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uIChlLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ29wZW5JbkVkaXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tZWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbignLz9wcm9qZWN0PUFETUVkaXRvciZhY3RpdmVPYmplY3Q9JyArIGl0ZW0uaWQsICdfYmxhbmsnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZWRpdFdvcmtzcGFjZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBpdGVtLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnRpdGxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlZGl0Q29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYjogY29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hXb3Jrc3BhY2VzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvV29ya3NwYWNlRWRpdC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnV29ya3NwYWNlRWRpdENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHsgZGF0YTogZnVuY3Rpb24gKCkgeyByZXR1cm4gZGF0YTsgfSB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKGVkaXRlZERhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhdHRycyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IGVkaXRlZERhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSU5GTyc6IGVkaXRlZERhdGEuZGVzY3JpcHRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLnNldFdvcmtzcGFjZUF0dHJpYnV0ZXMoZWRpdENvbnRleHQsIGRhdGEuaWQsIGF0dHJzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0F0dHJpYnV0ZSB1cGRhdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2V4cG9ydEFzWE1FJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0V4cG9ydCBhcyBYTUUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXNoYXJlLWFsdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCwgbmFtZTogaXRlbS50aXRsZSB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5leHBvcnRXb3Jrc3BhY2UoY29udGV4dCwgZGF0YS5pZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkb3dubG9hZFVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoJ1dvcmtzcGFjZSBwYWNrYWdlIGZvciA8YSBocmVmPVwiJyArIGRvd25sb2FkVXJsICsgJ1wiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm5hbWUgKyAnPC9hPiBleHBvcnRlZC4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVhc29uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcignRXhwb3J0IGZhaWxlZCwgc2VlIGNvbnNvbGUgZm9yIGRldGFpbHMuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2RlbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YTogeyBpZDogaXRlbS5pZCwgbmFtZTogaXRlbS50aXRsZSB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9TaW1wbGVNb2RhbC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTaW1wbGVNb2RhbENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRGVsZXRlIFdvcmtzcGFjZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiAnVGhpcyB3aWxsIGRlbGV0ZSAnICsgZGF0YS5uYW1lICsgJyBmcm9tIHRoZSBwcm9qZWN0LidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmRlbGV0ZVdvcmtzcGFjZShjb250ZXh0LCBkYXRhLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaXRlbS5kZXRhaWxzID0gJ015IGRldGFpbHMgYXJlIGhlcmUgbm93ISc7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBuZXdJdGVtRm9ybToge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDcmVhdGUgbmV3IHdvcmtzcGFjZScsXHJcbiAgICAgICAgICAgICAgICBpdGVtVGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvV29ya3NwYWNlTmV3SXRlbS5odG1sJyxcclxuICAgICAgICAgICAgICAgIGV4cGFuZGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubW9kZWwgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3BwZWRGaWxlczogW11cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kcmFnT3ZlckNsYXNzID0gZnVuY3Rpb24gKCRldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHJhZ2dlZEl0ZW1zID0gJGV2ZW50LmRhdGFUcmFuc2Zlci5pdGVtcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGaWxlID0gZmFsc2U7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGRyYWdnZWRJdGVtcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkcmFnZ2VkSXRlbXMgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0ZpbGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBkcmFnZ2VkSXRlbXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ2dlZEl0ZW1zW2ldLmtpbmQgPT09ICdmaWxlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGaWxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGFzRmlsZSA/IFwiYmctc3VjY2VzcyBkcmFnb3ZlclwiIDogXCJiZy1kYW5nZXIgZHJhZ292ZXJcIjtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUub25Ecm9wcGVkRmlsZXMgPSBmdW5jdGlvbiAoJGZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTZXJ2aWNlLnNhdmVEcm9wcGVkRmlsZXMoJGZpbGVzLCB7emlwOiB0cnVlLCBhZG06IHRydWUsIGF0bTogdHJ1ZX0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZkluZm9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZkluZm9zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZkluZm9zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tb2RlbC5kcm9wcGVkRmlsZXMucHVzaChmSW5mb3NbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jcmVhdGVJdGVtID0gZnVuY3Rpb24gKG5ld0l0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0l0ZW1Db250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiOiBjb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaFdvcmtzcGFjZXMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5ld0l0ZW0gfHwgIW5ld0l0ZW0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZygnUHJvdmlkZSBhIG5hbWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmNyZWF0ZVdvcmtzcGFjZShuZXdJdGVtQ29udGV4dCwgbmV3SXRlbS5uYW1lLCBuZXdJdGVtLmRlc2NyaXB0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGZvbGRlcklkcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MobmV3SXRlbS5uYW1lICsgJyBjcmVhdGVkLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubW9kZWwuZHJvcHBlZEZpbGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuaW5mbygnSW1wb3J0aW5nIGZpbGVzLi4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5pbXBvcnRGaWxlcyhuZXdJdGVtQ29udGV4dCwgZm9sZGVySWRzLCAkc2NvcGUubW9kZWwuZHJvcHBlZEZpbGVzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmluZm8oJ0ZpbmlzaGVkIGltcG9ydGluZyBmaWxlcyEnLCB7dHRsOiAxMDB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcihyZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bFtpbmZvLnR5cGVdKGluZm8ubWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5uZXdJdGVtRm9ybS5leHBhbmRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tb2RlbC5kcm9wcGVkRmlsZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5uZXdJdGVtRm9ybS5leHBhbmRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubW9kZWwuZHJvcHBlZEZpbGVzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGZpbHRlcjoge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcclxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNvbmZpZyA9IGNvbmZpZztcclxuXHJcbiAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0gPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgd29ya3NwYWNlSXRlbTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VJdGVtcy5oYXNPd25Qcm9wZXJ0eShkYXRhLmlkKSkge1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbSA9IHdvcmtzcGFjZUl0ZW1zW2RhdGEuaWRdO1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbS50aXRsZSA9IGRhdGEubmFtZTtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0uZGVzY3JpcHRpb24gPSBkYXRhLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogZGF0YS5pZCxcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdPcGVuIFdvcmtzcGFjZScsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTogbmV3IERhdGUoKSwgLy8gVE9ETzogZ2V0IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogJ04vQScgLy8gVE9ETzogZ2V0IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ0NvbXBvbmVudHMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtcHV6emxlLXBpZWNlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdEZXNpZ24gU3BhY2VzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLWN1YmVzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdUZXN0IGJlbmNoZXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zYXZlZCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnUmVxdWlyZW1lbnRzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLWJhci1jaGFydC1vJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJdGVtLmlkXSA9IHdvcmtzcGFjZUl0ZW07XHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHdvcmtzcGFjZUl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYWRkQ291bnRXYXRjaGVycyA9IGZ1bmN0aW9uICh3b3Jrc3BhY2VJZCkge1xyXG4gICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZDb21wb25lbnRzKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBmdW5jdGlvbiAodXBkYXRlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZURhdGEgPSB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJZF07XHJcbiAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMF0udmFsdWUgPSB1cGRhdGVEYXRhLmRhdGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMF0udmFsdWUgPSBkYXRhLmNvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZEZXNpZ25zKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBmdW5jdGlvbiAodXBkYXRlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZURhdGEgPSB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJZF07XHJcbiAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMV0udmFsdWUgPSB1cGRhdGVEYXRhLmRhdGE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbMV0udmFsdWUgPSBkYXRhLmNvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlcyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzJdLnZhbHVlID0gdXBkYXRlRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzJdLnZhbHVlID0gZGF0YS5jb3VudDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgIC8vIGluaXRpYWxpemUgYWxsIHZhcmlhYmxlc1xyXG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xyXG4gICAgICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogaXRlbXNcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgd29ya3NwYWNlSXRlbXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnZGVzdHJveSBldmVudCByYWlzZWQnKTtcclxuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGRpc3BsYXkgdGhpcyB0byB0aGUgdXNlci5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyIC0gaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaFdvcmtzcGFjZXMoY29udGV4dCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZENvdW50V2F0Y2hlcnModXBkYXRlT2JqZWN0LmlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndW5sb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VJdGVtcy5oYXNPd25Qcm9wZXJ0eSh1cGRhdGVPYmplY3QuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaXRlbXMubWFwKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuaW5kZXhPZih1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZkNvbXBvbmVudHNfJyArIHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mRGVzaWduc18nICsgdXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5jbGVhblVwUmVnaW9uKGNvbnRleHQsIGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlc18nICsgdXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdvcmtzcGFjZUl0ZW1zW3VwZGF0ZU9iamVjdC5pZF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlSWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAod29ya3NwYWNlSWQgaW4gZGF0YS53b3Jrc3BhY2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLndvcmtzcGFjZXMuaGFzT3duUHJvcGVydHkod29ya3NwYWNlSWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbShkYXRhLndvcmtzcGFjZXNbd29ya3NwYWNlSWRdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZENvdW50V2F0Y2hlcnMod29ya3NwYWNlSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgLmNvbnRyb2xsZXIoJ1dvcmtzcGFjZUVkaXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIGRhdGEpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICBuYW1lOiBkYXRhLm5hbWVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUub2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCRzY29wZS5kYXRhKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcclxuICAgICAgICB9O1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ3dvcmtzcGFjZUxpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Xb3Jrc3BhY2VMaXN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnV29ya3NwYWNlTGlzdENvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG4vKipcclxuICogVGhpcyBzZXJ2aWNlIGNvbnRhaW5zIGZ1bmN0aW9uYWxpdHkgc2hhcmVkIGFtb25nc3QgdGhlIGRpZmZlcmVudCBzZXJ2aWNlcy4gSXQgc2hvdWxkIG5vdCBiZSB1c2VkXHJcbiAqIGRpcmVjdGx5IGluIGEgY29udHJvbGxlciAtIG9ubHkgYXMgcGFydCBvZiBvdGhlciBzZXJ2aWNlcy5cclxuICpcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCdiYXNlQ3lQaHlTZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCAkdGltZW91dCwgbm9kZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZ2lzdGVycyBhIHdhdGNoZXIgKGNvbnRyb2xsZXIpIHRvIHRoZSBzZXJ2aWNlLiBDYWxsYmFjayBmdW5jdGlvbiBpcyBjYWxsZWQgd2hlbiBub2RlcyBiZWNvbWUgYXZhaWxhYmxlIG9yXHJcbiAgICAgICAgICogd2hlbiB0aGV5IGJlY2FtZSB1bmF2YWlsYWJsZS4gVGhlc2UgYXJlIGFsc28gY2FsbGVkIGRpcmVjdGx5IHdpdGggdGhlIHN0YXRlIG9mIHRoZSBub2RlU2VydmljZS5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd2F0Y2hlcnMgLSBXYXRjaGVycyBmcm9tIHRoZSBzZXJ2aWNlIHV0aWxpemluZyB0aGlzIGZ1bmN0aW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LmRiIC0gRGF0YWJhc2UgY29ubmVjdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5yZWdpb25JZCAtIFJlZ2lvbiBvZiB0aGUgY29udHJvbGxlciAoYWxsIHNwYXduZWQgcmVnaW9ucyBhcmUgZ3JvdXBlZCBieSB0aGlzKS5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiAtIENhbGxlZCB3aXRoIHRydWUgd2hlbiB0aGVyZSBhcmUgbm8gbm9kZXMgdW5hdmFpbGFibGUgYW5kIGZhbHNlIHdoZW4gdGhlcmUgYXJlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJXYXRjaGVyID0gZnVuY3Rpb24gKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBmbikge1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5vbihwYXJlbnRDb250ZXh0LmRiLCAnaW5pdGlhbGl6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGVub3VnaCwgdGhlIHJlZ2lvbnMgd2lsbCBiZSBjbGVhbmVkIHVwIGluIG5vZGVTZXJ2aWNlLlxyXG4gICAgICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGZuKGZhbHNlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLm9uKHBhcmVudENvbnRleHQuZGIsICdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgYmUgZW5vdWdoLCB0aGUgcmVnaW9ucyBzaG91bGQgYmUgY2xlYW5lZCB1cCBpbiBub2RlU2VydmljZS5cclxuICAgICAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZuKHRydWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIGFsbCB3YXRjaGVycyBzcGF3bmVkIGZyb20gcGFyZW50Q29udGV4dCwgdGhpcyBzaG91bGQgdHlwaWNhbGx5IGJlIGludm9rZWQgd2hlbiB0aGUgY29udHJvbGxlciBpcyBkZXN0cm95ZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdhdGNoZXJzIC0gV2F0Y2hlcnMgZnJvbSB0aGUgc2VydmljZSB1dGlsaXppbmcgdGhpcyBmdW5jdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5yZWdpb25JZCAtIFJlZ2lvbiBvZiB0aGUgY29udHJvbGxlciAoYWxsIHNwYXduZWQgcmVnaW9ucyBhcmUgZ3JvdXBlZCBieSB0aGlzKS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBBbGxSZWdpb25zID0gZnVuY3Rpb24gKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZFdhdGNoZXJzLFxyXG4gICAgICAgICAgICAgICAga2V5O1xyXG4gICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkV2F0Y2hlcnMgPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGNoaWxkV2F0Y2hlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRXYXRjaGVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY2hpbGRXYXRjaGVyc1trZXldLmRiLCBjaGlsZFdhdGNoZXJzW2tleV0ucmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOb3RoaW5nIHRvIGNsZWFuLXVwLi4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgc3BlY2lmaWVkIHdhdGNoZXIgKHJlZ2lvbklkKVxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3YXRjaGVycyAtIFdhdGNoZXJzIGZyb20gdGhlIHNlcnZpY2UgdXRpbGl6aW5nIHRoaXMgZnVuY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQuZGIgLSBEYXRhYmFzZSBjb25uZWN0aW9uIG9mIGJvdGggcGFyZW50IGFuZCByZWdpb24gdG8gYmUgZGVsZXRlZC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5yZWdpb25JZCAtIFJlZ2lvbiBvZiB0aGUgY29udHJvbGxlciAoYWxsIHNwYXduZWQgcmVnaW9ucyBhcmUgZ3JvdXBlZCBieSB0aGlzKS5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVnaW9uSWQgLSBSZWdpb24gaWQgb2YgdGhlIHNwYXduZWQgcmVnaW9uIHRoYXQgc2hvdWxkIGJlIGRlbGV0ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwUmVnaW9uID0gZnVuY3Rpb24gKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xyXG4gICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgIGlmICh3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5jbGVhblVwUmVnaW9uKHBhcmVudENvbnRleHQuZGIsIHJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bcmVnaW9uSWRdO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90aGluZyB0byBjbGVhbi11cC4uJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2Fubm90IGNsZWFuLXVwIHJlZ2lvbiBzaW5jZSBwYXJlbnRDb250ZXh0IGlzIG5vdCByZWdpc3RlcmVkLi4nLCBwYXJlbnRDb250ZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2YgYSBub2RlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGNvbXBvbmVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBjb21wb25lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQucmVnaW9uSWQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFBhdGggdG8gbm9kZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gYXR0cnMgLSBLZXlzIGFyZSBuYW1lcyBvZiBhdHRyaWJ1dGVzIGFuZCB2YWx1ZXMgYXJlIHRoZSB3YW50ZWQgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zZXROb2RlQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChjb250ZXh0LCBpZCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGF0dHJzKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdubyBhdHRyaWJ1dGUgdG8gdXBkYXRlJyk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgaWQpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAobm9kZU9iaikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYXR0cnMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyID0ga2V5cy5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEF0dHIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlT2JqLnNldEF0dHJpYnV0ZShrZXlzW2NvdW50ZXJdLCBhdHRyc1trZXlzW2NvdW50ZXJdXSwgJ3dlYkN5UGh5IC0gc2V0Tm9kZUF0dHJpYnV0ZXMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0QXR0cigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0QXR0cigpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKiogVE9ETzogV2F0Y2ggZG9tYWluUG9ydHMgaW5zaWRlIENvbm5lY3RvcnNcclxuICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgaW50ZXJmYWNlcyAoUHJvcGVydGllcywgQ29ubmVjdG9ycyBhbmQgRG9tYWluUG9ydHMpIG9mIGEgbW9kZWwuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdhdGNoZXJzIC0gV2F0Y2hlcnMgZnJvbSB0aGUgc2VydmljZSB1dGlsaXppbmcgdGhpcyBmdW5jdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBQYXRoIHRvIG1vZGVsLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoSW50ZXJmYWNlcyA9IGZ1bmN0aW9uICh3YXRjaGVycywgcGFyZW50Q29udGV4dCwgaWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoSW50ZXJmYWNlc18nICsgaWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcclxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSwgLy9wcm9wZXJ0eTogIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkYXRhVHlwZTogPHN0cmluZz4sIHZhbHVlVHlwZSA8c3RyaW5nPiwgZGVyaXZlZCA8Ym9vbGVhbj59XHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdG9yczoge30sIC8vY29ubmVjdG9yOiB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZG9tYWluUG9ydHM6IDxvYmplY3Q+IH1cclxuICAgICAgICAgICAgICAgICAgICBwb3J0czoge30gICAgICAgLy9wb3J0OiAgICAgIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCB0eXBlOiA8c3RyaW5nPiwgY2xhc3M6IDxzdHJpbmc+IH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblByb3BlcnR5VXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEYXRhVHlwZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdEYXRhVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZVR5cGUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnVmFsdWVUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlcml2ZWQgPSBpc1Byb3BlcnR5RGVyaXZlZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLnByb3BlcnRpZXNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wcm9wZXJ0aWVzW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEYXRhVHlwZSAhPT0gZGF0YS5wcm9wZXJ0aWVzW2lkXS5kYXRhVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbaWRdLmRhdGFUeXBlID0gbmV3RGF0YVR5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsdWVUeXBlICE9PSBkYXRhLnByb3BlcnRpZXNbaWRdLnZhbHVlVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbaWRdLnZhbHVlVHlwZSA9IG5ld1ZhbHVlVHlwZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEZXJpdmVkICE9PSBkYXRhLnByb3BlcnRpZXNbaWRdLmRlcml2ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wcm9wZXJ0aWVzW2lkXS5kZXJpdmVkID0gbmV3RGVyaXZlZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblByb3BlcnR5VW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEucHJvcGVydGllc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uQ29ubmVjdG9yVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEuY29ubmVjdG9yc1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbm5lY3RvcnNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uQ29ubmVjdG9yVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuY29ubmVjdG9yc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uUG9ydFVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VHlwZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NsYXNzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0NsYXNzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5wb3J0c1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnBvcnRzW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdUeXBlICE9PSBkYXRhLnBvcnRzW2lkXS5kYXRhVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnBvcnRzW2lkXS50eXBlID0gbmV3VHlwZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdDbGFzcyAhPT0gZGF0YS5wb3J0c1tpZF0uY2xhc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wb3J0c1tpZF0uY2xhc3MgPSBuZXdDbGFzcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblBvcnRVbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5wb3J0c1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGlzUHJvcGVydHlEZXJpdmVkID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5nZXRDb2xsZWN0aW9uUGF0aHMoJ2RzdCcpLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG1vZGVsTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbE5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IGNoaWxkTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuUHJvcGVydHkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0RhdGFUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1ZhbHVlVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVyaXZlZDogaXNQcm9wZXJ0eURlcml2ZWQoY2hpbGROb2RlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25Qcm9wZXJ0eVVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblByb3BlcnR5VW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Db25uZWN0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29ubmVjdG9yc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluUG9ydHM6IHt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvbkNvbm5lY3RvclVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvbkNvbm5lY3RvclVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL3F1ZXVlTGlzdC5wdXNoKGNoaWxkTm9kZS5sb2FkQ2hpbGRyZW4oY2hpbGROb2RlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuRG9tYWluUG9ydCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wb3J0c1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0NsYXNzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uUG9ydFVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblBvcnRVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9xdWV1ZUxpc3QucHVzaChjaGlsZE5vZGUubG9hZENoaWxkcmVuKGNoaWxkTm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Qcm9wZXJ0eSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wcm9wZXJ0aWVzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0RhdGFUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVR5cGU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnVmFsdWVUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXJpdmVkOiBpc1Byb3BlcnR5RGVyaXZlZChuZXdDaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25Qcm9wZXJ0eVVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uUHJvcGVydHlVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbm5lY3RvcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25uZWN0b3JzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblBvcnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvbkNvbm5lY3RvclVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uQ29ubmVjdG9yVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjaGlsZElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL3F1ZXVlTGlzdC5wdXNoKGNoaWxkTm9kZS5sb2FkQ2hpbGRyZW4oY2hpbGROb2RlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Eb21haW5Qb3J0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnBvcnRzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnQ2xhc3MnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblBvcnRVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblBvcnRVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cclxuXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ2NvbXBvbmVudFNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsICR0aW1lb3V0LCBub2RlU2VydmljZSwgYmFzZUN5UGh5U2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgd2F0Y2hlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgY29tcG9uZW50IGZyb20gdGhlIGNvbnRleHQgKGRiL3Byb2plY3QvYnJhbmNoKS5cclxuICAgICAgICAgKiBAcGFyYW0gY29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciwgTi5CLiBkb2VzIG5vdCBuZWVkIHRvIHNwZWNpZnkgcmVnaW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSBjb21wb25lbnRJZFxyXG4gICAgICAgICAqIEBwYXJhbSBbbXNnXSAtIENvbW1pdCBtZXNzYWdlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZGVsZXRlQ29tcG9uZW50ID0gZnVuY3Rpb24gKGNvbnRleHQsIGNvbXBvbmVudElkLCBtc2cpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBtc2cgfHwgJ0NvbXBvbmVudFNlcnZpY2UuZGVsZXRlQ29tcG9uZW50ICcgKyBjb21wb25lbnRJZDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZGVzdHJveU5vZGUoY29udGV4dCwgY29tcG9uZW50SWQsIG1lc3NhZ2UpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIGdpdmVuIGF0dHJpYnV0ZXNcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBjb21wb25lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LnJlZ2lvbklkIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGNvbXBvbmVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29tcG9uZW50SWQgLSBQYXRoIHRvIGNvbXBvbmVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gYXR0cnMgLSBLZXlzIGFyZSBuYW1lcyBvZiBhdHRyaWJ1dGVzIGFuZCB2YWx1ZXMgYXJlIHRoZSB3YW50ZWQgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zZXRDb21wb25lbnRBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGNvbnRleHQsIGNvbXBvbmVudElkLCBhdHRycykge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS5zZXROb2RlQXR0cmlidXRlcyhjb250ZXh0LCBjb21wb25lbnRJZCwgYXR0cnMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGFsbCBjb21wb25lbnRzIChleGlzdGVuY2UgYW5kIHRoZWlyIGF0dHJpYnV0ZXMpIG9mIGEgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB3b3Jrc3BhY2VJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuICBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLmNvbXBvbmVudHMuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGF2bUlkcyAtIEFuIG9wdGlvbmFsIGZpbHRlciB0aGF0IG9ubHkgd2F0Y2hlcyBjb21wb25lbnRzIHdpdGggSURzIHRoYXQgZXZhbHVhdGVzIHRvIHRydWUuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaENvbXBvbmVudHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIGF2bUlkcywgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hDb21wb25lbnRzJyxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czoge30gLy8gY29tcG9uZW50IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICBhdm1JZDogPHN0cmluZz4sIHJlc291cmNlOiA8aGFzaHxzdHJpbmc+LCBjbGFzc2lmaWNhdGlvbnM6IDxzdHJpbmc+IH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0F2bUlEID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Jlc291cmNlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1Jlc291cmNlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NsYXNzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0NsYXNzaWZpY2F0aW9ucycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEuY29tcG9uZW50c1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlc2MgIT09IGRhdGEuY29tcG9uZW50c1tpZF0uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2lkXS5kZXNjcmlwdGlvbiA9IG5ld0Rlc2M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3QXZtSUQgIT09IGRhdGEuY29tcG9uZW50c1tpZF0uYXZtSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2lkXS5hdm1JZCA9IG5ld0F2bUlEO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1Jlc291cmNlICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLnJlc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0ucmVzb3VyY2UgPSBuZXdSZXNvdXJjZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdDbGFzcyAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5jbGFzc2lmaWNhdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2lkXS5jbGFzc2lmaWNhdGlvbnMgPSBuZXdDbGFzcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignQ29tcG9uZW50U2VydmljZSBmb3VuZCB1cGRhdGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEuY29tcG9uZW50c1tpZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuY29tcG9uZW50c1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudElkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhdm1JZHMgfHwgYXZtSWRzLmhhc093blByb3BlcnR5KGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lEJykpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tjb21wb25lbnRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWQ6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnUmVzb3VyY2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzaWZpY2F0aW9uczogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnQ2xhc3NpZmljYXRpb25zJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYXZtSWRzIHx8IGF2bUlkcy5oYXNPd25Qcm9wZXJ0eShuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lEJykpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tjb21wb25lbnRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2bUlkOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdSZXNvdXJjZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NpZmljYXRpb25zOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0NsYXNzaWZpY2F0aW9ucycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNvbXBvbmVudElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY29tcG9uZW50c1tjb21wb25lbnRJZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFDTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBkb21haW4tbW9kZWxzIG9mIGEgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSBjb21wb25lbnRJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaENvbXBvbmVudERvbWFpbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgY29tcG9uZW50SWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29tcG9uZW50RG9tYWluc18nICsgY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICBkb21haW5Nb2RlbHM6IHt9ICAgLy9kb21haW5Nb2RlbDogaWQ6IDxzdHJpbmc+LCB0eXBlOiA8c3RyaW5nPlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uRG9tYWluTW9kZWxVcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VHlwZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VHlwZSAhPT0gZGF0YS5kb21haW5Nb2RlbHNbaWRdLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kb21haW5Nb2RlbHNbaWRdLnR5cGUgPSBuZXdUeXBlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uRG9tYWluTW9kZWxVbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5kb21haW5Nb2RlbHNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBjb21wb25lbnRJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29tcG9uZW50Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnROb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRvbWFpbk1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRvbWFpbk1vZGVsc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVHlwZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvbkRvbWFpbk1vZGVsVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uRG9tYWluTW9kZWxVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuRG9tYWluTW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZG9tYWluTW9kZWxzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ1R5cGUnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvbkRvbWFpbk1vZGVsVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25Eb21haW5Nb2RlbFVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY2hpbGRJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLndhdGNoSW50ZXJmYWNlcy5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoSW50ZXJmYWNlcyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBpZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJhc2VDeVBoeVNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBpZCwgdXBkYXRlTGlzdGVuZXIpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcEFsbFJlZ2lvbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCkge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24od2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIHJlZ2lvbklkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoZXIgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZm4pIHtcclxuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGZuKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ0NvbnRleHQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5sb2dDb250ZXh0KGNvbnRleHQpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgV2ViR01FR2xvYmFsKi9cclxuXHJcbi8qKlxyXG4gKiBUaGlzIHNlcnZpY2UgY29udGFpbnMgbWV0aG9kcyBmb3IgZGVzaWduIHNwYWNlIGV4cGxvcmF0aW9uIHRocm91Z2ggdGhlIEV4ZWN1dG9yIENsaWVudC5cclxuICpcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ2Rlc2VydFNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsICRpbnRlcnZhbCwgZmlsZVNlcnZpY2UsIGV4ZWN1dG9yU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIENNRFNUUixcclxuICAgICAgICAgICAgeG1sVG9Kc29uID0gbmV3IFdlYkdNRUdsb2JhbC5jbGFzc2VzLkNvbnZlcnRlcnMuWG1sMmpzb24oe1xyXG4gICAgICAgICAgICAgICAgc2tpcFdTVGV4dDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFycmF5RWxlbWVudHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBDb25maWd1cmF0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIEVsZW1lbnQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgTmF0dXJhbE1lbWJlcjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBBbHRlcm5hdGl2ZUFzc2lnbm1lbnQ6IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIGpzb25Ub1htbCA9IG5ldyBXZWJHTUVHbG9iYWwuY2xhc3Nlcy5Db252ZXJ0ZXJzLkpzb24yeG1sKCk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoZGVzZXJ0SW5wdXQpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICgoZGVzZXJ0SW5wdXQuZGVzZXJ0U3lzdGVtICYmIGFuZ3VsYXIuaXNPYmplY3QoZGVzZXJ0SW5wdXQuZGVzZXJ0U3lzdGVtKSAmJlxyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5pc09iamVjdChkZXNlcnRJbnB1dC5pZE1hcCkpID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdkZXNlcnRJbnB1dCBtdXN0IGNvbnRhaW4gYSBkZXNlcnRTeXN0ZW0gYW5kIGlkTWFwIG9iamVjdCEnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzZWxmLnNhdmVEZXNlcnRJbnB1dChkZXNlcnRJbnB1dC5kZXNlcnRTeXN0ZW0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaW5wdXRIYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NhdmVkIGRlc2VydElucHV0JywgZmlsZVNlcnZpY2UuZ2V0RG93bmxvYWRVcmwoaW5wdXRIYXNoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuY3JlYXRlQW5kUnVuSm9iKGlucHV0SGFzaCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGpvYkluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSm9iIHN1Y2NlZWRlZCBmaW5hbCBqb2JJbmZvJywgam9iSW5mbyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZXh0cmFjdENvbmZpZ3VyYXRpb25zKGpvYkluZm8sIGRlc2VydElucHV0LmlkTWFwKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29uZmlndXJhdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNvbmZpZ3VyYXRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnQ2FsY3VsYXRpbmcgY29uZmlndXJhdGlvbnMgZmFpbGVkLCBlcnI6ICcgKyBlcnIudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2F2ZURlc2VydElucHV0ID0gZnVuY3Rpb24gKGRlc2VydFN5c3RlbSkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgYXJ0aWZhY3QsXHJcbiAgICAgICAgICAgICAgICB4bWxTdHJpbmc7XHJcblxyXG4gICAgICAgICAgICBhcnRpZmFjdCA9IGZpbGVTZXJ2aWNlLmNyZWF0ZUFydGlmYWN0KCdkZXNlcnQtaW5wdXQnKTtcclxuICAgICAgICAgICAgeG1sU3RyaW5nID0ganNvblRvWG1sLmNvbnZlcnRUb1N0cmluZyhkZXNlcnRTeXN0ZW0pO1xyXG5cclxuICAgICAgICAgICAgZmlsZVNlcnZpY2UuYWRkRmlsZUFzU29mdExpbmtUb0FydGlmYWN0KGFydGlmYWN0LCAnZGVzZXJ0SW5wdXQueG1sJywgeG1sU3RyaW5nKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGhhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZXhlY0NvbmZpZyA9IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNtZDogJ3J1bl9kZXNlcnQuY21kJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdEFydGlmYWN0czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2FsbCcsIHJlc3VsdFBhdHRlcm5zOiBbXSB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIG51bGwsIDQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlc1RvQWRkID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2V4ZWN1dG9yX2NvbmZpZy5qc29uJzogZXhlY0NvbmZpZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdydW5fZGVzZXJ0LmNtZCc6IENNRFNUUlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWxlU2VydmljZS5hZGRGaWxlc1RvQXJ0aWZhY3QoYXJ0aWZhY3QsIGZpbGVzVG9BZGQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChoYXNoZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsZVNlcnZpY2Uuc2F2ZUFydGlmYWN0KGFydGlmYWN0KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoYXJ0aWVIYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShhcnRpZUhhc2gpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdDb3VsZCBub3Qgc2F2ZSBEZXNlcnRJbnB1dCB0byBibG9iLCBlcnI6IFwiJyArIHJlYXNvbiArICdcIicpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZUFuZFJ1bkpvYiA9IGZ1bmN0aW9uIChpbnB1dEhhc2gpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgZXhlY3V0b3JTZXJ2aWNlLmNyZWF0ZUpvYih7aGFzaDogaW5wdXRIYXNoLCBsYWJlbHM6IFtdfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcDtcclxuICAgICAgICAgICAgICAgICAgICBzdG9wID0gJGludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhlY3V0b3JTZXJ2aWNlLmdldEluZm8oaW5wdXRIYXNoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGpvYkluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oSlNPTi5zdHJpbmdpZnkoam9iSW5mbywgbnVsbCwgNCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqb2JJbmZvLnN0YXR1cyA9PT0gJ0NSRUFURUQnIHx8IGpvYkluZm8uc3RhdHVzID09PSAnUlVOTklORycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHN0b3ApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqb2JJbmZvLnN0YXR1cyA9PT0gJ1NVQ0NFU1MnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoam9iSW5mbyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KEpTT04uc3RyaW5naWZ5KGpvYkluZm8sIG51bGwsIDQpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHN0b3ApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnQ291bGQgbm90IG9idGFpbiBqb2JJbmZvIGZvciBkZXNlcnQnICsgZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0NvdWxkIG5vdCBjcmVhdGUgam9iJyArIGVycik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZXh0cmFjdENvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKGpvYkluZm8sIGlkTWFwKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGlmICgoam9iSW5mby5yZXN1bHRIYXNoZXMgJiYgam9iSW5mby5yZXN1bHRIYXNoZXMuYWxsKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnSm9iSW5mbyBkaWQgbm90IGNvbnRhaW4gcmVzdWx0SGFzaGVzLmFsbCcpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZmlsZVNlcnZpY2UuZ2V0TWV0YWRhdGEoam9iSW5mby5yZXN1bHRIYXNoZXMuYWxsKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG1ldGFkYXRhKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBEZWFsIHdpdGggY29uZmlncyB3aGVuIHRoZXJlJ3MgY29uc3RyYWludHNcclxuLy8gICAgICAgICAgICAgICAgICAgIGlmICghbWV0YWRhdGEuY29udGVudC5oYXNPd25Qcm9wZXJ0eSgnZGVzZXJ0SW5wdXRfY29uZmlncy54bWwnKSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnRGVzZXJ0IGRpZCBub3QgZ2VuZXJhdGUgYSBcImRlc2VydElucHV0X2NvbmZpZ3MueG1sXCIuJyk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWV0YWRhdGEuY29udGVudC5oYXNPd25Qcm9wZXJ0eSgnZGVzZXJ0SW5wdXRfYmFjay54bWwnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0Rlc2VydCBkaWQgbm90IGdlbmVyYXRlIGEgZGVzZXJ0SW5wdXRfYmFjay54bWwuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWxlU2VydmljZS5nZXRPYmplY3QobWV0YWRhdGEuY29udGVudFsnZGVzZXJ0SW5wdXRfYmFjay54bWwnXS5jb250ZW50KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZXNlcnRPYmplY3QgPSB4bWxUb0pzb24uY29udmVydEZyb21CdWZmZXIoY29udGVudCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2VydEJhY2tTeXN0ZW0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGosXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGssXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNmZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0QXNzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1JZFRvUGF0aCA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVzZXJ0T2JqZWN0IGluc3RhbmNlb2YgRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdPdXRwdXQgZGVzZXJ0IFhNTCBub3QgdmFsaWQgeG1sLCBlcnI6ICcgKyBkZXNlcnRPYmplY3QubWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZGVzZXJ0QmFja1N5c3RlbSA9IGRlc2VydE9iamVjdC5EZXNlcnRCYWNrU3lzdGVtO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVzZXJ0QmFja1N5c3RlbS5FbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBkZXNlcnRCYWNrU3lzdGVtLkVsZW1lbnQubGVuZ3RoOyBqICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0gPSBkZXNlcnRCYWNrU3lzdGVtLkVsZW1lbnRbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtSWRUb1BhdGhbZWxlbVsnQF9pZCddXSA9IGlkTWFwW2VsZW1bJ0BleHRlcm5hbElEJ11dO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBkZXNlcnRCYWNrU3lzdGVtLkNvbmZpZ3VyYXRpb24ubGVuZ3RoOyBqICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnID0gZGVzZXJ0QmFja1N5c3RlbS5Db25maWd1cmF0aW9uW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNmZ1snQG5hbWUnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjZmdbJ0BpZCddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZ3VyYXRpb25zW2NvbmZpZ3VyYXRpb25zLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2ZnLkFsdGVybmF0aXZlQXNzaWdubWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChrID0gMDsgayA8IGNmZy5BbHRlcm5hdGl2ZUFzc2lnbm1lbnQubGVuZ3RoOyBrICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRBc3MgPSBjZmcuQWx0ZXJuYXRpdmVBc3NpZ25tZW50W2tdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5hbHRlcm5hdGl2ZUFzc2lnbm1lbnRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEFsdGVybmF0aXZlOiBlbGVtSWRUb1BhdGhbYWx0QXNzWydAYWx0ZXJuYXRpdmVfZW5kXyddXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVPZjogZWxlbUlkVG9QYXRoW2FsdEFzc1snQGFsdGVybmF0aXZlX29mX2VuZF8nXV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNvbmZpZ3VyYXRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVDb25maWd1cmF0aW9uc0R1bW15ID0gZnVuY3Rpb24gKGRlc2VydElucHV0KSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBpbnB1dEFydGlmYWN0LFxyXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJDb25mLiBubzogMVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRBbHRlcm5hdGl2ZTogXCIvMjEzMDAxNzgzNC81NDI1NzE0OTQvMTY0NjA1OTQyMi81NjQzMTIxNDgvOTEwNzM4MTVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZU9mOiBcIi8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiQ29uZi4gbm86IDJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQWx0ZXJuYXRpdmU6IFwiLzIxMzAwMTc4MzQvNTQyNTcxNDk0LzE2NDYwNTk0MjIvNTY0MzEyMTQ4LzE0MzM0NzE3ODlcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZU9mOiBcIi8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IDMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiQ29uZi4gbm86IDNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQWx0ZXJuYXRpdmU6IFwiLzIxMzAwMTc4MzQvNTQyNTcxNDk0LzE2NDYwNTk0MjIvNTY0MzEyMTQ4LzE0OTM5MDcyNjRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZU9mOiBcIi8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IDQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiQ29uZi4gbm86IDRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQWx0ZXJuYXRpdmU6IFwiLzIxMzAwMTc4MzQvNTQyNTcxNDk0LzE2NDYwNTk0MjIvNTY0MzEyMTQ4LzE3Njc1MjE2MjFcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZU9mOiBcIi8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShjb25maWd1cmF0aW9ucyk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0RGVzZXJ0SW5wdXREYXRhID0gZnVuY3Rpb24gKGRlc2lnblN0cnVjdHVyZURhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRlc2VydFN5c3RlbSxcclxuICAgICAgICAgICAgICAgIGlkTWFwID0ge30sXHJcbiAgICAgICAgICAgICAgICBpZENvdW50ZXIgPSA0LFxyXG4gICAgICAgICAgICAgICAgcm9vdENvbnRhaW5lciA9IGRlc2lnblN0cnVjdHVyZURhdGEuY29udGFpbmVyc1tkZXNpZ25TdHJ1Y3R1cmVEYXRhLnJvb3RJZF0sXHJcbiAgICAgICAgICAgICAgICBwb3B1bGF0ZURhdGFSZWMgPSBmdW5jdGlvbiAoY29udGFpbmVyLCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gY29udGFpbmVyLmNvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5jb21wb25lbnRzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkRGF0YSA9IGNvbnRhaW5lci5jb21wb25lbnRzW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZENvdW50ZXIgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gaWRDb3VudGVyLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZE1hcFtpZF0gPSBjaGlsZERhdGEuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LkVsZW1lbnQucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BfaWQnOiAnaWQnICsgaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BkZWNvbXBvc2l0aW9uJzogJ2ZhbHNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGV4dGVybmFsSUQnOiBpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGlkJzogaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BuYW1lJzogY2hpbGREYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0VsZW1lbnQnOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gY29udGFpbmVyLnN1YkNvbnRhaW5lcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5zdWJDb250YWluZXJzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkRGF0YSA9IGNvbnRhaW5lci5zdWJDb250YWluZXJzW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZENvdW50ZXIgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gaWRDb3VudGVyLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZE1hcFtpZF0gPSBjaGlsZERhdGEuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LkVsZW1lbnQucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BfaWQnOiAnaWQnICsgaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BkZWNvbXBvc2l0aW9uJzogKGNoaWxkRGF0YS50eXBlID09PSAnQ29tcG91bmQnKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAZXh0ZXJuYWxJRCc6IGlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAaWQnOiBpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQG5hbWUnOiBjaGlsZERhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRWxlbWVudCc6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVsYXRlRGF0YVJlYyhjaGlsZERhdGEsIGVsZW1lbnQuRWxlbWVudFtlbGVtZW50LkVsZW1lbnQubGVuZ3RoIC0gMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZGVzZXJ0U3lzdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgJ0Rlc2VydFN5c3RlbSc6IHtcclxuICAgICAgICAgICAgICAgICAgICAnQHhtbG5zOnhzaSc6ICdodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZScsXHJcbiAgICAgICAgICAgICAgICAgICAgJ0BTeXN0ZW1OYW1lJzogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgJ0B4c2k6bm9OYW1lc3BhY2VTY2hlbWFMb2NhdGlvbic6ICdEZXNlcnRJZmFjZS54c2QnLFxyXG4gICAgICAgICAgICAgICAgICAgICdDb25zdHJhaW50U2V0Jzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQF9pZCc6ICdpZDEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQGV4dGVybmFsSUQnOiAnMScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdAaWQnOiAnMScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdAbmFtZSc6ICdjb25zdHJhaW50cydcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICdGb3JtdWxhU2V0Jzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQF9pZCc6ICdpZDInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQGV4dGVybmFsSUQnOiAnMicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdAaWQnOiAnMicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdAbmFtZSc6ICdmb3JtdWxhU2V0J1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgJ1NwYWNlJzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQF9pZCc6ICdpZDMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQGRlY29tcG9zaXRpb24nOiAndHJ1ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdAZXh0ZXJuYWxJRCc6ICczJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BpZCc6ICczJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BuYW1lJzogJ0Rlc2lnblNwYWNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0VsZW1lbnQnOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BfaWQnOiAnaWQ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGRlY29tcG9zaXRpb24nOiAndHJ1ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BleHRlcm5hbElEJzogJzQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAaWQnOiAnNCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BuYW1lJzogcm9vdENvbnRhaW5lci5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdFbGVtZW50JzogW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcG9wdWxhdGVEYXRhUmVjKHJvb3RDb250YWluZXIsIGRlc2VydFN5c3RlbS5EZXNlcnRTeXN0ZW0uU3BhY2UuRWxlbWVudFswXSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4geyBkZXNlcnRTeXN0ZW06IGRlc2VydFN5c3RlbSwgaWRNYXA6IGlkTWFwIH07XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgQ01EU1RSID0gW1xyXG4gICAgICAgICAgICAnOjogUnVucyA8LURlc2VydFRvb2xzLmV4ZS0+IGRlc2VydElucHV0LnhtbCAvbScsXHJcbiAgICAgICAgICAgICdFQ0hPIG9mZicsXHJcbiAgICAgICAgICAgICdwdXNoZCAlfmRwMCcsXHJcbiAgICAgICAgICAgICclU3lzdGVtUm9vdCVcXFxcU3lzV29XNjRcXFxcUkVHLmV4ZSBxdWVyeSBcIkhLTE1cXFxcc29mdHdhcmVcXFxcTUVUQVwiIC92IFwiTUVUQV9QQVRIXCInLFxyXG4gICAgICAgICAgICAnU0VUIFFVRVJZX0VSUk9STEVWRUw9JUVSUk9STEVWRUwlJyxcclxuICAgICAgICAgICAgJ0lGICVRVUVSWV9FUlJPUkxFVkVMJSA9PSAwICgnLFxyXG4gICAgICAgICAgICAnICAgICAgICBGT1IgL0YgXCJza2lwPTIgdG9rZW5zPTIsKlwiICUlQSBJTiAoXFwnJVN5c3RlbVJvb3QlXFxcXFN5c1dvVzY0XFxcXFJFRy5leGUgcXVlcnkgXCJIS0xNXFxcXHNvZnR3YXJlXFxcXE1FVEFcIiAvdiBcIk1FVEFfUEFUSFwiXFwnKSBETyBTRVQgTUVUQV9QQVRIPSUlQiknLFxyXG4gICAgICAgICAgICAnU0VUIERFU0VSVF9FWEU9XCIlTUVUQV9QQVRIJVxcXFxiaW5cXFxcRGVzZXJ0VG9vbC5leGVcIicsXHJcbiAgICAgICAgICAgICcgICBJRiBFWElTVCAlREVTRVJUX0VYRSUgKCcsXHJcbiAgICAgICAgICAgICcgICAgICAgUkVNIEluc3RhbGxlciBtYWNoaW5lLicsXHJcbiAgICAgICAgICAgICcgICAgICAgJURFU0VSVF9FWEUlIGRlc2VydElucHV0LnhtbCAvYyBcImFwcGx5QWxsXCInLFxyXG4gICAgICAgICAgICAnICAgKSBFTFNFIElGIEVYSVNUIFwiJU1FVEFfUEFUSCVcXFxcc3JjXFxcXGJpblxcXFxEZXNlcnRUb29sLmV4ZVwiICgnLFxyXG4gICAgICAgICAgICAnICAgICAgIFJFTSBEZXZlbG9wZXIgbWFjaGluZS4nLFxyXG4gICAgICAgICAgICAnICAgICAgIFwiJU1FVEFfUEFUSCVcXFxcc3JjXFxcXGJpblxcXFxEZXNlcnRUb29sLmV4ZVwiIGRlc2VydElucHV0LnhtbCAvYyBcImFwcGx5QWxsXCInLFxyXG4gICAgICAgICAgICAnICAgKSBFTFNFICgnLFxyXG4gICAgICAgICAgICAnICAgICAgIEVDSE8gb24nLFxyXG4gICAgICAgICAgICAnICAgICAgIEVDSE8gQ291bGQgbm90IGZpbmQgRGVzZXJ0VG9vbC5leGUhJyxcclxuICAgICAgICAgICAgJyAgICAgICBFWElUIC9CIDMnLFxyXG4gICAgICAgICAgICAnICAgKScsXHJcbiAgICAgICAgICAgICcpJyxcclxuICAgICAgICAgICAgJ0lGICVRVUVSWV9FUlJPUkxFVkVMJSA9PSAxICgnLFxyXG4gICAgICAgICAgICAnICAgIEVDSE8gb24nLFxyXG4gICAgICAgICAgICAnRUNITyBcIk1FVEEgdG9vbHMgbm90IGluc3RhbGxlZC5cIiA+PiBfRkFJTEVELnR4dCcsXHJcbiAgICAgICAgICAgICdFQ0hPIFwiU2VlIEVycm9yIExvZzogX0ZBSUxFRC50eHRcIicsXHJcbiAgICAgICAgICAgICdFWElUIC9iICVRVUVSWV9FUlJPUkxFVkVMJScsXHJcbiAgICAgICAgICAgICcpJyxcclxuICAgICAgICAgICAgJ3BvcGQnXS5qb2luKCdcXG4nKTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgnZGVzaWduU2VydmljZScsIGZ1bmN0aW9uICgkcSwgJHRpbWVvdXQsICRsb2NhdGlvbiwgJG1vZGFsLCBncm93bCwgbm9kZVNlcnZpY2UsIGJhc2VDeVBoeVNlcnZpY2UsIHBsdWdpblNlcnZpY2UsIGZpbGVTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgd2F0Y2hlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgdGhpcy5lZGl0RGVzaWduRm4gPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0Rlc2lnbkVkaXQuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnRGVzaWduRWRpdENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgLy9zaXplOiBzaXplLFxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZTogeyBkYXRhOiBmdW5jdGlvbiAoKSB7IHJldHVybiBkYXRhOyB9IH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uIChlZGl0ZWREYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYXR0cnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiBlZGl0ZWREYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgJ0lORk8nOiBlZGl0ZWREYXRhLmRlc2NyaXB0aW9uXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXREZXNpZ25BdHRyaWJ1dGVzKGRhdGEuY29udGV4dCwgZGF0YS5pZCwgYXR0cnMpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXR0cmlidXRlIHVwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmV4cG9ydEFzQWRtRm4gPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICBzZWxmLmV4cG9ydERlc2lnbihkYXRhLmNvbnRleHQsIGRhdGEuaWQpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZG93bmxvYWRVcmwpIHtcclxuICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCdBRE0gZmlsZSBmb3IgPGEgaHJlZj1cIicgKyBkb3dubG9hZFVybCArICdcIj4nICsgZGF0YS5uYW1lICsgJzwvYT4gZXhwb3J0ZWQuJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoJ0V4cG9ydCBmYWlsZWQsIHNlZSBjb25zb2xlIGZvciBkZXRhaWxzLicpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5kZWxldGVGbiA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvU2ltcGxlTW9kYWwuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2ltcGxlTW9kYWxDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZSBEZXNpZ24gU3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogJ1RoaXMgd2lsbCBkZWxldGUgJyArIGRhdGEubmFtZSArICcgZnJvbSB0aGUgd29ya3NwYWNlLidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRlbGV0ZURlc2lnbihkYXRhLmNvbnRleHQsIGRhdGEuaWQpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIGRlc2lnbiBmcm9tIHRoZSBjb250ZXh0LlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gZGF0YS1iYXNlIGNvbm5lY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGRlc2lnbklkIC0gUGF0aCB0byBkZXNpZ24tc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIFttc2ddIC0gQ29tbWl0IG1lc3NhZ2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5kZWxldGVEZXNpZ24gPSBmdW5jdGlvbiAoY29udGV4dCwgZGVzaWduSWQsIG1zZykge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG1zZyB8fCAnZGVzaWduU2VydmljZS5kZWxldGVEZXNpZ24gJyArIGRlc2lnbklkO1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5kZXN0cm95Tm9kZShjb250ZXh0LCBkZXNpZ25JZCwgbWVzc2FnZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlcyB0aGUgZ2l2ZW4gYXR0cmlidXRlc1xyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGRlc2lnbi5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBkZXNpZ24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQucmVnaW9uSWQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgZGVzaWduLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkZXNpZ25JZCAtIFBhdGggdG8gZGVzaWduLXNwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhdHRycyAtIEtleXMgYXJlIG5hbWVzIG9mIGF0dHJpYnV0ZXMgYW5kIHZhbHVlcyBhcmUgdGhlIHdhbnRlZCB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnNldERlc2lnbkF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoY29udGV4dCwgZGVzaWduSWQsIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLnNldE5vZGVBdHRyaWJ1dGVzKGNvbnRleHQsIGRlc2lnbklkLCBhdHRycyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2FsbHMgQWRtRXhwb3J0ZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBDb250ZXh0IGZvciBwbHVnaW4uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBEYXRhYmFzZSBjb25uZWN0aW9uIHRvIHB1bGwgbW9kZWwgZnJvbS5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGVzaWduSWRcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2Rlc2VydENmZ1BhdGhdIC0gUGF0aCB0byBjb25maWd1cmF0aW9uIGlmIG9ubHkgb25lIGlzIHRvIGJlIGV4cG9ydGVkLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIHJlc29sdmVzIHRvIHtzdHJpbmd9IGlmIHN1Y2Nlc3NmdWwuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5leHBvcnREZXNpZ24gPSBmdW5jdGlvbiAoY29udGV4dCwgZGVzaWduSWQsIGRlc2VydENmZ1BhdGgpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlOiBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgICAgICBydW5PblNlcnZlcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjbXM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNlcnRDZmc6IGRlc2VydENmZ1BhdGggfHwgJydcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcGx1Z2luU2VydmljZS5ydW5QbHVnaW4oY29udGV4dCwgJ0FkbUV4cG9ydGVyJywgY29uZmlnKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vXCJ7XCJzdWNjZXNzXCI6dHJ1ZSxcIm1lc3NhZ2VzXCI6W10sXCJhcnRpZmFjdHNcIjpbXSxcInBsdWdpbk5hbWVcIjpcIkFETSBJbXBvcnRlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFwic3RhcnRUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjM4M1pcIixcImZpbmlzaFRpbWVcIjpcIjIwMTQtMTEtMDhUMDI6NTE6MjEuOTM5WlwiLFwiZXJyb3JcIjpudWxsfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZmlsZVNlcnZpY2UuZ2V0RG93bmxvYWRVcmwocmVzdWx0LmFydGlmYWN0c1swXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyZXN1bHQuZXJyb3IgKyAnIG1lc3NhZ2VzOiAnICsgYW5ndWxhci50b0pzb24ocmVzdWx0Lm1lc3NhZ2VzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYW5ndWxhci50b0pzb24ocmVzdWx0Lm1lc3NhZ2VzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nICcgKyByZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5nZW5lcmF0ZURhc2hib2FyZCA9IGZ1bmN0aW9uIChjb250ZXh0LCBkZXNpZ25JZCwgcmVzdWx0SWRzKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcnVuT25TZXJ2ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbkNvbmZpZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRJRHM6IHJlc3VsdElkcy5qb2luKCc7JylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShjb25maWcpKTtcclxuICAgICAgICAgICAgcGx1Z2luU2VydmljZS5ydW5QbHVnaW4oY29udGV4dCwgJ0dlbmVyYXRlRGFzaGJvYXJkJywgY29uZmlnKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHRMaWdodCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogcmVzdWx0LnN1Y2Nlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFydGlmYWN0c0h0bWw6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlczogcmVzdWx0Lm1lc3NhZ2VzXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlc3VsdFwiLCByZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpblNlcnZpY2UuZ2V0UGx1Z2luQXJ0aWZhY3RzSHRtbChyZXN1bHQuYXJ0aWZhY3RzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoYXJ0aWZhY3RzSHRtbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlnaHQuYXJ0aWZhY3RzSHRtbCA9IGFydGlmYWN0c0h0bWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdExpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nLCAnICsgcmVhc29uKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy53YXRjaERlc2lnbk5vZGUgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZGVzaWduSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoRGVzaWduJyxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0YTogbnVsbCwgLy8gTUVUQSBub2RlcyAtIG5lZWRlZCB3aGVuIGNyZWF0aW5nIG5ldyBub2Rlcy4uLlxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2lnbjoge30gLy8gZGVzaWduIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz4sIG5vZGUgPE5vZGVPYmo+fVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLmRlc2lnbi5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlc2MgIT09IGRhdGEuZGVzaWduLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLmRlc2lnbn0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBkZXNpZ25JZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGVzaWduTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm1ldGEgPSBtZXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGRlc2lnbk5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzaWduTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IGRlc2lnbk5vZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbk5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGFsbCBjb250YWluZXJzIChleGlzdGVuY2UgYW5kIHRoZWlyIGF0dHJpYnV0ZXMpIG9mIGEgd29ya3NwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB3b3Jrc3BhY2VJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuIERhdGEgaXMgYW4gb2JqZWN0IGluIGRhdGEuZGVzaWducy5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoRGVzaWducyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hEZXNpZ25zJyxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzaWduczoge30gLy8gZGVzaWduIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz59XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEuZGVzaWduc1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbnNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlc2MgIT09IGRhdGEuZGVzaWduc1tpZF0uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ25zW2lkXS5kZXNjcmlwdGlvbiA9IG5ld0Rlc2M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YS5kZXNpZ25zW2lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5kZXNpZ25zW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbklkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ25zW2Rlc2lnbklkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdJTkZPJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduc1tkZXNpZ25JZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogZGVzaWduSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5kZXNpZ25zW2Rlc2lnbklkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhbGwgY29udGFpbmVycyAoZXhpc3RlbmNlIGFuZCB0aGVpciBhdHRyaWJ1dGVzKSBvZiBhIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGVzaWduSWRcclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaE5ick9mQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZGVzaWduSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTmJyT2ZDb25maWd1cmF0aW9uc18nICsgZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHM6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiAwXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoQ29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uIChjZmdOb2RlLCBtZXRhLCB3YXNDcmVhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNmZ0RlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0T25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMucmVzdWx0cyAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDb3VudCB0aGlzIHNldCBhbmQgYWRkIGFuIHVubG9hZCBoYW5kbGUuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudGVycy5jb25maWd1cmF0aW9ucyArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3YXNDcmVhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY2ZnTm9kZS5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNmZ05vZGUub25VbmxvYWQoZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMuY29uZmlndXJhdGlvbnMgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuUmVzdWx0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMucmVzdWx0cyArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChyZXN1bHRPblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLlJlc3VsdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLnJlc3VsdHMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQocmVzdWx0T25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2ZnRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaENvbmZpZ3VyYXRpb25TZXQgPSBmdW5jdGlvbiAoc2V0Tm9kZSwgbWV0YSwgd2FzQ3JlYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZXREZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ291bnQgdGhpcyBzZXQgYW5kIGFkZCBhbiB1bmxvYWQgaGFuZGxlLlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMuc2V0cyArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3YXNDcmVhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogc2V0Tm9kZS5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNldE5vZGUub25VbmxvYWQoZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMuc2V0cyAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBzZXROb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hDb25maWd1cmF0aW9uKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoQ29uZmlndXJhdGlvbihuZXdDaGlsZCwgbWV0YSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0RGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0RGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldERlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgZGVzaWduSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRlc2lnbk5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uU2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaENvbmZpZ3VyYXRpb25TZXQoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uU2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaENvbmZpZ3VyYXRpb25TZXQobmV3Q2hpbGQsIG1ldGEsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYSBkZXNpZ24oc3BhY2UpIHcuci50LiBpbnRlcmZhY2VzLlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSBkZXNpZ25JZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaEludGVyZmFjZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZGVzaWduSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLndhdGNoSW50ZXJmYWNlcyh3YXRjaGVycywgcGFyZW50Q29udGV4dCwgZGVzaWduSWQsIHVwZGF0ZUxpc3RlbmVyKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgZnVsbCBoaWVyYXJjaHkgb2YgYSBkZXNpZ24gdy5yLnQuIGNvbnRhaW5lcnMgYW5kIGNvbXBvbmVudHMuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGRlc2lnbklkIC0gcGF0aCB0byByb290IGNvbnRhaW5lci5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaERlc2lnblN0cnVjdHVyZSA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hEZXNpZ25TdHJ1Y3R1cmVfJyArIGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICByb290SWQ6IGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcnM6IHt9LCAvLyBjb250YWluZXI6IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBwYXJlbnRJZDogPHN0cmluZz4sIHR5cGU6IDxzdHJpbmc+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBzdWJDb250YWluZXJzOiB7aWQ6PHN0cmluZz46IDxjb250YWluZXI+fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgY29tcG9uZW50czogICAge2lkOjxzdHJpbmc+OiA8Y29udGFpbmVyPn19XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czoge30gIC8vIGNvbXBvbmVudDoge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIHBhcmVudElkOiA8c3RyaW5nPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgLCBhdm1JZDogPHN0cmluZz4gfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGdldENvbXBvbmVudEluZm8gPSBmdW5jdGlvbiAobm9kZSwgcGFyZW50SWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogbm9kZS5nZXRJZCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBub2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRJZDogcGFyZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2bUlkOiBub2RlLmdldEF0dHJpYnV0ZSgnSUQnKVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tQ29udGFpbmVyUmVjID0gZnVuY3Rpb24gKGNvbnRhaW5lck5vZGUsIHJvb3RDb250YWluZXIsIG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy91cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY29udGFpbmVyTm9kZS5nZXRJZCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbnRhaW5lck5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY29udGFpbmVyTm9kZS5nZXRBdHRyaWJ1dGUoJ1R5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJDb250YWluZXJzOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RDb250YWluZXIuc3ViQ29udGFpbmVyc1tjb250YWluZXJOb2RlLmdldElkKCldID0gY29udGFpbmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbnRhaW5lcnNbY29udGFpbmVyTm9kZS5nZXRJZCgpXSA9IGNvbnRhaW5lcjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Db250YWluZXJSZWMoY2hpbGROb2RlLCBjb250YWluZXIsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IGdldENvbXBvbmVudEluZm8oY2hpbGROb2RlLCBjb250YWluZXIuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jb21wb25lbnRzW2NoaWxkTm9kZS5nZXRJZCgpXSA9IGNvbXBvbmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbY2hpbGROb2RlLmdldElkKCldID0gY29tcG9uZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUNvbnRhaW5lclJlYyhuZXdDaGlsZCwgY29udGFpbmVyLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyW2NoaWxkTm9kZS5nZXRJZCgpXSA9IGdldENvbXBvbmVudEluZm8oY2hpbGROb2RlLCBjb250YWluZXIuaWQpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIGRlc2lnbklkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyb290Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByb290Tm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RDb250YWluZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiByb290Tm9kZS5nZXRJZCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YkNvbnRhaW5lcnM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVyc1tyb290Q29udGFpbmVyLmlkXSA9IHJvb3RDb250YWluZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbnRhaW5lcnNbcm9vdENvbnRhaW5lci5pZF0gPSByb290Q29udGFpbmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUNvbnRhaW5lclJlYyhjaGlsZE5vZGUsIHJvb3RDb250YWluZXIsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1Db21wb25lbnRNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50ID0gZ2V0Q29tcG9uZW50SW5mbyhjaGlsZE5vZGUsIHJvb3RDb250YWluZXIuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290Q29udGFpbmVyLmNvbXBvbmVudHNbY2hpbGROb2RlLmdldElkKCldID0gY29tcG9uZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbY2hpbGROb2RlLmdldElkKCldID0gY29tcG9uZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tQ29udGFpbmVyUmVjKG5ld0NoaWxkLCByb290Q29udGFpbmVyLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RDb250YWluZXIuY29tcG9uZW50c1tjaGlsZE5vZGUuZ2V0SWQoKV0gPSBnZXRDb21wb25lbnRJbmZvKGNoaWxkTm9kZSwgcm9vdENvbnRhaW5lci5pZCk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy9cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgZ2VuZXJhdGVkIERlc2VydENvbmZpZ3VyYXRpb25TZXRzIGluc2lkZSBhIERlc2lnbi5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGVzaWduSWQgLSBwYXRoIHRvIGRlc2lnbiBvZiB3aGljaCB0byB3YXRjaC5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaENvbmZpZ3VyYXRpb25TZXRzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGRlc2lnbklkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbmZpZ3VyYXRpb25TZXRzXycgKyBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25TZXRzOiB7fSAvL2NvbmZpZ3VyYXRpb25TZXQge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPn1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW3JlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBkZXNpZ25JZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGVzaWduTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm5hbWUgPSBkZXNpZ25Ob2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLmxvYWRDaGlsZHJlbihjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNoaWxkTm9kZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLmNvbmZpZ3VyYXRpb25TZXRzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25maWd1cmF0aW9uU2V0c1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuY29uZmlndXJhdGlvblNldHNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2Rlc1tpXS5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uU2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IGNoaWxkTm9kZXNbaV0uZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29uZmlndXJhdGlvblNldHNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2Rlc1tpXS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2Rlc1tpXS5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZXNbaV0ub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2Rlc1tpXS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbk5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Tm9kZS5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uU2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IG5ld05vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29uZmlndXJhdGlvblNldHNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Tm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Tm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld05vZGUub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Tm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjaGlsZElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGdlbmVyYXRlZCBEZXNlcnRDb25maWd1cmF0aW9ucyBpbnNpZGUgYSBEZXNlcnRDb25maWd1cmF0aW9uU2V0cy5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29uZmlndXJhdGlvblNldElkIC0gcGF0aCB0byBEZXNlcnRDb25maWd1cmF0aW9uU2V0IG9mIHdoaWNoIHRvIHdhdGNoLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndhdGNoQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgY29uZmlndXJhdGlvblNldElkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbmZpZ3VyYXRpb25zXycgKyBjb25maWd1cmF0aW9uU2V0SWQsXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uczoge30gLy9jb25maWd1cmF0aW9uIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiA8c3RyaW5nPn1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW3JlZ2lvbklkXSA9IGNvbnRleHQ7XHJcblxyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgY29uZmlndXJhdGlvblNldElkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjZmdTZXROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNmZ1NldE5vZGUubG9hZENoaWxkcmVuKGNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY2hpbGROb2Rlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0FsdEFzcyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdBbHRlcm5hdGl2ZUFzc2lnbm1lbnRzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLmNvbmZpZ3VyYXRpb25zW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25maWd1cmF0aW9uc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3QWx0QXNzICE9PSBkYXRhLmNvbmZpZ3VyYXRpb25zW2lkXS5hbHRlcm5hdGl2ZUFzc2lnbm1lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25maWd1cmF0aW9uc1tpZF0uYWx0ZXJuYXRpdmVBc3NpZ25tZW50cyA9IG5ld0FsdEFzcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEuY29uZmlndXJhdGlvbnNbaWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb25maWd1cmF0aW9uc1tpZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5jb25maWd1cmF0aW9uc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBjaGlsZE5vZGVzW2ldLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGVzW2ldLmlzTWV0YVR5cGVPZihtZXRhLkRlc2VydENvbmZpZ3VyYXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbmZpZ3VyYXRpb25zW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZXNbaV0uZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogY2hpbGROb2Rlc1tpXS5nZXRBdHRyaWJ1dGUoJ0FsdGVybmF0aXZlQXNzaWdubWVudHMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZXNbaV0ub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2Rlc1tpXS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNmZ1NldE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Tm9kZS5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IG5ld05vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29uZmlndXJhdGlvbnNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Tm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiBuZXdOb2RlLmdldEF0dHJpYnV0ZSgnQWx0ZXJuYXRpdmVBc3NpZ25tZW50cycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Tm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb25maWd1cmF0aW9uc1tjaGlsZElkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGdlbmVyYXRlZCBEZXNlcnRDb25maWd1cmF0aW9uU2V0cyBpbnNpZGUgYSBEZXNpZ24uXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZ3VyYXRpb24gLSBDb25maWd1cmF0aW9uIG9mIHdoaWNoIHRvIHdhdGNoLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb25maWd1cmF0aW9uLmlkIC0gcGF0aCB0byBDb25maWd1cmF0aW9uIG9mIHdoaWNoIHRvIHdhdGNoLlxyXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmFwcGVuZFdhdGNoUmVzdWx0cyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBjb25maWd1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoUmVzdWx0c18nICsgY29uZmlndXJhdGlvbi5pZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bcmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5yZWdpb25JZCA9IHJlZ2lvbklkO1xyXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnJlc3VsdHMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBjb25maWd1cmF0aW9uLmlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjZmdOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNmZ05vZGUubG9hZENoaWxkcmVuKGNvbnRleHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY2hpbGROb2Rlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNSZXN1bHRzID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucmVzdWx0c1tpZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3VyYXRpb24ucmVzdWx0c1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkTm9kZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IGNoaWxkTm9kZXNbaV0uZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZXNbaV0uaXNNZXRhVHlwZU9mKG1ldGEuUmVzdWx0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5yZXN1bHRzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9uYW1lOiBjaGlsZE5vZGVzW2ldLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY2hpbGROb2Rlc1tpXS5vblVwZGF0ZShvblVwZGF0ZSk7IFRPRE86IFdoZW4gYXR0cmlidXRlcyBhcmUgd2F0Y2ggYWRkIHRoaXMuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGVzW2ldLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc1Jlc3VsdHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZmdOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05vZGUuaXNNZXRhVHlwZU9mKG1ldGEuUmVzdWx0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IG5ld05vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnJlc3VsdHNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoaGFzUmVzdWx0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNhdmVDb25maWd1cmF0aW9uU2V0Tm9kZXMgPSBmdW5jdGlvbiAoc2V0TmFtZSwgc2V0RGVzYywgY29uZmlndXJhdGlvbnMsIGRlc2lnbk5vZGUsIG1ldGEpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBkZXNpZ25Ob2RlLmNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmNyZWF0ZU5vZGUoY29udGV4dCwgZGVzaWduTm9kZSwgbWV0YS5EZXNlcnRDb25maWd1cmF0aW9uU2V0LCAnd2ViLWN5cGh5IHNhdmVDb25maWd1cmF0aW9uU2V0JylcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChzZXROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldE5vZGUuc2V0QXR0cmlidXRlKCduYW1lJywgc2V0TmFtZSwgJ3dlYi1jeXBoeSBzZXQgbmFtZSB0byAnICsgc2V0TmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNldERlc2MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0Tm9kZS5zZXRBdHRyaWJ1dGUoJ0lORk8nLCBzZXREZXNjLCAnd2ViLWN5cGh5IHNldCBJTkZPIHRvICcgKyBzZXREZXNjKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbmZpZ3VyYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKG5vZGVTZXJ2aWNlLmNyZWF0ZU5vZGUoY29udGV4dCwgc2V0Tm9kZSwgbWV0YS5EZXNlcnRDb25maWd1cmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3dlYi1jeXBoeSBzYXZlQ29uZmlndXJhdGlvblNldCcpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKGNmZ05vZGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWFTdHI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2ZnTm9kZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYVN0ciA9IEpTT04uc3RyaW5naWZ5KGNvbmZpZ3VyYXRpb25zW2ldLmFsdGVybmF0aXZlQXNzaWdubWVudHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNmZ05vZGVzW2ldLnNldEF0dHJpYnV0ZSgnbmFtZScsIGNvbmZpZ3VyYXRpb25zW2ldLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnd2ViLWN5cGh5IHNldCBuYW1lIHRvICcgKyBjb25maWd1cmF0aW9uc1tpXS5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZmdOb2Rlc1tpXS5zZXRBdHRyaWJ1dGUoJ0FsdGVybmF0aXZlQXNzaWdubWVudHMnLCBhYVN0cixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd3ZWItY3lwaHkgc2V0IEFsdGVybmF0aXZlQXNzaWdubWVudHMgdG8gJyArIGFhU3RyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNhdmVDb25maWd1cmF0aW9uU2V0ID0gZnVuY3Rpb24gKHNldE5hbWUsIHNldERlc2MsIGNvbmZpZ3VyYXRpb25zLCBkZXNpZ25Ob2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gZGVzaWduTm9kZS5jb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgaSxcclxuICAgICAgICAgICAgICAgIGFhU3RyLFxyXG4gICAgICAgICAgICAgICAgbWV0YUNmZ0lkID0gbWV0YS5EZXNlcnRDb25maWd1cmF0aW9uLmdldElkKCksXHJcbiAgICAgICAgICAgICAgICBtZXRhQ2ZnU2V0SWQgPSBtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQuZ2V0SWQoKSxcclxuICAgICAgICAgICAgICAgIHNldElkLFxyXG4gICAgICAgICAgICAgICAgY2ZnSWQsXHJcbiAgICAgICAgICAgICAgICBkZXNpZ25JZCA9IGRlc2lnbk5vZGUuZ2V0SWQoKSxcclxuICAgICAgICAgICAgICAgIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRJZDogZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFzZUlkOiBtZXRhQ2ZnU2V0SWRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHNldElkID0gbm9kZVNlcnZpY2UuY3JlYXRlQ2hpbGQoY29udGV4dCwgcGFyYW1zLCAnd2ViLWN5cGh5IHNhdmVDb25maWd1cmF0aW9uU2V0IGNvbmZpZ1NldCBzYXZlZC4nKTtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2Uuc2V0QXR0cmlidXRlcyhjb250ZXh0LCBzZXRJZCwgJ25hbWUnLCBzZXROYW1lLCAnd2ViLWN5cGh5IHNldCBuYW1lIHRvICcgKyBzZXROYW1lKTtcclxuICAgICAgICAgICAgaWYgKHNldERlc2MpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLnNldEF0dHJpYnV0ZXMoY29udGV4dCwgc2V0SWQsICdJTkZPJywgc2V0RGVzYywgJ3dlYi1jeXBoeSBzZXQgSU5GTyB0byAnICsgc2V0RGVzYyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50SWQ6IHNldElkLFxyXG4gICAgICAgICAgICAgICAgYmFzZUlkOiBtZXRhQ2ZnSWRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbmZpZ3VyYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBjZmdJZCA9IG5vZGVTZXJ2aWNlLmNyZWF0ZUNoaWxkKGNvbnRleHQsIHBhcmFtcywgJ3dlYi1jeXBoeSBzYXZlQ29uZmlndXJhdGlvblNldCBjb25maWcgc2F2ZWQuJyk7XHJcbiAgICAgICAgICAgICAgICBhYVN0ciA9IEpTT04uc3RyaW5naWZ5KGNvbmZpZ3VyYXRpb25zW2ldLmFsdGVybmF0aXZlQXNzaWdubWVudHMpO1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2Uuc2V0QXR0cmlidXRlcyhjb250ZXh0LCBjZmdJZCwgJ25hbWUnLCBjb25maWd1cmF0aW9uc1tpXS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnd2ViLWN5cGh5IHNldCBuYW1lIHRvICcgKyBjb25maWd1cmF0aW9uc1tpXS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLnNldEF0dHJpYnV0ZXMoY29udGV4dCwgY2ZnSWQsICdBbHRlcm5hdGl2ZUFzc2lnbm1lbnRzJywgYWFTdHIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICd3ZWItY3lwaHkgc2V0IEFsdGVybmF0aXZlQXNzaWdubWVudHMgdG8gJyArIGFhU3RyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcEFsbFJlZ2lvbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCkge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24od2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIHJlZ2lvbklkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoZXIgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZm4pIHtcclxuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGZuKTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIFdlYkdNRUdsb2JhbCwgY29uc29sZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ2V4ZWN1dG9yU2VydmljZScsIGZ1bmN0aW9uICgkcSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgZXhlY3V0b3JDbGllbnQgPSBuZXcgV2ViR01FR2xvYmFsLmNsYXNzZXMuRXhlY3V0b3JDbGllbnQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVKb2IgPSBmdW5jdGlvbiAoam9iRGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBleGVjdXRvckNsaWVudC5jcmVhdGVKb2Ioam9iRGF0YSwgZnVuY3Rpb24gKGVyciwgam9iSW5mbykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGpvYkluZm8pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0SW5mbyA9IGZ1bmN0aW9uIChqb2JIYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGV4ZWN1dG9yQ2xpZW50LmdldEluZm8oam9iSGFzaCwgZnVuY3Rpb24gKGVyciwgam9iSW5mbykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGpvYkluZm8pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0V29ya2Vyc0luZm8gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGV4ZWN1dG9yQ2xpZW50LmdldFdvcmtlcnNJbmZvKGZ1bmN0aW9uIChlcnIsIHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgV2ViR01FR2xvYmFsLCBjb25zb2xlKi9cclxuXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ2ZpbGVTZXJ2aWNlJywgZnVuY3Rpb24gKCRxKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgYmxvYkNsaWVudCA9IG5ldyBXZWJHTUVHbG9iYWwuY2xhc3Nlcy5CbG9iQ2xpZW50KCk7XHJcblxyXG4gICAgICAgIC8vVE9ETzogQ29uc2lkZXIgbWFraW5nIGFuIEFydGlmYWN0ICdDbGFzcycuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVBcnRpZmFjdCA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBibG9iQ2xpZW50LmNyZWF0ZUFydGlmYWN0KG5hbWUpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2F2ZUFydGlmYWN0ID0gZnVuY3Rpb24gKGFydGlmYWN0KSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGFydGlmYWN0LnNhdmUoZnVuY3Rpb24gKGVyciwgYXJ0aWVIYXNoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYXJ0aWVIYXNoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmdldEFydGlmYWN0ID0gZnVuY3Rpb24gKGhhc2gpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgYmxvYkNsaWVudC5nZXRBcnRpZmFjdChoYXNoLCBmdW5jdGlvbiAoZXJyLCBhcnRpZmFjdCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe2FydGlmYWN0OiBhcnRpZmFjdCwgaGFzaDogaGFzaH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRGaWxlVG9BcnRpZmFjdCA9IGZ1bmN0aW9uIChhcnRpZmFjdCwgZmlsZU5hbWUsIGNvbnRlbnQpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgYXJ0aWZhY3QuYWRkRmlsZShmaWxlTmFtZSwgY29udGVudCwgZnVuY3Rpb24gKGVyciwgaGFzaGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoaGFzaGVzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGRzIG11bHRpcGxlIGZpbGVzIHRvIGdpdmVuIGFydGlmYWN0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuYWRkRmlsZXNUb0FydGlmYWN0ID0gZnVuY3Rpb24gKGFydGlmYWN0LCBmaWxlcykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBhcnRpZmFjdC5hZGRGaWxlcyhmaWxlcywgZnVuY3Rpb24gKGVyciwgaGFzaGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoaGFzaGVzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEZpbGVBc1NvZnRMaW5rVG9BcnRpZmFjdCA9IGZ1bmN0aW9uIChhcnRpZmFjdCwgZmlsZU5hbWUsIGNvbnRlbnQpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgICAgIGFydGlmYWN0LmFkZEZpbGVBc1NvZnRMaW5rKGZpbGVOYW1lLCBjb250ZW50LCBmdW5jdGlvbiAoZXJyLCBoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoaGFzaCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRNZXRhZGF0YSA9IGZ1bmN0aW9uIChoYXNoKSB7XHJcbi8vICAgICAgICBFeGFtcGxlIG9mIHJldHVybmVkIGRhdGEuXHJcbi8vICAgICAgICB7XHJcbi8vICAgICAgICAgICAgXCJuYW1lXCI6IFwidGJBc3NldC56aXBcIixcclxuLy8gICAgICAgICAgICBcInNpemVcIjogMTAzODU0LFxyXG4vLyAgICAgICAgICAgIFwibWltZVwiOiBcImFwcGxpY2F0aW9uL3ppcFwiLFxyXG4vLyAgICAgICAgICAgIFwiaXNQdWJsaWNcIjogZmFsc2UsXHJcbi8vICAgICAgICAgICAgXCJ0YWdzXCI6IFtdLFxyXG4vLyAgICAgICAgICAgIFwiY29udGVudFwiOiBcIjIzNTdmYmQ2NzNiZWM2ZTk1OTBlZThiYTM0ZWM4ZGY4YTg1ZGRhZjhcIixcclxuLy8gICAgICAgICAgICBcImNvbnRlbnRUeXBlXCI6IFwib2JqZWN0XCIsXHJcbi8vICAgICAgICAgICAgXCJsYXN0TW9kaWZpZWRcIjogXCIyMDE0LTExLTA5VDAwOjIxOjIyLjAwMFpcIlxyXG4vLyAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBibG9iQ2xpZW50LmdldE1ldGFkYXRhKGhhc2gsIGZ1bmN0aW9uIChlcnIsIG1ldGFEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUobWV0YURhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0T2JqZWN0ID0gZnVuY3Rpb24gKGhhc2gpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgYmxvYkNsaWVudC5nZXRPYmplY3QoaGFzaCwgZnVuY3Rpb24gKGVyciwgY29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIGRvd25sb2FkIHVybCBmb3IgdGhlIGdpdmVuIGhhc2guXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGhhc2ggLSBoYXNoIHRvIGJsb2IgZmlsZS5cclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIHRoZSBkb3dubG9hZCB1cmwgKG51bGwgaWYgaGFzaCBpcyBlbXB0eSkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5nZXREb3dubG9hZFVybCA9IGZ1bmN0aW9uIChoYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciB1cmw7XHJcbiAgICAgICAgICAgIGlmIChoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICB1cmwgPSBibG9iQ2xpZW50LmdldERvd25sb2FkVVJMKGhhc2gpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBoYXNoIHRvIGJsb2IgZmlsZSBnaXZlbicpO1xyXG4gICAgICAgICAgICAgICAgdXJsID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHVybDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBmaWxlIGV4dGVuc2lvbiBvZiB0aGUgZ2l2ZW4gZmlsZW5hbWUuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gLSB0aGUgcmVzdWx0aW5nIGZpbGUgZXh0ZW5zaW9uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZ2V0RmlsZUV4dGVuc2lvbiA9IGZ1bmN0aW9uIChmaWxlbmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgYSA9IGZpbGVuYW1lLnNwbGl0KFwiLlwiKTtcclxuICAgICAgICAgICAgaWYgKGEubGVuZ3RoID09PSAxIHx8IChhWzBdID09PSBcIlwiICYmIGEubGVuZ3RoID09PSAyKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGEucG9wKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGb3JtYXRzIHRoZSBzaXplIGludG8gYSBodW1hbiByZWFkYWJsZSBzdHJpbmcuXHJcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IGJ5dGVzIC0gc2l6ZSBpbiBieXRlcy5cclxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNpIC0gcmV0dXJuIHJlc3VsdCBpbiBTSVVuaXRzIG9yIG5vdC5cclxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIGZvcm1hdHRlZCBmaWxlIHNpemUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5odW1hbkZpbGVTaXplID0gZnVuY3Rpb24gKGJ5dGVzLCBzaSkge1xyXG4gICAgICAgICAgICB2YXIgdGhyZXNoID0gc2kgPyAxMDAwIDogMTAyNCxcclxuICAgICAgICAgICAgICAgIHVuaXRzLFxyXG4gICAgICAgICAgICAgICAgdTtcclxuICAgICAgICAgICAgaWYgKGJ5dGVzIDwgdGhyZXNoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYnl0ZXMgKyAnIEInO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB1bml0cyA9IHNpID8gWydrQicsICdNQicsICdHQicsICdUQicsICdQQicsICdFQicsICdaQicsICdZQiddIDpcclxuICAgICAgICAgICAgICAgICAgICBbJ0tpQicsICdNaUInLCAnR2lCJywgJ1RpQicsICdQaUInLCAnRWlCJywgJ1ppQicsICdZaUInXTtcclxuICAgICAgICAgICAgdSA9IC0xO1xyXG5cclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgYnl0ZXMgPSBieXRlcyAvIHRocmVzaDtcclxuICAgICAgICAgICAgICAgIHUgKz0gMTtcclxuICAgICAgICAgICAgfSB3aGlsZSAoYnl0ZXMgPj0gdGhyZXNoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBieXRlcy50b0ZpeGVkKDEpICsgJyAnICsgdW5pdHNbdV07XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gV2ViQ3lQaHlTcGVjaWZpYyBmdW5jdGlvbnMuXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRPRE86IFRoaXMgbWV0aG9kIHNob3VsZCB1c2UgcHJvbWlzZXMgaW50ZXJuYWxseSFcclxuICAgICAgICAgKiBAcGFyYW0gZmlsZXNcclxuICAgICAgICAgKiBAcGFyYW0gdmFsaWRFeHRlbnNpb25zXHJcbiAgICAgICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zYXZlRHJvcHBlZEZpbGVzID0gZnVuY3Rpb24gKGZpbGVzLCB2YWxpZEV4dGVuc2lvbnMpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGksXHJcbiAgICAgICAgICAgICAgICBjb3VudGVyID0gZmlsZXMubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgYXJ0aWUgPSBibG9iQ2xpZW50LmNyZWF0ZUFydGlmYWN0KCdkcm9wcGVkRmlsZXMnKSxcclxuICAgICAgICAgICAgICAgIGFkZEZpbGUsXHJcbiAgICAgICAgICAgICAgICBhZGRlZEZpbGVzID0gW10sXHJcbiAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY291bnRlciA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYWRkZWRGaWxlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvdW50ZXIgPSBmaWxlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBhZGRGaWxlID0gZnVuY3Rpb24gKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmaWxlRXh0ZW5zaW9uID0gc2VsZi5nZXRGaWxlRXh0ZW5zaW9uKGZpbGUubmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkRXh0ZW5zaW9ucyB8fCB2YWxpZEV4dGVuc2lvbnNbZmlsZUV4dGVuc2lvbl0pIHtcclxuICAgICAgICAgICAgICAgICAgICBhcnRpZS5hZGRGaWxlQXNTb2Z0TGluayhmaWxlLm5hbWUsIGZpbGUsIGZ1bmN0aW9uIChlcnIsIGhhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGFkZCBmaWxlIFwiJyArIGZpbGUubmFtZSArICdcIiB0byBibG9iLCBlcnI6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ291bnRlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZGVkRmlsZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZmlsZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogZmlsZUV4dGVuc2lvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IHNlbGYuaHVtYW5GaWxlU2l6ZShmaWxlLnNpemUsIHRydWUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBibG9iQ2xpZW50LmdldERvd25sb2FkVVJMKGhhc2gpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNvdW50ZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBhZGRGaWxlKGZpbGVzW2ldKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBXZWJHTUVHbG9iYWwsIGNvbnNvbGUqL1xyXG5cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgncGx1Z2luU2VydmljZScsIGZ1bmN0aW9uICgkcSwgZGF0YVN0b3JlU2VydmljZSwgZmlsZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHRcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwbHVnaW5OYW1lIC0gTmFtZSBvZiBwbHVnaW4gdG8gZXhlY3V0ZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gT2JqZWN0IHdpdGggcGx1Z2luIGNvbmZpZ3VyYXRpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3Quc3RyaW5nfSBjb25maWcuYWN0aXZlTm9kZSAtIFBhdGggdG8gYWN0aXZlTm9kZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC5BcnJheS48c3RyaW5nPn0gY29uZmlnLmFjdGl2ZVNlbGVjdGlvbiAtIFBhdGhzIHRvIG5vZGVzIGluIGFjdGl2ZVNlbGVjdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC5ib29sZWFufSBjb25maWcucnVuT25TZXJ2ZXIgLSBXaGV0aGVyIHRvIHJ1biB0aGUgcGx1Z2luIG9uIHRoZSBzZXJ2ZXIgb3Igbm90LlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0Lm9iamVjdH0gY29uZmlnLnBsdWdpbkNvbmZpZyAtIFBsdWdpbiBzcGVjaWZpYyBvcHRpb25zLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMucnVuUGx1Z2luID0gZnVuY3Rpb24gKGNvbnRleHQsIHBsdWdpbk5hbWUsIGNvbmZpZykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgZGJDb25uID0gZGF0YVN0b3JlU2VydmljZS5nZXREYXRhYmFzZUNvbm5lY3Rpb24oY29udGV4dC5kYiksXHJcbiAgICAgICAgICAgICAgICBpbnRlcnByZXRlck1hbmFnZXIgPSBuZXcgV2ViR01FR2xvYmFsLmNsYXNzZXMuSW50ZXJwcmV0ZXJNYW5hZ2VyKGRiQ29ubi5jbGllbnQpO1xyXG5cclxuICAgICAgICAgICAgaW50ZXJwcmV0ZXJNYW5hZ2VyLnJ1bihwbHVnaW5OYW1lLCBjb25maWcsIGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnTm8gUmVzdWx0IHdhcyByZXR1cm4gZnJvbSBwbHVnaW4gZXhlY3V0aW9uIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0UGx1Z2luQXJ0aWZhY3RzSHRtbCA9IGZ1bmN0aW9uIChhcnRpZUhhc2hlcykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICBpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGFydGllSGFzaGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaChmaWxlU2VydmljZS5nZXRBcnRpZmFjdChhcnRpZUhhc2hlc1tpXSkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgnJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uIChhcnRpZmFjdHNJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGosXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvd25sb2FkVXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnRpZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFydGlmYWN0c0h0bWwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgYXJ0aWZhY3RzSW5mby5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb3dubG9hZFVybCA9IGZpbGVTZXJ2aWNlLmdldERvd25sb2FkVXJsKGFydGlmYWN0c0luZm9bal0uaGFzaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFydGllTmFtZSA9IGFydGlmYWN0c0luZm9bal0uYXJ0aWZhY3QubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWZhY3RzSHRtbCArPSAnPGJyPiA8YSBocmVmPVwiJyArIGRvd25sb2FkVXJsICsgJ1wiPicgKyBhcnRpZU5hbWUgKyAnPC9hPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYXJ0aWZhY3RzSHRtbCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCd0ZXN0QmVuY2hTZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCAkdGltZW91dCwgJG1vZGFsLCBub2RlU2VydmljZSwgYmFzZUN5UGh5U2VydmljZSwgcGx1Z2luU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIHdhdGNoZXJzID0ge307XHJcblxyXG4gICAgICAgIHRoaXMuZWRpdFRlc3RCZW5jaEZuID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9UZXN0QmVuY2hFZGl0Lmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1Rlc3RCZW5jaEVkaXRDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIC8vc2l6ZTogc2l6ZSxcclxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHsgZGF0YTogZnVuY3Rpb24gKCkgeyByZXR1cm4gZGF0YTsgfSB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoZWRpdGVkRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGF0dHJzID0geyB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGVkaXRlZERhdGEuZGVzY3JpcHRpb24gIT09IGRhdGEudGVzdEJlbmNoLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnMuSU5GTyA9IGVkaXRlZERhdGEuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZWRpdGVkRGF0YS5uYW1lICE9PSBkYXRhLnRlc3RCZW5jaC50aXRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJzLm5hbWUgPSBlZGl0ZWREYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZWRpdGVkRGF0YS5maWxlSW5mby5oYXNoICE9PSBkYXRhLnRlc3RCZW5jaC5kYXRhLmZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnMuVGVzdEJlbmNoRmlsZXMgPSBlZGl0ZWREYXRhLmZpbGVJbmZvLmhhc2g7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZWRpdGVkRGF0YS5wYXRoICE9PSBkYXRhLnRlc3RCZW5jaC5kYXRhLnBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRycy5JRCA9IGVkaXRlZERhdGEucGF0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRlc3RCZW5jaEF0dHJpYnV0ZXMoZGF0YS5lZGl0Q29udGV4dCwgZGF0YS5pZCwgYXR0cnMpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXR0cmlidXRlKHMpIHVwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmRlbGV0ZUZuID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9TaW1wbGVNb2RhbC5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTaW1wbGVNb2RhbENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRGVsZXRlIFRlc3QgQmVuY2gnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogJ1RoaXMgd2lsbCBkZWxldGUgJyArIGRhdGEubmFtZSArICcgZnJvbSB0aGUgd29ya3NwYWNlLidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRlbGV0ZVRlc3RCZW5jaChkYXRhLmNvbnRleHQsIGRhdGEuaWQpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIHRlc3QgYmVuY2ggZnJvbSB0aGUgY29udGV4dC5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIGRhdGEtYmFzZSBjb25uZWN0aW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXN0QmVuY2hJZCAtIFBhdGggdG8gZGVzaWduLXNwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSBbbXNnXSAtIENvbW1pdCBtZXNzYWdlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZGVsZXRlVGVzdEJlbmNoID0gZnVuY3Rpb24gKGNvbnRleHQsIHRlc3RCZW5jaElkLCBtc2cpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBtc2cgfHwgJ3Rlc3RCZW5jaFNlcnZpY2UuZGVsZXRlVGVzdEJlbmNoICcgKyB0ZXN0QmVuY2hJZDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZGVzdHJveU5vZGUoY29udGV4dCwgdGVzdEJlbmNoSWQsIG1lc3NhZ2UpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZXhwb3J0VGVzdEJlbmNoID0gZnVuY3Rpb24gKHRlc3RCZW5jaElkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkLicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIGdpdmVuIGF0dHJpYnV0ZXNcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSB0ZXN0IGJlbmNoLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIHRlc3QgYmVuY2guXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQucmVnaW9uSWQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgdGVzdCBiZW5jaC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGVzdEJlbmNoSWQgLSBQYXRoIHRvIHRlc3QgYmVuY2guXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGF0dHJzIC0gS2V5cyBhcmUgbmFtZXMgb2YgYXR0cmlidXRlcyBhbmQgdmFsdWVzIGFyZSB0aGUgd2FudGVkIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuc2V0VGVzdEJlbmNoQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChjb250ZXh0LCB0ZXN0QmVuY2hJZCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJhc2VDeVBoeVNlcnZpY2Uuc2V0Tm9kZUF0dHJpYnV0ZXMoY29udGV4dCwgdGVzdEJlbmNoSWQsIGF0dHJzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJ1blRlc3RCZW5jaCA9IGZ1bmN0aW9uIChjb250ZXh0LCB0ZXN0QmVuY2hJZCwgY29uZmlndXJhdGlvbklkKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogdGVzdEJlbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcnVuT25TZXJ2ZXI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvblBhdGg6IGNvbmZpZ3VyYXRpb25JZFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoY29uZmlnKSk7XHJcbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKGNvbnRleHQsICdUZXN0QmVuY2hSdW5uZXInLCBjb25maWcpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdExpZ2h0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiByZXN1bHQuc3VjY2VzcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWZhY3RzSHRtbDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiByZXN1bHQubWVzc2FnZXNcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVzdWx0XCIsIHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luU2VydmljZS5nZXRQbHVnaW5BcnRpZmFjdHNIdG1sKHJlc3VsdC5hcnRpZmFjdHMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChhcnRpZmFjdHNIdG1sKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRMaWdodC5hcnRpZmFjdHNIdG1sID0gYXJ0aWZhY3RzSHRtbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0TGlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsICcgKyByZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLndhdGNoVGVzdEJlbmNoTm9kZSA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB0ZXN0QmVuY2hJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hUZXN0QmVuY2gnLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBtZXRhOiBudWxsLCAvLyBNRVRBIG5vZGVzIC0gbmVlZGVkIHdoZW4gY3JlYXRpbmcgbmV3IG5vZGVzLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoOiB7fSAvLyB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+LCBub2RlIDxOb2RlT2JqPn1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSB0aGlzLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UmVzdWx0cyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdSZXN1bHRzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0ZpbGVzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1Rlc3RCZW5jaEZpbGVzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Rsc3V0ID0gdGhpcy5nZXRQb2ludGVyKCdUb3BMZXZlbFN5c3RlbVVuZGVyVGVzdCcpLnRvLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRsc3V0Q2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLnRlc3RCZW5jaC5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlc2MgIT09IGRhdGEudGVzdEJlbmNoLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQYXRoICE9PSBkYXRhLnRlc3RCZW5jaC5wYXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLnBhdGggPSBuZXdQYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1Jlc3VsdHMgIT09IGRhdGEudGVzdEJlbmNoLnJlc3VsdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2gucmVzdWx0cyA9IG5ld1Jlc3VsdHM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RmlsZXMgIT09IGRhdGEudGVzdEJlbmNoLmZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLmZpbGVzID0gbmV3RmlsZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VGxzdXQgIT09IGRhdGEudGVzdEJlbmNoLnRsc3V0SWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2gudGxzdXRJZCA9IG5ld1Rsc3V0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGxzdXRDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEudGVzdEJlbmNoLCB0bHN1dENoYW5nZWQ6IHRsc3V0Q2hhbmdlZH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB0ZXN0QmVuY2hJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodGVzdEJlbmNoTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm1ldGEgPSBtZXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0ZXN0QmVuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRlc3RCZW5jaE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGVzdEJlbmNoTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHRlc3RCZW5jaE5vZGUuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogdGVzdEJlbmNoTm9kZS5nZXRBdHRyaWJ1dGUoJ1Jlc3VsdHMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiB0ZXN0QmVuY2hOb2RlLmdldEF0dHJpYnV0ZSgnVGVzdEJlbmNoRmlsZXMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRsc3V0SWQ6IHRlc3RCZW5jaE5vZGUuZ2V0UG9pbnRlcignVG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3QnKS50byxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IHRlc3RCZW5jaE5vZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGFsbCB0ZXN0LWJlbmNoZXMgKGV4aXN0ZW5jZSBhbmQgdGhlaXIgYXR0cmlidXRlcykgb2YgYSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkIC0gUGF0aCB0byB3b3Jrc3BhY2UgdGhhdCBzaG91bGQgYmUgd2F0Y2hlZC5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuIERhdGEgaXMgYW4gb2JqZWN0IGluIGRhdGEudGVzdEJlbmNoZXMuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaFRlc3RCZW5jaGVzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaFRlc3RCZW5jaGVzJyxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiBwYXJlbnRDb250ZXh0LnByb2plY3RJZCxcclxuICAgICAgICAgICAgICAgICAgICBicmFuY2hJZDogcGFyZW50Q29udGV4dC5icmFuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hlczoge30gLy8gdGVzdEJlbmNoIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgcGF0aDogPHN0cmluZz4sIHJlc3VsdHM6IDxoYXNofHN0cmluZz4sIGZpbGVzOiA8aGFzaHxzdHJpbmc+IH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSB0aGlzLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UmVzdWx0cyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdSZXN1bHRzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0ZpbGVzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1Rlc3RCZW5jaEZpbGVzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS50ZXN0QmVuY2hlc1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEZXNjICE9PSBkYXRhLnRlc3RCZW5jaGVzW2lkXS5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW2lkXS5kZXNjcmlwdGlvbiA9IG5ld0Rlc2M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UGF0aCAhPT0gZGF0YS50ZXN0QmVuY2hlc1tpZF0ucGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW2lkXS5wYXRoID0gbmV3UGF0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdSZXN1bHRzICE9PSBkYXRhLnRlc3RCZW5jaGVzW2lkXS5yZXN1bHRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbaWRdLnJlc3VsdHMgPSBuZXdSZXN1bHRzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0ZpbGVzICE9PSBkYXRhLnRlc3RCZW5jaGVzW2lkXS5maWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW2lkXS5maWxlcyA9IG5ld0ZpbGVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEudGVzdEJlbmNoZXNbaWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnRlc3RCZW5jaGVzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNVGVzdEJlbmNoTW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW3Rlc3RCZW5jaElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRlc3RCZW5jaElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1Jlc3VsdHMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1Rlc3RCZW5jaEZpbGVzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVk1UZXN0QmVuY2hNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hJZCA9IG5ld0NoaWxkLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1t0ZXN0QmVuY2hJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0ZXN0QmVuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ1Jlc3VsdHMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnVGVzdEJlbmNoRmlsZXMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogdGVzdEJlbmNoSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS50ZXN0QmVuY2hlc1t0ZXN0QmVuY2hJZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYSB0ZXN0LWJlbmNoIHcuci50LiBpbnRlcmZhY2VzLlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB0ZXN0QmVuY2hJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaFRlc3RCZW5jaERldGFpbHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgdGVzdEJlbmNoSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoVGVzdEJlbmNoRGV0YWlsc18nICsgdGVzdEJlbmNoSWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcklkczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgdGxzdXQ6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGRhdGEuY29udGFpbmVySWRzLmluZGV4T2YoaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVySWRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHRlc3RCZW5jaElkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh0ZXN0QmVuY2hOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaE5vZGUubG9hZENoaWxkcmVuKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW5baV0uaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb250YWluZXJJZHMucHVzaChjaGlsZHJlbltpXS5nZXRJZCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVySWRzLnB1c2gobmV3Q2hpbGQuZ2V0SWQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGEgdGVzdC1iZW5jaCB3LnIudC4gaW50ZXJmYWNlcy5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gY29udGFpbmVySWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGNvbnRhaW5lcklkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS53YXRjaEludGVyZmFjZXMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGNvbnRhaW5lcklkLCB1cGRhdGVMaXN0ZW5lcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwUmVnaW9uID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHJlZ2lvbklkKSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgcmVnaW9uSWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlci5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBmbikge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgZm4pO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ3dvcmtzcGFjZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsICR0aW1lb3V0LCBub2RlU2VydmljZSwgYmFzZUN5UGh5U2VydmljZSwgcGx1Z2luU2VydmljZSwgZmlsZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICB3YXRjaGVycyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCBuYW1lLCBkZXNjKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBtZXRhO1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dClcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChtZXRhTm9kZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRhID0gbWV0YU5vZGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlU2VydmljZS5jcmVhdGVOb2RlKGNvbnRleHQsICcnLCBtZXRhLldvcmtTcGFjZSwgJ1tXZWJDeVBoeV0gLSBXb3Jrc3BhY2VTZXJ2aWNlLmNyZWF0ZVdvcmtzcGFjZScpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3c05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWNtRm9sZGVySWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkbUZvbGRlcklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdG1Gb2xkZXJJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRm9sZGVyTm9kZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50SWQgPSB3c05vZGUuZ2V0SWQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSWQgPSBtZXRhLkFDTUZvbGRlci5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UuY3JlYXRlTm9kZShjb250ZXh0LCBwYXJlbnRJZCwgYmFzZUlkLCAnW1dlYkN5UGh5XSAtIGNyZWF0ZSBBQ01Gb2xkZXInKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChhY21Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjbUZvbGRlcklkID0gYWNtTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSWQgPSBtZXRhLkFETUZvbGRlci5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVNlcnZpY2UuY3JlYXRlTm9kZShjb250ZXh0LCBwYXJlbnRJZCwgYmFzZUlkLCAnW1dlYkN5UGh5XSAtIGNyZWF0ZSBBRE1Gb2xkZXInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChhZG1Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkbUZvbGRlcklkID0gYWRtTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSWQgPSBtZXRhLkFUTUZvbGRlci5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVNlcnZpY2UuY3JlYXRlTm9kZShjb250ZXh0LCBwYXJlbnRJZCwgYmFzZUlkLCAnW1dlYkN5UGh5XSAtIGNyZWF0ZSBBVE1Gb2xkZXInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChhdG1Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0bUZvbGRlcklkID0gYXRtTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHsgYWNtOiBhY21Gb2xkZXJJZCwgYWRtOiBhZG1Gb2xkZXJJZCwgYXRtOiBhdG1Gb2xkZXJJZCB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3c05vZGUuc2V0QXR0cmlidXRlKCduYW1lJywgbmFtZSwgJ1tXZWJDeVBoeV0gLSBzZXQgbmFtZSB0byAnICsgbmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c05vZGUuc2V0QXR0cmlidXRlKCdJTkZPJywgZGVzYywgJ1tXZWJDeVBoeV0gLSBzZXQgSU5GTyB0byAnICsgZGVzYylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRm9sZGVyTm9kZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUZvbGRlck5vZGVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaW1wb3J0RmlsZXMgPSBmdW5jdGlvbiAoY29udGV4dCwgZm9sZGVySWRzLCBmaWxlcykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgaSxcclxuICAgICAgICAgICAgICAgIGNvdW50ZXIsXHJcbiAgICAgICAgICAgICAgICB0b3RhbCxcclxuICAgICAgICAgICAgICAgIGZzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjbXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIGFkbXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIGF0bXM6IFtdXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaW1wb3J0QWNtUmVjLFxyXG4gICAgICAgICAgICAgICAgaW1wb3J0QWRtUmVjLFxyXG4gICAgICAgICAgICAgICAgaW1wb3J0QXRtUmVjLFxyXG4gICAgICAgICAgICAgICAgZ2V0Tm90aWZ5O1xyXG5cclxuICAgICAgICAgICAgaW1wb3J0QWNtUmVjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY2FsbEFjbUltcG9ydGVyKGNvbnRleHQsIGZvbGRlcklkcy5hY20sIGZzLmFjbXNbY291bnRlcl0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGdldE5vdGlmeShmcy5hY21zW2NvdW50ZXJdLCAnYWNtJyksIGdldE5vdGlmeShmcy5hY21zW2NvdW50ZXJdKSwgJ2FjbScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbCA9IGZzLmFkbXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSB0b3RhbDtcclxuICAgICAgICAgICAgICAgICAgICBpbXBvcnRBZG1SZWMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaW1wb3J0QWRtUmVjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY2FsbEFkbUltcG9ydGVyKGNvbnRleHQsIGZvbGRlcklkcy5hZG0sIGZzLmFkbXNbY291bnRlcl0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGdldE5vdGlmeShmcy5hZG1zW2NvdW50ZXJdLCAnYWRtJyksIGdldE5vdGlmeShmcy5hZG1zW2NvdW50ZXJdKSwgJ2FkbScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbCA9IGZzLmF0bXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSB0b3RhbDtcclxuICAgICAgICAgICAgICAgICAgICBpbXBvcnRBdG1SZWMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaW1wb3J0QXRtUmVjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY2FsbEF0bUltcG9ydGVyKGNvbnRleHQsIGZvbGRlcklkcy5hdG0sIGZzLmF0bXNbY291bnRlcl0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGdldE5vdGlmeShmcy5hdG1zW2NvdW50ZXJdLCAnYXRtJyksIGdldE5vdGlmeShmcy5hdG1zW2NvdW50ZXJdLCAnYXRtJykpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGdldE5vdGlmeSA9IGZ1bmN0aW9uIChmSW5mbywgdHlwZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhyZXN1bHQpID09PSBmYWxzZSAmJiByZXN1bHQuc3VjY2VzcyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoe3R5cGU6ICdzdWNjZXNzJywgbWVzc2FnZTogJzxhIGhyZWY9XCInICsgZkluZm8udXJsICsgJ1wiPicgKyBmSW5mby5uYW1lICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2E+JyArICcgaW1wb3J0ZWQuICcgKyAnWycgKyAodG90YWwgLSBjb3VudGVyKSArICcvJyArIHRvdGFsICsgJ10nfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KHt0eXBlOiAnZXJyb3InLCBtZXNzYWdlOiAnPGEgaHJlZj1cIicgKyBmSW5mby51cmwgKyAnXCI+JyArIGZJbmZvLm5hbWUgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvYT4nICsgJyBmYWlsZWQgdG8gYmUgaW1wb3J0ZWQsIHNlZSBjb25zb2xlIGRldGFpbHMuJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnWycgKyAodG90YWwgLSBjb3VudGVyKSArICcvJyArIHRvdGFsICsgJ10nfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHJlc3VsdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYW5ndWxhci50b0pzb24ocmVzdWx0Lm1lc3NhZ2VzLCB0cnVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdhY20nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltcG9ydEFjbVJlYygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2FkbScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1wb3J0QWRtUmVjKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnYXRtJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRBdG1SZWMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ1VuZXhwZWN0ZWQgaW1wb3J0IHR5cGUgJyArIHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vIGhhc2g6IFwiMzYzNmVhZDA3ODVjYTE2NmYzYjExMTkzYzRiMmU1YTY3MDgwMWViMVwiIG5hbWU6IFwiRGFtcGVyLnppcFwiIHNpemU6IFwiMS40IGtCXCIgdHlwZTogXCJ6aXBcIlxyXG4gICAgICAgICAgICAvLyB1cmw6IFwiL3Jlc3QvYmxvYi9kb3dubG9hZC8zNjM2ZWFkMDc4NWNhMTY2ZjNiMTExOTNjNGIyZTVhNjcwODAxZWIxXCJcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsZXNbaV0udHlwZSA9PT0gJ3ppcCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBmcy5hY21zLnB1c2goZmlsZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmaWxlc1tpXS50eXBlID09PSAnYWRtJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZzLmFkbXMucHVzaChmaWxlc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpbGVzW2ldLnR5cGUgPT09ICdhdG0nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnMuYXRtcy5wdXNoKGZpbGVzW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdG90YWwgPSBmcy5hY21zLmxlbmd0aDtcclxuICAgICAgICAgICAgY291bnRlciA9IHRvdGFsO1xyXG4gICAgICAgICAgICBpbXBvcnRBY21SZWMoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbEFjbUltcG9ydGVyID0gZnVuY3Rpb24gKGNvbnRleHQsIGZvbGRlcklkLCBmaWxlSW5mbykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGU6IGZvbGRlcklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uU2VydmVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5Db25maWc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXBsb2FkZWRGaWxlOiBmaWxlSW5mby5oYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBEZWxldGVFeGlzdGluZzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLnJ1blBsdWdpbihjb250ZXh0LCAnQWNtSW1wb3J0ZXInLCBjb25maWcpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9cIntcInN1Y2Nlc3NcIjp0cnVlLFwibWVzc2FnZXNcIjpbXSxcImFydGlmYWN0c1wiOltdLFwicGx1Z2luTmFtZVwiOlwiQUNNIEltcG9ydGVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXCJzdGFydFRpbWVcIjpcIjIwMTQtMTEtMDhUMDI6NTE6MjEuMzgzWlwiLFwiZmluaXNoVGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS45MzlaXCIsXCJlcnJvclwiOm51bGx9XCJcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nLCAnICsgcmVhc29uKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsQWRtSW1wb3J0ZXIgPSBmdW5jdGlvbiAoY29udGV4dCwgZm9sZGVySWQsIGZpbGVJbmZvKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogZm9sZGVySWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcnVuT25TZXJ2ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbkNvbmZpZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZG1GaWxlOiBmaWxlSW5mby5oYXNoXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKGNvbnRleHQsICdBZG1JbXBvcnRlcicsIGNvbmZpZylcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1wie1wic3VjY2Vzc1wiOnRydWUsXCJtZXNzYWdlc1wiOltdLFwiYXJ0aWZhY3RzXCI6W10sXCJwbHVnaW5OYW1lXCI6XCJBRE0gSW1wb3J0ZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAvLyBcInN0YXJ0VGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS4zODNaXCIsXCJmaW5pc2hUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjkzOVpcIixcImVycm9yXCI6bnVsbH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsICcgKyByZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxBdG1JbXBvcnRlciA9IGZ1bmN0aW9uIChjb250ZXh0LCBmb2xkZXJJZCwgZmlsZUluZm8pIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlOiBmb2xkZXJJZCxcclxuICAgICAgICAgICAgICAgICAgICBydW5PblNlcnZlcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0bUZpbGU6IGZpbGVJbmZvLmhhc2hcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcGx1Z2luU2VydmljZS5ydW5QbHVnaW4oY29udGV4dCwgJ0F0bUltcG9ydGVyJywgY29uZmlnKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vXCJ7XCJzdWNjZXNzXCI6dHJ1ZSxcIm1lc3NhZ2VzXCI6W10sXCJhcnRpZmFjdHNcIjpbXSxcInBsdWdpbk5hbWVcIjpcIkFUTSBJbXBvcnRlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFwic3RhcnRUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjM4M1pcIixcImZpbmlzaFRpbWVcIjpcIjIwMTQtMTEtMDhUMDI6NTE6MjEuOTM5WlwiLFwiZXJyb3JcIjpudWxsfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdTb21ldGhpbmcgd2VudCB0ZXJyaWJseSB3cm9uZywgJyArIHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENhbGxzIEV4cG9ydFdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIENvbnRleHQgZm9yIHBsdWdpbi5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24gdG8gcHVsbCBtb2RlbCBmcm9tLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZFxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIHJlc29sdmVzIHRvIGRvd25sb2FkIHVybCBpZiBzdWNjZXNzZnVsLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZXhwb3J0V29ya3NwYWNlID0gZnVuY3Rpb24gKGNvbnRleHQsIHdvcmtzcGFjZUlkKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogd29ya3NwYWNlSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcnVuT25TZXJ2ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbkNvbmZpZzogeyB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcGx1Z2luU2VydmljZS5ydW5QbHVnaW4oY29udGV4dCwgJ0V4cG9ydFdvcmtzcGFjZScsIGNvbmZpZylcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1wie1wic3VjY2Vzc1wiOnRydWUsXCJtZXNzYWdlc1wiOltdLFwiYXJ0aWZhY3RzXCI6W10sXCJwbHVnaW5OYW1lXCI6XCJBRE0gSW1wb3J0ZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAvLyBcInN0YXJ0VGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS4zODNaXCIsXCJmaW5pc2hUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjkzOVpcIixcImVycm9yXCI6bnVsbH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGZpbGVTZXJ2aWNlLmdldERvd25sb2FkVXJsKHJlc3VsdC5hcnRpZmFjdHNbMF0pKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVzdWx0LmVycm9yICsgJyBtZXNzYWdlczogJyArIGFuZ3VsYXIudG9Kc29uKHJlc3VsdC5tZXNzYWdlcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGFuZ3VsYXIudG9Kc29uKHJlc3VsdC5tZXNzYWdlcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdTb21ldGhpbmcgd2VudCB0ZXJyaWJseSB3cm9uZyAnICsgcmVhc29uKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIGdpdmVuIGF0dHJpYnV0ZXNcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBkZXNpZ24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgZGVzaWduLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LnJlZ2lvbklkIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGRlc2lnbi5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWQgLSBQYXRoIHRvIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gYXR0cnMgLSBLZXlzIGFyZSBuYW1lcyBvZiBhdHRyaWJ1dGVzIGFuZCB2YWx1ZXMgYXJlIHRoZSB3YW50ZWQgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zZXRXb3Jrc3BhY2VBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBhdHRycykge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS5zZXROb2RlQXR0cmlidXRlcyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgYXR0cnMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIHdvcmtzcGFjZSBmcm9tIHRoZSBjb250ZXh0LlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gZGF0YS1iYXNlIGNvbm5lY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkIC0gUGF0aCB0byB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIFttc2ddIC0gQ29tbWl0IG1lc3NhZ2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5kZWxldGVXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoY29udGV4dCwgd29ya3NwYWNlSWQsIG1zZykge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG1zZyB8fCAnV29ya3NwYWNlU2VydmljZS5kZWxldGVXb3Jrc3BhY2UgJyArIHdvcmtzcGFjZUlkO1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5kZXN0cm95Tm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZCwgbWVzc2FnZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogbWFrZSBzdXJlIHRoZSBtZXRob2RzIGJlbG93IGdldHMgcmVzb2x2ZWQgYXQgZXJyb3IgdG9vLlxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSB3b3JrLXNwYWNlcyBkZWZpbmVkIGluIHRoZSByb290LW5vZGUgdy5yLnQuIGV4aXN0ZW5jZSBhbmQgYXR0cmlidXRlcy5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyBhbiBvYmplY3QgaW4gZGF0YS53b3Jrc3BhY2VzLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hXb3Jrc3BhY2VzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoV29ya3NwYWNlcycsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZXM6IHt9IC8vIHdvcmtzcGFjZSA9IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz59XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEud29ya3NwYWNlc1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLndvcmtzcGFjZXNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlc2MgIT09IGRhdGEud29ya3NwYWNlc1tpZF0uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW2lkXS5kZXNjcmlwdGlvbiA9IG5ld0Rlc2M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YS53b3Jrc3BhY2VzW2lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS53b3Jrc3BhY2VzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgJycpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJvb3ROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3NJZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuV29ya1NwYWNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c0lkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1t3c0lkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB3c0lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLldvcmtTcGFjZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3NJZCA9IG5ld0NoaWxkLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1t3c0lkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB3c0lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJTkZPJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogd3NJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLndvcmtzcGFjZXNbd3NJZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgbnVtYmVyIG9mIGNvbXBvbmVudHMgKGRlZmluZWQgaW4gQUNNRm9sZGVycykgaW4gdGhlIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyB0aGUgdXBkYXRlZCBkYXRhLmNvdW50LlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hOdW1iZXJPZkNvbXBvbmVudHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZDb21wb25lbnRzXycgKyB3b3Jrc3BhY2VJZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IDBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoZm9sZGVyTm9kZSwgbWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50IC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVk1Db21wb25lbnRNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFDTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgbnVtYmVyIG9mIGNvbnRhaW5lcnMgKGRlZmluZWQgaW4gQURNRm9sZGVycykgaW4gdGhlIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyB0aGUgdXBkYXRlZCBkYXRhLmNvdW50LlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hOdW1iZXJPZkRlc2lnbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZEZXNpZ25zXycgKyB3b3Jrc3BhY2VJZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IDBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoZm9sZGVyTm9kZSwgbWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50IC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3YXRjaGVycy5oYXNPd25Qcm9wZXJ0eShwYXJlbnRDb250ZXh0LnJlZ2lvbklkKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocGFyZW50Q29udGV4dC5yZWdpb25JZCArICcgaXMgbm90IGEgcmVnaXN0ZXJlZCB3YXRjaGVyISAnICtcclxuICAgICAgICAgICAgICAgICAgICAnVXNlIFwidGhpcy5yZWdpc3RlcldhdGNoZXJcIiBiZWZvcmUgdHJ5aW5nIHRvIGFjY2VzcyBOb2RlIE9iamVjdHMuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIG51bWJlciBvZiB0ZXN0LWJlbmNoZXMgKGRlZmluZWQgaW4gQVRNRm9sZGVycykgaW4gdGhlIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyB0aGUgdXBkYXRlZCBkYXRhLmNvdW50LlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mVGVzdEJlbmNoZXNfJyArIHdvcmtzcGFjZUlkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNVGVzdEJlbmNoTW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcEFsbFJlZ2lvbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCkge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24od2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIHJlZ2lvbklkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoZXIgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZm4pIHtcclxuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGZuKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ0NvbnRleHQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5sb2dDb250ZXh0KGNvbnRleHQpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgcmVxdWlyZSwgYW5ndWxhciAqL1xyXG4vKipcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycsIFsnZ21lLnNlcnZpY2VzJ10pO1xyXG5yZXF1aXJlKCcuL0Jhc2VDeVBoeVNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9QbHVnaW5TZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vRmlsZVNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9FeGVjdXRvclNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9Xb3Jrc3BhY2VTZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vQ29tcG9uZW50U2VydmljZScpO1xyXG5yZXF1aXJlKCcuL0Rlc2lnblNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9UZXN0QmVuY2hTZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vRGVzZXJ0U2VydmljZScpOyJdfQ==

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvbGlicmFyeS9jeXBoeS1jb21wb25lbnRzLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL2FkYXB0LXN0cmFwL2Rpc3QvYWRhcHQtc3RyYXAuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvYWRhcHQtc3RyYXAvZGlzdC9hZGFwdC1zdHJhcC50cGwuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvYW5ndWxhci1ncm93bC9idWlsZC9hbmd1bGFyLWdyb3dsLm1pbi5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvYm93ZXJfY29tcG9uZW50cy9hbmd1bGFyLXNhbml0aXplL2FuZ3VsYXItc2FuaXRpemUuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0NvbXBvbmVudExpc3QvQ29tcG9uZW50RGV0YWlscy5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvQ29tcG9uZW50TGlzdC9Db21wb25lbnRMaXN0LmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Db25maWd1cmF0aW9uU2V0U2VsZWN0b3IvQ29uZmlndXJhdGlvblNldFNlbGVjdG9yLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Db25maWd1cmF0aW9uVGFibGUvQ29uZmlndXJhdGlvblRhYmxlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9EZXNpZ25MaXN0L0Rlc2lnbkRldGFpbHMuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0Rlc2lnbkxpc3QvRGVzaWduTGlzdC5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvRGVzaWduVHJlZS9EZXNpZ25UcmVlLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9TaW1wbGVNb2RhbC9TaW1wbGVNb2RhbC5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvVGVzdEJlbmNoTGlzdC9UZXN0QmVuY2hEZXRhaWxzLmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9UZXN0QmVuY2hMaXN0L1Rlc3RCZW5jaExpc3QuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L1dvcmtlcnNMaXN0L1dvcmtlcnNMaXN0LmpzIiwiQzovR0lUL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Xb3Jrc3BhY2VMaXN0L1dvcmtzcGFjZUxpc3QuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0Jhc2VDeVBoeVNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0NvbXBvbmVudFNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0Rlc2VydFNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0Rlc2lnblNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL0V4ZWN1dG9yU2VydmljZS5qcyIsIkM6L0dJVC93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvRmlsZVNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL1BsdWdpblNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL1Rlc3RCZW5jaFNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL1dvcmtzcGFjZVNlcnZpY2UuanMiLCJDOi9HSVQvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L3NlcnZpY2VzL2N5cGh5LXNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaHZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdHFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3haQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzU5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3J0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIHJlcXVpcmUsIGFuZ3VsYXIgKi9cclxuLyoqXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcbi8vIEV4dGVybmFsIGRlcGVuZGVuY2llc1xyXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQtc2hpbScpO1xyXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQnKTtcclxucmVxdWlyZSgnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9hbmd1bGFyLWdyb3dsL2J1aWxkL2FuZ3VsYXItZ3Jvd2wubWluJyk7XHJcbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvYW5ndWxhci1zYW5pdGl6ZS9hbmd1bGFyLXNhbml0aXplJyk7XHJcbnJlcXVpcmUoJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvYWRhcHQtc3RyYXAvZGlzdC9hZGFwdC1zdHJhcCcpO1xyXG5yZXF1aXJlKCcuLi8uLi9ib3dlcl9jb21wb25lbnRzL2FkYXB0LXN0cmFwL2Rpc3QvYWRhcHQtc3RyYXAudHBsJyk7XHJcblxyXG4vLyBJbnRlcm5hbCBkZXBlbmRlbmNpZXNcclxucmVxdWlyZSgnLi9zZXJ2aWNlcy9jeXBoeS1zZXJ2aWNlcycpO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnLCBbXHJcbiAgICAnY3lwaHkuc2VydmljZXMnLFxyXG4gICAgJ2N5cGh5LmNvbXBvbmVudHMudGVtcGxhdGVzJyxcclxuICAgICdhbmd1bGFyRmlsZVVwbG9hZCcsXHJcbiAgICAnYW5ndWxhci1ncm93bCcsXHJcbiAgICAnbmdTYW5pdGl6ZScsXHJcbiAgICAnYWRhcHR2LmFkYXB0U3RyYXAnXHJcbl0pLmNvbmZpZyhbJ2dyb3dsUHJvdmlkZXInLCBmdW5jdGlvbiAoZ3Jvd2xQcm92aWRlcikge1xyXG4gICAgZ3Jvd2xQcm92aWRlci5nbG9iYWxUaW1lVG9MaXZlKHtzdWNjZXNzOiA1MDAwLCBlcnJvcjogLTEsIHdhcm5pbmc6IDIwMDAwLCBpbmZvOiA1MDAwfSk7XHJcbn1dKTtcclxuXHJcbnJlcXVpcmUoJy4vU2ltcGxlTW9kYWwvU2ltcGxlTW9kYWwnKTtcclxuXHJcbnJlcXVpcmUoJy4vV29ya3NwYWNlTGlzdC9Xb3Jrc3BhY2VMaXN0Jyk7XHJcblxyXG5yZXF1aXJlKCcuL0NvbXBvbmVudExpc3QvQ29tcG9uZW50RGV0YWlscycpO1xyXG5yZXF1aXJlKCcuL0NvbXBvbmVudExpc3QvQ29tcG9uZW50TGlzdCcpO1xyXG5cclxucmVxdWlyZSgnLi9EZXNpZ25MaXN0L0Rlc2lnbkRldGFpbHMnKTtcclxucmVxdWlyZSgnLi9EZXNpZ25MaXN0L0Rlc2lnbkxpc3QnKTtcclxucmVxdWlyZSgnLi9EZXNpZ25UcmVlL0Rlc2lnblRyZWUnKTtcclxuXHJcbnJlcXVpcmUoJy4vVGVzdEJlbmNoTGlzdC9UZXN0QmVuY2hEZXRhaWxzJyk7XHJcbnJlcXVpcmUoJy4vVGVzdEJlbmNoTGlzdC9UZXN0QmVuY2hMaXN0Jyk7XHJcblxyXG5yZXF1aXJlKCcuL0NvbmZpZ3VyYXRpb25UYWJsZS9Db25maWd1cmF0aW9uVGFibGUnKTtcclxucmVxdWlyZSgnLi9Db25maWd1cmF0aW9uU2V0U2VsZWN0b3IvQ29uZmlndXJhdGlvblNldFNlbGVjdG9yJyk7XHJcblxyXG5yZXF1aXJlKCcuL1dvcmtlcnNMaXN0L1dvcmtlcnNMaXN0Jyk7XHJcblxyXG5cclxuXHJcbiIsIi8qKlxuICogYWRhcHQtc3RyYXBcbiAqIEB2ZXJzaW9uIHYyLjAuNiAtIDIwMTQtMTAtMjZcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9BZGFwdHYvYWRhcHQtc3RyYXBcbiAqIEBhdXRob3IgS2FzaHlhcCBQYXRlbCAoa2FzaHlhcEBhZGFwLnR2KVxuICogQGxpY2Vuc2UgTUlUIExpY2Vuc2UsIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbid1c2Ugc3RyaWN0Jztcbi8vIFNvdXJjZTogbW9kdWxlLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAnLCBbXG4gICdhZGFwdHYuYWRhcHRTdHJhcC51dGlscycsXG4gICdhZGFwdHYuYWRhcHRTdHJhcC50cmVlYnJvd3NlcicsXG4gICdhZGFwdHYuYWRhcHRTdHJhcC50YWJsZWxpdGUnLFxuICAnYWRhcHR2LmFkYXB0U3RyYXAudGFibGVhamF4JyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLmxvYWRpbmdpbmRpY2F0b3InLFxuICAnYWRhcHR2LmFkYXB0U3RyYXAuZHJhZ2dhYmxlJyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLmluZmluaXRlZHJvcGRvd24nXG5dKS5wcm92aWRlcignJGFkQ29uZmlnJywgZnVuY3Rpb24gKCkge1xuICB2YXIgaWNvbkNsYXNzZXMgPSB0aGlzLmljb25DbGFzc2VzID0ge1xuICAgICAgZXhwYW5kOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzLXNpZ24nLFxuICAgICAgY29sbGFwc2U6ICdnbHlwaGljb24gZ2x5cGhpY29uLW1pbnVzLXNpZ24nLFxuICAgICAgbG9hZGluZ1NwaW5uZXI6ICdnbHlwaGljb24gZ2x5cGhpY29uLXJlZnJlc2ggYWQtc3BpbicsXG4gICAgICBmaXJzdFBhZ2U6ICdnbHlwaGljb24gZ2x5cGhpY29uLWZhc3QtYmFja3dhcmQnLFxuICAgICAgcHJldmlvdXNQYWdlOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1iYWNrd2FyZCcsXG4gICAgICBuZXh0UGFnZTogJ2dseXBoaWNvbiBnbHlwaGljb24tZm9yd2FyZCcsXG4gICAgICBsYXN0UGFnZTogJ2dseXBoaWNvbiBnbHlwaGljb24tZmFzdC1mb3J3YXJkJyxcbiAgICAgIHNvcnRBc2NlbmRpbmc6ICdnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tdXAnLFxuICAgICAgc29ydERlc2NlbmRpbmc6ICdnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tZG93bicsXG4gICAgICBzb3J0YWJsZTogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVzaXplLXZlcnRpY2FsJyxcbiAgICAgIGRyYWdnYWJsZTogJ2dseXBoaWNvbiBnbHlwaGljb24tYWxpZ24tanVzdGlmeScsXG4gICAgICBzZWxlY3RlZEl0ZW06ICdnbHlwaGljb24gZ2x5cGhpY29uLW9rJ1xuICAgIH0sIHBhZ2luZyA9IHRoaXMucGFnaW5nID0ge1xuICAgICAgcmVxdWVzdDoge1xuICAgICAgICBzdGFydDogJ3NraXAnLFxuICAgICAgICBwYWdlU2l6ZTogJ2xpbWl0JyxcbiAgICAgICAgcGFnZTogJ3BhZ2UnLFxuICAgICAgICBzb3J0RmllbGQ6ICdzb3J0JyxcbiAgICAgICAgc29ydERpcmVjdGlvbjogJ3NvcnRfZGlyJyxcbiAgICAgICAgc29ydEFzY1ZhbHVlOiAnYXNjJyxcbiAgICAgICAgc29ydERlc2NWYWx1ZTogJ2Rlc2MnXG4gICAgICB9LFxuICAgICAgcmVzcG9uc2U6IHtcbiAgICAgICAgaXRlbXNMb2NhdGlvbjogJ2RhdGEnLFxuICAgICAgICB0b3RhbEl0ZW1zOiAncGFnaW5hdGlvbi50b3RhbENvdW50J1xuICAgICAgfVxuICAgIH07XG4gIHRoaXMuJGdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWNvbkNsYXNzZXM6IGljb25DbGFzc2VzLFxuICAgICAgcGFnaW5nOiBwYWdpbmdcbiAgICB9O1xuICB9O1xufSk7XG5cbi8vIFNvdXJjZTogZHJhZ2dhYmxlLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAuZHJhZ2dhYmxlJywgW10pLmRpcmVjdGl2ZSgnYWREcmFnJywgW1xuICAnJHJvb3RTY29wZScsXG4gICckcGFyc2UnLFxuICAnJHRpbWVvdXQnLFxuICBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHBhcnNlLCAkdGltZW91dCkge1xuICAgIGZ1bmN0aW9uIGxpbmtGdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHNjb3BlLmRyYWdnYWJsZSA9IGF0dHJzLmFkRHJhZztcbiAgICAgIHNjb3BlLmhhc0hhbmRsZSA9IGF0dHJzLmFkRHJhZ0hhbmRsZSA9PT0gJ2ZhbHNlJyB8fCB0eXBlb2YgYXR0cnMuYWREcmFnSGFuZGxlID09PSAndW5kZWZpbmVkJyA/IGZhbHNlIDogdHJ1ZTtcbiAgICAgIHNjb3BlLm9uRHJhZ1N0YXJ0Q2FsbGJhY2sgPSAkcGFyc2UoYXR0cnMuYWREcmFnQmVnaW4pIHx8IG51bGw7XG4gICAgICBzY29wZS5vbkRyYWdFbmRDYWxsYmFjayA9ICRwYXJzZShhdHRycy5hZERyYWdFbmQpIHx8IG51bGw7XG4gICAgICBzY29wZS5kYXRhID0gbnVsbDtcbiAgICAgIHZhciBvZmZzZXQsIG14LCBteSwgdHgsIHR5O1xuICAgICAgdmFyIGhhc1RvdWNoID0gJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgLyogLS0gRXZlbnRzIC0tICovXG4gICAgICB2YXIgc3RhcnRFdmVudHMgPSAndG91Y2hzdGFydCBtb3VzZWRvd24nO1xuICAgICAgdmFyIG1vdmVFdmVudHMgPSAndG91Y2htb3ZlIG1vdXNlbW92ZSc7XG4gICAgICB2YXIgZW5kRXZlbnRzID0gJ3RvdWNoZW5kIG1vdXNldXAnO1xuICAgICAgdmFyICRkb2N1bWVudCA9ICQoZG9jdW1lbnQpO1xuICAgICAgdmFyICR3aW5kb3cgPSAkKHdpbmRvdyk7XG4gICAgICB2YXIgZHJhZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgIHZhciBwcmVzc1RpbWVyID0gbnVsbDtcbiAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIGVsZW1lbnQuYXR0cignZHJhZ2dhYmxlJywgJ2ZhbHNlJyk7XG4gICAgICAgIC8vIHByZXZlbnQgbmF0aXZlIGRyYWdcbiAgICAgICAgdG9nZ2xlTGlzdGVuZXJzKHRydWUpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gdG9nZ2xlTGlzdGVuZXJzKGVuYWJsZSkge1xuICAgICAgICBpZiAoIWVuYWJsZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBhZGQgbGlzdGVuZXJzLlxuICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95Jywgb25EZXN0cm95KTtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2FkRHJhZycsIG9uRW5hYmxlQ2hhbmdlKTtcbiAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJzLmFkRHJhZ0RhdGEsIG9uRHJhZ0RhdGFDaGFuZ2UpO1xuICAgICAgICBzY29wZS4kb24oJ2RyYWdnYWJsZTpzdGFydCcsIG9uRHJhZ1N0YXJ0KTtcbiAgICAgICAgc2NvcGUuJG9uKCdkcmFnZ2FibGU6ZW5kJywgb25EcmFnRW5kKTtcbiAgICAgICAgaWYgKHNjb3BlLmhhc0hhbmRsZSkge1xuICAgICAgICAgIGVsZW1lbnQub24oc3RhcnRFdmVudHMsICcuYWQtZHJhZy1oYW5kbGUnLCBvblByZXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50Lm9uKHN0YXJ0RXZlbnRzLCBvblByZXNzKTtcbiAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdhZC1kcmFnZ2FibGUnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWhhc1RvdWNoKSB7XG4gICAgICAgICAgZWxlbWVudC5vbignbW91c2Vkb3duJywgJy5hZC1kcmFnLWhhbmRsZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSk7ICAvLyBwcmV2ZW50IG5hdGl2ZSBkcmFnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vLS0tIEV2ZW50IEhhbmRsZXJzIC0tLVxuICAgICAgZnVuY3Rpb24gb25EcmFnU3RhcnQoZXZ0LCBvKSB7XG4gICAgICAgIGlmIChvLmVsID09PSBlbGVtZW50ICYmIG8uY2FsbGJhY2spIHtcbiAgICAgICAgICBvLmNhbGxiYWNrKGV2dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRHJhZ0VuZChldnQsIG8pIHtcbiAgICAgICAgaWYgKG8uZWwgPT09IGVsZW1lbnQgJiYgby5jYWxsYmFjaykge1xuICAgICAgICAgIG8uY2FsbGJhY2soZXZ0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25EZXN0cm95KCkge1xuICAgICAgICB0b2dnbGVMaXN0ZW5lcnMoZmFsc2UpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25EcmFnRGF0YUNoYW5nZShuZXdWYWwpIHtcbiAgICAgICAgc2NvcGUuZGF0YSA9IG5ld1ZhbDtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRW5hYmxlQ2hhbmdlKG5ld1ZhbCkge1xuICAgICAgICBkcmFnRW5hYmxlZCA9IHNjb3BlLiRldmFsKG5ld1ZhbCk7XG4gICAgICB9XG4gICAgICAvKlxuICAgICAgKiBXaGVuIHRoZSBlbGVtZW50IGlzIGNsaWNrZWQgc3RhcnQgdGhlIGRyYWcgYmVoYXZpb3VyXG4gICAgICAqIE9uIHRvdWNoIGRldmljZXMgYXMgYSBzbWFsbCBkZWxheSBzbyBhcyBub3QgdG8gcHJldmVudCBuYXRpdmUgd2luZG93IHNjcm9sbGluZ1xuICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIG9uUHJlc3MoZXZ0KSB7XG4gICAgICAgIGlmICghZHJhZ0VuYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc1RvdWNoKSB7XG4gICAgICAgICAgY2FuY2VsUHJlc3MoKTtcbiAgICAgICAgICBwcmVzc1RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYW5jZWxQcmVzcygpO1xuICAgICAgICAgICAgb25Mb25nUHJlc3MoZXZ0KTtcbiAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICRkb2N1bWVudC5vbihtb3ZlRXZlbnRzLCBjYW5jZWxQcmVzcyk7XG4gICAgICAgICAgJGRvY3VtZW50Lm9uKGVuZEV2ZW50cywgY2FuY2VsUHJlc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9uTG9uZ1ByZXNzKGV2dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qXG4gICAgICAgKiBSZXR1cm5zIHRoZSBpbmxpbmUgcHJvcGVydHkgb2YgYW4gZWxlbWVudFxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBnZXRJbmxpbmVQcm9wZXJ0eShwcm9wLCBlbGVtZW50KSB7XG4gICAgICAgIHZhciBzdHlsZXMgPSAkKGVsZW1lbnQpLmF0dHIoJ3N0eWxlJyksIHZhbHVlO1xuICAgICAgICBpZiAoc3R5bGVzKSB7XG4gICAgICAgICAgc3R5bGVzLnNwbGl0KCc7JykuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZS5zcGxpdCgnOicpO1xuICAgICAgICAgICAgaWYgKCQudHJpbShzdHlsZVswXSkgPT09IHByb3ApIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBzdHlsZVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgICAvKlxuICAgICAgICogUHJlc2VydmUgdGhlIHdpZHRoIG9mIHRoZSBlbGVtZW50IGR1cmluZyBkcmFnXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIHBlcnNpc3RFbGVtZW50V2lkdGgoKSB7XG4gICAgICAgIGlmIChnZXRJbmxpbmVQcm9wZXJ0eSgnd2lkdGgnLCBlbGVtZW50KSkge1xuICAgICAgICAgIGVsZW1lbnQuZGF0YSgnYWQtZHJhZ2dhYmxlLXRlbXAtd2lkdGgnLCBnZXRJbmxpbmVQcm9wZXJ0eSgnd2lkdGgnLCBlbGVtZW50KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC53aWR0aChlbGVtZW50LndpZHRoKCkpO1xuICAgICAgICBlbGVtZW50LmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKGdldElubGluZVByb3BlcnR5KCd3aWR0aCcsIHRoaXMpKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ2FkLWRyYWdnYWJsZS10ZW1wLXdpZHRoJywgZ2V0SW5saW5lUHJvcGVydHkoJ3dpZHRoJywgdGhpcykpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAkKHRoaXMpLndpZHRoKCQodGhpcykud2lkdGgoKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gY2FuY2VsUHJlc3MoKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChwcmVzc1RpbWVyKTtcbiAgICAgICAgJGRvY3VtZW50Lm9mZihtb3ZlRXZlbnRzLCBjYW5jZWxQcmVzcyk7XG4gICAgICAgICRkb2N1bWVudC5vZmYoZW5kRXZlbnRzLCBjYW5jZWxQcmVzcyk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkxvbmdQcmVzcyhldnQpIHtcbiAgICAgICAgaWYgKCFkcmFnRW5hYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb2Zmc2V0ID0gZWxlbWVudC5vZmZzZXQoKTtcbiAgICAgICAgaWYgKHNjb3BlLmhhc0hhbmRsZSkge1xuICAgICAgICAgIG9mZnNldCA9IGVsZW1lbnQuZmluZCgnLmFkLWRyYWctaGFuZGxlJykub2Zmc2V0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2Zmc2V0ID0gZWxlbWVudC5vZmZzZXQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdhZC1kcmFnZ2luZycpO1xuICAgICAgICBteCA9IGV2dC5wYWdlWCB8fCBldnQub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgICBteSA9IGV2dC5wYWdlWSB8fCBldnQub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgICB0eCA9IG14IC0gb2Zmc2V0LmxlZnQgLSAkd2luZG93LnNjcm9sbExlZnQoKTtcbiAgICAgICAgdHkgPSBteSAtIG9mZnNldC50b3AgLSAkd2luZG93LnNjcm9sbFRvcCgpO1xuICAgICAgICBwZXJzaXN0RWxlbWVudFdpZHRoKCk7XG4gICAgICAgIG1vdmVFbGVtZW50KHR4LCB0eSk7XG4gICAgICAgICRkb2N1bWVudC5vbihtb3ZlRXZlbnRzLCBvbk1vdmUpO1xuICAgICAgICAkZG9jdW1lbnQub24oZW5kRXZlbnRzLCBvblJlbGVhc2UpO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2RyYWdnYWJsZTpzdGFydCcsIHtcbiAgICAgICAgICB4OiBteCxcbiAgICAgICAgICB5OiBteSxcbiAgICAgICAgICB0eDogdHgsXG4gICAgICAgICAgdHk6IHR5LFxuICAgICAgICAgIGVsOiBlbGVtZW50LFxuICAgICAgICAgIGRhdGE6IHNjb3BlLmRhdGEsXG4gICAgICAgICAgY2FsbGJhY2s6IG9uRHJhZ0JlZ2luXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25Nb3ZlKGV2dCkge1xuICAgICAgICB2YXIgY3gsIGN5O1xuICAgICAgICBpZiAoIWRyYWdFbmFibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjeCA9IGV2dC5wYWdlWCB8fCBldnQub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgICBjeSA9IGV2dC5wYWdlWSB8fCBldnQub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgICB0eCA9IGN4IC0gbXggKyBvZmZzZXQubGVmdCAtICR3aW5kb3cuc2Nyb2xsTGVmdCgpO1xuICAgICAgICB0eSA9IGN5IC0gbXkgKyBvZmZzZXQudG9wIC0gJHdpbmRvdy5zY3JvbGxUb3AoKTtcbiAgICAgICAgbW92ZUVsZW1lbnQodHgsIHR5KTtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkcmFnZ2FibGU6bW92ZScsIHtcbiAgICAgICAgICB4OiBteCxcbiAgICAgICAgICB5OiBteSxcbiAgICAgICAgICB0eDogdHgsXG4gICAgICAgICAgdHk6IHR5LFxuICAgICAgICAgIGVsOiBlbGVtZW50LFxuICAgICAgICAgIGRhdGE6IHNjb3BlLmRhdGFcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvblJlbGVhc2UoZXZ0KSB7XG4gICAgICAgIGlmICghZHJhZ0VuYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZHJhZ2dhYmxlOmVuZCcsIHtcbiAgICAgICAgICB4OiBteCxcbiAgICAgICAgICB5OiBteSxcbiAgICAgICAgICB0eDogdHgsXG4gICAgICAgICAgdHk6IHR5LFxuICAgICAgICAgIGVsOiBlbGVtZW50LFxuICAgICAgICAgIGRhdGE6IHNjb3BlLmRhdGEsXG4gICAgICAgICAgY2FsbGJhY2s6IG9uRHJhZ0NvbXBsZXRlXG4gICAgICAgIH0pO1xuICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdhZC1kcmFnZ2luZycpO1xuICAgICAgICByZXNldCgpO1xuICAgICAgICAkZG9jdW1lbnQub2ZmKG1vdmVFdmVudHMsIG9uTW92ZSk7XG4gICAgICAgICRkb2N1bWVudC5vZmYoZW5kRXZlbnRzLCBvblJlbGVhc2UpO1xuICAgICAgfVxuICAgICAgLy8gQ2FsbGJhY2tzXG4gICAgICBmdW5jdGlvbiBvbkRyYWdCZWdpbihldnQpIHtcbiAgICAgICAgaWYgKCFzY29wZS5vbkRyYWdTdGFydENhbGxiYWNrKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2NvcGUub25EcmFnU3RhcnRDYWxsYmFjayhzY29wZSwge1xuICAgICAgICAgICAgJGRhdGE6IHNjb3BlLmRhdGEsXG4gICAgICAgICAgICAkZHJhZ0VsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAkZXZlbnQ6IGV2dFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRHJhZ0NvbXBsZXRlKGV2dCkge1xuICAgICAgICBpZiAoIXNjb3BlLm9uRHJhZ0VuZENhbGxiYWNrKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRvIGZpeCBhIGJ1ZyBpc3N1ZSB3aGVyZSBvbkRyYWdFbmQgaGFwcGVucyBiZWZvcmVcbiAgICAgICAgLy8gb25Ecm9wRW5kLiBDdXJyZW50bHkgdGhlIG9ubHkgd2F5IGFyb3VuZCB0aGlzXG4gICAgICAgIC8vIElkZWFsbHkgb25Ecm9wRW5kIHNob3VsZCBmaXJlIGJlZm9yZSBvbkRyYWdFbmRcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzY29wZS5vbkRyYWdFbmRDYWxsYmFjayhzY29wZSwge1xuICAgICAgICAgICAgICAkZGF0YTogc2NvcGUuZGF0YSxcbiAgICAgICAgICAgICAgJGRyYWdFbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAkZXZlbnQ6IGV2dFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgICB9XG4gICAgICAvLyB1dGlscyBmdW5jdGlvbnNcbiAgICAgIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgICBlbGVtZW50LmNzcyh7XG4gICAgICAgICAgbGVmdDogJycsXG4gICAgICAgICAgdG9wOiAnJyxcbiAgICAgICAgICBwb3NpdGlvbjogJycsXG4gICAgICAgICAgJ3otaW5kZXgnOiAnJ1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHdpZHRoID0gZWxlbWVudC5kYXRhKCdhZC1kcmFnZ2FibGUtdGVtcC13aWR0aCcpO1xuICAgICAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgICBlbGVtZW50LmNzcyh7IHdpZHRoOiB3aWR0aCB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50LmNzcyh7IHdpZHRoOiAnJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50LmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIHdpZHRoID0gJCh0aGlzKS5kYXRhKCdhZC1kcmFnZ2FibGUtdGVtcC13aWR0aCcpO1xuICAgICAgICAgIGlmICh3aWR0aCkge1xuICAgICAgICAgICAgJCh0aGlzKS5jc3MoeyB3aWR0aDogd2lkdGggfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQodGhpcykuY3NzKHsgd2lkdGg6ICcnIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBtb3ZlRWxlbWVudCh4LCB5KSB7XG4gICAgICAgIGVsZW1lbnQuY3NzKHtcbiAgICAgICAgICBsZWZ0OiB4LFxuICAgICAgICAgIHRvcDogeSxcbiAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcbiAgICAgICAgICAnei1pbmRleCc6IDk5OTk5XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaW5pdCgpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgIGxpbms6IGxpbmtGdW5jdGlvblxuICAgIH07XG4gIH1cbl0pLmRpcmVjdGl2ZSgnYWREcm9wJywgW1xuICAnJHJvb3RTY29wZScsXG4gICckcGFyc2UnLFxuICBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHBhcnNlKSB7XG4gICAgZnVuY3Rpb24gbGlua0Z1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgc2NvcGUuZHJvcHBhYmxlID0gYXR0cnMuYWREcm9wO1xuICAgICAgc2NvcGUub25Ecm9wQ2FsbGJhY2sgPSAkcGFyc2UoYXR0cnMuYWREcm9wRW5kKSB8fCBudWxsO1xuICAgICAgc2NvcGUub25Ecm9wT3ZlckNhbGxiYWNrID0gJHBhcnNlKGF0dHJzLmFkRHJvcE92ZXIpIHx8IG51bGw7XG4gICAgICBzY29wZS5vbkRyb3BMZWF2ZUNhbGxiYWNrID0gJHBhcnNlKGF0dHJzLmFkRHJvcExlYXZlKSB8fCBudWxsO1xuICAgICAgdmFyIGRyb3BFbmFibGVkID0gZmFsc2U7XG4gICAgICB2YXIgZWxlbSA9IG51bGw7XG4gICAgICB2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcbiAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIHRvZ2dsZUxpc3RlbmVycyh0cnVlKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHRvZ2dsZUxpc3RlbmVycyhlbmFibGUpIHtcbiAgICAgICAgaWYgKCFlbmFibGUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gYWRkIGxpc3RlbmVycy5cbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2FkRHJvcCcsIG9uRW5hYmxlQ2hhbmdlKTtcbiAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIG9uRGVzdHJveSk7XG4gICAgICAgIHNjb3BlLiRvbignZHJhZ2dhYmxlOm1vdmUnLCBvbkRyYWdNb3ZlKTtcbiAgICAgICAgc2NvcGUuJG9uKCdkcmFnZ2FibGU6ZW5kJywgb25EcmFnRW5kKTtcbiAgICAgICAgc2NvcGUuJG9uKCdkcmFnZ2FibGU6Y2hhbmdlJywgb25Ecm9wQ2hhbmdlKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRGVzdHJveSgpIHtcbiAgICAgICAgdG9nZ2xlTGlzdGVuZXJzKGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRW5hYmxlQ2hhbmdlKG5ld1ZhbCkge1xuICAgICAgICBkcm9wRW5hYmxlZCA9IHNjb3BlLiRldmFsKG5ld1ZhbCk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkRyb3BDaGFuZ2UoZXZ0LCBvYmopIHtcbiAgICAgICAgaWYgKGVsZW0gIT09IG9iai5lbCkge1xuICAgICAgICAgIGVsZW0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkRyYWdNb3ZlKGV2dCwgb2JqKSB7XG4gICAgICAgIGlmICghZHJvcEVuYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgdGhlIGRyb3BFbGVtZW50IGFuZCB0aGUgZHJhZyBlbGVtZW50IGFyZSB0aGUgc2FtZVxuICAgICAgICBpZiAoZWxlbWVudCA9PT0gb2JqLmVsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbCA9IGdldEN1cnJlbnREcm9wRWxlbWVudChvYmoudHgsIG9iai50eSwgb2JqLmVsKTtcbiAgICAgICAgaWYgKGVsICE9PSBudWxsKSB7XG4gICAgICAgICAgZWxlbSA9IGVsO1xuICAgICAgICAgIG9iai5lbC5sYXN0RHJvcEVsZW1lbnQgPSBlbGVtO1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzY29wZS5vbkRyb3BPdmVyQ2FsbGJhY2soc2NvcGUsIHtcbiAgICAgICAgICAgICAgJGRhdGE6IG9iai5kYXRhLFxuICAgICAgICAgICAgICAkZHJhZ0VsZW1lbnQ6IG9iai5lbCxcbiAgICAgICAgICAgICAgJGRyb3BFbGVtZW50OiBlbGVtLFxuICAgICAgICAgICAgICAkZXZlbnQ6IGV2dFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnYWQtZHJvcC1vdmVyJyk7XG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkcmFnZ2FibGU6Y2hhbmdlJywgeyBlbDogZWxlbSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAob2JqLmVsLmxhc3REcm9wRWxlbWVudCA9PT0gZWxlbWVudCkge1xuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgc2NvcGUub25Ecm9wTGVhdmVDYWxsYmFjayhzY29wZSwge1xuICAgICAgICAgICAgICAgICRkYXRhOiBvYmouZGF0YSxcbiAgICAgICAgICAgICAgICAkZHJhZ0VsZW1lbnQ6IG9iai5lbCxcbiAgICAgICAgICAgICAgICAkZHJvcEVsZW1lbnQ6IG9iai5lbC5sYXN0RHJvcEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgJGV2ZW50OiBldnRcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG9iai5lbC5sYXN0RHJvcEVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2FkLWRyb3Atb3ZlcicpO1xuICAgICAgICAgICAgZGVsZXRlIG9iai5lbC5sYXN0RHJvcEVsZW1lbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkRyYWdFbmQoZXZ0LCBvYmopIHtcbiAgICAgICAgaWYgKCFkcm9wRW5hYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbSkge1xuICAgICAgICAgIC8vIGNhbGwgdGhlIGFkRHJvcCBlbGVtZW50IGNhbGxiYWNrXG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLm9uRHJvcENhbGxiYWNrKHNjb3BlLCB7XG4gICAgICAgICAgICAgICRkYXRhOiBvYmouZGF0YSxcbiAgICAgICAgICAgICAgJGRyYWdFbGVtZW50OiBvYmouZWwsXG4gICAgICAgICAgICAgICRkcm9wRWxlbWVudDogZWxlbSxcbiAgICAgICAgICAgICAgJGV2ZW50OiBldnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGVsZW0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBnZXRDdXJyZW50RHJvcEVsZW1lbnQoeCwgeSkge1xuICAgICAgICB2YXIgYm91bmRzID0gZWxlbWVudC5vZmZzZXQoKTtcbiAgICAgICAgLy8gc2V0IGRyYWcgc2Vuc2l0aXZpdHlcbiAgICAgICAgdmFyIHZ0aG9sZCA9IE1hdGguZmxvb3IoZWxlbWVudC5vdXRlckhlaWdodCgpIC8gNik7XG4gICAgICAgIHggPSB4ICsgJHdpbmRvdy5zY3JvbGxMZWZ0KCk7XG4gICAgICAgIHkgPSB5ICsgJHdpbmRvdy5zY3JvbGxUb3AoKTtcbiAgICAgICAgcmV0dXJuIHkgPj0gYm91bmRzLnRvcCArIHZ0aG9sZCAmJiB5IDw9IGJvdW5kcy50b3AgKyBlbGVtZW50Lm91dGVySGVpZ2h0KCkgLSB2dGhvbGQgJiYgKHggPj0gYm91bmRzLmxlZnQgJiYgeCA8PSBib3VuZHMubGVmdCArIGVsZW1lbnQub3V0ZXJXaWR0aCgpKSAmJiAoeCA+PSBib3VuZHMubGVmdCAmJiB4IDw9IGJvdW5kcy5sZWZ0ICsgZWxlbWVudC5vdXRlcldpZHRoKCkpID8gZWxlbWVudCA6IG51bGw7XG4gICAgICB9XG4gICAgICBpbml0KCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgbGluazogbGlua0Z1bmN0aW9uXG4gICAgfTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogaW5maW5pdGVkcm9wZG93bi5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLmluZmluaXRlZHJvcGRvd24nLCBbXG4gICdhZGFwdHYuYWRhcHRTdHJhcC51dGlscycsXG4gICdhZGFwdHYuYWRhcHRTdHJhcC5sb2FkaW5naW5kaWNhdG9yJ1xuXSkuZGlyZWN0aXZlKCdhZEluZmluaXRlRHJvcGRvd24nLCBbXG4gICckcGFyc2UnLFxuICAnJGNvbXBpbGUnLFxuICAnJHRlbXBsYXRlQ2FjaGUnLFxuICAnJGFkQ29uZmlnJyxcbiAgJ2FkTG9hZFBhZ2UnLFxuICAnYWREZWJvdW5jZScsXG4gICdhZFN0cmFwVXRpbHMnLFxuICAnYWRMb2FkTG9jYWxQYWdlJyxcbiAgZnVuY3Rpb24gKCRwYXJzZSwgJGNvbXBpbGUsICR0ZW1wbGF0ZUNhY2hlLCAkYWRDb25maWcsIGFkTG9hZFBhZ2UsIGFkRGVib3VuY2UsIGFkU3RyYXBVdGlscywgYWRMb2FkTG9jYWxQYWdlKSB7XG5mdW5jdGlvbiBsaW5rRnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAvLyBzY29wZSBpbml0aWFsaXphdGlvblxuICAgICAgc2NvcGUuYXR0cnMgPSBhdHRycztcbiAgICAgIHNjb3BlLmFkU3RyYXBVdGlscyA9IGFkU3RyYXBVdGlscztcbiAgICAgIHNjb3BlLml0ZW1zID0ge1xuICAgICAgICBsaXN0OiBbXSxcbiAgICAgICAgcGFnaW5nOiB7XG4gICAgICAgICAgY3VycmVudFBhZ2U6IDEsXG4gICAgICAgICAgdG90YWxQYWdlczogdW5kZWZpbmVkLFxuICAgICAgICAgIHBhZ2VTaXplOiBOdW1iZXIoYXR0cnMucGFnZVNpemUpIHx8IDEwXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzY29wZS5sb2NhbENvbmZpZyA9IHtcbiAgICAgICAgbG9hZGluZ0RhdGE6IGZhbHNlLFxuICAgICAgICBzaW5nbGVTZWxlY3Rpb25Nb2RlOiAkcGFyc2UoYXR0cnMuc2luZ2xlU2VsZWN0aW9uTW9kZSkoKSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgZGltZW5zaW9uczoge1xuICAgICAgICAgICdtYXgtaGVpZ2h0JzogYXR0cnMubWF4SGVpZ2h0IHx8ICcyMDBweCcsXG4gICAgICAgICAgJ21heC13aWR0aCc6IGF0dHJzLm1heFdpZHRoIHx8ICdhdXRvJ1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgc2NvcGUuc2VsZWN0ZWRJdGVtcyA9IHNjb3BlLiRldmFsKGF0dHJzLnNlbGVjdGVkSXRlbXMpIHx8IFtdO1xuICAgICAgc2NvcGUuYWpheENvbmZpZyA9IHNjb3BlLiRldmFsKGF0dHJzLmFqYXhDb25maWcpIHx8IHt9O1xuICAgICAgLy8gLS0tLS0tLS0tLSBMb2NhbCBkYXRhIC0tLS0tLS0tLS0gLy9cbiAgICAgIHZhciBsYXN0UmVxdWVzdFRva2VuLCB3YXRjaGVycyA9IFtdO1xuICAgICAgLy8gLS0tLS0tLS0tLSB1aSBoYW5kbGVycyAtLS0tLS0tLS0tIC8vXG4gICAgICBzY29wZS5hZGRSZW1vdmVJdGVtID0gZnVuY3Rpb24gKGV2ZW50LCBpdGVtLCBpdGVtcykge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgaWYgKHNjb3BlLmxvY2FsQ29uZmlnLnNpbmdsZVNlbGVjdGlvbk1vZGUpIHtcbiAgICAgICAgICBzY29wZS5zZWxlY3RlZEl0ZW1zWzBdID0gaXRlbTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhZFN0cmFwVXRpbHMuYWRkUmVtb3ZlSXRlbUZyb21MaXN0KGl0ZW0sIGl0ZW1zKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2FsbGJhY2sgPSBzY29wZS4kZXZhbChhdHRycy5vbkl0ZW1DbGljayk7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgIGNhbGxiYWNrKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgc2NvcGUubG9hZFBhZ2UgPSBhZERlYm91bmNlKGZ1bmN0aW9uIChwYWdlKSB7XG4gICAgICAgIGxhc3RSZXF1ZXN0VG9rZW4gPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICBzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSA9IHRydWU7XG4gICAgICAgIHZhciBwYWdlTG9hZGVyID0gc2NvcGUuJGV2YWwoYXR0cnMucGFnZUxvYWRlcikgfHwgYWRMb2FkUGFnZSwgcGFyYW1zID0ge1xuICAgICAgICAgICAgcGFnZU51bWJlcjogcGFnZSxcbiAgICAgICAgICAgIHBhZ2VTaXplOiBzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUsXG4gICAgICAgICAgICBzb3J0S2V5OiBzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUsXG4gICAgICAgICAgICBzb3J0RGlyZWN0aW9uOiBzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlLFxuICAgICAgICAgICAgYWpheENvbmZpZzogc2NvcGUuYWpheENvbmZpZyxcbiAgICAgICAgICAgIHRva2VuOiBsYXN0UmVxdWVzdFRva2VuXG4gICAgICAgICAgfSwgc3VjY2Vzc0hhbmRsZXIgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS50b2tlbiA9PT0gbGFzdFJlcXVlc3RUb2tlbikge1xuICAgICAgICAgICAgICBpZiAocGFnZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLml0ZW1zLmxpc3QgPSByZXNwb25zZS5pdGVtcztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzY29wZS5pdGVtcy5saXN0ID0gc2NvcGUuaXRlbXMubGlzdC5jb25jYXQocmVzcG9uc2UuaXRlbXMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzID0gcmVzcG9uc2UudG90YWxQYWdlcztcbiAgICAgICAgICAgICAgc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID0gcmVzcG9uc2UuY3VycmVudFBhZ2U7XG4gICAgICAgICAgICAgIHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgZXJyb3JIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEgPSBmYWxzZTtcbiAgICAgICAgICB9O1xuICAgICAgICBpZiAoYXR0cnMubG9jYWxEYXRhU291cmNlKSB7XG4gICAgICAgICAgcGFyYW1zLmxvY2FsRGF0YSA9IHNjb3BlLiRldmFsKGF0dHJzLmxvY2FsRGF0YVNvdXJjZSk7XG4gICAgICAgICAgc3VjY2Vzc0hhbmRsZXIoYWRMb2FkTG9jYWxQYWdlKHBhcmFtcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhZ2VMb2FkZXIocGFyYW1zKS50aGVuKHN1Y2Nlc3NIYW5kbGVyLCBlcnJvckhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgICB9LCAxMCk7XG4gICAgICBzY29wZS5sb2FkTmV4dFBhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEpIHtcbiAgICAgICAgICBpZiAoc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlICsgMSA8PSBzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcykge1xuICAgICAgICAgICAgc2NvcGUubG9hZFBhZ2Uoc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlICsgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgLy8gLS0tLS0tLS0tLSBpbml0aWFsaXphdGlvbiBhbmQgZXZlbnQgbGlzdGVuZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgIC8vV2UgZG8gdGhlIGNvbXBpbGUgYWZ0ZXIgaW5qZWN0aW5nIHRoZSBuYW1lIHNwYWNpbmcgaW50byB0aGUgdGVtcGxhdGUuXG4gICAgICBzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gc2V0IHdhdGNoZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgIC8vIHJlc2V0IG9uIHBhcmFtZXRlciBjaGFuZ2VcbiAgICAgIGlmIChhdHRycy5hamF4Q29uZmlnKSB7XG4gICAgICAgIHNjb3BlLiR3YXRjaChhdHRycy5hamF4Q29uZmlnLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMubG9jYWxEYXRhU291cmNlKSB7XG4gICAgICAgIHdhdGNoZXJzLnB1c2goc2NvcGUuJHdhdGNoKGF0dHJzLmxvY2FsRGF0YVNvdXJjZSwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICBzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgd2F0Y2hlcnMucHVzaChzY29wZS4kd2F0Y2goYXR0cnMubG9jYWxEYXRhU291cmNlICsgJy5sZW5ndGgnLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgICAgLy8gLS0tLS0tLS0tLSBkaXNhYmxlIHdhdGNoZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdhdGNoZXJzLmZvckVhY2goZnVuY3Rpb24gKHdhdGNoZXIpIHtcbiAgICAgICAgICB3YXRjaGVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB2YXIgbGlzdENvbnRhaW5lciA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5maW5kKCd1bCcpWzBdO1xuICAgICAgLy8gaW5maW5pdGUgc2Nyb2xsIGhhbmRsZXJcbiAgICAgIHZhciBsb2FkRnVuY3Rpb24gPSBhZERlYm91bmNlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBUaGlzIGlzIGZvciBpbmZpbml0ZSBzY3JvbGxpbmcuXG4gICAgICAgICAgLy8gV2hlbiB0aGUgc2Nyb2xsIGdldHMgY2xvc2VyIHRvIHRoZSBib3R0b20sIGxvYWQgbW9yZSBpdGVtcy5cbiAgICAgICAgICBpZiAobGlzdENvbnRhaW5lci5zY3JvbGxUb3AgKyBsaXN0Q29udGFpbmVyLm9mZnNldEhlaWdodCA+PSBsaXN0Q29udGFpbmVyLnNjcm9sbEhlaWdodCAtIDMwMCkge1xuICAgICAgICAgICAgc2NvcGUubG9hZE5leHRQYWdlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCA1MCk7XG4gICAgICBhbmd1bGFyLmVsZW1lbnQobGlzdENvbnRhaW5lcikuYmluZCgnbW91c2V3aGVlbCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LmRlbHRhWSkge1xuICAgICAgICAgIGxpc3RDb250YWluZXIuc2Nyb2xsVG9wICs9IGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGVsdGFZO1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgbG9hZEZ1bmN0aW9uKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICBzY29wZTogdHJ1ZSxcbiAgICAgIGxpbms6IGxpbmtGdW5jdGlvbixcbiAgICAgIHRlbXBsYXRlVXJsOiAnaW5maW5pdGVkcm9wZG93bi9pbmZpbml0ZWRyb3Bkb3duLnRwbC5odG1sJ1xuICAgIH07XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IGxvYWRpbmdpbmRpY2F0b3IuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC5sb2FkaW5naW5kaWNhdG9yJywgW10pLmRpcmVjdGl2ZSgnYWRMb2FkaW5nSWNvbicsIFtcbiAgJyRhZENvbmZpZycsXG4gICckY29tcGlsZScsXG4gIGZ1bmN0aW9uICgkYWRDb25maWcsICRjb21waWxlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICBjb21waWxlOiBmdW5jdGlvbiBjb21waWxlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHByZTogZnVuY3Rpb24gcHJlTGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHZhciBsb2FkaW5nSWNvbkNsYXNzID0gYXR0cnMubG9hZGluZ0ljb25DbGFzcyB8fCAkYWRDb25maWcuaWNvbkNsYXNzZXMubG9hZGluZ1NwaW5uZXIsIG5nU3R5bGVUZW1wbGF0ZSA9IGF0dHJzLmxvYWRpbmdJY29uU2l6ZSA/ICduZy1zdHlsZT1cIntcXCdmb250LXNpemVcXCc6IFxcJycgKyBhdHRycy5sb2FkaW5nSWNvblNpemUgKyAnXFwnfVwiJyA6ICcnLCB0ZW1wbGF0ZSA9ICc8aSBjbGFzcz1cIicgKyBsb2FkaW5nSWNvbkNsYXNzICsgJ1wiICcgKyBuZ1N0eWxlVGVtcGxhdGUgKyAnPjwvaT4nO1xuICAgICAgICAgICAgZWxlbWVudC5lbXB0eSgpO1xuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQoJGNvbXBpbGUodGVtcGxhdGUpKHNjb3BlKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gIH1cbl0pLmRpcmVjdGl2ZSgnYWRMb2FkaW5nT3ZlcmxheScsIFtcbiAgJyRhZENvbmZpZycsXG4gIGZ1bmN0aW9uICgkYWRDb25maWcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnbG9hZGluZ2luZGljYXRvci9sb2FkaW5naW5kaWNhdG9yLnRwbC5odG1sJyxcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIGxvYWRpbmc6ICc9JyxcbiAgICAgICAgekluZGV4OiAnQCcsXG4gICAgICAgIHBvc2l0aW9uOiAnQCcsXG4gICAgICAgIGNvbnRhaW5lckNsYXNzZXM6ICdAJyxcbiAgICAgICAgbG9hZGluZ0ljb25DbGFzczogJ0AnLFxuICAgICAgICBsb2FkaW5nSWNvblNpemU6ICdAJ1xuICAgICAgfSxcbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uIGNvbXBpbGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcHJlOiBmdW5jdGlvbiBwcmVMaW5rKHNjb3BlKSB7XG4gICAgICAgICAgICBzY29wZS5sb2FkaW5nSWNvbkNsYXNzID0gc2NvcGUubG9hZGluZ0ljb25DbGFzcyB8fCAkYWRDb25maWcuaWNvbkNsYXNzZXMubG9hZGluZztcbiAgICAgICAgICAgIHNjb3BlLmxvYWRpbmdJY29uU2l6ZSA9IHNjb3BlLmxvYWRpbmdJY29uU2l6ZSB8fCAnM2VtJztcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogdGFibGVhamF4LmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAudGFibGVhamF4JywgW1xuICAnYWRhcHR2LmFkYXB0U3RyYXAudXRpbHMnLFxuICAnYWRhcHR2LmFkYXB0U3RyYXAubG9hZGluZ2luZGljYXRvcidcbl0pLmRpcmVjdGl2ZSgnYWRUYWJsZUFqYXgnLCBbXG4gICckcGFyc2UnLFxuICAnJGFkQ29uZmlnJyxcbiAgJ2FkTG9hZFBhZ2UnLFxuICAnYWREZWJvdW5jZScsXG4gICdhZFN0cmFwVXRpbHMnLFxuICBmdW5jdGlvbiAoJHBhcnNlLCAkYWRDb25maWcsIGFkTG9hZFBhZ2UsIGFkRGVib3VuY2UsIGFkU3RyYXBVdGlscykge1xuZnVuY3Rpb24gY29udHJvbGxlckZ1bmN0aW9uKCRzY29wZSwgJGF0dHJzKSB7XG4gICAgICAvLyAtLS0tLS0tLS0tICRzY29wZSBpbml0aWFsaXphdGlvbiAtLS0tLS0tLS0tIC8vXG4gICAgICAkc2NvcGUuYXR0cnMgPSAkYXR0cnM7XG4gICAgICAkc2NvcGUuaWNvbkNsYXNzZXMgPSAkYWRDb25maWcuaWNvbkNsYXNzZXM7XG4gICAgICAkc2NvcGUuYWRTdHJhcFV0aWxzID0gYWRTdHJhcFV0aWxzO1xuICAgICAgJHNjb3BlLml0ZW1zID0ge1xuICAgICAgICBsaXN0OiB1bmRlZmluZWQsXG4gICAgICAgIHBhZ2luZzoge1xuICAgICAgICAgIGN1cnJlbnRQYWdlOiAxLFxuICAgICAgICAgIHRvdGFsUGFnZXM6IHVuZGVmaW5lZCxcbiAgICAgICAgICBwYWdlU2l6ZTogTnVtYmVyKCRhdHRycy5wYWdlU2l6ZSkgfHwgMTAsXG4gICAgICAgICAgcGFnZVNpemVzOiAkcGFyc2UoJGF0dHJzLnBhZ2VTaXplcykoKSB8fCBbXG4gICAgICAgICAgICAxMCxcbiAgICAgICAgICAgIDI1LFxuICAgICAgICAgICAgNTBcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUubG9jYWxDb25maWcgPSB7XG4gICAgICAgIHBhZ2luZ0FycmF5OiBbXSxcbiAgICAgICAgbG9hZGluZ0RhdGE6IGZhbHNlLFxuICAgICAgICB0YWJsZU1heEhlaWdodDogJGF0dHJzLnRhYmxlTWF4SGVpZ2h0XG4gICAgICB9O1xuICAgICAgJHNjb3BlLmFqYXhDb25maWcgPSAkc2NvcGUuJGV2YWwoJGF0dHJzLmFqYXhDb25maWcpO1xuICAgICAgJHNjb3BlLmNvbHVtbkRlZmluaXRpb24gPSAkc2NvcGUuJGV2YWwoJGF0dHJzLmNvbHVtbkRlZmluaXRpb24pO1xuICAgICAgLy8gLS0tLS0tLS0tLSBMb2NhbCBkYXRhIC0tLS0tLS0tLS0gLy9cbiAgICAgIHZhciBsYXN0UmVxdWVzdFRva2VuLCB3YXRjaGVycyA9IFtdO1xuICAgICAgaWYgKCRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemVzLmluZGV4T2YoJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSkgPCAwKSB7XG4gICAgICAgICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgPSAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplc1swXTtcbiAgICAgIH1cbiAgICAgIC8vIC0tLS0tLS0tLS0gdWkgaGFuZGxlcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgJHNjb3BlLmxvYWRQYWdlID0gYWREZWJvdW5jZShmdW5jdGlvbiAocGFnZSkge1xuICAgICAgICBsYXN0UmVxdWVzdFRva2VuID0gTWF0aC5yYW5kb20oKTtcbiAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhID0gdHJ1ZTtcbiAgICAgICAgdmFyIHBhZ2VMb2FkZXIgPSAkc2NvcGUuJGV2YWwoJGF0dHJzLnBhZ2VMb2FkZXIpIHx8IGFkTG9hZFBhZ2UsIHBhcmFtcyA9IHtcbiAgICAgICAgICAgIHBhZ2VOdW1iZXI6IHBhZ2UsXG4gICAgICAgICAgICBwYWdlU2l6ZTogJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSxcbiAgICAgICAgICAgIHNvcnRLZXk6ICRzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUsXG4gICAgICAgICAgICBzb3J0RGlyZWN0aW9uOiAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSxcbiAgICAgICAgICAgIGFqYXhDb25maWc6ICRzY29wZS5hamF4Q29uZmlnLFxuICAgICAgICAgICAgdG9rZW46IGxhc3RSZXF1ZXN0VG9rZW5cbiAgICAgICAgICB9LCBzdWNjZXNzSGFuZGxlciA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnRva2VuID09PSBsYXN0UmVxdWVzdFRva2VuKSB7XG4gICAgICAgICAgICAgICRzY29wZS5pdGVtcy5saXN0ID0gcmVzcG9uc2UuaXRlbXM7XG4gICAgICAgICAgICAgICRzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcyA9IHJlc3BvbnNlLnRvdGFsUGFnZXM7XG4gICAgICAgICAgICAgICRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPSByZXNwb25zZS5jdXJyZW50UGFnZTtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnBhZ2luZ0FycmF5ID0gcmVzcG9uc2UucGFnaW5nQXJyYXk7XG4gICAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIGVycm9ySGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSA9IGZhbHNlO1xuICAgICAgICAgIH07XG4gICAgICAgIHBhZ2VMb2FkZXIocGFyYW1zKS50aGVuKHN1Y2Nlc3NIYW5kbGVyLCBlcnJvckhhbmRsZXIpO1xuICAgICAgfSk7XG4gICAgICAkc2NvcGUubG9hZE5leHRQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoISRzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSkge1xuICAgICAgICAgIGlmICgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlICsgMSA8PSAkc2NvcGUuaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlICsgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLmxvYWRQcmV2aW91c1BhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghJHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhKSB7XG4gICAgICAgICAgaWYgKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgLSAxID4gMCkge1xuICAgICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgLSAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUubG9hZExhc3RQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoISRzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSkge1xuICAgICAgICAgIGlmICgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlICE9PSAkc2NvcGUuaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5wYWdlU2l6ZUNoYW5nZWQgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICAgICAgICBpZiAoTnVtYmVyKHNpemUpICE9PSAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplKSB7XG4gICAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSA9IE51bWJlcihzaXplKTtcbiAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUuc29ydEJ5Q29sdW1uID0gZnVuY3Rpb24gKGNvbHVtbikge1xuICAgICAgICBpZiAoY29sdW1uLnNvcnRLZXkpIHtcbiAgICAgICAgICBpZiAoY29sdW1uLnNvcnRLZXkgIT09ICRzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUgPSBjb2x1bW4uc29ydEtleTtcbiAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgLy8gLS0tLS0tLS0tLSBpbml0aWFsaXphdGlvbiBhbmQgZXZlbnQgbGlzdGVuZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgIC8vIHJlc2V0IG9uIHBhcmFtZXRlciBjaGFuZ2VcbiAgICAgIHdhdGNoZXJzLnB1c2goJHNjb3BlLiR3YXRjaCgkYXR0cnMuYWpheENvbmZpZywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICB9LCB0cnVlKSk7XG4gICAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCRhdHRycy5jb2x1bW5EZWZpbml0aW9uLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5jb2x1bW5EZWZpbml0aW9uID0gJHNjb3BlLiRldmFsKCRhdHRycy5jb2x1bW5EZWZpbml0aW9uKTtcbiAgICAgIH0pKTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gZGlzYWJsZSB3YXRjaGVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaChmdW5jdGlvbiAod2F0Y2hlcikge1xuICAgICAgICAgIHdhdGNoZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICBzY29wZTogdHJ1ZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGFibGVhamF4L3RhYmxlYWpheC50cGwuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiBbXG4gICAgICAgICckc2NvcGUnLFxuICAgICAgICAnJGF0dHJzJyxcbiAgICAgICAgY29udHJvbGxlckZ1bmN0aW9uXG4gICAgICBdXG4gICAgfTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogdGFibGVsaXRlLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAudGFibGVsaXRlJywgWydhZGFwdHYuYWRhcHRTdHJhcC51dGlscyddKS5kaXJlY3RpdmUoJ2FkVGFibGVMaXRlJywgW1xuICAnJHBhcnNlJyxcbiAgJyRodHRwJyxcbiAgJyRjb21waWxlJyxcbiAgJyRmaWx0ZXInLFxuICAnJHRlbXBsYXRlQ2FjaGUnLFxuICAnJGFkQ29uZmlnJyxcbiAgJ2FkU3RyYXBVdGlscycsXG4gICdhZERlYm91bmNlJyxcbiAgJ2FkTG9hZExvY2FsUGFnZScsXG4gIGZ1bmN0aW9uICgkcGFyc2UsICRodHRwLCAkY29tcGlsZSwgJGZpbHRlciwgJHRlbXBsYXRlQ2FjaGUsICRhZENvbmZpZywgYWRTdHJhcFV0aWxzLCBhZERlYm91bmNlLCBhZExvYWRMb2NhbFBhZ2UpIHtcbmZ1bmN0aW9uIGNvbnRyb2xsZXJGdW5jdGlvbigkc2NvcGUsICRhdHRycykge1xuICAgICAgLy8gLS0tLS0tLS0tLSAkJHNjb3BlIGluaXRpYWxpemF0aW9uIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS5hdHRycyA9ICRhdHRycztcbiAgICAgICRzY29wZS5pY29uQ2xhc3NlcyA9ICRhZENvbmZpZy5pY29uQ2xhc3NlcztcbiAgICAgICRzY29wZS5hZFN0cmFwVXRpbHMgPSBhZFN0cmFwVXRpbHM7XG4gICAgICAkc2NvcGUuY29sdW1uRGVmaW5pdGlvbiA9ICRzY29wZS4kZXZhbCgkYXR0cnMuY29sdW1uRGVmaW5pdGlvbik7XG4gICAgICAkc2NvcGUuaXRlbXMgPSB7XG4gICAgICAgIGxpc3Q6IHVuZGVmaW5lZCxcbiAgICAgICAgYWxsSXRlbXM6IHVuZGVmaW5lZCxcbiAgICAgICAgcGFnaW5nOiB7XG4gICAgICAgICAgY3VycmVudFBhZ2U6IDEsXG4gICAgICAgICAgdG90YWxQYWdlczogdW5kZWZpbmVkLFxuICAgICAgICAgIHBhZ2VTaXplOiBOdW1iZXIoJGF0dHJzLnBhZ2VTaXplKSB8fCAxMCxcbiAgICAgICAgICBwYWdlU2l6ZXM6ICRwYXJzZSgkYXR0cnMucGFnZVNpemVzKSgpIHx8IFtcbiAgICAgICAgICAgIDEwLFxuICAgICAgICAgICAgMjUsXG4gICAgICAgICAgICA1MFxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5sb2NhbENvbmZpZyA9IHtcbiAgICAgICAgbG9jYWxEYXRhOiBhZFN0cmFwVXRpbHMucGFyc2UoJHNjb3BlLiRldmFsKCRhdHRycy5sb2NhbERhdGFTb3VyY2UpKSxcbiAgICAgICAgcGFnaW5nQXJyYXk6IFtdLFxuICAgICAgICBkcmFnQ2hhbmdlOiAkc2NvcGUuJGV2YWwoJGF0dHJzLm9uRHJhZ0NoYW5nZSlcbiAgICAgIH07XG4gICAgICAkc2NvcGUuc2VsZWN0ZWRJdGVtcyA9ICRzY29wZS4kZXZhbCgkYXR0cnMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAvLyAtLS0tLS0tLS0tIExvY2FsIGRhdGEgLS0tLS0tLS0tLSAvL1xuICAgICAgdmFyIHBsYWNlSG9sZGVyID0gbnVsbCwgcGFnZUJ1dHRvbkVsZW1lbnQgPSBudWxsLCB2YWxpZERyb3AgPSBmYWxzZSwgaW5pdGlhbFBvcywgd2F0Y2hlcnMgPSBbXTtcbiAgICAgIGZ1bmN0aW9uIG1vdmVFbGVtZW50Tm9kZShub2RlVG9Nb3ZlLCByZWxhdGl2ZU5vZGUsIGRyYWdOb2RlKSB7XG4gICAgICAgIGlmIChyZWxhdGl2ZU5vZGUubmV4dCgpWzBdID09PSBub2RlVG9Nb3ZlWzBdKSB7XG4gICAgICAgICAgcmVsYXRpdmVOb2RlLmJlZm9yZShub2RlVG9Nb3ZlKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZWxhdGl2ZU5vZGUucHJldigpWzBdID09PSBub2RlVG9Nb3ZlWzBdKSB7XG4gICAgICAgICAgcmVsYXRpdmVOb2RlLmFmdGVyKG5vZGVUb01vdmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChyZWxhdGl2ZU5vZGUubmV4dCgpWzBdID09PSBkcmFnTm9kZVswXSkge1xuICAgICAgICAgICAgcmVsYXRpdmVOb2RlLmJlZm9yZShub2RlVG9Nb3ZlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlbGF0aXZlTm9kZS5wcmV2KClbMF0gPT09IGRyYWdOb2RlWzBdKSB7XG4gICAgICAgICAgICByZWxhdGl2ZU5vZGUuYWZ0ZXIobm9kZVRvTW92ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZXMuaW5kZXhPZigkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplKSA8IDApIHtcbiAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSA9ICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemVzWzBdO1xuICAgICAgfVxuICAgICAgLy8gLS0tLS0tLS0tLSB1aSBoYW5kbGVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAkc2NvcGUubG9hZFBhZ2UgPSBhZERlYm91bmNlKGZ1bmN0aW9uIChwYWdlKSB7XG4gICAgICAgIHZhciBpdGVtc09iamVjdCA9ICRzY29wZS5sb2NhbENvbmZpZy5sb2NhbERhdGEgPSBhZFN0cmFwVXRpbHMucGFyc2UoJHNjb3BlLiRldmFsKCRhdHRycy5sb2NhbERhdGFTb3VyY2UpKSwgcGFyYW1zO1xuICAgICAgICBwYXJhbXMgPSB7XG4gICAgICAgICAgcGFnZU51bWJlcjogcGFnZSxcbiAgICAgICAgICBwYWdlU2l6ZTogISRhdHRycy5kaXNhYmxlUGFnaW5nID8gJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSA6IGl0ZW1zT2JqZWN0Lmxlbmd0aCxcbiAgICAgICAgICBzb3J0S2V5OiAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlLFxuICAgICAgICAgIHNvcnREaXJlY3Rpb246ICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlLFxuICAgICAgICAgIGxvY2FsRGF0YTogaXRlbXNPYmplY3RcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHJlc3BvbnNlID0gYWRMb2FkTG9jYWxQYWdlKHBhcmFtcyk7XG4gICAgICAgICRzY29wZS5pdGVtcy5saXN0ID0gcmVzcG9uc2UuaXRlbXM7XG4gICAgICAgICRzY29wZS5pdGVtcy5hbGxJdGVtcyA9IHJlc3BvbnNlLmFsbEl0ZW1zO1xuICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID0gcmVzcG9uc2UuY3VycmVudFBhZ2U7XG4gICAgICAgICRzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcyA9IHJlc3BvbnNlLnRvdGFsUGFnZXM7XG4gICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5wYWdpbmdBcnJheSA9IHJlc3BvbnNlLnBhZ2luZ0FycmF5O1xuICAgICAgfSwgMTAwKTtcbiAgICAgICRzY29wZS5sb2FkTmV4dFBhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlICsgMSA8PSAkc2NvcGUuaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMpIHtcbiAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSArIDEpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLmxvYWRQcmV2aW91c1BhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlIC0gMSA+IDApIHtcbiAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAtIDEpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLmxvYWRMYXN0UGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCEkc2NvcGUubG9jYWxDb25maWcuZGlzYWJsZVBhZ2luZykge1xuICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLnBhZ2VTaXplQ2hhbmdlZCA9IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICAgICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgPSBzaXplO1xuICAgICAgICAkc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICB9O1xuICAgICAgJHNjb3BlLnNvcnRCeUNvbHVtbiA9IGZ1bmN0aW9uIChjb2x1bW4pIHtcbiAgICAgICAgaWYgKGNvbHVtbi5zb3J0S2V5KSB7XG4gICAgICAgICAgaWYgKGNvbHVtbi5zb3J0S2V5ICE9PSAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlID0gY29sdW1uLnNvcnRLZXk7XG4gICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS51blNvcnRUYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUgPSB1bmRlZmluZWQ7XG4gICAgICB9O1xuICAgICAgJHNjb3BlLm9uRHJhZ1N0YXJ0ID0gZnVuY3Rpb24gKGRhdGEsIGRyYWdFbGVtZW50KSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBkcmFnRWxlbWVudC5wYXJlbnQoKTtcbiAgICAgICAgcGxhY2VIb2xkZXIgPSAkKCc8dHI+PHRkIGNvbHNwYW49JyArIGRyYWdFbGVtZW50LmZpbmQoJ3RkJykubGVuZ3RoICsgJz4mbmJzcDs8L3RkPjwvdHI+Jyk7XG4gICAgICAgIGluaXRpYWxQb3MgPSBkcmFnRWxlbWVudC5pbmRleCgpICsgKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgLSAxKSAqICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgLSAxO1xuICAgICAgICBpZiAoZHJhZ0VsZW1lbnRbMF0gIT09IHBhcmVudC5jaGlsZHJlbigpLmxhc3QoKVswXSkge1xuICAgICAgICAgIGRyYWdFbGVtZW50Lm5leHQoKS5iZWZvcmUocGxhY2VIb2xkZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcmVudC5hcHBlbmQocGxhY2VIb2xkZXIpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLm9uRHJhZ0VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcGxhY2VIb2xkZXIucmVtb3ZlKCk7XG4gICAgICB9O1xuICAgICAgJHNjb3BlLm9uRHJhZ092ZXIgPSBmdW5jdGlvbiAoZGF0YSwgZHJhZ0VsZW1lbnQsIGRyb3BFbGVtZW50KSB7XG4gICAgICAgIGlmIChwbGFjZUhvbGRlcikge1xuICAgICAgICAgIC8vIFJlc3RyaWN0cyB2YWxpZCBkcmFnIHRvIGN1cnJlbnQgdGFibGUgaW5zdGFuY2VcbiAgICAgICAgICBtb3ZlRWxlbWVudE5vZGUocGxhY2VIb2xkZXIsIGRyb3BFbGVtZW50LCBkcmFnRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUub25Ecm9wRW5kID0gZnVuY3Rpb24gKGRhdGEsIGRyYWdFbGVtZW50KSB7XG4gICAgICAgIHZhciBlbmRQb3M7XG4gICAgICAgIGlmIChwbGFjZUhvbGRlcikge1xuICAgICAgICAgIC8vIFJlc3RyaWN0cyBkcm9wIHRvIGN1cnJlbnQgdGFibGUgaW5zdGFuY2VcbiAgICAgICAgICBpZiAocGxhY2VIb2xkZXIubmV4dCgpWzBdKSB7XG4gICAgICAgICAgICBwbGFjZUhvbGRlci5uZXh0KCkuYmVmb3JlKGRyYWdFbGVtZW50KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHBsYWNlSG9sZGVyLnByZXYoKVswXSkge1xuICAgICAgICAgICAgcGxhY2VIb2xkZXIucHJldigpLmFmdGVyKGRyYWdFbGVtZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGxhY2VIb2xkZXIucmVtb3ZlKCk7XG4gICAgICAgICAgdmFsaWREcm9wID0gdHJ1ZTtcbiAgICAgICAgICBlbmRQb3MgPSBkcmFnRWxlbWVudC5pbmRleCgpICsgKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgLSAxKSAqICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgLSAxO1xuICAgICAgICAgIGFkU3RyYXBVdGlscy5tb3ZlSXRlbUluTGlzdChpbml0aWFsUG9zLCBlbmRQb3MsICRzY29wZS5sb2NhbENvbmZpZy5sb2NhbERhdGEpO1xuICAgICAgICAgICRzY29wZS51blNvcnRUYWJsZSgpO1xuICAgICAgICAgIGlmICgkc2NvcGUubG9jYWxDb25maWcuZHJhZ0NoYW5nZSkge1xuICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLmRyYWdDaGFuZ2UoaW5pdGlhbFBvcywgZW5kUG9zLCBkYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhZ2VCdXR0b25FbGVtZW50KSB7XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2J0bi1wcmltYXJ5Jyk7XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLm9uTmV4dFBhZ2VCdXR0b25PdmVyID0gZnVuY3Rpb24gKGRhdGEsIGRyYWdFbGVtZW50LCBkcm9wRWxlbWVudCkge1xuICAgICAgICBpZiAocGFnZUJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgICBwYWdlQnV0dG9uRWxlbWVudC5yZW1vdmVDbGFzcygnYnRuLXByaW1hcnknKTtcbiAgICAgICAgICBwYWdlQnV0dG9uRWxlbWVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRyb3BFbGVtZW50LmF0dHIoJ2Rpc2FibGVkJykgIT09ICdkaXNhYmxlZCcpIHtcbiAgICAgICAgICBwYWdlQnV0dG9uRWxlbWVudCA9IGRyb3BFbGVtZW50O1xuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50LmFkZENsYXNzKCdidG4tcHJpbWFyeScpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLm9uTmV4dFBhZ2VCdXR0b25Ecm9wID0gZnVuY3Rpb24gKGRhdGEsIGRyYWdFbGVtZW50KSB7XG4gICAgICAgIHZhciBlbmRQb3M7XG4gICAgICAgIGlmIChwYWdlQnV0dG9uRWxlbWVudCkge1xuICAgICAgICAgIHZhbGlkRHJvcCA9IHRydWU7XG4gICAgICAgICAgaWYgKHBhZ2VCdXR0b25FbGVtZW50LmF0dHIoJ2lkJykgPT09ICdidG5QcmV2Jykge1xuICAgICAgICAgICAgZW5kUG9zID0gJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSAqICgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlIC0gMSkgLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocGFnZUJ1dHRvbkVsZW1lbnQuYXR0cignaWQnKSA9PT0gJ2J0bk5leHQnKSB7XG4gICAgICAgICAgICBlbmRQb3MgPSAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplICogJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWRTdHJhcFV0aWxzLm1vdmVJdGVtSW5MaXN0KGluaXRpYWxQb3MsIGVuZFBvcywgJHNjb3BlLmxvY2FsQ29uZmlnLmxvY2FsRGF0YSk7XG4gICAgICAgICAgcGxhY2VIb2xkZXIucmVtb3ZlKCk7XG4gICAgICAgICAgZHJhZ0VsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgaWYgKCRzY29wZS5sb2NhbENvbmZpZy5kcmFnQ2hhbmdlKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcuZHJhZ0NoYW5nZShpbml0aWFsUG9zLCBlbmRQb3MsIGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYWdlQnV0dG9uRWxlbWVudC5yZW1vdmVDbGFzcygnYnRuLXByaW1hcnknKTtcbiAgICAgICAgICBwYWdlQnV0dG9uRWxlbWVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAvLyAtLS0tLS0tLS0tIGluaXRpYWxpemF0aW9uIGFuZCBldmVudCBsaXN0ZW5lcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgJHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgLy8gLS0tLS0tLS0tLSBzZXQgd2F0Y2hlcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHdhdGNoKCRhdHRycy5sb2NhbERhdGFTb3VyY2UsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UpO1xuICAgICAgfSkpO1xuICAgICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHdhdGNoKCRhdHRycy5sb2NhbERhdGFTb3VyY2UgKyAnLmxlbmd0aCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UpO1xuICAgICAgfSkpO1xuICAgICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHdhdGNoQ29sbGVjdGlvbigkYXR0cnMuY29sdW1uRGVmaW5pdGlvbiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUuY29sdW1uRGVmaW5pdGlvbiA9ICRzY29wZS4kZXZhbCgkYXR0cnMuY29sdW1uRGVmaW5pdGlvbik7XG4gICAgICB9KSk7XG4gICAgICAvLyAtLS0tLS0tLS0tIGRpc2FibGUgd2F0Y2hlcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdhdGNoZXJzLmZvckVhY2goZnVuY3Rpb24gKHdhdGNoZXIpIHtcbiAgICAgICAgICB3YXRjaGVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgY29udHJvbGxlcjogW1xuICAgICAgICAnJHNjb3BlJyxcbiAgICAgICAgJyRhdHRycycsXG4gICAgICAgIGNvbnRyb2xsZXJGdW5jdGlvblxuICAgICAgXSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGFibGVsaXRlL3RhYmxlbGl0ZS50cGwuaHRtbCcsXG4gICAgICBzY29wZTogdHJ1ZVxuICAgIH07XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IHRyZWVicm93c2VyLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAudHJlZWJyb3dzZXInLCBbXSkuZGlyZWN0aXZlKCdhZFRyZWVCcm93c2VyJywgW1xuICAnJGFkQ29uZmlnJyxcbiAgZnVuY3Rpb24gKCRhZENvbmZpZykge1xuICAgIGZ1bmN0aW9uIGNvbnRyb2xsZXJGdW5jdGlvbigkc2NvcGUsICRhdHRycykge1xuICAgICAgdmFyIHRlbXBsYXRlVG9rZW4gPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgLy8gc2NvcGUgaW5pdGlhbGl6YXRpb25cbiAgICAgICRzY29wZS5hdHRycyA9ICRhdHRycztcbiAgICAgICRzY29wZS5pY29uQ2xhc3NlcyA9ICRhZENvbmZpZy5pY29uQ2xhc3NlcztcbiAgICAgICRzY29wZS50cmVlUm9vdCA9ICRzY29wZS4kZXZhbCgkYXR0cnMudHJlZVJvb3QpIHx8IHt9O1xuICAgICAgJHNjb3BlLnRvZ2dsZSA9IGZ1bmN0aW9uIChldmVudCwgaXRlbSkge1xuICAgICAgICB2YXIgdG9nZ2xlQ2FsbGJhY2s7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0b2dnbGVDYWxsYmFjayA9ICRzY29wZS4kZXZhbCgkYXR0cnMudG9nZ2xlQ2FsbGJhY2spO1xuICAgICAgICBpZiAodG9nZ2xlQ2FsbGJhY2spIHtcbiAgICAgICAgICB0b2dnbGVDYWxsYmFjayhpdGVtKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLl9hZF9leHBhbmRlZCA9ICFpdGVtLl9hZF9leHBhbmRlZDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHZhciBoYXNDaGlsZHJlbiA9ICRzY29wZS4kZXZhbCgkYXR0cnMuaGFzQ2hpbGRyZW4pO1xuICAgICAgJHNjb3BlLmhhc0NoaWxkcmVuID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgdmFyIGZvdW5kID0gaXRlbVskYXR0cnMuY2hpbGROb2RlXSAmJiBpdGVtWyRhdHRycy5jaGlsZE5vZGVdLmxlbmd0aCA+IDA7XG4gICAgICAgIGlmIChoYXNDaGlsZHJlbikge1xuICAgICAgICAgIGZvdW5kID0gaGFzQ2hpbGRyZW4oaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgfTtcbiAgICAgIC8vIGZvciB1bmlxdWUgdGVtcGxhdGVcbiAgICAgICRzY29wZS5sb2NhbENvbmZpZyA9IHsgcmVuZGVyZXJUZW1wbGF0ZUlkOiAndHJlZS1yZW5kZXJlci0nICsgdGVtcGxhdGVUb2tlbiArICcuaHRtbCcgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICBzY29wZTogdHJ1ZSxcbiAgICAgIGNvbnRyb2xsZXI6IFtcbiAgICAgICAgJyRzY29wZScsXG4gICAgICAgICckYXR0cnMnLFxuICAgICAgICBjb250cm9sbGVyRnVuY3Rpb25cbiAgICAgIF0sXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RyZWVicm93c2VyL3RyZWVicm93c2VyLnRwbC5odG1sJ1xuICAgIH07XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IHV0aWxzLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAudXRpbHMnLCBbXSkuZmFjdG9yeSgnYWRTdHJhcFV0aWxzJywgW1xuICAnJGZpbHRlcicsXG4gIGZ1bmN0aW9uICgkZmlsdGVyKSB7XG4gICAgdmFyIGV2YWxPYmplY3RQcm9wZXJ0eSA9IGZ1bmN0aW9uIChvYmosIHByb3BlcnR5KSB7XG4gICAgICAgIHZhciBhcnIgPSBwcm9wZXJ0eS5zcGxpdCgnLicpO1xuICAgICAgICBpZiAob2JqKSB7XG4gICAgICAgICAgd2hpbGUgKGFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBhcnIuc2hpZnQoKTtcbiAgICAgICAgICAgIGlmIChvYmopIHtcbiAgICAgICAgICAgICAgb2JqID0gb2JqW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9LCBhcHBseUZpbHRlciA9IGZ1bmN0aW9uICh2YWx1ZSwgZmlsdGVyLCBpdGVtKSB7XG4gICAgICAgIHZhciBwYXJ0cywgZmlsdGVyT3B0aW9ucztcbiAgICAgICAgaWYgKHZhbHVlICYmICdmdW5jdGlvbicgPT09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZShpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsdGVyKSB7XG4gICAgICAgICAgcGFydHMgPSBmaWx0ZXIuc3BsaXQoJzonKTtcbiAgICAgICAgICBmaWx0ZXJPcHRpb25zID0gcGFydHNbMV07XG4gICAgICAgICAgaWYgKGZpbHRlck9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhbHVlID0gJGZpbHRlcihwYXJ0c1swXSkodmFsdWUsIGZpbHRlck9wdGlvbnMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZSA9ICRmaWx0ZXIocGFydHNbMF0pKHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfSwgaXRlbUV4aXN0c0luTGlzdCA9IGZ1bmN0aW9uIChjb21wYXJlSXRlbSwgbGlzdCkge1xuICAgICAgICB2YXIgZXhpc3QgPSBmYWxzZTtcbiAgICAgICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgaWYgKGFuZ3VsYXIuZXF1YWxzKGNvbXBhcmVJdGVtLCBpdGVtKSkge1xuICAgICAgICAgICAgZXhpc3QgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBleGlzdDtcbiAgICAgIH0sIGl0ZW1zRXhpc3RJbkxpc3QgPSBmdW5jdGlvbiAoaXRlbXMsIGxpc3QpIHtcbiAgICAgICAgdmFyIGV4aXN0ID0gdHJ1ZSwgaTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGl0ZW1FeGlzdHNJbkxpc3QoaXRlbXNbaV0sIGxpc3QpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgZXhpc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXhpc3Q7XG4gICAgICB9LCBhZGRJdGVtVG9MaXN0ID0gZnVuY3Rpb24gKGl0ZW0sIGxpc3QpIHtcbiAgICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgICAgfSwgcmVtb3ZlSXRlbUZyb21MaXN0ID0gZnVuY3Rpb24gKGl0ZW0sIGxpc3QpIHtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoaXRlbSwgbGlzdFtpXSkpIHtcbiAgICAgICAgICAgIGxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgYWRkUmVtb3ZlSXRlbUZyb21MaXN0ID0gZnVuY3Rpb24gKGl0ZW0sIGxpc3QpIHtcbiAgICAgICAgdmFyIGksIGZvdW5kID0gZmFsc2U7XG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoaXRlbSwgbGlzdFtpXSkpIHtcbiAgICAgICAgICAgIGxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZm91bmQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9LCBhZGRJdGVtc1RvTGlzdCA9IGZ1bmN0aW9uIChpdGVtcywgbGlzdCkge1xuICAgICAgICBpdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgaWYgKCFpdGVtRXhpc3RzSW5MaXN0KGl0ZW0sIGxpc3QpKSB7XG4gICAgICAgICAgICBhZGRSZW1vdmVJdGVtRnJvbUxpc3QoaXRlbSwgbGlzdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sIGFkZFJlbW92ZUl0ZW1zRnJvbUxpc3QgPSBmdW5jdGlvbiAoaXRlbXMsIGxpc3QpIHtcbiAgICAgICAgaWYgKGl0ZW1zRXhpc3RJbkxpc3QoaXRlbXMsIGxpc3QpKSB7XG4gICAgICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFkZEl0ZW1zVG9MaXN0KGl0ZW1zLCBsaXN0KTtcbiAgICAgICAgfVxuICAgICAgfSwgbW92ZUl0ZW1Jbkxpc3QgPSBmdW5jdGlvbiAoc3RhcnRQb3MsIGVuZFBvcywgbGlzdCkge1xuICAgICAgICBpZiAoZW5kUG9zIDwgbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICBsaXN0LnNwbGljZShlbmRQb3MsIDAsIGxpc3Quc3BsaWNlKHN0YXJ0UG9zLCAxKVswXSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHBhcnNlID0gZnVuY3Rpb24gKGl0ZW1zKSB7XG4gICAgICAgIHZhciBpdGVtc09iamVjdCA9IFtdO1xuICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KGl0ZW1zKSkge1xuICAgICAgICAgIGl0ZW1zT2JqZWN0ID0gaXRlbXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGl0ZW1zLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgaXRlbXNPYmplY3QucHVzaChpdGVtKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRlbXNPYmplY3Q7XG4gICAgICB9LCBnZXRPYmplY3RQcm9wZXJ0eSA9IGZ1bmN0aW9uIChpdGVtLCBwcm9wZXJ0eSkge1xuICAgICAgICBpZiAocHJvcGVydHkgJiYgJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIHByb3BlcnR5KSB7XG4gICAgICAgICAgcmV0dXJuIHByb3BlcnR5KGl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhcnIgPSBwcm9wZXJ0eS5zcGxpdCgnLicpO1xuICAgICAgICB3aGlsZSAoYXJyLmxlbmd0aCkge1xuICAgICAgICAgIGl0ZW0gPSBpdGVtW2Fyci5zaGlmdCgpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgIGV2YWxPYmplY3RQcm9wZXJ0eTogZXZhbE9iamVjdFByb3BlcnR5LFxuICAgICAgYXBwbHlGaWx0ZXI6IGFwcGx5RmlsdGVyLFxuICAgICAgaXRlbUV4aXN0c0luTGlzdDogaXRlbUV4aXN0c0luTGlzdCxcbiAgICAgIGl0ZW1zRXhpc3RJbkxpc3Q6IGl0ZW1zRXhpc3RJbkxpc3QsXG4gICAgICBhZGRJdGVtVG9MaXN0OiBhZGRJdGVtVG9MaXN0LFxuICAgICAgcmVtb3ZlSXRlbUZyb21MaXN0OiByZW1vdmVJdGVtRnJvbUxpc3QsXG4gICAgICBhZGRSZW1vdmVJdGVtRnJvbUxpc3Q6IGFkZFJlbW92ZUl0ZW1Gcm9tTGlzdCxcbiAgICAgIGFkZEl0ZW1zVG9MaXN0OiBhZGRJdGVtc1RvTGlzdCxcbiAgICAgIGFkZFJlbW92ZUl0ZW1zRnJvbUxpc3Q6IGFkZFJlbW92ZUl0ZW1zRnJvbUxpc3QsXG4gICAgICBtb3ZlSXRlbUluTGlzdDogbW92ZUl0ZW1Jbkxpc3QsXG4gICAgICBwYXJzZTogcGFyc2UsXG4gICAgICBnZXRPYmplY3RQcm9wZXJ0eTogZ2V0T2JqZWN0UHJvcGVydHlcbiAgICB9O1xuICB9XG5dKS5mYWN0b3J5KCdhZERlYm91bmNlJywgW1xuICAnJHRpbWVvdXQnLFxuICAnJHEnLFxuICBmdW5jdGlvbiAoJHRpbWVvdXQsICRxKSB7XG52YXIgZGViID0gZnVuY3Rpb24gKGZ1bmMsIGRlbGF5LCBpbW1lZGlhdGUsIGN0eCkge1xuICAgICAgdmFyIHRpbWVyID0gbnVsbCwgZGVmZXJyZWQgPSAkcS5kZWZlcigpLCB3YWl0ID0gZGVsYXkgfHwgMzAwO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNvbnRleHQgPSBjdHggfHwgdGhpcywgYXJncyA9IGFyZ3VtZW50cywgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZXIsIGxhdGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpKTtcbiAgICAgICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIGlmICh0aW1lcikge1xuICAgICAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lcik7XG4gICAgICAgIH1cbiAgICAgICAgdGltZXIgPSAkdGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICAgIGlmIChjYWxsTm93KSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpKTtcbiAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9O1xuICAgIH07XG4gICAgcmV0dXJuIGRlYjtcbiAgfVxuXSkuZGlyZWN0aXZlKCdhZENvbXBpbGVUZW1wbGF0ZScsIFtcbiAgJyRjb21waWxlJyxcbiAgZnVuY3Rpb24gKCRjb21waWxlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIHNjb3BlLiR3YXRjaChmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgICAgcmV0dXJuIHNjb3BlLiRldmFsKGF0dHJzLmFkQ29tcGlsZVRlbXBsYXRlKTtcbiAgICAgIH0sIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBlbGVtZW50Lmh0bWwodmFsdWUpO1xuICAgICAgICAkY29tcGlsZShlbGVtZW50LmNvbnRlbnRzKCkpKHNjb3BlKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbl0pLmZhY3RvcnkoJ2FkTG9hZFBhZ2UnLCBbXG4gICckYWRDb25maWcnLFxuICAnJGh0dHAnLFxuICAnYWRTdHJhcFV0aWxzJyxcbiAgZnVuY3Rpb24gKCRhZENvbmZpZywgJGh0dHAsIGFkU3RyYXBVdGlscykge1xuICAgIHJldHVybiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgdmFyIHN0YXJ0ID0gKG9wdGlvbnMucGFnZU51bWJlciAtIDEpICogb3B0aW9ucy5wYWdlU2l6ZSwgcGFnaW5nQ29uZmlnID0gYW5ndWxhci5jb3B5KCRhZENvbmZpZy5wYWdpbmcpLCBhamF4Q29uZmlnID0gYW5ndWxhci5jb3B5KG9wdGlvbnMuYWpheENvbmZpZyk7XG4gICAgICBpZiAoYWpheENvbmZpZy5wYWdpbmF0aW9uQ29uZmlnICYmIGFqYXhDb25maWcucGFnaW5hdGlvbkNvbmZpZy5yZXF1ZXN0KSB7XG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHBhZ2luZ0NvbmZpZy5yZXF1ZXN0LCBhamF4Q29uZmlnLnBhZ2luYXRpb25Db25maWcucmVxdWVzdCk7XG4gICAgICB9XG4gICAgICBpZiAoYWpheENvbmZpZy5wYWdpbmF0aW9uQ29uZmlnICYmIGFqYXhDb25maWcucGFnaW5hdGlvbkNvbmZpZy5yZXNwb25zZSkge1xuICAgICAgICBhbmd1bGFyLmV4dGVuZChwYWdpbmdDb25maWcucmVzcG9uc2UsIGFqYXhDb25maWcucGFnaW5hdGlvbkNvbmZpZy5yZXNwb25zZSk7XG4gICAgICB9XG4gICAgICBhamF4Q29uZmlnLnBhcmFtcyA9IGFqYXhDb25maWcucGFyYW1zID8gYWpheENvbmZpZy5wYXJhbXMgOiB7fTtcbiAgICAgIGFqYXhDb25maWcucGFyYW1zW3BhZ2luZ0NvbmZpZy5yZXF1ZXN0LnN0YXJ0XSA9IHN0YXJ0O1xuICAgICAgYWpheENvbmZpZy5wYXJhbXNbcGFnaW5nQ29uZmlnLnJlcXVlc3QucGFnZVNpemVdID0gb3B0aW9ucy5wYWdlU2l6ZTtcbiAgICAgIGFqYXhDb25maWcucGFyYW1zW3BhZ2luZ0NvbmZpZy5yZXF1ZXN0LnBhZ2VdID0gb3B0aW9ucy5wYWdlTnVtYmVyO1xuICAgICAgaWYgKG9wdGlvbnMuc29ydEtleSkge1xuICAgICAgICBhamF4Q29uZmlnLnBhcmFtc1twYWdpbmdDb25maWcucmVxdWVzdC5zb3J0RmllbGRdID0gb3B0aW9ucy5zb3J0S2V5O1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMuc29ydERpcmVjdGlvbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgYWpheENvbmZpZy5wYXJhbXNbcGFnaW5nQ29uZmlnLnJlcXVlc3Quc29ydERpcmVjdGlvbl0gPSBwYWdpbmdDb25maWcucmVxdWVzdC5zb3J0QXNjVmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuc29ydERpcmVjdGlvbiA9PT0gdHJ1ZSkge1xuICAgICAgICBhamF4Q29uZmlnLnBhcmFtc1twYWdpbmdDb25maWcucmVxdWVzdC5zb3J0RGlyZWN0aW9uXSA9IHBhZ2luZ0NvbmZpZy5yZXF1ZXN0LnNvcnREZXNjVmFsdWU7XG4gICAgICB9XG4gICAgICB2YXIgcHJvbWlzZTtcbiAgICAgIGlmIChhamF4Q29uZmlnLm1ldGhvZCA9PT0gJ0pTT05QJykge1xuICAgICAgICBwcm9taXNlID0gJGh0dHAuanNvbnAoYWpheENvbmZpZy51cmwgKyAnP2NhbGxiYWNrPUpTT05fQ0FMTEJBQ0snLCBhamF4Q29uZmlnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb21pc2UgPSAkaHR0cChhamF4Q29uZmlnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICBpdGVtczogYWRTdHJhcFV0aWxzLmV2YWxPYmplY3RQcm9wZXJ0eShyZXN1bHQuZGF0YSwgcGFnaW5nQ29uZmlnLnJlc3BvbnNlLml0ZW1zTG9jYXRpb24pLFxuICAgICAgICAgICAgY3VycmVudFBhZ2U6IG9wdGlvbnMucGFnZU51bWJlcixcbiAgICAgICAgICAgIHRvdGFsUGFnZXM6IE1hdGguY2VpbChhZFN0cmFwVXRpbHMuZXZhbE9iamVjdFByb3BlcnR5KHJlc3VsdC5kYXRhLCBwYWdpbmdDb25maWcucmVzcG9uc2UudG90YWxJdGVtcykgLyBvcHRpb25zLnBhZ2VTaXplKSxcbiAgICAgICAgICAgIHBhZ2luZ0FycmF5OiBbXSxcbiAgICAgICAgICAgIHRva2VuOiBvcHRpb25zLnRva2VuXG4gICAgICAgICAgfTtcbiAgICAgICAgdmFyIFRPVEFMX1BBR0lOQVRJT05fSVRFTVMgPSA1O1xuICAgICAgICB2YXIgbWluaW11bUJvdW5kID0gb3B0aW9ucy5wYWdlTnVtYmVyIC0gTWF0aC5mbG9vcihUT1RBTF9QQUdJTkFUSU9OX0lURU1TIC8gMik7XG4gICAgICAgIGZvciAodmFyIGkgPSBtaW5pbXVtQm91bmQ7IGkgPD0gb3B0aW9ucy5wYWdlTnVtYmVyOyBpKyspIHtcbiAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgIHJlc3BvbnNlLnBhZ2luZ0FycmF5LnB1c2goaSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChyZXNwb25zZS5wYWdpbmdBcnJheS5sZW5ndGggPCBUT1RBTF9QQUdJTkFUSU9OX0lURU1TKSB7XG4gICAgICAgICAgaWYgKGkgPiByZXNwb25zZS50b3RhbFBhZ2VzKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzcG9uc2UucGFnaW5nQXJyYXkucHVzaChpKTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXSkuZmFjdG9yeSgnYWRMb2FkTG9jYWxQYWdlJywgW1xuICAnJGZpbHRlcicsXG4gIGZ1bmN0aW9uICgkZmlsdGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgaXRlbXM6IHVuZGVmaW5lZCxcbiAgICAgICAgICBjdXJyZW50UGFnZTogb3B0aW9ucy5wYWdlTnVtYmVyLFxuICAgICAgICAgIHRvdGFsUGFnZXM6IHVuZGVmaW5lZCxcbiAgICAgICAgICBwYWdpbmdBcnJheTogW10sXG4gICAgICAgICAgdG9rZW46IG9wdGlvbnMudG9rZW5cbiAgICAgICAgfTtcbiAgICAgIHZhciBzdGFydCA9IChvcHRpb25zLnBhZ2VOdW1iZXIgLSAxKSAqIG9wdGlvbnMucGFnZVNpemUsIGVuZCA9IHN0YXJ0ICsgb3B0aW9ucy5wYWdlU2l6ZSwgaSwgaXRlbXNPYmplY3QgPSBvcHRpb25zLmxvY2FsRGF0YSwgbG9jYWxJdGVtcztcbiAgICAgIGxvY2FsSXRlbXMgPSAkZmlsdGVyKCdvcmRlckJ5JykoaXRlbXNPYmplY3QsIG9wdGlvbnMuc29ydEtleSwgb3B0aW9ucy5zb3J0RGlyZWN0aW9uKTtcbiAgICAgIHJlc3BvbnNlLml0ZW1zID0gbG9jYWxJdGVtcy5zbGljZShzdGFydCwgZW5kKTtcbiAgICAgIHJlc3BvbnNlLmFsbEl0ZW1zID0gaXRlbXNPYmplY3Q7XG4gICAgICByZXNwb25zZS5jdXJyZW50UGFnZSA9IG9wdGlvbnMucGFnZU51bWJlcjtcbiAgICAgIHJlc3BvbnNlLnRvdGFsUGFnZXMgPSBNYXRoLmNlaWwoaXRlbXNPYmplY3QubGVuZ3RoIC8gb3B0aW9ucy5wYWdlU2l6ZSk7XG4gICAgICB2YXIgVE9UQUxfUEFHSU5BVElPTl9JVEVNUyA9IDU7XG4gICAgICB2YXIgbWluaW11bUJvdW5kID0gb3B0aW9ucy5wYWdlTnVtYmVyIC0gTWF0aC5mbG9vcihUT1RBTF9QQUdJTkFUSU9OX0lURU1TIC8gMik7XG4gICAgICBmb3IgKGkgPSBtaW5pbXVtQm91bmQ7IGkgPD0gb3B0aW9ucy5wYWdlTnVtYmVyOyBpKyspIHtcbiAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgcmVzcG9uc2UucGFnaW5nQXJyYXkucHVzaChpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgd2hpbGUgKHJlc3BvbnNlLnBhZ2luZ0FycmF5Lmxlbmd0aCA8IFRPVEFMX1BBR0lOQVRJT05fSVRFTVMpIHtcbiAgICAgICAgaWYgKGkgPiByZXNwb25zZS50b3RhbFBhZ2VzKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmVzcG9uc2UucGFnaW5nQXJyYXkucHVzaChpKTtcbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH07XG4gIH1cbl0pO1xuXG59KSh3aW5kb3csIGRvY3VtZW50KTtcbiIsIi8qKlxuICogYWRhcHQtc3RyYXBcbiAqIEB2ZXJzaW9uIHYyLjAuNiAtIDIwMTQtMTAtMjZcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9BZGFwdHYvYWRhcHQtc3RyYXBcbiAqIEBhdXRob3IgS2FzaHlhcCBQYXRlbCAoa2FzaHlhcEBhZGFwLnR2KVxuICogQGxpY2Vuc2UgTUlUIExpY2Vuc2UsIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbid1c2Ugc3RyaWN0JztcblxuLy8gU291cmNlOiBpbmZpbml0ZWRyb3Bkb3duLnRwbC5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLmluZmluaXRlZHJvcGRvd24nKS5ydW4oW1xuICAnJHRlbXBsYXRlQ2FjaGUnLFxuICBmdW5jdGlvbiAoJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2luZmluaXRlZHJvcGRvd24vaW5maW5pdGVkcm9wZG93bi50cGwuaHRtbCcsICc8ZGl2IGNsYXNzPVwiYWQtaW5maW5pdGUtbGlzdC1jb250YWluZXJcIj48ZGl2IGNsYXNzPVwiZHJvcGRvd25cIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImRyb3Bkb3duLXRvZ2dsZVwiIG5nLWNsYXNzPVwiYXR0cnMuYnRuQ2xhc3NlcyB8fCBcXCdidG4gYnRuLWRlZmF1bHRcXCdcIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gbmctaWY9XCIhYXR0cnMubGFiZWxEaXNwbGF5UHJvcGVydHkgfHwgIXNlbGVjdGVkSXRlbXMubGVuZ3RoXCI+e3sgYXR0cnMuaW5pdGlhbExhYmVsIHx8IFxcJ1NlbGVjdFxcJyB9fTwvc3Bhbj4gPHNwYW4gbmctaWY9XCJhdHRycy5sYWJlbERpc3BsYXlQcm9wZXJ0eSAmJiBzZWxlY3RlZEl0ZW1zLmxlbmd0aFwiPnt7IHJlYWRQcm9wZXJ0eShzZWxlY3RlZEl0ZW1zW3NlbGVjdGVkSXRlbXMubGVuZ3RoIC0gMV0sIGF0dHJzLmxhYmVsRGlzcGxheVByb3BlcnR5KSB9fTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJjYXJldFwiPjwvc3Bhbj48L2J1dHRvbj48dWwgY2xhc3M9XCJkcm9wZG93bi1tZW51XCIgcm9sZT1cIm1lbnVcIiBuZy1zdHlsZT1cImxvY2FsQ29uZmlnLmRpbWVuc2lvbnNcIj48bGkgY2xhc3M9XCJ0ZXh0LW92ZXJmbG93XCIgZGF0YS1uZy1yZXBlYXQ9XCJpdGVtIGluIGl0ZW1zLmxpc3RcIiBuZy1jbGFzcz1cIntcXCdhY3RpdmVcXCc6IGFkU3RyYXBVdGlscy5pdGVtRXhpc3RzSW5MaXN0KGl0ZW0sIHNlbGVjdGVkSXRlbXMpfVwiIG5nLWNsaWNrPVwiYWRkUmVtb3ZlSXRlbSgkZXZlbnQsIGl0ZW0sIHNlbGVjdGVkSXRlbXMpXCI+PGEgcm9sZT1cIm1lbnVpdGVtXCIgdGFiaW5kZXg9XCItMVwiIGhyZWY9XCJcIj48c3BhbiBuZy1pZj1cImF0dHJzLmRpc3BsYXlQcm9wZXJ0eVwiPnt7IGFkU3RyYXBVdGlscy5nZXRPYmplY3RQcm9wZXJ0eShpdGVtLCBhdHRycy5kaXNwbGF5UHJvcGVydHkpIH19PC9zcGFuPiA8c3BhbiBuZy1pZj1cImF0dHJzLnRlbXBsYXRlXCIgYWQtY29tcGlsZS10ZW1wbGF0ZT1cInt7IGF0dHJzLnRlbXBsYXRlIH19XCI+PC9zcGFuPiA8c3BhbiBuZy1pZj1cImF0dHJzLnRlbXBsYXRlVXJsXCIgbmctaW5jbHVkZT1cImF0dHJzLnRlbXBsYXRlVXJsXCI+PC9zcGFuPjwvYT48L2xpPjxsaSBjbGFzcz1cInRleHQtb3ZlcmZsb3cgdGV4dC1jZW50ZXJcIiBuZy1zdHlsZT1cIntcXCdvcGFjaXR5XFwnOiBsb2NhbENvbmZpZy5sb2FkaW5nRGF0YSA/IDEgOiAwfVwiPjxhIHJvbGU9XCJtZW51aXRlbVwiIHRhYmluZGV4PVwiLTFcIiBocmVmPVwiXCI+PGFkLWxvYWRpbmctaWNvbj48L2FkLWxvYWRpbmctaWNvbj48L2E+PC9saT48L3VsPjwvZGl2PjwvZGl2PicpO1xuICB9XG5dKTtcblxuLy8gU291cmNlOiBsb2FkaW5naW5kaWNhdG9yLnRwbC5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLmxvYWRpbmdpbmRpY2F0b3InKS5ydW4oW1xuICAnJHRlbXBsYXRlQ2FjaGUnLFxuICBmdW5jdGlvbiAoJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ2xvYWRpbmdpbmRpY2F0b3IvbG9hZGluZ2luZGljYXRvci50cGwuaHRtbCcsICc8ZGl2IGNsYXNzPVwiYWQtbG9hZGluZy1vdmVybGF5LWNvbnRhaW5lclwiIG5nLWNsYXNzPVwiY29udGFpbmVyQ2xhc3Nlc1wiIG5nLXN0eWxlPVwie1xcJ3otaW5kZXhcXCc6IHpJbmRleCB8fCBcXCcxMDAwXFwnLFxcJ3Bvc2l0aW9uXFwnOiBwb3NpdGlvbiB8fCBcXCdhYnNvbHV0ZVxcJ31cIiBuZy1zaG93PVwibG9hZGluZ1wiPjxkaXYgY2xhc3M9XCJ3cmFwcGVyXCI+PGRpdiBjbGFzcz1cImxvYWRpbmctaW5kaWNhdG9yXCI+PGFkLWxvYWRpbmctaWNvbiBsb2FkaW5nLWljb24tc2l6ZT1cInt7IGxvYWRpbmdJY29uU2l6ZSB9fVwiIGxvYWRpbmctaWNvbi1jbGFzcz1cInt7IGxvYWRpbmdJY29uQ2xhc3MgfX1cIj48L2FkLWxvYWRpbmctaWNvbj48L2Rpdj48L2Rpdj48L2Rpdj4nKTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogdGFibGVhamF4LnRwbC5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLnRhYmxlYWpheCcpLnJ1bihbXG4gICckdGVtcGxhdGVDYWNoZScsXG4gIGZ1bmN0aW9uICgkdGVtcGxhdGVDYWNoZSkge1xuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgndGFibGVhamF4L3RhYmxlYWpheC50cGwuaHRtbCcsICc8ZGl2IGNsYXNzPVwiYWQtdGFibGUtYWpheC1jb250YWluZXJcIiBuZy1pZj1cIml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzIHx8IGxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhIHx8ICFhdHRycy5pdGVtc05vdEZvdW5kTWVzc2FnZVwiPjx0YWJsZSBjbGFzcz1cImFkLXN0aWNreS10YWJsZVwiIG5nLWNsYXNzPVwiYXR0cnMudGFibGVDbGFzc2VzIHx8IFxcJ3RhYmxlXFwnXCIgbmctaWY9XCJsb2NhbENvbmZpZy50YWJsZU1heEhlaWdodFwiPjx0ciBjbGFzcz1cImFkLXVzZXItc2VsZWN0LW5vbmVcIj48dGggZGF0YS1uZy1yZXBlYXQ9XCJkZWZpbml0aW9uIGluIGNvbHVtbkRlZmluaXRpb25cIiBuZy1jbGljaz1cInNvcnRCeUNvbHVtbihkZWZpbml0aW9uKVwiIG5nLWNsYXNzPVwie1xcJ2FkLWN1cnNvci1wb2ludGVyXFwnOiBkZWZpbml0aW9uLnNvcnRLZXl9XCIgbmctc3R5bGU9XCJ7XFwnd2lkdGhcXCc6IGRlZmluaXRpb24ud2lkdGh9XCI+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1pZj1cImRlZmluaXRpb24uc29ydEtleSAmJiBsb2NhbENvbmZpZy5wcmVkaWNhdGUgPT0gZGVmaW5pdGlvbi5zb3J0S2V5XCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0QXNjZW5kaW5nXCIgbmctaGlkZT1cImxvY2FsQ29uZmlnLnJldmVyc2VcIj48L2k+IDxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydERlc2NlbmRpbmdcIiBuZy1zaG93PVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT48L2Rpdj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSAhPSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRhYmxlXCI+PC9pPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCIgbmctYmluZC1odG1sPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJUZW1wbGF0ZVwiPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlckRpc3BsYXlOYW1lXCIgbmctYmluZD1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIj48L2Rpdj48L3RoPjwvdHI+PC90YWJsZT48ZGl2IGNsYXNzPVwiYWQtdGFibGUtY29udGFpbmVyXCIgbmctc3R5bGU9XCJ7XFwnbWF4LWhlaWdodFxcJzogbG9jYWxDb25maWcudGFibGVNYXhIZWlnaHR9XCI+PHRhYmxlIG5nLWNsYXNzPVwiYXR0cnMudGFibGVDbGFzc2VzIHx8IFxcJ3RhYmxlXFwnXCI+PHRyIGNsYXNzPVwiYWQtdXNlci1zZWxlY3Qtbm9uZVwiIG5nLWlmPVwiIWxvY2FsQ29uZmlnLnRhYmxlTWF4SGVpZ2h0XCI+PHRoIGRhdGEtbmctcmVwZWF0PVwiZGVmaW5pdGlvbiBpbiBjb2x1bW5EZWZpbml0aW9uXCIgbmctY2xpY2s9XCJzb3J0QnlDb2x1bW4oZGVmaW5pdGlvbilcIiBuZy1jbGFzcz1cIntcXCdhZC1jdXJzb3ItcG9pbnRlclxcJzogZGVmaW5pdGlvbi5zb3J0S2V5fVwiIG5nLXN0eWxlPVwie1xcJ3dpZHRoXFwnOiBkZWZpbml0aW9uLndpZHRofVwiPjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlID09IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydEFzY2VuZGluZ1wiIG5nLWhpZGU9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPiA8aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnREZXNjZW5kaW5nXCIgbmctc2hvdz1cImxvY2FsQ29uZmlnLnJldmVyc2VcIj48L2k+PC9kaXY+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1pZj1cImRlZmluaXRpb24uc29ydEtleSAmJiBsb2NhbENvbmZpZy5wcmVkaWNhdGUgIT0gZGVmaW5pdGlvbi5zb3J0S2V5XCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0YWJsZVwiPjwvaT48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJUZW1wbGF0ZVwiIG5nLWJpbmQtaHRtbD1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIj48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiIG5nLWJpbmQ9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlckRpc3BsYXlOYW1lXCI+PC9kaXY+PC90aD48L3RyPjx0ciBkYXRhLW5nLXJlcGVhdD1cIml0ZW0gaW4gaXRlbXMubGlzdFwiPjx0ZCBkYXRhLW5nLXJlcGVhdD1cImRlZmluaXRpb24gaW4gY29sdW1uRGVmaW5pdGlvblwiIG5nLXN0eWxlPVwie1xcJ3dpZHRoXFwnOiBkZWZpbml0aW9uLndpZHRofVwiPjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLnRlbXBsYXRlVXJsXCI+PG5nLWluY2x1ZGUgc3JjPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVVybFwiPjwvbmctaW5jbHVkZT48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPjxzcGFuIGFkLWNvbXBpbGUtdGVtcGxhdGU9XCJkZWZpbml0aW9uLnRlbXBsYXRlXCI+PC9zcGFuPjwvZGl2PjxkaXYgbmctaWY9XCIhZGVmaW5pdGlvbi50ZW1wbGF0ZVVybCAmJiAhZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPnt7IGFkU3RyYXBVdGlscy5hcHBseUZpbHRlcihhZFN0cmFwVXRpbHMuZ2V0T2JqZWN0UHJvcGVydHkoaXRlbSwgZGVmaW5pdGlvbi5kaXNwbGF5UHJvcGVydHksIGl0ZW0pLCBkZWZpbml0aW9uLmNlbGxGaWx0ZXIpIH19PC9kaXY+PC90ZD48L3RyPjwvdGFibGU+PGFkLWxvYWRpbmctb3ZlcmxheSBsb2FkaW5nPVwibG9jYWxDb25maWcubG9hZGluZ0RhdGFcIj48L2FkLWxvYWRpbmctb3ZlcmxheT48L2Rpdj48ZGl2IGNsYXNzPVwicm93XCI+PGRpdiBjbGFzcz1cImNvbC1tZC04IGNvbC1zbS04XCI+PGRpdiBjbGFzcz1cInB1bGwtbGVmdFwiIG5nLWNsYXNzPVwiYXR0cnMucGFnaW5hdGlvbkJ0bkdyb3VwQ2xhc3NlcyB8fCBcXCdidG4tZ3JvdXAgYnRuLWdyb3VwLXNtXFwnXCIgbmctc2hvdz1cIml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzID4gMVwiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctY2xpY2s9XCJsb2FkUGFnZSgxKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IDFcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLmZpcnN0UGFnZVwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1jbGljaz1cImxvYWRQcmV2aW91c1BhZ2UoKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IDFcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnByZXZpb3VzUGFnZVwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1yZXBlYXQ9XCJwYWdlIGluIGxvY2FsQ29uZmlnLnBhZ2luZ0FycmF5XCIgbmctY2xhc3M9XCJ7YWN0aXZlOiBpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gcGFnZX1cIiBuZy1jbGljaz1cImxvYWRQYWdlKHBhZ2UpXCI+e3sgcGFnZSB9fTwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWNsaWNrPVwibG9hZE5leHRQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSBpdGVtcy5wYWdpbmcudG90YWxQYWdlc1wiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMubmV4dFBhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctY2xpY2s9XCJsb2FkTGFzdFBhZ2UoKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IGl0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5sYXN0UGFnZVwiPjwvaT48L2J1dHRvbj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwiY29sLW1kLTQgY29sLXNtLTRcIj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWNsYXNzPVwiYXR0cnMucGFnaW5hdGlvbkJ0bkdyb3VwQ2xhc3NlcyB8fCBcXCdidG4tZ3JvdXAgYnRuLWdyb3VwLXNtXFwnXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1yZXBlYXQ9XCJzaXplIGluIGl0ZW1zLnBhZ2luZy5wYWdlU2l6ZXNcIiBuZy1jbGFzcz1cInthY3RpdmU6IGl0ZW1zLnBhZ2luZy5wYWdlU2l6ZSA9PSBzaXplfVwiIG5nLWNsaWNrPVwicGFnZVNpemVDaGFuZ2VkKHNpemUpXCI+e3sgc2l6ZSB9fTwvYnV0dG9uPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgbmctaWY9XCIhaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMgJiYgIWxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhICYmIGF0dHJzLml0ZW1zTm90Rm91bmRNZXNzYWdlXCI+PGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LWluZm9cIiByb2xlPVwiYWxlcnRcIj57eyBhdHRycy5pdGVtc05vdEZvdW5kTWVzc2FnZSB9fTwvZGl2PjwvZGl2PicpO1xuICB9XG5dKTtcblxuLy8gU291cmNlOiB0YWJsZWxpdGUudHBsLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAudGFibGVsaXRlJykucnVuKFtcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgZnVuY3Rpb24gKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCd0YWJsZWxpdGUvdGFibGVsaXRlLnRwbC5odG1sJywgJzxkaXYgY2xhc3M9XCJhZC10YWJsZS1saXRlLWNvbnRhaW5lclwiIG5nLWlmPVwiaXRlbXMuYWxsSXRlbXMubGVuZ3RoIHx8ICFhdHRycy5pdGVtc05vdEZvdW5kTWVzc2FnZVwiPjx0YWJsZSBjbGFzcz1cImFkLXN0aWNreS10YWJsZVwiIG5nLWNsYXNzPVwiYXR0cnMudGFibGVDbGFzc2VzIHx8IFxcJ3RhYmxlXFwnXCIgbmctaWY9XCJhdHRycy50YWJsZU1heEhlaWdodFwiPjx0ciBjbGFzcz1cImFkLXVzZXItc2VsZWN0LW5vbmVcIj48dGggY2xhc3M9XCJhZC1zZWxlY3QtY2VsbFwiIG5nLWlmPVwiYXR0cnMuZHJhZ2dhYmxlXCI+PGk+PC9pPjwvdGg+PHRoIGNsYXNzPVwiYWQtc2VsZWN0LWNlbGxcIiBuZy1pZj1cImF0dHJzLnNlbGVjdGVkSXRlbXMgJiYgaXRlbXMuYWxsSXRlbXNcIj48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJhZC1jdXJzb3ItcG9pbnRlclwiIG5nLWNsaWNrPVwiYWRTdHJhcFV0aWxzLmFkZFJlbW92ZUl0ZW1zRnJvbUxpc3QoaXRlbXMuYWxsSXRlbXMsIHNlbGVjdGVkSXRlbXMpXCIgbmctY2hlY2tlZD1cImFkU3RyYXBVdGlscy5pdGVtc0V4aXN0SW5MaXN0KGl0ZW1zLmFsbEl0ZW1zLCBzZWxlY3RlZEl0ZW1zKVwiPjwvdGg+PHRoIGRhdGEtbmctcmVwZWF0PVwiZGVmaW5pdGlvbiBpbiBjb2x1bW5EZWZpbml0aW9uXCIgbmctY2xpY2s9XCJzb3J0QnlDb2x1bW4oZGVmaW5pdGlvbilcIiBuZy1jbGFzcz1cIntcXCdhZC1jdXJzb3ItcG9pbnRlclxcJzogZGVmaW5pdGlvbi5zb3J0S2V5fVwiIG5nLXN0eWxlPVwie1xcJ3dpZHRoXFwnOiBkZWZpbml0aW9uLndpZHRofVwiPjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlID09IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydEFzY2VuZGluZ1wiIG5nLWhpZGU9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPiA8aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnREZXNjZW5kaW5nXCIgbmctc2hvdz1cImxvY2FsQ29uZmlnLnJldmVyc2VcIj48L2k+PC9kaXY+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1pZj1cImRlZmluaXRpb24uc29ydEtleSAmJiBsb2NhbENvbmZpZy5wcmVkaWNhdGUgIT0gZGVmaW5pdGlvbi5zb3J0S2V5XCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0YWJsZVwiPjwvaT48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJUZW1wbGF0ZVwiIG5nLWJpbmQtaHRtbD1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIj48L2Rpdj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiIG5nLWJpbmQ9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlckRpc3BsYXlOYW1lXCI+PC9kaXY+PC90aD48L3RyPjwvdGFibGU+PGRpdiBjbGFzcz1cImFkLXRhYmxlLWNvbnRhaW5lclwiIG5nLXN0eWxlPVwie1xcJ21heC1oZWlnaHRcXCc6IGF0dHJzLnRhYmxlTWF4SGVpZ2h0fVwiPjx0YWJsZSBuZy1jbGFzcz1cImF0dHJzLnRhYmxlQ2xhc3NlcyB8fCBcXCd0YWJsZVxcJ1wiPjx0ciBjbGFzcz1cImFkLXVzZXItc2VsZWN0LW5vbmVcIiBuZy1pZj1cIiFhdHRycy50YWJsZU1heEhlaWdodFwiPjx0aCBjbGFzcz1cImFkLXNlbGVjdC1jZWxsXCIgbmctaWY9XCJhdHRycy5kcmFnZ2FibGVcIj48aT48L2k+PC90aD48dGggY2xhc3M9XCJhZC1zZWxlY3QtY2VsbFwiIG5nLWlmPVwiYXR0cnMuc2VsZWN0ZWRJdGVtcyAmJiBpdGVtcy5hbGxJdGVtc1wiPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cImFkLWN1cnNvci1wb2ludGVyXCIgbmctY2xpY2s9XCJhZFN0cmFwVXRpbHMuYWRkUmVtb3ZlSXRlbXNGcm9tTGlzdChpdGVtcy5hbGxJdGVtcywgc2VsZWN0ZWRJdGVtcylcIiBuZy1jaGVja2VkPVwiYWRTdHJhcFV0aWxzLml0ZW1zRXhpc3RJbkxpc3QoaXRlbXMuYWxsSXRlbXMsIHNlbGVjdGVkSXRlbXMpXCI+PC90aD48dGggZGF0YS1uZy1yZXBlYXQ9XCJkZWZpbml0aW9uIGluIGNvbHVtbkRlZmluaXRpb25cIiBuZy1jbGljaz1cInNvcnRCeUNvbHVtbihkZWZpbml0aW9uKVwiIG5nLWNsYXNzPVwie1xcJ2FkLWN1cnNvci1wb2ludGVyXFwnOiBkZWZpbml0aW9uLnNvcnRLZXl9XCIgbmctc3R5bGU9XCJ7XFwnd2lkdGhcXCc6IGRlZmluaXRpb24ud2lkdGh9XCI+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1pZj1cImRlZmluaXRpb24uc29ydEtleSAmJiBsb2NhbENvbmZpZy5wcmVkaWNhdGUgPT0gZGVmaW5pdGlvbi5zb3J0S2V5XCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0QXNjZW5kaW5nXCIgbmctaGlkZT1cImxvY2FsQ29uZmlnLnJldmVyc2VcIj48L2k+IDxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydERlc2NlbmRpbmdcIiBuZy1zaG93PVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT48L2Rpdj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSAhPSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRhYmxlXCI+PC9pPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCIgbmctYmluZC1odG1sPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJUZW1wbGF0ZVwiPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlckRpc3BsYXlOYW1lXCIgbmctYmluZD1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIj48L2Rpdj48L3RoPjwvdHI+PHRyIG5nLWlmPVwiIWF0dHJzLmRyYWdnYWJsZVwiIGRhdGEtbmctcmVwZWF0PVwiaXRlbSBpbiBpdGVtcy5saXN0XCIgbmctY2xhc3M9XCJ7XFwnYWQtc2VsZWN0ZWRcXCc6IGF0dHJzLnNlbGVjdGVkSXRlbXMgJiYgYWRTdHJhcFV0aWxzLml0ZW1FeGlzdHNJbkxpc3QoaXRlbSwgc2VsZWN0ZWRJdGVtcyl9XCI+PHRkIGNsYXNzPVwiYWQtc2VsZWN0LWNlbGxcIiBuZy1pZj1cImF0dHJzLnNlbGVjdGVkSXRlbXNcIj48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJhZC1jdXJzb3ItcG9pbnRlclwiIG5nLWNoZWNrZWQ9XCJhZFN0cmFwVXRpbHMuaXRlbUV4aXN0c0luTGlzdChpdGVtLCBzZWxlY3RlZEl0ZW1zKVwiIG5nLWNsaWNrPVwiYWRTdHJhcFV0aWxzLmFkZFJlbW92ZUl0ZW1Gcm9tTGlzdChpdGVtLCBzZWxlY3RlZEl0ZW1zKVwiPjwvdGQ+PHRkIGRhdGEtbmctcmVwZWF0PVwiZGVmaW5pdGlvbiBpbiBjb2x1bW5EZWZpbml0aW9uXCIgbmctc3R5bGU9XCJ7XFwnd2lkdGhcXCc6IGRlZmluaXRpb24ud2lkdGh9XCI+PGRpdiBuZy1pZj1cImRlZmluaXRpb24udGVtcGxhdGVVcmxcIj48bmctaW5jbHVkZSBzcmM9XCJkZWZpbml0aW9uLnRlbXBsYXRlVXJsXCI+PC9uZy1pbmNsdWRlPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLnRlbXBsYXRlXCI+PHNwYW4gYWQtY29tcGlsZS10ZW1wbGF0ZT1cImRlZmluaXRpb24udGVtcGxhdGVcIj48L3NwYW4+PC9kaXY+PGRpdiBuZy1pZj1cIiFkZWZpbml0aW9uLnRlbXBsYXRlVXJsICYmICFkZWZpbml0aW9uLnRlbXBsYXRlXCI+e3sgYWRTdHJhcFV0aWxzLmFwcGx5RmlsdGVyKGFkU3RyYXBVdGlscy5nZXRPYmplY3RQcm9wZXJ0eShpdGVtLCBkZWZpbml0aW9uLmRpc3BsYXlQcm9wZXJ0eSksIGRlZmluaXRpb24uY2VsbEZpbHRlcikgfX08L2Rpdj48L3RkPjwvdHI+PHRyIG5nLWlmPVwiYXR0cnMuZHJhZ2dhYmxlXCIgYWQtZHJhZz1cInRydWVcIiBhZC1kcmFnLWhhbmRsZT1cInRydWVcIiBhZC1kcm9wPVwidHJ1ZVwiIGFkLWRyYWctZGF0YT1cIml0ZW1cIiBhZC1kcm9wLW92ZXI9XCJvbkRyYWdPdmVyKCRkYXRhLCAkZHJhZ0VsZW1lbnQsICRkcm9wRWxlbWVudCwgJGV2ZW50KVwiIGFkLWRyb3AtZW5kPVwib25Ecm9wRW5kKCRkYXRhLCAkZHJhZ0VsZW1lbnQsICRkcm9wRWxlbWVudCwgJGV2ZW50KVwiIGFkLWRyYWctYmVnaW49XCJvbkRyYWdTdGFydCgkZGF0YSwgJGRyYWdFbGVtZW50LCAkZXZlbnQpXCIgYWQtZHJhZy1lbmQ9XCJvbkRyYWdFbmQoJGRhdGEsICRkcmFnRWxlbWVudCwgJGV2ZW50KVwiIGRhdGEtbmctcmVwZWF0PVwiaXRlbSBpbiBpdGVtcy5saXN0XCIgbmctY2xhc3M9XCJ7XFwnYWQtc2VsZWN0ZWRcXCc6IGF0dHJzLnNlbGVjdGVkSXRlbXMgJiYgYWRTdHJhcFV0aWxzLml0ZW1FeGlzdHNJbkxpc3QoaXRlbSwgc2VsZWN0ZWRJdGVtcyl9XCI+PHRkIGNsYXNzPVwiYWQtc2VsZWN0LWNlbGwgYWQtZHJhZy1oYW5kbGVcIiBuZy1pZj1cImF0dHJzLmRyYWdnYWJsZVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuZHJhZ2dhYmxlXCI+PC9pPjwvdGQ+PHRkIGNsYXNzPVwiYWQtc2VsZWN0LWNlbGxcIiBuZy1pZj1cImF0dHJzLnNlbGVjdGVkSXRlbXNcIj48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJhZC1jdXJzb3ItcG9pbnRlclwiIG5nLWNoZWNrZWQ9XCJhZFN0cmFwVXRpbHMuaXRlbUV4aXN0c0luTGlzdChpdGVtLCBzZWxlY3RlZEl0ZW1zKVwiIG5nLWNsaWNrPVwiYWRTdHJhcFV0aWxzLmFkZFJlbW92ZUl0ZW1Gcm9tTGlzdChpdGVtLCBzZWxlY3RlZEl0ZW1zKVwiPjwvdGQ+PHRkIGRhdGEtbmctcmVwZWF0PVwiZGVmaW5pdGlvbiBpbiBjb2x1bW5EZWZpbml0aW9uXCIgbmctc3R5bGU9XCJ7XFwnd2lkdGhcXCc6IGRlZmluaXRpb24ud2lkdGh9XCI+PGRpdiBuZy1pZj1cImRlZmluaXRpb24udGVtcGxhdGVVcmxcIj48bmctaW5jbHVkZSBzcmM9XCJkZWZpbml0aW9uLnRlbXBsYXRlVXJsXCI+PC9uZy1pbmNsdWRlPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLnRlbXBsYXRlXCI+PHNwYW4gYWQtY29tcGlsZS10ZW1wbGF0ZT1cImRlZmluaXRpb24udGVtcGxhdGVcIj48L3NwYW4+PC9kaXY+PGRpdiBuZy1pZj1cIiFkZWZpbml0aW9uLnRlbXBsYXRlVXJsICYmICFkZWZpbml0aW9uLnRlbXBsYXRlXCI+e3sgYWRTdHJhcFV0aWxzLmFwcGx5RmlsdGVyKGFkU3RyYXBVdGlscy5nZXRPYmplY3RQcm9wZXJ0eShpdGVtLCBkZWZpbml0aW9uLmRpc3BsYXlQcm9wZXJ0eSksIGRlZmluaXRpb24uY2VsbEZpbHRlcikgfX08L2Rpdj48L3RkPjwvdHI+PC90YWJsZT48L2Rpdj48ZGl2IGNsYXNzPVwicm93XCIgbmctaWY9XCJpdGVtcy5hbGxJdGVtcy5sZW5ndGggPiBpdGVtcy5wYWdpbmcucGFnZVNpemVzWzBdICYmICFhdHRycy5kaXNhYmxlUGFnaW5nXCI+PGRpdiBjbGFzcz1cImNvbC1tZC04IGNvbC1zbS04XCI+PGRpdiBjbGFzcz1cInB1bGwtbGVmdFwiIG5nLWNsYXNzPVwiYXR0cnMucGFnaW5hdGlvbkJ0bkdyb3VwQ2xhc3NlcyB8fCBcXCdidG4tZ3JvdXAgYnRuLWdyb3VwLXNtXFwnXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1jbGljaz1cImxvYWRQYWdlKDEpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gMVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuZmlyc3RQYWdlXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWlmPVwiIWF0dHJzLmRyYWdnYWJsZVwiIG5nLWNsaWNrPVwibG9hZFByZXZpb3VzUGFnZSgpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gMVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMucHJldmlvdXNQYWdlXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBpZD1cImJ0blByZXZcIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWlmPVwiYXR0cnMuZHJhZ2dhYmxlXCIgYWQtZHJvcD1cInRydWVcIiBhZC1kcm9wLW92ZXI9XCJvbk5leHRQYWdlQnV0dG9uT3ZlcigkZGF0YSwgJGRyYWdFbGVtZW50LCAkZHJvcEVsZW1lbnQsICRldmVudClcIiBhZC1kcm9wLWVuZD1cIm9uTmV4dFBhZ2VCdXR0b25Ecm9wKCRkYXRhLCAkZHJhZ0VsZW1lbnQsICRkcm9wRWxlbWVudCwgJGV2ZW50KVwiIG5nLWNsaWNrPVwibG9hZFByZXZpb3VzUGFnZSgpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gMVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMucHJldmlvdXNQYWdlXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLXJlcGVhdD1cInBhZ2UgaW4gbG9jYWxDb25maWcucGFnaW5nQXJyYXlcIiBuZy1jbGFzcz1cInthY3RpdmU6IGl0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSBwYWdlfVwiIG5nLWNsaWNrPVwibG9hZFBhZ2UocGFnZSlcIj57eyBwYWdlIH19PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctaWY9XCIhYXR0cnMuZHJhZ2dhYmxlXCIgbmctY2xpY2s9XCJsb2FkTmV4dFBhZ2UoKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IGl0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5uZXh0UGFnZVwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBpZD1cImJ0bk5leHRcIiBuZy1pZj1cImF0dHJzLmRyYWdnYWJsZVwiIGFkLWRyb3A9XCJ0cnVlXCIgYWQtZHJvcC1vdmVyPVwib25OZXh0UGFnZUJ1dHRvbk92ZXIoJGRhdGEsICRkcmFnRWxlbWVudCwgJGRyb3BFbGVtZW50LCAkZXZlbnQpXCIgYWQtZHJvcC1lbmQ9XCJvbk5leHRQYWdlQnV0dG9uRHJvcCgkZGF0YSwgJGRyYWdFbGVtZW50LCAkZHJvcEVsZW1lbnQsICRldmVudClcIiBuZy1jbGljaz1cImxvYWROZXh0UGFnZSgpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gaXRlbXMucGFnaW5nLnRvdGFsUGFnZXNcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLm5leHRQYWdlXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWNsaWNrPVwibG9hZExhc3RQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSBpdGVtcy5wYWdpbmcudG90YWxQYWdlc1wiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMubGFzdFBhZ2VcIj48L2k+PC9idXR0b24+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cImNvbC1tZC00IGNvbC1zbS00XCI+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1jbGFzcz1cImF0dHJzLnBhZ2luYXRpb25CdG5Hcm91cENsYXNzZXMgfHwgXFwnYnRuLWdyb3VwIGJ0bi1ncm91cC1zbVxcJ1wiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctcmVwZWF0PVwic2l6ZSBpbiBpdGVtcy5wYWdpbmcucGFnZVNpemVzXCIgbmctY2xhc3M9XCJ7YWN0aXZlOiBpdGVtcy5wYWdpbmcucGFnZVNpemUgPT0gc2l6ZX1cIiBuZy1jbGljaz1cInBhZ2VTaXplQ2hhbmdlZChzaXplKVwiPnt7IHNpemUgfX08L2J1dHRvbj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IG5nLWlmPVwiIWl0ZW1zLmFsbEl0ZW1zLmxlbmd0aCAmJiBhdHRycy5pdGVtc05vdEZvdW5kTWVzc2FnZVwiPjxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1pbmZvXCIgcm9sZT1cImFsZXJ0XCI+e3sgYXR0cnMuaXRlbXNOb3RGb3VuZE1lc3NhZ2UgfX08L2Rpdj48L2Rpdj4nKTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogdHJlZWJyb3dzZXIudHBsLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAudHJlZWJyb3dzZXInKS5ydW4oW1xuICAnJHRlbXBsYXRlQ2FjaGUnLFxuICBmdW5jdGlvbiAoJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3RyZWVicm93c2VyL3RyZWVicm93c2VyLnRwbC5odG1sJywgJzxkaXYgY2xhc3M9XCJhZC10cmVlLWJyb3dzZXItY29udGFpbmVyXCIgbmctY2xhc3M9XCJ7XFwndHJlZS1ib3JkZXJlZFxcJzogYXR0cnMuYm9yZGVyZWR9XCI+PGRpdiBkYXRhLWxldmVsPVwiMFwiIGNsYXNzPVwidHJlZS12aWV3XCI+PGRpdiBjbGFzcz1cInRyZWVcIj48c2NyaXB0IHR5cGU9XCJ0ZXh0L25nLXRlbXBsYXRlXCIgaWQ9XCJ7eyBsb2NhbENvbmZpZy5yZW5kZXJlclRlbXBsYXRlSWQgfX1cIj48ZGl2IGNsYXNzPVwiY29udGVudFwiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICBuZy1zdHlsZT1cIntcXCdwYWRkaW5nLWxlZnRcXCc6IGxldmVsICogKGF0dHJzLmNoaWxkcmVuUGFkZGluZyB8fCAxNSkgKyBcXCdweFxcJ31cIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XCJ7eyBhdHRycy5yb3dOZ0NsYXNzIH19XCI+XFxuJyArICcgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50LWhvbGRlclwiPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRvZ2dsZVwiPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIG5nLWlmPVwiIWl0ZW0uX2FkX2V4cGFuZGVkICYmIGhhc0NoaWxkcmVuKGl0ZW0pICYmICFpdGVtLl9hZF9sb2FkaW5nXCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cImljb25DbGFzc2VzLmV4cGFuZFwiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJ0b2dnbGUoJGV2ZW50LGl0ZW0pXCI+PC9pPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIG5nLWlmPVwiaXRlbS5fYWRfZXhwYW5kZWQgJiYgIWl0ZW0uX2FkX2xvYWRpbmdcIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuY29sbGFwc2VcIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsaWNrPVwidG9nZ2xlKCRldmVudCxpdGVtKVwiPjwvaT5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBuZy1pZj1cIml0ZW0uX2FkX2xvYWRpbmdcIj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5sb2FkaW5nU3Bpbm5lclwiPjwvaT5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJub2RlLWNvbnRlbnRcIj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWluY2x1ZGUgbmctaWY9XCJhdHRycy5ub2RlVGVtcGxhdGVVcmxcIiBzcmM9XCJhdHRycy5ub2RlVGVtcGxhdGVVcmxcIj48L25nLWluY2x1ZGU+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIG5nLWlmPVwiIWF0dHJzLm5vZGVUZW1wbGF0ZVVybFwiPnt7IGl0ZW0ubmFtZSB8fCBcIlwiIH19PC9zcGFuPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArICcgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgKyAnICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgKyAnICAgICAgICAgICAgICAgIDxkaXYgbmctc2hvdz1cIml0ZW0uX2FkX2V4cGFuZGVkXCI+XFxuJyArICcgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0cmVlLWxldmVsIHRyZWUtc3ViLWxldmVsXCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWQ9XCJsZXZlbD1sZXZlbCsxXCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICBuZy1yZXBlYXQ9XCJpdGVtIGluIGl0ZW1bYXR0cnMuY2hpbGROb2RlXVwiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgbmctaW5jbHVkZT1cIlxcJ3t7IGxvY2FsQ29uZmlnLnJlbmRlcmVyVGVtcGxhdGVJZCB9fVxcJ1wiPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICsgJyAgICAgICAgICAgICAgICA8L2Rpdj48L3NjcmlwdD48ZGl2PjxkaXYgY2xhc3M9XCJ0cmVlLWxldmVsIHRyZWUtaGVhZGVyLWxldmVsIGJvcmRlclwiIG5nLWlmPVwiYXR0cnMubm9kZUhlYWRlclVybFwiPjxkaXYgY2xhc3M9XCJjb250ZW50XCIgbmctc3R5bGU9XCJ7XFwncGFkZGluZy1sZWZ0XFwnOiAoYXR0cnMuY2hpbGRyZW5QYWRkaW5nIHx8IDE1KSArIFxcJ3B4XFwnfVwiPjxkaXYgY2xhc3M9XCJjb250ZW50LWhvbGRlclwiPjxkaXYgY2xhc3M9XCJ0b2dnbGVcIj48L2Rpdj48ZGl2IGNsYXNzPVwibm9kZS1jb250ZW50IGFkLXVzZXItc2VsZWN0LW5vbmVcIiBuZy1pbmNsdWRlPVwiYXR0cnMubm9kZUhlYWRlclVybFwiPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJ0cmVlLWxldmVsIHRyZWUtdG9wLWxldmVsIGJvcmRlclwiIG9ubG9hZD1cImxldmVsID0gMVwiIG5nLXJlcGVhdD1cIml0ZW0gaW4gdHJlZVJvb3RbYXR0cnMuY2hpbGROb2RlXVwiIG5nLWluY2x1ZGU9XCJcXCd7eyBsb2NhbENvbmZpZy5yZW5kZXJlclRlbXBsYXRlSWQgfX1cXCdcIj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj4nKTtcbiAgfVxuXSk7XG5cblxufSkod2luZG93LCBkb2N1bWVudCk7XG4iLCIvKipcbiAqIGFuZ3VsYXItZ3Jvd2wtdjIgLSB2MC43LjAgLSAyMDE0LTA4LTEwXG4gKiBodHRwOi8vamFuc3RldmVucy5naXRodWIuaW8vYW5ndWxhci1ncm93bC0yXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQgTWFyY28gUmluY2ssSmFuIFN0ZXZlbnM7IExpY2Vuc2VkIE1JVFxuICovXG5hbmd1bGFyLm1vZHVsZShcImFuZ3VsYXItZ3Jvd2xcIixbXSksYW5ndWxhci5tb2R1bGUoXCJhbmd1bGFyLWdyb3dsXCIpLmRpcmVjdGl2ZShcImdyb3dsXCIsW1wiJHJvb3RTY29wZVwiLFwiJHNjZVwiLGZ1bmN0aW9uKGEsYil7XCJ1c2Ugc3RyaWN0XCI7cmV0dXJue3Jlc3RyaWN0OlwiQVwiLHRlbXBsYXRlVXJsOlwidGVtcGxhdGVzL2dyb3dsL2dyb3dsLmh0bWxcIixyZXBsYWNlOiExLHNjb3BlOntyZWZlcmVuY2U6XCJAXCIsaW5saW5lOlwiQFwiLGxpbWl0TWVzc2FnZXM6XCI9XCJ9LGNvbnRyb2xsZXI6W1wiJHNjb3BlXCIsXCIkdGltZW91dFwiLFwiZ3Jvd2xcIixmdW5jdGlvbihjLGQsZSl7ZnVuY3Rpb24gZihhKXtkKGZ1bmN0aW9uKCl7dmFyIGYsaDtpZighZ3x8KGFuZ3VsYXIuZm9yRWFjaChjLm1lc3NhZ2VzLGZ1bmN0aW9uKGMpe2g9Yi5nZXRUcnVzdGVkSHRtbChjLnRleHQpLGEudGV4dD09PWgmJmEuc2V2ZXJpdHk9PT1jLnNldmVyaXR5JiZjLnRpdGxlPT09Yy50aXRsZSYmKGY9ITApfSksIWYpKXtpZihhLnRleHQ9Yi50cnVzdEFzSHRtbChTdHJpbmcoYS50ZXh0KSksYS50dGwmJi0xIT09YS50dGwmJihhLmNvdW50ZG93bj1hLnR0bC8xZTMsYS5wcm9taXNlcz1bXSxhLmNsb3NlPSExLGEuY291bnRkb3duRnVuY3Rpb249ZnVuY3Rpb24oKXthLmNvdW50ZG93bj4xPyhhLmNvdW50ZG93bi0tLGEucHJvbWlzZXMucHVzaChkKGEuY291bnRkb3duRnVuY3Rpb24sMWUzKSkpOmEuY291bnRkb3duLS19KSxhbmd1bGFyLmlzRGVmaW5lZChjLmxpbWl0TWVzc2FnZXMpKXt2YXIgaT1jLm1lc3NhZ2VzLmxlbmd0aC0oYy5saW1pdE1lc3NhZ2VzLTEpO2k+MCYmYy5tZXNzYWdlcy5zcGxpY2UoYy5saW1pdE1lc3NhZ2VzLTEsaSl9ZS5yZXZlcnNlT3JkZXIoKT9jLm1lc3NhZ2VzLnVuc2hpZnQoYSk6Yy5tZXNzYWdlcy5wdXNoKGEpLGEudHRsJiYtMSE9PWEudHRsJiYoYS5wcm9taXNlcy5wdXNoKGQoZnVuY3Rpb24oKXtjLmRlbGV0ZU1lc3NhZ2UoYSl9LGEudHRsKSksYS5wcm9taXNlcy5wdXNoKGQoYS5jb3VudGRvd25GdW5jdGlvbiwxZTMpKSl9fSwhMCl9dmFyIGc9ZS5vbmx5VW5pcXVlKCk7Yy5tZXNzYWdlcz1bXTt2YXIgaD1jLnJlZmVyZW5jZXx8MDtjLmlubGluZU1lc3NhZ2U9Yy5pbmxpbmV8fGUuaW5saW5lTWVzc2FnZXMoKSxhLiRvbihcImdyb3dsTWVzc2FnZVwiLGZ1bmN0aW9uKGEsYil7cGFyc2VJbnQoaCwxMCk9PT1wYXJzZUludChiLnJlZmVyZW5jZUlkLDEwKSYmZihiKX0pLGMuZGVsZXRlTWVzc2FnZT1mdW5jdGlvbihhKXt2YXIgYj1jLm1lc3NhZ2VzLmluZGV4T2YoYSk7Yj4tMSYmYy5tZXNzYWdlcy5zcGxpY2UoYiwxKX0sYy5zdG9wVGltZW91dENsb3NlPWZ1bmN0aW9uKGEpe2FuZ3VsYXIuZm9yRWFjaChhLnByb21pc2VzLGZ1bmN0aW9uKGEpe2QuY2FuY2VsKGEpfSksYS5jbG9zZT9jLmRlbGV0ZU1lc3NhZ2UoYSk6YS5jbG9zZT0hMH0sYy5hbGVydENsYXNzZXM9ZnVuY3Rpb24oYSl7cmV0dXJue1wiYWxlcnQtc3VjY2Vzc1wiOlwic3VjY2Vzc1wiPT09YS5zZXZlcml0eSxcImFsZXJ0LWVycm9yXCI6XCJlcnJvclwiPT09YS5zZXZlcml0eSxcImFsZXJ0LWRhbmdlclwiOlwiZXJyb3JcIj09PWEuc2V2ZXJpdHksXCJhbGVydC1pbmZvXCI6XCJpbmZvXCI9PT1hLnNldmVyaXR5LFwiYWxlcnQtd2FybmluZ1wiOlwid2FybmluZ1wiPT09YS5zZXZlcml0eSxpY29uOmEuZGlzYWJsZUljb25zPT09ITEsXCJhbGVydC1kaXNtaXNzYWJsZVwiOiFhLmRpc2FibGVDbG9zZUJ1dHRvbn19LGMuc2hvd0NvdW50RG93bj1mdW5jdGlvbihhKXtyZXR1cm4hYS5kaXNhYmxlQ291bnREb3duJiZhLnR0bD4wfSxjLndyYXBwZXJDbGFzc2VzPWZ1bmN0aW9uKCl7dmFyIGE9e307cmV0dXJuIGFbXCJncm93bC1maXhlZFwiXT0hYy5pbmxpbmVNZXNzYWdlLGFbZS5wb3NpdGlvbigpXT0hMCxhfSxjLmNvbXB1dGVUaXRsZT1mdW5jdGlvbihhKXt2YXIgYj17c3VjY2VzczpcIlN1Y2Nlc3NcIixlcnJvcjpcIkVycm9yXCIsaW5mbzpcIkluZm9ybWF0aW9uXCIsd2FybjpcIldhcm5pbmdcIn07cmV0dXJuIGJbYS5zZXZlcml0eV19fV19fV0pLGFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhci1ncm93bFwiKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIixmdW5jdGlvbihhKXtcInVzZSBzdHJpY3RcIjt2b2lkIDA9PT1hLmdldChcInRlbXBsYXRlcy9ncm93bC9ncm93bC5odG1sXCIpJiZhLnB1dChcInRlbXBsYXRlcy9ncm93bC9ncm93bC5odG1sXCIsJzxkaXYgY2xhc3M9XCJncm93bC1jb250YWluZXJcIiBuZy1jbGFzcz1cIndyYXBwZXJDbGFzc2VzKClcIj48ZGl2IGNsYXNzPVwiZ3Jvd2wtaXRlbSBhbGVydFwiIG5nLXJlcGVhdD1cIm1lc3NhZ2UgaW4gbWVzc2FnZXNcIiBuZy1jbGFzcz1cImFsZXJ0Q2xhc3NlcyhtZXNzYWdlKVwiIG5nLWNsaWNrPVwic3RvcFRpbWVvdXRDbG9zZShtZXNzYWdlKVwiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIiBkYXRhLWRpc21pc3M9XCJhbGVydFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIG5nLWNsaWNrPVwiZGVsZXRlTWVzc2FnZShtZXNzYWdlKVwiIG5nLXNob3c9XCIhbWVzc2FnZS5kaXNhYmxlQ2xvc2VCdXR0b25cIj4mdGltZXM7PC9idXR0b24+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIG5nLXNob3c9XCJzaG93Q291bnREb3duKG1lc3NhZ2UpXCI+e3ttZXNzYWdlLmNvdW50ZG93bn19PC9idXR0b24+PGg0IGNsYXNzPVwiZ3Jvd2wtdGl0bGVcIiBuZy1zaG93PVwibWVzc2FnZS50aXRsZVwiIG5nLWJpbmQ9XCJtZXNzYWdlLnRpdGxlXCI+PC9oND48ZGl2IGNsYXNzPVwiZ3Jvd2wtbWVzc2FnZVwiIG5nLWJpbmQtaHRtbD1cIm1lc3NhZ2UudGV4dFwiPjwvZGl2PjwvZGl2PjwvZGl2PicpfV0pLGFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhci1ncm93bFwiKS5wcm92aWRlcihcImdyb3dsXCIsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjt2YXIgYT17c3VjY2VzczpudWxsLGVycm9yOm51bGwsd2FybmluZzpudWxsLGluZm86bnVsbH0sYj1cIm1lc3NhZ2VzXCIsYz1cInRleHRcIixkPVwidGl0bGVcIixlPVwic2V2ZXJpdHlcIixmPSEwLGc9XCJ2YXJpYWJsZXNcIixoPTAsaT0hMSxqPVwidG9wLXJpZ2h0XCIsaz0hMSxsPSExLG09ITEsbj0hMTt0aGlzLmdsb2JhbFRpbWVUb0xpdmU9ZnVuY3Rpb24oYil7aWYoXCJvYmplY3RcIj09dHlwZW9mIGIpZm9yKHZhciBjIGluIGIpYi5oYXNPd25Qcm9wZXJ0eShjKSYmKGFbY109YltjXSk7ZWxzZSBmb3IodmFyIGQgaW4gYSlhLmhhc093blByb3BlcnR5KGQpJiYoYVtkXT1iKX0sdGhpcy5nbG9iYWxEaXNhYmxlQ2xvc2VCdXR0b249ZnVuY3Rpb24oYSl7az1hfSx0aGlzLmdsb2JhbERpc2FibGVJY29ucz1mdW5jdGlvbihhKXtsPWF9LHRoaXMuZ2xvYmFsUmV2ZXJzZWRPcmRlcj1mdW5jdGlvbihhKXttPWF9LHRoaXMuZ2xvYmFsRGlzYWJsZUNvdW50RG93bj1mdW5jdGlvbihhKXtuPWF9LHRoaXMubWVzc2FnZVZhcmlhYmxlS2V5PWZ1bmN0aW9uKGEpe2c9YX0sdGhpcy5nbG9iYWxJbmxpbmVNZXNzYWdlcz1mdW5jdGlvbihhKXtpPWF9LHRoaXMuZ2xvYmFsUG9zaXRpb249ZnVuY3Rpb24oYSl7aj1hfSx0aGlzLm1lc3NhZ2VzS2V5PWZ1bmN0aW9uKGEpe2I9YX0sdGhpcy5tZXNzYWdlVGV4dEtleT1mdW5jdGlvbihhKXtjPWF9LHRoaXMubWVzc2FnZVRpdGxlS2V5PWZ1bmN0aW9uKGEpe2Q9YX0sdGhpcy5tZXNzYWdlU2V2ZXJpdHlLZXk9ZnVuY3Rpb24oYSl7ZT1hfSx0aGlzLm9ubHlVbmlxdWVNZXNzYWdlcz1mdW5jdGlvbihhKXtmPWF9LHRoaXMuc2VydmVyTWVzc2FnZXNJbnRlcmNlcHRvcj1bXCIkcVwiLFwiZ3Jvd2xcIixmdW5jdGlvbihhLGMpe2Z1bmN0aW9uIGQoYSl7YS5kYXRhW2JdJiZhLmRhdGFbYl0ubGVuZ3RoPjAmJmMuYWRkU2VydmVyTWVzc2FnZXMoYS5kYXRhW2JdKX1yZXR1cm57cmVzcG9uc2U6ZnVuY3Rpb24oYSl7cmV0dXJuIGQoYSksYX0scmVzcG9uc2VFcnJvcjpmdW5jdGlvbihiKXtyZXR1cm4gZChiKSxhLnJlamVjdChiKX19fV0sdGhpcy4kZ2V0PVtcIiRyb290U2NvcGVcIixcIiRpbnRlcnBvbGF0ZVwiLFwiJGZpbHRlclwiLGZ1bmN0aW9uKGIsbyxwKXtmdW5jdGlvbiBxKGEpe2lmKEIpYS50ZXh0PUIoYS50ZXh0LGEudmFyaWFibGVzKTtlbHNle3ZhciBjPW8oYS50ZXh0KTthLnRleHQ9YyhhLnZhcmlhYmxlcyl9Yi4kYnJvYWRjYXN0KFwiZ3Jvd2xNZXNzYWdlXCIsYSl9ZnVuY3Rpb24gcihiLGMsZCl7dmFyIGUsZj1jfHx7fTtlPXt0ZXh0OmIsdGl0bGU6Zi50aXRsZSxzZXZlcml0eTpkLHR0bDpmLnR0bHx8YVtkXSx2YXJpYWJsZXM6Zi52YXJpYWJsZXN8fHt9LGRpc2FibGVDbG9zZUJ1dHRvbjp2b2lkIDA9PT1mLmRpc2FibGVDbG9zZUJ1dHRvbj9rOmYuZGlzYWJsZUNsb3NlQnV0dG9uLGRpc2FibGVJY29uczp2b2lkIDA9PT1mLmRpc2FibGVJY29ucz9sOmYuZGlzYWJsZUljb25zLGRpc2FibGVDb3VudERvd246dm9pZCAwPT09Zi5kaXNhYmxlQ291bnREb3duP246Zi5kaXNhYmxlQ291bnREb3duLHBvc2l0aW9uOmYucG9zaXRpb258fGoscmVmZXJlbmNlSWQ6Zi5yZWZlcmVuY2VJZHx8aH0scShlKX1mdW5jdGlvbiBzKGEsYil7cihhLGIsXCJ3YXJuaW5nXCIpfWZ1bmN0aW9uIHQoYSxiKXtyKGEsYixcImVycm9yXCIpfWZ1bmN0aW9uIHUoYSxiKXtyKGEsYixcImluZm9cIil9ZnVuY3Rpb24gdihhLGIpe3IoYSxiLFwic3VjY2Vzc1wiKX1mdW5jdGlvbiB3KGEpe3ZhciBiLGYsaCxpO2ZvcihpPWEubGVuZ3RoLGI9MDtpPmI7YisrKWlmKGY9YVtiXSxmW2NdKXtoPWZbZV18fFwiZXJyb3JcIjt2YXIgaj17fTtqLnZhcmlhYmxlcz1mW2ddfHx7fSxqLnRpdGxlPWZbZF0scihmW2NdLGosaCl9fWZ1bmN0aW9uIHgoKXtyZXR1cm4gZn1mdW5jdGlvbiB5KCl7cmV0dXJuIG19ZnVuY3Rpb24geigpe3JldHVybiBpfWZ1bmN0aW9uIEEoKXtyZXR1cm4gan12YXIgQjt0cnl7Qj1wKFwidHJhbnNsYXRlXCIpfWNhdGNoKEMpe31yZXR1cm57d2FybmluZzpzLGVycm9yOnQsaW5mbzp1LHN1Y2Nlc3M6dixhZGRTZXJ2ZXJNZXNzYWdlczp3LG9ubHlVbmlxdWU6eCxyZXZlcnNlT3JkZXI6eSxpbmxpbmVNZXNzYWdlczp6LHBvc2l0aW9uOkF9fV19KTsiLCIvKipcbiAqIEBsaWNlbnNlIEFuZ3VsYXJKUyB2MS4zLjFcbiAqIChjKSAyMDEwLTIwMTQgR29vZ2xlLCBJbmMuIGh0dHA6Ly9hbmd1bGFyanMub3JnXG4gKiBMaWNlbnNlOiBNSVRcbiAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgYW5ndWxhciwgdW5kZWZpbmVkKSB7J3VzZSBzdHJpY3QnO1xuXG52YXIgJHNhbml0aXplTWluRXJyID0gYW5ndWxhci4kJG1pbkVycignJHNhbml0aXplJyk7XG5cbi8qKlxuICogQG5nZG9jIG1vZHVsZVxuICogQG5hbWUgbmdTYW5pdGl6ZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogIyBuZ1Nhbml0aXplXG4gKlxuICogVGhlIGBuZ1Nhbml0aXplYCBtb2R1bGUgcHJvdmlkZXMgZnVuY3Rpb25hbGl0eSB0byBzYW5pdGl6ZSBIVE1MLlxuICpcbiAqXG4gKiA8ZGl2IGRvYy1tb2R1bGUtY29tcG9uZW50cz1cIm5nU2FuaXRpemVcIj48L2Rpdj5cbiAqXG4gKiBTZWUge0BsaW5rIG5nU2FuaXRpemUuJHNhbml0aXplIGAkc2FuaXRpemVgfSBmb3IgdXNhZ2UuXG4gKi9cblxuLypcbiAqIEhUTUwgUGFyc2VyIEJ5IE1pc2tvIEhldmVyeSAobWlza29AaGV2ZXJ5LmNvbSlcbiAqIGJhc2VkIG9uOiAgSFRNTCBQYXJzZXIgQnkgSm9obiBSZXNpZyAoZWpvaG4ub3JnKVxuICogT3JpZ2luYWwgY29kZSBieSBFcmlrIEFydmlkc3NvbiwgTW96aWxsYSBQdWJsaWMgTGljZW5zZVxuICogaHR0cDovL2VyaWsuZWFlLm5ldC9zaW1wbGVodG1scGFyc2VyL3NpbXBsZWh0bWxwYXJzZXIuanNcbiAqXG4gKiAvLyBVc2UgbGlrZSBzbzpcbiAqIGh0bWxQYXJzZXIoaHRtbFN0cmluZywge1xuICogICAgIHN0YXJ0OiBmdW5jdGlvbih0YWcsIGF0dHJzLCB1bmFyeSkge30sXG4gKiAgICAgZW5kOiBmdW5jdGlvbih0YWcpIHt9LFxuICogICAgIGNoYXJzOiBmdW5jdGlvbih0ZXh0KSB7fSxcbiAqICAgICBjb21tZW50OiBmdW5jdGlvbih0ZXh0KSB7fVxuICogfSk7XG4gKlxuICovXG5cblxuLyoqXG4gKiBAbmdkb2Mgc2VydmljZVxuICogQG5hbWUgJHNhbml0aXplXG4gKiBAa2luZCBmdW5jdGlvblxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogICBUaGUgaW5wdXQgaXMgc2FuaXRpemVkIGJ5IHBhcnNpbmcgdGhlIEhUTUwgaW50byB0b2tlbnMuIEFsbCBzYWZlIHRva2VucyAoZnJvbSBhIHdoaXRlbGlzdCkgYXJlXG4gKiAgIHRoZW4gc2VyaWFsaXplZCBiYWNrIHRvIHByb3Blcmx5IGVzY2FwZWQgaHRtbCBzdHJpbmcuIFRoaXMgbWVhbnMgdGhhdCBubyB1bnNhZmUgaW5wdXQgY2FuIG1ha2VcbiAqICAgaXQgaW50byB0aGUgcmV0dXJuZWQgc3RyaW5nLCBob3dldmVyLCBzaW5jZSBvdXIgcGFyc2VyIGlzIG1vcmUgc3RyaWN0IHRoYW4gYSB0eXBpY2FsIGJyb3dzZXJcbiAqICAgcGFyc2VyLCBpdCdzIHBvc3NpYmxlIHRoYXQgc29tZSBvYnNjdXJlIGlucHV0LCB3aGljaCB3b3VsZCBiZSByZWNvZ25pemVkIGFzIHZhbGlkIEhUTUwgYnkgYVxuICogICBicm93c2VyLCB3b24ndCBtYWtlIGl0IHRocm91Z2ggdGhlIHNhbml0aXplci4gVGhlIGlucHV0IG1heSBhbHNvIGNvbnRhaW4gU1ZHIG1hcmt1cC5cbiAqICAgVGhlIHdoaXRlbGlzdCBpcyBjb25maWd1cmVkIHVzaW5nIHRoZSBmdW5jdGlvbnMgYGFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0YCBhbmRcbiAqICAgYGltZ1NyY1Nhbml0aXphdGlvbldoaXRlbGlzdGAgb2Yge0BsaW5rIG5nLiRjb21waWxlUHJvdmlkZXIgYCRjb21waWxlUHJvdmlkZXJgfS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBIVE1MIGlucHV0LlxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIEhUTUwuXG4gKlxuICogQGV4YW1wbGVcbiAgIDxleGFtcGxlIG1vZHVsZT1cInNhbml0aXplRXhhbXBsZVwiIGRlcHM9XCJhbmd1bGFyLXNhbml0aXplLmpzXCI+XG4gICA8ZmlsZSBuYW1lPVwiaW5kZXguaHRtbFwiPlxuICAgICA8c2NyaXB0PlxuICAgICAgICAgYW5ndWxhci5tb2R1bGUoJ3Nhbml0aXplRXhhbXBsZScsIFsnbmdTYW5pdGl6ZSddKVxuICAgICAgICAgICAuY29udHJvbGxlcignRXhhbXBsZUNvbnRyb2xsZXInLCBbJyRzY29wZScsICckc2NlJywgZnVuY3Rpb24oJHNjb3BlLCAkc2NlKSB7XG4gICAgICAgICAgICAgJHNjb3BlLnNuaXBwZXQgPVxuICAgICAgICAgICAgICAgJzxwIHN0eWxlPVwiY29sb3I6Ymx1ZVwiPmFuIGh0bWxcXG4nICtcbiAgICAgICAgICAgICAgICc8ZW0gb25tb3VzZW92ZXI9XCJ0aGlzLnRleHRDb250ZW50PVxcJ1BXTjNEIVxcJ1wiPmNsaWNrIGhlcmU8L2VtPlxcbicgK1xuICAgICAgICAgICAgICAgJ3NuaXBwZXQ8L3A+JztcbiAgICAgICAgICAgICAkc2NvcGUuZGVsaWJlcmF0ZWx5VHJ1c3REYW5nZXJvdXNTbmlwcGV0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbCgkc2NvcGUuc25pcHBldCk7XG4gICAgICAgICAgICAgfTtcbiAgICAgICAgICAgfV0pO1xuICAgICA8L3NjcmlwdD5cbiAgICAgPGRpdiBuZy1jb250cm9sbGVyPVwiRXhhbXBsZUNvbnRyb2xsZXJcIj5cbiAgICAgICAgU25pcHBldDogPHRleHRhcmVhIG5nLW1vZGVsPVwic25pcHBldFwiIGNvbHM9XCI2MFwiIHJvd3M9XCIzXCI+PC90ZXh0YXJlYT5cbiAgICAgICA8dGFibGU+XG4gICAgICAgICA8dHI+XG4gICAgICAgICAgIDx0ZD5EaXJlY3RpdmU8L3RkPlxuICAgICAgICAgICA8dGQ+SG93PC90ZD5cbiAgICAgICAgICAgPHRkPlNvdXJjZTwvdGQ+XG4gICAgICAgICAgIDx0ZD5SZW5kZXJlZDwvdGQ+XG4gICAgICAgICA8L3RyPlxuICAgICAgICAgPHRyIGlkPVwiYmluZC1odG1sLXdpdGgtc2FuaXRpemVcIj5cbiAgICAgICAgICAgPHRkPm5nLWJpbmQtaHRtbDwvdGQ+XG4gICAgICAgICAgIDx0ZD5BdXRvbWF0aWNhbGx5IHVzZXMgJHNhbml0aXplPC90ZD5cbiAgICAgICAgICAgPHRkPjxwcmU+Jmx0O2RpdiBuZy1iaW5kLWh0bWw9XCJzbmlwcGV0XCImZ3Q7PGJyLz4mbHQ7L2RpdiZndDs8L3ByZT48L3RkPlxuICAgICAgICAgICA8dGQ+PGRpdiBuZy1iaW5kLWh0bWw9XCJzbmlwcGV0XCI+PC9kaXY+PC90ZD5cbiAgICAgICAgIDwvdHI+XG4gICAgICAgICA8dHIgaWQ9XCJiaW5kLWh0bWwtd2l0aC10cnVzdFwiPlxuICAgICAgICAgICA8dGQ+bmctYmluZC1odG1sPC90ZD5cbiAgICAgICAgICAgPHRkPkJ5cGFzcyAkc2FuaXRpemUgYnkgZXhwbGljaXRseSB0cnVzdGluZyB0aGUgZGFuZ2Vyb3VzIHZhbHVlPC90ZD5cbiAgICAgICAgICAgPHRkPlxuICAgICAgICAgICA8cHJlPiZsdDtkaXYgbmctYmluZC1odG1sPVwiZGVsaWJlcmF0ZWx5VHJ1c3REYW5nZXJvdXNTbmlwcGV0KClcIiZndDtcbiZsdDsvZGl2Jmd0OzwvcHJlPlxuICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICA8dGQ+PGRpdiBuZy1iaW5kLWh0bWw9XCJkZWxpYmVyYXRlbHlUcnVzdERhbmdlcm91c1NuaXBwZXQoKVwiPjwvZGl2PjwvdGQ+XG4gICAgICAgICA8L3RyPlxuICAgICAgICAgPHRyIGlkPVwiYmluZC1kZWZhdWx0XCI+XG4gICAgICAgICAgIDx0ZD5uZy1iaW5kPC90ZD5cbiAgICAgICAgICAgPHRkPkF1dG9tYXRpY2FsbHkgZXNjYXBlczwvdGQ+XG4gICAgICAgICAgIDx0ZD48cHJlPiZsdDtkaXYgbmctYmluZD1cInNuaXBwZXRcIiZndDs8YnIvPiZsdDsvZGl2Jmd0OzwvcHJlPjwvdGQ+XG4gICAgICAgICAgIDx0ZD48ZGl2IG5nLWJpbmQ9XCJzbmlwcGV0XCI+PC9kaXY+PC90ZD5cbiAgICAgICAgIDwvdHI+XG4gICAgICAgPC90YWJsZT5cbiAgICAgICA8L2Rpdj5cbiAgIDwvZmlsZT5cbiAgIDxmaWxlIG5hbWU9XCJwcm90cmFjdG9yLmpzXCIgdHlwZT1cInByb3RyYWN0b3JcIj5cbiAgICAgaXQoJ3Nob3VsZCBzYW5pdGl6ZSB0aGUgaHRtbCBzbmlwcGV0IGJ5IGRlZmF1bHQnLCBmdW5jdGlvbigpIHtcbiAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNiaW5kLWh0bWwtd2l0aC1zYW5pdGl6ZSBkaXYnKSkuZ2V0SW5uZXJIdG1sKCkpLlxuICAgICAgICAgdG9CZSgnPHA+YW4gaHRtbFxcbjxlbT5jbGljayBoZXJlPC9lbT5cXG5zbmlwcGV0PC9wPicpO1xuICAgICB9KTtcblxuICAgICBpdCgnc2hvdWxkIGlubGluZSByYXcgc25pcHBldCBpZiBib3VuZCB0byBhIHRydXN0ZWQgdmFsdWUnLCBmdW5jdGlvbigpIHtcbiAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNiaW5kLWh0bWwtd2l0aC10cnVzdCBkaXYnKSkuZ2V0SW5uZXJIdG1sKCkpLlxuICAgICAgICAgdG9CZShcIjxwIHN0eWxlPVxcXCJjb2xvcjpibHVlXFxcIj5hbiBodG1sXFxuXCIgK1xuICAgICAgICAgICAgICBcIjxlbSBvbm1vdXNlb3Zlcj1cXFwidGhpcy50ZXh0Q29udGVudD0nUFdOM0QhJ1xcXCI+Y2xpY2sgaGVyZTwvZW0+XFxuXCIgK1xuICAgICAgICAgICAgICBcInNuaXBwZXQ8L3A+XCIpO1xuICAgICB9KTtcblxuICAgICBpdCgnc2hvdWxkIGVzY2FwZSBzbmlwcGV0IHdpdGhvdXQgYW55IGZpbHRlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2JpbmQtZGVmYXVsdCBkaXYnKSkuZ2V0SW5uZXJIdG1sKCkpLlxuICAgICAgICAgdG9CZShcIiZsdDtwIHN0eWxlPVxcXCJjb2xvcjpibHVlXFxcIiZndDthbiBodG1sXFxuXCIgK1xuICAgICAgICAgICAgICBcIiZsdDtlbSBvbm1vdXNlb3Zlcj1cXFwidGhpcy50ZXh0Q29udGVudD0nUFdOM0QhJ1xcXCImZ3Q7Y2xpY2sgaGVyZSZsdDsvZW0mZ3Q7XFxuXCIgK1xuICAgICAgICAgICAgICBcInNuaXBwZXQmbHQ7L3AmZ3Q7XCIpO1xuICAgICB9KTtcblxuICAgICBpdCgnc2hvdWxkIHVwZGF0ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgIGVsZW1lbnQoYnkubW9kZWwoJ3NuaXBwZXQnKSkuY2xlYXIoKTtcbiAgICAgICBlbGVtZW50KGJ5Lm1vZGVsKCdzbmlwcGV0JykpLnNlbmRLZXlzKCduZXcgPGIgb25jbGljaz1cImFsZXJ0KDEpXCI+dGV4dDwvYj4nKTtcbiAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNiaW5kLWh0bWwtd2l0aC1zYW5pdGl6ZSBkaXYnKSkuZ2V0SW5uZXJIdG1sKCkpLlxuICAgICAgICAgdG9CZSgnbmV3IDxiPnRleHQ8L2I+Jyk7XG4gICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjYmluZC1odG1sLXdpdGgtdHJ1c3QgZGl2JykpLmdldElubmVySHRtbCgpKS50b0JlKFxuICAgICAgICAgJ25ldyA8YiBvbmNsaWNrPVwiYWxlcnQoMSlcIj50ZXh0PC9iPicpO1xuICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2JpbmQtZGVmYXVsdCBkaXYnKSkuZ2V0SW5uZXJIdG1sKCkpLnRvQmUoXG4gICAgICAgICBcIm5ldyAmbHQ7YiBvbmNsaWNrPVxcXCJhbGVydCgxKVxcXCImZ3Q7dGV4dCZsdDsvYiZndDtcIik7XG4gICAgIH0pO1xuICAgPC9maWxlPlxuICAgPC9leGFtcGxlPlxuICovXG5mdW5jdGlvbiAkU2FuaXRpemVQcm92aWRlcigpIHtcbiAgdGhpcy4kZ2V0ID0gWyckJHNhbml0aXplVXJpJywgZnVuY3Rpb24oJCRzYW5pdGl6ZVVyaSkge1xuICAgIHJldHVybiBmdW5jdGlvbihodG1sKSB7XG4gICAgICB2YXIgYnVmID0gW107XG4gICAgICBodG1sUGFyc2VyKGh0bWwsIGh0bWxTYW5pdGl6ZVdyaXRlcihidWYsIGZ1bmN0aW9uKHVyaSwgaXNJbWFnZSkge1xuICAgICAgICByZXR1cm4gIS9edW5zYWZlLy50ZXN0KCQkc2FuaXRpemVVcmkodXJpLCBpc0ltYWdlKSk7XG4gICAgICB9KSk7XG4gICAgICByZXR1cm4gYnVmLmpvaW4oJycpO1xuICAgIH07XG4gIH1dO1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZVRleHQoY2hhcnMpIHtcbiAgdmFyIGJ1ZiA9IFtdO1xuICB2YXIgd3JpdGVyID0gaHRtbFNhbml0aXplV3JpdGVyKGJ1ZiwgYW5ndWxhci5ub29wKTtcbiAgd3JpdGVyLmNoYXJzKGNoYXJzKTtcbiAgcmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn1cblxuXG4vLyBSZWd1bGFyIEV4cHJlc3Npb25zIGZvciBwYXJzaW5nIHRhZ3MgYW5kIGF0dHJpYnV0ZXNcbnZhciBTVEFSVF9UQUdfUkVHRVhQID1cbiAgICAgICAvXjwoKD86W2EtekEtWl0pW1xcdzotXSopKCg/OlxccytbXFx3Oi1dKyg/Olxccyo9XFxzKig/Oig/OlwiW15cIl0qXCIpfCg/OidbXiddKicpfFtePlxcc10rKSk/KSopXFxzKihcXC8/KVxccyooPj8pLyxcbiAgRU5EX1RBR19SRUdFWFAgPSAvXjxcXC9cXHMqKFtcXHc6LV0rKVtePl0qPi8sXG4gIEFUVFJfUkVHRVhQID0gLyhbXFx3Oi1dKykoPzpcXHMqPVxccyooPzooPzpcIigoPzpbXlwiXSkqKVwiKXwoPzonKCg/OlteJ10pKiknKXwoW14+XFxzXSspKSk/L2csXG4gIEJFR0lOX1RBR19SRUdFWFAgPSAvXjwvLFxuICBCRUdJTkdfRU5EX1RBR0VfUkVHRVhQID0gL148XFwvLyxcbiAgQ09NTUVOVF9SRUdFWFAgPSAvPCEtLSguKj8pLS0+L2csXG4gIERPQ1RZUEVfUkVHRVhQID0gLzwhRE9DVFlQRShbXj5dKj8pPi9pLFxuICBDREFUQV9SRUdFWFAgPSAvPCFcXFtDREFUQVxcWyguKj8pXV0+L2csXG4gIFNVUlJPR0FURV9QQUlSX1JFR0VYUCA9IC9bXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZdL2csXG4gIC8vIE1hdGNoIGV2ZXJ5dGhpbmcgb3V0c2lkZSBvZiBub3JtYWwgY2hhcnMgYW5kIFwiIChxdW90ZSBjaGFyYWN0ZXIpXG4gIE5PTl9BTFBIQU5VTUVSSUNfUkVHRVhQID0gLyhbXlxcIy1+fCB8IV0pL2c7XG5cblxuLy8gR29vZCBzb3VyY2Ugb2YgaW5mbyBhYm91dCBlbGVtZW50cyBhbmQgYXR0cmlidXRlc1xuLy8gaHR0cDovL2Rldi53My5vcmcvaHRtbDUvc3BlYy9PdmVydmlldy5odG1sI3NlbWFudGljc1xuLy8gaHR0cDovL3NpbW9uLmh0bWw1Lm9yZy9odG1sLWVsZW1lbnRzXG5cbi8vIFNhZmUgVm9pZCBFbGVtZW50cyAtIEhUTUw1XG4vLyBodHRwOi8vZGV2LnczLm9yZy9odG1sNS9zcGVjL092ZXJ2aWV3Lmh0bWwjdm9pZC1lbGVtZW50c1xudmFyIHZvaWRFbGVtZW50cyA9IG1ha2VNYXAoXCJhcmVhLGJyLGNvbCxocixpbWcsd2JyXCIpO1xuXG4vLyBFbGVtZW50cyB0aGF0IHlvdSBjYW4sIGludGVudGlvbmFsbHksIGxlYXZlIG9wZW4gKGFuZCB3aGljaCBjbG9zZSB0aGVtc2VsdmVzKVxuLy8gaHR0cDovL2Rldi53My5vcmcvaHRtbDUvc3BlYy9PdmVydmlldy5odG1sI29wdGlvbmFsLXRhZ3NcbnZhciBvcHRpb25hbEVuZFRhZ0Jsb2NrRWxlbWVudHMgPSBtYWtlTWFwKFwiY29sZ3JvdXAsZGQsZHQsbGkscCx0Ym9keSx0ZCx0Zm9vdCx0aCx0aGVhZCx0clwiKSxcbiAgICBvcHRpb25hbEVuZFRhZ0lubGluZUVsZW1lbnRzID0gbWFrZU1hcChcInJwLHJ0XCIpLFxuICAgIG9wdGlvbmFsRW5kVGFnRWxlbWVudHMgPSBhbmd1bGFyLmV4dGVuZCh7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uYWxFbmRUYWdJbmxpbmVFbGVtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uYWxFbmRUYWdCbG9ja0VsZW1lbnRzKTtcblxuLy8gU2FmZSBCbG9jayBFbGVtZW50cyAtIEhUTUw1XG52YXIgYmxvY2tFbGVtZW50cyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCBvcHRpb25hbEVuZFRhZ0Jsb2NrRWxlbWVudHMsIG1ha2VNYXAoXCJhZGRyZXNzLGFydGljbGUsXCIgK1xuICAgICAgICBcImFzaWRlLGJsb2NrcXVvdGUsY2FwdGlvbixjZW50ZXIsZGVsLGRpcixkaXYsZGwsZmlndXJlLGZpZ2NhcHRpb24sZm9vdGVyLGgxLGgyLGgzLGg0LGg1LFwiICtcbiAgICAgICAgXCJoNixoZWFkZXIsaGdyb3VwLGhyLGlucyxtYXAsbWVudSxuYXYsb2wscHJlLHNjcmlwdCxzZWN0aW9uLHRhYmxlLHVsXCIpKTtcblxuLy8gSW5saW5lIEVsZW1lbnRzIC0gSFRNTDVcbnZhciBpbmxpbmVFbGVtZW50cyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCBvcHRpb25hbEVuZFRhZ0lubGluZUVsZW1lbnRzLCBtYWtlTWFwKFwiYSxhYmJyLGFjcm9ueW0sYixcIiArXG4gICAgICAgIFwiYmRpLGJkbyxiaWcsYnIsY2l0ZSxjb2RlLGRlbCxkZm4sZW0sZm9udCxpLGltZyxpbnMsa2JkLGxhYmVsLG1hcCxtYXJrLHEscnVieSxycCxydCxzLFwiICtcbiAgICAgICAgXCJzYW1wLHNtYWxsLHNwYW4sc3RyaWtlLHN0cm9uZyxzdWIsc3VwLHRpbWUsdHQsdSx2YXJcIikpO1xuXG4vLyBTVkcgRWxlbWVudHNcbi8vIGh0dHBzOi8vd2lraS53aGF0d2cub3JnL3dpa2kvU2FuaXRpemF0aW9uX3J1bGVzI3N2Z19FbGVtZW50c1xudmFyIHN2Z0VsZW1lbnRzID0gbWFrZU1hcChcImFuaW1hdGUsYW5pbWF0ZUNvbG9yLGFuaW1hdGVNb3Rpb24sYW5pbWF0ZVRyYW5zZm9ybSxjaXJjbGUsZGVmcyxcIiArXG4gICAgICAgIFwiZGVzYyxlbGxpcHNlLGZvbnQtZmFjZSxmb250LWZhY2UtbmFtZSxmb250LWZhY2Utc3JjLGcsZ2x5cGgsaGtlcm4saW1hZ2UsbGluZWFyR3JhZGllbnQsXCIgK1xuICAgICAgICBcImxpbmUsbWFya2VyLG1ldGFkYXRhLG1pc3NpbmctZ2x5cGgsbXBhdGgscGF0aCxwb2x5Z29uLHBvbHlsaW5lLHJhZGlhbEdyYWRpZW50LHJlY3Qsc2V0LFwiICtcbiAgICAgICAgXCJzdG9wLHN2Zyxzd2l0Y2gsdGV4dCx0aXRsZSx0c3Bhbix1c2VcIik7XG5cbi8vIFNwZWNpYWwgRWxlbWVudHMgKGNhbiBjb250YWluIGFueXRoaW5nKVxudmFyIHNwZWNpYWxFbGVtZW50cyA9IG1ha2VNYXAoXCJzY3JpcHQsc3R5bGVcIik7XG5cbnZhciB2YWxpZEVsZW1lbnRzID0gYW5ndWxhci5leHRlbmQoe30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWRFbGVtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tFbGVtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5saW5lRWxlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbmFsRW5kVGFnRWxlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN2Z0VsZW1lbnRzKTtcblxuLy9BdHRyaWJ1dGVzIHRoYXQgaGF2ZSBocmVmIGFuZCBoZW5jZSBuZWVkIHRvIGJlIHNhbml0aXplZFxudmFyIHVyaUF0dHJzID0gbWFrZU1hcChcImJhY2tncm91bmQsY2l0ZSxocmVmLGxvbmdkZXNjLHNyYyx1c2VtYXAseGxpbms6aHJlZlwiKTtcblxudmFyIGh0bWxBdHRycyA9IG1ha2VNYXAoJ2FiYnIsYWxpZ24sYWx0LGF4aXMsYmdjb2xvcixib3JkZXIsY2VsbHBhZGRpbmcsY2VsbHNwYWNpbmcsY2xhc3MsY2xlYXIsJytcbiAgICAnY29sb3IsY29scyxjb2xzcGFuLGNvbXBhY3QsY29vcmRzLGRpcixmYWNlLGhlYWRlcnMsaGVpZ2h0LGhyZWZsYW5nLGhzcGFjZSwnK1xuICAgICdpc21hcCxsYW5nLGxhbmd1YWdlLG5vaHJlZixub3dyYXAscmVsLHJldixyb3dzLHJvd3NwYW4scnVsZXMsJytcbiAgICAnc2NvcGUsc2Nyb2xsaW5nLHNoYXBlLHNpemUsc3BhbixzdGFydCxzdW1tYXJ5LHRhcmdldCx0aXRsZSx0eXBlLCcrXG4gICAgJ3ZhbGlnbix2YWx1ZSx2c3BhY2Usd2lkdGgnKTtcblxuLy8gU1ZHIGF0dHJpYnV0ZXMgKHdpdGhvdXQgXCJpZFwiIGFuZCBcIm5hbWVcIiBhdHRyaWJ1dGVzKVxuLy8gaHR0cHM6Ly93aWtpLndoYXR3Zy5vcmcvd2lraS9TYW5pdGl6YXRpb25fcnVsZXMjc3ZnX0F0dHJpYnV0ZXNcbnZhciBzdmdBdHRycyA9IG1ha2VNYXAoJ2FjY2VudC1oZWlnaHQsYWNjdW11bGF0ZSxhZGRpdGl2ZSxhbHBoYWJldGljLGFyYWJpYy1mb3JtLGFzY2VudCwnK1xuICAgICdhdHRyaWJ1dGVOYW1lLGF0dHJpYnV0ZVR5cGUsYmFzZVByb2ZpbGUsYmJveCxiZWdpbixieSxjYWxjTW9kZSxjYXAtaGVpZ2h0LGNsYXNzLGNvbG9yLCcrXG4gICAgJ2NvbG9yLXJlbmRlcmluZyxjb250ZW50LGN4LGN5LGQsZHgsZHksZGVzY2VudCxkaXNwbGF5LGR1cixlbmQsZmlsbCxmaWxsLXJ1bGUsZm9udC1mYW1pbHksJytcbiAgICAnZm9udC1zaXplLGZvbnQtc3RyZXRjaCxmb250LXN0eWxlLGZvbnQtdmFyaWFudCxmb250LXdlaWdodCxmcm9tLGZ4LGZ5LGcxLGcyLGdseXBoLW5hbWUsJytcbiAgICAnZ3JhZGllbnRVbml0cyxoYW5naW5nLGhlaWdodCxob3Jpei1hZHYteCxob3Jpei1vcmlnaW4teCxpZGVvZ3JhcGhpYyxrLGtleVBvaW50cywnK1xuICAgICdrZXlTcGxpbmVzLGtleVRpbWVzLGxhbmcsbWFya2VyLWVuZCxtYXJrZXItbWlkLG1hcmtlci1zdGFydCxtYXJrZXJIZWlnaHQsbWFya2VyVW5pdHMsJytcbiAgICAnbWFya2VyV2lkdGgsbWF0aGVtYXRpY2FsLG1heCxtaW4sb2Zmc2V0LG9wYWNpdHksb3JpZW50LG9yaWdpbixvdmVybGluZS1wb3NpdGlvbiwnK1xuICAgICdvdmVybGluZS10aGlja25lc3MscGFub3NlLTEscGF0aCxwYXRoTGVuZ3RoLHBvaW50cyxwcmVzZXJ2ZUFzcGVjdFJhdGlvLHIscmVmWCxyZWZZLCcrXG4gICAgJ3JlcGVhdENvdW50LHJlcGVhdER1cixyZXF1aXJlZEV4dGVuc2lvbnMscmVxdWlyZWRGZWF0dXJlcyxyZXN0YXJ0LHJvdGF0ZSxyeCxyeSxzbG9wZSxzdGVtaCwnK1xuICAgICdzdGVtdixzdG9wLWNvbG9yLHN0b3Atb3BhY2l0eSxzdHJpa2V0aHJvdWdoLXBvc2l0aW9uLHN0cmlrZXRocm91Z2gtdGhpY2tuZXNzLHN0cm9rZSwnK1xuICAgICdzdHJva2UtZGFzaGFycmF5LHN0cm9rZS1kYXNob2Zmc2V0LHN0cm9rZS1saW5lY2FwLHN0cm9rZS1saW5lam9pbixzdHJva2UtbWl0ZXJsaW1pdCwnK1xuICAgICdzdHJva2Utb3BhY2l0eSxzdHJva2Utd2lkdGgsc3lzdGVtTGFuZ3VhZ2UsdGFyZ2V0LHRleHQtYW5jaG9yLHRvLHRyYW5zZm9ybSx0eXBlLHUxLHUyLCcrXG4gICAgJ3VuZGVybGluZS1wb3NpdGlvbix1bmRlcmxpbmUtdGhpY2tuZXNzLHVuaWNvZGUsdW5pY29kZS1yYW5nZSx1bml0cy1wZXItZW0sdmFsdWVzLHZlcnNpb24sJytcbiAgICAndmlld0JveCx2aXNpYmlsaXR5LHdpZHRoLHdpZHRocyx4LHgtaGVpZ2h0LHgxLHgyLHhsaW5rOmFjdHVhdGUseGxpbms6YXJjcm9sZSx4bGluazpyb2xlLCcrXG4gICAgJ3hsaW5rOnNob3cseGxpbms6dGl0bGUseGxpbms6dHlwZSx4bWw6YmFzZSx4bWw6bGFuZyx4bWw6c3BhY2UseG1sbnMseG1sbnM6eGxpbmsseSx5MSx5MiwnK1xuICAgICd6b29tQW5kUGFuJyk7XG5cbnZhciB2YWxpZEF0dHJzID0gYW5ndWxhci5leHRlbmQoe30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVyaUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdmdBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbEF0dHJzKTtcblxuZnVuY3Rpb24gbWFrZU1hcChzdHIpIHtcbiAgdmFyIG9iaiA9IHt9LCBpdGVtcyA9IHN0ci5zcGxpdCgnLCcpLCBpO1xuICBmb3IgKGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIG9ialtpdGVtc1tpXV0gPSB0cnVlO1xuICByZXR1cm4gb2JqO1xufVxuXG5cbi8qKlxuICogQGV4YW1wbGVcbiAqIGh0bWxQYXJzZXIoaHRtbFN0cmluZywge1xuICogICAgIHN0YXJ0OiBmdW5jdGlvbih0YWcsIGF0dHJzLCB1bmFyeSkge30sXG4gKiAgICAgZW5kOiBmdW5jdGlvbih0YWcpIHt9LFxuICogICAgIGNoYXJzOiBmdW5jdGlvbih0ZXh0KSB7fSxcbiAqICAgICBjb21tZW50OiBmdW5jdGlvbih0ZXh0KSB7fVxuICogfSk7XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgc3RyaW5nXG4gKiBAcGFyYW0ge29iamVjdH0gaGFuZGxlclxuICovXG5mdW5jdGlvbiBodG1sUGFyc2VyKGh0bWwsIGhhbmRsZXIpIHtcbiAgaWYgKHR5cGVvZiBodG1sICE9PSAnc3RyaW5nJykge1xuICAgIGlmIChodG1sID09PSBudWxsIHx8IHR5cGVvZiBodG1sID09PSAndW5kZWZpbmVkJykge1xuICAgICAgaHRtbCA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICBodG1sID0gJycgKyBodG1sO1xuICAgIH1cbiAgfVxuICB2YXIgaW5kZXgsIGNoYXJzLCBtYXRjaCwgc3RhY2sgPSBbXSwgbGFzdCA9IGh0bWwsIHRleHQ7XG4gIHN0YWNrLmxhc3QgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHN0YWNrWyBzdGFjay5sZW5ndGggLSAxIF07IH07XG5cbiAgd2hpbGUgKGh0bWwpIHtcbiAgICB0ZXh0ID0gJyc7XG4gICAgY2hhcnMgPSB0cnVlO1xuXG4gICAgLy8gTWFrZSBzdXJlIHdlJ3JlIG5vdCBpbiBhIHNjcmlwdCBvciBzdHlsZSBlbGVtZW50XG4gICAgaWYgKCFzdGFjay5sYXN0KCkgfHwgIXNwZWNpYWxFbGVtZW50c1sgc3RhY2subGFzdCgpIF0pIHtcblxuICAgICAgLy8gQ29tbWVudFxuICAgICAgaWYgKGh0bWwuaW5kZXhPZihcIjwhLS1cIikgPT09IDApIHtcbiAgICAgICAgLy8gY29tbWVudHMgY29udGFpbmluZyAtLSBhcmUgbm90IGFsbG93ZWQgdW5sZXNzIHRoZXkgdGVybWluYXRlIHRoZSBjb21tZW50XG4gICAgICAgIGluZGV4ID0gaHRtbC5pbmRleE9mKFwiLS1cIiwgNCk7XG5cbiAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaHRtbC5sYXN0SW5kZXhPZihcIi0tPlwiLCBpbmRleCkgPT09IGluZGV4KSB7XG4gICAgICAgICAgaWYgKGhhbmRsZXIuY29tbWVudCkgaGFuZGxlci5jb21tZW50KGh0bWwuc3Vic3RyaW5nKDQsIGluZGV4KSk7XG4gICAgICAgICAgaHRtbCA9IGh0bWwuc3Vic3RyaW5nKGluZGV4ICsgMyk7XG4gICAgICAgICAgY2hhcnMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgLy8gRE9DVFlQRVxuICAgICAgfSBlbHNlIGlmIChET0NUWVBFX1JFR0VYUC50ZXN0KGh0bWwpKSB7XG4gICAgICAgIG1hdGNoID0gaHRtbC5tYXRjaChET0NUWVBFX1JFR0VYUCk7XG5cbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShtYXRjaFswXSwgJycpO1xuICAgICAgICAgIGNoYXJzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIC8vIGVuZCB0YWdcbiAgICAgIH0gZWxzZSBpZiAoQkVHSU5HX0VORF9UQUdFX1JFR0VYUC50ZXN0KGh0bWwpKSB7XG4gICAgICAgIG1hdGNoID0gaHRtbC5tYXRjaChFTkRfVEFHX1JFR0VYUCk7XG5cbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgaHRtbCA9IGh0bWwuc3Vic3RyaW5nKG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgICAgICAgbWF0Y2hbMF0ucmVwbGFjZShFTkRfVEFHX1JFR0VYUCwgcGFyc2VFbmRUYWcpO1xuICAgICAgICAgIGNoYXJzID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgLy8gc3RhcnQgdGFnXG4gICAgICB9IGVsc2UgaWYgKEJFR0lOX1RBR19SRUdFWFAudGVzdChodG1sKSkge1xuICAgICAgICBtYXRjaCA9IGh0bWwubWF0Y2goU1RBUlRfVEFHX1JFR0VYUCk7XG5cbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgLy8gV2Ugb25seSBoYXZlIGEgdmFsaWQgc3RhcnQtdGFnIGlmIHRoZXJlIGlzIGEgJz4nLlxuICAgICAgICAgIGlmIChtYXRjaFs0XSkge1xuICAgICAgICAgICAgaHRtbCA9IGh0bWwuc3Vic3RyaW5nKG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgICAgICAgICBtYXRjaFswXS5yZXBsYWNlKFNUQVJUX1RBR19SRUdFWFAsIHBhcnNlU3RhcnRUYWcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjaGFycyA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG5vIGVuZGluZyB0YWcgZm91bmQgLS0tIHRoaXMgcGllY2Ugc2hvdWxkIGJlIGVuY29kZWQgYXMgYW4gZW50aXR5LlxuICAgICAgICAgIHRleHQgKz0gJzwnO1xuICAgICAgICAgIGh0bWwgPSBodG1sLnN1YnN0cmluZygxKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY2hhcnMpIHtcbiAgICAgICAgaW5kZXggPSBodG1sLmluZGV4T2YoXCI8XCIpO1xuXG4gICAgICAgIHRleHQgKz0gaW5kZXggPCAwID8gaHRtbCA6IGh0bWwuc3Vic3RyaW5nKDAsIGluZGV4KTtcbiAgICAgICAgaHRtbCA9IGluZGV4IDwgMCA/IFwiXCIgOiBodG1sLnN1YnN0cmluZyhpbmRleCk7XG5cbiAgICAgICAgaWYgKGhhbmRsZXIuY2hhcnMpIGhhbmRsZXIuY2hhcnMoZGVjb2RlRW50aXRpZXModGV4dCkpO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UobmV3IFJlZ0V4cChcIiguKik8XFxcXHMqXFxcXC9cXFxccypcIiArIHN0YWNrLmxhc3QoKSArIFwiW14+XSo+XCIsICdpJyksXG4gICAgICAgIGZ1bmN0aW9uKGFsbCwgdGV4dCkge1xuICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoQ09NTUVOVF9SRUdFWFAsIFwiJDFcIikucmVwbGFjZShDREFUQV9SRUdFWFAsIFwiJDFcIik7XG5cbiAgICAgICAgICBpZiAoaGFuZGxlci5jaGFycykgaGFuZGxlci5jaGFycyhkZWNvZGVFbnRpdGllcyh0ZXh0KSk7XG5cbiAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgIH0pO1xuXG4gICAgICBwYXJzZUVuZFRhZyhcIlwiLCBzdGFjay5sYXN0KCkpO1xuICAgIH1cblxuICAgIGlmIChodG1sID09IGxhc3QpIHtcbiAgICAgIHRocm93ICRzYW5pdGl6ZU1pbkVycignYmFkcGFyc2UnLCBcIlRoZSBzYW5pdGl6ZXIgd2FzIHVuYWJsZSB0byBwYXJzZSB0aGUgZm9sbG93aW5nIGJsb2NrIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm9mIGh0bWw6IHswfVwiLCBodG1sKTtcbiAgICB9XG4gICAgbGFzdCA9IGh0bWw7XG4gIH1cblxuICAvLyBDbGVhbiB1cCBhbnkgcmVtYWluaW5nIHRhZ3NcbiAgcGFyc2VFbmRUYWcoKTtcblxuICBmdW5jdGlvbiBwYXJzZVN0YXJ0VGFnKHRhZywgdGFnTmFtZSwgcmVzdCwgdW5hcnkpIHtcbiAgICB0YWdOYW1lID0gYW5ndWxhci5sb3dlcmNhc2UodGFnTmFtZSk7XG4gICAgaWYgKGJsb2NrRWxlbWVudHNbIHRhZ05hbWUgXSkge1xuICAgICAgd2hpbGUgKHN0YWNrLmxhc3QoKSAmJiBpbmxpbmVFbGVtZW50c1sgc3RhY2subGFzdCgpIF0pIHtcbiAgICAgICAgcGFyc2VFbmRUYWcoXCJcIiwgc3RhY2subGFzdCgpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob3B0aW9uYWxFbmRUYWdFbGVtZW50c1sgdGFnTmFtZSBdICYmIHN0YWNrLmxhc3QoKSA9PSB0YWdOYW1lKSB7XG4gICAgICBwYXJzZUVuZFRhZyhcIlwiLCB0YWdOYW1lKTtcbiAgICB9XG5cbiAgICB1bmFyeSA9IHZvaWRFbGVtZW50c1sgdGFnTmFtZSBdIHx8ICEhdW5hcnk7XG5cbiAgICBpZiAoIXVuYXJ5KVxuICAgICAgc3RhY2sucHVzaCh0YWdOYW1lKTtcblxuICAgIHZhciBhdHRycyA9IHt9O1xuXG4gICAgcmVzdC5yZXBsYWNlKEFUVFJfUkVHRVhQLFxuICAgICAgZnVuY3Rpb24obWF0Y2gsIG5hbWUsIGRvdWJsZVF1b3RlZFZhbHVlLCBzaW5nbGVRdW90ZWRWYWx1ZSwgdW5xdW90ZWRWYWx1ZSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBkb3VibGVRdW90ZWRWYWx1ZVxuICAgICAgICAgIHx8IHNpbmdsZVF1b3RlZFZhbHVlXG4gICAgICAgICAgfHwgdW5xdW90ZWRWYWx1ZVxuICAgICAgICAgIHx8ICcnO1xuXG4gICAgICAgIGF0dHJzW25hbWVdID0gZGVjb2RlRW50aXRpZXModmFsdWUpO1xuICAgIH0pO1xuICAgIGlmIChoYW5kbGVyLnN0YXJ0KSBoYW5kbGVyLnN0YXJ0KHRhZ05hbWUsIGF0dHJzLCB1bmFyeSk7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUVuZFRhZyh0YWcsIHRhZ05hbWUpIHtcbiAgICB2YXIgcG9zID0gMCwgaTtcbiAgICB0YWdOYW1lID0gYW5ndWxhci5sb3dlcmNhc2UodGFnTmFtZSk7XG4gICAgaWYgKHRhZ05hbWUpXG4gICAgICAvLyBGaW5kIHRoZSBjbG9zZXN0IG9wZW5lZCB0YWcgb2YgdGhlIHNhbWUgdHlwZVxuICAgICAgZm9yIChwb3MgPSBzdGFjay5sZW5ndGggLSAxOyBwb3MgPj0gMDsgcG9zLS0pXG4gICAgICAgIGlmIChzdGFja1sgcG9zIF0gPT0gdGFnTmFtZSlcbiAgICAgICAgICBicmVhaztcblxuICAgIGlmIChwb3MgPj0gMCkge1xuICAgICAgLy8gQ2xvc2UgYWxsIHRoZSBvcGVuIGVsZW1lbnRzLCB1cCB0aGUgc3RhY2tcbiAgICAgIGZvciAoaSA9IHN0YWNrLmxlbmd0aCAtIDE7IGkgPj0gcG9zOyBpLS0pXG4gICAgICAgIGlmIChoYW5kbGVyLmVuZCkgaGFuZGxlci5lbmQoc3RhY2tbIGkgXSk7XG5cbiAgICAgIC8vIFJlbW92ZSB0aGUgb3BlbiBlbGVtZW50cyBmcm9tIHRoZSBzdGFja1xuICAgICAgc3RhY2subGVuZ3RoID0gcG9zO1xuICAgIH1cbiAgfVxufVxuXG52YXIgaGlkZGVuUHJlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwcmVcIik7XG52YXIgc3BhY2VSZSA9IC9eKFxccyopKFtcXHNcXFNdKj8pKFxccyopJC87XG4vKipcbiAqIGRlY29kZXMgYWxsIGVudGl0aWVzIGludG8gcmVndWxhciBzdHJpbmdcbiAqIEBwYXJhbSB2YWx1ZVxuICogQHJldHVybnMge3N0cmluZ30gQSBzdHJpbmcgd2l0aCBkZWNvZGVkIGVudGl0aWVzLlxuICovXG5mdW5jdGlvbiBkZWNvZGVFbnRpdGllcyh2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSB7IHJldHVybiAnJzsgfVxuXG4gIC8vIE5vdGU6IElFOCBkb2VzIG5vdCBwcmVzZXJ2ZSBzcGFjZXMgYXQgdGhlIHN0YXJ0L2VuZCBvZiBpbm5lckhUTUxcbiAgLy8gc28gd2UgbXVzdCBjYXB0dXJlIHRoZW0gYW5kIHJlYXR0YWNoIHRoZW0gYWZ0ZXJ3YXJkXG4gIHZhciBwYXJ0cyA9IHNwYWNlUmUuZXhlYyh2YWx1ZSk7XG4gIHZhciBzcGFjZUJlZm9yZSA9IHBhcnRzWzFdO1xuICB2YXIgc3BhY2VBZnRlciA9IHBhcnRzWzNdO1xuICB2YXIgY29udGVudCA9IHBhcnRzWzJdO1xuICBpZiAoY29udGVudCkge1xuICAgIGhpZGRlblByZS5pbm5lckhUTUw9Y29udGVudC5yZXBsYWNlKC88L2csXCImbHQ7XCIpO1xuICAgIC8vIGlubmVyVGV4dCBkZXBlbmRzIG9uIHN0eWxpbmcgYXMgaXQgZG9lc24ndCBkaXNwbGF5IGhpZGRlbiBlbGVtZW50cy5cbiAgICAvLyBUaGVyZWZvcmUsIGl0J3MgYmV0dGVyIHRvIHVzZSB0ZXh0Q29udGVudCBub3QgdG8gY2F1c2UgdW5uZWNlc3NhcnlcbiAgICAvLyByZWZsb3dzLiBIb3dldmVyLCBJRTw5IGRvbid0IHN1cHBvcnQgdGV4dENvbnRlbnQgc28gdGhlIGlubmVyVGV4dFxuICAgIC8vIGZhbGxiYWNrIGlzIG5lY2Vzc2FyeS5cbiAgICBjb250ZW50ID0gJ3RleHRDb250ZW50JyBpbiBoaWRkZW5QcmUgP1xuICAgICAgaGlkZGVuUHJlLnRleHRDb250ZW50IDogaGlkZGVuUHJlLmlubmVyVGV4dDtcbiAgfVxuICByZXR1cm4gc3BhY2VCZWZvcmUgKyBjb250ZW50ICsgc3BhY2VBZnRlcjtcbn1cblxuLyoqXG4gKiBFc2NhcGVzIGFsbCBwb3RlbnRpYWxseSBkYW5nZXJvdXMgY2hhcmFjdGVycywgc28gdGhhdCB0aGVcbiAqIHJlc3VsdGluZyBzdHJpbmcgY2FuIGJlIHNhZmVseSBpbnNlcnRlZCBpbnRvIGF0dHJpYnV0ZSBvclxuICogZWxlbWVudCB0ZXh0LlxuICogQHBhcmFtIHZhbHVlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBlc2NhcGVkIHRleHRcbiAqL1xuZnVuY3Rpb24gZW5jb2RlRW50aXRpZXModmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlLlxuICAgIHJlcGxhY2UoLyYvZywgJyZhbXA7JykuXG4gICAgcmVwbGFjZShTVVJST0dBVEVfUEFJUl9SRUdFWFAsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB2YXIgaGkgPSB2YWx1ZS5jaGFyQ29kZUF0KDApO1xuICAgICAgdmFyIGxvdyA9IHZhbHVlLmNoYXJDb2RlQXQoMSk7XG4gICAgICByZXR1cm4gJyYjJyArICgoKGhpIC0gMHhEODAwKSAqIDB4NDAwKSArIChsb3cgLSAweERDMDApICsgMHgxMDAwMCkgKyAnOyc7XG4gICAgfSkuXG4gICAgcmVwbGFjZShOT05fQUxQSEFOVU1FUklDX1JFR0VYUCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiAnJiMnICsgdmFsdWUuY2hhckNvZGVBdCgwKSArICc7JztcbiAgICB9KS5cbiAgICByZXBsYWNlKC88L2csICcmbHQ7JykuXG4gICAgcmVwbGFjZSgvPi9nLCAnJmd0OycpO1xufVxuXG4vKipcbiAqIGNyZWF0ZSBhbiBIVE1ML1hNTCB3cml0ZXIgd2hpY2ggd3JpdGVzIHRvIGJ1ZmZlclxuICogQHBhcmFtIHtBcnJheX0gYnVmIHVzZSBidWYuamFpbignJykgdG8gZ2V0IG91dCBzYW5pdGl6ZWQgaHRtbCBzdHJpbmdcbiAqIEByZXR1cm5zIHtvYmplY3R9IGluIHRoZSBmb3JtIG9mIHtcbiAqICAgICBzdGFydDogZnVuY3Rpb24odGFnLCBhdHRycywgdW5hcnkpIHt9LFxuICogICAgIGVuZDogZnVuY3Rpb24odGFnKSB7fSxcbiAqICAgICBjaGFyczogZnVuY3Rpb24odGV4dCkge30sXG4gKiAgICAgY29tbWVudDogZnVuY3Rpb24odGV4dCkge31cbiAqIH1cbiAqL1xuZnVuY3Rpb24gaHRtbFNhbml0aXplV3JpdGVyKGJ1ZiwgdXJpVmFsaWRhdG9yKSB7XG4gIHZhciBpZ25vcmUgPSBmYWxzZTtcbiAgdmFyIG91dCA9IGFuZ3VsYXIuYmluZChidWYsIGJ1Zi5wdXNoKTtcbiAgcmV0dXJuIHtcbiAgICBzdGFydDogZnVuY3Rpb24odGFnLCBhdHRycywgdW5hcnkpIHtcbiAgICAgIHRhZyA9IGFuZ3VsYXIubG93ZXJjYXNlKHRhZyk7XG4gICAgICBpZiAoIWlnbm9yZSAmJiBzcGVjaWFsRWxlbWVudHNbdGFnXSkge1xuICAgICAgICBpZ25vcmUgPSB0YWc7XG4gICAgICB9XG4gICAgICBpZiAoIWlnbm9yZSAmJiB2YWxpZEVsZW1lbnRzW3RhZ10gPT09IHRydWUpIHtcbiAgICAgICAgb3V0KCc8Jyk7XG4gICAgICAgIG91dCh0YWcpO1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goYXR0cnMsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICB2YXIgbGtleT1hbmd1bGFyLmxvd2VyY2FzZShrZXkpO1xuICAgICAgICAgIHZhciBpc0ltYWdlID0gKHRhZyA9PT0gJ2ltZycgJiYgbGtleSA9PT0gJ3NyYycpIHx8IChsa2V5ID09PSAnYmFja2dyb3VuZCcpO1xuICAgICAgICAgIGlmICh2YWxpZEF0dHJzW2xrZXldID09PSB0cnVlICYmXG4gICAgICAgICAgICAodXJpQXR0cnNbbGtleV0gIT09IHRydWUgfHwgdXJpVmFsaWRhdG9yKHZhbHVlLCBpc0ltYWdlKSkpIHtcbiAgICAgICAgICAgIG91dCgnICcpO1xuICAgICAgICAgICAgb3V0KGtleSk7XG4gICAgICAgICAgICBvdXQoJz1cIicpO1xuICAgICAgICAgICAgb3V0KGVuY29kZUVudGl0aWVzKHZhbHVlKSk7XG4gICAgICAgICAgICBvdXQoJ1wiJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb3V0KHVuYXJ5ID8gJy8+JyA6ICc+Jyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlbmQ6IGZ1bmN0aW9uKHRhZykge1xuICAgICAgICB0YWcgPSBhbmd1bGFyLmxvd2VyY2FzZSh0YWcpO1xuICAgICAgICBpZiAoIWlnbm9yZSAmJiB2YWxpZEVsZW1lbnRzW3RhZ10gPT09IHRydWUpIHtcbiAgICAgICAgICBvdXQoJzwvJyk7XG4gICAgICAgICAgb3V0KHRhZyk7XG4gICAgICAgICAgb3V0KCc+Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZyA9PSBpZ25vcmUpIHtcbiAgICAgICAgICBpZ25vcmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICBjaGFyczogZnVuY3Rpb24oY2hhcnMpIHtcbiAgICAgICAgaWYgKCFpZ25vcmUpIHtcbiAgICAgICAgICBvdXQoZW5jb2RlRW50aXRpZXMoY2hhcnMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICB9O1xufVxuXG5cbi8vIGRlZmluZSBuZ1Nhbml0aXplIG1vZHVsZSBhbmQgcmVnaXN0ZXIgJHNhbml0aXplIHNlcnZpY2VcbmFuZ3VsYXIubW9kdWxlKCduZ1Nhbml0aXplJywgW10pLnByb3ZpZGVyKCckc2FuaXRpemUnLCAkU2FuaXRpemVQcm92aWRlcik7XG5cbi8qIGdsb2JhbCBzYW5pdGl6ZVRleHQ6IGZhbHNlICovXG5cbi8qKlxuICogQG5nZG9jIGZpbHRlclxuICogQG5hbWUgbGlua3lcbiAqIEBraW5kIGZ1bmN0aW9uXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBGaW5kcyBsaW5rcyBpbiB0ZXh0IGlucHV0IGFuZCB0dXJucyB0aGVtIGludG8gaHRtbCBsaW5rcy4gU3VwcG9ydHMgaHR0cC9odHRwcy9mdHAvbWFpbHRvIGFuZFxuICogcGxhaW4gZW1haWwgYWRkcmVzcyBsaW5rcy5cbiAqXG4gKiBSZXF1aXJlcyB0aGUge0BsaW5rIG5nU2FuaXRpemUgYG5nU2FuaXRpemVgfSBtb2R1bGUgdG8gYmUgaW5zdGFsbGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IElucHV0IHRleHQuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0IFdpbmRvdyAoX2JsYW5rfF9zZWxmfF9wYXJlbnR8X3RvcCkgb3IgbmFtZWQgZnJhbWUgdG8gb3BlbiBsaW5rcyBpbi5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IEh0bWwtbGlua2lmaWVkIHRleHQuXG4gKlxuICogQHVzYWdlXG4gICA8c3BhbiBuZy1iaW5kLWh0bWw9XCJsaW5reV9leHByZXNzaW9uIHwgbGlua3lcIj48L3NwYW4+XG4gKlxuICogQGV4YW1wbGVcbiAgIDxleGFtcGxlIG1vZHVsZT1cImxpbmt5RXhhbXBsZVwiIGRlcHM9XCJhbmd1bGFyLXNhbml0aXplLmpzXCI+XG4gICAgIDxmaWxlIG5hbWU9XCJpbmRleC5odG1sXCI+XG4gICAgICAgPHNjcmlwdD5cbiAgICAgICAgIGFuZ3VsYXIubW9kdWxlKCdsaW5reUV4YW1wbGUnLCBbJ25nU2FuaXRpemUnXSlcbiAgICAgICAgICAgLmNvbnRyb2xsZXIoJ0V4YW1wbGVDb250cm9sbGVyJywgWyckc2NvcGUnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICAgICAgICAgICAkc2NvcGUuc25pcHBldCA9XG4gICAgICAgICAgICAgICAnUHJldHR5IHRleHQgd2l0aCBzb21lIGxpbmtzOlxcbicrXG4gICAgICAgICAgICAgICAnaHR0cDovL2FuZ3VsYXJqcy5vcmcvLFxcbicrXG4gICAgICAgICAgICAgICAnbWFpbHRvOnVzQHNvbWV3aGVyZS5vcmcsXFxuJytcbiAgICAgICAgICAgICAgICdhbm90aGVyQHNvbWV3aGVyZS5vcmcsXFxuJytcbiAgICAgICAgICAgICAgICdhbmQgb25lIG1vcmU6IGZ0cDovLzEyNy4wLjAuMS8uJztcbiAgICAgICAgICAgICAkc2NvcGUuc25pcHBldFdpdGhUYXJnZXQgPSAnaHR0cDovL2FuZ3VsYXJqcy5vcmcvJztcbiAgICAgICAgICAgfV0pO1xuICAgICAgIDwvc2NyaXB0PlxuICAgICAgIDxkaXYgbmctY29udHJvbGxlcj1cIkV4YW1wbGVDb250cm9sbGVyXCI+XG4gICAgICAgU25pcHBldDogPHRleHRhcmVhIG5nLW1vZGVsPVwic25pcHBldFwiIGNvbHM9XCI2MFwiIHJvd3M9XCIzXCI+PC90ZXh0YXJlYT5cbiAgICAgICA8dGFibGU+XG4gICAgICAgICA8dHI+XG4gICAgICAgICAgIDx0ZD5GaWx0ZXI8L3RkPlxuICAgICAgICAgICA8dGQ+U291cmNlPC90ZD5cbiAgICAgICAgICAgPHRkPlJlbmRlcmVkPC90ZD5cbiAgICAgICAgIDwvdHI+XG4gICAgICAgICA8dHIgaWQ9XCJsaW5reS1maWx0ZXJcIj5cbiAgICAgICAgICAgPHRkPmxpbmt5IGZpbHRlcjwvdGQ+XG4gICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICA8cHJlPiZsdDtkaXYgbmctYmluZC1odG1sPVwic25pcHBldCB8IGxpbmt5XCImZ3Q7PGJyPiZsdDsvZGl2Jmd0OzwvcHJlPlxuICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgPGRpdiBuZy1iaW5kLWh0bWw9XCJzbmlwcGV0IHwgbGlua3lcIj48L2Rpdj5cbiAgICAgICAgICAgPC90ZD5cbiAgICAgICAgIDwvdHI+XG4gICAgICAgICA8dHIgaWQ9XCJsaW5reS10YXJnZXRcIj5cbiAgICAgICAgICA8dGQ+bGlua3kgdGFyZ2V0PC90ZD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8cHJlPiZsdDtkaXYgbmctYmluZC1odG1sPVwic25pcHBldFdpdGhUYXJnZXQgfCBsaW5reTonX2JsYW5rJ1wiJmd0Ozxicj4mbHQ7L2RpdiZndDs8L3ByZT5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgIDxkaXYgbmctYmluZC1odG1sPVwic25pcHBldFdpdGhUYXJnZXQgfCBsaW5reTonX2JsYW5rJ1wiPjwvZGl2PlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICA8L3RyPlxuICAgICAgICAgPHRyIGlkPVwiZXNjYXBlZC1odG1sXCI+XG4gICAgICAgICAgIDx0ZD5ubyBmaWx0ZXI8L3RkPlxuICAgICAgICAgICA8dGQ+PHByZT4mbHQ7ZGl2IG5nLWJpbmQ9XCJzbmlwcGV0XCImZ3Q7PGJyPiZsdDsvZGl2Jmd0OzwvcHJlPjwvdGQ+XG4gICAgICAgICAgIDx0ZD48ZGl2IG5nLWJpbmQ9XCJzbmlwcGV0XCI+PC9kaXY+PC90ZD5cbiAgICAgICAgIDwvdHI+XG4gICAgICAgPC90YWJsZT5cbiAgICAgPC9maWxlPlxuICAgICA8ZmlsZSBuYW1lPVwicHJvdHJhY3Rvci5qc1wiIHR5cGU9XCJwcm90cmFjdG9yXCI+XG4gICAgICAgaXQoJ3Nob3VsZCBsaW5raWZ5IHRoZSBzbmlwcGV0IHdpdGggdXJscycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuaWQoJ2xpbmt5LWZpbHRlcicpKS5lbGVtZW50KGJ5LmJpbmRpbmcoJ3NuaXBwZXQgfCBsaW5reScpKS5nZXRUZXh0KCkpLlxuICAgICAgICAgICAgIHRvQmUoJ1ByZXR0eSB0ZXh0IHdpdGggc29tZSBsaW5rczogaHR0cDovL2FuZ3VsYXJqcy5vcmcvLCB1c0Bzb21ld2hlcmUub3JnLCAnICtcbiAgICAgICAgICAgICAgICAgICdhbm90aGVyQHNvbWV3aGVyZS5vcmcsIGFuZCBvbmUgbW9yZTogZnRwOi8vMTI3LjAuMC4xLy4nKTtcbiAgICAgICAgIGV4cGVjdChlbGVtZW50LmFsbChieS5jc3MoJyNsaW5reS1maWx0ZXIgYScpKS5jb3VudCgpKS50b0VxdWFsKDQpO1xuICAgICAgIH0pO1xuXG4gICAgICAgaXQoJ3Nob3VsZCBub3QgbGlua2lmeSBzbmlwcGV0IHdpdGhvdXQgdGhlIGxpbmt5IGZpbHRlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuaWQoJ2VzY2FwZWQtaHRtbCcpKS5lbGVtZW50KGJ5LmJpbmRpbmcoJ3NuaXBwZXQnKSkuZ2V0VGV4dCgpKS5cbiAgICAgICAgICAgICB0b0JlKCdQcmV0dHkgdGV4dCB3aXRoIHNvbWUgbGlua3M6IGh0dHA6Ly9hbmd1bGFyanMub3JnLywgbWFpbHRvOnVzQHNvbWV3aGVyZS5vcmcsICcgK1xuICAgICAgICAgICAgICAgICAgJ2Fub3RoZXJAc29tZXdoZXJlLm9yZywgYW5kIG9uZSBtb3JlOiBmdHA6Ly8xMjcuMC4wLjEvLicpO1xuICAgICAgICAgZXhwZWN0KGVsZW1lbnQuYWxsKGJ5LmNzcygnI2VzY2FwZWQtaHRtbCBhJykpLmNvdW50KCkpLnRvRXF1YWwoMCk7XG4gICAgICAgfSk7XG5cbiAgICAgICBpdCgnc2hvdWxkIHVwZGF0ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgZWxlbWVudChieS5tb2RlbCgnc25pcHBldCcpKS5jbGVhcigpO1xuICAgICAgICAgZWxlbWVudChieS5tb2RlbCgnc25pcHBldCcpKS5zZW5kS2V5cygnbmV3IGh0dHA6Ly9saW5rLicpO1xuICAgICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuaWQoJ2xpbmt5LWZpbHRlcicpKS5lbGVtZW50KGJ5LmJpbmRpbmcoJ3NuaXBwZXQgfCBsaW5reScpKS5nZXRUZXh0KCkpLlxuICAgICAgICAgICAgIHRvQmUoJ25ldyBodHRwOi8vbGluay4nKTtcbiAgICAgICAgIGV4cGVjdChlbGVtZW50LmFsbChieS5jc3MoJyNsaW5reS1maWx0ZXIgYScpKS5jb3VudCgpKS50b0VxdWFsKDEpO1xuICAgICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuaWQoJ2VzY2FwZWQtaHRtbCcpKS5lbGVtZW50KGJ5LmJpbmRpbmcoJ3NuaXBwZXQnKSkuZ2V0VGV4dCgpKVxuICAgICAgICAgICAgIC50b0JlKCduZXcgaHR0cDovL2xpbmsuJyk7XG4gICAgICAgfSk7XG5cbiAgICAgICBpdCgnc2hvdWxkIHdvcmsgd2l0aCB0aGUgdGFyZ2V0IHByb3BlcnR5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmlkKCdsaW5reS10YXJnZXQnKSkuXG4gICAgICAgICAgICBlbGVtZW50KGJ5LmJpbmRpbmcoXCJzbmlwcGV0V2l0aFRhcmdldCB8IGxpbmt5OidfYmxhbmsnXCIpKS5nZXRUZXh0KCkpLlxuICAgICAgICAgICAgdG9CZSgnaHR0cDovL2FuZ3VsYXJqcy5vcmcvJyk7XG4gICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2xpbmt5LXRhcmdldCBhJykpLmdldEF0dHJpYnV0ZSgndGFyZ2V0JykpLnRvRXF1YWwoJ19ibGFuaycpO1xuICAgICAgIH0pO1xuICAgICA8L2ZpbGU+XG4gICA8L2V4YW1wbGU+XG4gKi9cbmFuZ3VsYXIubW9kdWxlKCduZ1Nhbml0aXplJykuZmlsdGVyKCdsaW5reScsIFsnJHNhbml0aXplJywgZnVuY3Rpb24oJHNhbml0aXplKSB7XG4gIHZhciBMSU5LWV9VUkxfUkVHRVhQID1cbiAgICAgICAgLygoZnRwfGh0dHBzPyk6XFwvXFwvfChtYWlsdG86KT9bQS1aYS16MC05Ll8lKy1dK0ApXFxTKlteXFxzLjssKCl7fTw+XCJdLyxcbiAgICAgIE1BSUxUT19SRUdFWFAgPSAvXm1haWx0bzovO1xuXG4gIHJldHVybiBmdW5jdGlvbih0ZXh0LCB0YXJnZXQpIHtcbiAgICBpZiAoIXRleHQpIHJldHVybiB0ZXh0O1xuICAgIHZhciBtYXRjaDtcbiAgICB2YXIgcmF3ID0gdGV4dDtcbiAgICB2YXIgaHRtbCA9IFtdO1xuICAgIHZhciB1cmw7XG4gICAgdmFyIGk7XG4gICAgd2hpbGUgKChtYXRjaCA9IHJhdy5tYXRjaChMSU5LWV9VUkxfUkVHRVhQKSkpIHtcbiAgICAgIC8vIFdlIGNhbiBub3QgZW5kIGluIHRoZXNlIGFzIHRoZXkgYXJlIHNvbWV0aW1lcyBmb3VuZCBhdCB0aGUgZW5kIG9mIHRoZSBzZW50ZW5jZVxuICAgICAgdXJsID0gbWF0Y2hbMF07XG4gICAgICAvLyBpZiB3ZSBkaWQgbm90IG1hdGNoIGZ0cC9odHRwL21haWx0byB0aGVuIGFzc3VtZSBtYWlsdG9cbiAgICAgIGlmIChtYXRjaFsyXSA9PSBtYXRjaFszXSkgdXJsID0gJ21haWx0bzonICsgdXJsO1xuICAgICAgaSA9IG1hdGNoLmluZGV4O1xuICAgICAgYWRkVGV4dChyYXcuc3Vic3RyKDAsIGkpKTtcbiAgICAgIGFkZExpbmsodXJsLCBtYXRjaFswXS5yZXBsYWNlKE1BSUxUT19SRUdFWFAsICcnKSk7XG4gICAgICByYXcgPSByYXcuc3Vic3RyaW5nKGkgKyBtYXRjaFswXS5sZW5ndGgpO1xuICAgIH1cbiAgICBhZGRUZXh0KHJhdyk7XG4gICAgcmV0dXJuICRzYW5pdGl6ZShodG1sLmpvaW4oJycpKTtcblxuICAgIGZ1bmN0aW9uIGFkZFRleHQodGV4dCkge1xuICAgICAgaWYgKCF0ZXh0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGh0bWwucHVzaChzYW5pdGl6ZVRleHQodGV4dCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZExpbmsodXJsLCB0ZXh0KSB7XG4gICAgICBodG1sLnB1c2goJzxhICcpO1xuICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHRhcmdldCkpIHtcbiAgICAgICAgaHRtbC5wdXNoKCd0YXJnZXQ9XCInKTtcbiAgICAgICAgaHRtbC5wdXNoKHRhcmdldCk7XG4gICAgICAgIGh0bWwucHVzaCgnXCIgJyk7XG4gICAgICB9XG4gICAgICBodG1sLnB1c2goJ2hyZWY9XCInKTtcbiAgICAgIGh0bWwucHVzaCh1cmwpO1xuICAgICAgaHRtbC5wdXNoKCdcIj4nKTtcbiAgICAgIGFkZFRleHQodGV4dCk7XG4gICAgICBodG1sLnB1c2goJzwvYT4nKTtcbiAgICB9XG4gIH07XG59XSk7XG5cblxufSkod2luZG93LCB3aW5kb3cuYW5ndWxhcik7XG4iLCIvKiohXG4gKiBBbmd1bGFySlMgZmlsZSB1cGxvYWQgc2hpbSBmb3IgSFRNTDUgRm9ybURhdGFcbiAqIEBhdXRob3IgIERhbmlhbCAgPGRhbmlhbC5mYXJpZEBnbWFpbC5jb20+XG4gKiBAdmVyc2lvbiAxLjYuMTJcbiAqL1xuKGZ1bmN0aW9uKCkge1xuXG52YXIgaGFzRmxhc2ggPSBmdW5jdGlvbigpIHtcblx0dHJ5IHtcblx0ICB2YXIgZm8gPSBuZXcgQWN0aXZlWE9iamVjdCgnU2hvY2t3YXZlRmxhc2guU2hvY2t3YXZlRmxhc2gnKTtcblx0ICBpZiAoZm8pIHJldHVybiB0cnVlO1xuXHR9IGNhdGNoKGUpIHtcblx0ICBpZiAobmF2aWdhdG9yLm1pbWVUeXBlc1snYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2gnXSAhPSB1bmRlZmluZWQpIHJldHVybiB0cnVlO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxudmFyIHBhdGNoWEhSID0gZnVuY3Rpb24oZm5OYW1lLCBuZXdGbikge1xuXHR3aW5kb3cuWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlW2ZuTmFtZV0gPSBuZXdGbih3aW5kb3cuWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlW2ZuTmFtZV0pO1xufTtcblxuaWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCkge1xuXHRpZiAod2luZG93LkZvcm1EYXRhICYmICghd2luZG93LkZpbGVBUEkgfHwgIUZpbGVBUEkuZm9yY2VMb2FkKSkge1xuXHRcdC8vIGFsbG93IGFjY2VzcyB0byBBbmd1bGFyIFhIUiBwcml2YXRlIGZpZWxkOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2lzc3Vlcy8xOTM0XG5cdFx0cGF0Y2hYSFIoJ3NldFJlcXVlc3RIZWFkZXInLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oaGVhZGVyLCB2YWx1ZSkge1xuXHRcdFx0XHRpZiAoaGVhZGVyID09PSAnX19zZXRYSFJfJykge1xuXHRcdFx0XHRcdHZhciB2YWwgPSB2YWx1ZSh0aGlzKTtcblx0XHRcdFx0XHQvLyBmaXggZm9yIGFuZ3VsYXIgPCAxLjIuMFxuXHRcdFx0XHRcdGlmICh2YWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuXHRcdFx0XHRcdFx0dmFsKHRoaXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvcmlnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR2YXIgaW5pdGlhbGl6ZVVwbG9hZExpc3RlbmVyID0gZnVuY3Rpb24oeGhyKSB7XG5cdFx0XHRpZiAoIXhoci5fX2xpc3RlbmVycykge1xuXHRcdFx0XHRpZiAoIXhoci51cGxvYWQpIHhoci51cGxvYWQgPSB7fTtcblx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzID0gW107XG5cdFx0XHRcdHZhciBvcmlnQWRkRXZlbnRMaXN0ZW5lciA9IHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcjtcblx0XHRcdFx0eGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odCwgZm4sIGIpIHtcblx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbdF0gPSBmbjtcblx0XHRcdFx0XHRvcmlnQWRkRXZlbnRMaXN0ZW5lciAmJiBvcmlnQWRkRXZlbnRMaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRwYXRjaFhIUignb3BlbicsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihtLCB1cmwsIGIpIHtcblx0XHRcdFx0aW5pdGlhbGl6ZVVwbG9hZExpc3RlbmVyKHRoaXMpO1xuXHRcdFx0XHR0aGlzLl9fdXJsID0gdXJsO1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdG9yaWcuYXBwbHkodGhpcywgW20sIHVybCwgYl0pO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0aWYgKGUubWVzc2FnZS5pbmRleE9mKCdBY2Nlc3MgaXMgZGVuaWVkJykgPiAtMSkge1xuXHRcdFx0XHRcdFx0b3JpZy5hcHBseSh0aGlzLCBbbSwgJ19maXhfZm9yX2llX2Nyb3NzZG9tYWluX18nLCBiXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignZ2V0UmVzcG9uc2VIZWFkZXInLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oaCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fX2ZpbGVBcGlYSFIgJiYgdGhpcy5fX2ZpbGVBcGlYSFIuZ2V0UmVzcG9uc2VIZWFkZXIgPyB0aGlzLl9fZmlsZUFwaVhIUi5nZXRSZXNwb25zZUhlYWRlcihoKSA6IChvcmlnID09IG51bGwgPyBudWxsIDogb3JpZy5hcHBseSh0aGlzLCBbaF0pKTtcblx0XHRcdH07XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fX2ZpbGVBcGlYSFIgJiYgdGhpcy5fX2ZpbGVBcGlYSFIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzID8gdGhpcy5fX2ZpbGVBcGlYSFIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgOiAob3JpZyA9PSBudWxsID8gbnVsbCA6IG9yaWcuYXBwbHkodGhpcykpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ2Fib3J0JywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fX2ZpbGVBcGlYSFIgJiYgdGhpcy5fX2ZpbGVBcGlYSFIuYWJvcnQgPyB0aGlzLl9fZmlsZUFwaVhIUi5hYm9ydCgpIDogKG9yaWcgPT0gbnVsbCA/IG51bGwgOiBvcmlnLmFwcGx5KHRoaXMpKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdzZXRSZXF1ZXN0SGVhZGVyJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGhlYWRlciwgdmFsdWUpIHtcblx0XHRcdFx0aWYgKGhlYWRlciA9PT0gJ19fc2V0WEhSXycpIHtcblx0XHRcdFx0XHRpbml0aWFsaXplVXBsb2FkTGlzdGVuZXIodGhpcyk7XG5cdFx0XHRcdFx0dmFyIHZhbCA9IHZhbHVlKHRoaXMpO1xuXHRcdFx0XHRcdC8vIGZpeCBmb3IgYW5ndWxhciA8IDEuMi4wXG5cdFx0XHRcdFx0aWYgKHZhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0XHR2YWwodGhpcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuX19yZXF1ZXN0SGVhZGVycyA9IHRoaXMuX19yZXF1ZXN0SGVhZGVycyB8fCB7fTtcblx0XHRcdFx0XHR0aGlzLl9fcmVxdWVzdEhlYWRlcnNbaGVhZGVyXSA9IHZhbHVlO1xuXHRcdFx0XHRcdG9yaWcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ3NlbmQnLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciB4aHIgPSB0aGlzO1xuXHRcdFx0XHRpZiAoYXJndW1lbnRzWzBdICYmIGFyZ3VtZW50c1swXS5fX2lzU2hpbSkge1xuXHRcdFx0XHRcdHZhciBmb3JtRGF0YSA9IGFyZ3VtZW50c1swXTtcblx0XHRcdFx0XHR2YXIgY29uZmlnID0ge1xuXHRcdFx0XHRcdFx0dXJsOiB4aHIuX191cmwsXG5cdFx0XHRcdFx0XHRqc29ucDogZmFsc2UsIC8vcmVtb3ZlcyB0aGUgY2FsbGJhY2sgZm9ybSBwYXJhbVxuXHRcdFx0XHRcdFx0Y2FjaGU6IHRydWUsIC8vcmVtb3ZlcyB0aGUgP2ZpbGVhcGlYWFggaW4gdGhlIHVybFxuXHRcdFx0XHRcdFx0Y29tcGxldGU6IGZ1bmN0aW9uKGVyciwgZmlsZUFwaVhIUikge1xuXHRcdFx0XHRcdFx0XHR4aHIuX19jb21wbGV0ZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRpZiAoIWVyciAmJiB4aHIuX19saXN0ZW5lcnNbJ2xvYWQnXSkgXG5cdFx0XHRcdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzWydsb2FkJ10oe3R5cGU6ICdsb2FkJywgbG9hZGVkOiB4aHIuX19sb2FkZWQsIHRvdGFsOiB4aHIuX190b3RhbCwgdGFyZ2V0OiB4aHIsIGxlbmd0aENvbXB1dGFibGU6IHRydWV9KTtcblx0XHRcdFx0XHRcdFx0aWYgKCFlcnIgJiYgeGhyLl9fbGlzdGVuZXJzWydsb2FkZW5kJ10pIFxuXHRcdFx0XHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1snbG9hZGVuZCddKHt0eXBlOiAnbG9hZGVuZCcsIGxvYWRlZDogeGhyLl9fbG9hZGVkLCB0b3RhbDogeGhyLl9fdG90YWwsIHRhcmdldDogeGhyLCBsZW5ndGhDb21wdXRhYmxlOiB0cnVlfSk7XG5cdFx0XHRcdFx0XHRcdGlmIChlcnIgPT09ICdhYm9ydCcgJiYgeGhyLl9fbGlzdGVuZXJzWydhYm9ydCddKSBcblx0XHRcdFx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbJ2Fib3J0J10oe3R5cGU6ICdhYm9ydCcsIGxvYWRlZDogeGhyLl9fbG9hZGVkLCB0b3RhbDogeGhyLl9fdG90YWwsIHRhcmdldDogeGhyLCBsZW5ndGhDb21wdXRhYmxlOiB0cnVlfSk7XG5cdFx0XHRcdFx0XHRcdGlmIChmaWxlQXBpWEhSLnN0YXR1cyAhPT0gdW5kZWZpbmVkKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAnc3RhdHVzJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIChmaWxlQXBpWEhSLnN0YXR1cyA9PSAwICYmIGVyciAmJiBlcnIgIT09ICdhYm9ydCcpID8gNTAwIDogZmlsZUFwaVhIUi5zdGF0dXN9fSk7XG5cdFx0XHRcdFx0XHRcdGlmIChmaWxlQXBpWEhSLnN0YXR1c1RleHQgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3N0YXR1c1RleHQnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gZmlsZUFwaVhIUi5zdGF0dXNUZXh0fX0pO1xuXHRcdFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAncmVhZHlTdGF0ZScsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiA0fX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZmlsZUFwaVhIUi5yZXNwb25zZSAhPT0gdW5kZWZpbmVkKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAncmVzcG9uc2UnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gZmlsZUFwaVhIUi5yZXNwb25zZX19KTtcblx0XHRcdFx0XHRcdFx0dmFyIHJlc3AgPSBmaWxlQXBpWEhSLnJlc3BvbnNlVGV4dCB8fCAoZXJyICYmIGZpbGVBcGlYSFIuc3RhdHVzID09IDAgJiYgZXJyICE9PSAnYWJvcnQnID8gZXJyIDogdW5kZWZpbmVkKTtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ3Jlc3BvbnNlVGV4dCcsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiByZXNwfX0pO1xuXHRcdFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAncmVzcG9uc2UnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gcmVzcH19KTtcblx0XHRcdFx0XHRcdFx0aWYgKGVycikgT2JqZWN0LmRlZmluZVByb3BlcnR5KHhociwgJ2VycicsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiBlcnJ9fSk7XG5cdFx0XHRcdFx0XHRcdHhoci5fX2ZpbGVBcGlYSFIgPSBmaWxlQXBpWEhSO1xuXHRcdFx0XHRcdFx0XHRpZiAoeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSkgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSgpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGZpbGVwcm9ncmVzczogZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdFx0XHRlLnRhcmdldCA9IHhocjtcblx0XHRcdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzWydwcm9ncmVzcyddICYmIHhoci5fX2xpc3RlbmVyc1sncHJvZ3Jlc3MnXShlKTtcblx0XHRcdFx0XHRcdFx0eGhyLl9fdG90YWwgPSBlLnRvdGFsO1xuXHRcdFx0XHRcdFx0XHR4aHIuX19sb2FkZWQgPSBlLmxvYWRlZDtcblx0XHRcdFx0XHRcdFx0aWYgKGUudG90YWwgPT09IGUubG9hZGVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gZml4IGZsYXNoIGlzc3VlIHRoYXQgZG9lc24ndCBjYWxsIGNvbXBsZXRlIGlmIHRoZXJlIGlzIG5vIHJlc3BvbnNlIHRleHQgZnJvbSB0aGUgc2VydmVyICBcblx0XHRcdFx0XHRcdFx0XHR2YXIgX3RoaXMgPSB0aGlzXG5cdFx0XHRcdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICgheGhyLl9fY29tcGxldGVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMgPSBmdW5jdGlvbigpe307XG5cdFx0XHRcdFx0XHRcdFx0XHRcdF90aGlzLmNvbXBsZXRlKG51bGwsIHtzdGF0dXM6IDIwNCwgc3RhdHVzVGV4dDogJ05vIENvbnRlbnQnfSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSwgMTAwMDApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0aGVhZGVyczogeGhyLl9fcmVxdWVzdEhlYWRlcnNcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uZmlnLmRhdGEgPSB7fTtcblx0XHRcdFx0XHRjb25maWcuZmlsZXMgPSB7fVxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZm9ybURhdGEuZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFyIGl0ZW0gPSBmb3JtRGF0YS5kYXRhW2ldO1xuXHRcdFx0XHRcdFx0aWYgKGl0ZW0udmFsICE9IG51bGwgJiYgaXRlbS52YWwubmFtZSAhPSBudWxsICYmIGl0ZW0udmFsLnNpemUgIT0gbnVsbCAmJiBpdGVtLnZhbC50eXBlICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0Y29uZmlnLmZpbGVzW2l0ZW0ua2V5XSA9IGl0ZW0udmFsO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uZmlnLmRhdGFbaXRlbS5rZXldID0gaXRlbS52YWw7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmICghaGFzRmxhc2goKSkge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyAnQWRvZGUgRmxhc2ggUGxheWVyIG5lZWQgdG8gYmUgaW5zdGFsbGVkLiBUbyBjaGVjayBhaGVhZCB1c2UgXCJGaWxlQVBJLmhhc0ZsYXNoXCInO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0eGhyLl9fZmlsZUFwaVhIUiA9IEZpbGVBUEkudXBsb2FkKGNvbmZpZyk7XG5cdFx0XHRcdFx0fSwgMSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3JpZy5hcHBseSh4aHIsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHR3aW5kb3cuWE1MSHR0cFJlcXVlc3QuX19pc1NoaW0gPSB0cnVlO1xufVxuXG5pZiAoIXdpbmRvdy5Gb3JtRGF0YSB8fCAod2luZG93LkZpbGVBUEkgJiYgRmlsZUFQSS5mb3JjZUxvYWQpKSB7XG5cdHZhciBhZGRGbGFzaCA9IGZ1bmN0aW9uKGVsZW0pIHtcblx0XHRpZiAoIWhhc0ZsYXNoKCkpIHtcblx0XHRcdHRocm93ICdBZG9kZSBGbGFzaCBQbGF5ZXIgbmVlZCB0byBiZSBpbnN0YWxsZWQuIFRvIGNoZWNrIGFoZWFkIHVzZSBcIkZpbGVBUEkuaGFzRmxhc2hcIic7XG5cdFx0fVxuXHRcdHZhciBlbCA9IGFuZ3VsYXIuZWxlbWVudChlbGVtKTtcblx0XHRpZiAoIWVsLmF0dHIoJ2Rpc2FibGVkJykpIHtcblx0XHRcdGlmICghZWwuaGFzQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpICYmIChlbGVtLmdldEF0dHJpYnV0ZSgnbmctZmlsZS1zZWxlY3QnKSAhPSBudWxsIHx8IGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLW5nLWZpbGUtc2VsZWN0JykgIT0gbnVsbCkpIHtcblx0XHRcdFx0aWYgKEZpbGVBUEkud3JhcEluc2lkZURpdikge1xuXHRcdFx0XHRcdHZhciB3cmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdFx0d3JhcC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImpzLWZpbGVhcGktd3JhcHBlclwiIHN0eWxlPVwicG9zaXRpb246cmVsYXRpdmU7IG92ZXJmbG93OmhpZGRlblwiPjwvZGl2Pic7XG5cdFx0XHRcdFx0d3JhcCA9IHdyYXAuZmlyc3RDaGlsZDtcblx0XHRcdFx0XHR2YXIgcGFyZW50ID0gZWxlbS5wYXJlbnROb2RlO1xuXHRcdFx0XHRcdHBhcmVudC5pbnNlcnRCZWZvcmUod3JhcCwgZWxlbSk7XG5cdFx0XHRcdFx0cGFyZW50LnJlbW92ZUNoaWxkKGVsZW0pO1xuXHRcdFx0XHRcdHdyYXAuYXBwZW5kQ2hpbGQoZWxlbSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZWwuYWRkQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpO1xuXHRcdFx0XHRcdGlmIChlbC5wYXJlbnQoKVswXS5fX2ZpbGVfY2xpY2tfZm5fZGVsZWdhdGVfKSB7XG5cdFx0XHRcdFx0XHRpZiAoZWwucGFyZW50KCkuY3NzKCdwb3NpdGlvbicpID09PSAnJyB8fCBlbC5wYXJlbnQoKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG5cdFx0XHRcdFx0XHRcdGVsLnBhcmVudCgpLmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsLmNzcygndG9wJywgMCkuY3NzKCdib3R0b20nLCAwKS5jc3MoJ2xlZnQnLCAwKS5jc3MoJ3JpZ2h0JywgMCkuY3NzKCd3aWR0aCcsICcxMDAlJykuY3NzKCdoZWlnaHQnLCAnMTAwJScpLlxuXHRcdFx0XHRcdFx0XHRjc3MoJ3BhZGRpbmcnLCAwKS5jc3MoJ21hcmdpbicsIDApO1xuXHRcdFx0XHRcdFx0ZWwucGFyZW50KCkudW5iaW5kKCdjbGljaycsIGVsLnBhcmVudCgpWzBdLl9fZmlsZV9jbGlja19mbl9kZWxlZ2F0ZV8pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0dmFyIGNoYW5nZUZuV3JhcHBlciA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0dmFyIGZpbGVzID0gRmlsZUFQSS5nZXRGaWxlcyhldnQpO1xuXHRcdFx0Ly9qdXN0IGEgZG91YmxlIGNoZWNrIGZvciAjMjMzXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChmaWxlc1tpXS5zaXplID09PSB1bmRlZmluZWQpIGZpbGVzW2ldLnNpemUgPSAwO1xuXHRcdFx0XHRpZiAoZmlsZXNbaV0ubmFtZSA9PT0gdW5kZWZpbmVkKSBmaWxlc1tpXS5uYW1lID0gJ2ZpbGUnO1xuXHRcdFx0XHRpZiAoZmlsZXNbaV0udHlwZSA9PT0gdW5kZWZpbmVkKSBmaWxlc1tpXS50eXBlID0gJ3VuZGVmaW5lZCc7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIWV2dC50YXJnZXQpIHtcblx0XHRcdFx0ZXZ0LnRhcmdldCA9IHt9O1xuXHRcdFx0fVxuXHRcdFx0ZXZ0LnRhcmdldC5maWxlcyA9IGZpbGVzO1xuXHRcdFx0Ly8gaWYgZXZ0LnRhcmdldC5maWxlcyBpcyBub3Qgd3JpdGFibGUgdXNlIGhlbHBlciBmaWVsZFxuXHRcdFx0aWYgKGV2dC50YXJnZXQuZmlsZXMgIT0gZmlsZXMpIHtcblx0XHRcdFx0ZXZ0Ll9fZmlsZXNfID0gZmlsZXM7XG5cdFx0XHR9XG5cdFx0XHQoZXZ0Ll9fZmlsZXNfIHx8IGV2dC50YXJnZXQuZmlsZXMpLml0ZW0gPSBmdW5jdGlvbihpKSB7XG5cdFx0XHRcdHJldHVybiAoZXZ0Ll9fZmlsZXNfIHx8IGV2dC50YXJnZXQuZmlsZXMpW2ldIHx8IG51bGw7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZm4pIGZuLmFwcGx5KHRoaXMsIFtldnRdKTtcblx0XHR9O1xuXHR9O1xuXHR2YXIgaXNGaWxlQ2hhbmdlID0gZnVuY3Rpb24oZWxlbSwgZSkge1xuXHRcdHJldHVybiAoZS50b0xvd2VyQ2FzZSgpID09PSAnY2hhbmdlJyB8fCBlLnRvTG93ZXJDYXNlKCkgPT09ICdvbmNoYW5nZScpICYmIGVsZW0uZ2V0QXR0cmlidXRlKCd0eXBlJykgPT0gJ2ZpbGUnO1xuXHR9XG5cdGlmIChIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyKSB7XG5cdFx0SFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IChmdW5jdGlvbihvcmlnQWRkRXZlbnRMaXN0ZW5lcikge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGUsIGZuLCBiLCBkKSB7XG5cdFx0XHRcdGlmIChpc0ZpbGVDaGFuZ2UodGhpcywgZSkpIHtcblx0XHRcdFx0XHRhZGRGbGFzaCh0aGlzKTtcblx0XHRcdFx0XHRvcmlnQWRkRXZlbnRMaXN0ZW5lci5hcHBseSh0aGlzLCBbZSwgY2hhbmdlRm5XcmFwcGVyKGZuKSwgYiwgZF0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9yaWdBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIFtlLCBmbiwgYiwgZF0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkoSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcik7XG5cdH1cblx0aWYgKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmF0dGFjaEV2ZW50KSB7XG5cdFx0SFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYXR0YWNoRXZlbnQgPSAoZnVuY3Rpb24ob3JpZ0F0dGFjaEV2ZW50KSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oZSwgZm4pIHtcblx0XHRcdFx0aWYgKGlzRmlsZUNoYW5nZSh0aGlzLCBlKSkge1xuXHRcdFx0XHRcdGFkZEZsYXNoKHRoaXMpO1xuXHRcdFx0XHRcdGlmICh3aW5kb3cualF1ZXJ5KSB7XG5cdFx0XHRcdFx0XHQvLyBmaXggZm9yICMyODEgalF1ZXJ5IG9uIElFOFxuXHRcdFx0XHRcdFx0YW5ndWxhci5lbGVtZW50KHRoaXMpLmJpbmQoJ2NoYW5nZScsIGNoYW5nZUZuV3JhcHBlcihudWxsKSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9yaWdBdHRhY2hFdmVudC5hcHBseSh0aGlzLCBbZSwgY2hhbmdlRm5XcmFwcGVyKGZuKV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvcmlnQXR0YWNoRXZlbnQuYXBwbHkodGhpcywgW2UsIGZuXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KShIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hdHRhY2hFdmVudCk7XG5cdH1cblxuXHR3aW5kb3cuRm9ybURhdGEgPSBGb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRhcHBlbmQ6IGZ1bmN0aW9uKGtleSwgdmFsLCBuYW1lKSB7XG5cdFx0XHRcdHRoaXMuZGF0YS5wdXNoKHtcblx0XHRcdFx0XHRrZXk6IGtleSxcblx0XHRcdFx0XHR2YWw6IHZhbCxcblx0XHRcdFx0XHRuYW1lOiBuYW1lXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdGRhdGE6IFtdLFxuXHRcdFx0X19pc1NoaW06IHRydWVcblx0XHR9O1xuXHR9O1xuXG5cdChmdW5jdGlvbiAoKSB7XG5cdFx0Ly9sb2FkIEZpbGVBUElcblx0XHRpZiAoIXdpbmRvdy5GaWxlQVBJKSB7XG5cdFx0XHR3aW5kb3cuRmlsZUFQSSA9IHt9O1xuXHRcdH1cblx0XHRpZiAoRmlsZUFQSS5mb3JjZUxvYWQpIHtcblx0XHRcdEZpbGVBUEkuaHRtbDUgPSBmYWxzZTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKCFGaWxlQVBJLnVwbG9hZCkge1xuXHRcdFx0dmFyIGpzVXJsLCBiYXNlUGF0aCwgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JyksIGFsbFNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JyksIGksIGluZGV4LCBzcmM7XG5cdFx0XHRpZiAod2luZG93LkZpbGVBUEkuanNVcmwpIHtcblx0XHRcdFx0anNVcmwgPSB3aW5kb3cuRmlsZUFQSS5qc1VybDtcblx0XHRcdH0gZWxzZSBpZiAod2luZG93LkZpbGVBUEkuanNQYXRoKSB7XG5cdFx0XHRcdGJhc2VQYXRoID0gd2luZG93LkZpbGVBUEkuanNQYXRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGFsbFNjcmlwdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRzcmMgPSBhbGxTY3JpcHRzW2ldLnNyYztcblx0XHRcdFx0XHRpbmRleCA9IHNyYy5pbmRleE9mKCdhbmd1bGFyLWZpbGUtdXBsb2FkLXNoaW0uanMnKVxuXHRcdFx0XHRcdGlmIChpbmRleCA9PSAtMSkge1xuXHRcdFx0XHRcdFx0aW5kZXggPSBzcmMuaW5kZXhPZignYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLm1pbi5qcycpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoaW5kZXggPiAtMSkge1xuXHRcdFx0XHRcdFx0YmFzZVBhdGggPSBzcmMuc3Vic3RyaW5nKDAsIGluZGV4KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoRmlsZUFQSS5zdGF0aWNQYXRoID09IG51bGwpIEZpbGVBUEkuc3RhdGljUGF0aCA9IGJhc2VQYXRoO1xuXHRcdFx0c2NyaXB0LnNldEF0dHJpYnV0ZSgnc3JjJywganNVcmwgfHwgYmFzZVBhdGggKyAnRmlsZUFQSS5taW4uanMnKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcblx0XHRcdEZpbGVBUEkuaGFzRmxhc2ggPSBoYXNGbGFzaCgpO1xuXHRcdH1cblx0fSkoKTtcblx0RmlsZUFQSS5kaXNhYmxlRmlsZUlucHV0ID0gZnVuY3Rpb24oZWxlbSwgZGlzYWJsZSkge1xuXHRcdGlmIChkaXNhYmxlKSB7XG5cdFx0XHRlbGVtLnJlbW92ZUNsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRlbGVtLmFkZENsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKTtcblx0XHR9XG5cdH1cbn1cblxuXG5pZiAoIXdpbmRvdy5GaWxlUmVhZGVyKSB7XG5cdHdpbmRvdy5GaWxlUmVhZGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcywgbG9hZFN0YXJ0ZWQgPSBmYWxzZTtcblx0XHR0aGlzLmxpc3RlbmVycyA9IHt9O1xuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGZuKSB7XG5cdFx0XHRfdGhpcy5saXN0ZW5lcnNbdHlwZV0gPSBfdGhpcy5saXN0ZW5lcnNbdHlwZV0gfHwgW107XG5cdFx0XHRfdGhpcy5saXN0ZW5lcnNbdHlwZV0ucHVzaChmbik7XG5cdFx0fTtcblx0XHR0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBmbikge1xuXHRcdFx0X3RoaXMubGlzdGVuZXJzW3R5cGVdICYmIF90aGlzLmxpc3RlbmVyc1t0eXBlXS5zcGxpY2UoX3RoaXMubGlzdGVuZXJzW3R5cGVdLmluZGV4T2YoZm4pLCAxKTtcblx0XHR9O1xuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0dmFyIGxpc3QgPSBfdGhpcy5saXN0ZW5lcnNbZXZ0LnR5cGVdO1xuXHRcdFx0aWYgKGxpc3QpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bGlzdFtpXS5jYWxsKF90aGlzLCBldnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLm9uYWJvcnQgPSB0aGlzLm9uZXJyb3IgPSB0aGlzLm9ubG9hZCA9IHRoaXMub25sb2Fkc3RhcnQgPSB0aGlzLm9ubG9hZGVuZCA9IHRoaXMub25wcm9ncmVzcyA9IG51bGw7XG5cblx0XHR2YXIgY29uc3RydWN0RXZlbnQgPSBmdW5jdGlvbih0eXBlLCBldnQpIHtcblx0XHRcdHZhciBlID0ge3R5cGU6IHR5cGUsIHRhcmdldDogX3RoaXMsIGxvYWRlZDogZXZ0LmxvYWRlZCwgdG90YWw6IGV2dC50b3RhbCwgZXJyb3I6IGV2dC5lcnJvcn07XG5cdFx0XHRpZiAoZXZ0LnJlc3VsdCAhPSBudWxsKSBlLnRhcmdldC5yZXN1bHQgPSBldnQucmVzdWx0O1xuXHRcdFx0cmV0dXJuIGU7XG5cdFx0fTtcblx0XHR2YXIgbGlzdGVuZXIgPSBmdW5jdGlvbihldnQpIHtcblx0XHRcdGlmICghbG9hZFN0YXJ0ZWQpIHtcblx0XHRcdFx0bG9hZFN0YXJ0ZWQgPSB0cnVlO1xuXHRcdFx0XHRfdGhpcy5vbmxvYWRzdGFydCAmJiB0aGlzLm9ubG9hZHN0YXJ0KGNvbnN0cnVjdEV2ZW50KCdsb2Fkc3RhcnQnLCBldnQpKTtcblx0XHRcdH1cblx0XHRcdGlmIChldnQudHlwZSA9PT0gJ2xvYWQnKSB7XG5cdFx0XHRcdF90aGlzLm9ubG9hZGVuZCAmJiBfdGhpcy5vbmxvYWRlbmQoY29uc3RydWN0RXZlbnQoJ2xvYWRlbmQnLCBldnQpKTtcblx0XHRcdFx0dmFyIGUgPSBjb25zdHJ1Y3RFdmVudCgnbG9hZCcsIGV2dCk7XG5cdFx0XHRcdF90aGlzLm9ubG9hZCAmJiBfdGhpcy5vbmxvYWQoZSk7XG5cdFx0XHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG5cdFx0XHR9IGVsc2UgaWYgKGV2dC50eXBlID09PSAncHJvZ3Jlc3MnKSB7XG5cdFx0XHRcdHZhciBlID0gY29uc3RydWN0RXZlbnQoJ3Byb2dyZXNzJywgZXZ0KTtcblx0XHRcdFx0X3RoaXMub25wcm9ncmVzcyAmJiBfdGhpcy5vbnByb2dyZXNzKGUpO1xuXHRcdFx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGUgPSBjb25zdHJ1Y3RFdmVudCgnZXJyb3InLCBldnQpO1xuXHRcdFx0XHRfdGhpcy5vbmVycm9yICYmIF90aGlzLm9uZXJyb3IoZSk7XG5cdFx0XHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR0aGlzLnJlYWRBc0FycmF5QnVmZmVyID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0RmlsZUFQSS5yZWFkQXNCaW5hcnlTdHJpbmcoZmlsZSwgbGlzdGVuZXIpO1xuXHRcdH1cblx0XHR0aGlzLnJlYWRBc0JpbmFyeVN0cmluZyA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdEZpbGVBUEkucmVhZEFzQmluYXJ5U3RyaW5nKGZpbGUsIGxpc3RlbmVyKTtcblx0XHR9XG5cdFx0dGhpcy5yZWFkQXNEYXRhVVJMID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0RmlsZUFQSS5yZWFkQXNEYXRhVVJMKGZpbGUsIGxpc3RlbmVyKTtcblx0XHR9XG5cdFx0dGhpcy5yZWFkQXNUZXh0ID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0RmlsZUFQSS5yZWFkQXNUZXh0KGZpbGUsIGxpc3RlbmVyKTtcblx0XHR9XG5cdH1cbn1cblxufSkoKTtcbiIsIi8qKiFcbiAqIEFuZ3VsYXJKUyBmaWxlIHVwbG9hZC9kcm9wIGRpcmVjdGl2ZSB3aXRoIGh0dHAgcG9zdCBhbmQgcHJvZ3Jlc3NcbiAqIEBhdXRob3IgIERhbmlhbCAgPGRhbmlhbC5mYXJpZEBnbWFpbC5jb20+XG4gKiBAdmVyc2lvbiAxLjYuMTJcbiAqL1xuKGZ1bmN0aW9uKCkge1xuXG52YXIgYW5ndWxhckZpbGVVcGxvYWQgPSBhbmd1bGFyLm1vZHVsZSgnYW5ndWxhckZpbGVVcGxvYWQnLCBbXSk7XG5cbmFuZ3VsYXJGaWxlVXBsb2FkLnNlcnZpY2UoJyR1cGxvYWQnLCBbJyRodHRwJywgJyRxJywgJyR0aW1lb3V0JywgZnVuY3Rpb24oJGh0dHAsICRxLCAkdGltZW91dCkge1xuXHRmdW5jdGlvbiBzZW5kSHR0cChjb25maWcpIHtcblx0XHRjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZCB8fCAnUE9TVCc7XG5cdFx0Y29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblx0XHRjb25maWcudHJhbnNmb3JtUmVxdWVzdCA9IGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0IHx8IGZ1bmN0aW9uKGRhdGEsIGhlYWRlcnNHZXR0ZXIpIHtcblx0XHRcdGlmICh3aW5kb3cuQXJyYXlCdWZmZXIgJiYgZGF0YSBpbnN0YW5jZW9mIHdpbmRvdy5BcnJheUJ1ZmZlcikge1xuXHRcdFx0XHRyZXR1cm4gZGF0YTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAkaHR0cC5kZWZhdWx0cy50cmFuc2Zvcm1SZXF1ZXN0WzBdKGRhdGEsIGhlYWRlcnNHZXR0ZXIpO1xuXHRcdH07XG5cdFx0dmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuXHRcdGlmICh3aW5kb3cuWE1MSHR0cFJlcXVlc3QuX19pc1NoaW0pIHtcblx0XHRcdGNvbmZpZy5oZWFkZXJzWydfX3NldFhIUl8nXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oeGhyKSB7XG5cdFx0XHRcdFx0aWYgKCF4aHIpIHJldHVybjtcblx0XHRcdFx0XHRjb25maWcuX19YSFIgPSB4aHI7XG5cdFx0XHRcdFx0Y29uZmlnLnhockZuICYmIGNvbmZpZy54aHJGbih4aHIpO1xuXHRcdFx0XHRcdHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XHRkZWZlcnJlZC5ub3RpZnkoZSk7XG5cdFx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0XHRcdC8vZml4IGZvciBmaXJlZm94IG5vdCBmaXJpbmcgdXBsb2FkIHByb2dyZXNzIGVuZCwgYWxzbyBJRTgtOVxuXHRcdFx0XHRcdHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdGlmIChlLmxlbmd0aENvbXB1dGFibGUpIHtcblx0XHRcdFx0XHRcdFx0ZGVmZXJyZWQubm90aWZ5KGUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdFx0fTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0JGh0dHAoY29uZmlnKS50aGVuKGZ1bmN0aW9uKHIpe2RlZmVycmVkLnJlc29sdmUocil9LCBmdW5jdGlvbihlKXtkZWZlcnJlZC5yZWplY3QoZSl9LCBmdW5jdGlvbihuKXtkZWZlcnJlZC5ub3RpZnkobil9KTtcblx0XHRcblx0XHR2YXIgcHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2U7XG5cdFx0cHJvbWlzZS5zdWNjZXNzID0gZnVuY3Rpb24oZm4pIHtcblx0XHRcdHByb21pc2UudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRmbihyZXNwb25zZS5kYXRhLCByZXNwb25zZS5zdGF0dXMsIHJlc3BvbnNlLmhlYWRlcnMsIGNvbmZpZyk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cblx0XHRwcm9taXNlLmVycm9yID0gZnVuY3Rpb24oZm4pIHtcblx0XHRcdHByb21pc2UudGhlbihudWxsLCBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRmbihyZXNwb25zZS5kYXRhLCByZXNwb25zZS5zdGF0dXMsIHJlc3BvbnNlLmhlYWRlcnMsIGNvbmZpZyk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cblx0XHRwcm9taXNlLnByb2dyZXNzID0gZnVuY3Rpb24oZm4pIHtcblx0XHRcdHByb21pc2UudGhlbihudWxsLCBudWxsLCBmdW5jdGlvbih1cGRhdGUpIHtcblx0XHRcdFx0Zm4odXBkYXRlKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblx0XHRwcm9taXNlLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoY29uZmlnLl9fWEhSKSB7XG5cdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGNvbmZpZy5fX1hIUi5hYm9ydCgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cdFx0cHJvbWlzZS54aHIgPSBmdW5jdGlvbihmbikge1xuXHRcdFx0Y29uZmlnLnhockZuID0gKGZ1bmN0aW9uKG9yaWdYaHJGbikge1xuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0b3JpZ1hockZuICYmIG9yaWdYaHJGbi5hcHBseShwcm9taXNlLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRcdGZuLmFwcGx5KHByb21pc2UsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pKGNvbmZpZy54aHJGbik7XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXHRcdFxuXHRcdHJldHVybiBwcm9taXNlO1xuXHR9XG5cblx0dGhpcy51cGxvYWQgPSBmdW5jdGlvbihjb25maWcpIHtcblx0XHRjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXHRcdGNvbmZpZy5oZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHVuZGVmaW5lZDtcblx0XHRjb25maWcudHJhbnNmb3JtUmVxdWVzdCA9IGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0IHx8ICRodHRwLmRlZmF1bHRzLnRyYW5zZm9ybVJlcXVlc3Q7XG5cdFx0dmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0dmFyIG9yaWdUcmFuc2Zvcm1SZXF1ZXN0ID0gY29uZmlnLnRyYW5zZm9ybVJlcXVlc3Q7XG5cdFx0dmFyIG9yaWdEYXRhID0gY29uZmlnLmRhdGE7XG5cdFx0Y29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgPSBmdW5jdGlvbihmb3JtRGF0YSwgaGVhZGVyR2V0dGVyKSB7XG5cdFx0XHRpZiAob3JpZ0RhdGEpIHtcblx0XHRcdFx0aWYgKGNvbmZpZy5mb3JtRGF0YUFwcGVuZGVyKSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIga2V5IGluIG9yaWdEYXRhKSB7XG5cdFx0XHRcdFx0XHR2YXIgdmFsID0gb3JpZ0RhdGFba2V5XTtcblx0XHRcdFx0XHRcdGNvbmZpZy5mb3JtRGF0YUFwcGVuZGVyKGZvcm1EYXRhLCBrZXksIHZhbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvciAodmFyIGtleSBpbiBvcmlnRGF0YSkge1xuXHRcdFx0XHRcdFx0dmFyIHZhbCA9IG9yaWdEYXRhW2tleV07XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIG9yaWdUcmFuc2Zvcm1SZXF1ZXN0ID09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0dmFsID0gb3JpZ1RyYW5zZm9ybVJlcXVlc3QodmFsLCBoZWFkZXJHZXR0ZXIpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvcmlnVHJhbnNmb3JtUmVxdWVzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdHZhciB0cmFuc2Zvcm1GbiA9IG9yaWdUcmFuc2Zvcm1SZXF1ZXN0W2ldO1xuXHRcdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgdHJhbnNmb3JtRm4gPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0dmFsID0gdHJhbnNmb3JtRm4odmFsLCBoZWFkZXJHZXR0ZXIpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Zm9ybURhdGEuYXBwZW5kKGtleSwgdmFsKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGNvbmZpZy5maWxlICE9IG51bGwpIHtcblx0XHRcdFx0dmFyIGZpbGVGb3JtTmFtZSA9IGNvbmZpZy5maWxlRm9ybURhdGFOYW1lIHx8ICdmaWxlJztcblxuXHRcdFx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGNvbmZpZy5maWxlKSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuXHRcdFx0XHRcdHZhciBpc0ZpbGVGb3JtTmFtZVN0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChmaWxlRm9ybU5hbWUpID09PSAnW29iamVjdCBTdHJpbmddJztcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNvbmZpZy5maWxlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRmb3JtRGF0YS5hcHBlbmQoaXNGaWxlRm9ybU5hbWVTdHJpbmcgPyBmaWxlRm9ybU5hbWUgOiBmaWxlRm9ybU5hbWVbaV0sIGNvbmZpZy5maWxlW2ldLCBcblx0XHRcdFx0XHRcdFx0XHQoY29uZmlnLmZpbGVOYW1lICYmIGNvbmZpZy5maWxlTmFtZVtpXSkgfHwgY29uZmlnLmZpbGVbaV0ubmFtZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvcm1EYXRhLmFwcGVuZChmaWxlRm9ybU5hbWUsIGNvbmZpZy5maWxlLCBjb25maWcuZmlsZU5hbWUgfHwgY29uZmlnLmZpbGUubmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBmb3JtRGF0YTtcblx0XHR9O1xuXG5cdFx0Y29uZmlnLmRhdGEgPSBmb3JtRGF0YTtcblxuXHRcdHJldHVybiBzZW5kSHR0cChjb25maWcpO1xuXHR9O1xuXG5cdHRoaXMuaHR0cCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuXHRcdHJldHVybiBzZW5kSHR0cChjb25maWcpO1xuXHR9XG59XSk7XG5cbmFuZ3VsYXJGaWxlVXBsb2FkLmRpcmVjdGl2ZSgnbmdGaWxlU2VsZWN0JywgWyAnJHBhcnNlJywgJyR0aW1lb3V0JywgZnVuY3Rpb24oJHBhcnNlLCAkdGltZW91dCkge1xuXHRyZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHIpIHtcblx0XHR2YXIgZm4gPSAkcGFyc2UoYXR0clsnbmdGaWxlU2VsZWN0J10pO1xuXHRcdGlmIChlbGVtWzBdLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ2lucHV0JyB8fCAoZWxlbS5hdHRyKCd0eXBlJykgJiYgZWxlbS5hdHRyKCd0eXBlJykudG9Mb3dlckNhc2UoKSkgIT09ICdmaWxlJykge1xuXHRcdFx0dmFyIGZpbGVFbGVtID0gYW5ndWxhci5lbGVtZW50KCc8aW5wdXQgdHlwZT1cImZpbGVcIj4nKVxuXHRcdFx0dmFyIGF0dHJzID0gZWxlbVswXS5hdHRyaWJ1dGVzO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoYXR0cnNbaV0ubmFtZS50b0xvd2VyQ2FzZSgpICE9PSAndHlwZScpIHtcblx0XHRcdFx0XHRmaWxlRWxlbS5hdHRyKGF0dHJzW2ldLm5hbWUsIGF0dHJzW2ldLnZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGF0dHJbXCJtdWx0aXBsZVwiXSkgZmlsZUVsZW0uYXR0cihcIm11bHRpcGxlXCIsIFwidHJ1ZVwiKTtcblx0XHRcdGZpbGVFbGVtLmNzcyhcIndpZHRoXCIsIFwiMXB4XCIpLmNzcyhcImhlaWdodFwiLCBcIjFweFwiKS5jc3MoXCJvcGFjaXR5XCIsIDApLmNzcyhcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIikuY3NzKCdmaWx0ZXInLCAnYWxwaGEob3BhY2l0eT0wKScpXG5cdFx0XHRcdFx0LmNzcyhcInBhZGRpbmdcIiwgMCkuY3NzKFwibWFyZ2luXCIsIDApLmNzcyhcIm92ZXJmbG93XCIsIFwiaGlkZGVuXCIpO1xuXHRcdFx0ZmlsZUVsZW0uYXR0cignX193cmFwcGVyX2Zvcl9wYXJlbnRfJywgdHJ1ZSk7XG5cbi8vXHRcdFx0ZmlsZUVsZW0uY3NzKFwidG9wXCIsIDApLmNzcyhcImJvdHRvbVwiLCAwKS5jc3MoXCJsZWZ0XCIsIDApLmNzcyhcInJpZ2h0XCIsIDApLmNzcyhcIndpZHRoXCIsIFwiMTAwJVwiKS5cbi8vXHRcdFx0XHRcdGNzcyhcIm9wYWNpdHlcIiwgMCkuY3NzKFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiKS5jc3MoJ2ZpbHRlcicsICdhbHBoYShvcGFjaXR5PTApJykuY3NzKFwicGFkZGluZ1wiLCAwKS5jc3MoXCJtYXJnaW5cIiwgMCk7XG5cdFx0XHRlbGVtLmFwcGVuZChmaWxlRWxlbSk7XG5cdFx0XHRlbGVtWzBdLl9fZmlsZV9jbGlja19mbl9kZWxlZ2F0ZV8gID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGZpbGVFbGVtWzBdLmNsaWNrKCk7XG5cdFx0XHR9OyBcblx0XHRcdGVsZW0uYmluZCgnY2xpY2snLCBlbGVtWzBdLl9fZmlsZV9jbGlja19mbl9kZWxlZ2F0ZV8pO1xuXHRcdFx0ZWxlbS5jc3MoXCJvdmVyZmxvd1wiLCBcImhpZGRlblwiKTtcbi8vXHRcdFx0aWYgKGZpbGVFbGVtLnBhcmVudCgpWzBdICE9IGVsZW1bMF0pIHtcbi8vXHRcdFx0XHQvL2ZpeCAjMjk4IGJ1dHRvbiBlbGVtZW50XG4vL1x0XHRcdFx0ZWxlbS53cmFwKCc8c3Bhbj4nKTtcbi8vXHRcdFx0XHRlbGVtLmNzcyhcInotaW5kZXhcIiwgXCItMTAwMFwiKVxuLy9cdFx0XHRcdGVsZW0ucGFyZW50KCkuYXBwZW5kKGZpbGVFbGVtKTtcbi8vXHRcdFx0XHRlbGVtID0gZWxlbS5wYXJlbnQoKTtcbi8vXHRcdFx0fVxuLy9cdFx0XHRpZiAoZWxlbS5jc3MoXCJwb3NpdGlvblwiKSA9PT0gJycgfHwgZWxlbS5jc3MoXCJwb3NpdGlvblwiKSA9PT0gJ3N0YXRpYycpIHtcbi8vXHRcdFx0XHRlbGVtLmNzcyhcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIik7XG4vL1x0XHRcdH1cblx0XHRcdGVsZW0gPSBmaWxlRWxlbTtcblx0XHR9XG5cdFx0ZWxlbS5iaW5kKCdjaGFuZ2UnLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdHZhciBmaWxlcyA9IFtdLCBmaWxlTGlzdCwgaTtcblx0XHRcdGZpbGVMaXN0ID0gZXZ0Ll9fZmlsZXNfIHx8IGV2dC50YXJnZXQuZmlsZXM7XG5cdFx0XHRpZiAoZmlsZUxpc3QgIT0gbnVsbCkge1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgZmlsZUxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRmaWxlcy5wdXNoKGZpbGVMaXN0Lml0ZW0oaSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0Zm4oc2NvcGUsIHtcblx0XHRcdFx0XHQkZmlsZXMgOiBmaWxlcyxcblx0XHRcdFx0XHQkZXZlbnQgOiBldnRcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHQvLyByZW1vdmVkIHRoaXMgc2luY2UgaXQgd2FzIGNvbmZ1c2luZyBpZiB0aGUgdXNlciBjbGljayBvbiBicm93c2UgYW5kIHRoZW4gY2FuY2VsICMxODFcbi8vXHRcdGVsZW0uYmluZCgnY2xpY2snLCBmdW5jdGlvbigpe1xuLy9cdFx0XHR0aGlzLnZhbHVlID0gbnVsbDtcbi8vXHRcdH0pO1xuXG5cdFx0Ly8gcmVtb3ZlZCBiZWNhdXNlIG9mICMyNTMgYnVnXG5cdFx0Ly8gdG91Y2ggc2NyZWVuc1xuLy9cdFx0aWYgKCgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHx8XG4vL1x0XHRcdFx0KG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyA+IDApIHx8IChuYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cyA+IDApKSB7XG4vL1x0XHRcdGVsZW0uYmluZCgndG91Y2hlbmQnLCBmdW5jdGlvbihlKSB7XG4vL1x0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuLy9cdFx0XHRcdGUudGFyZ2V0LmNsaWNrKCk7XG4vL1x0XHRcdH0pO1xuLy9cdFx0fVxuXHR9O1xufSBdKTtcblxuYW5ndWxhckZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ0ZpbGVEcm9wQXZhaWxhYmxlJywgWyAnJHBhcnNlJywgJyR0aW1lb3V0JywgZnVuY3Rpb24oJHBhcnNlLCAkdGltZW91dCkge1xuXHRyZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHIpIHtcblx0XHRpZiAoJ2RyYWdnYWJsZScgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpKSB7XG5cdFx0XHR2YXIgZm4gPSAkcGFyc2UoYXR0clsnbmdGaWxlRHJvcEF2YWlsYWJsZSddKTtcblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRmbihzY29wZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59IF0pO1xuXG5hbmd1bGFyRmlsZVVwbG9hZC5kaXJlY3RpdmUoJ25nRmlsZURyb3AnLCBbICckcGFyc2UnLCAnJHRpbWVvdXQnLCAnJGxvY2F0aW9uJywgZnVuY3Rpb24oJHBhcnNlLCAkdGltZW91dCwgJGxvY2F0aW9uKSB7XG5cdHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cikge1xuXHRcdGlmICgnZHJhZ2dhYmxlJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJykpIHtcblx0XHRcdHZhciBsZWF2ZVRpbWVvdXQgPSBudWxsO1xuXHRcdFx0ZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHQkdGltZW91dC5jYW5jZWwobGVhdmVUaW1lb3V0KTtcblx0XHRcdFx0aWYgKCFlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXykge1xuXHRcdFx0XHRcdGlmIChhdHRyWyduZ0ZpbGVEcmFnT3ZlckNsYXNzJ10gJiYgYXR0clsnbmdGaWxlRHJhZ092ZXJDbGFzcyddLnNlYXJjaCgvXFwpICokLykgPiAtMSkge1xuXHRcdFx0XHRcdFx0dmFyIGRyYWdPdmVyQ2xhc3MgPSAkcGFyc2UoYXR0clsnbmdGaWxlRHJhZ092ZXJDbGFzcyddKShzY29wZSwge1xuXHRcdFx0XHRcdFx0XHQkZXZlbnQgOiBldnRcblx0XHRcdFx0XHRcdH0pO1x0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfID0gZHJhZ092ZXJDbGFzczsgXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfID0gYXR0clsnbmdGaWxlRHJhZ092ZXJDbGFzcyddIHx8IFwiZHJhZ292ZXJcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxlbS5hZGRDbGFzcyhlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW50ZXJcIiwgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0ZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2xlYXZlXCIsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRsZWF2ZVRpbWVvdXQgPSAkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRlbGVtLnJlbW92ZUNsYXNzKGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfKTtcblx0XHRcdFx0XHRlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyA9IG51bGw7XG5cdFx0XHRcdH0sIGF0dHJbJ25nRmlsZURyYWdPdmVyRGVsYXknXSB8fCAxKTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdHZhciBmbiA9ICRwYXJzZShhdHRyWyduZ0ZpbGVEcm9wJ10pO1xuXHRcdFx0ZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGVsZW0ucmVtb3ZlQ2xhc3MoZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18pO1xuXHRcdFx0XHRlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyA9IG51bGw7XG5cdFx0XHRcdGV4dHJhY3RGaWxlcyhldnQsIGZ1bmN0aW9uKGZpbGVzKSB7XG5cdFx0XHRcdFx0Zm4oc2NvcGUsIHtcblx0XHRcdFx0XHRcdCRmaWxlcyA6IGZpbGVzLFxuXHRcdFx0XHRcdFx0JGV2ZW50IDogZXZ0XG5cdFx0XHRcdFx0fSk7XHRcdFx0XHRcdFxuXHRcdFx0XHR9KTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0ZnVuY3Rpb24gaXNBU0NJSShzdHIpIHtcblx0XHRcdFx0cmV0dXJuIC9eW1xcMDAwLVxcMTc3XSokLy50ZXN0KHN0cik7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGV4dHJhY3RGaWxlcyhldnQsIGNhbGxiYWNrKSB7XG5cdFx0XHRcdHZhciBmaWxlcyA9IFtdLCBpdGVtcyA9IGV2dC5kYXRhVHJhbnNmZXIuaXRlbXM7XG5cdFx0XHRcdGlmIChpdGVtcyAmJiBpdGVtcy5sZW5ndGggPiAwICYmIGl0ZW1zWzBdLndlYmtpdEdldEFzRW50cnkgJiYgJGxvY2F0aW9uLnByb3RvY29sKCkgIT0gJ2ZpbGUnICYmIFxuXHRcdFx0XHRcdFx0aXRlbXNbMF0ud2Via2l0R2V0QXNFbnRyeSgpLmlzRGlyZWN0b3J5KSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFyIGVudHJ5ID0gaXRlbXNbaV0ud2Via2l0R2V0QXNFbnRyeSgpO1xuXHRcdFx0XHRcdFx0aWYgKGVudHJ5ICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0Ly9maXggZm9yIGNocm9tZSBidWcgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTE0OTczNVxuXHRcdFx0XHRcdFx0XHRpZiAoaXNBU0NJSShlbnRyeS5uYW1lKSkge1xuXHRcdFx0XHRcdFx0XHRcdHRyYXZlcnNlRmlsZVRyZWUoZmlsZXMsIGVudHJ5KTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmICghaXRlbXNbaV0ud2Via2l0R2V0QXNFbnRyeSgpLmlzRGlyZWN0b3J5KSB7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZXMucHVzaChpdGVtc1tpXS5nZXRBc0ZpbGUoKSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFyIGZpbGVMaXN0ID0gZXZ0LmRhdGFUcmFuc2Zlci5maWxlcztcblx0XHRcdFx0XHRpZiAoZmlsZUxpc3QgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlTGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRmaWxlcy5wdXNoKGZpbGVMaXN0Lml0ZW0oaSkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQoZnVuY3Rpb24gd2FpdEZvclByb2Nlc3MoZGVsYXkpIHtcblx0XHRcdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmICghcHJvY2Vzc2luZykge1xuXHRcdFx0XHRcdFx0XHRjYWxsYmFjayhmaWxlcyk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR3YWl0Rm9yUHJvY2VzcygxMCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSwgZGVsYXkgfHwgMClcblx0XHRcdFx0fSkoKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dmFyIHByb2Nlc3NpbmcgPSAwO1xuXHRcdFx0ZnVuY3Rpb24gdHJhdmVyc2VGaWxlVHJlZShmaWxlcywgZW50cnksIHBhdGgpIHtcblx0XHRcdFx0aWYgKGVudHJ5ICE9IG51bGwpIHtcblx0XHRcdFx0XHRpZiAoZW50cnkuaXNEaXJlY3RvcnkpIHtcblx0XHRcdFx0XHRcdHZhciBkaXJSZWFkZXIgPSBlbnRyeS5jcmVhdGVSZWFkZXIoKTtcblx0XHRcdFx0XHRcdHByb2Nlc3NpbmcrKztcblx0XHRcdFx0XHRcdGRpclJlYWRlci5yZWFkRW50cmllcyhmdW5jdGlvbihlbnRyaWVzKSB7XG5cdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdHRyYXZlcnNlRmlsZVRyZWUoZmlsZXMsIGVudHJpZXNbaV0sIChwYXRoID8gcGF0aCA6IFwiXCIpICsgZW50cnkubmFtZSArIFwiL1wiKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRwcm9jZXNzaW5nLS07XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cHJvY2Vzc2luZysrO1xuXHRcdFx0XHRcdFx0ZW50cnkuZmlsZShmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRcdFx0XHRcdHByb2Nlc3NpbmctLTtcblx0XHRcdFx0XHRcdFx0ZmlsZS5fcmVsYXRpdmVQYXRoID0gKHBhdGggPyBwYXRoIDogXCJcIikgKyBmaWxlLm5hbWU7XG5cdFx0XHRcdFx0XHRcdGZpbGVzLnB1c2goZmlsZSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG59IF0pO1xuXG59KSgpO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0NvbXBvbmVudERldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgY29tcG9uZW50U2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgY29udGV4dCA9IHt9LFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0ge30sXHJcbiAgICAgICAgICAgIGNvbm5lY3RvcnMgPSB7fSxcclxuICAgICAgICAgICAgcG9ydHMgPSB7fTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NvbXBvbmVudERldGFpbHNDb250cm9sbGVyJyk7XHJcbiAgICAgICAgJHNjb3BlLmluaXQgPSBmdW5jdGlvbiAoY29ubmVjdGlvbklkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdDb21wb25lbnREZXRhaWxzXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEZXN0cm95aW5nIDonLCBjb250ZXh0LnJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiBjb25uZWN0b3JzLFxyXG4gICAgICAgICAgICAgICAgcG9ydHM6IHBvcnRzXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcihjb250ZXh0LCBmdW5jdGlvbiAoZGVzdHJveSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdG9yczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgcG9ydHM6IHt9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGRlc3Ryb3kpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1RPRE86IG5vdGlmeSB1c2VyXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdDb21wb25lbnREZXRhaWxzQ29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaEludGVyZmFjZXMoY29udGV4dCwgJHNjb3BlLmNvbXBvbmVudElkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU2luY2Ugd2F0Y2hJbnRlcmZhY2VzIGtlZXBzIHRoZSBkYXRhIHVwLXRvLWRhdGUgdGhlcmUgc2hvdWxkbid0IGJlIGEgbmVlZCB0byBkbyBhbnlcclxuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGVzIGhlcmUuLlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3YXRjaEludGVyZmFjZXMnLCB1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY29tcG9uZW50SW50ZXJmYWNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wcm9wZXJ0aWVzID0gY29tcG9uZW50SW50ZXJmYWNlcy5wcm9wZXJ0aWVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5jb25uZWN0b3JzID0gY29tcG9uZW50SW50ZXJmYWNlcy5jb25uZWN0b3JzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wb3J0cyA9IGNvbXBvbmVudEludGVyZmFjZXMucG9ydHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgnY29tcG9uZW50RGV0YWlscycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudElkOiAnPWNvbXBvbmVudElkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXF1aXJlOiAnXmNvbXBvbmVudExpc3QnLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIsIGNvbXBvbmV0TGlzdENvbnRyb2xsZXIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0aW9uSWQgPSBjb21wb25ldExpc3RDb250cm9sbGVyLmdldENvbm5lY3Rpb25JZCgpO1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuaW5pdChjb25uZWN0aW9uSWQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9JbnRlcmZhY2VEZXRhaWxzLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ29tcG9uZW50RGV0YWlsc0NvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdDb21wb25lbnRMaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICR3aW5kb3csICRtb2RhbCwgZ3Jvd2wsIGNvbXBvbmVudFNlcnZpY2UsIGZpbGVTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgaXRlbXMgPSBbXSwgICAgICAgICAgICAgLy8gSXRlbXMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZSBpdGVtLWxpc3QgdWktY29tcG9uZW50LlxyXG4gICAgICAgICAgICBjb21wb25lbnRJdGVtcyA9IHt9LCAgICAvLyBTYW1lIGl0ZW1zIGFyZSBzdG9yZWQgaW4gYSBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSxcclxuICAgICAgICAgICAgYWRkRG9tYWluV2F0Y2hlcixcclxuICAgICAgICAgICAgY29uZmlnLFxyXG4gICAgICAgICAgICBjb250ZXh0O1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnQ29tcG9uZW50TGlzdENvbnRyb2xsZXInLCAkc2NvcGUuYXZtSWRzKTtcclxuICAgICAgICB0aGlzLmdldENvbm5lY3Rpb25JZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRzY29wZS5jb25uZWN0aW9uSWQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBDaGVjayBmb3IgdmFsaWQgY29ubmVjdGlvbklkIGFuZCByZWdpc3RlciBjbGVhbi11cCBvbiBkZXN0cm95IGV2ZW50LlxyXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdDb21wb25lbnRMaXN0Q29udHJvbGxlcl8nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBpdGVtIGxpc3QgdWkgY29tcG9uZW50LlxyXG4gICAgICAgIGNvbmZpZyA9IHtcclxuXHJcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2Vjb25kYXJ5SXRlbU1lbnU6IHRydWUsXHJcbiAgICAgICAgICAgIGRldGFpbHNDb2xsYXBzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXHJcbiAgICAgICAgICAgIGhpZGVEZXRhaWxzTGFiZWw6ICdIaWRlIGRldGFpbHMnLFxyXG5cclxuICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Tb3J0OiBmdW5jdGlvbiAoalFFdmVudCwgdWkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNsaWNrOiBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kZW1pdCgnc2VsZWN0ZWRJbnN0YW5jZXMnLCB7bmFtZTogaXRlbS50aXRsZSwgaWRzOiBpdGVtLmRhdGEuaW5zdGFuY2VJZHN9KTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Db250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoZSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuSW5FZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD1BRE1FZGl0b3ImYWN0aXZlT2JqZWN0PScgKyBpdGVtLmlkLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2VkaXRDb21wb25lbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7ZGVzY3JpcHRpb246IGl0ZW0uZGVzY3JpcHRpb24sIGlkOiBpdGVtLmlkfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlZGl0Q29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYjogY29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hDb21wb25lbnRzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvQ29tcG9uZW50RWRpdC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQ29tcG9uZW50RWRpdENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vc2l6ZTogc2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7IGRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKGVkaXRlZERhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhdHRycyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSU5GTyc6IGVkaXRlZERhdGEuZGVzY3JpcHRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLnNldENvbXBvbmVudEF0dHJpYnV0ZXMoZWRpdENvbnRleHQsIGRhdGEuaWQsIGF0dHJzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0F0dHJpYnV0ZSB1cGRhdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2V4cG9ydEFzQWNtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0V4cG9ydCBBQ00nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXNoYXJlLWFsdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge3Jlc291cmNlOiBpdGVtLmRhdGEucmVzb3VyY2UsIG5hbWU6IGl0ZW0udGl0bGV9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhhc2ggPSBkYXRhLnJlc291cmNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gZmlsZVNlcnZpY2UuZ2V0RG93bmxvYWRVcmwoaGFzaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cmwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoJ0FDTSBmaWxlIGZvciA8YSBocmVmPVwiJyArIHVybCArICdcIj4nICsgZGF0YS5uYW1lICsgJzwvYT4gZXhwb3J0ZWQuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC53YXJuaW5nKGRhdGEubmFtZSArICcgZG9lcyBub3QgaGF2ZSBhIHJlc291cmNlLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHsgaWQ6IGl0ZW0uaWQsIG5hbWU6IGl0ZW0udGl0bGUgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvU2ltcGxlTW9kYWwuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2ltcGxlTW9kYWxDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZSBDb21wb25lbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogJ1RoaXMgd2lsbCBkZWxldGUgJyArIGRhdGEubmFtZSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBmcm9tIHRoZSB3b3Jrc3BhY2UuJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2UuZGVsZXRlQ29tcG9uZW50KGNvbnRleHQsIGRhdGEuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBkZXRhaWxzUmVuZGVyZXI6IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBpdGVtLmRldGFpbHMgPSAnTXkgZGV0YWlscyBhcmUgaGVyZSBub3chJztcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGZpbHRlcjoge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XHJcbiAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xyXG4gICAgICAgICAgICBpdGVtczogaXRlbXNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBUcmFuc2Zvcm0gdGhlIHJhdyBzZXJ2aWNlIG5vZGUgZGF0YSB0byBpdGVtcyBmb3IgdGhlIGxpc3QuXHJcbiAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0gPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgbGlzdEl0ZW07XHJcblxyXG4gICAgICAgICAgICBpZiAoY29tcG9uZW50SXRlbXMuaGFzT3duUHJvcGVydHkoZGF0YS5pZCkpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtID0gY29tcG9uZW50SXRlbXNbZGF0YS5pZF07XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS50aXRsZSA9IGRhdGEubmFtZTtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRhdGEucmVzb3VyY2UgPSBkYXRhLnJlc291cmNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAkc2NvcGUuYXZtSWRzID8gJ0hpZ2hsaWdodCBpbnN0YW5jZXMnIDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTogJ04vQScsICAgLy8gVE9ETzogZ2V0IHRoaXMgaW4gdGhlIGZ1dHVyZS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogJ04vQScgICAgLy8gVE9ETzogZ2V0IHRoaXMgaW4gdGhlIGZ1dHVyZS5cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzOiBbIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogJ0NvbnRlbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHNUZW1wbGF0ZVVybDogJ2NvbXBvbmVudERldGFpbHMuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogeyByZXNvdXJjZTogZGF0YS5yZXNvdXJjZSB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hdm1JZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbS5kYXRhLmluc3RhbmNlSWRzID0gJHNjb3BlLmF2bUlkc1tkYXRhLmF2bUlkXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgbGlzdC1pdGVtIHRvIHRoZSBpdGVtcyBsaXN0IGFuZCB0aGUgZGljdGlvbmFyeS5cclxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2gobGlzdEl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50SXRlbXNbbGlzdEl0ZW0uaWRdID0gbGlzdEl0ZW07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBhZGREb21haW5XYXRjaGVyID0gZnVuY3Rpb24gKGNvbXBvbmVudElkKSB7XHJcbiAgICAgICAgICAgIHZhciBkb21haW5Nb2RlbHNUb1N0YXQgPSBmdW5jdGlvbiAoZG9tYWluTW9kZWxzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhdHMgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbE1hcCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ0FEOiB7IHZhbHVlOiAwLCB0b29sVGlwOiAnQ0FEJywgaWNvbkNsYXNzOiAnZmEgZmEtY29kZXBlbicgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ3liZXI6IHsgdmFsdWU6IDAsIHRvb2xUaXA6ICdDeWJlcicsIGljb25DbGFzczogJ2ZhIGZhLWxhcHRvcCcgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWFudWZhY3R1cmluZzogeyB2YWx1ZTogMCwgdG9vbFRpcDogJ01hbnVmYWN0dXJpbmcnLCBpY29uQ2xhc3M6ICdmYSBmYS13cmVuY2gnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1vZGVsaWNhOiB7IHZhbHVlOiAwLCB0b29sVGlwOiAnTW9kZWxpY2EnLCBpY29uQ2xhc3M6ICdmYSBmYS1nZWFycycgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAga2V5O1xyXG4gICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gZG9tYWluTW9kZWxzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbWFpbk1vZGVscy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYWJlbE1hcFtkb21haW5Nb2RlbHNba2V5XS50eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxNYXBbZG9tYWluTW9kZWxzW2tleV0udHlwZV0udmFsdWUgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuZXhwZWN0ZWQgZG9tYWluLW1vZGVsIHR5cGUnLCBkb21haW5Nb2RlbHNba2V5XS50eXBlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGxhYmVsTWFwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhYmVsTWFwLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhYmVsTWFwW2tleV0udmFsdWUgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0cy5wdXNoKGxhYmVsTWFwW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRzO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERvbWFpbnMoY29udGV4dCwgY29tcG9uZW50SWQsIGZ1bmN0aW9uICh1cGRhdGVEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGlzdEl0ZW0gPSBjb21wb25lbnRJdGVtc1tjb21wb25lbnRJZF07XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRG9tYWluTW9kZWxzIHVwZGF0ZWQsIGV2ZW50IHR5cGU6JywgdXBkYXRlRGF0YS50eXBlKTtcclxuICAgICAgICAgICAgICAgIGlmIChsaXN0SXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzID0gZG9tYWluTW9kZWxzVG9TdGF0KHVwZGF0ZURhdGEuZG9tYWluTW9kZWxzKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdEb21haW5Nb2RlbCBkYXRhIGRpZCBub3QgaGF2ZSBtYXRjaGluZyBjb21wb25lbnREYXRhJywgY29tcG9uZW50SWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGlzdEl0ZW0gPSBjb21wb25lbnRJdGVtc1tjb21wb25lbnRJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpc3RJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzID0gZG9tYWluTW9kZWxzVG9TdGF0KGRhdGEuZG9tYWluTW9kZWxzKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0RvbWFpbk1vZGVsIGRhdGEgZGlkIG5vdCBoYXZlIG1hdGNoaW5nIGNvbXBvbmVudERhdGEnLCBjb21wb25lbnRJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29tcG9uZW50U2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xyXG4gICAgICAgICAgICAkc2NvcGUubGlzdERhdGEuaXRlbXMgPSBpdGVtcztcclxuICAgICAgICAgICAgY29tcG9uZW50SXRlbXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignZGVzdHJveSBldmVudCByYWlzZWQnKTtcclxuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGRpc3BsYXkgdGhpcyB0byB0aGUgdXNlci5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ2luaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcblxyXG4gICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLndhdGNoQ29tcG9uZW50cyhjb250ZXh0LCAkc2NvcGUud29ya3NwYWNlSWQsICRzY29wZS5hdm1JZHMsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleDtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBhZGREb21haW5XYXRjaGVyKHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudEl0ZW1zLmhhc093blByb3BlcnR5KHVwZGF0ZU9iamVjdC5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpdGVtcy5tYXAoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5pbmRleE9mKHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbXBvbmVudERvbWFpbnNfJyArIHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjb21wb25lbnRJdGVtc1t1cGRhdGVPYmplY3QuaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRJZDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbXBvbmVudElkIGluIGRhdGEuY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb21wb25lbnRzLmhhc093blByb3BlcnR5KGNvbXBvbmVudElkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0oZGF0YS5jb21wb25lbnRzW2NvbXBvbmVudElkXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGREb21haW5XYXRjaGVyKGNvbXBvbmVudElkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5jb250cm9sbGVyKCdDb21wb25lbnRFZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCBkYXRhKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgICRzY29wZS5kYXRhID0ge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoJHNjb3BlLmRhdGEpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoJ2NhbmNlbCcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgnY29tcG9uZW50TGlzdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUlkOiAnPXdvcmtzcGFjZUlkJyxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25JZDogJz1jb25uZWN0aW9uSWQnLFxyXG4gICAgICAgICAgICAgICAgYXZtSWRzOiAnPWF2bUlkcydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvQ29tcG9uZW50TGlzdC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbXBvbmVudExpc3RDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdDb25maWd1cmF0aW9uU2V0U2VsZWN0b3JDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgZ3Jvd2wsIGRlc2lnblNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIGNvbnRleHQsXHJcbiAgICAgICAgICAgIHNwYXduZWRDb25maWd1cmF0aW9uUmVnaW9ucyA9IFtdO1xyXG4gICAgICAgICRzY29wZS5kYXRhTW9kZWwgPSB7XHJcbiAgICAgICAgICAgIGRhdGFBdmFsaWFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uU2V0czoge31cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAoJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCRzY29wZS5jb25uZWN0aW9uSWQpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnQ29uZmlndXJhdGlvblNldFNlbGVjdG9yQ29udHJvbGxlcl8nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnJGRlc3Ryb3llZCAnICsgY29udGV4dC5yZWdpb25JZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGVzaWduU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVsLmRhdGFBdmFsaWFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbC5jb25maWd1cmF0aW9uU2V0cyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdkZXN0cm95IGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoQ29uZmlndXJhdGlvblNldHMoY29udGV4dCwgJHNjb3BlLmRlc2lnbklkLCBmdW5jdGlvbiAodXBkYXRlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVsLmRhdGFBdmFsaWFibGUgPSBPYmplY3Qua2V5cyh1cGRhdGVPYmplY3QuZGF0YS5jb25maWd1cmF0aW9uU2V0cykubGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbC5jb25maWd1cmF0aW9uU2V0cyA9IGRhdGEuY29uZmlndXJhdGlvblNldHM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbC5kYXRhQXZhbGlhYmxlID0gT2JqZWN0LmtleXMoZGF0YS5jb25maWd1cmF0aW9uU2V0cykubGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkc2NvcGUubG9hZENvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKHNldElkLCBzZXROYW1lKSB7XHJcbiAgICAgICAgICAgIHZhciBpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHNwYXduZWRDb25maWd1cmF0aW9uUmVnaW9ucy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwUmVnaW9uKGNvbnRleHQsIHNwYXduZWRDb25maWd1cmF0aW9uUmVnaW9uc1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3Bhd25lZENvbmZpZ3VyYXRpb25SZWdpb25zID0gW107XHJcbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hDb25maWd1cmF0aW9ucyhjb250ZXh0LCBzZXRJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBzcGF3bmVkQ29uZmlndXJhdGlvblJlZ2lvbnMucHVzaChkYXRhLnJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBkYXRhLmNvbmZpZ3VyYXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvbmZpZ3VyYXRpb25zLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9IGRhdGEuY29uZmlndXJhdGlvbnNba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjb25maWcuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbmZpZy5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiBKU09OLnBhcnNlKGNvbmZpZy5hbHRlcm5hdGl2ZUFzc2lnbm1lbnRzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcignQ29uZmlndXJhdGlvbiAnICsgY29uZmlnLm5hbWUgKyAnIGhhZCBpbnZhbGlkIGF0dHJpYnV0ZS4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgcGFyc2UnLCBjb25maWcuYWx0ZXJuYXRpdmVBc3NpZ25tZW50cywgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kZW1pdCgnY29uZmlndXJhdGlvbnNMb2FkZWQnLCB7Y29uZmlndXJhdGlvbnM6IGNvbmZpZ3VyYXRpb25zLCBzZXROYW1lOiBzZXROYW1lfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2NvbmZpZ3VyYXRpb25TZXRTZWxlY3RvcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIGRlc2lnbklkOiAnPWRlc2lnbklkJyxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25JZDogJz1jb25uZWN0aW9uSWQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0NvbmZpZ3VyYXRpb25TZXRTZWxlY3Rvci5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbmZpZ3VyYXRpb25TZXRTZWxlY3RvckNvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0NvbmZpZ3VyYXRpb25UYWJsZUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBncm93bCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICAkc2NvcGUuZGF0YU1vZGVsID0ge1xyXG4gICAgICAgICAgICBjaGFuZ2VJbmZvOiBbXSxcclxuICAgICAgICAgICAgc2VsZWN0ZWQ6IFtdLFxyXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uczogJHNjb3BlLmNvbmZpZ3VyYXRpb25zLFxyXG4gICAgICAgICAgICBzZXROYW1lOiAkc2NvcGUuc2V0TmFtZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS50YWJsZUNvbHVtbkRlZmluaXRpb24gPSBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbHVtbkhlYWRlckRpc3BsYXlOYW1lOiAnTmFtZScsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RhYmxlQ2VsbC5odG1sJyxcclxuICAgICAgICAgICAgICAgIHNvcnRLZXk6ICduYW1lJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbignZXhwb3NlU2VsZWN0aW9uJywgZnVuY3Rpb24gKGV2ZW50LCB0eXBlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS4kZW1pdCgnc2VsZWN0aW9uRXhwb3NlZCcsICRzY29wZS5kYXRhTW9kZWwuc2VsZWN0ZWQsIHR5cGUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkc2NvcGUuY2ZnQ2xpY2tlZCA9IGZ1bmN0aW9uIChjZmcpIHtcclxuICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCdjb25maWd1cmF0aW9uQ2xpY2tlZCcsIGNmZyk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCdjb25maWd1cmF0aW9uVGFibGUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uczogJz1jb25maWd1cmF0aW9ucycsXHJcbiAgICAgICAgICAgICAgICBzZXROYW1lOiAnPXNldE5hbWUnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0NvbmZpZ3VyYXRpb25UYWJsZS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbmZpZ3VyYXRpb25UYWJsZUNvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignRGVzaWduRGV0YWlsc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBkZXNpZ25TZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0ge30sXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fSxcclxuICAgICAgICAgICAgY29ubmVjdG9ycyA9IHt9LFxyXG4gICAgICAgICAgICBwb3J0cyA9IHt9O1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnRGVzaWduRGV0YWlsc0NvbnRyb2xsZXInKTtcclxuICAgICAgICAkc2NvcGUuaW5pdCA9IGZ1bmN0aW9uIChjb25uZWN0aW9uSWQpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogJ0Rlc2lnbkRldGFpbHNfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Rlc3Ryb3lpbmcgOicsIGNvbnRleHQucmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICRzY29wZS5kZXRhaWxzID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogcHJvcGVydGllcyxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IGNvbm5lY3RvcnMsXHJcbiAgICAgICAgICAgICAgICBwb3J0czogcG9ydHNcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGRlc2lnblNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95KSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICBwb3J0czoge31cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVzdHJveSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vVE9ETzogbm90aWZ5IHVzZXJcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ0Rlc2lnbkRldGFpbHNDb250cm9sbGVyIC0gaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoSW50ZXJmYWNlcyhjb250ZXh0LCAkc2NvcGUuZGVzaWduSWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSB3YXRjaEludGVyZmFjZXMga2VlcHMgdGhlIGRhdGEgdXAtdG8tZGF0ZSB0aGVyZSBzaG91bGRuJ3QgYmUgYSBuZWVkIHRvIGRvIGFueVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZXMgaGVyZS4uXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhdGNoSW50ZXJmYWNlcycsIHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkZXNpZ25JbnRlcmZhY2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLnByb3BlcnRpZXMgPSBkZXNpZ25JbnRlcmZhY2VzLnByb3BlcnRpZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLmNvbm5lY3RvcnMgPSBkZXNpZ25JbnRlcmZhY2VzLmNvbm5lY3RvcnM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLnBvcnRzID0gZGVzaWduSW50ZXJmYWNlcy5wb3J0cztcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCdkZXNpZ25EZXRhaWxzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduSWQ6ICc9ZGVzaWduSWQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcXVpcmU6ICdeZGVzaWduTGlzdCcsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0ciwgZGVzaWduTGlzdENvbnRyb2xsZXIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0aW9uSWQgPSBkZXNpZ25MaXN0Q29udHJvbGxlci5nZXRDb25uZWN0aW9uSWQoKTtcclxuICAgICAgICAgICAgICAgIHNjb3BlLmluaXQoY29ubmVjdGlvbklkKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvSW50ZXJmYWNlRGV0YWlscy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rlc2lnbkRldGFpbHNDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgZG9jdW1lbnQsIHJlcXVpcmUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignRGVzaWduTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkd2luZG93LCAkbG9jYXRpb24sICRtb2RhbCwgZGVzaWduU2VydmljZSwgZ3Jvd2wpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBpdGVtcyA9IFtdLCAgICAgICAgICAgICAvLyBJdGVtcyB0aGF0IGFyZSBwYXNzZWQgdG8gdGhlIGl0ZW0tbGlzdCB1aS1jb21wb25lbnQuXHJcbiAgICAgICAgICAgIGRlc2lnbkl0ZW1zID0ge30sICAgICAgIC8vIFNhbWUgaXRlbXMgYXJlIHN0b3JlZCBpbiBhIGRpY3Rpb25hcnkuXHJcbiAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtLFxyXG4gICAgICAgICAgICBjb25maWcsXHJcbiAgICAgICAgICAgIGFkZENvbmZpZ3VyYXRpb25XYXRjaGVyLFxyXG4gICAgICAgICAgICBjb250ZXh0LFxyXG4gICAgICAgICAgICBpdGVtQ2xpY2tGbixcclxuICAgICAgICAgICAgaXRlbUNsaWNrVGlwO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnRGVzaWduTGlzdENvbnRyb2xsZXInKTtcclxuICAgICAgICB0aGlzLmdldENvbm5lY3Rpb25JZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRzY29wZS5jb25uZWN0aW9uSWQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBDaGVjayBmb3IgdmFsaWQgY29ubmVjdGlvbklkIGFuZCByZWdpc3RlciBjbGVhbi11cCBvbiBkZXN0cm95IGV2ZW50LlxyXG4gICAgICAgIGlmICgkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoJHNjb3BlLmNvbm5lY3Rpb25JZCkpIHtcclxuICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdEZXNpZ25MaXN0Q29udHJvbGxlcl8nICsgKG5ldyBEYXRlKCkpLnRvSVNPU3RyaW5nKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyBDb25maWd1cmF0aW9uIGZvciB0aGUgaXRlbSBsaXN0IHVpIGNvbXBvbmVudC5cclxuICAgICAgICBjb25maWcgPSB7XHJcblxyXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxyXG4gICAgICAgICAgICBkZXRhaWxzQ29sbGFwc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNob3dEZXRhaWxzTGFiZWw6ICdTaG93IGRldGFpbHMnLFxyXG4gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcclxuXHJcbiAgICAgICAgICAgIC8vIEV2ZW50IGhhbmRsZXJzXHJcblxyXG4gICAgICAgICAgICBpdGVtU29ydDogZnVuY3Rpb24gKGpRRXZlbnQsIHVpKSB7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgaXRlbUNsaWNrOiBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdVcmwgPSAnL2Rlc2lnblNwYWNlLycgKyAkc2NvcGUud29ya3NwYWNlSWQucmVwbGFjZSgvXFwvL2csICctJykgKyAnLycgKyBpdGVtLmlkLnJlcGxhY2UoL1xcLy9nLCAnLScpO1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgobmV3VXJsKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Db250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoZSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuSW5FZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD1BRE1FZGl0b3ImYWN0aXZlT2JqZWN0PScgKyBpdGVtLmlkLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2VkaXREZXNpZ24nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRWRpdCBBdHRyaWJ1dGVzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBpdGVtLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYjogY29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaERlc2lnbnMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZGVzaWduU2VydmljZS5lZGl0RGVzaWduRm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdzZXRBc1RvcExldmVsU3lzdGVtVW5kZXJUZXN0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1NldCBhcyBUTFNVVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6ICEkc2NvcGUudXNlZEJ5VGVzdEJlbmNoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLWFycm93LWNpcmNsZS1yaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge2lkOiBpdGVtLmlkLCBuYW1lOiBpdGVtLnRpdGxlfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbGRUbHN1dCA9IGRlc2lnbkl0ZW1zWyRzY29wZS5zdGF0ZS50bHN1dElkXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLnRsc3V0SWQgPSBkYXRhLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGVtaXQoJ3RvcExldmVsU3lzdGVtVW5kZXJUZXN0U2V0JywgaXRlbSwgb2xkVGxzdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc0FkbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeHBvcnQgQURNJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZGVzaWduU2VydmljZS5leHBvcnRBc0FkbUZuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2RlbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBkZXNpZ25TZXJ2aWNlLmRlbGV0ZUZuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaXRlbS5kZXRhaWxzID0gJ015IGRldGFpbHMgYXJlIGhlcmUgbm93ISc7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBmaWx0ZXI6IHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcclxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnN0YXRlID0ge1xyXG4gICAgICAgICAgICB0bHN1dElkOiBudWxsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLiRvbigndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RDaGFuZ2VkJywgZnVuY3Rpb24gKGV2ZW50LCBpZCkge1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLnN0YXRlLnRsc3V0SWQgJiYgZGVzaWduSXRlbXMuaGFzT3duUHJvcGVydHkoJHNjb3BlLnN0YXRlLnRsc3V0SWQpKSB7XHJcbiAgICAgICAgICAgICAgICBkZXNpZ25JdGVtc1skc2NvcGUuc3RhdGUudGxzdXRJZF0uY3NzQ2xhc3MgPSAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUudGxzdXRJZCA9IGlkO1xyXG4gICAgICAgICAgICBpZiAoZGVzaWduSXRlbXMuaGFzT3duUHJvcGVydHkoaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBkZXNpZ25JdGVtc1tpZF0uY3NzQ2xhc3MgPSAndG9wLWxldmVsLXN5c3RlbS11bmRlci10ZXN0JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBUcmFuc2Zvcm0gdGhlIHJhdyBzZXJ2aWNlIG5vZGUgZGF0YSB0byBpdGVtcyBmb3IgdGhlIGxpc3QuXHJcbiAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0gPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgbGlzdEl0ZW07XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzaWduSXRlbXMuaGFzT3duUHJvcGVydHkoZGF0YS5pZCkpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtID0gZGVzaWduSXRlbXNbZGF0YS5pZF07XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS50aXRsZSA9IGRhdGEubmFtZTtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ09wZW4gRGVzaWduIFNwYWNlIFZpZXcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAkc2NvcGUuc3RhdGUudGxzdXRJZCA9PT0gZGF0YS5pZCA/ICd0b3AtbGV2ZWwtc3lzdGVtLXVuZGVyLXRlc3QnIDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTogJ04vQScsICAgLy8gVE9ETzogZ2V0IHRoaXMgaW4gdGhlIGZ1dHVyZS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogJ04vQScgICAgLy8gVE9ETzogZ2V0IHRoaXMgaW4gdGhlIGZ1dHVyZS5cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ0NvbmZpZ3VyYXRpb24gU2V0cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXRoLWxhcmdlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdDb25maWd1cmF0aW9ucycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXRoJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdSZXN1bHRzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc3RhdHMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHMgICAgOiAnQ29udGVudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsc1RlbXBsYXRlVXJsOiAnZGVzaWduRGV0YWlscy5odG1sJ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgbGlzdC1pdGVtIHRvIHRoZSBpdGVtcyBsaXN0IGFuZCB0aGUgZGljdGlvbmFyeS5cclxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2gobGlzdEl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgZGVzaWduSXRlbXNbbGlzdEl0ZW0uaWRdID0gbGlzdEl0ZW07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBhZGRDb25maWd1cmF0aW9uV2F0Y2hlciA9IGZ1bmN0aW9uIChkZXNpZ25JZCkge1xyXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoTmJyT2ZDb25maWd1cmF0aW9ucyhjb250ZXh0LCBkZXNpZ25JZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpc3RJdGVtID0gZGVzaWduSXRlbXNbZGVzaWduSWRdO1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyh1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHNbMF0udmFsdWUgPSB1cGRhdGVPYmplY3QuZGF0YS5jb3VudGVycy5zZXRzO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHNbMV0udmFsdWUgPSB1cGRhdGVPYmplY3QuZGF0YS5jb3VudGVycy5jb25maWd1cmF0aW9ucztcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzWzJdLnZhbHVlID0gdXBkYXRlT2JqZWN0LmRhdGEuY291bnRlcnMucmVzdWx0cztcclxuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpc3RJdGVtID0gZGVzaWduSXRlbXNbZGVzaWduSWRdO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHNbMF0udmFsdWUgPSBkYXRhLmNvdW50ZXJzLnNldHM7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0c1sxXS52YWx1ZSA9IGRhdGEuY291bnRlcnMuY29uZmlndXJhdGlvbnM7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0c1syXS52YWx1ZSA9IGRhdGEuY291bnRlcnMucmVzdWx0cztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZGVzaWduU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xyXG4gICAgICAgICAgICAkc2NvcGUubGlzdERhdGEuaXRlbXMgPSBpdGVtcztcclxuICAgICAgICAgICAgZGVzaWduSXRlbXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignZGVzdHJveSBldmVudCByYWlzZWQnKTtcclxuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGRpc3BsYXkgdGhpcyB0byB0aGUgdXNlci5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ2luaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcblxyXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWducyhjb250ZXh0LCAkc2NvcGUud29ya3NwYWNlSWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleDtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBhZGRDb25maWd1cmF0aW9uV2F0Y2hlcih1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndW5sb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXNpZ25JdGVtcy5oYXNPd25Qcm9wZXJ0eSh1cGRhdGVPYmplY3QuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaXRlbXMubWFwKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuaW5kZXhPZih1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOYnJPZkNvbmZpZ3VyYXRpb25zXycgKyB1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGVzaWduSXRlbXNbdXBkYXRlT2JqZWN0LmlkXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVzaWduSWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChkZXNpZ25JZCBpbiBkYXRhLmRlc2lnbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuZGVzaWducy5oYXNPd25Qcm9wZXJ0eShkZXNpZ25JZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKGRhdGEuZGVzaWduc1tkZXNpZ25JZF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkQ29uZmlndXJhdGlvbldhdGNoZXIoZGVzaWduSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgLmNvbnRyb2xsZXIoJ0Rlc2lnbkVkaXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIGRhdGEpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICBuYW1lOiBkYXRhLm5hbWVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUub2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCRzY29wZS5kYXRhKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCdjYW5jZWwnKTtcclxuICAgICAgICB9O1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ2Rlc2lnbkxpc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJZDogJz13b3Jrc3BhY2VJZCcsXHJcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJyxcclxuICAgICAgICAgICAgICAgIHVzZWRCeVRlc3RCZW5jaDogJz11c2VkQnlUZXN0QmVuY2gnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0Rlc2lnbkxpc3QuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEZXNpZ25MaXN0Q29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCwgcmVxdWlyZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICovXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuY29tcG9uZW50cycpXHJcbiAgICAuY29udHJvbGxlcignRGVzaWduVHJlZUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkd2luZG93LCBkZXNpZ25TZXJ2aWNlLCBkZXNlcnRTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBjb250ZXh0LFxyXG4gICAgICAgICAgICBjb25maWcsXHJcbiAgICAgICAgICAgIHRyZWVEYXRhLFxyXG4gICAgICAgICAgICByb290Tm9kZSxcclxuICAgICAgICAgICAgYXZtSWRzID0ge30sXHJcbiAgICAgICAgICAgIGJ1aWxkVHJlZVN0cnVjdHVyZTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0Rlc2lnblRyZWVDb250cm9sbGVyJyk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0Rlc2lnblRyZWVDb250cm9sbGVyXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICBub2RlQ29udGV4dG1lbnVSZW5kZXJlcjogZnVuY3Rpb24gKGUsIG5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NyZWF0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tZWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtpZDogbm9kZS5pZH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbignLz9wcm9qZWN0PUFETUVkaXRvciZhY3RpdmVPYmplY3Q9JyArIGRhdGEuaWQsICdfYmxhbmsnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICB9XTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbm9kZUNsaWNrOiBmdW5jdGlvbiAoIGUsIG5vZGUgKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ05vZGUgd2FzIGNsaWNrZWQ6Jywgbm9kZSwgJHNjb3BlICk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRpc2FibGVNYW51YWxTZWxlY3Rpb246IHRydWUsXHJcbiAgICAgICAgICAgIGZvbGRlckljb25DbGFzczogJ2ZhIGZhLWN1YmVzJ1xyXG4vLyAgICAgICAgICAgIG5vZGVEYmxjbGljazogZnVuY3Rpb24gKCBlLCBub2RlICkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ05vZGUgd2FzIGRvdWJsZS1jbGlja2VkOicsIG5vZGUgKTtcclxuLy8gICAgICAgICAgICB9LFxyXG4vLyAgICAgICAgICAgIG5vZGVFeHBhbmRlckNsaWNrOiBmdW5jdGlvbiAoIGUsIG5vZGUsIGlzRXhwYW5kICkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ0V4cGFuZGVyIHdhcyBjbGlja2VkIGZvciBub2RlOicsIG5vZGUsIGlzRXhwYW5kICk7XHJcbi8vICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByb290Tm9kZSA9IHtcclxuICAgICAgICAgICAgaWQ6ICRzY29wZS5kZXNpZ25JZCxcclxuICAgICAgICAgICAgbGFiZWw6ICdMb2FkaW5nIERlc2lnbiBTcGFjZSBOb2Rlcy4uJyxcclxuICAgICAgICAgICAgZXh0cmFJbmZvOiAnJyxcclxuICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxyXG4gICAgICAgICAgICBjaGlsZHJlbkNvdW50OiAwXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdHJlZURhdGEgPSB7XHJcbiAgICAgICAgICAgIGlkOiAnJyxcclxuICAgICAgICAgICAgbGFiZWw6ICcnLFxyXG4gICAgICAgICAgICBleHRyYUluZm86ICcnLFxyXG4gICAgICAgICAgICB1bkNvbGxhcHNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICAgICAgcm9vdE5vZGVcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgY2hpbGRyZW5Db3VudDogMVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJHNjb3BlLmNvbmZpZyA9IGNvbmZpZztcclxuICAgICAgICAkc2NvcGUudHJlZURhdGEgPSB0cmVlRGF0YTtcclxuICAgICAgICAkc2NvcGUuJG9uKCdzZXRTZWxlY3RlZE5vZGVzJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jb25maWcuc3RhdGUuc2VsZWN0ZWROb2RlcyA9IGRhdGE7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGJ1aWxkVHJlZVN0cnVjdHVyZSA9IGZ1bmN0aW9uIChjb250YWluZXIsIHBhcmVudFRyZWVOb2RlKSB7XHJcbiAgICAgICAgICAgIHZhciBrZXksXHJcbiAgICAgICAgICAgICAgICBjaGlsZERhdGEsXHJcbiAgICAgICAgICAgICAgICB0cmVlTm9kZTtcclxuICAgICAgICAgICAgaWYgKHBhcmVudFRyZWVOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0cmVlTm9kZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBleHRyYUluZm86IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuQ291bnQ6IDBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBwYXJlbnRUcmVlTm9kZS5jaGlsZHJlbi5wdXNoKHRyZWVOb2RlKTtcclxuICAgICAgICAgICAgICAgIHBhcmVudFRyZWVOb2RlLmNoaWxkcmVuQ291bnQgKz0gMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRyZWVOb2RlID0gcm9vdE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJlZU5vZGUuaWQgPSBjb250YWluZXIuaWQ7XHJcbiAgICAgICAgICAgIHRyZWVOb2RlLmxhYmVsID0gY29udGFpbmVyLm5hbWU7XHJcbiAgICAgICAgICAgIHRyZWVOb2RlLmV4dHJhSW5mbyA9IGNvbnRhaW5lci50eXBlO1xyXG4gICAgICAgICAgICAkc2NvcGUuY29uZmlnLnN0YXRlLmV4cGFuZGVkTm9kZXMucHVzaCh0cmVlTm9kZS5pZCk7XHJcbiAgICAgICAgICAgIGZvciAoa2V5IGluIGNvbnRhaW5lci5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyLmNvbXBvbmVudHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRGF0YSA9IGNvbnRhaW5lci5jb21wb25lbnRzW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgdHJlZU5vZGUuY2hpbGRyZW4ucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZERhdGEuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBjaGlsZERhdGEubmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyZWVOb2RlLmNoaWxkcmVuQ291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXZtSWRzW2NoaWxkRGF0YS5hdm1JZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWRzW2NoaWxkRGF0YS5hdm1JZF0ucHVzaChjaGlsZERhdGEuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2bUlkc1tjaGlsZERhdGEuYXZtSWRdID0gW2NoaWxkRGF0YS5pZF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAoa2V5IGluIGNvbnRhaW5lci5zdWJDb250YWluZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyLnN1YkNvbnRhaW5lcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRGF0YSA9IGNvbnRhaW5lci5zdWJDb250YWluZXJzW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRUcmVlU3RydWN0dXJlKGNoaWxkRGF0YSwgdHJlZU5vZGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZGVzaWduU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xyXG5cclxuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaERlc2lnblN0cnVjdHVyZShjb250ZXh0LCAkc2NvcGUuZGVzaWduSWQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybih1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcm9vdENvbnRhaW5lciA9IGRhdGEuY29udGFpbmVyc1tkYXRhLnJvb3RJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2VydElucHV0RGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBidWlsZFRyZWVTdHJ1Y3R1cmUocm9vdENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCdkZXNpZ25UcmVlTG9hZGVkJywgYXZtSWRzKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRTogVGhpcyBwYXJ0IGlzIG9ubHkgaGVyZSB0byByZXVzZSB0aGUgZGF0YSBmcm9tIHdhdGNoRGVzaWduU3RydWN0dXJlLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IEZpbmQgYSBtb3JlIHN1aXRhYmxlIGxvY2F0aW9uLlxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2VydElucHV0RGF0YSA9IGRlc2VydFNlcnZpY2UuZ2V0RGVzZXJ0SW5wdXREYXRhKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kZW1pdCgnZGVzZXJ0SW5wdXRSZWFkeScsIGRlc2VydElucHV0RGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCdkZXNpZ25UcmVlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduSWQ6ICc9ZGVzaWduSWQnLFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvRGVzaWduVHJlZS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rlc2lnblRyZWVDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1NpbXBsZU1vZGFsQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCBkYXRhKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgICRzY29wZS5kYXRhID0ge1xyXG4gICAgICAgICAgICB0aXRsZTogZGF0YS50aXRsZSxcclxuICAgICAgICAgICAgZGV0YWlsczogZGF0YS5kZXRhaWxzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLm9rID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoJ2NhbmNlbCcpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1Rlc3RCZW5jaERldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgdGVzdEJlbmNoU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgY29udGV4dCA9IHt9LFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0ge30sXHJcbiAgICAgICAgICAgIGNvbm5lY3RvcnMgPSB7fSxcclxuICAgICAgICAgICAgcG9ydHMgPSB7fSxcclxuICAgICAgICAgICAgd2F0Y2hJbnRlcmZhY2VzO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnVGVzdEJlbmNoRGV0YWlsc0NvbnRyb2xsZXInKTtcclxuICAgICAgICAkc2NvcGUuaW5pdCA9IGZ1bmN0aW9uIChjb25uZWN0aW9uSWQpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogJ1Rlc3RCZW5jaERldGFpbHNfJyArIChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Rlc3Ryb3lpbmcgOicsIGNvbnRleHQucmVnaW9uSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICRzY29wZS5kZXRhaWxzID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogcHJvcGVydGllcyxcclxuICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IGNvbm5lY3RvcnMsXHJcbiAgICAgICAgICAgICAgICBwb3J0czogcG9ydHNcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgd2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKGNvbnRhaW5lcklkKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLndhdGNoSW50ZXJmYWNlcyhjb250ZXh0LCBjb250YWluZXJJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHdhdGNoSW50ZXJmYWNlcyBrZWVwcyB0aGUgZGF0YSB1cC10by1kYXRlIHRoZXJlIHNob3VsZG4ndCBiZSBhIG5lZWQgdG8gZG8gYW55XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlcyBoZXJlLi5cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2F0Y2hJbnRlcmZhY2VzJywgdXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbnRhaW5lckludGVyZmFjZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMucHJvcGVydGllcyA9IGNvbnRhaW5lckludGVyZmFjZXMucHJvcGVydGllcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMuY29ubmVjdG9ycyA9IGNvbnRhaW5lckludGVyZmFjZXMuY29ubmVjdG9ycztcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMucG9ydHMgPSBjb250YWluZXJJbnRlcmZhY2VzLnBvcnRzO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3kpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgIHBvcnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmIChkZXN0cm95KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiBub3RpZnkgdXNlclxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnVGVzdEJlbmNoRGV0YWlsc0NvbnRyb2xsZXIgLSBpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS53YXRjaFRlc3RCZW5jaERldGFpbHMoY29udGV4dCwgJHNjb3BlLnRlc3RCZW5jaElkLCBmdW5jdGlvbiAodXBkYXRlZE9iaikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybignd2F0Y2hUZXN0QmVuY2hEZXRhaWxzIHVwZGF0ZXMnLCB1cGRhdGVkT2JqKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuY29udGFpbmVySWRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBjb250YWluZXIgZGVmaW5lZCEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRhLmNvbnRhaW5lcklkcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoSW50ZXJmYWNlcyhkYXRhLmNvbnRhaW5lcklkc1swXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdNb3JlIHRoYW4gb25lIGNvbnRhaW5lciBkZWZpbmVkIScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICB9KVxyXG4gICAgLmRpcmVjdGl2ZSgndGVzdEJlbmNoRGV0YWlscycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgICAgIHRlc3RCZW5jaElkOiAnPXRlc3RCZW5jaElkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXF1aXJlOiAnXnRlc3RCZW5jaExpc3QnLFxyXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIsIHRlc3RCZW5jaExpc3RDb250cm9sbGVyKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdGlvbklkID0gdGVzdEJlbmNoTGlzdENvbnRyb2xsZXIuZ2V0Q29ubmVjdGlvbklkKCk7XHJcbiAgICAgICAgICAgICAgICBzY29wZS5pbml0KGNvbm5lY3Rpb25JZCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0ludGVyZmFjZURldGFpbHMuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdUZXN0QmVuY2hEZXRhaWxzQ29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LmNvbXBvbmVudHMnKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1Rlc3RCZW5jaExpc3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJHdpbmRvdywgJGxvY2F0aW9uLCAkbW9kYWwsIGdyb3dsLCB0ZXN0QmVuY2hTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgaXRlbXMgPSBbXSwgICAgICAgICAgICAgLy8gSXRlbXMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZSBpdGVtLWxpc3QgdWktY29tcG9uZW50LlxyXG4gICAgICAgICAgICB0ZXN0QmVuY2hJdGVtcyA9IHt9LCAgICAvLyBTYW1lIGl0ZW1zIGFyZSBzdG9yZWQgaW4gYSBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSxcclxuICAgICAgICAgICAgY29uZmlnLFxyXG4gICAgICAgICAgICBjb250ZXh0O1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnVGVzdEJlbmNoTGlzdENvbnRyb2xsZXInKTtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRDb25uZWN0aW9uSWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUuY29ubmVjdGlvbklkO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ1Rlc3RCZW5jaExpc3RDb250cm9sbGVyXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29uZmlndXJhdGlvbiBmb3IgdGhlIGl0ZW0gbGlzdCB1aSBjb21wb25lbnQuXHJcbiAgICAgICAgY29uZmlnID0ge1xyXG5cclxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBzaG93RGV0YWlsc0xhYmVsOiAnU2hvdyBkZXRhaWxzJyxcclxuICAgICAgICAgICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXHJcblxyXG4gICAgICAgICAgICAvLyBFdmVudCBoYW5kbGVyc1xyXG5cclxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uIChqUUV2ZW50LCB1aSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NvcnQgaGFwcGVuZWQnLCBqUUV2ZW50LCB1aSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ2xpY2s6IGZ1bmN0aW9uIChldmVudCwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1VybCA9ICcvdGVzdEJlbmNoLycgKyAkc2NvcGUud29ya3NwYWNlSWQucmVwbGFjZSgvXFwvL2csICctJykgKyAnLycgKyBpdGVtLmlkLnJlcGxhY2UoL1xcLy9nLCAnLScpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3VXJsKTtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKG5ld1VybCk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ29udGV4dG1lbnVSZW5kZXJlcjogZnVuY3Rpb24gKGUsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRWRpdG9yJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCcvP3Byb2plY3Q9QURNRWRpdG9yJmFjdGl2ZU9iamVjdD0nICsgaXRlbS5pZCwgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdlZGl0VGVzdEJlbmNoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VkaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGl0ZW0uZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBpdGVtLmRhdGEuZmlsZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGl0ZW0uZGF0YS5wYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0Q29udGV4dDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGI6IGNvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hUZXN0QmVuY2hlcydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoOiBpdGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRlc3RCZW5jaFNlcnZpY2UuZWRpdFRlc3RCZW5jaEZuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2RlbGV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB0ZXN0QmVuY2hTZXJ2aWNlLmRlbGV0ZUZuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaXRlbS5kZXRhaWxzID0gJ015IGRldGFpbHMgYXJlIGhlcmUgbm93ISc7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBmaWx0ZXI6IHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcclxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gVHJhbnNmb3JtIHRoZSByYXcgc2VydmljZSBub2RlIGRhdGEgdG8gaXRlbXMgZm9yIHRoZSBsaXN0LlxyXG4gICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGxpc3RJdGVtO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRlc3RCZW5jaEl0ZW1zLmhhc093blByb3BlcnR5KGRhdGEuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IHRlc3RCZW5jaEl0ZW1zW2RhdGEuaWRdO1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0udGl0bGUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kZXNjcmlwdGlvbiA9IGRhdGEuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kYXRhLmZpbGVzID0gZGF0YS5maWxlcztcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRhdGEucGF0aCA9IGRhdGEucGF0aDtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRhdGEucmVzdWx0cyA9IGRhdGEucmVzdWx0cztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ09wZW4gVGVzdC1CZW5jaCBWaWV3JyxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiAnTi9BJywgICAvLyBUT0RPOiBnZXQgdGhpcyBpbiB0aGUgZnV0dXJlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiAnTi9BJyAgICAvLyBUT0RPOiBnZXQgdGhpcyBpbiB0aGUgZnV0dXJlLlxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHM6IFsgXSxcclxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzICAgIDogJ0NvbnRlbnQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHNUZW1wbGF0ZVVybDogJ3Rlc3RCZW5jaERldGFpbHMuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogZGF0YS5maWxlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogZGF0YS5wYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiBkYXRhLnJlc3VsdHNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBsaXN0LWl0ZW0gdG8gdGhlIGl0ZW1zIGxpc3QgYW5kIHRoZSBkaWN0aW9uYXJ5LlxyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChsaXN0SXRlbSk7XHJcbiAgICAgICAgICAgICAgICB0ZXN0QmVuY2hJdGVtc1tsaXN0SXRlbS5pZF0gPSBsaXN0SXRlbTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRlc3RCZW5jaFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKGNvbnRleHQsIGZ1bmN0aW9uIChkZXN0cm95ZWQpIHtcclxuICAgICAgICAgICAgaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgJHNjb3BlLmxpc3REYXRhLml0ZW1zID0gaXRlbXM7XHJcbiAgICAgICAgICAgIHRlc3RCZW5jaEl0ZW1zID0ge307XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcpO1xyXG5cclxuICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS53YXRjaFRlc3RCZW5jaGVzKGNvbnRleHQsICRzY29wZS53b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4O1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLndhcm4odXBkYXRlT2JqZWN0KTtcclxuICAgICAgICAgICAgICAgIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0odXBkYXRlT2JqZWN0LmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZU9iamVjdC50eXBlID09PSAndW5sb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZXN0QmVuY2hJdGVtcy5oYXNPd25Qcm9wZXJ0eSh1cGRhdGVPYmplY3QuaWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaXRlbXMubWFwKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuaW5kZXhPZih1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGVzdEJlbmNoSXRlbXNbdXBkYXRlT2JqZWN0LmlkXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih1cGRhdGVPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVzdEJlbmNoSWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh0ZXN0QmVuY2hJZCBpbiBkYXRhLnRlc3RCZW5jaGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnRlc3RCZW5jaGVzLmhhc093blByb3BlcnR5KHRlc3RCZW5jaElkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0oZGF0YS50ZXN0QmVuY2hlc1t0ZXN0QmVuY2hJZF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgLmNvbnRyb2xsZXIoJ1Rlc3RCZW5jaEVkaXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIGdyb3dsLCBkYXRhLCBmaWxlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgZmlsZUluZm87XHJcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICBuYW1lOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgIGZpbGVJbmZvOiB7XHJcbiAgICAgICAgICAgICAgICBoYXNoOiBkYXRhLmZpbGVzLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogbnVsbCxcclxuICAgICAgICAgICAgICAgIHVybDogZmlsZVNlcnZpY2UuZ2V0RG93bmxvYWRVcmwoZGF0YS5maWxlcylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcGF0aDogZGF0YS5wYXRoXHJcbiAgICAgICAgfTtcclxuICAgICAgICBmaWxlSW5mbyA9ICRzY29wZS5kYXRhLmZpbGVJbmZvO1xyXG4gICAgICAgIGlmIChmaWxlSW5mby5oYXNoKSB7XHJcbiAgICAgICAgICAgIGZpbGVTZXJ2aWNlLmdldE1ldGFkYXRhKGZpbGVJbmZvLmhhc2gpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAobWV0YWRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlSW5mby5uYW1lID0gbWV0YWRhdGEubmFtZTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBnZXQgbWV0YS1kYXRhIGZvciBoYXNoJywgZmlsZUluZm8uaGFzaCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5kcmFnT3ZlckNsYXNzID0gZnVuY3Rpb24gKCRldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgZHJhZ2dlZEl0ZW1zID0gJGV2ZW50LmRhdGFUcmFuc2Zlci5pdGVtcyxcclxuICAgICAgICAgICAgICAgIGhhc0ZpbGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgLy9jb25zb2xlLndhcm4oZHJhZ2dlZEl0ZW1zKTtcclxuICAgICAgICAgICAgaGFzRmlsZSA9IGRyYWdnZWRJdGVtcyAmJiBkcmFnZ2VkSXRlbXMubGVuZ3RoID09PSAxICYmIGRyYWdnZWRJdGVtc1swXS5raW5kID09PSAnZmlsZSc7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaGFzRmlsZSA/IFwiYmctc3VjY2VzcyBkcmFnb3ZlclwiIDogXCJiZy1kYW5nZXIgZHJhZ292ZXJcIjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUub25Ecm9wcGVkRmlsZXMgPSBmdW5jdGlvbiAoJGZpbGVzKSB7XHJcbiAgICAgICAgICAgIGZpbGVTZXJ2aWNlLnNhdmVEcm9wcGVkRmlsZXMoJGZpbGVzLCB7emlwOiB0cnVlfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChmSW5mb3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZkluZm9zLmxlbmd0aCAhPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvcignT25lIHppcCBmaWxlIG11c3QgYmUgZHJvcHBlZCEnKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlSW5mby5uYW1lID0gZkluZm9zWzBdLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVJbmZvLnVybCA9IGZJbmZvc1swXS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlSW5mby5oYXNoID0gZkluZm9zWzBdLmhhc2g7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLm9rID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgkc2NvcGUuZGF0YSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCd0ZXN0QmVuY2hMaXN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSWQ6ICc9d29ya3NwYWNlSWQnLFxyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvVGVzdEJlbmNoTGlzdC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Rlc3RCZW5jaExpc3RDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIGRvY3VtZW50LCByZXF1aXJlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdXb3JrZXJzTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkaW50ZXJ2YWwsIGdyb3dsLCBleGVjdXRvclNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIGludGVydmFsUHJvbWlzZSA9IG51bGwsXHJcbiAgICAgICAgICAgIGNvbnNlY3V0aXZlRXJyb3JzID0gMCxcclxuICAgICAgICAgICAgbWF4Q29uc2VjdXRpdmVFcnJvcnMgPSAzMDtcclxuICAgICAgICAkc2NvcGUuZGF0YU1vZGVsID0ge1xyXG4gICAgICAgICAgICB3b3JrZXJzOiBudWxsXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKGludGVydmFsUHJvbWlzZSAmJiAkaW50ZXJ2YWwuY2FuY2VsKGludGVydmFsUHJvbWlzZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXb3JrZXJzIGludGVydmFsIGNhbmNlbGxlZCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGNhbmNlbCBXb3JrZXJzSW50ZXJ2YWwuJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGludGVydmFsUHJvbWlzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaW50ZXJ2YWxQcm9taXNlID0gJGludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgZXhlY3V0b3JTZXJ2aWNlLmdldFdvcmtlcnNJbmZvKClcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNlY3V0aXZlRXJyb3JzID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YU1vZGVsLndvcmtlcnMgPSByZXNwb25jZTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zZWN1dGl2ZUVycm9ycyArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25zZWN1dGl2ZUVycm9ycyA+PSBtYXhDb25zZWN1dGl2ZUVycm9ycykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKGludGVydmFsUHJvbWlzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdXb3JrZXJzIGRpZCBub3QgcmVzcG9uZCBhZnRlciAnICsgbWF4Q29uc2VjdXRpdmVFcnJvcnMgKyAnIHJlcXVlc3RzLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbFByb21pc2UgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sIDEwMDApO1xyXG4gICAgfSlcclxuICAgIC5kaXJlY3RpdmUoJ3dvcmtlcnNMaXN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Xb3JrZXJzTGlzdC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtlcnNMaXN0Q29udHJvbGxlcidcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlLCBkb2N1bWVudCovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcclxuICAgIC5jb250cm9sbGVyKCdXb3Jrc3BhY2VMaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICR3aW5kb3csICRsb2NhdGlvbiwgJG1vZGFsLCBncm93bCwgd29ya3NwYWNlU2VydmljZSwgZmlsZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBpdGVtcyA9IFtdLFxyXG4gICAgICAgICAgICB3b3Jrc3BhY2VJdGVtcyA9IHt9LFxyXG4gICAgICAgICAgICBjb25maWcsXHJcbiAgICAgICAgICAgIGNvbnRleHQsXHJcbiAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtLFxyXG4gICAgICAgICAgICBhZGRDb3VudFdhdGNoZXJzO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnV29ya3NwYWNlTGlzdENvbnRyb2xsZXInKTtcclxuXHJcbiAgICAgICAgaWYgKCRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZygkc2NvcGUuY29ubmVjdGlvbklkKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyXycgKyAobmV3IERhdGUoKSkudG9JU09TdHJpbmcoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uZmlnID0ge1xyXG5cclxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzZWNvbmRhcnlJdGVtTWVudTogdHJ1ZSxcclxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBzaG93RGV0YWlsc0xhYmVsOiAnU2hvdyBkZXRhaWxzJyxcclxuICAgICAgICAgICAgaGlkZURldGFpbHNMYWJlbDogJ0hpZGUgZGV0YWlscycsXHJcblxyXG4gICAgICAgICAgICAvLyBFdmVudCBoYW5kbGVyc1xyXG5cclxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uIChqUUV2ZW50LCB1aSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NvcnQgaGFwcGVuZWQnLCBqUUV2ZW50LCB1aSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBpdGVtQ2xpY2s6IGZ1bmN0aW9uIChldmVudCwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy93b3Jrc3BhY2VEZXRhaWxzLycgKyBpdGVtLmlkLnJlcGxhY2UoL1xcLy9nLCAnLScpKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGl0ZW1Db250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoZSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuSW5FZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oJy8/cHJvamVjdD1BRE1FZGl0b3ImYWN0aXZlT2JqZWN0PScgKyBpdGVtLmlkLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2VkaXRXb3Jrc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRWRpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcGVuY2lsJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogaXRlbS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS50aXRsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWRpdENvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGI6IGNvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoV29ya3NwYWNlcydcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1dvcmtzcGFjZUVkaXQuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtzcGFjZUVkaXRDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7IGRhdGE6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRhdGE7IH0gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKGZ1bmN0aW9uIChlZGl0ZWREYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXR0cnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiBlZGl0ZWREYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lORk8nOiBlZGl0ZWREYXRhLmRlc2NyaXB0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5zZXRXb3Jrc3BhY2VBdHRyaWJ1dGVzKGVkaXRDb250ZXh0LCBkYXRhLmlkLCBhdHRycylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBdHRyaWJ1dGUgdXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc1hNRScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeHBvcnQgYXMgWE1FJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHsgaWQ6IGl0ZW0uaWQsIG5hbWU6IGl0ZW0udGl0bGUgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuZXhwb3J0V29ya3NwYWNlKGNvbnRleHQsIGRhdGEuaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZG93bmxvYWRVcmwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKCdXb3Jrc3BhY2UgcGFja2FnZSBmb3IgPGEgaHJlZj1cIicgKyBkb3dubG9hZFVybCArICdcIj4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5uYW1lICsgJzwvYT4gZXhwb3J0ZWQuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoJ0V4cG9ydCBmYWlsZWQsIHNlZSBjb25zb2xlIGZvciBkZXRhaWxzLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHsgaWQ6IGl0ZW0uaWQsIG5hbWU6IGl0ZW0udGl0bGUgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvU2ltcGxlTW9kYWwuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2ltcGxlTW9kYWxDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZSBXb3Jrc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogJ1RoaXMgd2lsbCBkZWxldGUgJyArIGRhdGEubmFtZSArICcgZnJvbSB0aGUgcHJvamVjdC4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5kZWxldGVXb3Jrc3BhY2UoY29udGV4dCwgZGF0YS5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGRldGFpbHNSZW5kZXJlcjogZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIGl0ZW0uZGV0YWlscyA9ICdNeSBkZXRhaWxzIGFyZSBoZXJlIG5vdyEnO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbmV3SXRlbUZvcm06IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ3JlYXRlIG5ldyB3b3Jrc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgaXRlbVRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1dvcmtzcGFjZU5ld0l0ZW0uaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBleHBhbmRlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wcGVkRmlsZXM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ092ZXJDbGFzcyA9IGZ1bmN0aW9uICgkZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRyYWdnZWRJdGVtcyA9ICRldmVudC5kYXRhVHJhbnNmZXIuaXRlbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IGZhbHNlO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihkcmFnZ2VkSXRlbXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ2dlZEl0ZW1zID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGaWxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZHJhZ2dlZEl0ZW1zLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWRJdGVtc1tpXS5raW5kID09PSAnZmlsZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhhc0ZpbGUgPyBcImJnLXN1Y2Nlc3MgZHJhZ292ZXJcIiA6IFwiYmctZGFuZ2VyIGRyYWdvdmVyXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9uRHJvcHBlZEZpbGVzID0gZnVuY3Rpb24gKCRmaWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlU2VydmljZS5zYXZlRHJvcHBlZEZpbGVzKCRmaWxlcywge3ppcDogdHJ1ZSwgYWRtOiB0cnVlLCBhdG06IHRydWV9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGZJbmZvcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGZJbmZvcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGZJbmZvcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubW9kZWwuZHJvcHBlZEZpbGVzLnB1c2goZkluZm9zW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY3JlYXRlSXRlbSA9IGZ1bmN0aW9uIChuZXdJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdJdGVtQ29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYjogY29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hXb3Jrc3BhY2VzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFuZXdJdGVtIHx8ICFuZXdJdGVtLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLndhcm5pbmcoJ1Byb3ZpZGUgYSBuYW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5jcmVhdGVXb3Jrc3BhY2UobmV3SXRlbUNvbnRleHQsIG5ld0l0ZW0ubmFtZSwgbmV3SXRlbS5kZXNjcmlwdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChmb2xkZXJJZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5zdWNjZXNzKG5ld0l0ZW0ubmFtZSArICcgY3JlYXRlZC4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLm1vZGVsLmRyb3BwZWRGaWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmluZm8oJ0ltcG9ydGluZyBmaWxlcy4uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuaW1wb3J0RmlsZXMobmV3SXRlbUNvbnRleHQsIGZvbGRlcklkcywgJHNjb3BlLm1vZGVsLmRyb3BwZWRGaWxlcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5pbmZvKCdGaW5pc2hlZCBpbXBvcnRpbmcgZmlsZXMhJywge3R0bDogMTAwfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IocmVhc29uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2xbaW5mby50eXBlXShpbmZvLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5hbGx5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcubmV3SXRlbUZvcm0uZXhwYW5kZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubW9kZWwuZHJvcHBlZEZpbGVzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcubmV3SXRlbUZvcm0uZXhwYW5kZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsLmRyb3BwZWRGaWxlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBmaWx0ZXI6IHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XHJcblxyXG4gICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHdvcmtzcGFjZUl0ZW07XHJcblxyXG4gICAgICAgICAgICBpZiAod29ya3NwYWNlSXRlbXMuaGFzT3duUHJvcGVydHkoZGF0YS5pZCkpIHtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0gPSB3b3Jrc3BhY2VJdGVtc1tkYXRhLmlkXTtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0udGl0bGUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJdGVtLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnT3BlbiBXb3Jrc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVcGRhdGVkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IG5ldyBEYXRlKCksIC8vIFRPRE86IGdldCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnIC8vIFRPRE86IGdldCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdDb21wb25lbnRzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXB1enpsZS1waWVjZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnRGVzaWduIFNwYWNlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1jdWJlcydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnVGVzdCBiZW5jaGVzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2F2ZWQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ1JlcXVpcmVtZW50cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1iYXItY2hhcnQtbydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSXRlbS5pZF0gPSB3b3Jrc3BhY2VJdGVtO1xyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCh3b3Jrc3BhY2VJdGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGFkZENvdW50V2F0Y2hlcnMgPSBmdW5jdGlvbiAod29ya3NwYWNlSWQpIHtcclxuICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mQ29tcG9uZW50cyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzBdLnZhbHVlID0gdXBkYXRlRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzBdLnZhbHVlID0gZGF0YS5jb3VudDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mRGVzaWducyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgZnVuY3Rpb24gKHVwZGF0ZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbd29ya3NwYWNlSWRdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzFdLnZhbHVlID0gdXBkYXRlRGF0YS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWzFdLnZhbHVlID0gZGF0YS5jb3VudDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mVGVzdEJlbmNoZXMoY29udGV4dCwgd29ya3NwYWNlSWQsIGZ1bmN0aW9uICh1cGRhdGVEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zW3dvcmtzcGFjZUlkXTtcclxuICAgICAgICAgICAgICAgIGlmICh3b3Jrc3BhY2VEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1syXS52YWx1ZSA9IHVwZGF0ZURhdGEuZGF0YTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZURhdGEgPSB3b3Jrc3BhY2VJdGVtc1t3b3Jrc3BhY2VJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtzcGFjZURhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1syXS52YWx1ZSA9IGRhdGEuY291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgd29ya3NwYWNlU2VydmljZS5yZWdpc3RlcldhdGNoZXIoY29udGV4dCwgZnVuY3Rpb24gKGRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIGFsbCB2YXJpYWJsZXNcclxuICAgICAgICAgICAgaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW1zID0ge307XHJcblxyXG4gICAgICAgICAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdXb3Jrc3BhY2VMaXN0Q29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyk7XHJcbiAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hXb3Jrc3BhY2VzKGNvbnRleHQsIGZ1bmN0aW9uICh1cGRhdGVPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodXBkYXRlT2JqZWN0LnR5cGUgPT09ICdsb2FkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKHVwZGF0ZU9iamVjdC5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBhZGRDb3VudFdhdGNoZXJzKHVwZGF0ZU9iamVjdC5pZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VwZGF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSh1cGRhdGVPYmplY3QuZGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod29ya3NwYWNlSXRlbXMuaGFzT3duUHJvcGVydHkodXBkYXRlT2JqZWN0LmlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9IGl0ZW1zLm1hcChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmluZGV4T2YodXBkYXRlT2JqZWN0LmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5jbGVhblVwUmVnaW9uKGNvbnRleHQsIGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZDb21wb25lbnRzXycgKyB1cGRhdGVPYmplY3QuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmNsZWFuVXBSZWdpb24oY29udGV4dCwgY29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZkRlc2lnbnNfJyArIHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mVGVzdEJlbmNoZXNfJyArIHVwZGF0ZU9iamVjdC5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3b3Jrc3BhY2VJdGVtc1t1cGRhdGVPYmplY3QuaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih1cGRhdGVPYmplY3QpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZUlkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHdvcmtzcGFjZUlkIGluIGRhdGEud29ya3NwYWNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS53b3Jrc3BhY2VzLmhhc093blByb3BlcnR5KHdvcmtzcGFjZUlkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0oZGF0YS53b3Jrc3BhY2VzW3dvcmtzcGFjZUlkXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRDb3VudFdhdGNoZXJzKHdvcmtzcGFjZUlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5jb250cm9sbGVyKCdXb3Jrc3BhY2VFZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCBkYXRhKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgICAgICRzY29wZS5kYXRhID0ge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgbmFtZTogZGF0YS5uYW1lXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLm9rID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgkc2NvcGUuZGF0YSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygnY2FuY2VsJyk7XHJcbiAgICAgICAgfTtcclxuICAgIH0pXHJcbiAgICAuZGlyZWN0aXZlKCd3b3Jrc3BhY2VMaXN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvV29ya3NwYWNlTGlzdC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgc2VydmljZSBjb250YWlucyBmdW5jdGlvbmFsaXR5IHNoYXJlZCBhbW9uZ3N0IHRoZSBkaWZmZXJlbnQgc2VydmljZXMuIEl0IHNob3VsZCBub3QgYmUgdXNlZFxyXG4gKiBkaXJlY3RseSBpbiBhIGNvbnRyb2xsZXIgLSBvbmx5IGFzIHBhcnQgb2Ygb3RoZXIgc2VydmljZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgnYmFzZUN5UGh5U2VydmljZScsIGZ1bmN0aW9uICgkcSwgJHRpbWVvdXQsIG5vZGVTZXJ2aWNlKSB7XHJcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWdpc3RlcnMgYSB3YXRjaGVyIChjb250cm9sbGVyKSB0byB0aGUgc2VydmljZS4gQ2FsbGJhY2sgZnVuY3Rpb24gaXMgY2FsbGVkIHdoZW4gbm9kZXMgYmVjb21lIGF2YWlsYWJsZSBvclxyXG4gICAgICAgICAqIHdoZW4gdGhleSBiZWNhbWUgdW5hdmFpbGFibGUuIFRoZXNlIGFyZSBhbHNvIGNhbGxlZCBkaXJlY3RseSB3aXRoIHRoZSBzdGF0ZSBvZiB0aGUgbm9kZVNlcnZpY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdhdGNoZXJzIC0gV2F0Y2hlcnMgZnJvbSB0aGUgc2VydmljZSB1dGlsaXppbmcgdGhpcyBmdW5jdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gLSBDYWxsZWQgd2l0aCB0cnVlIHdoZW4gdGhlcmUgYXJlIG5vIG5vZGVzIHVuYXZhaWxhYmxlIGFuZCBmYWxzZSB3aGVuIHRoZXJlIGFyZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uICh3YXRjaGVycywgcGFyZW50Q29udGV4dCwgZm4pIHtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2Uub24ocGFyZW50Q29udGV4dC5kYiwgJ2luaXRpYWxpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBiZSBlbm91Z2gsIHRoZSByZWdpb25zIHdpbGwgYmUgY2xlYW5lZCB1cCBpbiBub2RlU2VydmljZS5cclxuICAgICAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0ge307XHJcbiAgICAgICAgICAgICAgICBmbihmYWxzZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5vbihwYXJlbnRDb250ZXh0LmRiLCAnZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGVub3VnaCwgdGhlIHJlZ2lvbnMgc2hvdWxkIGJlIGNsZWFuZWQgdXAgaW4gbm9kZVNlcnZpY2UuXHJcbiAgICAgICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmbih0cnVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBhbGwgd2F0Y2hlcnMgc3Bhd25lZCBmcm9tIHBhcmVudENvbnRleHQsIHRoaXMgc2hvdWxkIHR5cGljYWxseSBiZSBpbnZva2VkIHdoZW4gdGhlIGNvbnRyb2xsZXIgaXMgZGVzdHJveWVkLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3YXRjaGVycyAtIFdhdGNoZXJzIGZyb20gdGhlIHNlcnZpY2UgdXRpbGl6aW5nIHRoaXMgZnVuY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uICh3YXRjaGVycywgcGFyZW50Q29udGV4dCkge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRXYXRjaGVycyxcclxuICAgICAgICAgICAgICAgIGtleTtcclxuICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdKSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZFdhdGNoZXJzID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBjaGlsZFdhdGNoZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkV2F0Y2hlcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5jbGVhblVwUmVnaW9uKGNoaWxkV2F0Y2hlcnNba2V5XS5kYiwgY2hpbGRXYXRjaGVyc1trZXldLnJlZ2lvbklkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTm90aGluZyB0byBjbGVhbi11cC4uJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHNwZWNpZmllZCB3YXRjaGVyIChyZWdpb25JZClcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd2F0Y2hlcnMgLSBXYXRjaGVycyBmcm9tIHRoZSBzZXJ2aWNlIHV0aWxpemluZyB0aGlzIGZ1bmN0aW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LmRiIC0gRGF0YWJhc2UgY29ubmVjdGlvbiBvZiBib3RoIHBhcmVudCBhbmQgcmVnaW9uIHRvIGJlIGRlbGV0ZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmVudENvbnRleHQucmVnaW9uSWQgLSBSZWdpb24gb2YgdGhlIGNvbnRyb2xsZXIgKGFsbCBzcGF3bmVkIHJlZ2lvbnMgYXJlIGdyb3VwZWQgYnkgdGhpcykuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHJlZ2lvbklkIC0gUmVnaW9uIGlkIG9mIHRoZSBzcGF3bmVkIHJlZ2lvbiB0aGF0IHNob3VsZCBiZSBkZWxldGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uICh3YXRjaGVycywgcGFyZW50Q29udGV4dCwgcmVnaW9uSWQpIHtcclxuICAgICAgICAgICAgaWYgKHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bcmVnaW9uSWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbihwYXJlbnRDb250ZXh0LmRiLCByZWdpb25JZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW3JlZ2lvbklkXTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vdGhpbmcgdG8gY2xlYW4tdXAuLicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Nhbm5vdCBjbGVhbi11cCByZWdpb24gc2luY2UgcGFyZW50Q29udGV4dCBpcyBub3QgcmVnaXN0ZXJlZC4uJywgcGFyZW50Q29udGV4dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGVzIHRoZSBnaXZlbiBhdHRyaWJ1dGVzIG9mIGEgbm9kZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBjb21wb25lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LnJlZ2lvbklkIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGNvbXBvbmVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBQYXRoIHRvIG5vZGUuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGF0dHJzIC0gS2V5cyBhcmUgbmFtZXMgb2YgYXR0cmlidXRlcyBhbmQgdmFsdWVzIGFyZSB0aGUgd2FudGVkIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuc2V0Tm9kZUF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoY29udGV4dCwgaWQsIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhhdHRycykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbm8gYXR0cmlidXRlIHRvIHVwZGF0ZScpO1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIGlkKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG5vZGVPYmopIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGF0dHJzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlciA9IGtleXMubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRBdHRyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZU9iai5zZXRBdHRyaWJ1dGUoa2V5c1tjb3VudGVyXSwgYXR0cnNba2V5c1tjb3VudGVyXV0sICd3ZWJDeVBoeSAtIHNldE5vZGVBdHRyaWJ1dGVzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3VudGVyIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEF0dHIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHNldEF0dHIoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqIFRPRE86IFdhdGNoIGRvbWFpblBvcnRzIGluc2lkZSBDb25uZWN0b3JzXHJcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGludGVyZmFjZXMgKFByb3BlcnRpZXMsIENvbm5lY3RvcnMgYW5kIERvbWFpblBvcnRzKSBvZiBhIG1vZGVsLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3YXRjaGVycyAtIFdhdGNoZXJzIGZyb20gdGhlIHNlcnZpY2UgdXRpbGl6aW5nIHRoaXMgZnVuY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gUGF0aCB0byBtb2RlbC5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaEludGVyZmFjZXMgPSBmdW5jdGlvbiAod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaEludGVyZmFjZXNfJyArIGlkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge30sIC8vcHJvcGVydHk6ICB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGF0YVR5cGU6IDxzdHJpbmc+LCB2YWx1ZVR5cGUgPHN0cmluZz4sIGRlcml2ZWQgPGJvb2xlYW4+fVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IHt9LCAvL2Nvbm5lY3Rvcjoge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRvbWFpblBvcnRzOiA8b2JqZWN0PiB9XHJcbiAgICAgICAgICAgICAgICAgICAgcG9ydHM6IHt9ICAgICAgIC8vcG9ydDogICAgICB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgdHlwZTogPHN0cmluZz4sIGNsYXNzOiA8c3RyaW5nPiB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Qcm9wZXJ0eVVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGF0YVR5cGUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnRGF0YVR5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVUeXBlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1ZhbHVlVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXJpdmVkID0gaXNQcm9wZXJ0eURlcml2ZWQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5wcm9wZXJ0aWVzW2lkXS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGF0YVR5cGUgIT09IGRhdGEucHJvcGVydGllc1tpZF0uZGF0YVR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wcm9wZXJ0aWVzW2lkXS5kYXRhVHlwZSA9IG5ld0RhdGFUeXBlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlVHlwZSAhPT0gZGF0YS5wcm9wZXJ0aWVzW2lkXS52YWx1ZVR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wcm9wZXJ0aWVzW2lkXS52YWx1ZVR5cGUgPSBuZXdWYWx1ZVR5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGVyaXZlZCAhPT0gZGF0YS5wcm9wZXJ0aWVzW2lkXS5kZXJpdmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1tpZF0uZGVyaXZlZCA9IG5ld0Rlcml2ZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Qcm9wZXJ0eVVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnByb3BlcnRpZXNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkNvbm5lY3RvclVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLmNvbm5lY3RvcnNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25uZWN0b3JzW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkNvbm5lY3RvclVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmNvbm5lY3RvcnNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblBvcnRVcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1R5cGUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdDbGFzcyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdDbGFzcycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEucG9ydHNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wb3J0c1tpZF0ubmFtZSA9IG5ld05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VHlwZSAhPT0gZGF0YS5wb3J0c1tpZF0uZGF0YVR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wb3J0c1tpZF0udHlwZSA9IG5ld1R5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2xhc3MgIT09IGRhdGEucG9ydHNbaWRdLmNsYXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucG9ydHNbaWRdLmNsYXNzID0gbmV3Q2xhc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25Qb3J0VW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEucG9ydHNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBpc1Byb3BlcnR5RGVyaXZlZCA9IGZ1bmN0aW9uIChub2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuZ2V0Q29sbGVjdGlvblBhdGhzKCdkc3QnKS5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChtb2RlbE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWxOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLlByb3BlcnR5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdEYXRhVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVUeXBlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdWYWx1ZVR5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcml2ZWQ6IGlzUHJvcGVydHlEZXJpdmVkKGNoaWxkTm9kZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uUHJvcGVydHlVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25Qcm9wZXJ0eVVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQ29ubmVjdG9yKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbm5lY3RvcnNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblBvcnRzOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25Db25uZWN0b3JVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25Db25uZWN0b3JVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9xdWV1ZUxpc3QucHVzaChjaGlsZE5vZGUubG9hZENoaWxkcmVuKGNoaWxkTm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkRvbWFpblBvcnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucG9ydHNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1R5cGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdDbGFzcycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblBvcnRVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25Qb3J0VW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vcXVldWVMaXN0LnB1c2goY2hpbGROb2RlLmxvYWRDaGlsZHJlbihjaGlsZE5vZGUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbE5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuUHJvcGVydHkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdEYXRhVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVUeXBlOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ1ZhbHVlVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVyaXZlZDogaXNQcm9wZXJ0eURlcml2ZWQobmV3Q2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uUHJvcGVydHlVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblByb3BlcnR5VW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjaGlsZElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Db25uZWN0b3IpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29ubmVjdG9yc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21haW5Qb3J0czoge31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25Db25uZWN0b3JVcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvbkNvbm5lY3RvclVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY2hpbGRJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9xdWV1ZUxpc3QucHVzaChjaGlsZE5vZGUubG9hZENoaWxkcmVuKGNoaWxkTm9kZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuRG9tYWluUG9ydCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wb3J0c1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0NsYXNzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25Qb3J0VXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25Qb3J0VW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjaGlsZElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cclxuICovXHJcblxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCdjb21wb25lbnRTZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCAkdGltZW91dCwgbm9kZVNlcnZpY2UsIGJhc2VDeVBoeVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHdhdGNoZXJzID0ge307XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIGNvbXBvbmVudCBmcm9tIHRoZSBjb250ZXh0IChkYi9wcm9qZWN0L2JyYW5jaCkuXHJcbiAgICAgICAgICogQHBhcmFtIGNvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIsIE4uQi4gZG9lcyBub3QgbmVlZCB0byBzcGVjaWZ5IHJlZ2lvbi5cclxuICAgICAgICAgKiBAcGFyYW0gY29tcG9uZW50SWRcclxuICAgICAgICAgKiBAcGFyYW0gW21zZ10gLSBDb21taXQgbWVzc2FnZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmRlbGV0ZUNvbXBvbmVudCA9IGZ1bmN0aW9uIChjb250ZXh0LCBjb21wb25lbnRJZCwgbXNnKSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbXNnIHx8ICdDb21wb25lbnRTZXJ2aWNlLmRlbGV0ZUNvbXBvbmVudCAnICsgY29tcG9uZW50SWQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmRlc3Ryb3lOb2RlKGNvbnRleHQsIGNvbXBvbmVudElkLCBtZXNzYWdlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGVzIHRoZSBnaXZlbiBhdHRyaWJ1dGVzXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgY29tcG9uZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGNvbXBvbmVudC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5yZWdpb25JZCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBjb21wb25lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbXBvbmVudElkIC0gUGF0aCB0byBjb21wb25lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGF0dHJzIC0gS2V5cyBhcmUgbmFtZXMgb2YgYXR0cmlidXRlcyBhbmQgdmFsdWVzIGFyZSB0aGUgd2FudGVkIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuc2V0Q29tcG9uZW50QXR0cmlidXRlcyA9IGZ1bmN0aW9uIChjb250ZXh0LCBjb21wb25lbnRJZCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJhc2VDeVBoeVNlcnZpY2Uuc2V0Tm9kZUF0dHJpYnV0ZXMoY29udGV4dCwgY29tcG9uZW50SWQsIGF0dHJzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhbGwgY29tcG9uZW50cyAoZXhpc3RlbmNlIGFuZCB0aGVpciBhdHRyaWJ1dGVzKSBvZiBhIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLiAgRGF0YSBpcyBhbiBvYmplY3QgaW4gZGF0YS5jb21wb25lbnRzLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBhdm1JZHMgLSBBbiBvcHRpb25hbCBmaWx0ZXIgdGhhdCBvbmx5IHdhdGNoZXMgY29tcG9uZW50cyB3aXRoIElEcyB0aGF0IGV2YWx1YXRlcyB0byB0cnVlLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hDb21wb25lbnRzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCBhdm1JZHMsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29tcG9uZW50cycsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IHt9IC8vIGNvbXBvbmVudCB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgYXZtSWQ6IDxzdHJpbmc+LCByZXNvdXJjZTogPGhhc2h8c3RyaW5nPiwgY2xhc3NpZmljYXRpb25zOiA8c3RyaW5nPiB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBdm1JRCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdSZXNvdXJjZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdSZXNvdXJjZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdDbGFzcyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdDbGFzc2lmaWNhdGlvbnMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEZXNjICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0uZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0F2bUlEICE9PSBkYXRhLmNvbXBvbmVudHNbaWRdLmF2bUlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0uYXZtSWQgPSBuZXdBdm1JRDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdSZXNvdXJjZSAhPT0gZGF0YS5jb21wb25lbnRzW2lkXS5yZXNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbaWRdLnJlc291cmNlID0gbmV3UmVzb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2xhc3MgIT09IGRhdGEuY29tcG9uZW50c1tpZF0uY2xhc3NpZmljYXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1tpZF0uY2xhc3NpZmljYXRpb25zID0gbmV3Q2xhc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NvbXBvbmVudFNlcnZpY2UgZm91bmQgdXBkYXRlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLmNvbXBvbmVudHNbaWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmNvbXBvbmVudHNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IG51bGx9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoZm9sZGVyTm9kZSwgbWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFDTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1Db21wb25lbnRNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJZCA9IGNoaWxkTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYXZtSWRzIHx8IGF2bUlkcy5oYXNPd25Qcm9wZXJ0eShjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdJRCcpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbY29tcG9uZW50SWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNvbXBvbmVudElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2bUlkOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1Jlc291cmNlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2lmaWNhdGlvbnM6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0NsYXNzaWZpY2F0aW9ucycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudElkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWF2bUlkcyB8fCBhdm1JZHMuaGFzT3duUHJvcGVydHkobmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJRCcpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbY29tcG9uZW50SWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNvbXBvbmVudElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdm1JZDogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnUmVzb3VyY2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzaWZpY2F0aW9uczogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdDbGFzc2lmaWNhdGlvbnMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjb21wb25lbnRJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvbXBvbmVudHNbY29tcG9uZW50SWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BQ01Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgZG9tYWluLW1vZGVscyBvZiBhIGNvbXBvbmVudC5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gY29tcG9uZW50SWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hDb21wb25lbnREb21haW5zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGNvbXBvbmVudElkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbXBvbmVudERvbWFpbnNfJyArIGNvbXBvbmVudElkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBpZDogY29tcG9uZW50SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluTW9kZWxzOiB7fSAgIC8vZG9tYWluTW9kZWw6IGlkOiA8c3RyaW5nPiwgdHlwZTogPHN0cmluZz5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkRvbWFpbk1vZGVsVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1R5cGUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1R5cGUgIT09IGRhdGEuZG9tYWluTW9kZWxzW2lkXS50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZG9tYWluTW9kZWxzW2lkXS50eXBlID0gbmV3VHlwZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYWRDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkRvbWFpbk1vZGVsVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuZG9tYWluTW9kZWxzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgY29tcG9uZW50SWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbXBvbmVudE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Tm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Eb21haW5Nb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kb21haW5Nb2RlbHNbY2hpbGRJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1R5cGUnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25Eb21haW5Nb2RlbFVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvbkRvbWFpbk1vZGVsVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnROb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IG5ld0NoaWxkLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkRvbWFpbk1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRvbWFpbk1vZGVsc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdUeXBlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25Eb21haW5Nb2RlbFVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uRG9tYWluTW9kZWxVbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNoaWxkSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS53YXRjaEludGVyZmFjZXMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaEludGVyZmFjZXMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgaWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLndhdGNoSW50ZXJmYWNlcyh3YXRjaGVycywgcGFyZW50Q29udGV4dCwgaWQsIHVwZGF0ZUxpc3RlbmVyKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucy5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBBbGxSZWdpb25zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQpIHtcclxuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyh3YXRjaGVycywgcGFyZW50Q29udGV4dCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBSZWdpb24gPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgcmVnaW9uSWQpIHtcclxuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCByZWdpb25JZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJXYXRjaGVyID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGZuKSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBmbik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dDb250ZXh0ID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9nQ29udGV4dChjb250ZXh0KTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIFdlYkdNRUdsb2JhbCovXHJcblxyXG4vKipcclxuICogVGhpcyBzZXJ2aWNlIGNvbnRhaW5zIG1ldGhvZHMgZm9yIGRlc2lnbiBzcGFjZSBleHBsb3JhdGlvbiB0aHJvdWdoIHRoZSBFeGVjdXRvciBDbGllbnQuXHJcbiAqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCdkZXNlcnRTZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCAkaW50ZXJ2YWwsIGZpbGVTZXJ2aWNlLCBleGVjdXRvclNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICBDTURTVFIsXHJcbiAgICAgICAgICAgIHhtbFRvSnNvbiA9IG5ldyBXZWJHTUVHbG9iYWwuY2xhc3Nlcy5Db252ZXJ0ZXJzLlhtbDJqc29uKHtcclxuICAgICAgICAgICAgICAgIHNraXBXU1RleHQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBhcnJheUVsZW1lbnRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgQ29uZmlndXJhdGlvbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBFbGVtZW50OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIE5hdHVyYWxNZW1iZXI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgQWx0ZXJuYXRpdmVBc3NpZ25tZW50OiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBqc29uVG9YbWwgPSBuZXcgV2ViR01FR2xvYmFsLmNsYXNzZXMuQ29udmVydGVycy5Kc29uMnhtbCgpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKGRlc2VydElucHV0KSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoKGRlc2VydElucHV0LmRlc2VydFN5c3RlbSAmJiBhbmd1bGFyLmlzT2JqZWN0KGRlc2VydElucHV0LmRlc2VydFN5c3RlbSkgJiZcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuaXNPYmplY3QoZGVzZXJ0SW5wdXQuaWRNYXApKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnZGVzZXJ0SW5wdXQgbXVzdCBjb250YWluIGEgZGVzZXJ0U3lzdGVtIGFuZCBpZE1hcCBvYmplY3QhJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2VsZi5zYXZlRGVzZXJ0SW5wdXQoZGVzZXJ0SW5wdXQuZGVzZXJ0U3lzdGVtKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGlucHV0SGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTYXZlZCBkZXNlcnRJbnB1dCcsIGZpbGVTZXJ2aWNlLmdldERvd25sb2FkVXJsKGlucHV0SGFzaCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmNyZWF0ZUFuZFJ1bkpvYihpbnB1dEhhc2gpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChqb2JJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0pvYiBzdWNjZWVkZWQgZmluYWwgam9iSW5mbycsIGpvYkluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmV4dHJhY3RDb25maWd1cmF0aW9ucyhqb2JJbmZvLCBkZXNlcnRJbnB1dC5pZE1hcCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbmZpZ3VyYXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShjb25maWd1cmF0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0NhbGN1bGF0aW5nIGNvbmZpZ3VyYXRpb25zIGZhaWxlZCwgZXJyOiAnICsgZXJyLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNhdmVEZXNlcnRJbnB1dCA9IGZ1bmN0aW9uIChkZXNlcnRTeXN0ZW0pIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGFydGlmYWN0LFxyXG4gICAgICAgICAgICAgICAgeG1sU3RyaW5nO1xyXG5cclxuICAgICAgICAgICAgYXJ0aWZhY3QgPSBmaWxlU2VydmljZS5jcmVhdGVBcnRpZmFjdCgnZGVzZXJ0LWlucHV0Jyk7XHJcbiAgICAgICAgICAgIHhtbFN0cmluZyA9IGpzb25Ub1htbC5jb252ZXJ0VG9TdHJpbmcoZGVzZXJ0U3lzdGVtKTtcclxuXHJcbiAgICAgICAgICAgIGZpbGVTZXJ2aWNlLmFkZEZpbGVBc1NvZnRMaW5rVG9BcnRpZmFjdChhcnRpZmFjdCwgJ2Rlc2VydElucHV0LnhtbCcsIHhtbFN0cmluZylcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChoYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4ZWNDb25maWcgPSBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbWQ6ICdydW5fZGVzZXJ0LmNtZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRBcnRpZmFjdHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdhbGwnLCByZXN1bHRQYXR0ZXJuczogW10gfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBudWxsLCA0KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXNUb0FkZCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdleGVjdXRvcl9jb25maWcuanNvbic6IGV4ZWNDb25maWcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncnVuX2Rlc2VydC5jbWQnOiBDTURTVFJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsZVNlcnZpY2UuYWRkRmlsZXNUb0FydGlmYWN0KGFydGlmYWN0LCBmaWxlc1RvQWRkKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaGFzaGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVTZXJ2aWNlLnNhdmVBcnRpZmFjdChhcnRpZmFjdCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGFydGllSGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYXJ0aWVIYXNoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnQ291bGQgbm90IHNhdmUgRGVzZXJ0SW5wdXQgdG8gYmxvYiwgZXJyOiBcIicgKyByZWFzb24gKyAnXCInKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGVBbmRSdW5Kb2IgPSBmdW5jdGlvbiAoaW5wdXRIYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGV4ZWN1dG9yU2VydmljZS5jcmVhdGVKb2Ioe2hhc2g6IGlucHV0SGFzaCwgbGFiZWxzOiBbXX0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3A7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RvcCA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWN1dG9yU2VydmljZS5nZXRJbmZvKGlucHV0SGFzaClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChqb2JJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKEpTT04uc3RyaW5naWZ5KGpvYkluZm8sIG51bGwsIDQpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoam9iSW5mby5zdGF0dXMgPT09ICdDUkVBVEVEJyB8fCBqb2JJbmZvLnN0YXR1cyA9PT0gJ1JVTk5JTkcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChzdG9wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoam9iSW5mby5zdGF0dXMgPT09ICdTVUNDRVNTJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGpvYkluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChKU09OLnN0cmluZ2lmeShqb2JJbmZvLCBudWxsLCA0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbChzdG9wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0NvdWxkIG5vdCBvYnRhaW4gam9iSW5mbyBmb3IgZGVzZXJ0JyArIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAyMDApO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdDb3VsZCBub3QgY3JlYXRlIGpvYicgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmV4dHJhY3RDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uIChqb2JJbmZvLCBpZE1hcCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBpZiAoKGpvYkluZm8ucmVzdWx0SGFzaGVzICYmIGpvYkluZm8ucmVzdWx0SGFzaGVzLmFsbCkgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0pvYkluZm8gZGlkIG5vdCBjb250YWluIHJlc3VsdEhhc2hlcy5hbGwnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZpbGVTZXJ2aWNlLmdldE1ldGFkYXRhKGpvYkluZm8ucmVzdWx0SGFzaGVzLmFsbClcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChtZXRhZGF0YSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogRGVhbCB3aXRoIGNvbmZpZ3Mgd2hlbiB0aGVyZSdzIGNvbnN0cmFpbnRzXHJcbi8vICAgICAgICAgICAgICAgICAgICBpZiAoIW1ldGFkYXRhLmNvbnRlbnQuaGFzT3duUHJvcGVydHkoJ2Rlc2VydElucHV0X2NvbmZpZ3MueG1sJykpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0Rlc2VydCBkaWQgbm90IGdlbmVyYXRlIGEgXCJkZXNlcnRJbnB1dF9jb25maWdzLnhtbFwiLicpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuLy8gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1ldGFkYXRhLmNvbnRlbnQuaGFzT3duUHJvcGVydHkoJ2Rlc2VydElucHV0X2JhY2sueG1sJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdEZXNlcnQgZGlkIG5vdCBnZW5lcmF0ZSBhIGRlc2VydElucHV0X2JhY2sueG1sLicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsZVNlcnZpY2UuZ2V0T2JqZWN0KG1ldGFkYXRhLmNvbnRlbnRbJ2Rlc2VydElucHV0X2JhY2sueG1sJ10uY29udGVudCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVzZXJ0T2JqZWN0ID0geG1sVG9Kc29uLmNvbnZlcnRGcm9tQnVmZmVyKGNvbnRlbnQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNlcnRCYWNrU3lzdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBqLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBrLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsdEFzcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtSWRUb1BhdGggPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2VydE9iamVjdCBpbnN0YW5jZW9mIEVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnT3V0cHV0IGRlc2VydCBYTUwgbm90IHZhbGlkIHhtbCwgZXJyOiAnICsgZGVzZXJ0T2JqZWN0Lm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2VydEJhY2tTeXN0ZW0gPSBkZXNlcnRPYmplY3QuRGVzZXJ0QmFja1N5c3RlbTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2VydEJhY2tTeXN0ZW0uRWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgZGVzZXJ0QmFja1N5c3RlbS5FbGVtZW50Lmxlbmd0aDsgaiArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtID0gZGVzZXJ0QmFja1N5c3RlbS5FbGVtZW50W2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbUlkVG9QYXRoW2VsZW1bJ0BfaWQnXV0gPSBpZE1hcFtlbGVtWydAZXh0ZXJuYWxJRCddXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgZGVzZXJ0QmFja1N5c3RlbS5Db25maWd1cmF0aW9uLmxlbmd0aDsgaiArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNmZyA9IGRlc2VydEJhY2tTeXN0ZW0uQ29uZmlndXJhdGlvbltqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjZmdbJ0BuYW1lJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2ZnWydAaWQnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlQXNzaWdubWVudHM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcgPSBjb25maWd1cmF0aW9uc1tjb25maWd1cmF0aW9ucy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNmZy5BbHRlcm5hdGl2ZUFzc2lnbm1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoayA9IDA7IGsgPCBjZmcuQWx0ZXJuYXRpdmVBc3NpZ25tZW50Lmxlbmd0aDsgayArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0QXNzID0gY2ZnLkFsdGVybmF0aXZlQXNzaWdubWVudFtrXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWcuYWx0ZXJuYXRpdmVBc3NpZ25tZW50cy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRBbHRlcm5hdGl2ZTogZWxlbUlkVG9QYXRoW2FsdEFzc1snQGFsdGVybmF0aXZlX2VuZF8nXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlT2Y6IGVsZW1JZFRvUGF0aFthbHRBc3NbJ0BhbHRlcm5hdGl2ZV9vZl9lbmRfJ11dXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShjb25maWd1cmF0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQ29uZmlndXJhdGlvbnNEdW1teSA9IGZ1bmN0aW9uIChkZXNlcnRJbnB1dCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgaW5wdXRBcnRpZmFjdCxcclxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiQ29uZi4gbm86IDFcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQWx0ZXJuYXRpdmU6IFwiLzIxMzAwMTc4MzQvNTQyNTcxNDk0LzE2NDYwNTk0MjIvNTY0MzEyMTQ4LzkxMDczODE1XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVPZjogXCIvMjEzMDAxNzgzNC81NDI1NzE0OTQvMTY0NjA1OTQyMi81NjQzMTIxNDhcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkNvbmYuIG5vOiAyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlQXNzaWdubWVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEFsdGVybmF0aXZlOiBcIi8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OC8xNDMzNDcxNzg5XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVPZjogXCIvMjEzMDAxNzgzNC81NDI1NzE0OTQvMTY0NjA1OTQyMi81NjQzMTIxNDhcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkNvbmYuIG5vOiAzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlQXNzaWdubWVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEFsdGVybmF0aXZlOiBcIi8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OC8xNDkzOTA3MjY0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVPZjogXCIvMjEzMDAxNzgzNC81NDI1NzE0OTQvMTY0NjA1OTQyMi81NjQzMTIxNDhcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkNvbmYuIG5vOiA0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlQXNzaWdubWVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEFsdGVybmF0aXZlOiBcIi8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OC8xNzY3NTIxNjIxXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVPZjogXCIvMjEzMDAxNzgzNC81NDI1NzE0OTQvMTY0NjA1OTQyMi81NjQzMTIxNDhcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoY29uZmlndXJhdGlvbnMpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmdldERlc2VydElucHV0RGF0YSA9IGZ1bmN0aW9uIChkZXNpZ25TdHJ1Y3R1cmVEYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBkZXNlcnRTeXN0ZW0sXHJcbiAgICAgICAgICAgICAgICBpZE1hcCA9IHt9LFxyXG4gICAgICAgICAgICAgICAgaWRDb3VudGVyID0gNCxcclxuICAgICAgICAgICAgICAgIHJvb3RDb250YWluZXIgPSBkZXNpZ25TdHJ1Y3R1cmVEYXRhLmNvbnRhaW5lcnNbZGVzaWduU3RydWN0dXJlRGF0YS5yb290SWRdLFxyXG4gICAgICAgICAgICAgICAgcG9wdWxhdGVEYXRhUmVjID0gZnVuY3Rpb24gKGNvbnRhaW5lciwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkRGF0YSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGNvbnRhaW5lci5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIuY29tcG9uZW50cy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZERhdGEgPSBjb250YWluZXIuY29tcG9uZW50c1trZXldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRDb3VudGVyICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA9IGlkQ291bnRlci50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRNYXBbaWRdID0gY2hpbGREYXRhLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5FbGVtZW50LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAX2lkJzogJ2lkJyArIGlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAZGVjb21wb3NpdGlvbic6ICdmYWxzZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BleHRlcm5hbElEJzogaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BpZCc6IGlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAbmFtZSc6IGNoaWxkRGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdFbGVtZW50JzogW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGNvbnRhaW5lci5zdWJDb250YWluZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIuc3ViQ29udGFpbmVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZERhdGEgPSBjb250YWluZXIuc3ViQ29udGFpbmVyc1trZXldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRDb3VudGVyICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA9IGlkQ291bnRlci50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRNYXBbaWRdID0gY2hpbGREYXRhLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5FbGVtZW50LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAX2lkJzogJ2lkJyArIGlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAZGVjb21wb3NpdGlvbic6IChjaGlsZERhdGEudHlwZSA9PT0gJ0NvbXBvdW5kJykudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGV4dGVybmFsSUQnOiBpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGlkJzogaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BuYW1lJzogY2hpbGREYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0VsZW1lbnQnOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1bGF0ZURhdGFSZWMoY2hpbGREYXRhLCBlbGVtZW50LkVsZW1lbnRbZWxlbWVudC5FbGVtZW50Lmxlbmd0aCAtIDFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGRlc2VydFN5c3RlbSA9IHtcclxuICAgICAgICAgICAgICAgICdEZXNlcnRTeXN0ZW0nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ0B4bWxuczp4c2knOiAnaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICdAU3lzdGVtTmFtZSc6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICdAeHNpOm5vTmFtZXNwYWNlU2NoZW1hTG9jYXRpb24nOiAnRGVzZXJ0SWZhY2UueHNkJyxcclxuICAgICAgICAgICAgICAgICAgICAnQ29uc3RyYWludFNldCc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BfaWQnOiAnaWQxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BleHRlcm5hbElEJzogJzEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQGlkJzogJzEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQG5hbWUnOiAnY29uc3RyYWludHMnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAnRm9ybXVsYVNldCc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BfaWQnOiAnaWQyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BleHRlcm5hbElEJzogJzInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQGlkJzogJzInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQG5hbWUnOiAnZm9ybXVsYVNldCdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICdTcGFjZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BfaWQnOiAnaWQzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BkZWNvbXBvc2l0aW9uJzogJ3RydWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnQGV4dGVybmFsSUQnOiAnMycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdAaWQnOiAnMycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdAbmFtZSc6ICdEZXNpZ25TcGFjZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdFbGVtZW50JzogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAX2lkJzogJ2lkNCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BkZWNvbXBvc2l0aW9uJzogJ3RydWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAZXh0ZXJuYWxJRCc6ICc0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGlkJzogJzQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAbmFtZSc6IHJvb3RDb250YWluZXIubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRWxlbWVudCc6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHBvcHVsYXRlRGF0YVJlYyhyb290Q29udGFpbmVyLCBkZXNlcnRTeXN0ZW0uRGVzZXJ0U3lzdGVtLlNwYWNlLkVsZW1lbnRbMF0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHsgZGVzZXJ0U3lzdGVtOiBkZXNlcnRTeXN0ZW0sIGlkTWFwOiBpZE1hcCB9O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIENNRFNUUiA9IFtcclxuICAgICAgICAgICAgJzo6IFJ1bnMgPC1EZXNlcnRUb29scy5leGUtPiBkZXNlcnRJbnB1dC54bWwgL20nLFxyXG4gICAgICAgICAgICAnRUNITyBvZmYnLFxyXG4gICAgICAgICAgICAncHVzaGQgJX5kcDAnLFxyXG4gICAgICAgICAgICAnJVN5c3RlbVJvb3QlXFxcXFN5c1dvVzY0XFxcXFJFRy5leGUgcXVlcnkgXCJIS0xNXFxcXHNvZnR3YXJlXFxcXE1FVEFcIiAvdiBcIk1FVEFfUEFUSFwiJyxcclxuICAgICAgICAgICAgJ1NFVCBRVUVSWV9FUlJPUkxFVkVMPSVFUlJPUkxFVkVMJScsXHJcbiAgICAgICAgICAgICdJRiAlUVVFUllfRVJST1JMRVZFTCUgPT0gMCAoJyxcclxuICAgICAgICAgICAgJyAgICAgICAgRk9SIC9GIFwic2tpcD0yIHRva2Vucz0yLCpcIiAlJUEgSU4gKFxcJyVTeXN0ZW1Sb290JVxcXFxTeXNXb1c2NFxcXFxSRUcuZXhlIHF1ZXJ5IFwiSEtMTVxcXFxzb2Z0d2FyZVxcXFxNRVRBXCIgL3YgXCJNRVRBX1BBVEhcIlxcJykgRE8gU0VUIE1FVEFfUEFUSD0lJUIpJyxcclxuICAgICAgICAgICAgJ1NFVCBERVNFUlRfRVhFPVwiJU1FVEFfUEFUSCVcXFxcYmluXFxcXERlc2VydFRvb2wuZXhlXCInLFxyXG4gICAgICAgICAgICAnICAgSUYgRVhJU1QgJURFU0VSVF9FWEUlICgnLFxyXG4gICAgICAgICAgICAnICAgICAgIFJFTSBJbnN0YWxsZXIgbWFjaGluZS4nLFxyXG4gICAgICAgICAgICAnICAgICAgICVERVNFUlRfRVhFJSBkZXNlcnRJbnB1dC54bWwgL2MgXCJhcHBseUFsbFwiJyxcclxuICAgICAgICAgICAgJyAgICkgRUxTRSBJRiBFWElTVCBcIiVNRVRBX1BBVEglXFxcXHNyY1xcXFxiaW5cXFxcRGVzZXJ0VG9vbC5leGVcIiAoJyxcclxuICAgICAgICAgICAgJyAgICAgICBSRU0gRGV2ZWxvcGVyIG1hY2hpbmUuJyxcclxuICAgICAgICAgICAgJyAgICAgICBcIiVNRVRBX1BBVEglXFxcXHNyY1xcXFxiaW5cXFxcRGVzZXJ0VG9vbC5leGVcIiBkZXNlcnRJbnB1dC54bWwgL2MgXCJhcHBseUFsbFwiJyxcclxuICAgICAgICAgICAgJyAgICkgRUxTRSAoJyxcclxuICAgICAgICAgICAgJyAgICAgICBFQ0hPIG9uJyxcclxuICAgICAgICAgICAgJyAgICAgICBFQ0hPIENvdWxkIG5vdCBmaW5kIERlc2VydFRvb2wuZXhlIScsXHJcbiAgICAgICAgICAgICcgICAgICAgRVhJVCAvQiAzJyxcclxuICAgICAgICAgICAgJyAgICknLFxyXG4gICAgICAgICAgICAnKScsXHJcbiAgICAgICAgICAgICdJRiAlUVVFUllfRVJST1JMRVZFTCUgPT0gMSAoJyxcclxuICAgICAgICAgICAgJyAgICBFQ0hPIG9uJyxcclxuICAgICAgICAgICAgJ0VDSE8gXCJNRVRBIHRvb2xzIG5vdCBpbnN0YWxsZWQuXCIgPj4gX0ZBSUxFRC50eHQnLFxyXG4gICAgICAgICAgICAnRUNITyBcIlNlZSBFcnJvciBMb2c6IF9GQUlMRUQudHh0XCInLFxyXG4gICAgICAgICAgICAnRVhJVCAvYiAlUVVFUllfRVJST1JMRVZFTCUnLFxyXG4gICAgICAgICAgICAnKScsXHJcbiAgICAgICAgICAgICdwb3BkJ10uam9pbignXFxuJyk7XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ2Rlc2lnblNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsICR0aW1lb3V0LCAkbG9jYXRpb24sICRtb2RhbCwgZ3Jvd2wsIG5vZGVTZXJ2aWNlLCBiYXNlQ3lQaHlTZXJ2aWNlLCBwbHVnaW5TZXJ2aWNlLCBmaWxlU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIHdhdGNoZXJzID0ge307XHJcblxyXG4gICAgICAgIHRoaXMuZWRpdERlc2lnbkZuID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9EZXNpZ25FZGl0Lmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rlc2lnbkVkaXRDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIC8vc2l6ZTogc2l6ZSxcclxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHsgZGF0YTogZnVuY3Rpb24gKCkgeyByZXR1cm4gZGF0YTsgfSB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoZWRpdGVkRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGF0dHJzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICduYW1lJzogZWRpdGVkRGF0YS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICdJTkZPJzogZWRpdGVkRGF0YS5kZXNjcmlwdGlvblxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0RGVzaWduQXR0cmlidXRlcyhkYXRhLmNvbnRleHQsIGRhdGEuaWQsIGF0dHJzKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0F0dHJpYnV0ZSB1cGRhdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5leHBvcnRBc0FkbUZuID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgc2VsZi5leHBvcnREZXNpZ24oZGF0YS5jb250ZXh0LCBkYXRhLmlkKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRvd25sb2FkVXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcygnQURNIGZpbGUgZm9yIDxhIGhyZWY9XCInICsgZG93bmxvYWRVcmwgKyAnXCI+JyArIGRhdGEubmFtZSArICc8L2E+IGV4cG9ydGVkLicpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCdFeHBvcnQgZmFpbGVkLCBzZWUgY29uc29sZSBmb3IgZGV0YWlscy4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZGVsZXRlRm4gPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1NpbXBsZU1vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NpbXBsZU1vZGFsQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUgRGVzaWduIFNwYWNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHM6ICdUaGlzIHdpbGwgZGVsZXRlICcgKyBkYXRhLm5hbWUgKyAnIGZyb20gdGhlIHdvcmtzcGFjZS4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5kZWxldGVEZXNpZ24oZGF0YS5jb250ZXh0LCBkYXRhLmlkKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBkZXNpZ24gZnJvbSB0aGUgY29udGV4dC5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIGRhdGEtYmFzZSBjb25uZWN0aW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkZXNpZ25JZCAtIFBhdGggdG8gZGVzaWduLXNwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSBbbXNnXSAtIENvbW1pdCBtZXNzYWdlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZGVsZXRlRGVzaWduID0gZnVuY3Rpb24gKGNvbnRleHQsIGRlc2lnbklkLCBtc2cpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBtc2cgfHwgJ2Rlc2lnblNlcnZpY2UuZGVsZXRlRGVzaWduICcgKyBkZXNpZ25JZDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZGVzdHJveU5vZGUoY29udGV4dCwgZGVzaWduSWQsIG1lc3NhZ2UpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIGdpdmVuIGF0dHJpYnV0ZXNcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBkZXNpZ24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgZGVzaWduLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LnJlZ2lvbklkIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGRlc2lnbi5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGVzaWduSWQgLSBQYXRoIHRvIGRlc2lnbi1zcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gYXR0cnMgLSBLZXlzIGFyZSBuYW1lcyBvZiBhdHRyaWJ1dGVzIGFuZCB2YWx1ZXMgYXJlIHRoZSB3YW50ZWQgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zZXREZXNpZ25BdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGNvbnRleHQsIGRlc2lnbklkLCBhdHRycykge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS5zZXROb2RlQXR0cmlidXRlcyhjb250ZXh0LCBkZXNpZ25JZCwgYXR0cnMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENhbGxzIEFkbUV4cG9ydGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gQ29udGV4dCBmb3IgcGx1Z2luLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gRGF0YWJhc2UgY29ubmVjdGlvbiB0byBwdWxsIG1vZGVsIGZyb20uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGRlc2lnbklkXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtkZXNlcnRDZmdQYXRoXSAtIFBhdGggdG8gY29uZmlndXJhdGlvbiBpZiBvbmx5IG9uZSBpcyB0byBiZSBleHBvcnRlZC5cclxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSByZXNvbHZlcyB0byB7c3RyaW5nfSBpZiBzdWNjZXNzZnVsLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZXhwb3J0RGVzaWduID0gZnVuY3Rpb24gKGNvbnRleHQsIGRlc2lnbklkLCBkZXNlcnRDZmdQYXRoKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcnVuT25TZXJ2ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbkNvbmZpZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY21zOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzZXJ0Q2ZnOiBkZXNlcnRDZmdQYXRoIHx8ICcnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKGNvbnRleHQsICdBZG1FeHBvcnRlcicsIGNvbmZpZylcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1wie1wic3VjY2Vzc1wiOnRydWUsXCJtZXNzYWdlc1wiOltdLFwiYXJ0aWZhY3RzXCI6W10sXCJwbHVnaW5OYW1lXCI6XCJBRE0gSW1wb3J0ZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAvLyBcInN0YXJ0VGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS4zODNaXCIsXCJmaW5pc2hUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjkzOVpcIixcImVycm9yXCI6bnVsbH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGZpbGVTZXJ2aWNlLmdldERvd25sb2FkVXJsKHJlc3VsdC5hcnRpZmFjdHNbMF0pKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVzdWx0LmVycm9yICsgJyBtZXNzYWdlczogJyArIGFuZ3VsYXIudG9Kc29uKHJlc3VsdC5tZXNzYWdlcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGFuZ3VsYXIudG9Kc29uKHJlc3VsdC5tZXNzYWdlcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdTb21ldGhpbmcgd2VudCB0ZXJyaWJseSB3cm9uZyAnICsgcmVhc29uKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2VuZXJhdGVEYXNoYm9hcmQgPSBmdW5jdGlvbiAoY29udGV4dCwgZGVzaWduSWQsIHJlc3VsdElkcykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGU6IGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uU2VydmVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5Db25maWc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0SURzOiByZXN1bHRJZHMuam9pbignOycpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoY29uZmlnKSk7XHJcbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKGNvbnRleHQsICdHZW5lcmF0ZURhc2hib2FyZCcsIGNvbmZpZylcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0TGlnaHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHJlc3VsdC5zdWNjZXNzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnRpZmFjdHNIdG1sOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXM6IHJlc3VsdC5tZXNzYWdlc1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZXN1bHRcIiwgcmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLmdldFBsdWdpbkFydGlmYWN0c0h0bWwocmVzdWx0LmFydGlmYWN0cylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGFydGlmYWN0c0h0bWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdExpZ2h0LmFydGlmYWN0c0h0bWwgPSBhcnRpZmFjdHNIdG1sO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHRMaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdTb21ldGhpbmcgd2VudCB0ZXJyaWJseSB3cm9uZywgJyArIHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMud2F0Y2hEZXNpZ25Ob2RlID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGRlc2lnbklkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaERlc2lnbicsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGE6IG51bGwsIC8vIE1FVEEgbm9kZXMgLSBuZWVkZWQgd2hlbiBjcmVhdGluZyBuZXcgbm9kZXMuLi5cclxuICAgICAgICAgICAgICAgICAgICBkZXNpZ246IHt9IC8vIGRlc2lnbiB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+LCBub2RlIDxOb2RlT2JqPn1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5kZXNpZ24ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbi5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEZXNjICE9PSBkYXRhLmRlc2lnbi5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbi5kZXNjcmlwdGlvbiA9IG5ld0Rlc2M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YS5kZXNpZ259KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgZGVzaWduSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRlc2lnbk5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5tZXRhID0gbWV0YTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBkZXNpZ25Ob2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2lnbk5vZGUuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlOiBkZXNpZ25Ob2RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbk5vZGUub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAgV2F0Y2hlcyBhbGwgY29udGFpbmVycyAoZXhpc3RlbmNlIGFuZCB0aGVpciBhdHRyaWJ1dGVzKSBvZiBhIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gd29ya3NwYWNlSWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLiBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLmRlc2lnbnMuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaERlc2lnbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoRGVzaWducycsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2lnbnM6IHt9IC8vIGRlc2lnbiB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+fVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLmRlc2lnbnNbaWRdLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ25zW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEZXNjICE9PSBkYXRhLmRlc2lnbnNbaWRdLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduc1tpZF0uZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEuZGVzaWduc1tpZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuZGVzaWduc1tpZF07XHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogbnVsbH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25JZCA9IGNoaWxkTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduc1tkZXNpZ25JZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnSU5GTycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbklkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbnNbZGVzaWduSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJTkZPJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGRlc2lnbklkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuZGVzaWduc1tkZXNpZ25JZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYWxsIGNvbnRhaW5lcnMgKGV4aXN0ZW5jZSBhbmQgdGhlaXIgYXR0cmlidXRlcykgb2YgYSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGRlc2lnbklkXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hOYnJPZkNvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGRlc2lnbklkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE5ick9mQ29uZmlndXJhdGlvbnNfJyArIGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRzOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uczogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogMFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaENvbmZpZ3VyYXRpb24gPSBmdW5jdGlvbiAoY2ZnTm9kZSwgbWV0YSwgd2FzQ3JlYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjZmdEZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdE9uVW5sb2FkID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLnJlc3VsdHMgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ291bnQgdGhpcyBzZXQgYW5kIGFkZCBhbiB1bmxvYWQgaGFuZGxlLlxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMuY29uZmlndXJhdGlvbnMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod2FzQ3JlYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGNmZ05vZGUuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjZmdOb2RlLm9uVW5sb2FkKGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLmNvbmZpZ3VyYXRpb25zIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNmZ05vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLlJlc3VsdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLnJlc3VsdHMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQocmVzdWx0T25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNmZ05vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5SZXN1bHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudGVycy5yZXN1bHRzICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKHJlc3VsdE9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNmZ0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNmZ0RlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hDb25maWd1cmF0aW9uU2V0ID0gZnVuY3Rpb24gKHNldE5vZGUsIG1ldGEsIHdhc0NyZWF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2V0RGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvdW50IHRoaXMgc2V0IGFuZCBhZGQgYW4gdW5sb2FkIGhhbmRsZS5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLnNldHMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod2FzQ3JlYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IHNldE5vZGUuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzZXROb2RlLm9uVW5sb2FkKGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLnNldHMgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0Tm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoQ29uZmlndXJhdGlvbihjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXROb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaENvbmZpZ3VyYXRpb24obmV3Q2hpbGQsIG1ldGEsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldERlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldERlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXREZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIGRlc2lnbklkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkZXNpZ25Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbk5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvblNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hDb25maWd1cmF0aW9uU2V0KGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbk5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvblNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hDb25maWd1cmF0aW9uU2V0KG5ld0NoaWxkLCBtZXRhLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGEgZGVzaWduKHNwYWNlKSB3LnIudC4gaW50ZXJmYWNlcy5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gZGVzaWduSWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGRlc2lnbklkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS53YXRjaEludGVyZmFjZXMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGRlc2lnbklkLCB1cGRhdGVMaXN0ZW5lcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGZ1bGwgaGllcmFyY2h5IG9mIGEgZGVzaWduIHcuci50LiBjb250YWluZXJzIGFuZCBjb21wb25lbnRzLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkZXNpZ25JZCAtIHBhdGggdG8gcm9vdCBjb250YWluZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hEZXNpZ25TdHJ1Y3R1cmUgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZGVzaWduSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoRGVzaWduU3RydWN0dXJlXycgKyBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcm9vdElkOiBkZXNpZ25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJzOiB7fSwgLy8gY29udGFpbmVyOiB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgcGFyZW50SWQ6IDxzdHJpbmc+LCB0eXBlOiA8c3RyaW5nPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgc3ViQ29udGFpbmVyczoge2lkOjxzdHJpbmc+OiA8Y29udGFpbmVyPn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIGNvbXBvbmVudHM6ICAgIHtpZDo8c3RyaW5nPjogPGNvbnRhaW5lcj59fVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IHt9ICAvLyBjb21wb25lbnQ6IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBwYXJlbnRJZDogPHN0cmluZz4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICwgYXZtSWQ6IDxzdHJpbmc+IH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBnZXRDb21wb25lbnRJbmZvID0gZnVuY3Rpb24gKG5vZGUsIHBhcmVudElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IG5vZGUuZ2V0SWQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50SWQ6IHBhcmVudElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdm1JZDogbm9kZS5nZXRBdHRyaWJ1dGUoJ0lEJylcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUNvbnRhaW5lclJlYyA9IGZ1bmN0aW9uIChjb250YWluZXJOb2RlLCByb290Q29udGFpbmVyLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VubG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNvbnRhaW5lck5vZGUuZ2V0SWQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb250YWluZXJOb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGNvbnRhaW5lck5vZGUuZ2V0QXR0cmlidXRlKCdUeXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViQ29udGFpbmVyczoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czoge31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICByb290Q29udGFpbmVyLnN1YkNvbnRhaW5lcnNbY29udGFpbmVyTm9kZS5nZXRJZCgpXSA9IGNvbnRhaW5lcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb250YWluZXJzW2NvbnRhaW5lck5vZGUuZ2V0SWQoKV0gPSBjb250YWluZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tQ29udGFpbmVyUmVjKGNoaWxkTm9kZSwgY29udGFpbmVyLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1Db21wb25lbnRNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQgPSBnZXRDb21wb25lbnRJbmZvKGNoaWxkTm9kZSwgY29udGFpbmVyLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuY29tcG9uZW50c1tjaGlsZE5vZGUuZ2V0SWQoKV0gPSBjb21wb25lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2NoaWxkTm9kZS5nZXRJZCgpXSA9IGNvbXBvbmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5Db250YWluZXIpKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Db250YWluZXJSZWMobmV3Q2hpbGQsIGNvbnRhaW5lciwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1Db21wb25lbnRNb2RlbCkpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcltjaGlsZE5vZGUuZ2V0SWQoKV0gPSBnZXRDb21wb25lbnRJbmZvKGNoaWxkTm9kZSwgY29udGFpbmVyLmlkKTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCBkZXNpZ25JZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocm9vdE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdE5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290Q29udGFpbmVyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogcm9vdE5vZGUuZ2V0SWQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnVHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJDb250YWluZXJzOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czoge31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbnRhaW5lcnNbcm9vdENvbnRhaW5lci5pZF0gPSByb290Q29udGFpbmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb250YWluZXJzW3Jvb3RDb250YWluZXIuaWRdID0gcm9vdENvbnRhaW5lcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Db250YWluZXJSZWMoY2hpbGROb2RlLCByb290Q29udGFpbmVyLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IGdldENvbXBvbmVudEluZm8oY2hpbGROb2RlLCByb290Q29udGFpbmVyLmlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdENvbnRhaW5lci5jb21wb25lbnRzW2NoaWxkTm9kZS5nZXRJZCgpXSA9IGNvbXBvbmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzW2NoaWxkTm9kZS5nZXRJZCgpXSA9IGNvbXBvbmVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUNvbnRhaW5lclJlYyhuZXdDaGlsZCwgcm9vdENvbnRhaW5lciwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVk1Db21wb25lbnRNb2RlbCkpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290Q29udGFpbmVyLmNvbXBvbmVudHNbY2hpbGROb2RlLmdldElkKCldID0gZ2V0Q29tcG9uZW50SW5mbyhjaGlsZE5vZGUsIHJvb3RDb250YWluZXIuaWQpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGdlbmVyYXRlZCBEZXNlcnRDb25maWd1cmF0aW9uU2V0cyBpbnNpZGUgYSBEZXNpZ24uXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGRlc2lnbklkIC0gcGF0aCB0byBkZXNpZ24gb2Ygd2hpY2ggdG8gd2F0Y2guXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hDb25maWd1cmF0aW9uU2V0cyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hDb25maWd1cmF0aW9uU2V0c18nICsgZGVzaWduSWQsXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uU2V0czoge30gLy9jb25maWd1cmF0aW9uU2V0IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz59XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgZGVzaWduSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRlc2lnbk5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5uYW1lID0gZGVzaWduTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5sb2FkQ2hpbGRyZW4oY29udGV4dClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5jb25maWd1cmF0aW9uU2V0c1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29uZmlndXJhdGlvblNldHNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmNvbmZpZ3VyYXRpb25TZXRzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkTm9kZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZXNbaV0uaXNNZXRhVHlwZU9mKG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvblNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBjaGlsZE5vZGVzW2ldLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbmZpZ3VyYXRpb25TZXRzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZXNbaV0uZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZXNbaV0uZ2V0QXR0cmlidXRlKCdJTkZPJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGVzW2ldLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZXNbaV0ub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05vZGUuaXNNZXRhVHlwZU9mKG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvblNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBuZXdOb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbmZpZ3VyYXRpb25TZXRzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld05vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG5ld05vZGUuZ2V0QXR0cmlidXRlKCdJTkZPJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld05vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogY2hpbGRJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBnZW5lcmF0ZWQgRGVzZXJ0Q29uZmlndXJhdGlvbnMgaW5zaWRlIGEgRGVzZXJ0Q29uZmlndXJhdGlvblNldHMuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbmZpZ3VyYXRpb25TZXRJZCAtIHBhdGggdG8gRGVzZXJ0Q29uZmlndXJhdGlvblNldCBvZiB3aGljaCB0byB3YXRjaC5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaENvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGNvbmZpZ3VyYXRpb25TZXRJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hDb25maWd1cmF0aW9uc18nICsgY29uZmlndXJhdGlvblNldElkLFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IHt9IC8vY29uZmlndXJhdGlvbiB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogPHN0cmluZz59XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtyZWdpb25JZF0gPSBjb250ZXh0O1xyXG5cclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIGNvbmZpZ3VyYXRpb25TZXRJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY2ZnU2V0Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZmdTZXROb2RlLmxvYWRDaGlsZHJlbihjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNoaWxkTm9kZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBbHRBc3MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnQWx0ZXJuYXRpdmVBc3NpZ25tZW50cycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS5jb25maWd1cmF0aW9uc1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29uZmlndXJhdGlvbnNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0FsdEFzcyAhPT0gZGF0YS5jb25maWd1cmF0aW9uc1tpZF0uYWx0ZXJuYXRpdmVBc3NpZ25tZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29uZmlndXJhdGlvbnNbaWRdLmFsdGVybmF0aXZlQXNzaWdubWVudHMgPSBuZXdBbHRBc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1cGRhdGUnLCBkYXRhOiBkYXRhLmNvbmZpZ3VyYXRpb25zW2lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuY29uZmlndXJhdGlvbnNbaWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuY29uZmlndXJhdGlvbnNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gY2hpbGROb2Rlc1tpXS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2Rlc1tpXS5pc01ldGFUeXBlT2YobWV0YS5EZXNlcnRDb25maWd1cmF0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25maWd1cmF0aW9uc1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGVzW2ldLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlQXNzaWdubWVudHM6IGNoaWxkTm9kZXNbaV0uZ2V0QXR0cmlidXRlKCdBbHRlcm5hdGl2ZUFzc2lnbm1lbnRzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGVzW2ldLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZXNbaV0ub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZmdTZXROb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05vZGUuaXNNZXRhVHlwZU9mKG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBuZXdOb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbmZpZ3VyYXRpb25zW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld05vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogbmV3Tm9kZS5nZXRBdHRyaWJ1dGUoJ0FsdGVybmF0aXZlQXNzaWdubWVudHMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld05vZGUub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Tm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBjaGlsZElkLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY29uZmlndXJhdGlvbnNbY2hpbGRJZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBnZW5lcmF0ZWQgRGVzZXJ0Q29uZmlndXJhdGlvblNldHMgaW5zaWRlIGEgRGVzaWduLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWd1cmF0aW9uIC0gQ29uZmlndXJhdGlvbiBvZiB3aGljaCB0byB3YXRjaC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29uZmlndXJhdGlvbi5pZCAtIHBhdGggdG8gQ29uZmlndXJhdGlvbiBvZiB3aGljaCB0byB3YXRjaC5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5hcHBlbmRXYXRjaFJlc3VsdHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgY29uZmlndXJhdGlvbikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaFJlc3VsdHNfJyArIGNvbmZpZ3VyYXRpb24uaWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW3JlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucmVnaW9uSWQgPSByZWdpb25JZDtcclxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5yZXN1bHRzID0ge307XHJcblxyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgY29uZmlndXJhdGlvbi5pZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoY2ZnTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZmdOb2RlLmxvYWRDaGlsZHJlbihjb250ZXh0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGNoaWxkTm9kZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzUmVzdWx0cyA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlc3VsdHNbaWRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjb25maWd1cmF0aW9uLnJlc3VsdHNbaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZE5vZGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBjaGlsZE5vZGVzW2ldLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGVzW2ldLmlzTWV0YVR5cGVPZihtZXRhLlJlc3VsdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucmVzdWx0c1tjaGlsZElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vbmFtZTogY2hpbGROb2Rlc1tpXS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NoaWxkTm9kZXNbaV0ub25VcGRhdGUob25VcGRhdGUpOyBUT0RPOiBXaGVuIGF0dHJpYnV0ZXMgYXJlIHdhdGNoIGFkZCB0aGlzLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2Rlc1tpXS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNSZXN1bHRzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdOb2RlLmlzTWV0YVR5cGVPZihtZXRhLlJlc3VsdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBuZXdOb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5yZXN1bHRzW2NoaWxkSWRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGhhc1Jlc3VsdHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsU2F2ZURlc2VydENvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKGNvbnRleHQsIHNldE5hbWUsIHNldERlc2MsIGNvbmZpZ3VyYXRpb25zLCBkZXNpZ25JZCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGU6IGRlc2lnbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uU2VydmVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5Db25maWc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0RGF0YTogYW5ndWxhci50b0pzb24oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogc2V0TmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzZXREZXNjIHx8ICcnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uczogYW5ndWxhci50b0pzb24oY29uZmlndXJhdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKGNvbnRleHQsICdTYXZlRGVzZXJ0Q29uZmlndXJhdGlvbnMnLCBjb25maWcpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nLCAnICsgcmVhc29uKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zYXZlQ29uZmlndXJhdGlvblNldCA9IGZ1bmN0aW9uIChzZXROYW1lLCBzZXREZXNjLCBjb25maWd1cmF0aW9ucywgZGVzaWduTm9kZSwgbWV0YSkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IGRlc2lnbk5vZGUuY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuY3JlYXRlTm9kZShjb250ZXh0LCBkZXNpZ25Ob2RlLCBtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQsICd3ZWItY3lwaHkgc2F2ZUNvbmZpZ3VyYXRpb25TZXQnKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHNldE5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY291bnRlciA9IGNvbmZpZ3VyYXRpb25zLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29uZmlnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNmZ05vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyIC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5jcmVhdGVOb2RlKGNvbnRleHQsIHNldE5vZGUsIG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvbiwgJ3dlYi1jeXBoeSBzYXZlQ29uZmlndXJhdGlvblNldCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG5ld05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBjb25maWd1cmF0aW9uc1tjb3VudGVyXS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZmdOb2RlID0gbmV3Tm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNmZ05vZGUuc2V0QXR0cmlidXRlKCduYW1lJywgbmFtZSwgJ3dlYi1jeXBoeSBzZXQgbmFtZSB0byAnICsgbmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhYVN0ciA9IEpTT04uc3RyaW5naWZ5KGNvbmZpZ3VyYXRpb25zW2NvdW50ZXJdLmFsdGVybmF0aXZlQXNzaWdubWVudHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2ZnTm9kZS5zZXRBdHRyaWJ1dGUoJ0FsdGVybmF0aXZlQXNzaWdubWVudHMnLCBhYVN0cixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnd2ViLWN5cGh5IHNldCBBbHRlcm5hdGl2ZUFzc2lnbm1lbnRzIHRvICcgKyBhYVN0cik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3VudGVyID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29uZmlnKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnUHJvYmxlbXMgY3JlYXRpbmcgY29uZmlndXJhdGlvbnMgbm9kZXMnICsgcmVhc29uLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0Tm9kZS5zZXRBdHRyaWJ1dGUoJ25hbWUnLCBzZXROYW1lLCAnd2ViLWN5cGh5IHNldCBuYW1lIHRvICcgKyBzZXROYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2V0RGVzYykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldE5vZGUuc2V0QXR0cmlidXRlKCdJTkZPJywgc2V0RGVzYywgJ3dlYi1jeXBoeSBzZXQgSU5GTyB0byAnICsgc2V0RGVzYykuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29uZmlnKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnTm8gY29uZmlndXJhdGlvbnMgZ2l2ZW4hJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY291bnRlciA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29uZmlnKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdObyBjb25maWd1cmF0aW9ucyBnaXZlbiEnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucy5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBBbGxSZWdpb25zID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQpIHtcclxuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyh3YXRjaGVycywgcGFyZW50Q29udGV4dCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsZWFuVXBSZWdpb24gPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgcmVnaW9uSWQpIHtcclxuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCByZWdpb25JZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJXYXRjaGVyID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGZuKSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBmbik7XHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBXZWJHTUVHbG9iYWwsIGNvbnNvbGUqL1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCdleGVjdXRvclNlcnZpY2UnLCBmdW5jdGlvbiAoJHEpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIGV4ZWN1dG9yQ2xpZW50ID0gbmV3IFdlYkdNRUdsb2JhbC5jbGFzc2VzLkV4ZWN1dG9yQ2xpZW50KCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3JlYXRlSm9iID0gZnVuY3Rpb24gKGpvYkRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgZXhlY3V0b3JDbGllbnQuY3JlYXRlSm9iKGpvYkRhdGEsIGZ1bmN0aW9uIChlcnIsIGpvYkluZm8pIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShqb2JJbmZvKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmdldEluZm8gPSBmdW5jdGlvbiAoam9iSGFzaCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBleGVjdXRvckNsaWVudC5nZXRJbmZvKGpvYkhhc2gsIGZ1bmN0aW9uIChlcnIsIGpvYkluZm8pIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShqb2JJbmZvKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmdldFdvcmtlcnNJbmZvID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBleGVjdXRvckNsaWVudC5nZXRXb3JrZXJzSW5mbyhmdW5jdGlvbiAoZXJyLCByZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIFdlYkdNRUdsb2JhbCwgY29uc29sZSovXHJcblxyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCdmaWxlU2VydmljZScsIGZ1bmN0aW9uICgkcSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIGJsb2JDbGllbnQgPSBuZXcgV2ViR01FR2xvYmFsLmNsYXNzZXMuQmxvYkNsaWVudCgpO1xyXG5cclxuICAgICAgICAvL1RPRE86IENvbnNpZGVyIG1ha2luZyBhbiBBcnRpZmFjdCAnQ2xhc3MnLlxyXG4gICAgICAgIHRoaXMuY3JlYXRlQXJ0aWZhY3QgPSBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYmxvYkNsaWVudC5jcmVhdGVBcnRpZmFjdChuYW1lKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNhdmVBcnRpZmFjdCA9IGZ1bmN0aW9uIChhcnRpZmFjdCkge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBhcnRpZmFjdC5zYXZlKGZ1bmN0aW9uIChlcnIsIGFydGllSGFzaCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGFydGllSGFzaCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRBcnRpZmFjdCA9IGZ1bmN0aW9uIChoYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGJsb2JDbGllbnQuZ2V0QXJ0aWZhY3QoaGFzaCwgZnVuY3Rpb24gKGVyciwgYXJ0aWZhY3QpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHthcnRpZmFjdDogYXJ0aWZhY3QsIGhhc2g6IGhhc2h9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYWRkRmlsZVRvQXJ0aWZhY3QgPSBmdW5jdGlvbiAoYXJ0aWZhY3QsIGZpbGVOYW1lLCBjb250ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGFydGlmYWN0LmFkZEZpbGUoZmlsZU5hbWUsIGNvbnRlbnQsIGZ1bmN0aW9uIChlcnIsIGhhc2hlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGhhc2hlcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRkcyBtdWx0aXBsZSBmaWxlcyB0byBnaXZlbiBhcnRpZmFjdC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmFkZEZpbGVzVG9BcnRpZmFjdCA9IGZ1bmN0aW9uIChhcnRpZmFjdCwgZmlsZXMpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgYXJ0aWZhY3QuYWRkRmlsZXMoZmlsZXMsIGZ1bmN0aW9uIChlcnIsIGhhc2hlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGhhc2hlcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRGaWxlQXNTb2Z0TGlua1RvQXJ0aWZhY3QgPSBmdW5jdGlvbiAoYXJ0aWZhY3QsIGZpbGVOYW1lLCBjb250ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgICAgICBhcnRpZmFjdC5hZGRGaWxlQXNTb2Z0TGluayhmaWxlTmFtZSwgY29udGVudCwgZnVuY3Rpb24gKGVyciwgaGFzaCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGhhc2gpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0TWV0YWRhdGEgPSBmdW5jdGlvbiAoaGFzaCkge1xyXG4vLyAgICAgICAgRXhhbXBsZSBvZiByZXR1cm5lZCBkYXRhLlxyXG4vLyAgICAgICAge1xyXG4vLyAgICAgICAgICAgIFwibmFtZVwiOiBcInRiQXNzZXQuemlwXCIsXHJcbi8vICAgICAgICAgICAgXCJzaXplXCI6IDEwMzg1NCxcclxuLy8gICAgICAgICAgICBcIm1pbWVcIjogXCJhcHBsaWNhdGlvbi96aXBcIixcclxuLy8gICAgICAgICAgICBcImlzUHVibGljXCI6IGZhbHNlLFxyXG4vLyAgICAgICAgICAgIFwidGFnc1wiOiBbXSxcclxuLy8gICAgICAgICAgICBcImNvbnRlbnRcIjogXCIyMzU3ZmJkNjczYmVjNmU5NTkwZWU4YmEzNGVjOGRmOGE4NWRkYWY4XCIsXHJcbi8vICAgICAgICAgICAgXCJjb250ZW50VHlwZVwiOiBcIm9iamVjdFwiLFxyXG4vLyAgICAgICAgICAgIFwibGFzdE1vZGlmaWVkXCI6IFwiMjAxNC0xMS0wOVQwMDoyMToyMi4wMDBaXCJcclxuLy8gICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgYmxvYkNsaWVudC5nZXRNZXRhZGF0YShoYXNoLCBmdW5jdGlvbiAoZXJyLCBtZXRhRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKG1ldGFEYXRhKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmdldE9iamVjdCA9IGZ1bmN0aW9uIChoYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGJsb2JDbGllbnQuZ2V0T2JqZWN0KGhhc2gsIGZ1bmN0aW9uIChlcnIsIGNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShjb250ZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBkb3dubG9hZCB1cmwgZm9yIHRoZSBnaXZlbiBoYXNoLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBoYXNoIC0gaGFzaCB0byBibG9iIGZpbGUuXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gLSB0aGUgZG93bmxvYWQgdXJsIChudWxsIGlmIGhhc2ggaXMgZW1wdHkpLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZ2V0RG93bmxvYWRVcmwgPSBmdW5jdGlvbiAoaGFzaCkge1xyXG4gICAgICAgICAgICB2YXIgdXJsO1xyXG4gICAgICAgICAgICBpZiAoaGFzaCkge1xyXG4gICAgICAgICAgICAgICAgdXJsID0gYmxvYkNsaWVudC5nZXREb3dubG9hZFVSTChoYXNoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gaGFzaCB0byBibG9iIGZpbGUgZ2l2ZW4nKTtcclxuICAgICAgICAgICAgICAgIHVybCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB1cmw7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZmlsZSBleHRlbnNpb24gb2YgdGhlIGdpdmVuIGZpbGVuYW1lLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZVxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gdGhlIHJlc3VsdGluZyBmaWxlIGV4dGVuc2lvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmdldEZpbGVFeHRlbnNpb24gPSBmdW5jdGlvbiAoZmlsZW5hbWUpIHtcclxuICAgICAgICAgICAgdmFyIGEgPSBmaWxlbmFtZS5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgIGlmIChhLmxlbmd0aCA9PT0gMSB8fCAoYVswXSA9PT0gXCJcIiAmJiBhLmxlbmd0aCA9PT0gMikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhLnBvcCgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRm9ybWF0cyB0aGUgc2l6ZSBpbnRvIGEgaHVtYW4gcmVhZGFibGUgc3RyaW5nLlxyXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBieXRlcyAtIHNpemUgaW4gYnl0ZXMuXHJcbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBzaSAtIHJldHVybiByZXN1bHQgaW4gU0lVbml0cyBvciBub3QuXHJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gLSBmb3JtYXR0ZWQgZmlsZSBzaXplLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuaHVtYW5GaWxlU2l6ZSA9IGZ1bmN0aW9uIChieXRlcywgc2kpIHtcclxuICAgICAgICAgICAgdmFyIHRocmVzaCA9IHNpID8gMTAwMCA6IDEwMjQsXHJcbiAgICAgICAgICAgICAgICB1bml0cyxcclxuICAgICAgICAgICAgICAgIHU7XHJcbiAgICAgICAgICAgIGlmIChieXRlcyA8IHRocmVzaCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ5dGVzICsgJyBCJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdW5pdHMgPSBzaSA/IFsna0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXSA6XHJcbiAgICAgICAgICAgICAgICAgICAgWydLaUInLCAnTWlCJywgJ0dpQicsICdUaUInLCAnUGlCJywgJ0VpQicsICdaaUInLCAnWWlCJ107XHJcbiAgICAgICAgICAgIHUgPSAtMTtcclxuXHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGJ5dGVzID0gYnl0ZXMgLyB0aHJlc2g7XHJcbiAgICAgICAgICAgICAgICB1ICs9IDE7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKGJ5dGVzID49IHRocmVzaCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYnl0ZXMudG9GaXhlZCgxKSArICcgJyArIHVuaXRzW3VdO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIFdlYkN5UGh5U3BlY2lmaWMgZnVuY3Rpb25zLlxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUT0RPOiBUaGlzIG1ldGhvZCBzaG91bGQgdXNlIHByb21pc2VzIGludGVybmFsbHkhXHJcbiAgICAgICAgICogQHBhcmFtIGZpbGVzXHJcbiAgICAgICAgICogQHBhcmFtIHZhbGlkRXh0ZW5zaW9uc1xyXG4gICAgICAgICAqIEByZXR1cm5zIHsqfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuc2F2ZURyb3BwZWRGaWxlcyA9IGZ1bmN0aW9uIChmaWxlcywgdmFsaWRFeHRlbnNpb25zKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBpLFxyXG4gICAgICAgICAgICAgICAgY291bnRlciA9IGZpbGVzLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgIGFydGllID0gYmxvYkNsaWVudC5jcmVhdGVBcnRpZmFjdCgnZHJvcHBlZEZpbGVzJyksXHJcbiAgICAgICAgICAgICAgICBhZGRGaWxlLFxyXG4gICAgICAgICAgICAgICAgYWRkZWRGaWxlcyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgZmlsZUV4dGVuc2lvblRvSWNvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICAnemlwJzogJ2ZhIGZhLXB1enpsZS1waWVjZScsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2FkbSc6ICdmYSBmYS1jdWJlcycsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2F0bSc6ICdnbHlwaGljb24gZ2x5cGhpY29uLXNhdmVkJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvdW50ZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3VudGVyIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShhZGRlZEZpbGVzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY291bnRlciA9IGZpbGVzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGFkZEZpbGUgPSBmdW5jdGlvbiAoZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpbGVFeHRlbnNpb24gPSBzZWxmLmdldEZpbGVFeHRlbnNpb24oZmlsZS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIGlmICghdmFsaWRFeHRlbnNpb25zIHx8IHZhbGlkRXh0ZW5zaW9uc1tmaWxlRXh0ZW5zaW9uXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFydGllLmFkZEZpbGVBc1NvZnRMaW5rKGZpbGUubmFtZSwgZmlsZSwgZnVuY3Rpb24gKGVyciwgaGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgYWRkIGZpbGUgXCInICsgZmlsZS5uYW1lICsgJ1wiIHRvIGJsb2IsIGVycjogJyArIGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkZWRGaWxlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc2g6IGhhc2gsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBmaWxlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBmaWxlRXh0ZW5zaW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogc2VsZi5odW1hbkZpbGVTaXplKGZpbGUuc2l6ZSwgdHJ1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGJsb2JDbGllbnQuZ2V0RG93bmxvYWRVUkwoaGFzaCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBmaWxlRXh0ZW5zaW9uVG9JY29uW2ZpbGVFeHRlbnNpb25dIHx8ICcnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNvdW50ZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBhZGRGaWxlKGZpbGVzW2ldKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBXZWJHTUVHbG9iYWwsIGNvbnNvbGUqL1xyXG5cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycpXHJcbiAgICAuc2VydmljZSgncGx1Z2luU2VydmljZScsIGZ1bmN0aW9uICgkcSwgZGF0YVN0b3JlU2VydmljZSwgZmlsZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHRcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwbHVnaW5OYW1lIC0gTmFtZSBvZiBwbHVnaW4gdG8gZXhlY3V0ZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gT2JqZWN0IHdpdGggcGx1Z2luIGNvbmZpZ3VyYXRpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3Quc3RyaW5nfSBjb25maWcuYWN0aXZlTm9kZSAtIFBhdGggdG8gYWN0aXZlTm9kZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC5BcnJheS48c3RyaW5nPn0gY29uZmlnLmFjdGl2ZVNlbGVjdGlvbiAtIFBhdGhzIHRvIG5vZGVzIGluIGFjdGl2ZVNlbGVjdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdC5ib29sZWFufSBjb25maWcucnVuT25TZXJ2ZXIgLSBXaGV0aGVyIHRvIHJ1biB0aGUgcGx1Z2luIG9uIHRoZSBzZXJ2ZXIgb3Igbm90LlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0Lm9iamVjdH0gY29uZmlnLnBsdWdpbkNvbmZpZyAtIFBsdWdpbiBzcGVjaWZpYyBvcHRpb25zLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMucnVuUGx1Z2luID0gZnVuY3Rpb24gKGNvbnRleHQsIHBsdWdpbk5hbWUsIGNvbmZpZykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgZGJDb25uID0gZGF0YVN0b3JlU2VydmljZS5nZXREYXRhYmFzZUNvbm5lY3Rpb24oY29udGV4dC5kYiksXHJcbiAgICAgICAgICAgICAgICBpbnRlcnByZXRlck1hbmFnZXIgPSBuZXcgV2ViR01FR2xvYmFsLmNsYXNzZXMuSW50ZXJwcmV0ZXJNYW5hZ2VyKGRiQ29ubi5jbGllbnQpO1xyXG5cclxuICAgICAgICAgICAgaW50ZXJwcmV0ZXJNYW5hZ2VyLnJ1bihwbHVnaW5OYW1lLCBjb25maWcsIGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnTm8gUmVzdWx0IHdhcyByZXR1cm4gZnJvbSBwbHVnaW4gZXhlY3V0aW9uIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0UGx1Z2luQXJ0aWZhY3RzSHRtbCA9IGZ1bmN0aW9uIChhcnRpZUhhc2hlcykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICBpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGFydGllSGFzaGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaChmaWxlU2VydmljZS5nZXRBcnRpZmFjdChhcnRpZUhhc2hlc1tpXSkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgnJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uIChhcnRpZmFjdHNJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGosXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvd25sb2FkVXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnRpZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFydGlmYWN0c0h0bWwgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgYXJ0aWZhY3RzSW5mby5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb3dubG9hZFVybCA9IGZpbGVTZXJ2aWNlLmdldERvd25sb2FkVXJsKGFydGlmYWN0c0luZm9bal0uaGFzaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFydGllTmFtZSA9IGFydGlmYWN0c0luZm9bal0uYXJ0aWZhY3QubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWZhY3RzSHRtbCArPSAnPGJyPiA8YSBocmVmPVwiJyArIGRvd25sb2FkVXJsICsgJ1wiPicgKyBhcnRpZU5hbWUgKyAnPC9hPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYXJ0aWZhY3RzSHRtbCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuICAgIH0pOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXHJcbiAqL1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2N5cGh5LnNlcnZpY2VzJylcclxuICAgIC5zZXJ2aWNlKCd0ZXN0QmVuY2hTZXJ2aWNlJywgZnVuY3Rpb24gKCRxLCAkdGltZW91dCwgJG1vZGFsLCBub2RlU2VydmljZSwgYmFzZUN5UGh5U2VydmljZSwgcGx1Z2luU2VydmljZSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgICAgICAgIHdhdGNoZXJzID0ge307XHJcblxyXG4gICAgICAgIHRoaXMuZWRpdFRlc3RCZW5jaEZuID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9UZXN0QmVuY2hFZGl0Lmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1Rlc3RCZW5jaEVkaXRDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIC8vc2l6ZTogc2l6ZSxcclxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHsgZGF0YTogZnVuY3Rpb24gKCkgeyByZXR1cm4gZGF0YTsgfSB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoZWRpdGVkRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGF0dHJzID0geyB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGVkaXRlZERhdGEuZGVzY3JpcHRpb24gIT09IGRhdGEudGVzdEJlbmNoLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnMuSU5GTyA9IGVkaXRlZERhdGEuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZWRpdGVkRGF0YS5uYW1lICE9PSBkYXRhLnRlc3RCZW5jaC50aXRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJzLm5hbWUgPSBlZGl0ZWREYXRhLm5hbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZWRpdGVkRGF0YS5maWxlSW5mby5oYXNoICE9PSBkYXRhLnRlc3RCZW5jaC5kYXRhLmZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnMuVGVzdEJlbmNoRmlsZXMgPSBlZGl0ZWREYXRhLmZpbGVJbmZvLmhhc2g7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZWRpdGVkRGF0YS5wYXRoICE9PSBkYXRhLnRlc3RCZW5jaC5kYXRhLnBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRycy5JRCA9IGVkaXRlZERhdGEucGF0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRlc3RCZW5jaEF0dHJpYnV0ZXMoZGF0YS5lZGl0Q29udGV4dCwgZGF0YS5pZCwgYXR0cnMpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQXR0cmlidXRlKHMpIHVwZGF0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmRlbGV0ZUZuID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9TaW1wbGVNb2RhbC5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTaW1wbGVNb2RhbENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnRGVsZXRlIFRlc3QgQmVuY2gnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogJ1RoaXMgd2lsbCBkZWxldGUgJyArIGRhdGEubmFtZSArICcgZnJvbSB0aGUgd29ya3NwYWNlLidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRlbGV0ZVRlc3RCZW5jaChkYXRhLmNvbnRleHQsIGRhdGEuaWQpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIHRlc3QgYmVuY2ggZnJvbSB0aGUgY29udGV4dC5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIGRhdGEtYmFzZSBjb25uZWN0aW9uLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXN0QmVuY2hJZCAtIFBhdGggdG8gZGVzaWduLXNwYWNlLlxyXG4gICAgICAgICAqIEBwYXJhbSBbbXNnXSAtIENvbW1pdCBtZXNzYWdlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZGVsZXRlVGVzdEJlbmNoID0gZnVuY3Rpb24gKGNvbnRleHQsIHRlc3RCZW5jaElkLCBtc2cpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBtc2cgfHwgJ3Rlc3RCZW5jaFNlcnZpY2UuZGVsZXRlVGVzdEJlbmNoICcgKyB0ZXN0QmVuY2hJZDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZGVzdHJveU5vZGUoY29udGV4dCwgdGVzdEJlbmNoSWQsIG1lc3NhZ2UpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZXhwb3J0VGVzdEJlbmNoID0gZnVuY3Rpb24gKHRlc3RCZW5jaElkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkLicpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIGdpdmVuIGF0dHJpYnV0ZXNcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSB0ZXN0IGJlbmNoLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIHRlc3QgYmVuY2guXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQucmVnaW9uSWQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgdGVzdCBiZW5jaC5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGVzdEJlbmNoSWQgLSBQYXRoIHRvIHRlc3QgYmVuY2guXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGF0dHJzIC0gS2V5cyBhcmUgbmFtZXMgb2YgYXR0cmlidXRlcyBhbmQgdmFsdWVzIGFyZSB0aGUgd2FudGVkIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuc2V0VGVzdEJlbmNoQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChjb250ZXh0LCB0ZXN0QmVuY2hJZCwgYXR0cnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJhc2VDeVBoeVNlcnZpY2Uuc2V0Tm9kZUF0dHJpYnV0ZXMoY29udGV4dCwgdGVzdEJlbmNoSWQsIGF0dHJzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnJ1blRlc3RCZW5jaCA9IGZ1bmN0aW9uIChjb250ZXh0LCB0ZXN0QmVuY2hJZCwgY29uZmlndXJhdGlvbklkKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogdGVzdEJlbmNoSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcnVuT25TZXJ2ZXI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvblBhdGg6IGNvbmZpZ3VyYXRpb25JZFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoY29uZmlnKSk7XHJcbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKGNvbnRleHQsICdUZXN0QmVuY2hSdW5uZXInLCBjb25maWcpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdExpZ2h0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiByZXN1bHQuc3VjY2VzcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWZhY3RzSHRtbDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiByZXN1bHQubWVzc2FnZXNcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVzdWx0XCIsIHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luU2VydmljZS5nZXRQbHVnaW5BcnRpZmFjdHNIdG1sKHJlc3VsdC5hcnRpZmFjdHMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChhcnRpZmFjdHNIdG1sKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRMaWdodC5hcnRpZmFjdHNIdG1sID0gYXJ0aWZhY3RzSHRtbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0TGlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsICcgKyByZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLndhdGNoVGVzdEJlbmNoTm9kZSA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCB0ZXN0QmVuY2hJZCwgdXBkYXRlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hUZXN0QmVuY2gnLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBtZXRhOiBudWxsLCAvLyBNRVRBIG5vZGVzIC0gbmVlZGVkIHdoZW4gY3JlYXRpbmcgbmV3IG5vZGVzLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoOiB7fSAvLyB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+LCBub2RlIDxOb2RlT2JqPn1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSB0aGlzLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UmVzdWx0cyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdSZXN1bHRzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0ZpbGVzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1Rlc3RCZW5jaEZpbGVzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Rsc3V0ID0gdGhpcy5nZXRQb2ludGVyKCdUb3BMZXZlbFN5c3RlbVVuZGVyVGVzdCcpLnRvLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRsc3V0Q2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOYW1lICE9PSBkYXRhLnRlc3RCZW5jaC5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlc2MgIT09IGRhdGEudGVzdEJlbmNoLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQYXRoICE9PSBkYXRhLnRlc3RCZW5jaC5wYXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLnBhdGggPSBuZXdQYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1Jlc3VsdHMgIT09IGRhdGEudGVzdEJlbmNoLnJlc3VsdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2gucmVzdWx0cyA9IG5ld1Jlc3VsdHM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3RmlsZXMgIT09IGRhdGEudGVzdEJlbmNoLmZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLmZpbGVzID0gbmV3RmlsZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3VGxzdXQgIT09IGRhdGEudGVzdEJlbmNoLnRsc3V0SWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2gudGxzdXRJZCA9IG5ld1Rsc3V0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGxzdXRDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEudGVzdEJlbmNoLCB0bHN1dENoYW5nZWQ6IHRsc3V0Q2hhbmdlZH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB0ZXN0QmVuY2hJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodGVzdEJlbmNoTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm1ldGEgPSBtZXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0ZXN0QmVuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRlc3RCZW5jaE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGVzdEJlbmNoTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHRlc3RCZW5jaE5vZGUuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogdGVzdEJlbmNoTm9kZS5nZXRBdHRyaWJ1dGUoJ1Jlc3VsdHMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiB0ZXN0QmVuY2hOb2RlLmdldEF0dHJpYnV0ZSgnVGVzdEJlbmNoRmlsZXMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRsc3V0SWQ6IHRlc3RCZW5jaE5vZGUuZ2V0UG9pbnRlcignVG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3QnKS50byxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IHRlc3RCZW5jaE5vZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoTm9kZS5vblVwZGF0ZShvblVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGFsbCB0ZXN0LWJlbmNoZXMgKGV4aXN0ZW5jZSBhbmQgdGhlaXIgYXR0cmlidXRlcykgb2YgYSB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkIC0gUGF0aCB0byB3b3Jrc3BhY2UgdGhhdCBzaG91bGQgYmUgd2F0Y2hlZC5cclxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuIERhdGEgaXMgYW4gb2JqZWN0IGluIGRhdGEudGVzdEJlbmNoZXMuXHJcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaFRlc3RCZW5jaGVzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaFRlc3RCZW5jaGVzJyxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdElkOiBwYXJlbnRDb250ZXh0LnByb2plY3RJZCxcclxuICAgICAgICAgICAgICAgICAgICBicmFuY2hJZDogcGFyZW50Q29udGV4dC5icmFuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hlczoge30gLy8gdGVzdEJlbmNoIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgcGF0aDogPHN0cmluZz4sIHJlc3VsdHM6IDxoYXNofHN0cmluZz4sIGZpbGVzOiA8aGFzaHxzdHJpbmc+IH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1BhdGggPSB0aGlzLmdldEF0dHJpYnV0ZSgnSUQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UmVzdWx0cyA9IHRoaXMuZ2V0QXR0cmlidXRlKCdSZXN1bHRzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0ZpbGVzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ1Rlc3RCZW5jaEZpbGVzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3TmFtZSAhPT0gZGF0YS50ZXN0QmVuY2hlc1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW2lkXS5uYW1lID0gbmV3TmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdEZXNjICE9PSBkYXRhLnRlc3RCZW5jaGVzW2lkXS5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW2lkXS5kZXNjcmlwdGlvbiA9IG5ld0Rlc2M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UGF0aCAhPT0gZGF0YS50ZXN0QmVuY2hlc1tpZF0ucGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW2lkXS5wYXRoID0gbmV3UGF0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdSZXN1bHRzICE9PSBkYXRhLnRlc3RCZW5jaGVzW2lkXS5yZXN1bHRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbaWRdLnJlc3VsdHMgPSBuZXdSZXN1bHRzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0ZpbGVzICE9PSBkYXRhLnRlc3RCZW5jaGVzW2lkXS5maWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW2lkXS5maWxlcyA9IG5ld0ZpbGVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhZENoYW5nZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBpZCwgdHlwZTogJ3VwZGF0ZScsIGRhdGE6IGRhdGEudGVzdEJlbmNoZXNbaWRdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnRlc3RCZW5jaGVzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKGZvbGRlck5vZGUsIG1ldGEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNVGVzdEJlbmNoTW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzW3Rlc3RCZW5jaElkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRlc3RCZW5jaElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCdJTkZPJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lEJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1Jlc3VsdHMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ1Rlc3RCZW5jaEZpbGVzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVk1UZXN0QmVuY2hNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hJZCA9IG5ld0NoaWxkLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1t0ZXN0QmVuY2hJZF0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0ZXN0QmVuY2hJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ0lORk8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJRCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoJ1Jlc3VsdHMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSgnVGVzdEJlbmNoRmlsZXMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKG9uVXBkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogdGVzdEJlbmNoSWQsIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS50ZXN0QmVuY2hlc1t0ZXN0QmVuY2hJZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFUTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogIFdhdGNoZXMgYSB0ZXN0LWJlbmNoIHcuci50LiBpbnRlcmZhY2VzLlxyXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB0ZXN0QmVuY2hJZFxyXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53YXRjaFRlc3RCZW5jaERldGFpbHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgdGVzdEJlbmNoSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoVGVzdEJlbmNoRGV0YWlsc18nICsgdGVzdEJlbmNoSWQsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcklkczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgdGxzdXQ6IG51bGxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGRhdGEuY29udGFpbmVySWRzLmluZGV4T2YoaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVySWRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHRlc3RCZW5jaElkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh0ZXN0QmVuY2hOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaE5vZGUubG9hZENoaWxkcmVuKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW5baV0uaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb250YWluZXJJZHMucHVzaChjaGlsZHJlbltpXS5nZXRJZCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVySWRzLnB1c2gobmV3Q2hpbGQuZ2V0SWQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqICBXYXRjaGVzIGEgdGVzdC1iZW5jaCB3LnIudC4gaW50ZXJmYWNlcy5cclxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cclxuICAgICAgICAgKiBAcGFyYW0gY29udGFpbmVySWRcclxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIGNvbnRhaW5lcklkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS53YXRjaEludGVyZmFjZXMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGNvbnRhaW5lcklkLCB1cGRhdGVMaXN0ZW5lcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMod2F0Y2hlcnMsIHBhcmVudENvbnRleHQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jbGVhblVwUmVnaW9uID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHJlZ2lvbklkKSB7XHJcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgcmVnaW9uSWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlci5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCBmbikge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlcih3YXRjaGVycywgcGFyZW50Q29udGV4dCwgZm4pO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXHJcblxyXG4vKipcclxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKi9cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnY3lwaHkuc2VydmljZXMnKVxyXG4gICAgLnNlcnZpY2UoJ3dvcmtzcGFjZVNlcnZpY2UnLCBmdW5jdGlvbiAoJHEsICR0aW1lb3V0LCBub2RlU2VydmljZSwgYmFzZUN5UGh5U2VydmljZSwgcGx1Z2luU2VydmljZSwgZmlsZVNlcnZpY2UpIHtcclxuICAgICAgICAndXNlIHN0cmljdCc7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICB3YXRjaGVycyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxDcmVhdGVXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoY29udGV4dCwgbmFtZSwgZGVzYykge1xyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNyZWF0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uIChjb250ZXh0LCBuYW1lLCBkZXNjKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBtZXRhO1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dClcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChtZXRhTm9kZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRhID0gbWV0YU5vZGVzO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlU2VydmljZS5jcmVhdGVOb2RlKGNvbnRleHQsICcnLCBtZXRhLldvcmtTcGFjZSwgJ1tXZWJDeVBoeV0gLSBXb3Jrc3BhY2VTZXJ2aWNlLmNyZWF0ZVdvcmtzcGFjZScpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3c05vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWNtRm9sZGVySWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkbUZvbGRlcklkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdG1Gb2xkZXJJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRm9sZGVyTm9kZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyZW50SWQgPSB3c05vZGUuZ2V0SWQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSWQgPSBtZXRhLkFDTUZvbGRlci5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UuY3JlYXRlTm9kZShjb250ZXh0LCBwYXJlbnRJZCwgYmFzZUlkLCAnW1dlYkN5UGh5XSAtIGNyZWF0ZSBBQ01Gb2xkZXInKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChhY21Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjbUZvbGRlcklkID0gYWNtTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSWQgPSBtZXRhLkFETUZvbGRlci5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVNlcnZpY2UuY3JlYXRlTm9kZShjb250ZXh0LCBwYXJlbnRJZCwgYmFzZUlkLCAnW1dlYkN5UGh5XSAtIGNyZWF0ZSBBRE1Gb2xkZXInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChhZG1Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkbUZvbGRlcklkID0gYWRtTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSWQgPSBtZXRhLkFUTUZvbGRlci5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVNlcnZpY2UuY3JlYXRlTm9kZShjb250ZXh0LCBwYXJlbnRJZCwgYmFzZUlkLCAnW1dlYkN5UGh5XSAtIGNyZWF0ZSBBVE1Gb2xkZXInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChhdG1Ob2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0bUZvbGRlcklkID0gYXRtTm9kZS5nZXRJZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHsgYWNtOiBhY21Gb2xkZXJJZCwgYWRtOiBhZG1Gb2xkZXJJZCwgYXRtOiBhdG1Gb2xkZXJJZCB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB3c05vZGUuc2V0QXR0cmlidXRlKCduYW1lJywgbmFtZSwgJ1tXZWJDeVBoeV0gLSBzZXQgbmFtZSB0byAnICsgbmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c05vZGUuc2V0QXR0cmlidXRlKCdJTkZPJywgZGVzYywgJ1tXZWJDeVBoeV0gLSBzZXQgSU5GTyB0byAnICsgZGVzYylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRm9sZGVyTm9kZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUZvbGRlck5vZGVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaW1wb3J0RmlsZXMgPSBmdW5jdGlvbiAoY29udGV4dCwgZm9sZGVySWRzLCBmaWxlcykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgaSxcclxuICAgICAgICAgICAgICAgIGNvdW50ZXIsXHJcbiAgICAgICAgICAgICAgICB0b3RhbCxcclxuICAgICAgICAgICAgICAgIGZzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjbXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIGFkbXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIGF0bXM6IFtdXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaW1wb3J0QWNtUmVjLFxyXG4gICAgICAgICAgICAgICAgaW1wb3J0QWRtUmVjLFxyXG4gICAgICAgICAgICAgICAgaW1wb3J0QXRtUmVjLFxyXG4gICAgICAgICAgICAgICAgZ2V0Tm90aWZ5O1xyXG5cclxuICAgICAgICAgICAgaW1wb3J0QWNtUmVjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY2FsbEFjbUltcG9ydGVyKGNvbnRleHQsIGZvbGRlcklkcy5hY20sIGZzLmFjbXNbY291bnRlcl0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGdldE5vdGlmeShmcy5hY21zW2NvdW50ZXJdLCAnYWNtJyksIGdldE5vdGlmeShmcy5hY21zW2NvdW50ZXJdKSwgJ2FjbScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbCA9IGZzLmFkbXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSB0b3RhbDtcclxuICAgICAgICAgICAgICAgICAgICBpbXBvcnRBZG1SZWMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaW1wb3J0QWRtUmVjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY2FsbEFkbUltcG9ydGVyKGNvbnRleHQsIGZvbGRlcklkcy5hZG0sIGZzLmFkbXNbY291bnRlcl0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGdldE5vdGlmeShmcy5hZG1zW2NvdW50ZXJdLCAnYWRtJyksIGdldE5vdGlmeShmcy5hZG1zW2NvdW50ZXJdKSwgJ2FkbScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbCA9IGZzLmF0bXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSB0b3RhbDtcclxuICAgICAgICAgICAgICAgICAgICBpbXBvcnRBdG1SZWMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaW1wb3J0QXRtUmVjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY2FsbEF0bUltcG9ydGVyKGNvbnRleHQsIGZvbGRlcklkcy5hdG0sIGZzLmF0bXNbY291bnRlcl0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGdldE5vdGlmeShmcy5hdG1zW2NvdW50ZXJdLCAnYXRtJyksIGdldE5vdGlmeShmcy5hdG1zW2NvdW50ZXJdLCAnYXRtJykpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGdldE5vdGlmeSA9IGZ1bmN0aW9uIChmSW5mbywgdHlwZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhyZXN1bHQpID09PSBmYWxzZSAmJiByZXN1bHQuc3VjY2VzcyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoe3R5cGU6ICdzdWNjZXNzJywgbWVzc2FnZTogJzxhIGhyZWY9XCInICsgZkluZm8udXJsICsgJ1wiPicgKyBmSW5mby5uYW1lICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2E+JyArICcgaW1wb3J0ZWQuICcgKyAnWycgKyAodG90YWwgLSBjb3VudGVyKSArICcvJyArIHRvdGFsICsgJ10nfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KHt0eXBlOiAnZXJyb3InLCBtZXNzYWdlOiAnPGEgaHJlZj1cIicgKyBmSW5mby51cmwgKyAnXCI+JyArIGZJbmZvLm5hbWUgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvYT4nICsgJyBmYWlsZWQgdG8gYmUgaW1wb3J0ZWQsIHNlZSBjb25zb2xlIGRldGFpbHMuJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnWycgKyAodG90YWwgLSBjb3VudGVyKSArICcvJyArIHRvdGFsICsgJ10nfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHJlc3VsdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYW5ndWxhci50b0pzb24ocmVzdWx0Lm1lc3NhZ2VzLCB0cnVlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdhY20nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltcG9ydEFjbVJlYygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2FkbScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1wb3J0QWRtUmVjKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnYXRtJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRBdG1SZWMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ1VuZXhwZWN0ZWQgaW1wb3J0IHR5cGUgJyArIHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vIGhhc2g6IFwiMzYzNmVhZDA3ODVjYTE2NmYzYjExMTkzYzRiMmU1YTY3MDgwMWViMVwiIG5hbWU6IFwiRGFtcGVyLnppcFwiIHNpemU6IFwiMS40IGtCXCIgdHlwZTogXCJ6aXBcIlxyXG4gICAgICAgICAgICAvLyB1cmw6IFwiL3Jlc3QvYmxvYi9kb3dubG9hZC8zNjM2ZWFkMDc4NWNhMTY2ZjNiMTExOTNjNGIyZTVhNjcwODAxZWIxXCJcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsZXNbaV0udHlwZSA9PT0gJ3ppcCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBmcy5hY21zLnB1c2goZmlsZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmaWxlc1tpXS50eXBlID09PSAnYWRtJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZzLmFkbXMucHVzaChmaWxlc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpbGVzW2ldLnR5cGUgPT09ICdhdG0nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnMuYXRtcy5wdXNoKGZpbGVzW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdG90YWwgPSBmcy5hY21zLmxlbmd0aDtcclxuICAgICAgICAgICAgY291bnRlciA9IHRvdGFsO1xyXG4gICAgICAgICAgICBpbXBvcnRBY21SZWMoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbEFjbUltcG9ydGVyID0gZnVuY3Rpb24gKGNvbnRleHQsIGZvbGRlcklkLCBmaWxlSW5mbykge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgY29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGU6IGZvbGRlcklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uU2VydmVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5Db25maWc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVXBsb2FkZWRGaWxlOiBmaWxlSW5mby5oYXNoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBEZWxldGVFeGlzdGluZzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLnJ1blBsdWdpbihjb250ZXh0LCAnQWNtSW1wb3J0ZXInLCBjb25maWcpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9cIntcInN1Y2Nlc3NcIjp0cnVlLFwibWVzc2FnZXNcIjpbXSxcImFydGlmYWN0c1wiOltdLFwicGx1Z2luTmFtZVwiOlwiQUNNIEltcG9ydGVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXCJzdGFydFRpbWVcIjpcIjIwMTQtMTEtMDhUMDI6NTE6MjEuMzgzWlwiLFwiZmluaXNoVGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS45MzlaXCIsXCJlcnJvclwiOm51bGx9XCJcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nLCAnICsgcmVhc29uKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsQWRtSW1wb3J0ZXIgPSBmdW5jdGlvbiAoY29udGV4dCwgZm9sZGVySWQsIGZpbGVJbmZvKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogZm9sZGVySWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcnVuT25TZXJ2ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbkNvbmZpZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZG1GaWxlOiBmaWxlSW5mby5oYXNoXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKGNvbnRleHQsICdBZG1JbXBvcnRlcicsIGNvbmZpZylcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1wie1wic3VjY2Vzc1wiOnRydWUsXCJtZXNzYWdlc1wiOltdLFwiYXJ0aWZhY3RzXCI6W10sXCJwbHVnaW5OYW1lXCI6XCJBRE0gSW1wb3J0ZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAvLyBcInN0YXJ0VGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS4zODNaXCIsXCJmaW5pc2hUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjkzOVpcIixcImVycm9yXCI6bnVsbH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsICcgKyByZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxBdG1JbXBvcnRlciA9IGZ1bmN0aW9uIChjb250ZXh0LCBmb2xkZXJJZCwgZmlsZUluZm8pIHtcclxuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcclxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlOiBmb2xkZXJJZCxcclxuICAgICAgICAgICAgICAgICAgICBydW5PblNlcnZlcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0bUZpbGU6IGZpbGVJbmZvLmhhc2hcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcGx1Z2luU2VydmljZS5ydW5QbHVnaW4oY29udGV4dCwgJ0F0bUltcG9ydGVyJywgY29uZmlnKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vXCJ7XCJzdWNjZXNzXCI6dHJ1ZSxcIm1lc3NhZ2VzXCI6W10sXCJhcnRpZmFjdHNcIjpbXSxcInBsdWdpbk5hbWVcIjpcIkFUTSBJbXBvcnRlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFwic3RhcnRUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjM4M1pcIixcImZpbmlzaFRpbWVcIjpcIjIwMTQtMTEtMDhUMDI6NTE6MjEuOTM5WlwiLFwiZXJyb3JcIjpudWxsfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdTb21ldGhpbmcgd2VudCB0ZXJyaWJseSB3cm9uZywgJyArIHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENhbGxzIEV4cG9ydFdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIENvbnRleHQgZm9yIHBsdWdpbi5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24gdG8gcHVsbCBtb2RlbCBmcm9tLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZFxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIHJlc29sdmVzIHRvIGRvd25sb2FkIHVybCBpZiBzdWNjZXNzZnVsLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZXhwb3J0V29ya3NwYWNlID0gZnVuY3Rpb24gKGNvbnRleHQsIHdvcmtzcGFjZUlkKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogd29ya3NwYWNlSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcnVuT25TZXJ2ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbkNvbmZpZzogeyB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcGx1Z2luU2VydmljZS5ydW5QbHVnaW4oY29udGV4dCwgJ0V4cG9ydFdvcmtzcGFjZScsIGNvbmZpZylcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1wie1wic3VjY2Vzc1wiOnRydWUsXCJtZXNzYWdlc1wiOltdLFwiYXJ0aWZhY3RzXCI6W10sXCJwbHVnaW5OYW1lXCI6XCJBRE0gSW1wb3J0ZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAvLyBcInN0YXJ0VGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS4zODNaXCIsXCJmaW5pc2hUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjkzOVpcIixcImVycm9yXCI6bnVsbH1cIlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGZpbGVTZXJ2aWNlLmdldERvd25sb2FkVXJsKHJlc3VsdC5hcnRpZmFjdHNbMF0pKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVzdWx0LmVycm9yICsgJyBtZXNzYWdlczogJyArIGFuZ3VsYXIudG9Kc29uKHJlc3VsdC5tZXNzYWdlcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGFuZ3VsYXIudG9Kc29uKHJlc3VsdC5tZXNzYWdlcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdTb21ldGhpbmcgd2VudCB0ZXJyaWJseSB3cm9uZyAnICsgcmVhc29uKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIGdpdmVuIGF0dHJpYnV0ZXNcclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBkZXNpZ24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgZGVzaWduLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LnJlZ2lvbklkIC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGRlc2lnbi5cclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWQgLSBQYXRoIHRvIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gYXR0cnMgLSBLZXlzIGFyZSBuYW1lcyBvZiBhdHRyaWJ1dGVzIGFuZCB2YWx1ZXMgYXJlIHRoZSB3YW50ZWQgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zZXRXb3Jrc3BhY2VBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGNvbnRleHQsIHdvcmtzcGFjZUlkLCBhdHRycykge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS5zZXROb2RlQXR0cmlidXRlcyhjb250ZXh0LCB3b3Jrc3BhY2VJZCwgYXR0cnMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIHdvcmtzcGFjZSBmcm9tIHRoZSBjb250ZXh0LlxyXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gZGF0YS1iYXNlIGNvbm5lY3Rpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkIC0gUGF0aCB0byB3b3Jrc3BhY2UuXHJcbiAgICAgICAgICogQHBhcmFtIFttc2ddIC0gQ29tbWl0IG1lc3NhZ2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5kZWxldGVXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoY29udGV4dCwgd29ya3NwYWNlSWQsIG1zZykge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG1zZyB8fCAnV29ya3NwYWNlU2VydmljZS5kZWxldGVXb3Jrc3BhY2UgJyArIHdvcmtzcGFjZUlkO1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5kZXN0cm95Tm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZCwgbWVzc2FnZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogbWFrZSBzdXJlIHRoZSBtZXRob2RzIGJlbG93IGdldHMgcmVzb2x2ZWQgYXQgZXJyb3IgdG9vLlxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSB3b3JrLXNwYWNlcyBkZWZpbmVkIGluIHRoZSByb290LW5vZGUgdy5yLnQuIGV4aXN0ZW5jZSBhbmQgYXR0cmlidXRlcy5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyBhbiBvYmplY3QgaW4gZGF0YS53b3Jrc3BhY2VzLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hXb3Jrc3BhY2VzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoV29ya3NwYWNlcycsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxyXG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZXM6IHt9IC8vIHdvcmtzcGFjZSA9IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz59XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSgnSU5GTycpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld05hbWUgIT09IGRhdGEud29ya3NwYWNlc1tpZF0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLndvcmtzcGFjZXNbaWRdLm5hbWUgPSBuZXdOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0Rlc2MgIT09IGRhdGEud29ya3NwYWNlc1tpZF0uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzW2lkXS5kZXNjcmlwdGlvbiA9IG5ld0Rlc2M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaGFkQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndXBkYXRlJywgZGF0YTogZGF0YS53b3Jrc3BhY2VzW2lkXX0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS53b3Jrc3BhY2VzW2lkXTtcclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBudWxsfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gPSB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSB8fCB7fTtcclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgJycpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJvb3ROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3NJZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuV29ya1NwYWNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c0lkID0gY2hpbGROb2RlLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1t3c0lkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB3c0lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ0lORk8nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLldvcmtTcGFjZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3NJZCA9IG5ld0NoaWxkLmdldElkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1t3c0lkXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB3c0lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCdJTkZPJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUob25VcGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogd3NJZCwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLndvcmtzcGFjZXNbd3NJZF19KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgbnVtYmVyIG9mIGNvbXBvbmVudHMgKGRlZmluZWQgaW4gQUNNRm9sZGVycykgaW4gdGhlIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyB0aGUgdXBkYXRlZCBkYXRhLmNvdW50LlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hOdW1iZXJPZkNvbXBvbmVudHMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZDb21wb25lbnRzXycgKyB3b3Jrc3BhY2VJZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IDBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoZm9sZGVyTm9kZSwgbWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50IC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVk1Db21wb25lbnRNb2RlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQob25VbmxvYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXSA9IHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdIHx8IHt9O1xyXG4gICAgICAgICAgICB3YXRjaGVyc1twYXJlbnRDb250ZXh0LnJlZ2lvbklkXVtjb250ZXh0LnJlZ2lvbklkXSA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2Rlcyhjb250ZXh0KS50aGVuKGZ1bmN0aW9uIChtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZShjb250ZXh0LCB3b3Jrc3BhY2VJZClcclxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAod29ya3NwYWNlTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFDTUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQUNNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVldWVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgbnVtYmVyIG9mIGNvbnRhaW5lcnMgKGRlZmluZWQgaW4gQURNRm9sZGVycykgaW4gdGhlIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyB0aGUgdXBkYXRlZCBkYXRhLmNvdW50LlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hOdW1iZXJPZkRlc2lnbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZEZXNpZ25zXycgKyB3b3Jrc3BhY2VJZCxcclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IDBcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoZm9sZGVyTm9kZSwgbWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50IC09IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IGlkLCB0eXBlOiAndW5sb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQURNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKG9uVW5sb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMobmV3Q2hpbGQsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQuaXNNZXRhVHlwZU9mKG1ldGEuQ29udGFpbmVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmICh3YXRjaGVycy5oYXNPd25Qcm9wZXJ0eShwYXJlbnRDb250ZXh0LnJlZ2lvbklkKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IocGFyZW50Q29udGV4dC5yZWdpb25JZCArICcgaXMgbm90IGEgcmVnaXN0ZXJlZCB3YXRjaGVyISAnICtcclxuICAgICAgICAgICAgICAgICAgICAnVXNlIFwidGhpcy5yZWdpc3RlcldhdGNoZXJcIiBiZWZvcmUgdHJ5aW5nIHRvIGFjY2VzcyBOb2RlIE9iamVjdHMuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF1bY29udGV4dC5yZWdpb25JZF0gPSBjb250ZXh0O1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoY29udGV4dCkudGhlbihmdW5jdGlvbiAobWV0YSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoY29udGV4dCwgd29ya3NwYWNlSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHdvcmtzcGFjZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5sb2FkQ2hpbGRyZW4oKS50aGVuKGZ1bmN0aW9uIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BRE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKHdhdGNoRnJvbUZvbGRlclJlYyhjaGlsZE5vZGUsIG1ldGEpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFETUZvbGRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwocXVldWVMaXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIG51bWJlciBvZiB0ZXN0LWJlbmNoZXMgKGRlZmluZWQgaW4gQVRNRm9sZGVycykgaW4gdGhlIHdvcmtzcGFjZS5cclxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlciAobXVzdCBoYXZlIGEgcmVnaW9uSWQgZGVmaW5lZCkuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyB0aGUgdXBkYXRlZCBkYXRhLmNvdW50LlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzID0gZnVuY3Rpb24gKHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxyXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mVGVzdEJlbmNoZXNfJyArIHdvcmtzcGFjZUlkLFxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uIChmb2xkZXJOb2RlLCBtZXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpLnRoZW4oZnVuY3Rpb24gKGNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogaWQsIHR5cGU6ICd1bmxvYWQnLCBkYXRhOiBkYXRhLmNvdW50fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2god2F0Y2hGcm9tRm9sZGVyUmVjKGNoaWxkTm9kZSwgbWV0YSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNVGVzdEJlbmNoTW9kZWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZChmdW5jdGlvbiAobmV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKG5ld0NoaWxkLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkFWTVRlc3RCZW5jaE1vZGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZChvblVubG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YS5jb3VudH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXVlTGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbChxdWV1ZUxpc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdID0gd2F0Y2hlcnNbcGFyZW50Q29udGV4dC5yZWdpb25JZF0gfHwge307XHJcbiAgICAgICAgICAgIHdhdGNoZXJzW3BhcmVudENvbnRleHQucmVnaW9uSWRdW2NvbnRleHQucmVnaW9uSWRdID0gY29udGV4dDtcclxuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKGNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG1ldGEpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKGNvbnRleHQsIHdvcmtzcGFjZUlkKVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh3b3Jrc3BhY2VOb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKCkudGhlbihmdW5jdGlvbiAoY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVRNRm9sZGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCh3YXRjaEZyb21Gb2xkZXJSZWMoY2hpbGROb2RlLCBtZXRhKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlTm9kZS5vbk5ld0NoaWxkTG9hZGVkKGZ1bmN0aW9uIChuZXdDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdDaGlsZC5pc01ldGFUeXBlT2YobWV0YS5BVE1Gb2xkZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyhuZXdDaGlsZCwgbWV0YSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGEuY291bnR9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWV1ZUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHF1ZXVlTGlzdCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcEFsbFJlZ2lvbnMgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCkge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uIChwYXJlbnRDb250ZXh0LCByZWdpb25JZCkge1xyXG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24od2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIHJlZ2lvbklkKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoZXIgPSBmdW5jdGlvbiAocGFyZW50Q29udGV4dCwgZm4pIHtcclxuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIod2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGZuKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ0NvbnRleHQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xyXG4gICAgICAgICAgICBub2RlU2VydmljZS5sb2dDb250ZXh0KGNvbnRleHQpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTsiLCIvKmdsb2JhbHMgcmVxdWlyZSwgYW5ndWxhciAqL1xyXG4vKipcclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxyXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxyXG4gKi9cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5zZXJ2aWNlcycsIFsnZ21lLnNlcnZpY2VzJ10pO1xyXG5yZXF1aXJlKCcuL0Jhc2VDeVBoeVNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9QbHVnaW5TZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vRmlsZVNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9FeGVjdXRvclNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9Xb3Jrc3BhY2VTZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vQ29tcG9uZW50U2VydmljZScpO1xyXG5yZXF1aXJlKCcuL0Rlc2lnblNlcnZpY2UnKTtcclxucmVxdWlyZSgnLi9UZXN0QmVuY2hTZXJ2aWNlJyk7XHJcbnJlcXVpcmUoJy4vRGVzZXJ0U2VydmljZScpOyJdfQ==

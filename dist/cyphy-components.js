(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
 * @author pmeijer / https://github.com/pmeijer
 */
// External dependencies
require( '../../bower_components/ng-file-upload/angular-file-upload-shim' );
require( '../../bower_components/ng-file-upload/angular-file-upload' );
require( '../../bower_components/angular-growl/build/angular-growl.min' );
require( '../../bower_components/angular-sanitize/angular-sanitize' );
require( '../../bower_components/adapt-strap/dist/adapt-strap' );
require( '../../bower_components/adapt-strap/dist/adapt-strap.tpl' );

// Internal dependencies
require( './services/cyphy-services' );

angular.module( 'cyphy.components', [
    'cyphy.services',
    'cyphy.components.templates',
    'angularFileUpload',
    'angular-growl',
    'ngSanitize',
    'adaptv.adaptStrap'
] )
    .config( [ 'growlProvider',
        function ( growlProvider ) {
            growlProvider.globalTimeToLive( {
                success: 5000,
                error: -1,
                warning: 20000,
                info: 5000
            } );
        }
    ] );

require( './SimpleModal/SimpleModal' );

require( './WorkspaceList/WorkspaceList' );

require( './ComponentList/ComponentDetails' );
require( './ComponentList/ComponentList' );

require( './DesignList/DesignDetails' );
require( './DesignList/DesignList' );
require( './DesignTree/DesignTree' );

require( './TestBenchList/TestBenchDetails' );
require( './TestBenchList/TestBenchList' );

require( './ConfigurationTable/ConfigurationTable' );
require( './ConfigurationSetSelector/ConfigurationSetSelector' );

require( './WorkersList/WorkersList' );

require( './componentBrowser/componentBrowser' );
},{"../../bower_components/adapt-strap/dist/adapt-strap":2,"../../bower_components/adapt-strap/dist/adapt-strap.tpl":3,"../../bower_components/angular-growl/build/angular-growl.min":4,"../../bower_components/angular-sanitize/angular-sanitize":5,"../../bower_components/ng-file-upload/angular-file-upload":7,"../../bower_components/ng-file-upload/angular-file-upload-shim":6,"./ComponentList/ComponentDetails":8,"./ComponentList/ComponentList":9,"./ConfigurationSetSelector/ConfigurationSetSelector":10,"./ConfigurationTable/ConfigurationTable":11,"./DesignList/DesignDetails":12,"./DesignList/DesignList":13,"./DesignTree/DesignTree":14,"./SimpleModal/SimpleModal":15,"./TestBenchList/TestBenchDetails":16,"./TestBenchList/TestBenchList":17,"./WorkersList/WorkersList":18,"./WorkspaceList/WorkspaceList":19,"./componentBrowser/componentBrowser":20,"./services/cyphy-services":30}],2:[function(require,module,exports){
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

angular.module( 'cyphy.components' )
    .controller( 'ComponentDetailsController', function ( $scope, componentService ) {
        'use strict';
        var context = {},
            properties = {},
            connectors = {},
            ports = {};

        console.log( 'ComponentDetailsController' );
        $scope.init = function ( connectionId ) {
            $scope.connectionId = connectionId;
            if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
                context = {
                    db: $scope.connectionId,
                    regionId: 'ComponentDetails_' + ( new Date() )
                        .toISOString()
                };
                $scope.$on( '$destroy', function () {
                    console.log( 'Destroying :', context.regionId );
                    componentService.cleanUpAllRegions( context );
                } );
            } else {
                throw new Error( 'connectionId must be defined and it must be a string' );
            }
            $scope.details = {
                properties: properties,
                connectors: connectors,
                ports: ports
            };

            componentService.registerWatcher( context, function ( destroy ) {
                $scope.details = {
                    properties: {},
                    connectors: {},
                    ports: {}
                };
                if ( destroy ) {
                    //TODO: notify user
                    return;
                }
                console.info( 'ComponentDetailsController - initialize event raised' );

                componentService.watchInterfaces( context, $scope.componentId, function ( updateObject ) {
                    // Since watchInterfaces keeps the data up-to-date there shouldn't be a need to do any
                    // updates here..
                    console.log( 'watchInterfaces', updateObject );
                } )
                    .then( function ( componentInterfaces ) {
                        $scope.details.properties = componentInterfaces.properties;
                        $scope.details.connectors = componentInterfaces.connectors;
                        $scope.details.ports = componentInterfaces.ports;
                    } );
            } );
        };
    } )
    .directive( 'componentDetails', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                componentId: '=componentId'
            },
            require: '^componentList',
            link: function ( scope, elem, attr, componetListController ) {
                var connectionId = componetListController.getConnectionId();
                scope.init( connectionId );
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/InterfaceDetails.html',
            controller: 'ComponentDetailsController'
        };
    } );
},{}],9:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module( 'cyphy.components' )
    .controller( 'ComponentListController', function ( $scope, $window, $modal, growl, componentService, fileService ) {
        'use strict';
        var
        items = [], // Items that are passed to the item-list ui-component.
            componentItems = {}, // Same items are stored in a dictionary.
            serviceData2ListItem,
            addDomainWatcher,
            config,
            context;

        console.log( 'ComponentListController', $scope.avmIds );
        this.getConnectionId = function () {
            return $scope.connectionId;
        };
        // Check for valid connectionId and register clean-up on destroy event.
        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'ComponentListController_' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                componentService.cleanUpAllRegions( context );
            } );
        } else {
            throw new Error( 'connectionId must be defined and it must be a string' );
        }

        // Configuration for the item list ui component.
        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function ( jQEvent, ui ) {
                console.log( 'Sort happened', jQEvent, ui );
            },

            itemClick: function ( event, item ) {
                $scope.$emit( 'selectedInstances', {
                    name: item.title,
                    ids: item.data.instanceIds
                } );
            },

            itemContextmenuRenderer: function ( e, item ) {
                return [ {
                    items: [ {
                        id: 'openInEditor',
                        label: 'Open in Editor',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-edit',
                        action: function () {
                            $window.open( '/?project=ADMEditor&activeObject=' + item.id, '_blank' );
                        }
                    }, {
                        id: 'editComponent',
                        label: 'Edit',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-pencil',
                        actionData: {
                            description: item.description,
                            id: item.id
                        },
                        action: function ( data ) {
                            var editContext = {
                                db: context.db,
                                regionId: context.regionId + '_watchComponents'
                            },
                                modalInstance = $modal.open( {
                                    templateUrl: '/cyphy-components/templates/ComponentEdit.html',
                                    controller: 'ComponentEditController',
                                    //size: size,
                                    resolve: {
                                        data: function () {
                                            return data;
                                        }
                                    }
                                } );

                            modalInstance.result.then( function ( editedData ) {
                                var attrs = {
                                    'INFO': editedData.description
                                };
                                componentService.setComponentAttributes( editContext, data.id, attrs )
                                    .then( function () {
                                        console.log( 'Attribute updated' );
                                    } );
                            }, function () {
                                console.log( 'Modal dismissed at: ' + new Date() );
                            } );
                        }
                    }, {
                        id: 'exportAsAcm',
                        label: 'Export ACM',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-share-alt',
                        actionData: {
                            resource: item.data.resource,
                            name: item.title
                        },
                        action: function ( data ) {
                            var hash = data.resource,
                                url = fileService.getDownloadUrl( hash );
                            if ( url ) {
                                growl.success( 'ACM file for <a href="' + url + '">' + data.name +
                                    '</a> exported.' );
                            } else {
                                growl.warning( data.name + ' does not have a resource.' );
                            }
                        }
                    } ]
                }, {
                    items: [ {
                        id: 'delete',
                        label: 'Delete',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-remove',
                        actionData: {
                            id: item.id,
                            name: item.title
                        },
                        action: function ( data ) {
                            var modalInstance = $modal.open( {
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
                            } );

                            modalInstance.result.then( function () {
                                componentService.deleteComponent( context, data.id );
                            }, function () {
                                console.log( 'Modal dismissed at: ' + new Date() );
                            } );
                        }
                    } ]
                } ];
            },

            detailsRenderer: function ( /*item*/) {
                //                item.details = 'My details are here now!';
            },

            filter: {}

        };

        $scope.config = config;
        $scope.listData = {
            items: items
        };

        // Transform the raw service node data to items for the list.
        serviceData2ListItem = function ( data ) {
            var listItem;

            if ( componentItems.hasOwnProperty( data.id ) ) {
                listItem = componentItems[ data.id ];
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
                        time: 'N/A', // TODO: get this in the future.
                        user: 'N/A' // TODO: get this in the future.
                    },
                    stats: [],
                    details: 'Content',
                    detailsTemplateUrl: 'componentDetails.html',
                    data: {
                        resource: data.resource
                    }
                };
                if ( $scope.avmIds ) {
                    listItem.data.instanceIds = $scope.avmIds[ data.avmId ];
                }
                // Add the list-item to the items list and the dictionary.
                items.push( listItem );
                componentItems[ listItem.id ] = listItem;
            }
        };

        addDomainWatcher = function ( componentId ) {
            var domainModelsToStat = function ( domainModels ) {
                var stats = [],
                    labelMap = {
                        CAD: {
                            value: 0,
                            toolTip: 'CAD',
                            iconClass: 'fa fa-codepen'
                        },
                        Cyber: {
                            value: 0,
                            toolTip: 'Cyber',
                            iconClass: 'fa fa-laptop'
                        },
                        Manufacturing: {
                            value: 0,
                            toolTip: 'Manufacturing',
                            iconClass: 'fa fa-wrench'
                        },
                        Modelica: {
                            value: 0,
                            toolTip: 'Modelica',
                            iconClass: 'fa fa-gears'
                        }
                    },
                    key;
                for ( key in domainModels ) {
                    if ( domainModels.hasOwnProperty( key ) ) {
                        if ( labelMap[ domainModels[ key ].type ] ) {
                            labelMap[ domainModels[ key ].type ].value += 1;
                        } else {
                            console.error( 'Unexpected domain-model type', domainModels[ key ].type );
                        }
                    }
                }
                for ( key in labelMap ) {
                    if ( labelMap.hasOwnProperty( key ) ) {
                        if ( labelMap[ key ].value > 0 ) {
                            stats.push( labelMap[ key ] );
                        }
                    }
                }
                return stats;
            };

            componentService.watchComponentDomains( context, componentId, function ( updateData ) {
                var listItem = componentItems[ componentId ];
                console.log( 'DomainModels updated, event type:', updateData.type );
                if ( listItem ) {
                    listItem.stats = domainModelsToStat( updateData.domainModels );
                } else {
                    console.warn( 'DomainModel data did not have matching componentData', componentId );
                }
            } )
                .then( function ( data ) {
                    var listItem = componentItems[ componentId ];
                    if ( listItem ) {
                        listItem.stats = domainModelsToStat( data.domainModels );
                    } else {
                        console.warn( 'DomainModel data did not have matching componentData', componentId );
                    }
                } );
        };

        componentService.registerWatcher( context, function ( destroyed ) {
            items = [];
            $scope.listData.items = items;
            componentItems = {};

            if ( destroyed ) {
                console.warn( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info( 'initialize event raised' );

            componentService.watchComponents( context, $scope.workspaceId, $scope.avmIds, function (
                updateObject ) {
                var index;
                //console.warn(updateObject);
                if ( updateObject.type === 'load' ) {
                    serviceData2ListItem( updateObject.data );
                    addDomainWatcher( updateObject.id );
                } else if ( updateObject.type === 'update' ) {
                    serviceData2ListItem( updateObject.data );
                    //$scope.$apply();
                } else if ( updateObject.type === 'unload' ) {
                    if ( componentItems.hasOwnProperty( updateObject.id ) ) {
                        index = items.map( function ( e ) {
                            return e.id;
                        } )
                            .indexOf( updateObject.id );
                        if ( index > -1 ) {
                            items.splice( index, 1 );
                        }
                        componentService.cleanUpRegion( context, context.regionId +
                            '_watchComponentDomains_' + updateObject.id );
                        delete componentItems[ updateObject.id ];
                    }
                    //$scope.$apply();
                } else {
                    throw new Error( updateObject );
                }
            } )
                .then( function ( data ) {
                    var componentId;
                    for ( componentId in data.components ) {
                        if ( data.components.hasOwnProperty( componentId ) ) {
                            serviceData2ListItem( data.components[ componentId ] );
                            addDomainWatcher( componentId );
                        }
                    }
                } );
        } );
    } )
    .controller( 'ComponentEditController', function ( $scope, $modalInstance, data ) {
        'use strict';
        $scope.data = {
            description: data.description
        };

        $scope.ok = function () {
            $modalInstance.close( $scope.data );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss( 'cancel' );
        };
    } )
    .directive( 'componentList', function () {
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
    } );
},{}],10:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.components' )
    .controller( 'ConfigurationSetSelectorController', function ( $scope, growl, designService ) {
        'use strict';
        var context,
            spawnedConfigurationRegions = [];
        $scope.dataModel = {
            dataAvaliable: false,
            configurationSets: {}
        };

        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'ConfigurationSetSelectorController_' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                designService.cleanUpAllRegions( context );
                //console.log('$destroyed ' + context.regionId);
            } );
        } else {
            throw new Error( 'connectionId must be defined and it must be a string' );
        }

        designService.registerWatcher( context, function ( destroyed ) {
            $scope.dataModel.dataAvaliable = false;
            $scope.dataModel.configurationSets = {};

            if ( destroyed ) {
                console.warn( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }

            designService.watchConfigurationSets( context, $scope.designId, function ( updateObject ) {
                $scope.dataModel.dataAvaliable = Object.keys( updateObject.data.configurationSets )
                    .length > 0;
            } )
                .then( function ( data ) {
                    $scope.dataModel.configurationSets = data.configurationSets;
                    $scope.dataModel.dataAvaliable = Object.keys( data.configurationSets )
                        .length > 0;
                } );
        } );

        $scope.loadConfigurations = function ( setId, setName ) {
            var i;

            for ( i = 0; i < spawnedConfigurationRegions.length; i += 1 ) {
                designService.cleanUpRegion( context, spawnedConfigurationRegions[ i ] );
            }
            spawnedConfigurationRegions = [];
            designService.watchConfigurations( context, setId, function ( updateObject ) {
                console.warn( updateObject );
            } )
                .then( function ( data ) {
                    var key,
                        config,
                        configurations = [];
                    spawnedConfigurationRegions.push( data.regionId );
                    for ( key in data.configurations ) {
                        if ( data.configurations.hasOwnProperty( key ) ) {
                            config = data.configurations[ key ];
                            try {
                                configurations.push( {
                                    id: config.id,
                                    name: config.name,
                                    alternativeAssignments: JSON.parse( config.alternativeAssignments )
                                } );
                            } catch ( error ) {
                                growl.error( 'Configuration ' + config.name + ' had invalid attribute.' );
                                console.error( 'Could not parse', config.alternativeAssignments, error );
                            }
                        }
                    }
                    $scope.$emit( 'configurationsLoaded', {
                        configurations: configurations,
                        setName: setName
                    } );
                } );
        };
    } )
    .directive( 'configurationSetSelector', function () {
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
    } );
},{}],11:[function(require,module,exports){
/*globals angular*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.components' )
    .controller( 'ConfigurationTableController', function ( $scope ) {
        'use strict';
        $scope.dataModel = {
            changeInfo: [],
            selected: [],
            configurations: $scope.configurations,
            setName: $scope.setName
        };

        $scope.tableColumnDefinition = [ {
            columnHeaderDisplayName: 'Name',
            templateUrl: 'tableCell.html',
            sortKey: 'name'
        } ];

        $scope.$on( 'exposeSelection', function ( event, type ) {
            $scope.$emit( 'selectionExposed', $scope.dataModel.selected, type );
        } );

        $scope.cfgClicked = function ( cfg ) {
            $scope.$emit( 'configurationClicked', cfg );
        };
    } )
    .directive( 'configurationTable', function () {
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
    } );
},{}],12:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.components' )
    .controller( 'DesignDetailsController', function ( $scope, designService ) {
        'use strict';
        var context = {},
            properties = {},
            connectors = {},
            ports = {};

        console.log( 'DesignDetailsController' );
        $scope.init = function ( connectionId ) {
            $scope.connectionId = connectionId;
            if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
                context = {
                    db: $scope.connectionId,
                    regionId: 'DesignDetails_' + ( new Date() )
                        .toISOString()
                };
                $scope.$on( '$destroy', function () {
                    console.log( 'Destroying :', context.regionId );
                    designService.cleanUpAllRegions( context );
                } );
            } else {
                throw new Error( 'connectionId must be defined and it must be a string' );
            }
            $scope.details = {
                properties: properties,
                connectors: connectors,
                ports: ports
            };

            designService.registerWatcher( context, function ( destroy ) {
                $scope.details = {
                    properties: {},
                    connectors: {},
                    ports: {}
                };
                if ( destroy ) {
                    //TODO: notify user
                    return;
                }
                console.info( 'DesignDetailsController - initialize event raised' );

                designService.watchInterfaces( context, $scope.designId, function ( updateObject ) {
                    // Since watchInterfaces keeps the data up-to-date there shouldn't be a need to do any
                    // updates here..
                    console.log( 'watchInterfaces', updateObject );
                } )
                    .then( function ( designInterfaces ) {
                        $scope.details.properties = designInterfaces.properties;
                        $scope.details.connectors = designInterfaces.connectors;
                        $scope.details.ports = designInterfaces.ports;
                    } );
            } );
        };
    } )
    .directive( 'designDetails', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                designId: '=designId'
            },
            require: '^designList',
            link: function ( scope, elem, attr, designListController ) {
                var connectionId = designListController.getConnectionId();
                scope.init( connectionId );
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/InterfaceDetails.html',
            controller: 'DesignDetailsController'
        };
    } );
},{}],13:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module( 'cyphy.components' )
    .controller( 'DesignListController', function ( $scope, $window, $location, $modal, designService ) {
        'use strict';
        var
        items = [], // Items that are passed to the item-list ui-component.
            designItems = {}, // Same items are stored in a dictionary.
            serviceData2ListItem,
            config,
            addConfigurationWatcher,
            context;

        console.log( 'DesignListController' );
        this.getConnectionId = function () {
            return $scope.connectionId;
        };
        // Check for valid connectionId and register clean-up on destroy event.
        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'DesignListController_' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                designService.cleanUpAllRegions( context );
            } );
        } else {
            throw new Error( 'connectionId must be defined and it must be a string' );
        }


        // Configuration for the item list ui component.
        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function ( /*jQEvent, ui*/) {
                //console.log('Sort happened', jQEvent, ui);
            },

            itemClick: function ( event, item ) {
                var newUrl = '/designSpace/' + $scope.workspaceId.replace( /\//g, '-' ) + '/' + item.id.replace(
                    /\//g, '-' );
                $location.path( newUrl );
            },

            itemContextmenuRenderer: function ( e, item ) {
                return [ {
                    items: [ {
                        id: 'openInEditor',
                        label: 'Open in Editor',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-edit',
                        action: function () {
                            $window.open( '/?project=ADMEditor&activeObject=' + item.id, '_blank' );
                        }
                    }, {
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
                    }, {
                        id: 'setAsTopLevelSystemUnderTest',
                        label: 'Set as TLSUT',
                        disabled: !$scope.usedByTestBench,
                        iconClass: 'fa fa-arrow-circle-right',
                        actionData: {
                            id: item.id,
                            name: item.title
                        },
                        action: function ( data ) {
                            var oldTlsut = designItems[ $scope.state.tlsutId ];
                            $scope.state.tlsutId = data.id;
                            $scope.$emit( 'topLevelSystemUnderTestSet', item, oldTlsut );
                        }
                    }, {
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
                    } ]
                }, {
                    items: [ {
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
                    } ]
                } ];
            },

            detailsRenderer: function ( /*item*/) {
                //                item.details = 'My details are here now!';
            },

            filter: {}

        };

        $scope.config = config;
        $scope.listData = {
            items: items
        };

        $scope.state = {
            tlsutId: null
        };

        $scope.$on( 'topLevelSystemUnderTestChanged', function ( event, id ) {
            if ( $scope.state.tlsutId && designItems.hasOwnProperty( $scope.state.tlsutId ) ) {
                designItems[ $scope.state.tlsutId ].cssClass = '';
            }
            $scope.state.tlsutId = id;
            if ( designItems.hasOwnProperty( id ) ) {
                designItems[ id ].cssClass = 'top-level-system-under-test';
            }
        } );

        // Transform the raw service node data to items for the list.
        serviceData2ListItem = function ( data ) {
            var listItem;

            if ( designItems.hasOwnProperty( data.id ) ) {
                listItem = designItems[ data.id ];
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
                        time: 'N/A', // TODO: get this in the future.
                        user: 'N/A' // TODO: get this in the future.
                    },
                    stats: [ {
                        value: 0,
                        toolTip: 'Configuration Sets',
                        iconClass: 'glyphicon glyphicon-th-large'
                    }, {
                        value: 0,
                        toolTip: 'Configurations',
                        iconClass: 'glyphicon glyphicon-th'
                    }, {
                        value: 0,
                        toolTip: 'Results',
                        iconClass: 'glyphicon glyphicon-stats'
                    } ],
                    details: 'Content',
                    detailsTemplateUrl: 'designDetails.html'
                };
                // Add the list-item to the items list and the dictionary.
                items.push( listItem );
                designItems[ listItem.id ] = listItem;
            }
        };

        addConfigurationWatcher = function ( designId ) {
            designService.watchNbrOfConfigurations( context, designId, function ( updateObject ) {
                var listItem = designItems[ designId ];
                //console.log(updateObject);
                listItem.stats[ 0 ].value = updateObject.data.counters.sets;
                listItem.stats[ 1 ].value = updateObject.data.counters.configurations;
                listItem.stats[ 2 ].value = updateObject.data.counters.results;
            } )
                .then( function ( data ) {
                    var listItem = designItems[ designId ];
                    listItem.stats[ 0 ].value = data.counters.sets;
                    listItem.stats[ 1 ].value = data.counters.configurations;
                    listItem.stats[ 2 ].value = data.counters.results;
                } );
        };

        designService.registerWatcher( context, function ( destroyed ) {
            items = [];
            $scope.listData.items = items;
            designItems = {};

            if ( destroyed ) {
                console.warn( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info( 'initialize event raised' );

            designService.watchDesigns( context, $scope.workspaceId, function ( updateObject ) {
                var index;
                //console.warn(updateObject);
                if ( updateObject.type === 'load' ) {
                    serviceData2ListItem( updateObject.data );
                    addConfigurationWatcher( updateObject.id );
                } else if ( updateObject.type === 'update' ) {
                    serviceData2ListItem( updateObject.data );
                } else if ( updateObject.type === 'unload' ) {
                    if ( designItems.hasOwnProperty( updateObject.id ) ) {
                        index = items.map( function ( e ) {
                            return e.id;
                        } )
                            .indexOf( updateObject.id );
                        if ( index > -1 ) {
                            items.splice( index, 1 );
                        }
                        designService.cleanUpRegion( context, context.regionId +
                            '_watchNbrOfConfigurations_' + updateObject.id );
                        delete designItems[ updateObject.id ];
                    }
                } else {
                    throw new Error( updateObject );
                }
            } )
                .then( function ( data ) {
                    var designId;
                    for ( designId in data.designs ) {
                        if ( data.designs.hasOwnProperty( designId ) ) {
                            serviceData2ListItem( data.designs[ designId ] );
                            addConfigurationWatcher( designId );
                        }
                    }
                } );
        } );
    } )
    .controller( 'DesignEditController', function ( $scope, $modalInstance, data ) {
        'use strict';
        $scope.data = {
            description: data.description,
            name: data.name
        };

        $scope.ok = function () {
            $modalInstance.close( $scope.data );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss( 'cancel' );
        };
    } )
    .directive( 'designList', function () {
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
    } );
},{}],14:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.components' )
    .controller( 'DesignTreeController', function ( $scope, $window, designService, desertService ) {
        'use strict';
        var context,
            config,
            treeData,
            rootNode,
            avmIds = {},
            buildTreeStructure;

        console.log( 'DesignTreeController' );

        // Check for valid connectionId and register clean-up on destroy event.
        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'DesignTreeController_' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                designService.cleanUpAllRegions( context );
            } );
        } else {
            throw new Error( 'connectionId must be defined and it must be a string' );
        }

        config = {
            nodeContextmenuRenderer: function ( e, node ) {
                return [ {
                    items: [ {
                        id: 'create',
                        label: 'Open in Editor',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-edit',
                        actionData: {
                            id: node.id
                        },
                        action: function ( data ) {
                            $window.open( '/?project=ADMEditor&activeObject=' + data.id, '_blank' );
                        }
                    } ]
                } ];
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
        $scope.$on( 'setSelectedNodes', function ( event, data ) {
            $scope.config.state.selectedNodes = data;
        } );

        buildTreeStructure = function ( container, parentTreeNode ) {
            var key,
                childData,
                treeNode;
            if ( parentTreeNode ) {
                treeNode = {
                    id: null,
                    label: null,
                    extraInfo: null,
                    children: [],
                    childrenCount: 0
                };
                parentTreeNode.children.push( treeNode );
                parentTreeNode.childrenCount += 1;
            } else {
                treeNode = rootNode;
            }
            treeNode.id = container.id;
            treeNode.label = container.name;
            treeNode.extraInfo = container.type;
            $scope.config.state.expandedNodes.push( treeNode.id );
            for ( key in container.components ) {
                if ( container.components.hasOwnProperty( key ) ) {
                    childData = container.components[ key ];
                    treeNode.children.push( {
                        id: childData.id,
                        label: childData.name
                    } );
                    treeNode.childrenCount += 1;
                    if ( avmIds[ childData.avmId ] ) {
                        avmIds[ childData.avmId ].push( childData.id );
                    } else {
                        avmIds[ childData.avmId ] = [ childData.id ];
                    }
                }
            }
            for ( key in container.subContainers ) {
                if ( container.subContainers.hasOwnProperty( key ) ) {
                    childData = container.subContainers[ key ];
                    buildTreeStructure( childData, treeNode );
                }
            }
        };

        designService.registerWatcher( context, function ( destroyed ) {
            if ( destroyed ) {
                console.warn( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info( 'initialize event raised' );

            designService.watchDesignStructure( context, $scope.designId, function ( updateObject ) {
                console.warn( updateObject );
            } )
                .then( function ( data ) {
                    var rootContainer = data.containers[ data.rootId ],
                        desertInputData;
                    buildTreeStructure( rootContainer );
                    $scope.$emit( 'designTreeLoaded', avmIds );
                    // FIXME: This part is only here to reuse the data from watchDesignStructure.
                    // TODO: Find a more suitable location.
                    desertInputData = desertService.getDesertInputData( data );
                    $scope.$emit( 'desertInputReady', desertInputData );
                } );
        } );
    } )
    .directive( 'designTree', function () {
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
    } );
},{}],15:[function(require,module,exports){
/*globals angular*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.components' )
    .controller( 'SimpleModalController', function ( $scope, $modalInstance, data ) {
        'use strict';
        $scope.data = {
            title: data.title,
            details: data.details
        };

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss( 'cancel' );
        };
    } );
},{}],16:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.components' )
    .controller( 'TestBenchDetailsController', function ( $scope, testBenchService ) {
        'use strict';
        var context = {},
            properties = {},
            connectors = {},
            ports = {},
            watchInterfaces;

        console.log( 'TestBenchDetailsController' );
        $scope.init = function ( connectionId ) {
            $scope.connectionId = connectionId;
            if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
                context = {
                    db: $scope.connectionId,
                    regionId: 'TestBenchDetails_' + ( new Date() )
                        .toISOString()
                };
                $scope.$on( '$destroy', function () {
                    console.log( 'Destroying :', context.regionId );
                    testBenchService.cleanUpAllRegions( context );
                } );
            } else {
                throw new Error( 'connectionId must be defined and it must be a string' );
            }
            $scope.details = {
                properties: properties,
                connectors: connectors,
                ports: ports
            };
            watchInterfaces = function ( containerId ) {
                testBenchService.watchInterfaces( context, containerId, function ( updateObject ) {
                    // Since watchInterfaces keeps the data up-to-date there shouldn't be a need to do any
                    // updates here..
                    console.log( 'watchInterfaces', updateObject );
                } )
                    .then( function ( containerInterfaces ) {
                        $scope.details.properties = containerInterfaces.properties;
                        $scope.details.connectors = containerInterfaces.connectors;
                        $scope.details.ports = containerInterfaces.ports;
                    } );
            };

            testBenchService.registerWatcher( context, function ( destroy ) {
                $scope.details = {
                    properties: {},
                    connectors: {},
                    ports: {}
                };
                if ( destroy ) {
                    //TODO: notify user
                    return;
                }
                console.info( 'TestBenchDetailsController - initialize event raised' );
                testBenchService.watchTestBenchDetails( context, $scope.testBenchId, function ( updatedObj ) {
                    console.warn( 'watchTestBenchDetails updates', updatedObj );
                } )
                    .then( function ( data ) {
                        if ( data.containerIds.length === 0 ) {
                            console.warn( 'No container defined!' );
                        } else if ( data.containerIds.length === 1 ) {
                            watchInterfaces( data.containerIds[ 0 ] );
                        } else {
                            console.error( 'More than one container defined!' );
                        }
                    } );
            } );
        };
    } )
    .directive( 'testBenchDetails', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                testBenchId: '=testBenchId'
            },
            require: '^testBenchList',
            link: function ( scope, elem, attr, testBenchListController ) {
                var connectionId = testBenchListController.getConnectionId();
                scope.init( connectionId );
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/InterfaceDetails.html',
            controller: 'TestBenchDetailsController'
        };
    } );
},{}],17:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module( 'cyphy.components' )
    .controller( 'TestBenchListController', function ( $scope, $window, $location, $modal, growl, testBenchService ) {
        'use strict';
        var
        items = [], // Items that are passed to the item-list ui-component.
            testBenchItems = {}, // Same items are stored in a dictionary.
            serviceData2ListItem,
            config,
            context;

        console.log( 'TestBenchListController' );

        this.getConnectionId = function () {
            return $scope.connectionId;
        };

        // Check for valid connectionId and register clean-up on destroy event.
        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'TestBenchListController_' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                testBenchService.cleanUpAllRegions( context );
            } );
        } else {
            throw new Error( 'connectionId must be defined and it must be a string' );
        }

        // Configuration for the item list ui component.
        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function ( jQEvent, ui ) {
                console.log( 'Sort happened', jQEvent, ui );
            },

            itemClick: function ( event, item ) {
                var newUrl = '/testBench/' + $scope.workspaceId.replace( /\//g, '-' ) + '/' + item.id.replace(
                    /\//g, '-' );
                console.log( newUrl );
                $location.path( newUrl );
            },

            itemContextmenuRenderer: function ( e, item ) {
                return [ {
                    items: [ {
                        id: 'openInEditor',
                        label: 'Open in Editor',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-edit',
                        action: function () {
                            $window.open( '/?project=ADMEditor&activeObject=' + item.id, '_blank' );
                        }
                    }, {
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
                    } ]
                }, {
                    items: [ {
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
                    } ]
                } ];
            },

            detailsRenderer: function ( /*item*/) {
                //                item.details = 'My details are here now!';
            },

            filter: {}

        };

        $scope.config = config;
        $scope.listData = {
            items: items
        };

        // Transform the raw service node data to items for the list.
        serviceData2ListItem = function ( data ) {
            var listItem;

            if ( testBenchItems.hasOwnProperty( data.id ) ) {
                listItem = testBenchItems[ data.id ];
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
                        time: 'N/A', // TODO: get this in the future.
                        user: 'N/A' // TODO: get this in the future.
                    },
                    stats: [],
                    details: 'Content',
                    detailsTemplateUrl: 'testBenchDetails.html',
                    data: {
                        files: data.files,
                        path: data.path,
                        results: data.results
                    }
                };
                // Add the list-item to the items list and the dictionary.
                items.push( listItem );
                testBenchItems[ listItem.id ] = listItem;
            }
        };

        testBenchService.registerWatcher( context, function ( destroyed ) {
            items = [];
            $scope.listData.items = items;
            testBenchItems = {};

            if ( destroyed ) {
                console.warn( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info( 'initialize event raised' );

            testBenchService.watchTestBenches( context, $scope.workspaceId, function ( updateObject ) {
                var index;
                //console.warn(updateObject);
                if ( updateObject.type === 'load' ) {
                    serviceData2ListItem( updateObject.data );
                } else if ( updateObject.type === 'update' ) {
                    serviceData2ListItem( updateObject.data );
                } else if ( updateObject.type === 'unload' ) {
                    if ( testBenchItems.hasOwnProperty( updateObject.id ) ) {
                        index = items.map( function ( e ) {
                            return e.id;
                        } )
                            .indexOf( updateObject.id );
                        if ( index > -1 ) {
                            items.splice( index, 1 );
                        }
                        delete testBenchItems[ updateObject.id ];
                    }
                } else {
                    throw new Error( updateObject );
                }
            } )
                .then( function ( data ) {
                    var testBenchId;
                    for ( testBenchId in data.testBenches ) {
                        if ( data.testBenches.hasOwnProperty( testBenchId ) ) {
                            serviceData2ListItem( data.testBenches[ testBenchId ] );
                        }
                    }
                } );
        } );
    } )
    .controller( 'TestBenchEditController', function ( $scope, $modalInstance, growl, data, fileService ) {
        'use strict';
        var fileInfo;
        $scope.data = {
            description: data.description,
            name: data.name,
            fileInfo: {
                hash: data.files,
                name: null,
                url: fileService.getDownloadUrl( data.files )
            },
            path: data.path
        };
        fileInfo = $scope.data.fileInfo;
        if ( fileInfo.hash ) {
            fileService.getMetadata( fileInfo.hash )
                .then( function ( metadata ) {
                    fileInfo.name = metadata.name;
                } )
                .
            catch ( function () {
                console.error( 'Could not get meta-data for hash', fileInfo.hash );
            } );
        }

        $scope.dragOverClass = function ( $event ) {
            var draggedItems = $event.dataTransfer.items,
                hasFile;
            //console.warn(draggedItems);
            hasFile = draggedItems && draggedItems.length === 1 && draggedItems[ 0 ].kind === 'file';

            return hasFile ? 'bg-success dragover' : 'bg-danger dragover';
        };

        $scope.onDroppedFiles = function ( $files ) {
            fileService.saveDroppedFiles( $files, {
                zip: true
            } )
                .then( function ( fInfos ) {
                    if ( fInfos.length !== 1 ) {
                        growl.error( 'One zip file must be dropped!' );
                    } else {
                        fileInfo.name = fInfos[ 0 ].name;
                        fileInfo.url = fInfos[ 0 ].name;
                        fileInfo.hash = fInfos[ 0 ].hash;
                    }
                } );
        };

        $scope.ok = function () {
            $modalInstance.close( $scope.data );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss( 'cancel' );
        };
    } )
    .directive( 'testBenchList', function () {
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
    } );
},{}],18:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.components' )
    .controller( 'WorkersListController', function ( $scope, $interval, growl, executorService ) {
        'use strict';
        var intervalPromise = null,
            consecutiveErrors = 0,
            maxConsecutiveErrors = 30;
        $scope.dataModel = {
            workers: null
        };
        $scope.$on( '$destroy', function () {
            if ( intervalPromise && $interval.cancel( intervalPromise ) ) {
                console.log( 'Workers interval cancelled' );
            } else {
                console.error( 'Could not cancel WorkersInterval.' );
                console.error( intervalPromise );
            }
        } );

        intervalPromise = $interval( function () {
            executorService.getWorkersInfo()
                .then( function ( responce ) {
                    consecutiveErrors = 0;
                    $scope.dataModel.workers = responce;
                } )
                .
            catch ( function ( err ) {
                console.error( err );
                consecutiveErrors += 1;
                if ( consecutiveErrors >= maxConsecutiveErrors ) {
                    $interval.cancel( intervalPromise );
                    growl.error( 'Workers did not respond after ' + maxConsecutiveErrors + ' requests.' );
                    intervalPromise = null;
                }
            } );
        }, 1000 );
    } )
    .directive( 'workersList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {},
            replace: true,
            templateUrl: '/cyphy-components/templates/WorkersList.html',
            controller: 'WorkersListController'
        };
    } );
},{}],19:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module( 'cyphy.components' )
    .controller( 'WorkspaceListController', function ( $scope, $window, $location, $modal, growl, workspaceService,
        fileService ) {
        'use strict';
        var
        items = [],
            workspaceItems = {},
            config,
            context,
            serviceData2ListItem,
            addCountWatchers;

        console.log( 'WorkspaceListController' );

        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'WorkspaceListController_' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                workspaceService.cleanUpAllRegions( context );
            } );
        } else {
            throw new Error( 'connectionId must be defined and it must be a string' );
        }

        config = {

            sortable: false,
            secondaryItemMenu: true,
            detailsCollapsible: true,
            showDetailsLabel: 'Show details',
            hideDetailsLabel: 'Hide details',

            // Event handlers

            itemSort: function ( jQEvent, ui ) {
                console.log( 'Sort happened', jQEvent, ui );
            },

            itemClick: function ( event, item ) {
                $location.path( '/workspaceDetails/' + item.id.replace( /\//g, '-' ) );
            },

            itemContextmenuRenderer: function ( e, item ) {
                return [ {
                    items: [ {
                        id: 'openInEditor',
                        label: 'Open in Editor',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-edit',
                        action: function () {
                            $window.open( '/?project=ADMEditor&activeObject=' + item.id, '_blank' );
                        }
                    }, {
                        id: 'editWorkspace',
                        label: 'Edit',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-pencil',
                        actionData: {
                            id: item.id,
                            description: item.description,
                            name: item.title
                        },
                        action: function ( data ) {
                            var editContext = {
                                db: context.db,
                                regionId: context.regionId + '_watchWorkspaces'
                            },
                                modalInstance = $modal.open( {
                                    templateUrl: '/cyphy-components/templates/WorkspaceEdit.html',
                                    controller: 'WorkspaceEditController',
                                    resolve: {
                                        data: function () {
                                            return data;
                                        }
                                    }
                                } );

                            modalInstance.result.then( function ( editedData ) {
                                var attrs = {
                                    'name': editedData.name,
                                    'INFO': editedData.description
                                };
                                workspaceService.setWorkspaceAttributes( editContext, data.id, attrs )
                                    .then( function () {
                                        console.log( 'Attribute updated' );
                                    } );
                            }, function () {
                                console.log( 'Modal dismissed at: ' + new Date() );
                            } );
                        }
                    }, {
                        id: 'exportAsXME',
                        label: 'Export as XME',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-share-alt',
                        actionData: {
                            id: item.id,
                            name: item.title
                        },
                        action: function ( data ) {
                            workspaceService.exportWorkspace( context, data.id )
                                .then( function ( downloadUrl ) {
                                    growl.success( 'Workspace package for <a href="' + downloadUrl +
                                        '">' +
                                        data.name + '</a> exported.' );
                                } )
                                .
                            catch ( function ( reason ) {
                                console.error( reason );
                                growl.error( 'Export failed, see console for details.' );
                            } );
                        }
                    } ]
                }, {
                    items: [ {
                        id: 'delete',
                        label: 'Delete',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-remove',
                        actionData: {
                            id: item.id,
                            name: item.title
                        },
                        action: function ( data ) {
                            var modalInstance = $modal.open( {
                                templateUrl: '/cyphy-components/templates/SimpleModal.html',
                                controller: 'SimpleModalController',
                                resolve: {
                                    data: function () {
                                        return {
                                            title: 'Delete Workspace',
                                            details: 'This will delete ' + data.name +
                                                ' from the project.'
                                        };
                                    }
                                }
                            } );

                            modalInstance.result.then( function () {
                                workspaceService.deleteWorkspace( context, data.id );
                            }, function () {
                                console.log( 'Modal dismissed at: ' + new Date() );
                            } );
                        }
                    } ]
                } ];
            },

            detailsRenderer: function ( /*item*/) {
                //                item.details = 'My details are here now!';
            },

            newItemForm: {
                title: 'Create new workspace',
                itemTemplateUrl: '/cyphy-components/templates/WorkspaceNewItem.html',
                expanded: false,
                controller: function ( $scope ) {
                    $scope.model = {
                        droppedFiles: []
                    };
                    $scope.dragOverClass = function ( $event ) {
                        var draggedItems = $event.dataTransfer.items,
                            i,
                            hasFile = false;
                        //                        console.warn(draggedItems);
                        if ( draggedItems === null ) {
                            hasFile = false;
                        } else {
                            for ( i = 0; i < draggedItems.length; i += 1 ) {
                                if ( draggedItems[ i ].kind === 'file' ) {
                                    hasFile = true;
                                    break;
                                }
                            }
                        }

                        return hasFile ? 'bg-success dragover' : 'bg-danger dragover';
                    };

                    $scope.onDroppedFiles = function ( $files ) {
                        fileService.saveDroppedFiles( $files, {
                            zip: true,
                            adm: true,
                            atm: true
                        } )
                            .then( function ( fInfos ) {
                                var i;
                                console.log( fInfos );
                                for ( i = 0; i < fInfos.length; i += 1 ) {
                                    $scope.model.droppedFiles.push( fInfos[ i ] );
                                }
                            } );
                    };

                    $scope.createItem = function ( newItem ) {
                        var newItemContext = {
                            db: context.db,
                            regionId: context.regionId + '_watchWorkspaces'
                        };
                        if ( !newItem || !newItem.name ) {
                            growl.warning( 'Provide a name' );
                            return;
                        }
                        workspaceService.createWorkspace( newItemContext, newItem.name, newItem.description )
                            .then( function ( folderIds ) {
                                growl.success( newItem.name + ' created.' );
                                if ( $scope.model.droppedFiles.length > 0 ) {
                                    growl.info( 'Importing files..' );
                                    workspaceService.importFiles( newItemContext, folderIds, $scope.model.droppedFiles )
                                        .then( function () {
                                            growl.info( 'Finished importing files!', {
                                                ttl: 100
                                            } );
                                        }, function ( reason ) {
                                            growl.error( reason );
                                        }, function ( info ) {
                                            growl[ info.type ]( info.message );
                                        } )
                                        .
                                    finally( function () {
                                        config.newItemForm.expanded = false;
                                        $scope.model.droppedFiles = [];
                                    } );
                                } else {
                                    config.newItemForm.expanded = false;
                                    $scope.model.droppedFiles = [];
                                }
                            } );
                    };
                }
            },

            filter: {}

        };

        $scope.listData = {
            items: items
        };

        $scope.config = config;

        serviceData2ListItem = function ( data ) {
            var workspaceItem;

            if ( workspaceItems.hasOwnProperty( data.id ) ) {
                workspaceItem = workspaceItems[ data.id ];
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
                    stats: [ {
                        value: 0,
                        toolTip: 'Components',
                        iconClass: 'fa fa-puzzle-piece'
                    }, {
                        value: 0,
                        toolTip: 'Design Spaces',
                        iconClass: 'fa fa-cubes'
                    }, {
                        value: 0,
                        toolTip: 'Test benches',
                        iconClass: 'glyphicon glyphicon-saved'
                    }, {
                        value: 0,
                        toolTip: 'Requirements',
                        iconClass: 'fa fa-bar-chart-o'
                    } ]
                };

                workspaceItems[ workspaceItem.id ] = workspaceItem;
                items.push( workspaceItem );
            }
        };

        addCountWatchers = function ( workspaceId ) {
            workspaceService.watchNumberOfComponents( context, workspaceId, function ( updateData ) {
                var workspaceData = workspaceItems[ workspaceId ];
                if ( workspaceData ) {
                    workspaceData.stats[ 0 ].value = updateData.data;
                }
            } )
                .then( function ( data ) {
                    var workspaceData = workspaceItems[ workspaceId ];
                    if ( workspaceData ) {
                        workspaceData.stats[ 0 ].value = data.count;
                    }
                } );
            workspaceService.watchNumberOfDesigns( context, workspaceId, function ( updateData ) {
                var workspaceData = workspaceItems[ workspaceId ];
                if ( workspaceData ) {
                    workspaceData.stats[ 1 ].value = updateData.data;
                }
            } )
                .then( function ( data ) {
                    var workspaceData = workspaceItems[ workspaceId ];
                    if ( workspaceData ) {
                        workspaceData.stats[ 1 ].value = data.count;
                    }
                } );
            workspaceService.watchNumberOfTestBenches( context, workspaceId, function ( updateData ) {
                var workspaceData = workspaceItems[ workspaceId ];
                if ( workspaceData ) {
                    workspaceData.stats[ 2 ].value = updateData.data;
                }
            } )
                .then( function ( data ) {
                    var workspaceData = workspaceItems[ workspaceId ];
                    if ( workspaceData ) {
                        workspaceData.stats[ 2 ].value = data.count;
                    }
                } );
        };

        workspaceService.registerWatcher( context, function ( destroyed ) {
            // initialize all variables
            items = [];
            $scope.listData = {
                items: items
            };
            workspaceItems = {};

            if ( destroyed ) {
                console.info( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info( 'WorkspaceListController - initialize event raised' );
            workspaceService.watchWorkspaces( context, function ( updateObject ) {
                var index;

                if ( updateObject.type === 'load' ) {
                    serviceData2ListItem( updateObject.data );
                    addCountWatchers( updateObject.id );

                } else if ( updateObject.type === 'update' ) {
                    serviceData2ListItem( updateObject.data );

                } else if ( updateObject.type === 'unload' ) {
                    if ( workspaceItems.hasOwnProperty( updateObject.id ) ) {
                        index = items.map( function ( e ) {
                            return e.id;
                        } )
                            .indexOf( updateObject.id );
                        if ( index > -1 ) {
                            items.splice( index, 1 );
                        }
                        workspaceService.cleanUpRegion( context, context.regionId +
                            '_watchNumberOfComponents_' + updateObject.id );
                        workspaceService.cleanUpRegion( context, context.regionId +
                            '_watchNumberOfDesigns_' + updateObject.id );
                        workspaceService.cleanUpRegion( context, context.regionId +
                            '_watchNumberOfTestBenches_' + updateObject.id );
                        delete workspaceItems[ updateObject.id ];
                    }

                } else {
                    throw new Error( updateObject );

                }
            } )
                .then( function ( data ) {
                    var workspaceId;

                    for ( workspaceId in data.workspaces ) {
                        if ( data.workspaces.hasOwnProperty( workspaceId ) ) {
                            serviceData2ListItem( data.workspaces[ workspaceId ] );
                            addCountWatchers( workspaceId );
                        }
                    }
                } );
        } );
    } )
    .controller( 'WorkspaceEditController', function ( $scope, $modalInstance, data ) {
        'use strict';
        $scope.data = {
            description: data.description,
            name: data.name
        };

        $scope.ok = function () {
            $modalInstance.close( $scope.data );
        };

        $scope.cancel = function () {
            $modalInstance.dismiss( 'cancel' );
        };
    } )
    .directive( 'workspaceList', function () {
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
    } );
},{}],20:[function(require,module,exports){
/*globals angular*/

angular.module('cyphy.components')
  .controller('ComponentBrowserController', function () {
    'use strict';
  })
  .directive('componentBrowser', function () {
    'use strict';
    return {
      restrict: 'E',
      scope: {
        workspaceId: '=workspaceId',
        connectionId: '=connectionId',
        avmIds: '=avmIds'
      },
      replace: true,
      templateUrl: '/cyphy-components/templates/componentBrowser.html',
      controller: 'ComponentBrowserController'
    };
  });

},{}],21:[function(require,module,exports){
/*globals angular, console*/

/**
 * This service contains functionality shared amongst the different services. It should not be used
 * directly in a controller - only as part of other services.
 *
 * @author pmeijer / https://github.com/pmeijer
 */


angular.module( 'cyphy.services' )
    .service( 'baseCyPhyService', function ( $q, $timeout, nodeService ) {
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
        this.registerWatcher = function ( watchers, parentContext, fn ) {
            nodeService.on( parentContext.db, 'initialize', function () {
                // This should be enough, the regions will be cleaned up in nodeService.
                watchers[ parentContext.regionId ] = {};
                fn( false );
            } );
            nodeService.on( parentContext.db, 'destroy', function () {
                // This should be enough, the regions should be cleaned up in nodeService.
                if ( watchers[ parentContext.regionId ] ) {
                    delete watchers[ parentContext.regionId ];
                }
                fn( true );
            } );
        };

        /**
         * Removes all watchers spawned from parentContext, this should typically be invoked when the controller is destroyed.
         * @param {string} watchers - Watchers from the service utilizing this function.
         * @param {object} parentContext - context of controller.
         * @param {string} parentContext.regionId - Region of the controller (all spawned regions are grouped by this).
         */
        this.cleanUpAllRegions = function ( watchers, parentContext ) {
            var childWatchers,
                key;
            if ( watchers[ parentContext.regionId ] ) {
                childWatchers = watchers[ parentContext.regionId ];
                for ( key in childWatchers ) {
                    if ( childWatchers.hasOwnProperty( key ) ) {
                        nodeService.cleanUpRegion( childWatchers[ key ].db, childWatchers[ key ].regionId );
                    }
                }
                delete watchers[ parentContext.regionId ];
            } else {
                console.log( 'Nothing to clean-up..' );
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
        this.cleanUpRegion = function ( watchers, parentContext, regionId ) {
            if ( watchers[ parentContext.regionId ] ) {
                if ( watchers[ parentContext.regionId ][ regionId ] ) {
                    nodeService.cleanUpRegion( parentContext.db, regionId );
                    delete watchers[ parentContext.regionId ][ regionId ];
                } else {
                    console.log( 'Nothing to clean-up..' );
                }
            } else {
                console.log( 'Cannot clean-up region since parentContext is not registered..', parentContext );
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
        this.setNodeAttributes = function ( context, id, attrs ) {
            var deferred = $q.defer();
            if ( Object.keys( attrs )
                .length === 0 ) {
                console.log( 'no attribute to update' );
                deferred.resolve();
            }
            nodeService.loadNode( context, id )
                .then( function ( nodeObj ) {
                    var keys = Object.keys( attrs ),
                        counter = keys.length,
                        setAttr = function () {
                            counter -= 1;
                            nodeObj.setAttribute( keys[ counter ], attrs[ keys[ counter ] ],
                                'webCyPhy - setNodeAttributes' )
                                .then( function () {
                                    if ( counter <= 0 ) {
                                        deferred.resolve();
                                    } else {
                                        setAttr();
                                    }
                                } );
                        };
                    setAttr();
                } );

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
        this.watchInterfaces = function ( watchers, parentContext, id, updateListener ) {
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
                    ports: {} //port:      {id: <string>, name: <string>, type: <string>, class: <string> }
                },
                onPropertyUpdate = function ( id ) {
                    var newName = this.getAttribute( 'name' ),
                        newDataType = this.getAttribute( 'DataType' ),
                        newValueType = this.getAttribute( 'ValueType' ),
                        newDerived = isPropertyDerived( this ),
                        hadChanges = false;
                    if ( newName !== data.properties[ id ].name ) {
                        data.properties[ id ].name = newName;
                        hadChanges = true;
                    }
                    if ( newDataType !== data.properties[ id ].dataType ) {
                        data.properties[ id ].dataType = newDataType;
                        hadChanges = true;
                    }
                    if ( newValueType !== data.properties[ id ].valueType ) {
                        data.properties[ id ].valueType = newValueType;
                        hadChanges = true;
                    }
                    if ( newDerived !== data.properties[ id ].derived ) {
                        data.properties[ id ].derived = newDerived;
                        hadChanges = true;
                    }
                    if ( hadChanges ) {
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'update',
                                data: data
                            } );
                        } );
                    }
                },
                onPropertyUnload = function ( id ) {
                    delete data.properties[ id ];
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            type: 'unload',
                            data: null
                        } );
                    } );
                },
                onConnectorUpdate = function ( id ) {
                    var newName = this.getAttribute( 'name' ),
                        hadChanges = false;
                    if ( newName !== data.connectors[ id ].name ) {
                        data.connectors[ id ].name = newName;
                        hadChanges = true;
                    }
                    if ( hadChanges ) {
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'update',
                                data: data
                            } );
                        } );
                    }
                },
                onConnectorUnload = function ( id ) {
                    delete data.connectors[ id ];
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            type: 'unload',
                            data: null
                        } );
                    } );
                },
                onPortUpdate = function ( id ) {
                    var newName = this.getAttribute( 'name' ),
                        newType = this.getAttribute( 'Type' ),
                        newClass = this.getAttribute( 'Class' ),
                        hadChanges = false;
                    if ( newName !== data.ports[ id ].name ) {
                        data.ports[ id ].name = newName;
                        hadChanges = true;
                    }
                    if ( newType !== data.ports[ id ].dataType ) {
                        data.ports[ id ].type = newType;
                        hadChanges = true;
                    }
                    if ( newClass !== data.ports[ id ].class ) {
                        data.ports[ id ].class = newClass;
                        hadChanges = true;
                    }
                    if ( hadChanges ) {
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'update',
                                data: data
                            } );
                        } );
                    }
                },
                onPortUnload = function ( id ) {
                    delete data.ports[ id ];
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            type: 'unload',
                            data: null
                        } );
                    } );
                },
                isPropertyDerived = function ( node ) {
                    return node.getCollectionPaths( 'dst' )
                        .length > 0;
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, id )
                        .then( function ( modelNode ) {
                            modelNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        childId,
                                        queueList = [],
                                        childNode;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        childId = childNode.getId();
                                        if ( childNode.isMetaTypeOf( meta.Property ) ) {
                                            data.properties[ childId ] = {
                                                id: childId,
                                                name: childNode.getAttribute( 'name' ),
                                                dataType: childNode.getAttribute( 'DataType' ),
                                                valueType: childNode.getAttribute( 'ValueType' ),
                                                derived: isPropertyDerived( childNode )
                                            };
                                            childNode.onUpdate( onPropertyUpdate );
                                            childNode.onUnload( onPropertyUnload );
                                        } else if ( childNode.isMetaTypeOf( meta.Connector ) ) {
                                            data.connectors[ childId ] = {
                                                id: childId,
                                                name: childNode.getAttribute( 'name' ),
                                                domainPorts: {}
                                            };
                                            childNode.onUpdate( onConnectorUpdate );
                                            childNode.onUnload( onConnectorUnload );
                                            ///queueList.push(childNode.loadChildren(childNode));
                                        } else if ( childNode.isMetaTypeOf( meta.DomainPort ) ) {
                                            data.ports[ childId ] = {
                                                id: childId,
                                                name: childNode.getAttribute( 'name' ),
                                                type: childNode.getAttribute( 'Type' ),
                                                class: childNode.getAttribute( 'Class' )
                                            };
                                            childNode.onUpdate( onPortUpdate );
                                            childNode.onUnload( onPortUnload );
                                            ///queueList.push(childNode.loadChildren(childNode));
                                        }
                                    }
                                    modelNode.onNewChildLoaded( function ( newChild ) {
                                        childId = newChild.getId();
                                        if ( newChild.isMetaTypeOf( meta.Property ) ) {
                                            data.properties[ childId ] = {
                                                id: childId,
                                                name: newChild.getAttribute( 'name' ),
                                                dataType: newChild.getAttribute( 'DataType' ),
                                                valueType: newChild.getAttribute( 'ValueType' ),
                                                derived: isPropertyDerived( newChild )
                                            };
                                            newChild.onUpdate( onPropertyUpdate );
                                            newChild.onUnload( onPropertyUnload );
                                            $timeout( function () {
                                                updateListener( {
                                                    id: childId,
                                                    type: 'load',
                                                    data: data
                                                } );
                                            } );
                                        } else if ( newChild.isMetaTypeOf( meta.Connector ) ) {
                                            data.connectors[ childId ] = {
                                                id: childId,
                                                name: newChild.getAttribute( 'name' ),
                                                domainPorts: {}
                                            };
                                            newChild.onUpdate( onConnectorUpdate );
                                            newChild.onUnload( onConnectorUnload );
                                            $timeout( function () {
                                                updateListener( {
                                                    id: childId,
                                                    type: 'load',
                                                    data: data
                                                } );
                                            } );
                                            ///queueList.push(childNode.loadChildren(childNode));
                                        } else if ( newChild.isMetaTypeOf( meta.DomainPort ) ) {
                                            data.ports[ childId ] = {
                                                id: childId,
                                                name: childNode.getAttribute( 'name' ),
                                                type: childNode.getAttribute( 'Type' ),
                                                class: childNode.getAttribute( 'Class' )
                                            };
                                            newChild.onUpdate( onPortUpdate );
                                            newChild.onUnload( onPortUnload );
                                            $timeout( function () {
                                                updateListener( {
                                                    id: childId,
                                                    type: 'load',
                                                    data: data
                                                } );
                                            } );
                                        }
                                    } );

                                    if ( queueList.length === 0 ) {
                                        deferred.resolve( data );
                                    } else {
                                        $q.all( queueList )
                                            .then( function () {
                                                deferred.resolve( data );
                                            } );
                                    }
                                } );
                        } );
                } );

            return deferred.promise;
        };

    } );
},{}],22:[function(require,module,exports){
/*globals angular, console*/


/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module( 'cyphy.services' )
    .service( 'componentService', function ( $q, $timeout, nodeService, baseCyPhyService ) {
        'use strict';
        var watchers = {};

        /**
         * Removes the component from the context (db/project/branch).
         * @param context - context of controller, N.B. does not need to specify region.
         * @param componentId
         * @param [msg] - Commit message.
         */
        this.deleteComponent = function ( context, componentId, msg ) {
            var message = msg || 'ComponentService.deleteComponent ' + componentId;
            nodeService.destroyNode( context, componentId, message );
        };

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the component.
         * @param {string} context.db - Must exist within watchers and contain the component.
         * @param {string} context.regionId - Must exist within watchers and contain the component.
         * @param {string} componentId - Path to component.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setComponentAttributes = function ( context, componentId, attrs ) {
            return baseCyPhyService.setNodeAttributes( context, componentId, attrs );
        };

        /**
         *  Watches all components (existence and their attributes) of a workspace.
         * @param parentContext - context of controller.
         * @param workspaceId
         * @param updateListener - invoked when there are (filtered) changes in data.  Data is an object in data.components.
         * @param {object} avmIds - An optional filter that only watches components with IDs that evaluates to true.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchComponents = function ( parentContext, workspaceId, avmIds, updateListener ) {
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
                onUpdate = function ( id ) {
                    var newName = this.getAttribute( 'name' ),
                        newDesc = this.getAttribute( 'INFO' ),
                        newAvmID = this.getAttribute( 'ID' ),
                        newResource = this.getAttribute( 'Resource' ),
                        newClass = this.getAttribute( 'Classifications' ),
                        hadChanges = false;
                    if ( newName !== data.components[ id ].name ) {
                        data.components[ id ].name = newName;
                        hadChanges = true;
                    }
                    if ( newDesc !== data.components[ id ].description ) {
                        data.components[ id ].description = newDesc;
                        hadChanges = true;
                    }
                    if ( newAvmID !== data.components[ id ].avmId ) {
                        data.components[ id ].avmId = newAvmID;
                        hadChanges = true;
                    }
                    if ( newResource !== data.components[ id ].resource ) {
                        data.components[ id ].resource = newResource;
                        hadChanges = true;
                    }
                    if ( newClass !== data.components[ id ].classifications ) {
                        data.components[ id ].classifications = newClass;
                        hadChanges = true;
                    }
                    if ( hadChanges ) {
                        console.warn( 'ComponentService found update' );
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'update',
                                data: data.components[ id ]
                            } );
                        } );
                    }
                },
                onUnload = function ( id ) {
                    delete data.components[ id ];
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            type: 'unload',
                            data: null
                        } );
                    } );
                },
                watchFromFolderRec = function ( folderNode, meta ) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                componentId,
                                queueList = [],
                                childNode;
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.ACMFolder ) ) {
                                    queueList.push( watchFromFolderRec( childNode, meta ) );
                                } else if ( childNode.isMetaTypeOf( meta.AVMComponentModel ) ) {
                                    componentId = childNode.getId();
                                    if ( !avmIds || avmIds.hasOwnProperty( childNode.getAttribute( 'ID' ) ) ) {
                                        data.components[ componentId ] = {
                                            id: componentId,
                                            name: childNode.getAttribute( 'name' ),
                                            description: childNode.getAttribute( 'INFO' ),
                                            avmId: childNode.getAttribute( 'ID' ),
                                            resource: childNode.getAttribute( 'Resource' ),
                                            classifications: childNode.getAttribute( 'Classifications' )
                                        };
                                        childNode.onUnload( onUnload );
                                        childNode.onUpdate( onUpdate );
                                    }
                                }
                            }

                            folderNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.ACMFolder ) ) {
                                    watchFromFolderRec( newChild, meta );
                                } else if ( newChild.isMetaTypeOf( meta.AVMComponentModel ) ) {
                                    componentId = newChild.getId();
                                    if ( !avmIds || avmIds.hasOwnProperty( newChild.getAttribute( 'ID' ) ) ) {
                                        data.components[ componentId ] = {
                                            id: componentId,
                                            name: newChild.getAttribute( 'name' ),
                                            description: newChild.getAttribute( 'INFO' ),
                                            avmId: newChild.getAttribute( 'ID' ),
                                            resource: newChild.getAttribute( 'Resource' ),
                                            classifications: newChild.getAttribute( 'Classifications' )
                                        };
                                        newChild.onUnload( onUnload );
                                        newChild.onUpdate( onUpdate );
                                        $timeout( function () {
                                            updateListener( {
                                                id: componentId,
                                                type: 'load',
                                                data: data.components[ componentId ]
                                            } );
                                        } );
                                    }
                                }
                            } );
                            if ( queueList.length === 0 ) {
                                recDeferred.resolve();
                            } else {
                                $q.all( queueList )
                                    .then( function () {
                                        recDeferred.resolve();
                                    } );
                            }
                        } );

                    return recDeferred.promise;
                };
            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, workspaceId )
                        .then( function ( workspaceNode ) {
                            workspaceNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        queueList = [],
                                        childNode;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        if ( childNode.isMetaTypeOf( meta.ACMFolder ) ) {
                                            queueList.push( watchFromFolderRec( childNode, meta ) );
                                        }
                                    }
                                    workspaceNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.ACMFolder ) ) {
                                            watchFromFolderRec( newChild, meta );
                                        }
                                    } );
                                    if ( queueList.length === 0 ) {
                                        deferred.resolve( data );
                                    } else {
                                        $q.all( queueList )
                                            .then( function () {
                                                deferred.resolve( data );
                                            } );
                                    }
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         *  Watches the domain-models of a component.
         * @param parentContext - context of controller.
         * @param componentId
         * @param updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchComponentDomains = function ( parentContext, componentId, updateListener ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchComponentDomains_' + componentId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    id: componentId,
                    domainModels: {} //domainModel: id: <string>, type: <string>
                },
                onDomainModelUpdate = function ( id ) {
                    var newType = this.getAttribute( 'Type' ),
                        hadChanges = false;
                    if ( newType !== data.domainModels[ id ].type ) {
                        data.domainModels[ id ].type = newType;
                        hadChanges = true;
                    }
                    if ( hadChanges ) {
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'update',
                                data: data
                            } );
                        } );
                    }
                },
                onDomainModelUnload = function ( id ) {
                    delete data.domainModels[ id ];
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            type: 'unload',
                            data: null
                        } );
                    } );
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, componentId )
                        .then( function ( componentNode ) {
                            componentNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        childId,
                                        queueList = [],
                                        childNode;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        childId = childNode.getId();
                                        if ( childNode.isMetaTypeOf( meta.DomainModel ) ) {
                                            data.domainModels[ childId ] = {
                                                id: childId,
                                                type: childNode.getAttribute( 'Type' )
                                            };
                                            childNode.onUpdate( onDomainModelUpdate );
                                            childNode.onUnload( onDomainModelUnload );
                                        }
                                    }
                                    componentNode.onNewChildLoaded( function ( newChild ) {
                                        childId = newChild.getId();
                                        if ( newChild.isMetaTypeOf( meta.DomainModel ) ) {
                                            data.domainModels[ childId ] = {
                                                id: childId,
                                                type: newChild.getAttribute( 'Type' )
                                            };
                                            newChild.onUpdate( onDomainModelUpdate );
                                            newChild.onUnload( onDomainModelUnload );
                                            $timeout( function () {
                                                updateListener( {
                                                    id: childId,
                                                    type: 'load',
                                                    data: data
                                                } );
                                            } );
                                        }
                                    } );

                                    if ( queueList.length === 0 ) {
                                        deferred.resolve( data );
                                    } else {
                                        $q.all( queueList )
                                            .then( function () {
                                                deferred.resolve( data );
                                            } );
                                    }
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         * See baseCyPhyService.watchInterfaces.
         */
        this.watchInterfaces = function ( parentContext, id, updateListener ) {
            return baseCyPhyService.watchInterfaces( watchers, parentContext, id, updateListener );
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function ( parentContext ) {
            baseCyPhyService.cleanUpAllRegions( watchers, parentContext );
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function ( parentContext, regionId ) {
            baseCyPhyService.cleanUpRegion( watchers, parentContext, regionId );
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function ( parentContext, fn ) {
            baseCyPhyService.registerWatcher( watchers, parentContext, fn );
        };

        this.logContext = function ( context ) {
            nodeService.logContext( context );
        };
    } );
},{}],23:[function(require,module,exports){
/*globals angular, console, WebGMEGlobal*/

/**
 * This service contains methods for design space exploration through the Executor Client.
 *
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.services' )
    .service( 'desertService', function ( $q, $interval, fileService, executorService ) {
        'use strict';
        var self = this,
            CMDSTR,
            xmlToJson = new WebGMEGlobal.classes.Converters.Xml2json( {
                skipWSText: true,
                arrayElements: {
                    Configuration: true,
                    Element: true,
                    NaturalMember: true,
                    AlternativeAssignment: true
                }
            } ),
            jsonToXml = new WebGMEGlobal.classes.Converters.Json2xml();

        this.calculateConfigurations = function ( desertInput ) {
            var deferred = $q.defer();

            if ( ( desertInput.desertSystem && angular.isObject( desertInput.desertSystem ) &&
                angular.isObject( desertInput.idMap ) ) === false ) {
                deferred.reject( 'desertInput must contain a desertSystem and idMap object!' );
                return deferred.promise;
            }

            self.saveDesertInput( desertInput.desertSystem )
                .then( function ( inputHash ) {
                    console.log( 'Saved desertInput', fileService.getDownloadUrl( inputHash ) );
                    return self.createAndRunJob( inputHash );
                } )
                .then( function ( jobInfo ) {
                    console.log( 'Job succeeded final jobInfo', jobInfo );
                    return self.extractConfigurations( jobInfo, desertInput.idMap );
                } )
                .then( function ( configurations ) {
                    deferred.resolve( configurations );
                } )
                .
            catch ( function ( err ) {
                deferred.reject( 'Calculating configurations failed, err: ' + err.toString() );
            } );

            return deferred.promise;
        };

        this.saveDesertInput = function ( desertSystem ) {
            var deferred = $q.defer(),
                artifact,
                xmlString;

            artifact = fileService.createArtifact( 'desert-input' );
            xmlString = jsonToXml.convertToString( desertSystem );

            fileService.addFileAsSoftLinkToArtifact( artifact, 'desertInput.xml', xmlString )
                .then( function () {
                    var execConfig = JSON.stringify( {
                        cmd: 'run_desert.cmd',
                        resultArtifacts: [ {
                            name: 'all',
                            resultPatterns: []
                        } ]
                    }, null, 4 ),
                        filesToAdd = {
                            'executor_config.json': execConfig,
                            'run_desert.cmd': CMDSTR
                        };
                    return fileService.addFilesToArtifact( artifact, filesToAdd );
                } )
                .then( function () {
                    return fileService.saveArtifact( artifact );
                } )
                .then( function ( artieHash ) {
                    deferred.resolve( artieHash );
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Could not save DesertInput to blob, err: "' + reason + '"' );
            } );

            return deferred.promise;
        };

        this.createAndRunJob = function ( inputHash ) {
            var deferred = $q.defer();
            executorService.createJob( {
                hash: inputHash,
                labels: []
            } )
                .then( function () {
                    var stop;
                    stop = $interval( function () {
                        executorService.getInfo( inputHash )
                            .then( function ( jobInfo ) {
                                console.info( JSON.stringify( jobInfo, null, 4 ) );
                                if ( jobInfo.status === 'CREATED' || jobInfo.status === 'RUNNING' ) {
                                    return;
                                }
                                $interval.cancel( stop );
                                if ( jobInfo.status === 'SUCCESS' ) {
                                    deferred.resolve( jobInfo );
                                } else {
                                    deferred.reject( JSON.stringify( jobInfo, null, 4 ) );
                                }
                            } )
                            .
                        catch ( function ( err ) {
                            $interval.cancel( stop );
                            deferred.reject( 'Could not obtain jobInfo for desert' + err );
                        } );
                    }, 200 );
                } )
                .
            catch ( function ( err ) {
                deferred.reject( 'Could not create job' + err );
            } );

            return deferred.promise;
        };

        this.extractConfigurations = function ( jobInfo, idMap ) {
            var deferred = $q.defer();
            if ( ( jobInfo.resultHashes && jobInfo.resultHashes.all ) === false ) {
                deferred.reject( 'JobInfo did not contain resultHashes.all' );
                return deferred.promise;
            }
            fileService.getMetadata( jobInfo.resultHashes.all )
                .then( function ( metadata ) {
                    //                    // TODO: Deal with configs when there's constraints
                    //                    if (!metadata.content.hasOwnProperty('desertInput_configs.xml')) {
                    //                        deferred.reject('Desert did not generate a "desertInput_configs.xml".');
                    //                        return;
                    //                    }
                    if ( !metadata.content.hasOwnProperty( 'desertInput_back.xml' ) ) {
                        deferred.reject( 'Desert did not generate a desertInput_back.xml.' );
                        return;
                    }

                    return fileService.getObject( metadata.content[ 'desertInput_back.xml' ].content );
                } )
                .then( function ( content ) {
                    var desertObject = xmlToJson.convertFromBuffer( content ),
                        desertBackSystem,
                        j,
                        k,
                        cfg,
                        elem,
                        altAss,
                        config,
                        configurations = [],
                        elemIdToPath = {};

                    if ( desertObject instanceof Error ) {
                        deferred.reject( 'Output desert XML not valid xml, err: ' + desertObject.message );
                        return;
                    }
                    desertBackSystem = desertObject.DesertBackSystem;

                    if ( desertBackSystem.Element ) {
                        for ( j = 0; j < desertBackSystem.Element.length; j += 1 ) {
                            elem = desertBackSystem.Element[ j ];
                            elemIdToPath[ elem[ '@_id' ] ] = idMap[ elem[ '@externalID' ] ];
                        }
                    }
                    for ( j = 0; j < desertBackSystem.Configuration.length; j += 1 ) {
                        cfg = desertBackSystem.Configuration[ j ];
                        configurations.push( {
                            name: cfg[ '@name' ],
                            id: cfg[ '@id' ],
                            alternativeAssignments: []
                        } );
                        config = configurations[ configurations.length - 1 ];
                        if ( cfg.AlternativeAssignment ) {
                            for ( k = 0; k < cfg.AlternativeAssignment.length; k += 1 ) {
                                altAss = cfg.AlternativeAssignment[ k ];
                                config.alternativeAssignments.push( {
                                    selectedAlternative: elemIdToPath[ altAss[ '@alternative_end_' ] ],
                                    alternativeOf: elemIdToPath[ altAss[ '@alternative_of_end_' ] ]
                                } );
                            }
                        }
                    }
                    deferred.resolve( configurations );
                } );

            return deferred.promise;
        };

        this.calculateConfigurationsDummy = function ( /*desertInput*/) {
            var deferred = $q.defer(),
                configurations = [ {
                    id: 1,
                    name: 'Conf. no: 1',
                    alternativeAssignments: [ {
                        selectedAlternative: '/2130017834/542571494/1646059422/564312148/91073815',
                        alternativeOf: '/2130017834/542571494/1646059422/564312148'
                    } ]
                }, {
                    id: 2,
                    name: 'Conf. no: 2',
                    alternativeAssignments: [ {
                        selectedAlternative: '/2130017834/542571494/1646059422/564312148/1433471789',
                        alternativeOf: '/2130017834/542571494/1646059422/564312148'
                    } ]
                }, {
                    id: 3,
                    name: 'Conf. no: 3',
                    alternativeAssignments: [ {
                        selectedAlternative: '/2130017834/542571494/1646059422/564312148/1493907264',
                        alternativeOf: '/2130017834/542571494/1646059422/564312148'
                    } ]
                }, {
                    id: 4,
                    name: 'Conf. no: 4',
                    alternativeAssignments: [ {
                        selectedAlternative: '/2130017834/542571494/1646059422/564312148/1767521621',
                        alternativeOf: '/2130017834/542571494/1646059422/564312148'
                    } ]
                } ];

            deferred.resolve( configurations );
            return deferred.promise;
        };

        this.getDesertInputData = function ( designStructureData ) {
            var desertSystem,
                idMap = {},
                idCounter = 4,
                rootContainer = designStructureData.containers[ designStructureData.rootId ],
                populateDataRec = function ( container, element ) {
                    var key,
                        childData,
                        id;

                    for ( key in container.components ) {
                        if ( container.components.hasOwnProperty( key ) ) {
                            childData = container.components[ key ];
                            idCounter += 1;
                            id = idCounter.toString();
                            idMap[ id ] = childData.id;
                            element.Element.push( {
                                '@_id': 'id' + id,
                                '@decomposition': 'false',
                                '@externalID': id,
                                '@id': id,
                                '@name': childData.name,
                                'Element': []
                            } );
                        }
                    }
                    for ( key in container.subContainers ) {
                        if ( container.subContainers.hasOwnProperty( key ) ) {
                            childData = container.subContainers[ key ];
                            idCounter += 1;
                            id = idCounter.toString();
                            idMap[ id ] = childData.id;
                            element.Element.push( {
                                '@_id': 'id' + id,
                                '@decomposition': ( childData.type === 'Compound' )
                                    .toString(),
                                '@externalID': id,
                                '@id': id,
                                '@name': childData.name,
                                'Element': []
                            } );
                            populateDataRec( childData, element.Element[ element.Element.length - 1 ] );
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
                        'Element': [ {
                            '@_id': 'id4',
                            '@decomposition': 'true',
                            '@externalID': '4',
                            '@id': '4',
                            '@name': rootContainer.name,
                            'Element': []
                        } ]
                    }
                }
            };
            populateDataRec( rootContainer, desertSystem.DesertSystem.Space.Element[ 0 ] );

            return {
                desertSystem: desertSystem,
                idMap: idMap
            };
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
            'popd'
        ].join( '\n' );
    } );
},{}],24:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module( 'cyphy.services' )
    .service( 'designService', function ( $q, $timeout, $location, $modal, growl, nodeService, baseCyPhyService,
        pluginService, fileService ) {
        'use strict';
        var self = this,
            watchers = {};

        this.editDesignFn = function ( data ) {
            var modalInstance = $modal.open( {
                templateUrl: '/cyphy-components/templates/DesignEdit.html',
                controller: 'DesignEditController',
                //size: size,
                resolve: {
                    data: function () {
                        return data;
                    }
                }
            } );

            modalInstance.result.then( function ( editedData ) {
                var attrs = {
                    'name': editedData.name,
                    'INFO': editedData.description
                };
                self.setDesignAttributes( data.context, data.id, attrs )
                    .then( function () {
                        console.log( 'Attribute updated' );
                    } );
            }, function () {
                console.log( 'Modal dismissed at: ' + new Date() );
            } );
        };

        this.exportAsAdmFn = function ( data ) {
            self.exportDesign( data.context, data.id )
                .then( function ( downloadUrl ) {
                    growl.success( 'ADM file for <a href="' + downloadUrl + '">' + data.name + '</a> exported.' );
                } )
                .
            catch ( function ( reason ) {
                console.error( reason );
                growl.error( 'Export failed, see console for details.' );
            } );
        };

        this.deleteFn = function ( data ) {
            var modalInstance = $modal.open( {
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
            } );

            modalInstance.result.then( function () {
                self.deleteDesign( data.context, data.id );
            }, function () {
                console.log( 'Modal dismissed at: ' + new Date() );
            } );
        };

        /**
         * Removes the design from the context.
         * @param {object} context - context of controller.
         * @param {string} context.db - data-base connection.
         * @param {string} designId - Path to design-space.
         * @param [msg] - Commit message.
         */
        this.deleteDesign = function ( context, designId, msg ) {
            var message = msg || 'designService.deleteDesign ' + designId;
            nodeService.destroyNode( context, designId, message );
        };

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the design.
         * @param {string} context.db - Must exist within watchers and contain the design.
         * @param {string} context.regionId - Must exist within watchers and contain the design.
         * @param {string} designId - Path to design-space.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setDesignAttributes = function ( context, designId, attrs ) {
            return baseCyPhyService.setNodeAttributes( context, designId, attrs );
        };

        /**
         * Calls AdmExporter.
         * @param {object} context - Context for plugin.
         * @param {string} context.db - Database connection to pull model from.
         * @param {string} designId
         * @param {string} [desertCfgPath] - Path to configuration if only one is to be exported.
         * @returns {Promise} - resolves to {string} if successful.
         */
        this.exportDesign = function ( context, designId, desertCfgPath ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: designId,
                    runOnServer: false,
                    pluginConfig: {
                        acms: false,
                        desertCfg: desertCfgPath || ''
                    }
                };

            pluginService.runPlugin( context, 'AdmExporter', config )
                .then( function ( result ) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ADM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    if ( result.success ) {
                        console.log( result );
                        deferred.resolve( fileService.getDownloadUrl( result.artifacts[ 0 ] ) );
                    } else {
                        if ( result.error ) {
                            deferred.reject( result.error + ' messages: ' + angular.toJson( result.messages ) );
                        } else {
                            deferred.reject( angular.toJson( result.messages ) );
                        }
                    }
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong ' + reason );
            } );

            return deferred.promise;

        };

        this.generateDashboard = function ( context, designId, resultIds ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: designId,
                    runOnServer: false,
                    pluginConfig: {
                        resultIDs: resultIds.join( ';' )
                    }
                };
            console.log( JSON.stringify( config ) );
            pluginService.runPlugin( context, 'GenerateDashboard', config )
                .then( function ( result ) {
                    var resultLight = {
                        success: result.success,
                        artifactsHtml: '',
                        messages: result.messages
                    };
                    console.log( 'Result', result );
                    pluginService.getPluginArtifactsHtml( result.artifacts )
                        .then( function ( artifactsHtml ) {
                            resultLight.artifactsHtml = artifactsHtml;
                            deferred.resolve( resultLight );
                        } );
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong, ' + reason );
            } );

            return deferred.promise;
        };

        this.watchDesignNode = function ( parentContext, designId, updateListener ) {
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
                onUpdate = function ( id ) {
                    var newName = this.getAttribute( 'name' ),
                        newDesc = this.getAttribute( 'INFO' ),
                        hadChanges = false;
                    if ( newName !== data.design.name ) {
                        data.design.name = newName;
                        hadChanges = true;
                    }
                    if ( newDesc !== data.design.description ) {
                        data.design.description = newDesc;
                        hadChanges = true;
                    }
                    if ( hadChanges ) {
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'update',
                                data: data.design
                            } );
                        } );
                    }
                },
                onUnload = function ( id ) {
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            type: 'unload',
                            data: null
                        } );
                    } );
                };
            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, designId )
                        .then( function ( designNode ) {
                            data.meta = meta;
                            data.design = {
                                id: designId,
                                name: designNode.getAttribute( 'name' ),
                                description: designNode.getAttribute( 'INFO' ),
                                node: designNode
                            };
                            designNode.onUpdate( onUpdate );
                            designNode.onUnload( onUnload );
                            deferred.resolve( data );
                        } );
                } );

            return deferred.promise;
        };

        /**
         *  Watches all containers (existence and their attributes) of a workspace.
         * @param parentContext - context of controller.
         * @param workspaceId
         * @param updateListener - invoked when there are (filtered) changes in data. Data is an object in data.designs.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchDesigns = function ( parentContext, workspaceId, updateListener ) {
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
                onUpdate = function ( id ) {
                    var newName = this.getAttribute( 'name' ),
                        newDesc = this.getAttribute( 'INFO' ),
                        hadChanges = false;
                    if ( newName !== data.designs[ id ].name ) {
                        data.designs[ id ].name = newName;
                        hadChanges = true;
                    }
                    if ( newDesc !== data.designs[ id ].description ) {
                        data.designs[ id ].description = newDesc;
                        hadChanges = true;
                    }
                    if ( hadChanges ) {
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'update',
                                data: data.designs[ id ]
                            } );
                        } );
                    }
                },
                onUnload = function ( id ) {
                    delete data.designs[ id ];
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            type: 'unload',
                            data: null
                        } );
                    } );
                },
                watchFromFolderRec = function ( folderNode, meta ) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                designId,
                                queueList = [],
                                childNode;
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.ADMFolder ) ) {
                                    queueList.push( watchFromFolderRec( childNode, meta ) );
                                } else if ( childNode.isMetaTypeOf( meta.Container ) ) {
                                    designId = childNode.getId();
                                    data.designs[ designId ] = {
                                        id: designId,
                                        name: childNode.getAttribute( 'name' ),
                                        description: childNode.getAttribute( 'INFO' )
                                    };
                                    childNode.onUnload( onUnload );
                                    childNode.onUpdate( onUpdate );
                                }
                            }

                            folderNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.ADMFolder ) ) {
                                    watchFromFolderRec( newChild, meta );
                                } else if ( newChild.isMetaTypeOf( meta.Container ) ) {
                                    designId = newChild.getId();
                                    data.designs[ designId ] = {
                                        id: designId,
                                        name: newChild.getAttribute( 'name' ),
                                        description: newChild.getAttribute( 'INFO' )
                                    };
                                    newChild.onUnload( onUnload );
                                    newChild.onUpdate( onUpdate );
                                    $timeout( function () {
                                        updateListener( {
                                            id: designId,
                                            type: 'load',
                                            data: data.designs[ designId ]
                                        } );
                                    } );
                                }
                            } );
                            if ( queueList.length === 0 ) {
                                recDeferred.resolve();
                            } else {
                                $q.all( queueList )
                                    .then( function () {
                                        recDeferred.resolve();
                                    } );
                            }
                        } );

                    return recDeferred.promise;
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, workspaceId )
                        .then( function ( workspaceNode ) {
                            workspaceNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        queueList = [],
                                        childNode;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        if ( childNode.isMetaTypeOf( meta.ADMFolder ) ) {
                                            queueList.push( watchFromFolderRec( childNode, meta ) );
                                        }
                                    }
                                    workspaceNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.ADMFolder ) ) {
                                            watchFromFolderRec( newChild, meta );
                                        }
                                    } );
                                    if ( queueList.length === 0 ) {
                                        deferred.resolve( data );
                                    } else {
                                        $q.all( queueList )
                                            .then( function () {
                                                deferred.resolve( data );
                                            } );
                                    }
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         *  Watches all containers (existence and their attributes) of a workspace.
         * @param {object} parentContext - context of controller.
         * @param {string} designId
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNbrOfConfigurations = function ( parentContext, designId, updateListener ) {
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
                watchConfiguration = function ( cfgNode, meta, wasCreated ) {
                    var cfgDeferred = $q.defer(),
                        resultOnUnload = function ( id ) {
                            data.counters.results -= 1;
                            $timeout( function () {
                                updateListener( {
                                    id: id,
                                    type: 'unload',
                                    data: data
                                } );
                            } );
                        };
                    // Count this set and add an unload handle.
                    data.counters.configurations += 1;
                    if ( wasCreated ) {
                        $timeout( function () {
                            updateListener( {
                                id: cfgNode.getId(),
                                type: 'load',
                                data: data
                            } );
                        } );
                    }
                    cfgNode.onUnload( function ( id ) {
                        data.counters.configurations -= 1;
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'unload',
                                data: data
                            } );
                        } );
                    } );
                    cfgNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                childNode;
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.Result ) ) {
                                    data.counters.results += 1;
                                    childNode.onUnload( resultOnUnload );
                                }
                            }
                            cfgNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.Result ) ) {
                                    data.counters.results += 1;
                                    $timeout( function () {
                                        updateListener( {
                                            id: newChild.getId(),
                                            type: 'load',
                                            data: data
                                        } );
                                    } );
                                    newChild.onUnload( resultOnUnload );
                                }
                            } );
                            cfgDeferred.resolve();
                        } );

                    return cfgDeferred.promise;
                },
                watchConfigurationSet = function ( setNode, meta, wasCreated ) {
                    var setDeferred = $q.defer();
                    // Count this set and add an unload handle.
                    data.counters.sets += 1;
                    if ( wasCreated ) {
                        $timeout( function () {
                            updateListener( {
                                id: setNode.getId(),
                                type: 'load',
                                data: data
                            } );
                        } );
                    }
                    setNode.onUnload( function ( id ) {
                        data.counters.sets -= 1;
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'unload',
                                data: data
                            } );
                        } );
                    } );
                    setNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                queueList = [],
                                childNode;
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.DesertConfiguration ) ) {
                                    queueList.push( watchConfiguration( childNode, meta ) );
                                }
                            }
                            setNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.DesertConfiguration ) ) {
                                    watchConfiguration( newChild, meta, true );
                                }
                            } );
                            if ( queueList.length === 0 ) {
                                setDeferred.resolve();
                            } else {
                                $q.all( queueList )
                                    .then( function () {
                                        setDeferred.resolve();
                                    } );
                            }
                        } );

                    return setDeferred.promise;
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, designId )
                        .then( function ( designNode ) {
                            designNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        queueList = [],
                                        childNode;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        if ( childNode.isMetaTypeOf( meta.DesertConfigurationSet ) ) {
                                            queueList.push( watchConfigurationSet( childNode, meta ) );
                                        }
                                    }
                                    designNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.DesertConfigurationSet ) ) {
                                            watchConfigurationSet( newChild, meta, true );
                                        }
                                    } );
                                    if ( queueList.length === 0 ) {
                                        deferred.resolve( data );
                                    } else {
                                        $q.all( queueList )
                                            .then( function () {
                                                deferred.resolve( data );
                                            } );
                                    }
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         *  Watches a design(space) w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param designId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchInterfaces = function ( parentContext, designId, updateListener ) {
            return baseCyPhyService.watchInterfaces( watchers, parentContext, designId, updateListener );
        };

        /**
         *  Watches the full hierarchy of a design w.r.t. containers and components.
         * @param {object} parentContext - context of controller.
         * @param {string} designId - path to root container.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchDesignStructure = function ( parentContext, designId ) {
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
                    components: {} // component: {id: <string>, name: <string>, parentId: <string>,
                    //             , avmId: <string> }
                },
                getComponentInfo = function ( node, parentId ) {
                    return {
                        id: node.getId(),
                        name: node.getAttribute( 'name' ),
                        parentId: parentId,
                        avmId: node.getAttribute( 'ID' )
                    };
                },
                watchFromContainerRec = function ( containerNode, rootContainer, meta ) {
                    var recDeferred = $q.defer();
                    containerNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                queueList = [],
                                childNode,
                                container = {
                                    id: containerNode.getId(),
                                    name: containerNode.getAttribute( 'name' ),
                                    type: containerNode.getAttribute( 'Type' ),
                                    subContainers: {},
                                    components: {}
                                },
                                component;

                            rootContainer.subContainers[ containerNode.getId() ] = container;
                            data.containers[ containerNode.getId() ] = container;

                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.Container ) ) {
                                    queueList.push( watchFromContainerRec( childNode, container, meta ) );
                                } else if ( childNode.isMetaTypeOf( meta.AVMComponentModel ) ) {
                                    component = getComponentInfo( childNode, container.id );
                                    container.components[ childNode.getId() ] = component;
                                    data.components[ childNode.getId() ] = component;
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

                            if ( queueList.length === 0 ) {
                                recDeferred.resolve();
                            } else {
                                $q.all( queueList )
                                    .then( function () {
                                        recDeferred.resolve();
                                    } );
                            }
                        } );

                    return recDeferred.promise;
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, designId )
                        .then( function ( rootNode ) {
                            rootNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        queueList = [],
                                        childNode,
                                        rootContainer = {
                                            id: rootNode.getId(),
                                            name: rootNode.getAttribute( 'name' ),
                                            type: rootNode.getAttribute( 'Type' ),
                                            subContainers: {},
                                            components: {}
                                        },
                                        component;

                                    data.containers[ rootContainer.id ] = rootContainer;
                                    data.containers[ rootContainer.id ] = rootContainer;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        if ( childNode.isMetaTypeOf( meta.Container ) ) {
                                            queueList.push( watchFromContainerRec( childNode,
                                                rootContainer, meta ) );
                                        } else if ( childNode.isMetaTypeOf( meta.AVMComponentModel ) ) {
                                            component = getComponentInfo( childNode, rootContainer.id );
                                            rootContainer.components[ childNode.getId() ] = component;
                                            data.components[ childNode.getId() ] = component;
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
                                    if ( queueList.length === 0 ) {
                                        deferred.resolve( data );
                                    } else {
                                        $q.all( queueList )
                                            .then( function () {
                                                deferred.resolve( data );
                                            } );
                                    }
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         *  Watches the generated DesertConfigurationSets inside a Design.
         * @param {object} parentContext - context of controller.
         * @param {string} designId - path to design of which to watch.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchConfigurationSets = function ( parentContext, designId, updateListener ) {
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

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, designId )
                        .then( function ( designNode ) {
                            data.name = designNode.getAttribute( 'name' );
                            designNode.loadChildren( context )
                                .then( function ( childNodes ) {
                                    var i,
                                        childId,
                                        onUpdate = function ( id ) {
                                            var newName = this.getAttribute( 'name' );
                                            if ( newName !== data.configurationSets[ id ].name ) {
                                                data.configurationSets[ id ].name = newName;
                                                $timeout( function () {
                                                    updateListener( {
                                                        id: id,
                                                        type: 'update',
                                                        data: data
                                                    } );
                                                } );
                                            }
                                        },
                                        onUnload = function ( id ) {
                                            delete data.configurationSets[ id ];
                                            $timeout( function () {
                                                updateListener( {
                                                    id: id,
                                                    type: 'unload',
                                                    data: data
                                                } );
                                            } );
                                        };
                                    for ( i = 0; i < childNodes.length; i += 1 ) {
                                        if ( childNodes[ i ].isMetaTypeOf( meta.DesertConfigurationSet ) ) {
                                            childId = childNodes[ i ].getId();
                                            data.configurationSets[ childId ] = {
                                                id: childId,
                                                name: childNodes[ i ].getAttribute( 'name' ),
                                                description: childNodes[ i ].getAttribute( 'INFO' )
                                            };
                                            childNodes[ i ].onUpdate( onUpdate );
                                            childNodes[ i ].onUnload( onUnload );
                                        }
                                    }

                                    designNode.onNewChildLoaded( function ( newNode ) {
                                        if ( newNode.isMetaTypeOf( meta.DesertConfigurationSet ) ) {
                                            childId = newNode.getId();
                                            data.configurationSets[ childId ] = {
                                                id: childId,
                                                name: newNode.getAttribute( 'name' ),
                                                description: newNode.getAttribute( 'INFO' )
                                            };
                                            newNode.onUpdate( onUpdate );
                                            newNode.onUnload( onUnload );
                                            $timeout( function () {
                                                updateListener( {
                                                    id: childId,
                                                    type: 'load',
                                                    data: data
                                                } );
                                            } );
                                        }
                                    } );
                                    deferred.resolve( data );
                                } );
                        } );
                } );
            return deferred.promise;
        };

        /**
         *  Watches the generated DesertConfigurations inside a DesertConfigurationSets.
         * @param {object} parentContext - context of controller.
         * @param {string} configurationSetId - path to DesertConfigurationSet of which to watch.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchConfigurations = function ( parentContext, configurationSetId, updateListener ) {
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

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ regionId ] = context;

            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, configurationSetId )
                        .then( function ( cfgSetNode ) {
                            cfgSetNode.loadChildren( context )
                                .then( function ( childNodes ) {
                                    var i,
                                        childId,
                                        onUpdate = function ( id ) {
                                            var newName = this.getAttribute( 'name' ),
                                                newAltAss = this.getAttribute( 'AlternativeAssignments' ),
                                                hadChanges = false;

                                            if ( newName !== data.configurations[ id ].name ) {
                                                data.configurations[ id ].name = newName;
                                                hadChanges = true;
                                            }
                                            if ( newAltAss !== data.configurations[ id ].alternativeAssignments ) {
                                                data.configurations[ id ].alternativeAssignments =
                                                    newAltAss;
                                                hadChanges = true;
                                            }

                                            if ( hadChanges ) {
                                                $timeout( function () {
                                                    updateListener( {
                                                        id: id,
                                                        type: 'update',
                                                        data: data.configurations[ id ]
                                                    } );
                                                } );
                                            }
                                        },
                                        onUnload = function ( id ) {
                                            if ( data.configurations[ id ] ) {
                                                delete data.configurations[ id ];
                                            }
                                            $timeout( function () {
                                                updateListener( {
                                                    id: id,
                                                    type: 'unload',
                                                    data: null
                                                } );
                                            } );
                                        };
                                    for ( i = 0; i < childNodes.length; i += 1 ) {
                                        childId = childNodes[ i ].getId();
                                        if ( childNodes[ i ].isMetaTypeOf( meta.DesertConfiguration ) ) {
                                            data.configurations[ childId ] = {
                                                id: childId,
                                                name: childNodes[ i ].getAttribute( 'name' ),
                                                alternativeAssignments: childNodes[ i ].getAttribute(
                                                    'AlternativeAssignments' )
                                            };
                                            childNodes[ i ].onUpdate( onUpdate );
                                            childNodes[ i ].onUnload( onUnload );
                                        }
                                    }

                                    cfgSetNode.onNewChildLoaded( function ( newNode ) {
                                        if ( newNode.isMetaTypeOf( meta.DesertConfiguration ) ) {
                                            childId = newNode.getId();
                                            data.configurations[ childId ] = {
                                                id: childId,
                                                name: newNode.getAttribute( 'name' ),
                                                alternativeAssignments: newNode.getAttribute(
                                                    'AlternativeAssignments' )
                                            };
                                            newNode.onUpdate( onUpdate );
                                            newNode.onUnload( onUnload );
                                            $timeout( function () {
                                                updateListener( {
                                                    id: childId,
                                                    type: 'load',
                                                    data: data.configurations[ childId ]
                                                } );
                                            } );
                                        }
                                    } );

                                    deferred.resolve( data );
                                } );
                        } );
                } );
            return deferred.promise;
        };

        /**
         *  Watches the generated DesertConfigurationSets inside a Design.
         * @param {object} parentContext - context of controller.
         * @param {object} configuration - Configuration of which to watch.
         * @param {string} configuration.id - path to Configuration of which to watch.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         */
        this.appendWatchResults = function ( parentContext, configuration ) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchResults_' + configuration.id,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ regionId ] = context;
            configuration.regionId = regionId;
            configuration.results = {};

            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, configuration.id )
                        .then( function ( cfgNode ) {
                            cfgNode.loadChildren( context )
                                .then( function ( childNodes ) {
                                    var i,
                                        childId,
                                        hasResults = false,
                                        onUnload = function ( id ) {
                                            $timeout( function () {
                                                if ( configuration.results[ id ] ) {
                                                    delete configuration.results[ id ];
                                                }
                                            } );
                                        };
                                    for ( i = 0; i < childNodes.length; i += 1 ) {
                                        childId = childNodes[ i ].getId();
                                        if ( childNodes[ i ].isMetaTypeOf( meta.Result ) ) {
                                            configuration.results[ childId ] = {
                                                id: childId
                                                //name: childNodes[i].getAttribute('name'),
                                            };
                                            //childNodes[i].onUpdate(onUpdate); TODO: When attributes are watch add this.
                                            childNodes[ i ].onUnload( onUnload );
                                            hasResults = true;
                                        }
                                    }

                                    cfgNode.onNewChildLoaded( function ( newNode ) {
                                        if ( newNode.isMetaTypeOf( meta.Result ) ) {
                                            childId = newNode.getId();
                                            $timeout( function () {
                                                configuration.results[ childId ] = {
                                                    id: childId
                                                };
                                            } );
                                        }
                                    } );

                                    deferred.resolve( hasResults );
                                } );
                        } );
                } );

            return deferred.promise;
        };

        this.callSaveDesertConfigurations = function ( context, setName, setDesc, configurations, designId ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: designId,
                    runOnServer: false,
                    pluginConfig: {
                        setData: angular.toJson( {
                            name: setName,
                            description: setDesc || ''
                        } ),
                        configurations: angular.toJson( configurations )
                    }
                };

            pluginService.runPlugin( context, 'SaveDesertConfigurations', config )
                .then( function ( result ) {
                    if ( result.success ) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong, ' + reason );
            } );

            return deferred.promise;
        };

        this.saveConfigurationSet = function ( setName, setDesc, configurations, designNode, meta ) {
            var deferred = $q.defer(),
                context = designNode.context;
            nodeService.createNode( context, designNode, meta.DesertConfigurationSet,
                'web-cyphy saveConfigurationSet' )
                .then( function ( setNode ) {
                    var counter = configurations.length,
                        createConfig = function () {
                            var cfgNode;
                            counter -= 1;
                            nodeService.createNode( context, setNode, meta.DesertConfiguration,
                                'web-cyphy saveConfigurationSet' )
                                .then( function ( newNode ) {
                                    var name = configurations[ counter ].name;
                                    cfgNode = newNode;
                                    return cfgNode.setAttribute( 'name', name, 'web-cyphy set name to ' +
                                        name );
                                } )
                                .then( function () {
                                    var aaStr = JSON.stringify( configurations[ counter ].alternativeAssignments );
                                    return cfgNode.setAttribute( 'AlternativeAssignments', aaStr,
                                        'web-cyphy set AlternativeAssignments to ' + aaStr );
                                } )
                                .then( function () {
                                    if ( counter > 0 ) {
                                        createConfig();
                                    } else {
                                        deferred.resolve();
                                    }
                                } )
                                .
                            catch ( function ( reason ) {
                                deferred.reject( 'Problems creating configurations nodes' + reason.toString() );
                            } );

                        };

                    setNode.setAttribute( 'name', setName, 'web-cyphy set name to ' + setName )
                        .then( function () {
                            if ( setDesc ) {
                                setNode.setAttribute( 'INFO', setDesc, 'web-cyphy set INFO to ' + setDesc )
                                    .
                                then( function () {
                                    if ( counter > 0 ) {
                                        createConfig();
                                    } else {
                                        deferred.reject( 'No configurations given!' );
                                    }
                                } );
                            } else {
                                if ( counter > 0 ) {
                                    createConfig();
                                } else {
                                    deferred.reject( 'No configurations given!' );
                                }
                            }
                        } );
                } );

            return deferred.promise;
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function ( parentContext ) {
            baseCyPhyService.cleanUpAllRegions( watchers, parentContext );
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function ( parentContext, regionId ) {
            baseCyPhyService.cleanUpRegion( watchers, parentContext, regionId );
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function ( parentContext, fn ) {
            baseCyPhyService.registerWatcher( watchers, parentContext, fn );
        };
    } );
},{}],25:[function(require,module,exports){
/*globals angular, WebGMEGlobal*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.services' )
    .service( 'executorService', function ( $q ) {
        'use strict';
        var executorClient = new WebGMEGlobal.classes.ExecutorClient();

        this.createJob = function ( jobData ) {
            var deferred = $q.defer();
            executorClient.createJob( jobData, function ( err, jobInfo ) {
                if ( err ) {
                    deferred.reject( err );
                } else {
                    deferred.resolve( jobInfo );
                }
            } );

            return deferred.promise;
        };

        this.getInfo = function ( jobHash ) {
            var deferred = $q.defer();
            executorClient.getInfo( jobHash, function ( err, jobInfo ) {
                if ( err ) {
                    deferred.reject( err );
                } else {
                    deferred.resolve( jobInfo );
                }
            } );

            return deferred.promise;
        };

        this.getWorkersInfo = function () {
            var deferred = $q.defer();
            executorClient.getWorkersInfo( function ( err, response ) {
                if ( err ) {
                    deferred.reject( err );
                } else {
                    deferred.resolve( response );
                }
            } );

            return deferred.promise;
        };
    } );
},{}],26:[function(require,module,exports){
/*globals angular, WebGMEGlobal, console*/


/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.services' )
    .service( 'fileService', function ( $q ) {
        'use strict';
        var self = this,
            blobClient = new WebGMEGlobal.classes.BlobClient();

        //TODO: Consider making an Artifact 'Class'.
        this.createArtifact = function ( name ) {
            return blobClient.createArtifact( name );
        };

        this.saveArtifact = function ( artifact ) {
            var deferred = $q.defer();
            artifact.save( function ( err, artieHash ) {
                if ( err ) {
                    deferred.reject( err );
                } else {
                    deferred.resolve( artieHash );
                }
            } );

            return deferred.promise;
        };

        this.getArtifact = function ( hash ) {
            var deferred = $q.defer();
            blobClient.getArtifact( hash, function ( err, artifact ) {
                if ( err ) {
                    deferred.reject( err );
                    return;
                }
                deferred.resolve( {
                    artifact: artifact,
                    hash: hash
                } );
            } );
            return deferred.promise;
        };

        this.addFileToArtifact = function ( artifact, fileName, content ) {
            var deferred = $q.defer();
            artifact.addFile( fileName, content, function ( err, hashes ) {
                if ( err ) {
                    deferred.reject( err );
                } else {
                    deferred.resolve( hashes );
                }
            } );

            return deferred.promise;
        };

        /**
         * Adds multiple files to given artifact.
         */
        this.addFilesToArtifact = function ( artifact, files ) {
            var deferred = $q.defer();
            artifact.addFiles( files, function ( err, hashes ) {
                if ( err ) {
                    deferred.reject( err );
                } else {
                    deferred.resolve( hashes );
                }
            } );

            return deferred.promise;
        };

        this.addFileAsSoftLinkToArtifact = function ( artifact, fileName, content ) {
            var deferred = $q.defer();

            artifact.addFileAsSoftLink( fileName, content, function ( err, hash ) {
                if ( err ) {
                    deferred.reject( err );
                } else {
                    deferred.resolve( hash );
                }
            } );

            return deferred.promise;
        };

        this.getMetadata = function ( hash ) {
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
            blobClient.getMetadata( hash, function ( err, metaData ) {
                if ( err ) {
                    deferred.reject( err );
                } else {
                    deferred.resolve( metaData );
                }
            } );

            return deferred.promise;
        };

        this.getObject = function ( hash ) {
            var deferred = $q.defer();
            blobClient.getObject( hash, function ( err, content ) {
                if ( err ) {
                    deferred.reject( err );
                } else {
                    deferred.resolve( content );
                }
            } );

            return deferred.promise;
        };

        /**
         * Returns the download url for the given hash.
         * @param {string} hash - hash to blob file.
         * @returns {string} - the download url (null if hash is empty).
         */
        this.getDownloadUrl = function ( hash ) {
            var url;
            if ( hash ) {
                url = blobClient.getDownloadURL( hash );
            } else {
                console.warn( 'No hash to blob file given' );
                url = null;
            }

            return url;
        };

        /**
         * Returns the file extension of the given filename.
         * @param {string} filename
         * @returns {string} - the resulting file extension.
         */
        this.getFileExtension = function ( filename ) {
            var a = filename.split( '.' );
            if ( a.length === 1 || ( a[ 0 ] === '' && a.length === 2 ) ) {
                return '';
            }
            return a.pop()
                .toLowerCase();
        };

        /**
         * Formats the size into a human readable string.
         * @param {number} bytes - size in bytes.
         * @param {boolean} si - return result in SIUnits or not.
         * @returns {string} - formatted file size.
         */
        this.humanFileSize = function ( bytes, si ) {
            var thresh = si ? 1000 : 1024,
                units,
                u;
            if ( bytes < thresh ) {
                return bytes + ' B';
            }

            units = si ? [ 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ] : [ 'KiB', 'MiB', 'GiB', 'TiB', 'PiB',
                'EiB', 'ZiB', 'YiB'
            ];
            u = -1;

            do {
                bytes = bytes / thresh;
                u += 1;
            } while ( bytes >= thresh );

            return bytes.toFixed( 1 ) + ' ' + units[ u ];
        };

        // WebCyPhySpecific functions.

        /**
         * TODO: This method should use promises internally!
         * @param files
         * @param validExtensions
         * @returns {*}
         */
        this.saveDroppedFiles = function ( files, validExtensions ) {
            var deferred = $q.defer(),
                i,
                counter = files.length,
                artie = blobClient.createArtifact( 'droppedFiles' ),
                addFile,
                addedFiles = [],
                fileExtensionToIcon = {
                    'zip': 'fa fa-puzzle-piece',
                    'adm': 'fa fa-cubes',
                    'atm': 'glyphicon glyphicon-saved'
                },
                updateCounter = function () {
                    counter -= 1;
                    if ( counter <= 0 ) {
                        deferred.resolve( addedFiles );
                    }
                };

            counter = files.length;

            addFile = function ( file ) {
                var fileExtension = self.getFileExtension( file.name );
                if ( !validExtensions || validExtensions[ fileExtension ] ) {
                    artie.addFileAsSoftLink( file.name, file, function ( err, hash ) {
                        if ( err ) {
                            console.error( 'Could not add file "' + file.name + '" to blob, err: ' + err );
                            updateCounter();
                            return;
                        }
                        addedFiles.push( {
                            hash: hash,
                            name: file.name,
                            type: fileExtension,
                            size: self.humanFileSize( file.size, true ),
                            url: blobClient.getDownloadURL( hash ),
                            icon: fileExtensionToIcon[ fileExtension ] || ''
                        } );
                        updateCounter();
                    } );
                } else {
                    updateCounter();
                }
            };
            for ( i = 0; i < files.length; i += 1 ) {
                addFile( files[ i ] );
            }

            return deferred.promise;
        };
    } );
},{}],27:[function(require,module,exports){
/*globals angular, WebGMEGlobal*/


/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.services' )
    .service( 'pluginService', function ( $q, dataStoreService, fileService ) {
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
        this.runPlugin = function ( context, pluginName, config ) {
            var deferred = $q.defer(),
                dbConn = dataStoreService.getDatabaseConnection( context.db ),
                interpreterManager = new WebGMEGlobal.classes.InterpreterManager( dbConn.client );

            interpreterManager.run( pluginName, config, function ( result ) {
                if ( result ) {
                    deferred.resolve( result );
                } else {
                    deferred.reject( 'No Result was return from plugin execution!' );
                }
            } );

            return deferred.promise;
        };

        this.getPluginArtifactsHtml = function ( artieHashes ) {
            var deferred = $q.defer(),
                queueList = [],
                i;

            for ( i = 0; i < artieHashes.length; i += 1 ) {
                queueList.push( fileService.getArtifact( artieHashes[ i ] ) );
            }

            if ( queueList.length === 0 ) {
                deferred.resolve( '' );
            } else {
                $q.all( queueList )
                    .then( function ( artifactsInfo ) {
                        var j,
                            downloadUrl,
                            artieName,
                            artifactsHtml = '';
                        for ( j = 0; j < artifactsInfo.length; j += 1 ) {
                            downloadUrl = fileService.getDownloadUrl( artifactsInfo[ j ].hash );
                            artieName = artifactsInfo[ j ].artifact.name;
                            artifactsHtml += '<br> <a href="' + downloadUrl + '">' + artieName + '</a>';
                        }
                        deferred.resolve( artifactsHtml );
                    } );
            }

            return deferred.promise;
        };
    } );
},{}],28:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module( 'cyphy.services' )
    .service( 'testBenchService', function ( $q, $timeout, $modal, nodeService, baseCyPhyService, pluginService ) {
        'use strict';
        var self = this,
            watchers = {};

        this.editTestBenchFn = function ( data ) {
            var modalInstance = $modal.open( {
                templateUrl: '/cyphy-components/templates/TestBenchEdit.html',
                controller: 'TestBenchEditController',
                //size: size,
                resolve: {
                    data: function () {
                        return data;
                    }
                }
            } );

            modalInstance.result.then( function ( editedData ) {
                var attrs = {};
                if ( editedData.description !== data.testBench.description ) {
                    attrs.INFO = editedData.description;
                }
                if ( editedData.name !== data.testBench.title ) {
                    attrs.name = editedData.name;
                }
                if ( editedData.fileInfo.hash !== data.testBench.data.files ) {
                    attrs.TestBenchFiles = editedData.fileInfo.hash;
                }
                if ( editedData.path !== data.testBench.data.path ) {
                    attrs.ID = editedData.path;
                }

                self.setTestBenchAttributes( data.editContext, data.id, attrs )
                    .then( function () {
                        console.log( 'Attribute(s) updated' );
                    } );
            }, function () {
                console.log( 'Modal dismissed at: ' + new Date() );
            } );
        };

        this.deleteFn = function ( data ) {
            var modalInstance = $modal.open( {
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
            } );

            modalInstance.result.then( function () {
                self.deleteTestBench( data.context, data.id );
            }, function () {
                console.log( 'Modal dismissed at: ' + new Date() );
            } );
        };

        /**
         * Removes the test bench from the context.
         * @param {object} context - context of controller.
         * @param {string} context.db - data-base connection.
         * @param {string} testBenchId - Path to design-space.
         * @param [msg] - Commit message.
         */
        this.deleteTestBench = function ( context, testBenchId, msg ) {
            var message = msg || 'testBenchService.deleteTestBench ' + testBenchId;
            nodeService.destroyNode( context, testBenchId, message );
        };

        this.exportTestBench = function ( /*testBenchId*/) {
            throw new Error( 'Not implemented.' );
        };

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the test bench.
         * @param {string} context.db - Must exist within watchers and contain the test bench.
         * @param {string} context.regionId - Must exist within watchers and contain the test bench.
         * @param {string} testBenchId - Path to test bench.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setTestBenchAttributes = function ( context, testBenchId, attrs ) {
            return baseCyPhyService.setNodeAttributes( context, testBenchId, attrs );
        };

        this.runTestBench = function ( context, testBenchId, configurationId ) {
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
            pluginService.runPlugin( context, 'TestBenchRunner', config )
                .then( function ( result ) {
                    var resultLight = {
                        success: result.success,
                        artifactsHtml: '',
                        messages: result.messages
                    };
                    console.log( 'Result', result );
                    pluginService.getPluginArtifactsHtml( result.artifacts )
                        .then( function ( artifactsHtml ) {
                            resultLight.artifactsHtml = artifactsHtml;
                            deferred.resolve( resultLight );
                        } );
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong, ' + reason );
            } );

            return deferred.promise;
        };

        this.watchTestBenchNode = function ( parentContext, testBenchId, updateListener ) {
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
                onUpdate = function ( id ) {
                    var newName = this.getAttribute( 'name' ),
                        newDesc = this.getAttribute( 'INFO' ),
                        newPath = this.getAttribute( 'ID' ),
                        newResults = this.getAttribute( 'Results' ),
                        newFiles = this.getAttribute( 'TestBenchFiles' ),
                        newTlsut = this.getPointer( 'TopLevelSystemUnderTest' )
                            .to,
                        hadChanges = false,
                        tlsutChanged = false;
                    if ( newName !== data.testBench.name ) {
                        data.testBench.name = newName;
                        hadChanges = true;
                    }
                    if ( newDesc !== data.testBench.description ) {
                        data.testBench.description = newDesc;
                        hadChanges = true;
                    }
                    if ( newPath !== data.testBench.path ) {
                        data.testBench.path = newPath;
                        hadChanges = true;
                    }
                    if ( newResults !== data.testBench.results ) {
                        data.testBench.results = newResults;
                        hadChanges = true;
                    }
                    if ( newFiles !== data.testBench.files ) {
                        data.testBench.files = newFiles;
                        hadChanges = true;
                    }
                    if ( newTlsut !== data.testBench.tlsutId ) {
                        data.testBench.tlsutId = newTlsut;
                        hadChanges = true;
                        tlsutChanged = true;
                    }
                    if ( hadChanges ) {
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'update',
                                data: data.testBench,
                                tlsutChanged: tlsutChanged
                            } );
                        } );
                    }
                },
                onUnload = function ( id ) {
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            type: 'unload',
                            data: null
                        } );
                    } );
                };
            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, testBenchId )
                        .then( function ( testBenchNode ) {
                            data.meta = meta;
                            data.testBench = {
                                id: testBenchId,
                                name: testBenchNode.getAttribute( 'name' ),
                                description: testBenchNode.getAttribute( 'INFO' ),
                                path: testBenchNode.getAttribute( 'ID' ),
                                results: testBenchNode.getAttribute( 'Results' ),
                                files: testBenchNode.getAttribute( 'TestBenchFiles' ),
                                tlsutId: testBenchNode.getPointer( 'TopLevelSystemUnderTest' )
                                    .to,
                                node: testBenchNode
                            };
                            testBenchNode.onUpdate( onUpdate );
                            testBenchNode.onUnload( onUnload );
                            deferred.resolve( data );
                        } );
                } );

            return deferred.promise;
        };

        /**
         *  Watches all test-benches (existence and their attributes) of a workspace.
         * @param {object} parentContext - context of controller.
         * @param {string} workspaceId - Path to workspace that should be watched.
         * @param {function} updateListener - invoked when there are (filtered) changes in data. Data is an object in data.testBenches.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchTestBenches = function ( parentContext, workspaceId, updateListener ) {
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
                onUpdate = function ( id ) {
                    var newName = this.getAttribute( 'name' ),
                        newDesc = this.getAttribute( 'INFO' ),
                        newPath = this.getAttribute( 'ID' ),
                        newResults = this.getAttribute( 'Results' ),
                        newFiles = this.getAttribute( 'TestBenchFiles' ),
                        hadChanges = false;
                    if ( newName !== data.testBenches[ id ].name ) {
                        data.testBenches[ id ].name = newName;
                        hadChanges = true;
                    }
                    if ( newDesc !== data.testBenches[ id ].description ) {
                        data.testBenches[ id ].description = newDesc;
                        hadChanges = true;
                    }
                    if ( newPath !== data.testBenches[ id ].path ) {
                        data.testBenches[ id ].path = newPath;
                        hadChanges = true;
                    }
                    if ( newResults !== data.testBenches[ id ].results ) {
                        data.testBenches[ id ].results = newResults;
                        hadChanges = true;
                    }
                    if ( newFiles !== data.testBenches[ id ].files ) {
                        data.testBenches[ id ].files = newFiles;
                        hadChanges = true;
                    }
                    if ( hadChanges ) {
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'update',
                                data: data.testBenches[ id ]
                            } );
                        } );
                    }
                },
                onUnload = function ( id ) {
                    delete data.testBenches[ id ];
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            type: 'unload',
                            data: null
                        } );
                    } );
                },
                watchFromFolderRec = function ( folderNode, meta ) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                testBenchId,
                                queueList = [],
                                childNode;
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.ATMFolder ) ) {
                                    queueList.push( watchFromFolderRec( childNode, meta ) );
                                } else if ( childNode.isMetaTypeOf( meta.AVMTestBenchModel ) ) {
                                    testBenchId = childNode.getId();
                                    data.testBenches[ testBenchId ] = {
                                        id: testBenchId,
                                        name: childNode.getAttribute( 'name' ),
                                        description: childNode.getAttribute( 'INFO' ),
                                        path: childNode.getAttribute( 'ID' ),
                                        results: childNode.getAttribute( 'Results' ),
                                        files: childNode.getAttribute( 'TestBenchFiles' )
                                    };
                                    childNode.onUnload( onUnload );
                                    childNode.onUpdate( onUpdate );
                                }
                            }

                            folderNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.ATMFolder ) ) {
                                    watchFromFolderRec( newChild, meta );
                                } else if ( newChild.isMetaTypeOf( meta.AVMTestBenchModel ) ) {
                                    testBenchId = newChild.getId();
                                    data.testBenches[ testBenchId ] = {
                                        id: testBenchId,
                                        name: newChild.getAttribute( 'name' ),
                                        description: newChild.getAttribute( 'INFO' ),
                                        path: newChild.getAttribute( 'ID' ),
                                        results: newChild.getAttribute( 'Results' ),
                                        files: newChild.getAttribute( 'TestBenchFiles' )
                                    };
                                    newChild.onUnload( onUnload );
                                    newChild.onUpdate( onUpdate );
                                    $timeout( function () {
                                        updateListener( {
                                            id: testBenchId,
                                            type: 'load',
                                            data: data.testBenches[ testBenchId ]
                                        } );
                                    } );
                                }
                            } );
                            if ( queueList.length === 0 ) {
                                recDeferred.resolve();
                            } else {
                                $q.all( queueList )
                                    .then( function () {
                                        recDeferred.resolve();
                                    } );
                            }
                        } );

                    return recDeferred.promise;
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, workspaceId )
                        .then( function ( workspaceNode ) {
                            workspaceNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        queueList = [],
                                        childNode;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        if ( childNode.isMetaTypeOf( meta.ATMFolder ) ) {
                                            queueList.push( watchFromFolderRec( childNode, meta ) );
                                        }
                                    }
                                    workspaceNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.ATMFolder ) ) {
                                            watchFromFolderRec( newChild, meta );
                                        }
                                    } );
                                    if ( queueList.length === 0 ) {
                                        deferred.resolve( data );
                                    } else {
                                        $q.all( queueList )
                                            .then( function () {
                                                deferred.resolve( data );
                                            } );
                                    }
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         *  Watches a test-bench w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param testBenchId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchTestBenchDetails = function ( parentContext, testBenchId, updateListener ) {
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
                onUnload = function ( id ) {
                    var index = data.containerIds.indexOf( id );
                    if ( index > -1 ) {
                        data.containerIds.splice( index, 1 );
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'unload',
                                data: data
                            } );
                        } );
                    }
                };
            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, testBenchId )
                        .then( function ( testBenchNode ) {
                            testBenchNode.loadChildren()
                                .then( function ( children ) {
                                    var i;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        if ( children[ i ].isMetaTypeOf( meta.Container ) ) {
                                            data.containerIds.push( children[ i ].getId() );
                                            children[ i ].onUnload( onUnload );
                                        }
                                    }
                                    testBenchNode.onNewChildLoaded( function ( newChild ) {
                                        data.containerIds.push( newChild.getId() );
                                        newChild.onUnload( onUnload );
                                        $timeout( function () {
                                            updateListener( {
                                                id: newChild.getId(),
                                                type: 'load',
                                                data: data
                                            } );
                                        } );
                                    } );
                                    deferred.resolve( data );
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         *  Watches a test-bench w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param containerId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchInterfaces = function ( parentContext, containerId, updateListener ) {
            return baseCyPhyService.watchInterfaces( watchers, parentContext, containerId, updateListener );
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function ( parentContext ) {
            baseCyPhyService.cleanUpAllRegions( watchers, parentContext );
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function ( parentContext, regionId ) {
            baseCyPhyService.cleanUpRegion( watchers, parentContext, regionId );
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function ( parentContext, fn ) {
            baseCyPhyService.registerWatcher( watchers, parentContext, fn );
        };
    } );
},{}],29:[function(require,module,exports){
/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module( 'cyphy.services' )
    .service( 'workspaceService', function ( $q, $timeout, nodeService, baseCyPhyService, pluginService, fileService ) {
        'use strict';
        var self = this,
            watchers = {};

        this.callCreateWorkspace = function ( /*context, name, desc*/) {

        };

        this.createWorkspace = function ( context, name, desc ) {
            var deferred = $q.defer(),
                meta;
            nodeService.getMetaNodes( context )
                .then( function ( metaNodes ) {
                    meta = metaNodes;
                    return nodeService.createNode( context, '', meta.WorkSpace,
                        '[WebCyPhy] - WorkspaceService.createWorkspace' );
                } )
                .then( function ( wsNode ) {
                    var acmFolderId,
                        admFolderId,
                        atmFolderId,
                        createFolderNodes = function () {
                            var parentId = wsNode.getId(),
                                baseId = meta.ACMFolder.getId();
                            nodeService.createNode( context, parentId, baseId, '[WebCyPhy] - create ACMFolder' )
                                .then( function ( acmNode ) {
                                    acmFolderId = acmNode.getId();
                                    baseId = meta.ADMFolder.getId();
                                    return nodeService.createNode( context, parentId, baseId,
                                        '[WebCyPhy] - create ADMFolder' );
                                } )
                                .then( function ( admNode ) {
                                    admFolderId = admNode.getId();
                                    baseId = meta.ATMFolder.getId();
                                    return nodeService.createNode( context, parentId, baseId,
                                        '[WebCyPhy] - create ATMFolder' );
                                } )
                                .then( function ( atmNode ) {
                                    atmFolderId = atmNode.getId();
                                    deferred.resolve( {
                                        acm: acmFolderId,
                                        adm: admFolderId,
                                        atm: atmFolderId
                                    } );
                                } )
                                .
                            catch ( function ( reason ) {
                                deferred.reject( reason );
                            } );
                        };

                    wsNode.setAttribute( 'name', name, '[WebCyPhy] - set name to ' + name )
                        .then( function () {
                            if ( desc ) {
                                wsNode.setAttribute( 'INFO', desc, '[WebCyPhy] - set INFO to ' + desc )
                                    .then( function () {
                                        createFolderNodes();
                                    } );
                            } else {
                                createFolderNodes();
                            }
                        } );
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( reason );
            } );

            return deferred.promise;
        };

        this.importFiles = function ( context, folderIds, files ) {
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
                if ( counter >= 0 ) {
                    self.callAcmImporter( context, folderIds.acm, fs.acms[ counter ] )
                        .then( getNotify( fs.acms[ counter ], 'acm' ), getNotify( fs.acms[ counter ] ), 'acm' );
                } else {
                    total = fs.adms.length;
                    counter = total;
                    importAdmRec();
                }
            };
            importAdmRec = function () {
                counter -= 1;
                if ( counter >= 0 ) {
                    self.callAdmImporter( context, folderIds.adm, fs.adms[ counter ] )
                        .then( getNotify( fs.adms[ counter ], 'adm' ), getNotify( fs.adms[ counter ] ), 'adm' );
                } else {
                    total = fs.atms.length;
                    counter = total;
                    importAtmRec();
                }
            };
            importAtmRec = function () {
                counter -= 1;
                if ( counter >= 0 ) {
                    self.callAtmImporter( context, folderIds.atm, fs.atms[ counter ] )
                        .then( getNotify( fs.atms[ counter ], 'atm' ), getNotify( fs.atms[ counter ], 'atm' ) );
                } else {
                    deferred.resolve();
                }
            };
            getNotify = function ( fInfo, type ) {
                return function ( result ) {
                    if ( angular.isString( result ) === false && result.success === true ) {
                        deferred.notify( {
                            type: 'success',
                            message: '<a href="' + fInfo.url + '">' + fInfo.name +
                                '</a>' + ' imported. ' + '[' + ( total - counter ) + '/' + total + ']'
                        } );
                    } else {
                        deferred.notify( {
                            type: 'error',
                            message: '<a href="' + fInfo.url + '">' + fInfo.name +
                                '</a>' + ' failed to be imported, see console details.' +
                                '[' + ( total - counter ) + '/' + total + ']'
                        } );
                        if ( angular.isString( result ) ) {
                            console.error( result );
                        } else {
                            console.error( angular.toJson( result.messages, true ) );
                        }
                    }
                    if ( type === 'acm' ) {
                        importAcmRec();
                    } else if ( type === 'adm' ) {
                        importAdmRec();
                    } else if ( type === 'atm' ) {
                        importAtmRec();
                    } else {
                        deferred.reject( 'Unexpected import type ' + type );
                    }
                };
            };
            // hash: "3636ead0785ca166f3b11193c4b2e5a670801eb1" name: "Damper.zip" size: "1.4 kB" type: "zip"
            // url: "/rest/blob/download/3636ead0785ca166f3b11193c4b2e5a670801eb1"
            for ( i = 0; i < files.length; i += 1 ) {
                if ( files[ i ].type === 'zip' ) {
                    fs.acms.push( files[ i ] );
                } else if ( files[ i ].type === 'adm' ) {
                    fs.adms.push( files[ i ] );
                } else if ( files[ i ].type === 'atm' ) {
                    fs.atms.push( files[ i ] );
                }
            }

            total = fs.acms.length;
            counter = total;
            importAcmRec();

            return deferred.promise;
        };

        this.callAcmImporter = function ( context, folderId, fileInfo ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: folderId,
                    runOnServer: false,
                    pluginConfig: {
                        UploadedFile: fileInfo.hash,
                        DeleteExisting: true
                    }
                };

            pluginService.runPlugin( context, 'AcmImporter', config )
                .then( function ( result ) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ACM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    deferred.resolve( result );
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong, ' + reason );
            } );

            return deferred.promise;
        };

        this.callAdmImporter = function ( context, folderId, fileInfo ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: folderId,
                    runOnServer: false,
                    pluginConfig: {
                        admFile: fileInfo.hash
                    }
                };

            pluginService.runPlugin( context, 'AdmImporter', config )
                .then( function ( result ) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ADM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    deferred.resolve( result );
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong, ' + reason );
            } );

            return deferred.promise;
        };

        this.callAtmImporter = function ( context, folderId, fileInfo ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: folderId,
                    runOnServer: false,
                    pluginConfig: {
                        atmFile: fileInfo.hash
                    }
                };

            pluginService.runPlugin( context, 'AtmImporter', config )
                .then( function ( result ) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ATM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    deferred.resolve( result );
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong, ' + reason );
            } );

            return deferred.promise;
        };

        /**
         * Calls ExportWorkspace.
         * @param {object} context - Context for plugin.
         * @param {string} context.db - Database connection to pull model from.
         * @param {string} workspaceId
         * @returns {Promise} - resolves to download url if successful.
         */
        this.exportWorkspace = function ( context, workspaceId ) {
            var deferred = $q.defer(),
                config = {
                    activeNode: workspaceId,
                    runOnServer: false,
                    pluginConfig: {}
                };

            pluginService.runPlugin( context, 'ExportWorkspace', config )
                .then( function ( result ) {
                    //"{"success":true,"messages":[],"artifacts":[],"pluginName":"ADM Importer",
                    // "startTime":"2014-11-08T02:51:21.383Z","finishTime":"2014-11-08T02:51:21.939Z","error":null}"
                    if ( result.success ) {
                        console.log( result );
                        deferred.resolve( fileService.getDownloadUrl( result.artifacts[ 0 ] ) );
                    } else {
                        if ( result.error ) {
                            deferred.reject( result.error + ' messages: ' + angular.toJson( result.messages ) );
                        } else {
                            deferred.reject( angular.toJson( result.messages ) );
                        }
                    }
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Something went terribly wrong ' + reason );
            } );

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
        this.setWorkspaceAttributes = function ( context, workspaceId, attrs ) {
            return baseCyPhyService.setNodeAttributes( context, workspaceId, attrs );
        };

        /**
         * Removes the workspace from the context.
         * @param {object} context - context of controller.
         * @param {string} context.db - data-base connection.
         * @param {string} workspaceId - Path to workspace.
         * @param [msg] - Commit message.
         */
        this.deleteWorkspace = function ( context, workspaceId, msg ) {
            var message = msg || 'WorkspaceService.deleteWorkspace ' + workspaceId;
            nodeService.destroyNode( context, workspaceId, message );
        };

        // TODO: make sure the methods below gets resolved at error too.
        /**
         * Keeps track of the work-spaces defined in the root-node w.r.t. existence and attributes.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is an object in data.workspaces.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchWorkspaces = function ( parentContext, updateListener ) {
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
                onUpdate = function ( id ) {
                    var newName = this.getAttribute( 'name' ),
                        newDesc = this.getAttribute( 'INFO' ),
                        hadChanges = false;
                    if ( newName !== data.workspaces[ id ].name ) {
                        data.workspaces[ id ].name = newName;
                        hadChanges = true;
                    }
                    if ( newDesc !== data.workspaces[ id ].description ) {
                        data.workspaces[ id ].description = newDesc;
                        hadChanges = true;
                    }
                    if ( hadChanges ) {
                        $timeout( function () {
                            updateListener( {
                                id: id,
                                type: 'update',
                                data: data.workspaces[ id ]
                            } );
                        } );
                    }
                },
                onUnload = function ( id ) {
                    delete data.workspaces[ id ];
                    $timeout( function () {
                        updateListener( {
                            id: id,
                            type: 'unload',
                            data: null
                        } );
                    } );
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, '' )
                        .then( function ( rootNode ) {
                            rootNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        childNode,
                                        wsId;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        if ( childNode.isMetaTypeOf( meta.WorkSpace ) ) {
                                            wsId = childNode.getId();
                                            data.workspaces[ wsId ] = {
                                                id: wsId,
                                                name: childNode.getAttribute( 'name' ),
                                                description: childNode.getAttribute( 'INFO' )
                                            };
                                            childNode.onUpdate( onUpdate );
                                            childNode.onUnload( onUnload );
                                        }
                                    }
                                    rootNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.WorkSpace ) ) {
                                            wsId = newChild.getId();
                                            data.workspaces[ wsId ] = {
                                                id: wsId,
                                                name: newChild.getAttribute( 'name' ),
                                                description: newChild.getAttribute( 'INFO' )
                                            };
                                            newChild.onUpdate( onUpdate );
                                            newChild.onUnload( onUnload );
                                            $timeout( function () {
                                                updateListener( {
                                                    id: wsId,
                                                    type: 'load',
                                                    data: data.workspaces[ wsId ]
                                                } );
                                            } );
                                        }
                                    } );
                                    deferred.resolve( data );
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         * Keeps track of the number of components (defined in ACMFolders) in the workspace.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {string} workspaceId
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is the updated data.count.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNumberOfComponents = function ( parentContext, workspaceId, updateListener ) {
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
                watchFromFolderRec = function ( folderNode, meta ) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                queueList = [],
                                childNode,
                                onUnload = function ( id ) {
                                    data.count -= 1;
                                    $timeout( function () {
                                        updateListener( {
                                            id: id,
                                            type: 'unload',
                                            data: data.count
                                        } );
                                    } );
                                };
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.ACMFolder ) ) {
                                    queueList.push( watchFromFolderRec( childNode, meta ) );
                                } else if ( childNode.isMetaTypeOf( meta.AVMComponentModel ) ) {
                                    data.count += 1;
                                    childNode.onUnload( onUnload );
                                }
                            }

                            folderNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.ACMFolder ) ) {
                                    watchFromFolderRec( newChild, meta )
                                        .then( function () {
                                            $timeout( function () {
                                                updateListener( {
                                                    id: newChild.getId(),
                                                    type: 'load',
                                                    data: data.count
                                                } );
                                            } );
                                        } );
                                } else if ( newChild.isMetaTypeOf( meta.AVMComponentModel ) ) {
                                    data.count += 1;
                                    newChild.onUnload( onUnload );
                                    $timeout( function () {
                                        updateListener( {
                                            id: newChild.getId(),
                                            type: 'load',
                                            data: data.count
                                        } );
                                    } );
                                }
                            } );
                            if ( queueList.length === 0 ) {
                                recDeferred.resolve();
                            } else {
                                $q.all( queueList )
                                    .then( function () {
                                        recDeferred.resolve();
                                    } );
                            }
                        } );

                    return recDeferred.promise;
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, workspaceId )
                        .then( function ( workspaceNode ) {
                            workspaceNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        queueList = [],
                                        childNode;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        if ( childNode.isMetaTypeOf( meta.ACMFolder ) ) {
                                            queueList.push( watchFromFolderRec( childNode, meta ) );
                                        }
                                    }
                                    workspaceNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.ACMFolder ) ) {
                                            watchFromFolderRec( newChild, meta )
                                                .then( function () {
                                                    $timeout( function () {
                                                        updateListener( {
                                                            id: newChild.getId(),
                                                            type: 'load',
                                                            data: data.count
                                                        } );
                                                    } );
                                                } );
                                        }
                                    } );
                                    if ( queueList.length === 0 ) {
                                        deferred.resolve( data );
                                    } else {
                                        $q.all( queueList )
                                            .then( function () {
                                                deferred.resolve( data );
                                            } );
                                    }
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         * Keeps track of the number of containers (defined in ADMFolders) in the workspace.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {string} workspaceId
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is the updated data.count.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNumberOfDesigns = function ( parentContext, workspaceId, updateListener ) {
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
                watchFromFolderRec = function ( folderNode, meta ) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                queueList = [],
                                childNode,
                                onUnload = function ( id ) {
                                    data.count -= 1;
                                    $timeout( function () {
                                        updateListener( {
                                            id: id,
                                            type: 'unload',
                                            data: data.count
                                        } );
                                    } );
                                };
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.ADMFolder ) ) {
                                    queueList.push( watchFromFolderRec( childNode, meta ) );
                                } else if ( childNode.isMetaTypeOf( meta.Container ) ) {
                                    data.count += 1;
                                    childNode.onUnload( onUnload );
                                }
                            }

                            folderNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.ADMFolder ) ) {
                                    watchFromFolderRec( newChild, meta )
                                        .then( function () {
                                            $timeout( function () {
                                                updateListener( {
                                                    id: newChild.getId(),
                                                    type: 'load',
                                                    data: data.count
                                                } );
                                            } );
                                        } );
                                } else if ( newChild.isMetaTypeOf( meta.Container ) ) {
                                    data.count += 1;
                                    newChild.onUnload( onUnload );
                                    $timeout( function () {
                                        updateListener( {
                                            id: newChild.getId(),
                                            type: 'load',
                                            data: data.count
                                        } );
                                    } );
                                }
                            } );
                            if ( queueList.length === 0 ) {
                                recDeferred.resolve();
                            } else {
                                $q.all( queueList )
                                    .then( function () {
                                        recDeferred.resolve();
                                    } );
                            }
                        } );

                    return recDeferred.promise;
                };

            if ( watchers.hasOwnProperty( parentContext.regionId ) === false ) {
                console.error( parentContext.regionId + ' is not a registered watcher! ' +
                    'Use "this.registerWatcher" before trying to access Node Objects.' );
            }
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, workspaceId )
                        .then( function ( workspaceNode ) {
                            workspaceNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        queueList = [],
                                        childNode;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        if ( childNode.isMetaTypeOf( meta.ADMFolder ) ) {
                                            queueList.push( watchFromFolderRec( childNode, meta ) );
                                        }
                                    }
                                    workspaceNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.ADMFolder ) ) {
                                            watchFromFolderRec( newChild, meta )
                                                .then( function () {
                                                    $timeout( function () {
                                                        updateListener( {
                                                            id: newChild.getId(),
                                                            type: 'load',
                                                            data: data.count
                                                        } );
                                                    } );
                                                } );
                                        }
                                    } );
                                    if ( queueList.length === 0 ) {
                                        deferred.resolve( data );
                                    } else {
                                        $q.all( queueList )
                                            .then( function () {
                                                deferred.resolve( data );
                                            } );
                                    }
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         * Keeps track of the number of test-benches (defined in ATMFolders) in the workspace.
         * @param {object} parentContext - context of controller (must have a regionId defined).
         * @param {string} workspaceId
         * @param {function} updateListener - called on (filtered) changes in data-base. Data is the updated data.count.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNumberOfTestBenches = function ( parentContext, workspaceId, updateListener ) {
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
                watchFromFolderRec = function ( folderNode, meta ) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren()
                        .then( function ( children ) {
                            var i,
                                queueList = [],
                                childNode,
                                onUnload = function ( id ) {
                                    data.count -= 1;
                                    $timeout( function () {
                                        updateListener( {
                                            id: id,
                                            type: 'unload',
                                            data: data.count
                                        } );
                                    } );
                                };
                            for ( i = 0; i < children.length; i += 1 ) {
                                childNode = children[ i ];
                                if ( childNode.isMetaTypeOf( meta.ATMFolder ) ) {
                                    queueList.push( watchFromFolderRec( childNode, meta ) );
                                } else if ( childNode.isMetaTypeOf( meta.AVMTestBenchModel ) ) {
                                    data.count += 1;
                                    childNode.onUnload( onUnload );
                                }
                            }

                            folderNode.onNewChildLoaded( function ( newChild ) {
                                if ( newChild.isMetaTypeOf( meta.ATMFolder ) ) {
                                    watchFromFolderRec( newChild, meta )
                                        .then( function () {
                                            $timeout( function () {
                                                updateListener( {
                                                    id: newChild.getId(),
                                                    type: 'load',
                                                    data: data.count
                                                } );
                                            } );
                                        } );
                                } else if ( newChild.isMetaTypeOf( meta.AVMTestBenchModel ) ) {
                                    data.count += 1;
                                    newChild.onUnload( onUnload );
                                    $timeout( function () {
                                        updateListener( {
                                            id: newChild.getId(),
                                            type: 'load',
                                            data: data.count
                                        } );
                                    } );
                                }
                            } );
                            if ( queueList.length === 0 ) {
                                recDeferred.resolve();
                            } else {
                                $q.all( queueList )
                                    .then( function () {
                                        recDeferred.resolve();
                                    } );
                            }
                        } );

                    return recDeferred.promise;
                };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ context.regionId ] = context;
            nodeService.getMetaNodes( context )
                .then( function ( meta ) {
                    nodeService.loadNode( context, workspaceId )
                        .then( function ( workspaceNode ) {
                            workspaceNode.loadChildren()
                                .then( function ( children ) {
                                    var i,
                                        queueList = [],
                                        childNode;
                                    for ( i = 0; i < children.length; i += 1 ) {
                                        childNode = children[ i ];
                                        if ( childNode.isMetaTypeOf( meta.ATMFolder ) ) {
                                            queueList.push( watchFromFolderRec( childNode, meta ) );
                                        }
                                    }
                                    workspaceNode.onNewChildLoaded( function ( newChild ) {
                                        if ( newChild.isMetaTypeOf( meta.ATMFolder ) ) {
                                            watchFromFolderRec( newChild, meta )
                                                .then( function () {
                                                    $timeout( function () {
                                                        updateListener( {
                                                            id: newChild.getId(),
                                                            type: 'load',
                                                            data: data.count
                                                        } );
                                                    } );
                                                } );
                                        }
                                    } );
                                    if ( queueList.length === 0 ) {
                                        deferred.resolve( data );
                                    } else {
                                        $q.all( queueList )
                                            .then( function () {
                                                deferred.resolve( data );
                                            } );
                                    }
                                } );
                        } );
                } );

            return deferred.promise;
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function ( parentContext ) {
            baseCyPhyService.cleanUpAllRegions( watchers, parentContext );
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function ( parentContext, regionId ) {
            baseCyPhyService.cleanUpRegion( watchers, parentContext, regionId );
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function ( parentContext, fn ) {
            baseCyPhyService.registerWatcher( watchers, parentContext, fn );
        };

        this.logContext = function ( context ) {
            nodeService.logContext( context );
        };
    } );
},{}],30:[function(require,module,exports){
/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.services', [ 'gme.services' ] );
require( './BaseCyPhyService' );
require( './PluginService' );
require( './FileService' );
require( './ExecutorService' );
require( './WorkspaceService' );
require( './ComponentService' );
require( './DesignService' );
require( './TestBenchService' );
require( './DesertService' );
},{"./BaseCyPhyService":21,"./ComponentService":22,"./DesertService":23,"./DesignService":24,"./ExecutorService":25,"./FileService":26,"./PluginService":27,"./TestBenchService":28,"./WorkspaceService":29}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvbGlicmFyeS9jeXBoeS1jb21wb25lbnRzLmpzIiwiQzovVXNlcnMva2V2aW4vRG9jdW1lbnRzL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL2FkYXB0LXN0cmFwL2Rpc3QvYWRhcHQtc3RyYXAuanMiLCJDOi9Vc2Vycy9rZXZpbi9Eb2N1bWVudHMvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvYWRhcHQtc3RyYXAvZGlzdC9hZGFwdC1zdHJhcC50cGwuanMiLCJDOi9Vc2Vycy9rZXZpbi9Eb2N1bWVudHMvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvYW5ndWxhci1ncm93bC9idWlsZC9hbmd1bGFyLWdyb3dsLm1pbi5qcyIsIkM6L1VzZXJzL2tldmluL0RvY3VtZW50cy93ZWJnbWUtY3lwaHkvYm93ZXJfY29tcG9uZW50cy9hbmd1bGFyLXNhbml0aXplL2FuZ3VsYXItc2FuaXRpemUuanMiLCJDOi9Vc2Vycy9rZXZpbi9Eb2N1bWVudHMvd2ViZ21lLWN5cGh5L2Jvd2VyX2NvbXBvbmVudHMvbmctZmlsZS11cGxvYWQvYW5ndWxhci1maWxlLXVwbG9hZC1zaGltLmpzIiwiQzovVXNlcnMva2V2aW4vRG9jdW1lbnRzL3dlYmdtZS1jeXBoeS9ib3dlcl9jb21wb25lbnRzL25nLWZpbGUtdXBsb2FkL2FuZ3VsYXItZmlsZS11cGxvYWQuanMiLCJDOi9Vc2Vycy9rZXZpbi9Eb2N1bWVudHMvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0NvbXBvbmVudExpc3QvQ29tcG9uZW50RGV0YWlscy5qcyIsIkM6L1VzZXJzL2tldmluL0RvY3VtZW50cy93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvQ29tcG9uZW50TGlzdC9Db21wb25lbnRMaXN0LmpzIiwiQzovVXNlcnMva2V2aW4vRG9jdW1lbnRzL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Db25maWd1cmF0aW9uU2V0U2VsZWN0b3IvQ29uZmlndXJhdGlvblNldFNlbGVjdG9yLmpzIiwiQzovVXNlcnMva2V2aW4vRG9jdW1lbnRzL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Db25maWd1cmF0aW9uVGFibGUvQ29uZmlndXJhdGlvblRhYmxlLmpzIiwiQzovVXNlcnMva2V2aW4vRG9jdW1lbnRzL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9EZXNpZ25MaXN0L0Rlc2lnbkRldGFpbHMuanMiLCJDOi9Vc2Vycy9rZXZpbi9Eb2N1bWVudHMvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L0Rlc2lnbkxpc3QvRGVzaWduTGlzdC5qcyIsIkM6L1VzZXJzL2tldmluL0RvY3VtZW50cy93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvRGVzaWduVHJlZS9EZXNpZ25UcmVlLmpzIiwiQzovVXNlcnMva2V2aW4vRG9jdW1lbnRzL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9TaW1wbGVNb2RhbC9TaW1wbGVNb2RhbC5qcyIsIkM6L1VzZXJzL2tldmluL0RvY3VtZW50cy93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvVGVzdEJlbmNoTGlzdC9UZXN0QmVuY2hEZXRhaWxzLmpzIiwiQzovVXNlcnMva2V2aW4vRG9jdW1lbnRzL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9UZXN0QmVuY2hMaXN0L1Rlc3RCZW5jaExpc3QuanMiLCJDOi9Vc2Vycy9rZXZpbi9Eb2N1bWVudHMvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L1dvcmtlcnNMaXN0L1dvcmtlcnNMaXN0LmpzIiwiQzovVXNlcnMva2V2aW4vRG9jdW1lbnRzL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9Xb3Jrc3BhY2VMaXN0L1dvcmtzcGFjZUxpc3QuanMiLCJDOi9Vc2Vycy9rZXZpbi9Eb2N1bWVudHMvd2ViZ21lLWN5cGh5L3NyYy9saWJyYXJ5L2NvbXBvbmVudEJyb3dzZXIvY29tcG9uZW50QnJvd3Nlci5qcyIsIkM6L1VzZXJzL2tldmluL0RvY3VtZW50cy93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvQmFzZUN5UGh5U2VydmljZS5qcyIsIkM6L1VzZXJzL2tldmluL0RvY3VtZW50cy93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvQ29tcG9uZW50U2VydmljZS5qcyIsIkM6L1VzZXJzL2tldmluL0RvY3VtZW50cy93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvRGVzZXJ0U2VydmljZS5qcyIsIkM6L1VzZXJzL2tldmluL0RvY3VtZW50cy93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvRGVzaWduU2VydmljZS5qcyIsIkM6L1VzZXJzL2tldmluL0RvY3VtZW50cy93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvRXhlY3V0b3JTZXJ2aWNlLmpzIiwiQzovVXNlcnMva2V2aW4vRG9jdW1lbnRzL3dlYmdtZS1jeXBoeS9zcmMvbGlicmFyeS9zZXJ2aWNlcy9GaWxlU2VydmljZS5qcyIsIkM6L1VzZXJzL2tldmluL0RvY3VtZW50cy93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvUGx1Z2luU2VydmljZS5qcyIsIkM6L1VzZXJzL2tldmluL0RvY3VtZW50cy93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvVGVzdEJlbmNoU2VydmljZS5qcyIsIkM6L1VzZXJzL2tldmluL0RvY3VtZW50cy93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvV29ya3NwYWNlU2VydmljZS5qcyIsIkM6L1VzZXJzL2tldmluL0RvY3VtZW50cy93ZWJnbWUtY3lwaHkvc3JjL2xpYnJhcnkvc2VydmljZXMvY3lwaHktc2VydmljZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNodkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0cUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNua0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIHJlcXVpcmUsIGFuZ3VsYXIgKi9cbi8qKlxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqL1xuLy8gRXh0ZXJuYWwgZGVwZW5kZW5jaWVzXG5yZXF1aXJlKCAnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9uZy1maWxlLXVwbG9hZC9hbmd1bGFyLWZpbGUtdXBsb2FkLXNoaW0nICk7XG5yZXF1aXJlKCAnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9uZy1maWxlLXVwbG9hZC9hbmd1bGFyLWZpbGUtdXBsb2FkJyApO1xucmVxdWlyZSggJy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvYW5ndWxhci1ncm93bC9idWlsZC9hbmd1bGFyLWdyb3dsLm1pbicgKTtcbnJlcXVpcmUoICcuLi8uLi9ib3dlcl9jb21wb25lbnRzL2FuZ3VsYXItc2FuaXRpemUvYW5ndWxhci1zYW5pdGl6ZScgKTtcbnJlcXVpcmUoICcuLi8uLi9ib3dlcl9jb21wb25lbnRzL2FkYXB0LXN0cmFwL2Rpc3QvYWRhcHQtc3RyYXAnICk7XG5yZXF1aXJlKCAnLi4vLi4vYm93ZXJfY29tcG9uZW50cy9hZGFwdC1zdHJhcC9kaXN0L2FkYXB0LXN0cmFwLnRwbCcgKTtcblxuLy8gSW50ZXJuYWwgZGVwZW5kZW5jaWVzXG5yZXF1aXJlKCAnLi9zZXJ2aWNlcy9jeXBoeS1zZXJ2aWNlcycgKTtcblxuYW5ndWxhci5tb2R1bGUoICdjeXBoeS5jb21wb25lbnRzJywgW1xuICAgICdjeXBoeS5zZXJ2aWNlcycsXG4gICAgJ2N5cGh5LmNvbXBvbmVudHMudGVtcGxhdGVzJyxcbiAgICAnYW5ndWxhckZpbGVVcGxvYWQnLFxuICAgICdhbmd1bGFyLWdyb3dsJyxcbiAgICAnbmdTYW5pdGl6ZScsXG4gICAgJ2FkYXB0di5hZGFwdFN0cmFwJ1xuXSApXG4gICAgLmNvbmZpZyggWyAnZ3Jvd2xQcm92aWRlcicsXG4gICAgICAgIGZ1bmN0aW9uICggZ3Jvd2xQcm92aWRlciApIHtcbiAgICAgICAgICAgIGdyb3dsUHJvdmlkZXIuZ2xvYmFsVGltZVRvTGl2ZSgge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IDUwMDAsXG4gICAgICAgICAgICAgICAgZXJyb3I6IC0xLFxuICAgICAgICAgICAgICAgIHdhcm5pbmc6IDIwMDAwLFxuICAgICAgICAgICAgICAgIGluZm86IDUwMDBcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgIF0gKTtcblxucmVxdWlyZSggJy4vU2ltcGxlTW9kYWwvU2ltcGxlTW9kYWwnICk7XG5cbnJlcXVpcmUoICcuL1dvcmtzcGFjZUxpc3QvV29ya3NwYWNlTGlzdCcgKTtcblxucmVxdWlyZSggJy4vQ29tcG9uZW50TGlzdC9Db21wb25lbnREZXRhaWxzJyApO1xucmVxdWlyZSggJy4vQ29tcG9uZW50TGlzdC9Db21wb25lbnRMaXN0JyApO1xuXG5yZXF1aXJlKCAnLi9EZXNpZ25MaXN0L0Rlc2lnbkRldGFpbHMnICk7XG5yZXF1aXJlKCAnLi9EZXNpZ25MaXN0L0Rlc2lnbkxpc3QnICk7XG5yZXF1aXJlKCAnLi9EZXNpZ25UcmVlL0Rlc2lnblRyZWUnICk7XG5cbnJlcXVpcmUoICcuL1Rlc3RCZW5jaExpc3QvVGVzdEJlbmNoRGV0YWlscycgKTtcbnJlcXVpcmUoICcuL1Rlc3RCZW5jaExpc3QvVGVzdEJlbmNoTGlzdCcgKTtcblxucmVxdWlyZSggJy4vQ29uZmlndXJhdGlvblRhYmxlL0NvbmZpZ3VyYXRpb25UYWJsZScgKTtcbnJlcXVpcmUoICcuL0NvbmZpZ3VyYXRpb25TZXRTZWxlY3Rvci9Db25maWd1cmF0aW9uU2V0U2VsZWN0b3InICk7XG5cbnJlcXVpcmUoICcuL1dvcmtlcnNMaXN0L1dvcmtlcnNMaXN0JyApO1xuXG5yZXF1aXJlKCAnLi9jb21wb25lbnRCcm93c2VyL2NvbXBvbmVudEJyb3dzZXInICk7IiwiLyoqXG4gKiBhZGFwdC1zdHJhcFxuICogQHZlcnNpb24gdjIuMC42IC0gMjAxNC0xMC0yNlxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL0FkYXB0di9hZGFwdC1zdHJhcFxuICogQGF1dGhvciBLYXNoeWFwIFBhdGVsIChrYXNoeWFwQGFkYXAudHYpXG4gKiBAbGljZW5zZSBNSVQgTGljZW5zZSwgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuJ3VzZSBzdHJpY3QnO1xuLy8gU291cmNlOiBtb2R1bGUuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcCcsIFtcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLnV0aWxzJyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLnRyZWVicm93c2VyJyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLnRhYmxlbGl0ZScsXG4gICdhZGFwdHYuYWRhcHRTdHJhcC50YWJsZWFqYXgnLFxuICAnYWRhcHR2LmFkYXB0U3RyYXAubG9hZGluZ2luZGljYXRvcicsXG4gICdhZGFwdHYuYWRhcHRTdHJhcC5kcmFnZ2FibGUnLFxuICAnYWRhcHR2LmFkYXB0U3RyYXAuaW5maW5pdGVkcm9wZG93bidcbl0pLnByb3ZpZGVyKCckYWRDb25maWcnLCBmdW5jdGlvbiAoKSB7XG4gIHZhciBpY29uQ2xhc3NlcyA9IHRoaXMuaWNvbkNsYXNzZXMgPSB7XG4gICAgICBleHBhbmQ6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBsdXMtc2lnbicsXG4gICAgICBjb2xsYXBzZTogJ2dseXBoaWNvbiBnbHlwaGljb24tbWludXMtc2lnbicsXG4gICAgICBsb2FkaW5nU3Bpbm5lcjogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVmcmVzaCBhZC1zcGluJyxcbiAgICAgIGZpcnN0UGFnZTogJ2dseXBoaWNvbiBnbHlwaGljb24tZmFzdC1iYWNrd2FyZCcsXG4gICAgICBwcmV2aW91c1BhZ2U6ICdnbHlwaGljb24gZ2x5cGhpY29uLWJhY2t3YXJkJyxcbiAgICAgIG5leHRQYWdlOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1mb3J3YXJkJyxcbiAgICAgIGxhc3RQYWdlOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1mYXN0LWZvcndhcmQnLFxuICAgICAgc29ydEFzY2VuZGluZzogJ2dseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi11cCcsXG4gICAgICBzb3J0RGVzY2VuZGluZzogJ2dseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi1kb3duJyxcbiAgICAgIHNvcnRhYmxlOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZXNpemUtdmVydGljYWwnLFxuICAgICAgZHJhZ2dhYmxlOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1hbGlnbi1qdXN0aWZ5JyxcbiAgICAgIHNlbGVjdGVkSXRlbTogJ2dseXBoaWNvbiBnbHlwaGljb24tb2snXG4gICAgfSwgcGFnaW5nID0gdGhpcy5wYWdpbmcgPSB7XG4gICAgICByZXF1ZXN0OiB7XG4gICAgICAgIHN0YXJ0OiAnc2tpcCcsXG4gICAgICAgIHBhZ2VTaXplOiAnbGltaXQnLFxuICAgICAgICBwYWdlOiAncGFnZScsXG4gICAgICAgIHNvcnRGaWVsZDogJ3NvcnQnLFxuICAgICAgICBzb3J0RGlyZWN0aW9uOiAnc29ydF9kaXInLFxuICAgICAgICBzb3J0QXNjVmFsdWU6ICdhc2MnLFxuICAgICAgICBzb3J0RGVzY1ZhbHVlOiAnZGVzYydcbiAgICAgIH0sXG4gICAgICByZXNwb25zZToge1xuICAgICAgICBpdGVtc0xvY2F0aW9uOiAnZGF0YScsXG4gICAgICAgIHRvdGFsSXRlbXM6ICdwYWdpbmF0aW9uLnRvdGFsQ291bnQnXG4gICAgICB9XG4gICAgfTtcbiAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpY29uQ2xhc3NlczogaWNvbkNsYXNzZXMsXG4gICAgICBwYWdpbmc6IHBhZ2luZ1xuICAgIH07XG4gIH07XG59KTtcblxuLy8gU291cmNlOiBkcmFnZ2FibGUuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC5kcmFnZ2FibGUnLCBbXSkuZGlyZWN0aXZlKCdhZERyYWcnLCBbXG4gICckcm9vdFNjb3BlJyxcbiAgJyRwYXJzZScsXG4gICckdGltZW91dCcsXG4gIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcGFyc2UsICR0aW1lb3V0KSB7XG4gICAgZnVuY3Rpb24gbGlua0Z1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgc2NvcGUuZHJhZ2dhYmxlID0gYXR0cnMuYWREcmFnO1xuICAgICAgc2NvcGUuaGFzSGFuZGxlID0gYXR0cnMuYWREcmFnSGFuZGxlID09PSAnZmFsc2UnIHx8IHR5cGVvZiBhdHRycy5hZERyYWdIYW5kbGUgPT09ICd1bmRlZmluZWQnID8gZmFsc2UgOiB0cnVlO1xuICAgICAgc2NvcGUub25EcmFnU3RhcnRDYWxsYmFjayA9ICRwYXJzZShhdHRycy5hZERyYWdCZWdpbikgfHwgbnVsbDtcbiAgICAgIHNjb3BlLm9uRHJhZ0VuZENhbGxiYWNrID0gJHBhcnNlKGF0dHJzLmFkRHJhZ0VuZCkgfHwgbnVsbDtcbiAgICAgIHNjb3BlLmRhdGEgPSBudWxsO1xuICAgICAgdmFyIG9mZnNldCwgbXgsIG15LCB0eCwgdHk7XG4gICAgICB2YXIgaGFzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAvKiAtLSBFdmVudHMgLS0gKi9cbiAgICAgIHZhciBzdGFydEV2ZW50cyA9ICd0b3VjaHN0YXJ0IG1vdXNlZG93bic7XG4gICAgICB2YXIgbW92ZUV2ZW50cyA9ICd0b3VjaG1vdmUgbW91c2Vtb3ZlJztcbiAgICAgIHZhciBlbmRFdmVudHMgPSAndG91Y2hlbmQgbW91c2V1cCc7XG4gICAgICB2YXIgJGRvY3VtZW50ID0gJChkb2N1bWVudCk7XG4gICAgICB2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcbiAgICAgIHZhciBkcmFnRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgdmFyIHByZXNzVGltZXIgPSBudWxsO1xuICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgZWxlbWVudC5hdHRyKCdkcmFnZ2FibGUnLCAnZmFsc2UnKTtcbiAgICAgICAgLy8gcHJldmVudCBuYXRpdmUgZHJhZ1xuICAgICAgICB0b2dnbGVMaXN0ZW5lcnModHJ1ZSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiB0b2dnbGVMaXN0ZW5lcnMoZW5hYmxlKSB7XG4gICAgICAgIGlmICghZW5hYmxlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFkZCBsaXN0ZW5lcnMuXG4gICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBvbkRlc3Ryb3kpO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnYWREcmFnJywgb25FbmFibGVDaGFuZ2UpO1xuICAgICAgICBzY29wZS4kd2F0Y2goYXR0cnMuYWREcmFnRGF0YSwgb25EcmFnRGF0YUNoYW5nZSk7XG4gICAgICAgIHNjb3BlLiRvbignZHJhZ2dhYmxlOnN0YXJ0Jywgb25EcmFnU3RhcnQpO1xuICAgICAgICBzY29wZS4kb24oJ2RyYWdnYWJsZTplbmQnLCBvbkRyYWdFbmQpO1xuICAgICAgICBpZiAoc2NvcGUuaGFzSGFuZGxlKSB7XG4gICAgICAgICAgZWxlbWVudC5vbihzdGFydEV2ZW50cywgJy5hZC1kcmFnLWhhbmRsZScsIG9uUHJlc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZW1lbnQub24oc3RhcnRFdmVudHMsIG9uUHJlc3MpO1xuICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2FkLWRyYWdnYWJsZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaGFzVG91Y2gpIHtcbiAgICAgICAgICBlbGVtZW50Lm9uKCdtb3VzZWRvd24nLCAnLmFkLWRyYWctaGFuZGxlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGVsZW1lbnQub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9KTsgIC8vIHByZXZlbnQgbmF0aXZlIGRyYWdcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8tLS0gRXZlbnQgSGFuZGxlcnMgLS0tXG4gICAgICBmdW5jdGlvbiBvbkRyYWdTdGFydChldnQsIG8pIHtcbiAgICAgICAgaWYgKG8uZWwgPT09IGVsZW1lbnQgJiYgby5jYWxsYmFjaykge1xuICAgICAgICAgIG8uY2FsbGJhY2soZXZ0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25EcmFnRW5kKGV2dCwgbykge1xuICAgICAgICBpZiAoby5lbCA9PT0gZWxlbWVudCAmJiBvLmNhbGxiYWNrKSB7XG4gICAgICAgICAgby5jYWxsYmFjayhldnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkRlc3Ryb3koKSB7XG4gICAgICAgIHRvZ2dsZUxpc3RlbmVycyhmYWxzZSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbkRyYWdEYXRhQ2hhbmdlKG5ld1ZhbCkge1xuICAgICAgICBzY29wZS5kYXRhID0gbmV3VmFsO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25FbmFibGVDaGFuZ2UobmV3VmFsKSB7XG4gICAgICAgIGRyYWdFbmFibGVkID0gc2NvcGUuJGV2YWwobmV3VmFsKTtcbiAgICAgIH1cbiAgICAgIC8qXG4gICAgICAqIFdoZW4gdGhlIGVsZW1lbnQgaXMgY2xpY2tlZCBzdGFydCB0aGUgZHJhZyBiZWhhdmlvdXJcbiAgICAgICogT24gdG91Y2ggZGV2aWNlcyBhcyBhIHNtYWxsIGRlbGF5IHNvIGFzIG5vdCB0byBwcmV2ZW50IG5hdGl2ZSB3aW5kb3cgc2Nyb2xsaW5nXG4gICAgICAqL1xuICAgICAgZnVuY3Rpb24gb25QcmVzcyhldnQpIHtcbiAgICAgICAgaWYgKCFkcmFnRW5hYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzVG91Y2gpIHtcbiAgICAgICAgICBjYW5jZWxQcmVzcygpO1xuICAgICAgICAgIHByZXNzVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbmNlbFByZXNzKCk7XG4gICAgICAgICAgICBvbkxvbmdQcmVzcyhldnQpO1xuICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgJGRvY3VtZW50Lm9uKG1vdmVFdmVudHMsIGNhbmNlbFByZXNzKTtcbiAgICAgICAgICAkZG9jdW1lbnQub24oZW5kRXZlbnRzLCBjYW5jZWxQcmVzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb25Mb25nUHJlc3MoZXZ0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLypcbiAgICAgICAqIFJldHVybnMgdGhlIGlubGluZSBwcm9wZXJ0eSBvZiBhbiBlbGVtZW50XG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGdldElubGluZVByb3BlcnR5KHByb3AsIGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHN0eWxlcyA9ICQoZWxlbWVudCkuYXR0cignc3R5bGUnKSwgdmFsdWU7XG4gICAgICAgIGlmIChzdHlsZXMpIHtcbiAgICAgICAgICBzdHlsZXMuc3BsaXQoJzsnKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBlLnNwbGl0KCc6Jyk7XG4gICAgICAgICAgICBpZiAoJC50cmltKHN0eWxlWzBdKSA9PT0gcHJvcCkge1xuICAgICAgICAgICAgICB2YWx1ZSA9IHN0eWxlWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIC8qXG4gICAgICAgKiBQcmVzZXJ2ZSB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQgZHVyaW5nIGRyYWdcbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gcGVyc2lzdEVsZW1lbnRXaWR0aCgpIHtcbiAgICAgICAgaWYgKGdldElubGluZVByb3BlcnR5KCd3aWR0aCcsIGVsZW1lbnQpKSB7XG4gICAgICAgICAgZWxlbWVudC5kYXRhKCdhZC1kcmFnZ2FibGUtdGVtcC13aWR0aCcsIGdldElubGluZVByb3BlcnR5KCd3aWR0aCcsIGVsZW1lbnQpKTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50LndpZHRoKGVsZW1lbnQud2lkdGgoKSk7XG4gICAgICAgIGVsZW1lbnQuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoZ2V0SW5saW5lUHJvcGVydHkoJ3dpZHRoJywgdGhpcykpIHtcbiAgICAgICAgICAgICQodGhpcykuZGF0YSgnYWQtZHJhZ2dhYmxlLXRlbXAtd2lkdGgnLCBnZXRJbmxpbmVQcm9wZXJ0eSgnd2lkdGgnLCB0aGlzKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgICQodGhpcykud2lkdGgoJCh0aGlzKS53aWR0aCgpKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBjYW5jZWxQcmVzcygpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHByZXNzVGltZXIpO1xuICAgICAgICAkZG9jdW1lbnQub2ZmKG1vdmVFdmVudHMsIGNhbmNlbFByZXNzKTtcbiAgICAgICAgJGRvY3VtZW50Lm9mZihlbmRFdmVudHMsIGNhbmNlbFByZXNzKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uTG9uZ1ByZXNzKGV2dCkge1xuICAgICAgICBpZiAoIWRyYWdFbmFibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvZmZzZXQgPSBlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICBpZiAoc2NvcGUuaGFzSGFuZGxlKSB7XG4gICAgICAgICAgb2Zmc2V0ID0gZWxlbWVudC5maW5kKCcuYWQtZHJhZy1oYW5kbGUnKS5vZmZzZXQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvZmZzZXQgPSBlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2FkLWRyYWdnaW5nJyk7XG4gICAgICAgIG14ID0gZXZ0LnBhZ2VYIHx8IGV2dC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICAgIG15ID0gZXZ0LnBhZ2VZIHx8IGV2dC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICAgIHR4ID0gbXggLSBvZmZzZXQubGVmdCAtICR3aW5kb3cuc2Nyb2xsTGVmdCgpO1xuICAgICAgICB0eSA9IG15IC0gb2Zmc2V0LnRvcCAtICR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIHBlcnNpc3RFbGVtZW50V2lkdGgoKTtcbiAgICAgICAgbW92ZUVsZW1lbnQodHgsIHR5KTtcbiAgICAgICAgJGRvY3VtZW50Lm9uKG1vdmVFdmVudHMsIG9uTW92ZSk7XG4gICAgICAgICRkb2N1bWVudC5vbihlbmRFdmVudHMsIG9uUmVsZWFzZSk7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnZHJhZ2dhYmxlOnN0YXJ0Jywge1xuICAgICAgICAgIHg6IG14LFxuICAgICAgICAgIHk6IG15LFxuICAgICAgICAgIHR4OiB0eCxcbiAgICAgICAgICB0eTogdHksXG4gICAgICAgICAgZWw6IGVsZW1lbnQsXG4gICAgICAgICAgZGF0YTogc2NvcGUuZGF0YSxcbiAgICAgICAgICBjYWxsYmFjazogb25EcmFnQmVnaW5cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvbk1vdmUoZXZ0KSB7XG4gICAgICAgIHZhciBjeCwgY3k7XG4gICAgICAgIGlmICghZHJhZ0VuYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGN4ID0gZXZ0LnBhZ2VYIHx8IGV2dC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICAgIGN5ID0gZXZ0LnBhZ2VZIHx8IGV2dC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICAgIHR4ID0gY3ggLSBteCArIG9mZnNldC5sZWZ0IC0gJHdpbmRvdy5zY3JvbGxMZWZ0KCk7XG4gICAgICAgIHR5ID0gY3kgLSBteSArIG9mZnNldC50b3AgLSAkd2luZG93LnNjcm9sbFRvcCgpO1xuICAgICAgICBtb3ZlRWxlbWVudCh0eCwgdHkpO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2RyYWdnYWJsZTptb3ZlJywge1xuICAgICAgICAgIHg6IG14LFxuICAgICAgICAgIHk6IG15LFxuICAgICAgICAgIHR4OiB0eCxcbiAgICAgICAgICB0eTogdHksXG4gICAgICAgICAgZWw6IGVsZW1lbnQsXG4gICAgICAgICAgZGF0YTogc2NvcGUuZGF0YVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uUmVsZWFzZShldnQpIHtcbiAgICAgICAgaWYgKCFkcmFnRW5hYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkcmFnZ2FibGU6ZW5kJywge1xuICAgICAgICAgIHg6IG14LFxuICAgICAgICAgIHk6IG15LFxuICAgICAgICAgIHR4OiB0eCxcbiAgICAgICAgICB0eTogdHksXG4gICAgICAgICAgZWw6IGVsZW1lbnQsXG4gICAgICAgICAgZGF0YTogc2NvcGUuZGF0YSxcbiAgICAgICAgICBjYWxsYmFjazogb25EcmFnQ29tcGxldGVcbiAgICAgICAgfSk7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2FkLWRyYWdnaW5nJyk7XG4gICAgICAgIHJlc2V0KCk7XG4gICAgICAgICRkb2N1bWVudC5vZmYobW92ZUV2ZW50cywgb25Nb3ZlKTtcbiAgICAgICAgJGRvY3VtZW50Lm9mZihlbmRFdmVudHMsIG9uUmVsZWFzZSk7XG4gICAgICB9XG4gICAgICAvLyBDYWxsYmFja3NcbiAgICAgIGZ1bmN0aW9uIG9uRHJhZ0JlZ2luKGV2dCkge1xuICAgICAgICBpZiAoIXNjb3BlLm9uRHJhZ1N0YXJ0Q2FsbGJhY2spIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzY29wZS5vbkRyYWdTdGFydENhbGxiYWNrKHNjb3BlLCB7XG4gICAgICAgICAgICAkZGF0YTogc2NvcGUuZGF0YSxcbiAgICAgICAgICAgICRkcmFnRWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICRldmVudDogZXZ0XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25EcmFnQ29tcGxldGUoZXZ0KSB7XG4gICAgICAgIGlmICghc2NvcGUub25EcmFnRW5kQ2FsbGJhY2spIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gVG8gZml4IGEgYnVnIGlzc3VlIHdoZXJlIG9uRHJhZ0VuZCBoYXBwZW5zIGJlZm9yZVxuICAgICAgICAvLyBvbkRyb3BFbmQuIEN1cnJlbnRseSB0aGUgb25seSB3YXkgYXJvdW5kIHRoaXNcbiAgICAgICAgLy8gSWRlYWxseSBvbkRyb3BFbmQgc2hvdWxkIGZpcmUgYmVmb3JlIG9uRHJhZ0VuZFxuICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLm9uRHJhZ0VuZENhbGxiYWNrKHNjb3BlLCB7XG4gICAgICAgICAgICAgICRkYXRhOiBzY29wZS5kYXRhLFxuICAgICAgICAgICAgICAkZHJhZ0VsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICRldmVudDogZXZ0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH1cbiAgICAgIC8vIHV0aWxzIGZ1bmN0aW9uc1xuICAgICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgIGVsZW1lbnQuY3NzKHtcbiAgICAgICAgICBsZWZ0OiAnJyxcbiAgICAgICAgICB0b3A6ICcnLFxuICAgICAgICAgIHBvc2l0aW9uOiAnJyxcbiAgICAgICAgICAnei1pbmRleCc6ICcnXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgd2lkdGggPSBlbGVtZW50LmRhdGEoJ2FkLWRyYWdnYWJsZS10ZW1wLXdpZHRoJyk7XG4gICAgICAgIGlmICh3aWR0aCkge1xuICAgICAgICAgIGVsZW1lbnQuY3NzKHsgd2lkdGg6IHdpZHRoIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZW1lbnQuY3NzKHsgd2lkdGg6ICcnIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgd2lkdGggPSAkKHRoaXMpLmRhdGEoJ2FkLWRyYWdnYWJsZS10ZW1wLXdpZHRoJyk7XG4gICAgICAgICAgaWYgKHdpZHRoKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmNzcyh7IHdpZHRoOiB3aWR0aCB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCh0aGlzKS5jc3MoeyB3aWR0aDogJycgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG1vdmVFbGVtZW50KHgsIHkpIHtcbiAgICAgICAgZWxlbWVudC5jc3Moe1xuICAgICAgICAgIGxlZnQ6IHgsXG4gICAgICAgICAgdG9wOiB5LFxuICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxuICAgICAgICAgICd6LWluZGV4JzogOTk5OTlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpbml0KCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgbGluazogbGlua0Z1bmN0aW9uXG4gICAgfTtcbiAgfVxuXSkuZGlyZWN0aXZlKCdhZERyb3AnLCBbXG4gICckcm9vdFNjb3BlJyxcbiAgJyRwYXJzZScsXG4gIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcGFyc2UpIHtcbiAgICBmdW5jdGlvbiBsaW5rRnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBzY29wZS5kcm9wcGFibGUgPSBhdHRycy5hZERyb3A7XG4gICAgICBzY29wZS5vbkRyb3BDYWxsYmFjayA9ICRwYXJzZShhdHRycy5hZERyb3BFbmQpIHx8IG51bGw7XG4gICAgICBzY29wZS5vbkRyb3BPdmVyQ2FsbGJhY2sgPSAkcGFyc2UoYXR0cnMuYWREcm9wT3ZlcikgfHwgbnVsbDtcbiAgICAgIHNjb3BlLm9uRHJvcExlYXZlQ2FsbGJhY2sgPSAkcGFyc2UoYXR0cnMuYWREcm9wTGVhdmUpIHx8IG51bGw7XG4gICAgICB2YXIgZHJvcEVuYWJsZWQgPSBmYWxzZTtcbiAgICAgIHZhciBlbGVtID0gbnVsbDtcbiAgICAgIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgdG9nZ2xlTGlzdGVuZXJzKHRydWUpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gdG9nZ2xlTGlzdGVuZXJzKGVuYWJsZSkge1xuICAgICAgICBpZiAoIWVuYWJsZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBhZGQgbGlzdGVuZXJzLlxuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnYWREcm9wJywgb25FbmFibGVDaGFuZ2UpO1xuICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95Jywgb25EZXN0cm95KTtcbiAgICAgICAgc2NvcGUuJG9uKCdkcmFnZ2FibGU6bW92ZScsIG9uRHJhZ01vdmUpO1xuICAgICAgICBzY29wZS4kb24oJ2RyYWdnYWJsZTplbmQnLCBvbkRyYWdFbmQpO1xuICAgICAgICBzY29wZS4kb24oJ2RyYWdnYWJsZTpjaGFuZ2UnLCBvbkRyb3BDaGFuZ2UpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25EZXN0cm95KCkge1xuICAgICAgICB0b2dnbGVMaXN0ZW5lcnMoZmFsc2UpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gb25FbmFibGVDaGFuZ2UobmV3VmFsKSB7XG4gICAgICAgIGRyb3BFbmFibGVkID0gc2NvcGUuJGV2YWwobmV3VmFsKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRHJvcENoYW5nZShldnQsIG9iaikge1xuICAgICAgICBpZiAoZWxlbSAhPT0gb2JqLmVsKSB7XG4gICAgICAgICAgZWxlbSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRHJhZ01vdmUoZXZ0LCBvYmopIHtcbiAgICAgICAgaWYgKCFkcm9wRW5hYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB0aGUgZHJvcEVsZW1lbnQgYW5kIHRoZSBkcmFnIGVsZW1lbnQgYXJlIHRoZSBzYW1lXG4gICAgICAgIGlmIChlbGVtZW50ID09PSBvYmouZWwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVsID0gZ2V0Q3VycmVudERyb3BFbGVtZW50KG9iai50eCwgb2JqLnR5LCBvYmouZWwpO1xuICAgICAgICBpZiAoZWwgIT09IG51bGwpIHtcbiAgICAgICAgICBlbGVtID0gZWw7XG4gICAgICAgICAgb2JqLmVsLmxhc3REcm9wRWxlbWVudCA9IGVsZW07XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjb3BlLm9uRHJvcE92ZXJDYWxsYmFjayhzY29wZSwge1xuICAgICAgICAgICAgICAkZGF0YTogb2JqLmRhdGEsXG4gICAgICAgICAgICAgICRkcmFnRWxlbWVudDogb2JqLmVsLFxuICAgICAgICAgICAgICAkZHJvcEVsZW1lbnQ6IGVsZW0sXG4gICAgICAgICAgICAgICRldmVudDogZXZ0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdhZC1kcm9wLW92ZXInKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2RyYWdnYWJsZTpjaGFuZ2UnLCB7IGVsOiBlbGVtIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChvYmouZWwubGFzdERyb3BFbGVtZW50ID09PSBlbGVtZW50KSB7XG4gICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBzY29wZS5vbkRyb3BMZWF2ZUNhbGxiYWNrKHNjb3BlLCB7XG4gICAgICAgICAgICAgICAgJGRhdGE6IG9iai5kYXRhLFxuICAgICAgICAgICAgICAgICRkcmFnRWxlbWVudDogb2JqLmVsLFxuICAgICAgICAgICAgICAgICRkcm9wRWxlbWVudDogb2JqLmVsLmxhc3REcm9wRWxlbWVudCxcbiAgICAgICAgICAgICAgICAkZXZlbnQ6IGV2dFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgb2JqLmVsLmxhc3REcm9wRWxlbWVudC5yZW1vdmVDbGFzcygnYWQtZHJvcC1vdmVyJyk7XG4gICAgICAgICAgICBkZWxldGUgb2JqLmVsLmxhc3REcm9wRWxlbWVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uRHJhZ0VuZChldnQsIG9iaikge1xuICAgICAgICBpZiAoIWRyb3BFbmFibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtKSB7XG4gICAgICAgICAgLy8gY2FsbCB0aGUgYWREcm9wIGVsZW1lbnQgY2FsbGJhY2tcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2NvcGUub25Ecm9wQ2FsbGJhY2soc2NvcGUsIHtcbiAgICAgICAgICAgICAgJGRhdGE6IG9iai5kYXRhLFxuICAgICAgICAgICAgICAkZHJhZ0VsZW1lbnQ6IG9iai5lbCxcbiAgICAgICAgICAgICAgJGRyb3BFbGVtZW50OiBlbGVtLFxuICAgICAgICAgICAgICAkZXZlbnQ6IGV2dFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZWxlbSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGdldEN1cnJlbnREcm9wRWxlbWVudCh4LCB5KSB7XG4gICAgICAgIHZhciBib3VuZHMgPSBlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICAvLyBzZXQgZHJhZyBzZW5zaXRpdml0eVxuICAgICAgICB2YXIgdnRob2xkID0gTWF0aC5mbG9vcihlbGVtZW50Lm91dGVySGVpZ2h0KCkgLyA2KTtcbiAgICAgICAgeCA9IHggKyAkd2luZG93LnNjcm9sbExlZnQoKTtcbiAgICAgICAgeSA9IHkgKyAkd2luZG93LnNjcm9sbFRvcCgpO1xuICAgICAgICByZXR1cm4geSA+PSBib3VuZHMudG9wICsgdnRob2xkICYmIHkgPD0gYm91bmRzLnRvcCArIGVsZW1lbnQub3V0ZXJIZWlnaHQoKSAtIHZ0aG9sZCAmJiAoeCA+PSBib3VuZHMubGVmdCAmJiB4IDw9IGJvdW5kcy5sZWZ0ICsgZWxlbWVudC5vdXRlcldpZHRoKCkpICYmICh4ID49IGJvdW5kcy5sZWZ0ICYmIHggPD0gYm91bmRzLmxlZnQgKyBlbGVtZW50Lm91dGVyV2lkdGgoKSkgPyBlbGVtZW50IDogbnVsbDtcbiAgICAgIH1cbiAgICAgIGluaXQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICBsaW5rOiBsaW5rRnVuY3Rpb25cbiAgICB9O1xuICB9XG5dKTtcblxuLy8gU291cmNlOiBpbmZpbml0ZWRyb3Bkb3duLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAuaW5maW5pdGVkcm9wZG93bicsIFtcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLnV0aWxzJyxcbiAgJ2FkYXB0di5hZGFwdFN0cmFwLmxvYWRpbmdpbmRpY2F0b3InXG5dKS5kaXJlY3RpdmUoJ2FkSW5maW5pdGVEcm9wZG93bicsIFtcbiAgJyRwYXJzZScsXG4gICckY29tcGlsZScsXG4gICckdGVtcGxhdGVDYWNoZScsXG4gICckYWRDb25maWcnLFxuICAnYWRMb2FkUGFnZScsXG4gICdhZERlYm91bmNlJyxcbiAgJ2FkU3RyYXBVdGlscycsXG4gICdhZExvYWRMb2NhbFBhZ2UnLFxuICBmdW5jdGlvbiAoJHBhcnNlLCAkY29tcGlsZSwgJHRlbXBsYXRlQ2FjaGUsICRhZENvbmZpZywgYWRMb2FkUGFnZSwgYWREZWJvdW5jZSwgYWRTdHJhcFV0aWxzLCBhZExvYWRMb2NhbFBhZ2UpIHtcbmZ1bmN0aW9uIGxpbmtGdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIC8vIHNjb3BlIGluaXRpYWxpemF0aW9uXG4gICAgICBzY29wZS5hdHRycyA9IGF0dHJzO1xuICAgICAgc2NvcGUuYWRTdHJhcFV0aWxzID0gYWRTdHJhcFV0aWxzO1xuICAgICAgc2NvcGUuaXRlbXMgPSB7XG4gICAgICAgIGxpc3Q6IFtdLFxuICAgICAgICBwYWdpbmc6IHtcbiAgICAgICAgICBjdXJyZW50UGFnZTogMSxcbiAgICAgICAgICB0b3RhbFBhZ2VzOiB1bmRlZmluZWQsXG4gICAgICAgICAgcGFnZVNpemU6IE51bWJlcihhdHRycy5wYWdlU2l6ZSkgfHwgMTBcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNjb3BlLmxvY2FsQ29uZmlnID0ge1xuICAgICAgICBsb2FkaW5nRGF0YTogZmFsc2UsXG4gICAgICAgIHNpbmdsZVNlbGVjdGlvbk1vZGU6ICRwYXJzZShhdHRycy5zaW5nbGVTZWxlY3Rpb25Nb2RlKSgpID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBkaW1lbnNpb25zOiB7XG4gICAgICAgICAgJ21heC1oZWlnaHQnOiBhdHRycy5tYXhIZWlnaHQgfHwgJzIwMHB4JyxcbiAgICAgICAgICAnbWF4LXdpZHRoJzogYXR0cnMubWF4V2lkdGggfHwgJ2F1dG8nXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzY29wZS5zZWxlY3RlZEl0ZW1zID0gc2NvcGUuJGV2YWwoYXR0cnMuc2VsZWN0ZWRJdGVtcykgfHwgW107XG4gICAgICBzY29wZS5hamF4Q29uZmlnID0gc2NvcGUuJGV2YWwoYXR0cnMuYWpheENvbmZpZykgfHwge307XG4gICAgICAvLyAtLS0tLS0tLS0tIExvY2FsIGRhdGEgLS0tLS0tLS0tLSAvL1xuICAgICAgdmFyIGxhc3RSZXF1ZXN0VG9rZW4sIHdhdGNoZXJzID0gW107XG4gICAgICAvLyAtLS0tLS0tLS0tIHVpIGhhbmRsZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgIHNjb3BlLmFkZFJlbW92ZUl0ZW0gPSBmdW5jdGlvbiAoZXZlbnQsIGl0ZW0sIGl0ZW1zKSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBpZiAoc2NvcGUubG9jYWxDb25maWcuc2luZ2xlU2VsZWN0aW9uTW9kZSkge1xuICAgICAgICAgIHNjb3BlLnNlbGVjdGVkSXRlbXNbMF0gPSBpdGVtO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFkU3RyYXBVdGlscy5hZGRSZW1vdmVJdGVtRnJvbUxpc3QoaXRlbSwgaXRlbXMpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjYWxsYmFjayA9IHNjb3BlLiRldmFsKGF0dHJzLm9uSXRlbUNsaWNrKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2soaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzY29wZS5sb2FkUGFnZSA9IGFkRGVib3VuY2UoZnVuY3Rpb24gKHBhZ2UpIHtcbiAgICAgICAgbGFzdFJlcXVlc3RUb2tlbiA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgIHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhID0gdHJ1ZTtcbiAgICAgICAgdmFyIHBhZ2VMb2FkZXIgPSBzY29wZS4kZXZhbChhdHRycy5wYWdlTG9hZGVyKSB8fCBhZExvYWRQYWdlLCBwYXJhbXMgPSB7XG4gICAgICAgICAgICBwYWdlTnVtYmVyOiBwYWdlLFxuICAgICAgICAgICAgcGFnZVNpemU6IHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSxcbiAgICAgICAgICAgIHNvcnRLZXk6IHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSxcbiAgICAgICAgICAgIHNvcnREaXJlY3Rpb246IHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UsXG4gICAgICAgICAgICBhamF4Q29uZmlnOiBzY29wZS5hamF4Q29uZmlnLFxuICAgICAgICAgICAgdG9rZW46IGxhc3RSZXF1ZXN0VG9rZW5cbiAgICAgICAgICB9LCBzdWNjZXNzSGFuZGxlciA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnRva2VuID09PSBsYXN0UmVxdWVzdFRva2VuKSB7XG4gICAgICAgICAgICAgIGlmIChwYWdlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuaXRlbXMubGlzdCA9IHJlc3BvbnNlLml0ZW1zO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjb3BlLml0ZW1zLmxpc3QgPSBzY29wZS5pdGVtcy5saXN0LmNvbmNhdChyZXNwb25zZS5pdGVtcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2NvcGUuaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMgPSByZXNwb25zZS50b3RhbFBhZ2VzO1xuICAgICAgICAgICAgICBzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPSByZXNwb25zZS5jdXJyZW50UGFnZTtcbiAgICAgICAgICAgICAgc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCBlcnJvckhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSA9IGZhbHNlO1xuICAgICAgICAgIH07XG4gICAgICAgIGlmIChhdHRycy5sb2NhbERhdGFTb3VyY2UpIHtcbiAgICAgICAgICBwYXJhbXMubG9jYWxEYXRhID0gc2NvcGUuJGV2YWwoYXR0cnMubG9jYWxEYXRhU291cmNlKTtcbiAgICAgICAgICBzdWNjZXNzSGFuZGxlcihhZExvYWRMb2NhbFBhZ2UocGFyYW1zKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFnZUxvYWRlcihwYXJhbXMpLnRoZW4oc3VjY2Vzc0hhbmRsZXIsIGVycm9ySGFuZGxlcik7XG4gICAgICAgIH1cbiAgICAgIH0sIDEwKTtcbiAgICAgIHNjb3BlLmxvYWROZXh0UGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFzY29wZS5sb2NhbENvbmZpZy5sb2FkaW5nRGF0YSkge1xuICAgICAgICAgIGlmIChzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgKyAxIDw9IHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzKSB7XG4gICAgICAgICAgICBzY29wZS5sb2FkUGFnZShzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgKyAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAvLyAtLS0tLS0tLS0tIGluaXRpYWxpemF0aW9uIGFuZCBldmVudCBsaXN0ZW5lcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgLy9XZSBkbyB0aGUgY29tcGlsZSBhZnRlciBpbmplY3RpbmcgdGhlIG5hbWUgc3BhY2luZyBpbnRvIHRoZSB0ZW1wbGF0ZS5cbiAgICAgIHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgLy8gLS0tLS0tLS0tLSBzZXQgd2F0Y2hlcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgLy8gcmVzZXQgb24gcGFyYW1ldGVyIGNoYW5nZVxuICAgICAgaWYgKGF0dHJzLmFqYXhDb25maWcpIHtcbiAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJzLmFqYXhDb25maWcsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5sb2NhbERhdGFTb3VyY2UpIHtcbiAgICAgICAgd2F0Y2hlcnMucHVzaChzY29wZS4kd2F0Y2goYXR0cnMubG9jYWxEYXRhU291cmNlLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICB3YXRjaGVycy5wdXNoKHNjb3BlLiR3YXRjaChhdHRycy5sb2NhbERhdGFTb3VyY2UgKyAnLmxlbmd0aCcsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgICAvLyAtLS0tLS0tLS0tIGRpc2FibGUgd2F0Y2hlcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaChmdW5jdGlvbiAod2F0Y2hlcikge1xuICAgICAgICAgIHdhdGNoZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHZhciBsaXN0Q29udGFpbmVyID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLmZpbmQoJ3VsJylbMF07XG4gICAgICAvLyBpbmZpbml0ZSBzY3JvbGwgaGFuZGxlclxuICAgICAgdmFyIGxvYWRGdW5jdGlvbiA9IGFkRGVib3VuY2UoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIFRoaXMgaXMgZm9yIGluZmluaXRlIHNjcm9sbGluZy5cbiAgICAgICAgICAvLyBXaGVuIHRoZSBzY3JvbGwgZ2V0cyBjbG9zZXIgdG8gdGhlIGJvdHRvbSwgbG9hZCBtb3JlIGl0ZW1zLlxuICAgICAgICAgIGlmIChsaXN0Q29udGFpbmVyLnNjcm9sbFRvcCArIGxpc3RDb250YWluZXIub2Zmc2V0SGVpZ2h0ID49IGxpc3RDb250YWluZXIuc2Nyb2xsSGVpZ2h0IC0gMzAwKSB7XG4gICAgICAgICAgICBzY29wZS5sb2FkTmV4dFBhZ2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDUwKTtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChsaXN0Q29udGFpbmVyKS5iaW5kKCdtb3VzZXdoZWVsJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGVsdGFZKSB7XG4gICAgICAgICAgbGlzdENvbnRhaW5lci5zY3JvbGxUb3AgKz0gZXZlbnQub3JpZ2luYWxFdmVudC5kZWx0YVk7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBsb2FkRnVuY3Rpb24oKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgbGluazogbGlua0Z1bmN0aW9uLFxuICAgICAgdGVtcGxhdGVVcmw6ICdpbmZpbml0ZWRyb3Bkb3duL2luZmluaXRlZHJvcGRvd24udHBsLmh0bWwnXG4gICAgfTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogbG9hZGluZ2luZGljYXRvci5qc1xuYW5ndWxhci5tb2R1bGUoJ2FkYXB0di5hZGFwdFN0cmFwLmxvYWRpbmdpbmRpY2F0b3InLCBbXSkuZGlyZWN0aXZlKCdhZExvYWRpbmdJY29uJywgW1xuICAnJGFkQ29uZmlnJyxcbiAgJyRjb21waWxlJyxcbiAgZnVuY3Rpb24gKCRhZENvbmZpZywgJGNvbXBpbGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uIGNvbXBpbGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcHJlOiBmdW5jdGlvbiBwcmVMaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgdmFyIGxvYWRpbmdJY29uQ2xhc3MgPSBhdHRycy5sb2FkaW5nSWNvbkNsYXNzIHx8ICRhZENvbmZpZy5pY29uQ2xhc3Nlcy5sb2FkaW5nU3Bpbm5lciwgbmdTdHlsZVRlbXBsYXRlID0gYXR0cnMubG9hZGluZ0ljb25TaXplID8gJ25nLXN0eWxlPVwie1xcJ2ZvbnQtc2l6ZVxcJzogXFwnJyArIGF0dHJzLmxvYWRpbmdJY29uU2l6ZSArICdcXCd9XCInIDogJycsIHRlbXBsYXRlID0gJzxpIGNsYXNzPVwiJyArIGxvYWRpbmdJY29uQ2xhc3MgKyAnXCIgJyArIG5nU3R5bGVUZW1wbGF0ZSArICc+PC9pPic7XG4gICAgICAgICAgICBlbGVtZW50LmVtcHR5KCk7XG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZCgkY29tcGlsZSh0ZW1wbGF0ZSkoc2NvcGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXSkuZGlyZWN0aXZlKCdhZExvYWRpbmdPdmVybGF5JywgW1xuICAnJGFkQ29uZmlnJyxcbiAgZnVuY3Rpb24gKCRhZENvbmZpZykge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdsb2FkaW5naW5kaWNhdG9yL2xvYWRpbmdpbmRpY2F0b3IudHBsLmh0bWwnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgbG9hZGluZzogJz0nLFxuICAgICAgICB6SW5kZXg6ICdAJyxcbiAgICAgICAgcG9zaXRpb246ICdAJyxcbiAgICAgICAgY29udGFpbmVyQ2xhc3NlczogJ0AnLFxuICAgICAgICBsb2FkaW5nSWNvbkNsYXNzOiAnQCcsXG4gICAgICAgIGxvYWRpbmdJY29uU2l6ZTogJ0AnXG4gICAgICB9LFxuICAgICAgY29tcGlsZTogZnVuY3Rpb24gY29tcGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBwcmU6IGZ1bmN0aW9uIHByZUxpbmsoc2NvcGUpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRpbmdJY29uQ2xhc3MgPSBzY29wZS5sb2FkaW5nSWNvbkNsYXNzIHx8ICRhZENvbmZpZy5pY29uQ2xhc3Nlcy5sb2FkaW5nO1xuICAgICAgICAgICAgc2NvcGUubG9hZGluZ0ljb25TaXplID0gc2NvcGUubG9hZGluZ0ljb25TaXplIHx8ICczZW0nO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5dKTtcblxuLy8gU291cmNlOiB0YWJsZWFqYXguanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC50YWJsZWFqYXgnLCBbXG4gICdhZGFwdHYuYWRhcHRTdHJhcC51dGlscycsXG4gICdhZGFwdHYuYWRhcHRTdHJhcC5sb2FkaW5naW5kaWNhdG9yJ1xuXSkuZGlyZWN0aXZlKCdhZFRhYmxlQWpheCcsIFtcbiAgJyRwYXJzZScsXG4gICckYWRDb25maWcnLFxuICAnYWRMb2FkUGFnZScsXG4gICdhZERlYm91bmNlJyxcbiAgJ2FkU3RyYXBVdGlscycsXG4gIGZ1bmN0aW9uICgkcGFyc2UsICRhZENvbmZpZywgYWRMb2FkUGFnZSwgYWREZWJvdW5jZSwgYWRTdHJhcFV0aWxzKSB7XG5mdW5jdGlvbiBjb250cm9sbGVyRnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMpIHtcbiAgICAgIC8vIC0tLS0tLS0tLS0gJHNjb3BlIGluaXRpYWxpemF0aW9uIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS5hdHRycyA9ICRhdHRycztcbiAgICAgICRzY29wZS5pY29uQ2xhc3NlcyA9ICRhZENvbmZpZy5pY29uQ2xhc3NlcztcbiAgICAgICRzY29wZS5hZFN0cmFwVXRpbHMgPSBhZFN0cmFwVXRpbHM7XG4gICAgICAkc2NvcGUuaXRlbXMgPSB7XG4gICAgICAgIGxpc3Q6IHVuZGVmaW5lZCxcbiAgICAgICAgcGFnaW5nOiB7XG4gICAgICAgICAgY3VycmVudFBhZ2U6IDEsXG4gICAgICAgICAgdG90YWxQYWdlczogdW5kZWZpbmVkLFxuICAgICAgICAgIHBhZ2VTaXplOiBOdW1iZXIoJGF0dHJzLnBhZ2VTaXplKSB8fCAxMCxcbiAgICAgICAgICBwYWdlU2l6ZXM6ICRwYXJzZSgkYXR0cnMucGFnZVNpemVzKSgpIHx8IFtcbiAgICAgICAgICAgIDEwLFxuICAgICAgICAgICAgMjUsXG4gICAgICAgICAgICA1MFxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5sb2NhbENvbmZpZyA9IHtcbiAgICAgICAgcGFnaW5nQXJyYXk6IFtdLFxuICAgICAgICBsb2FkaW5nRGF0YTogZmFsc2UsXG4gICAgICAgIHRhYmxlTWF4SGVpZ2h0OiAkYXR0cnMudGFibGVNYXhIZWlnaHRcbiAgICAgIH07XG4gICAgICAkc2NvcGUuYWpheENvbmZpZyA9ICRzY29wZS4kZXZhbCgkYXR0cnMuYWpheENvbmZpZyk7XG4gICAgICAkc2NvcGUuY29sdW1uRGVmaW5pdGlvbiA9ICRzY29wZS4kZXZhbCgkYXR0cnMuY29sdW1uRGVmaW5pdGlvbik7XG4gICAgICAvLyAtLS0tLS0tLS0tIExvY2FsIGRhdGEgLS0tLS0tLS0tLSAvL1xuICAgICAgdmFyIGxhc3RSZXF1ZXN0VG9rZW4sIHdhdGNoZXJzID0gW107XG4gICAgICBpZiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZXMuaW5kZXhPZigkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplKSA8IDApIHtcbiAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSA9ICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemVzWzBdO1xuICAgICAgfVxuICAgICAgLy8gLS0tLS0tLS0tLSB1aSBoYW5kbGVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAkc2NvcGUubG9hZFBhZ2UgPSBhZERlYm91bmNlKGZ1bmN0aW9uIChwYWdlKSB7XG4gICAgICAgIGxhc3RSZXF1ZXN0VG9rZW4gPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAkc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEgPSB0cnVlO1xuICAgICAgICB2YXIgcGFnZUxvYWRlciA9ICRzY29wZS4kZXZhbCgkYXR0cnMucGFnZUxvYWRlcikgfHwgYWRMb2FkUGFnZSwgcGFyYW1zID0ge1xuICAgICAgICAgICAgcGFnZU51bWJlcjogcGFnZSxcbiAgICAgICAgICAgIHBhZ2VTaXplOiAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplLFxuICAgICAgICAgICAgc29ydEtleTogJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSxcbiAgICAgICAgICAgIHNvcnREaXJlY3Rpb246ICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlLFxuICAgICAgICAgICAgYWpheENvbmZpZzogJHNjb3BlLmFqYXhDb25maWcsXG4gICAgICAgICAgICB0b2tlbjogbGFzdFJlcXVlc3RUb2tlblxuICAgICAgICAgIH0sIHN1Y2Nlc3NIYW5kbGVyID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UudG9rZW4gPT09IGxhc3RSZXF1ZXN0VG9rZW4pIHtcbiAgICAgICAgICAgICAgJHNjb3BlLml0ZW1zLmxpc3QgPSByZXNwb25zZS5pdGVtcztcbiAgICAgICAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzID0gcmVzcG9uc2UudG90YWxQYWdlcztcbiAgICAgICAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9IHJlc3BvbnNlLmN1cnJlbnRQYWdlO1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucGFnaW5nQXJyYXkgPSByZXNwb25zZS5wYWdpbmdBcnJheTtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgZXJyb3JIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhID0gZmFsc2U7XG4gICAgICAgICAgfTtcbiAgICAgICAgcGFnZUxvYWRlcihwYXJhbXMpLnRoZW4oc3VjY2Vzc0hhbmRsZXIsIGVycm9ySGFuZGxlcik7XG4gICAgICB9KTtcbiAgICAgICRzY29wZS5sb2FkTmV4dFBhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghJHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhKSB7XG4gICAgICAgICAgaWYgKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgKyAxIDw9ICRzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcykge1xuICAgICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgKyAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUubG9hZFByZXZpb3VzUGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCEkc2NvcGUubG9jYWxDb25maWcubG9hZGluZ0RhdGEpIHtcbiAgICAgICAgICBpZiAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAtIDEgPiAwKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAtIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5sb2FkTGFzdFBhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghJHNjb3BlLmxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhKSB7XG4gICAgICAgICAgaWYgKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgIT09ICRzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcykge1xuICAgICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLnBhZ2VTaXplQ2hhbmdlZCA9IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICAgIGlmIChOdW1iZXIoc2l6ZSkgIT09ICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUpIHtcbiAgICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplID0gTnVtYmVyKHNpemUpO1xuICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5zb3J0QnlDb2x1bW4gPSBmdW5jdGlvbiAoY29sdW1uKSB7XG4gICAgICAgIGlmIChjb2x1bW4uc29ydEtleSkge1xuICAgICAgICAgIGlmIChjb2x1bW4uc29ydEtleSAhPT0gJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSkge1xuICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9IGNvbHVtbi5zb3J0S2V5O1xuICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucHJlZGljYXRlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAvLyAtLS0tLS0tLS0tIGluaXRpYWxpemF0aW9uIGFuZCBldmVudCBsaXN0ZW5lcnMgLS0tLS0tLS0tLSAvL1xuICAgICAgJHNjb3BlLmxvYWRQYWdlKDEpO1xuICAgICAgLy8gcmVzZXQgb24gcGFyYW1ldGVyIGNoYW5nZVxuICAgICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHdhdGNoKCRhdHRycy5hamF4Q29uZmlnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgIH0sIHRydWUpKTtcbiAgICAgIHdhdGNoZXJzLnB1c2goJHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJGF0dHJzLmNvbHVtbkRlZmluaXRpb24sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLmNvbHVtbkRlZmluaXRpb24gPSAkc2NvcGUuJGV2YWwoJGF0dHJzLmNvbHVtbkRlZmluaXRpb24pO1xuICAgICAgfSkpO1xuICAgICAgLy8gLS0tLS0tLS0tLSBkaXNhYmxlIHdhdGNoZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICB3YXRjaGVycy5mb3JFYWNoKGZ1bmN0aW9uICh3YXRjaGVyKSB7XG4gICAgICAgICAgd2F0Y2hlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0YWJsZWFqYXgvdGFibGVhamF4LnRwbC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6IFtcbiAgICAgICAgJyRzY29wZScsXG4gICAgICAgICckYXR0cnMnLFxuICAgICAgICBjb250cm9sbGVyRnVuY3Rpb25cbiAgICAgIF1cbiAgICB9O1xuICB9XG5dKTtcblxuLy8gU291cmNlOiB0YWJsZWxpdGUuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC50YWJsZWxpdGUnLCBbJ2FkYXB0di5hZGFwdFN0cmFwLnV0aWxzJ10pLmRpcmVjdGl2ZSgnYWRUYWJsZUxpdGUnLCBbXG4gICckcGFyc2UnLFxuICAnJGh0dHAnLFxuICAnJGNvbXBpbGUnLFxuICAnJGZpbHRlcicsXG4gICckdGVtcGxhdGVDYWNoZScsXG4gICckYWRDb25maWcnLFxuICAnYWRTdHJhcFV0aWxzJyxcbiAgJ2FkRGVib3VuY2UnLFxuICAnYWRMb2FkTG9jYWxQYWdlJyxcbiAgZnVuY3Rpb24gKCRwYXJzZSwgJGh0dHAsICRjb21waWxlLCAkZmlsdGVyLCAkdGVtcGxhdGVDYWNoZSwgJGFkQ29uZmlnLCBhZFN0cmFwVXRpbHMsIGFkRGVib3VuY2UsIGFkTG9hZExvY2FsUGFnZSkge1xuZnVuY3Rpb24gY29udHJvbGxlckZ1bmN0aW9uKCRzY29wZSwgJGF0dHJzKSB7XG4gICAgICAvLyAtLS0tLS0tLS0tICQkc2NvcGUgaW5pdGlhbGl6YXRpb24gLS0tLS0tLS0tLSAvL1xuICAgICAgJHNjb3BlLmF0dHJzID0gJGF0dHJzO1xuICAgICAgJHNjb3BlLmljb25DbGFzc2VzID0gJGFkQ29uZmlnLmljb25DbGFzc2VzO1xuICAgICAgJHNjb3BlLmFkU3RyYXBVdGlscyA9IGFkU3RyYXBVdGlscztcbiAgICAgICRzY29wZS5jb2x1bW5EZWZpbml0aW9uID0gJHNjb3BlLiRldmFsKCRhdHRycy5jb2x1bW5EZWZpbml0aW9uKTtcbiAgICAgICRzY29wZS5pdGVtcyA9IHtcbiAgICAgICAgbGlzdDogdW5kZWZpbmVkLFxuICAgICAgICBhbGxJdGVtczogdW5kZWZpbmVkLFxuICAgICAgICBwYWdpbmc6IHtcbiAgICAgICAgICBjdXJyZW50UGFnZTogMSxcbiAgICAgICAgICB0b3RhbFBhZ2VzOiB1bmRlZmluZWQsXG4gICAgICAgICAgcGFnZVNpemU6IE51bWJlcigkYXR0cnMucGFnZVNpemUpIHx8IDEwLFxuICAgICAgICAgIHBhZ2VTaXplczogJHBhcnNlKCRhdHRycy5wYWdlU2l6ZXMpKCkgfHwgW1xuICAgICAgICAgICAgMTAsXG4gICAgICAgICAgICAyNSxcbiAgICAgICAgICAgIDUwXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnID0ge1xuICAgICAgICBsb2NhbERhdGE6IGFkU3RyYXBVdGlscy5wYXJzZSgkc2NvcGUuJGV2YWwoJGF0dHJzLmxvY2FsRGF0YVNvdXJjZSkpLFxuICAgICAgICBwYWdpbmdBcnJheTogW10sXG4gICAgICAgIGRyYWdDaGFuZ2U6ICRzY29wZS4kZXZhbCgkYXR0cnMub25EcmFnQ2hhbmdlKVxuICAgICAgfTtcbiAgICAgICRzY29wZS5zZWxlY3RlZEl0ZW1zID0gJHNjb3BlLiRldmFsKCRhdHRycy5zZWxlY3RlZEl0ZW1zKTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gTG9jYWwgZGF0YSAtLS0tLS0tLS0tIC8vXG4gICAgICB2YXIgcGxhY2VIb2xkZXIgPSBudWxsLCBwYWdlQnV0dG9uRWxlbWVudCA9IG51bGwsIHZhbGlkRHJvcCA9IGZhbHNlLCBpbml0aWFsUG9zLCB3YXRjaGVycyA9IFtdO1xuICAgICAgZnVuY3Rpb24gbW92ZUVsZW1lbnROb2RlKG5vZGVUb01vdmUsIHJlbGF0aXZlTm9kZSwgZHJhZ05vZGUpIHtcbiAgICAgICAgaWYgKHJlbGF0aXZlTm9kZS5uZXh0KClbMF0gPT09IG5vZGVUb01vdmVbMF0pIHtcbiAgICAgICAgICByZWxhdGl2ZU5vZGUuYmVmb3JlKG5vZGVUb01vdmUpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlbGF0aXZlTm9kZS5wcmV2KClbMF0gPT09IG5vZGVUb01vdmVbMF0pIHtcbiAgICAgICAgICByZWxhdGl2ZU5vZGUuYWZ0ZXIobm9kZVRvTW92ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHJlbGF0aXZlTm9kZS5uZXh0KClbMF0gPT09IGRyYWdOb2RlWzBdKSB7XG4gICAgICAgICAgICByZWxhdGl2ZU5vZGUuYmVmb3JlKG5vZGVUb01vdmUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocmVsYXRpdmVOb2RlLnByZXYoKVswXSA9PT0gZHJhZ05vZGVbMF0pIHtcbiAgICAgICAgICAgIHJlbGF0aXZlTm9kZS5hZnRlcihub2RlVG9Nb3ZlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICgkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplcy5pbmRleE9mKCRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUpIDwgMCkge1xuICAgICAgICAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplID0gJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZXNbMF07XG4gICAgICB9XG4gICAgICAvLyAtLS0tLS0tLS0tIHVpIGhhbmRsZXJzIC0tLS0tLS0tLS0gLy9cbiAgICAgICRzY29wZS5sb2FkUGFnZSA9IGFkRGVib3VuY2UoZnVuY3Rpb24gKHBhZ2UpIHtcbiAgICAgICAgdmFyIGl0ZW1zT2JqZWN0ID0gJHNjb3BlLmxvY2FsQ29uZmlnLmxvY2FsRGF0YSA9IGFkU3RyYXBVdGlscy5wYXJzZSgkc2NvcGUuJGV2YWwoJGF0dHJzLmxvY2FsRGF0YVNvdXJjZSkpLCBwYXJhbXM7XG4gICAgICAgIHBhcmFtcyA9IHtcbiAgICAgICAgICBwYWdlTnVtYmVyOiBwYWdlLFxuICAgICAgICAgIHBhZ2VTaXplOiAhJGF0dHJzLmRpc2FibGVQYWdpbmcgPyAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplIDogaXRlbXNPYmplY3QubGVuZ3RoLFxuICAgICAgICAgIHNvcnRLZXk6ICRzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUsXG4gICAgICAgICAgc29ydERpcmVjdGlvbjogJHNjb3BlLmxvY2FsQ29uZmlnLnJldmVyc2UsXG4gICAgICAgICAgbG9jYWxEYXRhOiBpdGVtc09iamVjdFxuICAgICAgICB9O1xuICAgICAgICB2YXIgcmVzcG9uc2UgPSBhZExvYWRMb2NhbFBhZ2UocGFyYW1zKTtcbiAgICAgICAgJHNjb3BlLml0ZW1zLmxpc3QgPSByZXNwb25zZS5pdGVtcztcbiAgICAgICAgJHNjb3BlLml0ZW1zLmFsbEl0ZW1zID0gcmVzcG9uc2UuYWxsSXRlbXM7XG4gICAgICAgICRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPSByZXNwb25zZS5jdXJyZW50UGFnZTtcbiAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzID0gcmVzcG9uc2UudG90YWxQYWdlcztcbiAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnBhZ2luZ0FycmF5ID0gcmVzcG9uc2UucGFnaW5nQXJyYXk7XG4gICAgICB9LCAxMDApO1xuICAgICAgJHNjb3BlLmxvYWROZXh0UGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgKyAxIDw9ICRzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcykge1xuICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUubG9hZFByZXZpb3VzUGFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgLSAxID4gMCkge1xuICAgICAgICAgICRzY29wZS5sb2FkUGFnZSgkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUubG9hZExhc3RQYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoISRzY29wZS5sb2NhbENvbmZpZy5kaXNhYmxlUGFnaW5nKSB7XG4gICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcudG90YWxQYWdlcyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUucGFnZVNpemVDaGFuZ2VkID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgICAgJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSA9IHNpemU7XG4gICAgICAgICRzY29wZS5sb2FkUGFnZSgxKTtcbiAgICAgIH07XG4gICAgICAkc2NvcGUuc29ydEJ5Q29sdW1uID0gZnVuY3Rpb24gKGNvbHVtbikge1xuICAgICAgICBpZiAoY29sdW1uLnNvcnRLZXkpIHtcbiAgICAgICAgICBpZiAoY29sdW1uLnNvcnRLZXkgIT09ICRzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5wcmVkaWNhdGUgPSBjb2x1bW4uc29ydEtleTtcbiAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5yZXZlcnNlID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgJHNjb3BlLmxvYWRQYWdlKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLnVuU29ydFRhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUubG9jYWxDb25maWcucmV2ZXJzZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9IHVuZGVmaW5lZDtcbiAgICAgIH07XG4gICAgICAkc2NvcGUub25EcmFnU3RhcnQgPSBmdW5jdGlvbiAoZGF0YSwgZHJhZ0VsZW1lbnQpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGRyYWdFbGVtZW50LnBhcmVudCgpO1xuICAgICAgICBwbGFjZUhvbGRlciA9ICQoJzx0cj48dGQgY29sc3Bhbj0nICsgZHJhZ0VsZW1lbnQuZmluZCgndGQnKS5sZW5ndGggKyAnPiZuYnNwOzwvdGQ+PC90cj4nKTtcbiAgICAgICAgaW5pdGlhbFBvcyA9IGRyYWdFbGVtZW50LmluZGV4KCkgKyAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAtIDEpICogJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSAtIDE7XG4gICAgICAgIGlmIChkcmFnRWxlbWVudFswXSAhPT0gcGFyZW50LmNoaWxkcmVuKCkubGFzdCgpWzBdKSB7XG4gICAgICAgICAgZHJhZ0VsZW1lbnQubmV4dCgpLmJlZm9yZShwbGFjZUhvbGRlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFyZW50LmFwcGVuZChwbGFjZUhvbGRlcik7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUub25EcmFnRW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBwbGFjZUhvbGRlci5yZW1vdmUoKTtcbiAgICAgIH07XG4gICAgICAkc2NvcGUub25EcmFnT3ZlciA9IGZ1bmN0aW9uIChkYXRhLCBkcmFnRWxlbWVudCwgZHJvcEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHBsYWNlSG9sZGVyKSB7XG4gICAgICAgICAgLy8gUmVzdHJpY3RzIHZhbGlkIGRyYWcgdG8gY3VycmVudCB0YWJsZSBpbnN0YW5jZVxuICAgICAgICAgIG1vdmVFbGVtZW50Tm9kZShwbGFjZUhvbGRlciwgZHJvcEVsZW1lbnQsIGRyYWdFbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5vbkRyb3BFbmQgPSBmdW5jdGlvbiAoZGF0YSwgZHJhZ0VsZW1lbnQpIHtcbiAgICAgICAgdmFyIGVuZFBvcztcbiAgICAgICAgaWYgKHBsYWNlSG9sZGVyKSB7XG4gICAgICAgICAgLy8gUmVzdHJpY3RzIGRyb3AgdG8gY3VycmVudCB0YWJsZSBpbnN0YW5jZVxuICAgICAgICAgIGlmIChwbGFjZUhvbGRlci5uZXh0KClbMF0pIHtcbiAgICAgICAgICAgIHBsYWNlSG9sZGVyLm5leHQoKS5iZWZvcmUoZHJhZ0VsZW1lbnQpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGxhY2VIb2xkZXIucHJldigpWzBdKSB7XG4gICAgICAgICAgICBwbGFjZUhvbGRlci5wcmV2KCkuYWZ0ZXIoZHJhZ0VsZW1lbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwbGFjZUhvbGRlci5yZW1vdmUoKTtcbiAgICAgICAgICB2YWxpZERyb3AgPSB0cnVlO1xuICAgICAgICAgIGVuZFBvcyA9IGRyYWdFbGVtZW50LmluZGV4KCkgKyAoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSAtIDEpICogJHNjb3BlLml0ZW1zLnBhZ2luZy5wYWdlU2l6ZSAtIDE7XG4gICAgICAgICAgYWRTdHJhcFV0aWxzLm1vdmVJdGVtSW5MaXN0KGluaXRpYWxQb3MsIGVuZFBvcywgJHNjb3BlLmxvY2FsQ29uZmlnLmxvY2FsRGF0YSk7XG4gICAgICAgICAgJHNjb3BlLnVuU29ydFRhYmxlKCk7XG4gICAgICAgICAgaWYgKCRzY29wZS5sb2NhbENvbmZpZy5kcmFnQ2hhbmdlKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9jYWxDb25maWcuZHJhZ0NoYW5nZShpbml0aWFsUG9zLCBlbmRQb3MsIGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocGFnZUJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgICBwYWdlQnV0dG9uRWxlbWVudC5yZW1vdmVDbGFzcygnYnRuLXByaW1hcnknKTtcbiAgICAgICAgICBwYWdlQnV0dG9uRWxlbWVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUub25OZXh0UGFnZUJ1dHRvbk92ZXIgPSBmdW5jdGlvbiAoZGF0YSwgZHJhZ0VsZW1lbnQsIGRyb3BFbGVtZW50KSB7XG4gICAgICAgIGlmIChwYWdlQnV0dG9uRWxlbWVudCkge1xuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50LnJlbW92ZUNsYXNzKCdidG4tcHJpbWFyeScpO1xuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZHJvcEVsZW1lbnQuYXR0cignZGlzYWJsZWQnKSAhPT0gJ2Rpc2FibGVkJykge1xuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50ID0gZHJvcEVsZW1lbnQ7XG4gICAgICAgICAgcGFnZUJ1dHRvbkVsZW1lbnQuYWRkQ2xhc3MoJ2J0bi1wcmltYXJ5Jyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUub25OZXh0UGFnZUJ1dHRvbkRyb3AgPSBmdW5jdGlvbiAoZGF0YSwgZHJhZ0VsZW1lbnQpIHtcbiAgICAgICAgdmFyIGVuZFBvcztcbiAgICAgICAgaWYgKHBhZ2VCdXR0b25FbGVtZW50KSB7XG4gICAgICAgICAgdmFsaWREcm9wID0gdHJ1ZTtcbiAgICAgICAgICBpZiAocGFnZUJ1dHRvbkVsZW1lbnQuYXR0cignaWQnKSA9PT0gJ2J0blByZXYnKSB7XG4gICAgICAgICAgICBlbmRQb3MgPSAkc2NvcGUuaXRlbXMucGFnaW5nLnBhZ2VTaXplICogKCRzY29wZS5pdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgLSAxKSAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwYWdlQnV0dG9uRWxlbWVudC5hdHRyKCdpZCcpID09PSAnYnRuTmV4dCcpIHtcbiAgICAgICAgICAgIGVuZFBvcyA9ICRzY29wZS5pdGVtcy5wYWdpbmcucGFnZVNpemUgKiAkc2NvcGUuaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhZFN0cmFwVXRpbHMubW92ZUl0ZW1Jbkxpc3QoaW5pdGlhbFBvcywgZW5kUG9zLCAkc2NvcGUubG9jYWxDb25maWcubG9jYWxEYXRhKTtcbiAgICAgICAgICBwbGFjZUhvbGRlci5yZW1vdmUoKTtcbiAgICAgICAgICBkcmFnRWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICBpZiAoJHNjb3BlLmxvY2FsQ29uZmlnLmRyYWdDaGFuZ2UpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2NhbENvbmZpZy5kcmFnQ2hhbmdlKGluaXRpYWxQb3MsIGVuZFBvcywgZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50LnJlbW92ZUNsYXNzKCdidG4tcHJpbWFyeScpO1xuICAgICAgICAgIHBhZ2VCdXR0b25FbGVtZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gaW5pdGlhbGl6YXRpb24gYW5kIGV2ZW50IGxpc3RlbmVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAkc2NvcGUubG9hZFBhZ2UoMSk7XG4gICAgICAvLyAtLS0tLS0tLS0tIHNldCB3YXRjaGVycyAtLS0tLS0tLS0tIC8vXG4gICAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kd2F0Y2goJGF0dHJzLmxvY2FsRGF0YVNvdXJjZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSk7XG4gICAgICB9KSk7XG4gICAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kd2F0Y2goJGF0dHJzLmxvY2FsRGF0YVNvdXJjZSArICcubGVuZ3RoJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUubG9hZFBhZ2UoJHNjb3BlLml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSk7XG4gICAgICB9KSk7XG4gICAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCRhdHRycy5jb2x1bW5EZWZpbml0aW9uLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5jb2x1bW5EZWZpbml0aW9uID0gJHNjb3BlLiRldmFsKCRhdHRycy5jb2x1bW5EZWZpbml0aW9uKTtcbiAgICAgIH0pKTtcbiAgICAgIC8vIC0tLS0tLS0tLS0gZGlzYWJsZSB3YXRjaGVycyAtLS0tLS0tLS0tIC8vXG4gICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2F0Y2hlcnMuZm9yRWFjaChmdW5jdGlvbiAod2F0Y2hlcikge1xuICAgICAgICAgIHdhdGNoZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICBjb250cm9sbGVyOiBbXG4gICAgICAgICckc2NvcGUnLFxuICAgICAgICAnJGF0dHJzJyxcbiAgICAgICAgY29udHJvbGxlckZ1bmN0aW9uXG4gICAgICBdLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0YWJsZWxpdGUvdGFibGVsaXRlLnRwbC5odG1sJyxcbiAgICAgIHNjb3BlOiB0cnVlXG4gICAgfTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogdHJlZWJyb3dzZXIuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC50cmVlYnJvd3NlcicsIFtdKS5kaXJlY3RpdmUoJ2FkVHJlZUJyb3dzZXInLCBbXG4gICckYWRDb25maWcnLFxuICBmdW5jdGlvbiAoJGFkQ29uZmlnKSB7XG4gICAgZnVuY3Rpb24gY29udHJvbGxlckZ1bmN0aW9uKCRzY29wZSwgJGF0dHJzKSB7XG4gICAgICB2YXIgdGVtcGxhdGVUb2tlbiA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAvLyBzY29wZSBpbml0aWFsaXphdGlvblxuICAgICAgJHNjb3BlLmF0dHJzID0gJGF0dHJzO1xuICAgICAgJHNjb3BlLmljb25DbGFzc2VzID0gJGFkQ29uZmlnLmljb25DbGFzc2VzO1xuICAgICAgJHNjb3BlLnRyZWVSb290ID0gJHNjb3BlLiRldmFsKCRhdHRycy50cmVlUm9vdCkgfHwge307XG4gICAgICAkc2NvcGUudG9nZ2xlID0gZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XG4gICAgICAgIHZhciB0b2dnbGVDYWxsYmFjaztcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRvZ2dsZUNhbGxiYWNrID0gJHNjb3BlLiRldmFsKCRhdHRycy50b2dnbGVDYWxsYmFjayk7XG4gICAgICAgIGlmICh0b2dnbGVDYWxsYmFjaykge1xuICAgICAgICAgIHRvZ2dsZUNhbGxiYWNrKGl0ZW0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uX2FkX2V4cGFuZGVkID0gIWl0ZW0uX2FkX2V4cGFuZGVkO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdmFyIGhhc0NoaWxkcmVuID0gJHNjb3BlLiRldmFsKCRhdHRycy5oYXNDaGlsZHJlbik7XG4gICAgICAkc2NvcGUuaGFzQ2hpbGRyZW4gPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICB2YXIgZm91bmQgPSBpdGVtWyRhdHRycy5jaGlsZE5vZGVdICYmIGl0ZW1bJGF0dHJzLmNoaWxkTm9kZV0ubGVuZ3RoID4gMDtcbiAgICAgICAgaWYgKGhhc0NoaWxkcmVuKSB7XG4gICAgICAgICAgZm91bmQgPSBoYXNDaGlsZHJlbihpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICB9O1xuICAgICAgLy8gZm9yIHVuaXF1ZSB0ZW1wbGF0ZVxuICAgICAgJHNjb3BlLmxvY2FsQ29uZmlnID0geyByZW5kZXJlclRlbXBsYXRlSWQ6ICd0cmVlLXJlbmRlcmVyLScgKyB0ZW1wbGF0ZVRva2VuICsgJy5odG1sJyB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHNjb3BlOiB0cnVlLFxuICAgICAgY29udHJvbGxlcjogW1xuICAgICAgICAnJHNjb3BlJyxcbiAgICAgICAgJyRhdHRycycsXG4gICAgICAgIGNvbnRyb2xsZXJGdW5jdGlvblxuICAgICAgXSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndHJlZWJyb3dzZXIvdHJlZWJyb3dzZXIudHBsLmh0bWwnXG4gICAgfTtcbiAgfVxuXSk7XG5cbi8vIFNvdXJjZTogdXRpbHMuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC51dGlscycsIFtdKS5mYWN0b3J5KCdhZFN0cmFwVXRpbHMnLCBbXG4gICckZmlsdGVyJyxcbiAgZnVuY3Rpb24gKCRmaWx0ZXIpIHtcbiAgICB2YXIgZXZhbE9iamVjdFByb3BlcnR5ID0gZnVuY3Rpb24gKG9iaiwgcHJvcGVydHkpIHtcbiAgICAgICAgdmFyIGFyciA9IHByb3BlcnR5LnNwbGl0KCcuJyk7XG4gICAgICAgIGlmIChvYmopIHtcbiAgICAgICAgICB3aGlsZSAoYXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIGtleSA9IGFyci5zaGlmdCgpO1xuICAgICAgICAgICAgaWYgKG9iaikge1xuICAgICAgICAgICAgICBvYmogPSBvYmpba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH0sIGFwcGx5RmlsdGVyID0gZnVuY3Rpb24gKHZhbHVlLCBmaWx0ZXIsIGl0ZW0pIHtcbiAgICAgICAgdmFyIHBhcnRzLCBmaWx0ZXJPcHRpb25zO1xuICAgICAgICBpZiAodmFsdWUgJiYgJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXIpIHtcbiAgICAgICAgICBwYXJ0cyA9IGZpbHRlci5zcGxpdCgnOicpO1xuICAgICAgICAgIGZpbHRlck9wdGlvbnMgPSBwYXJ0c1sxXTtcbiAgICAgICAgICBpZiAoZmlsdGVyT3B0aW9ucykge1xuICAgICAgICAgICAgdmFsdWUgPSAkZmlsdGVyKHBhcnRzWzBdKSh2YWx1ZSwgZmlsdGVyT3B0aW9ucyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gJGZpbHRlcihwYXJ0c1swXSkodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9LCBpdGVtRXhpc3RzSW5MaXN0ID0gZnVuY3Rpb24gKGNvbXBhcmVJdGVtLCBsaXN0KSB7XG4gICAgICAgIHZhciBleGlzdCA9IGZhbHNlO1xuICAgICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci5lcXVhbHMoY29tcGFyZUl0ZW0sIGl0ZW0pKSB7XG4gICAgICAgICAgICBleGlzdCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGV4aXN0O1xuICAgICAgfSwgaXRlbXNFeGlzdEluTGlzdCA9IGZ1bmN0aW9uIChpdGVtcywgbGlzdCkge1xuICAgICAgICB2YXIgZXhpc3QgPSB0cnVlLCBpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoaXRlbUV4aXN0c0luTGlzdChpdGVtc1tpXSwgbGlzdCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBleGlzdCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBleGlzdDtcbiAgICAgIH0sIGFkZEl0ZW1Ub0xpc3QgPSBmdW5jdGlvbiAoaXRlbSwgbGlzdCkge1xuICAgICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgICB9LCByZW1vdmVJdGVtRnJvbUxpc3QgPSBmdW5jdGlvbiAoaXRlbSwgbGlzdCkge1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgZm9yIChpID0gbGlzdC5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyhpdGVtLCBsaXN0W2ldKSkge1xuICAgICAgICAgICAgbGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBhZGRSZW1vdmVJdGVtRnJvbUxpc3QgPSBmdW5jdGlvbiAoaXRlbSwgbGlzdCkge1xuICAgICAgICB2YXIgaSwgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgZm9yIChpID0gbGlzdC5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmVxdWFscyhpdGVtLCBsaXN0W2ldKSkge1xuICAgICAgICAgICAgbGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChmb3VuZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0sIGFkZEl0ZW1zVG9MaXN0ID0gZnVuY3Rpb24gKGl0ZW1zLCBsaXN0KSB7XG4gICAgICAgIGl0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICBpZiAoIWl0ZW1FeGlzdHNJbkxpc3QoaXRlbSwgbGlzdCkpIHtcbiAgICAgICAgICAgIGFkZFJlbW92ZUl0ZW1Gcm9tTGlzdChpdGVtLCBsaXN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSwgYWRkUmVtb3ZlSXRlbXNGcm9tTGlzdCA9IGZ1bmN0aW9uIChpdGVtcywgbGlzdCkge1xuICAgICAgICBpZiAoaXRlbXNFeGlzdEluTGlzdChpdGVtcywgbGlzdCkpIHtcbiAgICAgICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWRkSXRlbXNUb0xpc3QoaXRlbXMsIGxpc3QpO1xuICAgICAgICB9XG4gICAgICB9LCBtb3ZlSXRlbUluTGlzdCA9IGZ1bmN0aW9uIChzdGFydFBvcywgZW5kUG9zLCBsaXN0KSB7XG4gICAgICAgIGlmIChlbmRQb3MgPCBsaXN0Lmxlbmd0aCkge1xuICAgICAgICAgIGxpc3Quc3BsaWNlKGVuZFBvcywgMCwgbGlzdC5zcGxpY2Uoc3RhcnRQb3MsIDEpWzBdKTtcbiAgICAgICAgfVxuICAgICAgfSwgcGFyc2UgPSBmdW5jdGlvbiAoaXRlbXMpIHtcbiAgICAgICAgdmFyIGl0ZW1zT2JqZWN0ID0gW107XG4gICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkoaXRlbXMpKSB7XG4gICAgICAgICAgaXRlbXNPYmplY3QgPSBpdGVtcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goaXRlbXMsIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICBpdGVtc09iamVjdC5wdXNoKGl0ZW0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtc09iamVjdDtcbiAgICAgIH0sIGdldE9iamVjdFByb3BlcnR5ID0gZnVuY3Rpb24gKGl0ZW0sIHByb3BlcnR5KSB7XG4gICAgICAgIGlmIChwcm9wZXJ0eSAmJiAnZnVuY3Rpb24nID09PSB0eXBlb2YgcHJvcGVydHkpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcGVydHkoaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFyciA9IHByb3BlcnR5LnNwbGl0KCcuJyk7XG4gICAgICAgIHdoaWxlIChhcnIubGVuZ3RoKSB7XG4gICAgICAgICAgaXRlbSA9IGl0ZW1bYXJyLnNoaWZ0KCldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgZXZhbE9iamVjdFByb3BlcnR5OiBldmFsT2JqZWN0UHJvcGVydHksXG4gICAgICBhcHBseUZpbHRlcjogYXBwbHlGaWx0ZXIsXG4gICAgICBpdGVtRXhpc3RzSW5MaXN0OiBpdGVtRXhpc3RzSW5MaXN0LFxuICAgICAgaXRlbXNFeGlzdEluTGlzdDogaXRlbXNFeGlzdEluTGlzdCxcbiAgICAgIGFkZEl0ZW1Ub0xpc3Q6IGFkZEl0ZW1Ub0xpc3QsXG4gICAgICByZW1vdmVJdGVtRnJvbUxpc3Q6IHJlbW92ZUl0ZW1Gcm9tTGlzdCxcbiAgICAgIGFkZFJlbW92ZUl0ZW1Gcm9tTGlzdDogYWRkUmVtb3ZlSXRlbUZyb21MaXN0LFxuICAgICAgYWRkSXRlbXNUb0xpc3Q6IGFkZEl0ZW1zVG9MaXN0LFxuICAgICAgYWRkUmVtb3ZlSXRlbXNGcm9tTGlzdDogYWRkUmVtb3ZlSXRlbXNGcm9tTGlzdCxcbiAgICAgIG1vdmVJdGVtSW5MaXN0OiBtb3ZlSXRlbUluTGlzdCxcbiAgICAgIHBhcnNlOiBwYXJzZSxcbiAgICAgIGdldE9iamVjdFByb3BlcnR5OiBnZXRPYmplY3RQcm9wZXJ0eVxuICAgIH07XG4gIH1cbl0pLmZhY3RvcnkoJ2FkRGVib3VuY2UnLCBbXG4gICckdGltZW91dCcsXG4gICckcScsXG4gIGZ1bmN0aW9uICgkdGltZW91dCwgJHEpIHtcbnZhciBkZWIgPSBmdW5jdGlvbiAoZnVuYywgZGVsYXksIGltbWVkaWF0ZSwgY3R4KSB7XG4gICAgICB2YXIgdGltZXIgPSBudWxsLCBkZWZlcnJlZCA9ICRxLmRlZmVyKCksIHdhaXQgPSBkZWxheSB8fCAzMDA7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY29udGV4dCA9IGN0eCB8fCB0aGlzLCBhcmdzID0gYXJndW1lbnRzLCBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lciwgbGF0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncykpO1xuICAgICAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aW1lciA9ICR0aW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncykpO1xuICAgICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgIH07XG4gICAgfTtcbiAgICByZXR1cm4gZGViO1xuICB9XG5dKS5kaXJlY3RpdmUoJ2FkQ29tcGlsZVRlbXBsYXRlJywgW1xuICAnJGNvbXBpbGUnLFxuICBmdW5jdGlvbiAoJGNvbXBpbGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgc2NvcGUuJHdhdGNoKGZ1bmN0aW9uIChzY29wZSkge1xuICAgICAgICByZXR1cm4gc2NvcGUuJGV2YWwoYXR0cnMuYWRDb21waWxlVGVtcGxhdGUpO1xuICAgICAgfSwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGVsZW1lbnQuaHRtbCh2YWx1ZSk7XG4gICAgICAgICRjb21waWxlKGVsZW1lbnQuY29udGVudHMoKSkoc2NvcGUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXSkuZmFjdG9yeSgnYWRMb2FkUGFnZScsIFtcbiAgJyRhZENvbmZpZycsXG4gICckaHR0cCcsXG4gICdhZFN0cmFwVXRpbHMnLFxuICBmdW5jdGlvbiAoJGFkQ29uZmlnLCAkaHR0cCwgYWRTdHJhcFV0aWxzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICB2YXIgc3RhcnQgPSAob3B0aW9ucy5wYWdlTnVtYmVyIC0gMSkgKiBvcHRpb25zLnBhZ2VTaXplLCBwYWdpbmdDb25maWcgPSBhbmd1bGFyLmNvcHkoJGFkQ29uZmlnLnBhZ2luZyksIGFqYXhDb25maWcgPSBhbmd1bGFyLmNvcHkob3B0aW9ucy5hamF4Q29uZmlnKTtcbiAgICAgIGlmIChhamF4Q29uZmlnLnBhZ2luYXRpb25Db25maWcgJiYgYWpheENvbmZpZy5wYWdpbmF0aW9uQ29uZmlnLnJlcXVlc3QpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQocGFnaW5nQ29uZmlnLnJlcXVlc3QsIGFqYXhDb25maWcucGFnaW5hdGlvbkNvbmZpZy5yZXF1ZXN0KTtcbiAgICAgIH1cbiAgICAgIGlmIChhamF4Q29uZmlnLnBhZ2luYXRpb25Db25maWcgJiYgYWpheENvbmZpZy5wYWdpbmF0aW9uQ29uZmlnLnJlc3BvbnNlKSB7XG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHBhZ2luZ0NvbmZpZy5yZXNwb25zZSwgYWpheENvbmZpZy5wYWdpbmF0aW9uQ29uZmlnLnJlc3BvbnNlKTtcbiAgICAgIH1cbiAgICAgIGFqYXhDb25maWcucGFyYW1zID0gYWpheENvbmZpZy5wYXJhbXMgPyBhamF4Q29uZmlnLnBhcmFtcyA6IHt9O1xuICAgICAgYWpheENvbmZpZy5wYXJhbXNbcGFnaW5nQ29uZmlnLnJlcXVlc3Quc3RhcnRdID0gc3RhcnQ7XG4gICAgICBhamF4Q29uZmlnLnBhcmFtc1twYWdpbmdDb25maWcucmVxdWVzdC5wYWdlU2l6ZV0gPSBvcHRpb25zLnBhZ2VTaXplO1xuICAgICAgYWpheENvbmZpZy5wYXJhbXNbcGFnaW5nQ29uZmlnLnJlcXVlc3QucGFnZV0gPSBvcHRpb25zLnBhZ2VOdW1iZXI7XG4gICAgICBpZiAob3B0aW9ucy5zb3J0S2V5KSB7XG4gICAgICAgIGFqYXhDb25maWcucGFyYW1zW3BhZ2luZ0NvbmZpZy5yZXF1ZXN0LnNvcnRGaWVsZF0gPSBvcHRpb25zLnNvcnRLZXk7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5zb3J0RGlyZWN0aW9uID09PSBmYWxzZSkge1xuICAgICAgICBhamF4Q29uZmlnLnBhcmFtc1twYWdpbmdDb25maWcucmVxdWVzdC5zb3J0RGlyZWN0aW9uXSA9IHBhZ2luZ0NvbmZpZy5yZXF1ZXN0LnNvcnRBc2NWYWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5zb3J0RGlyZWN0aW9uID09PSB0cnVlKSB7XG4gICAgICAgIGFqYXhDb25maWcucGFyYW1zW3BhZ2luZ0NvbmZpZy5yZXF1ZXN0LnNvcnREaXJlY3Rpb25dID0gcGFnaW5nQ29uZmlnLnJlcXVlc3Quc29ydERlc2NWYWx1ZTtcbiAgICAgIH1cbiAgICAgIHZhciBwcm9taXNlO1xuICAgICAgaWYgKGFqYXhDb25maWcubWV0aG9kID09PSAnSlNPTlAnKSB7XG4gICAgICAgIHByb21pc2UgPSAkaHR0cC5qc29ucChhamF4Q29uZmlnLnVybCArICc/Y2FsbGJhY2s9SlNPTl9DQUxMQkFDSycsIGFqYXhDb25maWcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbWlzZSA9ICRodHRwKGFqYXhDb25maWcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgICAgIGl0ZW1zOiBhZFN0cmFwVXRpbHMuZXZhbE9iamVjdFByb3BlcnR5KHJlc3VsdC5kYXRhLCBwYWdpbmdDb25maWcucmVzcG9uc2UuaXRlbXNMb2NhdGlvbiksXG4gICAgICAgICAgICBjdXJyZW50UGFnZTogb3B0aW9ucy5wYWdlTnVtYmVyLFxuICAgICAgICAgICAgdG90YWxQYWdlczogTWF0aC5jZWlsKGFkU3RyYXBVdGlscy5ldmFsT2JqZWN0UHJvcGVydHkocmVzdWx0LmRhdGEsIHBhZ2luZ0NvbmZpZy5yZXNwb25zZS50b3RhbEl0ZW1zKSAvIG9wdGlvbnMucGFnZVNpemUpLFxuICAgICAgICAgICAgcGFnaW5nQXJyYXk6IFtdLFxuICAgICAgICAgICAgdG9rZW46IG9wdGlvbnMudG9rZW5cbiAgICAgICAgICB9O1xuICAgICAgICB2YXIgVE9UQUxfUEFHSU5BVElPTl9JVEVNUyA9IDU7XG4gICAgICAgIHZhciBtaW5pbXVtQm91bmQgPSBvcHRpb25zLnBhZ2VOdW1iZXIgLSBNYXRoLmZsb29yKFRPVEFMX1BBR0lOQVRJT05fSVRFTVMgLyAyKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IG1pbmltdW1Cb3VuZDsgaSA8PSBvcHRpb25zLnBhZ2VOdW1iZXI7IGkrKykge1xuICAgICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgcmVzcG9uc2UucGFnaW5nQXJyYXkucHVzaChpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHJlc3BvbnNlLnBhZ2luZ0FycmF5Lmxlbmd0aCA8IFRPVEFMX1BBR0lOQVRJT05fSVRFTVMpIHtcbiAgICAgICAgICBpZiAoaSA+IHJlc3BvbnNlLnRvdGFsUGFnZXMpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXNwb25zZS5wYWdpbmdBcnJheS5wdXNoKGkpO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5dKS5mYWN0b3J5KCdhZExvYWRMb2NhbFBhZ2UnLCBbXG4gICckZmlsdGVyJyxcbiAgZnVuY3Rpb24gKCRmaWx0ZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgICBpdGVtczogdW5kZWZpbmVkLFxuICAgICAgICAgIGN1cnJlbnRQYWdlOiBvcHRpb25zLnBhZ2VOdW1iZXIsXG4gICAgICAgICAgdG90YWxQYWdlczogdW5kZWZpbmVkLFxuICAgICAgICAgIHBhZ2luZ0FycmF5OiBbXSxcbiAgICAgICAgICB0b2tlbjogb3B0aW9ucy50b2tlblxuICAgICAgICB9O1xuICAgICAgdmFyIHN0YXJ0ID0gKG9wdGlvbnMucGFnZU51bWJlciAtIDEpICogb3B0aW9ucy5wYWdlU2l6ZSwgZW5kID0gc3RhcnQgKyBvcHRpb25zLnBhZ2VTaXplLCBpLCBpdGVtc09iamVjdCA9IG9wdGlvbnMubG9jYWxEYXRhLCBsb2NhbEl0ZW1zO1xuICAgICAgbG9jYWxJdGVtcyA9ICRmaWx0ZXIoJ29yZGVyQnknKShpdGVtc09iamVjdCwgb3B0aW9ucy5zb3J0S2V5LCBvcHRpb25zLnNvcnREaXJlY3Rpb24pO1xuICAgICAgcmVzcG9uc2UuaXRlbXMgPSBsb2NhbEl0ZW1zLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgICAgcmVzcG9uc2UuYWxsSXRlbXMgPSBpdGVtc09iamVjdDtcbiAgICAgIHJlc3BvbnNlLmN1cnJlbnRQYWdlID0gb3B0aW9ucy5wYWdlTnVtYmVyO1xuICAgICAgcmVzcG9uc2UudG90YWxQYWdlcyA9IE1hdGguY2VpbChpdGVtc09iamVjdC5sZW5ndGggLyBvcHRpb25zLnBhZ2VTaXplKTtcbiAgICAgIHZhciBUT1RBTF9QQUdJTkFUSU9OX0lURU1TID0gNTtcbiAgICAgIHZhciBtaW5pbXVtQm91bmQgPSBvcHRpb25zLnBhZ2VOdW1iZXIgLSBNYXRoLmZsb29yKFRPVEFMX1BBR0lOQVRJT05fSVRFTVMgLyAyKTtcbiAgICAgIGZvciAoaSA9IG1pbmltdW1Cb3VuZDsgaSA8PSBvcHRpb25zLnBhZ2VOdW1iZXI7IGkrKykge1xuICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICByZXNwb25zZS5wYWdpbmdBcnJheS5wdXNoKGkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAocmVzcG9uc2UucGFnaW5nQXJyYXkubGVuZ3RoIDwgVE9UQUxfUEFHSU5BVElPTl9JVEVNUykge1xuICAgICAgICBpZiAoaSA+IHJlc3BvbnNlLnRvdGFsUGFnZXMpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXNwb25zZS5wYWdpbmdBcnJheS5wdXNoKGkpO1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfTtcbiAgfVxuXSk7XG5cbn0pKHdpbmRvdywgZG9jdW1lbnQpO1xuIiwiLyoqXG4gKiBhZGFwdC1zdHJhcFxuICogQHZlcnNpb24gdjIuMC42IC0gMjAxNC0xMC0yNlxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL0FkYXB0di9hZGFwdC1zdHJhcFxuICogQGF1dGhvciBLYXNoeWFwIFBhdGVsIChrYXNoeWFwQGFkYXAudHYpXG4gKiBAbGljZW5zZSBNSVQgTGljZW5zZSwgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyBTb3VyY2U6IGluZmluaXRlZHJvcGRvd24udHBsLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAuaW5maW5pdGVkcm9wZG93bicpLnJ1bihbXG4gICckdGVtcGxhdGVDYWNoZScsXG4gIGZ1bmN0aW9uICgkdGVtcGxhdGVDYWNoZSkge1xuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnaW5maW5pdGVkcm9wZG93bi9pbmZpbml0ZWRyb3Bkb3duLnRwbC5odG1sJywgJzxkaXYgY2xhc3M9XCJhZC1pbmZpbml0ZS1saXN0LWNvbnRhaW5lclwiPjxkaXYgY2xhc3M9XCJkcm9wZG93blwiPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZHJvcGRvd24tdG9nZ2xlXCIgbmctY2xhc3M9XCJhdHRycy5idG5DbGFzc2VzIHx8IFxcJ2J0biBidG4tZGVmYXVsdFxcJ1wiIGRhdGEtdG9nZ2xlPVwiZHJvcGRvd25cIj48c3BhbiBuZy1pZj1cIiFhdHRycy5sYWJlbERpc3BsYXlQcm9wZXJ0eSB8fCAhc2VsZWN0ZWRJdGVtcy5sZW5ndGhcIj57eyBhdHRycy5pbml0aWFsTGFiZWwgfHwgXFwnU2VsZWN0XFwnIH19PC9zcGFuPiA8c3BhbiBuZy1pZj1cImF0dHJzLmxhYmVsRGlzcGxheVByb3BlcnR5ICYmIHNlbGVjdGVkSXRlbXMubGVuZ3RoXCI+e3sgcmVhZFByb3BlcnR5KHNlbGVjdGVkSXRlbXNbc2VsZWN0ZWRJdGVtcy5sZW5ndGggLSAxXSwgYXR0cnMubGFiZWxEaXNwbGF5UHJvcGVydHkpIH19PC9zcGFuPiA8c3BhbiBjbGFzcz1cImNhcmV0XCI+PC9zcGFuPjwvYnV0dG9uPjx1bCBjbGFzcz1cImRyb3Bkb3duLW1lbnVcIiByb2xlPVwibWVudVwiIG5nLXN0eWxlPVwibG9jYWxDb25maWcuZGltZW5zaW9uc1wiPjxsaSBjbGFzcz1cInRleHQtb3ZlcmZsb3dcIiBkYXRhLW5nLXJlcGVhdD1cIml0ZW0gaW4gaXRlbXMubGlzdFwiIG5nLWNsYXNzPVwie1xcJ2FjdGl2ZVxcJzogYWRTdHJhcFV0aWxzLml0ZW1FeGlzdHNJbkxpc3QoaXRlbSwgc2VsZWN0ZWRJdGVtcyl9XCIgbmctY2xpY2s9XCJhZGRSZW1vdmVJdGVtKCRldmVudCwgaXRlbSwgc2VsZWN0ZWRJdGVtcylcIj48YSByb2xlPVwibWVudWl0ZW1cIiB0YWJpbmRleD1cIi0xXCIgaHJlZj1cIlwiPjxzcGFuIG5nLWlmPVwiYXR0cnMuZGlzcGxheVByb3BlcnR5XCI+e3sgYWRTdHJhcFV0aWxzLmdldE9iamVjdFByb3BlcnR5KGl0ZW0sIGF0dHJzLmRpc3BsYXlQcm9wZXJ0eSkgfX08L3NwYW4+IDxzcGFuIG5nLWlmPVwiYXR0cnMudGVtcGxhdGVcIiBhZC1jb21waWxlLXRlbXBsYXRlPVwie3sgYXR0cnMudGVtcGxhdGUgfX1cIj48L3NwYW4+IDxzcGFuIG5nLWlmPVwiYXR0cnMudGVtcGxhdGVVcmxcIiBuZy1pbmNsdWRlPVwiYXR0cnMudGVtcGxhdGVVcmxcIj48L3NwYW4+PC9hPjwvbGk+PGxpIGNsYXNzPVwidGV4dC1vdmVyZmxvdyB0ZXh0LWNlbnRlclwiIG5nLXN0eWxlPVwie1xcJ29wYWNpdHlcXCc6IGxvY2FsQ29uZmlnLmxvYWRpbmdEYXRhID8gMSA6IDB9XCI+PGEgcm9sZT1cIm1lbnVpdGVtXCIgdGFiaW5kZXg9XCItMVwiIGhyZWY9XCJcIj48YWQtbG9hZGluZy1pY29uPjwvYWQtbG9hZGluZy1pY29uPjwvYT48L2xpPjwvdWw+PC9kaXY+PC9kaXY+Jyk7XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IGxvYWRpbmdpbmRpY2F0b3IudHBsLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAubG9hZGluZ2luZGljYXRvcicpLnJ1bihbXG4gICckdGVtcGxhdGVDYWNoZScsXG4gIGZ1bmN0aW9uICgkdGVtcGxhdGVDYWNoZSkge1xuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnbG9hZGluZ2luZGljYXRvci9sb2FkaW5naW5kaWNhdG9yLnRwbC5odG1sJywgJzxkaXYgY2xhc3M9XCJhZC1sb2FkaW5nLW92ZXJsYXktY29udGFpbmVyXCIgbmctY2xhc3M9XCJjb250YWluZXJDbGFzc2VzXCIgbmctc3R5bGU9XCJ7XFwnei1pbmRleFxcJzogekluZGV4IHx8IFxcJzEwMDBcXCcsXFwncG9zaXRpb25cXCc6IHBvc2l0aW9uIHx8IFxcJ2Fic29sdXRlXFwnfVwiIG5nLXNob3c9XCJsb2FkaW5nXCI+PGRpdiBjbGFzcz1cIndyYXBwZXJcIj48ZGl2IGNsYXNzPVwibG9hZGluZy1pbmRpY2F0b3JcIj48YWQtbG9hZGluZy1pY29uIGxvYWRpbmctaWNvbi1zaXplPVwie3sgbG9hZGluZ0ljb25TaXplIH19XCIgbG9hZGluZy1pY29uLWNsYXNzPVwie3sgbG9hZGluZ0ljb25DbGFzcyB9fVwiPjwvYWQtbG9hZGluZy1pY29uPjwvZGl2PjwvZGl2PjwvZGl2PicpO1xuICB9XG5dKTtcblxuLy8gU291cmNlOiB0YWJsZWFqYXgudHBsLmpzXG5hbmd1bGFyLm1vZHVsZSgnYWRhcHR2LmFkYXB0U3RyYXAudGFibGVhamF4JykucnVuKFtcbiAgJyR0ZW1wbGF0ZUNhY2hlJyxcbiAgZnVuY3Rpb24gKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCd0YWJsZWFqYXgvdGFibGVhamF4LnRwbC5odG1sJywgJzxkaXYgY2xhc3M9XCJhZC10YWJsZS1hamF4LWNvbnRhaW5lclwiIG5nLWlmPVwiaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMgfHwgbG9jYWxDb25maWcubG9hZGluZ0RhdGEgfHwgIWF0dHJzLml0ZW1zTm90Rm91bmRNZXNzYWdlXCI+PHRhYmxlIGNsYXNzPVwiYWQtc3RpY2t5LXRhYmxlXCIgbmctY2xhc3M9XCJhdHRycy50YWJsZUNsYXNzZXMgfHwgXFwndGFibGVcXCdcIiBuZy1pZj1cImxvY2FsQ29uZmlnLnRhYmxlTWF4SGVpZ2h0XCI+PHRyIGNsYXNzPVwiYWQtdXNlci1zZWxlY3Qtbm9uZVwiPjx0aCBkYXRhLW5nLXJlcGVhdD1cImRlZmluaXRpb24gaW4gY29sdW1uRGVmaW5pdGlvblwiIG5nLWNsaWNrPVwic29ydEJ5Q29sdW1uKGRlZmluaXRpb24pXCIgbmctY2xhc3M9XCJ7XFwnYWQtY3Vyc29yLXBvaW50ZXJcXCc6IGRlZmluaXRpb24uc29ydEtleX1cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9PSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRBc2NlbmRpbmdcIiBuZy1oaWRlPVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT4gPGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0RGVzY2VuZGluZ1wiIG5nLXNob3c9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPjwvZGl2PjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlICE9IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydGFibGVcIj48L2k+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIiBuZy1iaW5kLWh0bWw9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCI+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIiBuZy1iaW5kPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiPjwvZGl2PjwvdGg+PC90cj48L3RhYmxlPjxkaXYgY2xhc3M9XCJhZC10YWJsZS1jb250YWluZXJcIiBuZy1zdHlsZT1cIntcXCdtYXgtaGVpZ2h0XFwnOiBsb2NhbENvbmZpZy50YWJsZU1heEhlaWdodH1cIj48dGFibGUgbmctY2xhc3M9XCJhdHRycy50YWJsZUNsYXNzZXMgfHwgXFwndGFibGVcXCdcIj48dHIgY2xhc3M9XCJhZC11c2VyLXNlbGVjdC1ub25lXCIgbmctaWY9XCIhbG9jYWxDb25maWcudGFibGVNYXhIZWlnaHRcIj48dGggZGF0YS1uZy1yZXBlYXQ9XCJkZWZpbml0aW9uIGluIGNvbHVtbkRlZmluaXRpb25cIiBuZy1jbGljaz1cInNvcnRCeUNvbHVtbihkZWZpbml0aW9uKVwiIG5nLWNsYXNzPVwie1xcJ2FkLWN1cnNvci1wb2ludGVyXFwnOiBkZWZpbml0aW9uLnNvcnRLZXl9XCIgbmctc3R5bGU9XCJ7XFwnd2lkdGhcXCc6IGRlZmluaXRpb24ud2lkdGh9XCI+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1pZj1cImRlZmluaXRpb24uc29ydEtleSAmJiBsb2NhbENvbmZpZy5wcmVkaWNhdGUgPT0gZGVmaW5pdGlvbi5zb3J0S2V5XCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0QXNjZW5kaW5nXCIgbmctaGlkZT1cImxvY2FsQ29uZmlnLnJldmVyc2VcIj48L2k+IDxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydERlc2NlbmRpbmdcIiBuZy1zaG93PVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT48L2Rpdj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSAhPSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRhYmxlXCI+PC9pPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCIgbmctYmluZC1odG1sPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJUZW1wbGF0ZVwiPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlckRpc3BsYXlOYW1lXCIgbmctYmluZD1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIj48L2Rpdj48L3RoPjwvdHI+PHRyIGRhdGEtbmctcmVwZWF0PVwiaXRlbSBpbiBpdGVtcy5saXN0XCI+PHRkIGRhdGEtbmctcmVwZWF0PVwiZGVmaW5pdGlvbiBpbiBjb2x1bW5EZWZpbml0aW9uXCIgbmctc3R5bGU9XCJ7XFwnd2lkdGhcXCc6IGRlZmluaXRpb24ud2lkdGh9XCI+PGRpdiBuZy1pZj1cImRlZmluaXRpb24udGVtcGxhdGVVcmxcIj48bmctaW5jbHVkZSBzcmM9XCJkZWZpbml0aW9uLnRlbXBsYXRlVXJsXCI+PC9uZy1pbmNsdWRlPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLnRlbXBsYXRlXCI+PHNwYW4gYWQtY29tcGlsZS10ZW1wbGF0ZT1cImRlZmluaXRpb24udGVtcGxhdGVcIj48L3NwYW4+PC9kaXY+PGRpdiBuZy1pZj1cIiFkZWZpbml0aW9uLnRlbXBsYXRlVXJsICYmICFkZWZpbml0aW9uLnRlbXBsYXRlXCI+e3sgYWRTdHJhcFV0aWxzLmFwcGx5RmlsdGVyKGFkU3RyYXBVdGlscy5nZXRPYmplY3RQcm9wZXJ0eShpdGVtLCBkZWZpbml0aW9uLmRpc3BsYXlQcm9wZXJ0eSwgaXRlbSksIGRlZmluaXRpb24uY2VsbEZpbHRlcikgfX08L2Rpdj48L3RkPjwvdHI+PC90YWJsZT48YWQtbG9hZGluZy1vdmVybGF5IGxvYWRpbmc9XCJsb2NhbENvbmZpZy5sb2FkaW5nRGF0YVwiPjwvYWQtbG9hZGluZy1vdmVybGF5PjwvZGl2PjxkaXYgY2xhc3M9XCJyb3dcIj48ZGl2IGNsYXNzPVwiY29sLW1kLTggY29sLXNtLThcIj48ZGl2IGNsYXNzPVwicHVsbC1sZWZ0XCIgbmctY2xhc3M9XCJhdHRycy5wYWdpbmF0aW9uQnRuR3JvdXBDbGFzc2VzIHx8IFxcJ2J0bi1ncm91cCBidG4tZ3JvdXAtc21cXCdcIiBuZy1zaG93PVwiaXRlbXMucGFnaW5nLnRvdGFsUGFnZXMgPiAxXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1jbGljaz1cImxvYWRQYWdlKDEpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gMVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuZmlyc3RQYWdlXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWNsaWNrPVwibG9hZFByZXZpb3VzUGFnZSgpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gMVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMucHJldmlvdXNQYWdlXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLXJlcGVhdD1cInBhZ2UgaW4gbG9jYWxDb25maWcucGFnaW5nQXJyYXlcIiBuZy1jbGFzcz1cInthY3RpdmU6IGl0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSBwYWdlfVwiIG5nLWNsaWNrPVwibG9hZFBhZ2UocGFnZSlcIj57eyBwYWdlIH19PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctY2xpY2s9XCJsb2FkTmV4dFBhZ2UoKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IGl0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5uZXh0UGFnZVwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1jbGljaz1cImxvYWRMYXN0UGFnZSgpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gaXRlbXMucGFnaW5nLnRvdGFsUGFnZXNcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLmxhc3RQYWdlXCI+PC9pPjwvYnV0dG9uPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJjb2wtbWQtNCBjb2wtc20tNFwiPjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctY2xhc3M9XCJhdHRycy5wYWdpbmF0aW9uQnRuR3JvdXBDbGFzc2VzIHx8IFxcJ2J0bi1ncm91cCBidG4tZ3JvdXAtc21cXCdcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLXJlcGVhdD1cInNpemUgaW4gaXRlbXMucGFnaW5nLnBhZ2VTaXplc1wiIG5nLWNsYXNzPVwie2FjdGl2ZTogaXRlbXMucGFnaW5nLnBhZ2VTaXplID09IHNpemV9XCIgbmctY2xpY2s9XCJwYWdlU2l6ZUNoYW5nZWQoc2l6ZSlcIj57eyBzaXplIH19PC9idXR0b24+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBuZy1pZj1cIiFpdGVtcy5wYWdpbmcudG90YWxQYWdlcyAmJiAhbG9jYWxDb25maWcubG9hZGluZ0RhdGEgJiYgYXR0cnMuaXRlbXNOb3RGb3VuZE1lc3NhZ2VcIj48ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtaW5mb1wiIHJvbGU9XCJhbGVydFwiPnt7IGF0dHJzLml0ZW1zTm90Rm91bmRNZXNzYWdlIH19PC9kaXY+PC9kaXY+Jyk7XG4gIH1cbl0pO1xuXG4vLyBTb3VyY2U6IHRhYmxlbGl0ZS50cGwuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC50YWJsZWxpdGUnKS5ydW4oW1xuICAnJHRlbXBsYXRlQ2FjaGUnLFxuICBmdW5jdGlvbiAoJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3RhYmxlbGl0ZS90YWJsZWxpdGUudHBsLmh0bWwnLCAnPGRpdiBjbGFzcz1cImFkLXRhYmxlLWxpdGUtY29udGFpbmVyXCIgbmctaWY9XCJpdGVtcy5hbGxJdGVtcy5sZW5ndGggfHwgIWF0dHJzLml0ZW1zTm90Rm91bmRNZXNzYWdlXCI+PHRhYmxlIGNsYXNzPVwiYWQtc3RpY2t5LXRhYmxlXCIgbmctY2xhc3M9XCJhdHRycy50YWJsZUNsYXNzZXMgfHwgXFwndGFibGVcXCdcIiBuZy1pZj1cImF0dHJzLnRhYmxlTWF4SGVpZ2h0XCI+PHRyIGNsYXNzPVwiYWQtdXNlci1zZWxlY3Qtbm9uZVwiPjx0aCBjbGFzcz1cImFkLXNlbGVjdC1jZWxsXCIgbmctaWY9XCJhdHRycy5kcmFnZ2FibGVcIj48aT48L2k+PC90aD48dGggY2xhc3M9XCJhZC1zZWxlY3QtY2VsbFwiIG5nLWlmPVwiYXR0cnMuc2VsZWN0ZWRJdGVtcyAmJiBpdGVtcy5hbGxJdGVtc1wiPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cImFkLWN1cnNvci1wb2ludGVyXCIgbmctY2xpY2s9XCJhZFN0cmFwVXRpbHMuYWRkUmVtb3ZlSXRlbXNGcm9tTGlzdChpdGVtcy5hbGxJdGVtcywgc2VsZWN0ZWRJdGVtcylcIiBuZy1jaGVja2VkPVwiYWRTdHJhcFV0aWxzLml0ZW1zRXhpc3RJbkxpc3QoaXRlbXMuYWxsSXRlbXMsIHNlbGVjdGVkSXRlbXMpXCI+PC90aD48dGggZGF0YS1uZy1yZXBlYXQ9XCJkZWZpbml0aW9uIGluIGNvbHVtbkRlZmluaXRpb25cIiBuZy1jbGljaz1cInNvcnRCeUNvbHVtbihkZWZpbml0aW9uKVwiIG5nLWNsYXNzPVwie1xcJ2FkLWN1cnNvci1wb2ludGVyXFwnOiBkZWZpbml0aW9uLnNvcnRLZXl9XCIgbmctc3R5bGU9XCJ7XFwnd2lkdGhcXCc6IGRlZmluaXRpb24ud2lkdGh9XCI+PGRpdiBjbGFzcz1cInB1bGwtcmlnaHRcIiBuZy1pZj1cImRlZmluaXRpb24uc29ydEtleSAmJiBsb2NhbENvbmZpZy5wcmVkaWNhdGUgPT0gZGVmaW5pdGlvbi5zb3J0S2V5XCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0QXNjZW5kaW5nXCIgbmctaGlkZT1cImxvY2FsQ29uZmlnLnJldmVyc2VcIj48L2k+IDxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydERlc2NlbmRpbmdcIiBuZy1zaG93PVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT48L2Rpdj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSAhPSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRhYmxlXCI+PC9pPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCIgbmctYmluZC1odG1sPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJUZW1wbGF0ZVwiPjwvZGl2PjxkaXYgbmctaWY9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlckRpc3BsYXlOYW1lXCIgbmctYmluZD1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIj48L2Rpdj48L3RoPjwvdHI+PC90YWJsZT48ZGl2IGNsYXNzPVwiYWQtdGFibGUtY29udGFpbmVyXCIgbmctc3R5bGU9XCJ7XFwnbWF4LWhlaWdodFxcJzogYXR0cnMudGFibGVNYXhIZWlnaHR9XCI+PHRhYmxlIG5nLWNsYXNzPVwiYXR0cnMudGFibGVDbGFzc2VzIHx8IFxcJ3RhYmxlXFwnXCI+PHRyIGNsYXNzPVwiYWQtdXNlci1zZWxlY3Qtbm9uZVwiIG5nLWlmPVwiIWF0dHJzLnRhYmxlTWF4SGVpZ2h0XCI+PHRoIGNsYXNzPVwiYWQtc2VsZWN0LWNlbGxcIiBuZy1pZj1cImF0dHJzLmRyYWdnYWJsZVwiPjxpPjwvaT48L3RoPjx0aCBjbGFzcz1cImFkLXNlbGVjdC1jZWxsXCIgbmctaWY9XCJhdHRycy5zZWxlY3RlZEl0ZW1zICYmIGl0ZW1zLmFsbEl0ZW1zXCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiYWQtY3Vyc29yLXBvaW50ZXJcIiBuZy1jbGljaz1cImFkU3RyYXBVdGlscy5hZGRSZW1vdmVJdGVtc0Zyb21MaXN0KGl0ZW1zLmFsbEl0ZW1zLCBzZWxlY3RlZEl0ZW1zKVwiIG5nLWNoZWNrZWQ9XCJhZFN0cmFwVXRpbHMuaXRlbXNFeGlzdEluTGlzdChpdGVtcy5hbGxJdGVtcywgc2VsZWN0ZWRJdGVtcylcIj48L3RoPjx0aCBkYXRhLW5nLXJlcGVhdD1cImRlZmluaXRpb24gaW4gY29sdW1uRGVmaW5pdGlvblwiIG5nLWNsaWNrPVwic29ydEJ5Q29sdW1uKGRlZmluaXRpb24pXCIgbmctY2xhc3M9XCJ7XFwnYWQtY3Vyc29yLXBvaW50ZXJcXCc6IGRlZmluaXRpb24uc29ydEtleX1cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWlmPVwiZGVmaW5pdGlvbi5zb3J0S2V5ICYmIGxvY2FsQ29uZmlnLnByZWRpY2F0ZSA9PSBkZWZpbml0aW9uLnNvcnRLZXlcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLnNvcnRBc2NlbmRpbmdcIiBuZy1oaWRlPVwibG9jYWxDb25maWcucmV2ZXJzZVwiPjwvaT4gPGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5zb3J0RGVzY2VuZGluZ1wiIG5nLXNob3c9XCJsb2NhbENvbmZpZy5yZXZlcnNlXCI+PC9pPjwvZGl2PjxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCIgbmctaWY9XCJkZWZpbml0aW9uLnNvcnRLZXkgJiYgbG9jYWxDb25maWcucHJlZGljYXRlICE9IGRlZmluaXRpb24uc29ydEtleVwiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuc29ydGFibGVcIj48L2k+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyVGVtcGxhdGVcIiBuZy1iaW5kLWh0bWw9XCJkZWZpbml0aW9uLmNvbHVtbkhlYWRlclRlbXBsYXRlXCI+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24uY29sdW1uSGVhZGVyRGlzcGxheU5hbWVcIiBuZy1iaW5kPVwiZGVmaW5pdGlvbi5jb2x1bW5IZWFkZXJEaXNwbGF5TmFtZVwiPjwvZGl2PjwvdGg+PC90cj48dHIgbmctaWY9XCIhYXR0cnMuZHJhZ2dhYmxlXCIgZGF0YS1uZy1yZXBlYXQ9XCJpdGVtIGluIGl0ZW1zLmxpc3RcIiBuZy1jbGFzcz1cIntcXCdhZC1zZWxlY3RlZFxcJzogYXR0cnMuc2VsZWN0ZWRJdGVtcyAmJiBhZFN0cmFwVXRpbHMuaXRlbUV4aXN0c0luTGlzdChpdGVtLCBzZWxlY3RlZEl0ZW1zKX1cIj48dGQgY2xhc3M9XCJhZC1zZWxlY3QtY2VsbFwiIG5nLWlmPVwiYXR0cnMuc2VsZWN0ZWRJdGVtc1wiPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cImFkLWN1cnNvci1wb2ludGVyXCIgbmctY2hlY2tlZD1cImFkU3RyYXBVdGlscy5pdGVtRXhpc3RzSW5MaXN0KGl0ZW0sIHNlbGVjdGVkSXRlbXMpXCIgbmctY2xpY2s9XCJhZFN0cmFwVXRpbHMuYWRkUmVtb3ZlSXRlbUZyb21MaXN0KGl0ZW0sIHNlbGVjdGVkSXRlbXMpXCI+PC90ZD48dGQgZGF0YS1uZy1yZXBlYXQ9XCJkZWZpbml0aW9uIGluIGNvbHVtbkRlZmluaXRpb25cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVVybFwiPjxuZy1pbmNsdWRlIHNyYz1cImRlZmluaXRpb24udGVtcGxhdGVVcmxcIj48L25nLWluY2x1ZGU+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24udGVtcGxhdGVcIj48c3BhbiBhZC1jb21waWxlLXRlbXBsYXRlPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPjwvc3Bhbj48L2Rpdj48ZGl2IG5nLWlmPVwiIWRlZmluaXRpb24udGVtcGxhdGVVcmwgJiYgIWRlZmluaXRpb24udGVtcGxhdGVcIj57eyBhZFN0cmFwVXRpbHMuYXBwbHlGaWx0ZXIoYWRTdHJhcFV0aWxzLmdldE9iamVjdFByb3BlcnR5KGl0ZW0sIGRlZmluaXRpb24uZGlzcGxheVByb3BlcnR5KSwgZGVmaW5pdGlvbi5jZWxsRmlsdGVyKSB9fTwvZGl2PjwvdGQ+PC90cj48dHIgbmctaWY9XCJhdHRycy5kcmFnZ2FibGVcIiBhZC1kcmFnPVwidHJ1ZVwiIGFkLWRyYWctaGFuZGxlPVwidHJ1ZVwiIGFkLWRyb3A9XCJ0cnVlXCIgYWQtZHJhZy1kYXRhPVwiaXRlbVwiIGFkLWRyb3Atb3Zlcj1cIm9uRHJhZ092ZXIoJGRhdGEsICRkcmFnRWxlbWVudCwgJGRyb3BFbGVtZW50LCAkZXZlbnQpXCIgYWQtZHJvcC1lbmQ9XCJvbkRyb3BFbmQoJGRhdGEsICRkcmFnRWxlbWVudCwgJGRyb3BFbGVtZW50LCAkZXZlbnQpXCIgYWQtZHJhZy1iZWdpbj1cIm9uRHJhZ1N0YXJ0KCRkYXRhLCAkZHJhZ0VsZW1lbnQsICRldmVudClcIiBhZC1kcmFnLWVuZD1cIm9uRHJhZ0VuZCgkZGF0YSwgJGRyYWdFbGVtZW50LCAkZXZlbnQpXCIgZGF0YS1uZy1yZXBlYXQ9XCJpdGVtIGluIGl0ZW1zLmxpc3RcIiBuZy1jbGFzcz1cIntcXCdhZC1zZWxlY3RlZFxcJzogYXR0cnMuc2VsZWN0ZWRJdGVtcyAmJiBhZFN0cmFwVXRpbHMuaXRlbUV4aXN0c0luTGlzdChpdGVtLCBzZWxlY3RlZEl0ZW1zKX1cIj48dGQgY2xhc3M9XCJhZC1zZWxlY3QtY2VsbCBhZC1kcmFnLWhhbmRsZVwiIG5nLWlmPVwiYXR0cnMuZHJhZ2dhYmxlXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5kcmFnZ2FibGVcIj48L2k+PC90ZD48dGQgY2xhc3M9XCJhZC1zZWxlY3QtY2VsbFwiIG5nLWlmPVwiYXR0cnMuc2VsZWN0ZWRJdGVtc1wiPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cImFkLWN1cnNvci1wb2ludGVyXCIgbmctY2hlY2tlZD1cImFkU3RyYXBVdGlscy5pdGVtRXhpc3RzSW5MaXN0KGl0ZW0sIHNlbGVjdGVkSXRlbXMpXCIgbmctY2xpY2s9XCJhZFN0cmFwVXRpbHMuYWRkUmVtb3ZlSXRlbUZyb21MaXN0KGl0ZW0sIHNlbGVjdGVkSXRlbXMpXCI+PC90ZD48dGQgZGF0YS1uZy1yZXBlYXQ9XCJkZWZpbml0aW9uIGluIGNvbHVtbkRlZmluaXRpb25cIiBuZy1zdHlsZT1cIntcXCd3aWR0aFxcJzogZGVmaW5pdGlvbi53aWR0aH1cIj48ZGl2IG5nLWlmPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVVybFwiPjxuZy1pbmNsdWRlIHNyYz1cImRlZmluaXRpb24udGVtcGxhdGVVcmxcIj48L25nLWluY2x1ZGU+PC9kaXY+PGRpdiBuZy1pZj1cImRlZmluaXRpb24udGVtcGxhdGVcIj48c3BhbiBhZC1jb21waWxlLXRlbXBsYXRlPVwiZGVmaW5pdGlvbi50ZW1wbGF0ZVwiPjwvc3Bhbj48L2Rpdj48ZGl2IG5nLWlmPVwiIWRlZmluaXRpb24udGVtcGxhdGVVcmwgJiYgIWRlZmluaXRpb24udGVtcGxhdGVcIj57eyBhZFN0cmFwVXRpbHMuYXBwbHlGaWx0ZXIoYWRTdHJhcFV0aWxzLmdldE9iamVjdFByb3BlcnR5KGl0ZW0sIGRlZmluaXRpb24uZGlzcGxheVByb3BlcnR5KSwgZGVmaW5pdGlvbi5jZWxsRmlsdGVyKSB9fTwvZGl2PjwvdGQ+PC90cj48L3RhYmxlPjwvZGl2PjxkaXYgY2xhc3M9XCJyb3dcIiBuZy1pZj1cIml0ZW1zLmFsbEl0ZW1zLmxlbmd0aCA+IGl0ZW1zLnBhZ2luZy5wYWdlU2l6ZXNbMF0gJiYgIWF0dHJzLmRpc2FibGVQYWdpbmdcIj48ZGl2IGNsYXNzPVwiY29sLW1kLTggY29sLXNtLThcIj48ZGl2IGNsYXNzPVwicHVsbC1sZWZ0XCIgbmctY2xhc3M9XCJhdHRycy5wYWdpbmF0aW9uQnRuR3JvdXBDbGFzc2VzIHx8IFxcJ2J0bi1ncm91cCBidG4tZ3JvdXAtc21cXCdcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIG5nLWNsaWNrPVwibG9hZFBhZ2UoMSlcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSAxXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5maXJzdFBhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctaWY9XCIhYXR0cnMuZHJhZ2dhYmxlXCIgbmctY2xpY2s9XCJsb2FkUHJldmlvdXNQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSAxXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5wcmV2aW91c1BhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGlkPVwiYnRuUHJldlwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctaWY9XCJhdHRycy5kcmFnZ2FibGVcIiBhZC1kcm9wPVwidHJ1ZVwiIGFkLWRyb3Atb3Zlcj1cIm9uTmV4dFBhZ2VCdXR0b25PdmVyKCRkYXRhLCAkZHJhZ0VsZW1lbnQsICRkcm9wRWxlbWVudCwgJGV2ZW50KVwiIGFkLWRyb3AtZW5kPVwib25OZXh0UGFnZUJ1dHRvbkRyb3AoJGRhdGEsICRkcmFnRWxlbWVudCwgJGRyb3BFbGVtZW50LCAkZXZlbnQpXCIgbmctY2xpY2s9XCJsb2FkUHJldmlvdXNQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSAxXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5wcmV2aW91c1BhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctcmVwZWF0PVwicGFnZSBpbiBsb2NhbENvbmZpZy5wYWdpbmdBcnJheVwiIG5nLWNsYXNzPVwie2FjdGl2ZTogaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IHBhZ2V9XCIgbmctY2xpY2s9XCJsb2FkUGFnZShwYWdlKVwiPnt7IHBhZ2UgfX08L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1pZj1cIiFhdHRycy5kcmFnZ2FibGVcIiBuZy1jbGljaz1cImxvYWROZXh0UGFnZSgpXCIgbmctZGlzYWJsZWQ9XCJpdGVtcy5wYWdpbmcuY3VycmVudFBhZ2UgPT0gaXRlbXMucGFnaW5nLnRvdGFsUGFnZXNcIj48aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLm5leHRQYWdlXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIGlkPVwiYnRuTmV4dFwiIG5nLWlmPVwiYXR0cnMuZHJhZ2dhYmxlXCIgYWQtZHJvcD1cInRydWVcIiBhZC1kcm9wLW92ZXI9XCJvbk5leHRQYWdlQnV0dG9uT3ZlcigkZGF0YSwgJGRyYWdFbGVtZW50LCAkZHJvcEVsZW1lbnQsICRldmVudClcIiBhZC1kcm9wLWVuZD1cIm9uTmV4dFBhZ2VCdXR0b25Ecm9wKCRkYXRhLCAkZHJhZ0VsZW1lbnQsICRkcm9wRWxlbWVudCwgJGV2ZW50KVwiIG5nLWNsaWNrPVwibG9hZE5leHRQYWdlKClcIiBuZy1kaXNhYmxlZD1cIml0ZW1zLnBhZ2luZy5jdXJyZW50UGFnZSA9PSBpdGVtcy5wYWdpbmcudG90YWxQYWdlc1wiPjxpIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMubmV4dFBhZ2VcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCIgbmctY2xpY2s9XCJsb2FkTGFzdFBhZ2UoKVwiIG5nLWRpc2FibGVkPVwiaXRlbXMucGFnaW5nLmN1cnJlbnRQYWdlID09IGl0ZW1zLnBhZ2luZy50b3RhbFBhZ2VzXCI+PGkgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5sYXN0UGFnZVwiPjwvaT48L2J1dHRvbj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwiY29sLW1kLTQgY29sLXNtLTRcIj48ZGl2IGNsYXNzPVwicHVsbC1yaWdodFwiIG5nLWNsYXNzPVwiYXR0cnMucGFnaW5hdGlvbkJ0bkdyb3VwQ2xhc3NlcyB8fCBcXCdidG4tZ3JvdXAgYnRuLWdyb3VwLXNtXFwnXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHRcIiBuZy1yZXBlYXQ9XCJzaXplIGluIGl0ZW1zLnBhZ2luZy5wYWdlU2l6ZXNcIiBuZy1jbGFzcz1cInthY3RpdmU6IGl0ZW1zLnBhZ2luZy5wYWdlU2l6ZSA9PSBzaXplfVwiIG5nLWNsaWNrPVwicGFnZVNpemVDaGFuZ2VkKHNpemUpXCI+e3sgc2l6ZSB9fTwvYnV0dG9uPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgbmctaWY9XCIhaXRlbXMuYWxsSXRlbXMubGVuZ3RoICYmIGF0dHJzLml0ZW1zTm90Rm91bmRNZXNzYWdlXCI+PGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LWluZm9cIiByb2xlPVwiYWxlcnRcIj57eyBhdHRycy5pdGVtc05vdEZvdW5kTWVzc2FnZSB9fTwvZGl2PjwvZGl2PicpO1xuICB9XG5dKTtcblxuLy8gU291cmNlOiB0cmVlYnJvd3Nlci50cGwuanNcbmFuZ3VsYXIubW9kdWxlKCdhZGFwdHYuYWRhcHRTdHJhcC50cmVlYnJvd3NlcicpLnJ1bihbXG4gICckdGVtcGxhdGVDYWNoZScsXG4gIGZ1bmN0aW9uICgkdGVtcGxhdGVDYWNoZSkge1xuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgndHJlZWJyb3dzZXIvdHJlZWJyb3dzZXIudHBsLmh0bWwnLCAnPGRpdiBjbGFzcz1cImFkLXRyZWUtYnJvd3Nlci1jb250YWluZXJcIiBuZy1jbGFzcz1cIntcXCd0cmVlLWJvcmRlcmVkXFwnOiBhdHRycy5ib3JkZXJlZH1cIj48ZGl2IGRhdGEtbGV2ZWw9XCIwXCIgY2xhc3M9XCJ0cmVlLXZpZXdcIj48ZGl2IGNsYXNzPVwidHJlZVwiPjxzY3JpcHQgdHlwZT1cInRleHQvbmctdGVtcGxhdGVcIiBpZD1cInt7IGxvY2FsQ29uZmlnLnJlbmRlcmVyVGVtcGxhdGVJZCB9fVwiPjxkaXYgY2xhc3M9XCJjb250ZW50XCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgIG5nLXN0eWxlPVwie1xcJ3BhZGRpbmctbGVmdFxcJzogbGV2ZWwgKiAoYXR0cnMuY2hpbGRyZW5QYWRkaW5nIHx8IDE1KSArIFxcJ3B4XFwnfVwiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICBuZy1jbGFzcz1cInt7IGF0dHJzLnJvd05nQ2xhc3MgfX1cIj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnQtaG9sZGVyXCI+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidG9nZ2xlXCI+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgbmctaWY9XCIhaXRlbS5fYWRfZXhwYW5kZWQgJiYgaGFzQ2hpbGRyZW4oaXRlbSkgJiYgIWl0ZW0uX2FkX2xvYWRpbmdcIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nLWNsYXNzPVwiaWNvbkNsYXNzZXMuZXhwYW5kXCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZy1jbGljaz1cInRvZ2dsZSgkZXZlbnQsaXRlbSlcIj48L2k+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgbmctaWY9XCJpdGVtLl9hZF9leHBhbmRlZCAmJiAhaXRlbS5fYWRfbG9hZGluZ1wiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xhc3M9XCJpY29uQ2xhc3Nlcy5jb2xsYXBzZVwiXFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmctY2xpY2s9XCJ0b2dnbGUoJGV2ZW50LGl0ZW0pXCI+PC9pPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIG5nLWlmPVwiaXRlbS5fYWRfbG9hZGluZ1wiPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aSBuZy1jbGFzcz1cImljb25DbGFzc2VzLmxvYWRpbmdTcGlubmVyXCI+PC9pPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5vZGUtY29udGVudFwiPlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctaW5jbHVkZSBuZy1pZj1cImF0dHJzLm5vZGVUZW1wbGF0ZVVybFwiIHNyYz1cImF0dHJzLm5vZGVUZW1wbGF0ZVVybFwiPjwvbmctaW5jbHVkZT5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gbmctaWY9XCIhYXR0cnMubm9kZVRlbXBsYXRlVXJsXCI+e3sgaXRlbS5uYW1lIHx8IFwiXCIgfX08L3NwYW4+XFxuJyArICcgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArICcgICAgICAgICAgICAgICAgPC9kaXY+XFxuJyArICcgICAgICAgICAgICAgICAgPGRpdiBuZy1zaG93PVwiaXRlbS5fYWRfZXhwYW5kZWRcIj5cXG4nICsgJyAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRyZWUtbGV2ZWwgdHJlZS1zdWItbGV2ZWxcIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZD1cImxldmVsPWxldmVsKzFcIlxcbicgKyAnICAgICAgICAgICAgICAgICAgICAgICAgIG5nLXJlcGVhdD1cIml0ZW0gaW4gaXRlbVthdHRycy5jaGlsZE5vZGVdXCJcXG4nICsgJyAgICAgICAgICAgICAgICAgICAgICAgICBuZy1pbmNsdWRlPVwiXFwne3sgbG9jYWxDb25maWcucmVuZGVyZXJUZW1wbGF0ZUlkIH19XFwnXCI+XFxuJyArICcgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbicgKyAnICAgICAgICAgICAgICAgIDwvZGl2Pjwvc2NyaXB0PjxkaXY+PGRpdiBjbGFzcz1cInRyZWUtbGV2ZWwgdHJlZS1oZWFkZXItbGV2ZWwgYm9yZGVyXCIgbmctaWY9XCJhdHRycy5ub2RlSGVhZGVyVXJsXCI+PGRpdiBjbGFzcz1cImNvbnRlbnRcIiBuZy1zdHlsZT1cIntcXCdwYWRkaW5nLWxlZnRcXCc6IChhdHRycy5jaGlsZHJlblBhZGRpbmcgfHwgMTUpICsgXFwncHhcXCd9XCI+PGRpdiBjbGFzcz1cImNvbnRlbnQtaG9sZGVyXCI+PGRpdiBjbGFzcz1cInRvZ2dsZVwiPjwvZGl2PjxkaXYgY2xhc3M9XCJub2RlLWNvbnRlbnQgYWQtdXNlci1zZWxlY3Qtbm9uZVwiIG5nLWluY2x1ZGU9XCJhdHRycy5ub2RlSGVhZGVyVXJsXCI+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cInRyZWUtbGV2ZWwgdHJlZS10b3AtbGV2ZWwgYm9yZGVyXCIgb25sb2FkPVwibGV2ZWwgPSAxXCIgbmctcmVwZWF0PVwiaXRlbSBpbiB0cmVlUm9vdFthdHRycy5jaGlsZE5vZGVdXCIgbmctaW5jbHVkZT1cIlxcJ3t7IGxvY2FsQ29uZmlnLnJlbmRlcmVyVGVtcGxhdGVJZCB9fVxcJ1wiPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PicpO1xuICB9XG5dKTtcblxuXG59KSh3aW5kb3csIGRvY3VtZW50KTtcbiIsIi8qKlxuICogYW5ndWxhci1ncm93bC12MiAtIHYwLjcuMCAtIDIwMTQtMDgtMTBcbiAqIGh0dHA6Ly9qYW5zdGV2ZW5zLmdpdGh1Yi5pby9hbmd1bGFyLWdyb3dsLTJcbiAqIENvcHlyaWdodCAoYykgMjAxNCBNYXJjbyBSaW5jayxKYW4gU3RldmVuczsgTGljZW5zZWQgTUlUXG4gKi9cbmFuZ3VsYXIubW9kdWxlKFwiYW5ndWxhci1ncm93bFwiLFtdKSxhbmd1bGFyLm1vZHVsZShcImFuZ3VsYXItZ3Jvd2xcIikuZGlyZWN0aXZlKFwiZ3Jvd2xcIixbXCIkcm9vdFNjb3BlXCIsXCIkc2NlXCIsZnVuY3Rpb24oYSxiKXtcInVzZSBzdHJpY3RcIjtyZXR1cm57cmVzdHJpY3Q6XCJBXCIsdGVtcGxhdGVVcmw6XCJ0ZW1wbGF0ZXMvZ3Jvd2wvZ3Jvd2wuaHRtbFwiLHJlcGxhY2U6ITEsc2NvcGU6e3JlZmVyZW5jZTpcIkBcIixpbmxpbmU6XCJAXCIsbGltaXRNZXNzYWdlczpcIj1cIn0sY29udHJvbGxlcjpbXCIkc2NvcGVcIixcIiR0aW1lb3V0XCIsXCJncm93bFwiLGZ1bmN0aW9uKGMsZCxlKXtmdW5jdGlvbiBmKGEpe2QoZnVuY3Rpb24oKXt2YXIgZixoO2lmKCFnfHwoYW5ndWxhci5mb3JFYWNoKGMubWVzc2FnZXMsZnVuY3Rpb24oYyl7aD1iLmdldFRydXN0ZWRIdG1sKGMudGV4dCksYS50ZXh0PT09aCYmYS5zZXZlcml0eT09PWMuc2V2ZXJpdHkmJmMudGl0bGU9PT1jLnRpdGxlJiYoZj0hMCl9KSwhZikpe2lmKGEudGV4dD1iLnRydXN0QXNIdG1sKFN0cmluZyhhLnRleHQpKSxhLnR0bCYmLTEhPT1hLnR0bCYmKGEuY291bnRkb3duPWEudHRsLzFlMyxhLnByb21pc2VzPVtdLGEuY2xvc2U9ITEsYS5jb3VudGRvd25GdW5jdGlvbj1mdW5jdGlvbigpe2EuY291bnRkb3duPjE/KGEuY291bnRkb3duLS0sYS5wcm9taXNlcy5wdXNoKGQoYS5jb3VudGRvd25GdW5jdGlvbiwxZTMpKSk6YS5jb3VudGRvd24tLX0pLGFuZ3VsYXIuaXNEZWZpbmVkKGMubGltaXRNZXNzYWdlcykpe3ZhciBpPWMubWVzc2FnZXMubGVuZ3RoLShjLmxpbWl0TWVzc2FnZXMtMSk7aT4wJiZjLm1lc3NhZ2VzLnNwbGljZShjLmxpbWl0TWVzc2FnZXMtMSxpKX1lLnJldmVyc2VPcmRlcigpP2MubWVzc2FnZXMudW5zaGlmdChhKTpjLm1lc3NhZ2VzLnB1c2goYSksYS50dGwmJi0xIT09YS50dGwmJihhLnByb21pc2VzLnB1c2goZChmdW5jdGlvbigpe2MuZGVsZXRlTWVzc2FnZShhKX0sYS50dGwpKSxhLnByb21pc2VzLnB1c2goZChhLmNvdW50ZG93bkZ1bmN0aW9uLDFlMykpKX19LCEwKX12YXIgZz1lLm9ubHlVbmlxdWUoKTtjLm1lc3NhZ2VzPVtdO3ZhciBoPWMucmVmZXJlbmNlfHwwO2MuaW5saW5lTWVzc2FnZT1jLmlubGluZXx8ZS5pbmxpbmVNZXNzYWdlcygpLGEuJG9uKFwiZ3Jvd2xNZXNzYWdlXCIsZnVuY3Rpb24oYSxiKXtwYXJzZUludChoLDEwKT09PXBhcnNlSW50KGIucmVmZXJlbmNlSWQsMTApJiZmKGIpfSksYy5kZWxldGVNZXNzYWdlPWZ1bmN0aW9uKGEpe3ZhciBiPWMubWVzc2FnZXMuaW5kZXhPZihhKTtiPi0xJiZjLm1lc3NhZ2VzLnNwbGljZShiLDEpfSxjLnN0b3BUaW1lb3V0Q2xvc2U9ZnVuY3Rpb24oYSl7YW5ndWxhci5mb3JFYWNoKGEucHJvbWlzZXMsZnVuY3Rpb24oYSl7ZC5jYW5jZWwoYSl9KSxhLmNsb3NlP2MuZGVsZXRlTWVzc2FnZShhKTphLmNsb3NlPSEwfSxjLmFsZXJ0Q2xhc3Nlcz1mdW5jdGlvbihhKXtyZXR1cm57XCJhbGVydC1zdWNjZXNzXCI6XCJzdWNjZXNzXCI9PT1hLnNldmVyaXR5LFwiYWxlcnQtZXJyb3JcIjpcImVycm9yXCI9PT1hLnNldmVyaXR5LFwiYWxlcnQtZGFuZ2VyXCI6XCJlcnJvclwiPT09YS5zZXZlcml0eSxcImFsZXJ0LWluZm9cIjpcImluZm9cIj09PWEuc2V2ZXJpdHksXCJhbGVydC13YXJuaW5nXCI6XCJ3YXJuaW5nXCI9PT1hLnNldmVyaXR5LGljb246YS5kaXNhYmxlSWNvbnM9PT0hMSxcImFsZXJ0LWRpc21pc3NhYmxlXCI6IWEuZGlzYWJsZUNsb3NlQnV0dG9ufX0sYy5zaG93Q291bnREb3duPWZ1bmN0aW9uKGEpe3JldHVybiFhLmRpc2FibGVDb3VudERvd24mJmEudHRsPjB9LGMud3JhcHBlckNsYXNzZXM9ZnVuY3Rpb24oKXt2YXIgYT17fTtyZXR1cm4gYVtcImdyb3dsLWZpeGVkXCJdPSFjLmlubGluZU1lc3NhZ2UsYVtlLnBvc2l0aW9uKCldPSEwLGF9LGMuY29tcHV0ZVRpdGxlPWZ1bmN0aW9uKGEpe3ZhciBiPXtzdWNjZXNzOlwiU3VjY2Vzc1wiLGVycm9yOlwiRXJyb3JcIixpbmZvOlwiSW5mb3JtYXRpb25cIix3YXJuOlwiV2FybmluZ1wifTtyZXR1cm4gYlthLnNldmVyaXR5XX19XX19XSksYW5ndWxhci5tb2R1bGUoXCJhbmd1bGFyLWdyb3dsXCIpLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLGZ1bmN0aW9uKGEpe1widXNlIHN0cmljdFwiO3ZvaWQgMD09PWEuZ2V0KFwidGVtcGxhdGVzL2dyb3dsL2dyb3dsLmh0bWxcIikmJmEucHV0KFwidGVtcGxhdGVzL2dyb3dsL2dyb3dsLmh0bWxcIiwnPGRpdiBjbGFzcz1cImdyb3dsLWNvbnRhaW5lclwiIG5nLWNsYXNzPVwid3JhcHBlckNsYXNzZXMoKVwiPjxkaXYgY2xhc3M9XCJncm93bC1pdGVtIGFsZXJ0XCIgbmctcmVwZWF0PVwibWVzc2FnZSBpbiBtZXNzYWdlc1wiIG5nLWNsYXNzPVwiYWxlcnRDbGFzc2VzKG1lc3NhZ2UpXCIgbmctY2xpY2s9XCJzdG9wVGltZW91dENsb3NlKG1lc3NhZ2UpXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgbmctY2xpY2s9XCJkZWxldGVNZXNzYWdlKG1lc3NhZ2UpXCIgbmctc2hvdz1cIiFtZXNzYWdlLmRpc2FibGVDbG9zZUJ1dHRvblwiPiZ0aW1lczs8L2J1dHRvbj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgbmctc2hvdz1cInNob3dDb3VudERvd24obWVzc2FnZSlcIj57e21lc3NhZ2UuY291bnRkb3dufX08L2J1dHRvbj48aDQgY2xhc3M9XCJncm93bC10aXRsZVwiIG5nLXNob3c9XCJtZXNzYWdlLnRpdGxlXCIgbmctYmluZD1cIm1lc3NhZ2UudGl0bGVcIj48L2g0PjxkaXYgY2xhc3M9XCJncm93bC1tZXNzYWdlXCIgbmctYmluZC1odG1sPVwibWVzc2FnZS50ZXh0XCI+PC9kaXY+PC9kaXY+PC9kaXY+Jyl9XSksYW5ndWxhci5tb2R1bGUoXCJhbmd1bGFyLWdyb3dsXCIpLnByb3ZpZGVyKFwiZ3Jvd2xcIixmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO3ZhciBhPXtzdWNjZXNzOm51bGwsZXJyb3I6bnVsbCx3YXJuaW5nOm51bGwsaW5mbzpudWxsfSxiPVwibWVzc2FnZXNcIixjPVwidGV4dFwiLGQ9XCJ0aXRsZVwiLGU9XCJzZXZlcml0eVwiLGY9ITAsZz1cInZhcmlhYmxlc1wiLGg9MCxpPSExLGo9XCJ0b3AtcmlnaHRcIixrPSExLGw9ITEsbT0hMSxuPSExO3RoaXMuZ2xvYmFsVGltZVRvTGl2ZT1mdW5jdGlvbihiKXtpZihcIm9iamVjdFwiPT10eXBlb2YgYilmb3IodmFyIGMgaW4gYiliLmhhc093blByb3BlcnR5KGMpJiYoYVtjXT1iW2NdKTtlbHNlIGZvcih2YXIgZCBpbiBhKWEuaGFzT3duUHJvcGVydHkoZCkmJihhW2RdPWIpfSx0aGlzLmdsb2JhbERpc2FibGVDbG9zZUJ1dHRvbj1mdW5jdGlvbihhKXtrPWF9LHRoaXMuZ2xvYmFsRGlzYWJsZUljb25zPWZ1bmN0aW9uKGEpe2w9YX0sdGhpcy5nbG9iYWxSZXZlcnNlZE9yZGVyPWZ1bmN0aW9uKGEpe209YX0sdGhpcy5nbG9iYWxEaXNhYmxlQ291bnREb3duPWZ1bmN0aW9uKGEpe249YX0sdGhpcy5tZXNzYWdlVmFyaWFibGVLZXk9ZnVuY3Rpb24oYSl7Zz1hfSx0aGlzLmdsb2JhbElubGluZU1lc3NhZ2VzPWZ1bmN0aW9uKGEpe2k9YX0sdGhpcy5nbG9iYWxQb3NpdGlvbj1mdW5jdGlvbihhKXtqPWF9LHRoaXMubWVzc2FnZXNLZXk9ZnVuY3Rpb24oYSl7Yj1hfSx0aGlzLm1lc3NhZ2VUZXh0S2V5PWZ1bmN0aW9uKGEpe2M9YX0sdGhpcy5tZXNzYWdlVGl0bGVLZXk9ZnVuY3Rpb24oYSl7ZD1hfSx0aGlzLm1lc3NhZ2VTZXZlcml0eUtleT1mdW5jdGlvbihhKXtlPWF9LHRoaXMub25seVVuaXF1ZU1lc3NhZ2VzPWZ1bmN0aW9uKGEpe2Y9YX0sdGhpcy5zZXJ2ZXJNZXNzYWdlc0ludGVyY2VwdG9yPVtcIiRxXCIsXCJncm93bFwiLGZ1bmN0aW9uKGEsYyl7ZnVuY3Rpb24gZChhKXthLmRhdGFbYl0mJmEuZGF0YVtiXS5sZW5ndGg+MCYmYy5hZGRTZXJ2ZXJNZXNzYWdlcyhhLmRhdGFbYl0pfXJldHVybntyZXNwb25zZTpmdW5jdGlvbihhKXtyZXR1cm4gZChhKSxhfSxyZXNwb25zZUVycm9yOmZ1bmN0aW9uKGIpe3JldHVybiBkKGIpLGEucmVqZWN0KGIpfX19XSx0aGlzLiRnZXQ9W1wiJHJvb3RTY29wZVwiLFwiJGludGVycG9sYXRlXCIsXCIkZmlsdGVyXCIsZnVuY3Rpb24oYixvLHApe2Z1bmN0aW9uIHEoYSl7aWYoQilhLnRleHQ9QihhLnRleHQsYS52YXJpYWJsZXMpO2Vsc2V7dmFyIGM9byhhLnRleHQpO2EudGV4dD1jKGEudmFyaWFibGVzKX1iLiRicm9hZGNhc3QoXCJncm93bE1lc3NhZ2VcIixhKX1mdW5jdGlvbiByKGIsYyxkKXt2YXIgZSxmPWN8fHt9O2U9e3RleHQ6Yix0aXRsZTpmLnRpdGxlLHNldmVyaXR5OmQsdHRsOmYudHRsfHxhW2RdLHZhcmlhYmxlczpmLnZhcmlhYmxlc3x8e30sZGlzYWJsZUNsb3NlQnV0dG9uOnZvaWQgMD09PWYuZGlzYWJsZUNsb3NlQnV0dG9uP2s6Zi5kaXNhYmxlQ2xvc2VCdXR0b24sZGlzYWJsZUljb25zOnZvaWQgMD09PWYuZGlzYWJsZUljb25zP2w6Zi5kaXNhYmxlSWNvbnMsZGlzYWJsZUNvdW50RG93bjp2b2lkIDA9PT1mLmRpc2FibGVDb3VudERvd24/bjpmLmRpc2FibGVDb3VudERvd24scG9zaXRpb246Zi5wb3NpdGlvbnx8aixyZWZlcmVuY2VJZDpmLnJlZmVyZW5jZUlkfHxofSxxKGUpfWZ1bmN0aW9uIHMoYSxiKXtyKGEsYixcIndhcm5pbmdcIil9ZnVuY3Rpb24gdChhLGIpe3IoYSxiLFwiZXJyb3JcIil9ZnVuY3Rpb24gdShhLGIpe3IoYSxiLFwiaW5mb1wiKX1mdW5jdGlvbiB2KGEsYil7cihhLGIsXCJzdWNjZXNzXCIpfWZ1bmN0aW9uIHcoYSl7dmFyIGIsZixoLGk7Zm9yKGk9YS5sZW5ndGgsYj0wO2k+YjtiKyspaWYoZj1hW2JdLGZbY10pe2g9ZltlXXx8XCJlcnJvclwiO3ZhciBqPXt9O2oudmFyaWFibGVzPWZbZ118fHt9LGoudGl0bGU9ZltkXSxyKGZbY10saixoKX19ZnVuY3Rpb24geCgpe3JldHVybiBmfWZ1bmN0aW9uIHkoKXtyZXR1cm4gbX1mdW5jdGlvbiB6KCl7cmV0dXJuIGl9ZnVuY3Rpb24gQSgpe3JldHVybiBqfXZhciBCO3RyeXtCPXAoXCJ0cmFuc2xhdGVcIil9Y2F0Y2goQyl7fXJldHVybnt3YXJuaW5nOnMsZXJyb3I6dCxpbmZvOnUsc3VjY2Vzczp2LGFkZFNlcnZlck1lc3NhZ2VzOncsb25seVVuaXF1ZTp4LHJldmVyc2VPcmRlcjp5LGlubGluZU1lc3NhZ2VzOnoscG9zaXRpb246QX19XX0pOyIsIi8qKlxuICogQGxpY2Vuc2UgQW5ndWxhckpTIHYxLjMuMVxuICogKGMpIDIwMTAtMjAxNCBHb29nbGUsIEluYy4gaHR0cDovL2FuZ3VsYXJqcy5vcmdcbiAqIExpY2Vuc2U6IE1JVFxuICovXG4oZnVuY3Rpb24od2luZG93LCBhbmd1bGFyLCB1bmRlZmluZWQpIHsndXNlIHN0cmljdCc7XG5cbnZhciAkc2FuaXRpemVNaW5FcnIgPSBhbmd1bGFyLiQkbWluRXJyKCckc2FuaXRpemUnKTtcblxuLyoqXG4gKiBAbmdkb2MgbW9kdWxlXG4gKiBAbmFtZSBuZ1Nhbml0aXplXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiAjIG5nU2FuaXRpemVcbiAqXG4gKiBUaGUgYG5nU2FuaXRpemVgIG1vZHVsZSBwcm92aWRlcyBmdW5jdGlvbmFsaXR5IHRvIHNhbml0aXplIEhUTUwuXG4gKlxuICpcbiAqIDxkaXYgZG9jLW1vZHVsZS1jb21wb25lbnRzPVwibmdTYW5pdGl6ZVwiPjwvZGl2PlxuICpcbiAqIFNlZSB7QGxpbmsgbmdTYW5pdGl6ZS4kc2FuaXRpemUgYCRzYW5pdGl6ZWB9IGZvciB1c2FnZS5cbiAqL1xuXG4vKlxuICogSFRNTCBQYXJzZXIgQnkgTWlza28gSGV2ZXJ5IChtaXNrb0BoZXZlcnkuY29tKVxuICogYmFzZWQgb246ICBIVE1MIFBhcnNlciBCeSBKb2huIFJlc2lnIChlam9obi5vcmcpXG4gKiBPcmlnaW5hbCBjb2RlIGJ5IEVyaWsgQXJ2aWRzc29uLCBNb3ppbGxhIFB1YmxpYyBMaWNlbnNlXG4gKiBodHRwOi8vZXJpay5lYWUubmV0L3NpbXBsZWh0bWxwYXJzZXIvc2ltcGxlaHRtbHBhcnNlci5qc1xuICpcbiAqIC8vIFVzZSBsaWtlIHNvOlxuICogaHRtbFBhcnNlcihodG1sU3RyaW5nLCB7XG4gKiAgICAgc3RhcnQ6IGZ1bmN0aW9uKHRhZywgYXR0cnMsIHVuYXJ5KSB7fSxcbiAqICAgICBlbmQ6IGZ1bmN0aW9uKHRhZykge30sXG4gKiAgICAgY2hhcnM6IGZ1bmN0aW9uKHRleHQpIHt9LFxuICogICAgIGNvbW1lbnQ6IGZ1bmN0aW9uKHRleHQpIHt9XG4gKiB9KTtcbiAqXG4gKi9cblxuXG4vKipcbiAqIEBuZ2RvYyBzZXJ2aWNlXG4gKiBAbmFtZSAkc2FuaXRpemVcbiAqIEBraW5kIGZ1bmN0aW9uXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiAgIFRoZSBpbnB1dCBpcyBzYW5pdGl6ZWQgYnkgcGFyc2luZyB0aGUgSFRNTCBpbnRvIHRva2Vucy4gQWxsIHNhZmUgdG9rZW5zIChmcm9tIGEgd2hpdGVsaXN0KSBhcmVcbiAqICAgdGhlbiBzZXJpYWxpemVkIGJhY2sgdG8gcHJvcGVybHkgZXNjYXBlZCBodG1sIHN0cmluZy4gVGhpcyBtZWFucyB0aGF0IG5vIHVuc2FmZSBpbnB1dCBjYW4gbWFrZVxuICogICBpdCBpbnRvIHRoZSByZXR1cm5lZCBzdHJpbmcsIGhvd2V2ZXIsIHNpbmNlIG91ciBwYXJzZXIgaXMgbW9yZSBzdHJpY3QgdGhhbiBhIHR5cGljYWwgYnJvd3NlclxuICogICBwYXJzZXIsIGl0J3MgcG9zc2libGUgdGhhdCBzb21lIG9ic2N1cmUgaW5wdXQsIHdoaWNoIHdvdWxkIGJlIHJlY29nbml6ZWQgYXMgdmFsaWQgSFRNTCBieSBhXG4gKiAgIGJyb3dzZXIsIHdvbid0IG1ha2UgaXQgdGhyb3VnaCB0aGUgc2FuaXRpemVyLiBUaGUgaW5wdXQgbWF5IGFsc28gY29udGFpbiBTVkcgbWFya3VwLlxuICogICBUaGUgd2hpdGVsaXN0IGlzIGNvbmZpZ3VyZWQgdXNpbmcgdGhlIGZ1bmN0aW9ucyBgYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3RgIGFuZFxuICogICBgaW1nU3JjU2FuaXRpemF0aW9uV2hpdGVsaXN0YCBvZiB7QGxpbmsgbmcuJGNvbXBpbGVQcm92aWRlciBgJGNvbXBpbGVQcm92aWRlcmB9LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIEhUTUwgaW5wdXQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBTYW5pdGl6ZWQgSFRNTC5cbiAqXG4gKiBAZXhhbXBsZVxuICAgPGV4YW1wbGUgbW9kdWxlPVwic2FuaXRpemVFeGFtcGxlXCIgZGVwcz1cImFuZ3VsYXItc2FuaXRpemUuanNcIj5cbiAgIDxmaWxlIG5hbWU9XCJpbmRleC5odG1sXCI+XG4gICAgIDxzY3JpcHQ+XG4gICAgICAgICBhbmd1bGFyLm1vZHVsZSgnc2FuaXRpemVFeGFtcGxlJywgWyduZ1Nhbml0aXplJ10pXG4gICAgICAgICAgIC5jb250cm9sbGVyKCdFeGFtcGxlQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzY2UnLCBmdW5jdGlvbigkc2NvcGUsICRzY2UpIHtcbiAgICAgICAgICAgICAkc2NvcGUuc25pcHBldCA9XG4gICAgICAgICAgICAgICAnPHAgc3R5bGU9XCJjb2xvcjpibHVlXCI+YW4gaHRtbFxcbicgK1xuICAgICAgICAgICAgICAgJzxlbSBvbm1vdXNlb3Zlcj1cInRoaXMudGV4dENvbnRlbnQ9XFwnUFdOM0QhXFwnXCI+Y2xpY2sgaGVyZTwvZW0+XFxuJyArXG4gICAgICAgICAgICAgICAnc25pcHBldDwvcD4nO1xuICAgICAgICAgICAgICRzY29wZS5kZWxpYmVyYXRlbHlUcnVzdERhbmdlcm91c1NuaXBwZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKCRzY29wZS5zbmlwcGV0KTtcbiAgICAgICAgICAgICB9O1xuICAgICAgICAgICB9XSk7XG4gICAgIDwvc2NyaXB0PlxuICAgICA8ZGl2IG5nLWNvbnRyb2xsZXI9XCJFeGFtcGxlQ29udHJvbGxlclwiPlxuICAgICAgICBTbmlwcGV0OiA8dGV4dGFyZWEgbmctbW9kZWw9XCJzbmlwcGV0XCIgY29scz1cIjYwXCIgcm93cz1cIjNcIj48L3RleHRhcmVhPlxuICAgICAgIDx0YWJsZT5cbiAgICAgICAgIDx0cj5cbiAgICAgICAgICAgPHRkPkRpcmVjdGl2ZTwvdGQ+XG4gICAgICAgICAgIDx0ZD5Ib3c8L3RkPlxuICAgICAgICAgICA8dGQ+U291cmNlPC90ZD5cbiAgICAgICAgICAgPHRkPlJlbmRlcmVkPC90ZD5cbiAgICAgICAgIDwvdHI+XG4gICAgICAgICA8dHIgaWQ9XCJiaW5kLWh0bWwtd2l0aC1zYW5pdGl6ZVwiPlxuICAgICAgICAgICA8dGQ+bmctYmluZC1odG1sPC90ZD5cbiAgICAgICAgICAgPHRkPkF1dG9tYXRpY2FsbHkgdXNlcyAkc2FuaXRpemU8L3RkPlxuICAgICAgICAgICA8dGQ+PHByZT4mbHQ7ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXRcIiZndDs8YnIvPiZsdDsvZGl2Jmd0OzwvcHJlPjwvdGQ+XG4gICAgICAgICAgIDx0ZD48ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXRcIj48L2Rpdj48L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICAgIDx0ciBpZD1cImJpbmQtaHRtbC13aXRoLXRydXN0XCI+XG4gICAgICAgICAgIDx0ZD5uZy1iaW5kLWh0bWw8L3RkPlxuICAgICAgICAgICA8dGQ+QnlwYXNzICRzYW5pdGl6ZSBieSBleHBsaWNpdGx5IHRydXN0aW5nIHRoZSBkYW5nZXJvdXMgdmFsdWU8L3RkPlxuICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgIDxwcmU+Jmx0O2RpdiBuZy1iaW5kLWh0bWw9XCJkZWxpYmVyYXRlbHlUcnVzdERhbmdlcm91c1NuaXBwZXQoKVwiJmd0O1xuJmx0Oy9kaXYmZ3Q7PC9wcmU+XG4gICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgIDx0ZD48ZGl2IG5nLWJpbmQtaHRtbD1cImRlbGliZXJhdGVseVRydXN0RGFuZ2Vyb3VzU25pcHBldCgpXCI+PC9kaXY+PC90ZD5cbiAgICAgICAgIDwvdHI+XG4gICAgICAgICA8dHIgaWQ9XCJiaW5kLWRlZmF1bHRcIj5cbiAgICAgICAgICAgPHRkPm5nLWJpbmQ8L3RkPlxuICAgICAgICAgICA8dGQ+QXV0b21hdGljYWxseSBlc2NhcGVzPC90ZD5cbiAgICAgICAgICAgPHRkPjxwcmU+Jmx0O2RpdiBuZy1iaW5kPVwic25pcHBldFwiJmd0Ozxici8+Jmx0Oy9kaXYmZ3Q7PC9wcmU+PC90ZD5cbiAgICAgICAgICAgPHRkPjxkaXYgbmctYmluZD1cInNuaXBwZXRcIj48L2Rpdj48L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICA8L3RhYmxlPlxuICAgICAgIDwvZGl2PlxuICAgPC9maWxlPlxuICAgPGZpbGUgbmFtZT1cInByb3RyYWN0b3IuanNcIiB0eXBlPVwicHJvdHJhY3RvclwiPlxuICAgICBpdCgnc2hvdWxkIHNhbml0aXplIHRoZSBodG1sIHNuaXBwZXQgYnkgZGVmYXVsdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2JpbmQtaHRtbC13aXRoLXNhbml0aXplIGRpdicpKS5nZXRJbm5lckh0bWwoKSkuXG4gICAgICAgICB0b0JlKCc8cD5hbiBodG1sXFxuPGVtPmNsaWNrIGhlcmU8L2VtPlxcbnNuaXBwZXQ8L3A+Jyk7XG4gICAgIH0pO1xuXG4gICAgIGl0KCdzaG91bGQgaW5saW5lIHJhdyBzbmlwcGV0IGlmIGJvdW5kIHRvIGEgdHJ1c3RlZCB2YWx1ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2JpbmQtaHRtbC13aXRoLXRydXN0IGRpdicpKS5nZXRJbm5lckh0bWwoKSkuXG4gICAgICAgICB0b0JlKFwiPHAgc3R5bGU9XFxcImNvbG9yOmJsdWVcXFwiPmFuIGh0bWxcXG5cIiArXG4gICAgICAgICAgICAgIFwiPGVtIG9ubW91c2VvdmVyPVxcXCJ0aGlzLnRleHRDb250ZW50PSdQV04zRCEnXFxcIj5jbGljayBoZXJlPC9lbT5cXG5cIiArXG4gICAgICAgICAgICAgIFwic25pcHBldDwvcD5cIik7XG4gICAgIH0pO1xuXG4gICAgIGl0KCdzaG91bGQgZXNjYXBlIHNuaXBwZXQgd2l0aG91dCBhbnkgZmlsdGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjYmluZC1kZWZhdWx0IGRpdicpKS5nZXRJbm5lckh0bWwoKSkuXG4gICAgICAgICB0b0JlKFwiJmx0O3Agc3R5bGU9XFxcImNvbG9yOmJsdWVcXFwiJmd0O2FuIGh0bWxcXG5cIiArXG4gICAgICAgICAgICAgIFwiJmx0O2VtIG9ubW91c2VvdmVyPVxcXCJ0aGlzLnRleHRDb250ZW50PSdQV04zRCEnXFxcIiZndDtjbGljayBoZXJlJmx0Oy9lbSZndDtcXG5cIiArXG4gICAgICAgICAgICAgIFwic25pcHBldCZsdDsvcCZndDtcIik7XG4gICAgIH0pO1xuXG4gICAgIGl0KCdzaG91bGQgdXBkYXRlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgZWxlbWVudChieS5tb2RlbCgnc25pcHBldCcpKS5jbGVhcigpO1xuICAgICAgIGVsZW1lbnQoYnkubW9kZWwoJ3NuaXBwZXQnKSkuc2VuZEtleXMoJ25ldyA8YiBvbmNsaWNrPVwiYWxlcnQoMSlcIj50ZXh0PC9iPicpO1xuICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2JpbmQtaHRtbC13aXRoLXNhbml0aXplIGRpdicpKS5nZXRJbm5lckh0bWwoKSkuXG4gICAgICAgICB0b0JlKCduZXcgPGI+dGV4dDwvYj4nKTtcbiAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNiaW5kLWh0bWwtd2l0aC10cnVzdCBkaXYnKSkuZ2V0SW5uZXJIdG1sKCkpLnRvQmUoXG4gICAgICAgICAnbmV3IDxiIG9uY2xpY2s9XCJhbGVydCgxKVwiPnRleHQ8L2I+Jyk7XG4gICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjYmluZC1kZWZhdWx0IGRpdicpKS5nZXRJbm5lckh0bWwoKSkudG9CZShcbiAgICAgICAgIFwibmV3ICZsdDtiIG9uY2xpY2s9XFxcImFsZXJ0KDEpXFxcIiZndDt0ZXh0Jmx0Oy9iJmd0O1wiKTtcbiAgICAgfSk7XG4gICA8L2ZpbGU+XG4gICA8L2V4YW1wbGU+XG4gKi9cbmZ1bmN0aW9uICRTYW5pdGl6ZVByb3ZpZGVyKCkge1xuICB0aGlzLiRnZXQgPSBbJyQkc2FuaXRpemVVcmknLCBmdW5jdGlvbigkJHNhbml0aXplVXJpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgIHZhciBidWYgPSBbXTtcbiAgICAgIGh0bWxQYXJzZXIoaHRtbCwgaHRtbFNhbml0aXplV3JpdGVyKGJ1ZiwgZnVuY3Rpb24odXJpLCBpc0ltYWdlKSB7XG4gICAgICAgIHJldHVybiAhL151bnNhZmUvLnRlc3QoJCRzYW5pdGl6ZVVyaSh1cmksIGlzSW1hZ2UpKTtcbiAgICAgIH0pKTtcbiAgICAgIHJldHVybiBidWYuam9pbignJyk7XG4gICAgfTtcbiAgfV07XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplVGV4dChjaGFycykge1xuICB2YXIgYnVmID0gW107XG4gIHZhciB3cml0ZXIgPSBodG1sU2FuaXRpemVXcml0ZXIoYnVmLCBhbmd1bGFyLm5vb3ApO1xuICB3cml0ZXIuY2hhcnMoY2hhcnMpO1xuICByZXR1cm4gYnVmLmpvaW4oJycpO1xufVxuXG5cbi8vIFJlZ3VsYXIgRXhwcmVzc2lvbnMgZm9yIHBhcnNpbmcgdGFncyBhbmQgYXR0cmlidXRlc1xudmFyIFNUQVJUX1RBR19SRUdFWFAgPVxuICAgICAgIC9ePCgoPzpbYS16QS1aXSlbXFx3Oi1dKikoKD86XFxzK1tcXHc6LV0rKD86XFxzKj1cXHMqKD86KD86XCJbXlwiXSpcIil8KD86J1teJ10qJyl8W14+XFxzXSspKT8pKilcXHMqKFxcLz8pXFxzKig+PykvLFxuICBFTkRfVEFHX1JFR0VYUCA9IC9ePFxcL1xccyooW1xcdzotXSspW14+XSo+LyxcbiAgQVRUUl9SRUdFWFAgPSAvKFtcXHc6LV0rKSg/Olxccyo9XFxzKig/Oig/OlwiKCg/OlteXCJdKSopXCIpfCg/OicoKD86W14nXSkqKScpfChbXj5cXHNdKykpKT8vZyxcbiAgQkVHSU5fVEFHX1JFR0VYUCA9IC9ePC8sXG4gIEJFR0lOR19FTkRfVEFHRV9SRUdFWFAgPSAvXjxcXC8vLFxuICBDT01NRU5UX1JFR0VYUCA9IC88IS0tKC4qPyktLT4vZyxcbiAgRE9DVFlQRV9SRUdFWFAgPSAvPCFET0NUWVBFKFtePl0qPyk+L2ksXG4gIENEQVRBX1JFR0VYUCA9IC88IVxcW0NEQVRBXFxbKC4qPyldXT4vZyxcbiAgU1VSUk9HQVRFX1BBSVJfUkVHRVhQID0gL1tcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl0vZyxcbiAgLy8gTWF0Y2ggZXZlcnl0aGluZyBvdXRzaWRlIG9mIG5vcm1hbCBjaGFycyBhbmQgXCIgKHF1b3RlIGNoYXJhY3RlcilcbiAgTk9OX0FMUEhBTlVNRVJJQ19SRUdFWFAgPSAvKFteXFwjLX58IHwhXSkvZztcblxuXG4vLyBHb29kIHNvdXJjZSBvZiBpbmZvIGFib3V0IGVsZW1lbnRzIGFuZCBhdHRyaWJ1dGVzXG4vLyBodHRwOi8vZGV2LnczLm9yZy9odG1sNS9zcGVjL092ZXJ2aWV3Lmh0bWwjc2VtYW50aWNzXG4vLyBodHRwOi8vc2ltb24uaHRtbDUub3JnL2h0bWwtZWxlbWVudHNcblxuLy8gU2FmZSBWb2lkIEVsZW1lbnRzIC0gSFRNTDVcbi8vIGh0dHA6Ly9kZXYudzMub3JnL2h0bWw1L3NwZWMvT3ZlcnZpZXcuaHRtbCN2b2lkLWVsZW1lbnRzXG52YXIgdm9pZEVsZW1lbnRzID0gbWFrZU1hcChcImFyZWEsYnIsY29sLGhyLGltZyx3YnJcIik7XG5cbi8vIEVsZW1lbnRzIHRoYXQgeW91IGNhbiwgaW50ZW50aW9uYWxseSwgbGVhdmUgb3BlbiAoYW5kIHdoaWNoIGNsb3NlIHRoZW1zZWx2ZXMpXG4vLyBodHRwOi8vZGV2LnczLm9yZy9odG1sNS9zcGVjL092ZXJ2aWV3Lmh0bWwjb3B0aW9uYWwtdGFnc1xudmFyIG9wdGlvbmFsRW5kVGFnQmxvY2tFbGVtZW50cyA9IG1ha2VNYXAoXCJjb2xncm91cCxkZCxkdCxsaSxwLHRib2R5LHRkLHRmb290LHRoLHRoZWFkLHRyXCIpLFxuICAgIG9wdGlvbmFsRW5kVGFnSW5saW5lRWxlbWVudHMgPSBtYWtlTWFwKFwicnAscnRcIiksXG4gICAgb3B0aW9uYWxFbmRUYWdFbGVtZW50cyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25hbEVuZFRhZ0lubGluZUVsZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25hbEVuZFRhZ0Jsb2NrRWxlbWVudHMpO1xuXG4vLyBTYWZlIEJsb2NrIEVsZW1lbnRzIC0gSFRNTDVcbnZhciBibG9ja0VsZW1lbnRzID0gYW5ndWxhci5leHRlbmQoe30sIG9wdGlvbmFsRW5kVGFnQmxvY2tFbGVtZW50cywgbWFrZU1hcChcImFkZHJlc3MsYXJ0aWNsZSxcIiArXG4gICAgICAgIFwiYXNpZGUsYmxvY2txdW90ZSxjYXB0aW9uLGNlbnRlcixkZWwsZGlyLGRpdixkbCxmaWd1cmUsZmlnY2FwdGlvbixmb290ZXIsaDEsaDIsaDMsaDQsaDUsXCIgK1xuICAgICAgICBcImg2LGhlYWRlcixoZ3JvdXAsaHIsaW5zLG1hcCxtZW51LG5hdixvbCxwcmUsc2NyaXB0LHNlY3Rpb24sdGFibGUsdWxcIikpO1xuXG4vLyBJbmxpbmUgRWxlbWVudHMgLSBIVE1MNVxudmFyIGlubGluZUVsZW1lbnRzID0gYW5ndWxhci5leHRlbmQoe30sIG9wdGlvbmFsRW5kVGFnSW5saW5lRWxlbWVudHMsIG1ha2VNYXAoXCJhLGFiYnIsYWNyb255bSxiLFwiICtcbiAgICAgICAgXCJiZGksYmRvLGJpZyxicixjaXRlLGNvZGUsZGVsLGRmbixlbSxmb250LGksaW1nLGlucyxrYmQsbGFiZWwsbWFwLG1hcmsscSxydWJ5LHJwLHJ0LHMsXCIgK1xuICAgICAgICBcInNhbXAsc21hbGwsc3BhbixzdHJpa2Usc3Ryb25nLHN1YixzdXAsdGltZSx0dCx1LHZhclwiKSk7XG5cbi8vIFNWRyBFbGVtZW50c1xuLy8gaHR0cHM6Ly93aWtpLndoYXR3Zy5vcmcvd2lraS9TYW5pdGl6YXRpb25fcnVsZXMjc3ZnX0VsZW1lbnRzXG52YXIgc3ZnRWxlbWVudHMgPSBtYWtlTWFwKFwiYW5pbWF0ZSxhbmltYXRlQ29sb3IsYW5pbWF0ZU1vdGlvbixhbmltYXRlVHJhbnNmb3JtLGNpcmNsZSxkZWZzLFwiICtcbiAgICAgICAgXCJkZXNjLGVsbGlwc2UsZm9udC1mYWNlLGZvbnQtZmFjZS1uYW1lLGZvbnQtZmFjZS1zcmMsZyxnbHlwaCxoa2VybixpbWFnZSxsaW5lYXJHcmFkaWVudCxcIiArXG4gICAgICAgIFwibGluZSxtYXJrZXIsbWV0YWRhdGEsbWlzc2luZy1nbHlwaCxtcGF0aCxwYXRoLHBvbHlnb24scG9seWxpbmUscmFkaWFsR3JhZGllbnQscmVjdCxzZXQsXCIgK1xuICAgICAgICBcInN0b3Asc3ZnLHN3aXRjaCx0ZXh0LHRpdGxlLHRzcGFuLHVzZVwiKTtcblxuLy8gU3BlY2lhbCBFbGVtZW50cyAoY2FuIGNvbnRhaW4gYW55dGhpbmcpXG52YXIgc3BlY2lhbEVsZW1lbnRzID0gbWFrZU1hcChcInNjcmlwdCxzdHlsZVwiKTtcblxudmFyIHZhbGlkRWxlbWVudHMgPSBhbmd1bGFyLmV4dGVuZCh7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZEVsZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9ja0VsZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmxpbmVFbGVtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uYWxFbmRUYWdFbGVtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnRWxlbWVudHMpO1xuXG4vL0F0dHJpYnV0ZXMgdGhhdCBoYXZlIGhyZWYgYW5kIGhlbmNlIG5lZWQgdG8gYmUgc2FuaXRpemVkXG52YXIgdXJpQXR0cnMgPSBtYWtlTWFwKFwiYmFja2dyb3VuZCxjaXRlLGhyZWYsbG9uZ2Rlc2Msc3JjLHVzZW1hcCx4bGluazpocmVmXCIpO1xuXG52YXIgaHRtbEF0dHJzID0gbWFrZU1hcCgnYWJicixhbGlnbixhbHQsYXhpcyxiZ2NvbG9yLGJvcmRlcixjZWxscGFkZGluZyxjZWxsc3BhY2luZyxjbGFzcyxjbGVhciwnK1xuICAgICdjb2xvcixjb2xzLGNvbHNwYW4sY29tcGFjdCxjb29yZHMsZGlyLGZhY2UsaGVhZGVycyxoZWlnaHQsaHJlZmxhbmcsaHNwYWNlLCcrXG4gICAgJ2lzbWFwLGxhbmcsbGFuZ3VhZ2Usbm9ocmVmLG5vd3JhcCxyZWwscmV2LHJvd3Mscm93c3BhbixydWxlcywnK1xuICAgICdzY29wZSxzY3JvbGxpbmcsc2hhcGUsc2l6ZSxzcGFuLHN0YXJ0LHN1bW1hcnksdGFyZ2V0LHRpdGxlLHR5cGUsJytcbiAgICAndmFsaWduLHZhbHVlLHZzcGFjZSx3aWR0aCcpO1xuXG4vLyBTVkcgYXR0cmlidXRlcyAod2l0aG91dCBcImlkXCIgYW5kIFwibmFtZVwiIGF0dHJpYnV0ZXMpXG4vLyBodHRwczovL3dpa2kud2hhdHdnLm9yZy93aWtpL1Nhbml0aXphdGlvbl9ydWxlcyNzdmdfQXR0cmlidXRlc1xudmFyIHN2Z0F0dHJzID0gbWFrZU1hcCgnYWNjZW50LWhlaWdodCxhY2N1bXVsYXRlLGFkZGl0aXZlLGFscGhhYmV0aWMsYXJhYmljLWZvcm0sYXNjZW50LCcrXG4gICAgJ2F0dHJpYnV0ZU5hbWUsYXR0cmlidXRlVHlwZSxiYXNlUHJvZmlsZSxiYm94LGJlZ2luLGJ5LGNhbGNNb2RlLGNhcC1oZWlnaHQsY2xhc3MsY29sb3IsJytcbiAgICAnY29sb3ItcmVuZGVyaW5nLGNvbnRlbnQsY3gsY3ksZCxkeCxkeSxkZXNjZW50LGRpc3BsYXksZHVyLGVuZCxmaWxsLGZpbGwtcnVsZSxmb250LWZhbWlseSwnK1xuICAgICdmb250LXNpemUsZm9udC1zdHJldGNoLGZvbnQtc3R5bGUsZm9udC12YXJpYW50LGZvbnQtd2VpZ2h0LGZyb20sZngsZnksZzEsZzIsZ2x5cGgtbmFtZSwnK1xuICAgICdncmFkaWVudFVuaXRzLGhhbmdpbmcsaGVpZ2h0LGhvcml6LWFkdi14LGhvcml6LW9yaWdpbi14LGlkZW9ncmFwaGljLGssa2V5UG9pbnRzLCcrXG4gICAgJ2tleVNwbGluZXMsa2V5VGltZXMsbGFuZyxtYXJrZXItZW5kLG1hcmtlci1taWQsbWFya2VyLXN0YXJ0LG1hcmtlckhlaWdodCxtYXJrZXJVbml0cywnK1xuICAgICdtYXJrZXJXaWR0aCxtYXRoZW1hdGljYWwsbWF4LG1pbixvZmZzZXQsb3BhY2l0eSxvcmllbnQsb3JpZ2luLG92ZXJsaW5lLXBvc2l0aW9uLCcrXG4gICAgJ292ZXJsaW5lLXRoaWNrbmVzcyxwYW5vc2UtMSxwYXRoLHBhdGhMZW5ndGgscG9pbnRzLHByZXNlcnZlQXNwZWN0UmF0aW8scixyZWZYLHJlZlksJytcbiAgICAncmVwZWF0Q291bnQscmVwZWF0RHVyLHJlcXVpcmVkRXh0ZW5zaW9ucyxyZXF1aXJlZEZlYXR1cmVzLHJlc3RhcnQscm90YXRlLHJ4LHJ5LHNsb3BlLHN0ZW1oLCcrXG4gICAgJ3N0ZW12LHN0b3AtY29sb3Isc3RvcC1vcGFjaXR5LHN0cmlrZXRocm91Z2gtcG9zaXRpb24sc3RyaWtldGhyb3VnaC10aGlja25lc3Msc3Ryb2tlLCcrXG4gICAgJ3N0cm9rZS1kYXNoYXJyYXksc3Ryb2tlLWRhc2hvZmZzZXQsc3Ryb2tlLWxpbmVjYXAsc3Ryb2tlLWxpbmVqb2luLHN0cm9rZS1taXRlcmxpbWl0LCcrXG4gICAgJ3N0cm9rZS1vcGFjaXR5LHN0cm9rZS13aWR0aCxzeXN0ZW1MYW5ndWFnZSx0YXJnZXQsdGV4dC1hbmNob3IsdG8sdHJhbnNmb3JtLHR5cGUsdTEsdTIsJytcbiAgICAndW5kZXJsaW5lLXBvc2l0aW9uLHVuZGVybGluZS10aGlja25lc3MsdW5pY29kZSx1bmljb2RlLXJhbmdlLHVuaXRzLXBlci1lbSx2YWx1ZXMsdmVyc2lvbiwnK1xuICAgICd2aWV3Qm94LHZpc2liaWxpdHksd2lkdGgsd2lkdGhzLHgseC1oZWlnaHQseDEseDIseGxpbms6YWN0dWF0ZSx4bGluazphcmNyb2xlLHhsaW5rOnJvbGUsJytcbiAgICAneGxpbms6c2hvdyx4bGluazp0aXRsZSx4bGluazp0eXBlLHhtbDpiYXNlLHhtbDpsYW5nLHhtbDpzcGFjZSx4bWxucyx4bWxuczp4bGluayx5LHkxLHkyLCcrXG4gICAgJ3pvb21BbmRQYW4nKTtcblxudmFyIHZhbGlkQXR0cnMgPSBhbmd1bGFyLmV4dGVuZCh7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJpQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN2Z0F0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sQXR0cnMpO1xuXG5mdW5jdGlvbiBtYWtlTWFwKHN0cikge1xuICB2YXIgb2JqID0ge30sIGl0ZW1zID0gc3RyLnNwbGl0KCcsJyksIGk7XG4gIGZvciAoaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykgb2JqW2l0ZW1zW2ldXSA9IHRydWU7XG4gIHJldHVybiBvYmo7XG59XG5cblxuLyoqXG4gKiBAZXhhbXBsZVxuICogaHRtbFBhcnNlcihodG1sU3RyaW5nLCB7XG4gKiAgICAgc3RhcnQ6IGZ1bmN0aW9uKHRhZywgYXR0cnMsIHVuYXJ5KSB7fSxcbiAqICAgICBlbmQ6IGZ1bmN0aW9uKHRhZykge30sXG4gKiAgICAgY2hhcnM6IGZ1bmN0aW9uKHRleHQpIHt9LFxuICogICAgIGNvbW1lbnQ6IGZ1bmN0aW9uKHRleHQpIHt9XG4gKiB9KTtcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBzdHJpbmdcbiAqIEBwYXJhbSB7b2JqZWN0fSBoYW5kbGVyXG4gKi9cbmZ1bmN0aW9uIGh0bWxQYXJzZXIoaHRtbCwgaGFuZGxlcikge1xuICBpZiAodHlwZW9mIGh0bWwgIT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKGh0bWwgPT09IG51bGwgfHwgdHlwZW9mIGh0bWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBodG1sID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGh0bWwgPSAnJyArIGh0bWw7XG4gICAgfVxuICB9XG4gIHZhciBpbmRleCwgY2hhcnMsIG1hdGNoLCBzdGFjayA9IFtdLCBsYXN0ID0gaHRtbCwgdGV4dDtcbiAgc3RhY2subGFzdCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3RhY2tbIHN0YWNrLmxlbmd0aCAtIDEgXTsgfTtcblxuICB3aGlsZSAoaHRtbCkge1xuICAgIHRleHQgPSAnJztcbiAgICBjaGFycyA9IHRydWU7XG5cbiAgICAvLyBNYWtlIHN1cmUgd2UncmUgbm90IGluIGEgc2NyaXB0IG9yIHN0eWxlIGVsZW1lbnRcbiAgICBpZiAoIXN0YWNrLmxhc3QoKSB8fCAhc3BlY2lhbEVsZW1lbnRzWyBzdGFjay5sYXN0KCkgXSkge1xuXG4gICAgICAvLyBDb21tZW50XG4gICAgICBpZiAoaHRtbC5pbmRleE9mKFwiPCEtLVwiKSA9PT0gMCkge1xuICAgICAgICAvLyBjb21tZW50cyBjb250YWluaW5nIC0tIGFyZSBub3QgYWxsb3dlZCB1bmxlc3MgdGhleSB0ZXJtaW5hdGUgdGhlIGNvbW1lbnRcbiAgICAgICAgaW5kZXggPSBodG1sLmluZGV4T2YoXCItLVwiLCA0KTtcblxuICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBodG1sLmxhc3RJbmRleE9mKFwiLS0+XCIsIGluZGV4KSA9PT0gaW5kZXgpIHtcbiAgICAgICAgICBpZiAoaGFuZGxlci5jb21tZW50KSBoYW5kbGVyLmNvbW1lbnQoaHRtbC5zdWJzdHJpbmcoNCwgaW5kZXgpKTtcbiAgICAgICAgICBodG1sID0gaHRtbC5zdWJzdHJpbmcoaW5kZXggKyAzKTtcbiAgICAgICAgICBjaGFycyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAvLyBET0NUWVBFXG4gICAgICB9IGVsc2UgaWYgKERPQ1RZUEVfUkVHRVhQLnRlc3QoaHRtbCkpIHtcbiAgICAgICAgbWF0Y2ggPSBodG1sLm1hdGNoKERPQ1RZUEVfUkVHRVhQKTtcblxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKG1hdGNoWzBdLCAnJyk7XG4gICAgICAgICAgY2hhcnMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgLy8gZW5kIHRhZ1xuICAgICAgfSBlbHNlIGlmIChCRUdJTkdfRU5EX1RBR0VfUkVHRVhQLnRlc3QoaHRtbCkpIHtcbiAgICAgICAgbWF0Y2ggPSBodG1sLm1hdGNoKEVORF9UQUdfUkVHRVhQKTtcblxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICBodG1sID0gaHRtbC5zdWJzdHJpbmcobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgICBtYXRjaFswXS5yZXBsYWNlKEVORF9UQUdfUkVHRVhQLCBwYXJzZUVuZFRhZyk7XG4gICAgICAgICAgY2hhcnMgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAvLyBzdGFydCB0YWdcbiAgICAgIH0gZWxzZSBpZiAoQkVHSU5fVEFHX1JFR0VYUC50ZXN0KGh0bWwpKSB7XG4gICAgICAgIG1hdGNoID0gaHRtbC5tYXRjaChTVEFSVF9UQUdfUkVHRVhQKTtcblxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAvLyBXZSBvbmx5IGhhdmUgYSB2YWxpZCBzdGFydC10YWcgaWYgdGhlcmUgaXMgYSAnPicuXG4gICAgICAgICAgaWYgKG1hdGNoWzRdKSB7XG4gICAgICAgICAgICBodG1sID0gaHRtbC5zdWJzdHJpbmcobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgICAgIG1hdGNoWzBdLnJlcGxhY2UoU1RBUlRfVEFHX1JFR0VYUCwgcGFyc2VTdGFydFRhZyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNoYXJzID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbm8gZW5kaW5nIHRhZyBmb3VuZCAtLS0gdGhpcyBwaWVjZSBzaG91bGQgYmUgZW5jb2RlZCBhcyBhbiBlbnRpdHkuXG4gICAgICAgICAgdGV4dCArPSAnPCc7XG4gICAgICAgICAgaHRtbCA9IGh0bWwuc3Vic3RyaW5nKDEpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjaGFycykge1xuICAgICAgICBpbmRleCA9IGh0bWwuaW5kZXhPZihcIjxcIik7XG5cbiAgICAgICAgdGV4dCArPSBpbmRleCA8IDAgPyBodG1sIDogaHRtbC5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuICAgICAgICBodG1sID0gaW5kZXggPCAwID8gXCJcIiA6IGh0bWwuc3Vic3RyaW5nKGluZGV4KTtcblxuICAgICAgICBpZiAoaGFuZGxlci5jaGFycykgaGFuZGxlci5jaGFycyhkZWNvZGVFbnRpdGllcyh0ZXh0KSk7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShuZXcgUmVnRXhwKFwiKC4qKTxcXFxccypcXFxcL1xcXFxzKlwiICsgc3RhY2subGFzdCgpICsgXCJbXj5dKj5cIiwgJ2knKSxcbiAgICAgICAgZnVuY3Rpb24oYWxsLCB0ZXh0KSB7XG4gICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShDT01NRU5UX1JFR0VYUCwgXCIkMVwiKS5yZXBsYWNlKENEQVRBX1JFR0VYUCwgXCIkMVwiKTtcblxuICAgICAgICAgIGlmIChoYW5kbGVyLmNoYXJzKSBoYW5kbGVyLmNoYXJzKGRlY29kZUVudGl0aWVzKHRleHQpKTtcblxuICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgfSk7XG5cbiAgICAgIHBhcnNlRW5kVGFnKFwiXCIsIHN0YWNrLmxhc3QoKSk7XG4gICAgfVxuXG4gICAgaWYgKGh0bWwgPT0gbGFzdCkge1xuICAgICAgdGhyb3cgJHNhbml0aXplTWluRXJyKCdiYWRwYXJzZScsIFwiVGhlIHNhbml0aXplciB3YXMgdW5hYmxlIHRvIHBhcnNlIHRoZSBmb2xsb3dpbmcgYmxvY2sgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwib2YgaHRtbDogezB9XCIsIGh0bWwpO1xuICAgIH1cbiAgICBsYXN0ID0gaHRtbDtcbiAgfVxuXG4gIC8vIENsZWFuIHVwIGFueSByZW1haW5pbmcgdGFnc1xuICBwYXJzZUVuZFRhZygpO1xuXG4gIGZ1bmN0aW9uIHBhcnNlU3RhcnRUYWcodGFnLCB0YWdOYW1lLCByZXN0LCB1bmFyeSkge1xuICAgIHRhZ05hbWUgPSBhbmd1bGFyLmxvd2VyY2FzZSh0YWdOYW1lKTtcbiAgICBpZiAoYmxvY2tFbGVtZW50c1sgdGFnTmFtZSBdKSB7XG4gICAgICB3aGlsZSAoc3RhY2subGFzdCgpICYmIGlubGluZUVsZW1lbnRzWyBzdGFjay5sYXN0KCkgXSkge1xuICAgICAgICBwYXJzZUVuZFRhZyhcIlwiLCBzdGFjay5sYXN0KCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvcHRpb25hbEVuZFRhZ0VsZW1lbnRzWyB0YWdOYW1lIF0gJiYgc3RhY2subGFzdCgpID09IHRhZ05hbWUpIHtcbiAgICAgIHBhcnNlRW5kVGFnKFwiXCIsIHRhZ05hbWUpO1xuICAgIH1cblxuICAgIHVuYXJ5ID0gdm9pZEVsZW1lbnRzWyB0YWdOYW1lIF0gfHwgISF1bmFyeTtcblxuICAgIGlmICghdW5hcnkpXG4gICAgICBzdGFjay5wdXNoKHRhZ05hbWUpO1xuXG4gICAgdmFyIGF0dHJzID0ge307XG5cbiAgICByZXN0LnJlcGxhY2UoQVRUUl9SRUdFWFAsXG4gICAgICBmdW5jdGlvbihtYXRjaCwgbmFtZSwgZG91YmxlUXVvdGVkVmFsdWUsIHNpbmdsZVF1b3RlZFZhbHVlLCB1bnF1b3RlZFZhbHVlKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGRvdWJsZVF1b3RlZFZhbHVlXG4gICAgICAgICAgfHwgc2luZ2xlUXVvdGVkVmFsdWVcbiAgICAgICAgICB8fCB1bnF1b3RlZFZhbHVlXG4gICAgICAgICAgfHwgJyc7XG5cbiAgICAgICAgYXR0cnNbbmFtZV0gPSBkZWNvZGVFbnRpdGllcyh2YWx1ZSk7XG4gICAgfSk7XG4gICAgaWYgKGhhbmRsZXIuc3RhcnQpIGhhbmRsZXIuc3RhcnQodGFnTmFtZSwgYXR0cnMsIHVuYXJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlRW5kVGFnKHRhZywgdGFnTmFtZSkge1xuICAgIHZhciBwb3MgPSAwLCBpO1xuICAgIHRhZ05hbWUgPSBhbmd1bGFyLmxvd2VyY2FzZSh0YWdOYW1lKTtcbiAgICBpZiAodGFnTmFtZSlcbiAgICAgIC8vIEZpbmQgdGhlIGNsb3Nlc3Qgb3BlbmVkIHRhZyBvZiB0aGUgc2FtZSB0eXBlXG4gICAgICBmb3IgKHBvcyA9IHN0YWNrLmxlbmd0aCAtIDE7IHBvcyA+PSAwOyBwb3MtLSlcbiAgICAgICAgaWYgKHN0YWNrWyBwb3MgXSA9PSB0YWdOYW1lKVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgaWYgKHBvcyA+PSAwKSB7XG4gICAgICAvLyBDbG9zZSBhbGwgdGhlIG9wZW4gZWxlbWVudHMsIHVwIHRoZSBzdGFja1xuICAgICAgZm9yIChpID0gc3RhY2subGVuZ3RoIC0gMTsgaSA+PSBwb3M7IGktLSlcbiAgICAgICAgaWYgKGhhbmRsZXIuZW5kKSBoYW5kbGVyLmVuZChzdGFja1sgaSBdKTtcblxuICAgICAgLy8gUmVtb3ZlIHRoZSBvcGVuIGVsZW1lbnRzIGZyb20gdGhlIHN0YWNrXG4gICAgICBzdGFjay5sZW5ndGggPSBwb3M7XG4gICAgfVxuICB9XG59XG5cbnZhciBoaWRkZW5QcmU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInByZVwiKTtcbnZhciBzcGFjZVJlID0gL14oXFxzKikoW1xcc1xcU10qPykoXFxzKikkLztcbi8qKlxuICogZGVjb2RlcyBhbGwgZW50aXRpZXMgaW50byByZWd1bGFyIHN0cmluZ1xuICogQHBhcmFtIHZhbHVlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBBIHN0cmluZyB3aXRoIGRlY29kZWQgZW50aXRpZXMuXG4gKi9cbmZ1bmN0aW9uIGRlY29kZUVudGl0aWVzKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHsgcmV0dXJuICcnOyB9XG5cbiAgLy8gTm90ZTogSUU4IGRvZXMgbm90IHByZXNlcnZlIHNwYWNlcyBhdCB0aGUgc3RhcnQvZW5kIG9mIGlubmVySFRNTFxuICAvLyBzbyB3ZSBtdXN0IGNhcHR1cmUgdGhlbSBhbmQgcmVhdHRhY2ggdGhlbSBhZnRlcndhcmRcbiAgdmFyIHBhcnRzID0gc3BhY2VSZS5leGVjKHZhbHVlKTtcbiAgdmFyIHNwYWNlQmVmb3JlID0gcGFydHNbMV07XG4gIHZhciBzcGFjZUFmdGVyID0gcGFydHNbM107XG4gIHZhciBjb250ZW50ID0gcGFydHNbMl07XG4gIGlmIChjb250ZW50KSB7XG4gICAgaGlkZGVuUHJlLmlubmVySFRNTD1jb250ZW50LnJlcGxhY2UoLzwvZyxcIiZsdDtcIik7XG4gICAgLy8gaW5uZXJUZXh0IGRlcGVuZHMgb24gc3R5bGluZyBhcyBpdCBkb2Vzbid0IGRpc3BsYXkgaGlkZGVuIGVsZW1lbnRzLlxuICAgIC8vIFRoZXJlZm9yZSwgaXQncyBiZXR0ZXIgdG8gdXNlIHRleHRDb250ZW50IG5vdCB0byBjYXVzZSB1bm5lY2Vzc2FyeVxuICAgIC8vIHJlZmxvd3MuIEhvd2V2ZXIsIElFPDkgZG9uJ3Qgc3VwcG9ydCB0ZXh0Q29udGVudCBzbyB0aGUgaW5uZXJUZXh0XG4gICAgLy8gZmFsbGJhY2sgaXMgbmVjZXNzYXJ5LlxuICAgIGNvbnRlbnQgPSAndGV4dENvbnRlbnQnIGluIGhpZGRlblByZSA/XG4gICAgICBoaWRkZW5QcmUudGV4dENvbnRlbnQgOiBoaWRkZW5QcmUuaW5uZXJUZXh0O1xuICB9XG4gIHJldHVybiBzcGFjZUJlZm9yZSArIGNvbnRlbnQgKyBzcGFjZUFmdGVyO1xufVxuXG4vKipcbiAqIEVzY2FwZXMgYWxsIHBvdGVudGlhbGx5IGRhbmdlcm91cyBjaGFyYWN0ZXJzLCBzbyB0aGF0IHRoZVxuICogcmVzdWx0aW5nIHN0cmluZyBjYW4gYmUgc2FmZWx5IGluc2VydGVkIGludG8gYXR0cmlidXRlIG9yXG4gKiBlbGVtZW50IHRleHQuXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IGVzY2FwZWQgdGV4dFxuICovXG5mdW5jdGlvbiBlbmNvZGVFbnRpdGllcyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUuXG4gICAgcmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5cbiAgICByZXBsYWNlKFNVUlJPR0FURV9QQUlSX1JFR0VYUCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhciBoaSA9IHZhbHVlLmNoYXJDb2RlQXQoMCk7XG4gICAgICB2YXIgbG93ID0gdmFsdWUuY2hhckNvZGVBdCgxKTtcbiAgICAgIHJldHVybiAnJiMnICsgKCgoaGkgLSAweEQ4MDApICogMHg0MDApICsgKGxvdyAtIDB4REMwMCkgKyAweDEwMDAwKSArICc7JztcbiAgICB9KS5cbiAgICByZXBsYWNlKE5PTl9BTFBIQU5VTUVSSUNfUkVHRVhQLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuICcmIycgKyB2YWx1ZS5jaGFyQ29kZUF0KDApICsgJzsnO1xuICAgIH0pLlxuICAgIHJlcGxhY2UoLzwvZywgJyZsdDsnKS5cbiAgICByZXBsYWNlKC8+L2csICcmZ3Q7Jyk7XG59XG5cbi8qKlxuICogY3JlYXRlIGFuIEhUTUwvWE1MIHdyaXRlciB3aGljaCB3cml0ZXMgdG8gYnVmZmVyXG4gKiBAcGFyYW0ge0FycmF5fSBidWYgdXNlIGJ1Zi5qYWluKCcnKSB0byBnZXQgb3V0IHNhbml0aXplZCBodG1sIHN0cmluZ1xuICogQHJldHVybnMge29iamVjdH0gaW4gdGhlIGZvcm0gb2Yge1xuICogICAgIHN0YXJ0OiBmdW5jdGlvbih0YWcsIGF0dHJzLCB1bmFyeSkge30sXG4gKiAgICAgZW5kOiBmdW5jdGlvbih0YWcpIHt9LFxuICogICAgIGNoYXJzOiBmdW5jdGlvbih0ZXh0KSB7fSxcbiAqICAgICBjb21tZW50OiBmdW5jdGlvbih0ZXh0KSB7fVxuICogfVxuICovXG5mdW5jdGlvbiBodG1sU2FuaXRpemVXcml0ZXIoYnVmLCB1cmlWYWxpZGF0b3IpIHtcbiAgdmFyIGlnbm9yZSA9IGZhbHNlO1xuICB2YXIgb3V0ID0gYW5ndWxhci5iaW5kKGJ1ZiwgYnVmLnB1c2gpO1xuICByZXR1cm4ge1xuICAgIHN0YXJ0OiBmdW5jdGlvbih0YWcsIGF0dHJzLCB1bmFyeSkge1xuICAgICAgdGFnID0gYW5ndWxhci5sb3dlcmNhc2UodGFnKTtcbiAgICAgIGlmICghaWdub3JlICYmIHNwZWNpYWxFbGVtZW50c1t0YWddKSB7XG4gICAgICAgIGlnbm9yZSA9IHRhZztcbiAgICAgIH1cbiAgICAgIGlmICghaWdub3JlICYmIHZhbGlkRWxlbWVudHNbdGFnXSA9PT0gdHJ1ZSkge1xuICAgICAgICBvdXQoJzwnKTtcbiAgICAgICAgb3V0KHRhZyk7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChhdHRycywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgIHZhciBsa2V5PWFuZ3VsYXIubG93ZXJjYXNlKGtleSk7XG4gICAgICAgICAgdmFyIGlzSW1hZ2UgPSAodGFnID09PSAnaW1nJyAmJiBsa2V5ID09PSAnc3JjJykgfHwgKGxrZXkgPT09ICdiYWNrZ3JvdW5kJyk7XG4gICAgICAgICAgaWYgKHZhbGlkQXR0cnNbbGtleV0gPT09IHRydWUgJiZcbiAgICAgICAgICAgICh1cmlBdHRyc1tsa2V5XSAhPT0gdHJ1ZSB8fCB1cmlWYWxpZGF0b3IodmFsdWUsIGlzSW1hZ2UpKSkge1xuICAgICAgICAgICAgb3V0KCcgJyk7XG4gICAgICAgICAgICBvdXQoa2V5KTtcbiAgICAgICAgICAgIG91dCgnPVwiJyk7XG4gICAgICAgICAgICBvdXQoZW5jb2RlRW50aXRpZXModmFsdWUpKTtcbiAgICAgICAgICAgIG91dCgnXCInKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvdXQodW5hcnkgPyAnLz4nIDogJz4nKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVuZDogZnVuY3Rpb24odGFnKSB7XG4gICAgICAgIHRhZyA9IGFuZ3VsYXIubG93ZXJjYXNlKHRhZyk7XG4gICAgICAgIGlmICghaWdub3JlICYmIHZhbGlkRWxlbWVudHNbdGFnXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIG91dCgnPC8nKTtcbiAgICAgICAgICBvdXQodGFnKTtcbiAgICAgICAgICBvdXQoJz4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnID09IGlnbm9yZSkge1xuICAgICAgICAgIGlnbm9yZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIGNoYXJzOiBmdW5jdGlvbihjaGFycykge1xuICAgICAgICBpZiAoIWlnbm9yZSkge1xuICAgICAgICAgIG91dChlbmNvZGVFbnRpdGllcyhjaGFycykpO1xuICAgICAgICB9XG4gICAgICB9XG4gIH07XG59XG5cblxuLy8gZGVmaW5lIG5nU2FuaXRpemUgbW9kdWxlIGFuZCByZWdpc3RlciAkc2FuaXRpemUgc2VydmljZVxuYW5ndWxhci5tb2R1bGUoJ25nU2FuaXRpemUnLCBbXSkucHJvdmlkZXIoJyRzYW5pdGl6ZScsICRTYW5pdGl6ZVByb3ZpZGVyKTtcblxuLyogZ2xvYmFsIHNhbml0aXplVGV4dDogZmFsc2UgKi9cblxuLyoqXG4gKiBAbmdkb2MgZmlsdGVyXG4gKiBAbmFtZSBsaW5reVxuICogQGtpbmQgZnVuY3Rpb25cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEZpbmRzIGxpbmtzIGluIHRleHQgaW5wdXQgYW5kIHR1cm5zIHRoZW0gaW50byBodG1sIGxpbmtzLiBTdXBwb3J0cyBodHRwL2h0dHBzL2Z0cC9tYWlsdG8gYW5kXG4gKiBwbGFpbiBlbWFpbCBhZGRyZXNzIGxpbmtzLlxuICpcbiAqIFJlcXVpcmVzIHRoZSB7QGxpbmsgbmdTYW5pdGl6ZSBgbmdTYW5pdGl6ZWB9IG1vZHVsZSB0byBiZSBpbnN0YWxsZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgSW5wdXQgdGV4dC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXQgV2luZG93IChfYmxhbmt8X3NlbGZ8X3BhcmVudHxfdG9wKSBvciBuYW1lZCBmcmFtZSB0byBvcGVuIGxpbmtzIGluLlxuICogQHJldHVybnMge3N0cmluZ30gSHRtbC1saW5raWZpZWQgdGV4dC5cbiAqXG4gKiBAdXNhZ2VcbiAgIDxzcGFuIG5nLWJpbmQtaHRtbD1cImxpbmt5X2V4cHJlc3Npb24gfCBsaW5reVwiPjwvc3Bhbj5cbiAqXG4gKiBAZXhhbXBsZVxuICAgPGV4YW1wbGUgbW9kdWxlPVwibGlua3lFeGFtcGxlXCIgZGVwcz1cImFuZ3VsYXItc2FuaXRpemUuanNcIj5cbiAgICAgPGZpbGUgbmFtZT1cImluZGV4Lmh0bWxcIj5cbiAgICAgICA8c2NyaXB0PlxuICAgICAgICAgYW5ndWxhci5tb2R1bGUoJ2xpbmt5RXhhbXBsZScsIFsnbmdTYW5pdGl6ZSddKVxuICAgICAgICAgICAuY29udHJvbGxlcignRXhhbXBsZUNvbnRyb2xsZXInLCBbJyRzY29wZScsIGZ1bmN0aW9uKCRzY29wZSkge1xuICAgICAgICAgICAgICRzY29wZS5zbmlwcGV0ID1cbiAgICAgICAgICAgICAgICdQcmV0dHkgdGV4dCB3aXRoIHNvbWUgbGlua3M6XFxuJytcbiAgICAgICAgICAgICAgICdodHRwOi8vYW5ndWxhcmpzLm9yZy8sXFxuJytcbiAgICAgICAgICAgICAgICdtYWlsdG86dXNAc29tZXdoZXJlLm9yZyxcXG4nK1xuICAgICAgICAgICAgICAgJ2Fub3RoZXJAc29tZXdoZXJlLm9yZyxcXG4nK1xuICAgICAgICAgICAgICAgJ2FuZCBvbmUgbW9yZTogZnRwOi8vMTI3LjAuMC4xLy4nO1xuICAgICAgICAgICAgICRzY29wZS5zbmlwcGV0V2l0aFRhcmdldCA9ICdodHRwOi8vYW5ndWxhcmpzLm9yZy8nO1xuICAgICAgICAgICB9XSk7XG4gICAgICAgPC9zY3JpcHQ+XG4gICAgICAgPGRpdiBuZy1jb250cm9sbGVyPVwiRXhhbXBsZUNvbnRyb2xsZXJcIj5cbiAgICAgICBTbmlwcGV0OiA8dGV4dGFyZWEgbmctbW9kZWw9XCJzbmlwcGV0XCIgY29scz1cIjYwXCIgcm93cz1cIjNcIj48L3RleHRhcmVhPlxuICAgICAgIDx0YWJsZT5cbiAgICAgICAgIDx0cj5cbiAgICAgICAgICAgPHRkPkZpbHRlcjwvdGQ+XG4gICAgICAgICAgIDx0ZD5Tb3VyY2U8L3RkPlxuICAgICAgICAgICA8dGQ+UmVuZGVyZWQ8L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICAgIDx0ciBpZD1cImxpbmt5LWZpbHRlclwiPlxuICAgICAgICAgICA8dGQ+bGlua3kgZmlsdGVyPC90ZD5cbiAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgIDxwcmU+Jmx0O2RpdiBuZy1iaW5kLWh0bWw9XCJzbmlwcGV0IHwgbGlua3lcIiZndDs8YnI+Jmx0Oy9kaXYmZ3Q7PC9wcmU+XG4gICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICA8ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXQgfCBsaW5reVwiPjwvZGl2PlxuICAgICAgICAgICA8L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICAgIDx0ciBpZD1cImxpbmt5LXRhcmdldFwiPlxuICAgICAgICAgIDx0ZD5saW5reSB0YXJnZXQ8L3RkPlxuICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgIDxwcmU+Jmx0O2RpdiBuZy1iaW5kLWh0bWw9XCJzbmlwcGV0V2l0aFRhcmdldCB8IGxpbmt5OidfYmxhbmsnXCImZ3Q7PGJyPiZsdDsvZGl2Jmd0OzwvcHJlPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGRpdiBuZy1iaW5kLWh0bWw9XCJzbmlwcGV0V2l0aFRhcmdldCB8IGxpbmt5OidfYmxhbmsnXCI+PC9kaXY+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgIDwvdHI+XG4gICAgICAgICA8dHIgaWQ9XCJlc2NhcGVkLWh0bWxcIj5cbiAgICAgICAgICAgPHRkPm5vIGZpbHRlcjwvdGQ+XG4gICAgICAgICAgIDx0ZD48cHJlPiZsdDtkaXYgbmctYmluZD1cInNuaXBwZXRcIiZndDs8YnI+Jmx0Oy9kaXYmZ3Q7PC9wcmU+PC90ZD5cbiAgICAgICAgICAgPHRkPjxkaXYgbmctYmluZD1cInNuaXBwZXRcIj48L2Rpdj48L3RkPlxuICAgICAgICAgPC90cj5cbiAgICAgICA8L3RhYmxlPlxuICAgICA8L2ZpbGU+XG4gICAgIDxmaWxlIG5hbWU9XCJwcm90cmFjdG9yLmpzXCIgdHlwZT1cInByb3RyYWN0b3JcIj5cbiAgICAgICBpdCgnc2hvdWxkIGxpbmtpZnkgdGhlIHNuaXBwZXQgd2l0aCB1cmxzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICBleHBlY3QoZWxlbWVudChieS5pZCgnbGlua3ktZmlsdGVyJykpLmVsZW1lbnQoYnkuYmluZGluZygnc25pcHBldCB8IGxpbmt5JykpLmdldFRleHQoKSkuXG4gICAgICAgICAgICAgdG9CZSgnUHJldHR5IHRleHQgd2l0aCBzb21lIGxpbmtzOiBodHRwOi8vYW5ndWxhcmpzLm9yZy8sIHVzQHNvbWV3aGVyZS5vcmcsICcgK1xuICAgICAgICAgICAgICAgICAgJ2Fub3RoZXJAc29tZXdoZXJlLm9yZywgYW5kIG9uZSBtb3JlOiBmdHA6Ly8xMjcuMC4wLjEvLicpO1xuICAgICAgICAgZXhwZWN0KGVsZW1lbnQuYWxsKGJ5LmNzcygnI2xpbmt5LWZpbHRlciBhJykpLmNvdW50KCkpLnRvRXF1YWwoNCk7XG4gICAgICAgfSk7XG5cbiAgICAgICBpdCgnc2hvdWxkIG5vdCBsaW5raWZ5IHNuaXBwZXQgd2l0aG91dCB0aGUgbGlua3kgZmlsdGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICBleHBlY3QoZWxlbWVudChieS5pZCgnZXNjYXBlZC1odG1sJykpLmVsZW1lbnQoYnkuYmluZGluZygnc25pcHBldCcpKS5nZXRUZXh0KCkpLlxuICAgICAgICAgICAgIHRvQmUoJ1ByZXR0eSB0ZXh0IHdpdGggc29tZSBsaW5rczogaHR0cDovL2FuZ3VsYXJqcy5vcmcvLCBtYWlsdG86dXNAc29tZXdoZXJlLm9yZywgJyArXG4gICAgICAgICAgICAgICAgICAnYW5vdGhlckBzb21ld2hlcmUub3JnLCBhbmQgb25lIG1vcmU6IGZ0cDovLzEyNy4wLjAuMS8uJyk7XG4gICAgICAgICBleHBlY3QoZWxlbWVudC5hbGwoYnkuY3NzKCcjZXNjYXBlZC1odG1sIGEnKSkuY291bnQoKSkudG9FcXVhbCgwKTtcbiAgICAgICB9KTtcblxuICAgICAgIGl0KCdzaG91bGQgdXBkYXRlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICBlbGVtZW50KGJ5Lm1vZGVsKCdzbmlwcGV0JykpLmNsZWFyKCk7XG4gICAgICAgICBlbGVtZW50KGJ5Lm1vZGVsKCdzbmlwcGV0JykpLnNlbmRLZXlzKCduZXcgaHR0cDovL2xpbmsuJyk7XG4gICAgICAgICBleHBlY3QoZWxlbWVudChieS5pZCgnbGlua3ktZmlsdGVyJykpLmVsZW1lbnQoYnkuYmluZGluZygnc25pcHBldCB8IGxpbmt5JykpLmdldFRleHQoKSkuXG4gICAgICAgICAgICAgdG9CZSgnbmV3IGh0dHA6Ly9saW5rLicpO1xuICAgICAgICAgZXhwZWN0KGVsZW1lbnQuYWxsKGJ5LmNzcygnI2xpbmt5LWZpbHRlciBhJykpLmNvdW50KCkpLnRvRXF1YWwoMSk7XG4gICAgICAgICBleHBlY3QoZWxlbWVudChieS5pZCgnZXNjYXBlZC1odG1sJykpLmVsZW1lbnQoYnkuYmluZGluZygnc25pcHBldCcpKS5nZXRUZXh0KCkpXG4gICAgICAgICAgICAgLnRvQmUoJ25ldyBodHRwOi8vbGluay4nKTtcbiAgICAgICB9KTtcblxuICAgICAgIGl0KCdzaG91bGQgd29yayB3aXRoIHRoZSB0YXJnZXQgcHJvcGVydHknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuaWQoJ2xpbmt5LXRhcmdldCcpKS5cbiAgICAgICAgICAgIGVsZW1lbnQoYnkuYmluZGluZyhcInNuaXBwZXRXaXRoVGFyZ2V0IHwgbGlua3k6J19ibGFuaydcIikpLmdldFRleHQoKSkuXG4gICAgICAgICAgICB0b0JlKCdodHRwOi8vYW5ndWxhcmpzLm9yZy8nKTtcbiAgICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjbGlua3ktdGFyZ2V0IGEnKSkuZ2V0QXR0cmlidXRlKCd0YXJnZXQnKSkudG9FcXVhbCgnX2JsYW5rJyk7XG4gICAgICAgfSk7XG4gICAgIDwvZmlsZT5cbiAgIDwvZXhhbXBsZT5cbiAqL1xuYW5ndWxhci5tb2R1bGUoJ25nU2FuaXRpemUnKS5maWx0ZXIoJ2xpbmt5JywgWyckc2FuaXRpemUnLCBmdW5jdGlvbigkc2FuaXRpemUpIHtcbiAgdmFyIExJTktZX1VSTF9SRUdFWFAgPVxuICAgICAgICAvKChmdHB8aHR0cHM/KTpcXC9cXC98KG1haWx0bzopP1tBLVphLXowLTkuXyUrLV0rQClcXFMqW15cXHMuOywoKXt9PD5cIl0vLFxuICAgICAgTUFJTFRPX1JFR0VYUCA9IC9ebWFpbHRvOi87XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHRleHQsIHRhcmdldCkge1xuICAgIGlmICghdGV4dCkgcmV0dXJuIHRleHQ7XG4gICAgdmFyIG1hdGNoO1xuICAgIHZhciByYXcgPSB0ZXh0O1xuICAgIHZhciBodG1sID0gW107XG4gICAgdmFyIHVybDtcbiAgICB2YXIgaTtcbiAgICB3aGlsZSAoKG1hdGNoID0gcmF3Lm1hdGNoKExJTktZX1VSTF9SRUdFWFApKSkge1xuICAgICAgLy8gV2UgY2FuIG5vdCBlbmQgaW4gdGhlc2UgYXMgdGhleSBhcmUgc29tZXRpbWVzIGZvdW5kIGF0IHRoZSBlbmQgb2YgdGhlIHNlbnRlbmNlXG4gICAgICB1cmwgPSBtYXRjaFswXTtcbiAgICAgIC8vIGlmIHdlIGRpZCBub3QgbWF0Y2ggZnRwL2h0dHAvbWFpbHRvIHRoZW4gYXNzdW1lIG1haWx0b1xuICAgICAgaWYgKG1hdGNoWzJdID09IG1hdGNoWzNdKSB1cmwgPSAnbWFpbHRvOicgKyB1cmw7XG4gICAgICBpID0gbWF0Y2guaW5kZXg7XG4gICAgICBhZGRUZXh0KHJhdy5zdWJzdHIoMCwgaSkpO1xuICAgICAgYWRkTGluayh1cmwsIG1hdGNoWzBdLnJlcGxhY2UoTUFJTFRPX1JFR0VYUCwgJycpKTtcbiAgICAgIHJhdyA9IHJhdy5zdWJzdHJpbmcoaSArIG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgfVxuICAgIGFkZFRleHQocmF3KTtcbiAgICByZXR1cm4gJHNhbml0aXplKGh0bWwuam9pbignJykpO1xuXG4gICAgZnVuY3Rpb24gYWRkVGV4dCh0ZXh0KSB7XG4gICAgICBpZiAoIXRleHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaHRtbC5wdXNoKHNhbml0aXplVGV4dCh0ZXh0KSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkTGluayh1cmwsIHRleHQpIHtcbiAgICAgIGh0bWwucHVzaCgnPGEgJyk7XG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQodGFyZ2V0KSkge1xuICAgICAgICBodG1sLnB1c2goJ3RhcmdldD1cIicpO1xuICAgICAgICBodG1sLnB1c2godGFyZ2V0KTtcbiAgICAgICAgaHRtbC5wdXNoKCdcIiAnKTtcbiAgICAgIH1cbiAgICAgIGh0bWwucHVzaCgnaHJlZj1cIicpO1xuICAgICAgaHRtbC5wdXNoKHVybCk7XG4gICAgICBodG1sLnB1c2goJ1wiPicpO1xuICAgICAgYWRkVGV4dCh0ZXh0KTtcbiAgICAgIGh0bWwucHVzaCgnPC9hPicpO1xuICAgIH1cbiAgfTtcbn1dKTtcblxuXG59KSh3aW5kb3csIHdpbmRvdy5hbmd1bGFyKTtcbiIsIi8qKiFcbiAqIEFuZ3VsYXJKUyBmaWxlIHVwbG9hZCBzaGltIGZvciBIVE1MNSBGb3JtRGF0YVxuICogQGF1dGhvciAgRGFuaWFsICA8ZGFuaWFsLmZhcmlkQGdtYWlsLmNvbT5cbiAqIEB2ZXJzaW9uIDEuNi4xMlxuICovXG4oZnVuY3Rpb24oKSB7XG5cbnZhciBoYXNGbGFzaCA9IGZ1bmN0aW9uKCkge1xuXHR0cnkge1xuXHQgIHZhciBmbyA9IG5ldyBBY3RpdmVYT2JqZWN0KCdTaG9ja3dhdmVGbGFzaC5TaG9ja3dhdmVGbGFzaCcpO1xuXHQgIGlmIChmbykgcmV0dXJuIHRydWU7XG5cdH0gY2F0Y2goZSkge1xuXHQgIGlmIChuYXZpZ2F0b3IubWltZVR5cGVzWydhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCddICE9IHVuZGVmaW5lZCkgcmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG52YXIgcGF0Y2hYSFIgPSBmdW5jdGlvbihmbk5hbWUsIG5ld0ZuKSB7XG5cdHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5wcm90b3R5cGVbZm5OYW1lXSA9IG5ld0ZuKHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5wcm90b3R5cGVbZm5OYW1lXSk7XG59O1xuXG5pZiAod2luZG93LlhNTEh0dHBSZXF1ZXN0KSB7XG5cdGlmICh3aW5kb3cuRm9ybURhdGEgJiYgKCF3aW5kb3cuRmlsZUFQSSB8fCAhRmlsZUFQSS5mb3JjZUxvYWQpKSB7XG5cdFx0Ly8gYWxsb3cgYWNjZXNzIHRvIEFuZ3VsYXIgWEhSIHByaXZhdGUgZmllbGQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvaXNzdWVzLzE5MzRcblx0XHRwYXRjaFhIUignc2V0UmVxdWVzdEhlYWRlcicsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihoZWFkZXIsIHZhbHVlKSB7XG5cdFx0XHRcdGlmIChoZWFkZXIgPT09ICdfX3NldFhIUl8nKSB7XG5cdFx0XHRcdFx0dmFyIHZhbCA9IHZhbHVlKHRoaXMpO1xuXHRcdFx0XHRcdC8vIGZpeCBmb3IgYW5ndWxhciA8IDEuMi4wXG5cdFx0XHRcdFx0aWYgKHZhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0XHR2YWwodGhpcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9yaWcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBpbml0aWFsaXplVXBsb2FkTGlzdGVuZXIgPSBmdW5jdGlvbih4aHIpIHtcblx0XHRcdGlmICgheGhyLl9fbGlzdGVuZXJzKSB7XG5cdFx0XHRcdGlmICgheGhyLnVwbG9hZCkgeGhyLnVwbG9hZCA9IHt9O1xuXHRcdFx0XHR4aHIuX19saXN0ZW5lcnMgPSBbXTtcblx0XHRcdFx0dmFyIG9yaWdBZGRFdmVudExpc3RlbmVyID0geGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyO1xuXHRcdFx0XHR4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0LCBmbiwgYikge1xuXHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1t0XSA9IGZuO1xuXHRcdFx0XHRcdG9yaWdBZGRFdmVudExpc3RlbmVyICYmIG9yaWdBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdHBhdGNoWEhSKCdvcGVuJywgZnVuY3Rpb24ob3JpZykge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKG0sIHVybCwgYikge1xuXHRcdFx0XHRpbml0aWFsaXplVXBsb2FkTGlzdGVuZXIodGhpcyk7XG5cdFx0XHRcdHRoaXMuX191cmwgPSB1cmw7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0b3JpZy5hcHBseSh0aGlzLCBbbSwgdXJsLCBiXSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRpZiAoZS5tZXNzYWdlLmluZGV4T2YoJ0FjY2VzcyBpcyBkZW5pZWQnKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRvcmlnLmFwcGx5KHRoaXMsIFttLCAnX2ZpeF9mb3JfaWVfY3Jvc3Nkb21haW5fXycsIGJdKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdnZXRSZXNwb25zZUhlYWRlcicsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihoKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9fZmlsZUFwaVhIUiAmJiB0aGlzLl9fZmlsZUFwaVhIUi5nZXRSZXNwb25zZUhlYWRlciA/IHRoaXMuX19maWxlQXBpWEhSLmdldFJlc3BvbnNlSGVhZGVyKGgpIDogKG9yaWcgPT0gbnVsbCA/IG51bGwgOiBvcmlnLmFwcGx5KHRoaXMsIFtoXSkpO1xuXHRcdFx0fTtcblx0XHR9KTtcblxuXHRcdHBhdGNoWEhSKCdnZXRBbGxSZXNwb25zZUhlYWRlcnMnLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9fZmlsZUFwaVhIUiAmJiB0aGlzLl9fZmlsZUFwaVhIUi5nZXRBbGxSZXNwb25zZUhlYWRlcnMgPyB0aGlzLl9fZmlsZUFwaVhIUi5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSA6IChvcmlnID09IG51bGwgPyBudWxsIDogb3JpZy5hcHBseSh0aGlzKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignYWJvcnQnLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9fZmlsZUFwaVhIUiAmJiB0aGlzLl9fZmlsZUFwaVhIUi5hYm9ydCA/IHRoaXMuX19maWxlQXBpWEhSLmFib3J0KCkgOiAob3JpZyA9PSBudWxsID8gbnVsbCA6IG9yaWcuYXBwbHkodGhpcykpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cGF0Y2hYSFIoJ3NldFJlcXVlc3RIZWFkZXInLCBmdW5jdGlvbihvcmlnKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oaGVhZGVyLCB2YWx1ZSkge1xuXHRcdFx0XHRpZiAoaGVhZGVyID09PSAnX19zZXRYSFJfJykge1xuXHRcdFx0XHRcdGluaXRpYWxpemVVcGxvYWRMaXN0ZW5lcih0aGlzKTtcblx0XHRcdFx0XHR2YXIgdmFsID0gdmFsdWUodGhpcyk7XG5cdFx0XHRcdFx0Ly8gZml4IGZvciBhbmd1bGFyIDwgMS4yLjBcblx0XHRcdFx0XHRpZiAodmFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRcdHZhbCh0aGlzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5fX3JlcXVlc3RIZWFkZXJzID0gdGhpcy5fX3JlcXVlc3RIZWFkZXJzIHx8IHt9O1xuXHRcdFx0XHRcdHRoaXMuX19yZXF1ZXN0SGVhZGVyc1toZWFkZXJdID0gdmFsdWU7XG5cdFx0XHRcdFx0b3JpZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRwYXRjaFhIUignc2VuZCcsIGZ1bmN0aW9uKG9yaWcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHhociA9IHRoaXM7XG5cdFx0XHRcdGlmIChhcmd1bWVudHNbMF0gJiYgYXJndW1lbnRzWzBdLl9faXNTaGltKSB7XG5cdFx0XHRcdFx0dmFyIGZvcm1EYXRhID0gYXJndW1lbnRzWzBdO1xuXHRcdFx0XHRcdHZhciBjb25maWcgPSB7XG5cdFx0XHRcdFx0XHR1cmw6IHhoci5fX3VybCxcblx0XHRcdFx0XHRcdGpzb25wOiBmYWxzZSwgLy9yZW1vdmVzIHRoZSBjYWxsYmFjayBmb3JtIHBhcmFtXG5cdFx0XHRcdFx0XHRjYWNoZTogdHJ1ZSwgLy9yZW1vdmVzIHRoZSA/ZmlsZWFwaVhYWCBpbiB0aGUgdXJsXG5cdFx0XHRcdFx0XHRjb21wbGV0ZTogZnVuY3Rpb24oZXJyLCBmaWxlQXBpWEhSKSB7XG5cdFx0XHRcdFx0XHRcdHhoci5fX2NvbXBsZXRlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdGlmICghZXJyICYmIHhoci5fX2xpc3RlbmVyc1snbG9hZCddKSBcblx0XHRcdFx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbJ2xvYWQnXSh7dHlwZTogJ2xvYWQnLCBsb2FkZWQ6IHhoci5fX2xvYWRlZCwgdG90YWw6IHhoci5fX3RvdGFsLCB0YXJnZXQ6IHhociwgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoIWVyciAmJiB4aHIuX19saXN0ZW5lcnNbJ2xvYWRlbmQnXSkgXG5cdFx0XHRcdFx0XHRcdFx0eGhyLl9fbGlzdGVuZXJzWydsb2FkZW5kJ10oe3R5cGU6ICdsb2FkZW5kJywgbG9hZGVkOiB4aHIuX19sb2FkZWQsIHRvdGFsOiB4aHIuX190b3RhbCwgdGFyZ2V0OiB4aHIsIGxlbmd0aENvbXB1dGFibGU6IHRydWV9KTtcblx0XHRcdFx0XHRcdFx0aWYgKGVyciA9PT0gJ2Fib3J0JyAmJiB4aHIuX19saXN0ZW5lcnNbJ2Fib3J0J10pIFxuXHRcdFx0XHRcdFx0XHRcdHhoci5fX2xpc3RlbmVyc1snYWJvcnQnXSh7dHlwZTogJ2Fib3J0JywgbG9hZGVkOiB4aHIuX19sb2FkZWQsIHRvdGFsOiB4aHIuX190b3RhbCwgdGFyZ2V0OiB4aHIsIGxlbmd0aENvbXB1dGFibGU6IHRydWV9KTtcblx0XHRcdFx0XHRcdFx0aWYgKGZpbGVBcGlYSFIuc3RhdHVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdzdGF0dXMnLCB7Z2V0OiBmdW5jdGlvbigpIHtyZXR1cm4gKGZpbGVBcGlYSFIuc3RhdHVzID09IDAgJiYgZXJyICYmIGVyciAhPT0gJ2Fib3J0JykgPyA1MDAgOiBmaWxlQXBpWEhSLnN0YXR1c319KTtcblx0XHRcdFx0XHRcdFx0aWYgKGZpbGVBcGlYSFIuc3RhdHVzVGV4dCAhPT0gdW5kZWZpbmVkKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAnc3RhdHVzVGV4dCcsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiBmaWxlQXBpWEhSLnN0YXR1c1RleHR9fSk7XG5cdFx0XHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdyZWFkeVN0YXRlJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIDR9fSk7XG5cdFx0XHRcdFx0XHRcdGlmIChmaWxlQXBpWEhSLnJlc3BvbnNlICE9PSB1bmRlZmluZWQpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdyZXNwb25zZScsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiBmaWxlQXBpWEhSLnJlc3BvbnNlfX0pO1xuXHRcdFx0XHRcdFx0XHR2YXIgcmVzcCA9IGZpbGVBcGlYSFIucmVzcG9uc2VUZXh0IHx8IChlcnIgJiYgZmlsZUFwaVhIUi5zdGF0dXMgPT0gMCAmJiBlcnIgIT09ICdhYm9ydCcgPyBlcnIgOiB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAncmVzcG9uc2VUZXh0Jywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIHJlc3B9fSk7XG5cdFx0XHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsICdyZXNwb25zZScsIHtnZXQ6IGZ1bmN0aW9uKCkge3JldHVybiByZXNwfX0pO1xuXHRcdFx0XHRcdFx0XHRpZiAoZXJyKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCAnZXJyJywge2dldDogZnVuY3Rpb24oKSB7cmV0dXJuIGVycn19KTtcblx0XHRcdFx0XHRcdFx0eGhyLl9fZmlsZUFwaVhIUiA9IGZpbGVBcGlYSFI7XG5cdFx0XHRcdFx0XHRcdGlmICh4aHIub25yZWFkeXN0YXRlY2hhbmdlKSB4aHIub25yZWFkeXN0YXRlY2hhbmdlKCk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0ZmlsZXByb2dyZXNzOiBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0XHRcdGUudGFyZ2V0ID0geGhyO1xuXHRcdFx0XHRcdFx0XHR4aHIuX19saXN0ZW5lcnNbJ3Byb2dyZXNzJ10gJiYgeGhyLl9fbGlzdGVuZXJzWydwcm9ncmVzcyddKGUpO1xuXHRcdFx0XHRcdFx0XHR4aHIuX190b3RhbCA9IGUudG90YWw7XG5cdFx0XHRcdFx0XHRcdHhoci5fX2xvYWRlZCA9IGUubG9hZGVkO1xuXHRcdFx0XHRcdFx0XHRpZiAoZS50b3RhbCA9PT0gZS5sb2FkZWQpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBmaXggZmxhc2ggaXNzdWUgdGhhdCBkb2Vzbid0IGNhbGwgY29tcGxldGUgaWYgdGhlcmUgaXMgbm8gcmVzcG9uc2UgdGV4dCBmcm9tIHRoZSBzZXJ2ZXIgIFxuXHRcdFx0XHRcdFx0XHRcdHZhciBfdGhpcyA9IHRoaXNcblx0XHRcdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCF4aHIuX19jb21wbGV0ZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0eGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycyA9IGZ1bmN0aW9uKCl7fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0X3RoaXMuY29tcGxldGUobnVsbCwge3N0YXR1czogMjA0LCBzdGF0dXNUZXh0OiAnTm8gQ29udGVudCd9KTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9LCAxMDAwMCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRoZWFkZXJzOiB4aHIuX19yZXF1ZXN0SGVhZGVyc1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25maWcuZGF0YSA9IHt9O1xuXHRcdFx0XHRcdGNvbmZpZy5maWxlcyA9IHt9XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBmb3JtRGF0YS5kYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgaXRlbSA9IGZvcm1EYXRhLmRhdGFbaV07XG5cdFx0XHRcdFx0XHRpZiAoaXRlbS52YWwgIT0gbnVsbCAmJiBpdGVtLnZhbC5uYW1lICE9IG51bGwgJiYgaXRlbS52YWwuc2l6ZSAhPSBudWxsICYmIGl0ZW0udmFsLnR5cGUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRjb25maWcuZmlsZXNbaXRlbS5rZXldID0gaXRlbS52YWw7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjb25maWcuZGF0YVtpdGVtLmtleV0gPSBpdGVtLnZhbDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKCFoYXNGbGFzaCgpKSB7XG5cdFx0XHRcdFx0XHRcdHRocm93ICdBZG9kZSBGbGFzaCBQbGF5ZXIgbmVlZCB0byBiZSBpbnN0YWxsZWQuIFRvIGNoZWNrIGFoZWFkIHVzZSBcIkZpbGVBUEkuaGFzRmxhc2hcIic7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR4aHIuX19maWxlQXBpWEhSID0gRmlsZUFQSS51cGxvYWQoY29uZmlnKTtcblx0XHRcdFx0XHR9LCAxKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvcmlnLmFwcGx5KHhociwgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5fX2lzU2hpbSA9IHRydWU7XG59XG5cbmlmICghd2luZG93LkZvcm1EYXRhIHx8ICh3aW5kb3cuRmlsZUFQSSAmJiBGaWxlQVBJLmZvcmNlTG9hZCkpIHtcblx0dmFyIGFkZEZsYXNoID0gZnVuY3Rpb24oZWxlbSkge1xuXHRcdGlmICghaGFzRmxhc2goKSkge1xuXHRcdFx0dGhyb3cgJ0Fkb2RlIEZsYXNoIFBsYXllciBuZWVkIHRvIGJlIGluc3RhbGxlZC4gVG8gY2hlY2sgYWhlYWQgdXNlIFwiRmlsZUFQSS5oYXNGbGFzaFwiJztcblx0XHR9XG5cdFx0dmFyIGVsID0gYW5ndWxhci5lbGVtZW50KGVsZW0pO1xuXHRcdGlmICghZWwuYXR0cignZGlzYWJsZWQnKSkge1xuXHRcdFx0aWYgKCFlbC5oYXNDbGFzcygnanMtZmlsZWFwaS13cmFwcGVyJykgJiYgKGVsZW0uZ2V0QXR0cmlidXRlKCduZy1maWxlLXNlbGVjdCcpICE9IG51bGwgfHwgZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmctZmlsZS1zZWxlY3QnKSAhPSBudWxsKSkge1xuXHRcdFx0XHRpZiAoRmlsZUFQSS53cmFwSW5zaWRlRGl2KSB7XG5cdFx0XHRcdFx0dmFyIHdyYXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdFx0XHR3cmFwLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwianMtZmlsZWFwaS13cmFwcGVyXCIgc3R5bGU9XCJwb3NpdGlvbjpyZWxhdGl2ZTsgb3ZlcmZsb3c6aGlkZGVuXCI+PC9kaXY+Jztcblx0XHRcdFx0XHR3cmFwID0gd3JhcC5maXJzdENoaWxkO1xuXHRcdFx0XHRcdHZhciBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG5cdFx0XHRcdFx0cGFyZW50Lmluc2VydEJlZm9yZSh3cmFwLCBlbGVtKTtcblx0XHRcdFx0XHRwYXJlbnQucmVtb3ZlQ2hpbGQoZWxlbSk7XG5cdFx0XHRcdFx0d3JhcC5hcHBlbmRDaGlsZChlbGVtKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRlbC5hZGRDbGFzcygnanMtZmlsZWFwaS13cmFwcGVyJyk7XG5cdFx0XHRcdFx0aWYgKGVsLnBhcmVudCgpWzBdLl9fZmlsZV9jbGlja19mbl9kZWxlZ2F0ZV8pIHtcblx0XHRcdFx0XHRcdGlmIChlbC5wYXJlbnQoKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICcnIHx8IGVsLnBhcmVudCgpLmNzcygncG9zaXRpb24nKSA9PT0gJ3N0YXRpYycpIHtcblx0XHRcdFx0XHRcdFx0ZWwucGFyZW50KCkuY3NzKCdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWwuY3NzKCd0b3AnLCAwKS5jc3MoJ2JvdHRvbScsIDApLmNzcygnbGVmdCcsIDApLmNzcygncmlnaHQnLCAwKS5jc3MoJ3dpZHRoJywgJzEwMCUnKS5jc3MoJ2hlaWdodCcsICcxMDAlJykuXG5cdFx0XHRcdFx0XHRcdGNzcygncGFkZGluZycsIDApLmNzcygnbWFyZ2luJywgMCk7XG5cdFx0XHRcdFx0XHRlbC5wYXJlbnQoKS51bmJpbmQoJ2NsaWNrJywgZWwucGFyZW50KClbMF0uX19maWxlX2NsaWNrX2ZuX2RlbGVnYXRlXyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHR2YXIgY2hhbmdlRm5XcmFwcGVyID0gZnVuY3Rpb24oZm4pIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgZmlsZXMgPSBGaWxlQVBJLmdldEZpbGVzKGV2dCk7XG5cdFx0XHQvL2p1c3QgYSBkb3VibGUgY2hlY2sgZm9yICMyMzNcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGZpbGVzW2ldLnNpemUgPT09IHVuZGVmaW5lZCkgZmlsZXNbaV0uc2l6ZSA9IDA7XG5cdFx0XHRcdGlmIChmaWxlc1tpXS5uYW1lID09PSB1bmRlZmluZWQpIGZpbGVzW2ldLm5hbWUgPSAnZmlsZSc7XG5cdFx0XHRcdGlmIChmaWxlc1tpXS50eXBlID09PSB1bmRlZmluZWQpIGZpbGVzW2ldLnR5cGUgPSAndW5kZWZpbmVkJztcblx0XHRcdH1cblx0XHRcdGlmICghZXZ0LnRhcmdldCkge1xuXHRcdFx0XHRldnQudGFyZ2V0ID0ge307XG5cdFx0XHR9XG5cdFx0XHRldnQudGFyZ2V0LmZpbGVzID0gZmlsZXM7XG5cdFx0XHQvLyBpZiBldnQudGFyZ2V0LmZpbGVzIGlzIG5vdCB3cml0YWJsZSB1c2UgaGVscGVyIGZpZWxkXG5cdFx0XHRpZiAoZXZ0LnRhcmdldC5maWxlcyAhPSBmaWxlcykge1xuXHRcdFx0XHRldnQuX19maWxlc18gPSBmaWxlcztcblx0XHRcdH1cblx0XHRcdChldnQuX19maWxlc18gfHwgZXZ0LnRhcmdldC5maWxlcykuaXRlbSA9IGZ1bmN0aW9uKGkpIHtcblx0XHRcdFx0cmV0dXJuIChldnQuX19maWxlc18gfHwgZXZ0LnRhcmdldC5maWxlcylbaV0gfHwgbnVsbDtcblx0XHRcdH1cblx0XHRcdGlmIChmbikgZm4uYXBwbHkodGhpcywgW2V2dF0pO1xuXHRcdH07XG5cdH07XG5cdHZhciBpc0ZpbGVDaGFuZ2UgPSBmdW5jdGlvbihlbGVtLCBlKSB7XG5cdFx0cmV0dXJuIChlLnRvTG93ZXJDYXNlKCkgPT09ICdjaGFuZ2UnIHx8IGUudG9Mb3dlckNhc2UoKSA9PT0gJ29uY2hhbmdlJykgJiYgZWxlbS5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSA9PSAnZmlsZSc7XG5cdH1cblx0aWYgKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIpIHtcblx0XHRIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gKGZ1bmN0aW9uKG9yaWdBZGRFdmVudExpc3RlbmVyKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oZSwgZm4sIGIsIGQpIHtcblx0XHRcdFx0aWYgKGlzRmlsZUNoYW5nZSh0aGlzLCBlKSkge1xuXHRcdFx0XHRcdGFkZEZsYXNoKHRoaXMpO1xuXHRcdFx0XHRcdG9yaWdBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIFtlLCBjaGFuZ2VGbldyYXBwZXIoZm4pLCBiLCBkXSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3JpZ0FkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgW2UsIGZuLCBiLCBkXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KShIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyKTtcblx0fVxuXHRpZiAoSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGUuYXR0YWNoRXZlbnQpIHtcblx0XHRIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5hdHRhY2hFdmVudCA9IChmdW5jdGlvbihvcmlnQXR0YWNoRXZlbnQpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbihlLCBmbikge1xuXHRcdFx0XHRpZiAoaXNGaWxlQ2hhbmdlKHRoaXMsIGUpKSB7XG5cdFx0XHRcdFx0YWRkRmxhc2godGhpcyk7XG5cdFx0XHRcdFx0aWYgKHdpbmRvdy5qUXVlcnkpIHtcblx0XHRcdFx0XHRcdC8vIGZpeCBmb3IgIzI4MSBqUXVlcnkgb24gSUU4XG5cdFx0XHRcdFx0XHRhbmd1bGFyLmVsZW1lbnQodGhpcykuYmluZCgnY2hhbmdlJywgY2hhbmdlRm5XcmFwcGVyKG51bGwpKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b3JpZ0F0dGFjaEV2ZW50LmFwcGx5KHRoaXMsIFtlLCBjaGFuZ2VGbldyYXBwZXIoZm4pXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9yaWdBdHRhY2hFdmVudC5hcHBseSh0aGlzLCBbZSwgZm5dKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKEhUTUxJbnB1dEVsZW1lbnQucHJvdG90eXBlLmF0dGFjaEV2ZW50KTtcblx0fVxuXG5cdHdpbmRvdy5Gb3JtRGF0YSA9IEZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGFwcGVuZDogZnVuY3Rpb24oa2V5LCB2YWwsIG5hbWUpIHtcblx0XHRcdFx0dGhpcy5kYXRhLnB1c2goe1xuXHRcdFx0XHRcdGtleToga2V5LFxuXHRcdFx0XHRcdHZhbDogdmFsLFxuXHRcdFx0XHRcdG5hbWU6IG5hbWVcblx0XHRcdFx0fSk7XG5cdFx0XHR9LFxuXHRcdFx0ZGF0YTogW10sXG5cdFx0XHRfX2lzU2hpbTogdHJ1ZVxuXHRcdH07XG5cdH07XG5cblx0KGZ1bmN0aW9uICgpIHtcblx0XHQvL2xvYWQgRmlsZUFQSVxuXHRcdGlmICghd2luZG93LkZpbGVBUEkpIHtcblx0XHRcdHdpbmRvdy5GaWxlQVBJID0ge307XG5cdFx0fVxuXHRcdGlmIChGaWxlQVBJLmZvcmNlTG9hZCkge1xuXHRcdFx0RmlsZUFQSS5odG1sNSA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoIUZpbGVBUEkudXBsb2FkKSB7XG5cdFx0XHR2YXIganNVcmwsIGJhc2VQYXRoLCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKSwgYWxsU2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKSwgaSwgaW5kZXgsIHNyYztcblx0XHRcdGlmICh3aW5kb3cuRmlsZUFQSS5qc1VybCkge1xuXHRcdFx0XHRqc1VybCA9IHdpbmRvdy5GaWxlQVBJLmpzVXJsO1xuXHRcdFx0fSBlbHNlIGlmICh3aW5kb3cuRmlsZUFQSS5qc1BhdGgpIHtcblx0XHRcdFx0YmFzZVBhdGggPSB3aW5kb3cuRmlsZUFQSS5qc1BhdGg7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgYWxsU2NyaXB0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHNyYyA9IGFsbFNjcmlwdHNbaV0uc3JjO1xuXHRcdFx0XHRcdGluZGV4ID0gc3JjLmluZGV4T2YoJ2FuZ3VsYXItZmlsZS11cGxvYWQtc2hpbS5qcycpXG5cdFx0XHRcdFx0aWYgKGluZGV4ID09IC0xKSB7XG5cdFx0XHRcdFx0XHRpbmRleCA9IHNyYy5pbmRleE9mKCdhbmd1bGFyLWZpbGUtdXBsb2FkLXNoaW0ubWluLmpzJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRcdFx0XHRiYXNlUGF0aCA9IHNyYy5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChGaWxlQVBJLnN0YXRpY1BhdGggPT0gbnVsbCkgRmlsZUFQSS5zdGF0aWNQYXRoID0gYmFzZVBhdGg7XG5cdFx0XHRzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCBqc1VybCB8fCBiYXNlUGF0aCArICdGaWxlQVBJLm1pbi5qcycpO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuXHRcdFx0RmlsZUFQSS5oYXNGbGFzaCA9IGhhc0ZsYXNoKCk7XG5cdFx0fVxuXHR9KSgpO1xuXHRGaWxlQVBJLmRpc2FibGVGaWxlSW5wdXQgPSBmdW5jdGlvbihlbGVtLCBkaXNhYmxlKSB7XG5cdFx0aWYgKGRpc2FibGUpIHtcblx0XHRcdGVsZW0ucmVtb3ZlQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGVsZW0uYWRkQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpO1xuXHRcdH1cblx0fVxufVxuXG5cbmlmICghd2luZG93LkZpbGVSZWFkZXIpIHtcblx0d2luZG93LkZpbGVSZWFkZXIgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzLCBsb2FkU3RhcnRlZCA9IGZhbHNlO1xuXHRcdHRoaXMubGlzdGVuZXJzID0ge307XG5cdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgZm4pIHtcblx0XHRcdF90aGlzLmxpc3RlbmVyc1t0eXBlXSA9IF90aGlzLmxpc3RlbmVyc1t0eXBlXSB8fCBbXTtcblx0XHRcdF90aGlzLmxpc3RlbmVyc1t0eXBlXS5wdXNoKGZuKTtcblx0XHR9O1xuXHRcdHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGZuKSB7XG5cdFx0XHRfdGhpcy5saXN0ZW5lcnNbdHlwZV0gJiYgX3RoaXMubGlzdGVuZXJzW3R5cGVdLnNwbGljZShfdGhpcy5saXN0ZW5lcnNbdHlwZV0uaW5kZXhPZihmbiksIDEpO1xuXHRcdH07XG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgbGlzdCA9IF90aGlzLmxpc3RlbmVyc1tldnQudHlwZV07XG5cdFx0XHRpZiAobGlzdCkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRsaXN0W2ldLmNhbGwoX3RoaXMsIGV2dCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMub25hYm9ydCA9IHRoaXMub25lcnJvciA9IHRoaXMub25sb2FkID0gdGhpcy5vbmxvYWRzdGFydCA9IHRoaXMub25sb2FkZW5kID0gdGhpcy5vbnByb2dyZXNzID0gbnVsbDtcblxuXHRcdHZhciBjb25zdHJ1Y3RFdmVudCA9IGZ1bmN0aW9uKHR5cGUsIGV2dCkge1xuXHRcdFx0dmFyIGUgPSB7dHlwZTogdHlwZSwgdGFyZ2V0OiBfdGhpcywgbG9hZGVkOiBldnQubG9hZGVkLCB0b3RhbDogZXZ0LnRvdGFsLCBlcnJvcjogZXZ0LmVycm9yfTtcblx0XHRcdGlmIChldnQucmVzdWx0ICE9IG51bGwpIGUudGFyZ2V0LnJlc3VsdCA9IGV2dC5yZXN1bHQ7XG5cdFx0XHRyZXR1cm4gZTtcblx0XHR9O1xuXHRcdHZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0aWYgKCFsb2FkU3RhcnRlZCkge1xuXHRcdFx0XHRsb2FkU3RhcnRlZCA9IHRydWU7XG5cdFx0XHRcdF90aGlzLm9ubG9hZHN0YXJ0ICYmIHRoaXMub25sb2Fkc3RhcnQoY29uc3RydWN0RXZlbnQoJ2xvYWRzdGFydCcsIGV2dCkpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGV2dC50eXBlID09PSAnbG9hZCcpIHtcblx0XHRcdFx0X3RoaXMub25sb2FkZW5kICYmIF90aGlzLm9ubG9hZGVuZChjb25zdHJ1Y3RFdmVudCgnbG9hZGVuZCcsIGV2dCkpO1xuXHRcdFx0XHR2YXIgZSA9IGNvbnN0cnVjdEV2ZW50KCdsb2FkJywgZXZ0KTtcblx0XHRcdFx0X3RoaXMub25sb2FkICYmIF90aGlzLm9ubG9hZChlKTtcblx0XHRcdFx0X3RoaXMuZGlzcGF0Y2hFdmVudChlKTtcblx0XHRcdH0gZWxzZSBpZiAoZXZ0LnR5cGUgPT09ICdwcm9ncmVzcycpIHtcblx0XHRcdFx0dmFyIGUgPSBjb25zdHJ1Y3RFdmVudCgncHJvZ3Jlc3MnLCBldnQpO1xuXHRcdFx0XHRfdGhpcy5vbnByb2dyZXNzICYmIF90aGlzLm9ucHJvZ3Jlc3MoZSk7XG5cdFx0XHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgZSA9IGNvbnN0cnVjdEV2ZW50KCdlcnJvcicsIGV2dCk7XG5cdFx0XHRcdF90aGlzLm9uZXJyb3IgJiYgX3RoaXMub25lcnJvcihlKTtcblx0XHRcdFx0X3RoaXMuZGlzcGF0Y2hFdmVudChlKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMucmVhZEFzQXJyYXlCdWZmZXIgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRGaWxlQVBJLnJlYWRBc0JpbmFyeVN0cmluZyhmaWxlLCBsaXN0ZW5lcik7XG5cdFx0fVxuXHRcdHRoaXMucmVhZEFzQmluYXJ5U3RyaW5nID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0RmlsZUFQSS5yZWFkQXNCaW5hcnlTdHJpbmcoZmlsZSwgbGlzdGVuZXIpO1xuXHRcdH1cblx0XHR0aGlzLnJlYWRBc0RhdGFVUkwgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRGaWxlQVBJLnJlYWRBc0RhdGFVUkwoZmlsZSwgbGlzdGVuZXIpO1xuXHRcdH1cblx0XHR0aGlzLnJlYWRBc1RleHQgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRGaWxlQVBJLnJlYWRBc1RleHQoZmlsZSwgbGlzdGVuZXIpO1xuXHRcdH1cblx0fVxufVxuXG59KSgpO1xuIiwiLyoqIVxuICogQW5ndWxhckpTIGZpbGUgdXBsb2FkL2Ryb3AgZGlyZWN0aXZlIHdpdGggaHR0cCBwb3N0IGFuZCBwcm9ncmVzc1xuICogQGF1dGhvciAgRGFuaWFsICA8ZGFuaWFsLmZhcmlkQGdtYWlsLmNvbT5cbiAqIEB2ZXJzaW9uIDEuNi4xMlxuICovXG4oZnVuY3Rpb24oKSB7XG5cbnZhciBhbmd1bGFyRmlsZVVwbG9hZCA9IGFuZ3VsYXIubW9kdWxlKCdhbmd1bGFyRmlsZVVwbG9hZCcsIFtdKTtcblxuYW5ndWxhckZpbGVVcGxvYWQuc2VydmljZSgnJHVwbG9hZCcsIFsnJGh0dHAnLCAnJHEnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbigkaHR0cCwgJHEsICR0aW1lb3V0KSB7XG5cdGZ1bmN0aW9uIHNlbmRIdHRwKGNvbmZpZykge1xuXHRcdGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kIHx8ICdQT1NUJztcblx0XHRjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXHRcdGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0ID0gY29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgfHwgZnVuY3Rpb24oZGF0YSwgaGVhZGVyc0dldHRlcikge1xuXHRcdFx0aWYgKHdpbmRvdy5BcnJheUJ1ZmZlciAmJiBkYXRhIGluc3RhbmNlb2Ygd2luZG93LkFycmF5QnVmZmVyKSB7XG5cdFx0XHRcdHJldHVybiBkYXRhO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuICRodHRwLmRlZmF1bHRzLnRyYW5zZm9ybVJlcXVlc3RbMF0oZGF0YSwgaGVhZGVyc0dldHRlcik7XG5cdFx0fTtcblx0XHR2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG5cdFx0aWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5fX2lzU2hpbSkge1xuXHRcdFx0Y29uZmlnLmhlYWRlcnNbJ19fc2V0WEhSXyddID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbih4aHIpIHtcblx0XHRcdFx0XHRpZiAoIXhocikgcmV0dXJuO1xuXHRcdFx0XHRcdGNvbmZpZy5fX1hIUiA9IHhocjtcblx0XHRcdFx0XHRjb25maWcueGhyRm4gJiYgY29uZmlnLnhockZuKHhocik7XG5cdFx0XHRcdFx0eGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0XHRcdGRlZmVycmVkLm5vdGlmeShlKTtcblx0XHRcdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRcdFx0Ly9maXggZm9yIGZpcmVmb3ggbm90IGZpcmluZyB1cGxvYWQgcHJvZ3Jlc3MgZW5kLCBhbHNvIElFOC05XG5cdFx0XHRcdFx0eGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRcdFx0aWYgKGUubGVuZ3RoQ29tcHV0YWJsZSkge1xuXHRcdFx0XHRcdFx0XHRkZWZlcnJlZC5ub3RpZnkoZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQkaHR0cChjb25maWcpLnRoZW4oZnVuY3Rpb24ocil7ZGVmZXJyZWQucmVzb2x2ZShyKX0sIGZ1bmN0aW9uKGUpe2RlZmVycmVkLnJlamVjdChlKX0sIGZ1bmN0aW9uKG4pe2RlZmVycmVkLm5vdGlmeShuKX0pO1xuXHRcdFxuXHRcdHZhciBwcm9taXNlID0gZGVmZXJyZWQucHJvbWlzZTtcblx0XHRwcm9taXNlLnN1Y2Nlc3MgPSBmdW5jdGlvbihmbikge1xuXHRcdFx0cHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGZuKHJlc3BvbnNlLmRhdGEsIHJlc3BvbnNlLnN0YXR1cywgcmVzcG9uc2UuaGVhZGVycywgY29uZmlnKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblxuXHRcdHByb21pc2UuZXJyb3IgPSBmdW5jdGlvbihmbikge1xuXHRcdFx0cHJvbWlzZS50aGVuKG51bGwsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGZuKHJlc3BvbnNlLmRhdGEsIHJlc3BvbnNlLnN0YXR1cywgcmVzcG9uc2UuaGVhZGVycywgY29uZmlnKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblxuXHRcdHByb21pc2UucHJvZ3Jlc3MgPSBmdW5jdGlvbihmbikge1xuXHRcdFx0cHJvbWlzZS50aGVuKG51bGwsIG51bGwsIGZ1bmN0aW9uKHVwZGF0ZSkge1xuXHRcdFx0XHRmbih1cGRhdGUpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcHJvbWlzZTtcblx0XHR9O1xuXHRcdHByb21pc2UuYWJvcnQgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmIChjb25maWcuX19YSFIpIHtcblx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Y29uZmlnLl9fWEhSLmFib3J0KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0fTtcblx0XHRwcm9taXNlLnhociA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0XHRjb25maWcueGhyRm4gPSAoZnVuY3Rpb24ob3JpZ1hockZuKSB7XG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRvcmlnWGhyRm4gJiYgb3JpZ1hockZuLmFwcGx5KHByb21pc2UsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdFx0Zm4uYXBwbHkocHJvbWlzZSwgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fSkoY29uZmlnLnhockZuKTtcblx0XHRcdHJldHVybiBwcm9taXNlO1xuXHRcdH07XG5cdFx0XG5cdFx0cmV0dXJuIHByb21pc2U7XG5cdH1cblxuXHR0aGlzLnVwbG9hZCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuXHRcdGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cdFx0Y29uZmlnLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdW5kZWZpbmVkO1xuXHRcdGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0ID0gY29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgfHwgJGh0dHAuZGVmYXVsdHMudHJhbnNmb3JtUmVxdWVzdDtcblx0XHR2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHR2YXIgb3JpZ1RyYW5zZm9ybVJlcXVlc3QgPSBjb25maWcudHJhbnNmb3JtUmVxdWVzdDtcblx0XHR2YXIgb3JpZ0RhdGEgPSBjb25maWcuZGF0YTtcblx0XHRjb25maWcudHJhbnNmb3JtUmVxdWVzdCA9IGZ1bmN0aW9uKGZvcm1EYXRhLCBoZWFkZXJHZXR0ZXIpIHtcblx0XHRcdGlmIChvcmlnRGF0YSkge1xuXHRcdFx0XHRpZiAoY29uZmlnLmZvcm1EYXRhQXBwZW5kZXIpIHtcblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gb3JpZ0RhdGEpIHtcblx0XHRcdFx0XHRcdHZhciB2YWwgPSBvcmlnRGF0YVtrZXldO1xuXHRcdFx0XHRcdFx0Y29uZmlnLmZvcm1EYXRhQXBwZW5kZXIoZm9ybURhdGEsIGtleSwgdmFsKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIga2V5IGluIG9yaWdEYXRhKSB7XG5cdFx0XHRcdFx0XHR2YXIgdmFsID0gb3JpZ0RhdGFba2V5XTtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2Ygb3JpZ1RyYW5zZm9ybVJlcXVlc3QgPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHR2YWwgPSBvcmlnVHJhbnNmb3JtUmVxdWVzdCh2YWwsIGhlYWRlckdldHRlcik7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9yaWdUcmFuc2Zvcm1SZXF1ZXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIHRyYW5zZm9ybUZuID0gb3JpZ1RyYW5zZm9ybVJlcXVlc3RbaV07XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiB0cmFuc2Zvcm1GbiA9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YWwgPSB0cmFuc2Zvcm1Gbih2YWwsIGhlYWRlckdldHRlcik7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRmb3JtRGF0YS5hcHBlbmQoa2V5LCB2YWwpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29uZmlnLmZpbGUgIT0gbnVsbCkge1xuXHRcdFx0XHR2YXIgZmlsZUZvcm1OYW1lID0gY29uZmlnLmZpbGVGb3JtRGF0YU5hbWUgfHwgJ2ZpbGUnO1xuXG5cdFx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoY29uZmlnLmZpbGUpID09PSAnW29iamVjdCBBcnJheV0nKSB7XG5cdFx0XHRcdFx0dmFyIGlzRmlsZUZvcm1OYW1lU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGZpbGVGb3JtTmFtZSkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY29uZmlnLmZpbGUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGZvcm1EYXRhLmFwcGVuZChpc0ZpbGVGb3JtTmFtZVN0cmluZyA/IGZpbGVGb3JtTmFtZSA6IGZpbGVGb3JtTmFtZVtpXSwgY29uZmlnLmZpbGVbaV0sIFxuXHRcdFx0XHRcdFx0XHRcdChjb25maWcuZmlsZU5hbWUgJiYgY29uZmlnLmZpbGVOYW1lW2ldKSB8fCBjb25maWcuZmlsZVtpXS5uYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Zm9ybURhdGEuYXBwZW5kKGZpbGVGb3JtTmFtZSwgY29uZmlnLmZpbGUsIGNvbmZpZy5maWxlTmFtZSB8fCBjb25maWcuZmlsZS5uYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZvcm1EYXRhO1xuXHRcdH07XG5cblx0XHRjb25maWcuZGF0YSA9IGZvcm1EYXRhO1xuXG5cdFx0cmV0dXJuIHNlbmRIdHRwKGNvbmZpZyk7XG5cdH07XG5cblx0dGhpcy5odHRwID0gZnVuY3Rpb24oY29uZmlnKSB7XG5cdFx0cmV0dXJuIHNlbmRIdHRwKGNvbmZpZyk7XG5cdH1cbn1dKTtcblxuYW5ndWxhckZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ0ZpbGVTZWxlY3QnLCBbICckcGFyc2UnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbigkcGFyc2UsICR0aW1lb3V0KSB7XG5cdHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cikge1xuXHRcdHZhciBmbiA9ICRwYXJzZShhdHRyWyduZ0ZpbGVTZWxlY3QnXSk7XG5cdFx0aWYgKGVsZW1bMF0udGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnaW5wdXQnIHx8IChlbGVtLmF0dHIoJ3R5cGUnKSAmJiBlbGVtLmF0dHIoJ3R5cGUnKS50b0xvd2VyQ2FzZSgpKSAhPT0gJ2ZpbGUnKSB7XG5cdFx0XHR2YXIgZmlsZUVsZW0gPSBhbmd1bGFyLmVsZW1lbnQoJzxpbnB1dCB0eXBlPVwiZmlsZVwiPicpXG5cdFx0XHR2YXIgYXR0cnMgPSBlbGVtWzBdLmF0dHJpYnV0ZXM7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChhdHRyc1tpXS5uYW1lLnRvTG93ZXJDYXNlKCkgIT09ICd0eXBlJykge1xuXHRcdFx0XHRcdGZpbGVFbGVtLmF0dHIoYXR0cnNbaV0ubmFtZSwgYXR0cnNbaV0udmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoYXR0cltcIm11bHRpcGxlXCJdKSBmaWxlRWxlbS5hdHRyKFwibXVsdGlwbGVcIiwgXCJ0cnVlXCIpO1xuXHRcdFx0ZmlsZUVsZW0uY3NzKFwid2lkdGhcIiwgXCIxcHhcIikuY3NzKFwiaGVpZ2h0XCIsIFwiMXB4XCIpLmNzcyhcIm9wYWNpdHlcIiwgMCkuY3NzKFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiKS5jc3MoJ2ZpbHRlcicsICdhbHBoYShvcGFjaXR5PTApJylcblx0XHRcdFx0XHQuY3NzKFwicGFkZGluZ1wiLCAwKS5jc3MoXCJtYXJnaW5cIiwgMCkuY3NzKFwib3ZlcmZsb3dcIiwgXCJoaWRkZW5cIik7XG5cdFx0XHRmaWxlRWxlbS5hdHRyKCdfX3dyYXBwZXJfZm9yX3BhcmVudF8nLCB0cnVlKTtcblxuLy9cdFx0XHRmaWxlRWxlbS5jc3MoXCJ0b3BcIiwgMCkuY3NzKFwiYm90dG9tXCIsIDApLmNzcyhcImxlZnRcIiwgMCkuY3NzKFwicmlnaHRcIiwgMCkuY3NzKFwid2lkdGhcIiwgXCIxMDAlXCIpLlxuLy9cdFx0XHRcdFx0Y3NzKFwib3BhY2l0eVwiLCAwKS5jc3MoXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCIpLmNzcygnZmlsdGVyJywgJ2FscGhhKG9wYWNpdHk9MCknKS5jc3MoXCJwYWRkaW5nXCIsIDApLmNzcyhcIm1hcmdpblwiLCAwKTtcblx0XHRcdGVsZW0uYXBwZW5kKGZpbGVFbGVtKTtcblx0XHRcdGVsZW1bMF0uX19maWxlX2NsaWNrX2ZuX2RlbGVnYXRlXyAgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0ZmlsZUVsZW1bMF0uY2xpY2soKTtcblx0XHRcdH07IFxuXHRcdFx0ZWxlbS5iaW5kKCdjbGljaycsIGVsZW1bMF0uX19maWxlX2NsaWNrX2ZuX2RlbGVnYXRlXyk7XG5cdFx0XHRlbGVtLmNzcyhcIm92ZXJmbG93XCIsIFwiaGlkZGVuXCIpO1xuLy9cdFx0XHRpZiAoZmlsZUVsZW0ucGFyZW50KClbMF0gIT0gZWxlbVswXSkge1xuLy9cdFx0XHRcdC8vZml4ICMyOTggYnV0dG9uIGVsZW1lbnRcbi8vXHRcdFx0XHRlbGVtLndyYXAoJzxzcGFuPicpO1xuLy9cdFx0XHRcdGVsZW0uY3NzKFwiei1pbmRleFwiLCBcIi0xMDAwXCIpXG4vL1x0XHRcdFx0ZWxlbS5wYXJlbnQoKS5hcHBlbmQoZmlsZUVsZW0pO1xuLy9cdFx0XHRcdGVsZW0gPSBlbGVtLnBhcmVudCgpO1xuLy9cdFx0XHR9XG4vL1x0XHRcdGlmIChlbGVtLmNzcyhcInBvc2l0aW9uXCIpID09PSAnJyB8fCBlbGVtLmNzcyhcInBvc2l0aW9uXCIpID09PSAnc3RhdGljJykge1xuLy9cdFx0XHRcdGVsZW0uY3NzKFwicG9zaXRpb25cIiwgXCJyZWxhdGl2ZVwiKTtcbi8vXHRcdFx0fVxuXHRcdFx0ZWxlbSA9IGZpbGVFbGVtO1xuXHRcdH1cblx0XHRlbGVtLmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0dmFyIGZpbGVzID0gW10sIGZpbGVMaXN0LCBpO1xuXHRcdFx0ZmlsZUxpc3QgPSBldnQuX19maWxlc18gfHwgZXZ0LnRhcmdldC5maWxlcztcblx0XHRcdGlmIChmaWxlTGlzdCAhPSBudWxsKSB7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBmaWxlTGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGZpbGVzLnB1c2goZmlsZUxpc3QuaXRlbShpKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRmbihzY29wZSwge1xuXHRcdFx0XHRcdCRmaWxlcyA6IGZpbGVzLFxuXHRcdFx0XHRcdCRldmVudCA6IGV2dFxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdC8vIHJlbW92ZWQgdGhpcyBzaW5jZSBpdCB3YXMgY29uZnVzaW5nIGlmIHRoZSB1c2VyIGNsaWNrIG9uIGJyb3dzZSBhbmQgdGhlbiBjYW5jZWwgIzE4MVxuLy9cdFx0ZWxlbS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4vL1x0XHRcdHRoaXMudmFsdWUgPSBudWxsO1xuLy9cdFx0fSk7XG5cblx0XHQvLyByZW1vdmVkIGJlY2F1c2Ugb2YgIzI1MyBidWdcblx0XHQvLyB0b3VjaCBzY3JlZW5zXG4vL1x0XHRpZiAoKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykgfHxcbi8vXHRcdFx0XHQobmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzID4gMCkgfHwgKG5hdmlnYXRvci5tc01heFRvdWNoUG9pbnRzID4gMCkpIHtcbi8vXHRcdFx0ZWxlbS5iaW5kKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKGUpIHtcbi8vXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG4vL1x0XHRcdFx0ZS50YXJnZXQuY2xpY2soKTtcbi8vXHRcdFx0fSk7XG4vL1x0XHR9XG5cdH07XG59IF0pO1xuXG5hbmd1bGFyRmlsZVVwbG9hZC5kaXJlY3RpdmUoJ25nRmlsZURyb3BBdmFpbGFibGUnLCBbICckcGFyc2UnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbigkcGFyc2UsICR0aW1lb3V0KSB7XG5cdHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cikge1xuXHRcdGlmICgnZHJhZ2dhYmxlJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJykpIHtcblx0XHRcdHZhciBmbiA9ICRwYXJzZShhdHRyWyduZ0ZpbGVEcm9wQXZhaWxhYmxlJ10pO1xuXHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGZuKHNjb3BlKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn0gXSk7XG5cbmFuZ3VsYXJGaWxlVXBsb2FkLmRpcmVjdGl2ZSgnbmdGaWxlRHJvcCcsIFsgJyRwYXJzZScsICckdGltZW91dCcsICckbG9jYXRpb24nLCBmdW5jdGlvbigkcGFyc2UsICR0aW1lb3V0LCAkbG9jYXRpb24pIHtcblx0cmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRyKSB7XG5cdFx0aWYgKCdkcmFnZ2FibGUnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSkge1xuXHRcdFx0dmFyIGxlYXZlVGltZW91dCA9IG51bGw7XG5cdFx0XHRlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdCR0aW1lb3V0LmNhbmNlbChsZWF2ZVRpbWVvdXQpO1xuXHRcdFx0XHRpZiAoIWVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfKSB7XG5cdFx0XHRcdFx0aWYgKGF0dHJbJ25nRmlsZURyYWdPdmVyQ2xhc3MnXSAmJiBhdHRyWyduZ0ZpbGVEcmFnT3ZlckNsYXNzJ10uc2VhcmNoKC9cXCkgKiQvKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHR2YXIgZHJhZ092ZXJDbGFzcyA9ICRwYXJzZShhdHRyWyduZ0ZpbGVEcmFnT3ZlckNsYXNzJ10pKHNjb3BlLCB7XG5cdFx0XHRcdFx0XHRcdCRldmVudCA6IGV2dFxuXHRcdFx0XHRcdFx0fSk7XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0ZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18gPSBkcmFnT3ZlckNsYXNzOyBcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18gPSBhdHRyWyduZ0ZpbGVEcmFnT3ZlckNsYXNzJ10gfHwgXCJkcmFnb3ZlclwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbGVtLmFkZENsYXNzKGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfKTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbnRlclwiLCBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiwgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGxlYXZlVGltZW91dCA9ICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGVsZW0ucmVtb3ZlQ2xhc3MoZWxlbVswXS5fX2RyYWdfb3Zlcl9jbGFzc18pO1xuXHRcdFx0XHRcdGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfID0gbnVsbDtcblx0XHRcdFx0fSwgYXR0clsnbmdGaWxlRHJhZ092ZXJEZWxheSddIHx8IDEpO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0dmFyIGZuID0gJHBhcnNlKGF0dHJbJ25nRmlsZURyb3AnXSk7XG5cdFx0XHRlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0ZWxlbS5yZW1vdmVDbGFzcyhlbGVtWzBdLl9fZHJhZ19vdmVyX2NsYXNzXyk7XG5cdFx0XHRcdGVsZW1bMF0uX19kcmFnX292ZXJfY2xhc3NfID0gbnVsbDtcblx0XHRcdFx0ZXh0cmFjdEZpbGVzKGV2dCwgZnVuY3Rpb24oZmlsZXMpIHtcblx0XHRcdFx0XHRmbihzY29wZSwge1xuXHRcdFx0XHRcdFx0JGZpbGVzIDogZmlsZXMsXG5cdFx0XHRcdFx0XHQkZXZlbnQgOiBldnRcblx0XHRcdFx0XHR9KTtcdFx0XHRcdFx0XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRmdW5jdGlvbiBpc0FTQ0lJKHN0cikge1xuXHRcdFx0XHRyZXR1cm4gL15bXFwwMDAtXFwxNzddKiQvLnRlc3Qoc3RyKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gZXh0cmFjdEZpbGVzKGV2dCwgY2FsbGJhY2spIHtcblx0XHRcdFx0dmFyIGZpbGVzID0gW10sIGl0ZW1zID0gZXZ0LmRhdGFUcmFuc2Zlci5pdGVtcztcblx0XHRcdFx0aWYgKGl0ZW1zICYmIGl0ZW1zLmxlbmd0aCA+IDAgJiYgaXRlbXNbMF0ud2Via2l0R2V0QXNFbnRyeSAmJiAkbG9jYXRpb24ucHJvdG9jb2woKSAhPSAnZmlsZScgJiYgXG5cdFx0XHRcdFx0XHRpdGVtc1swXS53ZWJraXRHZXRBc0VudHJ5KCkuaXNEaXJlY3RvcnkpIHtcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgZW50cnkgPSBpdGVtc1tpXS53ZWJraXRHZXRBc0VudHJ5KCk7XG5cdFx0XHRcdFx0XHRpZiAoZW50cnkgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHQvL2ZpeCBmb3IgY2hyb21lIGJ1ZyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MTQ5NzM1XG5cdFx0XHRcdFx0XHRcdGlmIChpc0FTQ0lJKGVudHJ5Lm5hbWUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0dHJhdmVyc2VGaWxlVHJlZShmaWxlcywgZW50cnkpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCFpdGVtc1tpXS53ZWJraXRHZXRBc0VudHJ5KCkuaXNEaXJlY3RvcnkpIHtcblx0XHRcdFx0XHRcdFx0XHRmaWxlcy5wdXNoKGl0ZW1zW2ldLmdldEFzRmlsZSgpKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YXIgZmlsZUxpc3QgPSBldnQuZGF0YVRyYW5zZmVyLmZpbGVzO1xuXHRcdFx0XHRcdGlmIChmaWxlTGlzdCAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdGZpbGVzLnB1c2goZmlsZUxpc3QuaXRlbShpKSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdChmdW5jdGlvbiB3YWl0Rm9yUHJvY2VzcyhkZWxheSkge1xuXHRcdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKCFwcm9jZXNzaW5nKSB7XG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrKGZpbGVzKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHdhaXRGb3JQcm9jZXNzKDEwKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LCBkZWxheSB8fCAwKVxuXHRcdFx0XHR9KSgpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR2YXIgcHJvY2Vzc2luZyA9IDA7XG5cdFx0XHRmdW5jdGlvbiB0cmF2ZXJzZUZpbGVUcmVlKGZpbGVzLCBlbnRyeSwgcGF0aCkge1xuXHRcdFx0XHRpZiAoZW50cnkgIT0gbnVsbCkge1xuXHRcdFx0XHRcdGlmIChlbnRyeS5pc0RpcmVjdG9yeSkge1xuXHRcdFx0XHRcdFx0dmFyIGRpclJlYWRlciA9IGVudHJ5LmNyZWF0ZVJlYWRlcigpO1xuXHRcdFx0XHRcdFx0cHJvY2Vzc2luZysrO1xuXHRcdFx0XHRcdFx0ZGlyUmVhZGVyLnJlYWRFbnRyaWVzKGZ1bmN0aW9uKGVudHJpZXMpIHtcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0dHJhdmVyc2VGaWxlVHJlZShmaWxlcywgZW50cmllc1tpXSwgKHBhdGggPyBwYXRoIDogXCJcIikgKyBlbnRyeS5uYW1lICsgXCIvXCIpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHByb2Nlc3NpbmctLTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwcm9jZXNzaW5nKys7XG5cdFx0XHRcdFx0XHRlbnRyeS5maWxlKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRcdFx0cHJvY2Vzc2luZy0tO1xuXHRcdFx0XHRcdFx0XHRmaWxlLl9yZWxhdGl2ZVBhdGggPSAocGF0aCA/IHBhdGggOiBcIlwiKSArIGZpbGUubmFtZTtcblx0XHRcdFx0XHRcdFx0ZmlsZXMucHVzaChmaWxlKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn0gXSk7XG5cbn0pKCk7XG4iLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXG5cbi8qKlxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqL1xuXG5hbmd1bGFyLm1vZHVsZSggJ2N5cGh5LmNvbXBvbmVudHMnIClcbiAgICAuY29udHJvbGxlciggJ0NvbXBvbmVudERldGFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsIGNvbXBvbmVudFNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGNvbnRleHQgPSB7fSxcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSB7fSxcbiAgICAgICAgICAgIGNvbm5lY3RvcnMgPSB7fSxcbiAgICAgICAgICAgIHBvcnRzID0ge307XG5cbiAgICAgICAgY29uc29sZS5sb2coICdDb21wb25lbnREZXRhaWxzQ29udHJvbGxlcicgKTtcbiAgICAgICAgJHNjb3BlLmluaXQgPSBmdW5jdGlvbiAoIGNvbm5lY3Rpb25JZCApIHtcbiAgICAgICAgICAgICRzY29wZS5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XG4gICAgICAgICAgICBpZiAoICRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZyggJHNjb3BlLmNvbm5lY3Rpb25JZCApICkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogJ0NvbXBvbmVudERldGFpbHNfJyArICggbmV3IERhdGUoKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgJHNjb3BlLiRvbiggJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ0Rlc3Ryb3lpbmcgOicsIGNvbnRleHQucmVnaW9uSWQgKTtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyggY29udGV4dCApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5kZXRhaWxzID0ge1xuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgY29ubmVjdG9yczogY29ubmVjdG9ycyxcbiAgICAgICAgICAgICAgICBwb3J0czogcG9ydHNcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKCBjb250ZXh0LCBmdW5jdGlvbiAoIGRlc3Ryb3kgKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9LFxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgcG9ydHM6IHt9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAoIGRlc3Ryb3kgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vVE9ETzogbm90aWZ5IHVzZXJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oICdDb21wb25lbnREZXRhaWxzQ29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyApO1xuXG4gICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaEludGVyZmFjZXMoIGNvbnRleHQsICRzY29wZS5jb21wb25lbnRJZCwgZnVuY3Rpb24gKCB1cGRhdGVPYmplY3QgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHdhdGNoSW50ZXJmYWNlcyBrZWVwcyB0aGUgZGF0YSB1cC10by1kYXRlIHRoZXJlIHNob3VsZG4ndCBiZSBhIG5lZWQgdG8gZG8gYW55XG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZXMgaGVyZS4uXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnd2F0Y2hJbnRlcmZhY2VzJywgdXBkYXRlT2JqZWN0ICk7XG4gICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGNvbXBvbmVudEludGVyZmFjZXMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wcm9wZXJ0aWVzID0gY29tcG9uZW50SW50ZXJmYWNlcy5wcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMuY29ubmVjdG9ycyA9IGNvbXBvbmVudEludGVyZmFjZXMuY29ubmVjdG9ycztcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLnBvcnRzID0gY29tcG9uZW50SW50ZXJmYWNlcy5wb3J0cztcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9O1xuICAgIH0gKVxuICAgIC5kaXJlY3RpdmUoICdjb21wb25lbnREZXRhaWxzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRJZDogJz1jb21wb25lbnRJZCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXF1aXJlOiAnXmNvbXBvbmVudExpc3QnLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKCBzY29wZSwgZWxlbSwgYXR0ciwgY29tcG9uZXRMaXN0Q29udHJvbGxlciApIHtcbiAgICAgICAgICAgICAgICB2YXIgY29ubmVjdGlvbklkID0gY29tcG9uZXRMaXN0Q29udHJvbGxlci5nZXRDb25uZWN0aW9uSWQoKTtcbiAgICAgICAgICAgICAgICBzY29wZS5pbml0KCBjb25uZWN0aW9uSWQgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvSW50ZXJmYWNlRGV0YWlscy5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb21wb25lbnREZXRhaWxzQ29udHJvbGxlcidcbiAgICAgICAgfTtcbiAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xuXG4vKipcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoICdjeXBoeS5jb21wb25lbnRzJyApXG4gICAgLmNvbnRyb2xsZXIoICdDb21wb25lbnRMaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlLCAkd2luZG93LCAkbW9kYWwsIGdyb3dsLCBjb21wb25lbnRTZXJ2aWNlLCBmaWxlU2VydmljZSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXJcbiAgICAgICAgaXRlbXMgPSBbXSwgLy8gSXRlbXMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZSBpdGVtLWxpc3QgdWktY29tcG9uZW50LlxuICAgICAgICAgICAgY29tcG9uZW50SXRlbXMgPSB7fSwgLy8gU2FtZSBpdGVtcyBhcmUgc3RvcmVkIGluIGEgZGljdGlvbmFyeS5cbiAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtLFxuICAgICAgICAgICAgYWRkRG9tYWluV2F0Y2hlcixcbiAgICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICAgIGNvbnRleHQ7XG5cbiAgICAgICAgY29uc29sZS5sb2coICdDb21wb25lbnRMaXN0Q29udHJvbGxlcicsICRzY29wZS5hdm1JZHMgKTtcbiAgICAgICAgdGhpcy5nZXRDb25uZWN0aW9uSWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLmNvbm5lY3Rpb25JZDtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbm5lY3Rpb25JZCBhbmQgcmVnaXN0ZXIgY2xlYW4tdXAgb24gZGVzdHJveSBldmVudC5cbiAgICAgICAgaWYgKCAkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoICRzY29wZS5jb25uZWN0aW9uSWQgKSApIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdDb21wb25lbnRMaXN0Q29udHJvbGxlcl8nICsgKCBuZXcgRGF0ZSgpIClcbiAgICAgICAgICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAkc2NvcGUuJG9uKCAnJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyggY29udGV4dCApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBpdGVtIGxpc3QgdWkgY29tcG9uZW50LlxuICAgICAgICBjb25maWcgPSB7XG5cbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXG4gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcblxuICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcblxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uICggalFFdmVudCwgdWkgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkgKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKCBldmVudCwgaXRlbSApIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuJGVtaXQoICdzZWxlY3RlZEluc3RhbmNlcycsIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgaWRzOiBpdGVtLmRhdGEuaW5zdGFuY2VJZHNcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBpdGVtQ29udGV4dG1lbnVSZW5kZXJlcjogZnVuY3Rpb24gKCBlLCBpdGVtICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFsge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuSW5FZGl0b3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCAnLz9wcm9qZWN0PUFETUVkaXRvciZhY3RpdmVPYmplY3Q9JyArIGl0ZW0uaWQsICdfYmxhbmsnICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZWRpdENvbXBvbmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VkaXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBpdGVtLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVkaXRDb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYjogY29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29tcG9uZW50cydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0NvbXBvbmVudEVkaXQuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQ29tcG9uZW50RWRpdENvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9zaXplOiBzaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKCBmdW5jdGlvbiAoIGVkaXRlZERhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhdHRycyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJTkZPJzogZWRpdGVkRGF0YS5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLnNldENvbXBvbmVudEF0dHJpYnV0ZXMoIGVkaXRDb250ZXh0LCBkYXRhLmlkLCBhdHRycyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnQXR0cmlidXRlIHVwZGF0ZWQnICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhwb3J0QXNBY20nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeHBvcnQgQUNNJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2hhcmUtYWx0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogaXRlbS5kYXRhLnJlc291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGFzaCA9IGRhdGEucmVzb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGZpbGVTZXJ2aWNlLmdldERvd25sb2FkVXJsKCBoYXNoICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB1cmwgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoICdBQ00gZmlsZSBmb3IgPGEgaHJlZj1cIicgKyB1cmwgKyAnXCI+JyArIGRhdGEubmFtZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9hPiBleHBvcnRlZC4nICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyggZGF0YS5uYW1lICsgJyBkb2VzIG5vdCBoYXZlIGEgcmVzb3VyY2UuJyApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtczogWyB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2RlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS50aXRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvU2ltcGxlTW9kYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTaW1wbGVNb2RhbENvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUgQ29tcG9uZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogJ1RoaXMgd2lsbCBkZWxldGUgJyArIGRhdGEubmFtZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIGZyb20gdGhlIHdvcmtzcGFjZS4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS5kZWxldGVDb21wb25lbnQoIGNvbnRleHQsIGRhdGEuaWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICAgICAgfSBdO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoIC8qaXRlbSovKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaXRlbS5kZXRhaWxzID0gJ015IGRldGFpbHMgYXJlIGhlcmUgbm93ISc7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBmaWx0ZXI6IHt9XG5cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xuICAgICAgICAkc2NvcGUubGlzdERhdGEgPSB7XG4gICAgICAgICAgICBpdGVtczogaXRlbXNcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUcmFuc2Zvcm0gdGhlIHJhdyBzZXJ2aWNlIG5vZGUgZGF0YSB0byBpdGVtcyBmb3IgdGhlIGxpc3QuXG4gICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtID0gZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgdmFyIGxpc3RJdGVtO1xuXG4gICAgICAgICAgICBpZiAoIGNvbXBvbmVudEl0ZW1zLmhhc093blByb3BlcnR5KCBkYXRhLmlkICkgKSB7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSBjb21wb25lbnRJdGVtc1sgZGF0YS5pZCBdO1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnRpdGxlID0gZGF0YS5uYW1lO1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kYXRhLnJlc291cmNlID0gZGF0YS5yZXNvdXJjZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAkc2NvcGUuYXZtSWRzID8gJ0hpZ2hsaWdodCBpbnN0YW5jZXMnIDogJycsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTogJ04vQScsIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiAnTi9BJyAvLyBUT0RPOiBnZXQgdGhpcyBpbiB0aGUgZnV0dXJlLlxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdGF0czogW10sXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHM6ICdDb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsc1RlbXBsYXRlVXJsOiAnY29tcG9uZW50RGV0YWlscy5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IGRhdGEucmVzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKCAkc2NvcGUuYXZtSWRzICkge1xuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbS5kYXRhLmluc3RhbmNlSWRzID0gJHNjb3BlLmF2bUlkc1sgZGF0YS5hdm1JZCBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGxpc3QtaXRlbSB0byB0aGUgaXRlbXMgbGlzdCBhbmQgdGhlIGRpY3Rpb25hcnkuXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCggbGlzdEl0ZW0gKTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRJdGVtc1sgbGlzdEl0ZW0uaWQgXSA9IGxpc3RJdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGFkZERvbWFpbldhdGNoZXIgPSBmdW5jdGlvbiAoIGNvbXBvbmVudElkICkge1xuICAgICAgICAgICAgdmFyIGRvbWFpbk1vZGVsc1RvU3RhdCA9IGZ1bmN0aW9uICggZG9tYWluTW9kZWxzICkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0cyA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbE1hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIENBRDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdDQUQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLWNvZGVwZW4nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgQ3liZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnQ3liZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLWxhcHRvcCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBNYW51ZmFjdHVyaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ01hbnVmYWN0dXJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXdyZW5jaCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBNb2RlbGljYToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdNb2RlbGljYScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtZ2VhcnMnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGtleTtcbiAgICAgICAgICAgICAgICBmb3IgKCBrZXkgaW4gZG9tYWluTW9kZWxzICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGRvbWFpbk1vZGVscy5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGxhYmVsTWFwWyBkb21haW5Nb2RlbHNbIGtleSBdLnR5cGUgXSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbE1hcFsgZG9tYWluTW9kZWxzWyBrZXkgXS50eXBlIF0udmFsdWUgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvciggJ1VuZXhwZWN0ZWQgZG9tYWluLW1vZGVsIHR5cGUnLCBkb21haW5Nb2RlbHNbIGtleSBdLnR5cGUgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKCBrZXkgaW4gbGFiZWxNYXAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggbGFiZWxNYXAuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBsYWJlbE1hcFsga2V5IF0udmFsdWUgPiAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRzLnB1c2goIGxhYmVsTWFwWyBrZXkgXSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0cztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnREb21haW5zKCBjb250ZXh0LCBjb21wb25lbnRJZCwgZnVuY3Rpb24gKCB1cGRhdGVEYXRhICkge1xuICAgICAgICAgICAgICAgIHZhciBsaXN0SXRlbSA9IGNvbXBvbmVudEl0ZW1zWyBjb21wb25lbnRJZCBdO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnRG9tYWluTW9kZWxzIHVwZGF0ZWQsIGV2ZW50IHR5cGU6JywgdXBkYXRlRGF0YS50eXBlICk7XG4gICAgICAgICAgICAgICAgaWYgKCBsaXN0SXRlbSApIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHMgPSBkb21haW5Nb2RlbHNUb1N0YXQoIHVwZGF0ZURhdGEuZG9tYWluTW9kZWxzICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCAnRG9tYWluTW9kZWwgZGF0YSBkaWQgbm90IGhhdmUgbWF0Y2hpbmcgY29tcG9uZW50RGF0YScsIGNvbXBvbmVudElkICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpc3RJdGVtID0gY29tcG9uZW50SXRlbXNbIGNvbXBvbmVudElkIF07XG4gICAgICAgICAgICAgICAgICAgIGlmICggbGlzdEl0ZW0gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0cyA9IGRvbWFpbk1vZGVsc1RvU3RhdCggZGF0YS5kb21haW5Nb2RlbHMgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybiggJ0RvbWFpbk1vZGVsIGRhdGEgZGlkIG5vdCBoYXZlIG1hdGNoaW5nIGNvbXBvbmVudERhdGEnLCBjb21wb25lbnRJZCApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbXBvbmVudFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKCBjb250ZXh0LCBmdW5jdGlvbiAoIGRlc3Ryb3llZCApIHtcbiAgICAgICAgICAgIGl0ZW1zID0gW107XG4gICAgICAgICAgICAkc2NvcGUubGlzdERhdGEuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgICAgIGNvbXBvbmVudEl0ZW1zID0ge307XG5cbiAgICAgICAgICAgIGlmICggZGVzdHJveWVkICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybiggJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyApO1xuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCAnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnICk7XG5cbiAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnRzKCBjb250ZXh0LCAkc2NvcGUud29ya3NwYWNlSWQsICRzY29wZS5hdm1JZHMsIGZ1bmN0aW9uIChcbiAgICAgICAgICAgICAgICB1cGRhdGVPYmplY3QgKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4O1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS53YXJuKHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICAgICAgaWYgKCB1cGRhdGVPYmplY3QudHlwZSA9PT0gJ2xvYWQnICkge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSggdXBkYXRlT2JqZWN0LmRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgYWRkRG9tYWluV2F0Y2hlciggdXBkYXRlT2JqZWN0LmlkICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnICkge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSggdXBkYXRlT2JqZWN0LmRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgLy8kc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGNvbXBvbmVudEl0ZW1zLmhhc093blByb3BlcnR5KCB1cGRhdGVPYmplY3QuaWQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaXRlbXMubWFwKCBmdW5jdGlvbiAoIGUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5kZXhPZiggdXBkYXRlT2JqZWN0LmlkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGluZGV4ID4gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMuc3BsaWNlKCBpbmRleCwgMSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS5jbGVhblVwUmVnaW9uKCBjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnX3dhdGNoQ29tcG9uZW50RG9tYWluc18nICsgdXBkYXRlT2JqZWN0LmlkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgY29tcG9uZW50SXRlbXNbIHVwZGF0ZU9iamVjdC5pZCBdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggdXBkYXRlT2JqZWN0ICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudElkO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKCBjb21wb25lbnRJZCBpbiBkYXRhLmNvbXBvbmVudHMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGRhdGEuY29tcG9uZW50cy5oYXNPd25Qcm9wZXJ0eSggY29tcG9uZW50SWQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSggZGF0YS5jb21wb25lbnRzWyBjb21wb25lbnRJZCBdICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRG9tYWluV2F0Y2hlciggY29tcG9uZW50SWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApO1xuICAgIH0gKVxuICAgIC5jb250cm9sbGVyKCAnQ29tcG9uZW50RWRpdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIGRhdGEgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvblxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCAkc2NvcGUuZGF0YSApO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCAnY2FuY2VsJyApO1xuICAgICAgICB9O1xuICAgIH0gKVxuICAgIC5kaXJlY3RpdmUoICdjb21wb25lbnRMaXN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VJZDogJz13b3Jrc3BhY2VJZCcsXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCcsXG4gICAgICAgICAgICAgICAgYXZtSWRzOiAnPWF2bUlkcydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvQ29tcG9uZW50TGlzdC5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb21wb25lbnRMaXN0Q29udHJvbGxlcidcbiAgICAgICAgfTtcbiAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xuXG4vKipcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoICdjeXBoeS5jb21wb25lbnRzJyApXG4gICAgLmNvbnRyb2xsZXIoICdDb25maWd1cmF0aW9uU2V0U2VsZWN0b3JDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsIGdyb3dsLCBkZXNpZ25TZXJ2aWNlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBjb250ZXh0LFxuICAgICAgICAgICAgc3Bhd25lZENvbmZpZ3VyYXRpb25SZWdpb25zID0gW107XG4gICAgICAgICRzY29wZS5kYXRhTW9kZWwgPSB7XG4gICAgICAgICAgICBkYXRhQXZhbGlhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25TZXRzOiB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICggJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCAkc2NvcGUuY29ubmVjdGlvbklkICkgKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnQ29uZmlndXJhdGlvblNldFNlbGVjdG9yQ29udHJvbGxlcl8nICsgKCBuZXcgRGF0ZSgpIClcbiAgICAgICAgICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAkc2NvcGUuJG9uKCAnJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyggY29udGV4dCApO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJyRkZXN0cm95ZWQgJyArIGNvbnRleHQucmVnaW9uSWQpO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlc2lnblNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKCBjb250ZXh0LCBmdW5jdGlvbiAoIGRlc3Ryb3llZCApIHtcbiAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWwuZGF0YUF2YWxpYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbC5jb25maWd1cmF0aW9uU2V0cyA9IHt9O1xuXG4gICAgICAgICAgICBpZiAoIGRlc3Ryb3llZCApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oICdkZXN0cm95IGV2ZW50IHJhaXNlZCcgKTtcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaENvbmZpZ3VyYXRpb25TZXRzKCBjb250ZXh0LCAkc2NvcGUuZGVzaWduSWQsIGZ1bmN0aW9uICggdXBkYXRlT2JqZWN0ICkge1xuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWwuZGF0YUF2YWxpYWJsZSA9IE9iamVjdC5rZXlzKCB1cGRhdGVPYmplY3QuZGF0YS5jb25maWd1cmF0aW9uU2V0cyApXG4gICAgICAgICAgICAgICAgICAgIC5sZW5ndGggPiAwO1xuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGFNb2RlbC5jb25maWd1cmF0aW9uU2V0cyA9IGRhdGEuY29uZmlndXJhdGlvblNldHM7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWwuZGF0YUF2YWxpYWJsZSA9IE9iamVjdC5rZXlzKCBkYXRhLmNvbmZpZ3VyYXRpb25TZXRzIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5sZW5ndGggPiAwO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgICRzY29wZS5sb2FkQ29uZmlndXJhdGlvbnMgPSBmdW5jdGlvbiAoIHNldElkLCBzZXROYW1lICkge1xuICAgICAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgc3Bhd25lZENvbmZpZ3VyYXRpb25SZWdpb25zLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcFJlZ2lvbiggY29udGV4dCwgc3Bhd25lZENvbmZpZ3VyYXRpb25SZWdpb25zWyBpIF0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNwYXduZWRDb25maWd1cmF0aW9uUmVnaW9ucyA9IFtdO1xuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaENvbmZpZ3VyYXRpb25zKCBjb250ZXh0LCBzZXRJZCwgZnVuY3Rpb24gKCB1cGRhdGVPYmplY3QgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCB1cGRhdGVPYmplY3QgKTtcbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBzcGF3bmVkQ29uZmlndXJhdGlvblJlZ2lvbnMucHVzaCggZGF0YS5yZWdpb25JZCApO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKCBrZXkgaW4gZGF0YS5jb25maWd1cmF0aW9ucyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggZGF0YS5jb25maWd1cmF0aW9ucy5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnID0gZGF0YS5jb25maWd1cmF0aW9uc1sga2V5IF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMucHVzaCgge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNvbmZpZy5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbmZpZy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogSlNPTi5wYXJzZSggY29uZmlnLmFsdGVybmF0aXZlQXNzaWdubWVudHMgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoIGVycm9yICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvciggJ0NvbmZpZ3VyYXRpb24gJyArIGNvbmZpZy5uYW1lICsgJyBoYWQgaW52YWxpZCBhdHRyaWJ1dGUuJyApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCAnQ291bGQgbm90IHBhcnNlJywgY29uZmlnLmFsdGVybmF0aXZlQXNzaWdubWVudHMsIGVycm9yICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kZW1pdCggJ2NvbmZpZ3VyYXRpb25zTG9hZGVkJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IGNvbmZpZ3VyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0TmFtZTogc2V0TmFtZVxuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICB9O1xuICAgIH0gKVxuICAgIC5kaXJlY3RpdmUoICdjb25maWd1cmF0aW9uU2V0U2VsZWN0b3InLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIGRlc2lnbklkOiAnPWRlc2lnbklkJyxcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Db25maWd1cmF0aW9uU2V0U2VsZWN0b3IuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ29uZmlndXJhdGlvblNldFNlbGVjdG9yQ29udHJvbGxlcidcbiAgICAgICAgfTtcbiAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIqL1xuXG4vKipcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoICdjeXBoeS5jb21wb25lbnRzJyApXG4gICAgLmNvbnRyb2xsZXIoICdDb25maWd1cmF0aW9uVGFibGVDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgJHNjb3BlLmRhdGFNb2RlbCA9IHtcbiAgICAgICAgICAgIGNoYW5nZUluZm86IFtdLFxuICAgICAgICAgICAgc2VsZWN0ZWQ6IFtdLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6ICRzY29wZS5jb25maWd1cmF0aW9ucyxcbiAgICAgICAgICAgIHNldE5hbWU6ICRzY29wZS5zZXROYW1lXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnRhYmxlQ29sdW1uRGVmaW5pdGlvbiA9IFsge1xuICAgICAgICAgICAgY29sdW1uSGVhZGVyRGlzcGxheU5hbWU6ICdOYW1lJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGFibGVDZWxsLmh0bWwnLFxuICAgICAgICAgICAgc29ydEtleTogJ25hbWUnXG4gICAgICAgIH0gXTtcblxuICAgICAgICAkc2NvcGUuJG9uKCAnZXhwb3NlU2VsZWN0aW9uJywgZnVuY3Rpb24gKCBldmVudCwgdHlwZSApIHtcbiAgICAgICAgICAgICRzY29wZS4kZW1pdCggJ3NlbGVjdGlvbkV4cG9zZWQnLCAkc2NvcGUuZGF0YU1vZGVsLnNlbGVjdGVkLCB0eXBlICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICAkc2NvcGUuY2ZnQ2xpY2tlZCA9IGZ1bmN0aW9uICggY2ZnICkge1xuICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCAnY29uZmlndXJhdGlvbkNsaWNrZWQnLCBjZmcgKTtcbiAgICAgICAgfTtcbiAgICB9IClcbiAgICAuZGlyZWN0aXZlKCAnY29uZmlndXJhdGlvblRhYmxlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uczogJz1jb25maWd1cmF0aW9ucycsXG4gICAgICAgICAgICAgICAgc2V0TmFtZTogJz1zZXROYW1lJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Db25maWd1cmF0aW9uVGFibGUuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQ29uZmlndXJhdGlvblRhYmxlQ29udHJvbGxlcidcbiAgICAgICAgfTtcbiAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xuXG4vKipcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoICdjeXBoeS5jb21wb25lbnRzJyApXG4gICAgLmNvbnRyb2xsZXIoICdEZXNpZ25EZXRhaWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlLCBkZXNpZ25TZXJ2aWNlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBjb250ZXh0ID0ge30sXG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0ge30sXG4gICAgICAgICAgICBjb25uZWN0b3JzID0ge30sXG4gICAgICAgICAgICBwb3J0cyA9IHt9O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCAnRGVzaWduRGV0YWlsc0NvbnRyb2xsZXInICk7XG4gICAgICAgICRzY29wZS5pbml0ID0gZnVuY3Rpb24gKCBjb25uZWN0aW9uSWQgKSB7XG4gICAgICAgICAgICAkc2NvcGUuY29ubmVjdGlvbklkID0gY29ubmVjdGlvbklkO1xuICAgICAgICAgICAgaWYgKCAkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoICRzY29wZS5jb25uZWN0aW9uSWQgKSApIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdEZXNpZ25EZXRhaWxzXycgKyAoIG5ldyBEYXRlKCkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICRzY29wZS4kb24oICckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdEZXN0cm95aW5nIDonLCBjb250ZXh0LnJlZ2lvbklkICk7XG4gICAgICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoIGNvbnRleHQgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IGNvbm5lY3RvcnMsXG4gICAgICAgICAgICAgICAgcG9ydHM6IHBvcnRzXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlciggY29udGV4dCwgZnVuY3Rpb24gKCBkZXN0cm95ICkge1xuICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzID0ge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdG9yczoge30sXG4gICAgICAgICAgICAgICAgICAgIHBvcnRzOiB7fVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKCBkZXN0cm95ICkge1xuICAgICAgICAgICAgICAgICAgICAvL1RPRE86IG5vdGlmeSB1c2VyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCAnRGVzaWduRGV0YWlsc0NvbnRyb2xsZXIgLSBpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcgKTtcblxuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKCBjb250ZXh0LCAkc2NvcGUuZGVzaWduSWQsIGZ1bmN0aW9uICggdXBkYXRlT2JqZWN0ICkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSB3YXRjaEludGVyZmFjZXMga2VlcHMgdGhlIGRhdGEgdXAtdG8tZGF0ZSB0aGVyZSBzaG91bGRuJ3QgYmUgYSBuZWVkIHRvIGRvIGFueVxuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGVzIGhlcmUuLlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhdGNoSW50ZXJmYWNlcycsIHVwZGF0ZU9iamVjdCApO1xuICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkZXNpZ25JbnRlcmZhY2VzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMucHJvcGVydGllcyA9IGRlc2lnbkludGVyZmFjZXMucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLmNvbm5lY3RvcnMgPSBkZXNpZ25JbnRlcmZhY2VzLmNvbm5lY3RvcnM7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wb3J0cyA9IGRlc2lnbkludGVyZmFjZXMucG9ydHM7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfTtcbiAgICB9IClcbiAgICAuZGlyZWN0aXZlKCAnZGVzaWduRGV0YWlscycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgZGVzaWduSWQ6ICc9ZGVzaWduSWQnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVxdWlyZTogJ15kZXNpZ25MaXN0JyxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uICggc2NvcGUsIGVsZW0sIGF0dHIsIGRlc2lnbkxpc3RDb250cm9sbGVyICkge1xuICAgICAgICAgICAgICAgIHZhciBjb25uZWN0aW9uSWQgPSBkZXNpZ25MaXN0Q29udHJvbGxlci5nZXRDb25uZWN0aW9uSWQoKTtcbiAgICAgICAgICAgICAgICBzY29wZS5pbml0KCBjb25uZWN0aW9uSWQgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvSW50ZXJmYWNlRGV0YWlscy5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdEZXNpZ25EZXRhaWxzQ29udHJvbGxlcidcbiAgICAgICAgfTtcbiAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xuXG4vKipcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKiBAYXV0aG9yIGxhdHRtYW5uIC8gaHR0cHM6Ly9naXRodWIuY29tL2xhdHRtYW5uXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoICdjeXBoeS5jb21wb25lbnRzJyApXG4gICAgLmNvbnRyb2xsZXIoICdEZXNpZ25MaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlLCAkd2luZG93LCAkbG9jYXRpb24sICRtb2RhbCwgZGVzaWduU2VydmljZSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXJcbiAgICAgICAgaXRlbXMgPSBbXSwgLy8gSXRlbXMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZSBpdGVtLWxpc3QgdWktY29tcG9uZW50LlxuICAgICAgICAgICAgZGVzaWduSXRlbXMgPSB7fSwgLy8gU2FtZSBpdGVtcyBhcmUgc3RvcmVkIGluIGEgZGljdGlvbmFyeS5cbiAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtLFxuICAgICAgICAgICAgY29uZmlnLFxuICAgICAgICAgICAgYWRkQ29uZmlndXJhdGlvbldhdGNoZXIsXG4gICAgICAgICAgICBjb250ZXh0O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCAnRGVzaWduTGlzdENvbnRyb2xsZXInICk7XG4gICAgICAgIHRoaXMuZ2V0Q29ubmVjdGlvbklkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRzY29wZS5jb25uZWN0aW9uSWQ7XG4gICAgICAgIH07XG4gICAgICAgIC8vIENoZWNrIGZvciB2YWxpZCBjb25uZWN0aW9uSWQgYW5kIHJlZ2lzdGVyIGNsZWFuLXVwIG9uIGRlc3Ryb3kgZXZlbnQuXG4gICAgICAgIGlmICggJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCAkc2NvcGUuY29ubmVjdGlvbklkICkgKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnRGVzaWduTGlzdENvbnRyb2xsZXJfJyArICggbmV3IERhdGUoKSApXG4gICAgICAgICAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJHNjb3BlLiRvbiggJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoIGNvbnRleHQgKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnICk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBpdGVtIGxpc3QgdWkgY29tcG9uZW50LlxuICAgICAgICBjb25maWcgPSB7XG5cbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXG4gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcblxuICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcblxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uICggLypqUUV2ZW50LCB1aSovKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnU29ydCBoYXBwZW5lZCcsIGpRRXZlbnQsIHVpKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKCBldmVudCwgaXRlbSApIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3VXJsID0gJy9kZXNpZ25TcGFjZS8nICsgJHNjb3BlLndvcmtzcGFjZUlkLnJlcGxhY2UoIC9cXC8vZywgJy0nICkgKyAnLycgKyBpdGVtLmlkLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIC9cXC8vZywgJy0nICk7XG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoIG5ld1VybCApO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaXRlbUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uICggZSwgaXRlbSApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWyB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnb3BlbkluRWRpdG9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbiggJy8/cHJvamVjdD1BRE1FZGl0b3ImYWN0aXZlT2JqZWN0PScgKyBpdGVtLmlkLCAnX2JsYW5rJyApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2VkaXREZXNpZ24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFZGl0IEF0dHJpYnV0ZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBpdGVtLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYjogY29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoRGVzaWducydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBkZXNpZ25TZXJ2aWNlLmVkaXREZXNpZ25GblxuICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ3NldEFzVG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTZXQgYXMgVExTVVQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6ICEkc2NvcGUudXNlZEJ5VGVzdEJlbmNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZmEgZmEtYXJyb3ctY2lyY2xlLXJpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZFRsc3V0ID0gZGVzaWduSXRlbXNbICRzY29wZS5zdGF0ZS50bHN1dElkIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN0YXRlLnRsc3V0SWQgPSBkYXRhLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kZW1pdCggJ3RvcExldmVsU3lzdGVtVW5kZXJUZXN0U2V0JywgaXRlbSwgb2xkVGxzdXQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdleHBvcnRBc0FkbScsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0V4cG9ydCBBRE0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zaGFyZS1hbHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZGVzaWduU2VydmljZS5leHBvcnRBc0FkbUZuXG4gICAgICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFsge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZGVzaWduU2VydmljZS5kZWxldGVGblxuICAgICAgICAgICAgICAgICAgICB9IF1cbiAgICAgICAgICAgICAgICB9IF07XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBkZXRhaWxzUmVuZGVyZXI6IGZ1bmN0aW9uICggLyppdGVtKi8pIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBpdGVtLmRldGFpbHMgPSAnTXkgZGV0YWlscyBhcmUgaGVyZSBub3chJztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGZpbHRlcjoge31cblxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XG4gICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHRsc3V0SWQ6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuJG9uKCAndG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3RDaGFuZ2VkJywgZnVuY3Rpb24gKCBldmVudCwgaWQgKSB7XG4gICAgICAgICAgICBpZiAoICRzY29wZS5zdGF0ZS50bHN1dElkICYmIGRlc2lnbkl0ZW1zLmhhc093blByb3BlcnR5KCAkc2NvcGUuc3RhdGUudGxzdXRJZCApICkge1xuICAgICAgICAgICAgICAgIGRlc2lnbkl0ZW1zWyAkc2NvcGUuc3RhdGUudGxzdXRJZCBdLmNzc0NsYXNzID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuc3RhdGUudGxzdXRJZCA9IGlkO1xuICAgICAgICAgICAgaWYgKCBkZXNpZ25JdGVtcy5oYXNPd25Qcm9wZXJ0eSggaWQgKSApIHtcbiAgICAgICAgICAgICAgICBkZXNpZ25JdGVtc1sgaWQgXS5jc3NDbGFzcyA9ICd0b3AtbGV2ZWwtc3lzdGVtLXVuZGVyLXRlc3QnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gVHJhbnNmb3JtIHRoZSByYXcgc2VydmljZSBub2RlIGRhdGEgdG8gaXRlbXMgZm9yIHRoZSBsaXN0LlxuICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSA9IGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgIHZhciBsaXN0SXRlbTtcblxuICAgICAgICAgICAgaWYgKCBkZXNpZ25JdGVtcy5oYXNPd25Qcm9wZXJ0eSggZGF0YS5pZCApICkge1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtID0gZGVzaWduSXRlbXNbIGRhdGEuaWQgXTtcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS50aXRsZSA9IGRhdGEubmFtZTtcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kZXNjcmlwdGlvbiA9IGRhdGEuZGVzY3JpcHRpb247XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogZGF0YS5pZCxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ09wZW4gRGVzaWduIFNwYWNlIFZpZXcnLFxuICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJHNjb3BlLnN0YXRlLnRsc3V0SWQgPT09IGRhdGEuaWQgPyAndG9wLWxldmVsLXN5c3RlbS11bmRlci10ZXN0JyA6ICcnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6ICdOL0EnLCAvLyBUT0RPOiBnZXQgdGhpcyBpbiB0aGUgZnV0dXJlLlxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogJ04vQScgLy8gVE9ETzogZ2V0IHRoaXMgaW4gdGhlIGZ1dHVyZS5cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHM6IFsge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnQ29uZmlndXJhdGlvbiBTZXRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tdGgtbGFyZ2UnXG4gICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ0NvbmZpZ3VyYXRpb25zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tdGgnXG4gICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ1Jlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1zdGF0cydcbiAgICAgICAgICAgICAgICAgICAgfSBdLFxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiAnQ29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHNUZW1wbGF0ZVVybDogJ2Rlc2lnbkRldGFpbHMuaHRtbCdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgbGlzdC1pdGVtIHRvIHRoZSBpdGVtcyBsaXN0IGFuZCB0aGUgZGljdGlvbmFyeS5cbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKCBsaXN0SXRlbSApO1xuICAgICAgICAgICAgICAgIGRlc2lnbkl0ZW1zWyBsaXN0SXRlbS5pZCBdID0gbGlzdEl0ZW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgYWRkQ29uZmlndXJhdGlvbldhdGNoZXIgPSBmdW5jdGlvbiAoIGRlc2lnbklkICkge1xuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaE5ick9mQ29uZmlndXJhdGlvbnMoIGNvbnRleHQsIGRlc2lnbklkLCBmdW5jdGlvbiAoIHVwZGF0ZU9iamVjdCApIHtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdEl0ZW0gPSBkZXNpZ25JdGVtc1sgZGVzaWduSWQgXTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHVwZGF0ZU9iamVjdCk7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHNbIDAgXS52YWx1ZSA9IHVwZGF0ZU9iamVjdC5kYXRhLmNvdW50ZXJzLnNldHM7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uc3RhdHNbIDEgXS52YWx1ZSA9IHVwZGF0ZU9iamVjdC5kYXRhLmNvdW50ZXJzLmNvbmZpZ3VyYXRpb25zO1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzWyAyIF0udmFsdWUgPSB1cGRhdGVPYmplY3QuZGF0YS5jb3VudGVycy5yZXN1bHRzO1xuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpc3RJdGVtID0gZGVzaWduSXRlbXNbIGRlc2lnbklkIF07XG4gICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzWyAwIF0udmFsdWUgPSBkYXRhLmNvdW50ZXJzLnNldHM7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtLnN0YXRzWyAxIF0udmFsdWUgPSBkYXRhLmNvdW50ZXJzLmNvbmZpZ3VyYXRpb25zO1xuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbS5zdGF0c1sgMiBdLnZhbHVlID0gZGF0YS5jb3VudGVycy5yZXN1bHRzO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfTtcblxuICAgICAgICBkZXNpZ25TZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlciggY29udGV4dCwgZnVuY3Rpb24gKCBkZXN0cm95ZWQgKSB7XG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xuICAgICAgICAgICAgJHNjb3BlLmxpc3REYXRhLml0ZW1zID0gaXRlbXM7XG4gICAgICAgICAgICBkZXNpZ25JdGVtcyA9IHt9O1xuXG4gICAgICAgICAgICBpZiAoIGRlc3Ryb3llZCApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oICdkZXN0cm95IGV2ZW50IHJhaXNlZCcgKTtcbiAgICAgICAgICAgICAgICAvLyBEYXRhIG5vdCAoeWV0KSBhdmFsaWFibGUuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzcGxheSB0aGlzIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyggJ2luaXRpYWxpemUgZXZlbnQgcmFpc2VkJyApO1xuXG4gICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWducyggY29udGV4dCwgJHNjb3BlLndvcmtzcGFjZUlkLCBmdW5jdGlvbiAoIHVwZGF0ZU9iamVjdCApIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXg7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLndhcm4odXBkYXRlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICBpZiAoIHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKCB1cGRhdGVPYmplY3QuZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICBhZGRDb25maWd1cmF0aW9uV2F0Y2hlciggdXBkYXRlT2JqZWN0LmlkICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1cGRhdGUnICkge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSggdXBkYXRlT2JqZWN0LmRhdGEgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCB1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggZGVzaWduSXRlbXMuaGFzT3duUHJvcGVydHkoIHVwZGF0ZU9iamVjdC5pZCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpdGVtcy5tYXAoIGZ1bmN0aW9uICggZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5pbmRleE9mKCB1cGRhdGVPYmplY3QuaWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggaW5kZXggPiAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UoIGluZGV4LCAxICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBSZWdpb24oIGNvbnRleHQsIGNvbnRleHQucmVnaW9uSWQgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdfd2F0Y2hOYnJPZkNvbmZpZ3VyYXRpb25zXycgKyB1cGRhdGVPYmplY3QuaWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkZXNpZ25JdGVtc1sgdXBkYXRlT2JqZWN0LmlkIF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIHVwZGF0ZU9iamVjdCApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkZXNpZ25JZDtcbiAgICAgICAgICAgICAgICAgICAgZm9yICggZGVzaWduSWQgaW4gZGF0YS5kZXNpZ25zICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBkYXRhLmRlc2lnbnMuaGFzT3duUHJvcGVydHkoIGRlc2lnbklkICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0oIGRhdGEuZGVzaWduc1sgZGVzaWduSWQgXSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZENvbmZpZ3VyYXRpb25XYXRjaGVyKCBkZXNpZ25JZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG4gICAgfSApXG4gICAgLmNvbnRyb2xsZXIoICdEZXNpZ25FZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgZGF0YSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgbmFtZTogZGF0YS5uYW1lXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9rID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoICRzY29wZS5kYXRhICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoICdjYW5jZWwnICk7XG4gICAgICAgIH07XG4gICAgfSApXG4gICAgLmRpcmVjdGl2ZSggJ2Rlc2lnbkxpc3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUlkOiAnPXdvcmtzcGFjZUlkJyxcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJyxcbiAgICAgICAgICAgICAgICB1c2VkQnlUZXN0QmVuY2g6ICc9dXNlZEJ5VGVzdEJlbmNoJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9EZXNpZ25MaXN0Lmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rlc2lnbkxpc3RDb250cm9sbGVyJ1xuICAgICAgICB9O1xuICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXG5cbi8qKlxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqL1xuXG5hbmd1bGFyLm1vZHVsZSggJ2N5cGh5LmNvbXBvbmVudHMnIClcbiAgICAuY29udHJvbGxlciggJ0Rlc2lnblRyZWVDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsICR3aW5kb3csIGRlc2lnblNlcnZpY2UsIGRlc2VydFNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGNvbnRleHQsXG4gICAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgICB0cmVlRGF0YSxcbiAgICAgICAgICAgIHJvb3ROb2RlLFxuICAgICAgICAgICAgYXZtSWRzID0ge30sXG4gICAgICAgICAgICBidWlsZFRyZWVTdHJ1Y3R1cmU7XG5cbiAgICAgICAgY29uc29sZS5sb2coICdEZXNpZ25UcmVlQ29udHJvbGxlcicgKTtcblxuICAgICAgICAvLyBDaGVjayBmb3IgdmFsaWQgY29ubmVjdGlvbklkIGFuZCByZWdpc3RlciBjbGVhbi11cCBvbiBkZXN0cm95IGV2ZW50LlxuICAgICAgICBpZiAoICRzY29wZS5jb25uZWN0aW9uSWQgJiYgYW5ndWxhci5pc1N0cmluZyggJHNjb3BlLmNvbm5lY3Rpb25JZCApICkge1xuICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ0Rlc2lnblRyZWVDb250cm9sbGVyXycgKyAoIG5ldyBEYXRlKCkgKVxuICAgICAgICAgICAgICAgICAgICAudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICRzY29wZS4kb24oICckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zKCBjb250ZXh0ICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdjb25uZWN0aW9uSWQgbXVzdCBiZSBkZWZpbmVkIGFuZCBpdCBtdXN0IGJlIGEgc3RyaW5nJyApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnID0ge1xuICAgICAgICAgICAgbm9kZUNvbnRleHRtZW51UmVuZGVyZXI6IGZ1bmN0aW9uICggZSwgbm9kZSApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWyB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY3JlYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnT3BlbiBpbiBFZGl0b3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1lZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbm9kZS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cub3BlbiggJy8/cHJvamVjdD1BRE1FZGl0b3ImYWN0aXZlT2JqZWN0PScgKyBkYXRhLmlkLCAnX2JsYW5rJyApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IF1cbiAgICAgICAgICAgICAgICB9IF07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbm9kZUNsaWNrOiBmdW5jdGlvbiAoIGUsIG5vZGUgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdOb2RlIHdhcyBjbGlja2VkOicsIG5vZGUsICRzY29wZSApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRpc2FibGVNYW51YWxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgICAgICBmb2xkZXJJY29uQ2xhc3M6ICdmYSBmYS1jdWJlcydcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgbm9kZURibGNsaWNrOiBmdW5jdGlvbiAoIGUsIG5vZGUgKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ05vZGUgd2FzIGRvdWJsZS1jbGlja2VkOicsIG5vZGUgKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgbm9kZUV4cGFuZGVyQ2xpY2s6IGZ1bmN0aW9uICggZSwgbm9kZSwgaXNFeHBhbmQgKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ0V4cGFuZGVyIHdhcyBjbGlja2VkIGZvciBub2RlOicsIG5vZGUsIGlzRXhwYW5kICk7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgICAgIHJvb3ROb2RlID0ge1xuICAgICAgICAgICAgaWQ6ICRzY29wZS5kZXNpZ25JZCxcbiAgICAgICAgICAgIGxhYmVsOiAnTG9hZGluZyBEZXNpZ24gU3BhY2UgTm9kZXMuLicsXG4gICAgICAgICAgICBleHRyYUluZm86ICcnLFxuICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgICAgY2hpbGRyZW5Db3VudDogMFxuICAgICAgICB9O1xuXG4gICAgICAgIHRyZWVEYXRhID0ge1xuICAgICAgICAgICAgaWQ6ICcnLFxuICAgICAgICAgICAgbGFiZWw6ICcnLFxuICAgICAgICAgICAgZXh0cmFJbmZvOiAnJyxcbiAgICAgICAgICAgIHVuQ29sbGFwc2libGU6IHRydWUsXG4gICAgICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgICAgICAgIHJvb3ROb2RlXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgY2hpbGRyZW5Db3VudDogMVxuICAgICAgICB9O1xuICAgICAgICAkc2NvcGUuY29uZmlnID0gY29uZmlnO1xuICAgICAgICAkc2NvcGUudHJlZURhdGEgPSB0cmVlRGF0YTtcbiAgICAgICAgJHNjb3BlLiRvbiggJ3NldFNlbGVjdGVkTm9kZXMnLCBmdW5jdGlvbiAoIGV2ZW50LCBkYXRhICkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbmZpZy5zdGF0ZS5zZWxlY3RlZE5vZGVzID0gZGF0YTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgIGJ1aWxkVHJlZVN0cnVjdHVyZSA9IGZ1bmN0aW9uICggY29udGFpbmVyLCBwYXJlbnRUcmVlTm9kZSApIHtcbiAgICAgICAgICAgIHZhciBrZXksXG4gICAgICAgICAgICAgICAgY2hpbGREYXRhLFxuICAgICAgICAgICAgICAgIHRyZWVOb2RlO1xuICAgICAgICAgICAgaWYgKCBwYXJlbnRUcmVlTm9kZSApIHtcbiAgICAgICAgICAgICAgICB0cmVlTm9kZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBleHRyYUluZm86IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5Db3VudDogMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcGFyZW50VHJlZU5vZGUuY2hpbGRyZW4ucHVzaCggdHJlZU5vZGUgKTtcbiAgICAgICAgICAgICAgICBwYXJlbnRUcmVlTm9kZS5jaGlsZHJlbkNvdW50ICs9IDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyZWVOb2RlID0gcm9vdE5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmVlTm9kZS5pZCA9IGNvbnRhaW5lci5pZDtcbiAgICAgICAgICAgIHRyZWVOb2RlLmxhYmVsID0gY29udGFpbmVyLm5hbWU7XG4gICAgICAgICAgICB0cmVlTm9kZS5leHRyYUluZm8gPSBjb250YWluZXIudHlwZTtcbiAgICAgICAgICAgICRzY29wZS5jb25maWcuc3RhdGUuZXhwYW5kZWROb2Rlcy5wdXNoKCB0cmVlTm9kZS5pZCApO1xuICAgICAgICAgICAgZm9yICgga2V5IGluIGNvbnRhaW5lci5jb21wb25lbnRzICkge1xuICAgICAgICAgICAgICAgIGlmICggY29udGFpbmVyLmNvbXBvbmVudHMuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZERhdGEgPSBjb250YWluZXIuY29tcG9uZW50c1sga2V5IF07XG4gICAgICAgICAgICAgICAgICAgIHRyZWVOb2RlLmNoaWxkcmVuLnB1c2goIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZERhdGEuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogY2hpbGREYXRhLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICB0cmVlTm9kZS5jaGlsZHJlbkNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmICggYXZtSWRzWyBjaGlsZERhdGEuYXZtSWQgXSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2bUlkc1sgY2hpbGREYXRhLmF2bUlkIF0ucHVzaCggY2hpbGREYXRhLmlkICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdm1JZHNbIGNoaWxkRGF0YS5hdm1JZCBdID0gWyBjaGlsZERhdGEuaWQgXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoIGtleSBpbiBjb250YWluZXIuc3ViQ29udGFpbmVycyApIHtcbiAgICAgICAgICAgICAgICBpZiAoIGNvbnRhaW5lci5zdWJDb250YWluZXJzLmhhc093blByb3BlcnR5KCBrZXkgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhID0gY29udGFpbmVyLnN1YkNvbnRhaW5lcnNbIGtleSBdO1xuICAgICAgICAgICAgICAgICAgICBidWlsZFRyZWVTdHJ1Y3R1cmUoIGNoaWxkRGF0YSwgdHJlZU5vZGUgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZGVzaWduU2VydmljZS5yZWdpc3RlcldhdGNoZXIoIGNvbnRleHQsIGZ1bmN0aW9uICggZGVzdHJveWVkICkge1xuICAgICAgICAgICAgaWYgKCBkZXN0cm95ZWQgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCAnZGVzdHJveSBldmVudCByYWlzZWQnICk7XG4gICAgICAgICAgICAgICAgLy8gRGF0YSBub3QgKHlldCkgYXZhbGlhYmxlLlxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGRpc3BsYXkgdGhpcyB0byB0aGUgdXNlci5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oICdpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcgKTtcblxuICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaERlc2lnblN0cnVjdHVyZSggY29udGV4dCwgJHNjb3BlLmRlc2lnbklkLCBmdW5jdGlvbiAoIHVwZGF0ZU9iamVjdCApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oIHVwZGF0ZU9iamVjdCApO1xuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvb3RDb250YWluZXIgPSBkYXRhLmNvbnRhaW5lcnNbIGRhdGEucm9vdElkIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNlcnRJbnB1dERhdGE7XG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkVHJlZVN0cnVjdHVyZSggcm9vdENvbnRhaW5lciApO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGVtaXQoICdkZXNpZ25UcmVlTG9hZGVkJywgYXZtSWRzICk7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBUaGlzIHBhcnQgaXMgb25seSBoZXJlIHRvIHJldXNlIHRoZSBkYXRhIGZyb20gd2F0Y2hEZXNpZ25TdHJ1Y3R1cmUuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IEZpbmQgYSBtb3JlIHN1aXRhYmxlIGxvY2F0aW9uLlxuICAgICAgICAgICAgICAgICAgICBkZXNlcnRJbnB1dERhdGEgPSBkZXNlcnRTZXJ2aWNlLmdldERlc2VydElucHV0RGF0YSggZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGVtaXQoICdkZXNlcnRJbnB1dFJlYWR5JywgZGVzZXJ0SW5wdXREYXRhICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG4gICAgfSApXG4gICAgLmRpcmVjdGl2ZSggJ2Rlc2lnblRyZWUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIGRlc2lnbklkOiAnPWRlc2lnbklkJyxcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9EZXNpZ25UcmVlLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rlc2lnblRyZWVDb250cm9sbGVyJ1xuICAgICAgICB9O1xuICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbi8qKlxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqL1xuXG5hbmd1bGFyLm1vZHVsZSggJ2N5cGh5LmNvbXBvbmVudHMnIClcbiAgICAuY29udHJvbGxlciggJ1NpbXBsZU1vZGFsQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgZGF0YSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBkYXRhLnRpdGxlLFxuICAgICAgICAgICAgZGV0YWlsczogZGF0YS5kZXRhaWxzXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9rID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcyggJ2NhbmNlbCcgKTtcbiAgICAgICAgfTtcbiAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xuXG4vKipcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoICdjeXBoeS5jb21wb25lbnRzJyApXG4gICAgLmNvbnRyb2xsZXIoICdUZXN0QmVuY2hEZXRhaWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlLCB0ZXN0QmVuY2hTZXJ2aWNlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBjb250ZXh0ID0ge30sXG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0ge30sXG4gICAgICAgICAgICBjb25uZWN0b3JzID0ge30sXG4gICAgICAgICAgICBwb3J0cyA9IHt9LFxuICAgICAgICAgICAgd2F0Y2hJbnRlcmZhY2VzO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCAnVGVzdEJlbmNoRGV0YWlsc0NvbnRyb2xsZXInICk7XG4gICAgICAgICRzY29wZS5pbml0ID0gZnVuY3Rpb24gKCBjb25uZWN0aW9uSWQgKSB7XG4gICAgICAgICAgICAkc2NvcGUuY29ubmVjdGlvbklkID0gY29ubmVjdGlvbklkO1xuICAgICAgICAgICAgaWYgKCAkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoICRzY29wZS5jb25uZWN0aW9uSWQgKSApIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogJHNjb3BlLmNvbm5lY3Rpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdUZXN0QmVuY2hEZXRhaWxzXycgKyAoIG5ldyBEYXRlKCkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICRzY29wZS4kb24oICckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdEZXN0cm95aW5nIDonLCBjb250ZXh0LnJlZ2lvbklkICk7XG4gICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoIGNvbnRleHQgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuZGV0YWlscyA9IHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IGNvbm5lY3RvcnMsXG4gICAgICAgICAgICAgICAgcG9ydHM6IHBvcnRzXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKCBjb250YWluZXJJZCApIHtcbiAgICAgICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLndhdGNoSW50ZXJmYWNlcyggY29udGV4dCwgY29udGFpbmVySWQsIGZ1bmN0aW9uICggdXBkYXRlT2JqZWN0ICkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSB3YXRjaEludGVyZmFjZXMga2VlcHMgdGhlIGRhdGEgdXAtdG8tZGF0ZSB0aGVyZSBzaG91bGRuJ3QgYmUgYSBuZWVkIHRvIGRvIGFueVxuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGVzIGhlcmUuLlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhdGNoSW50ZXJmYWNlcycsIHVwZGF0ZU9iamVjdCApO1xuICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBjb250YWluZXJJbnRlcmZhY2VzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMucHJvcGVydGllcyA9IGNvbnRhaW5lckludGVyZmFjZXMucHJvcGVydGllcztcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kZXRhaWxzLmNvbm5lY3RvcnMgPSBjb250YWluZXJJbnRlcmZhY2VzLmNvbm5lY3RvcnM7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGV0YWlscy5wb3J0cyA9IGNvbnRhaW5lckludGVyZmFjZXMucG9ydHM7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKCBjb250ZXh0LCBmdW5jdGlvbiAoIGRlc3Ryb3kgKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRldGFpbHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9LFxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0b3JzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgcG9ydHM6IHt9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAoIGRlc3Ryb3kgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vVE9ETzogbm90aWZ5IHVzZXJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oICdUZXN0QmVuY2hEZXRhaWxzQ29udHJvbGxlciAtIGluaXRpYWxpemUgZXZlbnQgcmFpc2VkJyApO1xuICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uud2F0Y2hUZXN0QmVuY2hEZXRhaWxzKCBjb250ZXh0LCAkc2NvcGUudGVzdEJlbmNoSWQsIGZ1bmN0aW9uICggdXBkYXRlZE9iaiApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCAnd2F0Y2hUZXN0QmVuY2hEZXRhaWxzIHVwZGF0ZXMnLCB1cGRhdGVkT2JqICk7XG4gICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGRhdGEuY29udGFpbmVySWRzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oICdObyBjb250YWluZXIgZGVmaW5lZCEnICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBkYXRhLmNvbnRhaW5lcklkcy5sZW5ndGggPT09IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hJbnRlcmZhY2VzKCBkYXRhLmNvbnRhaW5lcklkc1sgMCBdICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoICdNb3JlIHRoYW4gb25lIGNvbnRhaW5lciBkZWZpbmVkIScgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9O1xuICAgIH0gKVxuICAgIC5kaXJlY3RpdmUoICd0ZXN0QmVuY2hEZXRhaWxzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICB0ZXN0QmVuY2hJZDogJz10ZXN0QmVuY2hJZCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXF1aXJlOiAnXnRlc3RCZW5jaExpc3QnLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKCBzY29wZSwgZWxlbSwgYXR0ciwgdGVzdEJlbmNoTGlzdENvbnRyb2xsZXIgKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbm5lY3Rpb25JZCA9IHRlc3RCZW5jaExpc3RDb250cm9sbGVyLmdldENvbm5lY3Rpb25JZCgpO1xuICAgICAgICAgICAgICAgIHNjb3BlLmluaXQoIGNvbm5lY3Rpb25JZCApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9JbnRlcmZhY2VEZXRhaWxzLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Rlc3RCZW5jaERldGFpbHNDb250cm9sbGVyJ1xuICAgICAgICB9O1xuICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXG5cbi8qKlxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cbiAqL1xuXG5hbmd1bGFyLm1vZHVsZSggJ2N5cGh5LmNvbXBvbmVudHMnIClcbiAgICAuY29udHJvbGxlciggJ1Rlc3RCZW5jaExpc3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsICR3aW5kb3csICRsb2NhdGlvbiwgJG1vZGFsLCBncm93bCwgdGVzdEJlbmNoU2VydmljZSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXJcbiAgICAgICAgaXRlbXMgPSBbXSwgLy8gSXRlbXMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZSBpdGVtLWxpc3QgdWktY29tcG9uZW50LlxuICAgICAgICAgICAgdGVzdEJlbmNoSXRlbXMgPSB7fSwgLy8gU2FtZSBpdGVtcyBhcmUgc3RvcmVkIGluIGEgZGljdGlvbmFyeS5cbiAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtLFxuICAgICAgICAgICAgY29uZmlnLFxuICAgICAgICAgICAgY29udGV4dDtcblxuICAgICAgICBjb25zb2xlLmxvZyggJ1Rlc3RCZW5jaExpc3RDb250cm9sbGVyJyApO1xuXG4gICAgICAgIHRoaXMuZ2V0Q29ubmVjdGlvbklkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRzY29wZS5jb25uZWN0aW9uSWQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHZhbGlkIGNvbm5lY3Rpb25JZCBhbmQgcmVnaXN0ZXIgY2xlYW4tdXAgb24gZGVzdHJveSBldmVudC5cbiAgICAgICAgaWYgKCAkc2NvcGUuY29ubmVjdGlvbklkICYmIGFuZ3VsYXIuaXNTdHJpbmcoICRzY29wZS5jb25uZWN0aW9uSWQgKSApIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGI6ICRzY29wZS5jb25uZWN0aW9uSWQsXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdUZXN0QmVuY2hMaXN0Q29udHJvbGxlcl8nICsgKCBuZXcgRGF0ZSgpIClcbiAgICAgICAgICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAkc2NvcGUuJG9uKCAnJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGVzdEJlbmNoU2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyggY29udGV4dCApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnY29ubmVjdGlvbklkIG11c3QgYmUgZGVmaW5lZCBhbmQgaXQgbXVzdCBiZSBhIHN0cmluZycgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBpdGVtIGxpc3QgdWkgY29tcG9uZW50LlxuICAgICAgICBjb25maWcgPSB7XG5cbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXG4gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcblxuICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcblxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uICggalFFdmVudCwgdWkgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkgKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKCBldmVudCwgaXRlbSApIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3VXJsID0gJy90ZXN0QmVuY2gvJyArICRzY29wZS53b3Jrc3BhY2VJZC5yZXBsYWNlKCAvXFwvL2csICctJyApICsgJy8nICsgaXRlbS5pZC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvXFwvL2csICctJyApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBuZXdVcmwgKTtcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCggbmV3VXJsICk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBpdGVtQ29udGV4dG1lbnVSZW5kZXJlcjogZnVuY3Rpb24gKCBlLCBpdGVtICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFsge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdvcGVuSW5FZGl0b3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPcGVuIGluIEVkaXRvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLWVkaXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5vcGVuKCAnLz9wcm9qZWN0PUFETUVkaXRvciZhY3RpdmVPYmplY3Q9JyArIGl0ZW0uaWQsICdfYmxhbmsnICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZWRpdFRlc3RCZW5jaCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0VkaXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wZW5jaWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBpdGVtLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IGl0ZW0uZGF0YS5maWxlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBpdGVtLmRhdGEucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0Q29udGV4dDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYjogY29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoVGVzdEJlbmNoZXMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2g6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHRlc3RCZW5jaFNlcnZpY2UuZWRpdFRlc3RCZW5jaEZuXG4gICAgICAgICAgICAgICAgICAgIH0gXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFsge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdkZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uRGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udGl0bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogdGVzdEJlbmNoU2VydmljZS5kZWxldGVGblxuICAgICAgICAgICAgICAgICAgICB9IF1cbiAgICAgICAgICAgICAgICB9IF07XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBkZXRhaWxzUmVuZGVyZXI6IGZ1bmN0aW9uICggLyppdGVtKi8pIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBpdGVtLmRldGFpbHMgPSAnTXkgZGV0YWlscyBhcmUgaGVyZSBub3chJztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGZpbHRlcjoge31cblxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XG4gICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFRyYW5zZm9ybSB0aGUgcmF3IHNlcnZpY2Ugbm9kZSBkYXRhIHRvIGl0ZW1zIGZvciB0aGUgbGlzdC5cbiAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0gPSBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICB2YXIgbGlzdEl0ZW07XG5cbiAgICAgICAgICAgIGlmICggdGVzdEJlbmNoSXRlbXMuaGFzT3duUHJvcGVydHkoIGRhdGEuaWQgKSApIHtcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IHRlc3RCZW5jaEl0ZW1zWyBkYXRhLmlkIF07XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0udGl0bGUgPSBkYXRhLm5hbWU7XG4gICAgICAgICAgICAgICAgbGlzdEl0ZW0uZGVzY3JpcHRpb24gPSBkYXRhLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRhdGEuZmlsZXMgPSBkYXRhLmZpbGVzO1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmRhdGEucGF0aCA9IGRhdGEucGF0aDtcbiAgICAgICAgICAgICAgICBsaXN0SXRlbS5kYXRhLnJlc3VsdHMgPSBkYXRhLnJlc3VsdHM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogZGF0YS5pZCxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ09wZW4gVGVzdC1CZW5jaCBWaWV3JyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVcGRhdGVkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiAnTi9BJywgLy8gVE9ETzogZ2V0IHRoaXMgaW4gdGhlIGZ1dHVyZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdOL0EnIC8vIFRPRE86IGdldCB0aGlzIGluIHRoZSBmdXR1cmUuXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogJ0NvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzVGVtcGxhdGVVcmw6ICd0ZXN0QmVuY2hEZXRhaWxzLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogZGF0YS5maWxlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGRhdGEucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IGRhdGEucmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIGxpc3QtaXRlbSB0byB0aGUgaXRlbXMgbGlzdCBhbmQgdGhlIGRpY3Rpb25hcnkuXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCggbGlzdEl0ZW0gKTtcbiAgICAgICAgICAgICAgICB0ZXN0QmVuY2hJdGVtc1sgbGlzdEl0ZW0uaWQgXSA9IGxpc3RJdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRlc3RCZW5jaFNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyKCBjb250ZXh0LCBmdW5jdGlvbiAoIGRlc3Ryb3llZCApIHtcbiAgICAgICAgICAgIGl0ZW1zID0gW107XG4gICAgICAgICAgICAkc2NvcGUubGlzdERhdGEuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgICAgIHRlc3RCZW5jaEl0ZW1zID0ge307XG5cbiAgICAgICAgICAgIGlmICggZGVzdHJveWVkICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybiggJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyApO1xuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCAnaW5pdGlhbGl6ZSBldmVudCByYWlzZWQnICk7XG5cbiAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uud2F0Y2hUZXN0QmVuY2hlcyggY29udGV4dCwgJHNjb3BlLndvcmtzcGFjZUlkLCBmdW5jdGlvbiAoIHVwZGF0ZU9iamVjdCApIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXg7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLndhcm4odXBkYXRlT2JqZWN0KTtcbiAgICAgICAgICAgICAgICBpZiAoIHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKCB1cGRhdGVPYmplY3QuZGF0YSApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJyApIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0oIHVwZGF0ZU9iamVjdC5kYXRhICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdXBkYXRlT2JqZWN0LnR5cGUgPT09ICd1bmxvYWQnICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHRlc3RCZW5jaEl0ZW1zLmhhc093blByb3BlcnR5KCB1cGRhdGVPYmplY3QuaWQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaXRlbXMubWFwKCBmdW5jdGlvbiAoIGUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5kZXhPZiggdXBkYXRlT2JqZWN0LmlkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGluZGV4ID4gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMuc3BsaWNlKCBpbmRleCwgMSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRlc3RCZW5jaEl0ZW1zWyB1cGRhdGVPYmplY3QuaWQgXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggdXBkYXRlT2JqZWN0ICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlc3RCZW5jaElkO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKCB0ZXN0QmVuY2hJZCBpbiBkYXRhLnRlc3RCZW5jaGVzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBkYXRhLnRlc3RCZW5jaGVzLmhhc093blByb3BlcnR5KCB0ZXN0QmVuY2hJZCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKCBkYXRhLnRlc3RCZW5jaGVzWyB0ZXN0QmVuY2hJZCBdICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgIH0gKTtcbiAgICB9IClcbiAgICAuY29udHJvbGxlciggJ1Rlc3RCZW5jaEVkaXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsICRtb2RhbEluc3RhbmNlLCBncm93bCwgZGF0YSwgZmlsZVNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGZpbGVJbmZvO1xuICAgICAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgbmFtZTogZGF0YS5uYW1lLFxuICAgICAgICAgICAgZmlsZUluZm86IHtcbiAgICAgICAgICAgICAgICBoYXNoOiBkYXRhLmZpbGVzLFxuICAgICAgICAgICAgICAgIG5hbWU6IG51bGwsXG4gICAgICAgICAgICAgICAgdXJsOiBmaWxlU2VydmljZS5nZXREb3dubG9hZFVybCggZGF0YS5maWxlcyApXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogZGF0YS5wYXRoXG4gICAgICAgIH07XG4gICAgICAgIGZpbGVJbmZvID0gJHNjb3BlLmRhdGEuZmlsZUluZm87XG4gICAgICAgIGlmICggZmlsZUluZm8uaGFzaCApIHtcbiAgICAgICAgICAgIGZpbGVTZXJ2aWNlLmdldE1ldGFkYXRhKCBmaWxlSW5mby5oYXNoIClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBtZXRhZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8ubmFtZSA9IG1ldGFkYXRhLm5hbWU7XG4gICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgY2F0Y2ggKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvciggJ0NvdWxkIG5vdCBnZXQgbWV0YS1kYXRhIGZvciBoYXNoJywgZmlsZUluZm8uaGFzaCApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLmRyYWdPdmVyQ2xhc3MgPSBmdW5jdGlvbiAoICRldmVudCApIHtcbiAgICAgICAgICAgIHZhciBkcmFnZ2VkSXRlbXMgPSAkZXZlbnQuZGF0YVRyYW5zZmVyLml0ZW1zLFxuICAgICAgICAgICAgICAgIGhhc0ZpbGU7XG4gICAgICAgICAgICAvL2NvbnNvbGUud2FybihkcmFnZ2VkSXRlbXMpO1xuICAgICAgICAgICAgaGFzRmlsZSA9IGRyYWdnZWRJdGVtcyAmJiBkcmFnZ2VkSXRlbXMubGVuZ3RoID09PSAxICYmIGRyYWdnZWRJdGVtc1sgMCBdLmtpbmQgPT09ICdmaWxlJztcblxuICAgICAgICAgICAgcmV0dXJuIGhhc0ZpbGUgPyAnYmctc3VjY2VzcyBkcmFnb3ZlcicgOiAnYmctZGFuZ2VyIGRyYWdvdmVyJztcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUub25Ecm9wcGVkRmlsZXMgPSBmdW5jdGlvbiAoICRmaWxlcyApIHtcbiAgICAgICAgICAgIGZpbGVTZXJ2aWNlLnNhdmVEcm9wcGVkRmlsZXMoICRmaWxlcywge1xuICAgICAgICAgICAgICAgIHppcDogdHJ1ZVxuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZkluZm9zICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGZJbmZvcy5sZW5ndGggIT09IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncm93bC5lcnJvciggJ09uZSB6aXAgZmlsZSBtdXN0IGJlIGRyb3BwZWQhJyApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8ubmFtZSA9IGZJbmZvc1sgMCBdLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlSW5mby51cmwgPSBmSW5mb3NbIDAgXS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUluZm8uaGFzaCA9IGZJbmZvc1sgMCBdLmhhc2g7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm9rID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoICRzY29wZS5kYXRhICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoICdjYW5jZWwnICk7XG4gICAgICAgIH07XG4gICAgfSApXG4gICAgLmRpcmVjdGl2ZSggJ3Rlc3RCZW5jaExpc3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUlkOiAnPXdvcmtzcGFjZUlkJyxcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uSWQ6ICc9Y29ubmVjdGlvbklkJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9UZXN0QmVuY2hMaXN0Lmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Rlc3RCZW5jaExpc3RDb250cm9sbGVyJ1xuICAgICAgICB9O1xuICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXG5cbi8qKlxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqL1xuXG5hbmd1bGFyLm1vZHVsZSggJ2N5cGh5LmNvbXBvbmVudHMnIClcbiAgICAuY29udHJvbGxlciggJ1dvcmtlcnNMaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uICggJHNjb3BlLCAkaW50ZXJ2YWwsIGdyb3dsLCBleGVjdXRvclNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIGludGVydmFsUHJvbWlzZSA9IG51bGwsXG4gICAgICAgICAgICBjb25zZWN1dGl2ZUVycm9ycyA9IDAsXG4gICAgICAgICAgICBtYXhDb25zZWN1dGl2ZUVycm9ycyA9IDMwO1xuICAgICAgICAkc2NvcGUuZGF0YU1vZGVsID0ge1xuICAgICAgICAgICAgd29ya2VyczogbnVsbFxuICAgICAgICB9O1xuICAgICAgICAkc2NvcGUuJG9uKCAnJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIGludGVydmFsUHJvbWlzZSAmJiAkaW50ZXJ2YWwuY2FuY2VsKCBpbnRlcnZhbFByb21pc2UgKSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ1dvcmtlcnMgaW50ZXJ2YWwgY2FuY2VsbGVkJyApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCAnQ291bGQgbm90IGNhbmNlbCBXb3JrZXJzSW50ZXJ2YWwuJyApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIGludGVydmFsUHJvbWlzZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgaW50ZXJ2YWxQcm9taXNlID0gJGludGVydmFsKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBleGVjdXRvclNlcnZpY2UuZ2V0V29ya2Vyc0luZm8oKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIHJlc3BvbmNlICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zZWN1dGl2ZUVycm9ycyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhTW9kZWwud29ya2VycyA9IHJlc3BvbmNlO1xuICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvciggZXJyICk7XG4gICAgICAgICAgICAgICAgY29uc2VjdXRpdmVFcnJvcnMgKz0gMTtcbiAgICAgICAgICAgICAgICBpZiAoIGNvbnNlY3V0aXZlRXJyb3JzID49IG1heENvbnNlY3V0aXZlRXJyb3JzICkge1xuICAgICAgICAgICAgICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKCBpbnRlcnZhbFByb21pc2UgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoICdXb3JrZXJzIGRpZCBub3QgcmVzcG9uZCBhZnRlciAnICsgbWF4Q29uc2VjdXRpdmVFcnJvcnMgKyAnIHJlcXVlc3RzLicgKTtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWxQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH0sIDEwMDAgKTtcbiAgICB9IClcbiAgICAuZGlyZWN0aXZlKCAnd29ya2Vyc0xpc3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICBzY29wZToge30sXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3lwaHktY29tcG9uZW50cy90ZW1wbGF0ZXMvV29ya2Vyc0xpc3QuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnV29ya2Vyc0xpc3RDb250cm9sbGVyJ1xuICAgICAgICB9O1xuICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXG5cbi8qKlxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cbiAqL1xuXG5hbmd1bGFyLm1vZHVsZSggJ2N5cGh5LmNvbXBvbmVudHMnIClcbiAgICAuY29udHJvbGxlciggJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyJywgZnVuY3Rpb24gKCAkc2NvcGUsICR3aW5kb3csICRsb2NhdGlvbiwgJG1vZGFsLCBncm93bCwgd29ya3NwYWNlU2VydmljZSxcbiAgICAgICAgZmlsZVNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyXG4gICAgICAgIGl0ZW1zID0gW10sXG4gICAgICAgICAgICB3b3Jrc3BhY2VJdGVtcyA9IHt9LFxuICAgICAgICAgICAgY29uZmlnLFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtLFxuICAgICAgICAgICAgYWRkQ291bnRXYXRjaGVycztcblxuICAgICAgICBjb25zb2xlLmxvZyggJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyJyApO1xuXG4gICAgICAgIGlmICggJHNjb3BlLmNvbm5lY3Rpb25JZCAmJiBhbmd1bGFyLmlzU3RyaW5nKCAkc2NvcGUuY29ubmVjdGlvbklkICkgKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIGRiOiAkc2NvcGUuY29ubmVjdGlvbklkLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnV29ya3NwYWNlTGlzdENvbnRyb2xsZXJfJyArICggbmV3IERhdGUoKSApXG4gICAgICAgICAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJHNjb3BlLiRvbiggJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoIGNvbnRleHQgKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ2Nvbm5lY3Rpb25JZCBtdXN0IGJlIGRlZmluZWQgYW5kIGl0IG11c3QgYmUgYSBzdHJpbmcnICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcgPSB7XG5cbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHNlY29uZGFyeUl0ZW1NZW51OiB0cnVlLFxuICAgICAgICAgICAgZGV0YWlsc0NvbGxhcHNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0RldGFpbHNMYWJlbDogJ1Nob3cgZGV0YWlscycsXG4gICAgICAgICAgICBoaWRlRGV0YWlsc0xhYmVsOiAnSGlkZSBkZXRhaWxzJyxcblxuICAgICAgICAgICAgLy8gRXZlbnQgaGFuZGxlcnNcblxuICAgICAgICAgICAgaXRlbVNvcnQ6IGZ1bmN0aW9uICggalFFdmVudCwgdWkgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdTb3J0IGhhcHBlbmVkJywgalFFdmVudCwgdWkgKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGl0ZW1DbGljazogZnVuY3Rpb24gKCBldmVudCwgaXRlbSApIHtcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCggJy93b3Jrc3BhY2VEZXRhaWxzLycgKyBpdGVtLmlkLnJlcGxhY2UoIC9cXC8vZywgJy0nICkgKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGl0ZW1Db250ZXh0bWVudVJlbmRlcmVyOiBmdW5jdGlvbiAoIGUsIGl0ZW0gKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFsge1xuICAgICAgICAgICAgICAgICAgICBpdGVtczogWyB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ29wZW5JbkVkaXRvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ09wZW4gaW4gRWRpdG9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tZWRpdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93Lm9wZW4oICcvP3Byb2plY3Q9QURNRWRpdG9yJmFjdGl2ZU9iamVjdD0nICsgaXRlbS5pZCwgJ19ibGFuaycgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdlZGl0V29ya3NwYWNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRWRpdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25EYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGl0ZW0uZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS50aXRsZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlZGl0Q29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGI6IGNvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiBjb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaFdvcmtzcGFjZXMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZSA9ICRtb2RhbC5vcGVuKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Xb3Jrc3BhY2VFZGl0Lmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtzcGFjZUVkaXRDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbiggZnVuY3Rpb24gKCBlZGl0ZWREYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXR0cnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbmFtZSc6IGVkaXRlZERhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJTkZPJzogZWRpdGVkRGF0YS5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLnNldFdvcmtzcGFjZUF0dHJpYnV0ZXMoIGVkaXRDb250ZXh0LCBkYXRhLmlkLCBhdHRycyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnQXR0cmlidXRlIHVwZGF0ZWQnICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZXhwb3J0QXNYTUUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeHBvcnQgYXMgWE1FJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2hhcmUtYWx0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5leHBvcnRXb3Jrc3BhY2UoIGNvbnRleHQsIGRhdGEuaWQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkb3dubG9hZFVybCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoICdXb3Jrc3BhY2UgcGFja2FnZSBmb3IgPGEgaHJlZj1cIicgKyBkb3dubG9hZFVybCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubmFtZSArICc8L2E+IGV4cG9ydGVkLicgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoIGZ1bmN0aW9uICggcmVhc29uICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCByZWFzb24gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuZXJyb3IoICdFeHBvcnQgZmFpbGVkLCBzZWUgY29uc29sZSBmb3IgZGV0YWlscy4nICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IF1cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZGVsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGVsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbkRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLnRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9TaW1wbGVNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NpbXBsZU1vZGFsQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZSBXb3Jrc3BhY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiAnVGhpcyB3aWxsIGRlbGV0ZSAnICsgZGF0YS5uYW1lICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgZnJvbSB0aGUgcHJvamVjdC4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5kZWxldGVXb3Jrc3BhY2UoIGNvbnRleHQsIGRhdGEuaWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICAgICAgfSBdO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZGV0YWlsc1JlbmRlcmVyOiBmdW5jdGlvbiAoIC8qaXRlbSovKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgaXRlbS5kZXRhaWxzID0gJ015IGRldGFpbHMgYXJlIGhlcmUgbm93ISc7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBuZXdJdGVtRm9ybToge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ3JlYXRlIG5ldyB3b3Jrc3BhY2UnLFxuICAgICAgICAgICAgICAgIGl0ZW1UZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Xb3Jrc3BhY2VOZXdJdGVtLmh0bWwnLFxuICAgICAgICAgICAgICAgIGV4cGFuZGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoICRzY29wZSApIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJvcHBlZEZpbGVzOiBbXVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ092ZXJDbGFzcyA9IGZ1bmN0aW9uICggJGV2ZW50ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRyYWdnZWRJdGVtcyA9ICRldmVudC5kYXRhVHJhbnNmZXIuaXRlbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGaWxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihkcmFnZ2VkSXRlbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBkcmFnZ2VkSXRlbXMgPT09IG51bGwgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRmlsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGRyYWdnZWRJdGVtcy5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBkcmFnZ2VkSXRlbXNbIGkgXS5raW5kID09PSAnZmlsZScgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGaWxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGFzRmlsZSA/ICdiZy1zdWNjZXNzIGRyYWdvdmVyJyA6ICdiZy1kYW5nZXIgZHJhZ292ZXInO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5vbkRyb3BwZWRGaWxlcyA9IGZ1bmN0aW9uICggJGZpbGVzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVNlcnZpY2Uuc2F2ZURyb3BwZWRGaWxlcyggJGZpbGVzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgemlwOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkbTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdG06IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGZJbmZvcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBmSW5mb3MgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBmSW5mb3MubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubW9kZWwuZHJvcHBlZEZpbGVzLnB1c2goIGZJbmZvc1sgaSBdICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNyZWF0ZUl0ZW0gPSBmdW5jdGlvbiAoIG5ld0l0ZW0gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3SXRlbUNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGI6IGNvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IGNvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoV29ya3NwYWNlcydcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoICFuZXdJdGVtIHx8ICFuZXdJdGVtLm5hbWUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wud2FybmluZyggJ1Byb3ZpZGUgYSBuYW1lJyApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuY3JlYXRlV29ya3NwYWNlKCBuZXdJdGVtQ29udGV4dCwgbmV3SXRlbS5uYW1lLCBuZXdJdGVtLmRlc2NyaXB0aW9uIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBmb2xkZXJJZHMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLnN1Y2Nlc3MoIG5ld0l0ZW0ubmFtZSArICcgY3JlYXRlZC4nICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggJHNjb3BlLm1vZGVsLmRyb3BwZWRGaWxlcy5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuaW5mbyggJ0ltcG9ydGluZyBmaWxlcy4uJyApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5pbXBvcnRGaWxlcyggbmV3SXRlbUNvbnRleHQsIGZvbGRlcklkcywgJHNjb3BlLm1vZGVsLmRyb3BwZWRGaWxlcyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuaW5mbyggJ0ZpbmlzaGVkIGltcG9ydGluZyBmaWxlcyEnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dGw6IDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCByZWFzb24gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsLmVycm9yKCByZWFzb24gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoIGluZm8gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3dsWyBpbmZvLnR5cGUgXSggaW5mby5tZXNzYWdlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxseSggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5uZXdJdGVtRm9ybS5leHBhbmRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tb2RlbC5kcm9wcGVkRmlsZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5uZXdJdGVtRm9ybS5leHBhbmRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1vZGVsLmRyb3BwZWRGaWxlcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGZpbHRlcjoge31cblxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5saXN0RGF0YSA9IHtcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jb25maWcgPSBjb25maWc7XG5cbiAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0gPSBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICB2YXIgd29ya3NwYWNlSXRlbTtcblxuICAgICAgICAgICAgaWYgKCB3b3Jrc3BhY2VJdGVtcy5oYXNPd25Qcm9wZXJ0eSggZGF0YS5pZCApICkge1xuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0gPSB3b3Jrc3BhY2VJdGVtc1sgZGF0YS5pZCBdO1xuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0udGl0bGUgPSBkYXRhLm5hbWU7XG4gICAgICAgICAgICAgICAgd29ya3NwYWNlSXRlbS5kZXNjcmlwdGlvbiA9IGRhdGEuZGVzY3JpcHRpb247XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnT3BlbiBXb3Jrc3BhY2UnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IG5ldyBEYXRlKCksIC8vIFRPRE86IGdldCB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiAnTi9BJyAvLyBUT0RPOiBnZXQgdGhpc1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdGF0czogWyB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xUaXA6ICdDb21wb25lbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2ZhIGZhLXB1enpsZS1waWVjZSdcbiAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnRGVzaWduIFNwYWNlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1jdWJlcydcbiAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sVGlwOiAnVGVzdCBiZW5jaGVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzczogJ2dseXBoaWNvbiBnbHlwaGljb24tc2F2ZWQnXG4gICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcDogJ1JlcXVpcmVtZW50cycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3M6ICdmYSBmYS1iYXItY2hhcnQtbydcbiAgICAgICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW1zWyB3b3Jrc3BhY2VJdGVtLmlkIF0gPSB3b3Jrc3BhY2VJdGVtO1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goIHdvcmtzcGFjZUl0ZW0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBhZGRDb3VudFdhdGNoZXJzID0gZnVuY3Rpb24gKCB3b3Jrc3BhY2VJZCApIHtcbiAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hOdW1iZXJPZkNvbXBvbmVudHMoIGNvbnRleHQsIHdvcmtzcGFjZUlkLCBmdW5jdGlvbiAoIHVwZGF0ZURhdGEgKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdvcmtzcGFjZURhdGEgPSB3b3Jrc3BhY2VJdGVtc1sgd29ya3NwYWNlSWQgXTtcbiAgICAgICAgICAgICAgICBpZiAoIHdvcmtzcGFjZURhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbIDAgXS52YWx1ZSA9IHVwZGF0ZURhdGEuZGF0YTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zWyB3b3Jrc3BhY2VJZCBdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHdvcmtzcGFjZURhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VEYXRhLnN0YXRzWyAwIF0udmFsdWUgPSBkYXRhLmNvdW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mRGVzaWducyggY29udGV4dCwgd29ya3NwYWNlSWQsIGZ1bmN0aW9uICggdXBkYXRlRGF0YSApIHtcbiAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zWyB3b3Jrc3BhY2VJZCBdO1xuICAgICAgICAgICAgICAgIGlmICggd29ya3NwYWNlRGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1sgMSBdLnZhbHVlID0gdXBkYXRlRGF0YS5kYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbIHdvcmtzcGFjZUlkIF07XG4gICAgICAgICAgICAgICAgICAgIGlmICggd29ya3NwYWNlRGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbIDEgXS52YWx1ZSA9IGRhdGEuY291bnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlcyggY29udGV4dCwgd29ya3NwYWNlSWQsIGZ1bmN0aW9uICggdXBkYXRlRGF0YSApIHtcbiAgICAgICAgICAgICAgICB2YXIgd29ya3NwYWNlRGF0YSA9IHdvcmtzcGFjZUl0ZW1zWyB3b3Jrc3BhY2VJZCBdO1xuICAgICAgICAgICAgICAgIGlmICggd29ya3NwYWNlRGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlRGF0YS5zdGF0c1sgMiBdLnZhbHVlID0gdXBkYXRlRGF0YS5kYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VEYXRhID0gd29ya3NwYWNlSXRlbXNbIHdvcmtzcGFjZUlkIF07XG4gICAgICAgICAgICAgICAgICAgIGlmICggd29ya3NwYWNlRGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZURhdGEuc3RhdHNbIDIgXS52YWx1ZSA9IGRhdGEuY291bnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgd29ya3NwYWNlU2VydmljZS5yZWdpc3RlcldhdGNoZXIoIGNvbnRleHQsIGZ1bmN0aW9uICggZGVzdHJveWVkICkge1xuICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSBhbGwgdmFyaWFibGVzXG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xuICAgICAgICAgICAgJHNjb3BlLmxpc3REYXRhID0ge1xuICAgICAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdvcmtzcGFjZUl0ZW1zID0ge307XG5cbiAgICAgICAgICAgIGlmICggZGVzdHJveWVkICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyggJ2Rlc3Ryb3kgZXZlbnQgcmFpc2VkJyApO1xuICAgICAgICAgICAgICAgIC8vIERhdGEgbm90ICh5ZXQpIGF2YWxpYWJsZS5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNwbGF5IHRoaXMgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKCAnV29ya3NwYWNlTGlzdENvbnRyb2xsZXIgLSBpbml0aWFsaXplIGV2ZW50IHJhaXNlZCcgKTtcbiAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hXb3Jrc3BhY2VzKCBjb250ZXh0LCBmdW5jdGlvbiAoIHVwZGF0ZU9iamVjdCApIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXg7XG5cbiAgICAgICAgICAgICAgICBpZiAoIHVwZGF0ZU9iamVjdC50eXBlID09PSAnbG9hZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VEYXRhMkxpc3RJdGVtKCB1cGRhdGVPYmplY3QuZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICBhZGRDb3VudFdhdGNoZXJzKCB1cGRhdGVPYmplY3QuaWQgKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIHVwZGF0ZU9iamVjdC50eXBlID09PSAndXBkYXRlJyApIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZURhdGEyTGlzdEl0ZW0oIHVwZGF0ZU9iamVjdC5kYXRhICk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCB1cGRhdGVPYmplY3QudHlwZSA9PT0gJ3VubG9hZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggd29ya3NwYWNlSXRlbXMuaGFzT3duUHJvcGVydHkoIHVwZGF0ZU9iamVjdC5pZCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpdGVtcy5tYXAoIGZ1bmN0aW9uICggZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5pbmRleE9mKCB1cGRhdGVPYmplY3QuaWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggaW5kZXggPiAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UoIGluZGV4LCAxICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLmNsZWFuVXBSZWdpb24oIGNvbnRleHQsIGNvbnRleHQucmVnaW9uSWQgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdfd2F0Y2hOdW1iZXJPZkNvbXBvbmVudHNfJyArIHVwZGF0ZU9iamVjdC5pZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS5jbGVhblVwUmVnaW9uKCBjb250ZXh0LCBjb250ZXh0LnJlZ2lvbklkICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnX3dhdGNoTnVtYmVyT2ZEZXNpZ25zXycgKyB1cGRhdGVPYmplY3QuaWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbiggY29udGV4dCwgY29udGV4dC5yZWdpb25JZCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ193YXRjaE51bWJlck9mVGVzdEJlbmNoZXNfJyArIHVwZGF0ZU9iamVjdC5pZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdvcmtzcGFjZUl0ZW1zWyB1cGRhdGVPYmplY3QuaWQgXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCB1cGRhdGVPYmplY3QgKTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3b3Jrc3BhY2VJZDtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKCB3b3Jrc3BhY2VJZCBpbiBkYXRhLndvcmtzcGFjZXMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGRhdGEud29ya3NwYWNlcy5oYXNPd25Qcm9wZXJ0eSggd29ya3NwYWNlSWQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRGF0YTJMaXN0SXRlbSggZGF0YS53b3Jrc3BhY2VzWyB3b3Jrc3BhY2VJZCBdICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkQ291bnRXYXRjaGVycyggd29ya3NwYWNlSWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApO1xuICAgIH0gKVxuICAgIC5jb250cm9sbGVyKCAnV29ya3NwYWNlRWRpdENvbnRyb2xsZXInLCBmdW5jdGlvbiAoICRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIGRhdGEgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YS5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIG5hbWU6IGRhdGEubmFtZVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5vayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCAkc2NvcGUuZGF0YSApO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCAnY2FuY2VsJyApO1xuICAgICAgICB9O1xuICAgIH0gKVxuICAgIC5kaXJlY3RpdmUoICd3b3Jrc3BhY2VMaXN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbklkOiAnPWNvbm5lY3Rpb25JZCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9Xb3Jrc3BhY2VMaXN0Lmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1dvcmtzcGFjZUxpc3RDb250cm9sbGVyJ1xuICAgICAgICB9O1xuICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciovXG5cbmFuZ3VsYXIubW9kdWxlKCdjeXBoeS5jb21wb25lbnRzJylcbiAgLmNvbnRyb2xsZXIoJ0NvbXBvbmVudEJyb3dzZXJDb250cm9sbGVyJywgZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgfSlcbiAgLmRpcmVjdGl2ZSgnY29tcG9uZW50QnJvd3NlcicsIGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICBzY29wZToge1xuICAgICAgICB3b3Jrc3BhY2VJZDogJz13b3Jrc3BhY2VJZCcsXG4gICAgICAgIGNvbm5lY3Rpb25JZDogJz1jb25uZWN0aW9uSWQnLFxuICAgICAgICBhdm1JZHM6ICc9YXZtSWRzJ1xuICAgICAgfSxcbiAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9jb21wb25lbnRCcm93c2VyLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0NvbXBvbmVudEJyb3dzZXJDb250cm9sbGVyJ1xuICAgIH07XG4gIH0pO1xuIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xuXG4vKipcbiAqIFRoaXMgc2VydmljZSBjb250YWlucyBmdW5jdGlvbmFsaXR5IHNoYXJlZCBhbW9uZ3N0IHRoZSBkaWZmZXJlbnQgc2VydmljZXMuIEl0IHNob3VsZCBub3QgYmUgdXNlZFxuICogZGlyZWN0bHkgaW4gYSBjb250cm9sbGVyIC0gb25seSBhcyBwYXJ0IG9mIG90aGVyIHNlcnZpY2VzLlxuICpcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cblxuXG5hbmd1bGFyLm1vZHVsZSggJ2N5cGh5LnNlcnZpY2VzJyApXG4gICAgLnNlcnZpY2UoICdiYXNlQ3lQaHlTZXJ2aWNlJywgZnVuY3Rpb24gKCAkcSwgJHRpbWVvdXQsIG5vZGVTZXJ2aWNlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlZ2lzdGVycyBhIHdhdGNoZXIgKGNvbnRyb2xsZXIpIHRvIHRoZSBzZXJ2aWNlLiBDYWxsYmFjayBmdW5jdGlvbiBpcyBjYWxsZWQgd2hlbiBub2RlcyBiZWNvbWUgYXZhaWxhYmxlIG9yXG4gICAgICAgICAqIHdoZW4gdGhleSBiZWNhbWUgdW5hdmFpbGFibGUuIFRoZXNlIGFyZSBhbHNvIGNhbGxlZCBkaXJlY3RseSB3aXRoIHRoZSBzdGF0ZSBvZiB0aGUgbm9kZVNlcnZpY2UuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3YXRjaGVycyAtIFdhdGNoZXJzIGZyb20gdGhlIHNlcnZpY2UgdXRpbGl6aW5nIHRoaXMgZnVuY3Rpb24uXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiAtIENhbGxlZCB3aXRoIHRydWUgd2hlbiB0aGVyZSBhcmUgbm8gbm9kZXMgdW5hdmFpbGFibGUgYW5kIGZhbHNlIHdoZW4gdGhlcmUgYXJlLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoZXIgPSBmdW5jdGlvbiAoIHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBmbiApIHtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLm9uKCBwYXJlbnRDb250ZXh0LmRiLCAnaW5pdGlhbGl6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBiZSBlbm91Z2gsIHRoZSByZWdpb25zIHdpbGwgYmUgY2xlYW5lZCB1cCBpbiBub2RlU2VydmljZS5cbiAgICAgICAgICAgICAgICB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdID0ge307XG4gICAgICAgICAgICAgICAgZm4oIGZhbHNlICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICBub2RlU2VydmljZS5vbiggcGFyZW50Q29udGV4dC5kYiwgJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgYmUgZW5vdWdoLCB0aGUgcmVnaW9ucyBzaG91bGQgYmUgY2xlYW5lZCB1cCBpbiBub2RlU2VydmljZS5cbiAgICAgICAgICAgICAgICBpZiAoIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF0gKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmbiggdHJ1ZSApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVzIGFsbCB3YXRjaGVycyBzcGF3bmVkIGZyb20gcGFyZW50Q29udGV4dCwgdGhpcyBzaG91bGQgdHlwaWNhbGx5IGJlIGludm9rZWQgd2hlbiB0aGUgY29udHJvbGxlciBpcyBkZXN0cm95ZWQuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3YXRjaGVycyAtIFdhdGNoZXJzIGZyb20gdGhlIHNlcnZpY2UgdXRpbGl6aW5nIHRoaXMgZnVuY3Rpb24uXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50Q29udGV4dC5yZWdpb25JZCAtIFJlZ2lvbiBvZiB0aGUgY29udHJvbGxlciAoYWxsIHNwYXduZWQgcmVnaW9ucyBhcmUgZ3JvdXBlZCBieSB0aGlzKS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xlYW5VcEFsbFJlZ2lvbnMgPSBmdW5jdGlvbiAoIHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0ICkge1xuICAgICAgICAgICAgdmFyIGNoaWxkV2F0Y2hlcnMsXG4gICAgICAgICAgICAgICAga2V5O1xuICAgICAgICAgICAgaWYgKCB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdICkge1xuICAgICAgICAgICAgICAgIGNoaWxkV2F0Y2hlcnMgPSB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdO1xuICAgICAgICAgICAgICAgIGZvciAoIGtleSBpbiBjaGlsZFdhdGNoZXJzICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGNoaWxkV2F0Y2hlcnMuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UuY2xlYW5VcFJlZ2lvbiggY2hpbGRXYXRjaGVyc1sga2V5IF0uZGIsIGNoaWxkV2F0Y2hlcnNbIGtleSBdLnJlZ2lvbklkICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVsZXRlIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnTm90aGluZyB0byBjbGVhbi11cC4uJyApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVzIHNwZWNpZmllZCB3YXRjaGVyIChyZWdpb25JZClcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdhdGNoZXJzIC0gV2F0Y2hlcnMgZnJvbSB0aGUgc2VydmljZSB1dGlsaXppbmcgdGhpcyBmdW5jdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LmRiIC0gRGF0YWJhc2UgY29ubmVjdGlvbiBvZiBib3RoIHBhcmVudCBhbmQgcmVnaW9uIHRvIGJlIGRlbGV0ZWQuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIC0gUmVnaW9uIG9mIHRoZSBjb250cm9sbGVyIChhbGwgc3Bhd25lZCByZWdpb25zIGFyZSBncm91cGVkIGJ5IHRoaXMpLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVnaW9uSWQgLSBSZWdpb24gaWQgb2YgdGhlIHNwYXduZWQgcmVnaW9uIHRoYXQgc2hvdWxkIGJlIGRlbGV0ZWQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsZWFuVXBSZWdpb24gPSBmdW5jdGlvbiAoIHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCByZWdpb25JZCApIHtcbiAgICAgICAgICAgIGlmICggd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXSApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF1bIHJlZ2lvbklkIF0gKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmNsZWFuVXBSZWdpb24oIHBhcmVudENvbnRleHQuZGIsIHJlZ2lvbklkICk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdWyByZWdpb25JZCBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnTm90aGluZyB0byBjbGVhbi11cC4uJyApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdDYW5ub3QgY2xlYW4tdXAgcmVnaW9uIHNpbmNlIHBhcmVudENvbnRleHQgaXMgbm90IHJlZ2lzdGVyZWQuLicsIHBhcmVudENvbnRleHQgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVXBkYXRlcyB0aGUgZ2l2ZW4gYXR0cmlidXRlcyBvZiBhIG5vZGUuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGNvbXBvbmVudC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgY29tcG9uZW50LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5yZWdpb25JZCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBjb21wb25lbnQuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFBhdGggdG8gbm9kZS5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGF0dHJzIC0gS2V5cyBhcmUgbmFtZXMgb2YgYXR0cmlidXRlcyBhbmQgdmFsdWVzIGFyZSB0aGUgd2FudGVkIHZhbHVlLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXROb2RlQXR0cmlidXRlcyA9IGZ1bmN0aW9uICggY29udGV4dCwgaWQsIGF0dHJzICkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIGlmICggT2JqZWN0LmtleXMoIGF0dHJzIClcbiAgICAgICAgICAgICAgICAubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnbm8gYXR0cmlidXRlIHRvIHVwZGF0ZScgKTtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZSggY29udGV4dCwgaWQgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG5vZGVPYmogKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoIGF0dHJzICksXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyID0ga2V5cy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRBdHRyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlT2JqLnNldEF0dHJpYnV0ZSgga2V5c1sgY291bnRlciBdLCBhdHRyc1sga2V5c1sgY291bnRlciBdIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd3ZWJDeVBoeSAtIHNldE5vZGVBdHRyaWJ1dGVzJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGNvdW50ZXIgPD0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEF0dHIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgc2V0QXR0cigpO1xuICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqIFRPRE86IFdhdGNoIGRvbWFpblBvcnRzIGluc2lkZSBDb25uZWN0b3JzXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBpbnRlcmZhY2VzIChQcm9wZXJ0aWVzLCBDb25uZWN0b3JzIGFuZCBEb21haW5Qb3J0cykgb2YgYSBtb2RlbC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdhdGNoZXJzIC0gV2F0Y2hlcnMgZnJvbSB0aGUgc2VydmljZSB1dGlsaXppbmcgdGhpcyBmdW5jdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFBhdGggdG8gbW9kZWwuXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLndhdGNoSW50ZXJmYWNlcyA9IGZ1bmN0aW9uICggd2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGlkLCB1cGRhdGVMaXN0ZW5lciApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaEludGVyZmFjZXNfJyArIGlkLFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSwgLy9wcm9wZXJ0eTogIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkYXRhVHlwZTogPHN0cmluZz4sIHZhbHVlVHlwZSA8c3RyaW5nPiwgZGVyaXZlZCA8Ym9vbGVhbj59XG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IHt9LCAvL2Nvbm5lY3Rvcjoge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRvbWFpblBvcnRzOiA8b2JqZWN0PiB9XG4gICAgICAgICAgICAgICAgICAgIHBvcnRzOiB7fSAvL3BvcnQ6ICAgICAge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIHR5cGU6IDxzdHJpbmc+LCBjbGFzczogPHN0cmluZz4gfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25Qcm9wZXJ0eVVwZGF0ZSA9IGZ1bmN0aW9uICggaWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoICduYW1lJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGF0YVR5cGUgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ0RhdGFUeXBlJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWVUeXBlID0gdGhpcy5nZXRBdHRyaWJ1dGUoICdWYWx1ZVR5cGUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXJpdmVkID0gaXNQcm9wZXJ0eURlcml2ZWQoIHRoaXMgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdOYW1lICE9PSBkYXRhLnByb3BlcnRpZXNbIGlkIF0ubmFtZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1sgaWQgXS5uYW1lID0gbmV3TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggbmV3RGF0YVR5cGUgIT09IGRhdGEucHJvcGVydGllc1sgaWQgXS5kYXRhVHlwZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1sgaWQgXS5kYXRhVHlwZSA9IG5ld0RhdGFUeXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdWYWx1ZVR5cGUgIT09IGRhdGEucHJvcGVydGllc1sgaWQgXS52YWx1ZVR5cGUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnByb3BlcnRpZXNbIGlkIF0udmFsdWVUeXBlID0gbmV3VmFsdWVUeXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdEZXJpdmVkICE9PSBkYXRhLnByb3BlcnRpZXNbIGlkIF0uZGVyaXZlZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1sgaWQgXS5kZXJpdmVkID0gbmV3RGVyaXZlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggaGFkQ2hhbmdlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndXBkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25Qcm9wZXJ0eVVubG9hZCA9IGZ1bmN0aW9uICggaWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLnByb3BlcnRpZXNbIGlkIF07XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndW5sb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uQ29ubmVjdG9yVXBkYXRlID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ25hbWUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmICggbmV3TmFtZSAhPT0gZGF0YS5jb25uZWN0b3JzWyBpZCBdLm5hbWUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbm5lY3RvcnNbIGlkIF0ubmFtZSA9IG5ld05hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIGhhZENoYW5nZXMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uQ29ubmVjdG9yVW5sb2FkID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEuY29ubmVjdG9yc1sgaWQgXTtcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd1bmxvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25Qb3J0VXBkYXRlID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ25hbWUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdUeXBlID0gdGhpcy5nZXRBdHRyaWJ1dGUoICdUeXBlJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2xhc3MgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ0NsYXNzJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld05hbWUgIT09IGRhdGEucG9ydHNbIGlkIF0ubmFtZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucG9ydHNbIGlkIF0ubmFtZSA9IG5ld05hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld1R5cGUgIT09IGRhdGEucG9ydHNbIGlkIF0uZGF0YVR5cGUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnBvcnRzWyBpZCBdLnR5cGUgPSBuZXdUeXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdDbGFzcyAhPT0gZGF0YS5wb3J0c1sgaWQgXS5jbGFzcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucG9ydHNbIGlkIF0uY2xhc3MgPSBuZXdDbGFzcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggaGFkQ2hhbmdlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndXBkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25Qb3J0VW5sb2FkID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEucG9ydHNbIGlkIF07XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndW5sb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlzUHJvcGVydHlEZXJpdmVkID0gZnVuY3Rpb24gKCBub2RlICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5nZXRDb2xsZWN0aW9uUGF0aHMoICdkc3QnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5sZW5ndGggPiAwO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF0gPSB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdIHx8IHt9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXVsgY29udGV4dC5yZWdpb25JZCBdID0gY29udGV4dDtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2RlcyggY29udGV4dCApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggbWV0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoIGNvbnRleHQsIGlkIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG1vZGVsTm9kZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbE5vZGUubG9hZENoaWxkcmVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggY2hpbGRyZW4gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5bIGkgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gY2hpbGROb2RlLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKCBtZXRhLlByb3BlcnR5ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1sgY2hpbGRJZCBdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCAnRGF0YVR5cGUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoICdWYWx1ZVR5cGUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXJpdmVkOiBpc1Byb3BlcnR5RGVyaXZlZCggY2hpbGROb2RlIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVXBkYXRlKCBvblByb3BlcnR5VXBkYXRlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZCggb25Qcm9wZXJ0eVVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGNoaWxkTm9kZS5pc01ldGFUeXBlT2YoIG1ldGEuQ29ubmVjdG9yICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29ubmVjdG9yc1sgY2hpbGRJZCBdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblBvcnRzOiB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUoIG9uQ29ubmVjdG9yVXBkYXRlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZCggb25Db25uZWN0b3JVbmxvYWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vcXVldWVMaXN0LnB1c2goY2hpbGROb2RlLmxvYWRDaGlsZHJlbihjaGlsZE5vZGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKCBtZXRhLkRvbWFpblBvcnQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wb3J0c1sgY2hpbGRJZCBdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoICdUeXBlJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoICdDbGFzcycgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUoIG9uUG9ydFVwZGF0ZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQoIG9uUG9ydFVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9xdWV1ZUxpc3QucHVzaChjaGlsZE5vZGUubG9hZENoaWxkcmVuKGNoaWxkTm9kZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsTm9kZS5vbk5ld0NoaWxkTG9hZGVkKCBmdW5jdGlvbiAoIG5ld0NoaWxkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbmV3Q2hpbGQuaXNNZXRhVHlwZU9mKCBtZXRhLlByb3BlcnR5ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHJvcGVydGllc1sgY2hpbGRJZCBdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoICduYW1lJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSggJ0RhdGFUeXBlJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVUeXBlOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoICdWYWx1ZVR5cGUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXJpdmVkOiBpc1Byb3BlcnR5RGVyaXZlZCggbmV3Q2hpbGQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZSggb25Qcm9wZXJ0eVVwZGF0ZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZCggb25Qcm9wZXJ0eVVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggbmV3Q2hpbGQuaXNNZXRhVHlwZU9mKCBtZXRhLkNvbm5lY3RvciApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbm5lY3RvcnNbIGNoaWxkSWQgXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpblBvcnRzOiB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZSggb25Db25uZWN0b3JVcGRhdGUgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQoIG9uQ29ubmVjdG9yVW5sb2FkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vcXVldWVMaXN0LnB1c2goY2hpbGROb2RlLmxvYWRDaGlsZHJlbihjaGlsZE5vZGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBuZXdDaGlsZC5pc01ldGFUeXBlT2YoIG1ldGEuRG9tYWluUG9ydCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnBvcnRzWyBjaGlsZElkIF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoICduYW1lJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSggJ1R5cGUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSggJ0NsYXNzJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKCBvblBvcnRVcGRhdGUgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQoIG9uUG9ydFVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHF1ZXVlTGlzdC5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwoIHF1ZXVlTGlzdCApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUqL1xuXG5cbi8qKlxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cbiAqL1xuXG5cbmFuZ3VsYXIubW9kdWxlKCAnY3lwaHkuc2VydmljZXMnIClcbiAgICAuc2VydmljZSggJ2NvbXBvbmVudFNlcnZpY2UnLCBmdW5jdGlvbiAoICRxLCAkdGltZW91dCwgbm9kZVNlcnZpY2UsIGJhc2VDeVBoeVNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIHdhdGNoZXJzID0ge307XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIGNvbXBvbmVudCBmcm9tIHRoZSBjb250ZXh0IChkYi9wcm9qZWN0L2JyYW5jaCkuXG4gICAgICAgICAqIEBwYXJhbSBjb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLCBOLkIuIGRvZXMgbm90IG5lZWQgdG8gc3BlY2lmeSByZWdpb24uXG4gICAgICAgICAqIEBwYXJhbSBjb21wb25lbnRJZFxuICAgICAgICAgKiBAcGFyYW0gW21zZ10gLSBDb21taXQgbWVzc2FnZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlQ29tcG9uZW50ID0gZnVuY3Rpb24gKCBjb250ZXh0LCBjb21wb25lbnRJZCwgbXNnICkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBtc2cgfHwgJ0NvbXBvbmVudFNlcnZpY2UuZGVsZXRlQ29tcG9uZW50ICcgKyBjb21wb25lbnRJZDtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmRlc3Ryb3lOb2RlKCBjb250ZXh0LCBjb21wb25lbnRJZCwgbWVzc2FnZSApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVcGRhdGVzIHRoZSBnaXZlbiBhdHRyaWJ1dGVzXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGNvbXBvbmVudC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgY29tcG9uZW50LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5yZWdpb25JZCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBjb21wb25lbnQuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb21wb25lbnRJZCAtIFBhdGggdG8gY29tcG9uZW50LlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gYXR0cnMgLSBLZXlzIGFyZSBuYW1lcyBvZiBhdHRyaWJ1dGVzIGFuZCB2YWx1ZXMgYXJlIHRoZSB3YW50ZWQgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldENvbXBvbmVudEF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoIGNvbnRleHQsIGNvbXBvbmVudElkLCBhdHRycyApIHtcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLnNldE5vZGVBdHRyaWJ1dGVzKCBjb250ZXh0LCBjb21wb25lbnRJZCwgYXR0cnMgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogIFdhdGNoZXMgYWxsIGNvbXBvbmVudHMgKGV4aXN0ZW5jZSBhbmQgdGhlaXIgYXR0cmlidXRlcykgb2YgYSB3b3Jrc3BhY2UuXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxuICAgICAgICAgKiBAcGFyYW0gd29ya3NwYWNlSWRcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS4gIERhdGEgaXMgYW4gb2JqZWN0IGluIGRhdGEuY29tcG9uZW50cy5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGF2bUlkcyAtIEFuIG9wdGlvbmFsIGZpbHRlciB0aGF0IG9ubHkgd2F0Y2hlcyBjb21wb25lbnRzIHdpdGggSURzIHRoYXQgZXZhbHVhdGVzIHRvIHRydWUuXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaENvbXBvbmVudHMgPSBmdW5jdGlvbiAoIHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCBhdm1JZHMsIHVwZGF0ZUxpc3RlbmVyICkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29tcG9uZW50cycsXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiB7fSAvLyBjb21wb25lbnQge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPixcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICBhdm1JZDogPHN0cmluZz4sIHJlc291cmNlOiA8aGFzaHxzdHJpbmc+LCBjbGFzc2lmaWNhdGlvbnM6IDxzdHJpbmc+IH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ25hbWUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoICdJTkZPJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QXZtSUQgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ0lEJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UmVzb3VyY2UgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ1Jlc291cmNlJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2xhc3MgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ0NsYXNzaWZpY2F0aW9ucycgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdOYW1lICE9PSBkYXRhLmNvbXBvbmVudHNbIGlkIF0ubmFtZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1sgaWQgXS5uYW1lID0gbmV3TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggbmV3RGVzYyAhPT0gZGF0YS5jb21wb25lbnRzWyBpZCBdLmRlc2NyaXB0aW9uICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzWyBpZCBdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggbmV3QXZtSUQgIT09IGRhdGEuY29tcG9uZW50c1sgaWQgXS5hdm1JZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29tcG9uZW50c1sgaWQgXS5hdm1JZCA9IG5ld0F2bUlEO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdSZXNvdXJjZSAhPT0gZGF0YS5jb21wb25lbnRzWyBpZCBdLnJlc291cmNlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzWyBpZCBdLnJlc291cmNlID0gbmV3UmVzb3VyY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld0NsYXNzICE9PSBkYXRhLmNvbXBvbmVudHNbIGlkIF0uY2xhc3NpZmljYXRpb25zICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzWyBpZCBdLmNsYXNzaWZpY2F0aW9ucyA9IG5ld0NsYXNzO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBoYWRDaGFuZ2VzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCAnQ29tcG9uZW50U2VydmljZSBmb3VuZCB1cGRhdGUnICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEuY29tcG9uZW50c1sgaWQgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5jb21wb25lbnRzWyBpZCBdO1xuICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3VubG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMgPSBmdW5jdGlvbiAoIGZvbGRlck5vZGUsIG1ldGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUubG9hZENoaWxkcmVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGNoaWxkcmVuICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlblsgaSBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGNoaWxkTm9kZS5pc01ldGFUeXBlT2YoIG1ldGEuQUNNRm9sZGVyICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCggd2F0Y2hGcm9tRm9sZGVyUmVjKCBjaGlsZE5vZGUsIG1ldGEgKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKCBtZXRhLkFWTUNvbXBvbmVudE1vZGVsICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJZCA9IGNoaWxkTm9kZS5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCAhYXZtSWRzIHx8IGF2bUlkcy5oYXNPd25Qcm9wZXJ0eSggY2hpbGROb2RlLmdldEF0dHJpYnV0ZSggJ0lEJyApICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzWyBjb21wb25lbnRJZCBdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY29tcG9uZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoICduYW1lJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSggJ0lORk8nICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2bUlkOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCAnSUQnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCAnUmVzb3VyY2UnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzaWZpY2F0aW9uczogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSggJ0NsYXNzaWZpY2F0aW9ucycgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKCBvblVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZSggb25VcGRhdGUgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZCggZnVuY3Rpb24gKCBuZXdDaGlsZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdDaGlsZC5pc01ldGFUeXBlT2YoIG1ldGEuQUNNRm9sZGVyICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMoIG5ld0NoaWxkLCBtZXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIG5ld0NoaWxkLmlzTWV0YVR5cGVPZiggbWV0YS5BVk1Db21wb25lbnRNb2RlbCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCAhYXZtSWRzIHx8IGF2bUlkcy5oYXNPd25Qcm9wZXJ0eSggbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCAnSUQnICkgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbXBvbmVudHNbIGNvbXBvbmVudElkIF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSggJ0lORk8nICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2bUlkOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoICdJRCcgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSggJ1Jlc291cmNlJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2lmaWNhdGlvbnM6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSggJ0NsYXNzaWZpY2F0aW9ucycgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQoIG9uVW5sb2FkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUoIG9uVXBkYXRlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjb21wb25lbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEuY29tcG9uZW50c1sgY29tcG9uZW50SWQgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcXVldWVMaXN0Lmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbCggcXVldWVMaXN0IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXSA9IHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF0gfHwge307XG4gICAgICAgICAgICB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdWyBjb250ZXh0LnJlZ2lvbklkIF0gPSBjb250ZXh0O1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKCBjb250ZXh0IClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBtZXRhICkge1xuICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZSggY29udGV4dCwgd29ya3NwYWNlSWQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggd29ya3NwYWNlTm9kZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGNoaWxkcmVuICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlblsgaSBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY2hpbGROb2RlLmlzTWV0YVR5cGVPZiggbWV0YS5BQ01Gb2xkZXIgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2goIHdhdGNoRnJvbUZvbGRlclJlYyggY2hpbGROb2RlLCBtZXRhICkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoIGZ1bmN0aW9uICggbmV3Q2hpbGQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdDaGlsZC5pc01ldGFUeXBlT2YoIG1ldGEuQUNNRm9sZGVyICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyggbmV3Q2hpbGQsIG1ldGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHF1ZXVlTGlzdC5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwoIHF1ZXVlTGlzdCApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBkb21haW4tbW9kZWxzIG9mIGEgY29tcG9uZW50LlxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cbiAgICAgICAgICogQHBhcmFtIGNvbXBvbmVudElkXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaENvbXBvbmVudERvbWFpbnMgPSBmdW5jdGlvbiAoIHBhcmVudENvbnRleHQsIGNvbXBvbmVudElkLCB1cGRhdGVMaXN0ZW5lciApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaENvbXBvbmVudERvbWFpbnNfJyArIGNvbXBvbmVudElkLFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGNvbXBvbmVudElkLFxuICAgICAgICAgICAgICAgICAgICBkb21haW5Nb2RlbHM6IHt9IC8vZG9tYWluTW9kZWw6IGlkOiA8c3RyaW5nPiwgdHlwZTogPHN0cmluZz5cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uRG9tYWluTW9kZWxVcGRhdGUgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VHlwZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCAnVHlwZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdUeXBlICE9PSBkYXRhLmRvbWFpbk1vZGVsc1sgaWQgXS50eXBlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kb21haW5Nb2RlbHNbIGlkIF0udHlwZSA9IG5ld1R5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIGhhZENoYW5nZXMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uRG9tYWluTW9kZWxVbmxvYWQgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5kb21haW5Nb2RlbHNbIGlkIF07XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndW5sb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdID0gd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXSB8fCB7fTtcbiAgICAgICAgICAgIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF1bIGNvbnRleHQucmVnaW9uSWQgXSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoIGNvbnRleHQgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG1ldGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKCBjb250ZXh0LCBjb21wb25lbnRJZCApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBjb21wb25lbnROb2RlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE5vZGUubG9hZENoaWxkcmVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggY2hpbGRyZW4gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5bIGkgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gY2hpbGROb2RlLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKCBtZXRhLkRvbWFpbk1vZGVsICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZG9tYWluTW9kZWxzWyBjaGlsZElkIF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoICdUeXBlJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZSggb25Eb21haW5Nb2RlbFVwZGF0ZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQoIG9uRG9tYWluTW9kZWxVbmxvYWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnROb2RlLm9uTmV3Q2hpbGRMb2FkZWQoIGZ1bmN0aW9uICggbmV3Q2hpbGQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IG5ld0NoaWxkLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdDaGlsZC5pc01ldGFUeXBlT2YoIG1ldGEuRG9tYWluTW9kZWwgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kb21haW5Nb2RlbHNbIGNoaWxkSWQgXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCAnVHlwZScgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZSggb25Eb21haW5Nb2RlbFVwZGF0ZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZCggb25Eb21haW5Nb2RlbFVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHF1ZXVlTGlzdC5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwoIHF1ZXVlTGlzdCApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLndhdGNoSW50ZXJmYWNlcy5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKCBwYXJlbnRDb250ZXh0LCBpZCwgdXBkYXRlTGlzdGVuZXIgKSB7XG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS53YXRjaEludGVyZmFjZXMoIHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBpZCwgdXBkYXRlTGlzdGVuZXIgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsZWFuVXBBbGxSZWdpb25zID0gZnVuY3Rpb24gKCBwYXJlbnRDb250ZXh0ICkge1xuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyggd2F0Y2hlcnMsIHBhcmVudENvbnRleHQgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbi5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uICggcGFyZW50Q29udGV4dCwgcmVnaW9uSWQgKSB7XG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24oIHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCByZWdpb25JZCApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uICggcGFyZW50Q29udGV4dCwgZm4gKSB7XG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlciggd2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGZuICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dDb250ZXh0ID0gZnVuY3Rpb24gKCBjb250ZXh0ICkge1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9nQ29udGV4dCggY29udGV4dCApO1xuICAgICAgICB9O1xuICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSwgV2ViR01FR2xvYmFsKi9cblxuLyoqXG4gKiBUaGlzIHNlcnZpY2UgY29udGFpbnMgbWV0aG9kcyBmb3IgZGVzaWduIHNwYWNlIGV4cGxvcmF0aW9uIHRocm91Z2ggdGhlIEV4ZWN1dG9yIENsaWVudC5cbiAqXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxuICovXG5cbmFuZ3VsYXIubW9kdWxlKCAnY3lwaHkuc2VydmljZXMnIClcbiAgICAuc2VydmljZSggJ2Rlc2VydFNlcnZpY2UnLCBmdW5jdGlvbiAoICRxLCAkaW50ZXJ2YWwsIGZpbGVTZXJ2aWNlLCBleGVjdXRvclNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgQ01EU1RSLFxuICAgICAgICAgICAgeG1sVG9Kc29uID0gbmV3IFdlYkdNRUdsb2JhbC5jbGFzc2VzLkNvbnZlcnRlcnMuWG1sMmpzb24oIHtcbiAgICAgICAgICAgICAgICBza2lwV1NUZXh0OiB0cnVlLFxuICAgICAgICAgICAgICAgIGFycmF5RWxlbWVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgQ29uZmlndXJhdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgRWxlbWVudDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgTmF0dXJhbE1lbWJlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgQWx0ZXJuYXRpdmVBc3NpZ25tZW50OiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApLFxuICAgICAgICAgICAganNvblRvWG1sID0gbmV3IFdlYkdNRUdsb2JhbC5jbGFzc2VzLkNvbnZlcnRlcnMuSnNvbjJ4bWwoKTtcblxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKCBkZXNlcnRJbnB1dCApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgICAgIGlmICggKCBkZXNlcnRJbnB1dC5kZXNlcnRTeXN0ZW0gJiYgYW5ndWxhci5pc09iamVjdCggZGVzZXJ0SW5wdXQuZGVzZXJ0U3lzdGVtICkgJiZcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmlzT2JqZWN0KCBkZXNlcnRJbnB1dC5pZE1hcCApICkgPT09IGZhbHNlICkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggJ2Rlc2VydElucHV0IG11c3QgY29udGFpbiBhIGRlc2VydFN5c3RlbSBhbmQgaWRNYXAgb2JqZWN0IScgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5zYXZlRGVzZXJ0SW5wdXQoIGRlc2VydElucHV0LmRlc2VydFN5c3RlbSApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggaW5wdXRIYXNoICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ1NhdmVkIGRlc2VydElucHV0JywgZmlsZVNlcnZpY2UuZ2V0RG93bmxvYWRVcmwoIGlucHV0SGFzaCApICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmNyZWF0ZUFuZFJ1bkpvYiggaW5wdXRIYXNoICk7XG4gICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggam9iSW5mbyApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdKb2Igc3VjY2VlZGVkIGZpbmFsIGpvYkluZm8nLCBqb2JJbmZvICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmV4dHJhY3RDb25maWd1cmF0aW9ucyggam9iSW5mbywgZGVzZXJ0SW5wdXQuaWRNYXAgKTtcbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBjb25maWd1cmF0aW9ucyApIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggY29uZmlndXJhdGlvbnMgKTtcbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICBjYXRjaCAoIGZ1bmN0aW9uICggZXJyICkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggJ0NhbGN1bGF0aW5nIGNvbmZpZ3VyYXRpb25zIGZhaWxlZCwgZXJyOiAnICsgZXJyLnRvU3RyaW5nKCkgKTtcbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zYXZlRGVzZXJ0SW5wdXQgPSBmdW5jdGlvbiAoIGRlc2VydFN5c3RlbSApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgYXJ0aWZhY3QsXG4gICAgICAgICAgICAgICAgeG1sU3RyaW5nO1xuXG4gICAgICAgICAgICBhcnRpZmFjdCA9IGZpbGVTZXJ2aWNlLmNyZWF0ZUFydGlmYWN0KCAnZGVzZXJ0LWlucHV0JyApO1xuICAgICAgICAgICAgeG1sU3RyaW5nID0ganNvblRvWG1sLmNvbnZlcnRUb1N0cmluZyggZGVzZXJ0U3lzdGVtICk7XG5cbiAgICAgICAgICAgIGZpbGVTZXJ2aWNlLmFkZEZpbGVBc1NvZnRMaW5rVG9BcnRpZmFjdCggYXJ0aWZhY3QsICdkZXNlcnRJbnB1dC54bWwnLCB4bWxTdHJpbmcgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBleGVjQ29uZmlnID0gSlNPTi5zdHJpbmdpZnkoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNtZDogJ3J1bl9kZXNlcnQuY21kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdEFydGlmYWN0czogWyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2FsbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0UGF0dGVybnM6IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICB9IF1cbiAgICAgICAgICAgICAgICAgICAgfSwgbnVsbCwgNCApLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXNUb0FkZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZXhlY3V0b3JfY29uZmlnLmpzb24nOiBleGVjQ29uZmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdydW5fZGVzZXJ0LmNtZCc6IENNRFNUUlxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVTZXJ2aWNlLmFkZEZpbGVzVG9BcnRpZmFjdCggYXJ0aWZhY3QsIGZpbGVzVG9BZGQgKTtcbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsZVNlcnZpY2Uuc2F2ZUFydGlmYWN0KCBhcnRpZmFjdCApO1xuICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGFydGllSGFzaCApIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggYXJ0aWVIYXNoICk7XG4gICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgY2F0Y2ggKCBmdW5jdGlvbiAoIHJlYXNvbiApIHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoICdDb3VsZCBub3Qgc2F2ZSBEZXNlcnRJbnB1dCB0byBibG9iLCBlcnI6IFwiJyArIHJlYXNvbiArICdcIicgKTtcbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jcmVhdGVBbmRSdW5Kb2IgPSBmdW5jdGlvbiAoIGlucHV0SGFzaCApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICBleGVjdXRvclNlcnZpY2UuY3JlYXRlSm9iKCB7XG4gICAgICAgICAgICAgICAgaGFzaDogaW5wdXRIYXNoLFxuICAgICAgICAgICAgICAgIGxhYmVsczogW11cbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdG9wO1xuICAgICAgICAgICAgICAgICAgICBzdG9wID0gJGludGVydmFsKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjdXRvclNlcnZpY2UuZ2V0SW5mbyggaW5wdXRIYXNoIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBqb2JJbmZvICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oIEpTT04uc3RyaW5naWZ5KCBqb2JJbmZvLCBudWxsLCA0ICkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBqb2JJbmZvLnN0YXR1cyA9PT0gJ0NSRUFURUQnIHx8IGpvYkluZm8uc3RhdHVzID09PSAnUlVOTklORycgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbCggc3RvcCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGpvYkluZm8uc3RhdHVzID09PSAnU1VDQ0VTUycgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBqb2JJbmZvICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoIEpTT04uc3RyaW5naWZ5KCBqb2JJbmZvLCBudWxsLCA0ICkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGludGVydmFsLmNhbmNlbCggc3RvcCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggJ0NvdWxkIG5vdCBvYnRhaW4gam9iSW5mbyBmb3IgZGVzZXJ0JyArIGVyciApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICB9LCAyMDAgKTtcbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICBjYXRjaCAoIGZ1bmN0aW9uICggZXJyICkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggJ0NvdWxkIG5vdCBjcmVhdGUgam9iJyArIGVyciApO1xuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmV4dHJhY3RDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uICggam9iSW5mbywgaWRNYXAgKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgaWYgKCAoIGpvYkluZm8ucmVzdWx0SGFzaGVzICYmIGpvYkluZm8ucmVzdWx0SGFzaGVzLmFsbCApID09PSBmYWxzZSApIHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoICdKb2JJbmZvIGRpZCBub3QgY29udGFpbiByZXN1bHRIYXNoZXMuYWxsJyApO1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsZVNlcnZpY2UuZ2V0TWV0YWRhdGEoIGpvYkluZm8ucmVzdWx0SGFzaGVzLmFsbCApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggbWV0YWRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBEZWFsIHdpdGggY29uZmlncyB3aGVuIHRoZXJlJ3MgY29uc3RyYWludHNcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgIGlmICghbWV0YWRhdGEuY29udGVudC5oYXNPd25Qcm9wZXJ0eSgnZGVzZXJ0SW5wdXRfY29uZmlncy54bWwnKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnRGVzZXJ0IGRpZCBub3QgZ2VuZXJhdGUgYSBcImRlc2VydElucHV0X2NvbmZpZ3MueG1sXCIuJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoICFtZXRhZGF0YS5jb250ZW50Lmhhc093blByb3BlcnR5KCAnZGVzZXJ0SW5wdXRfYmFjay54bWwnICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoICdEZXNlcnQgZGlkIG5vdCBnZW5lcmF0ZSBhIGRlc2VydElucHV0X2JhY2sueG1sLicgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWxlU2VydmljZS5nZXRPYmplY3QoIG1ldGFkYXRhLmNvbnRlbnRbICdkZXNlcnRJbnB1dF9iYWNrLnhtbCcgXS5jb250ZW50ICk7XG4gICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggY29udGVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlc2VydE9iamVjdCA9IHhtbFRvSnNvbi5jb252ZXJ0RnJvbUJ1ZmZlciggY29udGVudCApLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzZXJ0QmFja1N5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGosXG4gICAgICAgICAgICAgICAgICAgICAgICBrLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsdEFzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtSWRUb1BhdGggPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGRlc2VydE9iamVjdCBpbnN0YW5jZW9mIEVycm9yICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCAnT3V0cHV0IGRlc2VydCBYTUwgbm90IHZhbGlkIHhtbCwgZXJyOiAnICsgZGVzZXJ0T2JqZWN0Lm1lc3NhZ2UgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZXNlcnRCYWNrU3lzdGVtID0gZGVzZXJ0T2JqZWN0LkRlc2VydEJhY2tTeXN0ZW07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBkZXNlcnRCYWNrU3lzdGVtLkVsZW1lbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBqID0gMDsgaiA8IGRlc2VydEJhY2tTeXN0ZW0uRWxlbWVudC5sZW5ndGg7IGogKz0gMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtID0gZGVzZXJ0QmFja1N5c3RlbS5FbGVtZW50WyBqIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbUlkVG9QYXRoWyBlbGVtWyAnQF9pZCcgXSBdID0gaWRNYXBbIGVsZW1bICdAZXh0ZXJuYWxJRCcgXSBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAoIGogPSAwOyBqIDwgZGVzZXJ0QmFja1N5c3RlbS5Db25maWd1cmF0aW9uLmxlbmd0aDsgaiArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2ZnID0gZGVzZXJ0QmFja1N5c3RlbS5Db25maWd1cmF0aW9uWyBqIF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucy5wdXNoKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY2ZnWyAnQG5hbWUnIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNmZ1sgJ0BpZCcgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnID0gY29uZmlndXJhdGlvbnNbIGNvbmZpZ3VyYXRpb25zLmxlbmd0aCAtIDEgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY2ZnLkFsdGVybmF0aXZlQXNzaWdubWVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBrID0gMDsgayA8IGNmZy5BbHRlcm5hdGl2ZUFzc2lnbm1lbnQubGVuZ3RoOyBrICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdEFzcyA9IGNmZy5BbHRlcm5hdGl2ZUFzc2lnbm1lbnRbIGsgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnLmFsdGVybmF0aXZlQXNzaWdubWVudHMucHVzaCgge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRBbHRlcm5hdGl2ZTogZWxlbUlkVG9QYXRoWyBhbHRBc3NbICdAYWx0ZXJuYXRpdmVfZW5kXycgXSBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVPZjogZWxlbUlkVG9QYXRoWyBhbHRBc3NbICdAYWx0ZXJuYXRpdmVfb2ZfZW5kXycgXSBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggY29uZmlndXJhdGlvbnMgKTtcbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlQ29uZmlndXJhdGlvbnNEdW1teSA9IGZ1bmN0aW9uICggLypkZXNlcnRJbnB1dCovKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zID0gWyB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAxLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQ29uZi4gbm86IDEnLFxuICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiBbIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQWx0ZXJuYXRpdmU6ICcvMjEzMDAxNzgzNC81NDI1NzE0OTQvMTY0NjA1OTQyMi81NjQzMTIxNDgvOTEwNzM4MTUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVPZjogJy8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OCdcbiAgICAgICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBpZDogMixcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0NvbmYuIG5vOiAyJyxcbiAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogWyB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEFsdGVybmF0aXZlOiAnLzIxMzAwMTc4MzQvNTQyNTcxNDk0LzE2NDYwNTk0MjIvNTY0MzEyMTQ4LzE0MzM0NzE3ODknLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVPZjogJy8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OCdcbiAgICAgICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBpZDogMyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0NvbmYuIG5vOiAzJyxcbiAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogWyB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEFsdGVybmF0aXZlOiAnLzIxMzAwMTc4MzQvNTQyNTcxNDk0LzE2NDYwNTk0MjIvNTY0MzEyMTQ4LzE0OTM5MDcyNjQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVPZjogJy8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OCdcbiAgICAgICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBpZDogNCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0NvbmYuIG5vOiA0JyxcbiAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVBc3NpZ25tZW50czogWyB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEFsdGVybmF0aXZlOiAnLzIxMzAwMTc4MzQvNTQyNTcxNDk0LzE2NDYwNTk0MjIvNTY0MzEyMTQ4LzE3Njc1MjE2MjEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVPZjogJy8yMTMwMDE3ODM0LzU0MjU3MTQ5NC8xNjQ2MDU5NDIyLzU2NDMxMjE0OCdcbiAgICAgICAgICAgICAgICAgICAgfSBdXG4gICAgICAgICAgICAgICAgfSBdO1xuXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBjb25maWd1cmF0aW9ucyApO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXREZXNlcnRJbnB1dERhdGEgPSBmdW5jdGlvbiAoIGRlc2lnblN0cnVjdHVyZURhdGEgKSB7XG4gICAgICAgICAgICB2YXIgZGVzZXJ0U3lzdGVtLFxuICAgICAgICAgICAgICAgIGlkTWFwID0ge30sXG4gICAgICAgICAgICAgICAgaWRDb3VudGVyID0gNCxcbiAgICAgICAgICAgICAgICByb290Q29udGFpbmVyID0gZGVzaWduU3RydWN0dXJlRGF0YS5jb250YWluZXJzWyBkZXNpZ25TdHJ1Y3R1cmVEYXRhLnJvb3RJZCBdLFxuICAgICAgICAgICAgICAgIHBvcHVsYXRlRGF0YVJlYyA9IGZ1bmN0aW9uICggY29udGFpbmVyLCBlbGVtZW50ICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICgga2V5IGluIGNvbnRhaW5lci5jb21wb25lbnRzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjb250YWluZXIuY29tcG9uZW50cy5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhID0gY29udGFpbmVyLmNvbXBvbmVudHNbIGtleSBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkQ291bnRlciArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gaWRDb3VudGVyLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRNYXBbIGlkIF0gPSBjaGlsZERhdGEuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5FbGVtZW50LnB1c2goIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BfaWQnOiAnaWQnICsgaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAZGVjb21wb3NpdGlvbic6ICdmYWxzZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAZXh0ZXJuYWxJRCc6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGlkJzogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAbmFtZSc6IGNoaWxkRGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRWxlbWVudCc6IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAoIGtleSBpbiBjb250YWluZXIuc3ViQ29udGFpbmVycyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY29udGFpbmVyLnN1YkNvbnRhaW5lcnMuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkRGF0YSA9IGNvbnRhaW5lci5zdWJDb250YWluZXJzWyBrZXkgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZENvdW50ZXIgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA9IGlkQ291bnRlci50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkTWFwWyBpZCBdID0gY2hpbGREYXRhLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuRWxlbWVudC5wdXNoKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAX2lkJzogJ2lkJyArIGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGRlY29tcG9zaXRpb24nOiAoIGNoaWxkRGF0YS50eXBlID09PSAnQ29tcG91bmQnIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGV4dGVybmFsSUQnOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BpZCc6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQG5hbWUnOiBjaGlsZERhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0VsZW1lbnQnOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3B1bGF0ZURhdGFSZWMoIGNoaWxkRGF0YSwgZWxlbWVudC5FbGVtZW50WyBlbGVtZW50LkVsZW1lbnQubGVuZ3RoIC0gMSBdICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgZGVzZXJ0U3lzdGVtID0ge1xuICAgICAgICAgICAgICAgICdEZXNlcnRTeXN0ZW0nOiB7XG4gICAgICAgICAgICAgICAgICAgICdAeG1sbnM6eHNpJzogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlJyxcbiAgICAgICAgICAgICAgICAgICAgJ0BTeXN0ZW1OYW1lJzogJycsXG4gICAgICAgICAgICAgICAgICAgICdAeHNpOm5vTmFtZXNwYWNlU2NoZW1hTG9jYXRpb24nOiAnRGVzZXJ0SWZhY2UueHNkJyxcbiAgICAgICAgICAgICAgICAgICAgJ0NvbnN0cmFpbnRTZXQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnQF9pZCc6ICdpZDEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BleHRlcm5hbElEJzogJzEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BpZCc6ICcxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdAbmFtZSc6ICdjb25zdHJhaW50cydcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ0Zvcm11bGFTZXQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnQF9pZCc6ICdpZDInLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BleHRlcm5hbElEJzogJzInLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BpZCc6ICcyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdAbmFtZSc6ICdmb3JtdWxhU2V0J1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnU3BhY2UnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnQF9pZCc6ICdpZDMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BkZWNvbXBvc2l0aW9uJzogJ3RydWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BleHRlcm5hbElEJzogJzMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0BpZCc6ICczJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdAbmFtZSc6ICdEZXNpZ25TcGFjZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnRWxlbWVudCc6IFsge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAX2lkJzogJ2lkNCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0BkZWNvbXBvc2l0aW9uJzogJ3RydWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAZXh0ZXJuYWxJRCc6ICc0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQGlkJzogJzQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdAbmFtZSc6IHJvb3RDb250YWluZXIubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRWxlbWVudCc6IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICB9IF1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwb3B1bGF0ZURhdGFSZWMoIHJvb3RDb250YWluZXIsIGRlc2VydFN5c3RlbS5EZXNlcnRTeXN0ZW0uU3BhY2UuRWxlbWVudFsgMCBdICk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGVzZXJ0U3lzdGVtOiBkZXNlcnRTeXN0ZW0sXG4gICAgICAgICAgICAgICAgaWRNYXA6IGlkTWFwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIENNRFNUUiA9IFtcbiAgICAgICAgICAgICc6OiBSdW5zIDwtRGVzZXJ0VG9vbHMuZXhlLT4gZGVzZXJ0SW5wdXQueG1sIC9tJyxcbiAgICAgICAgICAgICdFQ0hPIG9mZicsXG4gICAgICAgICAgICAncHVzaGQgJX5kcDAnLFxuICAgICAgICAgICAgJyVTeXN0ZW1Sb290JVxcXFxTeXNXb1c2NFxcXFxSRUcuZXhlIHF1ZXJ5IFwiSEtMTVxcXFxzb2Z0d2FyZVxcXFxNRVRBXCIgL3YgXCJNRVRBX1BBVEhcIicsXG4gICAgICAgICAgICAnU0VUIFFVRVJZX0VSUk9STEVWRUw9JUVSUk9STEVWRUwlJyxcbiAgICAgICAgICAgICdJRiAlUVVFUllfRVJST1JMRVZFTCUgPT0gMCAoJyxcbiAgICAgICAgICAgICcgICAgICAgIEZPUiAvRiBcInNraXA9MiB0b2tlbnM9MiwqXCIgJSVBIElOIChcXCclU3lzdGVtUm9vdCVcXFxcU3lzV29XNjRcXFxcUkVHLmV4ZSBxdWVyeSBcIkhLTE1cXFxcc29mdHdhcmVcXFxcTUVUQVwiIC92IFwiTUVUQV9QQVRIXCJcXCcpIERPIFNFVCBNRVRBX1BBVEg9JSVCKScsXG4gICAgICAgICAgICAnU0VUIERFU0VSVF9FWEU9XCIlTUVUQV9QQVRIJVxcXFxiaW5cXFxcRGVzZXJ0VG9vbC5leGVcIicsXG4gICAgICAgICAgICAnICAgSUYgRVhJU1QgJURFU0VSVF9FWEUlICgnLFxuICAgICAgICAgICAgJyAgICAgICBSRU0gSW5zdGFsbGVyIG1hY2hpbmUuJyxcbiAgICAgICAgICAgICcgICAgICAgJURFU0VSVF9FWEUlIGRlc2VydElucHV0LnhtbCAvYyBcImFwcGx5QWxsXCInLFxuICAgICAgICAgICAgJyAgICkgRUxTRSBJRiBFWElTVCBcIiVNRVRBX1BBVEglXFxcXHNyY1xcXFxiaW5cXFxcRGVzZXJ0VG9vbC5leGVcIiAoJyxcbiAgICAgICAgICAgICcgICAgICAgUkVNIERldmVsb3BlciBtYWNoaW5lLicsXG4gICAgICAgICAgICAnICAgICAgIFwiJU1FVEFfUEFUSCVcXFxcc3JjXFxcXGJpblxcXFxEZXNlcnRUb29sLmV4ZVwiIGRlc2VydElucHV0LnhtbCAvYyBcImFwcGx5QWxsXCInLFxuICAgICAgICAgICAgJyAgICkgRUxTRSAoJyxcbiAgICAgICAgICAgICcgICAgICAgRUNITyBvbicsXG4gICAgICAgICAgICAnICAgICAgIEVDSE8gQ291bGQgbm90IGZpbmQgRGVzZXJ0VG9vbC5leGUhJyxcbiAgICAgICAgICAgICcgICAgICAgRVhJVCAvQiAzJyxcbiAgICAgICAgICAgICcgICApJyxcbiAgICAgICAgICAgICcpJyxcbiAgICAgICAgICAgICdJRiAlUVVFUllfRVJST1JMRVZFTCUgPT0gMSAoJyxcbiAgICAgICAgICAgICcgICAgRUNITyBvbicsXG4gICAgICAgICAgICAnRUNITyBcIk1FVEEgdG9vbHMgbm90IGluc3RhbGxlZC5cIiA+PiBfRkFJTEVELnR4dCcsXG4gICAgICAgICAgICAnRUNITyBcIlNlZSBFcnJvciBMb2c6IF9GQUlMRUQudHh0XCInLFxuICAgICAgICAgICAgJ0VYSVQgL2IgJVFVRVJZX0VSUk9STEVWRUwlJyxcbiAgICAgICAgICAgICcpJyxcbiAgICAgICAgICAgICdwb3BkJ1xuICAgICAgICBdLmpvaW4oICdcXG4nICk7XG4gICAgfSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cblxuLyoqXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxuICovXG5cblxuYW5ndWxhci5tb2R1bGUoICdjeXBoeS5zZXJ2aWNlcycgKVxuICAgIC5zZXJ2aWNlKCAnZGVzaWduU2VydmljZScsIGZ1bmN0aW9uICggJHEsICR0aW1lb3V0LCAkbG9jYXRpb24sICRtb2RhbCwgZ3Jvd2wsIG5vZGVTZXJ2aWNlLCBiYXNlQ3lQaHlTZXJ2aWNlLFxuICAgICAgICBwbHVnaW5TZXJ2aWNlLCBmaWxlU2VydmljZSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICB3YXRjaGVycyA9IHt9O1xuXG4gICAgICAgIHRoaXMuZWRpdERlc2lnbkZuID0gZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbigge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL0Rlc2lnbkVkaXQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0Rlc2lnbkVkaXRDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICAvL3NpemU6IHNpemUsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbiggZnVuY3Rpb24gKCBlZGl0ZWREYXRhICkge1xuICAgICAgICAgICAgICAgIHZhciBhdHRycyA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiBlZGl0ZWREYXRhLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICdJTkZPJzogZWRpdGVkRGF0YS5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2VsZi5zZXREZXNpZ25BdHRyaWJ1dGVzKCBkYXRhLmNvbnRleHQsIGRhdGEuaWQsIGF0dHJzIClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnQXR0cmlidXRlIHVwZGF0ZWQnICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ01vZGFsIGRpc21pc3NlZCBhdDogJyArIG5ldyBEYXRlKCkgKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmV4cG9ydEFzQWRtRm4gPSBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICBzZWxmLmV4cG9ydERlc2lnbiggZGF0YS5jb250ZXh0LCBkYXRhLmlkIClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkb3dubG9hZFVybCApIHtcbiAgICAgICAgICAgICAgICAgICAgZ3Jvd2wuc3VjY2VzcyggJ0FETSBmaWxlIGZvciA8YSBocmVmPVwiJyArIGRvd25sb2FkVXJsICsgJ1wiPicgKyBkYXRhLm5hbWUgKyAnPC9hPiBleHBvcnRlZC4nICk7XG4gICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgY2F0Y2ggKCBmdW5jdGlvbiAoIHJlYXNvbiApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCByZWFzb24gKTtcbiAgICAgICAgICAgICAgICBncm93bC5lcnJvciggJ0V4cG9ydCBmYWlsZWQsIHNlZSBjb25zb2xlIGZvciBkZXRhaWxzLicgKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRlbGV0ZUZuID0gZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbigge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1NpbXBsZU1vZGFsLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTaW1wbGVNb2RhbENvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZSBEZXNpZ24gU3BhY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbHM6ICdUaGlzIHdpbGwgZGVsZXRlICcgKyBkYXRhLm5hbWUgKyAnIGZyb20gdGhlIHdvcmtzcGFjZS4nXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICBtb2RhbEluc3RhbmNlLnJlc3VsdC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kZWxldGVEZXNpZ24oIGRhdGEuY29udGV4dCwgZGF0YS5pZCApO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnTW9kYWwgZGlzbWlzc2VkIGF0OiAnICsgbmV3IERhdGUoKSApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmVzIHRoZSBkZXNpZ24gZnJvbSB0aGUgY29udGV4dC5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gZGF0YS1iYXNlIGNvbm5lY3Rpb24uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkZXNpZ25JZCAtIFBhdGggdG8gZGVzaWduLXNwYWNlLlxuICAgICAgICAgKiBAcGFyYW0gW21zZ10gLSBDb21taXQgbWVzc2FnZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlRGVzaWduID0gZnVuY3Rpb24gKCBjb250ZXh0LCBkZXNpZ25JZCwgbXNnICkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBtc2cgfHwgJ2Rlc2lnblNlcnZpY2UuZGVsZXRlRGVzaWduICcgKyBkZXNpZ25JZDtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmRlc3Ryb3lOb2RlKCBjb250ZXh0LCBkZXNpZ25JZCwgbWVzc2FnZSApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVcGRhdGVzIHRoZSBnaXZlbiBhdHRyaWJ1dGVzXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGRlc2lnbi5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgZGVzaWduLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5yZWdpb25JZCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBkZXNpZ24uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkZXNpZ25JZCAtIFBhdGggdG8gZGVzaWduLXNwYWNlLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gYXR0cnMgLSBLZXlzIGFyZSBuYW1lcyBvZiBhdHRyaWJ1dGVzIGFuZCB2YWx1ZXMgYXJlIHRoZSB3YW50ZWQgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldERlc2lnbkF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoIGNvbnRleHQsIGRlc2lnbklkLCBhdHRycyApIHtcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLnNldE5vZGVBdHRyaWJ1dGVzKCBjb250ZXh0LCBkZXNpZ25JZCwgYXR0cnMgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2FsbHMgQWRtRXhwb3J0ZXIuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gQ29udGV4dCBmb3IgcGx1Z2luLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24gdG8gcHVsbCBtb2RlbCBmcm9tLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGVzaWduSWRcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtkZXNlcnRDZmdQYXRoXSAtIFBhdGggdG8gY29uZmlndXJhdGlvbiBpZiBvbmx5IG9uZSBpcyB0byBiZSBleHBvcnRlZC5cbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gcmVzb2x2ZXMgdG8ge3N0cmluZ30gaWYgc3VjY2Vzc2Z1bC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZXhwb3J0RGVzaWduID0gZnVuY3Rpb24gKCBjb250ZXh0LCBkZXNpZ25JZCwgZGVzZXJ0Q2ZnUGF0aCApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgY29uZmlnID0ge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlOiBkZXNpZ25JZCxcbiAgICAgICAgICAgICAgICAgICAgcnVuT25TZXJ2ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5Db25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjbXM6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzZXJ0Q2ZnOiBkZXNlcnRDZmdQYXRoIHx8ICcnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLnJ1blBsdWdpbiggY29udGV4dCwgJ0FkbUV4cG9ydGVyJywgY29uZmlnIClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCByZXN1bHQgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vXCJ7XCJzdWNjZXNzXCI6dHJ1ZSxcIm1lc3NhZ2VzXCI6W10sXCJhcnRpZmFjdHNcIjpbXSxcInBsdWdpbk5hbWVcIjpcIkFETSBJbXBvcnRlclwiLFxuICAgICAgICAgICAgICAgICAgICAvLyBcInN0YXJ0VGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS4zODNaXCIsXCJmaW5pc2hUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjkzOVpcIixcImVycm9yXCI6bnVsbH1cIlxuICAgICAgICAgICAgICAgICAgICBpZiAoIHJlc3VsdC5zdWNjZXNzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coIHJlc3VsdCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggZmlsZVNlcnZpY2UuZ2V0RG93bmxvYWRVcmwoIHJlc3VsdC5hcnRpZmFjdHNbIDAgXSApICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHJlc3VsdC5lcnJvciApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoIHJlc3VsdC5lcnJvciArICcgbWVzc2FnZXM6ICcgKyBhbmd1bGFyLnRvSnNvbiggcmVzdWx0Lm1lc3NhZ2VzICkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCBhbmd1bGFyLnRvSnNvbiggcmVzdWx0Lm1lc3NhZ2VzICkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCByZWFzb24gKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCAnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcgJyArIHJlYXNvbiApO1xuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2VuZXJhdGVEYXNoYm9hcmQgPSBmdW5jdGlvbiAoIGNvbnRleHQsIGRlc2lnbklkLCByZXN1bHRJZHMgKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogZGVzaWduSWQsXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uU2VydmVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRJRHM6IHJlc3VsdElkcy5qb2luKCAnOycgKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBKU09OLnN0cmluZ2lmeSggY29uZmlnICkgKTtcbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKCBjb250ZXh0LCAnR2VuZXJhdGVEYXNoYm9hcmQnLCBjb25maWcgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIHJlc3VsdCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdExpZ2h0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogcmVzdWx0LnN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnRpZmFjdHNIdG1sOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiByZXN1bHQubWVzc2FnZXNcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdSZXN1bHQnLCByZXN1bHQgKTtcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luU2VydmljZS5nZXRQbHVnaW5BcnRpZmFjdHNIdG1sKCByZXN1bHQuYXJ0aWZhY3RzIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGFydGlmYWN0c0h0bWwgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlnaHQuYXJ0aWZhY3RzSHRtbCA9IGFydGlmYWN0c0h0bWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggcmVzdWx0TGlnaHQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICBjYXRjaCAoIGZ1bmN0aW9uICggcmVhc29uICkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nLCAnICsgcmVhc29uICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMud2F0Y2hEZXNpZ25Ob2RlID0gZnVuY3Rpb24gKCBwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIgKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hEZXNpZ24nLFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgbWV0YTogbnVsbCwgLy8gTUVUQSBub2RlcyAtIG5lZWRlZCB3aGVuIGNyZWF0aW5nIG5ldyBub2Rlcy4uLlxuICAgICAgICAgICAgICAgICAgICBkZXNpZ246IHt9IC8vIGRlc2lnbiB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+LCBub2RlIDxOb2RlT2JqPn1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ25hbWUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoICdJTkZPJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld05hbWUgIT09IGRhdGEuZGVzaWduLm5hbWUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbi5uYW1lID0gbmV3TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggbmV3RGVzYyAhPT0gZGF0YS5kZXNpZ24uZGVzY3JpcHRpb24gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbi5kZXNjcmlwdGlvbiA9IG5ld0Rlc2M7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIGhhZENoYW5nZXMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEuZGVzaWduXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uICggaWQgKSB7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndW5sb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXSA9IHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF0gfHwge307XG4gICAgICAgICAgICB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdWyBjb250ZXh0LnJlZ2lvbklkIF0gPSBjb250ZXh0O1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKCBjb250ZXh0IClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBtZXRhICkge1xuICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZSggY29udGV4dCwgZGVzaWduSWQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGVzaWduTm9kZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm1ldGEgPSBtZXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGVzaWduSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGRlc2lnbk5vZGUuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2lnbk5vZGUuZ2V0QXR0cmlidXRlKCAnSU5GTycgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogZGVzaWduTm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vblVwZGF0ZSggb25VcGRhdGUgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLm9uVW5sb2FkKCBvblVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgV2F0Y2hlcyBhbGwgY29udGFpbmVycyAoZXhpc3RlbmNlIGFuZCB0aGVpciBhdHRyaWJ1dGVzKSBvZiBhIHdvcmtzcGFjZS5cbiAgICAgICAgICogQHBhcmFtIHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB3b3Jrc3BhY2VJZFxuICAgICAgICAgKiBAcGFyYW0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLiBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLmRlc2lnbnMuXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaERlc2lnbnMgPSBmdW5jdGlvbiAoIHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lciApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaERlc2lnbnMnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgZGVzaWduczoge30gLy8gZGVzaWduIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz59XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSA9IGZ1bmN0aW9uICggaWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOYW1lID0gdGhpcy5nZXRBdHRyaWJ1dGUoICduYW1lJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3RGVzYyA9IHRoaXMuZ2V0QXR0cmlidXRlKCAnSU5GTycgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdOYW1lICE9PSBkYXRhLmRlc2lnbnNbIGlkIF0ubmFtZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZGVzaWduc1sgaWQgXS5uYW1lID0gbmV3TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggbmV3RGVzYyAhPT0gZGF0YS5kZXNpZ25zWyBpZCBdLmRlc2NyaXB0aW9uICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ25zWyBpZCBdLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggaGFkQ2hhbmdlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndXBkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YS5kZXNpZ25zWyBpZCBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uICggaWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhLmRlc2lnbnNbIGlkIF07XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndW5sb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uICggZm9sZGVyTm9kZSwgbWV0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggY2hpbGRyZW4gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuWyBpIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY2hpbGROb2RlLmlzTWV0YVR5cGVPZiggbWV0YS5BRE1Gb2xkZXIgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKCB3YXRjaEZyb21Gb2xkZXJSZWMoIGNoaWxkTm9kZSwgbWV0YSApICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGNoaWxkTm9kZS5pc01ldGFUeXBlT2YoIG1ldGEuQ29udGFpbmVyICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25JZCA9IGNoaWxkTm9kZS5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5kZXNpZ25zWyBkZXNpZ25JZCBdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBkZXNpZ25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSggJ0lORk8nIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQoIG9uVW5sb2FkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUoIG9uVXBkYXRlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoIGZ1bmN0aW9uICggbmV3Q2hpbGQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbmV3Q2hpbGQuaXNNZXRhVHlwZU9mKCBtZXRhLkFETUZvbGRlciApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKCBuZXdDaGlsZCwgbWV0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBuZXdDaGlsZC5pc01ldGFUeXBlT2YoIG1ldGEuQ29udGFpbmVyICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25JZCA9IG5ld0NoaWxkLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmRlc2lnbnNbIGRlc2lnbklkIF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRlc2lnbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSggJ25hbWUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSggJ0lORk8nIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZCggb25VbmxvYWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVXBkYXRlKCBvblVwZGF0ZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZGVzaWduSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YS5kZXNpZ25zWyBkZXNpZ25JZCBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcXVldWVMaXN0Lmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbCggcXVldWVMaXN0IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdID0gd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXSB8fCB7fTtcbiAgICAgICAgICAgIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF1bIGNvbnRleHQucmVnaW9uSWQgXSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoIGNvbnRleHQgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG1ldGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKCBjb250ZXh0LCB3b3Jrc3BhY2VJZCApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCB3b3Jrc3BhY2VOb2RlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggY2hpbGRyZW4gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuWyBpIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKCBtZXRhLkFETUZvbGRlciApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCggd2F0Y2hGcm9tRm9sZGVyUmVjKCBjaGlsZE5vZGUsIG1ldGEgKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZCggZnVuY3Rpb24gKCBuZXdDaGlsZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld0NoaWxkLmlzTWV0YVR5cGVPZiggbWV0YS5BRE1Gb2xkZXIgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKCBuZXdDaGlsZCwgbWV0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcXVldWVMaXN0Lmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbCggcXVldWVMaXN0IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogIFdhdGNoZXMgYWxsIGNvbnRhaW5lcnMgKGV4aXN0ZW5jZSBhbmQgdGhlaXIgYXR0cmlidXRlcykgb2YgYSB3b3Jrc3BhY2UuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGVzaWduSWRcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud2F0Y2hOYnJPZkNvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKCBwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIgKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOYnJPZkNvbmZpZ3VyYXRpb25zXycgKyBkZXNpZ25JZCxcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRzOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnM6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiAwXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdhdGNoQ29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uICggY2ZnTm9kZSwgbWV0YSwgd2FzQ3JlYXRlZCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNmZ0RlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdE9uVW5sb2FkID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLnJlc3VsdHMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3VubG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAvLyBDb3VudCB0aGlzIHNldCBhbmQgYWRkIGFuIHVubG9hZCBoYW5kbGUuXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMuY29uZmlndXJhdGlvbnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB3YXNDcmVhdGVkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2ZnTm9kZS5nZXRJZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZS5vblVubG9hZCggZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMuY29uZmlndXJhdGlvbnMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndW5sb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICBjZmdOb2RlLmxvYWRDaGlsZHJlbigpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBjaGlsZHJlbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuWyBpIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY2hpbGROb2RlLmlzTWV0YVR5cGVPZiggbWV0YS5SZXN1bHQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMucmVzdWx0cyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLm9uVW5sb2FkKCByZXN1bHRPblVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNmZ05vZGUub25OZXdDaGlsZExvYWRlZCggZnVuY3Rpb24gKCBuZXdDaGlsZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdDaGlsZC5pc01ldGFUeXBlT2YoIG1ldGEuUmVzdWx0ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLnJlc3VsdHMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IG5ld0NoaWxkLmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKCByZXN1bHRPblVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNmZ0RlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2ZnRGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdhdGNoQ29uZmlndXJhdGlvblNldCA9IGZ1bmN0aW9uICggc2V0Tm9kZSwgbWV0YSwgd2FzQ3JlYXRlZCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNldERlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ291bnQgdGhpcyBzZXQgYW5kIGFkZCBhbiB1bmxvYWQgaGFuZGxlLlxuICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ZXJzLnNldHMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB3YXNDcmVhdGVkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc2V0Tm9kZS5nZXRJZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2V0Tm9kZS5vblVubG9hZCggZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnRlcnMuc2V0cyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd1bmxvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIHNldE5vZGUubG9hZENoaWxkcmVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGNoaWxkcmVuICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuWyBpIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY2hpbGROb2RlLmlzTWV0YVR5cGVPZiggbWV0YS5EZXNlcnRDb25maWd1cmF0aW9uICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCggd2F0Y2hDb25maWd1cmF0aW9uKCBjaGlsZE5vZGUsIG1ldGEgKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldE5vZGUub25OZXdDaGlsZExvYWRlZCggZnVuY3Rpb24gKCBuZXdDaGlsZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdDaGlsZC5pc01ldGFUeXBlT2YoIG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvbiApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hDb25maWd1cmF0aW9uKCBuZXdDaGlsZCwgbWV0YSwgdHJ1ZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcXVldWVMaXN0Lmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0RGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbCggcXVldWVMaXN0IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0RGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0RGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdID0gd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXSB8fCB7fTtcbiAgICAgICAgICAgIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF1bIGNvbnRleHQucmVnaW9uSWQgXSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoIGNvbnRleHQgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG1ldGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKCBjb250ZXh0LCBkZXNpZ25JZCApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkZXNpZ25Ob2RlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnbk5vZGUubG9hZENoaWxkcmVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggY2hpbGRyZW4gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuWyBpIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKCBtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2goIHdhdGNoQ29uZmlndXJhdGlvblNldCggY2hpbGROb2RlLCBtZXRhICkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLm9uTmV3Q2hpbGRMb2FkZWQoIGZ1bmN0aW9uICggbmV3Q2hpbGQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdDaGlsZC5pc01ldGFUeXBlT2YoIG1ldGEuRGVzZXJ0Q29uZmlndXJhdGlvblNldCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaENvbmZpZ3VyYXRpb25TZXQoIG5ld0NoaWxkLCBtZXRhLCB0cnVlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBxdWV1ZUxpc3QubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKCBxdWV1ZUxpc3QgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgV2F0Y2hlcyBhIGRlc2lnbihzcGFjZSkgdy5yLnQuIGludGVyZmFjZXMuXG4gICAgICAgICAqIEBwYXJhbSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxuICAgICAgICAgKiBAcGFyYW0gZGVzaWduSWRcbiAgICAgICAgICogQHBhcmFtIHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud2F0Y2hJbnRlcmZhY2VzID0gZnVuY3Rpb24gKCBwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIgKSB7XG4gICAgICAgICAgICByZXR1cm4gYmFzZUN5UGh5U2VydmljZS53YXRjaEludGVyZmFjZXMoIHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBkZXNpZ25JZCwgdXBkYXRlTGlzdGVuZXIgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGZ1bGwgaGllcmFyY2h5IG9mIGEgZGVzaWduIHcuci50LiBjb250YWluZXJzIGFuZCBjb21wb25lbnRzLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGRlc2lnbklkIC0gcGF0aCB0byByb290IGNvbnRhaW5lci5cbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud2F0Y2hEZXNpZ25TdHJ1Y3R1cmUgPSBmdW5jdGlvbiAoIHBhcmVudENvbnRleHQsIGRlc2lnbklkICkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoRGVzaWduU3RydWN0dXJlXycgKyBkZXNpZ25JZCxcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIHJvb3RJZDogZGVzaWduSWQsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcnM6IHt9LCAvLyBjb250YWluZXI6IHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBwYXJlbnRJZDogPHN0cmluZz4sIHR5cGU6IDxzdHJpbmc+LFxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBzdWJDb250YWluZXJzOiB7aWQ6PHN0cmluZz46IDxjb250YWluZXI+fSxcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgY29tcG9uZW50czogICAge2lkOjxzdHJpbmc+OiA8Y29udGFpbmVyPn19XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IHt9IC8vIGNvbXBvbmVudDoge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIHBhcmVudElkOiA8c3RyaW5nPixcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgLCBhdm1JZDogPHN0cmluZz4gfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZ2V0Q29tcG9uZW50SW5mbyA9IGZ1bmN0aW9uICggbm9kZSwgcGFyZW50SWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogbm9kZS5nZXRJZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbm9kZS5nZXRBdHRyaWJ1dGUoICduYW1lJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50SWQ6IHBhcmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXZtSWQ6IG5vZGUuZ2V0QXR0cmlidXRlKCAnSUQnIClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUNvbnRhaW5lclJlYyA9IGZ1bmN0aW9uICggY29udGFpbmVyTm9kZSwgcm9vdENvbnRhaW5lciwgbWV0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyTm9kZS5sb2FkQ2hpbGRyZW4oKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggY2hpbGRyZW4gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjb250YWluZXJOb2RlLmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb250YWluZXJOb2RlLmdldEF0dHJpYnV0ZSggJ25hbWUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBjb250YWluZXJOb2RlLmdldEF0dHJpYnV0ZSggJ1R5cGUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJDb250YWluZXJzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RDb250YWluZXIuc3ViQ29udGFpbmVyc1sgY29udGFpbmVyTm9kZS5nZXRJZCgpIF0gPSBjb250YWluZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb250YWluZXJzWyBjb250YWluZXJOb2RlLmdldElkKCkgXSA9IGNvbnRhaW5lcjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuWyBpIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY2hpbGROb2RlLmlzTWV0YVR5cGVPZiggbWV0YS5Db250YWluZXIgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKCB3YXRjaEZyb21Db250YWluZXJSZWMoIGNoaWxkTm9kZSwgY29udGFpbmVyLCBtZXRhICkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggY2hpbGROb2RlLmlzTWV0YVR5cGVPZiggbWV0YS5BVk1Db21wb25lbnRNb2RlbCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50ID0gZ2V0Q29tcG9uZW50SW5mbyggY2hpbGROb2RlLCBjb250YWluZXIuaWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jb21wb25lbnRzWyBjaGlsZE5vZGUuZ2V0SWQoKSBdID0gY29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzWyBjaGlsZE5vZGUuZ2V0SWQoKSBdID0gY29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tQ29udGFpbmVyUmVjKG5ld0NoaWxkLCBjb250YWluZXIsIG1ldGEpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKG1ldGEuQVZNQ29tcG9uZW50TW9kZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcltjaGlsZE5vZGUuZ2V0SWQoKV0gPSBnZXRDb21wb25lbnRJbmZvKGNoaWxkTm9kZSwgY29udGFpbmVyLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoe2lkOiBuZXdDaGlsZC5nZXRJZCgpLCB0eXBlOiAnbG9hZCcsIGRhdGE6IGRhdGF9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcXVldWVMaXN0Lmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbCggcXVldWVMaXN0IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdID0gd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXSB8fCB7fTtcbiAgICAgICAgICAgIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF1bIGNvbnRleHQucmVnaW9uSWQgXSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoIGNvbnRleHQgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG1ldGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKCBjb250ZXh0LCBkZXNpZ25JZCApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCByb290Tm9kZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290Tm9kZS5sb2FkQ2hpbGRyZW4oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBjaGlsZHJlbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290Q29udGFpbmVyID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogcm9vdE5vZGUuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCAnVHlwZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViQ29udGFpbmVyczoge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVyc1sgcm9vdENvbnRhaW5lci5pZCBdID0gcm9vdENvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVyc1sgcm9vdENvbnRhaW5lci5pZCBdID0gcm9vdENvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5bIGkgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGNoaWxkTm9kZS5pc01ldGFUeXBlT2YoIG1ldGEuQ29udGFpbmVyICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKCB3YXRjaEZyb21Db250YWluZXJSZWMoIGNoaWxkTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RDb250YWluZXIsIG1ldGEgKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGNoaWxkTm9kZS5pc01ldGFUeXBlT2YoIG1ldGEuQVZNQ29tcG9uZW50TW9kZWwgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50ID0gZ2V0Q29tcG9uZW50SW5mbyggY2hpbGROb2RlLCByb290Q29udGFpbmVyLmlkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RDb250YWluZXIuY29tcG9uZW50c1sgY2hpbGROb2RlLmdldElkKCkgXSA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzWyBjaGlsZE5vZGUuZ2V0SWQoKSBdID0gY29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLm9uTmV3Q2hpbGRMb2FkZWQoZnVuY3Rpb24gKG5ld0NoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0NoaWxkLmlzTWV0YVR5cGVPZihtZXRhLkNvbnRhaW5lcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tQ29udGFpbmVyUmVjKG5ld0NoaWxkLCByb290Q29udGFpbmVyLCBtZXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKHtpZDogbmV3Q2hpbGQuZ2V0SWQoKSwgdHlwZTogJ2xvYWQnLCBkYXRhOiBkYXRhfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGROb2RlLmlzTWV0YVR5cGVPZihtZXRhLkFWTUNvbXBvbmVudE1vZGVsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290Q29udGFpbmVyLmNvbXBvbmVudHNbY2hpbGROb2RlLmdldElkKCldID0gZ2V0Q29tcG9uZW50SW5mbyhjaGlsZE5vZGUsIHJvb3RDb250YWluZXIuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcih7aWQ6IG5ld0NoaWxkLmdldElkKCksIHR5cGU6ICdsb2FkJywgZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcXVldWVMaXN0Lmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbCggcXVldWVMaXN0IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogIFdhdGNoZXMgdGhlIGdlbmVyYXRlZCBEZXNlcnRDb25maWd1cmF0aW9uU2V0cyBpbnNpZGUgYSBEZXNpZ24uXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGVzaWduSWQgLSBwYXRoIHRvIGRlc2lnbiBvZiB3aGljaCB0byB3YXRjaC5cbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLlxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud2F0Y2hDb25maWd1cmF0aW9uU2V0cyA9IGZ1bmN0aW9uICggcGFyZW50Q29udGV4dCwgZGVzaWduSWQsIHVwZGF0ZUxpc3RlbmVyICkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29uZmlndXJhdGlvblNldHNfJyArIGRlc2lnbklkLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvblNldHM6IHt9IC8vY29uZmlndXJhdGlvblNldCB7aWQ6IDxzdHJpbmc+LCBuYW1lOiA8c3RyaW5nPiwgZGVzY3JpcHRpb246IDxzdHJpbmc+fVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF0gPSB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdIHx8IHt9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXVsgcmVnaW9uSWQgXSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoIGNvbnRleHQgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG1ldGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKCBjb250ZXh0LCBkZXNpZ25JZCApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkZXNpZ25Ob2RlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubmFtZSA9IGRlc2lnbk5vZGUuZ2V0QXR0cmlidXRlKCAnbmFtZScgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25Ob2RlLmxvYWRDaGlsZHJlbiggY29udGV4dCApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGNoaWxkTm9kZXMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ25hbWUnICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbmV3TmFtZSAhPT0gZGF0YS5jb25maWd1cmF0aW9uU2V0c1sgaWQgXS5uYW1lICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25maWd1cmF0aW9uU2V0c1sgaWQgXS5uYW1lID0gbmV3TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndXBkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5jb25maWd1cmF0aW9uU2V0c1sgaWQgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd1bmxvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNoaWxkTm9kZXMubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjaGlsZE5vZGVzWyBpIF0uaXNNZXRhVHlwZU9mKCBtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IGNoaWxkTm9kZXNbIGkgXS5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbmZpZ3VyYXRpb25TZXRzWyBjaGlsZElkIF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZXNbIGkgXS5nZXRBdHRyaWJ1dGUoICduYW1lJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGNoaWxkTm9kZXNbIGkgXS5nZXRBdHRyaWJ1dGUoICdJTkZPJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZXNbIGkgXS5vblVwZGF0ZSggb25VcGRhdGUgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2Rlc1sgaSBdLm9uVW5sb2FkKCBvblVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduTm9kZS5vbk5ld0NoaWxkTG9hZGVkKCBmdW5jdGlvbiAoIG5ld05vZGUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdOb2RlLmlzTWV0YVR5cGVPZiggbWV0YS5EZXNlcnRDb25maWd1cmF0aW9uU2V0ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQgPSBuZXdOb2RlLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29uZmlndXJhdGlvblNldHNbIGNoaWxkSWQgXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Tm9kZS5nZXRBdHRyaWJ1dGUoICduYW1lJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG5ld05vZGUuZ2V0QXR0cmlidXRlKCAnSU5GTycgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlLm9uVXBkYXRlKCBvblVwZGF0ZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlLm9uVW5sb2FkKCBvblVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBXYXRjaGVzIHRoZSBnZW5lcmF0ZWQgRGVzZXJ0Q29uZmlndXJhdGlvbnMgaW5zaWRlIGEgRGVzZXJ0Q29uZmlndXJhdGlvblNldHMuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29uZmlndXJhdGlvblNldElkIC0gcGF0aCB0byBEZXNlcnRDb25maWd1cmF0aW9uU2V0IG9mIHdoaWNoIHRvIHdhdGNoLlxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXG4gICAgICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJldHVybnMgZGF0YSB3aGVuIHJlc29sdmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy53YXRjaENvbmZpZ3VyYXRpb25zID0gZnVuY3Rpb24gKCBwYXJlbnRDb250ZXh0LCBjb25maWd1cmF0aW9uU2V0SWQsIHVwZGF0ZUxpc3RlbmVyICkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoQ29uZmlndXJhdGlvbnNfJyArIGNvbmZpZ3VyYXRpb25TZXRJZCxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zOiB7fSAvL2NvbmZpZ3VyYXRpb24ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGFsdGVybmF0aXZlQXNzaWdubWVudHM6IDxzdHJpbmc+fVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF0gPSB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdIHx8IHt9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXVsgcmVnaW9uSWQgXSA9IGNvbnRleHQ7XG5cbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2RlcyggY29udGV4dCApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggbWV0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoIGNvbnRleHQsIGNvbmZpZ3VyYXRpb25TZXRJZCApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBjZmdTZXROb2RlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNmZ1NldE5vZGUubG9hZENoaWxkcmVuKCBjb250ZXh0IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggY2hpbGROb2RlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0FsdEFzcyA9IHRoaXMuZ2V0QXR0cmlidXRlKCAnQWx0ZXJuYXRpdmVBc3NpZ25tZW50cycgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld05hbWUgIT09IGRhdGEuY29uZmlndXJhdGlvbnNbIGlkIF0ubmFtZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29uZmlndXJhdGlvbnNbIGlkIF0ubmFtZSA9IG5ld05hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld0FsdEFzcyAhPT0gZGF0YS5jb25maWd1cmF0aW9uc1sgaWQgXS5hbHRlcm5hdGl2ZUFzc2lnbm1lbnRzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25maWd1cmF0aW9uc1sgaWQgXS5hbHRlcm5hdGl2ZUFzc2lnbm1lbnRzID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdBbHRBc3M7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggaGFkQ2hhbmdlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndXBkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YS5jb25maWd1cmF0aW9uc1sgaWQgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGRhdGEuY29uZmlndXJhdGlvbnNbIGlkIF0gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS5jb25maWd1cmF0aW9uc1sgaWQgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3VubG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZElkID0gY2hpbGROb2Rlc1sgaSBdLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjaGlsZE5vZGVzWyBpIF0uaXNNZXRhVHlwZU9mKCBtZXRhLkRlc2VydENvbmZpZ3VyYXRpb24gKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25maWd1cmF0aW9uc1sgY2hpbGRJZCBdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGVzWyBpIF0uZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlQXNzaWdubWVudHM6IGNoaWxkTm9kZXNbIGkgXS5nZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0FsdGVybmF0aXZlQXNzaWdubWVudHMnIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2Rlc1sgaSBdLm9uVXBkYXRlKCBvblVwZGF0ZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGVzWyBpIF0ub25VbmxvYWQoIG9uVW5sb2FkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZmdTZXROb2RlLm9uTmV3Q2hpbGRMb2FkZWQoIGZ1bmN0aW9uICggbmV3Tm9kZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld05vZGUuaXNNZXRhVHlwZU9mKCBtZXRhLkRlc2VydENvbmZpZ3VyYXRpb24gKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IG5ld05vZGUuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb25maWd1cmF0aW9uc1sgY2hpbGRJZCBdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNoaWxkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuZXdOb2RlLmdldEF0dHJpYnV0ZSggJ25hbWUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZUFzc2lnbm1lbnRzOiBuZXdOb2RlLmdldEF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQWx0ZXJuYXRpdmVBc3NpZ25tZW50cycgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlLm9uVXBkYXRlKCBvblVwZGF0ZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOb2RlLm9uVW5sb2FkKCBvblVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YS5jb25maWd1cmF0aW9uc1sgY2hpbGRJZCBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgV2F0Y2hlcyB0aGUgZ2VuZXJhdGVkIERlc2VydENvbmZpZ3VyYXRpb25TZXRzIGluc2lkZSBhIERlc2lnbi5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWd1cmF0aW9uIC0gQ29uZmlndXJhdGlvbiBvZiB3aGljaCB0byB3YXRjaC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbmZpZ3VyYXRpb24uaWQgLSBwYXRoIHRvIENvbmZpZ3VyYXRpb24gb2Ygd2hpY2ggdG8gd2F0Y2guXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gaW52b2tlZCB3aGVuIHRoZXJlIGFyZSAoZmlsdGVyZWQpIGNoYW5nZXMgaW4gZGF0YS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYXBwZW5kV2F0Y2hSZXN1bHRzID0gZnVuY3Rpb24gKCBwYXJlbnRDb250ZXh0LCBjb25maWd1cmF0aW9uICkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoUmVzdWx0c18nICsgY29uZmlndXJhdGlvbi5pZCxcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBkYjogcGFyZW50Q29udGV4dC5kYixcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXSA9IHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF0gfHwge307XG4gICAgICAgICAgICB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdWyByZWdpb25JZCBdID0gY29udGV4dDtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucmVnaW9uSWQgPSByZWdpb25JZDtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucmVzdWx0cyA9IHt9O1xuXG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoIGNvbnRleHQgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG1ldGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKCBjb250ZXh0LCBjb25maWd1cmF0aW9uLmlkIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGNmZ05vZGUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZS5sb2FkQ2hpbGRyZW4oIGNvbnRleHQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBjaGlsZE5vZGVzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNSZXN1bHRzID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjb25maWd1cmF0aW9uLnJlc3VsdHNbIGlkIF0gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3VyYXRpb24ucmVzdWx0c1sgaWQgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNoaWxkTm9kZXMubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IGNoaWxkTm9kZXNbIGkgXS5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY2hpbGROb2Rlc1sgaSBdLmlzTWV0YVR5cGVPZiggbWV0YS5SZXN1bHQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5yZXN1bHRzWyBjaGlsZElkIF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogY2hpbGRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9uYW1lOiBjaGlsZE5vZGVzW2ldLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NoaWxkTm9kZXNbaV0ub25VcGRhdGUob25VcGRhdGUpOyBUT0RPOiBXaGVuIGF0dHJpYnV0ZXMgYXJlIHdhdGNoIGFkZCB0aGlzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGVzWyBpIF0ub25VbmxvYWQoIG9uVW5sb2FkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc1Jlc3VsdHMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZS5vbk5ld0NoaWxkTG9hZGVkKCBmdW5jdGlvbiAoIG5ld05vZGUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdOb2RlLmlzTWV0YVR5cGVPZiggbWV0YS5SZXN1bHQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJZCA9IG5ld05vZGUuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucmVzdWx0c1sgY2hpbGRJZCBdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjaGlsZElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBoYXNSZXN1bHRzICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2FsbFNhdmVEZXNlcnRDb25maWd1cmF0aW9ucyA9IGZ1bmN0aW9uICggY29udGV4dCwgc2V0TmFtZSwgc2V0RGVzYywgY29uZmlndXJhdGlvbnMsIGRlc2lnbklkICkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICBjb25maWcgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZU5vZGU6IGRlc2lnbklkLFxuICAgICAgICAgICAgICAgICAgICBydW5PblNlcnZlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbkNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0RGF0YTogYW5ndWxhci50b0pzb24oIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBzZXROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzZXREZXNjIHx8ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9ICksXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uczogYW5ndWxhci50b0pzb24oIGNvbmZpZ3VyYXRpb25zIClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKCBjb250ZXh0LCAnU2F2ZURlc2VydENvbmZpZ3VyYXRpb25zJywgY29uZmlnIClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCByZXN1bHQgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggcmVzdWx0LnN1Y2Nlc3MgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCByZWFzb24gKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCAnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsICcgKyByZWFzb24gKTtcbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zYXZlQ29uZmlndXJhdGlvblNldCA9IGZ1bmN0aW9uICggc2V0TmFtZSwgc2V0RGVzYywgY29uZmlndXJhdGlvbnMsIGRlc2lnbk5vZGUsIG1ldGEgKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBkZXNpZ25Ob2RlLmNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5jcmVhdGVOb2RlKCBjb250ZXh0LCBkZXNpZ25Ob2RlLCBtZXRhLkRlc2VydENvbmZpZ3VyYXRpb25TZXQsXG4gICAgICAgICAgICAgICAgJ3dlYi1jeXBoeSBzYXZlQ29uZmlndXJhdGlvblNldCcgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIHNldE5vZGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb3VudGVyID0gY29uZmlndXJhdGlvbnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29uZmlnID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjZmdOb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5jcmVhdGVOb2RlKCBjb250ZXh0LCBzZXROb2RlLCBtZXRhLkRlc2VydENvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd3ZWItY3lwaHkgc2F2ZUNvbmZpZ3VyYXRpb25TZXQnIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggbmV3Tm9kZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuYW1lID0gY29uZmlndXJhdGlvbnNbIGNvdW50ZXIgXS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2ZnTm9kZSA9IG5ld05vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2ZnTm9kZS5zZXRBdHRyaWJ1dGUoICduYW1lJywgbmFtZSwgJ3dlYi1jeXBoeSBzZXQgbmFtZSB0byAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFhU3RyID0gSlNPTi5zdHJpbmdpZnkoIGNvbmZpZ3VyYXRpb25zWyBjb3VudGVyIF0uYWx0ZXJuYXRpdmVBc3NpZ25tZW50cyApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNmZ05vZGUuc2V0QXR0cmlidXRlKCAnQWx0ZXJuYXRpdmVBc3NpZ25tZW50cycsIGFhU3RyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd3ZWItY3lwaHkgc2V0IEFsdGVybmF0aXZlQXNzaWdubWVudHMgdG8gJyArIGFhU3RyICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjb3VudGVyID4gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVDb25maWcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCByZWFzb24gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggJ1Byb2JsZW1zIGNyZWF0aW5nIGNvbmZpZ3VyYXRpb25zIG5vZGVzJyArIHJlYXNvbi50b1N0cmluZygpICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHNldE5vZGUuc2V0QXR0cmlidXRlKCAnbmFtZScsIHNldE5hbWUsICd3ZWItY3lwaHkgc2V0IG5hbWUgdG8gJyArIHNldE5hbWUgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHNldERlc2MgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldE5vZGUuc2V0QXR0cmlidXRlKCAnSU5GTycsIHNldERlc2MsICd3ZWItY3lwaHkgc2V0IElORk8gdG8gJyArIHNldERlc2MgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGNvdW50ZXIgPiAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZUNvbmZpZygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoICdObyBjb25maWd1cmF0aW9ucyBnaXZlbiEnICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGNvdW50ZXIgPiAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQ29uZmlnKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoICdObyBjb25maWd1cmF0aW9ucyBnaXZlbiEnICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsZWFuVXBBbGxSZWdpb25zID0gZnVuY3Rpb24gKCBwYXJlbnRDb250ZXh0ICkge1xuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwQWxsUmVnaW9ucyggd2F0Y2hlcnMsIHBhcmVudENvbnRleHQgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcFJlZ2lvbi5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2xlYW5VcFJlZ2lvbiA9IGZ1bmN0aW9uICggcGFyZW50Q29udGV4dCwgcmVnaW9uSWQgKSB7XG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24oIHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCByZWdpb25JZCApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZWUgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2hlciA9IGZ1bmN0aW9uICggcGFyZW50Q29udGV4dCwgZm4gKSB7XG4gICAgICAgICAgICBiYXNlQ3lQaHlTZXJ2aWNlLnJlZ2lzdGVyV2F0Y2hlciggd2F0Y2hlcnMsIHBhcmVudENvbnRleHQsIGZuICk7XG4gICAgICAgIH07XG4gICAgfSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBXZWJHTUVHbG9iYWwqL1xuXG4vKipcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoICdjeXBoeS5zZXJ2aWNlcycgKVxuICAgIC5zZXJ2aWNlKCAnZXhlY3V0b3JTZXJ2aWNlJywgZnVuY3Rpb24gKCAkcSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXIgZXhlY3V0b3JDbGllbnQgPSBuZXcgV2ViR01FR2xvYmFsLmNsYXNzZXMuRXhlY3V0b3JDbGllbnQoKTtcblxuICAgICAgICB0aGlzLmNyZWF0ZUpvYiA9IGZ1bmN0aW9uICggam9iRGF0YSApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICBleGVjdXRvckNsaWVudC5jcmVhdGVKb2IoIGpvYkRhdGEsIGZ1bmN0aW9uICggZXJyLCBqb2JJbmZvICkge1xuICAgICAgICAgICAgICAgIGlmICggZXJyICkge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoIGVyciApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIGpvYkluZm8gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0SW5mbyA9IGZ1bmN0aW9uICggam9iSGFzaCApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICBleGVjdXRvckNsaWVudC5nZXRJbmZvKCBqb2JIYXNoLCBmdW5jdGlvbiAoIGVyciwgam9iSW5mbyApIHtcbiAgICAgICAgICAgICAgICBpZiAoIGVyciApIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCBlcnIgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBqb2JJbmZvICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldFdvcmtlcnNJbmZvID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIGV4ZWN1dG9yQ2xpZW50LmdldFdvcmtlcnNJbmZvKCBmdW5jdGlvbiAoIGVyciwgcmVzcG9uc2UgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggZXJyICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggcmVzcG9uc2UgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgV2ViR01FR2xvYmFsLCBjb25zb2xlKi9cblxuXG4vKipcbiAqIEBhdXRob3IgcG1laWplciAvIGh0dHBzOi8vZ2l0aHViLmNvbS9wbWVpamVyXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoICdjeXBoeS5zZXJ2aWNlcycgKVxuICAgIC5zZXJ2aWNlKCAnZmlsZVNlcnZpY2UnLCBmdW5jdGlvbiAoICRxICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGJsb2JDbGllbnQgPSBuZXcgV2ViR01FR2xvYmFsLmNsYXNzZXMuQmxvYkNsaWVudCgpO1xuXG4gICAgICAgIC8vVE9ETzogQ29uc2lkZXIgbWFraW5nIGFuIEFydGlmYWN0ICdDbGFzcycuXG4gICAgICAgIHRoaXMuY3JlYXRlQXJ0aWZhY3QgPSBmdW5jdGlvbiAoIG5hbWUgKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvYkNsaWVudC5jcmVhdGVBcnRpZmFjdCggbmFtZSApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2F2ZUFydGlmYWN0ID0gZnVuY3Rpb24gKCBhcnRpZmFjdCApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICBhcnRpZmFjdC5zYXZlKCBmdW5jdGlvbiAoIGVyciwgYXJ0aWVIYXNoICkge1xuICAgICAgICAgICAgICAgIGlmICggZXJyICkge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoIGVyciApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIGFydGllSGFzaCApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRBcnRpZmFjdCA9IGZ1bmN0aW9uICggaGFzaCApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICBibG9iQ2xpZW50LmdldEFydGlmYWN0KCBoYXNoLCBmdW5jdGlvbiAoIGVyciwgYXJ0aWZhY3QgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggZXJyICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgge1xuICAgICAgICAgICAgICAgICAgICBhcnRpZmFjdDogYXJ0aWZhY3QsXG4gICAgICAgICAgICAgICAgICAgIGhhc2g6IGhhc2hcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmFkZEZpbGVUb0FydGlmYWN0ID0gZnVuY3Rpb24gKCBhcnRpZmFjdCwgZmlsZU5hbWUsIGNvbnRlbnQgKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgYXJ0aWZhY3QuYWRkRmlsZSggZmlsZU5hbWUsIGNvbnRlbnQsIGZ1bmN0aW9uICggZXJyLCBoYXNoZXMgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggZXJyICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggaGFzaGVzICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkcyBtdWx0aXBsZSBmaWxlcyB0byBnaXZlbiBhcnRpZmFjdC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkRmlsZXNUb0FydGlmYWN0ID0gZnVuY3Rpb24gKCBhcnRpZmFjdCwgZmlsZXMgKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgYXJ0aWZhY3QuYWRkRmlsZXMoIGZpbGVzLCBmdW5jdGlvbiAoIGVyciwgaGFzaGVzICkge1xuICAgICAgICAgICAgICAgIGlmICggZXJyICkge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoIGVyciApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIGhhc2hlcyApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5hZGRGaWxlQXNTb2Z0TGlua1RvQXJ0aWZhY3QgPSBmdW5jdGlvbiAoIGFydGlmYWN0LCBmaWxlTmFtZSwgY29udGVudCApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgICAgIGFydGlmYWN0LmFkZEZpbGVBc1NvZnRMaW5rKCBmaWxlTmFtZSwgY29udGVudCwgZnVuY3Rpb24gKCBlcnIsIGhhc2ggKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggZXJyICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggaGFzaCApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRNZXRhZGF0YSA9IGZ1bmN0aW9uICggaGFzaCApIHtcbiAgICAgICAgICAgIC8vICAgICAgICBFeGFtcGxlIG9mIHJldHVybmVkIGRhdGEuXG4gICAgICAgICAgICAvLyAgICAgICAge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICBcIm5hbWVcIjogXCJ0YkFzc2V0LnppcFwiLFxuICAgICAgICAgICAgLy8gICAgICAgICAgICBcInNpemVcIjogMTAzODU0LFxuICAgICAgICAgICAgLy8gICAgICAgICAgICBcIm1pbWVcIjogXCJhcHBsaWNhdGlvbi96aXBcIixcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgXCJpc1B1YmxpY1wiOiBmYWxzZSxcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgXCJ0YWdzXCI6IFtdLFxuICAgICAgICAgICAgLy8gICAgICAgICAgICBcImNvbnRlbnRcIjogXCIyMzU3ZmJkNjczYmVjNmU5NTkwZWU4YmEzNGVjOGRmOGE4NWRkYWY4XCIsXG4gICAgICAgICAgICAvLyAgICAgICAgICAgIFwiY29udGVudFR5cGVcIjogXCJvYmplY3RcIixcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgXCJsYXN0TW9kaWZpZWRcIjogXCIyMDE0LTExLTA5VDAwOjIxOjIyLjAwMFpcIlxuICAgICAgICAgICAgLy8gICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICBibG9iQ2xpZW50LmdldE1ldGFkYXRhKCBoYXNoLCBmdW5jdGlvbiAoIGVyciwgbWV0YURhdGEgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggZXJyICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggbWV0YURhdGEgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0T2JqZWN0ID0gZnVuY3Rpb24gKCBoYXNoICkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIGJsb2JDbGllbnQuZ2V0T2JqZWN0KCBoYXNoLCBmdW5jdGlvbiAoIGVyciwgY29udGVudCApIHtcbiAgICAgICAgICAgICAgICBpZiAoIGVyciApIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCBlcnIgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBjb250ZW50ICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyB0aGUgZG93bmxvYWQgdXJsIGZvciB0aGUgZ2l2ZW4gaGFzaC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGhhc2ggLSBoYXNoIHRvIGJsb2IgZmlsZS5cbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gLSB0aGUgZG93bmxvYWQgdXJsIChudWxsIGlmIGhhc2ggaXMgZW1wdHkpLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXREb3dubG9hZFVybCA9IGZ1bmN0aW9uICggaGFzaCApIHtcbiAgICAgICAgICAgIHZhciB1cmw7XG4gICAgICAgICAgICBpZiAoIGhhc2ggKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gYmxvYkNsaWVudC5nZXREb3dubG9hZFVSTCggaGFzaCApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oICdObyBoYXNoIHRvIGJsb2IgZmlsZSBnaXZlbicgKTtcbiAgICAgICAgICAgICAgICB1cmwgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBmaWxlIGV4dGVuc2lvbiBvZiB0aGUgZ2l2ZW4gZmlsZW5hbWUuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZVxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIHRoZSByZXN1bHRpbmcgZmlsZSBleHRlbnNpb24uXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldEZpbGVFeHRlbnNpb24gPSBmdW5jdGlvbiAoIGZpbGVuYW1lICkge1xuICAgICAgICAgICAgdmFyIGEgPSBmaWxlbmFtZS5zcGxpdCggJy4nICk7XG4gICAgICAgICAgICBpZiAoIGEubGVuZ3RoID09PSAxIHx8ICggYVsgMCBdID09PSAnJyAmJiBhLmxlbmd0aCA9PT0gMiApICkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhLnBvcCgpXG4gICAgICAgICAgICAgICAgLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZvcm1hdHMgdGhlIHNpemUgaW50byBhIGh1bWFuIHJlYWRhYmxlIHN0cmluZy5cbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IGJ5dGVzIC0gc2l6ZSBpbiBieXRlcy5cbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBzaSAtIHJldHVybiByZXN1bHQgaW4gU0lVbml0cyBvciBub3QuXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gZm9ybWF0dGVkIGZpbGUgc2l6ZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaHVtYW5GaWxlU2l6ZSA9IGZ1bmN0aW9uICggYnl0ZXMsIHNpICkge1xuICAgICAgICAgICAgdmFyIHRocmVzaCA9IHNpID8gMTAwMCA6IDEwMjQsXG4gICAgICAgICAgICAgICAgdW5pdHMsXG4gICAgICAgICAgICAgICAgdTtcbiAgICAgICAgICAgIGlmICggYnl0ZXMgPCB0aHJlc2ggKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ5dGVzICsgJyBCJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdW5pdHMgPSBzaSA/IFsgJ2tCJywgJ01CJywgJ0dCJywgJ1RCJywgJ1BCJywgJ0VCJywgJ1pCJywgJ1lCJyBdIDogWyAnS2lCJywgJ01pQicsICdHaUInLCAnVGlCJywgJ1BpQicsXG4gICAgICAgICAgICAgICAgJ0VpQicsICdaaUInLCAnWWlCJ1xuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIHUgPSAtMTtcblxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGJ5dGVzID0gYnl0ZXMgLyB0aHJlc2g7XG4gICAgICAgICAgICAgICAgdSArPSAxO1xuICAgICAgICAgICAgfSB3aGlsZSAoIGJ5dGVzID49IHRocmVzaCApO1xuXG4gICAgICAgICAgICByZXR1cm4gYnl0ZXMudG9GaXhlZCggMSApICsgJyAnICsgdW5pdHNbIHUgXTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBXZWJDeVBoeVNwZWNpZmljIGZ1bmN0aW9ucy5cblxuICAgICAgICAvKipcbiAgICAgICAgICogVE9ETzogVGhpcyBtZXRob2Qgc2hvdWxkIHVzZSBwcm9taXNlcyBpbnRlcm5hbGx5IVxuICAgICAgICAgKiBAcGFyYW0gZmlsZXNcbiAgICAgICAgICogQHBhcmFtIHZhbGlkRXh0ZW5zaW9uc1xuICAgICAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc2F2ZURyb3BwZWRGaWxlcyA9IGZ1bmN0aW9uICggZmlsZXMsIHZhbGlkRXh0ZW5zaW9ucyApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICBjb3VudGVyID0gZmlsZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGFydGllID0gYmxvYkNsaWVudC5jcmVhdGVBcnRpZmFjdCggJ2Ryb3BwZWRGaWxlcycgKSxcbiAgICAgICAgICAgICAgICBhZGRGaWxlLFxuICAgICAgICAgICAgICAgIGFkZGVkRmlsZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBmaWxlRXh0ZW5zaW9uVG9JY29uID0ge1xuICAgICAgICAgICAgICAgICAgICAnemlwJzogJ2ZhIGZhLXB1enpsZS1waWVjZScsXG4gICAgICAgICAgICAgICAgICAgICdhZG0nOiAnZmEgZmEtY3ViZXMnLFxuICAgICAgICAgICAgICAgICAgICAnYXRtJzogJ2dseXBoaWNvbiBnbHlwaGljb24tc2F2ZWQnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmICggY291bnRlciA8PSAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggYWRkZWRGaWxlcyApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY291bnRlciA9IGZpbGVzLmxlbmd0aDtcblxuICAgICAgICAgICAgYWRkRmlsZSA9IGZ1bmN0aW9uICggZmlsZSApIHtcbiAgICAgICAgICAgICAgICB2YXIgZmlsZUV4dGVuc2lvbiA9IHNlbGYuZ2V0RmlsZUV4dGVuc2lvbiggZmlsZS5uYW1lICk7XG4gICAgICAgICAgICAgICAgaWYgKCAhdmFsaWRFeHRlbnNpb25zIHx8IHZhbGlkRXh0ZW5zaW9uc1sgZmlsZUV4dGVuc2lvbiBdICkge1xuICAgICAgICAgICAgICAgICAgICBhcnRpZS5hZGRGaWxlQXNTb2Z0TGluayggZmlsZS5uYW1lLCBmaWxlLCBmdW5jdGlvbiAoIGVyciwgaGFzaCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggZXJyICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoICdDb3VsZCBub3QgYWRkIGZpbGUgXCInICsgZmlsZS5uYW1lICsgJ1wiIHRvIGJsb2IsIGVycjogJyArIGVyciApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNvdW50ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRlZEZpbGVzLnB1c2goIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGZpbGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBmaWxlRXh0ZW5zaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IHNlbGYuaHVtYW5GaWxlU2l6ZSggZmlsZS5zaXplLCB0cnVlICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBibG9iQ2xpZW50LmdldERvd25sb2FkVVJMKCBoYXNoICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogZmlsZUV4dGVuc2lvblRvSWNvblsgZmlsZUV4dGVuc2lvbiBdIHx8ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVDb3VudGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgYWRkRmlsZSggZmlsZXNbIGkgXSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcbiAgICB9ICk7IiwiLypnbG9iYWxzIGFuZ3VsYXIsIFdlYkdNRUdsb2JhbCovXG5cblxuLyoqXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxuICovXG5cbmFuZ3VsYXIubW9kdWxlKCAnY3lwaHkuc2VydmljZXMnIClcbiAgICAuc2VydmljZSggJ3BsdWdpblNlcnZpY2UnLCBmdW5jdGlvbiAoICRxLCBkYXRhU3RvcmVTZXJ2aWNlLCBmaWxlU2VydmljZSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dFxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGx1Z2luTmFtZSAtIE5hbWUgb2YgcGx1Z2luIHRvIGV4ZWN1dGUuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSBPYmplY3Qgd2l0aCBwbHVnaW4gY29uZmlndXJhdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3Quc3RyaW5nfSBjb25maWcuYWN0aXZlTm9kZSAtIFBhdGggdG8gYWN0aXZlTm9kZS5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3QuQXJyYXkuPHN0cmluZz59IGNvbmZpZy5hY3RpdmVTZWxlY3Rpb24gLSBQYXRocyB0byBub2RlcyBpbiBhY3RpdmVTZWxlY3Rpb24uXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0LmJvb2xlYW59IGNvbmZpZy5ydW5PblNlcnZlciAtIFdoZXRoZXIgdG8gcnVuIHRoZSBwbHVnaW4gb24gdGhlIHNlcnZlciBvciBub3QuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0Lm9iamVjdH0gY29uZmlnLnBsdWdpbkNvbmZpZyAtIFBsdWdpbiBzcGVjaWZpYyBvcHRpb25zLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ydW5QbHVnaW4gPSBmdW5jdGlvbiAoIGNvbnRleHQsIHBsdWdpbk5hbWUsIGNvbmZpZyApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgZGJDb25uID0gZGF0YVN0b3JlU2VydmljZS5nZXREYXRhYmFzZUNvbm5lY3Rpb24oIGNvbnRleHQuZGIgKSxcbiAgICAgICAgICAgICAgICBpbnRlcnByZXRlck1hbmFnZXIgPSBuZXcgV2ViR01FR2xvYmFsLmNsYXNzZXMuSW50ZXJwcmV0ZXJNYW5hZ2VyKCBkYkNvbm4uY2xpZW50ICk7XG5cbiAgICAgICAgICAgIGludGVycHJldGVyTWFuYWdlci5ydW4oIHBsdWdpbk5hbWUsIGNvbmZpZywgZnVuY3Rpb24gKCByZXN1bHQgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCByZXN1bHQgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIHJlc3VsdCApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggJ05vIFJlc3VsdCB3YXMgcmV0dXJuIGZyb20gcGx1Z2luIGV4ZWN1dGlvbiEnICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldFBsdWdpbkFydGlmYWN0c0h0bWwgPSBmdW5jdGlvbiAoIGFydGllSGFzaGVzICkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICBpO1xuXG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGFydGllSGFzaGVzLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKCBmaWxlU2VydmljZS5nZXRBcnRpZmFjdCggYXJ0aWVIYXNoZXNbIGkgXSApICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggcXVldWVMaXN0Lmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCAnJyApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkcS5hbGwoIHF1ZXVlTGlzdCApXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGFydGlmYWN0c0luZm8gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3dubG9hZFVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnRpZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWZhY3RzSHRtbCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggaiA9IDA7IGogPCBhcnRpZmFjdHNJbmZvLmxlbmd0aDsgaiArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvd25sb2FkVXJsID0gZmlsZVNlcnZpY2UuZ2V0RG93bmxvYWRVcmwoIGFydGlmYWN0c0luZm9bIGogXS5oYXNoICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWVOYW1lID0gYXJ0aWZhY3RzSW5mb1sgaiBdLmFydGlmYWN0Lm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJ0aWZhY3RzSHRtbCArPSAnPGJyPiA8YSBocmVmPVwiJyArIGRvd25sb2FkVXJsICsgJ1wiPicgKyBhcnRpZU5hbWUgKyAnPC9hPic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBhcnRpZmFjdHNIdG1sICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG4gICAgfSApOyIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cblxuLyoqXG4gKiBAYXV0aG9yIHBtZWlqZXIgLyBodHRwczovL2dpdGh1Yi5jb20vcG1laWplclxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxuICovXG5cbmFuZ3VsYXIubW9kdWxlKCAnY3lwaHkuc2VydmljZXMnIClcbiAgICAuc2VydmljZSggJ3Rlc3RCZW5jaFNlcnZpY2UnLCBmdW5jdGlvbiAoICRxLCAkdGltZW91dCwgJG1vZGFsLCBub2RlU2VydmljZSwgYmFzZUN5UGh5U2VydmljZSwgcGx1Z2luU2VydmljZSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICB3YXRjaGVycyA9IHt9O1xuXG4gICAgICAgIHRoaXMuZWRpdFRlc3RCZW5jaEZuID0gZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3Blbigge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2N5cGh5LWNvbXBvbmVudHMvdGVtcGxhdGVzL1Rlc3RCZW5jaEVkaXQuaHRtbCcsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1Rlc3RCZW5jaEVkaXRDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICAvL3NpemU6IHNpemUsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbiggZnVuY3Rpb24gKCBlZGl0ZWREYXRhICkge1xuICAgICAgICAgICAgICAgIHZhciBhdHRycyA9IHt9O1xuICAgICAgICAgICAgICAgIGlmICggZWRpdGVkRGF0YS5kZXNjcmlwdGlvbiAhPT0gZGF0YS50ZXN0QmVuY2guZGVzY3JpcHRpb24gKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJzLklORk8gPSBlZGl0ZWREYXRhLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIGVkaXRlZERhdGEubmFtZSAhPT0gZGF0YS50ZXN0QmVuY2gudGl0bGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJzLm5hbWUgPSBlZGl0ZWREYXRhLm5hbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICggZWRpdGVkRGF0YS5maWxlSW5mby5oYXNoICE9PSBkYXRhLnRlc3RCZW5jaC5kYXRhLmZpbGVzICkge1xuICAgICAgICAgICAgICAgICAgICBhdHRycy5UZXN0QmVuY2hGaWxlcyA9IGVkaXRlZERhdGEuZmlsZUluZm8uaGFzaDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCBlZGl0ZWREYXRhLnBhdGggIT09IGRhdGEudGVzdEJlbmNoLmRhdGEucGF0aCApIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cnMuSUQgPSBlZGl0ZWREYXRhLnBhdGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRUZXN0QmVuY2hBdHRyaWJ1dGVzKCBkYXRhLmVkaXRDb250ZXh0LCBkYXRhLmlkLCBhdHRycyApXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ0F0dHJpYnV0ZShzKSB1cGRhdGVkJyApO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZWxldGVGbiA9IGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jeXBoeS1jb21wb25lbnRzL3RlbXBsYXRlcy9TaW1wbGVNb2RhbC5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2ltcGxlTW9kYWxDb250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUgVGVzdCBCZW5jaCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogJ1RoaXMgd2lsbCBkZWxldGUgJyArIGRhdGEubmFtZSArICcgZnJvbSB0aGUgd29ya3NwYWNlLidcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRlbGV0ZVRlc3RCZW5jaCggZGF0YS5jb250ZXh0LCBkYXRhLmlkICk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdNb2RhbCBkaXNtaXNzZWQgYXQ6ICcgKyBuZXcgRGF0ZSgpICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZXMgdGhlIHRlc3QgYmVuY2ggZnJvbSB0aGUgY29udGV4dC5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZXh0LmRiIC0gZGF0YS1iYXNlIGNvbm5lY3Rpb24uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXN0QmVuY2hJZCAtIFBhdGggdG8gZGVzaWduLXNwYWNlLlxuICAgICAgICAgKiBAcGFyYW0gW21zZ10gLSBDb21taXQgbWVzc2FnZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVsZXRlVGVzdEJlbmNoID0gZnVuY3Rpb24gKCBjb250ZXh0LCB0ZXN0QmVuY2hJZCwgbXNnICkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBtc2cgfHwgJ3Rlc3RCZW5jaFNlcnZpY2UuZGVsZXRlVGVzdEJlbmNoICcgKyB0ZXN0QmVuY2hJZDtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmRlc3Ryb3lOb2RlKCBjb250ZXh0LCB0ZXN0QmVuY2hJZCwgbWVzc2FnZSApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZXhwb3J0VGVzdEJlbmNoID0gZnVuY3Rpb24gKCAvKnRlc3RCZW5jaElkKi8pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ05vdCBpbXBsZW1lbnRlZC4nICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIGdpdmVuIGF0dHJpYnV0ZXNcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgdGVzdCBiZW5jaC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgdGVzdCBiZW5jaC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQucmVnaW9uSWQgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgdGVzdCBiZW5jaC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHRlc3RCZW5jaElkIC0gUGF0aCB0byB0ZXN0IGJlbmNoLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gYXR0cnMgLSBLZXlzIGFyZSBuYW1lcyBvZiBhdHRyaWJ1dGVzIGFuZCB2YWx1ZXMgYXJlIHRoZSB3YW50ZWQgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldFRlc3RCZW5jaEF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoIGNvbnRleHQsIHRlc3RCZW5jaElkLCBhdHRycyApIHtcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLnNldE5vZGVBdHRyaWJ1dGVzKCBjb250ZXh0LCB0ZXN0QmVuY2hJZCwgYXR0cnMgKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJ1blRlc3RCZW5jaCA9IGZ1bmN0aW9uICggY29udGV4dCwgdGVzdEJlbmNoSWQsIGNvbmZpZ3VyYXRpb25JZCApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgY29uZmlnID0ge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlOiB0ZXN0QmVuY2hJZCxcbiAgICAgICAgICAgICAgICAgICAgcnVuT25TZXJ2ZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbkNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVuOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25QYXRoOiBjb25maWd1cmF0aW9uSWRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGNvbmZpZykpO1xuICAgICAgICAgICAgcGx1Z2luU2VydmljZS5ydW5QbHVnaW4oIGNvbnRleHQsICdUZXN0QmVuY2hSdW5uZXInLCBjb25maWcgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIHJlc3VsdCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdExpZ2h0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogcmVzdWx0LnN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnRpZmFjdHNIdG1sOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiByZXN1bHQubWVzc2FnZXNcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdSZXN1bHQnLCByZXN1bHQgKTtcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luU2VydmljZS5nZXRQbHVnaW5BcnRpZmFjdHNIdG1sKCByZXN1bHQuYXJ0aWZhY3RzIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGFydGlmYWN0c0h0bWwgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0TGlnaHQuYXJ0aWZhY3RzSHRtbCA9IGFydGlmYWN0c0h0bWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggcmVzdWx0TGlnaHQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICBjYXRjaCAoIGZ1bmN0aW9uICggcmVhc29uICkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nLCAnICsgcmVhc29uICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMud2F0Y2hUZXN0QmVuY2hOb2RlID0gZnVuY3Rpb24gKCBwYXJlbnRDb250ZXh0LCB0ZXN0QmVuY2hJZCwgdXBkYXRlTGlzdGVuZXIgKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hUZXN0QmVuY2gnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgbWV0YTogbnVsbCwgLy8gTUVUQSBub2RlcyAtIG5lZWRlZCB3aGVuIGNyZWF0aW5nIG5ldyBub2Rlcy4uLlxuICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2g6IHt9IC8vIHtpZDogPHN0cmluZz4sIG5hbWU6IDxzdHJpbmc+LCBkZXNjcmlwdGlvbjogPHN0cmluZz4sIG5vZGUgPE5vZGVPYmo+fVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ0lORk8nICksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gdGhpcy5nZXRBdHRyaWJ1dGUoICdJRCcgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Jlc3VsdHMgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ1Jlc3VsdHMnICksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdGaWxlcyA9IHRoaXMuZ2V0QXR0cmlidXRlKCAnVGVzdEJlbmNoRmlsZXMnICksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdUbHN1dCA9IHRoaXMuZ2V0UG9pbnRlciggJ1RvcExldmVsU3lzdGVtVW5kZXJUZXN0JyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGxzdXRDaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmICggbmV3TmFtZSAhPT0gZGF0YS50ZXN0QmVuY2gubmFtZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLm5hbWUgPSBuZXdOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdEZXNjICE9PSBkYXRhLnRlc3RCZW5jaC5kZXNjcmlwdGlvbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLmRlc2NyaXB0aW9uID0gbmV3RGVzYztcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggbmV3UGF0aCAhPT0gZGF0YS50ZXN0QmVuY2gucGF0aCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLnBhdGggPSBuZXdQYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdSZXN1bHRzICE9PSBkYXRhLnRlc3RCZW5jaC5yZXN1bHRzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2gucmVzdWx0cyA9IG5ld1Jlc3VsdHM7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld0ZpbGVzICE9PSBkYXRhLnRlc3RCZW5jaC5maWxlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoLmZpbGVzID0gbmV3RmlsZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld1Rsc3V0ICE9PSBkYXRhLnRlc3RCZW5jaC50bHN1dElkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2gudGxzdXRJZCA9IG5ld1Rsc3V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0bHN1dENoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggaGFkQ2hhbmdlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndXBkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YS50ZXN0QmVuY2gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRsc3V0Q2hhbmdlZDogdGxzdXRDaGFuZ2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvblVubG9hZCA9IGZ1bmN0aW9uICggaWQgKSB7XG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndW5sb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXSA9IHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF0gfHwge307XG4gICAgICAgICAgICB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdWyBjb250ZXh0LnJlZ2lvbklkIF0gPSBjb250ZXh0O1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKCBjb250ZXh0IClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBtZXRhICkge1xuICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZSggY29udGV4dCwgdGVzdEJlbmNoSWQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggdGVzdEJlbmNoTm9kZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm1ldGEgPSBtZXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGVzdEJlbmNoSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHRlc3RCZW5jaE5vZGUuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRlc3RCZW5jaE5vZGUuZ2V0QXR0cmlidXRlKCAnSU5GTycgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogdGVzdEJlbmNoTm9kZS5nZXRBdHRyaWJ1dGUoICdJRCcgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogdGVzdEJlbmNoTm9kZS5nZXRBdHRyaWJ1dGUoICdSZXN1bHRzJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogdGVzdEJlbmNoTm9kZS5nZXRBdHRyaWJ1dGUoICdUZXN0QmVuY2hGaWxlcycgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGxzdXRJZDogdGVzdEJlbmNoTm9kZS5nZXRQb2ludGVyKCAnVG9wTGV2ZWxTeXN0ZW1VbmRlclRlc3QnIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50byxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogdGVzdEJlbmNoTm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoTm9kZS5vblVwZGF0ZSggb25VcGRhdGUgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hOb2RlLm9uVW5sb2FkKCBvblVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgV2F0Y2hlcyBhbGwgdGVzdC1iZW5jaGVzIChleGlzdGVuY2UgYW5kIHRoZWlyIGF0dHJpYnV0ZXMpIG9mIGEgd29ya3NwYWNlLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkIC0gUGF0aCB0byB3b3Jrc3BhY2UgdGhhdCBzaG91bGQgYmUgd2F0Y2hlZC5cbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBpbnZva2VkIHdoZW4gdGhlcmUgYXJlIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLiBEYXRhIGlzIGFuIG9iamVjdCBpbiBkYXRhLnRlc3RCZW5jaGVzLlxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud2F0Y2hUZXN0QmVuY2hlcyA9IGZ1bmN0aW9uICggcGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyICkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoVGVzdEJlbmNoZXMnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6IHBhcmVudENvbnRleHQucHJvamVjdElkLFxuICAgICAgICAgICAgICAgICAgICBicmFuY2hJZDogcGFyZW50Q29udGV4dC5icmFuY2hJZCxcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaGVzOiB7fSAvLyB0ZXN0QmVuY2gge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPixcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICBwYXRoOiA8c3RyaW5nPiwgcmVzdWx0czogPGhhc2h8c3RyaW5nPiwgZmlsZXM6IDxoYXNofHN0cmluZz4gfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VcGRhdGUgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Rlc2MgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ0lORk8nICksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gdGhpcy5nZXRBdHRyaWJ1dGUoICdJRCcgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Jlc3VsdHMgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ1Jlc3VsdHMnICksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdGaWxlcyA9IHRoaXMuZ2V0QXR0cmlidXRlKCAnVGVzdEJlbmNoRmlsZXMnICksXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWRDaGFuZ2VzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmICggbmV3TmFtZSAhPT0gZGF0YS50ZXN0QmVuY2hlc1sgaWQgXS5uYW1lICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1sgaWQgXS5uYW1lID0gbmV3TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggbmV3RGVzYyAhPT0gZGF0YS50ZXN0QmVuY2hlc1sgaWQgXS5kZXNjcmlwdGlvbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbIGlkIF0uZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdQYXRoICE9PSBkYXRhLnRlc3RCZW5jaGVzWyBpZCBdLnBhdGggKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzWyBpZCBdLnBhdGggPSBuZXdQYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdSZXN1bHRzICE9PSBkYXRhLnRlc3RCZW5jaGVzWyBpZCBdLnJlc3VsdHMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnRlc3RCZW5jaGVzWyBpZCBdLnJlc3VsdHMgPSBuZXdSZXN1bHRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdGaWxlcyAhPT0gZGF0YS50ZXN0QmVuY2hlc1sgaWQgXS5maWxlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbIGlkIF0uZmlsZXMgPSBuZXdGaWxlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggaGFkQ2hhbmdlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndXBkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YS50ZXN0QmVuY2hlc1sgaWQgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YS50ZXN0QmVuY2hlc1sgaWQgXTtcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd1bmxvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKCBmb2xkZXJOb2RlLCBtZXRhICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBjaGlsZHJlbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gY2hpbGRyZW5bIGkgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKCBtZXRhLkFUTUZvbGRlciApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2goIHdhdGNoRnJvbUZvbGRlclJlYyggY2hpbGROb2RlLCBtZXRhICkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggY2hpbGROb2RlLmlzTWV0YVR5cGVPZiggbWV0YS5BVk1UZXN0QmVuY2hNb2RlbCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQgPSBjaGlsZE5vZGUuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudGVzdEJlbmNoZXNbIHRlc3RCZW5jaElkIF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRlc3RCZW5jaElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoICduYW1lJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCAnSU5GTycgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCAnSUQnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogY2hpbGROb2RlLmdldEF0dHJpYnV0ZSggJ1Jlc3VsdHMnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoICdUZXN0QmVuY2hGaWxlcycgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZCggb25VbmxvYWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVwZGF0ZSggb25VcGRhdGUgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZCggZnVuY3Rpb24gKCBuZXdDaGlsZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdDaGlsZC5pc01ldGFUeXBlT2YoIG1ldGEuQVRNRm9sZGVyICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMoIG5ld0NoaWxkLCBtZXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIG5ld0NoaWxkLmlzTWV0YVR5cGVPZiggbWV0YS5BVk1UZXN0QmVuY2hNb2RlbCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdEJlbmNoSWQgPSBuZXdDaGlsZC5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS50ZXN0QmVuY2hlc1sgdGVzdEJlbmNoSWQgXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdGVzdEJlbmNoSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCAnSU5GTycgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoICdJRCcgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoICdSZXN1bHRzJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBuZXdDaGlsZC5nZXRBdHRyaWJ1dGUoICdUZXN0QmVuY2hGaWxlcycgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKCBvblVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VcGRhdGUoIG9uVXBkYXRlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0ZXN0QmVuY2hJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLnRlc3RCZW5jaGVzWyB0ZXN0QmVuY2hJZCBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcXVldWVMaXN0Lmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbCggcXVldWVMaXN0IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdID0gd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXSB8fCB7fTtcbiAgICAgICAgICAgIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF1bIGNvbnRleHQucmVnaW9uSWQgXSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoIGNvbnRleHQgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG1ldGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKCBjb250ZXh0LCB3b3Jrc3BhY2VJZCApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCB3b3Jrc3BhY2VOb2RlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggY2hpbGRyZW4gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuWyBpIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKCBtZXRhLkFUTUZvbGRlciApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCggd2F0Y2hGcm9tRm9sZGVyUmVjKCBjaGlsZE5vZGUsIG1ldGEgKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZCggZnVuY3Rpb24gKCBuZXdDaGlsZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld0NoaWxkLmlzTWV0YVR5cGVPZiggbWV0YS5BVE1Gb2xkZXIgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKCBuZXdDaGlsZCwgbWV0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcXVldWVMaXN0Lmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbCggcXVldWVMaXN0IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogIFdhdGNoZXMgYSB0ZXN0LWJlbmNoIHcuci50LiBpbnRlcmZhY2VzLlxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cbiAgICAgICAgICogQHBhcmFtIHRlc3RCZW5jaElkXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLndhdGNoVGVzdEJlbmNoRGV0YWlscyA9IGZ1bmN0aW9uICggcGFyZW50Q29udGV4dCwgdGVzdEJlbmNoSWQsIHVwZGF0ZUxpc3RlbmVyICkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoVGVzdEJlbmNoRGV0YWlsc18nICsgdGVzdEJlbmNoSWQsXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJJZHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB0bHN1dDogbnVsbFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBkYXRhLmNvbnRhaW5lcklkcy5pbmRleE9mKCBpZCApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGluZGV4ID4gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbnRhaW5lcklkcy5zcGxpY2UoIGluZGV4LCAxICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3VubG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXSA9IHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF0gfHwge307XG4gICAgICAgICAgICB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdWyBjb250ZXh0LnJlZ2lvbklkIF0gPSBjb250ZXh0O1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKCBjb250ZXh0IClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBtZXRhICkge1xuICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZSggY29udGV4dCwgdGVzdEJlbmNoSWQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggdGVzdEJlbmNoTm9kZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hOb2RlLmxvYWRDaGlsZHJlbigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGNoaWxkcmVuICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY2hpbGRyZW5bIGkgXS5pc01ldGFUeXBlT2YoIG1ldGEuQ29udGFpbmVyICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY29udGFpbmVySWRzLnB1c2goIGNoaWxkcmVuWyBpIF0uZ2V0SWQoKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlblsgaSBdLm9uVW5sb2FkKCBvblVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaE5vZGUub25OZXdDaGlsZExvYWRlZCggZnVuY3Rpb24gKCBuZXdDaGlsZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvbnRhaW5lcklkcy5wdXNoKCBuZXdDaGlsZC5nZXRJZCgpICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQoIG9uVW5sb2FkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBuZXdDaGlsZC5nZXRJZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogIFdhdGNoZXMgYSB0ZXN0LWJlbmNoIHcuci50LiBpbnRlcmZhY2VzLlxuICAgICAgICAgKiBAcGFyYW0gcGFyZW50Q29udGV4dCAtIGNvbnRleHQgb2YgY29udHJvbGxlci5cbiAgICAgICAgICogQHBhcmFtIGNvbnRhaW5lcklkXG4gICAgICAgICAqIEBwYXJhbSB1cGRhdGVMaXN0ZW5lciAtIGludm9rZWQgd2hlbiB0aGVyZSBhcmUgKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLndhdGNoSW50ZXJmYWNlcyA9IGZ1bmN0aW9uICggcGFyZW50Q29udGV4dCwgY29udGFpbmVySWQsIHVwZGF0ZUxpc3RlbmVyICkge1xuICAgICAgICAgICAgcmV0dXJuIGJhc2VDeVBoeVNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKCB3YXRjaGVycywgcGFyZW50Q29udGV4dCwgY29udGFpbmVySWQsIHVwZGF0ZUxpc3RlbmVyICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uICggcGFyZW50Q29udGV4dCApIHtcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoIHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24uXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsZWFuVXBSZWdpb24gPSBmdW5jdGlvbiAoIHBhcmVudENvbnRleHQsIHJlZ2lvbklkICkge1xuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uKCB3YXRjaGVycywgcGFyZW50Q29udGV4dCwgcmVnaW9uSWQgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoZXIgPSBmdW5jdGlvbiAoIHBhcmVudENvbnRleHQsIGZuICkge1xuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIoIHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBmbiApO1xuICAgICAgICB9O1xuICAgIH0gKTsiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXG5cbi8qKlxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqIEBhdXRob3IgbGF0dG1hbm4gLyBodHRwczovL2dpdGh1Yi5jb20vbGF0dG1hbm5cbiAqL1xuXG5cbmFuZ3VsYXIubW9kdWxlKCAnY3lwaHkuc2VydmljZXMnIClcbiAgICAuc2VydmljZSggJ3dvcmtzcGFjZVNlcnZpY2UnLCBmdW5jdGlvbiAoICRxLCAkdGltZW91dCwgbm9kZVNlcnZpY2UsIGJhc2VDeVBoeVNlcnZpY2UsIHBsdWdpblNlcnZpY2UsIGZpbGVTZXJ2aWNlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIHdhdGNoZXJzID0ge307XG5cbiAgICAgICAgdGhpcy5jYWxsQ3JlYXRlV29ya3NwYWNlID0gZnVuY3Rpb24gKCAvKmNvbnRleHQsIG5hbWUsIGRlc2MqLykge1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jcmVhdGVXb3Jrc3BhY2UgPSBmdW5jdGlvbiAoIGNvbnRleHQsIG5hbWUsIGRlc2MgKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIG1ldGE7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoIGNvbnRleHQgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG1ldGFOb2RlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0YSA9IG1ldGFOb2RlcztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVTZXJ2aWNlLmNyZWF0ZU5vZGUoIGNvbnRleHQsICcnLCBtZXRhLldvcmtTcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdbV2ViQ3lQaHldIC0gV29ya3NwYWNlU2VydmljZS5jcmVhdGVXb3Jrc3BhY2UnICk7XG4gICAgICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggd3NOb2RlICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYWNtRm9sZGVySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBhZG1Gb2xkZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0bUZvbGRlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRm9sZGVyTm9kZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudElkID0gd3NOb2RlLmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VJZCA9IG1ldGEuQUNNRm9sZGVyLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UuY3JlYXRlTm9kZSggY29udGV4dCwgcGFyZW50SWQsIGJhc2VJZCwgJ1tXZWJDeVBoeV0gLSBjcmVhdGUgQUNNRm9sZGVyJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGFjbU5vZGUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY21Gb2xkZXJJZCA9IGFjbU5vZGUuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VJZCA9IG1ldGEuQURNRm9sZGVyLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZVNlcnZpY2UuY3JlYXRlTm9kZSggY29udGV4dCwgcGFyZW50SWQsIGJhc2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnW1dlYkN5UGh5XSAtIGNyZWF0ZSBBRE1Gb2xkZXInICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBhZG1Ob2RlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRtRm9sZGVySWQgPSBhZG1Ob2RlLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlSWQgPSBtZXRhLkFUTUZvbGRlci5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVTZXJ2aWNlLmNyZWF0ZU5vZGUoIGNvbnRleHQsIHBhcmVudElkLCBiYXNlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1tXZWJDeVBoeV0gLSBjcmVhdGUgQVRNRm9sZGVyJyApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggYXRtTm9kZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0bUZvbGRlcklkID0gYXRtTm9kZS5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjbTogYWNtRm9sZGVySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRtOiBhZG1Gb2xkZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdG06IGF0bUZvbGRlcklkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKCBmdW5jdGlvbiAoIHJlYXNvbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCByZWFzb24gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHdzTm9kZS5zZXRBdHRyaWJ1dGUoICduYW1lJywgbmFtZSwgJ1tXZWJDeVBoeV0gLSBzZXQgbmFtZSB0byAnICsgbmFtZSApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggZGVzYyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3NOb2RlLnNldEF0dHJpYnV0ZSggJ0lORk8nLCBkZXNjLCAnW1dlYkN5UGh5XSAtIHNldCBJTkZPIHRvICcgKyBkZXNjIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRm9sZGVyTm9kZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVGb2xkZXJOb2RlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICBjYXRjaCAoIGZ1bmN0aW9uICggcmVhc29uICkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggcmVhc29uICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaW1wb3J0RmlsZXMgPSBmdW5jdGlvbiAoIGNvbnRleHQsIGZvbGRlcklkcywgZmlsZXMgKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgY291bnRlcixcbiAgICAgICAgICAgICAgICB0b3RhbCxcbiAgICAgICAgICAgICAgICBmcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWNtczogW10sXG4gICAgICAgICAgICAgICAgICAgIGFkbXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBhdG1zOiBbXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW1wb3J0QWNtUmVjLFxuICAgICAgICAgICAgICAgIGltcG9ydEFkbVJlYyxcbiAgICAgICAgICAgICAgICBpbXBvcnRBdG1SZWMsXG4gICAgICAgICAgICAgICAgZ2V0Tm90aWZ5O1xuXG4gICAgICAgICAgICBpbXBvcnRBY21SZWMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xuICAgICAgICAgICAgICAgIGlmICggY291bnRlciA+PSAwICkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmNhbGxBY21JbXBvcnRlciggY29udGV4dCwgZm9sZGVySWRzLmFjbSwgZnMuYWNtc1sgY291bnRlciBdIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBnZXROb3RpZnkoIGZzLmFjbXNbIGNvdW50ZXIgXSwgJ2FjbScgKSwgZ2V0Tm90aWZ5KCBmcy5hY21zWyBjb3VudGVyIF0gKSwgJ2FjbScgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbCA9IGZzLmFkbXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyID0gdG90YWw7XG4gICAgICAgICAgICAgICAgICAgIGltcG9ydEFkbVJlYygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbXBvcnRBZG1SZWMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xuICAgICAgICAgICAgICAgIGlmICggY291bnRlciA+PSAwICkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmNhbGxBZG1JbXBvcnRlciggY29udGV4dCwgZm9sZGVySWRzLmFkbSwgZnMuYWRtc1sgY291bnRlciBdIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBnZXROb3RpZnkoIGZzLmFkbXNbIGNvdW50ZXIgXSwgJ2FkbScgKSwgZ2V0Tm90aWZ5KCBmcy5hZG1zWyBjb3VudGVyIF0gKSwgJ2FkbScgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbCA9IGZzLmF0bXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVyID0gdG90YWw7XG4gICAgICAgICAgICAgICAgICAgIGltcG9ydEF0bVJlYygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbXBvcnRBdG1SZWMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY291bnRlciAtPSAxO1xuICAgICAgICAgICAgICAgIGlmICggY291bnRlciA+PSAwICkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmNhbGxBdG1JbXBvcnRlciggY29udGV4dCwgZm9sZGVySWRzLmF0bSwgZnMuYXRtc1sgY291bnRlciBdIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBnZXROb3RpZnkoIGZzLmF0bXNbIGNvdW50ZXIgXSwgJ2F0bScgKSwgZ2V0Tm90aWZ5KCBmcy5hdG1zWyBjb3VudGVyIF0sICdhdG0nICkgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGdldE5vdGlmeSA9IGZ1bmN0aW9uICggZkluZm8sIHR5cGUgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICggcmVzdWx0ICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGFuZ3VsYXIuaXNTdHJpbmcoIHJlc3VsdCApID09PSBmYWxzZSAmJiByZXN1bHQuc3VjY2VzcyA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLm5vdGlmeSgge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnPGEgaHJlZj1cIicgKyBmSW5mby51cmwgKyAnXCI+JyArIGZJbmZvLm5hbWUgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9hPicgKyAnIGltcG9ydGVkLiAnICsgJ1snICsgKCB0b3RhbCAtIGNvdW50ZXIgKSArICcvJyArIHRvdGFsICsgJ10nXG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICc8YSBocmVmPVwiJyArIGZJbmZvLnVybCArICdcIj4nICsgZkluZm8ubmFtZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2E+JyArICcgZmFpbGVkIHRvIGJlIGltcG9ydGVkLCBzZWUgY29uc29sZSBkZXRhaWxzLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnWycgKyAoIHRvdGFsIC0gY291bnRlciApICsgJy8nICsgdG90YWwgKyAnXSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggYW5ndWxhci5pc1N0cmluZyggcmVzdWx0ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvciggcmVzdWx0ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIGFuZ3VsYXIudG9Kc29uKCByZXN1bHQubWVzc2FnZXMsIHRydWUgKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggdHlwZSA9PT0gJ2FjbScgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRBY21SZWMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ2FkbScgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRBZG1SZWMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ2F0bScgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRBdG1SZWMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggJ1VuZXhwZWN0ZWQgaW1wb3J0IHR5cGUgJyArIHR5cGUgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gaGFzaDogXCIzNjM2ZWFkMDc4NWNhMTY2ZjNiMTExOTNjNGIyZTVhNjcwODAxZWIxXCIgbmFtZTogXCJEYW1wZXIuemlwXCIgc2l6ZTogXCIxLjQga0JcIiB0eXBlOiBcInppcFwiXG4gICAgICAgICAgICAvLyB1cmw6IFwiL3Jlc3QvYmxvYi9kb3dubG9hZC8zNjM2ZWFkMDc4NWNhMTY2ZjNiMTExOTNjNGIyZTVhNjcwODAxZWIxXCJcbiAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBmaWxlc1sgaSBdLnR5cGUgPT09ICd6aXAnICkge1xuICAgICAgICAgICAgICAgICAgICBmcy5hY21zLnB1c2goIGZpbGVzWyBpIF0gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBmaWxlc1sgaSBdLnR5cGUgPT09ICdhZG0nICkge1xuICAgICAgICAgICAgICAgICAgICBmcy5hZG1zLnB1c2goIGZpbGVzWyBpIF0gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBmaWxlc1sgaSBdLnR5cGUgPT09ICdhdG0nICkge1xuICAgICAgICAgICAgICAgICAgICBmcy5hdG1zLnB1c2goIGZpbGVzWyBpIF0gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRvdGFsID0gZnMuYWNtcy5sZW5ndGg7XG4gICAgICAgICAgICBjb3VudGVyID0gdG90YWw7XG4gICAgICAgICAgICBpbXBvcnRBY21SZWMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jYWxsQWNtSW1wb3J0ZXIgPSBmdW5jdGlvbiAoIGNvbnRleHQsIGZvbGRlcklkLCBmaWxlSW5mbyApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgY29uZmlnID0ge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmVOb2RlOiBmb2xkZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgcnVuT25TZXJ2ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5Db25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFVwbG9hZGVkRmlsZTogZmlsZUluZm8uaGFzaCxcbiAgICAgICAgICAgICAgICAgICAgICAgIERlbGV0ZUV4aXN0aW5nOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLnJ1blBsdWdpbiggY29udGV4dCwgJ0FjbUltcG9ydGVyJywgY29uZmlnIClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCByZXN1bHQgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vXCJ7XCJzdWNjZXNzXCI6dHJ1ZSxcIm1lc3NhZ2VzXCI6W10sXCJhcnRpZmFjdHNcIjpbXSxcInBsdWdpbk5hbWVcIjpcIkFDTSBJbXBvcnRlclwiLFxuICAgICAgICAgICAgICAgICAgICAvLyBcInN0YXJ0VGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS4zODNaXCIsXCJmaW5pc2hUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjkzOVpcIixcImVycm9yXCI6bnVsbH1cIlxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCByZXN1bHQgKTtcbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICBjYXRjaCAoIGZ1bmN0aW9uICggcmVhc29uICkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nLCAnICsgcmVhc29uICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2FsbEFkbUltcG9ydGVyID0gZnVuY3Rpb24gKCBjb250ZXh0LCBmb2xkZXJJZCwgZmlsZUluZm8gKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogZm9sZGVySWQsXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uU2VydmVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZG1GaWxlOiBmaWxlSW5mby5oYXNoXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLnJ1blBsdWdpbiggY29udGV4dCwgJ0FkbUltcG9ydGVyJywgY29uZmlnIClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCByZXN1bHQgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vXCJ7XCJzdWNjZXNzXCI6dHJ1ZSxcIm1lc3NhZ2VzXCI6W10sXCJhcnRpZmFjdHNcIjpbXSxcInBsdWdpbk5hbWVcIjpcIkFETSBJbXBvcnRlclwiLFxuICAgICAgICAgICAgICAgICAgICAvLyBcInN0YXJ0VGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS4zODNaXCIsXCJmaW5pc2hUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjkzOVpcIixcImVycm9yXCI6bnVsbH1cIlxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCByZXN1bHQgKTtcbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICBjYXRjaCAoIGZ1bmN0aW9uICggcmVhc29uICkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nLCAnICsgcmVhc29uICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2FsbEF0bUltcG9ydGVyID0gZnVuY3Rpb24gKCBjb250ZXh0LCBmb2xkZXJJZCwgZmlsZUluZm8gKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogZm9sZGVySWQsXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uU2VydmVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdG1GaWxlOiBmaWxlSW5mby5oYXNoXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBwbHVnaW5TZXJ2aWNlLnJ1blBsdWdpbiggY29udGV4dCwgJ0F0bUltcG9ydGVyJywgY29uZmlnIClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCByZXN1bHQgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vXCJ7XCJzdWNjZXNzXCI6dHJ1ZSxcIm1lc3NhZ2VzXCI6W10sXCJhcnRpZmFjdHNcIjpbXSxcInBsdWdpbk5hbWVcIjpcIkFUTSBJbXBvcnRlclwiLFxuICAgICAgICAgICAgICAgICAgICAvLyBcInN0YXJ0VGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS4zODNaXCIsXCJmaW5pc2hUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjkzOVpcIixcImVycm9yXCI6bnVsbH1cIlxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCByZXN1bHQgKTtcbiAgICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICBjYXRjaCAoIGZ1bmN0aW9uICggcmVhc29uICkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCggJ1NvbWV0aGluZyB3ZW50IHRlcnJpYmx5IHdyb25nLCAnICsgcmVhc29uICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYWxscyBFeHBvcnRXb3Jrc3BhY2UuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gQ29udGV4dCBmb3IgcGx1Z2luLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIERhdGFiYXNlIGNvbm5lY3Rpb24gdG8gcHVsbCBtb2RlbCBmcm9tLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWRcbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gcmVzb2x2ZXMgdG8gZG93bmxvYWQgdXJsIGlmIHN1Y2Nlc3NmdWwuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmV4cG9ydFdvcmtzcGFjZSA9IGZ1bmN0aW9uICggY29udGV4dCwgd29ya3NwYWNlSWQgKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlTm9kZTogd29ya3NwYWNlSWQsXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uU2VydmVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luQ29uZmlnOiB7fVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHBsdWdpblNlcnZpY2UucnVuUGx1Z2luKCBjb250ZXh0LCAnRXhwb3J0V29ya3NwYWNlJywgY29uZmlnIClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCByZXN1bHQgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vXCJ7XCJzdWNjZXNzXCI6dHJ1ZSxcIm1lc3NhZ2VzXCI6W10sXCJhcnRpZmFjdHNcIjpbXSxcInBsdWdpbk5hbWVcIjpcIkFETSBJbXBvcnRlclwiLFxuICAgICAgICAgICAgICAgICAgICAvLyBcInN0YXJ0VGltZVwiOlwiMjAxNC0xMS0wOFQwMjo1MToyMS4zODNaXCIsXCJmaW5pc2hUaW1lXCI6XCIyMDE0LTExLTA4VDAyOjUxOjIxLjkzOVpcIixcImVycm9yXCI6bnVsbH1cIlxuICAgICAgICAgICAgICAgICAgICBpZiAoIHJlc3VsdC5zdWNjZXNzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coIHJlc3VsdCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggZmlsZVNlcnZpY2UuZ2V0RG93bmxvYWRVcmwoIHJlc3VsdC5hcnRpZmFjdHNbIDAgXSApICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHJlc3VsdC5lcnJvciApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoIHJlc3VsdC5lcnJvciArICcgbWVzc2FnZXM6ICcgKyBhbmd1bGFyLnRvSnNvbiggcmVzdWx0Lm1lc3NhZ2VzICkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCBhbmd1bGFyLnRvSnNvbiggcmVzdWx0Lm1lc3NhZ2VzICkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCByZWFzb24gKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCAnU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcgJyArIHJlYXNvbiApO1xuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVcGRhdGVzIHRoZSBnaXZlbiBhdHRyaWJ1dGVzXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gTXVzdCBleGlzdCB3aXRoaW4gd2F0Y2hlcnMgYW5kIGNvbnRhaW4gdGhlIGRlc2lnbi5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRleHQuZGIgLSBNdXN0IGV4aXN0IHdpdGhpbiB3YXRjaGVycyBhbmQgY29udGFpbiB0aGUgZGVzaWduLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5yZWdpb25JZCAtIE11c3QgZXhpc3Qgd2l0aGluIHdhdGNoZXJzIGFuZCBjb250YWluIHRoZSBkZXNpZ24uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3b3Jrc3BhY2VJZCAtIFBhdGggdG8gd29ya3NwYWNlLlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gYXR0cnMgLSBLZXlzIGFyZSBuYW1lcyBvZiBhdHRyaWJ1dGVzIGFuZCB2YWx1ZXMgYXJlIHRoZSB3YW50ZWQgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldFdvcmtzcGFjZUF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoIGNvbnRleHQsIHdvcmtzcGFjZUlkLCBhdHRycyApIHtcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3lQaHlTZXJ2aWNlLnNldE5vZGVBdHRyaWJ1dGVzKCBjb250ZXh0LCB3b3Jrc3BhY2VJZCwgYXR0cnMgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgd29ya3NwYWNlIGZyb20gdGhlIGNvbnRleHQuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGV4dC5kYiAtIGRhdGEtYmFzZSBjb25uZWN0aW9uLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWQgLSBQYXRoIHRvIHdvcmtzcGFjZS5cbiAgICAgICAgICogQHBhcmFtIFttc2ddIC0gQ29tbWl0IG1lc3NhZ2UuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZVdvcmtzcGFjZSA9IGZ1bmN0aW9uICggY29udGV4dCwgd29ya3NwYWNlSWQsIG1zZyApIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbXNnIHx8ICdXb3Jrc3BhY2VTZXJ2aWNlLmRlbGV0ZVdvcmtzcGFjZSAnICsgd29ya3NwYWNlSWQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5kZXN0cm95Tm9kZSggY29udGV4dCwgd29ya3NwYWNlSWQsIG1lc3NhZ2UgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUT0RPOiBtYWtlIHN1cmUgdGhlIG1ldGhvZHMgYmVsb3cgZ2V0cyByZXNvbHZlZCBhdCBlcnJvciB0b28uXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgd29yay1zcGFjZXMgZGVmaW5lZCBpbiB0aGUgcm9vdC1ub2RlIHcuci50LiBleGlzdGVuY2UgYW5kIGF0dHJpYnV0ZXMuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyBhbiBvYmplY3QgaW4gZGF0YS53b3Jrc3BhY2VzLlxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud2F0Y2hXb3Jrc3BhY2VzID0gZnVuY3Rpb24gKCBwYXJlbnRDb250ZXh0LCB1cGRhdGVMaXN0ZW5lciApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaFdvcmtzcGFjZXMnLFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlczoge30gLy8gd29ya3NwYWNlID0ge2lkOiA8c3RyaW5nPiwgbmFtZTogPHN0cmluZz4sIGRlc2NyaXB0aW9uOiA8c3RyaW5nPn1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uVXBkYXRlID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSggJ25hbWUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEZXNjID0gdGhpcy5nZXRBdHRyaWJ1dGUoICdJTkZPJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld05hbWUgIT09IGRhdGEud29ya3NwYWNlc1sgaWQgXS5uYW1lICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzWyBpZCBdLm5hbWUgPSBuZXdOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdEZXNjICE9PSBkYXRhLndvcmtzcGFjZXNbIGlkIF0uZGVzY3JpcHRpb24gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLndvcmtzcGFjZXNbIGlkIF0uZGVzY3JpcHRpb24gPSBuZXdEZXNjO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFkQ2hhbmdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBoYWRDaGFuZ2VzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd1cGRhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLndvcmtzcGFjZXNbIGlkIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGRhdGEud29ya3NwYWNlc1sgaWQgXTtcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd1bmxvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF0gPSB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdIHx8IHt9O1xuICAgICAgICAgICAgd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXVsgY29udGV4dC5yZWdpb25JZCBdID0gY29udGV4dDtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmdldE1ldGFOb2RlcyggY29udGV4dCApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggbWV0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZVNlcnZpY2UubG9hZE5vZGUoIGNvbnRleHQsICcnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIHJvb3ROb2RlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLmxvYWRDaGlsZHJlbigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGNoaWxkcmVuICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdzSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuWyBpIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKCBtZXRhLldvcmtTcGFjZSApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c0lkID0gY2hpbGROb2RlLmdldElkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud29ya3NwYWNlc1sgd3NJZCBdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHdzSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCAnbmFtZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBjaGlsZE5vZGUuZ2V0QXR0cmlidXRlKCAnSU5GTycgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VcGRhdGUoIG9uVXBkYXRlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZCggb25VbmxvYWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290Tm9kZS5vbk5ld0NoaWxkTG9hZGVkKCBmdW5jdGlvbiAoIG5ld0NoaWxkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbmV3Q2hpbGQuaXNNZXRhVHlwZU9mKCBtZXRhLldvcmtTcGFjZSApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3c0lkID0gbmV3Q2hpbGQuZ2V0SWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS53b3Jrc3BhY2VzWyB3c0lkIF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogd3NJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5ld0NoaWxkLmdldEF0dHJpYnV0ZSggJ25hbWUnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbmV3Q2hpbGQuZ2V0QXR0cmlidXRlKCAnSU5GTycgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVwZGF0ZSggb25VcGRhdGUgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQoIG9uVW5sb2FkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB3c0lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLndvcmtzcGFjZXNbIHdzSWQgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIG51bWJlciBvZiBjb21wb25lbnRzIChkZWZpbmVkIGluIEFDTUZvbGRlcnMpIGluIHRoZSB3b3Jrc3BhY2UuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gY2FsbGVkIG9uIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLWJhc2UuIERhdGEgaXMgdGhlIHVwZGF0ZWQgZGF0YS5jb3VudC5cbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLndhdGNoTnVtYmVyT2ZDb21wb25lbnRzID0gZnVuY3Rpb24gKCBwYXJlbnRDb250ZXh0LCB3b3Jrc3BhY2VJZCwgdXBkYXRlTGlzdGVuZXIgKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkID0gcGFyZW50Q29udGV4dC5yZWdpb25JZCArICdfd2F0Y2hOdW1iZXJPZkNvbXBvbmVudHNfJyArIHdvcmtzcGFjZUlkLFxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRiOiBwYXJlbnRDb250ZXh0LmRiLFxuICAgICAgICAgICAgICAgICAgICByZWdpb25JZDogcmVnaW9uSWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZCxcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyA9IGZ1bmN0aW9uICggZm9sZGVyTm9kZSwgbWV0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyTm9kZS5sb2FkQ2hpbGRyZW4oKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggY2hpbGRyZW4gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdCA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVW5sb2FkID0gZnVuY3Rpb24gKCBpZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndW5sb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YS5jb3VudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlblsgaSBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGNoaWxkTm9kZS5pc01ldGFUeXBlT2YoIG1ldGEuQUNNRm9sZGVyICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCggd2F0Y2hGcm9tRm9sZGVyUmVjKCBjaGlsZE5vZGUsIG1ldGEgKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKCBtZXRhLkFWTUNvbXBvbmVudE1vZGVsICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQoIG9uVW5sb2FkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoIGZ1bmN0aW9uICggbmV3Q2hpbGQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbmV3Q2hpbGQuaXNNZXRhVHlwZU9mKCBtZXRhLkFDTUZvbGRlciApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKCBuZXdDaGlsZCwgbWV0YSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IG5ld0NoaWxkLmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEuY291bnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggbmV3Q2hpbGQuaXNNZXRhVHlwZU9mKCBtZXRhLkFWTUNvbXBvbmVudE1vZGVsICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdDaGlsZC5vblVubG9hZCggb25VbmxvYWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IG5ld0NoaWxkLmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YS5jb3VudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHF1ZXVlTGlzdC5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwoIHF1ZXVlTGlzdCApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY0RlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY0RlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXSA9IHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF0gfHwge307XG4gICAgICAgICAgICB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdWyBjb250ZXh0LnJlZ2lvbklkIF0gPSBjb250ZXh0O1xuICAgICAgICAgICAgbm9kZVNlcnZpY2UuZ2V0TWV0YU5vZGVzKCBjb250ZXh0IClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBtZXRhICkge1xuICAgICAgICAgICAgICAgICAgICBub2RlU2VydmljZS5sb2FkTm9kZSggY29udGV4dCwgd29ya3NwYWNlSWQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggd29ya3NwYWNlTm9kZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLmxvYWRDaGlsZHJlbigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGNoaWxkcmVuICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUgPSBjaGlsZHJlblsgaSBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY2hpbGROb2RlLmlzTWV0YVR5cGVPZiggbWV0YS5BQ01Gb2xkZXIgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0LnB1c2goIHdhdGNoRnJvbUZvbGRlclJlYyggY2hpbGROb2RlLCBtZXRhICkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoIGZ1bmN0aW9uICggbmV3Q2hpbGQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdDaGlsZC5pc01ldGFUeXBlT2YoIG1ldGEuQUNNRm9sZGVyICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdGNoRnJvbUZvbGRlclJlYyggbmV3Q2hpbGQsIG1ldGEgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IG5ld0NoaWxkLmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLmNvdW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBxdWV1ZUxpc3QubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKCBxdWV1ZUxpc3QgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgbnVtYmVyIG9mIGNvbnRhaW5lcnMgKGRlZmluZWQgaW4gQURNRm9sZGVycykgaW4gdGhlIHdvcmtzcGFjZS5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudENvbnRleHQgLSBjb250ZXh0IG9mIGNvbnRyb2xsZXIgKG11c3QgaGF2ZSBhIHJlZ2lvbklkIGRlZmluZWQpLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gd29ya3NwYWNlSWRcbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gdXBkYXRlTGlzdGVuZXIgLSBjYWxsZWQgb24gKGZpbHRlcmVkKSBjaGFuZ2VzIGluIGRhdGEtYmFzZS4gRGF0YSBpcyB0aGUgdXBkYXRlZCBkYXRhLmNvdW50LlxuICAgICAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXR1cm5zIGRhdGEgd2hlbiByZXNvbHZlZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMud2F0Y2hOdW1iZXJPZkRlc2lnbnMgPSBmdW5jdGlvbiAoIHBhcmVudENvbnRleHQsIHdvcmtzcGFjZUlkLCB1cGRhdGVMaXN0ZW5lciApIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQgPSBwYXJlbnRDb250ZXh0LnJlZ2lvbklkICsgJ193YXRjaE51bWJlck9mRGVzaWduc18nICsgd29ya3NwYWNlSWQsXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKCBmb2xkZXJOb2RlLCBtZXRhICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBjaGlsZHJlbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd1bmxvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLmNvdW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuWyBpIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY2hpbGROb2RlLmlzTWV0YVR5cGVPZiggbWV0YS5BRE1Gb2xkZXIgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKCB3YXRjaEZyb21Gb2xkZXJSZWMoIGNoaWxkTm9kZSwgbWV0YSApICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGNoaWxkTm9kZS5pc01ldGFUeXBlT2YoIG1ldGEuQ29udGFpbmVyICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGUub25VbmxvYWQoIG9uVW5sb2FkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLm9uTmV3Q2hpbGRMb2FkZWQoIGZ1bmN0aW9uICggbmV3Q2hpbGQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbmV3Q2hpbGQuaXNNZXRhVHlwZU9mKCBtZXRhLkFETUZvbGRlciApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKCBuZXdDaGlsZCwgbWV0YSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IG5ld0NoaWxkLmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEuY291bnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggbmV3Q2hpbGQuaXNNZXRhVHlwZU9mKCBtZXRhLkNvbnRhaW5lciApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3Q2hpbGQub25VbmxvYWQoIG9uVW5sb2FkICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBuZXdDaGlsZC5nZXRJZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEuY291bnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBxdWV1ZUxpc3QubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHEuYWxsKCBxdWV1ZUxpc3QgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNEZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNEZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmICggd2F0Y2hlcnMuaGFzT3duUHJvcGVydHkoIHBhcmVudENvbnRleHQucmVnaW9uSWQgKSA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvciggcGFyZW50Q29udGV4dC5yZWdpb25JZCArICcgaXMgbm90IGEgcmVnaXN0ZXJlZCB3YXRjaGVyISAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBcInRoaXMucmVnaXN0ZXJXYXRjaGVyXCIgYmVmb3JlIHRyeWluZyB0byBhY2Nlc3MgTm9kZSBPYmplY3RzLicgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF1bIGNvbnRleHQucmVnaW9uSWQgXSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoIGNvbnRleHQgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG1ldGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKCBjb250ZXh0LCB3b3Jrc3BhY2VJZCApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCB3b3Jrc3BhY2VOb2RlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggY2hpbGRyZW4gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuWyBpIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKCBtZXRhLkFETUZvbGRlciApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCggd2F0Y2hGcm9tRm9sZGVyUmVjKCBjaGlsZE5vZGUsIG1ldGEgKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZCggZnVuY3Rpb24gKCBuZXdDaGlsZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld0NoaWxkLmlzTWV0YVR5cGVPZiggbWV0YS5BRE1Gb2xkZXIgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKCBuZXdDaGlsZCwgbWV0YSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbmV3Q2hpbGQuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEuY291bnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHF1ZXVlTGlzdC5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwoIHF1ZXVlTGlzdCApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgdGVzdC1iZW5jaGVzIChkZWZpbmVkIGluIEFUTUZvbGRlcnMpIGluIHRoZSB3b3Jrc3BhY2UuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnRDb250ZXh0IC0gY29udGV4dCBvZiBjb250cm9sbGVyIChtdXN0IGhhdmUgYSByZWdpb25JZCBkZWZpbmVkKS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHdvcmtzcGFjZUlkXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHVwZGF0ZUxpc3RlbmVyIC0gY2FsbGVkIG9uIChmaWx0ZXJlZCkgY2hhbmdlcyBpbiBkYXRhLWJhc2UuIERhdGEgaXMgdGhlIHVwZGF0ZWQgZGF0YS5jb3VudC5cbiAgICAgICAgICogQHJldHVybnMge1Byb21pc2V9IC0gUmV0dXJucyBkYXRhIHdoZW4gcmVzb2x2ZWQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLndhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlcyA9IGZ1bmN0aW9uICggcGFyZW50Q29udGV4dCwgd29ya3NwYWNlSWQsIHVwZGF0ZUxpc3RlbmVyICkge1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICByZWdpb25JZCA9IHBhcmVudENvbnRleHQucmVnaW9uSWQgKyAnX3dhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlc18nICsgd29ya3NwYWNlSWQsXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGI6IHBhcmVudENvbnRleHQuZGIsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbklkOiByZWdpb25JZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uSWQ6IHJlZ2lvbklkLFxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjID0gZnVuY3Rpb24gKCBmb2xkZXJOb2RlLCBtZXRhICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICAgICAgICBmb2xkZXJOb2RlLmxvYWRDaGlsZHJlbigpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBjaGlsZHJlbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWVMaXN0ID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb3VudCAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd1bmxvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLmNvdW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuWyBpIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY2hpbGROb2RlLmlzTWV0YVR5cGVPZiggbWV0YS5BVE1Gb2xkZXIgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlTGlzdC5wdXNoKCB3YXRjaEZyb21Gb2xkZXJSZWMoIGNoaWxkTm9kZSwgbWV0YSApICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGNoaWxkTm9kZS5pc01ldGFUeXBlT2YoIG1ldGEuQVZNVGVzdEJlbmNoTW9kZWwgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZS5vblVubG9hZCggb25VbmxvYWQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbGRlck5vZGUub25OZXdDaGlsZExvYWRlZCggZnVuY3Rpb24gKCBuZXdDaGlsZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuZXdDaGlsZC5pc01ldGFUeXBlT2YoIG1ldGEuQVRNRm9sZGVyICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEZyb21Gb2xkZXJSZWMoIG5ld0NoaWxkLCBtZXRhIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlzdGVuZXIoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbmV3Q2hpbGQuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YS5jb3VudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBuZXdDaGlsZC5pc01ldGFUeXBlT2YoIG1ldGEuQVZNVGVzdEJlbmNoTW9kZWwgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NoaWxkLm9uVW5sb2FkKCBvblVubG9hZCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbmV3Q2hpbGQuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLmNvdW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcXVldWVMaXN0Lmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRxLmFsbCggcXVldWVMaXN0IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjRGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjRGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB3YXRjaGVyc1sgcGFyZW50Q29udGV4dC5yZWdpb25JZCBdID0gd2F0Y2hlcnNbIHBhcmVudENvbnRleHQucmVnaW9uSWQgXSB8fCB7fTtcbiAgICAgICAgICAgIHdhdGNoZXJzWyBwYXJlbnRDb250ZXh0LnJlZ2lvbklkIF1bIGNvbnRleHQucmVnaW9uSWQgXSA9IGNvbnRleHQ7XG4gICAgICAgICAgICBub2RlU2VydmljZS5nZXRNZXRhTm9kZXMoIGNvbnRleHQgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIG1ldGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvYWROb2RlKCBjb250ZXh0LCB3b3Jrc3BhY2VJZCApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCB3b3Jrc3BhY2VOb2RlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUubG9hZENoaWxkcmVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggY2hpbGRyZW4gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZE5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkcmVuWyBpIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjaGlsZE5vZGUuaXNNZXRhVHlwZU9mKCBtZXRhLkFUTUZvbGRlciApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZUxpc3QucHVzaCggd2F0Y2hGcm9tRm9sZGVyUmVjKCBjaGlsZE5vZGUsIG1ldGEgKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZU5vZGUub25OZXdDaGlsZExvYWRlZCggZnVuY3Rpb24gKCBuZXdDaGlsZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIG5ld0NoaWxkLmlzTWV0YVR5cGVPZiggbWV0YS5BVE1Gb2xkZXIgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hGcm9tRm9sZGVyUmVjKCBuZXdDaGlsZCwgbWV0YSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbmV3Q2hpbGQuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEuY291bnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHF1ZXVlTGlzdC5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSggZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcS5hbGwoIHF1ZXVlTGlzdCApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBBbGxSZWdpb25zLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jbGVhblVwQWxsUmVnaW9ucyA9IGZ1bmN0aW9uICggcGFyZW50Q29udGV4dCApIHtcbiAgICAgICAgICAgIGJhc2VDeVBoeVNlcnZpY2UuY2xlYW5VcEFsbFJlZ2lvbnMoIHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlZSBiYXNlQ3lQaHlTZXJ2aWNlLmNsZWFuVXBSZWdpb24uXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsZWFuVXBSZWdpb24gPSBmdW5jdGlvbiAoIHBhcmVudENvbnRleHQsIHJlZ2lvbklkICkge1xuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5jbGVhblVwUmVnaW9uKCB3YXRjaGVycywgcGFyZW50Q29udGV4dCwgcmVnaW9uSWQgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VlIGJhc2VDeVBoeVNlcnZpY2UucmVnaXN0ZXJXYXRjaGVyLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoZXIgPSBmdW5jdGlvbiAoIHBhcmVudENvbnRleHQsIGZuICkge1xuICAgICAgICAgICAgYmFzZUN5UGh5U2VydmljZS5yZWdpc3RlcldhdGNoZXIoIHdhdGNoZXJzLCBwYXJlbnRDb250ZXh0LCBmbiApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nQ29udGV4dCA9IGZ1bmN0aW9uICggY29udGV4dCApIHtcbiAgICAgICAgICAgIG5vZGVTZXJ2aWNlLmxvZ0NvbnRleHQoIGNvbnRleHQgKTtcbiAgICAgICAgfTtcbiAgICB9ICk7IiwiLypnbG9iYWxzIHJlcXVpcmUsIGFuZ3VsYXIgKi9cbi8qKlxuICogQGF1dGhvciBsYXR0bWFubiAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sYXR0bWFublxuICogQGF1dGhvciBwbWVpamVyIC8gaHR0cHM6Ly9naXRodWIuY29tL3BtZWlqZXJcbiAqL1xuXG5hbmd1bGFyLm1vZHVsZSggJ2N5cGh5LnNlcnZpY2VzJywgWyAnZ21lLnNlcnZpY2VzJyBdICk7XG5yZXF1aXJlKCAnLi9CYXNlQ3lQaHlTZXJ2aWNlJyApO1xucmVxdWlyZSggJy4vUGx1Z2luU2VydmljZScgKTtcbnJlcXVpcmUoICcuL0ZpbGVTZXJ2aWNlJyApO1xucmVxdWlyZSggJy4vRXhlY3V0b3JTZXJ2aWNlJyApO1xucmVxdWlyZSggJy4vV29ya3NwYWNlU2VydmljZScgKTtcbnJlcXVpcmUoICcuL0NvbXBvbmVudFNlcnZpY2UnICk7XG5yZXF1aXJlKCAnLi9EZXNpZ25TZXJ2aWNlJyApO1xucmVxdWlyZSggJy4vVGVzdEJlbmNoU2VydmljZScgKTtcbnJlcXVpcmUoICcuL0Rlc2VydFNlcnZpY2UnICk7Il19

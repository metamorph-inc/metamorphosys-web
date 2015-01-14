
angular.module('adaptv.adaptStrap.draggable', [])
  .directive('adDrag', ['$rootScope', '$parse', '$timeout', function ($rootScope, $parse, $timeout) {
    function linkFunction(scope, element, attrs) {
      scope.draggable = attrs.adDrag;
      scope.hasHandle = attrs.adDragHandle === 'false' || typeof attrs.adDragHandle === 'undefined' ? false : true;
      scope.onDragStartCallback = $parse(attrs.adDragBegin) || null;
      scope.onDragEndCallback = $parse(attrs.adDragEnd) || null;
      scope.data = null;

      var offset, mx, my, tx, ty;

      var hasTouch = ('ontouchstart' in document.documentElement);
      /* -- Events -- */
      var startEvents = 'touchstart mousedown';
      var moveEvents = 'touchmove mousemove';
      var endEvents = 'touchend mouseup';

      var $document = $(document);
      var $window = $(window);

      var dragEnabled = false;
      var pressTimer = null;

      function init() {
        element.attr('draggable', 'false'); // prevent native drag
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
          element.on('mousedown', '.ad-drag-handle', function() {
            return false;
          });
          element.on('mousedown', function() {
            return false;
          }); // prevent native drag
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
          pressTimer = setTimeout(function() {
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
      function getInlineProperty (prop, element) {
        var styles = $(element).attr('style'),
          value;
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
        element.children()
          .each(function() {
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

        mx = (evt.pageX || evt.originalEvent.touches[0].pageX);
        my = (evt.pageY || evt.originalEvent.touches[0].pageY);

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

        cx = (evt.pageX || evt.originalEvent.touches[0].pageX);
        cy = (evt.pageY || evt.originalEvent.touches[0].pageY);

        tx = (cx - mx) + offset.left - $window.scrollLeft();
        ty = (cy - my) + offset.top - $window.scrollTop();

        moveElement(tx, ty);

        $rootScope.$broadcast('draggable:move', {
          x: mx,
          y: my,
          tx: tx,
          ty:ty,
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
        scope.$apply(function() {
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
        $timeout(function() {
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
        element.css({ left: '', top: '', position:'', 'z-index': '' });
        var width = element.data('ad-draggable-temp-width');
        if (width) {
          element.css({width: width});
        } else {
          element.css({width: ''});
        }
        element.children()
          .each(function() {
            var width = $(this).data('ad-draggable-temp-width');
            if (width) {
              $(this).css({width: width});
            } else {
              $(this).css({width: ''});
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
  }])
  .directive('adDrop', ['$rootScope', '$parse', function ($rootScope, $parse) {
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
          scope.$apply(function() {
            scope.onDropOverCallback(scope, {
              $data: obj.data,
              $dragElement: obj.el,
              $dropElement: elem,
              $event: evt
            });
          });
          element.addClass('ad-drop-over');

          $rootScope.$broadcast('draggable:change', {
            el: elem
          });
        } else {
          if (obj.el.lastDropElement === element) {
            scope.$apply(function() {
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

        return ((y >= (bounds.top + vthold) && y <= (bounds.top + element.outerHeight() - vthold)) &&
            (x >= (bounds.left) && x <= (bounds.left + element.outerWidth()))) && (x >= bounds.left &&
                  x <= (bounds.left + element.outerWidth())) ? element : null;
      }
      init();
    }
    return {
      restrict: 'A',
      link: linkFunction
    };
  }]);

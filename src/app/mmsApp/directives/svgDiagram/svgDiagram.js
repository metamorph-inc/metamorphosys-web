/*globals angular*/

'use strict';

// Move this to GME eventually

require('../componentWire/componentWire.js');

angular.module('mms.designVisualization.svgDiagram', [
  'mms.designVisualization.gridService',
  'mms.designVisualization.componentWire'
])
.controller('SVGDiagramController', function ($scope, $log, diagramService, wiringService, gridService) {

  var possibbleDragTargetsDescriptor,
  startDrag,
  finishDrag,

  possibleWireStart,
  startWire,
  finishWire,
  cancelWire,

  moveComponentElementToFront,

  getOffsetToMouse,

  Wire = require('../../services/diagramService/classes/Wire.js'),

  addCornerToNewWireLine,

  componentElements;


  getOffsetToMouse = function ($event) {

    var offset;

    offset = {
      x: $event.pageX - $scope.elementOffset.left,
      y: $event.pageY - $scope.elementOffset.top
    };

    return offset;

  };

  startDrag = function () {

    $scope.dragTargetsDescriptor = possibbleDragTargetsDescriptor;
    possibbleDragTargetsDescriptor = null;

    $log.debug('Dragging', $scope.dragTargetsDescriptor);

  };

  startWire = function () {

    $scope.wireStart = possibleWireStart;
    possibleWireStart = null;

    $log.debug('Starting wire', $scope.wireStart);

  };

  addCornerToNewWireLine = function () {

    var lastSegment;

    $scope.newWireLine.lockedSegments = $scope.newWireLine.segments;

    lastSegment = $scope.newWireLine.lockedSegments[$scope.newWireLine.lockedSegments.length - 1];

    $scope.newWireLine.activeSegmentStartPosition = {
      x: lastSegment.x2,
      y: lastSegment.y2
    };

  };

  finishWire = function (component, port) {

    var wire = new Wire({
      id: 'new-wire-' + Math.round(Math.random() * 10000),
      end1: {
        component: $scope.wireStart.component,
        port: $scope.wireStart.port
      },
      end2: {
        component: component,
        port: port
      }
    });

    wire.segments = angular.copy(
    $scope.newWireLine.lockedSegments.concat(
    wiringService.getSegmentsBetweenPositions(
    {
      end1: $scope.newWireLine.activeSegmentStartPosition,
      end2: port.getGridPosition()
    },
    'ElbowRouter'
    )
    ));

    console.log(wire.segments);


    diagramService.addWire(wire);

    $scope.diagram.wires[ wire.id ] = wire;

    gridService.invalidateVisibleDiagramComponents($scope.id);

    $log.debug('Finish wire', wire);

    $scope.wireStart = null;
    $scope.newWireLine = null;

  };

  cancelWire = function () {
    $scope.wireStart = null;
  };

  finishDrag = function () {

    $scope.dragTargetsDescriptor = null;

    $log.debug('Finish dragging');

  };

  $scope.onMouseUp = function () {
//      if ($scope.dragTargetsDescriptor) {
//        //finishDrag();
//      }
  };


  $scope.onClick = function ($event) {

    if ($scope.wireStart) {

      $event.stopPropagation();

      addCornerToNewWireLine();

    } else {
      $scope.diagram.state.selectedComponentIds = [];
    }

  };

  $scope.onMouseMove = function ($event) {

    var offset;

    // Dragging

    if (possibbleDragTargetsDescriptor) {
      startDrag();
    }

    if ($scope.dragTargetsDescriptor) {

      angular.forEach($scope.dragTargetsDescriptor.targets, function (target) {

        //console.log($event.offsetY, target.deltaToCursor.y);

        offset = getOffsetToMouse($event);

        target.component.setPosition(
        offset.x + target.deltaToCursor.x,
        offset.y + target.deltaToCursor.y
        );

      });

      angular.forEach($scope.dragTargetsDescriptor.affectedWires, function (wire) {

        wiringService.adjustWireEndSegments(wire);

      });

    }

    // Wire drawing

    if (possibleWireStart) {
      startWire();
    }

    if ($scope.wireStart) {

      $scope.newWireLine = $scope.newWireLine || {};
      $scope.newWireLine.lockedSegments = $scope.newWireLine.lockedSegments || [];
      $scope.newWireLine.activeSegmentStartPosition =
      $scope.newWireLine.activeSegmentStartPosition || $scope.wireStart.port.getGridPosition();

      $scope.newWireLine.segments = $scope.newWireLine.lockedSegments.concat(
      wiringService.getSegmentsBetweenPositions(
      {
        end1: $scope.newWireLine.activeSegmentStartPosition,
        end2: {
          x: $event.pageX - $scope.elementOffset.left - 3,
          y: $event.pageY - $scope.elementOffset.top - 3
        }
      },
      'ElbowRouter'
      )
      );

    }

  };

  $scope.getCssClass = function () {

    var result = '';

    if ($scope.dragTargetsDescriptor) {
      result += 'dragging';
    }

    return result;

  };

  $scope.contextMenuData = [ {
    id: 'context-menu-common',
    items: [ {
      id: 'newComponent',
      label: 'New component ...',
      iconClass: 'glyphicon glyphicon-plus',
      action: function () {
        console.log( 'New component clicked' );
      },
      actionData: {}
    }]
  }];

  moveComponentElementToFront = function (componentId) {

    var z,
    component,
    needsTobeReordered;

    needsTobeReordered = false;

    z = diagramService.getHighestZ();
    component = $scope.diagram.components[componentId];

    if (isNaN(component.z)) {
      component.z = z;
      needsTobeReordered = true;
    } else {
      if (component.z < z) {
        component.z = z + 1;
        needsTobeReordered = true;
      }
    }

    if (needsTobeReordered) {
      gridService.reorderVisibleComponents($scope.id);
    }

  };

  // Interactions with components

  this.toggleComponentSelected = function (component, $event) {

    var index;

    if (angular.isObject(component) && !this.disallowSelection() && component.nonSelectable !== true) {

      index = $scope.diagram.state.selectedComponentIds.indexOf(component.id);

      if (index > -1) {

        $scope.diagram.state.selectedComponentIds.splice(index, 1);

      } else {

        if ($scope.diagram.state.selectedComponentIds.length > 0 &&
        $scope.diagram.config.multiSelect !== true &&
        $event.shiftKey !== true) {

          angular.forEach($scope.diagram.state.selectedComponentIds, function (componentId) {
            $scope.diagram.components[componentId].selected = false;
          });
          $scope.diagram.state.selectedComponentIds = [];
        }

        $scope.diagram.state.selectedComponentIds.push(component.id);

        moveComponentElementToFront(component.id);

      }

    }

  };

  this.onComponentClick = function (component, $event) {

    possibbleDragTargetsDescriptor = null;

    if ($scope.dragTargetsDescriptor) {
      finishDrag();
      $event.stopPropagation();
    } else {
      this.toggleComponentSelected(component, $event);
      $event.stopPropagation();
    }

  };

  this.onPortMouseDown = function (component, port, $event) {

    if (!$scope.wireStart) {
      possibleWireStart = {
        component: component,
        port: port
      };
    }

    $event.stopPropagation();

  };

  this.onPortMouseUp = function (component, port, $event) {

    $event.stopPropagation();

  };

  this.onPortClick = function (component, port, $event) {

    if (possibbleDragTargetsDescriptor) {
      possibbleDragTargetsDescriptor = null;
    }

    if ($scope.wireStart) {

      $event.stopPropagation();

      if ($scope.wireStart.port !== port) {
        finishWire(component, port);
      } else {
        cancelWire();
      }

    }

  };

  this.onComponentMouseDown = function (component, $event) {

    var componentsToDrag,
    getDragDescriptor,
    wires;

    if ($event.which === 3) {

      component.rotate(90);

      wires = diagramService.getWiresForComponents(component);

      console.log(component);

      angular.forEach(wires, function (wire) {
        wiringService.adjustWireEndSegments(wire);
      });


      $event.preventDefault();

    } else {

      componentsToDrag = [];

      getDragDescriptor = function (component) {

        var offset = getOffsetToMouse($event);

        return {
          component: component,
          originalPosition: {
            x: component.x,
            y: component.y
          },
          deltaToCursor: {
            x: component.x - offset.x,
            y: component.y - offset.y
          }
        };

      };

      if (this.isEditable() &&
      component.nonSelectable !== true &&
      component.locationLocked !== true) {

        $event.stopPropagation();

        possibbleDragTargetsDescriptor = {
          targets: [ getDragDescriptor(component) ]
        };

        componentsToDrag.push(component);

        if ($scope.diagram.state.selectedComponentIds.indexOf(component.id) > -1) {

          // Drag along other selected components

          angular.forEach($scope.diagram.state.selectedComponentIds, function (selectedComponentId) {

            var selectedComponent;

            if (component.id !== selectedComponentId) {

              selectedComponent = $scope.diagram.components[selectedComponentId];

              possibbleDragTargetsDescriptor.targets.push(getDragDescriptor(selectedComponent));

              componentsToDrag.push(selectedComponent);

            }

          });
        }

        possibbleDragTargetsDescriptor.affectedWires = diagramService.getWiresForComponents(componentsToDrag);

      }
    }
  };

  this.isEditable = function () {

    $scope.diagram.config = $scope.diagram.config || {};

    return $scope.diagram.config.editable === true;
  };

  this.disallowSelection = function () {

    $scope.diagram.config = $scope.diagram.config || {};

    return $scope.diagram.config.disallowSelection === true;
  };

  this.registerComponentElement = function (id, el) {

    componentElements = componentElements || {};

    componentElements[id] = el;

  };

  this.unregisterComponentElement = function (id) {

    componentElements = componentElements || {};

    delete componentElements[id];

  };

})
.directive('svgDiagram', [
  '$log',
  'diagramService',
  'gridService',
  function ($log, diagramService, gridService) {

    return {
      controller: 'SVGDiagramController',
      require: '^diagramContainer',
      restrict: 'E',
      scope: false,
      replace: true,
      templateUrl: '/mmsApp/templates/svgDiagram.html',
      link: function (scope, element, attributes, diagramContainerController) {

        var id;

        id = diagramContainerController.getId();

        scope.diagram = scope.diagram || {};
        scope.$element = element;

        scope.id = id;

        scope.visibleObjects = gridService.createGrid(id,
        {
          width: 10000,
          height: 1000
        },
        scope.diagram
        );

        scope.$watch(
        function () {
          return diagramContainerController.getVisibleArea();
        }, function (visibleArea) {
          scope.elementOffset = scope.$element.offset();
          gridService.setVisibleArea(id, visibleArea);
        });

      }

    };
  }
]);
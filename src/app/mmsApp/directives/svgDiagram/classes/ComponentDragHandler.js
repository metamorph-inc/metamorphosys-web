/*globals angular*/

'use strict';

module.exports = function ($scope, diagramService, wiringService, operationsManager, $timeout, gridService, $log) {

    var self = this,
        getOffsetToMouse,
        possibbleDragTargetsDescriptor,
        dragTargetsDescriptor,

        dragTargetsWiresUpdate,
        wireUpdateWait,
        dragTargetsWiresUpdatePromises,

        onDiagramMouseUp,
        onDiagramMouseMove,
        onDiagramMouseLeave,
        onWindowBlur,
        onComponentMouseUp,
        onComponentMouseDown,

        startDrag,
        finishDrag,
        cancelDrag;


    getOffsetToMouse = function ($event) {

        var offset;

        offset = {
            x: $event.pageX - $scope.elementOffset.left,
            y: $event.pageY - $scope.elementOffset.top
        };

        return offset;

    };


    startDrag = function () {

        self.dragging = true;

        //self.dragOperation = operationsManager.initNew('setComponentPosition');

        dragTargetsDescriptor = possibbleDragTargetsDescriptor;
        possibbleDragTargetsDescriptor = null;

        $log.debug('Dragging', dragTargetsDescriptor);

    };

    cancelDrag = function () {

        possibbleDragTargetsDescriptor = null;

        if (dragTargetsDescriptor) {

            angular.forEach(dragTargetsDescriptor.targets, function (target) {

                target.component.setPosition(
                    target.originalPosition.x,
                    target.originalPosition.y
                );

            });

            angular.forEach(dragTargetsDescriptor.affectedWires, function (wire) {

                wiringService.adjustWireEndSegments(wire);

            });

            dragTargetsDescriptor = null;

        }

        self.dragging = false;

    };

    finishDrag = function () {

        var message,
            components;

        components = dragTargetsDescriptor.targets.map(
            function (target) {
                return target.component;
            });

        if (components.length > 1) {
            message = 'Dragging selection';
        } else {
            message = 'Dragging ' + components[0].label;
        }

        $scope.$emit('componentsPositionChange', {
            diagramId: $scope.diagram.id,
            components: components,
            message: message
        });

        //$scope.$emit('wiresChange', {
        //    diagramId: $scope.diagram.id,
        //    wires: dragTargetsDescriptor.affectedWires
        //});

        self.dragging = false;

        dragTargetsDescriptor = null;

        $log.debug('Finish dragging');

    };

    wireUpdateWait = 20;
    dragTargetsWiresUpdatePromises = {};

    dragTargetsWiresUpdate = function (affectedWires) {

        angular.forEach(affectedWires, function (wire) {

            $timeout.cancel(dragTargetsWiresUpdatePromises[wire.id]);

            dragTargetsWiresUpdatePromises[wire.id] = $timeout(function () {
                wiringService.adjustWireEndSegments(wire);
            }, wireUpdateWait);

        });

    };

    onDiagramMouseMove = function ($event) {

        var offset,
            i,
            target,
            snappedPosition;

        if (possibbleDragTargetsDescriptor) {
            startDrag();
        }

        if (dragTargetsDescriptor) {

            offset = getOffsetToMouse($event);

            for (i = 0; i < dragTargetsDescriptor.targets.length; i++) {

                target = dragTargetsDescriptor.targets[i];

                snappedPosition = gridService.getSnappedPosition(
                    {
                        x: offset.x + target.deltaToCursor.x,
                        y: offset.y + target.deltaToCursor.y
                    });

                target.component.setPosition(
                    snappedPosition.x,
                    snappedPosition.y
                );

            }

            dragTargetsWiresUpdate(dragTargetsDescriptor.affectedWires);

        }

    };

    onDiagramMouseUp = function ($event) {

        possibbleDragTargetsDescriptor = null;

        if (dragTargetsDescriptor) {
            finishDrag();
            $event.stopPropagation();
        }

    };

    onDiagramMouseLeave = function (/*$event*/) {

        cancelDrag();

    };

    onWindowBlur = function (/*$event*/) {

        cancelDrag();

    };

    onComponentMouseUp = function (component, $event) {

        possibbleDragTargetsDescriptor = null;

        if (dragTargetsDescriptor) {
            finishDrag();
            $event.stopPropagation();
        }

    };

    onComponentMouseDown = function (component, $event) {

        var componentsToDrag,
            getDragDescriptor;

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

        $scope.diagram.config = $scope.diagram.config || {};

        if ($scope.diagram.config.editable === true &&
            component.nonSelectable !== true &&
            component.locationLocked !== true) {

            $event.stopPropagation();

            possibbleDragTargetsDescriptor = {
                targets: [getDragDescriptor(component)]
            };

            componentsToDrag.push(component);

            if ($scope.diagram.state.selectedComponentIds.indexOf(component.id) > -1) {

                // Drag along other selected components

                angular.forEach($scope.diagram.state.selectedComponentIds, function (selectedComponentId) {

                    var selectedComponent;

                    if (component.id !== selectedComponentId) {

                        selectedComponent = $scope.diagram.componentsById[selectedComponentId];

                        possibbleDragTargetsDescriptor.targets.push(getDragDescriptor(
                            selectedComponent));

                        componentsToDrag.push(selectedComponent);

                    }

                });
            }

            possibbleDragTargetsDescriptor.affectedWires = $scope.diagram.getWiresForComponents(
                componentsToDrag
            );

        }

    };

    this.onDiagramMouseUp = onDiagramMouseUp;
    this.onDiagramMouseMove = onDiagramMouseMove;
    this.onDiagramMouseLeave = onDiagramMouseLeave;
    this.onWindowBlur = onWindowBlur;
    this.onComponentMouseUp = onComponentMouseUp;
    this.onComponentMouseDown = onComponentMouseDown;

    return this;

};

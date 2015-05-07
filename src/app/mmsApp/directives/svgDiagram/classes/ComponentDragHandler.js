/*globals angular*/

'use strict';

module.exports = function ($scope, diagramService, wiringService, operationsManager, $timeout, gridService, $log) {

    var self = this,
        getOffsetToMouse,
        possibbleDragTargetsDescriptor,

        moveOperation,

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

        moveOperation = operationsManager.initNew('MoveComponents', $scope.diagram, possibbleDragTargetsDescriptor);

        $log.debug('Dragging', possibbleDragTargetsDescriptor);
        possibbleDragTargetsDescriptor = null;

    };

    cancelDrag = function () {

        possibbleDragTargetsDescriptor = null;

        if (angular.isObject(moveOperation)) {

            moveOperation.cancel();
            moveOperation = null;

        }

        self.dragging = false;

    };

    finishDrag = function () {

        possibbleDragTargetsDescriptor = null;

        if (angular.isObject(moveOperation)) {

            moveOperation.finish();
            moveOperation = null;

            self.dragging = false;

            $log.debug('Finish dragging');

        }

    };

    onDiagramMouseMove = function ($event) {

        var offset;

        if (possibbleDragTargetsDescriptor && (
                $event.pageX !== possibbleDragTargetsDescriptor.mousePosition.x ||
                $event.pageY !== possibbleDragTargetsDescriptor.mousePosition.y
                )
            ) {
            console.log('onDiagramMouseMove - starting drag', $event);            
            startDrag();
        }

        if (moveOperation) {

            offset = getOffsetToMouse($event);

            moveOperation.set(offset);

        }

    };

    onDiagramMouseUp = function ($event) {

        finishDrag();
        $event.stopPropagation();

    };

    onDiagramMouseLeave = function (/*$event*/) {

        finishDrag();

    };

    onWindowBlur = function (/*$event*/) {

        finishDrag();

    };

    onComponentMouseUp = function (component, $event) {

        possibbleDragTargetsDescriptor = null;

        finishDrag();
        $event.stopPropagation();

    };

    onComponentMouseDown = function (component, $event) {

        var componentsToDrag,
            getDragDescriptor,
            primaryTargetDescriptor;

        componentsToDrag = [];

        console.log('onComponentMouseDown', $event);

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

            primaryTargetDescriptor = getDragDescriptor(component);

            possibbleDragTargetsDescriptor = {
                mousePosition: {
                    x: $event.pageX,
                    y: $event.pageY
                },                
                primaryTarget: primaryTargetDescriptor,
                targets: [ primaryTargetDescriptor ]
            };

            componentsToDrag.push(component);

            if ($scope.diagram.state.selectedComponentIds.indexOf(component.id) > -1) {

                // Drag along other selected components

                angular.forEach($scope.diagram.state.selectedComponentIds, function (selectedComponentId) {

                    var selectedComponent;

                    if (component.id !== selectedComponentId) {

                        selectedComponent = $scope.diagram.getComponentById(selectedComponentId);

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

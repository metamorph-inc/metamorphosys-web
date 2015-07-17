/*globals angular*/

'use strict';

module.exports = function ($scope, $rootScope, diagramService, wiringService, operationsManager, $timeout, gridService, $log) {

    var self = this,
        getOffsetToMouse,
        possibbleDragTargetsDescriptor,

        moveOperation,

        onDiagramMouseUp,
        onDiagramMouseMove,
        onDiagramMouseLeave,
        onWindowBlur,
        onWireMouseUp,
        onWireMouseDown,

        startDrag,
        finishDrag,
        cancelDrag,

        scrollWhenAlongTheEdge,
        latestOffset,
        scrollWhenAlongTheEdgeInterval;        

    scrollWhenAlongTheEdge = function() {

        var dx = 0,
            dy = 0,
            TOLERANCE = 50,
            SCROLL_AMOUNT = 75,
            offset,
            didScroll;

        if (latestOffset) {

            if (latestOffset.x - $scope.visibleArea.left <= TOLERANCE) {
                dx = -SCROLL_AMOUNT;
                latestOffset.x -= SCROLL_AMOUNT;
            }

            if ($scope.visibleArea.right - latestOffset.x <= TOLERANCE) {
                dx = SCROLL_AMOUNT;
                latestOffset.x += SCROLL_AMOUNT;
            }

            if (latestOffset.y - $scope.visibleArea.top <= TOLERANCE) {
                dy = -SCROLL_AMOUNT;
                latestOffset.y -= SCROLL_AMOUNT;
            }

            if ($scope.visibleArea.bottom - latestOffset.y <= TOLERANCE) {
                dy = SCROLL_AMOUNT;
                latestOffset.y += SCROLL_AMOUNT;
            }

            if (dx !== 0 || dy !== 0) {

                didScroll = $scope.diagramContainerController.scrollSome(
                    $scope.visibleArea.left + dx,
                    $scope.visibleArea.top + dy
                );

                if (didScroll && moveOperation) {
                    moveOperation.set(latestOffset);
                }

            }
        }

        if (self.dragging) {
            scrollWhenAlongTheEdgeInterval = setTimeout(scrollWhenAlongTheEdge, 125);        
        }

    };

    getOffsetToMouse = function ($event) {

        var offset;

        offset = {
            x: $event.pageX - $scope.elementOffset.left,
            y: $event.pageY - $scope.elementOffset.top
        };

        latestOffset = offset;

        return offset;

    };


    startDrag = function () {

        self.dragging = true;

        moveOperation = operationsManager.initNew('MoveWires', $scope.diagram, possibbleDragTargetsDescriptor);

        $log.debug('Dragging wire', possibbleDragTargetsDescriptor);
        possibbleDragTargetsDescriptor = null;

        scrollWhenAlongTheEdge();

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

            $log.debug('Finish wire dragging');

        }

    };

    onDiagramMouseMove = function ($event) {

        var offset;

        if (possibbleDragTargetsDescriptor && (
                $event.pageX !== possibbleDragTargetsDescriptor.mousePosition.x ||
                $event.pageY !== possibbleDragTargetsDescriptor.mousePosition.y
            )) {
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

        $scope.diagram.clearSelection(true);

    };

    onWindowBlur = function (/*$event*/) {

        finishDrag();

    };

    onWireMouseUp = function (wire, segment, $event) {

        possibbleDragTargetsDescriptor = null;

        finishDrag();
        $event.stopPropagation();

    };

    onWireMouseDown = function (wire, segment, $event, wasCorner) {

        var getDragDescriptor,
            indexOfSegment,
            primartyTargetDescriptor;

        getDragDescriptor = function (aWire, aSegment, sIndex) {

            var offset = getOffsetToMouse($event),
                parameters = aSegment.getParameters();

            return {
                wire: aWire,
                segment: aSegment,
                segmentIndex: sIndex,
                originalSegmentsParameters: aWire.getCopyOfSegmentsParameters(),
                wasCorner: wasCorner,
                deltaToCursor1: {
                    x: parameters.x1 - offset.x,
                    y: parameters.y1 - offset.y
                },
                deltaToCursor2: {
                    x: parameters.x2 - offset.x,
                    y: parameters.y2 - offset.y
                }

            };


        };

        if (angular.isObject(wire) && angular.isObject(segment)) {

            var segments = wire.getSegments();

            indexOfSegment = segments.indexOf(segment);

            if ( (indexOfSegment > 0 || wasCorner) && indexOfSegment < segments.length - 1) {

                $scope.diagram.config = $scope.diagram.config || {};

                if ($scope.diagram.config.editable === true &&
                    wire.nonSelectable !== true &&
                    wire.locationLocked !== true) {

                    $event.stopPropagation();

                    primartyTargetDescriptor = getDragDescriptor(wire, segment, indexOfSegment);

                    possibbleDragTargetsDescriptor = {
                        mousePosition: {
                            x: $event.pageX,
                            y: $event.pageY
                        },                                        
                        primaryTarget: primartyTargetDescriptor,
                        targets: [ primartyTargetDescriptor ]
                    };

                    possibbleDragTargetsDescriptor.selectedSegmentEndcornerIds = $scope.diagram.getSelectedSegmentEndcornerIds();

                }

            }
        }
    };

    this.onDiagramMouseUp = onDiagramMouseUp;
    this.onDiagramMouseMove = onDiagramMouseMove;
    this.onDiagramMouseLeave = onDiagramMouseLeave;
    this.onWindowBlur = onWindowBlur;
    this.onWireMouseUp = onWireMouseUp;
    this.onWireMouseDown = onWireMouseDown;

    return this;

};

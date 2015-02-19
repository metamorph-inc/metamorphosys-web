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

        moveOperation = operationsManager.initNew('MoveWires', $scope.diagram, possibbleDragTargetsDescriptor);

        $log.debug('Dragging wire', possibbleDragTargetsDescriptor);
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

        //angular.forEach(dragTargetsDescriptor.targets, function (target) {
        //    $rootScope.$emit('wireSegmentsMustBeSaved', target.wire);
        //
        //    if (target.wasCorner) {
        //        ga('send', 'event', 'corner', 'drag', target.wire.id);
        //    } else {
        //        ga('send', 'event', 'wire', 'drag', target.wire.id);
        //    }
        //
        //});

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

        if (possibbleDragTargetsDescriptor) {
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

    onWireMouseUp = function (wire, segment, $event) {

        possibbleDragTargetsDescriptor = null;

        finishDrag();
        $event.stopPropagation();

    };

    onWireMouseDown = function (wire, segment, $event, wasCorner) {

        var getDragDescriptor,
            indexOfSegment,
            primartyTargetDescriptor;

        getDragDescriptor = function (wire, segment, sIndex) {

            var offset = getOffsetToMouse($event);

            return {
                wire: wire,
                segment: segment,
                segmentIndex: sIndex,
                originalSegments: angular.copy(wire.segments),
                wasCorner: wasCorner,
                deltaToCursor1: {
                    x: segment.x1 - offset.x,
                    y: segment.y1 - offset.y
                },
                deltaToCursor2: {
                    x: segment.x2 - offset.x,
                    y: segment.y2 - offset.y
                }

            };


        };

        if (angular.isObject(wire) && angular.isObject(segment)) {

            indexOfSegment = wire.segments.indexOf(segment);

            if ( (indexOfSegment > 0 || wasCorner) && indexOfSegment < wire.segments.length - 1) {

                $scope.diagram.config = $scope.diagram.config || {};

                if ($scope.diagram.config.editable === true &&
                    wire.nonSelectable !== true &&
                    wire.locationLocked !== true) {

                    $event.stopPropagation();

                    primartyTargetDescriptor = getDragDescriptor(wire, segment, indexOfSegment);

                    possibbleDragTargetsDescriptor = {
                        primaryTarget: primartyTargetDescriptor,
                        targets: [ primartyTargetDescriptor ]
                    };

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

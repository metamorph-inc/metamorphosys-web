/*globals angular, ga*/

'use strict';

module.exports = function ($scope, $rootScope, diagramService, wiringService, operationsManager, $timeout, gridService, $log) {

    var self = this,
        getOffsetToMouse,
        possibbleDragTargetsDescriptor,
        dragTargetsDescriptor,

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

        //self.dragOperation = operationsManager.initNew('setComponentPosition');

        dragTargetsDescriptor = possibbleDragTargetsDescriptor;
        possibbleDragTargetsDescriptor = null;

        $log.debug('Dragging wire', dragTargetsDescriptor);

    };

    cancelDrag = function () {

        possibbleDragTargetsDescriptor = null;

        if (dragTargetsDescriptor) {

            angular.forEach(dragTargetsDescriptor.targets, function (target) {

                target.wire.segments = target.originalSegments;

            });

            dragTargetsDescriptor = null;

        }

        self.dragging = false;

    };

    finishDrag = function () {

        angular.forEach(dragTargetsDescriptor.targets, function (target) {
            $rootScope.$emit('wireSegmentsMustBeSaved', target.wire);

            if (target.wasCorner) {
                ga('send', 'event', 'corner', 'drag', target.wire.id);
            } else {
                ga('send', 'event', 'wire', 'drag', target.wire.id);
            }

        });

        self.dragging = false;

        dragTargetsDescriptor = null;

        $log.debug('Finish dragging');

    };

    onDiagramMouseMove = function ($event) {

        var offset,
            i,
            target,
            snappedPosition1,
            snappedPosition2;

        if (possibbleDragTargetsDescriptor) {
            startDrag();
        }

        if (dragTargetsDescriptor) {

            offset = getOffsetToMouse($event);

            for (i = 0; i < dragTargetsDescriptor.targets.length; i++) {

                target = dragTargetsDescriptor.targets[i];


                if (!target.wasCorner) {

                    snappedPosition1 = gridService.getSnappedPosition(
                        {
                            x: offset.x + target.deltaToCursor1.x,
                            y: offset.y + target.deltaToCursor1.y
                        });

                    snappedPosition2 = gridService.getSnappedPosition(
                        {
                            x: offset.x + target.deltaToCursor2.x,
                            y: offset.y + target.deltaToCursor2.y
                        });


                    target.wire.segments[target.segmentIndex - 1] =
                        wiringService.getSegmentsBetweenPositions(
                            {
                                end1: {
                                    x: target.wire.segments[target.segmentIndex - 1].x1,
                                    y: target.wire.segments[target.segmentIndex - 1].y1
                                },
                                end2: snappedPosition1
                            },
                            'SimpleRouter')[0];

                    target.wire.segments[target.segmentIndex] =
                        wiringService.getSegmentsBetweenPositions(
                            {
                                end1: snappedPosition1,
                                end2: snappedPosition2
                            }, 'SimpleRouter')[0];

                    target.wire.segments[target.segmentIndex + 1] =
                        wiringService.getSegmentsBetweenPositions(
                            {
                                end1: snappedPosition2,
                                end2: {
                                    x: target.wire.segments[target.segmentIndex + 1].x2,
                                    y: target.wire.segments[target.segmentIndex + 1].y2
                                }
                            },
                            'SimpleRouter')[0];
                } else {

                    snappedPosition2 = gridService.getSnappedPosition(
                        {
                            x: offset.x + target.deltaToCursor2.x,
                            y: offset.y + target.deltaToCursor2.y
                        });

                    target.wire.segments[target.segmentIndex] =
                        wiringService.getSegmentsBetweenPositions(
                            {
                                end1: {
                                    x: target.wire.segments[target.segmentIndex].x1,
                                    y: target.wire.segments[target.segmentIndex].y1
                                },
                                end2: snappedPosition2
                            }, 'SimpleRouter')[0];

                    target.wire.segments[target.segmentIndex + 1] =
                        wiringService.getSegmentsBetweenPositions(
                            {
                                end1: snappedPosition2,
                                end2: {
                                    x: target.wire.segments[target.segmentIndex + 1].x2,
                                    y: target.wire.segments[target.segmentIndex + 1].y2
                                }
                            },
                            'SimpleRouter')[0];

                }
            }

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

    onWireMouseUp = function (wire, segment, $event) {

        possibbleDragTargetsDescriptor = null;

        if (dragTargetsDescriptor) {
            finishDrag();
            $event.stopPropagation();
        }

    };

    onWireMouseDown = function (wire, segment, $event, wasCorner) {

        var getDragDescriptor,
            indexOfSegment;

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

                    possibbleDragTargetsDescriptor = {
                        targets: [getDragDescriptor(wire, segment, indexOfSegment)]
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

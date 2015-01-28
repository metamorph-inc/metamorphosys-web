/*globals angular*/

'use strict';

angular.module('mms.designVisualization.operations.moveWire', [])

    .run(function (operationsManager, $rootScope, wiringService, gridService, $timeout) {

        var type;

        type = 'MoveWires';

        operationsManager.registerOperation({
            type: type,
            operationClass: function () {

                var dragTargetsDescriptor,
                    dragTargetsWiresUpdate,
                    wireUpdateWait,
                    dragTargetsWiresUpdatePromises,

                    diagram;

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


                this.init = function (aDiagram, possibleDragTargetDescriptor) {
                    diagram = aDiagram;
                    dragTargetsDescriptor = possibleDragTargetDescriptor;
                };

                this.set = function (offset) {

                    var i,
                        target,
                        snappedPosition1,
                        snappedPosition2;

                    if (dragTargetsDescriptor) {

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

                this.cancel = function () {

                    if (angular.isObject(dragTargetsDescriptor)) {

                        angular.forEach(dragTargetsDescriptor.targets, function (target) {

                            target.wire.segments = target.originalSegments;

                        });

                        dragTargetsDescriptor = null;

                    }

                };

                this.finish = function () {

                    var message,
                        wires;

                    wires = dragTargetsDescriptor.targets.map(
                        function (target) {
                            return target.wire;
                        });

                    if (wires.length > 1) {
                        message = 'Dragging wires';
                    } else {
                        message = 'Dragging wire' + wires[0].label;
                    }

                    operationsManager.commitOperation(
                        type,
                        {
                            diagramId: diagram.id,
                            wires: wires,
                            message: message,
                            primaryTarget: dragTargetsDescriptor.primaryTarget
                        });

                };
            }
        });

    });

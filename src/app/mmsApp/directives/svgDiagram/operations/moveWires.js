/*globals angular*/

'use strict';

angular.module('mms.designVisualization.operations.moveWire', [])

.run(function(operationsManager, $rootScope, wiringService, gridService) {

    var type;

    type = 'MoveWires';

    operationsManager.registerOperation({
        type: type,
        operationClass: function() {

            var dragTargetsDescriptor,
                diagram;


            this.init = function(aDiagram, possibleDragTargetDescriptor) {
                diagram = aDiagram;
                dragTargetsDescriptor = possibleDragTargetDescriptor;

                diagram.clearExtraWireSegmentCorners(dragTargetsDescriptor.primaryTarget.segment._parameters._id, true);
            };

            this.set = function(offset) {

                var i,
                    target,
                    snappedPosition1,
                    snappedPosition2,
                    segments,
                    segmentParameters,
                    affectedSegmentParameters,
                    changedWiresById = {},
                    translation = null;

                if (dragTargetsDescriptor) {

                    for (i = 0; i < dragTargetsDescriptor.targets.length; i++) {

                        target = dragTargetsDescriptor.targets[i];

                        segments = target.wire.getSegments();

                        if (!target.wasCorner) {

                            snappedPosition1 = gridService.getSnappedPosition({
                                x: offset.x + target.deltaToCursor1.x,
                                y: offset.y + target.deltaToCursor1.y
                            });

                            snappedPosition2 = gridService.getSnappedPosition({
                                x: offset.x + target.deltaToCursor2.x,
                                y: offset.y + target.deltaToCursor2.y
                            });


                            segmentParameters = segments[target.segmentIndex - 1].getParameters();

                            if (translation === null) {

                                translation = {
                                    x: snappedPosition1.x - segmentParameters.x2,
                                    y: snappedPosition1.y - segmentParameters.y2
                                };
                            }

                            if (target.segmentIndex - 1 > 0 &&
                                segmentParameters.router &&
                                segmentParameters.router.type === 'ElbowRouter' &&
                                segmentParameters.elbowPartOrder === 1) {

                                // If it was part of an Elbow routed segment set, set the other part to
                                // simple-routed

                                affectedSegmentParameters = segments[target.segmentIndex - 2].getParameters();
                                affectedSegmentParameters.router = {
                                    type: 'SimpleRouter'
                                };

                                delete affectedSegmentParameters.elbowPartOrder;

                            }

                            target.wire.replaceSegmentFromProperties(
                                target.segmentIndex - 1,
                                wiringService.getSegmentsBetweenPositions({
                                        end1: {
                                            x: segmentParameters.x1,
                                            y: segmentParameters.y1
                                        },
                                        end2: snappedPosition1
                                    },
                                    'SimpleRouter')[0]
                            );

                            target.wire.replaceSegmentFromProperties(
                                target.segmentIndex,
                                wiringService.getSegmentsBetweenPositions({
                                    end1: snappedPosition1,
                                    end2: snappedPosition2
                                }, 'SimpleRouter')[0]
                            );

                            segmentParameters = segments[target.segmentIndex + 1].getParameters();

                            target.wire.replaceSegmentFromProperties(
                                target.segmentIndex + 1,
                                wiringService.getSegmentsBetweenPositions({
                                        end1: snappedPosition2,
                                        end2: {
                                            x: segmentParameters.x2,
                                            y: segmentParameters.y2
                                        }
                                    },
                                    'SimpleRouter')[0]
                            );

                            if (target.segmentIndex + 2 < segments.length &&
                                segmentParameters.router &&
                                segmentParameters.router.type === 'ElbowRouter' &&
                                segmentParameters.elbowPartOrder === 0) {

                                // If it was part of an Elbow routed segment set, set the other part to
                                // simple-routed

                                affectedSegmentParameters = segments[target.segmentIndex + 2].getParameters();
                                affectedSegmentParameters.router = {
                                    type: 'SimpleRouter'
                                };

                                delete affectedSegmentParameters.elbowPartOrder;

                            }

                        } else {

                            snappedPosition2 = gridService.getSnappedPosition({
                                x: offset.x + target.deltaToCursor2.x,
                                y: offset.y + target.deltaToCursor2.y
                            });

                            segmentParameters = segments[target.segmentIndex].getParameters();

                            if (translation === null) {

                                translation = {
                                    x: snappedPosition2.x - segmentParameters.x2,
                                    y: snappedPosition2.y - segmentParameters.y2
                                };
                            }

                            target.wire.replaceSegmentFromProperties(
                                target.segmentIndex,
                                wiringService.getSegmentsBetweenPositions({
                                    end1: {
                                        x: segmentParameters.x1,
                                        y: segmentParameters.y1
                                    },
                                    end2: snappedPosition2
                                }, 'SimpleRouter')[0]
                            );

                            if (target.segmentIndex > 0 &&
                                segmentParameters.router &&
                                segmentParameters.router.type === 'ElbowRouter' &&
                                segmentParameters.elbowPartOrder === 1) {

                                // If it was part of an Elbow routed segment set, set the other part to
                                // simple-routed

                                affectedSegmentParameters = segments[target.segmentIndex - 1].getParameters();
                                affectedSegmentParameters.router = {
                                    type: 'SimpleRouter'
                                };

                                delete affectedSegmentParameters.elbowPartOrder;

                            }


                            segmentParameters = segments[target.segmentIndex + 1].getParameters();

                            target.wire.replaceSegmentFromProperties(
                                target.segmentIndex + 1,
                                wiringService.getSegmentsBetweenPositions({
                                        end1: snappedPosition2,
                                        end2: {
                                            x: segmentParameters.x2,
                                            y: segmentParameters.y2
                                        }
                                    },
                                    'SimpleRouter')[0]
                            );

                            if (target.segmentIndex + 2 < segments.length &&
                                segmentParameters.router &&
                                segmentParameters.router.type === 'ElbowRouter' &&
                                segmentParameters.elbowPartOrder === 0) {

                                // If it was part of an Elbow routed segment set, set the other part to
                                // simple-routed

                                affectedSegmentParameters = segments[target.segmentIndex + 2].getParameters();
                                affectedSegmentParameters.router = {
                                    type: 'SimpleRouter'
                                };

                                delete affectedSegmentParameters.elbowPartOrder;

                            }

                        }

                        changedWiresById[target.wire.getId()] = target.wire;

                    }

                    angular.forEach(dragTargetsDescriptor.selectedSegmentEndcornerIds, function(wireAndIndex) {

                        var parentWire = diagram.getWireById(wireAndIndex[0]);

                        if (!changedWiresById[parentWire.getId()]) {

                            parentWire.translateSegmentEndCorner(wireAndIndex[1], translation);

                        }

                    });


                    diagram.afterWireChange(changedWiresById);
                }



            };

            this.cancel = function() {

                if (angular.isObject(dragTargetsDescriptor)) {

                    angular.forEach(dragTargetsDescriptor.targets, function(target) {

                        target.wire.makeSegmentsFromParameters(target.originalSegmentsParameters, null, true);

                    });

                    dragTargetsDescriptor = null;

                }

            };

            this.finish = function() {

                var message,
                    wires;

                wires = dragTargetsDescriptor.targets.map(
                    function(target) {
                        return target.wire;
                    });

                angular.forEach(dragTargetsDescriptor.selectedSegmentEndcornerIds, function(wireAndIndex) {

                    var parentWire = diagram.getWireById(wireAndIndex[0]);

                    if (wires.indexOf(parentWire) === -1) {
                        wires.push(parentWire);
                    }

                });

                if (wires.length > 1) {
                    message = 'Dragging wires';
                } else {
                    message = 'Dragging wire' + wires[0].label;
                }

                operationsManager.commitOperation(
                    type, {
                        diagramId: diagram.id,
                        wires: wires,
                        message: message,
                        primaryTarget: dragTargetsDescriptor.primaryTarget
                    });

            };
        }
    });

});

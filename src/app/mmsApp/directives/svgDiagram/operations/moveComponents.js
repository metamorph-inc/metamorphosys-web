/*globals angular*/

'use strict';

angular.module('mms.designVisualization.operations.moveComponents', [])

    .run(function (operationsManager, $rootScope, wiringService, gridService) {

        var type;

        type = 'MoveComponents';

        operationsManager.registerOperation({
            type: type,
            operationClass: function () {

                var dragTargetsDescriptor,
                    diagram;


                this.init = function (aDiagram, possibleDragTargetDescriptor) {
                    diagram = aDiagram;
                    dragTargetsDescriptor = possibleDragTargetDescriptor;
                };

                this.set = function (offset) {

                    var i,
                        target,
                        snappedPosition,
                        componentsBeingMoved = {},
                        translation = null;

                    for (i = 0; i < dragTargetsDescriptor.targets.length; i++) {

                        target = dragTargetsDescriptor.targets[i];

                        snappedPosition = gridService.getSnappedPosition(
                            {
                                x: offset.x + target.deltaToCursor.x,
                                y: offset.y + target.deltaToCursor.y
                            });

                        if (translation === null) {

                            var earlierPosition = target.component.getPosition();

                            translation = {
                                x: snappedPosition.x - earlierPosition.x, 
                                y: snappedPosition.y - earlierPosition.y
                            };
                        }

                        target.component.setPosition(
                            snappedPosition.x,
                            snappedPosition.y
                        );

                    }

                    angular.forEach(dragTargetsDescriptor.affectedWires, function (wire) {

                        var ends = wire.getEnds();

                        if (dragTargetsDescriptor.componentsBeingDragged.indexOf(ends.end1.component) !== -1 &&
                            dragTargetsDescriptor.componentsBeingDragged.indexOf(ends.end2.component) !== -1) {

                            // Adjust all segments

                            //wiringService.adjustWireEndSegments(wire);                            
                            wire.translateSegments(translation);


                        } else {

                            // Only adjust ends

                            wiringService.adjustWireEndSegments(wire);
                        }

                    });


                    diagram.afterWireChange(dragTargetsDescriptor.affectedWires);                    

                };

                this.cancel = function () {

                    if (angular.isObject(dragTargetsDescriptor)) {

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

                };

                this.finish = function () {

                    var message,
                        components;

                    components = dragTargetsDescriptor.componentsBeingDragged;

                    if (components.length > 1) {
                        message = 'Dragging selection';
                    } else {
                        message = 'Dragging ' + components[0].label;
                    }

                    operationsManager.commitOperation(
                        type,
                        {
                            diagramId: diagram.id,
                            components: components,
                            wires: dragTargetsDescriptor.affectedWires,
                            message: message,
                            primaryTarget: dragTargetsDescriptor.primaryTarget
                        });

                    //$scope.$emit('wiresChange', {
                    //    diagramId: $scope.diagram.id,
                    //    wires: dragTargetsDescriptor.affectedWires
                    //});

                };
            }
        });

    });

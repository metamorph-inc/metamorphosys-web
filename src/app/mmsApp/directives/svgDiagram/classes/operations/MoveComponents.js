/*globals angular, ga*/

'use strict';

module.exports = function ($rootScope, wiringService, gridService, $timeout) {

    return function () {

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
                snappedPosition;

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

        this.commit = function () {

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

            $rootScope.$emit('componentsPositionChange', {
                diagramId: diagram.id,
                components: components,
                message: message
            });

            if (angular.isFunction(ga)) {
                ga('send', 'event', 'component', 'drag', components[0].label);
            }

            //$scope.$emit('wiresChange', {
            //    diagramId: $scope.diagram.id,
            //    wires: dragTargetsDescriptor.affectedWires
            //});

        };
    };

};

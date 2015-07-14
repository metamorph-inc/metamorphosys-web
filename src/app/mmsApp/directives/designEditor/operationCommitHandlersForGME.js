/*globals angular, ga*/

'use strict';

angular.module('mms.designVisualization.operations.gmeCommitHandlers', [])
    .run(function(operationsManager, projectHandling, designLayoutService, $timeout, $q, nodeService) {

        operationsManager.registerCommitHandler('RotateComponents', function(data) {

            var i,
                deferred;

            i = 0;

            deferred = $q.defer();

            //nodeService.startTransaction(designCtx, data.message);

            angular.forEach(data.components, function(component) {

                $timeout(function() {

                    designLayoutService.setRotation(
                        projectHandling.getContainerLayoutContext(),
                        component.id,
                        component.rotation,
                        data.message
                    );
                }, 10 * i, false);

                i++;

            });

            if (angular.isFunction(ga)) {
                ga('send', 'event', 'component', 'rotate', data.components[0].id);
            }

            deferred.resolve();

            //nodeService.completeTransaction(designCtx);

            return deferred.promise;

        });


        operationsManager.registerCommitHandler('MoveComponents', function(data) {

            var componentPromises,
                wirePromises,
                i = 0;



            var layoutContext = projectHandling.getContainerLayoutContext();

            nodeService.startTransaction(layoutContext, data.message);

            componentPromises = data.components.map(function(component) {

                return $timeout(function() {
                    return designLayoutService.setPosition(
                        layoutContext,
                        component.id,
                        component.getPosition(),
                        data.message
                    );
                }, 10 * i++, false);

            });

            wirePromises = data.wires.map(function (wire) {

                // Save wire change

                return designLayoutService.setWireSegments(
                    projectHandling.getContainerLayoutContext(),
                    wire.getId(),
                    wire.getCopyOfSegmentsParameters(),
                    data.message || 'Updating wire'
                );

            });


            if (angular.isFunction(ga)) {
                ga('send', 'event', 'component', 'drag', data.primaryTarget.label);
            }


            return $q.all([$q.all(componentPromises), $q.all(wirePromises)])
                .then(function () {
                    nodeService.completeTransaction(layoutContext);
                });

        });


        operationsManager.registerCommitHandler('MoveWires', function(data) {

            var i;

            i = 0;

            //nodeService.startTransaction(designCtx, data.message);

             $q.all(data.wires.map(function(wire) {

                return $timeout(function() {

                    designLayoutService.setWireSegments(
                        projectHandling.getContainerLayoutContext(),
                        wire.getId(),
                        wire.getCopyOfSegmentsParameters(true),
                        data.message || 'Updating wire'
                    );

                }, 10 * i++, false);

            })).then(function () {
                // nodeService.completeTransaction(designCtx);
            });

            if (data.primaryTarget.wasCorner) {
                ga('send', 'event', 'corner', 'drag', data.primaryTarget.id);
            } else {
                ga('send', 'event', 'wire', 'drag', data.primaryTarget.id);
            }




        });

        operationsManager.registerCommitHandler('RelabelComponent', function(data) {

            var i,
                label,
                context;


            context = projectHandling.getContainerLayoutContext();

            angular.forEach(data.components, function(component) {

                label = component.getLabel();

                $timeout(function() {

                    nodeService.loadNode(context, component.id).then(function(node) {

                        node.setAttribute('name', label, data.message);

                    });
                }, 10 * i, false);

                i++;

            });

            if (angular.isFunction(ga)) {
                ga('send', 'event', 'component', 'label', label);
            }

        });

        operationsManager.registerCommitHandler('ReorderComponent', function(data) {

            var i,
                label;

            angular.forEach(data.components, function(component) {

                label = component.getLabel();

                $timeout(function() {

                    designLayoutService.setPosition(
                        projectHandling.getContainerLayoutContext(),
                        component.id,
                        component.getPosition(),
                        data.message
                    );

                }, 10 * i, false);

                i++;

            });

            if (angular.isFunction(ga)) {
                ga('send', 'event', 'component', 'drag', label);
            }

        });

    });

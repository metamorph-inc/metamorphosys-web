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

            var i;

            i = 0;



            var layoutContext = projectHandling.getContainerLayoutContext();

            nodeService.startTransaction(layoutContext, data.message);

            angular.forEach(data.components, function(component) {

                $timeout(function() {

                    designLayoutService.setPosition(
                        layoutContext,
                        component.id,
                        component.getPosition(),
                        data.message
                    );
                }, 10 * i, false);

                i++;

            });

            angular.forEach(data.wires, function (wire) {

                var ends = wire.getEnds();

                if (data.components.indexOf(ends.end1.component) !== -1 &&
                    data.components.indexOf(ends.end2.component) !== -1) {

                    // Save wire change

                    designLayoutService.setWireSegments(
                        projectHandling.getContainerLayoutContext(),
                        wire.getId(),
                        wire.getCopyOfSegmentsParameters(true),
                        data.message || 'Updating wire'
                    );                                        

                } 

            });


            if (angular.isFunction(ga)) {
                ga('send', 'event', 'component', 'drag', data.primaryTarget.label);
            }


            nodeService.completeTransaction(layoutContext);

        });


        operationsManager.registerCommitHandler('MoveWires', function(data) {

            var i;

            i = 0;

            //nodeService.startTransaction(designCtx, data.message);

            angular.forEach(data.wires, function(wire) {

                $timeout(function() {

                    designLayoutService.setWireSegments(
                        projectHandling.getContainerLayoutContext(),
                        wire.getId(),
                        wire.getCopyOfSegmentsParameters(true),
                        data.message || 'Updating wire'
                    );

                }, 10 * i, false);

                i++;

            });

            if (data.primaryTarget.wasCorner) {
                ga('send', 'event', 'corner', 'drag', data.primaryTarget.id);
            } else {
                ga('send', 'event', 'wire', 'drag', data.primaryTarget.id);
            }


            //nodeService.completeTransaction(designCtx);

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
                ga('send', 'event', 'component', 'drag', label);
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

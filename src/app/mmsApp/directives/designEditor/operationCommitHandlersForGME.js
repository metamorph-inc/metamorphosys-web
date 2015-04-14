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

            //nodeService.startTransaction(designCtx, data.message);

            angular.forEach(data.components, function(component) {

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
                ga('send', 'event', 'component', 'drag', data.primaryTarget.label);
            }


            //nodeService.completeTransaction(designCtx);

        });


        operationsManager.registerCommitHandler('MoveWires', function(data) {

            var i;

            i = 0;

            //nodeService.startTransaction(designCtx, data.message);

            angular.forEach(data.wires, function(wire) {

                $timeout(function() {

                    designLayoutService.setWireSegments(
                        projectHandling.getContainerLayoutContext(),
                        wire.id,
                        angular.copy(wire.segments),
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

/*globals angular, ga*/

'use strict';

angular.module('mms.designVisualization.operations.gmeCommitHandlers', [])
    .run(function (operationsManager, $rootScope, designLayoutService, $timeout, $q) {

        operationsManager.registerCommitHandler('RotateComponents', function (data) {

            var i,
                deferred;

            i = 1;

            deferred = $q.defer();

            //nodeService.startTransaction(designCtx, data.message);

            angular.forEach(data.components, function (component) {

                $timeout(function () {

                    designLayoutService.setRotation(
                        $rootScope.designCtx,
                        component.id,
                        component.rotation,
                        data.message
                    );
                }, 10 * i);

                i++;

            });

            if (angular.isFunction(ga)) {
                ga('send', 'event', 'component', 'rotate', data.components[0].id);
            }

            deferred.resolve();

            //nodeService.completeTransaction(designCtx);

            return deferred.promise;

        });


        operationsManager.registerCommitHandler('MoveComponents', function (data) {

            var i;

            i = 1;

            //nodeService.startTransaction(designCtx, data.message);

            angular.forEach(data.components, function (component) {

                $timeout(function () {

                    designLayoutService.setPosition(
                        $rootScope.designCtx,
                        component.id,
                        component.getPosition(),
                        data.message
                    );
                }, 10 * i);

                i++;

            });

            if (angular.isFunction(ga)) {
                ga('send', 'event', 'component', 'drag', data.primaryTarget.label);
            }


            //nodeService.completeTransaction(designCtx);

        });


        operationsManager.registerCommitHandler('MoveWires', function (data) {

            var i;

            i = 1;

            //nodeService.startTransaction(designCtx, data.message);

            angular.forEach(data.wires, function (wire) {

                $timeout(function () {

                    designLayoutService.setWireSegments(
                        $rootScope.designCtx,
                        wire.id,
                        angular.copy(wire.segments),
                        data.message || 'Updating wire'
                    );

                }, 10 * i);

                i++;

            });

            if (data.primaryTarget.wasCorner) {
                ga('send', 'event', 'corner', 'drag', data.primaryTarget.id);
            } else {
                ga('send', 'event', 'wire', 'drag', data.primaryTarget.id);
            }


            //nodeService.completeTransaction(designCtx);

        });
    }
);

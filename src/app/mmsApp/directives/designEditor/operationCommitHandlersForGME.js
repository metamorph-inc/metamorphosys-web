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
                ga('send', 'event', 'component', 'drag', data.components[0].label);
            }


            //nodeService.completeTransaction(designCtx);

        });

    }
);

/*globals angular*/

'use strict';

module.exports = function(designCtx, $rootScope, designLayoutService, $timeout) {

    $rootScope.$on('componentsRotationChange', function (e, data) {

        var i;

        i = 1;

        //nodeService.startTransaction(designCtx, data.message);

        angular.forEach(data.components, function (component) {

            $timeout(function () {

                designLayoutService.setRotation(
                    designCtx,
                    component.id,
                    component.rotation,
                    data.message
                );
            }, 10 * i);

            i++;

        });

        //nodeService.completeTransaction(designCtx);

    });


    $rootScope.$on('componentsPositionChange', function (e, data) {

        var i;

        i = 1;

        //nodeService.startTransaction(designCtx, data.message);

        angular.forEach(data.components, function (component) {

            $timeout(function () {

                designLayoutService.setPosition(
                    designCtx,
                    component.id,
                    component.getPosition(),
                    data.message
                );
            }, 10 * i);

            i++;

        });

        //nodeService.completeTransaction(designCtx);

    });

};

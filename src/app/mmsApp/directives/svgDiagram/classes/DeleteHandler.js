/*globals*/

'use strict';

module.exports = function ($scope) {

    $scope.$on('keydownOnDocument', function ($event, event) {


        if (event.keyCode === 8) {

            if ($scope.diagram.state.selectedComponentIds.length) {

                console.log('should delete selected');

            }

        }

    });

    return this;

};

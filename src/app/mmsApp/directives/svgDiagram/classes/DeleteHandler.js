/*globals*/

'use strict';

module.exports = function ($scope, $rootScope) {

    $scope.$on('keydownOnDocument', function ($event, event) {


        if (event.keyCode === 8) {

            if ($scope.diagram.state.selectedComponentIds.length) {

                $rootScope.$emit('componentDeletionMustBeDone', $scope.diagram.getSelectedComponents());

            }

        }

    });

    return this;

};

/*globals angular*/

'use strict';

module.exports = function($scope, $rootScope, operationsManager, mmsUtils) {

    $scope.$on('keydownOnDocument', function($event, event) {

        var operation,
            wire,
            primaryTargetDescriptor,
            possibbleDragTargetsDescriptor,
            selectedWires;

        if ( mmsUtils.ifNotFromInput(event) &&  $scope.diagram && $scope.diagram.state && $scope.diagram.state.selectedWireIds.length) {

            // Delete

            if (event.keyCode === 8 || event.keyCode === 46) {

                selectedWires = $scope.diagram.getSelectedWires();

                $rootScope.$emit('wireDeletionMustBeDone', selectedWires[0]);

            }


        }

    });

    return this;

};

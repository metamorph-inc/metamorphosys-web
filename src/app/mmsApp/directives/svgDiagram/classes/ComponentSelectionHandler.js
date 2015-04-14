/*globals angular*/

'use strict';

module.exports = function($scope, diagramService, gridService) {

    var onComponentMouseUp,
        toggleComponentSelected;

    toggleComponentSelected = function(component, $event) {

        if (component.selected) {

            $scope.diagram.deselectComponent(component.id);

        } else {

            if (!$scope.diagram.config.singleSelect && $event.shiftKey) {

                $scope.diagram.selectComponent(component.id);

            } else {

                $scope.diagram.clearSelection(true);
                $scope.diagram.selectComponent(component.id);

            }

        }

    };


    onComponentMouseUp = function(component, $event) {
        toggleComponentSelected(component, $event);

    };

    this.onComponentMouseUp = onComponentMouseUp;

    return this;

};

/*globals angular*/

'use strict';

module.exports = function($scope, diagramService, gridService, $log) {

    var onComponentMouseUp,
        toggleComponentSelected;

    toggleComponentSelected = function(component, $event) {

        var index;

        $scope.diagram.config = $scope.diagram.config || {};

        if (angular.isObject(component) && $scope.diagram.config.disallowSelection !== true && component.nonSelectable !== true) {

            index = $scope.diagram.state.selectedComponentIds.indexOf(component.id);

            if (index > -1) {

                $scope.diagram.state.selectedComponentIds.splice(index, 1);

            } else {

                if ($scope.diagram.state.selectedComponentIds.length > 0 &&
                    $scope.diagram.config.multiSelect !== true &&
                    $event.shiftKey !== true) {

                    angular.forEach($scope.diagram.state.selectedComponentIds, function(componentId) {
                        $scope.diagram.componentsById[componentId].selected = false;
                    });
                    $scope.diagram.state.selectedComponentIds = [];
                }

                $scope.diagram.state.selectedComponentIds.push(component.id);

            }

            $log.debug('selecteds', $scope.diagram.state.selectedComponentIds);

        }

    };


    onComponentMouseUp = function(component, $event) {
        toggleComponentSelected(component, $event);

    };

    this.onComponentMouseUp = onComponentMouseUp;

    return this;

};

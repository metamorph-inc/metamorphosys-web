/*globals angular*/

'use strict';

module.exports = function($scope, diagramService, $timeout) {

    var onComponentMouseUp,
        toggleWireSelected,
        onWireMouseUp,
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

    toggleWireSelected = function(wire, $event) {

        var wireId = wire.getId();

        if (wire.selected) {

            $scope.diagram.deselectWire(wireId);

        } else {

            if (!$scope.diagram.config.singleSelect && $event.shiftKey) {

                $scope.diagram.selectWire(wireId);

            } else {

                $scope.diagram.clearSelection(true);
                $scope.diagram.selectWire(wireId);

            }

        }

    };

    onComponentMouseUp = function(component, $event) {
        toggleComponentSelected(component, $event);

    };

    onWireMouseUp = function(wire, $event) {

        $timeout(function() {
            toggleWireSelected(wire, $event);
        });

    };

    this.onComponentMouseUp = onComponentMouseUp;
    this.onWireMouseUp = onWireMouseUp;

    return this;

};

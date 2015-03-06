/*globals angular*/

'use strict';

module.exports = function ($scope, $rootScope, operationsManager) {

    $scope.$on('keydownOnDocument', function ($event, event) {

        var operation,
            component,
            primaryTargetDescriptor,
            possibbleDragTargetsDescriptor,
            selectedComponents,
            componentsToDrag,
            multiplier,
            offset,
            getDragDescriptor;

        getDragDescriptor = function (component) {

            var offset = { x:0, y:0 };

            return {
                component: component,
                originalPosition: {
                    x: component.x,
                    y: component.y
                },
                deltaToCursor: {
                    x: component.x - offset.x,
                    y: component.y - offset.y
                }
            };

        };

        if ($scope.diagram && $scope.diagram.state && $scope.diagram.state.selectedComponentIds.length) {


            selectedComponents = $scope.diagram.getSelectedComponents();

            // Delete

            if (event.keyCode === 8 || event.keyCode === 46) {

                $rootScope.$emit('componentDeletionMustBeDone', selectedComponents);

            }

            // Enter

            if (event.keyCode === 13 && selectedComponents.length === 1) {

                component = selectedComponents[0];

                if (component.isContainer) {
                    $rootScope.$emit('containerMustBeOpened', component);
                }

            }

            // Rotate: r, Sh-r

            if (event.keyCode === 82) {

                operation = operationsManager.initNew(
                    'RotateComponents',
                    $scope.diagram,
                    $scope.diagram.getSelectedComponents()[0]
                );
                operation.set( event.shiftKey ? -90 : 90 );
                operation.finish();

            }


            // Translate: 38, 39, 40, 37

            if( event.keyCode >= 37 && event.keyCode <= 40 ) {

                component = selectedComponents[0];

                if (event.shiftKey) {
                    multiplier = 10;
                } else {
                    multiplier = 1;
                }

                if (component.locationLocked !== true) {

                    primaryTargetDescriptor = getDragDescriptor(component);

                    possibbleDragTargetsDescriptor = {
                        primaryTarget: primaryTargetDescriptor,
                        targets: [primaryTargetDescriptor]
                    };

                    componentsToDrag = [];


                    // Drag along other selected components

                    angular.forEach($scope.diagram.state.selectedComponentIds, function (selectedComponentId) {

                        var selectedComponent;

                        selectedComponent = $scope.diagram.componentsById[selectedComponentId];

                        possibbleDragTargetsDescriptor.targets.push(getDragDescriptor(
                            selectedComponent));

                        componentsToDrag.push(selectedComponent);

                    });

                    possibbleDragTargetsDescriptor.affectedWires = $scope.diagram.getWiresForComponents(
                        componentsToDrag
                    );


                    operation = operationsManager.initNew(
                        'MoveComponents',
                        $scope.diagram,
                        possibbleDragTargetsDescriptor
                    );


                    if (event.keyCode === 38) {
                        offset = { x: 0, y: -10 * multiplier };
                    }

                    if (event.keyCode === 39) {
                        offset = { x: 10 * multiplier, y:0 };
                    }

                    if (event.keyCode === 40) {
                        offset = { x: 0, y: 10 * multiplier };
                    }

                    if (event.keyCode === 37) {
                        offset = { x: -10 * multiplier, y:0 };
                    }

                    operation.set(offset);

                    operation.finish();
                }
            }

        }

    });

    return this;

};

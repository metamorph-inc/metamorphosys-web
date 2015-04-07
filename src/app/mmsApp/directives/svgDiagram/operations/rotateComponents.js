/*globals angular*/

'use strict';

angular.module('mms.designVisualization.operations.rotateComponents', [])

.run(function(operationsManager, $rootScope, wiringService) {

    var type;

    type = 'RotateComponents';

    operationsManager.registerOperation({
        type: type,
        operationClass: function() {

            var diagram,
                angle;

            this.init = function(aDiagram, component) {

                diagram = aDiagram;
                this.component = component;
            };

            this.set = function(anAngle) {
                angle = anAngle;
            };

            this.finish = function() {

                var componentsToRotate,
                    selectedComponents,
                    component,
                    affectedWires,
                    message;

                component = this.component;

                selectedComponents = diagram.getSelectedComponents();

                if (selectedComponents.indexOf(component) > -1) {
                    componentsToRotate = selectedComponents;
                } else {
                    componentsToRotate = [ component ];
                }

                affectedWires = diagram.getWiresForComponents(
                    componentsToRotate
                );

                angular.forEach(componentsToRotate, function(aComponent) {
                    aComponent.rotate(angle);
                });


                angular.forEach(affectedWires, function(wire) {
                    wiringService.adjustWireEndSegments(wire);
                });

                if (componentsToRotate.length > 1) {
                    message = 'Rotating selection by ' + angle + 'deg';
                } else {
                    message = 'Rotating ' + component.label + ' by ' + angle + 'deg';
                }

                operationsManager.commitOperation(
                    type, {
                        diagramId: diagram.id,
                        components: componentsToRotate,
                        message: message
                    }
                );

            };
        }
    });
});

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
                    component,
                    affectedWires,
                    message;

                componentsToRotate = [];

                component = this.component;

                componentsToRotate.push(this.component);

                componentsToRotate = diagram.getSelectedComponents();

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

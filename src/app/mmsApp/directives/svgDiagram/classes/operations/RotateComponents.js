/*globals angular, ga*/

'use strict';

angular.module('mms.designVisualization.operations.rotateComponents', [])

    .run(function (operationsManager, $rootScope, wiringService) {

        operationsManager.registerOperation({
            id: 'RotateComponents',
            operationClass: function () {

                var diagram,
                    angle;

                this.init = function (aDiagram, component) {

                    diagram = aDiagram;
                    this.component = component;
                };

                this.set = function (anAngle) {
                    angle = anAngle;
                };

                this.commit = function () {

                    var componentsToRotate,
                        component,
                        affectedWires,
                        message;

                    componentsToRotate = [];

                    component = this.component;

                    componentsToRotate.push(this.component);

                    if (diagram.state.selectedComponentIds.indexOf(this.component.id) > -1) {

                        angular.forEach(diagram.state.selectedComponentIds, function (selectedComponentId) {

                            var selectedComponent;

                            if (component.id !== selectedComponentId) {

                                selectedComponent = diagram.componentsById   [selectedComponentId];

                                componentsToRotate.push(selectedComponent);

                            }

                        });
                    }

                    affectedWires = diagram.getWiresForComponents(
                        componentsToRotate
                    );

                    angular.forEach(componentsToRotate, function (component) {
                        component.rotate(angle);
                    });


                    angular.forEach(affectedWires, function (wire) {
                        wiringService.adjustWireEndSegments(wire);
                    });

                    if (componentsToRotate.length > 1) {
                        message = 'Rotating selection by ' + angle + 'deg';
                    } else {
                        message = 'Rotating ' + component.label + ' by ' + angle + 'deg';
                    }

                    $rootScope.$emit('componentsRotationChange', {
                        diagramId: diagram.id,
                        components: componentsToRotate,
                        message: message
                    });

                    if (angular.isFunction(ga)) {
                        ga('send', 'event', 'component', 'rotate', component.id);
                    }

                };
            }
        });
    });

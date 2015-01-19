/*globals angular, ga*/

'use strict';

module.exports =  function($rootScope, wiringService) {

    return function() {

        this.init = function (diagram, component) {

            this.diagram = diagram;
            this.component = component;
        };

        this.set = function (angle) {
            this.angle = angle;
        };

        this.commit = function () {

            var componentsToRotate,
                component,
                angle,
                affectedWires,
                message;

            componentsToRotate = [];

            component = this.component;
            angle = this.angle;

            componentsToRotate.push(this.component);

            if (this.diagram.state.selectedComponentIds.indexOf(this.component.id) > -1) {

                angular.forEach(this.diagram.state.selectedComponentIds, function (selectedComponentId) {

                    var selectedComponent;

                    if (component.id !== selectedComponentId) {

                        selectedComponent = this.diagram.componentsById   [selectedComponentId];

                        componentsToRotate.push(selectedComponent);

                    }

                });
            }

            affectedWires = this.diagram.getWiresForComponents(
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
                diagramId: this.diagram.id,
                components: componentsToRotate,
                message: message
            });

            if (angular.isFunction(ga)) {
                ga('send', 'event', 'component', 'rotate', component.id);
            }

        };
    };
};

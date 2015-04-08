/*globals angular*/

'use strict';

angular.module('mms.designVisualization.operations.reorderComponent', [])

.run(function(operationsManager) {

    var type;

    type = 'ReorderComponent';

    operationsManager.registerOperation({
        type: type,

        operationClass: function() {

            var diagram,
                z;

            this.init = function(aDiagram, component) {

                diagram = aDiagram;
                this.component = component;
            };

            this.set = function(aZ) {
                z = aZ;
            };

            this.finish = function() {

                var component,
                    message,
                    position;

                component = this.component;

                position = component.getPosition();
                position.z = z;
                component.setPosition(position.x, position.y, position.z);

                message = 'Reordering ' + component.label + ' to ' + z;

                operationsManager.commitOperation(
                    type, {
                        diagramId: diagram.id,
                        components: [ component ],
                        message: message
                    }
                );

            };
        }
    });
});

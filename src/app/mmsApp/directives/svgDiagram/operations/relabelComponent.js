/*globals angular*/

'use strict';

angular.module('mms.designVisualization.operations.relabelComponent', [])

.run(function(operationsManager) {

    var type;

    type = 'RelabelComponent';

    operationsManager.registerOperation({
        type: type,

        operationClass: function() {

            var diagram,
                label;

            this.init = function(aDiagram, component) {

                diagram = aDiagram;
                this.component = component;
            };

            this.set = function(alabel) {
                label = alabel;
            };

            this.finish = function() {

                var component,
                    message;

                component = this.component;

                component.setLabel(label);

                message = 'Renaming ' + component.label + ' to ' + label;

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
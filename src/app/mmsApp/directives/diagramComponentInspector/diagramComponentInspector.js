'use strict';

require('./inspectedContainerDetails.js');
require('./inspectedComponentDetails.js');

angular.module('mms.diagramComponentInspector', [
        'mms.diagramComponentInspector.inspectedContainerDetails',
        'mms.diagramComponentInspector.inspectedComponentDetails'
    ])
    .directive('diagramComponentInspector', [
        function() {

            function DiagramComponentInspectorController() {

                this.config = this.config || {
                    noInspectableMessage: 'Select a diagram element to inspect.'
                };

            }



            return {
                restrict: 'E',
                controller: DiagramComponentInspectorController,
                controllerAs: 'ctrl',
                bindToController: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/diagramComponentInspector.html',
                require: [],
                scope: {
                    inspectable: '=',
                    config: '@'
                }
            };
        }
    ]);

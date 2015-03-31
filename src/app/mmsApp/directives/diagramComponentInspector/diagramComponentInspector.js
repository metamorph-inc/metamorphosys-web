'use strict';

angular.module('mms.diagramComponentInspector', [])
    .directive('diagramComponentInspector', [
        function() {

            function DiagramComponentInspectorController() {

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
                    component: '='
                }
            };
        }
    ]);

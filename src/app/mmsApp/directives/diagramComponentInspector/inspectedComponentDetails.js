'use strict';

angular.module('mms.diagramComponentInspector.inspectedComponentDetails', [
        'mms.componentDetails.react'
    ])
    .directive('inspectedComponentDetails', [
        function() {

            function InspectorController() {


            }

            return {
                restrict: 'E',
                controller: InspectorController,
                controllerAs: 'ctrl',
                bindToController: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/inspectedComponentDetails.html',
                require: [],
                scope: {
                    component: '='
                }
            };
        }
    ]);

'use strict';

angular.module('mms.diagramComponentInspector.inspectedContainerDetails', [
    ])
    .directive('inspectedContainerDetails', [
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
                templateUrl: '/mmsApp/templates/inspectedContainerDetails.html',
                require: [],
                scope: {
                    container: '='
                }
            };
        }
    ]);

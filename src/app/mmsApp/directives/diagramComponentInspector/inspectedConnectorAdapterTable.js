'use strict';

angular.module('mms.diagramComponentInspector.inspectedConnectorAdapterTable', [
        'mms.componentDetails.react'
    ])
    .directive('inspectedConnectorAdapterTable', [
        function() {

            function InspectorController(projectHandling, connectorAdapterService) {

                this.projectHandling = projectHandling;
                this.connectorAdapterService = connectorAdapterService;

                InspectorController.prototype.commitMapping = function() {

                    // Build new map.
                    var idPairs = [];
                    this.data.details.connectors[0].ports.forEach(function(port) {
                        angular.forEach(port.mapping, function(value, key) {
                            if (value) {
                                idPairs.push([port.id, key]);
                            }
                        });
                    });

                    var parentContext = this.projectHandling.getContainerLayoutContext();
                    this.connectorAdapterService.setMapping(parentContext, this.data.id, idPairs);

                };

            }

            return {
                restrict: 'E',
                controller: InspectorController,
                controllerAs: 'ctrl',
                bindToController: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/inspectedConnectorAdapterTable.html',
                require: [],
                scope: {
                    data: '='
                }
            };
        }
    ]);
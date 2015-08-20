'use strict';

angular.module('mms.diagramComponentInspector.inspectedConnectorAdapterTable', [
        'mms.componentDetails.react'
    ])
    .directive('inspectedConnectorAdapterTable', [
        function() {

            function InspectorController($scope, $rootScope, projectHandling, connectorAdapterService) {

                this.projectHandling = projectHandling;
                this.connectorAdapterService = connectorAdapterService;
                this.processingMapping = false;

                InspectorController.prototype.commitMapping = function() {

                    $rootScope.setProcessing();
                    this.processingMapping = true;

                    // Build new map.
                    var idPairs = [];
                    this.data.details.connectors[1].ports.forEach(function(port) {
                        angular.forEach(port.mapping, function(value, key) {
                            if (value) {
                                idPairs.push([port.id, key]);
                            }
                        });
                    });

                    var parentContext = this.projectHandling.getContainerLayoutContext();
                    this.connectorAdapterService.setMapping(parentContext, this.data.id, idPairs)
                        .then(function() {
                            $rootScope.stopProcessing();
                            $scope.ctrl.processingMapping = false;
                        });

                };

                $scope.$watch('ctrl.processingMapping', function(isMapping) {
                    this.processingMapping = isMapping;
                });

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
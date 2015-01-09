/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module('mms.designVisualization.designEditor', [])
    .controller('DesignEditorController', function ($scope, $rootScope, diagramService, $log, connectionHandling,
                                                    designService, $stateParams, designLayoutService, symbolManager, $timeout,
                                                    nodeService, gridService) {

        var RandomSymbolGenerator,
            randomSymbolGenerator,

            designCtx,

            setupDiagramEventHandlers,
            eventHandlersAreSet,
            lastComponentInstantiationPosition;

        $scope.diagram = null;

        $scope.mainGMEConnectionId = connectionHandling.getMainGMEConnectionId();

        designCtx = {
            db: $scope.mainGMEConnectionId,
            regionId: 'Design_' + ( new Date() ).toISOString()
        };

        $scope.diagramContainerConfig = {};

        $rootScope.$on('componentInstantiationMustBeDone', function ($event, componentData, position) {

            var nodesToCopy;

            $rootScope.processing = true;

            if (!position) {
                position = gridService.getViewPortCenter($rootScope.activeDiagramId);
            }

            if (!position) {
                position = {
                    x: 0,
                    y: 0
                };
            }

            lastComponentInstantiationPosition = position;

            if (componentData && componentData.id) {

                nodesToCopy = {};

                nodesToCopy[componentData.id] = {
                    registry: {
                        position: position,
                        rotation: 0
                    }
                };

                nodeService.copyMoreNodes(designCtx, $rootScope.activeContainerId, nodesToCopy);
            }

        });

        $rootScope.$on('componentDeletionMustBeDone', function ($event, components) {

            var startDeletionOfComponent;

            startDeletionOfComponent = function (component) {

                var i,
                    wires,
                    deleteMessage,
                    nodeIdsToDelete;


                if (angular.isObject(component)) {

                    nodeIdsToDelete = [];

                    deleteMessage = 'Deleting design element';

                    wires = diagramService.getWiresForComponents($rootScope.activeDiagramId, [component]);

                    if (wires.length > 0) {

                        deleteMessage += ' with wires';

                        nodeIdsToDelete = wires.map(function (wire) {
                            return wire.id;
                        });

                    }

                    nodeIdsToDelete.unshift(component.id);

                    for (i = 0; i < nodeIdsToDelete.length; i++) {
                        nodeService.destroyNode(designCtx, nodeIdsToDelete[i], deleteMessage);
                    }

                }
            };

            $rootScope.processing = true;

            if (angular.isArray(components)) {

                angular.forEach(components, function (component) {
                    startDeletionOfComponent(component);
                });

            } else {
                startDeletionOfComponent(components);
            }

        });

        setupDiagramEventHandlers = function () {

            if (!eventHandlersAreSet) {

                eventHandlersAreSet = true;

                $scope.$on('componentsPositionChange', function (e, data) {

                    var i;

                    i = 1;

                    angular.forEach(data.components, function (component) {

                        $timeout(function () {

                            designLayoutService.setPosition(
                                designCtx,
                                component.id,
                                component.getPosition(),
                                data.message
                            );
                        }, 10 * i);

                        i++;

                    });

                });

                $scope.$on('componentsRotationChange', function (e, data) {

                    var i;

                    i = 1;

                    angular.forEach(data.components, function (component) {

                        $timeout(function () {

                            designLayoutService.setRotation(
                                designCtx,
                                component.id,
                                component.rotation,
                                data.message
                            );
                        }, 10 * i);

                        i++;

                    });

                });

            }
        };

        if ($stateParams.containerId === 'dummy') {

            RandomSymbolGenerator = require('./classes/RandomSymbolGenerator');
            randomSymbolGenerator = new RandomSymbolGenerator(symbolManager);

            randomSymbolGenerator.generateSymbols(7);


            $scope.diagram = diagramService.addDummyDiagram('dummy', 100, 50, 3000, 3000);

            $log.debug('Drawing dummy diagram:', $scope.diagram);
            $rootScope.loading = false;

        } else {

            $scope.designCtx = designCtx;

            designLayoutService.watchDiagramElements(designCtx, $rootScope.activeDesign.id, function (designStructureUpdateObject) {

                $log.debug('DiagramElementsUpdate', designStructureUpdateObject);

                switch (designStructureUpdateObject.type) {

                    case 'load':

                        diagramService.createNewComponentFromFromCyPhyElement(
                            $rootScope.activeDiagramId,
                            designStructureUpdateObject.data);

                        gridService.invalidateVisibleDiagramComponents($rootScope.activeDiagramId);

                        break;

                    case 'unload':

                        diagramService.deleteComponentOrWireById(
                            $rootScope.activeDiagramId,
                            designStructureUpdateObject.id);

                        gridService.invalidateVisibleDiagramComponents($rootScope.activeDiagramId, true);

                        break;

                    default :
                    case 'update':

                        if (designStructureUpdateObject.updateType === 'positionChange') {

                            diagramService.updateComponentsAndItsWiresPosition(
                                $rootScope.activeDiagramId,
                                designStructureUpdateObject.id,
                                designStructureUpdateObject.data.position
                            );
                        }

                        if (designStructureUpdateObject.updateType === 'rotationChange') {

                            diagramService.updateComponentsAndItsWiresRotation(
                                $rootScope.activeDiagramId,
                                designStructureUpdateObject.id,
                                designStructureUpdateObject.data.rotation
                            );
                        }

                        break;

                }

                $rootScope.processing = false;

            }).then(function (cyPhyLayout) {

                $log.debug('Diagram elements', cyPhyLayout);

                $rootScope.activeContainerId = $stateParams.containerId || $rootScope.activeDesign.id;

                $timeout(function () {

                    $rootScope.activeDiagramId = $rootScope.activeContainerId + '_' + ( new Date() ).toISOString();

                    $log.debug('Active diagram ID', $rootScope.activeDiagramId);

                    $scope.diagram =
                        diagramService.createDiagramFromCyPhyElements($rootScope.activeDiagramId, cyPhyLayout.elements);

                });


                $log.debug('Drawing diagram:', $scope.diagram);

                setupDiagramEventHandlers();

                $timeout(function () {
                    $rootScope.stopBusy();
                    $rootScope.unCover();
                }, 500);

            });

            $scope.fabClick = function () {

                $log.debug('Fab was clicked');

            };

            $scope.$on('$destroy', function () {

                $rootScope.unCovered = false;

                if ($scope.designCtx) {
                    $log.debug('Celaning up designLayout watchers');
                    designLayoutService.cleanUpAllRegions($scope.designCtx);
                }

            });


        }

    })
    .directive('designEditor', [
        function () {

            return {
                restrict: 'E',
                controller: 'DesignEditorController',
                $scope: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/designEditor.html'

            };
        }]);

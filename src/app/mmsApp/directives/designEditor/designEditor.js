/*globals angular*/

'use strict';

// Move this to GME eventually

require('../testbenchActions/testbenchActions.js');
require('./operationCommitHandlersForGME.js');

angular.module('mms.designVisualization.designEditor', [
    'mms.testbenchActions',
    'mms.designVisualization.operations.gmeCommitHandlers'
])
    .controller('DesignEditorController', function ($scope, $rootScope, diagramService, $log, connectionHandling,
                                                    designService, $stateParams, designLayoutService, symbolManager, $timeout,
                                                    nodeService, gridService, $cookies) {

        var RandomSymbolGenerator,
            randomSymbolGenerator,

            designCtx,

            lastComponentInstantiationPosition,

            justCreatedWires;

        justCreatedWires = [];

        $scope.diagram = null;

        $scope.mainGMEConnectionId = connectionHandling.getMainGMEConnectionId();

        $rootScope.designCtx = designCtx = {
            db: $scope.mainGMEConnectionId,
            regionId: 'Design_' + ( new Date() ).toISOString()
        };

        $scope.diagramContainerConfig = {};

        $rootScope.$on('componentInstantiationMustBeDone', function ($event, componentData, position) {

            var nodesToCopy;

            $rootScope.setProcessing();

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

        $rootScope.$on('wireCreationMustBeDone', function ($event, wire, msg) {

            $rootScope.setProcessing();

            nodeService.getMetaNodes(designCtx)
                .then(function(meta) {

                    var metaId;

                    metaId = meta.byName.ConnectorComposition.id;

                    nodeService.createNode(designCtx, $rootScope.activeContainerId, metaId, msg || 'New wire' )
                        .then(function(node){

                            nodeService.startTransaction(designCtx, msg || 'New wire details');

                            console.log(wire.segments);

                            node.setRegistry('wireSegments', angular.copy(wire.segments));
                            node.makePointer('src', wire.end1.port.id );
                            node.makePointer('dst', wire.end2.port.id );

                            nodeService.completeTransaction(designCtx);

                            wire.id = node.id;
                            diagramService.addWire( $rootScope.activeDiagramId, wire );
                            gridService.invalidateVisibleDiagramComponents( $rootScope.activeDiagramId );


                            $rootScope.stopProcessing();

                        });

                });

        });

        $rootScope.$on('wireSegmentsMustBeSaved', function ($event, wire, message) {
            designLayoutService.setWireSegments(designCtx, wire.id, angular.copy(wire.segments), message || 'Updating wire');
        });

        $rootScope.$on('wireDeletionMustBeDone', function ($event, wire, message) {
            $rootScope.setProcessing();
            nodeService.destroyNode(designCtx, wire.id, message || 'Deleting wire');
        });

        $rootScope.$on('componentDeletionMustBeDone', function ($event, components, msg) {

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

            $rootScope.setProcessing();

            nodeService.startTransaction(designCtx, msg || 'Deleting design elements');

            if (angular.isArray(components)) {

                angular.forEach(components, function (component) {
                    startDeletionOfComponent(component);
                });

            } else {
                startDeletionOfComponent(components);
            }

            nodeService.completeTransaction(designCtx);

        });

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

                        $timeout(function() {

                            if (!(designStructureUpdateObject.data.baseName === 'ConnectorComposition' &&
                                justCreatedWires.indexOf(designStructureUpdateObject.data.id) > -1)) {

                                diagramService.createNewComponentFromFromCyPhyElement(
                                    $rootScope.activeDiagramId,
                                    designStructureUpdateObject.data);

                                gridService.invalidateVisibleDiagramComponents($rootScope.activeDiagramId);
                            }
                        });

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

                        if (designStructureUpdateObject.updateType === 'detailsChange') {

                            diagramService.updateWireSegments(
                                $rootScope.activeDiagramId,
                                designStructureUpdateObject.id,
                                angular.copy(designStructureUpdateObject.data.details.wireSegments)
                            );
                        }

                        break;

                }

                $rootScope.stopProcessing();

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

                $timeout(function () {
                    $rootScope.stopBusy();
                    $rootScope.unCover();

                    if ($cookies.seenMMSWelcome !== 'true') {

                        $rootScope.openHelpDialog();
                        $cookies.seenMMSWelcome = 'true';

                    }

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

/*globals angular*/

'use strict';

var EventDispatcher = require('../../classes/EventDispatcher');

require('../testbenchActions/testbenchActions.js');
require('../keyboardMap/keyboardMap.js');
require('../diagramComponentInspector/diagramComponentInspector.js');
require('./footerDrawer.js');
require('./operationCommitHandlersForGME.js');

angular.module('mms.designEditor', [
        'mms.designEditor.footerDrawer',
        'mms.testbenchActions',
        'mms.designVisualization.operations.gmeCommitHandlers',
        'mms.keyboardMap',
        'mms.diagramComponentInspector'
    ])
    .directive('designEditor', [
        function() {


            function DesignEditorController($scope, $rootScope, diagramService, $log, connectionHandling,
                designService, $state, $stateParams, designLayoutService,
                symbolManager, $timeout, nodeService, gridService, $cookies, projectHandling,
                acmImportService) {

                var justCreatedWires,
                    layoutContext,

                    addRootScopeEventListener,
                    removeAllRootScopeEventListeners,
                    rootScopeEventListeners,

                    initForContainer,
                    destroy,
                    RandomSymbolGenerator = require('./classes/RandomSymbolGenerator.js'),
                    randomSymbolGenerator;

                this._drawerHeight = 0;
                this._element = null;

                $scope.isDummy = $state.current.name === 'dummyEditor';

                if ($scope.isDummy) {
                    $scope.editorWidth = 100;
                } else {
                    $scope.editorWidth = 75;
                }

                addRootScopeEventListener = function(event, fn) {

                    rootScopeEventListeners = rootScopeEventListeners || {};
                    rootScopeEventListeners[event] = $rootScope.$on(event, fn);

                };

                removeAllRootScopeEventListeners = function() {
                    angular.forEach(rootScopeEventListeners, function(fn) {
                        fn();
                    });

                    rootScopeEventListeners = {};
                };

                destroy = function() {

                    removeAllRootScopeEventListeners();

                    if ($scope.layoutContext) {
                        $log.debug('Cleaning up designLayout watchers');
                        designLayoutService.unregisterWatcher($scope.layoutContext);
                    }

                };

                initForContainer = function(selectedContainerId) {

                    if ($scope.isDummy) {

                        randomSymbolGenerator = new RandomSymbolGenerator(symbolManager);

                        randomSymbolGenerator.generateSymbols(5);

                        $scope.diagram = diagramService.generateDummyDiagram('dummy', 1, 0, 1500, 1500);

                        console.log('Dummy diagram:', $scope.diagram);

                        $rootScope.stopBusy();
                        $rootScope.unCover();
                        $rootScope.stopProcessing();


                    } else if (selectedContainerId) {


                        $scope.activeWorkSpace = projectHandling.getSelectedWorkspace();
                        $scope.layoutContext = layoutContext = projectHandling.getContainerLayoutContext();

                        justCreatedWires = [];

                        $scope.diagram = null;
                        $scope.diagramContainerConfig = {};


                        //console.log('=======================================ADDING LISTENERS');

                        addRootScopeEventListener('componentInstantiationMustBeDone', function($event, componentUrl, position) {

                            $rootScope.setProcessing();

                            if (!position) {
                                position = gridService.getViewPortCenter(selectedContainerId);
                            }

                            if (!position) {
                                position = {
                                    x: 0,
                                    y: 0
                                };
                            }

                            if (componentUrl) {
                                acmImportService.importAcm($scope.layoutContext, selectedContainerId,
                                    componentUrl, position);
                            }

                        });

                        addRootScopeEventListener('wireCreationMustBeDone', function($event, wire, msg) {

                            $rootScope.setProcessing();

                            nodeService.getMetaNodes(layoutContext)
                                .then(function(meta) {

                                    var metaId;

                                    metaId = meta.byName.ConnectorComposition.id;

                                    nodeService.startTransaction(layoutContext, msg || 'New wire creation');

                                    nodeService.createNode(layoutContext, selectedContainerId, metaId, msg || 'New wire')
                                        .then(function(node) {

                                            node.setRegistry('wireSegments', angular.copy(wire.segments));
                                            node.makePointer('src', wire.end1.port.id);
                                            node.makePointer('dst', wire.end2.port.id);

                                            nodeService.completeTransaction(layoutContext);

                                            wire.id = node.id;
                                            diagramService.addWire(selectedContainerId, wire);
                                            gridService.invalidateVisibleDiagramComponents(selectedContainerId);


                                            $rootScope.stopProcessing();

                                        });

                                });

                        });

                        addRootScopeEventListener('wireSegmentsMustBeSaved', function($event, wire, message) {
                            designLayoutService.setWireSegments(layoutContext, wire.id, angular.copy(wire.segments), message || 'Updating wire');
                        });

                        addRootScopeEventListener('wireDeletionMustBeDone', function($event, wire, message) {
                            $rootScope.setProcessing();
                            nodeService.destroyNode(layoutContext, wire.id, message || 'Deleting wire');
                        });

                        addRootScopeEventListener('componentDeletionMustBeDone', function($event, components, msg) {

                            var startDeletionOfComponent;

                            startDeletionOfComponent = function(component) {

                                var i,
                                    wires,
                                    deleteMessage,
                                    nodeIdsToDelete;


                                if (angular.isObject(component)) {

                                    nodeIdsToDelete = [];

                                    deleteMessage = 'Deleting design element';

                                    wires = diagramService.getWiresForComponents(selectedContainerId, [component]);

                                    if (wires.length > 0) {

                                        deleteMessage += ' with wires';

                                        nodeIdsToDelete = wires.map(function(wire) {
                                            return wire.id;
                                        });

                                    }

                                    nodeIdsToDelete.unshift(component.id);

                                    for (i = 0; i < nodeIdsToDelete.length; i++) {
                                        nodeService.destroyNode(layoutContext, nodeIdsToDelete[i], deleteMessage);
                                    }

                                }
                            };

                            $rootScope.setProcessing();

                            nodeService.startTransaction(layoutContext, msg || 'Deleting design elements');

                            if (angular.isArray(components)) {

                                angular.forEach(components, function(component) {
                                    startDeletionOfComponent(component);
                                });

                            } else {
                                startDeletionOfComponent(components);
                            }

                            nodeService.completeTransaction(layoutContext);

                        });


                        designLayoutService.watchDiagramElements(
                                layoutContext,
                                selectedContainerId,
                                function(designStructureUpdateObject) {

                                    $log.debug('DiagramElementsUpdate', designStructureUpdateObject);

                                    switch (designStructureUpdateObject.type) {

                                        case 'load':

                                            $timeout(function() {

                                                if (!(designStructureUpdateObject.data.baseName === 'ConnectorComposition' &&
                                                        justCreatedWires.indexOf(designStructureUpdateObject.data.id) > -1)) {

                                                    diagramService.createNewComponentFromFromCyPhyElement(
                                                        selectedContainerId,
                                                        designStructureUpdateObject.data);

                                                    gridService.invalidateVisibleDiagramComponents(selectedContainerId);
                                                }
                                            });

                                            break;

                                        case 'unload':

                                            diagramService.deleteComponentOrWireById(
                                                selectedContainerId,
                                                designStructureUpdateObject.id);

                                            gridService.invalidateVisibleDiagramComponents(selectedContainerId, true);

                                            break;

                                        default:
                                        case 'update':

                                            if (designStructureUpdateObject.updateType === 'positionChange') {

                                                diagramService.updateComponentsAndItsWiresPosition(
                                                    selectedContainerId,
                                                    designStructureUpdateObject.id,
                                                    designStructureUpdateObject.data.position
                                                );
                                            }

                                            if (designStructureUpdateObject.updateType === 'rotationChange') {

                                                diagramService.updateComponentsAndItsWiresRotation(
                                                    selectedContainerId,
                                                    designStructureUpdateObject.id,
                                                    designStructureUpdateObject.data.rotation
                                                );
                                            }

                                            if (designStructureUpdateObject.updateType === 'detailsChange') {

                                                diagramService.updateWireSegments(
                                                    selectedContainerId,
                                                    designStructureUpdateObject.id,
                                                    angular.copy(designStructureUpdateObject.data.details.wireSegments)
                                                );
                                            }

                                            break;

                                    }

                                    $rootScope.stopProcessing();

                                })
                            .then(function(cyPhyLayout) {

                                $log.debug('Diagram elements', cyPhyLayout);

                                $timeout(function() {

                                    $scope.diagram =
                                        diagramService.createDiagramFromCyPhyElements(selectedContainerId, cyPhyLayout.elements);

                                    $log.debug('Drawing diagram:', $scope.diagram);

                                });

                                $timeout(function() {
                                    $rootScope.stopBusy();
                                    $rootScope.unCover();
                                    $rootScope.stopProcessing();

                                    if ($cookies.seenMMSWelcome !== 'true') {

                                        $rootScope.openHelpDialog();
                                        $cookies.seenMMSWelcome = 'true';

                                    }

                                }, 200);

                            });

                        $scope.fabClick = function() {

                            $log.debug('Fab was clicked');

                        };

                        $rootScope.loading = false;
                    }
                };

                $rootScope.stopProcessing();

                $scope.$on('$destroy', function() {
                    destroy();
                });

                initForContainer(projectHandling.getSelectedContainerId());

                $scope.$watch(function() {

                    return projectHandling.getSelectedContainerId();

                }, function(newVal, oldVal) {

                    if (newVal !== oldVal) {

                        destroy();
                        initForContainer(newVal);

                    }

                });

            }

            DesignEditorController.prototype.adjustToDrawerHeight = function(height) {

                if (!isNaN(height) && this._element) {

                    this._element.style['padding-bottom'] = height + 'px';

                    this.dispatchEvent({
                        type: 'resize',
                        message: this.getHeight()
                    });

                }

            };

            DesignEditorController.prototype.registerElement = function(element) {

                this._element = element;
                this.adjustToDrawerHeight();

            };

            DesignEditorController.prototype.registerElement = function(element) {

                this._element = element;
                this.adjustToDrawerHeight();

            };

            DesignEditorController.prototype.getHeight = function() {

                var offsetHeight,
                    height;

                if (this._element) {
                    offsetHeight = this._element.offsetHeight;
                    height = offsetHeight - this._drawerHeight;
                }

                return height;


            };

            EventDispatcher.prototype.apply(DesignEditorController.prototype);

            return {
                restrict: 'E',
                controller: DesignEditorController,
                scope: true,
                replace: true,
                transclude: true,
                require: 'designEditor',
                templateUrl: '/mmsApp/templates/designEditor.html',
                link: function(scope, element, attr, ctrl) {

                    ctrl.registerElement(element[0]);

                }

            };
        }
    ]);

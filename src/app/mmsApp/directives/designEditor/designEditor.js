/*globals angular*/

'use strict';

var EventDispatcher = require('../../classes/EventDispatcher');

require('../testbenchActions/testbenchActions.js');
require('../keyboardMap/keyboardMap.js');
require('../diagramComponentInspector/diagramComponentInspector.js');
require('../diagramWireInspector/diagramWireInspector.js');
require('./footerDrawer.js');
require('./operationCommitHandlersForGME.js');
require('../diagramContainer/diagramContainer.js');
require('../svgDiagram/svgDiagram.js');

angular.module('mms.designEditor', [
        'mms.designEditor.footerDrawer',
        'mms.testbenchActions',
        'mms.designVisualization.operations.gmeCommitHandlers',
        'mms.keyboardMap',
        'mms.diagramComponentInspector',
        'mms.diagramWireInspector',
        'mms.svgDiagram',
        'mms.diagramContainer',
        'mms.utils'
    ])
    .directive('designEditor', function() {

        function DesignEditorController($scope, $rootScope, diagramService, $log, connectionHandling,
            designService, $state, $stateParams, designLayoutService,
            symbolManager, $timeout, nodeService, gridService, $cookies, projectHandling,
            acmImportService, mmsUtils, operationsManager) {

            var justCreatedWires,
                layoutContext,

                addRootScopeEventListener,
                removeAllRootScopeEventListeners,
                rootScopeEventListeners,

                initForContainer,
                destroy,
                RandomSymbolGenerator = require('./classes/RandomSymbolGenerator.js'),
                randomSymbolGenerator,

                selectionHandler,

                self = this;

            self.inspectableComponent = null;
            self.inspectableWire = null;

            self._drawerHeight = 0;
            self._element = null;

            self.isDummy = $state.current.name === 'dummyEditor';

            if (self.isDummy) {
                self.editorWidth = 100;
            } else {
                self.editorWidth = 75;
            }


            selectionHandler = function(event) {

                var selectedComponentIds = event.message.selectedComponentIds,
                    selectedWireIds = event.message.selectedWireIds;

                self.inspectableComponent = null;
                self.inspectableWire = null;

                if (selectedComponentIds.length === 1) {

                    self.inspectableComponent = self.diagram.getComponentById(selectedComponentIds[0]);

                    $log.debug('inspectableComponent', self.inspectableComponent);

                } else if (selectedWireIds.length === 1) {

                    self.inspectableWire = self.diagram.getWireById(selectedWireIds[0]);

                    $log.debug('inspectableWire', self.inspectableWire);

                }

            };

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

                self.inspectableComponent = null;
                self.inspectableWire = null;

                removeAllRootScopeEventListeners();

                if (self.diagram) {
                    self.diagram.removeEventListener('selectionChange', selectionHandler);
                }

                if (self.layoutContext) {
                    $log.debug('Cleaning up designLayout watchers');
                    designLayoutService.unregisterWatcher(self.layoutContext);
                }

            };

            initForContainer = function(selectedContainerId) {

                if (self.isDummy) {

                    randomSymbolGenerator = new RandomSymbolGenerator(symbolManager, mmsUtils);

                    randomSymbolGenerator.generateSymbols(5);

                    self.diagram = diagramService.generateDummyDiagram('dummy', 6, 6, 1500, 1500);

                    self.diagram.addEventListener('selectionChange', selectionHandler);

                    console.log('Dummy diagram:', self.diagram);

                    $rootScope.stopBusy();
                    $rootScope.unCover();
                    $rootScope.stopProcessing();

                    self.diagram.afterWireChange();

                } else if (selectedContainerId) {


                    self.activeWorkSpace = projectHandling.getSelectedWorkspace();
                    self.layoutContext = layoutContext = projectHandling.getContainerLayoutContext();

                    justCreatedWires = [];

                    self.diagram = null;
                    self.diagramContainerConfig = {};


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
                            acmImportService.importAcm(self.layoutContext, selectedContainerId,
                                componentUrl, position);
                        }

                    });

                    addRootScopeEventListener('componentLabelMustBeSaved', function($event, component) {

                        var operation;

                        operation = operationsManager.initNew(
                            'RelabelComponent',
                            diagramService.getDiagram(selectedContainerId), component
                        );
                        operation.set(component.getLabel());
                        operation.finish();


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

                                        var diagram = diagramService.getDiagram(selectedContainerId);

                                        if (diagram) {

                                            node.setRegistry('wireSegments', wire.getCopyOfSegmentsParameters());
                                            node.makePointer('src', wire.getEnd1().port.id);
                                            node.makePointer('dst', wire.getEnd2().port.id);

                                            wire.setId(node.id);
                                            diagram.addWire(wire);


                                        }

                                        nodeService.completeTransaction(layoutContext);
                                        gridService.invalidateVisibleDiagramComponents(selectedContainerId);

                                        $rootScope.stopProcessing();

                                    });

                            });

                    });

                    addRootScopeEventListener('wireSegmentsMustBeSaved', function($event, wire, message) {
                        designLayoutService.setWireSegments(layoutContext, wire.getId(), wire.getCopyOfSegmentsParameters(), message || 'Updating wire');
                    });

                    addRootScopeEventListener('wireDeletionMustBeDone', function($event, wire, message) {
                        $rootScope.setProcessing();
                        nodeService.destroyNode(layoutContext, wire.getId(), message || 'Deleting wire');
                    });

                    addRootScopeEventListener('componentDeletionMustBeDone', function($event, components, msg) {

                        var startDeletionOfComponent;

                        startDeletionOfComponent = function(component) {

                            var i,
                                wires,
                                deleteMessage,
                                nodeIdsToDelete,
                                diagram = diagramService.getDiagram(selectedContainerId);

                            if (angular.isObject(component)) {

                                nodeIdsToDelete = [];

                                deleteMessage = 'Deleting design element';

                                wires = diagram.getWiresForComponents([component]);

                                if (wires.length > 0) {

                                    deleteMessage += ' with wires';

                                    nodeIdsToDelete = wires.map(function(wire) {
                                        return wire.getId();
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

                                var diagram,
                                    component;

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

                                        self.diagram.deleteComponentOrWireById(
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

                                            diagram = diagramService.getDiagram(selectedContainerId);

                                            if (diagram) {

                                                diagram.updateWireSegments(
                                                    designStructureUpdateObject.id,
                                                    angular.copy(designStructureUpdateObject.data.details.wireSegments)
                                                );

                                            }

                                        }

                                        if (designStructureUpdateObject.updateType === 'nameChange') {

                                            diagram = diagramService.getDiagram(selectedContainerId);

                                            if (diagram) {

                                                component = diagram.getComponentById(designStructureUpdateObject.id);

                                                if (component) {
                                                    component.setLabel(designStructureUpdateObject.data.name);

                                                    $rootScope.$emit('nameWasChanged', projectHandling.getSelectedContainer());
                                                }

                                            }

                                        }

                                        break;

                                }

                                $rootScope.stopProcessing();

                            })
                        .then(function(cyPhyLayout) {

                            $log.debug('Diagram elements', cyPhyLayout);

                            $timeout(function() {

                                self.diagram =
                                    diagramService.createDiagramFromCyPhyElements(selectedContainerId, cyPhyLayout.elements);

                                self.diagram.addEventListener('selectionChange', selectionHandler);

                                $log.debug('Drawing diagram:', self.diagram);

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

                    self.fabClick = function() {

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

        DesignEditorController.prototype.getSelectedComponents = function() {

            var result = {};

            // if (this.diagram) {
            //     result = this.diagram;
            // }

            return result;
        };

        EventDispatcher.prototype.apply(DesignEditorController.prototype);

        return {
            restrict: 'E',
            controller: DesignEditorController,
            controllerAs: 'designEditorCtrl',
            bindToController: true,
            scope: true,
            replace: true,
            transclude: true,
            require: 'designEditor',
            templateUrl: '/mmsApp/templates/designEditor.html',
            link: function(scope, element, attr, ctrl) {

                ctrl.registerElement(element[0]);

            }

        };
    });

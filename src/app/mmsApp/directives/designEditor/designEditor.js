/*globals angular*/

'use strict';

var EventDispatcher = require('../../classes/EventDispatcher');

var CyPhyDiagramParser = require('../../services/diagramService/classes/CyPhyDiagramParser.js');

require('../keyboardMap/keyboardMap.js');
require('../diagramComponentInspector/diagramComponentInspector.js');
require('../diagramWireInspector/diagramWireInspector.js');
require('./footerDrawer.js');
require('./operationCommitHandlersForGME.js');
require('../diagramContainer/diagramContainer.js');
require('../svgDiagram/svgDiagram.js');
require('../testBenchDrawerPanel/testBenchDrawerPanel.jsx');
require('../primitivesDrawerPanel/primitivesDrawerPanel.jsx');

angular.module('mms.designEditor', [
        'mms.designEditor.footerDrawer',
        'mms.designVisualization.operations.gmeCommitHandlers',
        'mms.keyboardMap',
        'mms.diagramComponentInspector',
        'mms.diagramWireInspector',
        'mms.svgDiagram',
        'mms.diagramContainer',
        'mms.utils',
        'mms.dndService',
        'mms.testBenchDrawerPanel',
        'mms.primitivesDrawerPanel',
        'mms.connectorService',
        'mms.projectHandling'
    ])
    .directive('designEditor', function(dndService, symbolManager, diagramService, wiringService, pcbService) {

        var cyPhyDiagramParser = new CyPhyDiagramParser(symbolManager, diagramService, wiringService, pcbService);

        var _ghostComponent = document.createElement('img');
        _ghostComponent.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAaCAMAAADRyb8sAAAARVBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgICAwMDBAQECAgIC/v7////8hdZNpAAAAEHRSTlMAECAwQFBgcICPn6+/z9/vIxqCigAAALpJREFUeNrt1E0PwiAMgOEWCiIrUD///081jMZkB5lVj74XLjzLMuhgk6N5Dl6WzpdZpwTbHPknvd1nXZ+UaN0uIsWbaGgiLUCQXrFQ1zppsMhapF7eoZl6x0GAx1q4V3doHbuUjkc0NLwwKcXSl2j6TLmTDIAHXsh4OHHhCJqFan/6PiU0U+/WM2oijCbqq0j1eqvYQvHzyUnfT04eq2VywiA68sn0mYr+WFxmjmCimJgT/u42ybwNfQDu5E5vKmPGHgAAAABJRU5ErkJggg=='

        function dragginginIE(e) {

            _ghostComponent.style.top = (e.pageY + 5) + 'px';
            _ghostComponent.style.left = (e.pageX + 5) + 'px';

        }

        function DesignEditorController($scope, $rootScope, diagramService, $log, connectionHandling,
            designService, $state, $stateParams, designLayoutService,
            symbolManager, $timeout, nodeService, gridService, $cookies, projectHandling,
            acmImportService, mmsUtils, operationsManager, wiringService, connectorService, $q, $injector, $mdToast, $compile) {

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

                justDuplicatedComponentNewPosition,
                afterDuplicatedComponentCallback,

                self = this;

            self.inspectableComponent = null;
            self.inspectableWire = null;

            self._drawerHeight = 0;
            self._element = null;

            self.isDummy = $state.current.name === 'dummyEditor';

            if ($injector.has('designsToSelect')) {

                $scope.designsToSelect = $injector.get('designsToSelect');

            }

            selectionHandler = function(event) {

                var selectedComponentIds = event.message.selectedComponentIds,
                    selectedWireIds = event.message.selectedWireIds,
                    shouldSelectInspector = false;

                self.inspectableComponent = null;
                self.inspectableWire = null;

                if (selectedComponentIds.length === 1) {

                    self.inspectableComponent = self.diagram.getComponentById(selectedComponentIds[0]);
                    shouldSelectInspector = true;

                } else if (selectedWireIds.length === 1) {

                    self.inspectableWire = self.diagram.getWireById(selectedWireIds[0]);

                    $log.debug('inspectableWire', self.inspectableWire);
                    shouldSelectInspector = true;

                }

                if (shouldSelectInspector && self._footerDrawerCtrl) {
                    self._footerDrawerCtrl.activePanelByName('Inspector');
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

                        position = gridService.getSnappedPosition(position);

                        if (componentUrl) {
                            acmImportService.importAcm(self.layoutContext, selectedContainerId,
                                    componentUrl, position)
                                .catch(function(err) {
                                    $log.error(err);
                                    $rootScope.stopProcessing();
                                });
                        }

                    });

                    addRootScopeEventListener('subcircuitInstantiationMustBeDone', function($event, subcircuitUrl, position, contentServerUrl) {

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

                        position = gridService.getSnappedPosition(position);

                        if (subcircuitUrl) {
                            acmImportService.importAdm(self.layoutContext, selectedContainerId,
                                    subcircuitUrl, position, contentServerUrl)
                                .catch(function(err) {
                                    $log.error(err);
                                    $mdToast.show(
                                        $mdToast.simple()
                                            .content('Creating subcircuit failed')
                                    );
                                    $rootScope.stopProcessing();
                                });
                        }

                    });

                    addRootScopeEventListener('primitiveInstantiationMustBeDone', function($event, primitive, position) {

                        $rootScope.setProcessing();

                        nodeService.getMetaNodes(layoutContext)
                            .then(function(meta) {

                                var metaId;

                                //container/connector

                                metaId = meta.byName[primitive.metaType].id;

                                nodeService.startTransaction(layoutContext, 'New primitive creation');

                                nodeService.createNode(layoutContext, selectedContainerId, metaId, 'New primitive')
                                    .then(function(node) {
                                        // Is this a connector adapter? If so, seed it with two untyped ports.
                                        if (primitive.id === 'connector-adapter') {

                                            return nodeService.createNode(layoutContext, node.id, meta.byName['Connector'].id, 'Make first connector')
                                                .then(function (nodeConnector) {
                                                    nodeConnector.setAttribute('name', 'A');
                                                    nodeConnector.setRegistry('position', {
                                                        x: 50,
                                                        y: 100
                                                    }, 'Set primitive position');
                                                })
                                                .then(function () {
                                                    return nodeService.createNode(layoutContext, node.id, meta.byName['Connector'].id, 'Make second connector');
                                                })
                                                .then(function (nodeConnector) {
                                                    nodeConnector.setAttribute('name', 'B');
                                                    nodeConnector.setRegistry('position', {
                                                        x: 400,
                                                        y: 100
                                                    }, 'Set primitive position');

                                                    return node;
                                                });
                                        }
                                        else {
                                            return node;
                                        }
                                    })
                                    .then(function(node) {

                                        var element = {};

                                        if (!position) {
                                            position = gridService.getViewPortCenter(selectedContainerId);
                                        }

                                        if (!position) {
                                            position = {
                                                x: 0,
                                                y: 0
                                            };
                                        }

                                        element = angular.copy(primitive, element);

                                        element.id = node.id;
                                        element.position = gridService.getSnappedPosition(position);

                                        node.setRegistry('position', position, 'Set primitive position');

                                        nodeService.completeTransaction(layoutContext);

                                        $rootScope.stopProcessing();

                                    });

                            });

                         $log.debug('Diagram', self.diagram);

                    });

                    addRootScopeEventListener('brdImportMustBeDone', function($event, brdBlobUrl) {

                        $rootScope.setProcessing();

                        var brdBlobUrlParts = brdBlobUrl.replace(/\/*$/, '').split('/');
                        acmImportService.importBrd(self.layoutContext, projectHandling.getSelectedDesignId(), brdBlobUrlParts[brdBlobUrlParts.length - 1])
                            .then(function () {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .content('BRD file imported. Place and Route will use this BRD file.')
                                );
                            })
                            .catch(function(err) {
                                $log.error(err);
                                $mdToast.show(
                                    $mdToast.simple()
                                        .content('BRD import failed')
                                );
                                $rootScope.stopProcessing();
                            });

                    });

                    addRootScopeEventListener('svgIconImportMustBeDone', function($event, iconBlobUrl, position) {

                        $rootScope.setProcessing();

                        var iconBlobUrlParts = iconBlobUrl.replace(/\/*$/, '').split('/'),
                            componentToAddIcon = self.diagram.getComponentByCursorPosition(position);

                        if ( componentToAddIcon ) {

                            nodeService.loadNode(layoutContext, componentToAddIcon.id)
                                .then(function(componentNode) {

                                    componentNode.setAttribute("Icon", '/rest/blob/view/' + iconBlobUrlParts[iconBlobUrlParts.length - 1]);
                                    $rootScope.stopProcessing();

                                });
                        }
                        else {
                            $log.error("Unable to drop SVG icon at cursor position (" + position.x + ", " + position.y + ")");
                            $mdToast.show(
                                $mdToast.simple()
                                    .content('Unable to drop SVG icon there!')
                            );
                            $rootScope.stopProcessing();
                        }
                    });

                    addRootScopeEventListener('svgIconMustBeRemoved', function($event, component) {

                        nodeService.loadNode(layoutContext, component.id)
                        .then(function(componentNode) {

                            componentNode.setAttribute("Icon", null);

                            });

                    });

                    addRootScopeEventListener('designLabelMustBeSaved', function($event, design) {

                        nodeService.loadNode(layoutContext, design.id)
                        .then(function(designNode) {

                            designNode.setAttribute("name", design.label);  // This changes as the user modifies the name.
                            if (designNode.getAttribute("originalName") === undefined) {
                                designNode.setAttribute("originalName", design.originalName);  // Constant, for tutorial/designSelector lookup.
                            }

                            $rootScope.$emit('nameWasChanged', projectHandling.getSelectedContainer());

                        });

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

                        nodeService.startTransaction(layoutContext, msg || 'New wire creation');

                        nodeService.getMetaNodes(layoutContext)
                            .then(function(meta) {

                                var metaId;

                                metaId = meta.byName.ConnectorComposition.id;

                                return nodeService.createNode(layoutContext, selectedContainerId, metaId, msg || 'New wire');
                            })
                            .then(function(node) {

                                var diagram = diagramService.getDiagram(selectedContainerId);

                                if (diagram) {

                                    var wireEnd1 = wire.getEnd1();
                                    var wireEnd2 = wire.getEnd2();
                                    node.setRegistry('wireSegments', wire.getCopyOfSegmentsParameters());
                                    node.makePointer('src', wireEnd1.port.id);
                                    node.makePointer('dst', wireEnd2.port.id);

                                    wire.setId(node.id);
                                    diagram.addWire(wire);
                                    justCreatedWires.push(wire.getId());

                                    connectorService.updateConnectorDefinition(wire, layoutContext);

                                }
                            })
                            .then(function() {
                                return nodeService.completeTransaction(layoutContext)
                                    .then(function() {
                                        $log.debug('Transaction complete');
                                    });
                            })
                            .then(function() {
                                gridService.invalidateVisibleDiagramComponents(selectedContainerId);
                                $rootScope.$emit('wireCreationDone');
                            })
                            .finally(function() {
                                $rootScope.stopProcessing();
                            });

                    });

                    addRootScopeEventListener('wireSegmentsMustBeSaved', function($event, wire, message) {
                        designLayoutService.setWireSegments(layoutContext, wire.getId(), wire.getCopyOfSegmentsParameters(), message || 'Updating wire');
                    });

                    addRootScopeEventListener('wiresMustBeSaved', function($event, wires, message) {
                        nodeService.startTransaction(layoutContext, message || 'Saving wires');

                        $q.all(wires.map(function(wire) {
                            return designLayoutService.setWireSegments(layoutContext, wire.getId(), wire.getCopyOfSegmentsParameters(), message || 'Updating wire');
                        })).then(function () {
                            nodeService.completeTransaction(layoutContext);
                        });
                    });

                    addRootScopeEventListener('wireDeletionMustBeDone', function($event, wire, message) {
                        $rootScope.setProcessing();
                        nodeService.destroyNode(layoutContext, wire.getId(), message || 'Deleting wire');
                    });

                    addRootScopeEventListener('wireLockMustBeSaved', function($event, wire, lockWire, message) {

                        designLayoutService.setWireLock(layoutContext, wire.getId(), lockWire, message || 'Setting wire lock');
                    });

                    addRootScopeEventListener('wireLockMustBeSetForComponentWires', function($event, component, wireLock) {

                        var diagram = diagramService.getDiagram(selectedContainerId);

                        angular.forEach(diagram.getWiresByComponentId(component.id), function(wire) {
                            if (wireLock) {
                                wiringService.lockWire(wire);
                            }
                            else {
                                wiringService.unlockWire(wire);
                            }

                            $rootScope.$emit('wireLockMustBeSaved', wire, wireLock, 'Locking wire');
                        });

                        diagram.afterWireChange();

                    });

                    addRootScopeEventListener('wireLockMustBeSetForMultipleComponentsWires', function($event, components, wireLock) {

                        var diagram = diagramService.getDiagram(selectedContainerId);

                        angular.forEach(components, function(component) {
                            angular.forEach(diagram.getWiresByComponentId(component.id), function(wire) {
                                if (wireLock) {
                                    wiringService.lockWire(wire);
                                }
                                else {
                                    wiringService.unlockWire(wire);
                                }

                                $rootScope.$emit('wireLockMustBeSaved', wire, wireLock, 'Locking wire');
                            });
                        });

                        diagram.afterWireChange();

                    });


                    addRootScopeEventListener('componentDuplicationMustBeDone', function($event, component, cb) {

                        if (component) {

                            $rootScope.setProcessing();

                            justDuplicatedComponentNewPosition = component.getPosition();

                            justDuplicatedComponentNewPosition.x += 30;
                            justDuplicatedComponentNewPosition.y += 30;

                            justDuplicatedComponentNewPosition.z = justDuplicatedComponentNewPosition.z || 0;
                            justDuplicatedComponentNewPosition.z++;

                            afterDuplicatedComponentCallback = cb;

                            nodeService.startTransaction(layoutContext, 'Duplicating design element');

                            nodeService.loadNode(layoutContext, component.getId())
                                .then(function(nodeToCopy) {

                                    var nodesToCopy = {};

                                    nodesToCopy[nodeToCopy.id] = nodeToCopy;

                                    nodeService.copyMoreNodes(
                                        layoutContext,
                                        projectHandling.getSelectedContainerId(),
                                        nodesToCopy
                                    );
                                });

                            nodeService.completeTransaction(layoutContext);

                        }

                    });

                    addRootScopeEventListener('componentDeletionMustBeDone', function($event, components, msg) {

                        var doDeletionOfComponent;

                        doDeletionOfComponent = function(component) {

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
                                doDeletionOfComponent(component);
                            });

                        } else {
                            doDeletionOfComponent(components);
                        }

                        nodeService.completeTransaction(layoutContext);

                    });

                    var deleteMultipleThings = function(diagram, components, wires, wireSegmentsWithSelectedEndCorner, msg) {

                        var i,
                            deletedWires = [],
                            nodeIdsToDelete = [],
                            deleteMessage = 'Deleting design element',

                            doDeletionOfComponent = function(component) {

                                var componentWires = [],
                                    deleteMessage;

                                if (angular.isObject(component)) {

                                    componentWires = diagram.getWiresForComponents([component]);

                                    if (componentWires.length > 0) {

                                        deleteMessage += ' with wires';

                                        componentWires.forEach(function(wire) {
                                            nodeIdsToDelete.push(wire.getId());
                                        });

                                    }

                                    nodeIdsToDelete.unshift(component.id);

                                }

                                return componentWires;

                            };

                        if ((!Array.isArray(components) || components.length === 0) &&
                            (!Array.isArray(wires) || wires.length === 0) &&
                            (!Array.isArray(wireSegmentsWithSelectedEndCorner) || wireSegmentsWithSelectedEndCorner.length === 0)) {
                            // nothing to do
                            return;
                        }

                        $rootScope.setProcessing();
                        nodeService.startTransaction(layoutContext, msg || 'Deleting design elements');

                        if (Array.isArray(components)) {

                            angular.forEach(components, function(component) {

                                deletedWires = deletedWires.concat(doDeletionOfComponent(component));

                            });

                        }

                        var gmeUpdatePromises = [];

                        if (Array.isArray(wires)) {

                            angular.forEach(wires, function(aWire) {

                                if (deletedWires.indexOf(aWire) === -1) {
                                    var wireId = aWire.getId();

                                    var srcId = aWire._end1.port.id;
                                    var dstId = aWire._end2.port.id;

                                    gmeUpdatePromises.push(
                                        nodeService.loadNode(layoutContext, srcId)
                                            .then(function (srcConnector) {
                                                return connectorService.testConnectorForInferredTypeRemoval(srcConnector, layoutContext);
                                            })
                                    );

                                    gmeUpdatePromises.push(
                                        nodeService.loadNode(layoutContext, dstId)
                                            .then(function (dstConnector) {
                                                return connectorService.testConnectorForInferredTypeRemoval(dstConnector, layoutContext);
                                            })
                                    );

                                    nodeIdsToDelete.push(wireId);
                                    deletedWires.push(aWire);
                                }

                            });
                        }

                        // Now updating wires which has corners deleted

                        var wiresToUpdate = [];

                        if (Array.isArray(wireSegmentsWithSelectedEndCorner)) {

                            angular.forEach(wireSegmentsWithSelectedEndCorner, function(aSegment) {

                                var parentWire = aSegment.getParentWire();

                                if (deletedWires.indexOf(parentWire) === -1) {

                                    parentWire.destroyEndCornerOfSegment(aSegment, wiringService);

                                    if (wiresToUpdate.indexOf(parentWire) === -1) {
                                        wiresToUpdate.push(parentWire);
                                    }

                                }

                            });

                        }

                        // Deleting gathered component and wires

                        for (i = 0; i < nodeIdsToDelete.length; i++) {

                            nodeService.destroyNode(layoutContext, nodeIdsToDelete[i], deleteMessage);

                        }

                        // Updating wires

                        wiresToUpdate.forEach(function(wire) {
                            gmeUpdatePromises.push(designLayoutService.setWireSegments(layoutContext, wire.getId(), wire.getCopyOfSegmentsParameters(), 'Removing wire corner'));
                        });

                        $q.all(gmeUpdatePromises).then(function() {
                            nodeService.completeTransaction(layoutContext);
                        });
                    };

                    addRootScopeEventListener('selectedDiagramThingsDeletionMustBeDone', function($event, diagram, msg) {

                        var selectedComponents = diagram.getSelectedComponents(),
                            selectedWires = diagram.getSelectedWires(),
                            selectedWireSegmentsWithSelectedEndCorner = diagram.getWireSegmentsWithSelectedEndCorner();

                        deleteMultipleThings(diagram, selectedComponents, selectedWires, selectedWireSegmentsWithSelectedEndCorner, msg);

                    });

                    addRootScopeEventListener('wireDeletionMustBeDone', function($event, wire, message) {

                        deleteMultipleThings($scope.diagram, null, [wire], null, message);

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

                                                var newDiagramElement = diagramService.createNewComponentFromFromCyPhyElement(
                                                    selectedContainerId,
                                                    designStructureUpdateObject.data);

                                                if (justDuplicatedComponentNewPosition) {

                                                    if (typeof afterDuplicatedComponentCallback === 'function') {
                                                        afterDuplicatedComponentCallback(newDiagramElement);
                                                    } else {

                                                        designLayoutService.setPosition(
                                                            layoutContext,
                                                            designStructureUpdateObject.data.id,
                                                            justDuplicatedComponentNewPosition
                                                        );

                                                    }

                                                    justDuplicatedComponentNewPosition = null;
                                                    afterDuplicatedComponentCallback = null;

                                                }

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

                                            if (wiringService.selectedRouter.id === 'autoRouter') {
                                                diagramService.updateComponentsPosition(
                                                    selectedContainerId,
                                                    designStructureUpdateObject.id,
                                                    designStructureUpdateObject.data.position
                                                );
                                            }
                                            else {

                                                diagramService.updateComponentsAndItsWiresPosition(
                                                    selectedContainerId,
                                                    designStructureUpdateObject.id,
                                                    designStructureUpdateObject.data.position
                                                );
                                            }
                                        }

                                        if (designStructureUpdateObject.updateType === 'rotationChange') {

                                            if (wiringService.selectedRouter.id === 'autoRouter') {
                                                diagramService.updateComponentsRotation(
                                                    selectedContainerId,
                                                    designStructureUpdateObject.id,
                                                    designStructureUpdateObject.data.rotation
                                                );
                                            }
                                            else {

                                                diagramService.updateComponentsAndItsWiresRotation(
                                                    selectedContainerId,
                                                    designStructureUpdateObject.id,
                                                    designStructureUpdateObject.data.rotation
                                                );
                                            }
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

                                        if (designStructureUpdateObject.updateType === 'typeChange') {

                                            diagram = diagramService.getDiagram(selectedContainerId);

                                            if (diagram) {

                                                var newConnectorData = {
                                                    type: designStructureUpdateObject.data.type,
                                                    description: designStructureUpdateObject.data.description,
                                                    decorator: cyPhyDiagramParser.connectorTypeToDecorator[designStructureUpdateObject.data.type]
                                                };

                                                var port = diagram.getPortById(designStructureUpdateObject.id);

                                                if (port) {

                                                    connectorService.updateConnectorModel(port, newConnectorData);

                                                    var compiledSymbol,
                                                        decoratedPortEl;

                                                    decoratedPortEl = document.getElementById(port.id).querySelector('.decorated-port');

                                                    compiledSymbol = $compile('<decorated-port></decorated-port>');

                                                    compiledSymbol($scope, function (clonedElement) {

                                                        decoratedPortEl.parentNode.replaceChild(
                                                            clonedElement[0],
                                                            decoratedPortEl
                                                        );

                                                    });

                                                    $scope.portData = port;
                                                }

                                            }

                                        }

                                        if (designStructureUpdateObject.updateType === 'iconChange') {

                                            diagram = diagramService.getDiagram(selectedContainerId);

                                            if (diagram) {

                                                component = diagram.getComponentById(designStructureUpdateObject.id);

                                                if (component) {

                                                    if (component.icon && !designStructureUpdateObject.data.icon) {
                                                        component.symbol.height -= component.symbol.iconPadding;
                                                        component.symbol.boxHeight -= component.symbol.iconPadding;

                                                    }
                                                    else {
                                                        component.symbol.height += component.symbol.iconPadding;
                                                        component.symbol.boxHeight += component.symbol.iconPadding;

                                                    }

                                                    component.setIcon(designStructureUpdateObject.data.icon);

                                                    $rootScope.$emit('iconWasChanged', projectHandling.getSelectedContainer());
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


                                var designConfig = projectHandling.getSelectedDesignConfig();

                                if (designConfig && designConfig.tutorial && $cookies['seenTutorialFor' + designConfig.name] !== 'true') {

                                    $rootScope.openHelpDialog();
                                    $cookies['seenTutorialFor' + designConfig.name] = 'true';

                                }

                                // Chrome repaint issue for rotated components, need to force a redraw.
                                // See http://stackoverflow.com/a/3485654
                                angular.forEach(document.getElementsByClassName("rotated-180"), function(rotatedEl) {

                                    rotatedEl.style.display = 'none';
                                    rotatedEl.offsetHeight; // no need to store this anywhere, the reference is enough
                                    rotatedEl.style.display = '';

                                });

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

        DesignEditorController.prototype.componentBrowserItemDragStart = function(e, item) {

            if (typeof e.dataTransfer.setDragImage === 'function') {
                e.dataTransfer.setDragImage(_ghostComponent, 0, 0);
            } else {

                // We are in IE land

                _ghostComponent.style.zIndex = '100';
                _ghostComponent.style.top = (e.pageY + 5) + 'px';
                _ghostComponent.style.left = (e.pageX + 5) + 'px';
                _ghostComponent.style.position = 'absolute';
                _ghostComponent.style.pointerEvents = 'none';

                document.body.appendChild(_ghostComponent);

                document.body.addEventListener('drag', dragginginIE, true);
            }

            dndService.startDrag('component', {
                componentId: item.id
            });
        };

        DesignEditorController.prototype.componentBrowserItemDragEnd = function(e, item) {
            dndService.stopDrag();

            if (typeof e.dataTransfer.setDragImage !== 'function') {

                // We are in IE land

                document.body.removeChild(_ghostComponent);
                document.body.removeEventListener('drag', dragginginIE, true);

            }

        };

        DesignEditorController.prototype.subcircuitBrowserItemDragStart = function(e, item) {

            if (typeof e.dataTransfer.setDragImage === 'function') {
                e.dataTransfer.setDragImage(_ghostComponent, 0, 0);
            } else {

                // We are in IE land

                _ghostComponent.style.zIndex = '100';
                _ghostComponent.style.top = (e.pageY + 5) + 'px';
                _ghostComponent.style.left = (e.pageX + 5) + 'px';
                _ghostComponent.style.position = 'absolute';
                _ghostComponent.style.pointerEvents = 'none';

                document.body.appendChild(_ghostComponent);

                document.body.addEventListener('drag', dragginginIE, true);
            }

            dndService.startDrag('subcircuit', {
                subcircuitId: item.id
            });
        };

        DesignEditorController.prototype.subcircuitBrowserItemDragEnd = function(e, item) {
            dndService.stopDrag();

            if (typeof e.dataTransfer.setDragImage !== 'function') {

                // We are in IE land

                document.body.removeChild(_ghostComponent);
                document.body.removeEventListener('drag', dragginginIE, true);

            }

        };

        DesignEditorController.prototype.primitivePanelItemDragStart = function(e, item) {

            // Firefox requires setData() to be called in drag start handler. Data could be anything, not used.
            if (navigator.appCodeName === "Mozilla") {
                e.dataTransfer.setData('text/plain', item);
            }

            if (typeof e.dataTransfer.setDragImage === 'function') {
                e.dataTransfer.setDragImage(_ghostComponent, 0, 0);
            } else {

                // We are in IE land

                _ghostComponent.style.zIndex = '100';
                _ghostComponent.style.top = (e.pageY + 5) + 'px';
                _ghostComponent.style.left = (e.pageX + 5) + 'px';
                _ghostComponent.style.position = 'absolute';
                _ghostComponent.style.pointerEvents = 'none';

                document.body.appendChild(_ghostComponent);

                document.body.addEventListener('drag', dragginginIE, true);
            }

            item.primitiveId = item.id;

            dndService.startDrag('primitive', {
                primitiveId: item.id,
                primitiveData: item
            });
        };

        DesignEditorController.prototype.primitivePanelItemDragEnd = function(e, item) {
            dndService.stopDrag();

            if (typeof e.dataTransfer.setDragImage !== 'function') {

                // We are in IE land

                document.body.removeChild(_ghostComponent);
                document.body.removeEventListener('drag', dragginginIE, true);

            }

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

/*globals angular*/

'use strict';

var EventDispatcher = require('../../classes/EventDispatcher');

require('../keyboardMap/keyboardMap.js');
require('../diagramComponentInspector/diagramComponentInspector.js');
require('../diagramWireInspector/diagramWireInspector.js');
require('./footerDrawer.js');
require('./operationCommitHandlersForGME.js');
require('../diagramContainer/diagramContainer.js');
require('../svgDiagram/svgDiagram.js');
require('../testBenchDrawerPanel/testBenchDrawerPanel.jsx');

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
        'mms.testBenchDrawerPanel'

    ])
    .directive('designEditor', function(dndService) {

        var _ghostComponent = document.createElement('img');
        _ghostComponent.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAaCAMAAADRyb8sAAAARVBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgICAwMDBAQECAgIC/v7////8hdZNpAAAAEHRSTlMAECAwQFBgcICPn6+/z9/vIxqCigAAALpJREFUeNrt1E0PwiAMgOEWCiIrUD///081jMZkB5lVj74XLjzLMuhgk6N5Dl6WzpdZpwTbHPknvd1nXZ+UaN0uIsWbaGgiLUCQXrFQ1zppsMhapF7eoZl6x0GAx1q4V3doHbuUjkc0NLwwKcXSl2j6TLmTDIAHXsh4OHHhCJqFan/6PiU0U+/WM2oijCbqq0j1eqvYQvHzyUnfT04eq2VywiA68sn0mYr+WFxmjmCimJgT/u42ybwNfQDu5E5vKmPGHgAAAABJRU5ErkJggg=='

        function dragginginIE(e) {

            _ghostComponent.style.top = (e.pageY + 5) + 'px';
            _ghostComponent.style.left = (e.pageX + 5) + 'px';

        }

        function DesignEditorController($scope, $rootScope, diagramService, $log, connectionHandling,
            designService, $state, $stateParams, designLayoutService,
            symbolManager, $timeout, nodeService, gridService, $cookies, projectHandling,
            acmImportService, mmsUtils, operationsManager, wiringService, $q, $injector, $mdToast) {

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

                                            var wireEnd1 = wire.getEnd1();
                                            var wireEnd2 = wire.getEnd2();
                                            node.setRegistry('wireSegments', wire.getCopyOfSegmentsParameters());
                                            node.makePointer('src', wireEnd1.port.id);
                                            node.makePointer('dst', wireEnd2.port.id);

                                            wire.setId(node.id);
                                            diagram.addWire(wire);

                                            nodeService.loadNode(layoutContext, wireEnd1.port.id)
                                                .then(function(port1) {

                                                    nodeService.loadNode(layoutContext, wireEnd2.port.id)
                                                        .then(function(port2) {

                                                            var CloneConnector = function (srcConnector, targetConnector) {
                                                                var definition = srcConnector.getAttribute('Definition');
                                                                targetConnector.setAttribute('Definition', definition);

                                                                // Copy content
                                                                var nodesToCopy = {};
                                                                srcConnector.loadChildren(layoutContext)
                                                                    .then(function (children) {
                                                                        children.forEach(function (child) {
                                                                            nodesToCopy[child.id] = child;
                                                                        });

                                                                        nodeService.copyMoreNodes(layoutContext, targetConnector.id, nodesToCopy);
                                                                    });
                                                            };

                                                            var port1Def = port1.getAttribute('Definition');
                                                            var port2Def = port2.getAttribute('Definition');
                                                            var port1IsTyped = port1Def !== '';
                                                            var port2IsTyped = port2Def !== '';


                                                            // Logic for handling connection based on definitions
                                                            if (port1IsTyped === false && port2IsTyped === true)
                                                            {
                                                                // Transfer port2's type to port1
                                                                CloneConnector(port2, port1);
                                                            }
                                                            else if (port1IsTyped === true && port2IsTyped === false)
                                                            {
                                                                // Transfer port1's type to port2
                                                                CloneConnector(port1, port2);
                                                            }
                                                            else if (port1IsTyped === true && port2IsTyped === true)
                                                            {
                                                                console.log('both of these connectors are typed');
                                                            }
                                                            else if (port1IsTyped === false && port2IsTyped === false)
                                                            {
                                                                console.log('neither of these connectors are typed');
                                                            }
                                                            else
                                                            {
                                                                console.log('how is this even possible');
                                                            }
                                                        });
                                                });
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

                        var TestConnectorForInferredType = function(connector) {
                            // Does this guy (or his ports) have any connections?
                            // If not, and his parent is a Container, then strip his Connector typing info.

                            var meta;
                            nodeService.getMetaNodes(layoutContext)
                                .then(function(meta_) {
                                    meta = meta_;
                                    return connector.getParentNode();
                                })
                                .then(function(parent) {
                                    var parentMetaTypeName = parent.getMetaTypeName(meta);
                                    if (parentMetaTypeName === 'Container') {
                                        var IsNodeConnected = function(node) {
                                            var sources = node.getCollectionPaths('src');
                                            var destinations = node.getCollectionPaths('dst');

                                            if (sources.length + destinations.length > 0) {
                                                return true;
                                            } else {
                                                return false;
                                            }
                                        };

                                        if (IsNodeConnected(connector)) {
                                            console.log(connector.getAttribute('name'), 'has connections and will be spared');
                                        } else {
                                            connector.loadChildren()
                                                .then(function (children) {
                                                    var anyConnected = false;
                                                    children.forEach(function (child) {
                                                        if (IsNodeConnected(child)) {
                                                            anyConnected = true;
                                                        }
                                                    });

                                                    if (anyConnected === false) {
                                                        console.log(connector.getAttribute('name'), 'will be de-typed');
                                                        connector.setAttribute('Definition', '');

                                                        children.forEach(function (child) {
                                                            child.destroy();
                                                        });
                                                    } else {
                                                        console.log(connector.getAttribute('name'), 'has a connected port and will be spared');
                                                    }
                                                });
                                        }
                                    }
                                });
                        };

                        // Fetch both SRC and DST connectors and check them to see if their
                        // Connector typing info needs to be stripped.
                        // We can delete the wire as soon as we have the pointers to these connectors.
                        nodeService.loadNode(layoutContext, wire.getId())
                            .then(function(wireObj) {
                                var srcPointer = wireObj.getPointer('src').to;
                                var dstPointer = wireObj.getPointer('dst').to;
                                nodeService.destroyNode(layoutContext, wire.getId(), message || 'Deleting wire');

                                nodeService.loadNode(layoutContext, srcPointer)
                                    .then(function (srcConnector) {
                                        TestConnectorForInferredType(srcConnector);
                                    });

                                nodeService.loadNode(layoutContext, dstPointer)
                                    .then(function (dstConnector) {
                                        TestConnectorForInferredType(dstConnector);
                                    });
                            });
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

                    addRootScopeEventListener('selectedDiagramThingsDeletionMustBeDone', function($event, diagram, msg) {

                        var selectedComponents = diagram.getSelectedComponents(),
                            selectedWires = diagram.getSelectedWires(),
                            selectedWireSegmentsWithSelectedEndCorner = diagram.getWireSegmentsWithSelectedEndCorner(),
                            deletedWires = [],
                            i,
                            nodeIdsToDelete = [],
                            deleteMessage = 'Deleting design element',

                            doDeletionOfComponent = function(component) {

                                var i,
                                    componentWires = [],
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

                        if ((!Array.isArray(selectedComponents) || selectedComponents.length === 0) &&
                            (!Array.isArray(selectedWires) || selectedWires.length === 0) &&
                            (!Array.isArray(selectedWireSegmentsWithSelectedEndCorner) || selectedWireSegmentsWithSelectedEndCorner.length === 0)) {
                            // nothing to do
                            return;
                        }

                        $rootScope.setProcessing();
                        nodeService.startTransaction(layoutContext, msg || 'Deleting design elements');

                        if (Array.isArray(selectedComponents)) {

                            angular.forEach(selectedComponents, function(component) {

                                deletedWires = deletedWires.concat(doDeletionOfComponent(component));

                            });

                        }

                        if (Array.isArray(selectedWires)) {

                            angular.forEach(selectedWires, function(aWire) {

                                if (deletedWires.indexOf(aWire) === -1) {
                                    nodeIdsToDelete.push(aWire.getId());
                                    deletedWires.push(aWire);
                                }

                            });
                        }

                        // Now updating wires which has corners deleted

                        var wiresToUpdate = [];

                        if (Array.isArray(selectedWireSegmentsWithSelectedEndCorner)) {

                            angular.forEach(selectedWireSegmentsWithSelectedEndCorner, function(aSegment) {

                                var parentWire = aSegment.getParentWire();

                                if (deletedWires.indexOf(parentWire) === -1) {

                                    parentWire.destroyEndCornerOfSegment(aSegment, wiringService);

                                    if (wiresToUpdate.indexOf(parentWire) === -1) {
                                        wiresToUpdate.push(parentWire);
                                    }

                                }

                            });

                        }

                        var gmeUpdatePromises = [];

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

                                            if (diagram && wiringService.selectedRouter.id !== 'autoRouter') {

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


                                var designConfig = projectHandling.getSelectedDesignConfig();

                                if (designConfig && designConfig.tutorial && $cookies['seenTutorialFor' + designConfig.name] !== 'true') {

                                    $rootScope.openHelpDialog();
                                    $cookies['seenTutorialFor' + designConfig.name] = 'true';

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

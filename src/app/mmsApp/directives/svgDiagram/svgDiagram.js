/*globals angular, $*/

'use strict';

// Move this to GME eventually

require('../componentWiresContainer/componentWiresContainer.jsx');

require('./operations/moveComponents.js');
require('./operations/rotateComponents.js');
require('./operations/reorderComponent.js');
require('./operations/relabelComponent.js');
require('./operations/moveWires.js');

angular.module('mms.svgDiagram', [
        'mms.designVisualization.gridService',

        'mms.designVisualization.operationsManager',
        'mms.designVisualization.operations.moveComponents',
        'mms.designVisualization.operations.rotateComponents',
        'mms.designVisualization.operations.reorderComponent',
        'mms.designVisualization.operations.relabelComponent',
        'mms.designVisualization.operations.moveWire',
        'monospaced.mousewheel',

        'mms.designEditor.componentWiresContainer.react',

        'isis.ui.contextmenu',

        'mms.componentBrowser.componentLibrary',
        'mms.subcircuitBrowser.subcircuitLibrary'
    ])
    .config(function(componentLibraryProvider, subcircuitLibraryProvider, contentServerUrl) {
        componentLibraryProvider.setServerUrl(contentServerUrl);
        subcircuitLibraryProvider.setServerUrl(contentServerUrl);
    })
    .directive('svgDiagram',
        function($rootScope, $log, diagramService, wiringService, componentLibrary, contentServerUrl,
            gridService, $window, $timeout, contextmenuService, operationsManager, mmsUtils, dndService,
            acmImportService, testBenchService, projectHandling, $mdToast) {

            var DiagramDropHandler = require('./mixins/DiagramDropHandler');

            function SVGDiagramController($scope) {

                var
                    SelectionHandler = require('./classes/SelectionHandler'),
                    selectionHandler,

                    ComponentDragHandler = require('./classes/ComponentDragHandler'),
                    componentDragHandler,

                    WireDragHandler = require('./classes/WireDragHandler'),
                    wireDragHandler,

                    WireDrawHandler = require('./classes/WireDrawHandler'),
                    wireDrawHandler,

                    ContextMenuHandler = require('./classes/ContextmenuHandler'),
                    contextMenuHandler,

                    PanHandler = require('./classes/PanHandler'),
                    panHandler,

                    DrawSelectionHandler = require('./classes/DrawSelectionHandler'),
                    drawSelectionHandler,

                    ComponentKeyboardOperationsHandler = require('./classes/ComponentKeyboardOperationsHandler'),
                    componentKeyboardOperationsHandler,

                    componentElements,

                    wasComponnetMouseDowned = false,
                    wasDiagramMouseDowned = false,
                    wasWireMouseDowned = false,
                    wasPortMouseDowned = false,
                    wasWireCornerMouseDowned = false,

                    hoverToggleClasses = ['.port', '.container-box', '.decorated-port', '.supply-single-symbol', '.connector-adapter'],

                    $$window,

                    self = this;

                $$window = $($window);

                $scope.ctrl = this;

                this.$rootScope = $rootScope;
                this.componentLibrary = componentLibrary;
                this.mmsUtils = mmsUtils;
                this.contentServerUrl = contentServerUrl;
                this.$log = $log;
                this.$mdToast = $mdToast;
                this.acmImportService = acmImportService;
                this.dndService = dndService;

                this._portElementsByType = null;
                this._focusedPort = null;
                this._connectedPorts = [];
                this._connectedWires = [];

                this.diagramDropElement = 'svg';
                this.componentDropElements = ['g', 'rect'];

                this.diagramDroppableFiles = ['adm', 'adp', 'acm', 'brd', 'zip'];
                this.componentDroppableFiles = ['svg'];

                // Setting up handlers

                componentDragHandler = new ComponentDragHandler(
                    $scope,
                    $rootScope,
                    diagramService,
                    wiringService,
                    operationsManager,
                    $timeout,
                    gridService,
                    $log,
                    $mdToast
                );

                wireDragHandler = new WireDragHandler(
                    $scope,
                    $rootScope,
                    diagramService,
                    wiringService,
                    operationsManager,
                    $timeout,
                    gridService,
                    $log,
                    $mdToast
                );

                drawSelectionHandler = new DrawSelectionHandler(
                    $scope,
                    $rootScope,
                    diagramService,
                    wiringService,
                    operationsManager,
                    $timeout,
                    gridService,
                    $log
                );

                selectionHandler = new SelectionHandler(
                    $scope,
                    diagramService,
                    $timeout
                );

                wireDrawHandler = new WireDrawHandler(
                    $scope,
                    $rootScope,
                    diagramService,
                    wiringService,
                    gridService,
                    $timeout,
                    $log
                );

                contextMenuHandler = new ContextMenuHandler(
                    $scope,
                    $rootScope,
                    diagramService,
                    $timeout,
                    contextmenuService,
                    operationsManager,
                    wiringService,
                    $log,
                    gridService,
                    testBenchService,
                    projectHandling,
                    $mdToast
                );


                panHandler = new PanHandler(
                    $scope,
                    $log
                );

                componentKeyboardOperationsHandler = new ComponentKeyboardOperationsHandler(
                    $scope,
                    $rootScope,
                    operationsManager,
                    mmsUtils,
                    $mdToast
                );

                $scope.routerTypes = wiringService.getRouterTypes();

                $scope.selectedRouter = $scope.routerTypes[0];

                $scope.onDiagramMouseDown = function(event) {

                    wasDiagramMouseDowned = true;

                    drawSelectionHandler.cancel();

                    var target = event.srcElement || event.target;

                    if (target === $scope.svgContainer) {
                        if (event.which === 3) {
                            contextMenuHandler.onDiagramContextmenu(event);
                        } else {

                            contextMenuHandler.onDiagramMouseDown(event);

                            if (event.shiftKey) {
                                drawSelectionHandler.onDiagramMouseDown(event);
                            } else {
                                panHandler.onDiagramMouseDown(event);
                            }

                        }
                    }

                };

                $scope.onDiagramMouseUp = function(event) {

                    if (wasDiagramMouseDowned) {

                        var target = event.srcElement || event.target;

                        drawSelectionHandler.onDiagramMouseUp(event);

                        if (target === $scope.svgContainer) {


                            if (!componentDragHandler.dragging && !wireDrawHandler.wiring && !wireDragHandler.dragging && !panHandler.panning &&
                                event.which !== 3) {

                                $scope.diagram.clearSelection();

                            }

                            componentDragHandler.onDiagramMouseUp(event);
                            wireDragHandler.onDiagramMouseUp(event);
                            wireDrawHandler.onDiagramMouseUp(event);
                            panHandler.onDiagramMouseUp(event);

                            if (wasWireMouseDowned || wasWireCornerMouseDowned) {
                                self.toggleHoverForClassArray(hoverToggleClasses, false);
                            }

                        }

                        wasDiagramMouseDowned = false;

                    }
                };

                $scope.onDiagramClick = function( /*$event*/ ) {


                };

                $scope.onDiagramMouseMove = function($event) {

                    drawSelectionHandler.onDiagramMouseMove($event);
                    componentDragHandler.onDiagramMouseMove($event);
                    wireDragHandler.onDiagramMouseMove($event);
                    wireDrawHandler.onDiagramMouseMove($event);
                    panHandler.onDiagramMouseMove($event);

                };

                $scope.getCssClass = function() {

                    var result = '';

                    if (componentDragHandler.dragging) {
                        result += ' dragging';
                    }

                    if (panHandler.panning) {
                        result += ' panning';
                    }

                    if (panHandler.pannable) {
                        result += ' pannable';
                    }

                    return result;

                };

                $scope.onDiagramMouseWheel = function( /*$event, $delta, $deltaX, $deltaY*/ ) {
                    //console.log($event, $delta, $deltaX, $deltaY);
                };

                $scope.onDiagramMouseLeave = function($event) {

                    componentDragHandler.onDiagramMouseLeave($event);
                    wireDragHandler.onDiagramMouseLeave($event);
                    wireDrawHandler.onDiagramMouseLeave($event);
                    panHandler.onDiagramMouseLeave($event);
                    drawSelectionHandler.cancel();

                    if (wasWireMouseDowned || wasWireCornerMouseDowned) {

                        self.toggleHoverForClassArray(hoverToggleClasses, false);

                    }

                    wasComponnetMouseDowned = false;
                    wasDiagramMouseDowned = false;
                    wasWireMouseDowned = false;
                    wasPortMouseDowned = false;
                    wasWireCornerMouseDowned = false;
                };

                function onWindowBlur($event) {

                    componentDragHandler.onWindowBlur($event);
                    wireDragHandler.onWindowBlur($event);
                    wireDrawHandler.onWindowBlur($event);
                    panHandler.onWindowBlur($event);
                    dndService.stopDrag();
                    drawSelectionHandler.cancel();

                    if (wasWireMouseDowned || wasWireCornerMouseDowned) {

                        self.toggleHoverForClassArray(hoverToggleClasses, false);

                    }

                    wasComponnetMouseDowned = false;
                    wasDiagramMouseDowned = false;
                    wasWireMouseDowned = false;
                    wasPortMouseDowned = false;
                    wasWireCornerMouseDowned = false;

                }

                $$window.on('blur', onWindowBlur);


                // Interactions with components

                this.onComponentMouseUp = function(component, $event) {

                    if (wasComponnetMouseDowned || componentDragHandler.dragging) {

                        if (!componentDragHandler.dragging && !wireDrawHandler.wiring && !wireDragHandler.dragging && !panHandler.panning &&
                            $event.which !== 3) {

                            selectionHandler.onComponentMouseUp(component, $event);
                            $event.stopPropagation();

                            componentDragHandler.onComponentMouseUp(component, $event);

                        } else {
                            componentDragHandler.onComponentMouseUp(component, $event);
                            panHandler.onComponentMouseUp($event);
                        }

                        wasComponnetMouseDowned = false;

                    }
                };

                this.onPortMouseDown = function(component, port, $event) {

                    if (!wasWireMouseDowned && !wasWireCornerMouseDowned) {

                        wasPortMouseDowned = true;

                        if (!wireDrawHandler.wiring && $event.which === 3) {

                            contextMenuHandler.onPortContextmenu(component, port, $event);

                        } else {
                            wireDrawHandler.onPortMouseDown(component, port, $event);
                        }
                    }

                };

                this.onPortMouseUp = function(component, port, $event) {

                    if (wasPortMouseDowned) {

                        if (panHandler.panning) {
                            panHandler.onPortMouseUp($event);
                        }

                        $event.stopPropagation();

                        wasPortMouseDowned = false;

                    }

                };

                this.onPortClick = function(component, port, $event) {

                    $event.stopPropagation();

                };

                this.onComponentMouseDown = function(component, $event) {

                    if (!wasWireMouseDowned && !wasWireCornerMouseDowned) {

                        wasComponnetMouseDowned = true;

                        if ($event.which === 3) {

                            contextMenuHandler.onComponentContextmenu(component, $event);

                        } else {

                            componentDragHandler.onComponentMouseDown(component, $event);

                        }
                    }

                };

                this.onWireMouseUp = function(wire, segment, event) {

                    if (wasWireMouseDowned) {

                        if (!componentDragHandler.dragging && !wireDrawHandler.wiring && !wireDragHandler.dragging && !panHandler.panning &&
                        event.button !== 2) {

                            selectionHandler.onWireMouseUp(wire, event);
                            event.stopPropagation();

                            wireDragHandler.onWireMouseUp(wire, segment, event);

                        } else {
                            wireDragHandler.onWireMouseUp(wire, segment, event);
                            event.stopPropagation();
                        }

                        wasWireMouseDowned = false;

                        self.toggleHoverForClassArray(hoverToggleClasses, false);

                    }

                };

                this.onWireMouseDown = function(wire, segment, event) {

                    wasWireMouseDowned = true;

                    if (event.button === 2) {

                        contextMenuHandler.onWireContextmenu(wire, segment, event);


                    } else {

                        wireDragHandler.onWireMouseDown(wire, segment, event);

                    }

                    self.toggleHoverForClassArray(hoverToggleClasses, true);

                };

                this.onWireMouseOver = function(wireId) {

                    var wireEl = document.getElementById(wireId);

                    if (wireEl && wireEl.classList) {

                        angular.forEach(wireEl.childNodes, function(wireSegmentEl) {

                            wireSegmentEl.classList.add('hover');

                        });

                    }

                };

                this.onWireMouseOut = function(wireId) {

                    var wireEl = document.getElementById(wireId);

                    if (wireEl && wireEl.classList) {

                        angular.forEach(wireEl.childNodes, function(wireSegmentEl) {

                            wireSegmentEl.classList.remove('hover');

                        });

                    }

                };

                this.toggleHoverForClassArray = function(classNameArray, disable) {

                    for (var i in classNameArray) {

                        self.toggleClassHover(classNameArray[i], disable);

                    }

                };

                this.toggleClassHover = function(className, disable) {

                    var els = document.querySelectorAll(className);

                    if (els) {

                        Array.prototype.forEach.call(els, function(el) {

                            if (el.classList) {

                                if (disable) {
                                    el.classList.add('no-hover');
                                }
                                else {
                                    el.classList.remove('no-hover');
                                }

                            }

                        });

                    }

                };

                this.onComponentDoubleClick = function(component) {

                    if (component.metaType === 'Container') {
                        $rootScope.$emit('containerMustBeOpened', component);
                    }

                };

                this.onWireCornerMouseUp = function(wire, segment, $event) {

                    if (wasWireCornerMouseDowned) {

                        wireDragHandler.onWireMouseUp(wire, segment, $event);
                        $event.stopPropagation();

                        wasWireCornerMouseDowned = false;

                        self.toggleHoverForClassArray(hoverToggleClasses, false);

                    }

                };

                this.onWireCornerMouseDown = function(wire, segment, event) {

                    wasWireCornerMouseDowned = true;

                    if (event.button === 2) {

                        contextMenuHandler.onWireContextmenu(wire, segment, event, true);


                    } else {

                        wireDragHandler.onWireMouseDown(wire, segment, event, true);

                    }

                    self.toggleHoverForClassArray(hoverToggleClasses, true);

                };

                this.isEditable = function() {

                    $scope.diagram.config = $scope.diagram.config || {};

                    return $scope.diagram.config.editable === true;
                };

                this.disallowSelection = function() {

                    $scope.diagram.config = $scope.diagram.config || {};

                    return $scope.diagram.config.disallowSelection === true;
                };

                this.registerComponentElement = function(id, el) {

                    componentElements = componentElements || {};

                    componentElements[id] = el;

                };

                this.unregisterComponentElement = function(id) {

                    componentElements = componentElements || {};

                    delete componentElements[id];

                };

                this.onPortMouseOver = function(diagram, component, port) {

                    if (!wireDrawHandler.wiring && !wasWireMouseDowned && !wasWireCornerMouseDowned) {

                        this._focusedPort = port;
                        this.focusPorts(diagram);

                        // Highlight other ports that are connected to this port
                        //   only before a wire drawing has begun.
                        this.focusConnectedPortsAndWires(diagram, port);

                    }

                };

                this.onPortMouseOut = function(diagram) {

                    if (!wireDrawHandler.wiring) {

                        // only if not drawing a line
                        this.unFocusPorts();

                    }

                    this.unFocusConnectedPortsAndWires(diagram);

                };


                this.registerPortElement = function(type, element) {

                    this._portElementsByType = this._portElementsByType || {};

                    this._portElementsByType[type] = this._portElementsByType[type] || [];

                    if (this._portElementsByType[type].indexOf(element) === -1) {
                        this._portElementsByType[type].push(element);
                    }

                };

                this.deregisterPortElement = function(type, element) {

                    if (this._portElementsByType && this._portElementsByType[type]) {

                        var index = this._portElementsByType[type].indexOf(element);

                        if ( index > -1 ) {
                            this._portElementsByType[type].splice(index, 1);
                        }

                    }

                };
                
                this.focusConnectedPortsAndWires = function(diagram) {
                    
                    self.findConnectedPortsAndWires(this._focusedPort, diagram.getWires(), 0);

                };

                this.findConnectedPortsAndWires = function(port, wires, level) {

                    var wireEnds,
                        wire,
                        wireId,
                        wireEl,
                        matchingPort,
                        connectionType = level === 0 ? ' highlight-direct' : ' highlight-indirect';

                    for (var w in wires) {

                        wire = wires[w];

                        wireId = wire.getId();

                        wireEnds = wire.getEnds();

                        if (wireEnds.end1.port.id === port.id) {
                            
                            matchingPort = wireEnds.end2.port;

                        }
                        else if (wireEnds.end2.port.id === port.id) {
                            
                            matchingPort = wireEnds.end1.port;

                        }

                        
                        if (matchingPort) {

                            if (level !== 0 && (this._connectedPorts.indexOf(matchingPort.id) !== -1 
                                                || matchingPort.id === this._focusedPort.id)) {
                                
                                matchingPort = null;
                                continue;

                            }

                            this._connectedPorts.push(matchingPort.id);

                            matchingPort.portSymbol.cssClass += connectionType;

                            if (level === 0 && this._connectedWires.indexOf(wireId) === -1) {

                                this._connectedWires.push(wireId);

                                wireEl = document.getElementById(wireId);

                                if (wireEl && wireEl.classList) {
                                    wireEl.classList.add('highlight');
                                }

                            }

                            level++;

                            self.findConnectedPortsAndWires(matchingPort, wires, level);
                            matchingPort = null;
                            
                            level --;
                        }

                    }

                };

                this.unFocusConnectedPortsAndWires = function(diagram) {

                    var port,
                        portId,
                        wireEl;

                    if (this._connectedPorts.length > 0) {

                        for (portId in this._connectedPorts) {

                            port = diagram.getPortById(this._connectedPorts[portId]);

                            port.portSymbol.cssClass =
                                port.portSymbol.cssClass.replace(' highlight-direct', '').
                                                         replace(' highlight-indirect', '');

                        }

                        this._connectedPorts = [];
                    }

                    angular.forEach(this._connectedWires, function(wireId) {

                        wireEl = document.getElementById(wireId);

                        if (wireEl && wireEl.classList) {

                            wireEl.classList.remove('highlight');
                        }

                    });

                    this._connectedWires = [];

                };

                this.focusPorts = function() {

                    var typeToFocus = this._focusedPort &&
                            this._focusedPort.portSymbol &&
                            this._focusedPort.portSymbol.type;

                        if (typeToFocus) {

                            var connectorDescriptionEls = document.querySelectorAll(
                                '.connector-description.' + typeToFocus
                            );

                            if (connectorDescriptionEls) {

                                Array.prototype.forEach.call(connectorDescriptionEls, function(el) {

                                    var nameEl = el.querySelector('.connector-name');

                                    if (nameEl.textContent === self._focusedPort.portSymbol.label && el.classList) {
                                        el.classList.add('focused');
                                    }

                                });

                            }

                            if(this._portElementsByType) {

                                for (var type in this._portElementsByType) {

                                    if (type !== typeToFocus) {

                                        for (var i = 0; i < this._portElementsByType[type].length; i++) {
                                            if (this._portElementsByType[type][i].classList) {
                                                this._portElementsByType[type][i].classList.add('faded');
                                            }
                                        }

                                    }
                                }
                            }

                        }

                };

                this.unFocusPorts = function() {

                    if (this._portElementsByType) {

                        for (var type in this._portElementsByType) {

                            for (var i = 0; i < this._portElementsByType[type].length; i++) {
                                if (this._portElementsByType[type][i].classList) {
                                    this._portElementsByType[type][i].classList.remove('faded');
                                }
                            }
                        }

                    }

                    var portDescriptors = document.querySelectorAll('.connector-description');

                    if (portDescriptors) {
                        Array.prototype.map.call(portDescriptors, function(el) {
                            if (el.classList) {
                                el.classList.remove('focused');
                            }
                        });
                    }

                    this._focusedPort = null;

                };

                $rootScope.snapToGrid = true;

                $scope.$on('$destroy', function() {
                    $$window.off('blur', onWindowBlur);
                });


            }

            DiagramDropHandler.prototype.apply(SVGDiagramController.prototype);

            return {
                controller: SVGDiagramController,
                require: ['^diagramContainer', 'svgDiagram'],
                restrict: 'E',
                scope: {
                    diagram: '='
                },
                replace: true,
                templateUrl: '/mmsApp/templates/svgDiagram.html',
                link: function(scope, element, attributes, controllers) {

                    var id,
                        $element,

                        killContextMenu,
                        killDelete,
                        currentDiagramId,
                        diagramContainerController = controllers[0],
                        svgDiagramController = controllers[1],

                        dropHandler;

                    $element = $(element);

                    scope.diagramContainerController = diagramContainerController;

                    killContextMenu = function($event) {

                        $log.debug('Not showing default contextmenu');

                        $event.stopPropagation();

                        return false;

                    };

                    scope.$watch(function() {

                        return scope.diagram && scope.diagram.id;

                    }, function(newDiagramId, oldDiagramId) {

                        if (newDiagramId && newDiagramId !== currentDiagramId) {

                            currentDiagramId = newDiagramId;

                            scope.$element = $element;
                            scope.svgContainer = $element[0].querySelector('svg.svg-diagram');

                            //$element.outerWidth(scope.diagram.config.width);
                            //$element.outerHeight(scope.diagram.config.width);

                            scope.id = id = newDiagramId;

                            scope.visibleObjects = gridService.createGrid(id,
                                scope.diagram
                            );

                            $timeout(function() {
                                diagramContainerController.setInitialized(true);
                                scope.$emit('DiagramInitialized');

                            }, 300);

                        }

                    });

                    scope.$watch(
                        function() {
                            return diagramContainerController.getVisibleArea();
                        },
                        function(visibleArea) {

                            if (scope.$element) {

                                scope.visibleArea = visibleArea;

                                scope.elementOffset = scope.$element.offset();
                                gridService.setVisibleArea(id, visibleArea);
                            }
                        });


                    //scope.$watch('visibleObjects.components', function(val) {
                    //    console.log('visible objects', val);
                    //});

                    $element.bind('contextmenu', killContextMenu);

                    killDelete = function(event) {

                        var d,
                            doPrevent;

                        if (event.keyCode === 8) { // Delete

                            doPrevent = true;

                            d = event.srcElement || event.target;

                            if (d.tagName) {

                                if ((d.tagName.toUpperCase() === 'INPUT' &&
                                        (
                                            d.type.toUpperCase() === 'TEXT' ||
                                            d.type.toUpperCase() === 'PASSWORD' ||
                                            d.type.toUpperCase() === 'FILE' ||
                                            d.type.toUpperCase() === 'EMAIL' ||
                                            d.type.toUpperCase() === 'SEARCH' ||
                                            d.type.toUpperCase() === 'DATE')
                                    ) ||
                                    d.tagName.toUpperCase() === 'TEXTAREA') {
                                    doPrevent = d.readOnly || d.disabled;
                                }
                            }
                        }

                        if (doPrevent) {
                            event.preventDefault();
                        }

                    };


                    function keyDownHandler(event) {

                        killDelete(event);

                        if (event.keyCode === 90 && (event.metaKey || event.ctrlKey)) {
                            projectHandling.undo();
                        }

                        $timeout(function() {
                            scope.$emit('keydownOnDocument', event);
                        });

                    }

                    function keyUpHandler(event) {

                    }

                    $(document).bind('keydown', keyDownHandler);
                    $(document).bind('keyup', keyUpHandler);

                    dropHandler = svgDiagramController._onDrop.bind(svgDiagramController);

                    dndService.registerDropTarget(
                        element[0].querySelector('svg'),
                        'component subscircuit',
                        dropHandler,
                        false
                    );

                    // dragenterFromOutsideHandler = svgDiagramController._onDragenterFromOutside.bind(svgDiagramController);
                    // dragleaveFromOutsideHandler = svgDiagramController._onDragleaveFromOutside.bind(svgDiagramController);

                    // document.documentElement.addEventListener('dragenter', dragenterFromOutsideHandler, false);
                    // document.documentElement.addEventListener('dragenter', dragleaveFromOutsideHandler, false);

                    scope.$on('$destroy', function() {

                        $(document).unbind('keydown', keyDownHandler);
                        $(document).unbind('keyup', keyUpHandler);
                        $element.unbind('contextmenu', killContextMenu);

                        dndService.unregisterDropTarget( element[0].querySelector('svg') );

                        // document.documentElement.removeEventListener('dragenter', dragenterFromOutsideHandler);
                        // document.documentElement.removeEventListener('dragenter', dragleaveFromOutsideHandler);

                    });

                }

            };
        }
    );

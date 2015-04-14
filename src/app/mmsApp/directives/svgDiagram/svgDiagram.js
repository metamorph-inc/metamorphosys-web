/*globals angular, $*/

'use strict';

// Move this to GME eventually

require('../componentWire/componentWire.js');

require('../componentWiresContainer/componentWiresContainer.jsx');

require('./operations/moveComponents.js');
require('./operations/rotateComponents.js');
require('./operations/reorderComponent.js');
require('./operations/relabelComponent.js');
require('./operations/moveWires.js');

angular.module('mms.svgDiagram', [
        'mms.designVisualization.gridService',
        'mms.designVisualization.componentWire',

        'mms.designVisualization.operationsManager',
        'mms.designVisualization.operations.moveComponents',
        'mms.designVisualization.operations.rotateComponents',
        'mms.designVisualization.operations.reorderComponent',
        'mms.designVisualization.operations.relabelComponent',
        'mms.designVisualization.operations.moveWire',
        'monospaced.mousewheel',

        'mms.designEditor.componentWiresContainer.react',

        'isis.ui.contextmenu'
    ])
    .directive('svgDiagram',
        function($rootScope, $log, diagramService, wiringService, componentBrowserService, componentServerUrl,
            gridService, $window, $timeout, contextmenuService, operationsManager, mmsUtils, dndService, 
            acmImportService) {

            var DiagramDropHandler = require('./mixins/DiagramDropHandler');

            function SVGDiagramController($scope) {

                var
                    ComponentSelectionHandler = require('./classes/ComponentSelectionHandler'),
                    componentSelectionHandler,

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

                    ComponentKeyboardOperationsHandler = require('./classes/ComponentKeyboardOperationsHandler'),
                    componentKeyboardOperationsHandler,

                    componentElements,

                    $$window;

                $$window = $($window);

                this.$rootScope = $rootScope;
                this.componentBrowserService = componentBrowserService;
                this.mmsUtils = mmsUtils;
                this.componentServerUrl = componentServerUrl;                
                this.$log = $log;
                this.acmImportService = acmImportService;
                this.dndService = dndService;

                // Setting up handlers

                componentDragHandler = new ComponentDragHandler(
                    $scope,
                    diagramService,
                    wiringService,
                    operationsManager,
                    $timeout,
                    gridService,
                    $log
                );

                wireDragHandler = new WireDragHandler(
                    $scope,
                    $rootScope,
                    diagramService,
                    wiringService,
                    operationsManager,
                    $timeout,
                    gridService,
                    $log
                );

                componentSelectionHandler = new ComponentSelectionHandler(
                    $scope,
                    diagramService,
                    gridService,
                    $log,
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
                    $log
                );


                panHandler = new PanHandler(
                    $scope,
                    $log
                );

                componentKeyboardOperationsHandler = new ComponentKeyboardOperationsHandler(
                    $scope,
                    $rootScope,
                    operationsManager,
                    mmsUtils
                );

                //

                $scope.routerTypes = wiringService.getRouterTypes();

                $scope.selectedRouter = $scope.routerTypes[0];

                $scope.onDiagramMouseDown = function($event) {

                    if ($event.which === 3) {
                        contextMenuHandler.onDiagramContextmenu($event);
                    } else {

                        contextMenuHandler.onDiagramMouseDown($event);
                        panHandler.onDiagramMouseDown($event);

                    }

                };

                $scope.onDiagramMouseUp = function($event) {


                    if (!componentDragHandler.dragging && !wireDrawHandler.wiring && !wireDragHandler.dragging && !panHandler.panning &&
                        $event.which !== 3) {

                        $scope.diagram.clearSelection();

                    }

                    componentDragHandler.onDiagramMouseUp($event);
                    wireDragHandler.onDiagramMouseUp($event);
                    wireDrawHandler.onDiagramMouseUp($event);
                    panHandler.onDiagramMouseUp($event);

                };

                $scope.onDiagramClick = function( /*$event*/ ) {


                };

                $scope.onDiagramMouseMove = function($event) {

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
                    //            console.log($event, $delta, $deltaX, $deltaY);
                };

                $scope.onDiagramMouseLeave = function($event) {

                    componentDragHandler.onDiagramMouseLeave($event);
                    wireDragHandler.onDiagramMouseLeave($event);
                    wireDrawHandler.onDiagramMouseLeave($event);
                    panHandler.onDiagramMouseLeave($event);

                };

                function onWindowBlur($event) {
                    componentDragHandler.onWindowBlur($event);
                    wireDragHandler.onWindowBlur($event);
                    wireDrawHandler.onWindowBlur($event);
                    panHandler.onWindowBlur($event);
                    dndService.stopDrag();
                }

                $$window.on('blur', onWindowBlur);


                // Interactions with components

                this.onComponentMouseUp = function(component, $event) {

                    if (!componentDragHandler.dragging && !wireDrawHandler.wiring && !wireDragHandler.dragging && !panHandler.panning &&
                        $event.which !== 3) {

                        componentSelectionHandler.onComponentMouseUp(component, $event);
                        $event.stopPropagation();

                        componentDragHandler.onComponentMouseUp(component, $event);

                    } else {
                        componentDragHandler.onComponentMouseUp(component, $event);
                        panHandler.onComponentMouseUp($event);
                    }
                };

                this.onPortMouseDown = function(component, port, $event) {

                    if (!wireDrawHandler.wiring && $event.which === 3) {

                        contextMenuHandler.onPortContextmenu(component, port, $event);

                    } else {
                        wireDrawHandler.onPortMouseDown(component, port, $event);
                    }

                };

                this.onPortMouseUp = function(component, port, $event) {

                    if (panHandler.panning) {
                        panHandler.onPortMouseUp($event);
                    }

                    $event.stopPropagation();

                };

                this.onPortClick = function(component, port, $event) {

                    $event.stopPropagation();

                };

                this.onComponentMouseDown = function(component, $event) {

                    if ($event.which === 3) {

                        contextMenuHandler.onComponentContextmenu(component, $event);

                    } else {

                        componentDragHandler.onComponentMouseDown(component, $event);

                    }
                };

                this.onWireMouseUp = function(wire, segment, $event) {

                    wireDragHandler.onWireMouseUp(wire, segment, $event);
                    $event.stopPropagation();

                };

                this.onWireMouseDown = function(wire, segment, $event) {

                    if ($event.which === 3) {

                        contextMenuHandler.onWireContextmenu(wire, segment, $event);


                    } else {

                        wireDragHandler.onWireMouseDown(wire, segment, $event);

                    }
                };

                this.onComponentDoubleClick = function(component) {

                    if (component.metaType === 'Container') {
                        $rootScope.$emit('containerMustBeOpened', component);
                    }

                };

                this.onWireCornerMouseUp = function(wire, segment, $event) {

                    wireDragHandler.onWireMouseUp(wire, segment, $event);
                    $event.stopPropagation();

                };

                this.onWireCornerMouseDown = function(wire, segment, $event) {

                    if ($event.which === 3) {

                        contextMenuHandler.onWireContextmenu(wire, segment, $event, true);


                    } else {

                        wireDragHandler.onWireMouseDown(wire, segment, $event, true);

                    }
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

                            $element.outerWidth(scope.diagram.config.width);
                            $element.outerHeight(scope.diagram.config.width);

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

                        $timeout(function() {
                            scope.$emit('keydownOnDocument', event);
                        });

                    }

                    $(document).bind('keydown', keyDownHandler);

                    dropHandler = svgDiagramController._onDrop.bind(svgDiagramController);

                    dndService.registerDropTarget(
                        element[0].querySelector('svg'), 
                        'component subscircuit',
                        dropHandler
                    );

                    // dragenterFromOutsideHandler = svgDiagramController._onDragenterFromOutside.bind(svgDiagramController);
                    // dragleaveFromOutsideHandler = svgDiagramController._onDragleaveFromOutside.bind(svgDiagramController);                    

                    // document.documentElement.addEventListener('dragenter', dragenterFromOutsideHandler, false);
                    // document.documentElement.addEventListener('dragenter', dragleaveFromOutsideHandler, false);                    

                    scope.$on('$destroy', function() {

                        $(document).unbind('keydown', keyDownHandler);
                        $element.unbind('contextmenu', killContextMenu);

                        dndService.unregisterDropTarget( element[0].querySelector('svg') );

                        // document.documentElement.removeEventListener('dragenter', dragenterFromOutsideHandler);
                        // document.documentElement.removeEventListener('dragenter', dragleaveFromOutsideHandler);                    

                    });

                }

            };
        }
    );

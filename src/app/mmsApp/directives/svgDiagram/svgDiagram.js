/*globals angular, $*/

'use strict';

// Move this to GME eventually

require('../componentWire/componentWire.js');

angular.module('mms.designVisualization.svgDiagram', [
    'mms.designVisualization.gridService',
    'mms.designVisualization.componentWire',
    'mms.designVisualization.operationsManager',
    'isis.ui.contextmenu'
])
    .controller('SVGDiagramController', function (
        $scope, $rootScope, $log, diagramService, wiringService, gridService, $window, $timeout, contextmenuService, operationsManager) {

        var

            ComponentSelectionHandler = require('./classes/ComponentSelectionHandler'),
            componentSelectionHandler,

            ComponentDragHandler = require('./classes/ComponentDragHandler'),
            componentDragHandler,

            WireDragHandler = require('./classes/WireDragHandler'),
            wireDragHandler,

            WireDrawHandler = require('./classes/WireDrawHandler'),
            wireDrawHandler,

            ContextMenuHandler = require('./classes/contextMenuHandler'),
            contextMenuHandler,

            componentElements,

            $$window;

        $$window = $($window);

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
            $log
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

        $scope.routerTypes = wiringService.getRouterTypes();

        $scope.selectedRouter = $scope.routerTypes[0];

        $scope.onDiagramMouseDown = function ($event) {


            if ($event.which === 3) {
                contextMenuHandler.onDiagramContextmenu($event);
            } else {
                contextMenuHandler.onDiagramMouseDown($event);
            }

        };

        $scope.onDiagramMouseUp = function ($event) {

            if (!componentDragHandler.dragging &&
                !wireDrawHandler.wiring &&
                !wireDragHandler.dragging &&
                $event.which !== 3 ) {

                $scope.diagram.state.selectedComponentIds = [];

            }

            componentDragHandler.onDiagramMouseUp($event);
            wireDragHandler.onDiagramMouseUp($event);
            wireDrawHandler.onDiagramMouseUp($event);

        };

        $scope.onDiagramClick = function (/*$event*/) {


        };

        $scope.onDiagramMouseMove = function ($event) {

            componentDragHandler.onDiagramMouseMove($event);
            wireDragHandler.onDiagramMouseMove($event);
            wireDrawHandler.onDiagramMouseMove($event);

        };

        $scope.getCssClass = function () {

            var result = '';

            if (componentDragHandler.dragging) {
                result += 'dragging';
            }

            return result;

        };

        $scope.onDiagramMouseLeave = function ($event) {

            componentDragHandler.onDiagramMouseLeave($event);
            wireDragHandler.onDiagramMouseLeave($event);
            wireDrawHandler.onDiagramMouseLeave($event);

        };

        $$window.blur(function ($event) {

            componentDragHandler.onWindowBlur($event);
            wireDragHandler.onWindowBlur($event);
            wireDrawHandler.onWindowBlur($event);

        });


        // Interactions with components

        this.onComponentMouseUp = function (component, $event) {

            if (!componentDragHandler.dragging &&
                !wireDrawHandler.wiring &&
                !wireDragHandler.dragging &&
                $event.which !== 3 ) {

                componentSelectionHandler.onComponentMouseUp(component, $event);
                $event.stopPropagation();

                componentDragHandler.onComponentMouseUp(component, $event);

            } else {
                componentDragHandler.onComponentMouseUp(component, $event);
            }
        };

        this.onPortMouseDown = function (component, port, $event) {

            if ( !wireDrawHandler.wiring && $event.which === 3 ) {

                contextMenuHandler.onPortContextmenu(component, port, $event);

            } else {
                wireDrawHandler.onPortMouseDown(component, port, $event);
            }

        };

        this.onPortMouseUp = function (component, port, $event) {

            $event.stopPropagation();

        };

        this.onPortClick = function (component, port, $event) {

            $event.stopPropagation();

        };

        this.onComponentMouseDown = function (component, $event) {

            if ($event.which === 3) {

                contextMenuHandler.onComponentContextmenu(component, $event);

            } else {

                componentDragHandler.onComponentMouseDown(component, $event);

            }
        };

        this.onWireMouseUp = function (wire, segment, $event) {

            wireDragHandler.onWireMouseUp(wire, segment, $event);
            $event.stopPropagation();

        };

        this.onWireMouseDown = function (wire, segment, $event) {

            if ($event.which === 3) {

                contextMenuHandler.onWireContextmenu(wire, segment, $event);


            } else {

                wireDragHandler.onWireMouseDown(wire, segment, $event);

            }
        };

        this.onWireCornerMouseUp = function (wire, segment, $event) {

            wireDragHandler.onWireMouseUp(wire, segment, $event);
            $event.stopPropagation();

        };

        this.onWireCornerMouseDown = function (wire, segment, $event) {

            if ($event.which === 3) {

                contextMenuHandler.onWireContextmenu(wire, segment, $event, true);


            } else {

                wireDragHandler.onWireMouseDown(wire, segment, $event, true);

            }
        };

        this.isEditable = function () {

            $scope.diagram.config = $scope.diagram.config || {};

            return $scope.diagram.config.editable === true;
        };

        this.disallowSelection = function () {

            $scope.diagram.config = $scope.diagram.config || {};

            return $scope.diagram.config.disallowSelection === true;
        };

        this.registerComponentElement = function (id, el) {

            componentElements = componentElements || {};

            componentElements[id] = el;

        };

        this.unregisterComponentElement = function (id) {

            componentElements = componentElements || {};

            delete componentElements[id];

        };

        operationsManager.registerOperation({
            id: 'rotateComponents',
            operationClass: function() {

                this.init = function(component) {

                    this.component = component;
                };

                this.set = function(angle) {
                    this.angle = angle;
                };

                this.commit = function() {

                    var componentsToRotate,
                        component,
                        angle,
                        affectedWires,
                        message;

                    componentsToRotate = [];

                    component = this.component;
                    angle = this.angle;

                    componentsToRotate.push( this.component );

                    if ( $scope.diagram.state.selectedComponentIds.indexOf( this.component.id ) > -1 ) {

                        angular.forEach( $scope.diagram.state.selectedComponentIds, function ( selectedComponentId ) {

                            var selectedComponent;

                            if ( component.id !== selectedComponentId ) {

                                selectedComponent = $scope.diagram.componentsById   [ selectedComponentId ];

                                componentsToRotate.push( selectedComponent );

                            }

                        } );
                    }

                    affectedWires = $scope.diagram.getWiresForComponents(
                        componentsToRotate
                    );

                    angular.forEach(componentsToRotate, function(component) {
                        component.rotate(angle);
                    });


                    angular.forEach( affectedWires, function ( wire ) {
                        wiringService.adjustWireEndSegments( wire );
                    } );

                    if (componentsToRotate.length > 1) {
                        message = 'Rotating selection by ' + angle + 'deg';
                    } else {
                        message = 'Rotating ' + component.label + ' by ' + angle + 'deg';
                    }

                    $scope.$emit('componentsRotationChange', {
                        diagramId: $scope.diagram.id,
                        components: componentsToRotate,
                        message: message
                    });

                    //$scope.$emit('wiresChange', {
                    //    diagramId: $scope.diagram.id,
                    //    wires: affectedWires
                    //});

                };
            }

        });

        $rootScope.snapToGrid = true;

    })
    .directive('svgDiagram', [
        '$rootScope',
        '$log',
        'diagramService',
        'gridService',
        '$timeout',
        function ($rootScope, $log, diagramService, gridService, $timeout) {

            return {
                controller: 'SVGDiagramController',
                require: '^diagramContainer',
                restrict: 'E',
                scope: false,
                replace: true,
                templateUrl: '/mmsApp/templates/svgDiagram.html',
                link: function (scope, element, attributes, diagramContainerController) {

                    var id,
                        $element,
                        killContextMenu;

                    $element = $(element);

                    killContextMenu = function($event) {

                        $log.debug('killing default contextmenu');

                        $event.stopPropagation();

                        return false;

                    };

                    //scope.$watch(function(){
                    //    return $element.attr('class');
                    //}, function(cssClass){
                    //   console.log(cssClass);
                    //});

                    scope.$watch('diagram', function(newDiagramValue) {

                        if (newDiagramValue) {

                            scope.diagram = scope.diagram || {};
                            scope.$element = $element;

                            $element.outerWidth(scope.diagram.config.width);
                            $element.outerHeight(scope.diagram.config.width);

                            scope.id = id = newDiagramValue.id;

                            diagramContainerController.setInitialized(false);
                            $rootScope.initializing = true;

                            $rootScope.$on('GridInitialized', function (event, data) {

                                if (data === id) {
                                    diagramContainerController.setInitialized(true);
                                }

                                $rootScope.initializing = false;

                            });

                            scope.visibleObjects = gridService.createGrid(id,
                                scope.diagram
                            );


                            scope.$watch(
                                function () {
                                    return diagramContainerController.getVisibleArea();
                                }, function (visibleArea) {
                                    scope.elementOffset = scope.$element.offset();
                                    gridService.setVisibleArea(id, visibleArea);
                                });


                            scope.$emit('DiagramInitialized');
                        }

                    });

                    //scope.$watch('visibleObjects.components', function(val) {
                    //    console.log('visible objects', val);
                    //});

                    $element.bind('contextmenu', killContextMenu);

                    $element.keyup(function(e){
                        $timeout(function() {
                            scope.$emit('keyupOnDiagram', e);
                        });

                    });

                }

            };
        }
    ]);

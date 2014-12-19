/*globals angular, $*/

'use strict';

// Move this to GME eventually

require( '../componentWire/componentWire.js' );

angular.module( 'mms.designVisualization.svgDiagram', [
    'mms.designVisualization.gridService',
    'mms.designVisualization.componentWire'
] )
    .controller( 'SVGDiagramController', function (
        $scope, $log, diagramService, wiringService, gridService, $window
    ) {

        var

            ComponentSelectionHandler = require('./classes/ComponentSelectionHandler'),
            componentSelectionHandler,

            ComponentDragHandler = require('./classes/ComponentDragHandler'),
            componentDragHandler,

            startWire,
            finishWire,
            cancelWire,

            Wire = require( '../../services/diagramService/classes/Wire.js' ),

            addCornerToNewWireLine,

            componentElements,

            $$window;

        $$window = $($window);

        componentDragHandler = new ComponentDragHandler(
            $scope,
            diagramService,
            wiringService,
            $log,
            $scope.elementOffset
        );

        componentSelectionHandler = new ComponentSelectionHandler(
            $scope,
            diagramService,
            gridService,
            $log,
            $scope.elementOffset
        );

        startWire = function (component, port) {

            $scope.wireStart = {
                component: component,
                port: port
            };

            $log.debug( 'Starting wire', $scope.wireStart );

        };

        addCornerToNewWireLine = function () {

            var lastSegment;

            $scope.newWireLine.lockedSegments = $scope.newWireLine.segments;

            lastSegment = $scope.newWireLine.lockedSegments[ $scope.newWireLine.lockedSegments.length - 1 ];

            $scope.newWireLine.activeSegmentStartPosition = {
                x: lastSegment.x2,
                y: lastSegment.y2
            };

        };

        finishWire = function ( component, port ) {

            var wire = new Wire( {
                id: 'new-wire-' + Math.round( Math.random() * 10000 ),
                end1: {
                    component: $scope.wireStart.component,
                    port: $scope.wireStart.port
                },
                end2: {
                    component: component,
                    port: port
                }
            } );

            wire.segments = angular.copy(
                $scope.newWireLine.lockedSegments.concat(
                    wiringService.getSegmentsBetweenPositions( {
                            end1: $scope.newWireLine.activeSegmentStartPosition,
                            end2: port.getGridPosition()
                        },
                        'ElbowRouter'
                    )
                ) );

            console.log( wire.segments );


            diagramService.addWire( wire );

            $scope.diagram.wires[ wire.id ] = wire;

            gridService.invalidateVisibleDiagramComponents( $scope.id );

            $log.debug( 'Finish wire', wire );

            $scope.wireStart = null;
            $scope.newWireLine = null;

        };

        cancelWire = function () {
            $scope.newWireLine = null;
            $scope.wireStart = null;
        };


        $scope.onMouseUp = function ($event) {

            componentDragHandler.onMouseUp($event);

            if ( $scope.wireStart ) {

                $event.stopPropagation();

                addCornerToNewWireLine();

            } else {
                $scope.diagram.state.selectedComponentIds = [];
            }

        };


        $scope.onClick = function ( /*$event */) {
        };

        $scope.onMouseMove = function ( $event ) {


            // Dragging

            componentDragHandler.onMouseMove($event);

            // Wire drawing

            if ( $scope.wireStart ) {


                $scope.newWireLine = $scope.newWireLine || {};
                $scope.newWireLine.lockedSegments = $scope.newWireLine.lockedSegments || [];
                $scope.newWireLine.activeSegmentStartPosition =
                    $scope.newWireLine.activeSegmentStartPosition || $scope.wireStart.port.getGridPosition();

                $scope.newWireLine.segments = $scope.newWireLine.lockedSegments.concat(
                    wiringService.getSegmentsBetweenPositions( {
                            end1: $scope.newWireLine.activeSegmentStartPosition,
                            end2: {
                                x: $event.pageX - $scope.elementOffset.left - 3,
                                y: $event.pageY - $scope.elementOffset.top - 3
                            }
                        },
                        'ElbowRouter'
                    )
                );

            }

        };

        $scope.getCssClass = function () {

            var result = '';

            if ( $scope.dragTargetsDescriptor ) {
                result += 'dragging';
            }

            return result;

        };

        $scope.contextMenuData = [ {
            id: 'context-menu-common',
            items: [ {
                id: 'newComponent',
                label: 'New component ...',
                iconClass: 'glyphicon glyphicon-plus',
                action: function () {
                    console.log( 'New component clicked' );
                },
                actionData: {}
            } ]
        } ];


        $scope.onMouseLeave = function($event) {
           componentDragHandler.onMouseLeave($event);
        };

        $$window.blur(function($event) {
           componentDragHandler.onWindowBlur($event);
        });


        // Interactions with components

        this.onComponentMouseUp = function ( component, $event ) {

            if (!componentDragHandler.dragging) {

                componentSelectionHandler.onComponentMouseUp(component, $event);
                $event.stopPropagation();

                componentDragHandler.onComponentMouseUp(component, $event);

            } else {
                componentDragHandler.onComponentMouseUp(component, $event);
            }
        };

        this.onPortMouseDown = function ( component, port, $event ) {

            if ( $scope.wireStart ) {

                $event.stopPropagation();

                if ( $scope.wireStart.port !== port ) {
                    finishWire( component, port );
                } else {
                    cancelWire();
                }

            } else {

                startWire(component, port);
                $event.stopPropagation();

            }

        };

        this.onPortMouseUp = function ( component, port, $event ) {

            $event.stopPropagation();

        };

        this.onPortClick = function ( component, port, $event ) {

            $event.stopPropagation();

        };

        this.onComponentMouseDown = function ( component, $event ) {

            var wires;

            if ( $event.which === 3 ) {

                component.rotate( 90 );

                wires = diagramService.getWiresForComponents( component );

                angular.forEach( wires, function ( wire ) {
                    wiringService.adjustWireEndSegments( wire );
                } );


                $event.preventDefault();

            } else {

                componentDragHandler.onComponentMouseDown(component, $event);

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

        this.registerComponentElement = function ( id, el ) {

            componentElements = componentElements || {};

            componentElements[ id ] = el;

        };

        this.unregisterComponentElement = function ( id ) {

            componentElements = componentElements || {};

            delete componentElements[ id ];

        };

    } )
    .directive( 'svgDiagram', [
        '$log',
        'diagramService',
        'gridService',
        function ( $log, diagramService, gridService ) {

            return {
                controller: 'SVGDiagramController',
                require: '^diagramContainer',
                restrict: 'E',
                scope: false,
                replace: true,
                templateUrl: '/mmsApp/templates/svgDiagram.html',
                link: function ( scope, element, attributes, diagramContainerController ) {

                    var id;

                    id = diagramContainerController.getId();

                    scope.diagram = scope.diagram || {};
                    scope.$element = element;

                    scope.id = id;

                    scope.visibleObjects = gridService.createGrid( id, {
                            width: 10000,
                            height: 1000
                        },
                        scope.diagram
                    );

                    scope.$watch(
                        function () {
                            return diagramContainerController.getVisibleArea();
                        }, function ( visibleArea ) {
                            scope.elementOffset = scope.$element.offset();
                            gridService.setVisibleArea( id, visibleArea );
                        } );

                }

            };
        }
    ] );

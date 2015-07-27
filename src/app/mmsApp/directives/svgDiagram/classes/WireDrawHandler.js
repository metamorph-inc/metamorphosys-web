/*globals angular, ga*/

'use strict';

module.exports = function($scope, $rootScope, diagramService, wiringService, gridService, $timeout, $log) {

    var self = this,

        Wire = require('../../../services/diagramService/classes/Wire.js'),

        wireStart,

        startWire,
        addCornerToNewWireLine,
        finishWire,
        cancelWire,

        onDiagramMouseUp,
        onDiagramMouseMove,
        onDiagramMouseLeave,
        onWindowBlur,
        onPortMouseDown,

        getOffsetToMouse,
        scrollWhenAlongTheEdge,
        latestMouseEvent,
        scrollWhenAlongTheEdgeInterval;


    getOffsetToMouse = function ($event) {

        var offset;

        offset = {
            x: $event.pageX - $scope.elementOffset.left,
            y: $event.pageY - $scope.elementOffset.top
        };

        return offset;

    };


    scrollWhenAlongTheEdge = function() {

        var dx = 0,
            dy = 0,
            TOLERANCE = 40,
            SCROLL_AMOUNT = 75,
            offset,
            didScroll,
            latestOffset;

        if (latestMouseEvent) {

            latestOffset = getOffsetToMouse(latestMouseEvent);

            if (latestOffset.x - $scope.visibleArea.left <= TOLERANCE) {
                dx = -SCROLL_AMOUNT;
                latestOffset.x -= SCROLL_AMOUNT;
            }

            if ($scope.visibleArea.right - latestOffset.x <= TOLERANCE) {
                dx = SCROLL_AMOUNT;
                latestOffset.x += SCROLL_AMOUNT;
            }

            if (latestOffset.y - $scope.visibleArea.top <= TOLERANCE) {
                dy = -SCROLL_AMOUNT;
                latestOffset.y -= SCROLL_AMOUNT;
            }

            if ($scope.visibleArea.bottom - latestOffset.y <= TOLERANCE) {
                dy = SCROLL_AMOUNT;
                latestOffset.y += SCROLL_AMOUNT;
            }

            if (dx !== 0 || dy !== 0) {

                didScroll = $scope.diagramContainerController.scrollSome(
                    $scope.visibleArea.left + dx,
                    $scope.visibleArea.top + dy
                );

                if (didScroll) {
                    onDiagramMouseMove(latestMouseEvent);
                }

            }
        }

        if (self.wiring) {
            scrollWhenAlongTheEdgeInterval = setTimeout(scrollWhenAlongTheEdge, 125);
        }

    };


    startWire = function(component, port) {

        wireStart = {
            component: component,
            port: port
        };

        $log.debug('Starting wire', wireStart);

        self.wiring = true;

        scrollWhenAlongTheEdge();

    };

    addCornerToNewWireLine = function() {

        var lastSegment;

        $scope.newWireLine.lockedSegments = $scope.newWireLine.segments;

        lastSegment = $scope.newWireLine.lockedSegments[$scope.newWireLine.lockedSegments.length - 1];

        $scope.newWireLine.activeSegmentStartPosition = {
            x: lastSegment.x2,
            y: lastSegment.y2
        };

    };

    finishWire = function(component, port) {

        var wire = new Wire(
            'new-wire-' + Date.now(), {
                component: wireStart.component,
                port: wireStart.port
            }, {
                component: component,
                port: port

            }
        );

        if ($scope.selectedRouter.id !== 'autoRouter') {
            var startPortPosition = wireStart.port.getGridPosition(),
                startPortLeadInPosition = wireStart.port.getGridPosition(true),
                startPortWireAngle = wireStart.port.getGridWireAngle(),
                endPortPosition = port.getGridPosition(),
                endPortLeadInPosition = port.getGridPosition(true),
                endPortWireAngle = port.getGridWireAngle(),
                end2 = endPortLeadInPosition;

            if ( angular.equals($scope.newWireLine.activeSegmentStartPosition, startPortLeadInPosition) ) {
                if ( [0, 180, 360].indexOf(startPortWireAngle) !== -1 && [0, 180, 360].indexOf(endPortWireAngle) !== -1 ||
                     [90, 270].indexOf(startPortWireAngle) !== -1 && [90, 270].indexOf(endPortWireAngle) !== -1 ) {
                    
                    var maxPortPosition,
                        maxPortLeadIn,
                        minPortPosition,
                        minPortLeadIn,
                        startIsMin,
                        randomOffset;

                    if ( startPortWireAngle === 0 || startPortWireAngle === 180 || startPortWireAngle === 360 ) {
                        
                        startIsMin = startPortPosition.x < endPortPosition.x;
                        maxPortPosition = startIsMin ? endPortPosition.x : startPortPosition.x;
                        maxPortLeadIn = startIsMin ? port.portSymbol.wireLeadIn : wireStart.port.portSymbol.wireLeadIn;
                        minPortPosition = startIsMin ? startPortPosition.x : endPortPosition.x;
                        minPortLeadIn = startIsMin ? wireStart.port.portSymbol.wireLeadIn : port.portSymbol.wireLeadIn;

                        if ( minPortPosition + maxPortLeadIn < maxPortPosition - maxPortLeadIn ) {
                            end2 = endPortLeadInPosition;
                        }
                        else if ( (minPortPosition + minPortLeadIn) < maxPortPosition ) {
                            end2 = { x: (minPortPosition + minPortLeadIn), y: endPortPosition.y };
                        } 
                        else {
                            randomOffset = Math.floor(Math.random() * 5 - 5);
                            end2 = { x: (minPortPosition + maxPortPosition) / 2 + randomOffset, y: endPortPosition.y };
                        }
                    }
                    else {

                        startIsMin = startPortPosition.y < endPortPosition.y;
                        maxPortPosition = startIsMin ? endPortPosition.y : startPortPosition.y;
                        maxPortLeadIn = startIsMin ? port.portSymbol.wireLeadIn : wireStart.port.portSymbol.wireLeadIn;
                        minPortPosition = startIsMin ? startPortPosition.y : endPortPosition.y;
                        minPortLeadIn = startIsMin ? wireStart.port.portSymbol.wireLeadIn : port.portSymbol.wireLeadIn;

                        if ( minPortPosition + maxPortLeadIn < maxPortPosition - maxPortLeadIn ) {
                            end2 = endPortLeadInPosition;
                        }
                        else if ( (minPortPosition + minPortLeadIn) < maxPortPosition ) {
                            end2 = { x: endPortPosition.x, y: (minPortPosition + minPortLeadIn) };
                        }
                        else {
                            randomOffset = Math.floor(Math.random() * 5 - 5);
                            end2 = { x: endPortPosition.x, y: (maxPortPosition + minPortPosition) / 2 + randomOffset };
                        }

                    }
                }
            }



            wire.makeSegmentsFromParameters(
                $scope.newWireLine.lockedSegments.concat(
                    wiringService.getSegmentsBetweenPositions({
                            end1: $scope.newWireLine.activeSegmentStartPosition,
                            end2: end2
                        },
                        $scope.selectedRouter.type,
                        $scope.selectedRouter.params,
                        true
                    )
                )
            );

            wire.appendSegmentFromParameters(
                wiringService.getSegmentsBetweenPositions({
                        end1: end2,
                        end2: port.getGridPosition()
                    },
                    $scope.selectedRouter.type,
                    $scope.selectedRouter.params,
                    false
                )[0]
            );
        }

        $rootScope.$emit('wireCreationMustBeDone', wire);

        $log.debug('Finish wire', wire);

        ga('send', 'event', 'wire', 'newWire', {
            end1: wireStart.component.id,
            end2: component.id
        });

        wireStart = null;
        $scope.newWireLine = null;

        self.wiring = false;
        $scope.ctrl.unFocusPorts();

    };

    cancelWire = function() {
        $scope.newWireLine = null;
        wireStart = null;
        self.wiring = false;

        $scope.ctrl.unFocusPorts();

        ga('send', 'event', 'wire', 'cancelNewWire');

    };

    onDiagramMouseMove = function($event) {

        var snappedPosition,
            okToExtend = true,
            wireAngle,
            leftOfRightPort,
            rightOfLeftPort,
            northOfSouthPort,
            southOfNorthPort;

        latestMouseEvent = $event;

        if (wireStart && $scope.selectedRouter.id !== 'autoRouter') {

            $scope.newWireLine = $scope.newWireLine || {};
            $scope.newWireLine.lockedSegments = $scope.newWireLine.lockedSegments || [];
            
            if (!$scope.newWireLine.activeSegmentStartPosition) {
                $scope.newWireLine.wireStartPosition = wireStart.port.getGridPosition(true);

                $scope.newWireLine.lockedSegments.push(
                    wiringService.getSegmentsBetweenPositions({
                            end1: wireStart.port.getGridPosition(),
                            end2: $scope.newWireLine.wireStartPosition
                        },
                        $scope.selectedRouter.type,
                        $scope.selectedRouter.params,
                        true
                    )[0]
                );                
                $scope.newWireLine.activeSegmentStartPosition = $scope.newWireLine.wireStartPosition;
            }

            snappedPosition = gridService.getSnappedPosition({
                x: $event.pageX - $scope.elementOffset.left - 3,
                y: $event.pageY - $scope.elementOffset.top - 3
            });

            if ( angular.equals($scope.newWireLine.activeSegmentStartPosition, $scope.newWireLine.wireStartPosition) ) {
                
                wireAngle = wireStart.port.getGridWireAngle();
                leftOfRightPort = ( [0, 360].indexOf(wireAngle) !== -1 && 
                                    snappedPosition.x < $scope.newWireLine.wireStartPosition.x );
                rightOfLeftPort = ( wireAngle === 180 && snappedPosition.x > $scope.newWireLine.wireStartPosition.x );
                northOfSouthPort = ( wireAngle === 90 && snappedPosition.y < $scope.newWireLine.wireStartPosition.y );
                southOfNorthPort = ( wireAngle === 270 && snappedPosition.y > $scope.newWireLine.wireStartPosition.y );

                okToExtend = [leftOfRightPort, rightOfLeftPort, 
                              northOfSouthPort, southOfNorthPort].every(function(e) { return !e; });
                
            }

            if ( okToExtend ) {
                $scope.newWireLine.segments = $scope.newWireLine.lockedSegments.concat(
                    wiringService.getSegmentsBetweenPositions({
                            end1: $scope.newWireLine.activeSegmentStartPosition,
                            end2: snappedPosition
                        },
                        $scope.selectedRouter.type,
                        $scope.selectedRouter.params,
                        true
                    )
                );
            }

        }

    };

    onDiagramMouseUp = function() {

        if (wireStart) {
            addCornerToNewWireLine();
        }

    };

    onPortMouseDown = function(component, port, $event) {

        if (wireStart) {

            $event.stopPropagation();

            if (wireStart.port !== port) {
                finishWire(component, port);

                if ($scope.selectedRouter.id === 'autoRouter') {
                    $timeout(function() {
                        wiringService.routeDiagram($scope.diagram, $scope.selectedRouter.type);
                    }, 50);
                }
            } else {
                cancelWire();
            }

        } else {

            startWire(component, port);
            $event.stopPropagation();

        }

    };

    onDiagramMouseLeave = function( /*$event*/ ) {
        if (self.wiring) {
            cancelWire();
        }
    };

    onWindowBlur = function( /*$event*/ ) {
        if (self.wiring) {
            cancelWire();
        }
    };

    $scope.$on('keyupOnDiagram', function($event, e) {

        //console.log(e.keyCode);

        if (e.keyCode === 16) { // Esc
            cancelWire();
        }

        if (e.keyCode === 27) { // Esc
            cancelWire();
        }

    });

    this.onDiagramMouseUp = onDiagramMouseUp;
    this.onDiagramMouseMove = onDiagramMouseMove;
    this.onDiagramMouseLeave = onDiagramMouseLeave;
    this.onWindowBlur = onWindowBlur;
    this.onPortMouseDown = onPortMouseDown;

    return this;

};

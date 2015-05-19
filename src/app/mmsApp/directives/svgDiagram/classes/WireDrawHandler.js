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

        wire.makeSegmentsFromParameters(
            $scope.newWireLine.lockedSegments.concat(
                wiringService.getSegmentsBetweenPositions({
                        end1: $scope.newWireLine.activeSegmentStartPosition,
                        end2: port.getGridPosition()
                    },
                    $scope.selectedRouter.type,
                    $scope.selectedRouter.params,
                    true
                )
            )
        );

        $rootScope.$emit('wireCreationMustBeDone', wire);

        $log.debug('Finish wire', wire);

        ga('send', 'event', 'wire', 'newWire', {
            end1: wireStart.component.id,
            end2: component.id
        });

        wireStart = null;
        $scope.newWireLine = null;

        self.wiring = false;

    };

    cancelWire = function() {
        $scope.newWireLine = null;
        wireStart = null;
        self.wiring = false;

        ga('send', 'event', 'wire', 'cancelNewWire');

    };

    onDiagramMouseMove = function($event) {

        var snappedPosition;

        latestMouseEvent = $event;

        if (wireStart) {


            $scope.newWireLine = $scope.newWireLine || {};
            $scope.newWireLine.lockedSegments = $scope.newWireLine.lockedSegments || [];
            $scope.newWireLine.activeSegmentStartPosition =
                $scope.newWireLine.activeSegmentStartPosition || wireStart.port.getGridPosition();

            snappedPosition = gridService.getSnappedPosition({
                x: $event.pageX - $scope.elementOffset.left - 3,
                y: $event.pageY - $scope.elementOffset.top - 3
            });


            $scope.newWireLine.segments = $scope.newWireLine.lockedSegments.concat(
                wiringService.getSegmentsBetweenPositions({
                        end1: $scope.newWireLine.activeSegmentStartPosition,
                        end2: snappedPosition
                    },
                    $scope.selectedRouter.type,
                    $scope.selectedRouter.params
                )
            );

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

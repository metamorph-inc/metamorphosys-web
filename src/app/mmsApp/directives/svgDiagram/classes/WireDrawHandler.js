/*globals angular, ga*/

'use strict';

module.exports = function($scope, $rootScope, diagramService, wiringService, gridService, $timeout, $log) {

    var self = this,

        Wire = require( '../../../services/diagramService/classes/Wire.js' ),

        wireStart,

        startWire,
        addCornerToNewWireLine,
        finishWire,
        cancelWire,

        onDiagramMouseUp,
        onDiagramMouseMove,
        onDiagramMouseLeave,
        onWindowBlur,
        onPortMouseDown;



    startWire = function (component, port) {

        wireStart = {
            component: component,
            port: port
        };

        $log.debug( 'Starting wire', wireStart );

        self.wiring = true;

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
                component: wireStart.component,
                port: wireStart.port
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
                    $scope.selectedRouter.type,
                    $scope.selectedRouter.params
                )
            ) );

        $rootScope.$emit('wireCreationMustBeDone', wire);

        $log.debug( 'Finish wire', wire );

        ga('send', 'event', 'wire', 'newWire', {
            end1: wireStart.component.id,
            end2: component.id
        });

        wireStart = null;
        $scope.newWireLine = null;

        self.wiring = false;

    };

    cancelWire = function () {
        $scope.newWireLine = null;
        wireStart = null;
        self.wiring = false;

        ga('send', 'event', 'wire', 'cancelNewWire');

    };

    onDiagramMouseMove = function($event) {

        var snappedPosition;

        if ( wireStart ) {


            $scope.newWireLine = $scope.newWireLine || {};
            $scope.newWireLine.lockedSegments = $scope.newWireLine.lockedSegments || [];
            $scope.newWireLine.activeSegmentStartPosition =
                $scope.newWireLine.activeSegmentStartPosition || wireStart.port.getGridPosition();

            snappedPosition = gridService.getSnappedPosition(
                {
                    x: $event.pageX - $scope.elementOffset.left - 3,
                    y: $event.pageY - $scope.elementOffset.top - 3
                }
            );


            $scope.newWireLine.segments = $scope.newWireLine.lockedSegments.concat(
                wiringService.getSegmentsBetweenPositions( {
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

        if ( wireStart ) {
            addCornerToNewWireLine();
        }

    };

    onPortMouseDown = function( component, port, $event ) {

        if ( wireStart ) {

            $event.stopPropagation();

            if ( wireStart.port !== port ) {
                finishWire( component, port );
            } else {
                cancelWire();
            }

        } else {

            startWire(component, port);
            $event.stopPropagation();

        }

    };

    onDiagramMouseLeave = function(/*$event*/) {
        if (self.wiring) {
            cancelWire();
        }
    };

    onWindowBlur = function(/*$event*/) {
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

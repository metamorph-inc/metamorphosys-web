/*globals angular*/

'use strict';

module.exports = function($scope, diagramService, wiringService, $log) {

    var self = this,
        getOffsetToMouse,
        possibbleDragTargetsDescriptor,
        dragTargetsDescriptor,

        onMouseUp,
        onMouseMove,
        onMouseLeave,
        onWindowBlur,
        onComponentMouseUp,
        onComponentMouseDown,

        startDrag,
        finishDrag,
        cancelDrag;


    getOffsetToMouse = function ( $event ) {

        var offset;

        offset = {
            x: $event.pageX - $scope.elementOffset.left,
            y: $event.pageY - $scope.elementOffset.top
        };

        return offset;

    };


    startDrag = function () {

        self.dragging = true;

        dragTargetsDescriptor = possibbleDragTargetsDescriptor;
        possibbleDragTargetsDescriptor = null;

        $log.debug( 'Dragging', dragTargetsDescriptor );

    };

    cancelDrag = function() {

        possibbleDragTargetsDescriptor = null;

        if ( dragTargetsDescriptor ) {

            var offset;

            angular.forEach( dragTargetsDescriptor.targets, function ( target ) {

                target.component.setPosition(
                    target.originalPosition.x,
                    target.originalPosition.y
                );

            } );

            angular.forEach( dragTargetsDescriptor.affectedWires, function ( wire ) {

                wiringService.adjustWireEndSegments( wire );

            } );

            dragTargetsDescriptor = null;

        }

        self.dragging = false;

    };

    finishDrag = function () {

        self.dragging = false;

        dragTargetsDescriptor = null;

        $log.debug( 'Finish dragging' );

    };

    onMouseMove = function($event) {

        if ( possibbleDragTargetsDescriptor ) {
            startDrag();
        }

        if ( dragTargetsDescriptor ) {

            var offset;

            offset = getOffsetToMouse( $event );

            angular.forEach( dragTargetsDescriptor.targets, function ( target ) {

                target.component.setPosition(
                    offset.x + target.deltaToCursor.x,
                    offset.y + target.deltaToCursor.y
                );

            } );

            angular.forEach( dragTargetsDescriptor.affectedWires, function ( wire ) {

                wiringService.adjustWireEndSegments( wire );

            } );

        }

    };

    onMouseUp = function($event) {

        possibbleDragTargetsDescriptor = null;

        if ( dragTargetsDescriptor ) {
            finishDrag();
            $event.stopPropagation();
        }

    };

    onMouseLeave = function(/*$event*/) {

        cancelDrag();

    };

    onWindowBlur = function(/*$event*/) {

        cancelDrag();

    };

    onComponentMouseUp = function(component, $event) {

        possibbleDragTargetsDescriptor = null;

        if ( dragTargetsDescriptor ) {
            finishDrag();
            $event.stopPropagation();
        }

    };

    onComponentMouseDown = function (component, $event) {

        var componentsToDrag,
            getDragDescriptor;

        componentsToDrag = [];

        getDragDescriptor = function ( component ) {

            var offset = getOffsetToMouse( $event );

            return {
                component: component,
                originalPosition: {
                    x: component.x,
                    y: component.y
                },
                deltaToCursor: {
                    x: component.x - offset.x,
                    y: component.y - offset.y
                }
            };

        };

        $scope.diagram.config = $scope.diagram.config || {};

        if ( $scope.diagram.config.editable === true &&
            component.nonSelectable !== true &&
            component.locationLocked !== true ) {

            $event.stopPropagation();

            possibbleDragTargetsDescriptor = {
                targets: [ getDragDescriptor( component ) ]
            };

            componentsToDrag.push( component );

            if ( $scope.diagram.state.selectedComponentIds.indexOf( component.id ) > -1 ) {

                // Drag along other selected components

                angular.forEach( $scope.diagram.state.selectedComponentIds, function ( selectedComponentId ) {

                    var selectedComponent;

                    if ( component.id !== selectedComponentId ) {

                        selectedComponent = $scope.diagram.components[ selectedComponentId ];

                        possibbleDragTargetsDescriptor.targets.push( getDragDescriptor(
                            selectedComponent ) );

                        componentsToDrag.push( selectedComponent );

                    }

                } );
            }

            possibbleDragTargetsDescriptor.affectedWires = diagramService.getWiresForComponents(
                componentsToDrag );

        }

    };

    this.onMouseUp = onMouseUp;
    this.onMouseMove = onMouseMove;
    this.onMouseLeave = onMouseLeave;
    this.onWindowBlur = onWindowBlur;
    this.onComponentMouseUp = onComponentMouseUp;
    this.onComponentMouseDown = onComponentMouseDown;

    return this;

};

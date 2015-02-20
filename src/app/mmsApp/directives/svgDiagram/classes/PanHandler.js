/*globals angular*/

'use strict';

module.exports = function ($scope, $log) {

    var self,
        getOffsetToMouse,

        earlierPosition,

        onDiagramMouseDown,
        onDiagramMouseMove,
        onDiagramMouseUp,

        onDiagramMouseLeave,
        onWindowBlur,

        startDrag,
        finishDrag;

    self = this;

    startDrag = function () {

        self.pannable = false;
        self.panning = true;

        //moveOperation = operationsManager.initNew('MoveComponents', $scope.diagram, possibbleDragTargetsDescriptor);

        $log.debug('Panning');

    };

    finishDrag = function () {

        earlierPosition = null;
        self.pannable = false;

        if (self.panning === true) {

            //moveOperation.finish();
            //moveOperation = null;

            self.panning = false;

            $log.debug('Finish panning');

        }

    };

    getOffsetToMouse = function ($event) {

        var offset;

        offset = {
            x: $event.pageX - $scope.elementOffset.left,
            y: $event.pageY - $scope.elementOffset.top
        };

        return offset;

    };

    onDiagramMouseMove = function ($event) {

        var currentPosition,
            translation;

        if (angular.isObject(earlierPosition)) {

            if (!self.panning) {
                startDrag();
            }

            currentPosition = {
                x: $event.pageX,
                y: $event.pageY
            };

            translation = {
                x: currentPosition.x - earlierPosition.x,
                y: currentPosition.y - earlierPosition.y
            };

            earlierPosition = currentPosition;

            $scope.$emit('contentPan', translation);

        }

    };


    onDiagramMouseDown = function($event) {

        earlierPosition = {
            x: $event.pageX,
            y: $event.pageY
        };

    };

    onDiagramMouseUp = function($event) {

        finishDrag();
        $event.stopPropagation();

    };

    onDiagramMouseLeave = function (/*$event*/) {

        finishDrag();

    };

    onWindowBlur = function (/*$event*/) {

        finishDrag();

    };


    //$scope.$on('keydownOnDiagram', function($event, $originalEvent) {
    //
    //    if ($originalEvent.altKey) {
    //        self.pannable = true;
    //    }
    //
    //});

    $scope.$on('keyupOnDiagram', function() {
        self.pannable = false;
    });

    this.onDiagramMouseDown = onDiagramMouseDown;
    this.onDiagramMouseUp = onDiagramMouseUp;
    this.onDiagramMouseMove = onDiagramMouseMove;
    this.onDiagramMouseLeave = onDiagramMouseLeave;
    this.onWindowBlur = onWindowBlur;
    this.onComponentMouseUp = onDiagramMouseUp;
    this.onPortMouseUp = onDiagramMouseUp;

    return this;

};

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

        self.dragging = true;

        //moveOperation = operationsManager.initNew('MoveComponents', $scope.diagram, possibbleDragTargetsDescriptor);

        $log.debug('Panning');

    };

    finishDrag = function () {

        earlierPosition = null;

        if (self.dragging === true) {

            //moveOperation.finish();
            //moveOperation = null;

            self.dragging = false;

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

            if (!self.dragging) {
                startDrag();
            }

            currentPosition = getOffsetToMouse($event);

            translation = {
                x: currentPosition.x - earlierPosition.x,
                y: currentPosition.y - earlierPosition.y
            };

            earlierPosition = currentPosition;

            $scope.$emit('contentPan', translation);

        }

    };


    onDiagramMouseDown = function($event) {

        earlierPosition = getOffsetToMouse($event);

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


    this.onDiagramMouseDown = onDiagramMouseDown;
    this.onDiagramMouseUp = onDiagramMouseUp;
    this.onDiagramMouseMove = onDiagramMouseMove;
    this.onDiagramMouseLeave = onDiagramMouseLeave;
    this.onWindowBlur = onWindowBlur;

    return this;

};

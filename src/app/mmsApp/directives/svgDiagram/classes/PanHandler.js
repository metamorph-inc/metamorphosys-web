/*globals angular*/

'use strict';

module.exports = function ($scope, $log) {

    var
        getOffsetToMouse,

        dragStartPosition,

        onDiagramMouseDown,
        onDiagramMouseMove,
        onDiagramMouseUp;

    getOffsetToMouse = function ($event) {

        var offset;

        offset = {
            x: $event.pageX - $scope.elementOffset.left,
            y: $event.pageY - $scope.elementOffset.top
        };

        return offset;

    };

    onDiagramMouseMove = function ($event) {

        console.log($event.which);

    };


    onDiagramMouseDown = function($event) {

        dragStartPosition = getOffsetToMouse($event);

    };

    onDiagramMouseUp = function($event) {
        dragStartPosition = null;
    };


    this.onDiagramMouseDown = onDiagramMouseDown;
    this.onDiagramMouseUp = onDiagramMouseUp;
    this.onDiagramMouseMove = onDiagramMouseMove;

    return this;

};

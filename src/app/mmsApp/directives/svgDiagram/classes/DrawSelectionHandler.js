/*globals angular*/

'use strict';

module.exports = function ($scope, $rootScope, diagramService, wiringService, operationsManager, $timeout, gridService, $log) {

    var self = this,
        getOffsetToMouse,

        onDiagramMouseDown,
        onDiagramMouseUp,
        onDiagramMouseMove,

        updateSelectionRect,

        startDraw,
        finishDraw,
        cancel,

        startCorner = null,
        endCorner = null,

        VIEWPORT_PADDING = {
            x: +20,
            y: +20
        };

    this.drawing = false;

    $scope.drawnSelection = null;

    getOffsetToMouse = function ($event) {

        var offset;

        offset = {
            x: $event.pageX - $scope.elementOffset.left,
            y: $event.pageY - $scope.elementOffset.top
        };

        return offset;

    };


    updateSelectionRect = function() {

        var viewport = {};

        if (startCorner && endCorner) {

            $scope.diagram.clearSelection();

            $scope.drawnSelection = {};

            if (startCorner.x <= endCorner.x) {

                $scope.drawnSelection.x = startCorner.x;
                $scope.drawnSelection.width = endCorner.x - startCorner.x;

                viewport.left = startCorner.x;
                viewport.right = endCorner.x;

            } else {

                $scope.drawnSelection.x = endCorner.x;
                $scope.drawnSelection.width = startCorner.x - endCorner.x;

                viewport.left = endCorner.x;
                viewport.right = startCorner.x;

            }

            if (startCorner.y <= endCorner.y) {

                $scope.drawnSelection.y = startCorner.y;
                $scope.drawnSelection.height = endCorner.y - startCorner.y;

                viewport.top = startCorner.y;
                viewport.bottom = endCorner.y;

            } else {

                $scope.drawnSelection.y = endCorner.y;
                $scope.drawnSelection.height = startCorner.y - endCorner.y;

                viewport.top = endCorner.y;
                viewport.bottom = startCorner.y;

            }

            $scope.diagram.selectComponentsInViewport(viewport, VIEWPORT_PADDING, false);
            $scope.diagram.selectWireCornersInViewport(viewport, { x:0, y:0 }, false);

        }

    };

    startDraw = function ($event) {

        var o = getOffsetToMouse($event);

        startCorner = o;
        endCorner = o;

        updateSelectionRect();

        $scope.diagram.clearSelection();

        self.drawing = true;

    };

    cancel = function () {

        if (self.drawing) {
            $scope.diagram.clearSelection();
            self.drawing = false;
            $scope.drawnSelection = null;
        }

    };

    finishDraw = function () {
        if (self.drawing) {
            self.drawing = false;
            $scope.drawnSelection = null;
            $scope.diagram.afterSelectionChange();
        }
    };

    onDiagramMouseMove = function ($event) {

        if (self.drawing) {

            endCorner = getOffsetToMouse($event);
            updateSelectionRect();

        }

    };

    onDiagramMouseDown = function ($event) {

        startDraw($event);
        $event.stopPropagation();

    };

    onDiagramMouseUp = function ($event) {

        finishDraw();

    };

    $scope.$on('keyupOnDiagram', function($event, e) {

        //console.log(e.keyCode);

        if (e.keyCode === 16) { // Esc
            cancel();
        }

        if (e.keyCode === 27) { // Esc
            cancel();
        }

    });


    this.onDiagramMouseDown = onDiagramMouseDown;
    this.onDiagramMouseUp = onDiagramMouseUp;
    this.onDiagramMouseMove = onDiagramMouseMove;

    this.cancel = cancel;

    return this;

};

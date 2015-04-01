'use strict';

angular.module( 'mms.drawingGrid', [] )
    .directive( 'drawingGrid', 
        function () {

            function DrawingGridController() {
            }

            DrawingGridController.prototype.getStyle = function() {

                var result = {};

                if (this.diagram) {
                    
                    result = {
                        width: this.diagram.config.width + 'px',
                        height: this.diagram.config.height + 'px'
                    };

                }

                return result;

            };

            return {
                restrict: 'E',
                controller: DrawingGridController,
                controllerAs: 'ctrl',
                bindToController: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/drawingGrid.html',
                scope: {
                    diagram: '='
                }        
            };
        } );
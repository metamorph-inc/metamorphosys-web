/*globals angular*/

'use strict';

angular.module(
    'mms.designVisualization.port', []
)
    .controller( 'PortController', function () {

        this.getPortTransform = function () {

            var transformString;

            transformString = 'translate(' + this.portInstance.portSymbol.x + ',' + this.portInstance.portSymbol
                .y + ')';

            return transformString;

        };

        this.getLabel = function() {

            var label;

            if (angular.isString(this.portInstance.label)) {
                label = this.portInstance.label;
            } else if (angular.isFunction(this.portInstance.label)){
                label = this.portInstance.label();
            } else {
                label = this.portInstance.portSymbol.label;
            }

            return label;
        };

        this.isPortLabelVisible = function() {

            return this.component.symbol.showPortLabels;

        };

        this.getCssClass = function() {

            var cssClass;

            cssClass = this.portInstance.portSymbol.cssClass;

            return cssClass;

        };

    } )
    .directive(
        'port',

        function () {

            return {
                scope: {
                    portInstance: '=',
                    component: '='
                },
                controller: 'PortController',
                controllerAs: 'self',
                bindToController: true,
                restrict: 'E',
                replace: true,
                templateUrl: '/mmsApp/templates/port.html',
                templateNamespace: 'SVG',
                require: [ 'port', '^svgDiagram', '^diagramContainer' ],
                link: function ( scope, element, attributes, controllers ) {

                    var self,
                        svgDiagramController;

                    self = controllers[ 0 ];
                    svgDiagramController = controllers[ 1 ];

                    self.onPortClick = function ( port, $event ) {
                        svgDiagramController.onPortClick( self.component, port, $event );
                    };

                    self.onPortMouseDown = function ( port, $event ) {
                        svgDiagramController.onPortMouseDown( self.component, port, $event );
                    };

                    self.onPortMouseUp = function ( port, $event ) {
                        svgDiagramController.onPortMouseUp( self.component, port, $event );
                    };

                }
            };
        }
);

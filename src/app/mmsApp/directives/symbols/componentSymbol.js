/*globals angular, $*/

'use strict';

require('../../directives/mmsEvents/mmsEvents.js');
require( '../../services/symbolServices/symbolServices.js' );
require( '../port/port.js' );

require( './resistor/resistor.js' );
require( './jFetP/jFetP.js' );
require( './opAmp/opAmp.js' );
require( './diode/diode.js' );
require( './tvsDiode/tvsDiode.js' );
require( './capacitor/capacitor.js' );
require( './inductor/inductor.js' );
require( './simpleConnector/simpleConnector.js' );

require( './box/box.js' );

var symbolsModule = angular.module(
    'mms.designVisualization.symbols', [
        'mms.designVisualization.symbolServices',

        'mms.designVisualization.port',

        'mms.designVisualization.symbols.resistor',
        'mms.designVisualization.symbols.jFetP',
        'mms.designVisualization.symbols.opAmp',
        'mms.designVisualization.symbols.diode',
        'mms.designVisualization.symbols.tvsDiode',
        'mms.designVisualization.symbols.capacitor',
        'mms.designVisualization.symbols.inductor',
        'mms.designVisualization.symbols.simpleConnector',
        'mms.events',

        'mms.designVisualization.symbols.box'

    ] );

symbolsModule.controller(
    'SymbolController', function ( $scope ) {

        this.getSymbolTransform = function () {

            var transformString;

            //    transformString = 'translate(' + $scope.component.x + ',' + $scope.component.y + ') ';
            //    transformString +=
            //      'rotate(' + $scope.component.rotation + ' ' + $scope.component.symbol.width/2 + ' ' + $scope.component.symbol.height/2  + ') ';
            //    //transformString += 'scale(' + $scope.component.scaleX + ',' + $scope.component.scaleY + ') ';
            //
            //    console.log($scope.component.getTransformationMatrix().join(', '));

            //debugger;

            transformString = 'matrix(' + this.component.getSVGTransformationString() + ')';

            return transformString;
        };

    } );

symbolsModule.directive(
    'componentSymbol',

    function ( $compile ) {

        return {
            scope: {
                component: '=',
                test: '=',
                page: '=',
                instance: '='
            },
            restrict: 'E',
            replace: true,
            controller: 'SymbolController',
            controllerAs: 'self',
            bindToController: true,
            templateUrl: '/mmsApp/templates/componentSymbol.html',
            templateNamespace: 'SVG',
            require: [ 'componentSymbol', '^svgDiagram', '^diagramContainer' ],
            link: function ( scope, element, attributes, controllers ) {

                var self,
                    templateStr,
                    template,

                    diagramContainerController,
                    svgDiagramController,

                    $el,
                    $labelElement,
                    compiledSymbol,
                    symbolDirective;

                self = controllers[ 0 ];
                svgDiagramController = controllers[ 1 ];
                diagramContainerController = controllers[ 2 ];

                self.portsVisible = function () {
                    return true;
                };

                self.detailsVisible = function () {
                    return diagramContainerController.getZoomLevel() > 1;
                };

                self.getCssClass = function () {

                    var result;

                    result = self.component.symbol.cssClass ? self.component.symbol.cssClass : self.component.symbol.type;

                    if ( diagramContainerController.isComponentSelected( self.component ) ) {
                        result += ' selected';
                    }

                    return result;

                };

                // Interactions

                self.onMouseUp = function ( $event ) {
                    console.log('in mousedup');
                    svgDiagramController.onComponentMouseUp( self.component, $event );
                };

                self.onMouseDown = function ( $event ) {
                    console.log('in mousedown');
                    svgDiagramController.onComponentMouseDown( self.component, $event );
                    $event.stopPropagation();
                };

                symbolDirective = self.component.symbol.symbolDirective || 'generic-svg';

                compiledSymbol = diagramContainerController.getCompiledDirective( symbolDirective );

                if ( !angular.isFunction( compiledSymbol ) ) {

                    templateStr = '<' + symbolDirective + '>' +
                        '</' + symbolDirective + '>';

                    template = angular.element( templateStr );

                    compiledSymbol = $compile( template );

                    diagramContainerController.setCompiledDirective( symbolDirective, compiledSymbol );

                }

                $el = $( element );

                compiledSymbol( self, function ( clonedElement ) {
                    $el.find( '.symbol-placeholder' )
                        .replaceWith( clonedElement );
                } );

                svgDiagramController.registerComponentElement( self.component.id, $el );

                // TODO: This will need to get cleaned up when solution is proposed

                scope.$on( '$destroy', function () {
                    svgDiagramController.unregisterComponentElement( self.component.id );
                } );

                // Label ellipsis

                function perfectEllipsis(textSelector, textString, maxWidth) {
                    var textObject = textSelector[0];

                    if (!textString) {
                        textObject.textContent = '';
                        return;
                    }

                    textObject.textContent = textString;
                    maxWidth = maxWidth || 120;
                    var strLength = textString.length;
                    var width = textObject.getSubStringLength(0, strLength);

                    // ellipsis is needed
                    if (width >= maxWidth) {
                        textObject.textContent = '...' + textString;
                        strLength += 3;

                        // guess truncate position
                        var i = Math.floor(strLength * maxWidth / width) + 1;

                        // refine by expansion if necessary
                        while (++i < strLength && textObject.getSubStringLength(0, i) < maxWidth){}

                        // refine by reduction if necessary
                        while (--i > 3 && textObject.getSubStringLength(0, i) > maxWidth){}

                        textObject.textContent = textString.substring(0, i-3) + '...';
                    }
                }

                $labelElement = element.find('.component-label');

                if (self.component.symbol.limitLabelWidthTo && !isNaN(self.component.symbol.limitLabelWidthTo)) {

                    scope.$watch(function() {
                        return self.component.label;
                    }, function(labelText) {

                        if (labelText) {
                            perfectEllipsis($labelElement, labelText, self.component.symbol.limitLabelWidthTo);
                        }

                    });
                }
            }
        };
    }
);

symbolsModule.directive(
    'genericSvg',

    function () {

        return {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/mmsApp/templates/genericSvg.html',
            templateNamespace: 'SVG'
        };
    }
);

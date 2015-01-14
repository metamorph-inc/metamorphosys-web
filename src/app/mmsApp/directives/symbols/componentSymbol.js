/*globals angular, $*/

'use strict';

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

        'mms.designVisualization.symbols.box'

    ] );

symbolsModule.controller(
    'SymbolController', function ( $scope ) {

        $scope.getSymbolTransform = function () {

            var transformString;

            //    transformString = 'translate(' + $scope.component.x + ',' + $scope.component.y + ') ';
            //    transformString +=
            //      'rotate(' + $scope.component.rotation + ' ' + $scope.component.symbol.width/2 + ' ' + $scope.component.symbol.height/2  + ') ';
            //    //transformString += 'scale(' + $scope.component.scaleX + ',' + $scope.component.scaleY + ') ';
            //
            //    console.log($scope.component.getTransformationMatrix().join(', '));

            transformString = 'matrix(' + $scope.component.getSVGTransformationString() + ')';

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
            templateUrl: '/mmsApp/templates/componentSymbol.html',
            templateNamespace: 'SVG',
            require: [ '^svgDiagram', '^diagramContainer' ],
            link: function ( scope, element, attributes, controllers ) {

                var templateStr,
                    template,

                    diagramContainerController,
                    svgDiagramController,

                    $el,
                    $labelElement,
                    compiledSymbol,
                    symbolDirective;

                svgDiagramController = controllers[ 0 ];
                diagramContainerController = controllers[ 1 ];

                scope.portsVisible = function () {
                    return true;
                };

                scope.detailsVisible = function () {
                    return diagramContainerController.getZoomLevel() > 1;
                };

                scope.getCssClass = function () {

                    var result;

                    result = scope.component.symbol.cssClass ? scope.component.symbol.cssClass : scope.component.symbol.type;

                    if ( diagramContainerController.isComponentSelected( scope.component ) ) {
                        result += ' selected';
                    }

                    return result;

                };

                // Interactions

                scope.onMouseUp = function ( $event ) {
                    svgDiagramController.onComponentMouseUp( scope.component, $event );
                };

                scope.onMouseDown = function ( $event ) {
                    svgDiagramController.onComponentMouseDown( scope.component, $event );
                    $event.stopPropagation();
                };

                symbolDirective = scope.component.symbol.symbolDirective || 'generic-svg';

                compiledSymbol = diagramContainerController.getCompiledDirective( symbolDirective );

                if ( !angular.isFunction( compiledSymbol ) ) {

                    templateStr = '<' + symbolDirective + '>' +
                        '</' + symbolDirective + '>';

                    template = angular.element( templateStr );

                    compiledSymbol = $compile( template );

                    diagramContainerController.setCompiledDirective( symbolDirective, compiledSymbol );

                }

                $el = $( element );

                compiledSymbol( scope, function ( clonedElement ) {
                    $el.find( '.symbol-placeholder' )
                        .replaceWith( clonedElement );
                } );

                svgDiagramController.registerComponentElement( scope.component.id, $el );

                scope.$on( '$destroy', function () {
                    svgDiagramController.unregisterComponentElement( scope.component.id );
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

                if (scope.component.symbol.limitLabelWidthTo && !isNaN(scope.component.symbol.limitLabelWidthTo)) {

                    scope.$watch('component.label', function(labelText) {

                        if (labelText) {
                            perfectEllipsis($labelElement, labelText, scope.component.symbol.limitLabelWidthTo);
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

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
require( './containerBox/containerBox.js' );

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

        'mms.designVisualization.symbols.box',
        'mms.designVisualization.symbols.containerBox'

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

        $scope.getSymbolRectWidth = function () {

            return $scope.component.symbol.width + 20;

        };

        $scope.getSymbolRectHeight = function () {

            return $scope.component.icon ? $scope.component.symbol.height + 40 : $scope.component.symbol.height + 20;

        };

        $scope.getSymbolWidth = function () {

            return $scope.component.symbol.width;

        };

        $scope.getSymbolHeight = function () {

            return $scope.component.icon ? $scope.component.symbol.height + 40 : $scope.component.symbol.height;

        };

    } );

symbolsModule.directive(
    'componentSymbol',

    function ( $compile, $timeout ) {

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

                    justClicked,
                    doubleClickTolerance = 600,

                    $el,
                    $labelElement,
                    compiledSymbol,
                    compiledIcon,
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

                    var result,
                        modAngle,
                        rotatedClass;

                    result = scope.component.symbol.cssClass ? scope.component.symbol.cssClass : scope.component.symbol.type;

                    if ( diagramContainerController.isComponentSelected( scope.component ) ) {
                        result += ' selected';
                    }

                    modAngle = scope.component.rotation % 360;
                    rotatedClass = " rotated-" + modAngle;

                    if (result.indexOf(rotatedClass) === -1) {
                        if (modAngle !== 0) {

                            result += rotatedClass;

                            result = result.replace(" rotated-" + (modAngle + 90), '')
                                           .replace(" rotated-" + (modAngle - 90), '');
                        }
                        else {
                            result = result.replace(" rotated-" + (modAngle + 90), '')
                                           .replace(" rotated-270", '');
                        }
                    }

                    return result;

                };

                // Interactions

                scope.onMouseUp = function ( $event ) {

                    if (!justClicked) {

                        svgDiagramController.onComponentMouseUp(scope.component, $event);

                        justClicked = true;

                        $timeout(function () {
                            justClicked = false;
                        }, doubleClickTolerance);

                    } else {
                        $event.stopPropagation();
                    }
                };

                scope.onMouseDown = function ( $event ) {

                    if (!justClicked) {

                        svgDiagramController.onComponentMouseDown(scope.component, $event);

                    }

                    $event.stopPropagation();

                };

                scope.onDoubleClick = function ( $event ) {
                    svgDiagramController.onComponentDoubleClick( scope.component, $event );
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

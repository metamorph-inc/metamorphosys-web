/*globals angular*/

'use strict';

var symbolServicesModule = angular.module(
    'mms.designVisualization.symbolServices', [] );

symbolServicesModule.provider( 'symbolManager', function SymbolManagerProvider() {
    var provider = this,
        availableSymbols = {},

        portCreator,
        spreadPortsAlongSide;


    spreadPortsAlongSide = function (somePorts, side, width, height, parameters) {

        var offset,
            increment,

            i,
            aPort;

        offset = parameters.portWireLength + parameters.portSpacing;

        if (side === 'right' || side === 'left') {
            offset += parameters.topPortPadding;
        }

        if (parameters.justifyPorts) {

            if (side === 'top' || side === 'bottom') {
                increment = (width - 2 * parameters.portSpacing) / ( somePorts.length + 1 );
            } else {
                increment =
                    ( height -
                        2 * parameters.portSpacing -
                        parameters.topPortPadding - parameters.bottomPortPadding) / ( somePorts.length + 1 );
            }

        } else {
            increment = parameters.portSpacing;
        }

        for (i=0; i < somePorts.length; i++) {

            aPort = somePorts[i];

            switch (side) {

                case 'top':
                    aPort.x = offset;
                    aPort.y = 0;
                    aPort.wireAngle = -90;

                    offset += increment;

                    break;

                case 'right':
                    aPort.x = width;
                    aPort.y = offset;
                    aPort.wireAngle = 0;

                    offset += increment;

                    break;

                case 'bottom':
                    aPort.x = offset;
                    aPort.y = height;
                    aPort.wireAngle = 90;

                    offset += increment;

                    break;

                case 'left':
                    aPort.x = 0;
                    aPort.y = offset;
                    aPort.wireAngle = 180;

                    offset += increment;

                    break;

            }

        }

    };


    portCreator = function(portDescriptors, parameters) {

        var width,
            height,
            ports,

            top,
            right,
            bottom,
            left;

        portDescriptors = portDescriptors || {};
        ports = [];

        top = portDescriptors.top || [];
        right = portDescriptors.right || [];
        bottom = portDescriptors.bottom || [];
        left = portDescriptors.left || [];

        width = Math.max(
            parameters.portSpacing * ( top.length + 3 ),
            parameters.portSpacing * ( bottom.length + 3),
            parameters.minWidth
        );

        height = Math.max(
            parameters.portSpacing * ( left.length + 3) + parameters.topPortPadding + parameters.bottomPortPadding,
            parameters.portSpacing * ( right.length + 3) + parameters.topPortPadding + parameters.bottomPortPadding,
            parameters.minHeight
        );

        spreadPortsAlongSide(top, 'top', width, height, parameters);
        spreadPortsAlongSide(right, 'right', width, height, parameters);
        spreadPortsAlongSide(bottom, 'bottom', width, height, parameters);
        spreadPortsAlongSide(left, 'left', width, height, parameters);

        ports = ports.concat(top)
            .concat(right)
            .concat(bottom)
            .concat(left);

        return {
            ports: ports,
            width: width,
            height: height
        };

    };


    this.registerSymbol = function ( symbolDescriptor ) {

        if ( angular.isObject( symbolDescriptor ) &&
            angular.isString( symbolDescriptor.type ) ) {
            availableSymbols[ symbolDescriptor.type ] = symbolDescriptor;
        }
    };

    this.makeBoxSymbol = function( type, descriptor, portDescriptors, givenParameters ) {

        var symbol,
            parameters,
            portsAndSizes,
            cssClass;


        parameters = angular.extend({
            portWireLength: 20,
            portSpacing: 20,
            topPortPadding: 20,
            bottomPortPadding: 0,
            minWidth: 140,
            minHeight: 80,
            justifyPorts: false
        }, givenParameters || {});

        if (angular.isObject(descriptor) && type) {

            if (!availableSymbols[type]) {

                portsAndSizes = portCreator(portDescriptors, parameters);

                cssClass = 'box';

                if (parameters.cssClass) {
                    cssClass += ' parameters.cssClass';
                }

                symbol = angular.extend(descriptor,
                    {
                        type: type,
                        cssClass: cssClass,
                        symbolDirective: 'box',
                        svgDecoration: null,
                        labelPosition: {
                            x: portsAndSizes.width/2,
                            y: parameters.portWireLength + 24
                        },
                        portWireLength: parameters.portWireLength,
                        width: portsAndSizes.width,
                        height: portsAndSizes.height,
                        ports: portsAndSizes.ports,
                        boxHeight: portsAndSizes.height - 2 * parameters.portWireLength,
                        boxWidth: portsAndSizes.width - 2 * parameters.portWireLength
                    });

                provider.registerSymbol(symbol);

            } else {
                symbol = availableSymbols[type];
            }

        }

        return symbol;
    };


    this.$get = [

        function () {

            var SymbolManager;

            SymbolManager = function () {

                this.registerSymbol = provider.registerSymbol;

                this.makeBoxSymbol = provider.makeBoxSymbol;

                this.getAvailableSymbols = function () {
                    return availableSymbols;
                };

                this.getSymbol = function ( symbolType ) {
                    return availableSymbols[ symbolType ];
                };


            };

            return new SymbolManager();

        }
    ];
} );
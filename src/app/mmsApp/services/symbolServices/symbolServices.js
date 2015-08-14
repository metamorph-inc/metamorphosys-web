/*globals angular*/

'use strict';

var symbolServicesModule = angular.module(
    'mms.designVisualization.symbolServices', [] ),

    symbolTypesSearchIndex = require('./classes/SymbolTypesSearchIndex')();



symbolServicesModule.provider( 'symbolManager', function SymbolManagerProvider() {
    var provider = this,
        availableSymbols = {},

        portCreator,
        spreadPortsAlongSide,

        portHorizontalTranslation;


    spreadPortsAlongSide = function (somePorts, side, width, height, parameters) {

        var offset,
            increment,

            i,
            aPort,

            numberOfPorts,
            wireLeadIn;

        numberOfPorts = somePorts.length;
        
        offset = parameters.portSpacing;

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

        portHorizontalTranslation = parameters.portWireLength + parameters.portLabelHorizontalPadding;

        wireLeadIn = 10;

        for (i=0; i < numberOfPorts; i++) {

            aPort = somePorts[i];

            if (i < numberOfPorts) {
                wireLeadIn += parameters.portWireLeadInIncrement;
            } else {
                wireLeadIn -= parameters.portWireLeadInIncrement;
            }

            aPort.side = side;

            switch (side) {

                case 'top':
                    aPort.x = offset;
                    aPort.y = 0;
                    aPort.wireAngle = -90;
                    aPort.cssClass = 'top';
                    aPort.labelPosition = {
                        x: 0,
                        y: 0
                    };

                    offset += increment;

                    break;

                case 'right':
                    aPort.x = width + parameters.portWireLength * (parameters.hasLeftPort + parameters.hasRightPort);
                    aPort.y = offset;
                    aPort.wireAngle = 0;
                    aPort.cssClass = 'right';
                    aPort.labelPosition = {
                        x: -portHorizontalTranslation,
                        y: parameters.portLabelVerticalPadding
                    };


                    offset += increment;

                    break;

                case 'bottom':
                    aPort.x = offset;
                    aPort.y = height + parameters.portWireLength * (parameters.hasTopPort + parameters.hasBottomPort);
                    aPort.wireAngle = 90;
                    aPort.cssClass = 'bottom';
                    aPort.labelPosition = {
                        x: 0,
                        y: 0
                    };

                    offset += increment;

                    break;

                case 'left':
                    aPort.x = 0;
                    aPort.y = offset;
                    aPort.wireAngle = 180;
                    aPort.cssClass = 'left';
                    aPort.labelPosition = {
                        x: portHorizontalTranslation,
                        y: parameters.portLabelVerticalPadding
                    };


                    offset += increment;

                    break;

            }

            aPort.wireLeadIn = wireLeadIn;

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
            parameters.portSpacing * ( top.length + 2 ),
            parameters.portSpacing * ( bottom.length + 2),
            parameters.minWidth
        );

        height = Math.max(
            parameters.portSpacing * ( left.length + 2) + parameters.topPortPadding + parameters.bottomPortPadding,
            parameters.portSpacing * ( right.length + 2) + parameters.topPortPadding + parameters.bottomPortPadding,
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

    this.makeBoxSymbol = function( symbolDirective, type, descriptor, portDescriptors, givenParameters ) {

        var symbol,
            parameters,
            portsAndSizes,
            cssClass,

            boxWidth,
            boxHeight;

        parameters = angular.extend({

            portWireLength: 20,
            portSpacing: 20,
            topPortPadding: 20,
            bottomPortPadding: 0,
            portLabelHorizontalPadding: 5,
            portLabelVerticalPadding: 3,
            minWidth: 120,
            minHeight: 60,
            justifyPorts: false,
            portWireLeadInIncrement: 0,
            hasTopPort: portDescriptors.top.length > 0,
            hasBottomPort: portDescriptors.bottom.length > 0,
            hasLeftPort: portDescriptors.left.length > 0,
            hasRightPort: portDescriptors.right.length > 0

        }, givenParameters || {});

        if (angular.isObject(descriptor) && type) {

            portDescriptors = portDescriptors || {};

            portsAndSizes = portCreator(portDescriptors, parameters);

            cssClass = symbolDirective;

            if (parameters.cssClass) {
                cssClass += ' parameters.cssClass';
            }

            boxWidth = portsAndSizes.width;
            boxHeight = portsAndSizes.height;

            symbol = angular.extend(descriptor,
                {
                    type: type,
                    cssClass: cssClass,
                    symbolDirective: symbolDirective,
                    svgDecoration: null,
                    labelPosition: {
                        x: portsAndSizes.width / 2 + parameters.portWireLength * parameters.hasLeftPort,
                        y: parameters.hasTopPort * parameters.portWireLength + 24
                    },
                    portWireLength: parameters.portWireLength,
                    width: portsAndSizes.width + parameters.portWireLength * (parameters.hasLeftPort + parameters.hasRightPort),
                    height: portsAndSizes.height + parameters.portWireLength * (parameters.hasTopPort + parameters.hasBottomPort),
                    ports: portsAndSizes.ports,
                    boxHeight: boxHeight,
                    boxWidth: boxWidth,
                    hasTopPort: portDescriptors.top.length > 0,
                    hasBottomPort: portDescriptors.bottom.length > 0,
                    hasLeftPort: portDescriptors.left.length > 0,
                    hasRightPort: portDescriptors.right.length > 0
                });


            provider.registerSymbol(symbol);


        }

        return symbol;
    };


    this.$get = [

        function () {

            var SymbolManager;

            SymbolManager = function () {

                var self;

                self = this;

                this.registerSymbol = provider.registerSymbol;

                this.makeBoxSymbol = provider.makeBoxSymbol;

                this.getAvailableSymbols = function () {
                    return availableSymbols;
                };

                this.getSymbol = function ( symbolType ) {
                    return availableSymbols[ symbolType ];
                };

                this.getAccurateSymbolType = function ( approximateName ) {

                    return symbolTypesSearchIndex[approximateName.toLowerCase()];

                };


            };

            return new SymbolManager();

        }
    ];
} );

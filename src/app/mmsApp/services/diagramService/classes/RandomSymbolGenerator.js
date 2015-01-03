/*globals angular*/

'use strict';

module.exports = function(symbolManagerProvider) {

    var generateSymbols;

    generateSymbols = function (count) {

        var i,
            portCount,
            symbol,
            makeARandomSymbol,
            makeSomePorts,
            minPorts = 6,
            maxPorts = 30,
            portWireLength = 20,

            spreadPortsAlongSide;

        spreadPortsAlongSide = function (somePorts, side, width, height) {
            var offset = 2 * portWireLength;

            angular.forEach(somePorts, function (aPort) {

                switch (side) {

                    case 'top':
                        aPort.x = offset;
                        aPort.y = 0;
                        aPort.wireAngle = -90;

                        offset += width / ( somePorts.length + 2 );

                        break;

                    case 'right':
                        aPort.x = width;
                        aPort.y = offset;
                        aPort.wireAngle = 0;

                        offset += height / ( somePorts.length + 2 );

                        break;

                    case 'bottom':
                        aPort.x = offset;
                        aPort.y = height;
                        aPort.wireAngle = 90;

                        offset += width / ( somePorts.length + 2 );

                        break;

                    case 'left':
                        aPort.x = 0;
                        aPort.y = offset;
                        aPort.wireAngle = 180;

                        offset += height / ( somePorts.length + 2 );

                        break;

                }

            });

        };


        makeSomePorts = function (countOfPorts) {

            var ports = [],
                port,
                placement,
                i,
                top = [],
                right = [],
                bottom = [],
                left = [],
                width, height,
                sides = [top, right, bottom, left],
                portSpacing = 20,
                minWidth = 140,
                minHeight = 80;

            for (i = 0; i < countOfPorts; i++) {

                port = {
                    id: 'p_' + i,
                    label: 'Port-' + i,
                    wireLeadIn: 20
                };

                placement = Math.round(Math.random() * 3);

                sides[placement].push(port);
            }

            width = Math.max(
                portSpacing * top.length + 4 * portWireLength,
                portSpacing * bottom.length + 4 * portWireLength,
                minWidth
            );

            height = Math.max(
                portSpacing * left.length + 4 * portWireLength,
                portSpacing * right.length + 4 * portWireLength,
                minHeight
            );

            spreadPortsAlongSide(top, 'top', width, height);
            spreadPortsAlongSide(right, 'right', width, height);
            spreadPortsAlongSide(bottom, 'bottom', width, height);
            spreadPortsAlongSide(left, 'left', width, height);


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

        makeARandomSymbol = function (idPostfix, countOfPorts) {

            var portsAndSizes = makeSomePorts(countOfPorts);

            return  {
                type: 'random_' + idPostfix,
                symbolComponent: 'box',
                svgDecoration: null,
                labelPrefix: 'RND_' + countOfPorts + '_' + idPostfix + ' ',
                labelPosition: {
                    x: portWireLength + 10,
                    y: portWireLength + 20
                },
                portWireLength: portWireLength,
                width: portsAndSizes.width,
                height: portsAndSizes.height,
                ports: portsAndSizes.ports,
                boxHeight: portsAndSizes.height - 2 * portWireLength,
                boxWidth: portsAndSizes.width - 2 * portWireLength
            };


        };

        for (i = 0; i < count; i++) {

            portCount = Math.max(
                Math.floor(Math.random() * maxPorts),
                minPorts
            );

            symbol = makeARandomSymbol(i, portCount);

            symbolManagerProvider.registerSymbol(symbol);

        }

    };



    this.generateSymbols = generateSymbols;

};

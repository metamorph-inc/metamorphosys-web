/*globals angular */

'use strict';

angular.module('mms.designVisualization.diagramService', [
    'mms.designVisualization.symbolServices',
    'mms.designVisualization.operationsManager'
])
    .config(['symbolManagerProvider',
        'operationsManagerProvider',
        function (symbolManagerProvider) {

            var randomSymbolGenerator,
                kinds = 7;

            randomSymbolGenerator = function (count) {

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

            randomSymbolGenerator(kinds);

        }
    ])
    .service('diagramService', [
        '$q',
        '$timeout',
        'symbolManager',
        '$stateParams',
        'wiringService',
        'operationsManager',
        function ($q, $timeout, symbolManager, $stateParams, wiringService/*, operationsManager*/) {

            var
                self = this,

                diagrams,

                symbolTypes,

                DummyDiagramGenerator,
                dummyDiagramGenerator,

                DiagramComponent,
                ComponentPort,
                Wire;

            diagrams = {};

            DummyDiagramGenerator = require('./classes/DummyDiagramGenerator.js');

            DiagramComponent = require('./classes/DiagramComponent.js');
            ComponentPort = require('./classes/ComponentPort');
            Wire = require('./classes/Wire.js');

            dummyDiagramGenerator = new DummyDiagramGenerator(symbolManager, self, wiringService);

            symbolTypes = symbolManager.getAvailableSymbols();


            this.addComponent = function (diagramId, aDiagramComponent) {

                var diagram;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    diagram.addComponent(aDiagramComponent);

                }

            };

            this.addWire = function (diagramId, aWire) {

                var diagram;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    diagram.addWire(aWire);

                }

            };

            this.getWiresForComponents = function (diagramId, components) {

                var diagram;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    diagram.getWiresForComponents(components);

                }

            };

            this.getDiagram = function (diagramId) {

                var diagram;

                if (diagramId) {

                    diagram = diagrams[diagramId];

                }

                return diagram;

            };

            this.addDummyDiagram = function (diagramId, countOfBoxes, countOfWires, canvasWidth, canvasHeight) {

                var dummyDiagram;

                if (diagramId) {

                    dummyDiagram =
                        dummyDiagramGenerator.getDiagram(
                            countOfBoxes, countOfWires, canvasWidth, canvasHeight, symbolTypes
                        );

                    dummyDiagram.id = diagramId;

                    diagrams[diagramId] = dummyDiagram;

                }

                return dummyDiagram;

            };

            this.getHighestZ = function (diagramId) {

                var i,
                    component,
                    z;

                var diagram;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    for (i = 0; i < diagram.components.length; i++) {

                        component = diagram.components[i];

                        if (!isNaN(component.z)) {

                            if (isNaN(z)) {
                                z = component.z;
                            } else {

                                if (z < component.z) {
                                    z = component.z;
                                }

                            }

                        }
                    }

                    if (isNaN(z)) {
                        z = -1;
                    }

                }

                return z;

            };

//            operationsManager.registerOperation({
//                id: 'setComponentPosition',
//                commit: function (component, x, y) {
//
//                    if (angular.isObject(component)) {
//                        component.setPosition(x, y);
//                    }
//
//                }
//
//            });


            //this.generateDummyDiagram(1000, 200, 5000, 5000);
            //this.generateDummyDiagram(1000, 2000, 10000, 10000);
            //this.generateDummyDiagram(10, 5, 1200, 1200);
            //this.generateDummyDiagram( 100, 50, 3000, 3000 );

        }
    ]);

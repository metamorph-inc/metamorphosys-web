/*globals angular*/

'use strict';

module.exports = function (symbolManager, diagramService, wiringService) {

    var getDiagram;

    getDiagram = function (diagramElements) {

        var i,
            symbol,
            newDiagramComponent,

            allPortsById,

            minePortsFromInterfaces,

            diagram,
            wire,

            Diagram,
            DiagramComponent,
            ComponentPort,
            Wire,

            labelParser;



        Diagram = require('./Diagram');
        DiagramComponent = require('./DiagramComponent.js');
        ComponentPort = require('./ComponentPort');
        Wire = require('./Wire.js');

        allPortsById = {};

        labelParser = function (crappyName) {

            var result;

            result = crappyName.replace(/_/g, ' ');

            return result;

        };


        minePortsFromInterfaces = function (element, collector) {

            var minX,
                maxX,
                portDescriptors,
                median,
                allInterConnectors,
                portInstances,
                newPort;

            portDescriptors = {};
            portInstances = [];

            allInterConnectors = [];

            portDescriptors.top = [];
            portDescriptors.right = [];
            portDescriptors.bottom = [];
            portDescriptors.left = [];

            minX = null;
            maxX = null;

            if (angular.isObject(element.interfaces)) {

                angular.forEach(element.interfaces.connectors, function (innerConnector) {

                    var x;

                    x = innerConnector.position.x;

                    if (minX === null) {
                        minX = x;
                    }

                    if (maxX === null) {
                        maxX = x;
                    }

                    if (x < minX) {
                        minX = x;
                    }

                    if (x > maxX) {
                        maxX = x;
                    }

                    allInterConnectors.push(innerConnector);

                });

                allInterConnectors.sort(function (a, b) {

                    if (a.position.x > b.position.x) {
                        return 1;
                    }

                    if (a.position.x < b.position.x) {
                        return 1;
                    }

                    return 0;

                });

                median = (minX + maxX) / 2;

                angular.forEach(allInterConnectors, function (innerConnector) {

                    var portSymbol;

                    portSymbol = {
                        id: innerConnector.id,
                        label: labelParser(innerConnector.name)
                    };

                    if (innerConnector.position.x < median) {

                        portDescriptors.left.push(portSymbol);

                    } else {

                        portDescriptors.right.push(portSymbol);

                    }

                    newPort = new ComponentPort({
                        id: innerConnector.id,
                        portSymbol: portSymbol
                    });

                    portInstances.push(newPort);

                    if (angular.isObject(collector)) {
                        collector[innerConnector.id] = newPort;
                    }

                });
            }

            return {
                portDescriptors: portDescriptors,
                portInstances: portInstances
            };


        };

        diagram = new Diagram();

        if (angular.isObject(diagramElements)) {

            i = 0;

            diagram.config.width = 2000;
            diagram.config.height = 2000;

            angular.forEach(diagramElements.Connector, function (element) {

                var portInstance;

                symbol = symbolManager.getSymbol('simpleConnector');

                newDiagramComponent = new DiagramComponent({
                    id: element.id,
                    label: labelParser(element.name),
                    x: element.position.x,
                    y: element.position.y,
                    z: i,
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1,
                    symbol: symbol,
                    nonSelectable: false,
                    locationLocked: false,
                    draggable: true
                });

                portInstance = new ComponentPort({
                    id: element.id,
                    portSymbol: symbol.ports.p1
                });

                allPortsById[element.id] = portInstance;

                newDiagramComponent.registerPortInstances([portInstance]);
                diagram.addComponent(newDiagramComponent);

                i++;

            });

            angular.forEach(diagramElements.AVMComponentModel, function (element) {

                var portStuff;

                portStuff = minePortsFromInterfaces(element, allPortsById);

                if (angular.isString(element.name) &&
                    element.name.charAt(0) === 'C' && !isNaN(element.name.charAt(1))
                ) {

                    // Cheap shot to figure if it is a capacitor

                    symbol = symbolManager.getSymbol('capacitor');

                    newDiagramComponent = new DiagramComponent({
                        id: element.id,
                        label: labelParser(element.name),
                        x: element.position.x,
                        y: element.position.y,
                        z: i,
                        rotation: 0,
                        scaleX: 1,
                        scaleY: 1,
                        symbol: symbol,
                        nonSelectable: false,
                        locationLocked: false,
                        draggable: true
                    });

                    for (i = 0; i < portStuff.portInstances.length; i++) {

                        if (portStuff.portInstances[i].portSymbol.label === 'P2') {
                            portStuff.portInstances[i].portSymbol = symbol.ports.C;
                        }

                        if (portStuff.portInstances[i].portSymbol.label === 'P1') {
                            portStuff.portInstances[i].portSymbol = symbol.ports.A;
                        }

                    }

                    newDiagramComponent.registerPortInstances(portStuff.portInstances);

                } else if (angular.isString(element.name) &&
                    element.name.charAt(0) === 'D' && !isNaN(element.name.charAt(1))
                ) {

                    // Cheap shot to figure if it is a diode

                    symbol = symbolManager.getSymbol('tvsDiode');

                    newDiagramComponent = new DiagramComponent({
                        id: element.id,
                        label: labelParser(element.name),
                        x: element.position.x,
                        y: element.position.y,
                        z: i,
                        rotation: 0,
                        scaleX: 1,
                        scaleY: 1,
                        symbol: symbol,
                        nonSelectable: false,
                        locationLocked: false,
                        draggable: true
                    });

                    for (i = 0; i < portStuff.portInstances.length; i++) {

                        if (portStuff.portInstances[i].portSymbol.label === '2') {
                            portStuff.portInstances[i].portSymbol = symbol.ports.C;
                        }

                        if (portStuff.portInstances[i].portSymbol.label === '1') {
                            portStuff.portInstances[i].portSymbol = symbol.ports.A;
                        }

                    }

                    newDiagramComponent.registerPortInstances(portStuff.portInstances);

                } else {

                    symbol = symbolManager.makeBoxSymbol(element.name, {
                            showPortLabels: true
                        }, portStuff.portDescriptors,
                        {
                            minWidth: 200,
                            portWireLeadInIncrement: 8
                        });

                    newDiagramComponent = new DiagramComponent({
                        id: element.id,
                        label: labelParser(element.name),
                        x: element.position.x,
                        y: element.position.y,
                        z: i,
                        rotation: 0,
                        scaleX: 1,
                        scaleY: 1,
                        symbol: symbol,
                        nonSelectable: false,
                        locationLocked: false,
                        draggable: true
                    });

                    newDiagramComponent.registerPortInstances(portStuff.portInstances);


                }

                diagram.addComponent(newDiagramComponent);

                i++;

            });

            angular.forEach(diagramElements.Container, function (element) {

                var portStuff;

                portStuff = minePortsFromInterfaces(element, allPortsById);

                symbol = symbolManager.makeBoxSymbol(element.name, {
                        showPortLabels: true
                    }, portStuff.portDescriptors,
                    {
                        minWidth: 200,
                        portWireLeadInIncrement: 8
                    });

                newDiagramComponent = new DiagramComponent({
                    id: element.id,
                    label: labelParser(element.name),
                    x: element.position.x,
                    y: element.position.y,
                    z: i,
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1,
                    symbol: symbol,
                    nonSelectable: false,
                    locationLocked: false,
                    draggable: true
                });

                newDiagramComponent.registerPortInstances(portStuff.portInstances);
                diagram.addComponent(newDiagramComponent);

                i++;

            });


            angular.forEach(diagramElements.ConnectorComposition, function (element) {

                var sourcePort,
                    destinationPort;

                if (angular.isObject(element.details)) {

                    sourcePort = allPortsById[element.details.sourceId];
                    destinationPort = allPortsById[element.details.destinationId];

                    if (sourcePort && destinationPort) {

                        wire = new Wire({
                            id: element.id,
                            end1: {
                                component: sourcePort.parentComponent,
                                port: sourcePort
                            },
                            end2: {
                                component: destinationPort.parentComponent,
                                port: destinationPort
                            }
                        });

                        wiringService.routeWire(wire, 'ElbowRouter');

                        diagram.addWire(wire);

                    }
                }

            });

        }

        return diagram;

    };

    this.getDiagram = getDiagram;
};

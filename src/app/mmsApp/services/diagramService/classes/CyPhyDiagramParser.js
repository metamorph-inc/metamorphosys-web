/*globals angular*/

'use strict';

module.exports = function (symbolManager, diagramService, wiringService) {

    var getDiagram,
        getDiagramElement,
        avmComponentModelParser,
        connectorParser,
        labelParser,

        Diagram,
        DiagramComponent,
        ComponentPort,
        Wire,

        minePortsFromInterfaces;



    Diagram = require('./Diagram');
    DiagramComponent = require('./DiagramComponent.js');
    ComponentPort = require('./ComponentPort');
    Wire = require('./Wire.js');

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


    labelParser = function (crappyName) {

        var result;

        result = crappyName.replace(/_/g, ' ');

        return result;

    };

    connectorParser = function(element, allPortsById, zIndex) {
        var portInstance,
            symbol,
            newDiagramComponent;

        symbol = symbolManager.getSymbol('simpleConnector');

        newDiagramComponent = new DiagramComponent({
            id: element.id,
            label: labelParser(element.name),
            x: element.position.x,
            y: element.position.y,
            z: zIndex,
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

        return newDiagramComponent;

    };

    avmComponentModelParser = function(element, allPortsById, zIndex) {

        var portStuff,
            newModelComponent,
            symbol;

        allPortsById = allPortsById || {};
        zIndex = zIndex || 0;

        portStuff = minePortsFromInterfaces(element, allPortsById);

        if (angular.isString(element.name) &&
            element.name.charAt(0) === 'C' &&
            ( !isNaN(element.name.charAt(1)) ||
                element.name.charAt(1) === ' ' ||
                element.name.charAt(1) === '_')
        ) {

            // Cheap shot to figure if it is a capacitor

            symbol = symbolManager.getSymbol('capacitor');

            newModelComponent = new DiagramComponent({
                id: element.id,
                label: labelParser(element.name),
                x: element.position.x,
                y: element.position.y,
                z: zIndex,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                symbol: symbol,
                nonSelectable: false,
                locationLocked: false,
                draggable: true
            });

            for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.C;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.A;
                }

            }

            newModelComponent.registerPortInstances(portStuff.portInstances);

        } else if (angular.isString(element.name) &&
            element.name.charAt(0) === 'D' && !isNaN(element.name.charAt(1))
        ) {

            // Cheap shot to figure if it is a diode

            symbol = symbolManager.getSymbol('tvsDiode');

            newModelComponent = new DiagramComponent({
                id: element.id,
                label: labelParser(element.name),
                x: element.position.x,
                y: element.position.y,
                z: zIndex,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                symbol: symbol,
                nonSelectable: false,
                locationLocked: false,
                draggable: true
            });

            for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {

                if (portStuff.portInstances[zIndex].portSymbol.label === '2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.C;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === '1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.A;
                }

            }

            newModelComponent.registerPortInstances(portStuff.portInstances);

        } else {

            symbol = symbolManager.makeBoxSymbol(element.name, {
                    showPortLabels: true
                }, portStuff.portDescriptors,
                {
                    minWidth: 200,
                    portWireLeadInIncrement: 8
                });

            newModelComponent = new DiagramComponent({
                id: element.id,
                label: labelParser(element.name),
                x: element.position.x,
                y: element.position.y,
                z: zIndex,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                symbol: symbol,
                nonSelectable: false,
                locationLocked: false,
                draggable: true
            });

            newModelComponent.registerPortInstances(portStuff.portInstances);

        }

        return newModelComponent;

    };


    getDiagram = function (diagramElements) {

        var i,
            symbol,
            newDiagramComponent,

            allPortsById,

            diagram,
            wire;


        allPortsById = {};


        diagram = new Diagram();

        if (angular.isObject(diagramElements)) {

            i = 0;

            diagram.config.width = 2000;
            diagram.config.height = 2000;

            angular.forEach(diagramElements.Connector, function (element) {

                newDiagramComponent = connectorParser(element, allPortsById, i);

                diagram.addComponent(newDiagramComponent);

                i++;

            });

            angular.forEach(diagramElements.AVMComponentModel, function (element) {

                newDiagramComponent = avmComponentModelParser(element, allPortsById, i);

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

    getDiagramElement = function(descriptor, portsCollector, zIndex) {

        var element;

        if (descriptor.baseName === 'AVMComponentModel') {

            element = avmComponentModelParser(descriptor, portsCollector, zIndex);

        } else if (descriptor.baseName === 'Connector') {

            element = avmComponentModelParser(descriptor, portsCollector, zIndex);

        }

        return element;


    };


    this.getDiagram = getDiagram;
    this.getDiagramElement = getDiagramElement;
};

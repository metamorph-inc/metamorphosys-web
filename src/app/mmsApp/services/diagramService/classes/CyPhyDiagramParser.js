/*globals angular*/

'use strict';

module.exports = function (symbolManager, diagramService, wiringService) {

    var getDiagram,
        getDiagramElement,
        avmComponentModelParser,
        connectorParser,
        containerParser,
        labelParser,
        wireParser,

        Diagram,
        DiagramComponent,
        ComponentPort,
        Wire,

        minePortsFromInterfaces;



    Diagram = require('./Diagram');
    DiagramComponent = require('./DiagramComponent.js');
    ComponentPort = require('./ComponentPort');
    Wire = require('./Wire.js');

    minePortsFromInterfaces = function (element) {

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

                if (a.position.y > b.position.y) {
                    return 1;
                }

                if (a.position.y < b.position.y) {
                    return -1;
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

                if (element.baseName === 'Container') {
                    portSymbol.portDirective = 'rectangle-port';
                }

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

    wireParser = function(element, diagram) {

        var sourcePort,
            destinationPort,
            wire;

        if (angular.isObject(element.details) && angular.isObject(diagram)) {

            sourcePort = diagram.portsById[element.details.sourceId];
            destinationPort = diagram.portsById[element.details.destinationId];

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

                if (angular.isArray(element.details.wireSegments) && element.details.wireSegments.length > 0) {

                    wire.segments = angular.copy(element.details.wireSegments);
                    wiringService.adjustWireEndSegments(wire);

                } else {

                    wiringService.routeWire(wire, 'ElbowRouter');

                }

            }
        }

        return wire;

    };

    connectorParser = function(element,  zIndex) {
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
            rotation: element.rotation || 0,
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

        newDiagramComponent.registerPortInstances([portInstance]);

        return newDiagramComponent;

    };

    containerParser = function(element,  zIndex) {
        var symbol,
            newDiagramComponent,
            portStuff;

        zIndex = zIndex || 0;

        portStuff = minePortsFromInterfaces(element);

        symbol = symbolManager.makeBoxSymbol(
            'container-box',
            element.name,
            {
                showPortLabels: true,
                limitLabelWidthTo: 150
            }, portStuff.portDescriptors,
            {
                minWidth: 200,
                portWireLeadInIncrement: 8,
                portWireLength: 14,
                topPortPadding: 26
            }
        );

        newDiagramComponent = new DiagramComponent({
            id: element.id,
            label: labelParser(element.name),
            x: element.position.x,
            y: element.position.y,
            z: zIndex,
            rotation: element.rotation || 0,
            scaleX: 1,
            scaleY: 1,
            symbol: symbol,
            nonSelectable: false,
            locationLocked: false,
            draggable: true,
            isContainer: true
        });

        newDiagramComponent.registerPortInstances(portStuff.portInstances);

        return newDiagramComponent;

    };

    avmComponentModelParser = function(element,  zIndex) {

        var portStuff,
            newModelComponent,
            symbol;

        zIndex = zIndex || 0;

        portStuff = minePortsFromInterfaces(element);

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
                rotation: element.rotation || 0,
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
            element.name.charAt(0) === 'L' &&
            ( !isNaN(element.name.charAt(1)) ||
            element.name.charAt(1) === ' ' ||
            element.name.charAt(1) === '_')
        ) {

            // Cheap shot to figure if it is a capacitor

            symbol = symbolManager.getSymbol('inductor');

            newModelComponent = new DiagramComponent({
                id: element.id,
                label: labelParser(element.name),
                x: element.position.x,
                y: element.position.y,
                z: zIndex,
                rotation: element.rotation || 0,
                scaleX: 1,
                scaleY: 1,
                symbol: symbol,
                nonSelectable: false,
                locationLocked: false,
                draggable: true
            });

            for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.p1;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.p2;
                }

            }

            newModelComponent.registerPortInstances(portStuff.portInstances);

        } else if (angular.isString(element.name) &&
            element.name.charAt(0) === 'R' &&
            ( !isNaN(element.name.charAt(1)) ||
            element.name.charAt(1) === ' ' ||
            element.name.charAt(1) === '_')
        ) {

            // Cheap shot to figure if it is a capacitor

            symbol = symbolManager.getSymbol('resistor');

            newModelComponent = new DiagramComponent({
                id: element.id,
                label: labelParser(element.name),
                x: element.position.x,
                y: element.position.y,
                z: zIndex,
                rotation: element.rotation || 0,
                scaleX: 1,
                scaleY: 1,
                symbol: symbol,
                nonSelectable: false,
                locationLocked: false,
                draggable: true
            });

            for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.p1;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.p2;
                }

            }

            newModelComponent.registerPortInstances(portStuff.portInstances);

        }

        //else if (angular.isString(element.name) &&
        //    element.name.charAt(0) === 'D' && !isNaN(element.name.charAt(1))
        //) {
        //
        //    // Cheap shot to figure if it is a diode
        //
        //    symbol = symbolManager.getSymbol('tvsDiode');
        //
        //    newModelComponent = new DiagramComponent({
        //        id: element.id,
        //        label: labelParser(element.name),
        //        x: element.position.x,
        //        y: element.position.y,
        //        z: zIndex,
        //        rotation: element.rotation || 0,
        //        scaleX: 1,
        //        scaleY: 1,
        //        symbol: symbol,
        //        nonSelectable: false,
        //        locationLocked: false,
        //        draggable: true
        //    });
        //
        //    for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {
        //
        //        if (portStuff.portInstances[zIndex].portSymbol.label === '2') {
        //            portStuff.portInstances[zIndex].portSymbol = symbol.ports.C;
        //        }
        //
        //        if (portStuff.portInstances[zIndex].portSymbol.label === '1') {
        //            portStuff.portInstances[zIndex].portSymbol = symbol.ports.A;
        //        }
        //
        //    }
        //
        //    newModelComponent.registerPortInstances(portStuff.portInstances);
        //
        //}

        else {

            if (element.name !== 'pcb') {
                symbol = symbolManager.makeBoxSymbol(
                    'box',
                    element.name, {
                        showPortLabels: true,
                        limitLabelWidthTo: 150
                    }, portStuff.portDescriptors,
                    {
                        minWidth: 200,
                        portWireLeadInIncrement: 10
                    });

                newModelComponent = new DiagramComponent({
                    id: element.id,
                    label: labelParser(element.name),
                    x: element.position.x,
                    y: element.position.y,
                    z: zIndex,
                    rotation: element.rotation || 0,
                    scaleX: 1,
                    scaleY: 1,
                    symbol: symbol,
                    nonSelectable: false,
                    locationLocked: false,
                    draggable: true
                });


                newModelComponent.registerPortInstances(portStuff.portInstances);

            }

        }

        return newModelComponent;

    };


    getDiagram = function (diagramElements) {

        var i,
            newDiagramComponent,



            diagram,
            wire;


        diagram = new Diagram();

        if (angular.isObject(diagramElements)) {

            i = 0;

            diagram.config.width = 2500;
            diagram.config.height = 2500;

            angular.forEach(diagramElements.Connector, function (element) {

                newDiagramComponent = connectorParser(element,  i);

                diagram.addComponent(newDiagramComponent);

                i++;

            });

            angular.forEach(diagramElements.AVMComponentModel, function (element) {

                newDiagramComponent = avmComponentModelParser(element,  i);

                diagram.addComponent(newDiagramComponent);

                i++;

            });

            angular.forEach(diagramElements.Container, function (element) {

                newDiagramComponent = containerParser(element,  i);

                diagram.addComponent(newDiagramComponent);

                i++;

            });


            angular.forEach(diagramElements.ConnectorComposition, function (element) {

                wire = wireParser(element, diagram);

                diagram.addWire(wire);

            });

        }

        return diagram;

    };

    getDiagramElement = function(descriptor, zIndex, diagram) {

        var element;

        if (descriptor.baseName === 'AVMComponentModel') {

            element = avmComponentModelParser(descriptor, zIndex);

        } else if (descriptor.baseName === 'Connector') {

            element = avmComponentModelParser(descriptor, zIndex);

        } else if (descriptor.baseName === 'Container') {

            element = avmComponentModelParser(descriptor, zIndex);

        } else if (descriptor.baseName === 'ConnectorComposition') {

            element = wireParser(descriptor, diagram);

        }

        return element;


    };


    this.getDiagram = getDiagram;
    this.getDiagramElement = getDiagramElement;
};

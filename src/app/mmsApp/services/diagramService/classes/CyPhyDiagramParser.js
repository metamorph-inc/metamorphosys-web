/*globals angular*/

'use strict';

module.exports = function(symbolManager, diagramService, wiringService, pcbService) {

    var getDiagram,
        getDiagramElement,
        avmComponentModelParser,
        primitiveParser,
        connectorParser,
        containerParser,
        labelParser,
        wireParser,

        Diagram,
        DiagramComponent,
        ComponentPort,
        Wire,

        minePortsFromInterfaces,

        randomConnectorTypes = [
            'I2C',
            'SPI_ThreeWire',
            'SPI',
            'GPIO',
            'USB',
            'GND',
            'UART',
            'DigitalSignal',
            'Analog',
            'Analog_4',
            'Analog_8',
            'Analog_16',
            'DigitalClock',
            'Supply_Single',
            'ThermalPad'
        ],

        digitalPortColorBase = '#002285',
        analogPortColorBase = '#006785',

        connectorTypeToDecorator = {
            USB: {
                directive: 'usb-connector-symbol',
                bgColor: '#4d9ac4',
                label: null
            },

            DigitalSignal: {
                directive: 'digital-connector-symbol',
                bgColor: digitalPortColorBase,
                label: null
            },

            GPIO: {
                directive: 'digital-connector-symbol',
                bgColor: digitalPortColorBase,
                label: null
            },

            'Analog': {
                directive: 'analog-connector-symbol',
                bgColor: analogPortColorBase,
                label: null
            },

            'AnalogSignal': {
                directive: 'analog-connector-symbol',
                bgColor: analogPortColorBase,
                label: null
            },

            'Analog_4': {
                directive: 'analog-connector-symbol',
                bgColor: analogPortColorBase,
                label: null
            },

            'Analog_8': {
                directive: 'analog-connector-symbol',
                bgColor: analogPortColorBase,
                label: null
            },

            'Analog_16': {
                directive: 'analog-connector-symbol',
                bgColor: analogPortColorBase,
                label: null
            },

            GND: {
                directive: null,
                bgColor: '#000',
                label: 'GND'
            },

            SPI: {
                directive: null,
                bgColor: digitalPortColorBase,
                label: 'spi'
            },

            I2C: {
                directive: null,
                bgColor: digitalPortColorBase,
                label: 'I2C'
            },

            'SPI_ThreeWire': {
                directive: null,
                bgColor: digitalPortColorBase,
                label: 'spi3'
            },

            UART: {
                directive: null,
                bgColor: digitalPortColorBase,
                label: 'UART'
            },

            DigitalClock: {
                directive: null,
                bgColor: digitalPortColorBase,
                label: 'CLK'
            },

            'Supply_Single': {
                directive: 'supply-single-symbol'
            }

        };



    Diagram = require('./Diagram');
    DiagramComponent = require('./DiagramComponent.js');
    ComponentPort = require('./ComponentPort');
    Wire = require('./Wire.js');

    minePortsFromInterfaces = function(element) {

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

            angular.forEach(element.interfaces.connectors, function(innerConnector) {

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

            allInterConnectors.sort(function(a, b) {

                if (a.position.y > b.position.y) {
                    return 1;
                }

                if (a.position.y < b.position.y) {
                    return -1;
                }

                return 0;

            });

            median = (minX + maxX) / 2;

            angular.forEach(allInterConnectors, function(innerConnector) {

                var portSymbol,
                    connectorType = innerConnector.type;

                    //  ||
                    //     randomConnectorTypes[
                    //         Math.round( Math.random() * (randomConnectorTypes.length - 1) )
                    //     ];

                portSymbol = {
                    id: innerConnector.id,
                    label: labelParser(innerConnector.name),
                    type: connectorType,
                    portDecorator: connectorTypeToDecorator[ connectorType ],
                    description: innerConnector.description
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


    labelParser = function(crappyName) {

        var result;

        result = crappyName.replace(/_/g, ' ');

        return result;

    };

    wireParser = function(element, diagram) {

        var sourcePort,
            destinationPort,
            wire;

        if (angular.isObject(element.details) && angular.isObject(diagram)) {

            sourcePort = diagram.getPortById(element.details.sourceId);
            destinationPort = diagram.getPortById(element.details.destinationId);

            if (sourcePort && destinationPort) {

                wire = new Wire(
                    element.id, {
                        component: sourcePort.parentComponent,
                        port: sourcePort
                    }, {
                        component: destinationPort.parentComponent,
                        port: destinationPort
                    }
                );

                if (Array.isArray(element.details.wireSegments) && element.details.wireSegments.length > 0) {

                    wire.makeSegmentsFromParameters(angular.copy(element.details.wireSegments));
                    wiringService.adjustWireEndSegments(wire);

                } else {

                    wiringService.routeWire(wire, 'ElbowRouter');

                }

            }
        }

        return wire;

    };

    primitiveParser = function(element, zIndex) {
        
        if (element.primitiveId === 'simple-connector') {

            return connectorParser(element, zIndex);
        }
        else if (element.primitiveId === 'empty-subcircuit') {

            return containerParser(element, zIndex);
        }

    };

    connectorParser = function(element, zIndex) {
        var portInstance,
            symbol,
            tmpSymbol,
            newDiagramComponent;

        tmpSymbol = symbolManager.getSymbol('simpleConnector');

        symbol = angular.copy(tmpSymbol, symbol);

        newDiagramComponent = new DiagramComponent({
            id: element.id,
            label: labelParser(element.name),
            x: element.position.x,
            y: element.position.y,
            z: element.position.y || zIndex,
            rotation: element.rotation || 0,
            scaleX: 1,
            scaleY: 1,
            symbol: symbol,
            nonSelectable: false,
            locationLocked: false,
            draggable: true,
            metaType: 'Connector'
        });

        newDiagramComponent.classificationTags.push({
            id: 'connector',
            name: 'Connector'
        });

        portInstance = new ComponentPort({
            id: element.id,
            portSymbol: symbol.ports.p1
        });

        newDiagramComponent.registerPortInstances([portInstance]);

        return newDiagramComponent;

    };

    containerParser = function(element, zIndex) {
        var symbol,
            newDiagramComponent,
            portStuff;

        zIndex = zIndex || 0;

        portStuff = minePortsFromInterfaces(element);

        symbol = symbolManager.makeBoxSymbol(
            'container-box',
            element.name || element.id, {
                showPortLabels: true,
                limitLabelWidthTo: 150,
                portDirective: 'decorated-port'
            }, portStuff.portDescriptors, {
                minWidth: 240,
                portWireLeadInIncrement: 8,
                portWireLength: 30,
                topPortPadding: 20,
                hasTopPort: portStuff.portDescriptors.top.length > 0,
                hasBottomPort: portStuff.portDescriptors.bottom.length > 0,
                hasLeftPort: portStuff.portDescriptors.left.length > 0,
                hasRightPort: portStuff.portDescriptors.right.length > 0
            }
        );

        newDiagramComponent = new DiagramComponent({
            id: element.id,
            label: labelParser(element.name),
            x: element.position.x,
            y: element.position.y,
            z: element.position.z || zIndex,
            rotation: element.rotation || 0,
            scaleX: 1,
            scaleY: 1,
            symbol: symbol,
            nonSelectable: false,
            readonly: false,
            locationLocked: false,
            draggable: true,
            metaType: 'Container'
        });


        newDiagramComponent.classificationTags.push({
            id: 'subcircuit',
            name: 'Subcircuit'
        });

        newDiagramComponent.registerPortInstances(portStuff.portInstances);

        return newDiagramComponent;

    };

    avmComponentModelParser = function(element, zIndex) {

        var portStuff,
            newModelComponent,
            symbol,
            customSymbolWasFound = false,
            numberOfPortsMapped = 0;

        zIndex = zIndex || 0;

        //console.log(element);

        if (!customSymbolWasFound && element.details && angular.isString(element.details.classifications) &&
            element.details.classifications.indexOf('capacitors.single_components') > -1) {

            symbol = symbolManager.getSymbol('capacitor');

            numberOfPortsMapped = 0;
            portStuff = minePortsFromInterfaces(element);

            for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.C;
                    numberOfPortsMapped++;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.A;
                    numberOfPortsMapped++;
                }

            }

            if (numberOfPortsMapped === 2) {

                newModelComponent = new DiagramComponent({
                    id: element.id,
                    label: labelParser(element.name),
                    x: element.position.x,
                    y: element.position.y,
                    z: element.position.z || zIndex,
                    rotation: element.rotation || 0,
                    scaleX: 1,
                    scaleY: 1,
                    symbol: symbol,
                    nonSelectable: false,
                    readonly: false,
                    locationLocked: false,
                    draggable: true,
                    metaType: 'AVMComponent'
                });

                newModelComponent.registerPortInstances(portStuff.portInstances);
                customSymbolWasFound = true;
            }

        }

        if (!customSymbolWasFound && element.details && angular.isString(element.details.classifications) &&
            element.details.classifications.indexOf('inductors.single_components') > -1) {

            symbol = symbolManager.getSymbol('inductor');

            numberOfPortsMapped = 0;
            portStuff = minePortsFromInterfaces(element);

            for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.p1;
                    numberOfPortsMapped++;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.p2;
                    numberOfPortsMapped++;
                }

            }

            if (numberOfPortsMapped === 2) {

                newModelComponent = new DiagramComponent({
                    id: element.id,
                    label: labelParser(element.name),
                    x: element.position.x,
                    y: element.position.y,
                    z: element.position.z || zIndex,
                    rotation: element.rotation || 0,
                    scaleX: 1,
                    scaleY: 1,
                    symbol: symbol,
                    nonSelectable: false,
                    readonly: false,
                    locationLocked: false,
                    draggable: true,
                    metaType: 'AVMComponent'
                });


                newModelComponent.registerPortInstances(portStuff.portInstances);
                customSymbolWasFound = true;
            }

        }

        if (!customSymbolWasFound && element.details && angular.isString(element.details.classifications) &&
            element.details.classifications.indexOf('resistors.single_components') > -1) {

            // Cheap shot to figure if it is a capacitor

            symbol = symbolManager.getSymbol('resistor');

            numberOfPortsMapped = 0;
            portStuff = minePortsFromInterfaces(element);

            for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.p1;
                    numberOfPortsMapped++;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.p2;
                    numberOfPortsMapped++;
                }

            }

            if (numberOfPortsMapped === 2) {

                newModelComponent = new DiagramComponent({
                    id: element.id,
                    label: labelParser(element.name),
                    x: element.position.x,
                    y: element.position.y,
                    z: element.position.z || zIndex,
                    rotation: element.rotation || 0,
                    scaleX: 1,
                    scaleY: 1,
                    symbol: symbol,
                    nonSelectable: false,
                    readonly: false,
                    locationLocked: false,
                    draggable: true,
                    metaType: 'AVMComponent'
                });


                newModelComponent.registerPortInstances(portStuff.portInstances);
                customSymbolWasFound = true;
            }

        }

        if (!customSymbolWasFound && element.details && angular.isString(element.details.classifications) &&
            element.details.classifications.indexOf('diodes.tvs_diodes') > -1) {

            // Cheap shot to figure if it is a diode

            symbol = symbolManager.getSymbol('tvsDiode');

            numberOfPortsMapped = 0;
            portStuff = minePortsFromInterfaces(element);

            for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.C;
                    numberOfPortsMapped++;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.A;
                    numberOfPortsMapped++;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'C') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.C;
                    numberOfPortsMapped++;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'A') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.A;
                    numberOfPortsMapped++;
                }

            }

            if (numberOfPortsMapped === 2) {

                newModelComponent = new DiagramComponent({
                    id: element.id,
                    label: labelParser(element.name),
                    x: element.position.x,
                    y: element.position.y,
                    z: element.position.z || zIndex,
                    rotation: element.rotation || 0,
                    scaleX: 1,
                    scaleY: 1,
                    symbol: symbol,
                    nonSelectable: false,
                    locationLocked: false,
                    draggable: true
                });


                newModelComponent.registerPortInstances(portStuff.portInstances);
                customSymbolWasFound = true;
            }

        }

        if (!customSymbolWasFound && element.details && angular.isString(element.details.classifications) &&
            element.details.classifications.indexOf('diodes.uncategorized') > -1) {

            // Cheap shot to figure if it is a diode

            symbol = symbolManager.getSymbol('diode');

            numberOfPortsMapped = 0;
            portStuff = minePortsFromInterfaces(element);

            for (zIndex = 0; zIndex < portStuff.portInstances.length; zIndex++) {

                if (portStuff.portInstances[zIndex].portSymbol.label === 'C') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.C;
                    numberOfPortsMapped++;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'A') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.A;
                    numberOfPortsMapped++;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === '1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.C;
                    numberOfPortsMapped++;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === '2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.A;
                    numberOfPortsMapped++;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P1') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.C;
                    numberOfPortsMapped++;
                }

                if (portStuff.portInstances[zIndex].portSymbol.label === 'P2') {
                    portStuff.portInstances[zIndex].portSymbol = symbol.ports.A;
                    numberOfPortsMapped++;
                }

            }

            if (numberOfPortsMapped >= 2) {

                newModelComponent = new DiagramComponent({
                    id: element.id,
                    label: labelParser(element.name),
                    x: element.position.x,
                    y: element.position.y,
                    z: element.position.z || zIndex,
                    rotation: element.rotation || 0,
                    scaleX: 1,
                    scaleY: 1,
                    symbol: symbol,
                    nonSelectable: false,
                    locationLocked: false,
                    draggable: true
                });


                newModelComponent.registerPortInstances(portStuff.portInstances);
                customSymbolWasFound = true;
            }

        }

        if (!customSymbolWasFound && !pcbService.isPcbClassification(element.details.classifications)) {

            portStuff = minePortsFromInterfaces(element);

            symbol = symbolManager.makeBoxSymbol(
                'box',
                element.name, {
                    showPortLabels: true,
                    limitLabelWidthTo: 150,
                    portDirective: 'decorated-port'
                }, portStuff.portDescriptors, {
                    minWidth: 240,
                    portWireLeadInIncrement: 8,
                    portWireLength: 30,
                    topPortPadding: 20
                });

            newModelComponent = new DiagramComponent({
                id: element.id,
                label: labelParser(element.name),
                x: element.position.x,
                y: element.position.y,
                z: element.position.z || zIndex,
                rotation: element.rotation || 0,
                scaleX: 1,
                scaleY: 1,
                symbol: symbol,
                nonSelectable: false,
                locationLocked: false,
                draggable: true,
                metaType: 'AVMComponent'
            });

            newModelComponent.registerPortInstances(portStuff.portInstances);
            customSymbolWasFound = true;

        }

        if (newModelComponent) {

            newModelComponent.details = element.details;
            newModelComponent.classificationTags.push({
                id: 'component',
                name: 'Component'
            });

        }

        return newModelComponent;

    };


    getDiagram = function(diagramElements) {

        var i,
            newDiagramComponent,



            diagram,
            wire,

            checkMaxSizes = function(component) {

                if (component) {

                    var boundingBox = component.getGridBoundingBox();

                    diagram.config.width = Math.max(diagram.config.width, boundingBox.x + boundingBox.width);
                    diagram.config.height = Math.max(diagram.config.height, boundingBox.y + boundingBox.height);

                }

            };


        diagram = new Diagram();

        if (angular.isObject(diagramElements)) {

            i = 0;

            angular.forEach(diagramElements.Connector, function(element) {

                newDiagramComponent = connectorParser(element, i);

                diagram.addComponent(newDiagramComponent);

                checkMaxSizes(newDiagramComponent);

                i++;

            });

            angular.forEach(diagramElements.AVMComponentModel, function(element) {

                newDiagramComponent = avmComponentModelParser(element, i);

                diagram.addComponent(newDiagramComponent);

                checkMaxSizes(newDiagramComponent);

                i++;

            });

            angular.forEach(diagramElements.Container, function(element) {

                newDiagramComponent = containerParser(element, i);

                diagram.addComponent(newDiagramComponent);

                checkMaxSizes(newDiagramComponent);

                i++;

            });


            angular.forEach(diagramElements.ConnectorComposition, function(element) {

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

            element = connectorParser(descriptor, zIndex);

        } else if (descriptor.baseName === 'Container') {

            element = containerParser(descriptor, zIndex);

        } else if (descriptor.baseName === 'ConnectorComposition') {

            element = wireParser(descriptor, diagram);

        }

        return element;


    };


    this.getDiagram = getDiagram;
    this.getDiagramElement = getDiagramElement;
    this.primitiveParser = primitiveParser;
    this.connectorTypeToDecorator = connectorTypeToDecorator;
};

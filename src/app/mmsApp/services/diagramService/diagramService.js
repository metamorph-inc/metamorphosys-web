/*globals angular */

'use strict';

angular.module('mms.designVisualization.diagramService', [
    'mms.designVisualization.symbolServices',
    'mms.designVisualization.operationsManager'
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

                CyPhyDiagramParser,
                cyPhyDiagramParser,

                DiagramComponent,
                ComponentPort,
                Wire;

            diagrams = {};

            DummyDiagramGenerator = require('./classes/DummyDiagramGenerator.js');
            CyPhyDiagramParser = require('./classes/CyPhyDiagramParser.js');

            DiagramComponent = require('./classes/DiagramComponent.js');
            ComponentPort = require('./classes/ComponentPort');
            Wire = require('./classes/Wire.js');

            dummyDiagramGenerator = new DummyDiagramGenerator(symbolManager, self, wiringService);
            cyPhyDiagramParser = new CyPhyDiagramParser(symbolManager, self, wiringService);

            symbolTypes = symbolManager.getAvailableSymbols();


            this.addComponent = function (diagramId, aDiagramComponent) {

                var diagram;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    diagram.addComponent(aDiagramComponent);

                }

            };

            this.updateComponentsAndItsWiresPosition = function( diagramId, componentId, newPosition) {

                var diagram,
                    setOfWires;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    diagram.updateComponentPosition(componentId, newPosition);

                    setOfWires = diagram.wiresByComponentId[componentId];

                    angular.forEach( setOfWires, function ( wire ) {

                        wiringService.adjustWireEndSegments( wire );

                    } );


                }

            };

            this.updateComponentsAndItsWiresRotation = function( diagramId, componentId, newRotation) {

                var diagram,
                    setOfWires;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    diagram.updateComponentRotation(componentId, newRotation);

                    setOfWires = diagram.wiresByComponentId[componentId];

                    angular.forEach( setOfWires, function ( wire ) {

                        wiringService.adjustWireEndSegments( wire );

                    } );


                }

            };

            this.updateWireSegments = function( diagramId, wireId, newSegments) {

                var diagram,
                    wire;

                console.log(newSegments);

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    wire = diagram.wiresById[wireId];

                    if (angular.isObject(wire)) {

                        wire.segments = newSegments;

                    }

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

                var diagram,
                    wires;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    wires = diagram.getWiresForComponents(components);

                }

                return wires || [];

            };

            this.createDiagramFromCyPhyElements = function(diagramId, diagramElements) {

                var diagram;

                if (diagramId && angular.isObject(diagramElements)) {

                    diagram = cyPhyDiagramParser.getDiagram(diagramElements);
                    diagram.id = diagramId;

                    diagrams[diagramId] = diagram;

                }

                return diagram;

            };

            this.createNewComponentFromFromCyPhyElement = function(diagramId, diagramElementDescriptor) {

                var diagram,
                    newDiagramStuff;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram) && angular.isObject(diagramElementDescriptor)) {

                    newDiagramStuff = cyPhyDiagramParser.getDiagramElement(
                        diagramElementDescriptor,
                        self.getHighestZ() + 1,
                        diagram
                    );

                    if (diagramElementDescriptor.baseName === 'ConnectorComposition') {
                        diagram.addWire(newDiagramStuff);
                    } else {
                        diagram.addComponent(newDiagramStuff);
                    }


                }

                return newDiagramStuff;

            };

            this.getDiagram = function (diagramId) {

                var diagram;

                if (diagramId) {

                    diagram = diagrams[diagramId];

                }

                return diagram;

            };

            this.deleteComponentOrWireById = function(diagramId, elementId) {

                var diagram,
                    result;

                result = false;

                diagram = diagrams[diagramId];

                if (diagram) {

                    result = diagram.deleteComponentOrWireById(elementId);

                }

                return result;

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

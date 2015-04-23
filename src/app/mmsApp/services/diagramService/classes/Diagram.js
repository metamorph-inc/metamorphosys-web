/*globals angular*/

'use strict';

var EventDispatcher = require('../../../classes/EventDispatcher'),
    inserter = require('../../mmsUtils/classes/simpleInsert');

function sortComponentsByZ(components) {

    components.sort(function(a, b) {

        var result = 0;

        if (!isNaN(a.z) && !isNaN(b.z)) {
            result = a.z - b.z;
        }

        return result;

    });

}

function zDiffer(a, b) {
    return a.z - b.z;
}

function crossOverSorter(a, b) {
    return a.x - b.x;
}

var Diagram = function() {

    this._components = [];
    this._componentsById = {};
    this._wires = [];
    this._wiresById = {};
    this._wiresByComponentId = {};
    this._portsById = {};

    this._horizontalWireSegments = [];
    this._verticalWireSegmentsByLoY = {};
    this._wireCrossovers = [];

    this.config = {
        editable: true,
        disallowSelection: false,
        width: 5000,
        height: 5000
    };

    this.state = {
        selectedComponentIds: [],
        selectedWireIds: []
    };

    sortComponentsByZ(this._components);

};

Diagram.prototype.updateWireSegments = function(wire) {
    console.log('TODO: updateWireSegmentsForMe', wire);
};

Diagram.prototype.sortComponentsByZ = function() {
    sortComponentsByZ(this._components);
};

Diagram.prototype.addComponent = function(aDiagramComponent) {

    var i,
        port;

    if (angular.isObject(aDiagramComponent) && !angular.isDefined(this._componentsById[aDiagramComponent.id])) {

        this._componentsById[aDiagramComponent.id] = aDiagramComponent;

        inserter(aDiagramComponent, this._components, zDiffer);

        for (i = 0; i < aDiagramComponent.portInstances.length; i++) {

            port = aDiagramComponent.portInstances[i];
            this._portsById[port.id] = port;

        }
    }

};

Diagram.prototype.addWire = function(aWire) {

    var self = this,
        registerWireForEnds;

    registerWireForEnds = function(wire) {

        var componentId,
            end1 = wire.getEnd1(),
            end2 = wire.getEnd2();

        if (angular.isObject(end1.component) && angular.isObject(end2.component)) {

            componentId = end1.component.id;

            self._wiresByComponentId[componentId] = self._wiresByComponentId[componentId] || [];

            if (self._wiresByComponentId[componentId].indexOf(wire) === -1) {
                self._wiresByComponentId[componentId].push(wire);
            }

            componentId = end2.component.id;

            self._wiresByComponentId[componentId] = self._wiresByComponentId[componentId] || [];

            if (self._wiresByComponentId[componentId].indexOf(wire) === -1) {
                self._wiresByComponentId[componentId].push(wire);
            }

        }

    };

    if (aWire != null) {

        var wireId = aWire.getId();

        if (wireId != null) {

            if (!this._wiresById[wireId]) {

                this._wiresById[wireId] = aWire;
                this._wires.push(aWire);

                registerWireForEnds(aWire);

                this.afterWireChange([aWire]);


            } else {
                console.warn('Wire was already added.', wireId);
            }

        } else {
            console.error('Wire id is null!');
        }

    }

};

Diagram.prototype.deleteWireById = function(anId) {

    var wire,
        self,
        componentId,
        index;

    self = this;



    wire = self._wiresById[anId];

    if (angular.isObject(wire)) {

        componentId = wire.getEnd1().component.id;

        self._wiresByComponentId[componentId] = self._wiresByComponentId[componentId] || [];

        index = self._wiresByComponentId[componentId].indexOf(wire);

        if (index > -1) {
            self._wiresByComponentId[componentId].splice(index, 1);
        }

        componentId = wire.getEnd2().component.id;

        self._wiresByComponentId[componentId] = self._wiresByComponentId[componentId] || [];

        index = self._wiresByComponentId[componentId].indexOf(wire);

        if (index > -1) {
            self._wiresByComponentId[componentId].splice(index, 1);
        }

        index = self._wires.indexOf(wire);
        self._wires.splice(index, 1);

        delete self._wiresById[wire.getId()];

        this.afterWireChange([wire]);

    }

};

Diagram.prototype.deleteComponentById = function(anId) {

    var i,
        index,
        self,
        component;

    self = this;

    component = this._componentsById[anId];

    if (angular.isObject(component)) {


        angular.forEach(self._wiresByComponentId[component.id], function(wire) {
            self.deleteWireById(wire.getId());
        });

        index = self.state.selectedComponentIds.indexOf(component.id);

        if (index > -1) {
            self.state.selectedComponentIds.splice(index, 1);
        }

        index = self._components.indexOf(component);
        self._components.splice(index, 1);

        delete self._wiresByComponentId[component.id];
        delete self._componentsById[component.id];

        for (i = 0; i < component.portInstances.length; i++) {
            delete this._portsById[component.portInstances[i].id];
        }

        component = null;

        sortComponentsByZ(this._components);

    }

};

Diagram.prototype.deleteComponentOrWireById = function(anId) {

    var self,
        element,
        success;

    self = this;

    success = false;

    element = self._componentsById[anId];

    if (angular.isObject(element)) {

        this.deselectComponent(anId);

        self.deleteComponentById(anId);
        success = true;

    } else {

        element = self._wiresById[anId];

        if (angular.isObject(element)) {

            self.deleteWireById(anId);
            success = true;

        }

    }

    return success;

};


Diagram.prototype.getWiresForComponents = function(components) {

    var self = this,
        setOfWires = [];

    angular.forEach(components, function(component) {

        angular.forEach(self._wiresByComponentId[component.id], function(wire) {

            if (setOfWires.indexOf(wire) === -1) {
                setOfWires.push(wire);
            }
        });

    });

    return setOfWires;

};


Diagram.prototype.getWiresByComponentId = function(componentId) {

    return this._wiresByComponentId[componentId];

};

Diagram.prototype.getComponents = function() {
    return this._components;
};

Diagram.prototype.getWires = function() {
    return this._wires;
};

Diagram.prototype.updateWireSegments = function(wireId, newSegments) {

    var wire = this._wiresById[wireId];

    if (angular.isObject(wire)) {

        wire.makeSegmentsFromParameters(newSegments);

        this.afterWireChange([wire]);

    }

};

Diagram.prototype.updateComponentPosition = function(componentId, newPosition) {

    var self = this,
        component;

    component = self._componentsById[componentId];

    if (angular.isObject(component)) {

        component.setPosition(newPosition.x, newPosition.y, newPosition.z);

        this.afterWireChange(this._wiresByComponentId[componentId]);

    }

};


Diagram.prototype.updateComponentRotation = function(componentId, newRotation) {

    var self = this,
        component;

    component = self._componentsById[componentId];

    if (angular.isObject(component)) {

        component.setRotation(newRotation);

        this.afterWireChange(this._wiresByComponentId[componentId]);
    }

};

Diagram.prototype.isComponentSelected = function(component) {

    return this.state.selectedComponentIds.indexOf(component.id) > -1;

};


Diagram.prototype.getHighestZ = function() {

    var z,
        l;

    l = this._components.length;

    if (l) {
        z = this._components[l - 1].z;
    }

    if (isNaN(z)) {
        z = -1;
    }

    return z;

};

Diagram.prototype.getLowestZ = function() {

    var z,
        l;

    l = this._components.length;

    if (l) {
        z = this._components[0].z;
    }

    if (isNaN(z)) {
        z = -1;
    }

    return z;

};

Diagram.prototype.getComponentById = function(componentId) {

    return this._componentsById[componentId];

};


Diagram.prototype.getPortById = function(portId) {

    return this._portsById[portId];

};


Diagram.prototype.bringComponentToFront = function(componentId) {

    var component,
        z;

    component = this.getComponentById(componentId);

    if (component) {

        z = this.getHighestZ();
        component.z = z + 1;
    }

    sortComponentsByZ(this._components);

};

Diagram.prototype.bringComponentToBack = function(componentId) {

    var component,
        z;

    component = this.getComponentById(componentId);

    if (component) {

        z = this.getLowestZ();
        component.z = z - 1;
    }

    sortComponentsByZ(this._components);

};

Diagram.prototype.getSelectedComponents = function() {

    var self,
        selectedComponents;

    self = this;
    selectedComponents = [];

    angular.forEach(this.state.selectedComponentIds, function(componentId) {

        selectedComponents.push(self._componentsById[componentId]);

    });

    return selectedComponents;

};

Diagram.prototype.selectComponent = function(componentId) {

    var component = this.getComponentById(componentId),
        index;

    if (!this.config.disallowSelection !== true && component && component.nonSelectable !== true) {

        index = this.state.selectedComponentIds.indexOf(component.id);

        if (index === -1) {

            this.state.selectedComponentIds.push(componentId);

            this.dispatchEvent({
                type: 'selectionChange',
                message: this.state.selectedComponentIds
            });

        }

    }

};

Diagram.prototype.selectComponent = function(componentId) {

    var component = this.getComponentById(componentId),
        index;

    if (this.config.disallowSelection !== true && component && component.nonSelectable !== true) {

        index = this.state.selectedComponentIds.indexOf(component.id);

        if (index === -1) {

            this.state.selectedComponentIds.push(componentId);

            component.selected = true;

            this.dispatchEvent({
                type: 'selectionChange',
                message: this.state.selectedComponentIds
            });

        }

    }

};

Diagram.prototype.deselectComponent = function(componentId) {

    var component = this.getComponentById(componentId),
        index;

    if (this.config.disallowSelection !== true && component && component.nonSelectable !== true) {

        index = this.state.selectedComponentIds.indexOf(component.id);

        if (index > -1) {

            this.state.selectedComponentIds.splice(index, 1);

            component.selected = false;

            this.dispatchEvent({
                type: 'selectionChange',
                message: this.state.selectedComponentIds
            });

        }

    }

};

Diagram.prototype.clearSelection = function(silent) {

    var self = this;

    if (this.state.selectedComponentIds.length) {

        this.state.selectedComponentIds.forEach(function(cId) {

            var component = self.getComponentById(cId);

            component.selected = false;

        });

        this.state.selectedComponentIds = [];

        if (silent !== true) {

            this.dispatchEvent({
                type: 'selectionChange',
                message: this.state.selectedComponentIds
            });

            //this.emitWireChange();

        }

    }

};

Diagram.prototype._updateWireSegmentsIndex = function( /*wires*/ ) {

    var self = this,
        indexer = function() {

            var i, j, k,
                wl = self._wires.length,
                sl,
                wire,
                hSegment,
                vSegment,
                segments,
                segment,
                parameters,
                loVal,
                crossOversByX;

            self._horizontalWireSegments = [];
            self._verticalWireSegmentsByLoY = [{}];
            self._wireCrossovers = [];

            var startTime = Date.now();

            for (i = 0; i < wl; i++) {

                wire = self._wires[i];
                segments = wire.getSegments();

                sl = segments.length;

                for (j = 0; j < sl; j++) {

                    segment = segments[j];
                    parameters = segment.getParameters();

                    if (segment._crossOvers) { 
                        segment._crossOvers = null;
                        segment._crossOversTimeStamp = null;
                    }

                    if (parameters) {
                        
                        if (parameters.y1 === parameters.y2) {

                            // Horizontal

                            if (parameters.x2 - parameters.x1 > 0) {

                                segment._loX = parameters.x1;
                                segment._hiX = parameters.x2;

                                loVal = parameters.x1;

                            } else {

                                segment._loX = parameters.x2;
                                segment._hiX = parameters.x1;

                                loVal = parameters.x2;                                

                            }

                            // self._verticalWireSegmentsByLoY[loVal] =
                            //     self._verticalWireSegmentsByLoY[loVal] || [];
                            // self._verticalWireSegmentsByLoY[loVal].push(segment);

                            self._horizontalWireSegments.push(segment);


                        } else if (parameters.x1 === parameters.x2) {

                            if (parameters.y2 - parameters.y1 > 0) {

                                // Vertical

                                segment._loY = parameters.y1;
                                segment._hiY = parameters.y2;

                                loVal = parameters.y1;

                            } else {

                                segment._loY = parameters.y2;
                                segment._hiY = parameters.y1;

                                loVal = parameters.y2;                                

                            }

                            self._verticalWireSegmentsByLoY[loVal] =
                                self._verticalWireSegmentsByLoY[loVal] || [];
                            self._verticalWireSegmentsByLoY[loVal].push(segment);

                        }

                    }

                }

            }

            //console.log('horiozontal lines', self._verticalWireSegmentsByLoY);
            //console.log('vertical lines', self._horizontalWireSegments);

            for (i = 0; i < self._horizontalWireSegments.length; i++) {

                hSegment = self._horizontalWireSegments[i];
                crossOversByX = {};

                for (j in self._verticalWireSegmentsByLoY) {

                    if (j < hSegment._parameters.y1) {

                        segments = self._verticalWireSegmentsByLoY[j];

                        for (k = 0; k < segments.length; k++) {

                            vSegment = segments[k];

                            // console.log('Comparables:');
                            // console.log(hSegment._hiX, vSegment._parameters.x1);
                            // console.log(vSegment._loY, hSegment._parameters.y1);
                            // console.log(vSegment._hiY, hSegment._parameters.y1);

                            if (
                                vSegment._hiY > hSegment._parameters.y1 &&
                                hSegment._loX < vSegment._parameters.x1 &&
                                hSegment._hiX > vSegment._parameters.x1
                            ) {
                                self._wireCrossovers.push(hSegment, vSegment);
                                hSegment._crossOvers = hSegment._crossOvers || [];

                                if (!crossOversByX[vSegment._parameters.x1]) {
                                    
                                    hSegment._crossOvers.push({
                                        type: 'horizontal',
                                        crossingSegment: vSegment,
                                        x: vSegment._parameters.x1,
                                        y: hSegment._parameters.y1
                                    });

                                    crossOversByX[vSegment._parameters.x1] = true;

                                }

                                //hSegment._crossOversHash += vSegment._parameters.x1 + ',' + hSegment._parameters.y1;
                                //console.log(hSegment._crossOversHash);
                            }

                        }

                    }
                }

                if (Array.isArray(hSegment._crossOvers)) {
                    hSegment._crossOvers.sort(crossOverSorter);
                    hSegment._crossOversTimeStamp = Date.now().toString(); 
                }


            }

            //console.log('Crossing wires:', self._wireCrossovers);

            self._indexerTimeout = null;

            console.log('Time needed to index:', Date.now() - startTime);

            self.dispatchEvent({
                type: 'wireChange',
                message: null
            });

        };

    if (this._indexerTimeout) {
        clearTimeout(this._indexerTimeout);
        this._indexerTimeout = null;
    }

    this._indexerTimeout = setTimeout(indexer, 500);

};

Diagram.prototype.afterWireChange = function(wires) {

    this._updateWireSegmentsIndex(wires);

    this.dispatchEvent({
        type: 'wireChange',
        message: wires
    });

};

EventDispatcher.prototype.apply(Diagram.prototype);

module.exports = Diagram;

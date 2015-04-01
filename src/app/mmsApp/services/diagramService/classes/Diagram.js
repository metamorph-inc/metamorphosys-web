/*globals angular*/

'use strict';

var EventDispatcher = require('../../../classes/EventDispatcher');

var Diagram = function() {

    this._components = [];
    this._componentsById = {};
    this._wires = [];
    this._wiresById = {};
    this._wiresByComponentId = {};
    this._portsById = {};

    this.config = {
        editable: true,
        disallowSelection: false,
        width: 5000,
        height: 5000
    };

    this.state = {
        selectedComponentIds: []
    };

    sortComponentsByZ(this._components);

};


function sortComponentsByZ(components) {

    components.sort(function(a, b) {

        var result = 0;

        if (!isNaN(a.z) && !isNaN(b.z)) {
            result = a.z - b.z;
        }

        return result;

    });

}


Diagram.prototype.addComponent = function(aDiagramComponent) {

    var i,
        port;

    if (angular.isObject(aDiagramComponent) && !angular.isDefined(this._componentsById[aDiagramComponent.id])) {

        this._componentsById[aDiagramComponent.id] = aDiagramComponent;
        this._components.push(aDiagramComponent);

        for (i = 0; i < aDiagramComponent.portInstances.length; i++) {

            port = aDiagramComponent.portInstances[i];
            this._portsById[port.id] = port;

        }

        sortComponentsByZ(this._components);
    }

};

Diagram.prototype.addWire = function(aWire) {

    var self = this,
        registerWireForEnds;

    registerWireForEnds = function(wire) {

        var componentId;

        if (angular.isObject(wire.end1.component) && angular.isObject(wire.end2.component)) {

            componentId = wire.end1.component.id;

            self._wiresByComponentId[componentId] = self._wiresByComponentId[componentId] || [];

            if (self._wiresByComponentId[componentId].indexOf(wire) === -1) {
                self._wiresByComponentId[componentId].push(wire);
            }

            componentId = wire.end2.component.id;

            self._wiresByComponentId[componentId] = self._wiresByComponentId[componentId] || [];

            if (self._wiresByComponentId[componentId].indexOf(wire) === -1) {
                self._wiresByComponentId[componentId].push(wire);
            }

        }

    };


    if (angular.isObject(aWire) && !angular.isDefined(this._wiresById[aWire.id])) {

        this._wiresById[aWire.id] = aWire;
        this._wires.push(aWire);

        registerWireForEnds(aWire);

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

        componentId = wire.end1.component.id;

        self._wiresByComponentId[componentId] = self._wiresByComponentId[componentId] || [];

        index = self._wiresByComponentId[componentId].indexOf(wire);

        if (index > -1) {
            self._wiresByComponentId[componentId].splice(index, 1);
        }

        componentId = wire.end2.component.id;

        self._wiresByComponentId[componentId] = self._wiresByComponentId[componentId] || [];

        index = self._wiresByComponentId[componentId].indexOf(wire);

        if (index > -1) {
            self._wiresByComponentId[componentId].splice(index, 1);
        }

        index = self._wires.indexOf(wire);
        self._wires.splice(index, 1);

        delete self._wiresById[wire.id];

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
            self.deleteWireById(wire.id);
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

        self.deleteComponentById(element.id);
        success = true;

    } else {

        element = self._wiresById[anId];

        if (angular.isObject(element)) {

            self.deleteWireById(element.id);
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

        wire.segments = newSegments;

    }

};

Diagram.prototype.updateComponentPosition = function(componentId, newPosition) {

    var self = this,
        component;

    component = self._componentsById[componentId];

    if (angular.isObject(component)) {

        component.setPosition(newPosition.x, newPosition.y);

    }

};


Diagram.prototype.updateComponentRotation = function(componentId, newRotation) {

    var self = this,
        component;

    component = self._componentsById[componentId];

    if (angular.isObject(component)) {

        component.setRotation(newRotation);

    }

};

Diagram.prototype.isComponentSelected = function(component) {

    return this.state.selectedComponentIds.indexOf(component.id) > -1;

};


Diagram.prototype.getHighestZ = function() {

    var i,
        component,
        z;

    for (i = 0; i < this._components.length; i++) {

        component = this._components[i];

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

    return z;

};

Diagram.prototype.getLowestZ = function() {

    var i,
        component,
        z;

    for (i = 0; i < this._components.length; i++) {

        component = this._components[i];

        if (!isNaN(component.z)) {

            if (isNaN(z)) {
                z = component.z;
            } else {

                if (z > component.z) {
                    z = component.z;
                }

            }

        }
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

        }

    }

};

EventDispatcher.prototype.apply(Diagram.prototype);

module.exports = Diagram;

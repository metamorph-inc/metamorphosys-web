/*globals angular*/

'use strict';

(function(){

var Diagram = function(descriptor) {

    angular.extend(this, descriptor);

    this.components = [];
    this.componentsById = {};
    this.wires = [];
    this.wiresById = {};
    this.wiresByComponentId = {};
    this.portsById = {};

    this.config = {
        editable: true,
        disallowSelection: false,
        width: 5000,
        height: 5000
    };

    this.state = {
        selectedComponentIds: []
    };

    sortComponentsByZ(this.components);

};


function sortComponentsByZ(components) {

    components.sort(function(a, b){

        var result = 0;

        if (!isNaN(a.z) && !isNaN(b.z)) {
            result = a.z - b.z;
        }

        return result;

    });

};


Diagram.prototype.addComponent = function(aDiagramComponent) {

    var i,
        port;

    if (angular.isObject(aDiagramComponent) && !angular.isDefined(this.componentsById[aDiagramComponent.id])) {

        this.componentsById[aDiagramComponent.id] = aDiagramComponent;
        this.components.push(aDiagramComponent);

        for (i = 0; i < aDiagramComponent.portInstances.length; i++) {

            port = aDiagramComponent.portInstances[i];
            this.portsById[port.id] = port;

        }

        sortComponentsByZ(this.components);        
    }

};

Diagram.prototype.addWire = function(aWire) {

    var self = this,
        registerWireForEnds;

    registerWireForEnds = function(wire) {

        var componentId;

        if (angular.isObject(wire.end1.component) && angular.isObject(wire.end2.component)) {

            componentId = wire.end1.component.id;

            self.wiresByComponentId[componentId] = self.wiresByComponentId[componentId] || [];

            if (self.wiresByComponentId[componentId].indexOf(wire) === -1) {
                self.wiresByComponentId[componentId].push(wire);
            }

            componentId = wire.end2.component.id;

            self.wiresByComponentId[componentId] = self.wiresByComponentId[componentId] || [];

            if (self.wiresByComponentId[componentId].indexOf(wire) === -1) {
                self.wiresByComponentId[componentId].push(wire);
            }

        }

    };


    if (angular.isObject(aWire) && !angular.isDefined(this.wiresById[aWire.id])) {

        this.wiresById[aWire.id] = aWire;
        this.wires.push(aWire);

        registerWireForEnds(aWire);

    }

};

Diagram.prototype.deleteWireById = function(anId) {

    var wire,
        self,
        componentId,
        index;

    self = this;

    wire = self.wiresById[anId];

    if (angular.isObject(wire)) {

        componentId = wire.end1.component.id;

        self.wiresByComponentId[componentId] = self.wiresByComponentId[componentId] || [];

        index = self.wiresByComponentId[componentId].indexOf(wire);

        if (index > -1) {
            self.wiresByComponentId[componentId].splice(index, 1);
        }

        componentId = wire.end2.component.id;

        self.wiresByComponentId[componentId] = self.wiresByComponentId[componentId] || [];

        index = self.wiresByComponentId[componentId].indexOf(wire);

        if (index > -1) {
            self.wiresByComponentId[componentId].splice(index, 1);
        }

        index = self.wires.indexOf(wire);
        self.wires.splice(index, 1);

        delete self.wiresById[wire.id];

    }

};

Diagram.prototype.deleteComponentById = function(anId) {

    var i,
        index,
        self,
        component;

    self = this;

    component = this.componentsById[anId];

    if (angular.isObject(component)) {


        angular.forEach(self.wiresByComponentId[component.id], function(wire) {
            self.deleteWireById(wire.id);
        });

        index = self.state.selectedComponentIds.indexOf(component.id);

        if (index > -1) {
            self.state.selectedComponentIds.splice(index, 1);
        }

        index = self.components.indexOf(component);
        self.components.splice(index, 1);

        delete self.wiresByComponentId[component.id];
        delete self.componentsById[component.id];

        for (i = 0; i < component.portInstances.length; i++) {
            delete this.portsById[component.portInstances[i].id];
        }

        component = null;

        sortComponentsByZ(this.components);        

    }

};

Diagram.prototype.deleteComponentOrWireById = function(anId) {

    var self,
        element,
        success;

    self = this;

    success = false;

    element = self.componentsById[anId];

    if (angular.isObject(element)) {

        self.deleteComponentById(element.id);
        success = true;

    } else {

        element = self.wiresById[anId];

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

        angular.forEach(self.wiresByComponentId[component.id], function(wire) {

            if (setOfWires.indexOf(wire) === -1) {
                setOfWires.push(wire);
            }
        });

    });

    return setOfWires;

};

Diagram.prototype.updateComponentPosition = function(componentId, newPosition) {

    var self = this,
        component;

    component = self.componentsById[componentId];

    if (angular.isObject(component)) {

        component.setPosition(newPosition.x, newPosition.y);

    }

};

Diagram.prototype.updateComponentRotation = function(componentId, newRotation) {

    var self = this,
        component;

    component = self.componentsById[componentId];

    if (angular.isObject(component)) {

        component.setRotation(newRotation);

    }

};

Diagram.prototype.isComponentSelected = function(component) {

    return this.state.selectedComponentIds.indexOf(component.id) > -1;

};

Diagram.prototype.getSelectedComponents = function() {

    var self,
        selectedComponents;

    self = this;
    selectedComponents = [];

    angular.forEach(this.state.selectedComponentIds, function(componentId) {

        selectedComponents.push(self.componentsById[componentId]);

    });

    return selectedComponents;

};

Diagram.prototype.getHighestZ = function() {

    var i,
        component,
        z;

    for (i = 0; i < this.components.length; i++) {

        component = this.components[i];

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

    for (i = 0; i < this.components.length; i++) {

        component = this.components[i];

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

    return this.componentsById[componentId];

};


Diagram.prototype.bringComponentToFront = function(componentId) {

    var component,
        z;

    component = this.getComponentById(componentId);

    if (component) {

        z = this.getHighestZ();
        component.z = z + 1;
    }

    sortComponentsByZ(this.components);

};

Diagram.prototype.bringComponentToBack = function(componentId) {

    var component,
        z;

    component = this.getComponentById(componentId);

    if (component) {

        z = this.getLowestZ();
        component.z = z - 1;
    }

    sortComponentsByZ(this.components);

};

module.exports = Diagram;

})();
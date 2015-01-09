/*globals angular*/

'use strict';

var Diagram = function (descriptor) {

    angular.extend(this, descriptor);

    this.components = [];
    this.componentsById = {};
    this.wires = [];
    this.wiresById = {};
    this.wiresByComponentId = {};

    this.config = {
        editable: true,
        disallowSelection: false,
        width: 5000,
        height: 5000
    };

    this.state = {
        selectedComponentIds: []
    };

};

Diagram.prototype.addComponent = function (aDiagramComponent) {

    if (angular.isObject(aDiagramComponent) && !angular.isDefined(this.componentsById[aDiagramComponent.id])) {

        this.componentsById[aDiagramComponent.id] = aDiagramComponent;
        this.components.push(aDiagramComponent);

    }

};

Diagram.prototype.addWire = function (aWire) {

    var self=this,
        registerWireForEnds;

    registerWireForEnds = function (wire) {

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

        if (index >  -1) {
            self.wiresByComponentId[componentId].splice(index,1);
        }

        componentId = wire.end2.component.id;

        self.wiresByComponentId[componentId] = self.wiresByComponentId[componentId] || [];

        index = self.wiresByComponentId[componentId].indexOf(wire);

        if (index >  -1) {
            self.wiresByComponentId[componentId].splice(index,1);
        }

        index = self.wires.indexOf(wire);
        self.wires.splice(index, 1);

        delete self.wiresById[wire.id];

    }

};

Diagram.prototype.deleteComponentOrWireById = function(anId) {

    var self,
        element,
        success,
        index,

        deleteAComponent;

    self = this;

    success = false;

    element = self.componentsById[anId];

    deleteAComponent = function(component) {

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
        component = null;

    };

    if (angular.isObject(element)) {

        deleteAComponent(element);
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


Diagram.prototype.getWiresForComponents = function (components) {

    var self = this,
        setOfWires = [];

    angular.forEach(components, function (component) {

        angular.forEach(self.wiresByComponentId[component.id], function (wire) {

            if (setOfWires.indexOf(wire) === -1) {
                setOfWires.push(wire);
            }
        });

    });

    return setOfWires;

};

Diagram.prototype.updateComponentPosition = function (componentId, newPosition) {

    var self = this,
        component;

        component = self.componentsById[componentId];

        if (angular.isObject(component)) {

            component.setPosition(newPosition.x, newPosition.y);

        }

};

Diagram.prototype.updateComponentRotation = function (componentId, newRotation) {

    var self = this,
        component;

    component = self.componentsById[componentId];

    if (angular.isObject(component)) {

        component.setRotation(newRotation);

    }

};


module.exports = Diagram;

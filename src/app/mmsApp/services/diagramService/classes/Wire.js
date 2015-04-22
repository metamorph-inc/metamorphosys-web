/*globals angular*/

'use strict';

var WireSegment = require('./WireSegment.js');

var Wire = function(id, end1, end2, segments) {

    this._id = id;
    this._end1 = end1;
    this._end2 = end2;
    this._segments = segments || [];

};

Wire.prototype.getId = function() {
    return this._id;
};

Wire.prototype.setId = function(id) {
    this._id = id;
};

Wire.prototype.getEnd1 = function() {
	return this._end1;
};

Wire.prototype.getEnd2 = function() {
	return this._end2;
};

Wire.prototype.getSegments = function() {
    return this._segments;
};

Wire.prototype.getCopyOfSegmentsParameters = function() {
        
    var i, l,
        results = [];

    if (Array.isArray(this._segments)) {

        l = this._segments.length;

        for (i = 0; i < l; i++) {
            results.push(angular.copy(this._segments[i].getParameters()));
        }

    }

    return results;

};

Wire.prototype.makeSegmentsFromParameters = function(parametersArray) {

    var self = this;

    this.removeSegments();    

    if (Array.isArray(parametersArray)) {

        this._segments = parametersArray.map(function(parameters){
            
            return new WireSegment(parameters, self);

        });

    }

};

Wire.prototype.removeSegments = function() {
    this._segments = [];
};

Wire.prototype.appendSegmentsFromParameters = function(parametersArray) {
    
    var i,
        segment;

    for (i = 0; i < parametersArray.length; i++) {

        segment = new WireSegment(parametersArray[i], this);
        this._segments.push(segment);

    }

};

Wire.prototype.prependSegmentsFromParameters = function(parametersArray) {
    
    var i,
        segment;

    for (i = parametersArray.length - 1; i >= 0; i--) {

        segment = new WireSegment(parametersArray[i], this);
        this._segments.unshift(segment);

    }

};

// Wire.prototype.appendSegments = function() {

//     var i,
//         segment;

//     for (i = 0; i < arguments.length; i++) {

//         segment = arguments[i];

//         segment.setParentWire(this);
//         this._segments.push(segment);

//     }

// };

// Wire.prototype.prependSegments = function() {

//     var i,
//         segment;

//     for (i = 0; i < arguments.length; i++) {

//         segment = arguments[i];
        
//         segment.setParentWire(this);
//         this._segments.unShift(segment);

//     }

// };

Wire.prototype.replaceSegments = function(startPosition, setOfSegments) {

    var i,
        segment,
        l = this._segments.length;


    for (i = 0; i < setOfSegments.length; i++) {

        segment = setOfSegments[i];

        segment.setParentWire(this);
        this._segments[Math.min(l, startPosition + i)] = segment;

    }

};

Wire.prototype.replaceSegmentsFromPropertiesArray = function(startPosition, propertiesArray) {

    var i,
        l = this._segments.length;

    for (i = 0; i < propertiesArray.length; i++) {

        this._segments[Math.min(l, startPosition + i)] = new WireSegment(propertiesArray[i], this);

    }

};

Wire.prototype.replaceSegmentFromProperties = function(atPosition, properties) {

    this._segments[atPosition] = new WireSegment(properties, this);

};

Wire.prototype.deleteSegment = function(atPosition) {

    this._segments.splice(atPosition, 1);

};

Wire.prototype.insertSegment = function(atPosition, segment) {

    segment.setParentWire(this);
    this._segments.splice(atPosition, 0, segment);

};

Wire.prototype.isInViewPort = function(viewPort, padding) {

    var j,
        shouldBeVisible = false,
        l;

    padding = padding || {
        x: 0,
        y: 0
    };

    shouldBeVisible = false;

    if (Array.isArray(this._segments)) {

        l = this._segments.length;

        for (j = 0; j < l && !shouldBeVisible; j++) {

            shouldBeVisible = this._segments[j].isInViewPort(viewPort, padding);

        }

    }

    return shouldBeVisible;

};

Wire.prototype.getEndPositions = function() {

    var port1Position,
        port2Position,
        positions;

    port1Position = this._end1.port.getGridPosition();
    port2Position = this._end2.port.getGridPosition();

    if (port1Position && port2Position) {

        positions = {

            end1: port1Position,
            end2: port2Position

        };

    }

    return positions;

};

module.exports = Wire;

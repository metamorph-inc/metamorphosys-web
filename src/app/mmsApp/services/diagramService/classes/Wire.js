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

Wire.prototype.translateSegments = function(translation) {

    var i, 
        l,
        newSegments = [];

    this.makeSegmentsFromParameters(this.getCopyOfSegmentsParameters());

    if (Array.isArray(this._segments)) {

        l = this._segments.length;

        for (i = 0; i < l; i++) {

            this._segments[i].translate(translation);
        }

    }

};

Wire.prototype.translateSegmentEndCorner = function(index, translation) {

    var newSegments = [];

    if (index > -1 && Array.isArray(this._segments)) {

        this.makeSegmentsFromParameters(this.getCopyOfSegmentsParameters());

        this._segments[index].translateEnd2(translation);
        this._segments[Number(index) + 1].translateEnd1(translation);        

    }


};

Wire.prototype.getCopyOfSegmentsParameters = function(stripEndcornerSelected) {

    var i, l,
        results = [],
        paramsCopy;

    if (Array.isArray(this._segments)) {

        l = this._segments.length;

        for (i = 0; i < l; i++) {

            paramsCopy = angular.copy(this._segments[i].getParameters());

            if (stripEndcornerSelected) {
                paramsCopy.endCornerSelected = false;
            }

            results.push(paramsCopy);

        }

    }

    return results;

};

Wire.prototype.makeSegmentsFromParameters = function(parametersArray, selectedSegments, useOldId) {

    var self = this;

    this.removeSegments();

    if (Array.isArray(parametersArray)) {

        this._segments = parametersArray.map(function(parameters) {

            return new WireSegment(parameters, self, useOldId);

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

Wire.prototype.appendSegmentFromParameters = function(parameters) {

    var i,
        segment;

    segment = new WireSegment(parameters, this);
    this._segments.push(segment);

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

Wire.prototype.replaceSegmentsFromParametersArray = function(startPosition, parametersArray) {

    var i,
        l = this._segments.length;

    for (i = 0; i < parametersArray.length; i++) {

        var segment = new WireSegment(parametersArray[i], this, true);

        segment._parameters._id = parametersArray[i]._id;

        this._segments[Math.min(l, startPosition + i)] = segment;

    }

};

Wire.prototype.replaceSegmentsFromParametersArrayById = function(startPosition, parametersArray) {

    var i,
        l = this._segments.length;

    for (i = 0; i < parametersArray.length; i++) {

        var segment = new WireSegment(parametersArray[i], this, true);

        segment._parameters._id = parametersArray[i]._id;

        this._segments[Math.min(l, startPosition + i)] = segment;

    }

};

Wire.prototype.replaceSegmentFromProperties = function(atPosition, properties) {

    var segment = new WireSegment(properties, this, true);

    segment._parameters._id = properties._id;

    this._segments[atPosition] = segment;

};

Wire.prototype.deleteSegment = function(atPosition, keepIndex) {

    this._segments.splice(atPosition, 1);    

};

Wire.prototype.deleteSegmentById = function(id) {

    var found = false,
        idx = this._segments.map( function(x) {
            return x._parameters._id;
        }).indexOf(id);

    if ( idx > -1 ) {
        this._segments.splice(idx, 1);
        found = true; 
    }

    return found;

};

Wire.prototype.getSegmentById = function(id) {

    var idx = this._segments.map( function(x) {
                return x._parameters._id;
          }).indexOf(id);

    return this._segments[idx];

}

Wire.prototype.insertSegment = function(atPosition, segment) {

    segment.setParentWire(this);
    this._segments.splice(atPosition, 0, segment);

};

Wire.prototype.isInViewport = function(viewPort, padding) {

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

            shouldBeVisible = this._segments[j].isInViewport(viewPort, padding);

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

Wire.prototype.getEnds = function() {
    return {
        end1: this._end1,
        end2: this._end2
    };
};

Wire.prototype.destroyEndCornerOfSegment = function(segment, wiringService) {

    var sIndex,
        nextSegment,
        affectedSegmentParameters,
        wire = this,
        segments = wire.getSegments();

    sIndex = segments.indexOf(segment);

    nextSegment = segments[sIndex + 1];

    var parameters = segment.getParameters();
    var nextParameters = nextSegment.getParameters();

    // wire.deleteSegment(sIndex);
    var found = wire.deleteSegmentById(segment._parameters._id);

    if ( found ) {

        var newSegments = wiringService.getSegmentsBetweenPositions({
            end1: {
                x: parameters.x1,
                y: parameters.y1
            },
            end2: {
                x: nextParameters.x2,
                y: nextParameters.y2
            }
        }, 'SimpleRouter');

        wire.replaceSegmentsFromParametersArray(
            sIndex,
            newSegments
        );

        if (sIndex > 0 &&
            parameters.router &&
            parameters.router.type === 'ElbowRouter' &&
            parameters.elbowPartOrder === 1) {

            // If it was part of an Elbow routed segment set, set the other part to
            // simple-routed

            affectedSegmentParameters = segments[sIndex - 1].getParameters();
            affectedSegmentParameters.router = {
                type: 'SimpleRouter'
            };

            delete affectedSegmentParameters.elbowPartOrder;

        }


        if (sIndex + 1 < segments.length &&
            nextParameters.router &&
            nextParameters.router.type === 'ElbowRouter' &&
            nextParameters.elbowPartOrder === 0) {

            // If it was part of an Elbow routed segment set, set the other part to
            // simple-routed

            affectedSegmentParameters = segments[sIndex + 1].getParameters();
            affectedSegmentParameters.router = {
                type: 'SimpleRouter'
            };

            delete affectedSegmentParameters.elbowPartOrder;

        }

    }

};

Wire.prototype.splitSegmentWithNewCorner = function(segment, offsetToMouse, wiringService, gridService) {
    var sIndex,
        newSegmentParameters1,
        newSegmentParameters2,
        newPosition,
        segmentParameters,
        nextParameters,
        wire = this,
        segments = wire.getSegments(),
        affectedSegmentParameters;

    sIndex = segments.indexOf(segment);

    newPosition = offsetToMouse;

    segmentParameters = segment.getParameters();

    newPosition = gridService.getSnappedPosition(newPosition);

    newSegmentParameters1 = wiringService.getSegmentsBetweenPositions({
        end1: {
            x: segmentParameters.x1,
            y: segmentParameters.y1
        },

        end2: {
            x: newPosition.x,
            y: newPosition.y
        }
    }, 'SimpleRouter')[0];


    newSegmentParameters2 = wiringService.getSegmentsBetweenPositions({
        end1: {
            x: newPosition.x,
            y: newPosition.y
        },

        end2: {
            x: segmentParameters.x2,
            y: segmentParameters.y2
        }
    }, 'SimpleRouter')[0];

    wire.deleteSegment(sIndex);
    wire.insertSegment(sIndex, new WireSegment(newSegmentParameters1, wire));
    wire.insertSegment(sIndex + 1, new WireSegment(newSegmentParameters2, wire));

    if (sIndex > 0 &&
        segmentParameters.router &&
        segmentParameters.router.type === 'ElbowRouter' &&
        segmentParameters.elbowPartOrder === 1) {

        // If it was part of an Elbow routed segment set, set the other part to
        // simple-routed

        affectedSegmentParameters = segments[sIndex - 1].getParameters();
        affectedSegmentParameters.router = {
            type: 'SimpleRouter'
        };

        delete affectedSegmentParameters.elbowPartOrder;

    }


    nextParameters = segments[sIndex + 2];

    if (sIndex + 2 < segments.length &&
        nextParameters.router &&
        nextParameters.router.type === 'ElbowRouter' &&
        nextParameters.elbowPartOrder === 0) {

        // If it was part of an Elbow routed segment set, set the other part to
        // simple-routed

        affectedSegmentParameters = segments[sIndex + 2].getParameters();
        affectedSegmentParameters.router = {
            type: 'SimpleRouter'
        };

        delete affectedSegmentParameters.elbowPartOrder;

    }

};

module.exports = Wire;

/*globals angular*/

'use strict';

var WireSegment = require('./WireSegment.js');

var Wire = function(id, end1, end2, router, segments) {

    this.id = id;
    this._end1 = end1;
    this._end2 = end2;
    this._router = router;
    this.setSegments(segments);

};

Wire.prototype.getEnd1 = function() {
	return this._end1;
};

Wire.prototype.getEnd2 = function() {
	return this._end2;
};

Wire.prototype.setSegments = function(segments) {

    var i, l,
        segment;

    this._segments = null;

    if (Array.isArray(segments)) {

        this._segments = [];

        l = segments.length;

        for (i = 0; i < l; i++) {

            segment = segments[i];

            WireSegment.prototype.apply(segment);
            segment.setParentWire(this);

        }

        this._segments = segments;

        console.log('Segments:', this._segments);

    }

};

Wire.prototype.getSegments = function() {
    return this._segments;
};

Wire.prototype.isInViewPort = function(viewPort, padding) {

    var j,
        shouldBeVisible,
        segment,
        l;

    padding = padding || {
        x: 0,
        y: 0
    };

    shouldBeVisible = false;

    if (this._router && this._router.type === 'ElbowRouter') {

        if (Array.isArray(this._segments)) {

            l = this._segments.length;

            for (j = 0; j < l && !shouldBeVisible; j++) {

                segment = this._segments[j];

                if (segment.orientation === 'vertical') {

                    if (segment.x1 >= (viewPort.left + padding.x) &&
                        segment.x1 <= (viewPort.right - padding.x)) {
                        shouldBeVisible = true;
                    }

                } else {

                    if (segment.y1 >= (viewPort.top + padding.y) &&
                        segment.y1 <= (viewPort.bottom - padding.y)) {
                        shouldBeVisible = true;
                    }

                }

            }

        }

    } else {
        shouldBeVisible = true;
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

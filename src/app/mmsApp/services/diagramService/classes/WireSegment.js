/*globals angular*/

'use strict';

var WireSegment = function(parameters, parentWire) {

	this._parameters = parameters;
	this._parentWire = parentWire;
	
};

WireSegment.prototype.setParentWire = function ( parentWire ) {
	this._parentWire = parentWire;
};

WireSegment.prototype.getParentWire = function() {
	return this._parentWire;
};

WireSegment.prototype.getParameters = function() {
	return this._parameters;
};

WireSegment.prototype.setParameters = function() {
	return this._parameters;
};

WireSegment.prototype.isInViewPort = function(viewPort, padding) {

	var result = true;

    if (this._parameters.orientation === 'vertical') {

        if (this._parameters.x1 >= (viewPort.left + padding.x) &&
            this._parameters.x1 <= (viewPort.right - padding.x)) {

            result = true;

        } else {
			result = false;
        }

    } else {

        if (this._parameters.y1 >= (viewPort.top + padding.y) &&
            this._parameters.y1 <= (viewPort.bottom - padding.y)) {

            result = true;

        } else {
	      	result = false;
        }

    }

    return result;

};

module.exports = WireSegment;
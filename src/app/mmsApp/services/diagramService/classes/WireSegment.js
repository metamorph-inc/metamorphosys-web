/*globals angular*/

'use strict';

var WireSegment = function(parameters, parentWire) {

	this._parameters = parameters;
	this._parentWire = parentWire;

    this._endCornerSelected = false;
	
};

WireSegment.prototype.translate = function(translation) {

    this.translateEnd1(translation);
    this.translateEnd2(translation);

};

WireSegment.prototype.translateEnd1 = function(translation) {

    this._parameters.x1 += translation.x;
    this._parameters.y1 += translation.y;
};

WireSegment.prototype.translateEnd2 = function(translation) {

    this._parameters.x2 += translation.x;
    this._parameters.y2 += translation.y;
};

WireSegment.prototype.selectEndCorner = function() {
    this._endCornerSelected = true;
};

WireSegment.prototype.deselectEndCorner = function() {
    this._endCornerSelected = false;
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

WireSegment.prototype.isInViewport = function(viewPort, padding) {

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

WireSegment.prototype.isEndCornerInViewport = function(viewPort, padding) {

    var result = false;

    if (this._parameters.x2 >= (viewPort.left + padding.x) && 
        this._parameters.x2 <= (viewPort.right - padding.x) &&
        this._parameters.y2 >= (viewPort.top + padding.y) &&
        this._parameters.y2 <= (viewPort.bottom - padding.y) ) {
            result = true;
        }

    return result;

};

module.exports = WireSegment;
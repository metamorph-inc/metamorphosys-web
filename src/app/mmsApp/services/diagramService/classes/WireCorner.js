/*globals angular*/

'use strict';

var WireCorner = function(x, y, parentWireSegment) {

	this._x = x;
	this._y = y;
	this._parentWireSegment = parentWireSegment;
	this._selected = false;

};

WireCorner.prototype.setParentWireSegment = function(parentWireSegment) {
	this._parentWireSegment = parentWireSegment;
};

WireCorner.prototype.getParentWireSegment = function() {
	return this._parentWireSegment;
};

WireCorner.prototype.select = function() {
	this._selected = true;
};

WireCorner.prototype.deSelect = function() {
	this._selected = false;
};
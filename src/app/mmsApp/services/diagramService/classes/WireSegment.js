/*globals angular*/

'use strict';

var WireSegment = function() {};

WireSegment.prototype.apply = function ( object ) {

	object.setParentWire = WireSegment.prototype.setParentWire;
	object.getParentWire = WireSegment.prototype.getParentWire;

};

WireSegment.prototype.setParentWire = function ( parentWire ) {
	this._parentWire = parentWire;
};

WireSegment.prototype.getParentWire = function() {
	return this._parentWire;
};

module.exports = WireSegment;
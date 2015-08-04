/*globals angular*/

'use strict';

module.exports = function() {
    var self = this,
        ensureNoLockedWires;

    ensureNoLockedWires = function (diagram, component) {

        var wires = diagram.getWiresByComponentId(component.id);

        return wires.every( function(wire) {
            return !wire.isWireLocked();
        });

    };

    this.ensureNoLockedWires = ensureNoLockedWires;

    return this;

}
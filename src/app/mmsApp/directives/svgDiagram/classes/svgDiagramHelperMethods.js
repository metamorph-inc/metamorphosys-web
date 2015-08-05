/*globals angular*/

'use strict';

module.exports = function() {
    var self = this,
        ensureNoLockedWires;

    ensureNoLockedWires = function (diagram, component) {

        var wires = diagram.getWiresByComponentId(component.id);

        if (wires) {
            return wires.every( function(wire) {
                return !wire.isWireLocked();
            });
        }

        return true;
    };

    this.ensureNoLockedWires = ensureNoLockedWires;

    return this;

}
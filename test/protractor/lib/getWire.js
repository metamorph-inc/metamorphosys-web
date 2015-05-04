/**
 * Created by robertboyles on 5/4/15.
 */

/*globals by*/

'use strict';

// Add the custom locator.
by.addLocator('getWire',

    function (optParentElement) {

        var using = optParentElement || document,

            wires = using.querySelectorAll('g.component-wire-segment .component-wire-segment-segment');

        // Return an array of components with the text.
        return wires[0];
    });

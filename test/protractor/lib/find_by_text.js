/*globals by*/

'use strict';

// Add the custom locator.
by.addLocator('diagramComponentLabel',

    function (labelText, optParentElement) {

        var using = optParentElement || document,

            componentBoxes = using.querySelectorAll('g.component-container .symbol.box');

        // Return an array of buttons with the text.
        return Array.prototype.filter.call(componentBoxes, function (box) {

            var label;

            label = box.querySelector('.component-label');

            return label && label.textContent === labelText;
        });
    });

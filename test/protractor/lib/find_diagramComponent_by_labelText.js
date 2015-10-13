/*globals by*/

'use strict';

// Add the custom locator.
by.addLocator('diagramComponentLabel',

    function (labelText, optParentElement) {

        var using = optParentElement || document,

            componentBoxes = using.querySelectorAll('g.component-container .symbol');

        // Return an array of components with the text.
        return Array.prototype.filter.call(componentBoxes, function (box) {

            var label;

            label = box.querySelector('.component-label');

             // n.b. componentSymbol may truncate the label
             // n.b. component browser may uppercase first letter
            return label && label.textContent.substr(0, 20).toLowerCase() === labelText.substr(0, 20).toLowerCase();
        });
    });

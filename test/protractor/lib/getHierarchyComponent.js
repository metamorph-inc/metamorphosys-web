/*globals by*/

'use strict';

// Add the custom locator.
by.addLocator('getHierarchyByVisibleDropdownLabel',

    function (labelText, optParentElement) {

        var using = optParentElement || document,

            hierarchyLabels = using.querySelectorAll('span.item-label.ng-binding');

        // Return an array of components with the text.
        return Array.prototype.filter.call(hierarchyLabels, function (hierarchy) {

            var label;

            label = hierarchy;

            return label && label.textContent === labelText;
        });
    });

/**
 * Levels of hierarchy that are visible once the mouse moves over one of the 
 * hierarchies which are exposed in the header.
 */
by.addLocator('getHierarchyByHiddenDropdownLabel',

    function (labelText, optParentElement) {

        var using = optParentElement || document,

            hierarchyLabels = using.querySelectorAll('ul.menu-contents.ng-scope li a');

        // Return an array of components with the text.
        return Array.prototype.filter.call(hierarchyLabels, function (hierarchy) {

            var label;

            label = hierarchy;

            return label && label.textContent.trim(" ") === labelText;
        });
    });

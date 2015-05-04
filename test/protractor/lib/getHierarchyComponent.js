/**
 * Created by robertboyles on 5/1/15.
 */

/*globals by*/

'use strict';

// Add the custom locator.
by.addLocator('getHierarchy',

    function () {

        var hierarchyItems = document.querySelectorAll('span.item-label.ng-binding');

        //    hierarchy = {
        //        levels: hierarchyItems.length,
        //        string: ""
        //    },
        //
        //    i;
        //
        //for (i = 1; i < hierarchy.levels; i++) {
        //
        //    hierarchy.string += "/" + hierarchyItems[i];
        //
        //}

        return Array.prototype.filter.call(hierarchyItems, function (hierarchy) {

            var label;

            label = hierarchy;

            return label && label.TextContent !== "";
        });

    });


by.addLocator('getVisibleHierarchyComponent_by_labelText',

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


by.addLocator('getHiddenHierarchyComponent_by_labelText',

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

/*global browser,by,element, $, angular, protractor*/

'use strict';

module.exports = {
    getHierarchy: function () {

        var hierarchyItems = document.querySelectorAll('span.item-label.ng-binding'),

            hierarchy = {
                levels: hierarchyItems.length,
                string: ""
            },

            i;

        for (i = 1; i < hierarchy.levels; i++) {

            hierarchy.string += "/" + hierarchyItems[i];

        }

        return hierarchy;

    }

};

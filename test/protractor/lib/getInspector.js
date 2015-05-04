/**
 * Created by robertboyles on 5/4/15.
 */

/*globals by*/

'use strict';

// Add the custom locator.
by.addLocator('getInspector',

    function (optParentElement) {

        var using = optParentElement || document;

        return using.querySelectorAll('div.diagram-component-inspector.ng-isolate-scope');

    });

by.addLocator('getInspectorExpander',

    function (optParentElement) {

        var using = optParentElement || document;

        return using.querySelectorAll('div.drawer-expander');

    });

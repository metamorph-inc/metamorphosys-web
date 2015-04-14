/*global angular*/

'use strict';

require('Array.prototype.find');

window.componentBoxByLabel = function(labelText, optParentElement) {

    var using = optParentElement || document,

        componentBoxes = using.querySelectorAll('g.component-container .symbol.box');

    // Return an array of buttons with the text.
    return Array.prototype.filter.call(componentBoxes, function(box) {

        var label;

        label = box.querySelector('.component-label');

        return label && label.textContent === labelText;
    });
};

window.countOfSasquatches = function() {
    var root = angular.element(document.getElementsByTagName('body'));

    var watchers = [];

    var f = function(element) {
        angular.forEach(['$scope', '$isolateScope'], function(scopeProperty) {
            if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
                angular.forEach(element.data()[scopeProperty].$$watchers, function(watcher) {
                    watchers.push(watcher);
                });
            }
        });

        angular.forEach(element.children(), function(childElement) {
            f(angular.element(childElement));
        });
    };

    f(root);

    // Remove duplicate watchers
    var watchersWithoutDuplicates = [];
    angular.forEach(watchers, function(item) {
        if (watchersWithoutDuplicates.indexOf(item) < 0) {
            watchersWithoutDuplicates.push(item);
        }
    });

    console.log(watchersWithoutDuplicates.length);
};

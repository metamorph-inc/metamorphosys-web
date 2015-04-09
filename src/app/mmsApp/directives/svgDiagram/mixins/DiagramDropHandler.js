'use strict';

var DiagramDropHandler = function() {};

DiagramDropHandler.prototype.apply = function(object) {

};

DiagramDropHandler._onDragenter = function(e) {

    console.log(e.dataTransfer.getData('componentId'));

    if (!e || !e.dataTransfer.items || e.dataTransfer.items.length === 0 || e.dataTransfer.items[0].kind !== 'file') {
        return false;
    }
    e.preDefault();
    if (e.dataTransfer.items[0].type === 'application/x-zip-compressed') {
        e.dataTransfer.effectAllowed = 'copy';
    } else {
        e.dataTransfer.effectAllowed = 'none';
    }
    return false;


};

DiagramDropHandler._onDragleave = function(e) {

};

DiagramDropHandler._onDrop = function(e) {


    if (!e || !e.dataTransfer.files || e.dataTransfer.files.length === 0) {
        return false;
    }
    e.preDefault();
    $scope.aFileWasDroppedOnMe(e.dataTransfer.files[0], e);
    return false;

};

module.exports = DiagramDropHandler;

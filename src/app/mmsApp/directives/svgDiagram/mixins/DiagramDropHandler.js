'use strict';

var DiagramDropHandler = function() {};

DiagramDropHandler.prototype.apply = function(object) {
    object._onDrop = DiagramDropHandler._onDrop;    
};


DiagramDropHandler._onDrop = function(e) {

    console.log('Dropped component:', e.dataTransfer.getData('component_id'));

    e.preventDefault();
    if (!e || !e.dataTransfer.files || e.dataTransfer.files.length === 0) {
        return false;
    }
    //e.preDefault();
    this.$scope.aFileWasDroppedOnMe(e.dataTransfer.files[0], e);
    return false;

};

module.exports = DiagramDropHandler;

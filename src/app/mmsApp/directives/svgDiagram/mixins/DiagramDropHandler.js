/*global ga*/

'use strict';

var DiagramDropHandler = function() {

    this._draggingFromOutside = null;

};

DiagramDropHandler.prototype.apply = function(object) {

    object._onDrop = DiagramDropHandler._onDrop;
    object._onDragenterFromOutside = DiagramDropHandler._onDragenterFromOutside;    
    object._onDragleaveFromOutside = DiagramDropHandler._onDragleaveFromOutside;    
};

DiagramDropHandler._onDrop = function(e, dragged) {

    var self = this,
        component,
        position;

    e.preventDefault();
    // if (!e || !e.dataTransfer.files || e.dataTransfer.files.length === 0) {
    //     return false;
    // }
    // //e.preDefault();
    // this.$scope.aFileWasDroppedOnMe(e.dataTransfer.files[0], e);
    // return false;


    if (dragged && dragged.data && dragged.data.componentId) {

        console.log('Dropped component id: ', dragged.data.componentId);

        component = this.componentBrowserService.getComponentById(dragged.data.componentId);

        if (component) {

            position = this.mmsUtils.getPositionFromEvent(e);

            ga('send', 'event', 'avmComponent', 'dropped', component.id);

            this.$rootScope.$emit('componentInstantiationMustBeDone',
                this.componentServerUrl + '/getcomponent/download/' + component.id, position);
        }

    } else if (e.dataTransfer.files.length) {

        position = this.mmsUtils.getPositionFromEvent(e);

        this.acmImportService.storeDroppedAcm(e.dataTransfer.files[0])
            .then(function(url) {
                self.$rootScope.$emit('componentInstantiationMustBeDone', url, position);
            })
            .catch(function(err) {
                self.$log.error('Error creating drag-n-drop component: ' + err);
            });

    }
};

DiagramDropHandler._onDragenterFromOutside = function() {

    if (!this.dndService.getDragged()) {

        this._draggingFromOutside = true;
        this.dndService.startDrag(null, 'component');
    }

};

DiagramDropHandler._onDragleaveFromOutside = function() {

    if (this._draggingFromOutside) {
        this.dndService.stopDrag();
        this._draggingFromOutside = false;
    }

};

module.exports = DiagramDropHandler;

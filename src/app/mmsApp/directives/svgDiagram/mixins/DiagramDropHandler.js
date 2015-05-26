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
        position,
        contentServerUrl = this.contentServerUrl;

    e.preventDefault();
    // if (!e || !e.dataTransfer.files || e.dataTransfer.files.length === 0) {
    //     return false;
    // }
    // //e.preDefault();
    // this.$scope.aFileWasDroppedOnMe(e.dataTransfer.files[0], e);
    // return false;

    if (dragged && dragged.data) {

        if(dragged.data.componentId) {


            console.log('Dropped component id: ', dragged.data.componentId);

            position = this.mmsUtils.getPositionFromEvent(e);

            ga('send', 'event', 'avmComponent', 'dropped', dragged.data.componentId);

            this.$rootScope.$emit('componentInstantiationMustBeDone',
                contentServerUrl + '/getcomponent/download/' + dragged.data.componentId, position);

        } else if (dragged.data.subcircuitId) {

            console.log('Dropped subcircuit id: ', dragged.data.componentId);

            position = this.mmsUtils.getPositionFromEvent(e);

            ga('send', 'event', 'avmComponent', 'dropped', dragged.data.subcircuitId);

            this.$rootScope.$emit('subcircuitInstantiationMustBeDone',
                contentServerUrl + '/getsubcircuit/download/' + dragged.data.subcircuitId, position, contentServerUrl);


        }

    } else if (e.dataTransfer.files.length) {

        position = this.mmsUtils.getPositionFromEvent(e);

        var event = 'componentInstantiationMustBeDone';

        if (/\.(adm|adp)$/.test(e.dataTransfer.files[0].name)) {
            event = 'subcircuitInstantiationMustBeDone';
        }

        this.acmImportService.storeDroppedAcm(e.dataTransfer.files[0])
            .then(function (url) {
                self.$rootScope.$emit(event, url, position, contentServerUrl);
            })
            .catch(function (err) {
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

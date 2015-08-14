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
        validDrop = true,
        droppedFileName,
        droppedFileExtension,
        contentServerUrl = this.contentServerUrl;

    e.preventDefault();
    // if (!e || !e.dataTransfer.files || e.dataTransfer.files.length === 0) {
    //     return false;
    // }
    // //e.preDefault();
    // this.$scope.aFileWasDroppedOnMe(e.dataTransfer.files[0], e);
    // return false;
    
    if (e.originalEvent) {
        e = e.originalEvent;
    }

    if (dragged && dragged.data && e.target.tagName === self.diagramDropElement) {

        if(dragged.data.componentId) {


            console.log('Dropped component id: ', dragged.data.componentId);

            position = this.mmsUtils.getPositionFromEvent(e);

            ga('send', 'event', 'avmComponent', 'dropped', dragged.data.componentId);

            this.$rootScope.$emit('componentInstantiationMustBeDone',
                contentServerUrl + '/getcomponent/download/' + dragged.data.componentId, position);

        } else if (dragged.data.subcircuitId) {

            console.log('Dropped subcircuit id: ', dragged.data.subcircuitId);

            position = this.mmsUtils.getPositionFromEvent(e);

            ga('send', 'event', 'avmComponent', 'dropped', dragged.data.subcircuitId);

            this.$rootScope.$emit('subcircuitInstantiationMustBeDone',
                contentServerUrl + '/subcircuit/getsubcircuit/download/' + dragged.data.subcircuitId, position, contentServerUrl);
        
        } else if (dragged.data.primitiveId) {

            console.log('Dropped primitive id: ', dragged.data.primitiveId);

            position = this.mmsUtils.getPositionFromEvent(e);

            ga('send', 'event', 'avmComponent', 'dropped', dragged.data.primitiveId);

            this.$rootScope.$emit('primitiveInstantiationMustBeDone',
                dragged.data.primitiveData, position);
        
        }


    } else if (e.dataTransfer.files.length) {

        position = this.mmsUtils.getPositionFromEvent(e);

        droppedFileName = e.dataTransfer.files[0].name;

        droppedFileExtension = droppedFileName.substr(droppedFileName.lastIndexOf('.') + 1);

        if ((self.diagramDropElement === e.target.tagName && self.diagramDroppableFiles.indexOf(droppedFileExtension) === -1) ||
            (self.componentDropElements.indexOf(e.target.tagName) !== -1 && self.componentDroppableFiles.indexOf(droppedFileExtension) === -1) ) {
            
            validDrop = false;
            self.$log.error('Tried dropping invalid file onto diagram or component.');
            self.$mdToast.show(
                self.$mdToast.simple()
                    .content('Tried dropping incompatible file onto diagram or component.')
            );
            
        }

        if (validDrop) {

            var event = 'componentInstantiationMustBeDone';

            if (/\.(adm|adp)$/.test(droppedFileName)) {
                event = 'subcircuitInstantiationMustBeDone';
            }
            if (/\.brd$/.test(droppedFileName)) {
                event = 'brdImportMustBeDone';
            }
            if (/\.svg$/.test(droppedFileName)) {
                event = 'svgIconImportMustBeDone';
            }


            this.acmImportService.storeDroppedFile(e.dataTransfer.files[0])
                .then(function (url) {
                    self.$rootScope.$emit(event, url, position, contentServerUrl);
                })
                .catch(function (err) {
                    self.$log.error('Error creating drag-n-drop component: ' + err);
                });
        }

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

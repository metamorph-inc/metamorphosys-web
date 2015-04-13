'use strict';

function DnDService() {

    this._dropTargets = [];
    this._channels = {};
    this._dragged = null;

    this._activeDropTargets = [];

}

DnDService.prototype._onDragOverEnterLeave = function(e) {
    e.preventDefault();
};

DnDService.prototype.findInDroptargets = function(element) {

    var i, l, 
        found = false,
        position = -1;

    l = this._dropTargets.length;

    for ( i = 0; i < l && !found; i++) {

        if (this._dropTargets[i].targetElement === element) {
            position = i;
            found = true;
        }

    }

    return position;
};

DnDService.prototype.registerDropTarget = function(element, channelStr, dropHandler) {

    var self = this,
        channelArray,
        channel,
        dropTarget;

    if (element && this.findInDroptargets(element) === -1) {

        dropTarget = {
            targetElement: element,
            onDrop: function(e) {
                if (e.target === element) {                
                    self.stopDrag();
                    dropHandler(e);
                }
            },
            onDragOver: function(e) {
                if (e.target === element && !element.classList.contains('drag-enter')) {
                    element.classList.add('drag-entered');                
                }
                self._onDragOverEnterLeave(e);
            },
            onDragenter: function(e) {
                element.classList.add('drag-entered');                
                self._onDragOverEnterLeave(e);
            },
            onDragleave: function(e) {
                element.classList.remove('drag-entered');                                
                self._onDragOverEnterLeave(e);

            }
        };

        element.addEventListener('drop', dropTarget.onDrop, false);
        element.addEventListener('dragover', dropTarget.onDragOver, false);
        element.addEventListener('dragenter', dropTarget.onDragenter, false);
        element.addEventListener('dragleave', dropTarget.onDragleave, false);

        if (typeof channelStr === 'string') {

            channelArray = channelStr.split(' ');

            dropTarget.channels = channelArray;

            while (channelArray.length > 0) {

                channel = channelArray.shift();

                this._channels[channel] = this._channels[channel] || [];
                this._channels[channel].push(element);

            }

        }

        this._dropTargets.push(dropTarget);        

    }

};

DnDService.prototype.unregisterDropTarget = function(element) {

    var index = this.findInDroptargets(element),
        channelArray,
        dropTarget,
        channel;

    if (index > -1) {

        dropTarget = this._dropTargets[index];

        element.removeEventListener('drop', dropTarget.onDrop);
        element.removeEventListener('dragover', dropTarget.onDragOver);
        element.removeEventListener('dragenter', dropTarget.onDragenter);
        element.removeEventListener('dragleave', dropTarget.onDragleave);

        while (dropTarget.channelArray && dropTarget.channelArray.length && dropTarget.channelArray.length > 0) {

            channel = channelArray.shift();

            index = this._channels[channel].indexOf(element);
            this._channels.splice(index, 1);
        }

        this._dropTargets.splice(index, 1);

    }

};

DnDService.prototype.getDragged = function() {

    return this._dragged;

};

DnDService.prototype._deactivateDropTargets = function() {

    var i;

    for (i = 0; i < this._activeDropTargets.length; i++) {
        this._activeDropTargets[i].classList.remove('drop-target');
        this._activeDropTargets[i].classList.remove('drag-entered');        
    }

};

DnDService.prototype.startDrag = function(data, channel) {

    var i, l,
        targetEl;

    this._dragged = {
        data: data,
        channel: channel
    };

    this._deactivateDropTargets();

    if (channel != null && Array.isArray(this._channels[channel])) {

        l = this._channels[channel].length;

        for (i = 0; i < l; i++) {

            targetEl = this._channels[channel][i];
            targetEl.classList.add('drop-target');
            this._activeDropTargets.push(targetEl);

        }

    }

    document.documentElement.classList.add('dragging');

};

DnDService.prototype.stopDrag = function() {

    this._dragged = null;
    this._deactivateDropTargets();

    document.documentElement.classList.remove('dragging');

};

angular.module('mms.dndService', [])
    .service( 'dndService', DnDService
);

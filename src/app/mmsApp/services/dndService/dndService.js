'use strict';

require('./jquery.dragster.js');

function DnDService() {

    this._dropTargets = [];
    this._channels = {};
    this._dragged = null;

    this._activeDropTargets = [];
    this._useDragster = false;

}

DnDService.prototype._onDragOverEnterLeave = function(e) {
    e.preventDefault();
};

DnDService.prototype.findInDroptargets = function(element) {

    var i, l,
        found = false,
        position = -1;

    l = this._dropTargets.length;

    for (i = 0; i < l && !found; i++) {

        if (this._dropTargets[i].targetElement === element) {
            position = i;
            found = true;
        }

    }

    return position;
};

DnDService.prototype.registerDropTarget = function(element, channelStr, dropHandler, useDragster) {

    var self = this,
        channelArray,
        channel,
        dropTarget;

    this._useDragster = useDragster;

    if (element && this.findInDroptargets(element) === -1) {

        dropTarget = {
            targetElement: element,
            onDrop: function(e) {

                var classNames;

                classNames = element.getAttribute('class');

                dropHandler(e, self._dragged);
                self.stopDrag();

                if (classNames) {
                    element.setAttribute('class', element.getAttribute('class').replace(/ drag-entered/g, ''));
                }
            },
            onDragOver: function(e) {

                e.dataTransfer ? e.dataTransfer.dropEffect = "copy" : e.originalEvent.dataTransfer.dropEffect = "copy";

                var classNames = element.getAttribute('class');

                if (e.target === element && classNames && classNames.indexOf('drag-enter') === -1) {
                    element.setAttribute('class', classNames + ' drag-entered');
                }

                self._onDragOverEnterLeave(e);
            },
            onDragenter: function(e) {

                e.dataTransfer ? e.dataTransfer.dropEffect = "copy" : e.originalEvent.dataTransfer.dropEffect = "copy";

                var classNames = element.getAttribute('class');

                if (classNames && classNames.indexOf('drag-enter') === -1) {
                    element.setAttribute('class', classNames + ' drag-entered');
                }

                self._onDragOverEnterLeave(e);
            },
            onDragleave: function(e) {

                var classNames = element.getAttribute('class');

                if (classNames) {
                    element.setAttribute('class', element.getAttribute('class').replace(/ drag-entered/g, ''));
                }

                self._onDragOverEnterLeave(e);

            }
        };

        // Dragster used where entering children should not leave the parent (ie, components)
        if (!this._useDragster) {
            element.addEventListener('drop', dropTarget.onDrop, false);
            element.addEventListener('dragover', dropTarget.onDragOver, false);
            element.addEventListener('dragenter', dropTarget.onDragenter, false);
            element.addEventListener('dragleave', dropTarget.onDragleave, false);
        }
        else {
        
            $(element).dragster({
                enter: function(dragsterEvent, e) {
                    dropTarget.onDragenter(e);
                },
                leave: function(dragsterEvent, e) {
                    dropTarget.onDragleave(e);
                },
                drop: function(dragsterEvent, e) {
                    dropTarget.onDrop(e);
                }
            });
        }

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

        if (!this._useDragster) {
            element.removeEventListener('drop', dropTarget.onDrop);
            element.removeEventListener('dragover', dropTarget.onDragOver);
            element.removeEventListener('dragenter', dropTarget.onDragenter);
            element.removeEventListener('dragleave', dropTarget.onDragleave);
        }

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

    var i,
        classNames;

    for (i = 0; i < this._activeDropTargets.length; i++) {

        classNames = this._activeDropTargets[i].getAttribute('class');

        if (classNames) {

            this._activeDropTargets[i].setAttribute('class',
                classNames
                .replace(/ drop-target/g, '')
                .replace(/ drag-entered/g, '')
            );

        }
    }

};

DnDService.prototype.startDrag = function(channel, data) {

    var i, l,
        targetEl;

    this._dragged = {
        channel: channel,
        data: data
    };

    this._deactivateDropTargets();

    if (channel != null && Array.isArray(this._channels[channel])) {

        l = this._channels[channel].length;

        for (i = 0; i < l; i++) {

            targetEl = this._channels[channel][i];
            targetEl.setAttribute('class', targetEl.getAttribute('class') + ' drop-target');
            this._activeDropTargets.push(targetEl);

        }

    }


    document.documentElement.setAttribute('class', document.documentElement.getAttribute('class') + ' dragging');

};

DnDService.prototype.stopDrag = function() {

    var classNames = document.documentElement.getAttribute('class');

    this._dragged = null;
    this._deactivateDropTargets();


    if (classNames) {
        document.documentElement.setAttribute('class',
            classNames.replace(/ dragging/g, '')
        );
    }

};

angular.module('mms.dndService', [])
    .service('dndService', DnDService);

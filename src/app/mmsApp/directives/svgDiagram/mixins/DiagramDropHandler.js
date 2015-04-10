/*global ga*/

'use strict';

var DiagramDropHandler = function() {};

DiagramDropHandler.prototype.apply = function(object) {
    object._onDrop = DiagramDropHandler._onDrop;
};


DiagramDropHandler._onDrop = function(e) {

    var componentId,
        component,
        position;

    e.preventDefault();
    // if (!e || !e.dataTransfer.files || e.dataTransfer.files.length === 0) {
    //     return false;
    // }
    // //e.preDefault();
    // this.$scope.aFileWasDroppedOnMe(e.dataTransfer.files[0], e);
    // return false;

    componentId = e.dataTransfer.getData('component_id');

    if (componentId) {

        console.log('Dropped component id: ', componentId);

        component = this.componentBrowserService.getComponentById(componentId);

        if (component) {

            position = this.mmsUtils.getPositionFromEvent(e);

            ga('send', 'event', 'avmComponent', 'dropped', component.id);

            this.$rootScope.$emit('componentInstantiationMustBeDone',
                this.componentServerUrl + '/getcomponent/download/' + component.id, position);
        }
    }
};

module.exports = DiagramDropHandler;
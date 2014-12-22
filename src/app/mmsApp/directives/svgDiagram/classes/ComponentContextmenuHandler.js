/*globals*/

'use strict';

module.exports = function(/*$scope, diagramService, wiringService, $log*/) {

    var self = this,
    //
    //    onMouseDown,
    //    onMouseLeave,
    //    onWindowBlur,
    //    onComponentMouseUp,
       onComponentMouseDown,
    //
        closeMenu;
    //
    //closeMenu = function() {
    //
    //};
    //
    //onMouseLeave = function(/*$event*/) {
    //
    //    cancelDrag();
    //
    //};
    //
    //onWindowBlur = function(/*$event*/) {
    //
    //    cancelDrag();
    //
    //};
    //
    //onComponentMouseUp = function(component, $event) {
    //
    //
    //};
    //
    onComponentMouseDown = function (component, $event) {
        console.log('eee');
    };
    //
    //this.onMouseUp = onMouseUp;
    //this.onMouseMove = onMouseMove;
    //this.onMouseLeave = onMouseLeave;
    //this.onWindowBlur = onWindowBlur;
    //this.onComponentMouseUp = onComponentMouseUp;

    this.onComponentMouseDown = onComponentMouseDown;

    return this;

};

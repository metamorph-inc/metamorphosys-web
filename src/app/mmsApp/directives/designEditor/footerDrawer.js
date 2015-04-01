'use strict';

angular.module('mms.designEditor.footerDrawer', [])
    .directive('footerDrawer', [
        function() {

            function DrawerController() {

                this._AUTO_HEIGHT = '200';
                this._COLLAPSED_HEIGHT = '26';

                this._height = this._COLLAPSED_HEIGHT;
                this._element = null;
                this._editorCtrl = null;
                this._expanded = false;

                //this.toggle();                

            }

            DrawerController.prototype.expand = function(height) {

                if (!this._expanded) {

                    if (!isNaN(height)) {
                        this.setHeight(height);
                    } else {
                        this.setHeight(this._AUTO_HEIGHT);
                    }

                    this._expanded = true;
                }

            };

            DrawerController.prototype.collapse = function() {

                if (this._expanded) {

                    this.setHeight(this._COLLAPSED_HEIGHT);

                    this._expanded = false;
                }

            };

            DrawerController.prototype.toggle = function() {

                if (this._expanded) {
                	this.collapse();
                } else {
                	this.expand();                	
                }

            };

            DrawerController.prototype.getHeight = function() {
                return this._height;
            };

            DrawerController.prototype.setHeight = function(height) {

                if (!isNaN(height)) {

                    this._height = height;

                    if (this._element) {
                        this._element.style.height = this._height + 'px';
                    }

                    if (this._editorCtrl) {
                        this._editorCtrl.adjustToDrawerHeight(this._height);
                    }
                }

            };

            DrawerController.prototype.registerElement = function(element) {

                this._element = element;

                if (this._element) {
                    this._element.style.height = this._height + 'px';
                }

            };

            DrawerController.prototype.registerParentEditor = function(editorCtrl) {

                this._editorCtrl = editorCtrl;

                if (this._editorCtrl) {
                    this._editorCtrl.adjustToDrawerHeight(this._height);
                }

            };

            return {
                restrict: 'E',
                controller: DrawerController,
                controllerAs: 'ctrl',
                bindToController: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/footerDrawer.html',
                require: ['footerDrawer', '^designEditor'],
                link: function(scope, element, attribute, controllers) {

                    var ctrl = controllers[0],
                        designEditorCtrl = controllers[1];

                    ctrl.registerElement(element[0]);
                    ctrl.registerParentEditor(designEditorCtrl);

                }
            };
        }
    ]);

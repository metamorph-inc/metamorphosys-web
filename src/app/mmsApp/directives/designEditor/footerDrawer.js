'use strict';

angular.module('mms.designEditor.footerDrawer', [
        'mms.utils'
    ])
    .directive('footerDrawer', 
        function(mmsUtils) {

            function DrawerController() {

                this._AUTO_HEIGHT = 200;
                this._COLLAPSED_HEIGHT = 26;

                this._screenHeaderEl = document.getElementById('screen-header');

                this._height = this._COLLAPSED_HEIGHT;
                this._earlierHeight = null;
                this._element = null;
                this._editorCtrl = null;
                this._expanded = false;

                this._headerDragging = false;
                this._potentialHeaderDragStart = null;
                this._heightBeforeHeaderDragging = null;

                this._heightAllowance = null;

                this._panels = {};

                this.toggle();                

            }

            DrawerController.prototype.expand = function(height) {

                if (!this._expanded) {

                    if (!isNaN(height)) {
                        this.setHeight(height);
                    } else {
                        this.setHeight(this._earlierHeight || this._AUTO_HEIGHT);
                    }

                    this._expanded = true;
                }

            };

            DrawerController.prototype.collapse = function() {

                if (this._expanded) {

                    this._earlierHeight = this._height;
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

                    if (this._height > this._COLLAPSED_HEIGHT) {
                        this._expanded = true;
                    } else {
                        this._expanded = false;
                    }
                }

            };

            DrawerController.prototype.registerElement = function(element) {

                this._element = element;

                if (this._element) {
                    this._element.style.height = this._height + 'px';
                }

            };

            DrawerController.prototype.unregisterElement = function(element) {

                this._element = null;

            };

            DrawerController.prototype.registerParentEditor = function(editorCtrl) {

                this._editorCtrl = editorCtrl;

                if (this._editorCtrl) {
                    this._editorCtrl.adjustToDrawerHeight(this._height);
                }

            };

            DrawerController.prototype.headerMouseDown = function($event) {

                if (!this._headerDragging) {
                    this._potentialHeaderDragStart = $event.clientY;
                }

            };

            DrawerController.prototype._startHeaderDragging = function() {

                this._headerDragging = true;
                this._heightBeforeHeaderDragging = this.getHeight();
                this._heightAllowance = 
                    window.innerHeight - 
                    parseInt(getComputedStyle(this._screenHeaderEl).height.slice(0, -2), 10);

            };

            DrawerController.prototype._stopHeaderDragging = function() {
                this._headerDragging = false;
            };

            DrawerController.prototype._documentMouseUp = function() {

                this._potentialHeaderDragStart = null;

                if (this._headerDragging) {
                    this._stopHeaderDragging();
                }

            };

            DrawerController.prototype._documentMouseMove = function($event) {

                var newHeight;

                if (!this._headerDragging && this._potentialHeaderDragStart != null) {
                    this._startHeaderDragging();
                } 

                if (this._headerDragging) {

                    newHeight = this._heightBeforeHeaderDragging - ( $event.clientY - this._potentialHeaderDragStart );

                    this.setHeight(

                        Math.max(
                            Math.min(newHeight, this._heightAllowance),
                            this._COLLAPSED_HEIGHT
                        )

                    );

                }

            };

            DrawerController.prototype.registerPanel = function(panelCtrl) {

                if (panelCtrl && panelCtrl.name && panelCtrl.name && !this._panels[panelCtrl.name]) {

                    console.log(panelCtrl);

                    this._panels[panelCtrl.name] = {

                        name: panelCtrl.name,
                        iconClass: panelCtrl.iconClass,
                        active: panelCtrl.active

                    };

                }

            };

            return {
                restrict: 'E',
                controller: DrawerController,
                scope: {
                    activePanel: '='
                },
                controllerAs: 'ctrl',
                bindToController: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/footerDrawer.html',
                require: ['footerDrawer', '^designEditor'],
                link: function(scope, element, attribute, controllers) {

                    var ctrl = controllers[0],
                        designEditorCtrl = controllers[1],

                        boundDocumentMouseUp = ctrl._documentMouseUp.bind(ctrl),
                        boundDocumentMouseMove = ctrl._documentMouseMove.bind(ctrl);

                    ctrl.registerElement(element[0]);
                    ctrl.registerParentEditor(designEditorCtrl);

                    document.addEventListener('mouseup', boundDocumentMouseUp);
                    document.addEventListener('mousemove', boundDocumentMouseMove);                    

                    scope.$on('$destroy', function() {

                        ctrl.unregisterElement(element[0]);

                        document.removeEventListener('mouseup', boundDocumentMouseUp);
                        document.removeEventListener('mousemove', boundDocumentMouseMove);

                    });

                }
            };
        }
    )
    .directive('drawerPanel', 
        function() {

            function DrawerPanelController() {
                this.name = null;
                this.iconClass = null;
            }


            return {
                restrict: 'E',
                controller: DrawerPanelController,
                controllerAs: 'ctrl',
                bindToController: true,
                replace: true,
                transclude: true,
                template: '<div class="drawer-panel"><ng-transclude></ng-transclude></div>',
                require: ['drawerPanel', '^footerDrawer'],
                link: function(scope, element, attributes, controllers) {

                    var ctrl = controllers[0],
                        footerDrawerCtrl = controllers[1];

                    ctrl.name = attributes.name;
                    ctrl.iconClass = attributes.iconClass;

                    if (attributes.hasOwnProperty('active')) {
                        ctrl.active = true;
                    } else {
                        ctrl.active = false;
                    }

                    footerDrawerCtrl.registerPanel(ctrl);

                }
            };
        }
    );


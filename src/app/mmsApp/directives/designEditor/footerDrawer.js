'use strict';

angular.module('mms.designEditor.footerDrawer', [
        'mms.projectHandling',
        'mms.utils',
        'ngCookies'
    ])
    .directive('footerDrawer',
        function(projectHandling, mmsUtils, $cookies, $injector, $timeout) {

            function DrawerController() {

                var self = this;

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

                this._panels = [];
                this._activePanel = null;

                this._projectsToDisableComponentBrowser = [];
                this._currentDesign = projectHandling.getSelectedDesign().name.replace(/_/g, ' ');

                if ($injector.has('designsToSelect')) {

                    var designsToSelect = $injector.get('designsToSelect');

                    designsToSelect.forEach(function(groupOfDesigns) {
                        groupOfDesigns.designs.forEach(function(design) {

                            if (design.noComponentBrowser) {
                                self._projectsToDisableComponentBrowser.push(design.name);
                            }

                        });
                    });

                }

                this.$cookies = $cookies;

                this.loadPreferences();

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

                        if (this._activePanel) {

                            this._userPreferences.panels = this._userPreferences.panels || {};

                            this._userPreferences.panels[this._activePanel.name] = this._userPreferences.panels[this._activePanel.name] || {};

                            // Remembering height

                            this.getPanelUserPreferencesByPanelName(this._activePanel.name).height = this._height;
                            this.savePreferences();

                        }

                    } else {
                        this._expanded = false;
                    }
                }

            };

            DrawerController.prototype.getPanelUserPreferencesByPanelName = function(aName) {

                this._userPreferences.panels = this._userPreferences.panels || {};

                this._userPreferences.panels[aName] = this._userPreferences.panels[aName] || {};

                return this._userPreferences.panels[aName];

            };

            DrawerController.prototype.savePreferences = function() {
                $cookies.footerDrawerUserPreferences = JSON.stringify(this._userPreferences);
            };

            DrawerController.prototype.loadPreferences = function() {

                if (this.$cookies.footerDrawerUserPreferences) {
                    this._userPreferences = JSON.parse(this.$cookies.footerDrawerUserPreferences);
                } else {
                    this._userPreferences = null;
                }


            };

            DrawerController.prototype.registerElement = function(element) {

                this._element = element;

                if (this._element) {
                    this._element.style.height = this._height + 'px';
                }

            };

            DrawerController.prototype.unregisterElement = function() {

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

                var disableComponentBrowser = this._projectsToDisableComponentBrowser.indexOf(this._currentDesign) !== -1;

                if (panelCtrl && panelCtrl.name) {
                    if (panelCtrl.name.toLowerCase() !== "components" && disableComponentBrowser || !disableComponentBrowser) {

                        if ( this._panels.map( function(x) {
                            return x.name.toLowerCase();
                        }).indexOf(panelCtrl.name.toLowerCase()) === -1 ) {

                            this._panels.push(panelCtrl);

                            if (panelCtrl.active) {
                                this.activatePanel(panelCtrl);
                            }
                        }

                    }

                    else {

                        var componentPanelIndex = this._panels.map( function(x) {
                                return x.name.toLowerCase();
                            }).indexOf("components");

                        if (componentPanelIndex !== -1) {
                            this._panels.splice(componentPanelIndex, 1);
                        }

                    }

                }

            };

            DrawerController.prototype.activatePanel = function(panel) {

                var self = this;

                if (panel) {

                    $timeout(function(){

                        if (self._activePanel && self._activePanel !== panel) {
                            self._activePanel.active = false;
                        }

                        panel.active = true;
                        self._activePanel = panel;

                        self._userPreferences = self._userPreferences || {};

                        if (self._userPreferences.panels && self._userPreferences.panels[panel.name]) {

                            var height = self._userPreferences.panels[panel.name].height;

                            if (!isNaN(height)) {
                                panel.height = height;
                            }

                        }

                        if (self._expanded) {
                            self.setHeight(panel.height);
                        }

                    });

                }

            };

            DrawerController.prototype.activePanelByName = function(panelName) {

                var self = this;

                if (this._panels) {

                    this._panels.forEach(function(panel) {
                        if (panel.name === panelName) {
                            self.activatePanel(panel);
                        }
                    });

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

                    designEditorCtrl._footerDrawerCtrl = ctrl;

                    document.addEventListener('mouseup', boundDocumentMouseUp);
                    document.addEventListener('mousemove', boundDocumentMouseMove);

                    scope.$on('$destroy', function() {

                        ctrl.unregisterElement(element[0]);
                        designEditorCtrl._footerDrawerCtrl = null;

                        document.removeEventListener('mouseup', boundDocumentMouseUp);
                        document.removeEventListener('mousemove', boundDocumentMouseMove);

                    });

                }
            };
        }
    )
    .directive('drawerPanel',

        function(projectHandling, $rootScope) {

            function DrawerPanelController() {
                this.name = null;
                this.iconClass = null;

                this._panels = [];
            }


            DrawerPanelController.prototype.registerSubPanel = function(panelCtrl) {

                if (panelCtrl && panelCtrl.name) {

                        this._panels.push(panelCtrl);

                        var preferences = this._footerDrawerCtrl.getPanelUserPreferencesByPanelName(this.name);

                        if ( preferences.activeSubPanel === panelCtrl.name ||
                            ( preferences.activeSubPanel === undefined && panelCtrl.active)
                        ) {
                            this.activateSubPanel(panelCtrl);
                        } else {
                            panelCtrl.active = false;
                        }

                    }

            };

            DrawerPanelController.prototype.unregisterSubPanel = function(panelCtr) {

                var index = this._panels.indexOf(panelCtr);

                if (index !== -1) {
                    this._panels.splice(index, 1);
                }

            };

            DrawerPanelController.prototype.activateSubPanel = function(panel) {

                if (panel) {

                    if (this._activePanel && this._activePanel !== panel) {
                        this._activePanel.active = false;
                    }

                    panel.active = true;
                    this._activePanel = panel;

                    this._userPreferences = this._userPreferences || {};

                    this._userPreferences.activeSubPanel = this._activePanel.name;

                    // Remembering wich subpanel is active

                    this._footerDrawerCtrl.getPanelUserPreferencesByPanelName(this.name)
                        .activeSubPanel = this._activePanel.name;

                    this._footerDrawerCtrl.savePreferences();

                }

            };


            return {
                restrict: 'E',
                controller: DrawerPanelController,
                controllerAs: 'ctrl',
                bindToController: true,
                replace: true,
                transclude: true,
                scope: true,
                templateUrl: '/mmsApp/templates/drawerPanel.html',
                require: ['drawerPanel', '^footerDrawer'],
                link: function(scope, element, attributes, controllers) {

                    var ctrl = controllers[0],
                        footerDrawerCtrl = controllers[1];

                    ctrl._footerDrawerCtrl = footerDrawerCtrl;

                    ctrl.name = attributes.name;
                    ctrl.iconClass = attributes.iconClass;

                    if (attributes.hasOwnProperty('active')) {
                        ctrl.active = true;
                    } else {
                        ctrl.active = false;
                    }

                    if (attributes.hasOwnProperty('height') && !isNaN(attributes.height)) {
                        ctrl.height = attributes.height;
                    }

                    footerDrawerCtrl.registerPanel(ctrl);

                    $rootScope.$on('designMustBeOpened', function(event, design) {

                        footerDrawerCtrl._currentDesign = design.name.toLowerCase();
                        footerDrawerCtrl.registerPanel(ctrl);
                        footerDrawerCtrl.activatePanel(footerDrawerCtrl._panels[footerDrawerCtrl._panels.map( function(x) {
                                return x.name.toLowerCase();
                            }).indexOf("inspector")]);

                    });

                }
            };
        }
    )
    .directive('drawerSubPanel',

        function() {

            function DrawerSubPanelController() {
                this.name = null;
                this.iconClass = null;
            }


            return {
                restrict: 'E',
                controller: DrawerSubPanelController,
                controllerAs: 'ctrl',
                bindToController: true,
                replace: true,
                transclude: true,
                scope: true,
                template: '<div class="drawer-sub-panel"><ng-transclude ng-if="ctrl.active"></ng-transclude></div>',
                require: ['drawerSubPanel', '^drawerPanel', '^footerDrawer'],
                link: function(scope, element, attributes, controllers) {

                    var ctrl = controllers[0],
                        panelCtrl = controllers[1],
                        footerDrawerCtrl = controllers[2];

                    ctrl.name = attributes.name;
                    ctrl.iconClass = attributes.iconClass;

                    if (attributes.hasOwnProperty('active')) {
                        ctrl.active = true;
                    } else {
                        ctrl.active = false;
                    }

                    panelCtrl.registerSubPanel(ctrl);

                    scope.$on('$destroy', function() {
                        panelCtrl.unregisterSubPanel(ctrl);
                    });

                }
            };
        }
    );

/*globals angular*/

'use strict';

angular.module(
    'mms.mainNavigator', [])

.directive(
    'mainNavigator',

    function() {

        return {
            scope: {},
            restrict: 'E',
            replace: true,
            controller: function($rootScope, $scope, $timeout, projectHandling) {

                var self = this,
                    defaultNavigatorItems,
                    parseDesignName,
                    renderNavigator;

                defaultNavigatorItems = [{
                    id: 'root',
                    label: '',
                    originalName: '',
                    itemClass: 'cyphy-root',
                    action: function(item, ev) {
                        $rootScope.openDesignSelector(ev);
                    }
                }];

                this.navigator = {
                    separator: true,
                    items: angular.copy(defaultNavigatorItems, [])
                };

                parseDesignName = function(originalName) {

                    var result;

                    result = originalName.replace(/_/g, ' ');

                    return result;

                };

                $scope.showLabelEditor = function(context, index) {
                    context.$parent.editorVisible = true;

                    context.hideLabelButton(context.$parent);

                    $timeout(function() {
                        angular.element('#item-label-' + index).trigger('click');
                    });
                };

                $scope.hideLabelEditor = function(context) {
                    context.$parent.$parent.editorVisible = false;
                };

                $scope.cancel = function(context) {
                    context.$parent.$parent.editorVisible = false;
                };

                renderNavigator = function(activeContainer) {

                    var path,
                        designs,
                        designMenu;

                    if (activeContainer) {

                        path = projectHandling.getContainmentPath();
                        designs = projectHandling.getAvailableDesigns();

                        self.navigator.items = angular.copy(defaultNavigatorItems, []);

                        designMenu = {
                            items: []
                        };

                        angular.forEach(designs, function(design) {

                            designMenu.items.push({
                                id: design.id,
                                type: 'design',
                                label: parseDesignName(design.name),
                                originalName: parseDesignName(design.originalName),
                                action: function() {

                                    if (projectHandling.getSelectedDesignId() !== design.id) {
                                        $rootScope.$emit('designMustBeOpened', design);
                                    }

                                }
                            });
                        });

                        designMenu.items.sort(function(a, b) {

                            if (a.label < b.label) {
                                return -1;
                            }

                            if (a.label === b.label) {
                                return 0;
                            }

                            return 1;
                        });

                        if (designMenu.items.length) {

                            self.navigator.items[0].menu = [];
                            self.navigator.items[0].menu.push(designMenu);

                        }

                        angular.forEach(path, function(container, index) {

                            var item,
                                submenu;

                            item = {
                                id: container.id,
                                type: index === 0 ? 'design' : 'component',
                                label: parseDesignName(container.name),
                                originalName: index === 0 ? parseDesignName(container.originalName) : parseDesignName(container.name),
                                action: function() {

                                    if (projectHandling.getSelectedContainerId() !== container.id) {
                                        $rootScope.$emit('containerMustBeOpened', container);
                                    }

                                }
                            };

                            if (angular.isObject(container.childContainers)) {

                                submenu = {
                                    items: []
                                };

                                angular.forEach(container.childContainers, function(childContainer) {

                                    submenu.items.push({
                                        id: childContainer.id,
                                        type: 'component',
                                        label: parseDesignName(childContainer.name),
                                        action: function() {

                                            if (projectHandling.getSelectedContainerId() !== childContainer.id) {
                                                $rootScope.$emit('containerMustBeOpened', childContainer);
                                            }

                                        }
                                    });
                                });

                                submenu.items.sort(function(a, b) {

                                    if (a.label < b.label) {
                                        return -1;
                                    }

                                    if (a.label === b.label) {
                                        return 0;
                                    }

                                    return 1;
                                });


                                if (submenu.items.length) {

                                    item.menu = [];
                                    item.menu.push(submenu);

                                }

                            }

                            self.navigator.items.push(item);

                        });


                    } else {
                        self.navigator.items = angular.copy(defaultNavigatorItems, []);
                    }

                };

                this.isNameValid = function(data) {

                    if (data.length < 1 || data.length > 27) {
                        return 'Name should be between 1 and 27 characters long!';
                    }

                };

                this.commitName = function(item) {

                    $rootScope.$emit('designLabelMustBeSaved', item);

                };

                $rootScope.$on('nameWasChanged', function($e, container) {
                    renderNavigator(container);
                });

                $scope.$watch(function() {
                    return projectHandling.getSelectedContainer();
                }, renderNavigator);

            },
            bindToController: true,
            controllerAs: 'ctrl',
            templateUrl: '/mmsApp/templates/mainNavigator.html',
            link: function() {}
        };
    }
)

.directive('showEditButtonOnHover',

function () {
    return {
        link: function (scope, element, attrs) {

            element.bind('mouseenter', function () {
                element.find('button').first().show();
            });
            element.bind('mouseleave', function () {
                element.find('button').first().hide();

            });

        }
    };
});

/*globals angular*/

'use strict';

require('../designSelector/designSelector');

angular.module(
    'mms.mainNavigator', [
        'mms.designSelector'
    ])

    .directive(
    'mainNavigator',

    function () {

        return {
            scope: {},
            restrict: 'E',
            replace: true,
            controller: function ($rootScope, $scope, $mdDialog, projectHandling) {

                var self = this,
                    defaultNavigatorItems,
                    parseDesignName;

                defaultNavigatorItems = [
                    {
                        id: 'root',
                        label: '',
                        itemClass: 'cyphy-root',
                        action: function (item, ev) {

                            function DialogController($scope) {

                                $scope.designsToSelect = require('./designsToSelect.js');

                            }

                            $mdDialog.show({
                                controller: DialogController,
                                template: '<md-dialog class="design-selector-dialog"><design-selector designs="::designsToSelect"></design-selector></md-dialog>',
                                targetEvent: ev
                            })
                                .then(function () {
                                });

                        }
                    }
                ];

                this.navigator = {
                    separator: true,
                    items: angular.copy(defaultNavigatorItems, [])
                };

                parseDesignName = function (originalName) {

                    var result;

                    result = originalName.replace(/_/g, ' ');

                    return result;

                };

                $scope.$watch(function () {
                    return projectHandling.getSelectedContainer();
                }, function (activeContainer) {

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

                        angular.forEach(designs, function(design){

                            designMenu.items.push({
                                id: design.id,
                                label: parseDesignName(design.name),
                                action: function () {

                                    if (projectHandling.getSelectedDesignId() !== design.id) {
                                        $rootScope.$emit('designMustBeOpened', design);
                                    }

                                }
                            });
                        });

                        if (designMenu.items.length) {

                            self.navigator.items[0].menu = [];
                            self.navigator.items[0].menu.push(designMenu);

                        }

                        angular.forEach(path, function (container) {

                            var item,
                                submenu;

                            item = {
                                id: container.id,
                                label: parseDesignName(container.name),
                                action: function () {

                                    if (projectHandling.getSelectedContainerId() !== container.id) {
                                        $rootScope.$emit('containerMustBeOpened', container);
                                    }

                                }
                            };

                            if (angular.isObject(container.childContainers)) {

                                submenu = {
                                    items: []
                                };

                                angular.forEach(container.childContainers, function (childContainer) {

                                    submenu.items.push({
                                        id: childContainer.id,
                                        label: parseDesignName(childContainer.name),
                                        action: function () {

                                            if (projectHandling.getSelectedContainerId() !== childContainer.id) {
                                                $rootScope.$emit('containerMustBeOpened', childContainer);
                                            }

                                        }
                                    });
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

                });


            },
            bindToController: true,
            controllerAs: 'ctrl',
            templateUrl: '/mmsApp/templates/mainNavigator.html',
            link: function () {
            }
        };
    }
);

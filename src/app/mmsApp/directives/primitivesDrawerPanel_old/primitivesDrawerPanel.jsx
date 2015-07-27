'use strict';

/* globals ga */

require('./primitiveConfig.js');

angular.module('mms.primitivesDrawerPanel', [
    'mms.primitivesService',
    'mms.primitiveDrawerPanel.primitiveConfig',
    'cyphy.services',
    'ngMaterial'
])
.directive('primitivesDrawerPanelList', function(primitivesService) {

    function PrimitivesListController($scope) {

        var self = this,
            primitives = require("../../primitiveContent.json"); 

        this.listData = {
            items: []
        };   

        primitives.forEach(primitive => {

            var listItem = {
                id: primitive.id,
                title: primitive.name,
                summary: primitive.description,
                config: primitive.config,
                headerTemplateUrl: '/mmsApp/templates/primitivesListHeaderTemplate.html',
                detailsTemplateUrl: '/mmsApp/templates/primitivesListDetailsTemplate.html',
                configDirective: 'dummy-primitives-config',
                details: true
            };

            self.listData.items.push(listItem);

        });


        this.config = {

            sortable: false,
            secondaryItemMenu: false,
            detailsCollapsible: true,
            showDetailsLabel: 'Configure',
            hideDetailsLabel: 'Configure',

            detailsRenderer: function (item) {
                item.details = 'My details are here now!';
            }

        };

    }

    return {
        restrict: 'E',
        controller: PrimitivesListController,
        controllerAs: 'ctrl',
        bindToController: true,
        replace: true,
        transclude: true,
        scope: true,
        templateUrl: '/mmsApp/templates/primitivesDrawerPanelList.html'
    };
});
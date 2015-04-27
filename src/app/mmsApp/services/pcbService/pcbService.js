/*globals angular */

'use strict';

angular.module('mms.designVisualization.pcbService', [])
    .service('pcbService', function ($q, $log, nodeService, acmImportService) {

        this.isPcbClassification = function (classifications) {
            return classifications === 'pcb_board' || classifications === 'template.pcb_template';
        };

        this.isPcbComponent = function (component) {
            return this.isPcbClassification(component.getAttribute('Classifications'));
        };

        this.getPcbInDesign = function (context, designId) {
            var self = this;
            return nodeService.loadNode(context, designId)
                .then(function (node) {
                    return node.loadChildren();
                }).then(function (children) {
                    return children.filter(function (child) {
                        return self.isPcbComponent(child);
                    })[0];
                });
        };

        this.swapPcbComponent = function (context, designId, acmUrl) {
            return this.getPcbInDesign(context, designId)
                .then(function (originalPcb) {
                    acmImportService.swapAcm(context, originalPcb.getId(), acmUrl);
                });
        };
    });

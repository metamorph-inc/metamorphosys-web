'use strict';

/* globals ga */

require('../designEditor/designEditor.js');

var PrimitiveGrid = require('./primitiveGrid.jsx');

angular.module('mms.primitivesDrawerPanel', [
    'mms.primitivesService',
    'mms.designEditor',
    'cyphy.services',
    'ngMaterial'
])
.directive('primitivesDrawerPanelGrid', function() {

    function PrimitivesGridController($scope) {

        var self = this,
            primitives = require("../../primitiveContent.json"); 

        this.listData = {
            items: []
        };   

        primitives.forEach(primitive => {

            var listItem = {
                id: primitive.id,
                name: primitive.name,
                description: primitive.description,
                svgViewBox: primitive.svgViewBox,
                config: primitive.config,
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
        controller: PrimitivesGridController,
        controllerAs: 'ctrl',
        bindToController: true,
        replace: true,
        transclude: true,
        scope: true,
        template: '<div class="primitives-drawer-panel"></div>',
        require: ['primitivesDrawerPanelGrid', '^designEditor'],
        link: function(scope, element, attr, controllers) {

                var ctrl = controllers[0],
                    designCtrl = controllers[1];

                function cleanup() {
                  React.unmountComponentAtNode(element[0]);
                }

                function render() {
                    React.render(<PrimitivesGrid primitives={ctrl.listData.items} />, element[0]);
                }

                scope.$watch(function() {
                    if (ctrl.listData.items) {
                        return ctrl.listData.items;
                    }
                }, function(newO, oldO){

                    if ((oldO !== newO || oldO != null) && newO != null) {

                        cleanup();
                        render();

                        var gridItems = document.querySelectorAll( '.primitive-grid-item' )

                        if (gridItems) {

                            angular.forEach(gridItems, function(gridItem) {

                                gridItem.addEventListener("dragstart", function(e) {

                                    var primitiveId = this.getElementsByClassName('primitive-name')[0].title,
                                        primitive = ctrl.listData.items.filter(function(p) {
                                            return p.id === primitiveId; 
                                        })[0];  

                                    designCtrl.primitivePanelItemDragStart(e, primitive);

                                });

                                gridItem.addEventListener("dragstop", function(e) {

                                    var primitiveId = this.getElementsByClassName('primitive-name')[0].title;

                                    designCtrl.primitivePanelItemDragEnd(e, primitiveId);

                                });
                            });
                        }
                    }
                });

                scope.$on('$destroy', cleanup);

            }
        };
    }
);

class PrimitivesGrid extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        var className = 'primitives-drawer-panel-grid';

        return (
            <div className={className}>
                <div className="above-list-headers"></div>
                <PrimitiveGrid primitives={this.props.primitives}/>
            </div>
        );
    }
}
'use strict';

/* globals ga */

var PrimitiveGrid = require('./primitiveGrid.jsx');

angular.module('mms.primitivesDrawerPanel', [
    'mms.primitivesService',
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
        //templateUrl: '/mmsApp/templates/primitivesDrawerPanelGrid.html',
        template: '<div class="primitives-drawer-panel"></div>',
        require: ['primitivesDrawerPanelGrid'],
        link: function(scope, element, attr, controllers) {

                var ctrl = controllers[0];

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
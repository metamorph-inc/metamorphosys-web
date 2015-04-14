'use strict';

angular.module('mms.designEditor.componentWiresContainer.react', [])
    .directive('componentWiresContainerReact', [
        function() {

            function ComponentWiresContainerController() {

                this.wires = [];

            }

            return {
                restrict: 'E',
                controller: ComponentWiresContainerController,
                controllerAs: 'ctrl',
                bindToController: true,
                replace: true,
                transclude: true,
                template: '<g class="wire-container"></g>',
                templateNamespace: 'SVG',
                scope: {
					wires: '='
                },
                require: ['componentWiresContainerReact', '^svgDiagram'],
                link: function(scope, element, attr, controllers) {

                    var ctrl = controllers[0];

                    function renderMyReactComponent(wires) {
                        React.render(<ComponentWiresContainer wires={wires}/>, element[0]);    
                    }

                    
                    scope.$watch(function() {
                        return ctrl.wires;
                    }, function(newWires, oldWires){
                        if (!angular.equals(newWires, oldWires)) {
                            renderMyReactComponent(newWires);
                        }
                    });

                    // cleanup when scope is destroyed
                    scope.$on('$destroy', function() {
                      React.unmountComponentAtNode(element[0]);
                    });
                }
            };
        }
    ]);

var ComponentWiresContainer = React.createClass({

	render: function() {

		var childWires = this.props.wires.map(function(wire){

            return (
                <ComponentWire key={wire.id} wire={wire}/>
            );

        });

        return (
            <g>
              <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="3" fill="red" />
                {childWires}
            </g>
        );

	}

});


var ComponentWire = React.createClass({
	render: function(){

        var childSegments = this.props.wire.segments.map(function(wireSegment, index) {

            return (
                <ComponentWireSegment key={index} segment={wireSegment}/>
            );

        });

        return (
            <g className="component-wire" id={this.props.wire.id}>
                {{childSegments}}
                // <component-wire-corner ng-repeat="segment in wire.segments"></component-wire-corner>
            </g>
        );
    }
});


var ComponentWireSegment = React.createClass({
    render: function(){

        return (
            <g className="component-wire-segment"
               // ng-mousedown="onMouseDown(segment, $event)"
               // ng-mouseup="onMouseUp(segment, $event)"
               >
                  <line className="component-wire-segment-under"
                        x1={this.props.segment.x1}
                        y1={this.props.segment.y1}
                        x2={this.props.segment.x2}
                        y2={this.props.segment.y2}/>

                  <line className="component-wire-segment-segment"
                        x1={this.props.segment.x1}
                        y1={this.props.segment.y1}
                        x2={this.props.segment.x2}
                        y2={this.props.segment.y2}/>
            </g>
        );

    }
});
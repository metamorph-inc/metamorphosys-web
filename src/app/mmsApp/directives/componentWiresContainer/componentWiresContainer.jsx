'use strict';

angular.module('mms.designEditor.componentWiresContainer.react', [])
    .directive('componentWiresContainerReact', 
        function(diagramService, gridService) {

            function ComponentWiresContainerController() {
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
                    diagramId: '='
                },
                require: ['componentWiresContainerReact', '^svgDiagram'],
                link: function(scope, element, attr, controllers) {

                    var ctrl = controllers[0],
                        diagram,
                        grid;

                    function cleanup() {

                      React.unmountComponentAtNode(element[0]);

                      if (diagram) {
                        diagram.removeEventListener('wireChange', render);
                      }

                      if (grid) {
                        gridService.addEventListener('visibleComponentsChanged', render);
                      }

                    }

                    function render() {
                        var wires = grid.visibleWires;
                        //console.log('rendering');
                        React.render(<ComponentWiresContainer wires={wires}/>, element[0]);    
                    }

                    scope.$watch(function() {
                        return ctrl.diagramId;
                    }, function(newId, oldId){

                        if (oldId !== newId && newId != null) {

                            cleanup();

                            diagram = diagramService.getDiagram(newId);
                            grid = gridService.getGrid(newId);

                            if (diagram) {
                                diagram.addEventListener('wireChange', render);
                            }

                            if (grid) {
                                gridService.addEventListener('visibleComponentsChanged', render);
                            }

                            render();
                        }
                    });

                    scope.$on('$destroy', cleanup());

                }
            };
        }
    );

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
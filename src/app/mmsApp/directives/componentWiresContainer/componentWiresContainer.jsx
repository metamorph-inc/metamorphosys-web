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
                transclude: false,
                template: '<g class="wire-container"></g>',
                templateNamespace: 'SVG',
                scope: {
                    diagramId: '='
                },
                require: ['componentWiresContainerReact', '^svgDiagram'],
                link: function(scope, element, attr, controllers) {

                    var ctrl = controllers[0],
                        svgDiagramCtrl = controllers[1],
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
                        //element[0].parentNode.innerHTML = '';
                        React.render(<ComponentWiresContainer wires={wires} diagramCtrl={svgDiagramCtrl}/>, element[0]);    
                    }

                    scope.$watch(function() {
                        return ctrl.diagramId;
                    }, function(newId, oldId){

                        if ((oldId !== newId || oldId != null) && newId != null) {

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

        var self = this;

		var childWires = this.props.wires.map(function(wire){

            return (
                <ComponentWire key={wire.id} wire={wire} diagramCtrl={self.props.diagramCtrl}/>
            );

        });

        return (
            <g>
                {childWires}
            </g>
        );

	}

});


var ComponentWire = React.createClass({
	render: function(){

        var self = this,
            childSegments = [],
            childCorners = [],

            wireSegment,
            l, i;

        l = this.props.wire.segments.length;

        for (i = 0; i < l; i++) {

            wireSegment = this.props.wire.segments[i];

            childSegments.push(
                <ComponentWireSegment key={i} wire={self.props.wire} segment={wireSegment} diagramCtrl={self.props.diagramCtrl}/>
            );

            if (i !== l - 1) {
                childCorners.push(
                    <ComponentWireCorner key={i} wire={self.props.wire} segment={wireSegment} diagramCtrl={self.props.diagramCtrl}/>
                );
            }
        }

        return (
            <g className="component-wire" id={this.props.wire.id}>
                {childSegments}
                {childCorners}
            </g>
        );
    }
});


var ComponentWireSegment = React.createClass({

    shouldComponentUpdate: function(nextProps) {
      return (
        nextProps.segment.x1 !== this.props.segment.x1 ||
        nextProps.segment.x2 !== this.props.segment.x2 ||
        nextProps.segment.y1 !== this.props.segment.y1 ||
        nextProps.segment.y2 !== this.props.segment.y2
        );
    },

    onMouseDown: function(e) {
        //console.log('onMouseDown ()', e); 
        this.props.diagramCtrl.onWireMouseDown(this.props.wire, this.props.segment, e);
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    },

    onMouseUp: function(e) {
        //console.log('onMouseUp', e);        
        this.props.diagramCtrl.onWireMouseUp(this.props.wire, this.props.segment, e);        
    },

    render: function(){

        return (
            <g className="component-wire-segment"
               onMouseDown={this.onMouseDown}
               onMouseUp={this.onMouseUp}
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

var ComponentWireCorner = React.createClass({

    shouldComponentUpdate: function(nextProps) {
      return (
        nextProps.segment.x2 !== this.props.segment.x2 ||
        nextProps.segment.y2 !== this.props.segment.y2
        );
    },

    onMouseDown: function(e) {
        //console.log('onMouseDown ()', e); 
        this.props.diagramCtrl.onWireCornerMouseDown(this.props.wire, this.props.segment, e);
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    },

    onMouseUp: function(e) {
        //console.log('onMouseUp', e);        
        this.props.diagramCtrl.onWireCornerMouseUp(this.props.wire, this.props.segment, e);        
    },

    render: function(){

        return (
            <rect className="component-wire-corner"
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                x={this.props.segment.x2 - 3}
                y={this.props.segment.y2 - 3}
                width="6" height="6" fill="black" strokeWidth="1"/>
              );

    }
});
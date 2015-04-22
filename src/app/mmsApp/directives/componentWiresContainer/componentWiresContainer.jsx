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
                <ComponentWire key={wire.getId()} wire={wire} diagramCtrl={self.props.diagramCtrl}/>
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
            l, i,
            segments = this.props.wire.getSegments();

        l = segments.length;

        for (i = 0; i < l; i++) {

            wireSegment = segments[i];

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
            <g className="component-wire" id={this.props.wire.getId()}>
                {childSegments}
                {childCorners}
            </g>
        );
    }
});


var ComponentWireSegment = React.createClass({

    shouldComponentUpdate: function(nextProps) {

        var nextParameters = nextProps.segment.getParameters(),
            parameters = this.props.segment.getParameters();

      return (
        nextParameters.x1 !== parameters.x1 ||
        nextParameters.x2 !== parameters.x2 ||
        nextParameters.y1 !== parameters.y1 ||
        nextParameters.y2 !== parameters.y2
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

        var parameters = this.props.segment.getParameters();

        return (
            <g className="component-wire-segment"
               onMouseDown={this.onMouseDown}
               onMouseUp={this.onMouseUp}
               >
                  <line className="component-wire-segment-under"
                        x1={parameters.x1}
                        y1={parameters.y1}
                        x2={parameters.x2}
                        y2={parameters.y2}/>

                  <line className="component-wire-segment-segment"
                        x1={parameters.x1}
                        y1={parameters.y1}
                        x2={parameters.x2}
                        y2={parameters.y2}/>
            </g>
        );

    }
});

var ComponentWireCorner = React.createClass({

    shouldComponentUpdate: function(nextProps) {

        var nextParameters = nextProps.segment.getParameters(),
            parameters = this.props.segment.getParameters();


          return (
            nextParameters.x2 !== parameters.x2 ||
            nextParameters.y2 !== parameters.y2
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

        var parameters = this.props.segment.getParameters();

        return (
            <rect className="component-wire-corner"
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                x={parameters.x2 - 3}
                y={parameters.y2 - 3}
                width="6" height="6" fill="black" strokeWidth="1"/>
              );

    }
});
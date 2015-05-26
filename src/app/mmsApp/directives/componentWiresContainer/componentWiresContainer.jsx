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
                        diagram.removeEventListener('selectionChange', render);                        
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
                                diagram.addEventListener('selectionChange', render);                                
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

            className = 'component-wire',

            wireSegment,
            l, i,
            segments = this.props.wire.getSegments();

        l = segments.length;

        for (i = 0; i < l; i++) {

            wireSegment = segments[i];

            childSegments.push(
                <ComponentWireSegment key={i} wire={self.props.wire} segment={wireSegment} diagramCtrl={self.props.diagramCtrl} crossOversTimeStamp={wireSegment._crossOversTimeStamp}/>
            );

            if ( ( self.props.wire.selected || wireSegment._endCornerSelected ) && ( i !== l - 1) ) {

                childCorners.push(
                    <ComponentWireCorner key={i} wire={self.props.wire} segment={wireSegment} diagramCtrl={self.props.diagramCtrl} selected={wireSegment._endCornerSelected}/>
                );

            }
        }

        if (this.props.wire.selected) {
            className += ' selected';
        }

        return (
            <g className={className} id={this.props.wire.getId()}>
                {childSegments}
                {childCorners}
            </g>
        );
    }
});

var crossOverArc = 'c0 -4, 5 -4, 5 0';

var ComponentWireSegment = React.createClass({

    shouldComponentUpdate: function(nextProps) {

        var nextParameters = nextProps.segment._parameters,
            parameters = this.props.segment._parameters;

            // console.log('Should I update?', 
            //     nextParameters.x1 - parameters.x1, 
            //     nextParameters.x2 - parameters.x2,
            //     nextParameters.y1 - parameters.y1,
            //     nextParameters.y2 - parameters.y2
            // );

      return (
            nextParameters.x1 !== parameters.x1 ||
            nextParameters.x2 !== parameters.x2 ||
            nextParameters.y1 !== parameters.y1 ||
            nextParameters.y2 !== parameters.y2 ||
            nextProps.crossOversTimeStamp !== this.props.crossOversTimeStamp
        );
    },

    onMouseDown: function(e) {
       // console.log('onMouseDown ()', e); 
        this.props.diagramCtrl.onWireMouseDown(this.props.wire, this.props.segment, e);
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    },

    onMouseUp: function(e) {
        //console.log('onMouseUp', e);        
        this.props.diagramCtrl.onWireMouseUp(this.props.wire, this.props.segment, e);        
    },

    render: function(){

        var parameters = this.props.segment._parameters,
            crossOver,
            lines,
            d,
            i;

           lines = [<line className="component-wire-segment-under"
                                        key={0}
                                        x1={parameters.x1}
                                        y1={parameters.y1}
                                        x2={parameters.x2}
                                        y2={parameters.y2}/>];

           if (Array.isArray(this.props.segment._crossOvers)) {

                d = 'M' + this.props.segment._loX + ' ' + parameters.y1;

                for (i = 0; i < this.props.segment._crossOvers.length; i++) {

                    crossOver = this.props.segment._crossOvers[i];

                    d += 'L' + (crossOver.crossingSegment._parameters.x1 - 3) + ' ' + parameters.y1 + crossOverArc;
                    
                }

                d += 'L' + this.props.segment._hiX + ' ' + parameters.y2;

                lines.push(<path key={1} className="component-wire-segment-segment" d={d}/>);

            } else {

                lines.push(
                        <line className="component-wire-segment-segment"
                            key={1}                    
                            x1={parameters.x1}
                            y1={parameters.y1}
                            x2={parameters.x2}
                            y2={parameters.y2}/>
                            );
            }

        return (
            <g className="component-wire-segment"
               onMouseDown={this.onMouseDown}
               onMouseUp={this.onMouseUp}
               >
                {lines}
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
            nextParameters.y2 !== parameters.y2 ||
            nextProps.selected !== this.props.selected
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

        var parameters = this.props.segment.getParameters(),
            classString = 'component-wire-corner';

        if (this.props.selected) {
            classString += ' selected'
        }

        return (
            <rect className={classString}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                x={parameters.x2 - 3}
                y={parameters.y2 - 3}
                width="6" height="6" fill="black" strokeWidth="1"/>
              );

    }
});
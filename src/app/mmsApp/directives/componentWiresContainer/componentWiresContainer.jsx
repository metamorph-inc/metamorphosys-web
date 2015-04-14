'use strict';

angular.module('mms.designEditor.componentWiresContainer.react', [])
    .directive('componentWiresContainerReact', [
        function() {

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
                scope: {
					wires: '='
                },
                require: ['^svgDiagram'],
                link: function(scope, element) {

					React.render(<ComponentWiresContainer wires="{{ctrl.wires}}"/>, element[0]);

                }
            };
        }
    ]);

var ComponentWiresContainer = React.createClass({

	render: function() {

		return (
			<g>
				<ComponentWire/>
			</g>
		);

	}

});


var ComponentWire = React.createClass({
	render: function(){



	}
});
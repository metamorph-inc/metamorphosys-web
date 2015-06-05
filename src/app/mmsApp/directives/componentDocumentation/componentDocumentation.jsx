'use strict';

angular.module('mms.componentDocumentation.react', [])
    .directive('componentDocumentation',
        function() {

            function ComponentDocumentationController() {

                this.documentation = require('./dummyData/subscircuitDocumentation.json');

            }

            return {
                restrict: 'E',
                controller: ComponentDocumentationController,
                controllerAs: 'ctrl',
                bindToController: true,
                replace: true,
                transclude: false,
                template: '<div class="component-documentation"></div>',
                scope: {
                    //documentation: '='
                },
                require: ['componentDocumentation'],
                link: function(scope, element, attr, controllers) {

                    var ctrl = controllers[0];

                    function cleanup() {

                      React.unmountComponentAtNode(element[0]);


                    }

                    function render() {
                        React.render(<ComponentDocumentationTable documentation={ctrl.documentation}/>, element[0]);
                    }

                    scope.$watch(function() {
                        return ctrl.documentation.id;
                    }, function(newId, oldId){

                        if ((oldId !== newId || oldId != null) && newId != null) {

                            cleanup();
                            render();
                        }
                    });

                    scope.$on('$destroy', cleanup());

                }
            };
        }
    );


var ComponentDocumentationTable = React.createClass({

	render: function() {

        var self = this;

        return (
            <div className="component-documentation-table">
                <ComponentDescription description={this.props.documentation.description} icon={this.props.documentation.icon}/>
                <ComponentVisuals images={this.props.documentation.images}></ComponentVisuals>
                <h3>Connectors:</h3>
                <ConnectorsDescription connectors={this.props.documentation.connectors}/>
            </div>
        );
	}
});


var ComponentDescription = React.createClass({

	render: function() {

        var self = this;

        return (
            <div className="component-description">
                <div className="component-description-text">
                    {this.props.description}
                </div>
                <img src={this.props.icon} className="component-icon"/>
            </div>
        );
	}
});


var ComponentVisuals = React.createClass({

	render: function() {

        var self = this;

        return (
            <div className="component-visuals">
                <img src={this.props.icon} className="component-icon"/>
            </div>
        );
	}
});


var ConnectorsDescription = React.createClass({

	render: function() {

        var self = this;

        var connectors = this.props.connectors.map(function(connectorDescription) {
            return <ConnectorDescription connector={connectorDescription}/>;
        });

        return (
            <div className="connectors-description">
                <ul className="connectors-description-list">
                    {connectors}
                </ul>
            </div>
        );
	}
});

var ConnectorDescription = React.createClass({

	render: function() {

        var self = this;

        return (
            <li className="connectors-description">
                <div class="connector-name">{this.props.connector.name}</div>
                <div class="connector-type">{this.props.connector.type}</div>
                <div clasw="connector-description">{this.props.connector.description}</div>
            </li>
        );
	}
});

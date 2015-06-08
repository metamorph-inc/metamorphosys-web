'use strict';

angular.module('mms.componentDocumentation.react', [])
    .directive('componentDocumentation',
        function() {

            function ComponentDocumentationController() {

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
                    documentation: '='
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
                        if (ctrl.documentation) {
                            return ctrl.documentation.id;
                        }
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

        var self = this,
            className = "component-documentation-table",
            componentVisuals;

        if (!this.props.documentation.visuals) {
            className += ' no-visuals';
        } else {
            componentVisuals = <ComponentVisuals images={this.props.documentation.visuals}></ComponentVisuals>;
        }

        return (
            <div className={className}>
                <ComponentDescription description={this.props.documentation.description} icon={this.props.documentation.icon}/>
                {componentVisuals}
                <ConnectorsDescription connectors={this.props.documentation.connectors}/>
            </div>
        );
	}
});


var ComponentDescription = React.createClass({

	render: function() {

        var self = this,
            className = "component-description",
            icon;

        if (!this.props.icon) {
            className += ' no-icon';
        } else {
            icon = <img src={this.props.icon} className="component-icon"/>;
        }

        return (
            <div className={className}>
                <div className="component-description-text">
                    {this.props.description}
                </div>
                <div className="component-icon-container">
                    {icon}
                </div>
            </div>
        );
	}
});


var ComponentVisuals = React.createClass({

	render: function() {

        var self = this,
            activeVisual = 0;

        var images = this.props.images.map(function(imageUrl, index) {

            var className = 'component-visual';

            if (index === activeVisual) {
                className += ' active';
            }

            return <img src={imageUrl} className={className}/>;
        });

        return (
            <div className="component-visuals">
                {images}
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
                <h3>Connectors:</h3>
                {connectors}
            </div>
        );
	}
});

var ConnectorDescription = React.createClass({

	render: function() {

        var self = this,
            connectorDetails;

        connectorDetails = <div className="connector-name">{this.props.connector.name}</div>;

        if (this.props.connector.type) {
            connectorDetails += <div className="connector-type">{this.props.connector.type}</div>;
        }

        if (this.props.connector.description) {
            connectorDetails += <div className="connector-description-text">{this.props.connector.description}</div>;
        }

        return (
            <div className="connector-description">
                {connectorDetails}
            </div>
        );
	}
});

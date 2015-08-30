/*globals angular */

'use strict';

angular.module('mms.connectorService', [

    ])
    .service('connectorService',
        function($log, $compile, nodeService ) {

            var cloneConnector,
                isNodeConnected,
                updatePortDecorator;

            /**
             * Modifies targetConnector to have the same Description and children as srcConnector
             * @param srcConnector
             * @param targetConnector
             * @returns {*}
             */
            cloneConnector = function (srcConnector, targetConnector, layoutContext) {

                var definition = srcConnector.getAttribute('Definition');
                targetConnector.setAttribute('Definition', definition);

                // Copy content
                var nodesToCopy = {};

                return srcConnector.loadChildren(layoutContext)
                    .then(function (children) {

                        children.forEach(function (child) {

                            nodesToCopy[child.id] = child;

                        });

                        nodeService.copyMoreNodes(layoutContext, targetConnector.id, nodesToCopy);
                    });
            };

            /**
             * Given a model object, see if there are any connections that include it as SRC or DST
             * @param node
             * @returns {boolean} True if it's a connection endpoint
             */
            isNodeConnected = function(node) {

                var sources = node.getCollectionPaths('src');
                var destinations = node.getCollectionPaths('dst');

                if (sources.length + destinations.length > 0) {

                    return true;

                } else {

                    return false;

                }
            };

            updatePortDecorator = function(port, decorator) {

                port.portSymbol.portDecorator = decorator;

            }


            this.updateConnectorDefinition = function(wire, layoutContext) {

                var port1Node,
                    port2Node,
                    port1Component = wire.getEnd1().port,
                    port2Component = wire.getEnd2().port,
                    port1ParentType,
                    port2ParentType,
                    meta;

                return nodeService.getMetaNodes(layoutContext)
                    .then(function(meta_) {
                        meta = meta_
                    })
                    .then(function() {
                        return nodeService.loadNode(layoutContext, port1Component.id);
                    })
                    .then(function (port1_) {
                        port1Node = port1_;

                        return nodeService.loadNode(layoutContext, port2Component.id);
                    })
                    .then(function (port2_) {
                        port2Node = port2_;

                        return port1Node.getParentNode();
                    })
                    .then(function(port1ParentNode) {
                        port1ParentType = port1ParentNode.getMetaTypeName(meta);

                        return port2Node.getParentNode();
                    })
                    .then(function(port2ParentNode) {
                        port2ParentType = port2ParentNode.getMetaTypeName(meta);
                    })
                    .then(function () {

                        var port1Def = port1Node.getAttribute('Definition');
                        var port2Def = port2Node.getAttribute('Definition');
                        var port1IsTyped = port1Def !== '';
                        var port2IsTyped = port2Def !== '';

                        // Logic block for handling connection based on definitions
                        if (port1IsTyped === false && port2IsTyped === true) {
                            // Transfer port2's type to port1 only if port1's parent is container or connector adapter
                            if (port1ParentType === 'Container' || port1ParentType === 'ConnectorAdapter') {
                                updatePortDecorator(port1Component, port2Component.portSymbol.portDecorator);
                                return cloneConnector(port2Node, port1Node, layoutContext);
                            }
                        }
                        else if (port1IsTyped === true && port2IsTyped === false) {
                            // Transfer port1's type to port2 only if port2's parent is container or connector adapter
                            if (port2ParentType === 'Container' || port2ParentType === 'ConnectorAdapter') {
                                updatePortDecorator(port2Component, port1Component.portSymbol.portDecorator);
                                return cloneConnector(port1Node, port2Node, layoutContext);
                            }
                        }
                        else if (port1IsTyped === true && port2IsTyped === true) {
                            $log.debug('Both', port1Node.getAttribute('name'),
                                'and', port2Node.getAttribute('name'), 'are typed');
                        }
                        else if (port1IsTyped === false && port2IsTyped === false) {
                            $log.debug('Neither', port1Node.getAttribute('name'),
                                'nor', port2Node.getAttribute('name'), 'are typed');
                        }
                        else {
                            $log.error('Failure in type detection logic when considering',
                                port1Node.getAttribute('name'), 'and', port2Node.getAttribute('name'));
                        }
                    });


            };

            /**
             * Test a connector to see if its type inference is still valid.
             * If its type can no longer be inferred, remove its type by
             * destroying its children and clearing the Description attribute.
             * @param connector
             * @returns {*}
             */
            this.testConnectorForInferredTypeRemoval = function(connector, layoutContext, port) {
                // Does this guy (or his ports) have any connections?
                // If not, and his parent is a Container, then strip his Connector typing info.

                var meta;
                return nodeService.getMetaNodes(layoutContext)
                    .then(function(meta_) {
                        meta = meta_;
                        return connector.getParentNode();
                    })
                    .then(function(parent) {
                        var parentMetaTypeName = parent.getMetaTypeName(meta);
                        if (parentMetaTypeName === 'Container' || parentMetaTypeName === 'ConnectorAdapter') {

                            if (isNodeConnected(connector)) {
                                $log.debug(connector.getAttribute('name'), 'has connections and won\'t be de-typed');
                            } else {
                                return connector.loadChildren()
                                    .then(function (children) {
                                        // If no children are connected, de-type this connector
                                        if (children.filter(isNodeConnected).length === 0) {
                                            $log.debug(connector.getAttribute('name'), 'will be de-typed');
                                            connector.setAttribute('Definition', '');

                                            updatePortDecorator(port, null);

                                            children.forEach(function (child) {
                                                child.destroy();
                                            });
                                        } else {
                                            $log.debug(connector.getAttribute('name'), 'has a connected port and won\'t be de-typed');
                                        }
                                    });
                            }
                        }
                    });
            };

            /*
                Updates Angular model of the connector component.
             */
            this.updateConnectorModel = function(port, connectorData) {

                if (port) {

                    port.portSymbol.portDecorator = connectorData.decorator;

                    port.setPortType(connectorData.type,
                                     connectorData.description,
                                     connectorData.decorator);

                }

            };

        }
    );
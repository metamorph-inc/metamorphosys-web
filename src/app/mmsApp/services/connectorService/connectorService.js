/*globals angular */

'use strict';

angular.module('mms.connectorService', [

    ])
    .service('connectorService',
        function($log, $compile, nodeService ) {

            var cloneConnector,
                isNodeConnected;

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


            this.updateConnectorDefinition = function(wire, layoutContext) {

                var port1,
                    port2;

                return nodeService.loadNode(layoutContext, wire.getEnd1().port.id)
                    .then(function (port1_) {
                        port1 = port1_;

                        return nodeService.loadNode(layoutContext, wire.getEnd2().port.id);
                    })
                    .then(function (port2_) {
                        port2 = port2_;

                        var port1Def = port1.getAttribute('Definition');
                        var port2Def = port2.getAttribute('Definition');
                        var port1IsTyped = port1Def !== '';
                        var port2IsTyped = port2Def !== '';

                        // Logic block for handling connection based on definitions
                        if (port1IsTyped === false && port2IsTyped === true) {
                            // Transfer port2's type to port1
                            return cloneConnector(port2, port1, layoutContext);
                        }
                        else if (port1IsTyped === true && port2IsTyped === false) {
                            // Transfer port1's type to port2
                            return cloneConnector(port1, port2, layoutContext);
                        }
                        else if (port1IsTyped === true && port2IsTyped === true) {
                            $log.debug('Both', port1.getAttribute('name'),
                                'and', port2.getAttribute('name'), 'are typed');
                        }
                        else if (port1IsTyped === false && port2IsTyped === false) {
                            $log.debug('Neither', port1.getAttribute('name'),
                                'nor', port2.getAttribute('name'), 'are typed');
                        }
                        else {
                            $log.error('Failure in type detection logic when considering',
                                port1.getAttribute('name'), 'and', port2.getAttribute('name'));
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
            this.testConnectorForInferredTypeRemoval = function(connector, layoutContext) {
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
                        if (parentMetaTypeName === 'Container' || parentMetaTypeName === 'JunctionBox') {

                            if (isNodeConnected(connector)) {
                                $log.debug(connector.getAttribute('name'), 'has connections and won\'t be de-typed');
                            } else {
                                return connector.loadChildren()
                                    .then(function (children) {
                                        // If no children are connected, de-type this connector
                                        if (children.filter(isNodeConnected).length === 0) {
                                            $log.debug(connector.getAttribute('name'), 'will be de-typed');
                                            connector.setAttribute('Definition', '');

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
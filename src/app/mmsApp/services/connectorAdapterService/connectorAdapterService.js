/*globals angular*/

'use strict';

angular.module('mms.connectorAdapterService', ['cyphy.services'])
    .service('connectorAdapterService', function ($q, $timeout, nodeService, gmeMapService, $log) {

        var self = this;

        this.message = function() {
            console.log('message');
        };

        this.loadData = function (parentContext, connectorAdapterId) {
            // Get each connector
            // For each connector, get its ports
            // For each port, we want the type and ID

            // TODO: Get any PortMaps.

            var connectorAdapterData = {
                connectors: []
            };
            var mappings = [];
            var connectorAdapterObj;

            var meta;
            return nodeService.getMetaNodes(parentContext)
                .then(function (meta_) {
                    meta = meta_;
                })
                .then(function() {
                    return nodeService.loadNode(parentContext, connectorAdapterId);
                })
                .then(function (connectorAdapter) {
                    connectorAdapterObj = connectorAdapter;
                    return connectorAdapter.loadChildren();
                })
                .then(function (children) {

                    var isConnector = function (obj) {
                        return obj.getMetaTypeName(meta) === 'Connector';
                    };
                    var isMapping = function (obj) {
                        return obj.getMetaTypeName(meta) === 'PortMap';
                    };

                    // Get maps
                    children.forEach(function (child) {
                        if (isMapping(child)) {

                            mappings.push([child.getPointer('src').to, child.getPointer('dst').to]);

                        }
                    });

                    // Do connectors. Sort by number of ports, most ports first.
                    children.forEach(function (child) {
                        if (isConnector(child)) {
                            var connector = child;

                            var connectorData = {
                                name: connector.getAttribute('name'),
                                id: connector.id,
                                ports: []
                            };

                            connectorAdapterData.connectors.push(connectorData);

                            connector.loadChildren()
                                .then(function (ports) {
                                    ports.forEach(function (port) {

                                        var portData = {
                                            name: port.getAttribute('name'),
                                            id: port.id,
                                            type: port.getAttribute('Type'),
                                            mapping: {}
                                        };

                                        mappings.forEach(function (mapping) {
                                            if (mapping[0] === port.id) {
                                                portData.mapping[mapping[1]] = true;
                                            }
                                            else if (mapping[1] === port.id) {
                                                portData.mapping[mapping[0]] = true;
                                            }
                                        });

                                        connectorData.ports.push(portData);

                                    });

                                    // We want connectors sorted from least number of ports to greatest
                                    connectorAdapterData.connectors.sort(function(a, b) {
                                        return a.ports.length <= b.ports.length ? -1 : 1;
                                    });
                                });
                            }
                    });

                    return connectorAdapterData;
                });
        };

        /**
         * Completely replaces the current mapping with one described by the argument idPairsToMap
         * @param parentContext
         * @param connectorAdapterId
         * @param idPairsToMap
         */
        this.setMapping = function(parentContext, connectorAdapterId, idPairsToMap) {

            nodeService.startTransaction(parentContext, 'New primitive creation');

            return nodeService.loadNode(parentContext, connectorAdapterId)
                .then(function (connectorAdapter) {

                    var portMapMetaId,
                        meta;

                    return nodeService.getMetaNodes(parentContext)
                        .then(function (meta_) {
                            portMapMetaId = meta_.byName.PortMap.id;
                            meta = meta_;
                        })
                        .then(function () {
                            return connectorAdapter.loadChildren();
                        })
                        .then(function (children) {
                            // Delete all maps inside the connector adapter.
                            children.forEach(function (child) {
                                if (child.getMetaTypeName(meta) === 'PortMap') {
                                    child.destroy();
                                }
                            });

                            var waitFor = [];

                            // Create new maps
                            idPairsToMap.forEach(function (idPair) {
                                var id1 = idPair[0];
                                var id2 = idPair[1];
                                waitFor.push(nodeService.createNode(parentContext, connectorAdapterId, portMapMetaId, 'New mapping')
                                    .then(function (portMap) {
                                        portMap.makePointer('src', id1);
                                        portMap.makePointer('dst', id2);

                                        return null;
                                    }));
                            });
                            return waitFor;
                        });
                })
                .then(function (nullArray) {
                    return nodeService.completeTransaction(parentContext);
                });

        };

    });

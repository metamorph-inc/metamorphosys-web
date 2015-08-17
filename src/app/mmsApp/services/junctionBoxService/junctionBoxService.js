/*globals angular*/

'use strict';

angular.module('mms.junctionBoxService', ['cyphy.services'])
    .service('junctionBoxService', function ($q, $timeout, nodeService, gmeMapService, $log) {

        var self = this;

        this.message = function() {
            console.log('message');
        };

        this.loadData = function (parentContext, junctionBoxId) {
            // Get each connector
            // For each connector, get its ports
            // For each port, we want the type and ID

            // TODO: Get any PortMaps.

            var junctionBoxData = {
                connectors: []
            };
            var mappings = [];
            var junctionBoxObj;

            var meta;
            return nodeService.getMetaNodes(parentContext)
                .then(function (meta_) {
                    meta = meta_;
                })
                .then(function() {
                    return nodeService.loadNode(parentContext, junctionBoxId);
                })
                .then(function (junctionBox) {
                    junctionBoxObj = junctionBox;
                    return junctionBox.loadChildren();
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
                    children.sort(function(a, b) {return a.getAttribute('name') > b.getAttribute('name')})
                        .forEach(function (child, index) {
                            if (isConnector(child)) {
                                var connector = child;

                                var connectorData = {
                                    name: connector.getAttribute('name'),
                                    id: connector.id,
                                    ports: []
                                };

                                junctionBoxData.connectors.push(connectorData);

                                connector.loadChildren()
                                    .then(function (ports) {
                                        ports.forEach(function (port) {

                                            var portData = {
                                                name: port.getAttribute('name'),
                                                id: port.id,
                                                type: port.getAttribute('Type'),
                                                mapping: null
                                            };

                                            // Track mappings for first port only
                                            if (index === 0) {
                                                mappings.forEach(function (mapping) {
                                                    if (mapping[0] === port.id) {
                                                        portData.mapping = mapping[1];
                                                    }
                                                    else if (mapping[1] === port.id) {
                                                        portData.mapping = mapping[0];
                                                    }
                                                });
                                            }

                                            connectorData.ports.push(portData);

                                        });
                                    });
                                }
                        });

                    console.log(junctionBoxData);
                    return junctionBoxData;
                });
        };


        this.getMappedPortId = function(junctionBoxId, portId) {
            return nodeService.loadNode(junctionBoxId, portId)
                .then(function(port) {
                    var sources = port.getCollectionPaths('src');
                    var destinations = port.getCollectionPaths('dst');

                    var combined = Array.prototype.push.apply(sources, destinations);

                    if (combined.length === 0) {
                        return null;
                    }
                    else {
                        return combined[0].id;
                    }
                });
        };

        /**
         * Completely replaces the current mapping with one described by the argument idPairsToMap
         * @param parentContext
         * @param junctionBoxId
         * @param idPairsToMap
         */
        this.setMapping = function(parentContext, junctionBoxId, idPairsToMap) {

            nodeService.startTransaction(parentContext, 'New primitive creation');

            return nodeService.loadNode(parentContext, junctionBoxId)
                .then(function (junctionBox) {

                    var portMapMetaId,
                        meta;

                    return nodeService.getMetaNodes(parentContext)
                        .then(function (meta_) {
                            portMapMetaId = meta_.byName.PortMap.id;
                            meta = meta_;
                        })
                        .then(function () {
                            return junctionBox.loadChildren();
                        })
                        .then(function (children) {
                            // Delete all maps inside junction box.
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
                                waitFor.push(nodeService.createNode(parentContext, junctionBoxId, portMapMetaId, 'New mapping')
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
                    nodeService.completeTransaction(parentContext);
                });

        };

    });

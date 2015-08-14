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
                connectors: [],
                mappings: []
            };

            return nodeService.loadNode(parentContext, junctionBoxId)
                .then(function (junctionBox) {

                    return junctionBox.loadChildren();

                })
                .then(function (children) {

                    nodeService.getMetaNodes(parentContext)
                        .then(function(meta) {

                            var isConnector = function(obj) {
                                return obj.getMetaTypeName(meta) === 'Connector';
                            };
                            var isMapping = function(obj) {
                                return obj.getMetaTypeName(meta) === 'PortMap';
                            };

                            children.forEach(function(child) {
                                if (isConnector(child)) {
                                    var connector = child;

                                    var connectorData = {
                                        name: connector.getAttribute('name'),
                                        id: connector.id,
                                        ports: []
                                    };

                                    connector.loadChildren()
                                        .then(function (ports) {
                                            ports.forEach(function (port) {

                                                var portData = {
                                                    name: port.getAttribute('name'),
                                                    id: port.id,
                                                    type: port.getAttribute('Type')
                                                };

                                                connectorData.ports.push(portData);

                                            });
                                        })
                                        .then(function () {

                                            junctionBoxData.connectors.push(connectorData);

                                        });
                                }
                                else if (isMapping(child)) {

                                    junctionBoxData.mappings.push([child.getPointer('src').to, child.getPointer('dst').to]);

                                }
                            });

                        });

                    // Sort so that the connector with the most ports comes first.
                    junctionBoxData.connectors = junctionBoxData.connectors.sort(function (a, b) {
                        return a.ports.length < b.ports.length;
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

    });

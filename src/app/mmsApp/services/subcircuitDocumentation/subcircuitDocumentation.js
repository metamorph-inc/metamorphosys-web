/*globals angular*/

'use strict';

angular.module('mms.subcircuitDocumentation', ['cyphy.services'])
    .service('subcircuitDocumentation', function ($q, $timeout, nodeService, gmeMapService, $log) {

        var self = this,
            watchers;

        this.loadDocumentation = function (parentContext, containerId) {
            var regionId = parentContext.regionId + '_subcircuitDocumentation_' + containerId;
            var context = {
                db: parentContext.db,
                regionId: regionId
            };

            return nodeService.loadNode(parentContext, containerId)
                .then(function () {
                    return gmeMapService.mapGmeNode(parentContext, containerId, {
                        'Container': {
                            attributes: {name: 'name', Description: 'description'}
                        },
                        'Connector': {
                            attributes: {name: 'name', Description: 'description', Definition: 'type'}
                        }
                    });
                }).then(function (data) {
                    return {
                        "id": data.data._id,
                        "description": data.data.description,
                        "name": data.data.name,
                        "connectors": data.data.Connector
                    };
                });
        };
    });

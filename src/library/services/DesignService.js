/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module('cyphy.services')
    .service('DesignService', function ($q, NodeService, BaseCyPhyService) {
        'use strict';
        var watchers = {};

        this.deleteDesign = function (designId) {
            throw new Error('Not implemented yet.');
        };

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the component.
         * @param {string} context.db - Must exist within watchers and contain the component.
         * @param {string} context.regionId - Must exist within watchers and contain the component.
         * @param {string} designId - Path to design-space.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setDesignAttributes = function (context, designId, attrs) {
            return BaseCyPhyService.setNodeAttributes(context, designId, attrs);
        };

        this.exportDesign = function (designId) {
            throw new Error('Not implemented yet.');
        };

        this.calculateConfigurations = function (data) {
            throw new Error('Not implemented yet.');
        };

        this.saveConfigurationSet = function (designId, data) {
            throw new Error('Not implemented yet.');
        };

        /**
         *  Watches all containers (existence and their attributes) of a workspace.
         * @param parentContext - context of controller.
         * @param workspaceId
         * @param updateListener - invoked when there are (filtered) changes in data. Data is an object in data.designs.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchDesigns = function (parentContext, workspaceId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchDesigns',
                context = {
                    db: parentContext.db,
                    projectId: parentContext.projectId,
                    branchId: parentContext.branchId,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    designs: {} // design {id: <string>, name: <string>, description: <string>}
                },
                onUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDesc = this.getAttribute('INFO'),
                        hadChanges = false;
                    if (newName !== data.designs[id].name) {
                        data.designs[id].name = newName;
                        hadChanges = true;
                    }
                    if (newDesc !== data.designs[id].description) {
                        data.designs[id].description = newDesc;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        updateListener({id: id, type: 'update', data: data.designs[id]});
                    }
                },
                onUnload = function (id) {
                    delete data.designs[id];
                    updateListener({id: id, type: 'unload', data: null});
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            designId,
                            queueList = [],
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ADMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.Container)) {
                                designId = childNode.getId();
                                data.designs[designId] = {
                                    id: designId,
                                    name: childNode.getAttribute('name'),
                                    description: childNode.getAttribute('INFO')
                                };
                                childNode.onUnload(onUnload);
                                childNode.onUpdate(onUpdate);
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ADMFolder)) {
                                watchFromFolderRec(newChild, meta);
                            } else if (newChild.isMetaTypeOf(meta.Container)) {
                                designId = newChild.getId();
                                data.designs[designId] = {
                                    id: designId,
                                    name: newChild.getAttribute('name'),
                                    description: newChild.getAttribute('INFO')
                                };
                                newChild.onUnload(onUnload);
                                newChild.onUpdate(onUpdate);
                                updateListener({id: designId, type: 'load', data: data.designs[designId]});
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                recDeferred.resolve();
                            });
                        }
                    });

                    return recDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            NodeService.getMetaNodes(context).then(function (meta) {
                NodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.ADMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ADMFolder)) {
                                    watchFromFolderRec(newChild, meta);
                                }
                            });
                            if (queueList.length === 0) {
                                deferred.resolve(data);
                            } else {
                                $q.all(queueList).then(function () {
                                    deferred.resolve(data);
                                });
                            }
                        });
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches a design w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param designId
         * @param updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchDesignDetails = function (parentContext, designId, updateListener) {
            throw new Error('Not implemented yet.');
        };

        /**
         *  Watches the full hierarchy of a design w.r.t. containers and components.
         * @param parentContext - context of controller.
         * @param designId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchDesignStructure = function (parentContext, designId, updateListener) {
            throw new Error('Not implemented yet.');
        };

        // FIXME: watchConfigurationSets and watchConfigurations should probably go to a DesertConfiguration-Service,
        // with a related controller DesertConfigurationSetList, where details are configurations.
        /**
         *  Watches the generated DesertConfigurationSets inside a Design.
         * @param parentContext - context of controller.
         * @param designId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchConfigurationSets = function (parentContext, designId, updateListener) {
            var deferred = $q.defer(),
                data = {
                    name: null,
                    id: designId,
                    regionId: null,
                    cfgSets: {}
                },
                context = {
                    db: parentContext.db,
                    projectId: parentContext.projectId,
                    branchId: parentContext.branchId,
                    regionId: parentContext.regionId + '_watchConfigurationSets_' + designId
                };
            data.regionId = context.regionId;
            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            console.log('Added new watcher: ', watchers);
            NodeService.logContext(context);
            NodeService.getMetaNodes(context).then(function (meta) {
                NodeService.loadNode(context, designId)
                    .then(function (designNode) {
                        data.name = designNode.getAttribute('name');
                        designNode.loadChildren(context)
                            .then(function (childNodes) {
                                var i,
                                    onUpdate = function (id) {
                                        var newName = this.getAttribute('name'),
                                            newDesc = this.getAttribute('INFO');
                                        console.warn(newName);
                                        if (newName !== data.cfgSets[id].name ||
                                            newDesc !== data.cfgSets[id].description) {
                                            //data.cfgSets[id].name = newName;
                                            //console.warn('changed');
                                            updateListener(true);
                                        }
                                    },
                                    onUnload = function (id) {
                                        updateListener(true);
                                    };
                                for (i = 0; i < childNodes.length; i += 1) {
                                    if (childNodes[i].isMetaTypeOf(meta.DesertConfigurationSet)) {
                                        data.cfgSets[childNodes[i].getId()] = {
                                            id: childNodes[i].getId(),
                                            name: childNodes[i].getAttribute('name'),
                                            description: childNodes[i].getAttribute('INFO')
                                        };
                                        childNodes[i].onUpdate(onUpdate);
                                        childNodes[i].onUnload(onUnload);
                                    }
                                }
                                //console.log('cfgSets', cfgSets);
                                designNode.onNewChildLoaded(function (newNode) {
                                    if (newNode.isMetaTypeOf(meta.DesertConfigurationSet)) {
                                        updateListener(true);
                                    }
                                });
                                deferred.resolve(data);
                            });
                        designNode.onUpdate(function (id) {
                            var newName = this.getAttribute('name');
                            if (newName !== data.name) {
                                data.name = newName;
                                updateListener(true);
                            }
                        });
                    });
            });
            return deferred.promise;
        };

        /**
         * See BaseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function (parentContext) {
            BaseCyPhyService.cleanUpAllRegions(watchers, parentContext);
        };

        /**
         * See BaseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            BaseCyPhyService.cleanUpRegion(watchers, parentContext, regionId);
        };

        /**
         * See BaseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function (parentContext, fn) {
            BaseCyPhyService.registerWatcher(watchers, parentContext, fn);
        };
    });
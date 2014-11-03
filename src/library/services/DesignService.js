/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */


angular.module('cyphy.services')
    .service('designService', function ($q, nodeService, baseCyPhyService) {
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
            return baseCyPhyService.setNodeAttributes(context, designId, attrs);
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
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, workspaceId)
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
         *  Watches all containers (existence and their attributes) of a workspace.
         * @param {object} parentContext - context of controller.
         * @param {string} designId
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchNbrOfConfigurations = function (parentContext, designId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchNbrOfConfigurations_' + designId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    counters: {
                        sets: 0,
                        configurations: 0,
                        results: 0
                    }
                },
                watchConfiguration = function (cfgNode, meta, wasCreated) {
                    var cfgDeferred = $q.defer(),
                        resultOnUnload = function (id) {
                            data.counters.results -= 1;
                            updateListener({id: id, type: 'unload', data: data.counters});
                        };
                    // Count this set and add an unload handle.
                    data.counters.configurations += 1;
                    if (wasCreated) {
                        updateListener({id: cfgNode.getId(), type: 'load', data: data.counters});
                    }
                    cfgNode.onUnload(function (id) {
                        data.counters.configurations -= 1;
                        updateListener({id: id, type: 'unload', data: data.counters});
                    });
                    cfgNode.loadChildren().then(function (children) {
                        var i,
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.Result)) {
                                data.counters.results += 1;
                                childNode.onUnload(resultOnUnload);
                            }
                        }
                        cfgNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.Result)) {
                                data.counters.results += 1;
                                updateListener({id: newChild.getId(), type: 'load', data: data.counters});
                                childNode.onUnload(resultOnUnload);
                            }
                        });
                        cfgDeferred.resolve();
                    });

                    return cfgDeferred.promise;
                },
                watchConfigurationSet = function (setNode, meta, wasCreated) {
                    var setDeferred = $q.defer();
                    // Count this set and add an unload handle.
                    data.counters.sets += 1;
                    if (wasCreated) {
                        updateListener({id: setNode.getId(), type: 'load', data: data.counters});
                    }
                    setNode.onUnload(function (id) {
                        data.counters.sets -= 1;
                        updateListener({id: id, type: 'unload', data: data.counters});
                    });
                    setNode.loadChildren().then(function (children) {
                        var i,
                            queueList = [],
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.DesertConfiguration)) {
                                queueList.push(watchConfiguration(childNode, meta));
                            }
                        }
                        setNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.DesertConfiguration)) {
                                watchConfiguration(newChild, meta, true);
                            }
                        });
                        if (queueList.length === 0) {
                            setDeferred.resolve();
                        } else {
                            $q.all(queueList).then(function () {
                                setDeferred.resolve();
                            });
                        }
                    });

                    return setDeferred.promise;
                };

            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, designId)
                    .then(function (designNode) {
                        designNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.DesertConfigurationSet)) {
                                    queueList.push(watchConfigurationSet(childNode, meta));
                                }
                            }
                            designNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.DesertConfigurationSet)) {
                                    watchConfigurationSet(newChild, meta, true);
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
         * @param {object} parentContext - context of controller.
         * @param {string} designId - path to root container.
         * @param {function} updateListener - invoked when there are (filtered) changes in data.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchDesignStructure = function (parentContext, designId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchDesignStructure_' + designId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    rootId: designId,
                    containers: {}, // container: {id: <string>, name: <string>, parentId: <string>, type: <string>,
                                    //             subContainers: {id:<string>: <container>},
                                    //             components:    {id:<string>: <container>}}
                    components: {}  // component: {id: <string>, name: <string>, parentId: <string>,
                                    //             , avmId: <string> }
                },
                getComponentInfo = function (node, parentId) {
                    return {
                        id: node.getId(),
                        name: node.getAttribute('name'),
                        parentId: parentId,
                        avmId: node.getAttribute('ID')
                    };
                },
                watchFromContainerRec = function (containerNode, rootContainer, meta) {
                    var recDeferred = $q.defer();
                    containerNode.loadChildren().then(function (children) {
                        var i,
                            queueList = [],
                            childNode,
                            onUnload = function (id) {
                                //updateListener({id: id, type: 'unload', data: data.count});
                            },
                            container = {
                                id: containerNode.getId(),
                                name: containerNode.getAttribute('name'),
                                type: containerNode.getAttribute('Type'),
                                subContainers: {},
                                components: {}
                            },
                            component;

                        rootContainer.subContainers[containerNode.getId()] = container;
                        data.containers[containerNode.getId()] = container;

                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.Container)) {
                                queueList.push(watchFromContainerRec(childNode, container, meta));
                            } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
                                component = getComponentInfo(childNode, container.id);
                                container.components[childNode.getId()] = component;
                                data.components[childNode.getId()] = component;
                            }
                        }

//                        containerNode.onNewChildLoaded(function (newChild) {
//                            if (newChild.isMetaTypeOf(meta.Container)) {
//                                watchFromContainerRec(newChild, container, meta).then(function () {
//                                    updateListener({id: newChild.getId(), type: 'load', data: data});
//                                });
//                            } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
//                                container[childNode.getId()] = getComponentInfo(childNode, container.id);
//                                updateListener({id: newChild.getId(), type: 'load', data: data});
//                            }
//                        });

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
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, designId)
                    .then(function (rootNode) {
                        rootNode.loadChildren().then(function (children) {
                            var i,
                                queueList = [],
                                childNode,
                                rootContainer = {
                                    id: rootNode.getId(),
                                    name: rootNode.getAttribute('name'),
                                    type: rootNode.getAttribute('Type'),
                                    subContainers: {},
                                    components: {}
                                },
                                component;

                            data.containers[rootContainer.id] = rootContainer;
                            data.containers[rootContainer.id] = rootContainer;
                            for (i = 0; i < children.length; i += 1) {
                                childNode = children[i];
                                if (childNode.isMetaTypeOf(meta.Container)) {
                                    queueList.push(watchFromContainerRec(childNode, rootContainer, meta));
                                } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
                                    component = getComponentInfo(childNode, rootContainer.id);
                                    rootContainer.components[childNode.getId()] = component;
                                    data.components[childNode.getId()] = component;
                                }
                            }
//                            rootNode.onNewChildLoaded(function (newChild) {
//                                if (newChild.isMetaTypeOf(meta.Container)) {
//                                    watchFromContainerRec(newChild, rootContainer, meta).then(function () {
//                                        updateListener({id: newChild.getId(), type: 'load', data: data});
//                                    });
//                                } else if (childNode.isMetaTypeOf(meta.AVMComponentModel)) {
//                                    rootContainer.components[childNode.getId()] = getComponentInfo(childNode, rootContainer.id);
//                                    updateListener({id: newChild.getId(), type: 'load', data: data});
//                                }
//
//                            });
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
            nodeService.logContext(context);
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, designId)
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
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function (parentContext) {
            baseCyPhyService.cleanUpAllRegions(watchers, parentContext);
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            baseCyPhyService.cleanUpRegion(watchers, parentContext, regionId);
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function (parentContext, fn) {
            baseCyPhyService.registerWatcher(watchers, parentContext, fn);
        };
    });
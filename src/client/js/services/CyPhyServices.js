/*globals define, console, angular*/


define([], function () {
    'use strict';
    console.log('loaded');
    console.log(angular);

    angular.module('cyphy.services', ['gme.services'])
        .service('NodeUtilities', function ($q) {
            var self = this;

            /**
             * Recursively tries to get the parent of specified meta-type for node.
             * @param node - node to get the parent for.
             * @param parentMetaType - meta type node of parent.
             * @param deferred - should be null (only used internally).
             * @returns {*} - a promise.
             */
            this.getFirstParentOfType = function (node, parentMetaType, deferred) {
                if (!deferred) {
                    deferred = $q.defer();
                }
                node.getParentNode()
                    .then(function (parentNode) {
                        if (parentNode.isMetaTypeOf(parentMetaType)) {
                            deferred.resolve(parentNode);
                        } else {
                            self.getFirstParentOfType(parentNode, parentMetaType, deferred);
                        }
                    })
                    .catch(function (reason) {
                        deferred.reject(reason);
                    });

                return deferred.promise;
            };
        })

        .service('DesertConfigurationServices', function ($q, NodeService) {
            var watchers = {};

            this.addCfgSetsWatcher = function (pContext, designId, updateListener) {
                var deferred = $q.defer(),
                    data = {
                        name: null,
                        id: designId,
                        cfgSets: {}
                    },
                    context = {
                        db: pContext.db,
                        projectId: pContext.projectId,
                        branchId: pContext.branchId,
                        regionId: pContext.regionId + '_cfgSetsWatcher_' + designId
                    };
                watchers[pContext.regionId] = watchers[pContext.regionId] || {};
                watchers[pContext.regionId][context.regionId] = context;
                console.log('Added new watcher: ', watchers);
                NodeService.logContext(context);
                NodeService.getMetaNodes(context).then(function (meta) {
                    NodeService.loadNode(context, designId)
                        .then(function (designNode) {
                            //console.log('designNode: ', designNode);
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
             * @param pContext - context of the controller that is using the watch.
             * @param cfgSetId - path/id of DesertConfigurationSet node
             * @param updateListener -
             * @returns {*} - a promise that when resolved contains the data of the DesertConfigurationSet.
             */
            this.addCfgsWatcher = function (pContext, cfgSetId, updateListener) {
                var deferred = $q.defer(),
                    data = {
                        name: null,
                        id: cfgSetId,
                        cfgs: {}
                    },
                    context = {
                        db: pContext.db,
                        projectId: pContext.projectId,
                        branchId: pContext.branchId,
                        regionId: pContext.regionId + '_cfgsWatcher_' + cfgSetId
                    };
                watchers[pContext.regionId] = watchers[pContext.regionId] || {};
                watchers[pContext.regionId][context.regionId] = context;
                console.log('Added new watcher: ', watchers);
                NodeService.logContext(context);
                NodeService.getMetaNodes(context).then(function (meta) {
                    NodeService.loadNode(context, cfgSetId)
                        .then(function (cfgSetNode) {
                            //console.log('cfgSetNode: ', cfgSetNode);
                            data.name = cfgSetNode.getAttribute('name');
                            cfgSetNode.loadChildren(context)
                                .then(function (childNodes) {
                                    var i,
                                        onUpdate = function (id) {
                                            var newName = this.getAttribute('name');
                                            console.warn(newName);
                                            if (newName !== data.cfgs[id].name) {
                                                data.cfgs[id].name = newName;
                                                console.warn('changed');
                                                updateListener();
                                            }
                                        },
                                        onUnload = function (id) {
                                            updateListener(true);
                                        };
                                    for (i = 0; i < childNodes.length; i += 1) {
                                        if (childNodes[i].isMetaTypeOf(meta.DesertConfiguration)) {
                                            data.cfgs[childNodes[i].getId()] = {
                                                id: childNodes[i].getId(),
                                                name: childNodes[i].getAttribute('name')
                                            };
                                            childNodes[i].onUpdate(onUpdate);
                                            childNodes[i].onUnload(onUnload);
                                        }
                                    }
                                    //console.log('cfgSets', cfgSets);
                                    cfgSetNode.onNewChildLoaded(function (newNode) {
                                        if (newNode.isMetaTypeOf(meta.DesertConfiguration)) {
                                            updateListener(true);
                                        }
                                    });
                                    deferred.resolve(data);
                                });
                        });
                });
                return deferred.promise;
            };

            this.cleanUp = function (pContext) {
                var childWatchers,
                    key;
                if (watchers[pContext.regionId]) {
                    childWatchers = watchers[pContext.regionId];
                    for (key in childWatchers) {
                        if (childWatchers.hasOwnProperty(key)) {
                            NodeService.cleanUpRegion(childWatchers[key]);
                        }
                    }
                    delete watchers[pContext.regionId];
                } else {
                    console.log('Nothing to clean-up..');
                }
            };
        });
});

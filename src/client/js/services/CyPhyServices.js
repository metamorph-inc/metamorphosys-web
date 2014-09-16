/*globals define, console, angular*/


define([], function () {
    'use strict';
    console.log('loaded');
    console.log(angular);

    angular.module('cyphy.services', ['gme.services'])
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
                                    var i;
                                    for (i = 0; i < childNodes.length; i += 1) {
                                        if (childNodes[i].isMetaTypeOf(meta.DesertConfigurationSet)) {
                                            data.cfgSets[childNodes[i].getId()] = {
                                                id: childNodes[i].getId(),
                                                name: childNodes[i].getAttribute('name'),
                                                description: childNodes[i].getAttribute('INFO'),
                                                cfgs: null
                                            };
                                        }
                                    }
                                    //console.log('cfgSets', cfgSets);
                                    designNode.onNewChildLoaded(context, function (newNode) {
                                        var cfgSetWasAdded = false;
                                        if (newNode.isMetaTypeOf(meta.DesertConfigurationSet)) {
                                            data.cfgSets[newNode.getId()] = {
                                                id: newNode.getId(),
                                                name: newNode.getAttribute('name'),
                                                description: newNode.getAttribute('INFO'),
                                                cfgs: null
                                            };
                                        }
                                        if (cfgSetWasAdded) {
                                            updateListener();
                                        }
                                    });
                                    deferred.resolve(data);
                                });
                            designNode.onUpdate(function (id) {
                                var newName = this.getAttribute('name');
                                if (newName !== data.name) {
                                    data.name = newName;
                                    updateListener();
                                }
                            });
                        });
                });
                return deferred.promise;
            };

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
                                    var i;
                                    for (i = 0; i < childNodes.length; i += 1) {
                                        if (childNodes[i].isMetaTypeOf(meta.DesertConfiguration)) {
                                            data.cfgs[childNodes[i].getId()] = {
                                                id: childNodes[i].getId(),
                                                name: childNodes[i].getAttribute('name')
                                            };
                                        }
                                    }
                                    //console.log('cfgSets', cfgSets);
                                    cfgSetNode.onNewChildLoaded(context, function (newNode) {
                                        var cfgWasAdded = false;
                                        if (newNode.isMetaTypeOf(meta.DesertConfiguration)) {
                                            data.cfgs[newNode.getId()] = {
                                                id: newNode.getId(),
                                                name: newNode.getAttribute('name')
                                            };
                                        }
                                        if (cfgWasAdded) {
                                            updateListener();
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

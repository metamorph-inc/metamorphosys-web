/*globals define, console, angular*/


define([], function () {
    'use strict';
    console.log('loaded');
    console.log(angular);

    angular.module('cyphy.services', ['gme.services'])
        .service('DesertCfgSetService', function ($q, NodeService) {
            // What is the purpose of these? How to clean up? Are the nodes the keys?
            var setWatchers = {},
                cfgWatchers = {};

            this.logNodeServiceStatus = function (context) {
                NodeService.logContextState(context);
            };

            this.addCfgSetsWatcher = function (context, designId, updateListener) {
                var deferred = $q.defer(),
                    data = {
                        name: null,
                        id: designId,
                        cfgSets: {}
                    };
                setWatchers[designId] = setWatchers[designId] || {};
                setWatchers[designId][context.territoryId] = updateListener;
                NodeService.getMetaNodes(context).then(function (meta) {
                    NodeService.loadNode2(context, designId)
                        .then(function (designNode) {
                            console.log('designNode: ', designNode);
                            data.name = designNode.getAttribute('name');
                            designNode.loadChildren(context)
                                .then(function (childNodes) {
                                    var i;
                                    for (i = 0; i < childNodes.length; i += 1) {
                                        if (childNodes[i].isMetaTypeOf(meta.DesertConfigurationSet)) {
                                            data.cfgSets[childNodes[i].getId()] = {
                                                id: childNodes[i].getId(),
                                                name: childNodes[i].getAttribute('name'),
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

            this.addCfgsWatcher = function (context, cfgSetId, updateListener) {
                var deferred = $q.defer(),
                    data = {
                        name: null,
                        id: cfgSetId,
                        cfgs: {}
                    };
                cfgWatchers[cfgSetId] = cfgWatchers[cfgSetId] || {};
                cfgWatchers[cfgSetId][context.territoryId] = updateListener;
                NodeService.getMetaNodes(context).then(function (meta) {
                    NodeService.loadNode2(context, cfgSetId)
                        .then(function (cfgSetNode) {
                            console.log('cfgSetNode: ', cfgSetNode);
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
        });
});

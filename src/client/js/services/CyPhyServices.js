/*globals define, console, angular*/


define([], function () {
    'use strict';
    console.log('loaded');
    console.log(angular);

    angular.module('cyphy.services', ['gme.services'])
        .service('DesertCfgSetService', function ($q, NodeService) {
            var watchers = {};

            this.logNodeServiceStatus = function (context) {
                NodeService.logContextState(context);
            };

            this.addCfgSetsWatcher = function (context, designId, updateListener) {
                var deferred = $q.defer(),
                    contextWatchers;
                contextWatchers = watchers[context.territoryId] || [];
                contextWatchers.push(updateListener);
                watchers[context] = contextWatchers;
                NodeService.getMetaNodes(context).then(function (meta) {
                    NodeService.loadNode2(context, designId)
                        .then(function (designNode) {
                            console.log('designNode: ', designNode);
                            designNode.loadChildren(context)
                                .then(function (childNodes) {
                                    var i,
                                        cfgSets = {};
                                    for (i = 0; i < childNodes.length; i += 1) {
                                        if (childNodes[i].isMetaTypeOf(meta.DesertConfigurationSet)) {
                                            cfgSets[childNodes[i].getId()] = {
                                                id: childNodes[i].getId(),
                                                name: childNodes[i].getAttribute('name'),
                                                cfgs: {}
                                            };
                                        }
                                    }
                                    console.log('cfgSets', cfgSets);
                                    designNode.onNewChildLoaded(context, function (newNode) {
                                        var j,
                                            cfgSetWasAdded = false;
                                        if (newNode.isMetaTypeOf(meta.DesertConfigurationSet)) {
                                            cfgSets[newNode.getId()] = {
                                                id: newNode.getId(),
                                                name: newNode.getAttribute('name'),
                                                cfgs: {}
                                            };
                                        }
                                        if (cfgSetWasAdded) {
                                            for (j = 0; j < contextWatchers.length; j += 1) {
                                                contextWatchers[j]();
                                            }
                                        }
                                    });
                                    deferred.resolve(cfgSets);
                                });
                        });
                });
                return deferred.promise;
            };
        });
});

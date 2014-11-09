/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.services')
    .service('testBenchService', function ($q, $timeout, nodeService, baseCyPhyService, pluginService) {
        'use strict';
        var watchers = {};

        this.deleteTestBench = function (testBenchId) {
            throw new Error('Not implemented yet.');
        };

        this.exportTestBench = function (testBenchId) {
            throw new Error('Not implemented.');
        };

        /**
         * Updates the given attributes
         * @param {object} context - Must exist within watchers and contain the test bench.
         * @param {string} context.db - Must exist within watchers and contain the test bench.
         * @param {string} context.regionId - Must exist within watchers and contain the test bench.
         * @param {string} testBenchId - Path to test bench.
         * @param {object} attrs - Keys are names of attributes and values are the wanted value.
         */
        this.setTestBenchAttributes = function (context, testBenchId, attrs) {
            return baseCyPhyService.setNodeAttributes(context, testBenchId, attrs);
        };

        this.runTestBench = function (context, testBenchId, configurationId) {
            var deferred = $q.defer(),
                config = {
                    activeNode: testBenchId,
                    runOnServer: true,
                    pluginConfig: {
                        run: true,
                        save: true,
                        configurationPath: configurationId
                    }
                };
            console.log(JSON.stringify(config));
            pluginService.runPlugin(context, 'TestBenchRunner', config)
                .then(function (result) {
                    var resultLight = {
                        success: result.success,
                        artifactsHtml: '',
                        messages: result.messages
                    };
                    console.log("Result", result);
                    pluginService.getPluginArtifactsHtml(result.artifacts)
                        .then(function (artifactsHtml) {
                            resultLight.artifactsHtml = artifactsHtml;
                            deferred.resolve(resultLight);
                        });
                })
                .catch(function (reason) {
                    deferred.reject('Something went terribly wrong, ' + reason);
                });

            return deferred.promise;
        };

        this.watchTestBenchNode = function (parentContext, testBenchId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchTestBench',
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    meta: null, // META nodes - needed when creating new nodes...
                    testBench: {} // {id: <string>, name: <string>, description: <string>, node <NodeObj>}
                },
                onUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDesc = this.getAttribute('INFO'),
                        newPath = this.getAttribute('ID'),
                        newResults = this.getAttribute('Results'),
                        newFiles = this.getAttribute('TestBenchFiles'),
                        newTlsut = this.getPointer('TopLevelSystemUnderTest').to,
                        hadChanges = false,
                        tlsutChanged = false;
                    if (newName !== data.testBench.name) {
                        data.testBench.name = newName;
                        hadChanges = true;
                    }
                    if (newDesc !== data.testBench.description) {
                        data.testBench.description = newDesc;
                        hadChanges = true;
                    }
                    if (newPath !== data.testBench.path) {
                        data.testBench.path = newPath;
                        hadChanges = true;
                    }
                    if (newResults !== data.testBench.results) {
                        data.testBench.results = newResults;
                        hadChanges = true;
                    }
                    if (newFiles !== data.testBench.files) {
                        data.testBench.files = newFiles;
                        hadChanges = true;
                    }
                    if (newTlsut !== data.testBench.tlsutId) {
                        data.testBench.tlsutId = newTlsut;
                        hadChanges = true;
                        tlsutChanged = true;
                    }
                    if (hadChanges) {
                        $timeout(function () {
                            updateListener({id: id, type: 'update', data: data.testBench, tlsutChanged: tlsutChanged});
                        });
                    }
                },
                onUnload = function (id) {
                    $timeout(function () {
                        updateListener({id: id, type: 'unload', data: null});
                    });
                };
            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, testBenchId)
                    .then(function (testBenchNode) {
                        data.meta = meta;
                        data.testBench = {
                            id: testBenchId,
                            name: testBenchNode.getAttribute('name'),
                            description: testBenchNode.getAttribute('INFO'),
                            path: testBenchNode.getAttribute('ID'),
                            results: testBenchNode.getAttribute('Results'),
                            files: testBenchNode.getAttribute('TestBenchFiles'),
                            tlsutId: testBenchNode.getPointer('TopLevelSystemUnderTest').to,
                            node: testBenchNode
                        };
                        testBenchNode.onUpdate(onUpdate);
                        testBenchNode.onUnload(onUnload);
                        deferred.resolve(data);
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches all test-benches (existence and their attributes) of a workspace.
         * @param {object} parentContext - context of controller.
         * @param {string} workspaceId - Path to workspace that should be watched.
         * @param {function} updateListener - invoked when there are (filtered) changes in data. Data is an object in data.testBenches.
         * @returns {Promise} - Returns data when resolved.
         */
        this.watchTestBenches = function (parentContext, workspaceId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchTestBenches',
                context = {
                    db: parentContext.db,
                    projectId: parentContext.projectId,
                    branchId: parentContext.branchId,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    testBenches: {} // testBench {id: <string>, name: <string>, description: <string>,
                                    //            path: <string>, results: <hash|string>, files: <hash|string> }
                },
                onUpdate = function (id) {
                    var newName = this.getAttribute('name'),
                        newDesc = this.getAttribute('INFO'),
                        newPath = this.getAttribute('ID'),
                        newResults = this.getAttribute('Results'),
                        newFiles = this.getAttribute('TestBenchFiles'),
                        hadChanges = false;
                    if (newName !== data.testBenches[id].name) {
                        data.testBenches[id].name = newName;
                        hadChanges = true;
                    }
                    if (newDesc !== data.testBenches[id].description) {
                        data.testBenches[id].description = newDesc;
                        hadChanges = true;
                    }
                    if (newPath !== data.testBenches[id].path) {
                        data.testBenches[id].path = newPath;
                        hadChanges = true;
                    }
                    if (newResults !== data.testBenches[id].results) {
                        data.testBenches[id].results = newResults;
                        hadChanges = true;
                    }
                    if (newFiles !== data.testBenches[id].files) {
                        data.testBenches[id].files = newFiles;
                        hadChanges = true;
                    }
                    if (hadChanges) {
                        $timeout(function () {
                            updateListener({id: id, type: 'update', data: data.testBenches[id]});
                        });
                    }
                },
                onUnload = function (id) {
                    delete data.testBenches[id];
                    $timeout(function () {
                        updateListener({id: id, type: 'unload', data: null});
                    });
                },
                watchFromFolderRec = function (folderNode, meta) {
                    var recDeferred = $q.defer();
                    folderNode.loadChildren().then(function (children) {
                        var i,
                            testBenchId,
                            queueList = [],
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.ATMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.AVMTestBenchModel)) {
                                testBenchId = childNode.getId();
                                data.testBenches[testBenchId] = {
                                    id: testBenchId,
                                    name: childNode.getAttribute('name'),
                                    description: childNode.getAttribute('INFO'),
                                    path: childNode.getAttribute('ID'),
                                    results: childNode.getAttribute('Results'),
                                    files: childNode.getAttribute('TestBenchFiles')
                                };
                                childNode.onUnload(onUnload);
                                childNode.onUpdate(onUpdate);
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.ATMFolder)) {
                                watchFromFolderRec(newChild, meta);
                            } else if (newChild.isMetaTypeOf(meta.AVMTestBenchModel)) {
                                testBenchId = newChild.getId();
                                data.testBenches[testBenchId] = {
                                    id: testBenchId,
                                    name: newChild.getAttribute('name'),
                                    description: newChild.getAttribute('INFO'),
                                    path: newChild.getAttribute('ID'),
                                    results: newChild.getAttribute('Results'),
                                    files: newChild.getAttribute('TestBenchFiles')
                                };
                                newChild.onUnload(onUnload);
                                newChild.onUpdate(onUpdate);
                                $timeout(function () {
                                    updateListener({id: testBenchId, type: 'load', data: data.testBenches[testBenchId]});
                                });
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
                                if (childNode.isMetaTypeOf(meta.ATMFolder)) {
                                    queueList.push(watchFromFolderRec(childNode, meta));
                                }
                            }
                            workspaceNode.onNewChildLoaded(function (newChild) {
                                if (newChild.isMetaTypeOf(meta.ATMFolder)) {
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
         *  Watches a test-bench w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param testBenchId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchTestBenchDetails = function (parentContext, testBenchId, updateListener) {
            var deferred = $q.defer(),
                regionId = parentContext.regionId + '_watchTestBenchDetails_' + testBenchId,
                context = {
                    db: parentContext.db,
                    regionId: regionId
                },
                data = {
                    regionId: regionId,
                    containerIds: [],
                    tlsut: null
                },
                onUnload = function (id) {
                    var index = data.containerIds.indexOf(id);
                    if (index > -1) {
                        data.containerIds.splice(index, 1);
                        $timeout(function () {
                            updateListener({id: id, type: 'unload', data: data});
                        });
                    }
                };
            watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
            watchers[parentContext.regionId][context.regionId] = context;
            nodeService.getMetaNodes(context).then(function (meta) {
                nodeService.loadNode(context, testBenchId)
                    .then(function (testBenchNode) {
                        testBenchNode.loadChildren()
                            .then(function (children) {
                                var i;
                                for (i = 0; i < children.length; i += 1) {
                                    if (children[i].isMetaTypeOf(meta.Container)) {
                                        data.containerIds.push(children[i].getId());
                                        children[i].onUnload(onUnload);
                                    }
                                }
                                testBenchNode.onNewChildLoaded(function (newChild) {
                                    data.containerIds.push(newChild.getId());
                                    newChild.onUnload(onUnload);
                                    $timeout(function () {
                                        updateListener({id: newChild.getId(), type: 'load', data: data});
                                    });
                                });
                                deferred.resolve(data);
                            });
                    });
            });

            return deferred.promise;
        };

        /**
         *  Watches a test-bench w.r.t. interfaces.
         * @param parentContext - context of controller.
         * @param containerId
         * @param updateListener - invoked when there are (filtered) changes in data.
         */
        this.watchInterfaces = function (parentContext, containerId, updateListener) {
            return baseCyPhyService.watchInterfaces(watchers, parentContext, containerId, updateListener);
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
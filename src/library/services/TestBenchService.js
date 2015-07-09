/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

var EventDispatcher = require('../../app/mmsApp/classes/EventDispatcher');


var TestBenchService = function ($q, $timeout, $http, dataStoreService, nodeService, baseCyPhyService, pluginService, gmeMapService, projectHandling) {
    'use strict';
    var self = this,
        watchers = {},
        testBenches = [],
        testBenchResults = [];

    // TODO: add notifications: TestBench list updated, Result created, Result status changed.

    function compareResult(a, b) {
        if (a.startTime < b.startTime) {
            return -1;
        }
        if (a.startTime > b.startTime) {
            return 1;
        }
        if (a.endTime < b.endTime) {
            return -1;
        }
        if (a.endTime > b.endTime) {
            return 1;
        }
        return 0;
    }

    function compareTestBench(a, b) {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        if (a.id < b.id) {
            return -1;
        }
        if (a.id > b.id) {
            return 1;
        }
        return 0;
    }

    function addResult(result) {

        testBenchResults.push(result);

        self.getTestBenches().then(function() {

            testBenches.forEach(function (testBench) {

                if (testBench.id === result.testBenchId) {

                    // add result object to test bench
                    testBench.results.push(result);

                    result.testBench = testBench;

                    // update last result, if result is finished and it is newer
                    if (!testBench.lastResult ||
                        result.startTime && testBench.lastResult && testBench.lastResult.startTime < result.startTime) {
                        testBench.lastResult = result;
                    }
                }
            });

            testBenchResults.sort(compareResult);

            self.dispatchEvent({
                type: 'resultsChanged',
                data: {
                    newResult: result,
                    results: testBenchResults
                }
            });
        });
    }

    this.getTestBenchById = function (id) {
        return this.getTestBenches()
            .then(function () {
                return testBenches.filter(function (testBench) {
                    return testBench.id === id;
                })[0];
            });
    };

    this.getTestBenches = function () {

        if (this.testBenchPromise) {
            return this.testBenchPromise;
        }

        var designId = projectHandling.getSelectedDesignId(),
            context = projectHandling.getDesignContext(),
            gmeMaps = [];
        context = {
            db: context.db,
            regionId: context.regionId + '_tbs'
        };

        var cleanup = function () {
            projectHandling.removeEventListener('leaveDesign', cleanup);
            self.testBenchPromise.then(function () {
                gmeMaps.forEach(function (gmeMap) {
                    gmeMap.destroy();
                });
            });
            self.testBenchPromise = undefined;
            testBenches = [];
        };
        projectHandling.addEventListener('leaveDesign', cleanup);
        this.testBenchPromise = nodeService.getMetaNodes(context)
            .then(function(meta) {

                return nodeService.loadNode(context, designId)
                    .then(function (design) {
                        // TODO: support adding new TestBenches on-the-fly
                        return design.getCollectionPaths('TopLevelSystemUnderTest');
                    }).then(function (paths) {
                        return $q.all(paths.map(function (path) {
                            return nodeService.loadNode(context, path);
                        }));
                    }).then(function (testBenches) {
                        return $q.all(testBenches.filter(function (testbench) {
                            return testbench.isMetaTypeOf(meta.byName.AVMTestBenchModel);
                        }).map(function (testBench) {
                            return gmeMapService.mapGmeNode(context, testBench.getId(), {
                                'Property': {
                                    attributes: {name: 'label', Value: 'value'}
                                }
                            }).then(function (properties) {
                                gmeMaps.push(properties);
                                return {
                                    id: testBench.getId(),
                                    name: testBench.getAttribute('name'),
                                    // TODO: what directive should be used for visualizing the results?
                                    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                                    config: {
                                        properties: properties.data.Property || []
                                    },
                                    results: [],
                                    lastResult: null
                                };
                            });
                        }));
                    }).then(function (testBenches_) {
                        testBenches = testBenches_;
                        testBenches.sort(compareTestBench);
                        return testBenches;
                    });
            });
        return this.testBenchPromise;
    };

    this.getTestBenchResults = function () {
        // TODO Generating dummy results. Get these from REST API.

        if (this.testBenchResultsPromise) {
            return this.testBenchResultsPromise;
        }
        var context = projectHandling.getDesignContext();
        context = {
            db: context.db,
            regionId: context.regionId + '_runtb'
        };

        var cleanup = function () {
            projectHandling.removeEventListener('leaveDesign', cleanup);
            self.testBenchPromise = undefined;
            testBenchResults = [];
            self.dispatchEvent({
                type: 'resultsChanged',
                data: testBenchResults
            });
        };
        projectHandling.addEventListener('leaveDesign', cleanup);
        this.testBenchResultsPromise = this.getTestBenches()
            .then(function () {
                // TODO memoize and poll
                return $http.get('/rest/external/testbenches/results/?projectId=' + encodeURIComponent(dataStoreService.getDatabaseConnection(context.db).client.getActiveProjectName()) +
                    '&branchId=' + dataStoreService.getDatabaseConnection(context.db).client.getActiveBranchName());
            }).then(function (res) {
                testBenchResults = res.data.results;
                testBenchResults.forEach(function (result) {
                    result.testBench = testBenches.filter(function (testBench) {
                        return testBench.id === result.testBenchId;
                    })[0];
                });

                testBenchResults.sort(compareResult);

                return testBenchResults;
            });
        return this.testBenchResultsPromise;
    };

    this.setTestBenchConfig = function (id, config) {

        testBenches.map(function (testBench) {
            if (id) {
                // test bench result only for the requested test bench
                if (id === testBench.id) {
                    testBench.config = config;
                }
            }
        });

    };


    this.editTestBenchFn = function (data) {
        var modalInstance = data.modal.open({
            templateUrl: '/cyphy-components/templates/TestBenchEdit.html',
            controller: 'TestBenchEditController',
            //size: size,
            resolve: {
                data: function () {
                    return data;
                }
            }
        });

        modalInstance.result.then(function (editedData) {
            var attrs = {};
            if (editedData.description !== data.testBench.description) {
                attrs.INFO = editedData.description;
            }
            if (editedData.name !== data.testBench.title) {
                attrs.name = editedData.name;
            }
            if (editedData.fileInfo.hash !== data.testBench.data.files) {
                attrs.TestBenchFiles = editedData.fileInfo.hash;
            }
            if (editedData.path !== data.testBench.data.path) {
                attrs.ID = editedData.path;
            }

            self.setTestBenchAttributes(data.editContext, data.id, attrs)
                .then(function () {
                    console.log('Attribute(s) updated');
                });
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };

    this.deleteFn = function (data) {
        var modalInstance = data.modal.open({
            templateUrl: '/cyphy-components/templates/SimpleModal.html',
            controller: 'SimpleModalController',
            resolve: {
                data: function () {
                    return {
                        title: 'Delete Test Bench',
                        details: 'This will delete ' + data.name + ' from the workspace.'
                    };
                }
            }
        });

        modalInstance.result.then(function () {
            self.deleteTestBench(data.context, data.id);
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };

    /**
     * Removes the test bench from the context.
     * @param {object} context - context of controller.
     * @param {string} context.db - data-base connection.
     * @param {string} testBenchId - Path to design-space.
     * @param [msg] - Commit message.
     */
    this.deleteTestBench = function (context, testBenchId, msg) {
        var message = msg || 'testBenchService.deleteTestBench ' + testBenchId;
        nodeService.destroyNode(context, testBenchId, message);
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

    this.runTestBench = function (testBenchId, configurationId) {
        var context = projectHandling.getDesignContext();
        context = {
            db: context.db,
            regionId: context.regionId + '_runtb'
        };

        var deferred = $q.defer(),
            config = {
                activeNode: testBenchId,
                runOnServer: true,
                pluginConfig: {
                    run: true,
                    save: false,
                    configurationPath: configurationId
                }
            },
            timestamp = (Math.floor(new Date().valueOf() / 100)).toString(16),
            testBenchResult = {
                id: '0000000000'.substr(0, 10 - timestamp.length) + timestamp,
                projectId: dataStoreService.getDatabaseConnection(context.db).client.getActiveProjectName(),
                branchId: dataStoreService.getDatabaseConnection(context.db).client.getActiveBranchName(),
                commitHash: dataStoreService.getDatabaseConnection(context.db).client.getActiveCommitHash(),
                testBenchId: testBenchId,
                startTime: (new Date()).toISOString(),
                endTime: null,
                status: 'Running',
                resultHash: null
            };
        config.pluginConfig.testBenchResultId = testBenchResult.id;
        this.getTestBenchById(testBenchId)
            .then(function (testBench) {

                    self.dispatchEvent({
                        type: 'testBenchStarted',
                        data: testBench
                    });

                    testBenchResult.testBench = testBench;
                    testBenchResult.config = angular.copy(testBench.config);
                    addResult(testBenchResult);
                    var testBenchResultWithoutTestBench = angular.copy(testBenchResult);
                    delete testBenchResultWithoutTestBench.testBench;
                    testBenchResultWithoutTestBench.testBenchId = testBench.id;
                    return $http.put('/rest/external/testbenches/result/', testBenchResultWithoutTestBench);
                })
            .then(function () {
                //console.log(JSON.stringify(config));
                pluginService.runPlugin(context, 'TestBenchRunner', config)
                    .then(function (result) {
                        var extendedResult = {
                            success: result.success,
                            messages: result.messages,
                            unparsedResult: result
                        };
                        //console.log( 'Result', result );
                        pluginService.getPluginArtifacts(result.artifacts)
                            .then(function (artifactsByName) {

                                // update result object
                                testBenchResult.startTime = result.startTime;
                                testBenchResult.endTime = result.finishTime;
                                testBenchResult.status = result.success ? 'Succeeded' : 'Failed';
                                if (artifactsByName.hasOwnProperty('all.zip')) {
                                    testBenchResult.resultHash = artifactsByName['all.zip'].hash;
                                }

                                testBenches.forEach(function (testBench) {

                                    if (testBench.id === testBenchResult.testBenchId) {
                                        // update last result, if result is finished and it is newer
                                        if (!testBench.lastResult ||
                                            testBenchResult.endTime && testBench.lastResult && testBench.lastResult.endTime < testBenchResult.endTime) {
                                            testBench.lastResult = testBenchResult;
                                        }

                                        self.dispatchEvent({
                                            type: 'testBenchCompleted',
                                            data: testBench
                                        });
                                    }

                                });

                            self.dispatchEvent({
                                type: 'resultsChanged',
                                data: testBenchResults
                            });

                        extendedResult.artifacts = artifactsByName;
                        deferred.resolve(extendedResult);
                    });
                });
            }).
            catch(function (reason) {
                deferred.reject('Something went terribly wrong, ' + reason);

                self.dispatchEvent({
                    type: 'testBenchException',
                    data: reason
                });

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
                testBench: {} // {id: <string>, name: <string>, description: <string>, node <NodeObj>,
                //  tlsutId: <string>, path: <string>, results: <string>, file: <string>}
            },
            onUpdate = function (id) {
                var keyToAttr = {
                        name: 'name',
                        description: 'INFO',
                        path: 'ID',
                        results: 'Results',
                        file: 'TestBenchFiles'
                    },
                    newTlsut = this.getPointer('TopLevelSystemUnderTest')
                        .to,
                    tlsutChanged = false,
                    hadChanges = self.checkForAttributeUpdates(data.testBench, this, keyToAttr);

                if (newTlsut !== data.testBench.tlsutId) {
                    data.testBench.tlsutId = newTlsut;
                    hadChanges = true;
                    tlsutChanged = true;
                }
                if (hadChanges) {
                    $timeout(function () {
                        updateListener({
                            id: id,
                            type: 'update',
                            data: data.testBench,
                            tlsutChanged: tlsutChanged
                        });
                    });
                }
            },
            onUnload = function (id) {
                $timeout(function () {
                    updateListener({
                        id: id,
                        type: 'unload',
                        data: null
                    });
                });
            };
        watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
        watchers[parentContext.regionId][context.regionId] = context;
        nodeService.getMetaNodes(context)
            .then(function (meta) {
                nodeService.loadNode(context, testBenchId)
                    .then(function (testBenchNode) {
                        data.meta = meta;
                        data.testBench = {
                            id: testBenchId,
                            name: testBenchNode.getAttribute('name').replace(/_/g, ' '),
                            description: testBenchNode.getAttribute('INFO'),
                            path: testBenchNode.getAttribute('ID'),
                            results: testBenchNode.getAttribute('Results'),
                            files: testBenchNode.getAttribute('TestBenchFiles'),
                            tlsutId: testBenchNode.getPointer('TopLevelSystemUnderTest')
                                .to,
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
            triggerUpdateListener = function (id, data, eventType) {
                $timeout(function () {
                    updateListener({
                        id: id,
                        data: data,
                        type: eventType
                    });
                });
            },
            addNewTestBench = function (id, node) {
                data.testBenches[id] = {
                    id: id,
                    name: node.getAttribute('name'),
                    description: node.getAttribute('INFO'),
                    path: node.getAttribute('ID'),
                    results: node.getAttribute('Results'),
                    files: node.getAttribute('TestBenchFiles'),
                    design: node.getPointer('TopLevelSystemUnderTest').to
                };
                // TODO: call add test bench function
                node.onUnload(onUnload);
                node.onUpdate(onUpdate);
            },
            onUpdate = function (id) {
                var keyToAttr = {
                        name: 'name',
                        description: 'INFO',
                        path: 'ID',
                        results: 'Results',
                        file: 'TestBenchFiles'
                    },
                    hadChanges = self.checkForAttributeUpdates(data.testBenches[id], this, keyToAttr);

                if (hadChanges) {
                    triggerUpdateListener(id, data.testBenches[id], 'update');
                }

                // TODO: call update test bench function
            },
            onUnload = function (id) {
                // TODO: call remove test bench function with the test bench id
                delete data.testBenches[id];
                triggerUpdateListener(id, null, 'unload');
            },
            watchFromFolderRec = function (folderNode, meta) {
                var recDeferred = $q.defer();
                folderNode.loadChildren()
                    .then(function (children) {
                        var i,
                            testBenchId,
                            queueList = [],
                            childNode;
                        for (i = 0; i < children.length; i += 1) {
                            childNode = children[i];
                            if (childNode.isMetaTypeOf(meta.byName.ATMFolder)) {
                                queueList.push(watchFromFolderRec(childNode, meta));
                            } else if (childNode.isMetaTypeOf(meta.byName.AVMTestBenchModel)) {
                                testBenchId = childNode.getId();
                                addNewTestBench(testBenchId, childNode);
                            }
                        }

                        folderNode.onNewChildLoaded(function (newChild) {
                            if (newChild.isMetaTypeOf(meta.byName.ATMFolder)) {
                                watchFromFolderRec(newChild, meta);
                            } else if (newChild.isMetaTypeOf(meta.byName.AVMTestBenchModel)) {
                                testBenchId = newChild.getId();
                                addNewTestBench(testBenchId, newChild);
                                triggerUpdateListener(testBenchId, data.testBenches[testBenchId],
                                    'load');
                            }
                        });
                        if (queueList.length === 0) {
                            recDeferred.resolve();
                        } else {
                            $q.all(queueList)
                                .then(function () {
                                    recDeferred.resolve();
                                });
                        }
                    });

                return recDeferred.promise;
            };

        watchers[parentContext.regionId] = watchers[parentContext.regionId] || {};
        watchers[parentContext.regionId][context.regionId] = context;
        nodeService.getMetaNodes(context)
            .then(function (meta) {
                nodeService.loadNode(context, workspaceId)
                    .then(function (workspaceNode) {
                        workspaceNode.loadChildren()
                            .then(function (children) {
                                var i,
                                    queueList = [],
                                    childNode;
                                for (i = 0; i < children.length; i += 1) {
                                    childNode = children[i];
                                    if (childNode.isMetaTypeOf(meta.byName.ATMFolder)) {
                                        queueList.push(watchFromFolderRec(childNode, meta));
                                    }
                                }
                                workspaceNode.onNewChildLoaded(function (newChild) {
                                    if (newChild.isMetaTypeOf(meta.byName.ATMFolder)) {
                                        watchFromFolderRec(newChild, meta);
                                    }
                                });
                                if (queueList.length === 0) {
                                    deferred.resolve(data);
                                } else {
                                    $q.all(queueList)
                                        .then(function () {
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
        return gmeMapService.mapGmeNode(parentContext, testBenchId, {
            'Property': {
                attributes: {name: 'label', Value: 'value'}
            }
        });
    };

    this.checkForAttributeUpdates = function (data, node, keyToAttr) {
        return baseCyPhyService.checkForAttributeUpdates(data, node, keyToAttr);
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

    /**
     * See baseCyPhyService.unRegisterWatcher.
     */
    this.unregisterWatcher = function (parentContext) {
        baseCyPhyService.unregisterWatcher(watchers, parentContext);
    };

};

EventDispatcher.prototype.apply(TestBenchService.prototype);

angular.module('cyphy.services')
    .service('testBenchService', TestBenchService);

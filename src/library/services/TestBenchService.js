/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

var EventDispatcher = require('../../app/mmsApp/classes/EventDispatcher');


var TestBenchService = function ($q, $timeout, nodeService, baseCyPhyService, pluginService, gmeMapService) {
    'use strict';
    var self = this,
        watchers = {},

        testBenches = [],
        testBenchesById = {},

        testBenchResults = [],
        testBenchResultsById = {};

    // TODO: add notifications: TestBench list updated, Result created, Result status changed.

    function compareResult(a, b) {
        if (a.endTime < b.endTime) {
            return -1;
        }
        if (a.endTime > b.endTime) {
            return 1;
        }
        if (a.startTime < b.startTime) {
            return -1;
        }
        if (a.startTime > b.startTime) {
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

        testBenches.forEach(function (testBench) {
            
            if (testBench.id === result.testBenchId) {
                // add result object to test bench
                testBench.result.push(result);

                // update last result, if result is finished and it is newer
                if (result.endTime && testBench.lastResult && testBench.lastResult.endTime < result.endTime) {
                    testBench.lastResult = result;
                }
            }
        });

        testBenchResults.sort(compareResult);

        self.dispatchEvent({
            type: 'resultCreated',
            data: result
        });
    }


    function addTestBench(testBench) {

        testBenches.push(testBench);
        testBenches.sort(compareTestBench);

        testBenchesById[testBench.id] = testBench;

        self.dispatchEvent({
            type: 'testBenchListChanged',
            data: testBenches
        });
    }

    function removeTestBench(id) {

        var notFound = true,
            i = 0,
            testBench;

        while (notFound && i < testBenches.length) {

            testBench = testBenches[i];

            if (testBench.id === id) {
                notFound = false;
            }

        }


        if (!notFound) {

            testBenches.splice(i, 1);
            testBenchesById[id] = null;

            //TODO: add remove results

            self.dispatchEvent({
                type: 'testBenchListChanged',
                data: testBenches
            });


        }

    }

    this.getTestBenchById = function(id) {
        return testBenchesById[id];
    };


    this.getTestBenches = function () {
        var i;

        // Generating dummy data. TODO: get these from GME instead

        if (testBenches.length === 0) {

            for (i = 0; i < 10; i += 1) {
                addTestBench({
                    id: i,
                    name: 'Test bench ' + i,
                    config: [
                        {
                            id: 1,
                            name: 'quantity',
                            value: 600
                        }
                    ],
                    results: [],
                    lastResult: null
                });
            }
        }

        testBenches.sort(compareTestBench);

        return testBenches;
    };

    this.getTestBenchResults = function (id) {
        var results = [],
            i;

        // Generating dummy results. Get these from GME.
        // TODO: get these from GME.

        if (testBenchResults.length === 0) {

            var status = ['Running', 'Failed', 'Succeeded'];

            for (i = 0; i < 100; i += 1) {
                addResult({
                    id: i,
                    testBenchId: i % 10,
                    config: [
                        {
                            id: 1,
                            name: 'quantity',
                            value: 600
                        }
                    ],
                    startTime: (new Date()).getTime() - 20000 - Math.floor(Math.random() * 20000),
                    endTime: (new Date()).getTime() - Math.floor(Math.random() * 15000),
                    status: status[Math.floor(Math.random() * status.length)],
                    resultUrl: 'something_' + i + '.zip'
                });

                if (testBenchResults[i].status === 'Running') {
                    testBenchResults[i].endTime = null;
                }
            }

        }

        testBenchResults.map(function (testBenchResult) {

            if (id) {
                // test bench result only for the requested test bench
                if (id === testBenchResult.testBenchId) {
                    results.push(testBenchResult);
                }
            } else {
                // all results
                results.push(testBenchResult);
            }
        });

        results.sort(compareResult);

        return results;
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

    this.exportTestBench = function (/*testBenchId*/) {
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
            },
            testBenchResult = {
                id: (new Date()).getTime(),
                testBenchId: testBenchId,
                config: [],
                startTime: (new Date()).getTime(),
                endTime: null,
                status: 'Running',
                resultUrl: null
            };

        // add result object
        addResult(testBenchResult);

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
                            testBenchResult.resultUrl = '/rest/blob/download/' + artifactsByName['all.zip'].hash;
                        }


                        testBenches.map(function (testBench) {
                            if (testBench.id === result.testBenchId) {
                                // update last result, if result is finished and it is newer
                                if (testBenchResult.endTime && testBench.lastResult && testBench.lastResult.endTime < testBenchResult.endTime) {
                                    testBench.lastResult = testBenchResult;
                                }
                            }
                        });

                        self.dispatchEvent({
                            type: 'resultStatusChanged',
                            data: testBenchResult
                        });


                        extendedResult.artifacts = artifactsByName;
                        deferred.resolve(extendedResult);
                    });
            })
            .
            catch(function (reason) {
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
                            name: testBenchNode.getAttribute('name'),
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

}

EventDispatcher.prototype.apply(TestBenchService.prototype);

angular.module('cyphy.services')
    .service('testBenchService', TestBenchService);

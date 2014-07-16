/**
 * Created by Zsolt on 6/24/2014.
 */
/*globals define */

define(['blob/BlobClient',
        'xmljsonconverter',
        'executor/ExecutorClient'], function (BlobClient, Converter, ExecutorClient) {
    'use strict';
    var DesertFrontEnd,
        CMDSTR;

    DesertFrontEnd = function (parameters) {
        var self = this;
        this.client = parameters.client;
        this.meta = parameters.meta;
        this.blobClient = new BlobClient();
        this.executorClient = new ExecutorClient();
        this.xmlToJson = new Converter.Xml2json({
            skipWSText: true,
            arrayElements: {
                Configuration: true,
                Element: true,
                NaturalMember: true
            }
        });
        this.jsonToXml = new Converter.Json2xml();
        this.results = {};
        this.listeners = {};
        this.patterns = {};
        this.territoryId = this.client.addUI(this, function (events) {
            self.handleUpdates(events);
        });
    };

    DesertFrontEnd.prototype.handleUpdates = function (events) {
        var self = this,
            event,
            doUpdateTerritory = false,
            i;
        for (i = 0; i < events.length; i += 1) {
            event = events[i];
            if (self.results.hasOwnProperty(event.eid)) {
                if (event.etype === 'unload') {
                    delete self.results[event];
                    delete self.listeners[event];
                    delete self.patterns[event];
                    doUpdateTerritory = true;
                } else if (event.etype === 'load' || event.etype === 'update') {
                    console.log('Updating results for ' + self.client.getNode(event.eid).getAttribute('name'));
                    self.calculateNbrOfCfgs(event.eid);
                } else {
                    console.error('Unknown event: ' + event.etype + ', objId: ' + event.eid);
                }
            }
        }
        if (doUpdateTerritory) {
            self.client.updateTerritory(self.territoryId, self.patterns);
        }
        //console.log(events);
    };

    DesertFrontEnd.prototype.addListener = function (containerId, callback) {
        var self = this;
        if (self.listeners.hasOwnProperty(containerId)) {

        } else {
            self.listeners[containerId] = [];
            self.results[containerId] = {status: 'LISTENING'};
            self.patterns[containerId] = {children: 999};
            self.client.updateTerritory(self.territoryId, self.patterns);
        }
        self.listeners[containerId].push(callback);
        callback(self.results[containerId]);
    };

    DesertFrontEnd.prototype.callListeners = function (id, newStatus) {
        var self = this,
            i;
        self.results[id].status = newStatus;
        for (i = 0; i < self.listeners[id].length; i += 1) {
            self.listeners[id][i](self.results[id]);
        }
    };

    DesertFrontEnd.prototype.calculateNbrOfCfgs = function (containerId) {
        var self = this;
        self.callListeners(containerId, 'CALCULATING');
        self.getInputXmlHash(containerId, function (err, artifact) {
            var filesToAdd = {};
            if (err) {
                console.error('Failed to create desertInput.xml: ' + err);
                return self.callListeners(containerId, 'ERROR');
            }
            filesToAdd['executor_config.json'] = JSON.stringify({
                cmd: 'run_desert.cmd',
                resultArtifacts: [
                    {
                        name: 'all',
                        resultPatterns: []
                    }
                ]
            }, null, 4);
            filesToAdd['run_desert.cmd'] = CMDSTR;
            artifact.addFiles(filesToAdd, function (err, hashes) {
                if (err) {
                    console.error('Failed to add execution files to desert-input, err: ' + err);
                    return self.callListeners(containerId, 'ERROR');
                }
                artifact.save(function (err, artieHash) {
                    if (err) {
                        console.error('Failed to save desert-input, err: ' + err);
                        return self.callListeners(containerId, 'ERROR');
                    }
                    self.executorClient.createJob(artieHash, function (err, jobInfo) {
                        var intervalID,
                            atSucceedJob;
                        if (err) {
                            console.error('Creating desert-job failed: ' + err);
                            return self.callListeners(containerId, 'ERROR');
                        }
                        console.info('Initial job-info:' + JSON.stringify(jobInfo, null, 4));
                        atSucceedJob = function (jInfo) {
                            console.info('SUCCESS! Its final JobInfo looks like : ' + JSON.stringify(jInfo, null, 4));
                            self.blobClient.getMetadata(jInfo.resultHashes.all, function (err, metadata) {
                                if (err) {
                                    console.error('Getting meta-data for result failed, err: ' + err);
                                    return self.callListeners(containerId, 'ERROR');
                                }
                                if (!metadata.content.hasOwnProperty('desertInput_configs.xml')) {
                                    console.error('Desert did not generate a "desertInput_configs.xml".');
                                    return self.callListeners(containerId, 'ERROR');
                                }
                                self.dealWithDesertOutput(metadata.content['desertInput_configs.xml'].content, function (err, cfgsInfo) {
                                    if (err) {
                                        console.error('Errors interpreting desert output, err: ' + err);
                                        return self.callListeners(containerId, 'ERROR');
                                    }

                                    console.log('Got cfgs : ' + JSON.stringify(cfgsInfo, null, 2));
                                    self.results[containerId] = {status: 'READY', constraints: {
                                        All: cfgsInfo.All['@NumConfigs'],
                                        None: cfgsInfo.None['@NumConfigs']
                                    }};
                                    self.callListeners(containerId, 'READY');
                                });
                            });
                        };

                        //noinspection JSLint
                        intervalID = setInterval(function () {
                            // Get the job-info at intervals and check for a non-CREATED status.
                            self.executorClient.getInfo(artieHash, function (err, jInfo) {
                                console.info(JSON.stringify(jInfo, null, 4));
                                if (jInfo.status === 'CREATED' || jInfo.status === 'RUNNING') {
                                    // The job is still running..
                                    return;
                                }
                                //noinspection JSLint
                                clearInterval(intervalID);
                                if (jInfo.status === 'SUCCESS') {
                                    atSucceedJob(jInfo);
                                } else {
                                    console.error('Execution failed: ' + err);
                                    return self.callListeners(containerId, 'ERROR');
                                }
                            });
                        }, 200);
                    });
                });
            });
        });
    };

    DesertFrontEnd.prototype.getInputXmlHash = function (containerId, callback) {
        var self = this,
            pattern = {},
            idCounter = { count: 3 },
            desertSystem = self.getDesertSystemData(),
            rootNode = self.client.getNode(containerId),
            rootElement = self.createElementFromNode(rootNode.getAttribute('name'), 'true', idCounter);

        pattern[containerId] = { children: -1 };

        desertSystem.DesertSystem.Space.Element.push(rootElement);
        // FIXME: This is a dirty fix..
        self.populateElementsRec(rootNode, rootElement, idCounter);
        self.saveInputXmlToBlobArtifact(desertSystem, callback);
    };

    DesertFrontEnd.prototype.populateElementsRec = function (rootNode, rootElement, idCounter) {
        var self = this,
            i,
            childNode,
            name,
            elem,
            childrenIds = rootNode.getChildrenIds();
        for (i = 0; i < childrenIds.length; i += 1) {
            childNode = self.client.getNode(childrenIds[i]);
            name = childNode.getAttribute('name');
            if (self.isMetaTypeOf(childNode, self.meta.Container)) {
                if (childNode.getAttribute('Type') === 'Compound') {
                    elem = self.createElementFromNode(name, 'true', idCounter);
                } else if (childNode.getAttribute('Type') === 'Alternative') {
                    elem = self.createElementFromNode(name, 'false', idCounter);
                } else {
                    elem = self.createElementFromNode(name, 'false', idCounter);
                    elem.Element.push(self.createElementFromNode('null', 'false', idCounter));
                }
                rootElement.Element.push(elem);
                self.populateElementsRec(childNode, elem, idCounter);
            } else if (self.isMetaTypeOf(childNode, self.meta.AVMComponentModel)) {
                elem = self.createElementFromNode(name, 'false', idCounter);
                rootElement.Element.push(elem);
            }
        }
    };

    DesertFrontEnd.prototype.getDesertSystemData = function () {
        return {
            'DesertSystem': {
                '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                '@SystemName': '',
                '@xsi:noNamespaceSchemaLocation': 'DesertIface.xsd',
                'ConstraintSet': {
                    '@_id': 'id1',
                    '@externalID': '1',
                    '@id': '1',
                    '@name': 'constraints'
                },
                'FormulaSet': {
                    '@_id': 'id2',
                    '@externalID': '2',
                    '@id': '2',
                    '@name': 'formulaSet'
                },
                'Space': {
                    '@_id': 'id3',
                    '@decomposition': 'true',
                    '@externalID': '3',
                    '@id': '3',
                    '@name': 'DesignSpace',
                    'Element': []
                }
            }
        };
    };

    DesertFrontEnd.prototype.createElementFromNode = function (name, decomposition, idCounter) {
        idCounter.count += 1;
        return {
            '@_id': 'id' + idCounter.count.toString(),
            '@decomposition': decomposition,
            '@externalID': idCounter.count.toString(),
            '@id': idCounter.count.toString(),
            '@name': name,
            'Element': []
        };
    };

    DesertFrontEnd.prototype.saveInputXmlToBlobArtifact = function (desertSystem, callback) {
        var self = this,
            artifact = self.blobClient.createArtifact('desert-input'),
            inputXml = self.jsonToXml.convertToString(desertSystem);
        artifact.addFileAsSoftLink('desertInput.xml', inputXml, function (err, hash) {
            if (err) {
                console.error('Could not add desert_input to artifact, err: ' + err);
                return callback(err);
            }
            console.log('desertInput.xml has hash: ' + hash);
            callback(null, artifact);
            });
        //callback(null, '9e9985cda011a0040054af07a579493bde67b001');
    };

    DesertFrontEnd.prototype.dealWithDesertOutput = function (hash, callback) {
        var self = this;
        self.blobClient.getMetadata(hash, function (err, metadata) {
            if (err) {
                return callback('Could not obtain metadata for desert output XML, err: ' + err);
            }
            //console.info(JSON.stringify(metadata, null, 2));
            self.blobClient.getObject(hash, function (err, content) {
                var desertData;
                if (err) {
                    return callback('Could not get content for desert output XML, err: ' + err);
                }
                desertData = self.xmlToJson.convertFromBuffer(content);
                //console.info(JSON.stringify(desertData, null, 2));
                if (desertData instanceof Error) {
                    return callback('Output desert XML not valid xml, err: ' + desertData.message);
                }

                if (desertData.DesertConfigurations) {
                    callback(null, desertData.DesertConfigurations);
                } else {
                    callback('Json representation of desert output xml was not of right format.');
                }
            });
        });
    };

    DesertFrontEnd.prototype.isMetaTypeOf = function (node, metaNode) {
        while (node) {
            if (node.getId() === metaNode.getId()) {
                return true;
            }
            node = this.client.getNode(node.getBaseId());
        }
        return false;
    };

    DesertFrontEnd.prototype.destroy = function () {
        this.client.removeUI(this.territoryId);
    };

    CMDSTR = [
        ':: Runs <-DesertTools.exe-> desertInput.xml /m',
        'ECHO off',
        'pushd %~dp0',
        '%SystemRoot%\\SysWoW64\\REG.exe query "HKLM\\software\\META" /v "META_PATH"',
        'SET QUERY_ERRORLEVEL=%ERRORLEVEL%',
        'IF %QUERY_ERRORLEVEL% == 0 (',
        '        FOR /F "skip=2 tokens=2,*" %%A IN (\'%SystemRoot%\\SysWoW64\\REG.exe query "HKLM\\software\\META" /v "META_PATH"\') DO SET META_PATH=%%B)',
        'SET DESERT_EXE="%META_PATH%\\bin\\DesertTool.exe"',
        '   IF EXIST %DESERT_EXE% (',
        '       REM Installer machine.',
        '       %DESERT_EXE% desertInput.xml /m',
        '   ) ELSE IF EXIST "%META_PATH%\\src\\bin\\DesertTool.exe" (',
        '       REM Developer machine.',
        '       "%META_PATH%\\src\\bin\\DesertTool.exe" desertInput.xml /m',
        '   ) ELSE (',
        '       ECHO on',
        '       ECHO Could not find DesertTool.exe!',
        '       EXIT /B 3',
        '   )',
        ')',
        'IF %QUERY_ERRORLEVEL% == 1 (',
        '    ECHO on',
        'ECHO "META tools not installed." >> _FAILED.txt',
        'ECHO "See Error Log: _FAILED.txt"',
        'EXIT /b %QUERY_ERRORLEVEL%',
        ')',
        'popd'].join('\n');

    return DesertFrontEnd;
});
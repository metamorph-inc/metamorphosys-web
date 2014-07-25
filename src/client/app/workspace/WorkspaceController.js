/*globals define, console, alert, window*/

/**
 * @author lattmann / https://github.com/lattmannd
 * @author pmeijer / https://github.com/pmeijer
 */

define([], function () {
    "use strict";

    var WorkspaceController = function ($scope, $moment, $modal, $upload, smartClient, Chance, growl) {
        var self = this;

        self.$scope = $scope;
        self.smartClient = smartClient;
        self.$modal = $modal;
        self.$moment = $moment;
        self.$upload = $upload;
        self.growl = growl;

        // chance is only for testing purposes
        self.chance = Chance ? new Chance() : null;

        self.initialize();
    };

    WorkspaceController.prototype.update = function () {
        if (!this.$scope.$$phase) {
            this.$scope.$apply();
        }
    };

    WorkspaceController.ModalInstanceController = function ($scope, $modalInstance, data) {

        $scope.data = data;

        $scope.ok = function () {
            $modalInstance.close($scope.data);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    WorkspaceController.prototype.initialize = function () {
        var self = this;

        // scope model
        self.$scope.search = {};
        self.$scope.workspaces = {};

        // Pager
        self.$scope.pager = {};
        self.$scope.pager.currentPage = 1;
        self.$scope.pager.maxSize = 5;

        self.$scope.pager.setPage = function (pageNo) {
            self.$scope.pager.currentPage = pageNo;
        };

        self.$scope.pager.pageChanged = function () {
            console.log('Page changed to: ' + self.$scope.pager.currentPage);
        };

        // New workspace
        self.cleanNewWorkspace(false);

        self.$scope.onDroppedFiles = function (files) {
            throw 'onDroppedFiles function has to be overwritten. ' + files;
        };

        self.$scope.deleteFile = function (file) {
            if (self.$scope.newWorkspace.addedFiles.hasOwnProperty(file.hash)) {
                delete self.$scope.newWorkspace.addedFiles[file.hash];
            }
            self.$scope.newWorkspace.hasFiles = Object.keys(self.$scope.newWorkspace.addedFiles).length > 0;
            self.update();
        };

        self.$scope.createWorkspace = function (name, description) {
            throw 'createWorkspace function has to be overwritten. ' + name + ' ' + description;
        };

        self.$scope.deleteWorkspace = function (id) {
            throw 'deleteWorkspace function has to be overwritten. ' + id;
        };

        self.$scope.duplicateWorkspace = function (id) {
            throw 'duplicateWorkspace function has to be overwritten. ' + id;
        };

        self.$scope.exportWorkspace = function (id) {
            throw 'exportWorkspace function has to be overwritten. ' + id;
        };

        self.$scope.editWorkspace = function (id) {
            var workspace = self.$scope.workspaces[id],
                modalInstance = self.$modal.open({
                    templateUrl: 'app/workspace/dialogs/EditWorkspaceModal.html',
                    controller: WorkspaceController.ModalInstanceController,
                    size: 'lg',
                    resolve: {
                        data: function () {
                            return {name: workspace.name, description: workspace.description};
                        }
                    }
                });

            modalInstance.result.then(function (data) {
                self.updateName(id, data.name);
                self.updateDescription(id, data.description);
            }, function () {
                console.log('Workspace edit dismissed.');
            });
        };

        self.$scope.dragOverClass = function ($event) {
            var items = $event.dataTransfer.items,
                i,
                hasFile = false;

            if (items === null) {
                hasFile = true;
            } else {
                for (i = 0; i < items.length; i += 1) {
                    if (items[i].kind === 'file') {
                        hasFile = true;
                        break;
                    }
                }
            }

            return hasFile ? "bg-success dragover" : "bg-danger dragover";
        };

        self.$scope.getTypeIcon = function (type) {
            var typeToIcon = {
                acm: 'fa fa-puzzle-piece component-icon',
                adm: 'fa fa-cubes',
                atm: 'glyphicon glyphicon-saved',
                requirement: 'fa fa-bar-chart-o'
            };
            if (typeToIcon[type]) {
                return typeToIcon[type];
            }
            return 'glyphicon glyphicon-file';
        };

        //this.initOnFileSelect();

        // initialization of methods
        if (self.smartClient) {
            // if smartClient exists
            self.initWithSmartClient();
        } else {
            console.warn('Data is not linked to the WebGME database.');
            self.initTestData();
        }
    };

    WorkspaceController.prototype.initTestData = function () {
        var self = this,
            i;

        self.idCounter = 0;

        self.$scope.createWorkspace = function (workspace) {
            var id = '/' + self.idCounter,
                today;

            // sample to use growl
//            self.growl.success('createWorkspace ' + new Date());
//            self.growl.warning('createWorkspace ' + new Date());
//            self.growl.info('createWorkspace ' + new Date());
//            self.growl.error('createWorkspace ' + new Date());

            today = new Date();

            workspace = workspace || {};

            self.idCounter += 1;

            self.$scope.workspaces[id] = {
                id: id,
                name: workspace.name || self.chance.name(),
                description: workspace.description || self.chance.sentence(),
                url: '#/workspace'
//                lastUpdated: JSON.parse(JSON.stringify(workspace.lastUpdated)) || {
//                    time: self.chance.date({year: today.getFullYear()}),
//                    user: self.chance.name(),
//                    hash: '0123456789abcdef',
//                    message: 'something happened'
//                },
//                components: JSON.parse(JSON.stringify(workspace.components)) || {
//                    count: self.chance.integer({min: 0, max: 5000})
//                },
//                designs: JSON.parse(JSON.stringify(workspace.designs)) || {
//                    count: self.chance.integer({min: 0, max: 50})
//                },
//                testBenches: JSON.parse(JSON.stringify(workspace.testBenches)) || {
//                    count: self.chance.integer({min: 0, max: 500})
//                }
            };

            if (workspace.lastUpdated) {
                self.$scope.workspaces[id].lastUpdated = JSON.parse(JSON.stringify(workspace.lastUpdated));
            } else {
                self.$scope.workspaces[id].lastUpdated = {
                    time: self.chance.date({year: today.getFullYear()}),
                    user: self.chance.name(),
                    hash: '0123456789abcdef',
                    message: 'something happened'
                };
            }

            if (workspace.components) {
                self.$scope.workspaces[id].components = JSON.parse(JSON.stringify(workspace.components));
            } else {
                self.$scope.workspaces[id].components = {
                    count: self.chance.integer({min: 0, max: 5000})
                };
            }

            if (workspace.designs) {
                self.$scope.workspaces[id].designs = JSON.parse(JSON.stringify(workspace.designs));
            } else {
                self.$scope.workspaces[id].designs = {
                    count: self.chance.integer({min: 0, max: 50})
                };
            }

            if (workspace.testBenches) {
                self.$scope.workspaces[id].testBenches = JSON.parse(JSON.stringify(workspace.testBenches));
            } else {
                self.$scope.workspaces[id].testBenches = {
                    count: self.chance.integer({min: 0, max: 500})
                };
            }
            if (workspace.requirements) {
                self.$scope.workspaces[id].requirements = JSON.parse(JSON.stringify(workspace.requirements));
            } else {
                self.$scope.workspaces[id].requirements = {
                    count: self.chance.integer({min: 0, max: 10})
                };
            }
            self.update();
        };

        self.$scope.deleteWorkspace = function (id) {
            var name = self.$scope.workspaces[id] && self.$scope.workspaces[id].name;
            name = name || '';
            delete self.$scope.workspaces[id];
            self.growl.success('Workspace ' + name + ' deleted.');
            self.update();
        };

        self.$scope.duplicateWorkspace = function (id) {
            self.$scope.createWorkspace(self.$scope.workspaces[id]);
            self.growl.success('Created new workspace.');
            self.update();
            self.$scope.editWorkspace(id);
        };

        // create a few items for testing purposes
        for (i = 0; i < 20; i += 1) {
            self.$scope.createWorkspace();
        }

        self.$scope.onDroppedFiles = function (workspace, files) {
            var j,
                validExtensions = {
                    adm: true,
                    atm: true,
                    zip: true,
                    txt: true,
                    md: true,
                    markdown: true,
                    json: true
                },
                counter,
                addFile,
                updateCounter,
                isNewWorkspace = typeof workspace !== 'string';

            if (!isNewWorkspace) {
                self.growl.warning('This displays messages here');
                return;
            }
            if (files.length === 0) {
                return;
            }

            counter = files.length;
            //artie = self.smartClient.blobClient.createArtifact('droppedFiles');
            updateCounter = function () {
                counter -= 1;
                if (counter <= 0) {
                    self.update();
                }
            };
            addFile = function (file) {
                var fileExtension = self.getFileExtension(file.name),
                    hash = self.chance.hash();
                if (validExtensions[fileExtension]) {
                    fileExtension = fileExtension === 'zip' ? 'acm' : fileExtension;
                    fileExtension = fileExtension === 'json' ? 'requirement' : fileExtension;
                    self.$scope.newWorkspace.addedFiles[hash] = {
                        hash: hash,
                        name: file.name,
                        type: fileExtension,
                        size: self.humanFileSize(file.size, true),
                        url: '',
                        error: ''
                    };
                    updateCounter();
                } else {
                    updateCounter();
                }
            };
            for (j = 0; j < files.length; j += 1) {
                addFile(files[i]);
            }
        };
    };

//    WorkspaceController.prototype.initOnFileSelect = function () {
//        var self = this;
//
//        this.$scope.onFileSelect = function (id, $files) {
//            var i,
//                file,
//                acmImporter,
//                admImporter,
//                atmImporter,
//                artifactName,
//                extension,
//                remainingFiles,
//                artifact,
//                done;
//
//            done = function (hash) {
//                if (acmImporter) {
//                    self.importFromFile(id, hash, 'acm');
//                }
//                if (admImporter) {
//                    self.importFromFile(id, hash, 'adm');
//                }
//                if (atmImporter) {
//                    self.importFromFile(id, hash, 'atm');
//                }
//            };
//
//            artifactName = 'Uploaded_artifacts.zip';
//
//            if ($files.length > 1) {
//                acmImporter = true;
//
//            } else if ($files.length === 1) {
//                extension = $files[0].name.split('.').pop().toLowerCase();
//                if (extension === 'adm') {
//                    admImporter = true;
//                } else if (extension === 'atm') {
//                    atmImporter = true;
//                }
//            }
//
//            artifact = self.smartClient.blobClient.createArtifact(artifactName);
//
//            remainingFiles = $files.length;
//
//            for (i = 0; i < $files.length; i += 1) {
//                file = $files[i];
//
//                artifact.addFileAsSoftLink(file.name, file, function (err, hash) {
//                    remainingFiles -= 1;
//
//                    if (err) {
//                        //TODO: something went wrong, tell the user????
//                    } else {
//                        // successfully uploaded
//                    }
//
//                    if (remainingFiles === 0) {
//                        if ($files.length > 1) {
//                            artifact.save(function (err, artifactHash) {
//                                done(artifactHash);
//                            });
//
//                        } else {
//                            done(hash);
//                        }
//                    }
//                });
//            }
//        };
//    };

    WorkspaceController.prototype.updateName = function (id, name) {
        var message,
            workspace = this.$scope.workspaces[id];

        if (workspace.name !== name) {
            if (this.smartClient) {
                message = '[WebCyPhy] - Rename workspace: ' + workspace.name + ' -> ' + name;
                this.smartClient.client.setAttributes(id, 'name', name, message);
            } else {
                workspace.name = name;
                workspace.lastUpdated.time = new Date();
                this.update();
            }
        }
    };

    WorkspaceController.prototype.updateDescription = function (id, description) {
        var message,
            workspace = this.$scope.workspaces[id];

        if (workspace.description !== description) {
            if (this.smartClient) {
                message = '[WebCyPhy] - Change description for ' + workspace.name + ': ' + workspace.description + ' -> ' + description;
                this.smartClient.client.setAttributes(id, 'INFO', description, message);
            } else {
                workspace.description = description;
                workspace.lastUpdated.time = new Date();
                this.update();
            }
        }
    };

    WorkspaceController.prototype.initWithSmartClient = function () {
        var self = this,
            ROOT_ID = '',
            territoryPattern = {},
            territoryId,
            clientMessage,
            k;

        for (k = 0; k < self.smartClient.initialMessages.length; k += 1) {
            clientMessage = self.smartClient.initialMessages[k];
            if (clientMessage.severity === 'info') {
                self.growl.success(clientMessage.message);
            } else if (clientMessage.severity === 'debug') {
                self.growl.info(clientMessage.message, {ttl: 1000});
            } else if (clientMessage.severity === 'warning') {
                self.growl.warning(clientMessage.message);
            } else if (clientMessage.severity === 'error') {
                self.growl.error(clientMessage.message);
            }
        }
        self.territories = {};
        territoryPattern[ROOT_ID] = {children: 1};

        territoryId = self.smartClient.client.addUI(null, function (events) {
            var i,
                event,
                nodeObj;

            for (i = 0; i < events.length; i += 1) {
                event = events[i];
                nodeObj = self.smartClient.client.getNode(event.eid);

                if (event.eid === ROOT_ID && event.etype === 'load') {
                    self.$scope.createWorkspace = self.initCreateWorkspaceClient(ROOT_ID);
                    self.$scope.deleteWorkspace = self.initDeleteWorkspaceClient();
                    self.$scope.duplicateWorkspace = self.initDuplicateWorkspaceClient(ROOT_ID);
                    self.$scope.exportWorkspace = self.initExportWorkspaceClient();
                    self.$scope.onDroppedFiles = self.initOnDroppedFilesClient();
                }

                if (self.smartClient.isMetaTypeOf(nodeObj, 'WorkSpace')) {
                    if (nodeObj.getId() !== self.smartClient.metaNodes.WorkSpace.getId()) {
                        if (event.etype === 'load' || event.etype === 'update') {
                            self.addWorkspaceWatch(nodeObj);
                        }
                    }
                }

                if (event.etype === 'unload' && self.$scope.workspaces.hasOwnProperty(event.eid)) {
                    self.smartClient.removeUI(self.territories[event.eid]);
                    delete self.$scope.workspaces[event.eid];
                }
            }

            if (Object.keys(self.$scope.workspaces).length === 0) {
                self.$scope.newWorkspace.expanded = true;
            }

            self.update();
        });

        self.smartClient.client.updateTerritory(territoryId, territoryPattern);
    };

    WorkspaceController.prototype.addWorkspaceWatch = function (nodeObj) {
        var self = this,
            j,
            workspace;

        workspace = {
            id: nodeObj.getId(),
            name: nodeObj.getAttribute('name'),
            description: nodeObj.getAttribute('INFO'),
            url: '/?project=ADMEditor&activeObject=' + nodeObj.getId(),
            lastUpdated: {
                time: new Date(),
                user: 'N/A',
                hash: '0123456789abcdef',
                message: '????'
            },
            components: {
                count: 0
            },
            designs: {
                count: 0
            },
            testBenches: {
                count: 0
            },
            requirements: {
                count: 0
            }
        };

        self.$scope.workspaces[nodeObj.getId()] = workspace;

        if (self.territories.hasOwnProperty(nodeObj.getId())) {
            self.smartClient.removeUI(self.territories[nodeObj.getId()]);
        }

        self.territories[nodeObj.getId()] = self.smartClient.addUI(nodeObj.getId(), ['ACMFolder', 'ADMFolder', 'ATMFolder', 'RequirementsFolder'], function (events) {
            for (j = 0; j < events.length; j += 1) {
                //console.log(events[j]);

                // component
                if (self.smartClient.isMetaTypeOf(events[j].eid, 'AVMComponentModel')) {
                    if (events[j].etype === 'load') {
                        workspace.components.count += 1;
                    } else if (events[j].etype === 'unload') {
                        workspace.components.count -= 1;
                    } else if (events[j].etype === 'update') {
                        //TODO:  complete
                    } else {
                        throw 'Unexpected event type' + events[j].etype;
                    }
                }

                // design
                if (self.smartClient.isMetaTypeOf(events[j].eid, 'Container')) {
                    if (events[j].etype === 'load') {
                        workspace.designs.count += 1;
                    } else if (events[j].etype === 'unload') {
                        workspace.designs.count -= 1;
                    } else if (events[j].etype === 'update') {
                        //TODO:  complete
                    } else {
                        throw 'Unexpected event type' + events[j].etype;
                    }
                }

                // test bench
                if (self.smartClient.isMetaTypeOf(events[j].eid, 'AVMTestBenchModel')) {
                    if (events[j].etype === 'load') {
                        workspace.testBenches.count += 1;
                    } else if (events[j].etype === 'unload') {
                        workspace.testBenches.count -= 1;
                    } else if (events[j].etype === 'update') {
                        //TODO:  complete
                    } else {
                        throw 'Unexpected event type' + events[j].etype;
                    }
                }

                // requirement
                if (self.smartClient.isMetaTypeOf(events[j].eid, 'RequirementCategory')) {
                    if (events[j].etype === 'load') {
                        workspace.requirements.count += 1;
                    } else if (events[j].etype === 'unload') {
                        workspace.requirements.count -= 1;
                    } else if (events[j].etype === 'update') {
                        //TODO:  complete
                    } else {
                        throw 'Unexpected event type' + events[j].etype;
                    }
                }
            }

            self.update();
        });
    };

    // Functions for creating functions that depend on the Root-node being loaded.
    WorkspaceController.prototype.initExportWorkspaceClient = function () {
        var self = this;
        return function (id) {
            var workspaceName = self.$scope.workspaces[id].name;
            self.smartClient.runPlugin('ExportWorkspace', {activeNode: id, pluginConfig: {}}, function (result) {
                var fileUrl = self.smartClient.blobClient.getDownloadURL(result.artifacts[0]);
                if (result.success) {
                    self.growl.success('All objects successfully exported for workspace <a href="' + fileUrl +
                        '">' + workspaceName + '</a>.', {ttl: -1});
                } else {
                    self.growl.error('There were errors exporting the workspace ' + workspaceName + '.');
                }
                self.showPluginMessages(result.messages);
                self.update();
            });
        };
    };

    WorkspaceController.prototype.initDeleteWorkspaceClient = function () {
        var self = this;
        return function (id) {
            var nodeToDelete = self.smartClient.client.getNode(id),
                name = nodeToDelete.getAttribute('name');
            self.smartClient.client.delMoreNodes([id], '[WebCyPhy] - ' + name + ' was deleted.');
            self.growl.info('Workspace ' + name + ' deleted.');
        };
    };

    WorkspaceController.prototype.initDuplicateWorkspaceClient = function (ROOT_ID) {
        var self = this;
        return function (id) {
            var params = {"parentId": ROOT_ID},
                name = self.$scope.workspaces[id].name;
            params[id] = {};
            self.smartClient.client.copyMoreNodes(params, '[WebCyPhy] - Duplicate workspace ' + name);
            self.growl.success('Workspace ' + name + ' duplicated.');
            self.update();
            self.$scope.editWorkspace(id);
        };
    };

    WorkspaceController.prototype.initCreateWorkspaceClient = function (ROOT_ID) {
        var self = this;
        return function (newWorkspace) {
            var hasFiles = Object.keys(newWorkspace.addedFiles).length > 0,
                newId;
            // Create new workspace node and name it appropriately.
            newId = self.smartClient.client.createChild({parentId: ROOT_ID, baseId: self.smartClient.metaNodes.WorkSpace.getId()},
                '[WebCyPhy] - New workspace was created.');
            if (!newWorkspace.name) {
                self.growl.warning('No name given for workspace, assigning "NewWorkspace"...');
                newWorkspace.name = 'NewWorkspace';
            }
            self.growl.info('Workspace node "' + newWorkspace.name + '" created.');
            self.smartClient.client.setAttributes(newId, 'name', newWorkspace.name, '[WebCyPhy] - New workspace was named: ' + newWorkspace.name);
            if (newWorkspace.description) {
                self.smartClient.client.setAttributes(newId, 'INFO', newWorkspace.description, '[WebCyPhy] - ' + newWorkspace.name + ' workspace description was updated.');
            }
            self.update();
            newWorkspace.id = newId;
            if (hasFiles === false) {
                self.growl.success('Workspace "' + newWorkspace.name + '" successfully created.');
                self.cleanNewWorkspace(true);
            } else {
                self.growl.info('Importing files to new workspace, please wait...');
                self.importFilesToWorkspace(newWorkspace, function (success) {
                    if (success) {
                        self.growl.success('All files successfully imported into new workspace!', {ttl: 25000});
                    } else {
                        self.growl.error('There were errors during importation of files into new workspace.');
                    }
                    self.cleanNewWorkspace(true);
                });
            }
        };
    };

    WorkspaceController.prototype.initOnDroppedFilesClient = function () {
        var self = this;

        return function (workspace, files) {
            var i,
                validExtensions = {
                    adm: true,
                    atm: true,
                    zip: true,
                    txt: true,
                    md: true,
                    markdown: true,
                    json: true
                },
                counter,
                artie,
                addFile,
                isNewWorkspace = typeof workspace !== 'string',
                wsNode,
                wsName,
                hasFiles,
                updateCounter;

            if (files.length === 0) {
                self.growl.warning('Drag and drop only supported with files.');
                self.update();
                return;
            }

            if (!isNewWorkspace) {
                wsNode = self.smartClient.client.getNode(workspace);
                wsName = wsNode.getAttribute('name');
                workspace = {
                    id: workspace,
                    name: wsName,
                    addedFiles: {}
                };
            }
            counter = files.length;
            artie = self.smartClient.blobClient.createArtifact('droppedFiles');
            updateCounter = function () {
                counter -= 1;
                if (counter <= 0) {
                    if (isNewWorkspace) {
                        self.update();
                    } else {
                        if (hasFiles) {
                            self.growl.info('Importing files to ' + wsName + ', please wait...');
                            self.importFilesToWorkspace(workspace, function (success) {
                                if (success) {
                                    self.growl.success('All files successfully imported into ' + wsName + '.',
                                        {ttl: 25000});
                                } else {
                                    self.growl.error('There were errors during importation of files into ' + wsName + '.');
                                }
                            });
                        }
                    }
                }
            };
            addFile = function (file) {
                var fileExtension = self.getFileExtension(file.name);
                if (validExtensions[fileExtension]) {
                    artie.addFileAsSoftLink(file.name, file, function (err, hash) {
                        if (err) {
                            console.error('Could not add file "' + file.name + '" to blob, err: ' + err);
                            updateCounter();
                            return;
                        }
                        hasFiles = true;
                        fileExtension = fileExtension === 'zip' ? 'acm' : fileExtension;
                        fileExtension = fileExtension === 'json' ? 'requirement' : fileExtension;
                        workspace.addedFiles[hash] = {
                            hash: hash,
                            name: file.name,
                            type: fileExtension,
                            size: self.humanFileSize(file.size, true),
                            url: self.smartClient.blobClient.getDownloadURL(hash),
                            error: ''
                        };
                        updateCounter();
                    });
                } else {
                    self.growl.warning('File ' + file.name + ' is not a supported file type.');
                    updateCounter();
                }
            };
            for (i = 0; i < files.length; i += 1) {
                addFile(files[i]);
            }
        };
    };

    // Helper methods
    /**
     * @param workspaceInfo {object} - info about receiving workspace.
     * @param workspaceInfo.name {string} - name of receiving workspace.
     * @param workspaceInfo.id {string} - id of receiving workspace.
     * @param workspaceInfo.addedFiles {object} - files to be added to the receiving workspace.
     * @param callback {function(boolean)} - returns with the total success.
     */
    WorkspaceController.prototype.importFilesToWorkspace = function (workspaceInfo, callback) {
        var self = this,
            key,
            fileInfo,
            acmArtie,
//            acms = {},
            acms = [],
            adms = [],
            atms = [],
            requirements = [],
            afterAcmImport,
            totalSuccess = true;
        // Import the files dropped by the user.
        for (key in workspaceInfo.addedFiles) {
            if (workspaceInfo.addedFiles.hasOwnProperty(key)) {
                fileInfo = workspaceInfo.addedFiles[key];
                if (fileInfo.type === 'acm') {
                    acms.push(fileInfo.hash);
//                    acms[fileInfo.name] = fileInfo.hash;
                } else if (fileInfo.type === 'adm') {
                    adms.push(fileInfo.hash);
                } else if (fileInfo.type === 'atm') {
                    atms.push(fileInfo.hash);
                } else if (fileInfo.type === 'requirement') {
                    requirements.push(fileInfo.hash);
                } else {
                    self.smartClient.client.setAttributes(workspaceInfo.id, 'ReadMe', fileInfo.hash, '[WebCyPhy] - ' +
                        workspaceInfo.name + ' workspace ReadMe was updated.');
                }
            }
        }

//        afterAcmImport = function () {
        self.importMultipleFromFiles(workspaceInfo, acms, 'acm', function (acmResults) {
            totalSuccess = totalSuccess && acmResults;
            self.importMultipleFromFiles(workspaceInfo, adms, 'adm', function (admResults) {
                totalSuccess = totalSuccess && admResults;
                self.importMultipleFromFiles(workspaceInfo, atms, 'atm', function (atmResults) {
                    totalSuccess = totalSuccess && atmResults;
                    self.importMultipleFromFiles(workspaceInfo, requirements, 'requirement', function (reqResults) {
                        totalSuccess = totalSuccess && reqResults;
                        callback(totalSuccess);
                    });
                });
            });
        });
//        };
//        if (Object.keys(acms).length > 0) {
//            acmArtie = self.smartClient.blobClient.createArtifact('Uploaded_artifacts.zip');
//            acmArtie.addMetadataHashes(acms, function (err, hashes) {
//                // TODO: error-handling
//                acmArtie.save(function (err, artieHash) {
//                    // TODO: error-handling
//                    self.importFromFile(workspaceInfo.id, artieHash, 'acm', function (hash, result) {
//                        var fileUrl = self.smartClient.blobClient.getDownloadURL(result.hash),
//                            filename = 'Uploaded_artifacts.zip';
//                        console.log(result);
//                        if (result.success === false) {
//                            totalSuccess = false;
//                            self.growl.error('AcmImporter failed on <a href="' + fileUrl + '">' + filename + '</a>');
//                        } else {
//                            self.growl.success('AcmImporter succeeded on <a href="' + fileUrl + '">' + filename + '</a>');
//                        }
//                        self.showPluginMessages(result.messages);
//                        self.update();
//                        afterAcmImport();
//                    });
//                });
//            });
//        } else {
//            afterAcmImport();
//        }
    };

    WorkspaceController.prototype.importMultipleFromFiles = function (workspaceInfo, hashes, importType, callback) {
        var self = this,
            importerNameMap = {
                acm: 'AcmImporter',
                adm: 'AdmImporter',
                atm: 'AtmImporter',
                requirement: 'RequirementImporter'
            },
            c = hashes.length,
            n = hashes.length,
            totalSuccess = true,
            counterCallback = function (hash, result) {
                var filename,
                    fileUrl;
                c -= 1;
                console.log(result);
                fileUrl = self.smartClient.blobClient.getDownloadURL(hash);
                filename = workspaceInfo.addedFiles[hash].name;
                if (result.success === false) {
                    totalSuccess = false;
                    self.growl.error(importerNameMap[importType] + ' failed on <a href="' + fileUrl + '">' +
                        filename + '</a>. [' + (n - c) + '/' + n + ']');
                } else {
                    self.growl.success(importerNameMap[importType] + ' succeeded on <a href="' + fileUrl + '">' +
                        filename + '</a>. [' + (n - c) + '/' + n + ']');
                }
                self.showPluginMessages(result.messages);
                if (c <= 0) {
                    callback(totalSuccess);
                } else {
                    self.importFromFile(workspaceInfo.id, hashes[c - 1], importType, counterCallback);
                }
            };
        if (n === 0) {
            callback(totalSuccess);
        } else {
            self.growl.info('Calling ' + importerNameMap[importType] + ' ' + n + ' times..');
            self.importFromFile(workspaceInfo.id, hashes[c - 1], importType, counterCallback);
        }
    };

    WorkspaceController.prototype.getFileExtension = function (filename) {
        var a = filename.split(".");
        if (a.length === 1 || (a[0] === "" && a.length === 2)) {
            return "";
        }
        return a.pop().toLowerCase();
    };

    WorkspaceController.prototype.importFromFile = function (workspaceId, hash, importType, callback) {
        var self = this,
            folder,
            acceptedTypes = {
                acm: true,
                adm: true,
                atm: true,
                requirement: true
            },
            done = callback || function (fileHash, result) {
                if (result.error) {
                    console.error(result);
                } else {
                    console.info(result);
                }
            };

        if (!acceptedTypes[importType]) {
            throw 'importType of importFromFile must be either acm, adm, atm or requirement. Provided was : ' + importType;
        }

        if (!self.smartClient) {
            throw 'importFromFile not implemented without a client!';
        }

        folder = self.getFolder(workspaceId, importType, true);
        if (importType === 'acm') {
            //self.growl.info('Running AcmImporter...');
            self.smartClient.runPlugin('AcmImporter', {activeNode: folder.getId(), pluginConfig: {'UploadedFile': hash}}, function (result) {
                done(hash, result);
            });
        } else if (importType === 'adm') {
            //self.growl.info('Running AdmImporter...');
            self.smartClient.runPlugin('AdmImporter', {activeNode: folder.getId(), pluginConfig: {'admFile': hash}}, function (result) {
                done(hash, result);
            });
        } else if (importType === 'atm') {
            //self.growl.info('Running AtmImporter...');
            self.smartClient.runPlugin('AtmImporter', {activeNode: folder.getId(), pluginConfig: {'atmFile': hash}}, function (result) {
                done(hash, result);
            });
        } else if (importType === 'requirement') {
            //self.growl.info('Running RequirementImporter...');
            self.smartClient.runPlugin('RequirementImporter', {activeNode: folder.getId(), pluginConfig: {'requirement': hash}}, function (result) {
                done(hash, result);
            });
        } else {
            done(hash, {error: 'Unknown argument importType=' + importType});
        }
    };

    WorkspaceController.prototype.getFolder = function (workspaceId, folderType, create) {
        var self = this,
            nodeWorkspace,
            childrenIds,
            nodeChild,
            nodeId,
            name,
            i,
            folderName = {
                acm: 'Components',
                adm: 'Designs',
                atm: 'Test Benches',
                requirement: 'Requirements'
            },
            metaType = {
                acm: 'ACMFolder',
                adm: 'ADMFolder',
                atm: 'ATMFolder',
                requirement: 'RequirementsFolder'
            };

        if (!self.smartClient) {
            throw 'getFolder not implemented without a client!';
        }
        if (!folderName[folderType]) {
            throw 'folderType of getFolder must be either acm, adm or atm. Provided was : ' + folderType;
        }

        nodeWorkspace = self.smartClient.client.getNode(workspaceId);
        childrenIds = nodeWorkspace.getChildrenIds();
        // Look for existing match.
        for (i = 0; i < childrenIds.length; i += 1) {
            nodeChild = self.smartClient.client.getNode(childrenIds[i]);
            if (nodeChild.getAttribute('name') === folderName[folderType] &&
                    self.smartClient.isMetaTypeOf(nodeChild, metaType[folderType])) {
                return nodeChild;
            }
        }
        // If not found and called with create == true - create a new folder.
        if (create) {
            nodeId = self.smartClient.client.createChild({
                parentId: workspaceId,
                baseId: self.smartClient.metaNodes[metaType[folderType]].getId()
            }, '[WebCyPhy] - New ' + metaType[folderType] + ' was created.');
            name = folderName[folderType];
            self.smartClient.client.setAttributes(nodeId, 'name', name,
                    '[WebCyPhy] - New ' + metaType[folderType] + ' was renamed: ' + name);
            return self.smartClient.client.getNode(nodeId);
        }
    };

    WorkspaceController.prototype.humanFileSize = function (bytes, si) {
        var thresh = si ? 1000 : 1024,
            units,
            u;
        if (bytes < thresh) {
            return bytes + ' B';
        }

        units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] :
                ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        u = -1;

        do {
            bytes = bytes / thresh;
            u += 1;
        } while (bytes >= thresh);

        return bytes.toFixed(1) + ' ' + units[u];
    };

    WorkspaceController.prototype.showPluginMessages = function (messages) {
        var self = this,
            msg,
            nodeUrl,
            maxMessages = 10,
            i;
        for (i = 0; i < messages.length; i += 1) {
            msg = messages[i];
            nodeUrl = '/?project=ADMEditor&activeObject=' + msg.activeNode.id;
            nodeUrl = '<a href="' + nodeUrl + '" target="_blank">' + msg.activeNode.name + '</a> - ';
            if (msg.severity === 'info') {
                self.growl.info(nodeUrl + msg.message);
            } else if (msg.severity === 'warning') {
                self.growl.warning(nodeUrl + msg.message);
            } else if (msg.severity === 'error') {
                self.growl.error(nodeUrl + msg.message);
            } else {
                self.growl.info(nodeUrl + msg.message);
            }
            if (i > maxMessages - 1) {
                self.growl.info("More than 10 messages from one plugin, won't growl any more..", {ttl: -1});
                return;
            }
        }
    };

    WorkspaceController.prototype.cleanNewWorkspace = function (doUpdate) {
        var self = this;
        self.$scope.newWorkspace = {
            status: '',
            name: '',
            description: '',
            expanded: false,
            addedFiles: {}
        };
        if (doUpdate) {
            self.update();
        }
    };

    return WorkspaceController;
});


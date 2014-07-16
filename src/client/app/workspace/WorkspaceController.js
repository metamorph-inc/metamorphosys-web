/*globals define, console*/

/**
 * @author lattmann / https://github.com/lattmann
 */

define([], function () {
    "use strict";

    var WorkspaceController = function ($scope, $moment, $modal, $upload, smartClient, Chance) {
        var self = this;

        self.$scope = $scope;
        self.smartClient = smartClient;
        self.$modal = $modal;
        self.$moment = $moment;
        self.$upload = $upload;

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
                atm: 'glyphicon glyphicon-saved'
            };
            if (typeToIcon[type]) {
                return typeToIcon[type];
            }
            return 'glyphicon glyphicon-file';
        };

        this.initOnFileSelect();

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
            delete self.$scope.workspaces[id];

            self.update();
        };

        self.$scope.duplicateWorkspace = function (id) {
            self.$scope.createWorkspace(self.$scope.workspaces[id]);
            self.update();
            self.$scope.editWorkspace(id);
        };

        // create a few items for testing purposes
        for (i = 0; i < 20; i += 1) {
            self.$scope.createWorkspace();
        }

        self.$scope.onDroppedFiles = function (files) {
            var j,
                validExtensions = {
                    adm: true,
                    atm: true,
                    zip: true
                },
                counter,
                addFile,
                updateCounter;

            if (files.length === 0) {
                return;
            }

            counter = files.length;
            //artie = self.smartClient.blobClient.createArtifact('droppedFiles');
            updateCounter = function () {
                counter -= 1;
                if (counter <= 0) {
                    self.$scope.newWorkspace.hasFiles = Object.keys(self.$scope.newWorkspace.addedFiles).length > 0;
                    self.update();
                }
            };
            addFile = function (file) {
                var fileExtension = self.getFileExtension(file.name),
                    hash = self.chance.hash();
                if (validExtensions[fileExtension]) {
                    fileExtension = fileExtension === 'zip' ? 'acm' : fileExtension;
                    self.$scope.newWorkspace.addedFiles[hash] = {
                        hash: hash,
                        name: file.name,
                        type: fileExtension,
                        size: self.humanFileSize(file.size, true),
                        url: ''
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
        // test UI responsiveness
//        setInterval(function () {
//            self.$scope.workspaces['/2'].lastUpdated.time = (new Date()).toISOString();
//            self.update();
//        }, 100);
    };

    WorkspaceController.prototype.initOnFileSelect = function () {
        var self = this;

        this.$scope.onFileSelect = function (id, $files) {
            var i,
                file,
                acmImporter,
                admImporter,
                atmImporter,
                artifactName,
                extension,
                remainingFiles,
                artifact,
                done;

            done = function (hash) {
                if (acmImporter) {
                    self.importFromFile(id, hash, 'acm');
                }
                if (admImporter) {
                    self.importFromFile(id, hash, 'adm');
                }
                if (atmImporter) {
                    self.importFromFile(id, hash, 'atm');
                }
            };

            artifactName = 'Uploaded_artifacts.zip';

            if ($files.length > 1) {
                acmImporter = true;

            } else if ($files.length === 1) {
                extension = $files[0].name.split('.').pop().toLowerCase();
                if (extension === 'adm') {
                    admImporter = true;
                } else if (extension === 'atm') {
                    atmImporter = true;
                }
            }

            artifact = self.smartClient.blobClient.createArtifact(artifactName);

            remainingFiles = $files.length;

            for (i = 0; i < $files.length; i += 1) {
                file = $files[i];

                artifact.addFileAsSoftLink(file.name, file, function (err, hash) {
                    remainingFiles -= 1;

                    if (err) {
                        //TODO: something went wrong, tell the user????
                    } else {
                        // successfully uploaded
                    }

                    if (remainingFiles === 0) {
                        if ($files.length > 1) {
                            artifact.save(function (err, artifactHash) {
                                done(artifactHash);
                            });

                        } else {
                            done(hash);
                        }
                    }
                });
            }
        };
    };

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
                message = '[WebCyPhy] - Change description for ' +  workspace.name + ': ' + workspace.description + ' -> ' + description;
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
            territoryId;

        self.$scope.onDroppedFiles = function (files) {
            var i,
                validExtensions = {
                    adm: true,
                    atm: true,
                    zip: true,
                    txt: true,
                    md: true,
                    markdown: true
                },
                counter,
                artie,
                addFile,
                updateCounter;

            if (files.length === 0) {
                return;
            }

            counter = files.length;
            artie = self.smartClient.blobClient.createArtifact('droppedFiles');
            updateCounter = function () {
                counter -= 1;
                if (counter <= 0) {
                    self.$scope.newWorkspace.hasFiles = Object.keys(self.$scope.newWorkspace.addedFiles).length > 0;
                    self.update();
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
                        fileExtension = fileExtension === 'zip' ? 'acm' : fileExtension;
                        self.$scope.newWorkspace.addedFiles[hash] = {
                            hash: hash,
                            name: file.name,
                            type: fileExtension,
                            size: self.humanFileSize(file.size, true),
                            url: self.smartClient.blobClient.getDownloadURL(hash)
                        };
                        updateCounter();
                    });
                } else {
                    updateCounter();
                }
            };
            for (i = 0; i < files.length; i += 1) {
                addFile(files[i]);
            }
        };

        self.territories = {};

        territoryPattern[ROOT_ID] = {children: 1};

        territoryId = self.smartClient.client.addUI(null, function (events) {
            var i,
                event,
                nodeObj,
                createWorkspaceFunction,
                deleteWorkspaceFunction,
                duplicateWorkspaceFunction;

            createWorkspaceFunction = function (newWorkspace) {
                var newId,
                    key,
                    fileInfo,
                    acmArtie,
                    acms = {},
                    adms = [],
                    atms = [],
                    afterAcmImport;
                // Create new workspace node and name it appropriately.
                newWorkspace.status = 'Importing files, please wait...';
                newId = self.smartClient.client.createChild({parentId: ROOT_ID, baseId: self.smartClient.metaNodes.WorkSpace.getId()},
                    '[WebCyPhy] - New workspace was created.');
                self.smartClient.client.setAttributes(newId, 'name', newWorkspace.name, '[WebCyPhy] - New workspace was named: ' + newWorkspace.name);
                if (newWorkspace.description) {
                    self.smartClient.client.setAttributes(newId, 'INFO', newWorkspace.description, '[WebCyPhy] - ' + newWorkspace.name + ' workspace description was updated.');
                }
                // Import the files dropped by the user.
                for (key in newWorkspace.addedFiles) {
                    if (newWorkspace.addedFiles.hasOwnProperty(key)) {
                        fileInfo = newWorkspace.addedFiles[key];
                        if (fileInfo.type === 'acm') {
                            acms[fileInfo.name] = fileInfo.hash;
                        } else if (fileInfo.type === 'adm') {
                            adms.push(fileInfo.hash);
                        } else if (fileInfo.type === 'atm') {
                            atms.push(fileInfo.hash);
                        } else {
                            self.smartClient.client.setAttributes(newId, 'ReadMe', fileInfo.hash, '[WebCyPhy] - ' + newWorkspace.name + ' workspace ReadMe was updated.');
                        }
                    }
                }
                afterAcmImport = function () {
                    self.importMultipleFromFiles(newId, adms, 'adm', function (admResults) {
                        console.log(admResults);
                        self.importMultipleFromFiles(newId, atms, 'atm', function (atmResults) {
                            console.log(atmResults);
                            self.cleanNewWorkspace(true);
                        });
                    });
                };
                if (Object.keys(acms).length > 0) {
                    acmArtie = self.smartClient.blobClient.createArtifact('Uploaded_artifacts.zip');
                    acmArtie.addMetadataHashes(acms, function (err, hashes) {
                        // TODO: error-handling
                        acmArtie.save(function (err, artieHash) {
                            // TODO: error-handling
                            self.importFromFile(newId, artieHash, 'acm', function (result) {
                                console.log(result);
                                afterAcmImport();
                            });
                        });
                    });
                } else {
                    afterAcmImport();
                }
            };

            deleteWorkspaceFunction = function (id) {
                var nodeToDelete = self.smartClient.client.getNode(id);
                self.smartClient.client.delMoreNodes([id], '[WebCyPhy] - ' + nodeToDelete.getAttribute('name') + ' was deleted.');
            };

            duplicateWorkspaceFunction = function (id) {
                //self.$scope.createWorkspace(self.$scope.workspaces[id]);
                var params = {"parentId": ROOT_ID};
                params[id] = {};
                self.smartClient.client.copyMoreNodes(params, '[WebCyPhy] - Duplicate workspace ' + self.$scope.workspaces[id].name);
                self.update();
                self.$scope.editWorkspace(id);
            };

            for (i = 0; i < events.length; i += 1) {
                event = events[i];
                nodeObj = self.smartClient.client.getNode(event.eid);

                if (event.eid === ROOT_ID && event.etype === 'load') {
                    self.$scope.createWorkspace = createWorkspaceFunction;
                    self.$scope.deleteWorkspace = deleteWorkspaceFunction;
                    self.$scope.duplicateWorkspace = duplicateWorkspaceFunction;
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
                if (self.smartClient.isMetaTypeOf(events[j].eid, 'Requirement')) {
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

    WorkspaceController.prototype.cleanNewWorkspace = function (doUpdate) {
        var self = this;
        self.$scope.newWorkspace = {
            status: '',
            name: '',
            description: '',
            expanded: false,
            hasFiles: false,
            addedFiles: {}
        };
        if (doUpdate) {
            self.update();
        }
    };

    // Helper methods
    WorkspaceController.prototype.importMultipleFromFiles = function (workspaceId, hashes, importType, callback) {
        var self = this,
            counter = hashes.length,
            results = [],
            i,
            counterCallback = function (result) {
                counter -= 1;
                results.push(result);
                if (counter <= 0) {
                    callback(results);
                }
            };
        if (hashes.length === 0) {
            callback(results);
            return;
        }
        for (i = 0; i < hashes.length; i += 1) {
            self.importFromFile(workspaceId, hashes[i], importType, counterCallback);
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
                atm: true
            },
            done = callback || function (result) {
                if (result.error) {
                    console.error(result.error);
                } else {
                    console.info(result);
                }
            };

        if (!acceptedTypes[importType]) {
            throw 'importType of importFromFile must be either acm, adm or atm. Provided was : ' + importType;
        }

        if (!self.smartClient) {
            throw 'importFromFile not implemented without a client!';
        }

        folder = self.getFolder(workspaceId, importType, true);
        if (importType === 'acm') {
            self.smartClient.runPlugin('AcmImporter', {activeNode: folder.getId(), pluginConfig: {'UploadedFile': hash}}, function (result) {
                done(result);
            });
        } else if (importType === 'adm') {
            self.smartClient.runPlugin('AdmImporter', {activeNode: folder.getId(), pluginConfig: {'admFile': hash}}, function (result) {
                done(result);
            });
        } else if (importType === 'atm') {
            self.smartClient.runPlugin('AtmImporter', {activeNode: folder.getId(), pluginConfig: {'atmFile': hash}}, function (result) {
                done(result);
            });
        } else {
            done({error: 'Unknown argument importType=' + importType});
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
                atm: 'Test Benches'
            },
            metaType = {
                acm: 'ACMFolder',
                adm: 'ADMFolder',
                atm: 'ATMFolder'
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
        var thresh = si ? 1000 : 1024;
        if (bytes < thresh) {
            return bytes + ' B';
        }

        var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];

        var u = -1;

        do {
            bytes = bytes / thresh;
            u += 1;
        } while(bytes >= thresh);

        return bytes.toFixed(1) + ' ' + units[u];
    };

    return WorkspaceController;
});


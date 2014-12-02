/* global define,require,webGMEGlobal */
/*
config.json: "rextrast": { "copyproject": "./src/rest/copyproject/CopyProject", ...
http://localhost:8855/rest/external/copyproject
 */
define(['core/coreforplugins',
    'storage/serveruserstorage',
    'coreclient/serialization',
], function (Core, Storage, Serialization) {
    "use strict";

    var fs = require('fs');
    var PATH = require('path');
    //var cyphyRootDir = PATH.resolve(__dirname, '../../..');
    var cyphyRootDir = PATH.resolve('.');
    var CONFIG = webGMEGlobal.getConfig();

    function Copy(req, res, next) {
        var projectName = "Test" + Math.floor(Math.random() * 10000);
        var fatal = function (err) {
            res.status(500).send(err);
        };
        var storage = new Storage({'host': CONFIG.mongoip, 'port': CONFIG.mongoport, 'database': CONFIG.mongodatabase});
        storage.openDatabase(function (err) {
            if (err) {
                return fatal(err);
            }
            fatal = function (err) {
                storage.closeDatabase();
                if (err) {
                    res.status(500).send(err);
                }
            };
            storage.openProject(projectName, function (err, project) {
                if (err) {
                    return fatal(err);
                }
                fatal = function (err) {
                    project.closeProject();
                    storage.closeDatabase();
                    if (err) {
                        res.status(500).send(err);
                    }
                };
                var core = new Core(project),
                    root = core.createNode({parent:null, base:null});
                Serialization.import(core, root, JSON.parse(fs.readFileSync(PATH.resolve(cyphyRootDir, "meta/ADMEditor_metaOnly.json"), {encoding: 'utf-8'})), function(err) {
                    if (err) {
                        return storage.deleteProject(name, function() {
                            return fatal(err);
                        });
                    }

                    core.persist(root, function(err) {});
                    var rhash = core.getHash(root),
                        chash = project.makeCommit([],rhash,"project imported",function(err){});
                    project.getBranchHash("master","#hack",function(err, oldhash){
                        if (err) {
                            return fatal(err);
                        }
                        project.setBranchHash("master", oldhash, chash, function (err) {
                            if (err) {
                                return fatal(err);
                            }
                            project.loadObject(chash, function (err, obj) {
                                if (err) {
                                    fatal(err);
                                }
                                core.loadRoot(obj.root, function (err, root) {
                                    if (err) {
                                        fatal(err);
                                    }
                                    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                                    res.header("Pragma", "no-cache");
                                    res.redirect('/?project=' + projectName);

                                    project.closeProject();
                                    storage.closeDatabase();
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    var CopyProject = function (req, res, next) {
        var config = webGMEGlobal.getConfig(),
            url = req.url.split('/'),
            handlers = {
            };

        if (url.length === 2) {
            Copy(req, res, next);
        } else if (handlers.hasOwnProperty(url[1])) {
            handlers[url[1]](req, res, next);
        } else {
            res.send(404);
        }
    };

    return CopyProject;
});

/* global WebGMEGlobal */
var PATH = require('path');
var cyphyRootDir = PATH.resolve(__dirname, '..');
var fs = require('fs');
var webGme = require('webgme');
var CONFIG = WebGMEGlobal.getConfig();
var requirejs = require(PATH.resolve(cyphyRootDir, 'test-conf.js')).requirejs;
require(PATH.resolve(__dirname, 'JSON2_ordered'));

var CyPhyConfig = require(PATH.resolve(cyphyRootDir, "config.json"));
WebGMEGlobal.setConfig(CyPhyConfig);
// TODO: check if command line config valid or not
// TODO: probably we should not overwrite the dictionary and array options
for (var key in CyPhyConfig) {
    CONFIG[key] = CyPhyConfig[key];
}

requirejs([
    'core/coreforplugins',
    'storage/serveruserstorage',
    'coreclient/serialization',
    'blob/BlobClient',
], function (Core, Storage, Serialization, BlobClient) {

//requirejs.s.contexts._.config.nodeRequire = undefined;
//requirejs(['js/client'], function (Client) {
    var storage = new Storage({'host': CONFIG.mongoip, 'port': CONFIG.mongoport, 'database': CONFIG.mongodatabase});
    storage.openDatabase(function (err) {
        if (err) {
            fatal(err);
        }
        storage.openProject('TmpProject', function (err, project) {
            if (err) {
                fatal(err);
            }
            var core = new Core(project),
                root = core.createNode({parent:null, base:null});
            Serialization.import(core, root, JSON.parse(fs.readFileSync(PATH.resolve(cyphyRootDir, "meta/ADMEditor_metaOnly.json"), {encoding: 'utf-8'})), function(err) {
                if (err) {
                    return storage.deleteProject(name,function(){
                        console.log(err);
                        process.exit(1);
                    });
                }

                core.persist(root,function(err){});
                var rhash = core.getHash(root),
                    chash = project.makeCommit([],rhash,"project imported",function(err){});
                project.getBranchHash("master","#hack",function(err, oldhash){
                    if (err) {
                        fatal(err);
                    }
                    project.setBranchHash("master", oldhash, chash, function (err) {
                        if (err) {
                            fatal(err);
                        }
                        project.loadObject(chash, function (err, res) {
                            if (err) {
                                fatal(err);
                            }
                            core.loadRoot(res.root, function (err, root) {
                                if (err) {
                                    fatal(err);
                                }
                                core.loadChildren(root, function (err, children) {
                                    if (err) {
                                        fatal(err);
                                    }
                                    var meta = children.filter(function (child) { return core.getAttribute(child, "name") === "ADMEditorModelingLanguage"; })[0];

                                    Serialization.export(core, meta, function (err, res) {
                                        if (err) {
                                            fatal(err);
                                        }
                                        fs.writeFileSync(PATH.resolve(cyphyRootDir, 'meta/ADMEditor_metaLib.json'), JSON.stringify_ordered(res, undefined, 4), {encoding: 'utf-8'});
                                        project.closeProject();
                                        storage.closeDatabase();
                                        writeMetaJs();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    function writeMetaJs() {
        var pluginConfig = {};
        pluginConfig.projectName = "TmpProject";
        pluginConfig.branch = "master";
        pluginConfig.pluginName = "PluginGenerator";
        pluginConfig.activeNode = undefined;
        pluginConfig.activeSelection = undefined;
        pluginConfig.pluginConfig = {};
        webGme.runPlugin.main(CONFIG, pluginConfig, function (err, result) {
            if (err) {
                fatal(err);
            }
            var blobClient = new BlobClient({
                server: 'localhost',
                serverPort: 8855,
                httpsecure: false,
                sessionId: undefined
            });
            blobClient.getArtifact(result.artifacts[0], function (err, data) {
                if (err) {
                    fatal(err);
                }
                blobClient.getSubObject(result.artifacts[0], 'src/plugins/TmpProject/NewPlugin/meta.js', function (err, res) {
                    if (err) {
                        fatal(err);
                    }
                    var meta_js = res.toString('utf8');
                    ['src/plugins/ADMEditor/AcmImporter/meta.js',
                        'src/plugins/ADMEditor/AdmExporter/meta.js',
                        'src/plugins/ADMEditor/AdmImporter/meta.js',
                        'src/plugins/ADMEditor/AtmExporter/meta.js',
                        'src/plugins/ADMEditor/AtmImporter/meta.js'].forEach(function (f) {
                            fs.writeFileSync(PATH.resolve(cyphyRootDir, f), meta_js, {encoding: 'utf-8'});
                        });

                    writeExampleModel();
                });
            });
        });
    }
    function writeExampleModel() {
        var pluginConfig = {};
        pluginConfig.projectName = "TmpProject";
        pluginConfig.branch = "master";
        pluginConfig.pluginName = "MockModelGenerator";
        pluginConfig.activeNode = "/1";
        pluginConfig.activeSelection = undefined;
        pluginConfig.pluginConfig = { timeOut: 0};
        webGme.runPlugin.main(CONFIG, pluginConfig, function (err, result) {
            if (err) {
                fatal(err);
            }
            var blobClient = new BlobClient({
                server: 'localhost',
                serverPort: 8855,
                httpsecure: false,
                sessionId: undefined
            });
            blobClient.getArtifact(result.artifacts[0], function (err, data) {
                if (err) {
                    fatal(err);
                }
                blobClient.getSubObject(result.artifacts[0], 'test/models/TmpProject/META.js', function (err, res) {
                    if (err) {
                        fatal(err);
                    }
                    var meta_js = res.toString('utf8');
                    ['test/models/AcmImporter/META.js'].forEach(function (f) {
                            fs.writeFileSync(PATH.resolve(cyphyRootDir, f), meta_js, {encoding: 'utf-8'});
                        });
                });
            });
        });
    }
});

function fatal(msg) {
    console.log(msg);
    throw Error(msg);
    process.exit(1);
}
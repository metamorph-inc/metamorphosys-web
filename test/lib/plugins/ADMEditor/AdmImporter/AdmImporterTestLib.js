/* global define,require */
define(['mocks/NodeMock', 'mocks/LoggerMock', 'plugin/AdmImporter/AdmImporter/AdmImporter', 'plugin/AdmExporter/AdmExporter/AdmExporter'],
    function(NodeMock, LoggerMock, AdmImporter, AdmExporter) {
        'use strict';
        function runAdmExporter(core, META, design, root, expect, callback) {
            var exporter = new AdmExporter();
            exporter.initialize(new LoggerMock(), null);
            exporter.configure({
                'core': core,
                'project': null, //project,
                'projectName': 'testcore',
                'branchName': 'master',
                'branchHash': null,
                'commitHash': 'commitHash',
                'currentHash': 'currentHash',
                'rootNode': root,
                'activeNode': design,
                'activeSelection': [],
                'META': META
            });
            exporter.meta = META;
            exporter.exploreDesign(design, false, function (err) {
                if (err) {
                    return callback(err);
                }
                callback(err, exporter.admData);
            });
        }

        function runAdmImporter(Templates, admFilename, expect, core, root, admFolder, META, callback) {
            var adm = Templates[admFilename];
            expect(adm).to.not.equal(undefined, admFilename + " not found among Templates. (Did you run combine_templates.js?)");
            var importer = new AdmImporter();
            importer.initialize(new LoggerMock(), null);
            importer.configure({
                'core': core,
                'project': null, //project,
                'projectName': 'testcore',
                'branchName': 'master',
                'branchHash': null,
                'commitHash': 'commitHash',
                'currentHash': 'currentHash',
                'rootNode': root,
                'activeNode': admFolder,
                'activeSelection': [],
                'META': META
            });
            var callback_ = function (err) {
                Object.keys(core._nodes).forEach(function (path) {
                    core._nodes[path].guid = core._nodes[path].path;
                });
                var old_callback = callback;
                callback = function () { throw new Error("Callback called twice"); };
                old_callback(err, importer.container);
            };
            importer.innerMain(adm, callback_, callback_);
        }

        function runAdmImporterRegression(model, admFolder, Templates, admFilename, expect, callback) {
            var core = model.core;
            var root = core._rootNode;
            var META = model.META;
            runAdmImporter(Templates, admFilename, expect, core, root, admFolder, META, function (err, container) {
                var nodes = {};
                for (var key in core._nodes) {
                    if (core._nodes.hasOwnProperty(key) && key.indexOf(container.path) === 0) {
                        nodes[key] = core._nodes[key];
                    }
                }
                function writeRegressionJson() {
                    var fs = require("fs");
                    fs.writeFileSync(admFilename + ".json", JSON.stringify(nodes, null, 4));
                }

                // writeRegressionJson();
                var nodesWithoutUndefined = JSON.parse(JSON.stringify(nodes)); // FIXME: do this more efficiently
                var expected = Templates[admFilename + ".json"];
                expect(expected).to.not.equal(undefined, admFilename + ".json not found among Templates. To add it, uncomment writeRegressionJson, add to templates folder, and run combine_templates.js");
                expect(nodesWithoutUndefined).to.deep.equal(JSON.parse(expected));

                callback(err, container);
            });
        }

        return {runAdmImporterRegression: runAdmImporterRegression,
            runAdmImporter: runAdmImporter,
            runAdmExporter: runAdmExporter};
    });
/* global define,require */
define(['mocks/NodeMock', 'mocks/LoggerMock', 'plugin/AcmImporter/AcmImporter/AcmImporter'],
function(NodeMock, LoggerMock, AcmImporter) {
    'use strict';
    function runAcmImporter(Templates, acmFilename, expect, core, root, activeNode, META) {
        var acm = Templates[acmFilename];
        expect(acm).to.not.equal(undefined, acmFilename + " not found among Templates. (Did you run combine_templates.js?)");
        var importer = new AcmImporter();
        var acmJson = importer.convertXmlString2Json(acm);
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
            'activeNode': activeNode,
            'activeSelection': [],
            'META': META
        });
        var newComponent = importer.createNewAcm(activeNode, 'hash', acmJson);
    }

    function runAcmImporterRegression(model, Templates, acmFilename, expect) {
        NodeMock._nodes = [];
        var model_ = model();
        var core = model_.core;
        var root = core._rootNode;
        var META = model_.META;
        var origCorePaths = Object.keys(core._nodes);
        runAcmImporter(Templates, acmFilename, expect, core, root, root, META);
        origCorePaths.forEach(function (path) {
            delete core._nodes[path];
        });
        Object.keys(core._nodes).forEach(function (path) {
            delete core._nodes[path].guid;
        });
        function writeRegressionJson() {
            var fs = require("fs");
            fs.writeFileSync(acmFilename + ".json", JSON.stringify(core._nodes, null, 4));
        }
        // writeRegressionJson();

        var nodesWithoutUndefined = JSON.parse(JSON.stringify(core._nodes)); // FIXME: do this more efficiently
        var expected = Templates[acmFilename + ".json"];
        expect(expected).to.not.equal(undefined, acmFilename + ".json not found among Templates. To add it, uncomment writeRegressionJson, add to templates folder, and run combine_templates.js");
        expect(nodesWithoutUndefined).to.deep.equal(JSON.parse(expected));
    }

    return {runAcmImporterRegression: runAcmImporterRegression,
        runAcmImporter: runAcmImporter };
});

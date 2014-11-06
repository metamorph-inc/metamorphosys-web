/* global define,require */
define(['mocks/NodeMock', 'mocks/LoggerMock', 'plugin/AcmImporter/AcmImporter/AcmImporter'],
function(NodeMock, LoggerMock, AcmImporter) {
    'use strict';
    function runAcmImporterRegression(model, Templates, acmFilename, expect) {
        NodeMock._nodes = [];
        var model_ = model();
        var core = model_.core;
        var root = core._rootNode;
        var META = model_.META;


        var acm = Templates[acmFilename];
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
            'activeNode': root,
            'activeSelection': [],
            'META': META
        });
        var origCorePaths = Object.keys(core._nodes);
        var newComponent = importer.createNewAcm(root, 'hash', acmJson);
        origCorePaths.forEach(function (path) {
            delete core._nodes[path];
        });
        Object.keys(core._nodes).forEach(function (path) {
            delete core._nodes[path].guid;
        });
        //var fs = require("fs");
        //fs.writeFileSync(acmFilename + ".json", JSON.stringify(core._nodes, null, 4));

        var nodesWithoutUndefined = JSON.parse(JSON.stringify(core._nodes)); // FIXME: do this more efficiently
        expect(nodesWithoutUndefined).to.deep.equal(JSON.parse(Templates[acmFilename + ".json"]));
    }

    return {runAcmImporterRegression: runAcmImporterRegression};
});
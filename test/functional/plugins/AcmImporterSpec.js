/* global it,describe,before */
/*jshint multistr: true*/
/**
 * Regression test for AcmImporter
 */

'use strict';
if (typeof window === 'undefined') {

    // server-side setup
    var requirejs = require("requirejs");
    require("../../../test-conf.js");
    var define = requirejs.define;


    var chai = require('chai'),
        should = chai.should(),
        assert = chai.assert,
        expect = chai.expect;
}

describe('AcmImporterSpec', function (done) {
    var AcmImporter,
        Logger,
        Templates,
        NodeMock,
        model;

    before(function (done) {
        requirejs(
            ['mocks/NodeMock', 'mocks/LoggerMock', 'plugin/AcmImporter/AcmImporter/AcmImporter', 'test/examplemodel', 'test/acm/Templates'],
            function (NodeMock_, Logger_, AcmImporter_, model_, Templates_) {
                NodeMock = NodeMock_;
                Logger = Logger_;
                AcmImporter = AcmImporter_;
                model = model_;
                Templates = Templates_;

                done();
            });
    });

    // Object.keys(Templates).forEach(function (acmFilename) {
    ["CADMetric_InputModel.acm",
        "CADProperty_InputModel.component.acm",
        "ImportTest_InputModel.component.acm",
        "ImportWithResource_InputModel.component.acm",
        // "HierarchicalPropertyFlatten_InputModel.component.acm", CompoundProperty is not supported
        // "ProjectManifestPopulation_InputModel.component.acm", CompoundProperty is not supported
        "PropertiesWithinConnectors_InputModel.component.acm",
        "Unit_Component.acm"].forEach(function(acmFilename) {
            it('regressions on ' + acmFilename, function () {
                NodeMock._nodes = [];
                var model_ = model();
                var core = model_.core;
                var root = core._rootNode;
                var META = model_.META;


                var acm = Templates[acmFilename];
                var importer = new AcmImporter();
                var acmJson = importer.convertXmlString2Json(acm);
                importer.initialize(new Logger(), null);
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
            });
        });
});

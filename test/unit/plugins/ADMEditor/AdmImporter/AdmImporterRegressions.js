/* global it,describe,before */
/**
 * Regression test for AcmImporter
 */

'use strict';
if (typeof window === 'undefined') {

    // server-side setup
    var requirejs = require("requirejs");
    require("../../../../../test-conf.js");
    var define = requirejs.define;


    var chai = require('chai'),
        should = chai.should(),
        assert = chai.assert,
        expect = chai.expect;
}

describe('AdmImporterRegressions', function () {
    var AdmImporterTestLib,
        AdmTemplates,
        model,
        admFolder;

    before(function (done) {
        requirejs(
            ['mocks/NodeMock', 'mocks/LoggerMock', 'test/lib/plugins/ADMEditor/AcmImporter/AcmImporterTestLib', 'test/models/AcmImporter/examplemodel', 'test/models/acm/unit/Templates',
                'test/lib/plugins/ADMEditor/AdmImporter/AdmImporterTestLib', 'test/models/adm/unit/Templates'],
            function (NodeMock_, Logger_, AcmImporterTestLib_, model_, AcmTemplates_, AdmImporterTestLib_, AdmTemplates_) {
                AdmImporterTestLib = AdmImporterTestLib_;
                AdmTemplates = AdmTemplates_;
                NodeMock_._nodes = [];
                model = model_();

                var workSpace = model.core.createNode({
                    attr: { name: 'AdmEditorWorkspace' },
                    base: model.META['WorkSpace'],
                    parent: model.core._rootNode
                });
                var acmFolder = model.core.createNode({
                    attr: { name: 'ACMFolder' },
                    base: model.META['ACMFolder'],
                    parent: workSpace
                });
                admFolder = model.core.createNode({
                    attr: { name: 'ADMFolder' },
                    base: model.META['ADMFolder'],
                    parent: workSpace
                });

                // import dependent acms once instead of with each test for perf reasons
                // Object.keys(Templates).forEach(function (acmFilename) {
                ["CADMetric_InputModel.acm",
                    "CADProperty_InputModel.component.acm",
                    "ImportTest_InputModel.component.acm",
                    "ImportWithResource_InputModel.component.acm",
                    // "HierarchicalPropertyFlatten_InputModel.component.acm", CompoundProperty is not supported
                    // "ProjectManifestPopulation_InputModel.component.acm", CompoundProperty is not supported
                    "PropertiesWithinConnectors_InputModel.component.acm",
                    "Unit_Component.acm",
                    "Formulas.acm",
                    "Modelica.acm"].forEach(function(acmFilename) {
                        var core = model.core;
                        var root = core._rootNode;
                        var META = model.META;
                        return AcmImporterTestLib_.runAcmImporter(AcmTemplates_, acmFilename, expect, core, root, acmFolder, META);
                    });

                done();
            });
    });

    // Object.keys(Templates).forEach(function (acmFilename) {
    ["ValueFlow.adm",
    ].forEach(function(admFilename) {
            it('regressions on ' + admFilename, function(done) {
                    AdmImporterTestLib.runAdmImporterRegression(model, admFolder, AdmTemplates, admFilename, expect, function (err, container) {
                        done(err);
                    });
                }
            );
        });
});

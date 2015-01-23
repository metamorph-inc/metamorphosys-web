/* global it,describe,before */
/**
 * Regression test for AcmImporter
 */

'use strict';
if (typeof window === 'undefined') {

    // server-side setup
    var requirejs = require("../../../../../test-conf.js").requirejs;

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

    function regression(admFilename, callback) {
        it('regressions on ' + admFilename, function (done) {
                AdmImporterTestLib.runAdmImporterRegression(model, admFolder, AdmTemplates, admFilename, expect, function (err, container) {
                    AdmImporterTestLib.runAdmExporter(model.core, model.META, container, model.core._rootNode, expect, function (err, design) {
                        if (err) {
                            return done(err);
                        }
                        // require('fs').writeFileSync(admFilename + 'debug.json', JSON.stringify(design, null, 4), {encoding: 'utf-8'});
                        callback(design, done);
                    });
                });
            }
        );
    }

    function match(obj, selector) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (selector(obj[key], key, obj)) {
                    return obj[key];
                }
            }
        }
        return null;
    }

    regression("ValueFlow.adm", function (design, done) {
        var RootContainer = design.RootContainer;
        expect(RootContainer.Container.length).to.equal(1);
        expect(RootContainer.ComponentInstance.length).to.equal(1);
        expect(RootContainer.Container[0].ComponentInstance.length).to.equal(1);
        expect(RootContainer.Container[0].ComponentInstance[0].PrimitivePropertyInstance
            .filter(function (o) {
                return o['@IDinComponentModel'] === 'id-fc8ea8fa-fe8a-4e0d-9d47-14f17d41d571';
            })[0]
            .Value.ValueExpression['@ValueSource']).to
            .equal(RootContainer.Container[0].Property.filter(function (p) {
                return p['@Name'] === 'OutP2';
            })[0].Value['@ID']);

        done();
    });

    regression("ConnectorSelfConn.adm", function (design, done) {
        var RootContainer = design.RootContainer;
        expect(RootContainer.Connector.length).to.equal(1);
        expect(RootContainer.Connector[0].Role[0]['@PortMap']).to.equal(RootContainer.Connector[0].Role[1]['@ID']);

        done();
    });

});

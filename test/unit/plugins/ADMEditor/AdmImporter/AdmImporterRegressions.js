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

    regression("PCBConstraints.adm", function (design, done) {
        var RootContainer = design.RootContainer;
        var componentInstances = {};
        RootContainer.ComponentInstance.forEach(function (comp) {
            componentInstances[comp['@ID']] = comp;
        });
        var constrained = {};
        RootContainer.ContainerFeature.forEach(function (constraint) {
            constrained[componentInstances[constraint['@ConstraintTarget']]['@Name']] = constraint;
        });
        expect(constrained.C1a['@Rotation']).to.equal('r0');
        expect(constrained.C1a['@X']).to.equal('1.1');
        // expect(constrained.C2a['@LayerRange']).to.equal('Either'); is empty ok?
        expect(constrained.C2b['@LayerRange']).to.equal('Top');
        expect(constrained.C2b['@Type']).to.equal('Inclusion');
        expect(constrained.C2c['@LayerRange']).to.equal('Bottom');
        expect(constrained.C2c['@Type']).to.equal('Exclusion');
        expect(constrained.C1c['@Rotation']).to.equal('r180');
        expect(constrained.C2a['@XRangeMin']).to.equal('1.1');
        expect(constrained.C2a['@XRangeMax']).to.equal('5.5');
        expect(constrained.C2b['@XRangeMax']).to.equal('5.5');
        expect(constrained.C3a1['@XOffset']).to.equal('5.1');
        expect(constrained.C3a1['@RelativeLayer']).to.equal('Opposite');
        expect(constrained.C3a2['@XOffset']).to.equal('-5.1');
        expect(constrained.C3a2['@RelativeLayer']).to.be.undefined;
        expect(constrained.C3b1['@RelativeLayer']).to.equal('Same');
        expect(componentInstances[constrained.C3a1['@Origin']]['@Name']).to.equal('C3a2');
        expect(componentInstances[constrained.C3b1['@Origin']]['@Name']).to.equal('C3b2');

        // Global Layout Constarint Exceptions
        expect(constrained.Global1['@Constraint']).to.equal('InterChipSpacing');
        expect(constrained.Global2['@Constraint']).to.equal('BoardEdgeSpacing');

        // Check Notes export
        expect(constrained.C1b['@Notes']).to.be.equal('TestNotes');
        expect(constrained.C1d['@Notes']).to.be.equal('TestNotes');
        expect(constrained.C2b['@Notes']).to.be.equal('TestNotes');
        expect(constrained.C2c['@Notes']).to.be.equal('TestNotes');
        expect(constrained.C3a1['@Notes']).to.be.equal('TestNotes');
        expect(constrained.C3b1['@Notes']).to.be.equal('TestNotes');

        // Check that nodes without Notes don't have notes
        expect(constrained.C1a['@Notes']).to.be.empty;
        expect(constrained.C1c['@Notes']).to.be.empty;
        expect(constrained.C2a['@Notes']).to.be.empty;
        expect(constrained.C3a2['@Notes']).to.be.empty;

        done();
    });

    regression("RelativeRangeConstraint.adm", function (design, done) {
        var RootContainer = design.RootContainer;
        var componentInstances = {};
        RootContainer.ComponentInstance.forEach(function (comp) {
            componentInstances[comp['@ID']] = comp;
        });
        var constrained = {};
        RootContainer.ContainerFeature.forEach(function (constraint) {
            constrained[componentInstances[constraint['@ConstraintTarget']]['@Name']] = constraint;
        });
        expect(componentInstances[constrained.Comp1['@ConstraintTarget']]['@Name']).to.equal('Comp1');
        expect(componentInstances[constrained.Comp_5_5_offset['@ConstraintTarget']]['@Name']).to.equal('Comp_5_5_offset');
        expect(componentInstances[constrained.Comp_minus_5_5_offset['@ConstraintTarget']]['@Name']).to.equal('Comp_minus_5_5_offset');
        expect(componentInstances[constrained.Comp_nonconstrained['@ConstraintTarget']]['@Name']).to.equal('Comp_nonconstrained');
        expect(componentInstances[constrained.Comp_5_5_offset['@Origin']]['@Name']).to.equal('Comp1');
        expect(componentInstances[constrained.Comp_minus_5_5_offset['@Origin']]['@Name']).to.equal('Comp1');
        expect(componentInstances[constrained.Comp_nonconstrained['@Origin']]['@Name']).to.equal('Comp1');
        expect(constrained.Comp_5_5_offset['@XRelativeRangeMin']).to.equal('5');
        expect(constrained.Comp_5_5_offset['@XRelativeRangeMax']).to.equal('5');
        expect(constrained.Comp_5_5_offset['@YRelativeRangeMin']).to.equal('5');
        expect(constrained.Comp_5_5_offset['@YRelativeRangeMax']).to.equal('5');
        expect(constrained.Comp_5_5_offset['@RelativeLayer']).to.equal('Same');
        expect(constrained.Comp_minus_5_5_offset['@XRelativeRangeMin']).to.equal('-5');
        expect(constrained.Comp_minus_5_5_offset['@XRelativeRangeMax']).to.equal('-5');
        expect(constrained.Comp_minus_5_5_offset['@YRelativeRangeMin']).to.equal('-5');
        expect(constrained.Comp_minus_5_5_offset['@YRelativeRangeMax']).to.equal('-5');
        expect(constrained.Comp_minus_5_5_offset['@RelativeLayer']).to.equal('Opposite');
        expect(constrained.Comp_nonconstrained['@XRelativeRangeMin']).to.equal(undefined);
        expect(constrained.Comp_nonconstrained['@XRelativeRangeMax']).to.equal(undefined);
        expect(constrained.Comp_nonconstrained['@YRelativeRangeMin']).to.equal(undefined);
        expect(constrained.Comp_nonconstrained['@YRelativeRangeMax']).to.equal(undefined);
        expect(constrained.Comp_nonconstrained['@RelativeLayer']).to.equal(undefined);

        done();
    });

});

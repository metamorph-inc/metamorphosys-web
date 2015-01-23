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

describe('AcmImporterSpec', function () {
    var AcmImporterTestLib,
        Templates,
        model;

    before(function (done) {
        requirejs(
            ['mocks/NodeMock', 'mocks/LoggerMock', 'test/lib/plugins/ADMEditor/AcmImporter/AcmImporterTestLib', 'test/models/AcmImporter/examplemodel', 'test/models/acm/unit/Templates'],
            function (NodeMock_, Logger_, AcmImporterTestLib_, model_, Templates_) {
                AcmImporterTestLib = AcmImporterTestLib_;
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
        "Unit_Component.acm",
        "Formulas.acm",
        "Modelica.acm"].forEach(function(acmFilename) {
            it('regressions on ' + acmFilename, function() {
                    return AcmImporterTestLib.runAcmImporterRegression(model, Templates, acmFilename, expect);
                }
            );
        });
});

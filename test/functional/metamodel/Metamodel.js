/**
 * Created by adam on 11/12/2014.
 */

'use strict';

if (typeof window === 'undefined') {
    var chai = require('chai');
}

describe('Metamodel', function () {
    'use strict';

    var verifyTonkaPorts = function(json) {
        var nodes = json.nodes;
        var nodeDomainPort;

        var checkNode = function(node) {
            if (node.attributes.name == 'DomainPort') {
                nodeDomainPort = node;
            }
        };

        for (var key in nodes) {
            checkNode(nodes[key]);
        }
        chai.expect(nodeDomainPort).to.not.equal(null);

        var found = nodeDomainPort.meta.attributes.Type.enum;
        var expected = [
            "ModelicaConnector",
            "CadPoint",
            "CadAxis",
            "CadPlane",
            "CadCoordinateSystem",
            "RFPort",
            "SchematicPin",
            "SystemCPort"
        ];

        chai.expect(found).to.eql(expected);
    };

    var verifyTonkaDomainModels = function(json) {
        var nodes = json.nodes;
        var nodeDomainModels;

        var checkNode = function(node) {
            if (node.attributes.name == 'DomainModel') {
                nodeDomainModels = node;
            }
        };

        for (var key in nodes) {
            checkNode(nodes[key]);
        }
        chai.expect(nodeDomainModels).to.not.equal(null);

        var found = nodeDomainModels.meta.attributes.Type.enum;
        var expected = [
            "Modelica",
            "CAD",
            "Cyber",
            "Manufacturing",
            "RF",
            "EDA",
            "SystemC",
            "SPICE"
        ];

        chai.expect(found).to.eql(expected);
    };

    it('ADMEditor_metaLib should have tonka concepts', function(done) {
        var admeditor_metalib = require('../../../meta/ADMEditor_metaLib.json');
        verifyTonkaPorts(admeditor_metalib);
        verifyTonkaDomainModels(admeditor_metalib);

        done();
    });

    it('ADMEditor_metaOnly should have tonka concepts', function(done) {
        var admeditor_metalib = require('../../../meta/ADMEditor_metaOnly.json');
        verifyTonkaPorts(admeditor_metalib);
        verifyTonkaDomainModels(admeditor_metalib);

        done();
    });
});
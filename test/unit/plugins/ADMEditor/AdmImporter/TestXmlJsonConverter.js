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

describe('xmljsonconverter', function () {
    var xmljsonconverter;

    before(function (done) {
        requirejs(
            ['xmljsonconverter'],
            function (xmljsonconverter_) {
                xmljsonconverter = xmljsonconverter_;
                done();
            });
    });

    it('should escape special characters', function (done) {
        var jsonToXml = new xmljsonconverter.Json2xml(),
            input = {
                Design: {
                    '@Description': 'the suspect was > or < 5\'12"',
                    '#text': 'the suspect was > or < 5\'12"'
                }
            };

        var str = jsonToXml.convertToString(input);

        expect(-1).to.not.equal(str.indexOf('Description="the suspect was > or &lt; 5\'12&quot;'));

        var xmlToJson = new xmljsonconverter.Xml2json(),
            output = xmlToJson.convertFromString(str);

        expect(input).to.deep.equal(output);
        done();
    });
});


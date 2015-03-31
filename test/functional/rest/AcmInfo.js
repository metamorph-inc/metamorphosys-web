/*globals window, require, describe, it,before */

if (typeof window === 'undefined') {

    // server-side setup
    var webgme = require('webgme');
    var requirejs = require('../../../test-conf.js').requirejs;
    var config = require('../../../test-conf.js').config;

    var chai = require('chai'),
        expect = chai.expect;
}

describe('AcmInfo', function () {
    'use strict';

    var superagent;
    before(function (done) {
        requirejs(['superagent'], function (superagent_) {
            superagent = superagent_;
            done();
        });
    });

    it('should get 3_Axis_Accelerometer data', function (done) {
        superagent.get('http://localhost:' + config.server.port + '/rest/external/acminfo/c3abb612d483c98552a36d91ac94a2cad67d3cb2')
            .end(function (err, res) {
                if (err || res.status > 399) {
                    done(err || res.status);
                } else {
                    var info = JSON.parse(res.text);
                    var startOfIconUrl = 'data:image/png;base64,' + 'iVBORw0KGgoAAAANSUhEUgA';
                    expect(info.icon.substr(0, startOfIconUrl.length)).to.equal(startOfIconUrl);
                    delete info.icon;
                    // console.log(JSON.stringify(info, null, 4));
                    expect(info).to.deep.equal({
                        "properties": {
                            "octopart_mpn": {
                                "value": "ADXL345BCCZ"
                            }
                        },
                        "name": "3_Axis_Accelerometer",
                        "classification": "sensors"
                    });

                    done();
                }
            });
    });

});

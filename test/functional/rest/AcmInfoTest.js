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

    var q = require('q');

    var superagent;
    before(function (done) {
        requirejs(['superagent'], function (superagent_) {
            superagent = superagent_;
            done();
        });
    });

    function getAcmInfo(hash) {
        var deferred = q.defer();
        superagent.get('http://localhost:' + config.server.port + '/rest/external/acminfo/' + hash)
            .end(function (err, res) {
                if (err || res.status > 399) {
                    return deferred.reject(err || res.status);
                } else {
                    var info = JSON.parse(res.text);
                    deferred.resolve(info);
                }
            });
        return deferred.promise;
    }

    it('should get 3_Axis_Accelerometer data', function (done) {
        getAcmInfo('c3abb612d483c98552a36d91ac94a2cad67d3cb2')
            .then(function (info) {
                var startOfIconUrl = 'data:image/png;base64,' + 'iVBORw0KGgoAAAANSUhEUgA';
                expect(info.icon.substr(0, startOfIconUrl.length)).to.equal(startOfIconUrl);
                delete info.icon;
                // console.log(JSON.stringify(info, null, 4));
                expect(info).to.deep.equal({
                    'properties': {
                        'octopart_mpn': {
                            'value': 'ADXL345BCCZ'
                        }
                    },
                    'name': '3_Axis_Accelerometer',
                    'classification': 'sensors'
                });
            })
            .nodeify(done);
    });

    it('should get USBSerial_FTDI_232R data w/datasheet', function (done) {
        getAcmInfo('9127635cc180eefbb253279e2953dca07d14953a')
            .then(function (info) {
                // console.log(JSON.stringify(info, null, 4));
                expect(info).to.deep.equal({
                    'properties': {
                        'octopart_mpn': {
                            'value': 'FT232RL'
                        }
                    },
                    'datasheet': '/rest/blob/download/9127635cc180eefbb253279e2953dca07d14953a/doc%2FDS_FT232R.pdf',
                    'name': 'USBSerial_FTDI_232R',
                    'classification': 'active.interface-chips'
                });
            })
            .nodeify(done);
    });


    it('should get Resistor_R0603 data w/ R', function (done) {
        getAcmInfo('129bed216d1e60f9ad18cdeb6441089638dacd7d')
            .then(function (info) {
                var startOfIconUrl = 'data:image/png;base64,' + 'iVBORw0KGgoAAAANSUhEUgA';
                expect(info.icon.substr(0, startOfIconUrl.length)).to.equal(startOfIconUrl);
                delete info.icon;
                // console.log(JSON.stringify(info, null, 4));
                expect(info).to.deep.equal({
                    'properties': {
                        'octopart_mpn': {
                            'value': 'RC0603JR-0710KL'
                        },
                        'R': {
                            'value': '10000'
                        }
                    },
                    'name': 'Resistor_R0603',
                    'classification': 'passive.resistors'
                });
            })
            .nodeify(done);
    });

    it('should have markdown', function (done) {
        getAcmInfo('3332d44782501b6d3d6248f073340f76170d0ee7')
            .then(function (info) {
                delete info.icon;
                var startOfDocumentation = '<h1>PART NAME</h1>\n<h2>BP103-3/4</h2>';
                expect(info.documentation.substr(0, startOfDocumentation.length)).to.equal(startOfDocumentation);
                delete info.documentation;
                expect(info).to.deep.equal(
                    {
                        'classification': 'optoelectronics.detectors.single_sensor_detectors.phototransistor',
                        'datasheet': '/rest/blob/download/3332d44782501b6d3d6248f073340f76170d0ee7/doc%2FBP103_datasheet.pdf',
                        'name': 'BP103-3-4',
                        'properties': {
                            'octopart_mpn': {
                                'value': 'BP103-3/4'
                            }
                        }
                    }
                );
            })
            .nodeify(done);
    });

});

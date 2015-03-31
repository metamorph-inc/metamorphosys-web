/* global define,require,console */
/*
 http://localhost:8855/rest/external/acminfo/8cc3c61bf55695128925b21b583054cfdecaed49
 */

define(['logManager',
        'blob/BlobClient',
        'q',
        'acminfo/ParseAcm'
    ], function (logManager, BlobClient, q, ParseAcm) {
        'use strict';

        var logger = logManager.create('server.rest.acminfo'),
            blobClient;

        var newParseAcm = function (id) {
            var parse = new ParseAcm(id);
            parse.getAcmZip = function getAcmZip() {
                return q.ninvoke(blobClient, 'getObject', id);
            };
            return parse;
        };

        var acmInfo = function (req, res/*, next*/) {
            var url = req.url.split('/');

            if (url.length === 2) {
                var id = url[1];

                newParseAcm(id).parse().then(function (json) {
                    res.send(json);
                }).catch(function (err) {
                    logger.warning(err + ' ' + err.stack);
                    res.send(500);
                });
            } else {
                res.send(404);
            }
        };

        return function (gmeConfig) {
            //ParseAcm = require.nodeRequire('../../' + gmeConfig.rest.components.acminfo + '/../ParseAcm')
            blobClient = new BlobClient({
                serverPort: gmeConfig.server.port,
                httpsecure: gmeConfig.server.https.enable,
                server: '127.0.0.1'
                // webgmeclientsession: webGMESessionId
            });
            return acmInfo;
        };
    }
);

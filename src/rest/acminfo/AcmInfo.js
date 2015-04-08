/* global define,require,console */
/*
 http://localhost:8855/rest/external/acminfo/8cc3c61bf55695128925b21b583054cfdecaed49
 */

define(['common/LogManager',
        'blob/BlobClient',
        'q',
        'acminfo/ParseAcm'
    ], function (logManager, BlobClient, q, ParseAcm) {
        'use strict';

        var contentDisposition = require('content-disposition'),
            logger = logManager.create('server.rest.acminfo'),
            blobClient,
            url = require('url');

        var newParseAcm = function (id) {
            var parse = new ParseAcm(id);
            parse.getAcmZip = function getAcmZip() {
                return q.ninvoke(blobClient, 'getObject', id);
            };
            parse.getDatasheetUrl = function getDatasheetUrl(path) {
                return '/rest/external/acminfo/getfile/' + id + '/' + encodeURIComponent(path);
            };
            return parse;
        };

        var acmInfo = function (req, res/*, next*/) {
            var url = req.url.split('/'),
                id;

            if (url.length === 2) {
                id = url[1];

                newParseAcm(id).parse().then(function (json) {
                    res.send(json);
                }).catch(function (err) {
                    logger.warning(err + ' ' + err.stack);
                    res.sendStatus(500);
                });
            } else if (url.length === 4 && url[1] === 'getfile') {
                id = url[2];
                var path = decodeURIComponent(url[3]);
                var filename = path.substring(path.lastIndexOf('/') + 1);

                newParseAcm(id).getfile(path).then(function (buffer) {
                    res.setHeader('Content-Disposition', contentDisposition(filename, {type: 'attachment'}));
                    res.send(buffer);
                }).catch(function (err) {
                    logger.warning(err + ' ' + err.stack);
                    res.sendStatus(500);
                });
            } else {
                res.sendStatus(404);
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

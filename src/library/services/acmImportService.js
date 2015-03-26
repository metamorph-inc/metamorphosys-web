/*globals angular */

/**
 * @author ksmyth / https://github.com/ksmyth
 */

angular.module( 'cyphy.services' )
    .service( 'acmImportService', function ( $q, $log, pluginService ) {
        'use strict';

        this.importAcm = function ( context, parentId, acmUrl, position ) {
            var config = {
                activeNode: parentId,
                runOnServer: true,
                pluginConfig: {
                    AcmUrl: acmUrl,
                    DeleteExisting: true,
                    position: position
                }
            };
            //console.log(JSON.stringify(config));
            pluginService.runPlugin( context, 'AcmImporter', config )
                .then( function (result) {
                    if (result.error) {
                        return $q.reject(result.error);
                    }
                } )
                .
                catch ( function ( reason ) {
                $log( 'Something went terribly wrong, ' + reason );
            } );
        };

        this.storeDroppedAcm = function ( file ) {
            var deferred = $q.defer();

            var blobClient = new GME.classes.BlobClient(
                {
                    httpsecure: window.location.protocol === 'https:',
                    server: window.location.hostname,
                    serverPort: window.location.port
                }
            );
            blobClient.putFile(file.name, file, function (err, hash) {
                if (err) {
                    deferred.reject(err);
                }
                deferred.resolve(blobClient.getDownloadURL(hash));
            });

            return deferred.promise;
        };

    } );

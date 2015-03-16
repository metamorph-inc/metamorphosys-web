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
                .then( function ( /* result */ ) {
                } )
                .
                catch ( function ( reason ) {
                $log( 'Something went terribly wrong, ' + reason );
            } );
        };

    } );

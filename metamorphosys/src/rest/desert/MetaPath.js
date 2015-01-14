/**
 * Created by Zsolt on 6/24/2014.
 */



// list autostart programs
define( [], function () {
    'use strict';
    var Winreg = require( 'winreg' ),
        MetaPath = function () {
            this.regKey = new Winreg( {
                hive: Winreg.HKLM,
                key: '\\Software\\Wow6432Node\\META' // key containing autostart programs
            } );
        };

    MetaPath.prototype.getPath = function ( callback ) {
        this.regKey.values( function ( err, items ) {
            var len,
                item;
            if ( err ) {
                callback( err.toString() );
            }

            len = items.length;

            while ( len-- ) {
                item = items[ len ];
                if ( item.name === 'META_PATH' ) {
                    return callback( null, item.value );
                }
            }
            callback( 'ERROR: META_PATH was not found.' );
        } );
    };

    return MetaPath;
} );
/*globals define, require, process, requireJS*/
/**
 * Created by pmeijer on 8/4/2014.
 */


define( ['os',
    'child_process'
], function ( os, child_process ) {
    'use strict';

    var serverInfoRestInit,
        serverInfoRestOS,
        serverInfoRestNode,
        serverInfoRestNpm,
        serverInfoRestAll,
        Logger = require(require('path').join(requireJS.s.contexts._.config.baseUrl, 'server/logger')),
        logger,
        setup;

    serverInfoRestInit = function ( req, res, next ) {
        var url = req.url.split( '/' ),
            handlers = {
                os: serverInfoRestOS,
                node: serverInfoRestNode,
                npm: serverInfoRestNpm,
                all: serverInfoRestAll
            };

        logger.debug( 'Version info request: ', url[1] );

        if ( handlers.hasOwnProperty( url[ 1 ] ) ) {
            handlers[ url[ 1 ] ]( req, res, next );
        } else {
            res.send( 500 );
        }
    };

    serverInfoRestOS = function ( req, res, next, doReturn ) {
        var info;
        if ( req.originalMethod !== 'GET' ) {
            return res.send( 405 );
        }

        info = {
            type: os.type(),
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            release: os.release(),
            uptime: os.uptime(),
            totalmem: os.totalmem(),
            freemem: os.freemem(),
            cpus: os.cpus()
        };
        if ( doReturn ) {
            return info;
        }

        res.send( JSON.stringify( info, null, 4 ) );
    };

    serverInfoRestNode = function ( req, res, next, doReturn ) {
        var url,
            info;
        if ( req.originalMethod !== 'GET' ) {
            return res.send( 405 );
        }
        info = {
            version: process.version
        };
        if ( doReturn ) {
            return info;
        }

        res.send( JSON.stringify( info, null, 4 ) );
    };

    serverInfoRestNpm = function ( req, res, next, doReturn ) {
        var url,
            cmd = 'npm list -json -depth=0';
        if ( req.originalMethod !== 'GET' ) {
            return res.send( 405 );
        }
        child_process.exec( cmd, function ( error, stdout, stderr ) {
            logger.debug( 'stdout :' + stdout );
            if ( stderr ) {
                logger.error( 'stderr :' + stderr );
                if ( doReturn ) {
                    return doReturn( 'ERROR' );
                }
                res.send( 500 );
            }
            if ( error ) {
                logger.error( 'Npm info return with error :' + error.toString() );
                if ( doReturn ) {
                    return doReturn( 'ERROR' );
                }
                res.send( 500 );
            }
            if ( doReturn ) {
                return doReturn( JSON.parse( stdout ) );
            }
            res.send( stdout );
        } );
    };

    serverInfoRestAll = function ( req, res, next ) {
        var url,
            info,
            npmInfo;
        if ( req.originalMethod !== 'GET' ) {
            return res.send( 405 );
        }
        info = {
            os: serverInfoRestOS( req, res, next, true ),
            node: serverInfoRestNode( req, res, next, true )
        };
        serverInfoRestNpm( req, res, next, function ( npmInfo ) {
            info.npm = npmInfo;
            res.send( JSON.stringify( info, null, 4 ) );
        } );
    };

    setup = function (_gmeConfig, _ensureAuthenticated) {
        logger = Logger.create('web-cyphy:server:middleware:ExampleRestComponent', _gmeConfig.server.log);
        logger.debug('serverInfoRest setup done');
        return serverInfoRestInit;
    };

    return setup;
} );

/**
 * Created by pmeijer on 8/4/2014.
 */

/*globals define, require, window, WebGMEGlobal */
/**
 * Created by pmeijer on 6/23/2014.
 */

var isNode = ( typeof window === 'undefined' );

define( [], function () {
    'use strict';
    var ServerInfoClient = function () {
        var config;
        //console.log(isNode);

        if ( isNode ) {
            config = WebGMEGlobal.getConfig();
            this.server = '127.0.0.1';
            this.serverPort = config.port;
            this.httpsecure = config.httpsecure;

            this._clientSession = null; // parameters.sessionId;;

            this.http = this.httpsecure ? require( 'https' ) : require( 'http' ); // or https
        }

        // TODO: TOKEN???
        this.versionInfoUrl = '/rest/external/serverinfo/';
    };


    ServerInfoClient.prototype.os = function ( callback ) {
        this.sendHttpRequest( 'GET', this.versionInfoUrl + 'os', function ( err, response ) {
            if ( err ) {
                return callback( err );
            }

            callback( null, JSON.parse( response ) );
        } );
    };

    ServerInfoClient.prototype.node = function ( callback ) {
        this.sendHttpRequest( 'GET', this.versionInfoUrl + 'node', function ( err, response ) {
            if ( err ) {
                return callback( err );
            }

            callback( null, JSON.parse( response ) );
        } );
    };

    ServerInfoClient.prototype.npm = function ( callback ) {

        this.sendHttpRequest( 'GET', this.versionInfoUrl + 'npm', function ( err, response ) {
            if ( err ) {
                return callback( err );
            }

            callback( null, JSON.parse( response ) );
        } );
    };

    ServerInfoClient.prototype.sendHttpRequest = function ( method, url, callback ) {
        var options,
            oReq;
        if ( isNode ) {
            options = {
                hostname: this.server,
                port: this.serverPort,
                path: url,
                method: method
            };

            this._sendHttpRequestWithContent( options, null, callback );

        } else {
            oReq = new XMLHttpRequest();
            oReq.open( method, url, true );
            oReq.onload = function ( oEvent ) {
                // Uploaded.
                var response = oEvent.target.response;
                // TODO: handle error
                callback( null, response );
            };

            // data is a file object or blob
            oReq.send();
        }
    };

    ServerInfoClient.prototype._ensureAuthenticated = function ( options, callback ) {
        //this function enables the session of the client to be authenticated
        //TODO currently this user does not have a session, so it has to upgrade the options always!!!
        //        if (options.headers) {
        //            options.headers.webgmeclientsession = this._clientSession;
        //        } else {
        //            options.headers = {
        //                'webgmeclientsession': this._clientSession
        //            }
        //        }
        callback( null, options );
    };

    ServerInfoClient.prototype._sendHttpRequestWithContent = function ( options, data, callback ) {
        var self = this;
        self._ensureAuthenticated( options, function ( err, updatedOptions ) {
            if ( err ) {
                callback( err );
            } else {
                self.__sendHttpRequestWithContent( updatedOptions, data, callback );
            }
        } );
    };

    ServerInfoClient.prototype.__sendHttpRequestWithContent = function ( options, data, callback ) {
        // TODO: use the http or https
        var req = this.http.request( options, function ( res ) {
            //    console.log('STATUS: ' + res.statusCode);
            //    console.log('HEADERS: ' + JSON.stringify(res.headers));
            //    res.setEncoding('utf8');
            var d = '';
            res.on( 'data', function ( chunk ) {
                d += chunk;
            } );

            res.on( 'end', function () {
                if ( res.statusCode === 200 ) {
                    callback( null, d );
                } else {
                    callback( res.statusCode, d );
                }
            } );
        } );

        req.on( 'error', function ( e ) {
            callback( e );
        } );

        if ( data ) {
            // write data to request body
            req.write( data );
        }

        req.end();
    };

    return ServerInfoClient;
} );
/**
 * Created by pmeijer on 6/23/2014.
 */

var isNode = ( typeof window === 'undefined' );

define( [], function () {
    'use strict';
    var DesertClient = function () {
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
        this.executorUrl = '/rest/external/desert/';
    };

    DesertClient.prototype.getInfoURL = function ( hash ) {
        var metadataBase = this.executorUrl + 'info';
        if ( hash ) {
            return metadataBase + '/' + hash;
        } else {
            return metadataBase;
        }
    };


    DesertClient.prototype.getCreateURL = function ( hash ) {
        var metadataBase = this.executorUrl + 'create';
        if ( hash ) {
            return metadataBase + '/' + hash;
        } else {
            return metadataBase;
        }
    };

    DesertClient.prototype.createJob = function ( hash, callback ) {
        this.sendHttpRequest( 'POST', this.getCreateURL( hash ), function ( err, response ) {
            if ( err ) {
                return callback( err );
            }

            callback( null, JSON.parse( response ) );
        } );
    };


    DesertClient.prototype.getInfo = function ( hash, callback ) {

        this.sendHttpRequest( 'GET', this.getInfoURL( hash ), function ( err, response ) {
            if ( err ) {
                callback( err );
                return;
            }

            callback( null, JSON.parse( response ) );
        } );
    };

    DesertClient.prototype.getAllInfo = function ( callback ) {

        this.sendHttpRequest( 'GET', this.getInfoURL(), function ( err, response ) {
            if ( err ) {
                callback( err );
                return;
            }

            callback( null, JSON.parse( response ) );
        } );
    };

    DesertClient.prototype.sendHttpRequest = function ( method, url, callback ) {

        if ( isNode ) {
            var options = {
                hostname: this.server,
                port: this.serverPort,
                path: url,
                method: method
            };

            this._sendHttpRequestWithContent( options, null, callback );

        } else {
            var oReq = new XMLHttpRequest();
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

    DesertClient.prototype._ensureAuthenticated = function ( options, callback ) {
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

    DesertClient.prototype._sendHttpRequestWithContent = function ( options, data, callback ) {
        var self = this;
        self._ensureAuthenticated( options, function ( err, updatedOptions ) {
            if ( err ) {
                callback( err );
            } else {
                self.__sendHttpRequestWithContent( updatedOptions, data, callback );
            }
        } );
    };

    DesertClient.prototype.__sendHttpRequestWithContent = function ( options, data, callback ) {
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

    return DesertClient;
} );
/**
 * Created by pmeijer on 6/23/2014.
 */

define( [ 'logManager',
    'blob/BlobRunPluginClient',
    'blob/BlobFSBackend',
    'fs',
    'path',
    'child_process',
    'desert/MetaPath'
], function ( logManager, BlobRunPluginClient, BlobFSBackend, fs, path, child_process, MetaPath ) {
    'use strict';
    var logger = logManager.create( 'REST-DESERT' ),
        DesertBackEnd,
        dbe,
        DesertRest,
        desertRestCreate,
        desertRestInfo,
        desertRestCancel,
        running = {},
        setup;

    DesertBackEnd = function ( logger ) {
        var blobBackend = new BlobFSBackend();
        this.blobClient = new BlobRunPluginClient( blobBackend );
        this.logger = logger;
        this.workingDir = 'desert-temp';
        //TODO: Find this path appropriately
        this.desertExe = null;
        this.inputXml = 'desertConfig.xml';
        this.outputXml = 'desertConfig_configs.xml';
        if ( fs.existsSync( this.workingDir ) ) {
            this.logger.info( 'desert-temp existed.' );
        } else {
            fs.mkdirSync( this.workingDir );
            this.logger.info( 'Created directory desert-temp.' );
        }
        this.logger.info( 'DesertBackEnd instantiated.' );
    };

    DesertBackEnd.prototype.runDesert = function ( desertConfigHash, callback ) {
        var self = this;

        // TODO: run desert through the execution framework in the future.
        self.setDesertExe( function ( err ) {
            if ( err ) {
                return callback( 'Could not determine path to desert. ' + err );
            }
            self.blobClient.getMetadata( desertConfigHash, function ( err, metadata ) {
                if ( err ) {
                    self.logger.error( err );
                    return callback( 'Failed getting meta-data for desert config, err: ' + err );
                }
                self.logger.info( 'Meta data for desert config: ' + JSON.stringify( metadata, null, 2 ) );
                self.blobClient.getObject( desertConfigHash, function ( err, content ) {
                    var runDir,
                        inputXml;
                    if ( err ) {
                        self.logger.error( 'Failed obtaining desert configuration, err: ' + err.toString() );
                        return callback( 'Failed obtaining desert configuration, err: ' + err.toString() );
                    }
                    // Setup directories and file-paths.
                    runDir = path.normalize( path.join( self.workingDir, desertConfigHash ) );
                    if ( !fs.existsSync( runDir ) ) {
                        fs.mkdirSync( runDir );
                        self.logger.info( 'Created directory for desert-run "' + runDir + '".' );
                    }
                    inputXml = path.normalize( path.join( runDir, self.inputXml ) );
                    self.logger.info( 'Current input XML for desert ' + inputXml );
                    // Write out the inputXML in temporary directory.
                    fs.writeFile( inputXml, content, function ( err ) {
                        var cmd;
                        if ( err ) {
                            self.logger.error( 'Failed writing out desert input XML, err: ' + err.toString() );
                            return callback( 'Failed writing out desert input XML, err: ' + err.toString() );
                        }
                        self.logger.info( 'Created input XML at ' + inputXml );
                        cmd = self.desertExe + ' ' + self.inputXml + ' /m';
                        self.logger.info( 'Command for desert run : ' + cmd );

                        child_process.exec( cmd, {
                            cwd: runDir
                        }, function ( error, stdout, stderr ) {
                            var outputXmlPath;
                            self.logger.debug( 'stdout :' + stdout );
                            if ( stderr ) {
                                self.logger.error( 'stderr :' + stderr );
                            }
                            if ( error ) {
                                self.logger.error( 'Desert Execution return with error :' +
                                    error.toString() );
                                return callback( 'Desert cmd exec failed with error: ' + error.toString() );
                            }
                            outputXmlPath = path.normalize( path.join( runDir, self.outputXml ) );
                            self.logger.info( 'Desert output xml path: ' + outputXmlPath );
                            self.saveResultToBlob( outputXmlPath, function ( err, hash ) {
                                if ( err ) {
                                    return callback( err );
                                }
                                return callback( null, hash );
                            } );
                        } );
                    } );
                } );
            } );
        } );
    };

    DesertBackEnd.prototype.saveResultToBlob = function ( filePath, callback ) {
        var self = this,
            artifact = self.blobClient.createArtifact( 'desert-output' );
        self.logger.info( 'About to save file ' + filePath );
        artifact.addFileAsSoftLink( 'desertOutput.xml', fs.createReadStream( filePath ), function ( err, hash ) {
            if ( err ) {
                self.logger.error( 'Failed adding desertOutput.xml to artifact.' );
                return callback( 'Failed adding desertOutput.xml to artifact.' );
            }
            self.logger.debug( 'desertOutput.xml got hash ' + hash );
            artifact.save( function ( err, artieHash ) {
                if ( err ) {
                    self.logger.error( 'Failed saving desert-ouput artifact.' );
                    return callback( 'Failed saving desert-ouput artifact.' );
                }
                callback( null, hash );
            } );
        } );
    };

    DesertBackEnd.prototype.setDesertExe = function ( callback ) {
        var self = this,
            metaPathGetter;
        if ( self.desertExe ) {
            return callback( null );
        }
        metaPathGetter = new MetaPath();
        metaPathGetter.getPath( function ( err, metaPath ) {
            if ( err ) {
                self.logger.error( 'Could not get meta path from registry, err: ' + err );
                return callback( err );
            }
            self.logger.info( 'Found meta-path in registry: ' + metaPath );
            self.desertExe = path.join( metaPath, 'src', 'bin', 'DesertTool.exe' );
            if ( !fs.existsSync( self.desertExe ) ) {
                self.desertExe = path.join( metaPath, 'bin', 'DesertTool.exe' );
                if ( !fs.existsSync( self.desertExe ) ) {
                    return callback( 'Installer?' );
                }
            }
            self.desertExe = '"' + self.desertExe + '"';
            self.logger.info( 'Found Desert executable at : ' + self.desertExe );
            callback( null );
        } );
    };

    DesertRest = function ( req, res, next ) {
        var config = WebGMEGlobal.getConfig(),
            url = req.url.split( '/' ),
            handlers = {
                create: desertRestCreate,
                cancel: desertRestCancel,
                info: desertRestInfo
            };
        logger.debug( 'Desert request' );

        if ( url.length === 2 ) {
            res.send( running );
        } else if ( handlers.hasOwnProperty( url[ 1 ] ) ) {
            handlers[ url[ 1 ] ]( req, res, next );
        } else {
            res.send( 500 );
        }
    };

    desertRestCreate = function ( req, res, next ) {
        var url = req.url.split( '/' ),
            jobInfo,
            hash;

        if ( req.originalMethod !== 'POST' ) {
            return res.send( 405 );
        }

        if ( url.length < 3 || !url[ 2 ] ) {
            res.send( 500 );
        }

        hash = url[ 2 ];
        jobInfo = {
            inputHash: hash,
            status: 'Created',
            outputHash: null
        };
        running[ hash ] = jobInfo;
        if ( !dbe ) {
            dbe = new DesertBackEnd( logger );
        }
        dbe.runDesert( hash, function ( err, outputXmlHash ) {
            if ( err ) {
                jobInfo.status = 'Failed';
                res.send( 500 );
                return;
            }
            jobInfo.status = 'Finished';
            jobInfo.outputHash = outputXmlHash;
            res.status( 201 )
                .send( jobInfo );
        } );
    };

    desertRestCancel = function ( req, res, next ) {
        var url = req.url.split( '/' ),
            hash;

        if ( req.originalMethod !== 'POST' ) {
            return res.send( 405 );
        }

        if ( url.length < 3 || !url[ 2 ] ) {
            res.send( 500 );
        }

        hash = url[ 2 ];

        if ( running[ hash ] ) {
            running[ hash ].status = 'Canceled';
            res.send( 200 );
        } else {
            res.send( 500 );
        }
    };

    desertRestInfo = function ( req, res, next ) {
        var url = req.url.split( '/' ),
            hash;

        if ( req.originalMethod !== 'GET' ) {
            return res.send( 405 );
        }

        if ( url.length < 3 || !url[ 2 ] ) {
            return res.send( 500 );
        }

        hash = url[ 2 ];

        if ( hash ) {
            if ( running.hasOwnProperty( hash ) ) {
                res.send( running[ hash ] );
            } else {
                res.send( 500 );
            }
        } else {
            res.send( running );
        }
    };

    setup = function () { //it has to be done this way, but this is probably a placeholder for later option parameters...
        return DesertRest;
    };

    return setup();
} );
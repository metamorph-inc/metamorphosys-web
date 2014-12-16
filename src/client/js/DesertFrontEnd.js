/**
 * @author lattmann / https://github.com/lattmann
 * @author pmeijer / https://github.com/pmeijer
 */
/*globals define, console */

define( [ 'xmljsonconverter' ], function ( Converter ) {
    'use strict';
    var DesertFrontEnd,
        CMDSTR;

    DesertFrontEnd = function ( smartClient, options ) {
        var self = this,
            opts = options || {};
        this.smartClient = smartClient;
        this.client = smartClient.client;
        this.blobClient = smartClient.blobClient;
        this.executorClient = smartClient.executorClient;
        this.xmlToJson = new Converter.Xml2json( {
            skipWSText: true,
            arrayElements: {
                Configuration: true,
                Element: true,
                NaturalMember: true
            }
        } );
        this.jsonToXml = new Converter.Json2xml();
        this.results = {};
        this.listeners = {};
        this.patterns = {};
        if ( opts.addUI ) {
            this.territoryId = this.client.addUI( this, function ( events ) {
                self.handleUpdates( events );
            } );
        }
    };

    DesertFrontEnd.prototype.handleUpdates = function ( events ) {
        var self = this,
            event,
            doUpdateTerritory = false,
            i;
        for ( i = 0; i < events.length; i += 1 ) {
            event = events[ i ];
            if ( self.results.hasOwnProperty( event.eid ) ) {
                if ( event.etype === 'unload' ) {
                    delete self.results[ event ];
                    delete self.listeners[ event ];
                    delete self.patterns[ event ];
                    doUpdateTerritory = true;
                } else if ( event.etype === 'load' || event.etype === 'update' ) {
                    console.log( 'Updating results for ' + self.client.getNode( event.eid )
                        .getAttribute( 'name' ) );
                    self.calculateNbrOfCfgs( event.eid );
                } else {
                    console.error( 'Unknown event: ' + event.etype + ', objId: ' + event.eid );
                }
            }
        }
        if ( doUpdateTerritory ) {
            self.client.updateTerritory( self.territoryId, self.patterns );
        }
        //console.log(events);
    };

    DesertFrontEnd.prototype.addListener = function ( containerId, callback ) {
        var self = this;
        if ( self.listeners.hasOwnProperty( containerId ) ) {
            console.warn( 'DesertFrontEnd Listener already added for container with id ' + containerId );
        } else {
            self.listeners[ containerId ] = [];
            self.results[ containerId ] = {
                status: 'LISTENING'
            };
            self.patterns[ containerId ] = {
                children: 999
            };
            self.client.updateTerritory( self.territoryId, self.patterns );
        }
        self.listeners[ containerId ].push( callback );
        callback( self.results[ containerId ] );
    };

    DesertFrontEnd.prototype.addSimpleListener = function ( containerId, callback ) {
        var self = this;
        if ( self.listeners.hasOwnProperty( containerId ) ) {
            console.warn( 'DesertFrontEnd Listener already added for container with id ' + containerId );
        } else {
            self.listeners[ containerId ] = [];
            self.results[ containerId ] = {
                status: 'LISTENING'
            };
        }
        self.listeners[ containerId ].push( callback );
        callback( self.results[ containerId ] );
    };

    DesertFrontEnd.prototype.callListeners = function ( id, newStatus ) {
        var self = this,
            i;
        self.results[ id ].status = newStatus;
        for ( i = 0; i < self.listeners[ id ].length; i += 1 ) {
            self.listeners[ id ][ i ]( self.results[ id ] );
        }
    };

    DesertFrontEnd.prototype.calculateNbrOfCfgs = function ( containerId ) {
        var self = this;
        self.callListeners( containerId, 'CALCULATING' );
        self.getInputXmlHash( containerId, function ( err, artifact, idMap ) {
            var filesToAdd = {};
            if ( err ) {
                console.error( 'Failed to create desertInput.xml: ' + err );
                self.callListeners( containerId, 'ERROR' );
                return;
            }
            filesToAdd[ 'executor_config.json' ] = JSON.stringify( {
                cmd: 'run_desert.cmd',
                resultArtifacts: [ {
                    name: 'all',
                    resultPatterns: []
                } ]
            }, null, 4 );
            filesToAdd[ 'run_desert.cmd' ] = CMDSTR;
            artifact.addFiles( filesToAdd, function ( err, hashes ) {
                if ( err ) {
                    console.error( 'Failed to add execution files to desert-input, err: ' + err );
                    self.callListeners( containerId, 'ERROR' );
                    return;
                }
                artifact.save( function ( err, artieHash ) {
                    if ( err ) {
                        console.error( 'Failed to save desert-input, err: ' + err );
                        self.callListeners( containerId, 'ERROR' );
                        return;
                    }
                    self.executorClient.createJob( {
                        hash: artieHash,
                        labels: []
                    }, function ( err, jobInfo ) {
                        var intervalID,
                            atSucceedJob;
                        if ( err ) {
                            console.error( 'Creating desert-job failed: ' + err );
                            self.callListeners( containerId, 'ERROR' );
                            return;
                        }
                        console.info( 'Initial job-info:' + JSON.stringify( jobInfo, null, 4 ) );
                        atSucceedJob = function ( jInfo ) {
                            console.info( 'SUCCESS! Its final JobInfo looks like : ' + JSON.stringify(
                                jInfo, null, 4 ) );
                            self.blobClient.getMetadata( jInfo.resultHashes.all, function ( err,
                                metadata ) {
                                var desertInfo = {
                                    status: 'READY',
                                    constraints: {},
                                    backFile: null
                                },
                                    keys,
                                    i;
                                if ( err ) {
                                    console.error( 'Getting meta-data for result failed, err: ' +
                                        err );
                                    self.callListeners( containerId, 'ERROR' );
                                    return;
                                }
                                if ( !metadata.content.hasOwnProperty(
                                    'desertInput_configs.xml' ) ) {
                                    console.error(
                                        'Desert did not generate a "desertInput_configs.xml".' );
                                    self.callListeners( containerId, 'ERROR' );
                                    return;
                                }
                                if ( metadata.content.hasOwnProperty( 'desertInput_back.xml' ) ) {
                                    desertInfo.backFile = metadata.content[
                                        'desertInput_back.xml' ];
                                    desertInfo.idMap = idMap;
                                } else {
                                    console.warn(
                                        'Desert did not generate a "desertInput_back.xml".' );
                                }
                                self.dealWithDesertOutput( metadata.content[
                                    'desertInput_configs.xml' ].content, function ( err,
                                    cfgsInfo ) {
                                    if ( err ) {
                                        console.error(
                                            'Errors interpreting desert output, err: ' +
                                            err );
                                        self.callListeners( containerId, 'ERROR' );
                                        return;
                                    }
                                    //console.log('Got cfgs : ' + JSON.stringify(cfgsInfo, null, 2));
                                    keys = Object.keys( cfgsInfo );
                                    for ( i = 0; i < keys.length; i += 1 ) {
                                        desertInfo.constraints[ keys[ i ] ] = cfgsInfo[
                                            keys[ i ] ][ '@NumConfigs' ];
                                    }
                                    self.results[ containerId ] = desertInfo;
                                    self.callListeners( containerId, 'READY' );
                                } );
                            } );
                        };

                        //noinspection JSLint
                        intervalID = setInterval( function () {
                            // Get the job-info at intervals and check for a non-CREATED status.
                            self.executorClient.getInfo( artieHash, function ( err, jInfo ) {
                                console.info( JSON.stringify( jInfo, null, 4 ) );
                                if ( jInfo.status === 'CREATED' || jInfo.status ===
                                    'RUNNING' ) {
                                    // The job is still running..
                                    return;
                                }
                                //noinspection JSLint
                                clearInterval( intervalID );
                                if ( jInfo.status === 'SUCCESS' ) {
                                    atSucceedJob( jInfo );
                                } else {
                                    console.error( 'Execution failed: ' + err );
                                    self.callListeners( containerId, 'ERROR' );
                                }
                            } );
                        }, 200 );
                    } );
                } );
            } );
        } );
    };

    DesertFrontEnd.prototype.getInputXmlHash = function ( containerId, callback ) {
        var self = this,
            idMap = {},
            idCounter = {
                count: 3
            },
            desertSystem = self.getDesertSystemData(),
            rootNode = self.client.getNode( containerId ),
            rootElement = self.createElementFromNode( rootNode, 'true', idCounter, idMap );

        desertSystem.DesertSystem.Space.Element.push( rootElement );
        self.populateElementsRec( rootNode, rootElement, idCounter, idMap );
        self.saveInputXmlToBlobArtifact( desertSystem, idMap, callback );
    };

    DesertFrontEnd.prototype.populateElementsRec = function ( rootNode, rootElement, idCounter, idMap ) {
        var self = this,
            i,
            childNode,
            elem,
            childrenIds = rootNode.getChildrenIds();
        for ( i = 0; i < childrenIds.length; i += 1 ) {
            childNode = self.client.getNode( childrenIds[ i ] );
            if ( self.smartClient.isMetaTypeOf( childNode, 'Container' ) ) {
                if ( childNode.getAttribute( 'Type' ) === 'Compound' ) {
                    elem = self.createElementFromNode( childNode, 'true', idCounter, idMap );
                } else if ( childNode.getAttribute( 'Type' ) === 'Alternative' ) {
                    elem = self.createElementFromNode( childNode, 'false', idCounter, idMap );
                } else {
                    elem = self.createElementFromNode( childNode, 'false', idCounter, idMap );
                    elem.Element.push( self.createElementFromNode( null, 'false', idCounter, idMap ) );
                }
                rootElement.Element.push( elem );
                self.populateElementsRec( childNode, elem, idCounter, idMap );
            } else if ( self.smartClient.isMetaTypeOf( childNode, 'AVMComponentModel' ) ) {
                elem = self.createElementFromNode( childNode, 'false', idCounter, idMap );
                rootElement.Element.push( elem );
            }
        }
    };

    DesertFrontEnd.prototype.getDesertSystemData = function () {
        return {
            'DesertSystem': {
                '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                '@SystemName': '',
                '@xsi:noNamespaceSchemaLocation': 'DesertIface.xsd',
                'ConstraintSet': {
                    '@_id': 'id1',
                    '@externalID': '1',
                    '@id': '1',
                    '@name': 'constraints'
                },
                'FormulaSet': {
                    '@_id': 'id2',
                    '@externalID': '2',
                    '@id': '2',
                    '@name': 'formulaSet'
                },
                'Space': {
                    '@_id': 'id3',
                    '@decomposition': 'true',
                    '@externalID': '3',
                    '@id': '3',
                    '@name': 'DesignSpace',
                    'Element': []
                }
            }
        };
    };

    DesertFrontEnd.prototype.createElementFromNode = function ( node, decomposition, idCounter, idMap ) {
        var id,
            name;
        idCounter.count += 1;
        id = idCounter.count.toString();
        if ( node ) {
            name = node.getAttribute( 'name' );
            idMap[ id ] = node.getId();
        } else {
            name = 'null';
            idMap[ id ] = null;
        }
        return {
            '@_id': 'id' + id,
            '@decomposition': decomposition,
            '@externalID': id,
            '@id': id,
            '@name': name,
            'Element': []
        };
    };

    DesertFrontEnd.prototype.saveInputXmlToBlobArtifact = function ( desertSystem, idMap, callback ) {
        var self = this,
            artifact = self.blobClient.createArtifact( 'desert-input' ),
            inputXml = self.jsonToXml.convertToString( desertSystem );
        console.log( 'desertSystem', desertSystem );
        artifact.addFileAsSoftLink( 'desertInput.xml', inputXml, function ( err, hash ) {
            if ( err ) {
                console.error( 'Could not add desert_input to artifact, err: ' + err );
                return callback( err );
            }
            console.log( 'desertInput.xml has hash: ' + hash );
            callback( null, artifact, idMap );
        } );
        //callback(null, '9e9985cda011a0040054af07a579493bde67b001');
    };

    DesertFrontEnd.prototype.dealWithDesertOutput = function ( hash, callback ) {
        var self = this;
        self.blobClient.getMetadata( hash, function ( err, metadata ) {
            if ( err ) {
                callback( 'Could not obtain metadata for desert output XML, err: ' + err );
                return;
            }
            //console.info(JSON.stringify(metadata, null, 2));
            self.blobClient.getObject( hash, function ( err, content ) {
                var desertData;
                if ( err ) {
                    callback( 'Could not get content for desert output XML, err: ' + err );
                    return;
                }
                desertData = self.xmlToJson.convertFromBuffer( content );
                //console.info(JSON.stringify(desertData, null, 2));
                if ( desertData instanceof Error ) {
                    callback( 'Output desert XML not valid xml, err: ' + desertData.message );
                    return;
                }

                if ( desertData.DesertConfigurations ) {
                    callback( null, desertData.DesertConfigurations );
                } else {
                    callback( 'Json representation of desert output xml was not of right format.' );
                }
            } );
        } );
    };

    DesertFrontEnd.prototype.destroy = function () {
        this.client.removeUI( this.territoryId );
    };

    CMDSTR = [
        ':: Runs <-DesertTools.exe-> desertInput.xml /m',
        'ECHO off',
        'pushd %~dp0',
        '%SystemRoot%\\SysWoW64\\REG.exe query "HKLM\\software\\META" /v "META_PATH"',
        'SET QUERY_ERRORLEVEL=%ERRORLEVEL%',
        'IF %QUERY_ERRORLEVEL% == 0 (',
        '        FOR /F "skip=2 tokens=2,*" %%A IN (\'%SystemRoot%\\SysWoW64\\REG.exe query "HKLM\\software\\META" /v "META_PATH"\') DO SET META_PATH=%%B)',
        'SET DESERT_EXE="%META_PATH%\\bin\\DesertTool.exe"',
        '   IF EXIST %DESERT_EXE% (',
        '       REM Installer machine.',
        '       %DESERT_EXE% desertInput.xml /c "applyAll"',
        '   ) ELSE IF EXIST "%META_PATH%\\src\\bin\\DesertTool.exe" (',
        '       REM Developer machine.',
        '       "%META_PATH%\\src\\bin\\DesertTool.exe" desertInput.xml /c "applyAll"',
        '   ) ELSE (',
        '       ECHO on',
        '       ECHO Could not find DesertTool.exe!',
        '       EXIT /B 3',
        '   )',
        ')',
        'IF %QUERY_ERRORLEVEL% == 1 (',
        '    ECHO on',
        'ECHO "META tools not installed." >> _FAILED.txt',
        'ECHO "See Error Log: _FAILED.txt"',
        'EXIT /b %QUERY_ERRORLEVEL%',
        ')',
        'popd'
    ].join( '\n' );

    return DesertFrontEnd;
} );
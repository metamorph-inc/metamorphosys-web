/*globals angular, console, GME*/

/**
 * This service contains methods for design space exploration through the Executor Client.
 *
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.services' )
    .service( 'desertService', function ( $q, $interval, fileService, executorService ) {
        'use strict';
        var self = this,
            CMDSTR,
            xmlToJson = new GME.classes.Converters.Xml2json( {
                skipWSText: true,
                arrayElements: {
                    Configuration: true,
                    Element: true,
                    NaturalMember: true,
                    AlternativeAssignment: true
                }
            } ),
            jsonToXml = new GME.classes.Converters.Json2xml();

        this.calculateConfigurations = function ( desertInput ) {
            var deferred = $q.defer();

            if ( ( desertInput.desertSystem && angular.isObject( desertInput.desertSystem ) &&
                angular.isObject( desertInput.idMap ) ) === false ) {
                deferred.reject( 'desertInput must contain a desertSystem and idMap object!' );
                return deferred.promise;
            }

            self.saveDesertInput( desertInput.desertSystem )
                .then( function ( inputHash ) {
                    console.log( 'Saved desertInput', fileService.getDownloadUrl( inputHash ) );
                    return self.createAndRunJob( inputHash );
                } )
                .then( function ( jobInfo ) {
                    console.log( 'Job succeeded final jobInfo', jobInfo );
                    return self.extractConfigurations( jobInfo, desertInput.idMap );
                } )
                .then( function ( configurations ) {
                    deferred.resolve( configurations );
                } )
                .
            catch ( function ( err ) {
                deferred.reject( 'Calculating configurations failed, err: ' + err.toString() );
            } );

            return deferred.promise;
        };

        this.saveDesertInput = function ( desertSystem ) {
            var deferred = $q.defer(),
                artifact,
                xmlString;

            artifact = fileService.createArtifact( 'desert-input' );
            xmlString = jsonToXml.convertToString( desertSystem );

            fileService.addFileAsSoftLinkToArtifact( artifact, 'desertInput.xml', xmlString )
                .then( function () {
                    var execConfig = JSON.stringify( {
                        cmd: 'run_desert.cmd',
                        resultArtifacts: [ {
                            name: 'all',
                            resultPatterns: []
                        } ]
                    }, null, 4 ),
                        filesToAdd = {
                            'executor_config.json': execConfig,
                            'run_desert.cmd': CMDSTR
                        };
                    return fileService.addFilesToArtifact( artifact, filesToAdd );
                } )
                .then( function () {
                    return fileService.saveArtifact( artifact );
                } )
                .then( function ( artieHash ) {
                    deferred.resolve( artieHash );
                } )
                .
            catch ( function ( reason ) {
                deferred.reject( 'Could not save DesertInput to blob, err: "' + reason + '"' );
            } );

            return deferred.promise;
        };

        this.createAndRunJob = function ( inputHash ) {
            var deferred = $q.defer();
            executorService.createJob( {
                hash: inputHash,
                labels: []
            } )
                .then( function () {
                    var stop;
                    stop = $interval( function () {
                        executorService.getInfo( inputHash )
                            .then( function ( jobInfo ) {
                                console.info( JSON.stringify( jobInfo, null, 4 ) );
                                if ( jobInfo.status === 'CREATED' || jobInfo.status === 'RUNNING' ) {
                                    return;
                                }
                                $interval.cancel( stop );
                                if ( jobInfo.status === 'SUCCESS' ) {
                                    deferred.resolve( jobInfo );
                                } else {
                                    deferred.reject( JSON.stringify( jobInfo, null, 4 ) );
                                }
                            } )
                            .
                        catch ( function ( err ) {
                            $interval.cancel( stop );
                            deferred.reject( 'Could not obtain jobInfo for desert' + err );
                        } );
                    }, 200 );
                } )
                .
            catch ( function ( err ) {
                deferred.reject( 'Could not create job' + err );
            } );

            return deferred.promise;
        };

        this.extractConfigurations = function ( jobInfo, idMap ) {
            var deferred = $q.defer();
            if ( ( jobInfo.resultHashes && jobInfo.resultHashes.all ) === false ) {
                deferred.reject( 'JobInfo did not contain resultHashes.all' );
                return deferred.promise;
            }
            fileService.getMetadata( jobInfo.resultHashes.all )
                .then( function ( metadata ) {
                    //                    // TODO: Deal with configs when there's constraints
                    //                    if (!metadata.content.hasOwnProperty('desertInput_configs.xml')) {
                    //                        deferred.reject('Desert did not generate a "desertInput_configs.xml".');
                    //                        return;
                    //                    }
                    if ( !metadata.content.hasOwnProperty( 'desertInput_back.xml' ) ) {
                        deferred.reject( 'Desert did not generate a desertInput_back.xml.' );
                        return;
                    }

                    return fileService.getObject( metadata.content[ 'desertInput_back.xml' ].content );
                } )
                .then( function ( content ) {
                    var desertObject = xmlToJson.convertFromBuffer( content ),
                        desertBackSystem,
                        j,
                        k,
                        cfg,
                        elem,
                        altAss,
                        config,
                        configurations = [],
                        elemIdToPath = {};

                    if ( desertObject instanceof Error ) {
                        deferred.reject( 'Output desert XML not valid xml, err: ' + desertObject.message );
                        return;
                    }
                    desertBackSystem = desertObject.DesertBackSystem;

                    if ( desertBackSystem.Element ) {
                        for ( j = 0; j < desertBackSystem.Element.length; j += 1 ) {
                            elem = desertBackSystem.Element[ j ];
                            elemIdToPath[ elem[ '@_id' ] ] = idMap[ elem[ '@externalID' ] ];
                        }
                    }
                    for ( j = 0; j < desertBackSystem.Configuration.length; j += 1 ) {
                        cfg = desertBackSystem.Configuration[ j ];
                        configurations.push( {
                            name: cfg[ '@name' ],
                            id: cfg[ '@id' ],
                            alternativeAssignments: []
                        } );
                        config = configurations[ configurations.length - 1 ];
                        if ( cfg.AlternativeAssignment ) {
                            for ( k = 0; k < cfg.AlternativeAssignment.length; k += 1 ) {
                                altAss = cfg.AlternativeAssignment[ k ];
                                config.alternativeAssignments.push( {
                                    selectedAlternative: elemIdToPath[ altAss[ '@alternative_end_' ] ],
                                    alternativeOf: elemIdToPath[ altAss[ '@alternative_of_end_' ] ]
                                } );
                            }
                        }
                    }
                    deferred.resolve( configurations );
                } );

            return deferred.promise;
        };

        this.calculateConfigurationsDummy = function ( /*desertInput*/) {
            var deferred = $q.defer(),
                configurations = [ {
                    id: 1,
                    name: 'Conf. no: 1',
                    alternativeAssignments: [ {
                        selectedAlternative: '/2130017834/542571494/1646059422/564312148/91073815',
                        alternativeOf: '/2130017834/542571494/1646059422/564312148'
                    } ]
                }, {
                    id: 2,
                    name: 'Conf. no: 2',
                    alternativeAssignments: [ {
                        selectedAlternative: '/2130017834/542571494/1646059422/564312148/1433471789',
                        alternativeOf: '/2130017834/542571494/1646059422/564312148'
                    } ]
                }, {
                    id: 3,
                    name: 'Conf. no: 3',
                    alternativeAssignments: [ {
                        selectedAlternative: '/2130017834/542571494/1646059422/564312148/1493907264',
                        alternativeOf: '/2130017834/542571494/1646059422/564312148'
                    } ]
                }, {
                    id: 4,
                    name: 'Conf. no: 4',
                    alternativeAssignments: [ {
                        selectedAlternative: '/2130017834/542571494/1646059422/564312148/1767521621',
                        alternativeOf: '/2130017834/542571494/1646059422/564312148'
                    } ]
                } ];

            deferred.resolve( configurations );
            return deferred.promise;
        };

        this.getDesertInputData = function ( designStructureData ) {
            var desertSystem,
                idMap = {},
                idCounter = 4,
                rootContainer = designStructureData.containers[ designStructureData.rootId ],
                populateDataRec = function ( container, element ) {
                    var key,
                        childData,
                        id;

                    for ( key in container.components ) {
                        if ( container.components.hasOwnProperty( key ) ) {
                            childData = container.components[ key ];
                            idCounter += 1;
                            id = idCounter.toString();
                            idMap[ id ] = childData.id;
                            element.Element.push( {
                                '@_id': 'id' + id,
                                '@decomposition': 'false',
                                '@externalID': id,
                                '@id': id,
                                '@name': childData.name,
                                'Element': []
                            } );
                        }
                    }
                    for ( key in container.subContainers ) {
                        if ( container.subContainers.hasOwnProperty( key ) ) {
                            childData = container.subContainers[ key ];
                            idCounter += 1;
                            id = idCounter.toString();
                            idMap[ id ] = childData.id;
                            element.Element.push( {
                                '@_id': 'id' + id,
                                '@decomposition': ( childData.type === 'Compound' )
                                    .toString(),
                                '@externalID': id,
                                '@id': id,
                                '@name': childData.name,
                                'Element': []
                            } );
                            populateDataRec( childData, element.Element[ element.Element.length - 1 ] );
                        }
                    }
                };
            desertSystem = {
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
                        'Element': [ {
                            '@_id': 'id4',
                            '@decomposition': 'true',
                            '@externalID': '4',
                            '@id': '4',
                            '@name': rootContainer.name,
                            'Element': []
                        } ]
                    }
                }
            };
            populateDataRec( rootContainer, desertSystem.DesertSystem.Space.Element[ 0 ] );

            return {
                desertSystem: desertSystem,
                idMap: idMap
            };
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
    } );
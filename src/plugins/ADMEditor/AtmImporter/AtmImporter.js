/**
 * Generated by PluginGenerator from webgme on Wed Jun 11 2014 13:31:41 GMT-0500 (Central Daylight Time).
 */

define( [ 'plugin/PluginConfig',
    'plugin/PluginBase',
    'plugin/AtmImporter/AtmImporter/meta',
    'plugin/AdmImporter/AdmImporter/AdmImporter',
    'xmljsonconverter'
], function ( PluginConfig, PluginBase, MetaTypes, AdmImporter, Converter ) {
    'use strict';

    /**
     * Initializes a new instance of AtmImporter.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin AtmImporter.
     * @constructor
     */
    var AtmImporter = function () {
        // Call base class' constructor.
        PluginBase.call( this );
        this.meta = MetaTypes;
        this.atmData = null;
        this.testBench = null;
        this.admImporter = null;
        // ValueFlows
        this.valueFlowTargetID2Node = {};
        this.valueFlows = [];
        // Connectors
        this.connectorCompositions = [];
        this.connID2Node = {};
    };

    // Prototypal inheritance from PluginBase.
    AtmImporter.prototype = Object.create( PluginBase.prototype );
    AtmImporter.prototype.constructor = AtmImporter;

    /**
     * Gets the name of the AtmImporter.
     * @returns {string} The name of the plugin.
     * @public
     */
    AtmImporter.prototype.getName = function () {
        return "ATM Importer";
    };

    /**
     * Gets the semantic version (semver.org) of the AtmImporter.
     * @returns {string} The version of the plugin.
     * @public
     */
    AtmImporter.prototype.getVersion = function () {
        return "0.1.0";
    };

    /**
     * Gets the description of the AtmImporter.
     * @returns {string} The description of the plugin.
     * @public
     */
    AtmImporter.prototype.getDescription = function () {
        return "Import atm files generated from e.g. desktop GME.";
    };

    /**
     * Gets the configuration structure for the AtmImporter.
     * The ConfigurationStructure defines the configuration for the plugin
     * and will be used to populate the GUI when invoking the plugin from webGME.
     * @returns {object} The version of the plugin.
     * @public
     */
    AtmImporter.prototype.getConfigStructure = function () {
        return [ {
            'name': 'atmFile',
            'displayName': 'ATM file',
            'description': 'AVM TestBench Model.',
            'value': "",
            'valueType': 'asset',
            'readOnly': false
        } ];
    };


    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    AtmImporter.prototype.main = function ( callback ) {
        var self = this,
            config = self.getCurrentConfig(),
            arrayElementsInXml = {
                TestBench: false,
                TopLevelSystemUnderTest: false,
                TestComponent: true,
                Parameter: true,
                Metric: true,
                Settings: true,
                TestInjectionPoint: true,
                TestStructure: true,
                Workflow: false,
                Task: true,
                PropertyInstance: true,
                PrimitivePropertyInstance: true,
                ConnectorInstance: true,
                PortInstance: true
            },
            timeStart = new Date()
                .getTime(),

            finnishPlugin = function ( err ) {
                if ( err ) {
                    callback( err, self.result );
                    return;
                }

                self.save( 'Imported TestBench from ATM.', function ( err ) {
                    if ( err ) {
                        callback( err, self.result );
                        return;
                    }

                    //self.createMessage(null, 'ExecTime [s] total :: ' + ((new Date().getTime() - timeStart) / 1000).toString());
                    self.result.setSuccess( true );
                    callback( null, self.result );
                } );
            };

        if ( !self.activeNode ) {
            self.createMessage( null,
                'Active node is not present! This happens sometimes... Loading another model ' +
                'and trying again will solve it most of times.', 'error' );
            callback( 'Active node is not present!', self.result );
            return;
        }

        if ( self.isMetaTypeOf( self.activeNode, self.META.ATMFolder ) === false ) {
            self.createMessage( null, 'This plugin must be called from an ATMFolder.', 'error' );
            callback( null, self.result );
            return;
        }
        if ( !config.atmFile ) {
            self.createMessage( null, 'No adm file provided', 'error' );
            callback( null, self.result );
            return;
        }
        self.updateMETA( self.meta );

        self.blobClient.getObject( config.atmFile, function ( err, xmlArrayBuffer ) {
            var xmlToJson = new Converter.Xml2json( {
                skipWSText: true,
                arrayElements: arrayElementsInXml
            } );
            if ( err ) {
                self.logger.error( 'Retrieving atmFile failed with err:' + err.toString() );
                self.createMessage( null, 'Could not retrieve content of atm-file.', 'error' );
                callback( 'Retrieving atmFile failed with err:' + err.toString(), self.result );
                return;
            }
            self.atmData = xmlToJson.convertFromBuffer( xmlArrayBuffer );
            if ( self.atmData instanceof Error ) {
                self.createMessage( null, 'Given atm not valid xml: ' + self.atmData.message, 'error' );
                callback( null, self.result );
                return;
            }

            self.logger.debug( JSON.stringify( self.atmData, null, 4 ) );
            self.instantiateAdmImporter();
            self.createTestBench( self.activeNode );
            finnishPlugin( null );
        } );
    };

    AtmImporter.prototype.createTestBench = function ( atmFolderNode ) {
        var self = this,
            i, key,
            testBenchData = self.atmData.TestBench,
            testBench = self.core.createNode( {
                parent: atmFolderNode,
                base: self.meta.AVMTestBenchModel
            } ),
            testComponentsData,
            parametersData,
            metricsData;

        self.core.setAttribute( testBench, 'name', testBenchData[ '@Name' ] );

        if ( testBenchData.TopLevelSystemUnderTest ) {
            self.createTLSUT( testBench, testBenchData.TopLevelSystemUnderTest );
        } else {
            self.logger.error( 'There was no TopLevelSystemUnderTest defined!' );
            self.createMessage( testBench, 'There was no TopLevelSystemUnderTest defined!', 'error' );
        }

        if ( testBenchData.Workflow && testBenchData.Workflow[ '@Name' ] ) {
            self.createWorkflow( testBench, testBenchData.Workflow );
        } else {
            self.logger.warn( 'There was no workflow defined!' );
            self.createMessage( testBench, 'There was no Workflow defined!', 'warning' );
        }

        if ( testBenchData.TestComponent ) {
            testComponentsData = testBenchData.TestComponent;
            for ( i = 0; i < testComponentsData.length; i += 1 ) {
                self.admImporter.createComponent( testComponentsData[ i ], testBench );
            }
        }

        if ( testBenchData.Parameter ) {
            parametersData = testBenchData.Parameter;
            for ( i = 0; i < parametersData.length; i += 1 ) {
                self.admImporter.createProperty( parametersData[ i ], testBench );
            }
        }

        if ( testBenchData.Metric ) {
            metricsData = testBenchData.Metric;
            for ( i = 0; i < metricsData.length; i += 1 ) {
                self.createMetric( testBench, metricsData[ i ] );
            }
        }

        // Copy over connection data from admImporter.
        self.valueFlows = self.valueFlows.concat( self.admImporter.valueFlows );
        for ( key in self.admImporter.valueFlowTargetID2Node ) {
            if ( self.admImporter.valueFlowTargetID2Node.hasOwnProperty( key ) ) {
                self.valueFlowTargetID2Node[ key ] = self.admImporter.valueFlowTargetID2Node[ key ];
            }
        }

        self.connectorCompositions = self.connectorCompositions.concat( self.admImporter.connectorCompositions );
        for ( key in self.admImporter.connID2Node ) {
            if ( self.admImporter.connID2Node.hasOwnProperty( key ) ) {
                self.connID2Node[ key ] = self.admImporter.connID2Node[ key ];
            }
        }

        self.makeValueFlows( testBench );
        self.makeConnectorCompositions( testBench );
    };

    AtmImporter.prototype.createTLSUT = function ( testBenchNode, tlsutData ) {
        var self = this,
            i,
            propertiesData,
            propertyId,
            propertyIdInModel,
            property,
            connectorsData,
            connector,
            connectorID,
            tlsut = self.core.createNode( {
                parent: testBenchNode,
                base: self.meta.Container
            } );

        self.core.setAttribute( tlsut, 'name', 'SHOULDHAVENAME' );
        self.core.setRegistry( tlsut, 'position', {
            x: parseInt( tlsutData[ '@XPosition' ], 10 ),
            y: parseInt( tlsutData[ '@YPosition' ], 10 )
        } );

        if ( tlsutData.PropertyInstance ) {
            propertiesData = tlsutData.PropertyInstance;
            for ( i = 0; i < propertiesData.length; i += 1 ) {
                propertyId = propertiesData[ i ].Value[ '@ID' ];
                propertyIdInModel = propertiesData[ i ][ '@IDinSourceModel' ];
                if ( propertiesData[ i ].Value.ValueExpression ) {
                    self.valueFlows.push( {
                        src: propertiesData[ i ].Value.ValueExpression[ '@ValueSource' ],
                        dst: propertyId
                    } );
                    // Create a dummy-property...
                    property = self.core.createNode( {
                        parent: tlsut,
                        base: self.meta.Property
                    } );
                    self.core.setRegistry( property, 'position', {
                        x: 100,
                        y: ( 1 + i ) * 70
                    } );
                    self.core.setAttribute( property, 'name', 'Prop' + i.toString() );
                    self.core.setAttribute( property, 'ID', propertyIdInModel );
                    self.valueFlowTargetID2Node[ propertyId ] = property;
                }
            }
        }

        //TODO: This is a work-around for the missing connectorInstances in the ATM format!
        //TODO: This does not look for Connector-composition either..
        if ( tlsutData.PortInstance ) {
            connectorsData = tlsutData.PortInstance;
            for ( i = 0; i < connectorsData.length; i += 1 ) {
                connectorID = connectorsData[ i ][ '@ID' ];
                // Create a dummy-connector in the dummy-component.
                connector = self.core.createNode( {
                    parent: tlsut,
                    base: self.meta.Connector
                } );
                self.core.setRegistry( connector, 'position', {
                    x: 600,
                    y: ( 1 + i ) * 70
                } );
                self.core.setAttribute( connector, 'name', connectorsData[ i ][ '@NameInSourceModel' ] );
                self.core.setAttribute( connector, 'ID', connectorID );
                self.connID2Node[ connectorID ] = connector;
            }
        }
    };

    AtmImporter.prototype.createWorkflow = function ( testBenchNode, workflowData ) {
        var self = this,
            i,
            workflow = self.core.createNode( {
                parent: testBenchNode,
                base: self.meta.Workflow
            } ),
            tasksData,
            task;
        self.core.setAttribute( workflow, 'name', workflowData[ '@Name' ] );
        self.core.setRegistry( workflow, 'position', {
            x: 50,
            y: 80
        } );

        if ( workflowData.Task ) {
            tasksData = workflowData.Task;
            for ( i = 0; i < tasksData.length; i += 1 ) {
                task = self.core.createNode( {
                    parent: workflow,
                    base: self.meta.Task
                } );
                self.core.setAttribute( task, 'name', tasksData[ i ][ '@Name' ] );
                if ( self.admImporter.endsWith( tasksData[ i ][ '@xsi:type' ], 'InterpreterTask' ) ) {
                    self.core.setAttribute( task, 'COMName', tasksData[ i ][ '@COMName' ] );
                    self.core.setAttribute( task, 'Type', 'InterpreterTask' );
                } else if ( self.admImporter.endsWith( tasksData[ i ][ '@xsi:type' ], 'ExecutionTask' ) ) {
                    //self.core.setAttribute(task, 'Invocation', tasksData[i]['@Invocation']);
                    self.core.setAttribute( task, 'Type', 'ExecutionTask' );
                }
                self.core.setRegistry( task, 'position', {
                    x: 50,
                    y: 80 + i * 100
                } );
            }
        } else {
            self.logger.warn( 'No Tasks in work-flow!' );
            self.createMessage( workflow, 'There were no tasks defined in the workflow.', 'warning' );
        }
    };

    AtmImporter.prototype.createMetric = function ( testBenchNode, metricData ) {
        var self = this,
            metric = self.core.createNode( {
                parent: testBenchNode,
                base: self.meta.Metric
            } );
        self.core.setAttribute( metric, 'name', metricData[ '@Name' ] );
        self.core.setRegistry( metric, 'position', {
            x: parseInt( metricData[ '@XPosition' ], 10 ),
            y: parseInt( metricData[ '@YPosition' ], 10 )
        } );
    };

    AtmImporter.prototype.makeValueFlows = function ( testBenchNode ) {
        var self = this,
            i,
            srcNode,
            dstNode,
            symbol,
            valueFlowNode;
        for ( i = 0; i < self.valueFlows.length; i += 1 ) {
            srcNode = self.valueFlowTargetID2Node[ self.valueFlows[ i ].src ];
            dstNode = self.valueFlowTargetID2Node[ self.valueFlows[ i ].dst ];
            symbol = self.valueFlows[ i ].symbol;
            valueFlowNode = self.core.createNode( {
                parent: testBenchNode,
                base: self.meta.ValueFlowComposition
            } );
            self.core.setPointer( valueFlowNode, 'src', srcNode );
            self.core.setPointer( valueFlowNode, 'dst', dstNode );
            if ( symbol ) {
                self.logger.info( 'About to add value-flow into customFormula' );
                if ( symbol !== self.core.getAttribute( srcNode, 'name' ) ) {
                    self.core.setAttribute( valueFlowNode, 'VariableName', symbol );
                }
            }
        }
    };

    AtmImporter.prototype.makeConnectorCompositions = function ( testBenchNode ) {
        var self = this,
            srcID,
            dstID,
            srcNode,
            dstNode,
            i,
            connectionNode,
            jointID,
            filteredConnections = {};

        for ( i = 0; i < self.connectorCompositions.length; i += 1 ) {
            srcID = self.connectorCompositions[ i ].src;
            dstID = self.connectorCompositions[ i ].dst;
            jointID = srcID + '__' + dstID;
            if ( filteredConnections[ jointID ] ) {
                self.logger.info( 'Connection between ' + jointID + ' already added.' );
            } else {
                self.logger.info( 'Adding [src] ' + srcID + ' and [dst]' + dstID );
                jointID = dstID + '__' + srcID;
                filteredConnections[ jointID ] = true;
                srcNode = self.connID2Node[ srcID ];
                dstNode = self.connID2Node[ dstID ];
                connectionNode = self.core.createNode( {
                    parent: testBenchNode,
                    base: self.meta.ConnectorComposition
                } );
                self.core.setPointer( connectionNode, 'src', srcNode );
                self.core.setPointer( connectionNode, 'dst', dstNode );
            }
        }
    };

    AtmImporter.prototype.instantiateAdmImporter = function () {
        var self = this;
        self.admImporter = new AdmImporter();
        self.admImporter.meta = self.meta;
        self.admImporter.META = self.META;
        self.admImporter.core = self.core;
        self.admImporter.logger = self.logger;
        self.admImporter.result = self.result;
    };

    return AtmImporter;
} );

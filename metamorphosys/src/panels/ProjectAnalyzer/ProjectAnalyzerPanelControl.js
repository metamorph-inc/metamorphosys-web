"use strict";

define( [ 'logManager',
    'clientUtil',
    'js/Utils/METAAspectHelper',
    'js/Constants',
    'js/Utils/GMEConcepts',
    'js/NodePropertyNames',
    'widgets/ProjectAnalyzer/ProjectAnalyzerWidget',
    'blob/BlobClient'
], function ( logManager,
    util,
    METAAspectHelper,
    CONSTANTS,
    GMEConcepts,
    nodePropertyNames,
    ProjectAnalyzerWidget,
    BlobClient ) {

    var ProjectAnalyzerControl,
        MODEL = 'MODEL';

    ProjectAnalyzerControl = function ( options ) {
        var self = this;

        this._logger = logManager.create( "ProjectAnalyzerControl" );

        this._client = options.client;

        this._blobClient = new BlobClient();

        //initialize core collections and variables
        this._projectAnalyzerWidget = options.widget;

        this._currentNodeId = null;
        this._currentNodeParentId = undefined;

        this._displayModelsOnly = false;

        //        this._initWidgetEventHandlers();

        this._logger.debug( "Created" );
    };


    ProjectAnalyzerControl.prototype.selectedObjectChanged = function ( nodeId ) {
        var desc = this._getObjectDescriptor( nodeId ),
            nodeObj = this._client.getNode( nodeId ),
            self = this;

        this._logger.debug( "activeObject nodeId '" + nodeId + "'" );

        //remove current territory patterns
        if ( this._currentNodeId ) {
            this._client.removeUI( this._territoryId );
        }

        this._currentNodeId = nodeId;
        this._currentNodeParentId = undefined;

        this._nodes = {};

        if ( this._currentNodeId || this._currentNodeId === CONSTANTS.PROJECT_ROOT_ID ) {
            //put new node's info into territory rules
            this._selfPatterns = {};
            this._selfPatterns[ nodeId ] = {
                "children": 0
            };

            this._projectAnalyzerWidget.setTitle( desc.name.toUpperCase() );

            this._currentNodeParentId = desc.parentId;

            var baseTypeName = METAAspectHelper.getMETATypesOf( nodeId )[ 0 ];

            if ( baseTypeName !== 'AVMTestBenchModel' && baseTypeName !== 'ATMFolder' ) {
                // if node type is not 'compatible' prompt the user with a help string
                this._projectAnalyzerWidget.showError( ProjectAnalyzerWidget.MESSAGES.OPEN_A_TEST_BENCH );

            } else {
                this._getIndexHTMLLink( nodeId, function ( err, link ) {

                    if ( err ) {
                        self._projectAnalyzerWidget.showError( err );
                        return;
                    }

                    self._projectAnalyzerWidget.showLink( link );
                } );
            }
        } else {
            this._projectAnalyzerWidget.showError( ProjectAnalyzerWidget.MESSAGES.OPEN_A_TEST_BENCH );
        }
    };

    ProjectAnalyzerControl.prototype._getIndexHTMLLink = function ( nodeId, callback ) {
        var self = this,
            nodeObj = this._client.getNode( nodeId ),
            hash;

        // get hash
        hash = nodeObj.getAttribute( 'Results' );

        //hash = 'bc5d7d6c887c8b4531d32e86de7bc021e5c0e65e';

        if ( hash ) {

            self._blobClient.getMetadata( hash, function ( err, metadata ) {
                if ( err ) {
                    callback( err );
                    return;
                }

                var indexHTML = 'index.html';

                if ( metadata.content.hasOwnProperty( indexHTML ) ) {
                    var link = self._blobClient.getViewURL( hash, indexHTML );

                    // URL EXAMPLES
                    // http://localhost:8855/rest/blob/view/bc5d7d6c887c8b4531d32e86de7bc021e5c0e65e/index.html
                    // http://localhost:8855/rest/blob/metadata/bc5d7d6c887c8b4531d32e86de7bc021e5c0e65e

                    callback( null, link );
                } else {
                    callback( 'Package does not contain index.html file.' );
                }
            } );

        } else {
            callback( 'Results are not available.' );
        }
    };

    ProjectAnalyzerControl.prototype._getObjectDescriptor = function ( nodeId ) {
        var nodeObj = this._client.getNode( nodeId ),
            objDescriptor;

        if ( nodeObj ) {
            objDescriptor = {
                'id': undefined,
                'name': undefined,
                'childrenIDs': undefined,
                'parentId': undefined,
                'isConnection': false
            };

            objDescriptor.id = nodeObj.getId();
            objDescriptor.name = nodeObj.getAttribute( nodePropertyNames.Attributes.name );
            objDescriptor.childrenIDs = nodeObj.getChildrenIds();
            objDescriptor.childrenNum = objDescriptor.childrenIDs.length;
            objDescriptor.parentId = nodeObj.getParentId();
            objDescriptor.isConnection = GMEConcepts.isConnection( nodeId );
        }

        return objDescriptor;
    };

    // PUBLIC METHODS
    ProjectAnalyzerControl.prototype._onLoad = function ( gmeID ) {
        this._nodes[ gmeID ] = this._getObjectDescriptor( gmeID );
    };

    ProjectAnalyzerControl.prototype._onUpdate = function ( gmeID ) {
        this._nodes[ gmeID ] = this._getObjectDescriptor( gmeID );
    };

    ProjectAnalyzerControl.prototype._onUnload = function ( gmeID ) {
        delete this._nodes[ gmeID ];
    };

    ProjectAnalyzerControl.prototype.destroy = function () {
        this._detachClientEventListeners();
    };

    ProjectAnalyzerControl.prototype._stateActiveObjectChanged = function ( model, activeObjectId ) {
        this.selectedObjectChanged( activeObjectId );
    };

    ProjectAnalyzerControl.prototype._attachClientEventListeners = function () {
        this._detachClientEventListeners();
        WebGMEGlobal.State.on( 'change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged, this );
    };

    ProjectAnalyzerControl.prototype._detachClientEventListeners = function () {
        WebGMEGlobal.State.off( 'change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged );
    };

    ProjectAnalyzerControl.prototype.onActivate = function () {
        this._attachClientEventListeners();
        this._displayToolbarItems();
    };

    ProjectAnalyzerControl.prototype.onDeactivate = function () {
        this._detachClientEventListeners();
        this._hideToolbarItems();
    };

    ProjectAnalyzerControl.prototype._displayToolbarItems = function () {
        if ( this._toolbarInitialized !== true ) {
            this._initializeToolbar();
        } else {
            for ( var i = 0; i < this._toolbarItems.length; i++ ) {
                this._toolbarItems[ i ].show();
            }
        }
    };

    ProjectAnalyzerControl.prototype._hideToolbarItems = function () {
        if ( this._toolbarInitialized === true ) {
            for ( var i = 0; i < this._toolbarItems.length; i++ ) {
                this._toolbarItems[ i ].hide();
            }
        }
    };

    ProjectAnalyzerControl.prototype._removeToolbarItems = function () {
        if ( this._toolbarInitialized === true ) {
            for ( var i = 0; i < this._toolbarItems.length; i++ ) {
                this._toolbarItems[ i ].destroy();
            }
        }
    };

    ProjectAnalyzerControl.prototype._initializeToolbar = function () {
        var toolBar = WebGMEGlobal.Toolbar,
            self = this;

        this._toolbarItems = [];

        this._toolbarItems.push( toolBar.addSeparator() );
        //
        //        /************** GOTO PARENT IN HIERARCHY BUTTON ****************/
        //        this.$btnModelHierarchyUp = toolBar.addButton({
        //            "title": "Go to parent",
        //            "icon": "icon-circle-arrow-up",
        //            "clickFn": function (/*data*/) {
        //                WebGMEGlobal.State.setActiveObject(self._currentNodeParentId);
        //            }
        //        });
        //        this._toolbarItems.push(this.$btnModelHierarchyUp);
        //        this.$btnModelHierarchyUp.hide();
        //        /************** END OF - GOTO PARENT IN HIERARCHY BUTTON ****************/
        //
        //        /************** MODEL / CONNECTION filter *******************/
        //        this.$lblShowConnection = toolBar.addLabel();
        //        this.$lblShowConnection.text('SHOW CONNECTIONS:');
        //        this._toolbarItems.push(this.$lblShowConnection);
        //
        //        this.$cbShowConnection = toolBar.addCheckBox({ "title": "Go to parent",
        //            "checkChangedFn": function(data, checked){
        //                self._displayModelsOnly = !checked;
        //                self._generateData();
        //            }
        //        });
        //        this._toolbarItems.push(this.$cbShowConnection);
        //        /************** END OF - MODEL / CONNECTION filter *******************/


        this._toolbarInitialized = true;
    };

    return ProjectAnalyzerControl;
} );
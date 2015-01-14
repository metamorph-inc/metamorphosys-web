/*
 * Copyright (C) 2014 Vanderbilt University, All rights reserved.
 *
 * AUTO GENERATED CODE FOR PROJECT ADMEditor
 */


define( [ 'underscore',
    'js/Utils/METAAspectHelper'
], function ( _underscore,
    METAAspectHelper ) {
    "use strict";
    var _metaID = 'ADMEditor.META.js';

    //META ASPECT TYPES
    var _metaTypes = {
        'ACMFolder': '/1008889918/398267330',
        'ADMEditorModelingLanguage': '/1008889918',
        'ADMFolder': '/1008889918/755698918',
        'ATMFolder': '/1008889918/794302266',
        'AVMComponentModel': '/1008889918/1998840078',
        'AVMDesignModel': '/1008889918/430921283',
        'AVMTestBenchModel': '/1008889918/1624079113',
        'Connector': '/1008889918/1045980796',
        'ConnectorComposition': '/1008889918/488584186',
        'Container': '/1008889918/1993805430',
        'CustomFormula': '/1008889918/1299690106',
        'FCO': '/1',
        'Formula': '/1008889918/803021327',
        'Project': '/1008889918/1826321976',
        'Projects': '/1008889918/1158683626',
        'Property': '/1008889918/34094492',
        'SimpleFormula': '/1008889918/711037118',
        'ValueFlowComposition': '/1008889918/756182296'
    };

    //META ASPECT TYPE CHECKING
    var _isACMFolder = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.ACMFolder );
    };
    var _isADMEditorModelingLanguage = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.ADMEditorModelingLanguage );
    };
    var _isADMFolder = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.ADMFolder );
    };
    var _isATMFolder = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.ATMFolder );
    };
    var _isAVMComponentModel = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.AVMComponentModel );
    };
    var _isAVMDesignModel = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.AVMDesignModel );
    };
    var _isAVMTestBenchModel = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.AVMTestBenchModel );
    };
    var _isConnector = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.Connector );
    };
    var _isConnectorComposition = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.ConnectorComposition );
    };
    var _isContainer = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.Container );
    };
    var _isCustomFormula = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.CustomFormula );
    };
    var _isFCO = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.FCO );
    };
    var _isFormula = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.Formula );
    };
    var _isProject = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.Project );
    };
    var _isProjects = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.Projects );
    };
    var _isProperty = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.Property );
    };
    var _isSimpleFormula = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.SimpleFormula );
    };
    var _isValueFlowComposition = function ( objID ) {
        return METAAspectHelper.isMETAType( objID, _metaTypes.ValueFlowComposition );
    };


    var _queryMetaTypes = function () {
        var nMetaTypes = METAAspectHelper.getMETAAspectTypes(),
            m;

        if ( !_.isEqual( _metaTypes, nMetaTypes ) ) {
            var metaOutOfDateMsg = _metaID +
                " is not up to date with the latest META aspect. Please update your local copy!";
            if ( console.error ) {
                console.error( metaOutOfDateMsg );
            } else {
                console.log( metaOutOfDateMsg );
            }

            for ( m in _metaTypes ) {
                if ( _metaTypes.hasOwnProperty( m ) ) {
                    delete _metaTypes[ m ];
                }
            }

            for ( m in nMetaTypes ) {
                if ( nMetaTypes.hasOwnProperty( m ) ) {
                    _metaTypes[ m ] = nMetaTypes[ m ];
                }
            }
        }
    };

    //hook up to META ASPECT CHANGES
    METAAspectHelper.addEventListener( METAAspectHelper.events.META_ASPECT_CHANGED, function () {
        _queryMetaTypes();
    } );

    //generate the META types on the first run
    _queryMetaTypes();

    //return utility functions
    return {
        META_TYPES: _metaTypes,
        TYPE_INFO: {
            isACMFolder: _isACMFolder,
            isADMEditorModelingLanguage: _isADMEditorModelingLanguage,
            isADMFolder: _isADMFolder,
            isATMFolder: _isATMFolder,
            isAVMComponentModel: _isAVMComponentModel,
            isAVMDesignModel: _isAVMDesignModel,
            isAVMTestBenchModel: _isAVMTestBenchModel,
            isConnector: _isConnector,
            isConnectorComposition: _isConnectorComposition,
            isContainer: _isContainer,
            isCustomFormula: _isCustomFormula,
            isFCO: _isFCO,
            isFormula: _isFormula,
            isProject: _isProject,
            isProjects: _isProjects,
            isProperty: _isProperty,
            isSimpleFormula: _isSimpleFormula,
            isValueFlowComposition: _isValueFlowComposition
        }
    };
} );
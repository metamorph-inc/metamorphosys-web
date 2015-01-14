/*
 * Copyright (C) 2013 Vanderbilt University, All rights reserved.
 *
 */


define( [ 'js/Constants',
    'js/Utils/METAAspectHelper',
    'js/NodePropertyNames',
    'js/RegistryKeys',
    './ADMEditorBase',
    './ADMEditor.META',
    './ADMEditorDecorator.Constants',
    'text!./ADMEditorDecorator.html',
    'text!../default.svg'
], function ( CONSTANTS,
    METAAspectHelper,
    nodePropertyNames,
    REGISTRY_KEYS,
    ADMEditorBase,
    ADMEditorMETA,
    ADConstants,
    ADMEditorDecoratorTemplate,
    DefaultSvgTemplate
) {
    'use strict';

    /**
     * A module representing core decorator functionality for the ADMEditorModelingLanguage.
     * @exports ADMEditorDecoratorCore
     * @version 1.0
     */
    var ADMEditorDecoratorCore,
        SVG_ICON_PATH = "/decorators/ADMEditorDecorator/Icons/";

    /**
     * Contains downloaded svg elements from the server.
     * @type {{}}
     * @private
     */
    var svgCache = {};

    /**
     * Svg element that can be used as a placeholder for the icon if the icon does not exist on the server.
     * @type {*|jQuery|HTMLElement}
     * @private
     */
    var errorSVGBase = $( DefaultSvgTemplate );

    /**
     * ID list of meta types.
     * @type {*}
     * @private
     */
    var _metaAspectTypes = ADMEditorMETA.META_TYPES;

    for ( var m in _metaAspectTypes ) {
        // TODO: use the right code to do this
        if ( _metaAspectTypes.hasOwnProperty( m ) ) {

            // get the svg's url on the server for this META type
            var svg_resource_url = SVG_ICON_PATH + m + ".svg";

            // get the svg from the server in SYNC mode, may take some time
            $.ajax( svg_resource_url, {
                'async': false
            } )
                .done( function ( data ) {

                    // TODO: console.debug('Successfully downloaded: ' + svg_resource_url + ' for ' + metaType);
                    // downloaded successfully
                    // cache the downloaded content
                    svgCache[ m ] = $( data.childNodes[ 0 ] );
                } )
                .fail( function () {

                    // download failed for this type
                    // TODO: console.warning('Failed to download: ' + svg_resource_url);
                } );
        }
    }

    /**
     * Creates a new instance of ADMEditorDecoratorCore.
     * @constructor
     */
    ADMEditorDecoratorCore = function () {};

    /**
     * Represents the base element that would be inserted into the DOM.
     */
    ADMEditorDecoratorCore.prototype.$DOMBase = ( function () {
        var el = $( ADMEditorDecoratorTemplate );
        //use the same HTML template as the DefaultDecorator.DiagramDesignerWidget
        //but remove the connector DOM elements since they are not needed in the PartBrowser
        //el.find('div.name').remove();
        return el;
    } )();

    /**** Override from *.WidgetDecoratorBase ****/
    ADMEditorDecoratorCore.prototype.getTerritoryQuery = function () {
        var territoryRule = {};

        territoryRule[ this._metaInfo[ CONSTANTS.GME_ID ] ] = {
            "children": 1
        };

        return territoryRule;
    };

    /**
     * Initializes decorator.
     * @param params {object}  parameters for initialization
     * @param params.connectors {boolean} True if connectors have to be rendered otherwise false.
     * @private
     */
    ADMEditorDecoratorCore.prototype._initializeDecorator = function ( params ) {
        this.$name = undefined;

        this._displayConnectors = false;
        if ( params && params.connectors ) {
            this._displayConnectors = params.connectors;
        }
    };

    /**
     * Downloads and caches the svg files for a given METAType based on a gmeID
     * @param gmeID {string} An ID of the GME object.
     * @returns {*|jQuery|HTMLElement} SVG element that should be displayed.
     */
    ADMEditorDecoratorCore.prototype.getSVGByMetaType = function ( gmeID ) {
        var ADMEditorClassNames,
            ADMEditorClassName,
            returnSVG,
            len;

        // get all META types for the given GME object including inheritance in the meta model
        ADMEditorClassNames = METAAspectHelper.getMETATypesOf( gmeID );

        // reverse the list since the iteration is backwards in the while loop
        ADMEditorClassNames.reverse();

        // length of the list on which the iteration is performed
        len = ADMEditorClassNames.length;

        // iterate through the list from the last element to the first one
        while ( len-- ) {
            // get current the META type name
            ADMEditorClassName = ADMEditorClassNames[ len ];

            if ( ADMEditorClassName === undefined || ADMEditorClassName === null || ADMEditorClassName === "" ) {
                // if the META type name is invalid return with an error SVG
                returnSVG = errorSVGBase.clone();
            } else if ( ADMEditorClassName != "Action" ) {
                // META type name is valid
                if ( svgCache[ ADMEditorClassName ] ) {
                    returnSVG = svgCache[ ADMEditorClassName ].clone();
                }
            }
        }

        if ( returnSVG === undefined ) {
            // if svg is not defined use the default error svg
            returnSVG = errorSVGBase.clone();
        }

        return returnSVG;
    };

    /**
     * Gets a clone of an error svg icon.
     * @returns {*|jQuery|HTMLElement} Error svg icon.
     */
    ADMEditorDecoratorCore.prototype.getErrorSVG = function () {
        return this._errorSVGBase.clone();
    };

    /**
     * @todo Not implemented yet.
     * @param searchDesc {string} Search description or query.
     * @returns {boolean} True if this object satisfies the search condition.
     */
    ADMEditorDecoratorCore.prototype.doSearch = function ( searchDesc ) {
        //TODO: correct implementation needed
        return false;
    };

    /**
     * Renders the content in the placeholder DOM element.
     * @private
     */
    ADMEditorDecoratorCore.prototype._renderContent = function () {
        var self = this,
            gmeID = self._metaInfo[ CONSTANTS.GME_ID ],
            META_TYPES = ADMEditorMETA.META_TYPES;

        // meta type of the rendered object
        self._metaType = METAAspectHelper.getMETATypesOf( gmeID )[ 0 ];

        if ( DEBUG ) {
            //render GME-ID in the DOM, for debugging
            self.$el.attr( {
                "data-id": gmeID
            } );
        }

        // setting the name of component
        self.skinParts.$name = self.$el.find( '.name' );

        //empty out SVG container
        self.$el.find( '.svg-container' )
            .empty();

        //figure out the necessary SVG based on children type
        self.skinParts.$svg = self.getSVGByMetaType( gmeID );

        if ( self.skinParts.$svg ) {
            //this.skinParts.$svg.append(this._ADMEditorDecoratorCore.getPortSVG());
            self.$el.find( '.svg-container' )
                .append( self.skinParts.$svg );
            //render the connectors
            self.skinParts.$connectorContainer = self.$el.find( '.connector-container' );
            self.skinParts.$connectorContainer.empty();
        } else {
            // append error svg if the svg does not exist for this element
            self.$el.find( '.svg-container' )
                .append( self.getErrorSVG() );
        }

        _.extend( self, new ADMEditorBase() );

        // call the type specific renderer
        self._renderMetaTypeSpecificParts();

        // update the rendered object
        self.update();
    };


    /**
     * Updates the rendered object. This function is called by the Widget.
     */
    ADMEditorDecoratorCore.prototype.update = function () {
        // internal update function
        this._update();
        if ( this._displayConnectors ) {
            // initializes the connectors if they have to be displayed.
            this.initializeConnectors();
        }
    };

    /**
     * Updates the rendered object.
     * @private
     */
    ADMEditorDecoratorCore.prototype._update = function () {
        // update name of the rendered object
        this._updateName();
        this._updatePorts();
    };


    ADMEditorDecoratorCore.prototype._updateColors = function () {
        this._getNodeColorsFromRegistry();
        if ( this.fillColor ) {
            this.skinParts.$svg.find( 'path' )
                .attr( 'fill', this.fillColor );
            this.skinParts.$svg.find( 'ellipse' )
                .attr( 'fill', this.fillColor );
            this.skinParts.$svg.find( 'rect' )
                .attr( 'fill', this.fillColor );
        } else {
            this.$el.css( {
                'background-color': ''
            } );
        }

        if ( this.borderColor ) {
            this.skinParts.$svg.css( {
                'border-color': this.borderColor,
                'box-shadow': '0px 0px 7px 0px ' + this.borderColor + ' inset'
            } );
            this.skinParts.$name.css( {
                'border-color': this.borderColor
            } );
        } else {
            this.$el.css( {
                'border-color': '',
                'box-shadow': ''
            } );
            this.skinParts.$name.css( {
                'border-color': ''
            } );
        }

        if ( this.textColor ) {
            this.$el.css( {
                'color': this.textColor
            } );
        } else {
            this.$el.css( {
                'color': ''
            } );
        }
    };

    ADMEditorDecoratorCore.prototype._getNodeColorsFromRegistry = function () {
        var objID = this._metaInfo[ CONSTANTS.GME_ID ];
        this.fillColor = this.preferencesHelper.getRegistry( objID, REGISTRY_KEYS.COLOR, true );
        this.borderColor = this.preferencesHelper.getRegistry( objID, REGISTRY_KEYS.BORDER_COLOR, true );
        this.textColor = this.preferencesHelper.getRegistry( objID, REGISTRY_KEYS.TEXT_COLOR, true );
    };

    /**
     * Updates the name of the rendered object.
     * @private
     */
    ADMEditorDecoratorCore.prototype._updateName = function () {
        // initialize local variables
        var control = this._control,
            gmeID = this._metaInfo[ CONSTANTS.GME_ID ],
            name = ( control._client.getNode( gmeID ) )
                .getAttribute( nodePropertyNames.Attributes.name ),
            META_TYPES = ADMEditorMETA.META_TYPES;
        if ( this._metaType === 'Connector' ) {
            // Don't put the name on the canvas.
        } else if ( this.skinParts.$name ) {
            // if name exists
            if ( name.indexOf( '!' ) === 0 ) {
                // if name startswith '!' that means the text has to have an overline
                this.skinParts.$name.text( name.slice( 1 ) );
                this.skinParts.$name.css( 'text-decoration', 'overline' );
            } else {
                // normal text
                this.skinParts.$name.text( name );
                this.skinParts.$name.css( 'text-decoration', 'none' );
            }
        }
    };

    /* TO BE OVERRIDDEN IN META TYPE SPECIFIC CODE */

    /**
     * Renders and updates the ports for this object.
     * @private
     */
    ADMEditorDecoratorCore.prototype._updatePorts = function () {

    };

    /**
     * Renders the object based on the meta type.
     * @private
     */
    ADMEditorDecoratorCore.prototype._renderMetaTypeSpecificParts = function () {

    };

    /**
     * Registers a GME ID for notifications.
     * @param portId {string} GME ID for getting notification about this object.
     * @private
     */
    ADMEditorDecoratorCore.prototype._registerForNotification = function ( portId ) {

    };

    /**
     * Unregisters a GME ID from the event notifications.
     * @param portId {string} GME ID for getting notification about this object.
     * @private
     */
    ADMEditorDecoratorCore.prototype._unregisterForNotification = function ( portId ) {

    };

    return ADMEditorDecoratorCore;
} );
/*
 * Copyright (C) 2013 Vanderbilt University, All rights reserved.
 *
 * Authors:
 */

"use strict";

define( [ 'js/Constants',
    'js/Utils/METAAspectHelper',
    'js/NodePropertyNames',
    'js/Widgets/PartBrowser/PartBrowserWidget.DecoratorBase',
    '../Core/ADMEditorDecorator.Core.js',
    '../Core/ADMEditorDecorator.Constants',
    'css!./ADMEditorDecorator.PartBrowserWidget'
], function ( CONSTANTS,
    METATypesHelper,
    nodePropertyNames,
    PartBrowserWidgetDecoratorBase,
    ADMEditorDecoratorCore,
    ADMEditorDecoratorConstants ) {

    /**
     * A module representing PartBrowserWidget specific functionality for the ADMEditorModelingLanguage.
     * @exports ADMEditorDecoratorPartBrowserWidget
     * @version 1.0
     */
    var ADMEditorDecoratorPartBrowserWidget,
        DECORATOR_ID = "ADMEditorDecoratorPartBrowserWidget";

    /**
     * Initializes a new instance of ADMEditorDecoratorPartBrowserWidget
     * @param options {object} options for initialization
     * @constructor
     */
    ADMEditorDecoratorPartBrowserWidget = function ( options ) {
        var opts = _.extend( {}, options );

        PartBrowserWidgetDecoratorBase.apply( this, [ opts ] );

        // Part browser widget does not support creating connections therefore do not render connectors
        this._initializeDecorator( {
            "connectors": false
        } );

        this.logger.debug( "ADMEditorDecoratorPartBrowserWidget ctor" );
    };


    /************************ INHERITANCE *********************/
    _.extend( ADMEditorDecoratorPartBrowserWidget.prototype, PartBrowserWidgetDecoratorBase.prototype );
    _.extend( ADMEditorDecoratorPartBrowserWidget.prototype, ADMEditorDecoratorCore.prototype );


    /**************** OVERRIDE INHERITED / EXTEND ****************/

    /**** Override from PartBrowserWidgetDecoratorBase ****/
    ADMEditorDecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID;

    /**
     * Called before appending the element to the part browser. Renders content for the part browser.
     */
    ADMEditorDecoratorPartBrowserWidget.prototype.beforeAppend = function () {
        this.$el = this.$DOMBase.clone();

        this._hideName = true;

        this._renderContent();
    };


    /**
     * Called after element is appended to the part browser. Currently this method does nothing.
     */
    ADMEditorDecoratorPartBrowserWidget.prototype.afterAppend = function () {

    };


    /**** Override from ModelDecoratorCore ****/
    ADMEditorDecoratorPartBrowserWidget.prototype._registerForNotification = function ( portId ) {
        var partId = this._metaInfo[ CONSTANTS.GME_ID ];

        this._control.registerComponentIDForPartID( portId, partId );
    };


    /**** Override from ModelDecoratorCore ****/
    ADMEditorDecoratorPartBrowserWidget.prototype._unregisterForNotification = function ( portId ) {
        var partId = this._metaInfo[ CONSTANTS.GME_ID ];

        this._control.unregisterComponentIDFromPartID( portId, partId );
    };

    return ADMEditorDecoratorPartBrowserWidget;
} );
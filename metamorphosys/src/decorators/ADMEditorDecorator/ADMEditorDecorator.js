/*
 * Copyright (C) 2013 Vanderbilt University, All rights reserved.
 *
 * Authors:
 */


define( [ 'js/Decorators/DecoratorBase',
    './DiagramDesigner/ADMEditorDecorator.DiagramDesignerWidget',
    './PartBrowser/ADMEditorDecorator.PartBrowserWidget'
], function ( DecoratorBase,
    ADMEditorDecoratorDiagramDesignerWidget,
    ADMEditorDecoratorPartBrowserWidget
) {
    'use strict';

    /**
     * A module representing a decorator for the ADMEditor Modeling Language.
     * @exports ADMEditorDecorator
     * @version 1.0
     */
    var ADMEditorDecorator,
        __parent__ = DecoratorBase,
        __parent_proto__ = DecoratorBase.prototype,
        DECORATOR_ID = "ADMEditorDecorator";

    /**
     * Represents a ADMEditorDecorator factory.
     * @constructor
     * @param {object} params Parameters for this object.
     */
    ADMEditorDecorator = function ( params ) {
        var opts = _.extend( {
            "loggerName": this.DECORATORID
        }, params );

        __parent__.apply( this, [ opts ] );

        this.logger.debug( "ADMEditorDecorator ctor" );
    };

    _.extend( ADMEditorDecorator.prototype, __parent_proto__ );
    ADMEditorDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    /**
     * Initializes the supported widget map for this decorator.
     *
     * @see ADMEditorDecoratorDiagramDesignerWidget:ADMEditorDecoratorDiagramDesignerWidget
     * @see ADMEditorDecoratorPartBrowserWidget:ADMEditorDecoratorPartBrowserWidget
     */
    ADMEditorDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            'DiagramDesigner': ADMEditorDecoratorDiagramDesignerWidget,
            'PartBrowser': ADMEditorDecoratorPartBrowserWidget
        };
    };

    return ADMEditorDecorator;
} );
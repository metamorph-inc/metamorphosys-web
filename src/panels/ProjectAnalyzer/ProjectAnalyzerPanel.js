"use strict";

define( [ 'js/PanelBase/PanelBaseWithHeader',
    'js/PanelManager/IActivePanel',
    'widgets/ProjectAnalyzer/ProjectAnalyzerWidget',
    './ProjectAnalyzerPanelControl'
], function ( PanelBaseWithHeader,
    IActivePanel,
    ProjectAnalyzerWidget,
    ProjectAnalyzerPanelControl ) {

    var ProjectAnalyzerPanel;

    ProjectAnalyzerPanel = function ( layoutManager, params ) {
        var options = {};
        //set properties from options
        options[ PanelBaseWithHeader.OPTIONS.LOGGER_INSTANCE_NAME ] = "ProjectAnalyzerPanel";
        options[ PanelBaseWithHeader.OPTIONS.FLOATING_TITLE ] = true;

        //call parent's constructor
        PanelBaseWithHeader.apply( this, [ options, layoutManager ] );

        this._client = params.client;

        //initialize UI
        this._initialize();

        this.logger.debug( "ProjectAnalyzerPanel ctor finished" );
    };

    //inherit from PanelBaseWithHeader
    _.extend( ProjectAnalyzerPanel.prototype, PanelBaseWithHeader.prototype );
    _.extend( ProjectAnalyzerPanel.prototype, IActivePanel.prototype );

    ProjectAnalyzerPanel.prototype._initialize = function () {
        var self = this;

        //set Widget title
        this.setTitle( "" );

        this.widget = new ProjectAnalyzerWidget( this.$el );

        this.widget.setTitle = function ( title ) {
            self.setTitle( title );
        };

        this.control = new ProjectAnalyzerPanelControl( {
            "client": this._client,
            "widget": this.widget
        } );

        this.onActivate();
    };

    /* OVERRIDE FROM WIDGET-WITH-HEADER */
    /* METHOD CALLED WHEN THE WIDGET'S READ-ONLY PROPERTY CHANGES */
    ProjectAnalyzerPanel.prototype.onReadOnlyChanged = function ( isReadOnly ) {
        //apply parent's onReadOnlyChanged
        PanelBaseWithHeader.prototype.onReadOnlyChanged.call( this, isReadOnly );

        //this._projectAnalyzerWidget.setReadOnly(isReadOnly);
    };

    ProjectAnalyzerPanel.prototype.onResize = function ( width, height ) {
        this.logger.debug( 'onResize --> width: ' + width + ', height: ' + height );
        this.widget.onWidgetContainerResize( width, height );
    };

    ProjectAnalyzerPanel.prototype.destroy = function () {
        this.control.destroy();
        this.widget.destroy();

        PanelBaseWithHeader.prototype.destroy.call( this );
        WebGMEGlobal.KeyboardManager.setListener( undefined );
        WebGMEGlobal.Toolbar.refresh();
    };

    ProjectAnalyzerPanel.prototype.onActivate = function () {
        this.widget.onActivate();
        this.control.onActivate();
        WebGMEGlobal.KeyboardManager.setListener( this.widget );
        WebGMEGlobal.Toolbar.refresh();
    };

    ProjectAnalyzerPanel.prototype.onDeactivate = function () {
        this.widget.onDeactivate();
        this.control.onDeactivate();
        WebGMEGlobal.KeyboardManager.setListener( undefined );
        WebGMEGlobal.Toolbar.refresh();
    };

    return ProjectAnalyzerPanel;
} );
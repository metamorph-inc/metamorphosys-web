define( [
    'logManager',
    'css!./styles/ProjectAnalyzerWidget.css'
], function ( logManager ) {

    "use strict";

    var ProjectAnalyzerWidget,
        PROJECT_ANALYZER_CLASS = "project-analyzer",
        i = 0;

    ProjectAnalyzerWidget = function ( container, params ) {
        this._logger = logManager.create( "ProjectAnalyzerWidget" );

        this._el = container;

        this._link = null;
        this._error = null;

        this._initialize();

        this._logger.debug( "ProjectAnalyzerWidget ctor finished" );
    };

    ProjectAnalyzerWidget.MESSAGES = {
        OPEN_A_PROJECT: 'Open a project by using the <i class="icon-folder-open"></i> button in the toolbar. Then open a Test bench element in the tree browser and double click on the test bench.',
        OPEN_A_TEST_BENCH: 'Open a Test bench element in the tree browser and double click on the test bench.',
        ERROR_TEXT_IS_NOT_SET: 'Error text is not set.'

    };

    ProjectAnalyzerWidget.prototype._initialize = function () {
        var width = this._el.width(),
            height = this._el.height(),
            self = this;

        this._width = width;
        this._height = height;

        //set Widget title
        this._el.addClass( PROJECT_ANALYZER_CLASS );

        this.showError( ProjectAnalyzerWidget.MESSAGES.OPEN_A_PROJECT );
    };

    ProjectAnalyzerWidget.prototype.showError = function ( msg ) {
        this._error = msg;
        this._link = null;

        this.update();
    };

    ProjectAnalyzerWidget.prototype.showLink = function ( urlLink ) {
        this._error = null;
        this._link = urlLink;

        this.update();
    };

    ProjectAnalyzerWidget.prototype.update = function () {
        this.clear();

        if ( this._link ) {
            $( '<iframe src="' + this._link + '" width="' + this._width + '" height="' + this._height +
                '"></iframe>' )
                .appendTo( this._el );
        } else {
            this._error = this._error || ProjectAnalyzerWidget.MESSAGES.ERROR_TEXT_IS_NOT_SET;

            $( '<div class="alert warning">' + this._error + '</div>' )
                .appendTo( this._el );
        }
    };


    ProjectAnalyzerWidget.prototype.clear = function () {
        this._el.children()
            .remove();
    };


    ProjectAnalyzerWidget.prototype.onWidgetContainerResize = function ( width, height ) {
        //call our own resize handler
        this._width = width;
        this._height = height;

        this.update();
    };

    ProjectAnalyzerWidget.prototype.destroy = function () {
        this.clear();
    };

    ProjectAnalyzerWidget.prototype.onActivate = function () {};

    ProjectAnalyzerWidget.prototype.onDeactivate = function () {};

    return ProjectAnalyzerWidget;
} );
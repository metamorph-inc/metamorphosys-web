angular.module("cyphy.mmsApp.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/mmsApp/templates/index.html","<!DOCTYPE html>\n<html>\n<head lang=\"en\">\n    <meta charset=\"UTF-8\">\n\n    <link rel=\"shortcut icon\" href=\"/extlib/mms.ico\" type=\"image/x-icon\">\n    <link rel=\"icon\" href=\"/extlib/mms.ico\" type=\"image/x-icon\">\n\n    <!-- Fonts -->\n\n    <link href=\'http://fonts.googleapis.com/css?family=Titillium+Web:400,400italic,600,600italic,700,700italic\' rel=\'stylesheet\' type=\'text/css\'>\n\n    <link rel=\"stylesheet\" href=\"/extlib/bower_components/font-awesome/css/font-awesome.min.css\">\n\n    <!-- Include CSS library dependencies -->\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/bootstrap/dist/css/bootstrap.min.css\">\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/jquery-ui/themes/black-tie/jquery-ui.css\">\n\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/angular-material/angular-material.min.css\" rel=\"stylesheet\">\n\n    <link rel=\"stylesheet\" href=\"/extlib/bower_components/jscrollpane/style/jquery.jscrollpane.css\">\n\n    <link rel=\"stylesheet\" href=\"/extlib/bower_components/angular-socialshare/angular-socialshare.min.css\">\n\n    <link rel=\"stylesheet\" href=\"/extlib/bower_components/angucomplete/angucomplete.css\">\n\n    <!-- Include CSS isis-ui-components -->\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/isis-ui-components/dist/isis-ui-components.css\">\n\n    <!-- Include other cyphy-components -->\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/angular-growl/build/angular-growl.min.css\">\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/dist/cyphy-components.css\">\n\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/dist/mmsApp-app.css\">\n\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/angular-pan-zoom/bin/panzoomwidget.css\">\n\n    <title>Metamorphosys</title>\n</head>\n<body class=\"mms-app ng-cloak\" data-ng-controller=\"AppController\">\n<div growl></div>\n<div data-ng-controller=\"MainNavigatorController\"\n     class=\"main-navigator-container\">\n    <dropdown-navigator data-navigator=\"navigator\"></dropdown-navigator>\n</div>\n<div ui-view class=\"main-view-container\" resize-to-window height-is-less-with=\"51\"></div>\n\n<busy-cover>\n    <div ui-view=\"onCover\"></div>\n</busy-cover>\n\n<header-buttons></header-buttons>\n\n<div class=\"processing-cover\"\n     ng-if=\"processing\"\n        ></div>\n\n<!-- Include library dependencies -->\n<script src=\"/extlib/bower_components/jquery/dist/jquery.min.js\"></script>\n<!--<script src=\"/extlib/bower_components/jquery-mobile-bower/js/jquery.mobile-1.4.2.min.js\"></script>-->\n\n<script src=\"/extlib/bower_components/hammerjs/hammer.js\"></script>\n<script src=\"/extlib/bower_components/angular/angular.js\"></script>\n<script src=\"/extlib/bower_components/angular-touch/angular-touch.js\"></script>\n<script src=\"/extlib/bower_components/angular-animate/angular-animate.min.js\"></script>\n<script src=\"/extlib/bower_components/angular-aria/angular-aria.min.js\"></script>\n<script src=\"/extlib/bower_components/angular-material/angular-material.min.js\"></script>\n<script src=\"/extlib/bower_components/angular-cookies/angular-cookies.min.js\"></script>\n<script src=\"/extlib/bower_components/angucomplete-alt/dist/angucomplete-alt.min.js\"></script>\n<script src=\"/extlib/bower_components/angular-socialshare/angular-socialshare.min.js\"></script>\n\n<script src=\"/extlib/bower_components/angular-ui-router/release/angular-ui-router.min.js\"></script>\n<script src=\"/extlib/bower_components/bootstrap/dist/js/bootstrap.min.js\"></script>\n<script src=\"/extlib/bower_components//angular-bootstrap/ui-bootstrap-tpls.js\"></script>\n<script src=\"/extlib/bower_components/angular-ui-utils/ui-utils.min.js\"></script>\n<script src=\"/extlib/bower_components/ng-grid/build/ng-grid.min.js\"></script>\n<script src=\"/extlib/bower_components/angular-ui-utils/ui-utils.min.js\"></script>\n\n<!-- Panzoom stuff -->\n<script src=\"/extlib/bower_components/hamsterjs/hamster.js\"></script>\n<script src=\"/extlib/bower_components/angular-panhandler/dist/angular-panhandler.min.js\"></script>\n<script src=\"/extlib/bower_components/angular-mousewheel/mousewheel.js\"></script>\n<script src=\"/extlib/bower_components/angular-pan-zoom/bin/panzoom.js\"></script>\n\n<!-- jScrollPane stuff -->\n<script src=\"/extlib/bower_components/jscrollpane/script/jquery.mousewheel.js\"></script>\n<script src=\"/extlib/bower_components/jscrollpane/script/jquery.jscrollpane.min.js\"></script>\n\n\n<!-- Include WebGME libraries -->\n<!--  client -->\n<script src=\"/extlib/node_modules/webgme/dist/webgme.classes.build.js\"></script>\n<script src=\"/extlib/dist/webcyphy.plugins.build.js\"></script>\n<!--  angular module services-->\n<!--<script src=\"/extlib/node_modules/webgme/src/client/js/services/gme-services.js\"></script>-->\n<script src=\"/extlib/node_modules/ng-gme/dist/ng-gme.js\"></script>\n\n<!-- Include isis-ui-components -->\n<script src=\"/extlib/bower_components/isis-ui-components/dist/isis-ui-components.js\"></script>\n<script src=\"/extlib/bower_components/isis-ui-components/dist/isis-ui-components-templates.js\"></script>\n\n<!-- Include cyphy-components -->\n<script src=\"/extlib/dist/cyphy-components.js\"></script>\n<script src=\"/extlib/dist/cyphy-components-templates.js\"></script>\n\n<!-- Include application -->\n<script src=\"/extlib/dist/mmsApp-app.js\"></script>\n<script src=\"/extlib/dist/mmsApp-app-templates.js\"></script>\n\n<!-- Social media -->\n<script src=\"http://platform.twitter.com/widgets.js\"></script>\n\n<!-- Google analytics -->\n\n<script>\n    (function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){\n        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n    })(window,document,\'script\',\'//www.google-analytics.com/analytics.js\',\'ga\');\n</script>\n\n\n<!-- Start the main application -->\n<script type=\"text/javascript\">\n    var clientLoaded,\n            timeout = 5000, // 10 seconds\n            waitCounter = 0,\n            i,\n            success,\n            usedClasses = [\"Client\"],\n            interval = 200, // 100 milliseconds interval\n            waitForLoadId = setInterval(function () {\n                if (window.GME &&\n                    window.GME.classes) {\n                    // TODO: check for all classes that we use\n                    clearInterval(waitForLoadId);\n                    success = true;\n\n                    for (i = 0; i < usedClasses.length; i += 1) {\n                        if (window.GME.classes.hasOwnProperty(usedClasses[i])) {\n                            console.log(\'WebGME \' + usedClasses[i] + \' is available.\');\n                        } else {\n                            console.error(\'WebGME \' + usedClasses[i] + \' was not found.\');\n                            success = false;\n                        }\n                    }\n\n                    if (success) {\n                        console.log(\'WebGME client library is ready to use.\');\n                        clientLoaded();\n                    }\n                } else {\n                    console.log(\'Waiting for WebGME client library to load.\');\n                    waitCounter += 1;\n                    if (waitCounter >= timeout / interval) {\n                        clearInterval(waitForLoadId);\n                        console.error(\'WebGME client library was not loaded within a reasonable time. (\' + (timeout / 1000) + \' s)\');\n                    }\n                }\n            }, interval);\n\n    clientLoaded = function () {\n        // main entry point of the app.js\n        // once the webgme Client is loaded and ready we can use it.\n\n        angular.bootstrap(document, [\'CyPhyApp\']);\n    };\n</script>\n\n</body>\n</html>\n");
$templateCache.put("/mmsApp/templates/404.html","<div class=\"container\">\n\n    <div class=\"bs-callout bs-callout-danger\">\n        <h4 class=\"header\">Something went wrong!</h4>\n\n        <p><b>¯\\_(⊙︿⊙)_/¯</b></p>\n        <br/>\n        <md-button href=\"http://mmsapp.metamorphsoftware.com/dispatch/mmsapp\" class=\"md-raised md-primary\">Retry</md-button>\n\n    </div>\n</div>\n");
$templateCache.put("/mmsApp/templates/aboutDialog.html","<md-dialog class=\"about-dialog\">\n    <h1 class=\"md-sticky-no-effect\"> Metamorphosys Tech Demo <span class=\"header-extra\">Dev.0.1.0.</span></h1>\n    <md-content>\n        <div class=\"clearfix\"></div>\n        <p>\n            The <b>Metamorphosys</b> tools are used for the design and analysis of electronics, and have special\n            features for designing modules for Google\'s <i>Project Ara</i>. In this tech demo, you\'ll be able to quickly\n            generate a circuit board design for an Ara Module with a 1x2 form-factor.\n        </p>\n\n        <p><b>Tutorial exercise:</b></p>\n        <md-card>\n            <div layout=\"row\" layout-align=\"center center\">\n                <div flex=\"55\">\n                    <p>\n                        Grab a sensor component from the <b>SENSORS</b> folder and drag it onto the canvas.\n                    </p>\n\n                    <p>\n                        As an alternate method, you can also right-click on the chosen component and select\n                        <i>\"Add to design\"</i> from the context-menu.\n                    </p>\n                </div>\n\n                <p flex=\"5\"></p>\n\n                <p flex=\"40\">\n                    <img src=\"/extlib/dist/images/add_sensor.png\" class=\"scale-it bordered\"/>\n                </p>\n            </div>\n        </md-card>\n        <md-card>\n            <div layout=\"row\" layout-align=\"center center\">\n                <p flex=\"40\">\n                    <img src=\"/extlib/dist/images/connect_stuff.png\" class=\"scale-it bordered\"/>\n                </p>\n\n                <p flex=\"5\"></p>\n\n                <div flex=\"55\">\n                    <p>\n                        Connect the sensor\'s power ports to the corresponding interfaces of the <b>Power System</b>.\n                        Then\n                        connect its communication interface to the corresponding interface on the <b>GP ASIC</b>.\n                    </p>\n                </div>\n            </div>\n        </md-card>\n        <md-card>\n            <div layout=\"row\" layout-align=\"center center\">\n                <p flex=\"55\">\n                    Click the <b><i>play</i></b> button to automatically generate a <b>PCB</b> <i>(printed circuit\n                    board)</i>. This can take a few minutes.\n                </p>\n\n                <p flex=\"5\"></p>\n\n                <p flex=\"40\">\n                    <img src=\"/extlib/dist/images/run_testbench.png\" class=\"scale-it bordered\"/>\n                </p>\n            </div>\n        </md-card>\n        <md-card>\n            <div layout=\"row\" layout-align=\"center center\">\n                <p flex=\"40\">\n                    <img src=\"/extlib/dist/images/show_results.png\" class=\"scale-it bordered\"/>\n                </p>\n\n                <p flex=\"5\"></p>\n\n                <p flex=\"55\">\n                    After reviewing the results, iterate on your design by making changes, adding more components, and\n                    generating new PCBs.\n                </p>\n            </div>\n        </md-card>\n    </md-content>\n    <div class=\"md-actions\" layout=\"row\">\n        <social-media-buttons id=\"social-media\"></social-media-buttons>\n        <span flex></span>\n        <md-button ng-click=\"close()\" class=\"md-primary\">\n            Close\n        </md-button>\n    </div>\n</md-dialog>\n");
$templateCache.put("/mmsApp/templates/editor.html","<div class=\"editor-container\" layout=\"row\">\n    <design-editor></design-editor>\n</div>\n");
$templateCache.put("/mmsApp/templates/noProjectSpecified.html","<div class=\"container\">\n\n    <div class=\"bs-callout bs-callout-danger\">\n        <h4>It seems that you do not have a project yet.</h4>\n\n        <p>Would you like to <button data-ng-click=\"startNewProject()\" class=\"btn btn-default start-new-project\"\n                                title=\"Start new project\">Start a new one?</button></p>\n    </div>\n</div>");
$templateCache.put("/mmsApp/templates/componentSymbol.html","<g ng-attr-id=\"{{::component.id}}\"\n   class=\"symbol\"\n   ng-class=\"getCssClass()\"\n   ng-mouseup=\"onMouseUp($event)\"\n   ng-mousedown=\"onMouseDown($event)\"\n   ng-attr-id=\"{{::component.id}}\"\n   ng-attr-transform=\"{{getSymbolTransform()}}\"\n    >\n        <rect ng-attr-width=\"{{::component.symbol.width + 20}}\"\n              ng-attr-height=\"{{::component.symbol.height + 20}}\"\n              transform=\"translate(-10,-10)\"\n              class=\"selected-symbol-boundary\"></rect>\n        <g class=\"symbol-placeholder\"></g>\n        <rect ng-attr-width=\"{{::component.symbol.width}}\"\n              ng-attr-height=\"{{::component.symbol.height}}\"\n              class=\"symbol-area\"></rect>\n        <g class=\"zoom-2\">\n            <port\n                ng-repeat=\"portInstance in ::component.portInstances\"\n                class=\"zoom-3\"></port>\n            <text class=\"component-label\" ng-attr-x=\"{{::component.symbol.labelPosition.x}}\"\n                  ng-attr-y=\"{{::component.symbol.labelPosition.y}}\"\n                >{{component.label}}\n            </text>\n        </g>\n\n</g>\n");
$templateCache.put("/mmsApp/templates/genericSvg.html","<use class=\"silhouette\"\n     ng-attr-width=\"{{::component.symbol.width}}\"\n     ng-attr-height=\"{{::component.symbol.height}}\"\n     xlink:href=\"{{::component.symbol.svgDecoration}}\"></use>\n");
$templateCache.put("/mmsApp/templates/busyCover.html","<div class=\"busy-cover\">\n    <div class=\"top-half\">\n        <div class=\"logo-container\"></div>\n        <md-progress-linear ng-if=\"busy\" md-mode=\"indeterminate\"></md-progress-linear>\n    </div>\n    <div class=\"bottom-half\">\n        <div class=\"header\">{{busyMessage}}</div>\n        <ng-transclude></ng-transclude>\n    </div>\n</div>\n");
$templateCache.put("/mmsApp/templates/componentWire.html","<g class=\"component-wire\" ng-attr-id=\"{{::wire.id}}\">\n    <component-wire-segment ng-repeat=\"segment in wire.segments\"></component-wire-segment>\n    <component-wire-corner ng-repeat=\"segment in wire.segments\"></component-wire-corner>\n</g>\n");
$templateCache.put("/mmsApp/templates/componentWireCorner.html","<rect class=\"component-wire-corner\"\n      ng-if=\"!$last\"\n      ng-mousedown=\"onCornerMouseDown(segment, $event)\"\n      ng-mouseup=\"onCornerMouseUp(segment, $event)\"\n      ng-attr-x=\"{{segment.x2 - 3}}\"\n      ng-attr-y=\"{{segment.y2 - 3}}\"\n      width=\"6\" height=\"6\" fill=\"black\" stroke-width=\"1\"/>\n");
$templateCache.put("/mmsApp/templates/componentWireSegment.html","<g class=\"component-wire-segment\"\n   ng-mousedown=\"onMouseDown(segment, $event)\"\n   ng-mouseup=\"onMouseUp(segment, $event)\">\n      <line class=\"component-wire-segment-under\"\n            ng-attr-x1=\"{{segment.x1}}\"\n            ng-attr-y1=\"{{segment.y1}}\"\n            ng-attr-x2=\"{{segment.x2}}\"\n            ng-attr-y2=\"{{segment.y2}}\"/>\n\n      <line class=\"component-wire-segment-segment\"\n            ng-attr-x1=\"{{segment.x1}}\"\n            ng-attr-y1=\"{{segment.y1}}\"\n            ng-attr-x2=\"{{segment.x2}}\"\n            ng-attr-y2=\"{{segment.y2}}\"/>\n</g>\n");
$templateCache.put("/mmsApp/templates/designEditor.html","<div class=\"design-editor\" layout=\"row\">\n\n    <diagram-container\n        diagram=\"diagram\"\n        config=\"diagramContainerConfig\"\n        flex=\"75\">\n        <drawing-grid ng-attr-id=\"svg-container-drawing-grid\">\n            <svg-diagram></svg-diagram>\n        </drawing-grid>\n    </diagram-container>\n\n\n    <!--<div class=\"component-browser-container\" flex=\"25\">-->\n\n    <!--&lt;!&ndash;{{mainDbConnectionId}}&ndash;&gt;-->\n    <!--&lt;!&ndash;{{activeWorkSpace}}&ndash;&gt;-->\n    <div class=\"component-browser-container sidebar\" flex=\"25\">\n\n        <component-browser\n            auto-height=\"true\"\n            data-connection-id=\"mainGMEConnectionId\"\n            data-workspace-id=\"activeWorkSpace.id\">\n\n        </component-browser>\n\n    </div>\n\n    <testbench-actions></testbench-actions>\n    <!--&lt;!&ndash;<component-browser&ndash;&gt;&ndash;&gt;-->\n    <!--&lt;!&ndash;data-workspace-id=\"\'/577839143\'\"&ndash;&gt;-->\n    <!--&lt;!&ndash;avm-ids=\"[\'/577839143/1379959555/1468018535\']\"&ndash;&gt;-->\n    <!--&lt;!&ndash;data-connection-id=\"mainDbConnectionId\"></component-browser>&ndash;&gt;-->\n\n    <!--</div>-->\n</div>\n");
$templateCache.put("/mmsApp/templates/diagramContainer.html","<div class=\"diagram-container unselectable\"\n     ui-on-drop=\"somethingWasDroppedOnMe($event, $data)\"\n     drop-channel=\"component\"\n     data-ng-class=\"getCssClass()\"\n    >\n    <!--<div class=\"position-debug\">Visible area: {{visibleArea}} Zoom level: {{zoomLevel}} {{initialized}}</div>-->\n    <!--<panzoomwidget panzoom-id=\"panzoomId\" class=\"panzoom-widget\"></panzoomwidget>-->\n    <!--<panzoom id=\"panzoomId\" config=\"panzoomConfig\" model=\"panzoomModel\" class=\"canvas-zoomer\">-->\n    <div class=\"diagram-content-pane\"\n         ng-class=\"initialized ? \'initialized\' : \'not-initialized\'\">\n        <ng-transclude></ng-transclude>\n    </div>\n    <!--</panzoom>-->\n</div>\n");
$templateCache.put("/mmsApp/templates/fabricCanvas.html","<canvas ng-attr-id=\"{{id}}\" class=\"fabric-canvas\"></canvas>");
$templateCache.put("/mmsApp/templates/headerButtons.html","<div class=\"header-buttons\">\n    <md-button ng-click=\"openShareDialog($event)\" class=\"md-raised md-primary\"><i class=\"fa fa-share-alt\"></i></i> Save & Share</md-button>\n    <md-button ng-click=\"openSubscribeDialog($event)\" class=\"md-raised md-primary\"><i class=\"fa fa-star\"></i> Sign up</md-button>\n    <md-button ng-click=\"openHelpDialog($event)\" class=\"md-raised md-primary help\"><i class=\"fa fa-question\"></i> </md-button>\n</div>\n\n");
$templateCache.put("/mmsApp/templates/helpDialog.html","<md-dialog>\n    <h1 class=\"md-sticky-no-effect\">Instructions</h1>\n    <md-content>\n        <p>\n            The mango is a juicy stone fruit belonging to the genus Mangifera, consisting of numerous tropical fruiting trees, cultivated mostly for edible fruit. The majority of these species are found in nature as wild mangoes. They all belong to the flowering plant family Anacardiaceae. The mango is native to South and Southeast Asia, from where it has been distributed worldwide to become one of the most cultivated fruits in the tropics.\n        </p>\n    </md-content>\n    <div class=\"md-actions\" layout=\"row\">\n        <span flex></span>\n        <md-button ng-click=\"close()\" class=\"md-primary\">\n            Got it!\n        </md-button>\n    </div>\n</md-dialog>\n");
$templateCache.put("/mmsApp/templates/shareDialog.html","<md-dialog aria-label=\"Mango (Fruit)\">\n    <h1 class=\"md-sticky-no-effect\">Share project to collaborate</h1>\n    <md-content class=\"share-dialog\">\n        <h3>You do not have to save:</h3>\n        <p>Your project is automatically synced and saved to our cloud store. Others can open and real-time collaborate\n            on the current design simply by using its URL:</p>\n        <section layout=\"row\">\n            <input readonly class=\"link-field\" ng-model=\"designUrl\"/>\n            <md-button\n                ng-href=\"{{mailtoUrl}}\"\n                ng-click=\"emailDesign()\"\n                size=\"150\"\n                class=\"md-raised md-primary\"><i class=\"fa fa-paper-plane\"></i> E-mail it!</md-button>\n        </section>\n    </md-content>\n    <div class=\"md-actions\" layout=\"row\">\n        <social-media-buttons id=\"social-media\"></social-media-buttons>\n        <span flex></span>\n        <md-button ng-click=\"close()\">\n            OK\n        </md-button>\n    </div>\n</md-dialog>\n");
$templateCache.put("/mmsApp/templates/subscribeDialog.html","<md-dialog class=\"subscribe-dialog\">\n    <h1 class=\"md-sticky-no-effect\">Get in touch!</h1>\n    <md-content>\n        <p>Our tools are under development and we would like to keep you updated.</p>\n\n        <form name=\"contactForm\" class=\"contact-form\">\n            <div class=\"row\">\n                <span></span>\n                <md-text-float label=\"Name\" ng-model=\"user.name\"></md-text-float>\n                <md-text-float label=\"eMail\" ng-model=\"user.email\" name=\"email\" class=\"long\"\n                               type=\"email\"></md-text-float>\n\n                    <!--<span class=\"error\" ng-show=\"contactForm.email.$error.email\">-->\n                      <!--Not valid email!</span>-->\n\n            </div>\n        </form>\n    </md-content>\n    <div class=\"md-actions\" layout=\"row\">\n        <span flex></span>\n        <md-button ng-click=\"cancel()\">\n            No, thanks!\n        </md-button>\n        <md-button ng-click=\"send(user)\" class=\"md-primary\">\n            Send\n        </md-button>\n    </div>\n</md-dialog>\n");
$templateCache.put("/mmsApp/templates/port.html","<g ng-attr-id=\"{{::port.id}}\"\n   ng-attr-transform=\"{{::getPortTransform()}}\"\n   class=\"port\"\n   ng-class=\"::getCssClass()\">\n    <text class=\"port-label\"\n          ng-if=\"::isPortLabelVisible()\"\n          ng-attr-x=\"{{::portInstance.portSymbol.labelPosition.x}}\"\n          ng-attr-y=\"{{::portInstance.portSymbol.labelPosition.y}}\"\n        >{{getLabel()}}\n    </text>\n    <g\n        ng-click=\"onPortClick(portInstance, $event)\"\n        ng-mousedown=\"onPortMouseDown(portInstance, $event)\"\n        ng-mouseup=\"onPortMouseUp(portInstance, $event)\"\n        >\n        <circle cx=\"0\" cy=\"0\" r=\"4\" fill=\"black\" stroke-width=\"1\"/>\n    </g>\n</g>\n");
$templateCache.put("/mmsApp/templates/socialMediaButtons.html","<div class=\"social-media-buttons\">\n    <ul>\n        <li>\n            <div gplus class=\"g-plus\" data-size=\"tall\" data-annotation=\"bubble\" data-href=\'http://mmsapp.metamorphsoftware.com/dispatch/mmsapp\' data-action=\'share\'></div>\n        </li>\n        <li>\n            <a facebook class=\"facebookShare\" data-url=\'http://mmsapp.metamorphsoftware.com/dispatch/mmsapp\' data-shares=\'shares\'>{{ shares }}</a>\n        </li>\n        <li>\n            <a twitter  data-lang=\"en\" data-count=\'horizontal\' data-url=\'http://mmsapp.metamorphsoftware.com/dispatch/mmsapp\' data-via=\'metamorphTN\' data-size=\"medium\" data-text=\'Come and create an ARA module design!\' ></a>\n        </li>\n    </ul>\n</div>\n");
$templateCache.put("/mmsApp/templates/drawingGrid.html","<div class=\"drawing-grid\">\n    <ng-transclude></ng-transclude>\n</div>");
$templateCache.put("/mmsApp/templates/svgDiagram.html","<svg class=\"svg-diagram\"\n    ng-mousemove=\"onDiagramMouseMove($event)\"\n    ng-mouseleave=\"onDiagramMouseLeave($event)\"\n    ng-click=\"onDiagramClick($event)\"\n    ng-mouseup=\"onDiagramMouseUp($event)\"\n    ng-mousedown=\"onDiagramMouseDown($event)\"\n    ng-class=\"getCssClass()\"\n    isis-contextmenu\n    contextmenu-data=\"contextMenuData\"\n    contextmenu-config=\"{ triggerEvent: \'openContextMenu\' }\"\n>\n\n        >\n    <g class=\"wire-container\">\n        <component-wire ng-repeat=\"wire in visibleObjects.wires track by wire.id\" wire=\"wire\"></component-wire>\n    </g>\n    <g class=\"component-container\">\n        <!--<component-symbol ng-repeat=\"component in diagram.components | inViewPort : $parent.visibleArea : -0.3\" component=\"component\"></component-symbol>-->\n        <!--<component-symbol ng-repeat=\"component in diagram.components\" component=\"component\" ng-if=\"component.isInViewPort($parent.$parent.visibleArea, {x:-300, y:-200})\"></component-symbol>-->\n        <component-symbol ng-repeat=\"component in visibleObjects.components track by component.id\" component=\"component\"></component-symbol>\n        <!--<component-symbol ng-repeat=\"component in diagram.components\" ng-if=\"visibleDiagramComponents[component.id]\" component=\"component\"></component-symbol>-->\n    </g>\n\n    <g class=\"new-wire-line\" ng-if=\"newWireLine\">\n        <line ng-repeat=\"segment in newWireLine.segments\"\n              ng-attr-x1=\"{{segment.x1}}\"\n              ng-attr-y1=\"{{segment.y1}}\"\n              ng-attr-x2=\"{{segment.x2}}\"\n              ng-attr-y2=\"{{segment.y2}}\"/>\n    </g>\n\n    <!--<polygon points=\"100,10 40,198 190,78 10,78 160,198\"-->\n             <!--style=\"fill:lime;stroke:purple;stroke-width:5;fill-rule:evenodd;\" />-->\n\n</svg>\n");
$templateCache.put("/mmsApp/templates/testbenchActions.html","<div class=\"testbench-actions\"\n    ng-if=\"activeTestbench\">\n\n    <md-tooltip class=\"testbench-actions-tooltip\"\n                ng-if=\"busy == true\">\n        {{tooltipMessage}}\n    </md-tooltip>\n\n\n    <md-progress-circular\n        ng-if=\"busy == true\"\n        class=\"md-hue-2 testbench-busy\" md-mode=\"indeterminate\"></md-progress-circular>\n\n    <md-button\n        ng-if=\"busy != true\"\n        class=\"md-primary md-fab run-button\"\n        data-ng-click=\"startTestbench()\">\n        <i class=\"fa fa-play\" style=\"margin-left: 2px;\"></i>\n\n        <md-tooltip class=\"testbench-actions-tooltip\">\n            {{tooltipMessage}}\n        </md-tooltip>\n    </md-button>\n\n    <div class=\"available-results-button\"\n         ng-if=\"testbenchResults.length > 0\">\n        <div class=\"available-results-stick\"></div>\n        <md-button class=\"md-raised md-primary\"\n                   ng-click=\"showResults()\">\n            available results <span class=\"badge\">{{ testbenchResults.length }}</span>\n        </md-button>\n    </div>\n\n</div>\n");
$templateCache.put("/mmsApp/templates/testbenchResult.html","<md-dialog\n    class=\"testbench-result-dialog\">\n    <md-tabs md-selected=\"selectedIndex\"\n        ng-if=\"results.length > 1\"\n        md-stretch-tabs=\"never\">\n        <md-tab ng-repeat=\"aResult in results\"\n                md-on-select=\"setSelected($index)\"\n                label=\"Result {{$index + 1}}\">\n        </md-tab>\n    </md-tabs>\n    <div class=\"result-header\">\n        <h1 class=\"md-sticky-no-effect\">{{results[selectedIndex].name}}\n            <span class=\"header-extra\" am-time-ago=\"results[selectedIndex].timestamp\"></span>\n        </h1>\n    </div>\n    <md-content>\n        <div class=\"result-container\">\n            <div layout=\"column\" flex=\"100\">\n                <div class=\"testbench-visual-container\">\n                    <a ng-href=\"{{results[selectedIndex].visualUrl}}\" target=\"_blank\" title=\"Open in new window\">\n                        <img class=\"testbench-visual\" ng-src=\"{{results[selectedIndex].visualUrl}}\"/>\n                    </a>\n                </div>\n            </div>\n        </div>\n    </md-content>\n    <div class=\"md-actions\" layout=\"row\">\n        <span flex></span>\n        <ul class=\"testbench-attachments-links\">\n            <li data-ng-repeat=\"attachment in results[selectedIndex].attachments\">\n                <md-button class=\"md-raised md-primary\"\n                           ng-href=\"{{attachment.url}}\"\n                    ><i class=\"fa fa-cloud-download\"></i> {{attachment.name}}</md-button>\n            </li>\n        </ul>\n\n        <md-button ng-click=\"close()\" class=\"md-primary\">\n            Close\n        </md-button>\n    </div>\n</md-dialog>\n");
$templateCache.put("/mmsApp/templates/testbenchResultToast.html","<md-toast\n    ng-class=\"{\n        \'failure\': success !== true,\n        \'success\': success === true\n        }\">\n    <span flex\n        ng-if=\"success === true\"><i class=\"glyphicon glyphicon-ok\" style=\"margin-right: 10px\"></i> {{progressMessage}}</span>\n    <span flex\n          ng-if=\"success !== true\"\n        ><i class=\"fa fa-exclamation-circle\" style=\"margin-right: 10px\"></i> {{progressMessage}}</span>\n    <md-button\n        class=\"md-raised\"\n        ng-if=\"!(result.status==\'SUCCESS\')\"\n        ng-click=\"closeToast()\">\n        Close\n    </md-button>\n    <md-button\n        class=\"md-raised\"\n        ng-if=\"result.status==\'SUCCESS\'\"\n        ng-click=\"showResult($event)\">\n        Show it\n    </md-button>\n</md-toast>\n");
$templateCache.put("/mmsApp/templates/testbenchToast.html","<md-toast>\n    <span flex>{{progressMessage}}</span>\n    <md-button ng-click=\"closeToast()\">\n        Close\n    </md-button>\n</md-toast>\n");
$templateCache.put("/mmsApp/templates/capacitor.html","<g class=\"silhouette\">\n    <g>\n        <path fill=\"none\" stroke-linejoin=\"bevel\" d=\"M0,7.375h26.25\"/>\n    </g>\n    <g>\n        <path fill=\"none\"  stroke-linejoin=\"bevel\" d=\"M33.75,7.375H60\"/>\n    </g>\n    <g>\n        <g>\n            <line fill=\"none\"  stroke-linejoin=\"bevel\" x1=\"33.75\" y1=\"15\" x2=\"33.75\" y2=\"0\"/>\n        </g>\n        <g>\n            <line fill=\"none\"  stroke-linejoin=\"bevel\" x1=\"26.25\" y1=\"15\" x2=\"26.25\" y2=\"0\"/>\n        </g>\n    </g>\n</g>");
$templateCache.put("/mmsApp/templates/diode.html","<g class=\"silhouette\">\n    <path fill=\"none\" stroke-linejoin=\"bevel\" d=\"M0,5h23.5\"/>\n    <path fill=\"none\" stroke-linejoin=\"bevel\" d=\"M37.5,5H60\"/>\n    <polygon fill=\"none\" points=\"23.5,12 23.5,-2 37.5,5 	\"/>\n    <line fill=\"none\" stroke-linejoin=\"bevel\" x1=\"37.5\" y1=\"12.5\" x2=\"37.5\" y2=\"-2.5\"/>\n</g>");
$templateCache.put("/mmsApp/templates/inductor.html","<g class=\"silhouette\" >\n    <path fill=\"none\" stroke=\"#000000\" stroke-linecap=\"square\" d=\"M-0.001,6.216H10c0-7.502,10.002-7.502,10.002,0\n	c0-7.502,10.002-7.502,10.002,0c0-7.502,10.003-7.502,10.003,0h10\"/>\n</g>");
$templateCache.put("/mmsApp/templates/jFetP.html","<g class=\"silhouette\">\n    <path id=\"path1309\" fill=\"none\" d=\"M35.018,44.232h11.058v25.802\"/>\n    <path id=\"path1321\" fill=\"none\" d=\"M0,25.802h46.075V0\"/>\n    <path id=\"path2202\" fill=\"none\" stroke-linecap=\"square\" d=\"M60,35.018c0,11.762-9.534,21.296-21.297,21.296\n		c-11.762,0-21.297-9.534-21.297-21.296c0-11.763,9.535-21.297,21.297-21.297C50.466,13.72,60,23.255,60,35.018L60,35.018z\"/>\n    <path id=\"path3082\" d=\"M29.488,22.73v6.144l-5.836-3.072L29.488,22.73z\"/>\n    <path id=\"path3961\" fill=\"none\" d=\"M35.018,20.273v29.488\"/>\n</g>\n");
$templateCache.put("/mmsApp/templates/box.html","<g class=\"symbol-parts\">\n    <rect class=\"box-box silhouette\"\n          ng-attr-x=\"{{::component.symbol.portWireLength}}\"\n          ng-attr-y=\"{{::component.symbol.portWireLength}}\"\n          ng-attr-width=\"{{::component.symbol.boxWidth}}\"\n          ng-attr-height=\"{{::component.symbol.boxHeight}}\"/>\n\n\n    <!--<circle ng-attr-cx=\"{{::(component.symbol.boxWidth/2 + component.symbol.portWireLength)}}\"-->\n            <!--ng-attr-cy=\"{{::component.symbol.portWireLength}}\"-->\n            <!--r=\"8\"/>-->\n\n    <line class=\"port-wire\"\n          ng-repeat=\"wire in ::portWires\"\n          ng-attr-x1=\"{{::wire.x1}}\"\n          ng-attr-y1=\"{{::wire.y1}}\"\n          ng-attr-x2=\"{{::wire.x2}}\"\n          ng-attr-y2=\"{{::wire.y2}}\"\n            ></line>\n</g>\n");
$templateCache.put("/mmsApp/templates/opAmp.html","<g class=\"silhouette\">\n    <g>\n        <path id=\"path5041\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M25,75H0\"/>\n        <path id=\"path5043\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M25,25H0\"/>\n        <path id=\"path9354\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M25.021,75L25,5l90,45L25,95\n            L25.021,75\"/>\n        <path id=\"path11146\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M140,50h-25\"/>\n        <path id=\"path12035\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M65,100V75\"/>\n        <path id=\"path12037\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M65,25V0\"/>\n    </g>\n    <line fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" x1=\"31.167\" y1=\"75\" x2=\"42.167\" y2=\"75\"/>\n    <g>\n        <line fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" x1=\"31.167\" y1=\"25\" x2=\"42.167\" y2=\"25\"/>\n        <line fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\" x1=\"36.667\" y1=\"30.5\" x2=\"36.667\" y2=\"19.5\"/>\n    </g>\n</g>");
$templateCache.put("/mmsApp/templates/resistor.html","<g class=\"silhouette\">\n    <path fill=\"none\" stroke-linejoin=\"bevel\" d=\"M0,5h15l2.5-5l5,10l5-10l5,10l5-10l5,10L45,5h15\"/>\n</g>\n");
$templateCache.put("/mmsApp/templates/simpleConnector.html","<g class=\"symbol-parts\">\n    <path class=\"silhouette simple-connector\"\n          d=\"M0 0 L100 0 L105 7 L100 15 L0 15 Z\"\n        />\n    <line class=\"port-wire\"\n          x1=\"105\"\n          y1=\"7\"\n          x2=\"120\"\n          y2=\"7\"\n        ></line>\n</g>\n");}]);
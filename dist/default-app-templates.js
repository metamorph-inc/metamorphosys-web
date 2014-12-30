angular.module("cyphy.default.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/default/templates/index.html","<!DOCTYPE html>\n<html>\n<head lang=\"en\">\n    <meta charset=\"UTF-8\">\n\n    <!-- Include CSS library dependencies -->\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/bootstrap/dist/css/bootstrap.min.css\">\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/angular-growl/build/angular-growl.min.css\">\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/jquery-ui/themes/black-tie/jquery-ui.css\">\n    <link type=\"text/css\" href=\"/extlib/bower_components/font-awesome/css/font-awesome.min.css\" rel=\"stylesheet\">\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/adapt-strap/dist/adapt-strap.css\"/>\n    <!-- Include CSS isis-ui-components -->\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/isis-ui-components/dist/isis-ui-components.css\">\n\n    <!-- Include CSS cyphy-components -->\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/dist/cyphy-components.css\">\n    <!-- Include App specific css-->\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/dist/default-app.css\">\n    <title></title>\n</head>\n<body>\n<div growl></div>\n<!--<a ui-sref=\"workspaces\">State 1</a>-->\n<!--<a ui-sref=\"workspaceDetails({workspaceId: 0})\">State 2</a>-->\n<div data-ng-controller=\"MainNavigatorController\" class=\"main-navigator-container\">\n    <dropdown-navigator data-navigator=\"navigator\"></dropdown-navigator>\n</div>\n<div ui-view></div>\n\n<!-- Include library dependencies -->\n<script src=\"/extlib/bower_components/jquery/dist/jquery.min.js\"></script>\n<script src=\"/extlib/bower_components/jquery-ui/jquery-ui.min.js\"></script>\n<script src=\"/extlib/bower_components/angular/angular.js\"></script>\n<script src=\"/extlib/bower_components/angular-ui-router/release/angular-ui-router.min.js\"></script>\n<script src=\"/extlib/bower_components/bootstrap/dist/js/bootstrap.min.js\"></script>\n<script src=\"/extlib/bower_components//angular-bootstrap/ui-bootstrap-tpls.js\"></script>\n<script src=\"/extlib/bower_components/angular-ui-utils/ui-utils.min.js\"></script>\n<script src=\"/extlib/bower_components/ng-grid/build/ng-grid.min.js\"></script>\n<script src=\"/extlib/bower_components/angular-ui-utils/ui-utils.min.js\"></script>\n\n<!-- Include WebGME/WebCyphy libraries -->\n<!--  client -->\n<script src=\"/extlib/node_modules/webgme/dist/webgme.classes.build.js\"></script>\n<script src=\"/extlib/dist/webcyphy.plugins.build.js\"></script>\n<!--  angular module services-->\n<!--<script src=\"/extlib/node_modules/webgme/src/client/js/services/gme-services.js\"></script>-->\n<script src=\"/extlib/node_modules/ng-gme/dist/ng-gme.js\"></script>\n\n<!-- Include isis-ui-components -->\n<script src=\"/extlib/bower_components/isis-ui-components/dist/isis-ui-components.js\"></script>\n<script src=\"/extlib/bower_components/isis-ui-components/dist/isis-ui-components-templates.js\"></script>\n\n<!-- Include cyphy-components -->\n<script src=\"/extlib/dist/cyphy-components.js\"></script>\n<script src=\"/extlib/dist/cyphy-components-templates.js\"></script>\n\n<!-- Include application -->\n<script src=\"/extlib/dist/default-app.js\"></script>\n<script src=\"/extlib/dist/default-app-templates.js\"></script>\n\n<!-- Start the main application -->\n<script type=\"text/javascript\">\n    var clientLoaded,\n            timeout = 5000, // 10 seconds\n            waitCounter = 0,\n            i,\n            success,\n            usedClasses = [\"Client\", \"ExecutorClient\"],\n            interval = 200, // 100 milliseconds interval\n            waitForLoadId = setInterval(function () {\n                if (window.WebGMEGlobal &&\n                    window.WebGMEGlobal.classes) {\n                    // TODO: check for all classes that we use\n                    clearInterval(waitForLoadId);\n                    success = true;\n\n                    for (i = 0; i < usedClasses.length; i += 1) {\n                        if (window.WebGMEGlobal.classes.hasOwnProperty(usedClasses[i])) {\n                            console.log(\'WebGME \' + usedClasses[i] + \' is available.\');\n                        } else {\n                            console.error(\'WebGME \' + usedClasses[i] + \' was not found.\');\n                            success = false;\n                        }\n                    }\n\n                    if (success) {\n                        console.log(\'WebGME client library is ready to use.\');\n                        clientLoaded();\n                    }\n                } else {\n                    console.log(\'Waiting for WebGME client library to load.\');\n                    waitCounter += 1;\n                    if (waitCounter >= timeout / interval) {\n                        clearInterval(waitForLoadId);\n                        console.error(\'WebGME client library was not loaded within a reasonable time. (\' + (timeout / 1000) + \' s)\');\n                    }\n                }\n            }, interval);\n\n    clientLoaded = function () {\n        // main entry point of the app.js\n        // once the webgme Client is loaded and ready we can use it.\n\n        angular.bootstrap(document, [\'CyPhyApp\']);\n    };\n</script>\n</body>\n</html>");
$templateCache.put("/default/templates/TestBench.html","<div class=\"test-bench-view\">\n    <h1 class=\"main-view-header\">Test Bench - {{dataModels.testBench.name}}</h1>\n    <div class=\"test-bench-designs col-lg-4\">\n        <h3><span class=\"fa fa-cubes\"></span> Avaliable Designs</h3>\n        <design-list data-connection-id=\"\'my-db-connection-id\'\" workspace-id=workspaceId used-by-test-bench=\"true\"></design-list>\n    </div>\n    <div class=\"configurations-actions col-lg-4\">\n        <h3><span class=\"glyphicon glyphicon-th\"></span>\n            Configurations\n            <span class=\"configuration-buttons\">\n                <button ng-disabled=\"dataModels.configurations.length === 0\" class=\"btn btn-default btn-sm\" ng-click=\"runTestBench()\">Run</button>\n                <configuration-set-selector ng-if=\"dataModels.testBench.tlsutId\" design-id=\"dataModels.testBench.tlsutId\" connection-id=\"\'my-db-connection-id\'\"></configuration-set-selector>\n            </span>\n        </h3>\n        <div ng-show=\"!dataModels.testBench.tlsutId\">Select a Top Level System Under Test...</div>\n        <div ng-show=\"dataModels.testBench.tlsutId && dataModels.configurations.length === 0\">Select a set (if avaliable)..</div>\n        <configuration-table ng-if=\"dataModels.configurations.length > 0\"\n                             configurations=\"dataModels.configurations\"\n                             set-name=\"dataModels.setName\"></configuration-table>\n    </div>\n    <div class=\"test-bench-workers col-lg-4\">\n        <h3><span class=\"fa fa-suitcase\"></span> Workers Overview</h3>\n        <workers-list></workers-list>\n    </div>\n</div>");
$templateCache.put("/default/templates/DesignSpace.html","<div class=\"design-space-view\">\n    <h1 class=\"main-view-header\">Design Space - {{dataModels.design.name}}</h1>\n    <div class=\"design-space-component-list col-lg-4\">\n        <h3><span class=\"fa fa-puzzle-piece\"></span> Used Components</h3>\n        <component-list ng-if=\"state.designTreeLoaded && state.hasComponents\"\n                        connection-id=\"\'my-db-connection-id\'\"\n                        workspace-id=workspaceId\n                        avm-ids=\"dataModels.avmIds\"></component-list>\n        <span ng-if=\"!state.designTreeLoaded\" class=\"component-list-load\">Loading...</span>\n        <span ng-if=\"!state.hasComponents\" class=\"component-list-load\">No components in design..</span>\n    </div>\n    <div class=\"design-tree col-lg-4\">\n        <h3><span class=\"fa fa-cubes\"></span> Design Space Tree</h3>\n        <design-tree design-id=\"designId\" connection-id=\"\'my-db-connection-id\'\"></design-tree>\n    </div>\n    <div class=\"configurations-actions col-lg-4\">\n        <h3><span class=\"glyphicon glyphicon-th\"></span>\n            Configurations\n            <span class=\"configuration-buttons\">\n                <button ng-disabled=\"state.desertInputAvaliable === false\" class=\"btn btn-default btn-sm\" ng-click=\"calculateConfigurations()\">Calculate</button>\n                <button ng-disabled=\"dataModels.configurations.length === 0\" class=\"btn btn-default btn-sm\" ng-click=\"saveConfigurations()\">Save Set</button>\n                <configuration-set-selector\n                                            design-id=\"designId\"\n                                            connection-id=\"\'my-db-connection-id\'\"></configuration-set-selector>\n                <button ng-disabled=\"!state.resultsAvaliable\" class=\"btn btn-default btn-sm\" ng-click=\"generateDashboard()\">Generate Dashboard</button>\n            </span>\n        </h3>\n        <div ng-if=\"dataModels.configurations.length === 0\">{{state.configurationStatus}}</div>\n        <configuration-table ng-if=\"dataModels.configurations.length > 0\"\n                             configurations=\"dataModels.configurations\"\n                             set-name=\"dataModels.setName\"></configuration-table>\n    </div>\n</div>");
$templateCache.put("/default/templates/SaveConfigurationSet.html","<form>\n    <div class=\"modal-header\">\n        <h3 class=\"modal-title\">Save {{data.nbrOfConfigurations}} configuration(s) to a new set.</h3>\n    </div>\n    <div class=\"modal-body\">\n        <div class=\"row\">\n            <div class=\"col-md-6\">\n                <span class=\"title\">Name</span>\n                <input type=\"text\" class=\"form-control\" data-ng-model=\"data.name\" placeholder=\"Enter a name...\">\n            </div>\n        </div>\n        <div class=\"row\">\n            <div class=\"col-md-12\">\n                <span class=\"title\">Description</span>\n                <textarea class=\"form-control edit-description\" data-ng-model=\"data.description\"\n                          placeholder=\"Enter an optional description...\"></textarea>\n            </div>\n        </div>\n    </div>\n    <div class=\"modal-footer\">\n        <button class=\"btn btn-primary\" ng-click=\"ok()\">OK</button>\n        <button class=\"btn btn-warning\" ng-click=\"cancel()\">Cancel</button>\n    </div>\n</form>");
$templateCache.put("/default/templates/WorkspaceDetails.html","<div class=\"workspace-details-view\">\n    <h1 class=\"main-view-header\">Workspace details</h1>\n    <div class=\"components col-lg-4\">\n        <h3><span class=\"fa fa-puzzle-piece\"></span> Components</h3>\n        <component-list data-connection-id=\"\'my-db-connection-id\'\" workspace-id=dataModel.workspaceId></component-list>\n    </div>\n    <div class=\"design-spaces col-lg-4\">\n        <h3><span class=\"fa fa-cubes\"></span> Design Spaces</h3>\n        <design-list data-connection-id=\"\'my-db-connection-id\'\" workspace-id=dataModel.workspaceId></design-list>\n    </div>\n    <div class=\"test-benches col-lg-4\">\n        <h3><span class=\"glyphicon glyphicon-saved\"></span> Test Benches</h3>\n        <test-bench-list data-connection-id=\"\'my-db-connection-id\'\" workspace-id=dataModel.workspaceId></test-bench-list>\n    </div>\n</div>");
$templateCache.put("/default/templates/Workspaces.html","<div class=\"workspaces-view\">\n    <h1 class=\"main-view-header\">Workspaces</h1>\n    <div class=\"workspaces col-lg-12\">\n        <workspace-list data-connection-id=\"\'my-db-connection-id\'\"></workspace-list>\n    </div>\n</div>");}]);
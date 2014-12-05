angular.module("isis.ui.components.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/isis-ui-components/templates/contextmenu.DefaultContents.html","<hierarchical-menu menu=\"contextmenuData\" config=\"contextmenuConfig\"></hierarchical-menu>");
$templateCache.put("/isis-ui-components/templates/contextmenu.html","<div class=\"contextmenu\" ng-class=\"menuCssClass\"><div ng-include=\"contentTemplateUrl\"></div></div>");
$templateCache.put("/isis-ui-components/templates/decisionTable.decisions.html","<div class=\"decision-table-decisions\">\n    <h4>Decisions</h4>\n    <div class=\"table-style\" ng-grid=\"decisionsOptions\" ng-style=\"getDecisionTableGridStyle()\">\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/decisionTable.declarations.html","<div class=\"decision-table-declarations\">\n    <h4>Declarations</h4>\n    <div class=\"table-style\" ng-grid=\"declarationsOptions\" ng-style=\"getDeclarationTableGridStyle()\">\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/decisionTable.html","<div class=\"decision-table\">\n    <decision-table-declarations\n            declarations-data=\"tableData.declarations.data\"\n            declarations-options=\"declarationsOptions\"\n    ></decision-table-declarations>\n    <decision-table-decisions\n            decisions-data=\"tableData.decisions.data\"\n            decisions-options=\"decisionsOptions\"\n            ></decision-table-decisions>\n</div>");
$templateCache.put("/isis-ui-components/templates/dropdownNavigator.html","<nav class=\"dropdown-navigator-container\">\n    <ul class=\"dropdown-navigator\">\n        <script type=\"text/ng-template\" id=\"navigator-item-template\">\n            <div class=\"label-container\" data-ng-click=\"!item.disabled && item.action(item.actionData, $event)\">\n                <span class=\"item-label\">{{item.label}}</span>\n            </div>\n            <hierarchical-menu menu=\"item.menu\"></hierarchical-menu>\n        </script>\n        <li data-ng-repeat-start=\"item in navigator.items track by $index\"\n            data-ng-class=\" item.itemClass || \'\' \"\n            ng-include=\" item.itemTemplate || \'navigator-item-template\' \"\n            role=\"button\">\n        </li>\n        <li data-ng-repeat-end data-ng-if=\"navigator.separator && !$last\" class=\"separator\">\n            <i class=\"glyphicon glyphicon-chevron-right\"></i>\n        </li>\n    </ul>\n</nav>\n");
$templateCache.put("/isis-ui-components/templates/hierarchicalMenu.html","<div class=\"hierarchical-menu\">\n    <script type=\"text/ng-template\" id=\"menu-items\">\n\n        <div data-ng-repeat-start=\"menuItemGroup in menu\" data-ng-if=\"false\"></div>\n\n            <li data-ng-if=\"!$first && menuItemGroup.items && menuItemGroup.items.length > 0\"\n                class=\"divider\"></li>\n\n            <li data-ng-if=\"menuItemGroup.label && menuItemGroup.items && menuItemGroup.items.length > 0\"\n                class=\"label\">{{menuItemGroup.label}}\n            </li>\n\n            <li\n                ng-init=\"itemIsDisabled=item.disabled || parentItem.disabled\"\n                data-ng-repeat=\"item in menuItemGroup.items | limitTo:menuItemGroup.totalItems || 100\"\n                data-ng-class=\"{ \'dropdown-submenu\':item.menu, \'selected\': item.isSelected, \'disabled\': itemIsDisabled }\">\n                <a data-ng-class=\"\'action-\' + item.id\"\n                   data-ng-click=\"!itemIsDisabled && item.action(item.actionData, $event)\">\n                    <i data-ng-if=\"item.iconClass && !item.iconPullRight\" data-ng-class=\"item.iconClass\" class=\"item-icon\"></i>\n                    {{item.label}}\n                    <i data-ng-if=\"item.iconClass && item.iconPullRight\" data-ng-class=\"item.iconClass\"></i>\n                </a>\n                <ul class=\"dropdown-menu\"\n                    role=\"menu\"\n                    aria-labelledby=\"dropdownMenu\"\n                    data-ng-if=\"item.menu\"\n                    ng-include=\"\'menu-items\'\"\n                    data-ng-init=\"menu=item.menu; parentItem=item;\">\n                </ul>\n            </li>\n\n            <!--<li class=\"dot-dot-dot\" data-ng-if=\"menuItemGroup.showAllItems\">...</li>-->\n            <li class=\"show-all-items\"\n                data-ng-if=\"menuItemGroup.showAllItems &&\n                menuItemGroup.items &&\n                menuItemGroup.items.length > 0 &&\n                menuItemGroup.items.length >  ( menuItemGroup.totalItems || 100 )\">\n                <a data-ng-click=\"menuItemGroup.showAllItems()\">\n                   Show all...\n                </a>\n            </li>\n\n        <div data-ng-repeat-end data-ng-if=\"false\"></div>\n\n    </script>\n\n    <ul class=\"menu-contents\"\n        role=\"menu\"\n        data-ng-if=\"menu\"\n        ng-include=\"\'menu-items\'\">\n    </ul>\n\n</div>");
$templateCache.put("/isis-ui-components/templates/itemDetails.html","<div class=\"item-details\" ng-class=\"{ \'expanded\': expanded, \'collapsed\':!expanded }\">\n    <div class=\"item-details-header\"\n         ng-click=\"detailsCollapserClick()\"\n         ng-if=\"config.detailsCollapsible\">{{::getExpanderLabel()}}<i class=\"pull-right\" ng-class=\"::getExpanderClass()\"></i></div>\n    <div class=\"item-details-contents\" ng-if=\"expanded\">\n        <div ng-if=\"::item.detailsTemplateUrl\" ng-include=\"::item.detailsTemplateUrl\"></div>\n        <div ng-if=\"!::item.detailsTemplateUrl\">{{item.details}}</div>\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/itemHeader.html"," <header>\n        <div ng-if=\"::item.headerTemplateUrl\" ng-include=\"::item.headerTemplateUrl\"></div>\n        <h4 ng-if=\"::!item.headerTemplateUrl\"><a class=\"item-title\"\n               ng-click=\"itemClick($event, item)\"\n               tooltip=\"{{ item.toolTip }}\"\n               tooltip-placement=\"right\">{{ item.title }}</a></h4>\n        <il-item-menu></il-item-menu>\n</header>");
$templateCache.put("/isis-ui-components/templates/itemList.html","<div class=\"item-list\">\n    <div class=\"row\" ng-if=\"config.newItemForm\">\n        <item-list-new-item\n                form-config=\"listData.config.newItemForm\"></item-list-new-item>\n    </div>\n    <div class=\"row\" ng-if=\"config.filter\">\n        <item-list-filter></item-list-filter>\n    </div>\n    <div class=\"row\">\n        <list-item-group></list-item-group>\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/itemListFilter.html","<div class=\"item-list-filter\">\n    <div class=\"panel-group\">\n        <input class=\"form-control\" placeholder=\"Type to filter...\" ng-model=\"config.filter.$\">\n        <div class=\"filter-stats\"\n             ng-if=\"config.filter.$ && filteredItems.length\">{{filteredItems.length}} matched items</div>\n    </div>\n</div>\n");
$templateCache.put("/isis-ui-components/templates/itemListItem.html","<li class=\"item-list-item list-group-item\"\n    isis-contextmenu\n    contextmenu=\"itemContextmenu($event, item)\"\n    contextmenu-data=\"itemContextMenuData\"\n    ng-class=\"item.cssClass\">\n    <il-item-header></il-item-header>\n    <div ng-if=\"item.description\" class=\"description\">{{ item.description }}</div>\n    <il-item-details ng-if=\"item.details || item.detailsTemplateUrl\"></il-item-details>\n    <footer>\n        <taxonomy-terms ng-if=\"item.taxonomyTerms\" class=\"tags\" terms=\"item.taxonomyTerms\"></taxonomy-terms>\n        <time class=\"last-updated-time\">Updated <span am-time-ago=\"item.lastUpdated.time\"></span> by <a href=\"\">{{item.lastUpdated.user\n            }}</a></time>\n        <il-item-stats></il-item-stats>\n    </footer>\n</li>");
$templateCache.put("/isis-ui-components/templates/itemListNewItem.html","<div class=\"create-new-item\" class=\"row\">\n\n    <accordion close-others=\"oneAtATime\">\n        <accordion-group is-open=\"formConfig.expanded\">\n            <accordion-heading class=\"new-item-heading\">\n                <i class=\"glyphicon\"\n                   ng-class=\"{\'glyphicon-chevron-up\': formConfig.expanded, \'glyphicon-plus\': !formConfig.expanded}\"></i>\n                {{formConfig.title}}\n            </accordion-heading>\n            <div class=\"form-content\"\n                 ng-include=\"formConfig.itemTemplateUrl\"\n                 ng-controller=\"formConfig.controller\">\n            </div>\n        </accordion-group>\n    </accordion>\n</div>");
$templateCache.put("/isis-ui-components/templates/itemMenu.html","<div class=\"item-menu pull-right\"\n     data-ng-if=\"config.secondaryItemMenu\"\n       isis-contextmenu\n       contextmenu=\"itemContextmenu($event, item)\"\n       contextmenu-data=\"itemContextMenuData\"\n       contextmenu-config=\"itemMenuConfig\">\n    <a class=\"icon-arrow-down\"></a>\n</div>\n");
$templateCache.put("/isis-ui-components/templates/itemStats.html","<div class=\"stats\">\n    <ul class=\"list-group\">\n        <li class=\"list-group-item pull-left\"\n            ng-repeat=\"statItem in item.stats\"\n            tooltip=\"{{statItem.toolTip}}\" tooltip-placement=\"bottom\">\n            <i  ng-if=\"statItem.iconClass\"\n                ng-class=\"statItem.iconClass\"></i>\n            <span class=\"count\">{{ statItem.value }}</span></li>\n    </ul>\n</div>");
$templateCache.put("/isis-ui-components/templates/listItemGroup.html","<div class=\"list-group-wrapper\">\n    <ul class=\"list-group\" ng-show=\"filteredItems.length\">\n        <item-list-item\n            ng-repeat=\"item in filteredItems = ( listData.items | filter: config.filter ) track by $index  \">\n        </item-list-item>\n    </ul>\n    <div class=\"no-items-to-show-message\" ng-if=\"!filteredItems.length\">{{config.noItemsMessage}}</div>\n</div>");
$templateCache.put("/isis-ui-components/templates/propertyGrid.html","<div class=\"property-grid\"\n     ng-class=\"{ \'unresponsive\': unresponsive }\"\n     ng-attr-id=\"gridData.id\">\n    <form>\n    <!--<script type=\"text/ng-template\" id=\"property-grid-item-template\">-->\n        <!--<div class=\"item row\">-->\n            <!--<label class=\"col-md-3\">{{ item.label }}</label>-->\n            <!--<div class=\"col-md-9\">{{ item.value }}</div>-->\n        <!--</div>-->\n    <!--</script>-->\n        <property-grid-body property-groups=\"gridData.propertyGroups\" config=\"gridData.config\"></property-grid-body>\n\n    </form>\n\n</div>");
$templateCache.put("/isis-ui-components/templates/propertyGridBody.html","<div class=\"property-grid-body\">\n    <div class=\"property-group-container\"\n         data-ng-repeat=\"propertyGroup in propertyGroups\"\n         is-open=\"propertyGroup.expanded\">\n        <div class=\"propertygroup-header\" ng-click=\"propertyGroup.collapsed = !propertyGroup.collapsed\">\n            {{propertyGroup.label}}\n            <i class=\"pull-right glyphicon\"\n               ng-class=\"{\'glyphicon-chevron-down\': !propertyGroup.collapsed, \'glyphicon-chevron-right\': propertyGroup.collapsed}\"></i>\n        </div>\n        <property-group collapse=\"propertyGroup.collapsed\" items=\"propertyGroup.items\" config=\"config\"></property-group>\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/propertyGridRow.html","<div class=\"property-grid-row row\">\n    <property-label\n        data-ng-if=\"label || label === 0 || label === \'\'\"\n        ng-class=\"{ \'col-lg-2 col-md-3 col-sm-4 col-xs-8\': !unresponsive }\">{{label}}</property-label>\n    <property-value data-ng-repeat=\"value in values\"></property-value>\n</div>");
$templateCache.put("/isis-ui-components/templates/propertyGroup.html","<div class=\"property-group\">\n    <property-grid-row\n         data-ng-repeat=\"item in items\"\n         label=\"item.label\"\n         values=\"item.values\"\n         config=\"config\">\n    </property-grid-row>\n</div>\n");
$templateCache.put("/isis-ui-components/templates/propertyLabel.html","<label class=\"property-label\" ng-transclude>\n</label>");
$templateCache.put("/isis-ui-components/templates/propertyValue.html","<div class=\"property-value\">\n    <value-widget value=\"value\" config=\"config\" unresponsive=\"unresponsive\"></value-widget>\n</div>");
$templateCache.put("/isis-ui-components/templates/searchBox.html","<div class=\"search-box\">\n    <div class=\"input-group input-group-sm\">\n        <div class=\"input-group-btn\">\n            <button type=\"button\" class=\"btn btn-default\" ><span class=\"caret\"></span></button>\n        </div>\n         <input class=\"form-control ng-pristine ng-valid\" ng-model=\"config.$\"\n    placeholder=\"Search...\">\n        <!-- /btn-group -->\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/simpleDialog.html","<div class=\"modal-header\">\n    <h3 class=\"modal-title\">{{ dialogTitle }}</h3>\n</div>\n<div class=\"modal-body\" data-ng-include=\"dialogContentTemplate\">\n</div>\n<div class=\"modal-footer\">\n    <button class=\"btn btn-primary\" ng-click=\"ok()\">OK</button>\n    <button class=\"btn btn-warning\" ng-click=\"cancel()\">Cancel</button>\n</div>");
$templateCache.put("/isis-ui-components/templates/taxonomyTerm.html","<div class=\"taxonomy-term\"\n        ng-class=\"term.id\">\n    <a ng-attr-href=\"{{::getTermUrl()}}\">{{::term.name}}</a>\n</div>");
$templateCache.put("/isis-ui-components/templates/taxonomyTerms.html","<div class=\"taxonomy-terms\">\n    <taxonomy-term ng-repeat=\"term in terms\" term=\"term\"></taxonomy-term>\n</div>");
$templateCache.put("/isis-ui-components/templates/treeNavigator.header.html","<header>\n    <div class=\"scope-selector pull-left\"\n         data-ng-if=\"config.scopeMenu\">\n        <a  class=\"item-label\"\n           isis-contextmenu\n           contextmenu-data=\"config.scopeMenu\"\n           contextmenu-config=\"scopeMenuConfig\"\n                >{{ config.selectedScope.label }} <i class=\"fa fa-angle-down\"></i></a>\n    </div>\n    <div class=\"preferences-menu pull-right\"\n         data-ng-if=\"config.preferencesMenu\">\n        <a  class=\"item-label\"\n           isis-contextmenu\n           contextmenu-data=\"config.preferencesMenu\"\n           contextmenu-config=\"preferencesMenuConfig\"\n                ><i class=\"glyphicon glyphicon-cog\"></i></a>\n    </div>\n</header>\n");
$templateCache.put("/isis-ui-components/templates/treeNavigator.html","<nav class=\"tree-navigator\">\n    <tree-navigator-header data-ng-if=\"config.scopeMenu || config.preferencesMenu\"></tree-navigator-header>\n\n    <div class=\"tree-navigator-nodes\">\n\n        <tree-navigator-node-label\n             data-ng-if=\"config.showRootLabel\"\n             ng-init=\"node=treeData\">\n\n        </tree-navigator-node-label>\n\n        <tree-navigator-node-list\n                ng-init=\"nodes=treeData.children\"\n                nodes=\"treeData.children\"\n                config=\"config\"></tree-navigator-node-list>\n\n    </div>\n</nav>");
$templateCache.put("/isis-ui-components/templates/treeNavigator.node.html","<li title=\"{{ node.label }}\"\n    data-ng-class=\"getNodeClass(node)\">\n\n    <tree-navigator-node-label></tree-navigator-node-label>\n\n    <tree-navigator-node-list nodes=\"node.children\" config=\"config\"></tree-navigator-node-list>\n</li>");
$templateCache.put("/isis-ui-components/templates/treeNavigator.node.label.html","<div class=\"node-label\"\n      data-ng-class=\"{ \'loading\': isNodeLoading(node) }\"\n      data-ng-click=\"nodeClick($event, node)\"\n      isis-contextmenu\n      contextmenu=\"nodeContextmenu($event, node)\"\n      contextmenu-data=\"nodeContextMenuData\">\n    <a class=\"node-expander\"\n        data-ng-if=\"canNodeExpand(node) && canNodeCollapse(node)\"\n        data-ng-click=\"nodeExpanderClick($event, node)\">\n        <i data-ng-if=\"!isNodeExpanded(node)\" data-ng-class=\"node.collapsedIconClass || config.collapsedIconClass\"></i>\n        <i data-ng-if=\"isNodeExpanded(node) && canNodeCollapse(node)\" data-ng-class=\"node.expandedIconClass || config.expandedIconClass\"></i>\n    </a>\n\n    <i data-ng-if=\"node.childrenCount && config.folderIconClass || node.iconClass || config.nodeIconClass\"\n       data-ng-class=\"node.childrenCount && config.folderIconClass || node.iconClass || config.nodeIconClass\"></i>\n    <span class=\"drag-handle\"\n      ui-draggable=\"{{node.draggable}}\"\n      drag-channel=\"{{node.dragChannel}}\"\n      ui-on-drop=\"nodeDrop($event,node, $data)\"\n      drop-channel=\"{{node.dropChannel}}\"\n      drag=\"node.id\">\n        <span class=\"label-text\"\n              data-ng-dblclick=\"nodeDblclick($event, node)\"\n              data-ng-if=\"node.label\">{{ node.label }}</span>\n        <span class=\"noname\"\n              data-ng-dblclick=\"nodeDblClick($event, node)\"\n              data-ng-if=\"!node.label\">No name</span>\n    <span data-ng-if=\"node.extraInfo\"\n          class=\"node-extra-info\">{{ node.extraInfo }}</span>\n    </span>\n    <i data-ng-if=\"node.childrenCount && config.folderIconClass\"\n       data-ng-class=\"node.childrenCount && config.folderIconClass\"></i>\n</div>");
$templateCache.put("/isis-ui-components/templates/treeNavigator.nodeList.html","<ul class=\"node-list\">\n    <tree-navigator-node\n        data-ng-repeat=\"node in nodes\"\n            ></tree-navigator-node>\n</ul>\n");
$templateCache.put("/isis-ui-components/templates/validationErrorMarker.html","<div class=\"validation-error-marker\">\n    <i class=\"trigger-icon glyphicon glyphicon-info-sign\"\n        ng-if=\"invalid && !embedded\"\n        isis-contextmenu\n        contextmenu-config=\"errorMenuConfig\">\n    </i>\n    <div class=\"embedded-messages\"\n         ng-if=\"invalid && embedded\"\n         data-ng-include=\"\'/isis-ui-components/templates/validationErrorMarkerMessages.html\'\">\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/validationErrorMarkerMessages.html","<div class=\"validation-error-marker-messages\">\n    <ul>\n        <li ng-repeat=\"errorMessage in getValidationErrorMessages()\">{{errorMessage}}</li>\n    </ul>\n</div>");
$templateCache.put("/isis-ui-components/templates/checkboxWidget.html","<div class=\"checkbox-widget widget\"\n     ng-class=\"widgetMode\"\n     ng-disabled=\"widgetDisabled\"\n     ng-switch on=\"widgetMode\">\n\n    <div ng-switch-when=\"display\">\n        <div ng-switch on=\"myValue.value\">\n            <div ng-switch-when=\"true\">\n                <i class=\"glyphicon glyphicon-ok\"></i>\n            </div>\n            <div ng-switch-when=\"false\">\n                <i class=\"glyphicon glyphicon-remove\"></i>\n            </div>\n            <div ng-switch-when=\"undefined\">\n                {{modelConfig.placeHolder}}\n            </div>\n        </div>\n\n    </div>\n    <div ng-switch-when=\"edit\">\n        <div class=\"btn-group btn-group-sm\">\n            <label class=\"btn btn-sm btn-default\"\n                   ng-disabled=\"widgetDisabled\"\n                   ng-model=\"myValue.value\"\n                   btn-radio=\"true\">{{trueLabel}}</label>\n            <label class=\"btn btn-sm btn-default\"\n                   ng-disabled=\"widgetDisabled\"\n                   ng-model=\"myValue.value\"\n                   btn-radio=\"false\">{{falseLabel}}</label>\n        </div>\n        <input type=\"hidden\"\n               name=\"{{inputConfig.name}}\"\n               id=\"{{inputConfig.id}}\">\n    </div>\n\n</div>");
$templateCache.put("/isis-ui-components/templates/compoundWidget.html","<div class=\"compound-widget\"\n     ng-class=\"unresponsive? config.mode : (\'col-lg-8 col-md-8 col-sm-8 col-xs-12 \' + config.mode)\"\n     ng-init=\"displayValue = value.getDisplayValue(value)\">\n    <i class=\"glyphicon\"\n       ng-click=\"value.widget.expanded = !value.widget.expanded;\"\n       ng-class=\"{\'glyphicon-chevron-down\': value.widget.expanded, \'glyphicon-chevron-right\': !value.widget.expanded}\"></i>\n    {{displayValue}}\n    <div collapse=\"!value.widget.expanded\" class=\"compound-container\">\n        <property-group items=\"value.value\" config=\"config\"></property-group>\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/selectWidget.html","<div class=\"select-widget\"\n     ng-switch on=\"widgetMode\">\n\n    <div ng-switch-when=\"display\">{{$parent.getDisplayValue()}}</div>\n    <div ng-switch-when=\"edit\">\n        <select ng-if=\"!modelConfig.multiple\"\n                placeholder=\"{{placeHolder}}\"\n                name=\"{{inputConfig.name}}\"\n                id=\"{{inputConfig.id}}\"\n                ng-disabled=\"widgetDisabled\"\n                class=\"form-control\"\n                ng-model=\"myValue.value\"\n                ng-options=\"option.label for option in optionsList\">\n            <option value=\"\">{{placeHolder}}&nbsp;</option>\n        </select>\n        <select ng-if=\"modelConfig.multiple\"\n                placeholder=\"{{placeHolder}}\"\n                name=\"{{inputConfig.name}}\"\n                id=\"{{inputConfig.id}}\"\n                ng-disabled=\"widgetDisabled\"\n                multiple=\"true\"\n                class=\"form-control\"\n                ng-model=\"myValue.value\"\n                ng-options=\"option.label for option in optionsList\">\n        </select>\n    </div>\n\n</div>");
$templateCache.put("/isis-ui-components/templates/stringWidget.html","<div class=\"string-widget widget\"\n     ng-class=\"widgetMode\"\n     ng-switch on=\"widgetMode\">\n    <div ng-switch-when=\"display\" class=\"value-display\">{{$parent.getDisplayValue()}}</div>\n    <div ng-switch-when=\"edit\">\n        <input ng-if=\"!widgetConfig.multiLine\"\n               type=\"text\"\n               class=\"form-control\"\n               placeholder=\"{{placeHolder}}\"\n               ng-model=\"myValue.value\"\n               name=\"{{inputConfig.name}}\"\n               id=\"{{inputConfig.id}}\"\n               ng-disabled=\"widgetDisabled\"\n               auto-complete=\"widgetConfig.autoCompleteItems\"\n               ui-mask=\"{{widgetConfig.mask}}\">\n        <textarea ng-if=\"widgetConfig.multiLine\"\n                  class=\"form-control\"\n                  placeholder=\"{{placeHolder}}\"\n                  ng-model=\"myValue.value\"\n                  name=\"{{inputConfig.name}}\"\n                  id=\"{{inputConfig.id}}\"\n                  rows=\"{{widgetConfig.rows}}\"\n                  cols=\"{{widgetConfig.cols}}\"\n                  ng-disabled=\"widgetDisabled\"></textarea>\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/valueWidget.body.html","<div class=\"value-widget-body\"></div>");
$templateCache.put("/isis-ui-components/templates/valueWidget.html","<div class=\"value-widget\">\n    <label ng-if=\"widgetConfig.label\" for=\"{{inputConfig.id}}\">{{widgetConfig.label}}</label>\n    <value-widget-body tooltip=\"{{widgetConfig.tooltip}}\"\n                       tooltip-placement=\"{{widgetConfig.autoCompleteItems ? \'top\' : \'bottom\'}}\"\n                       tooltip-append-to-body=\"true\"\n                    ></value-widget-body>\n    <validation-error-marker\n            error-messages=\"validatorMessages\"\n            embedded=\"widgetConfig.errorMessagesEmbedded\"></validation-error-marker>\n</div>");}]);
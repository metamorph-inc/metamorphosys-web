angular.module("mms.componentBrowser.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/componentBrowser/templates/categoryResizer.html","<div class=\"category-resizer\" ng-mousedown=\"::ctrl.panelMouseDown($event)\">\n	<div class=\"category-resizer-border\"></div>\n</div>");
$templateCache.put("/componentBrowser/templates/componentCategories.html","<div class=\"component-categories content-categories\">\n    <tree-navigator tree-data=\"ctrl.treeData\" config=\"ctrl.config\"></tree-navigator>\n</div>\n\n");
$templateCache.put("/componentBrowser/templates/componentCategoryExtraInfo.html","<div class=\"component-category-extra-info\">\n    <div class=\"total-children-count\" ng-if=\"::ctrl.node.categoryTotal\">[{{::ctrl.node.categoryTotal}}]</div>\n</div>");
$templateCache.put("/componentBrowser/templates/componentListView.html","<div class=\"component-list-view content-list-view\">\n    <item-list list-data=\"ctrl.listData\" config=\"ctrl.config\"></item-list>\n</div>\n");
$templateCache.put("/componentBrowser/templates/itemDetail.html","<div class=\"icon-container\"\n    ng-if=\"item.details.documentation.icon != null\"\n    ng-class=\"{ \'no-info-button\': !item.octopart }\">\n    <img class=\"icon\" ng-src=\"{{item.details.documentation.icon}}\">\n</div>\n\n<property-table\n    properties=\"item.details.properties\"\n    name-max-width=\"100\"\n    value-max-width=\"120\"\n>\n</property-table>\n\n<!-- <div class=\"description-container\" ng-if=\"item.details.markdown != null\">\n    <p class=\"description-header\"> Description </p>\n    <p class=\"description\">{{ item.details.markdown }}</p>\n</div>\n -->\n");
$templateCache.put("/componentBrowser/templates/itemHeader.html","<header>\n    <h4 class=\"list-view-header\">\n        <download-button ng-if=\"!config.noDownload\" ng-click=\"config.itemDownload($event, item)\"></download-button>\n        <info-button ng-if=\"item.octopart !== undefined\" ng-click=\"config.itemInfo($event, item)\"></info-button>\n\n        <span class=\"item-title\">{{ item.title }}</span>\n    </h4>\n    <il-item-menu></il-item-menu>\n</header>\n");
$templateCache.put("/componentBrowser/templates/componentListing.html","<div class=\"component-listing content-listing\">\n\n    <div ng-if=\"ctrl.componentsToList\" class=\"not-empty-list-content\">\n\n        <div class=\"listing-header\">\n\n            <div ng-if=\"!ctrl.resultsForSearchText\" class=\"listing-subheader\">\n                Components in <i>{{ctrl.selectedCategory.label}}:</i>\n            </div>\n\n            <div ng-if=\"ctrl.resultsForSearchText\" class=\"listing-subheader\">\n                Search results for <i>{{ctrl.resultsForSearchText}}:</i>\n            </div>\n\n\n            <div class=\"paging-buttons upper\">\n                <paging\n                    config=\"ctrl.pagingParameters\"\n                    on-next-page=\"ctrl.getNextPage\"\n                    on-prev-page=\"ctrl.getPrevPage\"\n                    >\n\n                </paging>\n            </div>\n\n            <count-display from-number=\"ctrl.pagingParameters.fromNumber\"\n                           to-number=\"ctrl.pagingParameters.toNumber\"\n                           ng-if=\"ctrl.componentsToList.length\"\n                           total-count=\"ctrl.pagingParameters.totalCount\"\n                           items-per-page=\"ctrl.pagingParameters.itemsPerPage\"\n                            set-items-per-page=\"ctrl.setItemsPerPage\"\n                           ></count-display>\n\n            <view-selection selected-view=\"ctrl.selectedView\" on-view-selection=\"ctrl.onViewSelection(view)\"></view-selection>\n        </div><div class=\"listing-views container-fluid\">\n\n            <component-list-view\n                ng-if=\"ctrl.selectedView === \'ListView\'\"\n                components=\"ctrl.componentsToList\"\n                on-item-drag-start=\"ctrl.onItemDragStart\"\n                on-item-drag-end=\"ctrl.onItemDragEnd\"\n                no-download=\"ctrl.noDownload\"\n                content-library-service=\"ctrl.contentLibraryService\"\n                ></component-list-view>\n\n            <grid-view\n                ng-if=\"ctrl.selectedView === \'GridView\'\"\n                components=\"ctrl.componentsToList\"\n                selected-category=\"ctrl.selectedCategory\"\n                search-text=\"ctrl.searchText\"\n                column-search-text=\"ctrl.columnSearchText\"\n                column-sort-info=\"ctrl.columnSortInfo\"\n                paging-parameters=\"ctrl.pagingParameters\"\n                new-data=\"ctrl.newData\"\n                faceted-search=\"ctrl.facetedSearch\"\n                set-faceted-search=\"ctrl.setFacetedSearch\"\n                lock-grid-columns=\"ctrl.lockGridColumns\"\n                on-item-drag-start=\"ctrl.onItemDragStart\"\n                on-item-drag-end=\"ctrl.onItemDragEnd\"\n                no-download=\"ctrl.noDownload\"\n                ></grid-view>\n\n        </div>\n\n    </div>\n\n\n\n</div>\n");
$templateCache.put("/componentBrowser/templates/componentBrowser.html","<div class=\"component-browser content-browser\" ng-class=\"{ \'embedded\': ctrl.embedded } \">\n\n    <div class=\"header-panel\" ng-if=\"!ctrl.embedded\">\n        <h2><img id=\"morph-logo\" src=\"images/metamorph.png\"/> Component Browser</h2>\n    </div>\n    <component-search\n        ng-if=\"ctrl.componentsToList\"\n        search-text=\"ctrl.searchText\"\n        class=\"top-component-search\"\n        column-search-text=\"ctrl.columnSearchText\"\n        do-search=\"ctrl.getSearchResults\"\n        >\n    </component-search>\n\n    <div class=\"left-panel\">\n        <component-categories\n            selected-category=\"ctrl.selectedCategory\"\n            on-selection-change=\"ctrl.onCategorySelectionChange\"\n            lock-grid-columns=\"ctrl.lockGridColumns\"\n            ></component-categories>\n    </div>\n\n    <category-resizer min-width=\"100\"></category-resizer>\n\n    <div class=\"main-container-panel\">\n\n        <div ng-if=\"ctrl.componentsToList\" class=\"not-empty-list-content\">\n\n            <component-listing\n                components-to-list=\"ctrl.componentsToList\"\n                paging-parameters=\"ctrl.pagingParameters\"\n                get-next-page=\"ctrl.getNextPage\"\n                get-prev-page=\"ctrl.getPrevPage\"\n                on-page=\"ctrl.onPage\"\n                selected-category=\"ctrl.selectedCategory\"\n                search-text=\"ctrl.searchText\"\n                column-search-text=\"ctrl.columnSearchText\"\n                column-sort-info=\"ctrl.columnSortInfo\"\n                new-data=\"ctrl.newData\"\n                faceted-search=\"ctrl.facetedSearch\"\n                set-faceted-search=\"ctrl.setFacetedSearch\"\n                lock-grid-columns=\"ctrl.lockGridColumns\"\n                selected-view=\"ctrl.listingView\"\n                on-listing-view-selection=\"ctrl.onListingViewSelection(view)\"\n                on-item-drag-start=\"ctrl.onItemDragStart\"\n                on-item-drag-end=\"ctrl.onItemDragEnd\"\n                no-download=\"ctrl.noDownload\"\n                set-items-per-page=\"ctrl.setItemsPerPage\"\n                results-for-search-text=\"ctrl.resultsForSearchText\"\n                >\n            </component-listing>\n\n\n        </div>\n\n        <div class=\"text-center empty-list-content\"\n             ng-if=\"!ctrl.componentsToList\"\n            >\n\n            <component-search\n                search-text=\"ctrl.searchText\"\n                do-search=\"ctrl.getSearchResults\"\n                ></component-search>\n\n\n            <div class=\"no-components-to-list panel panel-info\" ng-if=\"!ctrl.errorMessage\">\n                <div class=\"panel-body\">\n                    <i class=\"info-icon glyphicon glyphicon-info-sign\"></i> Search for a keyword or browse the categories on the left and choose a class of categories to list.\n                </div>\n            </div>\n\n            <div class=\"error-message alert alert-warning\" role=\"alert\" ng-if=\"ctrl.errorMessage\">\n                <i class=\"glyphicon glyphicon-warning-sign\"></i> {{ctrl.errorMessage}}\n            </div>\n\n        </div>\n\n\n    </div>\n\n\n</div>\n");
$templateCache.put("/componentBrowser/templates/componentSearch.html","<div class=\"component-search\">\n    <input type=\"text\" name=\"search\"\n           ng-model=\"ctrl.searchText\"\n           ng-keydown=\"ctrl.keydownInSearchField($event)\"\n           class=\"form-control search-field\"/>\n    <button class=\"btn btn-default search-button\" ng-click=\"ctrl.doSearch()\">Search</button>\n</div>\n");
$templateCache.put("/componentBrowser/templates/countDisplay.html","<div class=\"count-display\">\n    {{ numeral(ctrl.fromNumber).format(\'0,0\') }} to {{ numeral(ctrl.toNumber).format(\'0,0\') }} of {{ numeral(ctrl.totalCount).format(\'0,0\') }}\n	<div class=\"count-select\">\n	    Page size:  &nbsp;\n	    <select data-ng-model=\"ctrl.itemsPerPage\" data-ng-options=\"act for act in ctrl.availableItemsPerPage\" ng-change=\"ctrl.setItemsPerPage(ctrl.itemsPerPage)\">\n	        </select>\n	</div>\n</div>\n");
$templateCache.put("/componentBrowser/templates/downloadButton.html","<div class=\"download-button\"\n        type=\"button\"\n        title=\"Download component\">\n    <span class=\"glyphicon glyphicon-circle-arrow-down\" aria-hidden=\"true\"></span>\n</div>\n");
$templateCache.put("/componentBrowser/templates/gridView.html","<div context-menu class=\"grid-view row\">\n    <div ui-grid=\"ctrl.gridOptions\" ui-grid-resize-columns></div>\n</div>\n\n");
$templateCache.put("/componentBrowser/templates/infoButton.html","<div class=\"info-button\"\n     type=\"button\"\n     title=\"Octopart listing\">\n    <span class=\"glyphicon glyphicon-new-window\" aria-hidden=\"true\"></span>\n    <span class=\"info-text\"> View on Octopart </span>\n</div>\n");
$templateCache.put("/componentBrowser/templates/paging.html","<div class=\"paging text-center\">\n    <div class=\"btn-group\" ng-if=\"ctrl.canPrevPage() || ctrl.canNextPage()\">\n        <button type=\"button\"\n                class=\"btn btn-default previous-page\"\n                aria-label=\"List\"\n                title=\"Previous page\"\n                ng-disabled=\"!ctrl.canPrevPage()\"\n                ng-click=\"ctrl.prevPage()\"\n            >\n            <span class=\"glyphicon glyphicon-chevron-left\" aria-hidden=\"true\"></span></button>\n        <button type=\"button\"\n                class=\"btn btn-default next-page\"\n                aria-label=\"Grid\"\n                title=\"Next page\"\n                ng-disabled=\"!ctrl.canNextPage()\"\n                ng-click=\"ctrl.nextPage()\"\n            >\n            <span class=\"glyphicon glyphicon-chevron-right\" aria-hidden=\"true\"></span>\n        </button>\n    </div>\n</div>\n");
$templateCache.put("/componentBrowser/templates/propertyTable.html","<div class=\"property-table\">\n		<property-table-item \n			ng-repeat=\"property in ctrl.properties\"\n 			property=\"::property\"\n			></property-table-item>\n</div>");
$templateCache.put("/componentBrowser/templates/propertyTableItem.html","<div class=\"property-table-item\">\n	<div class=\"property-name\" ng-attr-title=\"{{::ctrl.property.name}}\">{{::ctrl.property.name}}:</div><div ng-attr-title=\"{{::ctrl.property.value}}\"class=\"property-value\">{{::ctrl.property.value}}</div>\n</div>\n");
$templateCache.put("/componentBrowser/templates/showLessButton.html","<div class=\"show-less-button\"\n     type=\"button\"\n     title=\"Show less\">\n     <span class=\"info-text\"> Show less</span> ↵\n</div>\n");
$templateCache.put("/componentBrowser/templates/showMoreButton.html","<div class=\"show-more-button\"\n     type=\"button\"\n     title=\"Show more\">\n     ↳ <span class=\"info-text\"> Show more</span>\n</div>\n");
$templateCache.put("/componentBrowser/templates/viewSelection.html","<div class=\"view-selection btn-group\">\n    <button type=\"button\"\n            class=\"btn btn-default\"\n            aria-label=\"List\"\n            title=\"List view\"\n            ng-click=\"ctrl.selectView(\'ListView\')\"\n            ng-class=\"{ \'selected\': ctrl.selectedView === \'ListView\' }\"\n        >\n        <span class=\"glyphicon glyphicon-th-list\" aria-hidden=\"true\"></span>\n    </button>\n    <button type=\"button\"\n            class=\"btn btn-default\"\n            aria-label=\"Grid\"\n            title=\"Grid view\"\n            ng-click=\"ctrl.selectView(\'GridView\')\"\n            ng-class=\"{ \'selected\': ctrl.selectedView === \'GridView\' }\"\n        >\n        <span class=\"glyphicon glyphicon-th\" aria-hidden=\"true\"></span>\n    </button>\n</div>\n");}]);
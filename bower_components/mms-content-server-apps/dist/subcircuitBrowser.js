(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular*/

"use strict";

require("./directives/subcircuitBrowser/subcircuitBrowser");
require("./services/subcircuitLibrary.js");
require("./appConfig");

angular.module("mms.subcircuitBrowserApp", ["mms.subcircuitBrowser", "mms.subcircuitBrowser.config", "mms.subcircuitBrowser.subcircuitLibrary"]).config(function (subcircuitLibraryProvider, subcircuitServerUrl) {
    if (subcircuitServerUrl.indexOf("http") !== 0) {
        subcircuitServerUrl = window.location.origin + subcircuitServerUrl;
    }
    subcircuitLibraryProvider.setServerUrl(subcircuitServerUrl);
}).controller("AppController", function ($scope) {

    $scope.itemDragStart = function (e, item) {
        console.log("Dragging", e, item);
    };

    $scope.itemDragEnd = function (e, item) {
        console.log("Finish dragging", e, item);
    };
});

},{"./appConfig":9,"./directives/subcircuitBrowser/subcircuitBrowser":10,"./services/subcircuitLibrary.js":13}],2:[function(require,module,exports){
"use strict";

require("../componentBrowser/services/componentLibrary.js");
require("../subcircuitBrowser/services/subcircuitLibrary.js");

module.exports = function ($scope, contentLibraryService) {

    var self, config, formatProperties, itemGenerator;

    self = this;

    config = {

        sortable: false,
        secondaryItemMenu: false,
        detailsCollapsible: false,
        showDetailsLabel: "Show details",
        hideDetailsLabel: "Hide details",
        noDownload: self.noDownload,

        // Event handlers

        itemSort: function itemSort(jQEvent, ui) {
            console.log("Sort happened", jQEvent, ui);
        },

        itemClick: function itemClick(event, item) {
            console.log("Clicked: " + item);
        },

        itemDownload: function itemDownload(event, item) {
            contentLibraryService.downloadItem(item.id);
        },

        itemInfo: function itemInfo(event, item) {
            if (item.octopart !== undefined) {
                var url = "http://octopart.com/search?q=" + item.octopart + "&view=list";
                var win = window.open(url, "_blank");
                win.focus();
            }
        },

        itemContextmenuRenderer: function itemContextmenuRenderer(e, item) {

            var menu;

            if (!self.noDownload) {

                menu = [{
                    items: [{
                        id: "download",
                        label: "Download item",
                        disabled: false,
                        action: function action() {
                            contentLibraryService.downloadItem(item.id);
                        },
                        actionData: item,
                        iconClass: "fa fa-plus"
                    }]
                }];
            }

            return menu;
        },

        detailsRenderer: function detailsRenderer(item) {
            item.details = "My details are here now!";
        }

    };

    formatProperties = function (item, itemClass) {
        var res = [],
            properties = {},
            halfProperties1,
            halfProperties2;
        var pp, i, prop, key;

        if (item[itemClass + "Properties"] === undefined) {
            pp = item.prominentProperties;
            //  add non-prominent properties
            if (item.otherProperties !== undefined && item.otherProperties !== null) {
                if (pp === undefined || pp === null) {
                    pp = item.otherProperties;
                } else {
                    pp = pp.concat(item.otherProperties);
                }
            }

            if (pp !== undefined && pp !== null) {
                for (i in pp) {
                    prop = pp[i];
                    if (prop.name !== undefined && prop.value !== undefined) {
                        if (prop.name !== capitalizeFirstLetter(itemClass) + "Name") {
                            properties[prop.name] = prop.value;
                            if (prop.units !== undefined) {
                                properties[prop.name] += " " + prop.units;
                            }
                        }
                    } else {
                        for (key in prop) {
                            if (key !== "id") {
                                properties[prop.name] = prop[key];
                            }
                        }
                    }
                }
            }
        } else {
            pp = item[itemClass + "Properties"];
            if (pp !== undefined && pp !== null) {
                for (i in pp) {
                    prop = pp[i];
                    if (prop.name !== undefined && prop.stringValue !== undefined) {
                        if (prop.name !== capitalizeFirstLetter(itemClass) + "Name") {
                            properties[prop.name] = prop.stringValue;
                            if (prop.units !== undefined) {
                                properties[prop.name] += " " + prop.units;
                            }
                        }
                    }
                }
            }
        }

        // Split property list into two arrays for use in table-format in list view.
        var sortedPropKeys = Object.keys(properties).sort(),
            middle = Math.ceil(sortedPropKeys.length / 2),
            j;

        halfProperties1 = {};
        for (j = 0; j < middle; j++) {
            halfProperties1[sortedPropKeys[j]] = properties[sortedPropKeys[j]];
        }
        res.push(halfProperties1);

        halfProperties2 = {};
        for (j = middle; j < sortedPropKeys.length; j++) {
            halfProperties2[sortedPropKeys[j]] = properties[sortedPropKeys[j]];
        }

        res.push(halfProperties2);

        return res;
    };

    itemGenerator = function (item, itemClass) {
        var details = { properties: formatProperties(item, itemClass),
            icon: null,
            markdown: null };
        contentLibraryService.getXmlData(item.id, details);
        return {
            id: item.id,
            title: item.name.replace(/_/g, " "),
            toolTip: "Open item",
            headerTemplateUrl: "/componentBrowser/templates/itemHeader.html",
            detailsTemplateUrl: "/componentBrowser/templates/itemDetail.html",
            details: details
        };
    };

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return { config: config,
        itemGenerator: itemGenerator };
};

},{"../componentBrowser/services/componentLibrary.js":8,"../subcircuitBrowser/services/subcircuitLibrary.js":13}],3:[function(require,module,exports){
/**
 * Created by Blake McBride on 2/23/15.
 */

/*global angular, alert*/

"use strict";

angular.module("mms.componentBrowser.componentSearch", []).directive("componentSearch", function () {

    function ComponentSearchController() {

        var self;

        self = this;

        this.keydownInSearchField = function ($event) {

            if ($event.keyCode === 13) {
                self.doSearch();
            }
        };
    }

    return {
        restrict: "E",
        replace: true,
        controller: ComponentSearchController,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/componentSearch.html",
        scope: {
            searchText: "=",
            doSearch: "="
        }
    };
});

},{}],4:[function(require,module,exports){
/*global angular, alert, numeral*/

"use strict";

angular.module("mms.componentBrowser.countDisplay", []).directive("countDisplay", function () {

    function CountDisplayController($scope) {
        //            this.numeral = numeral;
        $scope.numeral = numeral;

        this.getItemsPerPage = function () {
            return self.itemsPerPage;
        };

        this.availableItemsPerPage = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    }

    return {
        restrict: "E",
        controller: CountDisplayController,
        controllerAs: "ctrl",
        bindToController: true,
        scope: {
            fromNumber: "=",
            toNumber: "=",
            totalCount: "=",
            itemsPerPage: "=",
            setItemsPerPage: "="
        },
        replace: true,
        templateUrl: "/componentBrowser/templates/countDisplay.html"
    };
});

},{}],5:[function(require,module,exports){

/*global angular*/

"use strict";
angular.module("mms.componentBrowser.downloadButton", []).directive("downloadButton", function () {

    return {
        restrict: "E",
        replace: true,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/downloadButton.html"
    };
});

},{}],6:[function(require,module,exports){
/**
 * Created by Blake McBride on 3/27/15.
 */

/*global angular*/

"use strict";
angular.module("mms.componentBrowser.infoButton", []).directive("infoButton", function () {

    return {
        restrict: "E",
        replace: true,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/infoButton.html"
    };
});

},{}],7:[function(require,module,exports){
/**
 * Created by Blake McBride on 2/24/15.
 */

/*global angular*/

"use strict";

angular.module("mms.componentBrowser.paging", []).directive("paging", function () {

    function PagingController() {

        var self;

        self = this;

        this.nextPage = function () {
            if (angular.isFunction(self.onNextPage)) {
                self.onNextPage();
            }
        };

        this.prevPage = function () {
            if (angular.isFunction(self.onPrevPage)) {
                self.onPrevPage();
            }
        };

        this.canNextPage = function () {

            var result = false;

            if (self.config && self.config.toNumber < self.config.totalCount) {
                result = true;
            }

            return result;
        };

        this.canPrevPage = function () {

            var result = false;

            if (self.config && self.config.fromNumber - self.config.itemsPerPage > 0) {
                result = true;
            }

            return result;
        };
    }

    return {

        restrict: "E",
        replace: false,
        controller: PagingController,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/paging.html",
        scope: {
            config: "=",
            onPrevPage: "=",
            onNextPage: "="
        }
    };
});

},{}],8:[function(require,module,exports){
/*globals angular*/

"use strict";

angular.module("mms.componentBrowser.componentLibrary", []).provider("componentLibrary", function ComponentLibraryProvider() {
    var serverUrl;

    this.setServerUrl = function (url) {
        serverUrl = url;
    };

    this.$get = ["$http", "$q", "$log", function ($http, $q, $log) {

        var ComponentLibrary, encodeCategoryPath;

        encodeCategoryPath = function (path) {
            return path.replace(/\//g, "!");
        };

        ComponentLibrary = function () {

            var classificationTree, subcircuitTree, grandTotal, subcircuitGrandTotal;

            this.getListOfComponents = function (categoryPath, itemCount, cursor) {

                var deferred = $q.defer();

                /*  Approach changed from getting all components in a category to getting all components in
                    the current category and all categories below.
                 */

                //url = serverUrl + '/components/list/' + encodeCategoryPath(categoryPath) +
                //    '/' + itemCount + '/' + cursor;
                //
                //$http.get(url)
                //
                //    .success(function (data) {
                //        deferred.resolve(data.components);
                //    })
                //    .error(function (e) {    // assume attempt to page past available components
                //        deferred.reject('Could not load list of components', e);
                //});

                $http.get(serverUrl + "/components/search" + "/" + encodeCategoryPath(categoryPath) + "/" + "_all" + "/" + itemCount + "/" + cursor).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject("Could not perform search", e);
                });

                return deferred.promise;
            };

            this.getListOfSubCircuits = function (categoryPath, itemCount, cursor) {

                var deferred = $q.defer();

                $http.get(serverUrl + "/subcircuit/list/" + encodeCategoryPath(categoryPath) + "/" + itemCount + "/" + cursor).success(function (data) {
                    deferred.resolve(data.subcircuits);
                }).error(function (e) {
                    // assume attempt to page past available components
                    deferred.reject("Could not load list of sub-circuits", e);
                });

                return deferred.promise;
            };

            this.getClassificationTree = function (id) {

                var deferred = $q.defer(),
                    url;

                url = serverUrl + "/classification/tree";

                if (angular.isString(id)) {
                    url += "/" + encodeCategoryPath(id);
                }

                $http.get(url).success(function (data) {

                    classificationTree = data.classes;
                    deferred.resolve(classificationTree);
                    grandTotal = data.grandTotal;
                }).error(function (data, status, headers, config) {
                    deferred.reject({
                        msg: "Could not load component classification tree",
                        data: data,
                        status: status,
                        headers: headers,
                        config: config
                    });
                });

                return deferred.promise;
            };

            this.getSubCircuitTree = function (id) {

                var deferred = $q.defer(),
                    url;

                url = serverUrl + "/subcircuit/classification/tree";

                if (angular.isString(id)) {
                    url += "/" + encodeCategoryPath(id);
                }

                $http.get(url).success(function (data) {

                    subcircuitTree = data.classes;
                    deferred.resolve(subcircuitTree);
                    subcircuitGrandTotal = data.grandTotal;
                }).error(function (data, status, headers, config) {
                    deferred.reject({
                        msg: "Could not load sub-circuit classification tree",
                        data: data,
                        status: status,
                        headers: headers,
                        config: config
                    });
                });

                return deferred.promise;
            };

            var downloadURL = function downloadURL(url) {
                var hiddenIFrameID = "hiddenDownloader",
                    iframe = document.getElementById(hiddenIFrameID);
                if (iframe === null) {
                    iframe = document.createElement("iframe");
                    iframe.id = hiddenIFrameID;
                    iframe.style.display = "none";
                    document.body.appendChild(iframe);
                }
                iframe.src = url;
            };

            this.downloadItem = function (id) {

                $log.debug("Download handler");

                console.log(serverUrl);

                window.location = serverUrl + "/getcomponent/download/" + id;
            };

            // TODO: cleanup subcircuit stuff

            this.downloadSubcircuit = function (id) {

                $log.debug("Download handler");

                $http.get(serverUrl + "/subcircuit/getsubcircuit/f/" + id).success(function (filename) {

                    downloadURL(serverUrl + "/" + filename);
                });
            };

            this.getGrandTotal = function () {
                return grandTotal;
            };

            this.getSubcircuitGrandTotal = function () {
                return subcircuitGrandTotal;
            };

            this.searchComponents = function (categoryPath, globalSearchText, itemCount, cursor, columnSearchText, sortColumns) {

                var deferred = $q.defer();

                globalSearchText = globalSearchText === undefined || globalSearchText === null || globalSearchText === "" ? "_all" : globalSearchText;

                sortColumns = sortColumns === undefined || sortColumns === null ? [] : sortColumns;

                var parameters = {};
                parameters.columnSearchText = columnSearchText;
                parameters.sortColumns = sortColumns;

                $http({
                    url: serverUrl + "/components/search" + "/" + encodeCategoryPath(categoryPath) + "/" + globalSearchText + "/" + itemCount + "/" + cursor,
                    method: "GET",
                    params: parameters
                }).success(function (data) {

                    if (data && angular.isArray(data.component) && data.component.length) {
                        deferred.resolve(data);
                    } else {
                        data = {};
                        data.component = []; //  no data
                        deferred.resolve(data);
                    }
                }).error(function (e) {
                    deferred.reject("Could not perform search", e);
                });

                return deferred.promise;
            };

            this.searchSubCircuits = function (categoryPath, globalSearchText, itemCount, cursor) {

                var deferred = $q.defer();

                globalSearchText = globalSearchText === undefined || globalSearchText === null || globalSearchText === "" ? "_all" : globalSearchText;

                $http({
                    url: serverUrl + "/subcircuit/search" + "/" + encodeCategoryPath(categoryPath) + "/" + globalSearchText + "/" + itemCount + "/" + cursor,
                    method: "GET"
                }).success(function (data) {

                    if (data && angular.isArray(data.subcircuit) && data.subcircuit.length) {
                        deferred.resolve(data);
                    } else {
                        data = {};
                        data.subcircuit = []; //  no data
                        deferred.resolve(data);
                    }
                }).error(function (e) {
                    deferred.reject("Could not perform search", e);
                });

                return deferred.promise;
            };

            this.getXmlData = function (id, details) {
                var path = serverUrl + "/getcomponent/info/" + id;
                return $http.get(path).then(function (json) {
                    details.icon = json.data.icon;

                    details.markdown = (function (markdownHtml) {
                        if (markdownHtml) {
                            var el = document.createElement("html"),
                                description = null,
                                pEls,
                                i;

                            el.innerHTML = markdownHtml;
                            pEls = el.getElementsByTagName("p");

                            for (i = 0; i < pEls.length; i++) {
                                if (pEls[i].textContent === "####Description" || pEls[i].textContent === "#### Description") {
                                    description = pEls[i + 1].textContent;
                                    break;
                                }
                            }
                            return description;
                        }
                    })(json.data.documentation);
                });
            };
        };

        return new ComponentLibrary();
    }];
});

},{}],9:[function(require,module,exports){
/*globals angular*/
"use strict";

angular.module("mms.subcircuitBrowser.config", []).constant("subcircuitServerUrl", "");

},{}],10:[function(require,module,exports){
/*global angular*/

"use strict";

//require('../subcircuitCategories/subcircuitCategories.js');
require("../../../componentBrowser/directives/componentSearch/componentSearch.js");
require("../subcircuitListing/subcircuitListing.js");
require("../../services/subcircuitLibrary.js");

angular.module("mms.subcircuitBrowser", [

//    'mms.subcircuitBrowser.subcircuitCategories',

"mms.componentBrowser.componentSearch", "mms.subcircuitBrowser.subcircuitListing", "mms.componentBrowser.templates", "mms.subcircuitBrowser.templates", "mms.subcircuitBrowser.subcircuitLibrary", "ngCookies"]).directive("subcircuitBrowser", function () {

    function SubcircuitBrowserController($scope, subcircuitLibrary, $log, $anchorScroll, $timeout, $cookies, $location) {

        var self, updateList, noSearchResults, loadState;

        self = this;

        this.showHeader = false;

        this.persistState = false;

        this.persistStateInUrl = false;

        this.selectedCategory = null;

        this.errorMessage = null;

        this.filtered = false;

        this.resultsForSearchText = null;

        this.componentsToList = null;

        this.searchText = null;

        this.facetedSearch = null; // the json for faceted search

        this.columnSearchText = {};

        this.listingView = "ListView";

        this.columnSortInfo = [];

        this.lockGridColumns = false; // faceted search locks grid columns so they don't jump around while you are searching

        this.setFacetedSearch = function (fs) {
            self.facetedSearch = fs;
        };

        this.onCategorySelectionChange = function () {

            self.searchText = null;
            console.log("inhere");

            self.pagingParameters.cursor = 0;
            self.filtered = false;

            $anchorScroll();

            updateList();

            self.saveState();
        };

        this.pagingParameters = {
            itemsPerPage: 20,
            cursor: 0
        };

        this.setItemsPerPage = function (ipp) {
            self.pagingParameters.itemsPerPage = ipp;
            updateList();
        };

        this.getNextPage = function () {

            var nextCursor;

            console.log("next");

            nextCursor = self.pagingParameters.cursor + self.pagingParameters.itemsPerPage;

            if (nextCursor < self.pagingParameters.totalCount) {

                self.pagingParameters.cursor = nextCursor;
                updateList();
            }

            self.saveState();
        };

        this.getPrevPage = function () {

            console.log("prev");

            self.pagingParameters.cursor = Math.max(self.pagingParameters.cursor - self.pagingParameters.itemsPerPage, 0);

            updateList();

            self.saveState();
        };

        this.newData = function (results) {
            console.log("Search results", results);
            if (results.subcircuit.length === 0 && self.facetedSearch === null) {
                noSearchResults();

                self.saveState();

                return;
            }
            self.componentsToList = results.subcircuit;

            self.pagingParameters.cursor = 0;
            self.pagingParameters.fromNumber = 1;
            self.pagingParameters.totalCount = results.total;

            self.pagingParameters.toNumber = Math.min(self.pagingParameters.cursor + self.pagingParameters.itemsPerPage, self.pagingParameters.totalCount);

            self.filtered = true;
            self.resultsForSearchText = self.searchText;

            self.saveState();
        };

        this.getSearchResults = function () {
            subcircuitLibrary.searchSubCircuits(self.selectedCategory && self.selectedCategory.path || "!", self.searchText, self.pagingParameters.itemsPerPage, self.pagingParameters.cursor, self.facetedSearch).then(self.newData)["catch"](function (e) {
                $log.warn("No results:", e);
                self.componentsToList = null;
                noSearchResults();
            });
        };

        loadState = function () {

            var state, locationSearchObject;

            if (self.persistState && $cookies.subcircuitBrowserState) {

                state = JSON.parse($cookies.subcircuitBrowserState);

                angular.extend(self, state);
            }

            if (self.persistStateInUrl) {

                locationSearchObject = $location.search();

                if (locationSearchObject && typeof locationSearchObject.s === "string") {

                    state = JSON.parse(locationSearchObject.s);

                    angular.extend(self, state);
                }
            }
        };

        this.onListingViewSelection = function (view) {

            self.listingView = view;
            self.saveState();
        };

        this.saveState = function () {

            var state = {};

            if (this.persistState || this.persistStateInUrl) {

                //state.searchText = this.searchText; // TODO: make this work
                //state.pagingParameters = this.pagingParameters; // TODO: make this work
                //state.columnSearchText = this.columnSearchText; // TODO: make this work

                state.selectedCategory = this.selectedCategory; // TODO: make tree navigate to category
                state.listingView = this.listingView;

                var stateObjectJSON = JSON.stringify(state);

                if (this.persistState) {
                    $cookies.subcircuitBrowserState = stateObjectJSON;
                }

                if (this.persistStateInUrl) {
                    $location.search({ s: stateObjectJSON });
                }
            }
        };

        noSearchResults = function () {
            self.pagingParameters.cursor = 0;
            self.filtered = false;
            self.componentsToList = null;
            self.errorMessage = "No search results for \"" + self.searchText + "\"";
        };

        updateList = function () {

            self.errorMessage = null;

            if (self.selectedCategory || self.filtered) {

                if (!self.filtered) {

                    angular.extend(self.pagingParameters, {

                        fromNumber: self.pagingParameters.cursor + 1,
                        toNumber: Math.min(self.pagingParameters.cursor + self.pagingParameters.itemsPerPage, self.selectedCategory.childComponentsCount),
                        totalCount: self.selectedCategory.childComponentsCount

                    });

                    subcircuitLibrary.getListOfSubCircuits(self.selectedCategory.path, self.pagingParameters.itemsPerPage, self.pagingParameters.cursor).then(function (data) {
                        //console.log('componentsToList: ', data);
                        $timeout(function () {
                            self.componentsToList = data.subcircuit;
                        });
                        self.pagingParameters.totalCount = data.total;
                        self.pagingParameters.toNumber = Math.min(self.pagingParameters.cursor + self.pagingParameters.itemsPerPage, self.pagingParameters.totalCount);
                    })["catch"](function (e) {
                        $log.error("Components could not be loaded", e);
                    });
                } else {

                    angular.extend(self.pagingParameters, {

                        fromNumber: self.pagingParameters.cursor + 1,
                        toNumber: Math.min(self.pagingParameters.cursor + self.pagingParameters.itemsPerPage, self.pagingParameters.totalCount)

                    });

                    subcircuitLibrary.searchSubCircuits(self.selectedCategory && self.selectedCategory.path || "!", self.searchText, self.pagingParameters.itemsPerPage, self.pagingParameters.cursor, self.facetedSearch, self.columnSortInfo).then(function (results) {

                        console.log("Search results", results);
                        if (results.subcircuit.length === 0 && self.facetedSearch === null) {
                            noSearchResults();
                            return;
                        }

                        self.componentsToList = results.subcircuit;

                        self.pagingParameters.toNumber = Math.min(self.pagingParameters.cursor + self.pagingParameters.itemsPerPage, self.pagingParameters.totalCount);

                        self.filtered = true;
                    })["catch"](function (e) {
                        $log.warn("No results:", e);
                        noSearchResults();
                    });
                }
            }
        };

        // $scope.$watch(function () {
        //    return self.categoryToList;
        // }, function (newValue, oldValue) {

        //    if (newValue && newValue !== oldValue) {
        //        update();
        //    }

        // });

        this.init = function () {

            loadState();
            this.getSearchResults();
            updateList();
        };
    }

    return {
        restrict: "E",
        scope: {
            selectedView: "=",
            onItemDragStart: "=",
            onItemDragEnd: "="
        },
        replace: true,
        controller: SubcircuitBrowserController,
        bindToController: true,
        controllerAs: "ctrl",
        templateUrl: "/subcircuitBrowser/templates/subcircuitBrowser.html",
        require: "subcircuitBrowser",
        link: function link(scope, element, attributes, ctrl) {

            if (attributes.hasOwnProperty("noHeader")) {
                ctrl.showHeader = false;
            } else {
                ctrl.showHeader = true;
            }

            if (attributes.hasOwnProperty("persistState")) {
                ctrl.persistState = true;
            } else {
                ctrl.persistState = false;
            }

            if (attributes.hasOwnProperty("persistStateInUrl")) {
                ctrl.persistStateInUrl = true;
            } else {
                ctrl.persistStateInUrl = false;
            }

            if (attributes.hasOwnProperty("noDownload")) {
                ctrl.noDownload = true;
            } else {
                ctrl.noDownload = false;
            }

            ctrl.init();
        }
    };
});

},{"../../../componentBrowser/directives/componentSearch/componentSearch.js":3,"../../services/subcircuitLibrary.js":13,"../subcircuitListing/subcircuitListing.js":12}],11:[function(require,module,exports){
/**
 * Created by Robert Boyles on 5/28/15.
 */

/*global angular*/

"use strict";

require("../../services/subcircuitLibrary.js");
require("../../../componentBrowser/directives/downloadButton/downloadButton.js");
require("../../../componentBrowser/directives/infoButton/infoButton.js");
var listViewBase = require("../../../common/listViewBase.js");

angular.module("mms.subcircuitBrowser.subcircuitListView", ["isis.ui.itemList", "mms.subcircuitBrowser.subcircuitLibrary", "mms.componentBrowser.downloadButton", "mms.componentBrowser.infoButton"]).controller("SubcircuitListViewItemController", function ($scope) {
    console.log($scope);
    //debugger;
}).directive("subcircuitListView", function () {

    function SubcircuitDetailsController($scope) {

        var commonList = listViewBase.call(this, $scope, this.contentLibraryService);

        var config = commonList.config,
            self,
            renderList;

        self = this;

        console.log(self.noDownload);

        this.listData = {
            items: []
        };

        if (typeof this.onItemDragStart === "function" && typeof this.onItemDragEnd === "function") {

            config.onItemDragStart = function (e, item) {
                self.onItemDragStart(e, item);
            };

            config.onItemDragEnd = function (e, item) {
                self.onItemDragEnd(e, item);
            };
        }

        this.config = config;

        renderList = function () {

            var comps = [];

            for (var i in self.components) {
                var comp = self.components[i],
                    item = commonList.itemGenerator(comp, "subcircuit");

                comps.push(item);
            }
            self.listData.items = comps;
        };

        $scope.$watchCollection(function () {
            return self.components;
        }, function () {
            renderList();
        });

        renderList();
    }

    return {
        restrict: "E",
        replace: true,
        controller: SubcircuitDetailsController,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/subcircuitBrowser/templates/subcircuitListView.html",
        scope: {
            components: "=",
            onItemDragStart: "=",
            onItemDragEnd: "=",
            noDownload: "=",
            contentLibraryService: "="
        }
    };
});

},{"../../../common/listViewBase.js":2,"../../../componentBrowser/directives/downloadButton/downloadButton.js":5,"../../../componentBrowser/directives/infoButton/infoButton.js":6,"../../services/subcircuitLibrary.js":13}],12:[function(require,module,exports){
/**
 * Created by Blake McBride on 2/23/15.
 */

/*global angular, alert*/

"use strict";

require("../subcircuitListView/subcircuitListView.js");
//require('../gridView/gridView.js');
require("../../../componentBrowser/directives/countDisplay/countDisplay.js");
//require('../../../componentBrowser/directives/viewSelection/viewSelection.js');
require("../../../componentBrowser/directives/paging/paging.js");
require("../../services/subcircuitLibrary.js");

angular.module("mms.subcircuitBrowser.subcircuitListing", ["mms.subcircuitBrowser.subcircuitListView",
//    'mms.componentBrowser.gridView',
//    'mms.componentBrowser.viewSelection',
"mms.componentBrowser.countDisplay", "mms.componentBrowser.paging", "mms.subcircuitBrowser.subcircuitLibrary"]).directive("subcircuitListing", function (subcircuitLibrary) {

    function SubcircuitListingController() {

        var self = this;

        this.selectedView = "ListView";

        this.contentLibraryService = subcircuitLibrary;

        this.onViewSelection = function (view) {

            if (typeof self.onListingViewSelection === "function") {
                self.onListingViewSelection({
                    view: view
                });
            }
        };
    }

    return {
        restrict: "E",
        controller: SubcircuitListingController,
        controllerAs: "ctrl",
        bindToController: true,
        scope: {
            componentsToList: "=",
            pagingParameters: "=",
            getNextPage: "=",
            getPrevPage: "=",
            selectedCategory: "=",
            searchText: "=",
            columnSearchText: "=",
            columnSortInfo: "=",
            newData: "=",
            facetedSearch: "=",
            setFacetedSearch: "=",
            lockGridColumns: "=",
            //            selectedView: '=',
            onListingViewSelection: "&",
            onItemDragStart: "=",
            onItemDragEnd: "=",
            noDownload: "=",
            setItemsPerPage: "="
        },
        replace: true,
        templateUrl: "/subcircuitBrowser/templates/subcircuitListing.html"
    };
});

},{"../../../componentBrowser/directives/countDisplay/countDisplay.js":4,"../../../componentBrowser/directives/paging/paging.js":7,"../../services/subcircuitLibrary.js":13,"../subcircuitListView/subcircuitListView.js":11}],13:[function(require,module,exports){
/*globals angular*/

"use strict";

angular.module("mms.subcircuitBrowser.subcircuitLibrary", []).provider("subcircuitLibrary", function SubcircuitLibraryProvider() {
    var serverUrl;

    this.setServerUrl = function (url) {
        serverUrl = url;
    };

    this.$get = ["$http", "$q", "$log", function ($http, $q, $log) {

        var SubcircuitLibrary, encodeCategoryPath;

        encodeCategoryPath = function (path) {
            return path.replace(/\//g, "!");
        };

        SubcircuitLibrary = function () {

            var subcircuitTree, subcircuitGrandTotal;

            this.getListOfSubCircuits = function (categoryPath, itemCount, cursor) {

                var deferred = $q.defer();

                $http.get(serverUrl + "/subcircuit/search" + "/" + encodeCategoryPath(categoryPath) + "/" + "_all" + "/" + itemCount + "/" + cursor).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    // assume attempt to page past available components
                    deferred.reject("Could not load list of sub-circuits", e);
                });

                return deferred.promise;
            };

            this.getSubCircuitTree = function (id) {

                var deferred = $q.defer(),
                    url;

                url = serverUrl + "/subcircuit/classification/tree";

                if (angular.isString(id)) {
                    url += "/" + encodeCategoryPath(id);
                }

                $http.get(url).success(function (data) {

                    subcircuitTree = data.classes;
                    deferred.resolve(subcircuitTree);
                    subcircuitGrandTotal = data.grandTotal;
                }).error(function (data, status, headers, config) {
                    deferred.reject({
                        msg: "Could not load sub-circuit classification tree",
                        data: data,
                        status: status,
                        headers: headers,
                        config: config
                    });
                });

                return deferred.promise;
            };

            var downloadURL = function downloadURL(url) {
                var hiddenIFrameID = "hiddenDownloader",
                    iframe = document.getElementById(hiddenIFrameID);
                if (iframe === null) {
                    iframe = document.createElement("iframe");
                    iframe.id = hiddenIFrameID;
                    iframe.style.display = "none";
                    document.body.appendChild(iframe);
                }
                iframe.src = url;
            };

            this.downloadItem = function (id) {

                $log.debug("Download handler");

                $http.get(serverUrl + "/subcircuit/getsubcircuit/f/" + id).success(function (filename) {

                    downloadURL(serverUrl + "/" + filename);
                });
            };

            this.getSubcircuitGrandTotal = function () {
                return subcircuitGrandTotal;
            };

            this.searchSubCircuits = function (categoryPath, globalSearchText, itemCount, cursor) {

                console.log(serverUrl + "/subcircuit/search" + "/" + encodeCategoryPath(categoryPath) + "/" + globalSearchText + "/" + itemCount + "/" + cursor);

                var deferred = $q.defer();

                globalSearchText = globalSearchText === undefined || globalSearchText === null || globalSearchText === "" ? "_all" : globalSearchText;

                console.log(globalSearchText);

                $http({
                    url: serverUrl + "/subcircuit/search" + "/" + encodeCategoryPath(categoryPath) + "/" + globalSearchText + "/" + itemCount + "/" + cursor,
                    method: "GET"
                }).success(function (data) {

                    if (data && angular.isArray(data.subcircuit) && data.subcircuit.length) {
                        deferred.resolve(data);
                    } else {
                        data = {};
                        data.subcircuit = []; //  no data
                        deferred.resolve(data);
                    }
                }).error(function (e) {
                    deferred.reject("Could not perform search", e);
                });

                return deferred.promise;
            };

            this.getXmlData = function (id, details) {
                var path = serverUrl + "/subcircuit/getsubcircuit/info/" + id;
                return $http.get(path).then(function (json) {
                    details.icon = json.data.icon;

                    details.markdown = (function (markdownHtml) {
                        if (markdownHtml) {
                            var el = document.createElement("html"),
                                description = null,
                                pEls,
                                i;

                            el.innerHTML = markdownHtml;
                            pEls = el.getElementsByTagName("p");

                            for (i = 0; i < pEls.length; i++) {
                                if (pEls[i].textContent === "####Description" || pEls[i].textContent === "#### Description") {
                                    description = pEls[i + 1].textContent;
                                    break;
                                }
                            }
                            return description;
                        }
                    })(json.data.documentation);
                });
            };
        };

        return new SubcircuitLibrary();
    }];
});

},{}]},{},[1])


//# sourceMappingURL=subcircuitBrowser.js.map
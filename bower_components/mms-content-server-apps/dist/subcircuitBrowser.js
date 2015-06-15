(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
/*globals angular*/

},{"./appConfig":11,"./directives/subcircuitBrowser/subcircuitBrowser":12,"./services/subcircuitLibrary.js":17}],2:[function(require,module,exports){
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
            pp,
            i,
            prop,
            key;

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

        var sortedPropKeys = Object.keys(properties).sort(),
            j;

        for (j = 0; j < sortedPropKeys.length; j++) {

            res.push({
                name: sortedPropKeys[j],
                value: properties[sortedPropKeys[j]]
            });
        }

        return res;
    };

    itemGenerator = function (item, itemClass, templateUrlBase) {

        var details = {
            properties: formatProperties(item, itemClass),
            markdown: null,
            documentation: {
                id: item.id,
                description: item.description,
                connectors: null,
                visuals: null,
                icon: null
            }

        };

        contentLibraryService.getDetails(item.id, details);

        return {
            id: item.id,
            title: item.name.replace(/_/g, " "),
            toolTip: "Open item",
            headerTemplateUrl: templateUrlBase + "itemHeader.html",
            detailsTemplateUrl: templateUrlBase + "itemDetail.html",
            details: details
        };
    };

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return { config: config,
        itemGenerator: itemGenerator };
};

},{"../componentBrowser/services/componentLibrary.js":10,"../subcircuitBrowser/services/subcircuitLibrary.js":17}],3:[function(require,module,exports){
"use strict";

angular.module("mms.contentBrowser.categoryResizer", ["ngCookies"]).directive("categoryResizer", function ($cookies, $timeout) {

    function ResizerController() {

        this._startingWidth = 300;
        this._minWidth = 200;
        this._maxWidth = 500;

        this._panelDragging = false;
        this._potentialPanelDragStart = null;
        this._widthBeforePanelDragging = null;

        this._widthAllowance = null;
    }

    ResizerController.prototype.getWidth = function () {
        return this._width;
    };

    ResizerController.prototype.setWidth = function (width) {

        if (!isNaN(width) && width >= this._minWidth && width <= this._maxWidth) {

            this._width = width;

            this._updateResizerPosition();

            if (this._categoryPanelEl) {
                this._categoryPanelEl.style.width = Math.floor(this._width) + "px";
            }

            if (this._detailPanelEl) {
                this._detailPanelEl.style.width = Math.floor(this._widthAllowance - this._width) + "px";
            }

            $timeout(function () {
                $cookies.categoryWidth = width;
            });
        } else {
            this._stopPanelDragging();
        }
    };

    ResizerController.prototype._updateResizerPosition = function () {

        this._resizerEl.style.left = this._width + "px";
    };

    ResizerController.prototype._init = function () {

        this._widthAllowance = parseInt(getComputedStyle(this._resizerEl.parentElement).width.slice(0, -2), 10);
        this.setWidth(this._startingWidth);
    };

    ResizerController.prototype.panelMouseDown = function ($event) {

        if (!this._panelDragging) {
            this._potentialPanelDragStart = $event.clientX;
            $event.preventDefault();
        }
    };

    ResizerController.prototype._startPanelDragging = function () {

        this._panelDragging = true;
        this._widthBeforePanelDragging = this.getWidth();
        this._widthAllowance = parseInt(getComputedStyle(this._resizerEl.parentElement).width.slice(0, -2), 10);
    };

    ResizerController.prototype._stopPanelDragging = function () {
        this._panelDragging = false;
    };

    ResizerController.prototype._resizerMouseUp = function () {

        this._potentialPanelDragStart = null;

        if (this._panelDragging) {
            this._stopPanelDragging();
        }
    };

    ResizerController.prototype._resizerMouseMove = function ($event) {

        var newwidth, offset;

        if (!this._panelDragging && this._potentialPanelDragStart != null) {
            this._startPanelDragging();
        }

        if (this._panelDragging) {

            newwidth = this._widthBeforePanelDragging + ($event.clientX - this._potentialPanelDragStart);

            offset = Math.min(newwidth, this._widthAllowance) - this._width;

            this.setWidth(Math.min(newwidth, this._widthAllowance), offset);
        }
    };

    ResizerController.prototype._correctResizerHeight = function () {
        this._resizerEl.style.height = this._categoryPanelEl.style.height;
    };

    return {
        restrict: "E",
        scope: true,
        controller: ResizerController,
        controllerAs: "ctrl",
        bindToController: true,
        replace: true,
        transclude: true,
        templateUrl: "/componentBrowser/templates/categoryResizer.html",
        require: ["categoryResizer"],
        link: function link(scope, element, attributes, controllers) {

            var ctrl = controllers[0],
                boundResizerMouseUp = ctrl._resizerMouseUp.bind(ctrl),
                boundResizerMouseMove = ctrl._resizerMouseMove.bind(ctrl),
                boundParentWindowResize = ctrl._init.bind(ctrl),
                parentElement;

            ctrl._resizerEl = element[0];

            if ($cookies.categoryWidth && !isNaN($cookies.categoryWidth)) {
                ctrl._startingWidth = parseInt($cookies.categoryWidth, 10);
            } else if (attributes.startingWidth && !isNaN(attributes.startingWidth)) {
                ctrl._startingWidth = attributes.startingWidth;
            }

            if (attributes.minWidth && !isNaN(attributes.minWidth)) {
                ctrl._minWidth = attributes.minWidth;
            }

            if (attributes.maxWidth && !isNaN(attributes.maxWidth)) {
                ctrl._maxWidth = attributes.maxWidth;
            }

            parentElement = ctrl._resizerEl.parentElement;

            ctrl._categoryPanelEl = parentElement.querySelector(".left-panel");
            ctrl._detailPanelEl = parentElement.querySelector(".main-container-panel");

            ctrl._init();

            ctrl._padding = parseInt(getComputedStyle(ctrl._resizerEl).width.slice(0, -2), 10);

            document.addEventListener("mouseup", boundResizerMouseUp);
            document.addEventListener("mousemove", boundResizerMouseMove);
            window.addEventListener("resize", boundParentWindowResize);

            if (ctrl._categoryPanelEl) {
                ctrl._correctResizerHeight();
            }

            scope.$on("$destroy", function () {

                if (ctrl._resizerEl) {
                    document.removeEventListener("mouseup", boundResizerMouseUp);
                    document.removeEventListener("mousemove", boundResizerMouseMove);
                    window.removeEventListener("resize", boundParentWindowResize);
                }
            });
        }
    };
});
/*global angular*/

},{}],4:[function(require,module,exports){
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
/**
 * Created by Blake McBride on 2/23/15.
 */

/*global angular, alert*/

},{}],5:[function(require,module,exports){
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
/*global angular, alert, numeral*/

},{}],6:[function(require,module,exports){
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

/*global angular*/

},{}],7:[function(require,module,exports){
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
/**
 * Created by Blake McBride on 2/24/15.
 */

/*global angular*/

},{}],8:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.showLessButton", []).directive("showLessButton", function () {

    return {
        restrict: "E",
        replace: true,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/showLessButton.html"
    };
});
/*global angular*/

},{}],9:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.showMoreButton", []).directive("showMoreButton", function () {

    return {
        restrict: "E",
        replace: true,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/showMoreButton.html"
    };
});
/*global angular*/

},{}],10:[function(require,module,exports){
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

            this.getDetails = function (id, details) {
                var path = serverUrl + "/getcomponent/info/" + id;
                return $http.get(path).then(function (json) {

                    details.documentation.icon = json.data.icon;

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
/*globals angular*/

},{}],11:[function(require,module,exports){
"use strict";

/*globals angular*/
angular.module("mms.subcircuitBrowser.config", []).constant("subcircuitServerUrl", "http://localhost:3000");

},{}],12:[function(require,module,exports){
"use strict";

require("../subcircuitCategories/subcircuitCategories.js");
require("../../../componentBrowser/directives/componentSearch/componentSearch.js");
require("../subcircuitListing/subcircuitListing.js");
require("../../services/subcircuitLibrary.js");
require("../../../componentBrowser/directives/categoryResizer/categoryResizer.js");

angular.module("mms.subcircuitBrowser", ["mms.subcircuitBrowser.subcircuitCategories", "mms.componentBrowser.componentSearch", "mms.subcircuitBrowser.subcircuitListing", "mms.componentBrowser.templates", "mms.subcircuitBrowser.templates", "mms.subcircuitBrowser.subcircuitLibrary", "mms.contentBrowser.categoryResizer", "ngCookies"]).directive("subcircuitBrowser", function () {

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
            self.resultsForSearchText = null;

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

            if (attributes.hasOwnProperty("embedded")) {
                ctrl.embedded = true;
            } else {
                ctrl.embedded = false;
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
/*global angular*/

},{"../../../componentBrowser/directives/categoryResizer/categoryResizer.js":3,"../../../componentBrowser/directives/componentSearch/componentSearch.js":4,"../../services/subcircuitLibrary.js":17,"../subcircuitCategories/subcircuitCategories.js":13,"../subcircuitListing/subcircuitListing.js":16}],13:[function(require,module,exports){
"use strict";

require("../../services/subcircuitLibrary.js");

angular.module("mms.subcircuitBrowser.subcircuitCategories", ["isis.ui.treeNavigator", "mms.subcircuitBrowser.subcircuitLibrary"]).directive("subcircuitCategories", function () {

    function SubcircuitCategoriesController($q, subcircuitLibrary, $timeout) {

        var self = this;

        var addData = (function (_addData) {
            var _addDataWrapper = function addData(_x, _x2) {
                return _addData.apply(this, arguments);
            };

            _addDataWrapper.toString = function () {
                return _addData.toString();
            };

            return _addDataWrapper;
        })(function (parent, array) {
            var children = [];
            for (var i in array) {
                var e = array[i];
                var n = addNode(parent, e.label, e.id, i, e);
                children.push(n);
                if (e.subClasses !== undefined) {
                    addData(n, e.subClasses);
                }
            }
            return children;
        });

        var config,
            treeNodes = {},
            addNode;

        addNode = function (parentTreeNode, lbl, id, i, e) {

            var newTreeNode,
                children = [];

            // node structure
            newTreeNode = {
                id: id,
                label: lbl,
                extraInfo: e && !isNaN(e.categoryTotal) && "[" + e.categoryTotal + "]",
                children: children,
                childrenCount: e === undefined ? 0 : e.childCategoriesCount,
                nodeData: {
                    label: lbl,
                    path: e === undefined ? "" : e.id,
                    childComponentsCount: e === undefined ? 0 : e.childComponentsCount
                },
                iconClass: null,

                draggable: false,
                order: i
            };

            // add the new node to the map
            treeNodes[newTreeNode.id] = newTreeNode;

            if (parentTreeNode) {
                // if a parent was given add the new node as a child node
                parentTreeNode.iconClass = undefined;
                parentTreeNode.children.push(newTreeNode);

                //                parentTreeNode.childrenCount = parentTreeNode.children.length;

                if (newTreeNode.childrenCount) {
                    newTreeNode.iconClass = undefined;
                }

                //               sortChildren( parentTreeNode.children );

                newTreeNode.parentId = parentTreeNode.id;
            } else {

                // if no parent is given replace the current root node with this node
                self.treeData = newTreeNode;
                self.treeData.unCollapsible = true;
                newTreeNode.parentId = null;
            }

            return newTreeNode;
        };

        config = {

            scopeMenu: [{
                items: []
            }],

            loadChildren: function loadChildren(e, node) {
                console.log("loadChildren called:", node);
                var deferred = $q.defer();

                subcircuitLibrary.getSubCircuitTree(node.nodeData.path).then(function (data) {

                    var children;

                    children = addData(node, data);
                    deferred.resolve(children);
                });

                return deferred.promise;
            },

            showRootLabel: false,

            // Tree Event callbacks

            nodeClick: function nodeClick(e, node) {

                self.lockGridColumns = false;
                console.log("clicked");

                if (!self.selectedCategory || self.selectedCategory.path !== node.nodeData.path) {

                    self.selectedCategory = node.nodeData;

                    if (angular.isFunction(self.onSelectionChange)) {

                        $timeout(self.onSelectionChange);
                    }
                }
            },

            nodeDblclick: function nodeDblclick(e, node) {
                console.log("Node was double-clicked:", node);
            },

            nodeExpanderClick: function nodeExpanderClick(e, node, isExpand) {
                console.log("Expander was clicked for node:", node, isExpand);
            }

        };

        self.config = config;
        //self.config.disableManualSelection = true;
        self.config.selectedScope = self.config.scopeMenu[0].items[0];
        self.config.nodeClassGetter = function (node) {
            var nodeCssClass = "";

            if (node.order % 2 === 0) {
                nodeCssClass = "even";
            }

            return nodeCssClass;
        };
        self.treeData = {};
        self.config.state = {
            // id of activeNode
            activeNode: "Node item 0.0",

            // ids of selected nodes
            selectedNodes: ["Node item 0.0"],

            expandedNodes: ["Node item 0", "Node item 0.1"],

            // id of active scope
            activeScope: "project"
        };

        addNode(null, "Components", "Components");
        subcircuitLibrary.getSubCircuitTree().then(function (data) {
            addData(self.treeData, data);
        });
    }

    return {
        restrict: "E",
        controller: SubcircuitCategoriesController,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/subcircuitBrowser/templates/subcircuitCategories.html",
        scope: {
            selectedCategory: "=",
            onSelectionChange: "=",
            lockGridColumns: "="
        }
    };
});
/*global angular*/

/**
 * Created by Blake McBride on 2/9/15.
 */

},{"../../services/subcircuitLibrary.js":17}],14:[function(require,module,exports){
"use strict";

angular.module("mms.subcircuitDetails.react", []).directive("subcircuitDetails", function () {

    function SubcircuitDetailsController() {}

    return {
        restrict: "E",
        controller: SubcircuitDetailsController,
        controllerAs: "ctrl",
        bindToController: true,
        replace: true,
        transclude: false,
        template: "<div class=\"subcircuit-details\"></div>",
        scope: {
            details: "="
        },
        require: ["subcircuitDetails"],
        link: function link(scope, element, attr, controllers) {

            var ctrl = controllers[0];

            function cleanup() {
                React.unmountComponentAtNode(element[0]);
            }

            function render() {
                React.render(React.createElement(SubcircuitDetailsGrid, { details: ctrl.details }), element[0]);
            }

            scope.$watch(function () {
                if (ctrl.details) {
                    return ctrl.details;
                }
            }, function (newO, oldO) {

                if ((oldO !== newO || oldO != null) && newO != null) {

                    cleanup();
                    render();
                }
            });

            scope.$on("$destroy", cleanup());
        }
    };
});

var SubcircuitDetailsGrid = React.createClass({
    displayName: "SubcircuitDetailsGrid",

    render: function render() {

        var className = "subcircuit-details-grid",
            subcircuitVisuals;

        if (!this.props.details.visuals) {
            className += " no-visuals";
        } else {
            subcircuitVisuals = React.createElement(SubcircuitVisuals, { images: this.props.details.visuals });
        }

        return React.createElement(
            "div",
            { className: className },
            React.createElement(SubcircuitDescription, { description: this.props.details.description, icon: this.props.details.icon }),
            subcircuitVisuals,
            React.createElement(ConnectorsDescription, { connectors: this.props.details.connectors })
        );
    }
});

var SubcircuitDescription = React.createClass({
    displayName: "SubcircuitDescription",

    render: function render() {

        var self = this,
            className = "subcircuit-description",
            icon;

        if (!this.props.icon) {
            className += " no-icon";
        } else {
            icon = React.createElement("img", { src: this.props.icon, className: "subcircuit-icon" });
        }

        return React.createElement(
            "div",
            { className: className },
            React.createElement(
                "div",
                { className: "subcircuit-description-text" },
                this.props.description
            ),
            React.createElement(
                "div",
                { className: "subcircuit-icon-container" },
                icon
            )
        );
    }
});

var SubcircuitVisuals = React.createClass({
    displayName: "SubcircuitVisuals",

    render: function render() {

        var self = this,
            activeVisual = 0;

        var images = this.props.images.map(function (imageUrl, index) {

            var className = "subcircuit-visual";

            if (index === activeVisual) {
                className += " active";
            }

            return React.createElement("img", { src: imageUrl, className: className });
        });

        return React.createElement(
            "div",
            { className: "subcircuit-visuals" },
            images
        );
    }
});

var ConnectorsDescription = React.createClass({
    displayName: "ConnectorsDescription",

    render: function render() {

        var title, connectors;

        if (Array.isArray(this.props.connectors)) {

            title = React.createElement(
                "h3",
                null,
                "Connectors:"
            );

            connectors = Array.isArray(this.props.connectors) && this.props.connectors.map(function (connectorDescription) {
                return React.createElement(ConnectorDescription, { connector: connectorDescription });
            });
        }

        return React.createElement(
            "div",
            { className: "connectors-description" },
            title,
            connectors
        );
    }
});

var ConnectorDescription = React.createClass({
    displayName: "ConnectorDescription",

    render: function render() {

        var connectorDetails = [],
            cssClass = "connector-description";

        connectorDetails.push(React.createElement(
            "div",
            { className: "connector-name" },
            this.props.connector.name
        ));

        if (this.props.connector.type) {

            connectorDetails.push(React.createElement(
                "div",
                { className: "connector-type" },
                this.props.connector.type
            ));
            cssClass += " " + this.props.connector.type;
        }

        if (this.props.connector.description) {
            connectorDetails.push(React.createElement(
                "div",
                { className: "connector-description-text" },
                this.props.connector.description
            ));
        }

        return React.createElement(
            "div",
            { className: cssClass },
            connectorDetails
        );
    }
});

},{}],15:[function(require,module,exports){
"use strict";

require("..//subcircuitDetails/subcircuitDetails.jsx");
require("../../services/subcircuitLibrary.js");
require("../../../componentBrowser/directives/downloadButton/downloadButton.js");
require("../../../componentBrowser/directives/showMoreButton/showMoreButton.js");
require("../../../componentBrowser/directives/showLessButton/showLessButton.js");

var listViewBase = require("../../../common/listViewBase.js");

angular.module("mms.subcircuitBrowser.subcircuitListView", ["isis.ui.itemList", "mms.subcircuitBrowser.subcircuitLibrary", "mms.componentBrowser.downloadButton", "mms.componentBrowser.showMoreButton", "mms.componentBrowser.showLessButton", "mms.subcircuitDetails.react"]).controller("SubcircuitListViewItemController", function ($scope) {
    console.log($scope);
    //debugger;
}).directive("subcircuitListView", function () {

    function SubcircuitDetailsController($scope) {

        var commonList = listViewBase.call(this, $scope, this.contentLibraryService);

        var config = commonList.config,
            self,
            renderList;

        self = this;

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
                    item = commonList.itemGenerator(comp, "subcircuit", "/subcircuitBrowser/templates/");

                item.expandDetails = self.expandDetails;

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

        this.expandDetails = function (item) {

            self.contentLibraryService.getDetails(item.id, item.details).then(function (documentation) {

                item.details.documentation = documentation;
                item.expandedDetails = true;
            });
        };
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
/**
 * Created by Robert Boyles on 5/28/15.
 */

/*global angular*/

},{"../../../common/listViewBase.js":2,"../../../componentBrowser/directives/downloadButton/downloadButton.js":6,"../../../componentBrowser/directives/showLessButton/showLessButton.js":8,"../../../componentBrowser/directives/showMoreButton/showMoreButton.js":9,"../../services/subcircuitLibrary.js":17,"..//subcircuitDetails/subcircuitDetails.jsx":14}],16:[function(require,module,exports){
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
            setItemsPerPage: "=",
            resultsForSearchText: "="
        },
        replace: true,
        templateUrl: "/subcircuitBrowser/templates/subcircuitListing.html"
    };
});
/**
 * Created by Blake McBride on 2/23/15.
 */

/*global angular, alert*/

},{"../../../componentBrowser/directives/countDisplay/countDisplay.js":5,"../../../componentBrowser/directives/paging/paging.js":7,"../../services/subcircuitLibrary.js":17,"../subcircuitListView/subcircuitListView.js":15}],17:[function(require,module,exports){
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

            this.getDetails = function (id) {

                var path = serverUrl + "/subcircuit/overview/" + id,
                    deferred = $q.defer();

                $http.get(path).then(function (json) {

                    var documentation = {
                        id: id,
                        description: json.data.description,
                        connectors: json.data.connectors,
                        visuals: json.data.visuals,
                        icon: json.data.icon
                    };

                    deferred.resolve(documentation);
                });

                return deferred.promise;
            };
        };

        return new SubcircuitLibrary();
    }];
});
/*globals angular*/

},{}]},{},[1])


//# sourceMappingURL=subcircuitBrowser.js.map
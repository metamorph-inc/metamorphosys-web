(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";

angular.module("mms.componentBrowser.componentLibrary", []).provider("componentLibrary", function ComponentLibraryProvider() {
    var serverUrl;

    this.setServerUrl = function (url) {
        serverUrl = url;
    };

    this.$get = ["$http", "$q", "$log", function ($http, $q, $log) {

        var ComponentLibrary, encodeCategoryPath, downloadURL;

        encodeCategoryPath = function (path) {
            return path.replace(/\//g, "!");
        };

        ComponentLibrary = function () {

            var classificationTree, grandTotal;

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
                        msg: "Could not load classification tree",
                        data: data,
                        status: status,
                        headers: headers,
                        config: config
                    });
                });

                return deferred.promise;
            };

            downloadURL = function (url) {
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

            this.downloadComponent = function (id) {

                $log.debug("Download handler");

                $http.get(serverUrl + "/getcomponent/f/" + id).success(function (filename) {

                    downloadURL(serverUrl + "/" + filename);
                });
            };

            this.getGrandTotal = function () {
                return grandTotal;
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
        };

        return new ComponentLibrary();
    }];
});
/*globals angular*/

},{}]},{},[1])


//# sourceMappingURL=componentLibrary.js.map
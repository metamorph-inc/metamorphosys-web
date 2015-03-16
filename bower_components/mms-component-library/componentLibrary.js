/*globals angular*/

'use strict';

angular.module(
    'mms.componentBrowser.componentLibrary', [])
    .provider('componentLibrary', function ComponentLibraryProvider() {
        var serverUrl;

        this.setServerUrl = function (url) {
            serverUrl = url;
        };

        this.$get = [

            '$http',
            '$q',
            '$log',

            function ($http, $q, $log) {

                var ComponentLibrary,
                    encodeCategoryPath,
                    downloadURL;

                encodeCategoryPath = function(path) {
                    return path.replace(/\//g, '!');
                };

                ComponentLibrary = function () {

                    var classificationTree;

                    this.getListOfComponents = function(categoryPath, itemCount, cursor ) {

                        var deferred = $q.defer(),
                            url;

                        url = serverUrl + '/components/list/' + encodeCategoryPath(categoryPath) +
                            '/' + itemCount + '/' + cursor;

                        $http.get(url)

                            .success(function (data) {
                                deferred.resolve(data.components);
                            })
                            .error(function (e) {    // assume attempt to page past available components
                                deferred.reject('Could not load list of components', e);
                        });

                        return deferred.promise;
                    };


                    this.getClassificationTree = function (id) {

                        var deferred = $q.defer(),
                            url;

                        url = serverUrl + '/classification/tree';

                        if (angular.isString(id)) {
                            url += '/' + encodeCategoryPath(id);
                        }

                        $http.get(url)

                            .success(function (data) {

                                classificationTree = data.classes;
                                deferred.resolve(classificationTree);

                            })
                            .error(function (e) {
                                deferred.reject('Could not load classification tree', e);
                            });

                        return deferred.promise;
                    };


                    downloadURL = function (url) {
                        var hiddenIFrameID = 'hiddenDownloader',
                            iframe = document.getElementById(hiddenIFrameID);
                        if (iframe === null) {
                            iframe = document.createElement('iframe');
                            iframe.id = hiddenIFrameID;
                            iframe.style.display = 'none';
                            document.body.appendChild(iframe);
                        }
                        iframe.src = url;
                    };


                    this.downloadComponent = function(id) {

                        $log.debug('Download handler');

                        $http.get(serverUrl + '/getcomponent/f/' + id)
                            .success(function (filename) {

                                downloadURL(serverUrl + "/" + filename);

                            });
                    };


                    this.searchComponents = function(categoryPath, searchPhrase, itemCount, cursor) {

                        var deferred = $q.defer();

                        $http.get(
                            serverUrl + '/components/search' + '/' + encodeCategoryPath(categoryPath) +
                            '/' + searchPhrase + '/' + itemCount + '/' + cursor)
                            .success(function(data){

                                if (data && angular.isArray(data.component) && data.component.length) {
                                    deferred.resolve(data);
                                } else {
                                    deferred.reject('No search results');
                                }

                            })
                            .error(function (e) {
                                deferred.reject('Could not perform search', e);
                            });

                        return deferred.promise;

                    };


                };

                return new ComponentLibrary();

            }
        ];
    });

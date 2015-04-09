/*globals angular, ga */

'use strict';

module.exports = function (symbolManager, $log, $rootScope, $q, componentLibrary) {

    var config,

        treeNavigatorData,
        treeNodesById,

        classNodes,
        componentNodes,

        initializeWithNodes,
        showComponent,

        parseComponentNodes,
        parseComponentNode,

        parseClassNodeTree,
        parseClassNode,

        getClassNode,

        parseComponentNodeExtraInfo,

        getNodeContextmenu,
        getComponentById,

        ITEMS_PER_PAGE = 20;

    treeNodesById = {};
    componentNodes = {};

    $log.debug('In ComponentBrowserService');

    getNodeContextmenu = function (node) {

        var contextMenu;


        if (componentNodes[node.id]) {

            contextMenu = [
                {
                    items: [
                        {
                            id: 'addToDesign',
                            label: 'Add to design',
                            iconClass: 'fa fa-plus-circle',
                            action: function () {

                                ga('send', 'event', 'avmComponent', 'createFromContextmenu');

                                $rootScope.$emit('componentInstantiationMustBeDone', node);
                            }
                        }
                    ]
                }
            ];

        }

        return contextMenu;

    };


    config = {

        extraInfoTemplateUrl: '/mmsApp/templates/componentExtraInfo.html',

        nodeClassGetter: function (node) {

            var result;

            result = '';

            if (node.childrenCount) {
                result = 'parent-node';
            } else {
                result = 'leaf-node';
            }

            if (node.symbol) {
                result += ' has-symbol';
            }

            return result;
        },

        preferencesMenu: [
            {
                items: [

                    {
                        id: 'collapseAll',
                        label: 'Collapse all',
                        iconClass: 'fa fa-minus-square',
                        action: function () {

                            treeNavigatorData.config.state = treeNavigatorData.config.state || {};
                            treeNavigatorData.config.state.expandedNodes = [];

                        }
                    }
                ]
            }
        ],

        pagination: {
            itemsPerPage: ITEMS_PER_PAGE
        },

        loadChildren: function ($event, node, countToLoad, isBackPaging) {

            var deferred = $q.defer(),
                childCategoriesDeferred = $q.defer(),
                childComponentsDeferred = $q.defer(),
                allChildren,
                cursor;

            allChildren = [];

            if (node.childCategoriesCount) {

                componentLibrary.getClassificationTree(node.id)

                    .then(function (data) {
                        allChildren = allChildren.concat(parseClassNodeTree(node, data));
                        childCategoriesDeferred.resolve();
                    })
                    .catch(function (e) {
                        deferred.reject(e);
                    });

            } else {
                childCategoriesDeferred.resolve();
            }

            if (node.childComponentCount) {

                if (!isBackPaging) {
                    cursor = Math.min((node.lastLoadedChildPosition || -1) + 1, node.childComponentCount - 1);
                } else {
                    cursor = Math.max(node.firstLoadedChildPosition - countToLoad - 1, 0);
                }

                componentLibrary.getListOfComponents(
                    node.id, countToLoad, cursor)

                    .then(function (data) {
                        allChildren = allChildren.concat(parseComponentNodes(node, data));
                        childComponentsDeferred.resolve();
                    })
                    .catch(function (e) {
                        deferred.reject(e);
                    });

            } else {
                childComponentsDeferred.resolve();
            }


            $q.all([childCategoriesDeferred.promise, childComponentsDeferred.promise]).
                then(function () {
                    deferred.resolve(allChildren);
                });

            return deferred.promise;
        },


        showRootLabel: false,

        // Tree Event callbacks

        nodeClick: function (/*e, node*/) {
            ///console.log('Node was clicked:', node);
        },

        nodeDblclick: function (/*e, node*/) {
            //console.log('Node was double-clicked:', node);
        },

        nodeContextmenuRenderer: function (e, node) {
            //console.log('Contextmenu was triggered for node:', node);

            return getNodeContextmenu(node);

        },

        nodeExpanderClick: function (/*e, node, isExpand*/) {
            //console.log('Expander was clicked for node:', node, isExpand);
        },

        nodeDragStart: function(e, node) {
            console.log('Component drag start', e, node);
            e.dataTransfer.setData('text', node.id);
        },

        nodeDragEnd: function(e) {
            console.log('Component drag end', e);
        }        

    };

    parseComponentNodeExtraInfo = function (node) {

        var extraInfo;

        if (angular.isObject(node) && angular.isObject(node.prominentProperties) && node.prominentProperties.length) {

            extraInfo = {
                properties: []
            };

            angular.forEach(node.prominentProperties, function (property) {

                extraInfo.properties.push(property);

            });

            node.extraInfo = extraInfo;

        }

    };

    parseComponentNodes = function (parentNode, children) {

        var nodeCollector = [];

        if (parentNode && Array.isArray(children)) {

            angular.forEach(children, function (child) {
                nodeCollector.push(parseComponentNode(child, parentNode));
            });

        }

        return nodeCollector;

    };

    parseComponentNode = function (nodeDescriptor, parentNode) {

        var node;

        node = treeNodesById[nodeDescriptor.id];

        if (!angular.isObject(node)) {

            node = {
                id: nodeDescriptor.id,
                label: nodeDescriptor.name,
                classificationLabels: nodeDescriptor.classificationLabels,
                prominentProperties: nodeDescriptor.prominentProperties,
                otherProperties: nodeDescriptor.otherProperties,
                position: nodeDescriptor.position,
                parentNode: parentNode,
                draggable: true,
                dragChannel: 'component',
                dropChannel: 'noDrop'
            };

            parseComponentNodeExtraInfo(node);

            componentNodes[node.id] = node;
            treeNodesById[node.id] = node;

        }

        return node;

    };

    parseClassNodeTree = function (fromNode, children) {

        var childrenCollector = [];

        if (fromNode && Array.isArray(children)) {

            angular.forEach(children, function (child) {
                childrenCollector.push(parseClassNode(child, fromNode));
            });

        }

        return childrenCollector;

    };

    parseClassNode = function (nodeDescriptor, parentNode) {

        var node;

        node = treeNodesById[nodeDescriptor.id];

        if (!angular.isObject(node)) {

            node = {
                id: nodeDescriptor.id,
                label: nodeDescriptor.label,
                description: null,
                parentNode: parentNode,
                draggable: false,
                childrenCount: nodeDescriptor.childCategoriesCount + nodeDescriptor.childComponentsCount,
                childCategoriesCount: nodeDescriptor.childCategoriesCount,
                childComponentCount: nodeDescriptor.childComponentsCount,
                categoryTotal: nodeDescriptor.categoryTotal
            };

            if (node.categoryTotal > 0) {

                node.extraInfo = node.extraInfo || {};
                node.extraInfo.categoryTotal = node.categoryTotal;
            }

            classNodes[node.id] = node;
            treeNodesById[node.id] = node;

            if (node.childrenCount) {
                node.children = [];
            }

            if (Array.isArray(nodeDescriptor.subClasses)) {
                node.children = parseClassNodeTree(node, nodeDescriptor.subClasses);
            }

        }

        return node;

    };

    initializeWithNodes = function (nodes) {

        var rootNode,
            children;

        treeNodesById = {};
        classNodes = {};
        componentNodes = {};

        rootNode = (
            'root',
            {
                label: 'Root node',
                children: []
            }
        );

        classNodes.root = rootNode;

        treeNavigatorData.data = rootNode;
        children = parseClassNodeTree(rootNode, nodes);
        rootNode.children = children;

    };


    getClassNode = function (path) {

        var deferred = $q.defer(),
            node,
            parts,

            parentId,
            id;


        node = classNodes[path];

        if (node) {

            // Was loaded
            deferred.resolve(node);

        } else {

            // Root node - must have been loaded

            parts = path.split('/');

            if (parts.length < 2) {

                id = parts[0];

                node = classNodes[id];

                if (node) {
                    deferred.resolve(node);
                } else {
                    deferred.reject('Could not found', id);
                }

            } else {

                // Get parent

                parentId = (parts.slice(0, parts.length - 1)).join('/');

                getClassNode(parentId)
                    .then(function (parent) {

                        if (parent.childCategoriesCount &&
                            Array.isArray(parent.children) &&
                            !parent.children.length) {

                            componentLibrary.getClassificationTree(parent.id)
                                .then(function (data) {

                                    parent.children = parseClassNodeTree(parent, data);

                                    node = classNodes[path];

                                    if (node) {

                                        node = classNodes[path];

                                        deferred.resolve(node);
                                    } else {
                                        deferred.reject('Could not found', id);
                                    }

                                })
                                .catch(function (e) {
                                    deferred.reject(e);
                                });

                        } else {

                            node = classNodes[path];

                            if (node) {
                                deferred.resolve(node);
                            } else {
                                deferred.reject('Could not found', id);
                            }
                        }
                    })
                    .catch(function (e) {
                        deferred.reject(e);
                    });
            }
        }

        return deferred.promise;

    };

    showComponent = function (path, id, position) {

        var deferred = $q.defer();

        function expandNode(node) {

            if (node.parentNode) {
                expandNode(node.parentNode);
            }

            if (treeNavigatorData.config.state.expandedNodes.indexOf(node.id) === -1) {
                treeNavigatorData.config.state.expandedNodes.push(node.id);
            }
        }

        function collapseNode(node) {

            var index = treeNavigatorData.config.state.expandedNodes.indexOf(node.id);

            if (index > -1) {
                treeNavigatorData.config.state.expandedNodes.splice(index, 1);
            }
        }

        if (path && id && !isNaN(position)) {

            getClassNode(path)
                .then(function (classNode) {

                    var node,
                        cursor;

                    node = componentNodes[id];

                    if (!isNaN(classNode.firstLoadedChildPosition) && !isNaN(classNode.lastLoadedChildPosition) &&
                        classNode.firstLoadedChildPosition <= position &&
                        position <= classNode.lastLoadedChildPosition &&
                        node
                    ) {

                        treeNavigatorData.config.state.selectedNodes = [ id ];
                        deferred.resolve(node);

                    } else {

                        collapseNode(classNode);

                        cursor = Math.floor((position / ITEMS_PER_PAGE)) * ITEMS_PER_PAGE;

                        componentLibrary.getListOfComponents(
                            path, ITEMS_PER_PAGE, cursor)
                            .then(function (data) {

                                classNode.children = parseComponentNodes(classNode, data);
                                classNode.firstLoadedChildPosition = cursor;
                                classNode.lastLoadedChildPosition = cursor + ITEMS_PER_PAGE;

                                node = componentNodes[id];
                                treeNavigatorData.config.state.selectedNodes = [ id ];

                                expandNode(classNode);

                                deferred.resolve(node);

                            })
                            .catch(function (e) {
                                $log.error('Could not get component node', e);
                            });

                    }


                }).catch(function(e){
                   $log.error('Could not get class node', e);
                });

        } else {
            deferred.reject();
        }

        return deferred.promise;
    };

    getComponentById = function (nodeId) {

        return treeNodesById[nodeId];

    };


    treeNavigatorData = {
        data: {},
        config: config
    };


    this.treeNavigatorData = treeNavigatorData;

    this.initializeWithNodes = initializeWithNodes;
    this.showComponent = showComponent;

    this.getComponentById = getComponentById;

};

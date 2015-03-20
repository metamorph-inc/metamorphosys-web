/*globals angular, ga */

'use strict';

module.exports = function (symbolManager, $log, $rootScope, $q, componentLibrary) {

    var config,

        treeNavigatorData,
        treeNodesById,

        classNodes,
        componentNodes,

        initializeWithNodes,
        showNode,

        parseComponentNodes,
        parseComponentNode,

        parseClassNodeTree,
        parseClassNode,

        parseComponentNodeExtraInfo,
        findSymbolForClassNode,

        //organizeTree,

        getNodeContextmenu,
        getComponentById,

        mapFromClassNamesToSymbolTypes,

        ITEMS_PER_PAGE = 20;

    mapFromClassNamesToSymbolTypes = require('./ClassNamesToSymbolTypes')();

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
                            action: function() {

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

//        scopeMenu: [
//            {
//                items: [
//                    {
//                        id: 'project',
//                        label: 'Project Hierarchy',
//                        action: function () {
//                            config.state.activeScope = 'project';
//                            config.selectedScope = config.scopeMenu[ 0 ].items[ 0 ];
//                        }
//                    },
//                    {
//                        id: 'composition',
//                        label: 'Composition',
//                        action: function () {
//                            config.state.activeScope = 'composition';
//                            config.selectedScope = config.scopeMenu[ 0 ].items[ 1 ];
//                        }
//                    }
//                ]
//            }
//
//        ],
//
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
                    //{
                    //    id: 'expandAll',
                    //    label: 'Expand all',
                    //    iconClass: 'fa fa-plus-square',
                    //    action: function () {
                    //
                    //        treeNavigatorData.config.state = treeNavigatorData.config.state || {};
                    //        treeNavigatorData.config.state.expandedNodes = treeNavigatorData.config.state.expandedNodes || [];
                    //
                    //        angular.forEach(classNodes, function (parentNode) {
                    //
                    //            if (treeNavigatorData.config.state.expandedNodes.indexOf(parentNode.id) === -1) {
                    //                treeNavigatorData.config.state.expandedNodes.push(parentNode.id);
                    //            }
                    //
                    //        });
                    //
                    //    }
                    //},

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

        loadChildren: function (e, node, countToLoad, isBackPaging) {

            var deferred = $q.defer(),
                childCategoriesDeferred = $q.defer(),
                childComponentsDeferred = $q.defer(),
                allChildren,
                cursor;

            allChildren = [];

            if (node.childCategoriesCount) {

                componentLibrary.getClassificationTree(node.id)

                    .then(function(data){
                        allChildren = allChildren.concat(parseClassNodeTree(node, data));
                        childCategoriesDeferred.resolve();
                    })
                    .catch(function(e){
                       deferred.reject(e);
                    });

            } else {
                childCategoriesDeferred.resolve();
            }

            if (node.childComponentCount) {

                if (!isBackPaging) {
                    cursor = Math.min((node.lastLoadedChildPosition || -1) + 1, node.childComponentCount-1);
                } else {
                    cursor = Math.max(node.firstLoadedChildPosition - countToLoad - 1, 0);
                }

                //debugger;

                componentLibrary.getListOfComponents(
                    node.id, countToLoad, cursor)

                    .then(function(data){
                        allChildren = allChildren.concat(parseComponentNodes(node, data));
                        childComponentsDeferred.resolve();
                    })
                    .catch(function(e){
                        deferred.reject(e);
                    });

            } else {
                childComponentsDeferred.resolve();
            }



            $q.all([childCategoriesDeferred.promise, childComponentsDeferred.promise]).
                then(function(){
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
        }

    };

    findSymbolForClassNode = function(classNode, rawClassName) {

        var symbolType,
            symbol;

        if (angular.isObject(symbolManager)) {

            symbolType = mapFromClassNamesToSymbolTypes[rawClassName];

            if (symbolType) {

                symbol = symbolManager.getSymbol(symbolType);

                classNode.symbol = symbol;
                classNode.extraInfo = classNode.extraInfo || {};

                classNode.extraInfo.symbol = symbol;

            }

        }


    };

    parseComponentNodeExtraInfo = function(node) {

        var extraInfo;

        if (angular.isObject(node) && angular.isObject(node.prominentProperties) && node.prominentProperties.length) {

            extraInfo = {
                properties: []
            };

            angular.forEach(node.prominentProperties, function(property) {

                extraInfo.properties.push(property);

            });

            node.extraInfo = extraInfo;

        }

    };

    parseComponentNodes = function(parentNode, children) {

        var nodeCollector = [];

        if (parentNode && Array.isArray(children)) {

            angular.forEach(children, function(child) {
                nodeCollector.push(parseComponentNode(child, parentNode));
            });

        }

        return nodeCollector;

    };

    parseComponentNode = function (nodeDescriptor, parentNode) {

        var node;

        node = treeNodesById[ nodeDescriptor.id ];

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

    parseClassNodeTree = function(fromNode, children) {

        var childrenCollector = [];

        if (fromNode && Array.isArray(children)) {

            angular.forEach(children, function(child) {
                childrenCollector.push(parseClassNode(child, fromNode));
            });

        }

        return childrenCollector;

    };

    parseClassNode = function (nodeDescriptor, parentNode) {

        var node;

        node = treeNodesById[ nodeDescriptor.id ];

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


    showNode = function(nodeId) {

        // TODO: make it part of TreeNaviagtor

        var node,
            parentNode;

        node = treeNodesById[nodeId];

        if (angular.isObject(node)) {

            parentNode = node.parentNode;

            while (parentNode) {

                if (treeNavigatorData.config.state.expandedNodes.indexOf(parentNode.id) === -1) {
                    treeNavigatorData.config.state.expandedNodes.push(parentNode.id);
                }

                parentNode = parentNode.parentNode;

            }

            treeNavigatorData.config.state.selectedNodes = [ nodeId ];
        }
    };

    getComponentById = function(nodeId) {

        return treeNodesById[nodeId];

    };


    treeNavigatorData = {
        data: {},
        config: config
    };


    this.treeNavigatorData = treeNavigatorData;

    this.initializeWithNodes = initializeWithNodes;
    this.showNode = showNode;

    this.getComponentById = getComponentById;

};

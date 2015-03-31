/* globals define */

define(['xmljsonconverter',
    'q',
    'jszip'
], function (xmljsonconverter, q, JSZip) {

    'use strict';

    var ParseAcm = function (id) {
        this.id = id;
    };

    function endsWith(input, suffix) {
        return input.lastIndexOf(suffix) === (input.length - suffix.length);
    }

    ParseAcm.prototype.parse = function parseAcm() {
        var self = this;
        return this.getAcmZip()
            .then(function (acmXmlZip) {
                var acmZip = new JSZip(acmXmlZip),
                    filterZipList = function (ar) {
                        return ar.filter(function (entry) {
                            return entry.name.indexOf('__MACOSX') !== 0;
                        });
                    },
                    acmXml = filterZipList(acmZip.file(/\.acm$/));

                if (acmXml.length !== 1) {
                    return q.reject('zip must contain exactly 1 acm');
                }

                var acmJson = self.convertAcmToJson(acmXml[0].asText()),
                    component = acmJson.Component,
                    acmInfo = {};


                //console.log(JSON.stringify(component, null, 4));

                (function setIcon() {
                    var icon = component.ResourceDependency.filter(function (dependency) {
                        return dependency['@Name'].toLowerCase() === 'icon.png';
                    })[0];
                    if (icon && icon['@Path'] && acmZip.file(icon['@Path'])) {
                        acmInfo.icon = 'data:image/png;base64,' + acmZip.file(icon['@Path']).asNodeBuffer().toString('base64');
                    }
                })();

                (function setDatasheet() {
                    var dependency = component.ResourceDependency.filter(function (dep) {
                        return endsWith(dep['@Name'].toLowerCase(), '.pdf');
                    })[0];
                    if (dependency && dependency['@Path'] && acmZip.file(dependency['@Path'])) {
                        acmInfo.datasheet = dependency['@Path']; // TODO make this a url
                    }
                })();

                (function setMarkdown() {
                    var dependency = component.ResourceDependency.filter(function (dep) {
                        return endsWith(dep['@Name'].toLowerCase(), '.md') || endsWith(dep['@Name'].toLowerCase(), '.mdown');
                    })[0];
                    if (dependency && dependency['@Path'] && acmZip.file(dependency['@Path'])) {
                        acmInfo.datasheet = acmZip.file(dependency['@Path']).asText(); // TODO render this
                    }
                })();

                (function setProperties() {
                    acmInfo.properties = {};
                    component.Property.forEach(function (prop) {
                        var propInfo = acmInfo.properties[prop['@Name']] = {};
                        if (prop.Value && prop.Value.ValueExpression && prop.Value.ValueExpression.Value) {
                            propInfo.value = prop.Value.ValueExpression.Value['#text'];
                        }
                    });
                })();

                acmInfo.name = acmJson.Component['@Name'] || self.id;
                acmInfo.classification = acmJson.Component.Classifications['#text'];

                return acmInfo;
            });
    };

    ParseAcm.prototype.getAcmZip = function () {
        throw new Error('must be overridden. return a q promise');
    };

    ParseAcm.prototype.convertAcmToJson = function convertAcmToJson(acmXmlString) {
        var converter = new xmljsonconverter.Xml2json({
            skipWSText: true,
            arrayElements: {
                Property: true,
                Connector: true,
                DomainModel: true,
                Role: true,
                Formula: true,
                Operand: true,
                Port: true,
                ResourceDependency: true
            }
        });

        return converter.convertFromString(acmXmlString);
    };

    return ParseAcm;
});

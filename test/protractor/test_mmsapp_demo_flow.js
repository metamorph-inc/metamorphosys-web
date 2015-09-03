/*global describe,it,browser,expect,by,before,beforeAll,element, afterAll, $, angular, protractor*/

describe('Metamorphosys Tech Demo Flow', function() {

    var q = require('q'),
        url = require('url'),
        dragAndDropHelper = require('./lib/drag_and_drop_helper.js'),
        hasClass = require('./lib/has_class.js'),

        projectCopyTimeLimit = 5 * 60 * 1000,
        gmeEventTimeLimit = 8000,
        uiEventTimeLimit = 200,
        componentLibraryQueryTimeLimit = 2000,

        projectName,
        url,

        browser2,

        $rootScope1,
        $rootScope2,

        // For component library interactions

        searchTerm = '12',
        searchTermX = 'xy',
        categoryToUnfold = 'Ara',
        subCategoryToUnfold = 'Semiconductors and actives',
        componentToDrag = 'TEA10201V15A0',
        targetComponentLabel = 'TEA10201V15A0',

        targetContainerLabel = "Arduino Interface",
        mainContainerLabel = "Arduino DUE Shield Basic",
        targetProjectLabel = "Arduino DUE Shield Basic",

        wireIdToSelect = '/1922727130/1620862711/515320282/1023749206',
        segmentIndexToSelect = 1;

    require('./lib/find_diagramComponent_by_labelText.js');
    require('./lib/getHierarchyComponent.js');

    beforeAll(function loadTestProject(done) {
        if (false) {
            // FIXME: copyproject takes many seconds. For faster turnaround, use a pre-created project
            projectName = 'Template_Module_1x2';
            done();
        } else {
            require('http').get(url.resolve(browser.baseUrl, '/rest/external/copyproject/noredirect'), function(res) {
                if (res.statusCode > 399) {
                    done.fail(res.statusCode);
                }
                res.setEncoding('utf8');
                projectName = '';
                res.on('data', function(chunk) {
                    projectName += chunk;
                });
                res.on('end', function() {
                    done();
                });
            }).on('error', function(err) {
                console.log("Error calling copyproject: " + err.message);
                done.fail(err);
            });
        }
    }, projectCopyTimeLimit);

    afterAll(function(done) {
        // Calling quit will remove the browser.
        // You can choose to not quit the browser, and protractor will quit all of
        // them for you when it exits (i.e. if you need a static number of browsers
        // throughout all of your tests). However, I'm forking browsers in my tests
        // and don't want to pile up my browser count.
        if (browser2) {
            browser2.quit().then(function() {
                done();
            });
        } else {
            done();
        }
    });

    it('Should create and load new design', function() {

        browser.get('/extlib/public/apps/mmsApp/#/createDesign/' + projectName);

        var projectSelector,
            targetProject,
            diagramContainer,
            componentLabel;

        projectSelector = element(by.css('div.design-selector'));

        diagramContainer = element(by.css('div.diagram-container'));

        expect(browser.getTitle()).toEqual('Metamorphosys');

        browser.wait(function() {

                return projectSelector.isPresent();
            },
            gmeEventTimeLimit,
            'projectSelector not found'
        ).then(function() {

            targetProject = element.all(by.css('h3.design-tile-header')).filter(function(elem) {
                return elem.getText().then(function(text) {
                    return text === targetProjectLabel;
                });
            });

            expect(targetProject.count()).toEqual(1);

            targetProject.get(0).click();

            browser.wait(function() {

                    return diagramContainer.isPresent();
                },
                gmeEventTimeLimit,
                'diagramContainer not found'
            ).then(function() {

                expect(browser.isElementPresent(diagramContainer)).toEqual(true);
                componentLabel = element(by.css('text.component-label'));

                browser.wait(function () {
                        return componentLabel.isPresent();
                    },
                    gmeEventTimeLimit,
                    'components not found');
                expect(element.all(by.css('text.component-label')).count()).toEqual(3);

            });
        });

    }, gmeEventTimeLimit * 5);

    it('Should have about dialog open', function() {

        var aboutDialog,
            closeButton;

        aboutDialog = element(by.css('.about-dialog'));
        closeButton = element(by.css('.about-dialog .md-actions button.md-primary'));

        browser.wait(function() {
                    return aboutDialog.isDisplayed();
                },
                2000,
                'aboutDialog not found'
            )
            .then(function() {
                var el = element(by.css('div.busy-cover'));
                return browser.driver.wait(protractor.until.elementIsNotVisible(el), 2000, 'busy-cover did not go away');
            })
            .then(function () {
                expect(browser.isElementPresent(aboutDialog)).toEqual(true);
                expect(closeButton.isDisplayed()).toBeTruthy();
                closeButton.click();
            });

    }, gmeEventTimeLimit);

    it('Should be able to drag-pan', function () {

        var diagramContainer;

        diagramContainer = browser.element(by.css('div.diagram-container'));

        browser.actions()
            .mouseMove({x: 100, y: 150})
            .mouseDown()
            .perform();

        browser.sleep(uiEventTimeLimit);

        browser.actions().mouseMove({x: 250, y: 250}).perform();

        browser.sleep(uiEventTimeLimit);

        browser.actions().mouseUp().perform();

        browser.sleep(uiEventTimeLimit);

        browser.element(by.css('div.jspPane')).getAttribute('style').then(function (style) {
            console.log('FIXME simulated pan is not working: ' + style);
        });

    });


    it('Should have subcircuit browser', openSubcircuitBrowser)

    function openSubcircuitBrowser() {

        var contentButton,
            subcircuitsButton,
            subcircuitsBrowser;

        contentButton = element(by.css('div.footer-drawer > header > ul > li:nth-child(2) > button'));

        expect(contentButton.getText()).toEqual("CONTENT");

        contentButton.click();

        subcircuitsButton = element(by.css('div.footer-drawer > ul.drawer-sub-navigator > li:nth-child(2) > button'));

        expect(subcircuitsButton.getText()).toEqual("Subcircuits");

        subcircuitsButton.click();

        //browser.sleep(componentLibraryQueryTimeLimit);
        browser.wait(function () {
            subcircuitsBrowser = element(by.css('.subcircuit-browser'));
            return subcircuitsBrowser.isPresent();
        }, componentLibraryQueryTimeLimit, '.subcircuit-browser not found');
    }


    it('Should be able to create subcircuit instance by dragging', function () {

        var categories;

        browser.driver.executeScript(dragAndDropHelper).then(function () {
            return element.all(by.css('div.subcircuit-browser div.left-panel subcircuit-categories ul li > div'))
                .then(function (categories_) {
                    categories = categories_;
                    expect(categories.length > 1).toBe(true);
                }).then(function () {
                    return selectCategory(0);

                    function selectCategory(j) {
                        if (j === categories.length) {
                            return;
                        }
                        element.all(by.css('div.subcircuit-browser div.left-panel subcircuit-categories ul li > div'))
                            .then(function (categories_) {
                                categories = categories_; // avoid stale elements, since the inspector popped up when deleting the last subcircuit
                            }).then(function () {
                                return browser.executeScript('arguments[0].scrollIntoView(false)', categories[j].getWebElement());
                            }).then(function () {
                                return categories[j].click();
                            }).then(function () {
                                // https://github.com/vu-isis/isis-ui-components/pull/11 workaround
                                browser.sleep(400);
                                return browser.waitForAngular();
                            })
                            .then(createAndDeleteSubcircuits)
                            .then(function () {
                                selectCategory(j + 1);
                            });
                    }
                });
        });

        function createAndDeleteSubcircuits() {
            return browser.driver.executeScript(function () {
                return Array.prototype.map.call($('div.subcircuit-browser div.main-container-panel ul li header h4 span.item-title'), function (el) {
                    return el.textContent;
                });
            })
                .then(function (subcircuits) {

                    return createAndDeleteSubcircuit(0);

                    function createAndDeleteSubcircuit(i) {
                        if (i > 0 || i === subcircuits.length) {
                            return;
                        }
                        var subcircuitLabel = subcircuits[i];

                        return browser.driver.executeScript(function (i) {

                            $('div.subcircuit-browser div.main-container-panel ul.list-group > li:nth-child(' + (i + 1).toString() + ') header h4').simulateDragDrop({
                                // TODO: $('li[title="' + componentTitle + '"] .label-and-extra-info').simulateDragDrop({
                                dropTarget: $('.svg-diagram')
                            });

                        }, i).then(function () {
                            var componentBox = element(by.diagramComponentLabel(subcircuitLabel));

                            return browser.wait(function () {
                                    return componentBox.isPresent();
                                },
                                gmeEventTimeLimit * 5,
                                'New ' + subcircuitLabel + 'subcircuit not created'
                            ).then(function () {
                                    return componentBox.click();
                                })
                                .then(function () {
                                    return componentBox.sendKeys(protractor.Key.DELETE);
                                })
                                .then(function () {
                                    //return browser.driver.wait(protractor.until.elementIsNotVisible(componentBox), gmeEventTimeLimit, 'busy-cover did not go away');
                                    return browser.wait(function () {
                                        //return element(by.diagramComponentLabel(subcircuitLabel)).isPresent() === false;
                                        return componentBox.isPresent().then(function (present) {
                                            return !present;
                                        });

                                    }, gmeEventTimeLimit * 40, 'could not delete ' + subcircuitLabel);
                                })
                                .then(function () {
                                    return openSubcircuitBrowser();
                                }).then(function () {
                                    return createAndDeleteSubcircuit(i + 1);
                                });
                        });

                    }
                });
        }

    }, 80 * 2 * gmeEventTimeLimit);

    it('Should have component browser', function() {

        var contentButton,
            componentsButton,
            componentBrowser,
            componentSearchInput;

        contentButton = element(by.css('div.footer-drawer > header > ul > li:nth-child(2) > button'));

        expect(contentButton.getText()).toEqual("CONTENT");

        contentButton.click();

        componentsButton = element(by.css('div.footer-drawer > ul.drawer-sub-navigator > li:nth-child(1) > button'));

        expect(componentsButton.getText()).toEqual("Components");

        componentsButton.click();

        browser.wait(function () {
            componentBrowser = element(by.css('.component-browser'));
            return componentBrowser.isPresent();
        }, componentLibraryQueryTimeLimit, '.component-browser not found');

        componentSearchInput = element(by.css('div.component-search > input'));
        expect(browser.isElementPresent(componentSearchInput)).toEqual(true);

    });


    // This test utilizes the autocomplete feature of a search dropdown, which we don't currently have.

    // it('Component search should return search results', function () {

    //     var componentSearchInput,
    //         searchDropdown,
    //         searchResults;

    //     componentSearchInput = element(by.css('.component-search-input'));
    //     searchDropdown = element(by.css('.component-search .angucomplete-dropdown'));
    //     searchResults = element.all(by.css('.component-search .angucomplete-row'));

    //     componentSearchInput.sendKeys(searchTerm)
    //         .then(function () {

    //             browser.wait(function () {
    //                     return searchDropdown.isDisplayed();
    //                 },
    //                 3000,
    //                 'search results not displayed')
    //                 .then(function () {
    //                     expect(searchResults.count()).toBeGreaterThan(0);


    //                     componentSearchInput.sendKeys(searchTermX)
    //                         .then(function () {

    //                             // Making sure back-space/delete works in input field
    //                             componentSearchInput.sendKeys(protractor.Key.BACK_SPACE)
    //                                 .then(function () {

    //                                     var term = searchTerm + searchTermX;

    //                                     expect(componentSearchInput.getAttribute('value')).toEqual( term.substring(0, term.length - 1));

    //                                     browser.wait(function () {
    //                                             return searchDropdown.isDisplayed();
    //                                         },
    //                                         3000,
    //                                         'search results not displayed')
    //                                         .then(function () {
    //                                             expect(searchResults.count()).toEqual(0);
    //                                         });
    //                                 });
    //                         });

    //                 });

    //         });

    // });

    it('Should display ' + categoryToUnfold + ' category', function () {

        var sensorCategoryItem;

        browser.wait(function () {
            sensorCategoryItem = element(by.css('div.footer-drawer component-categories li[title=\'' + categoryToUnfold + '\']'));
            return sensorCategoryItem.isPresent();
        }, componentLibraryQueryTimeLimit, 'category ' + categoryToUnfold + ' not shown');

    });

    it( categoryToUnfold + ' category should expand', function () {

        var categoryExpander,
            childrenList,
            items;

        categoryExpander = element(by.css('div.footer-drawer component-categories li[title=\'' + categoryToUnfold + '\'] .node-expander'));

        browser.executeScript('arguments[0].scrollIntoView(false)', categoryExpander.getWebElement())
            .then(function () {
                //return browser.sleep(10 * 1000);
            })
            .then(function () {
                return categoryExpander.click();
            })
            .then(function () {

                //browser.sleep(componentLibraryQueryTimeLimit);

                childrenList = element(by.css('div.footer-drawer component-categories li[title=\'' + categoryToUnfold + '\'] > .node-list'));

                browser.wait(function () {
                        return childrenList.isPresent();
                    },
                    3000,
                    'no items in category')
                    .then(function () {
                        items = childrenList.all(by.css('li'));
                        expect(items.count()).toBeGreaterThan(0);
                    });

            });

    });

    it('Should display ' + subCategoryToUnfold + ' subcategory', function () {

        var sensorCategoryItem;

        sensorCategoryItem = element(by.css('div.footer-drawer component-categories li[title=\'' + categoryToUnfold + '\'] > .node-list li[title=\'' + subCategoryToUnfold + '\'] > div'));
        expect(sensorCategoryItem.isDisplayed()).toBeTruthy();
        browser.executeScript('arguments[0].scrollIntoView(false)', sensorCategoryItem.getWebElement())
            .then(function () {
                return sensorCategoryItem.click();
            });

    });


    it( subCategoryToUnfold + ' category should expand', function () {

        var categoryExpander,
            childrenList,
            items;

        categoryExpander = element(by.css('div.footer-drawer component-categories li[title=\'' + subCategoryToUnfold + '\'] .node-expander'));

        browser.executeScript('arguments[0].scrollIntoView(false)', categoryExpander.getWebElement())
            .then(function () {
                return categoryExpander.click();
            })
            .then(function () {

                //browser.sleep(componentLibraryQueryTimeLimit);
                childrenList = element(by.css('div.footer-drawer component-categories li[title=\'' + subCategoryToUnfold + '\'] > .node-list'));

                browser.wait(function () {
                        return childrenList.isDisplayed();
                    },
                    3000,
                    'no items in category')
                    .then(function () {
                        items = childrenList.all(by.css('li'));
                        expect(items.count()).toBeGreaterThan(0);
                    });

            });
    });

    it('Should be able to navigate to same project and design in other browser', function () {

        var diagramContainer,
            closeButton;

        browser2 = browser.forkNewDriverInstance(true);

        expect(browser2).not.toEqual(browser);
        expect(browser2.driver).not.toEqual(browser.driver);

        browser.driver.getCurrentUrl().then(function (currentUrl) {

            expect(browser2.driver.getCurrentUrl()).toEqual(currentUrl);

        });

        diagramContainer = browser2.element(by.css('div.diagram-container'));

        expect(browser2.getTitle()).toEqual('Metamorphosys');

        browser2.wait(function () {

                return diagramContainer.isPresent();
            },
            5000,
            'diagramContainer not found'
        ).then(function () {


            });

        expect(browser2.isElementPresent(diagramContainer)).toEqual(true);
        expect(browser2.element.all(by.css('text.component-label')).count()).toEqual(3);

        closeButton = browser2.element(by.css('.about-dialog .md-actions button.md-primary'));

        browser.sleep(2000);

        closeButton.click();

    });

    it('Should be able to create component instance by dragging', function () {

        var componentBox,
            otherComponentBox;

        componentBox = element(by.diagramComponentLabel(targetComponentLabel));
        otherComponentBox = browser2.element(by.diagramComponentLabel(targetComponentLabel));

        browser.driver.executeScript(dragAndDropHelper)
            .then(function () {
                browser.driver.executeScript(function (componentTitle) {

                $('div.footer-drawer div.main-container-panel div.component-listing div.listing-views > div > div > div > div > ul > li:nth-child(1)').simulateDragDrop({
                    // TODO: $('li[title="' + componentTitle + '"] .label-and-extra-info').simulateDragDrop({
                        dropTarget: $('.svg-diagram')
                    });

                }, componentToDrag).then(function () {

                    //browser.sleep(5000);

                    browser.wait(function () {
                            return componentBox.isPresent();
                        },
                        gmeEventTimeLimit,
                        'New component not created'
                    );

                    browser2.wait(function () {
                            return otherComponentBox.isPresent();
                        },
                        gmeEventTimeLimit,
                        'New component not created in other window'
                    );

                });
            });

    });

    it('Should be able to rotate new component box from  context menu', function () {

        var componentBox,
            otherComponentBox,
            rotateCWButton,
            rotateCCWButton,
            checkComponentRotation = function (browser, componentLabel, expectedAngle) {
                browser.driver.executeScript(function (componentLabel) {

                    return Math.acos(window.componentBoxByLabel(componentLabel)[0].getCTM().a) / Math.PI * 180;

                }, targetComponentLabel).then(function (angle) {
                    expect(angle).toEqual(expectedAngle);
                });
            };

        componentBox = browser.findElement(by.diagramComponentLabel(targetComponentLabel));
        rotateCWButton = element(by.css('.contextmenu .action-rotateCW'));

        otherComponentBox = browser2.findElement(by.diagramComponentLabel(targetComponentLabel));
        rotateCCWButton = browser2.element(by.css('.contextmenu .action-rotateCCW'));


        // monkey-patch https://github.com/SeleniumHQ/selenium/commit/017bdbf321329794bd23405b5e981fdb55417262
        otherComponentBox.getRawId = componentBox.getRawId = function() {
            return this.getId().then(function(value) {
                return value['ELEMENT'];
            });
        };
        // https://github.com/angular/protractor/issues/2036 makes this not work:
        //   .mouseDown(componentBox, protractor.Button.RIGHT)
        browser.actions().mouseMove(componentBox).perform();
        browser.actions().click(protractor.Button.RIGHT).perform();

        browser.sleep(uiEventTimeLimit);

        browser.actions().click(rotateCWButton).perform();

        browser.sleep(gmeEventTimeLimit);

        checkComponentRotation(browser, targetComponentLabel, 90);
        checkComponentRotation(browser2, targetComponentLabel, 90);

        browser2.actions().mouseMove(otherComponentBox).perform();
        browser2.actions().click(protractor.Button.RIGHT).perform();

        browser2.sleep(uiEventTimeLimit);

        browser2.actions().click(rotateCCWButton).perform();

        browser.sleep(gmeEventTimeLimit);

        checkComponentRotation(browser2, targetComponentLabel, 0);
        checkComponentRotation(browser, targetComponentLabel, 0);

    });


    it('Should be able to move component box', function () {

        var componentBox,
            otherComponentBox,
            moveBy;

        moveBy = {
            x: 500,
            y: 0
        };

        componentBox = element(by.diagramComponentLabel(targetComponentLabel));
        otherComponentBox = browser2.element(by.diagramComponentLabel(targetComponentLabel));

        browser.driver.executeScript(function (componentLabel) {

            var m;

            m = window.componentBoxByLabel(componentLabel)[0].getCTM();

            return {
                x: m.e,
                y: m.f
            };

        }, targetComponentLabel).then(function (originalPosition) {

            browser.actions().mouseMove(componentBox).perform();
            browser.actions().mouseDown().perform();

            browser.sleep(uiEventTimeLimit);

            browser.actions().mouseMove({
                x: originalPosition.x + 1,
                y: 0
            }).perform();

            browser.sleep(uiEventTimeLimit);

            browser.actions().mouseMove({
                x: originalPosition.x + moveBy.x,
                y: originalPosition.y + moveBy.y
            }).perform();

            browser.sleep(uiEventTimeLimit);

            browser.actions().mouseUp().perform();

            browser.sleep(gmeEventTimeLimit);

            browser.driver.executeScript(function (componentLabel) {

                var m;

                m = window.componentBoxByLabel(componentLabel)[0].getCTM();

                return {
                    x: m.e,
                    y: m.f
                };

            }, targetComponentLabel).then(function (newPosition1) {


                browser2.driver.executeScript(function (componentLabel) {

                    var m;

                    m = window.componentBoxByLabel(componentLabel)[0].getCTM();

                    return {
                        x: m.e,
                        y: m.f
                    };

                }, targetComponentLabel).then(function (newPosition2) {

                    expect(newPosition1).toEqual(newPosition2);

                });
            });
        });

    });

    it('Should be able to selected component clickin on it', function () {

        var componentBox;

        componentBox = element(by.diagramComponentLabel(targetComponentLabel));

        componentBox.click();

        browser.wait(function () {

                return hasClass(componentBox, 'selected');
            },
            gmeEventTimeLimit,
            'element did not get selected'
        );

    });

    it('Should be able to trash selected component box by hitting DELETE key', function () {

        var componentBox,
            otherComponentBox;

        browser.driver.getCurrentUrl().then(function (currentUrl) {

            componentBox = element(by.diagramComponentLabel(targetComponentLabel));
            otherComponentBox = browser2.element(by.diagramComponentLabel(targetComponentLabel));

            browser.driver.executeScript(function (componentLabel) {

                var e;

                e = jQuery.Event("keydown");
                e.keyCode = 8;

                $(document).trigger(e);

            });

            browser.sleep(gmeEventTimeLimit);

            expect(browser.isElementPresent(componentBox)).toEqual(false);
            expect(browser2.isElementPresent(otherComponentBox)).toEqual(false);

            expect(browser2.driver.getCurrentUrl()).toEqual(currentUrl);

        });

    });

    it('Inspector should load wire details if selected, and remove if unselected', function() {

        var checkWireSelection = function (browser, wireIdToSelect, segmentIndexToSelect, expectedResult) {
                browser.driver.executeScript(function (wireId, segmentIndex) {

                    var wireEl = document.getElementById(wireId),
                        wireSegmentEl = wireEl.querySelectorAll('.component-wire-segment')[segmentIndex];

                    ['mousedown', 'mouseup'].forEach(function (eventType) {
                        var mouseEvent = new Event(eventType, {bubbles: true, cancelable: false});

                        wireSegmentEl.dispatchEvent(mouseEvent);
                    });

                }, wireIdToSelect, segmentIndexToSelect).then(function () {

                    browser.driver.executeScript(function () {

                        return document.querySelector('div.diagram-wire-inspector');

                    }).then(function (wireInspectorEl) {

                        if( expectedResult === null ) {

                            expect(wireInspectorEl).toBe(expectedResult);

                        }
                        else {

                            expect(wireInspectorEl.isDisplayed()).toBe(expectedResult);

                        }

                    });

                });

            };

        element(by.css('div.footer-drawer > header > ul > li:nth-child(1) > button')).click();
        // Select Wire
        checkWireSelection(browser, wireIdToSelect, segmentIndexToSelect, true);

        browser.sleep(1000);

        // Deselect Wire
        checkWireSelection(browser, wireIdToSelect, segmentIndexToSelect, null);

    });

    it('Should be able to move between component containers by double-clicking component', function() {
         var componentBox;

         componentBox = element(by.diagramComponentLabel(targetContainerLabel));

         browser.actions().doubleClick(componentBox).perform();

         browser.sleep(1000);

         browser.element.all(by.css('span.item-label.ng-binding')).getText()
             .then(function(elementTexts) {

                 var designPath = elementTexts
                     .join('/')
                     .slice(1);

                 expect(designPath).toEqual(mainContainerLabel + "/" + targetContainerLabel);
             });


    });

    it('Should be able to move between component containers by using menu buttons', function() {

         var mainLevel,
             secondLevel;

         mainLevel = element(by.getHierarchyByVisibleDropdownLabel(mainContainerLabel));

         browser.actions().mouseMove(mainLevel).perform();

         secondLevel = element(by.getHierarchyByHiddenDropdownLabel(targetContainerLabel));

         secondLevel.click();

         browser.sleep(1000);

         // Expect hierarchy to be mainLevel / secondLevel
         browser.element.all(by.css('span.item-label.ng-binding')).getText()
             .then(function(elementTexts) {

                 var designPath = elementTexts
                     .join('/')
                     .slice(1);

                 expect(designPath).toEqual(mainContainerLabel + "/" + targetContainerLabel);

             });


         mainLevel.click();

         browser.sleep(1000);

         // Expect hierarchy to return mainLevel
         browser.element.all(by.css('span.item-label.ng-binding')).getText()
             .then(function(elementTexts) {

                 var designPath = elementTexts
                     .join('/')
                     .slice(1);

                 expect(designPath).toEqual(mainContainerLabel);

             });

    });

});

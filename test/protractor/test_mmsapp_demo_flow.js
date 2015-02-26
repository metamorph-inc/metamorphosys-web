/*global describe,it,browser,expect,by,before,beforeAll,element, afterAll, $, angular, protractor*/

describe('Metamorphosys Tech Demo Flow', function () {

    var q = require('q'),
        dragAndDropHelper = require('./lib/drag_and_drop_helper.js'),
        hasClass = require('./lib/has_class.js'),

        gmeEventTimeLimit = 2000,
        uiEventTimeLimit = 200,

        projectName,
        url,

        browser2,

        targetComponentLabel = '3 Axis Accelerometer',

        $rootScope1,
        $rootScope2;


    require('./lib/find_diagramComponent_by_labelText.js');

    beforeAll(function loadTestProject(done) {
        if (false) {
            // FIXME: copyproject takes many seconds. For faster turnaround, use a pre-created project
            projectName = 'Test_79838';
            done();
        } else {
            require('http').get('http://localhost:8855/rest/external/copyproject/noredirect', function (res) {
                if (res.statusCode > 399) {
                    done(res.statusCode);
                }
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    /* fair assumption that projectName fits in one chunk */
                    projectName = chunk;
                    done();
                });
            });
        }

    });

    afterAll(function (done) {
        // Calling quit will remove the browser.
        // You can choose to not quit the browser, and protractor will quit all of
        // them for you when it exits (i.e. if you need a static number of browsers
        // throughout all of your tests). However, I'm forking browsers in my tests
        // and don't want to pile up my browser count.
        if (browser2) {
            browser2.quit().then(function () {
                done();
            });
        } else {
            done();
        }
    });

    it('Should create and load new design', function () {

        browser.get('http://localhost:8855/extlib/public/apps/mmsApp/#/createDesign/' + projectName);

        var diagramContainer;

        diagramContainer = element(by.css('div.diagram-container'));

        expect(browser.getTitle()).toEqual('Metamorphosys');

        browser.wait(function () {

                return diagramContainer.isPresent();
            },
            5000,
            'diagramContainer not found'
        ).then(function () {

                //$rootScope1 = angular.element(document).scope();

            });

        expect(browser.isElementPresent(diagramContainer)).toEqual(true);
        expect(element.all(by.css('text.component-label')).count()).toEqual(4);


    }, 1000 * 60 * 2);

    it('Should have about dialog open', function () {

        var aboutDialog,
            closeButton;

        aboutDialog = element(by.css('.about-dialog'));
        closeButton = element(by.css('.about-dialog .md-actions button.md-primary'));

        browser.wait(function () {
                return aboutDialog.isDisplayed();
            },
            2000,
            'aboutDialog not found'
        )
            .then(function () {

                expect(browser.isElementPresent(aboutDialog)).toEqual(true);
                expect(closeButton.isDisplayed()).toBeTruthy();
                closeButton.click();

            });

    }, 5000);

    //it('Should be able to drag-pan', function () {
    //
    //    var diagramContainer;
    //
    //    diagramContainer = browser.element(by.css('div.diagram-container'));
    //
    //    browser.actions()
    //        .mouseMove({x: 300, y: 300})
    //        .mouseDown()
    //        .perform();
    //
    //
    //    browser.sleep(uiEventTimeLimit);
    //
    //    browser.actions().mouseMove({x: 250, y: 250}).perform();
    //
    //    browser.sleep(uiEventTimeLimit);
    //
    //    browser.actions().mouseUp().perform();
    //
    //    browser.sleep(5000);
    //
    //});


    it('Should have component browser', function () {

        var componentBrowser,
            componentSearchInput;

        componentBrowser = element(by.css('.component-browser'));
        expect(browser.isElementPresent(componentBrowser)).toEqual(true);

        componentSearchInput = element(by.css('.component-search-input'));
        expect(browser.isElementPresent(componentSearchInput)).toEqual(true);

    });

    it('Component search should return search results', function () {

        var componentSearchInput,
            searchDropdown,
            searchResults;

        componentSearchInput = element(by.css('.component-search-input'));
        searchDropdown = element(by.css('.component-search .angucomplete-dropdown'));
        searchResults = element.all(by.css('.component-search .angucomplete-row'));

        componentSearchInput.sendKeys('sens')
            .then(function () {

                browser.wait(function () {
                        return searchDropdown.isDisplayed();
                    },
                    1000,
                    'search results not displayed')
                    .then(function () {
                        expect(searchResults.count()).toBeGreaterThan(0);


                        componentSearchInput.sendKeys('enona')
                            .then(function () {

                                // Making sure back-space/delete works in input field
                                componentSearchInput.sendKeys(protractor.Key.BACK_SPACE)
                                    .then(function () {

                                        expect(componentSearchInput.getAttribute('value')).toEqual('sensenon');

                                        browser.wait(function () {
                                                return searchDropdown.isDisplayed();
                                            },
                                            1000,
                                            'search results not displayed')
                                            .then(function () {
                                                expect(searchResults.count()).toEqual(0);
                                            });
                                    });
                            });

                    });

            });

    });

    it('Shoud display Sensors category', function () {

        var sensorCategoryItem;

        sensorCategoryItem = element(by.css('.component-browser li[title=sensors]'));
        expect(sensorCategoryItem.isDisplayed()).toBeTruthy();

    });

    it('Sensors category should expand and show sensors', function () {

        var sensorCategoryExpander,
            childrenList,
            sensors;

        sensorCategoryExpander = element(by.css('.component-browser li[title=sensors] .node-expander'));
        childrenList = element(by.css('.component-browser li[title=sensors] > .node-list'));
        sensors = childrenList.all(by.css('li'));

        sensorCategoryExpander.click()
            .then(function () {

                browser.wait(function () {
                        return childrenList.isDisplayed();
                    },
                    1000,
                    'no sensors in category')
                    .then(function () {
                        expect(sensors.count()).toBeGreaterThan(0);
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

            expect(browser2.driver.getCurrentUrl()).toMatch(currentUrl);

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
        expect(browser2.element.all(by.css('text.component-label')).count()).toEqual(4);

        closeButton = browser2.element(by.css('.about-dialog .md-actions button.md-primary'));
        closeButton.click();

    });

    it('Should be able to create component instance by dragging', function () {

        var componentBox,
            otherComponentBox;

        componentBox = element(by.diagramComponentLabel(targetComponentLabel));
        otherComponentBox = browser2.element(by.diagramComponentLabel(targetComponentLabel));

        browser.driver.executeScript(dragAndDropHelper)
            .then(function () {
                browser.driver.executeScript(function () {

                    $('li[title="3 Axis Accelerometer"] .label-and-extra-info').simulateDragDrop({
                        dropTarget: $('.diagram-container')
                    });

                }).then(function () {

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
            checkComponentRotation = function (browser, targetComponentLabel, expectedAngle) {
                browser.driver.executeScript(function (targetComponentLabel) {

                    return Math.acos(window.componentBoxByLabel(targetComponentLabel)[0].getCTM().a) / Math.PI * 180;

                }, targetComponentLabel).then(function (angle) {
                    expect(angle).toEqual(expectedAngle);
                });
            };

        componentBox = browser.findElement(by.diagramComponentLabel(targetComponentLabel));
        rotateCWButton = element(by.css('.contextmenu .action-rotateCW'));

        otherComponentBox = browser2.findElement(by.diagramComponentLabel(targetComponentLabel));
        rotateCCWButton = browser2.element(by.css('.contextmenu .action-rotateCCW'));

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

        browser.driver.executeScript(function (targetComponentLabel) {

            var m;

            m = window.componentBoxByLabel(targetComponentLabel)[0].getCTM();

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

            browser.driver.executeScript(function (targetComponentLabel) {

                var m;

                m = window.componentBoxByLabel(targetComponentLabel)[0].getCTM();

                return {
                    x: m.e,
                    y: m.f
                };

            }, targetComponentLabel).then(function (newPosition1) {


                browser2.driver.executeScript(function (targetComponentLabel) {

                    var m;

                    m = window.componentBoxByLabel(targetComponentLabel)[0].getCTM();

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

        browser.sleep(5000);

    });

    it('Should be able to trash selected component box by hitting DELETE key', function () {

        var componentBox,
            otherComponentBox;

        browser.driver.getCurrentUrl().then(function (currentUrl) {

            componentBox = element(by.diagramComponentLabel(targetComponentLabel));
            otherComponentBox = browser2.element(by.diagramComponentLabel(targetComponentLabel));

            browser.driver.executeScript(function (targetComponentLabel) {

                var e;

                e = jQuery.Event("keydown");
                e.keyCode = 8;

                $(document).trigger(e);

            });

            browser.sleep(gmeEventTimeLimit);

            expect(browser.isElementPresent(componentBox)).toEqual(false);
            expect(browser2.isElementPresent(otherComponentBox)).toEqual(false);

            expect(browser2.driver.getCurrentUrl()).toMatch(currentUrl);

        });

    });

});

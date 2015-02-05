/*global describe,it,browser,expect,by,before,beforeAll,element, afterAll*/
describe('Metamorphosys Tech Demo Flow', function () {
    var q = require('q'),
        projectName,
        url,
        b2;


    beforeAll(function loadTestProject(done) {
        if (false) {
            // FIXME: copyproject takes many seconds. For faster turnaround, use a pre-created project
            projectName = 'Test_79838';
            done();
        } else {
            require('http').get('http://localhost:8855/rest/external/copyproject/noredirect', function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    /* fair assumption that projectName fits in one chunk */
                    projectName = chunk;
                    done();
                });
            });
        }
    });

    afterAll(function(done) {
        // Calling quit will remove the browser.
        // You can choose to not quit the browser, and protractor will quit all of
        // them for you when it exits (i.e. if you need a static number of browsers
        // throughout all of your tests). However, I'm forking browsers in my tests
        // and don't want to pile up my browser count.
        if (b2) {
            b2.quit().then(function() {
                done();
            });
        } else {
            done();
        }
    });

    it('Should create and load new design', function () {
        browser.get('http://localhost:8855/extlib/src/app/mmsApp/#/createDesign/' + projectName);

        var diagramContainer;

        diagramContainer = element(by.css('div.diagram-container'));

        expect(browser.getTitle()).toEqual('Metamorphosys');

        browser.wait(function () {

                return diagramContainer.isPresent();
            },
            5000,
            'diagramContainer not found'
        );

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
            .then(function(){

                expect(browser.isElementPresent(aboutDialog)).toEqual(true);
                expect(closeButton.isDisplayed()).toBeTruthy();
                closeButton.click();

            });

    }, 5000);

    it('Should have component browser', function () {

        var componentBrowser,
            componentSearchInput;

        componentBrowser = element(by.css('.component-browser'));
        expect(browser.isElementPresent(componentBrowser)).toEqual(true);

        componentSearchInput = element(by.css('.component-search-input'));
        expect(browser.isElementPresent(componentSearchInput)).toEqual(true);

    });

    it('Component search should return search results', function() {

        var componentSearchInput,
            searchDropdown,
            searchResults;

        componentSearchInput = element(by.css('.component-search-input'));
        searchDropdown = element(by.css('.component-search .angucomplete-dropdown'));
        searchResults = element.all(by.css('.component-search .angucomplete-row'));

        componentSearchInput.sendKeys('sens')
            .then(function(){

                browser.wait(function(){
                    return searchDropdown.isDisplayed();
                },
                1000,
                'search results not displayed')
                    .then(function(){
                        expect(searchResults.count()).toBeGreaterThan(0);


                        componentSearchInput.sendKeys('enon')
                            .then(function(){

                                browser.wait(function(){
                                        return searchDropdown.isDisplayed();
                                    },
                                    1000,
                                    'search results not displayed')
                                    .then(function() {
                                        expect(searchResults.count()).toEqual(0);
                                    });
                            });

                    });

            });

    });

    it('Shoud display Sensors category', function() {

        var sensorCategoryItem;

        sensorCategoryItem = element(by.css('.component-browser li[title=sensors]'));
        expect(sensorCategoryItem.isDisplayed()).toBeTruthy();

    });

    it('Sensors category should expand and show sensors', function(){

        var sensorCategoryExpander,
            childrenList,
            sensors;

        sensorCategoryExpander = element(by.css('.component-browser li[title=sensors] .node-expander'));
        childrenList = element(by.css('.component-browser li[title=sensors] > .node-list'));
        sensors = childrenList.all(by.css('li'));

        sensorCategoryExpander.click()
            .then(function(){

                browser.wait(function(){
                   return childrenList.isDisplayed();
                },
                1000,
                'no sensors in category')
                    .then(function(){
                        expect(sensors.count()).toBeGreaterThan(0);
                    });

            });

    });

    it('Should be able to navigate to same project and design in other browser', function() {

        var diagramContainer,
            closeButton;

        b2 = browser.forkNewDriverInstance(true);

        expect(b2).not.toEqual(browser);
        expect(b2.driver).not.toEqual(browser.driver);

        browser.driver.getCurrentUrl().then(function(currentUrl) {

            expect(b2.driver.getCurrentUrl()).toMatch(currentUrl);

        });

        diagramContainer = b2.element(by.css('div.diagram-container'));

        expect(b2.getTitle()).toEqual('Metamorphosys');

        b2.wait(function () {

                return diagramContainer.isPresent();
            },
            5000,
            'diagramContainer not found'
        ).then(function(){


            });

        expect(b2.isElementPresent(diagramContainer)).toEqual(true);
        expect(b2.element.all(by.css('text.component-label')).count()).toEqual(4);

        closeButton = b2.element(by.css('.about-dialog .md-actions button.md-primary'));
        closeButton.click();

    });

    it('Should be able to create component instance by dragging', function() {

        var componentElementDragHandler,
            svgDiagram;

        componentElementDragHandler = element(by.css('li[title="3 Axis Accelerometer"] .label-and-extra-info'));
        svgDiagram = element(by.css('.diagram-container'));

        browser.driver.actions().
            mouseMove(componentElementDragHandler, {x:10, y:10}).
            mouseDown().
            mouseMove(svgDiagram, {x: 10, y: 10}).
            perform();

    });

});

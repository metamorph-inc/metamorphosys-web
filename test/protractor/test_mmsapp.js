/*global describe,it,browser,expect,by,before,element*/
describe('mmsapp', function() {
    var q = require('q'),
        projectName;
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

    it('should load', function() {
        browser.get('http://localhost:8855/extlib/src/app/mmsApp/#/createDesign/' + projectName);

        expect(browser.getTitle()).toEqual('Metamorphosys');

        var diagramContainer = element(by.css('div.diagram-container'));

        browser.wait(function(){
            return diagramContainer.isPresent();
        }, 5000);

        expect(browser.isElementPresent(diagramContainer)).toEqual(true);
        expect(element.all(by.css('text.component-label')).count()).toEqual(4);


    }, 1000 * 60 * 2);
});

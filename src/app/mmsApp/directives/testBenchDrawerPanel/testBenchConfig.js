'use strict';

angular.module('mms.testBenchDrawerPanel.testBenchConfig', [
])

.directive('testBenchConfig', function($compile) {

    function TestBenchConfigController() {

    }

    return {
        restrict: 'E',
        controller: TestBenchConfigController,
        controllerAs: 'ctrl',
        bindToController: true,
        replace: true,
        transclude: false,
        scope: {
            testBench: '=',
            directive: '='
        },
        require: ['testBenchConfig', '^testBenchDrawerPanelTestList'],
        template: '<div class="custom-test-bench-config-wrapper"><div class="place-holder"></div>',
        link: function(scope, $el, attributes, controllers) {

            var element = $el[0],
                placeHolderEl = element.querySelector('.place-holder'),
                ctrl = controllers[0],
                listCtrl = controllers[1],
                compiledDirective;

            listCtrl.compiledConfigDirectives = listCtrl.compiledConfigDirectives || {};

            if (ctrl.directive) {

                compiledDirective = listCtrl.compiledConfigDirectives[ctrl.directive];

                if (!compiledDirective) {

                    compiledDirective = $compile(
                        angular.element(
                            '<' + ctrl.directive + '>' +
                            '</' + ctrl.directive + '>'
                        )
                    );

                    if (compiledDirective) {
                        listCtrl.compiledConfigDirectives[ctrl.directive] = compiledDirective;
                    } else {
                        throw new Error('Config directive could not be compiled' + ctrl.directive);
                    }
                }

                compiledDirective(scope, function(clonedElement) {
                    element.replaceChild(clonedElement[0], placeHolderEl);
                });

            } else {
                throw new Error('No config directive specified for testbench [' + ctrl.testBench.name + ']');
            }

        }
    };
})

.directive('dummyTestBenchConfig', function() {

    return {
            restrict: 'E',
            replace: true,
            scope: true,
            template: '<div>Dummy thing. Ain\'t anything to config with me. Upgrade to get the real thing.</div>'
    };

});

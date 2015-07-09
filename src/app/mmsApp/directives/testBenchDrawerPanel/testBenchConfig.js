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
            testBench: '='
        },
        require: ['testBenchConfig', '^testBenchDrawerPanelTestList'],
        template: '<div class="custom-test-bench-config-wrapper"><div class="place-holder"></div>',
        link: function(scope, $el, attributes, controllers) {

            var element = $el[0],
                placeHolderEl = element.querySelector('.place-holder'),
                ctrl = controllers[0],
                listCtrl = controllers[1],
                compiledDirective,
                configDirective = ctrl.testBench.directives && ctrl.testBench.directives.config;

            listCtrl.compiledConfigDirectives = listCtrl.compiledConfigDirectives || {};

            if (configDirective) {

                compiledDirective = listCtrl.compiledConfigDirectives[configDirective];

                if (!compiledDirective) {

                    compiledDirective = $compile(
                        angular.element(
                            '<' + configDirective + '>' +
                            '</' + configDirective + '>'
                        )
                    );

                    if (compiledDirective) {
                        listCtrl.compiledConfigDirectives[configDirective] = compiledDirective;
                    } else {
                        throw new Error('Config directive could not be compiled' + configDirective);
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

/*global moment*/

'use strict';

angular.module('mms.testBenchDrawerPanel.testBenchResultDetails', [
])

.directive('testBenchResultDetails', function($compile) {

    function TestBenchResultDetailsController() {

    }

    return {
        restrict: 'E',
        controller: TestBenchResultDetailsController,
        controllerAs: 'ctrl',
        bindToController: true,
        replace: true,
        transclude: false,
        templateUrl: '/mmsApp/templates/resultListDetailsTemplate.html',
        scope: {
            result: '='
        },
        require: ['testBenchResultDetails', '^testBenchDrawerPanelResultList'],
        link: function(scope, $el, attr, controllers) {

            var element = $el[0],
                placeHolderEl = element.querySelector('.testbench-result-details-place-holder'),
                ctrl = controllers[0],
                listCtrl = controllers[1],
                compiledDirective,
                resultDetailsDirective;

            resultDetailsDirective =
                ctrl.result &&
                ctrl.result.testBench.directives &&
                ctrl.result.testBench.directives.resultDetails;

            listCtrl.compiledResultDetailsDirectives = listCtrl.compiledResultDetailsDirectives || {};

            if (resultDetailsDirective) {

                compiledDirective = listCtrl.compiledResultDetailsDirectives[resultDetailsDirective];

                if (!compiledDirective) {

                    compiledDirective = $compile(
                        angular.element(
                            '<' + resultDetailsDirective + ' result="ctrl.result">' +
                            '</' + resultDetailsDirective + '>'
                        )
                    );

                    if (compiledDirective) {
                        listCtrl.compiledResultDetailsDirectives[resultDetailsDirective] = compiledDirective;
                    } else {
                        throw new Error('Result details directive could not be compiled' + resultDetailsDirective);
                    }
                }

                compiledDirective(scope, function(clonedElement) {
                    element.replaceChild(clonedElement[0], placeHolderEl);
                });

            }

        }
    };

});

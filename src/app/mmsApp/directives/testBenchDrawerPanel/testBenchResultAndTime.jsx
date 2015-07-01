'use strict';

angular.module('mms.testBenchDrawerPanel.resultAndTime', [
])

.directive('testBenchResultAndTime', function() {

    function TestBenchResultAndTimeController() {

    }

    return {
        restrict: 'E',
        controller: TestBenchResultAndTimeController,
        controllerAs: 'ctrl',
        bindToController: true,
        replace: true,
        transclude: false,
        template: '<div class="test-bench-result-and-time-wrapper"></div>',
        scope: {
            result: '='
        },
        require: ['componentDetails'],
        link: function(scope, element, attr, controllers) {

            var ctrl = controllers[0];

            function cleanup() {
              React.unmountComponentAtNode(element[0]);
            }

            function render() {
                React.render(<TestBenchResultAndTime result={ctrl.result} />, element[0]);
            }

            scope.$watch(function() {
                if (ctrl.result) {
                    return ctrl.result;
                }
            }, function(newO, oldO){

                if ((oldO !== newO || oldO != null) && newO != null) {

                    cleanup();
                    render();
                }
            });

            scope.$on('$destroy', cleanup());

        }
    };


});

class TestBenchResultAndTime extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        var cssClass = 'test-bench-result-and-time';

        if (this.props.status) {
            cssClass += ' ' + this.props.status;
        }

        return (
            <div className={cssClass}>
                <div className="start-time date-and-time">Start time</div>
                <div className="end-time date-and-time">End time</div>
                <div className="status">{this.props.status}</div>
            </div>
        );
    }

}

/*global moment*/

'use strict';

angular.module('mms.testBenchDrawerPanel.resultAndTime', [
])

.directive('testBenchResultAndTime', function($compile) {

    var compiledDirectives = {};

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
        require: ['testBenchResultAndTime'],
        link: function(scope, element, attr, controllers) {

            var ctrl = controllers[0],
                resultCompactDirective,
                compiledDirective,
                resultCompactElement;

            function cleanup() {
                React.unmountComponentAtNode(element[0]);
            }

            function render() {

                resultCompactDirective =
                    ctrl.result &&
                    ctrl.result.testBench.directives &&
                    ctrl.result.testBench.directives.resultCompact;

                if (resultCompactDirective) {

                        compiledDirective = compiledDirectives[resultCompactDirective];

                        if (!compiledDirective) {

                            compiledDirective = $compile(
                                angular.element(
                                    '<' + resultCompactDirective + ' result="result">' +
                                    '</' + resultCompactDirective + '>'
                                )
                            );

                            compiledDirectives[resultCompactDirective] = compiledDirective;

                        }

                        scope.result = ctrl.result;

                        compiledDirective(scope, function(clonedElement) {
                            resultCompactElement = clonedElement[0];
                        });

                }

                React.render(<TestBenchResultAndTime
                    result={ctrl.result}
                    resultCompactElement={resultCompactElement}
                    />, element[0]);
            }

            scope.$watch(function() {

                return ctrl.result && ctrl.result.status;

            }, function(newO, oldO){

                if ( newO !== null && oldO !== newO ){
                    cleanup();
                    render();
                }
            });

            render();

            scope.$on('$destroy', cleanup);

        }
    };


});

function timeFormatter(dateString) {

    var result;

    if (dateString) {
        result = moment(dateString).format('MM/DD/YY h:mma');
    } else {
        result = '---';
    }

    return result;

}

class TestBenchResultAndTime extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        if (this.props.resultCompactElement) {

            var node = React.findDOMNode(this.refs.status);

            node.innerHTML = '';
            node.appendChild(this.props.resultCompactElement);

        }
    }

    render() {

        var cssClass = 'test-bench-result-and-time',
            innerContents = [];

        if (this.props.result) {

            if (this.props.result.status) {
                cssClass += ' ' + this.props.result.status.toLowerCase();
            }

            innerContents.push(
                <div className="start-time date-and-time">{timeFormatter(this.props.result.startTime)}</div>
            );

            innerContents.push(
                <div className="start-end-time-separator"><i className="glyphicon glyphicon-arrow-down"></i></div>
            );

            innerContents.push(
                <div className="end-time date-and-time">{timeFormatter(this.props.result.endTime)}</div>
            );

            innerContents.push(
                <div ref="status" className="status">{this.props.result.status}</div>
            );


        } else {

            cssClass += ' no-result';
            innerContents.push(<div class="no-result-label">---</div>);

        }

        return (
            <div className={cssClass}>
                {innerContents}
            </div>
        );
    }

}

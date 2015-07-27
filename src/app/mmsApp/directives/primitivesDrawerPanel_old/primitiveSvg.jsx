/*global moment*/

'use strict';

angular.module('mms.primitiveDrawerPanel.primitiveSvg', [
])

.directive('primitiveSvg', function($compile) {

    function PrimitiveSvgController() {

    }

    return {
        restrict: 'E',
        controller: PrimitiveSvgController,
        controllerAs: 'ctrl',
        bindToController: true,
        replace: true,
        transclude: false,
        template: '<div class="primitive-svg-wrapper"></div>',
        scope: {
            result: '='
        },
        require: ['primitiveSvg'],
        link: function(scope, element, attr, controllers) {

            var ctrl = controllers[0],
                compiledDirective,
                svgElement;

            function cleanup() {
                React.unmountComponentAtNode(element[0]);
            }

            function render() {

                compiledDirective = $compile(
                    angular.element(
                        '<test-bench-result-opener result="ctrl.result">' +
                        '</test-bench-result-opener>'
                    )
                );

                compiledDirective(scope, function(clonedElement) {

                    svgElement = clonedElement[0];

                });

                React.render(<PrimitiveSvg
                        result={ctrl.result}
                        svgElement={svgElement}
                        />, element[0]); ///
            }

            render();

            scope.$on('$destroy', cleanup);
        }
    };

});

class TestBenchResultAndTime extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        if (this.props.resultCompactElement) {

            var node = React.findDOMNode(this.refs.status);

            if (node) {
                node.innerHTML = '';
                node.appendChild(this.props.resultCompactElement);
                
                if (this.props.deleteElement) {
                    node.appendChild(this.props.deleteElement);
                }
            }
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

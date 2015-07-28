'use strict';

class PrimitiveGrid extends React.Component {

    render() {

        this.items = this.props.primitives.map( (item, index) => {

            return <PrimitiveGridItem primitive={item} ref={index} key={item.id}/>;
        });

        return <div className="primitive-grid">{this.items}</div>;
    }

    componentDidMount() {

        let nameWidths = [],
            descriptionWidths = [];


        for (let i in this.refs) {

            // let itemEl = React.findDOMNode(this.refs[i]);
            //
            // itemEls.push(itemEl);

            let item = this.refs[i];

            nameWidths.push(item.getNameWidth());
            descriptionWidths.push(item.getDescriptionWidth());

        }

        let widestNameWidth = Math.max.apply(null, nameWidths);
        let widestDescriptionWidth = Math.max.apply(null, descriptionWidths);
        let widestSvgWidth = 150;
        let widestSvgHeight = 150;

        let itemWidth = widestNameWidth + widestDescriptionWidth + widestSvgWidth;
        let minItemHeight = widestSvgHeight;        

        for (let i in this.refs) {

            let item = this.refs[i];

            item.setWidth(itemWidth);
            item.setMinHeight(minItemHeight);

        }

    }

}


class PrimitiveGridItem extends React.Component {

    render() {

        var divStyle = {
              fill: 'white',
              stroke:'black',
              strokeWidth:5, // note the capital 'W' here
              fillRule:'nonzero' // 'ms' is the only lowercase vendor prefix
            };

        var svgEl = <div className="primitive-svg" ref="svg">
                        <svg height="100" width="100">
                          <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="white" />
                        </svg> 
                    </div>;


        var nameEl = <div className="primitive-name" title={this.props.primitive.name} ref="name">
                        {this.props.primitive.name}
                    </div>;

        var descriptionEl = <div className="primitive-description" title={this.props.primitive.description} ref="description">
                        {this.props.primitive.description}
                    </div>;

        return <div className="primitive-grid-item">{svgEl}{nameEl}{descriptionEl}</div>;

    }

    getNameWidth() {

        return Math.ceil(
            parseFloat(
                getComputedStyle(React.findDOMNode(this.refs.name)).width
            )
        );
    }

    getDescriptionWidth() {

        return Math.ceil(
            parseFloat(
                getComputedStyle(React.findDOMNode(this.refs.description)).width
            )
        );
    }

    setWidth(w) {
        React.findDOMNode(this).style.width = w + 'px';
    }

    setMinHeight(h) {
        React.findDOMNode(this).style.minHeight = h + 'px';
    }
}

module.exports = PrimitiveGrid;

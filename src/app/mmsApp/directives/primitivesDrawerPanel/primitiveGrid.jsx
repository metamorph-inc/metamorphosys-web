'use strict';

class PrimitiveGrid extends React.Component {

    render() {

        this.items = this.props.primitives.map( (item, index) => {

            return <PrimitiveGridItem primitive={item} ref={index} key={item.id}/>;
        });

        return <div className="primitive-grid">{this.items}</div>;
    }

    componentDidMount() {

        // let nameWidths = [],
        //     descriptionWidths = [];


        // for (let i in this.refs) {

        //     let item = this.refs[i];

        //     nameWidths.push(item.getNameWidth());
        //     descriptionWidths.push(item.getDescriptionWidth());

        // }

        // let widestNameWidth = Math.max.apply(null, nameWidths);
        // let widestDescriptionWidth = Math.max.apply(null, descriptionWidths);
        // let widestSvgWidth = 150;
        // let widestSvgHeight = 150;

        // let itemWidth = widestNameWidth + widestDescriptionWidth + widestSvgWidth;
        // let minItemHeight = widestSvgHeight;        

        // for (let i in this.refs) {

        //     let item = this.refs[i];

        //     item.setWidth(itemWidth);
        //     item.setMinHeight(minItemHeight);

        // }

    }

}

class PrimitiveGridItem extends React.Component {

    render() {

        var primitiveSvgTag = '<use xlink:href="images/symbols.svg#icon-simpleConnector" />';

        var svgEl = <div className="primitive-svg-wrapper" ref="svg">
                        <svg className="primitive-svg" viewBox={this.props.primitive.svgViewBox} dangerouslySetInnerHTML={{__html: primitiveSvgTag }} />
                    </div>;

        // var primitivePngEl = <img className="primitive-png" src={"images/" + "simple-connector" /*this.props.primitive.id*/ + ".png"} />

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

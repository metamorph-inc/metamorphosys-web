'use strict';

class PrimitiveGrid extends React.Component {

    render() {

        this.items = this.props.primitives.map( (item, index) => {

            return <PrimitiveGridItem primitive={item} ref={index} key={item.id}/>;
        });

        return <div className="primitive-grid">{this.items}</div>;
    }

    componentDidMount() {

        // let svgHeights;


        // for (let i in this.refs) {

        //     let item = this.refs[i];

        //     svgHeights.push(item.getSvgHeight());

        // }

        // let biggestSvgHeight = Math.max.apply(null, svgHeights);

        // let minItemHeight = widestSvgHeight + 55;  // 55 Includes item header (35) & margin (20)        

        // for (let i in this.refs) {

        //     let item = this.refs[i];

        //     item.setMinHeight(minItemHeight);

        // }

    }

}

class PrimitiveGridItem extends React.Component {

    render() {

        var primitiveSvgTag = '<use xlink:href="images/symbols.svg#icon-' + this.props.primitive.id +'" />';

        var svgEl = <div className="primitive-svg-wrapper" ref="svg">
                        <svg className="primitive-svg" viewBox={this.props.primitive.svgViewBox} dangerouslySetInnerHTML={{__html: primitiveSvgTag }} />
                    </div>;

        var nameEl = <div className="primitive-name" title={this.props.primitive.id} ref="name">
                        {this.props.primitive.name}
                    </div>;

        var descriptionEl = <div className="primitive-description" title={this.props.primitive.description} ref="description">
                        {this.props.primitive.description}
                    </div>;

        var detailsEl = <div className="primitive-details">{descriptionEl}{svgEl}</div>;

        return <div className="primitive-grid-item" draggable="true">{nameEl}{descriptionEl}{svgEl}</div>;

    }

    // getSvgHeight() {

    //     var viewBox = this.props.primitive.viewBox;

    //     return Math.ceil(

    //         parseFloat(viewBox.substring(viewBox.lastIndexOf(" ") + 1));

    //         parseFloat(
    //             getComputedStyle(React.findDOMNode(this.refs.name)).width
    //         )
    //     );
    // }

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

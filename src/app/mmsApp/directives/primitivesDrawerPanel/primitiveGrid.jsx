'use strict';

class PrimitiveGrid extends React.Component {

    render() {

        this.items = this.listData.items.map( (item, index) => {

            return <PrimitiveGridItem primitive={item} ref={index} key={index}/>;
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
            descriptionWidths.push(item.getDescriptionWidthx());

        }

        let widestNameWidth = Math.max.apply(null, nameWidths);
        let widestDescriptionWidth = Math.max.apply(null, descriptionWidths);

        //let itemWidth = widestNameWidth + widestDescriptionWidth;

        for (let i in this.refs) {

            let item = this.refs[i];

            item.setNameWidth(widestNameWidth);
            item.setDescriptionWidth(widestDescriptionWidth);

        }

    }

}


class PrimitiveGridItem extends React.Component {

    render() {

        var nameEl = <div className="primitive-name" title={this.listData.item.primitive.name} ref="name">
                        {this.listData.item.primitive.name}
                    </div>;

        var descriptionEl = <div className="primitive-description" title={this.listData.item.primitive.description} ref="description">
                        {this.listData.item.primitive.description}
                    </div>;

        return <div className="primitive-grid-item">{nameEl}{descriptionEl}</div>;

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

    setNameWidth(w) {
        React.findDOMNode(this.refs.name).style.width = w + 'px';
    }

    setDescriptionWidth(w) {
        React.findDOMNode(this.refs.description).style.width = w + 'px';
    }

    setWidth(w) {
        React.findDOMNode(this).style.width = w + 'px';
    }
}

module.exports = PrimitiveGrid;

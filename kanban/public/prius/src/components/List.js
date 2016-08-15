import React, { Component, PropTypes } from 'react';
import { Panel, ListGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import Card from '../components/Card';
import ItemTypes from '../constants/ItemTypes';
import { DropTarget } from 'react-dnd';
const numeral = require('numeral');

// for dropping
const listTarget = {
  drop(props, monitor, component) {
    const card = monitor.getItem();
  },
};

const checkFilterMatch = (filterValues, docValue) =>
  filterValues.indexOf(docValue) > -1;


const isHidden = (doc, filters) => {
  filters.forEach((filter) => {
    if (filter.values.length > 0) {
      if (doc.hasOwnProperty(filter.id) && !checkFilterMatch(filter.values, doc[filter.id])) {
        return true;
      }
    }
  });
  return false;
};

const mapStateToProps = (state, props) => {
  const cards = state.cards.filter((card) =>
      card.parentList === props.id &&
      isHidden(card.doc, state.filters) == false
    );
  return {
    cards,
  };
};


@connect(mapStateToProps)
@DropTarget(ItemTypes.CARD, listTarget, (connect) => ({
  connectDropTarget: connect.dropTarget(),
}))
export default class List extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    description: PropTypes.object
  }
  formatNumber(fieldtype, number) {
    switch (fieldtype) {
      case 'Currency':
        return numeral(number).format('$0,0');
      case 'Int':
        return numeral(number).format('0,0');
      case 'Float':
        return numeral(number).format('0,0.00');
      default:
        return number;
    }
  }
  getSum(field, cards) {
    let sum = 0;
    for (let i = 0; i < cards.length; i++) {
      sum = sum + cards[i].doc[field.fieldname];
    }
    if (!isNaN(sum)) {
      return { sum: this.formatNumber(field.fieldtype, sum) }
    } else {
      return { sum: null }
    }
  }
  constructor(props) {
    super(props);
    this.getSum = this.getSum.bind(this);
    this.formatNumber = this.formatNumber.bind(this);
  }
  render() {
    const { title, description, cards } = this.props;
    const { connectDropTarget } = this.props;
    const { sum } = this.getSum(description, cards);

    return connectDropTarget(
      <div className="kanban-list">
        <Panel header={
          <div>
            <h4>
              {title}
              <small>
                <br />{description.label} - {sum}
                <br />{cards.length} in list
              </small>
            </h4>
          </div>
          }
        >
          <ListGroup>
            {cards.map((card) =>
              <Card {...card} />
            )}
          </ListGroup>
        </Panel>
      </div>
    );
  }
}

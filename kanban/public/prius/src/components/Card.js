import React, { Component, PropTypes } from 'react';
import { Panel, Modal, Button, ButtonToolbar, Row, Col } from 'react-bootstrap';
import ItemTypes from '../constants/ItemTypes';
import { DragSource } from 'react-dnd';
import '../style.css';
const numeral = require('numeral');
const moment = require('moment');

const cardSource = {
  beginDrag(props) {
    const { id, parentList } = props;
    return { id, parentList };
  },
};

// For connecting columns / dragging
@DragSource(ItemTypes.CARD, cardSource, (connect, monitor) => ({
  showModal: false,
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))


class Card extends Component {
  static propTypes = {
    key: PropTypes.string,
    doc: PropTypes.object,
    display: PropTypes.object,
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    showModal: PropTypes.bool.isRequired,
    url: PropTypes.string,
  };
  close() {
    this.setState({ showModal: false });
  }
  open() {
    this.setState({ showModal: true });
  }
  formatField(fieldtype, field) {
    if (fieldtype == 'Currency') {
      field = numeral(field).format('$0,0')
    } else if (fieldtype == 'Int') {
      field = numeral(field).format('0,0')
    } else if (fieldtype == 'Float') {
      field = numeral(field).format('0,0.00')
    } else if (fieldtype == 'Date' || fieldtype == 'Datetime') {
      if (field != null) {
        field = moment(field).format('dddd, MMM Do, YYYY')
      }
    }
    return field
  }
  // returns false if
  // - last communication is < 30 days ago
  // - next contact date is < 30 days ago
  // otherwise the lead is stale and returns true
  checkStale(doc, display) {
    var now = moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD')
    var contactDate = moment(doc.contact_date, 'YYYY-MM-DD');
    var staleDate = moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD').subtract(30, 'days');
    var state = true;

    if (staleDate.isBefore(contactDate)) {
      state = false;
    } else {
      state = this.checkCommunications(doc, display);
    }
    return state
  }
  // checks the dates of the communication history
  // returns true if stale and false if within 30 days
  checkCommunications(doc, display) {
    const staleDate = moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD').subtract(30, 'days');
    doc.communications.forEach((communication) => {
      const type1 = communication.communication_type;
      const type2 = communication.comment_type;
      if (type1 == 'Communication' || type2 != 'Updated') {
        const newDate = moment(communication.communication_date, 'YYYY-MM-DD');
        if (staleDate.isBefore(newDate)) {
          return false;
        }
      }
    });
    return true;
  }
  // validates and returns the state of the lead
  getStyle(doc, display) {
    const now = moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD');
    const contact = moment(doc.contact_date, 'YYYY-MM-DD');
    const nextWeek = moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD').add(7, 'days');
    const staleDate = this.checkStale(doc, display);
    // if a card has a nextContactBy within the next week
    if (now.isSameOrBefore(contact) && contact.isSameOrBefore(nextWeek)) {
      return 'imminentContact'
    } else if (now.isAfter(contact)) {
      return 'pastDueCall'
    }
    // if a card field is null, danger
    for (var prop in display) {
      if (display.hasOwnProperty(prop)) {
        if (display[prop] == null) {
          return 'missingData'
        }
      }
    }
    // if a card has a nextContactBy or last communication
    // date > 30 days less than the current
    if (staleDate) {
      return 'stale'
    }
    // all info is correct and no dates are due/past
    return 'statusOK'
  }
  constructor(props, context) {
    super(props, context);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.formatField = this.formatField.bind(this);
    this.getStyle = this.getStyle.bind(this);
    this.checkStale = this.checkStale.bind(this);
    this.state = {
      showModal: false,
    }
    this.checkCommunications = this.checkCommunications.bind(this);
  }
  render() {
    const { doc, url, display, key } = this.props;
// const { connectDragSource, isDragging } = this.props;
    return (
      <div className='kanban-card' id={key}>
        <Panel
          bsStyle={this.getStyle(doc, display)}
          header={display.titleField}
          onClick={this.open}
        >
          <small>
            {display.subOneLabel} - {formatField(display.subOneType, display.subOne)}
            <br />
            {display.subTwoLabel} - {formatField(display.subTwoType, display.subTwo)}
          </small>
        </Panel>
        <Modal
          bsStyle={this.getStyle(doc, display)}
          show={this.state.showModal}
          onEnter={this.addValue}
          onHide={this.close}
        >
          <Modal.Header>
            <Modal.Title>
              <Row>
                <Col sm={9} md={9} lg={9}>
                    <a
                      href={url}
                      target={url}
                    >
                      {formatField(display.titleFieldType, display.titleField)}
                    </a>
                </Col>
                <Col sm={3} md={3} lg={3}>
                  <ButtonToolbar bsClass='btn-toolbar pull-right'>
                    <Button bsSize='xsmall' onClick={this.close}>&times;</Button>
                  </ButtonToolbar>
                </Col>
              </Row>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Col>
              {getInfo(this.props.display)}
              <br />
              {getComms(this.props.doc.communications)}
            </Col>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default Card;


const makeField = (field, label) => {
  if (field == null) {
    return (
      <div className='form-group has-error' style={{ paddingLeft: 15 }}>
        <label className='control-label'>
          {label}
        </label>
        <br />
        <strong>No Information</strong>
      </div>
    );
  // } else if (getStyle(props.doc, props.display) == 'pastDueCall' && label == 'Next Contact Date') {
  //   var field_html = ('<div class='form-group has-error' style='padding-left:15px;'><label class='control-label'>'
  //     + label
  //     + '</label><br />'
  //     + '<strong>' + field + '</strong>'
  //     + '</div><br />')
  } else {
    return (
      <div className='form-group' style={{ paddingLeft: 15 }}>
        <label className='control-label'>
          {label}
        </label>
      <br />
      {field}
      </div>
    );
  }
};

const getInfo = (display) => {
  const subtitleOne = makeField(
    formatField(display.subOneType, display.subOne), display.subOneLabel);
  const subtitleTwo = makeField(
    formatField(display.subTwoType, display.subTwo), display.subTwoLabel);
  const fieldOne = makeField(
    formatField(display.fieldOneType, display.fieldOne), display.fieldOneLabel);
  const fieldTwo = makeField(
    formatField(display.fieldTwoType, display.fieldTwo), display.fieldTwoLabel);
  const fieldThree = makeField(
    formatField(display.fieldThreeType, display.fieldThree), display.fieldThreeLabel);
  const fieldFour = makeField(
    formatField(display.fieldFourType, display.fieldFour), display.fieldFourLabel);
  return (
    <Row>
      <Col sm={6} md={6}>
        {subtitleOne}{fieldOne}{fieldTwo}
      </Col>
      <Col sm={6} md={6}>
        {subtitleTwo}{fieldThree}{fieldFour}
      </Col>
    </Row>
  );
};


const makeHeader = (type, value) => {
  const octicon = {
    'comment': <i className='octicon octicon-comment-discussion icon-fixed-width' />,
    'communication': <i className='octicon octicon-device-mobile icon-fixed-width' />,
    'Status Update': <i className='octicon octicon-pencil icon-fixed-width' />,
  };
  return (
    <p
      style={{ maxWidth: 600, backgroundColor: '#ebeff2', marginBottom: 0,
               paddingLeft: 15, paddingTop: 7, paddingBottom: 7 }}
    >
      <span>{octicon[type]}{type}: {value}</span>
    </p>
  );
};

// returns the html formatted communication history
const getComms = (communications) =>
  <div className='panel panel-default' style={{ margin: -15 }}>
    <div className='panel-heading' data-toggle='collapse' href='#collapse1'>
      Communication History
      <i
        className='octicon octicon-chevron-down icon-fixed-width'
        style={{ float: 'right' }}
      >
      </i>
    </div>
    <div id='collapse1' className='panel-collapse collapse'>
      {communications.map((communication) => {
        let type = communication.communication_type
        const date = formatField('Date', communication.communication_date);
        if (type == 'Comment' && communication.comment_type == 'Updated') {
          type = 'Status Update'
        }
        return (
          <Row style={{ marginLeft: 0, marginRight: 0, marginTop: 0,
                        borderWidth: '0 0 0 3', borderColor: '#ebeff2' }}
          >
            {makeHeader(type, date)}
            {communication.content == null ?
              null
            : <div>
                <Row
                  style={{ marginTop: 5, marginLeft: 3, marginRight: 17,
                           borderRight: 2, borderColor: '#ebeff2' }}
                >
                  <Col sm={6} md={6} lg={6}>
                    <div className='form-group'>
                      <label className='control-label'>Subject</label>
                      <p>{communication.subject}</p>
                    </div>
                  </Col>
                  <Col sm={6} md={6} lg={6}>
                    <div className='form-group'>
                      <label className='control-label'>User</label>
                      <p>{communication.user}</p>
                    </div>
                  </Col>
                  <Col sm={12} md={12} lg={12}>
                    <div className='form-group'>
                      <label className='control-label'>Content</label>
                      <p>{communication.content}</p>
                    </div>
                  </Col>
                </Row>
            </div>}
          </Row>
        );
      })}
    </div>
  </div>;



const formatField = (fieldtype, field) => {
  if (fieldtype === 'Currency') {
    return numeral(field).format('$0,0');
  } else if (fieldtype === 'Int') {
    return numeral(field).format('0,0');
  } else if (fieldtype === 'Float') {
    return numeral(field).format('0,0.00');
  } else if (fieldtype === 'Date' || fieldtype === 'Datetime') {
    if (field != null) {
      return moment(field).format('dddd, MMM Do, YYYY');
    }
  }
  return field;
};

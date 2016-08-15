import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
const SimpleSelect = require('react-selectize').SimpleSelect;
const MultiSelect = require('react-selectize').MultiSelect;
import { bindActionCreators } from 'redux';
import { setFilter } from '../actions';


const mapDispatchToProps = (dispatch) => bindActionCreators({ setFilter }, dispatch);


@connect(null, mapDispatchToProps)
export default class Filter extends Component {
  static propTypes = {
    options: PropTypes.array,
  }
  render() {
    const self = this;
    const { title, id, type, options } = this.props;
    const mappedOptions = options.map((value) => {
      return { label: value, value };
    });
    if (type === 'SimpleSelect') {
      return (
        <SimpleSelect
          options={mappedOptions}
          placeholder={title}
          theme="material"
          onValueChange = {(value) => {
            self.setState(value);
            self.props.setFilter(id, value);
          }}
        />
      );
    } else if (type === 'MultiSelect') {
      return (
        <MultiSelect
          options={mappedOptions}
          placeholder={title}
          theme="material"
          onValuesChange={(values) => {
            self.setState(values);
            self.props.setFilter(id, values);
          }}
        />
      );
    }
    return null;
  }
}

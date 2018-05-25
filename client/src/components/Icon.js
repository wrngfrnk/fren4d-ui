import React, { Component } from 'react';
import './../styles/Icon.css';

export default class Icon extends Component {
    render() {
        return (
            <span className="oi" data-glyph={this.props.icon} title={this.props.icon} aria-hidden="true"></span>
        );
    }
}

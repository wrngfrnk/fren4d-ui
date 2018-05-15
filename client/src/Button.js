import React from 'react';
import './Button.css';

class Button extends React.Component {
    render() {
        let classes = this.props.buttonClass !== undefined ? this.props.buttonClass : '';
        return (
            <button disabled={this.props.disabled} className={"Button " + classes} onClick={this.props.action}>{this.props.text}</button>
        );
    }
}

export default Button;
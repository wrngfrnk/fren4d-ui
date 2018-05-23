import React from 'react';
import './Button.css';

class Button extends React.Component {
    shouldComponentUpdate(nextProps) {
        return this.props.disabled !== nextProps.disabled || this.props.text !== nextProps.text;
    }

    render() {
        let classes = this.props.buttonClass !== undefined ? this.props.buttonClass : '';
        return (
            <button disabled={this.props.disabled} className={"Button " + classes} onClick={() => this.props.action(this.props.callback || null)}>{this.props.text}</button>
        );
    }
}

export default Button;
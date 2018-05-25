import React from 'react';

import Icon from './Icon.js';

import './../styles/Button.css';

class Button extends React.Component {
    renderIcon() {
        if (this.props.icon) return <Icon icon={this.props.icon} />;
    }

    shouldComponentUpdate(nextProps) {
        return this.props.disabled !== nextProps.disabled || this.props.text !== nextProps.text;
    }

    render() {
        let classes = this.props.buttonClass !== undefined ? this.props.buttonClass : '';
        return (
            <button 
                disabled={this.props.disabled} 
                className={"Button " + classes} 
                onClick={() => this.props.action(this.props.callback || null)}
            >
                {this.renderIcon()}{this.props.text}
            </button>
        );
    }
}

export default Button;
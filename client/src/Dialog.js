import React from 'react';
import Button from './Button.js';
import './Dialog.css';

class Dialog extends React.PureComponent {
    constructor(props) {
        super(props);
        
        this.state = {
            show: true
        }
    }

    generateButtons() {
        return [<Button text="OK" />, <Button text="Cancel" />];
    }

    close() {
        this.setState({
            show: false
        })
    }

    render() {
        if(this.state.show) {
            return (
                <div className="dialog-backdrop">
                    <div className="dialog-box">
                        <div className="dialog-closer" onClick={this.close.bind(this)}>
                            x
                        </div>
                        <div className="dialog-title">
                            {this.props.title}
                        </div>
                        <div className="dialog-body">
                            {this.props.body}
                        </div>
                        <div className="dialog-buttons">
                            {this.generateButtons()}
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}

export default Dialog;
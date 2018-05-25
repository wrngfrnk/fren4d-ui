import React from 'react';
import ReactDOM from 'react-dom';
import Button from './Button.js';
import './../styles/Dialog.css';

import SaveDialog from './../Dialogs/Save.js';
import LoadDialog from './../Dialogs/Load.js';

class Dialog extends React.PureComponent {
    constructor(props) {
        super(props);

        this.container = document.createElement('div');
    }

    getDialogBody() {
        // TODO: Multiple actions w/ spread operator
        switch(this.props.template){
            case 'save':
                return <SaveDialog filename={this.props.dialogData.filename || 'NO NAME'} />
            case 'load':
                return <LoadDialog loadAction={this.props.dialogData.loadAction.bind(this)} closeAction={this.props.closeAction}/>
            default:
                return;
        }
    }

    generateDialogLayout() {
        const dialogButtons = this.props.dialogData.actions.map(act => {
            return <Button key={"act-" + act.label} text={act.label} action={act.func} callback={() => this.props.closeAction()} />
        });

        return (
            <div className="dialog-backdrop">
                <div className={"dialog-box " + this.props.template}>
                    <div className="dialog-closer" onClick={this.props.closeAction}>
                        x
                    </div>
                    <div className="dialog-title">
                        {this.props.dialogData.title}
                    </div> 
                    {this.getDialogBody()}
                    
                    <div className="dialog-buttons">
                        {dialogButtons}
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        document.body.appendChild(this.container);
    }

    componentWillUnmount() {
        document.body.removeChild(this.container);
    }

    render() {
        return ReactDOM.createPortal(
            this.generateDialogLayout(), 
            this.container
        );
    }
}

export default Dialog;